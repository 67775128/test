var Backbone = require('backbone');
var BaseView = require('common:base.view');
var _ = require('underscore');
var log = require('log');
var cefAPI = require('common:libs/cefAPI');
var eventCenter = require('common:libs/eventCenter');
var $ = require('jquery');

var PageViewCP = {
    EVENT : {
        screenEnter : 'screen-enter',
        screenLeave : 'screen-leave'
    },
    CLASS : {
        screenEnter : 'screen-enter',
        screenLeave : 'screen-leave'
    }
};
var empty = function () {
};
// 页面类的基类
var PageView = BaseView.extend({
    constructor        : function () {
        BaseView.apply(this, arguments);
        PageView.prototype.initialize.apply(this, arguments);
    },
    initialize         : function () {
        var me = this;
        var EVENT = PageViewCP.EVENT;
        var CLASS = PageViewCP.CLASS;
        me.on(EVENT.screenEnter, function () {
            me.$el.removeClass(CLASS.screenLeave).addClass(CLASS.screenEnter);
        }, me);
        me.on(EVENT.screenLeave, function () {
            me.$el.removeClass(CLASS.screenEnter).addClass(CLASS.screenLeave);
        }, me);
        // 视图入场
        me.on(EVENT.screenEnter, me.screenEnterHandler, me);
        // 视图离场
        me.on(EVENT.screenLeave, me.screenLeaveHandler, me);
        // 禁止鼠标右键菜单
        me.forbidContextMenu();
    },
    // 初始化所有的UI
    initUI             : function () {
        var me = this;
        _.each(this.ui, function (sel, key) {
            me[key] = me.$(sel);
        });
    },
    // 更新视图
    updateViewHandler  : empty,
    // 视图进入
    screenEnterHandler : empty,
    // 视图离开
    screenLeaveHandler : empty,
    // 禁止鼠标右键菜单
    forbidContextMenu : function(){
        $(document).on('contextmenu', function(e){
            //e.preventDefault();
            //return false;
        });
    }
}, PageViewCP);

module.exports = PageView;