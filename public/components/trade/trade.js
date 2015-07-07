'use strict';
var moduleName = 'trade';
angularModules.push(moduleName);
angular.module(moduleName, []).
    config(['$routeProvider', function($routeProvider) {
        var pages = [
            'trade'
        ];
        var pagesWithControllers = [
            'trade'
        ]

        helpers.addPagesToRouteProvider($routeProvider, pages, pagesWithControllers, 'trade/');

    }]).

    factory('TradeService', ['ResourceHelperService', function(ResourceHelperService) {
        return ResourceHelperService.createResources({
            buy: {url: '/api/trade/buy', method: 'POST'},
            sell: {url: '/api/trade/sell', method: 'POST'}
        })
    }]).

    controller('TradeCtrl', ['$scope', 'TradeService', function ($scope, PortfolioService) {
        $scope.transaction_type = 'buy';
        $scope.max_amount = 100;
    }]);
