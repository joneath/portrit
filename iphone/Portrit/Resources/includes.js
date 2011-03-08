function secondsToHms(d) {
	d = Number(d);
	var days = Math.floor(d / 86400);
	var h = Math.floor(d / 3600);
	var m = Math.floor(d % 3600 / 60);
	var s = Math.floor(d % 3600 % 60);
	
	if (days > 1){
	    return days + ' Days ago';
	}
	else if (days == 1){
	    return days + ' Day ago';
	}
	else if (h > 1){
	    return h + ' Hours ago';
	}
	else if (h == 1){
	    return h + ' Hour ago';
	}
	else if (m > 1){
	    return m + ' Minutes ago';
	}
	else if (m == 1){
	    return m + ' Minute ago';
	}
	else if (s >= 10){
	    return s + ' Seconds ago';
	}
	else{
	    return 'Right now';
	}
}

function formatDate()
{
	var date = new Date();
	var datestr = date.getMonth()+'/'+date.getDate()+'/'+date.getFullYear();
	if (date.getHours()>=12)
	{
		datestr+=' '+(date.getHours()==12 ? date.getHours() : date.getHours()-12)+':'+date.getMinutes()+' PM';
	}
	else
	{
		datestr+=' '+date.getHours()+':'+date.getMinutes()+' AM';
	}
	return datestr;
}

var cropImage = function(imageView,width,height,x,y){
    // with the var 'a' we avoid the image to triger the 'load' listener infinite times
    var a = 1;
    imageView.addEventListener('load',function(){
        if(a==1){
            imageView.image = imageView.toBlob().imageAsCropped({width:width,height:height,x:x,y:y});
        }
        a++;
    });
};