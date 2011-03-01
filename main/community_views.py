from django.shortcuts import render_to_response, get_object_or_404, redirect
from django.http import HttpRequest, HttpResponse, HttpResponseRedirect, HttpResponseForbidden, HttpResponseNotFound
from django.template import RequestContext
from django.core import serializers
from django.utils import simplejson
from django.contrib.auth.decorators import login_required
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.core.exceptions import ObjectDoesNotExist
from django.db.models import Q
from django.core.cache import cache

from main.models import Portrit_User, FB_User, Album, Photo, Nomination, Nomination_Category, Comment, \
                        Notification, Notification_Type
from settings import ENV, MEDIA_ROOT, FACEBOOK_APP_ID, FACEBOOK_APP_SECRET, NODE_SOCKET, AWS_KEY, AWS_SECRET_KEY, MEDIA_ROOT, \
                        BITLY_LOGIN, BITLY_APIKEY

from portrit_fb import Portrit_FB

from itertools import chain
from datetime import datetime
from simples3 import S3Bucket
import facebook, json, socket, time, os, Image, urllib, urllib2

def get_community(request):
    data = []
    try:
        cookie = facebook.get_user_from_cookie(
            request.COOKIES, FACEBOOK_APP_ID, FACEBOOK_APP_SECRET)
        if cookie:
            fb_user = FB_User.objects.get(fid=int(cookie["uid"]))
            photos = Photo.objects.filter(active=True, pending=False, portrit_photo=True, public=True).order_by('-created_date')[:15]
            photo_data = [ ]
            for photo in photos:
                try:
                    temp = photo.get_portrit_photo()
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
    data = json.dumps(data)
    return HttpResponse(data, mimetype='text/html')
    
def get_more_community_photos(request):
    data = []
    try:
        cookie = facebook.get_user_from_cookie(
            request.COOKIES, FACEBOOK_APP_ID, FACEBOOK_APP_SECRET)
        if cookie:
            created_date = request.GET.get('created_date');
            fb_user = FB_User.objects.get(fid=int(cookie["uid"]))
            created_date = datetime.fromtimestamp(float(created_date))
            photos = Photo.objects.filter(active=True, pending=False, portrit_photo=True, public=True, created_date__lt=created_date).order_by('-created_date')[:15]

            photo_data = [ ]
            for photo in photos:
                try:
                    temp = photo.get_portrit_photo()
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
    data = json.dumps(data)
    return HttpResponse(data, mimetype='text/html')
    
def follow_user(request):
    data = False
    try:
        cookie = facebook.get_user_from_cookie(
            request.COOKIES, FACEBOOK_APP_ID, FACEBOOK_APP_SECRET)
        if cookie:
            target = request.POST.get('target')
            fb_user = FB_User.objects.get(fid=int(cookie["uid"]))
            target_fb_user = FB_User.objects.get(fid=int(target))
            portrit_user = fb_user.get_portrit_user()
            target_portrit_user = target_fb_user.get_portrit_user()
            
            portrit_user.following.add(target_fb_user)
            
            if target_portrit_user:
                target_portrit_user.followers.add(portrit_user)
            
            data = True
    except:
        pass
    
    data = json.dumps(data)
    return HttpResponse(data, mimetype='text/html')