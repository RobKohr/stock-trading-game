'use strict';

var moduleName = 'notify';

angularModules.push(moduleName);
angular.module(moduleName, []).
    factory('NotifyService', ['$resource', '$rootScope', '$location', '$timeout', function($resource, $rootScope, $location, $timeout) {
        var NotifyService = {};

        NotifyService.errors = [];
        NotifyService.messages = [];
        NotifyService.showErrors = function(arr){
            createTimedMessages(arr, NotifyService.errors);
        }

        NotifyService.showMessages = function(arr){
            createTimedMessages(arr, NotifyService.messages);
        }

        NotifyService.handleResponseMessages = function(response){
            var success = true;
            if(response.message){
                NotifyService.showMessages([response.message]);
            }
            if(response.messages){
                NotifyService.showMessages(response.messages);
            }
            if(response.error){
                success = false;
                NotifyService.showErrors([response.error]);
            }
            if(response.errors){
                success = false;
                NotifyService.showErrors(response.errors);
            }
            if(typeof(response.success)!='undefined'){
                success = response.success;
            }
            return success;
        }

        var createTimedMessages = function(arr, collection){
            if(!arr) return;
            if(typeof(arr)=='string') arr = [arr];
            var timeLimit = 2000;
            _.each(arr, function(el){
                if(collection.indexOf(el)!==-1){
                    return;//don't add it twice
                }
                collection.push(el);
                $timeout(function removeElement(){
                    collection.removeMatch(el);
                }, timeLimit);
            });
        };

        return NotifyService;
    }]).
    directive('notify', ['$rootScope', 'NotifyService', function ($rootScope, NotifyService) {
        return {
            restrict: 'E',
            templateUrl: 'components/notify/notify.html',
            scope : {
                interface: '='
            },
            link: function (scope, elem, attrs) {
                scope.errors = NotifyService.errors;
                scope.messages = NotifyService.messages;
            }
        };
    }]);
