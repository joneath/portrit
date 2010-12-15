# encoding: utf-8
import datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models

class Migration(SchemaMigration):

    def forwards(self, orm):
        
        # Adding model 'Comment'
        db.create_table('main_comment', (
            ('id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('active', self.gf('django.db.models.fields.BooleanField')(default=True)),
            ('created_date', self.gf('django.db.models.fields.DateTimeField')(auto_now_add=True, blank=True)),
            ('comment', self.gf('django.db.models.fields.TextField')(null=True, blank=True)),
            ('owner', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['main.FB_User'])),
        ))
        db.send_create_signal('main', ['Comment'])

        # Adding M2M table for field comments on 'Comment'
        db.create_table('main_comment_comments', (
            ('id', models.AutoField(verbose_name='ID', primary_key=True, auto_created=True)),
            ('from_comment', models.ForeignKey(orm['main.comment'], null=False)),
            ('to_comment', models.ForeignKey(orm['main.comment'], null=False))
        ))
        db.create_unique('main_comment_comments', ['from_comment_id', 'to_comment_id'])

        # Adding model 'Badge_Category'
        db.create_table('main_badge_category', (
            ('id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('active', self.gf('django.db.models.fields.BooleanField')(default=True)),
            ('order', self.gf('django.db.models.fields.IntegerField')(default=0)),
            ('name', self.gf('django.db.models.fields.CharField')(max_length=255)),
            ('description', self.gf('django.db.models.fields.TextField')(null=True, blank=True)),
        ))
        db.send_create_signal('main', ['Badge_Category'])

        # Adding model 'Badge'
        db.create_table('main_badge', (
            ('id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('active', self.gf('django.db.models.fields.BooleanField')(default=True)),
            ('pending', self.gf('django.db.models.fields.BooleanField')(default=True)),
            ('created_date', self.gf('django.db.models.fields.DateTimeField')(auto_now_add=True, blank=True)),
            ('badge_category', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['main.Badge_Category'], null=True, blank=True)),
            ('nomination', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['main.Nomination'], null=True, blank=True)),
            ('photo', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['main.Photo'], null=True, blank=True)),
        ))
        db.send_create_signal('main', ['Badge'])

        # Adding M2M table for field associates on 'Badge'
        db.create_table('main_badge_associates', (
            ('id', models.AutoField(verbose_name='ID', primary_key=True, auto_created=True)),
            ('badge', models.ForeignKey(orm['main.badge'], null=False)),
            ('fb_user', models.ForeignKey(orm['main.fb_user'], null=False))
        ))
        db.create_unique('main_badge_associates', ['badge_id', 'fb_user_id'])

        # Adding model 'Nomination_Category'
        db.create_table('main_nomination_category', (
            ('id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('active', self.gf('django.db.models.fields.BooleanField')(default=True)),
            ('order', self.gf('django.db.models.fields.IntegerField')(default=0)),
            ('name', self.gf('django.db.models.fields.CharField')(max_length=255)),
            ('description', self.gf('django.db.models.fields.TextField')(null=True, blank=True)),
        ))
        db.send_create_signal('main', ['Nomination_Category'])

        # Adding model 'Nomination'
        db.create_table('main_nomination', (
            ('id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('active', self.gf('django.db.models.fields.BooleanField')(default=True)),
            ('created_date', self.gf('django.db.models.fields.DateTimeField')(auto_now_add=True, blank=True)),
            ('up_votes', self.gf('django.db.models.fields.IntegerField')(default=1)),
            ('down_votes', self.gf('django.db.models.fields.IntegerField')(default=0)),
            ('current_vote_count', self.gf('django.db.models.fields.IntegerField')(default=1)),
            ('won', self.gf('django.db.models.fields.BooleanField')(default=False)),
            ('nomination_category', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['main.Nomination_Category'], null=True)),
            ('caption', self.gf('django.db.models.fields.TextField')(null=True, blank=True)),
            ('nominator', self.gf('django.db.models.fields.related.ForeignKey')(related_name='nominator_user', null=True, to=orm['main.FB_User'])),
            ('nominatee', self.gf('django.db.models.fields.related.ForeignKey')(related_name='nominated_user', null=True, to=orm['main.FB_User'])),
        ))
        db.send_create_signal('main', ['Nomination'])

        # Adding M2M table for field comments on 'Nomination'
        db.create_table('main_nomination_comments', (
            ('id', models.AutoField(verbose_name='ID', primary_key=True, auto_created=True)),
            ('nomination', models.ForeignKey(orm['main.nomination'], null=False)),
            ('comment', models.ForeignKey(orm['main.comment'], null=False))
        ))
        db.create_unique('main_nomination_comments', ['nomination_id', 'comment_id'])

        # Adding M2M table for field votes on 'Nomination'
        db.create_table('main_nomination_votes', (
            ('id', models.AutoField(verbose_name='ID', primary_key=True, auto_created=True)),
            ('nomination', models.ForeignKey(orm['main.nomination'], null=False)),
            ('fb_user', models.ForeignKey(orm['main.fb_user'], null=False))
        ))
        db.create_unique('main_nomination_votes', ['nomination_id', 'fb_user_id'])

        # Adding model 'Photo'
        db.create_table('main_photo', (
            ('id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('active', self.gf('django.db.models.fields.BooleanField')(default=True)),
            ('pending', self.gf('django.db.models.fields.BooleanField')(default=False)),
            ('created_date', self.gf('django.db.models.fields.DateTimeField')(auto_now_add=True, blank=True)),
            ('fid', self.gf('main.models.BigIntegerField')(null=True, blank=True)),
            ('fb_source', self.gf('django.db.models.fields.CharField')(max_length=255, null=True, blank=True)),
            ('fb_source_small', self.gf('django.db.models.fields.CharField')(max_length=255, null=True, blank=True)),
            ('small_height', self.gf('django.db.models.fields.IntegerField')(null=True, blank=True)),
            ('small_width', self.gf('django.db.models.fields.IntegerField')(null=True, blank=True)),
            ('height', self.gf('django.db.models.fields.IntegerField')(null=True, blank=True)),
            ('width', self.gf('django.db.models.fields.IntegerField')(null=True, blank=True)),
            ('caption', self.gf('django.db.models.fields.CharField')(max_length=512, null=True, blank=True)),
            ('photo', self.gf('django.db.models.fields.files.ImageField')(max_length=100, null=True, blank=True)),
        ))
        db.send_create_signal('main', ['Photo'])

        # Adding M2M table for field nominations on 'Photo'
        db.create_table('main_photo_nominations', (
            ('id', models.AutoField(verbose_name='ID', primary_key=True, auto_created=True)),
            ('photo', models.ForeignKey(orm['main.photo'], null=False)),
            ('nomination', models.ForeignKey(orm['main.nomination'], null=False))
        ))
        db.create_unique('main_photo_nominations', ['photo_id', 'nomination_id'])

        # Adding model 'Album'
        db.create_table('main_album', (
            ('id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('active', self.gf('django.db.models.fields.BooleanField')(default=True)),
            ('fid', self.gf('main.models.BigIntegerField')(null=True, blank=True)),
            ('created_date', self.gf('django.db.models.fields.DateTimeField')(auto_now_add=True, blank=True)),
            ('name', self.gf('django.db.models.fields.CharField')(max_length=255, null=True, blank=True)),
        ))
        db.send_create_signal('main', ['Album'])

        # Adding M2M table for field photos on 'Album'
        db.create_table('main_album_photos', (
            ('id', models.AutoField(verbose_name='ID', primary_key=True, auto_created=True)),
            ('album', models.ForeignKey(orm['main.album'], null=False)),
            ('photo', models.ForeignKey(orm['main.photo'], null=False))
        ))
        db.create_unique('main_album_photos', ['album_id', 'photo_id'])

        # Adding model 'Notification_Type'
        db.create_table('main_notification_type', (
            ('id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('active', self.gf('django.db.models.fields.BooleanField')(default=True)),
            ('created_date', self.gf('django.db.models.fields.DateTimeField')(auto_now_add=True, blank=True)),
            ('name', self.gf('django.db.models.fields.CharField')(max_length=255, null=True, blank=True)),
        ))
        db.send_create_signal('main', ['Notification_Type'])

        # Adding model 'Notification'
        db.create_table('main_notification', (
            ('id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('active', self.gf('django.db.models.fields.BooleanField')(default=True)),
            ('read', self.gf('django.db.models.fields.BooleanField')(default=False)),
            ('created_date', self.gf('django.db.models.fields.DateTimeField')(auto_now_add=True, blank=True)),
            ('notification_type', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['main.Notification_Type'], null=True, blank=True)),
            ('source', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['main.FB_User'], null=True, blank=True)),
            ('nomination', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['main.Nomination'], null=True, blank=True)),
        ))
        db.send_create_signal('main', ['Notification'])

        # Adding model 'FB_User'
        db.create_table('main_fb_user', (
            ('id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('fid', self.gf('main.models.BigIntegerField')(unique=True, null=True)),
            ('created_date', self.gf('django.db.models.fields.DateField')(auto_now_add=True, blank=True)),
        ))
        db.send_create_signal('main', ['FB_User'])

        # Adding M2M table for field albums on 'FB_User'
        db.create_table('main_fb_user_albums', (
            ('id', models.AutoField(verbose_name='ID', primary_key=True, auto_created=True)),
            ('fb_user', models.ForeignKey(orm['main.fb_user'], null=False)),
            ('album', models.ForeignKey(orm['main.album'], null=False))
        ))
        db.create_unique('main_fb_user_albums', ['fb_user_id', 'album_id'])

        # Adding M2M table for field friends on 'FB_User'
        db.create_table('main_fb_user_friends', (
            ('id', models.AutoField(verbose_name='ID', primary_key=True, auto_created=True)),
            ('from_fb_user', models.ForeignKey(orm['main.fb_user'], null=False)),
            ('to_fb_user', models.ForeignKey(orm['main.fb_user'], null=False))
        ))
        db.create_unique('main_fb_user_friends', ['from_fb_user_id', 'to_fb_user_id'])

        # Adding M2M table for field winning_photos on 'FB_User'
        db.create_table('main_fb_user_winning_photos', (
            ('id', models.AutoField(verbose_name='ID', primary_key=True, auto_created=True)),
            ('fb_user', models.ForeignKey(orm['main.fb_user'], null=False)),
            ('photo', models.ForeignKey(orm['main.photo'], null=False))
        ))
        db.create_unique('main_fb_user_winning_photos', ['fb_user_id', 'photo_id'])

        # Adding M2M table for field active_nominations on 'FB_User'
        db.create_table('main_fb_user_active_nominations', (
            ('id', models.AutoField(verbose_name='ID', primary_key=True, auto_created=True)),
            ('fb_user', models.ForeignKey(orm['main.fb_user'], null=False)),
            ('nomination', models.ForeignKey(orm['main.nomination'], null=False))
        ))
        db.create_unique('main_fb_user_active_nominations', ['fb_user_id', 'nomination_id'])

        # Adding model 'Portrit_User'
        db.create_table('main_portrit_user', (
            ('id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('active', self.gf('django.db.models.fields.BooleanField')(default=True)),
            ('created_date', self.gf('django.db.models.fields.DateField')(auto_now_add=True, blank=True)),
            ('access_token', self.gf('django.db.models.fields.CharField')(max_length=255, null=True)),
            ('fb_user', self.gf('django.db.models.fields.related.ForeignKey')(related_name='portrit_fb_user', to=orm['main.FB_User'])),
            ('name', self.gf('django.db.models.fields.CharField')(max_length=255, null=True, blank=True)),
            ('user', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['auth.User'], null=True, blank=True)),
        ))
        db.send_create_signal('main', ['Portrit_User'])

        # Adding M2M table for field notifications on 'Portrit_User'
        db.create_table('main_portrit_user_notifications', (
            ('id', models.AutoField(verbose_name='ID', primary_key=True, auto_created=True)),
            ('portrit_user', models.ForeignKey(orm['main.portrit_user'], null=False)),
            ('notification', models.ForeignKey(orm['main.notification'], null=False))
        ))
        db.create_unique('main_portrit_user_notifications', ['portrit_user_id', 'notification_id'])

        # Adding M2M table for field referred_friends on 'Portrit_User'
        db.create_table('main_portrit_user_referred_friends', (
            ('id', models.AutoField(verbose_name='ID', primary_key=True, auto_created=True)),
            ('portrit_user', models.ForeignKey(orm['main.portrit_user'], null=False)),
            ('fb_user', models.ForeignKey(orm['main.fb_user'], null=False))
        ))
        db.create_unique('main_portrit_user_referred_friends', ['portrit_user_id', 'fb_user_id'])

        # Adding M2M table for field badges on 'Portrit_User'
        db.create_table('main_portrit_user_badges', (
            ('id', models.AutoField(verbose_name='ID', primary_key=True, auto_created=True)),
            ('portrit_user', models.ForeignKey(orm['main.portrit_user'], null=False)),
            ('badge', models.ForeignKey(orm['main.badge'], null=False))
        ))
        db.create_unique('main_portrit_user_badges', ['portrit_user_id', 'badge_id'])


    def backwards(self, orm):
        
        # Deleting model 'Comment'
        db.delete_table('main_comment')

        # Removing M2M table for field comments on 'Comment'
        db.delete_table('main_comment_comments')

        # Deleting model 'Badge_Category'
        db.delete_table('main_badge_category')

        # Deleting model 'Badge'
        db.delete_table('main_badge')

        # Removing M2M table for field associates on 'Badge'
        db.delete_table('main_badge_associates')

        # Deleting model 'Nomination_Category'
        db.delete_table('main_nomination_category')

        # Deleting model 'Nomination'
        db.delete_table('main_nomination')

        # Removing M2M table for field comments on 'Nomination'
        db.delete_table('main_nomination_comments')

        # Removing M2M table for field votes on 'Nomination'
        db.delete_table('main_nomination_votes')

        # Deleting model 'Photo'
        db.delete_table('main_photo')

        # Removing M2M table for field nominations on 'Photo'
        db.delete_table('main_photo_nominations')

        # Deleting model 'Album'
        db.delete_table('main_album')

        # Removing M2M table for field photos on 'Album'
        db.delete_table('main_album_photos')

        # Deleting model 'Notification_Type'
        db.delete_table('main_notification_type')

        # Deleting model 'Notification'
        db.delete_table('main_notification')

        # Deleting model 'FB_User'
        db.delete_table('main_fb_user')

        # Removing M2M table for field albums on 'FB_User'
        db.delete_table('main_fb_user_albums')

        # Removing M2M table for field friends on 'FB_User'
        db.delete_table('main_fb_user_friends')

        # Removing M2M table for field winning_photos on 'FB_User'
        db.delete_table('main_fb_user_winning_photos')

        # Removing M2M table for field active_nominations on 'FB_User'
        db.delete_table('main_fb_user_active_nominations')

        # Deleting model 'Portrit_User'
        db.delete_table('main_portrit_user')

        # Removing M2M table for field notifications on 'Portrit_User'
        db.delete_table('main_portrit_user_notifications')

        # Removing M2M table for field referred_friends on 'Portrit_User'
        db.delete_table('main_portrit_user_referred_friends')

        # Removing M2M table for field badges on 'Portrit_User'
        db.delete_table('main_portrit_user_badges')


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
            'created_date': ('django.db.models.fields.DateField', [], {'auto_now_add': 'True', 'blank': 'True'}),
            'fb_user': ('django.db.models.fields.related.ForeignKey', [], {'related_name': "'portrit_fb_user'", 'to': "orm['main.FB_User']"}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '255', 'null': 'True', 'blank': 'True'}),
            'notifications': ('django.db.models.fields.related.ManyToManyField', [], {'symmetrical': 'False', 'to': "orm['main.Notification']", 'null': 'True', 'blank': 'True'}),
            'referred_friends': ('django.db.models.fields.related.ManyToManyField', [], {'symmetrical': 'False', 'to': "orm['main.FB_User']", 'null': 'True', 'blank': 'True'}),
            'user': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['auth.User']", 'null': 'True', 'blank': 'True'})
        }
    }

    complete_apps = ['main']
