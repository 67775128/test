(function () {
    'use strict';
    /**
     * @ngdoc function
     * @name app.directive:uiPagination
     * @description
     * # uiPagination
     * Directive of the app
     */
    angular.module('app')
        .directive('uiPagination', function ($compile) {
            return {
                restrict: 'AE',
                replace: true,
                scope: {
                    config: '='
                },
                link: function (scope, element) {
                    var html = '<pagination total-items="config.bigTotalItems" ng-model="config.bigCurrentPage" max-size="config.maxSize" num-pages="config.totalPages"'
                        + 'items-per-page="config.pageSize" ng-change="config.pageChanged()"'
                        + 'class="pagination-sm pull-left" boundary-links="true" rotate="true"'
                        + 'num-pages="config.numPages"></pagination>'
                        + '<div class="pull-left input-group m-v-md m-l">'
                        + '<div class="form-group">'
                        + '<div class="input-group pagination-sm">'
                        + '<div class="btn input-sm">Total Pages: {{config.totalPages}}</div>'
                        + '</div>'
                        + '</div>'
                        + '</div>'
                        + '<div class="pull-left input-group m-v-md" style="width: 84px;">'
                        + '<div class="form-group m-b-xs">'
                        + '<div class="input-group pagination-sm">'
                        + '<input ng-keyup="config.gotoPage($event)" class="form-control input-sm" type="text" placeholder="page" ng-model="config.bigCurrentPage">'
                        + '<div ng-click="config.getList()" class="input-group-addon input-sm btn">Go</div>'
                        + '</div>'
                        + '</div>'
                        + '</div>';
                    var e = $compile(html)(scope);
                    element.replaceWith(e);
                }
            };
        });

}());