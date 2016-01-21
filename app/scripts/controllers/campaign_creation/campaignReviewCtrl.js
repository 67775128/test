(function() {
    'use strict';

    angular.module('app')
        .controller('campaignReviewCtrl', function ($scope, $log, apiBaseUrl, $http) {
            $scope.state.name = "review";

            $scope.adLibrary = {};

            $scope.adLibrary.tableHeader = [
                {name: 'Size', dbkey: '', align: "text-center", reverse: null},
                {name: 'Ad Name', dbkey: '', align: "text-center", reverse: null},
                {name: 'Landing URL', dbkey: '', align: "text-center", reverse: null},
                {name: 'Created', dbkey: '', align: "text-center", reverse: null},
            ];

            $scope.adLibrary.adList = [
                {
                    imageSrc: 'https://s3.amazonaws.com/uploads.hipchat.com/162922/2046576/uYokt0ILbxCroqH/160x600.jpg',
                    size: '160x600',
                    created: '8/22/2015'
                },

                {
                    imageSrc: 'https://s3.amazonaws.com/uploads.hipchat.com/162922/2046576/JLYfStXfdhjCCFv/728x90.jpg',
                    size: '728x98',
                    created: '8/26/2015'
                }
            ];

            $scope.launchCampaign = function () {
                $http.post(apiBaseUrl + "campaign/launch", $scope.launchParameters)
                    .then(function successCallback(response) {
                        console.log(response);
                    }, function errorCallback(response) {
                        console.log(response);
                    });
            }

        });
})();