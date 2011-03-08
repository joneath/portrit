Ti.include('../../settings.js');
Ti.include('../../includes.js');

var win = Ti.UI.currentWindow,
    tv = null,
    me = JSON.parse(Ti.App.Properties.getString("me")),
    nom_id = null,
    cat = null,
    user = null,
    won = false,
    selected_nom = null,
    noms_in_cat = null,
    window_nav_bar = null,
    back_buttom = null,
    button_label = null,
    list_view_data = [ ],
    view_active = 'photos';

window_nav_bar = Titanium.UI.createView({
    backgroundImage: '../../images/iphone_header_blank.png',
    width: 320,
    height: 40,
    top: 0
});

back_buttom = Titanium.UI.createButton({
    width: 68,
    height: 32,
    left: 5,
    title: 'Profile',
    font: {fontSize: 11, fontWeight: 'bold'},
    backgroundImage: '../../images/back.png'
});

back_buttom.addEventListener('click', function(){
    win.close();
});

window_nav_bar.add(back_buttom);

win.add(window_nav_bar);

function init_detail_view(){
    var xhr = Titanium.Network.createHTTPClient();
    var url = '';
    var detail_header_text = '';
    if (!won){
        xhr.onload = function()
        {
            var data = JSON.parse(this.responseData);
            selected_nom = data.selected_nom;
            noms_in_cat = data.noms_in_cat;

            var nom_cat_underscore = selected_nom.nomination_category.replace(' ', '_').toLowerCase();
            var nom_cat_color = get_nom_cat_color(nom_cat_underscore);

            detail_header_text = 'Active ' + selected_nom.nomination_category + ' Photos';

            var detail_header = Titanium.UI.createView({
                height: 40,
                left: 65,
                width: 240
            });

            var nom_cat_label = Titanium.UI.createLabel({
        	    text: detail_header_text,
                textAlign: 'left',
                color: '#fff',
                height: 'auto',
                width: 'auto',
                opacity: 0,
                minimumFontSize: 14,
                font:{fontSize: 16, fontWeight: 'bold'}
            });
            detail_header.add(nom_cat_label);

            window_nav_bar.add(detail_header);
            
            var lable_animation = Titanium.UI.createAnimation({
                curve: Ti.UI.ANIMATION_CURVE_EASE_IN,
                opacity: 1,
                duration: 200
            });

            nom_cat_label.animate(lable_animation);
        };
        url = SERVER_URL + '/api/get_noms_in_cat/?fb_user=' + me.fid + '&nom_id=' + nom_id;
    }
    else{
        xhr.onload = function()
        {
            var data = JSON.parse(this.responseData);
            
            var nom_cat_underscore = cat.replace(' ', '_').toLowerCase();
            var nom_cat_color = get_nom_cat_color(nom_cat_underscore);

            detail_header_text = 'Winning ' + cat + ' Photos';

            var detail_header = Titanium.UI.createView({
                height: 40,
                left: 65,
                width: 240
            });

            var nom_cat_label = Titanium.UI.createLabel({
        	    text: detail_header_text,
                textAlign: 'left',
                color: '#fff',
                height: 'auto',
                width: 'auto',
                opacity: 0,
                minimumFontSize: 14,
                font:{fontSize: 16, fontWeight: 'bold'}
            });
            detail_header.add(nom_cat_label);

            window_nav_bar.add(detail_header);
            
            var lable_animation = Titanium.UI.createAnimation({
                curve: Ti.UI.ANIMATION_CURVE_EASE_IN,
                opacity: 1,
                duration: 200
            });

            nom_cat_label.animate(lable_animation);
        };
        
        url = SERVER_URL + '/api/get_user_wins_trophy_cat/?fb_user=' + user + '&nom_cat=' + cat;
    }

    xhr.open('GET', url);

    // send the data
    xhr.send();
}

Ti.App.addEventListener('pass_detail', function(eventData) {
    nom_id = String(eventData.nom_id);
    won = eventData.won;
    if (won == 1){
        won = true;
        cat = String(eventData.cat);
        user = String(eventData.user);
    }
    
    init_detail_view(false);
});