(function() {
  'use strict';

  var moduleName = 'auth';
  angularModules.push(moduleName);

  angular.module(moduleName, ['resource-helper']).
      config(['$routeProvider', config]).
      factory('AuthService', ['ResourceHelperService', '$rootScope', '$location', 'NotifyService', AuthService]).
      controller('LogoutCtrl', ['$rootScope', '$location', 'AuthService', 'NotifyService', LogoutCtrl]).
      controller('LoginCtrl', ['$scope', '$rootScope', '$location', 'AuthService', 'NotifyService', LoginCtrl]).
      controller('RegisterCtrl', ['$scope', '$location', 'AuthService', 'NotifyService', RegisterCtrl]);

  function config($routeProvider) {
    var pages = [
      'login', 'register', 'logout'
    ];
    var pagesWithControllers = [
      'login', 'register', 'logout'
    ];

    helpers.addPagesToRouteProvider($routeProvider, pages, pagesWithControllers, 'auth/');
  }

  function AuthService(ResourceHelperService, $rootScope, $location, NotifyService) {
    var AuthService = ResourceHelperService.createResources({
      login_status: {url: '/api/auth/login_status', method: 'GET'},
      login: {url: '/api/auth/login'},
      logout: {url: '/api/auth/logout'},
      register: {url: '/api/auth/register'},
      getUserFromToken: {url: '/api/auth/user_from_token'}
    });
    AuthService.loggedInUser = null;

    AuthService.requireLogin = function (callback) {
      if (!AuthService.loggedInUser) {
        AuthService.login_status(function(result){
          AuthService.loggedInUser = result.user;

          if(!AuthService.loggedInUser) {
            NotifyService.showErrors(['Login required']);
            if (!AuthService.redirectToAfterLogin) {
              AuthService.redirectToAfterLogin = $location.path();
            }
            console.log('/login');
            $location.path('/login');
            callback(AuthService.loggedInUser)
          }else{
            callback(AuthService.loggedInUser);
          }
        });
      }
      callback(AuthService.loggedInUser);
    };
    //start by checking login status
    AuthService.login_status(function (result) {
      AuthService.loggedInUser = result.loggedInUser;
      $rootScope.$broadcast('auth.updateUserLoggedIn', result.loggedInUser);
    });
    return AuthService;
  }

  function LogoutCtrl($rootScope, $location, AuthService, NotifyService) {
    $location.path('/home');
    console.log('logging out')
    AuthService.logout({}, function (result) {
      NotifyService.handleResponseMessages(result);
      if (result.success) {
        AuthService.loggedInUser = null;
        $rootScope.$broadcast('auth.updateUserLoggedIn', result.loggedInUser);
      }
    });
  }

  function LoginCtrl($scope, $rootScope, $location, AuthService, NotifyService) {
    $scope.location = $location;
    $scope.submit = function () {
      AuthService.login({username: $scope.username, password: $scope.password}, function (result) {
        NotifyService.handleResponseMessages(result);
        if (result.success) {
          AuthService.loggedInUser = result.user;
          $rootScope.$broadcast('auth.updateUserLoggedIn', result.loggedInUser);
          if (AuthService.redirectToAfterLogin) {
            $location.path(AuthService.redirectToAfterLogin);
            AuthService.redirectToAfterLogin = null;
          } else {
            $location.path('/home');
          }

        }
      });
    };
  }

  function RegisterCtrl($scope, $location, AuthService, NotifyService) {
    $scope.submit = null;
    //this will be assigned to scope.submit after auth service gets token and email back
    $scope.submit = function () {
      if (!$scope.username) {
        NotifyService.showErrors(['Username not set']);
      }
      if ($scope.password != $scope.retype_password) {
        NotifyService.showErrors(['Password and Retype Password do not match.']);
        $scope.password = '';
        $scope.retype_password = '';
        return;
      }
      if (( !$scope.password) || ($scope.password.length < 8)) {
        NotifyService.showErrors(['Password must be at least 8 characters long.']);
        return;
      }


      //password is valid, update user
      var registration = {
        password: $scope.password,
        username: $scope.username
      };

      AuthService.register(registration, function (result) {
        NotifyService.handleResponseMessages(result);
        if (result.success) {
          if (!AuthService.redirectToAfterLogin) {
            AuthService.redirectToAfterLogin = $location.path();
          }
          $location.path('/login');
        }
      });

    }


  }
})();