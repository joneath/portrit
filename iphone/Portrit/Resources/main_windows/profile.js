Ti.include('../settings.js');
Ti.include('../includes.js');

var win = Ti.UI.currentWindow;
var me = JSON.parse(Ti.App.Properties.getString("me"));

win.add(Titanium.Facebook.createLoginButton({
    'style':'wide',
    bottom:30
}));