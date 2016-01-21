(function() {
    'use strict';

    angular.module('app')
        .controller('campaignSettingsCtrl', function ($scope) {

            $scope.state.name = 'settings';

            $scope.locations = ['United States', 'Worldwide'];

        });

})();