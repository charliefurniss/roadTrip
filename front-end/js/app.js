angular
  .module('roadTrip', ['ngResource', 'angular-jwt', 'ui.router', 'uiGmapgoogle-maps']) // tell angular to use the named services
  .constant('API', 'http://localhost:3000/api') // set front-end url as variable API
  .config(MainRouter) // include MainRouter function defined below
  .config(function($httpProvider, uiGmapGoogleMapApiProvider){
    
    $httpProvider.interceptors.push('authInterceptor'); // ???

    uiGmapGoogleMapApiProvider.configure({
              //    key: 'your api key',
              libraries: 'places' // Required for SearchBox.
    });


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
        templateUrl: "./js/views/newTrip.html"
      })
      .state('viewTrips', {
        url: "/viewTrips",
        templateUrl: "./js/views/viewTrips.html"
      })
      .state('singleTrip', {
        url: "/singleTrip",
        templateUrl: "./js/views/singleTrip.html"
      })
      .state('editTrip', {
        url: "/editTrip",
        templateUrl: "./js/views/editTrip.html"
      })
      .state('testForm', {
        url: "/testForm",
        templateUrl: "./js/views/testForm.html"
      });

      

    $urlRouterProvider.otherwise("/");
  }
