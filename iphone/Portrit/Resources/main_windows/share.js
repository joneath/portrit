Ti.include('../settings.js');
Ti.include('../includes.js');

var me = JSON.parse(Ti.App.Properties.getString("me")),
    win = Ti.UI.currentWindow;
    
win.hideNavBar({animated:false});

win.addEventListener('focus', function(){
    Titanium.Media.showCamera({

    	success:function(event){
    	    var filename = new Date.getTime();
            var f = Titanium.Filesystem.getFile(Titanium.Filesystem.applicationDataDirectory, filename + '.png');
    		f.write(image);
    	},
    	cancel:function()
    	{

    	},
    	error:function(error)
    	{
    		// create alert
    		var a = Titanium.UI.createAlertDialog({title:'Camera'});

    		// set message
    		if (error.code == Titanium.Media.NO_CAMERA)
    		{
    			a.setMessage('Device does not have video recording capabilities');
    		}
    		else
    		{
    			a.setMessage('Unexpected error: ' + error.code);
    		}

    		// show alert
    		a.show();
    	},
    	saveToPhotoGallery:true
        // allowEditing:true
    });
});