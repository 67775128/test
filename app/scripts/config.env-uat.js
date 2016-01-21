/*
 * This file contains environment specific settings, Please copy and rename
 * to `config.env.js`.
 */
(function () {
    'use strict';

    angular.module('app')
        .constant('apiBaseUrl', '/dp-web/')
        .constant('apiDpWeb', '/dp-web/')
        .constant('apiLsWeb', '/ls-web/')
        .constant('apiCmpWeb', '/automation/')
        .constant('apiLeadGen', '/automation/')
        .constant('uploadedImageBaseUrl', 'http://ads-uat.everstring.com:5000/uploads/images/')
        .constant('logoutUrl', 'http://cas.uat.everstring.com/logout')
        .constant('casUrl', 'https://cas.uat.everstring.com:15000/v1.0/');  //http://192.168.0.181:5000/ads/    http://52.5.48.109:5000/ads/
    //http://52.6.36.26:5000/ads/   dev
}());