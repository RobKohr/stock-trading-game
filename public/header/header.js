'use strict';
moduleList.push('header');
angular.module('header', ['ngRoute'])

.controller('HeaderCtrl', ['$scope', '$rootScope', function($scope, $rootScope) {
	$scope.rootScope = $rootScope;
 	$rootScope.navToggle = false;
	$scope.cash = 993423.23;
	$scope.worth = 343423.23;
	$scope.rating = 85.99;
	console.log('header')
}]);