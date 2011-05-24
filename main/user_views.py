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

from main.documents import *

from settings import ENV, FACEBOOK_APP_ID, FACEBOOK_APP_SECRET, NODE_SOCKET, NODE_HOST

import json, socket, urllib, urllib2, facebook, time, datetime, httplib, oauth

from portrit_fb import Portrit_FB
from notification_views import get_active_notifications, get_winning_notifications
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

                fb_user = FB_User(fid=str(profile["id"]), access_token=cookie["access_token"])
                user, created = Portrit_User.objects.get_or_create(fb_user=fb_user)
                
                user.active = False
                user.name = profile['name']
                
                try:
                    email = profile['email']
                    user.email = email
                except:
                    pass
                
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
                # graph = facebook.GraphAPI(cookie["access_token"])
                # portrit = Portrit_FB(graph, user, cookie["access_token"])
                # portrit.load_user_friends(True)
        
            if not user.username:
                first = True
            data = get_user_data(user)
            
            data['username'] = user.username
            data['first'] = first
            data['allow_winning_fb_album'] = user.allow_winning_fb_album
            data['allow_public_follows'] = user.allow_follows
            
        except Exception, err:
            print err

    data = simplejson.dumps(data) 
    return HttpResponse(data, mimetype='application/json')
    
def create_portrit_album(portrit_user):
    url = 'https://graph.facebook.com/me/albums'
    values = {'access_token' : portrit_user.fb_user.get_access_token(),
              'name' : 'Portrit Trophies',
              }
    data = urllib.urlencode(values)
    req = urllib2.Request(url, data)
    response = urllib2.urlopen(req)
    data = response.read()
    data = simplejson.loads(data)
    portrit_user.portrit_fb_album_fid = data['id']
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
    
def get_user_data(user):
    data = False
    try:
        try:
            notifications = get_active_notifications(user)
        except:
            notifications = [ ]
            
        winning_notifications = [ ]
        try:
            winning_notifications = get_winning_notifications(user)
        except:
            pass
            
        tut_counts = False
        if not user.tutorial_completed:
            tut_counts = user.get_tutorial_counts()
            
        email_on_follow = user.email_on_follow
        email_on_nomination = user.email_on_nomination
        email_on_win = user.email_on_win
        email = user.email
        twitter_access_token = user.get_twitter_access_token()

        data = {
            'notifications': notifications,
            'winning_notifications': winning_notifications,
            'tut_counts': tut_counts,
            'twitter_access_token': twitter_access_token,
            'email_on_follow': email_on_follow,
            'email_on_nomination': email_on_nomination,
            'email_on_win': email_on_win,
            'email': email,
        }
    except:
        pass
    
    return data