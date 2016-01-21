(function () {
        'use strict';

        angular.module('app')
            .controller('AudienceCtrl', function ($scope, $http, $alert, $modal, topAlert, $aside, $filter, apiLeadGen,
                                                  userInfo, $q, $timeout, style, msg, $log) {
                $scope.typeCode = {
                    "industry": 1,
                    "subIndustry": 2,
                    "country": 3,
                    "state": 4,
                    "title": 5,
                    "function": 6,
                    "level": 7,
                    "revenue": 8,
                    "employeeSize": 9,
                    "overAllScore": 12,
                    "fitScore": 10,
                    "engagementScore": 11
                };

                $scope.allMeta = [];
                $scope.allCompanyCount = 0;

                $scope.filteredCompanyCount = "";
                $scope.filteredContactCount = "";

                $scope.activeTab = "company";
                $scope.loadingSelected = true;

                $scope.dataChanged = false;

                $scope.dropdownAudience = [
                    {text: 'Delete Audience', click: 'audienceList.delete()'}
                ];

                $scope.dropdownExport = [
                    {text: 'Export CSV', click: 'exportLeads.showExportCSV()'}
                    //{text: 'Export to Salesforce', click: 'exportSF()'}
                ];

                $scope.audience = {
                    company: {},
                    companyCount: 0,
                    contact: {},
                    contactCount: 0,

                    frequency: 0,
                    id: null,
                    name: "",
                    rangeLimitCriterias: [],
                    termLimitCriteria: null,
                    totalContact: 0,
                    userId: "",
                    canEdit: false
                };

                $scope.audience.demandGen = {
                    scoreCountAll: [],
                    scoreCountFilter: [],
                    chart: {},
                    convertToChartData: function (subinfo, colorfull) {
                        var re = [];
                        if (subinfo) {
                            if (subinfo.length > 0) {
                                re = _.sortBy(subinfo, function (data, index) {
                                    return data.id;
                                });
                                _.each(re, function (v) {
                                    v.y = v.num;
                                    if (colorfull) {
                                        v.color = style.abcdColors[(Math.round((18 - v.id + 30000000) / 5))];
                                    }
                                });

                            }
                        }
                        return re;
                    },
                    renderScoreChart: function () {

                        var that = this;
                        var urlGlo = apiLeadGen + 'lg/statistic/getGlobalGroupData?typeCode=';
                        var urlSegCount = apiLeadGen + 'lg/statistic/getRealTimeSegmentGroupData?' + 'typeCode=';
                        var urlCalls = [$http({
                            url: urlGlo + $scope.typeCode['fitScore'] + '&exportObjType=Company',
                            method: 'GET'
                        }), $http({
                            url: apiLeadGen + 'lg/statistic/getSegmentGroupData?segmentId=' + $scope.audienceList.selected.id +
                            '&typeCode=' + $scope.typeCode['fitScore'] + '&exportObjType=Company',
                            method: 'GET'
                        }), $http({
                            url: apiLeadGen + 'lg/getSegment?userId=' + userInfo.userId,
                            method: 'GET'
                        }), $http({
                            url: urlSegCount + $scope.typeCode['industry'] + '&exportObjType=Company',
                            method: 'POST',
                            data: makeRealTimeFilterData($scope.audienceList.selected, 'company', 'industry')
                        }), $http({
                            url: urlSegCount + $scope.typeCode['state'] + '&exportObjType=Company',
                            method: 'POST',
                            data: makeRealTimeFilterData($scope.audienceList.selected, 'company', 'state')
                        }), $http({
                            url: urlSegCount + $scope.typeCode['level'] + '&exportObjType=Contact', //7
                            method: 'POST',
                            data: makeRealTimeFilterData($scope.audienceList.selected, 'contact', 'level')
                        }), $http({
                            url: urlSegCount + $scope.typeCode['function'] + '&exportObjType=Contact', //6
                            method: 'POST',
                            data: makeRealTimeFilterData($scope.audienceList.selected, 'contact', 'function')
                        }), $http({
                            url: apiLeadGen + 'lg/statistic/getSegmentGroupData?segmentId=' + $scope.audienceList.selected.id
                            + '&typeCode=' + $scope.typeCode['level']
                            + '&exportObjType=Contact',
                            method: 'GET'
                        }), $http({
                            url: apiLeadGen + 'lg/statistic/getSegmentGroupData?segmentId=' + $scope.audienceList.selected.id
                            + '&typeCode=' + $scope.typeCode['function'] + '&exportObjType=Contact',
                            method: 'GET'
                        })];

                        $scope.loadingSelected = true;
                        $q.all(urlCalls)
                            .then(function (results) {
                                console.log(results);
                                $scope.loadingSelected = false;
                                if (results[0].data.data) {
                                    that.scoreCountAll = results[0].data.data.subInfo;
                                }
                                if (results[1].data.data) {
                                    that.scoreCountFilter = results[1].data.data.subInfo;
                                }
                                if (results[3].data.data) {
                                    that.industryFilter = results[3].data.data.subInfo;
                                }
                                if (results[4].data.data) {
                                    that.stateFilter = results[4].data.data.subInfo;
                                }
                                if (results[5].data.data) {
                                    that.levelFilter = results[5].data.data.subInfo;
                                }
                                if (results[6].data.data) {
                                    that.functionFilter = results[6].data.data.subInfo;
                                }
                                if (results[7].data.data) {
                                    that.allLevel = results[7].data.data.subInfo;
                                }
                                if (results[8].data.data) {
                                    that.allFunction = results[8].data.data.subInfo;
                                }

                                $scope.allMeta = results[2].data.data;
                                mergeData($scope.audienceList.selected, $scope.allMeta);
                                $scope.audienceList.selected.company.industry.allData = _.compact(that.industryFilter);
                                $scope.audienceList.selected.company.state.allData = _.compact(that.stateFilter);
                                // $scope.audienceList.selected.contact.title.allData = _.compact(that.allTitle);
                                $scope.audienceList.selected.contact.level.allData = _.compact(that.allLevel);
                                $scope.audienceList.selected.contact.function.allData = _.compact(that.allFunction);

                                that.chart = scoreBar("chart-demand-gen", that.convertToChartData(that.scoreCountAll), that.convertToChartData(that.scoreCountFilter, true));

                                that.scoreThreshold = $scope.audienceList.selected.company.scoreThreshold;

                                that.factor = that.scoreThreshold / 5;

                                $scope.audienceList.getAllCompanyCount();
                                refreshUI();

                            }, function (errors) {
                                console.log(errors);
                                $scope.loadingSelected = false;
                            }, function (updates) {
                                console.log(updates);
                                $scope.loadingSelected = false;
                            });
                    },

                    scoreThreshold: null,
                    factor: 10,
                    sliderOptions: {
                        from: 0,
                        to: 20,
                        step: 1,
                        smooth: false,
                        realtime: true,
                        dimension: "",
                        modelLabels: {
                            0: '0',
                            1: '5',
                            2: '10',
                            3: '15',
                            4: '20',
                            5: '25',
                            6: '30',
                            7: '35',
                            8: '40',
                            9: '45',
                            10: '50',
                            11: '55',
                            12: '60',
                            13: '65',
                            14: '70',
                            15: '75',
                            16: '80',
                            17: '85',
                            18: '90',
                            19: '95',
                            20: '100'
                        },
                        scale: ['0', '100'],
                        css: {
                            background: {"background-color": "#055ec3"},
                            before: {"background-color": "silver"},
                            default: {"background-color": "transparent"},
                            after: {"background-color": "silver"},
                            pointer: {"background-color": "#fff"}

                        },
                        className: "es-slider es-slider-show-value",
                        callback: function (value, released) {
                            if (released) {
                                $scope.audienceList.selected.company.scoreThreshold = value * 5;
                                $scope.audienceList.saveAudience(true);
                            }
                        }
                    }
                };


                $scope.audience.company.industry = {

                    getData: function () {
                        $scope.industries = _.cloneDeep($scope.audienceList.selected.company.industry.allData);
                        this.data = $scope.industries;
                        var count = 0;
                        _.each($scope.industries, function (v) {
                            if (v) {
                                count += v.num;
                                v.subItems = _.find($scope.allMeta.company.industry.allData, function (value) {
                                    return value.data.id == v.id;
                                }).subItems;

                                var checkedSubItems;
                                _.each($scope.audienceList.selected.company.industry.checkedData, function (value) {
                                    if (value) {
                                        if (value.data.id === v.id) {
                                            v.checked = true;
                                            v.included = true;
                                            checkedSubItems = value.subItems;

                                        }
                                    }
                                });


                                _.each(v.subItems, function (item) {
                                    item.checked = !!(_.find(checkedSubItems, {id: item.id}));
                                });

                            }
                        });
                        console.info(count);

                        $scope.checkedIndustries = sortChecked(filterData($scope.industries, $scope.audienceList.selected.company.industry.checkedData));

                    },
                    includeKeyWord: '',
                    excludeKeyword: '',

                    toggle: function (name) {
                        var that = this;
                        this.data.filter(function (item, index) {
                            if (item.name == name && item.subItems) {
                                that.data[index].expanded = !item.expanded;
                            }
                        });

                    },
                    toggleInclude: function (name) {
                        var that = this;
                        this.data.filter(function (item, index) {
                            if (item.name == name) {
                                that.data[index].included = !item.included;
                            }
                        });
                        this.updateData();
                    },
                    excludeAll: function () {
                        var that = this;
                        this.data.map(function (item, index) {
                            that.data[index].included = false;
                        });

                        _.each($scope.industries, function (item, index) {
                            item.included = false;
                        });

                        this.updateData();
                    },
                    includeAll: function () {
                        var that = this;
                        this.data.map(function (item, index) {
                            that.data[index].included = true;
                        });

                        _.each($scope.industries, function (item, index) {
                            item.included = true;
                            item.all = true;
                            _.each(item.subItems, function (v, i) {
                                v.checked = true;
                            });
                        });

                        this.updateData();
                    },
                    clickSearchIcon: function (event) {
                        angular.element(event.target).siblings('input').focus()
                    },
                    toggleSubIndustry: function (name, key1) {
                        var subCheckedLength = _.where($scope.industries[key1].subItems, {checked: true}).length;
                        $scope.industries[key1].all = ($scope.industries[key1].subItems.length === subCheckedLength);
                        this.updateSubCheckedLen();
                    },
                    clearKey: function (type) {
                        if (type == 'includeKeyWord') {
                            this.includeKeyWord = '';
                        } else {
                            this.excludeKeyword = '';
                        }
                    },
                    dragging: '',
                    onDragStart: function (type) {
                        this.dragging = type;
                    },
                    onDropComplete: function (data, evt, type, obj) {
                        if (!data) {
                            return;
                        }
                        if ((type == 'included' && !data.included)
                            || (type == 'excluded' && data.included)) {
                            var scopeData = this.data;
                            var dataIndex = _.findIndex(scopeData, function (item) {
                                return item.name == data.name;
                            });

                            data.included = !data.included;
                            scopeData.splice(dataIndex, 1);
                            var insertIndex = obj ? _.findIndex(scopeData, function (item) {
                                return item.name == obj.name;
                            }) : scopeData.length - 1;
                            scopeData.splice(insertIndex, 0, data);
                        }
                        this.updateData();

                    },
                    updateData: function () {
                        //$scope.audienceList.selected.company.industry = {};
                        $scope.audienceList.selected.company.industry.checkedData = [];
                        _.each($scope.industries, function (v) {
                            if (v.included == true) {
                                var isSubAllIncluded = true;
                                var checkedSubItems = _.cloneDeep(_.filter(v.subItems, function (item) {
                                    return item.checked == true;
                                }));
                                _.each(v.subItems, function (item) {
                                    if (item.checked == false) {
                                        isSubAllIncluded = false;
                                    }
                                });
                                $scope.audienceList.selected.company.industry.checkedData.push({
                                    all: isSubAllIncluded,
                                    data: {id: v.id, display: v.name, key: v.name, type: 0, parentId: v.parentId},
                                    subItems: checkedSubItems
                                });
                            }
                        });
                        $scope.audienceList.selected.company.industry.all =
                            ($scope.industries.length === $scope.audienceList.selected.company.industry.checkedData.length);

                        $scope.audienceList.saveAudience();

                        //$scope.checkedIndustries = filterData($scope.industries, $scope.audienceList.selected.company.industry.checkedData);


                    },
                    updateSubCheckedLen: function () {
                        var that = this;
                        if (this.data.length > 0) {
                            this.data.forEach(function (item, key) {
                                that.data[key].subChecked = (item.subItems || []).filter(function (v) {
                                    return v.checked;
                                }).length;
                            });
                        }
                        return this;
                    }

                };


                $scope.audience.company.location = {
                    getData: function () {
                        $scope.locations = _.cloneDeep($scope.audienceList.selected.company.state.allData);
                        var count = 0;
                        _.each($scope.locations, function (v) {
                            if (v) {
                                count += v.num;
                                if (_.contains($scope.audienceList.selected.company.state.checkedData, v.id)) {
                                    v.checked = true;
                                }
                            }

                        });

                        $scope.checkedLocations = sortChecked(filterData($scope.locations, $scope.audienceList.selected.company.state.checkedData));

                        this.companyCount = count;
                        console.info(count);
                    },
                    activeCountry: 'USA',
                    keyword: '',
                    filter: function () {
                        var country = $scope.activeCountry || 'USA',
                            keyword = $scope.keyword.toLowerCase();
                        return $scope.data.filter(function (item) {
                            return item.name == country
                        })[0].areas.filter(function (item) {
                                return ~item.name.toLowerCase().indexOf(keyword)
                            });
                    },
                    clearKey: function () {
                        $scope.keyword = '';
                    },
                    changeCountry: function (country) {
                        $scope.activeCountry = country;
                        this.clearKey();
                    },
                    toggleArea: function (id) {
                        var that = this;

                        _.each($scope.locations, function (v) {
                            if (v.id == id) {
                                v.checked = !v.checked;
                            }
                        });

                        $scope.audienceList.selected.company.state.checkedData = [];
                        _.each($scope.locations, function (v) {
                            if (v.checked == true) {
                                $scope.audienceList.selected.company.state.checkedData.push(v.id);
                            }
                        });
                        $timeout(function () {
                            $scope.checkedLocations = filterData($scope.locations, $scope.audienceList.selected.company.state.checkedData);
                        });
                        $scope.audienceList.saveAudience();
                        this.updateAllField();
                    },
                    updateAllField: function () {
                        $scope.audienceList.selected.company.state.all =
                            ($scope.locations.length === $scope.checkedLocations.length);
                    }
                };


                $scope.audience.company.revenue = {
                    revenueNumIndex: {
                        '0': 0,
                        '1000000': 1,
                        '5000000': 2,
                        '10000000': 3,
                        '25000000': 4,
                        '50000000': 5,
                        '100000000': 6,
                        '250000000': 7,
                        '500000000': 8,
                        '1000000000': 9,
                        '5000000000': 10,
                        '-1': 11
                    },
                    getKey: function (value) {
                        var key;
                        var obj = this.revenueNumIndex;

                        _.each(_.keys(obj), function (k) {
                            var v = obj[k];
                            if (v === value) {
                                key = k;
                            }
                        });

                        return parseInt(key);
                    },
                    scoreCountAll: [],
                    scoreCountFilter: [],
                    chart: {},
                    renderScoreChart: function () {
                        var that = this;

                        $http({
                            url: apiLeadGen + 'lg/statistic/getRealTimeSegmentGroupData?typeCode=' + $scope.typeCode['revenue'] + '&exportObjType=Company',
                            //    //getGlobalGroupData
                            method: 'POST',
                            data: cleanData($scope.audienceList.selected)
                        }).success(function (response, status, headers, config) {
                            if (response.status !== 0) {

                            } else {
                                that.scoreCountAll = response.data.subInfo;
                                that.scoreCountAll = _.filter(that.scoreCountAll, function (v) {
                                    return v.name != 'Revenue - No Data';
                                });
                                that.chart = scoreBar("chart-revenue", $scope.audience.demandGen.convertToChartData(that.scoreCountAll), []);
                                that.startValue = $scope.audienceList.selected.company.revenue.startValue;
                                that.endValue = $scope.audienceList.selected.company.revenue.endValue;
                                that.factor = that.revenueNumIndex[that.startValue] + ";" + that.revenueNumIndex[that.endValue];
                            }


                        }).error(function (data, status, headers, config) {
                            // 404, 500...
                        });


                    },
                    startValue: 0,
                    endValue: -1,
                    factor: '1;5',
                    sliderOptions: {
                        from: 0,
                        to: 11,
                        step: 1,
                        smooth: false,
                        realtime: false,
                        threshold: 1,
                        dimension: '',
                        modelLabels: {
                            0: '0',
                            1: '$1M',
                            2: '$5M',
                            3: '$10M',
                            4: '$25M',
                            5: '$50M',
                            6: '$100M',
                            7: '$250M',
                            8: '$500M',
                            9: '$1B',
                            10: '$5B',
                            11: '$5B+'
                        },
                        scale: ['', ''],
                        css: {
                            background: {"background-color": "silver"},
                            before: {"background-color": "#055ec3"},
                            default: {"background-color": "transparent"},
                            after: {"background-color": "#055ec3"},
                            pointer: {"background-color": "#fff"}
                        },
                        className: "es-slider es-slider-show-value",
                        callback: function (value, released) {
                            if (released) {

                                $scope.audienceList.selected.company.revenue.startValue = $scope.audience.company.revenue.getKey(parseInt(value.split(";")[0]));
                                $scope.audienceList.selected.company.revenue.endValue = $scope.audience.company.revenue.getKey(parseInt(value.split(";")[1]));
                                $scope.audienceList.saveAudience(true);
                            }
                        }
                    }
                };

                $scope.audience.company.companySize = {
                    companySizeNumIndex: {
                        '1': 0,
                        '10': 1,
                        '50': 2,
                        '200': 3,
                        '500': 4,
                        '1000': 5,
                        '5000': 6,
                        '10000': 7,
                        '-1': 8
                    },
                    getKey: function (value) {
                        var key;
                        var obj = this.companySizeNumIndex;

                        _.each(_.keys(obj), function (k) {
                            var v = obj[k];
                            if (v === value) {
                                key = k;
                            }
                        });

                        return parseInt(key);
                    },
                    scoreCountAll: [],
                    scoreCountFilter: [],
                    chart: {},
                    startValue: 0,
                    endValue: 0,
                    renderScoreChart: function () {
                        var that = this;
                        $http({
                            url: apiLeadGen + 'lg/statistic/getRealTimeSegmentGroupData?typeCode=' + $scope.typeCode['employeeSize'] + '&exportObjType=Company',
                            method: 'POST',
                            data: cleanData($scope.audienceList.selected)
                        }).success(function (response, status, headers, config) {
                            if (response.status !== 0) {

                            } else {
                                that.scoreCountAll = response.data.subInfo;
                                that.chart = scoreBar("chart-company-size", $scope.audience.demandGen.convertToChartData(that.scoreCountAll), []);
                                that.startValue = $scope.audienceList.selected.company.companySize.startValue;
                                that.endValue = $scope.audienceList.selected.company.companySize.endValue;
                                that.factor = that.companySizeNumIndex[that.startValue] + ";" + that.companySizeNumIndex[that.endValue];
                            }


                        }).error(function (data, status, headers, config) {
                            // 404, 500...
                        });

                    },
                    factor: '6;8',
                    sliderOptions: {
                        from: 0,
                        to: 8,
                        step: 1,
                        smooth: false,
                        realtime: false,
                        threshold: 1,
                        dimension: "",
                        modelLabels: {
                            0: '1',
                            1: '10',
                            2: '50',
                            3: '200',
                            4: '500',
                            5: '1k',
                            6: '5k',
                            7: '10k',
                            8: '10k+'
                        },
                        scale: ['', ''],
                        css: {
                            background: {"background-color": "silver"},
                            before: {"background-color": "#055ec3"},
                            default: {"background-color": "transparent"},
                            after: {"background-color": "#055ec3"},
                            pointer: {"background-color": "#fff"}
                        },
                        className: "es-slider es-slider-show-value",
                        callback: function (value, released) {
                            if (released) {
                                $scope.audienceList.selected.company.companySize.startValue = $scope.audience.company.companySize.getKey(parseInt(value.split(";")[0]));
                                $scope.audienceList.selected.company.companySize.endValue = $scope.audience.company.companySize.getKey(parseInt(value.split(";")[1]));
                                $scope.audienceList.saveAudience(true);
                            }
                        }
                    }
                };

                $scope.audience.contact.title = {
                    type: 'included',
                    selectTypeText: 'Include',
                    nums: {},
                    types: [
                        {text: 'Include', click: 'audience.contact.title.setType(\'included\',\'Include\')'},
                        {text: 'Exclude', click: 'audience.contact.title.setType(\'excluded\',\'Exclude\')'}
                    ],
                    selectedTitle: '',
                    off: function () {
                        angular.element('.js-title-typeahead').off();
                    },
                    setType: function (type, text) {
                        var _this = $scope.audience.contact.title;
                        $scope.audience.contact.title.type = type;
                        $scope.audience.contact.title.selectTypeText = text;
                        console.log($scope.audience.contact.title.type)
                    },
                    getData: function () {

                        var _this = $scope.audience.contact.title;
                        _this.getTitlesNum();
                    },
                    addTitle: function () {
                        var title = $scope.audienceList.selected.contact.title;
                        var _this = $scope.audience.contact.title;
                        console.log(title);
                        if (_this.selectedTitle && _.indexOf(title[_this.type], _this.selectedTitle) < 0) {
                            title[_this.type].push(_this.selectedTitle);
                            $scope.audienceList.saveAudience();
                        }
                        _this.getTitlesNum();
                    },
                    deleteTitle: function (title, type) {
                        var titles = $scope.audienceList.selected.contact.title;
                        titles[type] = _.pull(titles[type], title);
                        $scope.audienceList.saveAudience();
                    },
                    getTitlesNum: function () {
                        var _this = $scope.audience.contact.title;
                        $http.get(apiLeadGen + 'lg/statistic/getIncludeOrExcludeGroupData?segmentId=' +
                            $scope.audienceList.selected.id + '&typeCode=' + $scope.typeCode['title']
                            + '&exportObjType=Contact', {cache: false})
                            .success(function (response) {
                                if (response.data) {
                                    response.data.subInfo.forEach(function (item) {
                                        _this.nums[item.name] = item.num;
                                    });
                                    console.log('_this.nums', response.data.subInfo)
                                    console.log('_this.nums', _this.nums)
                                }
                            });
                    },
                    getTitles: function (input) {
                        return $http.get(apiLeadGen + '/lg/statistic/queryTitle?title=' + input)
                            .then(function (response) {


                                var title = response.data.data.statistic.subInfo.map(function (item) {
                                    return item.name;
                                });
                                return title;

                            });
                    }
                };


                $scope.audience.contact.level = {
                    getData: function () {
                        $scope.seniorities = _.cloneDeep($scope.audienceList.selected.contact.level.allData);
                        var count = 0;
                        _.each($scope.seniorities, function (v) {
                            if (v) {
                                count += v.num;
                                if (_.contains($scope.audienceList.selected.contact.level.checkedData, v.id)) {
                                    v.checked = true;
                                }
                            }
                        });
                        $scope.checkedSeniorities = sortChecked(filterData($scope.seniorities, $scope.audienceList.selected.contact.level.checkedData));
                        console.info("contact:", count);
                    },
                    toggle: function (id) {
                        _.each($scope.seniorities, function (v) {
                            if (v.id == id) {
                                v.checked = !v.checked;
                            }
                        });

                        $scope.audienceList.selected.contact.level.checkedData = [];
                        _.each($scope.seniorities, function (v) {
                            if (v.checked == true) {
                                $scope.audienceList.selected.contact.level.checkedData.push(v.id);
                            }
                        });
                        $scope.checkedSeniorities = filterData($scope.seniorities, $scope.audienceList.selected.contact.level.checkedData);
                        this.updateAllField();
                        $scope.audienceList.saveAudience();

                    },
                    updateAllField: function () {
                        $scope.audienceList.selected.contact.level.all =
                            ($scope.seniorities.length === $scope.checkedSeniorities.length);
                    }
                };


                $scope.audience.contact.function = {

                    getData: function () {
                        var count = 0;
                        this.areas = $scope.audienceList.selected.contact.function;
                        $scope.jobFunctions = _.cloneDeep($scope.audienceList.selected.contact.function.allData);

                        _.each($scope.jobFunctions, function (v) {
                            if (v) {
                                count += v.num;
                                if (_.contains($scope.audienceList.selected.contact.function.checkedData, v.id)) {
                                    v.checked = true;
                                }
                            }
                        });

                        $scope.checkedJobFunctions = sortChecked(filterData($scope.jobFunctions, $scope.audienceList.selected.contact.function.checkedData));
                        console.info("function contact:", count);
                    },
                    keyword: '',
                    filter: function () {
                        var keyword = $scope.keyword.toLowerCase();
                        return $scope.areas.filter(function (item) {
                            return ~item.name.toLowerCase().indexOf(keyword)
                        });
                    },
                    clearKey: function () {
                        $scope.keyword = '';
                    },
                    toggleArea: function (id) {

                        _.each($scope.jobFunctions, function (v) {
                            if (v.id == id) {
                                v.checked = !v.checked;
                            }
                        });

                        $scope.audienceList.selected.contact.function.checkedData = [];
                        _.each($scope.jobFunctions, function (v) {
                            if (v.checked == true) {
                                $scope.audienceList.selected.contact.function.checkedData.push(v.id);
                            }
                        });
                        $timeout(function () {
                            $scope.checkedJobFunctions = filterData($scope.jobFunctions, $scope.audienceList.selected.contact.function.checkedData);

                        });
                        this.updateAllField();
                        $scope.audienceList.saveAudience();

                    },
                    updateAllField: function () {
                        $scope.audienceList.selected.contact.function.all =
                            ($scope.jobFunctions.length === $scope.checkedJobFunctions.length);
                    }
                };


                $scope.audienceList = ({
                    list: [
                        {name: "Audi 1", value: 100}
                    ],
                    selected: {name: "", value: -1},
                    initSelected: function () {
                        this.selected = this.list[0];
                        return this;
                    },
                    changeSelected: function (item) {
                        this.selected = this.getObjById(item.id);
                        this.initSelectedUI();
                    },
                    initSelectedUI: function () {

                        $scope.audience.demandGen.renderScoreChart();
                        $scope.audience.company.revenue.renderScoreChart();
                        $scope.audience.company.companySize.renderScoreChart();

                        this.getCompanyCount();
                        this.getContactCount();
                    },
                    defaultAudi: {},
                    initDefaultAudi: function (allData) {

                        this.defaultAudi = {
                            "id": null,
                            "name": "Audience " + this.list.length,
                            "userId": userInfo.userId,
                            "company": {
                                "industry": {
                                    "checkedData": [],
                                    "allData": [],
                                    "totalCount": 0,
                                    "all": true
                                },
                                "state": {
                                    "all": true,
                                    "checkedData": [],
                                    "checkedDataAndText": [],
                                    "allData": [],
                                    "totalCount": 0
                                },
                                "revenue": {"startValue": 0, "endValue": -1, "minValue": 0, "maxValue": 0},
                                "companySize": {"startValue": 1, "endValue": -1, "minValue": 0, "maxValue": 0},
                                "hasContact": false,
                                "scoreThreshold": 0
                            },
                            "contact": {
                                "title": {"included": [], "excluded": []},
                                "function": {
                                    "all": true,
                                    "checkedData": [],
                                    "checkedDataAndText": [],
                                    "allData": [],
                                    "totalCount": 0
                                },
                                "level": {
                                    "all": true,
                                    "checkedData": [],
                                    "checkedDataAndText": [],
                                    "allData": [],
                                    "totalCount": 0
                                }
                            },
                            "companyCount": 1000,
                            "totalContact": 0,
                            "contactCount": 10,
                            "frequency": 4,
                            "termLimitCriteria": null,
                            "rangeLimitCriterias": []


                        };
                        if (allData) {
                            this.defaultAudi.company.industry.checkedData = allData ? allData.company.industry.allData : [];
                            this.defaultAudi.company.state.checkedData = _.map((allData ? allData.company.state.allData : []), function (num, key) {
                                    return num.id;
                                }) || [];
                            this.defaultAudi.contact.function.checkedData = _.map(allData ? allData.contact.function.allData : [], function (num, key) {
                                    return num.id;
                                }) || [];
                            this.defaultAudi.contact.level.checkedData = _.map(allData ? allData.contact.level.allData : [], function (num, key) {
                                    return num.id;
                                }) || [];
                        }

                    },
                    delete: function () {
                        if (window.confirm("Are you sure you want to delete this audience?")) {
                            var id = this.selected.id;
                            $http({
                                url: apiLeadGen + 'lg/deleteUserSegment?userId=' + userInfo.userId + "&segmentId=" + id,
                                method: 'POST',
                                data: {}
                            }).success(function (response, status, headers, config) {
                                if (response.status !== 0) {
                                    topAlert.addAlert("error", "Error");

                                } else {
                                    $scope.audienceList.getList();
                                }


                            }).error(function (data, status, headers, config) {
                                // 404, 500...
                            });
                        }

                    },
                    getList: function () {
                        var that = this;
                        $http.get(apiLeadGen + '/lg/getSegments?userId=' + userInfo.userId)
                            .success(function (response, status, headers, config) {
                                console.log(response, status, headers, config);
                                $scope.audienceList.list = response.data;
                                $scope.audienceList.selected = $scope.audienceList.list[0];

                                if ($scope.audienceList.list.length <= 0) {
                                    $scope.audienceList.getAllMeta().then(function () {
                                        $scope.audienceList.initDefaultAudi($scope.allMeta);
                                        $scope.audienceList.addAudience();
                                    });


                                } else {
                                    that.initSelectedUI();
                                }

                            })
                            .error(function (data, status, headers, config) {
                                // 404, 500...
                            });

                    },
                    getAllMeta: function () {
                        return $http({
                            url: apiLeadGen + 'lg/getSegment?userId=' + userInfo.userId,
                            method: 'GET'
                        }).then(function (resp) {
                            $scope.allMeta = resp.data.data;
                        })
                    },
                    getObjById: function (id) {
                        var data = {};
                        for (var i = 0; i < this.list.length; i++) {
                            if (this.list[i].id === id) {
                                data = this.list[i];
                            }
                        }
                        return data;
                    },
                    saveAudience: function (needRefreshUI, NoNeedCount) {
                        var that = this;
                        var data1 = this.selected;

                        //delete  useless variable
                        var data = cleanData(data1);

                        console.log(data);

                        $http.post(apiLeadGen + 'lg/saveSegment', data, {
                            headers: {
                                'Accept': 'application/json, text/javascript, */*; q=0.01'
                            }
                        }).success(function (response) {
                            console.log(response);
                            if (response.status !== 0) {
                                topAlert.addAlert("error", "Error");

                            } else {
                                $scope.audience.canEdit = false;
                                $scope.dataChanged = true;
                                if (!NoNeedCount) {
                                    that.getCompanyCount();
                                    that.getContactCount();
                                }
                                if (needRefreshUI) {
                                    $scope.audienceList.initSelectedUI();
                                }
                            }
                        }).error(function (data, status, headers, config) {
                            topAlert.addAlert("error", "Error");
                        });

                    },
                    addAudience: function (needConfirm) {
                        if (needConfirm) {
                            if (confirm('Are you sure you would like to create a new audience?')) {
                                this.addAudienceExe();
                            }
                        } else {
                            this.addAudienceExe();
                        }

                    },
                    addAudienceExe: function () {
                        var that = this;
                        $http.get(apiLeadGen + 'lg/getSegment?userId=' + userInfo.userId)
                            .success(function (response) {
                                console.log(response);
                                if (response.status === 0) {
                                    $scope.allMeta = response.data;
                                    var target = $scope.audienceList.defaultAudi;
                                    var sr = $scope.allMeta;

                                    target.company.industry.checkedData = sr.company.industry.allData;
                                    target.company.state.checkedData = _.pluck(sr.company.state.allData, 'id');
                                    target.contact.function.allData = _.pluck(sr.contact.function.allData, 'id');
                                    target.contact.level.allData = _.pluck(sr.contact.level.allData, 'id');


                                    var data1 = that.defaultAudi;
                                    var data = cleanData(data1);

                                    $http.post(apiLeadGen + 'lg/saveSegment', data, {
                                        headers: {
                                            'Accept': 'application/json, text/javascript, */*; q=0.01'
                                        }
                                    }).success(function (response) {
                                        console.log(response);
                                        if (response.status !== 0) {
                                            topAlert.addAlert("error", "Error");

                                        } else {
                                            that.defaultAudi.id = response.data;
                                            that.list.push(that.defaultAudi);
                                            that.selected = that.list[that.list.length - 1];

                                            $scope.audience.canEdit = false;
                                            that.initSelectedUI();
                                        }
                                    }).error(function (data, status, headers, config) {
                                        topAlert.addAlert("error", "Error");
                                    });

                                }
                            });


                    },
                    getCompanyCount: function () {
                        var data1 = this.selected;
                        var data = cleanData(data1);
                        $http.post(apiLeadGen + 'lg/getCompanyCount', data).success(function (response) {
                            console.log(response);
                            if (response.status !== 0) {
                                topAlert.addAlert("error", "Error");

                            } else {
                                $scope.filteredCompanyCount = response.data;
                            }
                        }).error(function (data, status, headers, config) {
                            topAlert.addAlert("error", "Error");
                        });

                    },
                    getAllCompanyCount: function () {
                        var data1 = this.defaultAudi;
                        var data = cleanData(data1);
                        $http.post(apiLeadGen + 'lg/getCompanyCount', data).success(function (response) {
                            if (response.status !== 0) {
                                topAlert.addAlert("error", "Error");

                            } else {
                                $scope.allCompanyCount = response.data;
                            }
                        }).error(function (data, status, headers, config) {
                            topAlert.addAlert("error", "Error");
                        });

                    },
                    getContactCount: function () {
                        var data1 = this.selected;
                        var data = cleanData(data1);
                        $http.post(apiLeadGen + 'lg/getContactCount', data).success(function (response) {
                            console.log(response);
                            if (response.status !== 0) {
                                topAlert.addAlert("error", "Error");

                            } else {
                                $scope.filteredContactCount = response.data;
                            }
                        }).error(function (data, status, headers, config) {
                            topAlert.addAlert("error", "Error");
                        });

                    }
                }.initSelected());

                $scope.exportLeads = {
                    labelExported: false,
                    loadingExport: false,
                    list: [
                        {name: "2 Weeks", value: 2},
                        {name: "1 Month", value: 4},
                        {name: "3 Month", value: 12}
                    ],
                    selected: {name: "", value: -1},
                    initSelected: function () {
                        this.selected = this.list[0];
                        return this;
                    },
                    changeSelected: function (item) {
                        this.selected = _.find(this.list, {value: item.value});
                        $scope.audienceList.selected.frequency = item.value;
                        $scope.audienceList.saveAudience(false, true);
                    },
                    export: function () {
                        var that = this;
                        var data1 = $scope.audienceList.selected;
                        var data = cleanData(data1);
                        this.loadingExport = true;
                        $scope.exportFinished = false;
                        $http.post(apiLeadGen + 'lg/saveSegment', data)
                            .then(function (saved) {
                                return $http.get(apiLeadGen + 'lg/exportData?appendContact=false&userId='
                                    + userInfo.userId + '&segId=' + $scope.audienceList.selected.id + '&labelExported=' + that.labelExported);
                            }).then(function (response) {
                                console.log(response);
                                $scope.exportLeads.loadingExport = false;
                                if (response.status == 0 || response.status == 200) {
                                    $scope.exportFinished = true;
                                } else {
                                    topAlert.addAlert("error", "Error");
                                }
                            }, function (error) {
                                $scope.exportLeads.loadingExport = false;
                            });

                    },
                    exportModal: $modal({
                        scope: $scope,
                        templateUrl: 'views/demand_gen/modal.export.html',
                        placement: 'top',
                        show: false,
                        title: "Export",
                        container: '#audience-body'
                    }),
                    showExportCSV: function () {
                        $scope.exportFinished = false;
                        this.exportModal.$promise.then(this.exportModal.show);
                        $scope.audienceList.selected.companyCount = $scope.audienceList.selected.companyCount || 1000;
                        $scope.audienceList.selected.contactCount = $scope.audienceList.selected.contactCount < 0 ? 10 : $scope.audienceList.selected.contactCount;
                        return false;
                    },
                    changeHasNoContact: function () {
                        $scope.audienceList.selected.company.hasContact = !$scope.audienceList.selected.company.hasContact;
                        $scope.audienceList.selected.contactCount = 0;
                    }


                }.initSelected();

                $scope.switchToCompany = function () {
                    $scope.audience.company.revenue.renderScoreChart();
                    $scope.audience.company.companySize.renderScoreChart();
                    $('#chart-revenue').highcharts().reflow();
                    $('#chart-company-size').highcharts().reflow();

                };


                var promise = $http.get(apiLeadGen + 'getUserInfo');
                promise.then(
                    function (response) {
                        console.log(response);
                        userInfo.userId = response.data.data.id;
                        $scope.audienceList.getList();
                    });


                function refreshUI() {

                    $scope.audience.company.industry.getData();
                    $scope.audience.company.location.getData();

                    $scope.audience.contact.title.getData();
                    $scope.audience.contact.level.getData();
                    $scope.audience.contact.function.getData();
                }

                function sortChecked(arr) {
                    _.each(arr, function (v) {
                        v.iValue = v.num * ((v.liftRateMultiple != null && v.liftRateMultiple >= 0) ? v.liftRateMultiple : 0.001);
                    });
                    arr = _.sortBy(arr, function (n) {
                        return -n.iValue;
                    });
                    return arr;
                }

                function filterData(objArr, filterArr) {
                    var re = [];
                    _.each(objArr, function (v) {
                        if (v) {
                            if (_.contains(filterArr, v.id)) {
                                re.push(v);
                            } else {
                                _.each(filterArr, function (item) {
                                    if (item && item.data) {
                                        if (item.data.id === v.id) {
                                            re.push(v);
                                        }
                                    }

                                });
                            }
                        }

                    });
                    return re;
                }

                function mergeData(target, sr) {
                    target.company.industry.allData = sr.company.industry.allData;
                    target.company.state.allData = sr.company.state.allData;
                    target.contact.function.allData = sr.contact.function.allData;
                    target.contact.level.allData = sr.contact.level.allData;
                    $scope.audienceList.initDefaultAudi(sr);
                }

                function cleanData(target) {
                    if (target) {
                        var re = _.cloneDeep(target);
                        delete re.exportQuery;
                        delete re.company.industry.allData;
                        delete re.company.state.allData;
                        delete re.contact.function.allData;
                        delete re.contact.title.allData;
                        delete re.contact.level.allData;

                        _.each(re.company.industry.checkedData, function (item) {
                            _.each(item.subItems, function (subItem) {
                                delete subItem.checked;
                            });
                        });
                        return re;
                    } else {
                        return false;
                    }

                }

                function makeRealTimeFilterData(target, type, subType) {
                    var re = cleanData(target);
                    re[type][subType].checkedData = null;
                    re[type][subType].all = true;
                    return re;
                }

                function scoreBar(container, data1, data2) {
                    if (data2) {
                        _.forEach(data2, function (v, key) {
                            data1[key].y -= v.y;
                        });
                    }
                    var chartConfig = {
                        chart: {
                            type: "column",
                            // disabled chart animation to make sure AverageText position calculate right
                            animation: false,
                            spacingTop: 0,
                            spacingBottom: 0,
                            spacingLeft: 0,
                            spacingRight: 0,
                            marginRight: 0,
                            marginLeft: 0,
                            events: {
                                load: function () {

                                },
                                redraw: function () {

                                }
                            }
                        },
                        title: false,
                        xAxis: {
                            title: {
                                offset: 20,
                                style: {
                                    color: "#999",
                                    fontSize: "14px"
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
                                enabled: false,
                                offset: 42,
                                style: {
                                    color: "#999"
                                }
                            },
                            // hide gridLine
                            gridLineWidth: 0,
                            // show yAxis line
                            lineWidth: 0,
                            labels: {
                                enabled: false
                            }
                        },
                        tooltip: {

                            shadow: false,
                            borderColor: "#6E6E6E",
                            backgroundColor: "#6E6E6E",
                            style: {
                                color: "white",
                                padding: 5
                            }
                        },
                        series: [{
                            name: 'Companies',
                            color: '#ccc',
                            data: data1
                        }, {
                            name: 'Selected Companies',
                            data: data2
                        }],
                        // hide the series categories
                        legend: {
                            enabled: false
                        },
                        plotOptions: {
                            column: {
                                stacking: 'normal',
                                pointPadding: 0.1,
                                groupPadding: 0,
                                borderWidth: 0,
                                shadow: false,
                                animation: false,
                                dataLabels: {
                                    enabled: false
                                }
                            }
                        }
                    };

                    return $('#' + container).highcharts(chartConfig);

                };


                //end scoreBar function


                $scope.showAside = function (type) {

                    $scope.myAside = $aside({
                        scope: $scope,
                        template: 'views/demand_gen/audience.' + type + '.html',
                        container: '#audience-body'
                    });
                    if ($scope.audience.company[type]) {
                        $scope.audience.company[type].getData();
                    } else {
                        $scope.audience.contact[type].getData();
                    }

                };

                $scope.$on('aside.hide', function () {
                    console.log('aside.hide');
                    if ($scope.dataChanged) {
                        $scope.audience.demandGen.renderScoreChart();
                        $scope.audience.company.revenue.renderScoreChart();
                        $scope.audience.company.companySize.renderScoreChart();
                        $scope.dataChanged = false;
                    }
                    ;

                });

            })
    }()
);
