var events = require('events');
var sys = require('sys');
var http = require('http');
var url = require("url");
var net = require('net');
var events = require("events");
var path = require("path");
var nodemailer = require('nodemailer');

var Portrit = function(){
    var self = this;
    var dev = true;
    
    nodemailer.SMTP = {
        host: "smtp.sessmtp.net",
        port: 465,
        ssl: true,
        use_authentication: true,
        user: "portritinc@gmail.com",
        pass: "AKIAIRT77BO4DEQK7EDQ=93k70ucKPD6dj2y5U+07798gm5LCFHeApkb4yacI"
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
    
    function get_cat_under(cat){
        return cat.replace(' ', '_').toLowerCase();
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
            template_html = '<h1 style="font-size: 28px; font-weight: bold; margin-bottom: 10px;">Yay ' + data.target_name.split(' ')[0] + ', You just won!.</h1>' +
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
                            '<p style="font-size: 14px;">Thanks for joining! We are all about making photos more fun between you and your friends, and also your followers! Go and nominate your friends or community photos. All you have to do is select a trophy and you are ready to go!</p>' +
                            '<div style="-moz-border-radius: 5px; border-radius: 5px; width: 500px; height: 105px; margin: 0 auto;">' +
                                    '<h2 style="text-align: center; font-size: 24px; font-weight: bold; margin: 0px; line-height: 105px;">Welcome!</h2>' +
                                '<div style="clear: both;"></div>' +
                            '</div>';
        }
        
        var generic_html =  '<div style="font-family: Helvetica, Arial, Verdana, sans-serif; width: 710px; color: #333;">' +
                                '<div id="portrit_header" style="background-color: #333; height: 90px; text-align: center;">' +
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
            nodemailer.send_mail({sender: "no-reply@portrit.com", 
                                  to: data.payload.target_email,
                                  subject: 'Hey ' + data.payload.target_name.split(' ')[0] + ', You Have Been Nominated.',
                                  html: email_html},
                                  function(error, success){
                                      console.log("Message "+(success?"sent":"failed"));
                                  });
        }
        else if (data.method == 'nom_won'){
            email_html = get_email_html(data.method, data.payload);
            nodemailer.send_mail({sender: "no-reply@portrit.com", 
                                  to: data.payload.target_email,
                                  subject: 'Yay ' + data.payload.target_name.split(' ')[0] + ', You Just Won.',
                                  html: email_html},
                                  function(error, success){
                                      console.log("Message "+(success?"sent":"failed"));
                                  });
        }
        else if (data.method == 'new_follow'){
            email_html = get_email_html(data.method, data.payload);
            nodemailer.send_mail({sender: "no-reply@portrit.com", 
                                  to: data.payload.target_email,
                                  subject: data.payload.source_name + ' is now following you on Portrit!',
                                  html: email_html},
                                  function(error, success){
                                      console.log("Message "+(success?"sent":"failed"));
                                  });
        }
        else if (data.method == 'welcome'){
            email_html = get_email_html(data.method, data.payload);
            nodemailer.send_mail({sender: "no-reply@portrit.com", 
                                  to: data.payload.target_email,
                                  subject: 'Welcome To Portrit!',
                                  html: email_html},
                                  function(error, success){
                                      console.log("Message "+(success?"sent":"failed"));
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
        request_server.listen(8080, '192.168.1.145');
    }
    else{
        request_server.listen(8080, '10.117.57.137');
    }
}

var portrit = new Portrit();