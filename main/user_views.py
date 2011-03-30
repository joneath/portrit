from django.shortcuts import render_to_response, get_object_or_404, redirect
from django.http import HttpRequest, HttpResponse, HttpResponseRedirect, HttpResponseForbidden, HttpResponseNotFound
from django.template import RequestContext
from django.core import serializers
from django.utils import simplejson
from django.contrib.auth.decorators import login_required
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.db.models import Q
from django.core.cache import cache

# from main.models import Portrit_User, FB_User, Album, Photo, Nomination, Nomination_Category, Comment, \
#                         Notification, Notification_Type

from main.documents import *

from settings import ENV, FACEBOOK_APP_ID, FACEBOOK_APP_SECRET, NODE_SOCKET, NODE_HOST

import json, socket, urllib, urllib2, facebook, time, datetime, httplib, oauth

from portrit_fb import Portrit_FB
from notification_views import get_active_notifications
from nomination_views import get_recent_stream, serialize_noms
from import_friends import import_fb_friends

def check_username(user):
    username = user.name.replace(' ', '-')
    username_found = False
    count = 0
    count_max = 20
    while not username_found:
        if count < count_max:
            username = username.replace(' ', '-')
            if count > 0:
                username += '-' + str(count)
            try: 
                existing_user = Portrit_User.objects.get(username__iexact=username)
            except:
                user.username = username
                user.save()
                username_found = True
            count += 1
        else:
            username_found = True 

def login_fb_user(request):
    data = False
    cookie = facebook.get_user_from_cookie(
        request.COOKIES, FACEBOOK_APP_ID, FACEBOOK_APP_SECRET)
    if cookie:
        try:
            user = None
            data = True
            first = False
            permission_request = True
            try:
                user = Portrit_User.objects.get(fb_user__fid=int(cookie["uid"]))
            except:
                pass
            if not user:
                graph = facebook.GraphAPI(cookie["access_token"])
                profile = graph.get_object("me")
                email = None
                try:
                    email = profile['email']
                except:
                    pass

                fb_user = FB_User(fid=str(profile["id"]), access_token=cookie["access_token"])
                user, created = Portrit_User.objects.get_or_create(fb_user=fb_user)
                
                user.name = name=profile['name']
                user.email = email=email
                user.save()
            
                first = True
                portrit = Portrit_FB(graph, user, cookie["access_token"])
                portrit.load_user_friends()
            
            elif user.fb_user.access_token != cookie["access_token"]:
                user.fb_user.access_token = cookie["access_token"]
                if not user.email:
                    graph = facebook.GraphAPI(cookie["access_token"])
                    profile = graph.get_object("me")
                    email = None
                    try:
                        email = profile['email']
                        user.email = email
                    except:
                        pass
                user.save()
                graph = facebook.GraphAPI(cookie["access_token"])
                portrit = Portrit_FB(graph, user, cookie["access_token"])
                portrit.load_user_friends(True)
        
            if not user.username:
                check_username(user)
            
            data = get_user_data(user)
            data['following'] = user.get_following_data()
            data['username'] = user.username
            data['first'] = first
            data['allow_winning_fb_album'] = user.allow_winning_fb_album
            data['allow_public_follows'] = user.allow_follows
        except Exception, err:
            print err
    
    data = simplejson.dumps(data) 
    return HttpResponse(data, mimetype='application/json')
    
def create_portrit_album(fb_user, portrit_user):
    url = 'https://graph.facebook.com/me/albums'
    values = {'access_token' : portrit_user.access_token,
              'name' : 'Portrit Trophies',
              }
    data = urllib.urlencode(values)
    req = urllib2.Request(url, data)
    response = urllib2.urlopen(req)
    data = response.read()
    data = simplejson.loads(data)
    portrit_user.portrit_album_fid = data['id']
    portrit_user.save()
    
def update_user_friends(request):
    data = False
    try:
        fid = request.GET.get('fid')
        fb_user = FB_User.objects.get(fid=fid)
        graph = facebook.GraphAPI(cookie["access_token"])
        portrit = Portrit_FB(graph, fb_user, cookie["access_token"])
        portrit.load_user_friends(True)
        data = True
    except:
        pass
    data = simplejson.dumps(data) 
    return HttpResponse(data, mimetype='application/json')
    
def logout_user(request):
    data = True
    logout(request)
    data = simplejson.dumps(data)
    return HttpResponse(data, mimetype='application/json')
    
def skip_tut(request):
    data = False
    cookie = facebook.get_user_from_cookie(
        request.COOKIES, FACEBOOK_APP_ID, FACEBOOK_APP_SECRET)
    if cookie:
        user = Portrit_User.objects.get(fb_user__fid=int(cookie["uid"]))
        user.tutorial_completed = True
        user.save()
        data = True
        
    data = simplejson.dumps(data)
    return HttpResponse(data, mimetype='application/json')
    
def change_user_permissions(request):
    data = False
    cookie = facebook.get_user_from_cookie(
        request.COOKIES, FACEBOOK_APP_ID, FACEBOOK_APP_SECRET)
    if cookie:
        permission = request.POST.get('permission')
        check = request.POST.get('check')
        user = Portrit_User.objects.get(fb_user__fid=int(cookie["uid"]))
        
        if permission == 'fb_auto_post':
            if check == 'true':
                user.allow_notifications = True
            else:
                user.allow_notifications = False
        elif permission == 'portrit_album':
            if check == 'true':
                user.allow_winning_fb_album = True
            else:
                user.allow_winning_fb_album = False
            
        user.save()
        data = True
        
    data = simplejson.dumps(data)
    return HttpResponse(data, mimetype='application/json')
    
def get_more_recent_stream(request):
    data = []
    selected_user = request.GET.get('selected_user')
    create_time = request.GET.get('create_time')
    page_size = request.GET.get('page_size')
    create_time = datetime.datetime.fromtimestamp(float(create_time))
    # print create_time
    cookie = facebook.get_user_from_cookie(
        request.COOKIES, FACEBOOK_APP_ID, FACEBOOK_APP_SECRET)
    if cookie:
        try:
            fb_user = FB_User.objects.get(fid=int(cookie["uid"]))
            if not selected_user or selected_user == '':
                owner = None
            else:
                owner = FB_User.objects.get(fid=int(selected_user))

            data = get_recent_stream(fb_user, create_time, page_size, owner)
        except:
            pass
    
    data = simplejson.dumps(data)
    return HttpResponse(data, mimetype='application/json')
    
def get_user_data(user):
    data = False
    try:
        try:
            notifications = get_active_notifications(user)
        except:
            notifications = [ ]
        tut_counts = False
        if not user.tutorial_completed:
            tut_counts = user.get_tutorial_counts()
        
        data = {
            'notifications': notifications,
            'tut_counts': tut_counts,
        }
    except:
        pass
    
    return data
    
def get_top_feed(request):
    data = False
    cookie = facebook.get_user_from_cookie(
        request.COOKIES, FACEBOOK_APP_ID, FACEBOOK_APP_SECRET)
    if cookie:
        fb_user = FB_User.objects.get(fid=int(cookie["uid"]))
        data = get_user_stream(fb_user)
        data = simplejson.dumps(data) 
    return HttpResponse(data, mimetype='application/json')
    
def get_user_nom(request):
    data = False
    cookie = facebook.get_user_from_cookie(
        request.COOKIES, FACEBOOK_APP_ID, FACEBOOK_APP_SECRET)
    if cookie:
        fb_user = FB_User.objects.get(fid=int(cookie["uid"]))
        nom_id = request.GET.get('nom_id')
        nom_id = int(nom_id.replace('&ref', ''))
        nom = Nomination.objects.get(id=nom_id)
        if not nom.active:
            try:
                data = [{'cat_name': nom.nomination_category.name,
                            'noms': None,
                            'inactive': True,
                        }]
                # comment_count = nom.get_comment_count()
                votes = [ ]
                
                for vote in nom.votes.all().iterator():
                    votes.append({
                        'vote_user': vote.fid,
                        'vote_name': vote.get_name(),
                    })
                data[0]['noms'] = [{
                    'id': nom.id,
                    'active': nom.active,
                    'nomination_category': nom.nomination_category.name,
                    'nominator': nom.nominator.fid,
                    'nominatee': nom.nominatee.fid,
                    'nominator_name': nom.nominator.get_name(),
                    'nominatee_name': nom.nominatee.get_name(),
                    'tagged_users': nom.get_tagged_users(),
                    'created_time': time.mktime(nom.created_date.utctimetuple()),
                    'won': nom.won,
                    'time_remaining': nom.get_time_remaining(),
                    'photo': nom.get_photo(),
                    'caption': nom.caption,
                    # 'comments': False,
                    # 'comment_count': comment_count,
                    'vote_count': nom.current_vote_count,
                    'votes': votes,
                }]
                data = simplejson.dumps(data)
            except:
                pass
        else:
            try:
                data = get_user_stream(fb_user)
                data = simplejson.dumps(data)
            except:
                pass
                
    return HttpResponse(data, mimetype='application/json')
    
def get_user_stream(fb_user):
    data = False
    PAGE_SIZE = 8
    try:
        user_top_stream = cache.get(str(fb_user.fid) + '_user_top_stream')
        if user_top_stream == None:
            friends = fb_user.friends.all()
            nom_cats = Nomination_Category.objects.all()
            data = [ ]
            cat_count = 0
            for cat in nom_cats.iterator():
                try:
                    data.append({
                        'cat_name': cat.name,
                        'page_size': PAGE_SIZE,
                        'noms': [ ],
                    })
                
                    top_noms = cat.nomination_set.filter(
                        Q(nominatee__in=friends) |
                        Q(nominatee=fb_user) |
                        Q(nominator=fb_user),
                        active=True, won=False).distinct('id').order_by('-current_vote_count', '-created_date')#[:PAGE_SIZE]
                    for nom in top_noms.iterator():
                        # comment_count = nom.get_comment_count()
                        votes = [ ]
                        for vote in nom.votes.all().iterator():
                            votes.append({
                                'vote_user': vote.fid,
                                'vote_name': vote.get_name(),
                            })
                        data[cat_count]['noms'].append({
                            'id': nom.id,
                            'active': nom.active,
                            'nomination_category': nom.nomination_category.name,
                            'nominator': nom.nominator.fid,
                            'nominatee': nom.nominatee.fid,
                            'nominator_name': nom.nominator.get_name(),
                            'nominatee_name': nom.nominatee.get_name(),
                            'tagged_users': nom.get_tagged_users(),
                            'created_time': time.mktime(nom.created_date.utctimetuple()),
                            'won': nom.won,
                            'time_remaining': nom.get_time_remaining(),
                            'photo': nom.get_photo(),
                            'caption': nom.caption,
                            # 'comments': False,
                            # 'comment_count': comment_count,
                            'vote_count': nom.current_vote_count,
                            'votes': votes,
                        })
                    cat_count += 1
                except:
                    top_nom = None
            data = sorted(data, key=lambda k: len(k['noms']), reverse=True)
            cache.set(str(fb_user.fid) + '_user_top_stream', data, 60*5)
        else:
            data = user_top_stream
        if data.count() == 0:
            data = "empty"
    except:
        pass
    return data
    
def get_user_win_stream(request):
    data = [ ]
    cookie = facebook.get_user_from_cookie(
        request.COOKIES, FACEBOOK_APP_ID, FACEBOOK_APP_SECRET)
    if cookie:
        try:
            fb_user = FB_User.objects.get(fid=int(cookie["uid"]))
            winning_noms = Nomination.objects.filter(nominatee=fb_user, won=True).order_by('-created_date')
            data = serialize_noms(winning_noms)
        except:
            pass
    
    data = simplejson.dumps(data)
    return HttpResponse(data, mimetype='application/json')
    
def get_user_trophies(request):
    data = [ ]
    user = request.GET.get('user')
    try:
        user = FB_User.objects.get(fid=user)
        user_trophies = cache.get(str(user.fid) + '_user_trophies')
        if user_trophies == None:
            nom_cats = Nomination_Category.objects.filter(nomination__nominatee=user, nomination__won=True).distinct('id')
            cat_count = 0
            for cat in nom_cats.iterator():
                winning_noms = cat.nomination_set.select_related().filter(nominatee=user, won=True)
                data.append({
                    'cat_name': cat.name,
                    'count': winning_noms.count(),
                    'noms': [ ],
                })
            cache.set(str(user.fid) + '_user_trophies', data)
        else:
            data = user_trophies
    except:
        pass
    
    data = simplejson.dumps(data)
    return HttpResponse(data, mimetype='application/json')
    
def convert_twitter_bridge(reqeust):
    data = False
    
    data = simplejson.dumps(data)
    return HttpResponse(data, mimetype='application/json')