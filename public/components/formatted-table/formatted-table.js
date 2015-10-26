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
                columns: '=' //this is an array of columns with column data
            },
            link: function (scope, elem, attrs) {
                if(!scope.formatters) scope.formatters = {};
                if(!scope.skippedFields) scope.skippedFields = [];
                scope.skippedFields.push('$$hashKey');

            }
        };
    }]);