(function () {
    'use strict';

    angular.module('app').controller('HeaderCtrl',
        function ($scope, $http, $cookieStore, apiLsWeb, casUrl, userInfo, topAlert, $location,userInfoService) {

            $scope.userInfo = userInfo;

            function initDropdown(){
                $scope.dropdown = [
                    {text: 'Logout', click: 'logout()'},
                    {text: 'SAML Config', href: '#predict/integrate/saml'},
                    {text: 'Integration', href: '#predict/integrate/main'},
                    {
                        text: 'Change Password',
                        href: casUrl + 'password/modify?email=' + $scope.userInfo.email,
                        target: '_blank'
                    }
                ];
            }
            $scope.dropdownSuperUser = [
                {text: 'Return', click: 'fallbackRole()'}
            ];

            $scope.logout = function () {
                $http.get(apiLsWeb + 'logout')
                    .success(function (response) {
                        var redirect_url = response.redirect_url,
                            goto = window.location.href;
                        if (redirect_url) {
                            redirect_url = redirect_url.replace(/goto=[^&]+/i, ('goto=' + goto));
                            window.location.replace(redirect_url);
                        }
                    })
                    .error(function (data, status, headers, config) {
                    });
            };

            $scope.fallbackRole = function () {
                window.location.replace(apiLsWeb + 'fallbackRole');

            };

            function getUserInfo() {
                userInfoService.getUserInfo().
                then(function (response) {
                    $scope.superUser = response.edpUser;
                    _.extend($scope.userInfo, response.lsUser);
                    $scope.app.login = true;
                    initDropdown();

                }, function (response) {
                    if(response.status===403){
                        $scope.app.forbidden = true;
                    }
                });
            }

            getUserInfo();

        });
}());