(function () {
    'use strict';


    angular.module('app')
        .directive('sortHeader', function () {
            return {
                restrict: 'EA',

                scope: {},

                template: '<a href="" ng-click="sortType = \'Company\'; reverse=!reverse;order(\'Company\', reverse)">{{title}}' +
                '<i ng-show="sortType != \'Company\'" class="fa fa-sort"></i>' +
                '<i ng-show="sortType == \'Company\' && !reverse" class="fa fa-sort-down"></i>' +
                '<span ng-show="sortType == \'Company\' && reverse" class="fa fa-sort-up"></span>' +
                '</a>'

            };
        });

}());