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
  self.polylines          = [];
  self.markers            = [];
  self.distance           = 0;
  self.duration           = 0;

  self.randomMarkers = [];

  
  var startpoint          = {};
  var endpoint            = {};
  var stopover            = [];
  var routeObject         = {};
  var mapBoolean          = null;
  var startpoint_place_id = "";
  var endpoint_place_id   = "";
  var waypoint_address    = "";
  var stopover_coords_array = [];
  var directionsArray     = [];
  var routeArray          = [];
  var latAvg              = 0;
  var lngAvg              = 0;

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

  function calculate_distance(routeArray, routeObject){
    for (i = 0; i < routeArray.length; i++){
      self.distance = Math.round(self.distance + routeObject.legs[i].distance.value/1000);
    }
  }

  function calculate_duration(routeArray, routeObject){
    for (i = 0; i < routeArray.length; i++){
      self.duration = self.duration + routeObject.legs[i].duration.value/3600;
    }  
  }
  
  function calculate_stopover_coords(routeArray, routeObject){
    for (i = 0; i < routeArray.length; i++){
      stopover_coords_array.push(getCoords(routeArray[i].start_location));
    }
    stopover_coords_array.splice(0, 1);
  }

  function centre_map(latTotal, lngTotal, directionsArray){
    var coords = {};
    // get average of route coords to centre the map
    latAvg = latTotal / directionsArray.length;
    lngAvg = lngTotal / directionsArray.length;
    coords = {
      latitude: latAvg,
      longitude: lngAvg
    }
    return coords;
  }

  function calculate_map_zoom(trip_distance){
    var zoom = 0;
    //calculate map zoom based on the distance of the route
    if (trip_distance > 3000) {
      zoom = 3;
    } else if (trip_distance > 1000) {
      zoom = 6;
    } else if (trip_distance < 1000) {
      zoom = 8;  
    } else if (trip_distance < 100) {
      zoom = 11;
    }
    return zoom;
  }

  function create_polyline_array(directionsArray){
    var polyline_array = [];
    // this loop extracts coords from directions array and pushes into another which can be used to create GM polyline
    for (i = 0; i < directionsArray.length; i++){
      var coordsObject = {
        latitude: directionsArray[i].lat(), 
        longitude: directionsArray[i].lng()
      }
      polyline_array.push(coordsObject);
    }
    return polyline_array;
  }

  function create_latTotal(directionsArray) {
    var latTotal = 0;
    for (i = 0; i < directionsArray.length; i++){
      latTotal += directionsArray[i].lat();
    }
    return latTotal;
  }

  function create_lngTotal(directionsArray) {
    var lngTotal = 0;
    for (i = 0; i < directionsArray.length; i++){
      lngTotal += directionsArray[i].lng();
    }
    return lngTotal;
  }

  function create_polyline(polyline_array){
    //create polyline array that AGM will render on the page
    self.polylines = [
    {
      id: 1,
      path: polyline_array,
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

  function create_markers(startpoint_coords, endpoint_coords){
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
  }
  

  // CREATES A ROUTE OBJECT FROM GOOGLE OBJECTS' PLACE_IDs USING GOOGLE'S DIRECTIONS SERVICE FROM WHICH WE CAN RENDER A MAP
  function setRoute(trip){
    console.log(trip);
    startpoint_place_id = trip.startpoint.place_id;
    endpoint_place_id   = trip.endpoint.place_id;
    waypoint_address   = trip.stopovers[0].formatted_address;

    uiGmapGoogleMapApi.then(function() {

      var directionsService = new google.maps.DirectionsService;

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
          setRouteMap(self.routeObject);
        }
      )
    })
  }

  // USES GOOGLE MAPS ROUTE OBJECT TO RENDER MAP, ROUTE LINE AND MARKERS
  function setRouteMap(routeObject){

    console.log(routeObject);
    // directions array contains route coordinates
    directionsArray = routeObject.overview_path;
    routeArray = routeObject.legs;
    
    // these are for the startpoint and endpoint markers
    var startpoint_coords = getCoords(routeArray[0].start_location);
    var endpoint_coords = getCoords(routeArray[routeArray.length - 1].end_location);

    calculate_distance(routeArray, routeObject);
    calculate_duration(routeArray, routeObject);
    calculate_stopover_coords(routeArray, routeObject);

    console.log(startpoint_coords);
    console.log(stopover_coords_array);
    console.log(endpoint_coords);
    console.log(self.distance);
    console.log(self.duration);

    var polyline_array = create_polyline_array(directionsArray);
    var latTotal = create_latTotal(directionsArray);
    var lngTotal = create_lngTotal(directionsArray);
    
    var mapCoords = centre_map(latTotal, lngTotal, directionsArray);
    var zoom = calculate_map_zoom(self.distance);

    //create map object that AGM will render on the page
    self.map = {
      center: mapCoords, 
      zoom: zoom, 
      bounds: routeObject.bounds
    };

    create_polyline(polyline_array);
    create_markers(startpoint_coords, endpoint_coords);

    //tell angular to watch for changes
    $scope.$apply();
  }

  

  /////////////////////API REQUESTS/////////////////////////////////


  function getTrips(){

    self.allTrips = GlobalTrips;
    self.polylines = [];
    getLocation();
    self.title = "All trips";
    if (!CurrentUser.getUser()){
      console.log("no user");
    } else {
      var userObject = CurrentUser.getUser();
      self.currentUserId = userObject._doc._id
    }
    Trip.query(function(data){
      self.allTrips = data;
    });
  }

  function showSingleTrip(trip){
    self.title  = "Single trip";
    Trip.get({id: trip._id}, function(data){
      console.log(data);
      self.trip = data;
      setRoute(data);
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
    var newTrip = self.trip;
    var userObject = CurrentUser.getUser();
    newTrip.user = userObject._doc._id
    newTrip.startpoint = startpoint;
    newTrip.endpoint = endpoint;
    newTrip.stopovers = [];
    newTrip.stopovers.push(stopover);

    Trip.save(newTrip, function(data){
      console.log(data);
      self.allTrips.push(data);
      $state.go('viewTrips');
    });
  };


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
