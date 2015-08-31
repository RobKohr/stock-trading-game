'use strict';
console.log('modules,', angularModules)
// Declare app level module which depends on views, and components
angular.module('myApp', [
    'ngRoute',
    'ngResource',
    'common.filters',
    'angularChart'
].concat(angularModules)).
    config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
        $routeProvider.
            otherwise({
                redirectTo: '/home'
            });
        $locationProvider.html5Mode(true);
    }]).
    controller('AppCtrl', ['$scope', '$http', '$rootScope', '$location', 'AuthService', '$timeout', function ($scope, $http, $rootScope, $location, AuthService, $timeout) {

        function authUpdateInAppCtrl(scopeData, loggedInUser){
            var basePages = ['home', 'strategy', 'contact'];
            $scope.pages = basePages;
            if(typeof(loggedInUser)!='undefined'){
                $scope.pages = basePages.concat(['logout']);
            }else{
                $scope.pages = basePages.concat(['login']);
            }
        }
        $rootScope.$on('auth.updateUserLoggedIn', authUpdateInAppCtrl);
        authUpdateInAppCtrl(null, $rootScope.loggedInUserId);
        $scope.AuthService = AuthService;
        AuthService.login_status(function(result){
            console.log('status', result);
        })
        console.log(AuthService.loggedInUser);
        $scope.location = $location;
        $scope.rootScope = $rootScope;
        $('body').show();

        $rootScope.$on('$routeChangeSuccess', function(e, current, pre) {
            $scope.activePage = $location.path().split('/')[1];
            $scope.isfooter2 = ['/home', '/terms', '/policy'].indexOf($location.path())<0 ? true : false;
            $scope.rootScope.inAccount = ($scope.activePage === 'account');
        });
    }]);
