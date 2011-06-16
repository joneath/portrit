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

from settings import ENV, FACEBOOK_APP_ID, FACEBOOK_APP_SECRET, NODE_SOCKET, NODE_HOST, MEDIA_ROOT, AWS_KEY, AWS_SECRET_KEY

import json, socket, urllib, urllib2, facebook, time, datetime, httplib, oauth, uuid, Image

from itertools import chain
from simples3 import S3Bucket
from urllib import FancyURLopener
from urllib2 import URLError, HTTPError
from poster.encode import multipart_encode
from poster.streaminghttp import register_openers

from photo_views import crop_to_size

class MyOpener(FancyURLopener):
    version = 'Mozilla/5.0 (Windows; U; Windows NT 5.1; it; rv:1.8.1.11) Gecko/20071127 Firefox/2.0.0.11'

def share(request, template='tools/share.html'):
    path = request.GET.get('source')
    page_url = request.GET.get('page_url')
    browser = request.GET.get('from')
    
    production_code = True
    test_code = False
    analytics = True
    
    refresh = False
    if browser == 'safari' or browser == 'firefox':
        print "here"
        refresh = True

    if ENV == 'LOCAL':
        production_code = False
        analytics = None
    elif ENV == 'TEST':
        production_code = False
        test_code = True
        analytics = None
    
    payload = {'analytics': analytics, 
                'production_code': production_code, 
                'test_code': test_code, 
                'path': path, 
                'page_url': page_url, 
                'refresh': refresh}
    return render_to_response(template, payload, context_instance=RequestContext(request))
    
def save_share(request):
    data = False
    
    selected_nom = request.POST.get('selected_nom')
    source_url = request.POST.get('source')
    comment_text = request.POST.get('caption')
    img_src = request.POST.get('path')
    
    try:
        cookie = facebook.get_user_from_cookie(
            request.COOKIES, FACEBOOK_APP_ID, FACEBOOK_APP_SECRET)
        if cookie:
            user = Portrit_User.objects.get(fb_user__fid=int(cookie["uid"]))
            now = datetime.datetime.now()
            file_name = str(uuid.uuid4())
            path = MEDIA_ROOT + '/photos/temp/' + file_name
            image = MyOpener()
            image.retrieve(img_src, path)
            
            # Photo processing
            file_loc = path
            thumbnail_size_name = file_name + '_130.jpg'
            large_size_name = file_name + '_720.jpg'
            crop_size_name = file_name + '_crop.jpg'
            crop_small_size_name = file_name + '_crop_small.jpg'
            # iphone_size_name = file_name + '_iphone.jpg'
            
            image = Image.open(file_loc)
            size = 130, 130
            image.thumbnail(size, Image.ANTIALIAS)
            image.save(file_loc + '_130.jpg', 'JPEG', quality=95)
            thumb_img_size = image.size
            
            image = Image.open(file_loc)           
            size = 720, 720
            image.thumbnail(size, Image.ANTIALIAS)
                
            image.save(file_loc + '_720.jpg', 'JPEG', quality=95)
            large_img_size = image.size
            
            #Create crop section
            cropped_image = crop_to_size(image, (300,300), large_img_size, (200, 150))
            cropped_image.save(file_loc + '_crop.jpg', 'JPEG', quality=95)
            
            #Create small crop
            small_cropped_image = crop_to_size(image, (200,200), large_img_size, (100, 100))
            small_cropped_image.save(file_loc + '_crop_small.jpg', 'JPEG', quality=95)
            
            s = S3Bucket('cdn.portrit.com', access_key=AWS_KEY, secret_key=AWS_SECRET_KEY)
            thumbnail = open(file_loc + '_130.jpg', 'rb+')
            s.put(thumbnail_size_name, thumbnail.read(), acl="public-read")
            thumbnail.close()
            
            large_image = open(file_loc + '_720.jpg', 'rb+')
            s.put(large_size_name, large_image.read(), acl="public-read")
            large_image.close()
            
            cropped_image = open(file_loc + '_crop.jpg', 'rb+')
            s.put(crop_size_name, cropped_image.read(), acl="public-read")
            cropped_image.close()
            
            small_cropped_image = open(file_loc + '_crop_small.jpg', 'rb+')
            s.put(crop_small_size_name, small_cropped_image.read(), acl="public-read")
            small_cropped_image.close()

            s3_url = "http://cdn.portrit.com/"
            photo = Photo(path=file_loc,
                        source_url=source_url,
                        thumbnail=(s3_url+thumbnail_size_name), 
                        large=(s3_url+large_size_name),
                        crop=(s3_url+crop_size_name),
                        crop_small=(s3_url+crop_small_size_name),
                        width=large_img_size[0],
                        height=large_img_size[1],
                        owner=user,
                        active=True, 
                        pending=False,
                        public=True)
            photo.save()
            
            if selected_nom:
                try:
                    nominator_portrit_user = user
                    nominatee_portrit_user = user
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
                
                    nom_cat = Nomination_Category.objects.get(title=selected_nom)
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

                    photo.nominations.append(nomination)
                    photo.save()

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
                    
                    nom_data.append(data)
                
                    #Send update notification to event handlers
                    target_friends = [ ]
                    for user in new_nomination.nominatee.get_followers():
                        target_friends.append(user)

                    # if new_nomination.nominator.id != new_nomination.nominatee.id:
                        # target_friends.append(new_nomination.nominatee)

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

                    data = nom_data
                    
                except Exception, err:
                    print err
            else:
                data = {'photo_id': str(photo.id), 'thumb': photo.crop_small, 'username': user.username}
            
    except:
        pass
    
    data = json.dumps(data) 
    return HttpResponse(data, mimetype='application/json')