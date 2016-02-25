angular
  .module('roadTrip')
  .service('MapService', MapService);

MapService.$inject = ['uiGmapGoogleMapApi'];


function MapService($timeout, uiGmapGoogleMapApi){
  var self = this;

  self.userLocation = {};  

}