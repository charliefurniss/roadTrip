angular
  .module('roadTrip')
  .controller('TripsController', TripsController);

TripsController.$inject = ['$scope', 'CalculationsService', 'InputService', 'TripFactory', 'UserFactory', '$state', 'CurrentUser', 'uiGmapGoogleMapApi' , 'GlobalTrips'];

function TripsController($scope, Calc, Input, Trip, User, $state, CurrentUser, uiGmapGoogleMapApi, GlobalTrips){

  var self = this;

  self.allTrips           = GlobalTrips;
  self.trip               = Input.trip;
  self.getTrips           = getTrips;
  self.createTrip         = createTrip;
  self.showSingleTrip     = showSingleTrip;
  self.showCreateTripForm = showCreateTripForm;
  self.deleteTrip         = deleteTrip;
  self.editTrip           = editTrip;
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

  self.title              = "";

  self.startpointSearchbox = Input.startpointSearchbox;
  self.endpointSearchbox = Input.endpointSearchbox;
  self.stopoverSearchbox = Input.stopoverSearchbox;

  /////////////////////////**** MAP ****////////////////////////////////////

  

  // CREATES A ROUTE OBJECT FROM GOOGLE OBJECTS' PLACE_IDs USING GOOGLE'S DIRECTIONS SERVICE FROM WHICH WE CAN RENDER A MAP
  function setRoute(trip){
    var startpoint_place_id = trip.startpoint.place_id;
    var endpoint_place_id   = trip.endpoint.place_id;
    
    // need to iterate through trip.stopovers and store waypoint addresses in an array
    var waypoint_array = Calc.create_waypoint_array(trip.stopovers);

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
    self.routeArray = Calc.adapt_leg_addresses(routeObject.legs);    
        
    var trip_distance = Calc.calculate_distance(self.routeArray, routeObject);
    self.distance_with_commas = Calc.add_commas_to_number(trip_distance);
    self.duration = Calc.calculate_duration(self.routeArray, routeObject);
    
    var stopover_coords_array = Calc.calculate_stopover_coords(self.routeArray, routeObject);
    self.stopover_name_array = Calc.get_stopover_names(self.routeArray);

    //create route_map
    var latTotal = Calc.create_latTotal(directionsArray);
    var lngTotal = Calc.create_lngTotal(directionsArray);
    var map_coords = Calc.create_map_coords(latTotal, lngTotal, directionsArray);
    var zoom = Calc.calculate_map_zoom(trip_distance);
    self.route_map = Calc.create_route_map(map_coords, zoom, routeObject.bounds);

    //create polyline
    var polyline_array = Calc.create_polyline_array(directionsArray);
    self.polyline = Calc.create_route_polyline(polyline_array);

    //create route_markers
    var startpoint_coords = Calc.getCoords(self.routeArray[0].start_location);
    var endpoint_coords = Calc.getCoords(self.routeArray[self.routeArray.length - 1].end_location);
    self.markers = Calc.create_route_markers(startpoint_coords, endpoint_coords,stopover_coords_array);

    //tell angular to watch for changes
    $scope.$apply();
  }

  

  /////////////////////API REQUESTS/////////////////////////////////


  function getTrips(){
    self.allTrips = GlobalTrips;
    self.title = "All trips";
    var userObject = CurrentUser.getUser();
    self.currentUserId = userObject._doc._id;
    Trip.query(function(data){
      self.allTrips = data;
    });
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
    setRoute(trip);
    self.trip = trip;
    self.title = "Edit trip";
  }

  function updateTrip(){
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
