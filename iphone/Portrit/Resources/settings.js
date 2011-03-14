var RUNTIME = "local",
    SERVER_URL = '',
    VERSION = '1.0.0';
    
if (RUNTIME == 'production'){
    SERVER_URL = 'http://portrit.com';
}
else{
    SERVER_URL = 'http://192.168.1.126:8080';
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

function getOrdinal(n) {
   var s=["th","st","nd","rd"],
       v=n%100;
   return n+(s[(v-20)%10]||s[v]||s[0]);
}