var RUNTIME = 'production';
var SERVER_URL = '';
var VERSION = '1.0.0';
var TWITTER_CONSUMER = '';
var TWITTER_CONSUMER_SECRET = '';
    
if (RUNTIME == 'production'){
    SERVER_URL = 'http://app.portrit.com';
    NODE_SERVER = '';
    NODE_PORT = 8082;
    TWITTER_CONSUMER = '676tZGmZP5SDdp9h1iFnA';
    TWITTER_CONSUMER_SECRET = 'lemMxxNgnJZUQFK5mwfYzPs7JWKcmvbVtgAKssfTwA';
}
else if (RUNTIME == 'test'){
    SERVER_URL = 'http://test.portrit.com';
    // SERVER_URL = 'http://ec2-50-19-12-184.compute-1.amazonaws.com/';
    NODE_SERVER = '';
    NODE_PORT = 8082;
    TWITTER_CONSUMER = '676tZGmZP5SDdp9h1iFnA';
    TWITTER_CONSUMER_SECRET = 'lemMxxNgnJZUQFK5mwfYzPs7JWKcmvbVtgAKssfTwA';
}
else{
    SERVER_URL = 'http://192.168.1.146:8080';
    NODE_SERVER = 'localhost';
    NODE_PORT = 8082;
    TWITTER_CONSUMER = '676tZGmZP5SDdp9h1iFnA';
    TWITTER_CONSUMER_SECRET = 'lemMxxNgnJZUQFK5mwfYzPs7JWKcmvbVtgAKssfTwA';
}