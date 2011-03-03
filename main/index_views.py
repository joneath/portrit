from django.shortcuts import render_to_response, get_object_or_404, redirect
from django.http import HttpRequest, HttpResponse, HttpResponseRedirect, HttpResponseForbidden, HttpResponseNotFound
from django.template import RequestContext
from django.core import serializers
from django.utils import simplejson
from django.contrib.auth.decorators import login_required
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User

from main.models import Portrit_User, FB_User, Album, Photo, Nomination, Nomination_Category
from settings import ENV, FACEBOOK_APP_ID, FACEBOOK_APP_SECRET

import facebook, re

def index(request, template='index.html'):    
    production_code = True
    analytics = True

    if ENV == 'LOCAL':
        production_code = False
        analytics = None
        
    title = "Portrit"
    fb_title  = "Portrit"
        
    if request.GET.get('nom_id'):
        nom_id = request.GET.get('nom_id')
        try:
            nom = Nomination.objects.get(id=int(nom_id))
            title = nom.nominatee.get_name() + '\'s Photo Nominated For ' + nom.nomination_category.name
            fb_title = title
            print fb_title
        except:
            pass
            
    payload = {'analytics': analytics, 'production_code': production_code, 'title': title, 'fb_title': fb_title}
    return render_to_response(template, payload, context_instance=RequestContext(request))

def robots(request):
    robots = "#****************************************************************************\n"
    robots += "# robots.txt\n"
    robots += "#****************************************************************************\n"
    robots += "\n"
    robots += "User-agent: *\n"  
    robots += "Disallow: /admin/"
    response = HttpResponse(robots, mimetype='text/plain')
    return response
    
def submit_feedback(request):
    cookie = facebook.get_user_from_cookie(
        request.COOKIES, FACEBOOK_APP_ID, FACEBOOK_APP_SECRET)
    if cookie:
        message = request.POST.get('message')
        
        from django.core.mail import EmailMessage
        subject = 'User Feedback'
        html_content = message
        from_email = 'no-reply@joneath.webfactional.com'
        msg = EmailMessage(subject, html_content, from_email, ['feedback@joneath.webfactional.com'])
        msg.send()
        
        data = simplejson.dumps(True)
        return HttpResponse(data, mimetype='application/json')
        
def contact_portrit(request):
    cookie = facebook.get_user_from_cookie(
        request.COOKIES, FACEBOOK_APP_ID, FACEBOOK_APP_SECRET)
    if cookie:
        from_email = request.POST.get('email')
        reason = request.POST.get('reason')
        message = request.POST.get('message')
        
        to_email_dict = {
            '1': 'support@joneath.webfactional.com',
            '2': 'feedback@joneath.webfactional.com',
            '3': 'abuse@joneath.webfactional.com',
            '4': 'contact@joneath.webfactional.com',
            '5': 'press@joneath.webfactional.com',
            '6': 'advertise@joneath.webfactional.com',
        }
        to_email = to_email_dict[reason]
        
        from django.core.mail import EmailMessage
        subject = 'Contact Form'
        html_content = message
        msg = EmailMessage(subject, html_content, from_email, [to_email])
        msg.send()
        
        data = simplejson.dumps(True)
        return HttpResponse(data, mimetype='application/json')
        
def submit_bug_report(request):
    cookie = facebook.get_user_from_cookie(
        request.COOKIES, FACEBOOK_APP_ID, FACEBOOK_APP_SECRET)
    if cookie:
        from_email = request.POST.get('email')
        where = request.POST.get('where')
        message = request.POST.get('message')
        os = request.POST.get('os')
        browser = request.POST.get('browser')
        
        from django.core.mail import EmailMessage
        subject = 'New User Bug Report'
        html_content =  '<h2>FROM: ' + from_email + '</h2>' \
                        '<h2>WHERE: ' + where + '</h2>' \
                        '<h2>OS: ' + os + '</h2>' \
                        '<h2>BROWSER: ' + browser + '</h2>' \
                        '<p>' + message + '</p>'
                        
        msg = EmailMessage(subject, html_content, from_email, ['bugs@joneath.webfactional.com'])
        msg.content_subtype = "html"
        msg.send()
        
        data = simplejson.dumps(True)
        return HttpResponse(data, mimetype='application/json')
        
def handle404(request, template="404.html"):
    analytics = True
    
    if ENV == 'LOCAL':
        analytics = None
    payload = {'analytics': analytics,}
    return render_to_response(template, payload, context_instance=RequestContext(request))

def handle500(request, template="500.html"):
    analytics = True
    
    if ENV == 'LOCAL':
        analytics = None
    payload = {'analytics': analytics,}
    return render_to_response(template, payload, context_instance=RequestContext(request))