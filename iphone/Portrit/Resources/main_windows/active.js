var win = Ti.UI.currentWindow;

var portrit_header_view = Titanium.UI.createView({
        height: 75,
        left: 0,
        top: 0,
        width: 320,
        backgroundColor: '#222',
        zIndex: 10
    });
    
var header_tab_selection = Titanium.UI.createView({
        height: 36,
        left: 105,
        top: 39,
        width: 110,
        backgroundImage: '../images/selected_nav_bar.png',
        zIndex: 1
    });
        
var portrit_header_active = Titanium.UI.createView({
        height: 35,
        left: 105,
        top: 40,
        width: 105,
        backgroundImage: '../images/stream_nav_bar_unselected.png'
    });
    
var portrit_header_active_label = Titanium.UI.createLabel({
        text: 'Active', 
        color: '#fff',
        textAlign: 'center',
        font:{fontSize:16, fontWeight:'bold'},
        height: 35,
        left: 105,
        top: 40,
        width: 105,
        zIndex: 2
    });
    
var fadeIn = Titanium.UI.createAnimation({
    curve: Ti.UI.ANIMATION_CURVE_EASE_IN,
    opacity: 1.0,
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
window_activity_cont.hide();
window_activity_cont.add(window_activity_background);
window_activity_cont.add(window_activity);
win.add(window_activity_cont);

function window_activity_timeout(){
    setTimeout(function(){
        window_activity_cont.hide();
    }, 2000);
}

var empty_row = Ti.UI.createTableViewRow({
        height: 20,
        selectionStyle: Titanium.UI.iPhone.TableViewCellSelectionStyle.NONE
});

var active_empty_label = Titanium.UI.createLabel({
    text: 'No Active Nominations',
    color: '#fff',
    width: 320,
    height: 20,
    top: 150,
    textAlign: 'center',
    font: {fontSize: 20, fontWeight: 'bold'},
    zIndex: 10
});
active_empty_label.hide();
empty_row.add(active_empty_label);

var photos_empty_label = Titanium.UI.createLabel({
    text: 'No Stream Photos',
    color: '#fff',
    width: 320,
    height: 20,
    top: 150,
    textAlign: 'center',
    font: {fontSize: 20, fontWeight: 'bold'},
    zIndex: 10
});
photos_empty_label.hide();
empty_row.add(photos_empty_label);

var winners_empty_label = Titanium.UI.createLabel({
    text: 'No Recent Winners',
    color: '#fff',
    width: 'auto',
    height: 'auto',
    top: 150,
    font: {fontSize: 20, fontWeight: 'bold'},
    zIndex: 10
});
winners_empty_label.hide();
empty_row.add(winners_empty_label);

portrit_header_active.addEventListener('click', function(){
    if (selected_tab != 'active'){
        selected_tab = 'active';
        
        var header_active_tab_matrix = Ti.UI.create2DMatrix();
        header_active_tab_matrix = header_active_tab_matrix.translate(0,0);
        
        var header_active_tab_animation = Titanium.UI.createAnimation();
        header_active_tab_animation.transform = header_active_tab_matrix;
        header_active_tab_animation.duration = 200;
        
    	header_tab_selection.animate(header_active_tab_animation);
        
        load_more_view.hide();
        tv.setData([]);
        activate_active_view();
    }
});
    
var portrit_header_top = Titanium.UI.createView({
        height: 35,
        left: 0,
        top: 40,
        width: 105,
        backgroundImage: '../images/stream_nav_bar_unselected.png'
    });
    
var portrit_header_top_label = Titanium.UI.createLabel({
        text: 'Photos', 
        color: '#fff',
        textAlign: 'center',
        font:{fontSize:16, fontWeight:'bold'},
        height: 35,
        left: 0,
        top: 40,
        width: 105,
        zIndex: 2
    });

portrit_header_top.addEventListener('click', function(){
    if (selected_tab != 'photos'){
        selected_tab = 'photos';
    	
    	var header_active_tab_matrix = Ti.UI.create2DMatrix();
        header_active_tab_matrix = header_active_tab_matrix.translate(-105,0);
        
        var header_active_tab_animation = Titanium.UI.createAnimation();
        header_active_tab_animation.transform = header_active_tab_matrix;
        header_active_tab_animation.duration = 200;
        
    	header_tab_selection.animate(header_active_tab_animation);
        
        load_more_view.hide();
        tv.setData([]);
        activate_photo_stream();
    }
});
        
var portrit_header_winners = Titanium.UI.createView({
        height: 35,
        left: 210,
        top: 40,
        width: 110,
        backgroundImage: '../images/winner_nav_bar_unselected.png'
    });
    
var portrit_header_winners_label = Titanium.UI.createLabel({
        text: 'Winners', 
        color: '#fff',
        textAlign: 'center',
        font:{fontSize:16, fontWeight:'bold'},
        height: 35,
        left: 210,
        top: 40,
        width: 110,
        zIndex: 2
    });
    
portrit_header_winners.add(portrit_header_winners_label);
        
portrit_header_winners.addEventListener('click', function(){
    if (selected_tab != 'winners'){
        selected_tab = 'winners';
    	
    	var header_active_tab_matrix = Ti.UI.create2DMatrix();
        header_active_tab_matrix = header_active_tab_matrix.translate(105,0);
        
        var header_active_tab_animation = Titanium.UI.createAnimation();
        header_active_tab_animation.transform = header_active_tab_matrix;
        header_active_tab_animation.duration = 200;
        
    	header_tab_selection.animate(header_active_tab_animation);
    	
    	load_more_view.hide();
    	tv.setData([]);
        activate_winners_stream();
    }
});
    
var portrit_label = Titanium.UI.createLabel({
        backgroundImage: '../images/iphone_header.png',
        color: '#fff',
        textAlign: 'center',
        top: 0,
        width: 320,
        height: 40,
        font:{fontSize:28}
    });

portrit_header_view.add(portrit_label);

portrit_header_view.add(portrit_header_active);
portrit_header_view.add(portrit_header_active_label);

portrit_header_view.add(portrit_header_top);
portrit_header_view.add(portrit_header_top_label);

portrit_header_view.add(portrit_header_winners);
portrit_header_view.add(portrit_header_winners_label);

portrit_header_view.add(header_tab_selection);

Ti.include('../settings.js');
Ti.include('../includes.js');

var me = JSON.parse(Ti.App.Properties.getString("me"));
var list_view_data = [ ];
var active_noms_cache = [ ];
var photos_cache = [ ];
var winners_noms_cache = [ ];
var notification_count = 0;
var globals_attached = false;
var newest_nom = '';
var oldest_nom = '';
var selected_tab = 'active';
var countdown_interval = null;

function load_more_noms(e){
    var xhr = Titanium.Network.createHTTPClient();
    
    load_more_button.hide();
    load_more_activity.show();
    

    xhr.onload = function(){
    	var data = JSON.parse(this.responseData);
        now = new Date();
        
        if (data.length > 0){
            if (selected_tab == 'photos'){
                for (var i = 0; i < data.length; i++){
                    photos_cache.push(data[i]);
                }
                list_view_data = [ ];
                render_stream_photos(data, true);
                oldest_photo = data[data.length - 1].photo.id;
            }
            else if (selected_tab == 'active'){
                oldest_nom = data[data.length - 1].id;
                for (var i = 0; i < data.length; i++){
                    render_nom(data[i], false);
                }
                tv.setData(list_view_data);
            }
            else if (selected_tab == 'winners'){
                oldest_nom = data[data.length - 1].id;
                for (var i = 0; i < data.length; i++){
                    render_nom(data[i], false);
                }
                tv.setData(list_view_data);
            }
            if (data.length < 10 && selected_tab != 'photos'){
                load_more_view.hide();
            }
            else if (data.length < 15 && selected_tab == 'photos'){
                load_more_view.hide();
            }
        }
        else{
            load_more_view.hide();
        }
        load_more_button.show();
        load_more_activity.hide();
    };

    var url = '';
    if (selected_tab == 'photos'){
        url = SERVER_URL + '/api/get_user_stream_photos/?access_token=' + me.access_token + '&pid=' + oldest_photo;
    }
    else if (selected_tab == 'active'){
        url = SERVER_URL + '/api/get_recent_stream/?access_token=' + me.access_token + '&id=' + oldest_nom + '&dir=old';
    }
    else if (selected_tab == 'winners'){
        url = SERVER_URL + '/api/get_winners_stream/?access_token=' + me.access_token + '&id=' + oldest_nom + '&dir=old';
    }
    xhr.open('GET', url);

    // send the data
    xhr.send();
}

var load_more_view = Ti.UI.createView({
        height: 50,
        width: 320,
        backgroundColor:'#000'
});

var load_more_button = Ti.UI.createButton({
	title:"Load More",
    font: {fontSize: 16, fontWeight: 'bold'},
	backgroundImage: '../images/load_more_button.png',
	width: 118,
	height: 42,
	bottom: 8,
});

load_more_button.addEventListener('click', load_more_noms);

load_more_view.add(load_more_button);

var load_more_activity = Titanium.UI.createActivityIndicator({
    height:50,
    width:10,
});
load_more_activity.hide();
load_more_view.add(load_more_activity);

load_more_view.hide();

var tv = Ti.UI.createTableView({
            backgroundColor: '#000',
            separatorStyle: 0,
            headerView: portrit_header_view,
            footerView: load_more_view,
            style: Titanium.UI.iPhone.TableViewStyle.PLAIN
        });

function render_active_list_view(data){
    list_view_data = [ ];
    now = new Date();
    if (data.length > 0){
        newest_nom = data[0].created_time;
        oldest_nom = data[data.length - 1].id;
        for (var i = 0; i < data.length; i++){
            render_nom(data[i], false);
        }
        if (data.length == 10){
            setTimeout(function(){
                load_more_view.show();
            }, 300);
        }
    }
    else{
        load_more_view.hide();
    }
    tv.setData(list_view_data);
}

// function render_active_list_update(data){
//     var append_row_count = 0;
//     if (data.length > 0){
//         newest_nom = data[0].created_time;
//         for (var i = 0; i < data.length; i++){
//             render_nom(data[i], true, append_row_count);
//             append_row_count += 1;
//         }
//         if (list_view_data.length > 10){
//             var temp_list_data = [ ];
//             for (i = 0; i < 10; i++){
//                 temp_list_data.push(list_view_data[i]);
//             }
//             list_view_data = temp_list_data;
//             oldest_nom = list_view_data[list_view_data.length - 1].id;
//         }
//         tv.setData(list_view_data);
//     }
//     else{
//         
//     }
// }

function add_profile_window(e){
    var w = Ti.UI.createWindow({backgroundColor:"#222", url:'user/profile.js'});
	Titanium.UI.currentTab.open(w,{animated:true});
	setTimeout(function(){
	    Ti.App.fireEvent('pass_user', {
            user: e.source.user,
            name: e.source.name,
            username: e.source.username
        });
	}, 200);
}

function add_detail_window(e){
    var w = Ti.UI.createWindow({backgroundColor:"#222", url:'nom/detail.js'});
	Titanium.UI.currentTab.open(w,{animated:true});
	
	setTimeout(function(){
	    Ti.App.fireEvent('pass_detail', {
            nom_id: e.source.nom_id,
            photo: e.source.photo,
            state: e.source.state,
            cat: e.source.cat,
            user: me.username,
            won: false
        });
	}, 200);
}

function add_detail_trophy_window(e){
    var w = Ti.UI.createWindow({backgroundColor:"#333", url:'nom/detail.js'});
	Titanium.UI.currentTab.open(w,{animated:true});
	
	setTimeout(function(){
	    Ti.App.fireEvent('pass_detail', {
            nom_id: e.source.nom_id,
            photo: e.source.photo,
            nom_cat: e.source.nom_cat,
            state: e.source.state,
            cat: e.source.cat,
            user: me.username,
            won: true
        });
	}, 200);
}

function show_tags(e){
    var w = Ti.UI.createWindow({backgroundColor:"#ddd", url:'nom/tags.js'});
	Titanium.UI.currentTab.open(w,{animated:true});
	
	setTimeout(function(){
	    Ti.App.fireEvent('pass_tags', {
            tags: e.source.tags
        });
	}, 200);
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
        curve: Ti.UI.ANIMATION_CURVE_EASE_IN,
        opacity: 1,
        transform: t1,
        duration: 350
    });
    
    var t2 = Titanium.UI.create2DMatrix();
	t2 = t2.scale(.45);
    var fadeOut = Titanium.UI.createAnimation({
        curve: Ti.UI.ANIMATION_CURVE_EASE_OUT,
        opacity: 0,
        transform: t2,
        duration: 350
    });
    
    var post_button = Titanium.UI.createButton({
	    backgroundImage: '../images/comment_post_button.png',
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
	    backgroundImage: '../images/comment_cancel_button.png',
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
                layout: 'vertical'
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
        // Flag Photo
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

// function render_comments(cont, comments){
//     var comment_cont = null;
//     var commentor = null;
//     var commentor_cont = null;
//     var comment_time = null;
//     var comment = null;
//     var commentor_name_text = '';
//         
//     for (var i = 0; i < comments.length; i++){
//      if (comments[i].owner_id == me.fid){
//          commentor_name_text = 'You';
//      }
//      else{
//          commentor_name_text = comments[i].owner_username;
//      }
//         
//         commentor = Titanium.UI.createLabel({
//             text: commentor_name_text,
//             color: '#333',
//             top: 5,
//             bottom: 2,
//             left: 10,
//             width: 'auto',
//             height: 'auto',
//             font:{fontSize:13, fontWeight: 'bold'}
//         });
//         commentor.user = comments[i].owner_id;
//         commentor.name = comments[i].owner_name;
//         commentor.username = comments[i].owner_username;
//         commentor.addEventListener('click', add_profile_window);
//         cont.add(commentor);
// 
//         comment = Titanium.UI.createLabel({
//          text: '  - ' + comments[i].comment,
//             color: '#666',
//             top: -18,
//             left: 60,
//             width: 'auto',
//             height: 'auto',
//             font:{fontSize:13}
//         });
//         
//         cont.add(comment);
//     }
//     if (comments.length > 0){
//         photo_action_bottom_round = Titanium.UI.createView({
//             backgroundColor: '#fff',
//             height: 5,
//             width: 320
//         });
//         cont.add(photo_action_bottom_round); 
//     }
// }

var row = null;
var section = null;
var nom_cat_underscore = '';
var nom_cat_color = '';
var nominatee_profile_img_url = '';
var nominatee_profile_img = '';
var nominator_profile_img_url = '';
var nominator_profile_img = '';
var nominatee_name = '';
var nominator_name = '';
var nominatee_name_cont = null;
var now = new Date();
var time = null;
var time_diff = null;
var nominated_for = null;
var nominated_for_cont = null;
var nominator_footer = null;
var nom_detail_button = null;
var caption = null;
var caption_text = '';
var nomination_cat_label = null;
var photo_action_cont = null;
var photo_action_row = null;
var add_comment = null;
var comments_cont = null;
var photo_options = null;
var post_time = null;
var nom_header = null;
var main_image = null;
var photo_height = 0;
var photo_width = 0;
var highres = false;

function render_nom(nom, top, row_count){
    try{
        nom_cat_underscore = nom.nomination_category.replace(' ', '_').toLowerCase();
        nom_cat_color = get_nom_cat_color(nom_cat_underscore);

        nom_header = Titanium.UI.createView({
            backgroundColor: nom_cat_color,
            height: 30,
            width: 320,
        });  
        
        nominatee_profile_img_url = 'https://graph.facebook.com/' + nom.nominatee + '/picture?type=square';
        nominatee_profile_img = Ti.UI.createImageView({
            // image: nominatee_profile_img_url,
    		image: '../images/photo_loader.png',
    		left: 0,
    		top: 0,
    		height: 30,
    		width: 30,
    		hires: true
    	});
    	cachedImageView('profile_images', nominatee_profile_img_url, nominatee_profile_img);
    	
    	nom_header.add(nominatee_profile_img);
    	
    	var nominatee_name_text = '';
    	if (nom.nominatee == me.fid){
    	    nominatee_name_text = 'You';
    	}
    	else{
    	    nominatee_name_text = nom.nominatee_username;
    	}

    	nominatee_name = Titanium.UI.createLabel({
    	    text: nominatee_name_text,
            textAlign: 'left',
            color: '#fff',
            left: 0,
            height: 30,
            width: 280,
            font:{fontSize:16, fontWeight: 'bold'},
            zIndex: 2
        });
        
        nomination_cat_label = Titanium.UI.createLabel({
            text: nom.nomination_category,
            color: '#fff',
            right: 15,
            textAlign: "right",
            size: {width: 280, height: 30},
            font:{fontSize: 22, fontWeight:'bold'}
        });
        
        nominatee_name_cont = Titanium.UI.createView({
            height: 30,
            left: 40,
            width: 'auto',
            zIndex: 1
        });
        
        nominatee_name_cont.add(nominatee_name);
        
        nom_header.add(nomination_cat_label);
        nom_header.add(nominatee_name_cont);
        
        nominatee_profile_img.user = nom.nominatee;
        nominatee_profile_img.name = nom.nominatee_name;
        nominatee_profile_img.username = nom.nominatee_username;
        nominatee_profile_img.addEventListener('click', add_profile_window);
    	
    	nominatee_name.user = nom.nominatee;
    	nominatee_name.name = nom.nominatee_name;
    	nominatee_name.username = nom.nominatee_username;
    	nominatee_name.addEventListener('click', add_profile_window);

        //Add Header to row
        section = Titanium.UI.createTableViewSection({
            headerView: nom_header
        });
        
        var max_height = 320;
        if (Ti.Platform.displayCaps.density == 'high') {
            if (nom.photo.width > Ti.Platform.displayCaps.platformWidth){
                photo_width = Ti.Platform.displayCaps.platformWidth;
            }
            else{
                photo_width = nom.photo.width;
            }
        
            if (nom.photo.height && nom.photo.height > max_height){
                if (nom.photo.height > nom.photo.width){
                    photo_height = max_height;
                    photo_width = photo_height * (nom.photo.width / nom.photo.height);
                }
                else{
                    photo_height = photo_width * (nom.photo.height / nom.photo.width);
                }
            }
            else{
                photo_height = max_height;
            }
            highres = true;
        }
        else{
            if (photo_width < 320){
                photo_width = nom.photo.width;
            }
            else{
                photo_width = 320
            }
        
            if (nom.photo.height && nom.photo.height > max_height){
                photo_width = max_height * (nom.photo.width / nom.photo.height);
                photo_height = photo_width * (nom.photo.height / nom.photo.width);
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
    		image: '../images/photo_loader.png',
    		width: photo_width,
    		height: photo_height,
    		hires: true
    	});
    	cachedImageView('images', nom.photo.source, main_image);
    	
    	if (nom.won){
    	    main_image.nom_id = nom.id;
        	main_image.photo = nom.photo;
        	main_image.cat = nom.nomination_category.replace(' ', '-');
        	main_image.state = 'stream_winners';
        	
        	main_image.addEventListener('click', add_detail_trophy_window);
    	}
    	else{
    	    main_image.nom_id = nom.id;
        	main_image.photo = nom.photo;
        	main_image.cat = nom.nomination_category.replace(' ', '-');
        	main_image.state = 'stream_active';
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
            // left: 10,
            // right: 5,
            width: 300,
            height: 35,
            font:{fontSize:14}
        });
        nominator_footer.add(caption);
        
        // 
        // nominator_profile_img_url = 'https://graph.facebook.com/' + nom.nominator + '/picture?type=square';
        // nominator_profile_img = Ti.UI.createImageView({
        //     // image: nominator_profile_img_url,
        //     image: '../images/photo_loader.png',
        //     left: 0,
        //     hires: true,
        //     height: 35,
        //     width: 35
        // });
        // cachedImageView('profile_images', nominator_profile_img_url, nominator_profile_img);
        // 
        // nominator_profile_img.user = nom.nominator;
        // nominator_profile_img.name = nom.nominator_name;
        // nominator_profile_img.username = nom.nominator_username;
        // nominator_profile_img.addEventListener('click', add_profile_window);
        // 
        // nominator_footer.add(nominator_profile_img);
        // 
        // nominator_name_cont = Titanium.UI.createView({
        //     height: 20,
        //     width: 'auto',
        //     left: 40,
        //     zIndex: 1,
        //     layout: 'vertical'
        // });
        //         
        // nominated_by = Titanium.UI.createLabel({
        //     text: 'Nominated by ',
        //     color: '#fff',
        //     left: 0,
        //     width: 100,
        //     height: 12,
        //     top: -5,
        //     font:{fontSize:12}
        // });
        //         
        // var nominator_name_text = '';
        // if (nom.nominator == me.fid){
        //     nominator_name_text = 'You';
        // }
        // else{
        //     nominator_name_text = nom.nominator_username;
        // }
        //         
        // nominator_name = Titanium.UI.createLabel({
        //     text: nominator_name_text,
        //     color: '#fff',
        //     left: 0,
        //     top: 3,
        //     width: 'auto',
        //     height: 12,
        //     font:{fontSize:12, fontWeight: 'bold'}
        // });
        // nominator_name_cont.add(nominated_by);
        // nominator_name_cont.add(nominator_name);
        // 
        // nominator_footer.add(nominator_footer_background);
        // nominator_footer.add(nominator_name_cont);
        // 
        // nominator_name.user = nom.nominator;
        // nominator_name.name = nom.nominator_name;
        // nominator_name.username = nom.nominator_username;
        // nominator_name.addEventListener('click', add_profile_window);
        // 
        if (nom.tagged_users.length > 0){
            tagged_cont = Titanium.UI.createView({
                height: 'auto',
                width: 'auto',
                right: 3,
                zIndex: 10
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
            top: 0,
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
            backgroundImage: '../images/stream_action_button.png',
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
    	    backgroundImage: '../images/stream_action_button.png',
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
        	nom_detail_button.state = 'stream_winners';
        	nom_detail_button.nom_cat = nom.nomination_category;
        	
        	nom_detail_button.addEventListener('click', add_detail_trophy_window);
    	}
    	else{
            nom_detail_button.nom_id = nom.id;
            nom_detail_button.photo = nom.photo;
            nom_detail_button.cat = nom.nomination_category.replace(' ', '-');
            nom_detail_button.state = 'stream_active';
        	nom_detail_button.addEventListener('click', add_detail_window);
    	}
        
        photo_options = Ti.UI.createButton({
        	backgroundImage: '../images/stream_option_button.png',
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
            backgroundImage: '../images/action_bar_shadow.png',
            top: 35,
            width: 320,
            height: 8,
            zIndex: 100
        });
        row.add(photo_action_row_shadow);
        
        section.add(row);
        section.created_time = nom.created_time;

        list_view_data.push(section);
    }
    catch (err){
        // alert(err);
    }
}

function update_cache(cache, data, append){
    for (var i = 0; i < data.length; i++){
        if (!append){
            cache.splice(0, 0, data[i]);
        }
        else{
            cache.push(data[i]);
        }
    }
    
    if (cache.length > 10){
        var temp_cache = [ ];
        for (var i = 0; i < 10; i++){
            temp_cache.push(cache[i]);
        }
        cache = temp_cache;
    }
    return cache;
}

function activate_winners_stream(){
    list_view_data = [ ];
    if (winners_noms_cache.length == 0){
        window_activity_cont.show();
        window_activity_timeout();
        
        var xhr = Titanium.Network.createHTTPClient();
        xhr.onload = function(){
            var data = JSON.parse(this.responseData);
            winners_noms_cache = data;
            if (data.length > 0){
                render_active_list_view(winners_noms_cache);
            }
            else{
                active_empty_label.hide();
                photos_empty_label.hide();
                tv.setData([empty_row]);
                winners_empty_label.show();
            }
            window_activity_cont.hide();
        };

        var url = SERVER_URL + '/api/get_winners_stream/?access_token=' + me.access_token;
        xhr.open('GET', url);
        xhr.send();
    }
    else{
        render_active_list_view(winners_noms_cache);
    }
}

function render_stream_photos(data, append){
    var row = null,
        photo = null,
        row_count = 0,
        top_offset = 5,
        photo_in_row = 0;
        
    // if (typeof(append) != 'undefined'){
    //     top_offset = 0;
    // }
        
    for (var i = 0; i < data.length; i++){
        if (i % 3 == 0){
            row = Ti.UI.createTableViewRow({
                    height: 80,
                    backgroundColor:'#000',
                    selectionStyle: Titanium.UI.iPhone.TableViewCellSelectionStyle.NONE
            });
            if (typeof(append) == 'undefined'){
                list_view_data.push(row);
            }
            else{
                tv.appendRow(row);
            }
            
            if (i == 0 && typeof(append) != 'undefined'){
                var nom = new Date();  
                time = new Date(data[0].create_datetime * 1000);
                time_diff = now - time;
                time_diff /= 1000;
                post_time = Titanium.UI.createLabel({
            	    text: secondsToHms(time_diff),
                    color: '#fff',
                    left: 5,
                    right: 5,
                    bottom: 4,
                    top: 4,
                    textAlign: 'left',
                    size: {width: 'auto', height: 20},
                    font:{fontSize: 13}
                });

                // post_time_background = Titanium.UI.createView({
                //     backgroundColor: '#000',
                //     // borderRadius: 5,
                //     opacity: 0.8,
                //     height: 20,
                //     width: '100%',
                //     zIndex: -1
                // });

                post_time_cont = Titanium.UI.createView({
                    backgroundColor: '#000',
                    opacity: 0.8,
                    top: 0,
                    left: 5,
                    height: 24,
                    width: 'auto',
                    zIndex: 10
                });
                post_time_cont.add(post_time);

                row.add(post_time_cont);
            }
            
            if (i > 0){
                row_count += 1;
                photo_in_row = 0;
            }
        }
        
        photo = Ti.UI.createImageView({
            // image: data[i].photo.crop,
    		image: '../images/photo_loader.png',
    		left: (photo_in_row * 105) + 5,
    		top: top_offset,
    		width: 100,
    		height: 75,
    		hires: true
    	});
    	cachedImageView('images', data[i].photo.crop, photo);
    	photo.user = data[i].user_fid;
    	photo.name = data[i].name;
    	photo.username = data[i].username;
    	photo.addEventListener('click', add_profile_window);
    	
    	row.add(photo);
    	
    	photo_in_row += 1;
    }
    if (typeof(append) == 'undefined'){
        tv.setData(list_view_data);
    }
    // else{
    //     var nom = new Date();  
    //     time = new Date(data[0].created_time * 1000);
    //     time_diff = now - time;
    //     time_diff /= 1000;
    //     post_time = Titanium.UI.createLabel({
    //      text: secondsToHms(time_diff),
    //         color: '#fff',
    //         left: 5,
    //         top: 5,
    //         right: 5,
    //         bottom: 5,
    //         size: {width: 'auto', height: 20},
    //         font:{fontSize:12}
    //     });
    //     
    //     // post_time_background = Titanium.UI.createView({
    //     //     backgroundColor: '#000',
    //     //     // borderRadius: 5,
    //     //     opacity: 0.8,
    //     //     height: 20,
    //     //     width: '100%',
    //     //     zIndex: -1
    //     // });
    //     
    //     post_time_cont = Titanium.UI.createView({
    //         top: 5,
    //         right: 5,
    //         height: 20,
    //         width: 320,
    //         zIndex: 1
    //     });
    //     post_time_cont.add(post_time);
    //     
    //     row.add(post_time_cont);
    // }
    
    if (data.length % 15 == 0 & data.length > 0){
        // row.height = 90;
        load_more_view.show();
    }
}

var oldest_photo = null;
function activate_photo_stream(){
    list_view_data = [ ];
    
    if (photos_cache.length == 0){
        window_activity_cont.show();
        window_activity_timeout();
        var xhr = Titanium.Network.createHTTPClient();
        xhr.onload = function(){
            var data = JSON.parse(this.responseData);
            photos_cache = data;
            render_stream_photos(photos_cache);
            window_activity_cont.hide();
            
            if (data.length > 0){
                oldest_photo = data[data.length - 1].photo.id;
            }
            else{
                tv.setData([empty_row]);
                active_empty_label.hide();
                winners_empty_label.hide();
                photos_empty_label.show();
            }
        };

        var url = SERVER_URL + '/api/get_user_stream_photos/?access_token=' + me.access_token;
        xhr.open('GET', url);
        xhr.send();   
    }
    else{
        render_stream_photos(photos_cache);
    }
}

function activate_active_view(){
    list_view_data = [ ];
    
    if (active_noms_cache.length == 0){
        window_activity_cont.show();
        window_activity_timeout();
        var xhr = Titanium.Network.createHTTPClient();
        xhr.onload = function(){
            var data = JSON.parse(this.responseData);
            if (data.length > 0){
                render_active_list_view(active_noms_cache);
            }
            else{
                photos_empty_label.hide();
                winners_empty_label.hide();
                active_empty_label.show();
                
                tv.setData([empty_row]);
            }
            window_activity_cont.hide();
        };
        var url = SERVER_URL + '/api/get_recent_stream/?access_token=' + me.access_token;
        xhr.open('GET', url);
        xhr.send();
    }
    else{
        render_active_list_view(active_noms_cache);
    }
}

function init_active_view(){
    if (!globals_attached){
        win.hideNavBar({animated:false});
        win.add(tv);
    }
    else{
        var tabGroup = win.tabGroup;
	    tabGroup.tabs[3].badge = null;
    }
    
    window_activity_cont.show();
    window_activity_timeout();
    var xhr = Titanium.Network.createHTTPClient();
    xhr.onload = function(){
    	var data = JSON.parse(this.responseData);
    	notification_count = data.notification_count;
    	me.username = data.username;
        Ti.App.Properties.setString("me", JSON.stringify(me));
    	
    	if (notification_count > 0){
    	    var tabGroup = win.tabGroup;
    	    tabGroup.tabs[3].badge = notification_count;
        }
    	active_noms_cache = data.noms;
    	if (active_noms_cache.length > 0){
    	    render_active_list_view(active_noms_cache);
    	}
    	else{
    	    tv.setData([empty_row]);
            photos_empty_label.hide();
            winners_empty_label.hide();
            active_empty_label.show();
    	}
        
        setTimeout(function(){
            window_activity_cont.hide();
        }, 1000);
    };
    var url = SERVER_URL + '/init_app/?access_token=' + me.access_token + '&page_size=10';
    xhr.open('GET', url);
    xhr.send();
    
    tv.addEventListener('click', function(e){

    });
    
    // Pull to refresh
    if (!globals_attached){
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
         font:{fontSize:12}
        });
        var actInd = Titanium.UI.createActivityIndicator({
         left:20,
         bottom:13,
         width:30,
         height:30
        });
    
        tableHeader.add(arrow);
        tableHeader.add(statusLabel);
        // tableHeader.add(lastUpdatedLabel);
        tableHeader.add(actInd);
    
        tv.headerPullView = tableHeader;
    }
    
    var pulling = false;
    var reloading = false;
    
    function beginReloading(){
        var xhr = Titanium.Network.createHTTPClient();
    
        xhr.onload = function(){
         data = JSON.parse(this.responseData);
            if (selected_tab != 'photos'){
                list_view_data = [ ];
                if (selected_tab == 'active'){
                    active_noms_cache = data;
                    if (data.length == 0){
                        tv.setData([empty_row]);
                        photos_empty_label.hide();
                        winners_empty_label.hide();
                        active_empty_label.show();
                    }
                }
                else if (selected_tab == 'winners'){
                    winners_noms_cache = data;
                    if (data.length == 0){
                        tv.setData([empty_row]);
                        active_empty_label.hide();
                        photos_empty_label.hide();
                        winners_empty_label.show();
                    }
                }
                if (data.length > 0){
                    render_active_list_view(data);
                }
            }
            else{
                list_view_data = [ ];
                photos_cache = data;
                if (data.length > 0){
                    render_stream_photos(data);
                    oldest_photo = data[data.length - 1].photo.id;
                }
                else{
                    tv.setData([empty_row]);
                    tv.setData([empty_row]);
                    active_empty_label.hide();
                    winners_empty_label.hide();
                    photos_empty_label.show();
                }
            }
            endReloading();
        };
        
        var url = '';
        if (selected_tab == 'photos'){
            url = SERVER_URL + '/api/get_user_stream_photos/?access_token=' + me.access_token;
        }
        else if (selected_tab == 'winners'){
            url = SERVER_URL + '/api/get_winners_stream/?access_token=' + me.access_token;
        }
        else {
            url = SERVER_URL + '/api/get_recent_stream/?access_token=' + me.access_token;
        }
        xhr.open('GET', url);
        xhr.send();
    }
    
    function endReloading(){
     // when you're done, just reset
     tv.setContentInsets({top:0},{animated:true});
     reloading = false;
        // lastUpdatedLabel.text = "Last Updated: "+formatDate();
     statusLabel.text = "Pull down to update...";
     actInd.hide();
     arrow.show();
     window_activity_cont.hide();
    }
    
    if (!globals_attached){    
    
        var countdown_interval_set = false;
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
         if (offset < 0 && !countdown_interval_set){
             countdown_interval_set = true;
             clearInterval(countdown_interval);
             GetCount();
                countdown_interval = setInterval(GetCount, 1000);
         }
         else if (offset >= 0 && countdown_interval_set){
             countdown_interval_set = false;
             clearInterval(countdown_interval);
         }
        });
    
        tv.addEventListener('scrollEnd',function(e)
        {
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
    
        Ti.App.addEventListener('update_active_noms', function(eventData) {
            window_activity_cont.show();
            window_activity_timeout();
            if (selected_tab != 'active'){
                selected_tab = 'active';

                var header_active_tab_matrix = Ti.UI.create2DMatrix();
                header_active_tab_matrix = header_active_tab_matrix.translate(0,0);

                var header_active_tab_animation = Titanium.UI.createAnimation();
                header_active_tab_animation.transform = header_active_tab_matrix;
                header_active_tab_animation.duration = 0;

                header_tab_selection.animate(header_active_tab_animation);
            }
            beginReloading();
        });
    
        //Countdown
        var countdown = Ti.UI.createLabel({
         text:"",
         left:55,
         width:200,
         bottom:10,
         height:"auto",
         color:"#fff",
         textAlign:"center",
         font:{fontSize:14,fontWeight:"bold"}
        });
        tableHeader.add(countdown);
        
        var date = new Date();
        var month = date.getMonth();
        var todays_date = date.getDate();
        var todays_year = date.getFullYear();
        if (date.getHours() >= 23){
            dateFuture = new Date(todays_year,month,todays_date+1,23,0,0);
        }
        else{
            dateFuture = new Date(todays_year,month,todays_date,23,0,0);
        }
        tzOffset = -8;
        dx = dateFuture.toGMTString();
        dx = dx.substr(0,dx.length -3);
        tzCurrent=(dateFuture.getTimezoneOffset()/60)*-2;
        dateFuture.setTime(Date.parse(dx))
        dateFuture.setHours(dateFuture.getHours() + tzCurrent - tzOffset);
    
        function GetCount(){
         dateNow = new Date();                                   //grab current date
         amount = dateFuture.getTime() - dateNow.getTime();      //calc milliseconds between dates
         delete dateNow;
         // time is already past
         if(amount <= 1){
             var date = new Date();
             var month = date.getMonth();
                var todays_date = date.getDate();
                var todays_year = date.getFullYear();
                if (date.getHours() >= 23){
                    dateFuture = new Date(todays_year,month,todays_date+1,23,0,0);
                }
                else{
                    dateFuture = new Date(todays_year,month,todays_date,23,0,0);
                }
                tzOffset = -8;
                dx = dateFuture.toGMTString();
                dx = dx.substr(0,dx.length -3);
                tzCurrent=(dateFuture.getTimezoneOffset()/60)*-2;
                dateFuture.setTime(Date.parse(dx))
                dateFuture.setHours(dateFuture.getHours() + tzCurrent - tzOffset);
    
                // if ($('#winners_announced_cont').length == 0){
                //     $('#cont').prepend('<div id="winners_announced_cont"><h2>Winners are being calculated. Check back in a few minutes.</h2></div>')
                // }
         }
         days=0;hours=0;mins=0;secs=0;out="";
    
         amount = Math.floor(amount/1000);//kill the "milliseconds" so just secs
    
         days=Math.floor(amount/86400);//days
         amount=amount%86400;
    
         hours=Math.floor(amount/3600);//hours
         amount=amount%3600;
    
         mins=Math.floor(amount/60);//minutes
         amount=amount%60;
    
         secs=Math.floor(amount);//seconds
    
            // if(days != 0){out += days +":";}
         if(days != 0 || hours != 0){out += hours +"h:";}
         if(days != 0 || hours != 0 || mins != 0){out += mins +"m:";}
         out += secs + 's';
         countdown.text = 'Time remaining ' + out;
        }
        GetCount();
    }
    
    globals_attached = true;
}

init_active_view();

var reset = false;
var first_stream = Ti.App.Properties.getString("first_stream");
win.addEventListener('focus', function(){
    if (reset){
        reset = false;
        
        list_view_data = [ ];
        active_noms_cache = [ ];
        photos_cache = [ ];
        winners_noms_cache = [ ];

        me = JSON.parse(Ti.App.Properties.getString("me"));
        
        var header_active_tab_matrix = Ti.UI.create2DMatrix();
        header_active_tab_matrix = header_active_tab_matrix.translate(0,0);
        
        var header_active_tab_animation = Titanium.UI.createAnimation();
        header_active_tab_animation.transform = header_active_tab_matrix;
        
    	header_tab_selection.animate(header_active_tab_animation);

        selected_tab = 'active';
        init_active_view();
    }
    
    if (first_stream){
        first_stream = null;
        Ti.App.Properties.removeProperty("first_stream");
        
        function close_help_text(e){
            if (help_cont){
                help_cont.animate({
                    opacity: 0,
                    duration: 300,
                    curve: Ti.UI.ANIMATION_CURVE_EASE_OUT,
                    complete: function(){
                        win.remove(help_cont);
                    }
                });
                help_cont = null;
            }
        }
        
        var help_cont = Ti.UI.createView({
            width: 320,
            height: 90,
            bottom: 0,
            opacity: 0,
            zIndex: 101
        });
        
        var help_cont_background = Ti.UI.createView({
            backgroundColor: '#222',
            opacity: 0.8,
            width: 320,
            height: 90,
            zIndex: -1
        });
        help_cont.add(help_cont_background);
        
        var help_cont_header = Ti.UI.createLabel({
            text:"Stream",
            left:10,
            top: 10,
            width: 'auto',
            height: "auto",
            color: "#eee",
            textAlign: "left",
            font: {fontSize:18, fontWeight: 'bold'}
        });
        help_cont.add(help_cont_header);
        
        var help_cont_label = Ti.UI.createLabel({
            text:"Check out your friends photos, nominations, and trophies.",
            top: 35,
            left:10,
            right: 10,
            width: 300,
            height: "auto",
            color: "#eee",
            textAlign: "left",
            font: {fontSize:16}
        });
        help_cont.add(help_cont_label);
        
        win.add(help_cont);
        
        help_cont.animate({
            opacity: 1,
            duration: 300,
            curve: Ti.UI.ANIMATION_CURVE_EASE_IN
        });
        
        help_cont.addEventListener('click', close_help_text);
        setTimeout(close_help_text, 6500);
    } 
});

Ti.App.addEventListener('reset', function(eventData) {
    reset = true;
    
    tabGroup = win.tabGroup;
    tabGroup.setActiveTab(0);
});