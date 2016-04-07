
/*@require task:downloadTask.less*/

var Backbone = require('backbone'),
    $ = require('jquery'),
    serverAPI = require('common:libs/serverAPI'),
    _ = require('underscore');

$.easing.sin90 = function(p, n, firstNum, diff) {
    return Math.sin(p * Math.PI / 2) * diff + firstNum;
};

var DownloadTaskView = Backbone.View.extend({
    className : 'download-task',
    tagName : 'img',
    initialize : function(cfg){
        this.$from = $(cfg.fromEl);
        this.$to = $(cfg.toEl || '.i-sidebar .sidebar-task');
        // 设置起始
        this.setFromPosition(cfg);
        // 设置结束
        this.animate();
    },
    setFromPosition : function(cfg){
        var pos = this.$from.offset();
        // 设置图片地址
        this.$el.attr('src',cfg.icon)
            .css({
                top : pos.top,
                left : pos.left,
                opacity : 0
            })
            .appendTo(document.body)
    },
    animate : function(){
        var me = this,
            pos = me.$to.position();
        me.$el.animate({
            top : pos.top + 11,
            left : pos.left + 160,
            width : 20,
            height : 20,
            opacity : 1
        },500,'sin90',function(){
            me.remove();
        });
    }
},{
    createInstance : function(cfg){
        return new DownloadTaskView(cfg);
    }
});

module.exports = DownloadTaskView;