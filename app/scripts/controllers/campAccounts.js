(function () {
    'use strict';

    angular.module('app')
        .controller('CampaignPeople', function ($scope, $timeout, $http, $alert, topAlert, $filter, apiBaseUrl, msg, $log) {
            // copy from campOverview.js, to be extract as a filter or some util
            function serializeHttpParams(obj) {
                if (!_.isObject(obj)) {
                    throw new TypeError("argument must be an object.");
                }

                return _.map(_.pairs(obj), function (pair) {
                    return pair.join('=');
                }).join('&');
            }

            var revenueChart = function () {
                var config = {
                    chart: {
                        type: 'column'
                    },
                    title: {
                        text: '',
                        style: {
                            display: 'none'
                        }
                    },
                    xAxis: {
                        categories: ['2M', '5M', '50M', '100M']
                    },
                    yAxis: { // Primary yAxis
                        title: {
                            enabled: false
                        },
                        gridLineWidth: 1
                    },
                    plotOptions: {
                        series: {
                            color: '#5f91ae',
                            borderRadius: 5
                        }
                    },
                    legend: {
                        enabled: false
                    },
                    series: [{
                        data: [86, 68, 52, 39]
                    }]
                };
                $timeout(function () {
                    $('#chart-revenue').highcharts(config);
                }, 100);
            };
            var employeeChart = function () {
                var config = {
                    chart: {
                        type: 'pie'
                    },
                    title: {
                        text: '',
                        style: {
                            display: 'none'
                        }
                    },
                    plotOptions: {
                        series: {
                            dataLabels: {
                                enabled: true,
                                format: '{point.name}'
                            }
                        },
                        pie: {
                            dataLabels: {
                                distance: -30
                            }
                        }
                    },
                    series: [{
                        name: "Brands",
                        colorByPoint: true,
                        data: [
                            {
                                name: '50K',
                                y: 33,
                                color: '#2d6c92'
                            },
                            {
                                name: '175K',
                                y: 33,
                                color: '#5f91ae'
                            },
                            {
                                name: '5K',
                                y: 15,
                                color: '#e1ebf4'
                            },
                            {
                                name: '10K',
                                y: 15,
                                color: '#bbd1e6'
                            },
                            {
                                name: '1K',
                                y: 4,
                                color: '#032c47'
                            }
                        ]
                    }]
                };
                $timeout(function () {
                    $('#chart-employee').highcharts(config);
                }, 100)
            }

            $scope.dateRange = {};

            $scope.dateRange.list = [
                {name: 'All Time', value: 300000},
                {name: 'Last 30 days', value: 30},
                {name: 'Last 7 days', value: 7},
                {name: 'Yesterday', value: 1}
            ];
            $scope.dateRange.selected = $scope.dateRange.list[0];

            $scope.campaignList = {};
            $scope.campaignList.filter = {
                campId: -1,
                sortKey: "",
                sortDir: "desc",
                searchKey: "",
                startTime: $filter('date.formStartTime')($scope.dateRange.list[0].value),
                endTime: $filter('date.formEndTime')()
            };

            $scope.changeDateRange = function (item, model) {

                $scope.campaignList.filter.endTime = $filter('date.formEndTime')();
                $scope.campaignList.filter.startTime = $filter('date.formStartTime')(item.value);

                this.refreshAll();
            };


            /*start table list*/

            $scope.campaignList.sortKey = 'name';
            $scope.campaignList.tableHeader = [
                {name: 'Campaign', dbkey: 'name', align: "text-left", reverse: null},
                {name: 'Status', dbkey: 'status', align: "text-center", reverse: null},
                {name: 'Impression', dbkey: 'imp', align: "text-right", reverse: null},
                {name: 'Clicks', dbkey: 'clicks', align: "text-right", reverse: null},
                /*{name: 'Engage', dbkey: 'engage', align: "text-center", reverse: null},
                 {name: 'Conv', dbkey: 'conv', align: "text-right", reverse: null},*/
                {name: 'CTR', dbkey: 'ctr', align: "text-right", reverse: null},
                {name: 'CPM', dbkey: 'cpm', align: "text-right", reverse: null},
                {name: 'CPC', dbkey: 'cpc', align: "text-right", reverse: null},
                {name: 'Spend', dbkey: 'spend', align: "text-right", reverse: null},
                {name: 'Budget', dbkey: 'budget', align: "text-right", reverse: null}
            ];

            $scope.campaignList.compList = [
                {"name": ""}
            ];
            $scope.campaignList.loading = false;


            $scope.campaignList.bigCurrentPage = 1;
            $scope.campaignList.maxSize = 8;
            $scope.campaignList.pageSize = 10;


            $scope.campaignList.orderBy = function (key, reverse) {

                $scope.campaignList.filter.sortKey = key;
                $scope.campaignList.filter.sortDir = reverse ? "asc" : "desc";
                $scope.campaignList.bigCurrentPage = 1;
                $scope.campaignList.getList();
            };


            $scope.campaignList.formQuery = function () {

                var data = {
                    currentPage: $scope.campaignList.bigCurrentPage,
                    pageSize: $scope.campaignList.pageSize
                };

                angular.extend(data, $scope.campaignList.filter);

                var dataArr = [];
                var d;
                for (d in data) {
                    if (angular.isNumber(data[d]) || angular.isString(data[d]))
                        dataArr.push(d + "=" + data[d]);
                }
                return (dataArr.join("&"));
            };

            $scope.campaignList.csvUrl = function () {
                var params = {
                    currentPage: 1,
                    pageSize: 99999,
                    startTime: $scope.campaignList.filter.startTime,
                    endTime: $scope.campaignList.filter.endTime,
                    sortKey: 'name',
                    format: 'csv'
                };

                return apiBaseUrl + "insight/campaigns?" + serializeHttpParams(params);
            };

            $scope.campaignList.startSearch = function (e) {

                if (e.keyCode === 13) { //|| !$.trim($scope.campaignList.filter.searchKey)
                    $scope.campaignList.bigCurrentPage = 1;
                    $scope.campaignList.getList();
                }

            };
            $scope.campaignList.clearKey = function (e) {
                $scope.campaignList.filter.searchKey = "";
                $scope.campaignList.bigCurrentPage = 1;
                $scope.campaignList.getList();

            };

            $scope.campaignList.gotoPage = function (e) {
                if ($scope.campaignList.bigCurrentPage > 0) {
                    $scope.campaignList.getList();
                }
            };


            $scope.campaignList.pageChanged = function () {

                $scope.campaignList.getList();
            };


            $scope.campaignList.getList = function () {

                $scope.campaignList.loading = true;


                $http.get(apiBaseUrl + "insight/campaigns?" + $scope.campaignList.formQuery())
                    .success(function (response, status, headers, config) {
                        // 20X
                        console.log(response, status, headers, config);
                        if (response.status === 200) {
                            $scope.campaignList.bigTotalItems = response.data.count;
                            $scope.campaignList.totalPages = Math.ceil($scope.campaignList.bigTotalItems / $scope.campaignList.pageSize);
                            $scope.campaignList.compList = response.data.list;

                        } else {
                            topAlert.addAlert("Error", msg.NO_DATA);
                        }
                        $scope.campaignList.loading = false;
                    })
                    .error(function (data, status, headers, config) {
                        // 404, 500...
                        $scope.campaignList.compList = {name: "-"};
                        $scope.campaignList.loading = false;
                        topAlert.addAlert("Error", msg.NO_DATA);
                    });


            };

            $scope.refreshAll = function () {
                this.campaignList.getList();
                revenueChart();
                employeeChart();
            };
            revenueChart();
            employeeChart();
            $scope.campaignList.getList();

            $scope.toggleCampaignStatus = function (campaign) {
                var url = apiBaseUrl + 'campaigns/' + campaign.id;
                var new_value = (campaign.status === 'Paused' ? 'Active' : 'Paused');

                $http.put(url, {
                    field: 'status',
                    new_value: new_value
                }).success(function (data) {
                    var content = 'RequestId is ' + data.id;
                    $alert({
                        title: 'Sent campaign status update request!',
                        content: content,
                        placement: 'top',
                        type: 'info',
                        show: true
                    });
                }).error(function (data) {
                    $alert({
                        title: 'Oops..',
                        content: data.statusInfo,
                        placement: 'top',
                        type: 'danger',
                        show: true
                    });
                });
            };
        });


}());