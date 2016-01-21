(function () {
    'use strict';

    angular.module('app')
        .controller('Visits', function ($scope, $timeout, $http, $q, $alert, topAlert, $filter, apiBaseUrl, msg, $log, $modal, style) {

            $scope.idsite = 845221;
            $scope.expansionFactor = 1;
            $scope.expansionFactorMax = 5;

            $scope.sliderOptions = {
                from: 1,
                to: 5,
                step: 1,
                smooth: false,
                realtime: true,
                dimension: "",
                scale: ['1X', '2X', '3X', '4X', '5X'],
                css: {
                    background: {"background-color": "silver"},
                    before: {"background-color": "#055ec3"},
                    default: {"background-color": "#055ec3"},
                    after: {"background-color": "#055ec3"},
                    pointer: {"background-color": "#fff"},
                    label: {top: "22222222px"}
                },
                className: "es-slider",
                callback: function (value, released) {
                    // useful when combined with 'realtime' option
                    // released it triggered when mouse up
                    //console.log(value + " " + released);
                }
            };

            $scope.sliderBarWidth = function () {
                return ($scope.engagementLevelAmounts.high/$scope.domainsCount)*100;
            };

            $scope.sliderTextPositionRight = function () {
                return $scope.engagementLevelAmounts.high > $scope.domainsCount/2
            };

            $scope.sliderTextPositionLeft = function () {
                return $scope.engagementLevelAmounts.high <= $scope.domainsCount/2
            };


            var newSegmentModal = $modal({
                scope: $scope,
                template: 'views/modals/modal.tpl.segment.html',
                placement: 'center',
                show: false,
                title: "Create Segment"
            });

            $scope.showModal = function (index) {
                $scope.segCreationOptions = {
                    selected: undefined,
                    name: undefined,
                    duration: undefined,
                    conversion: false,
                    urlPattern: ""
                };

                if (index >= 0 && index < $scope.segmentTypes.length) {
                    $scope.segCreationOptions.selected = $scope.segmentTypes[index]
                }

                $scope.showErrors = false;
                newSegmentModal.$promise.then(newSegmentModal.show);
                return false;
            };

            $scope.segmentTypes = ["Accounts - High Engagement", "People - High Engagement", "People - Page Visited", "People - Event Clicked"];
            $scope.expansionOptions = [1, 2, 3, 4, 5];
            $scope.segCreationOptions = {};
            $scope.showErrors = false;

            $scope.expansionIncrease = function () {
                return $scope.expansionFactor * $scope.engagementLevelAmounts.high;
            }

            $scope.inputInvalid = function () {
                $scope.showErrors = true;
            };

            $scope.saveSegment = function () {
                $scope.showErrors = false;
                for (var key in $scope.segCreationOptions) {
                    if ($scope.segCreationOptions[key] === undefined) {
                        return false;
                    }
                }
                if ($scope.segCreationOptions.selected === "People - Page Visited" && $scope.segCreationOptions.urlPattern == "") {
                    return false;
                }
                //save to backend with api call
                return true;
            };

            //cost slider
            $scope.cost = 2.5;


            // copy from campOverview.js, to be extract as a filter or some util


            $scope.domainList = {
                tableHeader: [
                    {name: 'Domain', dbkey: 'domain', align: "text-left", reverse: null},
                    {name: 'Page Views', dbkey: 'page_view', align: "text-center", reverse: null},
                    {name: 'Duration', dbkey: 'stay', align: "text-center", reverse: null},
                    {name: 'Engagement Score', dbkey: 'score', align: "text-center", reverse: null},
                    {name: 'Total Visits', dbkey: 'visits', align: "text-center", reverse: null}
                ],
                metrics: [
                    {"name": ""}
                ],
                loading: false,
                bigCurrentPage: 1,
                maxSize: 8,
                pageSize: 10,
                daysSinceNow: -7,
                filter: {
                    sort_by: "",
                    order: "desc",
                    time_range: this.daysSinceNow
                }
            };

            $scope.domainList.orderBy = function (key, reverse) {
                $scope.domainList.filter.sort_by = key;
                $scope.domainList.filter.order = reverse ? "asc" : "desc";
                $scope.domainList.bigCurrentPage = 1;
                $scope.domainList.getList();
            };


            $scope.domainList.formQuery = function () {
                var data = {
                    next_page: $scope.domainList.bigCurrentPage,
                    page_size: $scope.domainList.pageSize

                };

                angular.extend(data, $scope.domainList.filter);

                data = _.omit(data, function (v) {
                    return v === "";
                });

                var dataArr = [];
                for (var d in data) {
                    if (angular.isNumber(data[d]) || angular.isString(data[d]))
                        dataArr.push(d + "=" + data[d]);
                }
                return (dataArr.join("&"));
            };

            $scope.domainList.getList = function () {
                $scope.domainList.loading = true;

                var p1 = $http.get(apiBaseUrl + 'metrics/' + $scope.idsite + '?' + $scope.domainList.formQuery());
                var p2 = $http.get(apiBaseUrl + 'domains/levels/' + $scope.idsite + '?high=80&low=30');
                $q.all([p1, p2])
                    .then(function (results) {
                        //for p1
                        var response = results[0].data;
                        if (response.status === 200) {
                            $scope.domainList.bigTotalItems = response.data.total_count;
                            $scope.domainList.bigCurrentPage = response.data.next_page - 1;
                            $scope.domainList.totalPages = Math.ceil($scope.domainList.bigTotalItems / $scope.domainList.pageSize);
                            $scope.domainList.metrics = response.data.metrics;

                            $scope.domainList.metrics = _.map($scope.domainList.metrics, function (item) {
                                item.options = {
                                    lineWidth: 5,
                                    trackColor: '#dedede',
                                    scaleColor: '#fff',
                                    size: 54,
                                    lineCap: 'butt',
                                    barColor: $filter('filterRingColor')(item.score)
                                };
                                return item;
                            });

                        } else {
                            topAlert.addAlert("Error", msg.NO_DATA);
                        }
                        $scope.domainList.loading = false;

                        //for p2
                        $scope.engagementLevelAmounts = results[1].data.data;


                    }, function (error) {
                        $scope.domainList.metrics = {name: "-"};
                        $scope.domainList.loading = false;
                        topAlert.addAlert("Error", msg.NO_DATA);
                    });

            };

            $scope.domainList.pageChanged = function () {
                $scope.domainList.getList();
            };

            $scope.refreshAll = function () {
                this.domainList.getList();
            };

            //this will be controlled by a slider that will be implemented for the rightmost chart


            $scope.engagementLevelAmounts = {
                "high": 0,
                "medium": 0,
                "low": 0
            };

            /* HighCharts Configuration Stuff */
            $scope.initCharts = function () {
                $scope.charts = [
                    "visits",
                    "engagement"
                ];


                $scope.chartData = {
                    "visits": [
                        {
                            name: 'Accounts',
                            y: $scope.domainsCount,
                            sliced: true
                        },
                        {
                            name: 'People',
                            y: $scope.visitorsCount,
                        }
                    ],
                    "engagement-background": [
                        {
                            name: 'Accounts',
                            y: $scope.domainsCount,
                            sliced: true
                        },
                        {
                            name: 'People',
                            y: $scope.visitorsCount,
                        }
                    ],
                    "engagement": [
                        {
                            name: 'High',
                            y: $scope.engagementLevelAmounts["high"],
                            color: '#055EC3'
                        },
                        {
                            name: 'Medium',
                            y: $scope.engagementLevelAmounts["medium"],
                            color: '#FFB91D'
                        },
                        {
                            name: 'Low',
                            y: $scope.engagementLevelAmounts["low"],
                            color: '#FF7803'
                        }
                    ]
                };

                $scope.chartTitleOptions = {
                    "visits": {
                        text: "<div class='aligned-font'>We identified <span style=\'color:" + style.chartColors[0] + "\'>"
                        + $scope.domainsCount + " Accounts </span> out of all visits on your website.</div>"
                    },
                    "engagement": {
                        text: "<div class='aligned-font'>These are the engagement levels of the <span style=\'color:" + style.chartColors[0] + "\'>"
                        + $scope.domainsCount + " Accounts</span>.</div>"
                    }
                };

                $scope.chartPlotOptions = {
                    "visits": {
                        pie: {
                            dataLabels: {
                                enabled: true,
                                distance: 25,
                                padding: 0,
                                connectorColor: null,
                                connectorWidth: 0,
                                style: {

                                    color: '#666',
                                    textShadow: '0px 0px 0px black'
                                },
                                format: '{y}'
                            },
                            states: {
                                hover: {
                                    halo: false
                                }
                            },
                            slicedOffset: 15,
                            borderWidth: 0
                        }
                    },
                    "engagement": {
                        pie: {
                            states: {
                                hover: {
                                    halo: false
                                }
                            },
                            borderWidth: 0
                        }
                    }
                };

                function getDegOfAccount() {
                    return 2 * Math.PI * $scope.domainsCount / ($scope.domainsCount + $scope.visitorsCount);
                }

                $scope.chartSeries = {
                    "visits": [{
                        type: 'pie',
                        name: 'Portion',
                        innerSize: '0%',
                        size: '70%',
                        data: $scope.chartData['visits'],
                        showInLegend: true
                    }],
                    "engagement": [
                        {
                            type: 'pie',
                            name: 'Portion',
                            innerSize: '0%',
                            data: $scope.chartData['engagement-background'],
                            showInLegend: false,
                            size: '45%',
                            dataLabels: {
                                enabled: false
                            },
                            slicedOffset: 12,
                            enableMouseTracking: false,
                            center: [(50 - Math.sin(getDegOfAccount()) * 4) + '%', (58) + '%']
                        },
                        {
                            type: 'pie',
                            name: 'Portion',
                            innerSize: '0%',
                            data: $scope.chartData['engagement'],
                            showInLegend: true,
                            size: '70%',
                            dataLabels: {
                                enabled: true,

                                style: {
                                    fontSize: '14px',
                                    fontWeight: 'normal',
                                    color: '#666',
                                    textShadow: false
                                },
                                format: '{point.y:,.0f}'
                            },
                            startAngle: 0,
                            endAngle: $scope.domainsCount * (360 / ($scope.domainsCount + $scope.visitorsCount))
                        }]
                };


            };

            $scope.getChartsData = function () {
                var p1 = $http.get(apiBaseUrl + 'visitors/count?idsite=' + $scope.idsite + '&time=-30');
                var p2 = $http.get(apiBaseUrl + 'domains/count?idsite=' + $scope.idsite + '&time=-30');
                var p3 = $http.get(apiBaseUrl + 'domains/levels/' + $scope.idsite + '?high=80&low=30');
                $q.all([p1, p2, p3])
                    .then(function (results) {
                        $scope.visitorsCount = results[0].data.data.count;
                        $scope.domainsCount = results[1].data.data.count;
                        $scope.engagementLevelAmounts = results[2].data.data;
                        $scope.renderCharts();
                    });

            };

            //$scope.domainList.getListLocal();

            $scope.renderCharts = function () {
                $scope.initCharts();
                _.each($scope.charts, function (chart) {
                    $timeout((function () {
                        $('.chart-account-' + chart).highcharts({
                            chart: {
                                marginTop: 60,
                                marginLeft: chart == 'expansion' ? 50 : 0,
                                marginRight: chart == 'expansion' ? 50 : 0,
                                spacingBottom: chart == 'expansion' ? 150 : 15,
                                inverted: chart == 'expansion'
                            },
                            title: {
                                align: "left",
                                verticalAlign: "top",
                                useHTML: true,
                                style: {
                                    "font-size": "14px",
                                    "color": "#000"
                                },
                                text: $scope.chartTitleOptions[chart].text
                            },
                            tooltip: {
                                enabled: false
                            },
                            plotOptions: $scope.chartPlotOptions[chart],
                            series: $scope.chartSeries[chart]
                        });
                    }), 100);
                });
            };

            $scope.domainList.getList();
            $scope.getChartsData();

        });
}());