(function () {
    'use strict';


    angular.module('app')
        .factory('modelChart', function (modelDataService,style) {
            var plotPiePreParams = null;
            var drawPillarMiddleLineParams = null;
            var initSplineParams = null;
            var initHeatmapParams = null;
            var fitBarConfigParams = null;
            var initAverageRateLineParams = null;
            var fitBarSetDataParams = null;
            var initFitBarParams = null;
            function changeThemeOfHighcharts() {

                if (window.Highcharts) {

                    Highcharts.theme = {
                        colors : ["#48a5e1", "#66c6b9", "#fecf47", "#faac48", "#F79020", "#f45b5b", "#8085e9", "#8d4654", "#7798BF", "#aaeeee", "#ff0066", "#eeaaee", "#55BF3B", "#DF5353", "#7798BF", "#aaeeee"],
                        chart : {
                            backgroundColor : "rgba(255,255,255,0)",
                            style : {
                                fontFamily : "'Roboto', 'Helvetica Neue', Helvetica,sans-serif, serif,Arial",
                                fontSize : "14px"
                            }
                        },
                        credits : {
                            enabled : false
                        },
                        labels : {
                            style : {
                                fontSize : '14px'
                            }
                        },
                        plotOptions : {
                            pie : {
                                dataLabels : {
                                    style : {
                                        fontSize : '14px'
                                    }
                                }
                            },
                            bar : {
                                dataLabels : {
                                    style : {
                                        fontSize : '14px'
                                    }
                                }
                            }
                        },
                        yAxis : {

                            title : {
                                style : {
                                    fontSize : '15px'
                                }
                            },
                            labels : {
                                style : {
                                    fontSize : '15px'
                                }
                            }
                        },
                        xAxis : {

                            title : {
                                style : {
                                    fontSize : '15px'
                                }
                            },
                            labels : {
                                style : {
                                    fontSize : '15px'
                                }
                            }
                        }
                    };

                    // Apply the theme
                    Highcharts.setOptions(Highcharts.theme);

                }

            }
            function plotPiePre(params) {
                var params = angular.extend({
                    domName: '',
                    circleDataList: '',
                    isGrey: false,
                    dataCircleOutterSize:'100%',
                    dataCircleInnerSize:'50%'
                }, params);
                plotPiePreParams = params;
                $(params.domName).highcharts({
                    chart : {
                        type : 'pie',
                        spacingTop : 50,
                        spacingLeft : 50,
                        spacingRight : 50,
                        spacingBottom : 50
                    },
                    credits : {
                        enabled : false
                    },
                    title : {
                        text : ''
                    },
                    subtitle : {
                        text : ''
                    },
                    plotOptions : {
                        pie : {
                            animation : false,
                            borderWidth : 0
                        }
                    },
                    tooltip : "",
                    series : [{
                        name : "innerCircle",
                        size : params.dataCircleOutterSize,
                        innerSize : params.dataCircleInnerSize,
                        data : params.circleDataList,
                        dataLabels : {
                            enabled : true,
                            distance : 10,
                            useHTML : true,
                            formatter : function() {
                                var point = this.point;
                                var labelColor = "#666";
                                if(params.isGrey){
                                    return ['<div class="pie-data-labels" style="margin-top:-10px;text-align: center; color: ', labelColor, '; cursor: default;">', '<span>', point.name, '</span>', '</div>'].join("");
                                }else{
                                    return ['<div class="pie-data-labels" style="margin-top:-10px;text-align: center; color: ', labelColor, '; cursor: default;">', '<span>', point.name, '</span>', '<br />', point.y, '%', '</div>'].join("");
                                }

                            },
                            style : {
                                color : "white",
                                fontSize : "18px",
                                fontFamily : "Helvetica,Arial",
                                fontWeight: "normal"
                            }
                        },
                        states : {
                            hover : {
                                enabled : false,
                                halo : {
                                    size : 0
                                }
                            }
                        }
                    }]
                });
            };
            function drawPillarMiddleLine(params) {
                var params = angular.extend({
                    containter: '',
                    leftTopHeight: '',
                    rightTopHeight: ''
                }, params);

                drawPillarMiddleLineParams = params;
                var $_pillarMiddleLine = $(params.containter);
                $_pillarMiddleLine.empty();
                var chartRenderer = new Highcharts.Renderer($_pillarMiddleLine[0], $_pillarMiddleLine.width(), $_pillarMiddleLine.height());

                var svgPath = chartRenderer.path(["M", 0, params.leftTopHeight, "L", 7, params.leftTopHeight, 85, params.rightTopHeight, 95, params.rightTopHeight]).attr({
                    "stroke-width" : 1,
                    stroke : "#AAA"
                }).add();
            };
            function initSpline(params) {
                var params = angular.extend({
                    domId: '',
                    data: '',
                    max: '',
                    baseLine:'',
                    closeToBaseLine:''
                }, params);
                initSplineParams = params;
                var spline = new Highcharts.Chart(
                        {

                            chart : {
                                renderTo : params.domId,
                                marginTop : 30,
                                marginBottom : 50,
                                marginLeft : 110,
                                marginRight : 110,
                                height : 520,
                                width:760,
                                style : {
                                    margin : '0 auto',
                                }

                            },
                            credits : {
                                enabled : false
                            },

                            title : {
                                text : ''
                            },

                            xAxis : {
                                // categories: ['0-9', '10-19', '20-29', '30-39',
                                // '40-49','50-59','60-69','70-79','80-89','90-100'],
                                tickWidth : 0,
                                tickInterval : 100,
                                showLastLabel : true,
                                max : 102,
                                title : {
                                    text : 'Efficiency Model'
                                },
                                lineWidth : 1,
                                lineColor : '#d7d7d7',
                                plotLines : [{
                                    color : '#d7d7d7',
                                    dashStyle : "Dash",
                                    value : params.closeToBaseLine,
                                    width : 2,
                                    zIndex : 5,
                                    label : {
                                        text : params.closeToBaseLine,
                                        align : 'center',
                                        rotation : 0,
                                        x : 0,
                                        y : 460,
                                        style : {
                                            color : '#31a4d4'
                                        }
                                    }
                                }]
                            },

                            yAxis : {
                                gridLineWidth : 0,
                                showFirstLabel : true,
                                tickWidth : 0,
                                tickInterval : Math.ceil(params.max / 5) * 5,
                                max : Math.ceil(params.max / 5) * 5,
                                title : {
                                    text : 'Conversion Lift Multiple'
                                },
                                labels : {
                                    format : '{value}x'
                                },
                                lineWidth : 1,
                                lineColor : '#d7d7d7',
                                plotLines : [{
                                    color : '#d7d7d7',
                                    dashStyle : "Dash",
                                    value : 1,
                                    width : 2,
                                    zIndex : 5,
                                    label : {
                                        text : 'Baseline 1x('
                                                + ((params.baseLine * 1000).toFixed()) / 10
                                                + '%)',
                                        align : 'center',
                                        x : 0,
                                        y : -5,
                                        style : {
                                            color : '#9a9a9b'
                                        }
                                    }
                                }],
                                min : 0
                            },

                            legend : {
                                align : 'right',
                                layout : 'vertical',
                                enabled : false
                            },

                            tooltip : {
                                backgroundColor : '#666',
                                borderWidth : 0,
                                borderRadius : 6,
                                shadow : false,
                                headerFormat : '',
                                pointFormat : 'Lift Multiple: {point.y:.1f}x <br> Score: {point.x:.0f}',
                                style : {
                                    color : "#fff",
                                    fontSize : "14px",
                                    fontWeight : 300
                                }
                            },

                            series : [{
                                type : 'spline',
                                lineWidth : 3,
                                color : '#31a4d4',
                                marker : {
                                    enabled : false
                                },
                                data : params.data
                            }]

                        });
            };
            function initHeatmap(params) {
                var colors = style.heatmapColors;
                var params = angular.extend({
                    domId: '',
                    data: '',
                    max: '',
                    min:'',
                    colorStops:''
                }, params);
                initHeatmapParams = params;
                var heatmap = new Highcharts.Chart(
                        {
                            chart : {
                                renderTo : params.domId,
                                type : 'heatmap',
                                marginTop : 10,
                                marginBottom : 50,
                                marginRight : 100,
                                height : 550,
                                width : 600,
                                style : {
                                    margin : '0 auto',
                                },
                                events : {
                                    load : function() {
                                        var ren = this.renderer;

                                        var i = 0;
                                        var left = this.plotBox.width + this.plotBox.x
                                                + 40;
                                        var bottom = this.plotBox.height
                                                + this.plotBox.y - 60;
                                        for (i = 0; i < colors.length; i++) {
                                            ren.label(' ', left, bottom - i * 20).attr(
                                                    {
                                                        fill : colors[i],
                                                        stroke : 'white',
                                                        'stroke-width' : 2,
                                                        padding : 10,
                                                        r : 0
                                                    }).css({
                                                color : 'white',
                                                width : '100px'
                                            }).add().shadow(false);
                                        };
                                        ren.label('High', left + 25, bottom - (colors.length-1) * 20)
                                                .attr({
                                                    fill : 'white',
                                                    stroke : '#666',
                                                    'stroke-width' : 0,
                                                    padding : 2,
                                                    r : 0
                                                }).css({
                                                    color : '#666'
                                                }).add().shadow(false);
                                        ren.label('Low', left + 25, bottom).attr({
                                            fill : 'white',
                                            stroke : '#666',
                                            'stroke-width' : 0,
                                            padding : 2,
                                            r : 0
                                        }).css({
                                            color : '#666'
                                        }).add().shadow(false);

                                        ren.path(['M',
                                                    this.plotLeft - 4.5,
                                                    this.plotTop + 34,
                                                    'L',
                                                    this.plotLeft - 4.5,
                                                    (this.plotTop
                                                            + this.plotHeight - 35.5),
                                                    'L',
                                                    this.plotLeft + 2.5,
                                                    (this.plotTop
                                                            + this.plotHeight - 35.5)])
                                                .attr({
                                                    'stroke-width' : 1,
                                                    stroke : '#ccc'
                                                }).add();

                                    }
                                }
                            },
                            credits : {
                                enabled : false
                            },

                            title : {
                                text : ''
                            },

                            xAxis : {
                                offset : -36,
                                tickWidth : 0,
                                title : {
                                    text : 'Fit Score'
                                },
                                gridLineWidth : 0,
                                lineWidth : 1,
                                lineColor : '#ccc',
                                floor : 0,
                                min : 10,

                                labels : {
                                    align : "center",
                                    style : {
                                        fontSize : '15px'
                                    }
                                }
                            },

                            yAxis : {

                                showFirstLabel : true,
                                tickWidth : 0,
                                title : {
                                    text : 'Engagement Score'
                                },
                                lineWidth : 0,
                                floor : 0,
                                min : 10,
                                gridLineWidth : 0,

                                labels : {
                                    align : "right",
                                    style : {
                                        fontSize : '15px'
                                    }
                                }
                            },

                            colorAxis : {
                                stops : params.colorStops,
                                min : params.min,
                                max : params.max

                            },

                            legend : {

                                enabled : false

                            },

                            
                            plotOptions : {

                                heatmap : {
                                    rowsize : 20,
                                    colsize : 20
                                }
                            },
                            series : [{
                                name : null,
                                cursor : 'default',
                                borderWidth : 4,
                                borderColor : '#fff',

                                colorByPoint : true,
                                data : params.data,
                                dataLabels : {
                                    enabled : true,
                                    color : '#000000',
                                    shadow : false,
                                    align : 'center',
                                    useHTML:true,
                                    x:1,
                                    y:-5,
                                    zIndex:0,
                                    formatter : function() {
                                        var cover = '<0.1%';
                                        if (this.point.coverage >= 0.001) {
                                            cover = Highcharts.numberFormat(
                                                    this.point.coverage * 100, 1)
                                                    + '%';
                                        }
                                        return '<div align="center">'+Highcharts.numberFormat(
                                                this.point.value, 1)
                                                + 'x<br>' + cover+'</div>';
                                    },
                                    style : {
                                        fontWeight : 300,
                                        textAlign : 'center',
                                        fontSize : '16px',
                                        "textShadow" : null
                                    }
                                }
                            }],
                            tooltip : {
                                backgroundColor : '#666',
                                borderWidth : 0,
                                borderRadius : 6,
                                shadow : false,
                                style : {
                                    color : "#fff",
                                    fontSize : "15px",
                                    fontWeight : 300
                                },
                                useHTML:true,
                                formatter : function() {
                                        var cover = '<0.1%';
                                        if (this.point.coverage >= 0.001) {
                                            cover = Highcharts.numberFormat(
                                                    this.point.coverage * 100, 1)
                                                    + '%';
                                        }
                                        return '<div align="center">Lift Multiple: '+Highcharts.numberFormat(
                                                this.point.value, 1)
                                                + 'x<br>% of Prospects: ' + cover+'</div>';
                                },
                            }

                        });

            };
            function fitBarConfig(params){

                var params = angular.extend({
                    domName: '',
                    avg_win_rate:[],
                    VERTICAL_TEXT: 'Fit Score',
                    BOTTOM_TEXT: 'Conversion Rate',
                    MIN_X_AXIS:0,
                    MAX_X_AXIS:19
                }, params);
                fitBarConfigParams = params;
                var chartConfig = {
                    chart : {
                        type : "bar",
                        // disabled chart animation to make sure AverageText position calculate right
                        animation : false,
                        spacingTop : 15,
                        spacingBottom : 0,
                        spacingRight : 0
                    },
                    title : false,
                    xAxis : {
                        title : {
                            text : params.VERTICAL_TEXT,
                            offset : 20,
                            style : {
                                color : "#999",
                                fontSize : "14px",
                                fontFamily : "Helvetica,Arial"
                            }
                        },
                        max : params.MAX_X_AXIS,
                        min : params.MIN_X_AXIS,
                        tickWidth : 0,
                        lineWidth : 0,
                        labels : {
                            enabled : false
                        }
                    },
                    yAxis : {
                        title : {
                            text : params.BOTTOM_TEXT,
                            offset : 42,
                            style : {
                                color : "#999",
                                fontSize : "14px",
                                fontFamily : "Helvetica,Arial"
                            }
                        },
                        // hide gridLine
                        gridLineWidth : 0,
                        // show yAxis line
                        lineWidth : 1,
                        labels : {
                            enabled : false
                        }
                    },
                    tooltip : {
                        formatter : function() {
                            var winRateArray = params.avg_win_rate;
                            var winRateIndex = (winRateArray.length - 1) - this.x;

                            var lift = _.round(this.y, 1);
                            var winRate = winRateArray[winRateIndex] * 100;

                            winRate = (winRate < 1) ? "<1" : Math.round(winRate);

                            return lift + "x (" + winRate + "%)";
                        },
                        shadow : false,
                        borderColor : "#6E6E6E",
                        backgroundColor : "#6E6E6E",
                        style : {
                            color : "white",
                            padding : 5
                        }
                    },
                    series : [{
                        borderRadius:5,
                        data : []
                    }, {
                        animation:false,
                        type : 'line',
                        name : 'Average',
                        data : [[(params.MIN_X_AXIS - 1), 1], [(params.MAX_X_AXIS + 1), 1]],
                        pointStart : 1,
                        marker : {
                            enabled : false
                        },
                        shadow : false,
                        dashStyle : 'LongDash',
                        pointInterval : 3,
                        // fillColor:"rgba(255, 255, 255, 0)",
                        // fillOpacity: 0,
                        lineColor : "#C4C4C4",
                        lineWidth : 1,
                        states : {
                            hover : {
                                lineWidth : 1
                            }
                        },
                        enableMouseTracking : false
                    }],
                    // hide the series categories
                    legend : {
                        enabled : false
                    },
                    plotOptions : {
                        bar : {
                            // borderRadius: 5,
                            // bar width
                            pointWidth : 20
                        }
                    }
                };
                return chartConfig;
            };
            function initAverageRateLine(params) {
                var params = angular.extend({
                    domName: '',
                    averageRate:0,
                    MIN_X_AXIS:0,
                    MAX_X_AXIS:19
                }, params);
                initAverageRateLineParams = params;
                var myChart = $(params.domName).highcharts();
                console.log('[(params.MIN_X_AXIS - 1), params.averageRate], [(params.MAX_X_AXIS + 1), params.averageRate]]',[[(params.MIN_X_AXIS - 1), params.averageRate], [(params.MAX_X_AXIS + 1), params.averageRate]])
                myChart.series[1].setData([[(params.MIN_X_AXIS - 1), params.averageRate], [(params.MAX_X_AXIS + 1), params.averageRate]]);
            };
            function fitBarSetData(params) {
                var params = angular.extend({
                    domName: '',
                    serieData:null,
                    range: ''
                }, params);
                fitBarSetDataParams = params;
                console.log('fitBarSetData.range',params)
                var colors = _.sortBy(style.abcdColors, function(data,index) {
                    return -index;
                });
                var myChart = $(params.domName).highcharts();
                var serieData = params.serieData ?params.serieData : myChart.series[0].data;
                var data = [];
                // note: the index of `serieData` will be contrary to the index of `range`
                var dataIndex = serieData.length - 1;

                // reset colors of the `serieData` according to the `range`
                console.log('serieData===',serieData)

                for (var i = 0, len = params.range.length - 1; i < len; i++) {
                    var beginIndex = params.range[i];
                    var endIndex = params.range[i + 1];

                    for (var j = beginIndex; j < endIndex; j++) {
                        serieData[dataIndex--].color = colors[i];
                    }
                };
                serieData.forEach(function(n,i){
                    data[i] = {};
                    data[i].color = n.color;
                    data[i].y = n.y;
                });
                // no animation
                console.log(data);

                $(params.domName).highcharts(params.chartConfig);
                $(params.domName).highcharts().series[0].setData({});
                $(params.domName).highcharts().series[0].setData(data);
            };
            function initFitBar(params){
                var params = angular.extend({
                    domName: '',
                    avg_win_rate:[],
                    chartConfig:'',
                    serieData:'',
                    range: ''
                }, params);
                initFitBarParams = params;
                var chartConfig = fitBarConfig(params);
                $(params.domName).highcharts(chartConfig);

                // process serieData to [{ y: 12 }, { y: 543 }]
                fitBarSetData(params);

                // init `average rate line`
                // but now didn't need to init because serieData change to `avg_lift_multiple`
                //initAverageRateLine({
                //    domName: params.domName,
                //    averageRate:params.averageRate,
                //});
            };


            return {
                fitBarSetData:fitBarSetData,
                initFitBar:initFitBar,
                plotPiePre:plotPiePre,
                drawPillarMiddleLine:drawPillarMiddleLine,
                initSpline:initSpline,
                initHeatmap:initHeatmap
            };
        });

}());