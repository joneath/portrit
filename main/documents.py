from mongoengine import *
import datetime, time

from django.contrib.sites.models import Site
from django.core.cache import cache
 
CACHE_EXPIRES = 5 * 60 # 10 minutes
    
class Comment(Document):
    active = BooleanField(default=True)
    created_date = DateTimeField(default=datetime.datetime.now)
    comment = StringField(required=True)
    owner = ReferenceField('Portrit_User')
    nomination = StringField()
    
    meta = {
        'ordering': ['-created_date'],
        'indexes': ['nomination', 'owner']
    }
    
class Nomination_Category(Document):
    active = BooleanField(default=True)
    order = IntField(default=0)
    title = StringField(max_length=200, required=True, unique=True)
    
    meta = {
        'ordering': ['-order']
    }
    
class Nomination(Document):
    active = BooleanField(default=True)
    removed = BooleanField(default=False)
    cleared = BooleanField(default=False)
    created_date = DateTimeField(default=datetime.datetime.now)
    won = BooleanField(default=False)
    
    nomination_category = StringField()
    caption = StringField(max_length=140)
    # comments = ListField(ReferenceField(Comment))
    
    photo = ReferenceField('Photo')
    public = BooleanField(default=False)
    
    tagged_users = ListField(ReferenceField('Portrit_User'))
    nominator = ReferenceField('Portrit_User')
    nominatee = ReferenceField('Portrit_User')
    
    #Votes
    current_vote_count = IntField(default=1)
    votes = ListField(ReferenceField('Portrit_User'))
    up_voters = ListField(ReferenceField('Portrit_User'))
    down_voters = ListField(ReferenceField('Portrit_User'))
    
    meta = {
        'ordering': ['-created_date'],
        'indexes': ['tagged_users', 
                    'nominator',
                    'nominatee']
    }
    
    def get_tagged_users(self):
        tagged_users = [ ]
        try:
            for user in self.tagged_users:
                tagged_users.append({
                    'user': user.fb_user.fid,
                    'name': user.name,
                    'username': user.username,
                })
        except:
            pass
            
        return tagged_users
        
    def get_commentors(self):
        try:
            commentors = [ ]
            comments = Comment.objects.filter(nomination=str(self.id))
            for comment in comments:
                commentors.append(comment.owner)
                
            return commentors
        except:
            return [ ]
        
    def get_comments(self):
        comment_cache = cache.get(str(self.id) + '_comments')
        if not comment_cache:
            comment_list = [ ]
            comments = Comment.objects.filter(nomination=str(self.id), active=True)
            for comment in comments:
                comment_list.append({
                    'comment': comment.comment,
                    'owner_id': comment.owner.fb_user.fid,
                    'owner_name': comment.owner.name,
                    'owner_username': comment.owner.username,
                    'create_datetime': time.mktime(comment.created_date.utctimetuple()),
                })
            cache.set(str(self.id) + '_comments', comment_list)
            return comment_list
        else:
            return comment_cache
        
    def get_quick_comments(self):
        try:
            comment_list = [ ]
            comments = Comment.objects.filter(nomination=str(self.id), active=True)
            comment_count = len(comments)
            split = 3

            if comment_count > 3:
                split = 2

            for comment in comments[:split]:
                comment_list.append({
                    'comment': comment.comment,
                    'owner_id': comment.owner.fb_user.fid,
                    'owner_name': comment.owner.name,
                    'owner_username': comment.owner.username,
                    'create_datetime': time.mktime(comment.created_date.utctimetuple()),
                })
            return comment_list
        except:
            return []
            
    def get_comment_count(self):
        try:
            return len(Comment.objects.filter(nomination=str(self.id), active=True))
        except:
            return 0
    
    def serialize_nom(self):
        try:
            votes = [ ]
            for vote in self.votes:
                votes.append({
                    'vote_user': vote.fb_user.fid,
                    'vote_name': vote.name,
                    'vote_username': vote.username,
                })
            
            data = {
                'id': str(self.id),
                'active': self.active,
                'created_time': time.mktime(self.created_date.utctimetuple()),
                'nomination_category': self.nomination_category,
                'nominator': self.nominator.fb_user.fid,
                'nominator_name': self.nominator.name,
                'nominator_username': self.nominator.username,
                'nominatee': self.nominatee.fb_user.fid,
                'nominatee_name': self.nominatee.name,
                'nominatee_username': self.nominatee.username,
                'tagged_users': self.get_tagged_users(),
                'won': self.won,
                'photo': self.photo.get_photo(),
                'caption': self.caption,
                'comments': False,
                'quick_comments': self.get_quick_comments(),
                'comment_count': self.get_comment_count(),
                'vote_count': self.current_vote_count,
                'votes': votes,
            }
        
            cache.set(str(self.id) + '_nom', data, 60*60*24)
            return data
        except:
            return { }
        
    def save(self, *args, **kwargs):
        super(Nomination, self).save(*args, **kwargs)
        cache.delete(str(self.nominatee.id) + '_active_count')
        cache.delete(str(self.nominatee.id) + '_user_active_noms')
        cache.delete(str(self.nominatee.id) + '_related_noms')
        self.serialize_nom()
    
class Photo_Flag(Document):
    active = BooleanField(default=True)
    created_date = DateTimeField(default=datetime.datetime.now)
    photo = ReferenceField('Photo')
    flagger = ReferenceField('Portrit_User')
    
    meta = {
        'ordering': ['-created_date']
    }
    
class GPS_Data(EmbeddedDocument):
    lat_long = GeoPointField()
    altitude = FloatField()
    heading = FloatField()
    accuracy = FloatField()
    speed = FloatField()
    altitudeAccuracy = FloatField()
    
    meta = {
        'indexes': ['lat_long']
    }
    
class Photo(Document):
    active = BooleanField(default=True)
    validated = BooleanField(default=False)
    pending = BooleanField(default=False)
    trophy = BooleanField(default=False)
    public = BooleanField(default=False)
    created_date = DateTimeField(default=datetime.datetime.now)
    
    path = StringField()
    thumbnail = StringField()
    large = StringField()
    iphone = StringField()
    crop = StringField()
    crop_small = StringField()
    
    local_copy = BooleanField(default=True)
    
    height = IntField()
    width = IntField()
    
    location = EmbeddedDocumentField(GPS_Data)
    
    nominations = ListField(ReferenceField('Nomination'))
    flags = ListField(ReferenceField(Photo_Flag))
    owner = ReferenceField('Portrit_User')
    
    meta = {
        'ordering': ['-created_date'],
        'indexes': ['owner',
                    'location',
                    'nominations']
    }
    
    def get_photo(self):
        try:
            photo_cache = cache.get(str(self.id) + '_photo')
            if not photo_cache:
                data = {
                    'id': str(self.id),
                    'created_time': time.mktime(self.created_date.utctimetuple()),
                    'thumbnail': self.thumbnail,
                    'crop': self.crop,
                    'crop_small': self.crop_small,
                    'source': self.large,
                    'iphone': self.iphone,
                    'height': self.height,
                    'width': self.width
                }
                cache.set(str(self.id) + '_photo', data)
                return data
            else:
                return photo_cache
        except:
            return None
    
    def delete_local_copy(self):
        import os
        os.remove(self.path)
        os.remove(self.path + '_130.jpg')
        os.remove(self.path + '_720.jpg')
        os.remove(self.path + '_crop.jpg')
        os.remove(self.path + '_crop_small.jpg')
        
        self.local_copy = False
        self.save()
    
class FB_User(EmbeddedDocument):
    active = BooleanField(default=True)
    pending = BooleanField(default=False)
    created_date = DateTimeField(default=datetime.datetime.now)
    
    fid = IntField(unique=True)
    access_token = StringField()
    mobile_access_token = StringField()
    
    about = StringField()
    location = StringField()
    
    meta = {
        'ordering': ['-created_date'],
        'indexes': ['fid']
    }
    
    def get_access_token(self):
        if self.access_token:
            return self.access_token
        elif self.mobile_access_token:
            return self.mobile_access_token
        else:
            return None
    
class Twitter_User(EmbeddedDocument):
    active = BooleanField(default=True)
    pending = BooleanField(default=False)
    created_date = DateTimeField(default=datetime.datetime.now)

    access_token = StringField()
    mobile_access_token = StringField()
    unauthed_token = StringField()
    
    meta = {
        'ordering': ['-created_date'],
        'indexes': ['access_token']
    }
    
    def get_access_token(self):
        if self.access_token:
            return {
                'mobile': False,
                'access_token': self.access_token
            }
        elif self.mobile_access_token:
            return {
                'mobile': True,
                'access_token': self.mobile_access_token
            }
        else:
            return None
    
class Portrit_User(Document):
    active = BooleanField(default=True)
    pending = BooleanField(default=False)
    created_date = DateTimeField(default=datetime.datetime.now)
    
    #Permissions
    allow_winning_fb_album = BooleanField(default=False)
    allow_follows = BooleanField(default=True)
    allow_gps = BooleanField(default=True)
    email_on_follow = BooleanField(default=False)
    email_on_nomination = BooleanField(default=False)
    email_on_win = BooleanField(default=False)
    push_notifications = BooleanField(default=False)
    
    push_comments = BooleanField(default=True)
    push_nominations = BooleanField(default=True)
    push_wins = BooleanField(default=True)
    push_follows = BooleanField(default=True)
    
    username = StringField(max_length=60)
    name = StringField(max_length=160)
    email = StringField(max_length=255)
    tutorial_completed = BooleanField(default=False)
    
    cool = BooleanField(default=False)
    
    portrit_fb_album_fid = IntField(default=0)
    
    #Analytics
    web_app_first = BooleanField(default=True)
    iphone_app_first = BooleanField(default=True)
    has_iphone = BooleanField(default=False)
    given_nomination_count = IntField(default=0)
    recieved_nomination_count = IntField(default=0)
    selfish_nomination_count = IntField(default=0)
    winning_nomination_count = IntField(default=0)
    invite_count = IntField(default=0)
    vote_count = IntField(default=0)
    comment_count = IntField(default=0)
    
    winning_noms = ListField(ReferenceField(Nomination))
    
    fb_user = EmbeddedDocumentField(FB_User, unique=True)
    twitter_user = EmbeddedDocumentField(Twitter_User)
    
    following = ListField(ReferenceField('Follow'))
    followers = ListField(ReferenceField('Follow'))
    
    meta = {
        'ordering': ['-created_date'],
        'indexes': ['username',
                    'name',
                    'email',
                    'following',
                    'followers']
    }
    
    def get_twitter_access_token(self):
        try:
            if self.twitter_user.active:
                if self.twitter_user.access_token:
                    return self.twitter_user.access_token
                elif self.twitter_user.mobile_access_token:
                    return self.twitter_user.mobile_access_token
                else:
                    return None
            else:
                return None
        except:
            return None
    
    def check_follow(self, target):
        following = filter(lambda follow: follow.user == target and follow.active == True, self.following)
        if following:
            return True
        else:
            return False
            
    def get_notification_data(self):
        """Used for Node notifications"""
        data = {
            'fid': self.fb_user.fid,
            'push_on': self.push_notifications,
            'push_comments': self.push_comments,
            'push_nominations': self.push_nominations,
            'push_wins': self.push_wins,
            'push_follows': self.push_follows
        }
        return data
            
    def get_following_ids(self):
        from django.db.models import Q
        try:
            following_id_list = cache.get(str(self.id) + '_following_id')
            if not following_id_list:
                following = filter(lambda follow: follow.pending == False and follow.active == True and follow.user , self.following)
                following_dict = {}
                for follow in following:
                    if follow.user.username:
                        following_dict[follow.user.id] = follow.user.id

                following_list = following_dict.values()
                cache.set(str(self.id) + '_following_id', following_list)
                return following_list
            else:
                return following_id_list
        except Exception, err:
            print err
            return []
    
    def get_following(self):
        try:
            following = filter(lambda follow: follow.pending == False and follow.active == True, self.following)
            following_dict = { }
            for follow in following:
                if follow.user.username:
                    following_dict[follow.user.id] = follow.user
            
            return following_dict.values()
        except:
            return []
        
    def get_followers(self):
        try:
            followers = filter(lambda follow: follow.pending == False and follow.active == True, self.followers)
            followers_dict = { }
            for follow in followers:
                if follow.user.username:
                    followers_dict[follow.user.id] = follow.user

            return followers_dict.values()
        except:
            return []
            
    def get_following_data(self):        
        follow_data = [ ]
        following = self.get_following()
        for user in following:
            user_data = cache.get(str(user.id))
            if not user_data:
                try:
                    if user.username:
                        user_data = {
                            'fid': user.fb_user.fid,
                            'name': user.name,
                            'username': user.username,
                        }
                        follow_data.append(user_data)
                        cache.set(str(self.id), user_data)
                except:
                    pass
            else:
                follow_data.append(user_data)
        return follow_data
    
    def get_user(self):
        data = {
            'fid': self.fb_user.fid,
            'name': self.name,
            'username': self.username,
        }
    
    def get_settings(self):
        try:
            return {
                'gps': self.allow_gps,
                'follows': self.allow_follows,
                'post_wins': self.allow_winning_fb_album,
                'email_on_follow': self.email_on_follow,
                'email_on_nomination': self.email_on_nomination,
                'email_on_win': self.email_on_win,
                'push_on_comment': self.push_comments,
                'push_on_nomination': self.push_nominations,
                'push_on_wins': self.push_wins,
                'push_on_follow': self.push_follows,
            }
            
        except Exception, err:
            print err
            return { }
    
    def get_follow_counts(self):
        try:
            return {
                'following': self.following.count(),
                'followers': self.followers.count()
            }
        except:
            return {
                'following': 0,
                'followers': 0
            }
            
    def get_tutorial_counts(self):
        nom_count = 3 - self.given_nomination_count
        vote_count = 3 - self.vote_count
        comment_count = 3 - self.comment_count

        if nom_count <= 0 and vote_count <= 0 and comment_count <= 0:
            self.tutorial_completed = True
            self.save()
            return False
        else:        
            return {
                'nom_count': nom_count,
                'vote_count': vote_count,
                'comment_count': comment_count,
            }
    
    def get_active_nominations(self):
        try:
            active_nominations = self.active_nominations(active=True).order_by('current_vote_count', '-created_date')
        except:
            return [ ]
    
class Follow(Document):
    active = BooleanField(default=True)
    pending = BooleanField(default=False)
    created_date = DateTimeField(default=datetime.datetime.now)
    
    user = ReferenceField(Portrit_User)
    pending_notification = ReferenceField('Notification')
    
    meta = {
        'indexes': ['active',
                    'user',
                    'created_date']
    }
    
class Notification_Type(Document):
    active = BooleanField(default=True)
    created_date = DateTimeField(default=datetime.datetime.now)
    name = StringField(unique=True)

    meta = {
        'ordering': ['-created_date']
    }

class Notification(Document):
    active = BooleanField(default=True)
    read = BooleanField(default=False)
    pending = BooleanField(default=False)
    created_date = DateTimeField(default=datetime.datetime.now)

    notification_type = ReferenceField(Notification_Type)

    source = ReferenceField(Portrit_User)
    destination = ReferenceField(Portrit_User)
    owner = ReferenceField(Portrit_User)

    nomination = ReferenceField(Nomination)

    meta = {
        'ordering': ['-created_date'],
        'indexes': ['source',
                    'destination',
                    'owner',
                    'nomination',
                    'active']
    }
    
    def get_nomination_id(self):
        try:
            return str(self.nomination.id)
        except:
            return None
        
    def get_nomination_category(self):
        try:
            return self.nomination.nomination_category
        except:
            return None
        