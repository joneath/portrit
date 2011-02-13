from main.models import Portrit_User, FB_User, Album, Photo, Nomination, Nomination_Category

import facebook
import urllib, urllib2
import json

class Portrit_FB(object):
    def __init__(self, graph, fb_user, access_token):
        self.graph = graph
        self.access_token = access_token
        self.fb_user = fb_user
        
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
        for friend in friends['data']:
            friend_ids.append(long(friend['id']))
         
        friend_query = self.fb_user.friends.values_list('fid', flat=True)
        for fid in friend_ids:
            if not (fid in friend_query):
                new_fb_user, created = FB_User.objects.get_or_create(fid=fid)
                self.fb_user.friends.add(new_fb_user)
            else:
                pass