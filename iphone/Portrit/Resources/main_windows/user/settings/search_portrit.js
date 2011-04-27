var win = Ti.UI.currentWindow;
var tv = null;

    
window_nav_bar = Titanium.UI.createView({
    backgroundImage: '../../../images/iphone_header_blank.png',
    width: 320,
    height: 40,
    top: 0
});

var back = Ti.UI.createButton({
	title:"Back",
	font: {fontSize: 12, fontWeight: 'bold'},
	backgroundImage: '../../../images/back.png',
	width: 68,
	height: 32,
    left: 0
});

back.addEventListener('click', function(){
    win.close();
});

window_nav_bar.add(back);

win.add(window_nav_bar);

tv = Ti.UI.createTableView({
        backgroundColor: '#eee',
        top: 83,
        separatorStyle: 1,
        style: Titanium.UI.iPhone.TableViewStyle.PLAIN
    });

tv.addEventListener('click', function(e){

});

win.add(tv);

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

Ti.include('../../../settings.js');
Ti.include('../../../includes.js');

var me = JSON.parse(Ti.App.Properties.getString("me")),
    user = null,
    window_nav_bar = null,
    back_buttom = null,
    button_label = null,
    name = '';

function go_to_profile(e){
    if (e.source.button == undefined){
        var w = Ti.UI.createWindow({backgroundColor:"#333", url:'../../user/profile.js'});
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
        user_fid = e.source.user_fid;
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

        xhr.onload = function()
        {   
            var data = JSON.parse(this.responseData);
            
            follow_button = Ti.UI.createButton({
                backgroundImage: '../../../images/unfollow_button.png',
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

        xhr.onload = function()
        {   
            var data = JSON.parse(this.responseData);
            
            follow_button = Ti.UI.createButton({
                backgroundImage: '../../../images/follow_button.png',
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
    
function render_search_results(data){
    if (data.length > 0){
        var row = null,
            profile_image = null,
            follow_button = null,
            name = null,
            username = null,
            list_view_data = [ ];

        for (var i = 0; i < data.length; i++){
            row = Ti.UI.createTableViewRow({
                    height: 45
            });

            profile_image = Ti.UI.createImageView({
        		image: '../../../images/photo_loader.png',
        		left: 5,
        		width: 35,
        		height: 35,
        		hires: true
        	});
        	cachedImageView('profile_images', 'https://graph.facebook.com/' + data[i].fid + '/picture?type=square', profile_image);

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
                        backgroundImage: '../../../images/follow_button.png',
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
                        backgroundImage: '../../../images/unfollow_button.png',
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
    else{
        var empty_row = row = Ti.UI.createTableViewRow({
                height: 45
        });
        
        var empty_label = Titanium.UI.createLabel({
            color: '#333',
            text: 'No Users Found.',
            textAlign: 'center',
            font: {fontSize: 16, fontWeight: 'bold'}
        });
        empty_row.add(empty_label);
        
        tv.setData([empty_row]);
    }
}

var search = Titanium.UI.createSearchBar({
    hintText: 'Search by name',
	barColor:'#000',
	showCancel:true,
	height:43,
	top: 40
});
search.addEventListener('cancel', function(){
    search.blur();
});
search.addEventListener('return', function(e){
    window_activity_cont.opacity = 1;
    window_activity_cont.show();
    var xhr = Titanium.Network.createHTTPClient();
    
    xhr.onload = function(){
        var data = JSON.parse(this.responseData);
        render_search_results(data);
        window_activity_cont.animate({
            opacity: 0,
            duration: 200,
            curve: Ti.UI.ANIMATION_CURVE_EASE_OUT,
        });
    };
    
    var url = SERVER_URL + '/api/search/?q=' + e.value + '&fb_user=' + me.fid;
    xhr.open('GET', url);
    xhr.send();
});

win.add(search);

setTimeout(function(){
    search.focus();
}, 250);