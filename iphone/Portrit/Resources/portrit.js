Ti.include('settings.js');

var landing_win = Ti.UI.currentWindow;
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
        landing_win.close();
        // load_portrit();
	}
	if (e.error) {
		alert(e.error);
    }
});