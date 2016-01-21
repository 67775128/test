(function () {
    'use strict';

    angular.module('app')
        .controller('effiModelCtrl', function ($scope, $http,modelDataService,modelChart,modelDescriptionService) {
        	$scope.chartActiveTab = 'heatmap';
            $scope.warning = {
                icon:'btr bt-exclamation-circle',
                text:'Please contact Sales to enable or check in on the status of your Efficiency Model.',
                color:'#f9e574'
            };
            $scope.isLoading = true;
            $scope.isReady = false;
            $scope.selectedSegmentData = {};
            $scope.description = {
                defaultDescription:'Your <strong>Efficiency model</strong> combines Fit and Engagement to optimize your prospects for conversion.',
                getDescription:function(){
                    modelDescriptionService.queryModelDescription($scope.selectedSegmentData.id,'fit_engagement').then(function(msg){
                        if(msg.data){
                            this.setAll(msg.data.description,msg.data.tips)
                        }
                    }.bind(this));
                },
                saveDescription:function(){console.log(this)
                    var params = {};
                    params.segmentId = $scope.selectedSegmentData.id;
                    params.modelType = 'fit_engagement';
                    params.tips = this.tip;
                    params.description = this.description;
                    modelDescriptionService.addModelDescription(params).then(function(msg){
                        this.setAll();
                        this.modal.hide();
                    }.bind(this))
                }
            };
            function clearData(){
                $scope.isLoading = true;
                $scope.isReady = false;
            };
            function init(){

                modelChart.initHeatmap({
                    domId: 'js-effi-chart-heatmap'
                });
                $scope.description.getDescription();
                if(!$scope.selectedSegmentData.models||$scope.selectedSegmentData.models.length == 0){
                    $scope.isLoading = false;
                    $scope.isReady = true;
                    return;
                };
                var fitModel = modelDataService.getSingleModel('fit',$scope.selectedSegmentData.models);
                var engModel = modelDataService.getSingleModel('engagement',$scope.selectedSegmentData.models);
                if(fitModel.length == 0||engModel.length == 0){
                    $scope.isLoading = false;
                    $scope.isReady = true;
                    return;
                };
                if(!fitModel[0].modelId||!engModel[0].modelId){
                    $scope.isLoading = false;
                    $scope.isReady = true;
                    return;
                };
        		modelDataService.getFitEngHeatMap({
                    fitModelId:fitModel[0].modelId,
                    engModelId:engModel[0].modelId
                }).then(function(msg){
              
                	var chartData = modelDataService.processHeatmapData(msg);
                	console.log(msg,chartData)
                    if(chartData){
                    	var params = angular.extend({
		                    domId: 'js-effi-chart-heatmap'
		                }, chartData);
                        modelChart.initHeatmap(params);
                        
                    };
                });
                 modelDataService.getCombinedScoreData({
                     fitModelId:fitModel[0].modelId,
                     engModelId:engModel[0].modelId
                 }).then(function(msg){

                 	var chartData = modelDataService.processSplineData(msg);
                     if(chartData){
                     	var params = angular.extend({
		                     domId: 'js-effi-chart-spline'
		                 }, chartData);
                         modelChart.initSpline(params);

                     };
                 }).then(function(){
                     $scope.isLoading = false;
                     //$scope.isReady = true;
                 })
            };
            $scope.$on('segmentChangeResult', function(e,value){
                console.log('effimodel===',value)
                $scope.selectedSegmentData = value.select;
                if(value.activeTab = 'efficiency') {
                    clearData();
                    init();
                }
            });
        	$scope.$on('modelTabChange',function(e,data){
                if(data == 'efficiency'){
                    clearData();
                    init();
                }
            });
        });
}());