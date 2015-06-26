'use strict';

var moduleName = 'auth';
angularModules.push(moduleName);
angular.module(moduleName, []).

    config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
        var pages = [
            'login', 'register', 'logout'
        ];
        var pagesWithControllers = [
            'login', 'register', 'logout'
        ];


        helpers.addPagesToRouteProvider($routeProvider, pages, pagesWithControllers, 'auth/');
    }]).

    service('AuthService', ['$resource', '$rootScope', '$location', 'NotifyService', function($resource, $rootScope, $location, NotifyService) {


        var AuthService = $resource('/api/auth', {}, {
            login_status: {
                method: 'GET',
                url: '/api/auth/login_status',
                isArray: false
            },
            login: {
                method: 'POST',
                url: '/api/auth/login',
                isArray: false,
                headers: { 'content-type': 'application/x-www-form-urlencoded' },
                transformRequest: $.param
            },
            logout: {
                method: 'POST',
                url: '/api/auth/logout',
                isArray: false,
                headers: { 'content-type': 'application/x-www-form-urlencoded' },
                transformRequest: $.param
            },
            register: {
                method: 'POST',
                url: '/api/auth/register',
                isArray: false,
                headers: { 'content-type': 'application/x-www-form-urlencoded' },
                transformRequest: $.param
            },
            getUserFromToken: {
                method: 'POST',
                url: '/api/auth/user_from_token',
                isArray: false,
                headers: { 'content-type': 'application/x-www-form-urlencoded' },
                transformRequest: $.param,
            }
        });
        AuthService.loggedInUserId = null;

        AuthService.requireLogin = function(){
            if(!AuthService.loggedInUserId){
                NotifyService.showErrors(['Login required']);
                $location.path('/login');
            }
            return AuthService.loggedInUserId;
        };
        //start by checking login status
        AuthService.login_status(function(result){
            AuthService.loggedInUserId = result.loggedInUserId;
            $rootScope.$broadcast('auth.updateUserLoggedIn', result.loggedInUserId);
        });
        return AuthService;
    }]).

    controller('LogoutCtrl', ['$scope', '$rootScope', '$location', 'AuthService', 'NotifyService', function ($scope, $rootScope, $location, AuthService, NotifyService) {
        $location.path('/home');
        AuthService.logout({}, function(result){
            NotifyService.handleResponseMessages(result);
            if(result.success){
                AuthService.loggedInUserId = result.loggedInUserId;
                $rootScope.$broadcast('auth.updateUserLoggedIn', result.loggedInUserId);
            }
        });
    }]).

    controller('LoginCtrl', ['$scope', '$rootScope', '$location', 'AuthService', 'NotifyService', function ($scope, $rootScope, $location, AuthService, NotifyService) {

        $scope.submit = function() {
            AuthService.login({email:$scope.email, password:$scope.password}, function(result){
                NotifyService.handleResponseMessages(result);
                console.log(result);
                if(result.success){
                    AuthService.loggedInUserId = result.loggedInUserId;
                    $rootScope.$broadcast('auth.updateUserLoggedIn', result.loggedInUserId);

                }
            });
        };
    }]).

    controller('RegisterCtrl', ['$scope', '$rootScope', '$location', 'AuthService', '$routeParams', 'NotifyService',  function ($scope, $rootScope, $location, AuthService, $routeParams, NotifyService ) {
        var token = $routeParams.token;
        $scope.submit = null;
        //this will be assigned to scope.submit after auth service gets token and email back
        var submit = function() {

            if(!$scope.token){
                NotifyService.showErrors(['Token not set']);
            }
            if(!$scope.email){
                NotifyService.showErrors(['Email not set']);
            }
            if($scope.password != $scope.retype_password){
                NotifyService.showErrors(['Password and Retype Password do not match.']);
                $scope.password = '';
                $scope.retype_password = '';
                return;
            }
            if( ( !$scope.password) || ($scope.password.length < 8)){
                NotifyService.showErrors(['Password must be at least 8 characters long.']);
                return;
            }


            //password is valid, update user
            var registration = {
                token: $scope.token,
                password: $scope.password,
                email: $scope.email
            };

            AuthService.register(registration, function(result){
                NotifyService.handleResponseMessages(result)
                if(result.success){
                    $location.path('/login');
                }
            });

        }

        AuthService.getUserFromToken({token:token}, function(user){
            $scope.token = token;
            $scope.email = user.email;
            $scope.submit = submit;
        });

    }]);