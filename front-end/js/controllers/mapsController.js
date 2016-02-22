angular
  .module('roadTrip')
  .controller('MapsController', MapsController);

MapsController.$inject = ['TripFactory', 'UserFactory', '$state', 'CurrentUser'];

function MapsController(Trip, User, $state, CurrentUser){

	var self = this;

 	var map;
  var service;
  self.markers = [];

  function handleSearchResults(results, status) {
    console.log(results);
    for(i = 0; i < results.length; i++){
      //create a marker for each result
      createMarker(results[i]);
    }
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

  function createUserMarker(currentLocation, title){

  	// var infoWindow = new google.maps.InfoWindow();

    var marker = new google.maps.Marker({
      position: currentLocation,
      map: map,
      title: title
    });
  }  


  function createMarker(info){

  	// var infoWindow = new google.maps.InfoWindow();

    var marker = new google.maps.Marker({
      position: info.geometry.location,
      map: map,
      title: info.name
    });

    // marker.content = '<div class="infoWindowContent">' + info.desc + '</div>';
            
    // google.maps.event.addListener(marker, 'click', function(){
    //   infoWindow.setContent('<h2>' + marker.title + '</h2>' + marker.content);
    //   infoWindow.open($scope.map, marker);
    // });
    
    // self.markers.push(marker);
  }

  function initialise(location) {

    // var trafficLayer = new google.maps.TrafficLayer();

    // function addTrafficLayer(map) {
    //   trafficLayer.setMap(map);
    // }

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

    // // addTrafficLayer(map);

    performSearch(currentLocation);    

  }

	// Get user's current position using HTML5 geolocation feature. navigator object has property called geolocation. We pass it the initialise function for it to call when it has go the location
	navigator.geolocation.getCurrentPosition(initialise);
  
 };
