Ti.include('../../settings.js');
Ti.include('../../includes.js');
Ti.include('lib/oauth_adapter.js');

var win = Ti.UI.currentWindow,
    tabGroup = win.tabGroup,
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
    
var oAuthAdapter = new OAuthAdapter(
        'rWxNvv8pOSB0t9kgT59xVc2IUQXH1l8ESpfOst5sggw',
        'RrYAd721jXeCJsp9QqtFw',
        'HMAC-SHA1');

oAuthAdapter.loadAccessToken('twitter');

window_nav_bar = Titanium.UI.createView({
    backgroundImage: '../../images/iphone_header_blank.png',
    width: 320,
    height: 40,
    top: 0
});

back_buttom = Titanium.UI.createButton({
    width: 68,
    height: 32,
    left: 5,
    title: 'Back',
    font: {fontSize: 11, fontWeight: 'bold'},
    backgroundImage: '../../images/back.png'
});

back_buttom.addEventListener('click', function(){
    win.close();
});

window_nav_bar.add(back_buttom);

var header_label = Titanium.UI.createLabel({
        text: 'Share',
        color: '#fff',
        textAlign: 'center',
        font:{fontSize:22, fontWeight: 'bold'}
    });
window_nav_bar.add(header_label);

win.add(window_nav_bar);

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

function submit_nom(e){
    var caption_text = caption.value;
    
    var xhr = Titanium.Network.createHTTPClient();
    xhr.onload = function()
    {   
        var data = JSON.parse(this.responseData);
        // var w = Ti.UI.createWindow({backgroundColor:"#000", url:'../active.js'});
        // var slide_it_left = Titanium.UI.createAnimation();
        //     slide_it_left.opacity = 0;
        //     slide_it_left.duration = 150;
        win.close();
        tabGroup.close();
        tabGroup.opacity = 0;
        setTimeout(function(){
            tabGroup.open(fadeIn);
            setTimeout(function(){
        	    Ti.App.fireEvent('update_active_noms', {
                    
                });
                Ti.App.fireEvent('close_nominate_page', {
                    
                });
                Ti.App.fireEvent('close_user_profile_page', {
                    
                });
                if (user == me.fid){
                    Ti.App.fireEvent('update_my_photos', {

                    });
                }
        	}, 100);
        }, 50);
        // win.showTabBar({animated:true});
        // tabGroup.setActiveTab(3);
        // tabGroup.setActiveTab(0);
        
        // Titanium.UI.currentTab.open(w,{animated:true});
    };
    
    var url = SERVER_URL + '/api/nominate_photo/';
    xhr.open('POST', url);
    
    var send_data = {
        'fb_user': me.fid,
        'photo_id': photo.id,
        'owner': user,
        'nominations': nominations,
        'tags': tagged_users,
        'comment_text': caption_text
    };
    
    // send the data
    xhr.send(send_data);
}

function init_share_nom(){
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
    var facebook_switch = Titanium.UI.createSwitch({
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
        var twitter_switch = Titanium.UI.createSwitch({
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
    
    tv.setData(options_data);
}

tv = Ti.UI.createTableView({
        backgroundColor: '#eee',
        top: 40,
        style:Titanium.UI.iPhone.TableViewStyle.GROUPED
    });
    
tv.addEventListener('click', function(e){

});

win.add(tv);

var post_nom_border = Titanium.UI.createView({
    backgroundColor: '#dedede',
    bottom: 38,
    height: 2,
    width: 320
});
win.add(post_nom_border);

var post_nom = Ti.UI.createButton({
    backgroundImage: '../../images/submit_large.png',
	title:"Done",
	width: 320,
	height: 38,
    bottom: 0,
    font: {fontSize: 20, fontWeight: 'bold'}
});
post_nom.addEventListener('click', submit_nom);
win.add(post_nom);

init_share_nom();

Ti.App.addEventListener('pass_nom_data', function(eventData) {
    name = String(eventData.name);
    user = String(eventData.user);
    photo = eventData.photo;
    nominations = eventData.nominations;
    tagged_users = eventData.tagged_users;
});