angular
  .module('roadTrip')
  .controller('TestController', TestController);

TestController.$inject = ['TripService', 'TripFactory', 'UserFactory', '$state', 'CurrentUser'];

function TestController(TripService, Trip, User, $state, CurrentUser){

  var self = this;

  self.allTrips           = [];
  self.trip               = {};
  self.getTrips           = getTrips;
  self.createTrip         = createTrip;
  self.showSingleTrip     = showSingleTrip;
  self.showCreateTripForm = showCreateTripForm;
  self.deleteTrip         = deleteTrip;
  self.editTrip           = editTrip;
  self.updateTrip         = updateTrip;

  self.title              = "";

  function setTripMap(trip) {
    var startpoint_id = null;
    var endpoint_id = null;
    var travel_mode = google.maps.TravelMode.DRIVING;
    var map = new google.maps.Map(document.getElementById('map'), {
      mapTypeControl: false,
      center: {lat: -33.8688, lng: 151.2195},
      zoom: 13
    });
    var directionsService = new google.maps.DirectionsService;
    var directionsDisplay = new google.maps.DirectionsRenderer;
    
    directionsDisplay.setMap(map)

    var startpoint_input = document.getElementById('startpoint-input');
    var endpoint_input = document.getElementById('endpoint-input');
    // var modes = document.getElementById('mode-selector');

    map.controls[google.maps.ControlPosition.TOP_LEFT].push(startpoint_input);
    map.controls[google.maps.ControlPosition.TOP_LEFT].push(endpoint_input);
    // map.controls[google.maps.ControlPosition.TOP_LEFT].push(modes);

    var startpoint = new google.maps.places.Autocomplete(startpoint_input);
    startpoint_autocomplete.bindTo('bounds', map);
    
    var endpoint_autocomplete = new google.maps.places.Autocomplete(endpoint_input);
    endpoint_autocomplete.bindTo('bounds', map);

    // Sets up a listener on a radio button to change the filter type on Places Autocomplete.
    function setupClickListener(id, mode) {
      var radioButton = document.getElementById(id);
      radioButton.addEventListener('click', function() {
        travel_mode = mode;
      });
    }
    setupClickListener('changemode-walking', google.maps.TravelMode.WALKING);
    setupClickListener('changemode-transit', google.maps.TravelMode.TRANSIT);
    setupClickListener('changemode-driving', google.maps.TravelMode.DRIVING);

    function expandViewportToFitPlace(map, place) {
      if (place.geometry.viewport) {
        map.fitBounds(place.geometry.viewport);
      } else {
        map.setCenter(place.geometry.location);
        map.setZoom(17);
      }
    }

    startpoint_autocomplete.addListener('place_changed', function() {
      var place = startpoint_autocomplete.getPlace();
      if (!place.geometry) {
        window.alert("Autocomplete's returned place contains no geometry");
        return;
      }
      expandViewportToFitPlace(map, place);

      // If the place has a geometry, store its place ID and route if we have
      // the other place ID
      startpoint_place_id = place.place_id;
      route(startpoint_place_id, endpoint_place_id, travel_mode, directionsService, directionsDisplay);
    });

    endpoint_autocomplete.addListener('place_changed', function() {
      var place = endpoint_autocomplete.getPlace();
      if (!place.geometry) {
        window.alert("Autocomplete's returned place contains no geometry");
        return;
      }
      expandViewportToFitPlace(map, place);

      // If the place has a geometry, store its place ID and route if we have
      // the other place ID
      endpoint_place_id = place.place_id;
      route(startpoint_place_id, endpoint_place_id, travel_mode, directionsService, directionsDisplay);
    });

    function route(startpoint_place_id, endpoint_place_id, travel_mode, directionsService, directionsDisplay) {
      if (!startpoint_place_id || !endpoint_place_id) {
        return;
      }
      directionsService.route({
        origin: {'placeId': startpoint_place_id},
        destination: {'placeId': endpoint_place_id},
        travelMode: travel_mode
      }, function(response, status) {
        if (status === google.maps.DirectionsStatus.OK) {
          directionsDisplay.setDirections(response);
        } else {
          window.alert('Directions request failed due to ' + status);
        }
      });
    }

  }

  function getTrips(){
    self.title = "All trips";
    var userObject = CurrentUser.getUser();
    self.currentUserId = userObject._doc._id
    Trip.query(function(data){
      self.allTrips = data;
    });
  }

  function showSingleTrip(trip){
    self.title  = "Single trip";
    Trip.get({id: trip._id}, function(data){
      self.trip = data;
      setTripMap(data);
    });
    self.trip = {};
  }

  function showCreateTripForm(){
    self.trip   = {};
    self.title  = "New trip";
  }

  function createTrip(){
    var newTrip = self.trip;
    var userObject = CurrentUser.getUser();
    newTrip.user = userObject._doc._id
    
    Trip.save(newTrip, function(data){
      self.allTrips.push(data);
      self.trip = {};
      $state.go('viewTrips');
    });
  };

  // populate the form
  function editTrip(trip){
    self.trip = trip;
    self.title = "Edit trip";
  }

  function updateTrip(){
    Trip.update(self.trip, function(data){
      self.trip = {};
    });
    getTrips();
    $state.go('viewTrips');
  }

  function deleteTrip(trip){
    Trip.delete({id: trip._id});
    self.trip = {};
    $state.go('viewTrips');
  }

  getTrips();

}