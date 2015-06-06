var Map = require("ti.map");
var map = Map.createView();
var currentPlaces = [];
var selectedPlace;

var panel = Ti.UI.createView({
        height: "200dp",
        bottom: "-200dp",
        backgroundColor: "#FFF",
        layout: "vertical"
});

var placeTitle = Ti.UI.createLabel({
    top: 10,
    font: {
        fontSize: 25
    } 
});
var placeCost = Ti.UI.createLabel({
    top: 10,
    font: {
        fontSize: 15
    } 
});
var placeTax = Ti.UI.createLabel({
    top: 10,
    font: {
        fontSize: 15
    } 
});
var buyButton = Ti.UI.createButton({
    title: "Buy",
    width: "80%",
    height: "45dp",
    borderColor: "#000"
});

var thumbImg = Ti.UI.createButton({
    title: "Thumb War",
    width: "80%",
    height: "45dp",
    borderColor: "#000"
});

buyButton.addEventListener("click", function(){   
    var url = "http://localhost:9000/api/locations";
    var xhr = Ti.Network.createHTTPClient({
        onload: function(e){
        },
        onerror: function(e){
          console.log(this.responseText);
        }
    });
    
    xhr.open("POST", url);
    xhr.setRequestHeader("Content-type", "application/json");
    xhr.send(JSON.stringify({
      facebook_id: Ti.App.Properties.getObject("currentUser").facebook.id,
      building: selectedPlace
    }));
});

thumbImg.addEventListener("click", function(){
   var war = Alloy.createController("thumbWar", selectedPlace).getView();
   war.open();
});



panel.add(placeTitle);
panel.add(placeCost);
panel.add(placeTax);
panel.add(buyButton);
panel.add(thumbImg);

function doClick(e) {
    alert(e);
}

function getPlacesAtLocation(location){
    
    currentPlaces = [];
    
    //remove all annotations
    
    map.removeAllAnnotations();
    
    var center = [location.latitude, location.longitude];
    var radius = location.latitudeDelta*69;
     
    var url = "https://api.foursquare.com/v2/venues/search?ll="+center[0]+","+center[1]+"&radius="+radius+"&client_id="+Alloy.CFG.foursquare.client_id+"&client_secret="+Alloy.CFG.foursquare.client_secret+"&v=20150601";
    var xhr = Ti.Network.createHTTPClient({
        onload: function(e){
            var response = JSON.parse(this.responseText);
            response.response.venues.forEach(function(venue, i){
              venue.cost = venue.stats.checkinsCount * 5000;
              currentPlaces.push(venue);
              map.addAnnotation({
                 latitude: venue.location.lat,
                 longitude: venue.location.lng,
                 title: "$" + venue.cost,
                 id: i
              });
            });        
        },
        onerror: function(e){
            console.log(this.responseText);
        }
    });
    
    xhr.open("GET", url);
    xhr.setRequestHeader("Content-type", "application/json");
    xhr.send();
}

map.addEventListener("regionchanged", function(e){   
    getPlacesAtLocation(e);     
});

map.addEventListener("click", function(e){
     
    populatePlaceDetails(currentPlaces[e.annotation.id]);
    
    var showAnimation = Ti.UI.createAnimation();
        showAnimation.bottom = 0;
        showAnimation.duration = 100; 
        
    var hideAnimation = Ti.UI.createAnimation();
        hideAnimation.bottom = "-200dp";
        hideAnimation.duration = 100;
    
    if(panel.bottom != 0){       
        panel.animate(showAnimation);
    }
     
    if(e.clicksource == "annotation"){
        panel.animate(hideAnimation);
    }

});

function populatePlaceDetails(place){
   selectedPlace = place; 
   placeTitle.text = place.name; 
   placeCost.text = place.stats.checkinsCount * 5000;
   placeTax.text = (place.stats.checkinsCount * 5000)*.01;
}

Ti.Geolocation.getCurrentPosition(function(location){
    Alloy.Globals.currentLocation = {
        lat: location.coords.latitude,
        lng: location.coords.longitude
    }
    
    logNearbyPlaces(Alloy.Globals.currentLocation);
    
    //$.root.open();
    
    map.mapType = Map.NORMAL_TYPE;
    map.region = {
      latitude: Alloy.Globals.currentLocation.lat,
      longitude: Alloy.Globals.currentLocation.lng,
      latitudeDelta: 0.005,
      longitudeDelta: 0.005
    }
    
    getPlacesAtLocation(map.region);
     
    $.root.add(map);    
    $.root.add(panel);
});

function logNearbyPlaces(location){
    var url = "http://localhost:9000/api/locations?nearby="+location.longitude+","+location.latitude;
    var xhr = Ti.Network.createHTTPClient({
        onload: function(e){
            var response = JSON.parse(this.responseText);
            response.response.venues.forEach(function(venue, i){
              venue.cost = venue.stats.checkinsCount * 5000;
              currentPlaces.push(venue);
              map.addAnnotation({
                 latitude: venue.location.lat,
                 longitude: venue.location.lng,
                 title: "$" + venue.cost,
                 id: i
              });
            });        
        },
        onerror: function(e){
            console.log(this.responseText);
        }
    });
    
    xhr.open("GET", url);
    xhr.send();
}

function getStreetView(address){
    //pending
}

