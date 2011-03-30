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

# from main.models import Portrit_User, FB_User, Album, Photo, Nomination, Nomination_Category, Comment, \
#                         Notification, Notification_Type, User_Following, User_Followers

from main.documents import *

from settings import ENV, FACEBOOK_APP_ID, FACEBOOK_APP_SECRET, NODE_SOCKET, NODE_HOST

from portrit_fb import Portrit_FB
from nomination_views import serialize_noms, serialize_nom
from datetime import datetime
from itertools import chain
import facebook, json, socket, time
from api_views import check_access_token, get_user_from_access_token

@check_access_token
def init_app(request):
    data = [ ]
    PAGE_SIZE = 10
    access_token = request.GET.get('access_token')
    
    try:
        user = get_user_from_access_token(access_token)
        friends = user.get_following()

        nominations = Nomination.objects.filter(
            Q(nominatee__in=friends) |
            Q(tagged_users__in=friends) |
            Q(nominatee=user) |
            Q(nominator=user),
            won=False, active=True)[:PAGE_SIZE]
        
        notification_count = len(Notification.objects.filter(owner=user, read=False, active=True))
        data = {
            'noms': serialize_noms(nominations),
            'notification_count': notification_count,
        }
                   
    except Exception, err:
        print err
    
    data = simplejson.dumps(data)
    return HttpResponse(data, mimetype='application/json')