(function () {
    'use strict';

    /**
     * @ngdoc function
     * @name app.controller:MainCtrl
     * @description
     * # MainCtrl
     * Controller of the app
     */
    angular.module('app')
        .controller('MainCtrl', ['$scope', '$translate', '$localStorage', '$window', '$timeout', '$modal', 'apiBaseUrl', '$http',
            function ($scope, $translate, $localStorage, $window, $timeout, $modal, apiBaseUrl, $http) {
                // add 'ie' classes to html
                var isIE = !!navigator.userAgent.match(/MSIE/i) || !!navigator.userAgent.match(/Trident.*rv:11\./);
                isIE && angular.element($window.document.body).addClass('ie');
                isSmartDevice($window) && angular.element($window.document.body).addClass('smart');
                changeThemeOfHighcharts();
                // config
                $scope.app = {
                    name: 'EverString',
                    version: '0.1',
                    loader: '<div class="loader">Loading...</div>',
                    // for chart colors
                    color: {
                        primary: '#055ec3',
                        info: '#2772ee',
                        success: '#4bb622',
                        warning: '#f88311',
                        danger: '#e11144',
                        inverse: '#a66bee',
                        light: '#f1f2f3',
                        dark: '#202a3a'
                    },
                    settings: {
                        headerColor: 'bg-primary',
                        headerFixed: true,
                        headerShadow: false,
                        asideColor: 'bg-white',
                        asideTop: false
                    }
                };


                $scope.setHeaderColor = function (color) {
                    $scope.app.settings.headerColor = color;
                };
                $scope.setAsideColor = function (color) {
                    $scope.app.settings.asideColor = color;
                };

                var timer;

                $scope.startAsideCloseTimer = function () {
                    timer = $timeout((function() {
                        $scope.app.settings.asideShrink = true;
                    }), 200);
                };

                $scope.cancelAsideCloseTimer = function () {
                    $timeout.cancel(timer);
                };
                // save settings to local storage
                if (angular.isDefined($localStorage.appSettings)) {
                    $scope.app.settings = $localStorage.appSettings;
                } else {
                    $localStorage.appSettings = $scope.app.settings;
                }
                $scope.$watch('app.settings', function () {
                    $localStorage.appSettings = $scope.app.settings;
                }, true);

                // angular translate
                $scope.langs = {en: 'English', zh_CN: '中文'};
                $scope.selectLang = $scope.langs[$translate.proposedLanguage()] || "English";
                $scope.setLang = function (langKey) {
                    // set the current lang
                    $scope.selectLang = $scope.langs[langKey];
                    // You can change the language during runtime
                    $translate.use(langKey);
                };

                function isSmartDevice($window) {
                    // Adapted from http://www.detectmobilebrowsers.com
                    var ua = $window['navigator']['userAgent'] || $window['navigator']['vendor'] || $window['opera'];
                    // Checks for iOs, Android, Blackberry, Opera Mini, and Windows mobile devices
                    return (/iPhone|iPod|iPad|Silk|Android|BlackBerry|Opera Mini|IEMobile/).test(ua);
                }

                function changeThemeOfHighcharts() {

                    if (window.Highcharts) {

                        Highcharts.theme = {
                            colors: ["#2D6C92", "#BBD1E6", "#BBD1E6", "#E1EBF4", "#032C47", "#f45b5b", "#8085e9", "#8d4654", "#7798BF", "#aaeeee", "#ff0066", "#eeaaee", "#55BF3B", "#DF5353", "#7798BF", "#aaeeee"],
                            chart: {
                                backgroundColor: "rgba(255,255,255,0)",
                                style: {
                                    fontFamily: "'Open Sans', Helvetica, Arial, sans-serif",
                                    fontSize: "14px"
                                }
                            },
                            title: {
                                align: "left",
                                verticalAlign: "top",
                                useHTML: true,
                                style: {
                                    "font-size": "14px",
                                    "color": "#000"
                                }
                            },
                            credits: {
                                enabled: false
                            },
                            labels: {
                                style: {
                                    fontSize: '14px'
                                }
                            },
                            plotOptions: {
                                pie: {
                                    dataLabels: {
                                        style: {
                                            fontSize: '14px',
                                            fontWeight: 'normal'

                                        }
                                    }
                                },
                                bar: {
                                    dataLabels: {
                                        style: {
                                            fontSize: '14px',
                                            fontWeight: 'normal'
                                        }
                                    }
                                }
                            },
                            yAxis: {

                                title: {
                                    style: {
                                        fontSize: '15px'
                                    }
                                },
                                labels: {
                                    style: {
                                        fontSize: '12px'
                                    }
                                },
                                gridLineWidth: 0,
                                tickLength: 0
                            },
                            xAxis: {

                                title: {
                                    style: {
                                        fontSize: '15px'
                                    }
                                },
                                labels: {
                                    style: {
                                        fontSize: '12px'
                                    }
                                },
                                tickLength: 0
                            },
                            legend: {
                                symbolHeight: 12,
                                symbolWidth: 12,
                                symbolRadius: 8,
                                padding: -4,
                                itemStyle: {
                                    'font-weight': 'normal',
                                    'font-size': '12px',
                                    'color': "#666666"
                                }
                            }
                        };

                        // Apply the theme of Highcharts
                        Highcharts.setOptions(Highcharts.theme);

                    }

                }

                $scope.singlePage = true;

                //need some way to detect if client pixel is active or not
                $scope.isPixelActive = function () {
                    return $scope.pixelActive;
                }

                $scope.pixelActive = false;

                var pixelModal = $modal({
                    scope: $scope,
                    templateUrl: 'views/modals/modal.pixel.html',
                    placement: 'top',
                    show: false,
                    title: "Everstring Pixel Integration"
                });

                $scope.showPixelModal = function () {
                    pixelModal.$promise.then(pixelModal.show);
                    return false;
                }

                $scope.createSite = function(site, ev) {
                    var button = angular.element(ev.currentTarget);
                    button.attr('disabled', true);
                    button.text('Loading...');

                    var enableRetry = function(button) {
                        button.text('Retry');
                        button.attr('disabled', false);
                    };

                    var createSiteUrl = apiBaseUrl + 'tracking/sites';

                    $http.post(createSiteUrl, site)
                        .success(function(data) {
                            var site_id = data.site_id;
                            var getTrackingCodeUrl = apiBaseUrl + 'tracking/sites/' + site_id + '/tracking_code';

                            $http.get(getTrackingCodeUrl)
                                .success(function(data) {
                                    $scope.snippet = data.value;
                                    button.hide();
                                })
                                .error(function(error) {
                                    topAlert.addAlert("Error", 'Get tracking code error! ' + error.statusInfo);
                                    enableRetry(button);
                                });
                        }).error(function(error) {
                            topAlert.addAlert("Error", 'Create site failed! ' + error.statusInfo);
                            enableRetry(button);
                        });
                };


                //segments TODO
                $scope.selectedSegmentData = {};
                $scope.$on('myselect.select', function(e,value){
                    $scope.selectedSegmentData = value;
                    $scope.$broadcast('segmentChange',{
                            select:$scope.selectedSegmentData
                        }
                    )
                });
            }
        ]).controller('segmentSelecterCtrl', function ($scope, segmentsService,$select) {
            $scope.selectedSegment = "";
            $scope.segments = [];
            $scope.$on('$select.select', function(select,value, index){
                segmentsService.setSelectedSegment(value);
                $scope.$emit('myselect.select',value)
            });
            segmentsService.getSegments().then(function(msg){
                $scope.segments = msg;

                $scope.selectedSegment = msg[0];
                segmentsService.setSelectedSegment($scope.selectedSegment);
                $scope.$emit('myselect.select',$scope.selectedSegment)

            });
        });


}());