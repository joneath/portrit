import os
import sys

os.environ["DJANGO_SETTINGS_MODULE"] = "settings"
import json, socket
from django.db.models import Q, Count

from settings import ENV, NODE_SOCKET, NODE_HOST
from main.models import *

def calc_noms_won():
    # active_noms = Nomination.objects.filter(active=True)
    nominatees = FB_User.objects.filter(nominated_user__isnull=False, nominated_user__active=True).distinct('id')
    
    for nominatee in nominatees.iterator():
        friends = nominatee.friends.all()
        user_noms = Nomination.objects.filter(active=True, won=False, nominatee=nominatee).order_by('-current_vote_count')
        user_noms_cat = { }
        for nom in user_noms.iterator():
            nom_cat = nom.nomination_category
            #Continue if nom in same cat as already calculated
            try:
                test = user_noms_cat[nom_cat.id]
                nom.active = False;
                nom.save()
                continue
            except:
                user_noms_cat[nom_cat.id] = True
                
            user_cat_stream = Nomination.objects.filter(
                Q(nominatee__in=friends) |
                Q(nominatee=nominatee),
                nomination_category=nom_cat,
                active=True, 
                won=False).distinct('id').order_by('-current_vote_count')
            
            try:
                if user_cat_stream[0].id == nom.id:
                    mark_nom_as_won(nom)
                else:
                    nom.active = False
                    nom.save()
            except:
                pass
            # print user_cat_stream
    
    # print active_noms
    # print nominatees
    
def mark_nom_as_won(nom):
    nom.won = True
    nom.active = False
    nom.save()
    
    target_friends = [ ]
    active_voters = nom.votes.all()
    active_commentors = FB_User.objects.filter(comment__nomination=nom)
    
    try:
        portrit_nominatee = Portrit_User.objects.get(fb_user=nom.nominatee)
        portrit_nominatee.winning_nomination_count += 1
        portrit_nominatee.save()
    except:
        pass
    
    target_friends.append(nom.nominatee.fid)
    
    for friend in active_voters.iterator():
        target_friends.append(friend.fid)
    for friend in active_commentors.iterator():
        target_friends.append(friend.fid)
        
    target_friends = list(set(target_friends))
    
    notification_type = Notification_Type.objects.get(name="nom_won")
    for friend in target_friends:
        try:
            portrit_user = Portrit_User.objects.get(fb_user=FB_User.objects.get(fid=friend))
            notification = Notification(source=nom.nominatee, nomination=nom, notification_type=notification_type)
            notification.save()
            portrit_user.notifications.add(notification)
        except:
            pass
    
    node_data = {
        'method': 'nom_won',
        'payload': {
            'id': nom.id,
            'nomination_category': nom.nomination_category.name,
            'nominator': nom.nominator.fid,
            'nominator_name': nom.nominator.get_name(),
            'nominatee': nom.nominatee.fid,
            'nominatee_name': nom.nominatee.get_name(),
            'vote_count': nom.current_vote_count,
            'won': nom.won,
            'friends': target_friends,
        }
    }

    node_data = json.dumps(node_data)
    try:
        sock = socket.socket(
            socket.AF_INET, socket.SOCK_STREAM)
        sock.connect((NODE_HOST, NODE_SOCKET))
        sock.setblocking(0)
        sock.send(node_data)
        sock.close()
    except:
        pass

if __name__ == '__main__':
    calc_noms_won()