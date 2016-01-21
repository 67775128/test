(function () {
    'use strict';

    angular.module('app')
        .controller('fitModelCtrl', function ($scope, $http, modelDataService,modelChart ,$timeout ,style,topAlert,modelDescriptionService) {
			$scope.isCanChange = false;
			$scope.isModelDetailShow = false;
			$scope.isSaveInfoShow = false;
			$scope.warning = {
				icon:'btr bt-exclamation-circle',
				text:'Please contact Sales to enable or check in on the status of your Fit Model.',
				color:'#f9e574'
			};
			$scope.isLoading = true;
			$scope.isReady = false;
			$scope.selectedSegmentData = {};
			$scope.pieModelData = [];
			$scope.barModelData = {};
			$scope.pillarModelData = {};

			$scope.sliderBarData = {};
			$scope.userABCDData = {};
			$scope.reportData = {};
			$scope.chartData = {};

			function clearData(){
				$scope.isLoading = true;
				$scope.isReady = false;
				$scope.pieModelData = [];
				$scope.barModelData = {};
				$scope.pillarModelData = {};
				$scope.sliderBarData = {};
				$scope.userABCDData = {};
				$scope.reportData = {};
				$scope.chartData = {};

			};
			$scope.description = {
				defaultDescription:'Your <strong>Fit Model</strong> uses firmographic information to optimize your prospects for conversion.',
				getDescription:function(){
					modelDescriptionService.queryModelDescription($scope.selectedSegmentData.id,'fit').then(function(msg){
						if(msg.data){
							this.setAll(msg.data.description,msg.data.tips)
						}
					}.bind(this));
				},
				saveDescription:function(){console.log(this)
					var params = {};
					params.segmentId = $scope.selectedSegmentData.id;
					params.modelType = 'fit';
					params.tips = this.tip;
					params.description = this.description;
					modelDescriptionService.addModelDescription(params).then(function(msg){
						this.setAll();
						this.modal.hide();
					}.bind(this))
				}
			};
			function getDynamicRagne() {
				var range = [20];
				$('.js-slider-score-point').each(function(i) {
					range.unshift($(this).data('currentValue'));
				});
				range.unshift(0);

				return range;
			};
			function getABCDparam(){

				var points = getDynamicRagne().slice(1, 4).reverse();
				var range = getDynamicRagne();
				var averageRate = $scope.chartData.reportData.averageRate;
				var winCountArray = $scope.chartData.reportData.winCountArray;
				var totalCountArray = $scope.chartData.reportData.totalCountArray;
				var winRateArray = modelDataService.getWinRateByRange(winCountArray, totalCountArray,range).reverse();
				var lifts = $.map(winRateArray, function(conversion, i) {
					return (winRateArray[i] / averageRate).toFixed(2);
				});
				var coverage = modelDataService.getCoverageByRange($scope.chartData.reportData.avg_win_coverage, range);

				var data = _.cloneDeep($scope.userABCDData);
				data.points = _.map(points, function(point) {
					return point * 5;
				});
				var param = {
					points : _.map(points, function(point) {
						return point * 5;
					}),
					lifts : lifts,
					conversions : winRateArray,
					coverages : coverage.reverse(),
					reportData : $scope.reportData,
					data : data
				};

				return param;
			};
			function onSliderChangeHandler(range) {

				range = range || getDynamicRagne();
				console.log(range)
				// redraw the color of chart
				var params = {
					domName: '.js-fit-bar-chart-element',
					serieData:null,
					range: ''
				};
				params.range = range;
				modelChart.fitBarSetData(params);
				var rangeNumbers = range.slice(1,5);
				var obj = {
					rangeNumbers:[],
					points:[]
				};
				rangeNumbers = _.each(rangeNumbers,function(value,index){
					var preValue = index == 0 ? 0:rangeNumbers[index-1];
					obj.rangeNumbers[index] = (value-preValue)*5;
					obj.points[index] = value*5;
				});
				$timeout(function() {
					$scope.sliderBarData.points = obj.points.reverse();
					$scope.sliderBarData.rangeNumbers = obj.rangeNumbers.reverse();
					_.each($scope.pieModelData,function(value,index){
						$scope.pieModelData[index].y = $scope.sliderBarData.rangeNumbers[index];
					});
					modelChart.plotPiePre({
						domName:'.js-fit-pie-chart',
						circleDataList:$scope.pieModelData
					});
				});

				var params = getABCDparam();
				var barPlotData = modelDataService.processBarPlotData(params);
				$scope.barModelData = barPlotData;
				$scope.barModelData.averageRate = $scope.chartData.averageRate;
				console.log('getABCDparam',params)

				var pillar = modelDataService.getChartData(params);
				console.log('getABCDparam',pillar)
				$timeout(function() {
					$scope.pillarModelData.left = obj.rangeNumbers;
					$scope.pillarModelData.right = pillar.conversionsPercentArray;
					$scope.pillarModelData.leftHeight = pillar.leftHeight;
					$scope.pillarModelData.rightHeight = pillar.rightHeight;
					modelChart.drawPillarMiddleLine({
						containter: '.js-fit-pillar-middle-line',
						leftTopHeight: $scope.pillarModelData.leftHeight[0],
						rightTopHeight: $scope.pillarModelData.rightHeight[0]
					});
				});

			};

			var sliderProxy = (function($_sliderBox) {
				var sliderBoxHTML = $_sliderBox.html();

				var ACTIVE_POINT_CLASS_NAME = "xdsoft_range2dslider_active";
				var SLIDER_COLUMN_CLASS_NAME = "slider-score-column";
				var SLIDER_POINT_INPUT_CLASS_NAME = "js-slider-score-point";

				var AXIS_X = -1;
				var AXIS_X_BEGIN = AXIS_X;
				var AXIS_X_END = AXIS_X;
				var AXIS_Y_BEGIN = 0;
				var AXIS_Y_END = 20;

				var DEFAULT_POINT_VALUE = 15;
				// (=75/5)

				var SLIDER_COLUMN_HEIGHT = "480px";
				var SLIDER_COLUMN_WIDTH = "13px";

				var valueChangeHandler = function(value) {
					var $_activePoint = $_sliderBox.find("." + ACTIVE_POINT_CLASS_NAME);
					var $_activePointInput = $_activePoint.parents("." + SLIDER_COLUMN_CLASS_NAME).prev("input");

					var getValidRoundValue = function() {
						var minValue = $_activePointInput.data("minValue");
						var maxValue = $_activePointInput.data("maxValue");
						var currentValue = Math.round(value);

						if (currentValue < minValue) {
							currentValue = minValue;
						} else if (currentValue > maxValue) {
							currentValue = maxValue;
						}

						return currentValue;
					};
					var getRoundValueChangeInfo = function() {
						// ignore axis_x value
						if ((value === AXIS_X)
									// ignore integer value(most possibility this Handler is trigger by the change of window'resize)
								|| (value === Math.round(value))) {
							return {
								isRoundValueChange : false,
								roundValue : value
							};
						}

						var validRoundValue = getValidRoundValue();

						// ignore range2DSlider init and `pointValue` unchange
						var lastSaveValue = $_activePointInput.data("currentValue");
						if ((lastSaveValue == undefined) || (lastSaveValue == validRoundValue)) {
							return {
								isRoundValueChange : false,
								roundValue : lastSaveValue
							};
						}

						// round value change!
						return {
							isRoundValueChange : true,
							roundValue : validRoundValue
						};
					};
					var roundValueChangeHandler = function(roundValue) {
						$_activePointInput.data("currentValue", roundValue);

						updateSliderRange(roundValue);

						onSliderChangeHandler();
					};

					// begin to process the value
					var roundValueChangeInfo = getRoundValueChangeInfo();
					var roundValue = roundValueChangeInfo.roundValue;

					if (roundValueChangeInfo.isRoundValueChange) {
						// the `currentValue` is changed, and now call the handler function
						roundValueChangeHandler(roundValue);
					}

					// fix the min value and max value bug.It wouldn't be 0 or 20.
					if (roundValue < 1) {
						roundValue = 1;
					} else if (roundValue > 19) {
						roundValue = 19;
					}

					return roundValue;
				};

				var sliderConfig = {
					template : "vertical",
					axis : [
						// axis: x (range)
						[AXIS_X_BEGIN, AXIS_X_END],
						// axis: y (range)
						[AXIS_Y_BEGIN, AXIS_Y_END]],
					value : [[AXIS_X, DEFAULT_POINT_VALUE]],
					// disabled:true,
					height : SLIDER_COLUMN_HEIGHT,
					width : SLIDER_COLUMN_WIDTH,
					className : SLIDER_COLUMN_CLASS_NAME,

					// prevent user to click anywhere on the `sliderColumn`
					posOnBoxClick : false,
					// only can stop on point tick
					onlyGridPoint : true,
					printLabel : function(valueArray) {
						return valueArray[1] * 5;
					},
					round : true,
					roundMethod : valueChangeHandler
				};

				function initSliderRange(defaultPointRange,isdisable) {
					// default: [75/5, 50/5, 25/5] ---> [15, 10, 5]
					var DEFAULT_POINT_VALUES = defaultPointRange.slice(1, 4);

					console.log('DEFAULT_POINT_VALUES',DEFAULT_POINT_VALUES)
					var $_sliderPointInput = $("." + SLIDER_POINT_INPUT_CLASS_NAME);

					$_sliderPointInput.each(function(i) {
						var $_self = $(this);
						var defaultPointValue = DEFAULT_POINT_VALUES[i];

						var valueConfig = {
							value : [[AXIS_X, defaultPointValue]]
						};
						$_self.range2DSlider($.extend({}, sliderConfig, valueConfig));
						// if(isdisable === false){
						// 	$_self.range2DSlider({disabled:isdisable});
						// }
						$_self.data("currentValue", defaultPointValue);

						var rangeIndex = i + 1;
						$_self.data("maxValue", defaultPointRange[rangeIndex - 1] - 1);
						$_self.data("minValue", defaultPointRange[rangeIndex + 1] + 1);
					});
				}

				function updateSliderRange(activePointValue) {
					var $_activePoint = $_sliderBox.find("." + ACTIVE_POINT_CLASS_NAME);
					var $_activeSliderColumn = $_activePoint.parents("." + SLIDER_COLUMN_CLASS_NAME);

					var $_prevPointInput = $_activeSliderColumn.prevAll("input:eq(1)");
					var $_nextPointInput = $_activeSliderColumn.next("input");

					$_prevPointInput.data("minValue", activePointValue + 1);
					$_nextPointInput.data("maxValue", activePointValue - 1);
				}

				function resetSliderRange(pointRange) {
					$_sliderBox.empty().html(sliderBoxHTML);

					var pointValues = $.map(pointRange, function(point) {
						return point / 5;
					});
					var initPointValues = [20].concat(pointValues).concat([0]);

					initSliderRange(initPointValues,false);

					onSliderChangeHandler();
				}

				return {
					initSliderRange : initSliderRange,
					updateSliderRange : updateSliderRange,
					resetSliderRange : resetSliderRange
				};
			})($(".js-slider-box"));
			var defaultPieData = [25,25, 25, 25];
			var circleColors = style.abcdColors;
			var defaultPieData = $.map(defaultPieData, function(value, i) {
				var circleData = {
					y : value,
					color : circleColors[i],
					name : "ABCD".charAt(i)
				};
				return circleData;
			});
			function init(){

				$timeout(function() {
					modelChart.plotPiePre({
						domName: '.js-fit-pie-chart',
						circleDataList: defaultPieData,
						isGrey:true
					});
				},50);
				$scope.description.getDescription();
				if(!$scope.selectedSegmentData.models||$scope.selectedSegmentData.models.length == 0){
					$scope.isLoading = false;
					$scope.isReady = true;
					return;
				};
				var fitModel = modelDataService.getSingleModel('fit',$scope.selectedSegmentData.models);
				if(fitModel.length == 0){
					$scope.isLoading = false;
					$scope.isReady = true;
					return;
				};
				if(!fitModel[0].modelId){
					$scope.isLoading = false;
					$scope.isReady = true;
					return;
				};
				modelDataService.getUserABCD({
					segmentId:$scope.selectedSegmentData.id,
					modelType:'fit'
				}).then(function(msg){
					$scope.userABCDData = msg;
					var barPlotData = modelDataService.processBarPlotData(msg);
					if(barPlotData){
						$scope.barModelData = barPlotData;
					};
					return modelDataService.getReportData(fitModel[0].modelId).then(function(reportData){
						$scope.reportData = reportData;

						return modelDataService.getChartData({
							data:msg,
							modelId:fitModel[0].modelId,
							reportData:reportData
						})
					});
				}).then(function(msg){
					$scope.chartData = msg;
					$scope.barModelData.averageRate = msg.averageRate;



					$scope.pillarModelData.left = msg.rangeNumbers;
					$scope.pillarModelData.right = msg.conversionsPercentArray;
					$scope.pillarModelData.leftHeight = msg.leftHeight;
					$scope.pillarModelData.rightHeight = msg.rightHeight;
					console.log('pillarModelData',$scope.pillarModelData)
					modelChart.drawPillarMiddleLine({
						containter: '.js-fit-pillar-middle-line',
						leftTopHeight: $scope.pillarModelData.leftHeight[0],
						rightTopHeight: $scope.pillarModelData.rightHeight[0]
					});

					$scope.sliderBarData.averageRate = msg.averageRate;
					$scope.sliderBarData.left = $scope.barModelData.left;
					$scope.sliderBarData.points = msg.points;
					$scope.sliderBarData.rangeNumbers = msg.rangeNumbers;
					var pointValues = _.map(msg.points, function(point) {
						return point / 5;
					});
					var initPointValues = pointValues.concat([0]);

					console.log('initPointValues',initPointValues)
					modelChart.initFitBar({
						domName: '.js-fit-bar-chart-element',
						avg_win_rate: msg.reportData.avg_win_rate,
						serieData: msg.reportData.serieData,
						range: initPointValues.reverse(),
						averageRate: msg.averageRate
					});

					sliderProxy.initSliderRange(initPointValues.reverse());

					var circleDataList = modelDataService.processPieData(msg.countData).circleDataList;
					$scope.pieModelData = circleDataList;
					modelChart.plotPiePre({
						domName:'.js-fit-pie-chart',
						circleDataList:$scope.pieModelData
					});
				}).then(function(){
					$scope.isLoading = false;
					//$scope.isReady = true;
				})
			};
			$scope.reset = function(){
				var fitModel = modelDataService.getSingleModel('fit',$scope.selectedSegmentData.models);

				modelDataService.getDefaultUserABCD({
					segmentId:$scope.selectedSegmentData.id,
					modelType:'fit'
				}).then(function(msg){
					sliderProxy.resetSliderRange(msg.points);
				})

			};
			$scope.save = function(){
				var params = getABCDparam();
				delete params.reportData;
				delete params.data;
				params.segmentId = $scope.selectedSegmentData.id;
				params.modelType = 'fit';
				modelDataService.saveUserABCD(params).then(function(msg){
					if(msg.data.status){
						topAlert.addAlert('error',msg.data.statusInfo)
					};
					$scope.isSaveInfoShow = true;
					$timeout(function() {
						$scope.isSaveInfoShow = false;
					},1000);
				});
			};
			$scope.$on('segmentChangeResult', function(e,value){
				console.log('fitmodel===',value)
				$scope.selectedSegmentData = value.select;
				if(value.activeTab == 'fit') {
					clearData();
					init();
				}
			});
			$scope.$on('modelTabChange',function(e,data){
				if(data == 'fit'){
					clearData();
					init();
				}
			});
        });
       
}());