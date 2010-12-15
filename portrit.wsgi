import os
import sys

sys.path = ['/home/joneath/webapps/portrit', '/home/joneath/webapps/portrit/portrit', '/home/joneath/webapps/portrit/lib/python2.5'] + sys.path
from django.core.handlers.wsgi import WSGIHandler

os.environ['DJANGO_SETTINGS_MODULE'] = 'portrit.settings'
application = WSGIHandler()