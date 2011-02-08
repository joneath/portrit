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
        photo_data['src'] = photo.fb_source
        photo_data['src_small'] = photo.fb_source_small
        photo_data['small_height'] = photo.small_height
        photo_data['small_width'] = photo.small_width
        photo_data['height'] = photo.height
        photo_data['width'] = photo.width
        photo_data['album_fid'] = photo.get_album_fid()
            
        return photo_data
        
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
        
    def save(self):
        if self.won == True:
            self.nominatee.winning_noms.add(self)
        
        super(Nomination, self).save()
    
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

class Photo(models.Model):    
    active = models.BooleanField(default=True)
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
    album = models.ForeignKey(Album, null=True, blank=True)
    nominations = models.ManyToManyField(Nomination, null=True, blank=True)
    
    class Meta:
        ordering = ['-created_date']
    
    def __unicode__(self):
        return u'%s, %s' % (self.fid, self.thumbnail_src)
        
    def get_album_fid(self):
        try:
            return self.album.fid
        except:
            return None
            
    def get_portrit_photo(self):
        try:
            return {
                'id': self.id,
                'caption': self.caption,
                'picture': self.thumbnail_src,
                'source': self.large_src,
                'small_height': self.small_height,
                'small_width': self.small_width,
                'height': self.height,
                'width': self.width,
            }
        except:
            return None
            
    def delete_local_copy(self):
        import os
        os.remove(self.photo_path)
        os.remove(self.photo_path + '_130.jpg')
        os.remove(self.photo_path + '_720.jpg')
        
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
    fid = BigIntegerField(null=True, unique=True)
    created_date = models.DateField(auto_now_add=True)
    albums = models.ManyToManyField(Album, null=True, blank=True)
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
            
    def get_portrit_user(self):
        try:
            return self.portrit_fb_user.all()[0]
        except:
            return None
            
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
    
    def __unicode__(self):
        return u'%s' % (self.fid)

class Portrit_User(models.Model):
    active = models.BooleanField(default=True)
    ask_permission = models.BooleanField(default=True)
    allow_portrit_album = models.BooleanField(default=True)
    allow_notifications = models.BooleanField(default=True)
    created_date = models.DateField(auto_now_add=True)
    access_token = models.CharField(max_length=255, null=True)
    fb_user = models.ForeignKey(FB_User, related_name="portrit_fb_user")
    name = models.CharField(max_length=255, null=True, blank=True)
    portrit_album_fid = BigIntegerField(blank=True, null=True, unique=True)
    portrit_photos_album_fid = BigIntegerField(blank=True, null=True, unique=True)
    portrit_user_albums = models.ManyToManyField(Album, blank=True, null=True)
    tutorial_completed = models.BooleanField(default=False)
    given_nomination_count = models.IntegerField(default=0)
    recieved_nomination_count = models.IntegerField(default=0)
    selfish_nomination_count = models.IntegerField(default=0)
    winning_nomination_count = models.IntegerField(default=0)
    invite_count = models.IntegerField(default=0)
    vote_count = models.IntegerField(default=0)
    comment_count = models.IntegerField(default=0)
    user = models.ForeignKey(User, null=True, blank=True)
    notifications = models.ManyToManyField(Notification, null=True, blank=True)
    referred_friends = models.ManyToManyField(FB_User, null=True, blank=True)
    badges = models.ManyToManyField(Badge, null=True, blank=True)
    
    class Meta:
        ordering = ['-created_date']
        verbose_name_plural = "Portrit Users"
        verbose_name = "Portrit User"
    
    def __unicode__(self):
        return u'%s' % (self.fb_user.fid)
        
    def get_portrit_album(self):
        try:
            return self.portrit_user_albums.select_related().filter(active=True)[0]
        except:
            return None
        
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