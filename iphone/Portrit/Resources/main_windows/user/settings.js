var win = Ti.UI.currentWindow;

window_nav_bar = Titanium.UI.createView({
    backgroundImage: '../../images/iphone_header_blank.png',
    width: 320,
    height: 40,
    top: 0
});

var back = Ti.UI.createButton({
	title:"Profile",
	font: {fontSize: 12, fontWeight: 'bold'},
	backgroundImage: '../../images/back.png',
	width: 68,
	height: 32,
    left: 0
});

back.addEventListener('click', function(){
    win.close();
});

window_nav_bar.add(back);

var header_label = Titanium.UI.createLabel({
    text: 'Options',
    color: '#fff',
    textAlign: 'center',
    font:{fontSize:22, fontWeight: 'bold'}
});
window_nav_bar.add(header_label);
win.add(window_nav_bar);

var fadeIn = Titanium.UI.createAnimation({
    curve: Ti.UI.ANIMATION_CURVE_EASE_IN,
    opacity: 1.0,
    duration: 300
});

var tv = Ti.UI.createTableView({
    backgroundColor: '#eee',
    top: 40,
    style:Titanium.UI.iPhone.TableViewStyle.GROUPED
});
    
tv.addEventListener('click', function(e){

});
win.add(tv);

Ti.include('../../settings.js');
Ti.include('../../includes.js');
Ti.include('../../urbanairship.js');

var me = JSON.parse(Ti.App.Properties.getString("me")),
    tabGroup = win.tabGroup,
    user = null,
    window_nav_bar = null,
    back_buttom = null,
    button_label = null,
    user_settings_data = null,
    name = '';

function open_email_dialog(type){
    var emailDialog = Titanium.UI.createEmailDialog();
    if (!emailDialog.isSupported()) {
    	Ti.UI.createAlertDialog({
    		title:'Error',
    		message:'Email not available'
    	}).show();
    	return;
    }
    if (type == 'feedback'){
        emailDialog.setSubject('Feedback from anonymous');
        emailDialog.setToRecipients(['feedback@portrit.com']);
    }
    else if (type == 'support'){
        emailDialog.setSubject('Support for ' + me.fid);
        emailDialog.setToRecipients(['support@portrit.com']);
    }

    if (Ti.Platform.name == 'iPhone OS') {
        emailDialog.setHtml(true);
        // emailDialog.setBarColor('#336699');
    } else {
        
    }

    emailDialog.addEventListener('complete',function(e)
    {
        if (e.result == emailDialog.SENT)
        {
            // if (Ti.Platform.osname != 'android') {
            //     // android doesn't give us useful result codes.
            //     // it anyway shows a toast.
            //     alert("message was sent");
            // }
        }
        else
        {

        }
    });
    emailDialog.open();
}

var init_options = function(){
    var options_data = [ ];
    
    // Find/Follow Section
    var section = Titanium.UI.createTableViewSection({
        
    });
    
    var row = Ti.UI.createTableViewRow({
            hasChild: true,
            title: 'Find friends',
            color: '#333',
            font:{fontSize: 18, fontWeight: 'bold'},
            backgroundColor: '#fff'
    });
    row.addEventListener('click', function(){
        var win = Ti.UI.createWindow({backgroundColor:"#eee", url:'settings/find_friends.js', title: 'Find Friends'});
        Titanium.UI.currentTab.open(win,{animated:true});
    });
    section.add(row);
    
    var row = Ti.UI.createTableViewRow({
            hasChild: true,
            title: 'Invite friends',
            color: '#333',
            font:{fontSize: 18, fontWeight: 'bold'},
            backgroundColor: '#fff'
    });
    row.addEventListener('click', function(){
        Titanium.Contacts.showContacts({ });
    });
    section.add(row);
    
    var row = Ti.UI.createTableViewRow({
            hasChild: true,
            title: 'Search Portrit',
            color: '#333',
            font:{fontSize: 18, fontWeight: 'bold'},
            backgroundColor: '#fff'
    });
    row.addEventListener('click', function(){
        var win = Ti.UI.createWindow({backgroundColor:"#eee", url:'settings/search_portrit.js', title: 'Search Portrit'});
        Titanium.UI.currentTab.open(win,{animated:true});
    });
    section.add(row);
    
    options_data.push(section);
    
    // Account Section
    var account_label = Titanium.UI.createLabel({
	    text: 'Account',
        color: '#4c566d',
        left: 20,
        size: {width: 320, height: 20},
        font:{fontSize: 18, fontWeight: 'bold'}
    });
    var account_header = Titanium.UI.createView({
        height: 30,
        width: 320
    });
    account_header.add(account_label);
    
    var section = Titanium.UI.createTableViewSection({
        headerView: account_header
    });
    
    var row = Ti.UI.createTableViewRow({
            hasChild: true,
            title: 'Sharing options',
            color: '#333',
            font:{fontSize: 18, fontWeight: 'bold'},
            backgroundColor: '#fff'
    });
    row.addEventListener('click', function(){
        var win = Ti.UI.createWindow({backgroundColor:"#eee", url:'settings/sharing.js', title: 'Sharing options'});
        Titanium.UI.currentTab.open(win,{animated:true});
    });
    section.add(row);
    
    var row = Ti.UI.createTableViewRow({
            hasChild: true,
            title: 'Notifications',
            color: '#333',
            font:{fontSize: 18, fontWeight: 'bold'},
            backgroundColor: '#fff'
    });
    row.addEventListener('click', function(){
        var win = Ti.UI.createWindow({backgroundColor:"#eee", url:'settings/notifications.js', title: 'Notifications'});
        Titanium.UI.currentTab.open(win,{animated:true});
    });
    section.add(row);
    
    var row = Ti.UI.createTableViewRow({
            hasChild: true,
            title: 'Privacy',
            color: '#333',
            font:{fontSize: 18, fontWeight: 'bold'},
            backgroundColor: '#fff'
    });
    row.addEventListener('click', function(){
        var win = Ti.UI.createWindow({backgroundColor:"#eee", url:'settings/privacy.js', title: 'Privacy'});
        Titanium.UI.currentTab.open(win,{animated:true});
    });
    section.add(row);
    
    var logout = Titanium.Facebook.createLoginButton({
        'style':'wide'
    });
    Titanium.Facebook.addEventListener('logout', function(e) {
        var file = Titanium.Filesystem.getFile(Titanium.Filesystem.applicationDataDirectory,'twitter.config');
        if (file.exists()) { file.deleteFile(); }
        Ti.App.Properties.removeProperty("push_notifications");
        
        UrbanAirship.unregister(function(){
            
        });
        
        Ti.App.fireEvent('logout', { });
    });
    
    var row = Ti.UI.createTableViewRow({
        color: '#333',
        font:{fontSize: 18, fontWeight: 'bold'},
        backgroundColor: '#fff',
        selectionStyle: Titanium.UI.iPhone.TableViewCellSelectionStyle.NONE
    });
    row.add(logout);
    section.add(row);
    options_data.push(section);
    
    // About Section
    var about_label = Titanium.UI.createLabel({
	    text: 'About',
        color: '#4c566d',
        left: 20,
        size: {width: 320, height: 20},
        font:{fontSize: 18, fontWeight: 'bold'}
    });
    var about_header = Titanium.UI.createView({
        height: 30,
        width: 320
    });
    about_header.add(about_label);
    
    var section = Titanium.UI.createTableViewSection({
        headerView: about_header
    });
    
    var row = Ti.UI.createTableViewRow({
            hasChild: true,
            title: 'Portrit on the tubes',
            color: '#333',
            font:{fontSize: 18, fontWeight: 'bold'},
            backgroundColor: '#fff'
    });
    row.addEventListener('click', function(){
        var win = Ti.UI.createWindow({backgroundColor:"#eee", url:'settings/portrit_on_tubes.js', title: 'Search Portrit'});
        Titanium.UI.currentTab.open(win,{animated:true});
    });
    section.add(row);
    
    var row = Ti.UI.createTableViewRow({
            hasChild: true,
            title: 'Contact support',
            color: '#333',
            font:{fontSize: 18, fontWeight: 'bold'},
            backgroundColor: '#fff'
    });
    row.addEventListener('click', function(){
        open_email_dialog('support');
    });
    section.add(row);
    
    var row = Ti.UI.createTableViewRow({
            hasChild: true,
            title: 'Send feedback',
            color: '#333',
            font:{fontSize: 18, fontWeight: 'bold'},
            backgroundColor: '#fff'
    });
    row.addEventListener('click', function(){
        open_email_dialog('feedback');
    });
    section.add(row);
    
    var row = Ti.UI.createTableViewRow({
            hasChild: true,
            title: 'Terms of Service',
            color: '#333',
            font:{fontSize: 18, fontWeight: 'bold'},
            backgroundColor: '#fff'
    });
    row.addEventListener('click', function(){
        var win = Ti.UI.createWindow({backgroundColor:"#eee", url:'settings/terms.js', title: 'Terms of Service'});
        Titanium.UI.currentTab.open(win,{animated:true});
    });
    section.add(row);
    
    var row = Ti.UI.createTableViewRow({
            hasChild: true,
            title: 'Privacy Policy',
            color: '#333',
            font:{fontSize: 18, fontWeight: 'bold'},
            backgroundColor: '#fff'
    });
    row.addEventListener('click', function(){
        var win = Ti.UI.createWindow({backgroundColor:"#eee", url:'settings/privacy_policy.js', title: 'Privacy Policy'});
        Titanium.UI.currentTab.open(win,{animated:true});
    });
    section.add(row);
    
    var row = Ti.UI.createTableViewRow({
            title: 'Version',
            color: '#333',
            font:{fontSize: 18, fontWeight: 'bold'},
            backgroundColor: '#fff',
            selectionStyle: Titanium.UI.iPhone.TableViewCellSelectionStyle.NONE
    });
    var version_label = Titanium.UI.createLabel({
	    text: VERSION,
        color: '#666',
        right: 15,
        size: {width: 'auto', height: 'auto'},
        font:{fontSize: 18}
    });
    row.add(version_label);
    section.add(row);
    
    options_data.push(section);
    
    tv.setData(options_data);
    
    //Load user settings data
    var xhr = Titanium.Network.createHTTPClient();

    xhr.onload = function(){
    	data = JSON.parse(this.responseData);
    	user_settings_data = data;
    	Ti.App.Properties.setString("user_settings", JSON.stringify(user_settings_data));
    };
    
    var url = SERVER_URL + '/api/get_user_settings/?access_token=' + me.access_token;
    
    xhr.open('GET', url);

    // send the data
    xhr.send();
};

setTimeout(init_options, 100);

Ti.App.addEventListener('reset', function(eventData) {
    win.close();
});

Ti.App.addEventListener('close_settings_page', function(eventData) {
    win.close({animated:false});
});