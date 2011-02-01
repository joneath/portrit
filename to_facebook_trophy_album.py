import os
import sys
os.environ["DJANGO_SETTINGS_MODULE"] = "settings"

from main.models import Portrit_User, FB_User, Album, Photo, Nomination, Nomination_Category, Comment, \
                        Notification, Notification_Type
from settings import ENV, FACEBOOK_APP_ID, FACEBOOK_APP_SECRET, NODE_SOCKET, NODE_HOST, MEDIA_ROOT

import json, socket, urllib, urllib2, datetime
from urllib import FancyURLopener

class MyOpener(FancyURLopener):
    version = 'Mozilla/5.0 (Windows; U; Windows NT 5.1; it; rv:1.8.1.11) Gecko/20071127 Firefox/2.0.0.11'

def to_facebook_trophy_album(img_src, facebook_album_id):
    print img_src
    print facebook_album_id
    now = datetime.datetime.now()
    name = str(facebook_album_id) + '_' + str(now.strftime("%Y%m%dT%H%M%S"))
    path = MEDIA_ROOT + '/photos/temp/' + name
    image = MyOpener()
    image.retrieve(img_src, path)
    
    url = 'https://graph.facebook.com/me/albums'
    values = {'access_token' : portrit_user.access_token,
              'name' : 'Portrit Trophies',
              }

    data = urllib.urlencode(values)
    req = urllib2.Request(url, data)
    response = urllib2.urlopen(req)
    data = response.read()
    data = simplejson.loads(data)

    os.remove(path)
    
if __name__ == '__main__':
    to_facebook_trophy_album()