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

  self.title              = "";

  function getTrips() {
    self.title = "All trips";
    Trip.query(function(data){
      self.allTrips = data;
    });
  }

  function showSingleTrip(trip){
    self.title  = "Single trip";
    Trip.get({id: trip._id}, function(data){
      self.trip = data;
    });
  }

  function showCreateTripForm(){
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

  function deleteTrip(trip){
    Trip.delete({id: trip._id});
    var index = self.allTrips.indexOf(trip);
    self.trip = {};
    $state.go('viewTrips');
  }
  
}
