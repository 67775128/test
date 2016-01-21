(function () {
    'use strict';


    angular.module('app')
        .factory('greyColumnChart', function () {
            return {
                initChart: function ($ele, data) {
                    return $ele.highcharts({
                        chart: {
                            type: "column",
                            // disabled chart animation to make sure AverageText position calculate right
                            animation: false,
                            width: 320,
                            spacingTop: 15,
                            spacingBottom: 0,
                            spacingRight: 0
                        },
                        credits: {
                            enabled: false
                        },
                        title: false,
                        xAxis: {
                            title: {
                                text: "",
                                offset: 20,
                                style: {
                                    color: "#999",
                                    fontSize: "14px",
                                    fontFamily: "Helvetica,Arial"
                                }
                            },

                            tickWidth: 0,
                            lineWidth: 0,
                            labels: {
                                enabled: false
                            }
                        },
                        yAxis: {
                            title: {
                                text: "",
                                offset: 42,
                                style: {
                                    color: "#999",
                                    fontSize: "14px",
                                    fontFamily: "Helvetica,Arial"
                                }
                            },
                            // hide gridLine
                            gridLineWidth: 0,
                            // show yAxis line
                            lineWidth: 1,
                            labels: {
                                enabled: false
                            }
                        },
                        tooltip: {
                            formatter: function () {

                                //return lift + "x (" + winRate + "%)";
                            },
                            shadow: false,
                            borderColor: "#6E6E6E",
                            backgroundColor: "#6E6E6E",
                            style: {
                                color: "white",
                                padding: 5
                            }
                        },
                        series: [{
                            data: data
                        }],
                        // hide the series categories
                        legend: {
                            enabled: false
                        },
                        plotOptions: {
                            bar: {
                                borderRadius: 6,
                                // bar width
                                pointWidth: 12
                            }
                        }
                    });
                },
                setData: function () {

                }
            };
        });

}());