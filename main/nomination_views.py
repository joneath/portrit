from django.shortcuts import render_to_response, get_object_or_404, redirect
from django.http import HttpRequest, HttpResponse, HttpResponseRedirect, HttpResponseForbidden, HttpResponseNotFound
from django.template import RequestContext
from django.core import serializers
from django.utils import simplejson
from django.contrib.auth.decorators import login_required
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.core.exceptions import ObjectDoesNotExist
from django.db.models import Q, Count
from django.core.cache import cache

from main.models import Portrit_User, FB_User, Album, Photo, Nomination, Nomination_Category, Comment, \
                        Notification, Notification_Type
from settings import ENV, FACEBOOK_APP_ID, FACEBOOK_APP_SECRET, NODE_SOCKET, NODE_HOST

from portrit_fb import Portrit_FB
from datetime import datetime
from itertools import chain
import facebook, json, socket, time

def get_trophy_wins(request):
    data = False
    try:
        cookie = facebook.get_user_from_cookie(
            request.COOKIES, FACEBOOK_APP_ID, FACEBOOK_APP_SECRET)
        if cookie:
            data = [ ]
            user_id = request.GET.get('user')
            cat = request.GET.get('cat')
            cat = cat.replace('_', ' ').title()
            if user_id:
                user = FB_User.objects.get(fid=user_id)
                fb_user_id = [user.fid]
                winning_noms = Nomination.objects.select_related().filter(Q(nominatee=user) | Q(tagged_friends__fid__in=fb_user_id), won=True, nomination_category__name=cat).order_by('-current_vote_count', '-created_date')
            else:
                user = FB_User.objects.get(fid=int(cookie["uid"]))
                friends = user.friends.all()
                winning_noms = Nomination.objects.select_related().filter(
                        Q(nominatee__in=friends) |
                        Q(nominatee=user) |
                        Q(nominator=user),
                        won=False,
                        active=True,
                        nomination_category__name=cat).distinct('id').order_by('-current_vote_count', '-created_date')
            for nom in winning_noms.iterator():
                comment_count = nom.get_comment_count()
                votes = [ ]
                for vote in nom.votes.all().iterator():
                    votes.append({
                        'vote_user': vote.fid,
                        'vote_name': vote.get_name(),
                    })
                data.append({
                    'id': nom.id,
                    'active': nom.active,
                    'nomination_category': nom.nomination_category.name,
                    'nominator': nom.nominator.fid,
                    'nominator_name': nom.nominator.get_name(),
                    'nominatee': nom.nominatee.fid,
                    'nominatee_name': nom.nominatee.get_name(),
                    'tagged_users': nom.get_tagged_users(),
                    'won': nom.won,
                    'photo': nom.get_photo(),
                    'caption': nom.caption,
                    'comments': False,
                    'comment_count': comment_count,
                    'vote_count': nom.current_vote_count,
                    'votes': votes,
                })
    except:
        pass
        
    data = simplejson.dumps(data) 
    return HttpResponse(data, mimetype='application/json')
    
def get_recent_winners(request):
    data = False
    per_page = 12
    try:
        cookie = facebook.get_user_from_cookie(
            request.COOKIES, FACEBOOK_APP_ID, FACEBOOK_APP_SECRET)
        if cookie:
            nom_id = request.GET.get('nom_id')
            page = request.GET.get('page')
            if not page:
                page = 1
            else:
                page = int(page)
            
            data = [ ]
            if not nom_id:
                fb_user = FB_User.objects.get(fid=int(cookie["uid"]))
                recent_winners_cache = cache.get(str(fb_user.fid) + '_recent_winners_' + str(page))
                if recent_winners_cache == None:
                    friends = fb_user.friends.all()
                    winning_noms = Nomination.objects.select_related().filter(Q(nominatee__in=friends) | Q(nominatee=fb_user), won=True).order_by('-created_date')[(per_page*(page-1)):(per_page*page)]
                    for nom in winning_noms.iterator():
                        comment_count = nom.get_comment_count()
                        votes = [ ]
                        for vote in nom.votes.all().iterator():
                            votes.append({
                                'vote_user': vote.fid,
                                'vote_name': vote.get_name(),
                            })
                        data.append({
                            'id': nom.id,
                            'active': nom.active,
                            'create_datetime': time.mktime(nom.created_date.utctimetuple()),
                            'nomination_category': nom.nomination_category.name,
                            'nominator': nom.nominator.fid,
                            'nominator_name': nom.nominator.get_name(),
                            'nominatee': nom.nominatee.fid,
                            'nominatee_name': nom.nominatee.get_name(),
                            'tagged_users': nom.get_tagged_users(),
                            'won': nom.won,
                            'photo': nom.get_photo(),
                            'caption': nom.caption,
                            'comments': False,
                            'comment_count': comment_count,
                            'vote_count': nom.current_vote_count,
                            'votes': votes,
                        })
                        cache.set(str(fb_user.fid) + '_recent_winners_' + str(page), data)
                else:
                    data = recent_winners_cache
            else:
                nom = Nomination.objects.get(id=nom_id)
                comment_count = nom.get_comment_count()
                votes = [ ]
                for vote in nom.votes.all().iterator():
                    votes.append({
                        'vote_user': vote.fid,
                        'vote_name': vote.get_name(),
                    })
                data.append({
                    'id': nom.id,
                    'active': nom.active,
                    'nomination_category': nom.nomination_category.name,
                    'nominator': nom.nominator.fid,
                    'nominator_name': nom.nominator.get_name(),
                    'nominatee': nom.nominatee.fid,
                    'nominatee_name': nom.nominatee.get_name(),
                    'tagged_users': nom.get_tagged_users(),
                    'won': nom.won,
                    'photo': nom.get_photo(),
                    'caption': nom.caption,
                    'comments': False,
                    'comment_count': comment_count,
                    'vote_count': nom.current_vote_count,
                    'votes': votes,
                })
    except:
        pass
    
    data = simplejson.dumps(data) 
    return HttpResponse(data, mimetype='application/json')
    
def get_users_active_noms(request):
    data = False
    cookie = facebook.get_user_from_cookie(
        request.COOKIES, FACEBOOK_APP_ID, FACEBOOK_APP_SECRET)
    if cookie:
        fid = request.GET.get('id')
        fb_user = FB_User.objects.get(fid=int(fid))
        fb_user_id = [fb_user.fid]
        active_noms = Nomination.objects.select_related().filter(Q(nominatee=fb_user) | Q(tagged_friends__fid__in=fb_user_id), active=True, won=False).order_by('-current_vote_count')
        data = serialize_noms(active_noms)
        
    data = simplejson.dumps(data) 
    return HttpResponse(data, mimetype='application/json')
    
def new_comment(request):
    data = False
    notification_id = None
    
    cookie = facebook.get_user_from_cookie(
        request.COOKIES, FACEBOOK_APP_ID, FACEBOOK_APP_SECRET)
    if cookie:
        fb_user = FB_User.objects.get(fid=int(cookie["uid"]))
        portrit_user = Portrit_User.objects.get(fb_user=fb_user)
        body = request.POST.get('body')
        nomination_id = request.POST.get('nom_id')
        try:
            comment = Comment(comment=body, owner=fb_user)
            comment.save()
            portrit_user.comment_count += 1
            portrit_user.save()
            nomination = Nomination.objects.get(id=nomination_id)
            nomination.comments.add(comment)
            owner = nomination.nominatee
            try:
                portrit_owner = Portrit_User.objects.get(fb_user=owner)
                nom_owner_name = portrit_owner.name
            except:
                portrit_owner = None
                nom_owner_name = ''
                
            #clear comment cache
            try:
                cache.delete(str(nomination.id) + '_comments')
            except:
                pass
            
            voters = nomination.votes.all()
            all_commentors = FB_User.objects.filter(comment__nomination=nomination).distinct('fid')
            tagged_friends = nomination.tagged_friends.all()
            friends = { }
            # friends = [ ]
            friends[nomination.nominator.fid] = {'fid': nomination.nominator.fid,
                            'allow_notifications': nomination.nominator.get_portrit_user_notification_permission()}

            friends[owner.fid] = {'fid': owner.fid,
                            'allow_notifications': owner.get_portrit_user_notification_permission()}
                            
            #Attach target user
            for friend in all_commentors.iterator():
                if friend.fid != fb_user.fid:
                    if friend.fid != nomination.nominator.fid:
                        friends[friend.fid] = {'fid': friend.fid,
                                                'allow_notifications': friend.get_portrit_user_notification_permission()}
                
            for friend in voters.iterator():
                if friend.fid != fb_user.fid:
                    if friend.fid != nomination.nominator.fid:
                        friends[friend.fid] = {'fid': friend.fid,
                                                'allow_notifications': friend.get_portrit_user_notification_permission()}
                                                
            for friend in tagged_friends.iterator():
                if friend.fid != fb_user.fid:
                    if friend.fid != nomination.nominator.fid:
                        friends[friend.fid] = {'fid': friend.fid,
                                                'allow_notifications': friend.get_portrit_user_notification_permission()}                              
            
            for friend in friends:
                friend = friends[friend]
                if friend['fid'] != fb_user.fid:
                    notification_type = Notification_Type.objects.get(name="new_comment")
                    notification = Notification(source=fb_user, destination=owner, nomination=nomination, notification_type=notification_type)
                    notification.save()
                    friend['notification_id'] = notification.id
                    try:
                        Portrit_User.objects.get(fb_user__fid=friend['fid']).notifications.add(notification)
                    except:
                        pass
                        
            friends_to_update = { }
            target_friends = get_target_friends(owner, fb_user)
            for friend in target_friends:
                friends_to_update[friend] = {'fid': friend,
                                        'allow_notifications': False}
            
            node_data = {
                'method': 'new_comment',
                'secondary_method': 'new_comment_update',
                'payload': {
                    'id': nomination.id,
                    'comment': comment.comment,
                    'comment_id': comment.id,
                    'create_datetime': time.mktime(comment.created_date.utctimetuple()),
                    'comment_sender_id': fb_user.fid,
                    'comment_sender_name': portrit_user.name,
                    'nomination_category': nomination.nomination_category.name,
                    'nom_owner_id': owner.fid,
                    'nom_owner_name': nom_owner_name,
                    'won': nomination.won,
                    'friends': friends,
                    'friends_to_update': friends_to_update,
                }
            }
            
            node_comment_notification_data = json.dumps(node_data)
            try:
                sock = socket.socket(
                    socket.AF_INET, socket.SOCK_STREAM)
                sock.connect((NODE_HOST, NODE_SOCKET))
                sock.send(node_comment_notification_data)
                sock.close()
            except:
                pass
            
            #Update nom comments caches
            try:
                target_friends = get_target_friends(owner, fb_user)
                for friend in target_friends:
                    friend_recent_nom_cache = cache.get(str(friend) + '_recent_stream')
                    user_top_stream = cache.get(str(friend) + '_user_top_stream')
                    try:
                        if friend_recent_nom_cache != None:
                            for nom in friend_recent_nom_cache:
                                if nom['id'] == nomination.id:
                                    nom['quick_comments'] = nomination.get_quick_comments()
                                
                            cache.set(str(friend) + '_recent_stream', friend_recent_nom_cache)
                    except:
                        pass
                    
                    try:
                        if user_top_stream != None:
                            for nom_cat in user_top_stream:
                                for nom in nom_cat['noms']:
                                    if nom['id'] == nomination.id:
                                        nom['comment_count'] = nomination.get_comments()['count']
                                    
                            cache.set(str(friend) + '_user_top_stream', user_top_stream)
                    except:
                        pass
            except:
                pass
            data = True
        except:
            pass
    
    data = simplejson.dumps(data) 
    return HttpResponse(data, mimetype='application/json')
    
def get_nom_comments(request):
    data = False
    nom_id = request.GET.get('nom_id')
    comment_cache = cache.get(str(nom_id) + '_comments')
    if comment_cache == None:
        try:
            nomination = Nomination.objects.get(id=nom_id)
            comments = nomination.get_comments()['comments']
            data = comments
            cache.set(str(nom_id) + '_comments', data)
        except:
            pass
    else:
        data = comment_cache
      
    data = simplejson.dumps(data) 
    return HttpResponse(data, mimetype='application/json')
    
def get_nom_votes(request):
    data = False
    nom_id = request.GET.get('nom_id')
    vote_cache = cache.get(str(nom_id) + '_votes')
    if vote_cache == None:
        try:
            nomination = Nomination.objects.get(id=nom_id)
            votes = [ ]
            for vote in nomination.votes.all().iterator():
                votes.append({
                    'vote_user': vote.fid,
                    'vote_name': vote.get_name(),
                })
            data = votes
            cache.set(str(nom_id) + '_votes', data)
        except:
            pass
    else:
        data = vote_cache
      
    data = simplejson.dumps(data) 
    return HttpResponse(data, mimetype='application/json')
    
def nominate_photo(request):
    data = False
    cookie = facebook.get_user_from_cookie(
        request.COOKIES, FACEBOOK_APP_ID, FACEBOOK_APP_SECRET)
    if cookie:
        fb_user = FB_User.objects.get(fid=int(cookie["uid"]))
        album_id = request.POST.get('album_id')
        photo_id = request.POST.get('photo_id')
        portrit_photo_id = request.POST.get('portrit_photo_id')
        photo_src = request.POST.get('photo_src')
        photo_src_small = request.POST.get('photo_src_small')
        photo_small_height = request.POST.get('photo_small_height')
        photo_small_width = request.POST.get('photo_small_width')
        photo_width = request.POST.get('photo_width')
        photo_height = request.POST.get('photo_height')
        owner = request.POST.get('owner')
        nominations = request.POST.get('nominations').split(',')
        tags = request.POST.get('tags').split(',')
        comment_text = request.POST.get('comment_text')
        
        try:
            if portrit_photo_id:
                photo, created = Photo.objects.get_or_create(id=portrit_photo_id)
            else:
                photo, created = Photo.objects.get_or_create(fid=photo_id)
                if album_id !='tagged':
                    album, created = Album.objects.get_or_create(fid=album_id)
            
            if not portrit_photo_id:
                photo.fb_source = photo_src
                photo.fb_source_small = photo_src_small
                photo.small_height = photo_small_height
                photo.small_width = photo_small_width
                photo.height = photo_height
                photo.width = photo_width
                if album_id !='tagged':
                    photo.album = album
                photo.save()
            
            photo_data = { }
            photo_data['fid'] = photo.fid
            photo_data['src'] = photo.fb_source
            photo_data['src_small'] = photo.fb_source_small
            photo_data['small_height'] = photo.small_height
            photo_data['small_width'] = photo.small_width
            photo_data['height'] = photo.height
            photo_data['width'] = photo.width
            photo_data['album_fid'] = photo.get_album_fid()
            
            nominator_portrit_user = Portrit_User.objects.get(fb_user=fb_user)
            try:
                if owner == 'me':
                    try:
                        owner_fb_user = fb_user
                        nominator_portrit_user.given_nomination_count += 1
                        nominator_portrit_user.recieved_nomination_count += 1
                        nominator_portrit_user.selfish_nomination_count += 1
                    except:
                        pass
                else:
                    try:
                        owner_fb_user = FB_User.objects.get(fid=owner)
                        try:
                            nominatee_portrit_user = Portrit_User.objects.get(fb_user=owner_fb_user)
                            nominatee_portrit_user.recieved_nomination_count += 1
                            nominatee_portrit_user.save()
                        except:
                            pass
                            
                        nominator_portrit_user.given_nomination_count += 1
                    except:
                        pass
                
                nominator_portrit_user.save()
            except:
                pass
                
            nom_data = [ ]
            notification_type = Notification_Type.objects.get(name="new_nom")
            tagged_notification = Notification_Type.objects.get(name="tagged_nom")
            tagged_user_list = [ ]
            for nomination in nominations:
                if nomination != '':
                    nom_cat = Nomination_Category.objects.get(name=nomination)
                    nomination = Nomination(nomination_category=nom_cat)
                    if comment_text != "":
                        nomination.caption = comment_text
                    nomination.nominatee = owner_fb_user
                    nomination.nominator = fb_user    
                    nomination.save()
                    
                    try:
                        for tag in tags:
                            if tag != '':
                                tagged_user_list.append(int(tag))
                                tagged_user = FB_User.objects.get(fid=int(tag))
                                tagged_user.active_nominations.add(nomination)
                                nomination.tagged_friends.add(tagged_user)
                                
                                try:
                                    notification = Notification(source=fb_user, destination=tagged_user, nomination=nomination, notification_type=tagged_notification)
                                    notification.save()
                                    tagged_portrit_user = tagged_user.get_portrit_user()
                                    tagged_portrit_user.notifications.add(notification)
                                except:
                                    pass
                    except:
                        pass
                        
                    nomination.votes.add(fb_user)
                    comments = nomination.get_comments()
                    comment_count = comments['count']
                    # comments = comments['comments']
                    photo.nominations.add(nomination)
                    fb_user.active_nominations.add(nomination)
                    #Create notification record
                    notification = Notification(source=fb_user, destination=owner_fb_user, nomination=nomination, notification_type=notification_type)
                    notification.save()
                    
                    try:
                        portrit_user = Portrit_User.objects.get(fb_user=owner_fb_user)
                        portrit_user.notifications.add(notification)
                    except:
                        pass
                    
                    nominator_name = None
                    nominatee_name = None
                    try:
                        nominator_name = nomination.nominator.get_name()
                    except:
                        pass
                    try:
                        nominatee_name = nomination.nominatee.get_name()
                    except:
                        pass
                    
                    nom_data.append({
                        'id': nomination.id,
                        'active': nomination.active,
                        'nomination_category': nom_cat.name,
                        'nominator': nomination.nominator.fid,
                        'nominator_name': nominator_name,
                        'nominatee': nomination.nominatee.fid,
                        'nominatee_name': nominatee_name,
                        'tagged_users': nomination.get_tagged_users(),
                        'won': nomination.won,
                        'created_time': time.mktime(nomination.created_date.utctimetuple()),
                        'caption': comment_text,
                        'comments': False, #comments,
                        'comment_count': comment_count,
                        'photo': photo_data,
                        'vote_count': nomination.current_vote_count,
                        'votes': [{
                            'vote_user': fb_user.fid,
                            'vote_name': fb_user.get_name(), #Portrit_User.objects.get(fb_user=fb_user).name,
                        },],
                        'notification_id': notification.id,
                    })
                    
            #Send update notification to event handlers
            tagged_user_list = list(set(tagged_user_list))
            target_friends = get_target_friends(owner_fb_user, fb_user)
            friends = { }
            for tagged_user in tagged_user_list:
                target_friends.append(tagged_user)
                
            target_friends = list(set(target_friends))
            for friend in target_friends:
                try:
                    friend = FB_User.objects.get(fid=friend)
                    friends[friend.fid] = {'fid': friend.fid,
                                    'allow_notifications': friend.get_portrit_user_notification_permission()}
                except:
                    friends = { }
                    
                try:
                    recent_nom_cache = cache.get(str(friend.fid) + '_recent_stream')
                    user_top_stream = cache.get(str(friend.fid) + '_user_top_stream')
                    if recent_nom_cache != None:
                        for nom in nom_data:
                            nom['quick_comments'] = [ ]
                            recent_nom_cache.insert(0, nom)
                        recent_nom_cache = recent_nom_cache[:10]
                        cache.set(str(friend.fid) + '_recent_stream', recent_nom_cache, 60*5)
                    if user_top_stream != None:
                        try:
                            cache.delete(str(friend.fid) + '_user_top_stream')
                        except:
                            pass
                except:
                    pass
        
            node_data = {
                'method': 'new_nom',
                'payload': {
                    'nom_data': nom_data,
                    'friends': friends,
                }
            }
            
            node_data = json.dumps(node_data)
            try:
                sock = socket.socket(
                    socket.AF_INET, socket.SOCK_STREAM)
                sock.connect((NODE_HOST, NODE_SOCKET))
                sock.send(node_data)
                sock.close()
            except:
                pass
        
            data = nom_data
        except:
            pass
    
    data = simplejson.dumps(data) 
    return HttpResponse(data, mimetype='application/json')
    
def reactivate_nom(request):
    data = False
    try:
        cookie = facebook.get_user_from_cookie(
            request.COOKIES, FACEBOOK_APP_ID, FACEBOOK_APP_SECRET)
        if cookie:
            nom_id = request.POST.get('nom_id')
            comment_text = request.POST.get('comment_text')
            tags = request.POST.get('tags').split(',')
            nominations = request.POST.get('nominations').split(',')
            del nominations[-1]
            owner = FB_User.objects.get(fid=int(cookie["uid"]))
            
            orig_nomination = Nomination.objects.get(id=nom_id)
            nom_count = 0
            photo = None
            photo_data = { }
            nom_data = [ ]
            caption_text = ''
            nominatee = None
            notification_type = Notification_Type.objects.get(name="new_nom")
            tagged_notification = Notification_Type.objects.get(name="tagged_nom")
            tagged_user_list = [ ]
            for nomination in nominations:
                nom_cat = Nomination_Category.objects.get(name=nomination)
                if comment_text != '':
                    caption_text = comment_text
                else:
                    caption_text = ''
                    
                if nom_count == 0:
                    nomination = orig_nomination
                    nominatee = nomination.nominatee
                    nomination.nomination_category = nom_cat
                    nomination.nominator = owner
                    nomination.caption = caption_text
                    nomination.votes.clear()
                    nomination.tagged_friends.clear()
                    nomination.votes.add(owner)
                    nomination.current_vote_count = 1
                    nomination.up_votes = 1
                    nomination.down_votes = 0
                    nomination.active = True
                    nomination.created_date = datetime.now()
                    nomination.save()
                    
                    try:
                        for tag in tags:
                            if tag != '':
                                tagged_user_list.append(tag)
                                tagged_user = FB_User.objects.get(fid=int(tag))
                                tagged_user.active_nominations.add(nomination)
                                nomination.tagged_friends.add(tagged_user)
                                
                                try:
                                    notification = Notification(source=fb_user, destination=tagged_user, nomination=nomination, notification_type=tagged_notification)
                                    notification.save()
                                    tagged_portrit_user = tagged_user.get_portrit_user()
                                    tagged_portrit_user.notifications.add(notification)
                                except:
                                    pass
                    except:
                        pass
                    
                    photo = nomination.photo_set.filter(active=True)[0]
                    photo_data = nomination.get_photo()
                    owner.active_nominations.add(nomination)
                    
                    notification = Notification(source=owner, destination=nominatee, nomination=nomination, notification_type=notification_type)
                    notification.save()
                else:
                    nomination = Nomination(nomination_category=nom_cat)
                    nomination.caption = comment_text
                    nomination.nominatee = nominatee
                    nomination.nominator = owner
                    nomination.current_vote_count = 1
                    nomination.save()
                    nomination.votes.add(owner)
                    
                    try:
                        for tag in tags:
                            if tag != '':
                                tagged_user_list.append(tag)
                                tagged_user = FB_User.objects.get(fid=int(tag))
                                tagged_user.active_nominations.add(nomination)
                                nomination.tagged_friends.add(tagged_user)
                                
                                try:
                                    notification = Notification(source=fb_user, destination=tagged_user, nomination=nomination, notification_type=tagged_notification)
                                    notification.save()
                                    tagged_portrit_user = tagged_user.get_portrit_user()
                                    tagged_portrit_user.notifications.add(notification)
                                except:
                                    pass
                    except:
                        pass
                    
                    photo.nominations.add(nomination)
                    owner.active_nominations.add(nomination)
                    #Create notification record
                    notification = Notification(source=owner, destination=nominatee, nomination=nomination, notification_type=notification_type)
                    notification.save()
                    
                    try:
                        portrit_user = Portrit_User.objects.get(fb_user=nominatee)
                        portrit_user.notifications.add(notification)
                    except:
                        pass
                    
                nominator_name = None
                nominatee_name = None
                try:
                    nominator_name = nomination.nominator.get_name()
                except:
                    pass
                try:
                    nominatee_name = nomination.nominatee.get_name()
                except:
                    pass
                
                nom_data.append({
                    'id': nomination.id,
                    'active': nomination.active,
                    'nomination_category': nom_cat.name,
                    'nominator': nomination.nominator.fid,
                    'nominator_name': nominator_name,
                    'nominatee': nomination.nominatee.fid,
                    'nominatee_name': nominatee_name,
                    'won': nomination.won,
                    'created_time': time.mktime(nomination.created_date.utctimetuple()),
                    'caption': caption_text,
                    'comments': False,
                    'comment_count': 0,
                    'photo': photo_data,
                    'vote_count': nomination.current_vote_count,
                    'votes': [{
                        'vote_user': owner.fid,
                        'vote_name': owner.get_name(), #Portrit_User.objects.get(fb_user=fb_user).name,
                    },],
                    'tagged_users': nomination.get_tagged_users(),
                    'notification_id': notification.id,
                })
                
                nom_count += 1
            
            
            tagged_user_list = list(set(tagged_user_list))
            target_friends = get_target_friends(nominatee, owner)
            friends = { }
            
            for tagged_user in tagged_user_list:
                target_friends.append(tagged_user)

            target_friends = list(set(target_friends))
            for friend in target_friends:
                try:
                    friend = FB_User.objects.get(fid=friend)
                    friends[friend.fid] = {'fid': friend.fid,
                                    'allow_notifications': friend.get_portrit_user_notification_permission()}
                except:
                    friends = { }

                try:
                    recent_nom_cache = cache.get(str(friend.fid) + '_recent_stream')
                    user_top_stream = cache.get(str(friend.fid) + '_user_top_stream')
                    if recent_nom_cache != None:
                        for nom in nom_data:
                            nom['quick_comments'] = [ ]
                            recent_nom_cache.insert(0, nom)
                        recent_nom_cache = recent_nom_cache[:10]
                        cache.set(str(friend.fid) + '_recent_stream', recent_nom_cache, 60*5)
                    if user_top_stream != None:
                        try:
                            cache.delete(str(friend.fid) + '_user_top_stream')
                        except:
                            pass
                except:
                    pass

            node_data = {
                'method': 'new_nom',
                'payload': {
                    'nom_data': nom_data,
                    'friends': friends,
                }
            }

            node_data = json.dumps(node_data)
            try:
                sock = socket.socket(
                    socket.AF_INET, socket.SOCK_STREAM)
                sock.connect((NODE_HOST, NODE_SOCKET))
                sock.send(node_data)
                sock.close()
            except:
                pass

            data = nom_data
    except:
        pass
        
    data = simplejson.dumps(data) 
    return HttpResponse(data, mimetype='application/json')
    
def get_user_album_nom_data(request):
    data = False
    user_id = request.GET.get('user')
    
    try:
        cookie = facebook.get_user_from_cookie(
            request.COOKIES, FACEBOOK_APP_ID, FACEBOOK_APP_SECRET)
        if cookie:
            owner = FB_User.objects.get(fid=int(cookie["uid"]))
            user = FB_User.objects.get(fid=user_id)
            fb_user_id = [user.fid]
            winning_nominations = Nomination.objects.select_related().filter(Q(nominatee=user) | Q(tagged_friends__fid__in=fb_user_id), won=True).order_by('-created_date')
            active_nominations = Nomination.objects.select_related().filter(Q(nominatee=user) | Q(tagged_friends__fid__in=fb_user_id), won=False, active=True).order_by('-current_vote_count')
            try:
                portrit_user = user.get_portrit_user()
                portrit_album = portrit_user.get_portrit_album()
                portrit_album_data = {
                    'album_name': portrit_album.name,
                    'photos': [ ]
                }
                for photo in portrit_album.photo_set.filter(active=True, pending=False):
                    portrit_album_data['photos'].append(photo.get_portrit_photo())
            except:
                portrit_album_data = { }
            winning_nom_objs = [ ]
            active_nom_objs = [ ]
        
            for nom in winning_nominations.iterator():
                try:
                    winning_nom_objs.append({'id': nom.id, 
                                            'vote_count': nom.current_vote_count,
                                            'nomination_category': nom.nomination_category.name,
                                            'photo': nom.get_photo()})
                except:
                    pass
            
            for nom in active_nominations.iterator():
                try:
                    active_nom_objs.append({'id': nom.id, 
                                            'vote_count': nom.current_vote_count,
                                            'comment_count': nom.get_comment_count(),
                                            'nomination_category': nom.nomination_category.name,
                                            'photo': nom.get_photo()})
                except:
                    pass
            
            data = {
                'winning_nom_objs': winning_nom_objs,
                'active_nom_objs': active_nom_objs,
                'portrit_album_data': portrit_album_data,
            }
    except:
        pass
    
    data = simplejson.dumps(data)
    return HttpResponse(data, mimetype='application/json')
    
def vote_on_nomination(request):
    data = False
    
    direction = request.POST.get('method')
    nomination_id = request.POST.get('nomination_id')
    
    cookie = facebook.get_user_from_cookie(
        request.COOKIES, FACEBOOK_APP_ID, FACEBOOK_APP_SECRET)
    if cookie:
        owner = FB_User.objects.get(fid=int(cookie["uid"]))
        nomination = Nomination.objects.get(id=nomination_id)
        if nomination.votes.filter(fid=owner.fid).count() == 0 and nomination.active:
            if direction == 'up':
                nomination.up_votes += 1
                nomination.update_current_vote_count()
                nomination.save()
            elif direction == 'down':
                nomination.down_votes += 1
                nomination.update_current_vote_count()
                nomination.save()
            
            nomination.votes.add(owner)
        
            nominatee = FB_User.objects.get(fid=str(nomination.nominatee))
            try:
                owner_portrit_user = Portrit_User.objects.get(fb_user=owner)
                owner_portrit_user.vote_count += 1
                owner_portrit_user.save()
            except:
                pass
        
            portrit_user = owner.portrit_fb_user.all()[0]
            target_friends = get_target_friends(nominatee, owner)
            friends = { }
            for friend in target_friends:
                try:
                    friend = FB_User.objects.get(fid=friend)
                    friends[friend.fid] = {'fid': friend.fid,
                                    'allow_notifications': friend.get_portrit_user_notification_permission()}
                except:
                    friends = { }
        
            node_data = {
                'method': 'vote',
                'payload': {
                    'nom_id': nomination.id,
                    'nominatee': nomination.nominatee.fid,
                    'nomination_category': nomination.nomination_category.name,
                    'vote_count': nomination.current_vote_count,
                    'vote_user': owner.fid,
                    'vote_name': portrit_user.name,
                    'friends': friends,
                }
            }
        
            node_data = json.dumps(node_data)
            try:
                sock = socket.socket(
                    socket.AF_INET, socket.SOCK_STREAM)
                sock.connect((NODE_HOST, NODE_SOCKET))
                sock.send(node_data)
                sock.close()
            except:
                pass
        
            data = {'vote_count': nomination.current_vote_count,
                    'nominatee': nomination.nominatee.fid,}
                
            #Update nom vote caches
            try:
                for friend in target_friends:
                    friend_recent_nom_cache = cache.get(str(friend) + '_recent_stream')
                    user_top_stream = cache.get(str(friend) + '_user_top_stream')
                    try:
                        if friend_recent_nom_cache != None:
                            for nom in friend_recent_nom_cache:
                                if nom['id'] == nomination.id:
                                    nom['vote_count'] = nomination.current_vote_count,
                                    nom['votes'].append({'vote_user': owner.fid,
                                                            'vote_name': portrit_user.name})

                            cache.set(str(friend) + '_recent_stream', friend_recent_nom_cache)
                    except:
                        pass

                    try:
                        if user_top_stream != None:
                            for nom_cat in user_top_stream:
                                for nom in nom_cat['noms']:
                                    if nom['id'] == nomination.id:
                                        nom['vote_count'] = nomination.current_vote_count,
                                        nom['votes'].append({'vote_user': owner.fid,
                                                                'vote_name': portrit_user.name})

                            cache.set(str(friend) + '_user_top_stream', user_top_stream)
                    except:
                        pass
            except:
                pass
    
    data = simplejson.dumps(data)
    return HttpResponse(data, mimetype='application/json')
    
def init_recent_stream(request):
    data = False
    try:
        cookie = facebook.get_user_from_cookie(
            request.COOKIES, FACEBOOK_APP_ID, FACEBOOK_APP_SECRET)
        if cookie:
            page_size = request.GET.get('page_size')
            owner = FB_User.objects.get(fid=int(cookie["uid"]))
            recent_stream = get_recent_stream(owner, None, page_size)
            top_stream = get_top_stream(owner)
            top_users = get_top_users(owner)
            data = {
                'recent': recent_stream,
                'top': top_stream,
                'top_users': top_users,
            }
    except:
        pass
        
    data = simplejson.dumps(data)
    return HttpResponse(data, mimetype='application/json')
    
def get_recent_stream(fb_user, created_date=None, page_size=10):
    data = [ ]
    PAGE_SIZE = int(page_size)
    try:
        friends = fb_user.friends.all()
        user_recent_stream = cache.get(str(fb_user.fid) + '_recent_stream')
        if user_recent_stream == None or created_date:
            if created_date:
                nominations = Nomination.objects.select_related().filter(
                    Q(nominatee__in=friends) |
                    Q(nominatee=fb_user) |
                    Q(nominator=fb_user),
                    created_date__lt=created_date, won=False).distinct('id').order_by('-created_date')[:PAGE_SIZE]
            else:
                nominations = Nomination.objects.select_related().filter(
                    Q(nominatee__in=friends) |
                    Q(nominatee=fb_user) |
                    Q(nominator=fb_user),
                    won=False).distinct('id').order_by('-created_date')[:PAGE_SIZE]
            for nom in nominations.iterator():
                comment_count = nom.get_comment_count()
                quick_comments = nom.get_quick_comments()
                more_comments = False
                if len(quick_comments) != comment_count:
                    more_comments = True
                votes = [ ]
                for vote in nom.votes.all().iterator():
                    try:
                        votes.append({
                            'vote_user': vote.fid,
                            'vote_name': vote.get_name(),
                        })
                    except:
                        pass
                try:
                    data.append({
                        'id': nom.id,
                        'active': nom.active,
                        'nomination_category': nom.nomination_category.name,
                        'nominator': nom.nominator.fid,
                        'nominator_name': nom.nominator.get_name(),
                        'nominatee': nom.nominatee.fid,
                        'nominatee_name': nom.nominatee.get_name(),
                        'tagged_users': nom.get_tagged_users(),
                        'won': nom.won,
                        'created_time': time.mktime(nom.created_date.utctimetuple()),
                        'photo': nom.get_photo(),
                        'caption': nom.caption,
                        'comments': False,
                        'quick_comments': quick_comments,
                        'more_comments': more_comments,
                        'comment_count': comment_count,
                        'vote_count': nom.current_vote_count,
                        'votes': votes,
                    })
                except:
                    pass
            if not created_date:        
                cache.set(str(fb_user.fid) + '_recent_stream', data, 60*5)
        else:
            data = user_recent_stream[:PAGE_SIZE]
        if data.count() == 0 or data[0].active == False:
            data = "empty"
    except:
        pass
        
    return data
    
def get_top_stream(fb_user):
    data = [ ]
    PAGE_SIZE = 5
    top_steam_cache = cache.get(str(fb_user.fid) + '_top_current_noms')
    try:
        if top_steam_cache == None:
            friends = fb_user.friends.all()
            nominations = Nomination.objects.select_related().filter(
                Q(nominatee__in=friends) |
                Q(nominatee=fb_user) |
                Q(nominator=fb_user),
                active=True, won=False).distinct('id').order_by('-current_vote_count')[:PAGE_SIZE]
            
            for nom in nominations.iterator():
                comment_count = nom.get_comment_count()
                votes = [ ]
                for vote in nom.votes.all().iterator():
                    votes.append({
                        'vote_user': vote.fid,
                        'vote_name': vote.get_name(),
                    })
                data.append({
                    'id': nom.id,
                    'active': nom.active,
                    'nomination_category': nom.nomination_category.name,
                    'nominator': nom.nominator.fid,
                    'nominator_name': nom.nominator.get_name(),
                    'nominatee': nom.nominatee.fid,
                    'nominatee_name': nom.nominatee.get_name(),
                    'tagged_users': nom.get_tagged_users(),
                    'won': nom.won,
                    'time_remaining': nom.get_time_remaining(),
                    'created_time': time.mktime(nom.created_date.utctimetuple()),
                    'photo': nom.get_photo(),
                    'caption': nom.caption,
                    'comments': False,
                    'comment_count': comment_count,
                    'vote_count': nom.current_vote_count,
                    'votes': votes,
                })
            cache.set(str(fb_user.fid) + '_top_current_noms', data, 60*5)
        else:
            data = top_steam_cache
        if data.count() == 0:
            data = "empty"
    except:
        pass
        
    return data
    
def get_top_users(fb_user):
    data = [ ]
    try:
        user_top_cache = cache.get(str(fb_user.fid) + '_top_users')
        if user_top_cache == None:
            friends = fb_user.friends.all()
            friends = FB_User.objects.select_related().filter(Q(id=fb_user.id) | Q(id__in=friends)).annotate(num_wins=Count('winning_noms')).filter(num_wins__gt=0).order_by('-num_wins')[:10]
            for friend in friends:
                data.append({
                    'fid': friend.fid,
                    'noms_won': friend.winning_noms.all().count(),
                    'top_nom_cat': friend.winning_noms.all().annotate(noms_cat_count=Count('nomination_category')).order_by('-noms_cat_count')[0].nomination_category.name,
                })
            cache.set(str(fb_user.fid) + '_top_users', data)
        else:
            data = user_top_cache
    except:
        pass
    return data
    
def get_target_friends(fb_user, current_user):
    target_friends_cache = cache.get(str(fb_user.id) + '_target_friends')
    if target_friends_cache == None:
        target_friends = Portrit_User.objects.filter(fb_user__friends=fb_user)
        friends = [ ]
        #Attach target user
        friends.append(fb_user.fid)
        for friend in target_friends.iterator():
            friends.append(friend.fb_user.fid)
            
        cache.set(str(fb_user.id) + '_target_friends', friends)
    else:
        friends = target_friends_cache
        
    return friends
    
def serialize_noms(noms):
    data = [ ]
    for nom in noms.iterator():
        comment_count = nom.get_comment_count()
        votes = [ ]
        for vote in nom.votes.all().iterator():
            votes.append({
                'vote_user': vote.fid,
                'vote_name': vote.get_name(),
            })
        data.append({
            'id': nom.id,
            'active': nom.active,
            'nomination_category': nom.nomination_category.name,
            'nominator': nom.nominator.fid,
            'nominator_name': nom.nominator.get_name(),
            'nominatee': nom.nominatee.fid,
            'nominatee_name': nom.nominatee.get_name(),
            'tagged_users': nom.get_tagged_users(),
            'won': nom.won,
            'photo': nom.get_photo(),
            'caption': nom.caption,
            'comments': False,
            'comment_count': comment_count,
            'vote_count': nom.current_vote_count,
            'votes': votes,
        })
        
    return data
    