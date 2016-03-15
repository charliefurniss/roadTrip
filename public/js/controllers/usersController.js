angular
  .module('roadTrip')
  .controller('UsersController', UsersController);

// Inject and pass in arguments for currentUser and TokenService services, $state (for directing), and the UserFactory
UsersController.$inject = ['UserFactory', 'TokenService', '$state', 'CurrentUser'];

function UsersController(User, TokenService, $state, CurrentUser){

  var self = this;

  self.all           = [];
  self.user          = {};
  self.error         = null;
  self.getUsers      = getUsers;
  self.register      = register;
  self.login         = login;
  self.logout        = logout;
  self.checkLoggedIn = checkLoggedIn;

  function getUsers() {
    User.query(function(data){
      self.all = data;
    });
  }

  function handleLogin(res) {
    var token = res.token ? res.token : null;
    if (token) {
      self.getUsers();
      $state.go('newTrip');
    }
    self.user = TokenService.decodeToken();
    CurrentUser.saveUser(self.user);
  }

  function handleError(e) {
    self.error = "Something went wrong.";
  }

  function register() {
    self.error = null;
    User.register(self.user, handleLogin, handleError);
  }

  function login() {
    self.error = null;
    User.login(self.user, handleLogin, handleError);
  }

  function logout() {
    TokenService.removeToken();
    self.all  = [];
    self.user = {};
    CurrentUser.clearUser();
  }

  function checkLoggedIn() {
    var loggedIn = !!TokenService.getToken();
    return loggedIn;
  }


  // if there is no current user, run the getUser function defined in the CurrentUser service, set the currentuser to self.user
  if (!!CurrentUser.getUser()) {
    self.user = CurrentUser.getUser();
    self.getUsers();
  }

  return self;
}
