(function () {
    'use strict';

    angular.module('app')
    .controller('trackingSetupController', function($scope, $http, apiBaseUrl, $alert, topAlert) {
        $scope.createSite = function(site, ev) {
            var button = angular.element(ev.currentTarget);
            button.attr('disabled', true);
            button.text('Loading...');

            var enableRetry = function(button) {
                button.text('Retry');
                button.attr('disabled', false);
            };

            var createSiteUrl = apiBaseUrl + 'tracking/sites';

            $http.post(createSiteUrl, site)
                .success(function(data) {
                    var site_id = data.site_id;
                    var getTrackingCodeUrl = apiBaseUrl + 'tracking/sites/' + site_id + '/tracking_code';

                    $http.get(getTrackingCodeUrl)
                        .success(function(data) {
                            $scope.snippet = data.value;
                            button.hide();
                        })
                        .error(function(error) {
                            topAlert.addAlert("Error", 'Get tracking code error! ' + error.statusInfo);
                            enableRetry(button);
                        });
                }).error(function(error) {
                    topAlert.addAlert("Error", 'Create site failed! ' + error.statusInfo);
                    enableRetry(button);
                });
        };
    });
})();