from django.shortcuts import render_to_response, get_object_or_404, redirect
from django.http import HttpRequest, HttpResponse, HttpResponseRedirect, HttpResponseForbidden, HttpResponseNotFound
from django.template import RequestContext
from django.core.exceptions import ObjectDoesNotExist
from django.db.models import Q
from django.core.cache import cache

from main.documents import *

from settings import ENV, FACEBOOK_APP_ID, FACEBOOK_APP_SECRET, NODE_SOCKET, NODE_HOST

from portrit_fb import Portrit_FB
from nomination_views import serialize_noms, serialize_nom
from top_users import get_top_users, get_interesting_users
from twitter_utils import *

from datetime import datetime
import facebook, json, socket, time, math, itertools, oauth, httplib

CONSUMER = oauth.OAuthConsumer(CONSUMER_KEY, CONSUMER_SECRET)
CONSUMER_MOBILE = oauth.OAuthConsumer(MOBILE_CONSUMER_KEY, MOBILE_CONSUMER_SECRET)

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
            print "empty"
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
                if access_token:
                    user.fb_user.mobile_access_token = access_token
                    user.save()
                else:
                    access_token = user.fb_user.mobile_access_token
            
            data = {'auth': 'valid',
                    'new': new,
                    'username': user.username,
                    'access_token': access_token}
                    
        except:
            data = {'auth': 'invalid'}
    
    data = json.dumps(data)
    return HttpResponse(data, mimetype='application/json')
    
def check_username_availability(request):
    data = False
    username = request.POST.get('username')
    try:
        Portrit_User.objects.get(username__iexact=username)
        data = True
    except Exception, err:
        print err
    
    data = json.dumps(data)
    return HttpResponse(data, mimetype='application/json')
    
@check_access_token
def add_username(request):
    data = False
    access_token = request.POST.get('access_token')
    username = request.POST.get('username')
    post_wins_to_fb = request.POST.get('post_wins')
    email_notifications = request.POST.get('email_notifications')
    
    try:
        user = get_user_from_access_token(access_token)
        try: 
            Portrit_User.objects.get(username__iexact=username)
            data = False
        except:
            print user
            user.username = username
            print user.username
            print email_notifications
            
            if post_wins_to_fb == '1' or post_wins_to_fb == 'true' or post_wins_to_fb == True:
                user.allow_winning_fb_album = True
            
            if email_notifications == '1' or email_notifications == 'true' or email_notifications == True:
                user.email_on_follow = True
                user.email_on_nomination = True
                user.email_on_win = True
            
            user.save()
            
            #Send email notification
            if user.email:
                node_data = {
                    'email': True,
                    'method': 'welcome',
                    'payload': {
                        'target_email': user.email,
                        'target_fid': user.fb_user.fid,
                        'target_name': user.name,
                        'target_username': user.username,
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
            
            data = {'username': username, 'name': user.name}
            print data
    except Exception, err:
        print err
    
    data = json.dumps(data)
    return HttpResponse(data, mimetype='application/json')

@check_access_token
def get_recent_stream(request):
    data = [ ]
    access_token = request.GET.get('access_token')
    dir = request.GET.get('dir')
    id = request.GET.get('id')
    page_size = request.GET.get('page_size')
    
    if not page_size:
        page_size = 10
    
    PAGE_SIZE = int(page_size)
    try:
        portrit_user = get_user_from_access_token(access_token)
        user = portrit_user.fb_user
        friends = portrit_user.get_following()
        
        if dir == 'new':
            nomination = Nomination.objects.get(id=id)
            nominations = Nomination.objects.filter(
                Q(nominatee__in=friends) |
                Q(nominatee=portrit_user) |
                Q(nominator=portrit_user),
                created_date__gt=nomination.created_date, 
                won=False, 
                active=True).order_by('-created_date')[:PAGE_SIZE]
        elif dir == 'old':
            nomination = Nomination.objects.get(id=id)
            nominations = Nomination.objects.filter(
                Q(nominatee__in=friends) |
                Q(nominatee=portrit_user) |
                Q(nominator=portrit_user),
                created_date__lt=nomination.created_date, 
                won=False, 
                active=True).order_by('-created_date')[:PAGE_SIZE]
        else:
            nominations = Nomination.objects.filter(
                Q(nominatee__in=friends) |
                Q(nominatee=portrit_user) |
                Q(nominator=portrit_user),
                won=False, 
                active=True).order_by('-created_date')[:PAGE_SIZE]
        
        data = serialize_noms(nominations)

    except Exception, err:
        print err
    
    data = json.dumps(data)
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
    
    data = json.dumps(data)
    return HttpResponse(data, mimetype='application/json')
    
@check_access_token
def get_winners_stream(request):
    PAGE_SIZE = 10
    data = [ ]
    access_token = request.GET.get('access_token')
    dir = request.GET.get('dir')
    id = request.GET.get('id')
    
    try:
        portrit_user = get_user_from_access_token(access_token)
        user = portrit_user.fb_user
        friends = portrit_user.get_following()
        
        if dir == 'new':
            nomination = Nomination.objects.get(id=id)
            nominations = Nomination.objects.filter(
                Q(nominatee__in=friends) |
                Q(nominatee=portrit_user) |
                Q(nominator=portrit_user),
                created_date__gt=nomination.created_date, 
                won=True).order_by('-created_date')[:PAGE_SIZE]
        elif dir == 'old':
            nomination = Nomination.objects.get(id=id)
            nominations = Nomination.objects.filter(
                Q(nominatee__in=friends) |
                Q(nominatee=portrit_user) |
                Q(nominator=portrit_user),
                created_date__lt=nomination.created_date, 
                won=True).order_by('-created_date')[:PAGE_SIZE]
        else:
            nominations = Nomination.objects.filter(
                Q(nominatee__in=friends) |
                Q(nominatee=portrit_user) |
                Q(nominator=portrit_user),
                won=True).order_by('-created_date')[:PAGE_SIZE]
        
        data = serialize_noms(nominations)
    except Exception, err:
        print err
    
    data = json.dumps(data)
    return HttpResponse(data, mimetype='application/json')
    
def paginate_data(data, dir, pos):
    PAGE_SIZE = 10
    bottom = 0
    top = 10
    pos = int(pos)

    if pos + PAGE_SIZE > top:
        if dir == 'up':
            top = pos + PAGE_SIZE
        else:
            top = pos
            
    if top - PAGE_SIZE > 0:
        bottom = top - PAGE_SIZE
        
    print top
    print bottom
        
    data = data[bottom:top]
    print len(data)
    data = serialize_noms(data, bottom)
    return data
    
def get_nom_detail(request):
    data = [ ]
    PAGE_SIZE = 10
    
    nom_id = request.GET.get('nom_id')
    cat = request.GET.get('cat')
    source = request.GET.get('source')
    community = request.GET.get('community')
    nav_selected = request.GET.get('nav_selected')
    pos = request.GET.get('pos')
    dir = request.GET.get('dir')
    
    try:
        nomination = Nomination.objects.get(id=nom_id)
    except:
        nomination = None
        
    following = [ ]
    if source and source != 'undefined':
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
            won=False).order_by('-current_vote_count', '-created_date')
                
        if dir:
            data = paginate_data(data, dir, pos)
            
        elif nomination:
            data = list(data)
            selected_index = data.index(nomination)
            top = 10
            bottom = 0
        
            if selected_index - 5 > 0:
                bottom = selected_index - 4
        
            if selected_index + 5 > top:
                top = selected_index + 5
            
            data = data[bottom:top]
            data = serialize_noms(data, bottom)
        else:
            data = data[:PAGE_SIZE]
            data = serialize_noms(data)
        
    elif nav_selected == 'stream_winners':
        data = Nomination.objects.filter(
            Q(nominatee__in=source_following) |
            Q(tagged_users__in=source_following) |
            Q(tagged_users__in=[source]) |
            Q(nominatee=source) |
            Q(nominator=source),
            won=True).order_by('-created_date', '-current_vote_count')
            
            
        if dir:
            data = paginate_data(data, dir, pos)

        elif nomination:
            data = list(data)
            selected_index = data.index(nomination)
            top = 10
            bottom = 0

            if selected_index - 5 > 0:
                bottom = selected_index - 4

            if selected_index + 5 > top:
                top = selected_index + 5

            data = data[bottom:top]
            data = serialize_noms(data, bottom)
        else:
            data = data[:PAGE_SIZE]
            data = serialize_noms(data)
        
    elif nav_selected == 'community_active':
        cat = nomination.nomination_category
        if nomination.active:
            data = Nomination.objects.filter(
                nomination_category=cat, 
                active=True,
                public=True,
                won=False).order_by('-current_vote_count', '-created_date')
            
            if dir:
                data = paginate_data(data, dir, pos)
            else:
                data = list(data)
                selected_index = data.index(nomination)
                top = 10
                bottom = 0

                if selected_index - 5 > 0:
                    bottom = selected_index - 4

                if selected_index + 5 > top:
                    top = selected_index + 5

                data = data[bottom:top]
                data = serialize_noms(data, bottom)
        else:
            data = [serialize_nom(nomination)]
        
    elif nav_selected == 'community_top':
        if nomination:
            cat = nomination.nomination_category
        else:
            cat = cat.replace('-', ' ');
            
        data = Nomination.objects.filter(
            nomination_category=cat, 
            active=True,
            public=True,
            won=False).order_by('-current_vote_count', '-created_date')
            
        if dir:
            data = paginate_data(data, dir, pos)

        elif nomination:
            data = list(data)
            selected_index = data.index(nomination)
            top = 10
            bottom = 0

            if selected_index - 5 > 0:
                bottom = selected_index - 4

            if selected_index + 5 > top:
                top = selected_index + 5

            data = data[bottom:top]
            data = serialize_noms(data, bottom)
        else:
            data = data[:PAGE_SIZE]
            data = serialize_noms(data)
        
    elif nav_selected == 'profile_trophies':
        if nomination:
            cat = nomination.nomination_category
        else:
            cat = cat.replace('-', ' ');
        
        data = Nomination.objects.filter(
            Q(tagged_users__in=[source]) |
            Q(nominatee=source),
            nomination_category=cat,
            won=True).order_by('-current_vote_count', '-created_date')
            
        if dir:
            data = paginate_data(data, dir, pos)

        elif nomination:
            data = list(data)
            selected_index = data.index(nomination)
            top = 10
            bottom = 0

            if selected_index - 5 > 0:
                bottom = selected_index - 4

            if selected_index + 5 > top:
                top = selected_index + 5

            data = data[bottom:top]
            data = serialize_noms(data, bottom)
        else:
            data = data[:PAGE_SIZE]
            data = serialize_noms(data)
        
    elif nav_selected == 'profile_active':
        data = Nomination.objects.filter(
            Q(tagged_users__in=[source]) |
            Q(nominatee=source),
            active=True, 
            won=False).order_by('-created_date', '-current_vote_count')
            
        if dir:
            data = paginate_data(data, dir, pos)

        elif nomination:
            data = list(data)
            selected_index = data.index(nomination)
            top = 10
            bottom = 0

            if selected_index - 5 > 0:
                bottom = selected_index - 4

            if selected_index + 5 > top:
                top = selected_index + 5

            data = data[bottom:top]
            data = serialize_noms(data, bottom)
        else:
            data = data[:PAGE_SIZE]
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
    data = json.dumps(data)
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
    
    data = json.dumps(data)
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
    
    data = json.dumps(data)
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

    data = json.dumps(data)
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
    public = request.POST.get('public')

    try:
        nominator_portrit_user = get_user_from_access_token(access_token)
        nominatee_portrit_user = Portrit_User.objects.get(fb_user__fid=int(owner))
        
        photo = Photo.objects.get(id=photo_id)
        photo.pending = False
        if public:
            photo.public = True
            
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
            new_nomination = None
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
                    new_nomination = nomination
                    
                    try:
                        for tag in tags:
                            if tag != '':
                                tagged_user = Portrit_User.objects.get(fb_user__fid=int(tag))
                                tagged_user_list.append(tagged_user)
                                nomination.tagged_users.append(tagged_user)
                                
                                try:
                                    notification = Notification(owner=tagged_user, source=nominator_portrit_user, destination=tagged_user, nomination=nomination, notification_type=tagged_notification)
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
                        'nominator_username': nomination.nominator.username,
                        'nominatee': nomination.nominatee.fb_user.fid,
                        'nominatee_name': nomination.nominatee.name,
                        'nominatee_username': nomination.nominatee.username,
                        'tagged_users': nomination.get_tagged_users(),
                        'won': False,
                        'created_time': time.mktime(nomination.created_date.utctimetuple()),
                        'caption': comment_text,
                        'comments': False,
                        'quick_comments': [ ],
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
                
            for user in new_nomination.nominatee.get_followers():
                target_friends.append(user)
               
            if new_nomination.nominator.id != new_nomination.nominatee.id:
                target_friends.append(new_nomination.nominatee)
                
            target_friends = list(set(target_friends))
            friends = { }
            for friend in target_friends:
                try:
                    friends[friend.fb_user.fid] = friend.get_notification_data()
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
                
            #Send email notification
            if new_nomination.nominator.id != new_nomination.nominatee.id and new_nomination.nominatee.email_on_nomination:
                user = new_nomination.nominatee
                source = new_nomination.nominator
                node_data = {
                    'email': True,
                    'method': 'new_nom',
                    'payload': {
                        'target_email': user.email,
                        'target_fid': user.fb_user.fid,
                        'target_name': user.name,
                        'target_username': user.username,
                        'nom_cat': new_nomination.nomination_category,
                        'nom_id': str(new_nomination.id),
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

    data = json.dumps(data) 
    return HttpResponse(data, mimetype='application/json')
  
@check_access_token   
def vote_on_nomination(request):
    data = []

    direction = request.POST.get('direction')
    nomination_id = request.POST.get('nomination_id')
    access_token = request.POST.get('access_token')
    voter = get_user_from_access_token(access_token)
    nomination = Nomination.objects.get(id=nomination_id)
    
    if not voter in nomination.votes and nomination.active:
        if direction == 'up':
            nomination.current_vote_count += 1
            nomination.up_voters.append(voter)
        elif direction == 'down':
            nomination.current_vote_count -= 1
            nomination.down_voters.append(voter)

        nomination.votes.append(voter)
        nomination.save()

        try:
            voter.vote_count += 1
            voter.save()
        except Exception, err:
            print err

        target_friends = nomination.nominatee.get_following()
        for vote in nomination.votes:
            target_friends.append(vote)
            
        target_friends.append(nomination.nominatee)
            
        friends = { }
        for friend in target_friends:
            try:
                friends[friend.fb_user.fid] = friend.get_notification_data()
            except:
                friends = { }
        
        node_data = {
            'method': 'vote',
            'payload': {
                'nom_id': str(nomination.id),
                'nominatee': nomination.nominatee.fb_user.fid,
                'nominatee_name': nomination.nominatee.name,
                'nominatee_username': nomination.nominatee.username,
                'nomination_category': nomination.nomination_category,
                'vote_count': nomination.current_vote_count,
                'vote_user': voter.fb_user.fid,
                'vote_name': voter.name,
                'vote_username': voter.username,
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
                'nominatee': nomination.nominatee.fb_user.fid,
                'nominatee_name': nomination.nominatee.name,
                'nominatee_username': nomination.nominatee.username}

    data = json.dumps(data)
    return HttpResponse(data, mimetype='application/json')
    
def get_follow_count(request):
    data = False
    user = request.GET.get('user')

    try:
        portrit_user = Portrit_User.objects.get(fb_user__fid=int(user))

        try:
            following_count = len(portrit_user.get_following())
        except:
            following_count = 0

        try:
            followers_count = len(portrit_user.get_followers())
        except:
            followers_count = 0

        data = {
            'following': following_count,
            'followers': followers_count,
        }
    except Exception, err:
        print err

    data = json.dumps(data)
    return HttpResponse(data, mimetype='application/json')
  
@check_access_token  
def follow_unfollow_user(request):
    data = [ ]
    access_token = request.POST.get('access_token')
    target = request.POST.get('target')
    method = request.POST.get('method')
    
    try:
        source = get_user_from_access_token(access_token)
        target = Portrit_User.objects.get(username=target)
        
        if method == 'follow':
            pending = False
            if not target.allow_follows:
                pending = True
            
            following_rec = Follow(user=target, pending=pending)
            following_rec.save()
            source.following.append(following_rec)
            source.save()
            
            #Create follower following user record
            follower_rec = Follow(user=source, pending=pending)
            follower_rec.save()
            target.followers.append(follower_rec)
            target.save()
                
            #Create following notification
            try:
                # if not follower_rec.pending_notification:
                notification_type = Notification_Type.objects.get(name='new_follow')
                notification = Notification(owner=target, source=source, destination=target, pending=pending, notification_type=notification_type)
                notification.save()
            
                if pending:
                    following_rec.pending_notification = notification
                    following_rec.save()
                
                node_data = {
                    'method': 'new_follow',
                    'secondary_method': 'new_follow_update',
                    'payload': {
                        'id': str(notification.id),
                        'create_datetime': time.mktime(notification.created_date.utctimetuple()),
                        'follower_id': source.fb_user.fid,
                        'follower_name': source.name,
                        'follower_username': source.username,
                        'friends': {target.fb_user.fid: target.get_notification_data()},
                        'pending': pending
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
                    
                #Send email notification
                if target.email_on_follow:
                    node_data = {
                        'email': True,
                        'method': 'new_follow',
                        'payload': {
                            'target_email': target.email,
                            'target_fid': target.fb_user.fid,
                            'target_name': target.name,
                            'target_username': target.username,
                            'source_fid': source.fb_user.fid,
                            'source_name': source.name,
                            'source_username': source.username
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
                source_following = source.following
                following_record = filter(lambda follow: follow.user == target and follow.active == True, source_following)
                for rec in following_record:
                    rec.active = False
                    rec.save()
                
                target_followers = target.followers
                follower_record = filter(lambda follow: follow.user == source and follow.active == True, target_followers)
                for rec in follower_record:
                    rec.active = False
                    rec.save()

            except Exception, err:
                print err
            
        data = [True]
    except Exception, ex:
        print ex
    
    data = json.dumps(data)
    return HttpResponse(data, mimetype='application/json')
    
@check_access_token
def follow_permission_submit(request):
    data = False
    notification_id = request.POST.get('notification_id')
    value = request.POST.get('value')
    try:
        notification = Notification.objects.get(id=notification_id)
        notification.active = False
        notification.read = True
        notification.pending = False
        
        follow_rec = Follow.objects.filter(pending_notification=notification)
        
        follower = notification.source
        owner = notification.owner
        
        follower_rec = Follow(user=follower)
        follower_rec.save()
        owner.followers.append(follower_rec)
        owner.save()
        
        if value == '1':
            follow_rec.update(set__active=True)
            follow_rec.update(set__pending=False)
            
        elif value == '0':
            follow_rec.update(set__active=False)
            follow_rec.update(set__pending=False)
            
        notification.save()
            
        data = True
        
    except Exception, ex:
        print ex
    
    data = json.dumps(data)
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
        
            source_following_list = []
            source_following = source.get_following()
            for follower in source_following:
                source_following_list.append(follower.id)
        
            for user in target_followers:
                if source and user.id in source_following_list:
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

            source_following_list = []
            source_following = source.get_following()
            for following in source_following:
                source_following_list.append(following.id)
            
            if mutual and target.id != source.id:
                source_following.append(source)
        
            for user in target_following:
                if source and user.id in source_following_list:
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
    
    data = json.dumps(data)
    return HttpResponse(data, mimetype='application/json')

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
        if access_token:
            source_portrit_user = get_user_from_access_token(access_token)
            source = source_portrit_user.fb_user
        else:
            source_portrit_user = None
            source = None
        target_portrit_user = Portrit_User.objects.get(fb_user__fid=int(target))
        target = target_portrit_user.fb_user
    
        if method == 'followers':
            target_followers = target_portrit_user.get_followers()
            data['count'] = len(target_followers)
            if not all:
                target_followers = target_followers[PAGE_SIZE * (page - 1):PAGE_SIZE * page]
                
            if source:
                source_following = source_portrit_user.get_following()
                source_following_list = []
                for follower in source_following:
                    source_following_list.append(follower.id)
        
            for user in target_followers:
                photo_count = 0
                trophy_count = 0
                active_count = 0
                try:
                    photo_count = len(Photo.objects.filter(owner=user,
                                                    nominations__size=0,
                                                    trophy=False,
                                                    active=True, 
                                                    pending=False))
                    trophy_count = len(Nomination.objects.filter(Q(nominatee=user) | Q(tagged_users__in=[user]), won=True))
                    active_count = len(Nomination.objects.filter(Q(nominatee=user) | Q(tagged_users__in=[user]), active=True, won=False))
                except:
                    pass
                    
                if source and user.id in source_following_list:
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
            
            if source:
                source_following = source_portrit_user.get_following()
                source_following_list = []
                for following in source_following:
                    source_following_list.append(following.id)
        
            for user in target_following:
                photo_count = 0
                trophy_count = 0
                active_count = 0
                try:
                    photo_count = len(Photo.objects.filter(owner=user,
                                                    nominations__size=0,
                                                    trophy=False,
                                                    active=True, 
                                                    pending=False))
                    trophy_count = len(Nomination.objects.filter(Q(nominatee=user) | Q(tagged_users__in=[user]), won=True))  #fb_user.winning_noms.all().count()
                    active_count = len(Nomination.objects.filter(Q(nominatee=user) | Q(tagged_users__in=[user]), active=True, won=False))  #fb_user.active_nominations.all().count()
                except:
                    pass
                    
                if source and user.id in source_following_list:
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
                    
        from operator import itemgetter  
        data['data'] = sorted(data['data'], key=itemgetter('name'))
    except Exception, err:
        print err
    
    data = json.dumps(data)
    return HttpResponse(data, mimetype='application/json')
   
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
    username = request.GET.get('username')
    dir = request.GET.get('dir')
    pid = request.GET.get('pid')
    page_size = request.GET.get('page_size')
    method = request.GET.get('method')
    
    if not page_size:
        page_size = 10
    else:
        page_size = int(page_size)
    
    try:
        if username and username != 'null':
            portrit_user = Portrit_User.objects.get(username=username)
            user = portrit_user.fb_user
            
            if access_token:
                source_portrit_user = get_user_from_access_token(access_token)
                source = source_portrit_user.fb_user
                data['follow'] = source_portrit_user.check_follow(portrit_user)
            else:
                source_portrit_user = None
                source = None
        else:
            portrit_user = get_user_from_access_token(access_token)
            user = portrit_user.fb_user
            
        # Set user data
        data['user']['fid'] = user.fid
        data['user']['name'] = portrit_user.name
        data['user']['username'] = portrit_user.username

        if method == 'active':
            user_active_noms = Nomination.objects.filter(Q(nominatee=portrit_user) | Q(tagged_users__in=[portrit_user]), active=True, won=False)
            data['active_noms'] = serialize_noms(user_active_noms)
        elif not method:
            data['active_noms_count'] = len(Nomination.objects.filter(Q(nominatee=portrit_user) | Q(tagged_users__in=[portrit_user]), active=True, won=False))

        if not method or method == 'trophies':
            user_trophy_count = cache.get(str(user.fid) + '_trophy_count')
            if not user_trophy_count:
                trophy_count = portrit_user.winning_nomination_count
                data['trophy_count'] = trophy_count
                cache.set(str(user.fid) + '_trophy_count', trophy_count)
            else:
                data['trophy_count'] = user_trophy_count
                
        if not method or method == 'photos':
            try:
                if not dir and pid:
                    selected_photo = Photo.objects.get(id=pid)
                    page_size_half = int(math.floor(page_size / 2))
                    photos_before = Photo.objects.filter(owner=portrit_user,
                                                    nominations__size=0,
                                                    created_date__gt=selected_photo.created_date,
                                                    trophy=False,
                                                    active=True, 
                                                    pending=False)[:page_size_half]
                                                    
                    photos_after = Photo.objects.filter(owner=portrit_user,
                                                    nominations__size=0,
                                                    created_date__lt=selected_photo.created_date,
                                                    trophy=False,
                                                    active=True, 
                                                    pending=False)[:page_size_half]
                                                    
                    photos = [ ]
                    for photo in photos_before:
                        photos.append(photo)
                        
                    photos.append(selected_photo)
                    
                    for photo in photos_after:
                        photos.append(photo)
                        
                elif dir == 'new':
                    photo = Photo.objects.get(id=pid)
                    photos = Photo.objects.filter(owner=portrit_user,
                                                    nominations__size=0,
                                                    created_date__gt=photo.created_date,
                                                    trophy=False,
                                                    active=True, 
                                                    pending=False)[:page_size]
                elif dir == 'old':
                    photo = Photo.objects.get(id=pid)
                    photos = Photo.objects.filter(owner=portrit_user,
                                                    nominations__size=0,
                                                    created_date__lt=photo.created_date,
                                                    trophy=False,
                                                    active=True, 
                                                    pending=False)[:page_size]
                else:
                    photos = Photo.objects.filter(owner=portrit_user,
                                                    nominations__size=0,
                                                    trophy=False,
                                                    active=True, 
                                                    pending=False)[:page_size]
                                                    
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
    
    data = json.dumps(data)
    return HttpResponse(data, mimetype='application/json')
    
@check_access_token
def get_user_stream_photos(request):
    data = [ ]
    access_token = request.GET.get('access_token')
    pid = request.GET.get('pid')
    page_size = request.GET.get('page_size')

    if not page_size:
        page_size = 15

    try:
        portrit_user = get_user_from_access_token(access_token)
        user = portrit_user.fb_user
    
        source_following = portrit_user.get_following()
        source_following_list = [ ]
        
        try:
            if not pid:
                photos = Photo.objects.filter(Q(nominations__active=False) &
                                                Q(nominations__won=False) &
                                                Q(nominations__removed=False) |
                                                Q(nominations__size=0)).filter(
                                                    Q(owner__in=source_following) |
                                                    Q(owner=portrit_user),
                                                    active=True, 
                                                    pending=False).order_by('-created_date')[:page_size]
            else:
                photo = Photo.objects.get(id=pid)
                photos = Photo.objects.filter(Q(nominations__active=False) &
                                                Q(nominations__won=False) &
                                                Q(nominations__removed=False) |
                                                Q(nominations__size=0)).filter(
                                                    Q(owner__in=source_following) | 
                                                    Q(owner=portrit_user),
                                                    created_date__lt=photo.created_date,
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

    data = json.dumps(data)
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
    
    data = json.dumps(data)
    return HttpResponse(data, mimetype='application/json')
    
def sort_by_wins(a, b):
    return cmp(int(b['count']), int(a['count']))
  
def get_user_trophies(request):
    PAGE_SIZE = 6
    data = [ ]
    access_token = request.GET.get('access_token')
    target = request.GET.get('target')
    try:
        if access_token:
            target_portrit_user = get_user_from_access_token(access_token)
        if target:
            target_portrit_user = Portrit_User.objects.get(fb_user__fid=int(target))
            
        user_trophies = cache.get(str(target_portrit_user.id) + '_user_trophies')
        if user_trophies == None:
            cats = Nomination_Category.objects.all()
            for cat in cats:
                winning_noms = Nomination.objects.filter(Q(nominatee=target_portrit_user) | 
                                                        Q(tagged_users__in=[target_portrit_user]),
                                                        nomination_category=cat.title, 
                                                        won=True).order_by('-current_vote_count', '-created_date')[:PAGE_SIZE]
                                                        
                if len(winning_noms) > 0:
                    nom_cat_data = {
                        'cat_name': cat.title,
                        'nom_count': len(winning_noms),
                        'noms': serialize_noms(winning_noms),
                    }
                    data.append(nom_cat_data)
            
            if len(data) > 0:
                from operator import itemgetter 
                data = sorted(data, key=itemgetter('nom_count'), reverse=True)
            cache.set(str(target_portrit_user.id) + '_user_trophies', data)
        else:
            data = user_trophies
    except Exception, err:
        print err

    data = json.dumps(data)
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
    
    data = json.dumps(data)
    return HttpResponse(data, mimetype='application/json')
    
# Communtiy Views
def get_top_users_request(request):
    data = [ ]
    
    try:
        data = get_top_users()
    except Exception, err:
        print err
        
    data = json.dumps(data)
    return HttpResponse(data, mimetype='application/json')
    
def get_interesting_users_request(request):
    data = [ ]
    
    try:
        data = get_interesting_users()
    except Exception, err:
        print err        
    
    data = json.dumps(data)
    return HttpResponse(data, mimetype='application/json')

def get_community_photos(request):
    data = []
    PAGE_SIZE = 21
    dir = request.GET.get('dir')
    pid = request.GET.get('pid')
    
    try:
        if dir == 'new':
            photo = Photo.objects.get(id=pid)
            photos = Photo.objects.filter((Q(nominations__active=False) &
                                            Q(nominations__won=False) &
                                            Q(nominations__removed=False)) |
                                            Q(nominations__size=0),
                                            created_date__gt=photo.created_date,
                                            active=True, 
                                            pending=False,
                                            public=True).order_by('-created_date')[:PAGE_SIZE]
        elif dir == 'old':
            photo = Photo.objects.get(id=pid)
            photos = Photo.objects.filter((Q(nominations__active=False) &
                                            Q(nominations__won=False) &
                                            Q(nominations__removed=False)) |
                                            Q(nominations__size=0),
                                            created_date__lt=photo.created_date,
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
    data = json.dumps(data)
    return HttpResponse(data, mimetype='application/json')
    
def get_community_nominations(request):
    data = []
    PAGE_SIZE = 10
    id = request.GET.get('id')
    dir = request.GET.get('dir')
    
    if dir == 'new':
        nomination = Nomination.objects.get(id=id)
        nominations = Nomination.objects.filter(created_date__gt=nomination.created_date, 
                                                active=True, 
                                                won=False, 
                                                public=True).order_by('-created_date')[:PAGE_SIZE]
        data = serialize_noms(nominations)
    elif dir == 'old':
        nomination = Nomination.objects.get(id=id)
        nominations = Nomination.objects.filter(created_date__lt=nomination.created_date, 
                                                active=True, 
                                                won=False, 
                                                public=True).order_by('-created_date')[:PAGE_SIZE]
                                                
        data = serialize_noms(nominations)
    else:
        nominations = Nomination.objects.filter(active=True, 
                                                won=False, 
                                                public=True).order_by('-created_date')[:PAGE_SIZE]
        data = serialize_noms(nominations)
    
    data = json.dumps(data)
    return HttpResponse(data, mimetype='application/json')
    
def get_community_top_nominations_cat(request):
    data = []
    PAGE_SIZE = 12
    cat = request.GET.get('cat')
    page_size = request.GET.get('page_size')
    landing = request.GET.get('landing')
    
    if page_size:
        PAGE_SIZE = int(page_size)
    
    if landing:
        nominations = cache.get('landing_nominations_' + cat.replace(' ', ''))
        if not nominations:
            nominations = Nomination.objects.filter(nomination_category=cat,
                                                    public=True).order_by('-created_date', '-current_vote_count')[:PAGE_SIZE]
            data = serialize_noms(nominations)
            cache.set('landing_nominations_' + cat.replace(' ', ''), data, 60*15)
        else:
            data = nominations
    else:    
        nominations = Nomination.objects.filter(nomination_category=cat,
                                                public=True).order_by('-created_date', '-current_vote_count')[:PAGE_SIZE]
        data = serialize_noms(nominations)
        
    data = json.dumps(data)
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
            
            if len(data) > 0:
                from operator import itemgetter 
                data = sorted(data, key=itemgetter('nom_count'), reverse=True)
            cache.set('community_top_steam', data, 60*5)
        else:
            data = community_top_steam_cache
    except Exception, err:
        print err

    data = json.dumps(data)
    return HttpResponse(data, mimetype='application/json')
    
# Notification Views
@check_access_token
def get_active_notifications(request):
    data = [ ]
    access_token = request.GET.get('access_token')
    id = request.GET.get('id')
    
    try:
        portrit_user = get_user_from_access_token(access_token)
        
        if id:
            notification = Notification.objects.get(id=id)
            all_notifications = Notification.objects.filter(owner=portrit_user,
                                                            active=True, 
                                                            created_date__gt=notification.created_date).order_by('-created_date')
        else:
            all_notifications = Notification.objects.filter(owner=portrit_user,
                                                            active=True).order_by('-created_date')
            
        data = [ ]
        for notification in all_notifications:
            
            try:
                source_id = notification.source.fb_user.fid
                source_name = notification.source.name
                source_username = notification.source.username
            except:
                source_id = None
                source_name = None
                source_username = None
                
            try:
                destination_id = notification.destination.fb_user.fid
                destination_name = notification.destination.name
                destination_username = notification.destination.username
            except:
                destination_id = None
                destination_name = None
                destination_username = None
            
            if not notification.notification_type.name == 'new_follow':
                data.append({
                    'notification_type': notification.notification_type.name,
                    'create_time': time.mktime(notification.created_date.utctimetuple()),
                    'read': notification.read,
                    'pending': notification.pending,
                    'source_id': source_id,
                    'source_name': source_name,
                    'source_username': source_username,
                    'destination_id': destination_id,
                    'destination_name': destination_name,
                    'destination_username': destination_username,
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
                    'source_id': source_id,
                    'source_name': source_name,
                    'source_username': source_username,
                    'destination_id': destination_id,
                    'destination_name': destination_name,
                    'destination_username': destination_username,
                    'notification_id': str(notification.id),
                })
    except Exception, err:
        print err
        
    data = json.dumps(data)
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
            Notification.objects.filter(owner=portrit_user, active=True).update(set__read=True, set__active=False, set__pending=False)
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
      
    data = json.dumps(data) 
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
            for other_comment in Comment.objects.filter(nomination=str(nomination.id), active=True):
                all_commentors.append(other_comment.owner)
                
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
            me_to_remove = None
            for friend in friends:
                friend_id = friend
                friend = friends[friend]
                if friend['fid'] != user.fid:
                    notification = Notification(owner=Portrit_User.objects.get(fb_user__fid=friend['fid']), source=portrit_user, destination=owner, nomination=nomination, notification_type=notification_type)
                    notification.save()
                    friend['notification_id'] = str(notification.id)
                else:
                    
                    me_to_remove = friend_id
                    
            if me_to_remove:
                del friends[me_to_remove]
                       
            node_data = {
                'method': 'new_comment',
                'secondary_method': 'new_comment_update',
                'payload': {
                    'id': str(nomination.id),
                    'comment': comment.comment,
                    'create_datetime': time.mktime(comment.created_date.utctimetuple()),
                    'comment_sender_id': user.fid,
                    'comment_sender_name': portrit_user.name,
                    'comment_sender_username': portrit_user.username,
                    'nomination_category': nomination.nomination_category,
                    'nom_owner_id': owner.fb_user.fid,
                    'nom_owner_name': owner.name,
                    'nom_owner_username': owner.username,
                    'won': nomination.won,
                    'friends': friends,
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
    
    data = json.dumps(data) 
    return HttpResponse(data, mimetype='application/json')
    
# Flag Views
@check_access_token
def flag_photo(request):
    data = False
    photo_id = request.POST.get('photo_id')
    nom_id = request.POST.get('nom_id')
    access_token = request.POST.get('access_token')
    
    try:
        portrit_user = get_user_from_access_token(access_token)
        photo = Photo.objects.get(id=str(photo_id))
        
        if len(filter(lambda flag: flag.flagger == portrit_user, photo.flags)) == 0:
            flag_rec = Photo_Flag(flagger=portrit_user)
            photo.flags.append(flag_rec)
            
            if len(photo.flags) >= 3 and not photo.validated:
                photo.active = False
                Nomination.objects.filter(photo__id=photo.id).update(set__active=False)
                
            photo.save()
        
            #Create Email, Send to Admins
            try:
                from django.core.mail import EmailMultiAlternatives
                subject = 'New Flagged Photo'
                text_content = 'FROM: ' + portrit_user.username + '\n' \
                                'PHOTO ID: ' + str(photo.id)  + '\n'
                html_content =  '<h2>FROM: ' + portrit_user.username + '</h2>' \
                                '<h2>PHOTO ID: ' + str(photo.id) + '</h2>' \
                                '<img src="' + photo.large + '"/>'

                msg = EmailMultiAlternatives(subject, html_content, 'no-reply@portrit.com', ['flag@portrit.com'])
                msg.attach_alternative(html_content, "text/html")
                msg.send()
            except:
                pass
        
        data = True
    except Exception, err:
        print err
    
    data = json.dumps(data) 
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
                    'username': user.username,
                    'follow': False
                })
            else:
                data.append({
                    'fid': user.fb_user.fid,
                    'name': user.name,
                    'username': user.username,
                    'follow': True
                })
                
        from operator import itemgetter  
        data = sorted(data, key=itemgetter('name'))
    except Exception, err:
        print err
    
    data = json.dumps(data) 
    return HttpResponse(data, mimetype='application/json')
    
def combined_search(request):
    data = [ ]
    q = request.GET.get('query')
    access_token = request.GET.get('access_token')
    SEARCH_LIMIT = 10

    try:
        if access_token:
            source = get_user_from_access_token(access_token)
            source_following = source.get_following()
        else:
            source_following = [ ]

        users = Portrit_User.objects.filter(Q(username__icontains=q) | Q(name__icontains=q))[:SEARCH_LIMIT]
        for user in users:
            if user in source_following:
                data.append({
                    'fid': user.fb_user.fid,
                    'name': user.name,
                    'username': user.username,
                    'wins': user.winning_nomination_count,
                    'following': True
                })
            else:
                data.append({
                    'fid': user.fb_user.fid,
                    'name': user.name,
                    'username': user.username,
                    'wins': user.winning_nomination_count,
                    'following': False
                })

        from operator import itemgetter  
        data = sorted(data, key=itemgetter('following', 'name'), reverse=True)
    except Exception, err:
        print err

    data = json.dumps(data) 
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
                    'username': user.username,
                    'follow': False
                })
            else:
                data.append({
                    'fid': user.fb_user.fid,
                    'name': user.name,
                    'username': user.username,
                    'follow': True
                })
                
        from operator import itemgetter  
        data = sorted(data, key=itemgetter('name'))
    except Exception, err:
        print err
    
    data = json.dumps(data) 
    return HttpResponse(data, mimetype='application/json')
    
def search_by_email(request):
    data = [ ]
    source = request.POST.get('source')
    emails = request.POST.get('emails')
    
    print emails
    try:
        if source:
            source = Portrit_User.objects.get(fb_user__fid=int(source))
            source_following = source.get_following()
        else:
            source_following = [ ]
    
        emails = emails.split(',')
        users = Portrit_User.objects.filter(email__in=emails)[:100]
    
        for user in users.iterator():
            if user in source_following:
                data.append({
                    'fid': user.fb_user.fid,
                    'name': user.name,
                    'username': user.username,
                    'follow': False
                })
            else:
                data.append({
                    'fid': user.fb_user.fid,
                    'name': user.name,
                    'username': user.username,
                    'follow': True
                })
                
        from operator import itemgetter  
        data = sorted(data, key=itemgetter('name'))
    except Exception, err:
        print err
    
    data = json.dumps(data) 
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

    data = json.dumps(data) 
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
            portrit_user.allow_gps = value
        elif method == 'privacy':
            portrit_user.allow_follows = value
        elif method == 'post_wins':
            portrit_user.allow_winning_fb_album = value
        elif method == 'email_follow':
            portrit_user.email_on_follow = value
        elif method == 'email_nomination':
            portrit_user.email_on_nomination = value
        elif method == 'email_win':
            portrit_user.email_on_win = value
        elif method == 'push_comments':
            portrit_user.push_comments = value
        elif method == 'push_follow':
            portrit_user.push_follows = value
        elif method == 'push_noms':
            portrit_user.push_nominations = value
        elif method == 'push_wins':
            portrit_user.push_wins = value
            
        portrit_user.save()
        data = portrit_user.get_settings()
    except Exception, err:
        print err
    
    data = json.dumps(data) 
    return HttpResponse(data, mimetype='application/json')
 
@check_access_token    
def auth_twitter(request):
    data = ''
    CONNECTION = httplib.HTTPSConnection(SERVER)
    
    access_token = request.GET.get('access_token')
    portrit_user = get_user_from_access_token(access_token)
    
    token = get_unauthorised_request_token(CONSUMER, CONNECTION)
    auth_url = get_authorisation_url(CONSUMER, token)
    
    twitter_user = Twitter_User(pending=True, unauthed_token=token.to_string())
    portrit_user.twitter_user = twitter_user
    portrit_user.save()
    
    response = HttpResponseRedirect(auth_url)
    request.session['unauthed_token'] = token.to_string()  
    return response
    
@check_access_token
def deauth_twitter(request):
    data = False
    access_token = request.POST.get('access_token')
    try:
        portrit_user = get_user_from_access_token(access_token)
        portrit_user.twitter_user.active = False
        portrit_user.twitter_user.access_token = None
        portrit_user.twitter_user.mobile_access_token = None
        portrit_user.save()
        data = True
        print "deauthed"
    except Exception, err:
        print err
        
    data = json.dumps(data) 
    return HttpResponse(data, mimetype='application/json')
    
def return_twitter(request):
    unauthed_token = request.session.get('unauthed_token', None)
    if not unauthed_token:
        return HttpResponse("No un-authed token cookie")
    token = oauth.OAuthToken.from_string(unauthed_token)   
    if token.key != request.GET.get('oauth_token', 'no-token'):
        return HttpResponse("Something went wrong! Tokens do not match")
    verifier = request.GET.get('oauth_verifier')
    access_token = exchange_request_token_for_access_token(CONSUMER, token, params={'oauth_verifier':verifier})
    
    portrit_user = Portrit_User.objects.get(twitter_user__unauthed_token=unauthed_token)
    portrit_user.twitter_user.access_token = access_token.to_string()
    portrit_user.twitter_user.pending = False
    portrit_user.save()
    
    return render_to_response('close_popup.html', {'access_token': portrit_user.twitter_user.access_token}, context_instance=RequestContext(request))
   
@check_access_token   
def save_mobile_twitter_token(request):
    data = False
    access_token = request.POST.get('access_token')
    twitter_access_token = request.POST.get('twitter_access_token')
    twitter_access_token_secret = request.POST.get('twitter_access_token_secret')
    
    try:
        portrit_user = get_user_from_access_token(access_token)
        twitter_token = 'oauth_token_secret=' + twitter_access_token_secret + '&oauth_token=' + twitter_access_token
        if portrit_user.twitter_user:
            portrit_user.twitter_user.active = True
            portrit_user.twitter_user.access_token = None
            portrit_user.twitter_user.mobile_access_token = twitter_token
        else:
            twitter_user = Twitter_User(mobile_access_token=twitter_token)
            portrit_user.twitter_user = twitter_user

        portrit_user.save()
        
        data = True
    except Exception, err:
        print err
    
    data = json.dumps(data) 
    return HttpResponse(data, mimetype='application/json')
  
@check_access_token  
def share_twitter(request):
    data = False
    
    access_token = request.POST.get('access_token')
    url = request.POST.get('url')
    status = request.POST.get('status')
    print 'there'
    url = shorten_url(url)
    print 'here'
    status = status + ' ' + url
    
    CONNECTION = httplib.HTTPSConnection(SERVER)
    try:
        portrit_user = get_user_from_access_token(access_token)
        print portrit_user
        twitter_access_token = portrit_user.twitter_user.get_access_token()
        print twitter_access_token
        token = oauth.OAuthToken.from_string(twitter_access_token['access_token'])
        if twitter_access_token['mobile']:  
            update_status(CONSUMER_MOBILE, CONNECTION, token, status)
        else:
            update_status(CONSUMER, CONNECTION, token, status)
        
        data = True
    except Exception, err:
        print err
        
    data = json.dumps(data) 
    return HttpResponse(data, mimetype='application/json')

@check_access_token     
def push_notifications(request):
    data = False
    access_token = request.POST.get('access_token')
    method = request.POST.get('method')
    
    try:
        portrit_user = get_user_from_access_token(access_token)
        
        if method == 'on':
            portrit_user.push_notifications = True;
            portrit_user.save()
            
        data = True
    except:
        pass
        
    data = json.dumps(data) 
    return HttpResponse(data, mimetype='application/json')
    
def shorten_url_request(request):
    data = {'url': None}
    url = request.POST.get('url')
    print url
    try:
        url = shorten_url(url)
        data['url'] = url
    except Exception, err:
        print err
        
    data = json.dumps(data) 
    return HttpResponse(data, mimetype='application/json')

@check_access_token    
def delete_account(request):
    data = False
    access_token = request.POST.get('access_token')
    
    try:
        portrit_user = get_user_from_access_token(access_token)
        
        # Get all user photos
        photos = Photo.objects.filter(owner=portrit_user).update(set__active=False)
        
        
        # Get all user nominations
        nominations = Nomination.objects.filter(nominatee=portrit_user).update(set__active=False)
        
        
        # Get all user follow/following records
        following = portrit_user.following.all().update(set__active=False)
        followers = portrit_user.followers.all().update(set__active=False)
        
        Follow.objects.filter(user=portrit_user).update(set__active=False)
        
        portrit_user.active = False
        portrit_user.save()
        
        data = True
    except:
        pass
        
    data = json.dumps(data) 
    return HttpResponse(data, mimetype='application/json')