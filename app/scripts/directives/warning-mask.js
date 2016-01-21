(function () {
    'use strict';


    angular.module('app')
        .directive('modalwarning', function () {
            return {
                restrict: 'EA',

                replace: true,
                scope: {
                    warning: '='
                },
                template:'<div class="modal-warning h-full w-full pos-abt" style="z-index: 99;top: 0;left: 0;">'
                    +'<div class="h-full w-full pos-abt text-center text-20" style="background: rgba(0, 0, 0, 0.4);top:0;left:0;z-index: 10;">'
                        +'<p class="pos-abt text-left text-base" style="left:50%;margin-left:-220px;top:100px;background:#fff;padding: 70px 70px 70px 105px;width:455px;">'
                        +'<span style="color:{{warning.color}};top: 50%;left:70px;margin-top: -13px;" class="text-xl pos-abt {{warning.icon}}"></span>{{warning.text}}'
                    +'</p>'
                +'</div>'
                +'</div>'
            };
        });

}());