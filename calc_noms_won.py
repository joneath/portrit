import os
import sys

os.environ["DJANGO_SETTINGS_MODULE"] = "settings"
import json, socket, urllib, urllib2
from django.db.models import Q, Count
from django.core.cache import cache

from settings import ENV, NODE_SOCKET, NODE_HOST
from main.documents import *

from to_facebook_trophy_album import to_facebook_trophy_album
from main.user_views import create_portrit_album

def calc_noms_won():
    try:
        cache.clear()
        cache._cache.flush_all()
    except:
        pass
        
    try: 
        nominations = Nomination.objects.filter(active=True, won=False)
        for nomination in nominations:
            nominatee = nomination.nominatee
            try:
                user_wins = [ ]
                friends = nominatee.get_following()
                user_noms = Nomination.objects.filter(active=True, won=False, nominatee=nominatee).order_by('-current_vote_count', '-created_date')
                user_noms_cat = { }
                for nom in user_noms:
                    try:
                        nom_cat = nom.nomination_category
                        #Continue if nom in same cat as already calculated
                        try:
                            test = user_noms_cat[nom_cat]
                            nom.active = False;
                            nom.photo.nominations = []
                            nom.photo.save()
                            nom.save()
                            continue
                        except:
                            user_noms_cat[nom_cat] = True
                
                        user_cat_stream = Nomination.objects.filter(
                            Q(nominatee__in=friends) |
                            Q(nominatee=nominatee),
                            nomination_category=nom_cat,
                            active=True).order_by('-current_vote_count', '-created_date')
            
                        try:
                            if user_cat_stream[0].id == nom.id:
                                if (nom.won == False and nom.current_vote_count >= 1):
                                    mark_nom_as_won(nom)
                                    user_wins.append(nom)
                            else:
                                pass
                        except:
                            pass
                    except Exception, err:
                        print err

        Nomination.objects.filter(active=True).update(set__active=False)

        # Return losing nom photos to owners
        noms = Nomination.objects.filter(active=False, cleared=False, won=False)
        for nom in noms:
            try:
                nom.photo.nominations = [ ]
                nom.photo.save()
            except:
                pass
            nom.cleared = True
            nom.save()
        
    except Exception, err:
        print err
    
def mark_nom_as_won(nom):
    try:
        nom.won = True
        nom.photo.trophy = True
        nom.photo.save()
        nom.save()
        print "Nomination Won Saved"
    
        #Notification Types
        new_nom_notification_type = Notification_Type.objects.get(name='new_nom')
        notification_type = Notification_Type.objects.get(name="nom_won")
    
        active_voters = nom.votes
        active_commentors = nom.get_commentors()
    
        friends_to_notify = { }
        target_friends = { }
    
        #Save nominatee win
        nominatee = nom.nominatee
        nominatee.winning_nomination_count += 1
        nominatee.winning_noms.append(nom)
        nominatee.save()
    
        print "Nominatee Winning Record Saved"
        
        try:
            if nominatee.allow_winning_fb_album:
                if not nominatee.portrit_fb_album_fid:
                    create_portrit_album(nominatee)
                to_facebook_trophy_album(nominatee.fb_user.access_token, nom.photo.get_photo()['source'], nominatee.portrit_fb_album_fid, nom)
        except Exception, err:
            print err
        
    
        target_friends[nominatee.fb_user.fid] = nominatee

        #Save tagged user win
        try:
            for tagged_user in nom.tagged_users:
                try:
                    tagged_user.winning_nomination_count += 1
                    tagged_user.winning_noms.append(nom)
                    tagged_user.save()
                
                    notification = Notification(destination=tagged_user, owner=tagged_user, nomination=nom, notification_type=notification_type)
                    notification.save()
                    
                    friends_to_notify[tagged_user.fb_user.fid] = tagged_user.get_notification_data()
                    friends_to_notify[tagged_user.fb_user.fid]['notification_id'] = str(notification.id)
                    
                    #Send email notification
                    if tagged_user.email_on_follow:
                        node_data = {
                            'email': True,
                            'method': 'nom_won',
                            'payload': {
                                'target_email': tagged_user.email,
                                'target_fid': tagged_user.fb_user.fid,
                                'target_name': tagged_user.name,
                                'target_username': tagged_user.username,
                                'nom_id': str(nom.id),
                                'nom_cat': nom.nomination_category
                            }
                        }

                        node_data = json.dumps(node_data)
                        try:
                            sock = socket.socket(
                                socket.AF_INET, socket.SOCK_STREAM)
                            sock.connect((NODE_HOST, NODE_SOCKET))
                            sock.send(node_data)
                            sock.close()
                        except Exception, err:
                            print err

                    #Check send to facebook
                    try:
                        if tagged_user.allow_winning_fb_album :
                            if not tagged_user.portrit_fb_album_fid:
                                create_portrit_album(tagged_user)
                            to_facebook_trophy_album(tagged_user.fb_user.access_token, nom.photo.get_photo()['source'], tagged_user.portrit_fb_album_fid, nom)
                    except:
                        pass
                except:
                    pass
        except:
            pass
    
        target_friends[nom.nominator.fb_user.fid] = nom.nominator
        for friend in active_voters:
            target_friends[friend.fb_user.fid] = friend
        for friend in active_commentors:
            target_friends[friend.fb_user.fid] = friend
    
        Notification.objects.filter(nomination=nom, notification_type=new_nom_notification_type).update(set__active=False)
        
        for friend in target_friends.keys():
            try:
                notification = Notification(destination=nom.nominatee, owner=target_friends[friend], nomination=nom, notification_type=notification_type)
                notification.save()
            except:
                pass
            try:
                friends_to_notify[friend] = target_friends[friend].get_notification_data()
                friends_to_notify[friend]['notification_id'] = str(notification.id)
                
                {'fid': friend, 'notification_id': str(notification.id)}
            except:
                pass
    
        print "Friends To Notify"        
        print friends_to_notify
    
        node_data = {
            'method': 'nom_won',
            'payload': {
                'id': str(nom.id),
                'nomination_category': nom.nomination_category,
                'nominator': nom.nominator.fb_user.fid,
                'nominator_name': nom.nominator.name,
                'nominator_username': nom.nominator.username,
                'nominatee': nom.nominatee.fb_user.fid,
                'nominatee_name': nom.nominatee.name,
                'nominatee_username': nom.nominatee.username,
                'vote_count': nom.current_vote_count,
                'won': nom.won,
                'photo': nom.photo.get_photo(),
                'friends': friends_to_notify,
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
            
        #Send email notification
        if nominatee.email_on_follow:
            node_data = {
                'email': True,
                'method': 'nom_won',
                'payload': {
                    'target_email': nominatee.email,
                    'target_fid': nominatee.fb_user.fid,
                    'target_name': nominatee.name,
                    'target_username': nominatee.username,
                    'nom_id': str(nom.id),
                    'nom_cat': nom.nomination_category
                }
            }

            node_data = json.dumps(node_data)
            try:
                sock = socket.socket(
                    socket.AF_INET, socket.SOCK_STREAM)
                sock.connect((NODE_HOST, NODE_SOCKET))
                sock.send(node_data)
                sock.close()
            except Exception, err:
                print err
    except Exception, err:
        print err

if __name__ == '__main__':
    calc_noms_won()