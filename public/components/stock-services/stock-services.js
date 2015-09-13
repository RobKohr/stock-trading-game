(function() {
  'use strict';

  var moduleName = 'stock-services';
  angularModules.push(moduleName);

  angular.module(moduleName, ['resource-helper']).
      config(['$routeProvider', config]).
      factory('AuthService', ['ResourceHelperService', '$rootScope', '$location', 'NotifyService', AuthService]).
      controller('LogoutCtrl', ['$rootScope', '$location', 'AuthService', 'NotifyService', LogoutCtrl]).
      controller('LoginCtrl', ['$scope', '$rootScope', '$location', 'AuthService', 'NotifyService', LoginCtrl]).
      controller('RegisterCtrl', ['$scope', '$location', 'AuthService', 'NotifyService', RegisterCtrl]);

  function config($routeProvider) {
   //no paths available for this module
  }

  function AuthService(ResourceHelperService, $rootScope, $location, NotifyService) {
    var service = ResourceHelperService.createResources({
      stock_search: {url: '/api/stock/search', method: 'GET'},
      stock_price: {url: '/api/stock/price'},
      stock_buy: {url: '/api/stock/buy'},
      stock_sell: {url: '/api/stock/sell'}
    });
    return service;
  }

})();