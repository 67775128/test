/**
 * Created by lidinghui on 14-9-9.
 */
var _ = require('underscore');
var Backbone = require('backbone');
var log = require('log');
var empty = function () {
};
var cefAPI = {
    // 当前的后端
    getCurrentBackEnd            : function () {
        if (!this._currentBackEnd) {
            this._currentBackEnd = MGWebKit.wnd || new MGWindow();
        }
        return this._currentBackEnd;
    },
    init                         : function () {
        // 绑定
        this.factory();
        this.bindEvents();
    },
    appEvent                     : {
        // 连接上
        Connecting              : 'app-connecting',
        // 断开连接
        PlugOff                 : 'app-plug-off',
        // 获取设备信息 Ready
        PlugIn                  : 'app-plug-in',
        // 未信任
        NotTrusted              : 'app-not-trusted',
        // 获取到appIcon
        AppIconFlush            : 'app-icon-flush',
        // 获取app 更新
        AppUpgradeCheck         : 'app-upgrade-check',
        // backup_progress
        AppBackupProgress       : 'app-backup-progress',
        // install progress
        AppInstallProgress      : 'app-install-progress',
        // download finish
        AppDownloadFinishStatus : 'app-download-finish-status',
        // download progress
        AppDownloadProgress     : 'app-download-progress',
        // diskinfo change
        DiskinfoChange          : 'app-diskinfo-change',
        // updateAppSize
        AppUpdateSize           : 'app-update-size',
        // uninstall app
        AppUninstall            : 'app-uninstall',
        // scan_report
        deviceScanReport        : 'scan_report',
        // clear_report
        deviceClearReport       : 'clear_report'
    },
    deviceID                     : null,
    _isConnect                   : false,
    _isTrust                     : true,
    isConnect                    : function () {
        return this._isConnect;
    },
    setConnect                   : function (bool) {
        this._isConnect = bool;
        return this._isConnect;
    },
    isTrust                      : function () {
        return this._isTrust;
    },
    isCurrentDevice              : function (data) {
        data || (data = []);
        /*
         2014-11-24liujintao 添加或运算，解决data[0]不是deviceID的情形
         */
        return (this.deviceID === data[0]) || (this.deviceID === JSON.parse(data[0]).deviceID);
    },
    setTrust                     : function (bool) {
        this._isTrust = bool;
        return this._isTrust;
    },
    watch                        : function () {
        var me = this,
            backEnd = me.getCurrentBackEnd();
        log.debug('CEF Watch', arguments);
        backEnd.watch.apply(backEnd, arguments);
    },
    post                         : function () {
        var me = this,
            backEnd = me.getCurrentBackEnd();
        log.debug('CEF SendMessage', arguments);
        backEnd.sendMessage.apply(backEnd, arguments);
    },
    bindEvents                   : function () {
        var me = this,
            appEvent = me.appEvent;
        log.debug('CEF 监视开始');
        // 设备连接
        me.watch('dev_connectting', function (data) {
            data || (data = []);
            if (!me.deviceID) {
                me.deviceID = data[0];
                me.trigger(appEvent.Connecting, data);
            }
        });
        // 断开
        me.watch('dev_plugoff', function (data) {
            if (me.isCurrentDevice(data)) {
                me.setConnect(false);
                // 断开事件
                me.trigger(appEvent.PlugOff, data);
                me.deviceID = null;
            }
        });
        // 检测是否获得信任
        me.watch('dev_nottrusted', function (data) {
            if (me.isCurrentDevice(data)) {
                me.setTrust(false);
                me.trigger(me.appEvent.NotTrusted, data);
            }
        });
        // 检测图片
        me.watch('appIcon_flush', function (data) {
            if (me.isCurrentDevice(data)) {
                me.trigger(appEvent.AppIconFlush, data);
            }
        });
        // 检测app 升级
        me.watch('appUpgradeCheck', function (data) {
            if (me.isCurrentDevice(data)) {
                me.trigger(appEvent.AppUpgradeCheck, data)
            }
        });
        // 监控备份进度
        me.watch('backupProgress', function (data) {
            me.trigger(appEvent.AppBackupProgress, data);
        });
        // 监控安装进度
        me.watch('installProgress', function (data) {
            me.trigger(appEvent.AppInstallProgress, data);
        });
        // 监控下载完成情况
        me.watch('download_finish_status', function (data) {
            me.trigger(appEvent.AppDownloadFinishStatus, data);
        });
        // 监控下载进度
        me.watch('download_progress_status', function (data) {
            me.trigger(appEvent.AppDownloadProgress, data);
        });
        // 监控磁盘容量变化
        me.watch('dev_diskInfoChange', function (data) {
            if (me.isCurrentDevice(data)) {
                me.trigger(appEvent.DiskinfoChange, data);
            }
        });
        // 监控获取设备信息
        me.watch('dev_plugin', function (data) {
            if (me.isCurrentDevice(data)) {
                // 已经连接
                me.setConnect(true);
                // 已经信任
                me.setTrust(true);
                me.trigger(appEvent.PlugIn, data);
            }
        });
        // 监控获取大小发生改变
        me.watch('updateAppSize', function (data) {
            if (me.isCurrentDevice(data)) {
                me.trigger(appEvent.AppUpdateSize, data);
            }
        });
        // 设备清理相关
        //======================
        // 监听扫描反馈
        me.watch('scan_report', function (data) {
            me.trigger(appEvent.deviceScanReport, data);
        });
        // 监听清理反馈
        me.watch('clear_report', function (data) {
            me.trigger(appEvent.deviceClearReport, data);
        });

        log.debug('CEF 监视完成');
    },
    /*Message 相关*/
    // 启动
    bootstrap                    : function () {
        this.post('initDevPlugin', ['dev_plugin'], empty);
    },
    // 监测是否安装iTunes
    checkItunesInstalled         : function (callback) {
        this.post('checkiTunesInstalled', [], callback);
    },
    // 获取App 信息
    appInfo                      : function (callback) {
        this.post('getAppInfo', [this.deviceID], callback);
    },
    // 删除app
    appUninstall                 : function (appID, callback) {
        var me = this,
            appEvent = me.appEvent;
        this.post('unInstallApplication', [this.deviceID, appID], function (res) {
            me.trigger(appEvent.AppUninstall, res);
            callback && callback(res);
        });
    },
    // 备份app
    appBackup                    : function (appID, appFile, callback) {
        this.post('backupApplication', [this.deviceID, appID, appFile], callback);
    },
    // 在记事本打开
    openDevInfoWithNotepad       : function () {
        this.post('openDevInfoWithNotepad', [this.deviceID], empty);
    },
    // 获取app 详情页
    appDetail                    : function (callback) {
        this.post('getDevDetail', [this.deviceID], callback);
    },
    // 设备重命名
    deviceRename                 : function (newName, callback) {
        this.post('renameDevice', [this.deviceID, newName], callback);
    },
    // 获取IPA信息
    appIpaInfo                   : function (appPath, callback) {
        this.post('getIpaAppInfo', [this.deviceID, appPath], callback);
    },
    // 安装
    appInstall                   : function (appPath, callback) {
        this.post('installApplication', [this.deviceID, appPath], callback);
    },
    // 取消下载
    downloadCancel               : function (taskID) {
        this.post('cancelDownload', [taskID], empty);
    },
    // 下载
    download                     : function (url, taskID, callback) {
        this.post('download', [url, '', taskID], callback)
    },
    // 停止下载
    downloadStop                 : function (taskID, callback) {
        this.post('stopDownload', [taskID], callback);
    },
    // 修复闪退
    repair                       : function (callback) {
        this.post('repairForcedTermination', [this.deviceID], callback);
    },
    retryConnect                 : function (callback) {
        this.post('retryDevConnect', [], callback);
    },
    // 开始扫描
    deviceScanBegin              : function (callback) {
        this.post('scanBegin', [this.deviceID], callback);
    },
    // 停止扫描
    deviceScanStop               : function (callback) {
        this.post('scanStop', [this.deviceID], callback);
    },
    // 清理垃圾
    deviceClearRubbish           : function (callback, type) {
        type || (type = 'tmpRubbish');
        this.post('clearRubbish', [this.deviceID, type], callback);
    },
    // 清理临时文件
    deviceClearTmpRubbish        : function (callback) {
        this.deviceClearRubbish(callback, 'tmpRubbish');
    },
    // 清理脚本和cookies
    deviceClearCookiesRubbish    : function (callback) {
        this.deviceClearRubbish(callback, 'cookiesRubbish');
    },
    // 清理离线文件和缓存
    deviceClearCacheRubbish      : function (callback) {
        this.deviceClearRubbish(callback, 'cacheRubbish');
    },
    // 清理安装程序缓存
    deviceClearInstallPkgRubbish : function (callback) {
        this.deviceClearRubbish(callback, 'installPkgRubbish');
    },
    // 取消清理
    deviceClearStop              : function (callback) {
        this.post('stopClear', [this.deviceID], callback);
    },
    // 获取 GUID
    getPcGuid                    : function (callback) {
        this.post('getPCGuid', [], callback);
    },
    // 获取操作系统版本
    getOsVersion                 : function (callback) {
        this.post('getOSVersion', [], callback);
    },
    // 获取频道ID
    getChannelId                 : function (callback) {
        this.post('getChannelId', [], callback);
    },
    // 获取PC 版本
    getPcVersion                 : function (callback) {
        this.post('getPCVersion', [], callback);
    },
    // 获取操作系统语言
    getOSLang                    : function (callback) {
        this.post('getOSLanguage', [], callback);
    },
    factory                      : function () {
        var me = this;
        // 打开连接
        me.openUrl = function (url) {
            MGWebKit.openUrl(url);
        };
        // 打开文件夹
        me.openFolder = function (path) {
            MGWebKit.openFolder(path);
        };
        // 获取DocumentPath
        me.getMyDocumentPath = function () {
            return MGWebKit.getMyDocumentPath()
        };
        // 打开对话框
        me.openFileDialog = function (type, title, option, fileType, callback) {
            MGWebKit.runFileDialog(type, title, option, fileType, callback)
        };
        // 选择目录
        me.selectFolder = function (title, callback) {
            MGWebKit.selectFolder(title, MGWebKit.FolderSelectMode.mydesktop, callback);
        };

        me.copyTextToClipboard = function (text) {
            MGWebKit.copyTextToClipboard(text)
        };

        // 获取iGenie目录
        me.getProgramFiles = function () {
            return MGWebKit.getProgramFiles();
        }
    }
};

_.extend(cefAPI, Backbone.Events);

module.exports = cefAPI;



