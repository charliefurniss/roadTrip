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
  
}