(function () {
    'use strict';

    angular.module('app')
        .controller('CompanyInsightsCtrl', function ($scope, $timeout, $log, $http, apiBaseUrl, style, $filter) {
            function normalize(score) {
                return score < 0 ? "NA" : score;
            }

            // company = { address_city: "San Mateo", address_state: "California", address_country: "US" }
            $scope.formatLevelOneAddress = function (company) {
                var keys = ["address_city", "address_state", "address_country"];
                return _.compact(_.map(keys, _.propertyOf(company))).join(', ');
            };

            var url = apiBaseUrl + "insight/campaigns/" + $scope.campaignId +
                "/companies/" + $scope.companyId;
            $http.get(url)
                .success(function (data) {
                    $scope.company = data.data.company;

                    var scores = data.data.scores;
                    $scope.scores = [{
                        value: normalize(scores.score),
                        title: "FIT"
                    }, {
                        value: normalize(scores.engagement_score),
                        title: "ENGAGEMENT"
                    }];

                    $scope.scores = _.map($scope.scores, function (item) {
                        item.options = {
                            lineWidth: 12,
                            trackColor: '#dedede',
                            scaleColor: '#fff',
                            size: 80,
                            lineCap: 'butt',
                            barColor: $filter('filterRingColor')(item.value)
                        };
                        return item;
                    });

                    $scope.agg_metrics = data.data.aggregated_metrics;

                    drawCharts(data.data.daily_metrics);

                })
                .error(function (error) {
                    $log.error(error);
                });


            function drawCharts(dataPoints) {
                $log.debug(dataPoints);
                var impressionPoints = _.map(dataPoints, function (point) {
                    return [Date.parse(point.start_time), point.impressions];
                });
                var clickPoints = _.map(dataPoints, function (point) {
                    return [Date.parse(point.start_time), point.clicks];
                });
                $log.debug(impressionPoints, clickPoints);

                $('#daily-metrics-charts').highcharts({
                    title: {
                        text: null
                    },
                    xAxis: {
                        type: "datetime",
                        gridLineWidth: 1,
                        lineWidth: 0,
                        dateTimeLabelFormats: {
                            day: '%b %e',
                            week: '%b %e',
                        }
                    },
                    yAxis: [{ // left y axis
                        title: {
                            text: "IMPRESSIONS",
                            style: {
                                "color": style.chartColors[0]
                            }
                        },
                        showFirstLabel: false,
                        gridLineWidth: 0
                    }, { // right y axis
                        id: 3,
                        opposite: true,
                        title: {
                            text: "CLICKS",
                            style: {
                                "color": style.chartColors[1]
                            }
                        },
                        gridLineWidth: 0,
                        showFirstLabel: false

                    }],
                    legend: {
                        enabled: false
                    },
                    tooltip: {
                        shared: true,
                        crosshairs: true
                    },
                    credits: false,
                    plotOptions: {
                        series: {
                            cursor: 'pointer',
                            point: {
                                events: {
                                    click: function (e) {
                                        hs.htmlExpand(null, {
                                            pageOrigin: {
                                                x: e.pageX || e.clientX,
                                                y: e.pageY || e.clientY
                                            },
                                            headingText: this.series.name,
                                            maincontentText: Highcharts.dateFormat('%A, %b %e, %Y', this.x) + ':<br/> ' +
                                            this.y + ' visits',
                                            width: 200
                                        });
                                    }
                                }
                            },
                            lineWidth: 2,
                            marker: {
                                lineColor: null,
                                lineWidth: 2,
                                fillColor: "#fff",
                                radius: 3
                            }
                        }
                    },

                    series: [{
                        name: 'Impressions',
                        data: impressionPoints,
                        lineWidth: 5,
                        marker: {
                            symbol: 'circle',
                            lineWidth: 5,
                            fillColor: '#FFFFFF',
                            radius: 6,
                            states: {
                                hover: {
                                    lineWidth: 5,
                                    radiusWidthPlus: 0,
                                    lineWidthPlus: 0
                                }
                            }
                        }
                    }, {
                        name: 'Clicks',
                        data: clickPoints,
                        yAxis: 3,
                        lineWidth: 5,
                        marker: {
                            symbol: 'circle',
                            lineWidth: 5,
                            fillColor: '#FFFFFF',
                            radius: 6,
                            states: {
                                hover: {
                                    lineWidth: 5,
                                    radiusWidthPlus: 0,
                                    lineWidthPlus: 0
                                }
                            }
                        }
                    }]
                });
            }
        });
}());