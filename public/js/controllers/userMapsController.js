angular
  .module('roadTrip')
  .controller('UserMapsController', UserMapsController);

UserMapsController.$inject = ['uiGmapGoogleMapApi', 'InputService', '$scope'];

function UserMapsController(uiGmapGoogleMapApi, Input, $scope){
  
  var self = this;

  self.startpointSearchbox = Input.startpointSearchbox;
  self.endpointSearchbox = Input.endpointSearchbox;
  self.stopoverSearchbox = Input.stopoverSearchbox;

  // use HTML geolocation to get coordinates of user's position
  function getLocation(){
    self.polyline = [];
    self.markers = [];
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(setUserLocation);
    } else {
      console.log("geolocation error");
    }
  }
  
  // put coords from getLocation function into a bound object ready for Google maps
  function setUserLocation(position){
    var lat = position.coords.latitude; 
    var lng = position.coords.longitude;
    var userLocation = { 
      latitude: lat, 
      longitude: lng 
    };
    setMap(userLocation);
  }

  function setMap(location){
  	console.log(location);
    self.map = { 
      center: { 
        latitude: location.latitude,
        longitude: location.longitude
      },
      zoom: 12,
      bounds: {} 
    };
    self.marker = {
      id: 0,
      coords: {
        latitude: location.latitude,
        longitude: location.longitude
      },
      options: {
        icon: "../images/png/red-pin.png"
      }
    }
    $scope.$apply();
  }

  getLocation();

}