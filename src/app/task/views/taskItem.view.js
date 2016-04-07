// 依赖
// -----------------------------

/*@require task:taskItem.less*/

// Backbone
var Backbone = require('backbone');
// jQuery
var $ = Backbone.$;
// Underscore
var _ = require('underscore');

var TaskItemView = Backbone.View.extend({
    initialize             : function () {
        var me = this;
        me.$el.addClass('task-item');
        me.render();
        me.initUI();
        me.updateUI();
        me.updateListenModel();
    },
    ui                     : {
        $baseInfo           : '.base-info',
        $icon               : '.icon',
        $name               : '.name',
        $size               : '.size'
    },
    events                 : {
        'click .action-download'          : function (ev) {
            // 阻止冒泡
            ev.stopPropagation();
        },
        'click .action-install'           : function (ev) {
            // 阻止冒泡
            ev.stopPropagation();
        },
        // 下载相关事件
        'click .retry'   : function(e){
            //if(this.model.isInstallTask() && !this.model.isOffLine()) return;
            // Fixed IG-210, Because the installed model retry, will be deleted
            if(this.model.isInstalledTask()){
                if(!$(e.currentTarget).hasClass('js-reInstall')){
                    $(e.currentTarget).addClass('hide');
                }
            }
            this.model.doRetry();
        },
        'click .continue': function(e){
            $(e.currentTarget).addClass('hide');
            this.model.doContinue();
        },
        'click .pause'   : function(e){
            $(e.currentTarget).addClass('hide');
            this.model.doPause();
        }
    },
    template               : __inline('../templates/taskItem.mustache'),
    initUI                 : function () {
        var me = this;
        _.each(this.ui, function (sel, key) {
            me[key] = me.$(sel);
        });
    },
    render                 : function () {
        var html = this.template(this.model.toJSON());
        this.$el.html(html);
    },
    updateModel            : function (model) {
        var me = this;
        if (me.model == model) return;
        me.stopListening(me.model);
        me.model = model;
        me.updateUI();
        me.updateListenModel();
    },
    updateUI               : function () {
        var me = this;

        if(me.model.isInstalledTask()){
            me.$actionPanel = me.$('.action-complete');
            me.$completeTip = me.$('.complete-tip');
        }
        else{
            if(me.model.isDownloadTask()){
                me.$progressWrap = me.$('.progress-download');
                me.$actionPanel = me.$('.action-download');
            }
            else if(me.model.isInstallTask()){
                me.$progressWrap = me.$('.progress-install');
                me.$actionPanel = me.$('.action-install');
            }
            me.$progressBar = me.$progressWrap.find('.progress-bar');
            me.$progressTip = me.$progressWrap.find('.progress-tip');

            me.$pauseBtn       = me.$actionPanel.find('.pause');
            me.$continueBtn    = me.$actionPanel.find('.continue');
            me.$retryBtn       = me.$actionPanel.find('.retry');
        }

        me.updateIcon();
        // 设置名字
        me.updateName();
        // 设置大小
        me.updateSize();
        if (me.model.isInstalledTask()) {
            me.updateInstalledStatus();
        }
        else {
            // 更新进度
            me.updatePercent();
            // 更新状态
            me.updateStatus();
            me.updatePause();
            me.updateContinue();
            me.updateRetry();
        }
    },
    updateListenModel      : function () {
        var me = this;
        me.listenToOnce(me.model, 'change:icon', me.updateIcon);
        me.listenToOnce(me.model, 'change:iconLoaded', me.updateIcon);
        me.listenToOnce(me.model, 'change:name', me.updateName);
        me.listenToOnce(me.model, 'change:size', me.updateSize);
        if (!me.model.isInstalledTask()) {
            me.listenTo(me.model, 'change:percent', me.updatePercent);
            me.listenTo(me.model, 'change:rate', me.updatePercent);
            me.listenTo(me.model, 'change:status', me.updateStatus);
            me.listenTo(me.model, 'change:canPause', me.updatePause);
            me.listenTo(me.model, 'change:canContinue', me.updateContinue);
            me.listenTo(me.model, 'change:canRetry', me.updateRetry);
        }
    },
    updateIcon             : function () {
        var me = this,
            $img = me.$icon.find('img'),
            model = this.model,
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
            }).on('error', function () {
                $img.off().remove();
            });
            $img.attr('src', icon);
        }
        else {
            $img.remove();
            me.$icon.addClass('icon-holder');
        }
    },
    updateName             : function (model, name) {
        var me = this;
        model || (model = this.model);
        name || (name = model.get('name'));
        me.$baseInfo.attr('data-hint',name);
        me.$name.html(name);
    },
    updateSize             : function (model, size) {
        var me = this;
        model || (model = this.model);
        size || (size = model.get('size'));

        me.$size.html(model.sizeFormat(size));
    },
    updatePercent          : function (model, percent) {
        model || (model = this.model);
        percent = model.get('percent');
        var me = this,
            progressTip = model.progressTip();
        me.$progressWrap.removeClass('hide')
            .siblings('.progress-wrap')
            .addClass('hide');
        me.$progressBar.width(percent + '%');
        me.$progressTip.html(progressTip);
    },
    updateStatus           : function (model, status) {
        model || (model = this.model);
        status || (status = model.get('status'));console.log('status----------',status)
        var me = this,
            progressTip = model.progressTip(status);
        me.$progressTip.html(progressTip)
    },
    upActionPanel : function(){
        var me = this;
        me.$actionPanel.removeClass('hide')
            .siblings('.action')
            .addClass('hide');
    },
    updatePause : function(model,canPause){
        model || (model = this.model);
        canPause || (canPause = model.get('canPause'));
        var me = this;
        me.upActionPanel();
        me.$pauseBtn.toggleClass('hide',!canPause);
    },
    updateContinue : function(model,canContinue){
        model || (model = this.model);
        canContinue || (canContinue = model.get('canContinue'));
        var me = this;
        me.upActionPanel();
        me.$continueBtn.toggleClass('hide',!canContinue);
    },
    updateRetry : function(model,canRetry){
        model || (model = this.model);
        canRetry || (canRetry = model.get('canRetry'));
        var me = this;
        me.upActionPanel();
        console.log('canretry=======',this.model.toJSON())
        me.$retryBtn.toggleClass('hide',!canRetry);
    },

    updateInstalledStatus: function (model, status) {
        model || (model = this.model);
        status || (status = model.get('status'));
        var tip = model.completeTip();
        this.$completeTip.removeClass('hide').html(tip);
        this.$actionPanel.removeClass('hide')
            .siblings('.action')
            .addClass('hide');
    }
});


module.exports = TaskItemView;