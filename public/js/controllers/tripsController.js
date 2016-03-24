angular
  .module('roadTrip')
  .controller('TripsController', TripsController);

TripsController.$inject = ['CalculationsService', 'InputService', '$scope', 'TripFactory', 'UserFactory', '$state', 'CurrentUser', 'uiGmapGoogleMapApi' , 'GlobalTrips'];

function TripsController(Calc, Input, $scope, Trip, User, $state, CurrentUser, uiGmapGoogleMapApi, GlobalTrips){

  var self = this;

  self.allTrips           = GlobalTrips;
  self.trip               = Input.trip;
  self.getTrips           = getTrips;
  self.createTrip         = createTrip;
  self.showSingleTrip     = showSingleTrip;
  self.showCreateTripForm = showCreateTripForm;
  self.deleteTrip         = deleteTrip;
  self.editTrip           = editTrip;
  self.startPlaceholder   = "";
  self.endPlaceholder     = "";
  self.updateTrip         = updateTrip;
  self.stopovers          = [];
  self.routeObject        = {};
  self.map                = {};
  self.polyline           = [];
  self.markers            = [];
  self.duration           = {};
  self.stopover_name_array = [];
  self.routeArray         = [];

  self.randomMarkers = [];

  
  self.startpointSearchbox = Input.startpointSearchbox;
  self.endpointSearchbox = Input.endpointSearchbox;
  self.stopoverSearchbox = Input.stopoverSearchbox;

  var routeObject         = {};
  var mapBoolean          = null;
  var startpoint_place_id = "";
  var endpoint_place_id   = "";
  var waypoint_array      = [];

  self.title              = "";

  /////////////////////////**** MAP ****////////////////////////////////////

  // use HTML geolocation to get coordinates of user's position
  function getLocation(){
    self.polyline = [];
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
    var userLocation = { latitude: lat, longitude: lng };
    setMap(userLocation);
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
      },
      options: {
        icon: "../images/png/red-pin.png"
      }
    }
    $scope.$apply();
  }

  function add_commas_to_number(number) {
      return number.toLocaleString();
  }

  function create_route_map(mapCoords, zoom, bounds){
    //create map object that AGM will render on the page
    var route_map = {
      center: mapCoords, 
      zoom: zoom, 
      bounds: bounds
    };
    return route_map;
  }

  function create_route_polyline(polyline_array){
    //create polyline array that AGM will render on the page
    var polyline = [
    {
      id: 1,
      path: polyline_array,
      stroke: {
          color: '#EA44FF',
          weight: 3
      },
      editable: false,
      draggable: false,
      geodesic: true,
      visible: true,
      fit: true
    }]
    return polyline;
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
    var icon = "";
    for (i = 0; i < marker_coords_array.length; i++){
      var marker_id = i;
      if (i == 0) {
        marker_title  = "Origin";
        marker_id     = 0;
        icon          = "../images/png/green-pin.png";
      }
      else if (i == marker_coords_array.length - 1){
        marker_title  = "Destination";
        icon          = "../images/png/red-pin.png";
      }
      else {
        marker_title = "Stopover " + (i + 1);
        icon          = "../images/png/orange-pin.png";
      }
      marker_object = {
        latitude: marker_coords_array[i].lat,
        longitude: marker_coords_array[i].lng,
        title: marker_title,
        id: marker_id,
        icon: icon
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
    // console.log(trip);
    startpoint_place_id = trip.startpoint.place_id;
    endpoint_place_id   = trip.endpoint.place_id;
    
    // need to iterate through trip.stopovers and store waypoint addresses in an array
    var waypoint_array = [];
    waypoint_array = Calc.create_waypoint_array(trip.stopovers);

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
    // directions array contains route coordinates
    var directionsArray = routeObject.overview_path;
    self.routeArray = adapt_leg_addresses(routeObject.legs);    
        
    var trip_distance = Calc.calculate_distance(self.routeArray, routeObject);
    self.distance_with_commas = add_commas_to_number(trip_distance);
    self.duration = Calc.calculate_duration(self.routeArray, routeObject);
    
    var stopover_coords_array = Calc.calculate_stopover_coords(self.routeArray, routeObject);
    self.stopover_name_array = get_stopover_names(self.routeArray);

    //create route_map
    var latTotal = Calc.create_latTotal(directionsArray);
    var lngTotal = Calc.create_lngTotal(directionsArray);
    var map_coords = Calc.create_map_coords(latTotal, lngTotal, directionsArray);
    var zoom = Calc.calculate_map_zoom(trip_distance);
    self.route_map = create_route_map(map_coords, zoom, routeObject.bounds);

    //create polyline
    var polyline_array = Calc.create_polyline_array(directionsArray);
    self.polyline = create_route_polyline(polyline_array);

    //create route_markers
    var startpoint_coords = Calc.getCoords(self.routeArray[0].start_location);
    var endpoint_coords = Calc.getCoords(self.routeArray[self.routeArray.length - 1].end_location);
    create_route_markers(startpoint_coords, endpoint_coords,stopover_coords_array);

    //tell angular to watch for changes
    $scope.$apply();
  }

  

  /////////////////////API REQUESTS/////////////////////////////////


  function getTrips(){
    if (!CurrentUser.getUser()){
      console.log("no user");
      $state.go('register');
      return;
    } else {
      self.allTrips = GlobalTrips;
      getLocation();
      self.title = "All trips";
      var userObject = CurrentUser.getUser();
      self.currentUserId = userObject._doc._id;
      Trip.query(function(data){
        self.allTrips = data;
      });
    }
  }

  function showSingleTrip(trip){
    self.title  = "Single trip";
    Trip.get({id: trip._id}, function(data){
      self.trip = data;
      setRoute(data);
    });
    self.trip = {};
  }

  function showCreateTripForm(){
    getLocation();
    self.trip   = {};
    self.title  = "New trip";
  }

  function createTrip(){
    var userObject = CurrentUser.getUser();
    var newTrip = {
      user: userObject._doc._id,
      startpoint: Input.startpoint,
      endpoint: Input.endpoint,
      stopovers: Input.stopover
    };

    Trip.save(newTrip, function(data){
      self.trip = data;
      setRoute(data);
      $state.go('singleTrip');
    });

    Input.stopover = [];
  
  };

  // populate the form
  function editTrip(trip){
    trip.stopovers = [];
    setRoute(trip, mapBoolean);
    self.trip = trip;
    self.title = "Edit trip";
  }

  function updateTrip(){
    console.log(self.trip);
    var updatedTrip = {
      name: self.trip.name,
      _id: self.trip._id,
      user: self.trip.user,
      startpoint: self.trip.startpoint,
      endpoint: self.trip.endpoint,
      stopovers: Input.stopover
    }; 
    Trip.update(updatedTrip, function(data){
      self.trip = data;
      setRoute(data);
      $state.go('singleTrip');
    });
    stopover                = [];
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
