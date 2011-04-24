var UrbanAirship = {
    getToken: function() {
        return Ti.Network.remoteDeviceUUID;
    },
    register: function(params, lambda, lambdaerror) {
        var method = 'PUT';
        var token = UrbanAirship.getToken();
        var url = UrbanAirship.baseurl+'/api/device_tokens/'+token;
        payload = (params) ? JSON.stringify(params) : '';
        Ti.API.info('sending registration with params '+payload);
        UrbanAirship.helper(url, method, payload, function(data,status){
            Ti.API.log('completed registration: '+JSON.stringify(status));
            if (status == 200) {
                lambda({action:"updated",success:true});
            } else if (status == 201) {
                lambda({action:"created",success:true});
            } else {
              Ti.API.log('error registration: '+JSON.stringify(status));
            }
        },function(xhr,error) {
          Ti.API.log('xhr error registration: '+JSON.stringify(error));
        });
    },
    unregister: function(lambda) {
        var method = 'DELETE';
        var token = UrbanAirship.getToken();
        var url = UrbanAirship.baseurl+'/api/device_tokens/'+token;
        UrbanAirship.helper(url, method, null, function(data,status){
            if (status == 204) {
              lambda({status:status});
            } else {
              lambda({status: status});
            }
        },function(xhr,error) {
          lambda({success:false,xhr:xhr.status,error:error});
        });
    },
    getAlias: function(lambda) {
        var method = 'GET';
        var token = UrbanAirship.getToken();
        var url= UrbanAirship.baseurl+'/api/device_tokens/'+token;
        UrbanAirship.helper(url, method, null, function(data,status) {
            lambda(data);
        },function(xhr,e) {
          lambda({status:xhr.status,e:e});
        });
    },
    helper: function(url, method, params, lambda, lambdaerror) {
      var xhr = Ti.Network.createHTTPClient();
      xhr.setTimeout(60000);
      xhr.onerror = function(e) {
        lambdaerror(this,e);
      };
      xhr.onload = function() {
        var results = this.responseText;
        lambda(results, this.status);
      };
      // open the client
      xhr.open(method, url);
      xhr.setRequestHeader('Content-Type','application/json');
      xhr.setRequestHeader('Authorization','Basic '+Ti.Utils.base64encode(UrbanAirship.key + ":" + UrbanAirship.master_secret));
      // send the data
      xhr.send(params);
    }
};