/**
 * Created by lidinghui on 14-9-3.
 */

/*@require viewport:viewport.less*/
/*@require viewport:iTunes.less*/
/*@require viewport:trust.less*/
/*@require viewport:repairFlash.less*/
/*@require viewport:connectTip.less*/

var Backbone = require('backbone');
var PageView = require('common:page.view');
var $ = Backbone.$;
var _ = Backbone._;
var Dialog = require('ui:dialog.ui');
var log = require('log');
var cefAPI = require('common:libs/cefAPI');
var eventCenter = require('common:libs/eventCenter');
var DownloadTask = require('task:downloadTask.view');


var ViewportViewCP = {
    CLASS : {
        cover : 'cover'
    }
};


var ViewportView = PageView.extend({
    el                 : '#viewport',
    isCover            : false,
    events             : {
        'click .i-btn-repair'         : 'repairFlashHandler',
        'click [data-download="app"]' : 'downloadAppHandler'
    },
    initialize         : function () {
        this.$content = this.$('.i-content');
        var SideBarView = require('viewport:sidebar.view');
        var HeaderView = require('viewport:header.view');
        SideBarView.getInstance();
        HeaderView.getInstance().computeNCArea();
    },
    addContentView     : function (view) {
        this.$content.append(view.el);
    },
    addCover           : function () {
        if (!this.isCover) {
            this.$el.addClass(ViewportViewCP.CLASS.cover);
            this.isCover = true;
        }
    },
    removeCover        : function () {
        if (this.isCover) {
            this.$el.removeClass(ViewportViewCP.CLASS.cover);
            this.isCover = false;
        }
    },
    repairFlashHandler : function () {
        var dialog,
            tpl = __inline('../templates/repairFlashDialog.mustache');
        if(cefAPI.isConnect()){
            // 第一步
            dialog = Dialog.getInstance().render({
                title       : 'Fix Crash',
                contentHTML : tpl({stepOne : true})
            }).show();

            var $repairFlash = dialog.$('.repair-flash');
            $repairFlash.on('click', '.repair-flash-btn', function () {
                // 第二步
                dialog.render({
                    contentHTML : tpl({stepTwo : true})
                });
                cefAPI.repair(function (res) {
                    res || (res = []);
                    var status = parseInt((res[0] || 0), 10);
                    // 第三步
                    dialog.render({
                        contentHTML : tpl({
                            isSuccess : status == 1,
                            stepThree : true
                        })
                    });
                });
            });
        }
        else{
            dialog = Dialog.getInstance().render({
                title : 'Fix Crash',
                contentHTML : __inline('../templates/connectTip.mustache')
            }).show();
        }
    },
    tipInstalliTunes   : function () {
        var dialog = Dialog.getInstance().render({
            title       : 'iTunes Required',
            contentHTML : __inline('../templates/iTunes.mustache')()
        }).show();
        dialog.$('.go-apple-site').on('click', function () {
            // 跳到Apple iTunes
            MGWebKit.openUrl('https://www.apple.com/itunes/');
        });
    },
    tipTrust           : function () {
        var dialog = Dialog.getInstance().render({
            title       : 'Connection Failed',
            contentHTML : __inline('../templates/trust.mustache')()
        }).show();
        dialog.$el
            .removeClass('dialog-simple')
            .addClass('dialog-large');
        dialog.listenToOnce(cefAPI,cefAPI.appEvent.PlugIn, function(){
            dialog && dialog.hide() && dialog.remove();
        });
    },
    downloadAppHandler : function (e) {
        var $down = $(e.currentTarget),
            ipaid = $down.data('ipaid'),
            url = $down.data('url'),
            icon = $down.data('icon'),
            name = $down.data('name');


        DownloadTask.createInstance({
            fromEl : $down,
            icon : icon
        });

        // 取消下载
        e.preventDefault();
        //触发下载
        eventCenter.trigger(eventCenter.appDownloadEvent.Start, {
            // 下载的id
            ipaid : ipaid,
            // 下载的地址
            url : url,
            // 图片
            icon  : icon,
            // 文件名
            name  : name
        });
    }
}, ViewportViewCP);


module.exports = ViewportView;