# encoding: utf-8
import datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models

class Migration(SchemaMigration):

    def forwards(self, orm):
        
        # Adding field 'Portrit_User.tutorial_completed'
        db.add_column('main_portrit_user', 'tutorial_completed', self.gf('django.db.models.fields.BooleanField')(default=False), keep_default=False)

        # Adding field 'Portrit_User.given_nomination_count'
        db.add_column('main_portrit_user', 'given_nomination_count', self.gf('django.db.models.fields.IntegerField')(default=0), keep_default=False)

        # Adding field 'Portrit_User.recieved_nomination_count'
        db.add_column('main_portrit_user', 'recieved_nomination_count', self.gf('django.db.models.fields.IntegerField')(default=0), keep_default=False)

        # Adding field 'Portrit_User.selfish_nomination_count'
        db.add_column('main_portrit_user', 'selfish_nomination_count', self.gf('django.db.models.fields.IntegerField')(default=0), keep_default=False)

        # Adding field 'Portrit_User.winning_nomination_count'
        db.add_column('main_portrit_user', 'winning_nomination_count', self.gf('django.db.models.fields.IntegerField')(default=0), keep_default=False)

        # Adding field 'Portrit_User.invite_count'
        db.add_column('main_portrit_user', 'invite_count', self.gf('django.db.models.fields.IntegerField')(default=0), keep_default=False)

        # Adding field 'Portrit_User.vote_count'
        db.add_column('main_portrit_user', 'vote_count', self.gf('django.db.models.fields.IntegerField')(default=0), keep_default=False)

        # Adding field 'Portrit_User.comment_count'
        db.add_column('main_portrit_user', 'comment_count', self.gf('django.db.models.fields.IntegerField')(default=0), keep_default=False)


    def backwards(self, orm):
        
        # Deleting field 'Portrit_User.tutorial_completed'
        db.delete_column('main_portrit_user', 'tutorial_completed')

        # Deleting field 'Portrit_User.given_nomination_count'
        db.delete_column('main_portrit_user', 'given_nomination_count')

        # Deleting field 'Portrit_User.recieved_nomination_count'
        db.delete_column('main_portrit_user', 'recieved_nomination_count')

        # Deleting field 'Portrit_User.selfish_nomination_count'
        db.delete_column('main_portrit_user', 'selfish_nomination_count')

        # Deleting field 'Portrit_User.winning_nomination_count'
        db.delete_column('main_portrit_user', 'winning_nomination_count')

        # Deleting field 'Portrit_User.invite_count'
        db.delete_column('main_portrit_user', 'invite_count')

        # Deleting field 'Portrit_User.vote_count'
        db.delete_column('main_portrit_user', 'vote_count')

        # Deleting field 'Portrit_User.comment_count'
        db.delete_column('main_portrit_user', 'comment_count')


    models = {
        'auth.group': {
            'Meta': {'object_name': 'Group'},
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'unique': 'True', 'max_length': '80'}),
            'permissions': ('django.db.models.fields.related.ManyToManyField', [], {'to': "orm['auth.Permission']", 'symmetrical': 'False', 'blank': 'True'})
        },
        'auth.permission': {
            'Meta': {'ordering': "('content_type__app_label', 'codename')", 'unique_together': "(('content_type', 'codename'),)", 'object_name': 'Permission'},
            'codename': ('django.db.models.fields.CharField', [], {'max_length': '100'}),
            'content_type': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['contenttypes.ContentType']"}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '50'})
        },
        'auth.user': {
            'Meta': {'object_name': 'User'},
            'date_joined': ('django.db.models.fields.DateTimeField', [], {'default': 'datetime.datetime.now'}),
            'email': ('django.db.models.fields.EmailField', [], {'max_length': '75', 'blank': 'True'}),
            'first_name': ('django.db.models.fields.CharField', [], {'max_length': '30', 'blank': 'True'}),
            'groups': ('django.db.models.fields.related.ManyToManyField', [], {'to': "orm['auth.Group']", 'symmetrical': 'False', 'blank': 'True'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'is_active': ('django.db.models.fields.BooleanField', [], {'default': 'True'}),
            'is_staff': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'is_superuser': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'last_login': ('django.db.models.fields.DateTimeField', [], {'default': 'datetime.datetime.now'}),
            'last_name': ('django.db.models.fields.CharField', [], {'max_length': '30', 'blank': 'True'}),
            'password': ('django.db.models.fields.CharField', [], {'max_length': '128'}),
            'user_permissions': ('django.db.models.fields.related.ManyToManyField', [], {'to': "orm['auth.Permission']", 'symmetrical': 'False', 'blank': 'True'}),
            'username': ('django.db.models.fields.CharField', [], {'unique': 'True', 'max_length': '30'})
        },
        'contenttypes.contenttype': {
            'Meta': {'ordering': "('name',)", 'unique_together': "(('app_label', 'model'),)", 'object_name': 'ContentType', 'db_table': "'django_content_type'"},
            'app_label': ('django.db.models.fields.CharField', [], {'max_length': '100'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'model': ('django.db.models.fields.CharField', [], {'max_length': '100'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '100'})
        },
        'main.album': {
            'Meta': {'ordering': "['-created_date']", 'object_name': 'Album'},
            'active': ('django.db.models.fields.BooleanField', [], {'default': 'True'}),
            'created_date': ('django.db.models.fields.DateTimeField', [], {'auto_now_add': 'True', 'blank': 'True'}),
            'fid': ('main.models.BigIntegerField', [], {'null': 'True', 'blank': 'True'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '255', 'null': 'True', 'blank': 'True'}),
            'photos': ('django.db.models.fields.related.ManyToManyField', [], {'symmetrical': 'False', 'to': "orm['main.Photo']", 'null': 'True', 'blank': 'True'})
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
            'Meta': {'ordering': "['-created_date']", 'object_name': 'FB_User'},
            'active_nominations': ('django.db.models.fields.related.ManyToManyField', [], {'symmetrical': 'False', 'to': "orm['main.Nomination']", 'null': 'True', 'blank': 'True'}),
            'albums': ('django.db.models.fields.related.ManyToManyField', [], {'symmetrical': 'False', 'to': "orm['main.Album']", 'null': 'True', 'blank': 'True'}),
            'created_date': ('django.db.models.fields.DateField', [], {'auto_now_add': 'True', 'blank': 'True'}),
            'fid': ('main.models.BigIntegerField', [], {'unique': 'True', 'null': 'True'}),
            'friends': ('django.db.models.fields.related.ManyToManyField', [], {'blank': 'True', 'related_name': "'friends_rel_+'", 'null': 'True', 'to': "orm['main.FB_User']"}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'winning_photos': ('django.db.models.fields.related.ManyToManyField', [], {'symmetrical': 'False', 'to': "orm['main.Photo']", 'null': 'True', 'blank': 'True'})
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
            'up_votes': ('django.db.models.fields.IntegerField', [], {'default': '1'}),
            'votes': ('django.db.models.fields.related.ManyToManyField', [], {'symmetrical': 'False', 'to': "orm['main.FB_User']", 'null': 'True', 'blank': 'True'}),
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
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'nomination': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['main.Nomination']", 'null': 'True', 'blank': 'True'}),
            'notification_type': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['main.Notification_Type']", 'null': 'True', 'blank': 'True'}),
            'read': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'source': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['main.FB_User']", 'null': 'True', 'blank': 'True'})
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
            'caption': ('django.db.models.fields.CharField', [], {'max_length': '512', 'null': 'True', 'blank': 'True'}),
            'created_date': ('django.db.models.fields.DateTimeField', [], {'auto_now_add': 'True', 'blank': 'True'}),
            'fb_source': ('django.db.models.fields.CharField', [], {'max_length': '255', 'null': 'True', 'blank': 'True'}),
            'fb_source_small': ('django.db.models.fields.CharField', [], {'max_length': '255', 'null': 'True', 'blank': 'True'}),
            'fid': ('main.models.BigIntegerField', [], {'null': 'True', 'blank': 'True'}),
            'height': ('django.db.models.fields.IntegerField', [], {'null': 'True', 'blank': 'True'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'nominations': ('django.db.models.fields.related.ManyToManyField', [], {'symmetrical': 'False', 'to': "orm['main.Nomination']", 'null': 'True', 'blank': 'True'}),
            'pending': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'photo': ('django.db.models.fields.files.ImageField', [], {'max_length': '100', 'null': 'True', 'blank': 'True'}),
            'small_height': ('django.db.models.fields.IntegerField', [], {'null': 'True', 'blank': 'True'}),
            'small_width': ('django.db.models.fields.IntegerField', [], {'null': 'True', 'blank': 'True'}),
            'width': ('django.db.models.fields.IntegerField', [], {'null': 'True', 'blank': 'True'})
        },
        'main.portrit_user': {
            'Meta': {'ordering': "['-created_date']", 'object_name': 'Portrit_User'},
            'access_token': ('django.db.models.fields.CharField', [], {'max_length': '255', 'null': 'True'}),
            'active': ('django.db.models.fields.BooleanField', [], {'default': 'True'}),
            'badges': ('django.db.models.fields.related.ManyToManyField', [], {'symmetrical': 'False', 'to': "orm['main.Badge']", 'null': 'True', 'blank': 'True'}),
            'comment_count': ('django.db.models.fields.IntegerField', [], {'default': '0'}),
            'created_date': ('django.db.models.fields.DateField', [], {'auto_now_add': 'True', 'blank': 'True'}),
            'fb_user': ('django.db.models.fields.related.ForeignKey', [], {'related_name': "'portrit_fb_user'", 'to': "orm['main.FB_User']"}),
            'given_nomination_count': ('django.db.models.fields.IntegerField', [], {'default': '0'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'invite_count': ('django.db.models.fields.IntegerField', [], {'default': '0'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '255', 'null': 'True', 'blank': 'True'}),
            'notifications': ('django.db.models.fields.related.ManyToManyField', [], {'symmetrical': 'False', 'to': "orm['main.Notification']", 'null': 'True', 'blank': 'True'}),
            'recieved_nomination_count': ('django.db.models.fields.IntegerField', [], {'default': '0'}),
            'referred_friends': ('django.db.models.fields.related.ManyToManyField', [], {'symmetrical': 'False', 'to': "orm['main.FB_User']", 'null': 'True', 'blank': 'True'}),
            'selfish_nomination_count': ('django.db.models.fields.IntegerField', [], {'default': '0'}),
            'tutorial_completed': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'user': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['auth.User']", 'null': 'True', 'blank': 'True'}),
            'vote_count': ('django.db.models.fields.IntegerField', [], {'default': '0'}),
            'winning_nomination_count': ('django.db.models.fields.IntegerField', [], {'default': '0'})
        }
    }

    complete_apps = ['main']
