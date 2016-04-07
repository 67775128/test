var Backbone = require('backbone');
var cefAPI = require('common:libs/cefAPI');
var PageView = require('common:page.view');
var ViewportView = require('viewport:viewport.view');

var HomeView = require('home:home.view');
var WelcomeView = require('viewport:welcome.view');
var ApplicationView = require('application:application.view');
var TaskView = require('task:task.view');
var eventCenter = require('common:libs/eventCenter');
var i18n = require('common:libs/i18n');
// Resource
var $ = Backbone.$;
var SideBarView = require('viewport:sidebar.view');
var log = require('log');
var LoadingUI = require('ui:loading.ui');

var IOSRouterCA = {
    CLASS      : {
        screenIn : 'i-page-screen-in',
        screenOut: 'i-page-screen-out'
    },
    EVENT      : {
        beforeChange: '',
        afterChange : '',
        screenIn    : 'screen-in',
        screenOut   : 'screen-out'
    },
    getInstance: function () {
        var Constructor = this;
        if (!this._instance) {
            this._instance = new Constructor();
        }
        return this._instance;
    }
};

var IOSRouter = Backbone.Router.extend({
    initialize       : function () {
        var me = this;
        i18n.switchLanguage();
        // 初始化CEF
        // 默认初始化
        me.initViews();
        me.initModels();
        me.bindDeviceEvent();
        // 初始化
        cefAPI.init();
        // 检测iTunes 是否安装
        cefAPI.checkItunesInstalled(function (data) {
            data || (data = []);
            var isInstalled = parseInt(data[0] || 0, 10) == 1;
            if (isInstalled) {
                cefAPI.bootstrap();
            }
            else {
                me.viewport.tipInstalliTunes();
            }
        });
        me.clientRouter();
    },
    initViews        : function () {
        var me = this;
        // 初始化home 视图
        HomeView.getInstance();
        me.viewport = ViewportView.getInstance();
        me.sidebar = SideBarView.getInstance();
    },
    initModels       : function () {
        var me = this;
        var taskCollectionModule = require('task:task.collection');
        me.taskCollection = taskCollectionModule.ProcessAppCollection.getInstance();
        me.processCollection = taskCollectionModule.CompletedAppCollection.getInstance();
    },
    bindDeviceEvent  : function () {
        var me = this;
        // 链接
        this.listenTo(cefAPI, cefAPI.appEvent.Connecting, me.connectingHandler);
        // 获取设备信息后
        this.listenTo(cefAPI, cefAPI.appEvent.PlugIn, me.pluginInHandler);
        // 断开
        this.listenTo(cefAPI, cefAPI.appEvent.PlugOff, me.plugOffHandler);
        // 检测是否获得信任
        this.listenTo(cefAPI, cefAPI.appEvent.NotTrusted, me.notTrustedHandler);
    },
    connectingHandler: function () {
        var me = this;
        //me.navigate('lang/english', {trigger : true, replace : true});
    },
    pluginInHandler  : function () {
        var me = this;
        me.navigate('lang/english', {trigger: true, replace: true});
    },
    plugOffHandler   : function () {
        var me = this;
        me.navigate('lang/english/welcome', {trigger: true, replace: true});
    },
    notTrustedHandler: function () {
        ViewportView.getInstance().tipTrust();
    },
    changePage       : function (pageView, callback) {
        var me = this;
        if (me.currentView == pageView) return;
        if (me.currentView) {
            me.currentView.trigger(PageView.EVENT.screenLeave);
        }
        LoadingUI.getInstance().hide();
        me.currentView = pageView;
        me.viewport.addContentView(pageView);
        me.currentView.trigger(PageView.EVENT.screenEnter);
    },


    recordResourcePage:function(){

    },
    //isPublicLoaded:false,
    isPublicLoaded:true,
    resourceRouter:function(language,module,page,query,state){


    },
    clientRouter     : function (language, view) {
        var ViewConstructor;
        if (!cefAPI.isConnect()) {
            if (!view || view == 'home' || view == 'app') {
                view = 'welcome';
            }
        }
        switch (view) {
            case 'home' :
                ViewConstructor = HomeView;
                this.viewport.removeCover();
                break;
            case 'app' :
                ViewConstructor = ApplicationView;
                this.viewport.addCover();
                break;
            case 'task' :
                ViewConstructor = TaskView;
                this.viewport.addCover();
                break;
            case 'welcome' :
                ViewConstructor = WelcomeView;
                this.viewport.removeCover();
                break;
            default  :
                ViewConstructor = HomeView;
                this.viewport.removeCover();
        }
        this.setPageInfo(language, view);
        this.changePage(ViewConstructor.getInstance());

    },
    setPageInfo      : function (language, view) {
        this._pageInfo = {
            language: language || 'english',
            view    : view || 'home'
        };
        this.sidebar.activeView(this._pageInfo.view);
    },
    getPageInfo      : function () {
        return this._pageInfo || {}
    },
    routes           : {
        'lang/:language'                                     : 'clientRouter',
        'lang/:language/:view'                               : 'clientRouter',
        'lang/:language/resource/:module/:page'              : 'resourceRouter',
        'lang/:language/resource/:module/:page/:query'       : 'resourceRouter',
        'lang/:language/resource/:module/:page/:query/:state': 'resourceRouter'
        //,
        //'*all'                                               : 'clientRouter'

    }
}, IOSRouterCA);


module.exports = IOSRouter;