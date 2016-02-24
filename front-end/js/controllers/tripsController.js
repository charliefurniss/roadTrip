angular
  .module('roadTrip')
  .controller('TripsController', TripsController);

TripsController.$inject = ['MapService', '$scope', 'TripFactory', 'UserFactory', '$state', 'CurrentUser', 'uiGmapGoogleMapApi'];

function TripsController(MapService, $scope, Trip, User, $state, CurrentUser, uiGmapGoogleMapApi){

  var self = this;

  self.allTrips           = [];
  self.trip               = {};
  self.getTrips           = getTrips;
  self.createTrip         = createTrip;
  self.showSingleTrip     = showSingleTrip;
  self.showCreateTripForm = showCreateTripForm;
  self.deleteTrip         = deleteTrip;
  self.editTrip           = editTrip;
  self.startPlaceholder   = "";
  self.endPlaceholder     = "";
  self.updateTrip         = updateTrip;
  self.polylines          = {};
  self.userLocation       = {};
  self.stopovers          = [];
  
  var startpoint          = {};
  var endpoint            = {};
  var stopover            = [];
  var routeObject         = {};
  var mapBoolean          = null;

  self.title              = "";

  /////////////////////////**** MAP ****////////////////////////////////////

  // use HTML geolocation to get coordinates of user's position
  function getLocation(){
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
    self.userLocation = { latitude: lat, longitude: lng };
    setMap(self.userLocation);
  }

  function setMap(location){
    self.map = { 
      center: { 
        latitude: location.latitude,
        longitude: location.longitude
      },
      zoom: 12 
    };
    self.marker = {
      id: 0,
      coords: {
        latitude: location.latitude,
        longitude: location.longitude
      }
    } 
    $scope.$apply();
  }

  getLocation();
  
  
  // this is an event listener. it listens for a places_changed event – which comes from the Google API – and runs a function 
  var startpointEvents = {
    places_changed: function (searchBox) {
      var place = searchBox.getPlaces();
      console.log("start place " + place[0].place_id);
      startpoint = place[0];
      if (!place[0].geometry) {
        window.alert("Autocomplete's returned place contains no geometry");
        return;
      }
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

      if (!place[0].geometry) {
        window.alert("Autocomplete's returned place contains no geometry");
        return;
      }
    }
  }

  self.endpointSearchbox = { 
    template:'js/views/searchboxes/endpointSearchbox.tpl.html', 
    events: endpointEvents,
    parentdiv: "endpoint-input"
     
  };

  var stopoverEvents = {
    places_changed: function (searchBox) {
      var place = searchBox.getPlaces();
      stopover = place[0];
      if (!place[0].geometry) {
        window.alert("Autocomplete's returned place contains no geometry");
        return;
      }
    }
  }

  self.stopoverSearchbox = { 
    template:'js/views/searchboxes/stopoverSearchbox.tpl.html', 
    events: stopoverEvents,
    parentdiv: "stopover-input"
     
  };
  

  function setRoute(trip, mapBoolean){
    console.log(mapBoolean);

    var mapper = mapBoolean;

    routeObject             = {};

    var startpoint_place_id = trip.startpoint.place_id;
    var startpoint_coords   = {};
    var endpoint_place_id   = trip.endpoint.place_id;
    var endpoint_coords   = {};

    uiGmapGoogleMapApi.then(function(mapBoolean) {
    console.log(mapBoolean);

    var directionsService = new google.maps.DirectionsService;
    var directionsDisplay = new google.maps.DirectionsRenderer;

    self.polylines = []

    directionsService.route({
      origin: {'placeId': startpoint_place_id},
      destination: {'placeId': endpoint_place_id},
      travelMode: 'DRIVING'
    }, function(response, status, mapBoolean) {
        console.log(response);

        routeObject = response;
        
        if (!mapper){
          console.log(mapper);
          return routeObject;
        } else {  
          setRouteMap(routeObject);
        }
      }
    )
    })
  }

  function setRouteMap(routeObject){
    var directionsArray = routeObject.routes[0].overview_path;
    var latTotal = 0;
    var lngTotal = 0;
    var polylineArray = [];

    for (i = 0; i < directionsArray.length; i++){
      var coordsObject = {
        latitude: directionsArray[i].lat(), 
        longitude: directionsArray[i].lng()
      }
      polylineArray.push(coordsObject);
      latTotal += directionsArray[i].lat();
      lngTotal += directionsArray[i].lng();
    }

    var latAvg = latTotal / directionsArray.length;
    var lngAvg = lngTotal / directionsArray.length;

    mapCoords = {
      latitude: latAvg,
      longitude: lngAvg
    }

    self.map = {
      center: mapCoords, 
      zoom: 8, 
      bounds: {}
    };

    self.marker = {
      id: 0,
      coords: {
        latitude: location.latitude,
        longitude: location.longitude
      }
    }

    self.marker = {
      id: 1,
      coords: {
        latitude: location.latitude,
        longitude: location.longitude
      }
    }

    self.polylines = [
    {
      id: 1,
      path: polylineArray,
      stroke: {
          color: '#6060FB',
          weight: 3
      },
      editable: false,
      draggable: false,
      geodesic: true,
      visible: true,
      fit: true
    }]
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
    mapBoolean = true;
    self.title  = "Single trip";
    Trip.get({id: trip._id}, function(data){
      self.trip = data;
      // self.stopovers = data.stopovers;
      // console.log(self.stopovers[0]);
      setRoute(data, mapBoolean);
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
    newTrip.startpoint = startpoint;
    newTrip.endpoint = endpoint;
    
    newTrip.stopovers = [];
    newTrip.stopovers.push(stopover);
    
    console.log(newTrip);
    
    Trip.save(newTrip, function(data){
      self.allTrips.push(data);
      self.trip = {};
      getTrips();
      $state.go('viewTrips');
    });
  };

  // populate the form
  function editTrip(trip){
    self.trip = trip;
    self.startPlaceholder = trip.startpoint.name;
    self.endPlaceholder = trip.endpoint.name;

    console.log(trip.startpoint.name);
    console.log(trip.endpoint.name);
    self.title = "Edit trip";
  }

  function updateTrip(){
    var updatedTrip = self.trip;
    updatedTrip.startpoint = startpoint;
    updatedTrip.endpoint = endpoint;
    console.log(updatedTrip);

    Trip.update(updatedTrip, function(data){
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
