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
  self.addStopoverField   = addStopoverField;
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
  self.stopover_name_array = [];
  self.routeArray         = [];

  self.randomMarkers = [];

  
  var startpoint          = {};
  var endpoint            = {};
  var stopover            = [];
  var routeObject         = {};
  var mapBoolean          = null;
  var startpoint_place_id = "";
  var endpoint_place_id   = "";
  var waypoint_array      = [];

  self.title              = "";

  /////////////////////////**** MAP ****////////////////////////////////////

  // use HTML geolocation to get coordinates of user's position
  function getLocation(){
    self.polylines = [];
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
      stopover.push(place[0]);
      console.log(stopover);
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

  function addStopoverField(){
    self.stopover_input++;
    console.log("button working");
  }

  function getCoords(locationObject){
    var location = {};
    location.lat = locationObject.lat();
    location.lng = locationObject.lng();
    return location;
  }

  function add_commas_to_number(number) {
      return number.toLocaleString();
  }

  function calculate_distance(routeArray, routeObject){
    self.distance = 0;
    self.distance_for_display = 0;
    for (i = 0; i < routeArray.length; i++){
      self.distance = Math.round(self.distance + routeObject.legs[i].distance.value/1000);
    }
    self.distance_for_display = add_commas_to_number(self.distance);
  }

  function calculate_duration(routeArray, routeObject){
    self.hours = 0;
    self.minutes = 0;
    var time = 0;
    for (i = 0; i < routeArray.length; i++){
      time = (time + routeObject.legs[i].duration.value/3600);
    }
    self.hours = Math.floor(time); 
    self.minutes = Math.floor((time - Math.floor(time)) * 60); 
  }
  
  function calculate_stopover_coords(routeArray, routeObject){
    var stopover_coords_array = [];
    for (i = 0; i < routeArray.length; i++){
      stopover_coords_array.push(getCoords(routeArray[i].start_location));
    }
    stopover_coords_array.splice(0, 1);
    return stopover_coords_array;
  }

  function centre_map(latTotal, lngTotal, directionsArray){
    var coords = {};
    // get average of route coords to centre the map
    var latAvg = latTotal / directionsArray.length;
    var lngAvg = lngTotal / directionsArray.length;
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
    } else if (trip_distance > 2000 && trip_distance < 3000) {
      zoom = 4;
    } else if (trip_distance > 1000 && trip_distance < 2000) {
      zoom = 5;
    } else if (trip_distance > 800 && trip_distance < 1000) {
      zoom = 6;
    } else if (trip_distance > 600 && trip_distance < 800) {
      zoom = 7;  
    } else if (trip_distance > 400 && trip_distance < 600) {
      zoom = 8;
    } else if (trip_distance > 200 && trip_distance < 400) {
      zoom = 9;  
    } else if (trip_distance > 100 && trip_distance < 200) {
      zoom = 10;  
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

  function create_route_map(mapCoords, zoom, bounds){
    //create map object that AGM will render on the page
    self.map = {
      center: mapCoords, 
      zoom: zoom, 
      bounds: bounds
    };
  }

  function create_route_polyline(polyline_array){
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

  function create_startpoint_marker(startpoint_coords){
    return {
      latitude: startpoint_coords.lat,
      longitude: startpoint_coords.lng,
      title: "Startpoint",
      id: 0
    }
  }

  function create_endpoint_marker(endpoint_coords){
    return {
      latitude: endpoint_coords.lat,
      longitude: endpoint_coords.lng,
      title: "Destination",
      id: 1
    }
  }

  function create_stopover_markers(stopover_coords_array){
    var markers_array = [];
    var marker_object = {};
    for (i = 0; i < stopover_coords_array.length; i++){
      var stopover_number = i + 1;
      var marker_id = i + 2;
      marker_object = {
        latitude: stopover_coords_array[i].lat,
        longitude: stopover_coords_array[i].lng,
        title: "Stopover " + stopover_number,
        id: marker_id
      }
      markers_array.push(marker_object);
    }
    return markers_array;
  }

  function create_marker_objects_array(marker_coords_array){
    var marker_title  = "";
    var marker_objects_array  = [];
    for (i = 0; i < marker_coords_array.length; i++){
      var marker_id = i;
      if (i == 0) {
        marker_title  = "Origin";
        marker_id     = 0;
      }
      else if (i == marker_coords_array.length - 1){
        marker_title  = "Destination";
      }
      else {
        marker_title = "Stopover " + (i + 1);
      }
      marker_object = {
        latitude: marker_coords_array[i].lat,
        longitude: marker_coords_array[i].lng,
        title: marker_title,
        id: marker_id
      }
      marker_objects_array.push(marker_object);
    }
    return marker_objects_array;
  }

  function create_route_markers(startpoint_coords, endpoint_coords, stopover_coords_array){
    var marker_coords_array = [];
    for (i = 0; i < stopover_coords_array.length; i++) {
      marker_coords_array.push(stopover_coords_array[i]);
    }
    marker_coords_array.unshift(startpoint_coords);
    marker_coords_array.push(endpoint_coords);

    self.markers = create_marker_objects_array(marker_coords_array);

  }

  function create_waypoint_array(stopovers){
    var waypoint_array = [];
    for (i = 0; i < stopovers.length; i++){
      waypoint_array.push(
        {
          location: stopovers[i].formatted_address,
          stopover: true
        })
    }
    return waypoint_array;
  }

  function adapt_leg_addresses(routeArray){
    //removes everything after a comma, ie the name of the country in Google's address
    for (i = 0; i < routeArray.length; i++){
      var leg_start_location = (routeArray[i].start_address).substring(0, routeArray[i].start_address.indexOf(','));
      var leg_end_location = (routeArray[i].end_address).substring(0, routeArray[i].end_address.indexOf(','));
      routeArray[i].start_address = leg_start_location;
      routeArray[i].end_address = leg_end_location;
    }
    return routeArray;
  }

  function get_stopover_names(routeArray){
    //creates an array containing the names on the stopovers only
    var stopover_name_array = [];
    for (i = 0; i < routeArray.length; i++){
      stopover_name_array.push(routeArray[i].start_address);
    }
    stopover_name_array.splice(0 , 1);
    return stopover_name_array;
  }

  // CREATES A ROUTE OBJECT FROM GOOGLE OBJECTS' PLACE_IDs USING GOOGLE'S DIRECTIONS SERVICE FROM WHICH WE CAN RENDER A MAP
  function setRoute(trip){
    console.log(trip);
    startpoint_place_id = trip.startpoint.place_id;
    endpoint_place_id   = trip.endpoint.place_id;
    
    // need to iterate through trip.stopovers and store waypoint addresses in an array
    var waypoint_array = [];

    waypoint_array = create_waypoint_array(trip.stopovers);

    uiGmapGoogleMapApi.then(function() {

      var directionsService = new google.maps.DirectionsService;

      directionsService.route({
        origin: {'placeId': startpoint_place_id},
        destination: {'placeId': endpoint_place_id},
        travelMode: 'DRIVING',
        waypoints: waypoint_array,
      }, function(response, status) {
          self.routeObject = response.routes[0];        
          setRouteMap(self.routeObject);
        }
      )
    })
  }

  // USES GOOGLE MAPS ROUTE OBJECT TO RENDER MAP, ROUTE LINE AND MARKERS
  function setRouteMap(routeObject){
    console.log(routeObject.legs);
    // directions array contains route coordinates
    var directionsArray = routeObject.overview_path;
    self.routeArray = adapt_leg_addresses(routeObject.legs);    
        
    calculate_distance(self.routeArray, routeObject);
    calculate_duration(self.routeArray, routeObject);
    
    var stopover_coords_array = calculate_stopover_coords(self.routeArray, routeObject);
    self.stopover_name_array = get_stopover_names(self.routeArray);
    console.log(self.stopover_name_array);

    //create route_map
    var latTotal = create_latTotal(directionsArray);
    var lngTotal = create_lngTotal(directionsArray);
    var mapCoords = centre_map(latTotal, lngTotal, directionsArray);
    var distance = self.distance;
    var zoom = calculate_map_zoom(self.distance);
    create_route_map(mapCoords, zoom, routeObject.bounds);

    //create polyline
    var polyline_array = create_polyline_array(directionsArray);
    create_route_polyline(polyline_array);

    //create route_markers
    var startpoint_coords = getCoords(self.routeArray[0].start_location);
    var endpoint_coords = getCoords(self.routeArray[self.routeArray.length - 1].end_location);
    create_route_markers(startpoint_coords, endpoint_coords,stopover_coords_array);

    //tell angular to watch for changes
    $scope.$apply();
  }

  

  /////////////////////API REQUESTS/////////////////////////////////


  function getTrips(){
    self.allTrips = GlobalTrips;
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
    newTrip.stopovers = stopover;

    Trip.save(newTrip, function(data){
      console.log(data);
      self.trip = data;
      setRoute(data);
      $state.go('singleTrip');
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
