(function () {
    'use strict';

    angular.module('app')
        .controller('VisitsPeople', function ($scope, $timeout, $http, $q, $alert, topAlert, $filter, apiBaseUrl, $log, msg, $modal, style) {

            $scope.idsite = 845221;
            //TODO: fix hard coded idsite
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
                return ($scope.engagementLevelAmounts.high / $scope.visitorsCount) * 100;
            };

            $scope.sliderTextPositionRight = function () {
                return $scope.engagementLevelAmounts.high > $scope.domainsCount / 2;
            };

            $scope.sliderTextPositionLeft = function () {
                return $scope.engagementLevelAmounts.high <= $scope.domainsCount / 2;
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
                    $scope.segCreationOptions.selected = $scope.segmentTypes[index];
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
            };

            $scope.inputInvalid = function () {
                $scope.showErrors = true;
            };

            $scope.saveSegment = function () {
                segCreationOptions.expansion = $scope.expansionFactor;
                $scope.showErrors = false;
                for (var key in $scope.segCreationOptions) {
                    if ($scope.segCreationOptions[key] === undefined) {
                        return false;
                    }
                }
                if ($scope.segCreationOptions.selected === "People - Page Visited" && $scope.segCreationOptions.urlPattern == "") {
                    return false;
                }
                $scope.segCreationOptions.selected = $scope.segmentTypes.indexOf($scope.segCreationOptions.selected);
                // TODO: fix hard coded idsite
                $scope.segCreationOptions.idsite = $scope.idsite;
                //save to backend
                $http.post(apiBaseUrl + "insight/segment", $scope.segCreationOptions)
                    .then(function successCallback(response) {
                        // updates UI table to show the created segment
                        $scope.pageList.getList();
                    }, function errorCallback(response) {
                        console.log(response);
                    });
                return true;
            };

            //cost slider
            $scope.cost = 2.5;

            // copy from campOverview.js, to be extract as a filter or some util

            //page list
            $scope.pageList = {
                tableHeader: [
                    {name: 'Name', dbkey: 'name', align: "text-left", reverse: null},
                    {name: 'Page', dbkey: 'url', align: "text-center", reverse: null},
                    {name: 'Visits', dbkey: 'total_visits', align: "text-center", reverse: null},
                    {name: 'Avg Time Spent (Secs)', dbkey: 'avg_time_on_page', align: "text-center", reverse: null},
                    {name: 'Conversion', dbkey: 'conversion', align: "text-center", reverse: null},
                    {name: 'Duration of Stay', dbkey: 'visits', align: "text-center", reverse: null},
                    {name: 'Net New Visits', dbkey: 'new_visits', align: "text-right", reverse: null}
                ],
                metrics: [
                    {"name": ""}
                ],
                loading: false,
                bigCurrentPage: 1,
                maxSize: 8,
                pageSize: 5,
                daysSinceNow: -7,
                filter: {
                    sort_by: "",
                    order: "desc",
                    time_range: this.daysSinceNow
                },
                ratio: [1, 2, 3, 4]
            };

            $scope.pageList.orderBy = function (key, reverse) {

                $scope.pageList.filter.sort_by = key;
                $scope.pageList.filter.order = reverse ? "asc" : "desc";
                $scope.pageList.bigCurrentPage = 1;
                $scope.pageList.getList();
            };

            $scope.pageList.formQuery = function () {
                var data = {
                    next_page: $scope.pageList.bigCurrentPage,
                    page_size: $scope.pageList.pageSize

                };

                angular.extend(data, $scope.pageList.filter);

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

            $scope.pageList.getList = function () {
                $scope.pageList.loading = true;

                $http.get(apiBaseUrl + "segments/" + $scope.idsite + "?" + $scope.pageList.formQuery())
                    .success(function (response, status, headers, config) {
                        if (response.status === 200) {
                            $scope.pageList.bigTotalItems = response.data.total_count;
                            $scope.pageList.bigCurrentPage = response.data.next_page - 1;
                            $scope.pageList.totalPages = Math.ceil($scope.pageList.bigTotalItems / $scope.pageList.pageSize);
                            $scope.pageList.metrics = response.data;

                            _.each($scope.pageList.metrics, function (e, i) {
                                if (i < 5) {
                                    $scope.pageList.getEngagementScore(i, e.url);
                                }
                            });

                        } else {
                            topAlert.addAlert("Error", msg.NO_DATA);
                        }
                        $scope.pageList.loading = false;
                    })
                    .error(function (data, status, headers, config) {
                        // 404, 500...
                        $scope.pageList.metrics = {name: "-"};
                        $scope.pageList.loading = false;
                        topAlert.addAlert("Error", msg.NO_DATA);
                    });

            };

            $scope.pageList.pageChanged = function () {
                $scope.pageList.getList();
            };

            $scope.pageList.getEngagementScore = function (index, url) {

                $http.get(apiBaseUrl + "visitors/levels/" + $scope.idsite + "/segment/" + encodeURIComponent(url))
                    .success(function (response, status, headers, config) {
                        if (response.status === 200) {
                            $scope.pageList.metrics[index].scoresArr = [response.data.high, response.data.medium, response.data.low];
                        }
                    })
                    .error(function (data, status, headers, config) {
                        // 404, 500...
                        console.log(data);
                        //topAlert.addAlert("Error", msg.NO_DATA);
                    });
            };

            //event list
            $scope.eventList = {
                tableHeader: [
                    {name: 'Event', dbkey: 'domain', align: "text-left", reverse: null},
                    {name: 'Participants', dbkey: 'page_view', align: "text-center", reverse: null},
                    {name: 'Conversion', dbkey: 'score', align: "text-center", reverse: null},
                    {name: 'Net New Visits', dbkey: 'stay', align: "text-center", reverse: null},
                    {name: 'Smart Segment', dbkey: 'visits', align: "text-center", reverse: null}
                ],
                metrics: [
                    {"name": ""}
                ],
                loading: false,
                bigCurrentPage: 1,
                maxSize: 8,
                pageSize: 5,
                daysSinceNow: -7,
                filter: {
                    sort_by: "",
                    order: "desc",
                    time_range: this.daysSinceNow
                }
            };

            $scope.eventList.orderBy = function (key, reverse) {

                $scope.eventList.filter.sort_by = key;
                $scope.eventList.filter.order = reverse ? "asc" : "desc";
                $scope.eventList.bigCurrentPage = 1;
                $scope.eventList.getList();
            };


            $scope.eventList.formQuery = function () {
                var data = {
                    next_page: $scope.eventList.bigCurrentPage,
                    page_size: $scope.eventList.pageSize

                };

                angular.extend(data, $scope.eventList.filter);

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

            $scope.eventList.getList = function () {
                $scope.eventList.loading = true;

                $http.get(apiBaseUrl + "metrics/845221?" + $scope.eventList.formQuery())
                    .success(function (response, status, headers, config) {
                        // 20X
                        console.log(response, status, headers, config);
                        if (response.status === 200) {
                            $scope.eventList.bigTotalItems = response.data.total_count;
                            $scope.eventList.bigCurrentPage = response.data.next_page - 1;
                            $scope.eventList.totalPages = Math.ceil($scope.eventList.bigTotalItems / $scope.eventList.pageSize);
                            $scope.eventList.metrics = response.data.metrics;

                            $scope.eventList.metrics = _.map($scope.eventList.metrics, function (item) {
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
                        $scope.eventList.loading = false;
                    })
                    .error(function (data, status, headers, config) {
                        // 404, 500...
                        $scope.eventList.metrics = {name: "-"};
                        $scope.eventList.loading = false;
                        topAlert.addAlert("Error", msg.NO_DATA);
                    });

            };

            $scope.eventList.pageChanged = function () {
                $scope.eventList.getList();
            };

            //event list end

            $scope.refreshAll = function () {
                this.pageList.getList();
                // Don't populate the event table for the demo
                //this.eventList.getList();
            };

            //will use API calls to get real data in the future for these

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
                        },
                        {
                            name: 'People',
                            y: $scope.visitorsCount,
                            sliced: true
                        }
                    ],
                    "engagement-background": [
                        {
                            name: 'Accounts',
                            y: $scope.domainsCount
                        },
                        {
                            name: 'People',
                            y: $scope.visitorsCount,
                            sliced: true
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
                        + $scope.visitorsCount + " People </span> that  visited your website.</div>"
                    },
                    "engagement": {
                        text: "<div class='aligned-font'>These are the engagement levels of the <span style=\'color:" + style.chartColors[0] + "\'>"
                        + $scope.visitorsCount + " People</span>.</div>"
                    }
                };

                function getDegOfPeople() {
                    return 2 * Math.PI * $scope.visitorsCount / ($scope.domainsCount + $scope.visitorsCount);
                }

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
                            slicedOffset: 15,
                            borderWidth: 0
                        }
                    }
                };

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
                            center: [(50 - Math.sin(getDegOfPeople()) * 4) + '%', (42) + '%']
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
                                distance: 10,
                                padding: 0,
                                connectorWidth: 0,
                                connectorPadding: 0,
                                style: {
                                    fontSize: '14px',
                                    fontWeight: 'normal',
                                    color: '#666',
                                    textShadow: false
                                },
                                format: '{point.y:,.0f}'
                            },
                            startAngle: 360 * $scope.domainsCount / ($scope.domainsCount + $scope.visitorsCount),
                            endAngle: 360
                        }]
                };

            };
            $scope.getChartsData = function () {
                var p1 = $http.get(apiBaseUrl + 'visitors/count?idsite=' + $scope.idsite + '&time=-30');
                var p2 = $http.get(apiBaseUrl + 'domains/count?idsite=' + $scope.idsite + '&time=-30');
                var p3 = $http.get(apiBaseUrl + 'visitors/levels/' + $scope.idsite + '?time=-30');
                $q.all([p1, p2, p3])
                    .then(function (results) {
                        $scope.visitorsCount = results[0].data.data.count;
                        $scope.domainsCount = results[1].data.data.count;
                        $scope.engagementLevelAmounts = results[2].data.data;
                        $scope.renderCharts();
                    });

            };
            //$scope.pageList.getListLocal();

            $scope.renderCharts = function () {

                $scope.initCharts();
                _.each($scope.charts, function (chart) {
                    $('.chart-people-' + chart).highcharts({
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
                });
            };

            $scope.useApi = true;
            $scope.refreshAll();
            $scope.getChartsData();


        });
}());