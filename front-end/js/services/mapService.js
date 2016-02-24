angular
  .module('roadTrip')
  .service('MapService', MapService);

function MapService($timeout){

  console.log("map service working")

  var self = this;

  self.getLocation = getLocation;

  function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition);
    } else {
        x.innerHTML = "Geolocation is not supported by this browser.";
    }
  }

}