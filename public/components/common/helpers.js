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


(function () {
    "use strict";
    /**
     * Iterate over an Object, Array of String with a given callBack function
     * Source: http://michd.me/blog/javascript-foreach-object-array-and-string/
     *
     * @param {Object|Array|String} collection
     * @param {Function} callBack
     * @return {Null}
     */
    function forEach(collection, callBack) {
        var
            i = 0, // Array and string iteration
            iMax = 0, // Collection length storage for loop initialisation
            key = '', // Object iteration
            collectionType = '';

        // Verify that callBack is a function
        if (typeof callBack !== 'function') {
            throw new TypeError("forEach: callBack should be function, " + typeof callBack + "given.");
        }

        // Find out whether collection is array, string or object
        switch (Object.prototype.toString.call(collection)) {
            case "[object Array]":
                collectionType = 'array';
                break;

            case "[object Object]":
                collectionType = 'object';
                break;

            case "[object String]":
                collectionType = 'string';
                break;

            default:
                collectionType = Object.prototype.toString.call(collection);
                throw new TypeError("forEach: collection should be array, object or string, " + collectionType + " given.");
        }

        switch (collectionType) {
            case "array":
                for (i = 0, iMax = collection.length; i < iMax; i += 1) {
                    callBack(collection[i], i);
                }
                break;

            case "string":
                for (i = 0, iMax = collection.length; i < iMax; i += 1) {
                    callBack(collection.charAt(i), i);
                }
                break;

            case "object":
                for (key in collection) {
                    // Omit prototype chain properties and methods
                    if (collection.hasOwnProperty(key)) {
                        callBack(collection[key], key);
                    }
                }
                break;

            default:
                throw new Error("Continuity error in forEach, this should not be possible.");
        }

        return null;
    }

    //Example uses
/*
    // Array example
    forEach(["a", "b", "c"], function (value, index) {
        console.log(index + ": " + value);
    });

    // Object example
    forEach({"foo": "bar", "barfoo": "foobar"}, function (value, key) {
        console.log(key + ": " + value);
    });

    // String example
    forEach("Hello, world!", function (character, index) {
        console.log(index + ": " + character);
    });
*/
}());