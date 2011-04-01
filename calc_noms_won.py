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
                    
                # if len(user_wins) > 0:
                #     try:
                #         portrit_user = user_wins[0].nominatee
                #         if portrit_user.allow_notifications and portrit_user.allow_portrit_album == False:
                #             try:
                #                 nom_cat = user_wins[0].nomination_category.name
                #                 name = portrit_user.name.split(' ')[0]
                #                 if len(user_wins) == 1:
                #                     trophy = 'http://s3.amazonaws.com/portrit/img/invite/' + nom_cat.replace(' ', '_').lower() + '.png'
                #                     trophy_text = name + ', won the ' + nom_cat + ' trophy for their rockin\' photo!'
                #                 else:
                #                     trophy = 'http://s3.amazonaws.com/portrit/img/invite/blank.png'
                #                     trophy_text = name + ', won ' + str(len(user_wins)) + ' trophies for their rockin\' photos!'
                # 
                #                 values = {'access_token' : portrit_user.access_token,
                #                           'picture' : trophy,
                #                           'link' : 'http://portrit.com/#/nom_id=' + str(nom.id) + '/ref=facebook',
                #                           'name': trophy_text, 
                #                           'caption': 'Click the trophy to see ' + name + '\'s winning photos.',
                #                           }
                #                 url = 'https://graph.facebook.com/' + str(user_wins[0].nominatee.fid) + '/feed?' + urllib.urlencode(values)
                #                 data = urllib.urlencode(values)
                #                 req = urllib2.Request(url, data)
                #                 response = urllib2.urlopen(req)
                #                 data = response.read()
                #             except:
                #                 pass
                #     except:
                #         pass
                #         
                #     try:
                #         for tagged_user in user_wins[0].tagged_friends.all():
                #             portrit_user = tagged_user.get_portrit_user()
                #             if portrit_user.allow_notifications and portrit_user.allow_portrit_album == False:
                #                 try:
                #                     nom_cat = user_wins[0].nomination_category.name
                #                     name = portrit_user.name.split(' ')[0]
                #                     if len(user_wins) == 1:
                #                         trophy = 'http://s3.amazonaws.com/portrit/img/invite/' + nom_cat.replace(' ', '_').lower() + '.png'
                #                         trophy_text = name + ', won the ' + nom_cat + ' trophy for their rockin\' photo!'
                #                     else:
                #                         trophy = 'http://s3.amazonaws.com/portrit/img/invite/blank.png'
                #                         trophy_text = name + ', won ' + str(len(user_wins)) + ' trophies for their rockin\' photos!'
                # 
                #                     values = {'access_token' : portrit_user.access_token,
                #                               'picture' : trophy,
                #                               'link' : 'http://portrit.com/#/nom_id=' + str(nom.id) + '/ref=facebook',
                #                               'name': trophy_text, 
                #                               'caption': 'Click the trophy to see ' + name + '\'s winning photos.',
                #                               }
                #                     url = 'https://graph.facebook.com/' + str(user_wins[0].nominatee.fid) + '/feed?' + urllib.urlencode(values)
                #                     data = urllib.urlencode(values)
                #                     req = urllib2.Request(url, data)
                #                     response = urllib2.urlopen(req)
                #                     data = response.read()
                #                 except:
                #                     pass
                #     except:
                #         pass
            except:
                pass
        
        #Clear photo nominations
        # print Nomination.objects.only('photo').filter(active=True)
        # for nom in Nomination.objects.only('photo').filter(active=True):
        #     photo = nom.photo
        #     print "check photo"
        #     print len(photo.nominations)
        #     print photo.trophy
        #     if len(photo.nominations) > 0 and not photo.trophy:
        #         print "cleared photo nominations"
        #         photo.nominations = []
        #         photo.save()

        Nomination.objects.filter(active=True).update(set__active=False)
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
    
        target_friends[nominatee.fb_user.fid] = nominatee
    
        #Check send to facebook
        # try:
        #     if nominatee.allow_portrit_album:
        #         if not nominatee.portrit_fb_album_fid:
        #             create_portrit_album(nominatee)
        #         to_facebook_trophy_album(nominatee.fb_user.access_token, nom.get_photo()['source'], portrit_user.portrit_fb_album_fid, nom)
        # except:
        #     pass
    
        #Save tagged user win
        try:
            for tagged_user in nom.tagged_users.all():
                try:
                    tagged_user = Portrit_User.objects.get(fb_user=tagged_user)
                    tagged_user.winning_nomination_count += 1
                    tagged_user.winning_noms.append(nom)
                    tagged_user.save()
                
                    friends_to_notify[tagged_user.fb_user.fid] = {'fid': tagged_user.fb_user.fid}
                
                    notification = Notification(destination=tagged_user, owner=tagged_user, nomination=nom, notification_type=notification_type)
                    notification.save()
                
                    #Check send to facebook
                    # try:
                    #     if tagged_user.allow_portrit_album :
                    #         if not tagged_user.portrit_fb_album_fid:
                    #             create_portrit_album(tagged_user)
                    #         to_facebook_trophy_album(portrit_user.fb_user.access_token, nom.get_photo()['source'], portrit_user.portrit_fb_album_fid, nom)
                    # except:
                    #     pass
                except:
                    pass
        except:
            pass
    
        target_friends[nom.nominator.fb_user.fid] = nom.nominator
        for friend in active_voters:
            target_friends[friend.fb_user.fid] = friend
        for friend in active_commentors:
            target_friends[friend.fb_user.fid] = friend
    
        print "Target Friends"
        print target_friends
        Notification.objects.filter(nomination=nom, notification_type=new_nom_notification_type).update(set__active=False)
    
        for friend in target_friends.keys():
            try:
                notification = Notification(destination=nom.nominatee, owner=target_friends[friend], nomination=nom, notification_type=notification_type)
                notification.save()
                try:
                    friends_to_notify[friend] = {'fid': friend, 'notification_id': str(notification.id)}
                except:
                    pass
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
    except Exception, err:
        print err

if __name__ == '__main__':
    calc_noms_won()