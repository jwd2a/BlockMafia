var fb = require('facebook');

if (!fb.loggedIn) {
    var login = Alloy.createController("login").getView();
    login.open();
}else{
    var map = Alloy.createController("map").getView();
    map.open();
}

