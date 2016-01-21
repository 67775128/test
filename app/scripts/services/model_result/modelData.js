'use strict';

angular.module('app')
    .factory('modelDataService', function ($http, apiLsWeb, apiDpWeb, topAlert, $q,style) {

        function isRunAsCheck() {
            return $http.get(apiLsWeb + 'lg/isRunAs', {cache: false}).then(function(resource){
                console.log('isRunAsCheck=======',resource);
                var isRunAs = resource.data;
            })
        };
        function getUserABCD(params) {
            var params = angular.extend({
                segmentId:'',
                modelType:''
            }, params);
            return $http.get(apiLsWeb + 'model/segmentABCD?segmentId='+params.segmentId+'&modelType='+params.modelType, {cache: false}).then(function(resource){
                console.log('getPieData=======',resource);
                return resource.data;
            })
        };
        function getDefaultUserABCD(params) {
            var params = angular.extend({
                segmentId:'',
                modelType:''
            }, params);
            return $http.get(apiLsWeb + 'model/defaultSegmentABCD?segmentId='+params.segmentId+'&modelType='+params.modelType, {cache: false}).then(function(resource){
                console.log('getDefaultUserABCD=======',resource);
                return resource.data;
            })
        };
        function saveUserABCD(params) {
            var params = angular.extend({
                segmentId:'',
                modelType:''
            }, params);
            return $http({
                url: apiLsWeb + 'model/segmentABCD',
                method: 'POST',
                data: params
            });
        };
        function getReportData(modelId) {
            return $http.get(apiLsWeb + 'model/modelReport?modelId='+modelId, {cache: false}).then(function(resource){
                console.log('getReportData=======',resource);
                return resource.data;
            })
        };
        function getFitEngHeatMap(params) {
            var params = angular.extend({}, params);

            return $http.get(apiLsWeb + 'model/getFitEngHeatMap?fitModelId='+params.fitModelId+'&engModelId='+params.engModelId, {cache: false}).then(function(resource){
                console.log('getFitEngHeatMap=======',resource);
                return resource.data;
            })
        };
        function getEngConvData(params) {
            var params = angular.extend({}, params);

            return $http.get(apiLsWeb + 'model/getEngConvData?fitModelId='+params.fitModelId+'&engModelId='+params.engModelId, {cache: false}).then(function(resource){
                console.log('getEngConvData=======',resource);
                return resource.data;
            })
        };
        function getCombinedScoreData(params) {
            var params = angular.extend({}, params);

            return $http.get(apiLsWeb + 'model/getCombinedScoreData?fitModelId=' + params.fitModelId  + '&engModelId=' + params.engModelId, {cache: false}).then(function(resource){
                console.log('getCombinedScoreData=======',resource);
                return resource.data;
            })
        };

        function updateConversionEvent() {
            //modelType 1000/2000/3000
            return $http.get(apiLsWeb + 'updateConversionEvent', {cache: false}).then(function(resource){
                console.log('updateConversionEvent=======',resource);
                return resource.data;
            })
        };
        function updateToolTip() {
            //modelType 1000/2000/3000
            return $http.get(apiLsWeb + 'updateToolTip', {cache: false}).then(function(resource){
                console.log('updateToolTip=======',resource);
                return resource.data;
            })
        };

        //handle data func
        //fit model
        function reportDataHandle(data){
            var dataList = _.cloneDeep(data.percentileScore20);
            if(!dataList){return;}
            var initPercents = dataList.avg_lift_multiple;
            var winCountArray = dataList.avg_win_count;
            var totalCountArray = dataList.avg_total_count;
            var averageRate = getWinRateByRange(winCountArray, totalCountArray, [0, 20])[0];

            var serieData = $.map(initPercents, function(initPercent) {
                return {
                    y : Number((initPercent).toFixed(2))
                };
            }).reverse();
            return {
                winCountArray:winCountArray,
                totalCountArray:totalCountArray,
                averageRate:averageRate,
                avg_win_coverage:dataList.avg_win_coverage,
                avg_win_rate:dataList.avg_win_rate,
                serieData:serieData,
                defaultRange: [0, 5, 10, 15, 20]
            }
        };
        function getWinRateByRange(winCountArray, totalCountArray, range) {
            var winCountArray = _.cloneDeep(winCountArray);
            var totalCountArray = _.cloneDeep(totalCountArray);
            var range = _.cloneDeep(range);
            var winRateArray = [];
            for (var i = 0, len = range.length - 1; i < len; i++) {
                var winCountSum = 0;
                var totalCountSum = 0;
                var beginIndex = range[i];
                var endIndex = range[i + 1];
                for (var j = beginIndex; j < endIndex; j++) {
                    winCountSum += winCountArray[j];
                    totalCountSum += totalCountArray[j];
                }
                winRateArray.push((winCountSum / totalCountSum) || 0);
            }
            return winRateArray;
        };
        function getCoverageByRange(coverage, range) {
            var coverage = _.cloneDeep(coverage);
            var range = _.cloneDeep(range);

            var carr = [];

            for (var i = 0, len = range.length - 1; i < len; i++) {
                var winCountSum = 0;
                var totalCountSum = 0;

                var beginIndex = range[i];
                var endIndex = range[i + 1];

                for (var j = beginIndex; j < endIndex; j++) {
                    winCountSum += coverage[j];
                }

                carr.push((winCountSum) || 0);
            }

            return carr;
        }
        function getChartData(params) {
            var params = _.cloneDeep(params);

            var data = params.data;
            var reportData = params.reportData;
            var points = [100].concat(data.points);
            var countData = [['A', 25], ['B', 25], ['C', 25], ['D', 25]];
            var rangeNumbers = [];
            var conversionsByRange = null;

            $.each(points, function(i, point) {
                var rangeNumber = points[i] - (points[i + 1] || 0);
                countData[i][1] = rangeNumber;
                rangeNumbers.push(rangeNumber);
            });
            // data for redraw right-pillarChart
            reportData = reportDataHandle(reportData);

            var winCountArray = reportData.winCountArray;
            if (winCountArray) {
                var winCountByRange = [];
                var range = _.map(points.concat(0), function(point) {
                    return point / 5;
                }).reverse();

                for (var i = 0, len = range.length - 1; i < len; i++) {
                    var winCountSum = 0;

                    var beginIndex = range[i];
                    var endIndex = range[i + 1];

                    for (var j = beginIndex; j < endIndex; j++) {
                        winCountSum += winCountArray[j];
                    }

                    winCountByRange.push(winCountSum);
                }

                conversionsByRange = winCountByRange.reverse();
            };
            //return reportData;

            var sumConversions = _.sum(conversionsByRange);
            var percentArray = _.map(conversionsByRange, function(value) {
                return _.round(value / sumConversions * 100);
            });
            // make sure sum of rateArray is 100
            percentArray[0] += (100 - _.sum(percentArray));
            var pillarChartItemHeight = angular.element('.js-pillar-chart-item')[0].offsetHeight;
            var leftHeight = _.map(rangeNumbers,function(value){
                return pillarChartItemHeight*Number(value)/100;
            });
            var rightHeight = _.map(percentArray,function(value){
                return pillarChartItemHeight*Number(value)/100;
            });

            return {
                    reportData:reportData,
                    countData : countData,
                    rangeNumbers : rangeNumbers,
                    conversions : conversionsByRange,
                    conversionsPercentArray:percentArray,
                    leftHeight:leftHeight,
                    rightHeight:rightHeight,
                    lifts : data.lifts,
                    averageRate:reportData.averageRate*100,
                    points:points
                };
        };
        function processPieData(countData) {
            var countData = _.cloneDeep(countData);

            var circleColors = style.abcdColors;
            var circleDataList = $.map(countData, function(valueArray, i) {
                var circleData = {
                    y : valueArray[1],
                    color : circleColors[i],
                    name : "ABCD".charAt(i)
                };

                return circleData;
            });

            var countSum = 0;
            var leadsCountArray = [];
            $.each(countData, function(i, valueArray) {
                var leadsCount = valueArray[1];

                countSum += leadsCount;
                leadsCountArray.push(leadsCount);
            });
            var countPercents = [];
            $.each(leadsCountArray, function(i, leadsCount) {
                var leadsCountPercent = _.round((leadsCount / countSum) * 100);

                countData[i][1] = leadsCountPercent;
                countPercents.push(leadsCountPercent);
            });

            return {
                circleDataList:circleDataList,
                leadsCountArray:leadsCountArray,
                countPercents:countPercents
            };
        };
        function processBarPlotData(userABCDData){
            var userABCDData = _.cloneDeep(userABCDData);

            if (userABCDData.lifts) {
                var lift = userABCDData.lifts;
                var dataList = [];
                var max = _.max(lift);
                var topToLastRate = lift[3]<=0?'-':_.round(lift[0] / lift[3], 1);
                _.each(lift,function(value,i){
                    value = parseFloat(parseFloat(value).toFixed(1));
                    dataList[i] = {};
                    dataList[i].lift = value;
                    dataList[i].width = 0.8*_.round(value / max*100, 1);
                    dataList[i].isLongEnough = dataList[i].width>40;
                });

                dataList[3].lift = dataList[3].lift <0.1?'<0.1':dataList[3].lift;

                return {
                    RateList:dataList,
                    topToLastRate:topToLastRate,
                    left:1/dataList[0].lift*80
                }
            } else {
                return;
            }
        };
        //eng model
        function processEngData(engScore,engConv){
            //bardataprocess
            var crdata = [];
            var convData = engConv.convData;
            crdata[0] = convData.withEngagement.baseline/convData.overall.baseline;
            crdata[0] = crdata[0].toFixed(1);
            crdata[1] = convData.noRecentEngagement.baseline/convData.overall.baseline;
            crdata[1] = crdata[1].toFixed(1);
            crdata[2] = convData.noEngagement.baseline/convData.overall.baseline;
            crdata[2] = crdata[2].toFixed(1);
            var barNames = "abcd";
            var max = _.max(crdata);
            var barDataList = _.map(crdata, function(lift, i) {
                var name = barNames.charAt(i);
                var value = _.round(lift, 1);
                var width = 0.8*_.round(lift / max*100, 1);
                var isLongEnough = width>40;
                return {
                    name:name,
                    value:value,
                    width:width,
                    isLongEnough:isLongEnough
                };
            });
            //piedataprocess
            var aPer = ((convData.withEngagement.total/convData.overall.total)*100).toFixed();
            aPer = Number(aPer);
            var bPer = ((convData.noRecentEngagement.total/convData.overall.total)*100).toFixed();
            bPer = Number(bPer);
            var cPer = 100-aPer-bPer;
            //column chart 
            var leftDataList = [aPer,bPer,cPer];
            var conversionAper = ((convData.withEngagement.wins/convData.overall.wins)*100).toFixed();
            var conversionBper = ((convData.noRecentEngagement.wins/convData.overall.wins)*100).toFixed();

            conversionAper = Number(conversionAper);
            conversionBper = Number(conversionBper);
            var conversionCper = 100-conversionAper-conversionBper;
            var rightDataList = [conversionAper, conversionBper,conversionCper];
            var pillarChartItemHeight = angular.element('.js-eng-pillar-chart-item')[0].offsetHeight;
            var leftHeight = _.map(leftDataList,function(value){
                return pillarChartItemHeight*Number(value)/100;
            });
            var rightHeight = _.map(rightDataList,function(value){
                return pillarChartItemHeight*Number(value)/100;
            });
  
            var circleColors = style.abcColors;
            var circleDataList = $.map(leftDataList, function(valueArray, i) {
                var circleData = {
                    y : valueArray,
                    color : circleColors[i],
                    name : "ABCD".charAt(i)
                };

                return circleData;
            });
            return {
                //left
                pieData:circleDataList,
                //center
                barDataList:barDataList,
                pillarBaselinePrecent:(convData.overall.baseline*100).toFixed(1),
                splineTopRate:crdata[0],
                left:1/crdata[0]*80,
                //right
                leftDataList:leftDataList,
                rightDataList:rightDataList,
                leftHeight:leftHeight,
                rightHeight:rightHeight


            }
        };
        //effi model
        var heatmap = {};
        var spline = {};
        var baseLine = 0;
        var topRate = '-';
        function processSplineData(data){
            var chartData = data.combinedInfo.combined_score_100;
            var baseLine = data.baseLine;

            var wins = chartData.wins;
            var total = chartData.total;
            var arr = [];
            _.each(wins,
                    function(k, i) {
                        if (total[i] > 0) {
                            arr.push(wins[i] / total[i] / baseLine);
                        } else {
                            arr.push(0);
                        }
                    });

            var max = _.max(arr);
            topRate = max;

            var closeToBaseLine = null;
            var closeToBaseLineIndex = 0;
            arr.forEach(function(n, i) {
                if (closeToBaseLine) {
                    if (Math.abs(n - 1) < closeToBaseLine) {
                        closeToBaseLineIndex = i;
                        closeToBaseLine = Math.abs(n - 1);
                    }
                } else {
                    closeToBaseLine = Math.abs(n - 1);
                }
            });
            console.log(baseLine)
            return {
                data:arr,
                max:max,
                baseLine:baseLine,
                closeToBaseLine:closeToBaseLineIndex
            }
        };

        function convertHeatmapData(data) {
            var i = 0;
            var arr = [];
            for (var p = 0; p < 10; p++) {
                arr.push([]);
            }

            for (i in data) {

                var xys = i.split("_");
                var y = parseInt(xys[0]);
                var x = parseInt(xys[1]);
                //1_5 ,1 means engaement score,5 means fit score
                var temp = {};
                temp.x = parseInt(x);
                temp.y = parseInt(y);

                temp.value = data[i].liftMult;
                temp.coverage = data[i].totalCoverage;

                arr[x][y] = {
                    value : data[i].liftMult,

                    coverage : data[i].totalCoverage,
                    wins : data[i].wins,
                    total : data[i].total
                };
            }
            var j = 5;
            var out = [];
            try {
                for (var m = 0; m < j; m++) {
                    for (var n = 0; n < j; n++) {
                        var rate = (arr[m * 2][n * 2].wins
                                + arr[m * 2][n * 2 + 1].wins
                                + arr[m * 2 + 1][n * 2].wins + arr[m * 2 + 1][n * 2 + 1].wins)
                                / (arr[m * 2][n * 2].total
                                        + arr[m * 2][n * 2 + 1].total
                                        + arr[m * 2 + 1][n * 2].total + arr[m * 2 + 1][n * 2 + 1].total) ;

                        var coverage = (arr[m * 2][n * 2].coverage
                            + arr[m * 2][n * 2 + 1].coverage
                            + arr[m * 2 + 1][n * 2].coverage + arr[m * 2 + 1][n * 2 + 1].coverage);
                        
                        coverage=coverage || 0;
                        rate=rate || 0;
                        var lift = (rate / baseLine) || 0;
                        out.push({
                            x : m * 20 + 10,
                            y : n * 20 + 10,
                            value : lift.toFixed(3),

                            rate:rate.toFixed(3),
                            coverage : coverage.toFixed(3)

                        });
                    }

                }
            } catch (e) {
            }
            return out;
        };
        function addColorKey(data, max, min){
            for(var i=0; i<data.length; i++){
                if(data[i].value<=1){
                    data[i].color=chroma.scale([style.heatmapColors[0], style.heatmapColors[5]])((data[i].value-min)/1).hex();
                }else{
                    data[i].color=chroma.scale([style.heatmapColors[6], style.heatmapColors[11]])(data[i].value/max).hex();
                }
                
                data[i].dataLabels={};
                
                if(data[i].value<=(max-(max-1)/2)){
                    data[i].dataLabels.color="#000";
                    
                }else{
                    data[i].dataLabels.color="#fff";
                }
            }
            return data;
        };
        function makeColorAxis(arr, max, min) {
            
            var tempArr=_.map(arr, function(num){ return Math.abs(num-1); });
            var closeTo1=_.indexOf(tempArr,_.min(tempArr));
            //debugger;
            
            //var polyArr = polyFit4(arr);
            var clrStops = [];
            var fa = 1;
            // TODO make the fa value
            var cc=style.heatmapColors.length/2;
            for (var i = 0; i < cc; i++) {
                clrStops[i] = [(i * (fa-min) /cc) / (max-min), style.heatmapColors[i]];
                clrStops[i + cc] = [((cc-1)*(fa-min)/cc + (i * (max - (fa-min))/(Math.log(max)/3) / cc)) / (max-min),
                        style.heatmapColors[i + cc]];
            }
            //clrStops.splice(0, 0, [0,colors[0]]);
            //clrStops.push([1,colors[colors.length-1]]);
            /*if(clrStops[7][0]>0.9){
                _.each(clrStops, function(n,key){ clrStops[key][0]=clrStops[key][0]/(clrStops[7][0]*1.4); });
            }*/
            
            return clrStops;
        };
        function processHeatmapData(data){
            baseLine = parseFloat(data.baseLine);
            console.log('baseLine',baseLine)

            var chartData = convertHeatmapData(data.heatmap);

            var max = _.max(chartData, function(d) {
                return parseFloat(d.value);
            });
            var min = _.min(chartData, function(d) {
                return parseFloat(d.value);
            });
             
            var dataArr = _.map(chartData, function(d) {
                return parseFloat(d.value);
            });
            dataArr = _.sortBy(dataArr, function(n) {
                return n;
            });
            var colorAxis = makeColorAxis(dataArr,parseFloat(max.value),parseFloat(min.value));
            return {
                data: addColorKey(chartData, max.value, min.value),
                max: max.value,
                min:min.value,
                colorStops:colorAxis
            }
        };

        function getSingleModel(type,models){
            var model = null;
            model = _.filter(models, function(item){
                if(item.modelType == type){
                    return true;
                }
            });
            return model;
        };
        return {
            getSingleModel:getSingleModel,

            processHeatmapData:processHeatmapData,
            processSplineData:processSplineData,
            reportDataHandle:reportDataHandle,
            getCoverageByRange:getCoverageByRange,
            getWinRateByRange:getWinRateByRange,
            getChartData:getChartData,
            processPieData:processPieData,
            processBarPlotData:processBarPlotData,
            processEngData:processEngData,
            isRunAsCheck:isRunAsCheck,
            getUserABCD:getUserABCD,
            getDefaultUserABCD:getDefaultUserABCD,
            saveUserABCD:saveUserABCD,
            getReportData:getReportData,
            getFitEngHeatMap:getFitEngHeatMap,
            getEngConvData:getEngConvData,
            getCombinedScoreData:getCombinedScoreData,
            updateConversionEvent:updateConversionEvent,
            updateToolTip:updateToolTip
        }
    });