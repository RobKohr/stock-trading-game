'use strict';

// Declare app level module which depends on views, and components
angular.module('myApp', moduleList).

config(['$routeProvider', function($routeProvider) {
  $routeProvider.otherwise({redirectTo: '/home'});
}]).

controller('BodyCtrl', ['$scope', '$rootScope', function($scope, $rootScope) {
 	$('body').show();
}]).

filter('commaNumber', function () {

  return function (input) {
    return input.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

}).
filter('floor', function () {

  return function (input) {
    return Math.floor(input);
  };

});
