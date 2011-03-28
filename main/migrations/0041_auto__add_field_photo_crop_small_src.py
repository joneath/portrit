# encoding: utf-8
import datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models

class Migration(SchemaMigration):

    def forwards(self, orm):
        
        # Adding field 'Photo.crop_small_src'
        db.add_column('main_photo', 'crop_small_src', self.gf('django.db.models.fields.URLField')(max_length=255, null=True, blank=True), keep_default=False)


    def backwards(self, orm):
        
        # Deleting field 'Photo.crop_small_src'
        db.delete_column('main_photo', 'crop_small_src')


    models = {
        'main.album': {
            'Meta': {'ordering': "['-created_date']", 'object_name': 'Album'},
            'active': ('django.db.models.fields.BooleanField', [], {'default': 'True'}),
            'created_date': ('django.db.models.fields.DateTimeField', [], {'auto_now_add': 'True', 'blank': 'True'}),
            'fid': ('main.models.BigIntegerField', [], {'null': 'True', 'blank': 'True'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '255', 'null': 'True', 'blank': 'True'})
        },
        'main.badge': {
            'Meta': {'ordering': "['-created_date']", 'object_name': 'Badge'},
            'active': ('django.db.models.fields.BooleanField', [], {'default': 'True'}),
            'associates': ('django.db.models.fields.related.ManyToManyField', [], {'symmetrical': 'False', 'to': "orm['main.FB_User']", 'null': 'True', 'blank': 'True'}),
            'badge_category': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['main.Badge_Category']", 'null': 'True', 'blank': 'True'}),
            'created_date': ('django.db.models.fields.DateTimeField', [], {'auto_now_add': 'True', 'blank': 'True'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'nomination': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['main.Nomination']", 'null': 'True', 'blank': 'True'}),
            'pending': ('django.db.models.fields.BooleanField', [], {'default': 'True'}),
            'photo': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['main.Photo']", 'null': 'True', 'blank': 'True'})
        },
        'main.badge_category': {
            'Meta': {'ordering': "['order']", 'object_name': 'Badge_Category'},
            'active': ('django.db.models.fields.BooleanField', [], {'default': 'True'}),
            'description': ('django.db.models.fields.TextField', [], {'null': 'True', 'blank': 'True'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '255'}),
            'order': ('django.db.models.fields.IntegerField', [], {'default': '0'})
        },
        'main.comment': {
            'Meta': {'ordering': "['-created_date']", 'object_name': 'Comment'},
            'active': ('django.db.models.fields.BooleanField', [], {'default': 'True'}),
            'comment': ('django.db.models.fields.TextField', [], {'null': 'True', 'blank': 'True'}),
            'comments': ('django.db.models.fields.related.ManyToManyField', [], {'blank': 'True', 'related_name': "'comments_rel_+'", 'null': 'True', 'to': "orm['main.Comment']"}),
            'created_date': ('django.db.models.fields.DateTimeField', [], {'auto_now_add': 'True', 'blank': 'True'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'owner': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['main.FB_User']"})
        },
        'main.fb_user': {
            'Meta': {'ordering': "['fid']", 'object_name': 'FB_User'},
            'access_token': ('django.db.models.fields.CharField', [], {'max_length': '255', 'null': 'True'}),
            'active': ('django.db.models.fields.BooleanField', [], {'default': 'True'}),
            'active_nominations': ('django.db.models.fields.related.ManyToManyField', [], {'symmetrical': 'False', 'to': "orm['main.Nomination']", 'null': 'True', 'blank': 'True'}),
            'albums': ('django.db.models.fields.related.ManyToManyField', [], {'blank': 'True', 'related_name': "'fb_user_albums'", 'null': 'True', 'symmetrical': 'False', 'to': "orm['main.Album']"}),
            'created_date': ('django.db.models.fields.DateField', [], {'auto_now_add': 'True', 'blank': 'True'}),
            'fid': ('main.models.BigIntegerField', [], {'unique': 'True', 'null': 'True'}),
            'friends': ('django.db.models.fields.related.ManyToManyField', [], {'blank': 'True', 'related_name': "'friends_rel_+'", 'null': 'True', 'to': "orm['main.FB_User']"}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '255', 'null': 'True', 'blank': 'True'}),
            'pending': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'winning_noms': ('django.db.models.fields.related.ManyToManyField', [], {'blank': 'True', 'related_name': "'user_winning_noms'", 'null': 'True', 'symmetrical': 'False', 'to': "orm['main.Nomination']"})
        },
        'main.gps_data': {
            'Meta': {'object_name': 'GPS_Data'},
            'accuracy': ('django.db.models.fields.FloatField', [], {'null': 'True', 'blank': 'True'}),
            'altitude': ('django.db.models.fields.FloatField', [], {'null': 'True', 'blank': 'True'}),
            'altitudeAccuracy': ('django.db.models.fields.FloatField', [], {'null': 'True', 'blank': 'True'}),
            'created_date': ('django.db.models.fields.DateTimeField', [], {'auto_now_add': 'True', 'blank': 'True'}),
            'heading': ('django.db.models.fields.FloatField', [], {'null': 'True', 'blank': 'True'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'latitude': ('django.db.models.fields.FloatField', [], {'null': 'True', 'blank': 'True'}),
            'longitude': ('django.db.models.fields.FloatField', [], {'null': 'True', 'blank': 'True'}),
            'speed': ('django.db.models.fields.FloatField', [], {'null': 'True', 'blank': 'True'})
        },
        'main.nomination': {
            'Meta': {'ordering': "['up_votes', 'down_votes', '-created_date']", 'object_name': 'Nomination'},
            'active': ('django.db.models.fields.BooleanField', [], {'default': 'True'}),
            'caption': ('django.db.models.fields.TextField', [], {'null': 'True', 'blank': 'True'}),
            'comments': ('django.db.models.fields.related.ManyToManyField', [], {'symmetrical': 'False', 'to': "orm['main.Comment']", 'null': 'True', 'blank': 'True'}),
            'created_date': ('django.db.models.fields.DateTimeField', [], {'auto_now_add': 'True', 'blank': 'True'}),
            'current_vote_count': ('django.db.models.fields.IntegerField', [], {'default': '1'}),
            'down_votes': ('django.db.models.fields.IntegerField', [], {'default': '0'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'nominatee': ('django.db.models.fields.related.ForeignKey', [], {'related_name': "'nominated_user'", 'null': 'True', 'to': "orm['main.FB_User']"}),
            'nomination_category': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['main.Nomination_Category']", 'null': 'True'}),
            'nominator': ('django.db.models.fields.related.ForeignKey', [], {'related_name': "'nominator_user'", 'null': 'True', 'to': "orm['main.FB_User']"}),
            'tagged_friends': ('django.db.models.fields.related.ManyToManyField', [], {'blank': 'True', 'related_name': "'tagged_users'", 'null': 'True', 'symmetrical': 'False', 'to': "orm['main.FB_User']"}),
            'up_votes': ('django.db.models.fields.IntegerField', [], {'default': '1'}),
            'votes': ('django.db.models.fields.related.ManyToManyField', [], {'blank': 'True', 'related_name': "'vote_users'", 'null': 'True', 'symmetrical': 'False', 'to': "orm['main.FB_User']"}),
            'won': ('django.db.models.fields.BooleanField', [], {'default': 'False'})
        },
        'main.nomination_category': {
            'Meta': {'ordering': "['order']", 'object_name': 'Nomination_Category'},
            'active': ('django.db.models.fields.BooleanField', [], {'default': 'True'}),
            'description': ('django.db.models.fields.TextField', [], {'null': 'True', 'blank': 'True'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '255'}),
            'order': ('django.db.models.fields.IntegerField', [], {'default': '0'})
        },
        'main.notification': {
            'Meta': {'ordering': "['-created_date']", 'object_name': 'Notification'},
            'active': ('django.db.models.fields.BooleanField', [], {'default': 'True'}),
            'created_date': ('django.db.models.fields.DateTimeField', [], {'auto_now_add': 'True', 'blank': 'True'}),
            'destination': ('django.db.models.fields.related.ForeignKey', [], {'blank': 'True', 'related_name': "'notification_destination'", 'null': 'True', 'to': "orm['main.FB_User']"}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'nomination': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['main.Nomination']", 'null': 'True', 'blank': 'True'}),
            'notification_type': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['main.Notification_Type']", 'null': 'True', 'blank': 'True'}),
            'pending': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'read': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'source': ('django.db.models.fields.related.ForeignKey', [], {'blank': 'True', 'related_name': "'notification_source'", 'null': 'True', 'to': "orm['main.FB_User']"})
        },
        'main.notification_type': {
            'Meta': {'ordering': "['-created_date']", 'object_name': 'Notification_Type'},
            'active': ('django.db.models.fields.BooleanField', [], {'default': 'True'}),
            'created_date': ('django.db.models.fields.DateTimeField', [], {'auto_now_add': 'True', 'blank': 'True'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '255', 'null': 'True', 'blank': 'True'})
        },
        'main.photo': {
            'Meta': {'ordering': "['-created_date']", 'object_name': 'Photo'},
            'active': ('django.db.models.fields.BooleanField', [], {'default': 'True'}),
            'album': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['main.Album']", 'null': 'True', 'blank': 'True'}),
            'caption': ('django.db.models.fields.CharField', [], {'max_length': '512', 'null': 'True', 'blank': 'True'}),
            'created_date': ('django.db.models.fields.DateTimeField', [], {'auto_now_add': 'True', 'blank': 'True'}),
            'crop_small_src': ('django.db.models.fields.URLField', [], {'max_length': '255', 'null': 'True', 'blank': 'True'}),
            'crop_src': ('django.db.models.fields.URLField', [], {'max_length': '255', 'null': 'True', 'blank': 'True'}),
            'fb_source': ('django.db.models.fields.CharField', [], {'max_length': '255', 'null': 'True', 'blank': 'True'}),
            'fb_source_small': ('django.db.models.fields.CharField', [], {'max_length': '255', 'null': 'True', 'blank': 'True'}),
            'fid': ('main.models.BigIntegerField', [], {'null': 'True', 'blank': 'True'}),
            'flags': ('django.db.models.fields.related.ManyToManyField', [], {'symmetrical': 'False', 'to': "orm['main.Photo_Flag']", 'null': 'True', 'blank': 'True'}),
            'gps_data': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['main.GPS_Data']", 'null': 'True', 'blank': 'True'}),
            'height': ('django.db.models.fields.IntegerField', [], {'null': 'True', 'blank': 'True'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'large_src': ('django.db.models.fields.URLField', [], {'max_length': '255', 'null': 'True', 'blank': 'True'}),
            'nominations': ('django.db.models.fields.related.ManyToManyField', [], {'symmetrical': 'False', 'to': "orm['main.Nomination']", 'null': 'True', 'blank': 'True'}),
            'owner': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['main.Portrit_User']", 'null': 'True', 'blank': 'True'}),
            'pending': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'photo_path': ('django.db.models.fields.CharField', [], {'max_length': '512', 'null': 'True', 'blank': 'True'}),
            'portrit_photo': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'public': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'small_height': ('django.db.models.fields.IntegerField', [], {'null': 'True', 'blank': 'True'}),
            'small_width': ('django.db.models.fields.IntegerField', [], {'null': 'True', 'blank': 'True'}),
            'thumbnail_src': ('django.db.models.fields.URLField', [], {'max_length': '255', 'null': 'True', 'blank': 'True'}),
            'validated': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'width': ('django.db.models.fields.IntegerField', [], {'null': 'True', 'blank': 'True'})
        },
        'main.photo_flag': {
            'Meta': {'object_name': 'Photo_Flag'},
            'active': ('django.db.models.fields.BooleanField', [], {'default': 'True'}),
            'created_date': ('django.db.models.fields.DateTimeField', [], {'auto_now_add': 'True', 'blank': 'True'}),
            'flagger': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['main.Portrit_User']", 'null': 'True', 'blank': 'True'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'})
        },
        'main.portrit_user': {
            'Meta': {'ordering': "['-created_date']", 'object_name': 'Portrit_User'},
            'access_token': ('django.db.models.fields.CharField', [], {'max_length': '255', 'null': 'True'}),
            'active': ('django.db.models.fields.BooleanField', [], {'default': 'True'}),
            'allow_follows': ('django.db.models.fields.BooleanField', [], {'default': 'True'}),
            'allow_gps_data': ('django.db.models.fields.BooleanField', [], {'default': 'True'}),
            'allow_notifications': ('django.db.models.fields.BooleanField', [], {'default': 'True'}),
            'allow_portrit_album': ('django.db.models.fields.BooleanField', [], {'default': 'True'}),
            'api_access_token': ('django.db.models.fields.CharField', [], {'max_length': '255', 'null': 'True'}),
            'ask_permission': ('django.db.models.fields.BooleanField', [], {'default': 'True'}),
            'badges': ('django.db.models.fields.related.ManyToManyField', [], {'symmetrical': 'False', 'to': "orm['main.Badge']", 'null': 'True', 'blank': 'True'}),
            'comment_count': ('django.db.models.fields.IntegerField', [], {'default': '0'}),
            'created_date': ('django.db.models.fields.DateField', [], {'auto_now_add': 'True', 'blank': 'True'}),
            'email': ('django.db.models.fields.EmailField', [], {'max_length': '100', 'null': 'True', 'blank': 'True'}),
            'fb_friends_imported': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'fb_user': ('django.db.models.fields.related.ForeignKey', [], {'related_name': "'portrit_fb_user'", 'to': "orm['main.FB_User']"}),
            'followers': ('django.db.models.fields.related.ManyToManyField', [], {'related_name': "'portrit_user_followers'", 'to': "orm['main.FB_User']", 'through': "orm['main.User_Followers']", 'blank': 'True', 'symmetrical': 'False', 'null': 'True'}),
            'following': ('django.db.models.fields.related.ManyToManyField', [], {'related_name': "'portrit_user_following'", 'to': "orm['main.FB_User']", 'through': "orm['main.User_Following']", 'blank': 'True', 'symmetrical': 'False', 'null': 'True'}),
            'given_nomination_count': ('django.db.models.fields.IntegerField', [], {'default': '0'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'invite_count': ('django.db.models.fields.IntegerField', [], {'default': '0'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '255', 'null': 'True', 'blank': 'True'}),
            'notifications': ('django.db.models.fields.related.ManyToManyField', [], {'symmetrical': 'False', 'to': "orm['main.Notification']", 'null': 'True', 'blank': 'True'}),
            'pending': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'portrit_album_fid': ('main.models.BigIntegerField', [], {'unique': 'True', 'null': 'True', 'blank': 'True'}),
            'portrit_photos_album_fid': ('main.models.BigIntegerField', [], {'unique': 'True', 'null': 'True', 'blank': 'True'}),
            'portrit_user_albums': ('django.db.models.fields.related.ManyToManyField', [], {'blank': 'True', 'related_name': "'portrit_user_albums'", 'null': 'True', 'symmetrical': 'False', 'to': "orm['main.Album']"}),
            'recieved_nomination_count': ('django.db.models.fields.IntegerField', [], {'default': '0'}),
            'referred_friends': ('django.db.models.fields.related.ManyToManyField', [], {'symmetrical': 'False', 'to': "orm['main.FB_User']", 'null': 'True', 'blank': 'True'}),
            'selfish_nomination_count': ('django.db.models.fields.IntegerField', [], {'default': '0'}),
            'tutorial_completed': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'username': ('django.db.models.fields.CharField', [], {'max_length': '255', 'null': 'True'}),
            'vote_count': ('django.db.models.fields.IntegerField', [], {'default': '0'}),
            'winning_nomination_count': ('django.db.models.fields.IntegerField', [], {'default': '0'})
        },
        'main.user_followers': {
            'Meta': {'object_name': 'User_Followers'},
            'active': ('django.db.models.fields.BooleanField', [], {'default': 'True'}),
            'fb_user': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['main.FB_User']"}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'pending': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'pending_notification': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['main.Notification']", 'null': 'True', 'blank': 'True'}),
            'portrit_user': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['main.Portrit_User']"})
        },
        'main.user_following': {
            'Meta': {'object_name': 'User_Following'},
            'active': ('django.db.models.fields.BooleanField', [], {'default': 'True'}),
            'fb_user': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['main.FB_User']"}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'pending': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'portrit_user': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['main.Portrit_User']"})
        }
    }

    complete_apps = ['main']
