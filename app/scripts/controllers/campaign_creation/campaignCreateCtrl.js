(function() {
    'use strict';

    angular.module('app')
        .controller('campaignCreateCtrl', function ($scope, $log, apiBaseUrl, $http, $modal) {
            // TODO: rename -> new_campaign
            $scope.new_ads = {};

            $scope.shouldShowExistingSegment = false;
            
            $scope.hideExistingSegmentFn = function() {
                $scope.shouldShowExistingSegment = false;
            }

            $scope.showExistingSegmentFn = function() {
                $scope.shouldShowExistingSegment = true;
            };

            var cancelModal = $modal({
                scope: $scope,
                templateUrl: 'views/modals/modal.campaign.cancel.html',
                placement: 'center',
                show: false,
            });

            $scope.showCancelModal = function () {
                cancelModal.$promise.then(cancelModal.show);
                return false;
            }

            $scope.launchParameters = {
                type: undefined,
                name: undefined,
                dailyBudget: undefined,
                startDate: undefined,
                endDate: undefined,
                location: undefined,
                segments: [], //array of {id: segId, name: segName}
                ads: [] //array of ad ids
            }


            $scope.state = {};
            $scope.state.name = 'root';

            $scope.launchNewCampaign = function ($event) {


                // $log.debug($scope.new_ads);

                // var button = angular.element($event.currentTarget);
                // button.text('Creating campaign...');
                // button.attr('disabled', true);

                // var url = apiBaseUrl + 'ads';
                // var payload = angular.toJson($scope.new_ads);
                // $log.debug(payload);
                // $http.post(url, payload)
                //     .success(function (data) {
                //         // successfully created campaign, redirect to
                //         // campaign page.
                //         // $state.go('ads.campaign.show', {
                //         //     id: data.id
                //         // });
                //         button.text('Successfully');
                //         button.attr('disabled', false);

                //         $log.debug(data);
                //     })
                //     .error(function (data) {
                //         button.text('Failed, try again');
                //         button.attr('disabled', false);
                //     });
            };




        });
})();