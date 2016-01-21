(function () {
    'use strict';
    /*global window,angular */
    angular.module('app')
        .config(['$httpProvider', function ($httpProvider) {
            $httpProvider.interceptors.push('httpInterceptor');
        }])
        .factory('httpInterceptor', function ($q, $injector, $cookies, $log, $location, userInfo, apiDpWeb, globalAlert) {
            var httpInterceptor = {
                'request': function(config) {
                    config.headers['X-CSRF-Token'] = $cookies['X-CSRF-Token'];
                    return config;
                },
                'responseError': function (response) {
                    $log.error("response error:", response);
                    if(response.status == 401){
                        var redirect_url = response.data.redirect_url,
                            goto = (window.location.href);
                        if(redirect_url){
                            redirect_url = redirect_url.replace(/goto=[^&]+/i, ('goto='+goto));

                            window.location.replace(redirect_url);
                        }
                    }else if (response.status === 520) {
                        globalAlert.addAlert('error', response.data.message);
                    } else {
                        globalAlert.addAlert('error', response.statusText);
                    }

                    return $q.reject(response);
                },
                'response': function (response) {
                    /*if((response.status==403) && angular.isString(response.redirect_url)) {
                        var currPath = $location.absUrl();
                        window.location.replace(response.redirect_url + "&goto=" + encodeURIComponent(currPath));
                        userInfo.email = $cookieStore.get('USERNAME');

                    }*/
                    /*switch (response.status) {
                        case (200):

                        case (500):
                            topAlert.addAlert("Error", "Error form server");
                            break;
                        case (401):
                            topAlert.addAlert("Error", "Not logged in");
                            break;
                        case (403):
                            topAlert.addAlert("Error", "No right");
                            break;
                        case (408):
                            topAlert.addAlert("Error", "Out of time");
                            break;
                        default:
                            topAlert.addAlert("Error", "Unknown error");
                    }*/

                    return response;
                }
            };

            // This interceptor isn't push into response processing chain, is it used?
            return httpInterceptor;
        })
        .value("userInfo", function ($cookieStore) {
            return {
                "email": $cookieStore.get('USERNAME'),
                "userId": "",
                "firstName": "",
                "lastName": ""
            };
        });


}());


jQuery.extend({
    stringify  : function stringify(obj) {
        var t = typeof (obj);
        if (t != "object" || obj === null) {
            // simple data type
            if (t == "string") obj = '"' + obj + '"';
            return String(obj);
        } else {
            // recurse array or object
            var n, v, json = [], arr = (obj && obj.constructor == Array);

            for (n in obj) {
                v = obj[n];
                t = typeof(v);
                if (obj.hasOwnProperty(n)) {
                    if (t == "string") v = '"' + v + '"'; else if (t == "object" && v !== null) v = jQuery.stringify(v);
                    json.push((arr ? "" : '"' + n + '":') + String(v));
                }
            }
            return (arr ? "[" : "{") + String(json) + (arr ? "]" : "}");
        }
    }
});