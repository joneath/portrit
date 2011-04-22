Ti.include('../settings.js');
Ti.include('../includes.js');

var me = JSON.parse(Ti.App.Properties.getString("me"));
var win = Ti.UI.currentWindow;
var tabGroup = win.tabGroup;
    
win.hideNavBar({animated:false});

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

// Camera 
function add_nominate_window(animate){
    Ti.App.fireEvent('close_nom_share', {});
    setTimeout(function(){
        nominate_window = Titanium.UI.createWindow({
            backgroundColor:"#000", 
            url:'nom/nominate.js',
            left: 320,
            width: 320
        });
        if (typeof(animate) != 'undefined' && animate){
            nominate_window.open(window_slide_in);
        }
        else{
            nominate_window.open();
        }
    }, 300);
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

var top_shutter = Titanium.UI.createView({
    backgroundColor: '#000',
    height: 240,
    width: 320,
    top: -240
});

var bottom_shutter = Titanium.UI.createView({
    backgroundColor: '#000',
    height: 240,
    width: 320,
    bottom: -240
});

camera_overlay.add(top_shutter);
camera_overlay.add(bottom_shutter);

function animate_shutter(){
    top_shutter.animate({
        curve: Ti.UI.ANIMATION_CURVE_EASE_OUT,
        top: 0,
        duration: 200
    });
    
    bottom_shutter.animate({
        curve: Ti.UI.ANIMATION_CURVE_EASE_OUT,
        bottom: 0,
        duration: 200
    });
}

function reset_shutter(){
    top_shutter.top = -240;
    bottom_shutter.bottom = -240;
}

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
	backgroundImage: '../images/camera_buttons/close_button.png',
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
	backgroundImage: '../images/camera_buttons/snap_button.png',
	backgroundSelectedImage: '../images/camera_buttons/snap_button_click.png',
	width: 70,
	height: 70,
    bottom: 5,
    left: 125
});
camera_overlay_bottom_bar.add(take_photo);

var photo_gallery = Ti.UI.createButton({
	backgroundImage: '../images/camera_buttons/gallery.png',
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
	backgroundImage: '../images/camera_buttons/cam_back.png',
	width: 42,
	height: 42,
    bottom: 16,
    right: 68,
    zIndex: 10
});
cam_selected_button.button = 'back';
camera_overlay_bottom_bar.add(cam_selected_button);

var cam_hidden_button = Ti.UI.createButton({
	backgroundImage: '../images/camera_buttons/cam_front.png',
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
            cam_selected_button.backgroundImage = '../images/camera_buttons/cam_back.png';
            cam_hidden_button.backgroundImage = '../images/camera_buttons/cam_front.png';
            cam_hidden_button.button = 'front';
            
            Ti.Media.switchCamera(Ti.Media.CAMERA_FRONT);
        }
        else if (selected == 'front'){
            cam_selected_button.backgroundImage = '../images/camera_buttons/cam_front.png';
            cam_hidden_button.backgroundImage = '../images/camera_buttons/cam_back.png';
            cam_hidden_button.button = 'back';
            
            Ti.Media.switchCamera(Ti.Media.CAMERA_REAR);
        }
    }
}

var flash_selected_button = Ti.UI.createButton({
	backgroundImage: '../images/camera_buttons/flash_auto.png',
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
	backgroundImage: '../images/camera_buttons/flash_off.png',
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
	backgroundImage: '../images/camera_buttons/flash_on.png',
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

var camera_listeners_attached = false;
var take_photo_click = false;

win.addEventListener('focus', function(){
    reset_shutter();
    tabGroup.bottom = -50;
    
    cam_selected = 'back';
    cam_selected_button.button = 'back';
    cam_hidden_button.button = 'front';
    cam_selected_button.backgroundImage = '../images/camera_buttons/cam_back.png';
    cam_hidden_button.backgroundImage = '../images/camera_buttons/cam_front.png';
    
    flash_selected_button.backgroundImage = '../images/camera_buttons/flash_auto.png';
    flash_selected_button.button = 'auto';
    flash_middle_button.backgroundImage = '../images/camera_buttons/flash_off.png';
    flash_middle_button.button = 'off';
    flash_top_button.backgroundImage = '../images/camera_buttons/flash_on.png';
    flash_top_button.button = 'on';
    
    // if (!camera_listeners_attached){
    //     camera_listeners_attached = true;
    //     win.add(camera_overlay);
    //     take_photo.addEventListener('click', function(e){
    //         var data = {
    //             'photo': {
    //                 'width': 640,
    //                 'height': 960
    //             },
    //             'new_photo': true
    //         };
    //         animate_shutter();
    //         // add_nominate_window(true);
    //     });
    // }
    
    Titanium.Media.showCamera({
        success: cammera_success,
        cancel: camera_cancel,
        error: camera_error,
        animated: false,
        autohide: false,
        showControls: false,
        mediaTypes: Ti.Media.MEDIA_TYPE_PHOTO,
        overlay: camera_overlay
    });
    
    if (!camera_listeners_attached){
        camera_listeners_attached = true;
        
        take_photo.addEventListener('click', function(e){
            if (!take_photo_click){
                take_photo_click = true;
                animate_shutter();
                Ti.Media.takePicture();
                add_nominate_window(true);
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
    
    Ti.App.Properties.setString("upload_complete", null);
    Ti.App.Properties.setString("upload_progress", 0);
    
    me = JSON.parse(Ti.App.Properties.getString("me"));
    var xhr = Titanium.Network.createHTTPClient();
    xhr.setRequestHeader("enctype", "multipart/form-data");
    xhr.setRequestHeader("Content-Type", "image/png");
    xhr.timeout = 20000;
    
    xhr.onload = function(){
        try{
            var data = JSON.parse(this.responseData);
            var id = data.id;
            Ti.App.Properties.setString("upload_complete", id);
        }
        catch(e){
            alert(e);
        }
    };
    xhr.onerror = function(e){
        alert("Error: " + e.error);
		alert("Error: " + e.error + "; (Http status " + this.status + ")");
    };
    xhr.onsendstream = function(e){
        try{
            Ti.App.Properties.setString("upload_progress", e.progress);
        }
        catch(e){
            alert(e);
        }
    };
    
    var url = SERVER_URL + '/upload_photo/'
    xhr.open('POST', url);
    xhr.send({
        'file': image,
        'iphone': true,
        'access_token': me.access_token
    });
    
    var data = {
        'photo': {
            'width': 640,
            'height': 640
        },
        'new_photo': true
    };
    
    pass_nominate_data(data);
}

function camera_cancel(){
    reset_after_camera(true);
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
    take_photo_click = false;
    reset_shutter();
    
    setTimeout(function(){
        Titanium.Media.showCamera({
            success: cammera_success,
            cancel: camera_cancel,
            error: camera_error,
            animated: false,
            autohide: false,
            showControls: false,
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
    }, 300);
});

Ti.App.addEventListener('reset_after_camera', function(e){
    take_photo_click = false;
    tabGroup.bottom = 0;
    tabGroup.setActiveTab(0);
    // tabGroup.close();
    // 
    // setTimeout(function(){
    //     tabGroup.open();
    // }, 300);

});

Ti.App.addEventListener('reset_after_camera_to_profile', function(e){
    take_photo_click = false;
    tabGroup.bottom = 0;
    tabGroup.setActiveTab(4);
    // tabGroup.close();
    // 
    // setTimeout(function(){
    //     tabGroup.open();
    // }, 300);
    // nominate_window.hide();
    // 
    // take_photo_click = false;
    // tabGroup.bottom = 0;
    // tabGroup.setActiveTab(4);
});

function reset_after_camera(prev){
    Titanium.UI.iPhone.showStatusBar({animated:false});
    take_photo_click = false;
    tabGroup.bottom = 0;
    if (typeof(prev) != 'undefined'){
        var prev_tab_index = parseInt(Ti.App.Properties.getString("selected_tab_index"));
        
        tabGroup.setActiveTab(prev_tab_index);
    }
    else{
        tabGroup.setActiveTab(0);
    }
    
    Titanium.UI.iPhone.showStatusBar({animated:false});
}