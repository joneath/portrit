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
from settings import ENV, MEDIA_ROOT, FACEBOOK_APP_ID, FACEBOOK_APP_SECRET, NODE_SOCKET, AWS_KEY, AWS_SECRET_KEY

from portrit_fb import Portrit_FB

from itertools import chain
from datetime import datetime
from simples3 import S3Bucket
import facebook, json, socket, time, os, Image

def resize(im,pixels):
    (wx,wy) = im.size
    rx=1.0*wx/pixels
    ry=1.0*wy/pixels
    if wx < pixels and wy < pixels:
        return im
    else:
        if rx>ry:
            rr=rx
        else:
            rr=ry

    return im.resize((int(wx/rr), int(wy/rr), Image.ANTIALIAS))

def upload_photo(request):
    data = False
    try:
        cookie = facebook.get_user_from_cookie(
            request.COOKIES, FACEBOOK_APP_ID, FACEBOOK_APP_SECRET)
        if cookie:
            fb_user = FB_User.objects.get(fid=int(cookie["uid"]))
            
            file_name = str(datetime.now()).replace('-', '_').replace('.', '').replace(':', '').replace(' ', '').replace('.jpg', '').replace('.png', '').replace('.jpeg', '').replace('.gif', '')
            file_loc = MEDIA_ROOT + '/photos/' + file_name
            destination = open(file_loc, 'wb+')
            destination.write(request.raw_post_data)
            destination.close()
            
            thumbnail_size_name = file_name + '_130.jpg'
            large_size_name = file_name + '_720.jpg'
            
            image = Image.open(file_loc)
            size = 130, 130
            image.thumbnail(size)
            image.save(file_loc + '_130.jpg', 'JPEG', quality=90)
            image = Image.open(file_loc)
            size = 700, 700
            image.thumbnail(size)
            image.save(file_loc + '_720.jpg', 'JPEG', quality=90)
            
            s = S3Bucket('portrit_photos', access_key=AWS_KEY, secret_key=AWS_SECRET_KEY)
            thumbnail = open(file_loc + '_130.jpg', 'rb+')
            s.put(thumbnail_size_name, thumbnail.read(), acl="public-read")
            thumbnail.close()
            large_image = open(file_loc + '_720.jpg', 'rb+')
            s.put(large_size_name, large_image.read(), acl="public-read")
            large_image.close()

            s3_url = "http://portrit_photos.s3.amazonaws.com/"
            photo = Photo(portrit_photo=True, thumbnail_src=(s3_url+thumbnail_size_name), large_src=(s3_url+large_size_name),active=True, pending=True)
            photo.save()
            os.remove(file_loc)
            os.remove(file_loc + '_130.jpg')
            os.remove(file_loc + '_720.jpg')
            
            data = {'success': True, }#'id': photo.id, 'photo_thumbnail': photo.photo.thumbnail.absolute_url, 'photo_medium': photo.photo.extra_thumbnails['medium'].absolute_url}
    except:
        pass
    data = json.dumps(data)
    return HttpResponse(data, mimetype='text/html')
    
def mark_photos_live(request):
    data = False
    try:
        photo_id_list = request.POST.get('ids')
        photo_id_list = photo_id_list.split(',')
        photos = Photo.objects.filter(id__in=photo_id_list).update(pending=False)
        data = {'photo_ids': photo_id_list}
    except:
        pass
    data = json.dumps(data)
    return HttpResponse(data, mimetype='text/html')