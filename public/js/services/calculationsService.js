angular
  .module('roadTrip')
  .service('CalculationsService', CalculationsService);

function CalculationsService() {

  var self = this;

  self.getCoords = function(locationObject){
    var location = {};
    location.lat = locationObject.lat();
    location.lng = locationObject.lng();
    return location;
  }

  self.create_waypoint_array = function(stopovers){
    var waypoint_array = [];
    for (i = 0; i < stopovers.length; i++){
      waypoint_array.push(
        {
          location: stopovers[i].formatted_address,
          stopover: true
        })
    }
    return waypoint_array;
  }

  self.create_latTotal = function(directionsArray){
    var latTotal = 0;
    for (i = 0; i < directionsArray.length; i++){
      latTotal += directionsArray[i].lat();
    }
    return latTotal;
  }

  self.create_lngTotal = function(directionsArray){
    console.log("create_latTotal");
    var lngTotal = 0;
    for (i = 0; i < directionsArray.length; i++){
      lngTotal += directionsArray[i].lng();
    }
    return lngTotal;
  }
  
}