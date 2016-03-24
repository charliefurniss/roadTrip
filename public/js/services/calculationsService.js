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

  self.calculate_distance = function(routeArray, routeObject){
    var trip_distance = 0;
    for (i = 0; i < routeArray.length; i++){
      trip_distance = Math.round(trip_distance + routeObject.legs[i].distance.value/1000);
    }
    return trip_distance;
  }

  self.calculate_duration = function(routeArray, routeObject){
    var time = 0;
    for (i = 0; i < routeArray.length; i++){
      time = (time + routeObject.legs[i].duration.value/3600);
    }
    var duration = {
      hours: Math.floor(time),
      minutes: Math.floor((time - Math.floor(time)) * 60)
    }
    return duration; 
  }
  
}