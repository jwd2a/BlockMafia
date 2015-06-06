var args = arguments[0] || {};
var tapCount = 0;

Ti.App.addEventListener("endThumbWar", function(){
    $.thumbWar.close();
});

$.buildingName.text = args.name;
$.buildingValue.text = args.cost;

$.start.addEventListener("click", function() {
    $.instructions.hide();
    $.countdown.show();
    countdown(3, $.counter, function() {
        $.countdown.hide();
        $.tapSurface.show();

        //start timing
        $.tapSurface.addEventListener("touchstart", function() {
            console.log("clicked");
            tapCount++;
        });

        countdown(1, $.timer, function() {
            $.tapSurface.removeEventListener("touchstart", function() {
                tapCount++;
            });
            
            var url = "http://localhost:9000/api/games";
            var xhr = Ti.Network.createHTTPClient({
                onload : function(e) {
                  Alloy.createController("thumbWarEnd").getView().open();   
                },
                onerror : function(e) {
                    console.log(this.responseText);
                }
            });

            xhr.open("POST", url);
            xhr.setRequestHeader("Content-type", "application/json");
            xhr.send(JSON.stringify({
                player1 : {
                    user: Ti.App.Properties.getObject("currentUser")._id,
                    count: tapCount
                }
            }));
        });
    });

});

function countdown(num, el, callback) {
    if (num >= 1) {
        setTimeout(function() {
            el.text = num - 1;
            countdown(num - 1, el, callback);
        }, 1000)
    } else {
        callback();
    }
}
