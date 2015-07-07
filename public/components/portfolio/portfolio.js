'use strict';
var moduleName = 'portfolio';
angularModules.push(moduleName);
angular.module(moduleName, []).
    config(['$routeProvider', function($routeProvider) {
        var pages = [
            'portfolio'
        ];
        var pagesWithControllers = [
            'portfolio'
        ]

        helpers.addPagesToRouteProvider($routeProvider, pages, pagesWithControllers, 'portfolio/');

    }]).

    factory('PortfolioService', ['ResourceHelperService', function(ResourceHelperService) {
        return ResourceHelperService.createResources({
            stock_positions: {url: '/api/stock_positions', method: 'GET'}
        })
    }]).

    controller('PortfolioCtrl', ['$scope', 'PortfolioService', 'NotifyService', function ($scope, PortfolioService, NotifyService) {
        //if(!AuthService.requireLogin()) return;
        $scope.tableData = [];
        $scope.skippedFields = ['$$hashKey'];

        $scope.formatters = {
            'date':function(str){
                return moment(str).format('MM/DD/YYYY')
            }
        };
        console.log('hello');
        PortfolioService.stock_positions(function(result){
            if(!result) return;
            if(NotifyService.handleResponseMessages(result)){
                console.log('b', result);
                $scope.tableData = result.data;
            }
        });

    }]);
