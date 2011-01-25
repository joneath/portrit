var events = require('events'),
    sys = require('sys'),
    http = require('http'),
    url = require("url"),
    net = require('net'),
    events = require("events"),
    path = require("path"),
    ws = require('./lib/ws/server');;

var Portrit = function(){
    var self = this;
    var dev = true;
        
    var nomination_emitter = new events.EventEmitter();
    
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

                console.log(data.payload.friends);
                for (var i = 0; i < data.payload.friends.length; i++){
                    console.log('emitting event for: ' + data.payload.friends[i]);
                    nomination_emitter.emit(data.payload.friends[i], data);
                    // nomination_emitter.removeAllListeners(data.payload.friends[i]);
                }
                data_stream = '';
            }
            catch (err){
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
                var nom_callback = function(data){
                    // nomination_emitter.removeAllListeners(event_user);
                    console.log('event sent');
                    clearTimeout(nom_timeout);
                    nomination_emitter.removeAllListeners(event_user);
                    response.writeHead(200, { "Content-Type": "text/plain" });
            		response.end(JSON.stringify(data));
                }

                var nom_timeout = setTimeout(function(){
                    nomination_emitter.removeListener(event_user, nom_callback);
                    response.writeHead(200, { "Content-Type" : "text/plain" });  
                    response.end(JSON.stringify([]));
                }, 25000);

                console.log(nomination_emitter.listeners(event_user));
                nomination_emitter.addListener(event_user, nom_callback);
                console.log('long poll attached');
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
                console.log(err);
            }
            var nom_callback = function(data){
                // nomination_emitter.removeAllListeners(event_user);
                try{
                    console.log('event sent');
                    clearTimeout(nom_timeout);
                    nomination_emitter.removeListener(event_user, nom_callback);
                    response.writeHead(200, { "Content-Type": "text/plain" });
            		response.end(JSON.stringify(data));
                }
                catch(err){
                    console.log(err);
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
                console.log(nomination_emitter.listeners(event_user));
                nomination_emitter.addListener(event_user, nom_callback);
                console.log('long poll attached');
            }
            catch(err){
                console.log(err);
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