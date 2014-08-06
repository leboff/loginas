'use strict';


// Declare app level module which depends on filters, and services
angular.module('loginas', [
  'ngRoute',
  'loginas.filters',
  'loginas.services',
  'loginas.directives',
  'loginas.controllers'
]).
config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/home', {templateUrl: 'partials/user-list.html'});
  $routeProvider.otherwise({redirectTo: '/home'});
}]);