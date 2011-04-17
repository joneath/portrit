Ti.App.addEventListener('pass_nom_data', function(eventData) {
    name = String(eventData.name);
    user = String(eventData.user);
    photo = eventData.photo;
    nominations = eventData.nominations;
    tagged_users = eventData.tagged_users;
    new_photo = eventData.new_photo;
});

Ti.include('../../settings.js');
Ti.include('../../includes.js');
Ti.include('lib/oauth_adapter.js');

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
    if (typeof(new_photo) == 'undefined'){
        win.close();
    }
    else{
        var current_win = win;
        win.close(window_slide_back);
        Ti.App.fireEvent('cancel_share');
    }
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

var oAuthAdapter = new OAuthAdapter(
        'rWxNvv8pOSB0t9kgT59xVc2IUQXH1l8ESpfOst5sggw',
        'RrYAd721jXeCJsp9QqtFw',
        'HMAC-SHA1');

oAuthAdapter.loadAccessToken('twitter');

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
    width:10
});
window_activity.show()

window_activity_background = Titanium.UI.createView({
    backgroundColor: '#000',
    borderRadius: 5,
    opacity: 0.8,
    height: 120,
    width: 120,
    zIndex: -1
});

window_activity_cont = Titanium.UI.createView({
    top: 100,
    width: 320,
    height: 120,
    zIndex: 20
});
window_activity_cont.hide();
window_activity_cont.add(window_activity_background);
window_activity_cont.add(window_activity);
win.add(window_activity_cont);

function close_share_nom(){
    var data = JSON.parse(this.responseData);
    
    var nom = null;
    if (typeof(new_photo) != 'undefined'){
        
    }
    else{
        var nom = data[0];
        if (twitter_switch && twitter_switch.value){
            share_on_twitter(me, nom, caption_text);
        }
        if (facebook_switch.value){
            var title = me.username + ' nominated a photo on Portrit';

            share_on_facebook(me, nom, caption_text, title);
        }
    }
    
    window_activity_cont.hide();
    if (typeof(new_photo) != 'undefined'){
        win.close(fadeOut);
        
        setTimeout(function(){
            win.opacity = 1;
            Ti.App.fireEvent('close_nominate_page', { });
            Ti.App.fireEvent('update_active_noms', { });
            if (user == me.fid){
                Ti.App.fireEvent('update_my_photos', { });
            }
            Ti.App.fireEvent('reset_after_camera', { });
        }, 200);
    }
    else{
        win.close();
        tabGroup.close();
        tabGroup.opacity = 0;
        setTimeout(function(){
            tabGroup.open(fadeIn);
            setTimeout(function(){
        	    Ti.App.fireEvent('update_active_noms', { });
                Ti.App.fireEvent('close_nominate_page', { });
                Ti.App.fireEvent('close_user_profile_page', { });
                if (user == me.fid){
                    Ti.App.fireEvent('update_my_photos', { });
                }
        	}, 100);
        }, 50); 
    }

}

var upload_id = '';
function submit_nom(e){
    var caption_text = caption.value;
    
    window_activity_cont.show();
    var xhr = Titanium.Network.createHTTPClient();
    xhr.onload = close_share_nom;
    
    var url = '';
    var check_upload_interval = null;
    if (typeof(new_photo) != 'undefined'){
        clearInterval(check_upload_interval);
        check_upload_interval = setInterval(function(){
            upload_id = Ti.App.Properties.getString("upload_complete");
            if (upload_id){
                clearInterval(check_upload_interval);
                
                url = SERVER_URL + '/mark_photos_live/';
                var mark_live = Titanium.Network.createHTTPClient();
                mark_live.onload = close_share_nom;
                mark_live.open('POST', url);
                mark_live.send({'photo_ids': upload_id, 'access_token': me.access_token});
                
                if (nominations != ''){
                    url = SERVER_URL + '/api/nominate_photo/';
                    var send_data = {
                        'access_token': me.access_token,
                        'photo_id': upload_id,
                        'owner': user,
                        'nominations': nominations,
                        'tags': tagged_users,
                        'comment_text': caption_text,
                    };
                    xhr.open('POST', url);
                    xhr.send(send_data);
                }
            }
        }, 100);
    }
    else{
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

tv = Ti.UI.createTableView({
        backgroundColor: '#eee',
        top: 40,
        style:Titanium.UI.iPhone.TableViewStyle.GROUPED
    });
    
tv.addEventListener('click', function(e){

});
win.add(tv);

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
    
    if (typeof(new_photo) != 'undefined'){
        
    }
    
    tv.setData(options_data);
}();