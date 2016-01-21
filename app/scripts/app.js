(function () {
    'use strict';
    /**
     * @ngdoc overview
     * @name app
     * @description
     * # app
     *
     * Main module of the application.
     */
    angular
        .module('app', [
            'ngAnimate',
            'ngCookies',
            'ngResource',
            'ngSanitize',
            'ngMessages',
            'ngTouch',
            'ngStorage',
            'ui.router',
            'ui.utils',
            'mgcrea.ngStrap',
            'pascalprecht.translate',
            'oc.lazyLoad',
            'ui.load',
            'ui.jp',
            'ui.select',
            'angular-loading-bar',
            'ui.bootstrap',
            'easypiechart',
            "truncate",
            'ngFileUpload',
            'angularUtils.directives.uiBreadcrumbs',
            'angularAwesomeSlider',
            'ngDraggable'
        ]);
}());