// 依赖
// ----------------------------------

// Backbone
var Backbone = require('backbone');
// 超级表格的模型基类
var SuperGridModel = require('common:superGrid.model');
// 字节格式化
var Bytes = require('common:libs/bytes');
// UnderScore
var _ = require('underscore');
// CEF通信API
var cefAPI = require('common:libs/cefAPI');
// 日志模块
var log = require('log');
// 事件中心
var eventCenter = require('common:libs/eventCenter');
// taskDB
var taskDB = require('task:libs/taskDB');

// 业务代码
// ----------------------------------

// 任务静态属性
var TaskBaseModelCP = {
    // 任务类型
    TASK_TYPE : {
        // 下载
        DOWNLOAD      : 1,
        // 安装APP
        INSTALL_APP   : 2,
        // 已经安装过
        INSTALLED_APP : 3
    }
};

// 任务模型
var TaskBaseModel = SuperGridModel.extend({
    // 默认值
    defaults        : {
        selected    : false,
        // 应用路径
        appPath     : '',
        // 应用图片
        icon        : '',
        // icon download
        iconLoaded  : false,
        // 帐号
        appleID     : '',
        // 应用名称
        name        : '',
        // 应用大小
        size        : 0,
        // 进度
        percent     : 0,
        // 应用状态
        status      : null,
        // 应用ID bound ID
        appBundleID : '',
        // 是否越狱
        isRoot      : false,
        // 应用ipa的id
        ipaid       : '',
        // 可以暂停
        canPause    : false,
        // 可以继续
        canContinue : false,
        // 可以重试
        canRetry    : false,
        // 可以取消
        canCancel   : false,
        // 创建时间
        createTime  : null
    },
    canRetry        : function () {
        return this.get('canRetry');
    },
    canCancel       : function () {
        return this.get('canCancel');
    },
    // JSON帮助函数
    canPause        : function () {
        return this.get('canPause');
    },
    canContinue     : function () {
        return this.get('canContinue');
    },
    // 构造器
    constructor     : function () {
        // 调用SuperGrid模型
        SuperGridModel.apply(this, arguments);
        // 调用 TaskBaseModel 的初始化方法
        TaskBaseModel.prototype.initialize.apply(this, arguments);
    },
    initialize      : function () {
        // 添加时间戳
        this.get('createTime') || this.set('createTime', new Date(), {silent : true});
    },
    sizeFormat      : function (size) {
        _.isUndefined(size) && (size = this.get('size'));
        return Bytes.format(size);
    },
    isInstallTask   : function () {
        return this.get('type') === TaskBaseModelCP.TASK_TYPE.INSTALL_APP;
    },
    isDownloadTask  : function () {
        return this.get('type') === TaskBaseModelCP.TASK_TYPE.DOWNLOAD;
    },
    isInstalledTask : function () {
        return this.get('type') === TaskBaseModelCP.TASK_TYPE.INSTALLED_APP;
    }
}, TaskBaseModelCP);

/**
 * 顺序
 * waiting start
 */

// 安装静态属性
var InstallTaskModelCP = {
    // 安装状态码
    INSTALL_CODE : {
        // 安装成功
        INSTALL_SUCCESS   : 'INSTALL_SUCCESS',
        // 安装失败
        INSTALL_FAILED    : 'INSTALL_FAILED',
        // 未越狱应用
        DEVICE_UNROOT     : 'DEVICE_UNROOT',
        // 设备不支持
        DEVICE_NOTSUPPORT : 'DEVICE_NOTSUPPORT',
        // app是版本比系统版本高
        VERSON_DISMATCH   : 'VERSON_DISMATCH',
        // 设备未连接
        DEVICE_OFFLINE    : 'DEVICE_OFFLINE',
        // 文件包不存在
        IPA_NOTEXIST      : 'IPA_NOTEXIST',
        // 安装中
        INSTALLING        : 'INSTALLING',
        // 等待中
        WAITING           : 'WAITING',
        // 暂停
        PAUSE             : 'PAUSE'
    }
};

// 安装模型
var InstallTaskModel = TaskBaseModel.extend({
    database               : taskDB,
    storeName              : 'processApps',
    defaults               : function () {
        return _.extend({}, TaskBaseModel.prototype.defaults, {
            // 类型是APP
            type : TaskBaseModelCP.TASK_TYPE.INSTALL_APP
        }, this.getWhatCanDo(InstallTaskModelCP.INSTALL_CODE.WAITING));
    },
    isInstalling           : function (status) {
        status || (status = this.get('status'));
        return status == InstallTaskModelCP.INSTALL_CODE.INSTALLING;
    },
    isReadyInstalling      : function (status) {
        status || (status = this.get('status'));
        return status == InstallTaskModelCP.INSTALL_CODE.WAITING;
    },
    isOffLine              : function () {
        return !cefAPI.isConnect();
    },
    getWhatCanDo           : function (status) {
        var me = this,
            INSTALL_CODE = InstallTaskModelCP.INSTALL_CODE,
            canRetry, canPause, canContinue, canCancel;
        if (!cefAPI.isConnect()) {
            status = INSTALL_CODE.DEVICE_OFFLINE
        }
        canRetry = (status == INSTALL_CODE.INSTALL_FAILED
        || status == INSTALL_CODE.IPA_NOTEXIST
        || status == INSTALL_CODE.DEVICE_NOTSUPPORT
        || status == INSTALL_CODE.DEVICE_UNROOT
        || status == INSTALL_CODE.VERSON_DISMATCH
        || status == INSTALL_CODE.DEVICE_OFFLINE);
        canPause = (status == INSTALL_CODE.WAITING);
        canContinue = (status === INSTALL_CODE.PAUSE);
        canCancel = (canPause || canContinue || canRetry);

        return {
            canRetry    : canRetry,
            canPause    : canPause,
            canContinue : canContinue,
            canCancel   : canCancel,
            status      : status
        }

    },

    // 安装应用
    install                : function () {
        var me = this,
            appPath = me.get('appPath'),
            taskJson = me.getWhatCanDo(InstallTaskModelCP.INSTALL_CODE.INSTALLING);

        // 更改安装状态
        me.save(taskJson);
        if (cefAPI.isConnect()) {
            cefAPI.appInstall(appPath, function (res) {
                res || (res = []);
                var status = res[0],
                    taskJson;
                if (status === InstallTaskModelCP.INSTALL_CODE.INSTALL_SUCCESS) {
                    // 安装成功
                    me.destroy();
                    // 应用信息
                    eventCenter.trigger(eventCenter.appInstallEvent.Success, {
                        appInfo  : JSON.parse(res[1] || '{}'),
                        taskJson : me.convertToCompletedTask()
                    });
                }
                else {
                    // 安装失败
                    taskJson = me.getWhatCanDo(status);
                    me.save(taskJson);
                }

            });
        }

    },
    convertToCompletedTask : function () {
        var json = {
            type       : TaskBaseModel.TASK_TYPE.INSTALLED_APP,
            createTime : this.get('createTime'),
            appPath    : this.get('appPath'),
            name       : this.get('name'),
            size       : this.get('size')
        };

        if (this.get('iconLoaded')) {
            json.iconLoaded = true;
            json.icon = this.get('icon');
        }
        return json;
    },
    correctInterrupt       : function () {
        var taskJson = this.getWhatCanDo(InstallTaskModelCP.INSTALL_CODE.INSTALL_FAILED);
        this.save(taskJson);
    },

    progressTip : function (status) {
        status || (status = this.get('status'));
        var INSTALL_CODE = InstallTaskModelCP.INSTALL_CODE;
        var tip;
        switch (status) {
            case INSTALL_CODE.WAITING :
                tip = 'Wating';
                break;
            case INSTALL_CODE.PAUSE :
                tip = 'Pause';
                break;
            case INSTALL_CODE.INSTALLING :
                tip = 'Installing ' + this.get('percent') + '%';
                break;
            case INSTALL_CODE.IPA_NOTEXIST :
                tip = '<span class="error">Ipa Not Exist</span>';
                break;
            case INSTALL_CODE.INSTALL_FAILED :
                tip = '<span class="error">Install Error</span>';
                break;
            case INSTALL_CODE.DEVICE_NOTSUPPORT :
                tip = '<span class="error">Device not support</span>';
                break;
            case INSTALL_CODE.DEVICE_UNROOT :
                tip = '<span class="error">Incompatible with your device</span>';
                break;
            case INSTALL_CODE.DEVICE_OFFLINE :
                tip = '<span class="error">Connect device to install</span>';
                break;
            case  INSTALL_CODE.VERSON_DISMATCH :
                tip = '<span class="error">Incompatible with your device</span>';
                break;
            default :
                tip = '';
        }
        return tip;
    },

    isPause    : function () {
        return this.get('status') == InstallTaskModelCP.INSTALL_CODE.PAUSE;
    },

    // 暂停安装
    doPause    : function () {
        var taskJson = this.getWhatCanDo(InstallTaskModelCP.INSTALL_CODE.PAUSE);
        this.save(taskJson);
    },
    // 取消安装
    doCancel   : function () {
        this.destroy();
    },
    // 继续安装
    doContinue : function () {
        var taskJson = this.getWhatCanDo(InstallTaskModelCP.INSTALL_CODE.WAITING);
        this.save(taskJson);
    },
    // 重试
    doRetry    : function () {
        var taskJson = this.getWhatCanDo(InstallTaskModelCP.INSTALL_CODE.WAITING);

        this.save(taskJson);
    }
}, InstallTaskModelCP);

// 下载静态属性
var DownloadTaskModelCP = {
    // 下载状态码
    DOWNLOAD_CODE : {
        STARTED : 'started',
        BUSY    : 'busy',
        EXIST   : 'exist',
        PAUSE   : 'pause',
        DOING   : 'doing',
        WAITING : 'waiting',
        DONE    : 'done',
        ERROR   : 'error',
        DELETE  : 'delete'
    },
    ERROR_CODE    : {
        WAITING                         : -1,
        DOWNLOADING                     : 0,
        COMPLETE                        : 1, //完成
        DOWNLOAD_REQUEST_404_ERROR      : 2, //文件不能下载
        DOWNLOAD_NOT_FOUND_302_REDIRECT : 3, //文件重定向
        DOWNLOAD_URL_ERROR              : 4,
        DOWNLOAD_RECV_SOCKET_ERROR      : 16,
        DOWNLOAD_INVALID_SOCKET         : 18,//网络中断
        STOP_DOWNLOAD                   : 5, //暂停下载
        FILE_EXISTS                     : 7
    }
};

// 下载模型
var DownloadTaskModel = TaskBaseModel.extend({
    constructor: function() {
        this.cefQueue = [];
        this.cefQueueTimer = null;
        this.indexdbQueue = [];
        this.indexdbQueueTimer = null;
        TaskBaseModel.apply(this, arguments);
    },
    database  : taskDB,
    storeName : 'processApps',
    // 默认值
    defaults  : function () {
        return _.extend({}, TaskBaseModel.prototype.defaults, {
            type : TaskBaseModelCP.TASK_TYPE.DOWNLOAD
        }, this.getWhatCanDo(DownloadTaskModelCP.DOWNLOAD_CODE.WAITING));
    },
    validate  : function (attrs, options) {
        if (!_.isDate(attrs.createTime)) {
            return 'createTime can not be empty';
        }
        if (!_.isString(attrs.status)) {
            return 'status can not be empty';
        }
    },

    getWhatCanDo : function (status) {
        var DOWNLOAD_CODE = DownloadTaskModelCP.DOWNLOAD_CODE,
            canPause = status === DOWNLOAD_CODE.WAITING
                || status === DOWNLOAD_CODE.DOING
                || status === DOWNLOAD_CODE.BUSY
                || status === DOWNLOAD_CODE.STARTED,
            canContinue = status === DOWNLOAD_CODE.PAUSE,
            canRetry = status === DOWNLOAD_CODE.ERROR,
            canCancel = status === DOWNLOAD_CODE.DONE || canPause || canContinue || canRetry;


        return {
            canRetry    : canRetry,
            canPause    : canPause,
            canContinue : canContinue,
            canCancel   : canCancel,
            status      : status
        }
    },

    isDownloading        : function (status) {
        status || (status = this.get('status'));
        return status === DownloadTaskModelCP.DOWNLOAD_CODE.DOING;
    },
    isReadyDownloading   : function (status) {
        status || (status = this.get('status'));
        return status === DownloadTaskModelCP.DOWNLOAD_CODE.WAITING || status === DownloadTaskModelCP.DOWNLOAD_CODE.BUSY;
    },
    isPause              : function (status) {
        status || (status = this.get('status'));
        return status === DownloadTaskModelCP.DOWNLOAD_CODE.PAUSE;
    },
    isDone               : function (status) {
        status || (status = this.get('status'));
        return status === DownloadTaskModelCP.DOWNLOAD_CODE.DONE;
    },
    convertToInstallTask : function () {
        var json = {
            type       : TaskBaseModel.TASK_TYPE.INSTALL_APP,
            createTime : this.get('createTime'),
            appPath    : this.get('appPath'),
            icon       : this.get('icon'),
            iconLoaded : true,
            ipaid      : this.get('ipaid'),
            name       : this.get('name'),
            selected   : this.get('selected'),
            size       : this.get('size')
        };
        return json;
    },
    cefQueueHandler:function(cefTask){
        var me = this;
        if(this.cefQueueTimer){
            clearTimeout(this.cefQueueTimer);
        }
        this.cefQueue.push(cefTask);
        this.cefQueueTimer = setTimeout(function(){
            me.cefQueue[me.cefQueue.length-1]();
            me.cefQueue = [];
        },2000);
    },
    indexdbQueueHandler:function(indexdbTask){
        var me = this;
        if(this.indexdbQueueTimer){
            clearTimeout(this.indexdbQueueTimer);
        }
        this.indexdbQueue.push(indexdbTask);
        this.indexdbQueueTimer = setTimeout(function(){
            me.indexdbQueue[me.indexdbQueue.length-1]();
            me.indexdbQueue = [];
        },2000);
    },
    // 下载
    download             : function () {console.trace('下载调用栈');
        var me = this,
            taskId = me.get('id'),
            url = me.get('url'),
            name = me.get('name');
        var taskJson = me.getWhatCanDo(DownloadTaskModelCP.DOWNLOAD_CODE.DOING);
        me.set(taskJson);
        var cefTask = function(){
            me.save(taskJson);
            cefAPI.download(url, taskId, function (res) {
                //res || (res = []);
                //var json = JSON.parse(res[0] || '{}');
                //
                //json.status || (json.status = DownloadTaskModelCP.DOWNLOAD_CODE.BUSY);
                //// 开始也视作下载进行
                //if (json.status === DownloadTaskModelCP.DOWNLOAD_CODE.STARTED) {
                //    json.status = DownloadTaskModelCP.DOWNLOAD_CODE.DOING;
                //}
                //var taskJson = me.getWhatCanDo(json.status);
                //// 更新状态
                //me.save(taskJson,{silent:true});
            });
        }
        me.cefQueueHandler(cefTask);
    },
    // 停止下载
    doPause              : function () {
        var me = this,
            taskId = this.get('id');
        if (me.isDownloading()) {
            var cefTask = function() {
                cefAPI.downloadStop(taskId);
            }
            me.cefQueueHandler(cefTask);
        }
        var taskJson = me.getWhatCanDo(DownloadTaskModelCP.DOWNLOAD_CODE.PAUSE);
        // 更新状态
        var indexdbTask = function(){
            me.save(taskJson);
        }
        me.set(taskJson);
        me.indexdbQueueHandler(indexdbTask);
    },
    // 取消下载
    doCancel             : function () {
        var me = this,
            taskId = this.get('id');
        if (me.isDownloading()) {
            cefAPI.downloadCancel(taskId);
        }
        // 删除任务
        me.destroy();
    },
    // 继续下载
    doContinue           : function () {
        var me = this;
        var taskJson = this.getWhatCanDo(DownloadTaskModelCP.DOWNLOAD_CODE.WAITING);
        var indexdbTask = function(){
            me.save(taskJson);
        }
        me.set(taskJson);
        me.indexdbQueueHandler(indexdbTask);

    },
    // 重试
    doRetry              : function () {
        var taskJson = this.getWhatCanDo(DownloadTaskModelCP.DOWNLOAD_CODE.WAITING);
        console.log('doRetry=======',this.toJSON())
        console.log('doRetry=======',taskJson)
        this.save(taskJson);
    },
    progressTip          : function (status) {
        status || (status = this.get('status'));
        var DOWNLOAD_CODE = DownloadTaskModelCP.DOWNLOAD_CODE,
            tip;
        switch (status) {
            case DOWNLOAD_CODE.ERROR :
                // 显示错误
                tip = '<span class="error">Download failed. Network error</span>';
                break;
            case  DOWNLOAD_CODE.BUSY:
            case  DOWNLOAD_CODE.WAITING:
            case  DOWNLOAD_CODE.STARTED:
                // 等待中
                tip = 'Waiting';
                break;
            case DOWNLOAD_CODE.PAUSE:
                // 暂停
                tip = 'Paused';
                break;
            case  DOWNLOAD_CODE.DOING:
                // 下载中
                var rate = this.get('rate');
                rate = rate?Number(rate):0;
                rate = rate<1024?rate+'KB/s':Math.round(rate*10/1024,10)/10+'MB/s';
                tip = 'Downloading ' + this.get('percent') + '%' + ' (' + rate +')';
                break;
            case DOWNLOAD_CODE.DONE:
                // 下载完成
                tip = 'Download Finish';
                break;
            default :
                tip = '';
        }
        return tip;
    }
}, DownloadTaskModelCP);

// 下载完成的静态属性
var CompleteTaskModelCP = {};

// 下载完成的模型
var CompleteTaskModel = TaskBaseModel.extend({
    database             : taskDB,
    storeName            : 'completedApps',
    // 默认值
    defaults             : function () {
        return _.extend({}, TaskBaseModel.prototype.defaults, {
            type      : TaskBaseModelCP.TASK_TYPE.INSTALLED_APP,
            canCancel : true,
            canRetry  : true
        });
    },
    completeTip          : function () {
        var date = new Date(this.get('createTime'));
        var datevalues = [
            date.getHours() + ':',
            date.getMinutes() + ' ',
            date.getFullYear() + '-',
            date.getMonth() + 1 + '-',
            date.getDate()
        ];
        return 'Installed at ' + datevalues.join('');
    },
    convertToInstallTask : function () {
        var json = {
            type    : TaskBaseModel.TASK_TYPE.INSTALL_APP,
            appPath : this.get('appPath'),
            icon    : this.get('icon'),
            name    : this.get('name'),
            size    : this.get('size')
        };
        return json
    },

    doCancel : function () {
        this.destroy();
    },
    doRetry  : function () {
        this.destroy();
        eventCenter.trigger(eventCenter.appReinstallEvent.Reinstall, this.convertToInstallTask());
    }
}, CompleteTaskModelCP);

// 导出
// ----------------------------------

// 任务模型
exports.TaskBaseModel = TaskBaseModel;
// 安装模型
exports.InstallTaskModel = InstallTaskModel;
// 下载模型
exports.DownloadTaskModel = DownloadTaskModel;
// 完成模型
exports.CompleteTaskModel = CompleteTaskModel;