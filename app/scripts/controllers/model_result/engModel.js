(function () {
    'use strict';

    angular.module('app')
        .controller('engModelCtrl', function ($scope,$q, $http, modelDataService,modelChart,$timeout,style,modelDescriptionService) {
            $scope.warning = {
                icon:'btr bt-exclamation-circle',
                text:'Please contact Sales to enable or check in on the status of your Engagement Model.',
                color:'#f9e574'
            };
            $scope.isLoading = true;
            $scope.isReady = false;
            $scope.selectedSegmentData = {};
            $scope.chartData = {
			};
            function clearData(){
                $scope.isLoading = true;
                $scope.isReady = false;
                $scope.chartData = {};
            };
            var defaultPieData = [33, 33, 33];
            var circleColors = style.abcColors;
            $scope.description = {
                defaultDescription:'Your <strong>Engagement Model</strong> uses behavioral information to optimize your prospects for conversion.',

                getDescription:function(){
                    modelDescriptionService.queryModelDescription($scope.selectedSegmentData.id,'engagement').then(function(msg){
                        if(msg.data){
                            this.setAll(msg.data.description,msg.data.tips)
                        }
                    }.bind(this));
                },
                saveDescription:function(){console.log(this)
                    var params = {};
                    params.segmentId = $scope.selectedSegmentData.id;
                    params.modelType = 'engagement';
                    params.tips = this.tip;
                    params.description = this.description;
                    modelDescriptionService.addModelDescription(params).then(function(msg){
                        this.setAll();
                        this.modal.hide();
                    }.bind(this))
                }
            };
            var defaultPieData = $.map(defaultPieData, function(value, i) {
                var circleData = {
                    y : value,
                    color : circleColors[i],
                    name : "ABCD".charAt(i)
                };
                return circleData;
            });
            function init(){
                $timeout(function(){
                    modelChart.plotPiePre({
                        domName:'.js-eng-pie-chart',
                        circleDataList:[['A',33], ['B', 33], ['C', 33]],
                        isGrey:true
                    });
                },50)
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
                $q.all([modelDataService.getFitEngHeatMap({
                    fitModelId:fitModel[0].modelId,
                    engModelId:engModel[0].modelId
                }),modelDataService.getEngConvData({
                    fitModelId:fitModel[0].modelId,
                    engModelId:engModel[0].modelId
                })]).then(function(msg){
              
                var chartData = modelDataService.processEngData(msg[0],msg[1]);
                    if(chartData){
                        $scope.chartData = chartData;

                        modelChart.plotPiePre({
                            domName:'.js-eng-pie-chart',
                            circleDataList:chartData.pieData
                        });

                        modelChart.drawPillarMiddleLine({
                            containter: '.js-eng-pillar-middle-line',
                            leftTopHeight: chartData.leftHeight[0],
                            rightTopHeight: chartData.rightHeight[0]
                        });
                        
                    };
                }).then(function(){
                    $scope.isLoading = false;
                    //$scope.isReady = true;
                })
            };
            $scope.$on('segmentChangeResult', function(e,value){
                console.log('engmodel===',value)
                $scope.selectedSegmentData = value.select;
                if(value.activeTab == 'engagement') {
                    clearData();
                    init();
                }

            });
            $scope.$on('modelTabChange',function(e,data){
                console.log(data)
                if(data == 'engagement'){
                    clearData();
                    init();
                }
            });
			//$scope.init = init;
        });
       
}());