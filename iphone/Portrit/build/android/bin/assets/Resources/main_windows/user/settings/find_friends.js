var win = Ti.UI.currentWindow;
var tv = null;
    
window_nav_bar = Titanium.UI.createView({
    backgroundImage: '../../../images/iphone_header_blank.png',
    width: 320,
    height: 40,
    top: 0
});

var back = Ti.UI.createButton({
	title:"Back",
	font: {fontSize: 12, fontWeight: 'bold'},
	backgroundImage: '../../../images/back.png',
	width: 68,
	height: 32,
    left: 0
});

back.addEventListener('click', function(){
    win.close();
});

window_nav_bar.add(back);

var header_label = Titanium.UI.createLabel({
        text: 'Find Friends',
        color: '#fff',
        textAlign: 'center',
        font:{fontSize:22, fontWeight: 'bold'}
    });
window_nav_bar.add(header_label);
win.add(window_nav_bar);

tv = Ti.UI.createTableView({
        backgroundColor: '#eee',
        top: 40,
        style:Titanium.UI.iPhone.TableViewStyle.GROUPED
    });

tv.addEventListener('click', function(e){

});

win.add(tv);

Ti.include('../../../settings.js');
Ti.include('../../../includes.js');

var me = JSON.parse(Ti.App.Properties.getString("me")),
    user = null,
    window_nav_bar = null,
    back_buttom = null,
    button_label = null,
    name = '';
    
function init_find_friends(){
    var data = [ ];
    var section = Titanium.UI.createTableViewSection({ });
    
    // var row = Ti.UI.createTableViewRow({
    //         hasChild: true,
    //         title: 'From my contacts',
    //         color: '#333',
    //         font:{fontSize: 18, fontWeight: 'bold'},
    //         backgroundColor: '#fff',
    // });
    // row.addEventListener('click', function(){
    //     var win = Ti.UI.createWindow({backgroundColor:"#eee", url:'find/follow.js'});
    //     Titanium.UI.currentTab.open(win,{animated:true});
    //     
    //     setTimeout(function(){
    //      Ti.App.fireEvent('find_type', {
    //             find_type: 'contacts'
    //         });
    //  }, 200);
    // });
    // section.add(row);
    
    var row = Ti.UI.createTableViewRow({
            hasChild: true,
            title: 'Twitter friends',
            color: '#333',
            font:{fontSize: 18, fontWeight: 'bold'},
            backgroundColor: '#fff',
    });
    row.addEventListener('click', function(){
        var win = Ti.UI.createWindow({backgroundColor:"#eee", url:'find/follow.js'});
        Titanium.UI.currentTab.open(win,{animated:true});
        
        setTimeout(function(){
    	    Ti.App.fireEvent('find_type', {
                find_type: 'twitter'
            });
    	}, 200);
    });
    section.add(row);
    
    var row = Ti.UI.createTableViewRow({
            hasChild: true,
            title: 'Search names',
            color: '#333',
            font:{fontSize: 18, fontWeight: 'bold'},
            backgroundColor: '#fff',
    });
    row.addEventListener('click', function(){
        var win = Ti.UI.createWindow({backgroundColor:"#eee", url:'search_portrit.js'});
        Titanium.UI.currentTab.open(win,{animated:true});
    });
    section.add(row);
    data.push(section);
    
    var section = Titanium.UI.createTableViewSection({ });
    
    var row = Ti.UI.createTableViewRow({
            hasChild: true,
            title: 'The cool kids',
            color: '#333',
            font:{fontSize: 18, fontWeight: 'bold'},
            backgroundColor: '#fff',
    });
    row.addEventListener('click', function(){
        var win = Ti.UI.createWindow({backgroundColor:"#eee", url:'find/follow.js'});
        Titanium.UI.currentTab.open(win,{animated:true});
        
        setTimeout(function(){
    	    Ti.App.fireEvent('find_type', {
                find_type: 'cool'
            });
    	}, 200);
    });
    section.add(row);
    data.push(section);
    
    tv.setData(data);
}
init_find_friends();