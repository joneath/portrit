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

def mobile(request):
	device = {}

	ua = request.META.get('HTTP_USER_AGENT', '').lower()

	if ua.find("iphone") > 0:
		device['iphone'] = "iphone" + re.search("iphone os (\d)", ua).groups(0)[0]

	if ua.find("ipad") > 0:
		device['ipad'] = "ipad"

	if ua.find("android") > 0:
		device['android'] = "android" + re.search("android (\d\.\d)", ua).groups(0)[0].translate(None, '.')

	if ua.find("blackberry") > 0:
		device['blackberry'] = "blackberry"

	if ua.find("windows phone os 7") > 0:
		device['winphone7'] = "winphone7"

	if ua.find("iemobile") > 0:
		device['winmo'] = "winmo"

	if not device:			# either desktop, or something we don't care about.
		device['baseline'] = "baseline"

	# spits out device names for CSS targeting, to be applied to <html> or <body>.
	device['classes'] = " ".join(v for (k,v) in device.items())

	return {'device': device }

def index(request, template='index.html'):    
    production_code = True
    analytics = True
    
    if ENV == 'LOCAL' or ENV == 'TEST':
        production_code = False
        analytics = None
    mobile_dev = mobile(request)
    mobile_var = None
    try:
        if mobile_dev['device']['ipad']:
            mobile_var = 'ipad'
    except:
        pass
        
    print mobile_var
    
    payload = {'analytics': analytics, 'mobile_var': mobile_var, 'production_code': production_code}
    return render_to_response(template, payload, context_instance=RequestContext(request))
# def add_email(request):
#     data = False
#     
#     try:
#         email = request.POST.get('email')
#         try:
#             exist = Email_Invite.objects.filter(email=email).count()
#             if exist > 0:
#                 data = 'exists'
#             else:
#                 invite = Email_Invite(email=email)
#                 invite.save()
#                 
#                 from django.core.mail import EmailMessage
#                 subject = 'Thanks for your interest'
#                 html_content = 'Hey there,\n\nThanks for your interest in what we\'re up to. We\'ve got your email\non file now, and we\'ll let you know when we\'re ready to show\nsomething.\n\nUntil then,\nThe Portrit crew'
#                 from_email = 'no-reply@portrit.com'
#                 msg = EmailMessage(subject, html_content, from_email, [email])
#                 msg.send()
#                 
#                 data = True
#         except: 
#             invite = Email_Invite(email=email)
#             invite.save()
#             
#             from django.core.mail import EmailMessage
#             subject = 'Thanks for your interest'
#             html_content = 'Hey there,\n\nThanks for your interest in what we\'re up to. We\'ve got your email\non file now, and we\'ll let you know when we\'re ready to show\nsomething.\n\nUntil then,\nThe Portrit crew'
#             from_email = 'no-reply@portrit.com'
#             msg = EmailMessage(subject, html_content, from_email, [email])
#             msg.send()
#             
#             data = True
#         
#     except:
#         pass    
#     
#     data = simplejson.dumps(data)
#     return HttpResponse(data, mimetype='application/json')
#     
# def check_account(request):
#     data = { }
#     user = None
#     account = ''
#     uid = request.GET.get('uid')
#     
#     try:
#         user = FB_User.objects.get(fid=uid)
#         
#         if user.social and not user.pro:
#             account = 'SOCIAL'
#         elif user.pro:
#             account = 'PLUS'
#         else:
#             account = 'BASIC'
#         
#     except FB_User.DoesNotExist:
#         try:
#             email_invite = Email_Invite.objects.get(user=request.user)
#             print email_invite
#             if email_invite.key:
#                 if email_invite.key.starting_account_level == 1:
#                     user = FB_User(fid=uid, pro=False, social=False)
#                     user.save()
#                     account = 'BASIC'
#                 if email_invite.key.starting_account_level == 2:
#                     user = FB_User(fid=uid, pro=False, social=True)
#                     user.save()
#                     account = 'SOCIAL'
#                 if email_invite.key.starting_account_level == 3:
#                     user = FB_User(fid=uid, pro=True, social=False)
#                     user.save()
#                     account = 'PLUS'
#             else:
#                 user = FB_User(fid=uid, pro=False, social=False)
#                 user.save()
#         except:
#             user = FB_User(fid=uid, pro=False, social=False)
#             user.save()
#             account = 'BASIC'
#         
#     
#     data = parse_data(account, user)    
#     
#     return HttpResponse(data, mimetype='application/json')
#     
# 
# def hide_friend(request):
#     data = False
#     
#     user_fid = request.POST.get('user_fid')
#     friend_fid = request.POST.get('friend_fid')
# 
#     try:
#         user = FB_User.objects.get(fid=user_fid)
#         heart_friend = Favorite_Friend.objects.get(fid=friend_fid)
#         user.favorite_friends.remove(heart_friend)
#         data = True
#     except:
#         pass
#     
#     try:
#         user = FB_User.objects.get(fid=user_fid)
#         try:
#             hidden_friend = Hidden_Friend.objects.get(fid=friend_fid)
#         except:    
#             hidden_friend = Hidden_Friend(fid=friend_fid)
#             hidden_friend.save()
#             
#         user.hidden_friends.add(hidden_friend)
#         data = True
#     except:
#         pass
#     
#     
#     data = simplejson.dumps(data)
#     return HttpResponse(data, mimetype='application/json')
#     
# def show_friend(request):
#     data = False
#     
#     user_fid = request.POST.get('user_fid')
#     friend_fid = request.POST.get('friend_fid')
#     
#     try:
#         user = FB_User.objects.get(fid=user_fid)
#         hidden_friend = Hidden_Friend.objects.get(fid=friend_fid, fb_user__fid=user_fid)
#         user.hidden_friends.remove(hidden_friend)
#         data = True
#     except:
#         pass
#     
#     
#     data = simplejson.dumps(data)
#     return HttpResponse(data, mimetype='application/json')
#     
# def heart_friend(request):
#     data = False
#     
#     user_fid = request.POST.get('user_fid')
#     friend_fid = request.POST.get('friend_fid')
#     
#     try:
#         user = FB_User.objects.get(fid=user_fid)
#         try:
#             heart_friend = Favorite_Friend.objects.get(fid=friend_fid)
#         except:
#             heart_friend = Favorite_Friend(fid=friend_fid)
#             heart_friend.save()
#         user.favorite_friends.add(heart_friend)
#         data = True
#     except:
#         pass
#     
#     
#     data = simplejson.dumps(data)
#     return HttpResponse(data, mimetype='application/json')
#     
# def unheart_friend(request):
#     data = False
# 
#     user_fid = request.POST.get('user_fid')
#     friend_fid = request.POST.get('friend_fid')
# 
#     try:
#         user = FB_User.objects.get(fid=user_fid)
#         heart_friend = Favorite_Friend.objects.get(fid=friend_fid)
#         user.favorite_friends.remove(heart_friend)
#         data = True
#     except:
#         pass
# 
# 
#     data = simplejson.dumps(data)
#     return HttpResponse(data, mimetype='application/json')

# def parse_data(account, user):
#     data = { }
#     
#     data['account'] = account
#     data['referrals'] = user.referrals
#     data['albums'] = [ ]
#     data['favorite_friends'] = { }
#     data['hidden_friends'] = { }
# 
#     for favorite in user.favorite_friends.all():
#         data['favorite_friends'][favorite.fid] = True
#         
#     for hidden in user.hidden_friends.all():
#             data['hidden_friends'][hidden.fid] = True
#         
#     for album in user.albums.all():
#         photos = [ ]
#         
#         for photo in album.photos.all():
#             photos.append(photo.fid)
#         
#         data['albums'].append({'fid': album.fid, 'name': album.name, 'photos': photos})
#     
#     return simplejson.dumps(data)
#     
# def create_account_index(request, template='create_account.html'):
#     if request.user.is_authenticated():
#         return redirect('index')
#     
#     production_code = True
#     analytics = True
#     if ENV == 'LOCAL':
#         production_code = False
#         analytics = None
#         
#     payload = {'analytics': analytics, 'production_code': production_code, 'login': login}
#     return render_to_response(template, payload, context_instance=RequestContext(request))
#     
# def create_account(request):
#     data = False
#     beta_key = request.POST.get('key')
#     email = request.POST.get('email')
#     
#     try:
#         key = Key.objects.get(key=beta_key)
#         if key.remaining_uses() > 0 and key.active:
#             key.uses += 1
#             try:
#                 try:
#                     email_exist = Email_Invite.objects.get(email=email)
#                     try:
#                         #Email invite exists but user does not
#                         email_exist.invited = True
#                         user = User.objects.create_user(email, email, 'beta')
#                         user = authenticate(username=email, password='beta')
#                         login(request, user)
#                         email_exist.save()
#                         key.save()
#                         data = True
#                     except:
#                         #Email invite exists as well as user. No need fore key
#                         data = 'exists'
#                 except:
#                     try:
#                         #User already exists
#                         user_exist = User.objects.get(email=email)
#                         data = 'exists'
#                     except:
#                         #New user, key good
#                         user = User.objects.create_user(email, email, 'beta')
#                         email_invite = Email_Invite(email=email, invited=True, user=user, key=key)
#                         email_invite.save()
#             
#                         user = authenticate(username=email, password='beta')
#                         login(request, user)
#             
#                         key.save()
#                         data = True
#             except:
#                 pass
#             
#         elif key.remaining_uses <= 0:
#             data = 'finished'
#         elif not key.active:
#             data = 'non-active'
#     except:
#         pass
#     
#     data = simplejson.dumps(data)
#     return HttpResponse(data, mimetype='application/json')
#     
# def check_key(request):
#     data = False
#     beta_key = request.POST.get('key')
#     
#     try:
#         key = Key.objects.get(key=beta_key)
#         if key.remaining_uses() > 0 and key.active:
#             data = True
#         elif key.remaining_uses() <= 0 and key.active:
#             data = 'finished'
#         elif not key.active:
#             data = 'non-active'
#     except:
#         pass
#     
#     data = simplejson.dumps(data)
#     return HttpResponse(data, mimetype='application/json')
    
def submit_feedback(request):
    if request.user.is_authenticated():
        message = request.POST.get('message')
        
        from django.core.mail import EmailMessage
        subject = 'User Feedback'
        html_content = message
        from_email = 'no-reply@portrit.com'
        msg = EmailMessage(subject, html_content, from_email, ['feedback@portrit.com'])
        msg.send()
        
        data = simplejson.dumps(True)
        return HttpResponse(data, mimetype='application/json')
        
def contact_portrit(request):
    if request.user.is_authenticated():
        from_email = request.POST.get('email')
        reason = request.POST.get('reason')
        message = request.POST.get('message')
        
        to_email_dict = {
            '1': 'support@portrit.com',
            '2': 'feedback@portrit.com',
            '3': 'abuse@portrit.com',
            '4': 'contact@portrit.com',
            '5': 'press@portrit.com',
            '6': 'advertise@portrit.com',
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
    if request.user.is_authenticated():
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
                        
        msg = EmailMessage(subject, html_content, from_email, ['bugs@portrit.com'])
        msg.content_subtype = "html"
        msg.send()
        
        data = simplejson.dumps(True)
        return HttpResponse(data, mimetype='application/json')
        
def handle404(request, template="404.html"):
    payload = {}
    return render_to_response(template, payload, context_instance=RequestContext(request))

def handle500(request, template="500.html"):
    payload = {}
    return render_to_response(template, payload, context_instance=RequestContext(request))