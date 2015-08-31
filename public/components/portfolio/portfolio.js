'use strict';
var moduleName = 'portfolio';
angularModules.push(moduleName);
(function () {
    angular.module(moduleName, []).
        config(['$routeProvider', config]).
        factory('PortfolioService', ['ResourceHelperService', PortfolioService]).
        controller('PortfolioCtrl', ['$scope', 'AuthService', 'PortfolioService', 'NotifyService', PortfolioCtrl]);


    function config($routeProvider) {
        var pages = [
            'portfolio'
        ];
        var pagesWithControllers = [
            'portfolio'
        ]
        helpers.addPagesToRouteProvider($routeProvider, pages, pagesWithControllers, 'portfolio/');
    }

    function PortfolioService(ResourceHelperService) {
        return ResourceHelperService.createResources({
            stock_positions: {url: '/api/stock_positions', method: 'GET'}
        })
    }

    function PortfolioCtrl($scope, AuthService,  PortfolioService, NotifyService) {
        AuthService.requireLogin(function(user) {
            if(!user){
                console.log('NO USER');
                return;
            }

            $scope.tableData = [];
            $scope.skippedFields = ['$$hashKey'];

            $scope.formatters = {
                'date': function (str) {
                    return moment(str).format('MM/DD/YYYY')
                }
            };
            PortfolioService.stock_positions(function (result) {
                if (!result) return;
                if (NotifyService.handleResponseMessages(result)) {
                    console.log('b', result);
                    $scope.tableData = result.data;
                }
            });
        });
    }
}());