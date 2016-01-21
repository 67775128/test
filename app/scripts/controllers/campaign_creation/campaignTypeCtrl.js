(function() {
    'use strict';

    angular.module('app')
        .controller('campaignTypeCtrl', function ($scope, $log, apiBaseUrl, $http) {
            $scope.state.name = "type";

            // for clarity; we will represent the type as an integer on the back end
            $scope.typeMapping = {
                "Web": 1,
                "Facebook": 2
            }
            $scope.setCampaignType = function (type) {
                $scope.launchParameters.type = $scope.typeMapping[type];
            }
        });
})();