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
from nomination_views import get_target_friends, serialize_noms, serialize_nom
from datetime import datetime
from itertools import chain
import facebook, json, socket, time

def get_recent_stream(request):
    data = [ ]
    
    fb_user = request.GET.get('fb_user')
    created_date = request.GET.get('created_date')
    new_date = request.GET.get('new_date')
    page_size = request.GET.get('page_size')
    
    if not page_size:
        page_size = 10
    
    fb_user = FB_User.objects.get(fid=int(fb_user))
    PAGE_SIZE = int(page_size)
    try:
        friends = fb_user.friends.all()
        user_recent_stream = cache.get(str(fb_user.fid) + '_iphone_recent_stream')
        if user_recent_stream == None or created_date or new_date:
            if created_date:
                created_date = datetime.fromtimestamp(float(created_date))
                nominations = Nomination.objects.select_related().filter(
                    Q(nominatee__in=friends) |
                    Q(nominatee=fb_user) |
                    Q(nominator=fb_user),
                    created_date__lt=created_date, won=False, active=True).distinct('id').order_by('-created_date')[:PAGE_SIZE]
            elif new_date:
                new_date = datetime.fromtimestamp(float(new_date))
                nominations = Nomination.objects.select_related().filter(
                    Q(nominatee__in=friends) |
                    Q(nominatee=fb_user) |
                    Q(nominator=fb_user),
                    created_date__gt=new_date, won=False, active=True).distinct('id').order_by('-created_date')[:PAGE_SIZE]
            else:
                nominations = Nomination.objects.select_related().filter(
                    Q(nominatee__in=friends) |
                    Q(nominatee=fb_user) |
                    Q(nominator=fb_user),
                    won=False, active=True).distinct('id').order_by('-created_date')[:PAGE_SIZE]
                    
            data = serialize_noms(nominations)
            
            if not created_date and not new_date:        
                cache.set(str(fb_user.fid) + '_iphone_recent_stream', data, 60*5)
        else:
            data = user_recent_stream[:PAGE_SIZE]
            
        # if len(data) == 0 or not data[0]['active']:
        #     data = [ ]
    except:
        pass
    
    data = simplejson.dumps(data)
    return HttpResponse(data, mimetype='application/json')
    
def get_top_stream(request):
    data = [ ]
    PAGE_SIZE = 10
    fb_user = request.GET.get('fb_user')
    new_date = request.GET.get('new_date')
    
    fb_user = FB_User.objects.get(fid=int(fb_user))
    top_steam_cache = cache.get(str(fb_user.fid) + '_top_current_noms')
    try:
        if top_steam_cache == None or new_date:            
            following = fb_user.get_following()
            if new_date:
                new_date = datetime.fromtimestamp(float(new_date))
                nominations = Nomination.objects.select_related().filter(
                    Q(nominatee__in=following) |
                    Q(nominatee=fb_user) |
                    Q(nominator=fb_user),
                    created_date__gt=new_date, active=True, won=False).distinct('id').order_by('-current_vote_count', '-created_date')[:PAGE_SIZE]
            else:
                nominations = Nomination.objects.select_related().filter(
                    Q(nominatee__in=following) |
                    Q(nominatee=fb_user) |
                    Q(nominator=fb_user),
                    active=True, won=False).distinct('id').order_by('-current_vote_count', '-created_date')[:PAGE_SIZE]
        
            data = serialize_noms(nominations)
            if not new_date:
                cache.set(str(fb_user.fid) + '_top_current_noms', data, 60*5)
        else:
            data = top_steam_cache
        if data.count() == 0:
            data = "empty"
    except:
        pass
    
    data = simplejson.dumps(data)
    return HttpResponse(data, mimetype='application/json')
    
def get_winners_stream(request):
    data = [ ]
    fb_user = request.GET.get('fb_user')
    create_date = request.GET.get('create_date')
    new_date = request.GET.get('new_date')
    page_size = request.GET.get('page_size')
    
    if not page_size:
        page_size = 10
    
    try:
        winners_stream_cache = cache.get(str(fb_user) + '_winners_stream')
        if not winners_stream_cache or create_date or new_date:
            fb_user = FB_User.objects.get(fid=int(fb_user))
            following = fb_user.get_following()
            
            if create_date:
                create_date = datetime.fromtimestamp(float(create_date))
                winning_noms = Nomination.objects.select_related().filter(
                    Q(nominatee__in=following) |
                    Q(nominatee=fb_user) |
                    Q(nominator=fb_user),
                    created_date__lt=create_date, won=True).distinct('id').order_by('-created_date')[:page_size]
            
            elif new_date:
                new_date = datetime.fromtimestamp(float(new_date))
                winning_noms = Nomination.objects.select_related().filter(
                    Q(nominatee__in=following) |
                    Q(nominatee=fb_user) |
                    Q(nominator=fb_user),
                    created_date__gt=new_date, won=True).distinct('id').order_by('-created_date')[:page_size]
            else:
                winning_noms = Nomination.objects.select_related().filter(
                    Q(nominatee__in=following) |
                    Q(nominatee=fb_user) |
                    Q(nominator=fb_user),
                    won=True).distinct('id').order_by('-created_date')[:page_size]
            
            data = serialize_noms(winning_noms)        
            if not new_date and not create_date:
                cache.set(str(fb_user.fid) + '_winners_stream', data, 60*60*24)
        else:
            data = winners_stream_cache
    except:
        pass
    
    data = simplejson.dumps(data)
    return HttpResponse(data, mimetype='application/json')
    
def get_noms_in_cat(request):
    data = [ ]
    PAGE_SIZE = 10
    user = request.GET.get('fb_user')
    nom_id = request.GET.get('nom_id')
    page = request.GET.get('page')
    
    if not page:
        page = 1
    
    try:
        user = FB_User.objects.get(fid=int(user))
        following = user.get_following()
        
        nom = Nomination.objects.get(id=int(nom_id))
        noms_in_cat = Nomination.objects.select_related().filter(
            Q(nominatee__in=following) |
            Q(nominatee=user) |
            Q(nominator=user),
            nomination_category=nom.nomination_category, 
            active=True, 
            won=False).order_by('-created_date')[PAGE_SIZE * (page - 1): PAGE_SIZE * page]
        data = {
            'noms': serialize_noms(noms_in_cat),
            'selected_nom': serialize_nom(nom),
        }
    except:
        pass
    
    data = simplejson.dumps(data)
    return HttpResponse(data, mimetype='application/json')
    
def get_user_wins_trophy_cat(request):
    data = [ ]
    PAGE_SIZE = 10
    user = request.GET.get('fb_user')
    nom_cat = request.GET.get('nom_cat')
    nom_id = request.GET.get('nom_id')
    page = request.GET.get('page')
    
    if not page:
        page = 1
        
    user = FB_User.objects.get(fid=int(user))
    
    nom = Nomination.objects.get(id=int(nom_id))
    winning_noms = Nomination.objects.select_related().filter(Q(nominatee=user) | Q(tagged_friends__fid__in=[user.fid]), nomination_category__name=nom_cat, won=True).distinct('id').order_by('-current_vote_count', '-created_date')
    
    data = {
        'noms': serialize_noms(winning_noms),
        'selected_nom': serialize_nom(nom),
    }
        
    
    data = simplejson.dumps(data)
    return HttpResponse(data, mimetype='application/json')
    
def get_follow_count(request):
    data = False
    user = request.GET.get('fb_user')
    
    try:
        user = FB_User.objects.get(fid=int(user))
        portrit_user = user.get_portrit_user()

        following_count = user.friends.filter(portrit_fb_user__isnull=False).count()
        following_count += portrit_user.following.all().count()
    
        followers_count = FB_User.objects.filter(friends__fid=user.fid, portrit_fb_user__isnull=False).count()
        followers_count += portrit_user.followers.all().count()

        data = {
            'following': following_count,
            'followers': followers_count,
        }
    except:
        pass
    
    data = simplejson.dumps(data)
    return HttpResponse(data, mimetype='application/json')
    
def get_my_follow_data(request):
    data = {
        'data': [ ],
        'count': 0,
    }
    PAGE_SIZE = 20
    
    target = request.GET.get('user')
    method = request.GET.get('method')
    page = request.GET.get('page')
    all = request.GET.get('all')
    
    if not page:
        page = 1
    else:
        page = int(page)
    
    # try:
    target = FB_User.objects.get(fid=int(target))
    target_portrit_user = target.get_portrit_user()
    
    total_count = 0

    if method == 'followers':
        user_followers = cache.get(str(target.fid) + '_user_followers')
        if not user_followers:
            target_followers = target.friends.filter(portrit_fb_user__isnull=False)
            target_followers = target_followers | target_portrit_user.followers.all()
            data['count'] = target_followers.count()
            if not all:
                target_followers = target_followers[PAGE_SIZE * (page - 1):PAGE_SIZE * page]
            
    
            for fb_user in target_followers.iterator():
                data['data'].append({
                    'fid': fb_user.fid,
                    'name': fb_user.get_name(),
                    'follow': False
                })
            
            from operator import itemgetter  
            data['data'] = sorted(data['data'], key=itemgetter('name'))
        else:
            data = user_followers
            cache.set(str(target.fid) + '_user_followers', user_followers)
    
    elif method == 'following':
        user_following = cache.get(str(target.fid) + '_user_following')
        if not user_following:
            target_following = target.friends.filter(portrit_fb_user__isnull=False)
            target_following = target_following | target_portrit_user.following.all()
            data['count'] = target_following.count()
            if not all:
                target_following = target_following[PAGE_SIZE * (page - 1):PAGE_SIZE * page]

            for fb_user in target_following.iterator():
                data['data'].append({
                    'fid': fb_user.fid,
                    'name': fb_user.get_name(),
                    'follow': True
                })
            
            from operator import itemgetter  
            data['data'] = sorted(data['data'], key=itemgetter('name'))
        else:
            data = user_following
            cache.set(str(target.fid) + '_user_following', user_following)
    # except:
    #     pass
    
    data = simplejson.dumps(data)
    return HttpResponse(data, mimetype='application/json')
    
def follow_unfollow_user(request):
    data = [ ]
    source = request.POST.get('source')
    target = request.POST.get('target')
    method = request.POST.get('method')
    
    try:
        source = FB_User.objects.get(fid=int(source))
        source_portrit_user = source.get_portrit_user()
        target = FB_User.objects.get(fid=int(target))
        target_portrit_user = target.get_portrit_user()
        
        if method == 'follow':
            print source_portrit_user.name
            source_portrit_user.following.add(target)
            print 'here'
            target_portrit_user.followers.add(source)
        elif method == 'unfollow':
            source_portrit_user.following.remove(target)
            target_portrit_user.followers.remove(source)
            
        data = [True]
    except Exception, ex:
        print ex
    
    print data
    
    data = simplejson.dumps(data)
    return HttpResponse(data, mimetype='application/json')
    
    
def get_follow_data(request):
    data = {
        'data': [ ],
        'count': 0,
    }
    PAGE_SIZE = 20
    
    source = request.GET.get('source')
    target = request.GET.get('target')
    method = request.GET.get('method')
    all = request.GET.get('all')
    mutual = request.GET.get('mutual')
    page = request.GET.get('page')
    
    if not page:
        page = 1
        
    total_count = 0
    
    try:
        source = FB_User.objects.get(fid=int(source))
        target = FB_User.objects.get(fid=int(target))
        source_portrit_user = source.get_portrit_user()
        target_portrit_user = target.get_portrit_user()
    
        if method == 'followers':
            target_followers = target.friends.filter(portrit_fb_user__isnull=False)
            target_followers = target_followers | target_portrit_user.followers.all()
            target_followers = target_followers.distinct('id')
            if not all:
                target_followers = target_followers[PAGE_SIZE * (page - 1):PAGE_SIZE * page]
                
            data['count'] = target_followers.count()
        
            source_followers = source.friends.filter(portrit_fb_user__isnull=False)
            source_followers = source_followers | source_portrit_user.followers.all()
            source_followers = source_followers.distinct('id').values_list('fid', flat=True)
        
            for fb_user in target_followers.iterator():
                if fb_user.fid in source_followers:
                    data['data'].append({
                        'fid': fb_user.fid,
                        'name': fb_user.get_name(),
                        'follow': False
                    })
                elif not mutual:
                    data['data'].append({
                        'fid': fb_user.fid,
                        'name': fb_user.get_name(),
                        'follow': True
                    })
            
        
        elif method == 'following':
            target_following = target.friends.filter(portrit_fb_user__isnull=False)
            target_following = target_following | target_portrit_user.following.all()
            target_following = target_following.distinct('id')
            if not all:
                target_following = target_following[PAGE_SIZE * (page - 1):PAGE_SIZE * page]
                
            data['count'] = target_following.all().count()
            source_following = source.friends.filter(portrit_fb_user__isnull=False)
            source_following = source_following | source_portrit_user.following.all()
            source_following = source_following.distinct('id').values_list('fid', flat=True)
        
            for fb_user in target_following.iterator():
                if fb_user.fid in source_following:
                    data['data'].append({
                        'fid': fb_user.fid,
                        'name': fb_user.get_name(),
                        'follow': False
                    })
                elif not mutual:
                    data['data'].append({
                        'fid': fb_user.fid,
                        'name': fb_user.get_name(),
                        'follow': True
                    })
                    
        from operator import itemgetter  
        data['data'] = sorted(data['data'], key=itemgetter('name'))
    except:
        pass
    
    data = simplejson.dumps(data)
    return HttpResponse(data, mimetype='application/json')
    
def get_user_photos(request):
    data = {
        'photos': [ ],
        'active_noms': None,
        'trophy_count': 0,
    }
    user = request.GET.get('fb_user')
    create_date = request.GET.get('create_date')
    page_size = request.GET.get('page_size')
    
    if not page_size:
        page_size = 10
    
    try:
        user = FB_User.objects.get(fid=int(user))
        portrit_user = user.get_portrit_user()
        
        user_active_noms = cache.get(str(user.fid) + '_active_noms')
        if not user_active_noms:
            active_noms = Nomination.objects.select_related().filter(Q(nominatee=user) | Q(tagged_friends__fid__in=[user.fid]), active=True, won=False).distinct('id').order_by('-created_date')
            data['active_noms'] = serialize_noms(active_noms)
            cache.set(str(user.fid) + '_active_noms', data['active_noms'])
        else:
            data['active_noms'] = user_active_noms
    
        user_trophy_count = cache.get(str(user.fid) + '_trophy_count')
        if not user_trophy_count:
            trophy_count = Nomination.objects.select_related().filter(Q(nominatee=user) | Q(tagged_friends__fid__in=[user.fid]), won=True).distinct('id').order_by('-current_vote_count', '-created_date').count()
            data['trophy_count'] = trophy_count
            cache.set(str(user.fid) + '_trophy_count', data['trophy_count'])
        else:
            data['trophy_count'] = user_trophy_count
        
        try:
            if not create_date:
                photos = portrit_user.get_portrit_album().photo_set.filter(active=True, pending=False).exclude(nominations__in=active_noms).distinct('id').order_by('-created_date')[:page_size]

            else:
                create_date = datetime.fromtimestamp(float(create_date))
                photos = portrit_user.get_portrit_album().photo_set.filter(active=True, pending=False, created_date__lt=create_date).exclude(nominations__in=active_noms).distinct('id').order_by('-created_date')[:page_size]
        except:
            pass
        
        for photo in photos:
            data['photos'].append(photo.get_portrit_photo())
    
    except:
        pass
    
    data = simplejson.dumps(data)
    return HttpResponse(data, mimetype='application/json')
    
def get_user_active_noms(request):
    data = [ ]
    user = request.GET.get('fb_user')
    
    user = FB_User.objects.get(fid=int(user))
    active_noms = Nomination.objects.select_related().filter(Q(nominatee=user) | Q(tagged_friends__fid__in=[user.fid]), active=True, won=False).distinct('id').order_by('-created_date')
    data = serialize_noms(active_noms)
    
    data = simplejson.dumps(data)
    return HttpResponse(data, mimetype='application/json')
    
def sort_by_wins(a, b):
    return cmp(int(b['count']), int(a['count']))
    
def get_user_trophies(request):
    data = [ ]
    user = request.GET.get('fb_user')
    try:
        user = FB_User.objects.get(fid=user)
        user_trophies = cache.get(str(user.fid) + '_user_trophies')
        if user_trophies == None:
            nom_cats = Nomination_Category.objects.filter(nomination__nominatee=user, nomination__won=True).distinct('id')
            cat_count = 0
            for cat in nom_cats.iterator():
                winning_noms = cat.nomination_set.select_related().filter(Q(nominatee=user) | Q(tagged_friends__fid__in=[user.fid]), won=True).distinct('id').order_by('-current_vote_count', '-created_date')
                data.append({
                    'cat_name': cat.name,
                    'count': winning_noms.count(),
                    'noms': serialize_noms(winning_noms),
                })
            
            data.sort(sort_by_wins)
            cache.set(str(user.fid) + '_user_trophies', data)
        else:
            data = user_trophies
    except:
        pass

    data = simplejson.dumps(data)
    return HttpResponse(data, mimetype='application/json')
    
# Communtiy Views
def get_community_photos(request):
    data = []
    PAGE_SIZE = 21
    new_date = request.GET.get('new_date')
    
    try:
        if new_date:
            new_date = datetime.fromtimestamp(float(new_date))
            photos = Photo.objects.filter(created_date__gt=new_date, active=True, pending=False, portrit_photo=True, public=True).order_by('-created_date')[:PAGE_SIZE]
        else:
            photos = Photo.objects.filter(active=True, pending=False, portrit_photo=True, public=True).order_by('-created_date')[:PAGE_SIZE]
        photo_data = [ ]
        for photo in photos:
            try:
                portrit_user = photo.get_portrit_user()
                photo_obj = photo.get_portrit_photo()
                if photo_obj['crop'] != None:
                    photo_data.append({
                        'user_fid': portrit_user.fb_user.fid,
                        'name': portrit_user.name,
                        'photo': photo_obj,
                        'album_id': photo.album.id,
                        'create_datetime': time.mktime(photo.created_date.utctimetuple()),
                    })
            except:
                pass
        data = photo_data
    except:
        pass
    data = simplejson.dumps(data)
    return HttpResponse(data, mimetype='application/json')
    
def get_community_nominations(request):
    data = []
    PAGE_SIZE = 10
    new_date = request.GET.get('new_date')
    old_date = request.GET.get('create_date')
    
    if new_date:
        new_date = datetime.fromtimestamp(float(new_date))
        nominations = Nomination.objects.filter(created_date__gt=new_date, active=True, won=False, photo__public=True).order_by('-created_date')[:PAGE_SIZE]
    elif old_date:
        old_date = datetime.fromtimestamp(float(old_date))
        nominations = Nomination.objects.filter(created_date__lt=old_date, active=True, won=False, photo__public=True).order_by('-created_date')[:PAGE_SIZE]
    else:
        nominations = Nomination.objects.filter(active=True, won=False, photo__public=True).order_by('-created_date')[:PAGE_SIZE]
        
    data = serialize_noms(nominations)
    
    data = simplejson.dumps(data)
    return HttpResponse(data, mimetype='application/json')
    
def get_community_top_stream(request):
    data = [ ]
    PAGE_SIZE = 10
    new_date = request.GET.get('new_date')

    community_top_steam_cache = cache.get('community_top_steam')
    try:
        if not community_top_steam_cache or new_date:            
            following = fb_user.get_following()
            if new_date:
                new_date = datetime.fromtimestamp(float(new_date))
                nominations = Nomination.objects.select_related().filter(
                    created_date__gt=new_date,
                    photo__public=True,
                    active=True, 
                    won=False).distinct('id').order_by('-current_vote_count', '-created_date')[:PAGE_SIZE]
            else:
                nominations = Nomination.objects.select_related().filter(
                    photo__public=True,
                    active=True, 
                    won=False).distinct('id').order_by('-current_vote_count', '-created_date')[:PAGE_SIZE]

            data = serialize_noms(nominations)
            if not new_date:
                cache.set('community_top_steam', data, 60*5)
        else:
            data = community_top_steam_cache
        if data.count() == 0:
            data = "empty"
    except:
        pass

    data = simplejson.dumps(data)
    return HttpResponse(data, mimetype='application/json')
    
# Notification Views
def get_active_notifications(request):
    data = [ ]
    user = request.GET.get('fb_user')
    new_date = request.GET.get('new_date')
    
    try:
        user = FB_User.objects.get(fid=int(user))
        user = user.get_portrit_user()
        
        if new_date:
            new_date = datetime.fromtimestamp(float(new_date))
            all_notifications = user.notifications.select_related().filter(created_date__gt=new_date, active=True, read=False).order_by('-created_date')
        else:
            all_notifications = user.notifications.select_related().filter(active=True, read=False).order_by('-created_date')
    
        data = [ ]
        for notification in all_notifications:
            data.append({
                'notification_type': notification.notification_type.name,
                'create_time': time.mktime(notification.created_date.utctimetuple()),
                'read': notification.read,
                'source_id': notification.get_source_fid(),
                'source_name': notification.get_source_name(),
                'destination_id': notification.get_dest_fid(),
                'destination_name': notification.get_dest_name(),
                'nomination': notification.nomination.id,
                'notification_id': notification.id,
                'nomination_category': notification.nomination.nomination_category.name,
            })
    except:
        pass
        
    data = simplejson.dumps(data)
    return HttpResponse(data, mimetype='application/json')
    
def notification_read(request):
    data = False
    notification_id = request.POST.get('notification_id')
    fb_user = request.POST.get('user')
    kill = request.POST.get('kill')
    clear = request.POST.get('clear')

    if clear:
        try:
            fb_user = FB_User.objects.get(fid=int(fb_user))
            user = fb_user.get_portrit_user()
            user.notifications.select_related().filter(active=True, read=False).update(read=True, active=False)
            data = True
        except:
            pass
    else:
        try:
            notification = Notification.objects.get(id=notification_id)
            notification.read = True
            if kill:
                notification.active = False
            notification.save()
            data = True
        except:
            pass

    data = json.dumps(data) 
    return HttpResponse(data, mimetype='application/json')
    
#Comment Views
def get_comments(request):
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
    
def new_comment(request):
    data = False
    notification_id = None
    fb_user = request.POST.get('user')
    
    try:
        fb_user = FB_User.objects.get(fid=int(fb_user))
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
                                        nom['comment_count'] = nomination.get_comment_count()
                                    
                            cache.set(str(friend) + '_user_top_stream', user_top_stream)
                    except:
                        pass
            except:
                pass
            data = True
        except:
            pass
    except:
        pass
    
    data = simplejson.dumps(data) 
    return HttpResponse(data, mimetype='application/json')

# Search Views  
def search(request):
    data = [ ]
    q = request.GET.get('q')
    source = request.GET.get('fb_user')
    
    try:
        source = FB_User.objects.get(fid=int(source))
        source_portrit_user = source.get_portrit_user()
    
        users = Portrit_User.objects.filter(name__icontains=q)[:40]
    
        source_following = source.friends.filter(portrit_fb_user__isnull=False)
        source_following = source_following | source_portrit_user.following.all()
        source_following = source_following.distinct('id').values_list('fid', flat=True)
    
        for user in users.iterator():
            if user.fb_user.fid in source_following:
                data.append({
                    'fid': user.fb_user.fid,
                    'name': user.name,
                    'follow': False
                })
            else:
                data.append({
                    'fid': user.fb_user.fid,
                    'name': user.name,
                    'follow': True
                })
                
        from operator import itemgetter  
        data = sorted(data, key=itemgetter('name'))
    except:
        pass
    
    data = simplejson.dumps(data) 
    return HttpResponse(data, mimetype='application/json')
    
def search_by_names(request):
    data = [ ]
    source = request.POST.get('source')
    names = request.POST.get('names')
    
    try:
        source = FB_User.objects.get(fid=int(source))
        source_portrit_user = source.get_portrit_user()
    
        names = names.split(',')
        users = Portrit_User.objects.filter(name__in=names)[:100]
    
        source_following = source.friends.filter(portrit_fb_user__isnull=False)
        source_following = source_following | source_portrit_user.following.all()
        source_following = source_following.distinct('id').values_list('fid', flat=True)
    
        for user in users.iterator():
            if user.fb_user.fid in source_following:
                data.append({
                    'fid': user.fb_user.fid,
                    'name': user.name,
                    'follow': False
                })
            else:
                data.append({
                    'fid': user.fb_user.fid,
                    'name': user.name,
                    'follow': True
                })
                
        from operator import itemgetter  
        data = sorted(data, key=itemgetter('name'))
    except:
        pass
    
    data = simplejson.dumps(data) 
    return HttpResponse(data, mimetype='application/json')
    
def search_cool_kids(request):
    data = [ ]
    source = request.POST.get('source')

    try:
        source = FB_User.objects.get(fid=int(source))
        source_portrit_user = source.get_portrit_user()

        source_following = source.friends.filter(portrit_fb_user__isnull=False)
        source_following = source_following | source_portrit_user.following.all()
        source_following = source_following.distinct('id').values_list('fid', flat=True)
        
        names = names.split(',')
        users = Portrit_User.objects.filter(name__in=names)[:100]

        for user in users.iterator():
            if user.fb_user.fid in source_following:
                data.append({
                    'fid': user.fb_user.fid,
                    'name': user.name,
                    'follow': False
                })
            else:
                data.append({
                    'fid': user.fb_user.fid,
                    'name': user.name,
                    'follow': True
                })

        from operator import itemgetter  
        data = sorted(data, key=itemgetter('name'))
    except:
        pass

    data = simplejson.dumps(data) 
    return HttpResponse(data, mimetype='application/json')
