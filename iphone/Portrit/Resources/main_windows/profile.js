Ti.include('../settings.js');
Ti.include('../includes.js');

var win = Ti.UI.currentWindow,
    me = JSON.parse(Ti.App.Properties.getString("me")),
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
    list_view_data = [ ],
    trophy_data = [ ],
    active_data = [ ],
    active_noms_cache = [ ],
    oldest_photo = null,
    view_active = 'photos',
    name = '';

window_nav_bar = Titanium.UI.createView({
    backgroundImage: '../images/iphone_header_blank.png',
    width: 320,
    height: 40,
    top: 0
});

var settings_button = Ti.UI.createButton({
	title:"Options",
	font: {fontSize: 12, fontWeight: 'bold'},
	backgroundImage: '../images/square_button.png',
	width: 58,
	height: 32,
	right: 5
});

settings_button.addEventListener('click', function(){
    var w = Titanium.UI.createWindow({
		backgroundColor:'#eee',
		url:'user/settings.js'
	});
	Titanium.UI.currentTab.open(w,{animated:true});
});

window_nav_bar.add(settings_button);

var header_label = Titanium.UI.createLabel({
        text: 'Profile',
        color: '#fff',
        textAlign: 'center',
        font:{fontSize:28}
    });
window_nav_bar.add(header_label);
win.add(window_nav_bar);

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
    // var w = Ti.UI.createWindow({backgroundColor:"#222", url:'nom/nominate.js'});
    // w.open({modal:true});
    
    var w = Titanium.UI.createWindow({
		backgroundColor:'#000',
		title:'Nominate Photo',
		barImage:'../images/iphone_header_blank.png',
		url:'nom/nominate.js'
	});
	var b = Titanium.UI.createButton({
		title:'Cancel',
		font: {fontSize: 12, fontWeight: 'bold'},
		width: 58,
    	height: 32,
		backgroundImage: '../images/square_button.png',
		style:Titanium.UI.iPhone.SystemButtonStyle.PLAIN
	});
	w.setRightNavButton(b);
	b.addEventListener('click',function(){
		w.close();
	});
	w.open({modal:true});

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
        section = Titanium.UI.createTableViewSection({
            
        });
        
        row = Ti.UI.createTableViewRow({
                height:'auto',
                selectionStyle: Titanium.UI.iPhone.TableViewCellSelectionStyle.NONE
        });
        
        var max_height = 320;
        if (Ti.Platform.displayCaps.density == 'high') {
            if (data[i].width > Ti.Platform.displayCaps.platformWidth){
                photo_width = Ti.Platform.displayCaps.platformWidth;
            }
            else{
                photo_width = data[i].width;
            }

            if (data[i].height && data[i].height > max_height){
                if (data[i].height > data[i].width){
                    photo_height = max_height;
                    photo_width = photo_height * (data[i].width / data[i].height);
                }
                else{
                    photo_height = photo_width * (data[i].height / data[i].width);
                }
            }
            else{
                photo_height = max_height;
            }
            highres = true;
        }
        else{
            if (photo_width < 320){
                photo_width = data[i].width;
            }
            else{
                photo_width = 320
            }

            if (data[i].height && data[i].height > max_height){
                photo_width = max_height * (data[i].width / data[i].height);
                photo_height = photo_width * (data[i].height / data[i].width);
            }
            else{
                photo_height = max_height;
            }
            highres = false;
        }

        main_image = Ti.UI.createImageView({
    		image: data[i].source,
    		defaultImage: '../images/photo_loader.png',
    		bottom: 10,
    		top: 0,
    		width: photo_width,
    		height: photo_height,
    		hires: highres
    	});
    	
    	nominate_photo = Titanium.UI.createButton({
            backgroundImage: '../images/nominate_button.png',
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
            backgroundColor: '#000',
            borderRadius: 5,
            opacity: 0.8,
            left: 5,
            bottom: 15,
            height: 30,
            width: 'auto',
            zIndex: 1
        });
    	
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
            size: {width: 'auto', height: 'auto'},
            font:{fontSize: 14}
        });
        
        post_time_cont.add(post_time);
        row.add(post_time_cont)
    	
    	row.add(main_image);

        section.add(row);
        section.created_time = data[i].created_time;
        
        list_view_data.push(section);
    }
    tv.setData(list_view_data);
}

function add_detail_trophy_window(e){
    var w = Ti.UI.createWindow({backgroundColor:"#333", url:'../nom/detail.js'});
	Titanium.UI.currentTab.open(w,{animated:true});
	
	setTimeout(function(){
	    Ti.App.fireEvent('pass_detail', {
            nom_id: e.source.nom_id,
            photo: e.source.photo,
            nom_cat: e.source.nom_cat,
            user: user,
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
        
    for (var i = 0; i < data.length; i++){
        cat_name_underscore = data[i].cat_name.replace(' ', '_').toLowerCase();
        cat_color = get_nom_cat_color(cat_name_underscore);
        
        trophy_header = Titanium.UI.createView({
                backgroundColor: cat_color,
                height: 30,
                top: 0,
                width: 320,
            });
            
        trophy_label = Titanium.UI.createLabel({
        	    text: data[i].cat_name,
                color: '#fff',
                left: 5,
                width: 'auto',
                height: 'auto',
                font:{fontSize:16, fontWeight: 'bold'}
            });
            
        //         trophy_image = Ti.UI.createImageView({
        //  image: '../../images/trophies/medium/' + cat_name_underscore + '.png',
        //  defaultImage: '../../images/photo_loader.png',
        //             bottom: 0,
        //             right: 5,
        //  width: 25,
        //  height: 50,
        //  hires: true
        // });
        //         trophy_header.add(trophy_image);
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
        		image: data[i].noms[j].photo.src_small,
        		defaultImage: '../images/photo_loader.png',
                top: 5,
                bottom: 5,
        		left: (photo_in_row_count * 105) + 5,
        		width: 100,
        		height: 75,
        		hires: true
        	});
        	
        	photo_cont.nom_id = data[i].noms[j].id;
            photo_cont.photo = data[i].noms[j].photo;
            photo_cont.nom_cat = data[i].noms[j].nomination_category;
            
        	photo_cont.addEventListener('click', add_detail_trophy_window);
        	
        	row.add(photo_cont);
        	photo_in_row_count += 1;
        }    
        
        section.add(row);
        trophy_data.push(section);
    }
    tv.setData(trophy_data);
}

function init_trophies_view(){
    if (trophy_data.length == 0){
        var xhr = Titanium.Network.createHTTPClient();

        xhr.onload = function()
        {   
            var data = JSON.parse(this.responseData);
            render_trophies(data);
        };

        var url = SERVER_URL + '/api/get_user_trophies/?fb_user=' + user;
        xhr.open('GET', url);

        // send the data
        xhr.send();
    }
    else{
        tv.setData(trophy_data);
    }
}

function add_profile_window(e){
    var w = Ti.UI.createWindow({backgroundColor:"#222", url:'user/profile.js'});
	Titanium.UI.currentTab.open(w,{animated:true});
	
	setTimeout(function(){
	    Ti.App.fireEvent('pass_user', {
            user: e.source.user,
            name: e.source.name
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
            won: false
        });
	}, 200);
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
            xhr.send({'user': me.fid, 'body': comment_body, 'nom_id': nom_id});
            
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
            comment_button.comments = comments
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
            height: 'auto',
            right: 10,
            top: 0,
            left: 0,
            width: 320
        });
        
        commentor_cont = Titanium.UI.createView({
            height: 'auto',
            top: 0,
            left: 0,
            width: 'auto',
        });
        
        commentor = Titanium.UI.createLabel({
    	    text: comments[i].owner_name,
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
}

function render_active_view(data){
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
            backgroundColor: nom_cat_color,
            height: 35,
            opacity: 0.9
        });
        
        photo_header.add(nominate_photo);
        
        section = Titanium.UI.createTableViewSection({
            headerView: photo_header
        });
        
        row = Ti.UI.createTableViewRow({
                height:'auto',
                selectionStyle: Titanium.UI.iPhone.TableViewCellSelectionStyle.NONE
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
        
        main_image = Ti.UI.createImageView({
    		image: data[i].photo.src,
    		defaultImage: '../images/photo_loader.png',
    		top: 0,
    		width: photo_width,
    		height: photo_height,
    		hires: highres
    	});
    	
    	main_image.nom_id = data[i].id;
    	main_image.photo = data[i].photo;
    	main_image.addEventListener('click', add_detail_window);
    	
    	post_time_cont = Titanium.UI.createView({
            backgroundColor: '#000',
            borderRadius: 5,
            opacity: 0.8,
            right: 5,
            top: photo_height - 70,
            height: 'auto',
            width: 'auto',
            zIndex: 1
        });
    	
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
            size: {width: 'auto', height: 'auto'},
            font:{fontSize:12}
        });
        
        post_time_cont.add(post_time);

    	nominator_footer = Titanium.UI.createView({
    	    height:35,
            left: 0,
            top: photo_height - 34,
            width: 320,
            opacity: 0.8,
            backgroundColor: '#000',
            zIndex: 1
        });

    	nominator_profile_img_url = 'https://graph.facebook.com/' + data[i].nominator + '/picture?type=square';
        nominator_profile_img = Ti.UI.createImageView({
    		image: nominator_profile_img_url,
    		defaultImage: '../images/photo_loader.png',
    		left: 0,
    		top: 0,
    		hires: true,
    		height: 35,
    		width: 35
    	});
    	
    	nominator_profile_img.user = data[i].nominator;
    	nominator_profile_img.name = data[i].nominator_name;
    	nominator_profile_img.addEventListener('click', add_profile_window);
    	
    	nominator_footer.add(nominator_profile_img);
        
        if (data[i].caption){
            nominator_name = Titanium.UI.createLabel({
        	    text: 'Nominated by ' + data[i].nominator_name,
                color: '#fff',
                left: 40,
                bottom: 15,
                width: 200,
                font:{fontSize:12}
            });

            nominator_footer.add(nominator_name);

            caption = Titanium.UI.createLabel({
        	    text: 'Caption: ' + data[i].caption,
                color: '#fff',
                left: 40,
                top: 10,
                width: 200,
                font:{fontSize:12}
            });
            nominator_footer.add(caption);
        }
        else{
            nominator_name = Titanium.UI.createLabel({
        	    text: 'Nominated by ' + data[i].nominator_name,
                color: '#fff',
                left: 40,
                width: 200,
                font:{fontSize:12}
            });

            nominator_footer.add(nominator_name);
        }
        
        nominator_name.user = data[i].nominator;
        nominator_name.name = data[i].nominator_name;
        nominator_name.addEventListener('click', add_profile_window);
        
        photo_action_cont = Titanium.UI.createView({
            backgroundColor: '#fff',
            top: photo_height,
            width: 320,
            height: 'auto',
            bottom: 10,
            layout: 'vertical'
        });
        
        photo_action_row = Titanium.UI.createView({
            backgroundColor: '#ddd',
            top: 0,
            width: 320,
            height: 'auto'
        });
        
        comments_cont = Titanium.UI.createView({
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
        add_comment.nom_id = data[i].id;
        add_comment.comment_cont = comments_cont;
        add_comment.comments = data[i].quick_comments;
        add_comment.action_cont = photo_action_cont;
        add_comment.addEventListener('click', add_comment_to_nom);
        
        nom_detail_button = Ti.UI.createButton({
    	    backgroundImage: '../images/stream_action_button.png',
        	title:"Detail",
        	width: 90,
        	height: 25,
            left: 100,
            top: 5,
            bottom: 5,
            font: {fontSize: 12, fontWeight: 'bold'}
        });
        nom_detail_button.nom_id = data[i].id;
        nom_detail_button.photo = data[i].photo;
    	nom_detail_button.addEventListener('click', add_detail_window);
        
        photo_options = Ti.UI.createButton({
        	backgroundImage: '../images/stream_option_button.png',
        	width: 25,
        	height: 25,
            right: 5,
            top: 5,
            bottom: 5
        });
        photo_options.nom_id = data[i].id;
        photo_options.photo_id = data[i].photo.id;
        photo_options.addEventListener('click', open_options);
        
        photo_action_row.add(add_comment);
        photo_action_row.add(nom_detail_button);
        photo_action_row.add(photo_options);
        
        photo_action_cont.add(photo_action_row);
        photo_action_cont.add(comments_cont);
        
        render_comments(comments_cont, data[i].quick_comments);
        
        row.add(photo_action_cont);
        
        row.add(nominator_footer);
        row.add(post_time_cont);
    	row.add(main_image);

        section.add(row);
        section.created_time = data[i].created_time;
        
        active_data.push(section);
    }
    tv.setData(active_data);
}

function init_active_view(){
    render_active_view(active_noms_cache);
}

function activate_photos_view(){
    if (view_active != 'photos'){
        view_active = 'photos';
        photos_nav.backgroundImage = '../images/profile_button_selected.png';
        trophies_nav.backgroundImage = '../images/profile_button_unselected.png';
        active_nav.backgroundImage = '../images/profile_button_unselected.png';
        
        tv.setData(list_view_data);
    }
}

function activate_trophies_view(){
    if (view_active != 'trophies'){
        view_active = 'trophies';
        photos_nav.backgroundImage = '../images/profile_button_unselected.png';
        trophies_nav.backgroundImage = '../images/profile_button_selected.png';
        active_nav.backgroundImage = '../images/profile_button_unselected.png';
        
        tv.setData([]);
        
        init_trophies_view();
    }
}

function activate_active_view(){
    if (view_active != 'active'){
        view_active = 'active';   
        photos_nav.backgroundImage = '../images/profile_button_unselected.png';
        trophies_nav.backgroundImage = '../images/profile_button_unselected.png';
        active_nav.backgroundImage = '../images/profile_button_selected.png';
        
        tv.setData([]);
        
        init_active_view();
    }
}

function add_follow_window(method){
    var w = Ti.UI.createWindow({backgroundColor:"#333", url:'user/follow.js'});
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

    user_photo_request.onload = function()
    {   
        var data = JSON.parse(this.responseData);
        
        if (data.photos.length > 0){
            render_user_photos(data.photos, false);
            if (data.photos.length == 10){
                oldest_photo = data.photos[data.photos.length - 1].created_time;
            }
        }
        else{
            // load_more_view.hide();
        }
    };
    
    var url = SERVER_URL + '/api/get_user_photos/?fb_user=' + user + '&create_date=' + oldest_photo;
    user_photo_request.open('GET', url);

    // send the data
    user_photo_request.send();
}

function init_profile_view(){
    var user_image = null;
    win.hideNavBar({animated:false});
    
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
        font: {fontSize: 20, fontWeight: 'bold'}
    });
    
    profile_header.add(name_label);
    
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

    load_more_button.addEventListener('click', load_more_photos);
    load_more_view.add(load_more_button);
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
    
    var xhr = Titanium.Network.createHTTPClient();

    xhr.onload = function()
    {   
        user_image = Ti.UI.createImageView({
            image: this.location,
            defaultImage: '../images/photo_loader.png',
            left: 10,
            top: 10,
            hires: true,
            height: 80,
            width: 80
        });
        
        cropImage(user_image,100,100,10,10);
        
        profile_header.add(user_image);
    };
    
    var url = 'https://graph.facebook.com/' + user + '/picture?type=large';
    xhr.open('GET', url);

    // send the data
    xhr.send();
    
    follow_cont = Titanium.UI.createView({
        backgroundColor: '#fff',
        borderRadius: 3,
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
        image: '../images/right_triangle.png',
        defaultImage: '../images/photo_loader.png',
        right: 143,
        top: 12,
        hires: true,
        height: 7,
        width: 3
    });
    
    followers_label.add(followers_right_triangle);
    
    followers_label.addEventListener('click', function(){
        add_follow_window('followers');
    });
    
    var following_label = Titanium.UI.createLabel({
        text: 'Following',
        color: '#333',
        left: 110,
        font: {fontSize: 13}
    });
    
    var following_right_triangle = Ti.UI.createImageView({
        image: '../images/right_triangle.png',
        defaultImage: '../images/photo_loader.png',
        right: 38,
        top: 12,
        hires: true,
        height: 7,
        width: 3
    });
    
    following_label.add(following_right_triangle);
    
    following_label.addEventListener('click', function(){
        add_follow_window('following');
    });
    
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
    
    var follow_count_request = Titanium.Network.createHTTPClient();

    follow_count_request.onload = function()
    {   
        var data = JSON.parse(this.responseData);
        var follow_count = Titanium.UI.createLabel({
            text: data.followers,
            color: '#333',
            left: 80,
            font: {fontSize: 18, fontWeight: 'bold'}
        });
        
        var following_count = Titanium.UI.createLabel({
            text: data.following,
            color: '#333',
            left: 184,
            font: {fontSize: 18, fontWeight: 'bold'}
        });
        
        follow_cont.add(follow_count);
        follow_cont.add(following_count);
    };
    
    var url = SERVER_URL + '/api/get_follow_count/?fb_user=' + user;
    follow_count_request.open('GET', url);

    // send the data
    follow_count_request.send();

    profile_nav_cont = Titanium.UI.createView({
        width: 210,
        height: 30,
        left: 100,
        bottom: 0
    });
    
    photos_nav = Titanium.UI.createView({
        backgroundImage: '../images/profile_button_selected.png',
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
        backgroundImage: '../images/profile_button_unselected.png',
        width: 64,
        height: 25,
        left: 70,
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
        backgroundImage: '../images/profile_button_unselected.png',
        width: 64,
        height: 25,
        left: 140,
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
    
    var user_photo_request = Titanium.Network.createHTTPClient();

    user_photo_request.onload = function()
    {   
        var data = JSON.parse(this.responseData);
        active_noms_cache = data.active_noms;
        
        if (data.photos.length > 0){
            render_user_photos(data.photos, false);
            if (data.photos.length == 10){
                oldest_photo = data.photos[data.photos.length - 1].created_time;
                load_more_view.show();
            }
        }
        else{
            var empty_label = Titanium.UI.createLabel({
                text: name.split(' ')[0] + ' has not taken any photos.',
                color: '#fff',
                textAlign: 'center',
                font: {fontSize: 18}
            });
            var row = Ti.UI.createTableViewRow({
                    height:'auto',
                    selectionStyle: Titanium.UI.iPhone.TableViewCellSelectionStyle.NONE
            });
            row.add(empty_label);
            
            list_view_data = [row];
            tv.setData(list_view_data);
        }
        
        if (active_noms_cache.length > 0){
            render_active_count(active_noms_cache.length);
        }
        if (data.trophy_count > 0){
            render_trophy_count(data.trophy_count);
        }
    };
    
    var url = SERVER_URL + '/api/get_user_photos/?fb_user=' + user;
    user_photo_request.open('GET', url);

    // send the data
    user_photo_request.send();
    
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

    var lastUpdatedLabel = Ti.UI.createLabel({
    	text:"Last Updated: "+formatDate(),
    	left:55,
    	width:200,
    	bottom:15,
    	height:"auto",
    	color:"#ffffff",
    	textAlign:"center",
    	font:{fontSize:12},
    });
    var actInd = Titanium.UI.createActivityIndicator({
    	left:20,
    	bottom:13,
    	width:30,
    	height:30
    });
    
    tableHeader.add(arrow);
    tableHeader.add(statusLabel);
    tableHeader.add(lastUpdatedLabel);
    tableHeader.add(actInd);

    tv.headerPullView = tableHeader;
    
    var pulling = false;
    var reloading = false;

    function beginReloading()
    {
        var xhr = Titanium.Network.createHTTPClient();

        xhr.onload = function()
        {
        	data = JSON.parse(this.responseData);
        	if (data.length > 0){
                // list_view_data = [ ];
                //                 update_notifications(data);
                //                 render_notifications(notification_cache);
        	}
            endReloading();
        };
        
        var url = '';
        if (notification_cache.length > 0){
            url = SERVER_URL + '/api/get_active_notifications/?fb_user=' + me.fid + '&new_date=' + newest_notification;
        }
        else{
            url = SERVER_URL + '/api/get_active_notifications/?fb_user=' + me.fid;
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
    	lastUpdatedLabel.text = "Last Updated: "+formatDate();
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


user = me.fid
name = me.name;

init_profile_view();