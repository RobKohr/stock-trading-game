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

    factory('AuthService', ['ResourceHelperService', '$rootScope', '$location', 'NotifyService', function(ResourceHelperService, $rootScope, $location, NotifyService) {
        var AuthService = ResourceHelperService.createResources({
            login_status: {url: '/api/auth/login_status', method: 'GET'},
            login: {url: '/api/auth/login'},
            logout: {url: '/api/auth/logout'},
            register: {url: '/api/auth/register'},
            getUserFromToken: {url: '/api/auth/user_from_token'},
        })
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
            AuthService.login({username:$scope.username, password:$scope.password}, function(result){
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
            if(!$scope.username){
                NotifyService.showErrors(['Username not set']);
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