Ti.include('settings.js');

// this sets the background color of the master UIView (when there are no windows/tab groups on it)
Titanium.UI.setBackgroundColor('#000');

//Facebook auth
Titanium.Facebook.appid = "126374870731237";
Titanium.Facebook.permissions = ['read_stream','publish_stream','user_photos','user_videos','friends_photos','friends_videos','friends_status','user_photo_video_tags','friends_photo_video_tags','offline_access','email'];

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
 text:'I am Window 1',
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
 text:'I am Window 2',
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
 text:'I am Window 3',
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
 text:'I am Window 4',
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
 text:'I am Window 5',
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

function load_portrit(){
    me = JSON.parse(Ti.App.Properties.getString("me"));
    me.fid = Titanium.Facebook.uid;
    me.access_token = Titanium.Facebook.accessToken;
    
    // open tab group
    tabGroup.open();
    
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

if (!Titanium.Facebook.loggedIn){
    var landing_win = Titanium.UI.createWindow({
        backgroundImage: 'images/background.png'
    });
    Titanium.UI.iPhone.setStatusBarStyle(Titanium.UI.iPhone.StatusBar.OPAQUE_BLACK);
    
    landing_win.add(Titanium.Facebook.createLoginButton({
        'style':'wide',
        bottom: 50
    }));
    
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
    
    Titanium.Facebook.addEventListener('login', function(e) {
        // Titanium.Facebook.removeEventListener('login');
    	if (e.success) {
    	    me = {
    	        'name': e.data.name,
    	        'fid': e.data.id
    	    };
    	    me.access_token = Titanium.Facebook.accessToken;
            Ti.App.Properties.setString("me", JSON.stringify(me));
            landing_win.close();
            load_portrit();
    	}
    	if (e.error) {
    		alert(e.error);
        }
    });
}
else{
    load_portrit();
}
