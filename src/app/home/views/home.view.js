// 依赖
// ----------------------

/*@require home:home.less*/
/*@require ui:button.less*/
/*@require home:mustHave.less*/

// Backbone
var Backbone = require('backbone');
// 页面基类
var PageView = require('common:page.view');
var _ = require('underscore');
// 驱动视图
var DeviceView = require('home:device.view');
// 磁盘容量视图
var DiskView = require('home:disk.view');
var eventCenter = require('common:libs/eventCenter');
// CEF API
var Dialog = require('ui:dialog.ui');
var cefAPI = require('common:libs/cefAPI');
var serverAPI = require('common:libs/serverAPI');

// 日志
var log = require('log');
// Tab切换
var tab = require('bootstrap:tab');

// 业务逻辑代码
// --------------------


var HomeViewCP = {
    CLASS: {
        iPad  : 'i-screenshot-ipad',
        iPhone: 'i-screenshot-iphone',
        iPod  : 'i-screenshot-ipod',
        iWatch: 'i-screenshot-iwatch'
    }
};

// 首页
var HomeView = PageView.extend({
    // 基本类名
    className : 'i-home',
    // 初始化函数
    initialize: function () {
        var me = this;
        // 屏幕截图
        this.render();
        this.initUI();
        this.$('a.system-tab-must').on('show.bs.tab', _.bind(this.loadMustHaveHandler, this));

        this.deviceView = new DeviceView({
            el: this.$('.i-device')
        });
        this.diskView = new DiskView({
            el: this.$('.i-disk')
        });
        // 已获取到设备信息
        this.listenTo(cefAPI,cefAPI.appEvent.PlugIn,me.plugInHandler);
        // 检测磁盘容量
        this.listenTo(cefAPI,cefAPI.appEvent.DiskinfoChange,me.diskInfoHandler);

    },

    events: {
        'click .confirm-name'      : 'confirmDeviceName',
        'click .edit-name'         : 'editDeviceName',
        'blur .device-name'        : 'confirmDeviceName',
        'click .mainmenu-genie'        : 'iosIgenieInstall',
        'click [data-toggle="tab"]': function (e) {
            e.preventDefault();
            $(e.currentTarget).tab('show');
        }
    },

    ui: {
        $screenShot   : '.i-screenshot',
        /*装机必备app*/
        $mustAppList  : '.must-have-app .must-have-app-list',
        $mustAppCount : '.must-have-app .app-count',
        /*装机必备Game*/
        $mustGameList : '.must-have-game .must-have-game-list',
        $mustGameCount: '.must-have-game .game-count',

        $nameControl  : '.i-name',
        $deviceName   : '.i-name .device-name',
        $editButton   : '.i-name .edit-name',
        $confirmButton: '.i-name .confirm-name'


    },

    setScreenType: function (productType) {
        var CLASS = HomeViewCP.CLASS,
            $el = this.$screenShot;
        if (/^iphone/ig.test(productType)) {
            $el.addClass(CLASS.iPhone);
            $el.removeClass(CLASS.iPad);
            $el.removeClass(CLASS.iPod);
        }
        else if (/^ipad/ig.test(productType)) {
            $el.addClass(CLASS.iPad);
            $el.removeClass(CLASS.iPhone);
            $el.removeClass(CLASS.iPod);
        }
        else if (/^ipod/ig.test(productType)) {
            $el.addClass(CLASS.iPod);
            $el.removeClass(CLASS.iPhone);
            $el.removeClass(CLASS.iPad);
        }
    },
    iosIgenieInstall:function() {
        var me = this;
        var dialog,
            tpl = __inline('../templates/igenieDialog.mustache');
        if(cefAPI.isConnect()){
            // 第一步
            dialog = Dialog.getInstance().render({
                title       : 'iGenie for iOS',
                contentHTML : tpl({stepOne : true})
            }).show();
            var $repairFlash = dialog.$('.repair-flash');
            $repairFlash.on('click', '.install-iGenie', function () {
                var IOSRouter = require('common:ios.router');
                eventCenter.trigger(eventCenter.appInstallEvent.Import, [cefAPI.getProgramFiles()+'\\iGenie\\iGenieHelper.ipa']);
                var lang = IOSRouter.getPageInfo().language;
                IOSRouter.getInstance().navigate("lang/"+lang+"/task", true);
            })
        }
        else{
            dialog = Dialog.getInstance().render({
                title : 'Notice',
                contentHTML : __inline('../../viewport/templates/connectTip.mustache')
            }).show();
        }
    },
    confirmDeviceName: function () {
        var me = this,
            newDeviceName = this.$deviceName.val();
            if(this.$deviceName.attr('readonly')){
                return;
            }
            cefAPI.deviceRename(newDeviceName, function (data) {
                me.displayDeviceName();
            });
    },
    displayDeviceName: function () {
        this.$confirmButton.hide();
        this.$editButton.show();
        this.$deviceName.attr('readonly', true).removeClass('editing');
    },
    editDeviceName   : function () {
        this.$editButton.hide();
        this.$confirmButton.show();
        this.$deviceName.attr('readonly', false).addClass('editing').focus();
    },
    showDeviceName   : function (name) {
        this.$deviceName.val(name);
    },
    loadMustHaveHandler: function (e) {
        var me = this,
            mustHaveTpl = __inline('../templates/mustHave.mustache');
        // 回调函数
        serverAPI.getHomeRecommendApps(function (data) {
            var html, list;
            if (data && data.ipaList && data.ipaList.length) {
                list = data.ipaList.slice(0, 4);
                html = mustHaveTpl({
                    data       : list,
                    // 获取Icon地址
                    getIconPath: function () {
                        return serverAPI.getIconPath(this.iconPath);
                    }
                });
                me.$mustAppCount.text(list.length);
                me.$mustAppList.html(html);
            }
        });
        serverAPI.getHomeRecommendGames(function (data) {
            var html, list;
            if (data && data.ipaList && data.ipaList.length) {
                list = data.ipaList.slice(0, 4);
                html = mustHaveTpl({
                    data       : list,
                    // 获取Icon地址
                    getIconPath: function () {
                        return serverAPI.getIconPath(this.iconPath);
                    }
                });
                me.$mustGameCount.text(list.length);
                me.$mustGameList.html(html);
            }
        })
    },
    template      : __inline('../templates/home.mustache'),
    plugInHandler : function(data){
        var me = this,
            json, info, productType;
        me.deviceId = data[0];
        if (data && data.length) {
            json = JSON.parse(data[1] || '{}');
            info = json.info || {};
            // 产品类型
            productType = info.ProductType || '';
            me.deviceView.model.set(me.deviceView.model.parse(info));
            info && me.showDeviceName(info.DeviceName);
            me.setScreenType(productType);
        }
    },
    diskInfoHandler : function(data){
        data || (data = []);
        var me = this;
        if (data && data.length) {
            var json = JSON.parse(data[1] || '{}');
            var info = me.diskView.model.parse(json.info);
            me.diskView.model.set(info);
        }
    },
    render        : function () {
        var html = this.template();
        this.$el.html(html);
    }
});


module.exports = HomeView;