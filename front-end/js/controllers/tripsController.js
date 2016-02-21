angular
  .module('roadTrip')
  .controller('TripsController', TripsController);

TripsController.$inject = ['TripFactory', 'UserFactory', '$state', 'CurrentUser'];

function TripsController(Trip, User, $state, CurrentUser){

  var self = this;

  self.all                = [];
  self.trip               = {};
  self.getTrips           = getTrips;
  self.createTrip         = createTrip;
  self.showSingleTrip     = showSingleTrip;
  self.showCreateTripForm = showCreateTripForm;

  self.title              = "";

  function getTrips() {
    self.title = "All trips";
    Trip.query(function(data){
      self.all = data;
    });
  }

  function showSingleTrip(){
    self.title  = "Single trip";
    console.log(self.title);
  }

  function showCreateTripForm(){
    self.title  = "New trip";
  }

  function createTrip(){
    var newTrip = self.trip;
    var userObject = CurrentUser.getUser();
    newTrip.user = userObject._doc._id
    
    Trip.save(newTrip, function(data){
      self.all.push(data);
      self.trip = {};
      $state.go('viewTrips');
    });
  };
  
}
