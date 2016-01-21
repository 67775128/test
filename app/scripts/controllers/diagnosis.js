(function () {
    'use strict';

    angular.module('app')
        .controller('Diagnosis',
        function ($scope, $timeout, $filter, $http,
                  $alert, $location, topAlert, $aside,
                  $log, apiBaseUrl, $state) {

            var product_id = 1;

            var populateInitData = function () {
                var data = [
                    ["", "ADS", "Email", "Calls", "Net New"],
                    ["Spent", 10, 11, 12, 13],
                    ["MQL", 20, 11, 14, 13],
                    ["SAO", 30, 15, 12, 13],
                    ["Closed", 30, 15, 12, 13],
                    ["ACV", 30, 15, 12, 13]
                ];

                return data;
            };

            var getData = function () {
                var url = apiBaseUrl + 'products/' + product_id + '/diagnosis';
                $http.get(url)
                    .success(function (data) {
                        // populate init data and reload if there is none.
                        if (data.metrics === '') {
                            var tableData = populateInitData();
                            $scope.saveTable(tableData).then(function () {
                                getData();
                            });

                            return;
                        }

                        $scope.data = JSON.parse(data.metrics);
                        $scope.data = _.filter($scope.data, function (row) {
                            return !(_.isEmpty(row[1]) && _.isEmpty(row[0]));
                        });
                        $scope.lastData = _.last($scope.data);
                        $scope.midData = _.slice($scope.data, 3, $scope.data.length - 1);

                        var container = document.getElementById('editTable');
                        var hot = new Handsontable(container, {
                            data: $scope.data,
                            minSpareRows: 1,
                            rowHeaders: true,
                            colHeaders: true,
                            contextMenu: true,
                            colWidths: [80, 80, 80, 80, 80, 80, 80],
                            manualColumnResize: true,
                            manualRowResize: true,
                            removeRowPlugin: true
                        });
                    })
                    .error(function (data) {
                        $log.debug(data);
                    });
            };

            getData();

            $scope.roi = 2000;

            $scope.sumRow = function (row) {
                return _.sum(_.slice(row, 1));
            };


            $scope.showEdit = function () {
                var myOtherAside = $aside({
                    scope: $scope,
                    template: 'views/ui/diagnosis.edit.html'
                });
                // Show when some event occurs (use $promise property to ensure the template has been loaded)
                myOtherAside.$promise.then(function () {
                    myOtherAside.show();
                });
            };


            $scope.saveTable = function (tableData) {
                var url = apiBaseUrl + 'products/' + product_id + '/diagnosis';
                return $http.put(url, tableData)
                    .success(function (data) {
                        $log.debug(data);
                    })
                    .error(function (error) {
                        $log.debug(error);
                    });
            };


        });
}());