var BaseUI = require('ui:base.ui');
var $ = require('jquery');

var TabUICP = {
    DEFAULTS : {

    },
    CLASS    : {
        active      : 'active'
    },
    SEL : {
        navTabs     : '.tab-nav',
        contentTabs : '.tab-content',
        pane        : '.tab-pane'
    }
};
var TabUI = BaseUI.extend({
    events          : {
        'click [data-toggle="tab"]' : 'tabHandler'
    },
    className       : 'tab',
    initialize      : function (options) {
        this.initDomElements();
    },
    initDomElements : function () {
        var SEL = TabUICP.SEL;
        // 导航
        this.$navTabs = this.$(SEL.navTabs);
        // 内容
        this.$contentTabs = this.$(SEL.contentTabs);

    },
    tabHandler      : function (e) {
        var $tab = $(e.currentTarget),
            $li = $tab.parent(),
            contentSel = $tab.data('target'),
            $content = this.$contentTabs.find(contentSel),
            CLASS = TabUICP.CLASS;
        e.preventDefault();
        $li.siblings()
            .removeClass(CLASS.active)
            .end()
            .addClass(CLASS.active);
        $content.siblings()
            .removeClass(CLASS.active)
            .end()
            .addClass(CLASS.active);

    },
    active          : function (sel) {
        var CLASS = TabUICP.CLASS;
        this.$navTabs
            .find(sel)
            .addClass(CLASS.active);
    }
}, TabUICP);

module.exports = TabUI;