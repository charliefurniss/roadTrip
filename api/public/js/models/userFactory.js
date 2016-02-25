angular
  .module('roadTrip')
  .factory('UserFactory', UserFactory);

UserFactory.$inject = ['$resource', 'API'];
function UserFactory($resource, API){

  return $resource(
    API+'/users/:id', {id: '@id'},
    { 'get':       { method: 'GET' },
      'save':      { method: 'POST' },
      'query':     { method: 'GET', isArray: true},
      'remove':    { method: 'DELETE' },
      'delete':    { method: 'DELETE' },
      'register': {
        url: API +'/register',
        method: "POST"
      },
      'login':      {
        url: API + '/login',
        method: "POST"
      }
    }
  );
}
