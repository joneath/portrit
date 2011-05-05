Ti.include('lib/oauth_adapter.js');
var oAuthAdapter = new OAuthAdapter(
        'rWxNvv8pOSB0t9kgT59xVc2IUQXH1l8ESpfOst5sggw',
        'RrYAd721jXeCJsp9QqtFw',
        'HMAC-SHA1');
        
oAuthAdapter.loadAccessToken('twitter');

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

function formatDate(){
	var date = new Date();
	var datestr = date.getMonth()+'/'+date.getDate()+'/'+date.getFullYear();
	if (date.getHours()>=12){
		datestr +=' '+(date.getHours()==12 ? date.getHours() : date.getHours()-12)+':'+date.getMinutes()+' PM';
	}
	else{
		datestr +=' '+date.getHours()+':'+date.getMinutes()+' AM';
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

function get_nom_cat_color(nom_cat){
    if (nom_cat == 'artsy'){
        return '#689AC9';
    }
    if (nom_cat == 'wtf'){
        return '#cc9999';
    }
    if (nom_cat == 'creepy'){
        return '#8e8e8e';
    }
    if (nom_cat == 'hot'){
        return '#CB6698';
    }
    if (nom_cat == 'fail'){
        return '#F95057';
    }
    if (nom_cat == 'party_animal'){
        return '#99CB6E';
    }
    if (nom_cat == 'cute'){
        return '#69CCCB';
    }
    if (nom_cat == 'lol'){
        return '#FAC86E';
    }
    if (nom_cat == 'awesome'){
        return '#39F';
    }
    if (nom_cat == 'yummy'){
        return '#cc3366';
    }
}

function nom_cat_to_text(nom_cat){
    if (nom_cat == 'artsy'){
        return 'Artsy';
    }
    if (nom_cat == 'wtf'){
        return 'WTF';
    }
    if (nom_cat == 'creepy'){
        return 'Creepy';
    }
    if (nom_cat == 'hot'){
        return 'Hot';
    }
    if (nom_cat == 'fail'){
        return 'Fail';
    }
    if (nom_cat == 'party_animal'){
        return 'Party Animal';
    }
    if (nom_cat == 'cute'){
        return 'cute';
    }
    if (nom_cat == 'lol'){
        return 'LOL';
    }
    if (nom_cat == 'awesome'){
        return 'Awesome';
    }
    if (nom_cat == 'yummy'){
        return 'Yummy';
    }
}

function getOrdinal(n) {
   var s=["th","st","nd","rd"],
       v=n%100;
   return n+(s[(v-20)%10]||s[v]||s[0]);
}

function share_nom(nom, method, title, from){
    if (method != 'Twitter' || oAuthAdapter.isAuthorized()){
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
            top: 0
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


    	var textarea_focus = null;
    	var textarea_focus_count = 0;
    	clearInterval(textarea_focus);
    	textarea_focus = setInterval(function(){
    	    if (textarea_focus_count < 5){
    	        comment_textarea.focus();
        	    textarea_focus_count += 1;
    	    }
    	    else{
    	        clearInterval(textarea_focus);
    	    }
    	}, 30);
    }
    else if (method == 'Twitter' && oAuthAdapter.isAuthorized() == false){
        var receivePin = function() {
            // get the access token with the provided pin/oauth_verifier
            oAuthAdapter.getAccessToken('http://twitter.com/oauth/access_token');
            // save the access token
            oAuthAdapter.saveAccessToken('twitter');
            
            // save twitter access token on server
            var token = oAuthAdapter.get_access_token()
            var xhr = Titanium.Network.createHTTPClient({enableKeepAlive:false});
            xhr.onload = function(){
                share_nom(nom, method, title, from)
            };
            var url = SERVER_URL + '/api/save_mobile_twitter_token/';
            xhr.open('POST', url);
            xhr.send({
                'access_token': me.access_token,
                'twitter_access_token': token.access_token,
                'twitter_access_token_secret': token.access_token_secret,
            });
        };
        
        var request_token = oAuthAdapter.getRequestToken('https://api.twitter.com/oauth/request_token', 'oob');
        
        // show the authorization UI and call back the receive PIN function
        oAuthAdapter.showAuthorizeUI('https://twitter.com/oauth/authorize?' + request_token, receivePin);
    }
}

function share_on_twitter(me, nom, caption){
    // var share_twitter_request = Titanium.Network.createHTTPClient({enableKeepAlive:false});
    // 
    // var url = SERVER_URL + '/api/share_twitter/';
    // share_twitter_request.open('POST', url);
    // 
    // if (typeof(nom['nomination_category']) == 'undefined'){
    //     share_twitter_request.send({'access_token': me.access_token, 'url': 'http://portrit.com/#!/' + me.username + '/photos/' + nom.id, 'status': caption});
    // }
    // else{
    //     share_twitter_request.send({'access_token': me.access_token, 'url': 'http://portrit.com/#!/nomination/' + nom.id, 'status': caption});        
    // }
}

function share_on_facebook(me, nom, caption, title){
    // var url_to_shorten = '';
    // 
    // if (typeof(nom['nomination_category']) == 'undefined'){
    //     url_to_shorten = 'http://portrit.com/#!/' + me.username + '/photos/' + nom.id;
    // }
    // else{
    //     url_to_shorten = 'http://portrit.com/#!/nomination/' + nom.id;
    // }
    // 
    // var short_url_request = Titanium.Network.createHTTPClient({enableKeepAlive:false});
    // short_url_request.onload = function(){
    //     var data = JSON.parse(this.responseData);
    //     var url = data.url;
    //     Titanium.Facebook.requestWithGraphPath('me/feed', {'message': caption,
    //                                                         'caption': caption,
    //                                                         'link': url,
    //                                                         'picture': nom.photo.crop_small,
    //                                                         'name': title}, 
    //                                                         "POST",
    //     function(e){
    //         if (e.success) {
    //             // alert("Success!  From FB: " + e.result);
    //         } else {
    //             if (e.error) {
    //                 // alert(e.error);
    //             } else {
    //                 // alert("Unkown result");
    //             }
    //         }
    //     });
    // }
    // 
    // var url = SERVER_URL + '/api/shorten_url/';
    // short_url_request.open('POST', url);
    // short_url_request.send({'url': url_to_shorten});
}

function flag_nom(me, nom, photo_id, win){
    var xhr = Titanium.Network.createHTTPClient({enableKeepAlive:false});

    xhr.onload = function(){
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
        	    text: 'Thank you for the feedback! We will check this photo out.',
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
    xhr.send({'access_token': me.access_token, 'photo_id': photo_id});
}

function render_comments(cont, comments){
    var comment_cont = null;
    var commentor = null;
    var commentor_cont = null;
    var comment_time = null;
    var comment = null;
    var commentor_name_text = '';
    var commentor_width = 0;
        
    for (var i = 0; i < comments.length; i++){
    	if (comments[i].owner_id == me.fid){
    	    commentor_name_text = 'You';
    	}
    	else{
    	    commentor_name_text = comments[i].owner_username;
    	}
        
        commentor = Titanium.UI.createLabel({
            text: commentor_name_text,
            color: '#333',
            top: 5,
            bottom: 2,
            left: 10,
            width: 'auto',
            height: 'auto',
            font:{fontSize:13, fontWeight: 'bold'}
        });
        commentor.user = comments[i].owner_id;
        commentor.name = comments[i].owner_name;
        commentor.username = comments[i].owner_username;
        commentor.addEventListener('click', add_profile_window);
        cont.add(commentor);
        
        commentor_width = commentor.width + 14;

        comment = Titanium.UI.createLabel({
    	    text: comments[i].comment,
            color: '#666',
            top: -18,
            left: commentor_width,
            width: 'auto',
            height: 'auto',
            font:{fontSize:13}
        });
        
        cont.add(comment);
    }
    if (comments.length > 0){
        photo_action_bottom_round = Titanium.UI.createView({
            backgroundColor: '#fff',
            height: 5,
            width: 320
        });
        cont.add(photo_action_bottom_round); 
    }
}

/* 
	Developed by Kevin L. Hopkins (http://kevin.h-pk-ns.com)
	You may borrow, steal, use this in any way you feel necessary but please
	leave attribution to me as the source.  If you feel especially grateful,
	give me a linkback from your blog, a shoutout @Devneck on Twitter, or 
	my company profile @ http://wearefound.com.

/* Expects parameters of the directory name you wish to save it under, the url of the remote image, 
   and the Image View Object its being assigned to. */
cachedImageView = function(imageDirectoryName, url, imageViewObject, custom_filename){
	// Grab the filename
	var filename = '';
	
	if (typeof(custom_filename) == 'undefined'){
	    filename = url.replace(/\//g, '_').replace(/\./g, '_').replace('https:', '').replace('http:', '').replace('?', '_');
	}
	else{
	    filename = custom_filename.replace(/\//g, '_').replace(/\./g, '_').replace('https:', '').replace('http:', '').replace('?', '_');
	}
    // filename = filename[filename.length - 1];

	// Try and get the file that has been previously cached
	var file = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, imageDirectoryName, filename);

	if (file.exists()) {
		// If it has been cached, assign the local asset path to the image view object.
		imageViewObject.image = file.nativePath;
		return true;
	} else {
		// If it hasn't been cached, grab the directory it will be stored in.
		var g = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, imageDirectoryName);
		if (!g.exists()) {
			// If the directory doesn't exist, make it
			g.createDirectory();
		};
        
        // imageViewObject.defaultImage = defaultImage;
		// Create the HTTP client to download the asset.
		var xhr = Ti.Network.createHTTPClient();

		xhr.onload = function() {
			if (xhr.status == 200) {
				// On successful load, take that image file we tried to grab before and 
				// save the remote image data to it.
				file.write(xhr.responseData);
				// Assign the local asset path to the image view object.
				imageViewObject.image = file.nativePath;
			};
		};

		// Issuing a GET request to the remote URL
		xhr.open('GET', url);
		// Finally, sending the request out.
		xhr.send();
		return false;
	};
};

image_exists = function(imageDirectoryName, filename){
    filename = filename.replace(/\//g, '_').replace(/\./g, '_').replace('https:', '').replace('http:', '').replace('?', '_');
	
	var file = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, imageDirectoryName, filename);
	if (file.exists()) {
	    return true;
    }
    else{
        return false;
    }
};