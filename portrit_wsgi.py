import os
import sys

sys.path = ['/var/www/portrit', '/var/www'] + sys.path
from django.core.handlers.wsgi import WSGIHandler

os.environ['DJANGO_SETTINGS_MODULE'] = 'portrit.settings'
application = WSGIHandler()