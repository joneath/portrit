Ti.App.addEventListener('pass_votes', function(eventData) {
    votes = eventData.votes;

    init_votes();
});

Ti.include('../../settings.js');
Ti.include('../../includes.js');

var win = Ti.UI.currentWindow,
    tv = null,
    me = JSON.parse(Ti.App.Properties.getString("me")),
    votes = null;

window_nav_bar = Titanium.UI.createView({
    backgroundImage: '../../images/iphone_header_blank.png',
    width: 320,
    height: 40,
    top: 0
});

back_buttom = Titanium.UI.createButton({
    width: 68,
    height: 32,
    left: 0,
    title: 'Back',
    font: {fontSize: 11, fontWeight: 'bold'},
    backgroundImage: '../../images/back.png'
});

back_buttom.addEventListener('click', function(){
    win.close();
});

window_nav_bar.add(back_buttom);

var votes_label = Titanium.UI.createLabel({
        text: 'Votes',
        backgroundImage: '../images/iphone_header_blank.png',
        color: '#fff',
        textAlign: 'center',
        top: 0,
        width: 320,
        height: 40,
        font:{fontSize:22, fontWeight: 'bold'}
    });


window_nav_bar.add(votes_label);

win.add(window_nav_bar);

function add_profile_window(e){
    var w = Ti.UI.createWindow({backgroundColor:"#222", url:'../user/profile.js'});
	Titanium.UI.currentTab.open(w,{animated:true});
	
	setTimeout(function(){
	    Ti.App.fireEvent('pass_user', {
            user: e.source.user,
            name: e.source.name,
            username: e.source.username
        });
	}, 200);
}

var get_profile_image = function(user, name, username){
    var user = user;
    var name = name;
    var user_profile_image = null;
    return {
        get_high_crop: function(cont){
            user_profile_image = Ti.UI.createImageView({
        		image: '../../images/photo_loader.png',
        		borderColor: '#444',
        		borderWidth: 3,
        		borderRadius: 3,
        		hires: true,
        		height: 80,
        		width: 80
        	});

        	var xhr = Titanium.Network.createHTTPClient();
            xhr.onload = function(){
                cont.remove(user_profile_image);
                user_profile_image = Ti.UI.createImageView({
                    image: this.location,
                    defaultImage: '../../images/photo_loader.png',
                    borderColor: '#444',
            		borderWidth: 3,
            		borderRadius: 3,
                    hires: true,
                    height: 80,
                    width: 80
                });
                user_profile_image.name = name;
                user_profile_image.user = user;
                user_profile_image.username = username;
                
                cropImage(user_profile_image,150,150,20,20);
                cont.add(user_profile_image);
            };
            var url = 'https://graph.facebook.com/' + user + '/picture?type=large';
            xhr.open('GET', url);
            xhr.send();

            return user_profile_image;
        }
    };
};

function init_votes(){
    var votes_count = 0;
    var votes_data = [ ];
    for (var i = 0; i < votes.length; i++){
        if (i % 3 == 0){
            var row = Ti.UI.createTableViewRow({
                    height:'auto',
                    selectionStyle: Titanium.UI.iPhone.TableViewCellSelectionStyle.NONE
            });
            votes_count = 0;
            votes_data.push(row);
        }
        
        var user_cont = Ti.UI.createView({
        	width: 100,
        	height: 120,
        	left: (votes_count * 100) + 10
        });
        user_cont.user = votes[i].vote_user;
        user_cont.name = votes[i].vote_name;
        user_cont.username = votes[i].vote_username;
        user_cont.addEventListener('click', add_profile_window);
        
        var user_profile_image = get_profile_image(votes[i].vote_user, votes[i].vote_name, votes[i].vote_username).get_high_crop(user_cont);
    	user_profile_image.user = votes[i].vote_user;
        user_profile_image.name = votes[i].vote_name;
        user_profile_image.username = votes[i].vote_username;
    	user_cont.add(user_profile_image);
    	
    	var voter_name = votes[i].vote_username.split(' ')[0];
    	
    	if (votes[i].vote_user == me.fid){
    	    voter_name = 'You';
    	}
    	
    	var user_name = Titanium.UI.createLabel({
    	    text: voter_name,
            color: '#333',
            height: 'auto',
            width: 'auto',
            top: 105,
            font:{fontSize:12, fontWeight: 'bold'}
        });
        user_name.user = votes[i].vote_user;
        user_name.name = votes[i].vote_name;
        user_name.username = votes[i].vote_username;
        user_cont.add(user_name);
        
        row.add(user_cont);
        
        votes_count += 1;
    }
    tv.setData(votes_data);
}

tv = Ti.UI.createTableView({
        backgroundColor: '#ddd',
        separatorStyle: 0,
        top: 40,
        style: Titanium.UI.iPhone.TableViewStyle.PLAIN
    });
    
tv.addEventListener('click', function(e){

});
win.add(tv);