/*
 * This file contains environment specific settings, Please copy and rename 
 * to `config.env.js`.
 */
(function () {
    'use strict';

    angular.module('app')
        .constant('apiBaseUrl', 'http://ads.uat.everstring.com:5000/api/ads/')
        .constant('apiLeadGen', '/automation/')
        .constant('uploadedImageBaseUrl', 'http://ads.uat.everstring.com:5000/v1.0/uploads/images/')
        .constant('logoutUrl', '/automation/logout');

}());