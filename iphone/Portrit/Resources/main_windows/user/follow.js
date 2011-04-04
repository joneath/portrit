Ti.include('../../settings.js');
Ti.include('../../includes.js');

var me = JSON.parse(Ti.App.Properties.getString("me")),
    win = Ti.UI.currentWindow,
    tv = null,
    user = null,
    method = null,
    window_nav_bar = null,
    back_buttom = null,
    button_label = null,
    list_view_data = [ ],
    name = '';
    
var fadeOut = Titanium.UI.createAnimation({
    curve: Ti.UI.ANIMATION_CURVE_EASE_IN,
    opacity: 0,
    duration: 200
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
    left: 5,
    title: 'Profile',
    font: {fontSize: 11, fontWeight: 'bold'},
    backgroundImage: '../../images/back.png'
});

back_buttom.addEventListener('click', function(){
    win.close();
});

window_nav_bar.add(back_buttom);

win.add(window_nav_bar);

window_activity = Titanium.UI.createActivityIndicator({
    message: 'Loading...',
    color: '#fff',
    height:50,
    width:10
});
window_activity.show()

window_activity_background = Titanium.UI.createView({
    backgroundColor: '#000',
    borderRadius: 5,
    opacity: 0.8,
    height: '100%',
    width: '100%',
    zIndex: -1
});

window_activity_cont = Titanium.UI.createView({
    height: 'auto',
    top: 150,
    width: 120,
    height: 120,
    zIndex: 20
});
window_activity_cont.hide();
window_activity_cont.add(window_activity_background);
window_activity_cont.add(window_activity);
win.add(window_activity_cont);

function go_to_profile(e){
    if (e.source.button == undefined){
        var w = Ti.UI.createWindow({backgroundColor:"#333", url:'profile.js'});
    	Titanium.UI.currentTab.open(w,{animated:true});

    	setTimeout(function(){
    	    Ti.App.fireEvent('pass_user', {
                user: e.rowData.user_fid,
                name: e.rowData.name,
                username: e.rowData.username
            });
    	}, 100);
    }
}

function follow_event(e){
    var method = e.source.method,
        parent = e.source.parent_row,
        user_fid = e.source.user_fid;
        
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

        xhr.onload = function()
        {   
            var data = JSON.parse(this.responseData);
            
            follow_button = Ti.UI.createButton({
                backgroundImage: '../../images/unfollow_button.png',
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
            parent.remove(actInd);
            parent.add(follow_button);
        };

        var url = SERVER_URL + '/api/follow_unfollow_user/';
        xhr.open('POST', url);

        // send the data
        xhr.send({'access_token': me.access_token, 'target': user_fid, method: 'follow'});
    }
    else{
        var xhr = Titanium.Network.createHTTPClient();

        xhr.onload = function()
        {   
            var data = JSON.parse(this.responseData);
            
            follow_button = Ti.UI.createButton({
                backgroundImage: '../../images/follow_button.png',
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
            parent.remove(actInd);
            parent.add(follow_button);
        };

        var url = SERVER_URL + '/api/follow_unfollow_user/';
        xhr.open('POST', url);

        // send the data
        xhr.send({'access_token': me.access_token, 'target': user_fid, method: 'unfollow'});
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
        name = null;
    
    for (var i = 0; i < data.length; i++){
        row = Ti.UI.createTableViewRow({
                height:'auto'
        });
        
        profile_image = Ti.UI.createImageView({
    		image: 'https://graph.facebook.com/' + data[i].fid + '/picture?type=square',
    		defaultImage: '../../images/photo_loader.png',
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
        
        if (data[i].fid != me.fid){
            if (data[i].follow){
                follow_button = Ti.UI.createButton({
                    backgroundImage: '../../images/follow_button.png',
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
                    backgroundImage: '../../images/unfollow_button.png',
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
        }
        
        row.user_fid = data[i].fid;
        row.name = data[i].name;
        row.username = data[i].username;
        row.addEventListener('click', go_to_profile);
        
        row.add(profile_image);
        row.add(name);
        
        list_view_data.push(row);
    }
    tv.setData(list_view_data);
}

var init_count = 0;
var init_follow_view_count = 0;

function init_follow_view(){
    tv = Ti.UI.createTableView({
            minRowHeight:50, 
            backgroundColor: '#eee',
            separatorStyle: 1,
            top: 40,
            style: Titanium.UI.iPhone.TableViewStyle.PLAIN
        });
    
    win.add(tv);
    
    if (init_follow_view_count == 0){
        window_activity_cont.show();
        var xhr = Titanium.Network.createHTTPClient();
        xhr.onload = function()
        {   
            var data = JSON.parse(this.responseData);
            if (data.data.length > 0){
                render_follow_table_view(data.data);
            }
            window_activity_cont.animate(fadeOut);
        };

        var url = SERVER_URL + '/api/get_follow_data/?access_token=' + me.access_token + '&target=' + user + '&method=' + method + '&all=True';
        xhr.open('GET', url);
        xhr.send();
        
        init_follow_view_count += 1;
    }
    init_count += 1;
}

Ti.App.addEventListener('pass_user_follow', function(eventData) {
    if (init_count == 0){
        user = String(eventData.user);
        name = String(eventData.name);
        method = String(eventData.method);

        init_follow_view();
    }
});