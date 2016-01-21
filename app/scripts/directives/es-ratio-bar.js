(function () {
    'use strict';
    /**
     * @ngdoc function
     * @name
     * @description
     */
    angular.module('app')
        .directive('esRatioBar', function ($compile) {
            return {
                restrict: 'AE',
                replace: true,
                scope: {
                    config: '='
                },
                link: function (scope, element) {
                    var arr = scope.config;
                    var sum = _.reduce(arr, function (memo, num) {
                        return memo + num;
                    }, 0);
                    var ts = _.map(arr, function (v) {
                        return (100 * v / sum) + '%';
                    });
                    var html =
                        '<table class="pull-left" style="width: 100%;">'
                        + '<tr class="form-group">'
                        + '<td class="grade-back-a" style="width:' + ts[0] + ';height: 20px;"></td>'
                        + '<td class="grade-back-b" style="width:' + ts[1] + ';"></td>'
                        + '<td class="grade-back-c" style="width:' + ts[2] + ';"></td>'
                        + '</tr>'
                        + '</table>';
                    var e = $compile(html)(scope);
                    element.replaceWith(e);
                }
            };
        });

}());