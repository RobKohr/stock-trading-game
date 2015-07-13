'use strict';
var moduleName = 'home';
angularModules.push(moduleName);
(function () {
    angular.module(moduleName, []).
        config(['$routeProvider', config]).
        factory('HomeService', ['ResourceHelperService', HomeService]).
        controller('HomeCtrl', ['$scope', 'HomeService', 'NotifyService', HomeCtrl]);


    function config($routeProvider) {
        var pages = [
            'home'
        ];
        var pagesWithControllers = [
            'home'
        ]
        helpers.addPagesToRouteProvider($routeProvider, pages, pagesWithControllers, 'home/');
    }

    function HomeService(ResourceHelperService) {

    }

    function HomeCtrl($scope, HomeService, NotifyService) {

    }
}());