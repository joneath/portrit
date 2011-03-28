Ti.include('../../../settings.js');
Ti.include('../../../includes.js');

var me = JSON.parse(Ti.App.Properties.getString("me")),
    win = Ti.UI.currentWindow,
    tv = null,
    user = null,
    window_nav_bar = null,
    back_buttom = null,
    button_label = null,
    name = '';
    
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

win.add(window_nav_bar);
    
var webview = Titanium.UI.createWebView({url: SERVER_URL + '/#/context=privacy', top: 40});
win.add(webview);