Ti.include('../../settings.js');
Ti.include('../../includes.js');

var win = Ti.UI.currentWindow,
    tv = null,
    me = JSON.parse(Ti.App.Properties.getString("me")),
    nom_id = null,
    cat = null,
    user = null,
    won = false,
    photo = null,
    selected_nom = null,
    selected_nom_index = 0,
    noms_in_cat = null,
    current_comments = null,
    window_nav_bar = null,
    back_buttom = null,
    button_label = null,
    list_view_data = [ ],
    view_active = 'photos';

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
    title: 'Profile',
    font: {fontSize: 11, fontWeight: 'bold'},
    backgroundImage: '../../images/back.png'
});

back_buttom.addEventListener('click', function(){
    win.close();
});

window_nav_bar.add(back_buttom);

win.add(window_nav_bar);

var detail_header = null,
    detail_header_profile_image = null,
    detail_header_nominatee_name = null,
    detail_header_post_time = null,
    detail_img_cont = null,
    detail_img = null,
    nominator_profile_image = null,
    nominatee_name_cont = null,
    nominator_name = null,
    nominator_caption = null,
    vote_count = null,
    vote_up = null,
    vote_down = null,
    place_text = null,
    thumb_list = [ ],
    photo_action_cont = null,
    photo_action_row = null,
    add_comment = null,
    comments_cont = null;
    
function update_nom_detail(nom){
    selected_nom = nom;
    
    var nominatee_profile_img_url = 'https://graph.facebook.com/' + nom.nominatee + '/picture?type=square';
    detail_header_profile_image.image = nominatee_profile_img_url;
    detail_header_profile_image.user = nom.nominatee;
    detail_header_profile_image.name = nom.nominatee_name;
    
    detail_header.remove(nominatee_name_cont);
    detail_header_nominatee_name.text = nom.nominatee_name;
    detail_header_nominatee_name.user = nom.nominatee;
    detail_header_nominatee_name.name = nom.nominatee_name;
    detail_header.add(nominatee_name_cont);
    
    var now = new Date();
    var time = new Date(nom.created_time * 1000);
    var time_diff = now - time;
    time_diff /= 1000;
    detail_header_post_time.text = secondsToHms(time_diff);
    
    
    var max_height = 320;
    if (Ti.Platform.displayCaps.density == 'high') {
        if (selected_nom.photo.width > Ti.Platform.displayCaps.platformWidth){
            photo_width = Ti.Platform.displayCaps.platformWidth;
        }
        else{
            photo_width = selected_nom.photo.width;
        }

        if (selected_nom.photo.height && selected_nom.photo.height > max_height){
            if (selected_nom.photo.height > selected_nom.photo.width){
                photo_height = max_height;
                photo_width = photo_height * (selected_nom.photo.width / selected_nom.photo.height);
            }
            else{
                photo_height = photo_width * (selected_nom.photo.height / selected_nom.photo.width);
            }
        }
        else{
            photo_height = max_height;
        }
        highres = true;
    }
    else{
        if (photo_width < 320){
            photo_width = selected_nom.photo.width;
        }
        else{
            photo_width = 320
        }

        if (selected_nom.photo.height && selected_nom.photo.height > max_height){
            photo_width = max_height * (selected_nom.photo.width / selected_nom.photo.height);
            photo_height = photo_width * (selected_nom.photo.height / selected_nom.photo.width);
        }
        else{
            photo_height = max_height;
        }
        highres = false;
    }
    
    detail_img.height = photo_height;
    detail_img.width = photo_width;
    detail_img.image = nom.photo.src;
    
    nominator_profile_image.image = 'https://graph.facebook.com/' + nom.nominator + '/picture?type=square';
    nominator_profile_image.user = nom.nominator;
    nominator_profile_image.name = nom.nominator_name;
    
    nominator_name.user = nom.nominator;
	nominator_name.name = nom.nominator_name;
    nominator_name.text = nom.nominator_name;
    
    var caption = '';
    if (nom.caption){
        caption = nom.caption;
    }
    nominator_caption.text = caption;
    
    vote_count.text = nom.vote_count;
    
    photo_action_cont.remove(comments_cont);
    comments_cont = Titanium.UI.createView({
            height: 'auto',
            top: 0,
            width: 320,
            layout: 'vertical'
        });
    photo_action_cont.add(comments_cont);
    get_nom_comments(comments_cont, nom.id);
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

function add_comment_to_nom(e){
    var nom_id = e.source.nom_id;
    
    var t = Titanium.UI.create2DMatrix();
	t = t.scale(.45);
    
    var comment_window = Titanium.UI.createWindow({
		backgroundColor:'#333',
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
	
	post_button.addEventListener('click', function(e){
        var comment_body = comment_textarea.value;
        var nom_id = selected_nom.id;
        
        if (comment_body != ''){
            var xhr = Titanium.Network.createHTTPClient();

            xhr.onload = function(){
                // var data = JSON.parse(this.responseData);
            };

            var url = SERVER_URL + '/api/new_comment/';

            xhr.open('POST', url);

            // send the data
            xhr.send({'user': me.fid, 'body': comment_body, 'nom_id': nom_id});
            
            var now = new Date().getTime() / 1000;
            if (current_comments && current_comments.length > 0){
                current_comments.splice(0, 0, { 'comments': {
                        'comment': comment_body,
                        'owner_id': me.fid,
                        'owner_name': me.name,
                        'create_datetime': now
                    }
                });
            }
            else{
                current_comments = [{'comments': {
                        'comment': comment_body,
                        'owner_id': me.fid,
                        'owner_name': me.name,
                        'create_datetime': now
                    }
                }];
            }
            photo_action_cont.height = photo_action_cont.height;
            photo_action_cont.remove(comments_cont);
            comments_cont = Titanium.UI.createView({
                    backgroundColor: '#222',
                    height: 'auto',
                    top: 0,
                    width: 320,
                    layout: 'vertical'
                });
            render_comments(comments_cont, current_comments);
            photo_action_cont.add(comments_cont);
            photo_action_cont.height = 'auto';
        }
        
	    comment_textarea.blur();
		comment_window.close(fadeOut);
	});
	
	setTimeout(function(){
	    comment_textarea.focus();
	}, 50);	
}

function render_comments(cont, comments){
    var comment_cont = null,
        commentor = null,
        comment_time = null,
        commentor_cont = null,
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
            width: 'auto',
        });
        
        commentor = Titanium.UI.createLabel({
    	    text: comments[i].comments.owner_name,
            color: '#333',
            top: 2,
            bottom: 2,
            left: 10,
            width: 'auto',
            height: 'auto',
            font:{fontSize:12, fontWeight: 'bold'}
        });
        commentor.user = comments[i].comments.owner_id;
        commentor.name = comments[i].comments.owner_name;
        commentor.addEventListener('click', add_profile_window);
        
        commentor_cont.add(commentor);
        
        comment = Titanium.UI.createLabel({
    	    text: '  - ' + comments[i].comments.comment,
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
        cont.bottom = 10;
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
}

function get_nom_comments(cont, nom_id){
    var xhr = Titanium.Network.createHTTPClient();

    xhr.onload = function(){
        var data = JSON.parse(this.responseData);
        if (data.length > 0){
            current_comments = data;
            render_comments(cont, data);
        }
    };

    var url = SERVER_URL + '/api/get_comments/?nom_id=' + nom_id;

    xhr.open('GET', url);

    // send the data
    xhr.send();
}

function render_nom_detail(noms){
    var nom_cat_underscore = selected_nom.nomination_category.replace(' ', '_').toLowerCase();
    var nom_cat_color = get_nom_cat_color(nom_cat_underscore);
    
    detail_header = Titanium.UI.createView({
        backgroundColor: nom_cat_color,
        height: 35,
        top: 40,
        width: 320
    });
    
    var nominatee_profile_img_url = 'https://graph.facebook.com/' + selected_nom.nominatee + '/picture?type=square';
    detail_header_profile_image = Ti.UI.createImageView({
		image: nominatee_profile_img_url,
		defaultImage: '../../images/photo_loader.png',
		left: 0,
		top: 0,
		height: 35,
		width: 35,
		hires: true,
		zIndex: 1
	});
	detail_header_profile_image.user = selected_nom.nominatee;
	detail_header_profile_image.name = selected_nom.nominatee_name;
	detail_header_profile_image.addEventListener('click', add_profile_window);
	detail_header.add(detail_header_profile_image);

	detail_header_nominatee_name = Titanium.UI.createLabel({
	    text: selected_nom.nominatee_name,
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
    detail_header_nominatee_name.user = selected_nom.nominatee;
	detail_header_nominatee_name.name = selected_nom.nominatee_name;
	detail_header_nominatee_name.addEventListener('click', add_profile_window);
    
    nominatee_name_cont = Titanium.UI.createView({
        backgroundColor: '#222',
        borderRadius: 5,
        height: 20,
        left: 40,
        width: 'auto',
        zIndex: 1
    });
    nominatee_name_cont.add(detail_header_nominatee_name);
    detail_header.add(nominatee_name_cont);
    
    var section = Titanium.UI.createTableViewSection({
        headerView: detail_header
    });
    
    var now = new Date();
    var time = new Date(selected_nom.created_time * 1000);
    var time_diff = now - time;
    time_diff /= 1000;
    
    var post_time_cont = Titanium.UI.createView({
        backgroundColor: nom_cat_color,
        height: 35,
        right: 5,
        size: {width: 'auto', height: 'auto'}
    });
    
    detail_header_post_time = Titanium.UI.createLabel({
	    text: secondsToHms(time_diff),
        color: '#fff',
        font:{fontSize: 12, fontWeight: 'bold'},
        size: {width: 'auto', height: 'auto'}
    });
    post_time_cont.add(detail_header_post_time);
    detail_header.add(post_time_cont);
    
    var max_height = 320;
    if (Ti.Platform.displayCaps.density == 'high') {
        if (selected_nom.photo.width > Ti.Platform.displayCaps.platformWidth){
            photo_width = Ti.Platform.displayCaps.platformWidth;
        }
        else{
            photo_width = selected_nom.photo.width;
        }

        if (selected_nom.photo.height && selected_nom.photo.height > max_height){
            if (selected_nom.photo.height > selected_nom.photo.width){
                photo_height = max_height;
                photo_width = photo_height * (selected_nom.photo.width / selected_nom.photo.height);
            }
            else{
                photo_height = photo_width * (selected_nom.photo.height / selected_nom.photo.width);
            }
        }
        else{
            photo_height = max_height;
        }
        highres = true;
    }
    else{
        if (photo_width < 320){
            photo_width = selected_nom.photo.width;
        }
        else{
            photo_width = 320
        }

        if (selected_nom.photo.height && selected_nom.photo.height > max_height){
            photo_width = max_height * (selected_nom.photo.width / selected_nom.photo.height);
            photo_height = photo_width * (selected_nom.photo.height / selected_nom.photo.width);
        }
        else{
            photo_height = max_height;
        }
        highres = false;
    }
    
    detail_img_cont = Ti.UI.createTableViewRow({
        backgroundColor: '#000',
        height: photo_height,
        width: 320,
        selectionStyle: Titanium.UI.iPhone.TableViewCellSelectionStyle.NONE
    });
    
    detail_img = Ti.UI.createImageView({
		image: selected_nom.photo.src,
		defaultImage: '../../images/photo_loader.png',
		width: photo_width,
		height: photo_height,
		hires: highres
	});
	detail_img_cont.add(detail_img);
	
	section.add(detail_img_cont);
	
	var detail_row = Ti.UI.createTableViewRow({
        backgroundColor: '#fff',
        height: 100,
        width: 320,
        selectionStyle: Titanium.UI.iPhone.TableViewCellSelectionStyle.NONE
    });
    
    var detail_left_cont = Titanium.UI.createView({
        backgroundColor: '#fff',
        height: 100,
        width: 160,
        left: 0
    });
    
    var nominator_top_cont = Titanium.UI.createView({
        backgroundColor: '#fff',
        height: 40,
        width: 160,
        left: 0,
        top: 0
    });
    
    var nominator_top_border = Titanium.UI.createView({
        backgroundColor: '#dedede',
        height: 1,
        width: 150,
        left: 5,
        top: 40,
        zIndex: 1
    });
    detail_left_cont.add(nominator_top_border);
    
    var nominator_profile_img_url = 'https://graph.facebook.com/' + selected_nom.nominator + '/picture?type=square';
    nominator_profile_image = Ti.UI.createImageView({
		image: nominator_profile_img_url,
		defaultImage: '../../images/photo_loader.png',
		left: 5,
		top: 5,
		width: 30,
		height: 30,
		hires: highres
	});
	nominator_profile_image.user = selected_nom.nominator;
	nominator_profile_image.name = selected_nom.nominator_name;
	nominator_profile_image.addEventListener('click', add_profile_window);
	var nominated_by = Titanium.UI.createLabel({
	    text: 'Nominated by',
        color: '#333',
        left: 40,
        top: 5,
        font:{fontSize: 12},
        size: {width: 'auto', height: 'auto'}
    });
    nominator_name = Titanium.UI.createLabel({
	    text: selected_nom.nominator_name,
        color: '#333',
        left: 40,
        top: 18,
        font:{fontSize: 12, fontWeight: 'bold'},
        size: {width: 'auto', height: 'auto'}
    });
    nominator_name.user = selected_nom.nominator;
	nominator_name.name = selected_nom.nominator_name;
	nominator_name.addEventListener('click', add_profile_window);
	
    nominator_top_cont.add(nominator_profile_image);
    nominator_top_cont.add(nominated_by);
    nominator_top_cont.add(nominator_name);
    
    detail_left_cont.add(nominator_top_cont);
    
    var nominator_bottom_cont = Titanium.UI.createView({
        backgroundColor: '#fff',
        height: 60,
        width: 160,
        left: 0,
        top: 40
    });
    
    var caption = '';
    if (selected_nom.caption){
        caption = selected_nom.caption;
    }
    nominator_caption = Titanium.UI.createLabel({
	    text: caption,
        color: '#333',
        left: 10,
        right: 10,
        font:{fontSize: 11},
        size: {width: 'auto', height: 'auto'}
    });
    nominator_bottom_cont.add(nominator_caption);
    
    detail_left_cont.add(nominator_bottom_cont);
    
    var detail_middle_cont = Titanium.UI.createView({
        backgroundColor: nom_cat_color,
        height: 100,
        width: 100,
        left: 160
    });
    
    var votes_label = Titanium.UI.createLabel({
	    text: 'Votes',
        color: '#fff',
        left: 10,
        right: 10,
        top: 10,
        font:{fontSize: 22, fontWeight: 'bold'},
        size: {width: 'auto', height: 'auto'}
    });
    detail_middle_cont.add(votes_label);
    
    vote_count = Titanium.UI.createLabel({
	    text: selected_nom.vote_count,
        color: '#fff',
        left: 10,
        right: 10,
        top: 40,
        font:{fontSize: 36, fontWeight: 'bold'},
        size: {width: 'auto', height: 'auto'}
    });
    detail_middle_cont.add(vote_count);
    
    if (!won){
        var detail_right_cont = Titanium.UI.createView({
            backgroundColor: '#333',
            height: 100,
            width: 60,
            left: 260
        });

        vote_up = Ti.UI.createButton({
    		backgroundImage: '../../images/up_arrow.png',
    		width: 40,
    		height: 40,
    		top: 5
    	});

        vote_down = Ti.UI.createButton({
    		backgroundImage: '../../images/down_arrow.png',
    		width: 40,
    		height: 40,
    		top: 55
    	});
        // vote_arrow = Ti.UI.createImageView({
        //  image: '../../images/',
        //  defaultImage: '../../images/photo_loader.png',
        //  left: 5,
        //  top: 5,
        //  width: 30,
        //  height: 30,
        //  hires: highres
        // });
    	
    	detail_right_cont.add(vote_up);
    	detail_right_cont.add(vote_down);
    	
    	detail_row.add(detail_right_cont);
    }
    else{
        detail_left_cont.width = 220;
        nominator_top_cont.width = 220;
        nominator_top_border.width = 210;
        nominator_bottom_cont.width = 220;
        detail_middle_cont.left = 220;
    }

    detail_row.add(detail_left_cont);
    detail_row.add(detail_middle_cont);

    
    var scroll_width = (noms.length * 60) + 5;
    
    if (scroll_width <= 320){
        scroll_width = 321;
    }
    
    var noms_scroll_view = Titanium.UI.createScrollView({
    	contentWidth: scroll_width,
    	contentHeight: 50,
    	top: 0,
    	height: 50,
    	width: 320,
    	backgroundColor: '#222',
    	showVerticalScrollIndicator:false,
    	showHorizontalScrollIndicator:true
    });
    
    var scroll_view_top_shadow = Titanium.UI.createView({
        backgroundColor: '#000',
        height: 2,
        opacity: 0.2,
        top: 0,
        width: 320,
        zIndex: 1
    });
    
    var scroll_view_bottom_shadow = Titanium.UI.createView({
        backgroundColor: '#000',
        height: 2,
        opacity: 0.2,
        bottom: 0,
        width: 320,
        zIndex: 1
    });
    
    var scroll_noms_row = Ti.UI.createTableViewRow({
        height: 50,
        width: 320,
        selectionStyle: Titanium.UI.iPhone.TableViewCellSelectionStyle.NONE
    });
    scroll_noms_row.add(scroll_view_top_shadow);
    scroll_noms_row.add(scroll_view_bottom_shadow);
    scroll_noms_row.add(noms_scroll_view);
    
    
    section.add(scroll_noms_row);
    section.add(detail_row);
    
    photo_action_cont = Ti.UI.createTableViewRow({
        backgroundColor: '#222',
        height: 'auto',
        width: 320,
        selectionStyle: Titanium.UI.iPhone.TableViewCellSelectionStyle.NONE,
        layout: 'vertical'
    });
    
    photo_action_row = Titanium.UI.createView({
        backgroundColor: '#ddd',
        top: 0,
        width: 320,
        height: 'auto'
    });
    
    comments_cont = Titanium.UI.createView({
            backgroundColor: '#222',
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
    add_comment.addEventListener('click', add_comment_to_nom);
    
    photo_options = Ti.UI.createButton({
    	backgroundImage: '../../images/stream_option_button.png',
    	width: 25,
    	height: 25,
        right: 5,
        top: 5,
        bottom: 5
    });
    photo_options.addEventListener('click', open_options);
    
    photo_action_row.add(add_comment);
    photo_action_row.add(photo_options);
    
    photo_action_cont.add(photo_action_row);
    photo_action_cont.add(comments_cont);
    
    section.add(photo_action_cont);
    
    get_nom_comments(comments_cont, selected_nom.id)
    
    for (var i = 0; i < noms.length; i++){
        photo_thumb = Ti.UI.createImageView({
    		image: noms[i].photo.src_small,
    		defaultImage: '../../images/photo_loader.png',
    		borderColor: '#fff',
            backgroundColor: '#000',
    		borderWidth: 2,
    		width: 55,
    		height: 42,
    		left: 5 + (60 * i),
    		hires: true
    	});
    	photo_thumb.nom = noms[i];
    	photo_thumb.index = i;
    	thumb_list.push(photo_thumb);
    	
    	if (noms[i].id != selected_nom.id){
    	    photo_thumb.opacity = 0.5;
    	}
    	else{
    	    selected_nom_index = i;
    	    if (!won){
    	        place_text = Titanium.UI.createLabel({
            	    text: getOrdinal(i+1),
                    textAlign: 'right',
                    color: '#fff',
                    height: 'auto',
                    width: 100,
                    shadowColor: '#333',
                    shadowOffset: {x: 1, y: 1},
                    bottom: 10,
                    right: 10,
                    zIndex: 1,
                    font:{fontSize: 32, fontWeight: 'bold'}
                });
                detail_img_cont.add(place_text);
    	    }
    	}
    	
    	photo_thumb.addEventListener('click', function(e){
    	    var nom = e.source.nom;
            
            var scroll_pos = (e.source.index * 60) - 125;
            if (scroll_pos < 0){
                scroll_pos = 0;
            }
            else if (scroll_pos + 320 > scroll_width){
                scroll_pos = scroll_width - 320;
            }
                
            noms_scroll_view.scrollTo(scroll_pos, 0);
    	    
    	    if (nom.id != selected_nom.id){
    	        thumb_list[selected_nom_index].opacity = 0.5;
    	        thumb_list[e.source.index].opacity = 1;
    	        update_nom_detail(nom);
    	        selected_nom_index = e.source.index;
    	        
    	        if (!won){
        	        place_text.text = getOrdinal(selected_nom_index+1); 
    	        }
    	    }
    	});
        
        noms_scroll_view.add(photo_thumb);
    }
    
    tv.setData([section]);
}

function init_detail_view(){
    var xhr = Titanium.Network.createHTTPClient();
    var url = '';
    var detail_header_text = '';
    if (!won){
        xhr.onload = function()
        {
            var data = JSON.parse(this.responseData);
            selected_nom = data.selected_nom;
            noms_in_cat = data.noms;

            detail_header_text = 'Active ' + selected_nom.nomination_category + ' Photos';

            var detail_header = Titanium.UI.createView({
                height: 40,
                width: 200
            });

            var nom_cat_label = Titanium.UI.createLabel({
        	    text: detail_header_text,
                textAlign: 'left',
                color: '#fff',
                height: 'auto',
                width: 'auto',
                opacity: 0,
                minimumFontSize: 12,
                font:{fontSize: 14, fontWeight: 'bold'}
            });
            detail_header.add(nom_cat_label);

            window_nav_bar.add(detail_header);
            
            var lable_animation = Titanium.UI.createAnimation({
                curve: Ti.UI.ANIMATION_CURVE_EASE_IN,
                opacity: 1,
                duration: 200
            });

            nom_cat_label.animate(lable_animation);
            
            render_nom_detail(noms_in_cat);
        };
        url = SERVER_URL + '/api/get_noms_in_cat/?fb_user=' + me.fid + '&nom_id=' + nom_id;
    }
    else{
        xhr.onload = function()
        {
            var data = JSON.parse(this.responseData);
            var nom_cat_underscore = cat.replace(' ', '_').toLowerCase();
            var nom_cat_color = get_nom_cat_color(nom_cat_underscore);
            
            selected_nom = data.selected_nom;
            noms_in_cat = data.noms;
            
            detail_header_text = 'Winning ' + cat + ' Photos';

            var detail_header = Titanium.UI.createView({
                height: 40,
                width: 200
            });

            var nom_cat_label = Titanium.UI.createLabel({
        	    text: detail_header_text,
                textAlign: 'left',
                color: '#fff',
                height: 'auto',
                width: 'auto',
                opacity: 0,
                minimumFontSize: 12,
                font:{fontSize: 14, fontWeight: 'bold'}
            });
            detail_header.add(nom_cat_label);

            window_nav_bar.add(detail_header);
            
            var lable_animation = Titanium.UI.createAnimation({
                curve: Ti.UI.ANIMATION_CURVE_EASE_IN,
                opacity: 1,
                duration: 200
            });

            nom_cat_label.animate(lable_animation);
            
            render_nom_detail(noms_in_cat);
        };
        
        url = SERVER_URL + '/api/get_user_wins_trophy_cat/?fb_user=' + user + '&nom_cat=' + cat + '&nom_id='+  nom_id;
    }

    xhr.open('GET', url);

    // send the data
    xhr.send();
}

Ti.App.addEventListener('pass_detail', function(eventData) {
    nom_id = String(eventData.nom_id);
    photo = eventData.photo;
    won = eventData.won;
    if (won == 1){
        won = true;
        cat = String(eventData.nom_cat);
        user = String(eventData.user);
    }
    
    tv = Ti.UI.createTableView({
            backgroundColor: '#222',
            separatorStyle: 0,
            top: 40,
            // bottom: -50,
            style: Titanium.UI.iPhone.TableViewStyle.PLAIN
        });
        
    tv.addEventListener('click', function(e){

    });
    
    win.add(tv);
    
    init_detail_view(false);
});