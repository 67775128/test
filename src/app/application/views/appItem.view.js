/*@require application:appItem.less*/
var Backbone = require('backbone');
var $ = Backbone.$;
var _ = require('underscore');
var log = require('log');
var Dialog = require('ui:dialog.ui');
//国际化组件
var i18nDi=require("common:libs/i18n");
var AppItemViewCP = {
    CLASS : {
        appItem    : 'app-item',
        iconRemove : 'icon-remove'
    }
};

var AppItemView = Backbone.View.extend({
    template   : __inline('../templates/appItem.mustache'),
    ui : {
        $icon      : '.icon',
        $name      : '.name',
        $appleID   : '.apple-id',
        $size      : '.size',
        $dataSize  : '.data-size',
        $version   : '.version',
        $uninstall : '.uninstall',
        $update    : '.update'
    },
    events     : {
        'mouseenter .uninstall' : function () {
            this.$icon.addClass(AppItemViewCP.CLASS.iconRemove);
        },
        'mouseleave .uninstall' : function () {
            this.$icon.removeClass(AppItemViewCP.CLASS.iconRemove);
        },
        'click .uninstall'      : 'uninstallHandler',
        'click .update' : 'updateHandler'
    },
    initialize : function () {
        var me = this;
        me.$el.addClass(AppItemViewCP.CLASS.appItem);
        me.render();
        // 初始化dom元素
        me.initUI();
        me.updateListenModel();
        me.updateUI();

    },
    render : function () {
            var html = this.template(this.model.toJSON());
            this.$el.html(html);            
    },

    initUI   : function () {
        var me = this;
        _.each(this.ui, function (sel, key) {
            me[key] = me.$(sel);
        });
    },
    updateModel       : function (model) {
        var me = this;
        if (me.model == model) return;
        me.stopListening(me.model);
        me.model = model;
        me.updateListenModel();
        me.updateUI();
    },
    updateUI          : function () {
        var me = this,
            model = this.model;
        me.$name.attr("data-hint",model.get('name'));
        me.$name.find(".name-sp").text(model.get('name'));
        me.updateIcon();
        me.$appleID.text(model.get('appleID'));
        me.$version.text(model.get('version'));
        me.updateSize();
        me.updateDataSize();
        me.updateAction();
        if(model.get("updating")){
              me.$update.addClass('disabled').html("updating");
        }else{
            me.$update.removeClass('disabled').html("update");
        }
    },
    updateIcon              : function (model) {
        var me = this,
            $img = me.$icon.find('img'),
            icon;
        model || (model = this.model);
        icon = model.get('icon');
        // 图片已经加载
        if (model.get('iconLoaded')) {
            me.$icon.removeClass('icon-holder');
            if ($img.size() == 0) {
                $img = $('<img />').appendTo(me.$icon);
            }
            $img.attr('src', icon);
        }
        else if (icon) {
            me.$icon.addClass('icon-holder');
            $img.remove();
            // 设置默认图片
            $img = $(new Image());
            $img.on('load', function () {
                if (model) {
                    model.set('iconLoaded', true);
                }
                $img.off().remove();
            }).on('error',function(){
                $img.off().remove();
            });
            $img.attr('src', icon);
        }
        else{
            $img.remove();
            me.$icon.addClass('icon-holder');
        }
    },
    updateAction : function(model, canUpdate){
        var me = this;
        model || (model = me.model);
        canUpdate || (canUpdate = model.get('canUpdate'));
        me.$update.toggleClass('hide',!canUpdate);
    },
    updateUpdatingStatus:function(){
         if(this.model.get("updating")){
              this.$update.addClass('disabled').html("updating");
        }else{
              this.$update.removeClass('disabled').html("update");
        }       
    },
    updateListenModel : function () {
        var me = this;
        me.listenTo(me.model, 'change:icon', me.updateIcon);
        me.listenTo(me.model, 'change:iconLoaded', me.updateIcon);
        me.listenTo(me.model, 'change:canUpdate', me.updateAction);
        me.listenTo(me.model, 'change:size',me.updateSize);
        me.listenTo(me.model, 'change:dataSize', me.updateDataSize);
        me.listenTo(me.model, 'change:updating', me.updateUpdatingStatus);
    },
    updateSize : function(model, size){
        var me = this;
        model || (model = this.model);
        size || (size = model.get('size'));
        me.$size.html(model.sizeFormat(size));
    },
    updateDataSize : function(model, dataSize){
        var me = this;
        model || (model = this.model);
        dataSize || (dataSize = model.get('dataSize'));
        me.$dataSize.html(model.sizeFormat(dataSize));
    },
    uninstallHandler  : function (e) {
        var me = this;
        var dialog = Dialog.getInstance().render({
            title       : i18nDi.getI18nValue("application.confirmLabel")||'Comfirm',
            contentHTML : __inline('../templates/uninstallDialog.mustache')({
                // 开始
                start : true,
                title:i18nDi.getI18nValue("application.sureDeleteTitle")
            })
        }).show();

        dialog.$el.on('click', '.delete', function () {
            dialog.render({
                contentHTML :  __inline('../templates/uninstallDialog.mustache')({
                    // 删除中
                    deleting : true,
                    title:i18nDi.getI18nValue("application.uninstallingTitle")
                })
            });
            dialog.$el.find('.close').hide();
            me.model.destroy(function () {
                Dialog.getInstance().hide();
            }, me.uninstallFail);
        });
    },
    updateHandler  : function (e) {
          this.model.update();
    },    
    uninstallFail     : function () {
        var dialog = Dialog.getInstance();
        dialog.render({
            title       : 'Fail',
            contentHTML : 'Please Try Again!'
        }).show();
    }

}, AppItemViewCP);


module.exports = AppItemView;