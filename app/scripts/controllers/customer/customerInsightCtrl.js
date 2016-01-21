(function () {
    'use strict';

    angular.module('app')
        .controller('CustomerInsightCtrl', function ($scope, $timeout, $http, $alert, segmentsService, modelDataService, topAlert, $filter, apiLsWeb, msg, $location, $log) {
            $scope.warning = {
                icon: 'btr bt-exclamation-circle',
                text: 'Please contact Sales to enable or check in on the status of your Fit Model.',
                color: '#f9e574'
            };
            $scope.isReady = false;
            var selectedSegment = {};

            var modelId = null;

            var top10inds = {
                "industry": 10,
                "recent news": 11,
                "revenue": 12,
                "social": 13,
                "employee size": 14,
                "online marketing sophistication": 15,
                "location": 16,
                "technology adoption": 17,
                "company age": 18,
                "web presence": 19
            };

            $scope.top10Colors = ['#00496f', '#dbecc7', '#7fa4b7', '#0098cd', '#bfd1db', '#7fcbe6', '#6eb21f', '#bfe5f2', '#b6d88f', '#666666'];

            $scope.top10s = {
                list: [{}, {}, {}, {}, {}, {}, {}, {}, {}, {}],
                getTop10s: function () {
                    var that = this;
                    that.loading = true;
                    $http.get(apiLsWeb + "model/getCategoryTopIndicators?modelId=" + modelId)
                        .success(function (response, status, headers, config) {
                            console.log(response, status, headers, config);

                            var arr = response;
                            arr = arr.sort(function (a, b) {
                                return (top10inds[a._id.toLowerCase()] || 999) - (top10inds[b._id.toLowerCase()] || 99);
                            });

                            $scope.top10s.list = [];
                            _.each(arr, function (e) {
                                if (e._id && top10inds[e._id.toLowerCase()]) {
                                    $scope.top10s.list.push(e);
                                }
                            });

                            $scope.top10s.loading = false;
                        })
                        .error(function (data, status, headers, config) {
                            // 404, 500...
                            topAlert.addAlert("Error", msg.NO_DATA);
                            $scope.top10s.loading = false;
                        });
                }
            };


            $scope.dropdown = {
                list: [
                    {
                        "text": "Another action",
                        "href": "#anotherAction"
                    },
                    {
                        "text": "Display an alert",
                        "click": "$alert(\"Holy guacamole!\")"
                    },
                    {
                        "text": "External link",
                        "href": "/auth/facebook",
                        "target": "_self"
                    }
                ],
                getList: function () {

                }
            };
            $scope.allList = [];
            $scope.indiList = {
                sortKey: 'signalCategory',
                tableHeader: [
                    {name: 'Category', dbkey: 'signalCategory', align: "text-left", reverse: null},
                    {name: 'Characteristic', dbkey: 'displayValue', align: "text-left", reverse: null},
                    {name: 'Count', dbkey: 'total', align: "text-right", reverse: null},
                    {name: 'Conversion Rate', dbkey: 'payRate', align: "text-right", reverse: null},
                    {name: 'Lift Multiple', dbkey: 'liftRateMultiple', align: "text-right", reverse: null},
                    {name: 'Lift Multiple Within All', dbkey: 'liftRateMultiple', align: "text-right", reverse: null}
                ],
                pageInfo: {
                    bigTotalItems: 1,
                    totalPages: 1,
                    bigCurrentPage: 1,
                    maxSize: 8,
                    pageSize: 50,
                    data: []
                },
                list: [],
                filter: {},
                initFilter: function () {
                    this.filter = {
                        modelId: modelId || '564f94efe4b08adb3c2f040b',
                        cur_page: 1,
                        sortBy: "",
                        records_per_page: this.pageInfo.pageSize,
                        dir: "desc",
                        nonPaying: '',
                        "displayValue": "",
                        "payRate": "",
                        "liftRateAbsolute": "",
                        "liftRateMultiple": "",
                        "payRateWithoutGivenFeatures": "",
                        "total": "30@10000000",
                        "catList": []
                    }
                },
                getList: function () {

                    var that = this;
                    var str = "";

                    if (that.filter.cur_page > 0) {
                        _.each (that.filter, function (v, key) {
                            console.log(key, v);
                            if (key != "catList") {
                                str += "&" + key + "=" + v;
                            }
                        });

                        that.loading = true;
                        $scope.allListMerged = [];
                        $http({
                            method: 'POST',
                            url: apiLsWeb + "model/getPageSignalsAnalysisMultiple?" + str,
                            cache: false,
                            data: JSON.stringify(that.filter.catList),
                            contentType: "application/json; charset=utf-8"
                        }).
                        then(function (response) {
                            console.log(response);
                            var catNoInd = response.data.categorySummary.indicator_category;
                            var catInd = {};

                            that.pageInfo.bigTotalItems = response.data.count;
                            that.pageInfo.totalPages = Math.ceil(that.pageInfo.bigTotalItems / that.filter.records_per_page);
                            that.list = response.data.signalsAnalysisList;

                            var filterObj = that.filter;
                            var ls = that.list;
                            var overallIndList = $scope.overallIndList;

                            for (var i = 0; i < ls.length; i++) {
                                ls[i].liftWC = getLiftWCFromObj(ls[i], filterObj);

                                if (filterObj.catList.length > 0) {
                                    ls[i].signalCategory = filterObj.catList[0].subCategory == "" ?
                                        filterObj.catList[0].category : filterObj.catList[0].subCategory;
                                }
                            }

                            if (response.data.categorySummary) {
                                if ($scope.overallIndList) {
                                    if (catNoInd) {

                                        if (filterObj.catList.length > 0) {
                                            if (filterObj.catList[0].subCategory != "") {
                                                catNoInd = response.data.categorySummary.indicator_subcategory;
                                            }
                                            catNoInd.liftWC = getLiftWCFromObj(catNoInd);
                                            catNoInd.signalCategory = "Unknown " + (filterObj.catList[0].subCategory == "" ?
                                                    filterObj.catList[0].category : filterObj.catList[0].subCategory);

                                            //jQuery('#tr-summary2').html(html);
                                        }

                                        if (filterObj.catList.length > 0) {
                                            catInd.signalCategory = (filterObj.catList[0].subCategory == "") ? filterObj.catList[0].category : filterObj.catList[0].subCategory;
                                            catInd.total = overallIndList.total - catNoInd.total;
                                            catInd.payRate = (overallIndList.total * overallIndList.payRate - catNoInd.total * catNoInd.payRate) / catInd.total;
                                            catInd.liftRateMultiple = catInd.payRate / overallIndList.payRate;
                                            catInd.liftWC = 1;
                                            //jQuery('#tr-summary1').html(html);
                                        }
                                    }
                                }
                            }


                            $scope.allList = [];
                            overallIndList.isSumData = true;
                            $scope.allList.push([overallIndList]);
                            if (catInd && catInd.total >= 0) {
                                catInd.isSumData = true;
                                $scope.allList.push([catInd]);
                            }
                            $scope.allList.push(that.list);
                            if (catNoInd && catNoInd.total >= 0) {
                                catNoInd.isSumData = true;
                                $scope.allList.push([catNoInd]);
                            }
                            $scope.allListMerged = _.flatten($scope.allList, true);
                            console.log('alllit', $scope.allList);

                            that.loading = false;
                        }, function (response) {
                            that.list = {name: "-"};
                            that.loading = false;
                            topAlert.addAlert("Error", msg.NO_DATA);
                        });
                    }


                },
                orderBy: function (key, reverse) {

                    this.filter.sortBy = key;
                    this.filter.dir = reverse ? "asc" : "desc";
                    this.bigCurrentPage = 1;
                    this.getList();
                }
            };
            _.extend($scope.indiList.pageInfo, {
                gotoPage: function (e) {
                    $scope.indiList.filter.cur_page = $scope.indiList.pageInfo.bigCurrentPage;
                    $scope.indiList.getList();
                },
                pageChanged: function () {
                    $scope.indiList.filter.cur_page = $scope.indiList.pageInfo.bigCurrentPage;
                    $scope.indiList.getList();
                },
                getList: function () {
                    $scope.indiList.getList();
                }
            });
            $scope.$on('segmentChange', function (e, value) {
                selectedSegment = value.select;
                var fitModel = modelDataService.getSingleModel('fit', selectedSegment.models);
                if (!fitModel[0] || !fitModel[0].modelId) {
                    $scope.isReady = true;
                } else {
                    modelId = fitModel[0].modelId;
                }
                ;
                modelId = modelId || '564f94efe4b08adb3c2f040b';
                $scope.top10s.getTop10s();
                $scope.indiList.initFilter();
                initDropDownMenu();
                getOverallData();
            });


            function getOverallData() {
                $http({
                    method: 'get',
                    url: apiLsWeb + "model/getref?modelId=" + modelId,
                    cache: false
                }).
                then(function (response) {
                    console.log(response);
                    var ls = response.data;
                    if (ls) {
                        $scope.overallIndList = ls;
                        $scope.overallIndList.signalCategory = 'Overall';
                        $scope.overallIndList.liftWC = 1;
                        $scope.indiList.getList();
                    }

                }, function (response) {
                });
            }

            function getLiftWCFromObj(obj, filterObj) {
                var v;
                var liftWC = 0;
                if (filterObj) {
                    if (filterObj.catList.length > 0 && obj.liftMultipleWithinCategories) {
                        if (filterObj.catList[0].subCategory) {
                            v = obj.liftMultipleWithinCategories["indicator_subcategory"];
                        } else {
                            v = obj.liftMultipleWithinCategories["indicator_category"];
                        }

                    } else {
                        if (obj.liftMultipleWithinCategories) {
                            v = obj.liftMultipleWithinCategories["indicator_category"];
                        }
                    }
                    if (v) {
                        for (var j in v) {
                            liftWC = v[j];
                        }
                    }
                }


                return liftWC;
            }

            function initDropDownMenu() {
                $http({
                    method: 'get',
                    url: apiLsWeb + "model/getSignalCategorys2Level?modelId=" + modelId,
                    cache: false
                }).
                then(function (response) {

                    var dData = response.data;
                    console.log(response);
                    dData.unshift({
                        signalCategory: "All",
                        signalSubcategory: ""
                    });

                    $("#catDropDownList").html(formDropDownMenu(dData));
                    eventDropDownMenu();

                    for (var i = 0; i < dData.length; i++) {
                        if (dData[i].signalSubcategory) {
                            dData[i].label = dData[i].signalCategory + " - " + dData[i].signalSubcategory;
                            dData[i].value = dData[i].signalCategory + " - " + dData[i].signalSubcategory;
                        } else {
                            dData[i].label = dData[i].signalCategory;
                            dData[i].value = dData[i].signalCategory;
                        }

                    }

                }, function (response) {
                });

            }

            function eventDropDownMenu() {
                $('.dropdown').hover(function () {
                    $(this).children('.sub-menu').slideDown(100);
                }, function () {
                    $(this).children('.sub-menu').slideUp(200);
                });

                $('nav.filter li a').click(function () {
                    $scope.changeToCat($(this).data('cat'), $(this).data('subcat'));
                });
            }

            function formDropDownMenu(data) {
                var arr = convertCatToTree(data);
                var str = [];
                for (var i = 0; i < arr.length; i++) {
                    if (arr[i].children) {
                        var chil = arr[i].children;
                        var s = [];
                        for (var j = 0; j < chil.length; j++) {
                            s.push('<li><a href="javascript:;" data-cat="' + arr[i].name + '" data-subcat="' + chil[j].name + '">' + chil[j].name + '</li>');
                        }
                        str.push('<li class="dropdown"><a href="javascript:;" data-cat="' + arr[i].name + '">'
                            + arr[i].name + ' <span class="label-arrow"><span class="btr bt-angle-right"></span> </span></a><ul class="sub-menu">' + s.join(" ") + '</ul></li>');
                    } else {
                        str.push('<li><a href="javascript:;" data-cat="' + arr[i].name + '">' + arr[i].name + '</li>');
                    }
                }
                return str.join(" ");

            }

            function convertCatToTree(arr) {
                function searchStr(ar, str) {
                    for (var i = 0; i < ar.length; i++) {
                        if (ar[i].name == str) {
                            return ar[i];
                        }
                    }
                    return false;
                }

                function hasCat(ar, str) {
                    for (var i = 0; i < ar.length; i++) {
                        if (ar[i].name == str) {
                            return true;
                        }
                    }
                    return false;
                }

                var tr = [];
                for (var i = 0; i < arr.length; i++) {
                    if (hasCat(tr, arr[i].signalCategory)) {

                    } else {
                        tr.push({
                            name: arr[i].signalCategory,
                            children: []
                        });
                    }
                }

                for (var i = 0; i < arr.length; i++) {
                    var catArr = searchStr(tr, arr[i].signalCategory);

                    if (catArr) {

                        if (hasCat(catArr.children, arr[i].signalSubcategory)) {

                        } else {

                            if (arr[i].signalSubcategory) {

                                catArr.children.push({
                                    name: arr[i].signalSubcategory
                                });
                            }

                        }
                    }
                }

                for (var i = 0; i < tr.length; i++) {
                    if (tr[i].children) {
                        if (tr[i].children.length == 0) {
                            delete tr[i].children;
                        }
                        if (tr[i].children && tr[i].children.length == 1) {
                            if (tr[i].children[0].name == "" || tr[i].children[0].name == null) {
                                delete tr[i].children;
                            }
                        }
                    }
                }

                return tr;
            }

            /*
             * [{"category":"Funding Info","subCategory":null,"subsubCategory":null},
             * {"category":"Funding Info","subCategory":"Funding
             * Total","subsubCategory":null}, {"category":"Funding
             * Info","subCategory":"Funding Type","subsubCategory":null},
             * {"category":"Location","subCategory":null,"subsubCategory":null},
             * {"category":"Location","subCategory":"Country","subsubCategory":null},
             * {"category":"Location","subCategory":"State","subsubCategory":null}]
             */

            function checkLeads() {
                var filterObj = $scope.indiList.filter;
                filterObj.catList = [];
                var nodes = indTreeObj.getCheckedNodes();

                filterObj.category = "";
                filterObj.subCategory = "";
                filterObj.subsubCategory = "";
                for (var i = 0; i < nodes.length; i++) {

                    if (nodes[i].level == 0) {
                        filterObj.catList.push({
                            "category": nodes[i].name,
                            "subCategory": null
                        });
                        filterObj.category += (nodes[i].name) + ",";
                    } else if (nodes[i].level == 1) {
                        filterObj.catList.push({
                            "category": nodes[i].getParentNode().name,
                            "subCategory": nodes[i].name
                        });
                        filterObj.subCategory += (nodes[i].name) + ",";
                    }

                }

            }


            $scope.changeToCat = function (cat, subCat, retainInput) {
                cat = $.trim(cat);
                subCat = $.trim(subCat);
                var filterObj = $scope.indiList.filter;
                filterObj.catList = [];
                if (cat == "All") {
                    ClearAllFilters();
                } else {
                    filterObj.catList[0] = ( {
                        category: cat,
                        subCategory: subCat,
                        subsubCategory: ""
                    });

                }

                $("#rateDetailView").show();

                $("#currentCat").html(subCat || cat);
                $("#drop-lift-in-ind").html("Lift Multiple Within " + (subCat || cat));

                if (!retainInput) {
                    $("#inputIndAuto").val("");
                }

                $("#catDropDownList").hide();
                $("#catDropDownList ul").hide();

                $scope.indiList.getList();

            };

            $scope.changeToCatAndScroll = function (cat) {
                cat = $.trim(cat);
                $scope.changeToCat(cat, "");
                //$('body').scrollTo('#rateDetailView');
            };


            function clearIndicator(that) {
                $(that).parent().find("input").val("");
                //filterObj.displayValue = "";
                $(that).parent().parent().parent().parent().parent().find(".filter-key").html("");
                listLeads(queryType, 1, 1, sortKey, sortType, filter.records_per_page);
            }

            function ClearAllFilters() {
                $scope.indiList.initFilter();
                $("#currentCat").html("All");
                $("#drop-lift-in-ind").html("Lift Multiple Within All");

            }


        });
}());