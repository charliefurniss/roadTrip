angular
  .module('roadTrip')
  .factory('TripFactory', TripFactory)

TripFactory.$inject = ['$resource', 'API']
function TripFactory($resource, API){

  return $resource(
    API+'/trips/:id', 
    {id: '@_id'},
    { 'get':       { method: 'GET', isArray: false},
      'save':      { method: 'POST' },
      'query':     { method: 'GET', isArray: true},
      'update':    { method: 'PATCH' },
      'remove':    { method: 'DELETE' },
      'delete':    { method: 'DELETE' },
    }
  );
}