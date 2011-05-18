Ti.App.addEventListener('pass_user', function(eventData) {
    if (init_count == 0){
        init_count += 1;
        user = String(eventData.user);
        name = String(eventData.name);
        username = String(eventData.username);

        header_label.text = username;
        init_profile_view();
    }
});

Ti.App.addEventListener('close_user_profile_page', function(eventData) {
    win.close();
});

Ti.include('../../settings.js');
Ti.include('../../includes.js');

var me = JSON.parse(Ti.App.Properties.getString("me")),
    win = Ti.UI.currentWindow,
    tv = null,
    user = null,
    window_nav_bar = null,
    back_buttom = null,
    button_label = null,
    photos_nav = null,
    trophies_nav = null,
    active_nav = null,
    profile_header = null,
    follow_cont = null,
    profile_nav_cont = null,
    following_user = false,
    list_view_data = [ ],
    trophy_data = [ ],
    active_noms_cache = [ ],
    active_noms_count = 0,
    view_active = 'photos',
    name = '';

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

var header_label = Titanium.UI.createLabel({
        text: '',
        color: '#fff',
        textAlign: 'center',
        font:{fontSize:22, fontWeight: 'bold'}
    });
window_nav_bar.add(header_label);

win.add(window_nav_bar);

window_activity = Titanium.UI.createActivityIndicator({
    message: 'Loading...',
    font:{fontSize:16, fontWeight:'bold'},
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
    top: 200,
    width: 320,
    height: 120,
    zIndex: 20
});
window_activity_cont.hide();
window_activity_cont.add(window_activity_background);
window_activity_cont.add(window_activity);
win.add(window_activity_cont);

function window_activity_timeout(){
    setTimeout(function(){
        window_activity_cont.hide();
    }, 2000);
}

function render_active_count(count){
    var active_count = Titanium.UI.createLabel({
        backgroundColor: '#6498cf',
        borderRadius: 10,
        color: '#fff',
        text: count,
        font: {fontSize: 12, fontWeight: 'bold'},
        textAlign: 'center',
        right: -5,
        top: -3,
        height: 20,
        width: 20,
        zIndex: 1
    });
    
    profile_nav_cont.add(active_count);
}

function render_trophy_count(count){
    var active_count = Titanium.UI.createLabel({
        backgroundColor: '#99CB6E',
        borderRadius: 10,
        color: '#fff',
        text: count,
        font: {fontSize: 12, fontWeight: 'bold'},
        textAlign: 'center',
        right: 65,
        top: -3,
        height: 20,
        width: 20,
        zIndex: 1
    });
    
    profile_nav_cont.add(active_count);
}

function add_nominate_window(e){
    var w = Ti.UI.createWindow({backgroundColor:"#000", url:'../nom/nominate.js'});
    w.hideTabBar();
	Titanium.UI.currentTab.open(w,{animated:true});

	setTimeout(function(){
	    Ti.App.fireEvent('pass_photo_data', {
            user: user,
            name: name,
            photo: e.source.photo
        });
	}, 200);
}

function render_user_photos(data, append){
    var row = null,
        section = null,
        nominate_photo = null,
        photo_header = null,
        now = new Date(),
        time = null,
        time_diff = null,
        post_time = null,
        post_time_cont = null,
        main_image = null,
        photo_height = 0,
        photo_width = 0,
        highres = false;
    
    for (var i = 0; i < data.length; i++){
        var max_height = 320;
        if (data[i].width > Ti.Platform.displayCaps.platformWidth){
            photo_width = Ti.Platform.displayCaps.platformWidth;
        }
        else{
            photo_width = data[i].width;
        }

        if (data[i].height > data[i].width){
            photo_height = max_height;
            photo_width = photo_height * (data[i].width / data[i].height);
        }
        else{
            photo_height = photo_width * (data[i].height / data[i].width);
        }
        
        row = Ti.UI.createTableViewRow({
                height: photo_height + 10,
                width: 320,
                selectionStyle: Titanium.UI.iPhone.TableViewCellSelectionStyle.NONE
        });

        main_image = Ti.UI.createImageView({
    		image: '../../images/photo_loader.png',
    		width: photo_width,
    		height: photo_height,
    		hires: true,
    		top: 0
    	});
    	cachedImageView('images', data[i].source, main_image);
    	
    	main_image_cont = Titanium.UI.createView({
            height: photo_height,
            width: photo_width,
            top: 0
        });
        main_image_cont.add(main_image);
    	
    	nominate_photo = Titanium.UI.createButton({
            backgroundImage: '../../images/nominate_button.png',
            color: '#fff',
            title: ' Nominate',
            font: {fontSize: 20, fontWeight: 'bold'},
            textAlign: 'center',
            right: 0,
            height: 40,
            width: 115,
            zIndex: 1
        });
        nominate_photo.photo = data[i];
        nominate_photo.addEventListener('click', add_nominate_window);
        
        photo_header = Titanium.UI.createView({
            height: 30,
            bottom: 15,
            right: 0,
            zIndex: 2
        });
        photo_header.add(nominate_photo);
        row.add(photo_header);
        
        post_time_cont = Titanium.UI.createView({
            left: 10,
            top: 10,
            height: 24,
            width: 'auto',
            zIndex: 1
        });
        
        post_time_background = Titanium.UI.createView({
            backgroundColor: '#000',
            opacity: 0.8,
            height: 24,
            width: '100%',
            zIndex: -1
        });
        post_time_cont.add(post_time_background);
    	
        time = new Date(data[i].created_time * 1000);
        time_diff = now - time;
        time_diff /= 1000;
        post_time = Titanium.UI.createLabel({
    	    text: secondsToHms(time_diff),
            color: '#fff',
            left: 5,
            top: 5,
            right: 5,
            bottom: 5,
            size: {width: 'auto', height: 24},
            font:{fontSize: 14}
        });
        
        post_time_cont.add(post_time);
        row.add(post_time_cont)
    	row.add(main_image_cont);
        row.created_time = data[i].created_time;

        if (typeof(append) == 'undefined'){
            list_view_data.push(row);
        }
        else{
            tv.appendRow(row);
        }
    }
    if (typeof(append) == 'undefined'){
        tv.setData(list_view_data);
    }
}

function add_detail_trophy_window(e){
    var w = Ti.UI.createWindow({backgroundColor:"#333", url:'../nom/detail.js'});
	Titanium.UI.currentTab.open(w,{animated:true});
	
	setTimeout(function(){
	    Ti.App.fireEvent('pass_detail', {
            nom_id: e.source.nom_id,
            photo: e.source.photo,
            cat: e.source.cat,
            state: e.source.state,
            user: username,
            won: true
        });
	}, 200);
}

function render_trophies(data){
    var section = null,
        row = null,
        trophy_header = null,
        trophy_label = null,
        cat_color = '',
        cat_name_underscore = '';
        
    if (data.length > 0){
        for (var i = 0; i < data.length; i++){
            cat_name_underscore = data[i].cat_name.replace(' ', '_').toLowerCase();
            cat_color = get_nom_cat_color(cat_name_underscore);

            trophy_header = Titanium.UI.createView({
                    height: 30,
                    width: 320
                });

            trophy_header_background = Titanium.UI.createView({
                    backgroundColor: cat_color,
                    height: '100%',
                    width: '100%',
                    // opacity: 0.9,
                    zIndex: -1
                });
            trophy_header.add(trophy_header_background);

            trophy_label = Titanium.UI.createLabel({
            	    text: data[i].cat_name,
                    color: '#fff',
                    left: 5,
                    width: 'auto',
                    height: 'auto',
                    font:{fontSize:16, fontWeight: 'bold'}
                });

            trophy_header.add(trophy_label);

            section = Titanium.UI.createTableViewSection({
                // headerView: trophy_header
            });

            row = Ti.UI.createTableViewRow({
                    height:'auto',
                    selectionStyle: Titanium.UI.iPhone.TableViewCellSelectionStyle.NONE
            });
            row.add(trophy_header);
            section.add(row);

            row = Ti.UI.createTableViewRow({
                    height:'auto',
                    selectionStyle: Titanium.UI.iPhone.TableViewCellSelectionStyle.NONE
            });

            var img_cont = Titanium.UI.createView({
                height: 'auto',
                width: 320
            });
            row.add(img_cont);

            var photo_in_row_count = 0;
            var row_count = 0;
            var photo_cont = null;
            for (var j = 0; j < data[i].noms.length; j++){
                if (j % 3 == 0 && j > 0){
                    section.add(row);
                    row = Ti.UI.createTableViewRow({
                            height:'auto',
                            selectionStyle: Titanium.UI.iPhone.TableViewCellSelectionStyle.NONE
                    });

                    if (j > 0){
                        row_count += 1;
                        photo_in_row_count = 0;

                        img_cont = Titanium.UI.createView({
                            height: 'auto',
                            width: 320
                        });
                        row.add(img_cont);
                    }
                }

                photo_cont = Ti.UI.createImageView({
            		image: '../../images/photo_loader.png',
                    top: 5,
                    bottom: 5,
            		left: (photo_in_row_count * 105) + 5,
            		width: 100,
            		height: 75,
            		hires: true
            	});
            	cachedImageView('images', data[i].noms[j].photo.source, photo_cont);

            	photo_cont.nom_id = data[i].noms[j].id;
                photo_cont.photo = data[i].noms[j].photo;
                photo_cont.cat = data[i].noms[j].nomination_category.replace(' ', '-');
                photo_cont.state = 'profile_trophies';

            	photo_cont.addEventListener('click', add_detail_trophy_window);

            	img_cont.add(photo_cont);
            	photo_in_row_count += 1;
            }    

            section.add(row);
            trophy_data.push(section);
        }
    }
    else{
        var empty_label = Titanium.UI.createLabel({
            text: name.split(' ')[0] + ' has not won any trophies.',
            color: '#eee',
            textAlign: 'center',
            font: {fontSize: 16, fontWeight: 'bold'}
        });
        var empty_label_cont = Titanium.UI.createView({
                height: 20,
                top: 100,
                width: 320,
            });
        empty_label_cont.add(empty_label);
        
        var row = Ti.UI.createTableViewRow({
                height:'auto',
                selectionStyle: Titanium.UI.iPhone.TableViewCellSelectionStyle.NONE
        });
        row.add(empty_label_cont);

        trophy_data = [row];
    }

    tv.setData(trophy_data);
}

function init_trophies_view(){
    if (trophy_data.length == 0){
        var xhr = Titanium.Network.createHTTPClient();

        xhr.onload = function(){
            window_activity_cont.hide();
            var data = JSON.parse(this.responseData);
            render_trophies(data);
        };

        var url = SERVER_URL + '/api/get_user_trophies/?access_token=' + me.access_token + '&target=' + user;
        xhr.open('GET', url);
        xhr.send();
        window_activity_cont.show();
        window_activity_timeout();
    }
    else{
        tv.setData(trophy_data);
    }
}

function add_profile_window(e){
    var w = Ti.UI.createWindow({backgroundColor:"#222", url:'../user/profile.js'});
	Titanium.UI.currentTab.open(w,{animated:true});
	
	setTimeout(function(){
	    Ti.App.fireEvent('pass_user', {
            user: e.source.user,
            name: e.source.name
        });
	}, 200);
}

function add_detail_window(e){
    var w = Ti.UI.createWindow({backgroundColor:"#222", url:'../nom/detail.js'});
	Titanium.UI.currentTab.open(w,{animated:true});
	
	setTimeout(function(){
	    Ti.App.fireEvent('pass_detail', {
            nom_id: e.source.nom_id,
            photo: e.source.photo,
            state: e.source.state,
            cat: e.source.cat,
            user: username,
            won: false
        });
	}, 200);
}

function show_tags(e){
    var w = Ti.UI.createWindow({backgroundColor:"#ddd", url:'../nom/tags.js'});
	Titanium.UI.currentTab.open(w,{animated:true});
	
	setTimeout(function(){
	    Ti.App.fireEvent('pass_tags', {
            tags: e.source.tags
        });
	}, 100);
	return false;
}

function add_comment_to_nom(e){
    var nom_id = e.source.nom_id;
    var comments = e.source.comments;
    var action_cont = e.source.action_cont;
    var comments_cont = null;
    var comment_cont = e.source.comment_cont;
    var comment_button = e.source;
    
    var t = Titanium.UI.create2DMatrix();
	t = t.scale(.45);
    
    var comment_window = Titanium.UI.createWindow({
		backgroundColor:'#ddd',
		height:245,
		opacity: 0,
		width:320,
		top: 0,
		transform:t
	});
	
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
    
    var post_button = Titanium.UI.createButton({
	    backgroundImage: '../../images/comment_post_button.png',
		title:'Post',
		font: {fontSize: 16, fontWeight: 'bold'},
		height:32,
		width:96,
		top: 195,
		left: 175
	});
	comment_window.add(post_button);

	// create a button to close window
	var cancel_button = Titanium.UI.createButton({
	    backgroundImage: '../../images/comment_cancel_button.png',
		title:'Cancel',
		font: {fontSize: 16, fontWeight: 'bold'},
		height:32,
		width:96,
		top: 195,
		left: 49
	});
	cancel_button.addEventListener('click', function(){
	    comment_textarea.blur();
		comment_window.close(fadeOut);
	});
	comment_window.add(cancel_button);
	
	var comment_textarea = Titanium.UI.createTextArea({
	    color: '#333',
	    width: 300,
	    height: 170,
	    font: {fontSize: 22, fontWeight: 'bold'},
	    top: 10,
	    borderRadius: 3,
	    suppressReturn: false
	});
    comment_window.add(comment_textarea);

	comment_window.open(fadeIn);
	
	post_button.nom_id = nom_id;
	post_button.addEventListener('click', function(e){
        var comment_body = comment_textarea.value;
        var nom_id = e.source.nom_id;
        
        if (comment_body != ''){
            var xhr = Titanium.Network.createHTTPClient();

            xhr.onload = function(){
                // var data = JSON.parse(this.responseData);
            };

            var url = SERVER_URL + '/api/new_comment/';

            xhr.open('POST', url);

            // send the data
            xhr.send({'access_token': me.access_token, 'body': comment_body, 'nom_id': nom_id});
            
            var now = new Date().getTime() / 1000;
            if (comments && comments.length > 0){
                comments.splice(0, 0, {
                    'comment': comment_body,
                    'owner_id': me.fid,
                    'owner_name': me.name,
                    'create_datetime': now
                });
            }
            else{
                comments = [{
                    'comment': comment_body,
                    'owner_id': me.fid,
                    'owner_name': me.name,
                    'create_datetime': now
                }];
            }
            action_cont.height = action_cont.height;
            action_cont.remove(comment_cont);
            comments_cont = Titanium.UI.createView({
                    backgroundColor: '#fff',
                    height: 'auto',
                    top: 0,
                    width: 320,
                    layout: 'vertical',
                    zIndex: 1
                });
            render_comments(comments_cont, comments);
            action_cont.add(comments_cont);
            action_cont.height = 'auto';
            comment_button.comment_cont = comments_cont;
            comment_button.comments = comments;
        }
        
	    comment_textarea.blur();
		comment_window.close(fadeOut);
	});
	
	var textarea_focus = null;
	var textarea_focus_count = 0;
	clearInterval(textarea_focus);
	textarea_focus = setInterval(function(){
	    if (textarea_focus_count < 10){
	        comment_textarea.focus();
    	    textarea_focus_count += 1;
	    }
	    else{
	        clearInterval(textarea_focus);
	    }
	}, 30);
}

function open_options(e){
    var photo_id = e.source.photo_id;
    var nom = e.source.nom;
    
    var optionsDialogOpts = {
    	options:['Flag photo', 'Share on Facebook', 'Share on Twitter', 'Cancel'],
    	destructive:0,
    	cancel:3,
    	title:'Photo options'
    };

    var dialog = Titanium.UI.createOptionDialog(optionsDialogOpts);
    
    dialog.addEventListener('click',function(e){
        if (e.index == 0){
            flag_nom(me, nom, photo_id, win);
        }
        else if (e.index == 1){
            // Facebook Share
            var title = me.username + ' shared a nomination on Portrit';
            share_nom(nom, 'Facebook', title);
        }
        else if (e.index == 2){
            // Twitter Share
            share_nom(nom, 'Twitter', '');
        }
	});
	dialog.show();
}

function follow_event(e){
    var method = e.source.method,
        parent = e.source.parent_cont,
        user_fid = e.source.user_fid;
    
    parent.remove(e.source);
    
    var xhr = Titanium.Network.createHTTPClient({enableKeepAlive:false});
    if (method == 'follow'){
        xhr.onload = function(){   
            var data = JSON.parse(this.responseData);
            
            follow_button = Titanium.UI.createButton({
                width: 88,
                height: 25,
                left: 6,
                bottom: 0,
                title: 'Following',
                font: {fontSize: 12, fontWeight: 'bold'},
                backgroundImage: '../../images/profile_unfollow.png',
                zIndex: 2
            });
            
            follow_button.method = 'unfollow';
            follow_button.parent_cont = parent;
            follow_button.button = true;
            follow_button.username = username;
            follow_button.user_fid = user_fid;
            
            follow_button.addEventListener('click', follow_event);

            parent.add(follow_button);
        };

        var url = SERVER_URL + '/api/follow_unfollow_user/';
        xhr.open('POST', url);

        // send the data
        xhr.send({'access_token': me.access_token, 'target': username, method: 'follow'});
    }
    else{
        xhr.onload = function(){   
            var data = JSON.parse(this.responseData);
            
            follow_button = Titanium.UI.createButton({
                width: 88,
                height: 25,
                left: 6,
                bottom: 0,
                title: 'Follow',
                font: {fontSize: 12, fontWeight: 'bold'},
                backgroundImage: '../../images/profile_follow.png',
                zIndex: 2
            });
            
            follow_button.method = 'follow';
            follow_button.parent_cont = parent;
            follow_button.button = true;
            follow_button.username = username;
            follow_button.user_fid = user_fid;
            
            follow_button.addEventListener('click', follow_event);

            parent.add(follow_button);
        };

        var url = SERVER_URL + '/api/follow_unfollow_user/';
        xhr.open('POST', url);

        // send the data
        xhr.send({'access_token': me.access_token, 'target': username, method: 'unfollow'});
    }
}

function get_comments(id, cont, loading){
    var xhr = Titanium.Network.createHTTPClient();

    xhr.onload = function(){
        var data = JSON.parse(this.responseData);
        cont.remove(loading);
        
        if (data.length > 0){
            data.splice(0, 2);
            render_comments(cont, data);
        }
    };

    var url = SERVER_URL + '/api/get_comments/?nom_id=' + id;

    xhr.open('GET', url);
    xhr.send();
}

function render_active_view(data){
    var active_data = [ ],
        nom = null;
        row = null,
        section = null,
        nominate_photo = null,
        photo_header = null,
        now = new Date(),
        time = null,
        time_diff = null,
        post_time = null,
        post_time_cont = null,
        main_image = null,
        photo_height = 0,
        photo_width = 0,
        nom_cat_underscore = '',
        nom_cat_color = null,
        highres = false,
        photo_action_cont = null;
        add_comment = null,
        photo_options = null,
        nominator_profile_img_url = null,
        nominator_profile_img = null,
        nominator_footer = null,
        nom_detail_button = null;
    
    for (var i = 0; i < data.length; i++){
        nom = data[i];
        nom_cat_underscore = data[i].nomination_category.replace(' ', '_').toLowerCase();
        nom_cat_color = get_nom_cat_color(nom_cat_underscore);
        
        nominate_photo = Titanium.UI.createLabel({
            color: '#fff',
            text: 'Nominated for ' + data[i].nomination_category,
            font: {fontSize: 20, fontWeight: 'bold'},
            textAlign: 'right',
            rigth: 15,
            width: 305,
            zIndex: 1
        });
        nominate_photo.photo_id = data[i].id;
        
        photo_header = Titanium.UI.createView({
            height: 30,
            width: 320,
        });
        
        photo_header_background = Titanium.UI.createView({
            backgroundColor: nom_cat_color,
            height: 30,
            width: 320,
            zIndex: -1
        });
        photo_header.add(photo_header_background);
        
        photo_header.add(nominate_photo);
        
        section = Titanium.UI.createTableViewSection({
            headerView: photo_header
        });
        
        var max_height = 320;
        if (Ti.Platform.displayCaps.density == 'high') {
            if (data[i].photo.width > Ti.Platform.displayCaps.platformWidth){
                photo_width = Ti.Platform.displayCaps.platformWidth;
            }
            else{
                photo_width = data[i].photo.width;
            }

            if (data[i].photo.height && data[i].photo.height > max_height){
                if (data[i].photo.height > data[i].photo.width){
                    photo_height = max_height;
                    photo_width = photo_height * (data[i].photo.width / data[i].photo.height);
                }
                else{
                    photo_height = photo_width * (data[i].photo.height / data[i].photo.width);
                }
            }
            else{
                photo_height = max_height;
            }
            highres = true;
        }
        else{
            if (photo_width < 320){
                photo_width = data[i].photo.width;
            }
            else{
                photo_width = 320
            }

            if (data[i].photo.height && data[i].photo.height > max_height){
                photo_width = max_height * (data[i].photo.width / data[i].photo.height);
                photo_height = photo_width * (data[i].photo.height / data[i].photo.width);
            }
            else{
                photo_height = max_height;
            }
            highres = false;
        }
        
        row = Ti.UI.createTableViewRow({
                className: 'nom_img',
                height: photo_height,
                width: photo_width,
                selectionStyle: Titanium.UI.iPhone.TableViewCellSelectionStyle.NONE
        });

        main_image = Ti.UI.createImageView({
            // image: nom.photo.source,
    		image: '../../images/photo_loader.png',
    		width: photo_width,
    		height: photo_height,
    		hires: true
    	});
    	cachedImageView('images', nom.photo.source, main_image);
    	
    	if (nom.won){
    	    main_image.nom_id = nom.id;
        	main_image.photo = nom.photo;
        	main_image.cat = nom.nomination_category.replace(' ', '-');
        	main_image.state = 'profile_winners';
        	
        	main_image.addEventListener('click', add_detail_trophy_window);
    	}
    	else{
    	    main_image.nom_id = nom.id;
        	main_image.photo = nom.photo;
        	main_image.cat = nom.nomination_category.replace(' ', '-');
        	main_image.state = 'profile_active';
        	main_image.addEventListener('click', add_detail_window);
    	}
    	row.add(main_image);

        nominator_footer = Titanium.UI.createView({
            height:35,
            bottom: 0,
            width: 320,
            zIndex: 1
        });
                
        nominator_footer_background = Titanium.UI.createView({
            height: 35,
            width: 320,
            opacity: 0.8,
            backgroundColor: '#000',
            zIndex: -1
        });
        nominator_footer.add(nominator_footer_background);
        
        caption_text = 'No caption provided';
        if (nom.caption){
            caption_text = nom.caption;
        }
        caption = Titanium.UI.createLabel({
            text: caption_text,
            color: '#fff',
            width: 300,
            height: 35,
            font:{fontSize:14}
        });
        nominator_footer.add(caption);
        
        if (nom.tagged_users.length > 0){
            tagged_cont = Titanium.UI.createView({
                height: 30,
                width: 'auto',
                right: 3,
            });
            tagged_label = Titanium.UI.createLabel({
                text: nom.tagged_users.length + ' Tagged',
                textAlign: 'left',
                color: '#fff',
                left: 8,
                right: 35,
                font:{fontSize: 13, fontWeight: 'bold'},
                size: {width: 'auto', height: 35}
            });
            tagged_label.tags = nom.tagged_users;
            tagged_cont.add(tagged_label);
        
            disclosure = Titanium.UI.createButton({
                style:Titanium.UI.iPhone.SystemButton.DISCLOSURE,
                right: 0
            });
            disclosure.tags = nom.tagged_users;
            tagged_cont.add(disclosure);
        
            tagged_cont.tags = nom.tagged_users;
            tagged_cont.addEventListener('click', show_tags);
            
            nominator_footer.add(tagged_cont);
        }
        
        row.add(nominator_footer);
        
        time = new Date(nom.created_time * 1000);
        time_diff = now - time;
        time_diff /= 1000;
        post_time = Titanium.UI.createLabel({
    	    text: secondsToHms(time_diff),
            color: '#fff',
            left: 5,
            top: 5,
            right: 5,
            bottom: 5,
            size: {width: 'auto', height: 20},
            font:{fontSize:12}
        });
        
        post_time_background = Titanium.UI.createView({
            backgroundColor: '#000',
            // borderRadius: 5,
            opacity: 0.8,
            height: 20,
            width: '100%',
            zIndex: -1
        });
        
        post_time_cont = Titanium.UI.createView({
            right: 5,
            bottom: 40,
            height: 20,
            width: 'auto',
            zIndex: 1
        });
        
        post_time_cont.add(post_time_background);
        post_time_cont.add(post_time);
        row.add(post_time_cont);
        section.add(row);
        
        row = Ti.UI.createTableViewRow({
                className: 'nom_footer',
                height:'auto',
                selectionStyle: Titanium.UI.iPhone.TableViewCellSelectionStyle.NONE
        });
        
        photo_action_cont = Titanium.UI.createView({
            width: 320,
            height: 'auto',
            bottom: 10,
            layout: 'vertical'
        });
        
        photo_action_row = Titanium.UI.createView({
            backgroundColor: '#fff',
            top: 0,
            width: 320,
            height: 35
        });
        
        comments_cont = Titanium.UI.createView({
                backgroundColor: '#fff',
                height: 'auto',
                top: 0,
                width: 320,
                layout: 'vertical'
            });
        
        add_comment = Ti.UI.createButton({
            backgroundImage: '../../images/stream_action_button.png',
            title:"Comment",
            width: 90,
            height: 25,
            left: 5,
            top: 5,
            bottom: 5,
            font: {fontSize: 12, fontWeight: 'bold'}
        });
        add_comment.nom_id = nom.id;
        add_comment.comment_cont = comments_cont;
        add_comment.comments = nom.quick_comments;
        add_comment.action_cont = photo_action_cont;
        add_comment.addEventListener('click', add_comment_to_nom);
        
        nom_detail_button = Ti.UI.createButton({
    	    backgroundImage: '../../images/stream_action_button.png',
        	title:"Detail",
        	width: 90,
        	height: 25,
            left: 105,
            top: 5,
            bottom: 5,
            font: {fontSize: 12, fontWeight: 'bold'}
        });
        if (nom.won){
    	    nom_detail_button.nom_id = nom.id;
        	nom_detail_button.photo = nom.photo;
        	nom_detail_button.cat = nom.nomination_category.replace(' ', '-');
        	nom_detail_button.state = 'profile_trophies';
        	nom_detail_button.nom_cat = nom.nomination_category;
        	
        	nom_detail_button.addEventListener('click', add_detail_trophy_window);
    	}
    	else{
            nom_detail_button.nom_id = nom.id;
            nom_detail_button.photo = nom.photo;
            nom_detail_button.cat = nom.nomination_category.replace(' ', '-');
            nom_detail_button.state = 'profile_active';
        	nom_detail_button.addEventListener('click', add_detail_window);
    	}
        
        photo_options = Ti.UI.createButton({
        	backgroundImage: '../../images/stream_option_button.png',
        	width: 25,
        	height: 25,
            right: 5,
            top: 5,
            bottom: 5
        });
        photo_options.nom = nom;
        photo_options.photo_id = nom.photo.id;
        photo_options.addEventListener('click', open_options);
        
        photo_action_row.add(add_comment);
        photo_action_row.add(nom_detail_button);
        photo_action_row.add(photo_options);
        
        photo_action_cont.add(photo_action_row);
        photo_action_cont.add(comments_cont);
        
        row.add(photo_action_cont);        
        render_comments(comments_cont, nom.quick_comments);
        
        if (nom.comment_count > nom.quick_comments.length){
            var load_more_comments = Titanium.UI.createLabel({
        	    text: nom.comment_count - nom.quick_comments.length + ' more comments',
                color: '#333',
                bottom: 5,
                size: {width: 320, height: 20},
                textAlign: 'center',
                font:{fontSize:14, fontWeight: 'bold'}
            });
            load_more_comments.nom_id = nom.id;
            load_more_comments.comment_cont = comments_cont;
            load_more_comments.parent = photo_action_cont;
            
            load_more_comments.addEventListener('click', function(e){
                var nom_id = e.source.nom_id;
                var comment_cont = e.source.comment_cont;
                // var parent = e.source.parent;
                
                var comments_loading = Titanium.UI.createActivityIndicator({
                    message: 'Loading...',
                    color: '#333',
                    height:50,
                    width:10,
                    style:Titanium.UI.iPhone.ActivityIndicatorStyle.DARK
                });
                comments_loading.show();
                
                comment_cont.remove(e.source);
                comment_cont.add(comments_loading);
                
                get_comments(nom_id, comment_cont, comments_loading);
            });
            comments_cont.add(load_more_comments);
        }
        
        photo_action_row_shadow = Titanium.UI.createView({
            backgroundImage: '../../images/action_bar_shadow.png',
            top: 35,
            width: 320,
            height: 8,
            zIndex: 100
        });
        row.add(photo_action_row_shadow);
        
        section.add(row);
        section.created_time = nom.created_time;

        active_data.push(section);
    }
    tv.setData(active_data);
}

function init_active_view(){
    if (active_noms_count > 0){
        if (active_noms_cache.length > 0){
            render_active_view(active_noms_cache);
        }
        else{
            var xhr = Titanium.Network.createHTTPClient();
            xhr.onload = function(){
            	data = JSON.parse(this.responseData);
        	    active_noms_cache = data.active_noms;
                render_active_view(active_noms_cache);
                window_activity_cont.hide();
            };
            var url = SERVER_URL + '/api/get_user_profile/?access_token=' + me.access_token + '&method=active&username=' + username + '&source=' + me.fid;
            xhr.open('GET', url);
            xhr.send();
            window_activity_cont.show();
            window_activity_timeout();
        }
    }
    else{
        var empty_label = Titanium.UI.createLabel({
            text: name.split(' ')[0] + ' has no active nominations.',
            color: '#eee',
            textAlign: 'center',
            font: {fontSize: 16, fontWeight: 'bold'}
        });
        var empty_label_cont = Titanium.UI.createView({
                height: 20,
                top: 100,
                width: 320,
            });
        empty_label_cont.add(empty_label);

        var row = Ti.UI.createTableViewRow({
                height:'auto',
                selectionStyle: Titanium.UI.iPhone.TableViewCellSelectionStyle.NONE
        });
        row.add(empty_label_cont);

        active_data = [row];
        tv.setData(active_data);
    } 
}

function activate_photos_view(){
    if (view_active != 'photos'){
        view_active = 'photos';
        photos_nav.backgroundImage = '../../images/profile_button_selected.png';
        trophies_nav.backgroundImage = '../../images/profile_button_unselected.png';
        active_nav.backgroundImage = '../../images/profile_button_unselected.png';
        
        
        if (list_view_data.length >= 10){
            load_more_view.show();
        }
        tv.setData(list_view_data);
    }
}

function activate_trophies_view(){
    if (view_active != 'trophies'){
        view_active = 'trophies';
        photos_nav.backgroundImage = '../../images/profile_button_unselected.png';
        trophies_nav.backgroundImage = '../../images/profile_button_selected.png';
        active_nav.backgroundImage = '../../images/profile_button_unselected.png';
        
        load_more_view.hide();
        tv.setData([]);
        init_trophies_view();
    }
}

function activate_active_view(){
    if (view_active != 'active'){
        view_active = 'active';   
        photos_nav.backgroundImage = '../../images/profile_button_unselected.png';
        trophies_nav.backgroundImage = '../../images/profile_button_unselected.png';
        active_nav.backgroundImage = '../../images/profile_button_selected.png';
        
        load_more_view.hide();
        tv.setData([]);
        init_active_view();
    }
}

function add_follow_window(e){
    var method = e.source.method;
    var w = Ti.UI.createWindow({backgroundColor:"#333", url:'follow.js'});
	Titanium.UI.currentTab.open(w,{animated:true});

	setTimeout(function(){
	    Ti.App.fireEvent('pass_user_follow', {
            user: user,
            name: name,
            method: method
        });
	}, 200);
}

function load_more_photos(e){
    var user_photo_request = Titanium.Network.createHTTPClient();
    
    load_more_button.hide();
    load_more_activity.show();

    user_photo_request.onload = function(){   
        var data = JSON.parse(this.responseData);
        if (data.photos.length > 0){
            render_user_photos(data.photos, true);
            if (data.photos.length >= 10){
                oldest_photo = data.photos[data.photos.length - 1].id;
            }
            else{
                load_more_view.hide();
            }
        }
        else{
            load_more_view.hide();
        }
        load_more_button.show();
        load_more_activity.hide();
    };
    var url = SERVER_URL + '/api/get_user_profile/?username=' + username + '&access_token=' + me.access_token + '&pid=' + oldest_photo + '&dir=old';
    user_photo_request.open('GET', url);

    // send the data
    user_photo_request.send();
}

var get_user_profile_count = 0;
var get_profile_data = 0;
var init_count = 0;

function init_profile_view(){
    var user_image = null;
    
    profile_header = Titanium.UI.createView({
        backgroundColor: '#333',
        color: '#fff',
        width: 320,
        height: 100,
        top: 0
    });
    
    var name_label = Titanium.UI.createLabel({
        text: name,
        color: '#fff',
        left: 100,
        bottom: 60,
        right: 5,
        font: {fontSize: 20, fontWeight: 'bold'},
        minimumFontSize: 12,
    });
    
    profile_header.add(name_label);
    
    load_more_view = Ti.UI.createView({
            height: 50,
            width: 320,
            backgroundColor:'#000'
    });

    load_more_button = Ti.UI.createButton({
    	title:"Load More",
        font: {fontSize: 16, fontWeight: 'bold'},
    	backgroundImage: '../../images/load_more_button.png',
    	width: 118,
    	height: 42,
    	bottom: 8,
    });

    load_more_button.addEventListener('click', load_more_photos);

    load_more_view.add(load_more_button);

    load_more_activity = Titanium.UI.createActivityIndicator({
        height:50,
        width:10,
    });
    load_more_activity.hide();
    load_more_view.add(load_more_activity);
    load_more_view.hide();

    tv = Ti.UI.createTableView({
            backgroundColor: '#000',
            separatorStyle: 0,
            top: 40,
            headerView: profile_header,
            footerView: load_more_view,
            style: Titanium.UI.iPhone.TableViewStyle.PLAIN
        });
        
    tv.addEventListener('click', function(e){

    });
    
    win.add(tv);
    
    if (get_user_profile_count == 0){
        var xhr = Titanium.Network.createHTTPClient();
        
        // user_image = Ti.UI.createImageView({
        //     image: '../../images/photo_loader.png',
        //     left: 10,
        //     top: 10,
        //     hires: true,
        //     height: 80,
        //     width: 80
        // });
        // profile_header.add(user_image);

        xhr.onload = function(){   
            // profile_header.remove(user_image);
            user_image = Ti.UI.createImageView({
                image: this.location,
                defaultImage: '../../images/photo_loader.png',
                left: 10,
                top: 10,
                hires: true,
                height: 80,
                width: 80
            });
            cachedImageView('profile_images', this.location, user_image);
            cropImage(user_image,150,150,20,20);

            profile_header.add(user_image);
        };

        var url = 'https://graph.facebook.com/' + user + '/picture?type=large';
        xhr.open('GET', url);

        // send the data
        xhr.send();
        get_user_profile_count += 1;
    }
    
    follow_cont = Titanium.UI.createView({
        backgroundColor: '#fff',
        // borderRadius: 3,
        width: 210,
        height: 30,
        left: 100,
        top: 35
    });
    
    var followers_label = Titanium.UI.createLabel({
        text: 'Followers',
        color: '#333',
        left: 5,
        font: {fontSize: 13}
    });
    
    var followers_right_triangle = Ti.UI.createImageView({
        image: '../../images/right_triangle.png',
        defaultImage: '../../images/photo_loader.png',
        right: 143,
        top: 12,
        hires: true,
        height: 7,
        width: 3
    });
    
    followers_label.add(followers_right_triangle);
    
    followers_label.method = 'followers'
    followers_label.removeEventListener('click', add_follow_window);
    followers_label.addEventListener('click', add_follow_window);
    
    var following_label = Titanium.UI.createLabel({
        text: 'Following',
        color: '#333',
        left: 110,
        font: {fontSize: 13}
    });
    
    var following_right_triangle = Ti.UI.createImageView({
        image: '../../images/right_triangle.png',
        defaultImage: '../../images/photo_loader.png',
        right: 38,
        top: 12,
        hires: true,
        height: 7,
        width: 3
    });
    
    following_label.add(following_right_triangle);
    
    following_label.method = 'following'
    following_label.removeEventListener('click', add_follow_window);
    following_label.addEventListener('click', add_follow_window);
    
    var right_follow_border = Titanium.UI.createView({
        backgroundColor: '#dedede',
        width: 1,
        height: 30,
        left: 105
    });
    
    follow_cont.add(followers_label);
    follow_cont.add(following_label);
    follow_cont.add(right_follow_border);
    
    profile_header.add(follow_cont);

    profile_nav_cont = Titanium.UI.createView({
        width: 210,
        height: 30,
        left: 100,
        bottom: 0
    });
    
    photos_nav = Titanium.UI.createView({
        backgroundImage: '../../images/profile_button_selected.png',
        width: 64,
        height: 25,
        left: 0,
        bottom: 0
    });
    var photos_nav_label = Titanium.UI.createLabel({
        text: 'Photos',
        color: '#333',
        textAlign: 'center',
        font: {fontSize: 14}
    });
    photos_nav_label.addEventListener('click', function(){
        activate_photos_view();
    });
    photos_nav.add(photos_nav_label);
    
    trophies_nav = Titanium.UI.createView({
        backgroundImage: '../../images/profile_button_unselected.png',
        width: 64,
        height: 25,
        left: 73,
        bottom: 0
    });
    var trophies_nav_label = Titanium.UI.createLabel({
        text: 'Trophies',
        color: '#333',
        textAlign: 'center',
        font: {fontSize: 14}
    });
    trophies_nav_label.addEventListener('click', function(){
        activate_trophies_view();
    });
    trophies_nav.add(trophies_nav_label);
    
    active_nav = Titanium.UI.createView({
        backgroundImage: '../../images/profile_button_unselected.png',
        width: 64,
        height: 25,
        left: 146,
        bottom: 0
    });
    var active_nav_label = Titanium.UI.createLabel({
        text: 'Active',
        color: '#333',
        textAlign: 'center',
        font: {fontSize: 14}
    });
    active_nav_label.addEventListener('click', function(){
        activate_active_view();
    });
    active_nav.add(active_nav_label);
    
    profile_nav_cont.add(photos_nav);
    profile_nav_cont.add(trophies_nav);
    profile_nav_cont.add(active_nav);
    
    profile_header.add(profile_nav_cont);
    
    if (get_profile_data == 0){
        window_activity_cont.show();
        window_activity_timeout();
        var user_profile_request = Titanium.Network.createHTTPClient();
        user_profile_request.onload = function(){   
            var data = JSON.parse(this.responseData);
            active_noms_count = data.active_noms_count;
            
            if (data.photos.length > 0){
                render_user_photos(data.photos);
                if (data.photos.length >= 10){
                    newest_photo = data.photos[0].id;
                    oldest_photo = data.photos[data.photos.length - 1].id;
                    load_more_view.show();
                }
            }
            else{
                var empty_label = Titanium.UI.createLabel({
                    text: name.split(' ')[0] + ' has not taken any photos.',
                    color: '#eee',
                    textAlign: 'center',
                    font: {fontSize: 16, fontWeight: 'bold'}
                });
                var empty_label_cont = Titanium.UI.createView({
                        height: 20,
                        top: 100,
                        width: 320,
                    });
                empty_label_cont.add(empty_label);

                var row = Ti.UI.createTableViewRow({
                        height:'auto',
                        selectionStyle: Titanium.UI.iPhone.TableViewCellSelectionStyle.NONE
                });
                row.add(empty_label_cont);

                list_view_data = [row];
                tv.setData(list_view_data);
            }
            
            if (user != me.fid){
                //Follow user button
                var follow_user_text = '';
                var follow_user_button = '';
                if (data.follow){
                    follow_user_text = 'following';
                    follow_user_button = '../../images/profile_unfollow.png';
                }
                else{
                    follow_user_text = 'follow';
                    follow_user_button = '../../images/profile_follow.png';
                }

                follow_button = Titanium.UI.createButton({
                    width: 88,
                    height: 25,
                    left: 6,
                    bottom: 0,
                    title: follow_user_text,
                    font: {fontSize: 12, fontWeight: 'bold'},
                    backgroundImage: follow_user_button,
                    zIndex: 2
                });
                
                if (data.follow){
                    follow_button.method = 'unfollow';
                }
                else{
                    follow_button.method = 'follow';
                }

                follow_button.parent_cont = profile_header;
                follow_button.button = true;
                follow_button.user_fid = user;
                follow_button.username = username;
                follow_button.addEventListener('click', follow_event);
                profile_header.add(follow_button);
            }

            //Set follow counts
            var follow_data = data.follow_counts;
            var follow_count = Titanium.UI.createLabel({
                text: follow_data.followers,
                color: '#333',
                left: 80,
                font: {fontSize: 18, fontWeight: 'bold'}
            });

            var following_count = Titanium.UI.createLabel({
                text: follow_data.following,
                color: '#333',
                left: 184,
                font: {fontSize: 18, fontWeight: 'bold'}
            });

            follow_cont.add(follow_count);
            follow_cont.add(following_count);

            if (active_noms_count > 0){
                render_active_count(active_noms_count);
            }
            if (data.trophy_count > 0){
                render_trophy_count(data.trophy_count);
            }
            
            window_activity_cont.hide();
        };
        var url = SERVER_URL + '/api/get_user_profile/?username=' + username + '&access_token=' + me.access_token;
        user_profile_request.open('GET', url);
        user_profile_request.send();   
    }
    
    // Titanium.Facebook.requestWithGraphPath(String(user), {}, 'GET', function(e) {
    //     if (e.success) {
    //         alert(e.result);
    //     } else if (e.error) {
    //         alert(e.error);
    //     } else {
    //         alert('Unknown response');
    //     }
    // });
}