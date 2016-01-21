(function () {
    'use strict';

    angular.module('app').controller('Signin',
        function ($scope, $http,$alert, $location, topAlert,$log, $state) {

            $scope.$parent.singlePage=false;
            console.log($scope.$parent.singlePage);

        });
}());