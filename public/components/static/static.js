var moduleName = 'static';
angularModules.push(moduleName);

(function () {
    angular.module(moduleName, []).
        config(['$routeProvider', config]);


    function config($routeProvider) {
        var pages = [];
        var pagesWithControllers = []
        helpers.addPagesToRouteProvider($routeProvider, pages, pagesWithControllers, 'static/');
    }
}());