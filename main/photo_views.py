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

# from main.models import Portrit_User, FB_User, Album, Photo, Nomination, Nomination_Category, Comment, \
#                         Notification, Notification_Type

from main.documents import *
                        
from settings import ENV, MEDIA_ROOT, FACEBOOK_APP_ID, FACEBOOK_APP_SECRET, NODE_SOCKET, AWS_KEY, AWS_SECRET_KEY, MEDIA_ROOT, \
                        BITLY_LOGIN, BITLY_APIKEY

from portrit_fb import Portrit_FB

from itertools import chain
from datetime import datetime
from simples3 import S3Bucket
import facebook, json, socket, time, os, Image, urllib, urllib2, uuid

from urllib import FancyURLopener
from urllib2 import URLError, HTTPError
from poster.encode import multipart_encode
from poster.streaminghttp import register_openers

def crop_to_size(image, resize_to, image_size, requested_size):
    from math import floor
    width_request = requested_size[0]
    height_request = requested_size[1]
    width_in = image_size[0]
    height_in = image_size[1]
    
    crop_x0 = 0
    crop_y0 = 0
    crop_x1 = 0
    crop_y1 = 0
    
    if resize_to:
        image.thumbnail(resize_to, Image.ANTIALIAS)
        width_in = image.size[0]
        height_in = image.size[1]
    
    if width_request < width_in:
        width_diff = width_in - width_request;
        crop_x0 = int(floor(width_diff / 2))
        crop_x1 = crop_x0 + width_request
    else:
        crop_x1 = width_in

    if height_request < height_in:
        height_diff = height_in - height_request
        crop_y0 = int(floor(height_diff / 2))
        crop_y1 =crop_y0 + height_request
    else:
        crop_y1 = height_in
    
    return image.crop((crop_x0, crop_y0, crop_x1, crop_y1))
    
def upload_photo(request):
    data = False
    try:
        cookie = facebook.get_user_from_cookie(
            request.COOKIES, FACEBOOK_APP_ID, FACEBOOK_APP_SECRET)
        if cookie:
            user = Portrit_User.objects.get(fb_user__fid=int(cookie["uid"]))
            file = request.FILES['file']
            file_name = str(uuid.uuid4())
            
            file_loc = MEDIA_ROOT + '/photos/' + file_name
            destination = open(file_loc, 'wb+')
            for chunk in file.chunks():
                    destination.write(chunk)
            destination.close()
            
            thumbnail_size_name = file_name + '_130.jpg'
            large_size_name = file_name + '_720.jpg'
            crop_size_name = file_name + '_crop.jpg'
            crop_small_size_name = file_name + '_crop_small.jpg'
            
            image = Image.open(file_loc)
            size = 130, 130
            image.thumbnail(size, Image.ANTIALIAS)
            image.save(file_loc + '_130.jpg', 'JPEG', quality=90)
            thumb_img_size = image.size
            
            image = Image.open(file_loc)
            size = 700, 700
            image.thumbnail(size, Image.ANTIALIAS)
            image.save(file_loc + '_720.jpg', 'JPEG', quality=90)
            large_img_size = image.size
            
            #Create crop section
            cropped_image = crop_to_size(image, (400,400), large_img_size, (200, 150))
            cropped_image.save(file_loc + '_crop.jpg', 'JPEG', quality=90)
            
            #Create small crop
            small_cropped_image = crop_to_size(image, (300,300), large_img_size, (100, 100))
            small_cropped_image.save(file_loc + '_crop_small.jpg', 'JPEG', quality=90)
            
            s = S3Bucket('cdn.portrit.com', access_key=AWS_KEY, secret_key=AWS_SECRET_KEY)
            thumbnail = open(file_loc + '_130.jpg', 'rb+')
            s.put(thumbnail_size_name, thumbnail.read(), acl="public-read")
            thumbnail.close()
            
            large_image = open(file_loc + '_720.jpg', 'rb+')
            s.put(large_size_name, large_image.read(), acl="public-read")
            large_image.close()
            
            cropped_image = open(file_loc + '_crop.jpg', 'rb+')
            s.put(crop_size_name, cropped_image.read(), acl="public-read")
            cropped_image.close()
            
            small_cropped_image = open(file_loc + '_crop_small.jpg', 'rb+')
            s.put(crop_small_size_name, small_cropped_image.read(), acl="public-read")
            small_cropped_image.close()

            s3_url = "http://cdn.portrit.com/"
            photo = Photo(path=file_loc, 
                        thumbnail=(s3_url+thumbnail_size_name), 
                        large=(s3_url+large_size_name), 
                        crop=(s3_url+crop_size_name),
                        crop_small=(s3_url+crop_small_size_name),
                        width=large_img_size[0],
                        height=large_img_size[1],
                        owner=user,
                        active=True, 
                        pending=True)
            photo.save()
            
            data = {'id': str(photo.id), 'thumb': photo.thumbnail, 'name': file.name}
    except Exception, err:
        print err
    data = json.dumps(data)
    return HttpResponse(data, mimetype='text/html')
    
def mark_photos_live(request):
    data = False
    try:
        cookie = facebook.get_user_from_cookie(
            request.COOKIES, FACEBOOK_APP_ID, FACEBOOK_APP_SECRET)
        if cookie:
            public_perm = request.POST.get('public_perm')
            
            user = Portrit_User.objects.get(fb_user__fid=int(cookie["uid"]))
                
            photo_id_list = request.POST.get('photo_ids')
            photo_id_temp_list = photo_id_list.split(',')
            photo_id_list = [ ]
            for id in photo_id_temp_list:
                try:
                    if id != '':
                        photo_id_list.append(id)
                except Exception, err:
                    print err
            
            if public_perm == 'true':
                public_perm = True
                
            photos = Photo.objects.filter(id__in=photo_id_list).update(set__pending=False, set__public=public_perm)
            photos = Photo.objects.filter(id__in=photo_id_list)
            for photo in photos:
                try:
                    photo.delete_local_copy()
                except Exception, err:
                    print err
            
            data = True
    except Exception, err:
        print err
    data = json.dumps(data)
    return HttpResponse(data, mimetype='text/html')
    
def post_photo_to_facebook(user, access_token, portrit_photos_album_fid, photo):
    now = datetime.now()
    name = str(photo.id) + '_' + str(now.strftime("%Y%m%dT%H%M%S")) + '.jpg'
    path = photo.path + '_720.jpg'
    
    message = 'http://portrit.com/!#/' + user.username + '/photos/' + str(photo.id) + '/'
    
    bitly_params = {
        'login': BITLY_LOGIN,
        'apiKey': BITLY_APIKEY,
        'longUrl': message,
        'format': 'json',
    }
    params = urllib.urlencode(bitly_params)
    bitly_request_url = 'http://api.bit.ly/v3/shorten?' + params
    data = urllib2.urlopen(bitly_request_url).read()
    data = simplejson.loads(data)
    message = data['data']['url']
    
    args = {
        'access_token': access_token,
        'message': message,
    }
    
    register_openers()
    
    url = 'https://graph.facebook.com/' + str(portrit_photos_album_fid) + '/photos?' + urllib.urlencode(args)
    params = {'file': open(path, "rb"), 'value': 'source', 'name': name, 'filetype': 'image/jpeg'}
    datagen, headers = multipart_encode(params)
    request = urllib2.Request(url, datagen, headers)
    try:
        response = urllib2.urlopen(request)
        data = response.read()
    except HTTPError, e:
        print 'Error code: ', e.code
    except URLError, e:
        print e.reason
    except:
        pass
        
def create_portrit_photo_album(user):
    url = 'https://graph.facebook.com/me/albums'
    values = {'access_token' : user.fb_user.access_token,
              'name' : 'Portrit Photos',
              }
    data = urllib.urlencode(values)
    req = urllib2.Request(url, data)
    response = urllib2.urlopen(req)
    data = response.read()
    data = simplejson.loads(data)
    user.portrit_fb_album_fid = data['id']
    user.save()