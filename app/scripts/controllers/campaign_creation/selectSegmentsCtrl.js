(function() {
    'use strict';

    angular.module('app')
        .controller('selectSegmentsCtrl', function ($scope, $http, $log, Upload, apiBaseUrl, $modal) {
            $scope.state.name = 'segments';

            $scope.segmentList = {
                tableHeader: [
                    {name: 'Segment Name', dbkey: 'name', align: "text-left", reverse: null},
                    {name: 'Type', dbkey: 'type', align: "text-center", reverse: null},
                    {name: 'URL', dbkey: 'url', align: "text-center", reverse: null},
                    {name: 'Duration', dbkey: 'duration', align: "text-center", reverse: null},
                    {name: 'Predictive Addressable Market', dbkey: 'market', align: "text-right", reverse: null}
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

            $scope.segmentTypes = ["Account - High Engagement", "People - High Engagement", "People - Page Visited", "People - Event Clicked"];


            $scope.hideExistingSegment = function() {
                $scope.hideExistingSegmentFn();
            }
            $scope.showExistingSegment = function() {
                $scope.showExistingSegmentFn();
                $scope.segmentList.getList();
            };

             $scope.segmentList.orderBy = function (key, reverse) {

                $scope.segmentList.filter.sort_by = key;
                $scope.segmentList.filter.order = reverse ? "asc" : "desc";
                $scope.segmentList.bigCurrentPage = 1;
                $scope.segmentList.getList();
            };

            $scope.segmentList.formQuery = function () {
                var data = {
                    next_page: $scope.segmentList.bigCurrentPage,
                    page_size: $scope.segmentList.pageSize

                };

                angular.extend(data, $scope.segmentList.filter);

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

            $scope.segmentList.getList = function () {
                $scope.segmentList.loading = true;

                $http.get(apiBaseUrl + "insight/segment/site/845221?" + $scope.segmentList.formQuery())
                    .success(function (response, status, headers, config) {
                        if (response.status === 200) {
                            $scope.segmentList.bigTotalItems = response.data.total_count;
                            $scope.segmentList.bigCurrentPage = response.data.next_page - 1;
                            $scope.segmentList.totalPages = Math.ceil($scope.segmentList.bigTotalItems / $scope.segmentList.pageSize);
                            $scope.segmentList.metrics = response.data;
                            $scope.segmentList.metrics = _.map($scope.segmentList.metrics, function (item) {
                                item.type = $scope.segmentTypes[item.type];
                                return item;
                            });
                        }
                        $scope.segmentList.loading = false;
                    })
                    .error(function (data, status, headers, config) {
                        // 404, 500...
                        $scope.segmentList.metrics = {name: "-"};
                        $scope.segmentList.loading = false;
                        topAlert.addAlert("Error", msg.NO_DATA);
                    });
            };

            $scope.segmentList.hideTableEntryCond = function (entryIndex) {
                return $scope.segmentList.metrics[0].name == "" || entryIndex>=5;
            }

            $scope.segmentList.pageChanged = function () {
                $scope.segmentList.getList();
            };

            var newSegmentModal = $modal({
                scope: $scope,
                templateUrl: 'views/modals/modal.tpl.segment.html',
                placement: 'center',
                show: false,
                title: "Create Segment"
            });

            $scope.showSegmentCreationModal = function (index) {
                $scope.segCreationOptions = {
                    selected: undefined,
                    name: undefined,
                    duration: undefined,
                    conversion: false,
                    urlPattern: ""
                };
                if (index >= 0 && index < $scope.segmentTypes.length) {
                    $scope.segCreationOptions.selected = $scope.segmentTypes[index]
                    $scope.segCreationOptions.typeIndex = index;
                }

                $scope.showErrors = false;
                newSegmentModal.$promise.then(newSegmentModal.show);
                return false;
            };

            $scope.segmentTypes = ["Account - High Engagement", "People - High Engagement", "People - Page Visited", "People - Event Clicked"];
            $scope.segCreationOptions = {};
            $scope.showErrors = false

            $scope.inputInvalid = function () {
                $scope.showErrors = true;
            }

            $scope.saveSegment = function () {
                console.log($scope.segCreationOptions);
                $scope.showErrors = false;
                for (var key in $scope.segCreationOptions) {
                    if ($scope.segCreationOptions[key] === undefined) {
                        return false;
                    }
                }
                if ($scope.needsUrlPattern && $scope.segCreationOptions.urlPattern == "") {
                    return false;
                }
                $scope.segCreationOptions.selected = $scope.segmentTypes.indexOf($scope.segCreationOptions.selected);
                // TODO: fix hard coded idsite
                $scope.segCreationOptions.idsite = $scope.idsite;
                //save to backend
                $http.post(apiBaseUrl + "insight/segment", $scope.segCreationOptions)
                    .then(function successCallback(response) {
                        // updates UI table to show the created segment
                        $scope.segmentList.getList();
                    }, function errorCallback(response) {
                        console.log(response);
                    });
                return true;
            }

            $scope.selectedSegments = 0
            $scope.$watch('segmentList.metrics', function(items){
                var selectedSegments = 0;
                angular.forEach(items, function(item) {
                    selectedSegments += item.selected ? true : false;
                })
                $scope.selectedSegments = selectedSegments;
            }, true);

            $scope.selectAllItems = function () {
                for (var i=0; i < $scope.segmentList.metrics.length; i++){
                    $scope.segmentList.metrics[i].selected = true; 
                }
            }

            if ($scope.shouldShowExistingSegment) {
                $scope.segmentList.getList();
            }

        });

})();