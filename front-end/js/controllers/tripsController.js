angular
  .module('roadTrip')
  .controller('TripsController', TripsController);

TripsController.$inject = ['TripFactory', 'UserFactory', '$state', 'CurrentUser'];

function TripsController(Trip, User, $state, CurrentUser){

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

  self.map = { center: { latitude: 45, longitude: -73 }, zoom: 8 };

  var events = {
    places_changed: function (searchBox) {
      console.log(searchBox)
    }
  }
  self.searchbox = { 
    template:'js/views/searchbox.tpl.html', 
    events: events,
    parentdiv: "startpoint-input"
  };


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
