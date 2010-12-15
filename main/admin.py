from django.contrib.admin.sites import AdminSite
from django.contrib import admin

from main.models import Portrit_User, FB_User, Album, Photo, Nomination, Nomination_Category, Comment, \
                        Notification, Notification_Type, Badge, Badge_Category

class FB_User_Admin(admin.ModelAdmin):
    search_fields = ['fid']

admin.site.register(Portrit_User)
admin.site.register(FB_User, FB_User_Admin)
admin.site.register(Album)
admin.site.register(Photo)
admin.site.register(Nomination)
admin.site.register(Nomination_Category)
admin.site.register(Comment)
admin.site.register(Notification)
admin.site.register(Notification_Type)
admin.site.register(Badge)
admin.site.register(Badge_Category)