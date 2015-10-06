'use strict';

var moduleName = 'common.filters';
angularModules.push(moduleName);
angular.module(moduleName, []).
    filter('interpolate', function (version) {
      return function (text) {
        return String(text).replace(/\%VERSION\%/mg, version);
      };
    }).
    filter('lastOfPath', function () {
      return function (pathStr) {
        var out = '';
        _.each(pathStr.split('/'), function(pathEl){
          if(pathEl){
            out = pathEl;
          }
        });
        return out;
      };
    }).
    filter('underscoreToSpace', function () {
      return function (str) {
        return str.split('_').join(' ');
      };
    }).
    filter('keepSorted', function () {
      /*
       * When you pass an object into ng-repeat, it sorts it by alphabetical order by
       * default. This overrides it and keeps them sorted the way the object was defined.
       */
      return function(input) {
        if (!input) {
          return [];
        }
        return Object.keys(input);
      };

    }).
    filter('capitalize', function () {
      return function (input) {
        if (input) {
          input = input.toLowerCase();
          return input.substring(0, 1).toUpperCase() + input.substring(1);
        }
      };

    }).
    filter('camelCaseToSpaces', function() {
      return function(input) {
        return input
          // insert a space before all caps
            .replace(/([A-Z])/g, ' $1')
          // uppercase the first character
            .replace(/^./, function(str) {
              return str.toUpperCase();
            }).trim();
      };
      //modified from: https://stackoverflow.com/questions/4149276/javascript-camelcase-to-regular-form
    });

