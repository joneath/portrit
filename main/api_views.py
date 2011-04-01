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
#                         Notification, Notification_Type, User_Following, User_Followers, GPS_Data, Photo_Flag

from main.documents import *

from settings import ENV, FACEBOOK_APP_ID, FACEBOOK_APP_SECRET, NODE_SOCKET, NODE_HOST

from portrit_fb import Portrit_FB
from nomination_views import get_target_friends, serialize_noms, serialize_nom, get_target_friends
from datetime import datetime
from itertools import chain
import facebook, json, socket, time

def check_access_token(function=None):
    def _dec(view_func):
        def _view(request, *args, **kwargs):
            try:
                if request.method == 'GET':
                    access_token = request.GET.get('access_token')
                else:
                    access_token = request.POST.get('access_token')
                    
                if access_token:
                    user = Portrit_User.objects.get(Q(fb_user__mobile_access_token=access_token) | Q(fb_user__access_token=access_token))
                    if user.fb_user.mobile_access_token == access_token or user.fb_user.access_token == access_token:
                        return view_func(request, *args, **kwargs)
            except Exception, err:
                print err
                
            return HttpResponse(json.dumps({'access_token': 'invalid'}), mimetype='application/json')

        _view.__name__ = view_func.__name__
        _view.__dict__ = view_func.__dict__
        _view.__doc__ = view_func.__doc__

        return _view
        
    if function is None:
        return _dec
    else:
        return _dec(function)

def get_user_from_access_token(token):
    try:
        if token:
            user = Portrit_User.objects.get(Q(fb_user__mobile_access_token=token) | Q(fb_user__access_token=token))
            return user
    except Exception, err:
        print err
        
    return None

def sign_in_create(request):
    data = [ ]
    
    fb_user = request.POST.get('fb_user')
    access_token = request.POST.get('access_token')
    
    user = Portrit_User.objects.filter(fb_user__fid=int(fb_user))
    
    if len(user) == 0:
        graph = facebook.GraphAPI(access_token)
        try:
            profile = graph.get_object("me")
            fb_user = FB_User(fid=profile['id'], mobile_access_token=access_token)
            
            email = None
            try:
                email = profile['email']
            except Exception, err:
                print err
            
            portrit_user = Portrit_User(fb_user=fb_user, 
                                        name=profile['name'], 
                                        email=email,
                                        allow_winning_fb_album=False)
            portrit_user.save()
            portrit = Portrit_FB(graph, portrit_user, access_token)
            portrit.load_user_friends(True)
            
            data = {'auth': 'valid',
                    'new': True,
                    'access_token': access_token}
        except:
            data = {'auth': 'invalid'}
    else:
        graph = facebook.GraphAPI(access_token)
        try:
            profile = graph.get_object("me")
            new = False
            email = None
            try:
                email = profile['email']
            except Exception, err:
                print err
            
            user = user[0]
            if not user.fb_user.mobile_access_token:
                user.fb_user.mobile_access_token = access_token
                user.save()
            else:
                access_token = user.fb_user.mobile_access_token
            
            data = {'auth': 'valid',
                    'new': new,
                    'access_token': access_token}
        except:
            data = {'auth': 'invalid'}
    
    data = simplejson.dumps(data)
    return HttpResponse(data, mimetype='application/json')
    
def check_username_availability(request):
    data = False
    username = request.POST.get('username')
    
    try: 
        Portrit_User.objects.get(username__iexact=username)
        data = True
    except Exception, err:
        print err
    
    data = simplejson.dumps(data)
    return HttpResponse(data, mimetype='application/json')
    
@check_access_token
def add_username(request):
    data = False
    access_token = request.POST.get('access_token')
    username = request.POST.get('username')
    post_wins_to_fb = request.POST.get('post_wins')
    
    print "here"
    
    try:
        user = get_user_from_access_token(access_token)
        print user
        user.username = username
        print user.username
        print post_wins_to_fb
        if post_wins_to_fb == '1':
            user.allow_winning_fb_album = True
        else:
            user.allow_winning_fb_album = False
        user.save()
        data = True
    except Exception, err:
        print err
    
    data = simplejson.dumps(data)
    return HttpResponse(data, mimetype='application/json')

@check_access_token
def get_recent_stream(request):
    data = [ ]
    access_token = request.GET.get('access_token')
    created_date = request.GET.get('create_date')
    new_date = request.GET.get('new_date')
    page_size = request.GET.get('page_size')
    
    if not page_size:
        page_size = 10
    
    PAGE_SIZE = int(page_size)
    try:
        portrit_user = get_user_from_access_token(access_token)
        user = portrit_user.fb_user
        friends = portrit_user.get_following()
        if created_date:
            created_date = datetime.fromtimestamp(float(created_date))
            nominations = Nomination.objects.filter(
                Q(nominatee__in=friends) |
                Q(nominatee=portrit_user) |
                Q(nominator=portrit_user),
                created_date__lt=created_date, won=False, active=True).order_by('-created_date')[:PAGE_SIZE]
        elif new_date:
            new_date = datetime.fromtimestamp(float(new_date))
            nominations = Nomination.objects.filter(
                Q(nominatee__in=friends) |
                Q(nominatee=portrit_user) |
                Q(nominator=portrit_user),
                created_date__gt=new_date, won=False, active=True).order_by('-created_date')[:PAGE_SIZE]
        else:
            nominations = Nomination.objects.filter(
                Q(nominatee__in=friends) |
                Q(nominatee=portrit_user) |
                Q(nominator=portrit_user),
                won=False, active=True).order_by('-created_date')[:PAGE_SIZE]
        
        data = serialize_noms(nominations)

    except Exception, err:
        print err
    
    data = simplejson.dumps(data)
    return HttpResponse(data, mimetype='application/json')
    
@check_access_token
def get_top_stream(request):
    data = [ ]
    PAGE_SIZE = 10
    access_token = request.POST.get('access_token')
    new_date = request.GET.get('new_date')
    
    try:
        portrit_user = get_user_from_access_token(access_token)
        user = portrit_user.fb_user
        following = user.get_following()
        if new_date:
            new_date = datetime.fromtimestamp(float(new_date))
            nominations = Nomination.objects.select_related().filter(
                Q(nominatee__in=following) |
                Q(nominatee=user) |
                Q(nominator=user),
                created_date__gt=new_date, active=True, won=False).distinct('id').order_by('-current_vote_count', '-created_date')[:PAGE_SIZE]
        else:
            nominations = Nomination.objects.select_related().filter(
                Q(nominatee__in=following) |
                Q(nominatee=user) |
                Q(nominator=user),
                active=True, won=False).distinct('id').order_by('-current_vote_count', '-created_date')[:PAGE_SIZE]
    
        data = serialize_noms(nominations)
    except Exception, err:
        print err
    
    data = simplejson.dumps(data)
    return HttpResponse(data, mimetype='application/json')
    
@check_access_token
def get_winners_stream(request):
    data = [ ]
    access_token = request.GET.get('access_token')
    create_date = request.GET.get('create_date')
    new_date = request.GET.get('new_date')
    page_size = request.GET.get('page_size')
    
    if not page_size:
        page_size = 10
    
    try:
        portrit_user = get_user_from_access_token(access_token)
        user = portrit_user.fb_user
        following = portrit_user.get_following()
        if create_date:
            create_date = datetime.fromtimestamp(float(create_date))
            winning_noms = Nomination.objects.filter(
                Q(nominatee__in=following) |
                Q(nominatee=portrit_user) |
                Q(nominator=portrit_user),
                created_date__lt=create_date, won=True).order_by('-created_date')[:page_size]
        
        elif new_date:
            new_date = datetime.fromtimestamp(float(new_date))
            winning_noms = Nomination.objects.filter(
                Q(nominatee__in=following) |
                Q(nominatee=portrit_user) |
                Q(nominator=portrit_user),
                created_date__gt=new_date, won=True).order_by('-created_date')[:page_size]
        else:
            winning_noms = Nomination.objects.filter(
                Q(nominatee__in=following) |
                Q(nominatee=portrit_user) |
                Q(nominator=portrit_user),
                won=True).order_by('-created_date')[:page_size]
        
        data = serialize_noms(winning_noms)
    except Exception, err:
        print err
    
    data = simplejson.dumps(data)
    return HttpResponse(data, mimetype='application/json')
    
def get_nom_detail(request):
    data = [ ]
    PAGE_SIZE = 10
    
    nom_id = request.GET.get('nom_id')
    cat = request.GET.get('cat')
    source = request.GET.get('source')
    community = request.GET.get('community')
    nav_selected = request.GET.get('nav_selected')
    page = request.GET.get('page')
    
    if not page:
        page = 1
    else:
        page = int(page)
        
    print nav_selected
    
    try:
        nomination = Nomination.objects.get(id=nom_id)
    except:
        nomination = None
        
    following = [ ]
    if source:
        source = Portrit_User.objects.get(username=source)
        source_following = source.get_following()
    
    if nav_selected == 'stream_active':
        cat = cat.replace('-', ' ');
        data = Nomination.objects.filter(
            Q(nominatee__in=source_following) |
            Q(tagged_users__in=source_following) |
            Q(tagged_users__in=[source]) |
            Q(nominatee=source) |
            Q(nominator=source),
            nomination_category=cat, 
            active=True, 
            won=False).order_by('-current_vote_count', '-created_date')[PAGE_SIZE * (page - 1): PAGE_SIZE * page]
            
        data = serialize_noms(data)
        
    elif nav_selected == 'stream_winners':
        data = Nomination.objects.filter(
            Q(nominatee__in=source_following) |
            Q(tagged_users__in=source_following) |
            Q(tagged_users__in=[source]) |
            Q(nominatee=source) |
            Q(nominator=source),
            won=True).order_by('-current_vote_count', '-created_date')[PAGE_SIZE * (page - 1): PAGE_SIZE * page]
            
        data = serialize_noms(data)
        
    elif nav_selected == 'community_active':
        data = [serialize_nom(nomination)]
        
    elif nav_selected == 'community_top':
        data = Nomination.objects.filter(
            nomination_category=nomination.nomination_category, 
            active=True,
            public=True,
            won=False).order_by('-current_vote_count', '-created_date')[PAGE_SIZE * (page - 1): PAGE_SIZE * page]
        
        data = serialize_noms(data)
        
    elif nav_selected == 'profile_trophies':
        data = Nomination.objects.filter(
            Q(tagged_users__in=[nomination.nominatee]) |
            Q(nominatee=nomination.nominatee),
            won=True).order_by('-current_vote_count', '-created_date')[PAGE_SIZE * (page - 1): PAGE_SIZE * page]
            
        data = serialize_noms(data)
        
    elif nav_selected == 'profile_active':
        data = Nomination.objects.filter(
            Q(tagged_users__in=[source]) |
            Q(nominatee=source),
            # nomination_category=nomination.nomination_category, 
            active=True, 
            won=False).order_by('-current_vote_count', '-created_date')[PAGE_SIZE * (page - 1): PAGE_SIZE * page]
            
        data = serialize_noms(data)
        
    else:
        data = [serialize_nom(nomination)]
    #     
    # if source:
    #     source = Portrit_User.objects.get(username=source)
    #     source_following = source.get_following()
    #     
    #     if nomination.nominatee == source or nomination.nominatee in source_following:
    #         print "connected"
    #         
    #     else:
    #         print "not connected"
    #         data = serialize_nom(nomination)
    #     
    # else:
    #     data = serialize_nom(nomination)
    
    data = simplejson.dumps(data)
    return HttpResponse(data, mimetype='application/json')
    
@check_access_token
def get_noms_in_cat(request):
    data = [ ]
    PAGE_SIZE = 10
    # user = request.GET.get('fb_user')
    access_token = request.GET.get('access_token')
    nom_id = request.GET.get('nom_id')
    page = request.GET.get('page')
    
    if not page:
        page = 1
    
    try:
        user = get_user_from_access_token(access_token)
        following = user.get_following()
        
        nom = Nomination.objects.get(id=str(nom_id))
        noms_in_cat = Nomination.objects.filter(
            Q(nominatee__in=following) |
            Q(tagged_users__in=following) |
            Q(tagged_users__in=[user]) |
            Q(nominatee=user) |
            Q(nominator=user),
            nomination_category=nom.nomination_category, 
            active=True, 
            won=False).order_by('-current_vote_count', '-created_date')[PAGE_SIZE * (page - 1): PAGE_SIZE * page]
        data = {
            'noms': serialize_noms(noms_in_cat),
            'selected_nom': serialize_nom(nom),
        }
    except Exception, err:
        print err
    
    data = simplejson.dumps(data)
    return HttpResponse(data, mimetype='application/json')
    
def get_user_wins_trophy_cat(request):
    data = [ ]
    PAGE_SIZE = 10
    user = request.GET.get('fb_user')
    nom_cat = request.GET.get('nom_cat')
    nom_id = request.GET.get('nom_id')
    page = request.GET.get('page')
    
    if not page:
        page = 1
        
    user = FB_User.objects.get(fid=int(user))
    
    nom = Nomination.objects.get(id=int(nom_id))
    winning_noms = Nomination.objects.filter(Q(nominatee=user) | 
                                            Q(tagged_friends__fid__in=[user.fid]), 
                                            nomination_category=nom_cat, 
                                            won=True).distinct('id').order_by('-current_vote_count', '-created_date')
    
    data = {
        'noms': serialize_noms(winning_noms),
        'selected_nom': serialize_nom(nom),
    }
    
    data = simplejson.dumps(data)
    return HttpResponse(data, mimetype='application/json')
    
def get_all_wins_trophy_cat(request):
    data = [ ]
    PAGE_SIZE = 10
    user = request.GET.get('source')
    nom_cat = request.GET.get('nom_cat')
    nom_id = request.GET.get('nom_id')
    page = request.GET.get('page')

    if not page:
        page = 1
    
    user = FB_User.objects.get(fid=int(user))
    following = list(user.get_following().values_list('fid', flat=True))
    following.append(user.fid)
    nom = Nomination.objects.get(id=int(nom_id))
    
    winning_noms = Nomination.objects.select_related().filter(Q(nominatee__fid__in=following) | 
                                                                Q(tagged_friends__fid__in=following), 
                                                                nomination_category=nom_cat, 
                                                                won=True).distinct('id').order_by('-created_date', '-current_vote_count')[PAGE_SIZE * (page - 1):PAGE_SIZE * page]
    data = {
        'noms': serialize_noms(winning_noms),
        'selected_nom': serialize_nom(nom),
    }

    data = simplejson.dumps(data)
    return HttpResponse(data, mimetype='application/json')
    
@check_access_token
def nominate_photo(request):
    data = [ ]

    access_token = request.POST.get('access_token')
    photo_id = request.POST.get('photo_id')
    owner = request.POST.get('owner')
    nominations = request.POST.get('nominations').split(',')
    tags = request.POST.get('tags').split(',')
    comment_text = request.POST.get('comment_text')

    try:
        nominator_portrit_user = get_user_from_access_token(access_token)
        nominatee_portrit_user = Portrit_User.objects.get(fb_user__fid=int(owner))
        
        photo = Photo.objects.get(id=photo_id)
        if len(photo.nominations) == 0:
            try:
                if nominator_portrit_user == nominatee_portrit_user:
                    try:
                        nominator_portrit_user.given_nomination_count += 1
                        nominator_portrit_user.recieved_nomination_count += 1
                        nominator_portrit_user.selfish_nomination_count += 1
                    except Exception, err:
                        print err
                else:
                    try:
                        try:
                            nominatee_portrit_user.recieved_nomination_count += 1
                            nominatee_portrit_user.save()
                        except Exception, err:
                            print err

                        nominator_portrit_user.given_nomination_count += 1
                    except Exception, err:
                        print err

                nominator_portrit_user.save()
            except Exception, err:
                print err
            
            nom_data = [ ]
            notification_type = Notification_Type.objects.get(name="new_nom")
            tagged_notification = Notification_Type.objects.get(name="tagged_nom")
            tagged_user_list = [ ]
            for nomination in nominations:
                if nomination != '':
                    nom_cat = Nomination_Category.objects.get(title=nomination)
                    nomination = Nomination(nomination_category=nom_cat.title)
                    if comment_text != "":
                        nomination.caption = comment_text
                    nomination.nominatee = nominatee_portrit_user
                    nomination.nominator = nominator_portrit_user
                    nomination.photo = photo
                    nomination.votes.append(nominator_portrit_user)
                    nomination.up_voters.append(nominator_portrit_user)
                    if photo.public:
                        nomination.public = True

                    nomination.save()
                    print tags
                    try:
                        for tag in tags:
                            if tag != '':
                                tagged_user_list.append(int(tag))
                                tagged_user = Portrit_User.objects.get(fb_user__fid=int(tag))
                                nomination.tagged_users.append(tagged_user)
                                
                                try:
                                    notification = Notification(source=nominator_portrit_user, destination=tagged_user, nomination=nomination, notification_type=tagged_notification)
                                    notification.save()
                                except Exception, err:
                                    print err
                        if len(tags) > 1:
                            nomination.save()
                    except Exception, err:
                        print err

                    photo.nominations.append(nomination)
                    photo.save()
                
                    #Create notification record
                    if nominator_portrit_user.id != nominatee_portrit_user.id:
                        notification = Notification(source=nominator_portrit_user, 
                                                    destination=nominatee_portrit_user, 
                                                    owner=nominatee_portrit_user, 
                                                    nomination=nomination, 
                                                    notification_type=notification_type)
                        notification.save()
                    else:
                        notification = None
                    
                    data = {
                        'id': str(nomination.id),
                        'active': True,
                        'nomination_category': nom_cat.title,
                        'nominator': nomination.nominator.fb_user.fid,
                        'nominator_name': nomination.nominator.name,
                        'nominatee': nomination.nominatee.fb_user.fid,
                        'nominatee_name': nomination.nominatee.name,
                        'tagged_users': nomination.get_tagged_users(),
                        'won': False,
                        'created_time': time.mktime(nomination.created_date.utctimetuple()),
                        'caption': comment_text,
                        'comments': False,
                        'comment_count': 0,
                        'photo': photo.get_photo(),
                        'vote_count': nomination.current_vote_count,
                        'votes': [{
                            'vote_user': nomination.nominator.fb_user.fid,
                            'vote_name': nomination.nominator.name,
                        }],
                    }
                
                    if notification:
                        data['notification_id'] = str(notification.id)

                    nom_data.append(data)

            #Send update notification to event handlers
            tagged_user_list = list(set(tagged_user_list))
            target_friends = [ ]
            for tagged_user in tagged_user_list:
                target_friends.append(tagged_user)

            target_friends = list(set(target_friends))
            friends = { }
            for friend in target_friends:
                try:
                    friend = Portrit_User.objects.get(fb_user__fid=friend)
                    friends[friend.fb_user.fid] = {'fid': friend.fb_user.fid}
                except:
                    friends = { }

            node_data = {
                'method': 'new_nom',
                'payload': {
                    'nom_data': nom_data,
                    'friends': friends,
                }
            }

            node_data = json.dumps(node_data)
            try:
                sock = socket.socket(
                    socket.AF_INET, socket.SOCK_STREAM)
                sock.connect((NODE_HOST, NODE_SOCKET))
                sock.send(node_data)
                sock.close()
            except Exception, err:
                print err

            data = nom_data
    except Exception, err:
        print err

    data = simplejson.dumps(data) 
    return HttpResponse(data, mimetype='application/json')
  
@check_access_token   
def vote_on_nomination(request):
    data = []

    direction = request.POST.get('direction')
    nomination_id = request.POST.get('nomination_id')
    access_token = request.POST.get('access_token')
    
    portrit_user = get_user_from_access_token(access_token)
    voter = portrit_user.fb_user
    owner = FB_User.objects.get(fid=int(voter))
    nomination = Nomination.objects.get(id=nomination_id)
    
    if nomination.votes.filter(fid=owner.fid).count() == 0 and nomination.active:
        if direction == 'up':
            nomination.up_votes += 1
            nomination.update_current_vote_count()
            nomination.save()
        elif direction == 'down':
            nomination.down_votes += 1
            nomination.update_current_vote_count()
            nomination.save()

        nomination.votes.add(owner)

        nominatee = FB_User.objects.get(fid=str(nomination.nominatee))
        try:
            owner_portrit_user = Portrit_User.objects.get(fb_user=owner)
            owner_portrit_user.vote_count += 1
            owner_portrit_user.save()
        except Exception, err:
            print err

        portrit_user = owner.portrit_fb_user.all()[0]
        target_friends = get_target_friends(nominatee, owner)
        friends = { }
        for friend in target_friends:
            try:
                friend = FB_User.objects.get(fid=friend)
                friends[friend.fid] = {'fid': friend.fid,
                                'allow_notifications': friend.get_portrit_user_notification_permission()}
            except:
                friends = { }

        node_data = {
            'method': 'vote',
            'payload': {
                'nom_id': nomination.id,
                'nominatee': nomination.nominatee.fid,
                'nomination_category': nomination.nomination_category.name,
                'vote_count': nomination.current_vote_count,
                'vote_user': owner.fid,
                'vote_name': portrit_user.name,
                'friends': friends,
            }
        }

        node_data = json.dumps(node_data)
        try:
            sock = socket.socket(
                socket.AF_INET, socket.SOCK_STREAM)
            sock.connect((NODE_HOST, NODE_SOCKET))
            sock.send(node_data)
            sock.close()
        except Exception, err:
            print err

        data = {'vote_count': nomination.current_vote_count,
                'nominatee': nomination.nominatee.fid,}

    data = simplejson.dumps(data)
    return HttpResponse(data, mimetype='application/json')
    
def get_follow_count(request):
    data = False
    user = request.GET.get('user')

    try:
        user = FB_User.objects.get(fid=int(user))
        portrit_user = user.get_portrit_user()

        try:
            following_count = user.get_following().count()
        except:
            following_count = 0

        try:
            followers_count = user.get_followers().count()
        except:
            followers_count = 0

        data = {
            'following': following_count,
            'followers': followers_count,
        }
    except Exception, err:
        print err

    data = simplejson.dumps(data)
    return HttpResponse(data, mimetype='application/json')
    
def get_my_follow_data(request):
    data = {
        'data': [ ],
        'count': 0,
    }
    PAGE_SIZE = 20
    
    target = request.GET.get('user')
    method = request.GET.get('method')
    page = request.GET.get('page')
    all = request.GET.get('all')
    
    if not page:
        page = 1
    else:
        page = int(page)
    
    # try:
    target = FB_User.objects.get(fid=int(target))
    target_portrit_user = target.get_portrit_user()
    
    total_count = 0

    if method == 'followers':
        target_followers = target.get_followers()
        data['count'] = target_followers.count()
        if not all:
            target_followers = target_followers[PAGE_SIZE * (page - 1):PAGE_SIZE * page]

        for fb_user in target_followers.iterator():
            data['data'].append({
                'fid': fb_user.fid,
                'name': fb_user.get_name(),
                'follow': False
            })
        
        from operator import itemgetter  
        data['data'] = sorted(data['data'], key=itemgetter('name'))
    
    elif method == 'following':
        target_following = target.get_following()
        data['count'] = target_following.count()
        if not all:
            target_following = target_following[PAGE_SIZE * (page - 1):PAGE_SIZE * page]

        for fb_user in target_following.iterator():
            data['data'].append({
                'fid': fb_user.fid,
                'name': fb_user.get_name(),
                'follow': True
            })
        
        from operator import itemgetter  
        data['data'] = sorted(data['data'], key=itemgetter('name'))
    # except:
    #     pass
    
    data = simplejson.dumps(data)
    return HttpResponse(data, mimetype='application/json')
  
@check_access_token  
def follow_unfollow_user(request):
    data = [ ]
    access_token = request.POST.get('access_token')
    target = request.POST.get('target')
    method = request.POST.get('method')
    
    try:
        source_portrit_user = get_user_from_access_token(access_token)
        source = source_portrit_user.fb_user
        target = FB_User.objects.get(fid=int(target))
        target_portrit_user = target.get_portrit_user()
        if method == 'follow':
            pending = False
            if not target_portrit_user.allow_follows:
                pending = True
            
            for test in User_Followers.objects.filter(portrit_user=target_portrit_user, fb_user=source, pending=pending):
                print test.id
                print test.active
            
            following_rec, created = User_Following.objects.get_or_create(portrit_user=source_portrit_user, fb_user=target, pending=pending)
            if not created:
                following_rec.active = True
                following_rec.save()
                
            follower_rec, created = User_Followers.objects.get_or_create(portrit_user=target_portrit_user, fb_user=source, pending=pending)
            if not created:
                follower_rec.active = True
                follower_rec.save()
                
            #Create following notification
            try:
                # if not follower_rec.pending_notification:
                notification_type = Notification_Type.objects.get(name='new_follow')
                notification = Notification(source=source, destination=target, pending=pending, notification_type=notification_type)
                notification.save()
                target_portrit_user.notifications.add(notification)
                print "notification saved"
            
                if pending:
                    follower_rec.pending_notification = notification
                    follower_rec.save()
                    print "pending record added"
                
                node_data = {
                    'method': 'new_follow',
                    'secondary_method': 'new_follow_update',
                    'payload': {
                        'id': notification.id,
                        'create_datetime': time.mktime(notification.created_date.utctimetuple()),
                        'follower_id': source.fid,
                        'follower_name': source_portrit_user.name,
                        'friends_to_update': [target.fid],
                    }
                }
            
                node_data = json.dumps(node_data)
                try:
                    sock = socket.socket(
                        socket.AF_INET, socket.SOCK_STREAM)
                    sock.connect((NODE_HOST, NODE_SOCKET))
                    sock.send(node_data)
                    sock.close()
                except Exception, err:
                    print err
            except Exception, err:
                print err

        elif method == 'unfollow':
            try:
                following_rec = User_Following.objects.filter(portrit_user=source_portrit_user, fb_user=target, active=True)[0]
                following_rec.active = False
                following_rec.save()
            except Exception, err:
                print err
                
            try:
                follower_rec = User_Followers.objects.filter(portrit_user=target_portrit_user, fb_user=source, active=True)[0]
                follower_rec.active = False
                follower_rec.save()
            except Exception, err:
                print err
            
        data = [True]
    except Exception, ex:
        print ex
    
    data = simplejson.dumps(data)
    return HttpResponse(data, mimetype='application/json')
    
@check_access_token
def follow_permission_submit(request):
    data = False
    notification_id = request.POST.get('notification_id')
    value = request.POST.get('value')
    
    try:
        notification = Notification.objects.get(id=notification_id)
        follower_rec = notification.user_followers_set.all()[0]
        following_rec = User_Following.objects.filter(portrit_user=follower_rec.fb_user.get_portrit_user(), fb_user=follower_rec.portrit_user.fb_user, pending=True)[0]
        # print follower_rec.portrit_user
        # print follower_rec.fb_user
        # print follower_rec.id
        # 
        # print following_rec.portrit_user
        # print following_rec.fb_user
        # print following_rec.id
        if value == '1':
            follower_rec.pending = False
            following_rec.pending = False
            
            notification.active = False
            notification.pending = False
            
        elif value == '0':
            follower_rec.pending = False
            following_rec.pending = False
            follower_rec.active = False
            following_rec.active = False
            
            notification.active = False
            notification.pending = False
            
        follower_rec.save()
        following_rec.save()
        notification.save()
            
        data = True
        
    except Exception, ex:
        print ex
    
    data = simplejson.dumps(data)
    return HttpResponse(data, mimetype='application/json')
    
@check_access_token
def get_follow_data(request):
    data = {
        'data': [ ],
        'count': 0,
    }
    PAGE_SIZE = 20
    
    access_token = request.GET.get('access_token')
    target = request.GET.get('target')
    method = request.GET.get('method')
    all = request.GET.get('all')
    mutual = request.GET.get('mutual')
    page = request.GET.get('page')
    
    if not page:
        page = 1
        
    total_count = 0
    
    try:
        source = get_user_from_access_token(access_token)
        target = Portrit_User.objects.get(fb_user__fid=int(target))
    
        if method == 'followers':
            target_followers = target.get_followers()
            if not all:
                target_followers = target_followers[PAGE_SIZE * (page - 1):PAGE_SIZE * page]
                
            data['count'] = len(target_followers)
        
            source_followers = source.get_followers()
        
            for user in target_followers:
                if user in source_followers:
                    data['data'].append({
                        'fid': user.fb_user.fid,
                        'name': user.name,
                        'username': user.username,
                        'follow': False
                    })
                elif not mutual:
                    data['data'].append({
                        'fid': user.fb_user.fid,
                        'name': user.name,
                        'username': user.username,
                        'follow': True
                    })
            
        
        elif method == 'following':
            target_following = target.get_following()
            if not all:
                target_following = target_following[PAGE_SIZE * (page - 1):PAGE_SIZE * page]
                
            data['count'] = len(target_following)
            source_following = source.get_following()
        
            for user in target_following:
                if user in source_following:
                    data['data'].append({
                        'fid': user.fb_user.fid,
                        'name': user.name,
                        'username': user.username,
                        'follow': False
                    })
                elif not mutual:
                    data['data'].append({
                        'fid': user.fb_user.fid,
                        'name': user.name,
                        'username': user.username,
                        'follow': True
                    })
                    
        from operator import itemgetter  
        data['data'] = sorted(data['data'], key=itemgetter('name'))
    except Exception, err:
        print err
    
    data = simplejson.dumps(data)
    return HttpResponse(data, mimetype='application/json')

@check_access_token      
def get_follow_data_detailed(request):
    data = {
        'data': [ ],
        'count': 0,
    }
    PAGE_SIZE = 20
    
    access_token = request.GET.get('access_token')
    target = request.GET.get('target')
    method = request.GET.get('method')
    all = request.GET.get('all')
    mutual = request.GET.get('mutual')
    page = request.GET.get('page')
    
    if not page:
        page = 1
        
    total_count = 0
    
    try:
        source_portrit_user = get_user_from_access_token(access_token)
        source = source_portrit_user.fb_user
        target_portrit_user = Portrit_User.objects.get(fb_user__fid=int(target))
        target = target_portrit_user.fb_user
    
        if method == 'followers':
            target_followers = target_portrit_user.get_followers()
            data['count'] = len(target_followers)
            if not all:
                target_followers = target_followers[PAGE_SIZE * (page - 1):PAGE_SIZE * page]
                
            source_followers = source_portrit_user.get_followers()
            source_followers_list = []
            for follower in source_followers:
                source_followers_list.append(follower.id)
        
            for user in target_followers:
                photo_count = 0
                trophy_count = 0
                active_count = 0
                try:
                    photo_count = len(Photo.objects.filter(active=True, pending=False, owner=user))
                    trophy_count = len(Nomination.objects.filter(Q(nominatee=user) | Q(tagged_users__in=[user]), won=True))
                    active_count = len(Nomination.objects.filter(Q(nominatee=user) | Q(tagged_users__in=[user]), active=True, won=False))
                except:
                    pass
                    
                if user.id in source_followers_list:
                    data['data'].append({
                        'fid': user.fb_user.fid,
                        'name': user.name,
                        'username': user.username,
                        'photo_count': photo_count,
                        'trophy_count': trophy_count,
                        'active_count': active_count,
                        'follow': False
                    })
                elif not mutual:
                    data['data'].append({
                        'fid': user.fb_user.fid,
                        'name': user.name,
                        'username': user.username,
                        'photo_count': photo_count,
                        'trophy_count': trophy_count,
                        'active_count': active_count,
                        'follow': True
                    })
            
        
        elif method == 'following':
            target_following = target_portrit_user.get_following()
            data['count'] = len(target_following)
            if not all:
                target_following = target_following[PAGE_SIZE * (page - 1):PAGE_SIZE * page]
                
            source_following = source_portrit_user.get_following()
            source_following_list = []
            for following in source_following:
                source_following_list.append(following.id)
        
            for user in target_following:
                photo_count = 0
                trophy_count = 0
                active_count = 0
                try:
                    photo_count = len(Photo.objects.filter(active=True, pending=False, owner=user))
                    trophy_count = len(Nomination.objects.filter(Q(nominatee=user) | Q(tagged_users__in=[user]), won=True))  #fb_user.winning_noms.all().count()
                    active_count = len(Nomination.objects.filter(Q(nominatee=user) | Q(tagged_users__in=[user]), active=True, won=False))  #fb_user.active_nominations.all().count()
                except:
                    pass
                    
                if user.id in source_following:
                    data['data'].append({
                        'fid': user.fb_user.fid,
                        'name': user.name,
                        'photo_count': photo_count,
                        'trophy_count': trophy_count,
                        'active_count': active_count,
                        'follow': False
                    })
                elif not mutual:
                    data['data'].append({
                        'fid': user.fb_user.fid,
                        'name': user.name,
                        'photo_count': photo_count,
                        'trophy_count': trophy_count,
                        'active_count': active_count,
                        'follow': True
                    })
                    
        from operator import itemgetter  
        data['data'] = sorted(data['data'], key=itemgetter('name'))
    except Exception, err:
        print err
    
    data = simplejson.dumps(data)
    return HttpResponse(data, mimetype='application/json')
   
@check_access_token  
def get_user_profile(request):
    data = {
        'photos': [ ],
        'active_noms': None,
        'trophy_count': 0,
        'trophies': None,
        'follow': True,
        'follow_counts': { }, 
        'user': {
            'fid': None,
            'name': None,
            'username': None,
        },
        'settings': None
    }
    access_token = request.GET.get('access_token')
    user = request.GET.get('fb_user')
    username = request.GET.get('username')
    source = request.GET.get('source')
    create_date = request.GET.get('create_date')
    new_date = request.GET.get('new_date')
    page_size = request.GET.get('page_size')
    method = request.GET.get('method')
    photo_id = request.GET.get('photo_id')
    
    if not page_size:
        page_size = 10
    else:
        page_size = int(page_size)
    
    try:
        if source:
            portrit_user = Portrit_User.objects.get(fb_user__fid=int(user))
            user = portrit_user.fb_user
            
            source_portrit_user = get_user_from_access_token(access_token)
            source = source_portrit_user.fb_user
            data['follow'] = source_portrit_user.check_follow(portrit_user)
            # source_portrit_user.following.filter(fid=user.fid, user_following__active=True).exists()
        elif username:
            portrit_user = Portrit_User.objects.get(username=username)
            user = portrit_user.fb_user
            
            source_portrit_user = get_user_from_access_token(access_token)
            source = source_portrit_user.fb_user
            data['follow'] = source_portrit_user.check_follow(portrit_user)
        else:
            portrit_user = get_user_from_access_token(access_token)
            user = portrit_user.fb_user
            
        # Set user data
        data['user']['fid'] = user.fid
        data['user']['name'] = portrit_user.name
        data['user']['username'] = portrit_user.username

        if method == 'active':
            user_active_noms = Nomination.objects.filter(active=True, won=False, nominatee=portrit_user).order_by('-created_date')
            data['active_noms'] = serialize_noms(user_active_noms)
        elif not method:
            data['active_noms_count'] = len(Nomination.objects.filter(active=True, won=False, nominatee=portrit_user))

        if not method or method == 'trophies':
            user_trophy_count = cache.get(str(user.fid) + '_trophy_count')
            if not user_trophy_count:
                trophy_count = len(Nomination.objects.filter(Q(tagged_users__in=[portrit_user]) | 
                                                            Q(nominatee=portrit_user), 
                                                            won=True).order_by('-created_date'))
                data['trophy_count'] = trophy_count
                cache.set(str(user.fid) + '_trophy_count', trophy_count)
            else:
                data['trophy_count'] = user_trophy_count
                
        if not method or method == 'photos':
            try:
                if not create_date and not new_date:
                    if photo_id:
                        photo = Photo.objects.get(id=photo_id)
                        photos_before = portrit_user.get_portrit_album().photo_set.filter(created_date__lt=photo.created_date, active=True, pending=False).exclude(nominations__in=exclude_noms).distinct('id').order_by('-created_date')[:page_size]
                        photos_after = portrit_user.get_portrit_album().photo_set.filter(created_date__gt=photo.created_date, active=True, pending=False).exclude(nominations__in=exclude_noms).distinct('id').order_by('-created_date')[:page_size]
                        photos = photos_before | photos_after
                    else:
                        photos = Photo.objects.filter(owner=portrit_user,
                                                        nominations__size=0,
                                                        active=True, 
                                                        pending=False)
                elif new_date:
                    new_date = datetime.fromtimestamp(float(new_date))
                    photos = Photo.objects.filter(owner=portrit_user,
                                                    nominations__size=0,
                                                    created_date__gt=new_date,
                                                    active=True, 
                                                    pending=False)
                else:
                    create_date = datetime.fromtimestamp(float(create_date))
                    photos = Photo.objects.filter(owner=portrit_user,
                                                    nominations__size=0,
                                                    created_date__lt=new_date,
                                                    active=True, 
                                                    pending=False)
                                                    
                for photo in photos:
                    data['photos'].append(photo.get_photo())
            except Exception, err:
                print err
        try:
            following_count = len(portrit_user.get_following())
        except:
            following_count = 0

        try:
            followers_count = len(portrit_user.get_followers())
        except:
            followers_count = 0
        
        data['follow_counts'] = {
            'following': following_count,
            'followers': followers_count,
        }
    
    except Exception, err:
        print err
    
    data = simplejson.dumps(data)
    return HttpResponse(data, mimetype='application/json')
    
@check_access_token
def get_user_stream_photos(request):
    data = [ ]
    access_token = request.GET.get('access_token')
    create_date = request.GET.get('create_date')
    page_size = request.GET.get('page_size')

    if not page_size:
        page_size = 15

    try:
        portrit_user = get_user_from_access_token(access_token)
        user = portrit_user.fb_user
    
        source_following = portrit_user.get_following()
        source_following_list = [ ]
        
        try:
            if not create_date:
                photos = Photo.objects.filter(Q(nominations__active=False) &
                                                Q(nominations__won=False) &
                                                Q(nominations__removed=False) |
                                                Q(nominations__size=0)).filter(
                                                    Q(owner__in=source_following) |
                                                    Q(owner=portrit_user),
                                                    active=True, 
                                                    pending=False).order_by('-created_date')[:page_size]
            else:
                create_date = datetime.fromtimestamp(float(create_date))
                photos = Photo.objects.filter(Q(nominations__active=False) &
                                                Q(nominations__won=False) &
                                                Q(nominations__removed=False) |
                                                Q(nominations__size=0)).filter(
                                                    Q(owner__in=source_following) | 
                                                    Q(owner=portrit_user),
                                                    created_date__lt=create_date,
                                                    active=True, 
                                                    pending=False).order_by('-created_date')[:page_size]
        except Exception, err:
            photos = [ ]
            print err
        
        for photo in photos:
            try:
                portrit_user = photo.owner
                photo_obj = photo.get_photo()
                data.append({
                    'user_fid': portrit_user.fb_user.fid,
                    'name': portrit_user.name,
                    'username': portrit_user.username,
                    'photo': photo_obj,
                    'create_datetime': time.mktime(photo.created_date.utctimetuple()),
                })
            except Exception, err:
                print err

    except Exception, err:
        print err

    data = simplejson.dumps(data)
    return HttpResponse(data, mimetype='application/json')
    
def get_user_active_noms(request):
    data = [ ]
    user = request.GET.get('fb_user')
    
    user = Portrit_User.objects.get(fb_user__fid=int(user))
    
    user_active_noms = Nomination.objects.filter(Q(tagged_user__in=[user]) |
                                                    Q(nominatee=user),
                                                    active=True,
                                                    removed=False)
    
    data = serialize_noms(user_active_noms)
    
    data = simplejson.dumps(data)
    return HttpResponse(data, mimetype='application/json')
    
def sort_by_wins(a, b):
    return cmp(int(b['count']), int(a['count']))
  
@check_access_token 
def get_user_trophies(request):
    PAGE_SIZE = 6
    data = [ ]
    access_token = request.GET.get('access_token')
    target = request.GET.get('target')
    try:
        portrit_user = get_user_from_access_token(access_token)
        if target:
            target_portrit_user = Portrit_User.objects.get(fb_user__fid=int(target))
            fb_user = target_portrit_user.fb_user
        else:
            target_portrit_user = portrit_user
            fb_user = portrit_user.fb_user
        user_trophies = cache.get(str(fb_user.fid) + '_user_trophies')
        if user_trophies == None:
            cats = Nomination_Category.objects.all()
            for cat in cats:
                winning_noms = Nomination.objects.filter(Q(nominatee=target_portrit_user) | 
                                                        Q(tagged_users__in=[target_portrit_user]),
                                                        nomination_category=cat.title, 
                                                        won=True).order_by('-current_vote_count', '-created_date')[:PAGE_SIZE]
                                                        
                if len(winning_noms) > 0:
                    nom_cat_data = {
                        'cat_name': nom.nomination_category,
                        'count': len(winning_noms),
                        'noms': serialize_noms(winning_noms),
                    }
                    data.append(nom_cat_data)

            cache.set(str(fb_user.fid) + '_user_trophies', data)
        else:
            data = user_trophies
    except Exception, err:
        print err

    data = simplejson.dumps(data)
    return HttpResponse(data, mimetype='application/json')
    
@check_access_token
def get_more_user_trophies(request):
    data = [ ]
    access_token = request.GET.get('access_token')
    cat = request.GET.get('cat')
    
    try:
        user = get_user_from_access_token(access_token)
        fb_user = user.fb_user
        print user
        
    except Exception, err:
        print err     
    
    data = simplejson.dumps(data)
    return HttpResponse(data, mimetype='application/json')
    
# Communtiy Views
def get_community_photos(request):
    data = []
    PAGE_SIZE = 21
    new_date = request.GET.get('new_date')
    
    try:
        if new_date:
            new_date = datetime.fromtimestamp(float(new_date))
            photos = Photo.objects.filter((Q(nominations__active=False) &
                                            Q(nominations__won=False) &
                                            Q(nominations__removed=False)) |
                                            Q(nominations__size=0),
                                            created_date__gt=new_date,
                                            active=True, 
                                            pending=False,
                                            public=True).order_by('-created_date')[:PAGE_SIZE]
        else:
            photos = Photo.objects.filter((Q(nominations__active=False) &
                                            Q(nominations__won=False) &
                                            Q(nominations__removed=False)) |
                                            Q(nominations__size=0),
                                            active=True, 
                                            pending=False,
                                            public=True).order_by('-created_date')[:PAGE_SIZE]
                                            
        photo_data = [ ]
        for photo in photos:
            try:
                portrit_user = photo.owner
                photo_obj = photo.get_photo()
                photo_data.append({
                    'user_fid': portrit_user.fb_user.fid,
                    'name': portrit_user.name,
                    'username': portrit_user.username,
                    'photo': photo_obj,
                    'create_datetime': time.mktime(photo.created_date.utctimetuple()),
                })
            except Exception, err:
                print err
        data = photo_data
    except Exception, err:
        print err
    data = simplejson.dumps(data)
    return HttpResponse(data, mimetype='application/json')
    
def get_community_nominations(request):
    data = []
    PAGE_SIZE = 10
    new_date = request.GET.get('new_date')
    old_date = request.GET.get('create_date')
    
    if new_date:
        new_date = datetime.fromtimestamp(float(new_date))
        nominations = Nomination.objects.filter(created_date__gt=new_date, 
                                                active=True, 
                                                won=False, 
                                                public=True).order_by('-created_date')[:PAGE_SIZE]
        data = serialize_noms(nominations)
    elif old_date:
        old_date = datetime.fromtimestamp(float(old_date))
        nominations = Nomination.objects.filter(created_date__lt=old_date, 
                                                active=True, 
                                                won=False, 
                                                public=True).order_by('-created_date')[:PAGE_SIZE]
                                                
        data = serialize_noms(nominations)
    else:
        nominations = Nomination.objects.filter(active=True, 
                                                won=False, 
                                                public=True).order_by('-created_date')[:PAGE_SIZE]
        data = serialize_noms(nominations)
    
    data = simplejson.dumps(data)
    return HttpResponse(data, mimetype='application/json')
    
def get_community_top_nominations_cat(request):
    data = []
    PAGE_SIZE = 12
    cat = request.GET.get('cat')
    page_size = request.GET.get('page_size')
    
    if page_size:
        PAGE_SIZE = int(page_size)
    
    nominations = Nomination.objects.filter(nomination_category=cat,
                                            public=True).order_by('-created_date', '-current_vote_count')[:PAGE_SIZE]
    data = serialize_noms(nominations)
    data = simplejson.dumps(data)
    return HttpResponse(data, mimetype='application/json')
    
def get_community_top_stream(request):
    data = [ ]
    PAGE_SIZE = 6
    new_date = request.GET.get('new_date')
    create_date = request.GET.get('create_date')
    page_size = request.GET.get('page_size')

    if page_size and int(page_size) < 25:
        PAGE_SIZE = int(page_size)

    community_top_steam_cache = cache.get('community_top_steam')
    try:
        if not community_top_steam_cache:
            nom_cats = Nomination_Category.objects.all()
            for cat in nom_cats:
                top_noms = Nomination.objects.filter(nomination_category=cat.title,
                                                    public=True,
                                                    active=True, 
                                                    won=False).order_by('-current_vote_count', '-created_date')[:PAGE_SIZE]

                if len(top_noms) > 0:
                    data.append({
                        'cat_name': cat.title,
                        'noms': serialize_noms(top_noms),
                        'nom_count': len(top_noms),
                    })
            
            from operator import itemgetter 
            data = sorted(data, key=itemgetter('nom_count'), reverse=True)
            cache.set('community_top_steam', data, 60*5)
        else:
            data = community_top_steam_cache
    except Exception, err:
        print err

    data = simplejson.dumps(data)
    return HttpResponse(data, mimetype='application/json')
    
# Notification Views
@check_access_token
def get_active_notifications(request):
    data = [ ]
    access_token = request.GET.get('access_token')
    new_date = request.GET.get('new_date')
    
    try:
        portrit_user = get_user_from_access_token(access_token)
        
        if new_date:
            new_date = datetime.fromtimestamp(float(new_date))
            all_notifications = Notification.objects.filter(Q(pending=True) | Q(active=True), created_date__gt=new_date, read=False).order_by('-created_date')
        else:
            all_notifications = Notification.objects.filter(Q(pending=True) | Q(active=True), read=False).order_by('-created_date')
            
        data = [ ]
        for notification in all_notifications:
            if not notification.notification_type.name == 'new_follow':
                data.append({
                    'notification_type': notification.notification_type.name,
                    'create_time': time.mktime(notification.created_date.utctimetuple()),
                    'read': notification.read,
                    'source_id': notification.source.fb_user.fid,
                    'source_name': notification.source.name,
                    'destination_id': notification.destination.fb_user.fid,
                    'destination_name': notification.destination.name,
                    'nomination': str(notification.nomination.id),
                    'photo': notification.nomination.photo.get_photo(),
                    'notification_id': str(notification.id),
                    'nomination_category': notification.nomination.nomination_category,
                })
            else:
                data.append({
                    'notification_type': notification.notification_type.name,
                    'create_time': time.mktime(notification.created_date.utctimetuple()),
                    'read': notification.read,
                    'pending': notification.pending,
                    'source_id': notification.source.fb_user.fid,
                    'source_name': notification.source.name,
                    'destination_id': notification.destination.fb_user.fid,
                    'destination_name': notification.destination.name,
                    'notification_id': str(notification.id),
                })
    except Exception, err:
        print err
        
    data = simplejson.dumps(data)
    return HttpResponse(data, mimetype='application/json')

@check_access_token 
def notification_read(request):
    data = False
    access_token = request.POST.get('access_token')
    notification_id = request.POST.get('notification_id')
    kill = request.POST.get('kill')
    clear = request.POST.get('clear')

    if clear:
        try:
            portrit_user = get_user_from_access_token(access_token)
            Notification.objects.filter(owner=portrit_user, active=True, read=False).update(set__read=True, set__active=False, set__pending=False)
            data = True
        except Exception, err:
            print err
    else:
        try:
            portrit_user = get_user_from_access_token(access_token)
            notification = Notification.objects.get(id=notification_id)
            notification.read = True
            if kill:
                notification.active = False
                notification.pending = False
            notification.save()
            data = True
        except Exception, err:
            print err

    data = json.dumps(data) 
    return HttpResponse(data, mimetype='application/json')
    
#Comment Views
def get_comments(request):
    data = False
    nom_id = request.GET.get('nom_id')
    try:
        nomination = Nomination.objects.get(id=nom_id)
        comments = nomination.get_comments()
        data = comments
    except Exception, err:
        print err
      
    data = simplejson.dumps(data) 
    return HttpResponse(data, mimetype='application/json')
    
@check_access_token 
def new_comment(request):
    data = False
    notification_id = None
    access_token = request.POST.get('access_token')
    
    try:
        portrit_user = get_user_from_access_token(access_token)
        user = portrit_user.fb_user
        body = request.POST.get('body')
        nomination_id = request.POST.get('nom_id')
        try:
            nomination = Nomination.objects.get(id=nomination_id)
            owner = nomination.nominatee
            
            comment = Comment(comment=body, owner=portrit_user, nomination=str(nomination.id))
            comment.save()
            
            #update comment cache
            cache.delete(str(nomination.id) + '_comments')
            
            #Save and re-serialize nom
            nomination.save()
            
            portrit_user.comment_count += 1
            portrit_user.save()
            
            voters = nomination.votes
            all_commentors = [ ]
            for comment in Comment.objects.filter(nomination=str(nomination.id), active=True):
                all_commentors.append(comment.owner)
                
            tagged_users = nomination.tagged_users
            
            friends = { }
            friends[nomination.nominator.fb_user.fid] = {'fid': nomination.nominator.fb_user.fid}
            friends[owner.fb_user.fid] = {'fid': owner.fb_user.fid}
                            
            #Attach target user
            for friend in all_commentors:
                if friend.fb_user.fid != user.fid:
                    if friend.fb_user.fid != nomination.nominator.fb_user.fid:
                        friends[friend.fb_user.fid] = {'fid': friend.fb_user.fid}
                
            for friend in voters:
                if friend.fb_user.fid != user.fid:
                    if friend.fb_user.fid != nomination.nominator.fb_user.fid:
                        friends[friend.fb_user.fid] = {'fid': friend.fb_user.fid}
                                                
            for friend in tagged_users:
                if friend.fb_user.fid != user.fid:
                    if friend.fb_user.fid != nomination.nominator.fb_user.fid:
                        friends[friend.fb_user.fid] = {'fid': friend.fb_user.fid}

            notification_type = Notification_Type.objects.get(name="new_comment")
            for friend in friends:
                friend = friends[friend]
                if friend['fid'] != user.fid:
                    notification = Notification(owner=Portrit_User.objects.get(fb_user__fid=friend['fid']), source=portrit_user, destination=owner, nomination=nomination, notification_type=notification_type)
                    notification.save()
                    friend['notification_id'] = str(notification.id)
                       
            # friends_to_update = { }
            # target_friends = get_target_friends(owner, user)
            # for friend in friends:
            #     friends_to_update[friend] = {'fid': friend,
            #                             'allow_notifications': False}

            node_data = {
                'method': 'new_comment',
                'secondary_method': 'new_comment_update',
                'payload': {
                    'id': str(nomination.id),
                    'comment': comment.comment,
                    'create_datetime': time.mktime(comment.created_date.utctimetuple()),
                    'comment_sender_id': user.fid,
                    'comment_sender_name': portrit_user.name,
                    'nomination_category': nomination.nomination_category,
                    'nom_owner_id': owner.fb_user.fid,
                    'nom_owner_name': owner.name,
                    'won': nomination.won,
                    'friends': friends,
                    'friends_to_update': friends,
                }
            }
            
            node_comment_notification_data = json.dumps(node_data)
            try:
                sock = socket.socket(
                    socket.AF_INET, socket.SOCK_STREAM)
                sock.connect((NODE_HOST, NODE_SOCKET))
                sock.send(node_comment_notification_data)
                sock.close()
            except Exception, err:
                print err

            data = True
        except Exception, err:
            print err
    except Exception, err:
        print err
    
    data = simplejson.dumps(data) 
    return HttpResponse(data, mimetype='application/json')
    
# Flag Views
@check_access_token
def flag_photo(request):
    data = False
    photo_id = request.POST.get('photo_id')
    access_token = request.POST.get('access_token')
    
    try:
        portrit_user = get_user_from_access_token(access_token)
        photo = Photo.objects.get(id=str(photo_id))
        
        if len(photo.flags.filter(flagger=portrit_user)) == 0:
            flag_rec = Photo_Flag(flagger=portrit_user)
            photo.flags.append(flag_rec)
            
            if len(photo.flags) >= 3 and not photo.validated:
                photo.active = False
                Nomination.objects.filter(photo__id=photo.id).update(set__active=False)
                
            photo.save()
        
        #Create Email, Send to Admins
        
        data = True
    except Exception, err:
        print err
    
    data = simplejson.dumps(data) 
    return HttpResponse(data, mimetype='application/json')

# Search Views  
def search(request):
    data = [ ]
    q = request.GET.get('q')
    source = request.GET.get('fb_user')
    
    try:
        if source:
            source = Portrit_User.objects.get(fb_user__fid=int(source))
            source_following = source.get_following()
        else:
            source_following = [ ]
            
        users = Portrit_User.objects.filter(name__icontains=q)[:40]
        for user in users:
            if user in source_following:
                data.append({
                    'fid': user.fb_user.fid,
                    'name': user.name,
                    'follow': False
                })
            else:
                data.append({
                    'fid': user.fb_user.fid,
                    'name': user.name,
                    'follow': True
                })
                
        from operator import itemgetter  
        data = sorted(data, key=itemgetter('name'))
    except Exception, err:
        print err
    
    data = simplejson.dumps(data) 
    return HttpResponse(data, mimetype='application/json')
    
def search_by_names(request):
    data = [ ]
    source = request.POST.get('source')
    names = request.POST.get('names')
    
    try:
        if source:
            source = Portrit_User.objects.get(fb_user__fid=int(source))
            source_following = source.get_following()
        else:
            source_following = [ ]
    
        names = names.split(',')
        users = Portrit_User.objects.filter(name__in=names)[:100]
    
        for user in users.iterator():
            if user in source_following:
                data.append({
                    'fid': user.fb_user.fid,
                    'name': user.name,
                    'follow': False
                })
            else:
                data.append({
                    'fid': user.fb_user.fid,
                    'name': user.name,
                    'follow': True
                })
                
        from operator import itemgetter  
        data = sorted(data, key=itemgetter('name'))
    except Exception, err:
        print err
    
    data = simplejson.dumps(data) 
    return HttpResponse(data, mimetype='application/json')
    
def search_cool_kids(request):
    data = [ ]
    source = request.POST.get('source')

    try:
        if source:
            source = Portrit_User.objects.get(fb_user__fid=int(source))
            source_following = source.get_following()
        else:
            source_following = [ ]
        
        names = names.split(',')
        users = Portrit_User.objects.filter(name__in=names)[:100]

        for user in users:
            if user in source_following:
                data.append({
                    'fid': user.fb_user.fid,
                    'name': user.name,
                    'follow': False
                })
            else:
                data.append({
                    'fid': user.fb_user.fid,
                    'name': user.name,
                    'follow': True
                })

        from operator import itemgetter  
        data = sorted(data, key=itemgetter('name'))
    except Exception, err:
        print err

    data = simplejson.dumps(data) 
    return HttpResponse(data, mimetype='application/json')

@check_access_token
def get_user_settings(request):
    data = { }
    access_token = request.GET.get('access_token')
    
    try:
        portrit_user = get_user_from_access_token(access_token)
        data = portrit_user.get_settings()
    except Exception, err:
        print err

    data = simplejson.dumps(data) 
    return HttpResponse(data, mimetype='application/json')

@check_access_token
def change_user_settings(request):
    data = False
    access_token = request.POST.get('access_token')
    method = request.POST.get('method')
    value = request.POST.get('value')
    
    try:
        portrit_user = get_user_from_access_token(access_token)
        if value == 1 or value == '1':
            value = True
        else:
            value = False
        print method
        print value
        if method == 'gps':
            portrit_user.allow_gps = value
        elif method == 'privacy':
            portrit_user.allow_follows = value
        elif method == 'post_wins':
            portrit_user.allow_winning_fb_album = value
            
        portrit_user.save()
        data = portrit_user.get_settings()
    except Exception, err:
        print err
    
    data = simplejson.dumps(data) 
    return HttpResponse(data, mimetype='application/json')