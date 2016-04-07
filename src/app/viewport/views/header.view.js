/**
 * Created by lidinghui on 14-9-3.
 */

/*@require viewport:header.less*/
var Backbone = require('backbone');
var cefAPI = require('common:libs/cefAPI');
var log = require('log');
var $ = Backbone.$;
var _ = require('underscore');
var eventCenter = require('common:libs/eventCenter');
var HeaderView = Backbone.View.extend({
    el            : '.i-header',
    template      : __inline('../templates/header.mustache'),
    initialize    : function () {
        this.render();
        // 窗口调整大小时候，重新换算可拖动区域
        $(window).on('resize', _.bind(this.computeNCArea, this));
    },
    events        : {
        'click a'                  : function (e) {
            e.preventDefault();
        },
        'click .toolbar-min'       : function () {
            cefAPI.getCurrentBackEnd().minimize();
        },
        'click .toolbar-max'       : function (e) {
            cefAPI.getCurrentBackEnd().maximize();
            $(e.currentTarget).hide();
            this.$('.toolbar-restore').css('display', 'inline-block');
        },
        'click .toolbar-restore'   : function (e) {
            cefAPI.getCurrentBackEnd().restore();
            $(e.currentTarget).hide();
            this.$('.toolbar-max').css('display', 'inline-block');
        },
        'click .toolbar-exit'      : function () {
            eventCenter.trigger(eventCenter.client.beforeClose);
            cefAPI.getCurrentBackEnd().close();
        },
        'click .i-history-back'    : function () {
            Backbone.history.history.back();
        },
        'click .i-history-refresh' : function () {
            // 刷新
            var IOSRouter = require('common:ios.router');
            var pageInfo = IOSRouter.getInstance().getPageInfo();
            // 触发更新
            eventCenter.trigger(pageInfo.view + '-refresh');
        },
        'click .i-history-forward' : function () {
            Backbone.history.history.forward();
        }
    },
    render        : function () {
        var html = this.template();
        this.$el.html(html);
    },
    computeNCArea : function () {
        var $history = this.$('.i-history'),
            $repairFlash = this.$('.i-btn-repair'),
            historyLeft = $history.offset().left,
            historyWidth = $history.width(),
            repairLeft = $repairFlash.offset().left;
        cefAPI.getCurrentBackEnd().nc = [{
            x  : historyLeft + historyWidth,
            y  : 0,
            cx : repairLeft - historyLeft - historyWidth,
            cy : 48
        }]
    }
}, {
    getInstance : function () {
        var Constructor = this;
        if (!Constructor._instance) {
            Constructor._instance = new Constructor();
        }
        return Constructor._instance;
    }
});

module.exports = HeaderView;