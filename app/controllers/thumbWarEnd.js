var args = arguments[0] || {};

$.backToGame.addEventListener("click", function(){
    Ti.App.fireEvent("endThumbWar");
    $.thumbWarEnd.close();
});
