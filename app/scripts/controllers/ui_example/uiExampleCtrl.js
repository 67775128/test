(function () {
    'use strict';

    angular.module('app')
        .controller('UiExampleCtrl', function ($scope) {
            /*start table list*/
            $scope.campaignList = {
                sortKey: 'name',
                tableHeader: [
                    {name: 'Campaign', dbkey: 'name', align: "text-left", reverse: null},
                    {name: 'Status', dbkey: 'status', align: "text-center", reverse: null},
                    {name: 'Impression', dbkey: 'imp', align: "text-right", reverse: null},
                    {name: 'Clicks', dbkey: 'clicks', align: "text-right", reverse: null},
                    {name: 'CTR', dbkey: 'ctr', align: "text-right", reverse: null},
                    {name: 'CPM', dbkey: 'cpm', align: "text-right", reverse: null},
                    {name: 'CPC', dbkey: 'cpc', align: "text-right", reverse: null},
                    {name: 'Spend', dbkey: 'spend', align: "text-right", reverse: null},
                    {name: 'Budget', dbkey: 'budget', align: "text-right", reverse: null}
                ],
                pageInfo: {
                    bigTotalItems: 12,
                    totalPages: 3,
                    bigCurrentPage: 1,
                    maxSize: 8,
                    pageSize: 3,
                    data: []
                },
                list: []
            };

            $scope.campaignList.list = {
                "curPage": 3, "pageSize": 3, "totalCount": 8, "data": [{
                    "id": 120,
                    "name": "test_name5",
                    "domain": "domain",
                    "type": "type",
                    "status": 1,
                    "country": "country",
                    "state": "state",
                    "city": "city",
                    "street": "street",
                    "description": "desdf",
                    "contactName": "name",
                    "contactEmail": "email",
                    "contactPhone": "phone",
                    "contactDesc": "desc",
                    "createdTs": 1447329600000
                }, {
                    "id": 121,
                    "name": "test_name6",
                    "domain": "domain",
                    "type": "type",
                    "status": 1,
                    "country": "country",
                    "state": "state",
                    "city": "city",
                    "street": "street",
                    "description": "desdf",
                    "contactName": "name",
                    "contactEmail": "email",
                    "contactPhone": "phone",
                    "contactDesc": "desc",
                    "createdTs": 1447329600000
                }]
            };

            $scope.dropdownAudience = [
                {text: 'Add an Audience', click: 'audienceList.addAudience(true)'},
                {text: 'Delete Audience', click: 'audienceList.delete()'}
            ];



        });
}());