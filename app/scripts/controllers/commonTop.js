(function () {
    'use strict';

    angular.module('app').controller('CommonTopCtrl',
        function ($scope, $http, apiBaseUrl, $log, topAlert) {

            $scope.idsite = 845221;

            $scope.campainGoal = {};
            $scope.campainGoal.canEdit = 0;
            $scope.campainGoal.data = {
                conversion_num: null,
                net_new_num: null,
                idsite: $scope.idsite
            };

            $scope.campainGoal.getGoals = function () {
                $http.get(apiBaseUrl + "campaign_goals?idsite=" + $scope.idsite)
                    .success(function (response, status, headers, config) {
                        console.log(response, status, headers, config);
                        $scope.campainGoal.data.conversion_num = parseInt(response.data.conversion_num) || "Not Set";
                        $scope.campainGoal.data.net_new_num = parseInt(response.data.net_new_num) || "Not Set";
                    })
                    .error(function (data, status, headers, config) {
                        // 404, 500...
                    });
            };

            $scope.campainGoal.editGoals = function () {
                var url = apiBaseUrl + "campaign_goals";

                var transform = function (data) {
                    return $.param(data);
                };

                var goals = $scope.campainGoal.data;
                if (!goals.net_new_num || !goals.conversion_num) {
                    return false;
                }
                $log.debug(goals);
                $http.post(url, goals, {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
                    },
                    transformRequest: transform
                })
                    .success(function (data) {
                        if (data.status === 200) {
                            $scope.campainGoal.canEdit = false;
                        } else {
                            topAlert.addAlert("error", data.statusInfo);
                        }
                        $log.debug(data);
                    })
                    .error(function (data, status, headers, config) {
                        topAlert.addAlert("error", "Error");
                    });
            };

            $scope.getNetnewCount = function () {
                $http.get(apiBaseUrl + 'visitors/count?idsite=' + $scope.idsite + '&time=-90')
                    .success(function (response) {
                        $scope.netnewCount = response.data.count;
                    })
                    .error(function (data, status, headers, config) {
                        // 404, 500...

                    });
            };

            $scope.getConversionCount = function () {
                $http.get(apiBaseUrl + 'conversions/' + $scope.idsite + '?time=-90')
                    .success(function (response) {
                        $scope.conversionCount = response.data;
                    })
                    .error(function (data, status, headers, config) {
                        // 404, 500...

                    });
            };


            $scope.campainGoal.getGoals();
            $scope.getNetnewCount();
            $scope.getConversionCount();

        });
}());