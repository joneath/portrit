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
    
    url(r'^convert_twitter_bridge/$', 'main.user_views.convert_twitter_bridge', name='convert_twitter_bridge'),   
)

#Nomination Views
urlpatterns += patterns('',
    url(r'^nominate_photo/$', 'main.nomination_views.nominate_photo', name='nominate_photo'),
    url(r'^reactivate_nom/$', 'main.nomination_views.reactivate_nom', name='reactivate_nom'),
    url(r'^vote/$', 'main.nomination_views.vote_on_nomination', name='vote_on_nomination'),
    url(r'^get_trophy_wins/$', 'main.nomination_views.get_trophy_wins', name='get_trophy_wins'),
    url(r'^get_user_album_nom_data/$', 'main.nomination_views.get_user_album_nom_data', name='get_user_album_nom_data'),
    url(r'^get_users_active_noms/$', 'main.nomination_views.get_users_active_noms', name='get_users_active_noms'),
    url(r'^get_nom_comments/$', 'main.nomination_views.get_nom_comments', name='get_nom_comments'),
    url(r'^get_nom_votes/$', 'main.nomination_views.get_nom_votes', name='get_nom_votes'),
    url(r'^new_comment/$', 'main.nomination_views.new_comment', name='new_comment'),
    url(r'^get_recent_winners/$', 'main.nomination_views.get_recent_winners', name='get_recent_winners'),
    url(r'^init_stream/$', 'main.nomination_views.init_stream', name='init_stream'),
)

#API URLs
urlpatterns += patterns('',
    url(r'^api/get_recent_stream/$', 'main.api_views.get_recent_stream'),
    url(r'^api/get_top_stream/$', 'main.api_views.get_top_stream'),
    url(r'^api/get_winners_stream/$', 'main.api_views.get_winners_stream'),
    url(r'^api/get_user_profile/$', 'main.api_views.get_user_profile'),
    url(r'^api/get_user_stream_photos/$', 'main.api_views.get_user_stream_photos'),
    url(r'^api/get_noms_in_cat/$', 'main.api_views.get_noms_in_cat'),
    
    url(r'^api/get_user_wins_trophy_cat/$', 'main.api_views.get_user_wins_trophy_cat'),
    url(r'^api/get_all_wins_trophy_cat/$', 'main.api_views.get_all_wins_trophy_cat'),
    
    url(r'^api/get_user_trophies/$', 'main.api_views.get_user_trophies'),
    
    #User
    url(r'^api/login/$', 'main.api_views.sign_in_create'),
    url(r'^api/check_username_availability/$', 'main.api_views.check_username_availability'),
    url(r'^api/add_username/$', 'main.api_views.add_username'),
    
    #Nominations
    url(r'^api/nominate_photo/$', 'main.api_views.nominate_photo'),
    url(r'^api/vote_on_nomination/$', 'main.api_views.vote_on_nomination'),
    url(r'^api/get_nom_detail/$', 'main.api_views.get_nom_detail'),
    
    #Follow
    url(r'^api/get_follow_count/$', 'main.api_views.get_follow_count'),
    url(r'^api/get_my_follow_data/$', 'main.api_views.get_my_follow_data'),
    url(r'^api/get_follow_data/$', 'main.api_views.get_follow_data'),
    url(r'^api/get_follow_data_detailed/$', 'main.api_views.get_follow_data_detailed'),
    url(r'^api/follow_unfollow_user/$', 'main.api_views.follow_unfollow_user'),
    url(r'^api/follow_permission_submit/$', 'main.api_views.follow_permission_submit'),
    
    #Community
    url(r'^api/get_community_photos/$', 'main.api_views.get_community_photos'),
    url(r'^api/get_community_nominations/$', 'main.api_views.get_community_nominations'),
    url(r'^api/get_community_top_nominations_cat/$', 'main.api_views.get_community_top_nominations_cat'),
    url(r'^api/get_community_top_stream/$', 'main.api_views.get_community_top_stream'),
    
    #Notifications
    url(r'^api/get_active_notifications/$', 'main.api_views.get_active_notifications'),
    url(r'^api/notification_read/$', 'main.api_views.notification_read'),
    
    #Comments
    url(r'^api/get_comments/$', 'main.api_views.get_comments'),
    url(r'^api/new_comment/$', 'main.api_views.new_comment'),
    
    #Search
    url(r'^api/search/$', 'main.api_views.search'),
    url(r'^api/combined_search/$', 'main.api_views.combined_search'),
    url(r'^api/search_by_names/$', 'main.api_views.search_by_names'),
    url(r'^api/search_cool_kids/$', 'main.api_views.search_cool_kids'),
    
    #Flag
    url(r'^api/flag/photo$', 'main.api_views.flag_photo'),
    
    #Settings
    url(r'^api/get_user_settings/$', 'main.api_views.get_user_settings'),
    url(r'^api/change_user_settings/$', 'main.api_views.change_user_settings'),
)

#iPhone Views
urlpatterns += patterns('',
    url(r'^init_app/$', 'main.iphone_views.init_app'),
    
)

#Community URLs
urlpatterns += patterns('',
    url(r'^get_community/$', 'main.community_views.get_community', name='get_community'),
    url(r'^get_more_community_photos/$', 'main.community_views.get_more_community_photos', name='get_more_community_photos'),
)

#Photo URLs
urlpatterns += patterns('',
    url(r'^latest-photos/$', 'main.photo_views.latest_photos', name='latest_photos'),
    url(r'^upload_photo/$', 'main.photo_views.upload_photo', name='upload_photo'),
    url(r'^mark_photos_live/$', 'main.photo_views.mark_photos_live', name='mark_photos_live'),
)

#Public URLs
urlpatterns += patterns('',
    url(r'^get_photo/$', 'main.public_views.get_photo', name='get_photo'),
    url(r'^get_nom/$', 'main.public_views.get_nom', name='get_nom'),
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