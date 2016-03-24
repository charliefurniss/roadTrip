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

  self.calculate_stopover_coords = function(routeArray, routeObject){
    var stopover_coords_array = [];
    for (i = 0; i < routeArray.length; i++){
      stopover_coords_array.push(self.getCoords(routeArray[i].start_location));
    }
    stopover_coords_array.splice(0, 1);
    return stopover_coords_array;
  }

  self.create_polyline_array = function(directionsArray){
    var polyline_array = [];
    // this loop extracts coords from directions array and pushes into another which can be used to create GM polyline
    for (i = 0; i < directionsArray.length; i++){
      var coordsObject = {
        latitude: directionsArray[i].lat(), 
        longitude: directionsArray[i].lng()
      }
      polyline_array.push(coordsObject);
    }
    return polyline_array;
  }

  self.calculate_map_zoom = function(distance){
    var zoom = 0;
    //calculate map zoom based on the distance of the route
    if (distance > 4500) {
      zoom = 3;
    } else if (distance > 3000 && distance < 4500) {
      zoom = 4;
    } else if (distance > 1000 && distance < 3000) {
      zoom = 5;
    } else if (distance > 600 && distance < 1000) {
      zoom = 6;  
    } else if (distance > 400 && distance < 600) {
      zoom = 7;
    } else if (distance > 250 && distance < 400) {
      zoom = 8;
    } else if (distance > 50 && distance < 250) {
      zoom = 9;    
    } else if (distance > 25 && distance < 50) {
      zoom = 10;  
    } else if (distance < 25) {
      zoom = 11;
    }
    return zoom;
  }

  self.create_map_coords = function(latTotal, lngTotal, directionsArray){
    // get average of route coords to centre the map
    var latAvg = latTotal / directionsArray.length;
    var lngAvg = lngTotal / directionsArray.length;
    var coords = {
      latitude: latAvg,
      longitude: lngAvg
    }
    return coords;
  }
  
}