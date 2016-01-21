(function () {
    'use strict';


    angular.module('app')
        .factory('globalAlert', function ($timeout) {
            return {
                alerts: {},
                addAlert: function (type, message, container, duration) {

                    if (!container) {
                        if (angular.element('#modal-message').length > 0) {
                            container = '#modal-message';
                        } else if (angular.element('#aside-message').length > 0) {
                            container = '#aside-message';
                        } else {
                            container = '#topAlert';
                        }
                    }

                    if (duration !== false) {
                        duration = duration || 6;
                    }

                    var cssType = "info";
                    type = angular.uppercase(type) || 'ERROR';
                    if (type === "ERROR" || type === "DANGER") {
                        cssType = "danger";
                    } else if (type === "SUCCESS") {
                        cssType = "success";
                    }
                    var alertIcons = {
                        'ERROR': '<i class="btr bt-big bt-ban alert-icon"></i>',
                        'SUCCESS': '<i class="btr bt-big  bt-check-circle alert-icon"></i>',
                        'INFO': '<i class="btr bt-big  bt-info-circle alert-icon"></i>',
                        'DANGER': '<i class="btr bt-big  bt-info-circle alert-icon"></i>'
                    };

                    var div = '<div class="alert am-fade alert-' + cssType
                        + '"  style="display: block;">' +
                        '<button type="button"  class="close" ' +
                        ' onclick="angular.element(this).parent().remove()">×</button>' +
                        '<strong> </strong>&nbsp;<span >' +
                        alertIcons[type] + message + '</span></div>';
                    //if (message) {
                    angular.element(container).html(div);

                    $timeout(function () {
                        angular.element(container).html('');
                    }, duration * 1000);
                    //}


                },
                asideWarning: function (message) {
                    this.addAlert('ERROR', message, '#aside-message');
                },
                asideSuccess: function (message) {
                    this.addAlert('SUCCESS', message, '#aside-message');
                },
                modalWarning: function (message) {
                    this.addAlert('ERROR', message, '#modal-message');
                },
                modalSuccess: function (message) {
                    this.addAlert('SUCCESS', message, '#modal-message');
                },
                clearAlerts: function () {
                    var x;
                    for (x in this.alerts) {
                        if (x) {
                            delete this.alerts[x];
                        }
                    }
                }
            };
        })

}());