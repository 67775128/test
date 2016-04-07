// 依赖
// -----------------------------------

// Backbone
var Backbone = require('backbone');
// 日志
var log = require('log');
// Underscore
var _ = require('underscore');
// 事件中心
var eventCenter = require('common:libs/eventCenter');
// API
var cefAPI = require('common:libs/cefAPI');
// serverAPI
var serverAPI = require('common:libs/serverAPI');
// 加载器
var LoadingUI = require('ui:loading.ui');
// 应用模型
var ApplicationModel = require('application:application.model');
// 超级表格容器
var SuperGridCollection = require('common:superGrid.collection');
// 业务代码
// ---------------------------------

// 应用容器静态属性
var ApplicationCollectionCP = {
    getInstance : function () {
        var Constructor = this;
        if (!this._instance) {
            this._instance = new Constructor();
        }
        return this._instance;
    }
};

// 应用容器
var ApplicationCollection = SuperGridCollection.extend({
    model : ApplicationModel,
    stopProcess:false,
    /**
     * 批量删除应用
     * @param array待删除的信息数组
     * @param start 删除的开始索引
     * @param total 删除的总数
     * */
    processUninstall:function(array,start,total){
           var me = this;
            if (start > total || total == 0 || array.length == 0 || this.stopProcess == true) {
                this.stopProcess = false;
                return;
            }
            var curData = array.shift();
            var curNum = start;    
            curData.destroy(function(){//删除成功
                curNum++;
                me.processUninstall(array,curNum,total);
                me.trigger("deleting",curNum,total,curData,true);
            },function(){//删除失败
                curNum++;
                me.processUninstall(array,curNum,total);  
                me.trigger("deleting",curNum,total,curData,false);              
            },{});   
    }
}, ApplicationCollectionCP);

// 本地应用容器静态属性
var LocalAppCollectionCP = {};
// 本地应用容器
var LocalAppCollection = ApplicationCollection.extend({
    initialize : function () {
        var me = this;
        // 全局通知  app安装成功
        this.listenTo(eventCenter, eventCenter.appInstallEvent.Success, me.appInstallSuccessHandler);
        // 检查更新
        this.listenTo(cefAPI, cefAPI.appEvent.AppUpgradeCheck, me.appUpgradeCheckHandler);
        // 图片更新
        this.listenTo(cefAPI, cefAPI.appEvent.AppIconFlush, me.appIconFlushHandler);
        // 大小更新
        this.listenTo(cefAPI, cefAPI.appEvent.AppUpdateSize, me.appSizeUpdateHandler);
        // 插入
        this.listenTo(cefAPI, cefAPI.appEvent.PlugIn, me.fetch);
        //
        this.listenTo(cefAPI, cefAPI.appEvent.PlugOff, me.empty);
        // 全局通知  app开始更新
        this.listenTo(eventCenter, eventCenter.appDownloadEvent.Start, me.appUpdateStartHandler);
    },
    empty      : function () {
        this.setFetched(false);
        this.reset();
    },
    // 获取数据
    fetch      : function () {
        var me = this;
        var loadingUI = LoadingUI.getInstance();
        if (this._fetched) return;
        this._fetched = true;
        loadingUI.show();
        // 获取app信息
        cefAPI.appInfo(function (data) {
            var json = JSON.parse(data || '{}');

            loadingUI.hide();
            if (!json.info || !json.info.list) {
                return;
            }
            json.info.list.sort(function (a, b) {
                var aName = a.appDisplayName || a.appBundleName;
                var bName = b.appDisplayName || b.appBundleName;
                return aName.localeCompare(bName);
            });
            me.reset(json.info.list, {parse : true});
        });
        return this;
    },
    appUpgradeCheckHandler   : function (res) {
        res || (res = []);
        var me = this,
            json = JSON.parse(res[1] || '{}'),
            appList = json && json.data && json.data.appList || [];


        if (appList.length) {
            _.each(appList, function (item, index) {
                var model = me.get(item.pkgId);
                if (model) {
                    model.set({
                        canUpdate : true,
                        ipaId     : item.ipaId,
                        iconUrl   : serverAPI.getIconPath(item.iconPath),
                        upName    : item.name || model.get('name')
                    });
                }
            });
        }
        me.trigger('fetchLocalOk');
    },
    appIconFlushHandler      : function (res) {
        res || (res = []);
        var me = this;
        var jsonStr = res[0],
            json = JSON.parse(jsonStr || '{}');
        var model = me.get(json.bundleId);
        if (!model.get('iconLoaded')) {
            model.unset('icon', {silent : true}).set('icon', json.icoPath);
        }
    },
    appInstallSuccessHandler : function (resp) {
        console.log("安装成功:",resp);
        if(resp.appInfo&&!this.get(resp.appInfo.appBundleID)){
            var model = new ApplicationModel({
                id        : resp.appInfo.appBundleID,
                name      : resp.appInfo.appDisplayName || resp.appInfo.appBundleName,
                appleID   : resp.appInfo.appAppleId,
                size      : resp.appInfo.appNstSize,
                dataSize  : resp.appInfo.appNdySize,
                version   : resp.appInfo.appVersion,
                canUpdate : false,
                updating:false,
                icon      : resp.appInfo.appIcoPath
            });
            this.push(model);
        }else if(resp.appInfo&&this.get(resp.appInfo.appBundleID)){
            var model = this.get(resp.appInfo.appBundleID);
            model.set({
                appleID   : resp.appInfo.appAppleId,
                size      : resp.appInfo.appNstSize,
                dataSize  : resp.appInfo.appNdySize,
                version   : resp.appInfo.appVersion,
                canUpdate : false,
                updating:false
            });
        }
        //this.setFetched(false);
    },
    
    appSizeUpdateHandler     : function (res) {
        res || (res = []);
        var me = this,
            json = JSON.parse(res[1] || '[]');

        _.each(json, function (app, index) {
            var model = me.get(app.appBundleID);
            if (model) {
                model.set({
                    size     : app.appNstSize,
                    dataSize : app.appNdySize
                });
            }
        });

    },
    // 标记是否已经被拉过
    setFetched               : function (bool) {
        this._fetched = bool;
        return this;
    },
    //开始更新应用
    appUpdateStartHandler : function(res){
         var model = this.get(res.bundleID);
         model&&model.set("updating",true);
    }
});

// 待更新应用容器静态属性
var UpdateAppCollectionCP = {};
// 待更新应用容器
var UpdateAppCollection = ApplicationCollection.extend({
    initialize : function () {
        var me = this;
        // 全局通知  app安装成功
        this.listenTo(eventCenter, eventCenter.appInstallEvent.Success, me.appInstallSuccessHandler);
        // 图片更新
        this.listenTo(cefAPI, cefAPI.appEvent.AppIconFlush, me.appIconFlushHandler);
        // 大小更新
        this.listenTo(cefAPI, cefAPI.appEvent.AppUpdateSize, me.appSizeUpdateHandler);
        // 插入
        this.listenTo(cefAPI, cefAPI.appEvent.PlugIn, me.fetch);
        //
        this.listenTo(cefAPI, cefAPI.appEvent.PlugOff, me.empty);
        //卸载
        this.listenTo(cefAPI, cefAPI.appEvent.AppUninstall, me.appUninstallHandler);
        // 全局通知  app开始更新
        this.listenTo(eventCenter, eventCenter.appDownloadEvent.Start, me.appUpdateStartHandler);        
    },
    empty      : function () {
        this.setFetched(false);
        this.reset();
    },
    // 获取数据
    fetch      : function () {
        var me = this;
        var canUpdates = LocalAppCollection.getInstance().where({canUpdate : true});
        var json = _.map(canUpdates, function (model) {
            return _.clone(model.attributes);
        });
        json.sort(function (a, b) {
            return a.name.localeCompare(b.name);
        });
        me.reset(json, {parse : false});
    },
    appIconFlushHandler      : function (res) {
        res || (res = []);
        var me = this;
        var jsonStr = res[0],
            json = JSON.parse(jsonStr || '{}');
        var model = me.get(json.bundleId);
        if (!model.get('iconLoaded')) {
            model.unset('icon', {silent : true}).set('icon', json.icoPath);
        }
    },    
    appSizeUpdateHandler     : function (res) {
        res || (res = []);
        var me = this,
            json = JSON.parse(res[1] || '[]');
            console.log("更新collection中监听size变化",res);
        _.each(json, function (app, index) {
            var model = me.get(app.appBundleID);
            if (model) {
                model.set({
                    size     : app.appNstSize,
                    dataSize : app.appNdySize
                });
            }
        });
    },    
    appUninstallHandler:function(res){
        res=JSON.parse(res[0]||{});
        if(res.appUninstallResult&&res.appBundleID&&this.get(res.appBundleID)){
            this.remove(this.get(res.appBundleID));
        }
    },
    update     : function (updateModel) {
        LocalAppCollection.getInstance().get(updateModel.get("pkgId")).set("updating", true);
        updateModel.set("updating", true);
    },
    setFetched : function (value) {
        this._fetched = value;
        return this;
    },
    //开始更新应用
    appUpdateStartHandler : function(res){
         var model = this.get(res.bundleID);
         model&&model.set("updating",true);
    },
    appInstallSuccessHandler : function (resp) {
        if(resp.appInfo&&this.get(resp.appInfo.appBundleID)){
            this.remove(this.get(resp.appInfo.appBundleID));
        }
    }
});


// 本地程序实例
exports.LocalAppCollection = LocalAppCollection;
// 待更新程序实例
exports.UpdateAppCollection = UpdateAppCollection;


