angular
  .module('roadTrip')
  .controller('TripsController', TripsController);

TripsController.$inject = ['MapService', '$scope', 'TripFactory', 'UserFactory', '$state', 'CurrentUser', 'uiGmapGoogleMapApi' , 'GlobalTrips'];

function TripsController(MapService, $scope, Trip, User, $state, CurrentUser, uiGmapGoogleMapApi, GlobalTrips){

  var self = this;

  self.allTrips           = GlobalTrips;
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
  self.routeObject        = {};
  self.map                = {};
  self.markers = [];

  self.randomMarkers = [];

  
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
      zoom: 12,
      bounds: {} 
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
  
  
  // this is an event listener. it listens for a places_changed event – which comes from the Google API – and runs a function 
  var startpointEvents = {
    places_changed: function (searchBox) {
      var place = searchBox.getPlaces();
      startpoint = place[0];
      if (!place[0].geometry) {
        window.alert("Autocomplete's returned place contains no geometry");
        return;
      }
    }
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


  function getCoords(locationObject){
    var location = {};
    location.lat = locationObject.lat();
    location.lng = locationObject.lng();
    return location;
  }
  
  // CREATES A ROUTE OBJECT FROM GOOGLE OBJECTS' PLACE_IDs USING GOOGLE'S DIRECTIONS SERVICE FROM WHICH WE CAN RENDER A MAP
  function setRoute(trip, mapBoolean){
    console.log(trip);

    var mapper = mapBoolean;

    var startpoint_place_id = trip.startpoint.place_id;
    var endpoint_place_id   = trip.endpoint.place_id;
    var waypoint_address   = trip.stopover.formatted_address;

    uiGmapGoogleMapApi.then(function() {

    var directionsService = new google.maps.DirectionsService;
    var directionsDisplay = new google.maps.DirectionsRenderer;

    self.polylines = []

    directionsService.route({
      origin: {'placeId': startpoint_place_id},
      destination: {'placeId': endpoint_place_id},
      travelMode: 'DRIVING',
      waypoints: [{
        location: waypoint_address,
        stopover: true
      }],
    }, function(response, status) {
        self.routeObject = response.routes[0];
        console.log(self.routeObject);
        
        if (!mapper){
          // console.log(self.routeObject);
          return self.routeObject;
        } else {  
          setRouteMap(self.routeObject);
        }
      }
    )
    })
  }

  // USES GOOGLE MAPS ROUTE OBJECT TO RENDER MAP, ROUTE LINE AND MARKERS
  function setRouteMap(routeObject){

    console.log(routeObject);
    // directions array contains route coordinates
    var directionsArray = routeObject.overview_path;
    var latTotal = 0;
    var lngTotal = 0;
    var polylineArray = [];
    var zoom = 0;

    var distance = routeObject.legs[0].distance.value/1000;
    
    // these are for the startpoint and endpoint markers
    var startpoint_coords = getCoords(routeObject.legs[0].start_location);
    var endpoint_coords = getCoords(routeObject.legs[0].end_location);

    // this loop extracts coords from directions array and pushes into another which can be used to create GM polyline
    for (i = 0; i < directionsArray.length; i++){
      var coordsObject = {
        latitude: directionsArray[i].lat(), 
        longitude: directionsArray[i].lng()
      }
      polylineArray.push(coordsObject);
      latTotal += directionsArray[i].lat();
      lngTotal += directionsArray[i].lng();
    }
    // get average of route coords to centre the map
    var latAvg = latTotal / directionsArray.length;
    var lngAvg = lngTotal / directionsArray.length;

    mapCoords = {
      latitude: latAvg,
      longitude: lngAvg
    }

    //calculate map zoom based on the distance of the route
    if (distance > 3000) {
      zoom = 3;
    } else if (distance > 1000) {
      zoom = 6;
    } else if (distance < 1000) {
      zoom = 8;  
    } else if (distance < 100) {
      zoom = 11;
    }

    //create map object that AGM will render on the page
    self.map = {
      center: mapCoords, 
      zoom: zoom, 
      bounds: routeObject.bounds
    };

    //create polyline array that AGM will render on the page
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

    //create markers array that AGM will render on the page
    self.markers = [{
      latitude: startpoint_coords.lat,
      longitude: startpoint_coords.lng,
      title: "startpoint",
      id: 1
    }, {
      latitude: endpoint_coords.lat,
      longitude: endpoint_coords.lng,
      title: "endpoint",
      id: 2
    }];

    //tell angular to watch for changes
    $scope.$apply();
  }

  

  /////////////////////API REQUESTS/////////////////////////////////


  function getTrips(){

    self.allTrips = GlobalTrips;
    console.log('getting trips....')
    self.polylines = [];
    getLocation();
    self.title = "All trips";
    if (!CurrentUser.getUser()){
      console.log("no user");
      
    } else {
      console.log("here");
      var userObject = CurrentUser.getUser();
      self.currentUserId = userObject._doc._id
    }
    Trip.query(function(data){
      self.allTrips = data;
      console.log(GlobalTrips)
    });
  }

  function showSingleTrip(trip){
    mapBoolean = true;

    self.title  = "Single trip";
    Trip.get({id: trip._id}, function(data){
      self.trip = data;
      console.log(data);
      // self.stopovers = data.stopovers;
      // console.log(self.stopovers[0]);
      setRoute(data, mapBoolean);
    
      $state.go('singleTrip')
    });
    self.trip = {};
  }

  function showCreateTripForm(){
    getLocation();
    self.trip   = {};
    self.title  = "New trip";
  }

  function createTrip(){
    mapBoolean = false;
    var newTrip = self.trip;
    var userObject = CurrentUser.getUser();
    newTrip.user = userObject._doc._id
    newTrip.startpoint = startpoint;
    newTrip.endpoint = endpoint;
    newTrip.stopover = stopover;

    createRoute(newTrip, function(data){
      console.log("called back");
      console.log(data);
    })
    
    Trip.save(newTrip, function(data){
      self.allTrips.push(data);
      $state.go('viewTrips');
    });
  };


  function createRoute(newTrip, callback){
    return setRoute(self.trip, mapBoolean);
  }

  // populate the form
  function editTrip(trip){
    mapBoolean = true;
    setRoute(trip, mapBoolean);
    self.trip = trip;
    self.title = "Edit trip";
  }

  function updateTrip(){
    var updatedTrip = self.trip;
    updatedTrip.startpoint = startpoint;
    updatedTrip.endpoint = endpoint;
    // console.log(updatedTrip);

    Trip.update(updatedTrip, function(data){
      self.trip = {};
    });
    getTrips();
    $state.go('viewTrips');
  }

  function deleteTrip(trip){
    Trip.delete({id: trip._id}, function(data){
      self.trip = {};
      getTrips();
      $state.go('viewTrips');
    });    
  }

  getTrips();
  
}
