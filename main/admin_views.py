from django.shortcuts import render_to_response, get_object_or_404, redirect
from django.http import HttpRequest, HttpResponse, HttpResponseRedirect, HttpResponseForbidden, HttpResponseNotFound
from django.template import RequestContext
from django.core import serializers
from django.utils import simplejson
from django.contrib.auth.decorators import login_required
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User

from main.documents import *
from settings import ENV, FACEBOOK_APP_ID, FACEBOOK_APP_SECRET

def flags(request, template='admin/flags.html'):
    production_code = True
    test_code = False
    analytics = True

    if ENV == 'LOCAL':
        production_code = False
        analytics = None
    elif ENV == 'TEST':
        production_code = False
        test_code = True
        analytics = None
        
    title = "Portrit"
    
    payload = {'analytics': analytics, 'production_code': production_code, 'test_code': test_code, 'title': title, 'fb_title': fb_title}
    return render_to_response(template, payload, context_instance=RequestContext(request))