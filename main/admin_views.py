from django.shortcuts import render_to_response, get_object_or_404, redirect
from django.http import HttpRequest, HttpResponse, HttpResponseRedirect, HttpResponseForbidden, HttpResponseNotFound, Http404
from django.template import RequestContext
from django.core import serializers
from django.contrib.auth.decorators import login_required
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User

from main.documents import *
from settings import ENV, FACEBOOK_APP_ID, FACEBOOK_APP_SECRET

import json, facebook

ADMINS = ['joneath', 'infinixd']

def check_admin(function=None):
    def _dec(view_func):
        def _view(request, *args, **kwargs):
            try:
                cookie = facebook.get_user_from_cookie(
                    request.COOKIES, FACEBOOK_APP_ID, FACEBOOK_APP_SECRET)
                    
                if cookie:
                    user = Portrit_User.objects.get(fb_user__fid=int(cookie["uid"]))
                    if user.username in ADMINS:
                        return view_func(request, *args, **kwargs)
                        
            except Exception, err:
                print err
                
            raise Http404

        _view.__name__ = view_func.__name__
        _view.__dict__ = view_func.__dict__
        _view.__doc__ = view_func.__doc__

        return _view
        
    if function is None:
        return _dec
    else:
        return _dec(function)

def get_payload():
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
    
    payload = {'analytics': analytics, 'production_code': production_code, 'test_code': test_code}
    
    return payload

@check_admin
def flags(request, template='admin/flags.html'):
    if request.method == "GET":
        payload = get_payload()

        flags = Photo_Flag.objects.filter(active=True)
        payload['flags'] = flags

        return render_to_response(template, payload, context_instance=RequestContext(request))
    else:
        data = False
        try:
            id = request.POST.get('id')
            method = request.POST.get('method')
            
            flag = Photo_Flag.objects.get(id=id)
            
            if method == 'approve':
                flag.active = False
                flag.photo.active = True
                flag.photo.save()
            elif method == 'deny':
                flag.active = False
                flag.photo.active = False
                flag.photo.save()
                
                Nomination.objects.filter(photo=flag.photo).update(set__active=False, set__removed=True)
                
            flag.save()
            
            data = True
        except:
            pass
        
        data = json.dumps(data) 
        return HttpResponse(data, mimetype='application/json')