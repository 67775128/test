(function () {
    'use strict';


    angular.module('app')
        .factory('topAlert', function ($alert) {
            return {
                alerts: {},
                addAlert: function (type, message, container, duration) {
                    container = container || '#topAlert';
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
                        'SUCCESS': '<i class="btr bt-big bt-check-circle alert-icon"></i>',
                        'INFO': '<i class="btr bt-big bt-info-circle alert-icon"></i>',
                        'DANGER': '<i class="btr bt-big bt-info-circle alert-icon"></i>'
                    };
                    var myAlert = $alert({
                        title: undefined,
                        content: alertIcons[type] + message,
                        type: cssType,
                        keyboard: true,
                        duration: duration,
                        container: container,
                        dismissable: true
                    });
                    myAlert.$promise.then(myAlert.show);

                    this.alerts[type] = this.alerts[type] || [];
                    this.alerts[type].push(myAlert);
                },
                asideWarning: function(message){
                    this.addAlert('ERROR',message,'#aside-message');
                },
                asideSuccess: function(){
                    this.addAlert('SUCCESS',message,'#aside-message');
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