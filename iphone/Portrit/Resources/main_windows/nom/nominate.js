Ti.include('../../settings.js');
Ti.include('../../includes.js');

var win = Ti.UI.currentWindow,
    tv = null,
    me = JSON.parse(Ti.App.Properties.getString("me")),
    photo_id = null,
    user = null,
    passed_user = null,
    name = '',
    photo = null,
    window_nav_bar = null,
    back_buttom = null,
    button_label = null,
    list_view_data = [ ];

// var myWin = Titanium.UI.currentWindow; 
// myWin.hideTabBar();
// win.modal = true;
// win.tabBarHidden = true;

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
    title: 'Back',
    font: {fontSize: 11, fontWeight: 'bold'},
    backgroundImage: '../../images/back.png'
});

back_buttom.addEventListener('click', function(){
    win.close();
});

window_nav_bar.add(back_buttom);

var header_label = Titanium.UI.createLabel({
        text: 'Nominate',
        color: '#fff',
        textAlign: 'center',
        font:{fontSize:22, fontWeight: 'bold'}
    });
window_nav_bar.add(header_label);

win.add(window_nav_bar);

var fadeTo = Titanium.UI.createAnimation({
    curve: Ti.UI.ANIMATION_CURVE_EASE_IN,
    opacity: 0.5,
    duration: 200
});

var fadeIn = Titanium.UI.createAnimation({
    curve: Ti.UI.ANIMATION_CURVE_EASE_IN,
    opacity: 1.0,
    duration: 200
});

var fadeOut = Titanium.UI.createAnimation({
    curve: Ti.UI.ANIMATION_CURVE_EASE_IN,
    opacity: 0,
    duration: 200
});

var selected_noms = { }
var selcted_trophies_cont = null,
var selected_trophy_count = 0;
function trophy_selected(e){
    var cat = e.source.nom_cat;
    var index = e.source.index;
    var nom_cat_underscore = cat.replace(' ', '_').toLowerCase();
    
    if (typeof(selected_noms[nom_cat_underscore]) != "undefined"){
        if (selected_trophy_count == 3){
            max_trophy_selected_cont.hide();
            trophy_scroll_view.animate({opacity: 1, duration:200})
        }
        
        trophy_thumbs[index].animate(fadeIn);
        selected_noms[nom_cat_underscore].animate(fadeOut);
        setTimeout(function(){
            selcted_trophies_cont.remove(selected_noms[nom_cat_underscore]);
            delete selected_noms[nom_cat_underscore];
            
            var count = 0
            for (var cat in selected_noms){
                selected_noms[cat].animate({right:count * 60, duration:100});
                count += 1;
            }
        }, 200);
        selected_trophy_count -=1;
    }
    else{
        if (selected_trophy_count < 3){
            trophy_thumbs[index].animate(fadeTo);

            var trophy = Ti.UI.createImageView({
        		image: '../../images/trophies/large/' + nom_cat_underscore + '.png',
        		defaultImage: '../../images/photo_loader.png',
        		width: 50,
        		height: 100,
        		top: 0,
        		opacity: 0,
        		right: selected_trophy_count * 60,
        		hires: true
        	});
        	trophy.index = index;
        	trophy.nom_cat = cat;
        	trophy.addEventListener('click', trophy_selected);
            selcted_trophies_cont.add(trophy);
            trophy.animate(fadeIn);

            selected_noms[nom_cat_underscore] = trophy;
            selected_trophy_count +=1;

            if (selected_trophy_count == 3){
                max_trophy_selected_cont.show();
                trophy_scroll_view.animate({opacity: .3, duration:200})
            }
        }
    }
}

function post_nom(e){	
	var nominations = '';
    var selected_nom_count = 0;
	for (cat in selected_noms){
	    if (cat){
	        nominations += nom_cat_to_text(cat) + ',';
	        selected_nom_count += 1;
	    }
	}
	
	if (selected_nom_count > 0){
	    var w = Ti.UI.createWindow({backgroundColor:"#eee", url:'share.js'});
    	Titanium.UI.currentTab.open(w,{animated:true});
    	
	    var tagged_users = '';
    	for (user in tagged_friends){
    	    if (user){
    	        tagged_users += user + ',';
    	    }
    	}

    	setTimeout(function(){
    	    Ti.App.fireEvent('pass_nom_data', {
                user: passed_user,
                name: name,
                photo: photo,
                nominations: nominations,
                tagged_users: tagged_users
            });
    	}, 100);
	}
	else{
	    var nominations_empty_message_background = Titanium.UI.createView({
    	    backgroundColor: '#000',
            opacity: .8,
            borderRadius: 5,
            height: '100%',
            width: '100%',
            zIndex: -1
        });
        
	    var nominations_empty_message_cont = Titanium.UI.createView({
            height: 'auto',
            width: 'auto',
            top: 150,
            zIndex: 10
        });
        nominations_empty_message_cont.add(nominations_empty_message_background);
        
	    var nominations_empty_message = Titanium.UI.createLabel({
    	    text: 'Please select at least one trophy.',
            color: '#fff',
            left: 10,
            right: 10,
            top: 10,
            bottom: 10,
            size: {width: 'auto', height: 'auto'},
            font:{fontSize:16, fontWeight: 'bold'}
        });
        nominations_empty_message_cont.add(nominations_empty_message);
        win.add(nominations_empty_message_cont);
        
        var fadeOutSlow = Titanium.UI.createAnimation({
            curve: Ti.UI.ANIMATION_CURVE_EASE_IN,
            opacity: 0,
            delay: 2000,
            duration: 1000
        });
        nominations_empty_message_cont.animate(fadeOutSlow);
	}
}

var tagged_friends_count = 0;
function tag_follower(e){
    var tag_user = e.rowData.user,
        name = e.rowData.name,
        index = e.index,
        tagged = e.rowData.tagged;
        
    var row = following_row_list[index];
    
    if (tagged){
        row.tagged = false;
        row.hasCheck = false;
        row.backgroundColor = '#fff';
        tagged_friends_count -= 1;
        
        tagged_friends[tag_user].animate(fadeOut);
        setTimeout(function(){
            tag_heading.remove(tagged_friends[tag_user]);
            delete tagged_friends[tag_user];
            
            var count = 0;
            for (var tagged_user in tagged_friends){
                if (tagged_user != undefined){
                    tagged_friends[tagged_user].animate({left:(count * 33) + 3, duration:100});
                    count += 1;
                }
            }
        }, 200);
        
        if (tagged_friends_count == 0){
            tag_heading_label.show();
        }
    }
    else{
        row.tagged = true;
        row.hasCheck = true;
        row.backgroundColor = '#dedede';
        
        tagged_friends[tag_user] = Ti.UI.createImageView({
    		image: 'https://graph.facebook.com/' + tag_user + '/picture?type=square',
    		defaultImage: '../../images/photo_loader.png',
    		left: (33 * tagged_friends_count) + 3,
    		width: 30,
    		height: 30,
    		opacity: 0,
    		hires: highres
    	});
    	
    	if (tagged_friends_count == 0){
            tag_heading_label.hide();
        }
    	
    	tag_heading.add(tagged_friends[tag_user]);
    	tagged_friends[tag_user].animate(fadeIn);
    	
    	tagged_friends_count += 1;
    }
    
}

var following_row_list = [ ];
function render_following_list(data, append){
    following_row_list = [ ];
    for (var i = 0; i < data.length; i++){
        var row = Ti.UI.createTableViewRow({
                height:'30',
                selectionStyle: Titanium.UI.iPhone.TableViewCellSelectionStyle.NONE
        });
        
        var profile_image = Ti.UI.createImageView({
    		image: 'https://graph.facebook.com/' + data[i].fid + '/picture?type=square',
    		defaultImage: '../../images/photo_loader.png',
    		left: 3,
    		width: 25,
    		height: 25,
    		hires: highres
    	});
    	row.add(profile_image);
    	
    	var name_label = Titanium.UI.createLabel({
    	    text: data[i].name,
            color: '#333',
            left: 33,
            size: {width: 'auto', height: 'auto'},
            font:{fontSize:12, fontWeight: 'bold'}
        });
        row.add(name_label);
        row.user = data[i].fid;
        row.name = data[i].name;
        if (typeof(tagged_friends[data[i].fid]) == "undefined"){
            row.tagged = false;
        }
        else{
            row.tagged = true;
            row.hasCheck = true;
            row.backgroundColor = '#dedede';
        }
        row.addEventListener('click', tag_follower);
        
        if (append){
            tag_search_list_cont.appendRow(row);
        }
        else{
            following_row_list.push(row);
        }
        
    }
    if (typeof(append) == "undefined"){
        tag_search_list_cont.setData(following_row_list);
    }
}

function hide_tag_window(e){
    tag_cont.animate({bottom:-250, duration:300, curve: Ti.UI.ANIMATION_CURVE_EASE_IN_OUT});
}

function show_tag_window(e){
    tag_cont.animate({bottom:0, duration:300, curve: Ti.UI.ANIMATION_CURVE_EASE_IN_OUT});
    if (following_cache.length == 0){
        var xhr = Titanium.Network.createHTTPClient();

        xhr.onload = function()
        {   
            var data = JSON.parse(this.responseData);
            if (data.data.length > 0){
                following_cache = data.data;
                following_count = data.count;
                render_following_list(following_cache);
            }
        };
        
        var url = '';
        if (user == me.fid){
            url = SERVER_URL + '/api/get_my_follow_data/?user=' + me.fid + '&method=following&all=True&page=' + following_page;
        }
        else{
            url = SERVER_URL + '/api/get_follow_data/?source=' + me.fid + '&target=' + user + '&method=following&all=True&page=' + following_page;   
        }
        xhr.open('GET', url);

        // send the data
        xhr.send();
    }
    else{
        render_following_list(following_cache);
    }
}

function update_following_cache(data){
    for (var i = 0; i < data.length; i++){
        following_cache.push(data[i]);
    }
}

function get_more_following(){
    getting_following = true;
    following_page += 1;
    var xhr = Titanium.Network.createHTTPClient();

    xhr.onload = function()
    {   
        var data = JSON.parse(this.responseData);
        if (data.data.length > 0){
            getting_following = false;
            update_following_cache(data.data);
            render_following_list(data.data, true);
        }
    };
    var url = '';
    if (user == me.fid){
        url = SERVER_URL + '/api/get_my_follow_data/?user=' + me.fid + '&method=following&page=' + following_page;
    }
    else{
        url = SERVER_URL + '/api/get_follow_data/?source=' + me.fid + '&target=' + user + '&method=following&page=' + following_page;   
    }
    xhr.open('GET', url);

    // send the data
    xhr.send();
}

function search_following(e){
    var value = e.value;
    
    if (value != ''){
        var len = following_cache.length;
        var ret = [ ];
        var q = value.toLowerCase();
        for(i=0; i< len; i++){
            val = following_cache[i].name;
            if(val.toLowerCase().indexOf(q) === 0){
                ret.push(following_cache[i]);
            }
        }
        following_row_list = [ ];
        tag_search_list_cont.setData(following_row_list);
        render_following_list(ret);
    }
    else{
        following_row_list = [ ];
        tag_search_list_cont.setData(following_row_list);
        render_following_list(following_cache);
    }
}

var following_page = 1;
var following_cache = [ ];
var following_count = 0;
var getting_following = false;
var tag_cont = null;
var tagged_friends = { };
var trophy_thumbs = [ ];
var max_height = 252;

function init_nominate_view(){
    tv = Ti.UI.createTableView({
            backgroundColor: '#000',
            separatorStyle: 0,
            // scrollable: false,
            top: 40,
            style: Titanium.UI.iPhone.TableViewStyle.PLAIN
        });
        
    tv.addEventListener('click', function(e){

    });
    
    win.add(tv);
    
    var photo_row = Ti.UI.createTableViewRow({
            height: max_height,
            selectionStyle: Titanium.UI.iPhone.TableViewCellSelectionStyle.NONE
    });
    
    var photo_width = 320;
    var photo_height = max_height;
    
    main_image = Ti.UI.createImageView({
		image: '',
		defaultImage: '../../images/photo_loader.png',
		width: photo_width,
		height: photo_height,
		hires: true
	});
	photo_row.add(main_image);
	
	selcted_trophies_cont = Titanium.UI.createView({
        height: 100,
        width: 320,
        bottom: 0,
        right: 0
    });
    photo_row.add(selcted_trophies_cont);
	
	list_view_data.push(photo_row);
	
    // var caption_row = Ti.UI.createTableViewRow({
    //             height:'auto',
    //             selectionStyle: Titanium.UI.iPhone.TableViewCellSelectionStyle.NONE
    //     });
    // 
    // var caption = Titanium.UI.createTextField({
    //     backgroundColor: '#fff',
    //     color: '#333',
    //     width: 320,
    //     height: 30,
    //         paddingLeft: 5,
    //         paddingRight: 5,
    //     font: {fontSize: 12, fontWeight: 'bold'},
    //     hintText: 'Add Caption',
    //     top: 0
    // });
    // caption.addEventListener('focus', function(){
    //     return false;
    // });
    // 
    // caption.addEventListener('blur', function(){
    //         tv.scrollToTop(0);
    // });
    // 
    // caption_row.add(caption);
    // list_view_data.push(caption_row);
	
	var select_trophy_row = Ti.UI.createTableViewRow({
            height:'auto',
            selectionStyle: Titanium.UI.iPhone.TableViewCellSelectionStyle.NONE
    });
    
    photo_border_top = Titanium.UI.createView({
	    backgroundColor: '#000',
        opacity: .3,
        height: 2,
        width: 320,
        top: 0,
        right: 0,
        zIndex: 10
    });
    select_trophy_row.add(photo_border_top);
    
    photo_border_bottom = Titanium.UI.createView({
	    backgroundColor: '#000',
        opacity: .3,
        height: 2,
        width: 320,
        bottom: 0,
        right: 0,
        zIndex: 10
    });
    select_trophy_row.add(photo_border_bottom);
    
    var scroll_width = (76 * 10);
    trophy_scroll_view = Titanium.UI.createScrollView({
    	contentWidth: scroll_width,
    	contentHeight: 130,
    	top: 0,
    	height: 130,
    	width: 320,
    	backgroundColor: '#222',
    	showVerticalScrollIndicator:false,
    	showHorizontalScrollIndicator:true
    });
    
    var nom_cat_underscore = '';
    var nom_cat_list = ['Fail','Party Animal','LOL','Awesome','Hot','WTF','Artsy','Cute','Yummy','Creepy']
    for (var i = 0; i < nom_cat_list.length; i++){
        nom_cat_underscore = nom_cat_list[i].replace(' ', '_').toLowerCase();
        trophy_cont = Titanium.UI.createView({
            height: 130,
            width: 76,
            left: (76 * i),
            top: 0
        });
        
        trophy_label = Titanium.UI.createLabel({
    	    text: nom_cat_list[i],
            color: '#fff',
            bottom: 8,
            size: {width: 'auto', height: 'auto'},
            font:{fontSize:12, fontWeight: 'bold'}
        });
        trophy_cont.add(trophy_label);
        
        trophy = Ti.UI.createImageView({
    		image: '../../images/trophies/large/' + nom_cat_underscore + '.png',
    		defaultImage: '../../images/photo_loader.png',
    		width: 50,
    		height: 100,
    		top: 0,
    		hires: true
    	});
        trophy_label.nom_cat = nom_cat_list[i];
    	trophy_label.index = i;
    	trophy.nom_cat = nom_cat_list[i];
    	trophy.index = i;
    	trophy_cont.nom_cat = nom_cat_list[i];
    	trophy_cont.index = i;
    	trophy_thumbs.push(trophy_cont);
    	trophy_cont.addEventListener('click', trophy_selected);
    	
    	trophy_cont.add(trophy);
    	
    	trophy_scroll_view.add(trophy_cont);
	}
	
	max_trophy_selected_cont = Titanium.UI.createView({
        height: 130,
        width: 320
    });
	max_trophy_selected = Titanium.UI.createLabel({
	    text: 'Max Selected',
        color: '#fff',
        size: {width: 'auto', height: 'auto'},
        font:{fontSize:16, fontWeight: 'bold'}
    });
    max_trophy_selected_cont.add(max_trophy_selected);
    max_trophy_selected_cont.hide();
	
    select_trophy_row.add(max_trophy_selected_cont)
    select_trophy_row.add(trophy_scroll_view);
    list_view_data.push(select_trophy_row);
    
    var nominate_action_row = Ti.UI.createTableViewRow({
            height: 'auto',
            selectionStyle: Titanium.UI.iPhone.TableViewCellSelectionStyle.NONE
    });
    
    var action_cont = Titanium.UI.createView({
        height: 38,
        width: 320
    });
    
    var post_nom_button = Ti.UI.createButton({
        backgroundImage: '../../images/post_button.png',
    	title:"Next",
    	width: 160,
    	height: 38,
    	right: 0,
        font: {fontSize: 16, fontWeight: 'bold'}
    });
    post_nom_button.nom_cat = nom_cat_list[i];
    post_nom_button.index = i;
    post_nom_button.addEventListener('click', post_nom);
    
    var tag_nom_button = Ti.UI.createButton({
        backgroundImage: '../../images/tag_button.png',
    	title:"Tag",
    	width: 160,
    	height: 38,
        left: 0,
        font: {fontSize: 16, fontWeight: 'bold'}
    });
    tag_nom_button.addEventListener('click', show_tag_window);
    
    action_cont.add(tag_nom_button);
    action_cont.add(post_nom_button);
    nominate_action_row.add(action_cont);
    
    tag_cont = Titanium.UI.createView({
        backgroundColor: '#222',
        bottom: -250,
        height: 250,
        width: 320,
        zIndex: 10
    });
    
    tag_heading = Titanium.UI.createView({
        top: 0,
        height: 40,
        width: 320
    });
    
    tag_heading_label = Titanium.UI.createLabel({
	    text: 'No followers tagged yet.',
        color: '#fff',
        size: {width: 'auto', height: 'auto'},
        font:{fontSize:16, fontWeight: 'bold'}
    });
    tag_heading.add(tag_heading_label);
    tag_cont.add(tag_heading);
    
    var tag_search_cont = Titanium.UI.createView({
        top: 40,
        height: 30,
        width: 320
    });
    
    var hint_text = '';
    tag_search = Titanium.UI.createTextField({
	    backgroundColor: '#fff',
	    color: '#333',
	    width: 320,
	    height: 30,
        paddingLeft: 5,
        paddingRight: 5,
	    font: {fontSize: 16, fontWeight: 'bold'},
	    hintText: hint_text,
	    top: 0
	});
	tag_search_cont.add(tag_search);
	tag_cont.add(tag_search_cont);
	tag_cont.addEventListener('click', function(){
	    tag_search.blur();
	});
	tag_search.addEventListener('focus', function(){
        tag_cont.animate({bottom:175, duration:300, curve: Ti.UI.ANIMATION_CURVE_EASE_IN_OUT});
	    return false;
	});
	tag_search.addEventListener('blur', function(){
        tag_cont.animate({bottom:0, duration:300, curve: Ti.UI.ANIMATION_CURVE_EASE_IN_OUT});
	});
	tag_search.addEventListener('change', search_following);
    
    tv.addEventListener('click', function(){
        // caption.blur();
	    tag_search.blur();
	});
	
	tag_search_border = Titanium.UI.createView({
	    backgroundColor: '#dedede',
        top: 70,
        height: 1,
        width: 320
    });
    tag_cont.add(tag_search_border);
	
	tag_search_list_cont = Ti.UI.createTableView({
            backgroundColor: '#fff',
            separatorStyle: 0,
            // scrollable: false,
            height: 141,
            top: 71,
            style: Titanium.UI.iPhone.TableViewStyle.PLAIN
        });
    tag_search_list_cont.addEventListener('scroll', function(e){
        var offset = e.contentOffset.y;
        var height = e.contentSize.height;
        
        if (offset >= height - 200 && !getting_following && following_cache.length < following_count){
            get_more_following();
        }
    });
        
    tag_cont.add(tag_search_list_cont);
    
    tagging_complete_button = Ti.UI.createButton({
        backgroundImage: '../../images/finish_tag_button.png',
    	title:"Finish Tagging",
    	width: 320,
    	height: 38,
        bottom: 0,
        font: {fontSize: 16, fontWeight: 'bold'}
    });
    tagging_complete_button.addEventListener('click', hide_tag_window)
    tag_cont.add(tagging_complete_button);
    
    win.add(tag_cont);
    
    list_view_data.push(nominate_action_row);
    
	
	
	tv.setData(list_view_data);
	
}

init_nominate_view();

Ti.App.addEventListener('pass_photo_data', function(eventData) {
    name = String(eventData.name);
    user = String(eventData.user);
    passed_user = user;
    photo = eventData.photo;
    
    if (Ti.Platform.displayCaps.density == 'high') {
        if (photo.width > Ti.Platform.displayCaps.platformWidth){
            photo_width = Ti.Platform.displayCaps.platformWidth;
        }
        else{
            photo_width = photo.width;
        }
        
        if (photo.height && photo.height > max_height){
            photo_width = max_height * (photo.width / photo.height);
            photo_height = photo_width * (photo.height / photo.width);
        }
        else{
            photo_height = max_height;
        }
        highres = true;
    }
    else{
        photo_height = 320;
        photo_width = 320;
        highres = false;
    }
    
    var source = '';
    
    if (photo.source){
        source = photo.source;
    }
    else{
        source = photo.src;
    }
    main_image.height = photo_height;
    main_image.width = photo_width;
    main_image.image = source;
    
    if (user == me.fid){
        hint_text = 'Search your following';
    }
    else{
        hint_text = 'Search mutual following';
    }
    tag_search.hintText = hint_text;
});

Ti.App.addEventListener('close_nominate_page', function(eventData) {
    win.close(); 
});

