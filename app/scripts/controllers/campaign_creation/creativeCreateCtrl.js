(function() {
    'use strict';

    angular.module('app')
        .controller('creativeCreateCtrl', function (Upload, $log, $scope, apiBaseUrl, $document, $timeout, topAlert, $modal) {

            var adLibraryModal = $modal({
                scope: $scope,
                templateUrl: 'views/modals/modal.ad.library.html',
                placement: 'center',
                show: false,
                title: "Ad Library"
            });

            $scope.showAdLibraryModal = function () {
                adLibraryModal.$promise.then(adLibraryModal.show);
                return false;
            }

            $scope.adLibrary = {};

            $scope.adLibrary.tableHeader = [
                {name: 'Size', dbkey: '', align: "text-center", reverse: null},
                {name: 'Ad Name', dbkey: '', align: "text-center", reverse: null},
                {name: 'Landing URL', dbkey: '', align: "text-center", reverse: null},
                {name: 'Created', dbkey: '', align: "text-center", reverse: null},
            ];

            $scope.deleteAd = function () {
                //delete in back end
                //refresh library page
            }

            $scope.selectAll = function () {
                _.each($scope.adLibrary.adList, function (item) {
                    item.selected = true;
                });
            }

            $scope.adLibrary.adList = [
                {
                    imageSrc: 'https://s3.amazonaws.com/uploads.hipchat.com/162922/2046576/uYokt0ILbxCroqH/160x600.jpg',
                    size: '160x600',
                    created: '8/22/2015',
                    selected: false
                },

                {
                    imageSrc: 'https://s3.amazonaws.com/uploads.hipchat.com/162922/2046576/JLYfStXfdhjCCFv/728x90.jpg',
                    size: '728x98',
                    created: '8/26/2015',
                    selected: false
                }
            ];


            $scope.requiredFormats = [
                {
                    width: 200,
                    height: 200,
                    description: 'universal size',
                    count: 0,
                    requiredCount: 2
                },
                {
                    width: 1200,
                    height: 628,
                    description: 'really big pic',
                    count: 0,
                    requiredCount: 1
                },
                {
                    width: 200,
                    height: 200,
                    description: 'social channel',
                    socialChannel: true,
                    count: 0,
                    requiredCount: 1
                },
            ];

            $scope.addCreative = function (format) {
                if (_.isUndefined($scope.new_ads.creatives)) {
                    $scope.new_ads.creatives = [];
                }
                format.count += 1;
                var newCreative = {_id: _.uniqueId('creative_'), format: format};
                $scope.new_ads.creatives.push(newCreative);
            };

            $scope.removeCreative = function (crt) {
                crt.format.count -= 1;
                _.remove($scope.new_ads.creatives, crt);
            };

            $scope.upload = function (files, ev, crt) {
                if (ev.type === 'click') {
                    return;
                }

                var validate = function (f, successCb, errorCb) {
                    if (!(f)) {
                        return errorCb('unknown error.');
                    }

                    var img = angular.element('<img></img>').css('visibility', 'hidden').css('position', 'absolute');
                    $document[0].body.appendChild(img[0]);
                    img.on('load', function (ev) {
                        var img = ev.target;
                        if (img.naturalWidth == crt.format.width && img.naturalHeight == crt.format.height) {
                            successCb();
                        }
                        else {
                            errorCb('expect image to be ' + crt.format.width + 'x' + crt.format.height + ', got ' + img.naturalWidth + 'x' + img.naturalHeight + '.');
                        }
                    });

                    var fileReader = new FileReader();
                    fileReader.readAsDataURL(f);
                    fileReader.onload = function (e) {
                        $timeout(function () {
                            img.attr('src', e.target.result);
                        });
                    };
                };

                var f = files[0];

                validate(f, function () {
                    var url = apiBaseUrl + 'images';
                    Upload.upload({
                        url: url,
                        file: files
                    }).progress(function (evt) {
                        $log.debug(evt.loaded, evt.total);
                    }).success(function (data) {
                        $log.debug(data);
                        crt.filename = data.filename;
                    });
                }, function (error) {
                    $log.debug(error);
                    topAlert.addAlert("Error", 'Upload creative failed! ');
                });
            };
        })
        .controller('creativeChooseCtrl', function ($scope, $state, $log) {
            $scope.state.name = ' choose ads';

            // by default bring user to create new ads.
            if ($state.is('ads.campaign.create.choose_ads')) {
                $state.go('ads.campaign.create.choose_ads.create_new');
                $log.debug($state);
            }
        });

})();