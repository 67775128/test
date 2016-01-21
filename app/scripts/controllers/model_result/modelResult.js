(function () {
    'use strict';

    angular.module('app')
        .controller('ModelResultCtrl', function ($scope, segmentsService,$select) {
            $scope.activeTab = 'fit';
            $scope.$on('segmentChange', function(e,value){
                $scope.$broadcast('segmentChangeResult',{
                        select:value.select,
                        activeTab:$scope.activeTab
                    }
                );
                console.log('segmentsService.selectedSegment',segmentsService.selectedSegment)
            });

            $scope.change = function(){
            	$scope.$broadcast('modelTabChange',$scope.activeTab)
            }
        })
}());