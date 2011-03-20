import os
import sys

os.environ["DJANGO_SETTINGS_MODULE"] = "settings"
import json, socket, urllib, urllib2
from django.db.models import Q, Count
from django.core.cache import cache

from settings import ENV, NODE_SOCKET, NODE_HOST
from main.models import *

def import_fb_friends(portrit_user, update=False):
    source_portrit_user = portrit_user
    source = source_portrit_user.fb_user
    
    if update:
        list_query = portrit_user.fb_user.friends.filter(portrit_fb_user__isnull=False)
    else:
        list_query = portrit_user.fb_user.friends.all()
    
    for friend in list_query:
        target = friend
        target_portrit_user = target.get_portrit_user()
        
        pending = False
        if target_portrit_user:
            if not target_portrit_user.allow_follows:
                pending = True
            
        following_rec, created = User_Following.objects.get_or_create(portrit_user=source_portrit_user, fb_user=target, pending=pending)
        if target_portrit_user:
            following_rec.active = False
            following_rec.save()
        elif not created:
            following_rec.active = True
            following_rec.save()
        
        if target_portrit_user:
            following_followers_rec, created = User_Followers.objects.get_or_create(portrit_user=source_portrit_user, fb_user=target, pending=pending)
            if not created:
                following_rec.active = True
                following_rec.save()
        
        if target_portrit_user:
            follower_rec, created = User_Followers.objects.get_or_create(portrit_user=target_portrit_user, fb_user=source, pending=pending)
            if not created:
                follower_rec.active = True
                follower_rec.save()
                
    print "import completed"
            
def import_fb_friends_for_legacy():
    for portrit_user in Portrit_User.objects.all():
        source_portrit_user = portrit_user
        source = source_portrit_user.fb_user
    
        for friend in portrit_user.fb_user.friends.filter(portrit_fb_user__isnull=False):
            target = friend
            target_portrit_user = target.get_portrit_user()
        
            pending = False
            if not target_portrit_user.allow_follows:
                pending = True
            
            following_rec, created = User_Following.objects.get_or_create(portrit_user=source_portrit_user, fb_user=target, pending=pending)
            if not created:
                following_rec.active = True
                following_rec.save()
            
            following_followers_rec, created = User_Followers.objects.get_or_create(portrit_user=source_portrit_user, fb_user=target, pending=pending)
            if not created:
                following_rec.active = True
                following_rec.save()
            
            follower_rec, created = User_Followers.objects.get_or_create(portrit_user=target_portrit_user, fb_user=source, pending=pending)
            if not created:
                follower_rec.active = True
                follower_rec.save()
    print "done"