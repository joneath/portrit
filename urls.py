import os.path
from django.conf.urls.defaults import *
from django.contrib import admin
admin.autodiscover()

from settings import ENV

handler404 = 'main.index_views.handle404'
handler500 = 'main.index_views.handle500'

if ENV == "LOCAL":
    urlpatterns = patterns('',
        url(r'^$', 'main.index_views.index', name='index'),
    )
else:
    urlpatterns = patterns('',
        url(r'^$', 'main.index_views.index', name='index'),
        (r'^robots.txt$', 'main.index_views.robots'),
        # url(r'^beta/$', 'main.views.index', name='index'),
    )
    
#Redirect URLs
urlpatterns += patterns('django.views.generic.simple',
    ('^create_account/$', 'redirect_to', {'url': '/'}),
    ('^beta/$', 'redirect_to', {'url': '/'}),
)

#User Views
urlpatterns += patterns('',
    url(r'^login_fb_user/$', 'main.user_views.login_fb_user', name='login_fb_user'),
    url(r'^logout/$', 'main.user_views.logout_user', name='logout'),
    url(r'^perm_request/$', 'main.user_views.perm_request', name='perm_request'),
    url(r'^change_user_permissions/$', 'main.user_views.change_user_permissions', name='change_user_permissions'),
    url(r'^get_user_win_stream/$', 'main.user_views.get_user_win_stream', name='get_user_win_stream'),
    url(r'^get_user_trophies/$', 'main.user_views.get_user_trophies', name='get_user_trophies'),
    url(r'^get_user_nom/$', 'main.user_views.get_user_nom', name='get_user_nom'),
    url(r'^get_top_feed/$', 'main.user_views.get_top_feed', name='get_top_feed'),
    url(r'^get_more_recent_stream/$', 'main.user_views.get_more_recent_stream', name='get_more_recent_stream'),
    url(r'^skip_tut/$', 'main.user_views.skip_tut', name='skip_tut'),
)

#Nomination Views
urlpatterns += patterns('',
    url(r'^nominate_photo/$', 'main.nomination_views.nominate_photo', name='nominate_photo'),
    url(r'^vote/$', 'main.nomination_views.vote_on_nomination', name='vote_on_nomination'),
    url(r'^get_trophy_wins/$', 'main.nomination_views.get_trophy_wins', name='get_trophy_wins'),
    url(r'^get_user_album_nom_data/$', 'main.nomination_views.get_user_album_nom_data', name='get_user_album_nom_data'),
    url(r'^get_users_active_noms/$', 'main.nomination_views.get_users_active_noms', name='get_users_active_noms'),
    url(r'^get_nom_comments/$', 'main.nomination_views.get_nom_comments', name='get_nom_comments'),
    url(r'^get_nom_votes/$', 'main.nomination_views.get_nom_votes', name='get_nom_votes'),
    url(r'^new_comment/$', 'main.nomination_views.new_comment', name='new_comment'),
    url(r'^get_recent_winners/$', 'main.nomination_views.get_recent_winners', name='get_recent_winners'),
    url(r'^init_recent_stream/$', 'main.nomination_views.init_recent_stream', name='init_recent_stream'),
)

#Photo URLs
urlpatterns += patterns('',
    url(r'^upload_photo/$', 'main.photo_views.upload_photo', name='upload_photo'),
    url(r'^mark_photos_live/$', 'main.photo_views.mark_photos_live', name='mark_photos_live'),
)

#Notification URLs
urlpatterns += patterns('',
    url(r'^notification_read/$', 'main.notification_views.notification_read', name='notification_read'),
)

#Contact/Feedback URLS
urlpatterns += patterns('',
    url(r'^submit_feedback/$', 'main.index_views.submit_feedback', name='submit_feedback'),
    url(r'^contact_portrit/$', 'main.index_views.contact_portrit', name='contact_portrit'),
    url(r'^submit_bug_report/$', 'main.index_views.submit_bug_report', name='submit_bug_report'),
)


#Admin URLs
urlpatterns += patterns('',
	(r'^admin/', include(admin.site.urls)),
)

urlpatterns += patterns('',                                                            
	(r'^site_media/(?P<path>.*)$', 'django.views.static.serve', {'document_root': os.path.join(os.path.dirname(__file__), 'media').replace('\\','/')}),  
)