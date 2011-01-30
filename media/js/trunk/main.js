$(document).ready(function(){
    $('#back').click(function(){
        if (window.location.hash !== '#' && window.location.hash !== '' && window.location.hash !== '#/' && window.location.hash != null){
            window.history.back();
        }
    });
    
    $('#home').click(function(){
        selected_user = '';
        selected_album_id = '';
        selected_photo = '';
        display_type = '';
        
        
        if (view_active == 'main' && default_view != 'wall'){
            if (!mobile){
                $('#wall_view').click();
            }
            else{
                $('#wall_view').trigger('touchend');
            }
        }
        else{
            default_view = 'wall';
            update_urls();
        }
    });
    
    //Settings controller
    $('#settings').click(function(){
        window.location.hash = '/settings';
        
        if (typeof(_gaq) !== "undefined"){
            _gaq.push(['_trackEvent', 'Settings', 'Shown', '']);
        }
    });
    
    $('#give_feedback a').live('click', show_feedback);
    
    $('#feedback_cont').click(function(){return false;});
    
    $('#submit_feedback').click(function(){
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
            
        }
        else if (keycode === 39){ //Right Key
            if (view_active == 'album'){
                init_profile_view();
                transition_to_profile();
            }
            else if (view_active == 'info'){
                transition_to_album();
            }
            else if (view_active === 'gallery'){
                $('#forward_gallery, #forward_gallery_mobile').click();
            }
            else if (view_active == 'nom_detail'){
                $('.next_photo').click();
            }
        }
        else if (keycode === 37){ //Left Key
            if (view_active == 'profile'){
                transition_to_album();
            }
            else if (view_active == 'album'){
                init_info_view();
                transition_to_info();
            }
            else if (view_active == 'gallery'){
                $('#back_gallery, #back_gallery_mobile').click();
            }
            else if (view_active == 'nom_detail'){
                $('.prev_photo').click();
            }
        }
        else if (keycode === 27){ //Escape
            hide_search_view();
        }
        else{
            search_string = String.fromCharCode(keycode).toUpperCase();
            if (search_active === false && keycode <= 90 && keycode >= 48 && comment_form_shown === false && fb_session !== null){
                //$('#query').val(search_string);
                show_search_view();   
            }
        }
    });
    
    $('#search_cont').click(function(e){
        e.stopPropagation();
    });
    
    $('#search_control').click(function(e){
        e.stopPropagation();
        $('#close_search').removeClass().addClass('close_img ' + close_size);
        show_search_view();
    });
    
    $('#close_search').click(function(){
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

    var window_href = window.location.href;
    if (window_href.indexOf('?ref=nf') > 0){
        window.location.href = window_href.replace('?ref=nf', '');
    }

    function render_login_cont(){
        var login_html ='<div id="login_header">' +
                            '<img id="login_logo" src="http://portrit.s3.amazonaws.com/img/logo_blank.png"/>' +
                        '</div>' +
                        '<div id="login_content">' +
                            '<div id="login_top_cont">' +
                                '<div id="tagline_top">' +
                                    '<h2>What\'s Portrit?</h2>' +
                                    '<p id="tagline_main">Award the best photos. It\'s up to you and your Facebook friends to find whose got the best pics.</p>' +
                                    '<p id="tagline_end">Let\'s make photos more social.</p>' +
                                    '<div class="clear"></div>' +
                                '</div>' +
                                '<div id="login_right_cont">' +
                                    '<img id="login" src="http://static.ak.fbcdn.net/images/fbconnect/login-buttons/connect_light_large_long.gif"/>' +
                                    '<p style="text-align:center;">To start, simply click the Connect with Facebook button above.</p>' +
                                '</div>' +
                                '<div class="clear"></div>' +
                            '</div>' +
                            '<div id="login_bottom_cont">' +
                                '<div id="point_1" class="login_points">' +
                                    '<h2 id="point_1_text">1</h2>' +
                                    '<h3>Nominate</h3>' +
                                    '<div class="clear"></div>' +
                                    '<div class="login_points_cont">' +
                                        '<img src="http://portrit.s3.amazonaws.com/img/landing/nominate.png"/>' +
                                        '<div class="login_points_bottom">' +
                                            '<h4>Nominate your friend\'s rockin\' pics.</h4>' +
                                            '<p>Be nice and courteous or evil and awesome, it\'s up to you.</p>' +
                                        '</div>' +
                                    '</div>' +
                                '</div>' +
                                '<div id="point_2" class="login_points">' +
                                    '<h2 id="point_2_text">2</h2>' +
                                    '<h3>Vote</h3>' +
                                    '<div class="clear"></div>' +
                                    '<div class="login_points_cont">' +
                                        '<img src="http://portrit.s3.amazonaws.com/img/landing/vote.png"/>' +
                                        '<div class="login_points_bottom">' +
                                            '<h4>Give your vote to the best.</h4>' +
                                            '<p>The power is in your hands. Use it wisely.</p>' +
                                        '</div>' +
                                    '</div>' +
                                '</div>' +
                                '<div id="point_3" class="login_points">' +
                                    '<h2 id="point_3_text">3</h2>' +
                                    '<h3>Earn</h3>' +
                                    '<div class="clear"></div>' +
                                    '<div class="login_points_cont">' +
                                        '<img src="http://portrit.s3.amazonaws.com/img/landing/earn.png"/>' +
                                        '<div class="login_points_bottom">' +
                                            '<h4>Earn trophies for your amazing photos.</h4>' +
                                            '<p>No longer search through thousands of your friend\'s photos to find the best.</p>' +
                                        '</div>' +
                                    '</div>' +
                                '</div>' +
                                '<div class="clear"></div>' +
                            '</div>' +
                            //                             '<div id="login_left_cont">' +
                            //                                 '<ul class="slideshow">' +
                            //                                     '<li class="active" style="z-index: 1000;" id="landing_img_1"><a><img src="http://portrit.s3.amazonaws.com/img/landing/main.jpg" width="460" height="320" alt="View all your friends as photos on a canvas"/></a></li>' +
                            //                                     '<li id="landing_img_2" style="z-index: 999;"><a><img src="http://portrit.s3.amazonaws.com/img/landing/nominate_screen.jpg" width="460" height="320" alt="Quickly get a overview of your friend\'s albums with album peek"/></a></li>' +
                            //                                     '<li id="landing_img_3" style="z-index: 998;"><a><img src="http://portrit.s3.amazonaws.com/img/landing/active_nom_screen.jpg" width="460" height="320" alt="Dive deep into an album to see the photos"/></a></li>' +
                            //                                     '<li id="landing_img_4" style="z-index: 997;"><a><img src="http://portrit.s3.amazonaws.com/img/landing/nom_detail_screen.jpg" width="460" height="320" alt="Go to gallery view to view large photos"/></a></li>' +
                            //                                     '<li id="landing_img_5" style="z-index: 996;"><a><img src="http://portrit.s3.amazonaws.com/img/landing/mobile.jpg" height="320" alt="Optimized for mobile devices"/></a></li>' +
                            //                                 '</ul>' +
                            //                             '</div>' +
                            // '<div id="login_right_cont">' +
                            //     '<img id="landing_back" src="http://portrit.s3.amazonaws.com/img/left_arrow.png"/>' +
                            //     '<img id="landing_forward" src="http://portrit.s3.amazonaws.com/img/right_arrow.png"/>' +
                            //  '<div id="tagline_cont_active">' +
                            //      '<div class="tagline_top">' +
                            //                                         '<h2>What\'s Portrit?</h2>' +
                            //                                         '<p id="tageline_large">Award the best photos. It\'s up to you and your Facebook friends to find whose got the best pics.</p>' +
                            //                                         '<p id="tagline_end">Love it, earn it.</p>' +
                            //                                     '</div>' +
                            //                                     '<div class="tagline_top" style="display:none;">' +
                            //                                         '<h2>Nominate</h2>' +
                            //                                         '<p id="tageline_large">Nominate your favorite photos. Does that pic scream WTF or Fail? Help a friend out and nominate it.</p>' +
                            //                                         '<p id="tagline_end">Give the gift of nomination.</p>' +
                            //                                     '</div>' +
                            //                                     '<div class="tagline_top" style="display:none;">' +
                            //                                         '<h2>Stream</h2>' +
                            //                                         '<p id="tageline_large">Browse through the days photo nominations. A collection of you and your friends favorite photos.</p>' +
                            //                                         '<p id="tagline_end">Look, but don\'t touch.</p>' +
                            //                                     '</div>' +
                            //                                     '<div class="tagline_top" style="display:none;">' +
                            //                                         '<h2>Vote</h2>' +
                            //                                         '<p id="tageline_large">Give your opinion of your friends photos. It\'s up to you to decide whose got that rockin\' pic.</p>' +
                            //                                         '<p id="tagline_end">With great power comes great responsibility.</p>' +
                            //                                     '</div>' +
                            //                                     '<div class="tagline_top" style="display:none;">' +
                            //                                         '<h2>Earn</h2>' +
                            //                                         '<p id="tageline_large"><img id="trophy_landing" src="http://portrit.s3.amazonaws.com/img/landing/trophies.png"/></p>' +
                            //                                         '<p id="tagline_end">Receive trophies for your best photos.</p>' +
                            //                                     '</div>' +
                            //                                 '</div>' +
                            // '</div>' +
                            '<div class="clear"></div>' +
                        '</div>';
        $('#login_cont').append(login_html);
        
        $('#login').bind('click', function() {
            if (window.sessionStorage !== undefined){
                try{
                    sessionStorage.removeItem('me');
                    sessionStorage.removeItem('friends');
                }
                catch (err){
                    
                }
            }
            FB.login(handleSessionResponse, {perms:'read_stream,publish_stream,user_photos,user_videos,friends_photos,friends_videos,friends_status,user_photo_video_tags,friends_photo_video_tags'});
        });
    }

    var watch_hashtag_interval = null;
    // handle a session response from any of the auth related calls
    function handleSessionResponse(response) {
        clearTimeout(fb_server_timeout);
        clearInterval(watch_hashtag_interval);
        $('#content_loading').remove();
        // var window_href = window.location.href;
        if (window.location.hash == ''){
            window.location.hash = '#/';
        }
        // if (window_href.indexOf('?ref=nf') > 0){
        //     window.location.href = window_href.replace('?ref=nf', '');
        // }
        if (!response.session) {
            view_active = 'login';
            render_login_cont();
            if (mobile){
                $('div#login_header').css({
                    'padding-bottom': '0px'
                });
            }
            $('.footer_hover').bind('click', function(){
                setTimeout(function(){
                    update_view(); 
                }, 75);
            });
            set_mobile_css();
            $('#header').hide();
            attach_login_handlers();
            return;
        }
        $('#login').unbind('click');
        $('#login_cont').remove();
        global_hash_tag = window.location.hash;
        $('#header').show();
        $('.footer_hover').unbind('click');
        fb_session = response.session;
        $('#login_cont').remove();
        $('#wrapper').css({'background': 'none'});
        $('#login_loader').show();
    
        //Set interval handler for url hash changes
        watch_hashtag_interval = setInterval(watch_hashtag, 75);
        set_mobile_css();
        login_fb_user();
    }
    
    function attach_login_handlers(){
        var active_page = 1,
            last_page = 5,
            active_cont = null,
            next_cont = null,
            active_image = null,
            next_image = null,
            z_index = 955;
        $('#landing_back').bind('click', function(){
            active_cont = $('.tagline_top:visible');
            active_image = $('.slideshow .active');
            if (active_page == 1){
                active_page = last_page;
                next_cont = $('.tagline_top:last');
                next_image = $('.slideshow li:last');
            }
            else{
                active_page -= 1;
                next_cont = $(active_cont).prev();
                next_image = $(active_image).prev();
            }
            
            if (!mobile || tablet){
                $(next_image).animate({
                    'left': '500px'
                }, 250, function(){
                    $(active_image).removeClass('active');
                    $(this).addClass('active').css('z-index', (parseInt($(active_image).css('z-index')) + 1));
                    // $(active_image).css('z-index', z_index + 4);
                    $(this).animate({
                        'left': '41px'
                    }, 250);
                });
            }
            else{
                $(next_image).css({
                    '-moz-transform': 'translate(0px, 400px)',
                    '-webkit-transform': 'translate(0px, 400px)'
                });
                $(active_image).removeClass('active');
                setTimeout(function(){
                    $(next_image).addClass('active').css('z-index', (parseInt($(active_image).css('z-index')) + 1));
                    $(next_image).css({
                        '-moz-transform': 'translate(0px, 0px)',
                        '-webkit-transform': 'translate(0px, 0px)'
                    });
                }, 250);
            }
            
            $(active_cont).fadeOut(250, function(){
                $(next_cont).fadeIn(250);
            });
        });
        
        $('#landing_forward').bind('click', function(){
            active_cont = $('.tagline_top:visible');
            active_image = $('.slideshow .active');
            if (active_page == last_page){
                active_page = 1;
                next_cont = $('.tagline_top:first');
                next_image = $('.slideshow li:first');
            }
            else{
                active_page += 1;
                next_cont = $(active_cont).next();
                next_image = $(active_image).next();
            }
            
            if (!mobile || tablet){
                $(active_image).animate({
                    'left': '500px'
                }, 250, function(){
                    $(active_image).removeClass('active');
                    $(next_image).addClass('active');//.css('z-index', parseInt($(active_image).css('z-index')));
                    $(active_image).css('z-index', z_index);
                    $(this).animate({
                        'left': '41px'
                    }, 250);
                });
            }
            else{
                $(active_image).css({
                    '-moz-transform': 'translate(0px, 400px)',
                    '-webkit-transform': 'translate(0px, 400px)'
                });
                $(active_image).removeClass('active');
                setTimeout(function(){
                    $(next_image).addClass('active');
                    $(active_image).css('z-index', z_index);
                    $(active_image).css({
                        '-moz-transform': 'translate(0px, 0px)',
                        '-webkit-transform': 'translate(0px, 0px)'
                    });
                }, 250);
            }
            
            
            z_index -= 1;
            
            $(active_cont).fadeOut(250, function(){
                $(next_cont).fadeIn(250);
            });
        });
    }
    
    Array.prototype.remove = function(from, to) {
      var rest = this.slice((to || from) + 1 || this.length);
      this.length = from < 0 ? this.length + from : from;
      return this.push.apply(this, rest);
    };
    
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
    
    Array.prototype.remove = function(from, to) {
      var rest = this.slice((to || from) + 1 || this.length);
      this.length = from < 0 ? this.length + from : from;
      return this.push.apply(this, rest);
    };
    
    jQuery.jQueryRandom = 0;
    jQuery.extend(jQuery.expr[":"],
    {
        random: function(a, i, m, r) {
            if (i == 0) {
                jQuery.jQueryRandom = Math.floor(Math.random() * r.length);
            };
            return i == jQuery.jQueryRandom;
        }
    });
    
    var is_array = function (value) {
        return value &&
            typeof value === 'object' &&
            typeof value.length === 'number' &&
            typeof value.splice === 'function' &&
            !(value.propertyIsEnumerable('length'));
    };
    
    function getUrlVars() {
        var map = {};
        var parts = window.location.hash.split('/');
        var params = null;
        for (var i = 0; i < parts.length; i++){
            params = parts[i].split('=');
            if (params.length > 0){
                for (var k = 0; k < params.length; k++){
                    if (params[1] == undefined){
                       map[params[0]] ='';
                    }
                    else{
                        map[params[0]] = params[1];
                    }
                }
            }
            else{
                map[parts[i]] = '';
            }
        }
        // var parts = window.location.href.replace(/[#&]+([^=\/]+)=([^\/]*)/gi, function(m,key,value) {
        //     map[key] = value; 
        // });
        return map;
    }
    
    function capitaliseFirstLetter(string)
    {
        return string.charAt(0).toUpperCase() + string.slice(1);
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
    
    function parseURL(url)
    {
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
        // return ((h > 0 ? h + ":" : "") + (m > 0 ? (h > 0 && m < 10 ? "0" : "") + m + ":" : "0:") + (s < 10 ? "0" : "") + s);
    }
    
    function getGetOrdinal(n) {
       var s=["th","st","nd","rd"],
           v=n%100;
       return n+(s[(v-20)%10]||s[v]||s[0]);
    }
    
    //Globals
    var account_type = 'BASIC',
    account_data = null,
    side_bar_initialized = false,
    side_bar_scroll = null,
    reEscape = new RegExp('(\\' + ['/', '.', '*', '+', '?', '|', '(', ')', '[', ']', '{', '}', '\\'].join('|\\') + ')', 'g'),
    portrit_favicon = '<img class="post_favicon" src="http://portrit.s3.amazonaws.com/img/favicon.png"/>',
    slide_trans_time = 350,
    upgrade_timeout = null,
    album = null,
    albums = null,
    touch_album = null,
    swipe_timer = null,
    first_x = null,
    first_y = null,
    last_x = null,
    last_y = null,
    myScroll_photos = null,
    myScroll_profile = null,
    first_touch = true,
    click_hold_timer = null,
    mouse_up = false,
    click_hold = false,
    scroll_to_user = null,
    selected_user = '',
    selected_album_id = '',
    selected_album = null,
    selected_photo = '',
    selected_photo_hold = null,
    selected_photo_group = [ ],
    prev_photo_id = null,
    photo_large_view = false,
    view_active = '',
    display_type = '',
    mobile = false,
    tablet = false,
    user_profile = null,
    user_likes = null,
    user_movies = null,
    user_books = null,
    user_feed = null,
    my_feed = null,
    my_photo_feed = null,
    fb_session = null,
    photo_comment_cache = { },
    start_z_index = 100,
    comment_form_shown = false,
    peek_ended = false,
    peek_on = false,
    peeked_photos = [ ],
    global_hash_tag = '#',
    search_string = "",
    search_active = false,
    user_videos = null,
    kill_friend_shown = false,
    reattach_friend = false,
    mutual_friend_data = null,
    mutual_friend_top = 0,
    friends = null,
    friend_array = [ ],
    friends_alpha = [ ],
    referral_count = 0,
    gallery_scroll = null,
    photo_load_once = false,
    update_feed_interval = null,
    scroll_pos_stack = [ ],
    default_view = null,
    stream_view = null,
    load_more_feed = false,
    initial_feed_load = true,
    photo_filter = null,
    user_winning_noms_cache = { },
    fb_server_timeout = null;
    user_notifications = {
        'new_noms': { },
        'comments': { }
    },
    close_size = 'normal',
    me = null,
    production = true;
    
    if (DetectMobileQuick() === true){
        mobile = true;
        close_size = 'mobile'
        
        if (typeof(_gaq) !== "undefined"){
            if (production){
                var meta_html = '<link rel="stylesheet" href="http://portrit.s3.amazonaws.com/styles/production/mobile_landing.css"/>' +
                                '<link rel="stylesheet" href="http://portrit.s3.amazonaws.com/styles/production/mobile.css"/>' +
                                '<meta id="viewport_meta" name="viewport" content="width=520, user-scalable=no"/>' +
                                '<link rel="shortcut icon" href="http://portrit.s3.amazonaws.com/img/favicon.ico">' +
                                '<link rel="apple-touch-icon" href="http://portrit.s3.amazonaws.com/img/icon128.png"/>' +
                                '<link rel="apple-touch-icon-precomposed" href="http://portrit.s3.amazonaws.com/img/icon128.png"/>';
            }
            else{
                var meta_html = '<link rel="stylesheet" href="/site_media/styles/production/mobile_landing.css"/>' +
                                '<link rel="stylesheet" href="/site_media/styles/production/mobile.css"/>' +
                                '<meta id="viewport_meta" name="viewport" content="width=520, user-scalable=no"/>' +
                                '<link rel="shortcut icon" href="/site_media/img/favicon.ico">' +
                                '<link rel="apple-touch-icon" href="/site_media/img/icon128.png"/>' +
                                '<link rel="apple-touch-icon-precomposed" href="/site_media/img/icon128.png"/>';
            }

        }
        else{
            if (production){
                var meta_html = '<link rel="stylesheet" href="http://portrit.s3.amazonaws.com/styles/trunk/mobile_landing.css"/>' +
                                '<link rel="stylesheet" href="http://portrit.s3.amazonaws.com/styles/trunk/mobile.css"/>' +
                                '<meta id="viewport_meta" name="viewport" content="width=520, user-scalable=no"/>' +
                                '<link rel="shortcut icon" href="http://portrit.s3.amazonaws.com/img/favicon.ico">' +
                                '<link rel="apple-touch-icon" href="http://portrit.s3.amazonaws.com/img/icon128.png"/>' +
                                '<link rel="apple-touch-icon-precomposed" href="http://portrit.s3.amazonaws.com/img/icon128.png"/>';
            }
            else{
                var meta_html = '<link rel="stylesheet" href="/site_media/styles/trunk/mobile_landing.css"/>' +
                                '<link rel="stylesheet" href="/site_media/styles/trunk/mobile.css"/>' +
                                '<meta id="viewport_meta" name="viewport" content="width=520, user-scalable=no"/>' +
                                '<link rel="shortcut icon" href="/site_media/img/favicon.ico">' +
                                '<link rel="apple-touch-icon" href="/site_media/img/icon128.png"/>' +
                                '<link rel="apple-touch-icon-precomposed" href="/site_media/img/icon128.png"/>';
            }

        }
        $('head').append(meta_html);

        var window_width = 520;
        $('body, html, #header, #cont, #wrapper').css({
            'margin': '0 auto',
            'min-width': window_width,
            'width': window_width,
            'max-width': window_width
        });

        if(window.orientation != 0){
            var window_width = 720;
            $('#viewport_meta').attr('content', 'width=520, user-scalable=no, target-densityDpi=160');
        }else{
            var window_width = 520;
            $('#viewport_meta').attr('content', 'width=520, user-scalable=no, target-densityDpi=260');
        }
    }
    else if (DetectIpad() === true){
        close_size = 'mobile';
        mobile = true;
        tablet = true;
    }
    
    function update_urls(){
        var user_url = '';
        var album_url = '';
        var photo_url = '';
        var display_url = '';
        var empty_view = true;
        if (selected_user !== ''){
            user_url = 'user=' + selected_user; 
            empty_view = false;
        }
        if (selected_album_id !== ''){
            album_url = '/album=' + selected_album_id;
            empty_view = false;
        }
        if (selected_photo !== ''){
            photo_url = '/gallery';
            empty_view = false;
        }
        if (empty_view === true){
            if (display_type === "wall"){
                display_url = 'display=' + display_type;
            }
            else if(display_type === "alpha"){
                display_url = 'display=' + display_type;
            }
        }
        
        window.location.hash = '#/' + display_url + user_url + album_url + photo_url;
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
    
    function render_settings(){
        var setttings_html = '';
        var checked = 'false';
        var checked_class = 'unchecked';
        
        if (allow_notifications){
            checked = 'true';
            checked_class = 'checked';
        }
        
        setttings_html = '<div id="settings_cont">' +
                            '<h1>Settings</h1>' +
                            '<div id="allow_notifications_cont">' +
                                '<label for="allow_notifications">Allow Portrit to post on your wall when you win a trophy: </label>' +
                                '<div id="allow_notifications" class="' + checked_class + '" checked="' + checked + '"></div>' +
                                '<div class="clear"></div>' +
                            '</div>' +
                            '<a id="clear_db" class="awesome large">Clear cache</a><span> - Only use when in dire straits!</span>' +
                        '</div>';
                            
        $('#context_cont').append(setttings_html);
        setTimeout(function(){$('#context_cont').fadeIn(100);}, 450);
    }
    
    function attach_settings_handlers(){
        //Settings container options
        $('#clear_db').live('click', function(){
            if (window.sessionStorage !== undefined){
                $(this).next().text('Cache has been cleared. Good luck!').delay(4500).fadeOut();
                $(this).remove();
                sessionStorage.clear();
                sessionStorage.clear();   
            }
        });
        
        $('#allow_notifications').live('click', function(){
            var checked = $(this).attr('checked');
            if (checked == 'true'){
                allow_notifications = false;
                $(this).attr('checked', 'false');
                $(this).removeClass().addClass('unchecked');
            }
            else{
                allow_notifications = true;
                $(this).attr('checked', 'true');
                $(this).removeClass().addClass('checked');
            }
            $.post('/change_user_notifications/', {'allow_notifications': allow_notifications}, function(data){
                
            });
        });
    }
    
    function get_referral_html(){
        var referral_add_html = '';
        for (var i = 0; i < friend_array.length; i++){
            referral_add_html +=    '<div class="friend_ref_cont" id="ref_' + i + '" value="' + friend_array[i].id + '" name="' + friend_array[i].name + '" onclick="void(0)">' +
                                        '<img src="https://graph.facebook.com/' + friend_array[i].id + '/picture?type=square">' +
                                        '<h4>' + friend_array[i].name + '</h4>' +
                                    '</div>';
        }
        return referral_add_html
    }
    
    function get_payments_html(){
        var payments_html = '<h4 id="or_right">OR</h4>' +
                            '<form action="https://www.paypal.com/cgi-bin/webscr" method="post">' +
                                '<input type="hidden" name="cmd" value="_s-xclick">' +
                                '<input type="hidden" name="hosted_button_id" value="B9RVRDG5LJQYG">' +
                                '<input type="image" src="https://www.paypal.com/en_US/i/btn/btn_buynowCC_LG.gif" border="0" name="submit" alt="PayPal - The safer, easier way to pay online!">' +
                                '<img alt="" border="0" src="https://www.paypal.com/en_US/i/scr/pixel.gif" width="1" height="1">' +
                            '</form>' +
                            '<form action="https://checkout.google.com/api/checkout/v2/checkoutForm/Merchant/449086731763420" id="BB_BuyButtonForm" method="post" name="BB_BuyButtonForm" target="_top">' +
                                '<input name="item_name_1" type="hidden" value="Portrit Social Account"/>' +
                                '<input name="item_description_1" type="hidden" value="Unlocks the social features of Portrit! Allows user to comment and like friend\'s posts and pictures."/>' +
                                '<input name="item_quantity_1" type="hidden" value="1"/>' +
                                '<input name="item_price_1" type="hidden" value="0.99"/>' +
                                '<input name="item_currency_1" type="hidden" value="USD"/>' +
                                '<input name="shopping-cart.items.item-1.digital-content.url" type="hidden" value="http://portrit.com/upgrade_user/"/>' +
                                '<input name="_charset_" type="hidden" value="utf-8"/>' +
                                '<input alt="" src="https://checkout.google.com/buttons/buy.gif?merchant_id=449086731763420&amp;w=117&amp;h=48&amp;style=white&amp;variant=text&amp;loc=en_US" type="image"/>' +
                            '</form>';
        return payments_html;
    }
    
    function render_upgrade(next_level){
        var pitch_html = '';
        var you_are_here_html = '';
        var referral_add_html = '';
        var payments_html = '';
        var referrals_needed = 0;
        var referrals_needed_text = '';
        var upgrade_option_html = '';
        comment_form_shown = true;
        if (next_level == 'social'){
            pitch_html = '<h3>Want to be more social?</h3>';
            you_are_here_html = '<div id="here_basic"><img src="http://portrit.s3.amazonaws.com/img/here_basic_arrow.png"/><h3>You are here</h3></div>';
            if (referrals <= 3){
                referrals_needed = 3 - referrals;
                referrals_needed_text = 'Only ' + referrals_needed + ' referrals to go!';
            }
            else{
                referrals_needed = 0;
                referrals_needed_text = '';
            }
            referral_add_html = get_referral_html();
            payments_html = get_payments_html();
            
            upgrade_option_html =   '<div id="payment_types_cont">' +
                                        '<h1>Upgrade Options</h1>' +
                                        '<div id="pay_cont">' +
                                            '<h2 class="title_right">Buy Us a Beer!</h2>' +
                                            '<div class="clear"></div>' +
                                            payments_html +
                                        '</div>' +
                                        '<div id="refferal_cont">' +
                                            '<h2 class="title_left">Refer Your Friends</h2>' +
                                            '<h3 class="title_right">' + referrals_needed_text + '</h3>' +
                                            '<div class="clear"></div>' +
                                            '<p>Send an invite to ' + referrals_needed + ' of your friends to unlock new features. Best part is, your friends don\'t even need to accept! Our thanks to you for spreading the word.</p>' +
                                            '<div id="refferal_cont_scroll">' +
                                                '<div id="refferal_scroller">' +
                                                    referral_add_html +
                                                '</div>' +
                                            '</div>' +
                                            '<div id="reffered_friends">' +

                                            '</div>' +
                                        '</div>' +
                                        '<div class="clear"></div>' +
                                    '</div>';
        }
        else if(next_level == 'plus'){
            pitch_html = '';
            you_are_here_html = '<div id="here_social"><img src="http://portrit.s3.amazonaws.com/img/here_social_arrow.png"/><h3>You are here</h3></div>';
            if (referrals <= 10){
                referrals_needed = 10 - referrals;
                referrals_needed_text = 'Only ' + referrals_needed + ' referrals to go!';
            }
            else{
                referrals_needed = 0;
                referrals_needed_text = '';
            }
            referral_add_html = get_referral_html();
            payments_html = get_payments_html();
            
            upgrade_option_html =   '';
        }
        var about_html ='<h1 id="about_title">Thinking About Upgrading?</h1>' + 
                        pitch_html +
                        '<div style="position: relative;">' +
                            '<table id="account_levels" border="0" cellspacing="0">' +
                                '<tr>' +
                                    '<th id="account_diffs"><h2>Account Levels:</h2></th>' +
                                    '<th><h4 id="basic_title">Basic</h4></th>' +
                                    '<th><h4 id="social_title">Social <span>Most Popular</span></h4></th>' +
                                    '<th><h4 id="plus_title">Plus <span>Coming soon!</span></h4></th>' +
                                '</tr>' +
                                '<tr>' +
                                    '<td><h5 class="table_img_heading">Friend Canvas</h5></td>' +
                                    '<td><img class="column_1" src="http://portrit.s3.amazonaws.com/img/check_24.png"/></td>' +
                                    '<td><img class="column_2" src="http://portrit.s3.amazonaws.com/img/check_24.png"/></td>' +
                                    '<td><img class="column_3" src="http://portrit.s3.amazonaws.com/img/check_24.png"/></td>' +
                                '</tr>' +
                                '<tr>' +
                                    '<td><h5 class="table_img_heading">View Friend\'s Albums</h5></td>' +
                                    '<td><img class="column_1" src="http://portrit.s3.amazonaws.com/img/check_24.png"/></td>' +
                                    '<td><img class="column_2" src="http://portrit.s3.amazonaws.com/img/check_24.png"/></td>' +
                                    '<td><img class="column_3" src="http://portrit.s3.amazonaws.com/img/check_24.png"/></td>' +
                                '</tr>' +
                                '<tr>' +
                                    '<td><h5 class="table_img_heading">Photo Gallery</h5></td>' +
                                    '<td><img class="column_1" src="http://portrit.s3.amazonaws.com/img/check_24.png"/></td>' +
                                    '<td><img class="column_2" src="http://portrit.s3.amazonaws.com/img/check_24.png"/></td>' +
                                    '<td><img class="column_3" src="http://portrit.s3.amazonaws.com/img/check_24.png"/></td>' +
                                '</tr>' +
                                '<tr>' +
                                    '<td><h5 class="table_img_heading">Touch Friendly</h5></td>' +
                                    '<td><img class="column_1" src="http://portrit.s3.amazonaws.com/img/check_24.png"/></td>' +
                                    '<td><img class="column_2" src="http://portrit.s3.amazonaws.com/img/check_24.png"/></td>' +
                                    '<td><img class="column_3" src="http://portrit.s3.amazonaws.com/img/check_24.png"/></td>' +
                                '</tr>' +
                                '<tr>' +
                                    '<td><h5 class="table_img_heading">View Friend\'s Stream</h5></td>' +
                                    '<td><img class="column_1" src="http://portrit.s3.amazonaws.com/img/check_24.png"/></td>' +
                                    '<td><img class="column_2" src="http://portrit.s3.amazonaws.com/img/check_24.png"/></td>' +
                                    '<td><img class="column_3" src="http://portrit.s3.amazonaws.com/img/check_24.png"/></td>' +
                                '</tr>' +
                                '<tr>' +
                                    '<td><h5 class="table_img_heading">Comment and Like Friend\'s Post</h5></td>' +
                                    '<td><img class="column_1" src="http://portrit.s3.amazonaws.com/img/cross_24.png"/></td>' +
                                    '<td><img class="column_2" src="http://portrit.s3.amazonaws.com/img/check_24.png"/></td>' +
                                    '<td><img class="column_3" src="http://portrit.s3.amazonaws.com/img/check_24.png"/></td>' +
                                '</tr>' +
                                '<tr>' +
                                    '<td><h5 class="table_img_heading">Hide the Friends You Don\'t Care About</h5></td>' +
                                    '<td><img class="column_1" src="http://portrit.s3.amazonaws.com/img/cross_24.png"/></td>' +
                                    '<td><img class="column_2" src="http://portrit.s3.amazonaws.com/img/check_24.png"/></td>' +
                                    '<td><img class="column_3" src="http://portrit.s3.amazonaws.com/img/check_24.png"/></td>' +
                                '</tr>' +
                                '<tr>' +
                                    '<td><h5 class="table_img_heading">Create a List of Your Favorite Friends</h5></td>' +
                                    '<td><img class="column_1" src="http://portrit.s3.amazonaws.com/img/cross_24.png"/></td>' +
                                    '<td><img class="column_2" src="http://portrit.s3.amazonaws.com/img/check_24.png"/></td>' +
                                    '<td><img class="column_3" src="http://portrit.s3.amazonaws.com/img/check_24.png"/></td>' +
                                '</tr>' +
                                '<tr>' +
                                    '<td><h5 class="table_img_heading">Secret Plus Features</h5></td>' +
                                    '<td><img class="column_1" src="http://portrit.s3.amazonaws.com/img/cross_24.png"/></td>' +
                                    '<td><img class="column_2" src="http://portrit.s3.amazonaws.com/img/cross_24.png"/></td>' +
                                    '<td><img class="column_3" src="http://portrit.s3.amazonaws.com/img/check_24.png"/></td>' +
                                '</tr>' +
                                '<tr>' +
                                    '<td><h5>Price</h5></td>' +
                                    '<td>Free!</td>' +
                                    '<td>3 Referrals or $0.99</td>' +
                                    '<td>Coming soon!</td>' +
                                '</tr>' +
                            '</table>' +
                            you_are_here_html + 
                        '</div>' +
                        '<div class="clear"></div>' +
                            upgrade_option_html +
                        '<div class="clear"></div>';
        $('#context_cont').append(about_html);
        if (mobile && next_level != 'plus'){
            setTimeout(function(){$('#context_cont').fadeIn(100, function(){
                var myScroll = new iScroll('refferal_scroller');
            })}, 450);
        }
        else{
            setTimeout(function(){$('#context_cont').fadeIn(100);}, 450);
        }
        
        if (typeof(_gaq) !== "undefined"){
            _gaq.push(['_trackEvent', 'Upgrade', 'Shown', '']);
        }
    }
    
    function render_tour(){
        var tour_html = '<h1>Welcome to the Portrit Tour</h1>';
        $('#context_cont').append(tour_html);
        setTimeout(function(){$('#context_cont').fadeIn(100);}, 450);
        
        if (typeof(_gaq) !== "undefined"){
            _gaq.push(['_trackEvent', 'Tour', 'Shown', '']);
        }
    }
    
    function render_about(){
        var facebook_frame = '<div id="facebook_frame"><iframe src="http://www.facebook.com/plugins/likebox.php?href=http%3A%2F%2Fwww.facebook.com%2Fapps%2Fapplication.php%3Fid%3D126374870731237&amp;width=292&amp;connections=10&amp;stream=true&amp;header=true&amp;height=587" scrolling="no" frameborder="0" style="border:none; overflow:hidden; width:292px; height:587px;" allowTransparency="true"></iframe></div>';
        if (mobile && !tablet){
            facebook_frame = '';
        }
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
                                        '<a target="_blank" href="http://twitter.com/#!/portritinc">@portritinc</a>' +
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
        setTimeout(function(){$('#context_cont').fadeIn(100);}, 450);
        
        if (typeof(_gaq) !== "undefined"){
            _gaq.push(['_trackEvent', 'About', 'Shown', '']);
        }
    }
    
    function render_contact(){
        var contact_html = '<div id="contact_header">' +
                            '<h1 id="contact_title">Tell Us What\'s Up</h1>' +
                            '<p id="contact_explain">Comments? Love us? Hate us? Found a bug and what to share? Dont hold back, give it to use real.</p>' +
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
                                    '<span class="button awesome">Send Message</span>' +
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
                                    '<span class="button awesome">Submit Report</span>' +
                                '</div>' +
                             '</form>' +
                          '</div>' +
                          '<div class="clear"></div>';
        
        $('#contact_nav li').live('click', function(){
            var name = $(this).attr('name');
            if (name === 'contact'){
                $('#contact_explain').text('Comments? Love us? Hate us? Found a bug and what to share? Dont hold back, give it to use real.');
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
                        $('#contact_form .submit_cont').append('<h2>Thanks for your message. We will get to it soon.</h2>');
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
        setTimeout(function(){$('#context_cont').fadeIn(100);}, 450);
        
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
                            '<p>Portrit\'s current privacy policy is available at <a href="http://portrit.com/#/context=privacy">portrit.com/#/context=privacy</a> (the "Privacy Policy"), which is incorporated by this reference.</p>' +
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
        setTimeout(function(){$('#context_cont').fadeIn(100);}, 450);
        
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
        setTimeout(function(){$('#context_cont').fadeIn(100);}, 450);
        
        if (typeof(_gaq) !== "undefined"){
            _gaq.push(['_trackEvent', 'Privacy', 'Shown', '']);
        }
    }
    
    function info_context_delagate(context){
        comment_form_shown = true;
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
    }
    
    function remove_tooltip_after(){
        $('.upgrade_tooltip_cont').remove();
    }
    
    function render_upgrade_tooltip(element){
        var updagred_tooltip_html = '';
        var start_y = $(element).position().top + 85;
        var start_x = $(element).position().left - 153;
        var height = $(element).height();
        var width = $(element).width();
        var referrals_needed = 3 - referrals;
        var bottom_mid = {'x': start_x + (width / 2),
                            'y': start_y + height};
        var img_html = '<img class="right" src="http://portrit.s3.amazonaws.com/img/upgrade_arrow.png"/>';
                            
        if (Math.abs(start_x) < 153){
            start_x = $(element).position().left - 17;
            bottom_mid = {'x': start_x + (width / 2),
                                'y': start_y + height};
            img_html = '<img class="left" src="http://portrit.s3.amazonaws.com/img/upgrade_arrow.png"/>';
        }
        else if (mobile && !tablet){
            start_x = $(element).position().left - 203;
            bottom_mid = {'x': start_x + (width / 2),
                                'y': start_y + height};
        }
        
        var upgrade_tooltip_html = '<div class="upgrade_tooltip_cont" style="position: absolute; top:' + bottom_mid.y +'px; left:' + bottom_mid.x + 'px;">' +
                                        img_html +
                                        '<a class="social" href="#/upgrade=social"><h2>Upgrade to Unlock</h2><h3>Only ' + referrals_needed + ' Referrals to go!</h3></a>' +
                                    '</div>';

        clearTimeout(upgrade_timeout);
        $('.upgrade_tooltip_cont').remove();
        $(element).parent().append(upgrade_tooltip_html);
        
        if (mobile){
            setTimeout(function(){
                $('.upgrade_tooltip_cont').css({
                    '-moz-transform': 'translate3d(0px, -50px, 0px)',
                    '-webkit-transform': 'translate3d(0px, -50px, 0px)'
                });
            }, 50);
        }
        else{
            setTimeout(function(){
                $('.upgrade_tooltip_cont').css({
                    '-moz-transform': 'translate(0px, -50px)',
                    '-webkit-transform': 'translate(0px, -50px)'
                });
            }, 50);
        }

        
        upgrade_timeout = setTimeout(remove_tooltip_after, 5000);
        
        if (typeof(_gaq) !== "undefined"){
            _gaq.push(['_trackEvent', 'Upgrade', 'Tooltip', 'Shown']);
        }
    }
    
    function show_feedback(e){
        comment_form_shown = true;
        e.stopPropagation();
        if (!mobile){
            $('#wrapper').animate({
                'opacity': '0.3'
            }, 200);
        }
        else{
            $('#wrapper').css({
                'opacity': '0.3'
            });
        }
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
        comment_form_shown = false;
        if (!mobile){
            $('#wrapper').animate({
                opacity: 1.0
            }, 300);
            $('#feedback').fadeOut();
        }
        else{
            $('#wrapper').css({
                'opacity': '1.0'
            });
            $('#feedback').hide();
        }
        
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
                meta_html = '<link rel="stylesheet" href="http://portrit.s3.amazonaws.com/styles/production/mobile.css"/>';
            }
            else{
                meta_html = '<link rel="stylesheet" href="/site_media/styles/trunk/mobile.css"/>';
            }
        }
        else if (mobile && tablet){
            if (typeof(_gaq) !== "undefined"){
                meta_html = '<link rel="stylesheet" href="http://portrit.s3.amazonaws.com/styles/production/tablet.css"/>';
            }
        }
        $('head').append(meta_html);
    }
    
    var notifcation_cache = [ ];
    function wait_for_message(){
        // if (window["WebSocket"]) {
        //     //Has websockets
        //     try{
        //         var recvd = 0;
        //         if (production){
        //             var host = "184.73.249.110:8122";
        //         }
        //         else{
        //             var host = "192.168.1.126:8122";
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
                    //Check if notification is user
                    if (data.payload.nom_data[i].nominator != me.id){
                        if (data.payload.nom_data[i].nominatee == me.id){
                            render_notification("new_nom", data.payload.nom_data[i]);
                            update_notifications(data.payload.nom_data[i], 'new_nom');
                            notifcation_cache.unshift({
                                'data': data.payload.nom_data[i],
                                'method': 'new_nom'
                            });
                        }

                        //Update my feed
                        if (my_feed){
                            active_noms_cache[data.payload.nom_data[i].id] = data.payload.nom_data[i];
                            if (active_nom_cats_map[data.payload.nom_data[i].nomination_category.replace(' ', '_').toLowerCase()]){
                                active_nom_cats_map[data.payload.nom_data[i].nomination_category.replace(' ', '_').toLowerCase()].push(data.payload.nom_data[i].id);
                            }
                            else{
                                active_nom_cats_map[data.payload.nom_data[i].nomination_category.replace(' ', '_').toLowerCase()] = [data.payload.nom_data[i].id];
                            }
                            for (var k = 0; k < my_feed.length; k++){
                                if (my_feed[k].cat_name == data.payload.nom_data[i].nomination_category){
                                    my_feed[k].noms.push(data.payload.nom_data[i]);
                                }
                            }
                        }
                        if (user_winning_noms_cache[data.payload.nom_data[i].nominatee] && data.payload.nom_data[i].nominator != me.id){
                            user_winning_noms_cache[data.payload.nom_data[i].nominatee].active_nom_objs.push(data.payload.nom_data[i]);
                        }
                    }
                }
                if ($('#empty_noms_cont').length > 0 && $('#new_noms_action').length == 0){
                    $('#scroller').prepend('<div id="new_noms_action" style="display:none;"><h2>New nominations have arrived! Click to view.</h2></div>');
                    $('#new_noms_action').fadeIn();
                    $('#new_noms_action').bind('click', function(){
                        $('#new_noms_action').unbind('click');
                        stream_view = '';
                        recent_noms_click();
                    });
                }
                else if (view_active == 'main' && default_view == 'wall' && stream_view == 'recent_noms'){
                    inject_nom_stream(data.payload.nom_data);
                }
                else if (view_active == 'main' && default_view == 'wall'){
                    update_feed(data.payload);
                }
                else if (view_active == 'nom_detail'){
                    inject_nom_detail(data.payload.nom_data);
                }
                if ($('#empty_noms_cont').length > 0){
                    // $('#empty_noms_cont').fadeOut(function(){
                    //     $(this).remove();
                    //     $('#profile_cont').fadeIn();
                    // });
                }
            }
            else if (data.method == 'vote'){
                if (data.payload.vote_user != me.id){
                    if (my_feed){
                        if (active_noms_cache[data.payload.nom_id]){
                            active_noms_cache[data.payload.nom_id].vote_count = data.payload.vote_count;
                            active_noms_cache[data.payload.nom_id].votes.push({'vote_user': data.payload.vote_user, 'vote_name': data.payload.vote_name});
                        }
                        // for (var i = 0; i < my_feed.length; i++){
                        //     if (my_feed[i].cat_name == data.payload.nomination_category){
                        //         for (var j = 0; j < my_feed[i].noms.length; j++){
                        //             if (my_feed[i].noms[j].id == data.payload.nom_id){
                        //                 // my_feed[i].noms[j].vote_count = data.payload.vote_count;
                        //                 // my_feed[i].noms[j].votes.push({'vote_user': data.payload.vote_user, 'vote_name': data.payload.vote_name});
                        //             }
                        //         }
                        //     }
                        // }
                    }
                    if (view_active == 'main' && default_view == 'wall' && stream_view == 'recent_noms'){
                        update_vote_count(data.payload);
                    }
                    else if (view_active == 'main' && default_view == 'wall'){
                        update_vote_count(data.payload);
                    }
                    else if (view_active == 'nom_detail'){
                        update_vote_count(data.payload);
                    }
                }
                if (user_winning_noms_cache[data.payload.nominatee]){
                    var active_nom_objs = user_winning_noms_cache[data.payload.nominatee].active_nom_objs;
                    for (var i = 0; i < active_nom_objs.length; i++){
                        if (data.payload.nom_id == active_nom_objs[i].id){
                            active_nom_objs[i].vote_count = data.payload.vote_count;
                        }
                    }
                }
            }
            else if (data.method == 'new_comment'){                        
                if (data.payload.comment_sender_id != me.id){
                    if (data.payload.won){
                        winning_noms_cache[data.payload.id].comment_count += 1;
                        if (winning_noms_cache[data.payload.id].comments){
                            winning_noms_cache[data.payload.id].comments.unshift({
                               'comments': {
                                   'comment': data.payload.comment,
                                   'id': data.payload.comment_id,
                                   'owner_id': data.payload.comment_sender_id,
                                   'owner_name': data.payload.comment_sender_name,
                                   'create_datetime': data.payload.create_datetime
                               } 
                            });
                        }
                    }
                    else{
                        active_noms_cache[data.payload.id].comment_count += 1;
                        if (active_noms_cache[data.payload.id].comments){
                            active_noms_cache[data.payload.id].comments.unshift({
                               'comments': {
                                   'comment': data.payload.comment,
                                   'id': data.payload.comment_id,
                                   'owner_id': data.payload.comment_sender_id,
                                   'owner_name': data.payload.comment_sender_name,
                                   'create_datetime': data.payload.create_datetime
                               } 
                            });
                        }
                    }

                    render_notification("new_comment", data.payload);
                    update_notifications(data.payload, 'new_comment');
                    notifcation_cache.unshift({
                        'data': data.payload,
                        'method': 'new_comment'
                    });
                    if (view_active == 'nom_detail'){
                        if (data.payload.id == $('#main_nom_cont').attr('value') && data.payload.comment_sender_id != me.id){
                            render_comment_update(data.payload);
                        }
                    }
                    else if (view_active == 'main' && default_view == 'wall'){
                        update_comment_count(data.payload);
                        if (stream_view == 'recent_noms'){
                            render_recent_comment_update(data.payload);
                        }
                    }
                }
            }
            else if (data.method == 'nom_won'){
                notifcation_cache.unshift({
                    'data': data.payload,
                    'method': 'nom_won'
                });
                render_notification("nom_won", data.payload);
                update_notifications(data.payload, 'nom_won');
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
                                    '<a href="#/user=' + data.comment_sender_id + '" class="clear_profile">' +
                                        '<img class="user_photo" src="https://graph.facebook.com/' + data.comment_sender_id + '/picture?type=square"/>' +
                                    '</a>' +
                                    '<a href="#?user=' + data.comment_sender_id + '" class="post_username from_username clear_profile">' + data.comment_sender_name + '</a>' +
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
        var comment_cont_html ='<div class="comment" style="display:none;">' +
                                    '<p class="comment_time" value="' + data.create_datetime + '">Right now</p>' +
                                    '<a href="#/user=' + data.comment_sender_id + '" class="clear_profile">' +
                                        '<img class="user_photo" src="https://graph.facebook.com/' + data.comment_sender_id + '/picture?type=square"/>' +
                                    '</a>' +
                                    '<a href="#?user=' + data.comment_sender_id + '" class="post_username from_username clear_profile">' + data.comment_sender_name + '</a>' +
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
        var notification_html = '',
            method_html = '';
        
        if (method == 'new_nom'){
            var nominator = ''
            if (data.nominator != me.id){
                nominator = friends[data.nominator].name;
            }
            else{
                nominator = 'You';
            }
            
            method_html =   '<div class="nom_cat_' + data.nomination_category.replace(' ', '_').toLowerCase() + ' notification_color"></div>' +
                            '<div class="notification_text_cont">' +
                                '<p class="strong">' + nominator + '</p>' + '<span> nominated your photo for the </span><p class="strong">' + data.nomination_category + '</p><span> trophy!</span>' +
                            '</div>';
                            
            user_notifications.new_noms[data.id] = data;
        }
        else if (method == 'new_comment'){
            if (data.nom_owner_id == me.id){
                method_html =   '<div class="nom_cat_' + data.nomination_category.replace(' ', '_').toLowerCase() + ' notification_color"></div>' +
                                '<div class="notification_text_cont">' +
                                    '<p class="strong">' + data.comment_sender_name + '</p>' + '<span> commented on your <p class="strong">' + data.nomination_category + '</p> nomination!</span>' +
                                '</div>';
            }
            else if (data.nom_owner_id == data.comment_sender_id){
                method_html =   '<div class="nom_cat_' + data.nomination_category.replace(' ', '_').toLowerCase() + ' notification_color"></div>' +
                                '<div class="notification_text_cont">' +
                                    '<p class="strong">' + data.comment_sender_name + '</p>' + '<span> commented on their <p class="strong">' + data.nomination_category + '</p> nomination!</span>' +
                                '</div>';
            }
            else{
                method_html =   '<div class="nom_cat_' + data.nomination_category.replace(' ', '_').toLowerCase() + ' notification_color"></div>' +
                                '<div class="notification_text_cont">' +
                                    '<p class="strong">' + data.comment_sender_name + '</p>' + '<span> commented on <span class="strong">' + data.nom_owner_name + '\'s</span> <p class="strong">' + data.nomination_category + '</p> nomination!</span>' +
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
                var name = '';
                // if (!data.nominatee_name){
                    name = friends[data.nominatee].name;
                // }
                // else{
                //     name = data.nominatee_name;
                // }
                method_html =   '<div class="nom_cat_' + data.nomination_category.replace(' ', '_').toLowerCase() + ' notification_color"></div>' +
                                '<div class="notification_text_cont">' +
                                    '<p class="strong">' + name + '\'s</p>' + '<span> photo won the <p class="strong">' + data.nomination_category + '</p> nomination!</span>' +
                                '</div>';
            }
        }
        
        notification_html = '<div class="notification_popup" style="display:none;" value="' + data.id + '">' +
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
            nom_id = $(this).attr('value');
        window.location.href = '#/nom_id=' + nom_id;
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
    
    function update_notifications(data, method){
        var notification_html = '',
            name = '',
            nom_cat = '',
            owner_text = '';
        nom_cat = data.nomination_category.replace(' ', '_').toLowerCase();
        if (method == 'new_nom'){
            if (friends[data.nominator]){
                name = friends[data.nominator].name;
            }
            else if (data.nominator == me.id){
                name = 'You';
            }
            else{
                name = '';
            }
            notification_html = '<div class="notification_popup_cont color_transition nom_cat_'  + nom_cat + '" name="' + nom_cat + '" value="' + data.id + '" read="0" id="notification_' + data.notification_id + '" onclick="void(0)">' +
                                    '<div class="nom_cat_' + nom_cat +' notification_color"></div>' +
                                    '<div class="notification_text_cont">' +
                                        '<p class="strong" style="">' + name +'</p>' +
                                        '<span> nominated your photo.</span><span class="time"> - Right now</span>' +
                                    '</div>' +
                                    '<div class="kill_notification close_img ' + close_size + '" value="' + data.notification_id + '" style="display:none;"></div>' +
                                '</div>'
        }
        else if (method == 'new_comment'){
            if (data.comment_sender_id == me.id){
                name = 'You';
            }
            else{
                name = data.comment_sender_name;
            }
            if (data.nom_owner_id == me.id){
                owner_text = 'your';
            }
            else{
                if (friends[data.nom_owner_id]){
                    owner_text = friends[data.nom_owner_id].name + '\'s';
                }
                else{
                    owner_text = '';
                }
            }
            
            notification_html = '<div class="notification_popup_cont color_transition nom_cat_'  + nom_cat + '" name="' + nom_cat + '" value="' + data.id + '" read="0" id="notification_' + data.notification_id + '" onclick="void(0)">' +
                                    '<div class="nom_cat_' + nom_cat +' notification_color"></div>' +
                                    '<div class="notification_text_cont">' +
                                        '<p class="strong" style="">' + name +'</p>' +
                                        '<span> commented on ' + owner_text + ' photo.<span class="time"> - Right now</span>' +
                                    '</div>' +
                                    '<div class="kill_notification close_img ' + close_size + '" value="' + data.notification_id + '" style="display:none;"></div>' +
                                '</div>'
        }
        else if (method == 'nom_won'){
            if (data.nominatee == me.id){
                name = 'Your';
            }
            else if(!data.nominatee_name){
                name = friends[data.nominatee].name + '\'s';
            }
            else{
                name = data.nominatee_name + '\'s';
            }
            notification_html = '<div class="notification_popup_cont color_transition nom_cat_'  + nom_cat + '" name="' + nom_cat + '" value="' + data.id + '" read="0" won="true" id="notification_' + data.notification_id + '" onclick="void(0)">' +
                                    '<div class="nom_cat_' + nom_cat +' notification_color"></div>' +
                                    '<div class="notification_text_cont">' +
                                        '<p class="strong" style="">' + name +'</p>' +
                                        '<span> photo won the </span><p class="strong" style="">' + data.nomination_category + '</p><span> trophy!</span><span class="time"> - Right now</span>' +
                                    '</div>' +
                                    '<div class="kill_notification close_img ' + close_size + '" value="' + data.notification_id + '" style="display:none;"></div>' +
                                '</div>'
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
                else if(!data[i].source_name && data[i].source_id){
                    source_name = friends[data[i].source_id].name + '\'s';
                }
                else{
                    source_name = data[i].source_name;
                }
                
                if (data[i].destination_id == me.id){
                    if (data[i].notification_type == 'nom_won'){
                        dest_name = "Your";
                    }
                    else{
                        dest_name = 'Your';
                    }
                }
                else if(!data[i].destination_name){
                    dest_name = friends[data[i].destination_id].name + '\'s';
                }
                else{
                    dest_name = data[i].destination_name + '\'s';
                }
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
                now = new Date();
                time = new Date(data[i].create_time * 1000);
                now -= time;
                now /= 1000
                time_str = secondsToHms(parseInt(now));
                if (data[i].notification_type == 'new_nom'){
                    notification_html +='<div class="notification_popup_cont ' + color_class + '" name="' + nom_cat + '" value="' + data[i].nomination + '" read="' + data[i].read + '" id="notification_' + data[i].notification_id + '" time="' + data[i].create_time +'" onclick="void(0)">' +
                                            '<div class="nom_cat_' + nom_cat + ' notification_color"></div>' +
                                            '<div class="notification_text_cont">' +
                                                '<p class="strong">' + source_name + '</p><span> nominated your photo.<span class="time"> - ' + time_str + '</span>' +
                                            '</div>' +
                                            '<div class="kill_notification close_img ' + close_size + '" value="' + data[i].notification_id + '" style="display:none;"></div>' +
                                        '</div>';
                }
                else if (data[i].notification_type == 'new_comment'){
                    notification_html +='<div class="notification_popup_cont ' + color_class + '" name="' + nom_cat + '" value="' + data[i].nomination + '" read="' + data[i].read + '" id="notification_' + data[i].notification_id + '" time="' + data[i].create_time +'" onclick="void(0)">' +
                                            '<div class="nom_cat_' + nom_cat + ' notification_color"></div>' +
                                            '<div class="notification_text_cont">' +
                                                '<p class="strong">' + source_name + '</p><span> commented on ' + dest_name + ' photo.<span class="time"> - ' + time_str + '</span>' +
                                            '</div>' +
                                            '<div class="kill_notification close_img ' + close_size + '" value="' + data[i].notification_id + '" style="display:none;"/></div>' +
                                        '</div>';
                }
                else if (data[i].notification_type == 'nom_won'){
                    notification_html +='<div class="notification_popup_cont ' + color_class + '" name="' + nom_cat + '" value="' + data[i].nomination + '" read="' + data[i].read + '" id="notification_' + data[i].notification_id + '" won="true" time="' + data[i].create_time +'" onclick="void(0)">' +
                                            '<div class="nom_cat_' + nom_cat + ' notification_color"></div>' +
                                            '<div class="notification_text_cont">' +
                                                '<p class="strong">' + dest_name + '</p><span> photo won the </span><p class="strong">' + data[i].nomination_category + '</p><span> trophy!</span><span class="time"> - ' + time_str + '</span>' +
                                            '</div>' +
                                            '<div class="kill_notification close_img ' + close_size + '" value="' + data[i].notification_id + '" style="display:none;"/></div>' +
                                        '</div>';
                    if (data[i].destination_id == me.id){
                        my_winnings.push({'fb_user': data[i].source_id, 'cat': data[i].nomination_category, 'nom_id': data[i].nomination, 'notification_id': data[i].notification_id});
                        // render_publish_story(data[i].source_id, data[i].nomination_category, 'won');
                    }
                }
                notifcation_cache.unshift({
                    'data': data[i],
                    'method': data[i].notification_type
                });
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
            trophy_count_text = 'trophy';
            trophy_won_text = 'won the ' + data[0].cat + ' trophy for his rockin\' photo!';
            trophy_html = '<img src="http://portrit.s3.amazonaws.com/img/invite/' + cat_underscore + '.png"/>';
        }
        else{
            //Blank trophy
            trophy_won_text = 'won ' + data.length + ' trophies for his rockin\' photos!';
            trophy_html = '<img src="http://portrit.s3.amazonaws.com/img/invite/blank.png"/>';
        }
        
        publish_story_html ='<div id="publish_story_cont">' +
                                '<h1>Congratulations!</h1>' +
                                '<h2>You have won ' + data.length + ' ' + trophy_count_text + ' since your last visit.</h2>' +
                                '<div id="story_cont">' +
                                    '<img src="https://graph.facebook.com/' + me.id + '/picture?type=square"/>' +
                                    '<textarea></textarea>' +
                                '</div>' +
                                '<div id="story_preview">' +
                                    '<div id="preview_left">' +
                                        trophy_html +
                                        '<div id="preview_left_bottom">' +
                                            '<img src="http://portrit.s3.amazonaws.com/img/favicon.png"/>' +
                                            '<span>via Portrit</span>' +
                                            '<div class="clear"></div>' +
                                        '</div>' +
                                    '</div>' +
                                    '<div id="preview_right">' +
                                        '<a id="trophy_won_nom_link">' + name + ', ' + trophy_won_text + '</a>' +
                                        '<span id="trophy_won_nom_caption">Click the trophy to see ' + name + '\'s winning photos.</span>' +
                                        '<p id="trophy_won_nom_desc"></p>' +
                                    '</div>' +
                                    '<div class="clear"></div>' +
                                '</div>' +
                            '</div>' +
                            '<div id="publish_controls">' + 
                                '<span class="awesome large" value="' + nom_id + '" name="' + notification_ids + '" id="skip_publish">Skip & View</span>' +
                                '<span class="awesome large" value="' + nom_id + '" name="' + notification_ids + '" id="publish_story">Share & View</span>' +
                                '<div class="clear"></div>' +
                            '</div>';;
        $('#context_overlay_cont').addClass('publish_story_overlay');
        $('#context_overlay_cont > div').append(publish_story_html);
        show_context_overlay(true);
        
        $('#publish_story').bind('click', function(){
            var nom_ids = $(this).attr('value');
            
            var trophy_img_src = '';
            if (data.length == 1){
                trophy_img_src = 'http://portrit.s3.amazonaws.com/img/invite/' + cat_underscore + '.png';
            }
            else{
                trophy_img_src = 'http://portrit.s3.amazonaws.com/img/invite/blank.png';
            }
            var link = 'http://184.73.249.104/#/nom_id=' + data[0].nom_id + '/ref=facebook';
            var name = $('#trophy_won_nom_link').text();
            var caption = $('#trophy_won_nom_caption').text();
            var description = $('#story_cont textarea').val();
            
            // $.post('https://graph.facebook.com/' + me.id + '/feed', {'access_token': fb_session.access_token, 'picture': trophy_img_src, 'link': link, 'name': name, 'caption': caption}, function(response){
            //     var test = response;
            // });
            
            close_context_overlay();
            
            $('#story_cont textarea').unbind('focus');
            $('#story_cont textarea').unbind('blur');
            $('#story_cont textarea').unbind('keyup');
            $('#skip_publish').unbind('click');
            $('#publish_story').unbind('click');
            $('#close_overlay').unbind('click');
            
            $.post('/notification_read/', {'notification_ids': notification_ids}, function(){

            });
            
            window.location.href = '/#/nom_id=' + nom_ids;
        });

        $('#skip_publish').bind('click', function(){
            var nom_ids = $(this).attr('value');
            var notification_ids = $(this).attr('name');
            close_context_overlay();
            
            $('#story_cont textarea').unbind('focus');
            $('#story_cont textarea').unbind('blur');
            $('#story_cont textarea').unbind('keyup');
            $('#skip_publish').unbind('click');
            $('#publish_story').unbind('click');
            $('#close_overlay').unbind('click');
            
            $.post('/notification_read/', {'notification_ids': notification_ids}, function(){

            });
            window.location.href = '/#/nom_id=' + nom_ids + '/won/user=' + me.id;
        });
        
        $('#close_overlay').bind('click', function(){
            var notification_ids = $('#skip_publish').attr('name');
            close_context_overlay();
            
            $('#story_cont textarea').unbind('focus');
            $('#story_cont textarea').unbind('blur');
            $('#story_cont textarea').unbind('keyup');
            $('#skip_publish').unbind('click');
            $('#publish_story').unbind('click');
            $('#close_overlay').unbind('click');
            
            $.post('/notification_read/', {'notification_ids': notification_ids}, function(){

            });
        })
        
        $('#story_cont textarea').bind('focus', function(){
            comment_form_shown = true;
        });
        
        $('#story_cont textarea').bind('blur', function(){
            comment_form_shown = false
        });

        $('#story_cont textarea').bind('keyup', function(){
            $('#preview_right p').text($(this).val());
        });
    }
    
    $('.notification_popup_cont').live('click', function(){
        var nom_id = $(this).attr('value');
        var read = $(this).attr('read');
        var won = $(this).attr('won');
        var won_url = '';
        var notification_id = $(this).attr('id').replace('notification_', '');
        
        if (read == 'false' || read == false){
            $(this).attr('read', 'true');
            $.post('/notification_read/', {'notification_id': notification_id}, function(){
                
            });
        }
        if (won){
            won_url = '/won';
        }
        
        window.location.href = '#/nom_id=' + nom_id + won_url;
    });
    
    $('.notification_popup_cont').live('mouseover mouseout', function(event) {
        var cat_name = $(this).attr('name');
        if (event.type == 'mouseover') {
            $(this).addClass('nom_cat_' + cat_name).removeClass('color_transition');
            $(this).css({
                'color': 'white'
            });
            $(this).find('p').css({
                'color': 'white'
            });
            $(this).find('.kill_notification').show();
        } else {
            $(this).removeClass('nom_cat_' + cat_name);
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
        $.post('/notification_read/', {'notification_id': notification_id}, function(){
            
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
            read = $(this).attr('read');
            if (read == '0' || read == false || read == 'false'){
                notification_ids += $(this).attr('id').replace('notification_', '') + ',';
            }
        });
        if (notification_ids != ''){
            $.post('/notification_read/', {'notification_ids': notification_ids}, function(){

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
                $(this).find('.time').text(' - ' + time_str);
            });
            
            if ($('.notification_popup_cont').length > 5){
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
            $('#skip_tut').live('click', function(){
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
                                    '<span id="tut_completed_go" class="awesome large">Continue</span>';
            
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
        // var tut_link_left = $('#activate_tut').offset().left - ($('#tutorial_cont').width() / 2) + 22;
        $('#tutorial_cont').fadeIn();
    }
    
    function hide_tut(){
        $('#tutorial_cont').fadeOut();
    }
    
    function attach_initial_tut_handlers(tut_counts){
        $('#close_initial_tut, #tut_go_cont span').live('click', function(){
            if (!mobile){
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
            }
            else{
                $('#initial_tut_cont').remove();
                $('#wrapper').css({
                    'opacity': '1.0',
                    'min-height': '100%'
                });
                if (!mobile || tablet){
                    render_tut(tut_counts);
                }
                init_view(update_view);
            }
            $('#close_initial_tut, #tut_go_cont span').die('click');
        });
        
        $('#allow_notifications').live('click', function(){
            var checked = $(this).attr('checked')
            
            if (checked == 'true'){
                allow_notifications = false;
                $(this).attr('checked', 'false');
                $(this).removeClass().addClass('unchecked');
            }
            else{
                allow_notifications = true;
                $(this).attr('checked', 'true');
                $(this).attr('src', 'http://portrit.s3.amazonaws.com/img/checked_box.png');
                $(this).removeClass().addClass('checked');
            }
            $.post('/change_user_notifications/', {'allow_notifications': allow_notifications}, function(data){
                
            });
        });
        
        $('.tut_point li').live('mouseover mouseout', function(event) {
            if (event.type == 'mouseover') {
                show_like_tooltip(this);
            } else {
                hide_like_tooltip(this);
            }
        });
    }
    
    function render_initial_tutorial(tut_counts){
        if (!mobile){
            $('#wrapper').animate({
                'opacity': '0.3'
            }, 350);
        }
        else{
            $('#wrapper').css({
                'opacity': '0.3'
            });
        }
        var initial_tut_html =  '<div id="initial_tut_cont">' +
                                    '<div id="initial_tut_wrap">' +
                                        '<div id="initial_tut_top_wrap">' +
                                            '<h1>Welcome to Portrit. Let\'s Get Started.</h1>' +
                                            '<div class="tut_point">' +
                                                '<h2 class="tut_point_num nom_cat_fail">1</h2>' +
                                                '<h3>Nominate Your Friends</h3>' + 
                                                '<p>Portrit is all about finding the best photos between you and your friends. Look through your friend\'s photos, or your own and find those rockin\' pics. Go with your gut and choose one of the trophies bellow.</p>' +
                                                '<ul>' +
                                                    '<p class="tooltip"></p>' +
                                                    '<li name="Hot">' +
                                                        '<div class="trophy_img medium hot"></div>' +
                                                    '</li>' +
                                                    '<li name="LOL">' +
                                                        '<div class="trophy_img medium lol"></div>' +
                                                    '</li>' +
                                                    '<li name="Artsy">' +
                                                        '<div class="trophy_img medium artsy"></div>' +
                                                    '</li>' +
                                                    '<li name="FAIL">' +
                                                        '<div class="trophy_img medium fail"></div>' +
                                                    '</li>' +
                                                    '<li name="Party Animal">' +
                                                        '<div class="trophy_img medium party_animal"></div>' +
                                                    '</li>' +
                                                    '<li name="Cute">' +
                                                        '<div class="trophy_img medium cute"></div>' +
                                                    '</li>' +
                                                    '<li name="WTF">' +
                                                        '<div class="trophy_img medium wtf"></div>' +
                                                    '</li>' +
                                                    '<li name="Creepy">' +
                                                        '<div class="trophy_img medium creepy"></div>' +
                                                    '</li>' +
                                                '</ul>' +
                                                '<div class="clear"></div>' + 
                                            '</div>' +
                                            '<div class="tut_point">' +
                                                '<h2 class="tut_point_num nom_cat_lol">2</h2>' +
                                                '<h3>Vote On Your Favorite</h3>' + 
                                                '<p>It\'s up to you and your friends to decide who earns a trophy. Take a look through all the Hot, WTF, FAIL, etc photos and give your opinion. Love it, vote it up. Hate it, vote it down.</p>' +
                                                '<img src="http://portrit.s3.amazonaws.com/img/vote.png"/>' +
                                                '<div class="clear"></div>' +
                                            '</div>' +
                                            '<div class="tut_point">' +
                                                '<h2 class="tut_point_num nom_cat_party_animal">3</h2>' +
                                                '<h3>Build Up Your Trophy Room</h3>' + 
                                                '<p>Got amazing photos? Earn trophies for your hard work. Friends see your winning photos first, so your best photos are always first to be seen. Don\'t sweat not winning, everything starts fresh the next day, so your hilarious LOLcat photo can live again.</p>' +
                                                '<img src="http://portrit.s3.amazonaws.com/img/trophy_room.png"/>' +
                                                '<div class="clear"></div>' +
                                            '</div>' +
                                            '<div id="allow_notifications_cont">' +
                                                '<label for="allow_notifications">Allow Portrit to post on your wall when you win a trophy: </label>' +
                                                '<div id="allow_notifications" class="checked" checked="true"></div>' +
                                                '<div class="clear"></div>' +
                                            '</div>' +
                                        '</div>' +
                                        '<div id="initial_tut_bottom_wrap">' +
                                            '<div id="tut_go_cont">' +
                                                '<h2>Enjoy your stay.</h2>' +
                                                '<span class="awesome large green">Go</span>' +
                                            '</div>' +
                                        '</div>' +
                                        '<img id="box_img" src="http://portrit.s3.amazonaws.com/img/boxtrophy.png"/>' +
                                        '<img id="landfill_img" src="http://portrit.s3.amazonaws.com/img/landfilltrophy.png"/>' +
                                        '<p id="close_initial_tut" class="close_img ' + close_size +'"></p>' +
                                    '</div>' +
                                '</div>';
        $('body').append(initial_tut_html);
        if (!mobile || tablet){
            if ($(window).height() < 1450){
                $('#wrapper').css('min-height', 1450);
            }
        }
        
        attach_initial_tut_handlers(tut_counts);
    }
    
    var portrit_friends = null;
    var notification_data = null;
    var allow_notifications = true;
    var server_login_timeout = null;
    function login_fb_user(){
        $('#cont').prepend('<div class="loading"><h1>Portrit Loading...</h1><div id="loader"><img src="http://portrit.s3.amazonaws.com/img/album-loader-dark.gif"/></div></div>');
        setTimeout(render_server_dead, 5000);
        $.post('/login_fb_user/', function(data){
            clearTimeout(server_login_timeout);
            if (data){
                var tut_counts = null;
                var first = false;
                portrit_friends = data.portrit_friends; 
                notification_data = data.notifications;
                // my_feed = JSON.parse(data.stream);
                tut_counts = data.tut_counts;
                allow_notifications = data.allow_notifications;
                first = data.first;
                if (first){
                    $('#right_nav').prepend('<div id="activate_tut"><div id="tutorial_cont" style="display:none;"><div id="tut_arrow"></div><h1>Tutorial</h1><div id="tut_section_wrap"><div class="tut_section" id="nomination_tut"></div><div class="tut_section" id="vote_count_tut"></div><div class="tut_section" id="comment_count_tut"></div></div><a id="skip_tut" class="awesome large">Skip</a></div></div>');
                    render_initial_tutorial(tut_counts);
                }
                else{
                    if (tut_counts && (!mobile || tablet)){
                        $('#right_nav').prepend('<div id="activate_tut"><div id="tutorial_cont" style="display:none;"><div id="tut_arrow"></div><h1>Tutorial</h1><div id="tut_section_wrap"><div class="tut_section" id="nomination_tut"></div><div class="tut_section" id="vote_count_tut"></div><div class="tut_section" id="comment_count_tut"></div></div><a id="skip_tut" class="awesome large">Skip</a></div></div>');
                        render_tut(tut_counts);
                    }
                    init_view(update_view);
                }
            }
            $('.loading').remove();
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
                'hidden': false,
                'id': key
            });
        }
    }
    
    function init_view(func_ptr){
        // $('#cont').append('<img id="login_loader" src="http://portrit.s3.amazonaws.com/img/album-loader-dark.gif"/>');
        if (window.sessionStorage !== undefined){
            me = sessionStorage.getItem('me');
            photo_filter = sessionStorage.getItem('photo_filter');
            default_view = sessionStorage.getItem('default_view');
            stream_view = sessionStorage.getItem('stream_view');
        }
        if (default_view === null){
            default_view = 'wall';
            sessionStorage['default_view'] = JSON.stringify(default_view);
        }
        else{
            default_view = JSON.parse(default_view);
        }
        if (stream_view === null){
            stream_view = 'recent';
            sessionStorage['stream_view'] = JSON.stringify(stream_view);
        }
        else{
            stream_view = JSON.parse(stream_view);
        }
        if (me === null){
            FB.api('/me', function(response) {
                if (window.sessionStorage !== undefined){
                    sessionStorage.setItem('me', JSON.stringify(response));
                }
                me = response;
                
                $.getJSON('https://api.facebook.com/method/stream.getFilters?access_token=' + fb_session.access_token + '&format=json&callback=?', function(data){
                    for (var i = 0; i < data.length; i++){
                        if (data[i].name == 'Photos'){
                            photo_filter = data[i].filter_key;
                            sessionStorage['photo_filter'] = photo_filter;
                            break;
                        }
                    }
                });
                wait_for_message();
                load_user_data();
                
            });
        }
        else{
            me = JSON.parse(me);
            wait_for_message();
            load_user_data();
        }
        if (window.sessionStorage !== undefined){
            friends = sessionStorage.getItem('friends');   
        }
        if (friends === null){
            FB.api('/me/friends', function(response) {
                friends = { };
                load_friend_dict(response.data);
                load_friend_array(friends);
                friend_array = friend_array.sort(sort_friends);
                if (window.sessionStorage !== undefined){
                    sessionStorage.setItem('friends', JSON.stringify(friends));
                }
                $('#header').css({'border-bottom': '1px solid #1E1E1E'});
                
                load_friends();
            });   
        }
        else{
            friends = JSON.parse(friends);
            load_friend_array(friends);
            friend_array = friend_array.sort(sort_friends);
            $('#right_nav').fadeIn();
            $('#left_nav').fadeIn();
            $('#header').css({'border-bottom': '1px solid #1E1E1E'});
            
            load_friends();
        }
        //Check if callbacks have returned
        var user_data_load_interval = setInterval(function(){
            if (friends && me){
                clearInterval(user_data_load_interval);
                func_ptr();
            }
        }, 50);
    }
    
    function show_search_view(){
        search_active = true
        if (!mobile){
            $('#search').fadeIn();
            $('#wrapper').animate({
                'opacity': '0.3'
            }, 350, function(){
                $('#query').focus();
            });
        }
        else{
            $('#search').show();
            $('#wrapper').css({
                'opacity': '0.3'
            });
            $('#query').focus();
        }
        
        if (typeof(_gaq) !== "undefined"){
            _gaq.push(['_trackEvent', 'Search', 'Shown', '']);
        }
        
        // $('#query').bind('blur', hide_search_view);
        $(document).bind('click', hide_search_view);
    }
    
    function hide_search_view(){
        $(document).unbind('click', hide_search_view);
        // $('#query').unbind('blur', hide_search_view);
        $('.autocomplete').hide();
        if (!mobile){
            $('#search').fadeOut();
            $('#wrapper').animate({
                'opacity': '1.0'
            }, 350);
        }
        else{
            $('#search').hide();
            $('#wrapper').css({
                'opacity': '1.0'
            });
        }
        
        $('.autocomplete').children().remove();
        $('#query').val('');
        search_string = '';
        search_active = false;
    }
    
    var load_next_clicked = false;
    var load_prev_clicked = false;
    function load_next_picture(){
        if (selected_photo !== ''){
            // if (mobile && !tablet){
            //     var img_x = $('#' + selected_photo).parent().next().position().left;
            //     var img_width = $('#' + selected_photo).parent().next().width() / 2;
            //     var screen_center = ($('#photo_cont').width() / 2) - img_width;
            //     img_x = -img_x;
            //     img_x += screen_center
            //     gallery_scroll.scrollTo(img_x, 0, '200ms');                
            // }
            load_next_clicked = true;
            load_prev_clicked = false;
            $('#' + selected_photo).parent().next().click();
        }
    }
    
    function load_previous_picture(){
        if (selected_photo !== ''){
            // if (mobile && !tablet){                
            //     var img_x = $('#' + selected_photo).parent().prev().position().left;
            //     var img_width = $('#' + selected_photo).parent().prev().width() / 2;
            //     var screen_center = ($('#photo_cont').width() / 2) - img_width;
            //     img_x = -img_x;
            //     img_x += screen_center
            //     gallery_scroll.scrollTo(img_x, 0, '200ms');
            // }
            load_prev_clicked = true;
            load_next_clicked = false;
            $('#' + selected_photo).parent().prev().click();
        }
    }
    
    function load_selected(value, data){
        for (var i = 0; i < friend_array.length; i++){
            if (friend_array[i].name === value){
                selected_user = get_friend_id_by_name(value);
                $('#profile_cont').html('');
                user_profile = null;
                user_likes = null;
                user_movies = null;
                user_books = null;
                user_feed = null;
                selected_album_id = '';
                selected_photo = '';
                hide_search_view();
                update_urls();
            }
        }
    }
    
    function sort_friends(a, b){
        var x = a.name.toLowerCase();
        var y = b.name.toLowerCase();
        return ((x < y) ? -1 : ((x > y) ? 1 : 0));
    }
    
    function get_friend_id_by_name(name){
        for (var i = 0; i < friend_array.length; i++){
            if (friend_array[i].name == name){
                return friend_array[i].id
            }
        }
        return null;
    }
    
    function format_result(value, data, currentValue){
        var friend_id = get_friend_id_by_name(value);
        
        var pattern = '(' + currentValue.replace(reEscape, '\\$1') + ')';
        value = value.replace(new RegExp(pattern, 'gi'), '<strong>$1<\/strong>');
        var query_type = "";
        
        
        
        value = '<img class="profile_photo" src="https://graph.facebook.com/' + friend_id + '/picture?type=square"/>' + '<p>' + value + '</p><span class="clear"></span>';
        return value;
    }
    
    function load_user_data(){
        $('#profile_pic').html('<a href="#/user=' + me.id + '"><img src="https://graph.facebook.com/' + me.id + '/picture?type=square"/></a>');
        $('#profile_pic').after('<img src="http://static.ak.fbcdn.net/images/connect_favicon.png"/>');
    	$('title').text('Portrit - ' + me.name);
	}
    
    function render_friends(){
        var friend_html = "";
        var image_html = "";
        var name_html = "";
        var alpha_html = "";
        var first_alpha = false;
        var last_alpha = false;
        var alpha_class = "";
        var last_alpha_name = '';
        var first_alpha_char = '';
        var first_alpha_friend = null;
        friends_alpha = [ ];
        for (var i = 0; i < friend_array.length; i++){
            if (friend_array[i].hidden === false){
                alpha_html = '';
                if (friends_alpha[friend_array[i].name[0]] === undefined){
                    first_alpha_char = friend_array[i].name[0];
                    friends_alpha[friend_array[i].name[0]] = [friend_array[i]];
                    if (i > 0){
                        last_alpha = true;
                        last_alpha_name = friend_array[i - 1].name.split(' ')[0];
                    }
                    first_alpha = true;
                    alpha_class = 'has_alpha';
                }
                else{
                    friends_alpha[friend_array[i].name[0]].push(friend_array[i]);
                    first_alpha = false;
                    last_alpha = false;
                    alpha_class = 'no_alpha';
                }
                
                // if (first_alpha && last_alpha){
                //     first_alpha_friend = friends_alpha[first_alpha_char][0];
                //     image_html = '<div class="crop"><img class="friend_pic" src="https://graph.facebook.com/' + first_alpha_friend.id + '/picture?type=large"/></div>';
                //     name_html = '<div class="text_wrapper"><div class="text" onclick="void(0)"><h3>' + first_alpha_friend.name.split(' ')[0] + ' to ' + last_alpha_name + '</h3></div></div>';
                //     friend_html = '<div class="friend ' + alpha_class + '" name="' + first_alpha_friend.name + '" value="' + first_alpha_friend.id + '" onclick="void(0)">' + alpha_html + name_html + '<div class="img_cont">' + image_html  + '</div></div>';
                //     $('#wall_cont').append(friend_html);
                // }
            }
        }
        var last_friend_alpha = null;
        for (var key in friends_alpha){
            first_alpha_friend = friends_alpha[key][0];
            last_friend_alpha = friends_alpha[key][friends_alpha[key].length - 1];
            if (first_alpha_friend){
                alpha_html = '<h1 class="alpha_key_wall" id="alpha_wall_' + first_alpha_friend.name[0] + '" onclick="void(0)">' + first_alpha_friend.name[0] + '</h1>';
                image_html = '<div class="crop"><img class="friend_pic" src="https://graph.facebook.com/' + first_alpha_friend.id + '/picture?type=large"/></div>';
                name_html = '<div class="text_wrapper"><div class="text" onclick="void(0)"><h3>' + first_alpha_friend.name.split(' ')[0] + ' to ' + last_friend_alpha.name.split(' ')[0] + '</h3></div></div>';
                friend_html = '<div class="friend ' + alpha_class + '" name="' + first_alpha_friend.name + '" value="' + first_alpha_friend.id + '" onclick="void(0)">' + alpha_html + name_html + '<div class="img_cont">' + image_html  + '</div></div>';
                $('#wall_cont').append(friend_html);
            }
        }
        $('#friend_cont').append('<div class="clear"></div>');
    }
    
    function load_friends(){
        $('#login_loader').remove();

        var friend_names = [ ];
        for (var i = 0; i < friend_array.length; i++){
            if (friend_array[i].hidden === false){
                friend_names.push(friend_array[i].name);
            }
        }
        
		if (!mobile){
			$('#query').autocomplete({
	           lookup: friend_names,
	           width: 401,
	           maxHeight:270,
	           fnFormatResult: format_result,
	           onSelect: load_selected
	        });
		}
		else{
			$('#query').autocomplete({
	           lookup: friend_names,
	           width: 376,
	           maxHeight:270,
	           mobile: true,
	           fnFormatResult: format_result,
	           onSelect: load_selected
	        });
		}
        
    }
    
    function get_user_albums(user_id, limit, function_ptr, hidden, render_as_received, timeout, time){
        if (window.sessionStorage !== undefined){
            var this_albums = sessionStorage.getItem('albums_' + user_id);   
        }
        if (this_albums === null || this_albums === ""){
            FB.api('/' + user_id + '/albums?fields=count,id,name', function(response) {
                var recurrsion_completed = false;
                var load_albums_once = false;
                if (response.data == undefined){
                    return false;
                }
                var this_albums = [ ];
                var album_id = null;
                var j = 0;
                
                var album_ids = "";
                // Manually add tagged photos
                this_albums.push({'album': {'id': 'tagged', 'name': 'Tagged Pictures'}, 'photos': [ ]});
                for (var i = 0; i < response.data.length; i++){
                    this_albums.push({'album': response.data[i], 'photos': null});
                    album_id = response.data[i].id;
                    if (i < response.data.length - 1){
                        album_ids += album_id + ',';
                    }
                    else{
                        album_ids += album_id;
                    }
                }
                
                function load_more_albums(response){
                    if (recurrsion_completed === false){
                        $.getJSON(response.paging.next + '&callback=?', function(response){
                            if (response.data.length > 0){
                                load_more_albums(response);
                                load_albums_once = true;
                                if (response.data.length > 0){
                                    album_ids += ',';
                                }
                                for (var i = 0; i < response.data.length; i++){
                                    this_albums.push({'album': response.data[i], 'photos': null});
                                    album_id = response.data[i].id;
                                    if (i < response.data.length - 1){
                                        album_ids += album_id + ',';
                                    }
                                    else{
                                        album_ids += album_id;
                                    }
                                }
                            }
                            else{
                                if (load_albums_once === false){
                                    if (response.data.length > 0){
                                        album_ids += ',';
                                    }
                                    for (var i = 0; i < response.data.length; i++){
                                        this_albums.push({'album': response.data[i], 'photos': null});
                                        album_id = response.data[i].id;
                                        if (i < response.data.length - 1){
                                            album_ids += album_id + ',';
                                        }
                                        else{
                                            album_ids += album_id;
                                        }
                                    }
                                }
                                recurrsion_completed = true;
                                
                                if (window.sessionStorage !== undefined){
                                    sessionStorage['albums_' + user_id] = JSON.stringify(this_albums);
                                }
                                
                                //Get tagged photos
                                FB.api('/' + user_id + '/photos?fields=height,width,picture,source,id&limit=' + limit, function(response) {
                                    this_albums = JSON.parse(sessionStorage.getItem('albums_' + user_id));
                                    //this_albums[0].photos = [ ]; 
                                    this_albums[0].photos = this_albums[0].photos.concat(response.data);
                                    sessionStorage.setItem('albums_' + user_id, JSON.stringify(this_albums));
                                    render_tagged_album(response.data);
                                });

                                if (this_albums.length > 0){
                                    FB.api('/photos/?fields=height,width,picture,source,id&limit=' + limit + '&ids=' + album_ids, function(response){
                                        selected_user = user_id;
                                        this_albums = JSON.parse(sessionStorage.getItem('albums_' + user_id));
                                        for (var key in response){
                                            if (key !== "error"){
                                                var album = response[key];
                                                var album_id = key;
                                                var top = 5;

                                                for (var x = 0; x < this_albums.length; x++){
                                                    if (this_albums[x].album.id === album_id){
                                                        this_albums[x].photos = album.data;      
                                                    }
                                                }

                                                if (album.data.length < top){
                                                    top = album.data.length;
                                                }
                                            }
                                        }
                                        
                                        if (window.sessionStorage !== undefined){
                                            sessionStorage.setItem('albums_' + user_id, JSON.stringify(this_albums));
                                        }
                                        if (function_ptr !== undefined){
                                            if (timeout === true){
                                                albums = this_albums;
                                                setTimeout(function_ptr, time);
                                                get_user_noms();
                                            }
                                            else if (render_as_received){
                                                albums = this_albums;
                                                function_ptr(hidden, offset);
                                                get_user_noms();
                                            }
                                            else{
                                                albums = this_albums;
                                                function_ptr(hidden);
                                                get_user_noms();
                                            }
                                        }
                                    });   
                                }
                                else{
                                    albums = this_albums;
                                    function_ptr(hidden);
                                    get_user_noms();
                                }
                            }
                        });   
                    }
                }
                if (response.data.length > 0){
                    load_more_albums(response);
                }
                else{
                    albums = this_albums;
                    function_ptr(hidden);
                    get_user_noms();
                }
            });
        }
        else{
            albums = JSON.parse(this_albums);
            if (albums[0].photos == null || albums[0].photos == false || albums[0].photos.length == 0){
                FB.api('/' + user_id + '/photos?fields=height,width,picture,source,id&limit=' + limit, function(response) {
                    this_albums = JSON.parse(sessionStorage.getItem('albums_' + user_id));
                    //this_albums[0].photos = [ ]; 
                    this_albums[0].photos = this_albums[0].photos.concat(response.data);
                    sessionStorage.setItem('albums_' + user_id, JSON.stringify(this_albums));
                    render_tagged_album(response.data);
                });
            }
            if (function_ptr !== undefined){
                if (timeout === true){
                    setTimeout(function_ptr, time);
                    get_user_noms();
                }
                else{
                    function_ptr(hidden);
                    get_user_noms();
                }
            }
        }
    }
    
    function get_user_videos(id, function_ptr){
        FB.api('/' + id + '/videos/', function(response){
            user_videos = response.data;
            if (function_ptr !== undefined){
                function_ptr();
            } 
        });
    }
    
    if (!mobile){
        $('.main_control').live('click', main_control_click);
        $('#friend_view').live('click', friend_view_click);
        $('#wall_view').live('click', wall_view_click);
        $('#profile_view').live('click', profile_view_click);
        $('#top_noms').live('click', top_noms_click);
        $('#recent_noms').live('click', recent_noms_click);
    }
    else{
        $('.main_control').live('touchend', main_control_click);
        $('#friend_view').live('touchend', friend_view_click);
        $('#wall_view').live('touchend', wall_view_click);
        $('#profile_view').live('touchend', profile_view_click);
        $('#top_noms').live('touchend', top_noms_click);
        $('#recent_noms').live('touchend', recent_noms_click);
    }
    
    function main_control_click(){
        $('.main_control_active').removeClass('main_control_active');
        $(this).addClass('main_control_active');
    }
    
    function friend_view_click(){
        if (default_view != 'friend'){
            default_view = 'friend';
            sessionStorage.removeItem('default_view');
            sessionStorage.setItem('default_view', JSON.stringify(default_view));
            if (window.location.hash == '#/' || window.location.hash == '#' || window.location.hash == ''){
                var url_vars = getUrlVars();
                clear_canvas(url_vars);
                clear_event_handles();
                attach_main_handlers();
                main_view();
                $('html, body').scrollTop(0);
            }
            else{
                window.location.hash = '#/';
            }
        }
    }
    
    function wall_view_click(){
        if (default_view != 'wall'){
            default_view = 'wall';
            sessionStorage.removeItem('default_view');
            sessionStorage.setItem('default_view', JSON.stringify(default_view));
            if (window.location.hash == '#/' || window.location.hash == '#' || window.location.hash == ''){
                var url_vars = getUrlVars();
                clear_canvas(url_vars);
                clear_event_handles();
                attach_profile_handlers();
                main_view();
                $('html, body').scrollTop(0);
            }
            else{
                window.location.hash = '#/';
            }
        }
    }
    
    function profile_view_click(){
        if (default_view != 'profile'){
            default_view = 'profile';
            sessionStorage.removeItem('default_view');
            sessionStorage.setItem('default_view', JSON.stringify(default_view));
            if (window.location.hash == '#/' || window.location.hash == '#' || window.location.hash == ''){
                var url_vars = getUrlVars();
                clear_canvas(url_vars);
                clear_event_handles();
                // attach_main_handlers();
                main_view();
                $('html, body').scrollTop(0);
            }
            else{
                window.location.hash = '#/';
            }
        }
    }
    
    function top_noms_click(){
        if (stream_view != 'top_noms'){
            stream_view = 'top_noms';
            sessionStorage.removeItem('stream_view');
            sessionStorage.setItem('stream_view', JSON.stringify(stream_view));
            $('#recent_noms').removeClass('selected');
            $(this).addClass('selected');
            $('#profile_cont_wrap').html('<div id="scroller">' +
                                            '<div id="profile_cont"></div>' +
                                        '</div>');
            main_view();
            $('html, body').scrollTop(0);
            if (typeof(_gaq) !== "undefined"){
                _gaq.push(['_trackEvent', 'Top Noms', 'Click', '']);
            }
        }
    }
    
    function recent_noms_click(){
        if (stream_view != 'recent_noms'){
            stream_view = 'recent_noms';
            sessionStorage.removeItem('stream_view');
            sessionStorage.setItem('stream_view', JSON.stringify(stream_view));
            $('#top_noms').removeClass('selected');
            $(this).addClass('selected');
            $('#profile_cont_wrap').html('<div id="scroller">' +
                                            '<div id="profile_cont"></div>' +
                                        '</div>');
            main_view();
            $('html, body').scrollTop(0);
            if (typeof(_gaq) !== "undefined"){
                _gaq.push(['_trackEvent', 'Recent Noms', 'Shown', '']);
            }
        }
    }
    
    var added_swipe_once = false;
    //All friends view
    function main_view(){
        view_active = 'main';
        user_profile = null;
        user_likes = null;
        user_movies = null;
        user_books = null;
        selected_user = '';
        selected_album_id = '';
        albums = null;
        photo_comment_cache = { };
        $('#main_view_control').remove();
        var friend_view_selected = '';
        var wall_view_selected = '';
        var profile_view_selected = '';
        if (default_view == 'friend'){
            friend_view_selected = 'main_control_active';
        }
        else if (default_view == 'wall'){
            wall_view_selected = 'main_control_active';
        }
        else if (default_view == 'profile'){
            profile_view_selected = 'main_control_active';
        }
        
        var photo_upload_html = '';
        // if (!mobile){
        //     photo_upload_html = '<a class="awesome orange large" id="show_upload">Post Photo</a>';
        // }
        // else{
        //     photo_upload_html = '';
        // }
        
        var view_control_html = '<div id="main_view_control">' +
                                    '<a id="friend_view" class="main_control awesome large ' + friend_view_selected + '">Friends</a>' +
                                    '<a id="wall_view" class="main_control awesome large ' + wall_view_selected + ' ">Stream</a>' +
                                    '<a id="profile_view" class="main_control awesome large ' + profile_view_selected + '">Profile</a>' +
                                    photo_upload_html +
                                '</div>';
        $('#cont').prepend(view_control_html);
        
        if (default_view === 'friend'){
            $('#wall_cont').hide();
            render_friends();
            if (!mobile){
                $('#wall_cont').css({
                    'max-width': '960px'
                });
                $('#wall_cont').fadeIn(300);
            }
            else{
                $('#wall_cont').show();
            }
        }
        else if (default_view === 'wall'){
            $('#user_profile_cont').remove();
            $('.friend').remove();
            if (!mobile){
                photo_upload_html = '';            
            }
            if ($('#wall_cont #profile_wrap').length == 0){
                $('#wall_cont').hide();
                var wall_html = '<div id="profile_wrap">' +
                                    '<div id="tab_nav">' +
                                        '<div id="activate_recent_winners">Recent Winners</div>' +
                                        '<div id="activate_latest_photos">Latest Photos</div>' +
                                    '</div>' +
                                    '<ul>' +
                                        '<h1 id="active_stream_view" name="active_nominations">Active Nominations</h1>' +
                                        '<div class="clear"></div>' +
                                        // '<div id="drop_down_cont" style="display:none;">' +
                                        //     '<div class="clear"></div>' +
                                        //     '<li name="latest_photos" class="activate_stream">' +
                                        //         '<h1>Latest Photos</h1>' +
                                        //     '</li>' +
                                        //     '<div class="clear"></div>' +
                                        // '</div>' +
                                    '</ul>' +
                                    '<div id="active_stream_text_cont">' +
                                        '<a id="top_noms" class="awesome large">Top</a>' +
                                        '<a id="recent_noms" class="awesome large">Most Recent</a>' +
                                    '</div>' +
                                    '<div class="clear"></div>' +
                                    '<div id="profile_cont_wrap">' +
                                        '<div id="scroller">' +
                                            '<div id="profile_cont"></div>' +
                                        '</div>' +
                                    '</div>' + 
                                '</div>';
                $('#wall_cont').append(wall_html);
                if (!mobile){
                    $('#wall_cont').css({
                        'max-width': ''
                    });
                    $('#wall_cont').fadeIn();
                }
                else{
                    $('#wall_cont').show();
                }
                if (stream_view == 'top_noms'){
                    $('#top_noms').addClass('selected');
                }
                else{
                    $('#recent_noms').addClass('selected');
                }
            }
            $('#profile_cont').hide();
            if (stream_view == 'top_noms'){
                init_profile_view();
            }
            else{
                init_recent_view();
            }
        }
        else if (default_view === 'profile'){
            $('#wall_cont').hide();
            var wall_html = '<div id="user_profile_cont"><div id="profile_nav_cont" value="albums"><h2>Albums</h2><p id="album_left_arrow" style="display:none;"></p><p id="album_right_arrow"></p></div><div id="user_profile"></div><div id="album_cont" style="display:none;"></div></div>';
            $('#wall_cont').append(wall_html);
            selected_user = 'me';
            get_user_albums('me', 5, render_albums);
            get_user_videos('me');
            render_user_profile();
            attach_album_handlers();
            attach_user_profile_handlers();
            if (!mobile){
                $('#wall_cont').css({
                    'max-width': ''
                });
                $('#wall_cont').fadeIn(300);
            }
            else{
                $('#wall_cont').show();
            }
        }
        
        $('#wall_cont').show();
        $('#friend_cont').show();
    }
    
    var user_noms_won = { };
    function get_users_trophies(user, fnc_ptr){
        if (user_noms_won[user] == undefined){
            $.getJSON('/get_user_trophies/', {'user': user}, function(data){
                user_noms_won[user] = data;
                fnc_ptr(data);
            });
        }
        else{
            fnc_ptr(user_noms_won[user]);
        }
    }
    
    function render_user_trophies(data){
        var trophy_name = '',
            trophy_name_underscore = '',
            trophy_html = '';
        for (var i = 0; i < data.length; i++){
            trophy_name = data[i].cat_name;
            trophy_name_underscore = data[i].cat_name.replace(' ', '_').toLowerCase();
            trophy_html =   '<div class="trophy_cont nom_cat_' + trophy_name_underscore + '_hover">' +
                                '<a href="#/trophy/user=me/trophy=' + trophy_name_underscore + '">' +
                                    '<img src="http://portrit.s3.amazonaws.com/img/trophies/medium/' + trophy_name_underscore + '.png"/>' +
                                    '<div class="trophy_win_count">' +
                                        '<p class="nom_cat_' + trophy_name_underscore + '">' + data[i].count + '</p>' +
                                    '</div>' +
                                '</a>' +
                            '</div>';
            $('#profile_right_cont').append(trophy_html);
        }
    }
    
    function render_user_profile(){
        var profile_html = '',
            portrit_friends_html = '';
        
        if (portrit_friends.length > 0){
            for (var i = 0; i < portrit_friends.length; i++){
                portrit_friends_html += '<a href="#/user=' + portrit_friends[i].id + '" name="' + portrit_friends[i].name + '"><img src="https://graph.facebook.com/' + portrit_friends[i].id + '/picture?type=square"/></a>';
            }
        }
        else{
            portrit_friends_html = '<h3>None of your facebook friends are on Portrit. Send them a invitation by nominating their photos.</h2>';
        }
        
        profile_html =  '<div id="profile_left_cont">' +
                            '<h1>Profile</h1>' +
                            '<div id="profile_user_info">' +
                                '<img src="https://graph.facebook.com/' + me.id + '/picture?type=square"/>' +
                                '<div id="profile_tab">' +
                                    '<h2>Welcome ' + me.name.split(' ')[0] + '</h2>' +
                                '</div>' +
                            '</div>' +
                            '<div id="user_friends">' +
                                '<h2>Friends on Portrit</h2>' +
                                '<p class="tooltip"></p>' +
                                portrit_friends_html +
                            '</div>' +
                        '</div>' +
                        '<div id="profile_right_cont">' +
                            '<h2>Your Active Nominations</h2>' +
                        '</div>' +
                        '<div class="clear"></div>';
        
        $('#user_profile').append(profile_html);
        // get_users_trophies(me.id, render_user_trophies);
        append_load($('#profile_right_cont'), 'dark');
        get_users_active_noms(me.id, render_user_noms);
    }
    
    function get_users_active_noms(id, fnc_ptr){
        $.getJSON('/get_users_active_noms/', {'id': id}, function(data){
            fnc_ptr(data);
        });
    }
    
    function render_user_noms(data){
        remove_load();
        if (data.length > 0){
            var active_nom_html = '',
                nominator_name = '',
                nominatee_name = '',
                cat = '',
                cat_underscore = '',
                vote_right = 0,
                margin_top = 0;
            for (var i = 0; i < data.length; i++){
                cat = data[i].nomination_category;
                cat_underscore = cat.replace(' ', '_').toLowerCase();
                if (data[i].nominator == me.id){
                    nominator_name = 'You';
                }
                else if (friends[data[i].nominator] == undefined){
                    nominator_name = '';
                }
                else{
                    nominator_name = friends[data[i].nominator].name;
                }
                
                if (data[i].nominatee == me.id){
                    if (data[i].nominator == me.id){
                        nominatee_name = 'Yourself';
                    }
                    else{
                        nominatee_name = 'You';
                    }
                }
                
                margin_top = (data[i].photo.small_height / 2) - 25;
                vote_right = (data[i].photo.small_width / 2) - 38;
                active_nom_html =   '<div class="active_nom_cont nom_cat_' + cat_underscore + '">' +
                                        '<div class="active_nom_cont_left" style="margin-top: ' + margin_top + 'px;">' +
                                            '<a href="/#/user=' + data[i].nominator  + '"><img class="active_nom_nominator" src="https://graph.facebook.com/' + data[i].nominator + '/picture?type=square"/></a>' +
                                            '<p><a href="/#/user=' + data[i].nominator  + '">' + nominator_name + '</a> nominated ' + nominatee_name + ' for <span class="strong">' + cat + '</span></p>' +
                                        '</div>' +
                                        '<a href="/#/nom_id=' + data[i].id + '">' +
                                            '<p class="active_vote_count nom_cat_' + cat_underscore + '" style="right: ' + vote_right + 'px;">Votes: <span class="strong">' + data[i].vote_count + '</span></p>' +
                                            '<div class="trophy trophy_img small ' + cat_underscore + '"></div>' +
                                            '<img class="active_nom_photo" src="' + data[i].photo.src_small + '" style="height: ' + data[i].photo.small_height + 'px; width: ' + data[i].photo.small_width +'px;"/>' +
                                        '</a>' +
                                        '<div class="clear"></div>' +
                                    '</div>';
                $('#profile_right_cont').append(active_nom_html);
            }
        }
        else{
            $('#profile_right_cont').append('<p>You have no active nominations.</p>');
        }
    }
    
    function sort_noms_list_by_votes(list){
        // var temp_array = [ ];
        // for (var i = 0; i < nom_list.length; i++){
        //     temp_array.push(nom_dict[nom_list[i]]);
        // }
        list.sort(function(a, b){
            // return ((x < y) ? -1 : ((x > y) ? 1 : 0));
            return b.vote_count - a.vote_count;
        });
        // nom_list = [ ];
        // for (var i = 0; i < temp_array.length; i++){
        //     nom_list.push(temp_array[i].id);
        // }
        return list;
    }
    
    function sort_noms_by_votes(nom_dict, nom_list){
        var temp_array = [ ];
        for (var i = 0; i < nom_list.length; i++){
            temp_array.push(nom_dict[nom_list[i]]);
        }
        temp_array.sort(function(a, b){
            // return ((x < y) ? -1 : ((x > y) ? 1 : 0));
            return b.vote_count - a.vote_count;
        });
        nom_list = [ ];
        for (var i = 0; i < temp_array.length; i++){
            nom_list.push(temp_array[i].id);
        }
        return nom_list;
    }
    
    function nom_detail_view(data, inactive){
        view_active = 'nom_detail';
        var nom_id = getUrlVars().nom_id,
            won = getUrlVars().won,
            user_url = getUrlVars().user,
            trophy = getUrlVars().trophy,
            nom = null,
            active_cache = null;
            noms_in_cat = null,
            nom_in_cat = null;
            nom_stream_html = '',
            nom_main_cont_html = '',
            nom_bottom_cont_html = '',
            comment_cont_html = '',
            voted_cont_html = '',
            nom_winning_text = '',
            selected_nom_photo = null,
            trophy_size = '',
            vote_class = '',
            vote_tooltip_text = 'Already voted',
            title = '',
            nom_cat_underscore = '';
        
        if (typeof(inactive) !== "undefined"){
            nom = data[0];
            noms_in_cat = data
            active_cache = data;
            vote_class = "won";
            vote_tooltip_text = 'Inactive';
            
            var name = '',
                winning_name = '';
            if (friends[nom.nominatee]){
                name = friends[nom.nominatee].name;
            }
            else if (nom.nominatee == me.id){
                name = 'Your';
            }
            else{
                name = '';
            }
            if (name == 'Your'){
                winning_name = name;
            }
            else if (name != ''){
                winning_name = name.split(' ')[0] + '\'s';
            }
            
            title = '<h1 class="title" name="' + nom.nomination_category + '"><a href="/#/user=' + nom.nominatee + '">' + winning_name + '</a> Inactive <span class="nom_cat_' + nom.nomination_category.replace(' ', '_').toLowerCase() + '_text">' + nom.nomination_category + '</span> Photo</h1>';
        }
        else if (trophy != undefined && user_url != undefined){
            won = true;
            nom = data[0];
            noms_in_cat = data
            active_cache = data;
            vote_class = "won";
            vote_tooltip_text = 'Already won';
            
            var name = '',
                winning_name = '';
            if (friends[nom.nominatee]){
                name = friends[nom.nominatee].name;
            }
            else if (nom.nominatee == me.id){
                name = 'Your';
            }
            else{
                name = '';
            }
            if (name == 'Your'){
                winning_name = name;
            }
            else if (name != ''){
                winning_name = name.split(' ')[0] + '\'s';
            }
            
            title = '<h1 class="title" name="' + nom.nomination_category + '"><a href="/#/user=' + nom.nominatee + '">' + winning_name + '</a> Winning <span class="nom_cat_' + nom.nomination_category.replace(' ', '_').toLowerCase() + '_text">' + nom.nomination_category + '</span> Photos</h1>';
        }
        else if (won != undefined && user_url != undefined){
            won = true;
            nom = data[0];
            noms_in_cat = data
            active_cache = data;
            vote_class = "won";
            vote_tooltip_text = 'Already won';
            
            winning_name = 'Your';
            
            title = '<h1 class="title" name="' + nom.nomination_category + '"><a href="/#/user=' + nom.nominatee + '">' + winning_name + '</a> Winning Photos</h1>';
        }
        else if (won != undefined){
            won = true;
            nom = winning_noms_cache[nom_id];
            active_cache = winning_noms_cache;
            vote_class = "won";
            vote_tooltip_text = 'Already won';
            
            var name = '';
            if (friends[nom.nominatee]){
                name = friends[nom.nominatee].name;
            }
            else if (nom.nominatee == me.id){
                name = 'Your';
            }
            else{
                name = '';
            }
            var winning_name = '';
            if (name == 'Your'){
                winning_name = name;
            }
            else if (name != ''){
                winning_name = name.split(' ')[0] + '\'s';
            }
            
            title = '<h1 class="title" name="' + nom.nomination_category + '"><a href="/#/user=' + nom.nominatee + '">' + winning_name + '</a> Winning <span class="nom_cat_' + nom.nomination_category.replace(' ', '_').toLowerCase() + '_text">' + nom.nomination_category + '</span> Photo</h1>';
        }
        else{
            nom = active_noms_cache[nom_id];
            if (nom == undefined){
                if (isEmpty(winners_feed)){
                    get_user_feed(nom_detail_view, 'won');
                    return;
                }
                else{
                    won = true;
                    nom = winning_noms_cache[nom_id];
                    noms_in_cat = winning_nom_cats_map[nom.nomination_category.replace(' ', '_').toLowerCase()];
                    active_cache = winning_noms_cache;
                    title = '<h1 class="title" name="' + nom.nomination_category + '">Winning <span class="nom_cat_' + nom.nomination_category.replace(' ', '_').toLowerCase() + '_text">' + nom.nomination_category + '</span> Photo</h1>';
                }
            }
            else{
                noms_in_cat = active_nom_cats_map[nom.nomination_category.replace(' ', '_').toLowerCase()];
                active_cache = active_noms_cache;
                title = '<h1 class="title" name="' + nom.nomination_category + '">Active <span class="nom_cat_' + nom.nomination_category.replace(' ', '_').toLowerCase() + '_text">' + nom.nomination_category + '</span> Nominations</h1>';
            }
        }
        
        var name = '';
        if (friends[nom.nominatee]){
            name = friends[nom.nominatee].name;
        }
        else if (nom.nominatee == me.id){
            if (!won){
                name = 'You\'re';
            }
            else{
                name = 'You';
            }
        }
        else{
            name = '';
        }
        
        if (trophy || (won && user_url)){
            nom_stream_html = '<div id="nom_cat_stream"><div class="prev_photo"><div class="prev_photo_img"></div></div><div class="next_photo"><div class="next_photo_img"></div></div>';
            for (var i = 0; i < active_cache.length; i++){
                nom_in_cat = active_cache[i];
                if (nom_in_cat.id == nom.id){
                    selected_nom_photo = 'nom_photo_' + nom_in_cat.id;
                    nom_stream_html +=  '<div id="nom_photo_' + nom_in_cat.id + '" class="nom_photo_thumbnail" style="height:' + nom_in_cat.photo.small_height + 'px; opacity: 1.0;" name="selected">' +
                                            '<img src="' + nom_in_cat.photo.src_small + '"/>' +
                                            // '<p class="nom_cat_' + nom_in_cat.nomination_category.replace(' ', '_').toLowerCase() + '">' + nom_in_cat.vote_count + '</p>' +
                                        '</div>';
                }
                else{
                    nom_stream_html +=  '<div id="nom_photo_' + nom_in_cat.id + '" class="nom_photo_thumbnail" style="height:' + nom_in_cat.photo.small_height + 'px; opacity: 0.6;">' +
                                            '<img src="' + nom_in_cat.photo.src_small + '"/>' +
                                            // '<p class="nom_cat_' + nom_in_cat.nomination_category.replace(' ', '_').toLowerCase() + '">' + nom_in_cat.vote_count + '</p>' +
                                        '</div>';            
                }        
            }
            nom_stream_html += '</div>';
        }
        else if (!won && typeof(inactive) === "undefined"){
            nom_stream_html = '<div id="nom_cat_stream"><div class="prev_photo"><div class="prev_photo_img"></div></div><div class="next_photo"><div class="next_photo_img"></div></div>';
            noms_in_cat = sort_noms_by_votes(active_cache, noms_in_cat);
            for (var i = 0; i < noms_in_cat.length; i++){
                nom_in_cat = active_cache[noms_in_cat[i]];
                if (nom_in_cat.id == nom.id){
                    selected_nom_photo = 'nom_photo_' + nom_in_cat.id;
                    nom_stream_html +=  '<div id="nom_photo_' + nom_in_cat.id + '" class="nom_photo_thumbnail" style="height:' + nom_in_cat.photo.small_height + 'px; opacity: 1.0;" name="selected">' +
                                            '<img src="' + nom_in_cat.photo.src_small + '"/>' +
                                            '<p class="nom_cat_' + nom_in_cat.nomination_category.replace(' ', '_').toLowerCase() + '">' + getGetOrdinal(i + 1) + '</p>' +
                                        '</div>';
                }
                else{
                    nom_stream_html +=  '<div id="nom_photo_' + nom_in_cat.id + '" class="nom_photo_thumbnail" style="height:' + nom_in_cat.photo.small_height + 'px; opacity: 0.6;">' +
                                            '<img src="' + nom_in_cat.photo.src_small + '"/>' +
                                            '<p class="nom_cat_' + nom_in_cat.nomination_category.replace(' ', '_').toLowerCase() + '">' + getGetOrdinal(i + 1) + '</p>' +
                                        '</div>';            
                }        
            }
            nom_stream_html += '</div>';
        }
        else{
            nom_stream_html = '';
        }
        
        if (nom.won){
            nom_winning_text = 'Won';
        }
        else if (!nom.active){
            nom_winning_text = 'Lost';
        }
        else{
            nom_winning_text = 'Nominated for';
        }
        
        var nominator_caption = '';
        var nominator_name = '';
        
        if (nom.nominator == me.id){
            nominator_name = 'You';
        }
        else if (nom.nominator_name){
            nominator_name = nom.nominator_name;
        }
        else if (friends[nom.nominator]){
            nominator_name = friends[nom.nominator].name;
        }
        else{
            nominator_name = '';
        }
        
        if (nom.caption){
            nominator_caption = 'Caption: ' + nom.caption;
        }
        
        trophy_size = 'large';
        nom_cat_underscore = nom.nomination_category.replace(' ', '_').toLowerCase();
        
        nom_main_cont_html ='<div id="main_nom_cont" value="' + nom.id + '">' +
                                '<div id="main_nom_cont_left">' +
                                    '<div id="main_nom_cont_left_wrap">' +
                                        '<img id="main_nom_photo" src="' + nom.photo.src  + '"/>' +
                                        '<div id="nominator_overlay_cont">' +
                                            '<a href="/#/user=' + nom.nominator + '"><img class="user_img" src="https://graph.facebook.com/' + nom.nominator + '/picture?type=square"/></a>' +
                                            '<h2>Nominated by <span class="strong"><a href="/#/user=' + nom.nominator + '">' + nominator_name + '</a></span></h2>' +
                                            '<p>' + nominator_caption + '</p>' +
                                        '</div>' +
                                    '</div>' +
                                '</div>' +
                                '<div id="main_nom_cont_right">' +
                                    '<div id="main_nom_cont_right_wrap">' +
                                        '<h2>Votes</h2>' +
                                        '<div id="vote_cont">' +
                                            '<div id="vote_cont_left">' +
                                                '<p class="tooltip"></p>' +
                                                '<span class="vote vote_up ' + vote_class + '" value="' + nom.id + '" name="' + vote_tooltip_text + '"></span>' +
                                                '<span class="vote vote_down ' + vote_class + '" value="' + nom.id + '" name="' + vote_tooltip_text + '"></span>' +
                                                '<p id="nom_vote_count">' + nom.vote_count + '</p>' +
                                            '</div>' +
                                            '<div class="clear"></div>' +
                                        '</div>' +
                                        '<div id="trophy_cont" class="nom_cat_' + nom_cat_underscore + '">' +
                                            '<div id="nomination_text_cont">' +
                                                '<a href="/#/user=' + nom.nominatee + '">' +
                                                    '<img class="user_img" src="https://graph.facebook.com/' + nom.nominatee + '/picture?type=square"/>' +
                                                    '<span class="strong">' + name + '</span>' +
                                                '</a>' + 
                                                '<p>' + nom_winning_text + '</p>' +
                                                '<h3>' + nom.nomination_category + '</h3>' +
                                                '<div id="nom_trophy_icon" class="trophy_img ' + trophy_size + ' ' + nom_cat_underscore + '"></div>' +
                                            '</div>' +
                                        '</div>' +
                                    '</div>' +
                                '</div>' +
                                '<div class="clear"></div>' +
                        '</div>';
                   
        nom_bottom_cont_html =  '<div id="main_nom_bottom_cont">' +
                                    '<div id="nom_comments_cont">' +
                                        '<div id="comment_heading_cont">' +
                                            '<h2>Comments</h2>' +
                                            '<span class="awesome large" id="add_new_comment">New Comment</span>' +
                                            '<div class="clear"></div>' +
                                        '</div>' +
                                        '<div id="new_comment_cont">' +
                                            '<div class="comment_top_head">' +
                                                '<a class="awesome large post_new_comment">Post</a>' +
                                                '<a class="awesome large cancel_new_comment">Close</a>' +
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
        
        var html = '<div id="nom_detail_cont">' + title + nom_main_cont_html + nom_stream_html + nom_bottom_cont_html + '</div>';
        $('#canvas_cont').append(html);
        
        slide_images = $('.nom_photo_thumbnail');
        
        var img_widths = [ ];
        var slide_center = 0;
        var slide_img_width = 0;
        var center_found = false;
        var mid_screen = $('#nom_cat_stream').width() / 2;
        $(slide_images).each(function(j, selected){
            if (trophy || (won && user_url)){
                slide_img_width = parseInt(active_cache[j].photo.small_width);
            }
            else{
                slide_img_width = parseInt(active_cache[noms_in_cat[j]].photo.small_width);
            }
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
        
        get_nom_comments(nom.id, won, trophy);
        // render_nom_comments(nom.comments);
        render_nom_votes(nom.votes);
    }
    
    var get_comment_timeout = null;
    function get_nom_comments(id, won){
        // var active_cache = null;
        // var trophy = getUrlVars().trophy;
        // var user = getUrlVars().user;
        // // if (won != undefined){
        // //     active_cache = winning_noms_cache;
        // // }
        // // else{
        // //     active_cache = active_noms_cache;
        // // }
        clearTimeout(get_comment_timeout);
        get_comment_timeout = setTimeout(function(){
            append_load($('#nom_comments_cont'), 'light');
        }, 300);
        // if (trophy || (won && user) || active_cache[id].comments === false){
        $.getJSON('/get_nom_comments/', {'nom_id': id}, function(data){
            clearTimeout(get_comment_timeout);
            remove_load();
            // if (!trophy && !(won && user)){
            //     active_cache[id].comments = data; 
            // }
            render_nom_comments(data);
        });
        // }
        // else{
        //     render_nom_comments(active_cache[id].comments);
        // }
    }
    
    function render_nom_votes(votes){
        var voted_cont_html = '';
        var name = '';
        var user_voted = false;
        var won = getUrlVars().won;
        var trophy = getUrlVars().trophy;
        for (var i = 0; i < votes.length; i++){
            name = votes[i].vote_name;
            voted_cont_html +=  '<a href="#/user=' + votes[i].vote_user + '" class="clear_profile" id="voted_' + votes[i].vote_user + '" name="' + name + '">' +
                                    '<img src="https://graph.facebook.com/' + votes[i].vote_user + '/picture?type=square"/>' +
                                '</a>';
            if (votes[i].vote_user == me.id){
                user_voted = true
            }
        }
        if (won != undefined || trophy != undefined){
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
        var name = '',
            comment_cont_html = '',
            time = null,
            now = null;
            
        $('.comment_empty').remove();
        if (comments.length > 0){
            for (var i = 0; i < comments.length; i++){
                if (friends[comments[i].comments.owner_id] != undefined){
                    name = friends[comments[i].comments.owner_id].name;
                }
                else if (comments[i].comments.owner_id == me.id){
                    name = 'You';
                }
                else {
                    name = '';
                }
                now = new Date();
                time = new Date(comments[i].comments.create_datetime * 1000);
                now -= time;
                now /= 1000
                var time_str = secondsToHms(parseInt(now));

                comment_cont_html +='<div class="comment">' +
                                        '<p class="comment_time" value="' + comments[i].comments.create_datetime + '">' + time_str + '</p>' +
                                        '<a href="#/user=' + comments[i].comments.owner_id + '" class="clear_profile">' +
                                            '<img class="user_photo" src="https://graph.facebook.com/' + comments[i].comments.owner_id + '/picture?type=square"/>' +
                                        '</a>' +
                                        '<a href="#/user=' + comments[i].comments.owner_id + '" class="post_username from_username clear_profile">' + name +'</a>' +
                                        '<p>' + comments[i].comments.comment + '</p>' +
                                    '</div>';
            }
        }
        else{
            comment_cont_html = '<div class="comment_empty">' +
                                    '<h2>No comments yet. Be the first!</h2>' +
                                '</div>';
        }
        $('#nom_comments_cont').append(comment_cont_html);
    }
    
    function trophy_view(cat){
        var url_vars = getUrlVars();
        var user = url_vars.user,
            cat = url_vars.trophy;
            
        if (user == 'me'){
            user = me.id;
        }
        
        append_load($('#wall_cont'), 'dark');
        $.get('/get_trophy_wins/', {'user': user, 'cat': cat}, function(data){
            remove_load();
            
            winning_noms_cache = { };
            for (var i = 0; i < data.length; i++){
                winning_noms_cache[data[i].id] = data[i];
            }
            // user_winning_noms_cache[user] = data;
            
            nom_detail_view(data);
        });
    }
    
    function render_alpha_wall(alpha_key){
        var friend_html = "";
        var image_html = "";
        var name_html = "";
        var alpha_html = "";
        var first_alpha = true;
        var alpha_class = "";
        
        // $('#wall_cont').html('');
        if ($('#main_view_control').length == 0){
            $('#cont').prepend('<div id="main_view_control"><a id="friend_view" class="main_control awesome large main_control_active">Friends</a><a id="wall_view" class="main_control awesome large  ">Stream</a><a id="profile_view" class="main_control awesome large ">Profile</a></div>');
        }
        $('#wall_cont').show();
        $('#friend_cont').show();
        
        $('#wall_cont').css({
            'max-width': '960px'
        });
        
        for (var i = 0; i < friend_array.length; i++){
            if (friend_array[i].hidden === false){
                alpha_html = '';
                if (first_alpha == true && friend_array[i].name[0] == alpha_key){
                    alpha_html = '<h1 class="alpha_key_wall" id="alpha_wall_' + friend_array[i].name[0] + '" onclick="void(0)">' + friend_array[i].name[0] + '</h1>';
                    first_alpha = false;
                }
                
                if (friend_array[i].name[0] == alpha_key){
                    image_html = '<div class="crop"><img class="friend_pic" src="https://graph.facebook.com/' + friend_array[i].id + '/picture?type=large"/></div>';
                    name_html = '<div class="text_wrapper"><div class="text" onclick="void(0)"><h3>' + friend_array[i].name + '</h3></div></div>';
                    friend_html = '<div class="friend ' + alpha_class + '" name="' + friend_array[i].name + '" value="' + friend_array[i].id + '">' + alpha_html + '<div class="img_cont">' + image_html + name_html + '</div></div>';
                    $('#wall_cont').append(friend_html);
                }
            }
        }
    }
    
    function render_fav_friend_albums(){
        var album_html = ''
        var name_html = '';
        for (var i = 0; i < albums.length; i++){
            var album_count = albums[i].album.count;
            var album_count_text = '';
            if (album_count != undefined){
                if (albums[i].album.count <= 1){
                    album_count_text = ' Photo'
                }
                else{
                    album_count_text = ' Photos'
                }
            }
            else{
                album_count = 0;
            }
            name_html = '<div class="album_text_wrapper"><div class="text" onclick="void(0)"><h3>' + albums[i].album.name + '</h3></div><div class="album_controls"><h3>' + album_count + album_count_text +'</h3></div></div>';
            if (albums[i].album.id != 'tagged'){
                album_html += '<div class="photo_album" id="' + albums[i].album.id + '" value="' + selected_user + '"><div class="album_clip"><img class="album_pic" src="https://graph.facebook.com/' + albums[i].album.id + '/picture?access_token=' + fb_session.access_token + '"/>' + name_html + '</div></div>';
            }
            else{
                album_html += '<div class="photo_album" id="' + albums[i].album.id + '" value="' + selected_user + '"><div class="album_clip"><img class="album_pic" src="' + albums[i].photos[0].picture + '"/>' + name_html + '</div></div>';
            }
        }
        $('.fav_friend_albums[value="' + selected_user + '"]').append(album_html);   
    }
    
    function render_tagged_album(photos){
        var top = 3;
        var album_html = '';
        
        if (photos.length > 0){
            for (var j = 0; j < top; j++){
                $('#tagged > .img_thumbs').append('<img class="img_thumb img_thumb_' + j + '" id="' + photos[j].id + '" src="' + photos[j].picture + '"/>');
                $('#tagged > .album_ajax_loader').remove();
            }
        }
    }
    
    function render_albums(offset){
        var album_id = null;
        var album = null;
        var top = 0;
        var album_html = '';
        if (offset == undefined){
            var offset = 0;
        }
        if (selected_user != 'me'){
            $('#album_cont').html('<div id="active_cont"><h1>Active Nominations</h1></div><div id="trophy_cont"><h1>Trophy Room</h1></div>');
        }
        else{
            $('#album_cont').html('<div id="trophy_cont"><h1>Trophy Room</h1></div>');
            
        }
        // append_load($('#active_cont'), 'dark');
        if (albums.length > 1){
            $('#album_cont').append('<h1>Facebook Albums</h1>');
            for (var i = offset; i < albums.length; i++){
                album_html += '<div class="photo_album" style="display:none;" id="' + albums[i].album.id + '" onclick="void(0)"><div class="img_thumbs">';
                

                album = albums[i];
                album_id = albums[i].album.id;
                top = 3;

                if (albums[i].photos){
                    if (albums[i].photos.length < top){
                        top = albums[i].photos.length;
                    }
                    for (var j = 0; j < top; j++){
                        album_html += '<img class="img_thumb img_thumb_' + j + '" id="' + album.photos[j].id + '" src="' + album.photos[j].picture + '"/>';
                    }
                }
                
                album_html += '</div><div class="album_title">' + albums[i].album.name + '</div></div>'
            }
            $('#album_cont').append(album_html);
        }
        else{
            $('#album_cont').html('<h2 class="alert_title">I\'m sorry. It seems this friend has their photo\s set to private.</h2>');
        }
        
        // if (!mobile){
        //     $('.photo_album').fadeIn();
        // }
        // else{
        $('.photo_album').show();
        // }
        
        if (!mobile){
            get_user_videos(getUrlVars().user, render_video_album);
        }
    }
    
    function render_video_album(){
        var album_id = null;
        var album = null;
        var top = 0;
        var degree = 0;
        var neg = 0;
        var img_class = 0;
        var album_html = '';
        
        if (user_videos){
            if (user_videos.length > 0){
                album_html = '<div class="photo_album" id="video_album"><div class="img_thumbs"></div><div class="album_title">Videos</div></div>';
                $('#album_cont').append(album_html);


                top = 4;
                if (user_videos.length < top){
                    top = user_videos.length;
                }
                for (var j = 0; j < top; j++){
                    $('#video_album > .img_thumbs').append('<img class="img_thumb_' + j + '" id="' + user_videos[j].id + '" src="' + user_videos[j].picture + '"/>');
                }   
            }
            if (typeof(_gaq) !== "undefined"){
                _gaq.push(['_trackEvent', 'Video_Album', 'Shown', '']);
            }   
        }
    }
    
    function album_cont_reset(){
        $('#album_cont').css({'position': '',
                              'width': '',
                              'left': '',
                              'right': ''});
        $('#album_cont').show();
    }
    
    function render_active_photo_noms(data){
        var user = getUrlVars().user;
        if (user != me.id && user != 'me' && user != undefined){
            var first_name = friends[user].name.split(' ')[0],
                active_nom_html = '',
                cat_underscore = '';
            if (data.active_nom_objs.length > 0){
                for (var i = 0; i < data.active_nom_objs.length; i++){
                    cat_underscore = data.active_nom_objs[i].nomination_category.replace(' ', '_').toLowerCase();
                    active_nom_html =   '<div class="active_nom_cont">' +
                                            '<div class="active_left_cont nom_cat_' + cat_underscore + '">' +
                                            '</div>' +
                                            '<div class="active_img_cont">' +
                                                '<a href="/#/nom_id=' + data.active_nom_objs[i].id + '">' +
                                                    '<img class="active_nom_image" src="' + data.active_nom_objs[i].photo.src + '"/>' +
                                                '</a>' +
                                            '</div>' +
                                            '<div class="active_comment_cont">' +
                                                '<a href="/#/nom_id=' + data.active_nom_objs[i].id + '">' +
                                                    '<p>Comments: <span class="strong">' + data.active_nom_objs[i].comment_count + '</span></p>' +
                                                '</a>' +
                                            '</div>' +
                                            '<div class="active_vote_cont">' +
                                                '<a href="/#/nom_id=' + data.active_nom_objs[i].id + '">' +
                                                    '<p>Votes: <span class="strong">' + data.active_nom_objs[i].vote_count + '</span></p>' +
                                                '</a>' +
                                            '</div>' +
                                            '<div class="active_trophy_img trophy_img medium ' + cat_underscore + '"></div>' +
                                            '<div class="clear"></div>' +
                                        '</div>';

                    $('#active_cont').append(active_nom_html);
                }
            }
            else{
                $('#active_cont').append('<h2>' + first_name + ' has no active nominations.');
            }
        }
    }
    
    function render_winning_photo_noms(data){
        // remove_load();
        if (data.winning_nom_objs.length > 0){
            var top = 3;
            var cat_underscore = '';
            // $('#album_cont').prepend('');
            var nom_cat_map = { };
            for (var i = 0; i < data.winning_nom_objs.length; i++){
                if (nom_cat_map[data.winning_nom_objs[i].nomination_category] == undefined){
                    nom_cat_map[data.winning_nom_objs[i].nomination_category] = {
                        'noms': [data.winning_nom_objs[i]]
                    }
                }
                else{
                    nom_cat_map[data.winning_nom_objs[i].nomination_category]['noms'].push(data.winning_nom_objs[i])
                }
            }
            
            for (var cat in nom_cat_map){
                var noms = nom_cat_map[cat]['noms'];
                cat_underscore = cat.replace(' ', '_').toLowerCase();
                
                if (noms.length < top){
                    top = noms.length;
                }
                
                album_html = '<div class="trophy_album" name="' + cat + '" onclick="void(0)"><div class="img_thumbs">';
                for (var i = 0; i < top; i++){
                    album_html += '<img class="img_thumb img_thumb_' + i + '"  src="' + noms[i].photo.src_small + '"/>';
                }
                album_html += '</div><div class="trophy_img large ' + cat_underscore + '"></div><div class="trophy_count nom_cat_' + cat_underscore + '">' + noms.length + '</div></div>';
                $('#trophy_cont').append(album_html);
            }
            // $('#trophy_cont').fadeIn();
        }
        else{
            var user = getUrlVars().user;
            if (user != undefined && user != me.id){
                var first_name = friends[user].name.split(' ')[0];
                $('#trophy_cont').append('<h2>' + first_name + ' has not won any trophies. Help ' + first_name + ' out by nominating a photo.</h2>');
            }
            else{
                $('#trophy_cont').append('<h2>You have not won any trophies. Nominate some of your photos for a chance to earn a trophy.</h2>');
            }
        }
    }
    
    var winning_user_album_cache = { };
    var winning_user_photo_dict = { };
    function update_user_album_nom_cache(winning_noms){
        winning_user_album_cache = { };
        for (var i = 0; i < winning_noms.length; i++){
            if (winning_user_album_cache[winning_noms[i].photo.album_fid] == undefined){
                winning_user_album_cache[winning_noms[i].photo.album_fid] = [{'fid': winning_noms[i].photo.fid,
                                                                                'cat': winning_noms[i].nomination_category}];
            }
            else{
                winning_user_album_cache[winning_noms[i].photo.album_fid].push({'fid': winning_noms[i].photo.fid,
                                                                                'cat': winning_noms[i].nomination_category});
            }
            winning_user_photo_dict[winning_noms[i].photo.fid] = {'cat': winning_noms[i].nomination_category, 
                                                                    'nom_id': winning_noms[i].id};
        }
    }
    
    var active_user_nom_cache = { };
    function update_user_active_nom_cache(active_noms){
        active_user_nom_cache = { };
        for (var i = 0; i < active_noms.length; i++){
            active_user_nom_cache[active_noms[i].photo.fid] = {'nom_id': active_noms[i].id,
                                                                    'cat': active_noms[i].nomination_category};
        }
    }
    
    function get_user_noms(){
        var id = getUrlVars().user;
        if (id == 'me' || id == undefined){
            id = me.id;
        }
        if (user_winning_noms_cache[selected_user] == undefined){
            $('#active_cont').append('<img class="data_loading" src="http://portrit.s3.amazonaws.com/img/album-loader-dark.gif"/>');
            $('#trophy_cont').append('<img class="data_loading" src="http://portrit.s3.amazonaws.com/img/album-loader-dark.gif"/>');
            $.getJSON('/get_user_album_nom_data/', {'user': id}, function(data){
                $('.data_loading').remove();
                if (data){
                    user_winning_noms_cache[selected_user] = data;
                    update_user_album_nom_cache(data.winning_nom_objs);
                    update_user_active_nom_cache(data.active_nom_objs);
                    if (view_active == 'album' || default_view === 'profile'){
                        render_winning_photo_noms(data);
                        render_active_photo_noms(data);
                    }
                    else if (view_active == 'list'){
                        if (winning_user_album_cache[selected_album_id] != undefined){
                            render_list_view_trophies(winning_user_album_cache[selected_album_id]);
                        }
                    }
                    else if (view_active == 'gallery'){
                        if (winning_user_album_cache[selected_album_id] != undefined){
                            render_list_view_trophies(winning_user_album_cache[selected_album_id]);
                        }
                    }
                }
            });
        }
        else{
            if (view_active == 'album' || default_view === 'profile'){
                update_user_album_nom_cache(user_winning_noms_cache[selected_user].winning_nom_objs);
                render_winning_photo_noms(user_winning_noms_cache[selected_user]);
                render_active_photo_noms(user_winning_noms_cache[selected_user]);
            }
            else if (view_active == 'list'){
                if (winning_user_album_cache[selected_album_id] != undefined){
                    render_list_view_trophies(winning_user_album_cache[selected_album_id]);
                }
            }
            else if (view_active == 'gallery'){
                
            }
        }
    }
    
    function render_list_view_trophies(photos){
        var cat_underscore = '';
        for (var i = 0; i < photos.length; i++){
            cat_underscore = photos[i]['cat'].replace(' ', '_').toLowerCase();
            if (view_active == 'gallery'){
                $('#' + photos[i]['fid']).parent().append('<div class="trophy_cat trophy_img medium ' + cat_underscore +'"></div>');
            }
            else{
                $('#' + photos[i]['fid']).parent().css({'position': 'relative', 'left': '0px'}).append('<div class="trophy_cat trophy_img medium ' + cat_underscore +'"></div>');
            }
        }
    }
   
    //Album view
    function main_photo_view(){
        var id = getUrlVars().user;
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
                    $('#profile_cont_wrap > h1').text(name.split(" ", 1) + '\'s Stream');
                });
            }
            else{
                name = friends[id].name;
            }
        }
        
        var header = "";
        var album_html = "";
        view_active = 'album';
        $('#profile_wrap').html('');
        $('#info_wrap').html('');
        $('#album_cont').html('');
        $('#screen_index').remove();
        album_cont_reset();
        photo_comment_cache = { };
        $('#friend_album_cont').css({'height': '', 'min-height': ''});
        // if (mobile){
        //     var rot_string = 'translate(0px, 0px)';
        //     $('#friend_album_cont').css({
        //         // '-webkit-transition': '-webkit-transform .45s ease-out',
        //         // '-moz-transition': '-moz-transform .45s ease-out',
        //         '-moz-transform': rot_string,
        //         '-webkit-transform': rot_string
        //     });
        // }
        // else{
            $('#friend_album_cont').css({
                'left': '0px'
            });
        // }

        selected_user = getUrlVars().user;
        
        $('#friend_cont').hide();
        $('#photo_cont').hide();
        $('#photo_cont').html('');
        
        if (friends[id] != undefined){
            album_html = '<div id="album_wrap"><div id="album_cont"></div></div>';
            if (!mobile || tablet){
                $('#title').html('<h3>' + name + '</h3>');
            }
            else if (mobile && !tablet){
                $('#title').html('<h3>' + name + '</h3>');
            }
            
            $('#title').show();
            $('#friend_album_cont').prepend(album_html);
            $('#friend_album_cont').show();
            
            append_load($('#album_cont'), 'dark');

            //Get user albums and send call back to render albums
            get_user_albums(id, 5, render_albums);
            get_user_videos(id);
        }
        else{
            album_html = '<div id="info_wrap"><h1>Profile Info <span>Not Your Friend</span></h1><div id="info_cont"><div id="info_loading"><img src="http://portrit.s3.amazonaws.com/img/ajax-loader-light.gif"/></div></div></div>';
            $('#title').html('<h3>' + name + '</h3>');
            $('#title').show();
            $('#friend_album_cont').prepend(album_html);
            
            append_load($('#album_cont'), 'dark');
            
            if (!mobile){
                $('#friend_album_cont').css({
                    'max-width': '1000px',
                    'margin': '0px auto'
                });
                $('div#info_wrap').css({
                    'position': 'relative',
                    'right': '0',
                    'left': '0',
                    'padding-top': '1px',
                    'margin-bottom': '10px'
                });
                $('#profile_wrap').css({
                    'position': 'relative',
                    'right': '0',
                    'left': '0',
                    'float': 'right'
                });
            }
            else if (tablet){
                $('#friend_album_cont').css({
                    'max-width': '1000px',
                    'margin': '0px auto'
                });
                $('div#info_wrap').css({
                    'position': 'relative',
                    'right': '0',
                    'left': '0',
                    'padding': '10px',
                    'margin-left': '10px',
                    'float': 'left'
                });
                $('#profile_wrap').css({
                    'position': 'relative',
                    'right': '0',
                    'left': '0',
                    'padding': '10px',
                    'margin-right': '10px',
                    'float': 'right'
                });
            }
            else{
                $('#friend_album_cont').css({
                    'max-width': '1000px',
                    'margin': '0px auto'
                });
                $('div#info_wrap').css({
                    'position': 'relative',
                    'right': '0',
                    'left': '0',
                    'width': '480px',
                    'margin-bottom': '10px',
                    'float': 'left'
                });
                $('#profile_wrap').css({
                    'position': 'relative',
                    'right': '0',
                    'left': '0',
                    'float': 'right'
                });
            }

            // init_profile_view();
            init_info_view();
            $('#friend_album_cont').show();
            
            view_active = 'profile';
        }
        
        click_hold_timer = null;
        mouse_up = false;
        
        selected_album_id = '';
        
        attach_album_handlers();
        attach_profile_handlers();
        attach_info_handlers();
        
        if (getUrlVars().to_profile !== undefined){
            $('#user_wall_view').click();
        }
        
        if (typeof(_gaq) !== "undefined"){
            _gaq.push(['_trackEvent', 'Album_View', 'Shown', '']);
        }
    }
    
    function render_mutual_friends(response, top){
        var style = '';
        if (top == 'all'){
            $('#show_all_mutual').text('Hide All')
            top = response.length;
            style = 'style="display: none;"';
        }
        
        for (var i = mutual_friend_top; i < top; i++){
            $('#mutual_friend_cont').append('<a href="#/user=' + response[i] + '" ' + style + ' name="' + friends[response[i]].name + '"><img style="height: 50px; width: 50px;"class="clear_profile" src="http://graph.facebook.com/' + response[i] + '/picture?type=square"/></a>');
        }
        
        if (response.length > 0){
            $('#mutual_friend_cont').append('<p id="mutual_friend_tooltip" style="display:none;"></p>');
        }

        if (top == response.length){
            if (!mobile){
                $('#mutual_friend_cont a:hidden').delay(300).fadeIn('fast', function(){
                    $('#friend_album_cont').css({
                        'min-height': $('#info_wrap').height() + 100
                    });
                });
            }
            else{
                $('#mutual_friend_cont a:hidden').delay(300).show();
                $('#friend_album_cont').css({
                    'min-height': $('#info_wrap').height() + 100
                });
            }
            
            
        }
        else if (top < response.length){
            $('#mutual_friend_cont > h3').append('<span class="awesome large" id="show_all_mutual">Show All</span>');
        }
        mutual_friend_top = top;
    }
    
    function get_mutual_friends(uid){
        $.getJSON('https://api.facebook.com/method/friends.getMutualFriends?format=JSON&target_uid=' + uid + '&access_token=' + fb_session.access_token + '&callback=?', function(response){
            $('#info_cont').append('<div id="mutual_friend_cont"><h3>Mutual Friends</h3></div>');
            var top = response.length;
            if (top > 10){
                top = 10;
            }
            mutual_friend_data = response;
            
            if ($('#mutual_friend_cont').length == 1){
                render_mutual_friends(response, top);
                mutual_friend_top = top;
            }
        });
    }
    
    function render_user_likes(post_id, obj){
        var j =  0;
        var style = '';
        if (obj.length >= 3){
            j = 2;
        }
        else{
            j = obj.length - 1;
        }
        for (var i = 0; i < obj.length; i++){
            if (i >= 3){
                style = 'display:none;';
            }
            else{
                style = 'left:' + 40 * j + 'px;';
                j--;
            }
            if (friends[obj[i].id] !== undefined){
                liked_html = '<div class="like" style="' + style + '" name="' + obj[i].name + '">' + portrit_favicon + '<a href="#/user=' + obj[i].id + '"><img class="user_liked clear_profile" src="http://graph.facebook.com/' + obj[i].id + '/picture?type=square"/></a></div>';
            }
            else{
                liked_html = '<div class="like" style="' + style + '" name="' + obj[i].name + '"><a href="#/user=' + obj[i].id + '"><img class="user_liked clear_profile" src="http://graph.facebook.com/' + obj[i].id + '/picture?type=square"/></a></div>';
            }
            $('#pid_' + post_id + ' > .like_cont').prepend(liked_html);
        }
        $('#pid_' + post_id + ' > .like_cont').attr('value', obj.length).prepend('<p class="like_tooltip"></p>');
        if (obj.length > 3){
            $('#pid_' + post_id + ' > .like_cont .like:last').css({
               'left': 40 * 2 
            });
        }
        else if (obj.length > 0){
            $('#pid_' + post_id + ' > .like_cont .like:last').css({
               'left': 40 * (i - 1) 
            });
        }
    }
    
    function render_photo_likes(post_id, obj){
        var liked_html = '';
        var j =  0;
        var style = '';
        if (obj){
            for (var i = 0; i < obj.length; i++){
                if (i >= 3){
                    style = 'display:none;';
                }
                else{
                    style = 'right:' + 40 * j + 'px;';
                    j--;
                }
                if (friends[obj[i].id] !== undefined){
                    liked_html = '<div class="like" style="' + style + '" name="' + obj[i].name + '">' + portrit_favicon + '<a href="#/user=' + obj[i].id + '"><img class="user_liked clear_profile" src="http://graph.facebook.com/' + obj[i].id + '/picture?type=square"/></a></div>';
                }
                else{
                    liked_html = '<div class="like" style="' + style + '" name="' + obj[i].name + '"><a href="#/user=' + obj[i].id + '"><img class="user_liked clear_profile" src="http://graph.facebook.com/' + obj[i].id + '/picture?type=square"/></a></div>';
                }
                $('#like_cont').append(liked_html);   
            }
            if ($('#like_cont .like_tooltip').length == 0){
                $('#like_cont').attr('value', obj.length).prepend('<p class="like_tooltip"></p>');
            }
            else{
                $('#like_cont').attr('value', obj.length)
            }
            if ($('.like_photo').length <= 0){
                if (view_active != 'gallery'){
                    $('#like_cont').append('<img class="like_photo" id="lid_' + post_id + '" src="http://portrit.s3.amazonaws.com/img/like.png"/>');
                }
            }
        }
    }
    
    var like_cache = { };
    function get_likes(post_id, func_ptr){
        var obj = null;
        if (like_cache[post_id] == undefined){
            FB.api('/' + post_id + '/likes', function(response){
                obj = response.data;
                like_cache[post_id] = obj;
                func_ptr(post_id, obj);
            });
        }
        else{
            func_ptr(post_id, like_cache[post_id]);
        }
    }
    
    //User feed render
    var active_noms_cache = { };
    var winning_noms_cache = { };
    var active_nom_cats_map = { };
    var winning_nom_cats_map = { };
    function render_feed(data, top){
        if (typeof(top) == "undefined"){
            var top = null;
        }
        var nom_data = null,
            target_html = '',
            voted_html = '',
            votes_html = '',
            photo_html = '',
            nom_heading_html = '',
            left_cont_html = '',
            name = '',
            friend_name = '',
            nom_cat_underscore = '',
            stream_width = 0,
            small_photo_width = 0,
            small_photo_offset = 0,
            prev_offset_width = 0,
            time = null,
            time_diff = 0,
            now = new Date(),
            caption = '',
            nominator_name = '',
            first_offset = 0;
            
        stream_view = 'top_noms';
            
        if (!mobile || tablet){
            stream_width = 690;
        }
        else{
            stream_width = 430;
        }
        
        for (var i = 0; i < data.length; i++){
            nom_data = data[i].noms;
            prev_offset_width = 0;
            first_offset = 0;
                        
            active_nom_cats_map[data[i].cat_name.replace(' ', '_').toLowerCase()] = [ ];   
            
            sort_noms_list_by_votes(nom_data);
            if (nom_data.length > 0){
                for (var k = 0; k < nom_data.length; k++){
                    nom_cat_underscore = nom_data[k].nomination_category.replace(' ', '_').toLowerCase();
                    active_noms_cache[nom_data[k].id] = nom_data[k];
                    small_photo_width = nom_data[k].photo.small_width;
                    active_nom_cats_map[nom_cat_underscore].push(nom_data[k].id);
                    if (small_photo_width > nom_data[k].photo.small_height){
                        small_photo_width = small_photo_width * (80 / nom_data[k].photo.small_height) + 10;
                    }
                    else{
                        small_photo_width = 80 * (small_photo_width / nom_data[k].photo.small_height) + 10;
                        // small_photo_width = small_photo_width * (small_photo_height / 80) + 5;
                    }
                    if (k == 0){
                        small_photo_offset = (stream_width / 2) - (small_photo_width / 2) + prev_offset_width;
                        first_offset = small_photo_offset;
                        target_html = '';
                        voted_html = '';
                        votes_html = '';
                        photo_html = '';
                        left_cont_html = '';
                        
                        time = new Date(nom_data[k].created_time * 1000);
                        time_diff = now - time;
                        time_diff /= 1000;

                        if (friends[nom_data[k].nominatee]){
                            name = friends[nom_data[k].nominatee].name;
                        }
                        else if (nom_data[k].nominatee == me.id){
                            name = 'You';
                        }
                        else{
                            name = '';
                        }
                        
                        caption = '';
                        if (nom_data[k].caption){
                            caption = 'Caption: ' + nom_data[k].caption;
                        }
                        nominator_name = nom_data[k].nominator_name;
                        if (nominator_name == me.name){
                            nominator_name = 'You';
                        }
                        // if (nom_data[k].nominator == me.id){
                        //     nominator_name = 'You';
                        // }
                        // else if (friends[nom_data[k].nominator].name){
                        //     nominator_name = friends[nom_data[k].nominator].name;
                        // }
                        // else{
                        //     nominator_name = '';
                        // }

                        for (var j = 0; j < nom_data[k].votes.length; j++){
                            friend_name = nom_data[k].votes[j].vote_name;
                            votes_html +=   '<a href="#/user=' + nom_data[k].votes[j].vote_user + '" class="clear_profile" id="voted_' + nom_data[k].votes[j].vote_user + '" name="' + friend_name + '">' +
                                                '<img src="https://graph.facebook.com/' + nom_data[k].votes[j].vote_user + '/picture?type=square"/>' +
                                            '</a>';
                        }

                        nom_heading_html =  '<div class="nom_cat_top_cont nom_cat_' + nom_cat_underscore + '">' +
                                                '<div class="nom_cat_user_cont">' +
                                                    '<a href="#/user=' + nom_data[k].nominatee + '" class="clear_profile">' +
                                                        '<img src="https://graph.facebook.com/' + nom_data[k].nominatee + '/picture?type=square"/>' +
                                                        '<h3>' + name + '</h3>' +
                                                    '</a>' +
                                                '</div>' +
                                                '<div class="nom_cat_text_cont">' +
                                                    '<h1>' + nom_data[k].nomination_category + '</h1>' +
                                                '</div>' +
                                                '<div class="clear"></div>' +
                                            '</div>';

                        voted_html ='<div class="voted_cont">' +
                                        '<h3>Voted</h3>' +
                                        '<p class="tooltip"></p>' +
                                        votes_html + 
                                    '</div>';

                        photo_html ='<div class="stream_photo_cont">' +
                                        '<div class="nom_cat_stream_cont">' + 
                                            '<div id="nom_photo_' + nom_data[k].id + '" class="nom_photo_thumbnail" name="selected" style="opacity: 1.0; left:' + small_photo_offset + 'px;">' +
                                                '<img id="nom_photo_' + nom_data[k].id + '" src="' + nom_data[k].photo.src_small + '"/>' +
                                                '<p class="nom_cat_' + nom_data[k].nomination_category.replace(' ', '_').toLowerCase() + '">' + getGetOrdinal(k + 1) + '</p>' +
                                            '</div>' +
                                        '</div>' +
                                        '<div class="nom_cat_main_photo_cont">' +
                                            '<div class="prev_photo">' +
                                                '<div class="prev_photo_img"></div>' +
                                            '</div>' +
                                            '<div class="next_photo">' +
                                                '<div class="next_photo_img"></div>' +
                                            '</div>' +
                                            '<div class="nom_cat_main_photo_wrap">' +
                                                '<a href="#/nom_id=' + nom_data[k].id +'">' +
                                                    '<img class="nom_main_photo" src="' + nom_data[k].photo.src  + '"/>' +
                                                '</a>' +
                                            '</div>' +
                                        '</div>' +
                                        '<div class="nom_photo_bottom_wrap">' +
                                            '<a href="#/user=' + nom_data[k].nominator + '" class="clear_profile">' +
                                                '<img class="user_img" src="https://graph.facebook.com/' + nom_data[k].nominator + '/picture?type=square"/>' +
                                            '</a>' +
                                            '<div class="nominator_cont">' +
                                                '<h3>Nominated by <span class="strong"><a href="#/user=' + nom_data[k].nominator + '" class="clear_profile">' + nominator_name + '</a></span></h3>' +
                                                '<p class="caption">' + caption + '</p>' +
                                            '</div>' +
                                            '<span value="' + (nom_data[k].created_time * 1000) + '">' + secondsToHms(time_diff) + '</span>' + 
                                            '<a href="#/nom_id=' + nom_data[k].id +'">' +
                                                '<p class="comments nom_cat_' + nom_cat_underscore + '">Comments: ' + nom_data[k].comment_count + '</p>' +
                                            '</a>' +
                                        '</div>' +
                                        '<div class="clear"></div>' +
                                    '</div>';

                        left_cont_html = '<div class="nom_stream_left_cont">' + voted_html + '<div class="clear"></div></div>';

                        message = '<div class="feed_post_cont nom_cat_cont_' + data[i].cat_name.replace(' ', '_').toLowerCase() + '" id="nom_' + nom_data[k].id + '">' + nom_heading_html + left_cont_html  + photo_html + '<div class="clear"></div></div>';
                        $('#profile_cont').append(message);
                    }
                    else{
                        small_photo_offset = first_offset + prev_offset_width;
                        var img_scroller_html = '<div id="nom_photo_' + nom_data[k].id + '" class="nom_photo_thumbnail" style="opacity: 0.6; left:' + small_photo_offset + 'px;">' +
                                                    '<img id="nom_photo_' + nom_data[k].id + '" src="' + nom_data[k].photo.src_small + '"/>' +
                                                    '<p class="nom_cat_' + nom_data[k].nomination_category.replace(' ', '_').toLowerCase() + '">' + getGetOrdinal(k + 1) + '</p>' +
                                                '</div>';
                        $('.nom_cat_stream_cont:last').append(img_scroller_html);
                    }
                    prev_offset_width += small_photo_width;
                }
            }
            else{
                var empty_html = '';
                target_html = '';
                voted_html = '';
                votes_html = '';
                photo_html = '';
                left_cont_html = '';

                nom_heading_html = '<h1 class="nom_cat_' + data[i].cat_name.replace(' ', '_').toLowerCase() + '_text">' + data[i].cat_name + '</h1><div class="clear"></div>';

                empty_html ='<div class="empty_nom_overlay">' +
                                '<div class="empty_message_box">' +
                                    '<p>None of your friends are currently nominated for </p><p class="strong">' + data[i].cat_name + '</p>' +
                                    '<div class="target_message_box"></div>' +
                                '</div>' +
                                '<div class="empty_trophy trophy_img large ' + data[i].cat_name.replace(' ', '_').toLowerCase() + '"></div>' +
                            '</div>';

                photo_html ='<div class="stream_photo_cont">' +
                                '<div class="nom_cat_stream_cont">' + 
                                
                                '</div>' +
                                '<div class="nom_cat_main_photo_cont">' +
                                    '<div class="nom_cat_main_photo_wrap">' +
                                        
                                    '</div>' +
                                '</div>' +
                                '<div class="clear"></div>' +
                            '</div>';

                left_cont_html = '<div class="nom_stream_left_cont">' + voted_html + '<div class="clear"></div></div>';

                message = '<div class="feed_post_cont empty nom_cat_cont_' + data[i].cat_name.replace(' ', '_').toLowerCase() + '">' + empty_html + nom_heading_html + left_cont_html  + photo_html + '<div class="clear"></div></div>';
                $('#profile_cont').append(message);
            }
        }
        
        if (selected_user == null || selected_user == ''){
            if (!my_feed){
                // if (load_more_feed){
                //     my_feed = my_feed.concat(data);
                //     load_more_feed = false;
                // }
                my_feed = data;
            }
        }
        else{
            if (user_feed){
                user_feed = user_feed.concat(data);
            }
            else{
                user_feed = data;
            }
        }
        
        if (view_active != 'main'){
			var feed_height = $('#profile_wrap').outerHeight() + $('#header').height() + $('#main_view_control').outerHeight();
			$('#friend_album_cont').css({'min-height': feed_height});
            setTimeout(function(){
                var feed_height = $('#profile_wrap').outerHeight() + $('#header').height() + $('#main_view_control').outerHeight();
				$('#friend_album_cont').css({'min-height': feed_height});
            }, 200);
        }
        
        if (mobile){
            var elms = $('.nom_cat_main_photo_cont').get();
            for (var i = 0; i < elms.length; i++){
                // addSwipeListener(elms[i], function(e) {
                //     if (e.direction == 'left'){
                //         alert('next');
                //     }
                //     else{
                //         alert('previous');
                //     }
                // }); 
            }
        }
        initial_feed_load = false;
    }
    
    function update_nom_cat(active_id, nom_id){
        var stream_width = 0;
        var votes_html = '';
        var recent_winners = getUrlVars()['recent-winners'];
        var nom_data = null;
        if (recent_winners != undefined){
            nom_data = winning_noms_cache[nom_id];
        }
        else{
            nom_data = active_noms_cache[nom_id];
        }
        $('#nom_photo_' + active_id).attr('name', '').css({
            'opacity': 0.6
        });
        var selected_thumbnail = $('#nom_photo_' + nom_id).attr('name', 'selected').css({
            'opacity': 1.0
        });
        
        if (!mobile || tablet){
            stream_width = 560;
        }
        else{
            stream_width = 500;
        }
        
        var img_widths = [ ];
        var slide_center = 0;
        var slide_img_width = 0;
        var center_found = false;
        var mid_screen = $('.nom_cat_stream_cont').width() / 2;
        var slide_images = $('#nom_' + active_id + ' .nom_photo_thumbnail');
        $(slide_images).each(function(j, selected){
            slide_img_width = $(this).width();
            if ($(this).attr('name') === 'selected'){
                slide_center += (slide_img_width / 2);
                center_found = true;
            }
            else if (center_found === false){
                slide_center += slide_img_width + 5;
            }

            img_widths.push(slide_img_width + 5);
        });

        previous_x = 0;
        margin_offset = mid_screen - slide_center;
        
        $(slide_images).each(function(i, selected){
            $(this).css({
                'left': previous_x + margin_offset,
                'top': 0
            });

            previous_x += img_widths[i];
        });
        
        //Update voted section
        $('#nom_' + active_id + ' .voted_cont a').remove();
        for (var j = 0; j < nom_data.votes.length; j++){
            votes_html +=   '<a href="#/user=' + nom_data.votes[j].vote_user + '" class="clear_profile" id="voted_' + nom_data.votes[j].vote_user + '" name="' + nom_data.votes[j].vote_name + '">' +
                                '<img src="https://graph.facebook.com/' + nom_data.votes[j].vote_user + '/picture?type=square"/>' +
                            '</a>';
        }
        $('#nom_' + active_id + ' .voted_cont').append(votes_html);
        
        $('#nom_' + active_id + ' .nom_main_photo').attr('src', nom_data.photo.src);
        $('#nom_' + active_id + ' .nom_cat_user_cont img').attr('src', 'https://graph.facebook.com/' + nom_data.nominatee + '/picture?type=square');
        $('#nom_' + active_id + ' .nom_cat_user_cont a').attr('href', '#/user=' + nom_data.nominatee);
        //Set owner name
        var name = '';
        if (friends[nom_data.nominatee]){
            name = friends[nom_data.nominatee].name;
        }
        else if (nom_data.nominatee == me.id){
            name = 'You';
        }
        
        var caption = '';
        var nominator_name = '';
        
        if (nom_data.caption){
            caption = 'Caption: ' + nom_data.caption;
        }
        nominator_name = nom_data.nominator_name;
        if (nominator_name == me.name){
            nominator_name = 'You';
        }
        // if (nom_data.nominator == me.id){
        //     nominator_name = 'You';
        // }
        // else if (friends[nom_data.nominator]){
        //     nominator_name = friends[nom_data.nominator].name;
        // }
        // else{
        //     nominator_name = '';
        // }

        // $('#nom_' + active_id + ' .target_wrap h3:first').text(name);
        $('#nom_' + active_id + ' .nom_cat_user_cont h3').text(name);
        $('#nom_' + active_id + ' .nom_photo_bottom_wrap > a.clear_profile').attr('href', '/#/user=' + nom_data.nominator);
        $('#nom_' + active_id + ' .nom_photo_bottom_wrap img.user_img').attr('src', 'https://graph.facebook.com/' + nom_data.nominator + '/picture?type=square');
        $('#nom_' + active_id + ' .nom_photo_bottom_wrap p.comments').text('Comments: ' + nom_data.comment_count).parent().attr('href', '/#/nom_id=' + nom_data.id);
        $('#nom_' + active_id + ' .nom_photo_bottom_wrap p.caption').text(caption);
        $('#nom_' + active_id + ' .nom_photo_bottom_wrap .nominator_cont a').attr('href', '/#/user=' + nom_data.nominator).text(nominator_name);
        $('#nom_' + active_id + ' .vote_cont p').text(nom_data.vote_count);
        $('#nom_' + active_id + ' .nom_cat_main_photo_wrap a').attr('href', '/#/nom_id=' + nom_data.id);
        
        var now = new Date();
        var time = new Date(nom_data.created_time * 1000);
        var time_diff = now - time;
        time_diff /= 1000;
        
        $('#nom_' + active_id + ' .nom_photo_bottom_wrap > span').text(secondsToHms(time_diff));
        
        $('#nom_' + active_id).attr('id', 'nom_' + nom_id)
    }
    
    //User profile render
    function render_profile(data){
        $('#info_loading').hide();
        
        var fav_html = '';
        var img_html = '<div id="profile_info_img"><img id="large_profile_img" src="http://graph.facebook.com/' + data.id + '/picture?type=large"/>' + fav_html + '</div>';
        var profile_items = { };
        profile_items.link = (typeof data.link !=='undefined') ? data.link : '';
        profile_items.about = (typeof data.about !=='undefined') ? data.about : '';
        profile_items.birthday = (typeof data.birthday !=='undefined') ? data.birthday : '';
        profile_items.work = (typeof data.work !=='undefined') ? data.work : '';
        profile_items.education = (typeof data.education !=='undefined') ? data.education : '';
        profile_items.website = (typeof data.website !=='undefined') ? data.website : '';
        profile_items.hometown = (typeof data.hometown !=='undefined') ? data.hometown : '';
        profile_items.location = (typeof data.website !=='undefined') ? data.location : '';
        profile_items.gender = (typeof data.gender !=='undefined') ? data.gender : '';
        profile_items.interested_in = (typeof data.interested_in !=='undefined') ? data.interested_in : '';
        profile_items.meeting_for = (typeof data.meeting_for !=='undefined') ? data.meeting_for : '';
        profile_items.relationship_status = (typeof data.relationship_status !=='undefined') ? data.relationship_status : '';
        profile_items.religion = (typeof data.religion !=='undefined') ? data.religion : '';
        profile_items.political = (typeof data.political !=='undefined') ? data.political : '';
        
        var profile_html = img_html;
        
        var list_internal_title = "";
        var list_internal_content = "";
        profile_html += '<ul>';
        for (key in profile_items){
            if (profile_items[key] !== ''){
                list_internal_title = "";
                list_internal_content = "";
                if (key === "link"){
                    list_internal_title = "Link";
                    list_internal_content = '<a target="_blank" href="' + profile_items[key] + '">Facebook profile</a>';
                }
                else if (key === "education"){
                    list_internal_title = "Education";
                    for (var i = 0; i < profile_items[key].length; i++){
                        list_internal_content += '<p>' + profile_items[key][i].school.name + '</p>';
                    }
                }
                else if (key === "hometown"){
                    list_internal_title = "Hometown";
                    list_internal_content = '<p>' + profile_items[key].name + '</p>';
                }
                else{
                    list_internal_title = key;
                    list_internal_content = profile_items[key];
                }
                profile_html += '<li><h2>' + capitaliseFirstLetter(list_internal_title) + ' </h2>' + '<p>' + list_internal_content + '</p></li>';   
            }
        }
        profile_html += '</ul>';
        
        user_profile = data;
        $('#info_cont').append(profile_html);
        // $('#info_wrap').append('<h1>Trophy Room</h1><div id="trophy_cont"></div>');
        // render_user_profile_trophies();
    }
    
    var feed_load_once = true;
    function get_user_feed(fnc_ptr, method){
        if (method == 'user_stream'){
            $.getJSON('/get_user_nom/', {'nom_id': getUrlVars().nom_id} ,function(data){
                var nom_data = null;
                
                if (data && data.length > 0){
                    if (!data[0].inactive){
                        for (var i = 0; i < data.length; i++){
                            nom_data = data[i].noms;
                            active_nom_cats_map[data[i].cat_name.replace(' ', '_').toLowerCase()] = [ ];

                            if (nom_data.length > 0){
                                for (var k = 0; k < nom_data.length; k++){
                                    active_noms_cache[nom_data[k].id] = nom_data[k];
                                    active_nom_cats_map[nom_data[k].nomination_category.replace(' ', '_').toLowerCase()].push(nom_data[k].id);
                                }
                            }
                        }
                        if (fnc_ptr){
                            fnc_ptr(my_feed, data[0].inactive);
                        }
                    }
                    else{
                        if (fnc_ptr){
                            fnc_ptr(data[0].noms, data[0].inactive);
                        }
                    }
                }
            });
        }
        else if (method == 'won'){
            $.getJSON('/get_recent_winners/', {'nom_id': getUrlVars().nom_id}, function(data){
                winners_feed = data;
                var nom_data = null;

                for (var i = 0; i < data.length; i++){
                    winning_noms_cache[data[i].id] = data[i];
                }
                if (fnc_ptr){
                    fnc_ptr(data);
                }
            });
        }
        else if (method == 'temp'){
            $.getJSON('/get_user_win_stream/', function(data){
                for (var i = 0; i < data.length; i++){
                    winning_noms_cache[data[i].id] = data[i];
                }
                if (fnc_ptr){
                    fnc_ptr(data);
                }
            });
        }
    }
    
    function update_comment_count(data){
        var nom_id = data.id;
        var nom = active_noms_cache[nom_id];
        var comment_count = 0;
        var comment_container = null;
        
        if (view_active == 'main' && default_view == 'wall' && stream_view == 'recent_noms'){
            comment_container = $('.nom_comment_' + nom_id + ' span');
            comment_count = $(comment_container).text();
            comment_count = parseInt(comment_count) + 1;
            $(comment_container).text(comment_count);
        }
        else{
            comment_container = $('#nom_' + nom_id + ' .nom_photo_bottom_wrap span');
            comment_count = $(comment_container).text();
            comment_count = parseInt(comment_count) + 1;
            $(comment_container).text(comment_count);
        }

    }
    
    function update_vote_count(data){
        if (data){
            var nom_id = data.nom_id;
            var nom = active_noms_cache[nom_id];
            var votes_html = '';
            nom.vote_count = data.vote_count;
            if (view_active == 'main' && stream_view == 'recent_noms'){
                $('.nom_vote_' + nom_id).find('span').text(data.vote_count);
                $('.nom_vote_' + nom_id).find('h2').text('Votes: ' + data.vote_count);
            }
            else if (view_active == 'main'){
                $('#nom_photo_' + nom_id + ' p').text(data.vote_count);
                if ($('#nom_' + nom_id).length > 0){
                    $('#nom_' + nom_id + ' .vote_cont p').text(data.vote_count);
                    if ($('#nom_' + nom_id + ' #voted_' + data.vote_user).length == 0){
                        votes_html =   '<a href="#/user=' + data.vote_user + '" class="clear_profile" id="voted_' + data.vote_user + '" name="' + data.vote_name + '">' +
                                            '<img src="https://graph.facebook.com/' + data.vote_user + '/picture?type=square"/>' +
                                        '</a>';
                        $('#nom_' + nom_id + ' .voted_cont').append(votes_html);
                    }
                }
            }
            else if (view_active == 'nom_detail'){
                $('#nom_photo_' + nom_id + ' p').text(data.vote_count);
                if ($('#main_nom_cont').attr('value') == nom_id){
                    $('#vote_cont_left p').text(data.vote_count);
                    // if ($('#nom_' + nom_id + ' #voted_' + data.vote_user).length == 0){
                        votes_html =   '<a href="#/user=' + data.vote_user + '" class="clear_profile" id="voted_' + data.vote_user + '" name="' + data.vote_name + '">' +
                                            '<img src="https://graph.facebook.com/' + data.vote_user + '/picture?type=square"/>' +
                                        '</a>';
                        $('#nom_votes_wrap').append(votes_html);
                    // }
                }
            }
        }
    }
    
    function update_feed(data){
        if (data){
            var nom_data = null,
                nomination_html = '',
                nom_cat = '',
                container_class = '',
                container = null,
                target_html = '',
                voted_html = '',
                votes_html = '',
                photo_html = '',
                photo_stream_html = '',
                photo_wrap = '';
                name = '',
                stream_width = $('.stream_photo_cont').width(),
                small_photo_offset = 0,
                small_photo_width = 0;
            for (var i = 0; i < data.nom_data.length; i++){
                nom_data = data.nom_data[i];
                active_noms_cache[nom_data.id] = nom_data;
                nom_cat = nom_data.nomination_category;
                container_class = nom_cat.replace(' ', '_').toLowerCase();
                container = $('.nom_cat_cont_' + container_class);
                //Load data into empty not cat
                if ($(container).hasClass('empty')){
                    small_photo_width = nom_data.photo.small_width;
                    if (small_photo_width > nom_data.photo.small_height){
                        small_photo_width = small_photo_width * (80 / nom_data.photo.small_height) + 12;
                    }
                    else{
                        small_photo_width = 80 * (small_photo_width / nom_data.photo.small_height) + 13;
                        // small_photo_width = small_photo_width * (small_photo_height / 80) + 5;
                    }
                    small_photo_offset = (stream_width / 2) - (small_photo_width / 2);
                    target_html = '';
                    voted_html = '';
                    votes_html = '';
                    photo_html = '';
                    photo_wrap = '';
                    photo_stream_html = '';

                    if (friends[nom_data.nominatee]){
                        name = friends[nom_data.nominatee].name;
                    }

                    for (var j = 0; j < nom_data.votes.length; j++){
                        votes_html +=   '<a href="#/user=' + nom_data.votes[j].user_id + '" class="clear_profile" id="voted_' + nom_data.votes[j].user_id + '" name="' + nom_data.votes[j].user_name + '">' +
                                            '<img src="https://graph.facebook.com/' + nom_data.votes[j].user_id + '/picture?type=square"/>' +
                                        '</a>';
                    }

                    target_html =   '<a href="#/user=' + nom_data.nominatee + '" class="clear_profile">' +
                                        '<img src="https://graph.facebook.com/' + nom_data.nominatee + '/picture?type=square"/>' +
                                        '<h3>' + name + '</h3>' +
                                    '</a>';

                    voted_html ='<div class="voted_cont">' +
                                    '<h3>Voted</h3>' +
                                    '<p class="tooltip"></p>' +
                                    votes_html + 
                                '</div>';

                    photo_stream_html = '<div class="nom_photo_thumbnail" id="nom_photo_' + nom_data.id + '" style="opacity: 1.0; left:' + small_photo_offset + 'px">' +
                                            '<img id="nom_photo_' + nom_data.id + '" name="selected"  src="' + nom_data.photo.src_small + '"/>' +
                                        '</div>';
                    photo_html ='<a href="">' +
                                    '<img class="nom_main_photo" src="' + nom_data.photo.src  + '"/>' +
                                '</a>' +
                                '<div class="vote_cont">' +
                                    '<img class="vote_up" name="' + nom_data.id + '" src="http://portrit.s3.amazonaws.com/img/up_small.png"/>' +
                                    '<p>' + nom_data.vote_count + '</p>' +
                                    '<img class="vote_down" name="' + nom_data.id + '" src="http://portrit.s3.amazonaws.com/img/down_small.png"/>' +
                                '</div>';
                    photo_wrap ='<div class="nom_photo_bottom_wrap">' +
                                    '<a href="#">' +
                                        '<p class="left">Comments: <span>' + nom_data.comment_count + '</span></p>' +
                                    '</a>' +
                                '</div>';
                    
                    
                    $(container).find('.target_wrap').prepend(target_html);
                    $(container).find('.target_cont').after(voted_html);
                    $(container).find('.nom_cat_stream_cont').prepend(photo_stream_html);
                    $(container).find('.nom_cat_main_photo_wrap').prepend(photo_html);
                    $(container).find('.nom_cat_main_photo_cont').after(photo_wrap);
                }
                else{ //Load data into already active cat
                    photo_stream_html = '<div class="nom_photo_thumbnail" id="nom_photo_' + nom_data.id + '" style="left:' + small_photo_offset + 'px">' +
                                            '<img id="nom_photo_' + nom_data.id + '"  src="' + nom_data.photo.src_small + '"/>' +
                                        '</div>';
                    $(container).find('.nom_cat_stream_cont').append(photo_stream_html);
                    if (!mobile || tablet){
                        stream_width = 560;
                    }
                    else{
                        stream_width = 500;
                    }
                    
                    var active_id = $(container).attr('id');
                    var img_widths = [ ];
                    var slide_center = 0;
                    var slide_img_width = 0;
                    var center_found = false;
                    var mid_screen = $('.nom_cat_stream_cont').width() / 2;
                    var slide_images = $('#' + active_id + ' .nom_photo_thumbnail');
                    $(slide_images).each(function(j, selected){
                        slide_img_width = $(this).width();
                        if ($(this).attr('name') === 'selected'){
                            slide_center += (slide_img_width / 2);
                            center_found = true;
                        }
                        else if (center_found === false){
                            slide_center += slide_img_width + 10;
                        }

                        img_widths.push(slide_img_width + 10);
                    });

                    previous_x = 0;
                    margin_offset = mid_screen - slide_center;

                    $(slide_images).each(function(i, selected){
                        $(this).css({
                            'left': previous_x + margin_offset,
                            'top': 0
                        });

                        previous_x += img_widths[i];
                    });
                }
            }
        }
    }
    
    function render_winners(data){
        var cat_name = '',
            cat_name_underscore = '',
            photo_stream_html = '',
            winning_cat_html = '',
            small_photo_width = 0,
            small_photo_offset = 0,
            prev_offset_width = 0,
            stream_width = 930,
            first_offset = 0,
            name = '';
        for (var i = 0; i < data.length; i++){
            cat_name = data[i].cat_name;
            cat_name_underscore = cat_name.replace(' ', '_').toLowerCase();
            photo_stream_html = '';
            prev_offset_width = 0;
            first_offset = 0;
            if (data[i].noms.length > 0){
                for (var j = 0; j < data[i].noms.length; j++){
                    winning_noms_cache[data[i].noms[j].id] = data[i].noms[j];
                    if (winning_nom_cats_map[cat_name_underscore]){
                        winning_nom_cats_map[cat_name_underscore].push(data[i].noms[j].id);
                    }
                    else{
                        winning_nom_cats_map[cat_name_underscore] = [data[i].noms[j].id];
                    }
                    small_photo_width = data[i].noms[j].photo.small_width;
                    if (small_photo_width > data[i].noms[j].photo.small_height){
                        small_photo_width = small_photo_width * (80 / data[i].noms[j].photo.small_height) + 10;
                    }
                    else{
                        small_photo_width = 80 * (small_photo_width / data[i].noms[j].photo.small_height) + 10;
                        // small_photo_width = small_photo_width * (small_photo_height / 80) + 5;
                    }
                    if (j == 0){
                        small_photo_offset = (stream_width / 2) - (small_photo_width / 2) + prev_offset_width;
                        first_offset = small_photo_offset;
                        photo_stream_html +='<div id="nom_photo_' + data[i].noms[j].id + '" class="nom_photo_thumbnail" name="selected" style="opacity: 1.0; left:' + small_photo_offset + 'px;">' +
                                                '<img id="nom_photo_' + data[i].noms[j].id + '" src="' + data[i].noms[j].photo.src_small + '"/>' +
                                                '<p class="nom_cat_' + data[i].noms[j].nomination_category.replace(' ', '_').toLowerCase() + '">' + data[i].noms[j].vote_count + '</p>' +
                                            '</div>';
                        
                        // '<img class="nom_photo_thumbnail" id="nom_photo_' + data[i].noms[j].id + '" name="selected" style="left:' + small_photo_offset + 'px;" src="' + data[i].noms[j].photo.src_small + '"/>';
                    }
                    else{
                        small_photo_offset = first_offset + prev_offset_width;
                        photo_stream_html +='<div id="nom_photo_' + data[i].noms[j].id + '" class="nom_photo_thumbnail" style="opacity: 0.6; left:' + small_photo_offset + 'px;">' +
                                                '<img id="nom_photo_' + data[i].noms[j].id + '" src="' + data[i].noms[j].photo.src_small + '"/>' +
                                                '<p class="nom_cat_' + data[i].noms[j].nomination_category.replace(' ', '_').toLowerCase() + '">' + data[i].noms[j].vote_count + '</p>' +
                                            '</div>';
                        '<img class="nom_photo_thumbnail" id="nom_photo_' + data[i].noms[j].id + '" style="opacity:0.6; left:' + small_photo_offset + 'px;" src="' + data[i].noms[j].photo.src_small + '"/>';
                    }
                    prev_offset_width += small_photo_width;
                }
                name = '';
                if (friends[data[i].noms[0].nominatee]){
                    name = friends[data[i].noms[0].nominatee].name;
                }
                else if (data[i].noms[0].nominatee == me.id){
                    name = 'You';
                }
                else{
                    name = '';
                }
                winning_cat_html =  '<div class="winning_feed_post_cont nom_cat_cont_' + cat_name_underscore + '" id="nom_' + data[i].noms[0].id + '">' +
                                        '<h1 class="nom_cat_' + cat_name_underscore + '">' + cat_name + '</h1>' +
                                        '<div class="winning_photo_cont">' +
                                            '<div class="nom_cat_stream_cont">' + 
                                                photo_stream_html +
                                            '</div>' +
                                            '<div class="winning_nom_cat_main_photo_cont">' +
                                                '<div class="prev_photo">' +
                                                    '<div class="prev_photo_img"></div>' +
                                                '</div>' +
                                                '<div class="next_photo">' +
                                                    '<div class="next_photo_img"></div>' +
                                                '</div>' +
                                                '<div class="winning_nom_cat_main_photo_wrap">' +
                                                    '<a href="#/nom_id=' + data[i].noms[0].id + '/won">' +
                                                        '<img class="nom_main_photo" src="' + data[i].noms[0].photo.src + '">' + 
                                                    '</a>' +
                                                '</div>' +
                                                '<img class="winning_trophy" src="http://portrit.s3.amazonaws.com/img/trophies/large/' + cat_name_underscore + '.png"/>' +
                                                '<div class="nom_photo_bottom_wrap">' +
                                                    '<a href="#/nom_id=' + data[i].noms[0].id + '"><p class="left">Comments: <span>' + data[i].noms[0].comment_count + '</span></p><p class="right strong">' + name + '</p></a>' +
                                                '</div>'
                                            '</div>' +
                                        '</div>' +
                                        '<div class="clear"></div>' +
                                    '</div>'
            }
            else{
                winning_cat_html =  '<div class="winning_feed_post_cont nom_cat_cont_' + cat_name_underscore + '">' +
                                        '<h1 class="nom_cat_' + cat_name_underscore + '_text">' + cat_name + '</h1>' +
                                        '<div class="nom_color_new_side nom_cat_' + cat_name_underscore + '"></div>' +
                                        '<div class="winning_photo_cont">' +
                                            '<div class="winning_nom_cat_main_photo_cont">' +
                                                '<div class="empty_winning_cont">' +
                                                    '<h1>No winners for <span class="nom_cat_' + cat_name_underscore + '_text">' + cat_name + '</span> yet. Be the first of your friends!</h1>' +
                                                    '<img class="winning_trophy" style="bottom: 0px;" src="http://portrit.s3.amazonaws.com/img/trophies/large/' + cat_name_underscore + '.png"/>' +
                                                '</div>' +
                                            '</div>' +
                                        '</div>' +
                                        '<div class="clear"></div>' +
                                    '</div>'
            }

            $('#profile_cont').append(winning_cat_html);
        }
    }
    
    function append_load(cont, loader){
        if (loader == 'light'){
            $(cont).append('<div id="loader"><img src="http://portrit.s3.amazonaws.com/img/ajax-loader-light.gif"/></div>');
        }
        else{
            $(cont).append('<div id="loader"><img src="http://portrit.s3.amazonaws.com/img/album-loader-dark.gif"/></div>');
        }
    }
    
    function remove_load(){
        $('#loader').remove();
    }
    
    var winners_feed = null;
    function init_winners_view(){
        append_load($('#context_overlay_cont > div'), 'light');
        if (!winners_feed){
            //Get winner feed from server
            remove_load();
            get_user_feed(render_recent_winners, 'won');
            // $.getJSON('/get_recent_winners/', function(data){
            //     winners_feed = data;
            //     
            //     render_winners(winners_feed);
            // });
        }
        else{
            remove_load();
            render_recent_winners(winners_feed)
        }
    }
    
    function render_latest_photos(data){
        var photo = null,
            photo_id = null,
            owner_id = null,
            owner_name = '',
            photo_html = '';
        for (var i = 0; i < data.length; i++){
            if (friends[data[i].source_id]){
                for (var j = 0; j < data[i].attachment.media.length; j++){
                    photo = data[i].attachment.media[j];
                    photo_id = photo.photo.pid;
                    owner_id = data[i].actor_id;
                    if (friends[owner_id]){
                        owner_name = friends[owner_id].name;
                    }
                    else{
                        owner_name = '';
                        for (var k = 0; k < data[i].tagged_ids.length; k++){
                            if (friends[data[i].tagged_ids[k]]){
                                owner_name = friends[data[i].tagged_ids[k]].name;
                            }
                        }
                    }
                
                    photo_html ='<div class="new_photo_cont" name="' + owner_name + '" value="' + photo_id + '">' +
                                    '<img src="' + photo.src + '"/>' +
                                '</div>';
                    $('#new_photo_cont').append(photo_html);
                }
            }
        }
        if ($(window).height() < 900){
            $('#wrapper').css('min-height', 900);
        }
    }
    
    var photo_feed = null;
    function init_latest_photos(){
        view_active = 'latest_photos';
        $('#context_overlay_cont > div').append('<div id="new_photo_cont"><h1>Latest Photos</h1><p class="tooltip"></p></div>');
        append_load($('#context_overlay_cont > div'), 'light');
        if (!photo_feed){
            //Get newest photo feed from server
            $.getJSON('https://api.facebook.com/method/stream.get?access_token=' + fb_session.access_token + '&limit=50&filter_key=' + photo_filter + '&format=json&callback=?', function(data){
                remove_load();
                photo_feed = data.posts;
                render_latest_photos(photo_feed);
            });
        }
        else{
            remove_load();
            render_latest_photos(photo_feed);
        }
    }
    
    function render_recent_winners(data){
        var photo = null,
            name = '',
            nom_cat = '',
            nom_cat_underscore = '',
            winning_nom_html = '';
            
        $('#context_overlay_cont > div').append('<div id="new_photo_cont"><h1>Recent Winners</h1></div>');
        if (data.length > 0){
            for (var i = 0; i < data.length; i++){
                photo = data[i].photo;
                nom_cat = data[i].nomination_category;
                nom_cat_underscore = nom_cat.replace(' ', '_').toLowerCase();
                if (friends[data[i].nominatee] !== undefined){
                    name = friends[data[i].nominatee].name;
                }
                else if(data[i].nominatee == me.id){
                    name = 'You';
                }
                else{
                    name = '';
                }
                winning_nom_html =  '<div class="winning_nom_cont">' +
                                        '<a href="/#/nom_id=' + data[i].id + '/won/">' +
                                            '<img src="' + photo.src + '"/>' +
                                        '</a>' +
                                        '<div class="winning_nom_overlay">' +
                                            '<a href="/#/user=' + data[i].nominatee + '">' +
                                                '<p class="nom_cat_' + nom_cat_underscore + '_text">' + name + '</p>' +
                                            '</a>' +
                                            '<div class="trophy_img medium ' + nom_cat_underscore + '"></div>' +
                                        '</div>' +
                                    '</div>';
                $('#new_photo_cont').append(winning_nom_html);
            }
            $('#new_photo_cont').append('<div class="clear"></div>');
        }
        else{
            $('#new_photo_cont').append('<h2>No Recent Winners.</h2>');
        }
    }
    
    var winner_feed = null;
    function init_recent_winners(){
        view_active = 'recent_winners';
        append_load($('#context_overlay_cont > div'), 'light');
        if (!winner_feed){
            remove_load();
            get_user_feed(render_recent_winners, 'won');
            // $.getJSON('/get_recent_winners/', function(data){
            //     winners_feed = data;
            //     remove_load();
            //     render_recent_winners(winners_feed);
            // });
        }
        else{
            remove_load();
            render_recent_winners(winner_feed);
        }
    }
    
    function inject_nom_stream(noms){
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
            recent_nom_html = '',
            nominator_name = '',
            nominator_caption = '',
            trophy_size = 'large';
            
        if (mobile && !tablet){
            trophy_size = 'medium';
        }
        for (var i = 0; i < noms.length; i++){
            nom = noms[i]
            nom_cat_text = nom.nomination_category;
            nom_cat_underscore = nom.nomination_category.replace(' ', '_').toLowerCase();
            if (active_noms_cache[nom.id] == undefined){
                active_noms_cache[nom.id] = nom;
                if (active_nom_cats_map[nom_cat_underscore]){
                    active_nom_cats_map[nom_cat_underscore].push(nom.id);
                }
                else{
                    active_nom_cats_map[nom_cat_underscore] = [nom.id];
                }
            }
            if (friends[nom.nominatee]){
                name = friends[nom.nominatee].name;
            }
            else if (nom.nominatee == me.id){
                name = 'You';
            }
            else{
                name = '';
            }
            nominator_name = '';
            nominator_caption = '';
            if (nom.nominator == me.id){
                nominator_name = 'You';
            }
            else if (nom.nominator_name){
                nominator_name = nom.nominator_name;
            }
            else if (friends[nom.nominator]){
                nominator_name = friends[nom.nominator].name;
            }
            else{
                nominator_name = '';
            }
            
            if (nom.caption){
                nominator_caption = 'Caption: ' + nom.caption;
            }
            
            user_thumbnail = '<img src="https://graph.facebook.com/' + nom.nominatee + '/picture?type=square"/>';
            photo_thumbnail = '<img src="' + nom.photo.src + '"/>';
            
            comment_html =  '<div class="comment_empty">' +
                                '<h2>No comments yet. Be the first!</h2>' +
                            '</div>';
            
            time = new Date(nom.created_time * 1000);
            time_diff = now - time;
            time_diff /= 1000;
            
            recent_nom_html =   '<div class="recent_nom_cont" style="display:none;" id="' + nom.id + '">' +
                                    '<div class="recent_nom_top_cont nom_cat_' + nom_cat_underscore + '">' +
                                        '<a href="#/user=' + nom.nominatee + '">' + user_thumbnail + '</a>' +
                                        '<a href="#/user=' + nom.nominatee + '"><h2>' + name + '</h2></a>' +
                                        '<h3>Nominated for <a href="#/trophy=' + nom_cat_underscore + '"><span class="strong">' + nom_cat_text + '</span></a><span>' + secondsToHms(time_diff) + '</span></h3>' +
                                        '<div class="clear"></div>' +
                                    '</div>' +
                                    '<div class="recent_nom_photo_cont">' +
                                        '<div class="recent_nom_photo_left_cont">' +
                                            '<div class="recent_nom_photo_left_wrap">' +
                                                '<a href="#/nom_id=' + nom.id + '">' +
                                                    photo_thumbnail +
                                                    '<div id="nominator_overlay_cont">' +
                                                        '<a href="/#/user=' + nom.nominator + '"><img class="user_img" src="https://graph.facebook.com/' + nom.nominator + '/picture?type=square"/></a>' +
                                                        '<h2>Nominated by <span class="strong"><a href="/#/user=' + nom.nominator + '">' + nominator_name + '</a></span></h2>' +
                                                        '<p>' + nominator_caption + '</p>' +
                                                    '</div>' +
                                                '</a>' +
                                            '</div>' +
                                        '</div>' +
                                        '<div class="recent_nom_photo_right_cont">' +
                                            '<div class="recent_nom_vote_count nom_vote_' + nom.id + '">' +
                                                '<div class="trophy_img ' + trophy_size + ' ' + nom_cat_underscore + '"></div>' +
                                                '<a href="#/nom_id=' + nom.id + '/votes">' +
                                                    '<h2 class="nom_cat_' + nom_cat_underscore + '">Votes: <span class="strong">' + nom.vote_count + '</span></h2>' +
                                                '</a>' +
                                            '</div>' +
                                            '<div class="clear"></div>' +
                                        '</div>' +
                                        '<div class="clear"></div>' +
                                    '</div>' +
                                    '<div class="recent_nom_comment_cont" id="nom_comments_' + nom.id +'">' +
                                        '<div class="recent_nom_comment_heading" value="' + nom.id + '">' +
                                            '<a href="#/nom_id=' + nom.id + '/comments">' +
                                                '<h1>Comments</h1>' +
                                            '</a>' +
                                            '<span class="add_new_comment awesome large">New Comment</span>' +
                                            '<div class="clear"></div>' +
                                        '</div>' +
                                        comment_html +
                                    '</div>' +
                                '</div>';
            
            $('#recent_left_cont').prepend(recent_nom_html);
            if (!mobile){
                $('.recent_nom_cont:first').fadeIn();
            }
            else{
                $('.recent_nom_cont:first').show();
            }
        }
    }
    
    function render_recent_stream(recent_noms){
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
            trophy_size = 'large';
            
        if (mobile && !tablet){
            trophy_size = 'medium';
        }
        for (var i = 0; i < recent_noms.length; i++){
            nom = recent_noms[i]
            nom_cat_text = nom.nomination_category;
            nom_cat_underscore = nom.nomination_category.replace(' ', '_').toLowerCase();
            if (active_noms_cache[nom.id] == undefined){
                active_noms_cache[nom.id] = nom;
                if (active_nom_cats_map[nom_cat_underscore]){
                    active_nom_cats_map[nom_cat_underscore].push(nom.id);
                }
                else{
                    active_nom_cats_map[nom_cat_underscore] = [nom.id];
                }
            }
            if (friends[nom.nominatee]){
                name = friends[nom.nominatee].name;
            }
            else if (nom.nominatee == me.id){
                name = 'You';
            }
            else{
                name = '';
            }
            user_thumbnail = '<img src="https://graph.facebook.com/' + nom.nominatee + '/picture?type=square"/>';
            photo_thumbnail = '<img src="' + nom.photo.src + '"/>';
            
            comment_html = '';
            more_comment_html = '';
            if (nom.quick_comments.length > 0){
                for (var j = 0; j < nom.quick_comments.length; j++){
                    commentor_name
                    if (friends[nom.quick_comments[j].owner_id]){
                        commentor_name = friends[nom.quick_comments[j].owner_id].name;
                    }
                    else if (nom.quick_comments[j].owner_id == me.id){
                        commentor_name = 'You';
                    }
                    else{
                        commentor_name = '';
                    }
                    time = new Date(nom.quick_comments[j].create_datetime * 1000);
                    time_diff = now - time;
                    time_diff /= 1000;
                    comment_html += '<div class="comment">' +
                                        '<p class="comment_time" value="' + nom.quick_comments[j].create_datetime + '">' + secondsToHms(time_diff) + '</p>' + 
                                        '<a href="#/user=' + nom.quick_comments[j].owner_id + '">' +
                                            '<img class="user_photo" src="https://graph.facebook.com/' + nom.quick_comments[j].owner_id + '/picture?type=square"/>' +
                                        '</a>' +
                                        '<a href="#/user=' + nom.quick_comments[j].owner_id + '" class="post_username from_username clear_profile">' +
                                            commentor_name +
                                        '</a>' +
                                        '<p>' + nom.quick_comments[j].comment + '</p>' +
                                    '</div>';
                }
                if (nom.more_comments){
                    more_comment_html = '<p class="load_more_comments" value="' + nom.id + '">Load more comments</p>';
                }
            }
            else{
                comment_html =  '<div class="comment_empty">' +
                                    '<h2>No comments yet. Be the first!</h2>' +
                                '</div>';
            }
            
            nominator_name = '';
            nominator_caption = '';
            if (nom.nominator == me.id){
                nominator_name = 'You';
            }
            else if (nom.nominator_name){
                nominator_name = nom.nominator_name;
            }
            else if (friends[nom.nominator]){
                nominator_name = friends[nom.nominator].name;
            }
            else{
                nominator_name = '';
            }
            
            if (nom.caption){
                nominator_caption = nom.caption;
            }
            
            time = new Date(nom.created_time * 1000);
            time_diff = now - time;
            time_diff /= 1000;
            
            recent_nom_html =   '<div class="recent_nom_cont" id="' + nom.id + '" time="' + nom.created_time + '">' +
                                    '<div class="recent_nom_top_cont nom_cat_' + nom_cat_underscore + '">' +
                                        '<a href="#/user=' + nom.nominatee + '">' + user_thumbnail + '</a>' +
                                        '<a href="#/user=' + nom.nominatee + '"><h2>' + name + '</h2></a>' +
                                        '<h3>Nominated for <a href="#/trophy=' + nom_cat_underscore + '"><span class="strong">' + nom_cat_text + '</span></a><span>' + secondsToHms(time_diff) + '</span></h3>' +
                                        '<div class="clear"></div>' +
                                    '</div>' +
                                    '<div class="recent_nom_photo_cont">' +
                                        '<div class="recent_nom_photo_left_cont">' +
                                            '<div class="recent_nom_photo_left_wrap">' +
                                                '<a href="#/nom_id=' + nom.id + '">' +
                                                    photo_thumbnail +
                                                    '<div id="nominator_overlay_cont">' +
                                                        '<a href="/#/user=' + nom.nominator + '"><img class="user_img" src="https://graph.facebook.com/' + nom.nominator + '/picture?type=square"/></a>' +
                                                        '<h2>Nominated by <span class="strong"><a href="/#/user=' + nom.nominator + '">' + nominator_name + '</a></span></h2>' +
                                                        '<p>' + nominator_caption + '</p>' +
                                                    '</div>' +
                                                '</a>' +
                                            '</div>' +
                                        '</div>' +
                                        '<div class="recent_nom_photo_right_cont">' +
                                            '<div class="recent_nom_vote_count nom_vote_' + nom.id + '">' +
                                                '<div class="trophy_img ' + trophy_size + ' ' + nom_cat_underscore + '"></div>' +
                                                '<a href="#/nom_id=' + nom.id + '/votes">' +
                                                    '<h2 class="nom_cat_' + nom_cat_underscore + '">Votes: <span class="strong">' + nom.vote_count + '</span></h2>' +
                                                '</a>' +
                                            '</div>' +
                                            '<div class="clear"></div>' +
                                        '</div>' +
                                        '<div class="clear"></div>' +
                                    '</div>' +
                                    '<div class="recent_nom_comment_cont" id="nom_comments_' + nom.id +'">' +
                                        '<div class="recent_nom_comment_heading" value="' + nom.id + '">' +
                                            '<a href="#/nom_id=' + nom.id + '/comments">' +
                                                '<h1>Comments</h1>' +
                                            '</a>' +
                                            '<span class="add_new_comment awesome large">New Comment</span>' +
                                            '<div class="clear"></div>' +
                                        '</div>' +
                                        comment_html +
                                        more_comment_html +
                                        '<div class="clear"></div>' +
                                    '</div>' +
                                '</div>';
            
            $('#recent_left_cont').append(recent_nom_html);
        }
        if (recent_noms.length >= 10){
            var load_more_html =    '<div id="load_more_noms_cont">' +
                                        '<span id="load_more" class="awesome large">Load More</span>' +
                                    '</div>';
                                    
            $('#recent_left_cont').append(load_more_html);
        }
    }
    
    // function render_users_friends(friends){
    //     $('#top_right_cont').append('<h1><span class="strong">Portrit</span> Friends</h1><div id="portrit_friends_cont"><p class="tooltip"></p></div>');
    //     var friend_html = '';
    //     if (friends.length > 0){
    //         for (var i = 0; i < friends.length; i++){
    //             friend_html =   '<a href="/#/user=' + friends[i].id + '" name="' + friends[i].name + '">' +
    //                                 '<img src="https://graph.facebook.com/' + friends[i].id + '/picture?type=square"/>' +
    //                             '</a>';
    //             $('#portrit_friends_cont').append(friend_html);
    //         }
    //     }
    //     else{
    //         $('#portrit_friends_cont').append('<h2>You have no Portrit friends :(</h2><p>Nominate some photos to make it a party.</p>');
    //     }
    // }
    
    function render_top_noms(top_noms){
        var nom = null,
            nom_cat_text = '',
            nom_cat_underscore = '',
            user_thumbnail = '',
            photo_thumbnail = '',
            vote_count = 0,
            name = '',
            top_nom_html = '',
            top = 5;
            
        $('#top_right_cont').append('<h1>The Daily <span class="strong">Leaderboard</h1>');
        if (top_noms.length < top){
            top = top_noms.length;
        }
        for (var i = 0; i < top_noms.length; i++){
            nom = top_noms[i];
            nom_cat_text = nom.nomination_category;
            nom_cat_underscore = nom.nomination_category.replace(' ', '_').toLowerCase();
            if (active_noms_cache[nom.id] == undefined){
                active_noms_cache[nom.id] = nom;
                if (active_nom_cats_map[nom_cat_underscore]){
                    active_nom_cats_map[nom_cat_underscore].push(nom.id);
                }
                else{
                    active_nom_cats_map[nom_cat_underscore] = [nom.id];
                }
            }
            if (i < top){
                if (friends[nom.nominatee]){
                    name = friends[nom.nominatee].name;
                }
                else if (nom.nominatee == me.id){
                    name = 'You';
                }
                else{
                    name = '';
                }
                user_thumbnail = '<img src="https://graph.facebook.com/' + nom.nominatee + '/picture?type=square"/>';
                photo_thumbnail = '<img src="' + nom.photo.src_small + '"/>';

                top_nom_html =  '<div class="top_nom_cont">' +
                                    '<a href="#/user=' + nom.nominatee + '"><h2>' + name + '</h2></a>' +
                                        '<div class="top_nom_wrap">' +
                                        '<div class="top_nom_left_cont nom_cat_' + nom_cat_underscore + '">' +
                                            '<a href="#/user=' + nom.nominatee + '" name="' + name + '">' +
                                                user_thumbnail +
                                            '</a>' +
                                            '<p class="vote_count">' + getGetOrdinal(i + 1) + '</p>' +
                                        '</div>' +
                                        '<div class="top_nom_right_cont">' +
                                            '<a href="#/nom_id=' + nom.id + '">' +
                                                photo_thumbnail +
                                            '</a>' +
                                        '</div>' +
                                        '<div class="clear"></div>' +
                                        '<div class="top_nom_bottom_cont">' +
                                            '<div class="top_nom_comment_cont nom_comment_' + nom.id + '">' +
                                                '<a href="#/nom_id=' + nom.id + '">' +
                                                    '<p>Comments: <span class="strong">' + nom.comment_count + '</span></p>' +
                                                '</a>' +
                                            '</div>' +
                                            '<div class="top_nom_vote_count nom_vote_' + nom.id + '">' +
                                                '<a href="#/nom_id=' + nom.id + '">' +
                                                    '<p>Votes: <span class="strong">' + nom.vote_count + '</span></p>' +
                                                '</a>' +
                                            '</div>' +
                                            '<div class="clear"></div>' +
                                        '</div>' +
                                    '</div>' +
                                '</div>';

                $('#top_right_cont').append(top_nom_html);
            }
        }
    }
    
    function render_top_users(top_users){
        var user_html = '';
        var top_html = '';
        var name = '';
        if (top_users.length > 0){
            top_html = '<h1>All Time <span class="strong">Leaderboard</span></h1><div id="top_friends">';
            for (var i = 0; i < top_users.length; i++){
                if (!friends[top_users[i].fid]){
                    name = 'You';
                }
                else{
                    name = friends[top_users[i].fid].name
                }
                user_html = '<div class="top_friend">' +
                                '<p class="nom_cat_' + top_users[i].top_nom_cat.replace(' ', '_').toLowerCase() + '">' + getGetOrdinal(i + 1) + '</p>' +
                                '<a href="/#/user=' + top_users[i].fid + '">' +
                                    '<h2>' + name + '</h2>' +
                                '</a>' +
                                '<a href="/#/user=' + top_users[i].fid + '">' +
                                    '<img src="https://graph.facebook.com/' + top_users[i].fid + '/picture?type=square"/>' +
                                '</a>' +
                            '</div>';
                top_html += user_html;
            }
            top_html += '</div>';
            $('#top_right_cont').append(top_html);
        }
    }
    
    function render_empty_nom_page(){
        var empty_html = '';
        
        function render_empty_recent(data){
            var top = 24;
            var count = 0;
            
            if (mobile && !tablet){
                top = 9;
            }
            
            for (var i = 0; i < data.length; i++){
                if (data[i].attachment.media){
                    for (var j = 0; j < data[i].attachment.media.length; j++){
                        if (friends[data[i].source_id]){
                            photo = data[i].attachment.media[j];
                            if (photo.photo){
                                photo_id = photo.photo.pid;
                                owner_id = data[i].actor_id;
                                if (friends[owner_id]){
                                    owner_name = friends[owner_id].name;
                                }
                                else{
                                    owner_name = '';
                                    for (var k = 0; k < data[i].tagged_ids.length; k++){
                                        if (friends[data[i].tagged_ids[k]]){
                                            owner_name = friends[data[i].tagged_ids[k]].name;
                                        }
                                    }
                                }

                                photo_html ='<div class="new_photo_cont" name="' + owner_name + '" value="' + photo_id + '">' +
                                                '<img src="' + photo.src + '"/>' +
                                            '</div>';
                                $('#latest_empty_wrap > .empty_cont').append(photo_html);
                                count += 1;
                                if (count == top){
                                    if (!mobile){
                                        $('#latest_empty_wrap > .empty_cont').append('<p class="tooltip"></p>');
                                    }
                                    return;
                                }
                            }
                        }
                    }
                }
            }
            if (count > 0){
                $('#latest_empty_wrap > .empty_cont').append('<p class="tooltip"></p>');
            }
            else{
                $('#latest_empty_wrap > .empty_cont').append('<h1>No Latest Photos.</h1>');
            }
        }
        
        //Empty Recent Winners
        append_load($('#recent_empty_wrap > .empty_cont'), 'light');
        get_user_feed(function(data){
            remove_load();
            var photo = null,
                nom_cat = '',
                nom_cat_underscore = '',
                name = '',
                winning_nom_html = '',
                top = 8;
            
            if (data.length > 0){
                $('#recent_empty_wrap > h3').after('<p>These photos just won.</p>');
                if (data.length < top){
                    top = data.length;
                }
                for (var i = 0; i < top; i++){
                    photo = data[i].photo;
                    nom_cat = data[i].nomination_category;
                    nom_cat_underscore = nom_cat.replace(' ', '_').toLowerCase();
                    if (friends[data[i].nominatee] !== undefined){
                        name = friends[data[i].nominatee].name;
                    }
                    else if(data[i].nominatee == me.id){
                        name = 'You';
                    }
                    else{
                        name = '';
                    }
                    winning_nom_html =  '<div class="winning_nom_cont">' +
                                            '<a href="/#/nom_id=' + data[i].id + '/won/">' +
                                                '<img src="' + photo.src + '"/>' +
                                            '</a>' +
                                            '<div class="winning_nom_overlay">' +
                                                '<a href="/#/user=' + data[i].nominatee + '">' +
                                                    '<p class="nom_cat_' + nom_cat_underscore + '_text">' + name + '</p>' +
                                                '</a>' +
                                                '<div class="trophy_img medium ' + nom_cat_underscore + '"></div>' +
                                            '</div>' +
                                        '</div>';
                    $('#recent_empty_wrap > .empty_cont').append(winning_nom_html);
                }
                $('#recent_empty_wrap > .empty_cont').append('<div class="clear"></div>');
            }
            else{
                $('#recent_empty_wrap > h3').after('<h1>No Recent Winners.</h1>');
                $('#recent_empty_wrap > h3').after('<p>These photos just won.</p>');
            }
        }, 'won');
        
        empty_html ='<div id="empty_noms_cont">' +
                        '<h1>There are no <span class="strong">Active Nominations</span></h1>' +
                        '<h2>Help us make this a happenin\' place and nominate your friends photos.</h2>' +
                        '<div id="search_empty_wrap">' +
                            '<div id="empty_search_cont">' +
                                '<ul>' +
                                    '<li>' +
                                        '<p>1. Find your friends.</p>' +
                                    '</li>' +
                                    '<li>' +
                                        '<p>2. Nominate their best photos.</p>' +
                                    '</li>' +
                                    '<li>' +
                                        '<p>3. Vote on your favorite.</p>' +
                                    '</li>' +
                                '</ul>' +
                                '<input id="empty_search" type="text" value="Find your Friends"/>' +
                                '<div id="clear_empty_search" class="close_img mobile" style="display:none;" onclick="void(0)"></div>' +
                            '</div>' +
                            '<div class="empty_cont">' +
                            '</div>' +
                        '</div>' +
                        '<div id="latest_empty_wrap">' +
                            '<h3>Latest Photos</h3>' +
                            '<p>The newest photos on Facebook.</p>' +
                            '<div class="empty_cont"></div>' +
                        '</div>' +
                        '<div id="recent_empty_wrap">' +
                            '<h3>Recent Winners</h3>' +
                            '<div class="empty_cont"></div>' +
                        '</div>' +
                    '</div>';
                    
        $('#scroller').append(empty_html);
        
        $('#latest_empty_wrap .empty_cont').append('<div id="loader_short"><img src="http://portrit.s3.amazonaws.com/img/ajax-loader-light.gif"/></div>');
        //Empty Recent Photos
        $.getJSON('https://api.facebook.com/method/stream.get?access_token=' + fb_session.access_token + '&limit=50&filter_key=' + photo_filter + '&format=json&callback=?', function(data){
            $('#loader_short').remove();
            render_empty_recent(data.posts);
        });
        
        //Unbind empty handlers
        $('#empty_search').unbind('focus, blur, keyup');
        if (!mobile){
            $('#clear_empty_search').unbind('click');
        }
        else{
            $('#clear_empty_search').unbind('touchend');
        }
        //Bind empty handlers
        $('#empty_search').bind('focus', function(){
            comment_form_shown = true;
            $(this).css('color', '#333');
            if (this.value == this.defaultValue){
                this.value = '';
            }  
            if(this.value != this.defaultValue){  
                this.select();  
            }
        });
        
        $('#empty_search').bind('blur', function(){
            comment_form_shown = false;
            $(this).css('color', '#888');
            if ($.trim(this.value) == ''){
                this.value = (this.defaultValue ? this.defaultValue : '');  
            }
        });
        
        if (!mobile){
            $('#clear_empty_search').bind('click', function(){
                $('#empty_search').val('').trigger('keyup').trigger('blur');
            });
        }
        else{
            $('#clear_empty_search').bind('touchend', function(){
                $('#empty_search').val('').trigger('keyup').trigger('blur');
                return false;
            });
        }
        
        var friend_names = [ ];
        for (var i = 0; i < friend_array.length; i++){
            if (friend_array[i].hidden === false){
                friend_names.push(friend_array[i].name);
            }
        }
        
        $('#empty_search').bind('keyup', function(){
            var q = $(this).val();
            var ret, arr, len, val, i;
            if (q == ''){
                $('#empty_search_cont').css({
                    'border-radius':  '10px',
                    '-moz-border-radius':     '10px',
                    '-webkit-box-shadow':     'none',
                    'box-shadow':     'none',
                    '-moz-box-shadow': 'none',
                    'padding': '15px'
                });
                $('#search_empty_wrap .empty_cont').css({
                    'padding': '0px'
                }).html('');
                $('#clear_empty_search').hide();
            }
            else{
                $('#clear_empty_search').show();
                len = friend_names.length;
                ret = [ ];
                q = q.toLowerCase();
                for(i=0; i< len; i++){
                    val = friend_names[i];
                    if(val.toLowerCase().indexOf(q) === 0){
                        ret.push(val);
                    }
                }

                $('#search_empty_wrap .empty_cont').html('');
                
                if (ret.length > 0){
                    $('#search_empty_wrap .empty_cont').css({
                        'padding': '10px 10px'
                    });
                    $('#empty_search_cont').css({
                        'border-bottom-left-radius':      '0px',
                        'border-bottom-right-radius':     '0px',
                        '-moz-border-radius-bottomleft':          '0px',
                        '-moz-border-radius-bottomright':        '0px',
                        '-webkit-box-shadow': 'rgba(0, 0, 0, 0.496094) 0px 9px 3px -4px',
                        '-moz-box-shadow': '0 9px 3px -4px rgba(0, 0, 0, 0.5)',
                        'box-shadow': 'rgba(0, 0, 0, 0.496094) 0px 9px 3px -4px',
                        'padding-bottom': '0px'
                    });
                    var friend = null,
                        image_html = '',
                        name_html = '',
                        friend_html = '';
                    for (var i = 0; i < ret.length; i++){
                        friend = friends[get_friend_id_by_name(ret[i])];

                        image_html = '<div class="crop"><img class="friend_pic" src="https://graph.facebook.com/' + friend.id + '/picture?type=large"/></div>';
                        name_html = '<div class="text_wrapper"><div class="text" onclick="void(0)"><h3>' + friend.name + '</h3></div></div>';
                        friend_html = '<div class="friend" name="' + friend.name + '" value="' + friend.id + '" onclick="void(0)"><div class="img_cont">' + image_html + name_html + '</div></div>';

                        $('#search_empty_wrap .empty_cont').append(friend_html);
                    }
                }
                else{
                    $('#empty_search_cont').css({
                        'border-bottom-left-radius':      '0px',
                        'border-bottom-right-radius':     '0px',
                        '-moz-border-radius-bottomleft':          '0px',
                        '-moz-border-radius-bottomright':        '0px',
                        '-webkit-box-shadow': 'rgba(0, 0, 0, 0.496094) 0px 9px 3px -4px',
                        '-moz-box-shadow': '0 9px 3px -4px rgba(0, 0, 0, 0.5)',
                        'box-shadow': 'rgba(0, 0, 0, 0.496094) 0px 9px 3px -4px',
                        'padding-bottom': '0px'
                    });
                    // $('#search_empty_wrap .empty_cont').css({
                    //     'padding': '0px'
                    // });
                    $('#search_empty_wrap .empty_cont').html('<h1>No friend\'s with first name starting in: ' + q + '</h1>');
                }
            }
        });
        
        $('.new_photo_cont').live('mouseover mouseout', function(event) {
            if (event.type == 'mouseover') {
                show_like_tooltip(this);
            } else {
                hide_like_tooltip(this);
            }
        });
        
        attach_main_handlers();
    }
    
    function hide_stream_fixtures(){
        if (tablet){
            $('#profile_wrap').css({
                'width': '960px',
                'right': '0px'
            });
        }
        $('#active_stream_view').hide();
        $('#active_stream_text_cont').hide();
        $('#tab_nav').hide();
    }
    
    function show_stream_fixtures(){
        if (tablet){
            $('#profile_wrap').css({
                'width': '940px',
                'right': '20px'
            });
        }
        $('#active_stream_view').show();
        $('#active_stream_text_cont').show();
        $('#tab_nav').show();
    }
    
    function init_recent_view(){
        var recent_view_html = '<div id="recent_cont_1">' +
                                    '<div id="recent_left_cont">' +
                                    '</div>' +
                                    '<div id="top_right_cont">' +
                                    '</div>' + 
                                '</div>' +
                                '<div class="clear"></div>';
        append_load($('#scroller'), 'light');
        $('#profile_cont').append(recent_view_html);
        $.getJSON('/init_recent_stream/', function(data){
            remove_load();
            stream_view = 'recent_noms';
            if (data.recent.length > 0){
                show_stream_fixtures();
                render_recent_stream(data.recent);
                if (!mobile || tablet){
                    render_countdown_clock();
                    render_top_noms(data.top);
                    render_top_users(data.top_users);
                }
                if (!mobile){
                    $('#profile_cont').show();
                }
                else{
                    $('#profile_cont').show();
                }
            }
            else{
                render_empty_nom_page();
                hide_stream_fixtures();
            }
        });
    }
    
    var todays_date = new Date().getDate();
    dateFuture = new Date(2011,0,todays_date,24,0,0);
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
    	if(amount < 0){
            var todays_date = new Date().getDate();
            dateFuture = new Date(2011,0,todays_date,24,0,0);
            tzOffset = -8;
            dx = dateFuture.toGMTString();
            dx = dx.substr(0,dx.length -3);
            tzCurrent=(dateFuture.getTimezoneOffset()/60)*-2;
            dateFuture.setTime(Date.parse(dx))
            dateFuture.setHours(dateFuture.getHours() + tzCurrent - tzOffset);
            
            $('#cont').prepend('<div id="winners_announced_cont"><h2>Winners are being calculated. Check back in a few minutes.</h2></div>')
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
        $('#top_right_cont').prepend('<h1>Time <span class="strong">Remaining</strong></h1><h2 id="time_countdown"></h2></h1>');
        GetCount();
    }
    
    function render_user_profile_trophies(){
        var id = getUrlVars().user;
        var data = user_winning_noms_cache[id];
        var winning_noms_cats = { };
        var nom_cat = '';
        var nom_cat_underscore = '';
        var trophy_cont_html = '';
        for (var i = 0; i < data.length; i++){
            if (winning_noms_cats[data[i].nom_cat] == undefined){
                winning_noms_cats[[data[i].nom_cat]] = 1;
            }else{
                winning_noms_cats[data[i]['nom_cat']] += 1;
            }
        }
        for (var trophy in winning_noms_cats){
            if (trophy != 'undefined'){
                nom_cat = trophy;
                nom_cat_underscore = nom_cat.replace(' ', '_').toLowerCase();
                trophy_cont_html =  '<div class="winning_trophy_cont">' +
                                        '<a href="/#/trophy/user=' + id + '/trophy=' + nom_cat_underscore + '">' +
                                            '<img src="http://portrit.s3.amazonaws.com/img/trophies/medium/' + nom_cat_underscore + '.png"/>' +
                                            '<div class="winning_trophy_count nom_cat_' + nom_cat_underscore + '">' + winning_noms_cats[trophy] + '</div>' +
                                        '</a>' +
                                    '</div>';
                $('#trophy_cont').append(trophy_cont_html);
            }
        }
    }
    
    var my_feed_next_page = '';
    var my_photo_feed_next_page = '';
    var feed_next_page = '';
    var photo_feed_next_page = '';
    var my_newest_post_time = null;
    var my_newest_photo_post_time = null;
    var their_newest_post_time = null;
    var their_newest_photo_post_time = null;
    var my_feed_first_page = null;
    function init_profile_view(){
        if($('#profile_cont').children().length === 0){
            // remove_load();
            // if (my_feed){
            //     if (my_feed.length == 0){
            //         hide_stream_fixtures();
            //         render_empty_nom_page();
            //     }
            //     else{
            //         show_stream_fixtures();
            //         render_feed(my_feed);
            //         if (!mobile){
            //             $('#profile_cont').show();
            //         }
            //         else{
            //             $('#profile_cont').show();
            //         }
            //     }
            // }
            // else{
                append_load($('#scroller'), 'light');
                $.getJSON('/get_top_feed/', function(data){
                    remove_load();
                    my_feed = data;
                    if (my_feed.length == 0){
                        hide_stream_fixtures();
                        render_empty_nom_page();
                    }
                    else{
                        show_stream_fixtures();
                        render_feed(my_feed);
                        if (!mobile){
                            $('#profile_cont').show();
                        }
                        else{
                            $('#profile_cont').show();
                        }
                    }
                });
            // }
        }
    }
    
    function init_info_view(){
        var id = getUrlVars().user;
        if (user_profile === null){
            //User feed
            FB.api('/' + id + '/', function(response){
                render_profile(response);
            });
        }
        else{
            if ($('#profile_info_img').length == 0){
                render_profile(user_profile);
            }
        }
    }
    
    function transition_to_info(){
        view_active = 'info';
        
        var cont_width = $('#friend_album_cont').width();
        
        $('#friend_album_cont').queue( [ ] ).stop();
        $('#info_wrap').show();

        var element = $('#info_wrap').height() + 50;
        if (element < 400){
            element = 600;
        }
        $('#friend_album_cont').css({'min-height': element, 'height': ''});
        
        cont_width = ($('#info_wrap').outerWidth() + 30);
        
        if (!mobile){
            $('#album_cont').fadeTo(0.45, 0.5);
            $('#friend_album_cont').animate({
                'left': cont_width
            }, 450, 'easeOutCubic');
			$('#album_cont').live('click', function(){
				$('#user_photo_view').click();
			});
        }
        else if (tablet){
            $('#album_cont').css({
                'opacity': '0.5'
            });
            $('#friend_album_cont').css({
                'left': cont_width
            });
        }
        else{
            $('#album_cont').css({
                'opacity': '0.5'
            });
            $('#friend_album_cont').css({
                'left': cont_width
            });
        }
        
        
        click_hold_timer = null;
        mouse_up = false;
        
        if (typeof(_gaq) !== "undefined"){
            _gaq.push(['_trackEvent', 'Info', 'Shown', '']);
        }
    }
    
    function transition_to_profile(){
        view_active = 'profile';
        
        var cont_width = $('#friend_album_cont').width();
        
        $('#friend_album_cont').queue( [ ] ).stop();
        $('#profile_wrap').show();

        cont_width = -($('#profile_wrap').outerWidth() + 35);
        
        if (!mobile){
            $('#album_cont').fadeTo(.45, 0.5);
            $('#friend_album_cont').animate({
                'left': cont_width
            }, 450, 'easeOutCubic');

			$('#album_cont').live('click', function(){
				$('#user_photo_view').click();
			});
        }
        else if (tablet){
            $('#album_cont').css({
                'opacity': '0.5'
            });
            $('#friend_album_cont').css({
                'left': cont_width
            });
        }
        else{
            $('#friend_album_cont').css({
                'left': cont_width
            });
        }

		var feed_height = $('#profile_wrap').outerHeight() + $('#header').height() + $('#main_view_control').outerHeight();
		$('#friend_album_cont').css({'min-height': feed_height});
        
        click_hold_timer = null;
        mouse_up = false;


        
        if (typeof(_gaq) !== "undefined"){
            _gaq.push(['_trackEvent', 'Profile', 'Shown', '']);
        }
    }
    
    function transition_to_album(){
        view_active = 'album';
        
        clearInterval(update_feed_interval);
        var cont_height = $('#friend_album_cont').height();
        var cont_width = $('#friend_album_cont').width();

        $('#album_cont').show();
        
        var element = $('#album_cont').height() + 50;
        if (element < 400){
            element = 600;
        }
        $('#friend_album_cont').css({'height': element, 'min-height': ''});
        
        if (!mobile){
            $('#album_cont').fadeTo('fast', 1.0);
            
            $('#friend_album_cont').animate({
                'left': '0px'
            }, 450, 'easeOutCubic', function(){
                $('#profile_wrap').hide();
                $('#info_wrap').hide();
                user_feed = null;
                $('#profile_cont').html('');
            });
			$('#album_cont').die('click');
        }
        else if (tablet){
            $('#album_cont').css({
                'opacity': '1.0'
            });
            
            $('#friend_album_cont').css({
                'left': '0px'
            });
            
            $('#profile_wrap').hide();
            $('#info_wrap').hide();
            user_feed = null;
            $('#profile_cont').html('');
        }
        else{
            $('#profile_wrap').hide();
            $('#info_wrap').hide();
            $('#friend_album_cont').show();
            $('#friend_album_cont').css({
                'left': '0px'
            });
            $('#album_cont').css({
                'opacity': '1.0'
            });
            user_feed = null;
            $('#profile_cont').html('');
        }
    }
    
    //Photo List View
    function photo_list_view(hidden){
        view_active = 'list';
        photo_comment_cache = { };
        $('.photo_album').queue( [ ] ).stop();
        $('#friend_cont').hide();
        $('#friend_album_cont').css({'min-height': '', 'height': ''});
        $('#title').css({'position': ''});
        $('#photo_large').css({
            'min-height': ''
        });
        if (!mobile){
            $('#title').fadeIn();
            $('#photo_cont').fadeIn(350, function(){
                $(this).show();
            });
        }
        else{
            $('#title').show();
            $('#photo_cont').show();
            $('#photo_cont').css({
                'max-width': ''
            });
        }
        
        if ($('#photo_cont').children().length == 0 || $('#photo_list').length == 0){
            if (!mobile){
                high_photo_offset = 100;
            }
            $('#photo_cont').html('');
            $('#photo_cont').append('<div id="left_quick_nav"><a></a></div><div id="right_quick_nav"><a id="top_quick_nav"><a id="bottom_quick_nav"></a></a></div><div id="photo_scroller"><div id="photo_list"></div></div><div id="photo_cache" style="display:none;"></div><div id="photo_large"></div>');
        }
        else{
            $('#photo_large').html('');
        }
        
        if ($('.photo_album:hidden').length > 0){
            if (!mobile){
                $('.photo_album').fadeOut(function(){
                    init_list_view(hidden);
                });
            }
            else{
                $('.photo_album').show();
            }
        }
        else{
            if (albums == null){
                get_user_albums(getUrlVars().user, 5, init_list_view, hidden);
            }
            else{
                if ((high_photo_offset == 0 || high_photo_offset == 100) && $('#photo_list').children().length == 0){
                    init_list_view(hidden);
                }
                else{
                    $('.photo_thumbs').show().css({
                        'opacity': '1.0',
                        'display': 'inline-block',
                        'position': 'relative',
                        'top': '0px',
                        'left': '0px'
                    });
                    $('#title').html('<h3>' + selected_album.album.name + '</h3>').show();
                    if ($('#photo_list').children().length == 0){
                        init_list_view(hidden);
                    }
                    get_user_noms();
                }
            }
        }
        $('#friend_album_cont').html('');
        
        if (typeof(_gaq) !== "undefined"){
            _gaq.push(['_trackEvent', 'Photo_List', 'Shown', '']);
        }
    }
    
    var high_photo_offset = 100;
    var album_completed = false;
    function init_list_view(hidden){
        var photos = null;
        var once = false;
        var smaller = 0;
        var larger = 0;
        var photo_width = 0;
        var photo_height = 0;
        var reponse_length = 0;
        var high_photo_interval = 80;
        var top = high_photo_offset;
        var thumb_hide_style = ''
        photo_load_once = false;
        
        if (hidden){
            thumb_hide_style = 'style="display:none;"'
        }
        
        for (var x = 0; x < albums.length; x++){
            if (albums[x].album.id === selected_album_id && once === false){
                photos = albums[x].photos;
                selected_album = albums[x];
                
                var paused = true;
                var photo_count = 0;
                var album_count = selected_album.album.count;
                
                $('#title').html('<h3>' + selected_album.album.name + '</h3>').show();
                
                if ($('#photo_list .photo_thumbs').length == 0){
                    if (top > photos.length){
                        top = photos.length
                    }
                    for (var i = 0; i < top; i++){
                        if (photos[i]){
                            if (photos[i].width > photos[i].height){
                                photo_width = 130;
                                photo_height = 130 * (photos[i].height / photos[i].width);
                            }
                            else{
                                photo_width = 130 * (photos[i].width / photos[i].height);
                                photo_height = 130;
                            }

                            $('#photo_list').append('<div class="photo_thumbs" ' + thumb_hide_style + ' onclick="void(0)"><img style="width: ' + photo_width + 'px; height: ' + photo_height + 'px;" id="' + photos[i].id + '" src="' + photos[i].picture + '"/></div>');
                            photo_count++;   
                        }
                    }
                }
                else{
                    top = $('#photo_list').children().length;
                }
                
                if (photo_count < album_count || selected_album.album.id == 'tagged'){
                    var offset = photos.length;
                    var interval = 40;
                    var recurrsion_completed = false;
                    var load_pictures_once = false;
                    var album_id = '';
                    if (selected_album.album.id == 'tagged'){
                        album_id = selected_user
                    }
                    else{
                        album_id = selected_album.album.id 
                    }
                    function load_more_pictures(album_index){
                        if (recurrsion_completed === false){
                            FB.api('/' + album_id + '/photos?fields=id,picture,source,height,width&limit=' + interval+ '&offset=' + offset, function(response){
                                remove_load();
                                albums[album_index].photos = albums[album_index].photos.concat(response.data);
                                offset += interval;
                                if (offset >= high_photo_offset && !hidden){
                                    reponse_length = 0;
                                    load_pictures_once = false;
                                }
                                else{
                                    reponse_length = response.data.length;
                                }
                                if (reponse_length > 0){
                                    load_more_pictures(album_index);
                                    load_pictures_once = true;
                                    for (var i = 0; i < response.data.length; i++){
                                        if (view_active === 'gallery'){
                                            $('#photo_list').append('<div class="photo_thumbs" style="display:none;" onclick="void(0)"><img id="' + response.data[i].id + '" src="' + response.data[i].picture + '"/></div>');
                                        }
                                        else{
                                            if (response.data[i].width > response.data[i].height){
                                                photo_width = 130;
                                                photo_height = 130 * (response.data[i].height / response.data[i].width);
                                            }
                                            else{
                                                photo_width = 130 * (response.data[i].width / response.data[i].height);
                                                photo_height = 130;
                                            }
                                            $('#photo_list').append('<div class="photo_thumbs" ' + thumb_hide_style + ' onclick="void(0)"><img style="width: ' + photo_width + 'px; height: ' + photo_height + 'px;" id="' + response.data[i].id + '" src="' + response.data[i].picture + '"/></div>');
                                        }
                                        photo_count++;
                                    }
                                }
                                else{
                                    if (load_pictures_once === false){
                                        for (var i = 0; i < response.data.length; i++){
                                            if (view_active === 'gallery'){
                                                $('#photo_list').append('<div class="photo_thumbs" style="display:none;" onclick="void(0)"><img id="' + response.data[i].id + '" src="' + response.data[i].picture + '"/></div>');
                                            }
                                            else{
                                                if (response.data[i].width > response.data[i].height){
                                                    photo_width = 130;
                                                    photo_height = 130 * (response.data[i].height / response.data[i].width);
                                                }
                                                else{
                                                    photo_width = 130 * (response.data[i].width / response.data[i].height);
                                                    photo_height = 130;
                                                }
                                                $('#photo_list').append('<div class="photo_thumbs" ' + thumb_hide_style + ' onclick="void(0)"><img style="width: ' + photo_width + 'px; height: ' + photo_height + 'px;" id="' + response.data[i].id + '" src="' + response.data[i].picture + '"/></div>');
                                            }
                                            photo_count++;
                                        }
                                    }
                                    if (window.sessionStorage !== undefined){
                                        sessionStorage.setItem('albums_' + selected_user, JSON.stringify(albums));
                                    }
                                    recurrsion_completed = true;
                                    if (offset >= high_photo_offset){
                                        reponse_length = 0;
                                        high_photo_offset = offset;
                                        high_photo_offset += high_photo_interval;
                                        photo_load_once = true;
                                        $('.photos_loading').remove();
                                    }
                                }
                                if (response.data.length == 0){
                                    $('.photos_loading').remove();
                                    album_completed = true;
                                }
                            });   
                        }
                    }
                    if (top >= 100){
                        high_photo_offset = top;
                    }
                    top += high_photo_interval;
                    if (high_photo_offset < photos.length){
                        if (top > photos.length){
                            top = photos.length;
                        }
                        for (var i=high_photo_offset; i < top; i++){
                            if (photos[i].width > photos[i].height){
                                photo_width = 130;
                                photo_height = 130 * (photos[i].height / photos[i].width);
                            }
                            else{
                                photo_width = 130 * (photos[i].width / photos[i].height);
                                photo_height = 130;
                            }

                            $('#photo_list').append('<div class="photo_thumbs" ' + thumb_hide_style + ' onclick="void(0)"><img style="width: ' + photo_width + 'px; height: ' + photo_height + 'px;" id="' + photos[i].id + '" src="' + photos[i].picture + '"/></div>');
                            photo_count++;
                        }
                        photo_load_once = true;
                        if (top == albums[x].album.count){
                            album_completed = true;
                            remove_load();
                        }
                    }
                    else{
                        append_load($('#photo_list'), 'dark');
                        load_more_pictures(x);
                    }
                }
                else{
                    album_completed = true;
                    remove_load();
                }
                once = true;
            }
        }
        if (selected_album_id === 'video_album'){
            $('#title').html('<h3>Videos</h3>');
            
            for (var i=0; i < user_videos.length; i++){
                $('#photo_list').append('<div class="photo_thumbs" onclick="void(0)"><img id="' + user_videos[i].id + '" src="' + user_videos[i].picture + '"/></div>');
            }
        }
        if (winning_user_album_cache[selected_album_id]){
            render_list_view_trophies(winning_user_album_cache[selected_album_id]);
        }
    }
    
    function get_photo_comments(photo_id, fb_access_token){
        if (photo_comment_cache[photo_id] !== undefined){
            render_photo_comments(photo_comment_cache[photo_id], photo_id);
        }
        else{
            FB.api('/' + photo_id + '/comments', function(response){
                photo_comment_cache[photo_id] = response.data;
                render_photo_comments(response.data, photo_id);
            });
            // $.getJSON('https://api.facebook.com/method/comments.get?format=JSON&object_id=' + photo_id + '&access_token=' + fb_access_token + '&callback=?', function(response){
            //     photo_comment_cache[photo_id] = response;
            //     render_photo_comments(response, photo_id);
            // });   
        }
    }
    
    function render_photo_comments(comments, id){
        var comments_html = '';
        var to_name = '';
        var user_name = '';
        if (id == selected_photo){
            if (comments && comments.length > 0){
                $('#photo_comments').append('<h2>Facebook Comments</h2>');
                for (var j = 0; j < comments.length; j++){
                    if (comments[j].from != undefined){
                        user_name = comments[j].from.name;
                        if (user_name == me.name){
                            user_name = 'you';
                        }
                        // if (friends[comments[j].from.id]){
                            to_name = '<a href="#/user=' + comments[j].from.id + '" class="post_username from_username clear_profile">' + user_name + '</a>';
                        // }
                        // else{
                            // to_name = '<a class="post_username from_username clear_profile">' + user_name + '</a>';
                        // }
                    }
                    // if (friends[comments[j].from.id] !== undefined){
                        comments_html += '<div class="photo_comment comment">'+
                                            '<a href="#/user=' + comments[j].from.id + '">' +
                                                '<img class="user_photo" src="http://graph.facebook.com/' + comments[j].from.id + '/picture?type=square"/>' +
                                            '</a>' + 
                                            to_name +
                                            '<p>' + comments[j].message + '</p>' +
                                         '</div>';
                    // }
                    // else{
                    //     comments_html += '<div class="photo_comment comment">' +
                    //                         '<img class="user_photo" src="http://graph.facebook.com/' + comments[j].from.id + '/picture?type=square"/>' +
                    //                         to_name +
                    //                         '<p>' + comments[j].message + '</p>' +
                    //                      '</div>';
                    // }
                }
                $('#photo_comments').append(comments_html);
                $('#photo_comments').show();
            }
        }
    }
    
    //Photo thumb click    
    function photo_click_handler(){
        selected_user = getUrlVars().user;
        selected_photo = $('img', this).attr('id');
        if (view_active === 'gallery'){
            if (getUrlVars().album !== 'video_album'){
                photo_gallery_view();
            }
            else{
                video_gallery_view();
            }
        }
        else{
            update_urls();
        }
    }
    
    //Photo Gallery View
    var first_gallery = true;
    function photo_gallery_view(){
        view_active = 'gallery';
        var photo_id = selected_photo;
        var photo = null;
        var before = 0;
        var after = 0;

        photo_large_view = true;
        
        $('#photo_comments').hide();
        $('.like').remove();
        $('#photo_comments').html('');

        var current_photo_id = null;
        var left_start = 0;
        var photo_click_count = 0;
        var window_width = $('#photo_cont').width();
        var photo_list_pos = $('#photo_list').position();
        var mid_screen = window_width / 2;
        var img_widths = [ ];
        var slide_images = null;
        var slide_center = 0;
        var slide_img_width = 0;
        var previous_x = 0;
        var margin_offset = 0;
        var center_found = false;
        var range = 3;
        var comments = null;
        var photo_width = 0;
        var photo_height = 0;
        
        for (var i = 0; i < selected_album.photos.length; i++){
            if (selected_album.photos[i] != undefined && selected_album.photos[i].id === photo_id){
                if (prev_photo_id === null){
                    prev_photo_id = $('#' + photo_id).parent().index();
                }
                else{
                    current_photo_id = $('#' + photo_id).parent().index();
                    if (prev_photo_id < current_photo_id){
                        left_start = window_width + 200;
                    }
                    else if (prev_photo_id > current_photo_id){
                        left_start = -200;
                    }
                    prev_photo_id = current_photo_id;
                }
                
                if (prev_photo_id - range >= 0){
                    before = prev_photo_id - range;
                }
                else{
                    before = 0;
                }
                if (prev_photo_id + range <= selected_album.photos.length){
                    after = prev_photo_id + range;
                }
                else{
                    after = selected_album.photos.length;
                }
                
                if (!mobile){
                    $('.photo_thumbs').queue( [ ] ).stop();
                }

                
                $('.photo_thumbs[name="selected"]').css({'opacity': '0.6'}).attr('name', '');
                // if (!mobile || tablet){
                    $('.photo_thumbs').filter(':hidden').css({
                        'position': 'absolute',
                        'left': left_start,
                        'top': '0px'
                    });
                    slide_images = $('.photo_thumbs').slice(before, after+1);
                    $(slide_images).show();
                    $('.photo_thumbs:lt(' + before + ')').hide();
                    $('.photo_thumbs:gt(' + after + ')').hide();
                // }
                // else{
                //     slide_images = $('.photo_thumbs')
                // }
                $('#' + selected_photo).parent().css({'opacity': '1.0'}).attr('name', 'selected');
                
                img_widths = [ ];
                slide_center = 0;
                slide_img_width = 0;
                center_found = false;
                // if (!mobile || tablet || first_gallery){
                    $(slide_images).each(function(j, selected){
                        slide_img_width = $(this).width();
                        if ($(this).attr('name') === 'selected'){
                            slide_center += (slide_img_width / 2);
                            center_found = true;
                        }
                        else if (center_found === false){
                            slide_center += slide_img_width + 10;
                        }

                        img_widths.push(slide_img_width + 10);
                    });

                    previous_x = 0;
                    margin_offset = mid_screen - slide_center - 20;
                    
                    $(slide_images).each(function(i, selected){
                        // if (!mobile){
                        //     $(this).animate({
                        //         'left': previous_x + margin_offset,
                        //         'top': 0
                        //     },300);
                        // }
                        // else {
                            $(this).css({
                                'left': previous_x + margin_offset,
                                'top': 0
                            });
                        // }
                        // else{
                        //     $(this).css({
                        //         'left': previous_x,
                        //         'top': 0
                        //     });
                        // }
                        previous_x += img_widths[i];
                    });
                // }
                // first_gallery = false;
                
                photo = selected_album.photos[i];
                
                $('#photo_cache').html('');
                if (load_next_clicked){
                    before = i + 1;
                    if (after + 1 < selected_album.photos.length){
                        after += 1;
                    }
                }
                else if (load_prev_clicked){
                    after = i;
                }
                for (var j = before; j < after; j++){
                    if (selected_album.photos[j]){
                        $('#photo_cache').append('<img src="' + selected_album.photos[j].source + '"/>');
                    }
                }
                
                if ($('#photo_large_inline').length > 0){
                    $('#submit_photo_comment').attr('name', photo.id);
                    if (!mobile){
                        // $('#photo_large_inline_cont > img').fadeOut(150, function(){
                            $('#photo_large_inline_cont').css({'height': photo.height, 'width': photo.width});
                            $('#photo_large_inline').remove();
                            $('#photo_large_inline_cont').prepend('<img id="photo_large_inline" src="' + photo.source + '"/>');
                            // $('#photo_large_inline_cont > img').attr('src', photo.source);
                            // $('#photo_large_inline_cont').html('<img id="photo_large_inline" src="' + photo.source + '"/>');
                            // $(this).fadeIn(150);
                        // });
                    }
                    else if (!tablet){
                        var photo_width = 0;
                        var photo_height = 0;
                        if (photo.width > photo.height){
                            photo_width = 500;
                            photo_height = 500 * (photo.height / photo.width);
                        }
                        else{
                            photo_width = 500 * (photo.width / photo.height);
                            photo_height = 500;
                        }
                        $('#photo_large_inline_cont').css({'height': photo_height, 'width': photo_width});
                        //$('#photo_large_inline_cont').html('<img id="photo_large_inline" src="' + photo.source + '"/>');
                        //$('#photo_large_inline_cont > img').attr('src', photo.source);
                        //$('#photo_large_inline_cont > img').css({'height': '', 'width': ''});
                        $('#photo_large_inline').remove();
                        $('#photo_large_inline_cont').prepend('<img id="photo_large_inline" src="' + photo.source + '" style="height:' + photo_height + 'px; width:' + photo_width + 'px;"/>');
                    }
                    else{
                        $('#photo_large_inline_cont').css({'height': photo.height, 'width': photo.width});
                        // $('#photo_large_inline_cont > img').attr('src', photo.source);
                        $('#photo_large_inline').remove();
                        $('#photo_large_inline_cont').prepend('<img id="photo_large_inline" src="' + photo.source + '"/>');
                    }
                    
                    if (photo.name !== undefined){
                        if ($('#photo_title').length <= 0){
                            $('#photo_large_inline_cont').after('<p id="photo_title">' + photo.name + '</p>');
                        }
                        else{
                            $('#photo_title').text(photo.name);   
                        }
                    }
                    else{
                        $('#photo_title').text('');
                    }
                }
                else{
                    if ($('#back_gallery').length <= 0){
                        $('#photo_large').html('<div id="back_gallery" onclick="void(0)"><div id="back_gallery_img"></div></div>' +
                                                '<div id="photo_large_inline_cont">' +
                                                    '<img style="display: none;" id="photo_large_inline" src="' + photo.source + '"/>' +
                                                    '<span id="nominate_photo" class="awesome_abs magenta large">Nominate</span> ' +
                                                    '<div id="like_cont"></div>' +
                                                '</div>' +
                                                '<div id="forward_gallery" onclick="void(0)"><div id="forward_gallery_img"></div></div>' +
                                                '<div id="photo_comments" style="display:none;"></div>');
                    }
                    else{
                        $('#photo_large_inline').attr('src', photo.source);
                    }
                    if (!mobile || tablet){
                        $('#photo_large_inline_cont').css({'height': photo.height, 'width': photo.width});
                    }
                    else{
                        if (photo.width > photo.height){
                            photo_width = 500;
                            photo_height = 500 * (photo.height / photo.width);
                        }
                        else{
                            photo_width = 500 * (photo.width / photo.height);
                            photo_height = 500;
                        }
                        $('#photo_large_inline_cont').css({'height': photo_height, 'width': photo_width});
                        $('#photo_large_inline').css({'height': photo_height, 'width': photo_width});
                        //$('#photo_large_inline > img').prepend('<img id="photo_large_inline" src="' + photo.source + '" style="height:' + photo_height + 'px; width:' + photo_width + 'px;"/>');
                        
                    }
                    $('#photo_large_inline').fadeIn('fast');
                    if (photo.name !== undefined){
                        if ($('#photo_title').length <= 0){
                            $('#photo_large_inline_cont').after('<p id="photo_title">' + photo.name + '</p>');
                        }
                        else{
                            $('#photo_title').text(photo.name);   
                        }
                    }
                    else{
                        $('#photo_title').text('');
                    }
                }
            }
        }
        if (!mobile || tablet){
            photo_width = photo.width;
        }
        
        $('.trophy_cont_gallery').remove();
        if (winning_user_photo_dict[selected_photo]){
            var cat_underscore = winning_user_photo_dict[selected_photo].cat.replace(' ', '_').toLowerCase();
            // $('#nominate_photo').hide();
            $('#nominate_photo, #go_nom_detail').attr('id', 'go_nom_detail').attr('value', winning_user_photo_dict[selected_photo].nom_id).text('Details');
            $('#photo_large_inline_cont').append('<div class="trophy_cont_gallery trophy_img large ' + cat_underscore + '"></div>');
        }
        else if(active_user_nom_cache[selected_photo]){
            $('#nominate_photo, #go_nom_detail').attr('id', 'go_nom_detail').attr('value', active_user_nom_cache[selected_photo].nom_id).text('Active');
        }
        else{
            if ($('#go_nom_detail').length > 0){
                $('#go_nom_detail').attr('id', 'nominate_photo').text('Nominate');
            }
        }
        $('#nominate_photo, #go_nom_detail').show().css({
            'left': (photo_width / 2) - ($('#nominate_photo, #go_nom_detail').width() / 2)
        });
        
        // if (mobile && !tablet){
        //     var img_x = $('#' + selected_photo).parent().position().left;
        //     var img_width = $('#' + selected_photo).parent().width() / 2;
        //     var screen_center = ($('#photo_cont').width() / 2) - img_width;
        //     img_x = -img_x;
        //     img_x += screen_center;
        //     gallery_scroll.scrollTo(img_x, 0, '150ms');
        // }
        
        click_hold_timer = null;
        mouse_up = false;
                
        //Get photo comments
        get_photo_comments(selected_photo, fb_session.access_token);
        // get_likes(selected_photo, render_photo_likes);
    }
    
    function video_gallery_view(){
        view_active = 'gallery';
        var photo_id = selected_photo;
        var video = null;
        var before = 0;
        var after = 0;

        photo_large_view = true;
        
        $('#title').hide();
        
        if ($('#photo_list').children().length === 0){
            $('#friend_cont').hide();
            photo_list_view();
            view_active = 'gallery';
        }
        
        if (selected_photo === ''){
            selected_photo = $('.photo_thumbs:first > img').attr('id');
            photo_id = selected_photo;
        }

        var current_photo_id = null;
        var left_start = 0;
        var photo_click_count = 0;
        var window_width = $(document).width();
        var photo_list_pos = $('#photo_list').position();
        var mid_screen = window_width / 2;
        var img_widths = [ ];
        var slide_images = null;
        var slide_center = 0;
        var slide_img_width = 0;
        var previous_x = 0;
        var margin_offset = 0;
        var center_found = false;
        var range = 3;
        
        for (var i = 0; i < user_videos.length; i++){
            if (user_videos[i].id === photo_id){
                if (i - range >= 0){
                    before = i - range;
                }
                else{
                    before = 0;
                }
                if (i + range <= user_videos.length){
                    after = i + range;
                }
                else{
                    after = user_videos.length;
                }

                $('.photo_thumbs').queue( [ ] ).stop();
                if (prev_photo_id === null){
                    prev_photo_id = $('#' + photo_id).parent().index();
                }
                else{
                    current_photo_id = $('#' + photo_id).parent().index();
                    if (prev_photo_id < current_photo_id){
                        left_start = window_width + 200;
                    }
                    else if (prev_photo_id > current_photo_id){
                        left_start = -200;
                    }
                    prev_photo_id = current_photo_id;
                } 
                
                $('.photo_thumbs[name="selected"]').css({'opacity': '0.6'}).attr('name', '');
                $('.photo_thumbs').filter(':hidden').css({
                    'left': left_start,
                    'top': '0px'
                });
                slide_images = $('.photo_thumbs').slice(before, after+1);
                $(slide_images).show();
                $('.photo_thumbs:lt(' + before + ')').hide();
                $('.photo_thumbs:gt(' + after + ')').hide();
                $('#' + selected_photo).parent().css({'opacity': '1.0'}).attr('name', 'selected');
                
                img_widths = [ ];
                slide_center = 0;
                slide_img_width = 0;
                center_found = false;
                $(slide_images).each(function(j, selected){
                    slide_img_width = $(this).width();
                    if ($(this).attr('name') === 'selected'){
                        slide_center += (slide_img_width / 2);
                        center_found = true;
                    }
                    else if (center_found === false){
                        slide_center += slide_img_width + 10;
                    }

                    img_widths.push(slide_img_width + 10);
                });

                previous_x = 0;
                margin_offset = mid_screen - slide_center - 40;
                
                $(slide_images).each(function(i, selected){
                    if (!mobile){
                        $(this).animate({
                            'left': previous_x + margin_offset,
                            'top': 0
                        },300);
                    }
                    else{
                        $(this).css({
                            'left': previous_x,
                            'top': 0
                        });
                    }
                    previous_x += img_widths[i];
                });

                video = user_videos[i];
                $('#photo_large').css({'min-height': 350, 'z-index': 10000});
                if ($('#video_large_inline').length > 0){
                    $('#video_large_inline').fadeOut('fast', function(){
                        $('#photo_large').html('<div id="back_gallery" onclick="void(0)"><div id="back_gallery_img"></div></div><div id="video_large_inline" style="display:none;">' + video.embed_html + '</div><div id="forward_gallery" onclick="void(0)"><div id="forward_gallery_img"></div></div>');
                        if (mobile === false){
                            $('#video_large_inline').fadeIn('fast');
                        }
                        else{
                            $('#video_large_inline').show();
                        }
                        
                    });
                }
                else{
                    $('#photo_large').html('<div id="back_gallery" onclick="void(0)"><div id="back_gallery_img"></div></div><div id="video_large_inline" style="display:none;">' + video.embed_html + '</div><div id="forward_gallery" onclick="void(0)"><div id="forward_gallery_img"></div></div>');
                    if (mobile === false){
                        $('#video_large_inline').fadeIn('fast');
                    }
                    else{
                        $('#video_large_inline').show();
                    }
                }
            }
        }
        click_hold_timer = null;
        mouse_up = false;
    }
    
    var like_tooltip_timeout = null;
    var expand_timeout = null;
    function show_like_tooltip(that){
        // if (!mobile){
            clearTimeout(like_tooltip_timeout);
            var tooltip_that = this;
            $('.tooltip:visible').css({
                'top': '0px', 
                'opacity': '0'
            });

            var name = $(that).attr('name');
            if (name != ''){
                var height = $(that).outerHeight();
                var left = $(that).position().left + (($(that).outerWidth() - $('.tooltip').width()) / 2) - 4;
                var top = $(that).position().top - 30;
                $(that).parent().find('.tooltip').text(name).css({
                    'top': top,
                    'left': left, 
                    'width': '150px',
                    'opacity': '1.0',
                    'z-index': '100'
                });
            }
        // }
    }
    
    function hide_like_tooltip(that){
        // if (!mobile){
            $(that).parent().find('.tooltip').css({
                'opacity': '0',
                'z-index': '-1'
            });
        // }
    }
    
    function like_photo_handler(){
        var id = $(this).attr('id').replace('lid_', '');
        var parent = $(this).parent();
        $(this).remove();
        $(parent).append('<div class="like" name="Like"><img id="me_like_' + id + '" style="display:none;" class="user_liked" src="http://graph.facebook.com/' + me.id + '/picture?type=square"/></div>');
        $('#me_like_' + id).fadeIn();
        
        $.post('https://graph.facebook.com/' + id + '/likes', {'access_token': fb_session.access_token}, function(response){
            var test = response;
        });
        
        if (typeof(_gaq) !== "undefined"){
            _gaq.push(['_trackEvent', 'Like', 'Photo', 'Clicked']);
        }
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
            if (friends[comments[i].comments.owner_id] != undefined){
                name = friends[comments[i].comments.owner_id].name;
            }
            else if (comments[i].comments.owner_id == me.id){
                name = 'You';
            }
            else {
                name = '';
            }
            now = new Date();
            time = new Date(comments[i].comments.create_datetime * 1000);
            now -= time;
            now /= 1000;
            var time_str = secondsToHms(parseInt(now));

            comment_cont_html +='<div class="comment">' +
                                    '<p class="comment_time" value="' + comments[i].comments.create_datetime + '">' + time_str + '</p>' +
                                    '<a href="#/user=' + comments[i].comments.owner_id + '" class="clear_profile">' +
                                        '<img class="user_photo" src="https://graph.facebook.com/' + comments[i].comments.owner_id + '/picture?type=square"/>' +
                                    '</a>' +
                                    '<a href="#/user=' + comments[i].comments.owner_id + '" class="post_username from_username clear_profile">' + name +'</a>' +
                                    '<p>' + comments[i].comments.comment + '</p>' +
                                '</div>';
        }
        $(cont).find('.recent_nom_comment_heading').after(comment_cont_html);
    }
    
    function load_more_comments_handler(){
        var nom_id = $(this).attr('value');
        var that = this;
        
        $.getJSON('/get_nom_comments/', {'nom_id': nom_id}, function(data){
            if (active_noms_cache[nom_id]){
                active_noms_cache[nom_id].comments = data;
            }
            render_more_comments(data, $('#nom_comments_' + nom_id));
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
                                        '<a class="submit_comment awesome large" name="' + $(this).attr('value') + '">Post</a>' +
                                        '<a class="cancel_comment awesome large">Close</a>' +
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
    
    function submit_comment_handler(){
        var obj_id = $(this).attr('name');
        var comment_cont = $(this).parent().parent();
        var text = $(this).parent().next().val();
        if (view_active === 'gallery'){
            if (text != ''){
                //Add comment to cache
                $('#cancel_photo_comment').click();
                $('#photo_comment_body').val('');
                $('#photo_comments').show();
                if (is_array(photo_comment_cache[obj_id])){
                    photo_comment_cache[obj_id] = photo_comment_cache[obj_id].concat({'fromid': me.id, 'text': text});   
                }
                else{
                    photo_comment_cache[obj_id] = [{'fromid': me.id, 'text': text}];
                }

                var photo_comment_html = '<div class="photo_comment comment" style="display:none;">' +
                                            '<img class="user_photo" src="http://graph.facebook.com/' + me.id + '/picture?type=square"/>' +
                                            '<p>' + text + '</p>' +
                                        '</div>'
                $('#photo_comments').append(photo_comment_html);
                $('#photo_comments').children().filter('.photo_comment:last').fadeIn();
                
                $.post('https://api.facebook.com/method/comments.add?' + 'text=' + text + '&object_id=' + obj_id +  '&publish_to_stream=true&access_token=' + fb_session.access_token, {'text': text, 'object_id': obj_id, 'publish_to_stream': 'true', access_token: fb_session.access_token}, function(data){
                
                });
                comment_form_shown = false;
            }
        }
        else if (view_active === 'profile' || view_active == 'main'){
            if (text != ''){
                $(this).parent().parent().fadeOut('fast', function(){
                    $('#photo_comments').show();
                    var profile_feed_comment = '<div class="comment_self" style="display:none;">' +
                                                    '<div class="like" name="Like">' +
                                                        '<img style="display: none; " class="like_photo" src="http://portrit.s3.amazonaws.com/img/like.png">'+
                                                    '</div>' +
                                                    '<a href="#/user=me">' +
                                                        '<img class="user_photo" src="http://graph.facebook.com/' + me.id + '/picture?type=square">' +
                                                    '</a>' +
                                                    '<p>' + text + '</p>' +
                                                '</div>'
    				var comment_list_cont = $(comment_cont).parent().children().filter('.post_comments')
                    if (comment_list_cont.length === 0){
                        profile_feed_comment = '<div class="post_comments">' + profile_feed_comment + '</div>';
                        $(comment_cont).parent().append(profile_feed_comment);
                        $(comment_cont).parent().find('.comment_self').fadeIn();
                    }
                    else{
    					$(comment_list_cont).append(profile_feed_comment);
                        $(comment_list_cont).children().last().fadeIn();
                    }

                    var add_comment = $(comment_cont).prev().clone();
                    $(comment_cont).prev().remove();

                    $.post('https://graph.facebook.com/' + obj_id + '/comments', {'access_token': fb_session.access_token, 'message': text}, function(response){
                        var test = response;
                    });

                    $(comment_cont).parent().append(add_comment);
                    $(comment_cont).parent().children().filter('.add_comment_peek').fadeIn();
                    $(comment_cont).remove();
                    $(this).remove();
                    comment_form_shown = false;
                });
            }
        }

        
        return false;
        
        if (typeof(_gaq) !== "undefined"){
            _gaq.push(['_trackEvent', 'Comment', 'Submitted', '']);
        }
    }
    
    function album_peek(){
        peek_on = true;
        peek_ended = false;
        peeked_photos = [ ];
        if (album == undefined){
            var photos = $(touch_album).children();
        }
        else{
            var photos = $(album).children();   
        }
        var peek_range_left = [-55, 90, -0, 90];
        var peek_range_top = [-70, -70, 75, 75];
        $(photos).each(function(i, selected){
            var left = peek_range_left[i];
            var top = peek_range_top[i];

            var rot = null;
            var rot_string = "";
            var webkit_rot = $(this).css('-webkit-transform');
            var moz_rot = $(this).css('-moz-transform');
            
            if (webkit_rot !== null){
                rot = webkit_rot;
            }
            else if(moz_rot !== null){
                rot = moz_rot;
            }
            
            rot_string = 'translate(' + left + 'px, ' + top + 'px)';            
            
            $(this).css({
                '-moz-transform': rot_string,
                '-webkit-transform': rot_string,
                'z-index': start_z_index
            });
            
            start_z_index += 1;
            peeked_photos.push({'photo': this, 'rot': rot});
        });
        
        $(photos).parent().next().css('z-index', 100);
        
        if (typeof(_gaq) !== "undefined"){
            _gaq.push(['_trackEvent', 'Peek', 'Shown', '']);
        }
    }
    
    function reset_peek(){
        for (var i = 0; i < peeked_photos.length; i++){
            var photo = peeked_photos[i].photo;
            var rot_string = peeked_photos[i].rot;
            
            peek_on = false;
            peek_ended = true;
            
            //rot_string += 'translate(0px, 0px)';
            $(photo).css({
                '-moz-transform': rot_string,
                '-webkit-transform': rot_string
            });
        }
        $(photo).parent().next().css('z-index', 1001);
        peeked_photos = [ ];
    }
    
    function photo_swipe(){
        var difference_x = (last_x - first_x);
        var difference_y = (last_y - first_y);
        if (difference_x > 125 && Math.abs(difference_y) < 150){
            $('#back_gallery, #back_gallery_mobile').click();
        }
        if (difference_x < -125 && Math.abs(difference_y) < 150){
            $('#forward_gallery, #forward_gallery_mobile').click();
        }
    }
    
    function album_profile_swipe(){
        var difference_x = (last_x - first_x);
        var difference_y = (last_y - first_y);
        if (difference_x > 125 && Math.abs(difference_y) < 150){
            $('#profile_left').click();
        }
        if (difference_x < -125 && Math.abs(difference_y) < 150){
            $('#profile_right').click();
        }
    }
    
    function attach_upgrade_handlers(){
        $('.friend_ref_cont').live('click', function(){
            var id = $(this).attr('id');
            var fid = $(this).attr('value');
            var name = $(this).attr('name');
            
            $(this).remove();
            
            var ref_freiend_html =  '<div class="reffed_friend" id="' + id + '" value="' + fid + '" name="' + name + '">' +
                                        '<img src="https://graph.facebook.com/' + fid + '/picture?type=square">' +
                                        '<img class="kill_referral" src="http://portrit.s3.amazonaws.com/img/x_medium.png">' +
                                    '</div>';
            
            if ($('#refer_button').length === 0){
                $('#refferal_cont').append('<h3>Tell your friends how much you love Portrit!</h3><textarea id="refer_post" class="comment_body"></textarea><a id="refer_button" class="awesome">Refer 1 friend</a>');
                $('#reffered_friends').append('<div class="clear"></div>');
            }
            else{
                var refs_added = $('.reffed_friend').length + 1;
                $('#refer_button').text('Refer ' + refs_added + ' friends');
            }
            $('#reffered_friends > .clear').before(ref_freiend_html);
            
            if (typeof(_gaq) !== "undefined"){
                _gaq.push(['_trackEvent', 'Referral', 'Added', '']);
            }
        });
        
        $('.comment_body').live('focus', function(e){
            comment_form_shownn = true;
            e.stopPropagation();
        });
        
        $('.kill_referral').live('click', function(){
            $(this).parent().remove();
            if ($('.reffed_friend').length === 0){
                $('#reffered_friends').html('');
                $('#refer_button').remove();
                $('#refer_post').remove();
            }
            else{
                var refs_added = $('.reffed_friend').length;
                if (refs_added === 1){
                    $('#refer_button').text('Refer ' + refs_added + ' friend');
                }
                else{
                    $('#refer_button').text('Refer ' + refs_added + ' friends');
                }
            }
            
            if (typeof(_gaq) !== "undefined"){
                _gaq.push(['_trackEvent', 'Referral', 'Removed', '']);
            }
        });
    }
    
    
    function attach_mobile_alpha_handlers(){
        $('.friend').live('click', function(){
            selected_user = $(this).attr('value');
            update_urls();
        });
        // 
        // $('.text_wrapper').live('click', function(e){
        //     var friend_id = $(this).parent().parent().attr('value');
        //     var that = this;
        //     if ($(this).hasClass('text_expanded')){
        //         $('.text_expanded').animate({
        //             bottom: '-100px'
        //         }, 300, function(){
        //             $('.friend_controls', this).html('');
        //             $('.user_status').remove();
        //         });
        //         
        //         diff_status = true;
        //         $('.text_expanded').removeClass('text_expanded');
        //     }
        //     else{
        //         var friend_controls_html = '';
        //         diff_status = false;
        // 
        //         $('.text_expanded').animate({
        //             bottom: '-100px'
        //         }, 300, function(){
        //             $('.friend_controls', this).html('');
        //         });
        //         
        //         $('.text_expanded').removeClass('text_expanded');
        //         $('.friend_controls', this).append(friend_controls_html);
        //         
        //         $(this).addClass('text_expanded');
        //         $(this).animate({
        //             bottom: '-60px'
        //         }, 300);
        //     }
        //     e.stopPropagation();
        //     return false;
        // });
        // 
        // $('.control_click').live('click', function(e){
        //     var name = $(this).attr('name');
        //     var friend = $(this).parent().parent().parent().parent();
        //     var cont = $(this).parent().parent();
        //     var friend_fid = $(friend).attr('value');
        //     var user_fid = me.id;
        //     if (name == ''){
        //     
        //     }
        //     e.stopPropagation();
        //     return false;
        // });
    }
    
    function attach_alpha_handlers(){
        view_active = 'alpha';
        $('#friend_cont').show();
        $('#wall_cont').show();
        $('.no_alpha').hide();
        $('.alpha_key').show();
        $('.friend').die('click');
        $('html, body').scrollTop(0);
        $('.friend').live('click', function(e){
            $('.friend').show();
            scroll_to_user = $(this).attr('value');
            window.location.hash = '/';
            e.stopPropagation();
            return false;
        });
    }
    
    function attach_main_handlers(){
        var diff_status = false;
        
        $('.friend').live('click', function(){
            if (default_view == 'wall'){
                var user = $(this).attr('value');
                window.location.href = '/#/user=' + user;
            }
            else{
                var alpha_key = $('.alpha_key_wall', this).text();
                window.location.href = '/#/alpha_key=' + alpha_key;
            }
        });
    }
    
    function attach_info_handlers(){
        $('#show_all_mutual').live('click', function(){
            if (mutual_friend_top < mutual_friend_data.length){
                render_mutual_friends(mutual_friend_data, 'all');
                $('#show_all_mutual').text('Hide');
            }
            else{
                mutual_friend_top = 10;
                if (!mobile){
                    $('#mutual_friend_cont > a:gt(9)').fadeOut('fast', function(){$(this).remove();});
                }
                else{
                    $('#mutual_friend_cont > a:gt(9)').remove();
                }
                
                $('#show_all_mutual').text('Show All');
            }
        });
        
        $('.control_click').live('click', function(e){
            var name = $(this).attr('name');
            var friend_fid = getUrlVars().user
            var user_fid = me.id;
            if (name == 'heart'){
                
            }
            e.stopPropagation();
            return false;
        });
        
        if (!mobile){
            var hide_tooltip_timeout = null;
            $('#mutual_friend_cont a').live('mouseover mouseout', function(event) {
                if (event.type == 'mouseover') {
                    clearTimeout(hide_tooltip_timeout);
                    var name = $(this).attr('name');
                    var position = $(this).position();
                    $('#mutual_friend_tooltip').text(name).show().css({
                        'opacity': '1.0',
                        'left': position.left - 50,
                        'top': position.top - 25
                    });
                } else {
                    $('#mutual_friend_tooltip').css({
                        'opacity': '0'
                    });
                    hide_tooltip_timeout = setTimeout(function(){
                        $('#mutual_friend_tooltip').hide();
                    }, 300);
                }
            });
        }
    }
    
    function watch_scroll(inner){
        var elem = $(window);
        var inner = $('#profile_wrap');
        if (elem.height() + elem.scrollTop() >= inner.outerHeight() - 350) {
            if (feed_load_once && view_active == 'main' && (default_view == 'wall' || default_view == 'photo_stream') && !initial_feed_load || feed_load_once && view_active == 'profile' && !initial_feed_load){
                get_user_feed();
            }
        }
    }
    
    function update_nom_stream_vote_count(nom_id, data){
        $('#nom_vote_count').text(data.vote_count);
        if (user_winning_noms_cache[data.nominatee]){
            var active_nom_objs = user_winning_noms_cache[data.nominatee].active_nom_objs;
            for (var i = 0; i < active_nom_objs.length; i++){
                if (nom_id == active_nom_objs[i].id){
                    active_nom_objs[i].vote_count = data.vote_count;
                }
            }
        }
    }
    
    function vote_up_handler(){
        var that = this;
        var nomination_id = $(this).attr('value');
        if ($(this).hasClass('won') == false){
            if (tut_on){
                update_tut('vote');
            }
            $.post('/vote/', {'method': 'up', 'nomination_id': nomination_id}, function(data){
                if (data){
                    var vote_count_elm = $(that).parent().children().filter('p');
                    $(vote_count_elm).text(data.vote_count);
                    if (active_noms_cache[nomination_id]){
                        active_noms_cache[nomination_id].vote_count = data.vote_count;
                        active_noms_cache[nomination_id].votes.push({'vote_user': me.id, 'vote_name': me.name});
                    }

                    var vote_profile_pic_html = '<a href="#/user=' + me.id + '" class="clear_profile" id="voted_' + me.id + '" name="' + me.name + '">' +
                                                    '<img src="https://graph.facebook.com/' + me.id + '/picture?type=square"/>' +
                                                '</a>';
                    if (view_active == 'nom_detail'){
                        $('#nom_votes_wrap').append(vote_profile_pic_html);
                        $('.vote').addClass('won');
                        // $('.nom_photo_thumbnail[name="selected"] p').text(data.vote_count);
                    }
                    else{
                        $('#nom_' + nomination_id + ' .voted_cont').append(vote_profile_pic_html);
                    }
                    update_nom_stream_vote_count(nomination_id, data);
                }
            });
            if (typeof(_gaq) !== "undefined"){
                _gaq.push(['_trackEvent', 'Vote', 'Up', '']);
            }
        }
    }
    
    function vote_down_handler(){
        var that = this;
        var nomination_id = $(this).attr('value');
        if ($(this).hasClass('won') == false){
            $.post('/vote/', {'method': 'down', 'nomination_id': nomination_id}, function(data){
                if (data){
                    var vote_count_elm = $(that).parent().children().filter('p');
                    $(vote_count_elm).text(data.vote_count);
                    if (active_noms_cache[nomination_id]){
                        active_noms_cache[nomination_id].vote_count = data.vote_count;
                        active_noms_cache[nomination_id].votes.push({'vote_user': me.id, 'vote_name': me.name});
                    }
                
                    var vote_profile_pic_html = '<a href="#/user=' + me.id + '" class="clear_profile" id="voted_' + me.id + '" name="' + me.name + '">' +
                                                    '<img src="https://graph.facebook.com/' + me.id + '/picture?type=square"/>' +
                                                '</a>';
                
                    if (view_active == 'nom_detail'){
                        $('#nom_votes_wrap').append(vote_profile_pic_html);
                        $('.vote').addClass('won');
                        // $('.nom_photo_thumbnail[name="selected"] p').text(data.vote_count);
                    }
                    else{
                        $('#nom_' + nomination_id + ' .voted_cont').append(vote_profile_pic_html);
                    }
                    update_nom_stream_vote_count(nomination_id, data);
                }
            });
            if (typeof(_gaq) !== "undefined"){
                _gaq.push(['_trackEvent', 'Vote', 'Down', '']);
            }
        }
    }
    
    $('#close_overlay').live('click', close_context_overlay);
    
    function close_context_overlay(){
        var that = this;
        $('#tab_nav > .selected').removeClass('selected');
        if (!mobile){
            $('#wrapper').animate({
                'opacity': 1.0
            }, 250);
            $('#context_overlay').fadeOut('fast', function(){
                $('#context_overlay_cont').removeClass();
                $('#context_overlay_cont > div').html('');
            });
        }
        else{
            $('#wrapper').css('opacity', 1.0);
            $('#context_overlay').hide();
            $('#context_overlay_cont').removeClass();
            $('#context_overlay_cont > div').html('');
        }
        $('#wrapper').css('min-height', '');
    }
    
    function show_context_overlay(darken){
        $('#close_overlay').removeClass().addClass('close_img ' + close_size);
        if (!mobile){
            if (typeof(darken) !== "undefined"){
                $('#wrapper').animate({
                    'opacity': 0.3
                }, 300);
            }
            $('#context_overlay').fadeIn();
        }
        else{
            if (typeof(darken) !== "undefined"){
                $('#wrapper').css('opacity', 0.3);
            }
            $('#context_overlay').show();
        }
        $('#context_overlay').css('top', 150);
    }
    
    var clear_profile = false;
    function attach_profile_handlers(){
        $('.clear_profile').live('click', function(){
            clear_profile = true;
        });
        
        $('.submit_comment').live('click', submit_comment_handler);
        
        $('.add_comment_peek').live('click', add_comment_peek_handler);
        
        $('.load_more_comments').live('click', load_more_comments_handler);
        
        $('.hide_more_comments').live('click', hide_more_comments_handler);
        
        $('.cancel_comment').live('click', cancel_comment_handler);

        // $(window).bind('scroll', watch_scroll);
        
        $('.photo_post img').live('click', function(){
            var aid = $(this).attr('aid');
            var pid = $(this).attr('pid');
            var owner = $(this).attr('owner');
            
            $('#photo_list').html('');
            albums = null;
            selected_photo = pid;
            selected_album_id = aid;
            selected_user = owner;
            update_urls();
        });
        
        $('.photo_post a').live('click', function(){
            $('#photo_list').html('');
            albums = null;
        });
        
        $('.nom_photo_thumbnail').live('click', function(){
            if ($(this).attr('name') == undefined || $(this).attr('name') != 'selected'){
                var nom_id = $(this).attr('id').replace('nom_photo_', '');
                var active_id = $(this).parent().children().filter('.nom_photo_thumbnail[name="selected"]').attr('id').replace('nom_photo_', '');
                $(this).parent().parent().find('.vote_up, .vote_down').attr('name', nom_id);
                update_nom_cat(active_id ,nom_id);
            }
        });
        
        $('.vote_up').live('click', vote_up_handler);
        
        $('.vote_down').live('click', vote_down_handler)
        
        $('#activate_latest_photos').live('click', function(){
            $('#tab_nav > .selected').removeClass('selected');
            $(this).addClass('selected');
            $('#context_overlay_cont').removeClass().addClass('latest_photos_overlay');
            show_context_overlay();
            init_latest_photos();
            
            if (typeof(_gaq) !== "undefined"){
                _gaq.push(['_trackEvent', 'Latest Photos', 'Shown', '']);
            }
        });
        
        $('#activate_recent_winners').live('click', function(){
            $('#tab_nav > .selected').removeClass('selected');
            $(this).addClass('selected');
            $('#context_overlay_cont').removeClass().addClass('latest_photos_overlay');
            show_context_overlay();
            init_recent_winners();
            
            if (typeof(_gaq) !== "undefined"){
                _gaq.push(['_trackEvent', 'Recent Winners', 'Shown', '']);
            }
        });
        
        $('.voted_cont a, .new_photo_cont').live('mouseover mouseout', function(event) {
            if (event.type == 'mouseover') {
                show_like_tooltip(this);
            } else {
                hide_like_tooltip(this);
            }
        });
        
        
        $('.new_photo_cont').live('click', function(){
            var photo_id = $(this).attr('value');
            
            $('#photo_list').html('');
            $.getJSON('https://api.facebook.com/method/photos.get?access_token=' + fb_session.access_token + '&pids=' + photo_id + '&format=json&callback=?', function(data){
                var data = data[0],
                    user_id = data.owner,
                    album_id = data.album_object_id,
                    photo_id = data.object_id;
                    selected_photo = String(photo_id);
                    
                window.location.href = '#/user=' + user_id + '/album=' + album_id + '/gallery';
                $('#close_overlay').click();
            });
            
        });
        
        $('.next_photo').live('click', function(){
            var selected = $(this).parent().prev().children().filter('[name="selected"]');
            $(selected).next().click();
        });
        
        $('.prev_photo').live('click', function(){
            var selected = $(this).parent().prev().children().filter('[name="selected"]');
            $(selected).prev().click();
        });
        
        // function handleFiles(files) {  
        //     for (var i = 0; i < files.length; i++) {  
        //         var file = files[i];  
        //         var imageType = /image.*/;  
        // 
        //         if (!file.type.match(imageType)) {  
        //             continue;  
        //         }  
        // 
        //         var img = document.createElement("img");  
        //         img.classList.add("obj");  
        //         img.file = file;
        //         show_upload_preview(img);
        //         // preview.appendChild(img);  
        // 
        //         var reader = new FileReader();  
        //         reader.onload = (function(aImg) { return function(e) { aImg.src = e.target.result; }; })(img);  
        //         reader.readAsDataURL(file);  
        //     }  
        // }
        // 
        // function drop(e) {  
        //     e.stopPropagation();  
        //     e.preventDefault();  
        // 
        //     var dt = e.dataTransfer;  
        //     var files = dt.files;  
        // 
        //     handleFiles(files);  
        // }
        // 
        // function dragenter(e) {  
        //     e.stopPropagation();  
        //     e.preventDefault();  
        // }  
        // 
        // function dragover(e) {  
        //     e.stopPropagation();  
        //     e.preventDefault();  
        // }
        // 
        // $('.kill_photo').live('click', function(){
        //     $(this).parent().parent().fadeOut(function(){
        //         $(this).remove();
        //         if ($('#upload_preview_cont').children().length == 0){
        //             $('#upload_preview').slideUp();
        //         }
        //     });
        // });
        // 
        // var photo_upload_html = '';
        // $('#show_upload').live('click', function(){
        //     // if (typeof(FileReader) != "undefined") {
        //     //     $('#drag_container').show();
        //     // }
        //     if (photo_upload_html != ''){
        //         $('#photo_upload_cont').html(photo_upload_html);
        //     }
        //     else{
        //         photo_upload_html = $('#photo_upload_cont').html();   
        //     }
        //     if (!mobile){
        //         $('#wrapper').animate({
        //             'opacity': '0.3'
        //         }, 200);
        //         $(this).fadeOut();
        //         $('#photo_upload').fadeIn();
        //     }
        //     else{
        //         $('#wrapper').css({
        //             'opacity': '0.3'
        //         });
        //         $(this).hide();
        //         $('#photo_upload').show();
        //     }
        //     
        //     // var dropbox = document.getElementById("drag_container");
        //     // dropbox.addEventListener("dragenter", dragenter, false);  
        //     // dropbox.addEventListener("dragover", dragover, false);
        //     // dropbox.addEventListener("drop", drop, false);
        // });
        // 
        // $('#close_upload, #cancel_upload').live('click', function(){
        //     if (!mobile){
        //         $('#wrapper').animate({
        //             'opacity': '1.0'
        //         }, 200);
        //         $('#show_upload').fadeIn();
        //         $('#photo_upload').fadeOut();
        //     }
        //     else{
        //         $('#wrapper').css({
        //             'opacity': '1.0'
        //         });
        //         $('#photo_upload').hide();
        //         $('#show_upload').show();
        //     }
        //     
        //     $('li.unselected').die('click');
        //     
        //     // var dropbox = document.getElementById("drag_container");
        //     // dropbox.removeEventListener("dragenter", dragenter, false);  
        //     // dropbox.removeEventListener("dragover", dragover, false);
        //     // dropbox.removeEventListener("drop", drop);
        // });
        // 
        // function upload_image(img, file){
        //     var test = file
        // }
        // 
        // function show_upload_preview(data){
        //     var preview_container = $('#upload_preview');
        //     var preview = $('#upload_preview_cont');
        //     if ($(preview_container).is(':hidden')){
        //         $(preview_container).fadeIn();
        //     }
        //     var preview_html =  '<div class="preview_cont">' +
        //                             '<div class="preview_wrap">' +
        //                                 '<img class="photo_to_upload" name="' + data.id + '" src="' + data.photo_medium + '"/>' +
        //                                 '<img class="kill_photo close_img" src="http://portrit.s3.amazonaws.com/img/x.png">' +
        //                             '</div>' +
        //                             '<input type="text" class="photo_caption" name="caption_' + data.id + '" value="Photo Caption"/>' +
        //                         '</div>';
        //     remove_load();
        //     $(preview).append(preview_html);
        // }
        // 
        // $('.photo_caption').live('focus', function() {
        //     comment_form_shown = true;
        //     if (this.value == this.defaultValue){
        //         this.value = '';
        //     }  
        //     if(this.value != this.defaultValue){  
        //         this.select();  
        //     }  
        // }); 
        // 
        // $('.photo_caption').live('blur', function() {
        //     comment_form_shown = false; 
        //     if ($.trim(this.value) == ''){
        //         this.value = (this.defaultValue ? this.defaultValue : '');  
        //     }  
        // });
        // 
        // $('#upload_photo_button').live('change', function(){
        //     append_load($('#upload_preview_cont'), 'light');
        //     $.ajaxFileUpload({
        //      url:                '/upload_photo/',
        //      secureuri:          false,
        //      fileElementId:      'upload_photo_button',
        //      dataType:           'json',
        //         success:            show_upload_preview
        //  });
        // });
        // 
        // $('#post_upload').live('click', function(){
        //     var query_id_string = '';
        //     $('.photo_to_upload').each(function(i){
        //         if (i == 0){
        //             query_id_string += $(this).attr('name');
        //         }
        //         else{
        //             query_id_string += ',' + $(this).attr('name');
        //         }
        //     });
        //     $.post('/mark_photos_live/', {'ids': query_id_string}, function(data){
        //         var photo_ids = data.photo_ids,
        //             photos = $('.photo_to_upload'),
        //             photo_captions = $('.photo_caption'),
        //             caption = null,
        //             left_nom_cont = '',
        //             right_nom_cont = '',
        //             caption_text = '';
        //             
        //         left_nom_cont = '<ul class="left_photo_nom_cont">' + 
        //                             '<li class="unselected" id="Hot_cont">' +
        //                                 '<img src="http://portrit.s3.amazonaws.com/img/trophies/small/hot.png">' +
        //                                 '<h4 class="nom_cat_hot_text">Hot</h4>' +
        //                             '</li>' +
        //                             '<li class="unselected" id="Lol_cont">' +
        //                                 '<img src="http://portrit.s3.amazonaws.com/img/trophies/small/lol.png">' +
        //                                 '<h4 class="nom_cat_lol_text">LOL</h4>' +
        //                             '</li>' +
        //                             '<li class="unselected" id="Artsy_cont">' +
        //                                 '<img src="http://portrit.s3.amazonaws.com/img/trophies/small/artsy.png">' +
        //                                 '<h4 class="nom_cat_artsy_text">Artsy</h4>' + 
        //                             '</li>' +
        //                             '<li class="unselected" id="Fail_cont">' +
        //                                 '<img src="http://portrit.s3.amazonaws.com/img/trophies/small/fail.png">' +
        //                                 '<h4 class="nom_cat_fail_text">Fail</h4>' + 
        //                             '</li>' +
        //                             '<div class="clear"></div>' +
        //                         '</ul>';
        //                         
        //         right_nom_cont ='<ul class="right_photo_nom_cont">' +
        //                             '<li class="unselected" id="Party_Animal_cont">' +
        //                                 '<img src="http://portrit.s3.amazonaws.com/img/trophies/small/party_animal.png">' +
        //                                 '<h4 class="nom_cat_party_animal_text">Party Animal</h4>' +
        //                             '</li>' +
        //                             '<li class="unselected" id="Cute_cont">' +
        //                                 '<img src="http://portrit.s3.amazonaws.com/img/trophies/small/cute.png">' +
        //                                 '<h4 class="nom_cat_cute_text">Cute</h4>' +
        //                             '</li>' +
        //                             '<li class="unselected" id="WTF_cont">' +
        //                                 '<img src="http://portrit.s3.amazonaws.com/img/trophies/small/wtf.png">' +
        //                                 '<h4 class="nom_cat_wtf_text">WTF</h4>' +
        //                             '</li>' +
        //                             '<li class="unselected" id="Creepy_cont">' +
        //                                 '<img src="http://portrit.s3.amazonaws.com/img/trophies/small/creepy.png">' +
        //                                 '<h4 class="nom_cat_creepy_text">Creepy</h4>' +
        //                             '</li>' +
        //                             '<div class="clear"></div>' +
        //                         '</ul>';
        //             
        //         $('#photo_upload_cont > h1').fadeOut(function(){
        //             $(this).text('Nominate Photos').fadeIn();
        //         });
        //         
        //         $('#upload_preview > h1').fadeOut();
        //         $('#photo_upload_cont > p').fadeOut();
        //         $('#upload_photo_button').fadeOut();
        //         $('.kill_photo').remove();
        //         
        //         if (photos.length > 1){
        //             $('#post_upload').text('Nominate Photos');
        //         }
        //         else{
        //             $('#post_upload').text('Nominate Photo');
        //         }
        //         $('#cancel_upload').text('Skip');
        //         
        //         $(photos).each(function(i){
        //             caption = photo_captions.filter(':eq(' + i + ')');
        //             caption_text = caption.val();
        //             caption.remove();
        //             $(this).parent().parent().prepend(left_nom_cont);
        //             $(this).parent().parent().append(right_nom_cont);
        //             $(this).parent().parent().append('<h2>Selected Nominations</h2><ul class="photo_nom_selected_cont"><div class="photo_nom_selected_empty"><p>No nominations selected.</p></div></ul>')
        //             $(this).parent().append('<p>' + caption_text + '</p>');
        //         });
        //         
        //         $('li.unselected').live('click', upload_photo_nom_click);
        //         $('li.selected .kill_nomination').live('click', remove_photo_nom_click);
        //     });
        // });
        // 
        // function remove_photo_nom_click(){
        //     var parent = $(this).parent();
        //     var id = $(parent).attr('id');
        //     
        //     if ($(parent).parent().parent().find('.left_photo_nom_cont').css('opacity') < 1){
        //         $(parent).parent().parent().find('.left_photo_nom_cont').animate({
        //             'opacity': '1.0'
        //         });
        //         $(parent).parent().parent().find('.right_photo_nom_cont').animate({
        //             'opacity': '1.0'
        //         });
        //     }
        //     if ($(parent).parent().find('.selected').length - 1 == 0){
        //         $(parent).parent().find('.photo_nom_selected_empty').fadeIn();
        //     }
        //     
        //     $(parent).parent().parent().find('#' + id).animate({
        //         'opacity': 1
        //     }).removeClass('selected').addClass('unselected');
        //     $(parent).remove();
        // }
        // 
        // function upload_photo_nom_click(){
        //     var parent_elm = null;
        //     var selected_noms_cont = null;
        //     
        //     parent_elm = $(this).parent().parent();
        //     selected_noms_cont = $(parent_elm).find('.photo_nom_selected_cont');
        //     
        //     $(selected_noms_cont).find('.photo_nom_selected_empty').hide();
        //     if ($(selected_noms_cont).find('li').length < 3){
        //         $(this).removeClass('unselected').addClass('selected');
        //         $(this).animate({
        //             'opacity': 0
        //         }, 300);
        //         var nom_clone = $(this).clone();
        //         $(selected_noms_cont).append(nom_clone);
        //         $(selected_noms_cont).find('.selected:last').append('<img class="kill_nomination close_img" src="http://portrit.s3.amazonaws.com/img/x.png">').css({
        //             'display': 'inline-block'
        //         });
        //     }
        //     if ($(selected_noms_cont).find('li').length == 3){
        //         $('.right_photo_nom_cont').animate({
        //             'opacity': '0.5'
        //         }, 300);
        //         $('.left_photo_nom_cont').animate({
        //             'opacity': '0.5'
        //         }, 300);
        //     }
        // }
        
        // $('#portrit_friends_cont > a').live('mouseover mouseout', function(event) {
        //     if (event.type == 'mouseover') {
        //         show_like_tooltip(this);
        //     } else {
        //         hide_like_tooltip(this);
        //     }
        // });
        
        $('.add_new_comment').live('click', function(){
            var nom_id = $(this).parent().attr('value');
            var new_comment_html =  '<div class="new_comment_cont" style="display:none;">' +
                                        '<div class="comment_top_head">' +
                                            '<a class="awesome large post_new_comment" value="' + nom_id + '">Post</a>' + 
                                            '<a class="awesome large cancel_new_comment">Close</a>' +
                                        '</div>' +
                                        '<textarea class="comment_body"></textarea>' +
                                    '</div>';
            $(this).parent().after(new_comment_html);
            // if (!mobile){
            //     $(this).fadeOut();
            //     $(this).parent().parent().find('.new_comment_cont').slideDown('fast', function(){
            //         $('.comment_body', this).focus();
            //     });
            // }
            // else{
                $(this).hide();
                $(this).parent().parent().find('.new_comment_cont').show();
                $(this).parent().parent().find('.comment_body').focus();
            // }
            
            if (typeof(_gaq) !== "undefined"){
                _gaq.push(['_trackEvent', 'Comment', 'Shown', '']);
            }
        });
        
        $('.cancel_new_comment').live('click', function(){
            var comment_cont = $(this).parent().parent();
            // if (!mobile){
            //     $(comment_cont).slideUp('fast', function(){
            //         $(this).remove();
            //     });
            //     $(comment_cont).parent().find('.add_new_comment').fadeIn();
            // }
            // else{
                $(comment_cont).parent().find('.add_new_comment').show();
                $(comment_cont).remove();
            // }
        });
        
        $('.post_new_comment').live('click', function(){
            var comment_cont = $(this).parent().parent();
            var body = $(comment_cont).find('.comment_body').val().replace(/\n\r?/g, '<br />'),
                nom_id = $(this).attr('value');
                
            var now = new Date().getTime();
            var comment_cont_html ='<div class="comment" style="display:none;">' +
                                        '<p class="comment_time" value="' + (now / 1000) + '">Right now</p>' +
                                        '<a href="#/user=' + me.id + '" class="clear_profile">' +
                                            '<img class="user_photo" src="https://graph.facebook.com/' + me.id + '/picture?type=square"/>' +
                                        '</a>' +
                                        '<a href="#/user=' + me.id + '" class="post_username from_username clear_profile">You</a>' +
                                        '<p>' + body + '</p>' +
                                    '</div>';
            $(comment_cont).after(comment_cont_html);
            $(comment_cont).after(comment_cont_html);
            $(comment_cont).next().fadeIn();
            $(comment_cont).find('.cancel_new_comment').click();
            $(comment_cont).find('.comment_body').val('');
            $(comment_cont).parent().find('.comment_empty').remove();
            
            if (tut_on){
                update_tut('comment');
            }
            
            $.post('/new_comment/', {'body': body, 'nom_id': nom_id}, function(data){
                if (data){
                    data = JSON.parse(data);

                    active_noms_cache[nom_id].comment_count += 1;
                    if (active_noms_cache[nom_id].comments){
                        active_noms_cache[nom_id].comments.unshift({
                           'comments': {
                               'comment': data.payload.comment,
                               'id': data.payload.comment_id,
                               'owner_id': data.payload.comment_sender_id,
                               'owner_name': data.payload.comment_sender_name,
                               'create_datetime': data.payload.create_datetime
                           } 
                        });
                    }
                    active_noms_cache[nom_id].quick_comments.unshift({
                       'comments': {
                           'comment': data.payload.comment,
                           'id': data.payload.comment_id,
                           'owner_id': data.payload.comment_sender_id,
                           'owner_name': data.payload.comment_sender_name,
                           'create_datetime': data.payload.create_datetime
                       } 
                    });
                    
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
            comment_form_shown = true;
        });
        
        $('.comment_body').live('blur', function(){
            comment_form_shown = false;
        });
        
        $('#load_more').live('click', function(){
            var that = this;
            var oldest_time = $('.recent_nom_cont:last').attr('time');
            
            $(this).remove();
            $('#recent_left_cont').append('<div id="profile_loading"><img src="http://portrit.s3.amazonaws.com/img/ajax-loader-light.gif"/></div>');
            $.getJSON('/get_more_recent_stream/', {'create_time': oldest_time}, function(data){
                $('#profile_loading').remove();
                render_recent_stream(data);
            });
            
            if (typeof(_gaq) !== "undefined"){
                _gaq.push(['_trackEvent', 'Stream', 'Load More', '']);
            }
        });
        
        if (mobile){
            // $('#back_gallery, #back_gallery_mobile').live('touchend', function(e){
            //     e.stopPropagation();
            //     load_previous_picture();
            //     return false;
            // });
            // 
            // $('#forward_gallery, #forward_gallery_mobile').live('touchend', function(e){
            //     e.stopPropagation();
            //     load_next_picture();
            //     return false;
            // });

        }
        else{
            
        }
    }
    
    function inject_nom_detail(nom){
        var active_cat = $('#nom_detail_cont .title').attr('name');
        var photo = null,
            photo_html = '';
        for (var i = 0; i < nom.length; i++){
            if (nom[i].nomination_category == active_cat){
                photo = nom[i].photo;
                photo_html ='<div id="nom_photo_' + nom[i].id + '" class="nom_photo_thumbnail" style="height:' + nom[i].photo.small_height + 'px; opacity: 0.6;">' +
                                '<img src="' + nom[i].photo.src_small + '"/>' +
                                '<p class="nom_cat_' + nom[i].nomination_category.replace(' ', '_').toLowerCase() + '">' + nom[i].vote_count + '</p>' +
                            '</div>';
                $('#nom_cat_stream').append(photo_html);
            }
        }
        
        slide_images = $('.nom_photo_thumbnail');
        
        var img_widths = [ ];
        var slide_center = 0;
        var slide_img_width = 0;
        var center_found = false;
        var mid_screen = $('#nom_cat_stream').width() / 2;
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
    }
    
    function update_nom_detail(nom, won){
        $('#main_nom_photo').attr('src', nom.photo.src);
        $('#vote_cont_left p').text(nom.vote_count);
        
        $('.comment').remove();
        $('#nom_votes_wrap a').remove();
        $('.vote').attr('value', nom.id);
        $('#main_nom_cont').attr('value', nom.id);
        
        var name = '',
            caption = '',
            nominator_name = '',
            cat_underscore = '';
        if (friends[nom.nominatee]){
            name = friends[nom.nominatee].name;
        }
        else if (nom.nominatee == me.id){
            if (nom.won){
                name = 'You';
            }
            else{
                name = 'You\'re';
            }
        }
        else{
            name = '';
        }
        
        if (nom.caption){
            caption = 'Caption: ' +nom.caption;
        }
        
        if (nom.nominator == me.id){
            nominator_name = "You";
        }
        else if (friends[nom.nominator]){
            nominator_name = friends[nom.nominator].name;
        }
        else{
            nominator_name = '';
        }
        
        cat_underscore = nom.nomination_category.replace(' ', '_').toLowerCase();
        
        $('#trophy_cont').removeClass().addClass('nom_cat_' + cat_underscore);
        $('#nomination_text_cont h3').text(nom.nomination_category);
        $('#nom_trophy_icon').removeClass().addClass('trophy_img large ' + cat_underscore);//.attr('src', 'http://portrit.s3.amazonaws.com/img/trophies/large/' + cat_underscore + '.png');
        $('#nominator_overlay_cont a').attr('href', '/#/user=' + nom.nominator);
        $('#nominator_overlay_cont > h2 > a').text(nominator_name);
        $('#nominator_overlay_cont p').text(caption);
        $('#nominator_overlay_cont .user_img').attr('src', 'https://graph.facebook.com/' + nom.nominator + '/picture?type=square')
        $('div#nomination_text_cont .user_img').attr('src', 'https://graph.facebook.com/' + nom.nominatee + '/picture?type=square')
        $('#nomination_text_cont a').attr('href', '/#/user=' + nom.nominatee);
        $('#nomination_text_cont span').text(name);
        
        var winning_text = '';
        if (nom.won){
            winning_text = 'Won';
        }
        else{
            winning_text = 'Nominated for';
        }
        
        $('#nomination_text_cont p').text(winning_text);
        
        get_nom_comments(nom.id, won);
        render_nom_votes(nom.votes);
    }
    
    function attach_nom_detail_handlers(){
        $('.nom_photo_thumbnail').live('click', function(){
            var nom_id = $(this).attr('id').replace('nom_photo_', '');
            var nom = null;
            var won = getUrlVars().won;
            var trophy = getUrlVars().trophy;
            
            if (won != undefined || trophy != undefined){
                nom = winning_noms_cache[nom_id];
            }
            else{
                nom = active_noms_cache[nom_id];   
            }
            
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
            
            update_nom_detail(nom, won);
        });
        
        $('.won').live('mouseover mouseout', function(event) {
            if (event.type == 'mouseover') {
                show_like_tooltip(this);
            } else {
                hide_like_tooltip(this);
            }
        });
        
        $('#nom_votes_cont a').live('mouseover mouseout', function(event) {
            if (event.type == 'mouseover') {
                show_like_tooltip(this);
            } else {
                hide_like_tooltip(this);
            }
        });
        
        $('#add_new_comment').live('click', function(){
            var comment_cont = $(this).parent().parent().find('#new_comment_cont');
            
            comment_form_shown = true;
            // if (!mobile){
            //     $(this).fadeOut('fast');
            //     $(comment_cont).slideDown(100);
            // }
            // else{
                $(this).hide()
                $(comment_cont).show();
            // }
            $('.comment_body').focus();
        });
        
        $('.cancel_new_comment').live('click', function(){
            var comment_cont = $(this).parent().parent();
             
            comment_form_shown = false;
            // if (!mobile){
            //     $(comment_cont).slideUp(100);
            //     $('#add_new_comment').fadeIn('fast');
            // }
            // else{
                $(comment_cont).hide();
                $('#add_new_comment').show();
            // }
        });
        
        $('.post_new_comment').live('click', function(data){
            var body = $('.comment_body').val().replace(/\n\r?/g, '<br />'),
                nom_id = $('#main_nom_cont').attr('value');
                
            if (tut_on){
                update_tut('comment');
            }
            
            var now = new Date().getTime();
            var comment_cont_html ='<div class="comment">' +
                                        '<p class="comment_time" value="' + (now / 1000) + '">Right now</p>' +
                                        '<a href="#/user=' + me.id + '" class="clear_profile">' +
                                            '<img class="user_photo" src="https://graph.facebook.com/' + me.id + '/picture?type=square"/>' +
                                        '</a>' +
                                        '<a href="#?user=' + me.id + '" class="post_username from_username clear_profile">You</a>' +
                                        '<p>' + body + '</p>' +
                                    '</div>';
            $('#new_comment_cont').after(comment_cont_html);
            if (!mobile){
                $('.comment_empty').fadeOut();
            }
            else{
                $('.comment_empty').hide();
            }
            
            $('.cancel_new_comment').click();
            $('.comment_body').val('');
                
            $.post('/new_comment/', {'body': body, 'nom_id': nom_id}, function(data){
                if (data){
                    data = JSON.parse(data);
                    
                    if (getUrlVars().won != undefined){
                        winning_noms_cache[nom_id].comment_count += 1;
                        winning_noms_cache[nom_id].comments.unshift({
                           'comments': {
                               'comment': data.payload.comment,
                               'id': data.payload.comment_id,
                               'owner_id': data.payload.comment_sender_id,
                               'owner_name': data.payload.comment_sender_name,
                               'create_datetime': data.payload.create_datetime
                           } 
                        });
                    }
                    else{
                        active_noms_cache[nom_id].comment_count += 1;
                        active_noms_cache[nom_id].comments.unshift({
                           'comments': {
                               'comment': data.payload.comment,
                               'id': data.payload.comment_id,
                               'owner_id': data.payload.comment_sender_id,
                               'owner_name': data.payload.comment_sender_name,
                               'create_datetime': data.payload.create_datetime
                           } 
                        });
                    }
                    
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
        
        if (mobile && !tablet){
            addSwipeListener(document.body, function(e) {
                if (e.direction == 'left'){
                    $('.next_photo').trigger('click');
                }
                else{
                    $('.prev_photo').trigger('click');
                }
            });
        }
    }
    
    var user_album_height_interval = null;
    var user_album_height_interval_count = 0;
    function transition_trophy_view(instant){
        var window_width = $(window).width();
        var album_current_height = $('#album_cont').height();
        var profile_nav_control = $('#profile_nav_cont');
        $(profile_nav_control).attr('value', 'trophies');
        $('h2', profile_nav_control).text('Profile');
        $('#album_right_arrow').hide();
        $('#album_left_arrow').show();
        $('#album_cont').show();
        $('#user_profile_cont').css({
            'min-height': album_current_height
        });
        clearInterval(user_album_height_interval);
        user_album_height_interval = setInterval(function(){
            if (user_album_height_interval_count < 20){
                var album_current_height = $('#album_cont').height();
                var current_min_height = $('#user_profile_cont').css('min-height');

                if (current_min_height != album_current_height || current_min_height < album_current_height){
                    $('#user_profile_cont').css('min-height', album_current_height);
                    user_album_height_interval_count += 1;
                }
                else{
                    clearInterval(user_album_height_interval);
                    user_album_height_interval_count += 0;
                }
                
            }
            else{
                clearInterval(user_album_height_interval);
                user_album_height_interval_count += 0;
            }
        }, 50);
        if (!mobile && !instant){
            $('#user_profile_cont').animate({
                'right': '800px'
            }, 300);
        }
        else if (tablet){
            $('#user_profile_cont').css({
                'right': '800px'
            });
        }
        else{
            $('#profile_nav_cont').css({
                'right': '-100px'
            });
            $('#user_profile_cont').css({
                'right': '520px'
            });
        }
    }
    
    function transition_album_view(instant){
        var profile_nav_control = $('#profile_nav_cont');
        $(profile_nav_control).attr('value', 'albums');
        $('h2', profile_nav_control).text('Albums');
        $('#album_right_arrow').show();
        $('#album_left_arrow').hide();
        $('#user_profile_cont').css({
            'min-height': ''
        });
        
        if (!mobile && !instant){
            $('#user_profile_cont').animate({
                'right': '0px'
            }, 300);
        }
        else if (tablet){
            $('#user_profile_cont').css({
                'right': '0px'
            });
        }
        else{
            $('#profile_nav_cont').css({
                'right': '10px'
            });
            $('#user_profile_cont').css({
                'right': '0px'
            });
        }
    }
    
    function attach_user_profile_handlers(){
        $('#user_friends a').live('mouseover mouseout', function(event) {
            if (event.type == 'mouseover') {
                show_like_tooltip(this);
            } else {
                hide_like_tooltip(this);
            }
        });
        
        $('#profile_nav_cont').live('click', function(){
            var view_to_activate = $(this).attr('value');
            if (view_to_activate == 'albums'){
                transition_trophy_view();
            }
            else{
                transition_album_view();
            }
        });
    }
    
    function attach_album_handlers(){
        if (mobile){
            // var album_click_timer = null;
            // mouse_up = false;
            // $('.img_thumbs').live('touchstart', function(e){
            //     e.stopPropagation();
            //     album = this;
            //     peek_ended = false;
            //     album_click_timer = setTimeout(function(){
            //         if (mouse_up){
            //             $(album).click();
            //             mouse_up = false;
            //         }
            //     }, 100);
            //     click_hold_timer = setTimeout(album_peek, 250);
            //     mouse_up = false;
            //     // return false;
            // });
            // 
            // $(document).bind('touchmove', function(){
            //     clearTimeout(album_click_timer);
            // });
            // 
            // $('.img_thumbs').live('touchend', function(e){
            //     e.stopPropagation();
            //     clearTimeout(click_hold_timer);
            //     mouse_up = true;
            //     first_touch = true;
            //     reset_peek();
            //     return false;
            // });
        }
        else{
            $('.img_thumbs').live('mousedown', function(e){
                album = this;
                peek_ended = false;
                click_hold_timer = setTimeout(album_peek, 200);
                e.stopPropagation();
                return false;
            });
            
            $(document).bind('mouseup', function(e){
                mouse_up = true;
                first_touch = true;
                reset_peek();
                clearTimeout(click_hold_timer);
            });
        }
        
        $('.winning_trophy_cont').live('mouseover mouseout', function(event) {
            var that = this;
            if (event.type == 'mouseover') {
                $('.winning_trophy_count', this).css('opacity', '1');
            } else {
                $('.winning_trophy_count', this).css('opacity', '0.8');
            } 
        });
        
        $('#user_info_view').live('click', function(){
            //Init user profile with render hidden
            if (view_active != 'info'){
                init_info_view();
                transition_to_info();
            }
        });
        
        $('#user_photo_view').live('click', function(){
            if (view_active != 'album'){
                transition_to_album();
            }
        });
        
        $('#user_wall_view').live('click', function(){
            if (view_active != 'profile'){
                init_profile_view();
                transition_to_profile();
            }
        });
        
        $('.photo_album').live('click', function(){
            if (!peek_on && !peek_ended){
                $('#photo_list').html('');
                selected_photo = '';
                selected_album_id = $(this).attr('id');
                update_urls();
            }
        });
        
        $('.photo_album').live('mouseover mouseout', function(event) {
            var that = this;
            if (event.type == 'mouseover') {
                $(this).children('.album_title').css('background-color', '#222');
            } else {
                $(this).children('.album_title').css('background-color', '#444');
            } 
        });
        
        $('.trophy_album').live('click', function(){
            var trophy = $(this).attr('name').replace(' ', '_').toLowerCase();
            var user = getUrlVars().user;
            if (!user){
                user = me.id;
            }
            window.location.href = '/#/trophy/user=' + user + '/trophy=' + trophy;
        });
    }
    
    function attach_list_handlers(){
        $('.photo_thumbs').live('click', photo_click_handler);
        
        //$('#load_more_photos').live('click', init_list_view);
        
        $(window).bind('scroll', function(){
            if ($(window).scrollTop() >= $('#photo_list').height() - ($(window).height() *2)){
                if (photo_load_once){
                    // if ($('.photos_loading').length == 0 && !album_completed){
                    //     $('#photo_scroller').append('<img class="photos_loading" src="http://portrit.s3.amazonaws.com/img/album-loader-dark.gif"/>');
                    // }
                    if (!album_completed){
                        init_list_view();
                    }
                }
            }
        });
        // $('#next_album').live('click', next_album);
        // $('#prev_album').live('click', prev_album);
    }
    
    function attach_gallery_handlers(){
        if (mobile){
            if (!tablet){
                addSwipeListener(document.body, function(e) {
                    if (e.direction == 'left'){
                        load_next_picture();
                    }
                    else{
                        load_previous_picture();
                    }
                });
            }
            
            $('#back_gallery, #back_gallery_mobile').live('touchend', function(e){
                e.stopPropagation();
                load_previous_picture();
                return false;
            });

            $('#forward_gallery, #forward_gallery_mobile').live('touchend', function(e){
                e.stopPropagation();
                load_next_picture();
                return false;
            });

        }
        else{
            $('#back_gallery, #back_gallery_mobile').live('click', function(e){
                if (!mobile){
                    $(this).queue( [ ] ).stop();
                    $(this).animate({
                        'opacity': 1.0
                    }, 100, function(){
                        $(this).animate({
                            'opacity': 0.5
                        }, 125);
                    }); 
                }
                e.stopPropagation();
                load_previous_picture();
                return false;
            });

            $('#forward_gallery, #forward_gallery_mobile').live('click', function(e){
                if (!mobile){
                    $(this).queue( [ ] ).stop();
                    $(this).animate({
                        'opacity': 1.0
                    }, 100, function(){
                        $(this).animate({
                            'opacity': 0.5
                        }, 125);
                    }); 
                }
                e.stopPropagation();
                load_next_picture();
                return false;
            });
        }
        
        $('#nominate_photo').live('click', function(){
            comment_form_shown = true;
            if (!mobile){
                $('#nominate_photo').fadeOut('fast');
                $('#new_nomination_wrap').fadeIn('fast');
                $('#new_nomination_cont').fadeIn('fast');
            }
            else{
                $('#nominate_photo').hide();
                $('#new_nomination_wrap').show();
                $('#new_nomination_cont').show();
            }
            return false; 
        });
        
        $('#go_nom_detail').live('click', function(){
            var nom_id = $(this).attr('value');
            if (winning_user_photo_dict[selected_photo]){
                window.location.href = '/#/nom_id=' + nom_id + '/won';
            }
            else{
                window.location.href = '/#/nom_id=' + nom_id;
            }
            
        });
        
        $('#cancel_nominate_photo, #cancel_nomination').live('click', function(){
            comment_form_shown = false;
            if (!mobile){
                $('#nominate_photo').fadeIn('fast');
                $('#new_nomination_wrap').fadeOut('fast');
            }
            else{
                $('#nominate_photo').show();
                $('#new_nomination_wrap').hide();
            }
            reset_nomination_overlay();
            return false;
        });
        
        var nominate_limit = 3;
        $('#new_nomination_cont li').live('click', function(){
            if ($(this).hasClass('unselected')){
                if ($('#active_nominations_cont').children().length < nominate_limit){
                    $('#active_empty').hide();
                    if ($('#active_nominations_cont').children().length + 1 == nominate_limit){
                        $('#trophy_cont_top').addClass('inactive');
                    }
                    else{
                        $('.inactive').removeClass('inactive');
                    }
                    $(this).removeClass('unselected').addClass('selected');
                    var title = $(this).find('h4').text().replace(' ', '_');
                    var title_elm = $(this).html();
                    var img = '';

                    if ($('#active_nominations').is(':hidden')){
                        $('#active_nominations').show();
                    }
                    var active_nom_html =   '<div id="' + title + '">' +
                                                title_elm +
                                                '<span class="kill_nomination close_img ' + close_size + '"></span>' + 
                                            '</div>';
                    $('#active_nominations_cont').append(active_nom_html);
                    //Fade in CSS3 hack
                    setTimeout(function(){
                        $('#' + title).css({
                            'opacity': '1.0'
                        }); 
                    }, 50);
                }
            }
        });
        
        $('.kill_nomination').live('click', function(){
            var id = $(this).parent().attr('id');
            id = '#' + id + '_cont';
            $(id).addClass('unselected').removeClass('selected');
            
            $(this).parent().remove();
            
            if ($('#active_nominations_cont').children().length < nominate_limit){
                $('.inactive').removeClass('inactive');
            }
            if ($('#active_nominations_cont').children().length == 0){
                $('#active_empty').show();
            }
        });
        
        $('#nomination_comment').live('focus', function() {  
            if (this.value == this.defaultValue){
                this.value = '';
            }  
            if(this.value != this.defaultValue){  
                this.select();  
            }
        }); 

        $('#nomination_comment').live('blur', function() {  
            if ($.trim(this.value) == ''){
                this.value = (this.defaultValue ? this.defaultValue : '');  
            }  
        });
        
        $('#post_nomination').live('click', function(){
            var selected_nominations = '';
            var that = this;
            if ($('#active_nominations_cont div').length > 0 && !($(this).hasClass('awesome_hover_lock'))){
                if (tut_on){
                    update_tut('nom');
                }
                
                $('#active_nominations_cont div h4').each(function(){
                    selected_nominations += $(this).text() + ','
                });
                $(that).text('Saving...');
                $(that).addClass('awesome_hover_lock');
                var photo_src = $('#photo_large_inline').attr('src');
                var photo_src_small = $('.photo_thumbs[name="selected"] img').attr('src');
                var photo_small_height = $('.photo_thumbs[name="selected"] img').height();
                var photo_small_width = $('.photo_thumbs[name="selected"] img').width();
                var photo_height = $('#photo_large_inline').height();
                var photo_width = $('#photo_large_inline').width();
                var comment_text = $('#nomination_comment').val();
                if (comment_text == 'Add a caption to this nomination.'){
                    comment_text = '';
                }
                var data = {
                    'nominations': selected_nominations,
                    'comment_text': comment_text,
                    'photo_id': selected_photo,
                    'photo_src': photo_src,
                    'photo_src_small': photo_src_small,
                    'photo_small_height': photo_small_height,
                    'photo_small_width': photo_small_width,
                    'photo_height': photo_height,
                    'photo_width': photo_width,
                    'album_id': selected_album.album.id,
                    'owner': selected_user
                }
                $.post('/nominate_photo/', data, function(data){
                    var nom_cat_text = '',
                        nom_cat_underscore = '',
                        nom_complete_html = '',
                        nominatee_id = '',
                        nominatee_name = '',
                        nominator_id = '',
                        nominator_name = '';
                    $('#new_nomination_cont').fadeOut(function(){
                        $(that).text('Post Nomination');
                        $(that).removeClass('awesome_hover_lock');
                        nominatee_id = data[0].nominatee;
                        nominator_id = data[0].nominator;
                        if (nominator_id == me.id){
                            nominator_name = me.name;
                        }
                        else{
                            nominator_name = friends[nominator_id].name;
                        }
                        if (nominatee_id == me.id){
                            nominatee_name = me.name;
                        }
                        else{
                            nominatee_name = friends[nominatee_id].name;
                        }
                        for (var i = 0; i < data.length; i++){
                            nom_cat_text = data[i].nomination_category;
                            nom_cat_underscore = data[i].nomination_category.replace(' ', '_').toLowerCase();
                            nom_complete_html = '<div class="nom_complete_cat_cont">' +
                                                    '<a href="#/nom_id=' + data[i].id + '">' +
                                                        '<img src="http://portrit.s3.amazonaws.com/img/trophies/medium/' + nom_cat_underscore + '.png"/>' +
                                                    'View Nomination</a>' +
                                                '</div>';
                            $('#nom_complete_cont').append(nom_complete_html);
                            if (active_noms_cache){
                                active_noms_cache[data[i].id] = data[i];
                                if (active_nom_cats_map[data[i].nomination_category.replace(' ', '_').toLowerCase()]){
                                    active_nom_cats_map[data[i].nomination_category.replace(' ', '_').toLowerCase()].push(data[i].id);
                                }
                                else{
                                    active_nom_cats_map[data[i].nomination_category.replace(' ', '_').toLowerCase()] = [data[i].id];
                                }
                                if (my_feed){
                                    for (var k = 0; k < my_feed.length; k++){
                                        if (my_feed[k].cat_name == data[i].nomination_category){
                                            my_feed[k].noms.push(data[i]);
                                        }
                                    }
                                }
                            }
                            if (user_winning_noms_cache[selected_user]){
                                user_winning_noms_cache[selected_user].active_nom_objs.push(data[i]);
                            }
                            else{
                                user_winning_noms_cache[selected_user] = {'active_nom_objs': [data[i]], 'winning_nom_objs': []};
                                if (!user_winning_noms_cache[selected_user].winning_nom_objs){
                                    user_winning_noms_cache[selected_user].winning_nom_objs = [ ];
                                }
                            }
                            active_user_nom_cache[data[i].photo.fid] = {'cat': data[i].nomination_category,
                                                                        'nom_id': data[i].id};
                            $('#nominate_photo, #go_nom_detail').attr('id', 'go_nom_detail').attr('value', active_user_nom_cache[selected_photo].nom_id).text('Active');
                        }
                        
                        render_share_nom(data, comment_text);
                    });
                });
                if (typeof(_gaq) !== "undefined"){
                    _gaq.push(['_trackEvent', 'Post Nom', 'Click', '']);
                }
                $('#close_nom_success').removeClass().addClass('close_img ' + close_size);
            }
        });
        
        $('#close_nom_success').live('click', function(){
            if (!mobile){
                $('#nom_complete_cont').fadeOut('fast', function(){
                    $('.nom_complete_cat_cont').remove();
                });
                $('#nominate_photo, #go_nom_detail').fadeIn('fast');
            }
            else{
                $('#nom_complete_cont').hide();
                $('.nom_complete_cat_cont').remove();
                $('#nominate_photo, #go_nom_detail').show();
            }
            $('#new_nomination_cont li').removeClass('selected').addClass('unselected');
            $('.inactive').removeClass('inactive');
            if ($('#active_nominations #active_empty').is(':hidden')){
                $('#active_nominations #active_empty').show();
            }
            $('#active_nominations_cont').html('');
            $('#nomination_comment').text('Add a caption to this nomination.');
        });
        
        // $('#like_cont').die('mouseover mouseout');
        // $('#like_cont').live('mouseover mouseout', function(event) {
        //     if (event.type == 'mouseover') {
        //         show_like_tooltip(this);
        //     } else {
        //         hide_like_tooltip(this);
        //     }
        // });
        
        $('.photo_thumbs').live('click', photo_click_handler);
        
        // $('.like_photo').live('click', like_photo_handler);
        
        $('.upgrade_tooltip_cont').live('mouseover', function(){
            clearTimeout(upgrade_timeout);
        });
        
        $('.upgrade_tooltip_cont').live('mouseout', function(){
            upgrade_timeout = setTimeout(remove_tooltip_after, 3000);
        });
    }
    
    function render_share_nom(data, comment_text){
        var cat_underscore = '',
            trophy_count_text = 'trophies',
            nom_id = '',
            notification_ids = '',
            trophy_html = '',
            trophy_won_text = '',
            name = '',
            friend_name = '',
            reason_text = '',
            multiple_trophy_text = '';
            publish_story_html = '';
            
        name = me.name.split(' ')[0];
        nom_id = data[0].id;
        
        if (data[0].nominatee == me.id){
            friend_name = name;
            reason_text = 'Share your nomination with your friends.';
        }
        else{
            friend_name = friends[data[0].nominatee].name.split(' ')[0];
            reason_text = 'You nominated ' + friend_name + '\'s photo. Let them know on facebook.';
        }
        
        for (var i = 0; i < data.length; i++){
            cat_underscore = data[i].nomination_category.replace(' ', '_').toLowerCase();
            if (i+1 < data.length){
                multiple_trophy_text += data[i].nomination_category + ', ';
            }
            else{
                multiple_trophy_text += ' and ' + data[i].nomination_category;
            }
        }
        
        if (data.length == 1){
            trophy_count_text = 'trophy';
            if (data[0].nominatee == me.id){
                trophy_won_text = 'I nominated one of my photos for the ' + data[0].nomination_category + ' trophy';
            }
            else{
                trophy_won_text = name + ' nominated one of ' + friend_name + '\'s photos for the ' + data[0].nomination_category + ' trophy';
            }
            trophy_html = '<img src="http://portrit.s3.amazonaws.com/img/invite/' + cat_underscore + '.png"/>';
        }
        else{
            //Blank trophy
            if (data[0].nominatee == me.id){
                trophy_won_text = 'I nominated one of my photos for the ' + multiple_trophy_text + ' trophies';
            }
            else{
                trophy_won_text = name + ' nominated one of ' + friend_name + '\'s photos for the ' + multiple_trophy_text + ' trophies';
            }
            trophy_html = '<img src="http://portrit.s3.amazonaws.com/img/invite/blank.png"/>';
        }
        
        publish_story_html ='<div id="publish_story_cont">' +
                                '<h1>Share with your friends.</h1>' +
                                '<h2>' + reason_text + '</h2>' +
                                '<div id="story_cont">' +
                                    '<img src="https://graph.facebook.com/' + me.id + '/picture?type=square"/>' +
                                    '<textarea>' + comment_text + '</textarea>' +
                                '</div>' +
                                '<div id="story_preview">' +
                                    '<div id="preview_left">' +
                                        trophy_html +
                                        '<div id="preview_left_bottom">' +
                                            '<img src="http://portrit.s3.amazonaws.com/img/favicon.png"/>' +
                                            '<span>via Portrit</span>' +
                                            '<div class="clear"></div>' +
                                        '</div>' +
                                    '</div>' +
                                    '<div id="preview_right">' +
                                        '<a id="trophy_nom_text_link">' + trophy_won_text + '</a>' +
                                        '<span id="trophy_nom_text_caption">Click the trophy to see ' + friend_name + '\'s nominated photo.</span>' +
                                        '<p id="trophy_nom_text_desc">' + comment_text + '</p>' +
                                    '</div>' +
                                    '<div class="clear"></div>' +
                                '</div>' +
                            '</div>' +
                            '<div id="publish_controls">' + 
                                '<span class="awesome large" id="skip_publish">Skip</span>' +
                                '<span class="awesome large" id="publish_story">Share</span>' +
                                '<div class="clear"></div>' +
                            '</div>';;
        $('#context_overlay_cont').addClass('publish_story_overlay');
        $('#context_overlay_cont > div').append(publish_story_html);
        show_context_overlay(true);
        $('div#context_overlay').css('top', 260);
        
        $('#publish_story').bind('click', function(){
            var nom_ids = $(this).attr('value');
            var trophy_img_src = '';
            if (data.length == 1){
                trophy_img_src = 'http://portrit.s3.amazonaws.com/img/invite/' + cat_underscore + '.png';
            }
            else{
                trophy_img_src = 'http://portrit.s3.amazonaws.com/img/invite/blank.png';
            }
            var link = 'http://184.73.249.104/#/nom_id=' + data[0].id + '/ref=facebook';
            var name = $('#trophy_nom_text_link').text();
            var caption = $('#trophy_nom_text_caption').text();
            var description = $('#story_cont textarea').val();
            
            // $.post('https://graph.facebook.com/' + data[0].nominatee + '/feed', {'access_token': fb_session.access_token, 'picture': trophy_img_src, 'link': link, 'name': name, 'caption': caption}, function(response){
            //     var test = response;
            // });
            
            close_context_overlay();
            $('#nom_complete_cont').fadeIn();
            
            $('#story_cont textarea').unbind('focus');
            $('#story_cont textarea').unbind('blur');
            $('#story_cont textarea').unbind('keyup');
            $('#skip_publish').unbind('click');
            $('#publish_story').unbind('click');
            $('#close_overlay').unbind('click');
        });

        $('#skip_publish').bind('click', function(){
            close_context_overlay();
            $('#nom_complete_cont').fadeIn();
            
            $('#story_cont textarea').unbind('focus');
            $('#story_cont textarea').unbind('blur');
            $('#story_cont textarea').unbind('keyup');
            $('#skip_publish').unbind('click');
            $('#publish_story').unbind('click');
            $('#close_overlay').unbind('click');
        });
        
        $('#close_overlay').bind('click', function(){
            close_context_overlay();
            $('#nom_complete_cont').fadeIn();
            
            $('#story_cont textarea').unbind('focus');
            $('#story_cont textarea').unbind('blur');
            $('#story_cont textarea').unbind('keyup');
            $('#skip_publish').unbind('click');
            $('#publish_story').unbind('click');
            $('#close_overlay').unbind('click');
        })
        
        $('#story_cont textarea').bind('focus', function(){
            comment_form_shown = true;
        });
        
        $('#story_cont textarea').bind('blur', function(){
            comment_form_shown = false
        });

        $('#story_cont textarea').bind('keyup', function(){
            $('#preview_right p').text($(this).val());
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
        $('#post_nomination').text('Post Nomination').removeClass('awesome_hover_lock');
    }
    
    function append_wall_html(view_to_activate){
        var active_view_name = '',
            replace_view_name = '',
            active_view_text = '',
            replace_view_text = '',
            third_view_name = '',
            third_view_text = '',
            photo_upload_html = '';
        
        // if (!mobile){
        //     photo_upload_html = '<a class="awesome orange large" id="show_upload">Post Photo</a>';
        // }
        if (view_to_activate == 'recent'){
            active_view_name = 'latest_photos';
            replace_view_name = 'active_nominations';
            active_view_text = 'Latest Photos';
            replace_view_text = 'Active Nominations';
        }
        
        if ($('#main_view_control').length == 0){
            var view_control_html = '<div id="main_view_control">' +
                                        '<a id="friend_view" class="main_control awesome large">Friends</a>' +
                                        '<a id="wall_view" class="main_control awesome large main_control_active">Stream</a>' +
                                        '<a id="profile_view" class="main_control awesome large">Profile</a>' +
                                        photo_upload_html
                                    '</div>';
            $('#cont').prepend(view_control_html);
        }
        
        var wall_html = '<div id="profile_wrap">' +
                            '<div id="activate_recent_winners">Recent Winners</div>' +
                            '<div id="activate_latest_photos">Latest Photos</div>' +
                            '<ul>' +
                                '<h1 id="active_stream_view" name="' + active_view_name + '">' + active_view_text + '</h1>' +
                                '<div class="clear"></div>' +
                                '<div id="drop_down_cont" style="display:none;">' +
                                    '<li name="' + replace_view_name + '" class="activate_stream">' +
                                        '<h1>' + replace_view_text + '</h1>' +
                                    '</li>' +
                                    '<div class="clear"></div>' +
                                '</div>' +
                            '</ul>' +
                            '<div id="active_stream_text_cont" style="display:none;">' +
                                '<a id="top_noms" class="awesome large">Top</a>' +
                                '<a id="recent_noms" class="awesome large">Most Recent</a>' +
                            '</div>' +
                            '<div class="clear"></div>' +
                            '<div id="profile_cont_wrap">' +
                                '<div id="scroller">' +
                                    '<div id="profile_cont"></div>' +
                                '</div>' +
                            '</div>' + 
                        '</div>';
        $('#wall_cont').append(wall_html);
        
        if (stream_view == 'top_noms'){
            $('#top_noms').addClass('selected');
        }
        else{
            $('#recent_noms').addClass('selected');
        }
    }
    
    function clear_event_handles(){    
        $('.img_thumbs').die('click');
        $('.img_thumbs').die('mousedown');
        $('.clear_profile').die('click');
        $('.photo_thumbs').die('click');
        
        //Settings
        $('#clear_db').die('click');
        $('#allow_notifications').die('click');
        
        //Main
        $('.friend').die('click');
        $('.alpha_key_wall').die('click');
        // $('.like_cont').die('mouseover mouseout');
        // $('.like').die('mouseover mouseout');
        $('.friend').die('mousedown');
        // $('.text_wrapper').die('click');
        // $('.control_click').die('click');
        $('.profile_link').die('click');
        $('.photo_album').die('click');
        $('#load_more').die('click');
        
        //Info
        // $('#show_all_mutual').die('click');
        // $('#mutual_friend_cont a').die('mouseover mouseout');
        
        //Profile
        // clearInterval(update_feed_interval);
        $('#user_info_view').die('click');
        $('#user_photo_view').die('click');
        $('#user_wall_view').die('click');
        $('.comment, .comment_self').die('mouseover');
        $('.comment, .comment_self').die('mouseout');
        $('.add_comment_peek').die('click');
        $('.cancel_comment').die('click');
        $('.comment_body').die('focus');
        $('.comment_body').die('blur');
        $('.upgrade_tooltip_cont').die('mouseover');
        $('.upgrade_tooltip_cont').die('mouseout');
        $('.load_more_comments').die('click');
        $('.hide_more_comments').die('click');
        $('#profile_cont_wrap').unbind('scroll');
        $('.photo_post a').die('click');
        $('.photo_post img').die('click');
        $('.vote_up').die('click');
        $('.vote_down').die('click');
        $('.nom_photo_thumbnail').die('click');
        $('#profile_wrap  > ul > h1').die('mouseover mouseout');
        // $('.activate_stream').die('click');
        $('#activate_latest_photos').die('click');
        $('#activate_recent_winners').die('click');
        $('.voted_cont a, .new_photo_cont').die('mouseover mouseout');
        $('.new_photo_cont').die('click');
        $('.next_photo').die('click');
        $('.prev_photo').die('click');
        $('#close_upload, #cancel_upload').die('click');
        $('#show_upload').die('click');
        $('.kill_photo').die('click');
        $('.photo_caption').die('focus');
        $('.photo_caption').die('blur');
        $('#profile_nav_cont').die('click');
        $('.add_new_comment').die('click');
        $('.comment_body').die('focus');
        $('.comment_body').die('blur');
        $('.cancel_new_comment').die('click');
        $('.post_new_comment').die('click');
        $('#user_friends img').die('mouseover mouseout');
        $('#post_upload').die('click');
        $('#upload_photo_button').die('change');
        $('.winning_trophy_cont').die('mouseover mouseout');
        $('.trophy_album').die('click');
        // $('#portrit_friends_cont > a').die('mouseover mouseout');
        
        //Nom Detail
        $('.nom_photo_thumbnail').die('click');
        $('#add_new_comment').die('click');
        
        //list view
        $('.photo_thumbs').die('mousedown');
        $(window).unbind('scroll');
        // $('#next_album').die('click');
        // $('#prev_album').die('click');
        
        //Gallery view
        if (!mobile){
            $('#back_gallery, #back_gallery_mobile').die('click');
            $('#forward_gallery, #forward_gallery_mobile').die('click');
        }
        else{
            $('#back_gallery, #back_gallery_mobile').die('touchend');
            $('#forward_gallery, #forward_gallery_mobile').die('touchend');
        }
        $('.like_photo').die('click');
        $('#photo_large_inline_cont').die('click');
        $('#nominate_photo').die('click');
        $('#go_nom_detail').die('click');
        $('#cancel_nominate_photo, #cancel_nomination').die('click');
        $('#new_nomination_cont li').die('click');
        $('#nomination_comment').die('focus');
        $('#nomination_comment').die('blur');
        $('#post_nomination').die('click');
        $('.kill_nomination').die('click');
        $('#close_nom_success').die('click');
        
        if (mobile){
            $('.img_thumbs').die('touchstart');
            $('.img_thumbs').die('touchend');
            document.body.removeEventListener('touchmove', onTouchMove);
            document.body.removeEventListener('touchend', onTouchEnd);
            document.body.removeEventListener('touchstart', onTouchStart);
        }
        
        $(document).unbind('mouseup');
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
    
    function clear_canvas(url_vars){
        $('#wall_cont').html('');
        $('#canvas_cont').html('');
        $('#context_cont').html('');
        $('#friend_album_cont').html('');
        $('.photos_loading').remove();
        if (!url_vars.mobile_alpha){
           $('#main_view_control').remove(); 
        }
        $('#profile_wrap').remove();
        
        if (clear_profile){
            $(window).unbind('scroll');
            $('#profile_cont').html('');
            $('#album_cont').html('');
            user_profile = null;
            user_feed = null;
            clear_profile = false;
        }
        
        comment_form_shown = false;
        added_swipe_once = false;
        album_completed = false;
        initial_feed_load = true;
        user_feed = null;
        if (!mobile || view_active != 'gallery' || view_active != 'list'){
            high_photo_offset = 100;
        }
        
        $('#photo_list').css({
            'padding-top': '0',
            'margin-bottom': '0' 
        });
        
        $('#photo_cont').css({
            'min-height': ''
        });
        
        $('#friend_album_cont').css({'height': '', 'min-height': '', 'max-width': ''});
        $('#right_quick_nav').hide();
        $('#left_quick_nav').hide();
        $('#context_cont').hide();
        $('#new_nomination_wrap').hide();
        $('#title').hide();
        $('#title').html('');
        $('#top').hide();
        
        $('#login_loader').hide();
        
        if ((url_vars.gallery === undefined && url_vars.album === undefined) || url_vars.context !== undefined){
            $('#photo_cont').hide();
        }
    }
    
    var scroll_to_toggle = false;
    var photo_load_wait = null;
    var view_count = 0;
    function update_view(){     
        var url_vars = getUrlVars();
        var prev_active_view = view_active;
        view_count += 1;
        
        if ($('#context_overlay').is(':visible') && view_count > 1){
            $('#close_overlay').click();
        }
        if (view_count == 1){
            render_notifications(notification_data);
        }
        
        if (url_vars['recent-winners'] == undefined && url_vars['latest-photos'] == undefined){
            clear_event_handles();
        }
        
        if (view_active == 'main' || view_active == 'list'){
            push_scroll_pos();
            scroll_to_toggle = true;
        }
        
        if (url_vars.user !== undefined && url_vars.album === undefined && url_vars.gallery === undefined && url_vars.trophy == undefined && url_vars.nom_id == undefined){
            clear_canvas(url_vars);
            scroll_to_user = url_vars.user;
            if (scroll_to_user == me.id){
                default_view = 'profile';
                window.location.href = '#/';
            }
            else{
                main_photo_view();
            }
            $('html, body').scrollTop(0);
        }
        else if (url_vars.album !== undefined && url_vars.gallery === undefined){
            clear_canvas(url_vars);
            selected_album_id = url_vars.album;
            attach_list_handlers();
			$('#photo_cont').css({
                'max-width': ''
            });
            selected_photo = '';
            photo_list_view();
            if (scroll_to_toggle && prev_active_view == 'gallery'){
                pop_scroll_pos();
                scroll_to_toggle = false;
                scroll_to_user = null;
            }
        }
        else if (url_vars.gallery !== undefined){
            clear_canvas(url_vars);
            attach_gallery_handlers();
            $('#friend_album_cont').css({'height': '', 'min-height': ''});
            $('#photo_cont').css({
                'max-width': '1200px',
                'min-height': '680px',
                'margin': '0 auto'
            });
            $('#photo_large').css({
                'min-height': '400px'
            });
            selected_album_id = getUrlVars().album;
            
            if (url_vars.album !== 'video_album'){
                $('#photo_cont').show();
                if ($('#photo_list').children().length === 0){
                    $('#friend_cont').hide();
                    photo_list_view(true);
                    view_active = 'gallery';
                    $('#photo_cont').css('height', 'auto');
                    var user_name = '';
                    selected_user = url_vars.user;
                    if (selected_user == 'me'){
                        user_name = 'You';
                    }
                    else if (selected_user !== undefined && selected_user != '' && selected_user != undefined){
                        user_name = friends[selected_user].name.split(" ", 1)
                    }
                    $('#photo_list').append('<div id="album_link_loader"><h2>Loading ' + user_name + '\'s Albums...</h2><div id="loader"><img src="http://portrit.s3.amazonaws.com/img/album-loader-dark.gif"/></div></div>');
                    clearInterval(photo_load_wait);
                    photo_load_wait = setInterval(function(){
                        if (album_completed || url_vars.album == 'tagged'){
                            clearInterval(photo_load_wait);
                            if (selected_photo == ''){
                                selected_photo = $('.photo_thumbs:first > img').attr('id');
                                photo_id = selected_photo;
                            }
                            $('#album_link_loader').remove();
                            $('#title').hide();
                            $('#right_quick_nav').show().find('#top_quick_nav').attr('href', '#/user=' + selected_user + '/album=' + selected_album_id).text('To album');
                            $('#right_quick_nav').show().find('#bottom_quick_nav').attr('href', '#/user=' + getUrlVars().user).text('To profile →');
                            $('.photo_thumbs').show().css({'opacity': '0.6', 'position': 'absolute'});
                            reset_nomination_overlay();
                            photo_gallery_view();
                        }
                    }, 100);
                }
                else{
                    if (selected_photo == ''){
                        selected_photo = $('.photo_thumbs:first > img').attr('id');
                        photo_id = selected_photo;
                    }
                    $('.photo_thumbs').css({'position': 'absolute'});
                    $('#title').hide();
                    $('#right_quick_nav').show().find('#top_quick_nav').attr('href', '#/user=' + selected_user + '/album=' + selected_album_id).text('To album');
                    $('#right_quick_nav').show().find('#bottom_quick_nav').attr('href', '#/user=' + getUrlVars().user).text('To profile →');
                    $('.photo_thumbs').css({'opacity': '0.6'});
                    reset_nomination_overlay();
                    photo_gallery_view();
                }
            }
            else{
                $('#photo_cont').show();
                if ($('#photo_list').children().length === 0){
                    $('#friend_cont').hide();
                    photo_list_view();
                    view_active = 'gallery';
                    $('#photo_cont').css('height', 'auto');
                }
                if (selected_photo === ''){
                    selected_photo = $('.photo_thumbs:first > img').attr('id');
                    photo_id = selected_photo;
                }
                $('.photo_thumbs').css({'position': 'absolute'});
                $('.photo_thumbs').css({'opacity': '0.6'});
                reset_nomination_overlay();
                video_gallery_view();
            }
            $('html, body').scrollTop(0);
        }
        else if (url_vars.settings !== undefined){
            clear_canvas(url_vars);
            attach_settings_handlers();
            info_context_delagate('settings');
        }
        else if (url_vars.context !== undefined){
            clear_canvas(url_vars);
            info_context_delagate(url_vars.context);
        }
        else if (url_vars.upgrade !== undefined){
            clear_canvas(url_vars);
            attach_upgrade_handlers();
            render_upgrade(url_vars.upgrade);
        }
        else if (url_vars.tour !== undefined){
            clear_canvas(url_vars);
            render_tour();
        }
        else if (url_vars.alpha !== undefined){
            clear_canvas(url_vars);
            attach_alpha_handlers();
        }
        else if (url_vars.alpha_key !== undefined){
            clear_canvas(url_vars);
            attach_main_handlers();
            attach_profile_handlers();
            attach_mobile_alpha_handlers();
            render_alpha_wall(url_vars.alpha_key);
            $('html, body').scrollTop(0);
        }
        else if (url_vars.won !== undefined && url_vars.nom_id !== undefined && url_vars.user !== undefined){
            clear_canvas(url_vars);
            attach_nom_detail_handlers();
            if (typeof(_gaq) !== "undefined"){
                _gaq.push(['_trackEvent', 'User Nom Won', 'Shown', '']);
            }
            get_user_feed(nom_detail_view, 'temp');
            $('html, body').scrollTop(0);
        }
        else if (url_vars.won !== undefined && url_vars.nom_id !== undefined){
            clear_canvas(url_vars);
            attach_nom_detail_handlers();
            if (typeof(_gaq) !== "undefined"){
                _gaq.push(['_trackEvent', 'Nom Won', 'Shown', '']);
            }
            if (isEmpty(winners_feed) || winning_noms_cache[url_vars.nom_id] == undefined){
                get_user_feed(nom_detail_view, 'won');
            }
            else{
                nom_detail_view();
            }
            $('html, body').scrollTop(0);
        }
        else if (url_vars.nom_id !== undefined){
            clear_canvas(url_vars);
            attach_nom_detail_handlers();
            if (typeof(_gaq) !== "undefined"){
                _gaq.push(['_trackEvent', 'Nom Detail', 'Shown', '']);
            }
            if (isEmpty(active_noms_cache)){
                get_user_feed(nom_detail_view, 'user_stream');
            }
            else{
                nom_detail_view();
            }
            $('html, body').scrollTop(0);
        }
        else if (url_vars['recent-winners'] != undefined){
            $('html, body').scrollTop(0);
            $('#profile_cont').html('');
            if (prev_active_view == 'nom_detail' || prev_active_view == ''){
                $('#canvas_cont').html('');
                attach_main_handlers();
                attach_profile_handlers();
                $('#active_stream_text_cont').hide();
                append_wall_html('winners');
            }
            init_winners_view();
        }
        else if (url_vars['latest-photos'] != undefined){
            $('html, body').scrollTop(0);
            $('#profile_cont').html('');
            if (prev_active_view == 'gallery' || prev_active_view == ''){
                $('#photo_cont').html('').css({
                    'min-height': ''
                });
                $('#friend_cont').show();
                $('#active_stream_text_cont').hide();
                attach_main_handlers();
                attach_profile_handlers();
                append_wall_html('recent');
            }
            init_latest_photos();
        }
        else if (url_vars['trophy'] != undefined){
            clear_canvas(url_vars);
            attach_nom_detail_handlers();
            trophy_view(url_vars['cat']);
        }
        else if (default_view === 'friend'){
            clear_canvas(url_vars);
            attach_main_handlers();
            attach_profile_handlers();
            main_view();
            $('#friend_view').addClass('main_control_active');
            $('html, body').scrollTop(0);
        }
        else if (default_view === 'wall'){
            if (prev_active_view == 'latest_photos' || prev_active_view == 'winners_view'){
                $('#profile_cont').html('');
            }
            else{
                clear_canvas(url_vars);
            }
            attach_main_handlers();
            attach_profile_handlers();
            main_view();
            $('#wall_view').addClass('main_control_active');
            $('html, body').scrollTop(0);
        }
        else if (default_view === 'profile'){
            clear_canvas(url_vars);
            attach_main_handlers();
            attach_profile_handlers();
            main_view();
            $('#profile_view').addClass('main_control_active');
            $('html, body').scrollTop(0);
        }
        else{
            clear_canvas(url_vars);
            attach_main_handlers();
            attach_profile_handlers();
            main_view();
            if (scroll_to_toggle){
                var user = null;
                if (scroll_to_user != null && prev_active_view == 'alpha'){
                    var scroll_offset = ($(window).height() / 2) - 240;
                    user = $('.friend[value=' + scroll_to_user + ']');
                    scroll_pos_stack.push($(user).position().top - scroll_offset);
                }
                pop_scroll_pos(user);
                scroll_to_toggle = false;
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
