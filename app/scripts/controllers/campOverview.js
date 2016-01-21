(function () {
    'use strict';

    angular.module('app')
        .controller('CampOverview',
        function ($scope, $timeout, $filter, $http,
                  $alert, $location, topAlert, $aside,
                  $log, apiBaseUrl, $state) {

            // only handles simple object like { key: simple_value }.
            // can not handle nested object like { key: object }.
            function serializeHttpParams(obj) {
                if (!_.isObject(obj)) {
                    throw new TypeError("argument must be an object.");
                }

                return _.map(_.pairs(obj), function (pair) {
                    return pair.join('=');
                }).join('&');
            };

            var revenueChart = function (categories, data) {
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
                        categories: categories
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
                        data: data
                    }]
                };
                $timeout(function () {
                    $('#chart-revenue').highcharts(config);
                }, 100);
            };

            var employeeChart = function (data) {
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
                        data: data
                    }]
                };
                $timeout(function () {
                    $('#chart-employee').highcharts(config);
                }, 100);
            };


            var fetchGroupedByGradeInsights = function () {
                $scope.groupedByGradeLoading = true;
                var url = apiBaseUrl + "insight/campaigns/" + $scope.cList.filter.campId + '/grouped_by_grade';
                $http.get(url, {
                    params: {
                        start_time: $scope.cList.filter.startTime,
                        end_time: $scope.cList.filter.endTime
                    }
                })
                    .success(function (data) {
                        $scope.groupedByGradeLoading = false;
                        $scope.grouped_by_grade_insights = data.data;
                    })
                    .error(function (error) {
                        $scope.groupedByGradeLoading = false;
                        console.log(error);
                    });
            };

            var renderFirmographicCategories = function () {
                _.each($scope.firmographicCategories, function (category) {
                    var url = apiBaseUrl + "insight/campaigns/" + $scope.cList.filter.campId + '/top_performancers';
                    $http.get(url, {
                        params: {
                            start_time: $scope.cList.filter.startTime,
                            end_time: $scope.cList.filter.endTime,
                            category: category
                        }
                    }).success(function (data) {
                        var data = data.data;
                        console.log(data);

                        if (category === "revenue") {
                            var categories = _.pluck(data, category);
                            var clicks = _.pluck(data, 'click_cnt');
                            categories = _.map(categories, function (item) {

                                return megaNumber(item);
                            });

                            revenueChart(categories, clicks);
                        } else if (category === "employee_size") {
                            var empClicks = _.map(data, function (item) {
                                var re = {};
                                re.name = item[category];
                                re.y = item['click_cnt'];
                                return re;
                            });
                            employeeChart(empClicks);
                        }
                        else if (category === "industry") {
                            $scope.topIndustry = _.map(data, function (item) {
                                var re = {};
                                re.name = item[category];
                                re.count = item['click_cnt'];
                                return re;
                            });
                        }
                        else if (category === "address_state") {
                            $scope.topLocation = _.map(data, function (item) {
                                var re = {};
                                re.name = item[category];
                                re.count = item['click_cnt'];
                                return re;
                            });
                        }


                    });
                });
            };



            $scope.camp = {};
            $scope.dateRange = {};

            $scope.showEngagement = 0;
            $scope.showConversion = 0;

            $scope.firmographicCategories = [
                'industry',
                'revenue',
                'employee_size',
                'address_state'
            ];

            $scope.categoryTitleMap = {
                'industry': 'Top Industries (All Time)',
                'revenue': 'Top Revenues (All Time)',
                'employee_size': 'Top Company Sizes (All Time)',
                'address_state': 'Top States (All Time)'
            };

            $scope.dateRange.list = [{
                name: 'All Time',
                value: 300000
            }, {
                name: 'Last 30 days',
                value: 30
            }, {
                name: 'Last 7 days',
                value: 7
            }, {
                name: 'Yesterday',
                value: 1
            }];
            $scope.dateRange.selected = $scope.dateRange.list[0];

            $scope.cList = {};
            $scope.cList.sortKey = 'name';
            $scope.cList.tableHeader = [{
                name: 'Account',
                dbkey: 'name',
                align: "text-left",
                reverse: null,
                show: 1
            }, {
                name: 'Reach',
                dbkey: 'reaches',
                align: "text-right",
                reverse: null,
                show: 1
            }, {
                name: 'Impression',
                dbkey: 'impressions',
                align: "text-right",
                reverse: null,
                show: 1
            }, {
                name: 'Clicks',
                dbkey: 'clicks',
                align: "text-right",
                reverse: null,
                show: 1
            }, {
                name: 'Engage',
                dbkey: 'engage',
                align: "text-center",
                reverse: null,
                show: 0
            }, {
                name: 'Conversion',
                dbkey: 'conversions',
                align: "text-right",
                reverse: null,
                show: 0
            }, {
                name: 'CTR',
                dbkey: 'ctr',
                align: "text-right",
                reverse: null,
                show: 1
            }, {
                name: 'CPM',
                dbkey: 'cpm',
                align: "text-right",
                reverse: null,
                show: 1
            }, {
                name: 'CPC',
                dbkey: 'cpc',
                align: "text-right",
                reverse: null,
                show: 1
            }, {
                name: 'Spend',
                dbkey: 'spend',
                align: "text-right",
                reverse: null,
                show: 1
            }


            ];
            $scope.cList.filter = {
                campId: -1,
                sortKey: "",
                sortDir: "desc",
                searchKey: "",
                startTime: $filter('date.formStartTime')($scope.dateRange.list[0].value),
                endTime: $filter('date.formEndTime')()
            };
            $scope.cList.filter.campId = $location.search().id || -1;
            if ($scope.cList.filter.campId >= 0) {
                $scope.camp.loading = false;
            }

            /*start campaign select */
            $scope.campList = [{
                name: 'loading...',
                id: ''
            }];

            $scope.getCamps = function () {


                $http.get(apiBaseUrl + "insight/campaigns", {
                    params: {
                        startTime: $scope.cList.filter.startTime,
                        endTime: $scope.cList.filter.endTime
                    }
                }) //go with api url
                    .success(function (response) {
                        if (response.status === 200) {
                            $scope.campList = response.data.list;
                            angular.forEach($scope.campList, function (v, i, o) {

                                if (v.id == $scope.cList.filter.campId) {
                                    $scope.camp.selected = v;
                                }
                            });

                        } else {
                            topAlert.addAlert("error", app.msg.NO_DATA);
                            $scope.campList = [{
                                name: 'Load Failed',
                                id: ''
                            }];
                        }
                        $scope.camp.loading = false;

                    })
                    .error(function (data, status, headers, config) {
                        $scope.campList = [{
                            name: 'Load Failed',
                            id: ''
                        }];
                        $scope.camp.loading = false;

                    });
            };


            $scope.changeCampTarget = function (item, model) {
                $state.go('ads.campaign.show', {
                    id: item.id
                });
                $scope.cList.filter.campId = item.id;
                $scope.refreshAll();
            };

            $scope.changeDateRange = function (item, model) {

                $scope.cList.filter.endTime = $filter('date.formEndTime')();
                $scope.cList.filter.startTime = $filter('date.formStartTime')(item.value);

                $scope.refreshAll();
            };


            /*start funnel*/
            $scope.funnel = {
                targetComp: "--",
                compFound: "--",
                compInterested: "--",
                compEngaged: "--",
                compSold: "--",
                peopleImp: "--",
                peopleClicks: "--",
                peopleEngaged: "--",
                peopleConv: "--"
            };


            $scope.getFunnel = function () {
                $scope.funnel.loading = true;
                $http.get(apiBaseUrl + "insight/funnel?" + $scope.cList.formQuery())
                    .success(function (response) {
                        if (response.status === 200) {
                            $scope.funnel = response.data;
                            $scope.showEngagement = parseInt(response.data.showEngagement);
                            $scope.showConversion = parseInt(response.data.showConversion);

                            $scope.cList.tableHeader[4].show = $scope.showEngagement;
                            $scope.cList.tableHeader[5].show = $scope.showConversion;
                        } else {
                            topAlert.addAlert("error", app.msg.NO_DATA);
                        }
                        $scope.funnel.loading = false;
                    })
                    .error(function (data, status, headers, config) {
                        $scope.funnel = {
                            targetComp: "Load Failed"
                        };
                    });
            };


            /*start topPerf*/
            $scope.topPerf = {};
            $scope.topPerf.list = [{
                name: '--',
                reach: "--",
                clicks: "--",
                engage: "--"
            }, {
                name: '--',
                reach: "--",
                clicks: "--",
                engage: "--"
            }, {
                name: '--',
                reach: "--",
                clicks: "--",
                engage: "--"
            }

            ];

            $scope.getTopPerf = function () {
                $scope.topPerf.loading = true;

                var params = _($scope.cList.filter)
                    .pick(["campId", "startTime", "endTime"])
                    .extend({
                        currentPage: 1,
                        pageSize: 3,
                        sortKey: 'clicks',
                        sortDir: 'desc'
                    })
                    .value();

                $http.get(apiBaseUrl + "insight/companies", {
                    params: params
                })
                    .success(function (response) {
                        if (response.status === 200) {
                            $scope.topPerf.list = response.data.list;
                        } else {
                            topAlert.addAlert("error", app.msg.NO_DATA);
                        }
                        $scope.topPerf.loading = false;
                    })
                    .error(function (data, status, headers, config) {
                        $scope.topPerf.list = [{
                            name: "Load Failed"
                        }];
                        $scope.topPerf.loading = false;
                    });
            };


            /*start spendTotals*/
            $scope.spendTotals = {
                spend: "--",
                remaining: "--",
                cpc: "--",
                cac: "--",
                convRate: "--"
            };
            $scope.getSpendTotals = function () {
                $scope.spendTotals.loading = true;
                $http.get(apiBaseUrl + "insight/spendTotals?" + $scope.cList.formQuery())
                    .success(function (response) {
                        if (response.status === 200) {
                            $scope.spendTotals = response.data;
                        } else {
                            topAlert.addAlert("error", app.msg.NO_DATA);
                        }
                        $scope.spendTotals.loading = false;
                    })
                    .error(function (data, status, headers, config) {
                        $scope.spendTotals = {
                            spend: "--"
                        };
                        $scope.spendTotals.loading = false;
                    });
            };


            /*start table list*/

            $scope.cList.compList = [{
                "name": ""
            }];
            $scope.cList.loading = false;


            $scope.cList.bigCurrentPage = 1;
            $scope.cList.maxSize = 8;
            $scope.cList.pageSize = 10;


            $scope.cList.orderBy = function (key, reverse) {

                $scope.cList.filter.sortKey = key;
                $scope.cList.filter.sortDir = reverse ? "asc" : "desc";
                $scope.cList.bigCurrentPage = 1;
                $scope.cList.getList();
            };


            $scope.cList.formQuery = function () {
                var data = {
                    currentPage: $scope.cList.bigCurrentPage,
                    pageSize: $scope.cList.pageSize

                };

                angular.extend(data, $scope.cList.filter);

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

            $scope.cList.csvUrl = function () {
                var params = {
                    campId: $state.params.id,
                    currentPage: 1,
                    pageSize: 99999,
                    startTime: $scope.cList.filter.startTime,
                    endTime: $scope.cList.filter.endTime,
                    sortKey: 'grade%20asc,clicks',
                    sortDir: 'desc',
                    format: 'csv'
                };

                return apiBaseUrl + "insight/companies?" + serializeHttpParams(params);
            };

            $scope.cList.startSearch = function (e) {

                if (e.keyCode === 13) { //|| !$.trim($scope.cList.filter.searchKey)
                    $scope.cList.bigCurrentPage = 1;
                    $scope.cList.getList();
                }

            };
            $scope.cList.clearKey = function (e) {
                $scope.cList.filter.searchKey = "";
                $scope.cList.bigCurrentPage = 1;
                $scope.cList.getList();

            };
            $scope.cList.gotoPage = function (e) {
                if ($scope.cList.bigCurrentPage > 0 && e.keyCode === 13) {
                    $scope.cList.getList();
                }
            };


            $scope.cList.pageChanged = function () {

                $scope.cList.getList();
            };


            $scope.cList.getList = function () {
                if ($scope.cList.filter.campId >= 0) {
                    $scope.cList.loading = true;

                    $http({
                        "url": (apiBaseUrl + "insight/companies?" + $scope.cList.formQuery()),
                        "method": "GET"
                    })
                        .success(function (response) {

                            if (response.status === 200) {
                                $scope.cList.bigTotalItems = response.data.count;
                                $scope.cList.totalPages = Math.ceil($scope.cList.bigTotalItems / $scope.cList.pageSize);
                                $scope.cList.compList = response.data.list;

                                $scope.cList.bigCurrentPage = response.data.currentPage;


                                $scope.cList.compList = _.map($scope.cList.compList, function (item) {

                                    item.options = {
                                        lineWidth: 5,
                                        trackColor: '#dedede',
                                        scaleColor: '#fff',
                                        size: 54,
                                        lineCap: 'butt',
                                        barColor: $filter('filterRingColor')(item.engage)
                                    };
                                    return item;
                                });

                            } else {
                                topAlert.addAlert("error", app.msg.NO_DATA);
                            }
                            $scope.cList.loading = false;
                        })
                        .error(function (data, status, headers, config) {
                            $scope.cList.compList = {
                                name: "-"
                            };
                            $scope.cList.loading = false;
                        });
                } else {
                    topAlert.addAlert("error", app.msg.NO_DATA);

                }

            };

            $scope.refreshAll = function () {

                this.getFunnel();
                this.getTopPerf();
                this.getSpendTotals();
                this.cList.getList();

                fetchGroupedByGradeInsights();

                renderFirmographicCategories();
            };
            $scope.refreshAll();
            $scope.getCamps();


            $scope.showCompanyDetails = function (company) {
                var scope = $scope.$new();
                scope.companyId = company.id;
                scope.campaignId = $state.params.id;

                $aside({
                    scope: scope,
                    template: 'views/aside.campaign.company.html'
                });
            };


            function megaNumber(number, fractionSize) {
                if (number === null || number === undefined) return "--";
                if (number === 0) return "0";
                var newNumber = parseInt(number);
                if (!(newNumber)) return number;

                if (!fractionSize || fractionSize < 0)
                    fractionSize = 1;

                var abs = Math.abs(number);
                var rounder = Math.pow(10, fractionSize);
                var isNegative = number < 0;
                var key = '';
                var powers = [
                    {key: "Q", value: Math.pow(10, 15)},
                    {key: "T", value: Math.pow(10, 12)},
                    {key: "B", value: Math.pow(10, 9)},
                    {key: "M", value: Math.pow(10, 6)},
                    {key: "K", value: 1000}
                ];

                for (var i = 0; i < powers.length; i++) {

                    var reduced = abs / powers[i].value;

                    reduced = Math.round(reduced * rounder) / rounder;

                    if (reduced >= 1) {
                        abs = reduced;
                        key = powers[i].key;
                        break;
                    }
                }

                return (isNegative ? '-' : '') + abs + key;
            };
        });
}());