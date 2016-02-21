angular
  .module('roadTrip', ['ngResource', 'angular-jwt', 'ui.router']) // tell angular to use the named services
  .constant('API', 'http://localhost:3000/api') // set front-end url as variable API
  .config(MainRouter) // include MainRouter function defined below
  .config(function($httpProvider){
    $httpProvider.interceptors.push('authInterceptor'); // ???
  });

  // Inject dependencies into MainRouter function
  MainRouter.$inject = ['$stateProvider', '$urlRouterProvider'];

  // defines the names of states and their respective urls and templates, and pass in dependencies. In index.html ui-sref and ui-view will call these states
  function MainRouter($stateProvider, $urlRouterProvider) {
    $stateProvider
      .state('home', {
        url: "/",
        templateUrl: "./js/views/home.html"
      })
      .state('login', {
        url: "/login",
        templateUrl: "./js/views/login.html"
      })
      .state('register', {
        url: "/register",
        templateUrl: "./js/views/register.html"
      })
      .state('profile', {
        url: "/profile",
        templateUrl: "./js/views/profile.html"
      })
      .state('users', {
        url: "/users",
        templateUrl: "./js/views/users.html"
      })
      .state('newTrip', {
        url: "/newTrip",
        templateUrl: "./js/views/newTrip.html",
        // controller: "TripsController as trips"
      })
      .state('viewTrips', {
        url: "/viewTrips",
        templateUrl: "./js/views/viewTrips.html",
        // controller: "TripsController as trips"
      })
      .state('singleTrip', {
        url: "/singleTrip",
        templateUrl: "./js/views/singleTrip.html",
        // controller: "TripsController as trips"
      })
      .state('editTrip', {
        url: "/editTrip",
        templateUrl: "./js/views/editTrip.html",
        // controller: "TripsController as trips"
      });

      

    $urlRouterProvider.otherwise("/");
  }
