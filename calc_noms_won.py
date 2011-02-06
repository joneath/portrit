import os
import sys

os.environ["DJANGO_SETTINGS_MODULE"] = "settings"
import json, socket, urllib, urllib2
from django.db.models import Q, Count
from django.core.cache import cache

from settings import ENV, NODE_SOCKET, NODE_HOST
from main.models import *

def calc_noms_won():
    # active_noms = Nomination.objects.filter(active=True)
    try:
        cache.clear()
        cache._cache.flush_all()
    except:
        pass
        
    nominatees = FB_User.objects.filter(nominated_user__isnull=False, nominated_user__active=True).distinct('id')
    for nominatee in nominatees.iterator():
        try:
            user_wins = [ ]
            friends = nominatee.friends.all()
            user_noms = Nomination.objects.filter(active=True, won=False, nominatee=nominatee).order_by('-current_vote_count', '-created_date')
            user_noms_cat = { }
            for nom in user_noms.iterator():
                try:
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
                        active=True).distinct('id').order_by('-current_vote_count', '-created_date')
            
                    try:
                        if user_cat_stream[0].id == nom.id:
                            if (nom.won == False and nom.current_vote_count > 0):
                                mark_nom_as_won(nom)
                                user_wins.append(nom)
                        
                                try:
                                    portrit_user = nominatee.get_portrit_user()
                                    if portrit_user.allow_portrit_album and portrit_user.ask_permission == False:
                                        from to_facebook_trophy_album import to_facebook_trophy_album
                                        if not portrit_user.portrit_album_fid:
                                            from main.user_views import create_portrit_album
                                            create_portrit_album(nominatee, portrit_user)
                                        to_facebook_trophy_album(portrit_user.access_token, nom.get_photo()['src'], portrit_user.portrit_album_fid, nom)
                                except:
                                    pass
                        else:
                            pass
                    except:
                        pass
                except:
                    pass
                    
            if len(user_wins) > 0:
                try:
                    portrit_user = user_wins[0].nominatee.get_portrit_user()
                    if portrit_user.allow_notifications and portrit_user.allow_portrit_album == False:
                        try:
                            nom_cat = user_wins[0].nomination_category.name
                            name = portrit_user.name.split(' ')[0]
                            if len(user_wins) == 1:
                                trophy = 'http://s3.amazonaws.com/portrit/img/invite/' + nom_cat.replace(' ', '_').lower() + '.png'
                                trophy_text = name + ', won the ' + nom_cat + ' trophy for their rockin\' photo!'
                            else:
                                trophy = 'http://s3.amazonaws.com/portrit/img/invite/blank.png'
                                trophy_text = name + ', won ' + str(len(user_wins)) + ' trophies for their rockin\' photos!'

                            values = {'access_token' : portrit_user.access_token,
                                      'picture' : trophy,
                                      'link' : 'http://portrit.com/#/nom_id=' + str(nom.id) + '/ref=facebook',
                                      'name': trophy_text, 
                                      'caption': 'Click the trophy to see ' + name + '\'s winning photos.',
                                      }
                            url = 'https://graph.facebook.com/' + str(user_wins[0].nominatee.fid) + '/feed?' + urllib.urlencode(values)
                            data = urllib.urlencode(values)
                            req = urllib2.Request(url, data)
                            response = urllib2.urlopen(req)
                            data = response.read()
                        except:
                            pass
                except:
                    pass
        except:
            pass
                
    Nomination.objects.filter(active=True).update(active=False)
    
def mark_nom_as_won(nom):
    nom.won = True
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
    friends = { }
    for friend in target_friends:
        try:
            fb_user = FB_User.objects.get(fid=friend)
            portrit_user = Portrit_User.objects.get(fb_user=fb_user)
            try:
                friends[fb_user.fid] = {'fid': fb_user.fid,
                                'allow_notifications': fb_user.get_portrit_user_notification_permission()}
            except:
                pass
            notification = Notification(destination=nom.nominatee, nomination=nom, notification_type=notification_type)
            notification.save()
            portrit_user.notifications.add(notification)
            try:
                friends[fb_user.fid]['notification_id'] = notification.id
            except:
                pass
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
            'friends': friends,
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