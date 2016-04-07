// 依赖
// ------------------------------------------------

// Backbone
var Backbone = require('backbone');
// UnderScore
var _ = require('underscore');
// CEF API
var cefAPI = require('common:libs/cefAPI');
// Server API
var serverAPI = require('common:libs/serverAPI');
// 功能函数库
var utils = require('common:libs/utils');
// 日志
var log = require('log');
// 事件中心
var eventCenter = require('common:libs/eventCenter');
// 任务模型模块
var TaskModelModule = require('task:task.model');
// 任务基类
var TaskBaseModel = TaskModelModule.TaskBaseModel;
// 安装任务模型
var InstallTaskModel = TaskModelModule.InstallTaskModel;
// 下载任务模型
var DownLoadTaskModel = TaskModelModule.DownloadTaskModel;
// 完成任务类型
var CompleteTaskModel = TaskModelModule.CompleteTaskModel;
// 超级表格的容器基类
var SuperGridCollection = require('common:superGrid.collection');
// taskDB
var taskDB = require('task:libs/taskDB');


// 业务代码
// ----------------------------------------------

// 任务容器基类的静态属性
var TaskCollectionCP = {
    getInstance : function () {
        var Constructor = this;
        if (!this._instance) {
            this._instance = new Constructor();
        }
        return this._instance;
    }
};

// 任务容器基类
var TaskBaseCollection = SuperGridCollection.extend({
    // 暂停
    doPause    : function () {
        this.each(function (model, index) {
            //if (model.isSelected() && model.canPause()) {
            if (model.isSelected()) {
                model.doPause();
            }
        });
        return this;
    },
    // 继续
    doContinue : function () {
        this.each(function (model) {
            //if (model.isSelected() && model.canContinue()) {
            if (model.isSelected()) {
                model.doContinue();
            }
        });
        return this;
    },
    // 删除
    doDelete   : function () {
        var models = this.filter(function(model) {
            return model.isSelected() && model.canCancel();
        });
        _.each(models,function(model){
            // silent
            model.doCancel();
        });
        return this;
    },
    canPause                   : function () {
        var me = this;
        return me.any(function (model) {
            return model.isSelected() && model.canPause();
        });
    },
    canContinue                : function () {
        var me = this;
        return me.any(function (model) {
            return model.isSelected() && model.canContinue();
        });
    },
    canCancel                  : function () {
        var me = this;
        return me.any(function (model) {
            return model.isSelected() && model.canCancel();
        });
    }
}, TaskCollectionCP);

// 未安装完的任务容器静态属性
var ProcessAppCollectionCP = {
    EVENT               : {},
    DownloadingQueueMax : 6,
    InstallingQueueMax  : 1
};


// 未安装完成的任务容器
var ProcessAppCollection = TaskBaseCollection.extend({
    database                   : taskDB,
    storeName                  : 'processApps',
    comparator                 : function (item) {
        return item.get('createTime');
    },
    model                      : function (attrs, options) {
        var TASK_TYPE = TaskBaseModel.TASK_TYPE,
            type = attrs.type || TASK_TYPE.DOWNLOAD,
            model;
        if (type == TASK_TYPE.DOWNLOAD) {
            model = new DownLoadTaskModel(attrs, options);
        }
        else if (type == TASK_TYPE.INSTALL_APP) {
            model = new InstallTaskModel(attrs, options);
        }
        else {
            log.error('没有设置TaskType')
        }
        return model;
    },
    initialize                 : function () {
        var me = this;

        // App 安装相关事件
        // ------------------------
        // 观察安装进度
        me.listenTo(cefAPI, cefAPI.appEvent.AppInstallProgress, me.appInstallProgressHandler);
        // 检测导入APP
        me.listenTo(eventCenter, eventCenter.appInstallEvent.Import, me.appInstallImportHandler);

        // App 下载相关事件
        // --------------------------
        // 观察下载进度
        me.listenTo(cefAPI, cefAPI.appEvent.AppDownloadProgress, me.appDownloadProgressHandler);
        // 观察下载是否完成
        me.listenTo(cefAPI, cefAPI.appEvent.AppDownloadFinishStatus, me.appDownloadFinishHandler);
        // 检测下载事件
        me.listenTo(eventCenter, eventCenter.appDownloadEvent.Start, me.appDownloadHandler);

        // 重新安装相关
        // --------------------------
        me.listenTo(eventCenter, eventCenter.appReinstallEvent.Reinstall, me.appReinstallHandler);

        // 手机插入
        me.listenTo(cefAPI, cefAPI.appEvent.PlugIn, function () {
            // 恢复安装任务
            me.syncInstallHandler();
        });
        // 手机拔出
        me.listenTo(cefAPI, cefAPI.appEvent.PlugOff, function () {
            // 移除安装任务
            me.syncInstallHandler();
        });
        me.startQueueCheck();
        me.on('add remove reset', function () {
            eventCenter.trigger(eventCenter.processTaskEvent.Change, {count : me.length});
        });
        // 恢复下载任务
        me.fetch({
            silent     : true,
            success    : me.syncDownloadHandler
        });
    },
    queueCheckHandler : function(model){
        var me = this;
        console.trace('queueCheck调用栈');
        if (model.isDownloadTask()) {
            me.downloadingQueueCheck();
        }
        else if (model.isInstallTask()) {
            me.installingQueueCheck();
        }
    },
    startQueueCheck : function(){
        this.stopQueueCheck();
        // 增加任务

        this.on('add remove change:status', this.queueCheckHandler);
        return this;
    },
    stopQueueCheck : function(){
        this.off('add remove change:status', this.queueCheckHandler);
        return this;
    },
    // 同步下载
    syncDownloadHandler        : function (collection) {
        collection.each(function (model) {
            if (model.isDownloadTask()) {
                if (model.isDownloading()) {
                    model.download();
                }
            }
        });
        collection.downloadingQueueCheck();
    },
    // 同步安装
    syncInstallHandler         : function () {
        var me = this;
        me.each(function (model) {
            if (model.isDownloadTask()) {
                if (model.isDone()) {
                    model.destroy({
                        wait    : true,
                        success : function () {
                            me.create(model.convertToInstallTask(), {
                                wait : true
                            })
                        }
                    });
                }
            }
            if (model.isInstallTask()) {
                if (model.isInstalling()) {
                    model.correctInterrupt();
                }
            }
        });
        me.installingQueueCheck();
    },
    // 下载队列检测
    downloadingQueueCheck      : function () {
        var me = this,
            downloadReadyTasks = [],
            downloadingTasks = [];
        console.count('下载检测调用次数');
        console.trace('下载检测调用栈');
        me.stopQueueCheck();
        me.each(function (model) {
            if (model.isDownloadTask()) {
                if (model.isDownloading()) {
                    downloadingTasks.push(model);
                }
                if (model.isReadyDownloading()) {
                    downloadReadyTasks.push(model);
                }
            }
        });
        console.log('正在下载的任务数量',downloadingTasks.length);
        console.log('准备下载的任务数量',downloadReadyTasks.length);
        if (downloadingTasks.length < 6 && downloadReadyTasks.length > 0) {
            _.each(downloadReadyTasks.slice(0,(6 - downloadingTasks.length)), function (model) {
                model.download();
            });
        }
        me.startQueueCheck();
    },
    // 安装队列检测
    installingQueueCheck       : function () {
        var me = this,
            installReadyTasks = [],
            installingTasks = [];
        me.each(function (model) {
            if (model.isInstallTask()) {
                if (model.isInstalling()) {
                    installingTasks.push(model);
                }
                if (model.isReadyInstalling()) {
                    installReadyTasks.push(model);
                }
            }
        });
        if (installingTasks.length < 1 && installReadyTasks.length > 0) {
            _.each(installReadyTasks.slice(0, 1 - installingTasks.length), function (model) {
                model.install();
            });
        }
    },

    // 创建DownloadTaskModel
    appDownloadHandler         : function (info) {
        var me = this;
        var model = me.findWhere({ipaid : info.ipaid});
        console.log('创建DownloadTaskModel',info.ipaid,model,me.toJSON())
        if(!model){
            serverAPI.getPcGuid(function (pcGuid) {
                me.create({
                    url   : serverAPI.getDownloadUrl(pcGuid, info.ipaid),
                    type  : TaskBaseModel.TASK_TYPE.DOWNLOAD,
                    ipaid : info.ipaid,
                    name  : info.name,
                    icon  : info.icon
                },{
                    wait : true
                });
            });
        }
        else{
        }

    },
    // 监控下载进度
    appDownloadProgressHandler : function (res) {
        res || (res = []);
        var me = this;
        me._appDownloadProgressTime || (me._appDownloadProgressTime = +new Date());
        if(new Date() - me._appDownloadProgressTime < 1000) return;
        me._appDownloadProgressTime = +new Date();
        console.log('appdownload progress',res);
        _.each(res, function (str) {
            var json = JSON.parse(str || '{}'),
                taskId = json.downloadTask,
                taskJson,
                model = me.get(taskId);
            if (model && !model.isPause() && !model.isDone()) {
                // 正在下载中，不保存进度
                // 非进行中的话，保存进度
                if (model.isDownloading()) {
                    if (!model.get('size')) {
                        model.save({
                            size    : json.fileSize,
                            percent : json.finishSize,
                            rate:json.rate

                        }, {wait : true});
                    }
                    else {
                        model.set({
                            // 完成的进度
                            percent : json.finishSize,
                            rate:json.rate
                        });
                    }
                }
                else {
                    taskJson = model.getWhatCanDo(json.status);
                    taskJson.status = json.status;
                    taskJson.size = json.fileSize;
                    taskJson.percent = json.finishSize;
                    console.log('json.status',json.status)
                    model.save(taskJson, {wait : true});
                }

            }
        })


    },
    // 监控下载是否完成
    appDownloadFinishHandler   : function (res) {
        res || (res = []);
        var me = this,
            json = JSON.parse(res[0] || '{}'),
            taskId = json.downloadTask,
            model = me.get(taskId),
            taskJson,
            ERROR_CODE = DownLoadTaskModel.ERROR_CODE,
            DOWNLOAD_CODE = DownLoadTaskModel.DOWNLOAD_CODE;
        // 停止
        console.log('json.errCode===========',json)
        if (model && json.status == DOWNLOAD_CODE.DONE) {
            // 完成
            if (json.errCode === ERROR_CODE.COMPLETE) {
                model.destroy({
                    wait    : true,
                    success : function () {
                        taskJson = model.convertToInstallTask();
                        taskJson.appPath = json.ipaPath;
                        me.create(taskJson, {
                            wait : true
                        })
                    }
                });
            }
            else if (json.errCode === ERROR_CODE.DOWNLOAD_REQUEST_404_ERROR||
                    json.errCode === ERROR_CODE.DOWNLOAD_INVALID_SOCKET||
                    json.errCode === ERROR_CODE.DOWNLOAD_NOT_FOUND_302_REDIRECT||
                    json.errCode === ERROR_CODE.DOWNLOAD_URL_ERROR) {
                taskJson = model.getWhatCanDo(DOWNLOAD_CODE.ERROR);
                log.error('404-', model.get('name'));
                me.stopQueueCheck();
                model.save(taskJson);
                me.startQueueCheck();
            }else if(json.errCode === ERROR_CODE.DOWNLOAD_RECV_SOCKET_ERROR){
                setTimeout(function(){model.doRetry();},1000);
            }
        }
    },
    // 创建InstallTaskModel
    appInstallImportHandler    : function (ipaPaths) {
        var me = this;
        if (!ipaPaths.length) return;
        if (!cefAPI.isConnect()) return;
        _.each(ipaPaths, function (ipaPath) {
            // 获取IPA的基本信息
            cefAPI.appIpaInfo(ipaPath, function (res) {
                res || (res = []);
                var json = JSON.parse(res[0] || '{}');
                me.create({
                    type        : InstallTaskModel.TASK_TYPE.INSTALL_APP,
                    appPath     : ipaPath,
                    name        : json.appDisplayName,
                    isRoot      : json.isRoot,
                    appBundleID : json.appBundleID,
                    size        : json.appNstSize
                }, {wait : true});
            });
        });
    },
    // 观察安装进度
    appInstallProgressHandler  : function (res) {
        var me = this,
            json,
            model;

        me._appInstallProgressTime || (me._appInstallProgressTime = +new Date());
        if(new Date() - me._appInstallProgressTime < 1000) return;
        me._appInstallProgressTime = +new Date();
        json = JSON.parse(res);
        model = me.findWhere({appPath : json.appPath});
        if (model) {
            model.set('percent', json.appProcess);
        }
    },
    // 重新安装
    appReinstallHandler        : function (taskJson) {
        var me = this;
        me.create(taskJson, {wait : true});
    }
}, ProcessAppCollectionCP);

// 安装完成的任务容器的静态属性
var CompletedAppCollectionCP = {};

// 安装完成的任务容器
var CompletedAppCollection = TaskBaseCollection.extend({
    database                 : taskDB,
    storeName                : 'completedApps',
    model                    : CompleteTaskModel,
    // Fixed IG-173
    comparator                 : function (item) {
        return -item.get('createTime');
    },
    initialize               : function () {
        var me = this;
        eventCenter.on(eventCenter.appInstallEvent.Success, me.appInstallSuccessHandler, me);
        me.fetch();
    },
    appInstallSuccessHandler : function (res) {
        var taskJson = res.taskJson;
        this.create(taskJson, {
            wait : true
        });

    }
}, CompletedAppCollectionCP);

// 导出
// --------------------------------

// 未安装完成的任务容器实例
exports.ProcessAppCollection = ProcessAppCollection;

// 安装完成的任务容器实例
exports.CompletedAppCollection = CompletedAppCollection;
