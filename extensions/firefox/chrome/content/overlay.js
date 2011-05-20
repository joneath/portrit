portrit = {

    portrit_url: "http://www.portrit.com/tools/share?source=",

    init: function() {
        window.removeEventListener("load", portrit.init, false);
        document.getElementById("contentAreaContextMenu").addEventListener("popupshowing", portrit.Context, false);
    },

    Context : function() {
        var menuitem1 = document.getElementById("portrit-imagen");
        menuitem1.hidden = !gContextMenu.onImage;
    },
    subir : function() {
        var image_url = gContextMenu.imageURL;
        source_query = ""
        
        source_url = getBrowser().contentWindow.location.href;
        
        if(source_url == image_url)
        {
          path_array = source_url.split('/');
          source_url = path_array[0] + "//" + path_array[2];
        }
        
        if (source_url) {
            source_query = "&page_url=" + escape(source_url);
        }

        var win = window.open(portrit.portrit_url + escape(image_url) + source_query + '&from=firefox', "Share on Portrit", "toolbar=yes,location=yes,directories=yes,status=yes,menubar=yes,scrollbars=yes,copyhistory=yes,resizable=yes");
    },
};

window.addEventListener("load", portrit.init, false);
