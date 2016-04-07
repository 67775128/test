/*@require home:noNet.less*/
// Backbone
var Backbone = require('backbone');
// 页面基类
var _ = require('underscore');
var PageView = require('common:page.view');

var NoNetView = PageView.extend({
    className   : 'i-resource i-resource-nonet',
    initialize: function (obj) {
        var me = this;
        var tpl = __inline('../templates/noNet.mustache');
        this.$el.html(tpl);
    },
    events: {
        'click .js-retry'      : 'retry'
    },
    retry:function(){
        this.trigger('retry');
    }
});


module.exports = NoNetView;