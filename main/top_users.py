from django.db.models import Q
from django.core.cache import cache

from main.documents import *

from settings import ENV, FACEBOOK_APP_ID, FACEBOOK_APP_SECRET, NODE_SOCKET, NODE_HOST

from operator import itemgetter
import random

def get_top_users(page_size=10):
    top_users = cache.get('top_users')
    if not top_users:
        top_users = calc_top_users()
        cache.set('top_users', top_users)
        
    if page_size > len(top_users):
        page_size = len(top_users)
        
    top_users = random.sample(top_users, page_size)
        
    return top_users
    
def calc_top_users():
    users = Portrit_User.objects.filter(winning_nomination_count__gt=0, given_nomination_count__gt=0)[:150]
    
    user_list = [ ]
    for user in users:
        cat_focus = Nomination.objects.filter((Q(nominatee=user) | 
                                            Q(tagged_users__in=[user])), won=True).item_frequencies('nomination_category')

        cat_focus = sorted(cat_focus.items(), key=itemgetter(1), reverse=True)[:1][0][0]
        if user.username:
            user_list.append({
                'fid': user.fb_user.fid,
                'name': user.name,
                'username': user.username,
                'noms_won': user.winning_nomination_count,
                'top_nom_cat': cat_focus
            })
        
    return user_list
    
def get_interesting_users(page_size=10):
    interesting_users = cache.get('interesting_users')
    if not interesting_users:
        interesting_users = calc_interesting_users()
        cache.set('interesting_users', interesting_users)
        
    if page_size > len(interesting_users):
        page_size = len(interesting_users)
        
    interesting_users = random.sample(interesting_users, page_size)
        
    return interesting_users
    
def calc_interesting_users():
    users = Portrit_User.objects.filter(winning_nomination_count__gt=5, given_nomination_count__gt=5)[:150]
    
    user_list = [ ]
    for user in users:
        cat_focus = Nomination.objects.filter((Q(nominatee=user) | 
                                            Q(tagged_users__in=[user])), won=True).item_frequencies('nomination_category')

        cat_focus = sorted(cat_focus.items(), key=itemgetter(1), reverse=True)[:1][0][0]
        if user.username:
            user_list.append({
                'fid': user.fb_user.fid,
                'name': user.name,
                'username': user.username,
                'noms_won': user.winning_nomination_count,
                'top_nom_cat': cat_focus
            })
        
    return user_list