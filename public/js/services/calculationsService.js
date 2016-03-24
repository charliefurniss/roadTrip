angular
  .module('roadTrip')
  .service('CalculationsService', CalculationsService);

function CalculationsService() {

  var self = this;

  console.log("CalculationsService");

  self.getCoords = function(locationObject){
    console.log("getCoords");
    var location = {};
    location.lat = locationObject.lat();
    location.lng = locationObject.lng();
    return location;
  }
  
}