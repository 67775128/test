(function () {
    'use strict';


    angular.module('app')
        .directive('modelDescription', ['$timeout','$modal','userInfoService', function ($timeout,$modal,userInfoService) {
            return {
                restrict: 'E',

                replace: true,
                scope: {
                    config: '='
                },
                template:'<p class="m-v-lg">'
                +'<span class="instruction" ng-bind-html="config.viewDescription"></span>'
                +'<span class="btr bt-question-circle text-lg m-h-sm" data-placement="bottom" data-type="button" data-title="{{config.viewTip}}" data-trigger="hover" bs-tooltip=""></span>'
                +'<span ng-show="config.isCanEdit" class="btr bt-edit text-lg" ng-click="config.edit()"></span>'
                +'</p>',
                link: function($scope, $element){
                    console.log('modelDescription',$scope)
                    $scope.config = angular.extend({
                        isCanEdit:false,
                        defaultDescription: '',
                        defaultTip: 'Conversion refers to the event where prospects became "positive", as specified during your Data Onboarding call.',
                        viewDescription:'',
                        viewTip:'',
                        description:'',
                        tip:'',
                        init:function(){
                            this.resetDescription();
                            this.resetTip();
                            this.setAll();
                            userInfoService.isSuperUserCheck().then(function(msg){
                                if(msg){
                                    this.isCanEdit = true;
                                }
                            }.bind(this))
                        },
                        setAll:function(des,tip){
                            des = des?this.regHandle(des):des;
                            tip = tip?this.regHandle(tip):tip;
                            this.viewDescription = des||this.description;
                            this.description = des||this.description;
                            this.viewTip = tip||this.tip;
                            this.tip = tip||this.tip;
                        },
                        regHandle:function(string){
                            string = string.replace(/\&quot\;/g,'"');
                            string = string.replace(/(\&lt\;)/g,'<');
                            string = string.replace(/(\&gt\;)/g,'>');
                            return string;
                        },
                        resetDescription:function(){
                            this.description = this.regHandle(this.defaultDescription);
                        },
                        resetTip:function(){
                            this.tip =  this.regHandle(this.defaultTip);

                        },
                        edit:function(){
                            this.modal = $modal({
                                scope: $scope,
                                templateUrl: 'views/model_result/modal.model.description.html',
                                placement: 'top',
                                show: false,
                                title: "Edit"
                            });
                            this.modal.$promise.then(this.modal.show);
                        },
                        getDescription:angular.noop,
                        saveDescription:angular.noop
                    }, $scope.config);
                    $scope.config.init();
                }
            };
        }]);

}());