(function () {
    'use strict';

    angular.module('app')
        .controller('Camps', function ($scope, $timeout, $http, $alert, topAlert, $filter, apiBaseUrl, msg, $location, $log) {
            // copy from campOverview.js, to be extract as a filter or some util
            function serializeHttpParams(obj) {
                if (!_.isObject(obj)) {
                    throw new TypeError("argument must be an object.");
                }

                return _.map(_.pairs(obj), function (pair) {
                    return pair.join('=');
                }).join('&');
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

            $scope.changedateRange = function (item, model) {

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


            $scope.campaignList.list = [
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

            $scope.campaignSum = {};
            $scope.makeSumCampaign = function () {
                function sumKey(key) {
                    var arr = $scope.campaignList.list;
                    var sum = 0;
                    for (var i = 0; i < arr.length; i++) {
                        sum += arr[i][key];
                    }
                    return sum;
                }

                $scope.campaignSum.imp = sumKey("imp");
                $scope.campaignSum.clicks = sumKey("clicks");
                $scope.campaignSum.spend = sumKey("spend");
                $scope.campaignSum.cpc = $scope.campaignSum.spend / $scope.campaignSum.clicks;
                $scope.campaignSum.cpm = $scope.campaignSum.spend / $scope.campaignSum.imp * 1000;
                $scope.campaignSum.ctr = $scope.campaignSum.clicks / $scope.campaignSum.imp;

            };


            $scope.campaignList.getList = function () {

                $scope.campaignList.loading = true;


                $http.get(apiBaseUrl + "insight/campaigns?" + $scope.campaignList.formQuery())
                    .success(function (response, status, headers, config) {
                        console.log(response, status, headers, config);
                        if (response.status === 200) {
                            $scope.campaignList.bigTotalItems = response.data.count;
                            $scope.campaignList.totalPages = Math.ceil($scope.campaignList.bigTotalItems / $scope.campaignList.pageSize);
                            $scope.campaignList.list = response.data.list;
                            $scope.makeSumCampaign();

                        } else {
                            topAlert.addAlert("Error", msg.NO_DATA);
                        }
                        $scope.campaignList.loading = false;
                    })
                    .error(function (data, status, headers, config) {
                        // 404, 500...
                        $scope.campaignList.list = {name: "-"};
                        $scope.campaignList.loading = false;
                        topAlert.addAlert("Error", msg.NO_DATA);
                    });


            };


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


            $scope.dailyImp = {};
            $scope.dailyImp.getData = function () {

                $scope.dailyImp.loading = true;
                var product_name = "Fusion360";
                var host = $location.host();
                if (host === "ads.uat.everstring.com" || host === "ads.everstring.com" || host==="192.168.99.100") {
                    product_name = "VCloud Air";
                }
                $http.get(apiBaseUrl + "insight/overall?product_name=" + product_name + "&start_date="
                    + $scope.campaignList.filter.startTime + '&end_date='
                    + $scope.campaignList.filter.endTime)
                    .success(function (response, status, headers, config) {
                        console.log(response, status, headers, config);
                        if (response.status === 200) {
                            $scope.dailyImp.data = response.data;
                            $scope.dailyImp.imps = _.map($scope.dailyImp.data, function (v) {
                                return {y: v.impression, x: v.date * 1000};
                            });

                            $scope.dailyImp.clicks = _.map($scope.dailyImp.data, function (v) {
                                return {y: v.click, x: v.date * 1000};
                            });
                            impressionChart($scope.dailyImp.imps, $scope.dailyImp.clicks);

                        } else {
                            topAlert.addAlert("Error", msg.NO_DATA);
                        }
                        $scope.dailyImp.loading = false;
                    })
                    .error(function (data, status, headers, config) {
                        // 404, 500...
                        $scope.dailyImp.list = {name: "-"};
                        $scope.dailyImp.loading = false;
                        topAlert.addAlert("Error", msg.NO_DATA);
                    });
            };


            function impressionChart(imps, clicks) {
                console.log(imps,clicks);
                var config = {
                    chart: {
                        marginTop: 35,
                        marginRight: 100

                    },
                    title: {
                        text: '',
                        style: {
                            display: 'none'
                        }
                    },
                    xAxis: [{
                        type: 'datetime',
                        gridLineWidth: 1,
                        title: {
                            text: 'DAYS',
                            style: {
                                color: '#2e6d92',
                                'font-weight': 'bold'
                            }
                        }
                    }],
                    yAxis: [{ // Primary yAxis

                        title: {
                            text: 'IMPRESSIONS',
                            style: {
                                'font-weight': 'bold',
                                color: '#bbd1e6'
                            }
                        },
                        gridLineWidth: 1
                    }, {

                        title: {
                            text: 'CLICKS',
                            style: {
                                color: '#2e6d92',
                                'font-weight': 'bold'
                            }
                        },
                        opposite: true
                    }],
                    tooltip: {
                        shared: true
                    },
                    legend: {
                        enabled: false
                    },
                    series: [{
                        name: 'impressions',
                        color: '#bbd1e6',
                        lineWidth: 5,
                        marker: {
                            symbol: 'circle',
                            lineColor: '#bbd1e6',
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
                        },
                        data: imps
                        //[7.0, 6.9, 9.5, 14.5, 18.2, 21.5, 25.2, 26.5, 23.3, 18.3, 13.9, 9.6]
                    }, {
                        name: 'clicks',
                        yAxis: 1,
                        color: '#2e6d92',
                        lineWidth: 5,
                        marker: {
                            symbol: 'circle',
                            lineColor: '#2e6d92',
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
                        },
                        data: clicks
                        //[300, 500, 800, 900, 400, 300, 550, 680, 720, 450, 400, 350]
                    }]
                };

                $timeout(function () {
                    $('#chart-panel').highcharts(config);
                }, 100)
            };


            //init
            $scope.refreshAll = function () {
                this.campaignList.getList();

                $scope.dailyImp.getData();
            };
            $scope.refreshAll();

        });
}());