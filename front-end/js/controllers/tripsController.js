angular
  .module('roadTrip')
  .controller('TripsController', TripsController);

TripsController.$inject = ['TripFactory', 'UserFactory', '$state', 'CurrentUser'];
function TripsController(Trip, User, $state, CurrentUser){
  
}
