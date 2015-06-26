'use strict';

var moduleName = 'formatted-table';
angularModules.push(moduleName);

angular.module(moduleName, []).
    directive('formattedTable', ['$rootScope', 'NotifyService', function ($rootScope, NotifyService) {
        return {
            restrict: 'E',
            templateUrl: '/components/formatted-table/formatted-table.html',
            scope : {
                tableData: '=',
                skippedFields: '=',
                formatters: '='
            },
            link: function (scope, elem, attrs) {
                console.log('here');
                if(!scope.formatters) scope.formatters = {};
                if(!scope.skippedFields) scope.skippedFields = [];
                scope.skippedFields.push('$$hashKey');
            }
        };
    }]);