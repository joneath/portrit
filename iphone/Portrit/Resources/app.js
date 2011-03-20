Ti.include('settings.js');

// this sets the background color of the master UIView (when there are no windows/tab groups on it)
Titanium.UI.setBackgroundColor('#000');

//Facebook auth
Titanium.Facebook.appid = "155664697800227";
Titanium.Facebook.permissions = ['read_stream','publish_stream','user_photos','user_videos','friends_photos','friends_videos','friends_status','user_photo_video_tags','friends_photo_video_tags','offline_access','email'];

var window_slide_out = Titanium.UI.createAnimation({
    curve: Ti.UI.ANIMATION_CURVE_EASE_IN,
    right: 320,
    duration: 250
});

var window_slide_in = Titanium.UI.createAnimation({
    curve: Ti.UI.ANIMATION_CURVE_EASE_IN,
    left: 0,
    duration: 300
});

var me = { };

// create tab group
var tabGroup = Titanium.UI.createTabGroup({id:'tabGroup1'});

//
// create base UI tab and root window
//
var win1 = Titanium.UI.createWindow({  
    title:'Stream',
    url:'main_windows/active.js',
    backgroundColor:'#000'
});
win1.hideNavBar({animated:false});

Titanium.UI.iPhone.setStatusBarStyle(Titanium.UI.iPhone.StatusBar.OPAQUE_BLACK);

var tab1 = Titanium.UI.createTab({  
    icon:'images/active_button.png',
    title:'Stream',
    window:win1
});

var label1 = Titanium.UI.createLabel({
 color:'#999',
 font:{fontSize:20,fontFamily:'Helvetica Neue'},
 textAlign:'center',
 width:'auto'
});

win1.add(label1);

//
// create controls tab and root window
//
var win2 = Titanium.UI.createWindow({  
    title:'Community',
    url:'main_windows/community.js',
    backgroundColor:'#000'
});
win2.hideNavBar({animated:false});
var tab2 = Titanium.UI.createTab({  
    icon:'images/com_button.png',
    title:'Community',
    window:win2
});

var label2 = Titanium.UI.createLabel({
 color:'#999',
 font:{fontSize:20,fontFamily:'Helvetica Neue'},
 textAlign:'center',
 width:'auto'
});

win2.add(label2);

var win3 = Titanium.UI.createWindow({  
    title:'Share',
    backgroundColor:'#000'
});
var tab3 = Titanium.UI.createTab({ 
    icon:'images/camera_button.png',
    title:'Share',
    window:win3
});

var label3 = Titanium.UI.createLabel({
 color:'#999',
 font:{fontSize:20,fontFamily:'Helvetica Neue'},
 textAlign:'center',
 width:'auto'
});

win3.add(label3);

//Win 4
var win4 = Titanium.UI.createWindow({  
    title:'Updates',
    url:'main_windows/notifications.js',
    backgroundColor:'#000'
});
win4.hideNavBar({animated:false});
var tab4 = Titanium.UI.createTab({  
    icon:'images/notification_button.png',
    title:'Updates',
    window:win4
});

var label4 = Titanium.UI.createLabel({
 color:'#999',
 font:{fontSize:20,fontFamily:'Helvetica Neue'},
 textAlign:'center',
 width:'auto'
});

win4.add(label4);

//Win 5
var win5 = Titanium.UI.createWindow({  
    title:'Profile',
    url:'main_windows/profile.js',
    backgroundColor:'#000'
});
win5.hideNavBar({animated:false});
var tab5 = Titanium.UI.createTab({  
    icon:'images/profile_button.png',
    title:'Profile',
    window:win5
});

var label5 = Titanium.UI.createLabel({
 color:'#999',
 font:{fontSize:20,fontFamily:'Helvetica Neue'},
 textAlign:'center',
 width:'auto'
});

win5.add(label5);

//
//  add tabs
//
tabGroup.addTab(tab1);
tabGroup.addTab(tab2);
tabGroup.addTab(tab3);
tabGroup.addTab(tab4);
tabGroup.addTab(tab5);

function load_portrit(animate){
    me = JSON.parse(Ti.App.Properties.getString("me"));
    me.fid = Titanium.Facebook.uid;
    me.access_token = Titanium.Facebook.accessToken;
    
    if (animate){
        tabGroup.left = 320;
        tabGroup.open(window_slide_in);
    }
    else{
        tabGroup.open();
    }
    
    // Node.js updates
    // var xhr = Titanium.Network.createHTTPClient();
    // var url = SERVER_URL + '/watch_update/?user=' + me.fid;
    // 
    // xhr.setTimeout(30000);
    // 
    // xhr.onload = function(){
    //  var data = JSON.parse(this.responseData);
    //  alert(data);
    //  
    //  xhr.open('GET', url);
    // 
    //     // send the data
    //     xhr.send();
    // };
    // 
    // xhr.onerror = function(){
    //     setTimeout(function(){
    //         xhr.open('GET', url);
    // 
    //         // send the data
    //         xhr.send();
    //     }, 5000);
    // }
    // 
    // xhr.open('GET', url);
    // 
    // // send the data
    // xhr.send();
}

function init_new_user(){
    var create_account_win = Titanium.UI.createWindow({
        left: 320,
        width: 320,
    });
    
    var logo_cont = Titanium.UI.createView({
            height: 'auto',
            top: 20,
            bottom: 20,
            width: 320,
            layout: 'vertical'
        });
    
    var logo = Ti.UI.createImageView({
		image: 'images/logo.png',
		top: 30,
		bottom: 10,
		height: 89,
		width: 200
	});
	logo_cont.add(logo);
	
	var signup_text = Titanium.UI.createLabel({
	    text: 'Almost there, just a few loose ends.',
	    textAlign: 'center',
        color: '#fff',
        top: 10,
        bottom: 10,
        size: {width: 'auto', height: 'auto'},
        font:{fontSize:16, fontWeight: 'bold'}
    });
    logo_cont.add(signup_text);
    
    tv = Ti.UI.createTableView({
            backgroundImage: 'images/background.png',
            headerView: logo_cont,
            scrollable: false,
            style:Titanium.UI.iPhone.TableViewStyle.GROUPED
        });

    tv.addEventListener('click', function(e){

    });
    var tv_data = [ ];
    var section = Titanium.UI.createTableViewSection({
        
    });
    
    var row = Ti.UI.createTableViewRow({
            backgroundColor: '#fff',
            selectionStyle: Titanium.UI.iPhone.TableViewCellSelectionStyle.NONE
    });
    
    username = Titanium.UI.createTextField({
        backgroundColor: '#fff',
        color: '#333',
        width: 290,
        height: 35,
        paddingLeft: 5,
        paddingRight: 5,
        font: {fontSize: 18},
        hintText: 'Username',
        returnKeyType: Titanium.UI.RETURNKEY_GO,
    });
    username.addEventListener('focus', function(){
        tv.scrollToTop(120);
    });
    username.addEventListener('blur', function(){
        // tv.scrollToTop(0);
    });
    username.addEventListener('return', function(e){
        if (username.value != ''){
            var xhr = Titanium.Network.createHTTPClient();
            xhr.onload = function(){
                var data = JSON.parse(this.responseData);
                if (data){
                    create_account_win.close(window_slide_out);
                    load_portrit(true);
                }
            };

            var url = SERVER_URL + '/api/add_username/';
            xhr.open('POST', url);
            xhr.send({
                'username': username.value,
                'post_wins': post_wins.value,
                'access_token': me.access_token
            });
        }
        else{
            
        }
    });
    var check_name_aval = null;
    username.addEventListener('change', function(e){
        if (e.value != ''){
            clearTimeout(check_name_aval);
            check_name_aval = setTimeout(function(){
                username_activity.zIndex = 2;
                var xhr = Titanium.Network.createHTTPClient();
                xhr.onload = function(){
                    username_activity.zIndex = -1;
                    var data = JSON.parse(this.responseData);
                    if (data == true){
                        
                    }
                    else{
                        
                    }
                };

                var url = SERVER_URL + '/api/check_username_availability/';
                xhr.open('POST', url);
                xhr.send({
                    'username': e.value
                });
            }, 1000);
        }
    });
    
    username_activity = Titanium.UI.createActivityIndicator({
        height:50,
        width:10,
        right: 10,
        zIndex: 2,
        style: Titanium.UI.iPhone.ActivityIndicatorStyle.DARK
    });
    row.add(username_activity);
    row.add(username);    
    section.add(row);
    tv_data.push(section);
    
    var section = Titanium.UI.createTableViewSection({
        
    });
    
    var row = Ti.UI.createTableViewRow({
            backgroundColor: '#fff',
            selectionStyle: Titanium.UI.iPhone.TableViewCellSelectionStyle.NONE
    });
    
    var post_wins_label = Titanium.UI.createLabel({
	    text: 'Post Wins to Facebook',
	    textAlign: 'left',
        color: '#333',
        left: 10,
        size: {width: 'auto', height: 'auto'},
        font:{fontSize:14, fontWeight: 'bold'}
    });
    row.add(post_wins_label);
    
    var post_wins = Titanium.UI.createSwitch({
        value: true,
        right: 10
    });
    row.add(post_wins);
    section.add(row);
    
    tv_data.push(section);
    
    tv.setData(tv_data);
    create_account_win.add(tv);
    landing_win.animate(window_slide_out);
    create_account_win.open(window_slide_in);
}

if (!Titanium.Facebook.loggedIn){
    landing_win = Titanium.UI.createWindow({
        backgroundImage: 'images/background.png',
        width: 320,
    });
    Titanium.UI.iPhone.setStatusBarStyle(Titanium.UI.iPhone.StatusBar.OPAQUE_BLACK);
    
    fb_button = Titanium.Facebook.createLoginButton({
        'style':'wide',
        bottom: 50
    });
    
    landing_win.add(fb_button);
    
    var blurb_text = Titanium.UI.createLabel({
            text: 'TEST TEXT', 
            color: '#fff',
            textAlign: 'center',
            font:{fontSize:16},
            width: 200,
            zIndex: 2,
            top: 50
        });
        
    landing_win.add(blurb_text);
    
    var logo = Ti.UI.createImageView({
		image: 'images/logo.png',
		left: 'auto',
		top: 80,
		height: 89,
		width: 200
	});
	landing_win.add(logo);
    
    landing_win.open();
    
    // setTimeout(function(){
    //     init_new_user();
    // }, 400);
    
    Titanium.Facebook.addEventListener('login', function(e) {
        // Titanium.Facebook.removeEventListener('login');
    	if (e.success) {
            landing_win.remove(fb_button);
    	    me = {
    	        'name': e.data.name,
    	        'fid': e.data.id
    	    };
    	    me.access_token = Titanium.Facebook.accessToken;
            Ti.App.Properties.setString("me", JSON.stringify(me));
            // landing_win.close({animated:true});
            
            var actInd = Titanium.UI.createActivityIndicator({
                height:50,
                width:10,
                message: 'Signing In',
                color: '#fff',
                style: Titanium.UI.iPhone.ActivityIndicatorStyle.BIG,
                bottom: 50
            });
            actInd.show();
            landing_win.add(actInd);
            
            var xhr = Titanium.Network.createHTTPClient();
            xhr.onload = function()
            {
                actInd.hide();
                var data = JSON.parse(this.responseData);
                if (data.auth == 'valid' && data['new'] == true){
                    me.access_token = data.access_token;
                    Ti.App.Properties.setString("me", JSON.stringify(me));
                    init_new_user();
                }
                else if (data.auth == 'valid' && data['new'] == false){
                    me.access_token = data.access_token;
                    Ti.App.Properties.setString("me", JSON.stringify(me));
                    landing_win.animate(window_slide_out);
                    load_portrit(true);
                }
            };

            var url = SERVER_URL + '/api/login/';

            xhr.open('POST', url);

            // send the data
            xhr.send({
                'fb_user': me.fid,
                'access_token': me.access_token
            });
    	}
    	if (e.error) {
    		alert(e.error);
        }
    });
}
else{
    load_portrit(false);
}
