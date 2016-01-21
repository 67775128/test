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


            $scope.dateRange = {};

            $scope.dateRange.list = [
                {name: 'All Time', value: 300000},
                {name: 'Last 30 days', value: 30},
                {name: 'Last 7 days', value: 7},
                {name: 'Yesterday', value: 1}
            ];
            $scope.dateRange.selected = $scope.dateRange.list[0];


            function impressionChart(imps, clicks) {
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



            $scope.changedateRange = function (item, model) {

                $scope.campaignList.filter.endTime = $filter('date.formEndTime')();
                $scope.campaignList.filter.startTime = $filter('date.formStartTime')(item.value);

                this.refreshAll();
            };


            /*start table list*/
            $scope.campaignList = {};
            $scope.campaignList.filter = {
                campId: -1,
                sortKey: "",
                sortDir: "desc",
                searchKey: "",
                startTime: $filter('date.formStartTime')($scope.dateRange.list[0].value),
                endTime: $filter('date.formEndTime')()
            };

            $scope.campaignList.sortKey = 'name';
            $scope.campaignList.tableHeader = [
                {name: 'Ad Name', dbkey: 'size', align: "text-left", reverse: null},
                {name: 'Status', dbkey: 'status', align: "text-left", reverse: null},
                {name: 'Size', dbkey: 'size', align: "text-center", reverse: null},
                {name: 'Impression', dbkey: 'imp', align: "text-right", reverse: null},
                {name: 'Clicks', dbkey: 'clicks', align: "text-right", reverse: null},

                {name: 'CTR', dbkey: 'ctr', align: "text-right", reverse: null},
                {name: 'CPM', dbkey: 'cpm', align: "text-right", reverse: null},
                {name: 'CPC', dbkey: 'cpc', align: "text-right", reverse: null},
                {name: 'CPA', dbkey: 'cpc', align: "text-right", reverse: null},
                {name: 'Conv', dbkey: 'conv', align: "text-right", reverse: null},
                {name: 'Spend', dbkey: 'spend', align: "text-right", reverse: null},
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

               /* $scope.campaignList.loading = true;


                $http.get(apiBaseUrl + "insight/campaigns?" + $scope.campaignList.formQuery())
                    .success(function (response, status, headers, config) {
                        console.log(response, status, headers, config);
                        if (response.status === 200) {
                            $scope.campaignList.bigTotalItems = response.data.count;
                            $scope.campaignList.totalPages = Math.ceil($scope.campaignList.bigTotalItems / $scope.campaignList.pageSize);


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
                */
                $scope.campaignList.compList =[];

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


            /*start table list*/
            $scope.convList={
                tableHeader:[
                    {name: 'Segment Name', dbkey: 'status', align: "text-left", reverse: null},
                    {name: 'View through Conv', dbkey: 'size', align: "text-center", reverse: null},
                    {name: 'Total Conv', dbkey: 'size', align: "text-center", reverse: null},
                    {name: 'Total Conv Rate', dbkey: 'imp', align: "text-center", reverse: null}
                ],
                compList:[
                    {"name": ""}
                ]
            };


            $scope.refreshAll = function () {
                this.campaignList.getList();
                impressionChart([{"y": 5002875, "x": 1430611200000}, {"y": 5062222, "x": 1430697600000}, {
                        "y": 4997444,
                        "x": 1430784000000
                    }, {"y": 4835603, "x": 1430870400000}, {"y": 4872179, "x": 1430956800000}, {
                        "y": 5060634,
                        "x": 1431043200000
                    }, {"y": 5097757, "x": 1431129600000}, {"y": 4989520, "x": 1431216000000}, {
                        "y": 4957775,
                        "x": 1431302400000
                    }, {"y": 5163353, "x": 1431388800000}, {"y": 5032715, "x": 1431475200000}, {
                        "y": 4968716,
                        "x": 1431561600000
                    }, {"y": 5025120, "x": 1431648000000}, {"y": 5022476, "x": 1431734400000}, {
                        "y": 5155926,
                        "x": 1431820800000
                    }, {"y": 4876352, "x": 1431907200000}, {"y": 4886266, "x": 1431993600000}, {
                        "y": 5036385,
                        "x": 1432080000000
                    }, {"y": 4941260, "x": 1432166400000}, {"y": 4931302, "x": 1432252800000}, {
                        "y": 5034826,
                        "x": 1432339200000
                    }, {"y": 4949590, "x": 1432425600000}, {"y": 5070892, "x": 1432512000000}, {
                        "y": 5061048,
                        "x": 1432598400000
                    }, {"y": 4957618, "x": 1432684800000}, {"y": 4993551, "x": 1432771200000}, {
                        "y": 5016378,
                        "x": 1432857600000
                    }, {"y": 5062977, "x": 1432944000000}, {"y": 5059779, "x": 1433030400000}, {
                        "y": 5120810,
                        "x": 1433116800000
                    }, {"y": 5060400, "x": 1433203200000}, {"y": 4851350, "x": 1433289600000}, {
                        "y": 4979253,
                        "x": 1433376000000
                    }, {"y": 4994712, "x": 1433462400000}, {"y": 4886122, "x": 1433548800000}, {
                        "y": 4988271,
                        "x": 1433635200000
                    }, {"y": 5054164, "x": 1433721600000}, {"y": 5019464, "x": 1433808000000}, {
                        "y": 5041571,
                        "x": 1433894400000
                    }, {"y": 5018092, "x": 1433980800000}], [{"y": 19827, "x": 1430611200000}, {
                        "y": 19867,
                        "x": 1430697600000
                    }, {"y": 19557, "x": 1430784000000}, {"y": 18792, "x": 1430870400000}, {
                        "y": 19249,
                        "x": 1430956800000
                    }, {"y": 19955, "x": 1431043200000}, {"y": 21358, "x": 1431129600000}, {
                        "y": 19732,
                        "x": 1431216000000
                    }, {"y": 19393, "x": 1431302400000}, {"y": 20874, "x": 1431388800000}, {
                        "y": 20607,
                        "x": 1431475200000
                    }, {"y": 20293, "x": 1431561600000}, {"y": 19580, "x": 1431648000000}, {
                        "y": 20020,
                        "x": 1431734400000
                    }, {"y": 20289, "x": 1431820800000}, {"y": 20462, "x": 1431907200000}, {
                        "y": 19365,
                        "x": 1431993600000
                    }, {"y": 20713, "x": 1432080000000}, {"y": 20214, "x": 1432166400000}, {
                        "y": 20084,
                        "x": 1432252800000
                    }, {"y": 19848, "x": 1432339200000}, {"y": 19578, "x": 1432425600000}, {
                        "y": 19961,
                        "x": 1432512000000
                    }, {"y": 20375, "x": 1432598400000}, {"y": 19171, "x": 1432684800000}, {
                        "y": 20365,
                        "x": 1432771200000
                    }, {"y": 21449, "x": 1432857600000}, {"y": 19688, "x": 1432944000000}, {
                        "y": 19943,
                        "x": 1433030400000
                    }, {"y": 21151, "x": 1433116800000}, {"y": 19499, "x": 1433203200000}, {
                        "y": 19808,
                        "x": 1433289600000
                    }, {"y": 20151, "x": 1433376000000}, {"y": 18859, "x": 1433462400000}, {
                        "y": 18708,
                        "x": 1433548800000
                    }, {"y": 20838, "x": 1433635200000}, {"y": 19883, "x": 1433721600000}, {
                        "y": 19476,
                        "x": 1433808000000
                    }, {"y": 20352, "x": 1433894400000}, {"y": 19954, "x": 1433980800000}]
                );
            };

            $scope.refreshAll();


        });


}());