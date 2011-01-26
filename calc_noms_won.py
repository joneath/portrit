import os
import sys

os.environ["DJANGO_SETTINGS_MODULE"] = "settings"
import json, socket, urllib, urllib2
from django.db.models import Q, Count

from settings import ENV, NODE_SOCKET, NODE_HOST
from main.models import *

def calc_noms_won():
    # active_noms = Nomination.objects.filter(active=True)
    nominatees = FB_User.objects.filter(nominated_user__isnull=False, nominated_user__active=True).distinct('id')
    
    for nominatee in nominatees.iterator():
        user_wins = [ ]
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
                    user_wins.append(nom)
                else:
                    nom.active = False
                    nom.save()
            except:
                pass

        # if len(user_wins) > 0:
        #     portrit_user = user_wins[0].nominatee.portrit_fb_user.all()[0]
        #     if portrit_user.allow_notifications:
        #         try:
        #             nom_cat = user_wins[0].nomination_category.name
        #             name = portrit_user.name.split(' ')[0]
        #             if len(user_wins) == 1:
        #                 trophy = 'http://s3.amazonaws.com/portrit/img/invite/' + nom_cat.replace(' ', '_').lower() + '.png'
        #                 trophy_text = name + ', won the ' + nom_cat + ' trophy for his rockin\' photo!'
        #             else:
        #                 trophy = 'http://s3.amazonaws.com/portrit/img/invite/blank.png'
        #                 trophy_text = name + ', won ' + str(len(user_wins)) + ' trophies for his rockin\' photos!'
        #             url = 'https://graph.facebook.com/' + str(user_wins[0].nominatee.fid) + '/feed'
        #             values = {'access_token' : portrit_user.access_token,
        #                       'picture' : trophy,
        #                       'link' : 'http://test.portrit.com/#/nom_id=' + str(nom.id) + '/ref=facebook',
        #                       'name': trophy_text, 
        #                       'caption': 'Click the trophy to see ' + name + '\'s winning photos.',
        #                       }
        #     
        #             data = urllib.urlencode(values)
        #             req = urllib2.Request(url, data)
        #             response = urllib2.urlopen(req)
        #             data = response.read()
        #         except:
        #             pass
            
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
    
    nom.notification_set.filter(notification_type__name='new_nom').update(active=False)
    
    notification_type = Notification_Type.objects.get(name="nom_won")
    for friend in target_friends:
        try:
            portrit_user = Portrit_User.objects.get(fb_user=FB_User.objects.get(fid=friend))
            notification = Notification(destination=nom.nominatee, nomination=nom, notification_type=notification_type)
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
        sock.send(node_data)
        sock.close()
    except:
        pass

if __name__ == '__main__':
    calc_noms_won()