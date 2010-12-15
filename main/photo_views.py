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

from main.models import Portrit_User, FB_User, Album, Photo, Nomination, Nomination_Category, Comment, \
                        Notification, Notification_Type
from settings import ENV, MEDIA_ROOT, FACEBOOK_APP_ID, FACEBOOK_APP_SECRET, NODE_SOCKET

from portrit_fb import Portrit_FB

from itertools import chain
from datetime import datetime
import facebook, json, socket, time, os

def upload_photo(request):
    data = False
    try:
        cookie = facebook.get_user_from_cookie(
            request.COOKIES, FACEBOOK_APP_ID, FACEBOOK_APP_SECRET)
        if cookie:
            fb_user = FB_User.objects.get(fid=int(cookie["uid"]))
            file = request.FILES['photo']
            
            file_name = str(datetime.now()).replace('-', '_').replace('.', '').replace(':', '').replace(' ', '') + '.jpg'
            file_loc = MEDIA_ROOT + '/photos/' + file_name
            destination = open(file_loc, 'wb+')
            for chunk in file.chunks():
                destination.write(chunk)
        
            destination.close()
            orig_file_loc = file_loc
            file_loc = 'photos/' + file_name
            photo = Photo(photo=file_loc, active=True, pending=True)
            photo.save()
            
            #gernerate photo thumbs
            photo.save_thumbnails()
            # os.remove(orig_file_loc)
            
            data = {'id': photo.id, 'photo_thumbnail': photo.photo.thumbnail.absolute_url, 'photo_medium': photo.photo.extra_thumbnails['medium'].absolute_url}
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