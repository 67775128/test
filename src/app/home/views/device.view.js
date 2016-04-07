/**
 * Created by lidinghui on 14-8-29.
 */
/*@require home:device.less*/
var Backbone = require('backbone');
var _ = require('underscore');
var DeviceModel = require('home:device.model');
var deviceTemplate = __inline('../templates/device.mustache');
var detailTemplate = __inline('../templates/detail.mustache');
var eventCenter = require('common:libs/eventCenter');
var cefAPI = require('common:libs/cefAPI');
var log = require('log');
var DeviceView = Backbone.View.extend({
    events             : {
        'click .more-detail' : function (e) {
            e.preventDefault();
            // 详情页弹窗
            this.detailDialogWindow();
        }
    },
    initialize         : function () {
        var me = this;
        me.model = new DeviceModel();
        me.listenTo(this.model, 'change', this.render);
        me.listenTo(cefAPI,cefAPI.appEvent.PlugOff,function(res){
            if(!me._detailDialogWindow){return;}
            me._detailDialogWindow.trigger('close');
            me._detailDialogWindow.close();
        })
    },
    template           : deviceTemplate,
    render             : function () {
        var json = this.model.toJSON();
        _.extend(json,this.model.helper);
        var html = this.template(json);
        this.$el.html(html);
    },
    detailDialogWindow : function () {
        var me = this;
        if (!me._detailDialogWindow) {
            me._detailDialogWindow = new MGWindow({
                url         : 'deviceDetailDialog.html',
                x           : 0,
                y           : 0,
                cx          : 600,
                cy          : 550,
                showAllowed : true,
                wndState    : MGWndStatus.maximize,
                isModal     : false,
                context     : cefAPI.deviceID
            });
            me._detailDialogWindow.on('close', function () {
                me._detailDialogWindow = null;
            });
        }
        else{
            me._detailDialogWindow.show(MGWndStatus.center);
        }
    }
});

module.exports = DeviceView;