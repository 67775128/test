/*@require ui:dialog.less*/
var BaseUI = require('ui:base.ui');
var $ = require('jquery');
var Draggabilly = require('draggabilly');
var _ = require('underscore');

var DialogUICP = {
    DEFAULTS : {
    },
    CLASS    : {
        showClass  : 'dialog-show',
        hideClass  : 'dialog-hide',
        dialogOpen : 'dialog-open'
    },
    SEL      : {
        modalBody : '.modal-body'
    },
    TYPE     : {
        simple : 'dialog-simple',
        large  : 'dialog-large'
    },
    OPTIONS  : ['title', 'contentHTML'],
    getInstance : function () {
        var View = this;
        if (View._instance) {
            View._instance.hide();
            View._instance.remove();
        }
        View._instance = new View();
        return View._instance;
    }
};
var DialogUI = BaseUI.extend({
    events              : {
        'click [data-dismiss="dialog"]' : 'hide'
    },
    template            : __inline('../templates/dialog.mustache'),
    className           : 'dialog',
    initialize          : function (options) {
        options || (options = {});
        options = _.defaults(options, DialogUICP.DEFAULTS);
        
        this.$el.addClass(options.type || DialogUICP.TYPE.simple);
        options = _.pick(options, DialogUICP.OPTIONS);
        _.extend(this, options);
        this.$el.appendTo(document.body);
        this._ensureBodyOverflow();
        if (options.render) {
            this.render();
        }

    },
    _ensureBodyOverflow : function () {
        var _this = this;
        this.on(BaseUI.EVENT.show, function () {
            $(document.body).addClass(DialogUICP.CLASS.dialogOpen);
        });
        this.on(BaseUI.EVENT.hide, function () {
            _this.trigger("close");
            $(document.body).removeClass(DialogUICP.CLASS.dialogOpen);
        });
    },
    render              : function (options) {
        options || (options = {});
        options = _.pick(options, DialogUICP.OPTIONS);
        _.extend(this, options);
        var html = this.template({
            title       : this.title
        });
        this.$el.html(html);
        this.$body = this.$(DialogUICP.SEL.modalBody);
        if(this.contentHTML){
            this.$body.html(this.contentHTML);
        }
        var elem = this.$el.find('.modal-content')[0];
        var draggie = new Draggabilly( elem, {
          containment: this.$el[0],
          handle: '.modal-title'
        });
        return this;
    }
}, DialogUICP);

module.exports = DialogUI;
