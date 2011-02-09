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
from settings import ENV, MEDIA_ROOT, FACEBOOK_APP_ID, FACEBOOK_APP_SECRET, NODE_SOCKET, AWS_KEY, AWS_SECRET_KEY, MEDIA_ROOT

from portrit_fb import Portrit_FB

from itertools import chain
from datetime import datetime
from simples3 import S3Bucket
import facebook, json, socket, time, os, Image, urllib, urllib2

from urllib import FancyURLopener
from urllib2 import URLError, HTTPError
from poster.encode import multipart_encode
from poster.streaminghttp import register_openers

def upload_photo(request):
    data = False
    try:
        cookie = facebook.get_user_from_cookie(
            request.COOKIES, FACEBOOK_APP_ID, FACEBOOK_APP_SECRET)
        if cookie:
            fb_user = FB_User.objects.get(fid=int(cookie["uid"]))
            file = request.FILES['file']
            file_name = str(datetime.now()).replace('-', '_').replace('.', '').replace(':', '').replace(' ', '').replace('.jpg', '').replace('.png', '').replace('.jpeg', '').replace('.gif', '')
            file_loc = MEDIA_ROOT + '/photos/' + file_name
            destination = open(file_loc, 'wb+')
            for chunk in file.chunks():
                    destination.write(chunk)
            destination.close()
            
            thumbnail_size_name = file_name + '_130.jpg'
            large_size_name = file_name + '_720.jpg'
            
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
            
            s = S3Bucket('portrit_photos', access_key=AWS_KEY, secret_key=AWS_SECRET_KEY)
            thumbnail = open(file_loc + '_130.jpg', 'rb+')
            s.put(thumbnail_size_name, thumbnail.read(), acl="public-read")
            thumbnail.close()
            large_image = open(file_loc + '_720.jpg', 'rb+')
            s.put(large_size_name, large_image.read(), acl="public-read")
            large_image.close()

            s3_url = "http://portrit_photos.s3.amazonaws.com/"
            photo = Photo(portrit_photo=True, photo_path=file_loc, thumbnail_src=(s3_url+thumbnail_size_name), 
                        large_src=(s3_url+large_size_name), fb_source_small=(s3_url+thumbnail_size_name),
                        fb_source=(s3_url+large_size_name), small_width=thumb_img_size[0], 
                        small_height=thumb_img_size[1], width=large_img_size[0], height=large_img_size[1], 
                        active=True, pending=True)
            photo.save()
            
            data = {'id': photo.id, 'thumb': photo.thumbnail_src, 'name': file.name}
    except:
        pass
    data = json.dumps(data)
    return HttpResponse(data, mimetype='text/html')
    
def mark_photos_live(request):
    data = False
    try:
        cookie = facebook.get_user_from_cookie(
            request.COOKIES, FACEBOOK_APP_ID, FACEBOOK_APP_SECRET)
        if cookie:
            public_perm = request.POST.get('public_perm')
            post_to_facebook = request.POST.get('post_to_facebook')
            fb_user = FB_User.objects.get(fid=int(cookie["uid"]))
            portrit_user = fb_user.get_portrit_user()
            if portrit_user.portrit_user_albums.all().count() == 0:
                album = Album(name='Portrit Photos')
                album.save()
                portrit_user.portrit_user_albums.add(album)
                
            portrit_album = portrit_user.get_portrit_album()
            photo_id_list = request.POST.get('photo_ids')
            photo_id_temp_list = photo_id_list.split(',')
            photo_id_list = [ ]
            for id in photo_id_temp_list:
                if id != '':
                    photo_id_list.append(int(id))
            
            if public_perm == 'true':
                public_perm = True
            photos = Photo.objects.filter(id__in=photo_id_list).update(pending=False, album=portrit_album, public=True)
            photos = Photo.objects.filter(id__in=photo_id_list)
            if post_to_facebook == 'true':
                if not portrit_user.portrit_photos_album_fid:
                    create_portrit_photo_album(fb_user, portrit_user)
                for photo in photos:
                    try:
                        post_photo_to_facebook(fb_user.fid, portrit_user.access_token, portrit_user.portrit_photos_album_fid, photo)
                    except:
                        pass
                    try:
                        photo.delete_local_copy()
                    except:
                        pass
            else:
                for photo in photos:
                    try:
                        photo.delete_local_copy()
                    except:
                        pass
            
            data = True
    except:
        pass
    data = json.dumps(data)
    return HttpResponse(data, mimetype='text/html')
    
def post_photo_to_facebook(user_fid, access_token, portrit_photos_album_fid, photo):
    now = datetime.now()
    name = str(photo.id) + '_' + str(now.strftime("%Y%m%dT%H%M%S")) + '.jpg'
    path = photo.photo_path + '_720.jpg'
    
    message = 'http://portrit.com/#/user=' + str(user_fid) + '/album=portrit-photos/gallery/photo=' + str(photo.id)
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
        print "photo uploaded"
    except HTTPError, e:
        print 'Error code: ', e.code
    except URLError, e:
        print e.reason
    except:
        pass
        
def create_portrit_photo_album(fb_user, portrit_user):
    url = 'https://graph.facebook.com/me/albums'
    values = {'access_token' : portrit_user.access_token,
              'name' : 'Portrit Photos',
              }
    data = urllib.urlencode(values)
    req = urllib2.Request(url, data)
    response = urllib2.urlopen(req)
    data = response.read()
    data = simplejson.loads(data)
    portrit_user.portrit_photos_album_fid = data['id']
    portrit_user.save()
    
def latest_photos(request):
    data = False
    try:
        cookie = facebook.get_user_from_cookie(
            request.COOKIES, FACEBOOK_APP_ID, FACEBOOK_APP_SECRET)
        if cookie:
            fb_user = FB_User.objects.get(fid=int(cookie["uid"]))
            friends = fb_user.friends.values_list('fid', flat=True)
            photos = Photo.objects.filter(active=True, pending=False, portrit_photo=True, album__portrit_user_albums__fb_user__fid__in=friends).order_by('-created_date')[:48]
            photo_data = [ ]
            for photo in photos:
                try:
                    temp = photo.get_portrit_photo()
                    portrit_user = photo.get_portrit_user()
                    photo_data.append({
                        'user_fid': portrit_user.fb_user.fid,
                        'name': portrit_user.name,
                        'photo': photo.get_portrit_photo(),
                        'album_id': photo.album.id,
                    })
                except:
                    pass
            data = photo_data
    except:
        pass
    data = json.dumps(data)
    return HttpResponse(data, mimetype='text/html')
    