# from main.models import Portrit_User, FB_User, Album, Photo, Nomination, Nomination_Category
from main.documents import *
from import_friends import import_fb_friends

import facebook
import urllib, urllib2
import json

class Portrit_FB(object):
    def __init__(self, graph, user, access_token):
        self.graph = graph
        self.access_token = access_token
        self.user = user
        
    def get_mutual_friends(self, target_user, source_user=None):
        query_url = "https://api.facebook.com/method/friends.getMutualFriends?target_uid=" + target_user + "&source_uid=" + source_user + "&access_token=" + self.access_token + "&format=json"
        req = urllib2.Request(query_url)
        try:
            response = urllib2.urlopen(req)
        except URLError, e:
            pass
            
        data = response.read()
        data = json.loads(data)
        return data
    
    def load_user_friends(self, update=False):
        friends = self.graph.get_connections("me", "friends")
        friend_ids = [ ]
        friend_id_map = { }
        for friend in friends['data']:
            friend_ids.append(long(friend['id']))
        
        friends = Portrit_User.objects.filter(fb_user__fid__in=friend_ids)
        following = self.user.get_following()
        
        new_follower_notification = Notification_Type.objects.get(name='new_follow')

        for friend in friends:
            target_portrit_user = friend
            if target_portrit_user not in following:
                #Create user follower record
                following_rec = Follow(user=target_portrit_user)
                following_rec.save()
                self.user.followers.append(following_rec)
                self.user.following.append(following_rec)
                self.user.save()
                
                #Create follower following user record
                following_rec = Follow(user=self.user)
                following_rec.save()
                target_portrit_user.following.append(following_rec)
                target_portrit_user.followers.append(following_rec)
                target_portrit_user.save()
                
                #Create Notification for friend
                try:
                    print "creating notification"
                    notification = Notification(notification_type=new_follower_notification,
                                                source=self.user,
                                                destination=target_portrit_user,
                                                owner=target_portrit_user)
                    notification.save()
                    print "notification saved"
                except:
                    pass
                
                print "created records"