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

from datetime import datetime
import facebook, json, socket, time

def get_photo(request):
    data = False
    photo_id = request.GET.get('photo_id')
    try:
        photo = Photo.objects.get(id=photo_id)
        owner = photo.get_portrit_user()
        data = {
            'name': owner.name,
            'fid': owner.fb_user.fid,
            'photo': photo.get_portrit_photo(),
        }
    except:
        pass
    data = json.dumps(data)
    return HttpResponse(data, mimetype='text/html')
    
def get_nom(request):
    data = False
    nom_id = request.GET.get('nom_id')
    try:
        nom = Nomination.objects.get(id=nom_id)
        owner = nom.nominatee
        owner_portrit_user = owner.get_portrit_user()
        name = ''
        if owner_portrit_user:
            name = owner_portrit_user.name
            
        data = {
            'name': name,
            'fid': owner.fid,
            'nom_cat': nom.nomination_category.name,
            'photo': nom.get_photo(),
        }
    except:
        pass
    data = json.dumps(data)
    return HttpResponse(data, mimetype='text/html')