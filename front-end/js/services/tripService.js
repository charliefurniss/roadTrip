angular
  .module('roadTrip')
  .service('TripService', TripService);


function TripService(){
  
  // var self = this;
  
  // self.trip = {};
  // self.getTripCoordinates = getTripCoordinates;
  // self.setTripMap = setTripMap;
  // self.startpoint = {};
  // self.endpoint = {};
  // self.stopover = {};

  // function getTripCoordinates(location, callback){
  //   // console.log(location);
  //   var geocoder = new google.maps.Geocoder();
  //   geocoder.geocode( { 'address': location }, function(results, status) {
  //     if (status == google.maps.GeocoderStatus.OK) {
  //       var newCoords = {lat: results[0].geometry.location.lat(), lng: results[0].geometry.location.lng()};
  //       callback(newCoords);
  //     }
  //     else {
  //       console.log("Geocode was not successful for the following reason: " + status);
  //     }
  //   });
  // }

}