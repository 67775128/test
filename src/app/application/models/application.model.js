// 依赖
// ----------------------------------

// Backbone
var Backbone = require('backbone');
// Underscore
var _ = require('underscore');
// 日志
var log = require('log');
// CEF API
var cefAPI = require('common:libs/cefAPI');
// 字节格式化
var Bytes = require('common:libs/bytes');
// 超级表格模型
var SuperGridModel = require('common:superGrid.model');
var eventCenter = require('common:libs/eventCenter');

var TaskModel = require('task:task.model');
// 业务代码
// -------------------------

// 应用模型静态属性
var ApplicationModelCP = {
    BACKUP_STATUS : {
        // 备份成功
        BACKUP_SUCCESS    : 'BACKUP_SUCCESS',
        // 文件导出位置没有权限
        FILEEXPORT_FAILED : 'FILEEXPORT_FAILED',
        // 其他原因导出失败
        BACKUP_FAILED     : 'BACKUP_FAILED',
        // 导出时断开手机
        DEVICE_DISCONNECT : 'DEVICE_DISCONNECT'
    }
};

// 应用模型
var ApplicationModel = SuperGridModel.extend({
    // 默认值
    defaults          : {
        // 应用ID
        id           : '',
        // 应用本地图片
        icon         : '',
        // 应用网络图片
        iconUrl      : '',
        // iPA ID
        ipaId        : '',
        // 帐号
        appleID      : '',
        // 应用名称
        name         : '',
        // 更新的应用名称
        upName       : '',
        // 应用大小
        size         : 0,
        // 数据大小
        dataSize     : 0,
        // 版本
        version      : '',
        // 可以删除
        canUninstall : true,
        // 可以升级
        canUpdate    : false,
        // 图片是否已经加载完成
        iconLoaded   : false
    },


    // 销毁
    destroy           : function (success, fail, options) {
        var me = this;
        cefAPI.appUninstall(this.get('id'), function (res) {
            var json = JSON.parse(res || '{}');
            if (json.appUninstallResult) {
                me.trigger('destroy', me, me.collection, options);
                // 删除成功
                if (_.isFunction(success)) {
                    success();
                }
            }
            else {
                // 删除失败
                if (_.isFunction(fail)) {
                    fail();
                }
            }

        });
    },
    update            : function () {
        var me = this;
        //触发下载
        eventCenter.trigger(eventCenter.appDownloadEvent.Start, {
            // 下载的id
            ipaid : me.get('ipaId'),
            // 图片
            icon  : me.get('iconUrl'),
            // 文件名
            name  : me.get('upName'),
            //buddleID
            bundleID:me.get("id")
        });
    },
    // 解析
    parse             : function (resp, options) {

        /*var response = {
         "appBundleID": "4KSDE4UX92.com.netdania.quotelist",
         "appBundleName": "NetDania",
         "appDisplayName": "NetDania",
         "appIOSPath": "/private/var/mobile/Applications/3B04E998-2E5F-4CC0-8904-974BE329AE02/NetDania.app",
         "appIcoPath": "",
         "appMinimumOSVersion": "4.3",
         "appNdySize": 253952,
         "appNstSize": 16023552,
         "appType": "User",
         "appVersion": "3.2.1"
         };*/
        //        log.debug('MODEL PARSE appBundleID', resp.appBundleID);
        return {
            id        : resp.appBundleID,
            name      : resp.appDisplayName || resp.appBundleName,
            appleID   : resp.appAppleId,
            size      : resp.appNstSize,
            dataSize  : resp.appNdySize,
            version   : resp.appVersion,
            canUpdate : resp.canUpdate,
            icon      : resp.appIcoPath
        }
    },

    // 保存
    save              : function (path,callback) {
        var me = this;
        /**
         * appBackUpFinish
         * appBackUpResult
         * appBundleID
         * appProcess
         */
        var appID = this.get('id');
        var appName = this.get('name');
        var appFile = path + '\\' + appName + '.ipa';
        cefAPI.appBackup(appID, appFile, function (res) {
            res || (res = []);
            var status = res[0];
            var jsonStr = res[1];
           // console.log(status, me.getBackupErrorTip(status), jsonStr);
            //log.debug(status, me.getBackupErrorTip(status), jsonStr)
            callback&&callback(status,jsonStr);
        });
    },
    getBackupErrorTip : function (status) {
        var STATUS = ApplicationModelCP.BACKUP_STATUS;
        var tip;
        switch (status) {
            case STATUS.BACKUP_SUCCESS :
                tip = '备份成功';
                break;
            case STATUS.FILEEXPORT_FAILED :
                tip = '文件导出位置没有权限';
                break;
            case STATUS.BACKUP_FAILED :
                tip = '其他原因导出失败';
                break;
            case  STATUS.DEVICE_DISCONNECT :
                tip = '导出时断开手机';
                break;
            default :
                tip = '';
        }
        return tip;
    },
    sizeFormat        : function (size) {
        _.isUndefined(size) && (size = this.get('size'));
        return Bytes.format(size);
    }
}, ApplicationModelCP);

// 导出
// ----------------

// 应用模型
module.exports = ApplicationModel;
module.exports.ApplicationModelCP=ApplicationModelCP;