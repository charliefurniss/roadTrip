angular
  .module('roadTrip', ['ngResource', 'angular-jwt', 'ui.router', 'uiGmapgoogle-maps']) // tell angular to use the named services
  .constant('API', '/api' ) // set front-end url as variable API
  .config(MainRouter) // include MainRouter function defined below
  .config(function($httpProvider, uiGmapGoogleMapApiProvider){
    
    $httpProvider.interceptors.push('authInterceptor'); // ???

    uiGmapGoogleMapApiProvider.configure({
      //    key: 'your api key',
      libraries: 'places' // Required for SearchBox.
    });
  })
  .run(function ($rootScope, $state, TokenService) {
   $rootScope.$on("$stateChangeStart", function(event, toState, toParams, fromState, fromParams){
     if (toState.authenticate && !TokenService.getToken()){
       // User is not authenticated
       $state.transitionTo('login');
       event.preventDefault(); 
     }
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
      .state('singleTrip', {
        url: "/singleTrip",
        templateUrl: "./js/views/singleTrip.html",
        authenticate: true
      })
      .state('newTrip', {
        url: "/newTrip",
        templateUrl: "./js/views/newTrip.html",
        authenticate: true
      })
      .state('viewTrips', {
        url: "/viewTrips",
        templateUrl: "./js/views/viewTrips.html",
        authenticate: true
      })
      .state('editTrip', {
        url: "/editTrip",
        templateUrl: "./js/views/editTrip.html",
        authenticate: true
      })

    $urlRouterProvider.otherwise("/register");
  }
