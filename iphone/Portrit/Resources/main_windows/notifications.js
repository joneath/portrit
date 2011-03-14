Ti.include('../settings.js');
Ti.include('../includes.js');

var me = JSON.parse(Ti.App.Properties.getString("me")),
    win = Ti.UI.currentWindow,
    tv = null,
    list_view_data = [ ],
    notification_cache = [ ],
    notification_count = 0,
    newest_notification = null,
    window_nav_bar = null,
    clear_button = null,
    notifications_empty_row = null;

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
        font:{fontSize:28}
    });
    
window_nav_bar.add(header_label);
win.add(window_nav_bar);
win.hideNavBar({animated:false});

function row_click(e){
    
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
        time = null,
        now = new Date(),
        time_label = null,
        time_view = null,
        time_diff = null,
        ;
    
    for (var i = 0; i < data.length; i++){
        row = Ti.UI.createTableViewRow({
                backgroundColor: '#fff',
                height:'auto'
        });
        
        if (data[i].notification_type == 'tagged_nom'){
            label_text = data[i].source_name + ' tagged you in a photo.';
            left_image = '../images/notification_tag.png';
        }
        else if (data[i].notification_type == 'nom_won'){
            if (data[i].destination_id == me.fid){
                target_name = 'Your';
            }
            else{
                target_name = data[i].destination_name + '\'s';
            }
            label_text = target_name + ' nomination won';
            left_image = '../images/notification_trophy.png';
        }
        else if (data[i].notification_type == 'new_nom'){
            label_text = data[i].source_name + ' nominated your photo.';
            left_image = '../images/notification_nomination.png';
        }
        else if (data[i].notification_type == 'new_comment'){
            label_text = data[i].source_name + ' commented on your photo.';
            left_image = '../images/notification_comments.png';
        }
        row.leftImage = left_image;
        
        time = new Date(data[i].create_time * 1000);
        time_diff = now - time;
        time_diff /= 1000;
        
        time_label = Titanium.UI.createLabel({
                text: secondsToHms(time_diff),
                color: '#666',
                textAlign: 'left',
                font:{fontSize:10},
                size: {width: 'auto', height: 'auto'}
            });
            
        time_view = Titanium.UI.createView({
                right: 15,
                bottom: 0,
                size: {width: 'auto', height: 'auto'}
            });
        time_view.add(time_label)
        
        notification_label = Titanium.UI.createLabel({
                text: label_text,
                color: '#222',
                textAlign: 'left',
                left: 40,
                right: 15,
                top: 5, 
                height: 'auto',
                font:{fontSize:13}
            });
        
        nom_cat_underscore = data[i].nomination_category.replace(' ', '_').toLowerCase();
        nom_cat_color = get_nom_cat_color(nom_cat_underscore);
        nomination_category_bar = Titanium.UI.createView({
            backgroundColor: nom_cat_color,
            height: 40,
            width: 10,
            right: 0,
        });
        row.selectedBackgroundColor = nom_cat_color;
        
        row.notification = data[i];
        row.index = i;
        
        row.add(nomination_category_bar);
        row.add(notification_label);
        row.add(time_view);
        
        row.addEventListener('click', row_click);
        
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
    xhr.send({'clear': true, 'user': me.fid});
    
    notification_count = 0;
    notification_cache = [ ];
    tv.setData([notifications_empty_row]);
    clear_button.hide();
}

function row_delete(e){
    var notification = e.rowData.notification;
    var notification_id = notification.notification_id;
    var kill = true;
    
    var xhr = Titanium.Network.createHTTPClient();

    // xhr.onload = function()
    // {   
    //     
    // };
    
    var url = SERVER_URL + '/api/notification_read/';
    xhr.open('POST', url);

    // send the data
    xhr.send({'notification_id': notification_id, 'kill': true});
    
    notification_count -= 1;
    if (notification_count <= 0){
        notification_count = 0;
        notification_cache = [ ];
        tv.setData([notifications_empty_row]);
        clear_button.hide();
    }
    
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
    
    // Clear Notifacation badge
    var tabGroup = win.tabGroup;
    tabGroup.tabs[3].badge = null;
    
    var xhr = Titanium.Network.createHTTPClient();

    xhr.onload = function()
    {   
        var data = JSON.parse(this.responseData);
        
        notifications_empty_row = Ti.UI.createTableViewRow({
                height:'auto'
        });
        var notifications_empty_label = Ti.UI.createLabel({
        	text:"You Have no Updates",
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
            newest_notification = notification_cache[0].create_time;
            render_notifications(notification_cache);
        }
        else{
            notifications_empty_row.show();
            tv.setData([notifications_empty_row]);
        }
    };
    
    var url = SERVER_URL + '/api/get_active_notifications/?fb_user=' + me.fid
    xhr.open('GET', url);

    // send the data
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

    function beginReloading()
    {
        var xhr = Titanium.Network.createHTTPClient();

        xhr.onload = function()
        {
        	data = JSON.parse(this.responseData);
        	if (data.length > 0){
        	    notification_count += data.length;
        	    clear_button.show();
        	    list_view_data = [ ];
                update_notifications(data);
                newest_notification = notification_cache[0].create_time;
                render_notifications(notification_cache);
        	}
            endReloading();
        };
        
        var url = '';
        if (notification_cache.length > 0){
            url = SERVER_URL + '/api/get_active_notifications/?fb_user=' + me.fid + '&new_date=' + newest_notification;
        }
        else{
            url = SERVER_URL + '/api/get_active_notifications/?fb_user=' + me.fid;
        }
        
        xhr.open('GET', url);

        // send the data
        xhr.send();
    }

    function endReloading()
    {
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
    
    tv.addEventListener('scroll',function(e)
    {
    	var offset = e.contentOffset.y;
    	if (offset <= -65.0 && !pulling)
    	{
    		var t = Ti.UI.create2DMatrix();
    		t = t.rotate(-180);
    		pulling = true;
    		arrow.animate({transform:t,duration:180});
    		statusLabel.text = "Release to update...";
    	}
    	else if (pulling && offset > -65.0 && offset < 0)
    	{
    		pulling = false;
    		var t = Ti.UI.create2DMatrix();
    		arrow.animate({transform:t,duration:180});
    		statusLabel.text = "Pull down to update...";
    	}
    });

    tv.addEventListener('scrollEnd',function(e)
    {
    	if (pulling && !reloading && e.contentOffset.y <= -65.0)
    	{
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