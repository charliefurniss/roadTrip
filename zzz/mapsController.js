angular
  .module('roadTrip')
  .controller('MapsController', MapsController);

MapsController.$inject = ['TripService', 'TripFactory', 'UserFactory', '$state', 'CurrentUser'];

function MapsController(TripService, Trip, User, $state, CurrentUser){

	var self = this;

	self.trip = TripService.trip;
	self.startpoint = "";
	self.endpoint = "";

 	var map;
  var service;
  self.markers = [];


  function createUserMarker(currentLocation, title){

  	// var infoWindow = new google.maps.InfoWindow();

    var marker = new google.maps.Marker({
      position: currentLocation,
      map: map,
      title: title
    });
  }

  function createTripMarkers(trip){

  	// get long/let using startpoint
  	getCordinates(self.trip);

  	// pass location into createMarker function
  	createMarker();

  	self.startpoint = "";
  	self.endpoint = "";

  }

  function createMarker(info){
    var marker = new google.maps.Marker({
      position: info.geometry.location,
      map: map,
      title: info.name
    });
  }

  function setDefaultMap(location) {

    var currentLocation = {lat: location.coords.latitude, lng: location.coords.longitude};

    //creates map and sets its properties
    map = new google.maps.Map(document.getElementById('map-canvas'), {
      center: currentLocation,
      zoom: 12,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    });

    // sets marker at the stated position
    createUserMarker(currentLocation, "Title");

    // create a new GM places object based on the  PlacesService class and pass it a reference to our GM object
    service = new google.maps.places.PlacesService(map)

    performSearch(currentLocation);    

  }

  function performSearch(currentLocation) {
    // sets variables used in search request
    var request = {
        location: currentLocation,
        radius: '500',
        types: ['hotel']
      };
    //performs the search on the service object. nearbySearch is a function of GM Places. request passes in the search criteria 
    service.nearbySearch(request, handleSearchResults);
  }

  function handleSearchResults(results, status) {
    console.log(results);
    for(i = 0; i < results.length; i++){
      //create a marker for each result
      createMarker(results[i]);
    }
  }

  function createTrafficLayer(){
  	// var trafficLayer = new google.maps.TrafficLayer();

  	// function addTrafficLayer(map) {
  	//   trafficLayer.setMap(map);
  	// }
  }

  // addTrafficLayer(map);

  	// Get user's current position using HTML5 geolocation feature. navigator object has property called geolocation. We pass it the initialise function for it to call when it has go the location
  	// navigator.geolocation.getCurrentPosition(setDefaultMap);

  
	
  
 };
