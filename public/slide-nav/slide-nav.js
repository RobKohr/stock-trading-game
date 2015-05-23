'use strict';
moduleList.push('slide-nav');
angular.module('slide-nav', ['ngRoute'])

.controller('SlideNavCtrl', ['$scope', '$rootScope', function($scope, $rootScope) {
	$scope.navItems = [
		'home',
		'buy',
		'sell',
		'order',
		'events',
		'markets',
	]
	$scope.rootScope = $rootScope;
	$rootScope.navToggle = false;

	console.log('slidenav controller');
}]);