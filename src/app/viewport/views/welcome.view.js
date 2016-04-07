/**
 * Created by lidinghui on 14-9-5.
 */
/*@require viewport:welcome.less*/
var Backbone = require('backbone');
var PageView = require('common:page.view');

var WeclomeView = PageView.extend({
    className  : 'i-welcome',
    template   : __inline('../templates/welcome.mustache'),
    initialize : function () {
        this.render();
    },
    render     : function () {
        this.$el.html(this.template());
    }
});

module.exports = WeclomeView;