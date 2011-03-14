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

var follow_all_button = Ti.UI.createButton({
	title:"Follow All",
	font: {fontSize: 12, fontWeight: 'bold'},
	backgroundImage: '../../../../images/square_button.png',
	width: 58,
	height: 32,
    right: 0,
});
follow_all_button.addEventListener('click', function(){
    win.close();
});
window_nav_bar.add(follow_all_button);

win.add(window_nav_bar);

function go_to_profile(e){
    if (e.source.button == undefined){
        var w = Ti.UI.createWindow({backgroundColor:"#333", url:'../../profile.js'});
    	Titanium.UI.currentTab.open(w,{animated:true});

    	setTimeout(function(){
    	    Ti.App.fireEvent('pass_user', {
                user: e.rowData.user_fid,
                name: e.rowData.username
            });
    	}, 200);
    }
}

function follow_event(e){
    var method = e.source.method,
        parent = e.source.parent_row,
        user_fid = e.source.user_fid;
        
    if (method == 'follow'){
        parent.remove(e.source);
        var xhr = Titanium.Network.createHTTPClient();

        xhr.onload = function()
        {   
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
            
            follow_button.addEventListener('click', follow_event);

            parent.add(follow_button);
        };

        var url = SERVER_URL + '/api/follow_unfollow_user/';
        xhr.open('POST', url);

        // send the data
        xhr.send({'source': me.fid, 'target': user_fid, method: 'follow'});
    }
    else{
        parent.remove(e.source);
        
        var xhr = Titanium.Network.createHTTPClient();

        xhr.onload = function()
        {   
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
            
            follow_button.addEventListener('click', follow_event);

            parent.add(follow_button);
        };

        var url = SERVER_URL + '/api/follow_unfollow_user/';
        xhr.open('POST', url);

        // send the data
        xhr.send({'source': me.fid, 'target': user_fid, method: 'unfollow'});
    }
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
            left: 45
        });
        
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
        follow_button.addEventListener('click', follow_event);
        
        row.user_fid = data[i].fid;
        row.username = data[i].name;
        row.addEventListener('click', go_to_profile);
        
        row.add(profile_image);
        row.add(name);
        
        list_view_data.push(row);
    }
    tv.setData(list_view_data);
}

function search_by_names(names){
    var xhr = Titanium.Network.createHTTPClient();

    xhr.onload = function()
    {   
        var data = JSON.parse(this.responseData);
        render_follow_table_view(data);
    };
    
    var url = SERVER_URL + '/api/search_by_names/';
    xhr.open('POST', url);

    // send the data
    xhr.send({'names': names, 'source': me.fid});
}
    
function init_follow_friends(){
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
            });
        }
    }
    else if (find_type == 'contacts'){
        alert('here')
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

Ti.App.addEventListener('find_type', function(eventData) {
    find_type = String(eventData.find_type);
    
    init_follow_friends();
});

