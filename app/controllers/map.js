var Map = require("ti.map");
var map = Map.createView();
var currentPlaces = [];
var selectedPlace;

$.user.text = Ti.App.Properties.getObject("currentUser").facebook.name;
$.userDough.text = Ti.App.Properties.getObject("currentUser").dough.toLocaleString({currency:"USD"});

checkForPendingWars();

var panel = Ti.UI.createView({
    height : "200dp",
    bottom : "-200dp",
    backgroundColor : "#c9d7cb"
});

var topBorder = Ti.UI.createView({
    top: 0,
    height:"1dp",
    width: "100%",
    backgroundColor: "#000000"
});

panel.add(topBorder);

var placeTitle = Ti.UI.createLabel({
    width: "90%",
    textAlign: Ti.UI.TEXT_ALIGNMENT_CENTER,
    top : 10,
    font : {
        fontFamily: "RadiantAntiqueRegular",
        fontSize : 25
    }
});
var placeCost = Ti.UI.createLabel({
    top : 50,
    font : {
        fontSize : 20
    }
});
var placeTax = Ti.UI.createLabel({
    top : 80,
    font : {
        fontSize : 20
    }
});

var placeOwner = Ti.UI.createLabel({
    left: "30dp",
    bottom : "30dp",
    font : {
        fontSize : 15
    },
    visible: false
});

var buyButton = Ti.UI.createButton({
    title : "Buy",
    color: "#ffffff",
    font: {
        fontSize: 20,
        fontColor: "#000000",
        fontWeight: "bold"
    },
    width : "80%",
    height : "55dp",
    borderColor : "#000",
    borderRadius: "5dp",
    backgroundColor: "#253f21",
    bottom: 10
});

var thumbImg = Ti.UI.createButton({
    title : "Thumb War",
    color: "#ffffff",
    font: {
        fontSize: 20,
        fontColor: "#000000",
        fontWeight: "bold"
    },
    width : "50%",
    height : "55dp",
    borderColor : "#000",
    borderRadius: "5dp",
    backgroundColor: "#253f21",
    bottom: 10,
    right: 20
});

buyButton.addEventListener("click", function() {
    var url = Alloy.CFG.api.path + "/locations";
    var xhr = Ti.Network.createHTTPClient({
        onload : function(e) {
            alert("Purchased!");
            closeDetailPanel();
            //map.fireEvent("regionchanged");
        },
        onerror : function(e) {
            console.log(this.responseText);
        }
    });

    xhr.open("POST", url);
    xhr.setRequestHeader("Content-type", "application/json");
    xhr.send(JSON.stringify({
        facebook_id : Ti.App.Properties.getObject("currentUser").facebook.id,
        building : selectedPlace
    }));
});

thumbImg.addEventListener("click", function() {
    var war = Alloy.createController("thumbWar", {player2: selectedPlace.owner, building:selectedPlace}).getView();
    war.open();
});

panel.add(placeTitle);
panel.add(placeCost);
panel.add(placeTax);
panel.add(buyButton);
panel.add(placeOwner);
panel.add(thumbImg)

function doClick(e) {
    alert(e);
}

function getPlacesAtLocation(location) {

    currentPlaces = [];

    //remove all annotations

    map.removeAllAnnotations();

    var center = [location.latitude, location.longitude];
    var radius = location.latitudeDelta * 69;

    var url = Alloy.CFG.api.path + "/locations?center=" + center[0] + "," + center[1] + "&radius=" + radius;
    var xhr = Ti.Network.createHTTPClient({
        onload : function(e) {
            var response = JSON.parse(this.responseText);
            response.forEach(function(venue, i) {
                venue.cost = venue.stats.checkinsCount * 5000;
                currentPlaces.push(venue);

                var annotationOpts = {
                    latitude : venue.location.lat,
                    longitude : venue.location.lng,
                    title : "$" + venue.cost,
                    id : i,
                    pincolor : Map.ANNOTATION_PURPLE
                }

                if (venue.isOwned) {
                    annotationOpts.pincolor = Map.ANNOTATION_GREEN
                }
                map.addAnnotation(annotationOpts);
            });
        },
        onerror : function(e) {
            console.log(this.responseText);
        }
    });

    xhr.open("GET", url);
    xhr.setRequestHeader("Content-type", "application/json");
    xhr.send();
}

map.addEventListener("regionchanged", function(e) {
    getPlacesAtLocation(e);
});

map.addEventListener("click", function(e) {

    populatePlaceDetails(currentPlaces[e.annotation.id]);

    if (panel.bottom != 0) {
        $.userHUD.hide();
        openDetailPanel();
    }

    if (e.clicksource == "annotation") {
        $.userHUD.show();
        closeDetailPanel();
    }

});

function openDetailPanel() {
    var showAnimation = Ti.UI.createAnimation();
    showAnimation.bottom = 0;
    showAnimation.duration = 100;
    panel.animate(showAnimation);
}

function closeDetailPanel() {
    var hideAnimation = Ti.UI.createAnimation();
    hideAnimation.bottom = "-200dp";
    hideAnimation.duration = 100;
    panel.animate(hideAnimation);
}

function populatePlaceDetails(place) {
    buyButton.show();
    placeOwner.hide();
    thumbImg.hide();
    selectedPlace = place;
    try{
        placeTitle.text = place.name;
        placeCost.text = place.stats.checkinsCount * 5000;
        placeCost.text = placeCost.text.toLocaleString("currency");
        placeTax.text = (place.stats.checkinsCount * 5000) * .01
    }catch(e){
        
    }

    if (selectedPlace && selectedPlace.isOwned) {
        buyButton.hide();
        placeOwner.show();
        thumbImg.show();
        console.log("THIS PLACES IS FUCKING PWNED");
        placeOwner.text = selectedPlace.owner.facebook.name;
    }
    
}

Ti.Geolocation.getCurrentPosition(function(location) {
    Alloy.Globals.currentLocation = {
        lat : location.coords.latitude,
        lng : location.coords.longitude
    }

    //logNearbyPlaces(Alloy.Globals.currentLocation);

    //$.root.open();

    map.mapType = Map.NORMAL_TYPE;
    map.region = {
        latitude : Alloy.Globals.currentLocation.lat,
        longitude : Alloy.Globals.currentLocation.lng,
        latitudeDelta : 0.005,
        longitudeDelta : 0.005
    }

    getPlacesAtLocation(map.region);

    $.root.add(map);
    $.root.add(panel);
});

// function logNearbyPlaces(location) {
    // var url = Alloy.CFG.api.path + "/locations?nearby=" + location.longitude + "," + location.latitude;
    // var xhr = Ti.Network.createHTTPClient({
        // onload : function(e) {
            // var response = JSON.parse(this.responseText);
            // response.response.venues.forEach(function(venue, i) {
                // venue.cost = venue.stats.checkinsCount * 5000;
                // currentPlaces.push(venue);
                // map.addAnnotation({
                    // latitude : venue.location.lat,
                    // longitude : venue.location.lng,
                    // title : "$" + venue.cost,
                    // id : i
                // });
            // });
        // },
        // onerror : function(e) {
            // console.log(this.responseText);
        // }
    // });
// 
    // xhr.open("GET", url);
    // xhr.send();
// }

function getStreetView(address) {
    //pending
}

function checkForPendingWars(){
    var url = Alloy.CFG.api.path + "/games?user=" + Ti.App.Properties.getObject("currentUser")._id;
    var xhr = Ti.Network.createHTTPClient({
        onload : function(e) {
            var response = JSON.parse(this.responseText);
            if(response.length > 0){
                var win = Alloy.createController("pendingThumbWars",response).getView();
                win.open();
            }
        },
        onerror : function(e) {
            console.log(this.responseText);
        }
    });

    xhr.open("GET", url);
    xhr.send();
}
