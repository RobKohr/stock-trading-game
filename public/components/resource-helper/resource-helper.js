'use strict';

/*
 Provides an easy resource object creator
 */
(function() {
    var moduleName = 'resource-helper';
    angular.module(moduleName, ['notify']).
        factory('ResourceHelperService', ['$resource', '$location', 'NotifyService', ResourceHelperService]);

    function ResourceHelperService($resource, $location, NotifyService) {
        var overrideObject = function (obj, overrides) {
            if ((!overrides) || (typeof(overrides) != object)) {
                return obj;
            }
            for (var key in overrides) {
                obj[key] = overrides[key];
            }
            return obj;
        }

        var ResourceHelperService = {
            createResources: function (resources) {
                var resourceObj = {};
                for (var key in resources) {
                    var resource = resources[key];
                    resourceObj[key] = ResourceHelperService.createResource(resource.method, resource.url, resource.overrides);
                }
                return $resource('', {}, resourceObj);
            },
            createResource: function (method, url, overrides) {
                if (method == 'GET') {
                    return ResourceHelperService.resourceGet(url, overrides);
                } else {
                    return ResourceHelperService.resourcePost(url, overrides);
                }
            },
            resourceGet: function (url, overrides) {
                var out =
                {
                    method: 'GET',
                    url: url,
                    isArray: false,
                    interceptor: {
                        response: function (response) {
                            var data = response.data;
                            if (data.redirect) {
                                $location.path(data.redirect + '?redirect_from=' + window.encodeURIComponent($location.path()));
                                console.log('e' + data.redirect + '?redirect_from=' + window.encodeURIComponent($location.path()));
                            }
                            NotifyService.handleResponseMessages(data);
                            return response.data;
                        },
                        responseError: function (rejection) {
                            console.log(rejection);
                        }
                    }
                };
                return overrideObject(out, overrides);
            },

            resourcePost: function (url, overrides) {
                var out = ResourceHelperService.resourceGet(url);
                out.method = "POST";
                out.headers = {'content-type': 'application/x-www-form-urlencoded'};
                out.transformRequest = $.param;
                return overrideObject(out, overrides);
            }
        }
        return ResourceHelperService;
    };
})();