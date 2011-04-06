Ti.include('../settings.js');
Ti.include('../includes.js');

var me = JSON.parse(Ti.App.Properties.getString("me")),
    win = Ti.UI.currentWindow;
    list_view_data = [ ],
    trophy_data = [ ],
    noms_loaded = { },
    photos_cache = [ ],
    active_cache = [ ],
    top_cache = [ ],
    newest_nom = null,
    oldest_nom = null,
    newest_photo = '',
    oldest_nom = '',
    selected_tab = 'active';
    
window_activity = Titanium.UI.createActivityIndicator({
    message: 'Loading...',
    color: '#fff',
    height:50,
    width:10
});
window_activity.show()

window_activity_background = Titanium.UI.createView({
    backgroundColor: '#000',
    borderRadius: 5,
    opacity: 0.8,
    height: '100%',
    width: '100%',
    zIndex: -1
});

window_activity_cont = Titanium.UI.createView({
    height: 'auto',
    top: 150,
    width: 120,
    height: 120,
    zIndex: 20
});
window_activity_cont.hide();
window_activity_cont.add(window_activity_background);
window_activity_cont.add(window_activity);
win.add(window_activity_cont);

var portrit_header_view = Titanium.UI.createView({
        height: 75,
        left: 0,
        top: 0,
        width: 320,
        backgroundColor: '#222'
    });
    
var header_tab_selection = Titanium.UI.createView({
        height: 35,
        left: 105,
        top: 40,
        width: 110,
        backgroundImage: '../images/selected_nav_bar.png',
        zIndex: 1
    });
        
var portrit_header_active = Titanium.UI.createView({
        height: 35,
        left: 0,
        top: 40,
        width: 105,
        backgroundImage: '../images/stream_nav_bar_unselected.png'
    });
    
var portrit_header_active_label = Titanium.UI.createLabel({
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

portrit_header_active.addEventListener('click', function(){
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
        activate_photos_stream();
        // load_more_view.hide();
        // tv.setData([]);
        // activate_active_view();
    }
});
    
var portrit_header_top = Titanium.UI.createView({
        height: 35,
        left: 105,
        top: 40,
        width: 105,
        backgroundImage: '../images/stream_nav_bar_unselected.png'
    });
    
var portrit_header_top_label = Titanium.UI.createLabel({
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

portrit_header_top.addEventListener('click', function(){
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
        activate_active_stream();
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
        text: 'Top',
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
    if (selected_tab != 'top'){
        selected_tab = 'top';
    	
    	var header_active_tab_matrix = Ti.UI.create2DMatrix();
        header_active_tab_matrix = header_active_tab_matrix.translate(105,0);
        
        var header_active_tab_animation = Titanium.UI.createAnimation();
        header_active_tab_animation.transform = header_active_tab_matrix;
        header_active_tab_animation.duration = 200;
        
    	header_tab_selection.animate(header_active_tab_animation);
    	
    	load_more_view.hide();
        tv.setData([]);
        activate_top_stream();
    }
});
    
var portrit_label = Titanium.UI.createLabel({
        text: 'Community',
        backgroundImage: '../images/iphone_header_blank.png',
        color: '#fff',
        textAlign: 'center',
        top: 0,
        width: 320,
        height: 40,
        font:{fontSize:22, fontWeight: 'bold'}
    });


portrit_header_view.add(portrit_label);

portrit_header_view.add(portrit_header_active);
portrit_header_view.add(portrit_header_active_label);

portrit_header_view.add(portrit_header_top);
portrit_header_view.add(portrit_header_top_label);

portrit_header_view.add(portrit_header_winners);
portrit_header_view.add(portrit_header_winners_label);

portrit_header_view.add(header_tab_selection);

function load_more_noms(e){
    var xhr = Titanium.Network.createHTTPClient();

    xhr.onload = function()
    {
    	var data = JSON.parse(this.responseData);

        oldest_nom = data[data.length - 1].created_time;
        for (var i = 0; i < data.length; i++){
            noms_loaded[data[i].id] = data[i];
            render_nom(data[i], false);
        }
        tv.setData(list_view_data);
    };

    var url = SERVER_URL + '/api/get_recent_stream/?fb_user=' + me.fid + '&created_date=' + oldest_nom;
    xhr.open('GET', url);

    // send the data
    xhr.send();
}

var load_more_view = Ti.UI.createView({
        height: 50,
        width: 'auto',
        backgroundColor:'#000'
});

var load_more_button = Ti.UI.createButton({
	title:"Load More",
	width:120,
	height:40,
	right: 135
});

load_more_button.addEventListener('click', load_more_noms);

load_more_view.add(load_more_button);
load_more_view.hide();

var tv = Ti.UI.createTableView({
            backgroundColor: '#000',
            // allowsSelection: false,
            separatorStyle: 0,
            headerView: portrit_header_view,
            footerView: load_more_view,
            style: Titanium.UI.iPhone.TableViewStyle.PLAIN
        });
        
        
function render_community_photos(data){
    var row = null,
        photo = null,
        row_count = 0,
        top_offset = 5,
        photo_in_row = 0;
    for (var i = 0; i < data.length; i++){
        if (i % 3 == 0){
            row = Ti.UI.createTableViewRow({
                    height: 80,
                    backgroundColor:'#000',
                    selectionStyle: Titanium.UI.iPhone.TableViewCellSelectionStyle.NONE
            });
            list_view_data.push(row);
            
            if (i > 0){
                row_count += 1;
                photo_in_row = 0;
            }
        }
        
        photo = Ti.UI.createImageView({
    		image: data[i].photo.crop,
    		defaultImage: '../images/photo_loader.png',
    		left: (photo_in_row * 105) + 5,
    		top: top_offset,
    		width: 100,
    		height: 75,
    		hires: true
    	});
    	photo.user = data[i].user_fid;
    	photo.name = data[i].name;
    	photo.username = data[i].username;
    	photo.addEventListener('click', add_profile_window);
    	
    	row.add(photo);
    	
    	photo_in_row += 1;
    }
    tv.setData(list_view_data);
}

function add_profile_window(e){
    var w = Ti.UI.createWindow({backgroundColor:"#222", url:'user/profile.js'});
	Titanium.UI.currentTab.open(w,{animated:true});
	
	setTimeout(function(){
	    Ti.App.fireEvent('pass_user', {
            user: e.source.user,
            name: e.source.name,
            username: e.source.username
        });
	}, 100);
}

function add_detail_window(e){
    var w = Ti.UI.createWindow({backgroundColor:"#222", url:'nom/detail.js'});
	Titanium.UI.currentTab.open(w,{animated:true});
	
	setTimeout(function(){
	    Ti.App.fireEvent('pass_detail', {
            nom_id: e.source.nom_id,
            photo: e.source.photo,
            state: e.source.state,
            cat, e.source.cat,
            won: false
        });
	}, 100);
}

function show_tags(e){
    var w = Ti.UI.createWindow({backgroundColor:"#ddd", url:'nom/tags.js'});
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
	
	setTimeout(function(){
	    comment_textarea.focus();
	}, 75);	
}

function open_options(e){
    var photo_id = e.source.photo_id;
    
    var optionsDialogOpts = {
    	options:['Flag photo', 'Cancel'],
    	destructive:0,
    	cancel:1,
    	title:'Photo options'
    };

    var dialog = Titanium.UI.createOptionDialog(optionsDialogOpts);
    
    dialog.addEventListener('click',function(e){
        
	});
	dialog.show();
}

function render_comments(cont, comments){
    var comment_cont = null,
        commentor = null,
        commentor_cont = null,
        comment_time = null,
        comment = null;
        
    for (var i = 0; i < comments.length; i++){
        comment_cont = Titanium.UI.createView({
            backgroundColor: '#fff',
            height: 'auto',
            width: 320,
            zIndex: 1
        });
        
        commentor_cont = Titanium.UI.createView({
            height: 'auto',
            top: 0,
            left: 0,
            width: 'auto'
        });
        
        var commentor_name_text = '';
    	if (comments[i].owner_id == me.fid){
    	    commentor_name_text = 'You';
    	}
    	else{
    	    commentor_name_text = comments[i].owner_name;
    	}
        
        commentor = Titanium.UI.createLabel({
    	    text: commentor_name_text,
            color: '#333',
            top: 2,
            bottom: 2,
            left: 10,
            width: 'auto',
            height: 'auto',
            font:{fontSize:12, fontWeight: 'bold'}
        });
        commentor.user = comments[i].owner_id;
        commentor.name = comments[i].owner_name;
        commentor.username = comments[i].owner_username;
        commentor.addEventListener('click', add_profile_window);
        
        commentor_cont.add(commentor);
        
        comment = Titanium.UI.createLabel({
    	    text: '  - ' + comments[i].comment,
            color: '#666',
            top: 2,
            left: commentor.width + 10,
            bottom: 2,
            width: 'auto',
            height: 'auto',
            font:{fontSize:12}
        });
        
        comment_cont.add(commentor_cont);
        comment_cont.add(comment);
        cont.add(comment_cont);
    }
    if (comments.length > 0){
        photo_action_bottom_round = Titanium.UI.createView({
                backgroundColor: '#fff',
                borderRadius: 5,
                height: 10,
                bottom: -5,
                width: 320,
                zIndex: -1
            });
    	comment_cont.add(photo_action_bottom_round); 
    }
    else{
        photo_action_bottom_round = Titanium.UI.createView({
                backgroundColor: '#ddd',
                borderRadius: 5,
                height: 10,
                top: -5,
                width: 320,
                zIndex: -1
            });
    	cont.add(photo_action_bottom_round);
    }
}

function render_top(data){
    var section = null,
        row = null,
        trophy_header = null,
        trophy_label = null,
        cat_color = '',
        cat_name_underscore = '';
        
    for (var i = 0; i < data.length; i++){
        cat_name_underscore = data[i].cat_name.replace(' ', '_').toLowerCase();
        cat_color = get_nom_cat_color(cat_name_underscore);
        
        trophy_header = Titanium.UI.createView({
                height: 30,
                width: 320
            });
            
        trophy_header_background = Titanium.UI.createView({
                backgroundColor: cat_color,
                opacity: 0.9,
                height: '100%',
                width: '100%'
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
            headerView: trophy_header
        });
        
        row = Ti.UI.createTableViewRow({
                height:'auto',
                selectionStyle: Titanium.UI.iPhone.TableViewCellSelectionStyle.NONE
        });
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
                }
            }

            photo_cont = Ti.UI.createImageView({
        		image: data[i].noms[j].photo.source,
        		defaultImage: '../images/photo_loader.png',
                top: 5,
        		left: (photo_in_row_count * 105) + 5,
        		width: 100,
        		height: 75,
        		hires: true
        	});
            
            photo_cont.nom_id = data[i].noms[j].id;
        	photo_cont.photo = data[i].noms[j].photo;
        	photo_cont.cat = data[i].noms[j].nomination_category.replace(' ', '-');
        	photo_cont.state = 'community_top';
        	photo_cont.addEventListener('click', add_detail_window);
        	
        	row.add(photo_cont);
        	photo_in_row_count += 1;
        }    
        
        section.add(row);
        trophy_data.push(section);
    }
    tv.setData(trophy_data);
}

function render_nom(nom, top, row_count){
    var row = null,
        section = null,
        nom_cat_underscore = '',
        nom_cat_color = '',
        nominatee_profile_img_url = '',
        nominatee_profile_img = '',
        nominator_profile_img_url = '',
        nominator_profile_img = '',
        nominatee_name = '',
        nominator_name = '',
        nominatee_name_cont = null,
        now = new Date(),
        time = null,
        time_diff = null,
        nominated_for = null,
        nominated_for_cont = null,
        nominator_footer = null,
        nom_detail_button = null,
        caption = null,
        nomination_cat_label = null,
        post_time = null,
        nom_header = null,
        main_image = null,
        photo_height = 0,
        photo_width = 0,
        highres = false;
    
        try{
            nom_cat_underscore = nom.nomination_category.replace(' ', '_').toLowerCase();
            nom_cat_color = get_nom_cat_color(nom_cat_underscore);

            nom_header = Ti.UI.createTableViewRow({
                    height: 30,
                    backgroundColor: nom_cat_color,
                    width: 320,
                    selectionStyle: Titanium.UI.iPhone.TableViewCellSelectionStyle.NONE
            });

            nominatee_profile_img_url = 'https://graph.facebook.com/' + nom.nominatee + '/picture?type=square';
            nominatee_profile_img = Ti.UI.createImageView({
        		image: nominatee_profile_img_url,
        		defaultImage: '../images/photo_loader.png',
        		left: 0,
        		top: 0,
        		height: 30,
        		width: 30,
        		hires: true,
        		zIndex: 1
        	});
        	nom_header.add(nominatee_profile_img);

        	nominatee_name = Titanium.UI.createLabel({
        	    text: nom.nominatee_username,
                textAlign: 'left',
                color: '#fff',
                left: 5,
                top: 7,
                right: 5,
                bottom: 7,
                height: 'auto',
                width: 'auto',
                font:{fontSize:14, fontWeight: 'bold'}
            });

            nomination_cat_label = Titanium.UI.createLabel({
                text: nom.nomination_category,
                color: '#fff',
                left: 0,
                top: 5,
                right: 15,
                bottom: 5,
                textAlign: 'right',
                size: {width: '100%', height: 'auto'},
                font:{fontSize: 20, fontWeight:'bold'}
            });

            nominatee_name_cont = Titanium.UI.createView({
                backgroundColor: '#222',
                borderRadius: 5,
                height: 20,
                left: 35,
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

            });
            section.add(nom_header);

            row = Ti.UI.createTableViewRow({
                    height:'auto',
                    backgroundColor:'#000',
                    selectionStyle: Titanium.UI.iPhone.TableViewCellSelectionStyle.NONE
            });
            
            nomination_wrap = Titanium.UI.createView({
                height: 75,
                bottom: 5,
                width: 320,
                zIndex: 1
            });
            row.add(nomination_wrap);

            nominator_profile_img_url = 'https://graph.facebook.com/' + nom.nominator + '/picture?type=square';

            photo_width = 100;
            photo_height = 75;
            
            if (nom.photo.width > Ti.Platform.displayCaps.platformWidth){
                highres = true;
            }

            main_image = Ti.UI.createImageView({
        		image: nom.photo.crop,
        		defaultImage: '../images/photo_loader.png',
        		top: 0,
        		left: 0,
        		width: photo_width,
        		height: photo_height,
        		hires: highres
        	});

        	main_image.nom_id = nom.id;
        	main_image.photo = nom.photo;
        	main_image.cat = nom.nomination_category.replace(' ', '-');
        	main_image.state = 'community_active';
        	main_image.addEventListener('click', add_detail_window);
        	nomination_wrap.add(main_image);
        	
        	caption_cont = Titanium.UI.createView({
        	    backgroundColor: '#eee',
                height: 45,
                top: 0,
                left: 100,
                width: 220,
                zIndex: 1
            });
            
            caption_text = 'No caption provided.';
            if (nom.caption){
                caption_text = nom.caption;
            }
            
            caption_text_label = Titanium.UI.createLabel({
                text: caption_text,
                color: '#333',
                width: 'auto',
                height: 'auto',
                font:{fontSize:14, fontWeight: 'bold'},
                minimumFontSize: 10
            });
            caption_cont.add(caption_text_label);
            nomination_wrap.add(caption_cont);
            
            bottom_cont = Titanium.UI.createView({
        	    backgroundColor: '#eee',
                height: 30,
                top: 45,
                left: 100,
                width: 220,
                zIndex: 1
            });
            nomination_wrap.add(bottom_cont);
            
            // comments_cont = Titanium.UI.createView({
            //              backgroundColor: '#dedede',
            //     height: 30,
            //     top: 0,
            //     left: 0,
            //     width: 95,
            //     zIndex: 1
            // });
            // bottom_cont.add(comments_cont);
            // 
            // comments_label = Titanium.UI.createLabel({
            //     text: 'Comments',
            //     color: '#333',
            //     width: 'auto',
            //     height: 'auto',
            //     left: 3,
            //     font:{fontSize:12, fontWeight: 'bold'}
            // });
            // comments_cont.add(comments_label);
            // 
            // comments_count_label = Titanium.UI.createLabel({
            //     text: nom.comment_count,
            //     color: '#333',
            //     width: 'auto',
            //     height: 'auto',
            //     right: 3,
            //     font:{fontSize:12, fontWeight: 'bold'}
            // });
            // comments_cont.add(comments_count_label);
            
            post_time_cont = Titanium.UI.createView({
                backgroundColor: '#bebebe',
                left: 0,
                top: 0,
                height: 30,
                width: 95,
                zIndex: 1
            });
            bottom_cont.add(post_time_cont);
            
            time = new Date(nom.created_time * 1000);
            time_diff = now - time;
            time_diff /= 1000;
            post_time = Titanium.UI.createLabel({
        	    text: secondsToHms(time_diff),
                color: '#333',
                left: 5,
                top: 5,
                right: 5,
                bottom: 5,
                size: {width: 'auto', height: 'auto'},
                font:{fontSize:12}
            });
            post_time_cont.add(post_time);
            
            votes_cont = Titanium.UI.createView({
        	    backgroundColor: '#aeaeae',
                height: 30,
                top: 0,
                left: 95,
                width: 95,
                zIndex: 1
            });
            bottom_cont.add(votes_cont);
            
            votes_label = Titanium.UI.createLabel({
                text: 'Votes',
                color: '#333',
                width: 'auto',
                height: 'auto',
                left: 5,
                font:{fontSize:12, fontWeight: 'bold'}
            });
            votes_cont.add(votes_label);
            
            votes_count_label = Titanium.UI.createLabel({
                text: nom.vote_count,
                color: '#333',
                width: 'auto',
                height: 'auto',
                right: 5,
                font:{fontSize:12, fontWeight: 'bold'}
            });
            votes_cont.add(votes_count_label);

            photo_options = Ti.UI.createButton({
            	backgroundImage: '../images/stream_option_button.png',
            	width: 25,
            	height: 25,
                right: 1,
                top: 5,
                left: 190,
                bottom: 5
            });
            photo_options.nom_id = nom.id;
            photo_options.photo_id = nom.photo.id;
            photo_options.addEventListener('click', open_options);
            
            bottom_cont.add(photo_options);

            // photo_action_row.add(add_comment);
            // photo_action_row.add(nom_detail_button);
            // photo_action_row.add(photo_options);
            // 
            // photo_action_cont.add(photo_action_row);
            // photo_action_cont.add(comments_cont);
            // 
            // row.add(photo_action_cont);        
            // render_comments(comments_cont, nom.quick_comments);

            section.add(row);
            section.created_time = nom.created_time;

            if (!top){
                list_view_data.push(section);
            }
        	else{
        	    list_view_data.splice(row_count, 0, section);
                // tv.insertRowBefore(row_count, section);
        	}
        }
        catch (err){
            alert(err);
        }
}

function render_active_list_view(data){
    if (data.length > 0){
        list_view_data = [ ];
        top_empty_label.hide();
        active_empty_label.hide();
        newest_nom = data[0].created_time;
        oldest_nom = data[data.length - 1].created_time;
        for (var i = 0; i < data.length; i++){
            render_nom(data[i], false);
        }
        if (data.length == 10){
            setTimeout(function(){
                load_more_view.show();
            }, 300);
        }
        else{
            load_more_button.hide();
        }
    }
    else{
        load_more_button.hide();
    }
    tv.setData(list_view_data);
}

var empty_row = Ti.UI.createTableViewRow({
        height:'auto',
        backgroundColor:'#000',
        selectionStyle: Titanium.UI.iPhone.TableViewCellSelectionStyle.NONE
});

var active_empty_label = Titanium.UI.createLabel({
    text: 'No Active Nominations',
    color: '#fff',
    width: 'auto',
    height: 'auto',
    top: 150,
    font: {fontSize: 20, fontWeight: 'bold'},
    zIndex: 10
});
active_empty_label.hide();
empty_row.add(active_empty_label);

var top_empty_label = Titanium.UI.createLabel({
    text: 'Top Nominations Empty',
    color: '#fff',
    width: 'auto',
    height: 'auto',
    top: 150,
    font: {fontSize: 20, fontWeight: 'bold'},
    zIndex: 10
});
top_empty_label.hide();
empty_row.add(top_empty_label);

function activate_photos_stream(){
    list_view_data = [ ];
    top_empty_label.hide();
    active_empty_label.hide();
    if (photos_cache.length == 0){
        window_activity_cont.show();
        var xhr = Titanium.Network.createHTTPClient();

        xhr.onload = function()
        {
            var data = JSON.parse(this.responseData);
            photos_cache = data;
            render_community_photos(photos_cache);
            window_activity_cont.hide();
        };

        var url = '';

        url = SERVER_URL + '/api/get_community_photos/';

        xhr.open('GET', url);

        // send the data
        xhr.send();
    }
    else{
        // render_active_list_view(photo_cache);
        render_community_photos(photos_cache);
    }
}

function activate_active_stream(){
    list_view_data = [ ];
    top_empty_label.hide();
    active_empty_label.hide();
    if (active_cache.length == 0){
        window_activity_cont.show();
        var xhr = Titanium.Network.createHTTPClient();
        xhr.onload = function()
        {
            var data = JSON.parse(this.responseData);
            active_cache = data;
            if (active_cache.length > 0){
                render_active_list_view(active_cache);
            }
            else{
                tv.setData([empty_row]);
                active_empty_label.show();
            }
            window_activity_cont.hide();
        };
        var url = SERVER_URL + '/api/get_community_nominations/';
        xhr.open('GET', url);
        xhr.send();
    }
    else{
        render_active_list_view(active_cache);
    }
}

function activate_top_stream(){
    list_view_data = [ ];
    top_empty_label.hide();
    active_empty_label.hide();
    if (top_cache.length == 0){
        window_activity_cont.show();
        var xhr = Titanium.Network.createHTTPClient();
        xhr.onload = function()
        {
            var data = JSON.parse(this.responseData);
            top_cache = data;
            if (top_cache.length > 0){
                render_top(top_cache);
                // render_active_list_view(top_cache);
            }
            else{
                tv.setData([empty_row]);
                top_empty_label.show();
            }
            window_activity_cont.hide();
        };
        var url = SERVER_URL + '/api/get_community_top_stream/';
        xhr.open('GET', url);
        xhr.send(); 
    }
    else{
        trophy_data = [ ];
        render_top(top_cache);
    }
}

function update_photo_cache(data){
    var top = 21;
    
    for (var i = 0; i < data.length; i++){
        photos_cache.splice(0, 0, data[i]);
    }
    
    if (photos_cache.length < top){
        top = photos_cache.length;
        return photos_cache;
    }
    else if (photos_cache.length > top){
        var temp_cache = [ ];
        for (var i = 0; i < top; i++){
            temp_cache.push(photos_cache[i]);
        }
        photos_cache = temp_cache;
    }
    
    return photos_cache;
}
 
var countdown_interval_set = false;
var countdown_interval = null;       
function init_community_view(){
    win.add(tv);
    
    window_activity_cont.show();
    var xhr = Titanium.Network.createHTTPClient();
    xhr.onload = function(){
        var data = JSON.parse(this.responseData);
        
        if (data.length > 0){
            active_cache = data;
            if (active_cache.length > 0){
                render_active_list_view(active_cache);
            }
            else{
                tv.setData([empty_row]);
                active_empty_label.show();
            }
            if (data.length == 10){
                load_more_view.show();
            }
        }
        else{
            
        }
        window_activity_cont.hide();
    };
    var url = SERVER_URL + '/api/get_community_nominations/';
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

    // var lastUpdatedLabel = Ti.UI.createLabel({
    //  text:"Last Updated: "+formatDate(),
    //  left:55,
    //  width:200,
    //  bottom:15,
    //  height:"auto",
    //  color:"#ffffff",
    //  textAlign:"center",
    //  font:{fontSize:12}
    // });
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

    var pulling = false;
    var reloading = false;

    function beginReloading()
    {
        var xhr = Titanium.Network.createHTTPClient();

        xhr.onload = function(){
        	data = JSON.parse(this.responseData);
            
            if (data.length > 0){
                if (selected_tab == 'photos'){
                    photos_cache = data;
                    list_view_data = [ ];
                    render_community_photos(photos_cache);
                }
                else if (selected_tab == 'top'){
                    trophy_data = [ ];
                    top_cache = data;
                    render_top(top_cache);
                }
                else if (selected_tab == 'active'){
                    list_view_data = [ ];
                    active_cache = data;
                    render_active_list_view(active_cache);
                }
            }
            endReloading();
        };

        var url = '';
        if (selected_tab == 'photos'){
            url = SERVER_URL + '/api/get_community_photos/';
        }
        else if (selected_tab == 'top'){
            url = SERVER_URL + '/api/get_community_top_stream/';
        }
        else if (selected_tab == 'active'){
            url = SERVER_URL + '/api/get_community_nominations/';
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
        // lastUpdatedLabel.text = "Last Updated: "+formatDate();
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
    	dateNow = new Date();									//grab current date
    	amount = dateFuture.getTime() - dateNow.getTime();		//calc milliseconds between dates
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

init_community_view();