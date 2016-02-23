angular
  .module('roadTrip')
  .controller('TripsController', TripsController);

TripsController.$inject = ['TripFactory', 'UserFactory', '$state', 'CurrentUser', 'uiGmapGoogleMapApi'];

function TripsController(Trip, User, $state, CurrentUser, uiGmapGoogleMapApi){

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
  
  var startpoint_place_id      = null;
  var startpoint_coords        = {};
  var endpoint_place_id        = null;
  var endpoint_coords          = {};

  self.title              = "";

  /////////////////////////**** MAP ****////////////////////////////////////

  self.map = { 
    center: { 
      latitude: 45, longitude: -73 
    }, 
    zoom: 8 
  };

  // this is an event listener. it listens for a places_changed event – which comes from the Google API – and runs a function 
  var startpointEvents = {
    places_changed: function (searchBox) {
      var place = searchBox.getPlaces();
      startpoint_place_id = place[0].place_id;
      startpoint_coords = getCoords(place[0].geometry.location);
      console.log(startpoint_coords);

      if (!place.geometry) {
        window.alert("Autocomplete's returned place contains no geometry");
        return;
      }
      route(startpoint_place_id, endpoint_place_id);
    }
  }

  function getCoords(locationObject){
    var location = {};
    location.lat = locationObject.lat();
    location.lng = locationObject.lng();
    return location;
  }

  self.startpointSearchbox = { 
    template:'js/views/searchboxes/startpointSearchbox.tpl.html', 
    events: startpointEvents,
    parentdiv: "startpoint-input"
  };

  var endpointEvents = {
    places_changed: function (searchBox) {
      var place = searchBox.getPlaces();
      endpoint_place_id = place[0].place_id;
      endpoint_coords = getCoords(place[0].geometry.location);
      console.log(endpoint_coords);

      if (!place.geometry) {
        window.alert("Autocomplete's returned place contains no geometry");
        return;
      }
      route(startpoint_place_id, endpoint_place_id);
    }
  }

  self.endpointSearchbox = { 
    template:'js/views/searchboxes/endpointSearchbox.tpl.html', 
    events: endpointEvents,
    parentdiv: "endpoint-input"
     
  };

  uiGmapGoogleMapApi.then(function(maps) {
    
  });

  var directionsService = new google.maps.DirectionsService;
  var directionsDisplay = new google.maps.DirectionsRenderer;
  
  directionsDisplay.setMap(map);

  function route(startpoint_place_id, endpoint_place_id) {
    if (!startpoint_place_id || !endpoint_place_id) {
      return;
    }
    console.log("start: " + startpoint_place_id);
    console.log("end: " + endpoint_place_id);
    directionsService.route({
      origin: {'placeId': startpoint_place_id},
      destination: {'placeId': endpoint_place_id},
      travelMode: travel_mode
    }, function(response, status) {
      console.log(response);
      if (status === google.maps.DirectionsStatus.OK) {
        directionsDisplay.setDirections(response);
      } else {
        window.alert('Directions request failed due to ' + status);
      }
    });
  }


  /////////////////////API REQUESTS/////////////////////////////////


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
      // TripService.trip = data;
      // TripService.setTripMap(data);
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
