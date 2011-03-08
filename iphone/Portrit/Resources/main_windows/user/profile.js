Ti.include('../../settings.js');
Ti.include('../../includes.js');

var win = Ti.UI.currentWindow,
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
    left: 5,
    title: 'Stream',
    font: {fontSize: 11, fontWeight: 'bold'},
    backgroundImage: '../../images/back.png'
});

back_buttom.addEventListener('click', function(){
    win.close();
});

window_nav_bar.add(back_buttom);

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
        top: 0,
        height: 20,
        width: 20,
        zIndex: 1
    });
    
    profile_nav_cont.add(active_count);
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
        nominate_photo = Titanium.UI.createLabel({
            backgroundColor: '#ff396d',
            color: '#fff',
            text: 'Nominate',
            font: {fontSize: 20, fontWeight: 'bold'},
            textAlign: 'center',
            right: 0,
            top: 0,
            height: 26,
            width: 110,
            zIndex: 1
        });
        nominate_photo.photo_id = data[i].id;
        
        photo_header = Titanium.UI.createView({
            height: 25,
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
        
        if (Ti.Platform.displayCaps.density == 'high') {
            photo_width = Ti.Platform.displayCaps.platformWidth;
            if (data[i].height){
                photo_height = photo_width * (data[i].height / data[i].width);
            }
            else{
                photo_height = 320;
            }
            highres = true;
        }
        else{
            photo_height = 320;
            photo_width = 320;
            highres = false;
        }

        main_image = Ti.UI.createImageView({
    		image: data[i].source,
    		left: 0,
    		bottom: 0,
    		top: 1,
    		width: photo_width,
    		height: photo_height,
    		hires: highres
    	});
    	
    	post_time_cont = Titanium.UI.createView({
            backgroundColor: '#000',
            borderRadius: 5,
            opacity: 0.8,
            left: 5,
            bottom: 5,
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
    	
    	row.add(post_time_cont);
    	row.add(main_image);

        section.add(row);
        section.created_time = data[i].created_time;
        
        list_view_data.push(section);
    }
    tv.setData(list_view_data);
}

function add_detail_window(e){
    var w = Ti.UI.createWindow({backgroundColor:"#333", url:'../nom/detail.js'});
	Titanium.UI.currentTab.open(w,{animated:true});
	
	setTimeout(function(){
	    Ti.App.fireEvent('pass_detail', {
            cat: e.source.cat_name,
            user: user,
            won: true
        });
	}, 200);
}

function render_trophies(data){
    var row1 = null,
        row2 = null,
        trophy_cont = null,
        trophy_img = null,
        trophy_count = null,
        trophy_pos_count = 0,
        cat_name_underscore = '';
        
    row1 = Ti.UI.createTableViewRow({
            height: 110,
            selectionStyle: Titanium.UI.iPhone.TableViewCellSelectionStyle.NONE
    });
    
    row2 = Ti.UI.createTableViewRow({
            height: 110,
            selectionStyle: Titanium.UI.iPhone.TableViewCellSelectionStyle.NONE
    });
        
    for (var i = 0; i < data.length; i++){
        cat_name_underscore = data[i].cat_name.replace(' ', '_').toLowerCase();
        
        trophy_cont = Titanium.UI.createView({
            left: 10 + (60 * trophy_pos_count),
            bottom: 15,
            top: 15,
            height: 100,
            width: 50
        });
        
        trophy_cont.addEventListener('click', add_detail_window);
        
        trophy_img = Ti.UI.createImageView({
    		image: '../../images/trophies/large/' + cat_name_underscore + '.png',
    		width: 50,
    		height: 100,
    		hires: true
    	});
    	trophy_img.cat_name = data[i].cat_name;
    	
    	trophy_cont.add(trophy_img);
    	
    	trophy_count = Titanium.UI.createLabel({
    	    text: data[i].count,
            color: '#fff',
            backgroundColor: get_nom_cat_color(cat_name_underscore),
            borderRadius: 15,
            left: 5,
            top: 70,
            right: 5,
            bottom: 5,
            textAlign: 'center',
            size: {width: 30, height: 30},
            font:{fontSize:18, fontWeight: 'bold'}
        });
        trophy_count.cat_name = data[i].cat_name;
        trophy_cont.add(trophy_count);
        
        if (i <= 4){
            row1.add(trophy_cont);
        }
        else{
            row2.add(trophy_cont);
        }
        
        if (i != 4){
            trophy_pos_count += 1;
        }
        else{
            trophy_pos_count = 0;
        }
    }
    trophy_data.push(row1);
    trophy_data.push(row2);
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
            won: false
        });
	}, 200);
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
            textAlign: 'center',
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
        
        if (Ti.Platform.displayCaps.density == 'high') {
            photo_width = Ti.Platform.displayCaps.platformWidth;
            if (data[i].photo.height){
                photo_height = photo_width * (data[i].photo.height / data[i].photo.width);
            }
            else{
                photo_height = 320;
            }
            highres = true;
        }
        else{
            photo_height = 320;
            photo_width = 320;
            highres = false;
        }
        
        main_image = Ti.UI.createImageView({
    		image: data[i].photo.src,
    		left: 0,
    		width: photo_width,
    		height: photo_height,
    		hires: highres
    	});
    	
    	main_image.nom_id = data[i].id;
    	main_image.addEventListener('click', add_detail_window);
    	
    	post_time_cont = Titanium.UI.createView({
            backgroundColor: '#000',
            borderRadius: 5,
            opacity: 0.8,
            right: 5,
            bottom: 50,
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
    	
    	nom_detail_button = Ti.UI.createButton({
    	    backgroundImage: '../../images/plus_icon.png',
        	title:"  Detail",
        	width: 78,
        	height: 34,
        	right: 0
        });
        nom_detail_button.nom_id = data[i].id;
    	nom_detail_button.addEventListener('click', add_detail_window);
        
        nominator_footer.add(nom_detail_button);
        
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
        photos_nav.backgroundImage = '../../images/profile_button_selected.png';
        trophies_nav.backgroundImage = '../../images/profile_button_unselected.png';
        active_nav.backgroundImage = '../../images/profile_button_unselected.png';
        
        tv.setData(list_view_data);
    }
}

function activate_trophies_view(){
    if (view_active != 'trophies'){
        view_active = 'trophies';
        photos_nav.backgroundImage = '../../images/profile_button_unselected.png';
        trophies_nav.backgroundImage = '../../images/profile_button_selected.png';
        active_nav.backgroundImage = '../../images/profile_button_unselected.png';
        
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
        
        tv.setData([]);
        
        init_active_view();
    }
}

function add_follow_window(method){
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

    // load_more_button.addEventListener('click', load_more_noms);

    load_more_view.add(load_more_button);
    load_more_view.hide();

    tv = Ti.UI.createTableView({
            minRowHeight:50, 
            backgroundColor: '#222',
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
        image: '../../images/right_triangle.png',
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
        image: '../../images/right_triangle.png',
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
        backgroundImage: '../../images/profile_button_unselected.png',
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
    };
    
    var url = SERVER_URL + '/api/get_user_photos/?fb_user=' + user;
    user_photo_request.open('GET', url);

    // send the data
    user_photo_request.send();
    
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

Ti.App.addEventListener('pass_user', function(eventData) {
    user = String(eventData.user);
    name = String(eventData.name);
    
    init_profile_view();
});