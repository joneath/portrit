Ti.App.addEventListener('pass_nom_data', function(eventData) {
    name = String(eventData.name);
    user = String(eventData.user);
    photo = eventData.photo;
    nominations = eventData.nominations;
    tagged_users = eventData.tagged_users;
    new_photo = eventData.new_photo;
    
    init_share_nom();
});

Ti.include('../../settings.js');
Ti.include('../../includes.js');
// Ti.include('lib/oauth_adapter.js');

var win = Ti.UI.currentWindow,
    tabGroup = win.tabGroup,
    twitter_switch = null,
    facebook_switch = null,
    tv = null,
    me = JSON.parse(Ti.App.Properties.getString("me")),
    photo_id = null,
    user = null,
    name = '',
    photo = null,
    window_nav_bar = null,
    back_buttom = null,
    button_label = null,
    privacy_switch = null;
    list_view_data = [ ];
    
var window_slide_out = Titanium.UI.createAnimation({
    curve: Ti.UI.ANIMATION_CURVE_EASE_IN,
    left: -320,
    duration: 250
});

var window_slide_in = Titanium.UI.createAnimation({
    curve: Ti.UI.ANIMATION_CURVE_EASE_IN,
    left: 0,
    duration: 300
});

var window_slide_back = Titanium.UI.createAnimation({
    curve: Ti.UI.ANIMATION_CURVE_EASE_IN,
    left: 320,
    duration: 250
});

window_nav_bar = Titanium.UI.createView({
    backgroundImage: '../../images/iphone_header_blank.png',
    width: 320,
    height: 40,
    top: 0
});

back_buttom = Titanium.UI.createButton({
    width: 68,
    height: 32,
    left: 0,
    title: 'Back',
    font: {fontSize: 11, fontWeight: 'bold'},
    backgroundImage: '../../images/back.png'
});

back_buttom.addEventListener('click', function(){
    // if (!new_photo){
        win.close();
    // }
    // else{
    //     win.animate(window_slide_back);
    //     Ti.App.fireEvent('cancel_share');
    // }
});
window_nav_bar.add(back_buttom);

var post_nom = Ti.UI.createButton({
    backgroundImage: '../../images/square_button.png',
    color: '#99CB6E',
	title:"Done",
	width: 58,
	height: 32,
    right: 5,
    font: {fontSize: 12, fontWeight: 'bold'}
});
post_nom.addEventListener('click', submit_nom);
window_nav_bar.add(post_nom);

var header_label = Titanium.UI.createLabel({
        text: 'Share',
        color: '#fff',
        textAlign: 'center',
        font:{fontSize:22, fontWeight: 'bold'}
    });
window_nav_bar.add(header_label);

win.add(window_nav_bar);

// var oAuthAdapter = new OAuthAdapter(
//         'rWxNvv8pOSB0t9kgT59xVc2IUQXH1l8ESpfOst5sggw',
//         'RrYAd721jXeCJsp9QqtFw',
//         'HMAC-SHA1');
// 
// oAuthAdapter.loadAccessToken('twitter');

var fadeTo = Titanium.UI.createAnimation({
    curve: Ti.UI.ANIMATION_CURVE_EASE_IN,
    opacity: 0.5,
    duration: 200
});

var fadeIn = Titanium.UI.createAnimation({
    curve: Ti.UI.ANIMATION_CURVE_EASE_IN,
    opacity: 1.0,
    duration: 300
});

var fadeOut = Titanium.UI.createAnimation({
    curve: Ti.UI.ANIMATION_CURVE_EASE_IN,
    opacity: 0,
    duration: 200
});

window_activity = Titanium.UI.createActivityIndicator({
    message: 'Saving...',
    color: '#fff',
    font:{fontSize:16, fontWeight: 'bold'},
    height:50,
    width:10,
    top: 100
});
window_activity.show()

window_activity_background = Titanium.UI.createView({
    backgroundColor: '#000',
    opacity: 0.8,
    height: 480,
    width: 320,
    zIndex: -1
});

window_activity_cont = Titanium.UI.createView({
    top: 0,
    width: 320,
    height: 480,
    zIndex: 20
});
window_activity_cont.hide();
window_activity_cont.add(window_activity_background);
window_activity_cont.add(window_activity);
win.add(window_activity_cont);

function close_share_nom(){
    var data = JSON.parse(this.responseData);
    
    var nom = null;
    window_activity_cont.hide();
    caption.blur();
    
    if (!new_photo){
        var nom = data[0];
        try{
            if (twitter_switch && twitter_switch.value){
                share_on_twitter(me, nom, caption_text);
            }
        }
        catch (e){
            
        }
        
        try{
            if (facebook_switch.value){
                var title = me.name.split(' ')[0] + ' nominated a photo for ' + nom.nomination_category + ' on Portrit';
                share_on_facebook(me, nom, caption_text, title);
            }
        }
        catch (e){
            
        }
    }
    else{
        if (typeof(data.length) != 'undefined'){
            try{
                var nom = data[0];
                try{
                    if (twitter_switch && twitter_switch.value){
                        share_on_twitter(me, nom, caption_text);
                    }
                }
                catch (e){
                    
                }
                try{
                    if (facebook_switch.value){
                        var title = me.name.split(' ')[0] + ' nominated a photo for ' + nom.nomination_category + ' on Portrit';
                        share_on_facebook(me, nom, caption_text, title);
                    }
                }
                catch (e){
                    
                }
            }
            catch (e){
                
            }
        }
        else{
            try{
                if (twitter_switch && twitter_switch.value){
                    share_on_twitter(me, data, caption_text);
                }
            }
            catch (e){
                
            }
            try{
                if (facebook_switch.value){
                    var title = me.name.split(' ')[0] + ' shared a photo on Portrit';
                    share_on_facebook(me, data, caption_text, title);
                }
            }
            catch(e){
                
            }
        }
    }

    if (new_photo){
        tabGroup.bottom = 0;
        
        if (nominations != ''){
            tabGroup.setActiveTab(0);
        }
        else{
            tabGroup.setActiveTab(4);
        }
        
        win.close({animated:false});
        Ti.App.fireEvent('close_nominate_page', { });
        Ti.App.fireEvent('close_settings_page', { });

        setTimeout(function(){
            if (nominations != ''){
                Ti.App.fireEvent('reset_after_camera', { });
                Ti.App.fireEvent('update_active_noms', { });
                if (user == me.fid){
                    if (Ti.App.Properties.getString("profile_rendered")){
                        Ti.App.fireEvent('update_my_photos', { });
                        Ti.App.fireEvent('update_my_noms', { });
                    }
                }
            }
            else{
                if (Ti.App.Properties.getString("profile_rendered")){
                    Ti.App.fireEvent('update_my_photos', { });
                }
                Ti.App.fireEvent('reset_after_camera', { });
            }
    	}, 450);
    }
    else{
        tabGroup.setActiveTab(0);
        
        win.close({animated:false});
        Ti.App.fireEvent('close_nominate_page', { });
        Ti.App.fireEvent('close_settings_page', { });
        
        setTimeout(function(){
    	    Ti.App.fireEvent('update_active_noms', { });
            if (user == me.fid){
                Ti.App.fireEvent('update_my_photos', { });
            }
    	}, 450);
    }
}

var upload_progress_bar = Titanium.UI.createProgressBar({
    width: 250,
    min: 0,
    max: 100,
    value: 0,
    color: '#000',
    top: 200,
    // message:'Downloading 0 of 10',
    // font:{fontSize:14, fontWeight:'bold'},
    style:Titanium.UI.iPhone.ProgressBarStyle.PLAIN
});
window_activity_cont.add(upload_progress_bar);

var upload_id = '';
var caption_text = '';
function submit_nom(e){
    var url = '';
    var check_upload_interval = null;
    var progress = 0;
    var prev_progress = 0;
    var prev_check_count = 0;
    var check_count = 0;
    var upload_ready_state = 0;
    var timeout_count = 0;
    var restart_count = 0;
    
    caption_text = caption.value;
    window_activity_cont.show();
    
    if (new_photo){
        upload_progress_bar.show();
        clearInterval(check_upload_interval);
        check_upload_interval = setInterval(function(){
            upload_id = Ti.App.Properties.getString("upload_complete");
            upload_ready_state = Ti.App.Properties.getString("upload_ready_state");
            
            if (upload_id){
                clearInterval(check_upload_interval);
                var public_post = false;
                if (privacy_switch.value){
                    public_post = true;
                }
                
                if (nominations != ''){
                    url = SERVER_URL + '/api/nominate_photo/';
                    var send_data = {
                        'access_token': me.access_token,
                        'photo_id': upload_id,
                        'owner': user,
                        'nominations': nominations,
                        'tags': tagged_users,
                        'comment_text': caption_text,
                        'public': public_post
                    };
                    post_photo(url, send_data);
                }
                else{
                    url = SERVER_URL + '/mark_photos_live/';
                    var send_data = {
                        'photo_ids': upload_id, 
                        'access_token': me.access_token, 
                        'public_perm': public_post
                    };
                    post_photo(url, send_data);
                }

            }
            else{
                progress = Ti.App.Properties.getString("upload_progress");
                if (progress){
                    try{
                        progress = parseFloat(progress);
                        upload_progress_bar.value = progress;
                    }
                    catch (e){
                        
                    }
                }
            }
            
            if (check_count % 8 == 0 && check_count > 0){
                prev_progress = progress;
                prev_check_count = check_count;
            }
            if ((check_count > 35 && (!progress || progress <= 5) && parseInt(upload_ready_state) < 4) || (check_count > 35 && (progress - prev_progress == 0) && (check_count - prev_check_count > 4) && progress < 50) || check_count > 100){
                clearInterval(check_upload_interval);
                
                var f = Titanium.Filesystem.getFile(Titanium.Filesystem.applicationDataDirectory, 'temp.png');
                Titanium.Media.saveToPhotoGallery(f);
                
                var upload_error_alert = Titanium.UI.createAlertDialog({
                	title:'Unable to upload photo. Photo saved to Camera Roll.',
                	buttonNames: ['OK'],
                	cancel: 0
                });
                upload_error_alert.addEventListener('click', function(e){
                    if (e.index == 0){
                        Ti.App.fireEvent('abort_upload', { });
                        tabGroup.bottom = 0;
                        if (nominations != ''){
                            tabGroup.setActiveTab(0);
                        }
                        else{
                            tabGroup.setActiveTab(4);
                        }
                        
                        win.close({animated:false});
                        Ti.App.fireEvent('close_nominate_page', { });
                        Ti.App.fireEvent('close_settings_page', { });                        
                        Ti.App.fireEvent('reset_after_camera_to_profile', { });
                    }
                    // if (e.index == 1){
                    //     check_count = 0;
                    //     Ti.App.fireEvent('restart_upload', { });
                    //     submit_nom();
                    // }
                });
                upload_error_alert.show();
            }
            check_count += 1;
        }, 200);
    }
    else{
        var xhr = Titanium.Network.createHTTPClient();
        xhr.onload = close_share_nom;
        
        url = SERVER_URL + '/api/nominate_photo/';
        var send_data = {
            'access_token': me.access_token,
            'photo_id': photo.id,
            'owner': user,
            'nominations': nominations,
            'tags': tagged_users,
            'comment_text': caption_text,
        };
        xhr.open('POST', url);
        xhr.send(send_data);
    }
}

var upload_photo_request = Titanium.Network.createHTTPClient({enableKeepAlive:false});
function post_photo(url, data){
    var check_photo_upload = null;
    var upload_ready_state = 0;
    
    upload_photo_request.timeout = 20000;
    upload_photo_request.onload = close_share_nom;
    
    upload_photo_request.onreadystatechange = function(){
        upload_ready_state = upload_photo_request.readyState;
    };
    
    upload_photo_request.open('POST', url);
    upload_photo_request.send(data);
    
    var upload_tick = 0;
    clearInterval(check_photo_upload);
    check_photo_upload = setInterval(function(){
        if (upload_ready_state == 4){
            clearInterval(check_photo_upload);
        }
        else if (upload_tick >= 10 && upload_ready_state < 4){
            clearInterval(check_photo_upload);
            upload_photo_request.abort();
            post_photo(url, data);
        }
        else if (upload_tick > 30){
            clearInterval(check_photo_upload);
            upload_photo_request.abort();
            
            tabGroup.close();
            win.close({animated:false});
            Ti.App.fireEvent('close_nominate_page', { });
            Ti.App.fireEvent('close_settings_page', { });
            
            tabGroup.opacity = 0;
            tabGroup.bottom = 0;
            
            setTimeout(function(){
                tabGroup.open(fadeIn);
                setTimeout(function(){
                    if (nominations != ''){
                        tabGroup.setActiveTab(0);
                    }
                    else{
                        tabGroup.setActiveTab(4);
                    }
                    
                    Ti.App.fireEvent('abort_upload', { });
                    Ti.App.fireEvent('reset_after_camera_to_profile', { });
                }, 400);
            }, 50);
        }
        upload_tick += 1;
    }, 200);
}

tv = Ti.UI.createTableView({
        backgroundColor: '#eee',
        top: 40,
        style:Titanium.UI.iPhone.TableViewStyle.GROUPED
    });
    
tv.addEventListener('click', function(e){

});
win.add(tv);

// function caption_blur(e){
//     tv.height = '100%';
// }

var init_share_nom = function(){
    var options_data = [ ];
    
    // Find/Follow Section
    var section = Titanium.UI.createTableViewSection({
        
    });
    
    var row = Ti.UI.createTableViewRow({
            backgroundColor: '#fff',
            selectionStyle: Titanium.UI.iPhone.TableViewCellSelectionStyle.NONE
    });
    
    caption = Titanium.UI.createTextField({
        backgroundColor: '#fff',
        color: '#333',
        width: 290,
        height: 35,
        paddingLeft: 5,
        paddingRight: 5,
        font: {fontSize: 18},
        hintText: 'Caption'
    });
    // caption.addEventListener('focus', function(){
    //     
    // });
    // caption.addEventListener('blur', caption_blur);
    
    row.add(caption);
    section.add(row);
    options_data.push(section);
    
    var share_label = Titanium.UI.createLabel({
	    text: 'Share',
        color: '#4c566d',
        left: 20,
        size: {width: 'auto', height: 'auto'},
        font:{fontSize: 18, fontWeight: 'bold'}
    });
    var share_header = Titanium.UI.createView({
        height: 30,
        width: 'auto'
    });
    share_header.add(share_label);
    
    var section = Titanium.UI.createTableViewSection({
        headerView: share_header
    });
    
    var row = Ti.UI.createTableViewRow({
            // hasChild: true,
            title: 'Facebook',
            color: '#333',
            font:{fontSize: 18, fontWeight: 'bold'},
            backgroundColor: '#fff',
            selectionStyle: Titanium.UI.iPhone.TableViewCellSelectionStyle.NONE
    });
    facebook_switch = Titanium.UI.createSwitch({
        value: false,
        right: 10
    });
    row.add(facebook_switch);
    section.add(row);
    
    var has_child = false;
    if (oAuthAdapter.isAuthorized() == false) {
        has_child = true;
    }
    
    var row = Ti.UI.createTableViewRow({
            hasChild: has_child,
            title: 'Twitter',
            color: '#333',
            font:{fontSize: 18, fontWeight: 'bold'},
            backgroundColor: '#fff',
            selectionStyle: Titanium.UI.iPhone.TableViewCellSelectionStyle.NONE
    });
    
    var link_label = null;
    if (oAuthAdapter.isAuthorized() == false) {
        link_label = Titanium.UI.createLabel({
            textAlign: 'right',
    	    text: 'Configure',
            color: '#689AC9',
            right: 15,
            size: {width: 100, height: 'auto'},
            font:{fontSize: 16}
        });
        row.add(link_label);
    }
    else{
        twitter_switch = Titanium.UI.createSwitch({
            value: false,
            right: 10
        });
        row.add(twitter_switch);
    }
    
    row.addEventListener('click', function(){
        if (oAuthAdapter.isAuthorized() == false) {
            // this function will be called as soon as the application is authorized
            var receivePin = function() {
                // get the access token with the provided pin/oauth_verifier
                oAuthAdapter.getAccessToken('http://twitter.com/oauth/access_token');
                // save the access token
                oAuthAdapter.saveAccessToken('twitter');
                
                row.remove(link_label);
                row.hasChild = false;
                var twitter_switch = Titanium.UI.createSwitch({
                    value: true,
                    right: 10
                });
                row.add(twitter_switch);
            };
            
            var request_token = oAuthAdapter.getRequestToken('https://api.twitter.com/oauth/request_token', 'oob');
            
            // show the authorization UI and call back the receive PIN function
            oAuthAdapter.showAuthorizeUI('https://twitter.com/oauth/authorize?' + request_token, receivePin);
        }
    })
    
    section.add(row);
    
    options_data.push(section);
    
    if (new_photo){
        var pivacy_label = Titanium.UI.createLabel({
    	    text: 'Privacy',
            color: '#4c566d',
            left: 20,
            size: {width: 'auto', height: 'auto'},
            font:{fontSize: 18, fontWeight: 'bold'}
        });
        var privacy_desc = Titanium.UI.createLabel({
    	    text: 'Photo will be viewable in the community section.',
            color: '#4c566d',
            left: 20,
            top: 5,
            size: {width: 'auto', height: 'auto'},
            font:{fontSize: 12, fontWeight: 'bold'}
        });
        var privacy_footer = Titanium.UI.createView({
            height: 'auto',
            width: 'auto'
        });
        privacy_footer.add(privacy_desc);
        
        var privacy_header = Titanium.UI.createView({
            height: 30,
            width: 'auto'
        });
        privacy_header.add(pivacy_label);

        var section = Titanium.UI.createTableViewSection({
            headerView: privacy_header,
            footerView: privacy_footer
        });

        var row = Ti.UI.createTableViewRow({
                // hasChild: true,
                title: 'Public',
                color: '#333',
                font:{fontSize: 18, fontWeight: 'bold'},
                backgroundColor: '#fff',
                selectionStyle: Titanium.UI.iPhone.TableViewCellSelectionStyle.NONE
        });
        privacy_switch = Titanium.UI.createSwitch({
            value: true,
            right: 10
        });
        row.add(privacy_switch);
        section.add(row);
        options_data.push(section);
    }
    
    tv.setData(options_data);
};

Ti.App.addEventListener('close_share', function(e){
    win.hide();
    win.close();
});

Ti.App.addEventListener('close_nom_share', function(e){
    win.hide();
    win.close();
});