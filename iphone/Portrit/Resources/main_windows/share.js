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

window_activity = Titanium.UI.createActivityIndicator({
    message: 'Preparing Camera...',
    font: {fontSize: 16, fontWeight: 'bold'},
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
// window_activity_cont.hide();
window_activity_cont.add(window_activity_background);
window_activity_cont.add(window_activity);
win.add(window_activity_cont);

saving_activity = Titanium.UI.createActivityIndicator({
    message: 'Saving photo...',
    font: {fontSize: 16, fontWeight: 'bold'},
    color: '#fff',
    height:50,
    width:10,
    top: 150
});
saving_activity.show()

saving_activity_background = Titanium.UI.createView({
    backgroundColor: '#000',
    borderRadius: 5,
    opacity: 0.6,
    height: 480,
    width: 320,
    zIndex: -1
});

saving_activity_cont = Titanium.UI.createView({
    width: 320,
    height: 480,
    zIndex: 20,
    opacity: 0
});
saving_activity_cont.hide();
saving_activity_cont.add(saving_activity_background);
saving_activity_cont.add(saving_activity);

preparing_activity = Titanium.UI.createActivityIndicator({
    message: 'Preparing photo...',
    font: {fontSize: 16, fontWeight: 'bold'},
    color: '#fff',
    height:50,
    width:10,
    top: 150
});
preparing_activity.show()

preparing_activity_background = Titanium.UI.createView({
    backgroundColor: '#000',
    borderRadius: 5,
    opacity: 0.6,
    height: 480,
    width: 320,
    zIndex: -1
});

preparing_activity_cont = Titanium.UI.createView({
    width: 320,
    height: 480,
    zIndex: 20
});
preparing_activity_cont.hide();
preparing_activity_cont.add(preparing_activity_background);
preparing_activity_cont.add(preparing_activity);
win.add(preparing_activity_cont);

// Camera 
var nominate_window = null;
function add_nominate_window(animate){
    if (typeof(animate) != 'undefined' && animate){
        Ti.App.fireEvent('close_nom_share', {});
    }
    
    nominate_window = Titanium.UI.createWindow({
        backgroundColor:"#000", 
        url:'nom/nominate.js',
        left: 320,
        width: 320
    });
    
    if (typeof(animate) != 'undefined' && animate){
        setTimeout(function(){
            nominate_window.open(window_slide_in);
        }, 200);
    }
    else{
        nominate_window.open();
    }
}

function pass_nominate_data(e){
    setTimeout(function(){
        Ti.App.fireEvent('pass_photo_data', {
            user: me.fid,
            name: me.name,
            username: me.username,
            photo: e.photo,
            new_photo: e.new_photo
        });
    }, 200);
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
camera_overlay.add(saving_activity_cont);

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
    height: 100,
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
    bottom: 15,
    left: 125
});
camera_overlay_bottom_bar.add(take_photo);

take_photo.addEventListener('click', function(e){
    if (!take_photo_click){
        take_photo_click = true;
        // add_nominate_window(true);
        animate_shutter();
        Ti.Media.takePicture();
        setTimeout(function(){
            saving_activity_cont.show();
            saving_activity_cont.animate({
                opacity: 1.0,
                curve: Ti.UI.ANIMATION_CURVE_EASE_IN,
                duration: 300
            });
        }, 200);
    }
});

var photo_gallery = Ti.UI.createButton({
	backgroundImage: '../images/camera_buttons/gallery.png',
	width: 42,
	height: 42,
    bottom: 26,
    left: 16
});
camera_overlay_bottom_bar.add(photo_gallery);

photo_gallery.addEventListener('click', function(e){
    Titanium.Media.hideCamera();
    Titanium.UI.iPhone.showStatusBar({animated:false});

    // add_nominate_window();
    Titanium.Media.openPhotoGallery({
        success: photo_gallery_click,
        cancel: photo_gallery_cancel,
        mediaTypes: Ti.Media.MEDIA_TYPE_PHOTO
    });
    setTimeout(function(){
        preparing_activity_cont.show();
    }, 700);
});

function photo_gallery_cancel(e){
    preparing_activity_cont.hide();
    Titanium.UI.iPhone.hideStatusBar({animated:false});
    setTimeout(function(){
        show_camera();
    }, 350);
}

function photo_gallery_click(e){
    take_photo_click = true;
    preparing_activity_cont.show();
    cammera_success(e, true);
}

var cameraTransform = Ti.UI.create2DMatrix();
cameraTransform = cameraTransform.scale(1);
function show_camera(){
    preparing_activity_cont.hide();
    saving_activity_cont.hide();
    saving_activity_cont.opacity = 0;
    Titanium.Media.showCamera({
        success: cammera_success,
        cancel: camera_cancel,
        error: camera_error,
        animated: false,
        autohide: false,
        showControls: false,
        mediaTypes: Ti.Media.MEDIA_TYPE_PHOTO,
        overlay: camera_overlay,
        transform:cameraTransform
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
    
    setTimeout(function(){
        camera_overlay.show();
    }, 1100);
}

var cam_selected = 'back';
var cam_selected_button = Ti.UI.createButton({
	backgroundImage: '../images/camera_buttons/cam_back.png',
	width: 42,
	height: 42,
    bottom: 26,
    right: 68,
    zIndex: 10
});
cam_selected_button.button = 'back';
camera_overlay_bottom_bar.add(cam_selected_button);

var cam_hidden_button = Ti.UI.createButton({
	backgroundImage: '../images/camera_buttons/cam_front.png',
	width: 42,
	height: 42,
    bottom: 26,
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
            bottom: 26,
            opacity: 0,
            duration: 250
        });
        cam_select_open = false;
    }
    else{
        cam_hidden_button.animate({
            curve: Ti.UI.ANIMATION_CURVE_EASE_OUT,
            bottom: 78,
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
    bottom: 26,
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
    bottom: 26,
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
    bottom: 26,
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
            bottom: 26,
            opacity: 0,
            duration: 250
        });
        flash_top_button.animate({
            curve: Ti.UI.ANIMATION_CURVE_EASE_IN,
            bottom: 26,
            opacity: 0,
            duration: 250
        });
        flash_select_open = false;
    }
    else{
        flash_middle_button.animate({
            curve: Ti.UI.ANIMATION_CURVE_EASE_OUT,
            bottom: 78,
            opacity: 1.0,
            duration: 250
        });
        flash_top_button.animate({
            curve: Ti.UI.ANIMATION_CURVE_EASE_IN,
            bottom: 132,
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

if (Titanium.Platform.model !='iPhone 4' && Titanium.Platform.model !='iPad'){
    cam_selected_button.hide();
    cam_hidden_button.hide();
    flash_selected_button.hide();
    flash_middle_button.hide();
    flash_top_button.hide();
}

var camera_listeners_attached = false;
var take_photo_click = false;

win.addEventListener('focus', function(){
    tabGroup.bottom = -50;
    take_photo_click = false;
    
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
    
    saving_activity_cont.hide();
    saving_activity_cont.opacity = 0;
    reset_shutter();
    show_camera();
    
    take_photo_click = false;
    window_activity_cont.hide();
});

var image = null;
function cammera_success(event, gallery){
    if (typeof(gallery) == 'undefined'){
        Titanium.Media.hideCamera();
    }
    var nom_window = Ti.UI.createWindow({backgroundColor:"#000", url:'nom/nominate.js'});
    Titanium.UI.currentTab.open(nom_window,{animated:true});
    
    image = event.media;
    var imageView = Titanium.UI.createImageView({
        image:image,
        width:'auto',
        height:'auto'
    });
    
    //Portrit
    var new_height = 0;
    var new_width = 0;
    if (imageView.height > imageView.width){
        new_width = 640;
        new_height = Math.floor(new_width * (imageView.height / imageView.width));
        
        var crop_y = (new_height - 640) / 2;
        
        if (crop_y < 0){
            crop_y = 0;
        }
    
        image = imageView.toImage().imageAsResized(new_width, new_height).imageAsCropped({width:640,height:640,x:0,y:crop_y});
    }
    else{ //Landscape
        new_height = 640;
        new_width = Math.floor(new_height * (imageView.width / imageView.height));
        
        var crop_x = (new_width - 640) / 2;
        
        if (crop_x < 0){
            crop_x = 0;
        }
    
        image = imageView.toImage().imageAsResized(new_width, new_height).imageAsCropped({width:640,height:640,x:crop_x,y:0});
    }

    var f = Titanium.Filesystem.getFile(Titanium.Filesystem.applicationDataDirectory, 'temp.png');
    f.write(image);
    
    upload_photo(image);
    
    var data = {
        'photo': {
            'width': 640,
            'height': 640
        },
        'new_photo': true
    };
    
    pass_nominate_data(data);
}

var photo_upload = Titanium.Network.createHTTPClient({enableKeepAlive:false});
var upload_health_interval = null;
photo_upload.timeout = 15000;
function upload_photo(image){
    var check_count = 0;
    var progress = 0;
    Ti.App.Properties.setString("upload_complete", null);
    Ti.App.Properties.setString("upload_progress", 0);
    Ti.App.Properties.setString("upload_ready_state", 4);

    photo_upload.onload = function(){
        try{
            var data = JSON.parse(this.responseData);
            var id = data.id;
            Ti.App.Properties.setString("upload_complete", id);
        }
        catch(e){
            photo_upload.abort();
            Ti.App.Properties.setString("upload_ready_state", 0);
            Ti.App.Properties.setString("upload_progress", 0);
            upload_photo(image);
        }
    };
    photo_upload.onerror = function(e){
        // alert("Error: " + e.error + "; (Http status " + this.status + ")");
    };
    photo_upload.onsendstream = function(e){
        try{
            progress = 100 * e.progress;
            Ti.App.Properties.setString("upload_progress", progress);
        }
        catch(e){
            // alert(e);
        }
    };
    photo_upload.onreadystatechange = function(e){
        Ti.App.Properties.setString("upload_ready_state", photo_upload.readyState);
    }
    
    var url = SERVER_URL + '/upload_photo/'
    photo_upload.open('POST', url);
    photo_upload.setRequestHeader("enctype", "multipart/form-data");
    photo_upload.setRequestHeader("Content-Type", "image/png");
    photo_upload.send({
        'file': image,
        'iphone': true,
        'access_token': me.access_token
    });
    
    clearInterval(upload_health_interval);
    upload_health_interval = setInterval(function(){
        if (check_count > 12 && progress <= 0){
            clearInterval(upload_health_interval);
            try{
                photo_upload.abort();
                Ti.App.Properties.setString("upload_ready_state", 0);
                Ti.App.Properties.setString("upload_progress", 0);
                upload_photo(image);
            }
            catch (e){
                upload_photo(image);
            }
        }
        check_count += 1;
    }, 200);
}

function camera_cancel(){
    reset_after_camera(true);
}

function camera_error(error){
    var a = Titanium.UI.createAlertDialog({title:'Camera'});

    if (error.code == Titanium.Media.NO_CAMERA){
        a.setMessage('Device does not have camera capabilities');
    }
    else{
        // a.setMessage('Unexpected error: ' + error.code);
    }
    
    a.show();
    reset_after_camera();
}

Ti.App.addEventListener('restart_upload', function(e){
    photo_upload.abort();
    clearInterval(upload_health_interval);
    upload_photo(image);
});

Ti.App.addEventListener('abort_upload', function(e){
    photo_upload.abort();
    clearInterval(upload_health_interval);
});

Ti.App.addEventListener('cancel_nominate', function(e){
    take_photo_click = false;
    reset_shutter();
    photo_upload.abort();
});

Ti.App.addEventListener('reset_after_camera', function(e){
    take_photo_click = false;
    // tabGroup.bottom = 0;
    // tabGroup.setActiveTab(0);
});

Ti.App.addEventListener('reset_after_camera_to_profile', function(e){
    take_photo_click = false;
    // tabGroup.bottom = 0;
    // tabGroup.setActiveTab(4);
});

function reset_after_camera(prev){
    Titanium.UI.iPhone.showStatusBar({animated:false});
    tabGroup.bottom = 0;
    take_photo_click = false;

    if (typeof(prev) != 'undefined'){
        var prev_tab_index = parseInt(Ti.App.Properties.getString("selected_tab_index"));
        tabGroup.setActiveTab(prev_tab_index);
    }
    else{
        tabGroup.setActiveTab(0);
    }
}