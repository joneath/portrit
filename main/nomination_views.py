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

from main.models import Portrit_User, FB_User, Album, Photo, Nomination, Nomination_Category, Comment, \
                        Notification, Notification_Type
from settings import ENV, FACEBOOK_APP_ID, FACEBOOK_APP_SECRET, NODE_SOCKET

from portrit_fb import Portrit_FB

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
            user = FB_User.objects.get(fid=user_id)
            winning_noms = Nomination.objects.filter(won=True, nominatee=user, nomination_category__name=cat).order_by('-current_vote_count')
            for nom in winning_noms.iterator():
                comment_count = nom.get_comment_count()
                votes = [ ]
                for vote in nom.votes.all().iterator():
                    votes.append({
                        'vote_user': vote.fid,
                        'vote_name': vote.portrit_fb_user.all()[0].name,
                    })
                data.append({
                    'id': nom.id,
                    'nomination_category': nom.nomination_category.name,
                    'nominator': nom.nominator.fid,
                    'nominator_name': nom.nominator.get_name(),
                    'nominatee': nom.nominatee.fid,
                    'nominatee_name': nom.nominatee.get_name(),
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
            
            data = [ ]
            if not nom_id:
                fb_user = FB_User.objects.get(fid=int(cookie["uid"]))
                friends = fb_user.friends.all()
                winning_noms = Nomination.objects.filter(nominatee__in=friends, won=True).order_by('-created_date')[(per_page*(page-1)):(per_page*page)]
                for nom in winning_noms.iterator():
                    comment_count = nom.get_comment_count()
                    votes = [ ]
                    for vote in nom.votes.all().iterator():
                        votes.append({
                            'vote_user': vote.fid,
                            'vote_name': vote.portrit_fb_user.all()[0].name,
                        })
                    data.append({
                        'id': nom.id,
                        'nomination_category': nom.nomination_category.name,
                        'nominator': nom.nominator.fid,
                        'nominator_name': nom.nominator.get_name(),
                        'nominatee': nom.nominatee.fid,
                        'nominatee_name': nom.nominatee.get_name(),
                        'won': nom.won,
                        'photo': nom.get_photo(),
                        'caption': nom.caption,
                        'comments': False,
                        'comment_count': comment_count,
                        'vote_count': nom.current_vote_count,
                        'votes': votes,
                    })
            else:
                nom = Nomination.objects.get(id=nom_id)
                comment_count = nom.get_comment_count()
                votes = [ ]
                for vote in nom.votes.all().iterator():
                    votes.append({
                        'vote_user': vote.fid,
                        'vote_name': vote.portrit_fb_user.all()[0].name,
                    })
                data.append({
                    'id': nom.id,
                    'nomination_category': nom.nomination_category.name,
                    'nominator': nom.nominator.fid,
                    'nominator_name': nom.nominator.get_name(),
                    'nominatee': nom.nominatee.fid,
                    'nominatee_name': nom.nominatee.get_name(),
                    'won': nom.won,
                    'photo': nom.get_photo(),
                    'caption': nom.caption,
                    'comments': False,
                    'comment_count': comment_count,
                    'vote_count': nom.current_vote_count,
                    'votes': votes,
                })
            
            # nom_cats = Nomination_Category.objects.all()
            # data = [ ]
            # cat_count = 0
            # for cat in nom_cats.iterator():
            #     try:
            #         data.append({
            #             'cat_name': cat.name,
            #             'noms': [ ],
            #         })
            #         
            #         top_noms = cat.nomination_set.filter(
            #             Q(nominatee__in=friends) |
            #             Q(nominatee=fb_user) |
            #             Q(nominator=fb_user),
            #             active=True, won=True).distinct('id').order_by('-current_vote_count')
            #         for nom in top_noms.iterator():
            #             comment_count = nom.get_comment_count()
            #             votes = [ ]
            #             for vote in nom.votes.all().iterator():
            #                 votes.append({
            #                     'vote_user': vote.fid,
            #                     'vote_name': vote.portrit_fb_user.all()[0].name,
            #                 })
            #             data[cat_count]['noms'].append({
            #                 'id': nom.id,
            #                 'nomination_category': nom.nomination_category.name,
            #                 'nominator': nom.nominator.fid,
            #                 'nominator_name': nom.nominator.portrit_fb_user.all()[0].name,
            #                 'nominatee': nom.nominatee.fid,
            #                 'nominatee_name': nom.nominatee.portrit_fb_user.all()[0].name,
            #                 'won': nom.won,
            #                 'time_remaining': nom.get_time_remaining(),
            #                 'photo': nom.get_photo(),
            #                 'caption': nom.caption,
            #                 'comments': False,
            #                 'comment_count': comment_count,
            #                 'vote_count': nom.current_vote_count,
            #                 'votes': votes,
            #             })
            #         cat_count += 1
            #     except:
            #         top_nom = None
            # data = sorted(data, key=lambda k: len(k['noms']), reverse=True)
            # if data.count() == 0:
            #     data = "empty"
    except:
        pass
    
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
            
            voters = nomination.votes.all()
            all_commentors = FB_User.objects.filter(Q(comment__nomination=nomination) | Q(nomination__votes__isnull=False)).distinct('fid')
            friends = [ ]
            # if fb_user.fid != nomination.nominator.fid:
            friends.append(nomination.nominator.fid)
            # if owner.fid != fb_user.fid:
            friends.append(owner.fid)
            #Attach target user
            for friend in all_commentors.iterator():
                if friend.fid != fb_user.fid:
                    if friend.fid != nomination.nominator.fid:
                        friends.append(friend.fid)
                        
                    notification_type = Notification_Type.objects.get(name="new_comment")
                    notification = Notification(source=fb_user, nomination=nomination, notification_type=notification_type)
                    notification.save()
                    Portrit_User.objects.get(fb_user=friend).notifications.add(notification)
            
            friends = list(set(friends))
            
            #Create notification record
            # if portrit_owner and owner.fid != fb_user.fid:
            #     notification_type = Notification_Type.objects.get(name="new_comment")
            #     notification = Notification(source=fb_user, nomination=nomination, notification_type=notification_type)
            #     notification.save()
            #     notification_id = notification.id
            #     portrit_owner.notifications.add(notification)
            
            node_data = {
                'method': 'new_comment',
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
                    'notification_id': notification_id,
                }
            }
            node_data = json.dumps(node_data)
            sock = socket.socket(
                socket.AF_INET, socket.SOCK_STREAM)
            sock.connect(('localhost', NODE_SOCKET))
            sock.send(node_data)
            sock.close()
            
            data = node_data
        except:
            pass
    
    data = simplejson.dumps(data) 
    return HttpResponse(data, mimetype='application/json')
    
def get_nom_comments(request):
    data = False
    nom_id = request.GET.get('nom_id')
    
    try:
        nomination = Nomination.objects.get(id=nom_id)
        comments = nomination.get_comments()['comments']
        data = comments
    except:
        pass
      
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
        photo_src = request.POST.get('photo_src')
        photo_src_small = request.POST.get('photo_src_small')
        photo_small_height = request.POST.get('photo_small_height')
        photo_small_width = request.POST.get('photo_small_width')
        photo_width = request.POST.get('photo_width')
        photo_height = request.POST.get('photo_height')
        owner = request.POST.get('owner')
        nominations = request.POST.get('nominations').split(',')
        comment_text = request.POST.get('comment_text')
        
        try:
            photo, created = Photo.objects.get_or_create(fid=photo_id)
            if album_id !='tagged':
                album, created = Album.objects.get_or_create(fid=album_id)
            
            # if photo.nominations.count() < 3:
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
            for nomination in nominations:
                if nomination != '':
                    nom_cat = Nomination_Category.objects.get(name=nomination)
                    nomination = Nomination(nomination_category=nom_cat)
                    if comment_text != "":
                        nomination.caption = comment_text
                    nomination.nominatee = owner_fb_user
                    nomination.nominator = fb_user
                    nomination.save()
                    nomination.votes.add(fb_user)
                    comments = nomination.get_comments()
                    comment_count = comments['count']
                    comments = comments['comments']
                    photo.nominations.add(nomination)
                    fb_user.active_nominations.add(nomination)
                    #Create notification record
                    notification = Notification(source=fb_user, nomination=nomination, notification_type=notification_type)
                    notification.save()
                    
                    try:
                        portrit_user = Portrit_User.objects.get(fb_user=owner_fb_user)
                        portrit_user.notifications.add(notification)
                    except:
                        pass
                    
                    nominator_name = None
                    nominatee_name = None
                    try:
                        nominator_name = nomination.nominator.portrit_fb_user.all()[0].name
                    except:
                        pass
                    try:
                        nominatee_name = nomination.nominatee.portrit_fb_user.all()[0].name
                    except:
                        pass
                    
                    nom_data.append({
                        'id': nomination.id,
                        'nomination_category': nom_cat.name,
                        'nominator': nomination.nominator.fid,
                        'nominator_name': nominator_name,
                        'nominatee': nomination.nominatee.fid,
                        'nominatee_name': nominatee_name,
                        'won': nomination.won,
                        'time_remaining': nomination.get_time_remaining(),
                        'caption': comment_text,
                        'comments': comments,
                        'comment_count': comment_count,
                        'photo': photo_data,
                        'vote_count': nomination.current_vote_count,
                        'votes': [{
                            'vote_user': fb_user.fid,
                            'vote_name': Portrit_User.objects.get(fb_user=fb_user).name,
                        },],
                        'notification_id': notification.id,
                    })
                    
            #Send update notification to event handlers
            target_friends = get_target_friends(owner_fb_user, fb_user)
            target_friends = list(set(target_friends))
        
            node_data = {
                'method': 'new_nom',
                'payload': {
                    'nom_data': nom_data,
                    'friends': target_friends,
                }
            }
        
            node_data = json.dumps(node_data)
            sock = socket.socket(
                socket.AF_INET, socket.SOCK_STREAM)
            sock.connect(('localhost', NODE_SOCKET))
            sock.send(node_data)
            sock.close()
        
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
            winning_nominations = Nomination.objects.filter(nominatee=user, won=True)
            photos = Photo.objects.filter(album__fb_user__fid=user_id, nominations__isnull=False).exclude(nominations__won=True, nominations__active=False).distinct('id')
        
            winning_nom_objs = [ ]
            photo_objs = [ ]
        
            for nom in winning_nominations.iterator():
                winning_nom_objs.append({'id': nom.id, 
                                        'up_votes': nom.up_votes, 
                                        'down_votes': nom.down_votes,
                                        'nom_cat': nom.nomination_category.name,
                                        'photo': nom.get_photo()})
            
            for photo in photos.iterator():
                nom_objs = [ ]
                for nom in photo.nominations.all().iterator():
                    nom_objs.append({'up_votes': nom.up_votes, 'down_votes': nom.down_votes, 
                                    'time_remaining': nom.get_time_remaining(), 'nom_cat': nom.nomination_category.name})
                
                photo_objs.append({'fid': photo.fid, 'nom_objs': nom_objs})
            
            data = {
                'winning_nom_objs': winning_nom_objs,
                'photo_objs': photo_objs
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
        # if nomination.votes.filter(fid=owner.fid).count() == 0:
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
            owner_portrit_user = Portrit_User.objects.get(fb_user=nominatee)
            owner_portrit_user.vote_count += 1
            owner_portrit_user.save()
        except:
            pass
        
        portrit_user = owner.portrit_fb_user.all()[0]
        target_friends = get_target_friends(nominatee, owner)
        target_friends = list(set(target_friends))
        
        node_data = {
            'method': 'vote',
            'payload': {
                'nom_id': nomination.id,
                'nomination_category': nomination.nomination_category.name,
                'vote_count': nomination.current_vote_count,
                'vote_user': owner.fid,
                'vote_name': portrit_user.name,
                'friends': target_friends,
            }
        }
        
        node_data = json.dumps(node_data)
        sock = socket.socket(
            socket.AF_INET, socket.SOCK_STREAM)
        sock.connect(('localhost', NODE_SOCKET))
        sock.send(node_data)
        sock.close()
        
        data = {'vote_count': nomination.current_vote_count}
    
    # Send update to event listeners
    
    data = simplejson.dumps(data)
    return HttpResponse(data, mimetype='application/json')
    
def mark_nomination_as_won(request):
    data = False
    nom_id = request.GET.get('nom_id')
    try:
        nomination = Nomination.objects.get(id=nom_id)
        nomination.won = True
        nomination.save()

        target_friends = [ ]
        active_voters = nomination.votes.all()
        active_commentors = FB_User.objects.filter(comment__nomination=nomination)
        
        portrit_nominatee = Portrit_User.objects.get(fb_user=nomination.nominatee)
        portrit_nominatee.winning_nomination_count += 1
        portrit_nominatee.save()
        
        target_friends.append(nomination.nominatee.fid)
        for friend in active_voters.iterator():
            target_friends.append(friend.fid)
        for friend in active_commentors.iterator():
            target_friends.append(friend.fid)
            
        target_friends = list(set(target_friends))
        
        notification_type = Notification_Type.objects.get(name="nom_won")
        for friend in target_friends:
            notification = Notification(source=nomination.nominatee, nomination=nomination, notification_type=notification_type)
            notification.save()
            
            portrit_user = Portrit_User.objects.get(fb_user=FB_User.objects.get(fid=friend))
            portrit_user.notifications.add(notification)
        
        node_data = {
            'method': 'nom_won',
            'payload': {
                'id': nomination.id,
                'nomination_category': nomination.nomination_category.name,
                'nominator': nomination.nominator.fid,
                'nominator_name': nomination.nominator.portrit_fb_user.all()[0].name,
                'nominatee': nomination.nominatee.fid,
                'nominatee_name': nomination.nominatee.portrit_fb_user.all()[0].name,
                'vote_count': nomination.current_vote_count,
                'won': nomination.won,
                'friends': target_friends,
            }
        }
        node_data = json.dumps(node_data)
        sock = socket.socket(
            socket.AF_INET, socket.SOCK_STREAM)
        sock.connect(('localhost', NODE_SOCKET))
        sock.send(node_data)
        sock.close()
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
            owner = FB_User.objects.get(fid=int(cookie["uid"]))
            recent_stream = get_recent_stream(owner)
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
    
def get_recent_stream(fb_user, created_date=None):
    data = [ ]
    PAGE_SIZE = 10
    try:
        friends = fb_user.friends.all()
        if created_date:
            nominations = Nomination.objects.filter(
                Q(nominatee__in=friends) |
                Q(nominatee=fb_user) |
                Q(nominator=fb_user),
                created_date__lt=created_date, active=True, won=False).distinct('id').order_by('-created_date')[:PAGE_SIZE]
        else:
            nominations = Nomination.objects.filter(
                Q(nominatee__in=friends) |
                Q(nominatee=fb_user) |
                Q(nominator=fb_user),
                active=True, won=False).distinct('id').order_by('-created_date')[:PAGE_SIZE]
            
        for nom in nominations.iterator():
            comment_count = nom.get_comment_count()
            quick_comments = nom.get_quick_comments()
            more_comments = False
            if len(quick_comments) != comment_count:
                more_comments = True
            votes = [ ]
            for vote in nom.votes.all().iterator():
                votes.append({
                    'vote_user': vote.fid,
                    'vote_name': vote.portrit_fb_user.all()[0].name,
                })
            data.append({
                'id': nom.id,
                'nomination_category': nom.nomination_category.name,
                'nominator': nom.nominator.fid,
                'nominatee': nom.nominatee.fid,
                'won': nom.won,
                'time_remaining': nom.get_time_remaining(),
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
        
        if data.count() == 0:
            data = "empty"
    except:
        pass
        
    return data
    
def get_top_stream(fb_user):
    data = [ ]
    PAGE_SIZE = 10
    try:
        friends = fb_user.friends.all()
        nominations = Nomination.objects.filter(
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
                    'vote_name': vote.portrit_fb_user.all()[0].name,
                })
            data.append({
                'id': nom.id,
                'nomination_category': nom.nomination_category.name,
                'nominator': nom.nominator.fid,
                'nominatee': nom.nominatee.fid,
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
        
        if data.count() == 0:
            data = "empty"
    except:
        pass
        
    return data
    
def get_top_users(fb_user):
    data = [ ]
    try:
        friends = fb_user.friends.annotate(num_wins=Count('winning_noms')).filter(num_wins__gt=0).order_by('-num_wins')[:10]
        for friend in friends:
            data.append({
                'fid': friend.fid,
                'noms_won': friend.winning_noms.all().count(),
                'top_nom_cat': friend.winning_noms.all().annotate(noms_cat_count=Count('nomination_category')).order_by('-noms_cat_count')[0].nomination_category.name,
            })

    except:
        pass
    return data
    
def get_target_friends(fb_user, current_user):
    target_friends = Portrit_User.objects.filter(fb_user__friends=fb_user)
    friends = [ ]
    #Attach target user
    friends.append(fb_user.fid)
    for friend in target_friends.iterator():
        # if friend.fb_user.fid != current_user.fid:
        friends.append(friend.fb_user.fid)
        
    return friends