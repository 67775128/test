/*@require ui:loading.less*/
var BaseUI = require('ui:base.ui');
var $ = require('jquery');

var LoadingUI = BaseUI.extend({
    initialize : function(){
        this.$el.appendTo(document.body);
        this._ensureBodyOverflow();
        this.render();
    },
    className : 'loading',
    template : __inline('../templates/loading.mustache'),
    render : function(){
        var html = this.template();
        this.$el.html(html);
    },
    _ensureBodyOverflow : function () {
        this.on(BaseUI.EVENT.show, function () {
            $(document.body).addClass(LoadingUI.CLASS.dialogOpen);
        });
        this.on(BaseUI.EVENT.hide, function () {
            $(document.body).removeClass(LoadingUI.CLASS.dialogOpen);
        });
    }
},{
    CLASS : {
        showClass : 'loading-show',
        hideClass : 'loading-hide',
        dialogOpen : 'loading-open'
    }
});

module.exports = LoadingUI;