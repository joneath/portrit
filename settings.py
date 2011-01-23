import os
import os.path

DEBUG = False
ENV = "LOCAL"
TEMPLATE_DEBUG = DEBUG

ADMINS = (
    # ('Your Name', 'your_email@domain.com'),
)

MANAGERS = ADMINS

if ENV == "LOCAL":
    DATABASE_ENGINE = 'mysql'           # 'postgresql_psycopg2', 'postgresql', 'mysql', 'sqlite3' or 'oracle'.
    DATABASE_NAME = 'joneath_portrit'             # Or path to database file if using sqlite3.
    DATABASE_USER = 'root'             # Not used with sqlite3.
    DATABASE_PASSWORD = ''         # Not used with sqlite3.
    DATABASE_HOST = ''             # Set to empty string for localhost. Not used with sqlite3.
    DATABASE_PORT = ''             # Set to empty string for default. Not used with sqlite3.
    
    MEDIA_ROOT = os.path.join(os.path.dirname(__file__), 'media').replace('\\','/')
    BASE_URL = "http://localhost:8000/"
    
    EMAIL_HOST = 'smtp.webfaction.com'
    EMAIL_PORT = '25'
    EMAIL_HOST_USER = 'joneath_portrit'
    EMAIL_HOST_PASSWORD = 'HGMirNOGzJC4K8uzgqMc5'
    SERVER_EMAIL = "no-reply@portrit.com"
    
    FACEBOOK_APP_ID = "155664697800227"
    FACEBOOK_APP_SECRET = "d7d7672b66720f91894a897933b6b03c"
    
    NODE_SOCKET = 8081
    NODE_HOST = 'localhost'
    
elif ENV == "TEST":
    DATABASE_ENGINE = 'mysql'           # 'postgresql_psycopg2', 'postgresql', 'mysql', 'sqlite3' or 'oracle'.
    DATABASE_NAME = 'portrit'             # Or path to database file if using sqlite3.
    DATABASE_USER = 'root'             # Not used with sqlite3.
    DATABASE_PASSWORD = ''         # Not used with sqlite3.
    DATABASE_HOST = ''             # Set to empty string for localhost. Not used with sqlite3.
    DATABASE_PORT = ''             # Set to empty string for default. Not used with sqlite3.
    
    BASE_URL = "http://portrit.com"
    MEDIA_ROOT = '/home/joneath/webapps/portrit_media/'
    
    EMAIL_HOST = 'smtp.webfaction.com'
    EMAIL_PORT = '25'
    EMAIL_HOST_USER = 'joneath_portrit'
    EMAIL_HOST_PASSWORD = 'HGMirNOGzJC4K8uzgqMc5'
    SERVER_EMAIL = "no-reply@portrit.com"
    
    FACEBOOK_APP_ID = "123063501058161"
    FACEBOOK_APP_SECRET = "25f31ff59105385308be7fed55fa1b5e"
    
    NODE_SOCKET = 8081
    NODE_HOST = 'http://10.117.57.137'
    
else:
    DATABASE_ENGINE = 'mysql'           # 'postgresql_psycopg2', 'postgresql', 'mysql', 'sqlite3' or 'oracle'.
    DATABASE_NAME = 'portrit'             # Or path to database file if using sqlite3.
    DATABASE_USER = 'root'             # Not used with sqlite3.
    DATABASE_PASSWORD = ''         # Not used with sqlite3.
    DATABASE_HOST = ''             # Set to empty string for localhost. Not used with sqlite3.
    DATABASE_PORT = ''             # Set to empty string for default. Not used with sqlite3.
    
    BASE_URL = "http://portrit.com"
    MEDIA_ROOT = '/home/joneath/webapps/portrit_media/'
    
    EMAIL_HOST = 'smtp.webfaction.com'
    EMAIL_PORT = '25'
    EMAIL_HOST_USER = 'joneath_portrit'
    EMAIL_HOST_PASSWORD = 'HGMirNOGzJC4K8uzgqMc5'
    SERVER_EMAIL = "no-reply@portrit.com"
    
    FACEBOOK_APP_ID = "126374870731237"
    FACEBOOK_APP_SECRET = "d6c5a3023e9b92aa4bae8dd7581deeaf"
    
    NODE_SOCKET = 8081
    NODE_HOST = '184.73.249.110'

# Local time zone for this installation. Choices can be found here:
# http://en.wikipedia.org/wiki/List_of_tz_zones_by_name
# although not all choices may be available on all operating systems.
# On Unix systems, a value of None will cause Django to use the same
# timezone as the operating system.
# If running in a Windows environment this must be set to the same as your
# system time zone.
TIME_ZONE = 'America/Los Angeles'

# Language code for this installation. All choices can be found here:
# http://www.i18nguy.com/unicode/language-identifiers.html
LANGUAGE_CODE = 'en-us'

SITE_ID = 1

# If you set this to False, Django will make some optimizations so as not
# to load the internationalization machinery.
USE_I18N = True
    
MEDIA_URL = '/site_media/'

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
    'south',
    'sorl.thumbnail',
)
