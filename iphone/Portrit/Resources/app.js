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

// Camera 
function add_nominate_window(animate){
    nominate_window = Titanium.UI.createWindow({
        backgroundColor:"#000", 
        url:'main_windows/nom/nominate.js',
        left: 320,
        width: 320
    });
    // nominate_window.left = 320;
    if (typeof(animate) != 'undefined' && animate){
        camera_overlay.animate(window_slide_out);
        nominate_window.open(window_slide_in);
    }
    else{
        nominate_window.open();
    }
}

function pass_nominate_data(e){
    // setTimeout(function(){
	    Ti.App.fireEvent('pass_photo_data', {
            user: me.fid,
            name: me.name,
            username: me.username,
            photo: e.photo,
            new_photo: e.new_photo
        });
    // }, 200);
}

var camera_overlay = Titanium.UI.createView({
    height: 480,
    width: 320,
    left: 0
});

var camera_overlay_top_bar = Titanium.UI.createView({
    backgroundColor: '#000',
    height: 60,
    width: 320,
    top: 0
});

var camera_overlay_bottom_bar_background = Titanium.UI.createView({
    backgroundColor: '#000',
    height: 80,
    width: 320,
    bottom: 0
});

var camera_overlay_bottom_bar = Titanium.UI.createView({
    height: 300,
    width: 320,
    bottom: 0
});
camera_overlay_bottom_bar.add(camera_overlay_bottom_bar_background);
camera_overlay.add(camera_overlay_top_bar);
camera_overlay.add(camera_overlay_bottom_bar);


var close_camera = Ti.UI.createButton({
	backgroundImage: 'images/camera_buttons/close_button.png',
	width: 42,
	height: 42,
    top: 9,
    right: 9
});
camera_overlay_top_bar.add(close_camera);

close_camera.addEventListener('click', function(e){
    Titanium.Media.hideCamera();
    reset_after_camera(true);
});

var take_photo = Ti.UI.createButton({
	backgroundImage: 'images/camera_buttons/snap_button.png',
	backgroundSelectedImage: 'images/camera_buttons/snap_button_click.png',
	width: 70,
	height: 70,
    bottom: 5,
    left: 125
});
camera_overlay_bottom_bar.add(take_photo);

var photo_gallery = Ti.UI.createButton({
	backgroundImage: 'images/camera_buttons/gallery.png',
	width: 42,
	height: 42,
    bottom: 16,
    left: 16
});
camera_overlay_bottom_bar.add(photo_gallery);

photo_gallery.addEventListener('click', function(e){
    Titanium.UI.iPhone.showStatusBar({animated:false});
    Titanium.Media.hideCamera();
    Titanium.Media.openPhotoGallery({
        success: photo_gallery_click,
        cancel: photo_gallery_cancel,
        mediaTypes: Ti.Media.MEDIA_TYPE_PHOTO
    });
    
    add_nominate_window();
});

function photo_gallery_cancel(e){
    Titanium.UI.iPhone.hideStatusBar({animated:false});
    nominate_window.hide();
    setTimeout(function(){
        show_camera();
    }, 350);
}

function photo_gallery_click(e){
    take_photo_click = true;
    camera_overlay.animate(window_slide_out);
    nominate_window.animate(window_slide_in);
    cammera_success(e, true);
}

function show_camera(){
    Titanium.Media.showCamera({
        success: cammera_success,
        cancel: camera_cancel,
        error: camera_error,
        animated: false,
        autohide: false,
        showControls: false,
        // saveToPhotoGallery: true,
        mediaTypes: Ti.Media.MEDIA_TYPE_PHOTO,
        overlay: camera_overlay
    });
    
    if (flash_selected_button.button == 'on'){
        Ti.Media.cameraFlashMode = Ti.Media.CAMERA_FLASH_ON;
    }
    else if (flash_selected_button.button == 'off'){
        Ti.Media.cameraFlashMode = Ti.Media.CAMERA_FLASH_OFF;
    }
    else if (flash_selected_button.button == 'auto'){
        Ti.Media.cameraFlashMode = Ti.Media.CAMERA_FLASH_AUTO;
    }
    
    if (cam_selected == 'back'){            
        Ti.Media.switchCamera(Ti.Media.CAMERA_FRONT);
    }
    else if (cam_selected == 'front'){
        Ti.Media.switchCamera(Ti.Media.CAMERA_REAR);
    }
}

var cam_selected = 'back';
var cam_selected_button = Ti.UI.createButton({
	backgroundImage: 'images/camera_buttons/cam_back.png',
	width: 42,
	height: 42,
    bottom: 16,
    right: 68,
    zIndex: 10
});
cam_selected_button.button = 'back';
camera_overlay_bottom_bar.add(cam_selected_button);

var cam_hidden_button = Ti.UI.createButton({
	backgroundImage: 'images/camera_buttons/cam_front.png',
	width: 42,
	height: 42,
    bottom: 16,
    right: 68,
    zIndex: 9,
    opacity: 0
});
cam_hidden_button.button = 'front';
camera_overlay_bottom_bar.add(cam_hidden_button);

cam_hidden_button.addEventListener('click', function(e){
    var selected = e.source.button;
    animate_cam_button(selected);
});


cam_selected_button.addEventListener('click', function(e){
    // var selected = e.source.button;
    animate_cam_button();
});

var cam_select_open = false;
function animate_cam_button(selected){
    if (cam_select_open){
        cam_hidden_button.animate({
            curve: Ti.UI.ANIMATION_CURVE_EASE_IN,
            bottom: 16,
            opacity: 0,
            duration: 250
        });
        cam_select_open = false;
    }
    else{
        cam_hidden_button.animate({
            curve: Ti.UI.ANIMATION_CURVE_EASE_OUT,
            bottom: 68,
            opacity: 1.0,
            duration: 250
        });
        cam_select_open = true;
    }
    
    if (typeof(selected) != 'undefined' && cam_selected != selected){
        cam_selected = selected;
        if (selected == 'back'){
            cam_selected_button.backgroundImage = 'images/camera_buttons/cam_back.png';
            cam_hidden_button.backgroundImage = 'images/camera_buttons/cam_front.png';
            cam_hidden_button.button = 'front';
            
            Ti.Media.switchCamera(Ti.Media.CAMERA_FRONT);
        }
        else if (selected == 'front'){
            cam_selected_button.backgroundImage = 'images/camera_buttons/cam_front.png';
            cam_hidden_button.backgroundImage = 'images/camera_buttons/cam_back.png';
            cam_hidden_button.button = 'back';
            
            Ti.Media.switchCamera(Ti.Media.CAMERA_REAR);
        }
    }
}

var flash_selected_button = Ti.UI.createButton({
	backgroundImage: 'images/camera_buttons/flash_auto.png',
	width: 42,
	height: 42,
    bottom: 16,
    right: 13,
    zIndex: 10
});
flash_selected_button.button = 'auto'
camera_overlay_bottom_bar.add(flash_selected_button);

flash_selected_button.addEventListener('click', function(e){
    animate_flash_button();
});

var flash_middle_button = Ti.UI.createButton({
	backgroundImage: 'images/camera_buttons/flash_off.png',
	width: 42,
	height: 42,
    bottom: 16,
    right: 13,
    zIndex: 9,
    opacity: 0
});
flash_middle_button.button = 'off';
camera_overlay_bottom_bar.add(flash_middle_button);

flash_middle_button.addEventListener('click', function(e){
    var selected = e.source;
    animate_flash_button(selected);
});

var flash_top_button = Ti.UI.createButton({
	backgroundImage: 'images/camera_buttons/flash_on.png',
	width: 42,
	height: 42,
    bottom: 16,
    right: 13,
    zIndex: 9,
    opacity: 0
});
flash_top_button.button = 'on';
camera_overlay_bottom_bar.add(flash_top_button);

flash_top_button.addEventListener('click', function(e){
    var selected = e.source;
    animate_flash_button(selected);
});

var flash_select_open = false;
function animate_flash_button(selected){
    if (flash_select_open){
        flash_middle_button.animate({
            curve: Ti.UI.ANIMATION_CURVE_EASE_IN,
            bottom: 16,
            opacity: 0,
            duration: 250
        });
        flash_top_button.animate({
            curve: Ti.UI.ANIMATION_CURVE_EASE_IN,
            bottom: 16,
            opacity: 0,
            duration: 250
        });
        flash_select_open = false;
    }
    else{
        flash_middle_button.animate({
            curve: Ti.UI.ANIMATION_CURVE_EASE_OUT,
            bottom: 68,
            opacity: 1.0,
            duration: 250
        });
        flash_top_button.animate({
            curve: Ti.UI.ANIMATION_CURVE_EASE_IN,
            bottom: 122,
            opacity: 1.0,
            duration: 250
        });
        flash_select_open = true;
    }
    
    if (typeof(selected) != 'undefined' && flash_selected_button.button != selected.button){
        var selected_img = flash_selected_button.backgroundImage;
        var selected_button = flash_selected_button.button;
        flash_selected_button.backgroundImage = selected.backgroundImage;
        flash_selected_button.button = selected.button;
        selected.backgroundImage = selected_img;
        selected.button = selected_button;
        
        if (flash_selected_button.button == 'on'){
            Ti.Media.cameraFlashMode = Ti.Media.CAMERA_FLASH_ON;
        }
        else if (flash_selected_button.button == 'off'){
            Ti.Media.cameraFlashMode = Ti.Media.CAMERA_FLASH_OFF;
        }
        else if (flash_selected_button.button == 'auto'){
            Ti.Media.cameraFlashMode = Ti.Media.CAMERA_FLASH_AUTO;
        }
    }
}

var selected_tab_index = 0;
var prev_tab_index = 0;
tabGroup.addEventListener('focus', function(e){
    selected_tab_index = e.index;
    prev_tab_index = e.previousIndex;
});

var camera_listeners_attached = false;
var take_photo_click = false;

win3.addEventListener('focus', function(){
    tabGroup.bottom = -50;
    tabGroup.tabBarVisible = false;
    
    cam_selected = 'back';
    cam_selected_button.button = 'back';
    cam_hidden_button.button = 'front';
    cam_selected_button.backgroundImage = 'images/camera_buttons/cam_back.png';
    cam_hidden_button.backgroundImage = 'images/camera_buttons/cam_front.png';
    
    flash_selected_button.backgroundImage = 'images/camera_buttons/flash_auto.png';
    flash_selected_button.button = 'auto';
    flash_middle_button.backgroundImage = 'images/camera_buttons/flash_off.png';
    flash_middle_button.button = 'off';
    flash_top_button.backgroundImage = 'images/camera_buttons/flash_on.png';
    flash_top_button.button = 'on';
    
    // if (!camera_listeners_attached){
    //     camera_listeners_attached = true;
    //     // camera_overlay.zIndex = 10;
    //     // take_photo.bottom = 50;
    //     win3.add(camera_overlay);
    //     take_photo.addEventListener('click', function(e){
    //         var data = {
    //             'photo': {
    //                 'width': 640,
    //                 'height': 960
    //             },
    //             'new_photo': true
    //         };
    //     
    //         // Titanium.Media.hideCamera();
    //         add_nominate_window(true);
    //         camera_overlay.animate(window_slide_out);
    //         nominate_window.animate(window_slide_in);
    //     });
    // }
    
    Titanium.Media.showCamera({
        success: cammera_success,
        cancel: camera_cancel,
        error: camera_error,
        animated: false,
        autohide: false,
        showControls: false,
        // saveToPhotoGallery: true,
        mediaTypes: Ti.Media.MEDIA_TYPE_PHOTO,
        overlay: camera_overlay
        // allowEditing:true
    });
    
    if (!camera_listeners_attached){
        camera_listeners_attached = true;
        
        take_photo.addEventListener('click', function(e){
            if (!take_photo_click){
                take_photo_click = true;
                Ti.App.fireEvent('clear_nom_photo', {});
                add_nominate_window(true);
                Ti.Media.takePicture();
                // camera_overlay.animate(window_slide_out);
                // nominate_window.animate(window_slide_in);
            }
        });
    }
});

function cammera_success(event, gallery){
    if (typeof(gallery) == 'undefined'){
        Titanium.Media.hideCamera();
    }
    
    var image = event.media;
    var imageView = Titanium.UI.createImageView({
            image:image,
            width:640,
            height:960
        });
    image = imageView.toImage().imageAsCropped({width:640,height:640,x:0,y:200});

    var f = Titanium.Filesystem.getFile(Titanium.Filesystem.applicationDataDirectory, 'temp.png');
    f.write(image);
    
    var data = {
        'photo': {
            'width': 640,
            'height': 640
        },
        'new_photo': true
    };
    
    pass_nominate_data(data);
    // image.imageAsCropped({width:480,height:480,x:0,y:80});
    
    Ti.App.Properties.setString("upload_complete", null);
    Ti.App.Properties.setString("upload_progress", 0);
    me = JSON.parse(Ti.App.Properties.getString("me"));
    var xhr = Titanium.Network.createHTTPClient();
    xhr.onload = function(){
        var data = JSON.parse(this.responseData);
        var id = data.id;
        Ti.App.Properties.setString("upload_complete", id);
    };
    xhr.onerror = function(e){
        alert(t);
    };
    xhr.onsendstream = function(e){
        Ti.App.Properties.setString("upload_progress", e.progress);
    };
    var url = SERVER_URL + '/upload_photo/'
    xhr.open('POST', url);
    xhr.send({
        'file': image,
        'iphone': true,
        'access_token': me.access_token
    });
    // reset_after_camera();
    // Ti.App.fireEvent('update_active_noms', {});
}

function camera_cancel(){
    reset_after_camera();
    Ti.App.fireEvent('close_nominate_page', { });
}

function camera_error(error){
    var a = Titanium.UI.createAlertDialog({title:'Camera'});

    if (error.code == Titanium.Media.NO_CAMERA){
        a.setMessage('Device does not have video recording capabilities');
    }
    else{
        a.setMessage('Unexpected error: ' + error.code);
    }
    
    a.show();
    reset_after_camera();
}

Ti.App.addEventListener('cancel_nominate', function(e){
    camera_overlay.animate(window_slide_back);
    take_photo_click = false;

    nominate_window.hide();
    
    setTimeout(function(){
        Titanium.Media.showCamera({
            success: cammera_success,
            cancel: camera_cancel,
            error: camera_error,
            animated: false,
            autohide: false,
            showControls: false,
            // saveToPhotoGallery: true,
            mediaTypes: Ti.Media.MEDIA_TYPE_PHOTO,
            overlay: camera_overlay
            // allowEditing:true
        });
        
        if (flash_selected_button.button == 'on'){
            Ti.Media.cameraFlashMode = Ti.Media.CAMERA_FLASH_ON;
        }
        else if (flash_selected_button.button == 'off'){
            Ti.Media.cameraFlashMode = Ti.Media.CAMERA_FLASH_OFF;
        }
        else if (flash_selected_button.button == 'auto'){
            Ti.Media.cameraFlashMode = Ti.Media.CAMERA_FLASH_AUTO;
        }
        
        if (cam_selected == 'back'){            
            Ti.Media.switchCamera(Ti.Media.CAMERA_FRONT);
        }
        else if (cam_selected == 'front'){
            Ti.Media.switchCamera(Ti.Media.CAMERA_REAR);
        }
        
    }, 300);
});

Ti.App.addEventListener('reset_after_camera', function(e){
    nominate_window.hide();
    
    take_photo_click = false;
    tabGroup.bottom = 0;
    tabGroup.tabBarVisible = true;
    tabGroup.setActiveTab(0);
});

Ti.App.addEventListener('reset_after_camera_to_profile', function(e){
    nominate_window.hide();
    
    take_photo_click = false;
    tabGroup.bottom = 0;
    tabGroup.tabBarVisible = true;
    tabGroup.setActiveTab(4);
});

function reset_after_camera(prev){
    Titanium.UI.iPhone.showStatusBar({animated:false});
    take_photo_click = false;
    tabGroup.bottom = 0;
    tabGroup.tabBarVisible = true;
    if (typeof(prev) != 'undefined'){
        tabGroup.setActiveTab(prev_tab_index);
    }
    else{
        tabGroup.setActiveTab(0);
    }
    
    Titanium.UI.iPhone.showStatusBar({animated:false});
}

function load_portrit(animate){
    me = JSON.parse(Ti.App.Properties.getString("me"));
    me.fid = Titanium.Facebook.uid;
    me.access_token = Titanium.Facebook.accessToken;
        
    register_push_notifications(me.fid);
    Titanium.UI.iPhone.appBadge = 0;
    
    if (animate){
        tabGroup.left = 320;
        tabGroup.open(window_slide_in);
    }
    else{
        tabGroup.open();
    }
    
    // var node_sock = Titanium.Network.createTCPSocket({
    //                 hostName: NODE_SERVER,
    //                 port: NODE_PORT,
    //                 mode: Titanium.Network.READ_WRITE_MODE
    //         });
    // 
    // node_sock.connect();
    // 
    // node_sock.addEventListener('read', function(e){
    //     alert(toString(e.data));
    // });
    // 
    // node_sock.addEventListener('readError', function(e){
    //     alert ('read error on websocket');
    // });
    // 
    // node_sock.addEventListener('writeError', function(e){
    //     alert ('read error on websocket');
    // });
    // 
    // setTimeout(function(){
    //     var data = me.fid;
    //     node_sock.write(data);
    // }, 500);
        
    // Node.js updates
    // var xhr = Titanium.Network.createHTTPClient();
    // var url = SERVER_URL + '/watch_update/?user=' + me.fid;
    // 
    // xhr.setTimeout(30000);
    // 
    // xhr.onload = function(){
    //  var data = JSON.parse(this.responseData);
    //  alert(data);
    //  
    //  xhr.open('GET', url);
    // 
    //     // send the data
    //     xhr.send();
    // };
    // 
    // xhr.onerror = function(){
    //     setTimeout(function(){
    //         xhr.open('GET', url);
    // 
    //         // send the data
    //         xhr.send();
    //     }, 5000);
    // }
    // 
    // xhr.open('GET', url);
    // 
    // // send the data
    // xhr.send();
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
                    var me = {
                        'username': username.value
                    };
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
    landing_win.animate(window_slide_out);
    create_account_win.open(window_slide_in);
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
        register_push_notifications(me.fid);
        Titanium.UI.iPhone.appBadge = 0;
        
        var date_resumed = new Date().getTime();
	    var date_paused = Ti.App.Properties.getString('time_paused');
	    
        if (date_resumed - date_paused >= (1000 * 60 * 5)){
            Ti.App.fireEvent('reset', { });
        }
	});

	Ti.App.addEventListener('pause',function(e){
	    var datetime_paused = new Date().getTime();
	    Ti.App.Properties.setString("time_paused", datetime_paused);
	});
}