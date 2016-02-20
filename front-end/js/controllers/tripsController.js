angular
  .module('roadTrip')
  .controller('TripsController', TripsController);

TripsController.$inject = ['TripFactory', 'UserFactory', '$state', 'CurrentUser'];
function TripsController(Trip, User, $state, CurrentUser){

  self.all           = [];
  self.trip          = {};
  self.getTrips      = getTrips;
  self.createTrip    = createTrip;

  function getTrips() {
    Trip.query(function(data){
      self.all = data;
    });
  }

  function createTrip(){
    var trip = { trip: self.trip };
    console.log(trip);
    Trip.save(trip, function(data){
      self.all.push(data);
      self.trip = {};
      $state.go('trips');
    });
  };
  
}
