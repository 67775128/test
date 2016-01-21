(function () {
    'use strict';

    angular.module('app')
        .controller('AudienceIndustryCtrl', function ($scope, $timeout, $log, $http, apiBaseUrl, style, $filter) {
            $scope.data = [
                {
                    name: 'Legal',
                    total: 50,
                    multiple: '5.0',
                    included: true
                },
                {
                    name: 'Telecom',
                    total: 15,
                    multiple: '4.0',
                    included: true
                },
                {
                    name: 'Cultural',
                    total: 15,
                    multiple: '4.0',
                    included: true,
                    expanded: true,
                    subIndustries: [
                        {
                            name: 'Library',
                            checked: false
                        },
                        {
                            name: 'Museum',
                            checked: true
                        }
                    ]
                },
                {
                    name: 'Education',
                    total: 50,
                    multiple: '7.0',
                    included: false
                },
                {
                    name: 'Software',
                    total: 15,
                    multiple: '7.0',
                    included: false,
                    expanded: true,
                    subIndustries: [
                        {
                            name: 'Work Flow',
                            checked: true
                        },
                        {
                            name: 'Big Data Service',
                            checked: false
                        }
                    ]
                }
            ];
            $scope.includeKeyWord = '';
            $scope.excludeKeyword = '';
            $scope.filter = function(included){
                var keyword = (included ?
                    $scope.includeKeyWord:
                    $scope.excludeKeyword).toLowerCase();
                return $scope.data.filter(function(item){
                    return item.included == included &&
                        ~(item.name).toLowerCase().indexOf(keyword);
                })
            };
            $scope.toggle = function(name){
                $scope.data.filter(function(item,index){
                    if(item.name == name && item.subIndustries){
                        $scope.data[index].expanded = !item.expanded
                    }
                })
            }
            $scope.toggleInclude = function(name){
                $scope.data.filter(function(item,index){
                    if(item.name == name){
                        $scope.data[index].included = !item.included
                    }
                })
            }
            $scope.excludeAll = function(){
                $scope.data.map(function(item,index){
                    $scope.data[index].included = false;
                })
            }
            $scope.includeAll = function(){
                $scope.data.map(function(item,index){
                    $scope.data[index].included = true;
                })
            }
            $scope.clickSearchIcon = function(event){
                angular.element(event.target).siblings('input').focus()
            }
            $scope.toggleSubIndustry = function(name, key2){
                var key1 = _.findIndex($scope.data,function(item){
                    return item.name == name
                });
                $scope.data[key1].subIndustries[key2].checked = !$scope.data[key1].subIndustries[key2].checked;
                updateSubCheckedLen();
            }
            $scope.clearKey = function(type){
                if(type == 'includeKeyWord'){
                    $scope.includeKeyWord = '';
                }else{
                    $scope.excludeKeyword = '';
                }
            }
            $scope.dragging = '';
            $scope.onDragStart = function(type){
                $scope.dragging = type;
            }
            $scope.onDropComplete = function(data,evt,type,obj){
                if(!data){
                    return;
                }
                if((type == 'included' && !data.included)
                ||(type == 'excluded' && data.included)){
                    var scopeData = $scope.data;
                    var dataIndex = _.findIndex(scopeData,function(item){
                        return item.name == data.name
                    });
                    data.included = !data.included;
                    scopeData.splice(dataIndex,1);
                    var insertIndex = obj ? _.findIndex(scopeData,function(item){
                        return item.name == obj.name
                    }) : scopeData.length - 1;
                    scopeData.splice(insertIndex,0,data);
                }
            }
            updateSubCheckedLen();

            function updateSubCheckedLen(){
                $scope.data.forEach(function(item, key){
                    $scope.data[key].subChecked = (item.subIndustries || []).filter(function(v){
                        return v.checked
                    }).length;
                })
            }
        });
}());