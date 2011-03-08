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
from nomination_views import serialize_noms, serialize_nom
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
        user_recent_stream = cache.get(str(fb_user.fid) + '_recent_stream')
        if user_recent_stream == None or created_date or new_date:
            if created_date:
                created_date = datetime.fromtimestamp(float(created_date))
                nominations = Nomination.objects.select_related().filter(
                    Q(nominatee__in=friends) |
                    Q(nominatee=fb_user) |
                    Q(nominator=fb_user),
                    created_date__lt=created_date, won=False).distinct('id').order_by('-created_date')[:PAGE_SIZE]
            elif new_date:
                new_date = datetime.fromtimestamp(float(new_date))
                nominations = Nomination.objects.select_related().filter(
                    Q(nominatee__in=friends) |
                    Q(nominatee=fb_user) |
                    Q(nominator=fb_user),
                    created_date__gt=new_date, won=False).distinct('id').order_by('-created_date')[:PAGE_SIZE]
            else:
                nominations = Nomination.objects.select_related().filter(
                    Q(nominatee__in=friends) |
                    Q(nominatee=fb_user) |
                    Q(nominator=fb_user),
                    won=False).distinct('id').order_by('-created_date')[:PAGE_SIZE]
            
            for nom in nominations.iterator():
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
                        'vote_count': nom.current_vote_count,
                        'votes': votes,
                    })
                except:
                    pass
            if not created_date and not new_date:        
                cache.set(str(fb_user.fid) + '_recent_stream', data, 60*5)
        else:
            data = user_recent_stream[:PAGE_SIZE]
            
        if len(data) == 0 or not data[0]['active']:
            data = [ ]
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
                    created_date__gt=new_date, active=True, won=False).distinct('id').order_by('-current_vote_count')[:PAGE_SIZE]
            else:
                nominations = Nomination.objects.select_related().filter(
                    Q(nominatee__in=following) |
                    Q(nominatee=fb_user) |
                    Q(nominator=fb_user),
                    active=True, won=False).distinct('id').order_by('-current_vote_count')[:PAGE_SIZE]
        
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
    page = request.GET.get('page')
    
    if not page:
        page = 1
        
    
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
    
def get_follow_data(request):
    data = [ ]
    PAGE_SIZE = 10
    
    source = request.GET.get('source')
    target = request.GET.get('target')
    method = request.GET.get('method')
    page = request.GET.get('page')
    
    if not page:
        page = 1
    
    # try:
    source = FB_User.objects.get(fid=int(source))
    target = FB_User.objects.get(fid=int(target))
    source_portrit_user = source.get_portrit_user()
    target_portrit_user = target.get_portrit_user()
    
    if method == 'followers':
        target_followers = target.friends.filter(portrit_fb_user__isnull=False)
        target_followers = target_followers | target_portrit_user.followers.all()
        target_followers = target_followers[PAGE_SIZE * (page - 1):PAGE_SIZE * page]
        
        source_followers = source.friends.filter(portrit_fb_user__isnull=False)
        source_followers = source_followers | source_portrit_user.followers.all()
        source_followers = source_followers.values_list('fid', flat=True)
        
        for fb_user in target_followers.iterator():
            if fb_user.fid in source_followers:
                data.append({
                    'fid': fb_user.fid,
                    'name': fb_user.get_name(),
                    'follow': False
                })
            else:
                data.append({
                    'fid': fb_user.fid,
                    'name': fb_user.get_name(),
                    'follow': True
                })
            
        
    elif method == 'following':
        target_following = target.friends.filter(portrit_fb_user__isnull=False)
        target_following = target_following | target_portrit_user.following.all()
        target_following = target_following[PAGE_SIZE * (page - 1):PAGE_SIZE * page]
        
        source_following = source.friends.filter(portrit_fb_user__isnull=False)
        source_following = source_following | source_portrit_user.following.all()
        source_following = source_following.values_list('fid', flat=True)
        
        for fb_user in target_following.iterator():
            if fb_user.fid in source_following:
                data.append({
                    'fid': fb_user.fid,
                    'name': fb_user.get_name(),
                    'follow': False
                })
            else:
                data.append({
                    'fid': fb_user.fid,
                    'name': fb_user.get_name(),
                    'follow': True
                })
    # except:
    #     pass
    
    data = simplejson.dumps(data)
    return HttpResponse(data, mimetype='application/json')
    
def get_user_photos(request):
    data = {
        'photos': [ ],
        'active_noms': None,
    }
    user = request.GET.get('fb_user')
    create_date = request.GET.get('create_date')
    page_size = request.GET.get('page_size')
    
    if not page_size:
        page_size = 10
    
    try:
        user = FB_User.objects.get(fid=int(user))
        portrit_user = user.get_portrit_user()
        
        try:
            if not create_date:
                photos = portrit_user.get_portrit_album().photo_set.filter(active=True, pending=False, nominations__active=False).distinct('id').order_by('-created_date')[:page_size]
            else:
                create_date = datetime.fromtimestamp(float(create_date))
                photos = portrit_user.get_portrit_album().photo_set.filter(active=True, pending=False, nominations__active=False, created_date__lt=create_date).distinct('id').order_by('-created_date')[:page_size]
        except:
            pass
    
        active_noms = Nomination.objects.select_related().filter(Q(nominatee=user) | Q(tagged_friends__fid__in=[user.fid]), active=True, won=False).distinct('id').order_by('-created_date')
        active_noms = serialize_noms(active_noms)
        
        data['active_noms'] = active_noms
        for photo in photos:
            data['photos'].append(photo.get_portrit_photo())
            
        print data['photos']
    
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
    # try:
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
                'noms': [ ],
            })
            
        data.sort(sort_by_wins)
        cache.set(str(user.fid) + '_user_trophies', data)
    else:
        data = user_trophies
    # except:
    #     pass

    data = simplejson.dumps(data)
    return HttpResponse(data, mimetype='application/json')