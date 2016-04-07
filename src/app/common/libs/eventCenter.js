var Backbone = require('backbone');
var _ = require('underscore');
var eventCenter = _.extend({
    name : 'eventCenter',
    client : {
        beforeClose : 'client-before-close'
    },
    appRouteEvent : {
        Change : 'app-router-change'
    },
    appInstallEvent  : {
        // 程序导入
        Import : 'app-install-import',
        // 程序安装成功
        Success: 'app-install-success',
        // 程序安装结束
        Finish : 'app-install-finish',
        // 程序安装失败
        Fail   : 'app-install-fail'
    },
    appDownloadEvent : {
        Start : 'app-download-start',
        Finish: 'app-download-finish'
    },
    appReinstallEvent: {
        Reinstall: 'app-reinstall'
    },
    processTaskEvent : {
        Change: 'process-task-change'
    },
    resourcePage:{
        Change:'resource-page-change'
    }
}, Backbone.Events);

module.exports = eventCenter;