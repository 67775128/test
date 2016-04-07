/*@require ui:base.less*/
// IOS UI基类
var Backbone = require('backbone');

var BaseUICP = {
    CLASS : {
        showClass : 'base-show',
        hideClass : 'base-hide'
    },
    EVENT : {
        show   : 'base-show',
        shown  : 'base-shown',
        hide   : 'base-hide',
        hidden : 'base-hidden'
    },
    getInstance : function () {
        var View = this;
        if (!View._instance) {
            View._instance = new View();
        }
        return View._instance;
    }
};

var BaseUI = Backbone.View.extend({
    isShown       : null,
    constructor   : function () {
        Backbone.View.apply(this, arguments);
    },
    // 切换
    toggle        : function () {
        return this.isShown ? this.hide() : this.show();
    },
    // 展现
    show          : function () {
        var me = this,
            CLASS = this.constructor.CLASS,
            EVENT = this.constructor.EVENT;
        if (this.isShown) return this;
        this.trigger(EVENT.show);
        this.isShown = true;
        this.$el.one('webkitTransitionEnd transitionend', function () {
            me.trigger(EVENT.shown);
        });
        this._replaceClass(CLASS.hideClass, CLASS.showClass);
        return this;
    },
    // 隐藏
    hide          : function () {
        var me = this,
            CLASS = this.constructor.CLASS,
            EVENT = this.constructor.EVENT;
        if (!this.isShown) return this;
        this.trigger(EVENT.hide);
        this.isShown = false;
        this.$el.one('webkitTransitionEnd transitionend', function () {
            me.trigger(EVENT.hidden);
        });
        this._replaceClass(CLASS.showClass, CLASS.hideClass);
        return this;
    },
    _replaceClass : function (removeClass, addClass, $el) {
        $el || ($el = this.$el);
        $el.removeClass(removeClass)
            .addClass(addClass);
        return this;
    }
}, BaseUICP);

module.exports = BaseUI;