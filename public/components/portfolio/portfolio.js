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
            stock_positions: {url: '/api/stock/positions', method: 'GET'}
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
                },
                'cash_change': function(num){
                    return Math.round(num*100)/100;
                }
            };
            PortfolioService.stock_positions(function (result) {
                var data = result.data;
                console.log(data);
                $scope.cash = data.balance;
                $scope.total_income = data.income;
                $scope.weekly_income = 1000;
                $scope.positions = [];
                for(var ticker in data.portfolio){
                    var pos = data.portfolio[ticker];
                    pos.ticker = ticker;
                    $scope.positions.push(pos);
                }
                console.log($scope.positions, 'pos')
                $scope.transactions = data.transactions;
            });
        });
    }
}());