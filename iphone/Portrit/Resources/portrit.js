Ti.include('settings.js');

var landing_win = Ti.UI.currentWindow;
var tabGroup = landing_win.tabGroup;
landing_win.backgroundImage = 'images/background.png';

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

Titanium.Facebook.addEventListener('login', function(e) {
    // Titanium.Facebook.removeEventListener('login');
	if (e.success) {
	    me = {
	        'name': e.data.name,
	        'fid': e.data.id
	    };
	    me.access_token = Titanium.Facebook.accessToken;
        Ti.App.Properties.setString("me", JSON.stringify(me));
        
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

        xhr.onload = function(){
            var data = JSON.parse(this.responseData);
            me.username = data.username;
            Ti.App.Properties.setString("me", JSON.stringify(me));
            
            landing_win.close();
            Ti.App.fireEvent('reset', { });
        };
        var url = SERVER_URL + '/api/login/';
        xhr.open('GET', url);
        xhr.send({'access_token': me.access_token, 'fb_user': me.fid});
	}
	if (e.error) {
		alert(e.error);
    }
});