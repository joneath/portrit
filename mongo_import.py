import os
import sys

os.environ["DJANGO_SETTINGS_MODULE"] = "settings"
from main.documents import *

nom_cats = ['Hot', 'LOL', 'Artsy', 'Fail', 'Party Animal', 'Cute', 'WTF', 'Creepy', 'Awesome', 'Yummy']
notifications = ['tagged_nom', 'new_follow', 'nom_won', 'new_comment', 'new_nom']

def import_mongo():
    for cat in nom_cats:
        try:
            nom_cat = Nomination_Category(title=cat)
            nom_cat.save()
        except Exception, err:
            print err
        
    for notification in notifications:
        try:
            notification = Notification_Type(name=notification)
            notification.save()
        except Exception, err:
            print err
    
if __name__ == '__main__':
    import_mongo()