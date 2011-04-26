Ti.include('settings.js');
Ti.include('includes.js');
Ti.include('urbanairship.js');

UrbanAirship.key='XOeKRpIDSJmpSvVAwjRXdg';
UrbanAirship.secret ='r7RXQj6zS2ifBGXXLVy9Ag';
UrbanAirship.master_secret='GtOv_7dURFOvSGLWcDne0A';
UrbanAirship.baseurl = 'https://go.urbanairship.com';

// this sets the background color of the master UIView (when there are no windows/tab groups on it)
Titanium.UI.setBackgroundColor('#000');

//Facebook auth
Titanium.Facebook.appid = "155664697800227";
Titanium.Facebook.permissions = ['read_stream','publish_stream','user_photos','user_videos','friends_photos','friends_videos','friends_status','user_photo_video_tags','friends_photo_video_tags','offline_access','email'];

var window_slide_out = Titanium.UI.createAnimation({
    curve: Ti.UI.ANIMATION_CURVE_EASE_IN,
    left: -320,
    duration: 250
});

var window_slide_back = Titanium.UI.createAnimation({
    curve: Ti.UI.ANIMATION_CURVE_EASE_IN,
    left: 0,
    duration: 250
});

var window_slide_in = Titanium.UI.createAnimation({
    curve: Ti.UI.ANIMATION_CURVE_EASE_IN,
    left: 0,
    duration: 300
});

var me = { };

// create tab group
var tabGroup = Titanium.UI.createTabGroup({id:'tabGroup1'});

var notification_view_animation_timeout = null;
var notification_view = Titanium.UI.createView({
    backgroundColor: '#222',
    height: 50,
    width: 320,
    bottom: 48,
    left: -350,
    zIndex: 100
});

notification_view.addEventListener('click', function(){
    clearTimeout(notification_view_animation_timeout);
    
    Ti.App.fireEvent('push_update', {});
    tabGroup.setActiveTab(3);
    notification_view.animate({
        curve: Ti.UI.ANIMATION_CURVE_EASE_IN,
        left: -320,
        duration: 300,
        complete: function(){
            notification_view.hide();
        }
    });
});

var notification_view_text = Ti.UI.createLabel({
    text: '',
    width:320,
    height: 'auto',
    color:'#eee',
    textAlign:'center',
    font:{fontSize:14,fontWeight:'bold'}
});
notification_view.add(notification_view_text);

var notification_dropshadow_top = Titanium.UI.createView({
    backgroundImage: 'images/upper_drop_shadow.png',
    height: 2,
    width: 320,
    top: -2,
    zIndex: 1
});
notification_view.add(notification_dropshadow_top);
tabGroup.add(notification_view);

//
// create base UI tab and root window
//
var win1 = Titanium.UI.createWindow({  
    title:'Stream',
    url:'main_windows/active.js',
    backgroundColor:'#000'
});
win1.hideNavBar({animated:false});

Titanium.UI.iPhone.setStatusBarStyle(Titanium.UI.iPhone.StatusBar.OPAQUE_BLACK);

var tab1 = Titanium.UI.createTab({  
    icon:'images/active_button.png',
    title:'Stream',
    window:win1
});

//
// create controls tab and root window
//
var win2 = Titanium.UI.createWindow({  
    title:'Community',
    url:'main_windows/community.js',
    backgroundColor:'#000'
});
win2.hideNavBar({animated:false});
var tab2 = Titanium.UI.createTab({  
    icon:'images/com_button.png',
    title:'Community',
    window:win2
});

var win3 = Titanium.UI.createWindow({  
    title:'Share',
    url:'main_windows/share.js',
    fullscreen: true,
    backgroundColor:'#000'
});
win3.hideNavBar({animated:false});
var tab3 = Titanium.UI.createTab({ 
    icon:'images/camera_button.png',
    title:'Share',
    window:win3
});

//Win 4
var win4 = Titanium.UI.createWindow({  
    title:'Updates',
    url:'main_windows/notifications.js',
    backgroundColor:'#000'
});
win4.hideNavBar({animated:false});
var tab4 = Titanium.UI.createTab({  
    icon:'images/notification_button.png',
    title:'Updates',
    window:win4
});

//Win 5
var win5 = Titanium.UI.createWindow({  
    title:'Profile',
    url:'main_windows/profile.js',
    backgroundColor:'#000'
});
win5.hideNavBar({animated:false});
var tab5 = Titanium.UI.createTab({  
    icon:'images/profile_button.png',
    title:'Profile',
    window:win5
});

//  add tabs
tabGroup.addTab(tab1);
tabGroup.addTab(tab2);
tabGroup.addTab(tab3);
tabGroup.addTab(tab4);
tabGroup.addTab(tab5);


var selected_tab_index = 0;
var prev_tab_index = 0;
tabGroup.addEventListener('focus', function(e){
    selected_tab_index = e.index;
    prev_tab_index = e.previousIndex;
    
    Ti.App.Properties.setString("selected_tab_index", selected_tab_index);
    Ti.App.Properties.setString("selected_tab_index", prev_tab_index);
});

win3.addEventListener('focus', function(){
    tabGroup.bottom = -50;
});

function load_portrit(animate){
    me = JSON.parse(Ti.App.Properties.getString("me"));
    me.fid = Titanium.Facebook.uid;
    me.access_token = Titanium.Facebook.accessToken;

    // if (typeof(me.username) == 'undefined'){
    //     Ti.App.Properties.setString("me", JSON.stringify(me));
    //     init_new_user();
    // }
    // else{
        register_push_notifications(me.fid);
        Titanium.UI.iPhone.appBadge = 0;

        if (animate){
            tabGroup.left = 320;
            tabGroup.open(window_slide_in);
        }
        else{
            tabGroup.open();
        }
    // }
}

function init_new_user(){
    var create_account_win = Titanium.UI.createWindow({
        left: 320,
        width: 320
    });
    
    var logo_cont = Titanium.UI.createView({
            height: 'auto',
            top: 20,
            bottom: 20,
            width: 320,
            layout: 'vertical'
        });
    
    var logo = Ti.UI.createImageView({
		image: 'images/logo.png',
		top: 30,
		bottom: 10,
		height: 89,
		width: 200
	});
	logo_cont.add(logo);
	
	var signup_text = Titanium.UI.createLabel({
	    text: 'Almost there, just a few loose ends.',
	    textAlign: 'center',
        color: '#fff',
        top: 10,
        bottom: 10,
        size: {width: 'auto', height: 'auto'},
        font:{fontSize:16, fontWeight: 'bold'}
    });
    logo_cont.add(signup_text);
    
    tv = Ti.UI.createTableView({
            backgroundImage: 'images/background.png',
            headerView: logo_cont,
            scrollable: false,
            style:Titanium.UI.iPhone.TableViewStyle.GROUPED
        });

    tv.addEventListener('click', function(e){

    });
    var tv_data = [ ];
    var section = Titanium.UI.createTableViewSection({
        
    });
    
    var row = Ti.UI.createTableViewRow({
            backgroundColor: '#fff',
            selectionStyle: Titanium.UI.iPhone.TableViewCellSelectionStyle.NONE
    });
    
    username = Titanium.UI.createTextField({
        backgroundColor: '#fff',
        color: '#333',
        width: 290,
        height: 35,
        paddingLeft: 5,
        paddingRight: 5,
        font: {fontSize: 18},
        hintText: 'Username',
        autocapitalization: Titanium.UI.TEXT_AUTOCAPITALIZATION_NONE,
        returnKeyType: Titanium.UI.RETURNKEY_GO
    });
    username.addEventListener('focus', function(){
        tv.scrollToTop(120);
    });
    username.addEventListener('blur', function(){
        // tv.scrollToTop(0);
    });
    username.addEventListener('return', function(e){
        if (username.value != ''){
            var xhr = Titanium.Network.createHTTPClient();
            xhr.onload = function(){
                var data = JSON.parse(this.responseData);
                if (data){
                    create_account_win.close(window_slide_out);
                    me.username = data.username;
                    me.name = data.name;
                    Ti.App.Properties.setString("me", JSON.stringify(me));
                    load_portrit(true);
                }
            };

            var url = SERVER_URL + '/api/add_username/';
            xhr.open('POST', url);
            xhr.send({
                'username': username.value,
                'post_wins': post_wins.value,
                'access_token': me.access_token
            });
        }
        else{
            
        }
    });
    var check_name_aval = null;
    username.addEventListener('change', function(e){
        if (e.value != ''){
            clearTimeout(check_name_aval);
            check_name_aval = setTimeout(function(){
                username_activity.zIndex = 2;
                var xhr = Titanium.Network.createHTTPClient();
                xhr.onload = function(){
                    username_activity.zIndex = -1;
                    var data = JSON.parse(this.responseData);
                    if (data == true){
                        
                    }
                    else{
                        
                    }
                };

                var url = SERVER_URL + '/api/check_username_availability/';
                xhr.open('POST', url);
                xhr.send({
                    'username': e.value
                });
            }, 1000);
        }
    });
    
    username_activity = Titanium.UI.createActivityIndicator({
        height:50,
        width:10,
        right: 10,
        zIndex: 2,
        style: Titanium.UI.iPhone.ActivityIndicatorStyle.DARK
    });
    row.add(username_activity);
    row.add(username);    
    section.add(row);
    tv_data.push(section);
    
    var section = Titanium.UI.createTableViewSection({
        
    });
    
    var row = Ti.UI.createTableViewRow({
            backgroundColor: '#fff',
            selectionStyle: Titanium.UI.iPhone.TableViewCellSelectionStyle.NONE
    });
    
    var post_wins_label = Titanium.UI.createLabel({
	    text: 'Post Wins to Facebook',
	    textAlign: 'left',
        color: '#333',
        left: 10,
        size: {width: 'auto', height: 'auto'},
        font:{fontSize:14, fontWeight: 'bold'}
    });
    row.add(post_wins_label);
    
    var post_wins = Titanium.UI.createSwitch({
        value: true,
        right: 10
    });
    row.add(post_wins);
    section.add(row);
    
    tv_data.push(section);
    
    tv.setData(tv_data);
    create_account_win.add(tv);
    if (typeof(landing_win) == 'undefined'){
        create_account_win.open(window_slide_in);
    }
    else{
        landing_win.animate(window_slide_out);
        create_account_win.open(window_slide_in);
    }
}

function render_photos(data){
    var top = 12;
    var photo_in_row = 0;
    var photo_data = [ ];
    var top_offset = 5;
    
    if (data.length < top){
        top = data.length;
    }
    
    for (var i = 0; i < top; i++){
        if (i % 3 == 0 && i > 0){
            photo_in_row = 0;
            top_offset = 0;
            row = Ti.UI.createTableViewRow({
                    height:'auto',
                    selectionStyle: Titanium.UI.iPhone.TableViewCellSelectionStyle.NONE
            });
            img_cont = Titanium.UI.createView({
                height: 'auto',
                width: 320
            });
            row.add(img_cont);
            
            photo_data.push(row);
        }
        else if (i == 0){
            var row = Ti.UI.createTableViewRow({
                    height:'auto',
                    selectionStyle: Titanium.UI.iPhone.TableViewCellSelectionStyle.NONE
            });
            
            var img_cont = Titanium.UI.createView({
                height: 'auto',
                width: 320
            });
            row.add(img_cont);
            
            photo_data.push(row);
        }
        
        var image_thumb = Ti.UI.createImageView({
    		image: data[i].photo.crop,
    		defaultImage: 'images/photo_loader.png',
            left: (photo_in_row * 105) + 5,
            bottom: 5,
            top: top_offset,
    		width: 100,
    		height: 75,
    		hires: true
    	});
    	img_cont.add(image_thumb);
        photo_in_row += 1;
    }
    photo_cont.setData(photo_data);
}

function trophy_selected(e){
    var scroll_pos = (e.source.index * 76) - 117;
    if (scroll_pos < 0){
        scroll_pos = 0;
    }
    else if (scroll_pos + 320 > scroll_width){
        scroll_pos = scroll_width - 320;
    }
    trophy_scroll_view.scrollTo(scroll_pos, 0);
    
    for (var i = 0; i < trophy_thumbs.length; i++){
        if (i != e.source.index){
    	    trophy_thumbs[i].opacity = 0.5;
    	}
    	else{
    	    trophy_thumbs[i].opacity = 1.0;
    	}
    }
    
    var xhr = Titanium.Network.createHTTPClient();
    xhr.onload = function(){
        var data = JSON.parse(this.responseData);
        photo_ind.hide();
        
        render_photos(data);
    };

    var selected_cat = e.source.nom_cat;
    var url = SERVER_URL + '/api/get_community_top_nominations_cat/?cat=' + selected_cat;
    xhr.open('GET', url);
    xhr.send();
}

var trophy_thumbs = [ ];
if (!Titanium.Facebook.loggedIn){
    landing_win = Titanium.UI.createWindow({
        backgroundImage: 'images/background.png',
        width: 320
    });
    Titanium.UI.iPhone.setStatusBarStyle(Titanium.UI.iPhone.StatusBar.OPAQUE_BLACK);
    
    fb_button = Titanium.Facebook.createLoginButton({
        'style':'wide',
        bottom: 10
    });
    fb_button_cont = Titanium.UI.createView({
        backgroundImage: 'images/fb_login_back.png',
        height: 50,
        bottom: 0,
        width: 320
    });
    fb_button_cont.add(fb_button);
    landing_win.add(fb_button_cont);
    
    var logo = Titanium.UI.createView({
        backgroundImage: 'images/iphone_header.png',
        height: 40,
        width: 320,
        top: 0
    });
	landing_win.add(logo);
	
	var scroll_width = (76 * 10);
    trophy_scroll_view = Titanium.UI.createScrollView({
    	contentWidth: scroll_width,
    	contentHeight: 130,
        bottom: 50,
    	height: 130,
    	width: 320,
    	backgroundImage: 'images/trophy_box.png',
    	showVerticalScrollIndicator:false,
    	showHorizontalScrollIndicator:true
    });
    
    var nom_cat_underscore = '';
    var nom_cat_list = ['Fail','Party Animal','LOL','Awesome','Hot','WTF','Artsy','Cute','Yummy','Creepy'];
    var random_trophy_index = createRandomNumber(0, nom_cat_list.length - 1);
    for (var i = 0; i < nom_cat_list.length; i++){
        nom_cat_underscore = nom_cat_list[i].replace(' ', '_').toLowerCase();
        trophy_cont = Titanium.UI.createView({
            height: 130,
            width: 76,
            left: (76 * i),
            top: 0
        });
        
        trophy_label = Titanium.UI.createLabel({
    	    text: nom_cat_list[i],
            color: '#fff',
            bottom: 8,
            size: {width: 'auto', height: 'auto'},
            font:{fontSize:12, fontWeight: 'bold'}
        });
        trophy_cont.add(trophy_label);
        
        trophy = Ti.UI.createImageView({
    		image: 'images/trophies/large/' + nom_cat_underscore + '.png',
    		defaultImage: 'images/photo_loader.png',
    		width: 50,
    		height: 100,
    		top: 0,
    		hires: true
    	});
        trophy_label.nom_cat = nom_cat_list[i];
    	trophy_label.index = i;
    	trophy.nom_cat = nom_cat_list[i];
    	trophy.index = i;
    	trophy_cont.nom_cat = nom_cat_list[i];
    	trophy_cont.index = i;
    	trophy_thumbs.push(trophy_cont);
    	trophy_cont.addEventListener('click', trophy_selected);
    	
    	trophy_cont.add(trophy);
    	
    	trophy_scroll_view.add(trophy_cont);
    	
    	if (i != random_trophy_index){
    	    trophy_cont.opacity = 0.5;
    	}
	}
	landing_win.add(trophy_scroll_view);
	
	var scroll_pos = (random_trophy_index * 76) - 117;
    if (scroll_pos < 0){
        scroll_pos = 0;
    }
    else if (scroll_pos + 320 > scroll_width){
        scroll_pos = scroll_width - 320;
    }
	trophy_scroll_view.scrollTo(scroll_pos, 0);
	
	photo_cont = Ti.UI.createTableView({ 
        backgroundColor: '#000',
        allowsSelection: false,
        separatorStyle: 0,
        height: 240,
        top: 40,
        width: 320,
        style: Titanium.UI.iPhone.TableViewStyle.PLAIN
    });
    landing_win.add(photo_cont);
    
    var drop_shadow = Titanium.UI.createView({
        backgroundImage: 'images/upper_drop_shadow.png',
        height: 2,
        width: 320,
        top: 278,
        zIndex: 10
    });
    landing_win.add(drop_shadow);
    
    landing_win.open();
    
    photo_ind = Titanium.UI.createActivityIndicator({
        height:50,
        width:10,
        color: '#fff',
        style: Titanium.UI.iPhone.ActivityIndicatorStyle.BIG,
        bottom: 200
    });
    landing_win.add(photo_ind);
    
    photo_ind.show();
    var xhr = Titanium.Network.createHTTPClient();
    xhr.onload = function(){
        var data = JSON.parse(this.responseData);
        photo_ind.hide();
        render_photos(data);
    };

    var selected_cat = nom_cat_list[random_trophy_index];
    var url = SERVER_URL + '/api/get_community_top_nominations_cat/?cat=' + selected_cat;
    xhr.open('GET', url);
    xhr.send();
    
    
    // setTimeout(function(){
    //     init_new_user();
    // }, 400);
    
    Titanium.Facebook.addEventListener('login', function(e) {
        // Titanium.Facebook.removeEventListener('login');
    	if (e.success) {
            landing_win.remove(fb_button);
    	    me = {
    	        'name': e.data.name,
    	        'fid': e.data.id
    	    };
    	    me.access_token = Titanium.Facebook.accessToken;
            Ti.App.Properties.setString("me", JSON.stringify(me));
            // landing_win.close({animated:true});
            
            var actInd = Titanium.UI.createActivityIndicator({
                height:50,
                width:10,
                message: 'Signing In',
                color: '#fff',
                style: Titanium.UI.iPhone.ActivityIndicatorStyle.BIG,
                bottom: 50
            });
            actInd.show();
            landing_win.add(actInd);
            
            var xhr = Titanium.Network.createHTTPClient();
            xhr.onload = function(){
                actInd.hide();
                var data = JSON.parse(this.responseData);
                if (data.auth == 'valid' && data['new'] == true){
                    me.access_token = data.access_token;
                    Ti.App.Properties.setString("me", JSON.stringify(me));
                    init_new_user();
                }
                else if (data.auth == 'valid' && data['new'] == false){
                    me.access_token = data.access_token;
                    me.username = data.username;
                    Ti.App.Properties.setString("me", JSON.stringify(me));
                    landing_win.animate(window_slide_out);
                    load_portrit(true);
                }
            };

            var url = SERVER_URL + '/api/login/';

            xhr.open('POST', url);

            // send the data
            xhr.send({
                'fb_user': me.fid,
                'access_token': me.access_token
            });
    	}
    	if (e.error) {
    		alert(e.error);
        }
    });
}
else{
    load_portrit(false);
}

// Push Notifications
function register_push_notifications(alias){
    Ti.Network.registerForPushNotifications({
        types: [
            Ti.Network.NOTIFICATION_TYPE_BADGE,
            Ti.Network.NOTIFICATION_TYPE_ALERT,
            Ti.Network.NOTIFICATION_TYPE_SOUND
        ],
        success:function(e){
            var deviceToken = e.deviceToken;

            var params = {
                tags: ['version'+Ti.App.getVersion()],
                alias: alias
            };
            UrbanAirship.register(params, function(data) {
                if (!(Ti.App.Properties.getString('push_notifications'))){
                    var xhr = Titanium.Network.createHTTPClient();
                    var url = SERVER_URL + '/api/push_notifications/'
                    xhr.onload = function(){
                        Ti.App.Properties.setString("push_notifications", true);
                    };
                    xhr.open('POST', url);
                    xhr.send({
                        'method': 'on',
                        'access_token': me.access_token
                    });
                }
            }, function(errorregistration) {
                
            });
        },
        error:function(e) {
            Ti.API.warn("push notifications disabled: "+e);
        },
        callback: function(e){
            //Received Push Notification
            if (tabGroup.tabs[3].badge){
                tabGroup.tabs[3].badge += 1;
            }
            else{
                tabGroup.tabs[3].badge = 1;
            }
            render_notification(e.data.alert);
        }
    });
}

function render_notification(text){
    notification_view_text.text = text;
    notification_view.show();
    notification_view.animate({
        curve: Ti.UI.ANIMATION_CURVE_EASE_OUT,
        left: 0,
        duration: 300
    });
    
    notification_view_animation_timeout = setTimeout(function(){
        notification_view.animate({
            curve: Ti.UI.ANIMATION_CURVE_EASE_IN,
            left: -320,
            duration: 300,
            complete: function(){
                notification_view.hide();
            }
        });
    }, 6000);
}

function isIPhone3_2_Plus()
{
	// add iphone specific tests
	if (Titanium.Platform.name == 'iPhone OS')
	{
		var version = Titanium.Platform.version.split(".");
		var major = parseInt(version[0]);
		var minor = parseInt(version[1]);
		
		// can only test this support on a 3.2+ device
		if (major > 3 || (major == 3 && minor > 1))
		{
			return true;
		}
	}
	return false;
}

function isiOS4Plus()
{
	// add iphone specific tests
	if (Titanium.Platform.name == 'iPhone OS')
	{
		var version = Titanium.Platform.version.split(".");
		var major = parseInt(version[0]);
		
		// can only test this support on a 3.2+ device
		if (major >= 4)
		{
			return true;
		}
	}
	return false;
}

//Background services
if (isiOS4Plus()){
    // Ti.App.addEventListener('resume',function(e){
    //  Ti.API.info("app is resuming from the background");
    // });
	Ti.App.addEventListener('resumed',function(e){
	    setTimeout(function(){
	        register_push_notifications(me.fid);
	    }, 2000);
	    
        Titanium.UI.iPhone.appBadge = 0;
        
        var date_resumed = new Date().getTime();
	    var date_paused = Ti.App.Properties.getString('time_paused');
	    
        if (date_resumed - date_paused >= (1000 * 60 * 15)){
            Ti.App.fireEvent('reset', { });
        }
	});

	Ti.App.addEventListener('pause',function(e){
	    var datetime_paused = new Date().getTime();
	    Ti.App.Properties.setString("time_paused", datetime_paused);
	});
}