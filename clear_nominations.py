import os
import sys

os.environ["DJANGO_SETTINGS_MODULE"] = "settings"
import json, socket, urllib, urllib2
from django.db.models import Q, Count
from django.core.cache import cache

from settings import ENV, NODE_SOCKET, NODE_HOST
from main.documents import *

init_clear = True

def clear_noms():
    if init_clear:
        Nomination.objects.filter(active=False, won=False).update(set__cleared=False)
        
    noms = Nomination.objects.only('photo').filter(active=False, cleared=False, won=False)
    
    for nom in noms:
        try:
            nom.photo.nominations = [ ]
            nom.photo.save()
        except:
            pass
        nom.cleared = True
        nom.save()

if __name__ == '__main__':
    clear_noms()