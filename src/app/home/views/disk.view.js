/*@require home:disk.less*/
var Backbone = require('backbone');
var DiskModel = require('home:disk.model');
var $ = Backbone.$;
var Bytes = require('common:libs/bytes');
require('bootstrap:tooltip');

var DiskViewCP = {
    CLASS : {
        fadeIn   : 'fadeIn',
        fadeOut  : 'fadeOut',
        animated : 'animated'
    }
};
var DiskView = Backbone.View.extend({
    template   : __inline('../templates/disk.mustache'),
    initialize : function () {
        this.model = new DiskModel();
        this.listenTo(this.model, 'change', this.render);

    },
    render     : function () {
        var me = this;
        var html = this.template(this.model.toJSON());
        var CLASS = DiskViewCP.CLASS;
        this.$el.html(html)
            .addClass(CLASS.fadeIn)
            .addClass(CLASS.animated)
            .find('.capacity a').tooltip({title : function () {
                var $el = $(this);
                var key = $el.data('key');
                return key + ' : ' + Bytes.format(me.model.get(key));
            }});
    }
}, DiskViewCP);


module.exports = DiskView;