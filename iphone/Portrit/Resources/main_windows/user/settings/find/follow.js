var init_request_count = 0;
Ti.App.addEventListener('find_type', function(eventData) {
    if (init_request_count == 0){
        init_request_count += 1;
        find_type = String(eventData.find_type);

        init_follow_friends();
    }
});

Ti.include('../../../../settings.js');
Ti.include('../../../../includes.js');
Ti.include('lib/oauth_adapter.js');

var me = JSON.parse(Ti.App.Properties.getString("me")),
    win = Ti.UI.currentWindow,
    tv = null,
    user = null,
    window_nav_bar = null,
    back_buttom = null,
    button_label = null,
    name = '';
    
var oAuthAdapter = new OAuthAdapter(
        'rWxNvv8pOSB0t9kgT59xVc2IUQXH1l8ESpfOst5sggw',
        'RrYAd721jXeCJsp9QqtFw',
        'HMAC-SHA1');
        
var fadeIn = Titanium.UI.createAnimation({
    curve: Ti.UI.ANIMATION_CURVE_EASE_IN,
    opacity: 1.0,
    duration: 200
});

var fadeOut = Titanium.UI.createAnimation({
    curve: Ti.UI.ANIMATION_CURVE_EASE_IN,
    opacity: 0,
    duration: 200
});

oAuthAdapter.loadAccessToken('twitter');
    
window_nav_bar = Titanium.UI.createView({
    backgroundImage: '../../../../images/iphone_header_blank.png',
    width: 320,
    height: 40,
    top: 0
});

var back = Ti.UI.createButton({
	title:"Back",
	font: {fontSize: 12, fontWeight: 'bold'},
	backgroundImage: '../../../../images/back.png',
	width: 68,
	height: 32,
    left: 0
});
back.addEventListener('click', function(){
    win.close();
});
window_nav_bar.add(back);

// var follow_all_button = Ti.UI.createButton({
//  title:"Follow All",
//  font: {fontSize: 12, fontWeight: 'bold'},
//  backgroundImage: '../../../../images/large_square_button.png',
//  width: 80,
//  height: 32,
//     right: 5,
// });
// follow_all_button.addEventListener('click', function(){
//     win.close();
// });
// window_nav_bar.add(follow_all_button);

win.add(window_nav_bar);

function go_to_profile(e){
    if (e.source.button == undefined){
        var w = Ti.UI.createWindow({backgroundColor:"#333", url:'../../profile.js'});
    	Titanium.UI.currentTab.open(w,{animated:true});

    	setTimeout(function(){
    	    Ti.App.fireEvent('pass_user', {
                user: e.rowData.user_fid,
                name: e.rowData.name,
                username: e.rowData.username
            });
    	}, 200);
    }
}

function follow_event(e){
    var method = e.source.method,
        parent = e.source.parent_row,
        user_fid = e.source.user_fid,
        username = e.source.username;
        
    parent.remove(e.source);
    var actInd = Titanium.UI.createActivityIndicator({
        height: 50,
        width: 10,
        right: 38,
        style: Titanium.UI.iPhone.ActivityIndicatorStyle.DARK
    });
    actInd.show();
    parent.add(actInd);
        
    if (method == 'follow'){
        var xhr = Titanium.Network.createHTTPClient();

        xhr.onload = function(){   
            var data = JSON.parse(this.responseData);
            
            follow_button = Ti.UI.createButton({
                backgroundImage: '../../../../images/unfollow_button.png',
            	title:"Following",
            	font: {fontSize: 12, fontWeight: 'bold'},
            	width:76,
            	height:24,
            	right: 3,
            	zIndex: 2
            });
            
            follow_button.method = 'unfollow';
            follow_button.parent_row = parent;
            follow_button.button = true;
            follow_button.user_fid = user_fid;
            follow_button.username = username;
            
            follow_button.addEventListener('click', follow_event);
            parent.remove(actInd);
            parent.add(follow_button);
        };

        var url = SERVER_URL + '/api/follow_unfollow_user/';
        xhr.open('POST', url);

        // send the data
        xhr.send({'access_token': me.access_token, 'target': username, method: 'follow'});
    }
    else{
        var xhr = Titanium.Network.createHTTPClient();

        xhr.onload = function(){   
            var data = JSON.parse(this.responseData);
            
            follow_button = Ti.UI.createButton({
                backgroundImage: '../../../../images/follow_button.png',
            	title:"Follow",
            	font: {fontSize: 12, fontWeight: 'bold'},
            	width:76,
            	height:24,
            	right: 3,
            	zIndex: 2
            });
            
            follow_button.method = 'follow';
            follow_button.parent_row = parent;
            follow_button.button = true;
            follow_button.user_fid = user_fid;
            follow_button.username = username;
            
            follow_button.addEventListener('click', follow_event);
            parent.remove(actInd);
            parent.add(follow_button);
        };

        var url = SERVER_URL + '/api/follow_unfollow_user/';
        xhr.open('POST', url);

        // send the data
        xhr.send({'access_token': me.access_token, 'target': username, method: 'unfollow'});
    }
    
    setTimeout(function(){
	    Ti.App.fireEvent('update_follow_counts', {

        });
	}, 200);
}

function render_follow_table_view(data){
    var row = null,
        profile_image = null,
        follow_button = null,
        name = null,
        list_view_data = [ ];
    
    for (var i = 0; i < data.length; i++){
        row = Ti.UI.createTableViewRow({
                height: 45
        });
        
        profile_image = Ti.UI.createImageView({
    		image: 'https://graph.facebook.com/' + data[i].fid + '/picture?type=square',
    		defaultImage: '../../../../images/photo_loader.png',
    		left: 5,
    		width: 35,
    		height: 35,
    		hires: true
    	});
        
        name = Titanium.UI.createLabel({
            color: '#333',
            text: data[i].name,
            font: {fontSize: 16, fontWeight: 'bold'},
            top: -15,
            left: 45
        });
        
        username = Titanium.UI.createLabel({
            color: '#666',
            text: data[i].username,
            font: {fontSize: 13},
            top: 20,
            left: 45
        });
        
        if (data[i].fid != me.fid){
            if (data[i].follow){
                follow_button = Ti.UI.createButton({
                    backgroundImage: '../../../../images/follow_button.png',
                	title:"Follow",
                	font: {fontSize: 12, fontWeight: 'bold'},
                	width:76,
                	height:24,
                	right: 3,
                	zIndex: 2
                });
                follow_button.method = 'follow';
                row.add(follow_button);
            }
            else{
                follow_button = Ti.UI.createButton({
                    backgroundImage: '../../../../images/unfollow_button.png',
                	title:"Following",
                	font: {fontSize: 12, fontWeight: 'bold'},
                	width:76,
                	height:24,
                	right: 3,
                	zIndex: 2
                });
                follow_button.method = 'unfollow';
                row.add(follow_button);
            }
            follow_button.button = true;
            follow_button.parent_row = row;
            follow_button.user_fid = data[i].fid;
            follow_button.username = data[i].username;
            follow_button.addEventListener('click', follow_event);
        }
        
        row.user_fid = data[i].fid;
        row.name = data[i].name;
        row.username = data[i].username;
        row.addEventListener('click', go_to_profile);
        
        row.add(profile_image);
        row.add(name);
        row.add(username);
        
        list_view_data.push(row);
    }
    tv.setData(list_view_data);
}

window_activity = Titanium.UI.createActivityIndicator({
    message: 'Loading...',
    font:{fontSize:14, fontWeight:'bold'},
    color: '#fff',
    height:50,
    width:10
});
window_activity.show()

window_activity_background = Titanium.UI.createView({
    backgroundColor: '#000',
    borderRadius: 5,
    opacity: 0.8,
    height: 100,
    width: 100,
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

function search_by_names(names){
    var xhr = Titanium.Network.createHTTPClient();

    xhr.onload = function(){   
        var data = JSON.parse(this.responseData);
        render_follow_table_view(data);
        window_activity_cont.animate(fadeOut);
    };
    
    var url = SERVER_URL + '/api/search_by_names/';
    xhr.open('POST', url);
    xhr.send({'names': names, 'source': me.fid});
}

function search_by_email(emails){
    var xhr = Titanium.Network.createHTTPClient();

    xhr.onload = function(){   
        var data = JSON.parse(this.responseData);
        render_follow_table_view(data);
        window_activity_cont.animate(fadeOut);
    };
    
    var url = SERVER_URL + '/api/search_by_emails/';
    xhr.open('POST', url);
    xhr.send({'emails': emails, 'source': me.fid});
}

function load_cool_kids(){
    var xhr = Titanium.Network.createHTTPClient();

    xhr.onload = function(){   
        var data = JSON.parse(this.responseData);
        render_follow_table_view(data);
        window_activity_cont.animate(fadeOut);
    };
    
    var url = SERVER_URL + '/api/get_interesting_users/';
    xhr.open('GET', url);
    xhr.send();
}

function init_follow_friends(){
    window_activity_cont.opacity =1;
    window_activity_cont.show();
    if (find_type == 'twitter'){
        if (oAuthAdapter.isAuthorized() == false) {
            // this function will be called as soon as the application is authorized
            var receivePin = function() {
                // get the access token with the provided pin/oauth_verifier
                oAuthAdapter.getAccessToken('http://twitter.com/oauth/access_token');
                // save the access token
                oAuthAdapter.saveAccessToken('twitter');

                var data = oAuthAdapter.send('http://api.twitter.com/1/statuses/friends.json', [], 'GET', function(){
                    var data = JSON.parse(this.responseData);
                    var names = '';
                    for (var i = 0; i < data.length; i++){
                        names += data[i].name + ',';
                    }
                    search_by_names(names);
                });
                window_activity_cont.animate({
                    opacity: 0,
                    duration: 200,
                    curve: Ti.UI.ANIMATION_CURVE_EASE_OUT,
                });
            };

            var request_token = oAuthAdapter.getRequestToken('https://api.twitter.com/oauth/request_token', 'oob');

            // show the authorization UI and call back the receive PIN function
            oAuthAdapter.showAuthorizeUI('https://twitter.com/oauth/authorize?' + request_token, receivePin);
        }
        else{
            var data = oAuthAdapter.send('http://api.twitter.com/1/statuses/friends.json', [], 'GET', function(){
                var data = JSON.parse(this.responseData);
                var names = '';
                for (var i = 0; i < data.length; i++){
                    names += data[i].name + ',';
                }
                search_by_names(names);
                
                window_activity_cont.animate({
                    opacity: 0,
                    duration: 200,
                    curve: Ti.UI.ANIMATION_CURVE_EASE_OUT,
                });
            });
        }
    }
    else if (find_type == 'contacts'){
        // var contacts = Titanium.Contacts.getAllPeople();
        // var emails = [ ];
        // for (var i = 0; i < contacts.length; i++){
        //     emails.push(contacts[i].email);
        // }
        // search_by_email(emails);
    }
    else if (find_type == 'cool'){
        window_activity_cont.show();
        load_cool_kids();
        
        window_activity_cont.animate({
            opacity: 0,
            duration: 200,
            curve: Ti.UI.ANIMATION_CURVE_EASE_OUT,
        });
    }

    var data = [ ];
    var section = Titanium.UI.createTableViewSection({ });
}
    
tv = Ti.UI.createTableView({
        backgroundColor: '#eee',
        top: 40,
        separatorStyle: 1,
        style: Titanium.UI.iPhone.TableViewStyle.PLAIN
    });

tv.addEventListener('click', function(e){

});

win.add(tv);