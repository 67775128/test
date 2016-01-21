// config
var app = app || {};
(function () {
    'use strict';

    angular.module('app')
        .config(
        ['$controllerProvider', '$compileProvider', '$filterProvider', '$provide',
            function ($controllerProvider, $compileProvider, $filterProvider, $provide) {

                // lazy controller, directive and service
                app.controller = $controllerProvider.register;
                app.directive = $compileProvider.directive;
                app.filter = $filterProvider.register;
                app.factory = $provide.factory;
                app.service = $provide.service;
                app.constant = $provide.constant;
                app.value = $provide.value;
            }
        ])
        .config(['$translateProvider',
            function ($translateProvider) {
                // Register a loader for the static files
                // So, the module will search missing translation tables under the specified urls.
                // Those urls are [prefix][langKey][suffix].
                $translateProvider.useStaticFilesLoader({
                    prefix: 'i18n/',
                    suffix: '.json'
                });
                // Tell the module what language to use by default
                $translateProvider.preferredLanguage('en');
                // Tell the module to store the language in the local storage
                $translateProvider.useLocalStorage();
            }
        ])
        .run(function ($http, $rootScope, $state, uploadedImageBaseUrl) {
            $rootScope.$on('$stateChangeStart', function (evt, to, params) {
                if (to.redirectTo) {
                    evt.preventDefault();
                    $state.go(to.redirectTo, params);
                }
            });

            $rootScope.uploadedImageUrl = function (imageFilename) {
                return uploadedImageBaseUrl + imageFilename;
            };
        })
        .config(function ($httpProvider, $locationProvider, $urlRouterProvider) {
            $httpProvider.defaults.useXDomain = true;
            delete $httpProvider.defaults.headers.common['X-Requested-With'];

            $httpProvider.defaults.headers.post['X-Requested-With'] = 'XMLHttpRequest';
            $httpProvider.defaults.withCredentials = true;


            $httpProvider.defaults.xsrfCookieName = 'X-CSRF-Token';
            $httpProvider.defaults.xsrfHeaderName = 'X-CSRF-Token';

            //$httpProvider.defaults.headers.post['X-CSRF-Token'] = $cookieStore.get['X-CSRF-Token'];



            if (window.localStorage.token) {
                //$httpProvider.defaults.headers.common['Authorization'] = 'Basic ' + window.localStorage.token;
            }
        });

}());