import os
import sys
os.environ["DJANGO_SETTINGS_MODULE"] = "settings"

from main.documents import *
from main.twitter_utils import shorten_url

from settings import ENV, FACEBOOK_APP_ID, FACEBOOK_APP_SECRET, NODE_SOCKET, NODE_HOST, MEDIA_ROOT

import json, socket, urllib, urllib2, datetime
from urllib import FancyURLopener
from urllib2 import URLError, HTTPError
from poster.encode import multipart_encode
from poster.streaminghttp import register_openers

class MyOpener(FancyURLopener):
    version = 'Mozilla/5.0 (Windows; U; Windows NT 5.1; it; rv:1.8.1.11) Gecko/20071127 Firefox/2.0.0.11'

def to_facebook_trophy_album(access_token, img_src, facebook_album_id, nom):
    now = datetime.datetime.now()
    name = str(facebook_album_id) + '_' + str(now.strftime("%Y%m%dT%H%M%S")) + '.jpg'
    path = MEDIA_ROOT + '/photos/temp/' + name
    image = MyOpener()
    image.retrieve(img_src, path)
    
    post_url = shorten_url('http://portrit.com/#!/nomination/' + str(nom.id))
    
    vote_count = nom.current_vote_count
    vote_text = '1 vote.'
    if vote_count > 1:
        vote_text = str(vote_count) + ' votes.'
    message = 'Won ' + nom.nomination_category + ' with ' + vote_text + '\n' + post_url
    args = {
        'access_token': access_token,
        'message': message,
    }
    
    register_openers()
    
    url = 'https://graph.facebook.com/' + str(facebook_album_id) + '/photos?' + urllib.urlencode(args)
    params = {'file': open(path, "rb"), 'value': 'source', 'name': name, 'filetype': 'image/jpeg'}
    datagen, headers = multipart_encode(params)
    request = urllib2.Request(url, datagen, headers)
    try:
        response = urllib2.urlopen(request)
        data = response.read()
    except HTTPError, e:
        print 'Error code: ', e.code
    except URLError, e:
        print e.reason
    except:
        pass

    os.remove(path)
    
if __name__ == '__main__':
    to_facebook_trophy_album()