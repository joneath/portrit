function secondsToHms(d) {
	d = Number(d);
	var days = Math.floor(d / 86400);
	var h = Math.floor(d / 3600);
	var m = Math.floor(d % 3600 / 60);
	var s = Math.floor(d % 3600 % 60);
	
	if (days > 1){
	    return days + ' days ago';
	}
	else if (days == 1){
	    return days + ' day ago';
	}
	else if (h > 1){
	    return h + ' hours ago';
	}
	else if (h == 1){
	    return h + ' hour ago';
	}
	else if (m > 1){
	    return m + ' minutes ago';
	}
	else if (m == 1){
	    return m + ' minute ago';
	}
	else if (s >= 10){
	    return s + ' seconds ago';
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

function nextRandomNumber(){
  var hi = this.seed / this.Q;
  var lo = this.seed % this.Q;
  var test = this.A * lo - this.R * hi;
  if(test > 0){
    this.seed = test;
  } else {
    this.seed = test + this.M;
  }
  return (this.seed * this.oneOverM);
}

function RandomNumberGenerator(){
  var d = new Date();
  this.seed = 2345678901 + (d.getSeconds() * 0xFFFFFF) + (d.getMinutes() * 0xFFFF);
  this.A = 48271;
  this.M = 2147483647;
  this.Q = this.M / this.A;
  this.R = this.M % this.A;
  this.oneOverM = 1.0 / this.M;
  this.next = nextRandomNumber;
  return this;
}

function createRandomNumber(Min, Max){
  var rand = new RandomNumberGenerator();
  return Math.round((Max-Min) * rand.next() + Min);
}

function share_nom(nom, method, title, from){
    var t = Titanium.UI.create2DMatrix();
	t = t.scale(.45);
    
    var comment_window = Titanium.UI.createWindow({
		backgroundColor:'#ddd',
		height:245,
		opacity: 0,
		width:320,
		top: 0,
		transform:t
	});
	
	var t1 = Titanium.UI.create2DMatrix();
	t1 = t1.scale(1);
	var fadeIn = Titanium.UI.createAnimation({
        curve: Ti.UI.ANIMATION_CURVE_EASE_OUT_IN,
        opacity: 1,
        transform: t1,
        duration: 350
    });
    
    var t2 = Titanium.UI.create2DMatrix();
	t2 = t2.scale(.45);
    var fadeOut = Titanium.UI.createAnimation({
        curve: Ti.UI.ANIMATION_CURVE_EASE_OUT_IN,
        opacity: 0,
        transform: t2,
        duration: 350
    });
    
    var post_botton_location = '../images/comment_post_button.png';
    var cancel_botton_location = '../images/comment_cancel_button.png';
    var header_locations = '../images/iphone_header_blank.png';
    if (typeof(from) != 'undefined'){
        post_botton_location = '../../images/comment_post_button.png';
        cancel_botton_location = '../../images/comment_cancel_button.png';
        header_locations = '../../images/iphone_header_blank.png';
    }
    
    var post_button = Titanium.UI.createButton({
	    backgroundImage: post_botton_location,
		title:'Post',
		font: {fontSize: 16, fontWeight: 'bold'},
		height:32,
		width:96,
		top: 195,
		left: 175
	});
	comment_window.add(post_button);

	// create a button to close window
	var cancel_button = Titanium.UI.createButton({
	    backgroundImage: cancel_botton_location,
		title:'Cancel',
		font: {fontSize: 16, fontWeight: 'bold'},
		height:32,
		width:96,
		top: 195,
		left: 49
	});
	cancel_button.addEventListener('click', function(){
	    comment_textarea.blur();
		comment_window.close(fadeOut);
	});
	comment_window.add(cancel_button);
	
	var share_title_cont = Titanium.UI.createView({
	    backgroundImage: header_locations,
        height: 40,
        width: 320,
        top: 0,
    });
	
	var share_title = Titanium.UI.createLabel({
	    text: 'Share on ' + method,
	    textAlign: 'center',
        color: '#fff',
        // left: 10,
        // right: 10,
        top: 5,
        // bottom: 10,
        size: {width: 'auto', height: 'auto'},
        font:{fontSize:22, fontWeight: 'bold'}
    });
    share_title_cont.add(share_title);
    
    comment_window.add(share_title_cont);
	
	var comment_textarea = Titanium.UI.createTextArea({
	    color: '#333',
	    width: 300,
	    height: 130,
	    font: {fontSize: 22, fontWeight: 'bold'},
	    top: 50,
	    borderRadius: 3,
	    suppressReturn: false
	});
    comment_window.add(comment_textarea);

	comment_window.open(fadeIn);
	
	post_button.addEventListener('click', function(e){
        var comment_body = comment_textarea.value;
        
        if (method == 'Facebook'){
            share_on_facebook(me, nom, comment_body, title);
        }
        else if (method == 'Twitter'){
            share_on_twitter(me, nom, comment_body);
        }
        
        
	    comment_textarea.blur();
		comment_window.close(fadeOut);
	});
	
	setTimeout(function(){
	    comment_textarea.focus();
	}, 75);
}

function share_on_twitter(me, nom, caption){
    var share_twitter_request = Titanium.Network.createHTTPClient();
    
    var url = SERVER_URL + '/api/share_twitter/';
    share_twitter_request.open('POST', url);
    share_twitter_request.send({'access_token': me.access_token, 'url': 'http://portrit.com/#!/nomination/' + nom.id, 'status': caption});
}

function share_on_facebook(me, nom, caption, title){
    var short_url_request = Titanium.Network.createHTTPClient();
    var url_to_shorten = 'http://portrit.com/#!/nomination/' + nom.id;
    
    short_url_request.onload = function(){
        var data = JSON.parse(this.responseData);
        var url = data.url;
        Titanium.Facebook.requestWithGraphPath('me/feed', {'message': caption,
                                                            'caption': caption,
                                                            'link': url,
                                                            'picture': nom.photo.crop_small,
                                                            'name': title}, 
                                                            "POST",
        function(e){
            if (e.success) {
                alert("Success!  From FB: " + e.result);
            } else {
                if (e.error) {
                    alert(e.error);
                } else {
                    alert("Unkown result");
                }
            }
        });
    }
    
    var url = SERVER_URL + '/api/shorten_url/';
    short_url_request.open('POST', url);
    short_url_request.send({'url': url_to_shorten});
}

function flag_nom(me, nom, photo_id, win){
    var xhr = Titanium.Network.createHTTPClient();

    xhr.onload = function()
    {
        var data = JSON.parse(this.responseData);
        if (data == true){
            var flag_cont_background = Titanium.UI.createView({
        	    backgroundColor: '#000',
                opacity: .8,
                borderRadius: 5,
                height: '100%',
                width: '100%',
                zIndex: -1
            });

    	    var flag_cont = Titanium.UI.createView({
                height: 'auto',
                width: 'auto',
                top: 200,
                zIndex: 10
            });
            flag_cont.add(flag_cont_background);

    	    var flag_message = Titanium.UI.createLabel({
        	    text: 'Thank you for the feedback! We wil check this photo out.',
        	    textAlign: 'center',
                color: '#fff',
                left: 10,
                right: 10,
                top: 10,
                bottom: 10,
                size: {width: 'auto', height: 'auto'},
                font:{fontSize:16, fontWeight: 'bold'}
            });
            flag_cont.add(flag_message);
            win.add(flag_cont);

            var fadeOutSlow = Titanium.UI.createAnimation({
                curve: Ti.UI.ANIMATION_CURVE_EASE_IN,
                opacity: 0,
                delay: 3000,
                duration: 1000
            });
            flag_cont.animate(fadeOutSlow);
            
            setTimeout(function(){
                win.remove(flag_cont);
            }, 4000);
        }
    };

    var url = SERVER_URL + '/api/flag/photo'
    xhr.open('POST', url);
    xhr.send({'access_token': me.access_token,
                'photo_id': photo_id});
}