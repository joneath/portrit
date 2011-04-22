var win = Ti.UI.currentWindow;
var tv = null;
    
window_nav_bar = Titanium.UI.createView({
    backgroundImage: '../../../images/iphone_header_blank.png',
    width: 320,
    height: 40,
    top: 0
});

var back = Ti.UI.createButton({
	title:"Back",
	font: {fontSize: 12, fontWeight: 'bold'},
	backgroundImage: '../../../images/back.png',
	width: 68,
	height: 32,
    left: 0
});

back.addEventListener('click', function(){
    win.close();
});

window_nav_bar.add(back);

var header_label = Titanium.UI.createLabel({
        text: 'Notifications',
        color: '#fff',
        textAlign: 'center',
        font:{fontSize:22, fontWeight: 'bold'}
    });
window_nav_bar.add(header_label);
win.add(window_nav_bar);

tv = Ti.UI.createTableView({
        backgroundColor: '#eee',
        top: 40,
        style:Titanium.UI.iPhone.TableViewStyle.GROUPED
    });

tv.addEventListener('click', function(e){

});

win.add(tv);

Ti.include('../../../settings.js');
Ti.include('../../../includes.js');

var me = JSON.parse(Ti.App.Properties.getString("me")),
var user_settings = JSON.parse(Ti.App.Properties.getString("user_settings"));
var user = null;
var window_nav_bar = null;
var back_buttom = null;
var button_label = null;
var name = '';

function change_permission(method, value){
    var xhr = Titanium.Network.createHTTPClient();

    xhr.onload = function(){
    	data = JSON.parse(this.responseData);
    	user_settings_data = data;
    	Ti.App.Properties.setString("user_settings", JSON.stringify(user_settings_data));
    };
    
    var url = SERVER_URL + '/api/change_user_settings/';
    
    xhr.open('POST', url);

    // send the data
    xhr.send({
        'access_token': me.access_token,
        'method': method,
        'value': value
    });
}

var notification_view = function init_notifications(){
    var data = [ ];
    
    var push_label = Titanium.UI.createLabel({
	    text: 'Push',
        color: '#4c566d',
        left: 20,
        size: {width: 'auto', height: 'auto'},
        font:{fontSize: 18, fontWeight: 'bold'}
    });
    var push_header = Titanium.UI.createView({
        height: 30,
        width: 'auto'
    });
    push_header.add(push_label);
    
    var section = Titanium.UI.createTableViewSection({
        headerView: push_header
    });
    
    //Push Comments
    var row = Ti.UI.createTableViewRow({
            backgroundColor: '#fff',
            selectionStyle: Titanium.UI.iPhone.TableViewCellSelectionStyle.NONE
    });
    var row_label = Titanium.UI.createLabel({
	    text: 'Comments',
        color: '#333',
        left: 10,
        size: {width: 'auto', height: 'auto'},
        font:{fontSize: 16, fontWeight: 'bold'}
    });
    row.add(row_label);
    
    var push_comments = false;
    if (user_settings.push_on_comment){
        push_comments = true;
    }
    var push_comments_switch = Titanium.UI.createSwitch({
        value: push_comments,
        right: 10
    });
    push_comments_switch.addEventListener('change', function(e){
        change_permission('push_comments', e.value);
    });
    row.add(push_comments_switch);
    section.add(row);
    
    
    //Push Follows
    var row = Ti.UI.createTableViewRow({
            backgroundColor: '#fff',
            selectionStyle: Titanium.UI.iPhone.TableViewCellSelectionStyle.NONE
    });
    var row_label = Titanium.UI.createLabel({
	    text: 'Follows',
        color: '#333',
        left: 10,
        size: {width: 'auto', height: 'auto'},
        font:{fontSize: 16, fontWeight: 'bold'}
    });
    row.add(row_label);
    
    var push_follow = false;
    if (user_settings.push_on_follow){
        push_follow = true;
    }
    var push_follow_switch = Titanium.UI.createSwitch({
        value: push_follow,
        right: 10
    });
    push_follow_switch.addEventListener('change', function(e){
        change_permission('push_follow', e.value);
    });
    row.add(push_follow_switch);
    section.add(row);
    
    //Push Noms
    var row = Ti.UI.createTableViewRow({
            backgroundColor: '#fff',
            selectionStyle: Titanium.UI.iPhone.TableViewCellSelectionStyle.NONE
    });
    var row_label = Titanium.UI.createLabel({
	    text: 'Nominations',
        color: '#333',
        left: 10,
        size: {width: 'auto', height: 'auto'},
        font:{fontSize: 16, fontWeight: 'bold'}
    });
    row.add(row_label);
    
    var push_noms = false;
    if (user_settings.push_on_nomination){
        push_noms = true;
    }
    var push_noms_switch = Titanium.UI.createSwitch({
        value: push_noms,
        right: 10
    });
    push_noms_switch.addEventListener('change', function(e){
        change_permission('push_noms', e.value);
    });
    row.add(push_noms_switch);
    section.add(row);
    
    //Push Wins
    var row = Ti.UI.createTableViewRow({
            backgroundColor: '#fff',
            selectionStyle: Titanium.UI.iPhone.TableViewCellSelectionStyle.NONE
    });
    var row_label = Titanium.UI.createLabel({
	    text: 'Wins',
        color: '#333',
        left: 10,
        size: {width: 'auto', height: 'auto'},
        font:{fontSize: 16, fontWeight: 'bold'}
    });
    row.add(row_label);
    
    var push_wins = false;
    if (user_settings.push_on_wins){
        push_wins = true;
    }
    var push_wins_switch = Titanium.UI.createSwitch({
        value: push_wins,
        right: 10
    });
    push_wins_switch.addEventListener('change', function(e){
        change_permission('push_wins', e.value);
    });
    row.add(push_wins_switch);
    section.add(row);
    
    data.push(section);
    
    // Email
    var email_label = Titanium.UI.createLabel({
	    text: 'Email',
        color: '#4c566d',
        left: 20,
        size: {width: 'auto', height: 'auto'},
        font:{fontSize: 18, fontWeight: 'bold'}
    });
    var email_header = Titanium.UI.createView({
        height: 30,
        width: 'auto'
    });
    email_header.add(email_label);
    
    var section = Titanium.UI.createTableViewSection({
        headerView: email_header
    });
    
    //Email Follows
    var row = Ti.UI.createTableViewRow({
            backgroundColor: '#fff',
            selectionStyle: Titanium.UI.iPhone.TableViewCellSelectionStyle.NONE
    });
    var row_label = Titanium.UI.createLabel({
	    text: 'Follows',
        color: '#333',
        left: 10,
        size: {width: 'auto', height: 'auto'},
        font:{fontSize: 16, fontWeight: 'bold'}
    });
    row.add(row_label);
    
    var email_follows = false;
    if (user_settings.email_on_follow){
        email_follows = true;
    }
    var email_follows_switch = Titanium.UI.createSwitch({
        value: email_follows,
        right: 10
    });
    email_follows_switch.addEventListener('change', function(e){
        change_permission('email_follow', e.value);
    });
    row.add(email_follows_switch);
    section.add(row);
    
    //Email Nominations
    var row = Ti.UI.createTableViewRow({
            backgroundColor: '#fff',
            selectionStyle: Titanium.UI.iPhone.TableViewCellSelectionStyle.NONE
    });
    var row_label = Titanium.UI.createLabel({
	    text: 'Nominations',
        color: '#333',
        left: 10,
        size: {width: 'auto', height: 'auto'},
        font:{fontSize: 16, fontWeight: 'bold'}
    });
    row.add(row_label);
    
    var email_noms = false;
    if (user_settings.email_on_nomination){
        email_noms = true;
    }
    var email_noms_switch = Titanium.UI.createSwitch({
        value: email_follows,
        right: 10
    });
    email_noms_switch.addEventListener('change', function(e){
        change_permission('email_nomination', e.value);
    });
    row.add(email_noms_switch);
    section.add(row);
    
    //Email Wins
    var row = Ti.UI.createTableViewRow({
            backgroundColor: '#fff',
            selectionStyle: Titanium.UI.iPhone.TableViewCellSelectionStyle.NONE
    });
    var row_label = Titanium.UI.createLabel({
	    text: 'Wins',
        color: '#333',
        left: 10,
        size: {width: 'auto', height: 'auto'},
        font:{fontSize: 16, fontWeight: 'bold'}
    });
    row.add(row_label);
    
    var email_wins = false;
    if (user_settings.email_on_win){
        email_wins = true;
    }
    var email_wins_switch = Titanium.UI.createSwitch({
        value: email_wins,
        right: 10
    });
    email_wins_switch.addEventListener('change', function(e){
        change_permission('email_win', e.value);
    });
    row.add(email_wins_switch);
    section.add(row);
    
    
    data.push(section);
    
    tv.setData(data);
}();