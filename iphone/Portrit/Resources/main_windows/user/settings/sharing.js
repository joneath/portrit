Ti.include('../../../settings.js');
Ti.include('../../../includes.js');
Ti.include('lib/oauth_adapter.js');

var me = JSON.parse(Ti.App.Properties.getString("me")),
    win = Ti.UI.currentWindow,
    tv = null,
    user = null,
    window_nav_bar = null,
    back_buttom = null,
    button_label = null,
    name = '';
    
var oAuthAdapter = new OAuthAdapter(
        'rWxNvv8pOSB0t9kgT59xVc2IUQXH1l8ESpfOst5sggw',
        'RrYAd721jXeCJsp9QqtFw',
        'HMAC-SHA1');
        
oAuthAdapter.loadAccessToken('twitter');
    
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
        text: 'Sharing Options',
        color: '#fff',
        textAlign: 'center',
        font:{fontSize:24}
    });
window_nav_bar.add(header_label);
win.add(window_nav_bar);
    
function init_sharing(){
    var options_data = [ ];
    
    var photos_label = Titanium.UI.createLabel({
	    text: 'Photos',
        color: '#4c566d',
        left: 20,
        size: {width: 'auto', height: 'auto'},
        font:{fontSize: 18, fontWeight: 'bold'}
    });
    var photo_header = Titanium.UI.createView({
        height: 30,
        width: 'auto'
    });
    photo_header.add(photos_label);
    
    var section = Titanium.UI.createTableViewSection({
        headerView: photo_header
    });
    
    var row = Ti.UI.createTableViewRow({
            title: 'Post GPS Data',
            color: '#333',
            font:{fontSize: 18, fontWeight: 'bold'},
            backgroundColor: '#fff',
            selectionStyle: Titanium.UI.iPhone.TableViewCellSelectionStyle.NONE
    });
    var gps_switch = Titanium.UI.createSwitch({
        value: true,
        right: 10
    });
    row.add(gps_switch);
    row.addEventListener('click', function(){
        // var win = Ti.UI.createWindow({backgroundColor:"#eee", url:'settings/find_friends.js', title: 'Find Friends'});
        // Titanium.UI.currentTab.open(win,{animated:true});
    });
    section.add(row);
    options_data.push(section);
    
    //Linked accounts
    var linked_accounts_label = Titanium.UI.createLabel({
	    text: 'Linked Accounts',
        color: '#4c566d',
        left: 20,
        size: {width: 'auto', height: 'auto'},
        font:{fontSize: 18, fontWeight: 'bold'}
    });
    var linked_accounts_header = Titanium.UI.createView({
        height: 30,
        width: 'auto'
    });
    linked_accounts_header.add(linked_accounts_label);
    
    var section = Titanium.UI.createTableViewSection({
        headerView: linked_accounts_header
    });
    
    var row = Ti.UI.createTableViewRow({
            hasChild: true,
            title: 'Facebook',
            color: '#333',
            font:{fontSize: 18, fontWeight: 'bold'},
            backgroundColor: '#fff'
    });
    var linked_text = Titanium.UI.createLabel({
	    text: 'Linked',
        color: '#99CB6E',
        right: 15,
        size: {width: 'auto', height: 'auto'},
        font:{fontSize: 16}
    });
    row.add(linked_text);
    row.addEventListener('click', function(){
        // var win = Ti.UI.createWindow({backgroundColor:"#eee", url:'settings/find_friends.js', title: 'Find Friends'});
        // Titanium.UI.currentTab.open(win,{animated:true});
    });
    section.add(row);
    
    var row = Ti.UI.createTableViewRow({
            hasChild: true,
            title: 'Twitter',
            color: '#333',
            font:{fontSize: 18, fontWeight: 'bold'},
            backgroundColor: '#fff'
    });
    var twitter_link_text = '';
    var twitter_link_color = '';
    if (oAuthAdapter.isAuthorized() == false) {
        twitter_link_text = 'Configure';
        twitter_link_color = '#689AC9';
    }
    else{
        twitter_link_text = 'Linked';
        twitter_link_color = '#99CB6E';
    }
    var linked_text = Titanium.UI.createLabel({
	    text: twitter_link_text,
	    textAlign: 'right',
        color: twitter_link_color,
        right: 15,
        size: {width: 100, height: 'auto'},
        font:{fontSize: 16}
    });
    row.add(linked_text);
    row.addEventListener('click', function(){
        // if the client is not authorized, ask for authorization. 
        // the previous tweet will be sent automatically after authorization
        if (oAuthAdapter.isAuthorized() == false) {
            // this function will be called as soon as the application is authorized
            var receivePin = function() {
                // get the access token with the provided pin/oauth_verifier
                oAuthAdapter.getAccessToken('http://twitter.com/oauth/access_token');
                // save the access token
                oAuthAdapter.saveAccessToken('twitter');
                
                linked_text.text = 'Linked';
                linked_text.color = '#99CB6E';
            };
            
            var request_token = oAuthAdapter.getRequestToken('https://api.twitter.com/oauth/request_token', 'oob');
            
            // show the authorization UI and call back the receive PIN function
            oAuthAdapter.showAuthorizeUI('https://twitter.com/oauth/authorize?' + request_token, receivePin);
        }
        else{
            var unlink_alert = Titanium.UI.createAlertDialog({
            	title:'Unlink your Twitter account?',
            	buttonNames: ['Cancel', 'Unlink'],
            	cancel: 0
            });
            unlink_alert.addEventListener('click', function(e){
                if (e.index == 1){
                    oAuthAdapter.deauth()
                    oAuthAdapter.saveAccessToken('twitter');
                    
                    linked_text.text = 'Configure';
                    linked_text.color = '#689AC9';
                    
                }
            });
            unlink_alert.show();
        }
    });
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

init_sharing();