Ti.include('../../settings.js');
Ti.include('../../includes.js');

var me = JSON.parse(Ti.App.Properties.getString("me")),
    win = Ti.UI.currentWindow,
    tv = null,
    user = null,
    method = null,
    window_nav_bar = null,
    back_buttom = null,
    button_label = null,
    list_view_data = [ ],
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
    title: 'Profile',
    font: {fontSize: 11, fontWeight: 'bold'},
    backgroundImage: '../../images/back.png'
});

back_buttom.addEventListener('click', function(){
    win.close();
});

window_nav_bar.add(back_buttom);

win.add(window_nav_bar);

function go_to_profile(e){
    var w = Ti.UI.createWindow({backgroundColor:"#333", url:'profile.js'});
	Titanium.UI.currentTab.open(w,{animated:true});
	
	setTimeout(function(){
	    Ti.App.fireEvent('pass_user', {
            user: e.rowData.user_fid,
            name: e.rowData.username
        });
	}, 200);
}

function render_follow_table_view(data){
    var row = null,
        profile_image = null,
        follow_button = null,
        name = null;
    
    for (var i = 0; i < data.length; i++){
        row = Ti.UI.createTableViewRow({
                height:'auto'
        });
        
        profile_image = Ti.UI.createImageView({
    		image: 'https://graph.facebook.com/' + data[i].fid + '/picture?type=square',
    		left: 5,
    		width: 35,
    		height: 35,
    		hires: true
    	});
        
        name = Titanium.UI.createLabel({
            color: '#333',
            text: data[i].name,
            font: {fontSize: 16, fontWeight: 'bold'},
            left: 45
        });
        
        if (data[i].follow){
            follow_button = Ti.UI.createButton({
            	title:"Follow",
            	width:100,
            	height:40,
            	right: 0
            });
            row.add(follow_button);
        }
        
        row.user_fid = data[i].fid;
        row.username = data[i].name;
        row.addEventListener('click', go_to_profile);
        
        row.add(profile_image);
        row.add(name);
        
        list_view_data.push(row);
    }
    tv.setData(list_view_data);
}

function init_follow_view(){
    tv = Ti.UI.createTableView({
            minRowHeight:50, 
            backgroundColor: '#fff',
            separatorStyle: 1,
            top: 40,
            style: Titanium.UI.iPhone.TableViewStyle.PLAIN
        });
    
    win.add(tv);
    
    var xhr = Titanium.Network.createHTTPClient();
    
    xhr.onload = function()
    {   
        render_follow_table_view(JSON.parse(this.responseData));
    };
    
    var url = SERVER_URL + '/api/get_follow_data/?source=' + me.fid + '&target=' + user + '&method=' + method;
    xhr.open('GET', url);
    
    // send the data
    xhr.send();
}

Ti.App.addEventListener('pass_user_follow', function(eventData) {
    user = String(eventData.user);
    name = String(eventData.name);
    method = String(eventData.method);
    
    init_follow_view();
});