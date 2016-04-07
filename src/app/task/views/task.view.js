// 依赖
// -----------------------------------

/*@require task:toolbar.less*/
/*@require task:task.less*/

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
// 超级表格视图
var SuperGridView = require('common:superGrid.view');
// 标签页组件
var TabUI = require('ui:tab.ui');
// 页面视图
var PageView = require('common:page.view');
// 任务元素
var TaskItem = require('task:taskItem.view');
// 未完成任务列表实例
var processACInstance;
// 已经完成的任务列表实例
var completedACInstance;


var TaskViewCP = {
    TAB   : {
        PROCESS   : 'process',
        COMPLETED : 'completed'
    },
    CLASS : {
        disabled : 'disabled'
    }
};
var TaskView = PageView.extend({
    initialize           : function () {
        var me = this;
        var TaskCollectionModule = require('task:task.collection');
        // 未完成任务列表实例
        processACInstance = TaskCollectionModule.ProcessAppCollection.getInstance();
        // 已经完成的任务列表实例
        completedACInstance = TaskCollectionModule.CompletedAppCollection.getInstance();

        me.render();
        // 初始化dom元素
        me.initUI();

        // 初始化tab切换
        me.tab = new TabUI({
            el : me.$gridTab
        });

        // 初始化表格
        me.initGrid();
        me._hasEnter = false;
        me.on(PageView.EVENT.screenEnter, function () {
            me.processGrid.listenToCollection().update();
            me.completedGrid.listenToCollection().update();
        });
        me.on(PageView.EVENT.screenLeave,function(){
            me.processGrid.stopListeningCollection();
            me.completedGrid.stopListeningCollection();
        });

        // 检测Grid事件
        var SuperGridEVENTS = SuperGridView.EVENT;
        me.listenTo(me.processGrid, SuperGridEVENTS.ROW_SELECTED, this.rowSelectedHandler);
        me.listenTo(me.processGrid, SuperGridEVENTS.ROW_UNSELECTED, this.rowSelectedHandler);
        me.listenTo(me.processGrid, SuperGridEVENTS.ROW_SELECTED_ALL, this.rowSelectedHandler);


        me.listenTo(me.completedGrid, SuperGridEVENTS.ROW_SELECTED, this.rowSelectedHandler);
        me.listenTo(me.completedGrid, SuperGridEVENTS.ROW_UNSELECTED, this.rowSelectedHandler);
        me.listenTo(me.completedGrid, SuperGridEVENTS.ROW_SELECTED_ALL, this.rowSelectedHandler);

        // 检测安装中的容器的变化
        me.listenTo(processACInstance, 'add remove change:status', me.updateToolbarStatus);
        me.listenTo(processACInstance, 'add remove change:status', me.updateBlank);
        me.listenTo(processACInstance, 'add remove change:status', function(){
            me.$processAppsNum.text(processACInstance.length);
        });

        // 检测安装中的容器的变化
        me.listenTo(completedACInstance, 'add remove change:status', me.updateToolbarStatus);
        me.listenTo(completedACInstance, 'add remove change:status', me.updateBlank);
        me.listenTo(completedACInstance, 'add remove change:status', function(){
            me.$completedAppsNum.text(completedACInstance.length);
        });

        me.$processAppsNum.text(processACInstance.length);
        me.$completedAppsNum.text(completedACInstance.length);
        me.updateToolbarStatus();
        me.updateBlank();
    },
    events               : {
        'click .toolbar .folder'    : 'openDownloadFolder',
        'click .toolbar .pause'     : 'pauseHandler',
        'click .toolbar .continue'  : 'continueHandler',
        'click .toolbar .delete'    : 'deleteHandler',
        // tab单击
        'click [data-toggle="tab"]' : function (e) {
            var $target = $(e.currentTarget);
            if ($target.hasClass('process-apps')) {
                this.processGrid.setAllCheckboxDelegate(this.$allCheckbox);
                this.updateToolbarStatus();
            }
            if ($target.hasClass('completed-apps')) {
                this.completedGrid.setAllCheckboxDelegate(this.$allCheckbox);
                this.updateToolbarStatus();
            }
            this.updateBlank();
        }
    },
    ui                   : {
        // 处理中的app
        $processApps      : '.tab-process-apps',
        // 处理完成的app
        $completedApps    : '.tab-completed-apps',
        // 处理中的app数量
        $processAppsNum   : '.process-apps em.num',
        // 已经完成的数量
        $completedAppsNum : '.completed-apps em.num',
        // 标签容器
        $gridTab          : '.tab-with-grid',

        // 工具条

        // 全选按钮
        $allCheckbox      : '.toolbar .select-all',
        // 暂停按钮
        $pauseApps        : '.toolbar .pause',
        // 继续下载
        $continueApps     : '.toolbar .continue',
        // 删除
        $deleteApps       : '.toolbar .delete',
        // 打开文件夹
        $openFolder       : '.toolbar .folder',
        // 空白区域
        $taskBlank        : '.task-blank'
    },
    initGrid             : function () {
        var me = this;
        me.processGrid = new SuperGridView({
            el                   : me.$processApps,
            scheme               : [
                {
                    type  : 'checkbox',
                    width : 54
                },
                {
                    name  : '',
                    label : '',
                    type  : 'view',
                    width : 'flex',
                    view  : TaskItem
                }
            ],
            showLabel            : false,
            rowHeight            : 73,
            checkboxDelegate     : me.$allCheckbox,
            showCheckboxDelegate : false,
            collection           : processACInstance,
            multiSelectable      : false
        });
        me.processGrid.stopListeningCollection();

        me.completedGrid = new SuperGridView({
            el                   : me.$completedApps,
            scheme               : [
                {
                    type  : 'checkbox',
                    width : 54
                },
                {
                    name  : '',
                    label : '',
                    type  : 'view',
                    width : 'flex',
                    view  : TaskItem
                }
            ],
            showLabel            : false,
            rowHeight            : 73,
            showCheckboxDelegate : false,
            collection           : completedACInstance,
            multiSelectable      : false
        });
        me.processGrid.stopListeningCollection();

    },
    initUI               : function () {
        var me = this;
        _.each(this.ui, function (sel, key) {
            me[key] = me.$(sel);
        });
    },
    className            : 'i-task',
    partials             : {
        toolbar : __inline('../templates/toolbar.mustache')
    },
    template             : __inline('../templates/task.mustache'),
    rowSelectedHandler   : function () {
        this.updateToolbarStatus();
    },
    updateToolbarStatus  : function () {
        var me = this;
        var collection = this.getCurrentCollection();
        me.$pauseApps.toggleClass('disabled', !collection.canPause());
        me.$continueApps.toggleClass('disabled', !collection.canContinue());
        me.$deleteApps.toggleClass('disabled', !collection.canCancel());
    },
    updateBlank          : function () {
        var collection = this.getCurrentCollection();
        if (collection.length === 0) {
            this.$taskBlank.show();
        }
        else {
            this.$taskBlank.hide();
        }
    },
    isProcessTab         : function () {
        return this.$('.tab-nav>.active>a').hasClass('process-apps');
    },
    getCurrentCollection : function () {
        return this.isProcessTab() ? processACInstance : completedACInstance;
    },
    getCurrentGrid : function(){
        return this.isProcessTab() ? this.processGrid : this.completedGrid;
    },
    render               : function () {
        this.$el.html(this.template({}, {partials : this.partials}));
    },
    openDownloadFolder   : function () {
        var path = cefAPI.getMyDocumentPath() + '\\iGenie';
        MGWebKit.openFolder(path);
    },
    pauseHandler         : function (e) {
        var $target = $(e.currentTarget),
            collection = this.getCurrentCollection();
        if (!$target.hasClass('disabled')) {
            $target.addClass('disabled');
            this.stopListening(collection,'add remove change:status',this.updateToolbarStatus);
            this.stopListening(collection,'add remove change:status',this.updateBlank);
            if(this.isProcessTab()){
                collection.stopQueueCheck();
            }
            this.getCurrentCollection().doPause();
            if(this.isProcessTab()){
                collection.installingQueueCheck();
                collection.downloadingQueueCheck();
            }
            this.listenTo(collection,'add remove change:status',this.updateToolbarStatus);
            this.listenTo(collection,'add remove change:status',this.updateBlank);
            this.updateToolbarStatus();
        }
    },
    continueHandler      : function (e) {
        var $target = $(e.currentTarget),
            collection = this.getCurrentCollection();
        if (!$target.hasClass('disabled')) {
            $target.addClass('disabled');
            this.stopListening(collection,'add remove change:status',this.updateToolbarStatus);
            this.stopListening(collection,'add remove change:status',this.updateBlank);
            if(this.isProcessTab()){
                collection.stopQueueCheck();
            }
            this.getCurrentCollection().doContinue();
            if(this.isProcessTab()){
                collection.installingQueueCheck();
                collection.downloadingQueueCheck();
            }
            this.listenTo(collection,'add remove change:status',this.updateToolbarStatus);
            this.listenTo(collection,'add remove change:status',this.updateBlank);
            this.updateToolbarStatus();
        }
    },
    deleteHandler        : function (e) {
        var $target = $(e.currentTarget);
        var grid = this.getCurrentGrid(),
            collection = this.getCurrentCollection();
        if (!$target.hasClass('disabled')) {
            //$target.addClass('disabled');
            grid.stopListeningCollection();
            this.stopListening(collection,'add remove change:status',this.updateBlank);
            this.stopListening(collection,'add remove change:status',this.updateToolbarStatus);
            this.isProcessTab() && collection.stopQueueCheck();
            collection.doDelete();
            if(this.isProcessTab()){
                collection.installingQueueCheck();
                collection.downloadingQueueCheck();
            }
            this.listenTo(collection,'add remove change:status',this.updateBlank);
            this.listenTo(collection,'add remove change:status',this.updateToolbarStatus);
            grid.listenToCollection().update();
            this.updateBlank();
            this.updateToolbarStatus();
        }
    }
}, TaskViewCP);

module.exports = TaskView;