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
                        Notification, Notification_Type, User_Following, User_Followers, GPS_Data, Photo_Flag
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
                    user = Portrit_User.objects.get(Q(api_access_token=access_token) | Q(access_token=access_token))
                    if user.api_access_token == access_token or user.access_token == access_token:
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
            user = Portrit_User.objects.get(Q(api_access_token=token) | Q(access_token=token))
            return user
    except Exception, err:
        print err
        
    return None

def sign_in_create(request):
    data = [ ]
    
    fb_user = request.POST.get('fb_user')
    access_token = request.POST.get('access_token')
    
    user = FB_User.objects.filter(fid=int(fb_user))
    
    if not user.exists():
        graph = facebook.GraphAPI(access_token)
        try:
            profile = graph.get_object("me")
            fb_user = FB_User(fid=profile['id'], access_token=access_token, name=profile['name'])
            fb_user.save()
            
            email = None
            try:
                email = profile['email']
            except Exception, err:
                print err
            
            portrit_user = Portrit_User(api_access_token=access_token, 
                                        fb_user=fb_user, 
                                        name=profile['name'], 
                                        email=email,
                                        allow_portrit_album=False,
                                        ask_permission=False)
            portrit_user.save()
            portrit = Portrit_FB(graph, fb_user, access_token)
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
            
            fb_user = user[0]
            fb_user.access_token = access_token
            fb_user.save()
            
            portrit_user = fb_user.get_portrit_user()
            if not portrit_user:
                portrit_user = Portrit_User(api_access_token=access_token, 
                                            fb_user=fb_user, 
                                            name=profile['name'], 
                                            email=email,
                                            allow_portrit_album=False,
                                            ask_permission=False)
                                            
                portrit_user.save()
                portrit = Portrit_FB(graph, fb_user, api_access_token)
                portrit.load_user_friends(True)
                new = True
            elif not portrit_user.api_access_token:
                portrit_user.api_access_token = access_token
                portrit_user.save()
            else:
                access_token = portrit_user.api_access_token
            
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
    
    try:
        user = get_user_from_access_token(access_token)
    
        user.username = username
        if post_wins_to_fb == '1':
            user.allow_portrit_album = True
        else:
            user.allow_portrit_album = False
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
        friends = user.get_following()
        if created_date:
            created_date = datetime.fromtimestamp(float(created_date))
            nominations = Nomination.objects.select_related().filter(
                Q(nominatee__in=friends) |
                Q(nominatee=user) |
                Q(nominator=user),
                created_date__lt=created_date, won=False, active=True).distinct('id').order_by('-created_date')[:PAGE_SIZE]
        elif new_date:
            new_date = datetime.fromtimestamp(float(new_date))
            nominations = Nomination.objects.select_related().filter(
                Q(nominatee__in=friends) |
                Q(nominatee=user) |
                Q(nominator=user),
                created_date__gt=new_date, won=False, active=True).distinct('id').order_by('-created_date')[:PAGE_SIZE]
        else:
            nominations = Nomination.objects.select_related().filter(
                Q(nominatee__in=friends) |
                Q(nominatee=user) |
                Q(nominator=user),
                won=False, active=True).distinct('id').order_by('-created_date')[:PAGE_SIZE]
                
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
        following = user.get_following()
        
        if create_date:
            create_date = datetime.fromtimestamp(float(create_date))
            winning_noms = Nomination.objects.select_related().filter(
                Q(nominatee__in=following) |
                Q(nominatee=user) |
                Q(nominator=user),
                created_date__lt=create_date, won=True).distinct('id').order_by('-created_date')[:page_size]
        
        elif new_date:
            new_date = datetime.fromtimestamp(float(new_date))
            winning_noms = Nomination.objects.select_related().filter(
                Q(nominatee__in=following) |
                Q(nominatee=user) |
                Q(nominator=user),
                created_date__gt=new_date, won=True).distinct('id').order_by('-created_date')[:page_size]
        else:
            winning_noms = Nomination.objects.select_related().filter(
                Q(nominatee__in=following) |
                Q(nominatee=user) |
                Q(nominator=user),
                won=True).distinct('id').order_by('-created_date')[:page_size]
        
        data = serialize_noms(winning_noms)
    except Exception, err:
        print err
    
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
        portrit_user = get_user_from_access_token(access_token)
        user = portrit_user.fb_user
        following = user.get_following()
        
        nom = Nomination.objects.get(id=int(nom_id))
        noms_in_cat = Nomination.objects.select_related().filter(
            Q(nominatee__in=following) |
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
    winning_noms = Nomination.objects.select_related().filter(Q(nominatee=user) | Q(tagged_friends__fid__in=[user.fid]), nomination_category__name=nom_cat, won=True).distinct('id').order_by('-current_vote_count', '-created_date')
    
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
                                                                nomination_category__name=nom_cat, 
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
        portrit_user = get_user_from_access_token(access_token)
        fb_user = portrit_user.fb_user
        photo, created = Photo.objects.get_or_create(id=photo_id)
        photo_data = { }
        photo_data['id'] = photo.id
        photo_data['src'] = photo.fb_source
        photo_data['src_small'] = photo.fb_source_small
        photo_data['small_height'] = photo.small_height
        photo_data['small_width'] = photo.small_width
        photo_data['height'] = photo.height
        photo_data['width'] = photo.width
        photo_data['album_fid'] = photo.get_album_fid()

        nominator_portrit_user = Portrit_User.objects.get(fb_user=fb_user)
        try:
            if owner == 'me':
                try:
                    owner_fb_user = fb_user
                    nominator_portrit_user.given_nomination_count += 1
                    nominator_portrit_user.recieved_nomination_count += 1
                    nominator_portrit_user.selfish_nomination_count += 1
                except Exception, err:
                    print err
            else:
                try:
                    owner_fb_user = FB_User.objects.get(fid=owner)
                    try:
                        nominatee_portrit_user = Portrit_User.objects.get(fb_user=owner_fb_user)
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
                nom_cat = Nomination_Category.objects.get(name=nomination)
                nomination = Nomination(nomination_category=nom_cat)
                if comment_text != "":
                    nomination.caption = comment_text
                nomination.nominatee = owner_fb_user
                nomination.nominator = fb_user    
                nomination.save()

                try:
                    for tag in tags:
                        if tag != '':
                            tagged_user_list.append(int(tag))
                            tagged_user = FB_User.objects.get(fid=int(tag))
                            tagged_user.active_nominations.add(nomination)
                            nomination.tagged_friends.add(tagged_user)

                            try:
                                notification = Notification(source=fb_user, destination=tagged_user, nomination=nomination, notification_type=tagged_notification)
                                notification.save()
                                tagged_portrit_user = tagged_user.get_portrit_user()
                                tagged_portrit_user.notifications.add(notification)
                            except Exception, err:
                                print err
                except Exception, err:
                    print err

                nomination.votes.add(fb_user)
                photo.nominations.add(nomination)
                owner_fb_user.active_nominations.add(nomination)
                
                #Create notification record
                notification = Notification(source=fb_user, destination=owner_fb_user, nomination=nomination, notification_type=notification_type)
                notification.save()

                try:
                    if owner_fb_user.fid != fb_user.fid:
                        portrit_user = Portrit_User.objects.get(fb_user=owner_fb_user)
                        portrit_user.notifications.add(notification)
                except Exception, err:
                    print err

                nominator_name = None
                nominatee_name = None
                try:
                    nominator_name = nomination.nominator.get_name()
                except Exception, err:
                    print err
                try:
                    nominatee_name = nomination.nominatee.get_name()
                except Exception, err:
                    print err

                nom_data.append({
                    'id': nomination.id,
                    'active': nomination.active,
                    'nomination_category': nom_cat.name,
                    'nominator': nomination.nominator.fid,
                    'nominator_name': nominator_name,
                    'nominatee': nomination.nominatee.fid,
                    'nominatee_name': nominatee_name,
                    'tagged_users': nomination.get_tagged_users(),
                    'won': nomination.won,
                    'created_time': time.mktime(nomination.created_date.utctimetuple()),
                    'caption': comment_text,
                    'comments': False,
                    'comment_count': nomination.get_comment_count(),
                    'photo': photo_data,
                    'vote_count': nomination.current_vote_count,
                    'votes': [{
                        'vote_user': fb_user.fid,
                        'vote_name': fb_user.get_name(),
                    },],
                    'notification_id': notification.id,
                })

        #Send update notification to event handlers
        tagged_user_list = list(set(tagged_user_list))
        target_friends = get_target_friends(owner_fb_user, fb_user)
        friends = { }
        for tagged_user in tagged_user_list:
            target_friends.append(tagged_user)

        target_friends = list(set(target_friends))
        for friend in target_friends:
            try:
                friend = FB_User.objects.get(fid=friend)
                friends[friend.fid] = {'fid': friend.fid,
                                'allow_notifications': friend.get_portrit_user_notification_permission()}
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
            
        try:
            cache.delete(str(source.fid) + '_recent_stream')
            cache.delete(str(source.fid) + '_user_top_stream')
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
        source_portrit_user = get_user_from_access_token(access_token)
        source = source_portrit_user.fb_user
        target = FB_User.objects.get(fid=int(target))
        target_portrit_user = target.get_portrit_user()
    
        if method == 'followers':
            target_followers = target.get_followers()
            if not all:
                target_followers = target_followers[PAGE_SIZE * (page - 1):PAGE_SIZE * page]
                
            data['count'] = target_followers.count()
        
            source_followers = source.get_followers().values_list('fid', flat=True)
        
            for fb_user in target_followers.iterator():
                if fb_user.fid in source_followers:
                    data['data'].append({
                        'fid': fb_user.fid,
                        'name': fb_user.get_name(),
                        'follow': False
                    })
                elif not mutual:
                    data['data'].append({
                        'fid': fb_user.fid,
                        'name': fb_user.get_name(),
                        'follow': True
                    })
            
        
        elif method == 'following':
            target_following = target.get_following()
            if not all:
                target_following = target_following[PAGE_SIZE * (page - 1):PAGE_SIZE * page]
                
            data['count'] = target_following.count()
            source_following = source.get_following().values_list('fid', flat=True)
        
            for fb_user in target_following.iterator():
                if fb_user.fid in source_following:
                    data['data'].append({
                        'fid': fb_user.fid,
                        'name': fb_user.get_name(),
                        'follow': False
                    })
                elif not mutual:
                    data['data'].append({
                        'fid': fb_user.fid,
                        'name': fb_user.get_name(),
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
        target = FB_User.objects.get(fid=int(target))
        target_portrit_user = target.get_portrit_user()
    
        if method == 'followers':
            target_followers = target.get_followers()
            if not all:
                target_followers = target_followers[PAGE_SIZE * (page - 1):PAGE_SIZE * page]
                
            data['count'] = target_followers.count()
            source_followers = source.get_followers().values_list('fid', flat=True)
        
            for fb_user in target_followers.iterator():
                portrit_user = fb_user.get_portrit_user()
                portrit_user = fb_user.get_portrit_user()
                photo_count = 0
                trophy_count = 0
                active_count = 0
                try:
                    photo_count = portrit_user.get_portrit_album().get_photo_count()
                    trophy_count = fb_user.winning_noms.all().count()
                    active_count = fb_user.active_nominations.all().count()
                except:
                    pass
                    
                if fb_user.fid in source_followers:
                    data['data'].append({
                        'fid': fb_user.fid,
                        'name': fb_user.get_name(),
                        'photo_count': photo_count,
                        'trophy_count': trophy_count,
                        'active_count': active_count,
                        'follow': False
                    })
                elif not mutual:
                    data['data'].append({
                        'fid': fb_user.fid,
                        'name': fb_user.get_name(),
                        'photo_count': photo_count,
                        'trophy_count': trophy_count,
                        'active_count': active_count,
                        'follow': True
                    })
            
        
        elif method == 'following':
            target_following = target.get_following()
            if not all:
                target_following = target_following[PAGE_SIZE * (page - 1):PAGE_SIZE * page]
                
            data['count'] = target_following.count()
            source_following = source.get_following().values_list('fid', flat=True)
        
            for fb_user in target_following.iterator():
                portrit_user = fb_user.get_portrit_user()
                photo_count = 0
                trophy_count = 0
                active_count = 0
                try:
                    photo_count = portrit_user.get_portrit_album().get_photo_count()
                    trophy_count = fb_user.winning_noms.all().count()
                    active_count = fb_user.active_nominations.all().count()
                except:
                    pass
                    
                if fb_user.fid in source_following:
                    data['data'].append({
                        'fid': fb_user.fid,
                        'name': fb_user.get_name(),
                        'photo_count': photo_count,
                        'trophy_count': trophy_count,
                        'active_count': active_count,
                        'follow': False
                    })
                elif not mutual:
                    data['data'].append({
                        'fid': fb_user.fid,
                        'name': fb_user.get_name(),
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
            user = FB_User.objects.get(fid=int(user))
            portrit_user = user.get_portrit_user()
            
            source_portrit_user = get_user_from_access_token(access_token)
            source = source_portrit_user.fb_user
            data['follow'] = source_portrit_user.following.filter(fid=user.fid, user_following__active=True).exists()
        elif username:
            portrit_user = Portrit_User.objects.get(username=username)
            user = portrit_user.fb_user
            
            source_portrit_user = get_user_from_access_token(access_token)
            source = source_portrit_user.fb_user
            data['follow'] = source_portrit_user.following.filter(fid=user.fid, user_following__active=True).exists()
        else:
            portrit_user = get_user_from_access_token(access_token)
            user = portrit_user.fb_user
            
        # Set user data
        data['user']['fid'] = user.fid
        data['user']['name'] = user.get_name()
        data['user']['username'] = user.get_username()

        if method == 'active':
            user_active_noms = user.active_nominations.select_related().filter(active=True, won=False).distinct('id').order_by('-created_date')
            data['active_noms'] = serialize_noms(user_active_noms)
        elif not method:
            data['active_noms_count'] = user.active_nominations.filter(active=True).count()

        if not method or method == 'trophies':
            user_trophy_count = cache.get(str(user.fid) + '_trophy_count')
            if not user_trophy_count:
                trophy_count = user.winning_noms.all().count()
                data['trophy_count'] = trophy_count
                cache.set(str(user.fid) + '_trophy_count', trophy_count)
            else:
                data['trophy_count'] = user_trophy_count
        
        if not method or method == 'photos':
            user_active_noms = user.active_nominations.filter(active=True)
            user_winnind_noms = user.winning_noms.filter(won=True)
            exclude_noms = user_winnind_noms | user_active_noms
            try:
                if not create_date and not new_date:
                    if photo_id:
                        photo = Photo.objects.get(id=photo_id)
                        photos_before = portrit_user.get_portrit_album().photo_set.filter(created_date__lt=photo.created_date, active=True, pending=False).exclude(nominations__in=exclude_noms).distinct('id').order_by('-created_date')[:page_size]
                        photos_after = portrit_user.get_portrit_album().photo_set.filter(created_date__gt=photo.created_date, active=True, pending=False).exclude(nominations__in=exclude_noms).distinct('id').order_by('-created_date')[:page_size]
                        photos = photos_before | photos_after
                    else:
                        photos = portrit_user.get_portrit_album().photo_set.filter(active=True, pending=False).exclude(nominations__in=exclude_noms).distinct('id').order_by('-created_date')[:page_size]
                elif new_date:
                    new_date = datetime.fromtimestamp(float(new_date))
                    photos = portrit_user.get_portrit_album().photo_set.filter(active=True, pending=False, created_date__gt=new_date).exclude(nominations__in=exclude_noms).distinct('id').order_by('-created_date')
                else:
                    create_date = datetime.fromtimestamp(float(create_date))
                    photos = portrit_user.get_portrit_album().photo_set.filter(active=True, pending=False, created_date__lt=create_date).exclude(nominations__in=exclude_noms).distinct('id').order_by('-created_date')
                    
                for photo in photos:
                    data['photos'].append(photo.get_portrit_photo())
            except Exception, err:
                print err

        try:
            following_count = user.get_following().count()
        except:
            following_count = 0

        try:
            followers_count = user.get_followers().count()
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
    
        source_following = user.get_following()

        try:
            if not create_date:
                photos = Photo.objects.filter(Q(album__portrit_user_albums__fb_user__in=source_following) |
                                                Q(album__portrit_user_albums__fb_user=user),
                                                Q(nominations__isnull=True) |
                                                Q(nominations__active=False),
                                                crop_src__isnull=False,
                                                active=True, 
                                                pending=False).distinct('id').order_by('-created_date')[:page_size]
            else:
                create_date = datetime.fromtimestamp(float(create_date))
                photos = Photo.objects.filter(Q(album__portrit_user_albums__fb_user__in=source_following) |
                                                Q(album__portrit_user_albums__fb_user=user),
                                                Q(nominations__isnull=True) |
                                                Q(nominations__active=False),
                                                created_date__lt=create_date,
                                                crop_src__isnull=False,
                                                active=True, 
                                                pending=False, 
                                                nominations__active=False).distinct('id').order_by('-created_date')[:page_size]
        except Exception, err:
            print err
        
        for photo in photos:
            try:
                portrit_user = photo.get_portrit_user()
                photo_obj = photo.get_portrit_photo()
                data.append({
                    'user_fid': portrit_user.fb_user.fid,
                    'name': portrit_user.name,
                    'username': portrit_user.username,
                    'photo': photo_obj,
                    'album_id': photo.album.id,
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
    
    user = FB_User.objects.get(fid=int(user))
    user_active_noms = user.active_nominations.select_related().filter(active=True, won=False).distinct('id').order_by('-created_date')
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
            user = FB_User.objects.get(fid=int(target))
        else:
            user = portrit_user.fb_user
        user_trophies = cache.get(str(user.fid) + '_user_trophies')
        if user_trophies == None:
            nom_cats = Nomination_Category.objects.all()
            cat_count = 0
            for cat in nom_cats.iterator():
                winning_noms = cat.nomination_set.select_related().filter(Q(nominatee=user) | Q(tagged_friends__fid__in=[user.fid]), won=True).distinct('id').order_by('-current_vote_count', '-created_date')[:PAGE_SIZE]
                if winning_noms.exists():
                    data.append({
                        'cat_name': cat.name,
                        'count': winning_noms.count(),
                        'noms': serialize_noms(winning_noms),
                    })

            data.sort(sort_by_wins)
            cache.set(str(user.fid) + '_user_trophies', data)
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
            photos = Photo.objects.filter(Q(nominations__active=False) |
                                            Q(nominations__isnull=True),
                                            created_date__gt=new_date, 
                                            active=True, 
                                            pending=False, 
                                            portrit_photo=True, 
                                            public=True).distinct('id').order_by('-created_date')[:PAGE_SIZE]
        else:
            photos = Photo.objects.filter(Q(nominations__active=False) |
                                            Q(nominations__isnull=True),
                                            active=True, 
                                            pending=False,
                                            portrit_photo=True, 
                                            public=True).distinct('id').order_by('-created_date')[:PAGE_SIZE]
        photo_data = [ ]
        for photo in photos:
            try:
                portrit_user = photo.get_portrit_user()
                photo_obj = photo.get_portrit_photo()
                if photo_obj['crop'] != None:
                    photo_data.append({
                        'user_fid': portrit_user.fb_user.fid,
                        'name': portrit_user.name,
                        'username': portrit_user.username,
                        'photo': photo_obj,
                        'album_id': photo.album.id,
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
                                                photo__public=True).order_by('-created_date')[:PAGE_SIZE]
        data = serialize_noms(nominations)
    elif old_date:
        old_date = datetime.fromtimestamp(float(old_date))
        nominations = Nomination.objects.filter(created_date__lt=old_date, 
                                                active=True, 
                                                won=False, 
                                                photo__public=True).order_by('-created_date')[:PAGE_SIZE]
                                                
        data = serialize_noms(nominations)
    else:
        nominations = Nomination.objects.filter(active=True, 
                                                won=False, 
                                                photo__public=True).order_by('-created_date')[:PAGE_SIZE]
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
    
    nominations = Nomination.objects.filter(nomination_category__name=cat,
                                            photo__public=True).order_by('-created_date', '-current_vote_count')[:PAGE_SIZE]
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
        PAGE_SIZE = page_size

    community_top_steam_cache = cache.get('community_top_steam')
    try:
        if not community_top_steam_cache or new_date: 
            nom_cats = Nomination_Category.objects.all()
            for cat in nom_cats.iterator():
                top_noms = cat.nomination_set.select_related().filter(photo__public=True,
                                                                        active=True, 
                                                                        won=False).distinct('id').order_by('-current_vote_count', '-created_date')[:PAGE_SIZE]
                if top_noms.exists():
                    data.append({
                        'cat_name': cat.name,
                        'noms': serialize_noms(top_noms),
                    })

            if not new_date:
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
            all_notifications = portrit_user.notifications.select_related().filter(Q(pending=True) | Q(active=True), created_date__gt=new_date, read=False).order_by('-created_date')
        else:
            all_notifications = portrit_user.notifications.select_related().filter(Q(pending=True) | Q(active=True), read=False).order_by('-created_date')

        data = [ ]
        for notification in all_notifications:
            if not notification.notification_type.name == 'new_follow':
                data.append({
                    'notification_type': notification.notification_type.name,
                    'create_time': time.mktime(notification.created_date.utctimetuple()),
                    'read': notification.read,
                    'source_id': notification.get_source_fid(),
                    'source_name': notification.get_source_name(),
                    'destination_id': notification.get_dest_fid(),
                    'destination_name': notification.get_dest_name(),
                    'nomination': notification.nomination.id,
                    'photo': notification.nomination.get_photo(),
                    'notification_id': notification.id,
                    'nomination_category': notification.nomination.nomination_category.name,
                })
            else:
                data.append({
                    'notification_type': notification.notification_type.name,
                    'create_time': time.mktime(notification.created_date.utctimetuple()),
                    'read': notification.read,
                    'pending': notification.pending,
                    'source_id': notification.get_source_fid(),
                    'source_name': notification.get_source_name(),
                    'destination_id': notification.get_dest_fid(),
                    'destination_name': notification.get_dest_name(),
                    'notification_id': notification.id,
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
            portrit_user.notifications.select_related().filter(active=True, read=False).update(read=True, active=False, pending=False)
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
    comment_cache = cache.get(str(nom_id) + '_comments')
    if comment_cache == None:
        try:
            nomination = Nomination.objects.get(id=nom_id)
            comments = nomination.get_comments()['comments']
            data = comments
            cache.set(str(nom_id) + '_comments', data)
        except Exception, err:
            print err
    else:
        data = comment_cache
      
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
            comment = Comment(comment=body, owner=user)
            comment.save()
            portrit_user.comment_count += 1
            portrit_user.save()
            nomination = Nomination.objects.get(id=nomination_id)
            nomination.comments.add(comment)
            nomination.save()
            owner = nomination.nominatee
            try:
                portrit_owner = Portrit_User.objects.get(fb_user=owner)
                nom_owner_name = portrit_owner.name
            except:
                portrit_owner = None
                nom_owner_name = ''
                
            #clear comment cache
            try:
                comment_cache = cache.get(str(nomination.id) + '_comments')
                if comment_cache:
                    comment_cache = nomination.get_comments()['comments']
                    cache.set(str(nomination.id) + '_comments', comment_cache)
            except Exception, err:
                print err

            voters = nomination.votes.all()
            all_commentors = FB_User.objects.filter(comment__nomination=nomination).distinct('fid')
            tagged_friends = nomination.tagged_friends.all()
            friends = { }
            # friends = [ ]
            friends[nomination.nominator.fid] = {'fid': nomination.nominator.fid,
                            'allow_notifications': nomination.nominator.get_portrit_user_notification_permission()}

            friends[owner.fid] = {'fid': owner.fid,
                            'allow_notifications': owner.get_portrit_user_notification_permission()}
                            
            #Attach target user
            for friend in all_commentors.iterator():
                if friend.fid != user.fid:
                    if friend.fid != nomination.nominator.fid:
                        friends[friend.fid] = {'fid': friend.fid,
                                                'allow_notifications': friend.get_portrit_user_notification_permission()}
                
            for friend in voters.iterator():
                if friend.fid != user.fid:
                    if friend.fid != nomination.nominator.fid:
                        friends[friend.fid] = {'fid': friend.fid,
                                                'allow_notifications': friend.get_portrit_user_notification_permission()}
                                                
            for friend in tagged_friends.iterator():
                if friend.fid != user.fid:
                    if friend.fid != nomination.nominator.fid:
                        friends[friend.fid] = {'fid': friend.fid,
                                                'allow_notifications': friend.get_portrit_user_notification_permission()}                              

            notification_type = Notification_Type.objects.get(name="new_comment")
            for friend in friends:
                friend = friends[friend]
                if friend['fid'] != user.fid:
                    notification = Notification(source=user, destination=owner, nomination=nomination, notification_type=notification_type)
                    notification.save()
                    friend['notification_id'] = notification.id
                    try:
                        Portrit_User.objects.get(fb_user__fid=friend['fid']).notifications.add(notification)
                    except Exception, err:
                        print err
                       
            friends_to_update = { }
            target_friends = get_target_friends(owner, user)
            for friend in target_friends:
                friends_to_update[friend] = {'fid': friend,
                                        'allow_notifications': False}

            node_data = {
                'method': 'new_comment',
                'secondary_method': 'new_comment_update',
                'payload': {
                    'id': nomination.id,
                    'comment': comment.comment,
                    'comment_id': comment.id,
                    'create_datetime': time.mktime(comment.created_date.utctimetuple()),
                    'comment_sender_id': user.fid,
                    'comment_sender_name': portrit_user.name,
                    'nomination_category': nomination.nomination_category.name,
                    'nom_owner_id': owner.fid,
                    'nom_owner_name': nom_owner_name,
                    'won': nomination.won,
                    'friends': friends,
                    'friends_to_update': friends_to_update,
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
            
            #Update nom comments caches
            try:
                target_friends = get_target_friends(owner, user)
                for friend in target_friends:
                    friend_recent_nom_cache = cache.get(str(friend) + '_recent_stream')
                    user_top_stream = cache.get(str(friend) + '_user_top_stream')
                    # iphone_recent_stream = cache.get(str(friend) + '_iphone_recent_stream')
                    try:
                        if friend_recent_nom_cache != None:
                            for nom in friend_recent_nom_cache:
                                if nom['id'] == nomination.id:
                                    nom['quick_comments'] = nomination.get_quick_comments()
                                
                            cache.set(str(friend) + '_recent_stream', friend_recent_nom_cache)
                    except Exception, err:
                        print err
                    
                    try:
                        if user_top_stream != None:
                            for nom_cat in user_top_stream:
                                for nom in nom_cat['noms']:
                                    if nom['id'] == nomination.id:
                                        nom['comment_count'] = nomination.get_comment_count()
                                    
                            cache.set(str(friend) + '_user_top_stream', user_top_stream)
                    except Exception, err:
                        print err
                        
                    # try:
                    #     if iphone_recent_stream != None:
                    #         for nom in iphone_recent_stream:
                    #             if nom['id'] == nomination.id:
                    #                 print "saved"
                    #                 nom['quick_comments'] = nomination.get_quick_comments()
                    #             
                    #         cache.set(str(friend) + '_iphone_recent_stream', iphone_recent_stream)
                    # except:
                    #     pass
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
        user = portrit_user.fb_user
        photo = Photo.objects.get(id=photo_id)
        
        if photo.flags.filter(flagger=portrit_user).count() == 0:
            flag_rec = Photo_Flag(flagger=portrit_user)
            flag_rec.save()
            photo.flags.add(flag_rec)
            
            if photo.flags.all().count >= 3 and not photo.validated:
                photo.active = False
                photo.save()
                photo.nominations.all().update(active=False)
        
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
            source = FB_User.objects.get(fid=int(source))
            source_portrit_user = source.get_portrit_user()
            source_following = source.get_following()
        else:
            source_following = [ ]
            
        users = Portrit_User.objects.filter(name__icontains=q)[:40]
        for user in users.iterator():
            if user.fb_user in source_following:
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
            source = FB_User.objects.get(fid=int(source))
            source_portrit_user = source.get_portrit_user()
            source_following = source.get_following()
        else:
            source_following = [ ]
    
        names = names.split(',')
        users = Portrit_User.objects.filter(name__in=names)[:100]
    
        for user in users.iterator():
            if user.fb_user in source_following:
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
            source = FB_User.objects.get(fid=int(source))
            source_portrit_user = source.get_portrit_user()
            source_following = source.get_following()
        else:
            source_following = [ ]
        
        names = names.split(',')
        users = Portrit_User.objects.filter(name__in=names)[:100]

        for user in users.iterator():
            if user.fb_user.fid in source_following:
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
        
        if method == 'gps':
            portrit_user.allow_gps_data = value
        elif method == 'privacy':
            portrit_user.allow_follows = value
        elif method == 'post_wins':
            portrit_user.allow_portrit_album = value
            
        portrit_user.save()
        data = portrit_user.get_settings()
    except Exception, err:
        print err
    
    data = simplejson.dumps(data) 
    return HttpResponse(data, mimetype='application/json')