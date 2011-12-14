# from main.models import Portrit_User, FB_User, Album, Photo, Nomination, Nomination_Category
from main.documents import *

from settings import NODE_SOCKET, NODE_HOST

import urllib2
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
        friend_ids = []
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
                following_rec = Follow(user=target_portrit_user)
                following_rec.save()
                self.user.following.append(following_rec)
                self.user.save()

                #Create follower following user record
                following_rec = Follow(user=self.user)
                following_rec.save()
                target_portrit_user.following.append(following_rec)
                following_rec = Follow(user=self.user)
                following_rec.save()
                target_portrit_user.followers.append(following_rec)
                target_portrit_user.save()

                try:
                    cache.delete(str(self.user.id) + '_following_id')
                    cache.delete(str(self.user.id) + '_follower_id')

                    cache.delete(str(target_portrit_user.id) + '_following_id')
                    cache.delete(str(target_portrit_user.id) + '_follower_id')
                except:
                    pass

                #Create Notification for friend
                try:
                    print "creating notification"
                    notification = Notification(notification_type=new_follower_notification,
                                                source=self.user,
                                                destination=target_portrit_user,
                                                owner=target_portrit_user)
                    notification.save()
                    print "notification saved"

                    node_data = {
                        'method': 'new_follow',
                        'secondary_method': 'new_follow_update',
                        'payload': {
                            'id': str(notification.id),
                            'create_datetime': time.mktime(notification.created_date.utctimetuple()),
                            'follower_id': self.user.fb_user.fid,
                            'follower_name': self.user.name,
                            'follower_username': self.user.username,
                            'friends': {target_portrit_user.fb_user.fid: target_portrit_user.get_notification_data()},
                            'pending': False
                        }
                    }

                    node_data = json.dumps(node_data)
                    try:
                        sock = socket.socket(
                            socket.AF_INET, socket.SOCK_STREAM)
                        sock.connect((NODE_HOST, NODE_SOCKET))
                        sock.send(node_data)
                        sock.close()
                    except:
                        pass
                except:
                    pass

                print "created records"