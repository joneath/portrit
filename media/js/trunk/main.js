$(document).ready(function(){
    $('#back').click(function(){
        // if (window.location.hash !== '#' && window.location.hash !== '' && window.location.hash !== '#!/' && window.location.hash != null){
            window.history.back();
        // }
    });
    
    $('#home, #logo_link').bind('click', function(){
        selected_user = '';
        selected_photo = '';
        
        window.location.href = '/#!/';
        $('.stream_nav').removeClass('selected');
        $('#active_stream_view').addClass('selected');
    });
    
    $('#give_feedback a').live('click', show_feedback);
    
    $('#feedback_cont').bind('click', function(){return false;});
    
    $('#submit_feedback').bind('click', function(){
        var message = $('#feedback_message').val();
        if (message != ''){
            $.post('/submit_feedback/', {'message': message}, function(response){
                $('#feedback_message').val('');
                $('#feedback_cont_wrap').hide();
                $('#feedback_reponse').show();
            });
        }
        else{
            $('#error_text').text('We need at least a few letters to know how you feel.');
        }
    });
    
    $(document).bind('keyup', function(e){
        var keycode = e.keyCode;
        
        if (keycode === 13){
            if (search_active){
                e.stopPropagation();
                search_select();
                return false;
            }
        }
        else if (keycode === 38){ //Up Key
            if (search_active){
                e.stopPropagation();
                search_keyboard_press('up');
                return false;
            }
        }
        else if (keycode === 40){ //Down Key
            if (search_active){
                e.stopPropagation();
                search_keyboard_press('down');
                return false;
            }
        }
        else if (keycode === 39){ //Right Key
            if (view_active == 'nom_detail'){
                $('.next_photo_img').click();
            }
        }
        else if (keycode === 37){ //Left Key
            if (view_active == 'nom_detail'){
                $('.prev_photo_img').click();
            }
        }
        else if (keycode === 27){ //Escape
            hide_search_view();
        }
    });
    
    $('#search_cont').bind('click', function(e){
        e.stopPropagation();
    });
    
    $('#search_control').live('click', function(e){
        e.stopPropagation();
        $('#close_search').removeClass().addClass('close_img ' + close_size);
        show_search_view();
    });
    
    $('#close_search').bind('click', function(){
        hide_search_view();
    });
    
    $('#logout').bind('click', function() {
        FB.logout(function(){
            if (window.sessionStorage !== undefined){
                sessionStorage.clear();
                sessionStorage.clear();
            }
            window.location.href = '/';
        });
        $('#cont').fadeOut('fast', function(){
            $(this).html('');
            var logout_html =   '<div id="logout_cont">' +
                                    '<div id="loader"><img src="http://portrit.s3.amazonaws.com/img/album-loader-dark.gif"/></div>' +
                                    '<h1>Logging out. Hold on to your butts!</h1>' +
                                '</div>'

            $('#cont').fadeIn('fast').append(logout_html);
        });
    });
});

    var ENV = 'LOCAL';
    var HOST = 'http://192.168.1.126:8080/';
    
    if (window.location.hostname == 'http://test.portrit.com'){
        ENV = 'TEST';
        HOST = 'http://test.portrit.com/';
    }
    else if (window.location.hostname == 'http://portrit.com'){
        ENV = 'PRODUCTION';
        HOST = 'http://portrit.com/';
    }

    var window_href = window.location.href;
    if (window_href.indexOf('?ref=nf') > 0){
        window.location.href = window_href.replace('?ref=nf', '');
    }

    function render_login_cont(){
        disable_search = true;
        var login_html ='<div id="login_header">' +
                            '<img id="login_logo" src="http://portrit.s3.amazonaws.com/img/logo_blank.png"/>' +
                        '</div>' +
                        '<div id="login_content">' +
                            '<div id="login_top_cont">' +
                                '<div id="tagline_top">' +
                                    '<div id="iphone">' +
                                        '<img src="http://portrit.s3.amazonaws.com/img/iphone_asset.png"/>' +
                                    '</div>' +
                                    '<div id="tagline_text">' +
                                        '<h2>Let\'s find the best photos.</h2>' + 
                                        '<p id="tagline_main">Snap, nominate, vote, and earn wherever you go with the Portrit iPhone app.</p>' +
                                    '</div>' +
                                    '<div class="clear"></div>' +
                                '</div>' +
                                '<div id="login_right_cont">' +
                                    '<h2>Try the Web App.</h2>' +
                                    // '<p>Use your Facebook account to login into Portrit.</p>' +
                                    '<a id="login" class="fb_button fb_button_large"><span class="fb_button_text">Login with Facebook</span></a>' +
                                    '<p style="text-align:center;">Simply click Connect with Facebook.</p>' +
                                '</div>' +
                                '<div class="clear"></div>' +
                            '</div>' +
                            '<div id="login_bottom_cont">' +
                                '<div id="login_points_cont">' +
                                    '<div id="point_1" class="login_points">' +
                                        '<div class="point_header">' +
                                            '<h3>Nominate</h3>' +
                                        '</div>' +
                                        '<div class="clear"></div>' +
                                        '<div class="login_points_cont">' +
                                            '<div class="login_points_bottom">' +
                                                '<h4>Nominate your friend\'s rockin\' pics.</h4>' +
                                                '<p>Be nice and courteous or evil and sick, it\'s up to you.</p>' +
                                            '</div>' +
                                        '</div>' +
                                    '</div>' +
                                    '<div id="point_2" class="login_points">' +
                                        '<div class="point_header">' +
                                            '<h3>Vote</h3>' +
                                        '</div>' +
                                        '<div class="clear"></div>' +
                                        '<div class="login_points_cont">' +
                                            '<div class="login_points_bottom">' +
                                                '<h4>Give your vote to the best.</h4>' +
                                                '<p>The power is in your hands. Use it wisely.</p>' +
                                            '</div>' +
                                        '</div>' +
                                    '</div>' +
                                    '<div id="point_3" class="login_points">' +
                                        '<div class="point_header">' +
                                            '<h3>Earn</h3>' +
                                        '</div>' +
                                        '<div class="clear"></div>' +
                                        '<div class="login_points_cont">' +
                                            '<div class="login_points_bottom">' +
                                                '<h4>Earn trophies for your amazing photos.</h4>' +
                                                '<p>No longer search through thousands of your friend\'s photos to find the best.</p>' +
                                            '</div>' +
                                        '</div>' +
                                    '</div>' +
                                    '<div class="clear"></div>' +
                                '</div>' +
                                '<div id="inactive_trophy_cont">' +
                                    '<ul>' +
                                        '<li class="active" id="hot_cont" name="Hot">' +
                                            '<div class="trophy_img medium hot"></div>' +
                                            '<h3 class="nom_cat_hot_text">Hot</h3>' +
                                        '</li>' +
                                        '<li class="active" id="lol_cont" name="LOL">' +
                                            '<div class="trophy_img medium lol"></div>' +
                                            '<h3 class="nom_cat_lol_text">LOL</h3>' +
                                        '</li>' +
                                        '<li class="active" id="artsy_cont" name="Artsy">' +
                                            '<div class="trophy_img medium artsy"></div>' +
                                            '<h3 class="nom_cat_artsy_text">Artsy</h3>' +
                                        '</li>' +
                                        '<li class="active" id="fail_cont" name="Fail">' +
                                            '<div class="trophy_img medium fail"></div>' +
                                            '<h3 class="nom_cat_fail_text">Fail</h3>' +
                                        '</li>' +
                                        '<li class="active" id="party_animal_cont" name="Party Animal">' +
                                            '<div class="trophy_img medium party_animal"></div>' +
                                            '<h3 class="nom_cat_party_animal_text">Party Animal</h3>' +
                                        '</li>' +
                                        '<li class="active" id="cute_cont" name="Cute">' +
                                            '<div class="trophy_img medium cute"></div>' +
                                            '<h3 class="nom_cat_cute_text">Cute</h3>' +
                                        '</li>' +
                                        '<li class="active" id="wtf_cont" name="WTF">' +
                                            '<div class="trophy_img medium wtf"></div>' +
                                            '<h3 class="nom_cat_wtf_text">WTF</h3>' +
                                        '</li>' +
                                        '<li class="active" id="creepy_cont" name="Creepy">' +
                                            '<div class="trophy_img medium creepy"></div>' +
                                            '<h3 class="nom_cat_creepy_text">Creepy</h3>' +
                                        '</li>' +
                                        '<li class="active" id="awesome_cont" name="Awesome">' +
                                            '<div class="trophy_img medium awesome"></div>' +
                                            '<h3 class="nom_cat_awesome_text">Awesome</h3>' +
                                        '</li>' +
                                        '<li class="active" id="yummy_cont" name="Yummy">' +
                                            '<div class="trophy_img medium yummy"></div>' +
                                            '<h3 class="nom_cat_yummy_text">Yummy</h3>' +
                                        '</li>' +
                                    '</ul>' +
                                '</div>' +
                                '<div id="landing_photo_cont">' +
                                    '<h2></h2>' +
                                    '<div></div>' +
                                '</div>' +
                                '<div class="clear"></div>' +
                            '</div>' +
                            '<div class="clear"></div>' +
                        '</div>';
        $('#login_cont').append(login_html);
        
        var nom_cat_list = ['hot','lol','artsy','fail','party_animal','cute','wtf','creepy','awesome','yummy'];
        var cat_text_dict = {
            'hot': 'Hot',
            'lol': 'LOL',
            'artsy': 'Artsy',
            'fail': 'Fail',
            'party_animal': 'Party Animal',
            'cute': 'Cute',
            'wtf': 'WTF',
            'creepy': 'Creepy',
            'awesome': 'Awesome',
            'yummy': 'Yummy'
        };
        var random_trophy_index = Math.floor(Math.random()*(nom_cat_list.length - 1));
        
        $('#' + nom_cat_list[random_trophy_index] + '_cont').addClass('hover_lock');
        load_landing_cat_photos(cat_text_dict[nom_cat_list[random_trophy_index]]);
        
        $('#landing_photo_cont > h2').text('Top ' + cat_text_dict[nom_cat_list[random_trophy_index]] + ' Photos');
        
        $('#inactive_trophy_cont li').bind('click', function(){
            if ($(this).hasClass('hover_lock') == false){
                $('#inactive_trophy_cont li').removeClass('hover_lock');
                $(this).addClass('hover_lock');
                cat = $(this).attr('name');
                $('#landing_photo_cont > h2').text('Top ' + cat + ' Photos');
                load_landing_cat_photos(cat);
            }
            return false;
        });
        
        $('#login').bind('click', login_user);
        
        $('#landing_photo_cont .top_cat_photo').live('click', function(){
            $('#landing_photo_cont .top_cat_photo').die('click');
            window.location.href = $('a', this).attr('href');
            init_public_view();
            return false;
        });
    }
    
    var landing_photo_timeout = null;
    function load_landing_cat_photos(cat){
        $('#landing_photo_cont > div').children().fadeOut('fast', function(){
            $(this).remove();
        });
        $.getJSON('/api/get_community_top_nominations_cat/', {'cat': cat, 'page_size': 36, 'landing': true}, function(data){
            clearInterval(landing_photo_timeout);
            landing_photo_timeout = setInterval(function(){
                if ($('#landing_photo_cont > div').children().length == 0){
                    clearInterval(landing_photo_timeout);
                    var photo_html = '';
                    var top = 36;
                    var diff = 0;
                    
                    diff = top - data.length;
                    $('#landing_photo_cont > div').append('<p class="tooltip"></p>');
                    for (var i = 0; i < data.length; i++){
                        photo_html ='<div style="display: none;" class="top_cat_photo" name="' + data[i].nominatee_username + '">' +
                                        '<a href="/#!/community/active/' + data[i].id + '/">' +
                                            '<img src="' + data[i].photo.crop_small + '"/>' +
                                        '</a>' +
                                    '</div>';
                        $('#landing_photo_cont > div').append(photo_html);
                    }
                    for (var i = 0; i < diff; i++){
                        photo_html ='<div style="display: none;">' +
                                        '' +
                                    '</div>';
                        $('#landing_photo_cont > div').append(photo_html);
                    }
                    $('#landing_photo_cont > div').children().fadeIn('fast');
                }
            }, 50);
        });
    }
    
    function login_user(){
        if (window.sessionStorage !== undefined){
            try{
                sessionStorage.removeItem('me');
                sessionStorage.removeItem('friends');
            }
            catch (err){
                
            }
        }
        FB.login(handleSessionResponse, {perms:'publish_stream,offline_access,email'});
    }

    var watch_hashtag_interval = null;
    var public_view = false;
    // handle a session response from any of the auth related calls
    function handleSessionResponse(response) {
        clearTimeout(fb_server_timeout);
        clearInterval(watch_hashtag_interval);
        $('#content_loading').remove();
        var window_href = window.location.href;
        var window_href_replace_query = window_href.replace('?', '#!/');
        if (window_href != window_href_replace_query){
            window.location.href = window_href_replace_query;
            return;
        }
        // if (window.location.hash == ''){
        //     window.location.hash = '#!/';
        // }
        
        if (!response.session) {
            view_active = 'login';
            if (getUrlVars().length > 0){
                clearInterval(watch_hashtag);
                init_public_view();
            }
            else{
                render_login_cont();
                attach_login_handlers();
                $('#header').hide();
            }
            if (mobile){
                $('div#login_header').css({
                    'padding-bottom': '0px'
                });
            }
            $('.footer_hover').bind('click', function(){
                window.location.href = $(this).attr('href');
                init_public_view();
                $('.footer_hover').unbind('click');
                return false;
            });
            return;
        }
        
        public_view = false;
        global_hash_tag = window.location.hash;
        fb_session = response.session;
        
        $('#login_cont').remove();
        
        $('#wrapper').css({'background': 'none'});
        
        $('#login').unbind('click');
        $('.footer_hover').unbind('click');
        $('#add_new_comment, .flag_photo, #nominate').die('mouseover mouseout');
        
        $('#header').removeClass().show();
        $('#public_header').hide();
        $('#general_header').show();
        $('#login_loader').show();
        $('#profile_wrap').remove();
    
        //Set interval handler for url hash changes
        watch_hashtag_interval = setInterval(watch_hashtag, 75);
        login_fb_user();
    }
    
    function attach_login_handlers(){
        $('.top_cat_photo').live('mouseover mouseout', function(event) {
            if (event.type == 'mouseover') {
                show_tooltip(this);
            } else {
                hide_tooltip(this);
            }
        });
    }
    
    if (!Array.prototype.indexOf) {
      Array.prototype.indexOf = function (obj, fromIndex) {
        if (fromIndex == null) {
            fromIndex = 0;
        } else if (fromIndex < 0) {
            fromIndex = Math.max(0, this.length + fromIndex);
        }
        var i = 0;
        var j = 0;
        for (i = fromIndex, j = this.length; i < j; i++) {
            if (this[i] === obj)
                return i;
        }
        return -1;
      };
    }
    
    Array.prototype.find_elm = function (obj, fromIndex) {
      if (fromIndex == null) {
          fromIndex = 0;
      } else if (fromIndex < 0) {
          fromIndex = Math.max(0, this.length + fromIndex);
      }
      var i = 0;
      var j = 0;
      for (i = fromIndex, j = this.length; i < j; i++) {
          if (this[i] == obj)
              return i;
      }
      return -1;
    };
    
    Array.prototype.remove = function(from, to) {
      var rest = this.slice((to || from) + 1 || this.length);
      this.length = from < 0 ? this.length + from : from;
      return this.push.apply(this, rest);
    };
    
    var is_array = function (value) {
        return value &&
            typeof value === 'object' &&
            typeof value.length === 'number' &&
            typeof value.splice === 'function' &&
            !(value.propertyIsEnumerable('length'));
    };
    
    function getUrlVars() {
        var list = [];
        var parts = window.location.hash.split('/');
        var param = null;
        for (var i = 0; i < parts.length; i++){
            param = parts[i];
            if (param != undefined && param != '' && param != '#!' && param != '#'){
               list.push(param);
            }
        }
        return list;
    }
    
    function capitaliseFirstLetter(string){
        return string.charAt(0).toUpperCase() + string.slice(1);
    }
    
    function get_cat_under(cat){
        return cat.replace(' ', '_').toLowerCase();
    }
    
    function getScrollXY() {
        var scrOfX = 0, scrOfY = 0;
        if( typeof( window.pageYOffset ) == 'number' ) {
            //Netscape compliant
            scrOfY = window.pageYOffset;
            scrOfX = window.pageXOffset;
        } else if( document.body && ( document.body.scrollLeft || document.body.scrollTop ) ) {
            //DOM compliant
            scrOfY = document.body.scrollTop;
            scrOfX = document.body.scrollLeft;
        } else if( document.documentElement && ( document.documentElement.scrollLeft || document.documentElement.scrollTop ) ) {
            //IE6 standards compliant mode
            scrOfY = document.documentElement.scrollTop;
            scrOfX = document.documentElement.scrollLeft;
        }
        return [ scrOfX, scrOfY ];
    }
    
    function parseURL(url){
        //save the unmodified url to href property
        //so that the object we get back contains
        //all the same properties as the built-in location object
        var loc = { 'href' : url };

        //split the URL by single-slashes to get the component parts
        var parts = url.replace('//', '/').split('/');

        //store the protocol and host
        loc.protocol = parts[0];
        loc.host = parts[1];

        //extract any port number from the host
        //from which we derive the port and hostname
        parts[1] = parts[1].split(':');
        loc.hostname = parts[1][0];
        loc.port = parts[1].length > 1 ? parts[1][1] : '';

        //splice and join the remainder to get the pathname
        parts.splice(0, 2);
        loc.pathname = '/' + parts.join('/');

        //extract any hash and remove from the pathname
        loc.pathname = loc.pathname.split('#');
        loc.hash = loc.pathname.length > 1 ? '#' + loc.pathname[1] : '';
        loc.pathname = loc.pathname[0];

        //extract any search query and remove from the pathname
        loc.pathname = loc.pathname.split('?');
        loc.search = loc.pathname.length > 1 ? '?' + loc.pathname[1] : '';
        loc.pathname = loc.pathname[0];

        //return the final object
        return loc;
    }
    
    Date.prototype.setISO8601 = function (string) {
        var regexp = "([0-9]{4})(-([0-9]{2})(-([0-9]{2})" +
            "(T([0-9]{2}):([0-9]{2})(:([0-9]{2})(\.([0-9]+))?)?" +
            "(Z|(([-+])([0-9]{2}):([0-9]{2})))?)?)?)?";
        var d = string.match(new RegExp(regexp));

        var offset = 0;
        var date = new Date(d[1], 0, 1);

        if (d[3]) { date.setMonth(d[3] - 1); }
        if (d[5]) { date.setDate(d[5]); }
        if (d[7]) { date.setHours(d[7]); }
        if (d[8]) { date.setMinutes(d[8]); }
        if (d[10]) { date.setSeconds(d[10]); }
        if (d[12]) { date.setMilliseconds(Number("0." + d[12]) * 1000); }
        if (d[14]) {
            offset = (Number(d[16]) * 60) + Number(d[17]);
            offset *= ((d[15] == '-') ? 1 : -1);
        }

        offset -= date.getTimezoneOffset();
        time = (Number(date) + (offset * 60 * 1000));
        this.setTime(Number(time));
    }
    
    function isValidEmailAddress(emailAddress) {
        var pattern = new RegExp(/^[a-zA-Z0-9\._%-]+@[A-Z0-9\.-]+\.[a-zA-Z]{2,4}(?:(?:[,][a-zA-Z0-9\._%-]+@[a-zA-Z0-9\.-]+))?$/i);
        return pattern.test(emailAddress);
    }
    
    function isEmpty(obj) {
    	for(var prop in obj) {
    		if(obj.hasOwnProperty(prop))
    			return false;
    	}
    	return true;
    }
    
    function secondsToHms(d) {
    	d = Number(d);
    	var days = Math.floor(d / 86400)
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
        // return ((h > 0 ? h + ":" : "") + (m > 0 ? (h > 0 && m < 10 ? "0" : "") + m + ":" : "0:") + (s < 10 ? "0" : "") + s);
    }
    
    function getGetOrdinal(n) {
       var s=["th","st","nd","rd"],
           v=n%100;
       return n+(s[(v-20)%10]||s[v]||s[0]);
    }
    
    function alphaNumericCheck(value){
        var regex=/^[0-9A-Za-z]+$/; //^[a-zA-z]+$/
        if(regex.test(value)){
            return true;
        } 
        else {
            return false;
        }
    }
    
    //Globals
    var reEscape = new RegExp('(\\' + ['/', '.', '*', '+', '?', '|', '(', ')', '[', ']', '{', '}', '\\'].join('|\\') + ')', 'g'),
    selected_user = '',
    selected_photo = '',
    view_active = '',
    mobile = false,
    tablet = false,
    fb_session = null,
    disable_search = false,
    global_hash_tag = '#!',
    search_string = "",
    search_active = false,
    friends = { },
    stream_view = null,
    view_active = '',
    fb_server_timeout = null;
    close_size = 'normal',
    me = null;
    
    if (DetectMobileQuick() === true){
        mobile = true;
        // close_size = 'mobile'
        // 
        // if (typeof(_gaq) !== "undefined"){
        //     var meta_html = '<link rel="stylesheet" href="http://portrit.s3.amazonaws.com/styles/production/mobile-14.css"/>' +
        //                     '<meta id="viewport_meta" name="viewport" content="width=520, user-scalable=no"/>' +
        //                     '<link rel="shortcut icon" href="http://portrit.s3.amazonaws.com/img/favicon.ico">' +
        //                     '<link rel="apple-touch-icon" href="http://portrit.s3.amazonaws.com/img/icon128.png"/>' +
        //                     '<link rel="apple-touch-icon-precomposed" href="http://portrit.s3.amazonaws.com/img/icon128.png"/>';
        // 
        // }
        // else{
        //     var meta_html = '<link rel="stylesheet" href="/site_media/styles/trunk/mobile.css"/>' +
        //                     '<meta id="viewport_meta" name="viewport" content="width=520, user-scalable=no"/>' +
        //                     '<link rel="shortcut icon" href="/site_media/img/favicon.ico">' +
        //                     '<link rel="apple-touch-icon" href="/site_media/img/icon128.png"/>' +
        //                     '<link rel="apple-touch-icon-precomposed" href="/site_media/img/icon128.png"/>';
        // 
        // }
        // $('head').append(meta_html);

        // var window_width = 520;
        // $('body, html, #header, #cont, #wrapper').css({
        //     'margin': '0 auto',
        //     'min-width': window_width,
        //     'width': window_width,
        //     'max-width': window_width
        // });
        // 
        // if(window.orientation != 0){
        //     var window_width = 720;
        //     $('#viewport_meta').attr('content', 'width=520, user-scalable=no, target-densityDpi=160');
        // }else{
        //     var window_width = 520;
        //     $('#viewport_meta').attr('content', 'width=520, user-scalable=no, target-densityDpi=260');
        // }
    }
    else if (DetectIpad() === true){
        close_size = 'mobile';
        mobile = true;
        tablet = true;
        
        // if (typeof(_gaq) !== "undefined"){
        //     var meta_html = '<link rel="stylesheet" href="http://portrit.s3.amazonaws.com/styles/production/tablet-14.css"/>' +
        //                     '<link rel="shortcut icon" href="http://portrit.s3.amazonaws.com/img/favicon.ico">' +
        //                     '<link rel="apple-touch-icon" href="http://portrit.s3.amazonaws.com/img/icon128.png"/>' +
        //                     '<link rel="apple-touch-icon-precomposed" href="http://portrit.s3.amazonaws.com/img/icon128.png"/>';
        // 
        // }
        // else{
        //     var meta_html = '<link rel="stylesheet" href="/site_media/styles/trunk/tablet.css"/>' +
        //                     '<link rel="shortcut icon" href="/site_media/img/favicon.ico">' +
        //                     '<link rel="apple-touch-icon" href="/site_media/img/icon128.png"/>' +
        //                     '<link rel="apple-touch-icon-precomposed" href="/site_media/img/icon128.png"/>';
        // 
        // }
        // $('head').append(meta_html);
    }
    
    if (mobile){
        $('#footer').css('position', 'relative');
    }

    function find_friend(fid, search_array){
        var friend_index = -1;
        for (var i = 0; i < search_array.length; i++){
            if (search_array[i].id === fid){
                friend_index = i;
            }
        }
        return friend_index;
    }
    
    function render_about(){
        var facebook_frame = '<div id="facebook_frame"><iframe src="http://www.facebook.com/plugins/likebox.php?href=http%3A%2F%2Fwww.facebook.com%2Fapps%2Fapplication.php%3Fid%3D126374870731237&amp;width=292&amp;connections=10&amp;stream=true&amp;header=true&amp;height=587" scrolling="no" frameborder="0" style="border:none; overflow:hidden; width:292px; height:587px;" allowTransparency="true"></iframe></div>';
        var about_html ='<h1 id="about_title">About</h1>' + 
                        '<div id="about_right_cont">' +
                            '<div id="find_us">' +
                                '<h3>Find us on the tubes</h3>' +
                                '<ul>' +
                                    '<li>' +
                                        '<h4>Blog</h4>' +
                                        '<a target="_blank" href="http://blog.portrit.com">Posterous</a>' +
                                    '</li>' +
                                    '<li>' +
                                        '<h4>Twitter</h4>' +
                                        '<a target="_blank" href="http://twitter.com/#!/portrit">@portrit</a>' +
                                    '</li>' +
                                '</ul>' +
                            '</div>' +
                            facebook_frame + 
                        '</div>' +
                        '<div id="about_left_cont">' +
                            '<img src="http://portrit.s3.amazonaws.com/img/about_graphic.jpg"/>' +
                            '<p>Portrit aims to make photo sharing more social. It\'s up to your social circle to find and award the best photos out there. No longer do you need to look through thousands of your friend\'s photos to find the best ones. On Portrit, you and your friends filter the lame photos from the awesome ones.</p>' +
                            '<p>Co-founded by Jonathan Eatherly and Jerry Lin in 2010.</p>' + 
                        '</div>' +
                        '<div class="clear"></div>';
        $('#context_cont').append(about_html);
        
        if (typeof(_gaq) !== "undefined"){
            _gaq.push(['_trackEvent', 'About', 'Shown', '']);
        }
    }
    
    function render_contact(){
        var contact_html = '<div id="contact_header">' +
                            '<h1 id="contact_title">Tell Us What\'s Up</h1>' +
                            '<p id="contact_explain">Comments? Love us? Hate us? Found a bug and want to share? Dont hold back, give it to us real.</p>' +
                         '</div>' +
                         '<div id="contact_nav">' +
                            '<ul>' +
                                '<li id="tab_contact" name="contact" style="opacity: 1.0;" onclick="void(0)">' +
                                    '<span>Send us a Message</span>' +
                                '</li>' +
                                '<li name="bug" id="tab_bug" onclick="void(0)">' +
                                    '<span>File a Bug Report</span>' +
                                '</li>' +
                         '</div>' +
                         '<div class="clear"></div>' +
                         '<div id="contact_form_cont">' +
                            '<form action="" method="POST" id="contact_form">' +
                                '<div id="contact_email_cont">' +
                                    '<label for="contact_email">Your email address</label>' +
                                    '<input type="text" id="contact_email"/>' +
                                    '<div class="clear"></div>' +
                                '</div>' +
                                '<div id="contact_reason_cont">' +
                                    '<label for="contact_reason">Reason for contacting us</label>' +
                                    '<select id="contact_reason" name="contact_reason">' +
                                        '<option value>Please choose one (required)</option>' + 
                                        '<option value="1">Portrit support & help</option>' + 
                                        '<option value="2">General feedback</option>' + 
                                        '<option value="3">Report abuse or Terms of Use violation</option>' + 
                                        '<option value="4">Partnership opportunities</option>' + 
                                        '<option value="5">Press Inquiry</option>' + 
                                        '<option value="6">Advertise with Portrit</option>' + 
                                    '</select>' +
                                    '<div class="clear"></div>' +
                                '</div>' +
                                '<div id="contact_message_cont">' +
                                    '<label for="contact_message">Message</label>' +
                                    '<textarea name="contact_message"></textarea>' +
                                    '<div class="clear"></div>' +
                                '</div>' +
                                '<div class="submit_cont">' +
                                    '<span class="button sick">Send Message</span>' +
                                '</div>' +
                            '</form>' +
                         '</div>' +
                         '<div id="bug_form_cont" style="display:none;">' +
                             '<form action="" method="POST" id="bug_form">' +
                                 '<div id="bug_email_cont">' +
                                     '<label for="bug_email">Your email address</label>' +
                                     '<input type="text" id="bug_email"/>' +
                                     '<div class="clear"></div>' +
                                 '</div>' +
                                 '<div id="bug_where_cont">' +
                                    '<label for="bug_where">Where?</label>' +
                                    '<input id="bug_where" type="text" name="bug_where"/>'+
                                    '<div class="clear"></div>' +
                                 '</div>' +
                                 '<div id="bug_what_cont">' +
                                     '<label for="bug_what">What Happened?</label>' +
                                     '<textarea id="bug_what" name="bug_what"/>'+
                                     '<div class="clear"></div>' +
                                 '</div>' +
                                 '<div id="bug_op_cont">' +
                                       '<label for="bug_op">Operating System</label>' +
                                       '<input id="bug_op" type="text" name="bug_op"/>'+
                                       '<div class="clear"></div>' +
                                 '</div>' +
                                 '<div id="bug_browser_cont">' +
                                        '<label for="bug_browser">Web Browser</label>' +
                                        '<input id="bug_browser" type="text" name="bug_browser"/>'+
                                        '<div class="clear"></div>' +
                                 '</div>' +
                                 '<div class="submit_cont">' +
                                    '<span class="button sick">Submit Report</span>' +
                                '</div>' +
                             '</form>' +
                          '</div>' +
                          '<div class="clear"></div>';
        
        $('#contact_nav li').live('click', function(){
            var name = $(this).attr('name');
            if (name === 'contact'){
                $('#contact_explain').text('Comments? Love us? Hate us? Found a bug and what to share? Dont hold back, give it to us real.');
                $('#bug_form_cont').hide();
                $('#contact_form_cont').show();
                $('#contact_nav li').css({'opacity': '0.7'});
                $(this).css({'opacity': '1.0'});
            }
            else if (name === 'bug'){
                $('#contact_explain').text('Found a problem with the site? Please use the form below to describe the issue in as much detail as possible so we know how to reproduce it.');
                $('#contact_form_cont').hide();
                $('#bug_form_cont').show();
                $('#contact_nav li').css({'opacity': '0.7'});
                $(this).css({'opacity': '1.0'});
            }
        });
        
        $('#contact_form .button, #bug_form .button').live('click', function(){
            var that = this;
            var parent = $(this).parent().parent();
            if ($(parent).attr('id') == 'contact_form'){
                var error = false;
                var email = $('#contact_email').val();
                var reason = $('#contact_reason').val();
                var message = $('#contact_message_cont textarea').val();
                
                if (!isValidEmailAddress(email)){
                    error = true;
                    $('#contact_email_cont .invalid_data').remove();
                    $('#contact_email').after('<div class="invalid_data"></div>')
                }
                else{
                    $('#contact_email_cont .invalid_data').remove();
                }
                if (reason < 1 || reason > 6){
                    error = true;
                    $('#contact_reason_cont .invalid_data').remove();
                    $('#contact_reason').after('<div class="invalid_data"></div>');
                }
                else{
                    $('#contact_reason_cont .invalid_data').remove();
                }
                if (message == ''){
                    error = true;
                    $('#contact_message_cont .invalid_data').remove();
                    $('#contact_message_cont > textarea').after('<div class="invalid_data"></div>');
                    
                }
                else{
                    $('#contact_message_cont .invalid_data').remove();
                }
                
                if (!error){
                    $(that).hide();
                    $('#contact_form .submit_cont').append('<img class="submit_pending" src="http://portrit.s3.amazonaws.com/img/ajax-loader-light.gif"/>');
                    $.post('/contact_portrit/', {'email': email, 'reason': reason, 'message': message}, function(data){
                        $('.submit_pending').remove();
                        $(that).show();
                        $('#contact_form .submit_pending').remove();
                        $('#contact_email').val('');
                        $('#contact_reason').val('');
                        $('#contact_message_cont textarea').val('');
                        $('#contact_form .submit_cont').append('<h2 style="margin-botton: 5px; margin-top: 10px;">Thanks for your message. We will get to it soon.</h2>');
                        $('.submit_cont h2').animate({
                            opacity: 0
                        }, 8000, function(){
                            $(this).remove();
                        });
                    });
                }
                else{
                    
                }
            }
            else if ($(parent).attr('id') == 'bug_form'){
                var error = false;
                var email = $('#bug_email').val();
                var where = $('#bug_where').val();
                var message = $('#bug_what').val();
                var os = $('#bug_op').val();
                var browser = $('#bug_browser').val();
                
                if (!isValidEmailAddress(email)){
                    error = true;
                    $('#bug_email_cont .invalid_data').remove();
                    $('#bug_email').after('<div class="invalid_data"></div>')
                }
                else{
                    $('#bug_email_cont .invalid_data').remove();
                }
                if (where == ''){
                    error = true;
                    $('#bug_where_cont .invalid_data').remove();
                    $('#bug_where').after('<div class="invalid_data"></div>');
                }
                else{
                    $('#bug_where_cont .invalid_data').remove();
                }
                if (message == ''){
                    error = true;
                    $('#bug_what_cont .invalid_data').remove();
                    $('#bug_what').after('<div class="invalid_data"></div>');
                    
                }
                else{
                    $('#bug_what_cont .invalid_data').remove();
                }
                if (os == ''){
                    error = true;
                    $('#bug_op_cont .invalid_data').remove();
                    $('#bug_op').after('<div class="invalid_data"></div>');
                    
                }
                else{
                    $('#bug_op_cont .invalid_data').remove();
                }
                if (browser == ''){
                    error = true;
                    $('#bug_browser_cont .invalid_data').remove();
                    $('#bug_browser').after('<div class="invalid_data"></div>');
                    
                }
                else{
                    $('#bug_browser_cont .invalid_data').remove();
                }
                
                if (!error){
                    $(that).hide();
                    $('#bug_form .submit_cont').append('<img class="submit_pending" src="http://portrit.s3.amazonaws.com/img/ajax-loader-light.gif"/>');
                    $.post('/submit_bug_report/', {'email': email, 'where': where, 'message': message, 'os': os, 'browser': browser}, function(data){
                        $('#bug_form .submit_pending').remove();
                        $(that).show();
                        $('#bug_email').val('');
                        $('#bug_where').val('');
                        $('#bug_what').val('');
                        $('#bug_op').val('');
                        $('#bug_browser').val('');
                        $('#bug_form .submit_cont').append('<h2>Thanks for your report. It\'s people like you that keep this place nice.</h2>');
                        $('.submit_cont h2').animate({
                            opacity: 0
                        }, 5000, function(){
                            $(this).remove();
                        });
                    });
                }
                else{
                    
                }
            }
            
            return false;
        });
        
        $('#context_cont').append(contact_html);
        
        if (typeof(_gaq) !== "undefined"){
            _gaq.push(['_trackEvent', 'Contact', 'Shown', '']);
        }
    }
    
    function render_terms(){
        var terms_html =    '<h1 id="terms_title">Terms of Use</h1>' + 
                            '<p>The following Terms of Use outline your obligations when using the Portrit website. You can also review our Privacy Policy, which outlines our obligations and practices towards handling any personal information that you may provide to us.</p>' +
                            '<h2 class="terms_sub_title">1. Acceptance of Terms</h2>' +
                            '<p>The web pages available at portrit.com, and all linked pages ("Site"), are owned and operated by Portrit, Inc. ("Portrit"), a Oregon corporation, and is accessed by you under the Terms of Use described below ("Terms of Use").<br/><br/>Please read these terms of use carefully before using Portrit or its services. By accessing Portrit or using any part of the Site you agree to become bound by these terms and conditions. If you do not agree to all the terms and conditions, then you may not access Portrit, or use the content or any services offered. Portrit\'s acceptance is expressly conditioned upon your assent to all these terms and conditions, to the exclusion of all other terms; if these terms and conditions are considered an offer by Portrit, acceptance is expressly limited to these terms.</p>' +
                            '<h2 class="terms_sub_title">2. Modifications of the Terms of Use</h2>' +
                            '<p>Portrit reserves the right, at its sole discretion, to modify or replace the Terms of Use at any time. If the alterations constitute a material change to the Terms of Use, Portrit will notify you by posting an announcement on the Site. What constitutes a "material change" will be determined at Portrit\'s sole discretion, in good faith and using common sense and reasonable judgment. You shall be responsible for reviewing and becoming familiar with any such modifications. Use of the Services by you following such notification constitutes your acceptance of the terms and conditions of the Terms of Use as modified.</p>' +
                            '<h2 class="terms_sub_title">3. Description of the Service</h2>' +
                            '<p>Subject to full compliance with the Terms of Use, Portrit may offer to provide certain services and content, as described more fully on the Site, ("Services"). Services shall include, but not be limited to, any service and content Portrit performs for you, as well as the offering of any materials displayed, transmitted or performed on the Site or through the Services (including, but not limited to text, user comments, information, photographs, images, illustrations, audio clips and video clips, also known as the "Content"). Portrit may change, suspend or discontinue the Services for any reason, at any time, including the availability of any feature. Portrit may also impose limits on certain features and services or restrict your access to parts or all of the Services without notice or liability.</p>' +
                            '<h2 class="terms_sub_title">4. Portrit Privacy Policy</h2>' +
                            '<p>Portrit\'s current privacy policy is available at <a href="http://portrit.com/#!/privacy/">portrit.com/#!/privacy/</a> (the "Privacy Policy"), which is incorporated by this reference.</p>' +
                            '<h2 class="terms_sub_title">5. Indemnity</h2>' +
                            '<p>You will indemnify and hold harmless Portrit, its parents, subsidiaries, affiliates, customers, vendors, officers and employees from any liability, damage or cost (including reasonable attorneys. fees and cost) from (i) any claim or demand made by any third party due to or arising out of your access to the Site, use of the Services, violation of the Terms of Use by you, or the infringement by you, or any third party using your account or Facebook User ID, of any intellectual property or other right of any person or entity.</p>' +
                            '<h2 class="terms_sub_title">6. Warranty Disclaimers</h2>' +
                            '<p>You acknowledge that Portrit has no control over, and no duty to take any action regarding: which users gain access to the Site or use the Services; what effects the Content may have on you; how you may interpret or use the Content; or what actions you may take as a result of having been exposed to the Content. You release Portrit from all liability for you having acquired or not acquired Content through the Site or the Services. The Site or Services may contain, or direct you to sites containing, information that some people may find offensive or inappropriate. Portrit makes no representations concerning any content contained in or accessed through the Site or Services, and Portrit will not be responsible or liable for the accuracy, copyright compliance, legality or decency of material contained in or accessed through the Site or the Services. THE SERVICE, CONTENT, AND SITE ARE PROVIDED ON AN "AS IS" BASIS, WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING, WITHOUT LIMITATION, IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE OR NON-INFRINGEMENT. SOME STATES DO NOT ALLOW LIMITATIONS ON HOW LONG AN IMPLIED WARRANTY LASTS, SO THE ABOVE LIMITATIONS MAY NOT APPLY TO YOU.</p>' +
                            '<h2 class="terms_sub_title">7. Links </h2>' +
                            '<p>The Services may provide, or third parties may provide, links to other World Wide Web sites or resources. Because Portrit has no control over such sites and resources, you acknowledge and agree that Portrit is not responsible for the availability of such external sites or resources, and does not endorse and is not responsible or liable for any Content, advertising, products or other materials on or available from such sites or resources. You further acknowledge and agree that Portrit shall not be responsible or liable, directly or indirectly, for any damage or loss caused or alleged to be caused by or in connection with use of or reliance on any such Content, goods or services available on or through any such site or resource.</p>' +
                            '<h2 class="terms_sub_title">8. Limitation of Liability</h2>' +
                            '<p>In no event shall Portrit or its suppliers be liable under contract, tort or strict liability, negligence or other legal theory (i) with respect to the Site, the Service or any content for any lost profits or special, indirect, incidental, punitive or consequential damages of any kind whatsoever, substitute goods or services (however arising), or (ii) for any direct damages in excess of (in the aggregate) $100. Some states do not allow the exclusion or limitation of incidental or consequential damages, so the above limitations and exclusions may not apply to you.</p>' +
                            '<h2 class="terms_sub_title">9. Termination</h2>' +
                            '<p>Portrit may terminate or suspend any and all Services and your Portrit account immediately, without prior notice or liability, if you breach any of the terms or conditions of the Terms of Use. Upon termination of your account, your right to use the Services will immediately cease. If you wish to terminate your Portrit account, you may simply discontinue using the Services. All provisions of the Terms of Use which by their nature should survive termination shall survive termination, including, without limitation, ownership provisions, warranty disclaimers, indemnity and limitations of liability.</p>' +
                            '<h2 class="terms_sub_title">10. Miscellaneous</h2>' +
                            '<p>No agency, partnership, joint venture, or employment is created as a result of the Terms of Use and you do not have any authority of any kind to bind Portrit in any respect whatsoever. The failure of either party to exercise in any respect any right provided for herein shall not be deemed a waiver of any further rights hereunder. Portrit shall not be liable for any failure to perform its obligations hereunder where such failure results from any cause beyond Portrit\'s reasonable control, including, without limitation, mechanical, electronic or communications failure or degradation (including "line-noise" interference). If any provision of the Terms of Use is found to be unenforceable or invalid, that provision shall be limited or eliminated to the minimum extent necessary so that the Terms of Use shall otherwise remain in full force and effect and enforceable. The Terms of Use is not assignable, transferable or sublicensable by you except with Portrit\'s prior written consent. Portrit may transfer, assign or delegate the Terms of Use and its rights and obligations without consent. The Terms of Use shall be governed by and construed in accordance with the laws of the state of Oregon, as if made within Oregon between two residents thereof, and the parties submit to the exclusive jurisdiction of the Superior Court of Oregon and the United States District Court for the District of Oregon. Notwithstanding the foregoing sentence, (but without limiting Portrit\'s right to seek injunctive or other equitable relief in any court of competent jurisdiction), any disputes arising with respect to this Agreement shall be referred to an arbitrator affiliated with JAMS, The Resolution Experts. The arbitrator shall be selected by joint agreement of the parties. In the event the parties cannot agree on an arbitrator within thirty (30) days of the initiating party providing the other party with written notice that it plans to seek arbitration, the parties shall each select an arbitrator affiliated with JAMS, which arbitrators shall jointly select a third such arbitrator to resolve the dispute. The written decision of the arbitrator shall be final and binding on the parties. The arbitration proceeding shall be carried on and heard in Ashland, Oregon using the English language and pursuant to the rules of JAMS. In any action or proceeding to enforce rights under the Terms of Use, the prevailing party will be entitled to recover costs and attorneys\' fees. Both parties agree that the Terms of Use is the complete and exclusive statement of the mutual understanding of the parties and supersedes and cancels all previous written and oral agreements, communications and other understandings relating to the subject matter of the Terms of Use, and that all modifications must be in a writing signed by both parties, except as otherwise provided herein.</p>';
                            
        $('#context_cont').append(terms_html);
        
        if (typeof(_gaq) !== "undefined"){
            _gaq.push(['_trackEvent', 'Terms', 'Shown', '']);
        }
    }
    
    function render_privacy(){
        var privacy_html = '<div id="privacy_cont">' +
                                '<h1 id="privacy_title">Privacy Policy</h1>' +
                                '<p>Portrit is founded on the principles of complete separation of user data. Portrit knows that you care about how your personal information is used and shared, and we take your privacy very seriously. Please read the following to learn more about our privacy policy. By visiting the Portrit website, you are accepting the practices outlined in this Privacy Policy.</p>' +
                                '<p>This Privacy Policy covers Portrit\'s treatment of personal information that Portrit gathers when you are on the Portrit website and when you use Portrit services. This policy does not apply to the practices of third parties that Portrit does not own or control, or to individuals that Portrit does not employ or manage.</p>' +
                                '<h2>Information Collected by Portrit</h2>' +
                                '<p>We only collect personal information that is relevant to the purpose of our website, which is to enable users to discover and share information with one another. This information allows us to provide you with a customized and efficient experience. We do not process this information in a way that is incompatible with this objective. We collect the following types of information from our Portrit users:</p>' +
                                '<h3>Information You Provide to Us:</h3>' +
                                '<p class="indent">We receive and store any information you enter on our website or provide to us in any other way. You can choose not to provide us with certain information, but then you may not be able to take advantage of many of our special features.</p>' +
                                '<h3>Automatic Information:</h3>' +
                                '<p class="indent">We receive and store certain types of information whenever you interact with us. Portrit and its authorized agents automatically receive and record certain "traffic data" on their server logs from your browser including your IP address, Portrit cookie information, and the page you requested. Portrit uses this traffic data to help diagnose problems with its servers, analyze trends and administer the website.</p>' +
                                '<p class="indent">Portrit is built off of the Facebook Open Grah API and as such Portrit abides by the API giudlines as well as any user Facebook privacy policies and permissions.</p>' +
                                '<p class="indent">We will collect data from your Facebook account to enable features like friend lists, nominating photos, votes, and winning trophies. This data is shared across your friends to allow for a consistant experience for the other users of Portrit. We only store the most basic personal information, such as name, facebook id, album ids, and photo ids. You can delete any personal data we have, including votes, comments, nominations, and trophies by going to the settings and requesting to "Remove My Content".</p>' +
                                '<h2>Sharing Your Information</h2>' +
                                '<p>Rest assured that the information gathered about who is using Portrit will be neither rented nor sold to anyone and that we will share your personal information only as described below.</p>' +
                                '<ul>' +
                                    '<li><p>Portrit Personnel: Portrit personnel and authorized consultants and/or contractors may have access to user analytics information if necessary in the normal course of Portrit business.</p></li>' +
                                    '<li><p>Business Transfers: In some cases, we may choose to buy or sell assets. In these types of transactions, user analytics information is typically one of the business assets that is transferred. Moreover, if Portrit, or substantially all of its assets, were acquired, user analytics information would be one of the assets that is transferred.</p></li>' +
                                '</ul>' +
                                '<h2>Keeping Information Secure</h2>' +
                                '<ul>' +
                                    '<li><p>Your Portrit account information is protected by your Facebook account login username and password. Protect against unauthorized access to your password and to your computer by logging off once you have finished using a shared computer.</p></li>' +
                                    '<li><p>Only employees who need personal information to perform a specific job (for example, a customer service representative) are granted access to it. All of our employees are kept up to date on our privacy and security practices.</p></li>' +
                                '</ul>' +
                                '<h2>Changes to this Privacy Policy</h2>' +
                                '<p>Portrit may amend this Privacy Policy from time to time, at its sole discretion. Use of information we collect now is subject to the Privacy Policy in effect at the time such information is used. If we make changes to the Privacy Policy, we will notify you by posting an announcement on the Portrit website so you are always aware of what information we collect, how we use it, and under what circumstances if any, it is disclosed.</p>' +
                                '<h2>Conditions of Use</h2>' +
                                '<p>If you decide to visit Portrit website, your visit and any possible dispute over privacy is subject to this Privacy Policy and our Terms of Use, including limitations on damages, arbitration of disputes, and application of Oregon state law.</p>' +
                                '<h2>Effective Date of this Privacy Policy</h2>' +
                                '<p>This Privacy Policy is effective as of January 31, 2011 and last updated January 28, 2011.</p>' +
                            '</div>';
                            
        $('#context_cont').append(privacy_html);
        
        if (typeof(_gaq) !== "undefined"){
            _gaq.push(['_trackEvent', 'Privacy', 'Shown', '']);
        }
    }
    
    function render_faq(){
        var faq_html =  '<div id="context_header">' +
                            '<h1>Frequently Asked Questions</h1>' +
                            '<p>Ansers to your most pressing questions</p>' +
                        '</div>' +
                        '<div id="context_main_cont">' +
                            '<div class="context_sub_cont">' +
                                '<h3>What\'s Portrit?</h3>' +
                                '<p>Portrit aims to make photo sharing more social. It\'s up to your social circle to find and award the best photos out there. No longer do you need to look through thousands of your friend\'s photos to find the best ones. On Portrit, you and your friends filter the lame photos from the awesome ones.</p>' +
                            '</div>' +
                            '<div class="context_sub_cont">' +
                                '<h2>Nominations</h2>' +
                                '<h3>What\'s a nomination?</h3>' +
                                '<p>A nomination is your way of saying "I think this photo rocks!". We have 10 different categories to choose from, such as Hot, LOL, Fail, Awesome, etc.</p>' +
                            '</div>' +
                            '<div class="context_sub_cont">' +
                                '<h2>Voting</h2>' +
                                '<h3>Can I vote on multiple nominations?</h3>' + 
                                '<p>Yes you can and we prefer you do! Vote up the photos you like and vote down the lame ones.</p>' +
                                '<h3>Why can\'t I change my vote?</h3>' + 
                                '<p>This is to limit the possibilites of gaming the system and give the older nominations a better chance against any last minute nominations.</p>' +
                            '</div>' +
                            '<div class="context_sub_cont">' +
                                '<h2>Trophies</h2>' +
                                '<h3>How do I win trophies?</h3>' +
                                '<p>A nomination requires a positive vote count of 2 for it to be eligable for a trophy. At the end of the night we determine the winners based on vote count and who you are following.</p>' +
                            '</div>' +
                        '</div>';
                            
        $('#context_cont').append(faq_html);
        
        if (typeof(_gaq) !== "undefined"){
            _gaq.push(['_trackEvent', 'FAQ', 'Shown', '']);
        }
    }
    
    function info_context_delagate(context){
        selected_user = {
            'username': null,
            'fid': null,
            'name': null
        };
        stream_view = '';
        $('html, body').scrollTop(0);
        $('.stream_nav').removeClass('selected');
        $('.sub_stream_nav').removeClass('selected');
        $('#profile_cont_wrap').append('<div id="context_cont"></div>');
        if (context === 'about'){
            view_active = 'about';
            render_about();
        }
        else if (context === 'contact'){
            view_active = 'contact';
            render_contact();
        }
        else if (context === 'terms'){
            view_active = 'terms';
            render_terms();
        }
        else if (context === 'privacy'){
            view_active = 'privacy';
            render_privacy();
        }
        else if (context === 'settings'){
            view_active = 'settings';
            render_settings();
        }
        else if (context == 'faq'){
            view_active = 'faq';
            render_faq();
        }
    }
    
    function show_feedback(e){
        disable_search = true;
        e.stopPropagation();

        $('#wrapper').css({
            'opacity': '0.3'
        });
        $('#feedback_cont_wrap').show();
        $('#feedback_reponse').hide();
        $('#feedback').show();
        $('#feedback_message').focus();
        $(document).bind('click', hide_feedback);
        $('#close_feedback').removeClass().addClass('close_img ' + close_size);
        $('#close_feedback, #close_feedback_button').bind('click', hide_feedback);
        return false;
    }
    
    function hide_feedback(){
        disable_search = false;
        $('#wrapper').css({
            'opacity': '1.0'
        });
        $('#feedback').hide();
        
        $(document).unbind('click', hide_feedback);
        $('#close_feedback, #close_feedback_button').unbind('click', hide_feedback);
    }
    
    var startX;
    var dx;
    var direction;
    var swipe_el = null;
    var swipe_listener = null;
    function cancelTouch()
    {
        swipe_el.removeEventListener('touchmove', onTouchMove);
        swipe_el.removeEventListener('touchend', onTouchEnd);
        startX = null;
        startY = null;
        direction = null;
    }

    function onTouchMove(e){
        if (e.touches.length > 1){
            cancelTouch();
        }
        else{
            dx = e.touches[0].pageX - startX;
            var dy = e.touches[0].pageY - startY;
            if (direction == null){
                direction = dx;
                //e.preventDefault();
            }
            else if ((direction < 0 && dx > 0) || (direction > 0 && dx < 0) || Math.abs(dy) > 100){
                cancelTouch();
            }
        }
    }

    function onTouchEnd(e){
        cancelTouch();
        if (Math.abs(dx) > 200){
            swipe_listener({ target: swipe_el, direction: dx > 0 ? 'right' : 'left' });
        }
    }

    function onTouchStart(e){
        if (e.touches.length == 1){
            dx = 0;
            startX = e.touches[0].pageX;
            startY = e.touches[0].pageY;
            swipe_el.addEventListener('touchmove', onTouchMove, true);
            swipe_el.addEventListener('touchend', onTouchEnd, false);
        }
    }
    
    function addSwipeListener(el, listener){
        swipe_el = el;
        swipe_listener = listener;
        swipe_el.addEventListener('touchstart', onTouchStart, false);
    }
    
    function set_mobile_css(){
        var meta_html = '';
        if (mobile && !tablet){
            if (typeof(_gaq) !== "undefined"){
                meta_html = '<link rel="stylesheet" href="http://portrit.s3.amazonaws.com/styles/production/mobile-3.css"/>';
            }
            else{
                meta_html = '<link rel="stylesheet" href="/site_media/styles/trunk/mobile.css"/>';
            }
        }
        else if (mobile && tablet){
            if (typeof(_gaq) !== "undefined"){
                meta_html = '<link rel="stylesheet" href="http://portrit.s3.amazonaws.com/styles/production/tablet-3.css"/>';
            }
        }
        $('head').append(meta_html);
    }
    
    function wait_for_message(){
        // if (window["WebSocket"]) {
        //     //Has websockets
        //     try{
        //         var recvd = 0;
        //         if (production){
        //             var host = "184.73.249.110:8122";
        //         }
        //         else{
        //             var host = HOST;
        //         }
        //         var conn = new WebSocket("ws://"+host);
        //         conn.onmessage = function(event) {
        //             handle_update(JSON.parse(event.data), true);
        //         };
        // 
        //         conn.onerror = function() {
        //             console.log("error", arguments);
        //         };
        // 
        //         conn.onclose = function() {
        //             // console.log("closed");
        //             conn.send(me.id);
        //         };
        // 
        //         conn.onopen = function() {
        //             // console.log("opened");
        //             conn.send(me.id);
        //         };
        //     } 
        //     catch(exception){  
        //          // message('<p>Error'+exception);  
        //     }
        // }
        // else{
            //No websockets
            $.ajax({
                type: "GET",
                url: '/watch_update/',
                data: {'user': me.id},
                dataType: "json",
                async: true,
                cache: false,
                timeout: 30000,

                success: handle_update,
                error: function(XMLHttpRequest, textStatus, errorThrown){
                    //Setup new request
                    setTimeout(wait_for_message, 5000);
                }
            });
        // }
    }
    
    function handle_update(data, long_poll){
        if (data && data.method){
            if (data.method == 'new_nom'){
                for (var i = 0; i < data.payload.nom_data.length; i++){
                    if (data.payload.nom_data[i].nominatee == me.id){
                        render_notification("new_nom", data.payload.nom_data[i]);
                        update_notifications(data.payload.nom_data[i], 'new_nom');
                    }
                    else if (data.payload.nom_data[i].tagged_users.find_elm(me.id) >= 0){
                        render_notification("tagged_nom", data.payload.nom_data[i]);
                        update_notifications(data.payload.nom_data[i], 'tagged_nom');
                    }
                }
                if (view_active == 'stream_active'){
                    inject_nom_stream(data.payload.nom_data, $('#recent_left_cont'));
                }
            }
            else if (data.method == 'vote'){
                if (data.payload.vote_user != me.id){
                    if (nom_cache){
                        if (nom_cache[data.payload.nom_id]){
                            nom_cache[data.payload.nom_id].vote_count = data.payload.vote_count;
                            nom_cache[data.payload.nom_id].votes.push({'vote_user': data.payload.vote_user, 
                                                                        'vote_name': data.payload.vote_name, 
                                                                        'vote_username': data.payload.vote_username});
                        }
                    }
                    if (view_active == 'stream_active' || view_active == 'nom_detail'){
                        update_vote_count(data.payload);
                    }
                }
            }
            else if (data.method == 'new_comment'){                        
                if (data.payload.comment_sender_id != me.id){
                    render_notification("new_comment", data.payload);
                    update_notifications(data.payload, 'new_comment');

                    if (view_active == 'nom_detail'){
                        if (data.payload.id == $('#main_nom_cont').attr('value')){
                            render_comment_update(data.payload);
                        }
                    }
                    else if (view_active == 'stream_active'){
                        render_recent_comment_update(data.payload);
                    }
                }
            }
            else if (data.method == 'new_comment_update'){                        
                if (data.payload.comment_sender_id != me.id){
                    if (view_active == 'nom_detail'){
                        if (data.payload.id == $('#main_nom_cont').attr('value')){
                            render_comment_update(data.payload);
                        }
                    }
                    else if (view_active == 'stream_active'){
                        if (stream_view == 'recent_noms'){
                            render_recent_comment_update(data.payload);
                        }
                    }
                }
            }
            else if (data.method == 'nom_won'){
                render_notification("nom_won", data.payload);
                update_notifications(data.payload, 'nom_won');
            }
            else if (data.method == 'new_follow'){
                render_notification("new_follow", data.payload);
                update_notifications(data.payload, 'new_follow');
                
                update_follow_count();
            }
        }
        if (typeof(long_poll) !== "undefined"){
            //Setup new request
            wait_for_message();
        }
    }
    
    function render_recent_comment_update(data){
        var comment_cont_html ='<div class="comment" id="comment_' + data.comment_id +'" style="display:none;">' +
                                    '<p class="comment_time" value="' + data.create_datetime + '">Right now</p>' +
                                    '<a href="/#!/' + data.comment_sender_username + '/">' +
                                        '<img class="user_photo" src="https://graph.facebook.com/' + data.comment_sender_id + '/picture?type=square"/>' +
                                    '</a>' +
                                    '<a href="/#!/' + data.comment_sender_username + '/" class="post_username from_username">' + data.comment_sender_username + '</a>' +
                                    '<p>' + data.comment + '</p>' +
                                '</div>';
        $('#' + data.id + ' .recent_nom_comment_heading').after(comment_cont_html);
        $('#comment_' + data.comment_id).fadeIn('slow');
        
        var now = new Date();
        var time_diff = null;
        $('.comment_time').each(function(){
            time = new Date($(this).attr('value') * 1000);
            time_diff = now - time;
            time_diff /= 1000;
            $(this).text(secondsToHms(parseInt(time_diff)));
        });
    }
    
    function render_comment_update(data){
        $('#comments_empty').remove();
        var comment_cont_html ='<div class="comment" style="display:none;">' +
                                    '<p class="comment_time" value="' + data.create_datetime + '">Right now</p>' +
                                    '<a href="/#!/' + data.comment_sender_username + '/">' +
                                        '<img class="user_photo" src="https://graph.facebook.com/' + data.comment_sender_id + '/picture?type=square"/>' +
                                    '</a>' +
                                    '<a href="/#!/' + data.comment_sender_username + '/" class="post_username from_username">' + data.comment_sender_username + '</a>' +
                                    '<p>' + data.comment + '</p>' +
                                '</div>';
                                
        $('#new_comment_cont').after(comment_cont_html);
        $('.comment:first').fadeIn('slow');
        
        var now = new Date();
        var time_diff = null;
        $('.comment_time').each(function(){
            time = new Date($(this).attr('value') * 1000);
            time_diff = now - time;
            time_diff /= 1000;
            $(this).text(secondsToHms(parseInt(time_diff)));
        });
    }
    
    var notification_popup_fade_timeout = null;
    var notification_popup_remove_timeout = null;
    function render_notification(method, data){
        var notification_html = '';
        var method_html = '';
        var follow_class = '';
        var follow_username = '';
        
        if (method == 'new_nom'){
            var nominator = ''
            if (data.nominator == me.id){
                nominator = 'You';
            }
            else{
                nominator = data.nominator_username;
            }
            
            method_html =   '<div class="nom_cat_' + data.nomination_category.replace(' ', '_').toLowerCase() + ' notification_color"></div>' +
                            '<div class="notification_text_cont">' +
                                '<p class="strong">' + nominator + '</p>' + '<span> nominated your photo for the </span><p class="strong">' + data.nomination_category + '</p><span> trophy!</span>' +
                            '</div>';
        }
        if (method == 'tagged_nom'){
            var nominator = ''
            if (data.nominator == me.id){
                nominator = 'You';
            }
            else{
                nominator = data.nominator_username;
            }
            
            method_html =   '<div class="nom_cat_' + data.nomination_category.replace(' ', '_').toLowerCase() + ' notification_color"></div>' +
                            '<div class="notification_text_cont">' +
                                '<p class="strong">' + nominator + '</p>' + '<span> tagged you in a nomination for the </span><p class="strong">' + data.nomination_category + '</p><span> trophy!</span>' +
                            '</div>';
        }
        else if (method == 'new_comment'){
            if (data.nom_owner_id == me.id){
                method_html =   '<div class="nom_cat_' + data.nomination_category.replace(' ', '_').toLowerCase() + ' notification_color"></div>' +
                                '<div class="notification_text_cont">' +
                                    '<p class="strong">' + data.comment_sender_username + '</p>' + '<span> commented on your <p class="strong">' + data.nomination_category + '</p> nomination!</span>' +
                                '</div>';
            }
            else if (data.nom_owner_id == data.comment_sender_id){
                method_html =   '<div class="nom_cat_' + data.nomination_category.replace(' ', '_').toLowerCase() + ' notification_color"></div>' +
                                '<div class="notification_text_cont">' +
                                    '<p class="strong">' + data.comment_sender_username + '</p>' + '<span> commented on their <p class="strong">' + data.nomination_category + '</p> nomination!</span>' +
                                '</div>';
            }
            else{
                method_html =   '<div class="nom_cat_' + data.nomination_category.replace(' ', '_').toLowerCase() + ' notification_color"></div>' +
                                '<div class="notification_text_cont">' +
                                    '<p class="strong">' + data.comment_sender_username + '</p>' + '<span> commented on <span class="strong">' + data.nom_owner_username + '\'s</span> <p class="strong">' + data.nomination_category + '</p> nomination!</span>' +
                                '</div>';
            }
        }
        else if (method == 'nom_won'){
            if (data.nominatee == me.id){
                method_html =   '<div class="nom_cat_' + data.nomination_category.replace(' ', '_').toLowerCase() + ' notification_color"></div>' +
                                '<div class="notification_text_cont">' +
                                    '<p class="strong">Your</p>' + '<span> photo won the <p class="strong">' + data.nomination_category + '</p> nomination!</span>' +
                                '</div>';
            }
            else{
                method_html =   '<div class="nom_cat_' + data.nomination_category.replace(' ', '_').toLowerCase() + ' notification_color"></div>' +
                                '<div class="notification_text_cont">' +
                                    '<p class="strong">' + data.nominatee_username + '\'s</p>' + '<span> photo won the <p class="strong">' + data.nomination_category + '</p> nomination!</span>' +
                                '</div>';
            }
        }
        else if (method == 'new_follow'){
            follow_class = 'new_follow';
            follow_username = data.follower_username;
            
            if (data.pending){
                method_html =   '<div class="new_follow notification_color"></div>' +
                                '<div class="notification_text_cont">' +
                                    '<p class="strong">' + follow_username + '</p>' + '<span> would like to follow you.</span>' +
                                '</div>';
            }
            else{
                method_html =   '<div class="new_follow notification_color"></div>' +
                                '<div class="notification_text_cont">' +
                                    '<p class="strong">' + follow_username + '</p>' + '<span> is now following you.</span>' +
                                '</div>';
            }

        }
        
        var notification_id = '';
        
        if (data.notification_id){
            notification_id = data.notification_id;
        }
        
        notification_html = '<div class="notification_popup ' + follow_class + '" style="display:none;" username="' + follow_username + '" value="' + data.id + '" name="' + notification_id + '">' +
                                '<div class="close_notification close_img ' + close_size + '"></div>' +
                                '<div class="notification_cont">' +
                                    method_html +
                                '</div>' +
                            '</div>';
                            
        $('#notification_popup_cont').append(notification_html);
        
        var that = $('.notification_popup:hidden');
        setTimeout(function(){
            $(that).show().css({
                'opacity': 1
            });
        }, 75);
        
        notification_popup_fade_timeout = setTimeout(function(){
             $(that).css({
                 'opacity': 0
             });
             notification_popup_remove_timeout = setTimeout(function(){
                 $(that).remove();
             }, 350);
         }, 7500);
    }
    
    $('.notification_popup').live('click', function(){
        var that = this,
            nom_id = $(this).attr('value'),
            notification_id = parseInt($(this).attr('name')),
            noms_still_unread = false;
        
        $('.notification_popup_cont').each(function(){
            var read = $(this).attr('read'),
                popup_notification_id = parseInt($(this).attr('id').replace('notification_', ''));
            
            if (read == 0 || read == 'false' || read == false){
                if (notification_id == popup_notification_id){
                    $(this).attr('read', 'true');
                    $.post('/notification_read/', {'notification_id': notification_id}, function(){
                    
                    });
                }
                else{
                    noms_still_unread = true;
                }
            }
        });
        
        if (noms_still_unread){
            $('#footer_notification_cont').css('opacity', 1);
        }
        else{
            $('#footer_notification_cont').css('opacity', 0.3);
        }
        
        title_notification_count = 0;
        update_title_notification_count();
        if ($(this).hasClass('new_follow')){
            var username = $(this).attr('username');
            window.location.href = '/#!/' + username + '/';
        }
        else{
            window.location.href = '/#!/nomination/' + nom_id + '/';
        }
        
        $(this).css({
            'opacity': 0
        });
        setTimeout(function(){
            $(that).remove();
        }, 350);
    });
    
    if (!mobile){
        $('.notification_popup').live('mouseover mouseout', function(event) {
            var that = this;
            if (event.type == 'mouseover') {
                clearTimeout(notification_popup_fade_timeout);
                clearTimeout(notification_popup_remove_timeout);
            } else {
                notification_popup_fade_timeout = setTimeout(function(){
                    $(that).css({
                        'opacity': 0
                    });
                    notification_popup_remove_timeout = setTimeout(function(){
                        $(that).remove();
                    }, 350);
                }, 7500);
            } 
        });
    }
    
    $('.close_notification').live('click', function(e){
        var that_parent = $(this).parent();
        $(that_parent).css({
            'opacity': 0
        });
        setTimeout(function(){
            $(that_parent).remove();
        }, 350);
        
        e.stopPropagation();
        return false;
    });
    
    function update_title_notification_count(){
        if (title_notification_count > 0){
            $('title').text('Portrit (' + title_notification_count + ')');
        }
        else{
            $('title').text('Portrit');
        }
    }
    
    function update_follow_count(){
        if ($('#profile_followers_count_cont').length > 0 && selected_user.fid == me.id){
            var followers_count = parseInt($('#profile_followers_count_cont h3').text());
            followers_count += 1;
            
            $('#profile_followers_count_cont h3').text(followers_count);
        }
    }
    
    var title_notification_count = 0;
    function update_notifications(data, method){
        var notification_html = '';
        var name = '';
        var nom_cat = '';
        var owner_text = '';
        var photo_html = '';
        title_notification_count += 1;
        update_title_notification_count();
        if (typeof(data.nomination_category) != 'undefined'){
            nom_cat = data.nomination_category.replace(' ', '_').toLowerCase();
        }
        
        var photo_html = '';
        if ( data.photo){
            photo_html = '<img src="' + data[i].photo.crop_small + '"/>';
        }
        
        if (method == 'new_nom'){
            if (data.nominator == me.id){
                name = 'You';
            }
            else{
                name = data.nominator_username;
            }
            notification_html = '<div class="notification_popup_cont color_transition nom_cat_'  + nom_cat + '" name="' + nom_cat + '" value="' + data.id + '" read="false" id="notification_' + data.notification_id + '" onclick="void(0)">' +
                                    // '<div class="new_nom_icon notification_icon"></div>'+
                                    photo_html +
                                    '<div class="notification_text_cont white_back">' +
                                        '<p class="strong" style="">' + name +'</p>' +
                                        '<span> nominated your photo.</span>' +
                                        '<p class="time">Right now</p>' +
                                    '</div>' +
                                    '<div class="kill_notification close_img ' + close_size + '" value="' + data.notification_id + '" style="display:none;"></div>' +
                                '</div>';
        }
        if (method == 'tagged_nom'){
            name = data.nominator_username;
            notification_html = '<div class="notification_popup_cont color_transition nom_cat_'  + nom_cat + '" name="' + nom_cat + '" value="' + data.id + '" read="false" id="notification_' + data.notification_id + '" onclick="void(0)">' +
                                    // '<div class="tagged_nom_icon notification_icon"></div>'+
                                    photo_html +
                                    '<div class="notification_text_cont white_back">' +
                                        '<p class="strong" style="">' + name +'</p>' +
                                        '<span> tagged you in a nomination.</span>' +
                                        '<p class="time">Right now</p>' +
                                    '</div>' +
                                    '<div class="kill_notification close_img ' + close_size + '" value="' + data.notification_id + '" style="display:none;"></div>' +
                                '</div>';
        }
        else if (method == 'new_comment'){
            if (data.comment_sender_id == me.id){
                name = 'You';
            }
            else{
                name = data.comment_sender_username;
            }
            if (data.nom_owner_id == me.id){
                owner_text = 'your';
            }
            else{
                owner_text = data.nom_owner_username + '\'s';
            }
            
            notification_html = '<div class="notification_popup_cont color_transition nom_cat_'  + nom_cat + '" name="' + nom_cat + '" value="' + data.id + '" read="false" id="notification_' + data.notification_id + '" onclick="void(0)">' +
                                    // '<div class="new_comment_icon notification_icon"></div>'+
                                    photo_html +
                                    '<div class="notification_text_cont white_back">' +
                                        '<p class="strong" style="">' + name +'</p>' +
                                        '<span> commented on ' + owner_text + ' photo.</span>' + 
                                        '<p class="time">Right now</p>' +
                                    '</div>' +
                                    '<div class="kill_notification close_img ' + close_size + '" value="' + data.notification_id + '" style="display:none;"></div>' +
                                '</div>';
        }
        else if (method == 'nom_won'){
            if (data.nominatee == me.id){
                name = 'Your';
            }
            else{
                name = data.nominatee_name + '\'s';
            }
            notification_html = '<div class="notification_popup_cont color_transition nom_cat_'  + nom_cat + '" name="' + nom_cat + '" value="' + data.id + '" read="false" won="true" id="notification_' + data.notification_id + '" onclick="void(0)">' +
                                    // '<div class="nom_won_icon notification_icon"></div>'+
                                    photo_html +
                                    '<div class="notification_text_cont white_back">' +
                                        '<p class="strong" style="">' + name +'</p>' +
                                        '<span> photo won the </span><p class="strong" style="">' + data.nomination_category + '</p><span> trophy!</span>' +
                                        '<p class="time">Right now</p>' +
                                    '</div>' +
                                    '<div class="kill_notification close_img ' + close_size + '" value="' + data.notification_id + '" style="display:none;"></div>' +
                                '</div>';
        }
        else if (method == 'new_follow'){
            if (data.pending){
                notification_html +='<div class="notification_popup_cont new_follow" value="' + data.follower_username + '" read="false" id="notification_' + data.id + '" onclick="void(0)">' +
                                        '<div class="new_follow_icon notification_icon"></div>'+
                                        '<div class="notification_text_cont white_back color_transition new_follow">' +
                                            '<div class="notification_pending_cont" value="' + data.notification_id + '">' +
                                                '<span class="sick small notification_deny" value="deny">Deny</span>'+
                                                '<span class="sick small notification_accept" value="accept">Accept</span>'+
                                            '</div>' +
                                            '<p class="strong">' + data.follower_username + '</p><span> would like to follow you.</span>' +
                                            '<p class="time">Right now</p>' +
                                            '<div class="clear"></div>' +
                                        '</div>' +
                                        '<div class="kill_notification close_img ' + close_size + '" value="' + data.notification_id + '" style="display:none;"/></div>' +
                                    '</div>';
                                    
                                    
            }
            else{
                notification_html +='<div class="notification_popup_cont new_follow" value="' + data.follower_username + '" read="false" id="notification_' + data.id + '" onclick="void(0)">' +
                                        '<div class="new_follow_icon notification_icon"></div>'+
                                        '<div class="notification_text_cont white_back color_transition new_follow">' +
                                            '<p class="strong">' + data.follower_username + '</p><span> is now following you.</span>' +
                                            '<p class="time">Right now</p>' +
                                            '<div class="clear"></div>' +
                                        '</div>' +
                                        '<div class="kill_notification close_img ' + close_size + '" value="' + data.notification_id + '" style="display:none;"/></div>' +
                                    '</div>';
            }
            
            

        }

        $('#notification_footer_popup_cont').prepend(notification_html);
        
        $('#footer_notification_cont').css({
           'opacity': '1.0' 
        });
        $('#footer_notification_cont > p').addClass('nom_cat_' + nom_cat + '_text');
    }
    
    function render_notifications(data){
        var notification_html = '',
            source_name = '',
            dest_name = '',
            color_class = '',
            nom_cat = '',
            first_unread = true,
            now = null,
            time = null,
            my_winnings = [ ],
            time_str = '';
        
        if (data){
            for (var i = 0; i < data.length; i++){
                color_class = '';
                if (data[i].source_id == me.id){
                    if (data[i].notification_type == 'nom_won'){
                        source_name = "Your";
                    }
                    else{
                        source_name = 'You';
                    }
                }
                else{
                    source_name = data[i].source_username;
                }
                
                if (data[i].destination_id && data[i].destination_id != ''){
                    if (data[i].destination_id == me.id){
                        if (data[i].notification_type == 'nom_won'){
                            dest_name = "Your";
                        }
                        else{
                            dest_name = 'your';
                        }
                    }
                    else{
                        dest_name = data[i].destination_username + '\'s';
                    }
                }
                else{
                    dest_name = 'Your';
                }
                
                if (data[i].nomination_category){
                    nom_cat = data[i].nomination_category.replace(' ', '_').toLowerCase();
                    if (!data[i].read){
                        color_class = 'color_transition nom_cat_' + nom_cat;
                        if (first_unread){
                            $('#footer_notification_cont').css({
                               'opacity': '1.0' 
                            });
                            $('#footer_notification_cont > p').addClass('nom_cat_' + nom_cat + '_text');
                            first_unread = false;
                        }
                    }
                }
                else if (data[i].notification_type == 'new_follow'){
                    if (!data[i].read){
                        if (first_unread){
                            $('#footer_notification_cont').css({
                               'opacity': '1.0' 
                            });
                            $('#footer_notification_cont > p').addClass('nom_cat_' + nom_cat + '_text');
                            first_unread = false;
                        }
                    }
                }
                else{
                    color_class = '';
                }

                now = new Date();
                time = new Date(data[i].create_time * 1000);
                now -= time;
                now /= 1000
                time_str = secondsToHms(parseInt(now));
                
                var photo_html = '';
                if ( data[i].photo){
                    photo_html = '<img src="' + data[i].photo.crop_small + '"/>';
                }
                
                if (data[i].notification_type == 'new_nom'){
                    notification_html +='<div class="notification_popup_cont nom_cat_' + nom_cat + '" name="' + nom_cat + '" value="' + data[i].nomination + '" read="' + data[i].read + '" id="notification_' + data[i].notification_id + '" time="' + data[i].create_time +'" onclick="void(0)">' +
                                            photo_html +
                                            '<div class="notification_text_cont white_back ' + color_class + '">' +
                                                '<p class="strong">' + source_name + '</p><span> nominated your photo.</span>' +
                                                '<p class="time">' + time_str + '</p>' +
                                                '<div class="clear"></div>' +
                                            '</div>' +
                                            '<div class="kill_notification close_img ' + close_size + '" value="' + data[i].notification_id + '" style="display:none;"></div>' +
                                        '</div>';
                }
                else if (data[i].notification_type == 'new_comment'){
                    notification_html +='<div class="notification_popup_cont nom_cat_' + nom_cat + '" name="' + nom_cat + '" value="' + data[i].nomination + '" read="' + data[i].read + '" id="notification_' + data[i].notification_id + '" time="' + data[i].create_time +'" onclick="void(0)">' +
                                            // '<div class="new_comment_icon notification_icon"></div>' +
                                            photo_html +
                                            '<div class="notification_text_cont white_back ' + color_class + '">' +
                                                '<p class="strong">' + source_name + '</p><span> commented on ' + dest_name + ' photo.</span>' + 
                                                '<p class="time">' + time_str + '</p>' +
                                                '<div class="clear"></div>' +
                                            '</div>' +
                                            '<div class="kill_notification close_img ' + close_size + '" value="' + data[i].notification_id + '" style="display:none;"/></div>' +
                                        '</div>';
                }
                else if (data[i].notification_type == 'tagged_nom'){
                    notification_html +='<div class="notification_popup_cont nom_cat_' + nom_cat + '" name="' + nom_cat + '" value="' + data[i].nomination + '" read="' + data[i].read + '" id="notification_' + data[i].notification_id + '" time="' + data[i].create_time +'" onclick="void(0)">' +
                                            // '<div class="tagged_nom_icon notification_icon"></div>'+
                                            photo_html +
                                            '<div class="notification_text_cont white_back ' + color_class + '">' +
                                                '<p class="strong">' + source_name + '</p><span> tagged you in a nomination.</span>' +
                                                '<p class="time">' + time_str + '</p>' +
                                                '<div class="clear"></div>' +
                                            '</div>' +
                                            '<div class="kill_notification close_img ' + close_size + '" value="' + data[i].notification_id + '" style="display:none;"></div>' +
                                        '</div>';
                }
                else if (data[i].notification_type == 'nom_won'){
                    notification_html +='<div class="notification_popup_cont nom_cat_' + nom_cat + '" name="' + nom_cat + '" value="' + data[i].nomination + '" read="' + data[i].read + '" id="notification_' + data[i].notification_id + '" won="true" time="' + data[i].create_time +'" onclick="void(0)">' +
                                            // '<div class="nom_won_icon notification_icon"></div>'+
                                            photo_html +
                                            '<div class="notification_text_cont white_back ' + color_class + '">' +
                                                '<p class="strong">' + dest_name + '</p><span> photo won the </span><p class="strong">' + data[i].nomination_category + '</p><span> trophy!</span>' +
                                                '<p class="time">' + time_str + '</p>' +
                                                '<div class="clear"></div>' +
                                            '</div>' +
                                            '<div class="kill_notification close_img ' + close_size + '" value="' + data[i].notification_id + '" style="display:none;"/></div>' +
                                        '</div>';
                    // if (data[i].destination_id == me.id && data[i].read == false){
                    //     my_winnings.push({'fb_user': data[i].source_id, 'cat': data[i].nomination_category, 'nom_id': data[i].nomination, 'notification_id': data[i].notification_id});
                    //     // render_publish_story(data[i].source_id, data[i].nomination_category, 'won');
                    // }
                }
                else if (data[i].notification_type == 'new_follow'){
                    if (!data[i].read){
                        color_class = 'color_transition new_follow';
                    }
                    if (data[i].pending){
                        notification_html +='<div class="notification_popup_cont new_follow" value="' + data[i].source_username + '" read="' + data[i].read + '" id="notification_' + data[i].notification_id + '" time="' + data[i].create_time +'" onclick="void(0)">' +
                                                '<div class="new_follow_icon notification_icon"></div>'+
                                                '<div class="notification_text_cont white_back ' + color_class + '">' +
                                                    '<div class="notification_pending_cont" value="' + data[i].notification_id + '">' +
                                                        '<span class="sick small notification_deny" value="deny">Deny</span>'+
                                                        '<span class="sick small notification_accept" value="accept">Accept</span>'+
                                                    '</div>' +
                                                    '<p class="strong">' + source_name + '</p><span> is now following you.</span>' +
                                                    '<p class="time">' + time_str + '</p>' +
                                                    '<div class="clear"></div>' +
                                                '</div>' +
                                                '<div class="kill_notification close_img ' + close_size + '" value="' + data[i].notification_id + '" style="display:none;"/></div>' +
                                            '</div>';
                    }
                    else{
                        notification_html +='<div class="notification_popup_cont new_follow" value="' + data[i].source_username + '" read="' + data[i].read + '" id="notification_' + data[i].notification_id + '" time="' + data[i].create_time +'" onclick="void(0)">' +
                                                '<div class="new_follow_icon notification_icon"></div>'+
                                                '<div class="notification_text_cont white_back ' + color_class + '">' +
                                                    '<p class="strong">' + data[i].source_username + '</p><span> is now following you.</span>' +
                                                    '<p class="time">' + time_str + '</p>' +
                                                    '<div class="clear"></div>' +
                                                '</div>' +
                                                '<div class="kill_notification close_img ' + close_size + '" value="' + data[i].notification_id + '" style="display:none;"/></div>' +
                                            '</div>';
                    }
                }
            }
        }
        
        if (my_winnings && my_winnings.length > 0){
            render_publish_story(my_winnings);
        }
        $('#notification_footer_popup_cont').append(notification_html);
    }
    
    function render_publish_story(data){
        var cat_underscore = '',
            trophy_count_text = 'trophies',
            nom_id = '',
            notification_ids = '',
            trophy_html = '',
            trophy_won_text = '',
            trophy_img_src = '',
            name = '',
            publish_story_html = '';
            
        name = me.name.split(' ')[0];
        nom_id = data[0].nom_id;
        for (var i = 0; i < data.length; i++){
            cat_underscore = data[i].cat.replace(' ', '_').toLowerCase();
            if (i + 1 < data.length){
                notification_ids += data[i].notification_id + ',';
            }
            else{
                notification_ids += data[i].notification_id;
            }
        }
        
        if (data.length == 1){
            trophy_won_text = name + ' won the ' + data[0].cat + ' trophy for their rockin\' photo!';
            trophy_img_src = 'http://portrit.s3.amazonaws.com/img/invite/' + cat_underscore + '.png';
        }
        else{
            //Blank trophy
            trophy_won_text = name + ' won ' + data.length + ' trophies for their rockin\' photos!';
            trophy_img_src = 'http://portrit.s3.amazonaws.com/img/invite/blank.png';
        }
        
        var link = 'http://portrit.com/#!/nom_id=' + data[0].nom_id + '/ref=facebook';
        
        FB.ui({
            method: 'feed',
            name: trophy_won_text,
            link: link,
            picture: trophy_img_src,
            caption: 'Click the trophy to see ' + name + '\'s winning photos.'
        },
        function(response) {
            if (response && response.post_id) {
                if (typeof(_gaq) !== "undefined"){
                    _gaq.push(['_trackEvent', 'Nom Won', 'Shared', '']);
                }
            } else {
                if (typeof(_gaq) !== "undefined"){
                    _gaq.push(['_trackEvent', 'Nom Won', 'Not Shared', '']);
                }
            }
            $.post('/notification_read/', {'notification_ids': notification_ids}, function(){
                
            });
        });
        
        // publish_story_html ='<div id="publish_story_cont">' +
        //                         '<h1>Congratulations!</h1>' +
        //                         '<h2>You have won ' + data.length + ' ' + trophy_count_text + ' since your last visit.</h2>' +
        //                         '<div id="story_cont">' +
        //                             '<img src="https://graph.facebook.com/' + me.id + '/picture?type=square"/>' +
        //                             '<textarea></textarea>' +
        //                         '</div>' +
        //                         '<div id="story_preview">' +
        //                             '<div id="preview_left">' +
        //                                 trophy_html +
        //                                 '<div id="preview_left_bottom">' +
        //                                     '<img src="http://portrit.s3.amazonaws.com/img/favicon.png"/>' +
        //                                     '<span>via Portrit</span>' +
        //                                     '<div class="clear"></div>' +
        //                                 '</div>' +
        //                             '</div>' +
        //                             '<div id="preview_right">' +
        //                                 '<a id="trophy_won_nom_link">' + name + ', ' + trophy_won_text + '</a>' +
        //                                 '<span id="trophy_won_nom_caption">Click the trophy to see ' + name + '\'s winning photos.</span>' +
        //                                 '<p id="trophy_won_nom_desc"></p>' +
        //                             '</div>' +
        //                             '<div class="clear"></div>' +
        //                         '</div>' +
        //                     '</div>' +
        //                     '<div id="publish_controls">' + 
        //                         '<span class="sick large" value="' + nom_id + '" name="' + notification_ids + '" id="skip_publish">Skip & View</span>' +
        //                         '<span class="sick large" value="' + nom_id + '" name="' + notification_ids + '" id="publish_story">Share & View</span>' +
        //                         '<div class="clear"></div>' +
        //                     '</div>';;
        // $('#context_overlay_cont').addClass('publish_story_overlay');
        // $('#context_overlay_cont > div').append(publish_story_html);
        // show_context_overlay(true);
        
        // $('#publish_story').bind('click', function(){
        //     var nom_ids = $(this).attr('value');
        //     
        //     var trophy_img_src = '';
        //     if (data.length == 1){
        //         trophy_img_src = 'http://portrit.s3.amazonaws.com/img/invite/' + cat_underscore + '.png';
        //     }
        //     else{
        //         trophy_img_src = 'http://portrit.s3.amazonaws.com/img/invite/blank.png';
        //     }
        //     var link = 'http://portrit.com/#!/nom_id=' + data[0].nom_id + '/ref=facebook';
        //     var name = $('#trophy_won_nom_link').text();
        //     var caption = $('#trophy_won_nom_caption').text();
        //     var description = $('#story_cont textarea').val();
        //     
        //     $.post('https://graph.facebook.com/' + me.id + '/feed', {'access_token': fb_session.access_token, 'picture': trophy_img_src, 'link': link, 'name': name, 'caption': caption, 'description': description}, function(response){
        //         var test = response;
        //     });
        //     
        //     close_context_overlay();
        //     
        //     $('#story_cont textarea').unbind('focus');
        //     $('#story_cont textarea').unbind('blur');
        //     $('#story_cont textarea').unbind('keyup');
        //     $('#skip_publish').unbind('click');
        //     $('#publish_story').unbind('click');
        //     $('#close_overlay').unbind('click');
        //     
        //     $.post('/notification_read/', {'notification_ids': notification_ids}, function(){
        // 
        //     });
        //     
        //     window.location.href = '/#!/nom_id=' + nom_ids;
        // });
        // 
        // $('#skip_publish').bind('click', function(){
        //     var nom_ids = $(this).attr('value');
        //     var notification_ids = $(this).attr('name');
        //     close_context_overlay();
        //     
        //     $('#story_cont textarea').unbind('focus');
        //     $('#story_cont textarea').unbind('blur');
        //     $('#story_cont textarea').unbind('keyup');
        //     $('#skip_publish').unbind('click');
        //     $('#publish_story').unbind('click');
        //     $('#close_overlay').unbind('click');
        //     
        //     $.post('/notification_read/', {'notification_ids': notification_ids}, function(){
        // 
        //     });
        //     window.location.href = '/#!/nom_id=' + nom_ids + '/won/user=' + me.id;
        // });
        // 
        // $('#close_overlay').bind('click', function(){
        //     var notification_ids = $('#skip_publish').attr('name');
        //     close_context_overlay();
        //     
        //     $('#story_cont textarea').unbind('focus');
        //     $('#story_cont textarea').unbind('blur');
        //     $('#story_cont textarea').unbind('keyup');
        //     $('#skip_publish').unbind('click');
        //     $('#publish_story').unbind('click');
        //     $('#close_overlay').unbind('click');
        //     
        //     $.post('/notification_read/', {'notification_ids': notification_ids}, function(){
        // 
        //     });
        // })
        // 
        // $('#story_cont textarea').bind('focus', function(){
        //     disable_search = true;
        // });
        // 
        // $('#story_cont textarea').bind('blur', function(){
        //     disable_search = false
        // });
        // 
        // $('#story_cont textarea').bind('keyup', function(){
        //     $('#preview_right p').text($(this).val());
        // });
    }
    
    $('.notification_popup_cont').live('click', function(){
        var nom_id = $(this).attr('value');
        var read = $(this).attr('read');
        var won = $(this).attr('won');
        var won_url = '';
        var notification_id = $(this).attr('id').replace('notification_', '');
        
        if (read == 'false' || read == false || read == 0 || read == '0'){
            $(this).attr('read', 'true');
            $.post('/notification_read/', {'notification_id': notification_id}, function(){
                
            });
        }
        if (won){
            won_url = '/won';
        }
        
        if ($(this).hasClass('new_follow')){
            window.location.href = '/#!/' + nom_id + '/';
        }
        else{
            window.location.href = '/#!/nomination/' + nom_id + '/';
        }
    });
    
    $('.notification_popup_cont').live('mouseover mouseout', function(event) {
        var cat_name = $(this).attr('name');
        if (event.type == 'mouseover') {
            $('.notification_text_cont', this).removeClass('white_back').addClass('nom_cat_' + cat_name).removeClass('color_transition');
            $(this).css({
                'color': 'white'
            });
            $(this).find('p').css({
                'color': 'white'
            });
            $(this).find('.kill_notification').show();
        } else {
            $('.notification_text_cont', this).removeClass('nom_cat_' + cat_name).addClass('white_back');
            $(this).css({
                'color': ''
            });
            $(this).find('p').css({
                'color': ''
            });
            $(this).find('.kill_notification').hide();
        }
    });
    
    $('.kill_notification').live('click', function(e){
        var read = $(this).parent().attr('read');
        var notification_id = $(this).attr('value');
        
        // if (read == '0'){
        $.post('/notification_read/', {'notification_id': notification_id, 'kill': true}, function(){
            
        });
        // }
        $(this).parent().remove();
        e.stopPropagation();
        return false;
    });
    
    $('#clear_all_notifications').live('click', function(e){
        var notification_ids = '';
        var read = null;
        $('.notification_popup_cont').each(function(){
            notification_ids += $(this).attr('id').replace('notification_', '') + ',';
        });
        if (notification_ids != ''){
            $.post('/notification_read/', {'notification_ids': notification_ids, 'kill': true}, function(){

            });
        }

        $('.notification_popup_cont').remove();
        e.stopPropagation();
        return false
    });
    
    var footer_notification_shown = false;
    var footer_show_first = true;
    var notification_scroller = null;
    $('#footer_notification_cont').live('click', function(event) {
        if (!footer_notification_shown) {
            title_notification_count = 0;
            update_title_notification_count();
            $(this).css({
                'opacity': '1.0'
            });
            $(this).children().filter('p').attr('class', '');
            $('#footer').css({
                'overflow-y': 'visible'
            });
            if (!mobile){
                $('#notification_footer_popup').fadeIn('fast');
            }
            else{
                $('#notification_footer_popup').show();
            }
            $('#notification_popup').show().css({
                'opacity': '1.0'
            });
            // if (footer_show_first){
            var read_ids = $('.notification_popup_cont[read="false"]');
            if (read_ids.length > 0){
                var read_ids_string = '';
                setTimeout(function(){
                    $(read_ids).each(function(){
                        var cat_name = $(this).attr('read', true).attr('name');
                        read_ids_string += $(this).attr('id').replace('notification_', '') + ',';
                        $(this).removeClass('nom_cat_' + cat_name);
                    });
                    $.post('/notification_read/', {'notification_ids': read_ids_string}, function(){
                    
                    });
                }, 100);
                // setTimeout(function(){
                    // $(read_ids).each(function(){
                    //     var cat_name = $(this).attr('name');
                    //     $(this).removeClass('nom_cat_' + cat_name);//.attr('read', 'true');
                    // });
                    // $('.notification_popup_cont').removeClass('color_transition');
                // }, 3000);
            }
            // }
            
            var now = new Date();
            var diff_time = null;
            var time = null;
            $('.notification_popup_cont').each(function(){
                time = $(this).attr('time');
                // now = new Date();
                time = new Date(time * 1000);
                diff_time = now - time;
                diff_time /= 1000;
                time_str = secondsToHms(parseInt(diff_time));
                $(this).find('.time').text(time_str);
            });
            
            if ($('.notification_popup_cont').length > 0){
                $('#clear_all_notifications').show();
            }
            
            if (mobile){
                notification_scroller = new iScroll('notification_footer_popup_cont');
            }
            
            $('#wrapper').live('click', function(){
                footer_notification_shown = true;
                $('#footer_notification_cont').click();
            });
            
            footer_show_first = false;
            footer_notification_shown = true;
        } else {
            $('#wrapper').die('click');
            $('#clear_all_notifications').hide();
            $('#footer').css({
                'overflow-y': 'hidden'
            });
            $(this).css({
                'opacity': '0.3'
            });
            $('#notification_popup').show().css({
                'opacity': '0.0'
            });
            
            if (mobile){
                if (notification_scroller){
                    notification_scroller.destroy(false);
                }
                $('#notification_footer_popup').hide();
            }
            else{
                $('#notification_footer_popup').fadeOut('fast');
            }
            
            footer_notification_shown = false;
        }
    });
    
    var tut_on = false;
    function render_tut(tut_counts){
        
        function get_color_class(count){
            var color_class = '';
            if (current_count == 0){
                color_class = 'red';
            }
            else if (current_count == 1){
                color_class = 'orange';
            }
            else if (current_count == 2){
                color_class = 'yellow';
            }
            else if (current_count >= 3){
                color_class = 'green';
            }
            return color_class;
        }
        if (tut_counts){
            $('#activate_tut').css('opacity', 1);
            $(document).bind('click', toggle_tut);
            tut_on = true;
            var start_count = 3;
            var current_count = 0;
            var count_class = '';
            var tut_completed_checkmark = '';
            // if (tut_counts.nom_count){
                current_count = start_count - tut_counts.nom_count;
                count_class = get_color_class(current_count);
                if (current_count >= 3){
                    current_count = 3;
                    tut_completed_checkmark = '<div class="tut_completed_checkmark"></div>';
                }
                else{
                    tut_completed_checkmark = '';
                }
                var nom_count_html ='<h3><span class="strong">Nominate</span> 3 friend\'s photos</h3>' +
                                    '<p class="' + count_class + '_back">' + current_count + '/3 Completed</p>' +
                                    tut_completed_checkmark;
                $('#nomination_tut').html(nom_count_html).attr('count', current_count);
            // }

            // if (tut_counts.vote_count){
                current_count = start_count - tut_counts.vote_count;
                count_class = get_color_class(current_count);
                if (current_count >= 3){
                    current_count = 3;
                    tut_completed_checkmark = '<div class="tut_completed_checkmark"></div>';
                }
                else{
                    tut_completed_checkmark = '';
                }
                var vote_count_html =   '<h3><span class="strong">Vote</span> on 3 friend\'s nominations</h3>' +
                                        '<p class="' + count_class + '_back">' + current_count + '/3 Completed</p>' + 
                                        tut_completed_checkmark;
                $('#vote_count_tut').html(vote_count_html).attr('count', current_count);
            // }
            // if (tut_counts.comment_count){
                current_count = start_count - tut_counts.comment_count;
                count_class = get_color_class(current_count);
                if (current_count >= 3){
                    current_count = 3;
                    tut_completed_checkmark = '<div class="tut_completed_checkmark"></div>';
                }
                else{
                    tut_completed_checkmark = '';
                }
                var comment_count_html =    '<h3><span class="strong">Comment</span> on 3 friend\'s nominations</h3>' +
                                            '<p class="' + count_class + '_back">' + current_count + '/3 Completed</p>' +
                                            tut_completed_checkmark;
                $('#comment_count_tut').html(comment_count_html).attr('count', current_count);
            // }
            // var tut_link_left = $('#activate_tut').offset().left - ($('#tutorial_cont').width() / 2) + 8;
            // $('#tutorial_cont').css({
            //     'left': tut_link_left
            // });
            setTimeout(function(){
                $('#tutorial_cont').fadeIn();
            }, 1000);
            $('#tutorial_cont').bind('click', function(){return false;});
            $('#activate_tut').bind('click', toggle_tut);
            $('#skip_tut').bind('click', function(){
                $.post('/skip_tut/', function(data){

                });
                hide_tut();
                $('#activate_tut').remove();
                tut_on = false;
            });
        }
        else{
            $('#tutorial_cont').remove();
        }
    }
    
    function update_tut(method){
        var count = 0;
        var count_class = '';
        var tut_nom_completed = true;
        var tut_vote_completed = true;
        var tut_comment_completed = true;
        
        function get_color_class(count){
            var color_class = '';
            if (count == 0){
                color_class = 'red';
            }
            else if (count == 1){
                color_class = 'orange';
            }
            else if (count == 2){
                color_class = 'yellow';
            }
            else if (count >= 3){
                color_class = 'green';
            }
            return color_class;
        }
        
        if (method == 'nom'){
            var count = parseInt($('#nomination_tut').attr('count'));
            count_class = get_color_class(count + 1);
            count += 1;
            if (count == 3){
                $('#nomination_tut').append('<div class="tut_completed_checkmark"></div>');
            }
            if (count >= 3){
                count = 3;
            }
            $('#nomination_tut > p').text(count + '/3 Completed').removeClass().addClass(count_class + '_back').parent().attr('count', count);
        }
        else if (method == 'vote'){
            var count = parseInt($('#vote_count_tut').attr('count'));
            count_class = get_color_class(count + 1);
            count += 1;
            if (count == 3){
                $('#vote_count_tut').append('<div class="tut_completed_checkmark"></div>');
            }
            if (count >= 3){
                count = 3;
            }
            $('#vote_count_tut > p').text(count + '/3 Completed').removeClass().addClass(count_class + '_back').parent().attr('count', count);
        }
        else if (method == 'comment'){
            var count = parseInt($('#comment_count_tut').attr('count'));
            count_class = get_color_class(count + 1);
            count += 1;
            if (count == 3){
                $('#comment_count_tut').append('<div class="tut_completed_checkmark"></div>');
            }
            if (count >= 3){
                count = 3;
            }
            $('#comment_count_tut > p').text(count + '/3 Completed').removeClass().addClass(count_class + '_back').parent().attr('count', count);
        }
        
        $('#activate_tut').css('opacity', 1);
        
        count = parseInt($('#nomination_tut').attr('count'));
        if (count < 3){
            tut_nom_completed = false;
        }
        
        count = parseInt($('#vote_count_tut').attr('count'));
        if (count < 3){
            tut_vote_completed = false;
        }
        
        count = parseInt($('#comment_count_tut').attr('count'));
        if (count < 3){
            tut_comment_completed = false;
        }
        
        if (tut_nom_completed && tut_vote_completed && tut_comment_completed){
            var tut_completed_html ='<h1>Congratulations!</h1>' +
                                    '<h2>You have just completed the tutorial.</h2>' +
                                    '<div id="tut_completed_middle">' +
                                        '<img src="http://portrit.s3.amazonaws.com/img/tutorial_graphic.png"/>' +
                                        '<div class="tut_check_completed">' +
                                            '<div class="green_checkmark"></div>' +
                                            '<p>You nominated 3 of your friend\'s photos.</p>' +
                                            '<div class="clear"></div>' +
                                        '</div>' +
                                        '<div class="tut_check_completed">' +
                                            '<div class="green_checkmark"></div>' +
                                            '<p>You voted on 3 of your friend\'s nominations.</p>' +
                                            '<div class="clear"></div>' +
                                        '</div>' +
                                        '<div class="tut_check_completed">' +
                                            '<div class="green_checkmark"></div>' +
                                            '<p>You commented on 3 of your friend\'s nominations.</p>' +
                                            '<div class="clear"></div>' +
                                        '</div>' +
                                    '</div>' +
                                    '<h3>You now know how to use Portrit.</h3>' +
                                    '<h3>Go nominate, vote, comment, and have fun!</h3>' +
                                    '<span id="tut_completed_go" class="sick large">Continue</span>';
            
            tut_on = false;
            $('#context_overlay_cont').addClass('tut_completed_overlay');
            $('#context_overlay_cont > div').append(tut_completed_html);
            show_context_overlay(true);
            $('#activate_tut').fadeOut();
            
            $('#tut_completed_go').bind('click', function(){
                $('#tut_completed_go').unbind('click');
                close_context_overlay();
            });
        }
    }
    
    function toggle_tut(){
        if ($('#tutorial_cont').is(':hidden')){
            show_tut();
            $('#activate_tut').css('opacity', 1);
            $(document).bind('click', toggle_tut);
            return false;
        }
        else{
            hide_tut();
            $('#activate_tut').css('opacity', 0.3);
            $(document).unbind('click', toggle_tut);
        }
    }
    
    function show_tut(){
        $('#tutorial_cont').fadeIn();
    }
    
    function hide_tut(){
        $('#tutorial_cont').fadeOut();
    }
    
    function attach_initial_tut_handlers(tut_counts){
        $('#tut_go_cont span').live('click', function(){
            var that = this;
            var username = $('#username').val();
            if ((username != '' || username != 'Create a Username') && $('#username_taken').length == 0 && alphaNumericCheck(username)){
                $(this).text('Saving...');
                var post_wins_to_fb = false;
                if ($('#allow_portrit_album').hasClass('switch_on')){
                    post_wins_to_fb = true;
                    allow_portrit_album = true;
                }
                var email_notifications = false;
                if ($('#allow_notifications').hasClass('switch_on')){
                    email_notifications = true;

                    email_on_follow = true;
                    email_on_nomination = true;
                    email_on_win = true;
                }
                $.post('/api/add_username/', {'username': username, 'access_token': fb_session.access_token, 'post_wins': post_wins_to_fb, 'email_notifications': email_notifications}, function(data){
                    if (data != false){
                        my_username = username;
                        $('#initial_tut_cont').fadeOut(function(){
                            $(this).remove();
                            if (!mobile || tablet){
                                render_tut(tut_counts);
                            }
                            init_view(update_view);
                        });
                        $('#wrapper').animate({
                            'opacity': '1.0'
                        }, 350, function(){
                            $(this).css('min-height', '100%');
                        });

                        $('#tut_go_cont span').die('click');
                        $('#allow_notifications, #allow_portrit_album').die('click');
                        $('#username').unbind('focus');
                        $('#username').unbind('unblur');
                        $('#username').unbind('keyup');
                    }
                    else{
                        $(that).text('Submit');
                    }
                });
            }
        });
        
        $('#allow_notifications, #allow_portrit_album').live('click', function(){
            var checked = false;
            var value = $(this).attr('value');
            if ($(this).hasClass('switch_on')){
                if (value == 'fb_auto_post'){
                    allow_notifications = true;
                }
                else if (value == 'portrit_album'){
                    allow_portrit_album = true
                }
                checked = true;
            }
            else{
                if (value == 'fb_auto_post'){
                    allow_notifications = false;
                }
                else if (value == 'portrit_album'){
                    allow_portrit_album = false
                }
                checked = false;
            }
            $.post('/change_user_permissions/', {'permission': value, 'check': checked}, function(data){
                
            });
        });
        
        $('#username').bind('focus', function(){
            disable_search = true;
            $(this).css('color', '#444');
            if (this.value == this.defaultValue){
                this.value = '';
            }  
            if(this.value != this.defaultValue){  
                this.select();  
            }
        });
        
        $('#username').bind('blur', function(){
            disable_search = false;
            if ($.trim(this.value) == ''){
                $(this).css('color', '#999');
                this.value = (this.defaultValue ? this.defaultValue : '');  
            }
        });
        
        var check_username_timeout = null;
        $('#username').bind('keydown', function(e){
            var value = $(this).val();
            if (value.length > 16 && e.keyCode != 8){
                return false;
            }
            else{
                clearTimeout(check_username_timeout);
                $('.cross').remove();
                $('.check').remove();
                $('#username_load').remove();
                $('#username_taken').remove();

                if (value != ''){
                    if (alphaNumericCheck(value)){
                        if ($('#username_load').length == 0){
                            $('#username').parent().append('<img id="username_load" src="http://portrit.s3.amazonaws.com/img/ajax-loader-light.gif"/>');
                        }
                        check_username_timeout = setTimeout(function(){
                            value = $('#username').val();
                            if (value != '' && alphaNumericCheck(value)){
                                $.post('/api/check_username_availability/', {'username': value}, function(data){
                                    $('#username_load').remove();
                                    if (data == true){
                                        $('#username_aval').remove();
                                        if ($('#username_taken').length == 0){
                                            $('#username').parent().append('<div class="cross" id="username_taken"></div>');
                                            if ($('#username_taken_text').length == 0){
                                                $('#username').parent().append('<p id="username_taken_text">We\'re sorry, but this username is already taken.</p>');
                                            }
                                        }
                                    }
                                    else{
                                        $('#username_taken').remove();
                                        $('#username_taken_text').remove();
                                        if ($('#username_aval').length == 0){
                                            $('#username').parent().append('<div class="check" id="username_aval"></div>');
                                        }
                                    }
                                });
                            }
                            else if (!alphaNumericCheck(value) && value != ''){
                                $('#username_load').remove();
                                $('#username_taken').remove();
                                $('#username_taken_text').remove();
                                $('#username_aval').remove();
                                
                                if ($('#username_taken').length == 0){
                                    $('#username').parent().append('<div class="cross" id="username_taken"></div>');
                                }
                            }
                            else{
                                $('#username_load').remove();
                                $('#username_taken').remove();
                                $('#username_taken_text').remove();
                                $('#username_aval').remove();
                            }
                        }, 500);
                    }
                    else{
                        $('#username_aval').remove();
                        if ($('#username_taken').length == 0){
                            $('#username').parent().append('<div class="cross" id="username_taken"></div>');
                        }
                    }
                }
                else{
                    $('#username_taken').remove();
                    $('#username_taken_text').remove();
                    $('#username_aval').remove();
                }
            }
        });
    }
    
    function render_initial_tutorial(tut_counts){
        $('#wrapper').css({
            'opacity': '0.3'
        });
        var initial_tut_html =  '<div id="initial_tut_cont">' +
                                    '<div id="initial_tut_wrap">' +
                                        '<div id="initial_tut_top_wrap">' +
                                            '<h1>Getting Started!</h1>' +
                                            '<div class="tut_point">' +
                                                '<h2 class="tut_point_num nom_cat_fail">1</h2>' +
                                                '<div>' +
                                                    '<input id="username" value="Create a Username"/>' + 
                                                    '<p style="color: #666; font-size: 14px; margin-left: 5px;">Only alphanumeric characters please</p>' +
                                                    '<div class="clear"></div>' +
                                                '</div>' +
                                            '</div>' +
                                            '<div class="tut_point">' +
                                                '<h2 class="tut_point_num nom_cat_lol">2</h2>' +
                                                '<div>' +
                                                    '<h3>Vote On Your Favorite</h3>' + 
                                                    '<p>It\'s up to you and your friends to decide who earns a trophy. Take a look through all the Hot, WTF, FAIL, etc photos and give your opinion. Love it, vote it up. Hate it, vote it down.</p>' +
                                                '</div>' +
                                                '<div class="clear"></div>' +
                                            '</div>' +
                                            '<div class="tut_point" style="margin-bottom: 30px;">' +
                                                '<h2 class="tut_point_num nom_cat_party_animal">3</h2>' +
                                                '<div>' +
                                                    '<h3>Build Up Your Trophy Room</h3>' + 
                                                    '<p>Got amazing photos? Earn trophies for your hard work. Friends see your winning photos first, so your best photos are always first to be seen. Don\'t sweat not winning, everything starts fresh the next day, so your hilarious LOLcat photo can live again.</p>' +
                                                    '<div class="clear"></div>' +
                                                '</div>' +
                                                '<div class="clear"></div>' +
                                            '</div>' +
                                            '<div id="allow_notifications_cont">' +
                                                '<label for="allow_notifications">Allow Portrit to notify you through email: </label>' +
                                                '<div id="allow_notifications" value="fb_auto_post" class="switch switch_on"></div>' +
                                                '<div class="clear"></div>' +
                                            '</div>' +
                                            '<div id="allow_portrit_album_cont">' +
                                                '<label for="allow_portrit_album">Allow Portrit to post winning trophies back to Facebook: </label>' +
                                                '<div id="allow_portrit_album" value="portrit_album" class="switch switch_on"></div>' +
                                                '<div class="clear"></div>' +
                                            '</div>' +
                                        '</div>' +
                                        '<div id="initial_tut_bottom_wrap">' +
                                            '<div id="tut_go_cont">' +
                                                '<span class="sick large">Submit</span>' +
                                            '</div>' +
                                        '</div>' +
                                    '</div>' +
                                '</div>';
        $('body').append(initial_tut_html);
        if (!mobile || tablet){
            if ($(window).height() < 820){
                $('#wrapper').css('min-height', 820);
            }
        }
        attach_initial_tut_handlers(tut_counts);
    }
    
    var notification_data = null;
    var allow_notifications = true;
    var allow_public_follows = true;
    var allow_portrit_album = false;
    var email_on_follow = false;
    var email_on_nomination = false;
    var email_on_win = false;
    var email = '';
    var server_login_timeout = null;
    var render_perms_context = false;
    var first_visit = false;
    var vote_tooltip_on = false;
    var my_username = '';
    var twitter_access_token = '';
    function login_fb_user(){
        $('#cont').prepend('<div class="loading"><h1>Portrit Loading...</h1><div id="loader"><img src="http://portrit.s3.amazonaws.com/img/album-loader-dark.gif"/></div></div>');
        setTimeout(render_server_dead, 15000);
        $.post('/login_fb_user/', function(data){
            $('.loading').remove();
            clearTimeout(server_login_timeout);
            if (data){
                var tut_counts = null;
                var first = false;
                notification_data = data.notifications;
                tut_counts = data.tut_counts;
                first = data.first;
                first_visit = first;
                vote_tooltip_on = first;
                
                allow_portrit_album = data.allow_winning_fb_album;
                allow_public_follows = data.allow_public_follows;
                
                email_on_follow = data.email_on_follow;
                email_on_nomination = data.email_on_nomination;
                email_on_win = data.email_on_win;
                email = data.email;
                
                twitter_access_token = data.twitter_access_token
                
                my_username = data.username;
                // friends = data.following;
                if (first){
                    $('#right_nav').prepend('<div id="activate_tut"><div id="tutorial_cont" style="display:none;"><div id="tut_arrow"></div><h1>Tutorial</h1><div id="tut_section_wrap"><div class="tut_section" id="nomination_tut"></div><div class="tut_section" id="vote_count_tut"></div><div class="tut_section" id="comment_count_tut"></div></div><a id="skip_tut" class="sick large">Skip</a></div></div>');
                    render_initial_tutorial(tut_counts);
                }
                else{
                    if (tut_counts && (!mobile || tablet)){
                        $('#right_nav').prepend('<div id="activate_tut"><div id="tutorial_cont" style="display:none;"><div id="tut_arrow"></div><h1>Tutorial</h1><div id="tut_section_wrap"><div class="tut_section" id="nomination_tut"></div><div class="tut_section" id="vote_count_tut"></div><div class="tut_section" id="comment_count_tut"></div></div><a id="skip_tut" class="sick large">Skip</a></div></div>');
                        render_tut(tut_counts);
                    }
                    init_view(update_view);
                }
            }
        });
    }
    
    function render_server_dead(){
        $('.loading > h1').after('<div id="server_down" style="display:none;"><h2>We\'re sorry, looks like our servers are taking a much needed coffee break.</h2><h3>Please give us another chance and refresh your browser.</h3></div>');
        $('.loading > h1').hide();
        $('#server_down').fadeIn();
    }
    
    function load_friend_dict(data){
        for (var i = 0; i < data.length; i++){
            friends[data[i].id] = data[i];
            friends[data[i].id]['hidden'] = false;
        }
    }
    
    function load_friend_array(friends){
        for (var key in friends){
            friend_array.push({
                'name': friends[key].name,
                'id': key
            });
        }
    }
    
    function init_view(func_ptr){
        // $('#cont').append('<img id="login_loader" src="http://portrit.s3.amazonaws.com/img/album-loader-dark.gif"/>');
        if (window.sessionStorage !== undefined){
            me = sessionStorage.getItem('me');
        }
        if (me === null){
            FB.api('/me', function(response) {
                if (window.sessionStorage !== undefined){
                    sessionStorage.setItem('me', JSON.stringify(response));
                }
                me = response;
                me.username = my_username;

                wait_for_message();
                load_user_data();
                func_ptr();
            });
        }
        else{
            me = JSON.parse(me);
            me.username = my_username;
            wait_for_message();
            load_user_data();
            func_ptr();
        }
    }
    
    function show_search_view(){
        search_active = true

        $('#search').show();
        $('#wrapper').css({
            'opacity': '0.3'
        });
        $('#query').focus();
        
        if (typeof(_gaq) !== "undefined"){
            _gaq.push(['_trackEvent', 'Search', 'Shown', '']);
        }
        
        // $('#query').bind('blur', hide_search_view);
        $(document).bind('click', hide_search_view);
    }
    
    function hide_search_view(){
        $(document).unbind('click', hide_search_view);
        
        $('#results').html('');

        $('#search').hide();
        $('#wrapper').css({
            'opacity': '1.0'
        });
        
        $('#query').val('');
        query_cache = { };
        prev_query = '';
        search_active = false;
    }
    
    function load_user_data(){
        $('#profile_pic').html('<a href="/#!/' + me.username + '"><img src="https://graph.facebook.com/' + me.id + '/picture?type=square"/></a>');
        $('#profile_pic').after('<img src="http://static.ak.fbcdn.net/images/connect_favicon.png"/>');
	}
	
	function render_public_header(){
	    var test = selected_user;
	    var public_header_html ='<div id="public_logo_wrap">' +
                                    '<a href="/">' +
                                        '<img src="http://portrit.s3.amazonaws.com/img/logo_blank.png"/>' +
                                    '</a>' +
                                '</div>' +
                                '<div id="public_tagline_cont">' +
                                    '<div class="left_triangle"></div>' +
                                    '<p id="tagline_main">Snap, nominate, vote, and earn wherever you go with the Portrit iPhone app.</p>' +
                                '</div>' +
                                '<div id="search_control" class="grey"></div>' +
                                '<div id="public_login_cont">' +
                                    '<div id="public_login_wrap">' +
                                        '<a id="login" class="fb_button fb_button_large"><span class="fb_button_text">Login with Facebook</span></a>' +
                                        '<p>Simply click Connect with Facebook.</p>' +
                                    '</div>' +
                                '</div>' +
                                '<div class="clear"></div>';
	    
	    $('#public_header').html(public_header_html);
	    $('#header').show().addClass('public');
	    
	    $('#cont').append('<p class="public_tooltip"></p>');
	}
	
	function attach_public_handlers(){
	    $('#login').bind('click', login_user);
	    
	    $('#add_new_comment, .flag_photo, #nominate').live('mouseover mouseout', function(event) {
	        var that = this;
            if (event.type == 'mouseover') {
                show_public_tooltip(that);
            } else {
                hide_public_tooltip();
            }
        });
	}
	
	function init_public_view(){
	    public_view = true;
	    global_hash_tag = window.location.hash;
        fb_session = null;
        
        $('#login_cont').remove();
        $('#wrapper').css({'background': 'none'});
        
        $('#login').unbind('click');
        $('.footer_hover').unbind('click');
        
        $('#header').show();
        $('#login_loader').show();
    
        //Set interval handler for url hash changes
        watch_hashtag_interval = setInterval(watch_hashtag, 75);
        
        render_public_header();
        attach_public_handlers();
	    
	    update_view();
	}
    
    function stream_nav_click(){
        if (stream_view != 'stream'){
            if (typeof(_gaq) !== "undefined"){
                _gaq.push(['_trackEvent', 'Recent Noms', 'Shown', '']);
            }
            window.location.href = '/#!/'
        }
    }
    
    function community_nav_click(){
        if (stream_view != 'community'){
            if (typeof(_gaq) !== "undefined"){
                _gaq.push(['_trackEvent', 'Recent Winners', 'Shown', '']);
            }
            window.location.href = '/#!/community/';
        }
    }
    
    function profile_nav_click(){
        if (stream_view != 'profile'){
            if (typeof(_gaq) !== "undefined"){
                _gaq.push(['_trackEvent', 'Profile', 'Shown', '']);
            }
            if (stream_view == 'profile_user'){
                $('#profile_cont_wrap').html('');
            }
            window.location.href = '/#!/' + me.username + '/';
        }
    }
    
    var added_swipe_once = false;
    //All friends view
    function main_view(){
        view_active = 'main';
        selected_user = '';
        selected_album_id = '';
        photo_comment_cache = { };
        var friend_view_selected = '';
        var wall_view_selected = '';
        var profile_view_selected = '';
        var photo_upload_html = '';

        $('#user_profile_cont').remove();
        $('.friend').remove();
        if (!mobile){
            photo_upload_html = '<li id="show_upload"><h1>Post Photo</h1></li>';
        }
        if ($('#wall_cont #profile_wrap').length == 0){
            $('#wall_cont').hide();
            var wall_html = '<div id="profile_wrap">' +
                                '<ul>' +
                                    '<li>' +
                                        '<h1 id="active_stream_view" class="stream_nav selected" name="stream">Stream</h1>' +
                                    '</li>' +
                                    '<li>' +
                                        '<h1 id="activate_community" class="stream_nav" name="community">Community</h1>' +
                                    '</li>' +
                                    '<li>' +
                                        '<h1 id="activate_profile" class="stream_nav" name="profile">Profile</h1>' +
                                    '</li>' +
                                    photo_upload_html +
                                    '<div class="clear"></div>' +
                                '</ul>' +
                                '<div class="clear"></div>' +
                                '<div id="profile_cont_wrap">' +
                                    '' +
                                '</div>' + 
                            '</div>';
            $('#wall_cont').append(wall_html);
            $('#wall_cont').show();
        }
        init_stream_view();
        
        $('#wall_cont').show();
        $('#friend_cont').show();
    }

    function create_nom_cache(noms){
        for (var i = 0; i < noms.length; i++){
            nom_cache[noms[i].id] = noms[i];
        }
    }
    
    var nom_cache = { };
    function nom_detail_view(data, state){
        view_active = 'nom_detail';
        
        var nom = null;
        var nom_cat = '';
        var nom_cat_under = '';
        var nom_in_cat = null;
        var nom_stream_html = '';
        var nom_main_cont_html = '';
        var nom_bottom_cont_html = '';
        var comment_cont_html = '';
        var voted_cont_html = '';
        var nom_winning_text = '';
        var selected_nom_photo = null;
        var trophy_size = '';
        var vote_class = '';
        var vote_tooltip_text = 'Already voted';
        var title = '';
        var tagged_user_html = '';
        var won = false;
        var action_botton_class = '';
            
        create_nom_cache(data);
            
        nom = nom_cache[selected_nom];
        if (!nom){
            nom = data[0];
        }
        nom_cat = nom.nomination_category,
        nom_cat_under = get_cat_under(nom_cat);
            
        if (state == 'stream_active'){
            title = '<h1 class="title" state="' + state + '" cat="' + nom_cat + '">Active <span class="nom_cat_' + nom_cat_under + '_text">' + nom_cat + '</span> Photos</h1>';
        }
        else if (state == 'stream_winners'){
            won = true;
            vote_class = "won";
            vote_tooltip_text = 'Already won';
            
            title = '<h1 class="title" state="' + state + '" cat="' + nom_cat + '">Winning Photos</h1>';
        }
        else if (state == 'community_active'){
            title = '<h1 class="title" state="' + state + '" cat="' + nom_cat + '">Community <span class="nom_cat_' + nom_cat_under + '_text">' + nom_cat + '</span> Photos</h1>';
        }
        else if (state == 'community_top'){
            title = '<h1 class="title" state="' + state + '" cat="' + nom_cat + '">Top Community <span class="nom_cat_' + nom_cat_under + '_text">' + nom_cat + '</span> Photos</h1>';
        }
        else if (state == 'profile_trophies'){
            won = true;
            vote_class = "won";
            vote_tooltip_text = 'Already won';
            
            title = '<h1 class="title" state="' + state + '" cat="' + nom_cat + '"><a href="/#!/' + nom.nominatee_username + '/">' + nom.nominatee_username + '\'s</a> Winning Photos</h1>';
            
        }
        else if (state == 'profile_active'){
            title = '<h1 class="title" state="' + state + '" cat="' + nom_cat + '"><a href="/#!/' + nom.nominatee_username + '/">' + nom.nominatee_username + '\'s</a> Active Nominations</h1>';
        }
        else{
            title = '<h1 class="title" state="' + state + '" cat="' + nom_cat + '"><a href="/#!/' + nom.nominatee_username + '/">' + nom.nominatee_username + '\'s</a> Photo</h1>';
            
        }
        
        if (data.length > 1){
            nom_stream_html = '<div id="nom_cat_stream"><div class="prev_photo"><div class="prev_photo_img"></div></div><div class="next_photo"><div class="next_photo_img"></div></div>';
            for (var i = 0; i < data.length; i++){
                nom_in_cat = data[i];
                if (nom_in_cat.id == nom.id){
                    selected_nom_photo = 'nom_photo_' + nom_in_cat.id;
                    nom_stream_html +=  '<div id="nom_photo_' + nom_in_cat.id + '" class="nom_photo_thumbnail" style="opacity: 1.0;" name="selected">' +
                                            '<img src="' + nom_in_cat.photo.crop_small + '"/>' +
                                            // '<p class="nom_cat_' + nom_in_cat.nomination_category.replace(' ', '_').toLowerCase() + '">' + nom_in_cat.vote_count + '</p>' +
                                        '</div>';
                }
                else{
                    nom_stream_html +=  '<div id="nom_photo_' + nom_in_cat.id + '" class="nom_photo_thumbnail" style="opacity: 0.6;">' +
                                            '<img src="' + nom_in_cat.photo.crop_small + '"/>' +
                                            // '<p class="nom_cat_' + nom_in_cat.nomination_category.replace(' ', '_').toLowerCase() + '">' + nom_in_cat.vote_count + '</p>' +
                                        '</div>';            
                }        
            }
            nom_stream_html += '</div>';
        }
        else{
            nom_stream_html = '';
        }
        
        var votes_cont_class = 'active';
        var vote_cont_html ='<div id="vote_cont_right">' +
                                '<p class="tooltip"></p>' +
                                '<div class="vote_arrow"></div>' +
                                '<span class="vote vote_up ' + vote_class + '" value="' + nom.id + '" name="' + vote_tooltip_text + '"></span>' +
                                '<span class="vote vote_down ' + vote_class + '" value="' + nom.id + '" name="' + vote_tooltip_text + '"></span>' +
                            '</div>';
        
        if (nom.won){
            nom_winning_text = 'Won';
            votes_cont_class = 'won';
            vote_cont_html = '';
        }
        else if (!nom.active){
            nom_winning_text = 'Lost';
        }
        else{
            nom_winning_text = 'Nominated for';
        }
        
        var nominator_caption = '';
        if (nom.caption){
            nominator_caption = 'Caption: ' + nom.caption.replace(/(\r\n|\n|\r)/gm,"");;
        }
        else{
            nominator_caption = 'No caption provided';
        }
        
        if (nom.tagged_users.length > 0){
            tagged_user_html = '<div class="tagged_users" nom="' + nom.id + '"><span>' + nom.tagged_users.length + ' Tagged</span><div class="tag"></div></div>'; 
        }
        
        if (public_view){
            action_botton_class = 'off';
        }
        
        trophy_size = 'large';
        
        $('#nom_detail_cont .title').remove();
        $('#nom_detail_cont').prepend(title);
        
        $('#main_nom_cont').attr('value', nom.id);
        $('#main_nom_photo').attr('src', nom.photo.source);
        
        $('#nominator_overlay_cont').html(//'<a href="/#!/' + nom.nominator_username + '/"><img class="user_img" src="https://graph.facebook.com/' + nom.nominator + '/picture?type=square"/></a>' +
                                            // '<h2>Nominated by <span class="strong"><a href="/#!/' + nom.nominator_username + '/">' + nom.nominator_username + '</a></span></h2>' +
                                            '<p>' + nominator_caption + '</p>' +
                                            tagged_user_html);
        
        $('#nominatee_cont').html('<a href="/#!/' + nom.nominatee_username + '/">' +
                                    '<img class="user_img" src="https://graph.facebook.com/' + nom.nominatee + '/picture?type=square"/>' +
                                '</a>' +
                                '<div id="nomination_text_cont">' +
                                    '<a href="/#!/' + nom.nominatee_username + '/">' +
                                        '<span class="strong">' + nom.nominatee_username + '</span>' +
                                    '</a>' + 
                                    '<p>' + nom_winning_text + '</p>' +
                                    '<h3>' + nom_cat + '</h3>' +
                                '</div>');
                                
        $('#trophy_cont').html('<div id="nom_trophy_icon" class="trophy_img ' + trophy_size + ' ' + nom_cat_under + '"></div>');
        $('#vote_cont').html('<div id="vote_cont_left" class="' + votes_cont_class + ' nom_cat_' + nom_cat_under + '">' +
                                '<h3>Votes</h3>' +
                                '<h2 id="nom_vote_count">' + nom.vote_count + '</h2>' +
                            '</div>' +
                            vote_cont_html + 
                            '<div class="clear"></div>');
                            
        
                   
        nom_bottom_cont_html =  '<div id="main_nom_bottom_cont">' +
                                    '<div id="nom_comments_cont">' +
                                        '<div id="comment_heading_cont">' +
                                            '<p class="tooltip"></p>' +
                                            '<span class="sick large ' + action_botton_class + '" id="add_new_comment">Comment</span>' +
                                            '<div class="flag flag_photo ' + action_botton_class + '" nom_id="' + nom.id + '"></div>' +
                                            '<div class="clear"></div>' +
                                        '</div>' +
                                        '<div id="new_comment_cont">' +
                                            '<div class="comment_top_head">' +
                                                '<span class="sick large post_new_comment" value="' + nom.id + '">Post</span>' +
                                                '<span class="sick large cancel_new_comment">Close</span>' +
                                            '</div>' +
                                            '<textarea class="comment_body"></textarea>' +
                                        '</div>' +
                                    '</div>' +
                                    '<div id="nom_votes_cont">' +
                                        '<h2 id="voted_heading">Voted</h2>' +
                                        '<div id="nom_votes_wrap" class="voted_cont">' +
                                            '<p class="tooltip"></p>' +
                                        '</div>'
                                    '</div>' +
                                    '<div class="clear"></div>' +
                                '</div>';
        
        var html = nom_stream_html + nom_bottom_cont_html;
        $('#nom_detail_cont').append(html);
        
        slide_images = $('.nom_photo_thumbnail');
        
        var img_widths = [ ];
        var slide_center = 0;
        var slide_img_width = 0;
        var center_found = false;
        var mid_screen = $('#nom_cat_stream').width() / 2;
        $(slide_images).each(function(j, selected){
            slide_img_width = 100;
            if ($(this).attr('name') === 'selected'){
                slide_center += (slide_img_width / 2);
                center_found = true;
            }
            else if (center_found === false){
                slide_center += slide_img_width + 20;
            }

            img_widths.push(slide_img_width + 20);
        });

        var previous_x = 0;
        var margin_offset = mid_screen - slide_center;
        
        $(slide_images).each(function(i, selected){
                $(this).css({
                    'left': previous_x + margin_offset,
                    'top': 0
                });
            previous_x += img_widths[i];
        });
        
        if (first_visit && vote_tooltip_on){
            $('#vote_cont').append('<p id="vote_tooltip">Click the arrows to cast your <span class="strong">vote<span>.<span class="vote_tooltip_arrow"></span></p>');
        }
        
        get_nom_comments(nom.id);
        render_nom_votes(nom, nom.votes);
    }
    
    var get_comment_timeout = null;
    function get_nom_comments(id){
        if ($('#loader').length == 0){
            append_load($('#nom_comments_cont'), 'light');
        }
        
        clearTimeout(get_comment_timeout);
        get_comment_timeout = setTimeout(function(){
            $.getJSON('/api/get_comments/', {'nom_id': id}, function(data){
                remove_load();
                render_nom_comments(data);
            });
        }, 300);
    }
    
    function render_nom_votes(nom, votes){
        var voted_cont_html = '';
        var user_voted = false;
        for (var i = 0; i < votes.length; i++){
            voted_cont_html +=  '<a href="/#!/' + votes[i].vote_username + '/" id="voted_' + votes[i].vote_username + '" name="' + votes[i].vote_username + '">' +
                                    '<img src="https://graph.facebook.com/' + votes[i].vote_user + '/picture?type=square"/>' +
                                '</a>';
            if (me && votes[i].vote_user == me.id){
                user_voted = true
            }
        }
        if (public_view){
            $('.vote').addClass('won').attr('name', 'Login to vote');
        }
        else if (nom.won){
            $('.vote').addClass('won').attr('name', 'Already won');
        }
        else if (user_voted){
            $('.vote').addClass('won').attr('name', 'Already voted');
        }
        else{
            $('.vote').removeClass('won');
        }
        $('#nom_votes_wrap').append(voted_cont_html);
    }
    
    function render_nom_comments(comments){
        var name = '';
        var comment_cont_html = '';
        var time = null;
        var now = null;
        var source_name = '';
            
        if (comments.length > 0){
            $('#comments_empty').remove();
            for (var i = 0; i < comments.length; i++){
                now = new Date();
                time = new Date(comments[i].create_datetime * 1000);
                now -= time;
                now /= 1000
                var time_str = secondsToHms(parseInt(now));
                
                source_name = comments[i].owner_username;
                if (me && source_name == me.username){
                    source_name = 'You';
                }

                comment_cont_html +='<div class="comment">' +
                                        '<p class="comment_time" value="' + comments[i].create_datetime + '">' + time_str + '</p>' +
                                        '<a href="/#!/' + comments[i].owner_username + '/">' +
                                            '<img class="user_photo" src="https://graph.facebook.com/' + comments[i].owner_id + '/picture?type=square"/>' +
                                        '</a>' +
                                        '<a href="/#!/' + comments[i].owner_username + '/" class="post_username from_username">' + source_name +'</a>' +
                                        '<p>' + comments[i].comment + '</p>' +
                                    '</div>';
            }
        }
        else if ($('#comments_empty').length == 0){
            comment_cont_html = '<div id="comments_empty">' +
                                    '<h3>No Comments</h2>' +
                                '</div>';
        }
        $('#nom_comments_cont').append(comment_cont_html);
    }
    
    function update_vote_count(data){
        if (data){
            var nom_id = data.nom_id;
            var votes_html = '';
            if (view_active == 'stream_active'){
                $('.nom_vote_' + nom_id).find('h2').text('Votes: ' + data.vote_count);
            }
            else if (view_active == 'nom_detail'){
                if ($('#main_nom_cont').attr('value') == nom_id){
                    $('#nom_vote_count').text(data.vote_count);
                    votes_html =   '<a href="/#!/=' + data.vote_username + '/" id="voted_' + data.vote_user + '" name="' + data.vote_username + '">' +
                                        '<img src="https://graph.facebook.com/' + data.vote_user + '/picture?type=square"/>' +
                                    '</a>';
                    $('#nom_votes_wrap').append(votes_html);
                }
            }
        }
    }
    
    function append_load(cont, loader){
        if ($('#loader').length == 0){
            if (loader == 'light'){
                $(cont).append('<div id="loader"><img src="http://portrit.s3.amazonaws.com/img/ajax-loader-light.gif"/></div>');
            }
            else{
                $(cont).append('<div id="loader"><img src="http://portrit.s3.amazonaws.com/img/album-loader-dark.gif"/></div>');
            }   
        }
    }
    
    function remove_load(fade){
        if (typeof(fade) !== "undefined"){
            $('#loader').animate({
                'opacity': 0
            }, {duration: 200, queue: false, complete: function(){
                $(this).remove();
            }});
        }
        else{
            $('#loader').remove();
        }
    }
    
    function render_photo_list(data, append){
        var photo_list_html = '';
        var community_top = 15;
        var blanks = community_top - data.length;
        
        for (var i = 0; i < data.length; i++){
            photo_list_html =  '<div class="community_photo_cont" pid="' + data[i].photo.id + '" name="' + data[i].username + '">' +
                                            '<img src="' + data[i].photo.crop + '" owner="' + data[i].username + '" pid="' + data[i].photo.id +'"/>' +
                                    '</div>';
            $('#recent_left_cont').append(photo_list_html);
        }
        $('#recent_left_cont').append('<p class="tooltip"></p>');
        
        // if (typeof(append) == 'undefined'){
        //     for (var i = 0; i < blanks; i++){
        //         photo_list_html =  '<div class="community_photo_cont empty">' +
        //                                 '</div>';
        //         $('#recent_left_cont').append(photo_list_html);
        //     }
        // }
    }
    
    function init_community_photos(){
        $('#recent_left_cont').html('');
        append_load($('#recent_left_cont'), 'light');
        $.getJSON('/api/get_community_photos/', function(data){
            remove_load();
            render_photo_list(data);
        });
    }
    
    function get_more_community_photos(pid){
        var access_token = '';
        if (fb_session){
            access_token = fb_session.access_token;
        }
        
        scroll_loading = true;
        append_load($('#recent_left_cont'), 'light');
        $.getJSON('/api/get_community_photos/', {'pid': pid, 'dir': 'old', 'access_token': access_token}, function(data){
            scroll_loading = false;
            remove_load();
            render_photo_list(data, true);
        });
    }
    
    function init_community_active(){
        $('#recent_left_cont').html('');
        append_load($('#recent_left_cont'), 'light');
        $.getJSON('/api/get_community_nominations/', function(data){
            remove_load();
            if (data.length > 0){
                render_active_overview_stream(data, $('#recent_left_cont'));
            }
            else{
                empty_html ='<div id="stream_empty">' +
                                '<h1>There are no <span class="strong">Community Nominations</span></h1>' +
                                '<ul>' +
                                    '<li>' +
                                        '<h3>You can solve this by completing one of the following actions:</h3>' +
                                    '</li>' +
                                    '<li>' +
                                        '<p>Nominate one of your photos.</p>' +
                                    '</li>' +
                                    '<li>' +
                                        '<p>Nominate your friend\'s photos.</p>' +
                                    '</li>' +
                                    '<li>' +
                                        '<p>Nominate photos from the community.</p>' +
                                    '</li>' +
                                '</ul>' +
                                '<div class="clear"></div>' +
                            '</div>';

                $('#recent_left_cont').append(empty_html);
            }
        });
    }
    
    function get_more_community_active(id){
        scroll_loading = true;
        append_load($('#recent_left_cont'), 'light');
        $.getJSON('/api/get_community_nominations/', {'id': id, 'dir': 'old'}, function(data){
            scroll_loading = false;
            remove_load();
            render_active_overview_stream(data, $('#recent_left_cont'));
        });
    }
    
    function init_community_top(){
        $('#recent_left_cont').html('');
        append_load($('#recent_left_cont'), 'light');
        $.getJSON('/api/get_community_top_stream/', {'page_size': 12}, function(data){
            remove_load();
            if (data.length > 0){
                render_community_top(data, $('#recent_left_cont'));
            }
            else{
                empty_html ='<div id="stream_empty">' +
                                '<h1>There are no <span class="strong">Community Nominations</span></h1>' +
                                '<ul>' +
                                    '<li>' +
                                        '<h3>You can solve this by completing one of the following actions:</h3>' +
                                    '</li>' +
                                    '<li>' +
                                        '<p>Nominate one of your photos.</p>' +
                                    '</li>' +
                                    '<li>' +
                                        '<p>Nominate your friend\'s photos.</p>' +
                                    '</li>' +
                                    '<li>' +
                                        '<p>Nominate photos from the community.</p>' +
                                    '</li>' +
                                '</ul>' +
                                '<div class="clear"></div>' +
                            '</div>';

                $('#recent_left_cont').append(empty_html);
            }
        });
    }
    
    function init_community_top_cat(){
        var url_vars = getUrlVars();
        $('#recent_left_cont').html('');
        append_load($('#recent_left_cont'), 'light');
        $.getJSON('/api/get_community_top_nominations_cat/', {'page_size': 32, 'cat': url_vars[2]}, function(data){
            remove_load();
            render_community_top_cat(data, $('#recent_left_cont'));
        });
    }
    
    function render_promoted_users(data, target){
        var top_user_html = '';
        for (var i = 0; i < data.length; i++){
            top_user_html = '<div class="top_user_cont" value="' + data[i].username + '">' +
                                '<a href="/#!/' + data[i].username + '/">'+ 
                                    '<img src="https://graph.facebook.com/' + data[i].fid + '/picture?type=square"/>' +
                                '</a>' +
                                '<div class="top_user_text_cont">' +
                                    '<a href="/#!/' + data[i].username + '/">'+ 
                                        '<h3>' + data[i].username + '</h3>' +
                                    '</a>' +
                                    '<p>Focus: <span class="strong">' + data[i].top_nom_cat + '</span></p>' +
                                '</div>' +
                                '<div class="clear"></div>' +
                            '</div>';
            
            $(target).append(top_user_html);
        }
    }
    
    function get_suggested_users(method, target){
        if ($('.top_user_cont').length == 0){
            if (method == 'top'){
                $.getJSON('/api/get_top_users/', function(data){
                    render_promoted_users(data, target);
                });
            }
            else if (method == 'interesting'){
                $.getJSON('/api/get_interesting_users/', function(data){
                    render_promoted_users(data, target);
                });
            }
        }
    }
    
    function init_community_view(view_to_activate){
        if ($('#community').length == 0){
            $('.stream_nav').removeClass('selected');
            $('#activate_community').addClass('selected');
            stream_view = 'community';
            
            if (!public_view){
                var community_html ='<div id="community">' +
                                        '<div id="community_header">' +
                                            '<div class="stream_nav_cont">' +
                                                '<h1>Community</h1>' +
                                                '<ul>' +
                                                    '<li>' +
                                                        '<h2 id="community_top" class="sub_stream_nav" name="community_top">Top</h2>' +
                                                    '</li>' +
                                                    '<li>' +
                                                        '<h2 id="community_active" class="sub_stream_nav" name="community_active">Active</h2>' +
                                                    '</li>' +
                                                    '<li>' +
                                                        '<h2 id="community_photos" class="sub_stream_nav" name="community_photos">Photos</h2>' +
                                                    '</li>' +
                                                    '<div class="clear"></div>' +
                                                '</ul>' +
                                            '</div>' +
                                            '<h2>Suggested People to Follow<h2>' +
                                        '</div>' +
                                        '<div id="community_cont">' +
                                            '<div id="recent_left_cont">' +
                                                '' +
                                            '</div>' +
                                            '<div id="community_right_cont">' +
                                                '' +
                                            '</div>' +
                                            '<div class="clear"></div>' +
                                        '</div>' +
                                    '</div>';
            }
            else{
                if ($('li.public').length == 0){
                    var public_community_header =   '<li class="public" style="margin-left: 285px;">' +
                                                        '<h2 id="community_photos" class="sub_stream_nav" name="community_photos">Photos</h2>' +
                                                    '</li>' +
                                                    '<li class="public">' +
                                                        '<h2 id="community_active" class="sub_stream_nav" name="community_active">Active</h2>' +
                                                    '</li>' +
                                                    '<li class="public">' +
                                                        '<h2 id="community_top" class="sub_stream_nav" name="community_top">Top</h2>' +
                                                    '</li>';

                    $('#profile_wrap ul #countdown_cont').before(public_community_header);
                }
                
                var community_html ='<div id="community">' +
                                        '<div id="community_cont">' +
                                            '<div id="recent_left_cont">' +
                                                '' +
                                            '</div>' +
                                            '<div id="community_right_cont">' +
                                                '<div id="community_public_push"></div>' +
                                                '<div id="app_download_cont">' +
                                                    '<h2>Download our free app.<h2>' +
                                                '</div>' +
                                                '<div id="community_interesting_people">' +
                                                    '<h1>Interesting People</h1>' +
                                                '</div>' +
                                            '</div>' +
                                            '<div class="clear"></div>' +
                                        '</div>' +
                                    '</div>';
            }
            $('#profile_cont_wrap').append(community_html);
        }
        
        if (!public_view){
            get_suggested_users('top', $('#community_right_cont'));
        }
        else{
            get_suggested_users('interesting', $('#community_right_cont'));
        }
        
        if (view_to_activate == 'photos'){
            $('#community_photos').addClass('selected');
        }
        else if (view_to_activate == 'active'){
            $('#community_active').addClass('selected');
        }
        else if (view_to_activate == 'top'){
            $('#community_top').addClass('selected');
        }
    }
    
    var selected_nom = null;
    function init_nom_detail(stream_to_get, nom_cat){
        var url_vars = getUrlVars();
        var cat = '';
        
        if (typeof(nom_cat) != undefined){
            cat = nom_cat;
        }
        
        $('.stream_nav, .sub_stream_nav').removeClass('selected');
        $('#profile_cont_wrap').html('');
        stream_view = '';
        
        var nom_main_cont_html ='<div id="nom_detail_cont">' +
                                    '<h1 class="title"></h1>' +
                                    '<div id="main_nom_cont">' +
                                        '<div id="main_nom_cont_left">' +
                                            '<div id="main_nom_cont_left_wrap">' +
                                                '<img id="main_nom_photo" src="http://portrit.s3.amazonaws.com/img/album-loader-dark.gif"/>' +
                                                '<div id="nominator_overlay_cont">' +
                                                    '' +
                                                '</div>' +
                                            '</div>' +
                                        '</div>' +
                                        '<div id="main_nom_cont_right">' +
                                            '<div id="main_nom_cont_right_wrap">' +
                                                '<div id="nominatee_cont">' +
                                                    '' +
                                                '</div>' +
                                                '<div id="trophy_cont">' +
                                                    '' +
                                                '</div>' +
                                                '<div id="vote_cont">' +
                                                    '' +
                                                '</div>' +
                                            '</div>' +
                                        '</div>' +
                                        '<div class="clear"></div>' +
                                    '</div>' +
                                '</div>';
        $('#profile_cont_wrap').append(nom_main_cont_html);
        
        $.getJSON('/api/get_nom_detail/', {'source': selected_user.username, 'nom_id': selected_nom, 'nav_selected': stream_to_get, 'cat': cat}, function(data){
            if (data.length > 0){
                nom_detail_view(data, stream_to_get);
            }
            else{
                raise_404();
            }
        });
        attach_nom_detail_handlers();
    }
    
    function inject_nom_stream(noms, target){
        var nom = null,
            nom_cat_text = '',
            nom_cat_underscore = '',
            vote_count = 0,
            photo_thumbnail = '',
            user_thumbnail = '',
            name = '',
            time_diff = null,
            now = new Date(),
            comment_html = '',
            more_comment_html = '',
            commentor_name = '',
            recent_nom_html = '',
            nominator_name = '',
            nominator_caption = '',
            nomination_state_text = '',
            reactivate_html = '',
            tagged_user_html = '',
            nom_detail_link = '',
            trophy_size = 'large',
            selected_sub_nav = $('.sub_stream_nav.selected').attr('name');
            
        create_nom_cache(noms);
            
        for (var i = 0; i < noms.length; i++){
            nom = noms[i]
            nom_cat_text = nom.nomination_category;
            nom_cat_underscore = nom.nomination_category.replace(' ', '_').toLowerCase();

            if (nom.nominatee == me.id){
                name = 'You';
            }
            else{
                name = nom.nominatee_username;
            }
            user_thumbnail = '<img src="https://graph.facebook.com/' + nom.nominatee + '/picture?type=square"/>';
            photo_thumbnail = '<img src="' + nom.photo.source + '"/>';
            
            comment_html = '';
            more_comment_html = '';
            if (nom.quick_comments.length > 0){
                for (var j = 0; j < nom.quick_comments.length; j++){
                    commentor_name = nom.quick_comments[j].owner_username;
                    time = new Date(nom.quick_comments[j].create_datetime * 1000);
                    time_diff = now - time;
                    time_diff /= 1000;
                    comment_html += '<div class="comment">' +
                                        '<p class="comment_time" value="' + nom.quick_comments[j].create_datetime + '">' + secondsToHms(time_diff) + '</p>' + 
                                        '<a href="#!/' + nom.quick_comments[j].owner_username + '">' +
                                            '<img class="user_photo" src="https://graph.facebook.com/' + nom.quick_comments[j].owner_id + '/picture?type=square"/>' +
                                        '</a>' +
                                        '<a href="#!/' + nom.quick_comments[j].owner_username + '" class="post_username from_username">' +
                                            commentor_name +
                                        '</a>' +
                                        '<p>' + nom.quick_comments[j].comment + '</p>' +
                                    '</div>';
                }
                if (nom.more_comments){
                    more_comment_html = '<p class="load_more_comments" value="' + nom.id + '">Load more comments</p>';
                }
            }
            
            nominator_name = '';
            nominator_caption = '';
            if (nom.nominator == me.id){
                nominator_name = 'You';
            }
            else{
                nominator_name = nom.nominator_username;
            }
            
            if (selected_sub_nav == 'stream_active'){
                nom_detail_link = '/#!/stream/nominations/' + nom_cat_text.replace(' ', '-') + '/';
            }
            else if (selected_sub_nav == 'stream_winners'){
                nom_detail_link = '/#!/winners/nominations/';
            }
            else if (selected_sub_nav == 'community_active'){
                nom_detail_link = '/#!/nomination/' + nom.id + '/';
            }
            else if (selected_sub_nav == 'profile_active'){
                nom_detail_link = '/#!/' + selected_user.username + '/active/nominations/';
            }

            
            if (nom.caption){
                nominator_caption = nom.caption;
            }
            else{
                nominator_caption = 'No caption provided';
            }
            
            tagged_user_html = '';
            if (nom.tagged_users.length > 0){
                tagged_user_html = '<div class="tagged_users" nom="' + nom.id + '"><span>' + nom.tagged_users.length + ' Tagged</span><div class="tag"></div></div>';
            }
            
            time = new Date(nom.created_time * 1000);
            time_diff = now - time;
            time_diff /= 1000;
            
            recent_nom_html =   '<div class="recent_nom_cont" id="' + nom.id + '" time="' + nom.created_time + '" style="display:none;">' +
                                    '<div class="recent_nom_top_cont nom_cat_' + nom_cat_underscore + '">' +
                                        '<a href="#!/' + nom.nominatee_username + '">' + user_thumbnail + '</a>' +
                                        '<a href="#!/' + nom.nominatee_username + '"><h2>' + name + '</h2></a>' +
                                        '<h3>' + nom_cat_text + '</h3>' +
                                        '<div class="clear"></div>' +
                                    '</div>' +
                                    '<div class="recent_nom_photo_cont">' +
                                        '<div class="recent_nom_photo_left_cont">' +
                                            '<div class="recent_nom_photo_left_wrap">' +
                                                '<a href="' + nom_detail_link + '" class="nomination_id" value="' + nom.id + '">' +
                                                    photo_thumbnail +
                                                    '<div class="post_time_cont">' +
                                                        '<p>' + secondsToHms(time_diff) + '</p>' +
                                                    '</div>' +
                                                    '<div id="nominator_overlay_cont">' +
                                                        // '<a href="/#!/' + nom.nominator_username + '/"><img class="user_img" src="https://graph.facebook.com/' + nom.nominator + '/picture?type=square"/></a>' +
                                                        // '<h2>Nominated by <span class="strong"><a href="/#!/' + nom.nominator_username + '/">' + nominator_name + '</a></span></h2>' +
                                                        '<p>' + nominator_caption + '</p>' +
                                                        tagged_user_html +
                                                    '</div>' +
                                                '</a>' +
                                            '</div>' +
                                        '</div>' +
                                        '<div class="recent_nom_photo_right_cont">' +
                                            '<div class="recent_nom_vote_count nom_vote_' + nom.id + '">' +
                                                '<a href="' + nom_detail_link + '" class="nomination_id" value="' + nom.id + '">' +
                                                    '<div class="trophy_img ' + trophy_size + ' ' + nom_cat_underscore + '"></div>' +
                                                '</a>' +
                                                '<a href="' + nom_detail_link + '" class="nomination_id" value="' + nom.id + '">' +
                                                    '<h2 class="nom_cat_' + nom_cat_underscore + '">Votes: <span class="strong">' + nom.vote_count + '</span></h2>' +
                                                '</a>' +
                                            '</div>' +
                                            '<div class="clear"></div>' +
                                        '</div>' +
                                        '<div class="clear"></div>' +
                                    '</div>' +
                                    '<div class="recent_nom_comment_cont" id="nom_comments_' + nom.id +'">' +
                                        '<div class="recent_nom_comment_heading" value="' + nom.id + '">' +
                                            '<span class="add_new_comment sick large">Comment</span>' +
                                            '<span class="nom_detail sick large">Detail</span>' +
                                            '<div class="flag flag_photo" nom_id="' + nom.id + '"></div>' +
                                            '<div class="clear"></div>' +
                                        '</div>' +
                                        comment_html +
                                        more_comment_html +
                                        '<div class="clear"></div>' +
                                    '</div>' +
                                '</div>';
            
            $(target).prepend(recent_nom_html);
            $('#' + nom.id).fadeIn();
        }
    }
    
    var inactive_nom_found = false;
    var inactive_header_pos = 0;
    function render_recent_stream(recent_noms, target){
        var nom = null,
            nom_cat_text = '',
            nom_cat_underscore = '',
            vote_count = 0,
            photo_thumbnail = '',
            user_thumbnail = '',
            name = '',
            time_diff = null,
            now = new Date(),
            comment_html = '',
            more_comment_html = '',
            commentor_name = '',
            recent_nom_html = '',
            nominator_name = '',
            nominator_caption = '',
            nomination_state_text = '',
            reactivate_html = '',
            tagged_user_html = '',
            nom_detail_link = '',
            trophy_size = 'large',
            selected_sub_nav = $('.sub_stream_nav.selected').attr('name');
            
        create_nom_cache(recent_noms);
        
        var actions_class = '';
        if (!me){
            actions_class = 'off';
        }
        
        if (recent_noms.length > 0){
            for (var i = 0; i < recent_noms.length; i++){
                nom = recent_noms[i]
                nom_cat_text = nom.nomination_category;
                nom_cat_underscore = nom.nomination_category.replace(' ', '_').toLowerCase();

                if (me && nom.nominatee == me.id){
                    name = 'You';
                }
                else{
                    name = nom.nominatee_username;
                }
                user_thumbnail = '<img src="https://graph.facebook.com/' + nom.nominatee + '/picture?type=square"/>';
                photo_thumbnail = '<img src="' + nom.photo.source + '"/>';

                comment_html = '';
                more_comment_html = '';
                if (nom.quick_comments.length > 0){
                    for (var j = 0; j < nom.quick_comments.length; j++){
                        commentor_name = nom.quick_comments[j].owner_username;
                        time = new Date(nom.quick_comments[j].create_datetime * 1000);
                        time_diff = now - time;
                        time_diff /= 1000;
                        
                        if (me && commentor_name == me.username){
                            commentor_name = 'You';
                        }
                        
                        comment_html += '<div class="comment">' +
                                            '<p class="comment_time" value="' + nom.quick_comments[j].create_datetime + '">' + secondsToHms(time_diff) + '</p>' + 
                                            '<a href="#!/' + nom.quick_comments[j].owner_username + '">' +
                                                '<img class="user_photo" src="https://graph.facebook.com/' + nom.quick_comments[j].owner_id + '/picture?type=square"/>' +
                                            '</a>' +
                                            '<a href="#!/' + nom.quick_comments[j].owner_username + '" class="post_username from_username">' +
                                                commentor_name +
                                            '</a>' +
                                            '<p>' + nom.quick_comments[j].comment + '</p>' +
                                        '</div>';
                    }
                    if (nom.comment_count - nom.quick_comments.length > 0){
                        more_comment_html = '<p class="load_more_comments" value="' + nom.id + '">Load more comments</p>';
                    }
                }

                nominator_name = '';
                nominator_caption = '';
                if (me && nom.nominator == me.id){
                    nominator_name = 'You';
                }
                else{
                    nominator_name = nom.nominator_username;
                }

                if (selected_sub_nav == 'stream_active'){
                    nom_detail_link = '/#!/stream/nominations/' + nom_cat_text.replace(' ', '-') + '/';
                }
                else if (selected_sub_nav == 'stream_winners'){
                    nom_detail_link = '/#!/winners/nominations/';
                }
                else if (selected_sub_nav == 'community_active'){
                    nom_detail_link = '/#!/nomination/' + nom.id + '/';
                }
                else if (selected_sub_nav == 'profile_active'){
                    nom_detail_link = '/#!/' + selected_user.username + '/active/nominations/';
                }


                if (nom.caption){
                    nominator_caption = nom.caption;
                }
                else{
                    nominator_caption = 'No caption provided';
                }

                tagged_user_html = '';
                if (nom.tagged_users.length > 0){
                    tagged_user_html = '<div class="tagged_users" nom="' + nom.id + '"><span>' + nom.tagged_users.length + ' Tagged</span><div class="tag"></div></div>';
                }

                time = new Date(nom.created_time * 1000);
                time_diff = now - time;
                time_diff /= 1000;

                recent_nom_html =   '<div class="recent_nom_cont" id="' + nom.id + '" time="' + nom.created_time + '">' +
                                        '<div class="recent_nom_top_cont nom_cat_' + nom_cat_underscore + '">' +
                                            '<a href="#!/' + nom.nominatee_username + '">' + user_thumbnail + '</a>' +
                                            '<a href="#!/' + nom.nominatee_username + '"><h2>' + name + '</h2></a>' +
                                            '<h3>' + nom_cat_text + '</h3>' +
                                            '<div class="clear"></div>' +
                                        '</div>' +
                                        '<div class="recent_nom_photo_cont">' +
                                            '<div class="recent_nom_photo_left_cont">' +
                                                '<div class="recent_nom_photo_left_wrap">' +
                                                    '<a href="' + nom_detail_link + '" class="nomination_id" value="' + nom.id + '">' +
                                                        photo_thumbnail +
                                                        '<div class="post_time_cont">' +
                                                            '<p>' + secondsToHms(time_diff) + '</p>' +
                                                        '</div>' +
                                                        '<div id="nominator_overlay_cont">' +
                                                            // '<a href="/#!/' + nom.nominator_username + '/"><img class="user_img" src="https://graph.facebook.com/' + nom.nominator + '/picture?type=square"/></a>' +
                                                            // '<h2>Nominated by <span class="strong"><a href="/#!/' + nom.nominator_username + '/">' + nominator_name + '</a></span></h2>' +
                                                            '<p>' + nominator_caption + '</p>' +
                                                            tagged_user_html +
                                                        '</div>' +
                                                    '</a>' +
                                                '</div>' +
                                            '</div>' +
                                            '<div class="recent_nom_photo_right_cont">' +
                                                '<div class="recent_nom_vote_count nom_vote_' + nom.id + '">' +
                                                    '<a href="' + nom_detail_link + '" class="nomination_id" value="' + nom.id + '">' +
                                                        '<div class="trophy_img ' + trophy_size + ' ' + nom_cat_underscore + '"></div>' +
                                                    '</a>' +
                                                    '<a href="' + nom_detail_link + '" class="nomination_id" value="' + nom.id + '">' +
                                                        '<h2 class="nom_cat_' + nom_cat_underscore + '">Votes: <span class="strong">' + nom.vote_count + '</span></h2>' +
                                                    '</a>' +
                                                '</div>' +
                                                '<div class="clear"></div>' +
                                            '</div>' +
                                            '<div class="clear"></div>' +
                                        '</div>' +
                                        '<div class="recent_nom_comment_cont" id="nom_comments_' + nom.id +'">' +
                                            '<div class="recent_nom_comment_heading" value="' + nom.id + '">' +
                                                '<span class="add_new_comment sick large ' + actions_class + '">Comment</span>' +
                                                '<span class="nom_detail sick large">Detail</span>' +
                                                '<div class="flag flag_photo ' + actions_class + '" nom_id="' + nom.id + '"></div>' +
                                                '<div class="clear"></div>' +
                                            '</div>' +
                                            comment_html +
                                            more_comment_html +
                                            '<div class="clear"></div>' +
                                        '</div>' +
                                    '</div>';

                $(target).append(recent_nom_html);
            }
        }
        else if ($(target).children().length == 0){
            var empty_title = '';
            var empty_html = '';
            var option_1 = '';
            var option_2 = '';
            var option_3 = '';
            
            if (view_active == 'stream_active'){
                empty_title = 'Active Nominations';
                option_1 = 'Nominate one of your photos.';
                option_2 = 'Nominate your friend\'s photos.';
                option_3 = 'Nominate photos from the community.';
            }
            else if (view_active == 'stream_winners'){
                empty_title = 'Winning Photos';
                option_1 = 'Nominate one of your photos.';
                option_2 = 'Nominate your friend\'s photos.';
                option_3 = 'Nominate photos from the community.';
            }
            
            empty_html ='<div id="stream_empty">' +
                            '<h1>There are no <span class="strong">' + empty_title + '</span></h1>' +
                            '<ul>' +
                                '<li>' +
                                    '<h3>You can solve this by completing one of the following actions:</h3>' +
                                '</li>' +
                                '<li>' +
                                    '<p>' + option_1 + '</p>' +
                                '</li>' +
                                '<li>' +
                                    '<p>' + option_2 + '</p>' +
                                '</li>' +
                                '<li>' +
                                    '<p>' + option_3 + '</p>' +
                                '</li>' +
                            '</ul>' +
                            '<div class="clear"></div>' +
                        '</div>';
            
            $(target).append(empty_html);
        }
    }
    
    function render_active_overview_stream(data, target){
        var active_nom_html = '';
        var nominator_name = '';
        var nominatee_name = '';
        var cat_name = '';
        var cat_underscore = '';
        var caption = '';
        var time = null;
        var time_diff = null;
        var now = new Date();
        var flag_class = '';
        
        if (public_view){
            flag_class = 'off';
        }
        
        for (var i = 0; i < data.length; i++){
            cat_name = data[i].nomination_category;
            cat_underscore = get_cat_under(cat_name);
            nominatee_name = '';
            nominator_name = '';
            caption = '';
            
            if (me && data[i].nominatee == me.id){
                nominatee_name = 'You';
            }
            else{
                nominatee_name = data[i].nominatee_name;
            }
            
            if (me && data[i].nominator == me.id){
                nominator_name = 'You';
            }
            else{
                nominator_name = data[i].nominator_name;
            }
            
            if (data[i].caption){
                caption = data[i].caption;
                if (caption.length > 40){
                    caption = data[i].caption.slice(0, 40) + '...';
                }
            }
            else{
                caption = 'No caption provided.'
            }
            
            time = new Date(data[i].created_time * 1000);
            time_diff = now - time;
            time_diff /= 1000;
            
            active_nom_html =   '<div class="community_active_cont" id="' + data[i].id + '">' +
                                    '<div class="community_active_left_cont">' +
                                        '<a href="/#!/community/active/' + data[i].id + '/" class="nomination_id" value="' + data[i].id + '">' +
                                            '<img src="' + data[i].photo.crop + '"/>' +
                                        '</a>' +
                                    '</div>' +
                                    '<div class="community_active_right_cont">' +
                                        '<div class="community_active_header nom_cat_' + cat_underscore + '">' +
                                            '<a href="/#!/' + data[i].nominatee_username + '/">' +
                                                '<img src="https://graph.facebook.com/' + data[i].nominatee + '/picture?type=square"/>' +
                                            '</a>' +
                                            '<h3>' + cat_name + '</h3>' +
                                            '<h2><a href="/#!/' + data[i].nominatee_username + '/">' + data[i].nominatee_username + '</a></h2>' +
                                        '</div>' +
                                        '<div class="community_active_mid">' +
                                            '<h2>' + caption + '</h2>' +
                                        '</div>' +
                                        '<div class="community_active_bottom">' +
                                            '<div class="flag flag_photo ' + flag_class + '" nom_id="' + data[i].id + '"></div>' +
                                            '<div class="active_stat">' +
                                                '<h4>' + secondsToHms(time_diff) + '</h4>' +
                                            '</div>' +
                                            '<div class="active_stat">' +
                                                '<h5>Votes</h5>' +
                                                '<p>' + data[i].votes.length + '</p>' +
                                            '</div>' +
                                        '</div>' +
                                    '</div>' +
                                    '<div class="clear"></div>' +
                                '</div>';
            
            $(target).append(active_nom_html);
        }
    }
    
    function render_community_top_cat(data, target){
        var cat_name = '',
            cat_underscore = '',
            noms = null,
            nom = null,
            cat_html = '';
            tag_html = '';
            
        cat_name = data[0].nomination_category;
        cat_underscore = get_cat_under(cat_name);
        
        cat_html =  '<div class="top_nom_cat">' +
                        '<div class="top_cat_heading nom_cat_' + cat_underscore + '">' +
                            '<h2>' +
                                cat_name + 
                            '</h2>' +
                            '<div class="clear"></div>' +
                        '</div>' +
                        '<div class="top_nom_cat_cont"><p class="tooltip"></p>';
            
        for (var i = 0; i < data.length; i++){
            nom = data[i];
            
            cat_html += '<div class="top_cat_photo_cont nomination_id" value="' + nom.id + '" name="' + nom.nominatee_username + '">' +
                            '<a href="/#!/community/top/' + cat_name.replace(' ', '-') + '/nominations/">' +
                                '<img src="' + nom.photo.crop + '"/>' +
                            '</a>' +
                        '</div>';
        }
        
        cat_html += '<div class="clear"></div></div></div>';
        $(target).append(cat_html);
    }
    
    function render_community_top(data, target){
        var cat_name = '',
            cat_underscore = '',
            noms = null,
            nom = null,
            cat_html = '';
            tag_html = '';
        for (var i = 0; i < data.length; i++){
            cat_name = data[i].cat_name;
            cat_underscore = get_cat_under(cat_name);
            noms = data[i].noms;
            tag_html = '';
            
            if (noms.length == 12){
                tag_html =  '<div class="load_more_community_active" value="' + cat_name + '">' +
                                '<div class="tag"></div>' +
                                '<p>View More</p>' +
                            '</div>';
            }
            
            cat_html =  '<div class="top_nom_cat">' +
                            '<div class="top_cat_heading nom_cat_' + cat_underscore + '">' +
                                '<h2>' +
                                    cat_name + 
                                '</h2>' +
                                tag_html + 
                                '<div class="clear"></div>' +
                            '</div>' +
                            '<div class="top_nom_cat_cont"><p class="tooltip"></p>';
                            
            for (var j = 0; j < noms.length; j++){
                nom = noms[j];
                
                cat_html += '<div class="top_cat_photo_cont nomination_id" value="' + nom.id + '" name="' + nom.nominatee_username + '">' +
                                '<a href="/#!/community/top/' + cat_name.replace(' ', '-') + '/nominations/">' +
                                    '<img src="' + nom.photo.crop + '"/>' +
                                '</a>' +
                            '</div>';
            }
            cat_html += '<div class="clear"></div></div></div>';
            $(target).append(cat_html);
        }
    }
    
    function render_top_noms(top_noms){
        var nom = null,
            nom_cat_text = '',
            nom_cat_underscore = '',
            user_thumbnail = '',
            photo_thumbnail = '',
            vote_count = 0,
            name = '',
            top_nom_html = '',
            top = 10;
            
        $('#top_right_cont').append('<h1>Daily <span class="strong">Leaders</h1><div id="current_top_noms"></div>');
        if (top_noms.length > 0){
            if (top_noms.length < top){
                top = top_noms.length;
            }
            for (var i = 0; i < top_noms.length; i++){
                nom = top_noms[i];
                nom_cat_text = nom.nomination_category;
                nom_cat_underscore = nom.nomination_category.replace(' ', '_').toLowerCase();
                if (i < top){
                    if (nom.nominatee == me.id){
                        name = 'You';
                    }
                    else{
                        name = nom.nominatee_username;
                    }
                    user_thumbnail = '<img src="https://graph.facebook.com/' + nom.nominatee + '/picture?type=square"/>';
                    photo_thumbnail = '<img src="' + nom.photo.thumbnail + '"/>';
                    
                    top_nom_html =  '<div class="top_nom_wrap" name="' + nom.nominatee_username + '">' +
                                        '<p class="vote_count nom_cat_' + nom_cat_underscore + '">' + getGetOrdinal(i + 1) + '</p>' +
                                        '<a href="/#!/' + nom.nominatee_username + '/">' + 
                                            user_thumbnail +
                                        '</a>' +
                                        '<div class="top_nom_clip_cont" value="' + nom.id + '">' +
                                            '<div class="top_nom_clip">' +
                                                '<a href="/#!/stream/nominations/' + nom_cat_text.replace(' ', '-') + '/" class="nomination_id" value="' + nom.id + '">' +
                                                    photo_thumbnail +
                                                '</a>' +
                                            '</div>' +
                                        '</div>' +
                                        '<div class="top_nom_user_cont">' +
                                            '<div class="trophy_cont">' +
                                                '<a href="/#!/stream/nominations/' + nom_cat_text.replace(' ', '-') + '/" class="nomination_id" value="' + nom.id + '">' +
                                                    '<div class="trophy_img small ' + nom_cat_underscore + '"></div>' +
                                                '</a>' +
                                            '</div>' +
                                            '<div class="vote_cont">' +
                                                '<a href="/#!/stream/nominations/' + nom_cat_text.replace(' ', '-') + '/" class="nomination_id" value="' + nom.id + '">' +
                                                    '<h3>Votes</h3>' +
                                                    '<h2>' + nom.vote_count + '</h2>' +
                                                '</a>' +
                                            '</div>' +
                                        '</div>' +
                                    '</div>';

                    $('#current_top_noms').append(top_nom_html);
                }
            }
            $('#current_top_noms').append('<p class="tooltip"></p>');
        }
        else{
            $('#top_right_cont').append('<h2>No current nominations.</h2>');
        }
    }
    
    function render_top_users(top_users){
        var user_html = '';
        var top_html = '';
        var username = '';
        var name_class = '';
        if (top_users.length > 0){
            top_html = '<h1>All Time <span class="strong">Leaders</span></h1><div id="top_friends">';
            for (var i = 0; i < top_users.length; i++){
                if (top_users[i].fid == me.id){
                    username = 'You';
                }
                else{
                    username = top_users[i].username;
                }
                user_html = '<div class="top_friend" value="' + top_users[i].username + '">' +
                                '<a href="/#!/' + top_users[i].username + '/">' +
                                    '<img src="https://graph.facebook.com/' + top_users[i].fid + '/picture?type=square"/>' +
                                '</a>' +
                                '<a href="/#!/' + top_users[i].username + '/">' +
                                    '<h2>' + username + '</h2>' +
                                '</a>' +
                                '<h3>' + top_users[i].noms_won + '</h3>' +
                                '<p class="nom_cat_' + top_users[i].top_nom_cat.replace(' ', '_').toLowerCase() + '">' + getGetOrdinal(i + 1) + '</p>' +
                            '</div>';
                top_html += user_html;
            }
            top_html += '</div>';
            $('#top_right_cont').append(top_html);
        }
    }
    
    function init_stream_photos(){
        $('#recent_left_cont').html('');
        append_load($('#recent_left_cont'), 'light');
        $.getJSON('/api/get_user_stream_photos/', {'access_token': fb_session.access_token}, function(data){
            remove_load();
            if (data.length > 0){
                render_photo_list(data);
            }
            else{
                empty_html ='<div id="stream_empty">' +
                                '<h1>There are no <span class="strong">Recent Photos</span></h1>' +
                                '<ul>' +
                                    '<li>' +
                                        '<h3>You can solve this by completing one of the following actions:</h3>' +
                                    '</li>' +
                                    '<li>' +
                                        '<p>Upload a photo by clicking the Post Photo button above.</p>' +
                                    '</li>' +
                                    '<li>' +
                                        '<p>Downloading the <a>Portrit iPhone app</a>.</p>' +
                                    '</li>' +
                                '</ul>' +
                                '<div class="clear"></div>' +
                            '</div>';

                $('#recent_left_cont').append(empty_html);
            }
        });
    }
    
    function get_more_stream_photos(pid){
        scroll_loading = true;
        append_load($('#recent_left_cont'), 'light');
        $.getJSON('/api/get_user_stream_photos/', {'pid': pid, 'access_token': fb_session.access_token}, function(data){
            scroll_loading = false;
            remove_load();
            render_photo_list(data, true);
        });
    }
    
    function init_stream_active(){
        $('#recent_left_cont').html('');
        append_load($('#recent_left_cont'), 'light');
        $.getJSON('/api/get_recent_stream/', {'access_token': fb_session.access_token}, function(data){
            remove_load();
            render_recent_stream(data, $('#recent_left_cont'));
        });
    }
    
    function get_more_stream_active(id){
        scroll_loading = true;
        append_load($('#recent_left_cont'), 'light');
        $.getJSON('/api/get_recent_stream/', {'access_token': fb_session.access_token, 'id': id, 'dir': 'old'}, function(data){
            scroll_loading = false;
            remove_load();
            render_recent_stream(data, $('#recent_left_cont'));
        });
    }
    
    function init_stream_winners(){
        $('#recent_left_cont').html('');
        append_load($('#recent_left_cont'), 'light');
        $.getJSON('/api/get_winners_stream/', {'access_token': fb_session.access_token}, function(data){
            remove_load();
            render_recent_stream(data, $('#recent_left_cont'));
        });
    }
    
    function get_more_stream_winners(id){
        scroll_loading = true;
        append_load($('#recent_left_cont'), 'light');
        $.getJSON('/api/get_winners_stream/', {'access_token': fb_session.access_token, 'id': id, 'dir': 'old'}, function(data){
            scroll_loading = false;
            remove_load();
            render_recent_stream(data, $('#recent_left_cont'));
        });
    }
    
    function init_stream_view(view_to_activate){
        var page_size = 10;
        if (mobile || tablet){
            page_size = 5;
        }
        $('.stream_nav').removeClass('selected');
        $('#active_stream_view').addClass('selected');
        stream_view = 'stream';
            
        var recent_view_html = '<div id="recent_cont_1">' +
                                    '<div class="stream_nav_cont">' +
                                        '<h1>Stream</h1>' +
                                        '<ul>' +
                                            '<li>' +
                                                '<h2 id="stream_winners" class="sub_stream_nav" name="stream_winners">Winners</h2>' +
                                            '</li>' +
                                            '<li>' +
                                                '<h2 id="stream_active" class="sub_stream_nav" name="stream_active">Active</h2>' +
                                            '</li>' +
                                            '<li>' +
                                                '<h2 id="stream_photos" class="sub_stream_nav" name="stream_photos">Photos</h2>' +
                                            '</li>' +
                                            '<div class="clear"></div>' +
                                        '</ul>' +
                                    '</div>' +
                                    '<div id="top_right_cont">' +
                                        '' +
                                    '</div>' +
                                    '<div id="recent_left_cont">' +
                                        '' +
                                    '</div>' +
                                '</div>' +
                                '<div class="clear"></div>';
        $('#profile_cont_wrap').append(recent_view_html);
        
        if (view_to_activate == 'photos'){
            $('#stream_photos').addClass('selected');
        }
        else if (view_to_activate == 'active'){
            $('#stream_active').addClass('selected');
        }
        else if (view_to_activate == 'winners'){
            $('#stream_winners').addClass('selected');
        }
        
        $.getJSON('/init_stream/', function(data){
            render_top_noms(data.top);
            render_top_users(data.top_users);
        });
    }
    
    function load_user(method, fnc_ptr){
        var url_vars = getUrlVars();
        var username = url_vars[0];
        var access_token = '';
        
        if (fb_session){
            access_token = fb_session.access_token;
        }
        
        var vars = {
            'access_token': access_token,
            'username': username
        };
        
        if (method != 'all'){
            vars.method = method;
            if (method == 'photos' && url_vars.length > 2){
                vars.pid = url_vars[2];
            }
        }
        
        $.getJSON('/api/get_user_profile/', vars, function(data){
            selected_user = data.user;
            if (method == 'all'){
                user_profile_data = data;
            }
            selected_user.photos = data.photos;
            
            fnc_ptr(selected_user);
        });
    }
    
    function render_gallery_view(){
        var selected_photo_index = 0;
        var prev_photo = null;
        var prev_photo_value = 'empty';
        var prev_html = '';
        var next_photo = null;
        var next_photo_value = 'empty';
        var next_html = '';
        var name = '';
            
        for (var i = 0; i < selected_user.photos.length; i++){
            if (selected_user.photos[i].id == selected_photo){
                selected_photo_index = i;
                break;
            }
        }
        selected_photo = selected_user.photos[selected_photo_index];
        
        if (selected_photo_index - 1 >= 0){
            prev_photo = selected_user.photos[selected_photo_index - 1];
            prev_photo_value = prev_photo.id;
            prev_photo_html = '<img src="' + prev_photo.crop + '"/>';
        }
        else{
            prev_photo_value = 'empty';
            prev_photo_html = '<h4>First</h4>';
        }
        if (selected_photo_index + 1 < selected_user.photos.length){
            next_photo = selected_user.photos[selected_photo_index + 1];
            next_photo_value = next_photo.id;
            next_photo_html = '<img src="' + next_photo.crop + '"/>';
        }
        else{
            next_photo_value = 'empty';
            next_photo_html = '<h4>Last</h4>';
        }
        
        var flag_class = '';
        if (public_view){
            flag_class = 'off';
        }
        
        name = selected_user.name + '\'s';
        if (me && me.id == selected_user.fid){
            name = 'Your';
        }
        
        var now = new Date();
        var time = new Date(selected_photo.created_time * 1000);
        var time_diff = now - time;
        time_diff /= 1000;
        
        var gallery_html =  '<div id="gallery_header">' +
                                '<a href="/#!/' + selected_user.username + '/">' +
                                    '<img src="https://graph.facebook.com/' + selected_user.fid + '/picture?type=square"/>' +
                                    '<h2>' + name + ' Photos</h2>' +
                                '</a>' +
                            '</div>' +
                            '<div id="gallery_wrap">' +
                                '<div id="gallery_left_stream">' +
                                    '<div id="gallery_prev">' +
                                        '<div class="up_arrow"></div>' +
                                    '</div>' +
                                    '<div id="gallery_prev_cont" class="gallery_thumb" value="' + prev_photo_value + '">' +
                                        prev_photo_html +
                                    '</div>' +
                                    '<div id="gallery_selected_cont" class="gallery_thumb">' +
                                        '<img src="' + selected_photo.crop + '"/>' +
                                        '<div id="nominate" class="active">Nominate</div>' +
                                        '<div id="nominate_arrow" class="nominate_arrow"></div>' +
                                    '</div>' +
                                    '<div id="gallery_next_cont" class="gallery_thumb" value="' + next_photo_value + '">' +
                                        next_photo_html +
                                    '</div>' +
                                    '<div id="gallery_next">' +
                                        '<div class="down_arrow"></div>' +
                                    '</div>' +
                                '</div>' +
                                '<div id="gallery_photo_cont">' +
                                    '<div id="gallery_photo_center">' +
                                        '<img src="' + selected_photo.source + '"/>' +
                                    '</div>' +
                                    '<div id="gallery_photo_bottom_cont">' +
                                        '<p>' + secondsToHms(time_diff) + '</p>' +
                                        '<div class="flag flag_photo ' + flag_class + '" pid="' + selected_photo.id + '" thumb="' + selected_photo.crop + '" fb_crop="' + selected_photo.crop_small + '" owner="' + selected_user.username + '"></div>' +
                                    '</div>' +
                                '</div>' + 
                                '<div id="gallery_photo_cache" style="display:none;"></div>' +
                            '</div>' +
                            '<div class="clear"></div>';
                            
        $('#gallery_cont').append(gallery_html);
        
        if (selected_photo_index - 1 >= 0){
            $('#gallery_photo_cache').append('<img src="' + selected_user.photos[selected_photo_index - 1].source + '"/>');
        }
        if (selected_photo_index + 1 < selected_user.photos.length){
            $('#gallery_photo_cache').append('<img src="' + selected_user.photos[selected_photo_index + 1].source + '"/>');
        }
    }
    
    function update_gallery_view(id){
        var selected_photo_index = 0,
            prev_photo = null,
            prev_photo_value = 'empty',
            prev_html = '',
            next_photo = null,
            next_photo_value = 'empty',
            next_html = '';
        for (var i = 0; i < selected_user.photos.length; i++){
            if (selected_user.photos[i].id == selected_photo){
                selected_photo_index = i;
                break;
            }
        }
        selected_photo = selected_user.photos[selected_photo_index];
        
        $('#photo_nominated_cont').remove();
        $('.nominated').removeClass('nominated');
        
        if (selected_photo_index - 1 >= 0){
            prev_photo = selected_user.photos[selected_photo_index - 1];
            prev_photo_value = prev_photo.id;
            prev_photo_html = '<img src="' + prev_photo.crop + '"/>';
            
            if (prev_photo.nominated){
                $('#gallery_prev_cont').addClass('nominated');
            }
        }
        else{
            prev_photo_value = 'empty';
            prev_photo_html = '<img src="http://portrit.s3.amazonaws.com/img/album-loader-dark.gif"/>';
            
            if (typeof(selected_photo.end) == 'undefined'){
                load_more_user_photos(selected_photo.id, 'new');
            }
            else{
                prev_photo_html = '<h4>First</h4>';
            }
        }
        if (selected_photo_index + 1 < selected_user.photos.length){
            next_photo = selected_user.photos[selected_photo_index + 1];
            next_photo_value = next_photo.id;
            next_photo_html = '<img src="' + next_photo.crop + '"/>';
            
            if (next_photo.nominated){
                $('#gallery_next_cont').addClass('nominated');
            }
        }
        else{
            next_photo_value = 'empty';
            next_photo_html = '<img src="http://portrit.s3.amazonaws.com/img/album-loader-dark.gif"/>';
            
            if (typeof(selected_photo.end) == 'undefined'){
                load_more_user_photos(selected_photo.id, 'old');
            }
            else{
                next_photo_html = '<h4>Last</h4>';
            }
        }
        
        var now = new Date();
        var time = new Date(selected_photo.created_time * 1000);
        var time_diff = now - time;
        time_diff /= 1000;
        
        $('#gallery_photo_bottom_cont > p').text(secondsToHms(time_diff));
        $('#gallery_photo_bottom_cont > .flag').attr('pid', selected_photo.id).attr('thumb', selected_photo.crop).attr('fb_crop', selected_photo.crop_small);
        
        $('#gallery_prev_cont').html(prev_photo_html).attr('value', prev_photo_value);
        $('#gallery_selected_cont > img').attr('src', selected_photo.crop);
        $('#gallery_next_cont').html(next_photo_html).attr('value', next_photo_value);
        
        $('#gallery_photo_center > img').attr('src', selected_photo.source);
        
        if (selected_photo.nominated ){
            render_photo_nominated(selected_photo.nom);
        }
        else{
            $('#nominate').removeClass().addClass('active');
        }
        
        $('#gallery_photo_cache').html('');
        if (selected_photo_index - 1 >= 0){
            $('#gallery_photo_cache').append('<img src="' + selected_user.photos[selected_photo_index - 1].source + '"/>');
        }
        if (selected_photo_index + 1 < selected_user.photos.length){
            $('#gallery_photo_cache').append('<img src="' + selected_user.photos[selected_photo_index + 1].source + '"/>');
        }
    }
    
    function render_photo_nominated(nom){
        $('#gallery_selected_cont').addClass('nominated');
        $('#nominate').removeClass().addClass('disabled');
        
        
        var photo_nominated_html =  '<div id="photo_nominated_cont">' +
                                        '<h2>You nominated this photo for ' + nom + '</h2>' +
                                        '<div class="trophy_img large ' + get_cat_under(nom) + '"></div>' +
                                        '<h3>Go to the <a href="/#!/" class="nom_cat_' + get_cat_under(nom) + '_text">Stream</a> to see your nomination</h3>' +
                                    '</div>';
        
        $('#gallery_photo_cont').append(photo_nominated_html);
    }
    
    function add_photo_nominated(id, noms){
        noms = noms.split(',');
        var noms_html = '';
        var nom = '';
        
        for (var i = 0; i < noms.length; i++){
            if (noms[i]){
                nom = noms[i];
            }
        }
        
        for (var i = 0; i < selected_user.photos.length; i++){
            if (selected_user.photos[i].id == id){
                selected_user.photos[i].nominated = true;
                selected_user.photos[i].nom = nom;
                break;
            }
        }
        
        render_photo_nominated(nom);
    }
    
    function attach_gallery_handlers(){
        $('#gallery_next').live('click', function(){
            $('#gallery_next_cont').click();
        });
        
        $('#gallery_prev').live('click', function(){
            $('#gallery_prev_cont').click();
        });
        
        $('#gallery_prev_cont').live('click', function(){
            var value = $(this).attr('value');
            if (value != 'empty'){
                selected_photo = value;
                update_gallery_view();
            }
        });
        
        $('#gallery_next_cont').live('click', function(){
            var value = $(this).attr('value');
            if (value != 'empty'){
                selected_photo = value;
                update_gallery_view(value);
            }
        });

        $('#nominate').live('click', function(){
            if (!public_view){
                disable_search = true;
                $('#context_overlay_cont').addClass('nominate_photo');
                $('#context_overlay_cont > div').append(nominate_photo_html);

                $('#selected_img').attr('src', selected_photo.source);

                show_context_overlay(true, true);

                $('#tagged_friends_cont').append('<div class="tagged_user nominatee_user" name="Nominee"><img src="https://graph.facebook.com/' + selected_user.fid + '/picture?type=square"/></div>')

                mutual_friends_list = [ ];
                $.getJSON('/api/get_follow_data/', {'access_token': fb_session.access_token, 'mutual': true, 'target': selected_user.fid, 'all': true, 'method': 'following'}, function(data){
                    var user = null;
                    for (var i = 0; i < data.data.length; i++){
                        user = data.data[i];
                        mutual_friends_list.push({
                            'fid': user.fid,
                            'name': user.name,
                            'username': user.username
                        });
                    }
                    for (var i = 0; i < mutual_friends_list.length; i++){
                        $('#mutual_friends_cont').append('<div class="mutual_user" id="mutual_' + mutual_friends_list[i].fid + '" value="' + mutual_friends_list[i].fid + '"><img src="https://graph.facebook.com/' + mutual_friends_list[i].fid + '/picture?type=square"/><p>' + mutual_friends_list[i].name + '</p><span>' + mutual_friends_list[i].username + '</span><div class="clear"></div></div>');
                    }
                });
            }
            else{
                var login_required_html = '';
                $('#gallery_selected_cont').append(login_required_html);
            }
        });
        
        $('#nominate').live('mouseover mouseout', function(event) {
            if ($(this).hasClass('disabled') == false){
                if (event.type == 'mouseover') {
                    $('#nominate_arrow').removeClass().addClass('nominate_arrow_hover');
                } else {
                    $('#nominate_arrow').removeClass().addClass('nominate_arrow');
                }
            }
        });
    }
    
    function init_gallery_view(photo_id){
        if (typeof(photo_id) != 'undefined'){
            selected_photo = photo_id;
        }
        stream_view = '';
        
        $('.stream_nav, .sub_stream_nav').removeClass('selected');
        
        var gallery_html =  '<div id="gallery_cont">' +
                                '' +
                            '</div>';
        $('#profile_cont_wrap').html(gallery_html);
                            
        if (selected_user && selected_user.username){
            if (selected_user.photos){
                render_gallery_view();
            }
            else{
                load_user('photos', render_gallery_view);
            }
        }
        else{
            load_user('all', render_gallery_view);
        }
        
        attach_gallery_handlers();
    }
    
    function render_user_profile(data){
        if (!me || data.user.fid != me.id){
            $('#user_profile_image').html('<img src="https://graph.facebook.com/' + data.user.fid + '/picture?type=large"/>');
            $('#profile_user_name').text(data.user.name);
            $('#profile_user_username').text('AKA ' + data.user.username);
            if (me){
                var follow_html = '';
                if (!data.follow){
                    follow_html = '<span class="sick_abs large green follow" value="follow" target="' + data.user.username + '">Follow</span>';
                }
                else{
                    follow_html = '<span class="sick_abs large red follow" value="unfollow" target="' + data.user.username + '">Unfollow</span>'
                }
                $('#user_profile_image').append(follow_html);   
            }
        }
        $('#profile_followers_count_cont h3').text(data.follow_counts.followers);
        $('#profile_following_count_cont h3').text(data.follow_counts.following);
        
        $('#profile_trophies').after('<p id="trophy_count" class="round_count">' + data.trophy_count + '</p>');
        $('#profile_active').after('<p id="active_count" class="round_count">' + data.active_noms_count + '</p>');
    }
    
    function render_user_photos(data, append){
        if (data.length > 0){
            if (typeof(append) == 'undefined'){
                $('#profile_user_context').append('<div id="user_photo_cont"></div>');
            }
            var img_html = '';
            var now = new Date();
            for (var i = 0; i < data.length; i++){
                time = new Date(data[i].created_time * 1000);
                time_diff = now - time;
                time_diff /= 1000;
                
                img_html =  '<div class="user_photo_wrap" pid="' + data[i].id + '" name="' + secondsToHms(time_diff) + '">' +
                                '<a href="/#!/' + selected_user.username + '/photos/" value="' + data[i].id + '">' +
                                    '<img src="' + data[i].crop + '"/>' +
                                '</a>' +
                            '</div>';
                $('#user_photo_cont').append(img_html);
            }
            if ($('#user_photo_cont .tooltip').length == 0){
                $('#user_photo_cont').append('<p class="tooltip"></p>');
            }
            $('#user_photo_cont').append('<div class="clear"></div>');
        }
        else{
            var empty_text = '';
            if (me && me.id == selected_user.fid){
                empty_text = 'You have no photos.';
            }
            else{
                empty_text = selected_user.name + ' has no photos.';
            }
            $('#profile_user_context').append('<div id="cont_empty"><h2>' + empty_text + '</h2></div>')
        }
    }
    
    function render_user_trophies(data){
        if (data.length > 0){
            var cat_name = '',
                cat_underscore = '',
                noms = null,
                nom = null,
                short_class ='',
                cat_html = '';
            
            $('#profile_user_context').append('<div id="user_trophy_cont"></div>');
            for (var i = 0; i < data.length; i++){
                cat_name = data[i].cat_name;
                cat_underscore = get_cat_under(cat_name);
                noms = data[i].noms;
                short_class = '';
                
                if (noms.length < 4 && data.length > 1){
                    short_class = 'short';
                }
                cat_html =  '<div class="top_nom_cat ' + short_class + '">' +
                                '<div class="top_cat_heading nom_cat_' + cat_underscore + '">' +
                                    '<h2>' +
                                        cat_name + 
                                    '</h2>' +
                                    '<div class="clear"></div>' +
                                '</div>' +
                                '<div class="top_nom_cat_cont"><p class="tooltip"></p>';

                for (var j = 0; j < noms.length; j++){
                    nom = noms[j];

                    cat_html += '<div class="top_cat_photo_cont nomination_id" value="' + nom.id + '" name="Votes: ' + nom.vote_count + '">' +
                                    '<a href="/#!/' + selected_user.username + '/trophies/' + cat_name.replace(' ', '-') + '/">' +
                                        '<img src="' + nom.photo.crop + '"/>' +
                                    '</a>' +
                                '</div>';
                }
                cat_html += '<div class="clear"></div></div></div>';
                $('#user_trophy_cont').append(cat_html);
            }
            $('#user_trophy_cont').append('<div class="clear"></div>');
        }
        else{
            var empty_text = '';
            if (me && me.id == selected_user.fid){
                empty_text = 'You have not won any trophies yet.';
            }
            else{
                empty_text = selected_user.username + ' has not won any trophies yet.';
            }
            
            var empty_html ='<div id="user_trophy_cont">' +
                                '<div id="cont_empty">' +
                                    '<h2>' + empty_text + '<h2>' +
                                '</div>' +
                            '</div>';
            $('#profile_user_context').append(empty_html);
        }
    }
    
    function render_profile_follow(data, method){
        var follow_html = '';
        var follow_button = '';
        var data = data.data;
        
        $('#profile_user_context').append('<h2>' + capitaliseFirstLetter(method) + '</h2><div id="follow_cont"></div>');
        if (data.length > 0){
            for (var i = 0; i < data.length; i++){
                if (public_view){
                    follow_button = '';
                }
                else if (data[i].fid == me.id){
                    follow_button = '<h3>You</h3>';
                }
                else if (data[i].follow){
                    follow_button = '<span class="sick large green follow" value="follow" target="' + data[i].username + '">Follow</span>';
                }
                else{
                    follow_button = '<span class="sick large red follow" value="unfollow" target="' + data[i].username + '">Unfollow</span>';
                }
                follow_html =   '<div class="follow_wrap" value="' + data[i].username + '">' +
                                    '<img src="https://graph.facebook.com/' + data[i].fid + '/picture?type=square"/>' +
                                    '<h3>' + data[i].username + '</h3>' +
                                    '<div class="user_stats_cont">' +
                                        '<div class="follow_photos"><h4>Photos</h4><p>' + data[i].photo_count + '</p></div>' +
                                        '<div class="follow_trophies"><h4>Trophies</h4><p>' + data[i].trophy_count + '</p></div>' +
                                        '<div class="follow_active"><h4>Active</h4><p>' + data[i].active_count + '</p></div>' +
                                        '<div class="follow_button_cont">' +
                                            follow_button + 
                                        '</div>' +
                                    '</div>' +
                                '</div>';

                $('#follow_cont').append(follow_html);
            }
        }
        else{
            var follow_selected = $('.follow_nav.selected').attr('name');
            
            var empty_html = '';
            if (me && me.id == selected_user.fid){
                empty_html = '<h2>You have no ' + follow_selected + '.</h2>';
            }
            else{
                empty_html = '<h2>' + selected_user.username + ' has no ' + follow_selected + '</h2>';
            }
            
            $('#follow_cont').append(empty_html);
        }
    }
    
    function init_profile_photos(){
        $('#profile_user_context').html('');
        render_user_photos(user_profile_data.photos);
    }
    
    function get_more_profile_photos(pid){
        var access_token = '';
        if (fb_session){
            access_token = fb_session.access_token;
        }
        
        scroll_loading = true;
        append_load($('#user_photo_cont'), 'light');

        $.getJSON('/api/get_user_profile/', {'access_token': access_token, 
                                            'username': selected_user.username, 
                                            'method': 'photos',
                                            'dir': 'old',
                                            'pid': pid,
                                            'page_size': 20}, 
        function(data){
            scroll_loading = false;
            remove_load();
            if (data.photos.length > 0){
                for (var i = 0; i < data.photos.length; i++){
                    selected_user.photos.push(data.photos[i]);
                }
                render_user_photos(data.photos, true);
            }
        });
    }
    
    function load_more_user_photos(pid, dir){
        var access_token = '';
        if (fb_session){
            access_token = fb_session.access_token;
        }
        
        var vars = {
            'access_token': access_token,
            'method': 'photos',
            'dir': dir,
            'pid': pid,
            'page_size': 20
        };
        if (dir == 'old'){
            $.getJSON('/api/get_user_profile/', vars, function(data){
                if (data.photos.length > 0){
                    //Append Photos
                    for (var i = 0; i < data.photos.length; i++){
                        selected_user.photos.push(data.photos[i]);
                    }
                    $('#gallery_next_cont').attr('value', data.photos[0].id);
                    $('#gallery_next_cont').html('<img src="' + data.photos[0].crop + '"/>');
                }
                else{
                    selected_user.photos[selected_user.photos.length - 1].end = true;
                    $('#gallery_next_cont').html('<h4>Last</h4>');
                }
            });
        }
        else if (dir == 'new'){
            $.getJSON('/api/get_user_profile/', vars, function(data){
                if (data.photos.length > 0){
                    //Insert Photos
                    for (var i = 0; i < data.photos.length; i++){
                        selected_user.photos.unshift(data.photos[i]);
                    }
                    $('#gallery_prev_cont').attr('value', data.photos[0].id);
                    $('#gallery_prev_cont').html('<img src="' + data.photos[0].crop + '"/>');
                }
                else{
                    selected_user.photos[0].end = true;
                    $('#gallery_prev_cont').html('<h4>First</h4>');
                }
            });
        }
    }
    
    function init_profile_trophies(){
        $('#profile_user_context').html('');
        if (!user_profile_data.trophies){
            var access_token = '';
            if (fb_session){
                access_token = fb_session.access_token;
            }
            append_load($('#profile_user_context'), 'light');
            $.getJSON('/api/get_user_trophies/', {'access_token': access_token, 'target': selected_user.fid}, function(data){
                remove_load();
                user_profile_data.trophies = data;
                render_user_trophies(user_profile_data.trophies);
            });
        }
        else{
            render_user_trophies(user_profile_data.trophies);
        }
    }
    
    function init_profile_active(){
        $('#profile_user_context').html('<div id="profile_active_cont"><div id="top_right_cont"></div><div id="recent_left_cont"></div><div class="clear"></div></div>');
        if (!user_profile_data.active_noms){
            var access_token = '';
            if (fb_session){
                access_token = fb_session.access_token;
            }
            append_load($('#recent_left_cont'), 'light');
            $.getJSON('/api/get_user_profile/', {'access_token': access_token, 'username': selected_user.username, 'method': 'active'}, function(data){
                remove_load();
                user_profile_data.active_noms = data.active_noms;
                if (user_profile_data.active_noms.length > 0){
                    render_recent_stream(user_profile_data.active_noms, $('#recent_left_cont'));
                }
                else{
                    var empty_text = '';
                    if (me && me.id == selected_user.fid){
                        empty_text = 'You have no active nominations.';
                    }
                    else{
                        empty_text = selected_user.name + ' has no active nominations.';
                    }
                    $('#recent_left_cont').append('<div id="cont_empty"><h2>' + empty_text + '</h2></div>');                    
                }
            });
        }
        else{
            if (user_profile_data.active_noms.length > 0){
                render_recent_stream(user_profile_data.active_noms, $('#recent_left_cont'));
            }
            else{
                var empty_text = '';
                if (me && me.id == selected_user.fid){
                    empty_text = 'You have no active nominations.';
                }
                else{
                    empty_text = selected_user.username + ' has no active nominations.';
                }
                $('#recent_left_cont').append('<div id="cont_empty"><h2>' + empty_text + '</h2></div>');
            }
        }
    }
    
    function init_profile_settings(){
        $('#profile_user_context').html('');
        
        var setttings_html = '';
        
        var allow_public_follows_checked_class = 'switch_off';
        var allow_portrit_album_checked_class = 'switch_off';
        var email_on_follow_check_class =  'switch_off';
        var email_on_nomination_check_class = 'switch_off';
        var email_on_win_check_class = 'switch_off';
        var twitter_switch = 'switch_off';
        
        if (allow_public_follows){
            allow_public_follows_checked_class = 'switch_on';
        }
        if (allow_portrit_album){
            allow_portrit_album_checked_class = 'switch_on';
        }
        if (email_on_follow){
            email_on_follow_check_class = 'switch_on';
        }
        if (email_on_nomination){
            email_on_nomination_check_class = 'switch_on';
        }
        if (email_on_win){
            email_on_win_check_class = 'switch_on';
        }
        
        if (email && email.length > 30){
            email = email.slice(0, 30) + '...';
        }
        
        if (twitter_access_token){
            twitter_switch = 'switch_on';
        }
        
        setttings_html = '<div id="settings_cont">' +
                            '<h1>Settings</h1>' +
                            '<div class="sub_setting_cont">' +
                                '<div style="border-bottom: 1px solid #bebebe;">' +
                                    '<div id="allow_public_follows" value="privacy" class="switch ' + allow_public_follows_checked_class + '"></div>' +
                                    '<div class="center_twin">' +
                                        '<label for="allow_public_follows">Allow anyone to follow you: </label>' +
                                        '<p class="sub_label">Turning this off will require you to accept new followers.</p>' +
                                    '</div>' +
                                    '<div class="clear"></div>' +
                                '</div>' +
                                '<div>' +
                                    '<div id="allow_portrit_album" value="post_wins" class="switch ' + allow_portrit_album_checked_class + '"></div>' +
                                    '<div class="center_twin">' +
                                        '<label for="allow_portrit_album">Allow Portrit to post winning trophies back to Facebook: </label>' +
                                        '<p class="sub_label">This will create a Portrit Trophies photo album on your Facebook.</p>' +
                                    '</div>' +
                                    '<div class="clear"></div>' +
                                '</div>' +
                            '</div>' +
                            '<h1 class="half">Email Notifications</h1>' +
                            '<h1 class="half" style="width: 430px; padding-left: 20px;">Linked Accounts</h1>' +
                            '<div class="sub_setting_cont_half sharing_cont" style="float: right;">' +
                                '<div style="border-bottom: 1px solid #bebebe;">' +
                                    '<img src="http://portrit.s3.amazonaws.com/img/f_logo.png"/>' +
                                    '<label for="sharing_facebook">Facebook: </label>' +
                                    '<div id="sharing_facebook" style="margin-top: 10px;" value="sharing_facebook" class="switch switch_on"></div>' +
                                    '<div class="clear"></div>' +
                                '</div>' +
                                '<div>' +
                                    '<img src="http://portrit.s3.amazonaws.com/img/twitter_logo.png"/>' +
                                    '<label for="sharing_twitter">Twitter: </label>' +
                                    '<div id="twitter_login"></div>' +
                                    '<div id="sharing_twitter" style="margin-top: 10px;" value="sharing_twitter" class="switch ' + twitter_switch + '"></div>' +
                                    '<div class="clear"></div>' +
                                '</div>' +
                            '</div>' +
                            '<div class="sub_setting_cont_half" style="margin-right: 36px; border: 1px solid #dedede">' +
                                '<div class="user_email_cont">' +
                                    '<label class="single_line" for="email_on_follow">Email Address: </label>' +
                                    '<p>' + email + '</p>' +
                                '</div>' +
                            '</div>' +
                            '<div class="sub_setting_cont_half" style="margin-right: 36px;">' +
                                '<div style="border-bottom: 1px solid #bebebe;">' +
                                    '<div id="email_on_follow" value="email_follow" class="switch ' + email_on_follow_check_class + '"></div>' +
                                    '<label class="single_line" for="email_on_follow">Notify on new follow:</label>' +
                                    '<div class="clear"></div>' +
                                '</div>' +
                                '<div style="border-bottom: 1px solid #bebebe;">' +
                                    '<div id="email_on_nomination" value="email_nomination" class="switch ' + email_on_nomination_check_class + '"></div>' +
                                    '<label class="single_line" for="email_on_nomination">Notify on new nomination:</label>' +
                                    '<div class="clear"></div>' +
                                '</div>' +
                                '<div>' +
                                    '<div id="email_on_win" value="email_win" class="switch ' + email_on_win_check_class + '"></div>' +
                                    '<label class="single_line" for="email_on_win">Notify on winning nomination:</label>' +
                                    '<div class="clear"></div>' +
                                '</div>' +
                            '</div>' +
                            '<div class="clear"></div>' +
                        '</div>';
                            
        $('#profile_user_context').append(setttings_html);
        
        // twttr.anywhere(function (T) {
        //     if (!T.isConnected()) {
        //         T("#twitter_login").connectButton({ 
        //             size: "large",
        //             authComplete: function(user, bridge_code){
        //                 $.post('/convert_twitter_bridge/', {'bridge_code': bridge_code}, function(data){
        //                     
        //                 });
        //                 var test = user;
        //             },
        //             signOut: function(){
        // 
        //             }
        //         });
        //     }
        //     else{
        //         $("#twitter_login").append('<button id="twitter_signout" type="button">Sign out of Twitter</button>');
        // 
        //         $("#twitter_signout").bind("click", function () {
        //             twttr.anywhere.signOut();
        //         });
        //     }
        // });
    }
    
    function init_profile_follow(method){
        var access_token = '';
        if (fb_session){
            access_token = fb_session.access_token;
        }
        $('#profile_user_context').html('');
        append_load($('#profile_user_context'), 'light');
        $.getJSON('/api/get_follow_data_detailed/', {'access_token': access_token, 'target': selected_user.fid, 'method': method, 'all': true}, function(data){
            remove_load();
            render_profile_follow(data, method);
        });
    }
    
    var user_profile_data = null;
    function init_profile_view(view_to_activate){
        var my_profile = false,
            user_profile_img_src = '',
            user_settings = '',
            name = '',
            aka = '';
        
        if ($('#user_profile_cont').length == 0){
            stream_view = 'profile_user';
            user_profile_data = null;
            $('.stream_nav, .sub_stream_nav').removeClass('selected');
            if (me && me.username == selected_user.username){
                $('#activate_profile').addClass('selected');
                stream_view = 'profile';
                my_profile = true;
                name = 'You';
                aka = 'AKA ' + me.username;
                user_profile_img_src = '<img src="https://graph.facebook.com/' + me.id + '/picture?type=large"/>';
                user_settings = '<li>' +
                                    '<h2 id="profile_settings" class="sub_stream_nav" name="profile_settings">Settings</h2>' +
                                '</li>';
            }
            var profile_html ='<div id="profile">' +
                                    '<div id="profile_header">' +
                                        '<h1>Profile</h1>' +
                                    '</div>' +
                                    '<div id="user_profile_cont">' +
                                        '<div id="profile_user_header">' +
                                            '<div id="user_profile_image">' +
                                                user_profile_img_src +
                                            '</div>' +
                                            '<div id="profile_nav_cont">' +
                                                '<h2 id="profile_user_name">' + name + '</h2>' +
                                                '<h3 id="profile_user_username">' + aka + '</h3>' +
                                                '<div class="stream_nav_cont">' +
                                                    '<ul>' +
                                                        user_settings + 
                                                        '<li>' +
                                                            '<h2 id="profile_active" class="sub_stream_nav" name="profile_active">Active</h2>' +
                                                        '</li>' +
                                                        '<li>' +
                                                            '<h2 id="profile_trophies" class="sub_stream_nav" name="profile_trophies">Trophies</h2>' +
                                                        '</li>' +
                                                        '<li>' +
                                                            '<h2 id="profile_photos" class="sub_stream_nav" name="profile_photos">Photos</h2>' +
                                                        '</li>' +
                                                        '<div class="clear"></div>' +
                                                    '</ul>' +
                                                '</div>' +
                                            '</div>' +
                                            '<div id="profile_stats_cont">' +
                                                '<div id="profile_followers_count_cont" class="follow_nav" name="followers">' +
                                                    '<h4>Followers</h4>' +
                                                    '<h3></h3>' +
                                                '</div>' +
                                                '<div id="profile_following_count_cont" class="follow_nav" name="following">' +
                                                    '<h4>Following</h4>' +
                                                    '<h3></h3>' +
                                                '</div>' +
                                            '</div>' +
                                        '</div>' +
                                        '<div id="profile_user_context">' +
                                            '' +
                                        '</div>' +
                                    '</div>' +
                                '</div>';

            $('#profile_cont_wrap').append(profile_html);
            append_load($('#profile_user_context'), 'light');
            var access_token = '';
            if (fb_session){
                access_token = fb_session.access_token;
            }
            $.getJSON('/api/get_user_profile/', {'access_token': access_token, 'username': selected_user.username, 'page_size': 30}, function(data){
                remove_load();
                if (data.user.username != null){
                    selected_user = data.user;
                    user_profile_data = data;
                    render_user_profile(data);
                    selected_user.photos = data.photos;
                    if (view_to_activate == 'photos'){
                        init_profile_photos();
                    }
                    else if (view_to_activate == 'trophies'){
                        init_profile_trophies();
                    }
                    else if (view_to_activate == 'active'){
                        init_profile_active();
                    }
                    else if (view_to_activate == 'settings'){
                        init_profile_settings();
                    }
                    else if (view_to_activate == 'following' || view_to_activate == 'followers'){
                        init_profile_follow(view_to_activate);
                    }
                }
                else{
                    raise_404();
                }
            });
        }
        else{
            if (view_to_activate == 'photos'){
                init_profile_photos();
            }
            else if (view_to_activate == 'trophies'){
                init_profile_trophies();
            }
            else if (view_to_activate == 'active'){
                init_profile_active();
            }
            else if (view_to_activate == 'settings'){
                init_profile_settings();
            }
            else if (view_to_activate == 'following' || view_to_activate == 'followers'){
                init_profile_follow(view_to_activate);
            }
        }
        attach_profile_handlers();
    }
    
    function attach_profile_handlers(){
        $('#profile_stats_cont > div').live('click', function(){
            var name = $(this).attr('name');
            if (name == 'followers'){
                window.location.href = '#!/' + selected_user.username + '/followers/';
            }
            else if (name == 'following'){
                window.location.href = '#!/' + selected_user.username + '/following/';
            }
        });
        
        $('.user_photo_wrap a').live('click', function(){
            selected_photo = $(this).attr('value');
        });
        
        $('.follow_wrap').live('click', function(){
            var username = $(this).attr('value');
            stream_view = '';
            window.location.href = '/#!/' + username + '/';
        });
        
        $('.user_photo_wrap').live('mouseover mouseout', function(event) {
            if (event.type == 'mouseover') {
                show_tooltip(this);
            } else {
                hide_tooltip(this);
            }
        });
    }
    
    var date = new Date();
    var month = date.getMonth();
    var todays_date = date.getDate();
    var todays_year = date.getFullYear();
    var dateFuture = null;
    if (date.getHours() >= 23){
        dateFuture = new Date(todays_year,month,todays_date+1,23,0,0);
    }
    else{
        dateFuture = new Date(todays_year,month,todays_date,23,0,0);
    }
    tzOffset = -8;
    dx = dateFuture.toGMTString();
    dx = dx.substr(0,dx.length -3);
    tzCurrent=(dateFuture.getTimezoneOffset()/60)*-2;
    dateFuture.setTime(Date.parse(dx))
    dateFuture.setHours(dateFuture.getHours() + tzCurrent - tzOffset);
    
    function GetCount(target){
    	dateNow = new Date();									//grab current date
    	amount = dateFuture.getTime() - dateNow.getTime();		//calc milliseconds between dates
    	delete dateNow;
    	// time is already past
    	if(amount <= 1){
    	    var date = new Date();
    	    var month = date.getMonth();
            var todays_date = date.getDate();
            var todays_year = date.getFullYear();
            if (date.getHours() >= 23){
                dateFuture = new Date(todays_year,month,todays_date+1,23,0,0);
            }
            else{
                dateFuture = new Date(todays_year,month,todays_date,23,0,0);
            }
            tzOffset = -8;
            dx = dateFuture.toGMTString();
            dx = dx.substr(0,dx.length -3);
            tzCurrent=(dateFuture.getTimezoneOffset()/60)*-2;
            dateFuture.setTime(Date.parse(dx))
            dateFuture.setHours(dateFuture.getHours() + tzCurrent - tzOffset);
            
            if ($('#winners_announced_cont').length == 0){
                $('#cont').prepend('<div id="winners_announced_cont"><h2>Winners are being calculated. Check back in a few minutes.</h2></div>')
            }
    	}
		days=0;hours=0;mins=0;secs=0;out="";

		amount = Math.floor(amount/1000);//kill the "milliseconds" so just secs

		days=Math.floor(amount/86400);//days
		amount=amount%86400;

		hours=Math.floor(amount/3600);//hours
		amount=amount%3600;

		mins=Math.floor(amount/60);//minutes
		amount=amount%60;

		secs=Math.floor(amount);//seconds

        // if(days != 0){out += days +":";}
		if(days != 0 || hours != 0){out += hours +"h:";}
		if(days != 0 || hours != 0 || mins != 0){out += mins +"m:";}
		out += secs + 's';
		$('#time_countdown').text(out);

		setTimeout("GetCount()", 1000);
    }
    
    function render_countdown_clock(){
        if ($('#countdown_cont').length == 0){
            $('#profile_wrap > ul > .clear').before('<li id="countdown_cont"><div><h1>Time Remaining</h1><p></p><h2 id="time_countdown"></h2></h1></div></li>');
        }
        GetCount();
    }
    
    var expand_timeout = null;
    function show_tooltip(that){
        var tooltip_that = this;
        $('.tooltip:visible').css({
            'top': '0px', 
            'opacity': '0'
        });

        var name = $(that).attr('name');
        if (name && name != ''){
            var left = $(that).position().left + (($(that).outerWidth() - $('.tooltip').width()) / 2) - 4;
            var top = $(that).position().top - 30;
            $(that).parent().find('.tooltip').html(name + '<span class="tooltip_arrow"></span>').css({
                'top': top,
                'left': left, 
                'width': '150px',
                'opacity': '1.0',
                'z-index': '100'
            });
        }
    }
    
    function hide_tooltip(that){
        $(that).parent().find('.tooltip').css({
            'opacity': '0',
            'z-index': '-1'
        });
    }
    
    function show_public_tooltip(that){
        $('.public_tooltip:visible').css({
            'top': '0px', 
            'opacity': '0'
        });

        var name = 'Login Required';
        var left = $(that).offset().left + (($(that).outerWidth() - $('.public_tooltip').width()) / 2) - 4;
        var top = $(that).offset().top - 136;
        $('.public_tooltip').html(name + '<span class="tooltip_arrow"></span>').css({
            'top': top,
            'left': left, 
            'width': '150px',
            'opacity': '1.0',
            'z-index': '100'
        });
    }
    
    function hide_public_tooltip(that){
        $('.public_tooltip').css({
            'opacity': '0',
            'z-index': '-1'
        });
    }
    
    function render_more_comments(comments, cont){
        $(cont).find('.comment').remove();
        var name = '',
            comment_cont_html = '',
            time = null,
            now = null;
            
        for (var i = 0; i < comments.length; i++){
            name = '';
            time = null;
            now = null;
            if (comments[i].owner_id == me.id){
                name = 'You';
            }
            else {
                name = comments[i].owner_username;
            }
            now = new Date();
            time = new Date(comments[i].create_datetime * 1000);
            now -= time;
            now /= 1000;
            var time_str = secondsToHms(parseInt(now));

            comment_cont_html +='<div class="comment">' +
                                    '<p class="comment_time" value="' + comments[i].create_datetime + '">' + time_str + '</p>' +
                                    '<a href="#!/' + comments[i].owner_username + '">' +
                                        '<img class="user_photo" src="https://graph.facebook.com/' + comments[i].owner_id + '/picture?type=square"/>' +
                                    '</a>' +
                                    '<a href="#!/' + comments[i].owner_username + '" class="post_username from_username">' + name +'</a>' +
                                    '<p>' + comments[i].comment + '</p>' +
                                '</div>';
        }
        $(cont).find('.recent_nom_comment_heading').after(comment_cont_html);
    }
    
    function load_more_comments_handler(){
        var nom_id = $(this).attr('value');
        var that = this;
        
        $.getJSON('/api/get_comments/', {'nom_id': nom_id}, function(data){
            if (data.length > 0){
                render_more_comments(data, $('#nom_comments_' + nom_id));
            }
            $(that).remove();
        });
    }
    
    function hide_more_comments_handler(){
        var comment_cont = $(this).prev().prev();
        $(comment_cont).css({
            'min-height': ''
        });
        var comment_count = $(comment_cont).children().length - 2;
        $(comment_cont).children().filter(':lt(' + comment_count + ')').remove();
        
        $(this).text('Load More Comments').removeClass('hide_more_comments').addClass('load_more_comments');
    }
    
    function add_comment_peek_handler(){
        var comment_add_html = '<div class="comment_form_cont" style="display: none;">' +
                                    '<div class="comment_top_head">' +
                                        '<a class="submit_comment sick large" name="' + $(this).attr('value') + '">Post</a>' +
                                        '<a class="cancel_comment sick large">Close</a>' +
                                    '</div>' +
                                    '<textarea id="new_comment_body" class="comment_body"></textarea></div>' +
                               '</div>';
        if ($(this).parent().find('.comment_form_cont').length == 0){
            $(this).parent().append(comment_add_html);
            var parent = $(this).parent();
            if (mobile === false){
                $(parent).find('.comment_form_cont').slideDown(function(){
                    $(this).find('.comment_body').focus();
                });
            }
            else{
                $(parent).find('.comment_form_cont').show().find('.comment_body').focus();
            }
            $(this).hide();
            if ($(this).next().hasClass('load_more_comments')){
                $(this).next().hide();
            }
        }
    }
    
    function cancel_comment_handler(){
        var parent = $(this).parent().parent();
        if (!mobile){
            $(parent).slideUp(function(){
                $(parent).prev().show();
                $(parent).prev().prev().show();
                $(this).remove();
            });
        }
        else{
            $(parent).prev().show();
            $(parent).prev().prev().show();
            $(parent).remove();
        }
        return false;
        
        if (typeof(_gaq) !== "undefined"){
            _gaq.push(['_trackEvent', 'Comment', 'Cancelled', '']);
        }
    }
    
    function vote_up_handler(){
        var that = this;
        var nomination_id = $(this).attr('value');
        
        if ($(this).hasClass('won') == false){
            if (tut_on){
                update_tut('vote');
            }
            var vote_profile_pic_html = '<a href="/#!/' + me.username + '/" id="voted_' + me.id + '" name="' + me.username + '">' +
                                            '<img src="https://graph.facebook.com/' + me.id + '/picture?type=square"/>' +
                                        '</a>';
            $('#nom_votes_wrap').append(vote_profile_pic_html);
            $.post('/api/vote_on_nomination/', {'direction': 'up', 'nomination_id': nomination_id, 'access_token': fb_session.access_token}, function(data){
                if (data){
                    var vote_count_elm = $(that).parent().children().filter('p');
                    $(vote_count_elm).text(data.vote_count);
                    if (nom_cache[nomination_id]){
                        nom_cache[nomination_id].vote_count = data.vote_count;
                        nom_cache[nomination_id].votes.push({'vote_user': me.id, 'vote_name': me.name, 'vote_username': me.username});
                    }
                    $('#nom_vote_count').text(data.vote_count);
                }
            });
            vote_tooltip_on = false;
            $('#vote_tooltip').fadeOut();
            if (typeof(_gaq) !== "undefined"){
                _gaq.push(['_trackEvent', 'Vote', 'Up', '']);
            }
            $('.vote').addClass('won');
        }
    }
    
    function vote_down_handler(){
        var that = this;
        var nomination_id = $(this).attr('value');
        if ($(this).hasClass('won') == false){
            if (tut_on){
                update_tut('vote');
            }
            var vote_profile_pic_html = '<a href="#!/' + me.username + '" id="voted_' + me.id + '" name="' + me.username + '">' +
                                            '<img src="https://graph.facebook.com/' + me.id + '/picture?type=square"/>' +
                                        '</a>';
            $('#nom_votes_wrap').append(vote_profile_pic_html);
            $.post('/api/vote_on_nomination/', {'direction': 'down', 'nomination_id': nomination_id, 'access_token': fb_session.access_token}, function(data){
                if (data){
                    var vote_count_elm = $(that).parent().children().filter('p');
                    $(vote_count_elm).text(data.vote_count);
                    if (nom_cache[nomination_id]){
                        nom_cache[nomination_id].vote_count = data.vote_count;
                        nom_cache[nomination_id].votes.push({'vote_user': me.id, 'vote_name': me.name, 'vote_username': me.username});
                    }
                    $('#nom_vote_count').text(data.vote_count);
                }
            });
            $('#vote_tooltip').fadeOut();
            vote_tooltip_on = false;
            if (typeof(_gaq) !== "undefined"){
                _gaq.push(['_trackEvent', 'Vote', 'Down', '']);
            }
            $('.vote').addClass('won');
        }
    }
    
    $('#close_overlay').live('click', close_context_overlay);
    
    function close_context_overlay(concurrent, instant){
        disable_search = false;
        var that = this;
        $('#tab_nav > .selected').removeClass('selected');
        if (!mobile){
            if (typeof(concurrent) !== "undefined" && concurrent == true){
                $('#context_overlay').hide();
                $('#context_overlay_cont').removeClass();
                $('#context_overlay_cont > div').html('');
            }
            else{
                $('#wrapper').css({
                    'opacity': 1.0
                });
                $('#context_overlay').hide();
                $('#context_overlay_cont').removeClass();
                $('#context_overlay_cont > div').html('');
            }
        }
        else{
            $('#wrapper').css('opacity', 1.0);
            $('#context_overlay').hide();
            $('#context_overlay_cont').removeClass();
            $('#context_overlay_cont > div').html('');
        }
        $('#wrapper').css('min-height', '');
    }
    
    function show_context_overlay(darken, instant){
        disable_search = true;
        $('#close_overlay').removeClass().addClass('close_img ' + close_size);
        if (!mobile){
            if (typeof(darken) !== "undefined"){
                if (typeof(instant) !== "undefined"){
                    $('#wrapper').css({
                        'opacity': 0.3
                    });
                    $('#context_overlay').show();
                }
                else{
                    $('#wrapper').animate({
                        'opacity': 0.3
                    }, 300);
                    $('#context_overlay').fadeIn();
                }
            }
        }
        else{
            if (typeof(darken) !== "undefined"){
                $('#wrapper').css('opacity', 0.3);
            }
            $('#context_overlay').show();
        }
        var scroll_pos = $(window).scrollTop();
        var window_height = $(window).height();
        var context_height = $('#context_overlay').height();
        var offset = 0;
        offset = scroll_pos + (window_height - context_height) / 2;
        if (window_height - context_height < 0){
            offset = scroll_pos + 25;
        }
        $('#context_overlay').css({
            'top': offset
        });
    }
    
    var selected_result_index = 0;
    var result_length = 0;
    function render_search_results(data){
        var following_first = true;
        var community_first = true;
        var follow_html = '';
        
        selected_result_index = 0;
        
        $('#results').append('<div id="results_wrap"></div>');
        result_length = data.length;
        selected_result_index = -1;
        if (data.length > 0){
            for (var i = 0; i < data.length; i++){
                if (!me || me.id != data[i].fid){
                    follow_html = '';
                    if (following_first && data[i].following == true){
                        following_first = false;
                        follow_html = '<div id="search_following_header"><h2>Following</h2></div>';
                    }
                    else if (community_first && data[i].following == false){
                        community_first = false;
                        follow_html = '<div id="search_community_header"><h2>Community</h2></div>';
                    }

                    follow_html +=  '<div class="search_result_cont" username="' + data[i].username + '">' +
                                        '<div class="user_trophy_cont">' +
                                            '<div class="trophy_img_cont">' +
                                                '<div class="trophy_img medium blank"></div>' +
                                            '</div>' +
                                            '<div class="trophy_count">' +
                                                '<h1>' + data[i].wins + '</h1>' +
                                            '</div>' +
                                        '</div>' +
                                        '<img class="user_profile_photo" src="https://graph.facebook.com/' + data[i].fid + '/picture?type=square"/>' +
                                        '<h3>' + data[i].name + '</h3>' +
                                        '<h4>aka ' + data[i].username + '</h4>' +
                                        '<div class="clear"></div>' +
                                    '</div>';

                    $('#results_wrap').append(follow_html);
                }
            }
        }
        else{
            
        }
    }
    
    function search_keyboard_press(direction){
        if (direction == 'up'){
            if (selected_result_index >= 0){
                selected_result_index -= 1;
                $('.search_result_cont').removeClass('selected');
                $('.user_trophy_cont').removeClass('active');
                $('.search_result_cont:eq(' + selected_result_index + ')').addClass('selected');
                $('.search_result_cont:eq(' + selected_result_index + ')').find('.user_trophy_cont').addClass('active');
            }
        }
        else if (direction == 'down'){
            if (selected_result_index < result_length){
                selected_result_index += 1;
                $('.search_result_cont').removeClass('selected');
                $('.user_trophy_cont').removeClass('active');
                $('.search_result_cont:eq(' + selected_result_index + ')').addClass('selected');
                $('.search_result_cont:eq(' + selected_result_index + ')').find('.user_trophy_cont').addClass('active');
            }
        }
    }
    
    function search_select(){
        if (selected_result_index >= 0 && selected_result_index < result_length){
            $('.search_result_cont:eq(' + selected_result_index + ')').click();
        }
    }
    
    var query_cache = { };
    var prev_query = '';
    var scroll_loading = false;
    function attach_main_handlers(){
        $('.notification_pending_cont span').live('click', function(){
            var value = $(this).attr('value');
            var notification_id = $(this).parent().attr('value');
            
            if (value == 'accept'){
                value = 1;
            }
            else{
                value = 0;
            }
            
            $('#notification_' + notification_id).fadeOut();
            
            $.post('/api/follow_permission_submit/', {'access_token': fb_session.access_token, 'notification_id': notification_id, 'value': value}, function(){
                
            });
            
            return false;
        });
        
        $('#query').live('keyup', function(){
            var value = $(this).attr('value');
            var data = null;
            
            if (query_cache[value] == undefined && value != '' && prev_query != value){
                var access_token = '';
                if (fb_session){
                    access_token = fb_session.access_token;
                }
                var results_height = $('#results').height() - 20;
                var results_width = $('#results').width();
                $('#results').append('<div class="loading" style="height: ' + results_height + 'px; width: ' + results_width + 'px;"></div>');
                $.getJSON('/api/combined_search/', {'access_token': access_token, 'query': value}, function(data){
                    $('#results').html('');
                    query_cache[value] = data;
                    render_search_results(data);
                });
            }
            else if (value != '' && prev_query != value){
                $('#results').html('');
                render_search_results(query_cache[value]);
            }
            else if (prev_query != value){
                $('#results').html('');
            }
            prev_query = value;
        });
        
        $('.search_result_cont').live('mouseover mouseout', function(event) {
            selected_result_index = 0;
            $('.search_result_cont').removeClass('selected');
            if (event.type == 'mouseover') {
                $(this).find('.user_trophy_cont').addClass('active');
                $(this).addClass('selected');
                selected_result_index = $('.search_result_cont').index(this);
            } else {
                $(this).find('.user_trophy_cont').removeClass('active');
                // selected_result_index = -1;
            }
        });
        
        $('.search_result_cont').live('click', function(){
            var username = $(this).attr('username');
            
            if (username){
                window.location.href = '/#!/' + username + '/';
            }
        });
        
        $('.add_comment_peek').live('click', add_comment_peek_handler);
        
        $('.load_more_comments').live('click', load_more_comments_handler);
        
        $('.hide_more_comments').live('click', hide_more_comments_handler);
        
        $('.cancel_comment').live('click', cancel_comment_handler);
        
        $('.photo_post a').live('click', function(){
            $('#photo_list').html('');
            albums = null;
        });
        
        $('.nomination_id').live('click', function(){
            selected_nom = $(this).attr('value');
        });
        
        $('.vote_up').live('click', vote_up_handler);
        
        $('.vote_down').live('click', vote_down_handler)
        
        $('.stream_nav').live('click', function(){
            var view_name = $(this).attr('name');
            
            if ($(this).hasClass('selected') == false){
                $('.stream_nav').removeClass('selected');
                $(this).addClass('selected');
                
                if (view_name == 'stream'){
                    stream_nav_click();
                }
                else if (view_name == 'community'){
                    community_nav_click();
                }
                else if (view_name == 'profile'){
                    profile_nav_click();
                }
            }
        });
        
        $('.sub_stream_nav').live('click', function(){
            var view_name = $(this).attr('name');
            if ($(this).hasClass('selected') == false){
                $('.sub_stream_nav').removeClass('selected');
                $(this).addClass('selected');
                
                // Stream
                if (view_name == 'stream_photos'){
                    window.location.href = '#!/photos/';
                }
                else if (view_name == 'stream_active'){
                    window.location.href = '#!/';
                }
                else if (view_name == 'stream_winners'){
                    window.location.href = '#!/winners/';
                }
                
                // Community
                if (view_name == 'community_active'){
                    window.location.href = '#!/community/';
                }
                else if (view_name == 'community_photos'){
                    window.location.href = '#!/community/photos/';
                }
                else if (view_name == 'community_top'){
                    window.location.href = '#!/community/top/';
                }
                
                // Profile
                if (view_name == 'profile_photos'){
                    window.location.href = '#!/' + selected_user.username;
                }
                else if (view_name == 'profile_trophies'){
                    window.location.href = '#!/' + selected_user.username + '/trophies/';
                }
                else if (view_name == 'profile_active'){
                    window.location.href = '#!/' + selected_user.username + '/active/';
                }
                else if (view_name == 'profile_settings'){
                    window.location.href = '#!/' + selected_user.username + '/settings/';
                }
            }
        });
        
        $('.top_cat_photo_cont').live('mouseover mouseout', function(event) {
            if (event.type == 'mouseover') {
                show_tooltip(this);
            } else {
                hide_tooltip(this);
            }
        });
        
        $('.community_photo_cont').live('mouseover mouseout', function(event) {
            if (event.type == 'mouseover') {
                show_tooltip(this);
            } else {
                hide_tooltip(this);
            }
        });
        
        $('.voted_cont a, .new_photo_cont').live('mouseover mouseout', function(event) {
            if (event.type == 'mouseover') {
                show_tooltip(this);
            } else {
                hide_tooltip(this);
            }
        });
        
        $('.next_photo').live('click', function(){
            var selected = $(this).parent().prev().children().filter('[name="selected"]');
            $(selected).next().click();
        });
        
        $('.prev_photo').live('click', function(){
            var selected = $(this).parent().prev().children().filter('[name="selected"]');
            $(selected).prev().click();
        });
        
        $('#settings_cont .switch').live('click', function(e){
            var permission = '';
            var value = '';
            var value_bool = false;
            
            permission = $(this).attr('value');
            if ($(this).hasClass('switch_on')){
                value = 1;
                value_bool = true;
            }
            else{
                value = 0;
                value_bool = false;
            }
            
            if (permission == 'privacy'){
                allow_public_follows = value_bool;
            }
            else if (permission == 'post_wins'){
                allow_portrit_album = value_bool
            }
            
            if (permission == 'sharing_facebook'){
                e.stopPropagation();
                return false;
            }
            
            if (permission != 'sharing_twitter'){
                $.post('/api/change_user_settings/', {'access_token': fb_session.access_token, 'method': permission, 'value': value});
            }
        });
        
        function load_more_data(){
            if (view_active == 'stream_active'){
                var last_nom = $('.recent_nom_cont:last');
                
                if ($(last_nom).hasClass('end') == false && $('.recent_nom_cont').length >= 10){
                    $(last_nom).addClass('end');
                    var id = $(last_nom).attr('id');
                    if (id){
                        get_more_stream_active(id);
                    }
                }
            }
            else if (view_active == 'stream_photos'){
                var last_photo = $('.community_photo_cont:last');
                
                if ($(last_photo).hasClass('end') == false && $('.community_photo_cont').length >= 15){
                    $(last_photo).addClass('end');
                    var pid = $(last_photo).attr('pid');
                    if (pid){
                        get_more_stream_photos(pid);
                    }
                }
            }
            else if (view_active == 'stream_winners'){
                var last_nom = $('.recent_nom_cont:last');
                
                if ($(last_nom).hasClass('end') == false && $('.recent_nom_cont').length >= 10){
                    $(last_nom).addClass('end');
                    var id = $(last_nom).attr('id');
                    if (id){
                        get_more_stream_winners(id);
                    }
                }
            }
            else if (view_active == 'community_photos'){
                var last_photo = $('.community_photo_cont:last');
                
                if ($(last_photo).hasClass('end') == false && $('.community_photo_cont').length >= 21){
                    $(last_photo).addClass('end');
                    var pid = $(last_photo).attr('pid');
                    if (pid){
                        get_more_community_photos(pid);
                    }
                }
            }
            else if (view_active == 'community_active'){
                var last_nom = $('.community_active_cont:last');
                
                if ($(last_nom).hasClass('end') == false && $('.community_active_cont').length >= 10){
                    $(last_nom).addClass('end');
                    var id = $(last_nom).attr('id');
                    if (id){
                        get_more_community_active(id);
                    }
                }
            }
            else if (view_active == 'profile_photos'){
                var last_photo = $('.user_photo_wrap:last');
                
                if ($(last_photo).hasClass('end') == false){
                    $(last_photo).addClass('end');
                    var pid = $(last_photo).attr('pid');
                    if (pid){
                        get_more_profile_photos(pid);
                    }
                }
            }
            else if (view_active == 'profile_active'){
                
            }
            else if (view_active == 'profile_following'){
                
            }
            else if (view_active == 'profile_followers'){
                
            }
        }
        
        if (!mobile){
            $('#show_upload').live('click', function(){
                var photo_upload_html = '<div id="photo_upload_cont">' +
                                            '<h1>Post Photo</h1>' +
                                            '<div id="upload_left_cont">' +
                                                '<form id="file_uploader" action="/upload_photo/" method="POST" enctype="multipart/form-data">' +
                                                    '<input type="file" name="file" multiple>' +
                                                    '<div class="sick large">Select Photos</div>' +
                                                '</form>' +
                                            '</div>' +
                                            '<div id="upload_right_cont">' +
                                                '<h2>Drag Photos Here</h2>' +
                                            '</div>'+ 
                                            '<div id="upload_controls">' +
                                                '<a id="cancel_upload" class="sick large">Cancel</a>' +
                                                '<a id="post_upload" class="sick large">Submit</a>' +
                                            '</div>' +
                                            '<div class="clear"></div>' +
                                        '</div>' +
                                        '<div id="photo_upload_permission_cont">' +
                                            '<div id="connecting_triangle"></div>' +
                                            '<h2>Upload Settings</h2>' +
                                            '<ul id="upload_permission_controls">' +
                                                '<li>' +
                                                    '<div id="public_photo" class="switch switch_on"></div>' +
                                                    '<h3>Photos are public:</h3>' +
                                                    '<p>Switch to remove photos from community section.</p>' +
                                                    '<div class="clear"></div>' +
                                                '</li>' +
                                                // '<li>' +
                                                //     '<h3>Add to Portrit Facebook album: </h3>' +
                                                //     '<div id="facebook_photo" class="switch switch_on"></div>' +
                                                //     '<div class="clear"></div>' +
                                                // '</li>' +
                                            '</ul>' +
                                        '</div>';

                $('#context_overlay_cont').addClass('photo_upload');
                $('#context_overlay_cont > div').append(photo_upload_html);
                show_context_overlay(true, true);
                
                var file_count = 0;
                var error_timeout = null;
                $('#file_uploader').fileUpload({
                    namespace: 'file_upload_1',
                    url: '/upload_photo/',
                    dropZone: $('#upload_right_cont'),
                    initUpload: function(event, files, index, xhr, handler, callback){
                        var regexp = /\.(png)|(jpg)|(jpeg)|(gif)$/i;
                        if (!regexp.test(files[index].name)) {
                            $('#upload_right_cont').css('background-color', 'white');
                            $('#upload_right_cont > h2').text('Drag Photos Here');
                            $('#upload_error').remove();
                            $('#photo_upload_cont > h1').after('<p id="upload_error">Only .jpg, .png, and .gif are allowed.</p>');
                            clearTimeout(error_timeout);
                            error_timeout = setTimeout(function(){
                                $('#upload_error').fadeOut();
                            }, 4500);
                            
                            return;
                        }
                        if (files[index].size > 2000000) {
                            $('#upload_right_cont').css('background-color', 'white');
                            $('#upload_right_cont > h2').text('Drag Photos Here');
                            $('#upload_error').remove();
                            $('#photo_upload_cont > h1').after('<p id="upload_error">File size must be below 2MB.</p>');
                            clearTimeout(error_timeout);
                            error_timeout = setTimeout(function(){
                                $('#upload_error').fadeOut();
                            }, 4500);
                            return;
                        }
                        file_count += 1;
                        append_load($('#upload_left_cont'), 'light');
                        upload_active = true;
                        callback();
                    },
                    onLoad: function(event, files, index, xhr, handler){
                        file_count -= 1;
                        if (file_count <= 0){
                            remove_load();
                            upload_active = false;
                        }
                        var json = xhr.responseText;
                        var data = JSON.parse(json);
                        if ($('#upload_right_cont > div').length == 0){
                            $('#upload_right_cont > h2').hide();
                        }
                        var image_html ='<div class="photo_to_upload_cont" value="' + data.id + '">' +
                                            '<div class="photo_to_upload_thumb">' +
                                                '<img src="' + data.thumb + '"/>' +
                                            '</div>' +
                                            '<div class="photo_to_upload_name_cont">' +
                                                '<p>' + data.name + '</p>' +
                                            '</div>' +
                                            '<p class="close_img ' + close_size + '"></p>' +
                                        '</div>';
                        $('#upload_right_cont').append(image_html);
                        $('#upload_right_cont').css('background-color', 'white');
                        $('#upload_right_cont > h2').text('Drag Photos Here');
                    },
                    onDragEnter: function(event){
                        $('#upload_right_cont').css('background-color', '#E95C41');
                        $('#upload_right_cont > h2').text('Drop');
                    },
                    onDragLeave: function(event){
                        $('#upload_right_cont').css('background-color', 'white');
                        $('#upload_right_cont > h2').text('Drag Photos Here');
                    }
                });
            });
            
            $('#cancel_upload').die('click');
            $('#cancel_upload').live('click', function(){
                $('#close_overlay').click();
            });
            
            $('.photo_to_upload_cont .close_img').die('click');
            $('.photo_to_upload_cont .close_img').live('click', function(){
                $(this).parent().remove();

                if ($('#upload_right_cont .photo_to_upload_cont').length == 0){
                    $('#upload_right_cont > h2').fadeIn();
                }
            });
            
            var upload_active = false;
            var photos_to_upload = [ ];
            $('#post_upload').die('click');
            $('#post_upload').live('click', function(){
                if (!upload_active){
                    var public_perm = $('#public_photo');
                    var post_to_facebook = $('#facebook_photo');
                    photos_to_upload = [ ];

                    if ($('#upload_right_cont .photo_to_upload_cont').length > 0){
                        if ($(public_perm).hasClass('switch_on')){
                            public_perm = true;
                        }
                        else{
                            public_perm = false;
                        }
                        // if ($(post_to_facebook).hasClass('switch_on')){
                        //     post_to_facebook = true;
                        // }
                        // else{
                        //     post_to_facebook = false;
                        // }

                        var photo_ids = '';
                        $('.photo_to_upload_cont').each(function(i){
                            var that = $(this);
                            photo_ids += $(that).attr('value') + ','
                            photos_to_upload.push({
                                'id': $(that).attr('value'),
                                'thumbnail': $(that).find('.photo_to_upload_thumb img').attr('src')
                            });
                        });

                        $.post('/mark_photos_live/', {'photo_ids': photo_ids, 'public_perm': public_perm}, function(){

                        });

                        close_context_overlay(true);
                        render_photo_upload_nom(photos_to_upload);
                        $('#post_nomination').attr('id', 'post_photos_nomination');
                        $('#cancel_nom').text('Skip');
                    }
                    if (typeof(_gaq) !== "undefined"){
                        _gaq.push(['_trackEvent', 'Post Photo Upload', 'Click', '']);
                    }   
                }
            });
        }
        
        $('.nom_detail').live('click', function(){
            var nom_id = $(this).parent().attr('value');
            var nom_url = $('#' + nom_id).find('a.nomination_id:first').attr('href');
            selected_nom = nom_id;
            if (nom_url){
                window.location.href = nom_url;
            }
        });
        
        $('.add_new_comment').live('click', function(){
            if (me){
                $(this).addClass('off');
                var nom_id = $(this).parent().attr('value');
                var new_comment_html =  '<div class="new_comment_cont" style="display:none;">' +
                                            '<div class="comment_top_head">' +
                                                '<span class="sick large post_new_comment" value="' + nom_id + '">Post</span>' + 
                                                '<span class="sick large cancel_new_comment">Close</span>' +
                                            '</div>' +
                                            '<textarea class="comment_body"></textarea>' +
                                        '</div>';
                if ($(this).parent().parent().find('.new_comment_cont').length == 0){
                    $(this).parent().after(new_comment_html);
                    $(this).parent().parent().find('.new_comment_cont').show();
                    $(this).parent().parent().find('.comment_body').focus();

                    if (typeof(_gaq) !== "undefined"){
                        _gaq.push(['_trackEvent', 'Comment', 'Shown', '']);
                    }
                }
            }
        });
        
        $('.cancel_new_comment').live('click', function(){
            var comment_cont = $(this).parent().parent();
            $(comment_cont).parent().find('.sick').removeClass('off');
            if (stream_view){
                $(comment_cont).remove();
            }
            else{
                $(comment_cont).hide();
            }
            $('#add_new_comment').show();
        });
        
        $('.post_new_comment').live('click', function(){
            var comment_cont = $(this).parent().parent();
            var body = $(comment_cont).find('.comment_body').val().replace(/\n\r?/g, '<br />');
            var nom_id = $(this).attr('value');
                
            var now = new Date().getTime();
            var comment_cont_html = '<div class="comment" style="display:none;">' +
                                        '<p class="comment_time" value="' + now / 1000 + '">Right now</p>' +
                                        '<a href="#!/' + me.username + '">' +
                                            '<img class="user_photo" src="https://graph.facebook.com/' + me.id + '/picture?type=square"/>' +
                                        '</a>' +
                                        '<a href="#!/' + me.username + '" class="post_username from_username">You</a>' +
                                        '<p>' + body + '</p>' +
                                    '</div>';
            $(comment_cont).after(comment_cont_html);
            $(comment_cont).next().fadeIn();
            $(comment_cont).find('.cancel_new_comment').click();
            $(comment_cont).find('.comment_body').val('');
            
            $('#comments_empty').remove();
            
            if (tut_on){
                update_tut('comment');
            }
            
            $.post('/api/new_comment/', {'access_token': fb_session.access_token,'body': body, 'nom_id': nom_id}, function(data){
                if (data){                   
                    var now = new Date();
                    var time_diff = null;
                    $('.comment_time').each(function(){
                        time = new Date($(this).attr('value') * 1000);
                        time_diff = now - time;
                        time_diff /= 1000;
                        $(this).text(secondsToHms(parseInt(time_diff)));
                    });
                }
            });
            if (typeof(_gaq) !== "undefined"){
                _gaq.push(['_trackEvent', 'Comment', 'Posted', '']);
            }
        });
        
        $('.comment_body').live('focus', function(){
            disable_search = true;
        });
        
        $('.comment_body').live('blur', function(){
            disable_search = false;
        });
        
        selected_photo_noms = { };
        $('#cancel_nom').live('click', function(){
            $('#close_overlay').click();
            return false;
        });
        
        var nominate_limit = 1;
        $('#inactive_trophy_cont li').live('click', function(){
            if ($(this).hasClass('active')){
                if ($('#selected_noms > div').length < nominate_limit){
                    $('#selected_noms h4').hide();
                    if ($('#selected_noms > div').length + 1 == nominate_limit){
                        $('#inactive_trophy_cont li').removeClass('active').addClass('inactive');
                    }
                    else{
                        $('.inactive').removeClass('inactive');
                    }
                    $(this).removeClass('active').addClass('selected');
                    var title = $(this).find('h3').text().replace(' ', '_').toLowerCase();
                    var title_elm = $(this).html();
                    var img = '';
        
                    // if ($('#active_nominations').is(':hidden')){
                    //     $('#active_nominations').show();
                    // }
                    var active_nom_html =   '<div id="' + title + '">' +
                                                title_elm +
                                                '<span class="kill_nomination close_img ' + close_size + '"></span>' + 
                                            '</div>';
                    $('#selected_noms').append(active_nom_html);
                    //Fade in CSS3 hack
                    setTimeout(function(){
                        $('#' + title).css({
                            'opacity': '1.0'
                        }); 
                    }, 50);
                }
            }
        });
        
        $('#selected_noms > div').live('mouseover mouseout', function(event) {
            if (event.type == 'mouseover') {
                $(this).find('.kill_nomination').show();
            } else {
                $(this).find('.kill_nomination').hide();
            }
        });
        
        if (!mobile){
            $('#selected_noms > div').live('click', function(){
                var id = $(this).attr('id');
                id = '#' + id + '_cont';
                $(id).addClass('active').removeClass('selected');
    
                $(this).remove();
    
                if ($('#active_nominations_cont').children().length < nominate_limit){
                    $('.inactive').removeClass('inactive').addClass('active');
                }
                if ($('#selected_noms > div').length == 0){
                    $('#selected_noms > h4').show();
                }
            });
        }
        else{
            $('#selected_noms > div').live('touchend', function(){
                var id = $(this).attr('id');
                id = '#' + id + '_cont';
                $(id).addClass('active').removeClass('selected');
    
                $(this).remove();
    
                if ($('#active_nominations_cont').children().length < nominate_limit){
                    $('.inactive').removeClass('inactive').addClass('active');
                }
                if ($('#selected_noms > div').length == 0){
                    $('#selected_noms > h4').show();
                }
            });
        }
        
        $('#nom_caption').live('focus', function() {  
            if (this.value == this.defaultValue){
                this.value = '';
            }  
            if(this.value != this.defaultValue){  
                this.select();  
            }
        }); 
        
        $('#nom_caption').live('blur', function() {  
            if ($.trim(this.value) == ''){
                this.value = (this.defaultValue ? this.defaultValue : '');  
            }  
        });
        
        $('#nom_caption').live('keyup', function(e){
            var caption_length = $(this).val().length;
            $('#text_remail_cont').text(caption_length + '/90');
        });
        
        $('#nom_caption').live('keydown', function(e){
            var caption_length = $(this).val().length;
            $('#text_remail_cont').text(caption_length + '/90');
            if (caption_length >= 90 && e.keyCode != 8){
                return false;
            }
        });
        
        $('#post_nomination').live('click', function(){
            var selected_nominations = '';
            var tags = '';
            var that = this;
            if ($('#selected_noms > div').length > 0 && !($(this).hasClass('sick_hover_lock'))){
                if (tut_on){
                    update_tut('nom');
                }
                
                $('#selected_noms > div > h3').each(function(){
                    selected_nominations += $(this).text() + ','
                });
                
                $('.tagged_user').each(function(){
                    if ($(this).hasClass('nominatee_user') == false){
                        tags += $(this).attr('id').replace('tagged_', '') + ',';
                    }
                });
                
                $(that).text('Saving...');
                $(that).addClass('sick_hover_lock');
                var comment_text = $('#nom_caption').val();
                if (comment_text == 'Add a caption to this nomination.'){
                    comment_text = '';
                }
                var params = {
                    'access_token': fb_session.access_token,
                    'nominations': selected_nominations,
                    'comment_text': comment_text,
                    'photo_id': selected_photo.id,
                    'owner': selected_user.fid,
                    'tags': tags
                }
                $.post('/api/nominate_photo/', params, function(data){
                    var nom_cat_text = '',
                        nom_cat_underscore = '',
                        nom_complete_html = '',
                        nominatee_id = '',
                        nominatee_name = '',
                        nominator_id = '',
                        nominator_name = '';
                    
                    render_share_nom(data, comment_text);
                });
                if (typeof(_gaq) !== "undefined"){
                    _gaq.push(['_trackEvent', 'Post Nom', 'Click', '']);
                }
                // $('#context_overlay_cont').removeClass();
                $('#context_overlay_cont > div').html('');
                
                if (view_active == 'gallery'){
                    add_photo_nominated(selected_photo.id, selected_nominations);
                }
            }
        });
        
        $('#post_photos_nomination').live('click', function(){
            var selected_nominations = '';
            var that = this;
            var once = true;
            if ($('#selected_noms > div').length > 0 && !($(this).hasClass('sick_hover_lock'))){
                push_nom(current_photo_id);
                $(that).text('Saving...');
                $(that).addClass('sick_hover_lock');
                for (var key in selected_photo_noms){
                    if (key != '' && key != undefined){
                        if (tut_on){
                            update_tut('nom');
                        }
        
                        var photo_id = selected_photo_noms[key].photo_id;
                        var comment_text = selected_photo_noms[key].caption;
                        if (comment_text == 'Add a caption to this nomination.'){
                            comment_text = '';
                        }
                        
                        var params = {
                            'access_token': fb_session.access_token,
                            'nominations': selected_photo_noms[key].selected_nominations,
                            'comment_text': comment_text,
                            'photo_id': key,
                            'owner': me.id,
                            'tags': selected_photo_noms[key].selected_tags
                        }
                        $.post('/api/nominate_photo/', params, function(data){
                            var nom_cat_text = '',
                                nom_cat_underscore = '',
                                nom_complete_html = '',
                                nominatee_id = '',
                                nominatee_name = '',
                                nominator_id = '',
                                nominator_name = '';
        
                            if (once){
                                once = false;
                                render_share_nom(data, comment_text);
                            }
                        });
                    }
                }
                if (typeof(_gaq) !== "undefined"){
                    _gaq.push(['_trackEvent', 'Post Upload Nom', 'Click', '']);
                }
                $('#close_overlay').click();
            }
        });
        
        $('#close_nom_success').live('click', function(){
            if (!mobile){
                $('#nom_complete_cont').fadeOut('fast', function(){
                    $('.nom_complete_cat_cont').remove();
                });
                $('#nominate_photo, #go_nom_detail').fadeIn('fast');
                $('#forward_gallery, #back_gallery').fadeIn('fast');
            }
            else{
                $('#nom_complete_cont').hide();
                $('.nom_complete_cat_cont').remove();
                $('#nominate_photo, #go_nom_detail').show();
                $('#forward_gallery, #back_gallery').show();
            }
            $('#new_nomination_cont li').removeClass('selected').addClass('unselected');
            $('.inactive').removeClass('inactive');
            if ($('#active_nominations #active_empty').is(':hidden')){
                $('#active_nominations #active_empty').show();
            }
            $('#active_nominations_cont').html('');
            $('#nomination_comment').text('Add a caption to this nomination.');
        });
        
        $('#tag_search').live('focus', function(){                
            var mutual_friends_cont_top = $('#tag_search_cont').position().top + $('#new_nom_tagged_cont > div').scrollTop() - 45;
            $('#new_nom_tagged_cont > div').scrollTop(mutual_friends_cont_top);
            $('#mutual_friends_cont').css({
                'min-height': 123
            });
            
            if (this.value == this.defaultValue){
                this.value = '';
            }  
            if(this.value != this.defaultValue){  
                this.select();  
            }
            
            setTimeout(function(){
                $('#tag_search').select();
            }, 300);
        });
        
        $('#tag_search').live('blur', function(){
            if ($.trim(this.value) == ''){
                this.value = (this.defaultValue ? this.defaultValue : '');  
            }
        });
        
        $('#tag_search').live('keyup', function(){
            var q = $(this).val();
            var ret, arr, len, val, i;
            if (q == ''){
                $('#mutual_friends_cont').html('');
                for (var i = 0; i < mutual_friends_list.length; i++){
                    if (mutual_friends_list[i].active != undefined){
                        $('#mutual_friends_cont').append('<div class="mutual_user" id="mutual_' + mutual_friends_list[i].fid + '" value="' + mutual_friends_list[i].fid + '"><img src="https://graph.facebook.com/' + mutual_friends_list[i].fid + '/picture?type=square"/><p>' + mutual_friends_list[i].name + '</p><span>' + mutual_friends_list[i].username + '</span><div class="clear"></div></div>');
                    }
                    else{
                        $('#mutual_friends_cont').append('<div class="mutual_user" id="mutual_' + mutual_friends_list[i].fid + '" value="' + mutual_friends_list[i].fid + '"><img src="https://graph.facebook.com/' + mutual_friends_list[i].fid + '/picture?type=square"/><p>' + mutual_friends_list[i].name + '</p><span>' + mutual_friends_list[i].username + '</span><div class="clear"></div></div>');
                    }
                }
            }
            else{
                len = mutual_friends_list.length;
                ret = [ ];
                q = q.toLowerCase();
                for(i=0; i< len; i++){
                    val = mutual_friends_list[i];
                    if(val.name.toLowerCase().indexOf(q) === 0 || val.username.toLowerCase().indexOf(q) === 0){
                        ret.push(val);
                    }
                }
        
                $('#mutual_friends_cont').html('');
                if (ret.length > 0){
                    for (var i = 0; i < ret.length; i++){
                        if (ret[i].active != undefined){
                            $('#mutual_friends_cont').append('<div class="mutual_user" id="mutual_' + ret[i].fid + '" value="' + ret[i].fid + '"><img src="https://graph.facebook.com/' + ret[i].fid + '/picture?type=square"/><p>' + ret[i].name + '</p><span>' + ret[i].username + '</span><div class="clear"></div></div>');
                        }
                        else{
                            $('#mutual_friends_cont').append('<div class="mutual_user" id="mutual_' + ret[i].fid + '" value="' + ret[i].fid + '"><img src="https://graph.facebook.com/' + ret[i].fid + '/picture?type=square"/><p>' + ret[i].name + '</p><span>' + ret[i].username + '</span><div class="clear"></div></div>');
                        }
                    }
                }
            }
        });
        
        $('.mutual_user').live('click', function(){
            if ($(this).hasClass('selected')){
                $(this).removeClass('selected');
                $(this).find('.checked').remove();
                var fid = $(this).attr('value');
                $('#tagged_' + fid).remove();
                
                for (var i = 0; i < mutual_friends_list.length; i++){
                     if (fid == mutual_friends_list[i].fid){
                         mutual_friends_list[i].active = undefined;
                     }
                 }
            }
            else{
                 $(this).addClass('selected');
                 $(this).find('p').after('<div class="checked"></div>');
                 var fid = $(this).attr('value');
                 var friend = null;
                 for (var i = 0; i < mutual_friends_list.length; i++){
                     if (fid == mutual_friends_list[i].fid){
                         friend = mutual_friends_list[i];
                         friend.active = true;
                         break;
                     }
                 }
                 $('#tagged_friends_cont').append('<div id="tagged_' + fid + '" class="tagged_user" name="' + friend.username + '"><img src="https://graph.facebook.com/' + fid + '/picture?type=square"/></div>');
            }
        });
        
        $('.tagged_user').live('mouseover mouseout', function(event) {
            if (event.type == 'mouseover') {
                show_tooltip(this);
            } else {
                hide_tooltip(this);
            }
        });
        
        $('.tagged_user').live('click', function(){
            if ($(this).hasClass('nominatee_user') == false){
                var fid = $(this).attr('id').replace('tagged_', '');
                $(this).remove();
                $('#mutual_' + fid).removeClass('selected').find('.checked').remove();
                $('#tagged_friends_cont .tooltip').css('opacity', 0);
            }
        });

        $('.nom_photo_thumb_cont').live('click', function(){
            var next_photo_id = $(this).attr('value');
            var photo_left = $(this).position().left;
            var photo_width = $(this).width();
            var triangle_left = photo_left + (photo_width / 2) - 37;
            $('#selected_photo_triangle').css('left', triangle_left);
            
            var src = $(this).find('img').attr('src').replace('_130', '_720');
            $('#selected_img').attr('src', src);
            
            push_nom(current_photo_id);
            restore_nom(next_photo_id);
            current_photo_id = next_photo_id;
        });
        
        $('.community_photo_cont > img').live('click', function(){
            var owner = $(this).attr('owner');
            var photo_id = $(this).attr('pid');
            
            window.location.href = '/#!/' + owner + '/photos/' + photo_id + '/';
        });
        
        $('.load_more_community_active').live('click', function(){
            var cat = $(this).attr('value');
            
            if (cat){
                window.location.href = '/#!/community/top/' + cat.replace(' ', '-') + '/';
            }
        });
        
        $('.folow').live('click', function(){
            
        });
        
        $('.unfollow').live('click', function(){
            
        });
        
        $('.tagged_users').live('click', function(){
            var nom_id = $(this).attr('nom');
            var nom = nom_cache[nom_id];
            
            if (nom){
                var tagged_user_html =  '<div id="tagged_user_cont">' +
                                            '<h1>Tagged</h1>';
                                            
                var name = '';
                for (var i = 0; i < nom.tagged_users.length; i++){
                    name = nom.tagged_users[i].username;
                    if (me && nom.tagged_users[i].user == me.id){
                        name = 'You';
                    }
                    
                    tagged_user_html += '<div class="tagged_user_wrap">' +
                                            '<div class="tagged_user_border">' +
                                                '<div class="tagged_user_img">' +
                                                    '<a href="/#!/' + nom.tagged_users[i].username + '/">' +
                                                        '<img src="https://graph.facebook.com/' + nom.tagged_users[i].user + '/picture?type=large"/>' +
                                                    '</a>' +
                                                '</div>' +
                                            '</div>' +
                                            '<a href="/#!/' + nom.tagged_users[i].username + '/">' +
                                                '<h3>' + name + '</h3>' +
                                            '</a>' +
                                        '</div>';
                }
                
                tagged_user_html += '<div class="clear"></div></div>';
                
                $('#context_overlay_cont').addClass('tagged_user_overlay');
                $('#context_overlay_cont > div').append(tagged_user_html);
                show_context_overlay(true, true);
            }
            return false;
        });
        
        $('.flag_photo').live('click', function(){
            if ($(this).hasClass('off') == false){
                var photo_id = $(this).attr('pid');
                var owner = $(this).attr('owner');
                var nom_id = $(this).attr('nom_id');
                var thumb = $(this).attr('thumb');
                var fb_crop = $(this).attr('fb_crop')
                var nom = nom_cache[nom_id];

                var flag_photo_html =   '<div id="flag_cont">' +
                                            '<div id="flag_heading">' +
                                                '<h1>Photo Options</h1>' +
                                                '<p>Click one of the options below</p>' +
                                            '</div>' +
                                            '<div id="flag_options">' +
                                                '<h2>Share photo</h2>' +
                                                '<div class="round_cont">' +
                                                    // '<div class="round_cont_option share" value="portrit" style="border-bottom: 1px solid #bebebe;">' +
                                                    //     '<img src="http://portrit.s3.amazonaws.com/img/p_logo.png"/>' +
                                                    //     '<h3>Portrit</h3>' +
                                                    //     '<p class="strong">Share this photo with your followers on Portrit.</p>' + 
                                                    //     '<div class="clear"></div>' +
                                                    // '</div>' +
                                                    '<div class="round_cont_option share" value="facebook" style="border-bottom: 1px solid #bebebe;">' +
                                                        '<img src="http://portrit.s3.amazonaws.com/img/f_logo.png"/>' +
                                                        '<h3>Facebook</h3>' +
                                                        '<p class="strong">Share this photo on Facebook.</p>' + 
                                                        '<div class="clear"></div>' +
                                                    '</div>' +
                                                    '<div id="share_facebook_cont" class="share_cont" style="display:none; border-bottom: 1px solid #bebebe;">' +
                                                         '<textarea class="share_caption inactive" id="facebook_caption">Caption</textarea>' +
                                                         '<p class="caption_limit">0/140</p>' +
                                                         '<span class="sick post_share" value="facebook">Post</span>' +
                                                         '<span class="sick cancel_share">Cancel</span>' +
                                                         '<div class="clear"></div>' +
                                                    '</div>' +
                                                    '<div class="round_cont_option share" value="twitter">' +
                                                        '<img src="http://portrit.s3.amazonaws.com/img/twitter_logo.png"/>' +
                                                        '<h3>Twitter</h3>' +
                                                        '<p class="strong">Share this photo on Twitter.</p>' + 
                                                        '<div class="clear"></div>' +
                                                    '</div>' +
                                                    '<div id="share_twitter_cont" class="share_cont" style="display:none; border-top: 1px solid #bebebe;">' +
                                                        '<textarea class="share_caption inactive" id="twitter_caption">Caption</textarea>' +
                                                        '<p class="caption_limit">0/140</p>' +
                                                        '<span class="sick post_share" value="twitter">Post</span>' +
                                                        '<span class="sick cancel_share">Cancel</span>' +
                                                        '<div class="clear"></div>' +
                                                    '</div>' +
                                                '</div>' +
                                                '<h2>Flag photo</h2>' +
                                                '<div class="round_cont">' +
                                                    '<div class="round_cont_option" value="flag">' +
                                                        '<p>Please only flag photos that break the Portrit Terms of Service. Such as pornography, violence, spam, etc.</p>' +
                                                    '</div>' +
                                                    '<div id="flag_photo_confirmation" class="share_cont" style="display:none; border-top: 1px solid #bebebe;">' +
                                                        '<h2 style="text-align: center; margin-bottom: 10px;">Are you sure?</h2>' +
                                                        '<span class="sick cancel_share" style="float:left; margin-left: 0px">No</span>' +
                                                        '<span class="sick post_share" value="flag">Yes</span>' +
                                                        '<div class="clear"></div>' +
                                                    '</div>' +
                                                '</div>' +
                                                '<div class="clear"></div>' +
                                            '</div>' +
                                            '<div class="clear"></div>' +
                                        '</div>';

                $('#context_overlay_cont').addClass('flag_photo_overlay');
                $('#context_overlay_cont > div').append(flag_photo_html);
                show_context_overlay(true, true);

                $('#close_overlay').bind('click', function(){
                    $('#close_overlay').unbind('click');
                    $('#cancel_flag').unbind('click');
                    $('.round_cont_option').unbind('click');
                    $('.share_caption').unbind('keydown');
                    $('.share_caption').unbind('keyup');
                    $('.share_caption').unbind('blur');
                    $('.share_caption').unbind('focus');
                    $('.cancel_share').die('click');
                    $('.post_share').die('click');
                });

                $('.round_cont_option').unbind('click');
                $('.round_cont_option').bind('click', function(){
                    var value = $(this).attr('value');
                    
                    if (value == 'flag'){
                        if ($(this).hasClass('selected')){
                            $(this).removeClass('selected');
                            $('#flag_photo_confirmation').slideUp('fast');
                        }
                        else{
                            $(this).addClass('selected');
                            $('#flag_photo_confirmation').slideDown('fast');
                        }
                    }
                    else if (value == 'portrit'){
                        
                    }
                    else if (value == 'facebook'){
                        if ($(this).hasClass('selected')){
                            $(this).removeClass('selected');
                            $('#share_facebook_cont').slideUp('fast');
                            $('#share_facebook_cont textarea').val('Caption').removeClass('inputed').addClass('inactive');
                            $('#share_facebook_cont .caption_limit').text('0/140');
                        }
                        else{
                            $(this).addClass('selected');
                            $('#share_facebook_cont').slideDown('fast');
                            $('#facebook_caption').focus();
                        }
                    }
                    else if (value == 'twitter'){
                        if ($(this).hasClass('selected')){
                            $(this).removeClass('selected');
                            $('#share_twitter_cont').slideUp('fast');
                            $('#share_twitter_cont textarea').val('Caption').removeClass('inputed').addClass('inactive');
                            $('#share_twitter_cont .caption_limit').text('0/140');
                        }
                        else{
                            if (!twitter_access_token){
                                send_twitter_auth_request();
                            }
                            $(this).addClass('selected');
                            $('#share_twitter_cont').slideDown('fast');
                            $('#twitter_caption').focus();
                            var test = nom;
                        }
                    }
                });
                
                $('.cancel_share').die('click');
                $('.cancel_share').live('click', function(){
                    $(this).parent().prev().click();
                });
                
                $('.post_share').die('click');
                $('.post_share').live('click', function(){
                    var caption = '';
                    var url = '';
                    var crop = '';
                    var method = $(this).attr('value');
                    
                    if (nom){
                        url = HOST + '#!/nomination/' + nom.id + '/';
                        crop = nom.photo.crop_small;
                    }
                    else{
                        url = HOST + '#!/' + owner + '/photos/' + photo_id + '/';
                        crop = fb_crop;
                    }
                    
                    if (method == 'twitter'){
                        caption = $('#twitter_caption').val();
                        if (caption == 'Caption'){
                            caption = '';
                        }
                        share_on_twitter(caption, url);
                    }
                    else if (method == 'facebook'){
                        caption = $('#facebook_caption').val();
                        if (caption == 'Caption'){
                            caption = '';
                        }
                        var title = '';
                        if (nom){
                            title = me.username + ' shared a nomination on Portrit';
                        }
                        else{
                            title = me.username + ' shared a photo on Portrit';
                        }
                        share_on_facebook(title, caption, url, crop);
                    }
                    else if (method == 'flag'){
                        if (nom){
                            photo_id = nom.photo.id;
                        }
                        $.post('/api/flag/photo', {'access_token': fb_session.access_token, 'photo_id': photo_id}, function(data){
                            
                        });
                    }
                    $(this).parent().prev().click();
                });
                
                $('.share_caption').unbind('focus');
                $('.share_caption').bind('focus', function(){
                    $(this).removeClass().addClass('inputed');
                    if (this.value == 'Caption'){
                        this.value = '';
                    }  
                    if(this.value != 'Caption'){  
                        this.select();  
                    }
                });

                $('.share_caption').unbind('blur');
                $('.share_caption').bind('blur', function(){
                    if ($.trim(this.value) == ''){
                        $(this).removeClass().addClass('inactive');
                        this.value = 'Caption';
                    }
                });

                $('.share_caption').unbind('keydown');
                $('.share_caption').bind('keyup', function(e){
                    var caption_length = $(this).val().length;
                    $(this).parent().find('.caption_limit').text(caption_length + '/140');
                });
                
                $('.share_caption').unbind('keydown');
                $('.share_caption').bind('keydown', function(e){
                    var caption_length = $(this).val().length;
                    $(this).parent().find('.caption_limit').text(caption_length + '/140');
                    if (caption_length >= 140 && e.keyCode != 8){
                        return false;
                    }
                });
            }
        });
        
        $('.follow').live('click', function(e){
            e.stopPropagation();
            
            var value = $(this).attr('value');
            var target = $(this).attr('target');
            
            if (value == 'follow'){
                $(this).removeClass('green').addClass('red').attr('value', 'unfollow').text('Unfollow');
            }
            else{
                $(this).removeClass('red').addClass('green').attr('value', 'follow').text('Follow');
            }
            
            $.post('/api/follow_unfollow_user/', {'access_token': fb_session.access_token, 'target': target, 'method': value }, function(data){
                
            });
            
            // $(this).addClass('disabled');
            // $(this).parent().append('<img src="http://portrit.s3.amazonaws.com/img/small-loader.gif"/>');
            
            return false;
        });
        
        $('.top_user_cont, .top_friend').live('click', function(){
            var username = $(this).attr('value');
            
            if (username){
                window.location.href = '/#/' + username + '/';
            }
        });
        
        $('#sharing_twitter').live('click', function(){
            if ($(this).hasClass('switch_on')){
                send_twitter_auth_request();
            }
            else{
                deauth_twitter();
            }
        });
        
        $('.share_service .switch').live('click', function(){
            var service = $(this).attr('name');
            
            if (service == 'twitter'){
                if (!twitter_access_token){
                    send_twitter_auth_request();
                }
            }
        });
        
        $(window).bind('scroll', function(e){
            var scroll_pos = $(window).scrollTop();
            
            if ((scroll_pos >= $(document).height() - $(window).height() - 200) && scroll_loading == false){
                load_more_data();
            }
        });
    }
    
    var twitter_window_location_intervale
    function send_twitter_auth_request(){
        var callback_url = '';
        if (ENV == 'LOCAL'){
            callback_url = 'http://192.168.1.126:8080/return_twitter/';
        }
        else if (ENV == 'TEST'){
            callback_url = 'http://test.portrit.com/return_twitter/';
        }
        else if (ENV == 'PRODUCTION'){
            callback_url = 'http://portrit.com/return_twitter/';
        }
        
        var twitter_window = window.open('/api/auth_twitter?access_token=' + fb_session.access_token ,"TwitterAuth", "width=800,height=434");
    }
    
    function catch_twitter_access_token(token){
        twitter_access_token = token;
    }
    
    function deauth_twitter(){
        $.post('/api/deauth_twitter/', {'access_token': fb_session.access_token}, function(data){
            twitter_access_token = null;
        });
    }
    
    var selected_photo_noms = { };
    function push_nom(id){
        var selected_nominations = '';
        var selected_tagged = '';
        $('#selected_noms > div > h3').each(function(){
            selected_nominations += $(this).text() + ',';
        });
        $('.tagged_user').each(function(){
            if ($(this).hasClass('nominatee_user') == false){
                selected_tagged = $(this).attr('id').replace('tagged_', '') + ',';
            }
        });
        selected_photo_noms[id] = {
            'selected_nominations': selected_nominations,
            'selected_tags': selected_tagged,
            'photo_id': id,
            'caption': $('#nom_caption').val()
        }
        $('.tagged_user').remove();
        $('#mutual_friends_cont .selected').removeClass('selected').find('.checked').remove();
        $('#selected_noms').html('');
        $('#nom_caption').val('');
        $('#inactive_trophy_cont li').removeClass().addClass('active');
    }
    
    function restore_nom(id){
        if (selected_photo_noms[id]){
            var selected_nominations = selected_photo_noms[id].selected_nominations.split(',');
            var selected_tags = selected_photo_noms[id].selected_tags.split(',');
            var nom_cat_underscore = '';
            var trophy_html = '';
            var title_elm = '';
            var active_nom_html = '';
            for (var i = 0; i < selected_nominations.length; i++){
                if (selected_nominations[i] != ''){
                    nom_cat_underscore = selected_nominations[i].replace(' ', '_').toLowerCase();
                    trophy_html = $('#' + nom_cat_underscore + '_cont').html();

                    active_nom_html =   '<div id="' + nom_cat_underscore + '">' +
                                                trophy_html +
                                                '<span class="kill_nomination close_img ' + close_size + '"></span>' + 
                                            '</div>';
                    $('#selected_noms').append(active_nom_html);
                    $('#' + nom_cat_underscore + '_cont').removeClass().addClass('selected');   
                }
                if (i == 3){
                    $('#inactive_trophy_cont li').removeClass('active').addClass('inactive');
                }
            }
            if (i <= 1){
                $('#selected_noms').append('<h4>No nominations selected.</h4>');
            }
            $('#tagged_friends_cont').append('<div class="tagged_user nominatee_user" name="Nominee"><img src="https://graph.facebook.com/' + me.id + '/picture?type=square"></div>');
            for (var i = 0; i < mutual_friends_list.length; i++){
                mutual_friends_list[i].active = undefined;
            }
            for (var i = 0; i < selected_tags.length; i++){
                if (selected_tags[i] != ''){
                    $('#tagged_friends_cont').append('<div id="tagged_' + selected_tags[i] + '" class="tagged_user" name="' + friends[selected_tags[i]].username + '"><img src="https://graph.facebook.com/' + selected_tags[i] + '/picture?type=square"></div>')
                    $('#mutual_' + selected_tags[i]).addClass('selected').find('p').after('<div class="checked"></div>');
                }
                for (var i = 0; i < mutual_friends_list.length; i++){
                    if (selected_tags[i] == mutual_friends_list[i].fid){
                        mutual_friends_list[i].active = true;
                    }
                }
            }
            if (selected_photo_noms[id].caption != '' && selected_photo_noms[id].caption != undefined){
                if (selected_photo_noms[id].caption == 'Add a caption to this nomination.'){
                    $('#nom_caption').val('Add a caption to this nomination.');
                    $('#text_remail_cont').text('0/90');
                }
                else{
                    $('#nom_caption').val(selected_photo_noms[id].caption);
                    $('#text_remail_cont').text(selected_photo_noms[id].caption.length + '/90');
                }
            }
            else{
                $('#nom_caption').val('Add a caption to this nomination.');
                $('#text_remail_cont').text('0/90');
            }

            $('#selected_noms > div').css('opacity', 1);
        }
        else{
            $('#tagged_friends_cont').append('<div class="tagged_user nominatee_user" name="Nominee"><img src="https://graph.facebook.com/' + me.id + '/picture?type=square"></div>');
            $('#nom_caption').val('Add a caption to this nomination.');
            $('#text_remail_cont').text('0/90');
        }
    }
    
    $('.switch').live('click', function(){
        if ($(this).attr('value') != 'sharing_facebook'){
            if ($(this).hasClass('switch_on')){
                $(this).removeClass('switch_on').addClass('switch_off');
            }
            else{
                $(this).removeClass('switch_off').addClass('switch_on');
            }
        }
    });
    
    var current_photo_id = null;
    var mutual_friends_list = [ ];
    function render_photo_upload_nom(photos_to_upload){
        var first_photo = photos_to_upload[0];
        var first_photo_large_src = first_photo.thumbnail.replace('_130', '_720');
        current_photo_id = first_photo.id;
        disable_search = true;
        $('#context_overlay_cont').addClass('nominate_photo');
        $('#context_overlay_cont > div').append(nominate_photo_html);
        
        if (photos_to_upload.length > 1){
            var photos_html = '';
            for (var i = 0; i < photos_to_upload.length; i++){
                photos_html +=  '<div class="nom_photo_thumb_cont" value="' + photos_to_upload[i].id + '">' +
                                    '<img src="' + photos_to_upload[i].thumbnail + '"/>' +
                                    '<p class="close_img normal"></p>' +
                                '</div>';
            }
            var nom_photo_stream_html = '<div id="new_nom_photo_stream_cont">' +
                                            photos_html +
                                        '</div>';
            $('#new_nom_middle_cont').after(nom_photo_stream_html);
        }
        $('#selected_img').attr('src', first_photo_large_src).attr('value', first_photo.id);
        $('#selected_photo_triangle').css('left', 40);
        
        show_context_overlay(true, true);
        
        $('#tagged_friends_cont').append('<div class="tagged_user nominatee_user" name="Nominee"><img src="https://graph.facebook.com/' + me.id + '/picture?type=square"/></div>')
        
        mutual_friends_list = [ ];
        $.getJSON('/api/get_follow_data/', {'access_token': fb_session.access_token, 'mutual': true, 'target': me.id, 'all': true, 'method': 'following'}, function(data){
            var user = null;
            for (var i = 0; i < data.data.length; i++){
                user = data.data[i];
                mutual_friends_list.push({
                    'fid': user.fid,
                    'name': user.name,
                    'username': user.username
                });
            }
            for (var i = 0; i < mutual_friends_list.length; i++){
                $('#mutual_friends_cont').append('<div class="mutual_user" id="mutual_' + mutual_friends_list[i].fid + '" value="' + mutual_friends_list[i].fid + '"><img src="https://graph.facebook.com/' + mutual_friends_list[i].fid + '/picture?type=square"/><p>' + mutual_friends_list[i].name + '</p><span>' + mutual_friends_list[i].username + '</span><div class="clear"></div></div>');
            }
        });
    }
    
    function update_nom_detail(nom){
        $('#main_nom_photo').attr('src', nom.photo.source);
        $('#nom_vote_count').text(nom.vote_count);
        
        $('.comment').remove();
        $('#nom_votes_wrap a').remove();
        $('.vote').attr('value', nom.id);
        $('#main_nom_cont').attr('value', nom.id);
        
        var name = '',
            caption = '',
            nominator_name = '',
            cat_underscore = '';
            
        if (me && nom.nominatee == me.id){
            if (nom.won){
                name = 'You';
            }
            else{
                name = 'You\'re';
            }
        }
        else{
            name = nom.nominatee_username;
        }
        
        if (nom.caption){
            caption = 'Caption: ' +nom.caption;
        }
        else{
            caption = 'No caption provided';
        }
        
        if (me && nom.nominator == me.id){
            nominator_name = "You";
        }
        else {
            nominator_name = nom.nominator_name;
        }
        
        var tagged_user_html = '';
        if (nom.tagged_users.length > 0){
            tagged_user_html = '<div class="tagged_users" nom="' + nom.id + '"><span>' + nom.tagged_users.length + ' Tagged</span><div class="tag"></div></div>'; 
        }
        
        $('.tagged_users').remove();
        $('#nominator_overlay_cont').append(tagged_user_html);
        
        cat_underscore = nom.nomination_category.replace(' ', '_').toLowerCase();
        
        $('#vote_cont_left').removeClass().addClass('nom_cat_' + cat_underscore);
        if (nom.won){
            $('#vote_cont_left').addClass('won');
        }
        else{
            $('#vote_cont_left').addClass('active');
        }
        
        $('#nomination_text_cont h3').text(nom.nomination_category);
        $('#nom_trophy_icon').removeClass().addClass('trophy_img large ' + cat_underscore);//.attr('src', 'http://portrit.s3.amazonaws.com/img/trophies/large/' + cat_underscore + '.png');
        // $('#nominator_overlay_cont a').attr('href', '/#!/' + nom.nominator_username + '/');
        // $('#nominator_overlay_cont > h2 a').text(nominator_name);
        $('#nominator_overlay_cont p').text(caption);
        // $('#nominator_overlay_cont .user_img').attr('src', 'https://graph.facebook.com/' + nom.nominator + '/picture?type=square');
        $('#nominatee_cont .user_img').attr('src', 'https://graph.facebook.com/' + nom.nominatee + '/picture?type=square');
        $('#nominatee_cont a').attr('href', '/#!/' + nom.nominatee_username + '/');
        $('#nomination_text_cont span').text(name);
        $('.post_new_comment').attr('value', nom.id);
        $('.flag_photo').attr('pid', nom.photo.id);
        $('.flag_photo').attr('thumb', nom.photo.crop);
        
        var winning_text = '';
        if (nom.won){
            winning_text = 'Won';
        }
        else{
            winning_text = 'Nominated for';
        }
        
        $('#nomination_text_cont p').text(winning_text);
        
        get_nom_comments(nom.id);
        render_nom_votes(nom, nom.votes);
        // get_nom_votes(nom.id);
    }
    
    function render_more_nom_detail(data, dir){
        if (data.length > 0){
            create_nom_cache(data);

            var nom_in_cat = null;
            var nom_stream_html = '';
            for (var i = 0; i < data.length; i++){
                nom_in_cat = data[i];
                nom_stream_html +=  '<div id="nom_photo_' + nom_in_cat.id + '" class="nom_photo_thumbnail" style="opacity: 0.6; display:none;">' +
                                        '<img src="' + nom_in_cat.photo.crop_small + '"/>' +
                                    '</div>';
            }

            if (dir == 'up'){
                $('#nom_cat_stream').append(nom_stream_html);
            }
            else{
                $('#nom_cat_stream .next_photo').after(nom_stream_html);
            }

            slide_images = $('.nom_photo_thumbnail');

            var img_widths = [ ];
            var slide_center = 0;
            var slide_img_width = 0;
            var center_found = false;
            var mid_screen = $('#nom_cat_stream').width() / 2;
            $(slide_images).each(function(j, selected){
                slide_img_width = 100;
                if ($(this).attr('name') === 'selected'){
                    slide_center += (slide_img_width / 2);
                    center_found = true;
                }
                else if (center_found === false){
                    slide_center += slide_img_width + 20;
                }

                img_widths.push(slide_img_width + 20);
            });

            var previous_x = 0;
            var margin_offset = mid_screen - slide_center;

            $(slide_images).each(function(i, selected){
                    $(this).css({
                        'left': previous_x + margin_offset,
                        'top': 0
                    });
                previous_x += img_widths[i];
            });

            $('.nom_photo_thumbnail').show();
        }
        else{
            if (dir == 'up'){
                $('.nom_photo_thumbnail:last').attr('end', true);
            }
            else{
                $('.nom_photo_thumbnail:first').attr('end', true);
            }
        }    
    }
    
    function load_more_noms(state, cat, dir, pos_to_load){
        if (state == 'stream_active'){
            $.getJSON('/api/get_nom_detail/', {'source': selected_user.username, 'nav_selected': state, 'cat': cat, 'dir': dir, 'pos': pos_to_load}, function(data){
                render_more_nom_detail(data, dir);
            });
        }
        else if (state == 'stream_winners'){
            $.getJSON('/api/get_nom_detail/', {'source': selected_user.username, 'nav_selected': state, 'cat': cat, 'dir': dir, 'pos': pos_to_load}, function(data){
                render_more_nom_detail(data, dir);
            });
        }
        else if (state == 'community_active'){
            $.getJSON('/api/get_nom_detail/', {'nav_selected': state, 'cat': cat, 'dir': dir, 'pos': pos_to_load}, function(data){
                render_more_nom_detail(data, dir);
            });
        }
        else if (state == 'community_top'){
            $.getJSON('/api/get_nom_detail/', {'nav_selected': state, 'cat': cat, 'dir': dir, 'pos': pos_to_load}, function(data){
                render_more_nom_detail(data, dir);
            });
        }
        else if (state == 'profile_trophies'){
            $.getJSON('/api/get_nom_detail/', {'source': selected_user.username, 'nav_selected': state, 'cat': cat, 'dir': dir, 'pos': pos_to_load}, function(data){
                render_more_nom_detail(data, dir);
            });
        }
        // else if (state == 'profile_active'){
        // 
        // }
    }
    
    function check_detail_pagination(current, selected, len, pos){
        var load_sensitivity = 3;
        
        var loaded_top = len - selected + pos;
        var loaded_bottom = pos - selected;
        var pos_to_load = 0;
        var dir = null;
        
        var state = $('#nom_detail_cont .title').attr('state');
        var cat = $('#nom_detail_cont .title').attr('cat');
        
        if (loaded_top >= 9 && selected > current && selected + load_sensitivity >= loaded_top && $('.nom_photo_thumbnail:last').attr('end') == undefined){
            dir = 'up';
            pos_to_load = loaded_top + 1;
        }
        else if (selected < current && selected - load_sensitivity <= loaded_bottom && loaded_bottom > 0){
            dir = 'down';
            pos_to_load = loaded_bottom;
        }
        
        if (dir){
            load_more_noms(state, cat, dir, pos_to_load);
        }
    }
    
    function attach_nom_detail_handlers(){
        $('.nom_photo_thumbnail').live('click', function(){
            var nom_id = $(this).attr('id').replace('nom_photo_', '');
            var nom = nom_cache[nom_id];
            
            var current_selected_index = $('.nom_photo_thumbnail').index($('.nom_photo_thumbnail[name="selected"]'));
            var selected_index = $('.nom_photo_thumbnail').index(this);
            var noms_length = $('.nom_photo_thumbnail').length - 1;
            
            check_detail_pagination(current_selected_index, selected_index, noms_length, nom.position);
            
            var slide_images = $('.nom_photo_thumbnail');
            var img_widths = [ ];
            var slide_center = 0;
            var slide_img_width = 0;
            var center_found = false;
            var mid_screen = $('#nom_cat_stream').width() / 2;
            $('.nom_photo_thumbnail[name="selected"]').css({'opacity': '0.6'}).attr('name', '');
            $(this).css({'opacity': '1.0'}).attr('name', 'selected');
            $(slide_images).each(function(j, selected){
                slide_img_width = $(this).width();
                if ($(this).attr('name') === 'selected'){
                    slide_center += (slide_img_width / 2);
                    center_found = true;
                }
                else if (center_found === false){
                    slide_center += slide_img_width + 20;
                }
                img_widths.push(slide_img_width + 20);
            });

            var previous_x = 0;
            var margin_offset = mid_screen - slide_center;

            $(slide_images).each(function(i, selected){
                    $(this).css({
                        'left': previous_x + margin_offset,
                        'top': 0
                    });
                previous_x += img_widths[i];
            });
            
            update_nom_detail(nom);
        });
        
        $('.won').live('mouseover mouseout', function(event) {
            if (event.type == 'mouseover') {
                show_tooltip(this);
            } else {
                hide_tooltip(this);
            }
        });
        
        $('#nom_votes_cont a').live('mouseover mouseout', function(event) {
            if (event.type == 'mouseover') {
                show_tooltip(this);
            } else {
                hide_tooltip(this);
            }
        });
        
        $('#add_new_comment').live('click', function(){
            if ($(this).hasClass('off') == false){
                var comment_cont = $(this).parent().parent().find('#new_comment_cont');

                disable_search = true;
                $(this).addClass('off');
                $(comment_cont).show();
                $('.comment_body').focus();
            }
        });
        
        $('.vote_up').live('click', vote_up_handler);
        
        $('.vote_down').live('click', vote_down_handler);
        
        $('.next_photo').live('click', function(){
            var selected = $('#nom_cat_stream').children().filter('[name="selected"]');
            $(selected).next().click();            
        });
        
        $('.prev_photo').live('click', function(){
            var selected = $('#nom_cat_stream').children().filter('[name="selected"]');
            if ($(selected).index() != 2){
                $(selected).prev().click();
            }
        });
    }
    
    var nominate_photo_html =   '<div id="new_nom_wrap">' +
                                    '<div id="new_nom_top_cont">' +
                                        '<h1>Nominate Photo For A Trophy</h1>' +
                                        '<div id="inactive_trophy_cont">' +
                                            '<ul>' +
                                                '<li class="active" id="hot_cont">' +
                                                    '<div class="trophy_img medium hot"></div>' +
                                                    '<h3 class="nom_cat_hot_text">Hot</h3>' +
                                                '</li>' +
                                                '<li class="active" id="lol_cont">' +
                                                    '<div class="trophy_img medium lol"></div>' +
                                                    '<h3 class="nom_cat_lol_text">LOL</h3>' +
                                                '</li>' +
                                                '<li class="active" id="artsy_cont">' +
                                                    '<div class="trophy_img medium artsy"></div>' +
                                                    '<h3 class="nom_cat_artsy_text">Artsy</h3>' +
                                                '</li>' +
                                                '<li class="active" id="fail_cont">' +
                                                    '<div class="trophy_img medium fail"></div>' +
                                                    '<h3 class="nom_cat_fail_text">Fail</h3>' +
                                                '</li>' +
                                                '<li class="active" id="party_animal_cont">' +
                                                    '<div class="trophy_img medium party_animal"></div>' +
                                                    '<h3 class="nom_cat_party_animal_text">Party Animal</h3>' +
                                                '</li>' +
                                                '<li class="active" id="cute_cont">' +
                                                    '<div class="trophy_img medium cute"></div>' +
                                                    '<h3 class="nom_cat_cute_text">Cute</h3>' +
                                                '</li>' +
                                                '<li class="active" id="wtf_cont">' +
                                                    '<div class="trophy_img medium wtf"></div>' +
                                                    '<h3 class="nom_cat_wtf_text">WTF</h3>' +
                                                '</li>' +
                                                '<li class="active" id="creepy_cont">' +
                                                    '<div class="trophy_img medium creepy"></div>' +
                                                    '<h3 class="nom_cat_creepy_text">Creepy</h3>' +
                                                '</li>' +
                                                '<li class="active" id="awesome_cont">' +
                                                    '<div class="trophy_img medium awesome"></div>' +
                                                    '<h3 class="nom_cat_awesome_text">Awesome</h3>' +
                                                '</li>' +
                                                '<li class="active" id="yummy_cont">' +
                                                    '<div class="trophy_img medium yummy"></div>' +
                                                    '<h3 class="nom_cat_yummy_text">Yummy</h3>' +
                                                '</li>' +
                                            '</ul>' +
                                        '</div>' +
                                    '</div>' +
                                    '<div id="new_nom_middle_cont">' +
                                        '<div id="selected_nom_image_cont">' +
                                            '<div>' +
                                                '<p>Selected Photo</p>' +
                                                '<img id="selected_img"/>' +
                                            '</div>' +
                                        '</div>' +
                                        '<div id="selected_nom_cont">' +
                                            '<h2>Selected Nomination</h2>' +
                                            '<div id="selected_noms">' +
                                                '<h4>No nominations selected.</h4>' +
                                            '</div>' +
                                        '</div>' +
                                        '<div id="new_nom_tagged_cont">' +
                                            '<h2 id="tagg_cont_header">Tag Friends</h2>' +
                                            '<div>' +
                                                '<div id="tagged_friends_cont"><p class="tooltip"></p></div>' +
                                                '<div id="tag_search_cont">' +
                                                    '<input type="text" id="tag_search" value="Search"/>' +
                                                '</div>' +
                                                '<div id="mutual_friends_cont"></div>' +
                                            '</div>' +
                                        '</div>' +
                                        '<div class="clear"></div>' +
                                    '</div>' +
                                    '<div id="new_nom_bottom_cont">' +
                                        '<div id="selected_photo_triangle"></div>' +
                                        '<textarea id="nom_caption">Add a caption to this nomination.</textarea>' +
                                        '<div id="text_remail_cont"><p>0/90</p></div>' +
                                        '<div id="nom_controls_cont">' +
                                            '<a id="cancel_nom" class="sick large">Cancel</a>' +
                                            '<a id="post_nomination" class="sick large">Post Nomination</a>' +
                                        '</div>' +
                                        '<div class="clear"></div>' +
                                    '</div>' +
                                '</div>';
                                
    function raise_404(){
        $('#profile_cont_wrap').append('<h1>404</h1>');
    }
    
    function render_share_nom(data, comment_text){
        var caption_class = 'inputed';
        if (!comment_text){
            comment_text = 'Caption';
            caption_class= "inactive";
        }
        
        var share_nom_html ='<div id="share_nom_cont" nom="' + data[0].id + '" crop="' + data[0].photo.crop_small + '">' +
                                '<h1 style="font-size: 30px;">Share your nomination</h1>' +
                                '<textarea class="' + caption_class + '" id="share_nom_comment" value="Caption"/></textarea>' +
                                '<p id="text_remail_cont">0/140</p>' +
                                '<div id="share_bottom_cont">' +
                                    '<div id="share_left_cont">' +
                                        '<h1>Sharing Options</h1>' +
                                        '<p>Share your nomination on Facebook or Twitter.</p>' +
                                    '</div>' +
                                    '<div id="share_options_cont">' +
                                        '<div class="share_service">' +
                                            '<img src="http://portrit.s3.amazonaws.com/img/f_logo.png"/>' +
                                            '<h1>Facebook</h1>' +
                                            '<div id="share_facebook" class="switch switch_off" value="on" name="facebook"></div>' +
                                            '<div class="clear"></div>' +
                                        '</div>' +
                                        '<div id="share_mid"></div>' +
                                        '<div class="share_service">' +
                                            '<img src="http://portrit.s3.amazonaws.com/img/twitter_logo.png"/>' +
                                            '<h1>Twitter</h1>' +
                                            '<div id="share_twitter" class="switch switch_off" value="on" name="twitter"></div>' +
                                            '<div class="clear"></div>' +
                                        '</div>' +
                                    '</div>' +
                                    '<div class="clear"></div>' +
                                '</div>' +
                                '<div id="share_controls_cont">' +
                                    '<span class="sick large" id="post_share">Share</span>' +
                                    '<span class="sick large" id="cancel_share">Cancel</span>' +
                                    '<div class="clear"></div>' +
                                '</div>' +
                            '</div>';
        
        $('#context_overlay_cont').removeClass().addClass('share_nom');
        $('#context_overlay_cont > div').append(share_nom_html);
        $('#share_nom_comment').attr('value', comment_text);
        show_context_overlay(true, true);
        
        attach_nom_share_handlers();
    }
    
    function share_on_facebook(title, caption, url, crop){
        $.post('/api/shorten_url/', {'url': url}, function(data){
            url = data.url;
            FB.api('/me/feed', 'post', {
                'message': caption,
                'caption': caption,
                'link': url,
                'picture': crop,
                'name': title
            }, function(response){

            });
        });
    }
    
    function share_on_twitter(caption, url){
        $.post('/api/share_twitter/', {'access_token': fb_session.access_token, 'status': caption, 'url': url}, function(data){
            
        });
    }
    
    function attach_nom_share_handlers(){
        $('#cancel_share').bind('click', function(){
            close_context_overlay();
            
            $('#cancel_share').unbind('click');
            $('#post_share').unbind('click');
            $('#share_nom_comment').unbind('focus');
            $('#share_nom_comment').unbind('blur');
            $('#share_nom_comment').unbind('keyup');
            $('#share_nom_comment').unbind('keydown');
        });
        
        $('#post_share').bind('click', function(){
            var caption = $('#share_nom_comment').val();
            var nom = $('#share_nom_cont').attr('nom');
            var crop = $('#share_nom_cont').attr('crop');
            var url = HOST + '#!/nomination/' + nom + '/';
            
            if (caption.length > 140){
                caption = caption.splice(0, 136) + '...';
            }
            
            if ($('#share_facebook').hasClass('switch_on')){
                var title = me.username + ' nominated a photo on Portrit';
                share_on_facebook(title, caption, url, crop);
            }
            if ($('#share_twitter').hasClass('switch_on')){
                share_on_twitter(caption, url);
            }
            
            $('#cancel_share').click();
        });
        
        $('#share_nom_comment').bind('focus', function(){
            $(this).removeClass().addClass('inputed');
            if (this.value == 'Caption'){
                this.value = '';
            }  
            if(this.value != 'Caption'){  
                this.select();  
            }
        });
        
        $('#share_nom_comment').bind('blur', function(){
            if ($.trim(this.value) == ''){
                $(this).removeClass().addClass('inactive');
                this.value = 'Caption';
            }
        });
        
        $('#share_nom_comment').bind('keyup', function(e){
            var caption_length = $(this).val().length;
            $('#text_remail_cont').text(caption_length + '/140');
        });
        
        $('#share_nom_comment').bind('keydown', function(e){
            var caption_length = $(this).val().length;
            $('#text_remail_cont').text(caption_length + '/140');
            if (caption_length >= 140 && e.keyCode != 8){
                return false;
            }
        });
    }
    
    function reset_nomination_overlay(){
        $('#new_nomination_cont li').removeClass('selected').addClass('unselected');
        $('.inactive').removeClass('inactive');
        if ($('#active_nominations #active_empty').is(':hidden')){
            $('#active_nominations #active_empty').show();
        }
        $('#active_nominations_cont').html('');
        $('#nomination_comment').text('Add a caption to this nomination.');
        $('#nom_complete_cont').hide();
        $('#nom_complete_cont .nom_complete_cat_cont').remove();
        $('#post_nomination').text('Post Nomination').removeClass('sick_hover_lock');
        $('#tagged_users').hide();
        $('#tagged_users > div').html('');
    }
    
    function append_profile_html(view_to_activate){
        var url_vars = getUrlVars();
        var id = url_vars.user;
        var name = '';
        if (id === 'me'){
            name = me.name;
        }
        else{
            if (friends[id] == undefined){
                $('#user_photo_view').remove();
                FB.api('/' + id + '/', function(response){
                    name = response.name;
                    $('#title > h3').text(name);
                });
            }
            else{
                name = friends[id].name;
            }
        }
        
        album_html ='<div id="album_wrap">' +
                        '<div id="album_cont">' +
                            '<div id="user_profile_left_cont">' +
                                '<h2>Profile</h2>' +
                                '<img id="large_profile_img" src="http://graph.facebook.com/' + id + '/picture?type=large"/>' +
                                '<div id="user_profile_trophy_cont">' +
                                    '<h3>Trophies</h3>' +
                                    '<div></div>' +
                                '</div>' +
                                '<div id="user_profile_follow_cont"></div>' +
                            '</div>' +
                            '<div id="user_profile_right_cont">' +
                                '<ul>' +
                                    '<li id="first_profile_nav" class="stream_nav" name="photos">' +
                                        '<h3>Photos</h3>' +
                                    '</li>' +
                                    '<li class="stream_nav selected" name="stream">' +
                                        '<h3>Nominations</h3>' +
                                    '</li>' +
                                    '<div class="clear"></div>' +
                                '</ul>' +
                                '<div id="active_cont" class="stream">' +
                                    '' +
                                '</div>' +
                            '</div>' +
                            '<div class="clear"></div>' +
                        '</div>' +
                    '</div>';
                    
        $('#title').html('<h3>' + name + '</h3>').attr('value', selected_user).show();
        
        $('#friend_album_cont').prepend(album_html);
        $('#friend_album_cont').show();
        
        if (view_to_activate == 'photos'){
            view_active = 'album';
            profile_albums_view();
        }
        else if (view_to_activate == 'stream'){
            view_active = 'album';
            get_user_noms();
        }
    }
    
    function append_wall_html(view_to_activate){
        var active_view_name = '',
            replace_view_name = '',
            active_view_text = '',
            replace_view_text = '',
            third_view_name = '',
            third_view_text = '',
            photo_upload_html = '',
            invite_friends = '',
            post_photo_html = '';
        
        if ($('#profile_wrap').length == 0){
            if (!mobile){
                photo_upload_html = '<li id="show_upload"><h1>Post Photo</h1></li>';
            }
            if (!public_view){
                var wall_html = '<div id="profile_wrap">' +
                                    '<ul>' +
                                        '<li>' +
                                            '<h1 id="active_stream_view" class="stream_nav" name="stream">Stream</h1>' +
                                        '</li>' +
                                        '<li>' +
                                            '<h1 id="activate_community" class="stream_nav" name="community">Community</h1>' +
                                        '</li>' +
                                        '<li>' +
                                            '<h1 id="activate_profile" class="stream_nav" name="profile">Profile</h1>' +
                                        '</li>' +
                                        photo_upload_html +
                                        '<div class="clear"></div>' +
                                    '</ul>' +
                                    '<div class="clear"></div>' +
                                    '<div id="profile_cont_wrap">' +
                                        '' +
                                    '</div>' + 
                                '</div>';
            }
            else{
                var wall_html = '<div id="profile_wrap">' +
                                    '<ul>' +
                                        '<li>' +
                                            '<h1 id="activate_community" class="stream_nav" name="community">Community</h1>' +
                                        '</li>' +
                                        '<div class="clear"></div>' +
                                    '</ul>' +
                                    '<div class="clear"></div>' +
                                    '<div id="profile_cont_wrap">' +
                                        '' +
                                    '</div>' + 
                                '</div>';
            }


            $('#wall_cont').append(wall_html);

            if (!mobile || tablet){
                render_countdown_clock();
            }
        }
    }
    
    function clear_event_handles(){    
        // Stream View
        
        // Community View
        
        // Profile View
        $('#profile_stats_cont > div').die('click')
        $('.user_photo_wrap a').die('click');
        $('.follow_wrap').die('click');
        $('.user_photo_wrap').die('mouseover mouseout');
        
        // Gallery
        $('#gallery_next').die('click');
        $('#gallery_prev').die('click');
        $('#gallery_prev_cont').die('click');
        $('#gallery_next_cont').die('click');
        $('#nominate').die('click');
        
        // Nom Detail
        $('.nom_photo_thumbnail').die('click');
        $('.won').die('mouseover mouseout');
        $('#nom_votes_cont a').die('mouseover mouseout');
        $('#add_new_comment').die('click');
        // $('.cancel_new_comment').die('click');
        // $('.post_new_comment').die('click');
        $('.vote_up').die('click', vote_up_handler);
        $('.vote_down').die('click', vote_down_handler);
        $('.next_photo').die('click');
        $('.prev_photo').die('click');
        
        // Login
        $('.top_cat_photo').die('mouseover mouseout');
    }
    
    function push_scroll_pos(){
        // returns [x, y]
        var pos = getScrollXY();
        scroll_pos_stack.push(pos[1]);
    }
    
    function pop_scroll_pos(data){
        var pos = scroll_pos_stack.pop();
        if (!mobile){
            $('html, body').scrollTop(pos);
        }
        else{
            //Async .html lag adjustment
            setTimeout(function(){
                $('html, body').scrollTop(pos);
            }, 150);
        }
    }
    
    var view_count = 0;
    attach_main_handlers();
    function update_view(){     
        var url_vars_list = getUrlVars();
        view_count += 1;
        view_active = '';
        
        if ($('#context_overlay').is(':visible') && view_count > 1){
            $('#close_overlay').click();
        }
        if (view_count == 1){
            render_notifications(notification_data);
        }
        
        clear_event_handles();
        
        // $('#nom_detail_cont').remove();
        if (url_vars_list.length > 0){
            if (url_vars_list[0] == 'photos'){
                if (stream_view != 'stream'){
                    $('#profile_cont_wrap').html('');
                }
                if ($('#profile_cont_wrap').children().length == 0){
                    append_wall_html();
                    view_active = 'stream_photos';
                    init_stream_view('photos');
                    init_stream_photos();
                }
                else{
                    view_active = 'stream_photos';
                    init_stream_photos();
                }
            }
            else if (url_vars_list[0] == 'winners'){
                if (stream_view != 'stream'){
                    $('#profile_cont_wrap').html('');
                }
                if (url_vars_list.length > 1){
                    selected_user = {
                        'username': me.username,
                        'fid': me.id,
                        'name': me.name
                    };
                    if ($('#profile_cont_wrap').children().length == 0){
                        append_wall_html();
                    }
                    view_active = 'stream_winners_detail';
                    init_nom_detail('stream_winners');
                }
                else{
                    view_active = 'stream_winners';
                    if ($('#profile_cont_wrap').children().length == 0){
                        append_wall_html();
                    }
                    if ($('#profile_cont_wrap').children().length == 0){
                        init_stream_view('winners');
                        init_stream_winners();
                    }
                    else{
                        init_stream_winners();
                    }
                }
            }
            else if (url_vars_list[0] == 'stream'){
                if (url_vars_list.length > 2){
                    if (url_vars_list[1] == 'nominations'){
                        append_wall_html();
                        selected_user = {
                            'username': me.username,
                            'fid': me.id,
                            'name': me.name
                        };
                        view_active = 'stream_active_detail';
                        init_nom_detail('stream_active', url_vars_list[2]);
                    }
                }
                else{
                    raise_404();
                }
            }
            else if (url_vars_list[0] == 'community'){
                if ($('#profile_cont_wrap').children().length == 0){
                    append_wall_html();
                }
                else if (stream_view != 'community'){
                    $('#profile_cont_wrap').html('');
                }
                if (url_vars_list.length > 1){
                    if (url_vars_list[1] == 'photos'){
                        view_active = 'community_photos';
                        init_community_view('photos');
                        init_community_photos();
                        $('.sub_stream_nav').removeClass('selected');
                        $('#community_photos').addClass('selected');
                    }
                    else if (url_vars_list[1] == 'top'){
                        if (url_vars_list.length > 2){
                            if (url_vars_list.length > 3){
                                view_active = 'community_top_detail';
                                init_nom_detail('community_top', url_vars_list[2]);
                            }
                            else{
                                //Community Top Cat
                                view_active = 'community_top_cat';
                                init_community_view('top');
                                init_community_top_cat();
                                $('.sub_stream_nav').removeClass('selected');
                                $('#community_top').addClass('selected');
                            }
                        }
                        else{
                            //Community Top
                            view_active = 'community_top';
                            init_community_view('top');
                            init_community_top();
                            $('.sub_stream_nav').removeClass('selected');
                            $('#community_top').addClass('selected');
                        }
                    }
                    else{
                        if (url_vars_list.length > 2){
                            view_active = 'community_active_detail';
                            if (!selected_nom){
                                selected_nom = url_vars_list[2];
                            }
                            init_nom_detail('community_active');
                        }
                        else{
                            //Raise 404
                            raise_404();
                        }
                    }
                }
                else{
                    //Community Active
                    view_active = 'community_active';
                    init_community_view('active');
                    init_community_active();
                    $('.sub_stream_nav').removeClass('selected');
                    $('#community_active').addClass('selected');
                }
            }
            else if (url_vars_list[0] == 'nomination'){
                if (url_vars_list.length > 1){
                    //Nom Detail View
                    append_wall_html();
                    selected_nom = url_vars_list[1];
                    init_nom_detail();
                }
                else{
                    //Raise 404
                    raise_404();
                }
            }
            else{
                //Profile
                if ($('#profile_cont_wrap').children().length == 0){
                    selected_user = {
                        'username': url_vars_list[0],
                        'fid': null,
                        'name': null
                    };
                    append_wall_html();
                }
                else if (stream_view != 'profile' && stream_view != 'profile_user'){
                    selected_user = {
                        'username': url_vars_list[0],
                        'fid': null,
                        'name': null
                    };
                    $('#profile_cont_wrap').html('');
                }
                else if (url_vars_list[0] != selected_user.username){
                    selected_user = {
                        'username': url_vars_list[0],
                        'fid': null,
                        'name': null
                    };
                    $('#profile_cont_wrap').html('');
                }
                
                $('.follow_nav').removeClass('selected');
                $('#gallery_cont').remove();
                
                if (url_vars_list.length > 1){
                    if (url_vars_list[1] == 'trophies'){
                        if (url_vars_list.length > 2){
                            view_active = 'profile_trophies_detail';
                            init_nom_detail('profile_trophies', url_vars_list[2]);
                        }
                        else{
                            //Profile Trophies
                            view_active = 'profile_trophies';
                            init_profile_view('trophies');
                            $('.sub_stream_nav').removeClass('selected');
                            $('#profile_trophies').addClass('selected');
                        }
                    }
                    else if (url_vars_list[1] == 'active'){
                        if (url_vars_list.length > 2){
                            view_active = 'profile_active_detail';
                            init_nom_detail('profile_active');
                        }
                        else{
                            //Profile Active
                            view_active = 'profile_active';
                            init_profile_view('active');
                            $('.sub_stream_nav').removeClass('selected');
                            $('#profile_active').addClass('selected');
                        }
                    }
                    else if (url_vars_list[1] == 'settings'){
                        //Profile Active
                        view_active = 'profile_settings';
                        init_profile_view('settings');
                        $('.sub_stream_nav').removeClass('selected');
                        $('#profile_settings').addClass('selected');
                    }
                    else if (url_vars_list[1] == 'following'){
                        //Profile Following
                        view_active = 'profile_following';
                        init_profile_view('following');
                        $('#profile_following_count_cont').addClass('selected');
                        $('.sub_stream_nav').removeClass('selected');
                    }
                    else if (url_vars_list[1] == 'followers'){
                        //Profile Followers
                        view_active = 'profile_followers';
                        init_profile_view('followers');
                        $('#profile_followers_count_cont').addClass('selected');
                        $('.sub_stream_nav').removeClass('selected');
                    }
                    else if (url_vars_list[1] == 'photos'){
                        //Profile Photo Gallery
                        view_active = 'gallery';
                        if (url_vars_list.length > 2){
                            init_gallery_view(url_vars_list[2]);
                        }
                        else{
                            init_gallery_view();
                        }
                    }
                    else{
                        //Raise 404
                        raise_404();
                    }
                }
                else{
                    if (url_vars_list.length > 2){
                        // else{
                        //     //Raise 404
                        // }
                        raise_404();
                    }
                    else{
                        if (url_vars_list[0] == 'about'){
                            info_context_delagate('about');
                        }
                        else if (url_vars_list[0] == 'contact'){
                            info_context_delagate('contact');
                        }
                        else if (url_vars_list[0] == 'terms'){
                            info_context_delagate('terms');
                        }
                        else if (url_vars_list[0] == 'privacy'){
                            info_context_delagate('privacy');
                        }
                        else if (url_vars_list[0] == 'faq'){
                            info_context_delagate('faq');
                        }
                        else{
                            //Profile index
                            view_active = 'profile_photos';
                            init_profile_view('photos');
                            $('.sub_stream_nav').removeClass('selected');
                            $('#profile_photos').addClass('selected');   
                        }
                    }
                }
            }
        }
        else{
            if (!public_view){
                view_active = 'stream_active';
                if ($('#profile_cont_wrap').children().length == 0){
                    append_wall_html('stream');
                    init_stream_view('active');
                    init_stream_active();
                }
                else{
                    if (stream_view != 'stream'){
                        $('#profile_cont_wrap').html('');
                        init_stream_view('active');
                        init_stream_active();
                    }
                    else{
                        init_stream_active();
                    }
                }
            }
            else{
                window.location.href = '/';
            }
        }
    }
    
    function watch_hashtag(){
        var current_hash = $(window.location).attr('hash');
        if (global_hash_tag !== current_hash){
            global_hash_tag = current_hash;
            setTimeout(update_view);
        }
    }
