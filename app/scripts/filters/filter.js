(function () {
    'use strict';
    /**
     * Created by caobin on 2015/6/9.
     */
    angular.module('app')
        .filter('megaNumber', function () {
            return function (number, fractionSize) {
                if (number === null || number === undefined) return "--";
                if (number === 0) return "0";
                var newNumber = parseInt(number);
                if (!(newNumber)) return number;

                if (!fractionSize || fractionSize < 0)
                    fractionSize = 1;

                var abs = Math.abs(number);
                var rounder = Math.pow(10, fractionSize);
                var isNegative = number < 0;
                var key = '';
                var powers = [
                    {key: "Q", value: Math.pow(10, 15)},
                    {key: "T", value: Math.pow(10, 12)},
                    {key: "B", value: Math.pow(10, 9)},
                    {key: "M", value: Math.pow(10, 6)},
                    {key: "K", value: 1000}
                ];

                for (var i = 0; i < powers.length; i++) {

                    var reduced = abs / powers[i].value;

                    reduced = Math.round(reduced * rounder) / rounder;

                    if (reduced >= 1) {
                        abs = reduced;
                        key = powers[i].key;
                        break;
                    }
                }

                return (isNegative ? '-' : '') + abs + key;
            };
        })
        .filter('filterRingColor', function () {
            return function (v) {
                if (v >= 75) {
                    return "#055ec3";
                }
                else if (v >= 50) {
                    return "#87befc";
                }
                else if (v >= 25) {
                    return "#ffb91d";
                }
                else {
                    return "#ff7803";
                }
            };
        })
        .filter('sumArr', function () {
            return function (arr) {
                return _.reduce(arr, function (sum, num) {
                    return sum + (angular.isNumber(num) ? num : 0);
                }, 0);
            };
        })
        .filter('sumArrChecked', function () {
            return function (arr) {
                var sum=0;
                _.each(arr, function (value) {
                   sum+=(value.checked?1:0);
                });
                return sum;
            };
        })
        .filter('makeWidthPerc', function () {
            return function (v) {
                return Math.pow(0.9, v + 2) * 100;
            };
        })
        .filter('fei', function () {
            return function (v) {
                return !v;
            };
        });
}());
