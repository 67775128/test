/**
 * Created by lidinghui on 14-9-3.
 */

/*@require viewport:sidebar.less*/

var Backbone = require('backbone');
var $ = Backbone.$;
var _ = require('underscore');
var eventCenter = require('common:libs/eventCenter');
var cefAPI = require('common:libs/cefAPI');
var log = require('log');
var SidebarViewCP = {
    getInstance : function () {
        var Constructor = this;
        if (!Constructor._instance) {
            Constructor._instance = new Constructor();
        }
        return Constructor._instance;
    }
};

var SidebarView = Backbone.View.extend({
    el         : '.i-sidebar',
    template   : __inline('../templates/sidebar.mustache'),
    events     : {
        'click a' : 'navHandler'
    },
    ui         : {
        $taskStatus  : '.sidebar-task .task-status',
        $sidebarHome : '.sidebar-home'
    },
    initialize : function () {
        var me = this;
        this.render();
        this.initUI();

        this.listenTo(eventCenter, eventCenter.processTaskEvent.Change, function (res) {
            var count = res.count;
            count ? me.$taskStatus.show() : me.$taskStatus.hide();
        });

        this.listenTo(cefAPI, cefAPI.appEvent.PlugIn, function () {
            me.activeNav(me.$sidebarHome);
        });
        this.listenTo(cefAPI, cefAPI.appEvent.PlugOff, function () {
            me.activeNav(me.$sidebarHome);
        });
        this.listenTo(eventCenter, eventCenter.resourcePage.Change, function () {
            $('.js-sidebar-apps').attr('href',window.location.hash)
        });
    },
    // 初始化所有的UI
    initUI     : function () {
        var me = this;
        _.each(this.ui, function (sel, key) {
            me[key] = me.$(sel);
        });
    },
    render     : function () {
        var html = this.template();
        this.$el.html(html);
    },
    navHandler : function (e) {
        var me = this;
        var $nav = $(e.currentTarget);
        if ($nav.hasClass('disabled')) {
            e.preventDefault();
        }
        else {
            me.activeNav($nav);
        }
    },
    activeNav  : function ($nav) {
        var me = this;
        if (!$nav.hasClass('active')) {
            me.$('a.active').removeClass('active');
            $nav.addClass('active');
        }
    },
    activeView : function (viewName) {
        var nav = viewName;
        if(viewName == 'app' ){
            nav = 'manage';
        }
        else if(viewName == 'resource'){
            nav = 'genie';
        }
        var $nav = this.$('.sidebar-' + nav);
        //log.assert($nav.length, '不存在nav');
        this.activeNav($nav);
    }
}, SidebarViewCP);

module.exports = SidebarView;