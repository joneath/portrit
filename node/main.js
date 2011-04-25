var events = require('events');
var sys = require('sys');
var http = require('http');
var https = require('https');
var url = require("url");
var net = require('net');
var events = require("events");
var path = require("path");
// var nodemailer = require('nodemailer');
var postmark = require("./lib/postmark")("7e81d8b2-4429-44e1-a493-eef87d130669");

var URBAN_KEY = 'XOeKRpIDSJmpSvVAwjRXdg';
var URBAN_SECRET = 'r7RXQj6zS2ifBGXXLVy9Ag';
var URBAN_MASTER_SECRET = 'GtOv_7dURFOvSGLWcDne0A';

var Airship = null;

var Portrit = function(){
    var self = this;
    var dev = true;

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
    
    function get_cat_under(cat){
        return cat.replace(' ', '_').toLowerCase();
    }
    
    function prep_push_data(friends, data){
        var push_payload = [ ];
        var push = { };
        var allow_push = true;
        var message = '';
        
        if (data.method == 'new_nom'){
            if (data.payload.nom_data[0].nominatee != data.payload.nom_data[0].nominator && friends[data.payload.nom_data[0].nominatee].push_nominations){
                message = data.payload.nom_data[0].nominator_username + ' nominated your photo for ' + data.payload.nom_data[0].nomination_category;

                push = { 
                    'aliases': [String(data.payload.nom_data[0].nominatee)],
                    'aps': {
                        'badge': '+1',
                        'alert': message
                    }
                };
                push_payload.push(push);
            }
        }
        else if (data.method == 'nom_won'){
            if (friends[data.payload.nominatee].push_wins){
                message = 'Congratulations! Your photo won ' + data.payload.nomination_category;

                push = { 
                    'aliases': [data.payload.nominatee],
                    'aps': {
                        'badge': '+1',
                        'alert': message
                    }
                };
                push_payload.push(push);
            }
        }
        else{
            for (id in friends){
                if (id != undefined){
                    allow_push = false;

                    if (data.method == 'new_comment'){
                        var target = '';
                        if (friends[id].push_comments){
                            allow_push = true;
                            if (data.payload.nom_owner_id == id){
                                target = 'your';
                            }
                            else if (data.payload.comment_sender_id == data.payload.nom_owner_id){
                                target = 'their';
                            }
                            else{
                                target = data.payload.nom_owner_username + '\'s';
                            }
                            message = data.payload.comment_sender_username + ' commented on ' + target + ' nomination';
                        }
                    }

                    else if (data.method == 'new_follow'){
                        if (friends[id].push_follows){
                            allow_push = true;
                            message = data.payload.follower_username + ' is now following you';
                        }
                    }

                    if (allow_push){
                        push = { 
                            'aliases': [id],
                            'aps': {
                                'badge': '+1',
                                'alert': message
                            }
                        };
                        push_payload.push(push);
                    }
                }
            }
        }

        return push_payload;
    }
    
    function get_email_html(method, data){
        var template_html = '';
        if (method == 'new_nom'){
            var cat_under = get_cat_under(data.nom_cat);
            var cat_color = get_nom_cat_color(cat_under);
            template_html = '<h1 style="font-size: 28px; font-weight: bold; margin-bottom: 10px;">Hey ' + data.target_name.split(' ')[0] + ', You Have Been Nominated.</h1>' +
                            '<p style="font-size: 14px;">One of your photos have been nominated for the ' + data.nom_cat + ' Trophy. You can visit your <a href="http://portrit.com/#!/nomination/' + data.nom_id + '/" style="color: #1686f7; cursor: pointer; text-decoration: none;">nomination here</a>.</p>' +
                            '<div style="-moz-border-radius: 5px; border-radius: 5px; background-color: #333; width: 500px; height: 105px; margin: 0 auto;">' +
                                '<div style="float:left; width:100px; text-align: center;">' +
                                    '<img src="http://portrit.s3.amazonaws.com/img/trophies/medium/' + cat_under + '.png"/>' +
                                '</div>' +
                                '<div>' +
                                    '<h2 style="float: left; height: 105px; width: 400px; text-align: center; font-size: 24px; font-weight: bold; margin: 0px; line-height: 105px; background-color: ' + cat_color + ';">' + data.nom_cat + ' Trophy</h2>' +
                                '</div>' +
                                '<div style="clear: both;"></div>' +
                            '</div>';
        }
        else if (method == 'nom_won'){
            var cat_under = get_cat_under(data.nom_cat);
            var cat_color = get_nom_cat_color(cat_under);
            template_html = '<h1 style="font-size: 28px; font-weight: bold; margin-bottom: 10px;">Yay ' + data.target_name.split(' ')[0] + ', You just won!</h1>' +
                            '<p style="font-size: 14px;">You have just won the ' + data.nom_cat + ' Trophy. You can visit your <a href="http://portrit.com/#!/' + data.target_username + '/trophies/" style="color: #1686f7; cursor: pointer; text-decoration: none;">trophy room here</a>.</p>' +
                            '<div style="-moz-border-radius: 5px; border-radius: 5px; background-color: #333; width: 500px; height: 105px; margin: 0 auto;">' +
                                '<div style="float:left; width:100px; text-align: center;">' +
                                    '<img src="http://portrit.s3.amazonaws.com/img/trophies/medium/' + cat_under + '.png"/>' +
                                '</div>' +
                                '<div>' +
                                    '<h2 style="float: left; height: 105px; width: 400px; text-align: center; font-size: 24px; font-weight: bold; margin: 0px; line-height: 105px; background-color: ' + cat_color + ';">' + data.nom_cat + ' Trophy</h2>' +
                                '</div>' +
                                '<div style="clear: both;"></div>' +
                            '</div>';
            console.log('here');
        }
        else if (method == 'new_follow'){
            template_html = '<h1 style="font-size: 28px; font-weight: bold; margin-bottom: 10px;">Hey ' + data.target_name.split(' ')[0] + ',</h1>' +
                            '<p style="font-size: 14px;">You have a new follower. You can visit their profile <a href="http://portrit.com/#!/' + data.source_username + '/" style="color: #1686f7; cursor: pointer; text-decoration: none;">here</a>.</p>' +
                            '<div style="-moz-border-radius: 5px; border-radius: 5px; background-color: #dedede; width: 500px; height: 105px; margin: 0 auto;">' +
                                    '<h2 style="text-align: center; font-size: 24px; font-weight: bold; margin: 0px; line-height: 105px;">' + data.source_name + ' is now following you.</h2>' +
                                '<div style="clear: both;"></div>' +
                            '</div>';
        }
        else if (method == 'welcome'){
            template_html = '<h1 style="font-size: 28px; font-weight: bold; margin-bottom: 10px;">Hey ' + data.target_name.split(' ')[0] + ',</h1>' +
                            '<p style="font-size: 14px;">Thanks for joining! We are all about making photos more fun between you and your friends. Go and nominate some photos. All you have to do is select a trophy and you are ready to go!</p>' +
                            '<div style="-moz-border-radius: 5px; border-radius: 5px; width: 500px; height: 105px; margin: 0 auto;">' +
                                    '<h2 style="text-align: center; font-size: 24px; font-weight: bold; margin: 0px; line-height: 105px;">Welcome!</h2>' +
                                '<div style="clear: both;"></div>' +
                            '</div>';
        }
        
        var generic_html =  '<div style="font-family: Helvetica, Arial, Verdana, sans-serif; width: 710px; color: #333;">' +
                                '<div id="portrit_header" style="background-color: #333; height: 115px; text-align: center;">' +
                                    '<img style="margin-top: 10px; margin-bottom: 5px; height: 90px;" src="http://portrit.s3.amazonaws.com/img/logo_blank.png"/>' +
                                '</div>' +
                                template_html +
                                '<div style="clear: both;"></div>' +
                                '<div id="portrit_footer" style="margin-top: 30px;">' +
                                    '<p>+ Download the Portrit iPhone app: <a style="text-decoration: none; cursor:pointer;" href="http://portrit.com/app">http://portrit.com/app</a>' +
                                    '<p style="font-size: 14px;">Thank you for using Portrit.</p>' +
                                    '<p style="font-size: 14px;">-Team Portrit</p>' +
                                '</div>' +
                                '<div style="margin-top: 30px; border-bottom: 1px solid #dedede; padding-bottom: 5px;">' +
                                    '<a href="http://portrit.com/#!/contact/" style="color: #1686f7; cursor: pointer; text-decoration: none; font-size: 14px;">Need help? Have Feedback? Feel free to contact us.</a>' +
                                '</div>' +
                                '<p style="color: #999; margin-top: 5px;">Want to control which emails you receive from Portrit? Visit your <a href="http://portrit.com/#!/' + data.target_username + '/settings/" style="color: #1686f7; cursor: pointer; text-decoration: none;">settings page</a>.</p>' +
                            '</div>';
                            
        return generic_html;
    }
        
    var nomination_emitter = new events.EventEmitter();
    
    function send_mail(data){
        var email_html = '';
        console.log('mail event');
        if (data.method == 'new_nom'){
            email_html = get_email_html(data.method, data.payload);
            postmark.send({
                "From": "notifications@portrit.com", 
                "To": data.payload.target_email, 
                "Subject": 'Hey ' + data.payload.target_name.split(' ')[0] + ', You Have Been Nominated.',
                "HtmlBody": email_html
            });
        }
        else if (data.method == 'nom_won'){
            email_html = get_email_html(data.method, data.payload);
            postmark.send({
                "From": "notifications@portrit.com", 
                "To": data.payload.target_email, 
                "Subject": 'Yay ' + data.payload.target_name.split(' ')[0] + ', You Just Won.',
                "HtmlBody": email_html
            });
        }
        else if (data.method == 'new_follow'){
            email_html = get_email_html(data.method, data.payload);
            postmark.send({
                "From": "notifications@portrit.com", 
                "To": data.payload.target_email, 
                "Subject": data.payload.source_name + ' is now following you on Portrit!',
                "HtmlBody": email_html
            });
        }
        else if (data.method == 'welcome'){
            email_html = get_email_html(data.method, data.payload);
            postmark.send({
                "From": "notifications@portrit.com", 
                "To": data.payload.target_email, 
                "Subject": 'Welcome To Portrit!',
                "HtmlBody": email_html
            });
        }
        console.log(data.method);
    }
    
    var tcp_server = net.createServer(function (stream) {
        var data_stream = '';
        stream.setEncoding('ascii');
        stream.on('connect', function () {
            console.log('socket connected');
        });
        stream.on('data', function (data) {
            data_stream += data;
        });
        stream.on('end', function () {
            console.log('socket closed');
            try{
                var data = JSON.parse(data_stream);
                if (typeof(data.email) == 'undefined'){
                    for (var id in data.payload.friends){
                        console.log(id);
                        if (id != undefined){
                            nomination_emitter.emit(data.payload.friends[id].fid, data.payload.friends[id].notification_id, data);
                        }
                    }
                    data = prep_push_data(data.payload.friends, data);
                    airship.batch_push(data);
                }
                else{
                    send_mail(data);
                }
                data_stream = '';
            }
            catch (err){
                console.log('error');
                console.log(err);
            }
            stream.end();
        });
    });
    // if (dev){
        tcp_server.listen(8081, 'localhost');
    // }
    // else{
    //     tcp_server.listen(8081, '10.117.57.137');
    // }
    
    // var iphone_tcp_server = net.createServer(function (stream) {
    //     var data_stream = '';
    //     stream.setEncoding('ascii');
    //     stream.on('connect', function () {
    //         console.log('socket connected');
    //     });
    //     stream.on('data', function (data) {
    //         data_stream += data;
    //         stream.end('test');
    //         try{
    //             var event_user = parseInt(data_stream);
    //             nomination_emitter.removeAllListeners(event_user);
    //             var nom_callback = function(notification_id, data){
    //                 console.log('iphone event sent');
    //                 if (typeof(notification_id) !== "undefined"){
    //                     data.payload.notification_id = notification_id;
    //                 }
    //                 stream.end(JSON.stringify(data));
    //             }
    //             nomination_emitter.addListener(event_user, nom_callback);
    //         }
    //         catch (err){
    //             
    //         }
    //         console.log(data_stream + ' recieved');
    //     });
    //     stream.on('end', function (){
    //         console.log('data recieved');
    //         console.log(data_stream);
    // 
    //     });
    // });
    // iphone_tcp_server.listen(8082, 'localhost');
    
    
    // var websock_server = ws.createServer({
    //     websock_server: http
    // });
    // 
    // websock_server.addListener("listening", function(){
    //     sys.log("Listening for connections.");
    // });
    // 
    // // Handle WebSocket Requests
    // websock_server.addListener("connection", function(conn){
    //     var event_user = '';
    //     var nom_callback = function(data){
    //         // nomination_emitter.removeAllListeners(event_user);
    //         console.log('websocket event sent');
    //         conn.write(JSON.stringify(data));
    //     }
    //     conn.addListener("message", function(data){
    //         event_user = data;
    //         nomination_emitter.removeAllListeners(event_user);
    //         nomination_emitter.addListener(event_user, nom_callback);
    //     });
    // });
    // 
    // if (dev){
    //     websock_server.listen(8122, 'localhost');
    // }
    // else{
    //     websock_server.listen(8122, '10.117.57.137');
    // }
    
    var request_server = http.createServer(function(request, response) {
        if (dev){
            var proxy = http.createClient(8000, "127.0.0.1");
            var path = url.parse(request.url).pathname;
            if (path === '/watch_update/'){
                var event_user = url.parse(request.url, true).query.user;
                var nom_callback = function(notification_id, data){
                    // nomination_emitter.removeAllListeners(event_user);
                    console.log('event sent');
                    clearTimeout(nom_timeout);
                    nomination_emitter.removeAllListeners(event_user);
                    response.writeHead(200, { "Content-Type": "text/plain" });
                    if (typeof(notification_id) !== "undefined"){
                        data.payload.notification_id = notification_id;
                    }
            		response.end(JSON.stringify(data));
                }

                var nom_timeout = setTimeout(function(){
                    nomination_emitter.removeListener(event_user, nom_callback);
                    response.writeHead(200, { "Content-Type" : "text/plain" });  
                    response.end(JSON.stringify([]));
                }, 25000);
                
                nomination_emitter.addListener(event_user, nom_callback);
            }
            else{
                var proxy_request = proxy.request(request.method, request.url, request.headers);
                proxy_request.addListener('response', function (proxy_response) {
                    proxy_response.addListener('data', function(chunk) {
                        response.write(chunk, 'binary');
                    });
                    proxy_response.addListener('end', function() {
                        response.end();
                    });
                    response.writeHead(proxy_response.statusCode, proxy_response.headers);
                });
                request.addListener('data', function(chunk) {
                    proxy_request.write(chunk, 'binary');
                });
                request.addListener('end', function() {
                    proxy_request.end();
                });
            }
        }
        else{
            try{
                var event_user = url.parse(request.url, true).query.user;
            }
            catch (err){

            }
            var nom_callback = function(notification_id, data){
                // nomination_emitter.removeAllListeners(event_user);
                try{
                    clearTimeout(nom_timeout);
                    nomination_emitter.removeListener(event_user, nom_callback);
                    response.writeHead(200, { "Content-Type": "text/plain" });
                    if (typeof(notification_id) !== "undefined"){
                        data.payload.notification_id = notification_id;
                    }
            		response.end(JSON.stringify(data));
                }
                catch(err){
                    clearTimeout(nom_timeout);
                    response.writeHead(200, { "Content-Type": "text/plain" });
            		response.end(JSON.stringify([]));
                }
            }

            var nom_timeout = setTimeout(function(){
                try{
                    nomination_emitter.removeListener(event_user, nom_callback);
                }
                catch(err){
                    console.log(err);
                }
                response.writeHead(200, { "Content-Type" : "text/plain" });  
                response.end(JSON.stringify([]));
            }, 25000);
            
            try{
                // console.log(nomination_emitter.listeners(event_user));
                nomination_emitter.addListener(event_user, nom_callback);
                // console.log('long poll attached');
            }
            catch(err){

            }
        }
    });
    
    if (dev){
        request_server.listen(8080, '192.168.1.126');
    }
    else{
        request_server.listen(8080, '10.117.57.137');
    }
}
var portrit = new Portrit();

var Base64 = {
 
	// private property
	_keyStr : "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
 
	// public method for encoding
	encode : function (input) {
		var output = "";
		var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
		var i = 0;
 
		input = Base64._utf8_encode(input);
 
		while (i < input.length) {
 
			chr1 = input.charCodeAt(i++);
			chr2 = input.charCodeAt(i++);
			chr3 = input.charCodeAt(i++);
 
			enc1 = chr1 >> 2;
			enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
			enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
			enc4 = chr3 & 63;
 
			if (isNaN(chr2)) {
				enc3 = enc4 = 64;
			} else if (isNaN(chr3)) {
				enc4 = 64;
			}
 
			output = output +
			this._keyStr.charAt(enc1) + this._keyStr.charAt(enc2) +
			this._keyStr.charAt(enc3) + this._keyStr.charAt(enc4);
 
		}
 
		return output;
	},
 
	// public method for decoding
	decode : function (input) {
		var output = "";
		var chr1, chr2, chr3;
		var enc1, enc2, enc3, enc4;
		var i = 0;
 
		input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
 
		while (i < input.length) {
 
			enc1 = this._keyStr.indexOf(input.charAt(i++));
			enc2 = this._keyStr.indexOf(input.charAt(i++));
			enc3 = this._keyStr.indexOf(input.charAt(i++));
			enc4 = this._keyStr.indexOf(input.charAt(i++));
 
			chr1 = (enc1 << 2) | (enc2 >> 4);
			chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
			chr3 = ((enc3 & 3) << 6) | enc4;
 
			output = output + String.fromCharCode(chr1);
 
			if (enc3 != 64) {
				output = output + String.fromCharCode(chr2);
			}
			if (enc4 != 64) {
				output = output + String.fromCharCode(chr3);
			}
 
		}
 
		output = Base64._utf8_decode(output);
 
		return output;
 
	},
 
	// private method for UTF-8 encoding
	_utf8_encode : function (string) {
		string = string.replace(/\r\n/g,"\n");
		var utftext = "";
 
		for (var n = 0; n < string.length; n++) {
 
			var c = string.charCodeAt(n);
 
			if (c < 128) {
				utftext += String.fromCharCode(c);
			}
			else if((c > 127) && (c < 2048)) {
				utftext += String.fromCharCode((c >> 6) | 192);
				utftext += String.fromCharCode((c & 63) | 128);
			}
			else {
				utftext += String.fromCharCode((c >> 12) | 224);
				utftext += String.fromCharCode(((c >> 6) & 63) | 128);
				utftext += String.fromCharCode((c & 63) | 128);
			}
 
		}
 
		return utftext;
	},
 
	// private method for UTF-8 decoding
	_utf8_decode : function (utftext) {
		var string = "";
		var i = 0;
		var c = c1 = c2 = 0;
 
		while ( i < utftext.length ) {
 
			c = utftext.charCodeAt(i);
 
			if (c < 128) {
				string += String.fromCharCode(c);
				i++;
			}
			else if((c > 191) && (c < 224)) {
				c2 = utftext.charCodeAt(i+1);
				string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
				i += 2;
			}
			else {
				c2 = utftext.charCodeAt(i+1);
				c3 = utftext.charCodeAt(i+2);
				string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
				i += 3;
			}
 
		}
 
		return string;
	}
}

Airship = function(){
    var self = { };
    
    self.URBAN_URL = 'https://go.urbanairship.com'
    self.UA_SERVER = 'go.urbanairship.com';
    self.UA_BASE_URL = '/api';
    self.DEVICE_TOKEN_URL = self.UA_BASE_URL + '/device_tokens/';
    self.PUSH_URL = self.UA_BASE_URL + '/push/';
    self.BATCH_PUSH_URL = self.UA_BASE_URL + '/push/batch/';
    self.BROADCAST_URL = self.UA_BASE_URL + '/push/broadcast/';
    self.FEEDBACK_URL = self.UA_BASE_URL + '/device_tokens/feedback/';

    self.auth_string = Base64.encode(URBAN_KEY + ':' + URBAN_MASTER_SECRET);
    
    self._request = function(method, body, url){
        var options = {
            host: self.UA_SERVER,
            path: url,
            method: method,
            headers: { 
                'authorization': 'Basic ' + self.auth_string,
                'content-type': 'application/json',
                'content-length': body.length
            }
        };
        console.log('request sent');
        var req = https.request(options, function(res){
            console.log(res.statusCode);
        });
        req.write(body);
        req.end();

        req.on('error', function(e) {
          console.error(e);
        });
    }
    
    self.push = function(payload){
        var body = JSON.stringify(payload);
        self._request('POST', body, self.PUSH_URL);
    }
    
    self.batch_push = function(payloads){
        if (payloads.length > 0){
            var body = JSON.stringify(payloads);
            console.log(body);
            self._request('POST', body, self.BATCH_PUSH_URL);
        }
    }
    
    return self;
};

var airship = new Airship();