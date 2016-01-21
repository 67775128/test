(function () {
    'use strict';

    angular.module('app')
        .controller('SamlConfigCtrl', function ($scope, $http, apiLsWeb, topAlert,userInfoService) {

            var url = apiLsWeb + 'saml/config';
            $scope.config = {
                info: {
                    id: -1,
                    domain: '',
                    metadata: '',
                    idpName: ''
                },
                saveConfig: function () {
                    var that = this;
                    $http.post(url, {
                        domain: that.info.domain,
                        metadata: that.info.metadata,
                        id:that.info.id
                    }).success(function (response) {
                        that.info = response;
                        topAlert.addAlert('success','Saved successfully.')
                    }).error(function(response){
                        console.log(response)
                        topAlert.addAlert('error',response.message)
                    });
                },
                getConfig: function () {
                    var that = this;
                    userInfoService.getUserInfo().
                    then(function (response) {
                        that.info.domain = response.domain;
                        $http.get(url + '?domain=' + that.info.domain).success(function (response) {
                            if(response){
                                that.info = response;
                            }
                        });
                    });

                }
            };

            $scope.config.getConfig();

        });
}());