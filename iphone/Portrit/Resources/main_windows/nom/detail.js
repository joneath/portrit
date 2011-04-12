Ti.include('../../settings.js');
Ti.include('../../includes.js');

var win = Ti.UI.currentWindow,
    tv = null,
    me = JSON.parse(Ti.App.Properties.getString("me")),
    nom_id = null,
    cat = null,
    user = null,
    username = null,
    won = false,
    photo = null,
    selected_nom = null,
    selected_nom_index = 0,
    scroll_offset = {
        x: 0,
        y: 0
    },
    noms_in_cat = null,
    current_comments = null,
    window_nav_bar = null,
    back_buttom = null,
    button_label = null,
    empty_message_cont = null,
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
    title: 'Back',
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
    photo_list = [ ],
    photo_action_cont = null,
    photo_action_row = null,
    add_comment = null,
    comments_in_row = [ ];
    comments_cont = null;
    
function remove_comments(){
    for (var i = 0; i < comments_in_row.length; i++){
        comments_row.remove(comments_in_row[i]);
    }
    comments_in_row = [ ];
}
    
function update_nom_detail(index){
    selected_nom = noms_in_cat[index];
    
    var nom_cat_underscore = selected_nom.nomination_category.replace(' ', '_').toLowerCase();
    var nom_cat_color = get_nom_cat_color(nom_cat_underscore);
    
    detail_header_background.backgroundColor = nom_cat_color;
    detail_middle_cont.backgroundColor = nom_cat_color;
    
    var nominatee_profile_img_url = 'https://graph.facebook.com/' + selected_nom.nominatee + '/picture?type=square';
    detail_header_profile_image.image = nominatee_profile_img_url;
    detail_header_profile_image.user = selected_nom.nominatee;
    detail_header_profile_image.name = selected_nom.nominatee_name;
    detail_header_profile_image.username = selected_nom.nominatee_username;
    
    detail_header.remove(nominatee_name_cont);
    var nominatee_name_text = '';
	if (selected_nom.nominatee == me.fid){
	    nominatee_name_text = 'You';
	}
	else{
	    nominatee_name_text = selected_nom.nominatee_username;
	}
    detail_header_nominatee_name.text = nominatee_name_text;
    detail_header_nominatee_name.user = selected_nom.nominatee;
    detail_header_nominatee_name.name = selected_nom.nominatee_name;
    detail_header_nominatee_name.username = selected_nom.nominatee_username;
    detail_header.add(nominatee_name_cont);
    
    // var now = new Date();
    // var time = new Date(selected_nom.created_time * 1000);
    // var time_diff = now - time;
    // time_diff /= 1000;
    // post_time.text = secondsToHms(time_diff);
    
    
    var max_height = 320;
    var photo_width = 0;
	var photo_height = 0;
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
    // detail_img_cont.height = photo_height;
    // scrollView.scrollToView(index);
    // detail_img.height = photo_height;
    // detail_img.width = photo_width;
    // detail_img.image = nom.photo.src;
    
    nominator_profile_image.image = 'https://graph.facebook.com/' + selected_nom.nominator + '/picture?type=square';
    nominator_profile_image.user = selected_nom.nominator;
    nominator_profile_image.name = selected_nom.nominator_name;
    nominator_profile_image.username = selected_nom.nominator_username;
    
    var nominator_name_text = '';
	if (selected_nom.nominator == me.fid){
	    nominator_name_text = 'You';
	}
	else{
	    nominator_name_text = selected_nom.nominator_username;
	}
    
    nominator_name.user = selected_nom.nominator;
	nominator_name.name = selected_nom.nominator_name;
	nominator_name.username = selected_nom.nominator_username;
    nominator_name.text = nominator_name_text;
    
    var caption = '';
    if (selected_nom.caption){
        caption = selected_nom.caption;
    }
    else{
        caption = 'No caption provided.';
    }
    nominator_caption.text = caption;
    
    vote_count.text = selected_nom.vote_count;
    
    detail_middle_cont.votes = selected_nom.votes;
    votes_label.votes = selected_nom.votes;
    vote_count.votes = selected_nom.votes;
    
    if (!won){
        vote_up.nom_index = index;
        vote_down.nom_index = index;
    }
    
    photo_options.photo_id = selected_nom.photo.id;
    photo_options.nom = selected_nom;
    
    if (!won){
        if (me_in_votes(selected_nom.votes)){
    	    disable_vote();
    	}
    	else{
    	    enable_vote();
    	}
    }
    
    tagged_label.text = selected_nom.tagged_users.length + ' Tagged';
    tagged_label.tags = selected_nom.tagged_users;
    
    disclosure.tags = selected_nom.tagged_users;
    
    tagged_cont.tags = selected_nom.tagged_users;
    
    if (selected_nom.tagged_users.length > 0){
        tagged_cont.show();
    }
    else{
        tagged_cont.hide();
    }
    
    remove_comments();
    current_comments = null;
    get_nom_comments(comments_row, selected_nom.id);
}

function update_nom_cache(data, dir){
    if (dir == 'up'){
        for (var i = 0; i < data.length; i++){
            noms_in_cat.push(data[i]);
        }
    }
    else{
        for (var i = 0; i < data.length; i++){
            noms_in_cat.splice(i,0,data[i]);
        }
    }
}

function render_more_nom_detail(noms, dir){
    if (noms.length > 0){
        update_nom_cache(noms, dir);
        
        for (var i = 0; i < noms.length; i++){
            photo_thumb = Ti.UI.createImageView({
                image: noms[i].photo.crop,
                defaultImage: '../../images/photo_loader.png',
                borderColor: '#fff',
                backgroundColor: '#000',
                borderWidth: 2,
                width: 55,
                height: 42,
                left: 0,
                hires: true
            });
            scroll_offset.x += 60; 
            photo_thumb.nom = noms[i];
            
            if (dir == 'up'){
                thumb_list.push(photo_thumb);
            }
            else{
                thumb_list.splice(i,0,photo_thumb);
            }
        
            var max_height = 320;
            var highres = true;
            var photo_width = 0;
            var photo_height = 0;
                if (Ti.Platform.displayCaps.density == 'high') {
                    if (noms[i].photo.width > Ti.Platform.displayCaps.platformWidth){
                        photo_width = Ti.Platform.displayCaps.platformWidth;
                    }
                    else{
                        photo_width = noms[i].photo.width;
                    }
        
                    if (noms[i].photo.height && noms[i].photo.height > max_height){
                        if (noms[i].photo.height > noms[i].photo.width){
                            photo_height = max_height;
                            photo_width = photo_height * (noms[i].photo.width / noms[i].photo.height);
                        }
                        else{
                            photo_height = photo_width * (noms[i].photo.height / noms[i].photo.width);
                        }
                    }
                    else{
                        photo_height = max_height;
                    }
                    highres = true;
                }
                else{
                    if (photo_width < 320){
                        photo_width = noms[i].photo.width;
                    }
                    else{
                        photo_width = 320
                    }
        
                    if (noms[i].photo.height && noms[i].photo.height > max_height){
                        photo_width = max_height * (noms[i].photo.width / noms[i].photo.height);
                        photo_height = photo_width * (noms[i].photo.height / noms[i].photo.width);
                    }
                    else{
                        photo_height = max_height;
                    }
                    highres = false;
                }
        
            detail_img = Ti.UI.createImageView({
                image: noms[i].photo.source,
                defaultImage: '../../images/photo_loader.png',
                width: photo_width,
                height: photo_height,
                hires: highres
            });
            scroll_view_cont = Titanium.UI.createView({
                width: 320,
                height: 'auto'
            });
            scroll_view_cont.add(detail_img);
            scroll_view_cont.nom = noms[i];
            
            if (dir == 'up'){
                photo_list.push(scroll_view_cont);
            }
            else{
                photo_list.splice(i,0,scroll_view_cont);
            }
        
            photo_thumb.opacity = 0.5;
        
            photo_thumb.addEventListener('click', photo_thumb_click);
            noms_scroll_view.add(photo_thumb);
        }
        
        for (var i = 0; i < thumb_list.length; i++){
            thumb_list[i].left = 5 + (60 * i);
        }
        scroll_width = (thumb_list.length * 60) + 5;
        noms_scroll_view.contentWidth = scroll_width;
        
        noms_scroll_view.contentOffset = scroll_offset;
        
        scrollView.views = photo_list;
        
        if (dir == 'up'){
            
        }
        else{
            
        }
    }
    else{
        
    }
}

function load_more_noms(state, cat, dir, pos_to_load){
    var url = '';
    if (state == 'stream_active'){
        url = SERVER_URL + '/api/get_nom_detail/?source=' + me.username + '&nav_selected=' +state + '&cat=' + cat + '&dir=' + dir + '&pos=' + pos_to_load;
    }
    else if (state == 'stream_winners'){
        url = SERVER_URL + '/api/get_nom_detail/?source=' + me.username + '&nav_selected=' +state + '&cat=' + cat + '&dir=' + dir + '&pos=' + pos_to_load;
    }
    else if (state == 'community_active'){
        
    }
    else if (state == 'community_top'){
        url = SERVER_URL + '/api/get_nom_detail/?nav_selected=' +state + '&cat=' + cat + '&dir=' + dir + '&pos=' + pos_to_load;
    }
    else if (state == 'profile_trophies'){

    }
    else if (state == 'profile_active'){

    }
    
    var xhr = Titanium.Network.createHTTPClient();
    
    xhr.onload = function(){
        var data = JSON.parse(this.responseData);
        render_more_nom_detail(data, dir);
    }
    xhr.open('GET', url);
    xhr.send();
}

function check_detail_pagination(current, selected, len, pos){
    var load_sensitivity = 3;
    
    var loaded_top = (len - selected) + pos;
    var loaded_bottom = pos - selected;
    var pos_to_load = 0;
    var dir = null;
    
    var cat = noms_in_cat[selected].nomination_category;
    if (loaded_top >= 9 && selected > current && selected + load_sensitivity >= loaded_top && typeof(noms_in_cat[selected].end) == 'undefined'){
        dir = 'up';
        pos_to_load = loaded_top;
    }
    else if (selected < current && selected - load_sensitivity <= loaded_bottom && loaded_bottom > 0){
        dir = 'down';
        pos_to_load = loaded_bottom;
    }
    
    if (dir){
        load_more_noms(state, cat, dir, pos_to_load);
    }
}

function show_votes(e){
    var w = Ti.UI.createWindow({backgroundColor:"#ddd", url:'votes.js'});
	Titanium.UI.currentTab.open(w,{animated:true});
	
	setTimeout(function(){
	    Ti.App.fireEvent('pass_votes', {
            votes: e.source.votes
        });
	}, 100);
	return false;
}

function show_tags(e){
    var w = Ti.UI.createWindow({backgroundColor:"#ddd", url:'tags.js'});
	Titanium.UI.currentTab.open(w,{animated:true});
	
	setTimeout(function(){
	    Ti.App.fireEvent('pass_tags', {
            tags: e.source.tags
        });
	}, 100);
	return false;
}

function add_profile_window(e){
    var w = Ti.UI.createWindow({backgroundColor:"#222", url:'../user/profile.js'});
	Titanium.UI.currentTab.open(w,{animated:true});
	
	setTimeout(function(){
	    Ti.App.fireEvent('pass_user', {
            user: e.source.user,
            name: e.source.name,
            username: e.source.username
        });
	}, 100);
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
            var xhr = Titanium.Network.createHTTPClient();

            xhr.onload = function(){
                var data = JSON.parse(this.responseData);
                if (data == true){
                    var flag_cont_background = Titanium.UI.createView({
                	    backgroundColor: '#000',
                        opacity: .8,
                        borderRadius: 5,
                        height: '100%',
                        width: '100%',
                        zIndex: -1
                    });

            	    var flag_cont = Titanium.UI.createView({
                        height: 'auto',
                        width: 'auto',
                        top: 200,
                        zIndex: 10
                    });
                    flag_cont.add(flag_cont_background);

            	    var flag_message = Titanium.UI.createLabel({
                	    text: 'Thank you for the feedback! We wil check this photo out.',
                	    textAlign: 'center',
                        color: '#fff',
                        left: 10,
                        right: 10,
                        top: 10,
                        bottom: 10,
                        size: {width: 'auto', height: 'auto'},
                        font:{fontSize:16, fontWeight: 'bold'}
                    });
                    flag_cont.add(flag_message);
                    win.add(flag_cont);

                    var fadeOutSlow = Titanium.UI.createAnimation({
                        curve: Ti.UI.ANIMATION_CURVE_EASE_IN,
                        opacity: 0,
                        delay: 3000,
                        duration: 1000
                    });
                    flag_cont.animate(fadeOutSlow);
                    
                    setTimeout(function(){
                        win.remove(flag_cont);
                    }, 4000);
                }
            };

            var url = '';

            url = SERVER_URL + '/api/flag/photo'

            xhr.open('POST', url);

            // send the data
            xhr.send({'access_token': me.access_token,
                        'photo_id': photo_id});
        }
        else if (e.index == 1){
            // Facebook Share
            var title = me.username + ' shared a nomination on Portrit';
            share_nom(nom, 'Facebook', title, 'detail');
        }
        else if (e.index == 2){
            // Twitter Share
            share_nom(nom, 'Twitter', '', 'detail');
        }
	});
	dialog.show();
}

function add_comment_to_nom(e){
    var nom_id = e.source.nom_id;
    
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
            xhr.send({'access_token': me.access_token, 'body': comment_body, 'nom_id': nom_id});
            
            var now = new Date().getTime() / 1000;
            if (current_comments && current_comments.length > 0){
                current_comments.splice(0, 0, {
                        'comment': comment_body,
                        'owner_id': me.fid,
                        'owner_name': me.name,
                        'create_datetime': now
                });
            }
            else{
                current_comments = [{
                        'comment': comment_body,
                        'owner_id': me.fid,
                        'owner_name': me.name,
                        'create_datetime': now
                }];
            }
            remove_comments();
            if (empty_message_cont != null){
                comments_row.remove(empty_message_cont);
        	}
            render_comments(comments_row, current_comments);
        }
        
	    comment_textarea.blur();
		comment_window.close(fadeOut);
	});
	
	setTimeout(function(){
	    comment_textarea.focus();
	}, 50);	
}

var comment_bottom_padding = null;
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
        
        var commentor_name_text = '';
    	if (comments[i].owner_id == me.fid){
    	    commentor_name_text = 'You';
    	}
    	else{
    	    commentor_name_text = comments[i].owner_username;
    	}
        
        commentor = Titanium.UI.createLabel({
    	    text: commentor_name_text,
            color: '#333',
            top: 2,
            bottom: 2,
            left: 10,
            width: 'auto',
            height: 'auto',
            font:{fontSize:13, fontWeight: 'bold'}
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
            font:{fontSize:13}
        });
        
        comment_cont.add(commentor_cont);
        comment_cont.add(comment);
        cont.add(comment_cont);
        comments_in_row.push(comment_cont);
    }
    if (comments.length > 0){
        cont.bottom = 10;
        
        if (comment_bottom_padding){
            cont.remove(comment_bottom_padding);
        }
        comment_bottom_padding = Titanium.UI.createView({
            backgroundColor: '#fff',
            height: 5,
            width: 320,
            bottom: 0,
            zIndex: -1
        });
        cont.add(comment_bottom_padding);
        
        setTimeout(function(){
            photo_action_bottom_round = Titanium.UI.createView({
                backgroundColor: '#fff',
                borderRadius: 5,
                height: 10,
                bottom: -5,
                width: 320,
                zIndex: -1
            });
        	comment_bottom_padding.add(photo_action_bottom_round);
        }, 200);
    }
}

function render_empty_comments_message(cont){
    empty_message_cont = Titanium.UI.createView({
            backgroundColor: '#fff',
            height: 30,
            width: 320
        });
        
    empty_message = Titanium.UI.createLabel({
    	    text: 'No Comments',
            color: '#666',
            width: 'auto',
            height: 'auto',
            font:{fontSize:14}
        });
    empty_message_cont.add(empty_message);
    cont.add(empty_message_cont);
}

function get_nom_comments(cont, nom_id, first){
    var xhr = Titanium.Network.createHTTPClient();

    xhr.onload = function(){
        var data = JSON.parse(this.responseData);
        if (data.length > 0){
            current_comments = data;
            if (empty_message_cont){
                cont.remove(empty_message_cont);
                empty_message_cont = null;
            }
            render_comments(cont, data);
        }
        else if (empty_message_cont == null){
            render_empty_comments_message(cont);
        }
    };

    var url = SERVER_URL + '/api/get_comments/?nom_id=' + nom_id;

    xhr.open('GET', url);

    // send the data
    xhr.send();
}

function disable_vote(){
    vote_up.enabled = false;
    vote_down.enabled = false;
}

function enable_vote(){
    vote_up.enabled = true;
    vote_down.enabled = true;
}

function vote(e){
    disable_vote();
    if (e.source.direction == 'up'){
        vote_count.text = parseInt(vote_count.text) + 1;
    }
    else if(e.source.direction == 'down'){
        vote_count.text = parseInt(vote_count.text) - 1;
    }
    noms_in_cat[selected_nom_index].vote_count = vote_count.text;
    
    noms_in_cat[selected_nom_index].votes.push({
        'vote_user': me.fid,
        'vote_name': me.name
    });
    
    detail_middle_cont.votes = noms_in_cat[selected_nom_index].votes;
    votes_label.votes = noms_in_cat[selected_nom_index].votes;
    vote_count.votes = noms_in_cat[selected_nom_index].votes;
    
    var xhr = Titanium.Network.createHTTPClient();

    xhr.onload = function(){
        // var data = JSON.parse(this.responseData);
    };
    var url = SERVER_URL + '/api/vote_on_nomination/';
    xhr.open('POST', url);

    // send the data
    xhr.send({'access_token': me.access_token, 'nomination_id': selected_nom.id, 'direction': e.source.direction});
}

function me_in_votes(votes){
    for (var i = 0; i < votes.length; i++){
        if (votes[i].vote_user == me.fid){
            return true;
        }
    }
    return false;
}

function photo_thumb_click(e){
    var nom = e.source.nom;
    var source_index = find_nom_index_in_list(nom.id, noms_in_cat);

    var scroll_pos = (source_index * 60) - 125;
    if (scroll_pos < 0){
        scroll_pos = 0;
    }
    else if (scroll_pos + 320 > scroll_width){
        scroll_pos = scroll_width - 320;
    }

    noms_scroll_view.scrollTo(scroll_pos, 0);
    
    if (nom.id != selected_nom.id){
        old_index = selected_nom_index;
        selected_nom_index = find_nom_index_in_list(nom.id, noms_in_cat);
        
        thumb_list[old_index].opacity = 0.5;
        thumb_list[selected_nom_index].opacity = 1;
        scrollView.scrollToView(photo_list[selected_nom_index]);
        update_nom_detail(selected_nom_index);
        
        if (!won){
	        place_text.text = getOrdinal(noms_in_cat[selected_nom_index].position+1),
        }
        check_detail_pagination(old_index, selected_nom_index, noms_in_cat.length, noms_in_cat[selected_nom_index].position);
    }
}

function render_nom_detail(noms){
    var nom_cat_underscore = selected_nom.nomination_category.replace(' ', '_').toLowerCase();
    var nom_cat_color = get_nom_cat_color(nom_cat_underscore);
    
    detail_header = Ti.UI.createTableViewRow({
        height: 30,
        width: 320,
        selectionStyle: Titanium.UI.iPhone.TableViewCellSelectionStyle.NONE
    });
    
    detail_header_background = Titanium.UI.createView({
        backgroundColor: nom_cat_color,
        opacity: 0.9,
        height: '100%',
        width: '100%',
        zIndex: -1
    });
    detail_header.add(detail_header_background);
    
    var nominatee_profile_img_url = 'https://graph.facebook.com/' + selected_nom.nominatee + '/picture?type=square';
    detail_header_profile_image = Ti.UI.createImageView({
		image: nominatee_profile_img_url,
		defaultImage: '../../images/photo_loader.png',
		left: 0,
		top: 0,
		height: 30,
		width: 30,
		hires: true,
		zIndex: 1
	});
	detail_header_profile_image.user = selected_nom.nominatee;
	detail_header_profile_image.name = selected_nom.nominatee_name;
	detail_header_profile_image.username = selected_nom.nominatee_username;
	detail_header_profile_image.addEventListener('click', add_profile_window);
	detail_header.add(detail_header_profile_image);
	
	var nominatee_name_text = '';
	if (selected_nom.nominatee == me.fid){
	    nominatee_name_text = 'You';
	}
	else{
	    nominatee_name_text = selected_nom.nominatee_username;
	}

	detail_header_nominatee_name = Titanium.UI.createLabel({
	    text: nominatee_name_text,
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
	detail_header_nominatee_name.username = selected_nom.nominatee_username;
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
    
    tagged_cont = Titanium.UI.createView({
        backgroundColor: '#222',
        borderRadius: 5,
        height: 25,
        width: 'auto',
        right: 3,
    });
    tagged_label = Titanium.UI.createLabel({
	    text: selected_nom.tagged_users.length + ' Tagged',
	    textAlign: 'left',
        color: '#fff',
        left: 8,
        right: 35,
        font:{fontSize: 13, fontWeight: 'bold'},
        size: {width: 'auto', height: 'auto'}
    });
    tagged_label.tags = selected_nom.tagged_users;
    tagged_cont.add(tagged_label);
    
    disclosure = Titanium.UI.createButton({
        style:Titanium.UI.iPhone.SystemButton.DISCLOSURE,
    	right: 0
    });
    disclosure.tags = selected_nom.tagged_users;
    tagged_cont.add(disclosure);
    
    tagged_cont.tags = selected_nom.tagged_users;
    tagged_cont.addEventListener('click', show_tags);
    if (selected_nom.tagged_users.length == 0){
        tagged_cont.hide();
    }
    detail_header.add(tagged_cont);
    
    var section = Titanium.UI.createTableViewSection({

    });
    section.add(detail_header);
    
    detail_img_cont = Ti.UI.createTableViewRow({
        backgroundColor: '#000',
        height: 240,
        width: 320,
        selectionStyle: Titanium.UI.iPhone.TableViewCellSelectionStyle.NONE
    });
	
	section.add(detail_img_cont);
	
	var detail_row = Titanium.UI.createView({
        backgroundColor: '#fff',
        height: 90,
        width: 320,
        bottom: 0
        // selectionStyle: Titanium.UI.iPhone.TableViewCellSelectionStyle.NONE
    });
    
    var detail_row_top_shadow = Titanium.UI.createView({
        backgroundImage: '../../images/upper_drop_shadow.png',
        height: 2,
        width: 320,
        bottom: 90
    });
    win.add(detail_row_top_shadow);
    
    var detail_left_cont = Titanium.UI.createView({
        backgroundColor: '#fff',
        height: 90,
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
		hires: true
	});
	nominator_profile_image.user = selected_nom.nominator;
	nominator_profile_image.name = selected_nom.nominator_name;
	nominator_profile_image.username = selected_nom.nominator_username;
	nominator_profile_image.addEventListener('click', add_profile_window);
	var nominated_by = Titanium.UI.createLabel({
	    text: 'Nominated by',
        color: '#333',
        left: 40,
        top: 5,
        font:{fontSize: 12},
        size: {width: 'auto', height: 'auto'}
    });
    
    var nominator_name_text = '';
	if (selected_nom.nominator == me.fid){
	    nominator_name_text = 'You';
	}
	else{
	    nominator_name_text = selected_nom.nominator_username;
	}
    
    nominator_name = Titanium.UI.createLabel({
	    text: nominator_name_text,
        color: '#333',
        left: 40,
        top: 18,
        font:{fontSize: 12, fontWeight: 'bold'},
        size: {width: 'auto', height: 'auto'}
    });
    nominator_name.user = selected_nom.nominator;
	nominator_name.name = selected_nom.nominator_name;
	nominator_name.username = selected_nom.nominator_username;
	nominator_name.addEventListener('click', add_profile_window);
	
    nominator_top_cont.add(nominator_profile_image);
    nominator_top_cont.add(nominated_by);
    nominator_top_cont.add(nominator_name);
    
    detail_left_cont.add(nominator_top_cont);
    
    var nominator_bottom_cont = Titanium.UI.createView({
        backgroundColor: '#fff',
        height: 50,
        width: 160,
        left: 0,
        top: 40
    });
    
    caption_top = 'auto';
    caption_text_align = 'center';    
    caption_size = 12;
    var caption = '';
    if (selected_nom.caption){
        caption = selected_nom.caption;
        // caption_text_align = 'left';
        caption_size = 10;
    }
    else{
        caption = 'No caption provided.';
    }
    nominator_caption = Titanium.UI.createLabel({
	    text: caption,
	    textAlign: caption_text_align,
        color: '#333',
        top: caption_top,
        font:{fontSize: caption_size},
        size: {width: 150, height: 'auto'}
    });
    nominator_bottom_cont.add(nominator_caption);
    
    detail_left_cont.add(nominator_bottom_cont);
    
    detail_middle_cont = Titanium.UI.createView({
        backgroundColor: nom_cat_color,
        height: 90,
        width: 100,
        left: 160
    });
    detail_middle_cont.votes = selected_nom.votes;
    detail_middle_cont.addEventListener('click', show_votes);
    
    votes_label = Titanium.UI.createLabel({
	    text: 'Votes',
	    textAlign: 'center',
        color: '#fff',
        shadowColor: '#444',
        shadowOffset: {x: 1, y: 1},
        top: 10,
        font:{fontSize: 22, fontWeight: 'bold'},
        size: {width: 'auto', height: 'auto'}
    });
    votes_label.votes = selected_nom.votes;
    detail_middle_cont.add(votes_label);
    
    vote_count = Titanium.UI.createLabel({
	    text: selected_nom.vote_count,
	    textAlign: 'center',
        color: '#fff',
        shadowColor: '#444',
        shadowOffset: {x: 1, y: 1},
        top: 40,
        font:{fontSize: 40, fontWeight: 'bold'},
        size: {width: 'auto', height: 'auto'}
    });
    vote_count.votes = selected_nom.votes;
    detail_middle_cont.add(vote_count);
    
    vote_arrow = Ti.UI.createImageView({
     image: '../../images/vote_cont_triangle.png',
     right: 0,
     top: 38,
     width: 10,
     height: 26,
     hires: highres,
     zIndex: 2
    });
    detail_middle_cont.add(vote_arrow);
    
    if (!won){
        var detail_right_cont = Titanium.UI.createView({
            backgroundColor: '#333',
            height: 90,
            width: 60,
            left: 260
        });

        vote_up = Ti.UI.createButton({
    		backgroundImage: '../../images/up_arrow.png',
    		width: 40,
    		height: 40,
    		top: 3
    	});
    	vote_up.direction = 'up';
    	vote_up.addEventListener('click', vote);

        vote_down = Ti.UI.createButton({
    		backgroundImage: '../../images/down_arrow.png',
    		width: 40,
    		height: 40,
    		top: 48
    	});
    	vote_down.direction = 'down';
    	vote_down.addEventListener('click', vote);
    	
    	if (me_in_votes(selected_nom.votes)){
    	    disable_vote();
    	}
    	
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
    win.add(detail_row);
    
    scroll_width = (noms.length * 60) + 5;
    
    if (scroll_width <= 320){
        scroll_width = 321;
    }
    
    noms_scroll_view = Titanium.UI.createScrollView({
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
    
    photo_action_cont = Ti.UI.createTableViewRow({
        height: 'auto',
        width: 320,
        selectionStyle: Titanium.UI.iPhone.TableViewCellSelectionStyle.NONE,
        layout: 'vertical'
    });
    
    photo_action_row = Titanium.UI.createView({
        backgroundColor: '#ddd',
        width: 320,
        height: 'auto'
    });
    
    comments_row = Ti.UI.createTableViewRow({
        height: 'auto',
        width: 320,
        layout: 'vertical',
        selectionStyle: Titanium.UI.iPhone.TableViewCellSelectionStyle.NONE
    });
        
    // comments_cont = Titanium.UI.createView({
    //         height: 'auto',
    //         width: 320,
    //         layout: 'vertical'
    //     });
        
    // comments_row.add(comments_cont);
    
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
    photo_options.photo_id = selected_nom.photo.id;
    photo_options.nom = selected_nom;
    photo_options.addEventListener('click', open_options);
    
    photo_action_row.add(add_comment);
    photo_action_row.add(photo_options);
    photo_action_cont.add(photo_action_row);
    
    // photo_action_cont.add(photo_action_row);
    // photo_action_cont.add(comments_cont);
    section.add(photo_action_cont);
    section.add(comments_row);
    
    get_nom_comments(comments_row, selected_nom.id, true);
    
    
    for (var i = 0; i < noms.length; i++){
        photo_thumb = Ti.UI.createImageView({
    		image: noms[i].photo.crop,
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
    	thumb_list.push(photo_thumb);
    	
    	var max_height = 320;
    	var highres = true;
    	var photo_width = 0;
    	var photo_height = 0;
        if (Ti.Platform.displayCaps.density == 'high') {
            if (noms[i].photo.width > Ti.Platform.displayCaps.platformWidth){
                photo_width = Ti.Platform.displayCaps.platformWidth;
            }
            else{
                photo_width = noms[i].photo.width;
            }

            if (noms[i].photo.height && noms[i].photo.height > max_height){
                if (noms[i].photo.height > noms[i].photo.width){
                    photo_height = max_height;
                    photo_width = photo_height * (noms[i].photo.width / noms[i].photo.height);
                }
                else{
                    photo_height = photo_width * (noms[i].photo.height / noms[i].photo.width);
                }
            }
            else{
                photo_height = max_height;
            }
            highres = true;
        }
        else{
            if (photo_width < 320){
                photo_width = noms[i].photo.width;
            }
            else{
                photo_width = 320
            }

            if (noms[i].photo.height && noms[i].photo.height > max_height){
                photo_width = max_height * (noms[i].photo.width / noms[i].photo.height);
                photo_height = photo_width * (noms[i].photo.height / noms[i].photo.width);
            }
            else{
                photo_height = max_height;
            }
            highres = false;
        }
    	
    	detail_img = Ti.UI.createImageView({
    		image: noms[i].photo.source,
    		defaultImage: '../../images/photo_loader.png',
    		width: photo_width,
    		height: photo_height,
    		hires: highres
    	});
    	scroll_view_cont = Titanium.UI.createView({
            width: 320,
            height: 'auto'
        });
        scroll_view_cont.add(detail_img);
        scroll_view_cont.nom = noms[i];
    	photo_list.push(scroll_view_cont);
    	
    	if (noms[i].id != selected_nom.id){
    	    photo_thumb.opacity = 0.5;
    	}
    	else{
    	    selected_nom_index = i;
    	    if (!won){
    	        place_text = Titanium.UI.createLabel({
            	    text: getOrdinal(noms[i].position+1),
                    textAlign: 'center',
                    color: '#fff',
                    height: 'auto',
                    width: 'auto',
                    shadowColor: '#333',
                    top: 0,
                    shadowOffset: {x: 1, y: 1},
                    zIndex: 1,
                    font:{fontSize: 32, fontWeight: 'bold'}
                });

                post_time_background = Titanium.UI.createView({
                    backgroundColor: '#000',
                    borderRadius: 5,
                    opacity: 0.8,
                    height: '100%',
                    width: '100%',
                    zIndex: -1
                });

                post_time_cont = Titanium.UI.createView({
                    right: 5,
                    bottom: 5,
                    height: 40,
                    width: 70,
                    zIndex: 1
                });
                post_time_cont.add(post_time_background);
                post_time_cont.add(place_text);   
                detail_img_cont.add(post_time_cont);
                
                vote_up.nom = noms[i];
        	    vote_down.nom = noms[i];
    	    }
    	    var scroll_pos = (i * 60) - 125;
            if (scroll_pos < 0){
                scroll_pos = 0;
            }
            else if (scroll_pos + 320 > scroll_width){
                scroll_pos = scroll_width - 320;
            }

            noms_scroll_view.scrollTo(scroll_pos, 0);
    	}
    	
    	photo_thumb.addEventListener('click', photo_thumb_click);
        
        noms_scroll_view.add(photo_thumb);
    }
    
    scrollView = Titanium.UI.createScrollableView({
        views: photo_list,
        currentPage: selected_nom_index
    });
    scrollView.addEventListener('scroll', function(e){
        if (e.currentPage != selected_nom_index){
            var nom = e.view.nom;
            var scroll_pos = (e.currentPage * 60) - 125;
            if (scroll_pos < 0){
                scroll_pos = 0;
            }
            else if (scroll_pos + 320 > scroll_width){
                scroll_pos = scroll_width - 320;
            }
            noms_scroll_view.scrollTo(scroll_pos, 0);
            
            old_index = selected_nom_index;
	        selected_nom_index = find_nom_index_in_list(nom.id, noms_in_cat);
            
            thumb_list[old_index].opacity = 0.5;
	        thumb_list[selected_nom_index].opacity = 1;
	        update_nom_detail(selected_nom_index);
	        if (!won){
    	        place_text.text = getOrdinal(nom.position+1); 
	        }
	        check_detail_pagination(old_index, selected_nom_index, noms_in_cat.length, noms_in_cat[selected_nom_index].position);
        }
    });
    
	detail_img_cont.add(scrollView);
    
    tv.setData([section]);
}

function find_nom_in_list(id, data){
    var selected_nom = data[0];
    for (var i = 0; i < data.length; i++){
        if (data[i].id == id){
            selected_nom = data[i];
            break;
        }
    }
    return selected_nom;
}

function find_nom_index_in_list(id, data){
    for (var i = 0; i < data.length; i++){
        if (data[i].id == id){
            return i;
            break;
        }
    }
}

function init_detail_view(state){
    var xhr = Titanium.Network.createHTTPClient();
    var url = '';
    var detail_header_text = '';

    xhr.onload = function()
    {
        var data = JSON.parse(this.responseData);
        if (nom_id){
            selected_nom = find_nom_in_list(nom_id, data);
        }
        else{
            selected_nom = data[0];
        }
        noms_in_cat = data;
        
        render_nom_detail(noms_in_cat);
    };
    
    var target_user = me.username;
    if (username){
        target_user = username;
    }
    
    var heading_user = target_user + '\'s';
    if (target_user == me.username){
        heading_user = 'Your'
    }
    
    detail_header_text = '';
    if (state == 'stream_active'){
        detail_header_text = 'Active ' + cat.replace('-', ' ') + ' Photos';
    }
    else if (state == 'stream_winners'){
        detail_header_text = 'Winning Photos';
    }
    else if (state == 'community_active'){
        detail_header_text = 'Community ' + cat.replace('-', ' ') + ' Photos';
    }
    else if (state == 'community_top'){
        detail_header_text = 'Top Community ' + cat.replace('-', ' ') + ' Photos';
    }
    else if (state == 'profile_trophies'){
        detail_header_text = heading_user + ' Winning Photos';
    }
    else if (state == 'profile_active'){
        detail_header_text = heading_user + ' Active Nominations';
    }
    else{
        detail_header_text = heading_user + ' Photo';
    }

    var detail_header = Titanium.UI.createView({
        height: 40,
        width: 200,
    });

    var nom_cat_label = Titanium.UI.createLabel({
	    text: detail_header_text,
        textAlign: 'left',
        color: '#fff',
        height: 'auto',
        width: 'auto',
        opacity: 0,
        minimumFontSize: 11,
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
    
    url = SERVER_URL + '/api/get_nom_detail/?source=' + target_user + '&nom_id=' + nom_id + '&nav_selected=' + state + '&cat=' + cat;

    xhr.open('GET', url);

    // send the data
    xhr.send();
}

var init_count = 0;
Ti.App.addEventListener('pass_detail', function(eventData) {
    if (init_count == 0){
        init_count += 1;
        nom_id = String(eventData.nom_id);
        photo = eventData.photo;
        won = eventData.won;
        state = eventData.state;
        cat = String(eventData.cat);
        if (typeof(eventData.user) != 'undefined'){
            username = String(eventData.user);
        }
        if (won == 1){
            won = true;
        }

        tv = Ti.UI.createTableView({
                backgroundColor: '#222',
                separatorStyle: 0,
                top: 40,
                bottom: 90,
                style: Titanium.UI.iPhone.TableViewStyle.PLAIN
            });

        tv.addEventListener('click', function(e){

        });

        win.add(tv);
        init_detail_view(state);
    }
});