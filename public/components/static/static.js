var moduleName = 'static';
angularModules.push(moduleName);
angular.module(moduleName, []).
    config(['$routeProvider', function($routeProvider) {
        var pages = [
            'home'
        ];
        var pagesWithControllers = []
        helpers.addPagesToRouteProvider($routeProvider, pages, pagesWithControllers, 'static/');
    }]);