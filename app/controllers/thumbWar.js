var args = arguments[0] || {};
var tapCount = 0;

console.log("Building: "+args.building);

if(args.status == "pending"){
    $.challengeText.text = "You've been challenged by " + args.player1.user.facebook.name + "!"; 
}else{
    $.challengeText.text = "You're challenging " + args.player2.facebook.name + " to a thumb war!";
}

Ti.App.addEventListener("endThumbWar", function(){
    $.thumbWar.close();
});

$.buildingName.text = args.building.name;
$.buildingValue.text = args.building.cost;

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

        countdown(10, $.timer, function() {
            $.tapSurface.removeEventListener("touchstart", function() {
                tapCount++;
            });
            
            alert("You're a boss! Taps: " + tapCount);
            
            var payload = {};
            
            if(!args.status){
                payload.player1 = {
                    user: Ti.App.Properties.getObject("currentUser"),
                    count: tapCount
                }
                payload.building = args.building;
                payload.status = "pending";
            }else{
                payload.player1 = {
                    user: args.player1.user,
                    count: args.player1.count
                }
                payload.player2 = {
                    user: Ti.App.Properties.getObject("currentUser"),
                    count: tapCount
                }
                payload.status = "finished";
                payload.building = args.building;
            }
            
            console.log(payload);
           
            var url = Alloy.CFG.api.path + "/games";
            var xhr = Ti.Network.createHTTPClient({
                onload : function(e) {
                  Alloy.createController("thumbWarEnd",payload).getView().open();   
                },
                onerror : function(e) {
                    console.log(this.responseText);
                }
            });

            xhr.open("POST", url);
            xhr.setRequestHeader("Content-type", "application/json");
            xhr.send(JSON.stringify(payload));
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
