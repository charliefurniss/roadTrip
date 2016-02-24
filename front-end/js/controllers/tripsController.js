angular
  .module('roadTrip')
  .controller('TripsController', TripsController);

TripsController.$inject = ['$scope', 'TripFactory', 'UserFactory', '$state', 'CurrentUser', 'uiGmapGoogleMapApi'];

function TripsController($scope, Trip, User, $state, CurrentUser, uiGmapGoogleMapApi){

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
  self.polylines          = {};
  
  var startpoint         = {};
  var endpoint           = {};

  self.title              = "";

  /////////////////////////**** MAP ****////////////////////////////////////

  self.map = { 
    center: { 
      latitude: 45, longitude: -73 
    }, 
    zoom: 8 
  };

  function expandViewportToFitPlace(map, place) {
    if (place.geometry.viewport) {
      map.fitBounds(place.geometry.viewport);
    } else {
      console.log(place.geometry);
      map.setCenter(place.geometry.location);
      map.setZoom(17);
    }
  }
  
    // this is an event listener. it listens for a places_changed event – which comes from the Google API – and runs a function 
    var startpointEvents = {
      places_changed: function (searchBox) {
        
        var place = searchBox.getPlaces();
        console.log("start place " + place[0].place_id);
        startpoint = place[0];

        // expandViewportToFitPlace(self.map, place[0]);

        if (!place[0].geometry) {
          window.alert("Autocomplete's returned place contains no geometry");
          return;
        }
        // route(startpoint_place_id, endpoint_place_id);
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
        endpoint = place[0];

        // expandViewportToFitPlace(self.map, place);

        if (!place[0].geometry) {
          window.alert("Autocomplete's returned place contains no geometry");
          return;
        }
        // route(startpoint_place_id, endpoint_place_id);
      }
    }

    self.endpointSearchbox = { 
      template:'js/views/searchboxes/endpointSearchbox.tpl.html', 
      events: endpointEvents,
      parentdiv: "endpoint-input"
       
    };

  
  
  // startpoint_place_id = 'ChIJdd4hrwug2EcRmSrV3Vo6llI';
  // endpoint_place_id = 'ChIJD7fiBh9u5kcRYJSMaMOCCwQ';

  function route(startpoint_place_id, endpoint_place_id) {
    if (!startpoint_place_id || !endpoint_place_id) {
      return;
    }
    // console.log("start: " + startpoint_place_id);
    // console.log("end: " + endpoint_place_id);
    directionsService.route({
      origin: {'placeId': startpoint_place_id},
      destination: {'placeId': endpoint_place_id},
      travelMode: 'DRIVING'
    }, function(response, status) {
      
      directionsDisplay.setDirections(response);
      console.log(directionsDisplay);

      var trip = directionsDisplay.directions;

      console.log("origin_id: " + trip.request.origin.placeId);
      console.log("origin_address: " + trip.routes[0].legs[0].start_address);
      console.log("origin_lat: " + trip.routes[0].legs[0].start_location.lat());
      console.log("origin_lng: " + trip.routes[0].legs[0].start_location.lng());

      console.log("destination_id: " + trip.request.destination.placeId);
      console.log("destination_address: " + trip.routes[0].legs[0].end_address);
      console.log("destination_lat: " + trip.routes[0].legs[0].end_location.lat());
      console.log("destination_lng: " + trip.routes[0].legs[0].end_location.lng());

      console.log("trip distance: " + trip.routes[0].legs[0].distance.text);
      console.log("trip duration: " + trip.routes[0].legs[0].duration.text);

      // if (status === google.maps.DirectionsStatus.OK) {          
      //   // set variable to the scope so that they can be picked up by ng-repeat on the page
      //   
      //   self.polylines = new google.maps.Polyline({
      //     path: [],
      //     strokeColor: '#FF0000',
      //     strokeWeight: 3
      //   });
        
      //   var bounds = new google.maps.LatLngBounds();

      //   var legs = response.routes[0].legs;
      //   for (i = 0; i < legs.length; i++) {
      //     var steps = legs[i].steps;
      //     for (j = 0; j < steps.length; j++) {
      //       var nextSegment = steps[j].polyline;
      //       for (k = 0; k < nextSegment.length; k++) {
      //         console.log(nextSegment[k]);
      //         self.polylines.getPath().push(nextSegment[k]);
      //         bounds.extend(nextSegment[k]);
      //       }
      //     }
      //   }
      //   console.log(self.polylines);
      // } else {
      //   window.alert('Directions request failed due to ' + status);
      // }
    });
  }


  uiGmapGoogleMapApi.then(function(map) {

    console.log("hello");

    map = self.map;
    var directionsService = new google.maps.DirectionsService;
    var directionsDisplay = new google.maps.DirectionsRenderer;
    
    
    // route(startpoint_place_id, endpoint_place_id);
  });


  

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

    console.log(startpoint);
    console.log(endpoint);
    var userObject = CurrentUser.getUser();
    newTrip.user = userObject._doc._id
    newTrip.startpoint = startpoint;
    newTrip.endpoint = endpoint;
    console.log(newTrip);
    
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
    getTrips();
    $state.go('viewTrips');
  }

  getTrips();
  
}
