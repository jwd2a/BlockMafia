var Map = require("ti.map");
var map = Map.createView();
var currentPlaces = [];

function doClick(e) {
    alert(e);
}

function getPlacesAtLocation(location){
     
    var center = [location.latitude, location.longitude];
    var radius = location.latitudeDelta*69;
     
    var url = "https://api.foursquare.com/v2/venues/search?ll="+center[0]+","+center[1]+"&radius="+radius+"&client_id="+Alloy.CFG.foursquare.client_id+"&client_secret="+Alloy.CFG.foursquare.client_secret+"&v=20150601";
    var xhr = Ti.Network.createHTTPClient({
        onload: function(e){
            var response = JSON.parse(this.responseText);
            response.response.venues.forEach(function(venue, i){
              currentPlaces.push(venue);
              map.addAnnotation({
                 latitude: venue.location.lat,
                 longitude: venue.location.lng,
                 title: "$" + venue.stats.checkinsCount * 5000,
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

map.addEventListener("regionchanged", function(e){   
    getPlacesAtLocation(e);     
});

map.addEventListener("click", function(e){
    console.log(currentPlaces[e.annotation.id]);
});

Ti.Geolocation.getCurrentPosition(function(location){
    Alloy.Globals.currentLocation = {
        lat: location.coords.latitude,
        lng: location.coords.longitude
    }
    
    $.root.open();
    
    map.mapType = Map.NORMAL_TYPE;
    map.region = {
      latitude: Alloy.Globals.currentLocation.lat,
      longitude: Alloy.Globals.currentLocation.lng,
      latitudeDelta: 0.005,
      longitudeDelta: 0.005
    }
    
    getPlacesAtLocation(map.region);
     
    $.root.add(map);
    
});

