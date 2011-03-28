from django.db import models

from django.db.models.fields import IntegerField
from django.contrib.auth.models import User

from south.modelsinspector import add_introspection_rules
add_introspection_rules([], ["^main\.models\.BigIntegerField"])

import time

from django.contrib.sites.models import Site
from django.core.cache import cache
 
CACHE_EXPIRES = 5 * 60 # 10 minutes

class BigIntegerField(IntegerField):
    empty_strings_allowed=False
    def get_internal_type(self):
        return "BigIntegerField"	
    def db_type(self):
        return 'bigint' # Note this won't work with Oracle.
        
class Comment(models.Model):
    active = models.BooleanField(default=True)
    created_date = models.DateTimeField(auto_now_add=True)
    comment = models.TextField(null=True, blank=True)
    comments = models.ManyToManyField("self", null=True, blank=True)
    owner = models.ForeignKey('FB_User')
    
    class Meta:
        ordering = ['-created_date']
        
    def get_comment_threads(self):
        initial_comment = {
            'id': self.id,
            'comment': self.comment,
            'create_datetime': time.mktime(self.created_date.utctimetuple()),
            'owner_id': self.owner.fid,
            'owner_name': self.owner.get_name(),
        }
        comment_lvl_two_count = 0
        comment_lvl_three_count = 0
        comment_count = 1
        if self.comments.all():
            initial_comment['comment_lv_two'] = [ ]
            for comment_lv_two in self.comments.all():
                initial_comment['comment_lv_two'].append({
                    'id': comment_lv_two.id,
                    'comment': comment_lv_two.comment,
                    'owner_id': comment_lv_two.owner.fid,
                    'create_datetime': time.mktime(comment_lv_two.created_date.utctimetuple()),
                    'comment_lv_three': [ ],
                })
                for commment_lv_three in comment_lv_two.comments.all():
                    initial_comment['comment_lv_two'][comment_lvl_two_count]['comment_lv_three'].append({
                        'id': commment_lv_three.id,
                        'comment': commment_lv_three.comment,
                        'owner_id': commment_lv_three.owner.fid,
                        'create_datetime': time.mktime(commment_lv_three.created_date.utctimetuple()),
                        'comment_lv_four': [ ],
                    })
                    for commment_lv_four in commment_lv_three.comments.all():
                        initial_comment['comment_lv_two'][comment_lvl_two_count]['comment_lv_three'][comment_lvl_three_count]['comment_lv_four'].append({
                            'id': commment_lv_four.id,
                            'comment': commment_lv_four.comment,
                            'create_datetime': time.mktime(commment_lv_four.created_date.utctimetuple()),
                            'owner_id': commment_lv_four.owner.fid
                        })
                        comment_count += 1
                    comment_count += 1
                    comment_lvl_three_count += 1
                comment_count += 1
                comment_lvl_two_count += 1
            
        return {'comments': initial_comment, 'count': comment_count}
                
    def __unicode__(self):
        return u'%s' % (self.comment)
        
class Badge_Category(models.Model):
    active = models.BooleanField(default=True)
    order = models.IntegerField(default=0)
    name = models.CharField(max_length=255)
    description = models.TextField(null=True, blank=True)
    
    class Meta:
        ordering = ['order']
        verbose_name_plural = "Badge Categories"
        verbose_name = "Badge Category"
    
    def __unicode__(self):
        return u'%s' % (self.name)
        
class Badge(models.Model):
    active = models.BooleanField(default=True)
    pending = models.BooleanField(default=True)
    created_date = models.DateTimeField(auto_now_add=True)
    badge_category = models.ForeignKey(Badge_Category, blank=True, null=True)
    nomination = models.ForeignKey('Nomination', blank=True, null=True)
    photo = models.ForeignKey('Photo', blank=True, null=True)
    associates = models.ManyToManyField('FB_User', blank=True, null=True)
    
    class Meta:
        ordering = ['-created_date']
    
    def __unicode__(self):
        return u'%s' % (self.name)
        
class Nomination_Category(models.Model):
    active = models.BooleanField(default=True)
    order = models.IntegerField(default=0)
    name = models.CharField(max_length=255)
    description = models.TextField(null=True, blank=True)
    
    class Meta:
        ordering = ['order']
        verbose_name_plural = "Nomination Categories"
        verbose_name = "Nomination Category"
    
    def __unicode__(self):
        return u'%s' % (self.name)
        
class Nomination(models.Model):
    active = models.BooleanField(default=True)
    created_date = models.DateTimeField(auto_now_add=True)
    up_votes = models.IntegerField(default=1)
    down_votes = models.IntegerField(default=0)
    current_vote_count = models.IntegerField(default=1)
    won = models.BooleanField(default=False)
    nomination_category = models.ForeignKey(Nomination_Category, null=True)
    caption = models.TextField(null=True, blank=True)
    nominator = models.ForeignKey('FB_User', null=True, related_name="nominator_user")
    nominatee = models.ForeignKey('FB_User', null=True, related_name="nominated_user")
    tagged_friends = models.ManyToManyField('FB_User', null=True, blank=True, related_name="tagged_users")
    comments = models.ManyToManyField(Comment, null=True, blank=True)
    votes = models.ManyToManyField('FB_User', null=True, blank=True, related_name="vote_users")
    
    class Meta:
        ordering = ['up_votes', 'down_votes', '-created_date']
        verbose_name_plural = "Nominations"
        verbose_name = "Nomination"
        
    def get_photo(self):
        photo_data = { }
        photo = self.photo_set.filter(active=True)[0]
        photo_data['id'] = photo.id
        photo_data['fid'] = photo.fid
        photo_data['crop'] = photo.crop_src
        photo_data['crop_small'] = photo.crop_small_src
        photo_data['source'] = photo.large_src
        photo_data['src_small'] = photo.fb_source_small
        photo_data['small_height'] = photo.small_height
        photo_data['small_width'] = photo.small_width
        photo_data['height'] = photo.height
        photo_data['width'] = photo.width
        photo_data['album_fid'] = photo.get_album_fid()
            
        return photo_data
        
    def get_tagged_users(self):
        tagged_users = [ ]
        try:
            for user in self.tagged_friends.all():
                tagged_users.append({
                    'user': user.fid,
                    'name': user.get_name(),
                    'username': user.get_portrit_user().username,
                })
        except:
            pass
            
        return tagged_users
        
    def get_time_remaining(self):
        """Returns seconds remaining in 24 hour period for active nomination.
            Retruns 0 if period has been passed."""
        from datetime import timedelta, datetime
        now = datetime.now()
        period = timedelta(hours=24)
        if now - self.created_date < period:
            return (period - (now - self.created_date)).seconds
        else:
            return 0
            
    def get_comments(self):
        comment_list = [ ]
        comment_count = 0
        for comment in self.comments.all():
            comment = comment.get_comment_threads()
            comment_count += comment['count']
            comment_list.append(comment)
            
        return {'comments': comment_list, 'count': comment_count}
        
    def get_quick_comments(self):
        try:
            comment_list = [ ]
            comment_count = self.get_comment_count()
            split = 3
        
            if comment_count > 3:
                split = 2
        
            for comment in self.comments.all()[:split]:
                comment_list.append({
                    'id': comment.id,
                    'comment': comment.comment,
                    'owner_id': comment.owner.fid,
                    'owner_name': comment.owner.portrit_fb_user.all()[0].name,
                    'create_datetime': time.mktime(comment.created_date.utctimetuple()),
                })
            
            return comment_list
        except:
            return []
        
    def get_comment_count(self):
        return self.comments.all().count()
        
    def update_current_vote_count(self):
        self.current_vote_count = self.up_votes - self.down_votes
        
    def serialize_nom(self):
        votes = [ ]
        for vote in self.votes.all().iterator():
            votes.append({
                'vote_user': vote.fid,
                'vote_name': vote.get_name(),
            })
        data = {
            'id': self.id,
            'active': self.active,
            'created_time': time.mktime(self.created_date.utctimetuple()),
            'nomination_category': self.nomination_category.name,
            'nominator': self.nominator.fid,
            'nominator_name': self.nominator.get_name(),
            'nominatee': self.nominatee.fid,
            'nominatee_name': self.nominatee.get_name(),
            'tagged_users': self.get_tagged_users(),
            'won': self.won,
            'photo': self.get_photo(),
            'caption': self.caption,
            'comments': False,
            'quick_comments': self.get_quick_comments(),
            'comment_count': self.get_comment_count(),
            'vote_count': self.current_vote_count,
            'votes': votes,
        }
        
        return data
        
    def save(self):
        if self.won == True:
            self.nominatee.winning_noms.add(self)
        
        super(Nomination, self).save()
        
        try:
            serialized_nom = self.serialize_nom()
            nom_cache = cache.set(str(self.id) + '_nom', serialized_nom)
        except:
            pass
    
    def __unicode__(self):
        try:
            return u'%s - %s' % (self.nomination_category.name, self.created_date)
        except:
            return 'No nomination categories'
            
class Album(models.Model):
    active = models.BooleanField(default=True)
    fid = BigIntegerField(null=True, blank=True)
    created_date = models.DateTimeField(auto_now_add=True)
    name = models.CharField(max_length=255, null=True, blank=True)

    class Meta:
        ordering = ['-created_date']

    def __unicode__(self):
        return u'%s_%s' % (self.fid, self.name)
        
    def get_photo_count():
        try:
            return self.photo_set.filter(active=True, pending=False).count()
        except:
            return 0
        
class GPS_Data(models.Model):
    created_date = models.DateTimeField(auto_now_add=True)
    longitude = models.FloatField(null=True, blank=True)
    latitude = models.FloatField(null=True, blank=True)
    altitude = models.FloatField(null=True, blank=True)
    heading = models.FloatField(null=True, blank=True)
    accuracy = models.FloatField(null=True, blank=True)
    speed = models.FloatField(null=True, blank=True)
    altitudeAccuracy = models.FloatField(null=True, blank=True)
    
class Photo_Flag(models.Model):
    active = models.BooleanField(default=True)
    created_date = models.DateTimeField(auto_now_add=True)
    flagger = models.ForeignKey('Portrit_User', null=True, blank=True)

class Photo(models.Model):    
    active = models.BooleanField(default=True)
    validated = models.BooleanField(default=False)
    pending = models.BooleanField(default=False)
    public = models.BooleanField(default=False)
    created_date = models.DateTimeField(auto_now_add=True)
    fid = BigIntegerField(null=True, blank=True)
    fb_source = models.CharField(max_length=255, null=True, blank=True)
    fb_source_small = models.CharField(max_length=255, null=True, blank=True)
    small_height = models.IntegerField(null=True, blank=True)
    small_width = models.IntegerField(null=True, blank=True)
    height = models.IntegerField(null=True, blank=True)
    width = models.IntegerField(null=True, blank=True)
    caption = models.CharField(max_length=512, null=True, blank=True)
    portrit_photo = models.BooleanField(default=False)
    photo_path = models.CharField(max_length=512, null=True, blank=True)
    thumbnail_src = models.URLField(max_length=255, null=True, blank=True)
    large_src = models.URLField(max_length=255, null=True, blank=True)
    crop_src = models.URLField(max_length=255, null=True, blank=True)
    crop_small_src = models.URLField(max_length=255, null=True, blank=True)
    gps_data = models.ForeignKey(GPS_Data, null=True, blank=True)
    owner = models.ForeignKey('Portrit_User', null=True, blank=True)
    album = models.ForeignKey(Album, null=True, blank=True)
    flags = models.ManyToManyField(Photo_Flag, null=True, blank=True)
    nominations = models.ManyToManyField(Nomination, null=True, blank=True)
    
    class Meta:
        ordering = ['-created_date']
    
    def __unicode__(self):
        return u'%s, %s' % (self.fid, self.thumbnail_src)
        
    def get_album_fid(self):
        try:
            if self.portrit_photo:
                return 'portrit-photos'
            elif self.album.fid:
                return self.album.fid
            else:
                return self.album.id
        except:
            return None
            
    def get_portrit_photo(self):
        try:
            return {
                'id': self.id,
                'fid': self.id,
                'created_time': time.mktime(self.created_date.utctimetuple()),
                'caption': self.caption,
                'picture': self.thumbnail_src,
                'crop': self.crop_src,
                'source': self.large_src,
                'small_height': self.small_height,
                'small_width': self.small_width,
                'height': self.height,
                'width': self.width,
            }
        except:
            return None
            
    def get_portrit_user(self):
        try:
            return self.album.portrit_user_albums.all()[0]
        except:
            return None
            
    def delete_local_copy(self):
        import os
        os.remove(self.photo_path)
        os.remove(self.photo_path + '_130.jpg')
        os.remove(self.photo_path + '_720.jpg')
        os.remove(self.photo_path + '_crop.jpg')
        
class Notification_Type(models.Model):
    active = models.BooleanField(default=True)
    created_date = models.DateTimeField(auto_now_add=True)
    name = models.CharField(max_length=255, null=True, blank=True)
    
    class Meta:
        ordering = ['-created_date']
        verbose_name_plural = "Notification Types"
        verbose_name = "Notification Type"
    
    def __unicode__(self):
        return u'%s' % (self.name)
        
class Notification(models.Model):
    active = models.BooleanField(default=True)
    read = models.BooleanField(default=False)
    pending = models.BooleanField(default=False)
    created_date = models.DateTimeField(auto_now_add=True)
    notification_type = models.ForeignKey(Notification_Type, null=True, blank=True)
    source = models.ForeignKey('FB_User', null=True, blank=True, related_name="notification_source")
    destination = models.ForeignKey('FB_User', null=True, blank=True, related_name="notification_destination")
    nomination = models.ForeignKey(Nomination, null=True, blank=True)
    
    class Meta:
        ordering = ['-created_date']
        
    def get_source_fid(self):
        if self.source:
            return self.source.fid
        else:
            return ''
            
    def get_dest_fid(self):
        if self.destination:
            return self.destination.fid
        else:
            return ''
            
    def get_dest_name(self):
        if self.destination:
            return self.destination.get_name()
        else:
            return ''
            
    def get_source_name(self):
        if self.source:
            return self.source.get_name()
        else:
            return ''
    
    def __unicode__(self):
        return u'%s to %s - %s' % (self.source, self.destination, self.notification_type.name)
    
class FB_User(models.Model):
    active = models.BooleanField(default=True)
    pending = models.BooleanField(default=False)
    
    fid = BigIntegerField(null=True, unique=True)
    access_token = models.CharField(max_length=255, null=True)
    name = models.CharField(max_length=255, null=True, blank=True)
    created_date = models.DateField(auto_now_add=True)
    albums = models.ManyToManyField(Album, null=True, blank=True, related_name="fb_user_albums")
    friends = models.ManyToManyField("self", null=True, blank=True)
    winning_noms = models.ManyToManyField(Nomination, blank=True, null=True, related_name="user_winning_noms")
    active_nominations = models.ManyToManyField(Nomination, null=True, blank=True)
    
    class Meta:
        ordering = ['fid']
        verbose_name_plural = "FB Users"
        verbose_name = "FB User"
        
    def get_name(self):
        try:
            return self.portrit_fb_user.all()[0].name
        except:
            return None
            
    def get_username(self):
        try:
            return self.portrit_fb_user.all()[0].username
        except:
            return None
            
    def get_portrit_user(self):
        try:
            return self.portrit_fb_user.all()[0]
        except:
            return None
            
    def get_following(self):
        # user_following = cache.get(str(self.fid) + '_following')
        # if not user_following:
        try:
            user_following = self.portrit_fb_user.all()[0].following.filter(user_following__pending=False, user_following__active=True).distinct('id')
        except:
            user_following = [ ]
                
            # cache.set(str(self.fid) + '_following', user_following, 60*30)
        
        return user_following
        
    def get_following_data(self):
        follow_data = [ ]
        following = self.get_following()
        for user in following.iterator():
            user_data = cache.get(str(self.fid))
            if not user_data:
                try:
                    portrit_user = user.get_portrit_user()
                    user_data = {
                        'fid': user.fid,
                        'name': portrit_user.name,
                        'username': portrit_user.get_username(),
                    }
                    follow_data.append(user_data)
                    cache.set(str(self.fid), user_data)
                except:
                    pass
            else:
                follow_data.append(user_data)
        return follow_data
        
    def get_followers(self):
        # user_followers = cache.get(str(self.fid) + '_followers')
        # if not user_followers:
        try:
            user_followers = self.portrit_fb_user.all()[0].followers.filter(user_followers__pending=False, user_followers__active=True).distinct('id')
        except:
            user_followers = [ ]
            # cache.set(str(self.fid) + '_followers', user_followers, 60*30)
        
        return user_followers
            
    def get_portrit_user_access_token(self):
        try:
            return self.portrit_fb_user.all()[0].access_token
        except:
            return None
            
    def get_portrit_user_notification_permission(self):
        try:
            return self.portrit_fb_user.all()[0].allow_notifications
        except:
            return False
    
    def get_active_nominations(self):
        try:
            active_nominations = self.active_nominations.filter(active=True).order_by('up_votes', 'down_votes', '-created_date')
            return active_nominations
        except:
            return None
            
    # def get_following(self):
    #     friends = self.friends.all()
    #     try:
    #         following = self.get_portrit_user().following.all()
    #         following = following | friends
    #     except:
    #         following = friends
    #     return following
    
    def __unicode__(self):
        return u'%s' % (self.fid)

class Portrit_User(models.Model):
    active = models.BooleanField(default=True)
    pending = models.BooleanField(default=False)
    
    #Permissions
    ask_permission = models.BooleanField(default=True)
    allow_portrit_album = models.BooleanField(default=True)
    allow_notifications = models.BooleanField(default=True)
    allow_follows = models.BooleanField(default=True)
    allow_gps_data = models.BooleanField(default=True)
    
    fb_friends_imported = models.BooleanField(default=False)
    
    created_date = models.DateField(auto_now_add=True)
    access_token = models.CharField(max_length=255, null=True)
    api_access_token = models.CharField(max_length=255, null=True)
    username = models.CharField(max_length=255, null=True)
    
    fb_user = models.ForeignKey(FB_User, related_name="portrit_fb_user")
    
    name = models.CharField(max_length=255, null=True, blank=True)
    email = models.EmailField(max_length=100, null=True, blank=True)
    portrit_album_fid = BigIntegerField(blank=True, null=True, unique=True)
    portrit_photos_album_fid = BigIntegerField(blank=True, null=True, unique=True)
    portrit_user_albums = models.ManyToManyField(Album, blank=True, null=True, related_name="portrit_user_albums")
    
    # TUT/Analytics
    tutorial_completed = models.BooleanField(default=False)
    given_nomination_count = models.IntegerField(default=0)
    recieved_nomination_count = models.IntegerField(default=0)
    selfish_nomination_count = models.IntegerField(default=0)
    winning_nomination_count = models.IntegerField(default=0)
    invite_count = models.IntegerField(default=0)
    vote_count = models.IntegerField(default=0)
    comment_count = models.IntegerField(default=0)
    
    notifications = models.ManyToManyField(Notification, null=True, blank=True)
    referred_friends = models.ManyToManyField(FB_User, null=True, blank=True)
    badges = models.ManyToManyField(Badge, null=True, blank=True)
    
    following = models.ManyToManyField(FB_User, through='User_Following', null=True, blank=True, related_name="portrit_user_following")
    followers = models.ManyToManyField(FB_User, through='User_Followers', null=True, blank=True, related_name="portrit_user_followers")
    
    class Meta:
        ordering = ['-created_date']
        verbose_name_plural = "Portrit Users"
        verbose_name = "Portrit User"
    
    def __unicode__(self):
        return u'%s' % (self.fb_user.fid)
        
    def get_username(self):
        if self.username:
            return self.username
        else:
            return self.fb_user.fid
        
    def get_user(self):
        data = {
            'fid': self.fb_user.fid,
            'name': self.fb_user.name,
            'username': self.get_username(),
        }
        
    def get_portrit_album(self):
        try:
            return self.portrit_user_albums.select_related().filter(active=True)[0]
        except:
            return None
            
    def get_settings(self):
        try:
            return {
                'gps': self.allow_gps_data,
                'follows': self.allow_follows,
                'post_wins': self.allow_portrit_album,
            }
        except:
            return { }
            
    def get_following(self):
        return self.fb_user.get_following()
        
    def get_followers(self):
        return self.fb_user.get_followers()
            
    def get_follow_counts(self):
        try:
            return {
                'following': self.get_following().count(),
                'followers': self.get_followers().count()
            }
        except:
            return {
                'following': 0,
                'followers': 0
            }
            
    def get_followers_list(self):
        data = [ ]
        try:
            data = self.get_followers().values_list('fid', flat=True)
            if len(data) == 0:
                data = [ ]
        except:
            pass
            
        return data
        
    def get_following_list(self):
        data = [ ]
        try:
            data = self.get_following().values_list('fid', flat=True)
            if len(data) == 0:
                data = [ ]
        except:
            pass

        return data
        
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
            
class User_Following(models.Model):
    portrit_user = models.ForeignKey(Portrit_User)
    fb_user = models.ForeignKey(FB_User)
    active = models.BooleanField(default=True)
    pending = models.BooleanField(default=False)
    
class User_Followers(models.Model):
    portrit_user = models.ForeignKey(Portrit_User)
    fb_user = models.ForeignKey(FB_User)
    active = models.BooleanField(default=True)
    pending = models.BooleanField(default=False)
    
    pending_notification = models.ForeignKey(Notification, null=True, blank=True)