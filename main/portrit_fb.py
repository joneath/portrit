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
        if update:
            self.fb_user.friends.clear()
        for friend in friends['data']:
            new_fb_user, created = FB_User.objects.get_or_create(fid=friend['id'])
            self.fb_user.friends.add(new_fb_user)