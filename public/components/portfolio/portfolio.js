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

            $scope.positions_columns = [
                {
                    key: 'quantity',
                    label: 'Quantity',
                    filter: 'currency : "" : 0'
                },
                {
                    key:'ticker',
                    label: 'Ticker',
                    template: 'components/portfolio/column_ticker.html'
                }
            ];
            $scope.transactions_columns = [
                {
                    key:'cash_change',
                    label: 'Cash Change',
                    filter: 'currency : $ : 2'
                },
                {
                    key:'stock_change',
                    label:'Stock Change'
                },
                {
                    key:'ticker',
                    label: 'Ticker',
                    template: 'components/portfolio/column_ticker.html'
                }
            ];

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
                console.log(data.transactions)
            });
        });
    }
}());