var args = arguments[0] || {};

alert("API " + Alloy.CFG.api.path);

var fb = require('facebook');
fb.permissions = ['email'];
fb.appid = "584600665012442";

fb.addEventListener("login", function(e) {
    if (e.success) {
        var url = Alloy.CFG.api.path + "/users";
        var xhr = Ti.Network.createHTTPClient({
            onload : function(e) {
                Ti.App.Properties.setObject("currentUser", JSON.parse(this.responseText));
                var map = Alloy.createController("map").getView();
                map.open();
            },
            onerror : function(e) {
                console.log(this.responseText);
            }
        });
        
        xhr.open("POST", url);
        xhr.setRequestHeader("Content-type", "application/json");
        xhr.send(JSON.stringify({
            email: e.data.email,
            facebook: e.data
        }));
    }
});

$.fb_login.addEventListener("click", function() {
    fb.authorize();
});

//fb.initialize(1000);