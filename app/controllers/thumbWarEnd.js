var args = arguments[0] || {};
console.log(args);

$.finishMsg.text = "You lost the thumb war! You just gave " + args.building.name + " to " + args.player1.user.facebook.name + "!";

// console.log(args.player1.user.facebook.name);
// console.log(args.player1.count);
// console.log(Ti.App.Properties.getObject("currentUser").facebook.name);
// console.log(args.player2.count);
// 
$.player1_name.text = args.player1.user.facebook.name;
$.player1_score.text = args.player1.count;
$.player2_name.text = Ti.App.Properties.getObject("currentUser").facebook.name;
$.player2_score.text = args.player2.count;

$.backToGame.addEventListener("click", function(){
    Ti.App.fireEvent("endThumbWar");
    $.thumbWarEnd.close();
});
