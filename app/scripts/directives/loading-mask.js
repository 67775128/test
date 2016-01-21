(function () {
    'use strict';


    angular.module('app')
        .directive('loading', function () {
            return {
                restrict: 'EA',

                replace: true,
                scope: {
                    conf: '='
                },
                template: '<div  style="position: absolute;width: 100%;height: 100%; background-color: rgba(255, 255, 255,0.6); z-index:100;">' +
                '<div style="width: 100%;height:50%;"></div>' +
                '<div style="text-align:center;margin-top:-16px;">' +
                '<div class="three-quarters-loader">Loading...</div>' +
                '</div>' +
                '</div>'

            };
        });

}());