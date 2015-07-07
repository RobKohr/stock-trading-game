'use strict';

var moduleName = 'account';
angularModules.push(moduleName);
angular.module(moduleName, []).
    config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
        var pages = [
            'account/summary', 'account/performance', 'account/transactions', 'account/account_info'
        ];
        var pagesWithControllers = [
            'account/summary', 'account/performance', 'account/transactions', 'account/account_info'
        ]

        helpers.addPagesToRouteProvider($routeProvider, pages, pagesWithControllers);

        $routeProvider.
            when('/account', {
                redirectTo: '/account/summary'
            });

    }]).

    factory('AccountService', ['$resource', function($resource) {
        return $resource('/api/', {}, {
            account_info: {
                method: 'GET',
                url: '/api/account_info',
                isArray: false
            },
            summary: {
                method: 'GET',
                url: '/api/summary',
                isArray: false
            },
            performance: {
                method: 'GET',
                url: '/api/performance',
                isArray: false
            },
            transactions: {
                method: 'GET',
                url: '/api/transactions',
                isArray: false
            }
        });
    }]).

    controller('AccountAccount_infoCtrl', ['$scope', 'AccountService', '$rootScope', 'AuthService', 'NotifyService', function ($scope, AccountService, $rootScope, AuthService, NotifyService) {
        console.log('in account info ctrl');
        if(!AuthService.requireLogin()) return;
        $scope.tableData = [];
        $scope.skippedFields = ['userId', 'token', 'email_sent', 'password', '$promise', '$resolved'];
        AccountService.account_info(function(result){
            console.log(result);
            if(NotifyService.handleResponseMessages(result)){
                $scope.tableData = result.data;
            }
        })
    }]).
    controller('AccountSummaryCtrl', ['$scope', 'AccountService', '$rootScope', 'AuthService', 'NotifyService', function ($scope, AccountService, $rootScope, AuthService, NotifyService) {
        if(!AuthService.requireLogin()) return;
        $scope.tableData = [];
        $scope.skippedFields = ['$$hashKey'];

        $scope.formatters = {
            'date':function(str){
                return moment(str).format('MM/DD/YYYY')
            },
            'value':helpers.floor2,
            'hurdleValue':helpers.floor2,
            'lossValue':helpers.floor2,
            'feeCharged':helpers.floor2
        }

        AccountService.summary(function(result){
            if(NotifyService.handleResponseMessages(result)){
                $scope.tableData = result.data;
            }
        });
    }]).
    controller('AccountPerformanceCtrl', ['$scope', 'AccountService', '$rootScope', 'AuthService', 'NotifyService', function ($scope, AccountService, $rootScope, AuthService, NotifyService) {
        if(!AuthService.requireLogin()) return;
        $scope.tableData = [];
        $scope.skippedFields = ['$$hashKey', 'sp500'];
        $scope.formatters = {
            'date':function(str){
                return moment(str).format('MM/DD/YYYY')
            },
            'value':helpers.floor2,
            'sp500':helpers.floor2,
            'returns':helpers.percentFormatDecimal,
            'sp500returns':helpers.percentFormatDecimal
        }
        $scope.relabel = {
            sp500returns:'S&P'
        }
        AccountService.performance(function(result){

            if(!NotifyService.handleResponseMessages(result)){
                return;
            }
            var performanceData = result.data;
            if(!performanceData.length){
                $scope.tableData = [{error:'Performance records not available'}];
            }
            $scope.dataset = [];
            $scope.schema = {
                date: {
                    type: 'datetime',
                    format: '%m-%d-%Y',
                    name: 'Date'
                },
                returns: {
                    name:"SEF"
                },
                sp500returns:{
                    name:'S&P'
                }

            };
            $scope.options = {
                rows: [{
                    key: 'returns',
                }, {
                    key: 'sp500returns'
                }],
                xAxis: {
                    key: 'date',
                    displayFormat: '%m-%d-%Y'
                }
            };
            var baseline = performanceData[0];
            var baselineReturn = baseline.value;
            var baselineSP500 = baseline.sp500;
            _.each(performanceData, function(row){
                row.returns = Math.floor(100*row.value/baselineReturn)/100;
                row.sp500returns = Math.floor(100*row.sp500/baselineSP500)/100;
                row.date = new Date(row.date);
            });

            $scope.dataset = performanceData;
            console.log($scope.dataset);
            $scope.tableData = performanceData;
        })
    }]).
    controller('AccountTransactionsCtrl', ['$scope', 'AccountService', '$rootScope', 'AuthService', 'NotifyService', function ($scope, AccountService, $rootScope, AuthService, NotifyService) {
        if(!AuthService.requireLogin()) return;
        $scope.tableData = [];
        $scope.skippedFields = ['$$hashKey'];
        $scope.formatters = {
            'date':function(str){
                return moment(str).format('MM/DD/YYYY')
            },
            'amount':helpers.floor2,
        }
        AccountService.transactions(function(result){
            if(NotifyService.handleResponseMessages(result)){
                $scope.tableData = result.data;
            }
        })
    }]);
