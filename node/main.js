var events = require('events'),
    sys = require('sys'),
    http = require('http'),
    url = require("url"),
    net = require('net'),
    events = require("events");

var Portrit = function(){
    var self = this;
    var dev = true;
        
    var nomination_emitter = new events.EventEmitter();
    
    //Send nom won update to django server
    var nom_won_callback = function(data){
        // console.log(data);
        var proxy = http.createClient(8000, "127.0.0.1");
        var proxy_request = proxy.request('GET', '/mark_nomination_as_won?nom_id=' + data.id, {"host": "127.0.0.1"});
        // proxy_request.write('TEST', 'binary');
        proxy_request.end();
        console.log('request sent')
        proxy_request.addListener('response', function (proxy_response) {
            console.log('recieve response');
            // proxy_response.addListener('data', function(chunk) {
            //     response.write(chunk, 'binary');
            // });
            // proxy_response.addListener('end', function() {
            //     response.end();
            // });
            // response.writeHead(proxy_response.statusCode, proxy_response.headers);
        });
        // request.addListener('data', function(chunk) {
        //     proxy_request.write(chunk, 'binary');
        // });
        // request.addListener('end', function() {
        //     proxy_request.end();
        // });
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
            var data = JSON.parse(data_stream);
            
            if (data.method == 'new_nom'){
                console.log('new nom');
                var nom_data = null;
                for (var i = 0; i < data.payload.nom_data.length; i++){
                    nom_data = data.payload.nom_data[i];
                    console.log(nom_data.time_remaining);
                    nomination_emitter.addListener('nom_id_' + nom_data.id, nom_won_callback);
                    var nom_end_timeout = function(noms_data){
                        var nom_id = noms_data.id;
                        var timeout = noms_data.time_remaining * 1000;
                        var data = noms_data;
                        
                        return {
                            init_timeout: function(){
                                setTimeout(function(){
                                    console.log('nom_id_' + nom_id)
                                    nomination_emitter.emit('nom_id_' + nom_id, data);
                                }, 1000000);
                            }
                        }
                    }
                    var nom_timout = nom_end_timeout(nom_data);
                    nom_timout.init_timeout();
                }
            }
            
            console.log(data.payload.friends);
            for (var i = 0; i < data.payload.friends.length; i++){
                console.log('emitting event for: ' + data.payload.friends[i]);
                nomination_emitter.emit(data.payload.friends[i], data);
                nomination_emitter.removeAllListeners(data.payload.friends[i]);
            }
            data_stream = '';
            stream.end();
        });
    });
    tcp_server.listen(8124, 'localhost');
    
    //Django Proxy Server
    http.createServer(function(request, response) {
        var proxy = http.createClient(8000, "127.0.0.1");
        var path = url.parse(request.url).pathname;
        if (dev){
            if (path === '/watch_update/'){
                var event_user = url.parse(request.url, true).query.user;
                var nom_callback = function(data){
                    // nomination_emitter.removeAllListeners(event_user);
                    console.log('event sent');
                    clearTimeout(nom_timeout);
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
            var event_user = url.parse(request.url, true).query.user;
            var nom_callback = function(data){
                // nomination_emitter.removeAllListeners(event_user);
                console.log('event sent');
                clearTimeout(nom_timeout);
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
        
    }).listen(8080, '192.168.1.145');
}

var portrit = new Portrit();