import os
import os.path

from mongoengine import connect

DEBUG = True
ENV = "LOCAL"
TEMPLATE_DEBUG = DEBUG

ADMINS = (
    # ('Your Name', 'your_email@domain.com'),
)

MANAGERS = ADMINS

BITLY_LOGIN = 'portrit'
BITLY_APIKEY = 'R_554a2c395f085d017040066581d65325'

POSTMARK_API_KEY    = '7e81d8b2-4429-44e1-a493-eef87d130669'
POSTMARK_SENDER     = 'no-reply@portrit.com'

TWITTER_MOBILE_CONSUMER_KEY = 'RrYAd721jXeCJsp9QqtFw'
TWITTER_MOBILE_CONSUMER_SECRET = 'rWxNvv8pOSB0t9kgT59xVc2IUQXH1l8ESpfOst5sggw'

URBAN_KEY = 'XOeKRpIDSJmpSvVAwjRXdg'
URBAN_SECRET = 'r7RXQj6zS2ifBGXXLVy9Ag'
URBAN_MASTER = 'GtOv_7dURFOvSGLWcDne0A'
URBAN_URL = 'https://go.urbanairship.com'

if ENV == "LOCAL":
    DATABASE_ENGINE = ''           # 'postgresql_psycopg2', 'postgresql', 'mysql', 'sqlite3' or 'oracle'.
    DATABASE_NAME = ''             # Or path to database file if using sqlite3.
    DATABASE_USER = ''             # Not used with sqlite3.
    DATABASE_PASSWORD = ''         # Not used with sqlite3.
    DATABASE_HOST = ''             # Set to empty string for localhost. Not used with sqlite3.
    DATABASE_PORT = ''             # Set to empty string for default. Not used with sqlite3.
    
    MEDIA_ROOT = os.path.join(os.path.dirname(__file__), 'media').replace('\\','/')
    MEDIA_URL = '/site_media/'
    BASE_URL = "http://localhost:8000/"
    
    # EMAIL_USE_TLS = True
    # EMAIL_HOST = 'smtp.gmail.com'
    # EMAIL_PORT = '587'
    # EMAIL_HOST_USER = 'portritinc@gmail.com'
    # EMAIL_HOST_PASSWORD = 'eTKQK23qUT8Vaz5sH33j'
    SERVER_EMAIL = "no-reply@portrit.com"
    
    FACEBOOK_APP_ID = "155664697800227"
    FACEBOOK_APP_SECRET = "d7d7672b66720f91894a897933b6b03c"
    
    NODE_SOCKET = 8081
    NODE_HOST = 'localhost'
    
    CACHE_BACKEND = 'locmem://?timeout=86400&max_entries=400'
    
    AWS_KEY = 'AKIAIYXPXPJDU2VIKQKQ'
    AWS_SECRET_KEY = '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'
    
    TWITTER_CONSUMER_KEY = '676tZGmZP5SDdp9h1iFnA'
    TWITTER_CONSUMER_SECRET = 'lemMxxNgnJZUQFK5mwfYzPs7JWKcmvbVtgAKssfTwA'
    
    POSTMARK_TEST_MODE = False
    
    try:
        connect('portrit')
    except:
        print "Could not connect to Mongo"
    
elif ENV == "TEST":
    DATABASE_ENGINE = ''           # 'postgresql_psycopg2', 'postgresql', 'mysql', 'sqlite3' or 'oracle'.
    DATABASE_NAME = ''             # Or path to database file if using sqlite3.
    DATABASE_USER = ''             # Not used with sqlite3.
    DATABASE_PASSWORD = ''         # Not used with sqlite3.
    DATABASE_HOST = ''             # Set to empty string for localhost. Not used with sqlite3.
    DATABASE_PORT = ''             # Set to empty string for default. Not used with sqlite3.
    
    BASE_URL = "http://test.portrit.com"
    MEDIA_URL = 'http://d3uzvcq9wwvnca.cloudfront.net/'
    MEDIA_ROOT = '/var/www/portrit/media'
    
    SERVER_EMAIL = "no-reply@portrit.com"
    
    FACEBOOK_APP_ID = "123063501058161"
    FACEBOOK_APP_SECRET = "25f31ff59105385308be7fed55fa1b5e"
    
    NODE_SOCKET = 8080
    NODE_HOST = '10.202.159.181'
    
    CACHES = {
        'default': {
            'BACKEND': 'django.core.cache.backends.memcached.MemcachedCache',
            'LOCATION': [
                '10.244.31.67:11211',
                '10.196.154.255:11211',
            ]
        }
    }
    
    ADMINS = (
        ("Jonathan Eatherly", "jonathan.eatherly@gmail.com"),
    )
    
    AWS_KEY = 'AKIAIYXPXPJDU2VIKQKQ'
    AWS_SECRET_KEY = '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'
    
    TWITTER_CONSUMER_KEY = 'yKWjljJoVQsgt4vKTx8d7A'
    TWITTER_CONSUMER_SECRET = 'wwmtVM3qGdRA8PFIiympmWKjy0hqicoLNnIjA0Arh4'
    
    POSTMARK_TEST_MODE = False
    
    try:
        connect('portrit', host='10.243.10.233:27017,10.202.159.4:27017,10.194.106.39:27017')
    except:
        print "Could not connect to Mongo"
    
else:
    DATABASE_ENGINE = ''           # 'postgresql_psycopg2', 'postgresql', 'mysql', 'sqlite3' or 'oracle'.
    DATABASE_NAME = ''             # Or path to database file if using sqlite3.
    DATABASE_USER = ''             # Not used with sqlite3.
    DATABASE_PASSWORD = ''         # Not used with sqlite3.
    DATABASE_HOST = ''             # Set to empty string for localhost. Not used with sqlite3.
    DATABASE_PORT = ''             # Set to empty string for default. Not used with sqlite3.
    
    BASE_URL = "http://portrit.com"
    MEDIA_URL = 'http://d3uzvcq9wwvnca.cloudfront.net/'
    MEDIA_ROOT = '/var/www/portrit/media'
    
    SERVER_EMAIL = "no-reply@portrit.com"
    
    FACEBOOK_APP_ID = "126374870731237"
    FACEBOOK_APP_SECRET = "d6c5a3023e9b92aa4bae8dd7581deeaf"
    
    NODE_SOCKET = 8081
    NODE_HOST = '10.195.221.50'
    
    CACHES = {
        'default': {
            'BACKEND': 'django.core.cache.backends.memcached.MemcachedCache',
            'LOCATION': [
                '10.117.73.243:11211',
                '10.117.37.72:11211',
            ]
        }
    }
    
    ADMINS = (
        # ('Your Name', 'your_email@domain.com'),
        ("Jonathan Eatherly", "jonathan.eatherly@gmail.com"),
    )

    AWS_KEY = 'AKIAIYXPXPJDU2VIKQKQ'
    AWS_SECRET_KEY = 'nMI2Etuxpa64IXyGCbtmnmSNE7DKmX0uUhKUmzuv'
    
    TWITTER_CONSUMER_KEY = 'R2QNuraQM9QIwTnuBsMQ'
    TWITTER_CONSUMER_SECRET = 'b2eBCi8vws5ERn5n1Z40TDLGYLXoWHu3aGE4Snye3M'
    
    POSTMARK_TEST_MODE = False
    
    try:
        connect('portrit', host='10.112.81.115:27017,10.245.186.223:27017,10.195.203.165:27017')
    except:
        print "Could not connect to Mongo"
        
EMAIL_BACKEND = 'postmark.django_backend.EmailBackend'
        
SESSION_ENGINE = 'mongoengine.django.sessions'
    
# Local time zone for this installation. Choices can be found here:
# http://en.wikipedia.org/wiki/List_of_tz_zones_by_name
# although not all choices may be available on all operating systems.
# On Unix systems, a value of None will cause Django to use the same
# timezone as the operating system.
# If running in a Windows environment this must be set to the same as your
# system time zone.
TIME_ZONE = ''

# Language code for this installation. All choices can be found here:
# http://www.i18nguy.com/unicode/language-identifiers.html
LANGUAGE_CODE = 'en-us'

SITE_ID = 1

# If you set this to False, Django will make some optimizations so as not
# to load the internationalization machinery.
USE_I18N = True

LOGIN_URL = '/'

# URL prefix for admin media -- CSS, JavaScript and images. Make sure to use a
# trailing slash.
# Examples: "http://foo.com/media/", "/media/".
ADMIN_MEDIA_PREFIX = '/media/'

# Make this unique, and don't share it with anybody.
SECRET_KEY = 'oz5bgx%(ijs#b@3fkopd8070rp@7@3rhb9#&)o*k*2w0jitwvi'

SERIALIZATION_MODULES = {
    'json': 'wadofstuff.django.serializers.json'
}

# List of callables that know how to import templates from various sources.
TEMPLATE_LOADERS = (
    'django.template.loaders.filesystem.load_template_source',
    'django.template.loaders.app_directories.load_template_source',
#     'django.template.loaders.eggs.load_template_source',
)

MIDDLEWARE_CLASSES = (
    'django.middleware.common.CommonMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.middleware.gzip.GZipMiddleware',
    'middleware.htmlmailexception.HTMLMailExceptionMiddleware',
)

AUTHENTICATION_BACKENDS = (
    'main.email-auth.EmailOrUsernameModelBackend',
)

ROOT_URLCONF = 'portrit.urls'

TEMPLATE_DIRS = (
    os.path.join(os.path.dirname(__file__), 'templates').replace('\\','/')
)

INSTALLED_APPS = (
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.sites',
    'django.contrib.admin',
    'main',
)
