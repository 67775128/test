// 依赖
// ------------------------------------

/*@require application:toolbar.less*/
/*@require application:application.less*/
/*@require ui:button.less*/
/*@require application:exportDialog.less*/

// Backbone
var Backbone = require('backbone');
// jQuery
var $ = Backbone.$;
// Underscore
var _ = require('underscore');
// 日志
var log = require('log');
// CEF API
var cefAPI = require('common:libs/cefAPI');
// 事件中心
var eventCenter = require('common:libs/eventCenter');
// 页面基类
var PageView = require('common:page.view');
// 超级表格基类
var SuperGridView = require('common:superGrid.view');
// 应用容器模块
var AppCollectionsModule = require('application:application.collection');

//国际化组件
var i18nDi=require("common:libs/i18n");
//
var ApplicationModel=require('application:application.model');
// 本地应用实例
var localACInstance;
// 待更新应用实例
var updateACInstance;
// 进度条UI
var ProgressUI = require('ui:progress.ui');
// 模态窗口UI
var DialogUI = require('ui:dialog.ui');
// 标签页UI
var TabUI = require('ui:tab.ui');
// 导出对话框模板
var exportDialogTpl = __inline('../templates/exportDialog.mustache');

var Dialog = require('ui:dialog.ui');

// 业务代码
// ---------------------------------------

// 应用视图的静态属性
var ApplicationViewCP = {
    // CSS选择器
    SEL  : {
        // 本地app
        localApps    : '.tab-local-apps',
        // 可升级App
        updateApps   : '.tab-update-apps',
        // 选中全部
        allCheckbox  : '.toolbar .select-all',
        // 导出App
        exportApps   : '.toolbar .export',
        // 删除app
        uninstallApps: '.toolbar .uninstall',
        // 本地app数量
        localAppsNum : '.local-apps em.num',
        // 可升级app数量
        updateAppsNum: '.update-apps em.num',
        // 打开文件夹
        openFolder   : '.open-folder',
        // 标签容器
        gridTab      : '.tab-with-grid',  
        //升级全部
        updateAllBtn:'.toolbar .update'
    },
    TAB  : {
        // 本地
        LOCAL : 'local',
        // 可升级
        UPDATE: 'update'
    },
    // 样式类
    CLASS: {
        // 禁用样式
        disabled: 'disabled'
    },
    // 自定事件
    EVENT: {
        // app刷新
        refresh: 'app-refresh'
    }
};

// 应用视图
var ApplicationView = PageView.extend({
    // 初始化函数
    initialize           : function () {
        var me = this;

        localACInstance = AppCollectionsModule.LocalAppCollection.getInstance();
        updateACInstance = AppCollectionsModule.UpdateAppCollection.getInstance();
        this.tabActive = ApplicationViewCP.TAB.LOCAL;
        // 渲染
        me.render();
        // 初始化Dom元素
        me.initDomElements();
        // 初始化表格
        me.initGrid();
        // 初始化tab切换
        me.tab = new TabUI({
            el: me.$gridTab
        });

        // 全局事件观察刷新事件
        eventCenter.on(ApplicationViewCP.EVENT.refresh, function () {
            localACInstance.setFetched(false).fetch();
            localACInstance.off("fetchLocalOk").on("fetchLocalOk",function(){
                updateACInstance.fetch();   
            });
        });

        // 检测Grid事件
        var SuperGridEVENTS = SuperGridView.EVENT;
        me.listenTo(me.localGrid, SuperGridEVENTS.ROW_SELECTED, this.rowSelectedHandler);
        me.listenTo(me.localGrid, SuperGridEVENTS.ROW_UNSELECTED, this.rowSelectedHandler);
        me.listenTo(me.localGrid, SuperGridEVENTS.ROW_SELECTED_ALL, this.rowSelectedHandler);


        me.listenTo(me.updateGrid, SuperGridEVENTS.ROW_SELECTED, this.rowSelectedHandler);
        me.listenTo(me.updateGrid, SuperGridEVENTS.ROW_UNSELECTED, this.rowSelectedHandler);
        me.listenTo(me.updateGrid, SuperGridEVENTS.ROW_SELECTED_ALL, this.rowSelectedHandler);

        // 监听本地容器变化
        me.listenTo(localACInstance, 'add remove reset', function () {
            me.$localAppsNum.text(localACInstance.length);
            me.rowSelectedHandler();
        });

        // 监听可升级容器变化
        me.listenTo(updateACInstance, 'add remove reset', function () {
            me.$updateAppsNum.text(updateACInstance.length);
            me.rowSelectedHandler();
        });


        me.listenTo(cefAPI, cefAPI.appEvent.AppBackupProgress, me.backupProgressHandler);
    },
    _finishCount         : 0,
    // 初始化Dom元素
    initDomElements      : function () {
        var me = this;
        var SEL = ApplicationViewCP.SEL;
        // 本地表格
        me.$localGridEl = me.$(SEL.localApps);
        // 可升级表格
        me.$updateGridEl = me.$(SEL.updateApps);
        // 本地应用数量
        me.$localAppsNum = me.$(SEL.localAppsNum);
        // 可升级应用数量
        me.$updateAppsNum = me.$(SEL.updateAppsNum);
        // 选中全部
        me.$allCheckbox = me.$(SEL.allCheckbox);
        // 删除app
        me.$uninstallApps = me.$(SEL.uninstallApps);
        // 导出app
        me.$exportApps = me.$(SEL.exportApps);
        // 标签
        me.$gridTab = me.$(SEL.gridTab);
        //更新所有
        me.$updateAllBtn=me.$(SEL.updateAllBtn);
    },

    // 初始化超级表格
    initGrid             : function () {
        var me = this,
            // App元素视图
            AppItem = require('application:appItem.view');
        // 本地应用程序表格
        me.localGrid = new SuperGridView({
            el                  : me.$localGridEl,
            scheme              : [
                {
                    type : 'checkbox',
                    width: 54
                },
                {
                    name : '',
                    label: '',
                    type : 'view',
                    width: 'flex',
                    view : AppItem
                }
            ],
            showLabel           : true,
            rowHeight           : 73,
            collection          : localACInstance,
            checkboxDelegate    : me.$allCheckbox,
            showCheckboxDelegate: false,
            multiSelectable     : false
        });
        me.updateGrid = new SuperGridView({
            el        : me.$updateGridEl,
            scheme    : [
                {
                    type : 'checkbox',
                    width: 54
                },
                {
                    name : '',
                    label: '',
                    type : 'view',
                    width: 'flex',
                    view : AppItem
                }
            ],
            showLabel : true,
            rowHeight : 73,
            collection: updateACInstance,
            showCheckboxDelegate: false,
            multiSelectable     : false
        });
        var headerHTML = __inline('../templates/gridHead.mustache')();
        me.localGrid.$('header .i-grid-label:last').css('display', 'block').html(headerHTML);
        me.updateGrid.$('header .i-grid-label:last').css('display', 'block').html(headerHTML);
    },

    // 代理事件
    events               : {
        // 单击导出
        'click .toolbar .export'   : 'exportHandler',
        // 单击删除
        'click .toolbar .uninstall': 'multiUninstallHandler',
        // 单击安装
        'click .toolbar .install'  : 'importAppsHandler',
        'click .toolbar .update':'updateAllHandler',
        // tab单击
        'click [data-toggle="tab"]': function (e) {
            var $target = $(e.currentTarget);
            if ($target.hasClass('local-apps')) {
                this.tabActive=ApplicationViewCP.TAB.LOCAL;
                this.localGrid.setAllCheckboxDelegate(this.$allCheckbox)
            }
            if ($target.hasClass('update-apps')) {
                this.tabActive=ApplicationViewCP.TAB.UPDATE;
                this.updateGrid.setAllCheckboxDelegate(this.$allCheckbox)
            }
            this.rowSelectedHandler();
        }
    },

    // 容器的类
    className            : 'i-application',

    // 子模板
    partials             : {
        // 工具条模板
        toolbar: __inline('../templates/toolbar.mustache')
    },

    // 主模板
    template             : __inline('../templates/application.mustache'),

    // 渲染函数
    render               : function () {
        this.$el.html(this.template({}, {partials: this.partials}));
    },
    getCurrentCollection:function(){
        if(this.tabActive==ApplicationViewCP.TAB.UPDATE){
            return updateACInstance;
        }else {
            return localACInstance;
        }
    },
    // 导出App处理器
    exportHandler        : function (e) {
        var me = this;
        e.preventDefault();
        me._finishCount=0;
        me.backupFailedList=[];
        me.stopExport=false;
        var disabledClass = ApplicationViewCP.CLASS.disabled;
        if ($(e.currentTarget).hasClass(disabledClass)) return;
        cefAPI.selectFolder('请选择存放的目录', function (data) {
            var path = data.length ? data[0] : '';
            if (!path) return;
            me.exportPath = path;
            var ACInstance = me.getCurrentCollection();
            var selectedModels = ACInstance.where({selected: true});
            var dataArray = _.map(selectedModels, function (model) {
                return {
                    id: model.get('id')
                }
            });
            me.progressUI = new ProgressUI({
                data: dataArray
            });
            var dialog = DialogUI.getInstance().render({
                title      : 'Exporting',
                contentHTML: exportDialogTpl({start: true,title:"Exporting, please keep your device connected"})
            });
            dialog.$('.process-wrap').html(me.progressUI.$el);
            dialog.show();
            dialog.$(".btn-light[data-dismiss=dialog]").addClass("btn-cancel");
            dialog.on("close",function(event){
                me.stopExport=true;
                me.stopExportIndex=me._finishCount;
            });
            dialog.$(".btn-cancel").bind("click",function(event){
                me.stopExport=true;
            });
          selectedModels[0].save(path,function(status,resInfo){
               var STATUS = ApplicationModel.ApplicationModelCP.BACKUP_STATUS;
               if(status==STATUS.FILEEXPORT_FAILED||status==STATUS.BACKUP_FAILED||status==STATUS.DEVICE_DISCONNECT){
                   me.backupFailedList.push(selectedModels[0]);
               }
           });
            dialog.listenToOnce(cefAPI,cefAPI.appEvent.PlugOff,function(){
                dialog && dialog.hide() && dialog.remove();
            });
        });
    },
    backupProgressHandler: function (data) {
        var me = this,
            json = JSON.parse(data || '{}');
            if(this.stopExport){
                return;
            }
        var ACInstance = me.getCurrentCollection();
        var selectedModels = ACInstance.where({selected: true});
        var max = selectedModels.length;
        if (1 == parseInt(json.appBackupFinish, 10)) {
            me.progressUI.collection.set({
                id     : json.appBundleID,
                percent: 100 / max
            });
            me._finishCount++;
            if(!me.stopExport&&selectedModels[me._finishCount]){
                selectedModels[me._finishCount].save(me.exportPath,function(status,resInfo){
                   var STATUS = ApplicationModel.ApplicationModelCP.BACKUP_STATUS;
                   if(status==STATUS.FILEEXPORT_FAILED||status==STATUS.BACKUP_FAILED||status==STATUS.DEVICE_DISCONNECT){
                       me.backupFailedList.push(selectedModels[me._finishCount]);
                   }
             });
                return;
            }
        }
        else {
            me.progressUI.collection.set({
                id     : json.appBundleID,
                percent: json.appProcess / max
            });
        }
        if ((me._finishCount === selectedModels.length)&&me._finishCount!=0) {
            var dialog = DialogUI.getInstance();
            if(me.backupFailedList.length>0){
                var failedListDom="";
                for(var i=0;i<me.backupFailedList.length;i++){
                    failedListDom+="-"+me.backupFailedList[i].get("name")+"<br/>";
                }
                dialog.render({
                    title      : i18nDi.getI18nValue("application.exportFailedLabel"),
                    contentHTML: exportDialogTpl({failed: true,title:i18nDi.getI18nValue("application.exportingFailedTitle")})
                }).show(); 
                dialog.$('.failedInfo').html(failedListDom);               
            }else{
                dialog.render({
                    title      : i18nDi.getI18nValue("application.exportSuccessLabel"),
                    contentHTML: exportDialogTpl({success: true,title:i18nDi.getI18nValue("application.exportSuccessTitle",[max])})
                }).show();
                dialog.$('.open-folder').click(function () {
                    // 开发目录
                    cefAPI.openFolder(me.exportPath);
                });                
            }

        }
    },

    // 删除多个App处理函数
    multiUninstallHandler: function (e) {
        var me = this;
        var failedList=[];
        var disabledClass = ApplicationViewCP.CLASS.disabled;
        if ($(e.currentTarget).hasClass(disabledClass)) return;
        var collection=me.getCurrentCollection();
        var selectedModels = collection.where({selected: true});
         console.log("字典信息"+i18nDi.getI18nValue("application.confirmLabel"));
        var dialog = Dialog.getInstance().render({
            title      : i18nDi.getI18nValue("application.confirmLabel")||'Comfirm',
            contentHTML: __inline('../templates/uninstallDialog.mustache')({
                // 开始
                start: true,
                title:i18nDi.getI18nValue("application.sureDeleteTitle")
            })
        }).show();

        dialog.$el.on('click', '.delete', function () {
            dialog.render({
                contentHTML: __inline('../templates/uninstallDialog.mustache')({
                    // 删除中
                    deleting: true,
                    title:i18nDi.getI18nValue("application.uninstallingTitle")
                })
            });
            var progressUI = new ProgressUI({
                type : ProgressUI.TYPE.status,
                data : [
                    {
                        id     : '1',
                        percent: 0
                    }
                ] 
            });
            dialog.$el.find(".current-sp").html(0);
            dialog.$el.find(".total-sp").html(selectedModels.length);     
            dialog.$('.process-wrap').html(progressUI.$el);
            collection.on("deleting",function(current,total,model,success){
                progressUI.collection.set({
                    id     : '1',
                    percent: (current / total)*100
                });
                dialog.$el.find(".current-sp").html(current);
                dialog.$el.find(".total-sp").html(total);         
                if(current==total){
                    dialog.hide();
                }       
            });
            collection.processUninstall(selectedModels,0,selectedModels.length);
        });


    },
    //全部更新
    updateAllHandler:function(){
       for(var i=0;i<updateACInstance.models.length;i++){
           updateACInstance.models[i].update();
       }  
    },
    // 行选择处理函数
    rowSelectedHandler   : function (ev) {
        var me = this;
        var disabledClass = ApplicationViewCP.CLASS.disabled;
        if ((localACInstance.hasSelected()&&(this.tabActive==ApplicationViewCP.TAB.LOCAL))||(updateACInstance.hasSelected()&&(this.tabActive==ApplicationViewCP.TAB.UPDATE))) {
            me.$uninstallApps.removeClass(disabledClass);
            me.$exportApps.removeClass(disabledClass);
        }
        else {
            me.$uninstallApps.addClass(disabledClass);
            me.$exportApps.addClass(disabledClass);
        }
        if(updateACInstance.models.length>0){
            me.$updateAllBtn.removeClass(disabledClass);
        }else{
            me.$updateAllBtn.addClass(disabledClass);
        }
    },

    // 安装本地应用
    importAppsHandler    : function (e) {
        var disabledClass = ApplicationViewCP.CLASS.disabled;
        if ($(e.currentTarget).hasClass(disabledClass)) return;
        // 打开默认的文件夹 - 我的文档
        var defaultDir = cefAPI.getMyDocumentPath();
        cefAPI.openFileDialog(1, '选择IPA', '', ['ipa(*.ipa)|*.ipa'], function (ipaPaths) {
            ipaPaths || (ipaPaths = []);
            // 选中了文件
            if (ipaPaths.length && ipaPaths[0]) {
                // 导入
                eventCenter.trigger(eventCenter.appInstallEvent.Import, ipaPaths);
                var IOSRouter = require('common:ios.router');
                IOSRouter.getInstance().navigate('lang/english/task', {trigger: true});
            }
            else {
                // 未选中文件
            }
        }, defaultDir);
    },

    // 入场处理器
    screenEnterHandler   : function () {
        localACInstance.fetch();
        localACInstance.off("fetchLocalOk").on("fetchLocalOk",function(){
            updateACInstance.fetch();
        });
        this.rowSelectedHandler();
    },

    // 更新视图处理器
    updateViewHandler    : function () {
        localACInstance.reset();
        localACInstance.setFetched(false).fetch();
        localACInstance.off("fetchLocalOk").on("fetchLocalOk",function(){
            updateACInstance.reset();
            updateACInstance.fetch();   
        });        
        this.rowSelectedHandler();
    },

    // 析构处理器
    deallocHandler       : function () {
        localACInstance.reset();
        localACInstance.setFetched(false);
    }

}, ApplicationViewCP);


module.exports = ApplicationView;
