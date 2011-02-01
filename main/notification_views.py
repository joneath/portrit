from django.shortcuts import render_to_response, get_object_or_404, redirect
from django.http import HttpRequest, HttpResponse, HttpResponseRedirect, HttpResponseForbidden, HttpResponseNotFound
from django.template import RequestContext
from django.core import serializers
from django.utils import simplejson
from django.contrib.auth.decorators import login_required
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.core.exceptions import ObjectDoesNotExist
from django.db.models import Q

from main.models import Portrit_User, FB_User, Album, Photo, Nomination, Nomination_Category, Comment, \
                        Notification, Notification_Type
from settings import ENV, FACEBOOK_APP_ID, FACEBOOK_APP_SECRET, NODE_SOCKET, NODE_HOST

from portrit_fb import Portrit_FB

from itertools import chain
import facebook, json, socket, time

def notification_read(request):
    data = False
    notification_id = request.POST.get('notification_id')
    kill = request.POST.get('kill')
    notification_ids = None
    print kill
    try:
        notification_ids = request.POST.get('notification_ids').split(',')
    except:
        pass
    if notification_ids:
        try:
            ids = []
            for id in notification_ids:
                if id:
                    ids.append(int(id))
            
            if kill:
                Notification.objects.filter(pk__in=ids).update(read=True, active=False)
            else:
                Notification.objects.filter(pk__in=ids).update(read=True, active=True)
            
        except:
            pass
    else:
        try:
            notification = Notification.objects.get(id=notification_id)
            notification.read = True
            if kill:
                notification.active = False
            notification.save()
            data = True
        except:
            pass
    
    data = json.dumps(data) 
    return HttpResponse(data, mimetype='application/json')
    
def get_active_notifications(user):
    all_notifications = user.notifications.select_related().filter(active=True, read=False).order_by('-created_date')
    if all_notifications.count() < 5:
        # rem_count = 5 - all_notifications.count()
        read_notifications = user.notifications.select_related().filter(active=True, read=True)
        
        all_notifications = all_notifications | read_notifications
        all_notifications = all_notifications.distinct('id').order_by('read', '-created_date')[:5]
    
    data = [ ]
    for notification in all_notifications:
        data.append({
            'notification_type': notification.notification_type.name,
            'create_time': time.mktime(notification.created_date.utctimetuple()),
            'read': notification.read,
            'source_id': notification.get_source_fid(),
            'source_name': notification.get_source_name(),
            'destination_id': notification.get_dest_fid(),
            'destination_name': notification.get_dest_name(),
            'nomination': notification.nomination.id,
            'notification_id': notification.id,
            'nomination_category': notification.nomination.nomination_category.name,
        })
        
    return data