/**
 * Created by caobin on 2015/6/9.
 */
(function () {
    'use strict';
    angular.module('app')
        .filter('date.formTime', function () {
            return function (dtime) {
                return dtime.getFullYear() + "-" + (dtime.getMonth() + 1) + "-" + dtime.getDate();
            };
        })
        .filter('date.formStartTime', function ($filter) {
            return function (t) {
                if (t >= 300000) {
                    return "1970-1-1";
                }
                return $filter('date.formTime')(new Date((new Date()).getTime() - (t) * 24 * 3600 * 1000));
            };
        })
        .filter('date.formEndTime', function ($filter) {
            return function (t) {
                return $filter('date.formTime')(new Date((new Date()).getTime() - (1) * 24 * 3600 * 1000));
            };
        });
}());