var RUNTIME = 'local';
var SERVER_URL = '';
var VERSION = '1.0.0';
var TWITTER_CONSUMER = '';
var TWITTER_CONSUMER_SECRET = '';
    
if (RUNTIME == 'production'){
    SERVER_URL = 'http://portrit.com';
    NODE_SERVER = '';
    NODE_PORT = 8082;
    TWITTER_CONSUMER = '676tZGmZP5SDdp9h1iFnA';
    TWITTER_CONSUMER_SECRET = 'lemMxxNgnJZUQFK5mwfYzPs7JWKcmvbVtgAKssfTwA';
}
else if (RUNTIME == 'test'){
    SERVER_URL = 'http://test.portrit.com';
    NODE_SERVER = '';
    NODE_PORT = 8082;
    TWITTER_CONSUMER = '676tZGmZP5SDdp9h1iFnA';
    TWITTER_CONSUMER_SECRET = 'lemMxxNgnJZUQFK5mwfYzPs7JWKcmvbVtgAKssfTwA';
}
else{
    SERVER_URL = 'http://192.168.1.126:8080';
    NODE_SERVER = 'localhost';
    NODE_PORT = 8082;
    TWITTER_CONSUMER = '676tZGmZP5SDdp9h1iFnA';
    TWITTER_CONSUMER_SECRET = 'lemMxxNgnJZUQFK5mwfYzPs7JWKcmvbVtgAKssfTwA';
}