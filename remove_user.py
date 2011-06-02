import os
import sys
os.environ["DJANGO_SETTINGS_MODULE"] = "settings"

from main.documents import *

def remove_user():
    fid = 111500118
    users = Portrit_User.objects.filter(fb_user__fid=fid)
    
    for user in users:
        for follow in user.following:
            follow_user = follow.user
            
            try:                
                user_follow_rec = filter(lambda follow: follow.user == user, follow_user.following)
                follow_user.following.remove(user_follow_rec)
                # follow_user.save()
                
                user_follow_rec = filter(lambda follow: follow.user == user, follow_user.followers)
                follow_user.followers.remove(user_follow_rec)
                # follow_user.save()
            except:
                pass
            
            follow.delete()
            
        for follow in user.followers:
            follow_user = follow.user

            try:                
                user_follow_rec = filter(lambda follow: follow.user == user, follow_user.following)
                follow_user.following.remove(user_follow_rec)
                # follow_user.save()
                
                user_follow_rec = filter(lambda follow: follow.user == user, follow_user.followers)
                follow_user.followers.remove(user_follow_rec)
                # follow_user.save()
            except:
                pass

            follow.delete()
            
        user.delete()

if __name__ == '__main__':
	remove_user()