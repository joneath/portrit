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

def init_app(request):
    data = [ ]
    PAGE_SIZE = 10
    fb_user = request.GET.get('fb_user')
    
    try:
        fb_user = FB_User.objects.get(fid=int(fb_user))
        user = fb_user.get_portrit_user()
        friends = fb_user.friends.all()
        user_recent_stream = cache.get(str(fb_user.fid) + '_iphone_recent_stream')
        if user_recent_stream == None:
            nominations = Nomination.objects.select_related().filter(
                Q(nominatee__in=friends) |
                Q(nominatee=fb_user) |
                Q(nominator=fb_user),
                won=False, active=True).distinct('id').order_by('-created_date')[:PAGE_SIZE]
                
            notification_count = user.notifications.select_related().filter(active=True, read=False).order_by('-created_date').count()
            
            data = {
                'noms': serialize_noms(nominations),
                'notification_count': notification_count,
            }
            
            cache.set(str(fb_user.fid) + '_iphone_recent_stream', data, 60*5)
        else:
            data = user_recent_stream
            
    except:
        pass
    
    data = simplejson.dumps(data)
    return HttpResponse(data, mimetype='application/json')