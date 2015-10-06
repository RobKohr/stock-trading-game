(function() {
  'use strict';

  var moduleName = 'stock-services';
  angularModules.push(moduleName);

  angular.module(moduleName, ['resource-helper']).
      config(['$routeProvider', config]).
      factory('StockService', ['ResourceHelperService', '$rootScope', '$location', 'NotifyService', StockService]).
      controller('LogoutCtrl', ['$rootScope', '$location', 'AuthService', 'NotifyService', LogoutCtrl]).
      controller('LoginCtrl', ['$scope', '$rootScope', '$location', 'AuthService', 'NotifyService', LoginCtrl]).
      controller('RegisterCtrl', ['$scope', '$location', 'AuthService', 'NotifyService', RegisterCtrl]);

  function config($routeProvider) {
   //no paths available for this module
  }

  function StockService(ResourceHelperService, $rootScope, $location, NotifyService) {
    var service = ResourceHelperService.createResources({
      search: {url: '/api/stock/search', method: 'GET'},
      quote: {url: '/api/stock/quote'},
      buy: {url: '/api/stock/buy'},
      sell: {url: '/api/stock/sell'}
    });
    return service;
  }

})();