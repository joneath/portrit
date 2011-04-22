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
        text: 'Privacy',
        color: '#fff',
        textAlign: 'center',
        font:{fontSize:22, fontWeight: 'bold'}
    });
window_nav_bar.add(header_label);
win.add(window_nav_bar);

Ti.include('../../../settings.js');
Ti.include('../../../includes.js');

var me = JSON.parse(Ti.App.Properties.getString("me")),
    user_settings = JSON.parse(Ti.App.Properties.getString("user_settings")),
    user = null,
    window_nav_bar = null,
    back_buttom = null,
    button_label = null,
    name = '';

function change_permission(method, value){
    var xhr = Titanium.Network.createHTTPClient();

    xhr.onload = function()
    {
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
    
function init_privacy(){
    var options_data = [ ];
    
    var privacy_label = Titanium.UI.createLabel({
	    text: 'Privacy',
        color: '#4c566d',
        left: 20,
        size: {width: 'auto', height: 'auto'},
        font:{fontSize: 18, fontWeight: 'bold'}
    });
    var privacy_header = Titanium.UI.createView({
        height: 30,
        width: 'auto'
    });
    privacy_header.add(privacy_label);
    
    var privacy_text_label = Titanium.UI.createLabel({
	    text: 'Toggle to promp permission on follows',
        color: '#4c566d',
        textAlign: 'center',
        top: 5,
        size: {width: 'auto', height: 'auto'},
        font:{fontSize: 12}
    });
    var privacy_footer = Titanium.UI.createView({
        height: 'auto',
        width: 'auto'
    });
    privacy_footer.add(privacy_text_label);
    
    var section = Titanium.UI.createTableViewSection({
        headerView: privacy_header,
        footerView: privacy_footer
    });
    // 
    // var row = Ti.UI.createTableViewRow({
    //         title: 'Post GPS Data',
    //         color: '#333',
    //         font:{fontSize: 18, fontWeight: 'bold'},
    //         backgroundColor: '#fff',
    //         selectionStyle: Titanium.UI.iPhone.TableViewCellSelectionStyle.NONE
    // });
    // var gps_permission = false;
    // if (user_settings.gps){
    //     gps_permission = true;
    // }
    // var gps_switch = Titanium.UI.createSwitch({
    //     value: gps_permission,
    //     right: 10
    // });
    // gps_switch.addEventListener('change', function(e){
    //     change_permission('gps', e.value);
    // });
    // row.add(gps_switch);
    // section.add(row);
    
    var row = Ti.UI.createTableViewRow({
            title: 'Public Follows',
            color: '#333',
            font:{fontSize: 18, fontWeight: 'bold'},
            backgroundColor: '#fff',
            selectionStyle: Titanium.UI.iPhone.TableViewCellSelectionStyle.NONE
    });
    var follow_permission = false;
    if (user_settings.follows){
        follow_permission = true;
    }
    var privacy_switch = Titanium.UI.createSwitch({
        value: follow_permission,
        right: 10
    });
    privacy_switch.addEventListener('change', function(e){
        change_permission('privacy', e.value);
    });
    row.add(privacy_switch);
    section.add(row);
    
    options_data.push(section);
    
    tv.setData(options_data);
}
    
tv = Ti.UI.createTableView({
        backgroundColor: '#eee',
        top: 40,
        style:Titanium.UI.iPhone.TableViewStyle.GROUPED
    });

tv.addEventListener('click', function(e){

});

win.add(tv);

init_privacy();