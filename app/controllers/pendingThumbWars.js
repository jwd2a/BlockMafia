var args = arguments[0] || {};

args.forEach(function(game){
    
    var gameTile = Ti.UI.createView({
       height: "60dp",
       width: "90%",
       borderRadius: "5dp",
       borderColor: "#333333", 
       top: 3,
       color: "#ffffff",
       backgroundColor: "#ffffff"
    });
    
    var playerName = Ti.UI.createLabel({
        text: game.player1.user.facebook.name,
        font: {
            fontSize: 25
        }
    });
    
    gameTile.add(playerName);
    
    gameTile.addEventListener("click", function(){
       var war = Alloy.createController("thumbWar", {status:"pending", player1:game.player1, building:game.building}).getView();
       war.open();
       $.pendingThumbWars.close(); 
    });
    
    $.wars.add(gameTile);
    
});
