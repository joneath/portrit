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
Titanium.Facebook.appid = "126374870731237";
Titanium.Facebook.permissions = ['publish_stream','offline_access','email'];

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
notification_view.hide();

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
if (Ti.Platform.osname != 'android'){
    win1.hideNavBar({animated:false});
}

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
if (Ti.Platform.osname != 'android'){
    win2.hideNavBar({animated:false});
}

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
if (Ti.Platform.osname != 'android'){
    win3.hideNavBar({animated:false});
}

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
if (Ti.Platform.osname != 'android'){
    win4.hideNavBar({animated:false});
}

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
if (Ti.Platform.osname != 'android'){
    win5.hideNavBar({animated:false});
}

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

function check_if_username(me){
    var xhr = Titanium.Network.createHTTPClient();
    xhr.onload = function(){
        var data = JSON.parse(this.responseData);
        if (data.username){
            me.username = data.username;
            Ti.App.Properties.setString("me", JSON.stringify(me));
            load_portrit(true);
        }
        else{
            init_new_user(true)
        }
    };

    var url = SERVER_URL + '/api/login/';
    xhr.open('POST', url);
    xhr.send({
        'fb_user': me.fid,
        'access_token': me.access_token
    });
}

function load_portrit(animate){
    me = JSON.parse(Ti.App.Properties.getString("me"));
    me.fid = Titanium.Facebook.uid;
    me.access_token = Titanium.Facebook.accessToken;

    if (typeof(me.username) == 'undefined' || !me.username ||me.username == ''){
        Ti.App.Properties.setString("me", JSON.stringify(me));
        check_if_username(me);
    }
    else{
        if (reset_app){
            reset_app = false;
            Ti.App.fireEvent('reset', { });
        }
        register_push_notifications(me.fid);
        Titanium.UI.iPhone.appBadge = 0;

        if (animate){
            tabGroup.left = 320;
            tabGroup.open(window_slide_in);
        }
        else{
            tabGroup.open();
        }
    }
}

function alphaNumericCheck(value){
    var regex=/^[0-9A-Za-z]+$/; //^[a-zA-z]+$/
    if(regex.test(value)){
        return true;
    } 
    else {
        return false;
    }
}

var new_user_handlers_attached = false;
function init_new_user(logout){
    var no_tabgroup = false;
    var go_shown = false;
    var create_account_win = Titanium.UI.createWindow({ });
    
    if (!landing_tabgroup){
        no_tabgroup = true;
        landing_tabgroup = Titanium.UI.createTabGroup({id:'landing_tabgroup'});

        create_account_win.hideNavBar({animated:false});

        landing_tab = Titanium.UI.createTab({
            window: create_account_win
        });

        landing_tab.add(create_account_win);
        landing_tabgroup.addTab(landing_tab);
        landing_tabgroup.bottom = -50;
    }
    
    var fadeIn = Titanium.UI.createAnimation({
        curve: Ti.UI.ANIMATION_CURVE_EASE_IN,
        opacity: 1.0,
        duration: 200
    });

    var fadeOut = Titanium.UI.createAnimation({
        curve: Ti.UI.ANIMATION_CURVE_EASE_OUT,
        opacity: 0,
        duration: 200
    });
    
    var logo_cont = Titanium.UI.createView({
            height: 169,
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
    
    var username_help_text = Titanium.UI.createLabel({
	    text: 'Only alphanumeric characters please.',
	    textAlign: 'center',
        color: '#fff',
        size: {width: 'auto', height: 'auto'},
        font:{fontSize:12, fontWeight: 'bold'}
    });
    
    var section = Titanium.UI.createTableViewSection({
        footerView: username_help_text
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
    
    var create_go = Titanium.UI.createButton({
	    backgroundImage: 'images/submit_large.png',
		title: 'Go',
		font: {fontSize: 20, fontWeight: 'bold'},
		height: 38,
		width: 320,
        bottom: 217
	});
	create_go.hide();
	create_go.opacity = 0;
    
    if (!new_user_handlers_attached){
        new_user_handlers_attached = true;
        
        username.addEventListener('focus', function(){
            tv.scrollToTop(120);
        });
        username.addEventListener('blur', function(){
            // tv.scrollToTop(0);
        });
        username.addEventListener('return', function(e){
            if (username.value != '' && alphaNumericCheck(username.value)){
                var xhr = Titanium.Network.createHTTPClient();
                xhr.onload = function(){
                    var data = JSON.parse(this.responseData);
                    if (data){
                        // create_account_win.close(window_slide_out);
                        landing_tabgroup.close(window_slide_out);
                        me.username = data.username;
                        me.name = data.name;
                        Ti.App.Properties.setString("me", JSON.stringify(me));
                        Ti.App.Properties.setString("first_stream", true);
                        Ti.App.Properties.setString("first_community", true);
                        Ti.App.Properties.setString("first_updates", true);
                        Ti.App.Properties.setString("first_profile", true);
                        Ti.App.Properties.setString("first_detail", true);
                        
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
            if (username.value != ''){
                if (alphaNumericCheck(username.value)){
                    if (!go_shown){
                        go_shown = true;
                        create_go.show();
                        create_go.animate(fadeIn);
                    }
                    cross.opacity = 0;
                    check.opacity = 0;
                    username_activity.animate(fadeIn);
                    clearTimeout(check_name_aval);
                    check_name_aval = setTimeout(function(){
                        var xhr = Titanium.Network.createHTTPClient();
                        xhr.onload = function(){
                            username_activity.animate(fadeOut);
                            var data = JSON.parse(this.responseData);
                            if (data == true){
                                if (username.value != ''){
                                    cross.animate(fadeIn);
                                }
                            }
                            else{
                                if (username.value != ''){
                                    check.animate(fadeIn);
                                }
                            }
                        };

                        var url = SERVER_URL + '/api/check_username_availability/';
                        xhr.open('POST', url);
                        xhr.send({
                            'username': username.value
                        });
                    }, 1000);
                }
                else{
                    cross.animate(fadeIn);
                }
            }
            else{
                cross.opacity = 0;
                check.opacity = 0;
                username_activity.opacity = 0;
                go_shown = false;
                create_go.animate({
                    curve: Ti.UI.ANIMATION_CURVE_EASE_IN,
                    opacity: 0,
                    duration: 200,
                    complete: function(){
                        create_go.hide();
                    }
                });
            }
        });

    	create_go.addEventListener('click', function(){
    	    username.fireEvent('return');
    	});
    }
    
    username_activity = Titanium.UI.createActivityIndicator({
        height:50,
        width:10,
        right: 25,
        top: 57,
        zIndex: 2,
        opacity: 0,
        style: Titanium.UI.iPhone.ActivityIndicatorStyle.DARK
    });
    username_activity.show();
    create_account_win.add(username_activity);
    
    var cross = Ti.UI.createImageView({
		image: 'images/cross.png',
        right: 20,
        top: 70,
		width: 23,
		height: 23,
		hires: true,
		zIndex: 3,
		opacity: 0,
	});
	create_account_win.add(cross);
	
	var check = Ti.UI.createImageView({
		image: 'images/check.png',
        right: 20,
        top: 69,
		width: 23,
		height: 23,
		hires: true,
		zIndex: 3,
		opacity: 0,
	});
	create_account_win.add(check);
    
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
    
	create_account_win.add(create_go);
	
	if (typeof(logout) != 'undefined' && logout){
	    fb_button = Titanium.Facebook.createLoginButton({
            'style':'wide',
            bottom: 30
        });
        create_account_win.add(fb_button);
	}
    
    if (no_tabgroup){
        landing_tabgroup.open();
    }
    else{
        landing_tab.open(create_account_win,{animated:true});
    }
}

function add_detail_view(e){
    var w = Ti.UI.createWindow({backgroundColor:"#222", url:'main_windows/nom/detail.js'});
    // landing_tab.open(w,{animated:true});
    landing_tab.open(w,{animated:true});
    
    setTimeout(function(){
        Ti.App.fireEvent('pass_detail', {
                nom_id: e.source.nom_id,
                photo: e.source.photo,
                state: e.source.state,
                cat: e.source.cat,
                user: e.source.user,
                won: false,
                from_landing: true
            });
    }, 200);
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
    		hires: true,
    		zIndex: 1
    	});
    	image_thumb.user = data[i].nominatee_username;
    	image_thumb.nom_id = data[i].id;
    	image_thumb.photo = data[i].photo;
    	image_thumb.state = 'community_top';
    	image_thumb.cat = data[i].nomination_category;
    	
    	image_thumb.addEventListener('click', add_detail_view);
    	
    	img_cont.add(image_thumb);
        photo_in_row += 1;
    }
    photo_cont.setData(photo_data);
}

var scroll_width = (76 * 10);
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
var landing_tab = null;
var landing_tabgroup = null;
function init_login(){
    Ti.App.Properties.setString("me", JSON.stringify({
        'name': '',
        'access_token': '',
        'username': ''
    }));
    
    landing_tabgroup = Titanium.UI.createTabGroup({id:'landing_tabgroup'});
    
    landing_win = Titanium.UI.createWindow({
        backgroundImage: 'images/background.png',
        width: 320
    });
    if (Ti.Platform.osname != 'android'){
        landing_win.hideNavBar({animated:false});
    }
    
    landing_tab = Titanium.UI.createTab({
        window: landing_win
    });
    
    landing_tab.add(landing_win);
    landing_tabgroup.addTab(landing_tab);
    landing_tabgroup.bottom = -50;
    
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
        // allowsSelection: false,
        separatorStyle: 0,
        height: 240,
        top: 40,
        width: 320,
        style: Titanium.UI.iPhone.TableViewStyle.PLAIN
    });
    landing_win.add(photo_cont);
    
    photo_cont.addEventListener('click', function(){ });
    
    var drop_shadow = Titanium.UI.createView({
        backgroundImage: 'images/upper_drop_shadow.png',
        height: 2,
        width: 320,
        top: 278,
        zIndex: 10
    });
    landing_win.add(drop_shadow);
    
    var welcome_cont = Titanium.UI.createView({
        height: 280,
        width: 250,
        top: 80,
        zIndex: 11
    });
    
    var welcome_cont_background = Titanium.UI.createView({
        backgroundColor: '#000',
        borderRadius: 5,
        height: 280,
        width: 250,
        zIndex: -1,
        opacity: 0.9
    });
    welcome_cont.add(welcome_cont_background);
    
    var welcome_top_label = Ti.UI.createLabel({
        text: 'Welcome to Portrit',
        width: 250,
        height: 'auto',
        color:'#eee',
        textAlign:'center',
        top: 10,
        font:{fontSize:18,fontWeight:'bold'}
    });
    welcome_cont.add(welcome_top_label);
    
    var welcome_top_text = Ti.UI.createLabel({
        text: 'It\'s all about finding and sharing the best photos out there.',
        width: 230,
        height: 'auto',
        color:'#eee',
        textAlign:'left',
        left: 10,
        right: 10,
        top: 50,
        font:{fontSize:16}
    });
    welcome_cont.add(welcome_top_text);
    
    var welcome_bottom_text = Ti.UI.createLabel({
        text: 'Get started by tapping the Login with Facebook button below.',
        width: 230,
        height: 'auto',
        color: '#eee',
        textAlign:'left',
        left: 10,
        right: 10,
        top: 105,
        font:{fontSize:16}
    });
    welcome_cont.add(welcome_bottom_text);
    
    var web_link_text = Ti.UI.createLabel({
        text: 'Dont forget our Web App at portrit.com',
        width: 230,
        height: 'auto',
        color: '#eee',
        textAlign:'center',
        top: 180,
        font:{fontSize:13}
    });
    welcome_cont.add(web_link_text);
    
    welcome_go_button = Titanium.UI.createButton({
	    backgroundImage: 'images/welcome_go_button.png',
		title: 'Ok',
		font: {fontSize: 20, fontWeight: 'bold'},
		height: 41,
		width: 112,
        bottom: 10
	});
	welcome_cont.add(welcome_go_button);
	
	welcome_go_button.addEventListener('click', function(){
	    welcome_cont.animate({
	        curve: Ti.UI.ANIMATION_CURVE_EASE_OUT,
            opacity: 0,
            duration: 300,
            complete: function(){
                landing_win.remove(welcome_cont);
            }
	    })
	});
    
    landing_win.add(welcome_cont);
    
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
    
    
    landing_tabgroup.open();
    // setTimeout(function(){
    //     init_new_user();
    // }, 400);
}

Titanium.Facebook.addEventListener('login', function(e) {
    // Titanium.Facebook.removeEventListener('login');
	if (e.success) {
	    me = {
	        'name': e.data.name,
	        'fid': e.data.id
	    };
	    me.access_token = Titanium.Facebook.accessToken;
        Ti.App.Properties.setString("me", JSON.stringify(me));
        
        window_activity = Titanium.UI.createActivityIndicator({
            message: 'Signing In',
            font:{fontSize:16, fontWeight:'bold'},
            color: '#fff',
            height:50,
            width:10,
            style: Titanium.UI.iPhone.ActivityIndicatorStyle.BIG
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
        window_activity_cont.add(window_activity_background);
        window_activity_cont.add(window_activity);
        landing_win.add(window_activity_cont);
        
        var xhr = Titanium.Network.createHTTPClient();
        xhr.onload = function(){
            window_activity_cont.hide();
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
                // landing_win.animate(window_slide_out);
                landing_tabgroup.close(window_slide_out);
                load_portrit(true);
            }
        };

        var url = SERVER_URL + '/api/login/';
        xhr.open('POST', url);
        xhr.send({
            'fb_user': me.fid,
            'access_token': me.access_token
        });
	}
	if (e.error) {
		alert(e.error);
    }
});

if (!Titanium.Facebook.loggedIn){
    init_login();
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


Ti.App.addEventListener('load_portrit', function(e){
    load_portrit(true);
});

Ti.App.addEventListener('init_new_user', function(e){
    init_new_user();
});

var reset_app = false;
Ti.App.addEventListener('logout', function(e){
    reset_app = true;
    tabGroup.close(window_slide_out);
    init_login();
});