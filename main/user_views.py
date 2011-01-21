from django.shortcuts import render_to_response, get_object_or_404, redirect
from django.http import HttpRequest, HttpResponse, HttpResponseRedirect, HttpResponseForbidden, HttpResponseNotFound
from django.template import RequestContext
from django.core import serializers
from django.utils import simplejson
from django.contrib.auth.decorators import login_required
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.db.models import Q

from main.models import Portrit_User, FB_User, Album, Photo, Nomination, Nomination_Category, Comment, \
                        Notification, Notification_Type
from settings import ENV, FACEBOOK_APP_ID, FACEBOOK_APP_SECRET

from portrit_fb import Portrit_FB
from notification_views import get_active_notifications
from nomination_views import get_recent_stream, serialize_noms

from datetime import datetime
import facebook, time

def login_fb_user(request):
    data = False
    cookie = facebook.get_user_from_cookie(
        request.COOKIES, FACEBOOK_APP_ID, FACEBOOK_APP_SECRET)
    if cookie:
        user = None
        data = True
        first = False
        try:
            fb_user = FB_User.objects.get(fid=int(cookie["uid"]))
            user = Portrit_User.objects.get(fb_user=fb_user)
        except:
            pass
        if not user:
            graph = facebook.GraphAPI(cookie["access_token"])
            profile = graph.get_object("me")
            fb_user, created = FB_User.objects.get_or_create(fid=str(profile["id"]))
                
            user = Portrit_User(fb_user=fb_user, name=profile['name'],
                        access_token=cookie["access_token"])
            user.save()
            
            for winning_nom in fb_user.winning_noms.all():
                notification_type = Notification_Type.objects.get(name="nom_won")
                notification = Notification(source=winning_nom.nominatee, nomination=winning_nom, notification_type=notification_type)
                notification.save()
                user.notifications.add(notification)
            
            first = True
            
            portrit = Portrit_FB(graph, fb_user, cookie["access_token"])
            portrit.load_user_friends()
            
        elif user.access_token != cookie["access_token"]:
            user.access_token = cookie["access_token"]
            user.save()
            graph = facebook.GraphAPI(cookie["access_token"])
            portrit = Portrit_FB(graph, fb_user, cookie["access_token"])
            portrit.load_user_friends(True)
            
        data = get_user_data(user)
        data['first'] = first
    
    data = simplejson.dumps(data) 
    return HttpResponse(data, mimetype='application/json')
    
def logout_user(request):
    data = True
    logout(request)
    data = simplejson.dumps(data)
    return HttpResponse(data, mimetype='application/json')
    
def skip_tut(request):
    data = False
    cookie = facebook.get_user_from_cookie(
        request.COOKIES, FACEBOOK_APP_ID, FACEBOOK_APP_SECRET)
    if cookie:
        fb_user = FB_User.objects.get(fid=int(cookie["uid"]))
        user = fb_user.portrit_fb_user.all()[0]
        user.tutorial_completed = True
        user.save()
        data = True
        
    data = simplejson.dumps(data)
    return HttpResponse(data, mimetype='application/json')
    
def change_user_notifications(request):
    data = False
    cookie = facebook.get_user_from_cookie(
        request.COOKIES, FACEBOOK_APP_ID, FACEBOOK_APP_SECRET)
    if cookie:
        allow_notifications = request.POST.get('allow_notifications')
        fb_user = FB_User.objects.get(fid=int(cookie["uid"]))
        user = fb_user.portrit_fb_user.all()[0]
        
        print allow_notifications
        
        if allow_notifications == 'true':
            user.allow_notifications = True
        else:
            user.allow_notifications = False
            
        user.save()
        data = True
        
    data = simplejson.dumps(data)
    return HttpResponse(data, mimetype='application/json')
    
def get_more_recent_stream(request):
    data = []
    create_time = request.GET.get('create_time')
    create_time = datetime.fromtimestamp(float(create_time))
    # print create_time
    cookie = facebook.get_user_from_cookie(
        request.COOKIES, FACEBOOK_APP_ID, FACEBOOK_APP_SECRET)
    if cookie:
        try:
            fb_user = FB_User.objects.get(fid=int(cookie["uid"]))
            data = get_recent_stream(fb_user, create_time)
        except:
            pass
    
    data = simplejson.dumps(data)
    return HttpResponse(data, mimetype='application/json')
    
def get_user_data(user):
    data = False
    try:
        notifications = get_active_notifications(user)
        stream = get_user_stream(user.fb_user)
        tut_counts = False
        if not user.tutorial_completed:
            tut_counts = user.get_tutorial_counts()
            
        portrit_friends_objs = user.fb_user.friends.filter(portrit_fb_user__isnull=False)
        portrit_friends = [ ]
        for friend in portrit_friends_objs.iterator():
            portrit_friends.append({'id': friend.fid, 'name': friend.portrit_fb_user.all()[0].name})
        
        data = {
            'notifications': notifications,
            'stream': stream,
            'portrit_friends': portrit_friends,
            'allow_notifications': user.allow_notifications,
            'tut_counts': tut_counts,
        }
    except:
        pass
    
    return data
    
def get_user_stream(fb_user):
    data = False
    PAGE_SIZE = 8
    try:
        friends = fb_user.friends.all()
        nom_cats = Nomination_Category.objects.all()
        data = [ ]
        cat_count = 0
        for cat in nom_cats.iterator():
            try:
                data.append({
                    'cat_name': cat.name,
                    'page_size': PAGE_SIZE,
                    'noms': [ ],
                })
                
                top_noms = cat.nomination_set.select_related().filter(
                    Q(nominatee__in=friends) |
                    Q(nominatee=fb_user) |
                    Q(nominator=fb_user),
                    active=True, won=False).distinct('id').order_by('-current_vote_count', '-created_date')#[:PAGE_SIZE]
                for nom in top_noms.iterator():
                    comment_count = nom.get_comment_count()
                    votes = [ ]
                    for vote in nom.votes.all().iterator():
                        votes.append({
                            'vote_user': vote.fid,
                            'vote_name': vote.portrit_fb_user.all()[0].name,
                        })
                    data[cat_count]['noms'].append({
                        'id': nom.id,
                        'nomination_category': nom.nomination_category.name,
                        'nominator': nom.nominator.fid,
                        'nominatee': nom.nominatee.fid,
                        'created_time': time.mktime(nom.created_date.utctimetuple()),
                        'won': nom.won,
                        'time_remaining': nom.get_time_remaining(),
                        'photo': nom.get_photo(),
                        'caption': nom.caption,
                        'comments': False,
                        'comment_count': comment_count,
                        'vote_count': nom.current_vote_count,
                        'votes': votes,
                    })
                cat_count += 1
            except:
                top_nom = None
        data = sorted(data, key=lambda k: len(k['noms']), reverse=True)
        if data.count() == 0:
            data = "empty"
    except:
        pass
    data = simplejson.dumps(data) 
    return data
    
def get_user_win_stream(request):
    data = [ ]
    cookie = facebook.get_user_from_cookie(
        request.COOKIES, FACEBOOK_APP_ID, FACEBOOK_APP_SECRET)
    if cookie:
        try:
            fb_user = FB_User.objects.get(fid=int(cookie["uid"]))
            winning_noms = Nomination.objects.filter(nominatee=fb_user, won=True).order_by('-created_date')
            data = serialize_noms(winning_noms)
        except:
            pass
    
    data = simplejson.dumps(data)
    return HttpResponse(data, mimetype='application/json')
    
def get_user_trophies(request):
    data = [ ]
    user = request.GET.get('user')
    user = FB_User.objects.get(fid=user)
    
    nom_cats = Nomination_Category.objects.filter(nomination__nominatee=user, nomination__won=True).distinct('id')
    cat_count = 0
    for cat in nom_cats.iterator():
        winning_noms = cat.nomination_set.select_related().filter(nominatee=user, won=True)
        data.append({
            'cat_name': cat.name,
            'count': winning_noms.count(),
            'noms': [ ],
        })
        
        # for nom in winning_noms.iterator():
        #     comment_count = nom.get_comment_count()
        #     votes = [ ]
        #     for vote in nom.votes.all().iterator():
        #         votes.append({
        #             'vote_user': vote.fid,
        #             'vote_name': vote.portrit_fb_user.all()[0].name,
        #         })
        #     data[cat_count]['noms'].append({
        #         'id': nom.id,
        #         'nomination_category': nom.nomination_category.name,
        #         'nominator': nom.nominator.fid,
        #         'nominatee': nom.nominatee.fid,
        #         'won': nom.won,
        #         'time_remaining': nom.get_time_remaining(),
        #         'photo': nom.get_photo(),
        #         'caption': nom.caption,
        #         'comments': False,
        #         'comment_count': comment_count,
        #         'vote_count': nom.current_vote_count,
        #         'votes': votes,
        #     })
        # cat_count += 1
    
    data = simplejson.dumps(data)
    return HttpResponse(data, mimetype='application/json')