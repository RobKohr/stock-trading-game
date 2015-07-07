'use strict';
var moduleName = 'user-funds';
angularModules.push(moduleName);
angular.module(moduleName, []).

    factory('UserFundsService', ['ResourceHelperService', function(ResourceHelperService) {
        var currentFunds = null;
        var UserFundsService =  ResourceHelperService.createResources({
            funds: {url: '/api/funds', method: 'GET'}
        })
        UserFundsService.getFunds = function(callback, forceUpdate){
            if(currentFunds && !forceUpdate){
                return currentFunds;
            }
            UserFundsService.funds(function(funds){
                currentFunds = funds;
                callback(funds);
            })
        }
        UserFundsService.updateFunds = function(callback){
            UserFundsService.getFunds(callback, true);
        };
    }]);
