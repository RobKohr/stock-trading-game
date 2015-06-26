/*
    Kept as a global variable rather than an angular module.
     This way we don't need to include it all of the time.
 */
var helpers = {
    floor2: function(input){
        var num = 2;
        var out = input * Math.pow(10, num);
        out = Math.floor(out);
        out = out / Math.pow(10, num)
        out = parseFloat(Math.round(out * 100) / 100).toFixed(2);
        return out;
    },
    percentFormatDecimal: function(input){

        return input*100 + '%';
    },
    capitalizeFirstLetter: function(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    },
    pathToControllerName: function(path, pagesWithControllers){
        if(!pagesWithControllers) pagesWithControllers = [];

        if(pagesWithControllers.indexOf(path)===-1){
            return null;
        }
        path = path.split('/');
        var out = '';
        _.each(path, function(path_element){
            out+=helpers.capitalizeFirstLetter(path_element);
        });
        out += 'Ctrl';
        return out;
    },
    addPagesToRouteProvider: function($routeProvider, pages, pagesWithControllers, extraViewPath){
        if(!extraViewPath) extraViewPath = '';
        for(var i in pages){
            var page = pages[i];
            $routeProvider.
                when('/'+page, {
                    templateUrl: '/components/'+extraViewPath+page+'.html',
                    controller: helpers.pathToControllerName(page, pagesWithControllers)
                });
        }
    }
};

var angularModules = [];

Array.prototype.removeMatch = function() {
    var what, a = arguments, L = a.length, ax;
    while (L && this.length) {
        what = a[--L];
        while ((ax = this.indexOf(what)) !== -1) {
            this.splice(ax, 1);
        }
    }
    return this;
};