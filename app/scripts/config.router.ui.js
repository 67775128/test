(function () {
    'use strict';
    /**
     * @ngdoc function
     * @name app.config:uiRouter
     * @description
     * # Config
     * Config for the uikit router
     * Reference: https://github.com/angular-ui/ui-router/issues/948
     */

    angular.module('app').config(  //, ['ui.router', 'angularUtils.directives.uiBreadcrumbs']
        ['$stateProvider', '$urlRouterProvider',
            function ($stateProvider, $urlRouterProvider) {
                $urlRouterProvider.otherwise('/predict/integrate/main');

                $stateProvider.state('ui', {
                    url: '/ui',
                    templateUrl: 'views/ui-example.html',
                    controller: 'UiExampleCtrl',
                    data: {
                        displayName: 'Home'
                    }
                }).state('ads', {
                    url: '/ads',
                    // abstract: true,
                    views: {
                        '': {
                            templateUrl: 'views/layout.html'
                        }
                    },
                    data: {
                        displayName: 'Ads'
                    },
                    redirectTo: 'ads.campaign.list'
                }).state('ads.campaign', {
                    url: '/campaign',
                    // abstract: true,
                    template: '<ui-view />',
                    data: {
                        displayName: 'Campaigns'
                    }
                }).state('ads.campaign.show', {
                    url: '/campOverview?id',
                    templateUrl: 'views/ui/campOverview.html',
                    controller: 'CampOverview',
                    reloadOnSearch: false,
                    data: {
                        displayName: 'Overview'
                    }
                }).state('ads.campaign.list', {
                    url: '/index',
                    templateUrl: 'views/ui/camps.html',
                    controller: 'Camps',
                    data: {
                        displayName: 'Campaign List'
                    }
                }).state('ads.diagnosis', {
                    url: '/diagnosis',
                    // abstract: true,
                    template: '<ui-view />',
                    data: {
                        displayName: 'Diagnosis'
                    }
                }).state('ads.diagnosis.diagnosis', {
                    url: '/diagnosis',
                    templateUrl: 'views/ui/diagnosis.html',
                    controller: 'Diagnosis',
                    resolve: {
                        deps: ['$ocLazyLoad',
                            function ($ocLazyLoad) {
                                return $ocLazyLoad.load('bower_components/handsontable/dist/handsontable.full.js').then(
                                    function () {
                                        return $ocLazyLoad.load('bower_components/handsontable/dist/handsontable.full.css').then(
                                            function () {
                                                return $ocLazyLoad.load('scripts/controllers/diagnosis.js');
                                            }
                                        );
                                    }
                                );
                            }]
                    },
                    data: {
                        displayName: 'Diagnosis'
                    }
                }).state('ads.diagnosis.edit', {
                    url: '/edit',
                    templateUrl: 'views/ui/diagnosis.edit.html',
                    controller: 'DiagnosisEdit',
                    resolve: {
                        deps: ['$ocLazyLoad',
                            function ($ocLazyLoad) {
                                return $ocLazyLoad.load('bower_components/handsontable/dist/handsontable.full.js').then(
                                    function () {
                                        return $ocLazyLoad.load('bower_components/handsontable/dist/handsontable.full.css').then(
                                            function () {
                                                return $ocLazyLoad.load('scripts/controllers/diagnosis.edit.js');
                                            }
                                        );
                                    }
                                );
                            }]
                    },
                    data: {
                        displayName: 'Diagnosis'
                    }
                }).state('home', {
                    url: '/home',
                    templateUrl: 'views/home/index.html',
                    data: {
                        displayName: 'Home'
                    }
                }).state('leadScoring', {
                    url: '/leadScoring',
                    templateUrl: 'views/lead_scoring/index.html'
                }).state('predict', {
                    url: '/predict',
                    views: {
                        '': {
                            templateUrl: 'views/demand_gen/layout.html'
                        }
                    },
                    data: {
                        displayName: 'Predictive'
                    },
                    redirectTo: 'predict.integrate.main'
                }).state('predict.integrate', {
                    url: '/integrate',
                    template: '<ui-view />',
                    data: {
                        displayName: 'Integration'
                    }
                }).state('predict.integrate.main', {
                    url: '/main',
                    controller: 'IntegrateCtrl',
                    templateUrl: 'views/integrate/integrate.html',
                    data: {
                        displayName: 'Main'
                    }
                }).state('predict.integrate.saml', {
                    url: '/saml',
                    controller: 'SamlConfigCtrl',
                    templateUrl: 'views/integrate/saml-config.html',
                    data: {
                        displayName: 'SAML Config'
                    }
                }).state('predict.customer', {
                    url: '/customer',
                    template: '<ui-view />',
                    data: {
                        displayName: 'Customer'
                    }
                }).state('predict.customer.insight', {
                    url: '/main',
                    controller: 'CustomerInsightCtrl',
                    templateUrl: 'views/customer_insight/customer.insight.html',
                    data: {
                        displayName: 'Insight'
                    }
                }).state('predict.model', {
                    url: '/model',
                    template: '<ui-view />',
                    data: {
                        displayName: 'Model'
                    }
                }).state('predict.model.result', {
                    url: '/result',
                    controller: 'ModelResultCtrl',
                    templateUrl: 'views/model_result/model.result.html',
                    data: {
                        displayName: 'Result'
                    }
                //}).state('demandGen', {
                //    url: '/demandGen',
                //    views: {
                //        '': {
                //            templateUrl: 'views/demand_gen/layout.html'
                //        }
                //    },
                //    data: {
                //        displayName: 'Demand Gen'
                //    },
                //    redirectTo: 'demandGen.audience'
                }).state('predict.demandGen', {
                    url: '/demandGen',
                    template: '<ui-view />',
                    data: {
                        displayName: 'demand Gen'
                    }
                }).state('predict.demandGen.audience', {
                    url: '/audience',
                    controller: 'AudienceV1Ctrl',
                    templateUrl: 'views/demand_gen/lead-gen.html',
                    data: {
                        displayName: 'Audience'
                    }
                }).state('signin', {
                    url: '/signin',
                    controller: 'Signin',
                    templateUrl: 'views/pages/signin.html'
                })
                    // v2.0 create campaign related routes
                    .state('ads.campaign.create', {
                        url: '/create',
                        abstract: true,
                        templateUrl: 'views/campaign/create/layout.html',
                        controller: 'campaignCreateCtrl',
                        data: {
                            displayName: 'Create'
                        }
                    })
                    .state('ads.campaign.create.campaign_type', {
                        url: '/campaign_type',
                        templateUrl: 'views/campaign/create/campaign_type.html',
                        controller: 'campaignTypeCtrl'
                    })
                    .state('ads.campaign.create.campaign_settings', {
                        url: '/campaign_settings',
                        templateUrl: 'views/campaign/create/campaign_settings.html',
                        controller: 'campaignSettingsCtrl'
                    })
                    .state('ads.campaign.create.select_segments', {
                        url: '/select_segments',
                        templateUrl: 'views/campaign/create/select_segments.html',
                        controller: 'selectSegmentsCtrl'
                    })
                    .state('ads.campaign.create.existing_segments', {
                        url: '/existing_segments',
                        templateUrl: 'views/campaign/create/existing_segments.html',
                        controller: 'existingSegmentsCtrl'
                    })
                    .state('ads.campaign.create.choose_ads', {
                        url: '/choose_ads',
                        templateUrl: 'views/campaign/create/choose_ads.html',
                        controller: 'creativeCreateCtrl'
                    })
                    .state('ads.campaign.create.choose_ads.create_new', {
                        url: '/create_new',
                        templateUrl: 'views/campaign/create/create_new_ads.html',
                        controller: 'creativeCreateCtrl'
                    })
                    .state('ads.campaign.create.review', {
                        url: '/review',
                        templateUrl: 'views/campaign/create/review.html',
                        controller: 'campaignReviewCtrl'
                    })
                    .state('ads.campaign.people', {
                        url: '/people',
                        templateUrl: 'views/ui/campPeople.html',
                        controller: 'CampaignPeople',
                        data: {
                            displayName: 'People'
                        }
                    })
                    .state('ads.visits', {
                        url: '/visits',
                        template: '<div ui-view></div>',
                        data: {
                            displayName: 'Visits'
                        }
                    })
                    .state('ads.visits.accounts', {
                        url: '/accounts',
                        templateUrl: 'views/ui/visits/accounts.html',
                        controller: 'Visits',
                        data: {
                            displayName: 'Visits Account'
                        }
                    })
                    .state('ads.visits.people', {
                        url: '/people',
                        templateUrl: 'views/ui/visits/people.html',
                        controller: 'VisitsPeople',
                        data: {
                            displayName: 'Visits People'
                        }
                    })
                    .state('ads.tracking', {
                        url: '/tracking',
                        templateUrl: 'views/tracking/index.html',
                        controller: 'trackingSetupController',
                        data: {
                            displayName: 'Tracking'
                        }
                    });
            }
        ]
    );
}());
