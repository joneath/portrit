var win = Ti.UI.currentWindow;
var tv = null;

var window_nav_bar = Titanium.UI.createView({
    backgroundImage: '../images/iphone_header_blank.png',
    width: 320,
    height: 40,
    top: 0
});

var header_label = Titanium.UI.createLabel({
        text: 'Updates',
        color: '#fff',
        textAlign: 'center',
        font:{fontSize:22, fontWeight: 'bold'}
    });
    
window_nav_bar.add(header_label);
win.add(window_nav_bar);
win.hideNavBar({animated:false});

Ti.include('../settings.js');
Ti.include('../includes.js');

var me = JSON.parse(Ti.App.Properties.getString("me")),
    win = Ti.UI.currentWindow,
    tv = null,
    list_view_data = [ ],
    notification_cache = [ ],
    notification_count = 0,
    newest_notification = null,
    clear_button = null,
    notifications_empty_row = null;

var fadeTo = Titanium.UI.createAnimation({
    curve: Ti.UI.ANIMATION_CURVE_EASE_IN,
    opacity: 0.5,
    duration: 200
});

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
    height: 120,
    width: 120,
    zIndex: -1
});

window_activity_cont = Titanium.UI.createView({
    top: 150,
    width: 320,
    height: 120,
    zIndex: 20
});
window_activity_cont.show();
window_activity_cont.add(window_activity_background);
window_activity_cont.add(window_activity);
win.add(window_activity_cont);

function window_activity_timeout(){
    setTimeout(function(){
        window_activity_cont.hide();
    }, 2000);
}

var notification_read_list = [ ];
function add_detail_window(e){
    var w = Ti.UI.createWindow({backgroundColor:"#222", url:'nom/detail.js'});
	Titanium.UI.currentTab.open(w,{animated:true});
	
	setTimeout(function(){
	    Ti.App.fireEvent('pass_detail', {
            nom_id: e.rowData.nom_id,
            photo: e.rowData.photo,
            user: e.rowData.username,
            won: false
        });
	}, 200);
	if (notification_read_list.indexOf(e.rowData.notification_id) == -1){
	    mark_read(e.rowData.notification_id);
	    notification_read_list.push(e.rowData.notification_id);
	}
}

function add_detail_trophy_window(e){
    var w = Ti.UI.createWindow({backgroundColor:"#333", url:'nom/detail.js'});
	Titanium.UI.currentTab.open(w,{animated:true});
	
	setTimeout(function(){
	    Ti.App.fireEvent('pass_detail', {
            nom_id: e.rowData.nom_id,
            photo: e.rowData.photo,
            nom_cat: e.rowData.nom_cat,
            user: e.rowData.user,
            user: e.rowData.username,
            won: true
        });
	}, 200);
    if (notification_read_list.indexOf(e.rowData.notification_id) == -1){
	    mark_read(e.rowData.notification_id);
	    notification_read_list.push(e.rowData.notification_id);
	}
}

function add_profile_window(e){
    if (typeof(e.source.button) == 'undefined'){
        var w = Ti.UI.createWindow({backgroundColor:"#222", url:'user/profile.js'});
    	Titanium.UI.currentTab.open(w,{animated:true});

    	setTimeout(function(){
    	    Ti.App.fireEvent('pass_user', {
                user: e.source.user,
                name: e.source.name,
                username: e.rowData.username,
            });
    	}, 200);
        if (notification_read_list.indexOf(e.rowData.notification_id) == -1){
    	    mark_read(e.rowData.notification_id);
    	    notification_read_list.push(e.rowData.notification_id);
    	}
    }
}

function post_follow_permission(e){
    var xhr = Titanium.Network.createHTTPClient();

    xhr.onload = function(){   
        var data = JSON.parse(this.responseData);
        if (data){
            // e.source.row.opacity = 1;
            // e.source.row.animate(fadeOut);
            // setTimeout(function(){
                tv.deleteRow(e.source.row);
            // }, 200);
        }
    };
    
    var url = SERVER_URL + '/api/follow_permission_submit/';
    xhr.open('POST', url);

    // send the data
    xhr.send({'notification_id': e.source.notification_id, 'value': e.index, 'access_token': me.access_token});
}

function render_notifications(data){
    var row = null,
        notification_label = null
        nomination_category_bar = null,
        nom_cat_underscore = '',
        nom_cat_color = '',
        label_text = '',
        left_image = '',
        target_name = '',
        target_username = '',
        time = null,
        now = new Date(),
        time_label = null,
        time_view = null,
        time_diff = null;
    
    for (var i = 0; i < data.length; i++){
        row = Ti.UI.createTableViewRow({
                backgroundColor: '#fff',
                height: 40
        });
        
        if (data[i].notification_type == 'tagged_nom'){
            label_text = data[i].source_username + ' tagged you in a photo.';
            left_image = '../images/notification_tag.png';
            
            row.nom_id = data[i].nomination;
            row.photo = data[i].photo;
            row.username = data[i].source_username;
            row.notification_id = data[i].notification_id;
        	row.addEventListener('click', add_detail_window);
        }
        else if (data[i].notification_type == 'nom_won'){
            if (data[i].destination_id == me.fid){
                target_name = 'Your';
                target_username = me.username;
            }
            else{
                target_name = data[i].destination_username + '\'s';
                target_username = data[i].destination_username;
            }
            label_text = target_name + ' nomination won';
            left_image = '../images/notification_trophy.png';
            
            row.nom_id = data[i].nomination;
            row.photo = data[i].photo;
            row.nom_cat = data[i].nomination_category;
            row.user = data[i].destination_id;
            row.username = target_username;
            row.notification_id = data[i].notification_id;
            
        	row.addEventListener('click', add_detail_trophy_window);
        }
        else if (data[i].notification_type == 'new_nom'){
            label_text = data[i].source_username + ' nominated your photo.';
            left_image = '../images/notification_nomination.png';
            
            row.nom_id = data[i].nomination;
            row.photo = data[i].photo;
            row.username = me.username;
            row.notification_id = data[i].notification_id;
            
        	row.addEventListener('click', add_detail_window);
        }
        else if (data[i].notification_type == 'new_comment'){
            if (data[i].destination_id == me.fid){
                target_name = 'your';
                target_username = me.username;
            }
            else if (data[i].destination_id == data[i].source_id){
                target_name = 'their';
                target_username = data[i].source_username;
            }
            else{
                target_name = data[i].destination_username + '\'s';
                target_username = data[i].destination_username
            }
            label_text = data[i].source_username + ' commented on ' + target_name + ' photo.';
            left_image = '../images/notification_comments.png';
            
            row.nom_id = data[i].nomination;
            row.photo = data[i].photo;
            row.username = target_username;
            row.notification_id = data[i].notification_id;
            
        	row.addEventListener('click', add_detail_window);
        }
        else if (data[i].notification_type == 'new_follow'){
            if (data[i].pending){
                var pending_button_bar = Titanium.UI.createButtonBar({
                	labels:['Deny', 'Accept'],
                	backgroundColor:'#336699',
                    right: 10,
                	style:Titanium.UI.iPhone.SystemButtonStyle.BAR,
                	height:25,
                	width:100
                });
                pending_button_bar.button = true;
                pending_button_bar.notification_id = data[i].notification_id;
                pending_button_bar.row = row;
                pending_button_bar.addEventListener('click', post_follow_permission);
                row.add(pending_button_bar);
                label_text = data[i].source_username + ' would like to follow you.';
            }
            else{
                label_text = data[i].source_username + ' has begun to follow you.';
            }
            left_image = '../images/notification_following.png';
            
            row.user = data[i].source_id;
            row.name = data[i].source_name;
            row.username = data[i].source_username;
            row.notification_id = data[i].notification_id;
            
        	row.addEventListener('click', add_profile_window);
        }
        row.leftImage = left_image;
        
        time = new Date(data[i].create_time * 1000);
        time_diff = now - time;
        time_diff /= 1000;
        
        time_label = Titanium.UI.createLabel({
                text: secondsToHms(time_diff),
                color: '#666',
                textAlign: 'right',
                font:{fontSize:10},
                size: {width: 320, height: 12}
            });
            
        time_view = Titanium.UI.createView({
                right: 15,
                bottom: 0,
                size: {width: 320, height: 12}
            });
        time_view.add(time_label);
        
        notification_label_cont = Titanium.UI.createView({
            top: 0,
            size: {width: 300, height: 40}
        });
        
        notification_label = Titanium.UI.createLabel({
                text: label_text,
                color: '#222',
                textAlign: 'left',
                left: 25,
                right: 15,
                top: 5, 
                height: 'auto',
                font:{fontSize:13}
            });
            
        notification_label_cont.add(notification_label);

        
        if (data[i].notification_type != 'new_follow'){
            nom_cat_underscore = data[i].nomination_category.replace(' ', '_').toLowerCase();
            nom_cat_color = get_nom_cat_color(nom_cat_underscore);
            nomination_category_bar = Titanium.UI.createView({
                backgroundColor: nom_cat_color,
                height: 40,
                width: 10,
                right: 0,
            });
            row.selectedBackgroundColor = nom_cat_color;
            
            notification_label.nom_id = data[i].nomination;
            notification_label.photo = data[i].photo;
            notification_label.nom_cat = data[i].nomination_category;
            notification_label.user = data[i].destination_id;
            notification_label.username = data[i].destination_username;
            notification_label.notification_id = data[i].notification_id;
            
            row.add(time_view);
        }
        else{
            nomination_category_bar = Titanium.UI.createView({
                backgroundColor: '#3da732',
                height: 40,
                width: 10,
                right: 0,
            });
            row.selectedBackgroundColor = '#3da732';
            
            notification_label.user = data[i].source_id;
            notification_label.name = data[i].source_name;
            notification_label.username = data[i].source_username;
            notification_label.notification_id = data[i].notification_id;
            if (data[i].pending){
                notification_label.right = 120;
            }
            else{
                row.add(time_view);
            }
        }
        
        row.notification = data[i];
        row.index = i;
        
        row.add(nomination_category_bar);
        row.add(notification_label_cont);
        
        list_view_data.push(row);
    }
    tv.setData(list_view_data);
}

function update_notifications(data){
    for (var i = 0; i < data.length; i++){
        notification_cache.splice(0, 0, data[i]);
    }
    return notification_cache;
}

function clear_notifications(e){
    var xhr = Titanium.Network.createHTTPClient();

    // xhr.onload = function()
    // {   
    //     
    // };
    
    var url = SERVER_URL + '/api/notification_read/';
    xhr.open('POST', url);

    // send the data
    xhr.send({'clear': true, 'access_token': me.access_token});
    
    notification_count = 0;
    notification_cache = [ ];
    tv.editable = false;
    tv.setData([notifications_empty_row]);
    clear_button.hide();
}

function row_delete(e){
    var notification = e.rowData.notification;
    var notification_id = notification.notification_id;
    var kill = true;
    
    var xhr = Titanium.Network.createHTTPClient();
    
    var url = SERVER_URL + '/api/notification_read/';
    xhr.open('POST', url);

    // send the data
    xhr.send({'notification_id': notification_id, 'kill': true, 'access_token': me.access_token});
    
    notification_count -= 1;
    if (notification_count <= 0){
        notification_count = 0;
        notification_cache = [ ];
        tv.editable = false;
        tv.setData([notifications_empty_row]);
        clear_button.hide();
    }   
}

function mark_read(id){
    var xhr = Titanium.Network.createHTTPClient();
    
    var url = SERVER_URL + '/api/notification_read/';
    xhr.open('POST', url);

    // send the data
    xhr.send({'notification_id': id, 'kill': false, 'access_token': me.access_token});
}

function load_notifications(){
    tv = Ti.UI.createTableView({
            backgroundColor: '#000',
            top: 40,
            editable: true,
            // bottom: -50,
            // headerView: profile_header,
            // footerView: load_more_view,
            separatorStyle: 1,
            separatorColor: '#000',
            style: Titanium.UI.iPhone.TableViewStyle.PLAIN
        });
        
    tv.addEventListener('click', function(e){

    });
    
    tv.addEventListener('delete', row_delete);
    
    win.add(tv);
    
    clear_button = Ti.UI.createButton({
    	title:"Clear",
    	backgroundImage: '../images/square_button.png',
    	font: {fontSize: 12, fontWeight: 'bold'},
    	width: 58,
    	height: 32,
    	right: 5
    });
    clear_button.hide();
    clear_button.addEventListener('click', clear_notifications);
    window_nav_bar.add(clear_button);
    
    var xhr = Titanium.Network.createHTTPClient();

    window_activity_timeout();
    xhr.onload = function(){   
        var data = JSON.parse(this.responseData);
        
        notifications_empty_row = Ti.UI.createTableViewRow({
                height:'auto',
                selectionStyle: Titanium.UI.iPhone.TableViewCellSelectionStyle.NONE
        });
        var notifications_empty_label = Ti.UI.createLabel({
        	text:"You Have No Updates",
        	height:"auto",
        	color:"#white",
        	textAlign:"center",
        	font:{fontSize:20,fontWeight:"bold"},
        	top: 160
        });
        notifications_empty_row.add(notifications_empty_label);
        notifications_empty_row.hide();
        
        if (data.length > 0){
            notification_count = data.length;
            clear_button.show();
            notification_cache = data;
            newest_notification = notification_cache[0].notification_id;
            render_notifications(notification_cache);
        }
        else{
            notifications_empty_row.show();
            tv.editable = false;
            tv.setData([notifications_empty_row]);
        }
        window_activity_cont.hide();
    };
    
    var url = SERVER_URL + '/api/get_active_notifications/?access_token=' + me.access_token;
    xhr.open('GET', url);
    xhr.send();
    
    //Pull to refresh
    var tableHeader = Ti.UI.createView({
    	backgroundColor:"#000",
    	width:320,
    	height:60
    });
    
    var arrow = Ti.UI.createView({
    	backgroundImage:"../images/pull_arrow.png",
    	width: 33,
    	height: 41,
    	bottom:10,
    	left:20
    });

    var statusLabel = Ti.UI.createLabel({
    	text:"Pull to update",
    	left:55,
    	width:200,
    	bottom:30,
    	height:"auto",
    	color:"#999",
    	textAlign:"center",
    	font:{fontSize:13,fontWeight:"bold"}
    });

    var lastUpdatedLabel = Ti.UI.createLabel({
    	text:"Last Updated: "+formatDate(),
    	left:55,
    	width:200,
    	bottom:15,
    	height:"auto",
    	color:"#ffffff",
    	textAlign:"center",
    	font:{fontSize:12},
    });
    var actInd = Titanium.UI.createActivityIndicator({
    	left:20,
    	bottom:13,
    	width:30,
    	height:30
    });
    
    tableHeader.add(arrow);
    tableHeader.add(statusLabel);
    tableHeader.add(lastUpdatedLabel);
    tableHeader.add(actInd);

    tv.headerPullView = tableHeader;
    
    var pulling = false;
    var reloading = false;

    function beginReloading(){
        var xhr = Titanium.Network.createHTTPClient();

        xhr.onload = function(){
        	data = JSON.parse(this.responseData);
        	if (data.length > 0){
        	    notification_count += data.length;
        	    clear_button.show();
        	    list_view_data = [ ];
        	    tv.editable = true;
                update_notifications(data);
                newest_notification = notification_cache[0].notification_id;
                render_notifications(notification_cache);
        	}
            endReloading();
        };
        
        var url = '';
        if (notification_cache.length > 0){
            url = SERVER_URL + '/api/get_active_notifications/?access_token=' + me.access_token + '&id=' + newest_notification;
        }
        else{
            url = SERVER_URL + '/api/get_active_notifications/?access_token=' + me.access_token;
        }
        
        xhr.open('GET', url);
        xhr.send();
    }

    function endReloading(){
    	// when you're done, just reset
    	tv.setContentInsets({top:0},{animated:true});
    	reloading = false;
    	lastUpdatedLabel.text = "Last Updated: "+formatDate();
    	statusLabel.text = "Pull down to update...";
    	actInd.hide();
    	arrow.show();
    }
    
    tv.addEventListener('click', function(e){
        
    });
    
    tv.addEventListener('scroll',function(e){
    	var offset = e.contentOffset.y;
    	if (offset <= -65.0 && !pulling){
    		var t = Ti.UI.create2DMatrix();
    		t = t.rotate(-180);
    		pulling = true;
    		arrow.animate({transform:t,duration:180});
    		statusLabel.text = "Release to update...";
    	}
    	else if (pulling && offset > -65.0 && offset < 0){
    		pulling = false;
    		var t = Ti.UI.create2DMatrix();
    		arrow.animate({transform:t,duration:180});
    		statusLabel.text = "Pull down to update...";
    	}
    });

    tv.addEventListener('scrollEnd',function(e){
    	if (pulling && !reloading && e.contentOffset.y <= -65.0){
    		reloading = true;
    		pulling = false;
    		arrow.hide();
    		actInd.show();
    		statusLabel.text = "Reloading...";
    		tv.setContentInsets({top:60},{animated:true});
    		arrow.transform=Ti.UI.create2DMatrix();
    		beginReloading();
    	}
    });
    // End pull to refresh
}
load_notifications();

reset = false;
win.addEventListener('focus', function(){
    var tabGroup = win.tabGroup;
    tabGroup.tabs[3].badge = null;
    
    if (reset){
        reset = false;
        list_view_data = [ ];
        notification_cache = [ ];

        me = JSON.parse(Ti.App.Properties.getString("me"));

        load_notifications();
    }
});

Ti.App.addEventListener('push_update', function(eventData) {
    reset = true;
});

Ti.App.addEventListener('reset', function(eventData) {
    tv.setData([]);
    reset = true;
});