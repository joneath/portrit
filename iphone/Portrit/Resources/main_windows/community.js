Ti.include('../settings.js');
Ti.include('../includes.js');

var me = JSON.parse(Ti.App.Properties.getString("me")),
    list_view_data = [ ],
    noms_loaded = { },
    photos_cache = [ ],
    active_cache = [ ],
    top_cache = [ ],
    newest_nom = null,
    oldest_nom = null,
    newest_photo = '',
    oldest_nom = '',
    selected_tab = 'photos';

var portrit_header_view = Titanium.UI.createView({
        height: 75,
        left: 0,
        top: 0,
        width: 320,
        backgroundColor: '#222'
    });
    
var header_tab_selection = Titanium.UI.createView({
        height: 35,
        left: 0,
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
        header_active_tab_matrix = header_active_tab_matrix.translate(0,0);
        
        var header_active_tab_animation = Titanium.UI.createAnimation();
        header_active_tab_animation.transform = header_active_tab_matrix;
        header_active_tab_animation.duration = 200;
        
    	header_tab_selection.animate(header_active_tab_animation);
        
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
        header_active_tab_matrix = header_active_tab_matrix.translate(105,0);
        
        var header_active_tab_animation = Titanium.UI.createAnimation();
        header_active_tab_animation.transform = header_active_tab_matrix;
        header_active_tab_animation.duration = 200;
        
    	header_tab_selection.animate(header_active_tab_animation);
        
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
        header_active_tab_matrix = header_active_tab_matrix.translate(210,0);
        
        var header_active_tab_animation = Titanium.UI.createAnimation();
        header_active_tab_animation.transform = header_active_tab_matrix;
        header_active_tab_animation.duration = 200;
        
    	header_tab_selection.animate(header_active_tab_animation);
    	
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

var win = Ti.UI.currentWindow;
var tv = Ti.UI.createTableView({
            minRowHeight:50, 
            backgroundColor: '#000',
            // allowsSelection: false,
            separatorStyle: 0,
            headerView: portrit_header_view,
            style: Titanium.UI.iPhone.TableViewStyle.PLAIN
        });
        
function render_community_photos(data){
    var row = null,
        photo = null,
        row_count = 0,
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
    		width: 100,
    		height: 75,
    		hires: true
    	});
    	photo.user = data[i].user_fid;
    	photo.name = data[i].name;
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

        nom_header = Titanium.UI.createView({
            height:35,
            left: 0,
            top: 0,
            width: 320,
            opacity: 0.9,
            backgroundColor: nom_cat_color
        });

        nominatee_profile_img_url = 'https://graph.facebook.com/' + nom.nominatee + '/picture?type=square';
        nominatee_profile_img = Ti.UI.createImageView({
    		image: nominatee_profile_img_url,
    		defaultImage: '../images/photo_loader.png',
    		left: 0,
    		top: 0,
    		height: 35,
    		width: 35,
    		hires: true,
    		zIndex: 1
    	});
    	nom_header.add(nominatee_profile_img);

    	nominatee_name = Titanium.UI.createLabel({
    	    text: nom.nominatee_name,
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
            right: 5,
            bottom: 5,
            textAlign: "right",
            size: {width: '100%', height: 'auto'},
            font:{fontSize: 20, fontWeight:'bold'}
        });
        
        nominatee_name_cont = Titanium.UI.createView({
            backgroundColor: '#222',
            borderRadius: 5,
            height: 20,
            left: 40,
            width: 'auto',
            zIndex: 1
        });
        
        nominatee_name_cont.add(nominatee_name);
        
        nom_header.add(nomination_cat_label);
        nom_header.add(nominatee_name_cont);
        
        nominatee_profile_img.user = nom.nominatee;
        nominatee_profile_img.name = nom.nominatee_name;
        nominatee_profile_img.addEventListener('click', add_profile_window);
    	
    	nominatee_name.user = nom.nominatee;
    	nominatee_name.name = nom.nominatee_name;
    	nominatee_name.addEventListener('click', add_profile_window);

        //Add Header to row
        section = Titanium.UI.createTableViewSection({
            headerView: nom_header
        });

        row = Ti.UI.createTableViewRow({
                height:'auto',
                backgroundColor:'#000',
                selectionStyle: Titanium.UI.iPhone.TableViewCellSelectionStyle.NONE
        });

        nominator_profile_img_url = 'https://graph.facebook.com/' + nom.nominator + '/picture?type=square';
        if (Ti.Platform.displayCaps.density == 'high') {
            photo_width = Ti.Platform.displayCaps.platformWidth;
            if (nom.photo.height){
                photo_height = photo_width * (nom.photo.height / nom.photo.width);
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
    		image: nom.photo.src,
    		defaultImage: '../images/photo_loader.png',
    		left: 0,
    		bottom: 10,
    		width: photo_width,
    		height: photo_height,
    		hires: highres
    	});
    	
    	main_image.nom_id = nom.id;
    	main_image.photo = nom.photo;
        // main_image.addEventListener('click', add_detail_window);

    	nominator_footer = Titanium.UI.createView({
    	    height:35,
            left: 0,
            top: photo_height - 34,
            width: 320,
            opacity: 0.8,
            backgroundColor: '#000',
            zIndex: 1
        });

    	nominator_profile_img_url = 'https://graph.facebook.com/' + nom.nominator + '/picture?type=square';
        nominator_profile_img = Ti.UI.createImageView({
    		image: nominator_profile_img_url,
    		defaultImage: '../images/photo_loader.png',
    		left: 0,
    		top: 0,
    		hires: true,
    		height: 35,
    		width: 35
    	});
    	
    	nominator_profile_img.user = nom.nominator;
    	nominator_profile_img.name = nom.nominator_name;
    	nominator_profile_img.addEventListener('click', add_profile_window);
    	
    	nominator_footer.add(nominator_profile_img);
    	
        // nom_detail_button = Ti.UI.createButton({
        //     backgroundImage: '../images/plus_icon.png',
        //          title:"  Detail",
        //          width: 78,
        //          height: 34,
        //          right: 0
        //         });
        //         nom_detail_button.nom_id = nom.id;
        //         nom_detail_button.photo = nom.photo;
        // nom_detail_button.addEventListener('click', add_detail_window);
        
        // nominator_footer.add(nom_detail_button);

        if (nom.caption){
            nominator_name = Titanium.UI.createLabel({
        	    text: 'Nominated by ' + nom.nominator_name,
                color: '#fff',
                left: 40,
                bottom: 15,
                width: 'auto',
                font:{fontSize:12}
            });

            nominator_footer.add(nominator_name);

            caption = Titanium.UI.createLabel({
        	    text: 'Caption: ' + nom.caption,
                color: '#fff',
                left: 40,
                top: 10,
                width: 'auto',
                font:{fontSize:12}
            });
            nominator_footer.add(caption);
        }
        else{
            nominator_name = Titanium.UI.createLabel({
        	    text: 'Nominated by ' + nom.nominator_name,
                color: '#fff',
                left: 40,
                width: 'auto',
                font:{fontSize:12}
            });

            nominator_footer.add(nominator_name);
        }
        
        nominator_name.user = nom.nominator;
        nominator_name.name = nom.nominator_name;
        nominator_name.addEventListener('click', add_profile_window);

        // nominated_for = Titanium.UI.createLabel({
        //          text: 'Nominated for',
        //     color: '#fff',
        //     opacity: 0.8,
        //     left: 5,
        //     top: 5,
        //     right: 32,
        //     bottom: 20,
        //     size: {width: 'auto', height: 'auto'},
        //     font:{fontSize:12}
        // });
        // 

        
        time = new Date(nom.created_time * 1000);
        time_diff = now - time;
        time_diff /= 1000;
        post_time = Titanium.UI.createLabel({
    	    text: secondsToHms(time_diff),
            color: '#fff',
            opacity: 0.8,
            left: 5,
            top: 5,
            right: 5,
            bottom: 5,
            size: {width: 'auto', height: 'auto'},
            font:{fontSize:12}
        });
        
        nominated_for_cont = Titanium.UI.createView({
            backgroundColor: '#000',
            borderRadius: 5,
            opacity: 0.8,
            right: 5,
            bottom: 50,
            height: 'auto',
            width: 'auto',
            zIndex: 1
        });
        
        // nominated_for_cont.add(nominated_for);
        // nominated_for_cont.add(nomination_cat_label);
        nominated_for_cont.add(post_time);
        
    	row.add(main_image);
    	row.add(nominated_for_cont);
    	row.add(nominator_footer);

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
        top_empty_label.hide();
        active_empty_label.hide();
        newest_nom = data[0].created_time;
        oldest_nom = data[data.length - 1].created_time;
        for (var i = 0; i < data.length; i++){
            render_nom(data[i], false);
        }
        if (data.length == 10){
            setTimeout(function(){
                // load_more_view.show();
            }, 300);
        }
    }
    else{
        // load_more_button.hide();
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
        var xhr = Titanium.Network.createHTTPClient();

        xhr.onload = function()
        {
            var data = JSON.parse(this.responseData);
            photos_cache = data;
            render_community_photos(photos_cache);
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
        };

        var url = '';

        url = SERVER_URL + '/api/get_community_nominations/';

        xhr.open('GET', url);

        // send the data
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
        var xhr = Titanium.Network.createHTTPClient();

        xhr.onload = function()
        {
            var data = JSON.parse(this.responseData);
            top_cache = data;
            if (top_cache.length > 0){
                render_active_list_view(top_cache);
            }
            else{
                tv.setData([empty_row]);
                top_empty_label.show();
            }
        };

        var url = '';

        url = SERVER_URL + '/api/get_community_top_stream/';

        xhr.open('GET', url);

        // send the data
        xhr.send(); 
    }
    else{
        render_active_list_view(top_cache);
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
        
function init_community_view(){
    win.add(tv);

    var xhr = Titanium.Network.createHTTPClient();
    
    xhr.onload = function(){
        var data = JSON.parse(this.responseData);
        
        if (data.length > 0){
            photos_cache = data;
            newest_photo = data[0].create_datetime;
            render_community_photos(data);
        }
        else{
            
        }
    };
    
    var url = SERVER_URL + '/api/get_community_photos/';
    xhr.open('GET', url);
    
    // send the data
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
    tableHeader.add(lastUpdatedLabel);
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
                    newest_photo = data[0].create_datetime;
                    update_photo_cache(data);
                    list_view_data = [ ];
                    render_community_photos(photos_cache);
                }
                else if (selected_tab == 'top'){
                    list_view_data = [ ];
                    render_active_list_view(data);
                }
                else if (selected_tab == 'winners'){
                    
                }
            }
            endReloading();
        };

        var url = '';
        if (selected_tab == 'photos'){
            url = SERVER_URL + '/api/get_community_photos/?new_date=' + newest_photo;
        }
        else if (selected_tab == 'top'){
            url = SERVER_URL + '/api/get_community_top_stream/';
        }
        else if (selected_tab == 'active'){
            if (active_cache.length > 0){
                url = SERVER_URL + '/api/get_community_nominations/&new_date=' + newest_nom;
            }
            else{
                url = SERVER_URL + '/api/get_community_nominations/';
            }
            
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
}

init_community_view();