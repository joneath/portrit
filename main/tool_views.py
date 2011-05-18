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

def share(request, template='tools/share.html'):
    path = request.GET.get('source')
    
    payload = {'path': path}
    return render_to_response(template, payload, context_instance=RequestContext(request))