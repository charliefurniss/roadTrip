angular
  .module('roadTrip')
  .factory('TripFactory', TripFactory)

TripFactory.$inject = ['$resource', 'API']
function TripFactory($resource, API){

  return $resource(
    API+'/trips/:id', {id: '@id'},
    { 'get':       { method: 'GET' },
      'save':      { method: 'POST' },
      'query':     { method: 'GET', isArray: true},
      'remove':    { method: 'DELETE' },
      'delete':    { method: 'DELETE' },
    }
  );
}