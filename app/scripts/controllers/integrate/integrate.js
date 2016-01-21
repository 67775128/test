(function () {
    'use strict';

    angular.module('app')
        .controller('IntegrateCtrl', function ($scope, $http, apiLsWeb, topAlert, globalAlert) {
            $scope.checkedTab = 1;
            $scope.salesforce = {
                integrated: false,
                sandbox: false
            };
            $scope.marketo = {
                integrated: false,
                marketoClientId: null,
                marketoSecretKey: null,
                marketoInstance: null
            };
            $scope.eloqua = {
                integrated: false
            };
            $scope.pixel = {
                integrated : false,
                scriptText:'',
                imgText:'',
                siteId:'',
                url:''
            };

            var integrationType = {
                SALESFORCE: 100010,
                SANDBOX: 100020,
                CSV: 100030,
                MARKETO: 100040,
                ELOQUA: 100050
            };
            
            function getScriptText(){
                if($scope.pixel.siteId>=1000001){
                    $scope.pixel.scriptText ='<script>'
                        +'var _est = _est || [];'
                        +'(function() {'
                        +'var u="//p.everxo.com/";'
                        +'_est.push([\'setTrackerUrl\', u+\'esload.php\']);'
                        +'_est.push([\'setSiteId\', '+$scope.pixel.siteId+']);'
                        +'_est.push([\'trackPageView\']);'
                        +'_est.push([\'enableLinkTracking\']);'
                        +'var d=document, g=d.createElement(\'script\'), s=d.getElementsByTagName(\'script\')[0];'
                        +'g.type=\'text/javascript\'; g.async=true; g.defer=true; g.src=u+\'js/es.min.js?v=1.0\'; s.parentNode.insertBefore(g,s);'
                        +'})();'
                        +'</script>';
                    $scope.pixel.imgText ='<img src="//p.everxo.com/esload.php?idsite='+$scope.pixel.siteId+'&rec=1&v=1.0" style="display:none"/>';

                }else{
                    $scope.pixel.scriptText ='<script>'
                        +'var _esaq = _esaq || [];'
                        +'(function(){ var u=(("https:" == document.location.protocol) ? "https://listener.everstring.com/web/" : "http://listener.everstring.com/web/");'
                        +'_esaq.push(["setSiteId", '+$scope.pixel.siteId+']);'
                        +'_esaq.push(["setTrackerUrl", u+"webls.php"]);'
                        +'_esaq.push(["trackPageView"]);'
                        +'_esaq.push(["enableLinkTracking"]);'
                        +'var d=document, g=d.createElement("script"), s=d.getElementsByTagName("script")[0]; g.type="text/javascript"; g.defer=true; g.async=true; g.src=u+"estrack.js";'
                        +'s.parentNode.insertBefore(g,s); })();'
                        +'</script>';
                    $scope.pixel.imgText ='<img src="https://listener.everstring.com/web/webls.php?idsite='+$scope.pixel.siteId+'&rec=1" style="display:none"/>';
                }
            };
            
            function getSiteId(){
                $http({
                    url: apiLsWeb + '/integration/piwik/getSiteId'
                }).success(function (response) {
                    $scope.pixel.siteId = response.siteId;
                    $scope.pixel.url = response.siteUrl;
                    getScriptText();
                });
            };
            function getStatus(){
                $http({
                    url: apiLsWeb+'integration/getIntegrationStatus'
                }).success(function(response){
                    $scope.salesforce.integrated = response.salesforce?true:false;
                    $scope.salesforce.sandbox = response.salesforce == 100020;
                    $scope.marketo.integrated = response.marketo?true:false;
                    $scope.eloqua.integrated = response.eloqua?true:false;
                    $scope.pixel.integrated = response.piwik?true:false;
                    if($scope.pixel.integrated){
                        getSiteId();
                    }
                })
            };
            app.refreshIntegrate = function () {
                getStatus();
            };
            
            $scope.integrateSalesforce = function () {
                var type = $scope.salesforce.sandbox ? integrationType.SANDBOX : integrationType.SALESFORCE,
                    features = "location=1,status=1,scrollbars=1,width=700,height=500";
                console.log($scope.salesforce.sandbox);
                window.open(apiLsWeb + "integration/oauth/salesforce_token?type=" + type, "", features);
            };

            $scope.integrateEloqua = function () {
                if(!$scope.salesforce.integrated){
                    topAlert.addAlert('INFO','Please integrate salesforce first!')
                    return;
                };
                var features = "location=1,status=1,scrollbars=1,width=700,height=500";
                window.open(apiLsWeb + "integration/oauth/eloqua_token?", "", features);
            };

            $scope.integrateMarketo = function (valid) {console.log(valid)
                if(!$scope.salesforce.integrated){
                    topAlert.addAlert('DANGER','Please integrate salesforce first!')
                    return;
                };
                if(!valid){
                    topAlert.addAlert('DANGER','Some fields are blank,please fill them in!')
                    return;
                };

                $http({
                    url: apiLsWeb + 'integration/integrateMarketo',
                    params: {
                        marketoClientId: $scope.marketo.marketoClientId,
                        marketoSecretKey: $scope.marketo.marketoSecretKey,
                        marketoInstance: $scope.marketo.marketoInstance.replace(/\/rest$/,'')
                    }
                }).success(function (response) {
                    $scope.marketo.integrated = true;
                });
            };

            $scope.integratePixel = function (valid) {
                if(!valid){
                    return;
                };
                var paramObject = {};
                paramObject.siteName = _.trim($scope.pixel.url).replace(/^((https|http|ftp|rtsp|mms):\/\/)/i, '');
                paramObject.url = _.trim($scope.pixel.url).replace(/^((https|http|ftp|rtsp|mms):\/\/)/i, '');
                $http({
                    url: apiLsWeb + '/integration/piwik/generateSiteId',
                    params: paramObject
                }).success(function (response) {
                    $scope.pixel.integrated = true;
                    $scope.pixel.siteId = response.siteId;
                    getScriptText();
                });
            };
            getStatus();
            (function () {
                ZeroClipboard.config({swfPath: "images/ZeroClipboard.swf"});
                var client1 = new ZeroClipboard($(".js-copy-javascript"));
                var client2 = new ZeroClipboard($(".js-copy-image"));
                client1.on("copy", function (event) {
                    var clipboard = event.clipboardData;
                    clipboard.setData("text/plain", $('.js-pixel-js-textarea').val());
                    var $jsCopy = $(".js-copy-javascript").parent().find('.js-copy');
                    $jsCopy.fadeIn('slow');
                    setTimeout(function () {
                        $jsCopy.fadeOut('slow');
                    }, 1000);
                });
                client2.on("copy", function (event) {
                    var clipboard = event.clipboardData;
                    clipboard.setData("text/plain", $('.js-pixel-image-textarea').val());
                    var $jsCopy = $(".js-copy-image").parent().find('.js-copy');
                    $jsCopy.fadeIn('slow');
                    setTimeout(function () {
                        $jsCopy.fadeOut('slow');
                    }, 1000);
                });
            })();
        });
}());