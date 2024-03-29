import oauth, urllib, urllib2, json
import settings


signature_method = oauth.OAuthSignatureMethod_HMAC_SHA1()

SERVER = getattr(settings, 'OAUTH_SERVER', 'twitter.com')
REQUEST_TOKEN_URL = getattr(settings, 'OAUTH_REQUEST_TOKEN_URL', 'https://%s/oauth/request_token' % SERVER)
ACCESS_TOKEN_URL = getattr(settings, 'OAUTH_ACCESS_TOKEN_URL', 'https://%s/oauth/access_token' % SERVER)
AUTHORIZATION_URL = getattr(settings, 'OAUTH_AUTHORIZATION_URL', 'http://%s/oauth/authorize' % SERVER)

CONSUMER_KEY = getattr(settings, 'TWITTER_CONSUMER_KEY', '')
CONSUMER_SECRET = getattr(settings, 'TWITTER_CONSUMER_SECRET', '')
MOBILE_CONSUMER_KEY = getattr(settings, 'TWITTER_MOBILE_CONSUMER_KEY', '')
MOBILE_CONSUMER_SECRET = getattr(settings, 'TWITTER_MOBILE_CONSUMER_SECRET', '')

# We use this URL to check if Twitters oAuth worked
TWITTER_CHECK_AUTH = 'https://twitter.com/account/verify_credentials.json'
TWITTER_FRIENDS = 'https://twitter.com/statuses/friends.json'
TWITTER_UPDATE_STATUS = 'https://twitter.com/statuses/update.json'

def request_oauth_resource(consumer, url, access_token, parameters=None, signature_method=signature_method, http_method="GET"):
    """
    usage: request_oauth_resource( consumer, '/url/', your_access_token, parameters=dict() )
    Returns a OAuthRequest object
    """
    oauth_request = oauth.OAuthRequest.from_consumer_and_token(
        consumer, token=access_token, http_method=http_method, http_url=url, parameters=parameters,
    )
    oauth_request.sign_request(signature_method, consumer, access_token)
    return oauth_request


def fetch_response(oauth_request, connection):
    url = oauth_request.to_url()
    connection.request(oauth_request.http_method, url)
    response = connection.getresponse()
    s = response.read()
    return s

def get_unauthorised_request_token(consumer, connection, signature_method=signature_method):
    oauth_request = oauth.OAuthRequest.from_consumer_and_token(
        consumer, http_url=REQUEST_TOKEN_URL
    )
    oauth_request.sign_request(signature_method, consumer, None)
    resp = fetch_response(oauth_request, connection)
    token = oauth.OAuthToken.from_string(resp)
    return token


def get_authorisation_url(consumer, token, signature_method=signature_method):
    oauth_request = oauth.OAuthRequest.from_consumer_and_token(
        consumer, token=token, http_url=AUTHORIZATION_URL
    )
    oauth_request.sign_request(signature_method, consumer, token)
    return oauth_request.to_url()

def get_oauth_url(oauth_request):
    url = oauth_request.to_url()
    package = urllib.urlopen(url)
    return package.read()

def exchange_request_token_for_access_token(consumer, request_token, signature_method=signature_method, params={}):
    oauth_request = oauth.OAuthRequest.from_consumer_and_token(
        consumer, token=request_token, http_url=ACCESS_TOKEN_URL, parameters=params
    )
    oauth_request.sign_request(signature_method, consumer, request_token)
    resp = get_oauth_url(oauth_request)
    return oauth.OAuthToken.from_string(resp) 

def is_authenticated(consumer, connection, access_token):
    oauth_request = request_oauth_resource(consumer, TWITTER_CHECK_AUTH, access_token)
    json = fetch_response(oauth_request, connection)
    if 'screen_name' in json:
        return json
    return False

def get_friends(consumer, connection, access_token, page=0):
    """Get friends on Twitter"""
    oauth_request = request_oauth_resource(consumer, TWITTER_FRIENDS, access_token, {'page': page})
    json = fetch_response(oauth_request, connection)
    return json

def update_status(consumer, connection, access_token, status):
    """Update twitter status, i.e., post a tweet"""
    oauth_request = request_oauth_resource(consumer,
                                           TWITTER_UPDATE_STATUS,
                                           access_token,
                                           {'status': status},
                                           http_method='POST')
    json = fetch_response(oauth_request, connection)
    return json
    
def shorten_url(url):
    url = url.replace('http://portrit', 'http://www.portrit')
    
    bitly_params = {
        'login': settings.BITLY_LOGIN,
        'apiKey': settings.BITLY_APIKEY,
        'longUrl': url,
        'format': 'json',
    }
    params = urllib.urlencode(bitly_params)
    bitly_request_url = 'http://api.bit.ly/v3/shorten?' + params
    data = urllib2.urlopen(bitly_request_url).read()
    data = json.loads(data)
    url = data['data']['url']
    
    return url