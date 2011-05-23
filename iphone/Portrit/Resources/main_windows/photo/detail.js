var init_count = 0;
Ti.App.addEventListener('pass_photo_detail', function(eventData) {
    if (init_count == 0){
        init_count += 1;
        photo = eventData.photo;
        username = eventData.username;
        name = eventData.name;
        user_fid = eventData.user_fid;
        
        render_photo_detail();
    }
});

Ti.include('../../settings.js');
Ti.include('../../includes.js');

var win = Ti.UI.currentWindow;
var me = JSON.parse(Ti.App.Properties.getString("me"));
var top_header = null;
var photo_cont = null;
var bottom_footer = null;
    
window_nav_bar = Titanium.UI.createView({
    backgroundImage: '../../images/iphone_header_blank.png',
    width: 320,
    height: 40,
    top: 0
});

back_buttom = Titanium.UI.createButton({
    width: 68,
    height: 32,
    left: 0,
    title: 'Back',
    font: {fontSize: 11, fontWeight: 'bold'},
    backgroundImage: '../../images/back.png'
});

back_buttom.addEventListener('click', function(){
    win.close();
});

window_nav_bar.add(back_buttom);

win.add(window_nav_bar);

function add_profile_window(e){
    var w = Ti.UI.createWindow({backgroundColor:"#222", url:'../user/profile.js'});
	Titanium.UI.currentTab.open(w,{animated:true});
	setTimeout(function(){
	    Ti.App.fireEvent('pass_user', {
            user: e.source.user,
            name: e.source.name,
            username: e.source.username
        });
	}, 200);
}

var open_init = false;
var share_options_view = null;
function open_options(e){
    var photo = e.source.photo;
    var photo_id = photo.id;
    var nom = null;
    
    var t = Titanium.UI.create2DMatrix();
	t = t.scale(.45);
	
	var t1 = Titanium.UI.create2DMatrix();
	t1 = t1.scale(1);
	var fadeIn = Titanium.UI.createAnimation({
        curve: Ti.UI.ANIMATION_CURVE_EASE_OUT_IN,
        opacity: 1,
        transform: t1,
        duration: 350
    });

    var t2 = Titanium.UI.create2DMatrix();
	t2 = t2.scale(.45);
    var fadeOut = Titanium.UI.createAnimation({
        curve: Ti.UI.ANIMATION_CURVE_EASE_OUT_IN,
        opacity: 0,
        transform: t2,
        duration: 350
    });

    var share_window = Titanium.UI.createWindow({
		backgroundImage:'../../images/share_window_background.png',
		height: 440,
		opacity: 0,
		left: 8,
		width: 304,
		top: 8,
		transform: t
	});
	
	var share_cont = Titanium.UI.createView({
        height: 410,
        width: 290,
        layout: 'vertical'
    });
    share_window.add(share_cont);
    
    var share_header = Titanium.UI.createLabel({
	    text: 'Photo Options',
	    textAlign: 'left',
	    left: 10,
	    top: 0,
        color: '#333',
        size: {width: 'auto', height: 'auto'},
        font:{fontSize:20, fontWeight: 'bold'}
    });
    share_cont.add(share_header);
    
    var share_sub_header = Titanium.UI.createLabel({
	    text: 'Click one of the options below.',
	    textAlign: 'left',
	    left: 10,
	    top: 0,
        color: '#333',
        size: {width: 'auto', height: 'auto'},
        font:{fontSize:16}
    });
    share_cont.add(share_sub_header);
    
    var share_table = Ti.UI.createTableView({
        backgroundColor: '#fff',
        // top: 40,
        height: 320,
        minRowHeight: 60,
        style:Titanium.UI.iPhone.TableViewStyle.GROUPED
    });
    share_cont.add(share_table);
    
    var share_table_data = [ ];
    
    // Share Section
    var share_label = Titanium.UI.createLabel({
	    text: 'Share Photo',
        color: '#666',
        left: 10,
        top: 0,
        size: {width: 320, height: 'auto'},
        font:{fontSize: 16, fontWeight: 'bold'}
    });
    var share_header = Titanium.UI.createView({
        height: 'auto',
        width: 320
    });
    share_header.add(share_label);
    
    var section = Titanium.UI.createTableViewSection({
        headerView: share_header
    });
    
    //Share Portrit
    // var portrit_row = Ti.UI.createTableViewRow({
    //         color: '#333',
    //         height: 'auto',
    //         selectionStyle: Titanium.UI.iPhone.TableViewCellSelectionStyle.NONE
    // });
    // var portrit_share_shown = false;
    // portrit_row.addEventListener('click', function(){
    //     if (!portrit_share_shown){
    //         portrit_share_shown = true;
    //         
    //         var portrit_hidden_cont = Titanium.UI.createView({
    //             height: 'auto',
    //             width: 'auto',
    //             layout: 'vertical',
    //             top: 50,
    //         });
    // 
    //         var portrit_textarea = Titanium.UI.createTextArea({
    //          color: '#333',
    //          width: 250,
    //          height: 75,
    //          bottom: 5,
    //          borderWidth: 1,
    //          borderColor: '#dedede',
    //          borderRadius: 3,
    //          font: {fontSize: 18, fontWeight: 'bold'},
    //          suppressReturn: false
    //      });
    //         portrit_hidden_cont.add(portrit_textarea);
    //         
    //         close_portrit_button = Ti.UI.createButton({
    //          title:"Cancel",
    //             font: {fontSize: 16, fontWeight: 'bold'},
    //          backgroundImage: '../../images/load_more_button.png',
    //          width: 118,
    //          height: 42,
    //          bottom: 10,
    //          left: 0,
    //         });
    //         close_portrit_button.addEventListener('click', function(){
    //             portrit_row.remove(portrit_hidden_cont);
    //             
    //             setTimeout(function(){
    //                 portrit_share_shown = false;
    //             }, 300);
    //         });
    //         portrit_hidden_cont.add(close_portrit_button);
    //         
    //         share_portrit_button = Ti.UI.createButton({
    //          title:"Share",
    //          color: '#99CB6E',
    //             font: {fontSize: 16, fontWeight: 'bold'},
    //          backgroundImage: '../../images/load_more_button.png',
    //          width: 118,
    //          height: 42,
    //          top: -52,
    //          bottom: 10,
    //             right: 0,
    //         });
    //         share_portrit_button.addEventListener('click', function(){
    //             var caption = portrit_textarea.value;
    //             share_on_portrit(me, nom, caption);
    //             
    //             portrit_row.remove(portrit_hidden_cont);
    //             setTimeout(function(){
    //                 portrit_share_shown = false;
    //             }, 300);
    //         });
    //         portrit_hidden_cont.add(share_portrit_button);
    //         
    //         portrit_row.add(portrit_hidden_cont);
    //         
    //         var caption_focus_interval = null;
    //         var caption_focus_interval_count = 0;
    //         clearInterval(caption_focus_interval);
    //         caption_focus_interval = setInterval(function(){
    //             if (caption_focus_interval_count > 6){
    //                 clearInterval(caption_focus_interval);
    //             }
    //             caption_focus_interval_count += 1;
    //             portrit_textarea.focus();
    //         }, 50);
    //     }
    // });
    
    //     var row_img = Ti.UI.createImageView({
    //  image: '../../images/portrit_logo.png',
    //  opacity: 0.35,
    //  left: 10,
    //  top: 10,
    //  height: 36,
    //  width: 36,
    //  hires: true
    // });
    // portrit_row.add(row_img);
    //     
    //     var row_title = Titanium.UI.createLabel({
    //     text: 'Portrit',
    //     opacity: 0.35,
    //         color: '#333',
    //         left: 55,
    //         top: 12,
    //         size: {width: 320, height: 20},
    //         font:{fontSize: 18, fontWeight: 'bold'}
    //     });
    //     portrit_row.add(row_title);
    //     
    //     var row_sub_title = Titanium.UI.createLabel({
    //     text: 'Share this photo with your followers.',
    //     opacity: 0.35,
    //         color: '#333',
    //         left: 55,
    //         top: 29,
    //         size: {width: 240, height: 'auto'},
    //         font:{fontSize: 13}
    //     });
    //     portrit_row.add(row_sub_title);
    //     
    //     section.add(portrit_row);
    
    //Share Facebook
    var facebook_row = Ti.UI.createTableViewRow({
            color: '#333',
            height: 'auto',
            selectionStyle: Titanium.UI.iPhone.TableViewCellSelectionStyle.NONE
    });
    var facebook_share_shown = false;
    facebook_row.addEventListener('click', function(){
        if (!facebook_share_shown){
            facebook_share_shown = true;
            
            share_table.scrollToTop(30);
            
            var facebook_hidden_cont = Titanium.UI.createView({
                height: 'auto',
                width: 'auto',
                layout: 'vertical',
                top: 50,
            });

            var facebook_textarea = Titanium.UI.createTextArea({
        	    color: '#333',
        	    width: 250,
        	    height: 75,
        	    bottom: 5,
        	    borderWidth: 1,
        	    borderColor: '#dedede',
        	    borderRadius: 3,
        	    font: {fontSize: 18, fontWeight: 'bold'},
        	    suppressReturn: false
        	});
            facebook_hidden_cont.add(facebook_textarea);
            
            close_facebook_button = Ti.UI.createButton({
            	title:"Cancel",
                font: {fontSize: 16, fontWeight: 'bold'},
            	backgroundImage: '../../images/load_more_button.png',
            	width: 118,
            	height: 42,
            	bottom: 10,
            	left: 0,
            });
            close_facebook_button.addEventListener('click', function(){
                facebook_row.remove(facebook_hidden_cont);
                
                setTimeout(function(){
                    facebook_share_shown = false;
                }, 300);
            });
            facebook_hidden_cont.add(close_facebook_button);
            
            share_facebook_button = Ti.UI.createButton({
            	title:"Share",
            	color: '#99CB6E',
                font: {fontSize: 16, fontWeight: 'bold'},
            	backgroundImage: '../../images/load_more_button.png',
            	width: 118,
            	height: 42,
            	top: -52,
            	bottom: 10,
                right: 0,
            });
            share_facebook_button.addEventListener('click', function(){
                var title = me.name.split(' ')[0] + ' shared a photo on Portrit';
                var comment_body = facebook_textarea.value;
                facebook_textarea.blur();
                photo.photo = photo;
                share_on_facebook(me, photo, comment_body, title, username);
                
                facebook_row.remove(facebook_hidden_cont);
                setTimeout(function(){
                    facebook_share_shown = false;
                }, 300);
            });
            facebook_hidden_cont.add(share_facebook_button);
            
            facebook_row.add(facebook_hidden_cont);
            
            var caption_focus_interval = null;
            var caption_focus_interval_count = 0;
            clearInterval(caption_focus_interval);
            caption_focus_interval = setInterval(function(){
                if (caption_focus_interval_count > 6){
                    clearInterval(caption_focus_interval);
                }
                caption_focus_interval_count += 1;
                facebook_textarea.focus();
            }, 50);
        }
    });
    
    var row_img = Ti.UI.createImageView({
		image: '../../images/fb_logo.png',
		left: 10,
		top: 10,
		height: 36,
		width: 36,
		hires: true
	});
	facebook_row.add(row_img);
    
    var row_title = Titanium.UI.createLabel({
	    text: 'Facebook',
        color: '#333',
        left: 55,
        top: 12,
        size: {width: 320, height: 20},
        font:{fontSize: 18, fontWeight: 'bold'}
    });
    facebook_row.add(row_title);
    
    var row_sub_title = Titanium.UI.createLabel({
	    text: 'Share this photo on Facebook.',
        color: '#333',
        left: 55,
        top: 29,
        size: {width: 200, height: 'auto'},
        font:{fontSize: 13}
    });
    facebook_row.add(row_sub_title);
    
    section.add(facebook_row);
    
    //Share Twitter
    var twitter_row = Ti.UI.createTableViewRow({
            color: '#333',
            height: 'auto',
            selectionStyle: Titanium.UI.iPhone.TableViewCellSelectionStyle.NONE
    });
    var twitter_share_shown = false;
    twitter_row.addEventListener('click', function(){
        if (!twitter_share_shown){
            twitter_share_shown = true;
            
            var twitter_hidden_cont = Titanium.UI.createView({
                height: 'auto',
                width: 'auto',
                layout: 'vertical',
                top: 50,
            });

            var twitter_textarea = Titanium.UI.createTextArea({
        	    color: '#333',
        	    width: 250,
        	    height: 75,
        	    bottom: 5,
        	    borderWidth: 1,
        	    borderColor: '#dedede',
        	    borderRadius: 3,
        	    font: {fontSize: 18, fontWeight: 'bold'},
        	    suppressReturn: false
        	});
            twitter_hidden_cont.add(twitter_textarea);
            
            close_twitter_button = Ti.UI.createButton({
            	title:"Cancel",
                font: {fontSize: 16, fontWeight: 'bold'},
            	backgroundImage: '../../images/load_more_button.png',
            	width: 118,
            	height: 42,
            	bottom: 10,
            	left: 0,
            });
            close_twitter_button.addEventListener('click', function(){
                twitter_row.remove(twitter_hidden_cont);
                
                setTimeout(function(){
                    twitter_share_shown = false;
                }, 300);
            });
            twitter_hidden_cont.add(close_twitter_button);
            
            share_twitter_button = Ti.UI.createButton({
            	title:"Share",
            	color: '#99CB6E',
                font: {fontSize: 16, fontWeight: 'bold'},
            	backgroundImage: '../../images/load_more_button.png',
            	width: 118,
            	height: 42,
            	top: -52,
            	bottom: 10,
                right: 0,
            });
            share_twitter_button.addEventListener('click', function(){
                var comment_body = twitter_textarea.value;
                twitter_textarea.blur();
                share_on_twitter(me, photo, comment_body, username);
                
                twitter_row.remove(twitter_hidden_cont);
                setTimeout(function(){
                    twitter_share_shown = false;
                }, 300);
            });
            twitter_hidden_cont.add(share_twitter_button);
            
            twitter_row.add(twitter_hidden_cont);
            
            var caption_focus_interval = null;
            var caption_focus_interval_count = 0;
            clearInterval(caption_focus_interval);
            caption_focus_interval = setInterval(function(){
                if (caption_focus_interval_count > 6){
                    clearInterval(caption_focus_interval);
                }
                caption_focus_interval_count += 1;
                twitter_textarea.focus();
            }, 50);
        }
    });
    
    var row_img = Ti.UI.createImageView({
		image: '../../images/twitter_logo.png',
		left: 10,
		top: 10,
		height: 36,
		width: 36,
		hires: true
	});
	twitter_row.add(row_img);
    
    var row_title = Titanium.UI.createLabel({
	    text: 'Twitter',
        color: '#333',
        left: 55,
        top: 12,
        size: {width: 320, height: 20},
        font:{fontSize: 18, fontWeight: 'bold'}
    });
    twitter_row.add(row_title);
    
    var row_sub_title = Titanium.UI.createLabel({
	    text: 'Share this photo on Twitter.',
        color: '#333',
        left: 55,
        top: 29,
        size: {width: 200, height: 'auto'},
        font:{fontSize: 13}
    });
    twitter_row.add(row_sub_title);
    
    section.add(twitter_row);
    
    share_table_data.push(section);
    
    var flag_label = Titanium.UI.createLabel({
	    text: 'Flag Photo',
        color: '#666',
        left: 10,
        top: 0,
        size: {width: 320, height: 'auto'},
        font:{fontSize: 16, fontWeight: 'bold'}
    });
    var flag_header = Titanium.UI.createView({
        height: 'auto',
        width: 320
    });
    flag_header.add(flag_label);
    
    var section = Titanium.UI.createTableViewSection({
        headerView: flag_header
    });
    share_table_data.push(section);
    
    var flag_row = Ti.UI.createTableViewRow({
        color: '#333',
        height: 'auto',
        selectionStyle: Titanium.UI.iPhone.TableViewCellSelectionStyle.NONE
    });
    var flag_cont_shown = false;
    flag_row.addEventListener('click', function(){
        if (!flag_cont_shown){
            flag_cont_shown = true;
            
            var flag_hidden_cont = Titanium.UI.createView({
                height: 'auto',
                width: 250,
                layout: 'vertical',
                top: 60,
            });
            
            close_flag_button = Ti.UI.createButton({
            	title:"Cancel",
                font: {fontSize: 16, fontWeight: 'bold'},
            	backgroundImage: '../../images/load_more_button.png',
            	width: 118,
            	height: 42,
            	bottom: 10,
            	left: 0,
            });
            close_flag_button.addEventListener('click', function(){
                flag_row.remove(flag_hidden_cont);
                setTimeout(function(){
                    flag_cont_shown = false;
                }, 300);
            });
            flag_hidden_cont.add(close_flag_button);
            
            share_flag_button = Ti.UI.createButton({
            	title:"Submit",
            	color: '#99CB6E',
                font: {fontSize: 16, fontWeight: 'bold'},
            	backgroundImage: '../../images/load_more_button.png',
            	width: 118,
            	height: 42,
            	top: -52,
            	bottom: 10,
                right: 0,
            });
            share_flag_button.addEventListener('click', function(){
                flag_nom(me, nom, photo_id, win);
                
                flag_row.remove(flag_hidden_cont);
                setTimeout(function(){
                    flag_cont_shown = false;
                }, 300);
            });
            flag_hidden_cont.add(share_flag_button);
            
            flag_row.add(flag_hidden_cont);
        }
    });
    
    var row_sub_title = Titanium.UI.createLabel({
	    text: 'Please only flag photos that break the Portrit Terms of Service. Such as pornography, violence, spam, etc.',
        color: '#333',
        left: 10,
        top: 5,
        size: {width: 260, height: 'auto'},
        font:{fontSize: 13}
    });
    flag_row.add(row_sub_title);
    section.add(flag_row);
    
    share_table.setData(share_table_data);
    
    close_button = Ti.UI.createButton({
    	title:"Close",
        font: {fontSize: 20, fontWeight: 'bold'},
    	backgroundImage: '../../images/close_big_button.png',
    	width: 274,
    	height: 41,
        top: 5,
    });
    share_cont.add(close_button);
    close_button.addEventListener('click', function(){
        share_window.close(fadeOut);
    });
    
    share_window.open(fadeIn);
}

function add_nominate_window(e){
    var w = Ti.UI.createWindow({backgroundColor:"#000", url:'../nom/nominate.js'});
    w.hideTabBar();
	Titanium.UI.currentTab.open(w,{animated:true});

	setTimeout(function(){
	    Ti.App.fireEvent('pass_photo_data', {
            user: user_fid,
            name: name,
            photo: e.source.photo
        });
	}, 200);
}

function render_photo_detail(){
    profile_img_url = 'https://graph.facebook.com/' + user_fid + '/picture?type=square';
    profile_img = Ti.UI.createImageView({
		image: '../../images/photo_loader.png',
		left: 0,
		top: 0,
		height: 30,
		width: 30,
		hires: true
	});
	cachedImageView('profile_images', profile_img_url, profile_img);
	
	profile_img.user = user_fid;
    profile_img.name = name;
    profile_img.username = username;
    profile_img.addEventListener('click', add_profile_window);
    
    top_header.add(profile_img);
    
    username_label = Titanium.UI.createLabel({
        text: username,
        color: '#fff',
        left: 40,
        width: 'auto',
        height: 30,
        font:{fontSize:14, fontWeight: 'bold'}
    });
    username_label.user = user_fid;
    username_label.name = name;
    username_label.username = username;
    username_label.addEventListener('click', add_profile_window);
    
    top_header.add(username_label);
    
    var now = new Date();
    time = new Date(photo.created_time * 1000);
    time_diff = now - time;
    time_diff /= 1000;
    post_time = Titanium.UI.createLabel({
	    text: secondsToHms(time_diff),
        color: '#fff',
        right: 5,
        size: {width: 'auto', height: 30},
        font:{fontSize:13, fontWeight: 'bold'}
    });
    top_header.add(post_time);
    
    
    var max_height = 320;
    var photo_width = 0;
    var photo_height = 0;
    if (photo.width > Ti.Platform.displayCaps.platformWidth){
        photo_width = Ti.Platform.displayCaps.platformWidth;
    }
    else{
        photo_width = photo.width;
    }

    if (photo.height > photo.width){
        photo_height = max_height;
        photo_width = photo_height * (photo.width / photo.height);
    }
    else{
        photo_height = photo_width * (photo.height / photo.width);
    }
    
    main_image = Ti.UI.createImageView({
		image: '../../images/photo_loader.png',
		width: photo_width,
		height: photo_height,
		hires: true
	});
	cachedImageView('images', photo.source, main_image);
	
	photo_cont.add(main_image);
	
	nominate_photo = Titanium.UI.createButton({
        backgroundImage: '../../images/nominate_button.png',
        color: '#fff',
        title: ' Nominate',
        font: {fontSize: 20, fontWeight: 'bold'},
        textAlign: 'center',
        right: 0,
        bottom: 20,
        height: 40,
        width: 122,
        zIndex: 1
    });
    nominate_photo.photo = photo;
    nominate_photo.addEventListener('click', add_nominate_window);
    
    photo_cont.add(nominate_photo);
	
	photo_options.photo = photo;
	photo_options_label.photo = photo;
}

function init_photo_detail(){
    top_header = Titanium.UI.createView({
        backgroundColor: '#222',
        width: 320,
        height: 30,
        top: 40
    });
    win.add(top_header);
    
    photo_cont = Titanium.UI.createView({
        backgroundColor: '#000',
        width: 320,
        height: 320,
        top: 70
    });
    win.add(photo_cont);
    
    bottom_footer = Titanium.UI.createView({
        backgroundColor: '#fff',
        width: 320,
        height: 30,
        bottom: 0
    });
    
    upper_drop_shadow = Titanium.UI.createView({
        backgroundImage: '../../images/upper_drop_shadow.png',
        width: 320,
        height: 2,
        top: -2
    });
    bottom_footer.add(upper_drop_shadow);
    
    photo_options_label = Titanium.UI.createLabel({
        text: 'Photo Options',
        color: '#aeaeae',
        left: 5,
        width: 120,
        height: 30,
        font:{fontSize:14, fontWeight: 'bold'}
    });
    photo_options_label.addEventListener('click', open_options);
    bottom_footer.add(photo_options_label);
    
    photo_options = Ti.UI.createButton({
    	backgroundImage: '../../images/stream_option_button.png',
    	width: 25,
    	height: 25,
        right: 5,
        top: 5,
        bottom: 5
    });
    photo_options.addEventListener('click', open_options);
    
    bottom_footer.add(photo_options);
    
    win.add(bottom_footer);
}
init_photo_detail();
