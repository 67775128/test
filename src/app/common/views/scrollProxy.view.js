/**
 * Created by lidinghui on 14-9-12.
 */

/*@require common:scrollProxy.less*/

var Backbone = require('backbone');
var _ = require('underscore');
var $ = Backbone.$;

var scrollProxyViewCP = {
    SEL      : {
        content      : '.i-scr-prx-content',
        scroller     : '.i-scr-prx-scroller',
        scrollerLine : '.i-line'
    },
    DEFAUTLS : {
        rowHeight : 25
    },
    EVENT : {
        renderOneScreen : 'renderOneScreen'
    }
};

var scrollProxyView = Backbone.View.extend({
    index               : 0,
    template            : __inline('../templates/scrollProxy.mustache'),
    // 初始化函数
    initialize          : function (opts) {
        var me = this;
        // 行数
        this.length = opts.length;
        // 行高
        this.rowHeight = opts.rowHeight;
        // 渲染
        this.render();
        // 初始化Dom元素
        this.initDomElements();
        // 内容区块滚轮
        this.$content.on('mousewheel', $.proxy(this.onMouseWheel, this));
        // 滚动条滑动
        this.$scroller.on('scroll', $.proxy(this.onScroll, this));
        // 设置滚动条的高度
        this.setScrollerLineHeight();
        $(window).on('resize', function(){
            me._oneScreenNum = 0;
        });

    },
    // 初始化dom元素
    initDomElements     : function () {
        var SEL = scrollProxyViewCP.SEL;
        // 内容区块
        this.$content = this.$(SEL.content);
        // 滑块
        this.$scroller = this.$(SEL.scroller);
        // 滚动条
        this.$scrollerLine = this.$scroller.find(scrollProxyViewCP.SEL.scrollerLine);
    },
    // 渲染
    render              : function () {
        this.$el.html(this.template());
    },
    // 设置滚动条的长度
    setScrollerLineHeight   : function () {
       this.$scrollerLine.height(this.length * this.rowHeight);
    },
    // 设置滑动距离
    setScrollTopByIndex : function (index) {
        this.index = index;
        //尽量避免阻塞内容的渲染
        requestAnimationFrame($.proxy(function () {
            var scrollTop = this.index * this.rowHeight;
            this.$scroller.scrollTop(scrollTop);
        }, this));
    },
    // 设置行数
    setLength           : function (len) {
        this.length = len;
        // 设置滚动条的长度
        this.setScrollerLineHeight();
    },
    // 获取当前的index
    getIndex            : function () {
        return this.index;
    },
    // 获取一屏幕的行数
    getOneScreenNum     : function () {
        var ch,rh;
        if(!this._oneScreenNum){
            ch = this.$content.height();
            rh = this.rowHeight || scrollProxyViewCP.DEFAUTLS.rowHeight;
            this._oneScreenNum = Math.ceil(ch / rh);
        }
        return this._oneScreenNum;
    },
    // 添加组件
    addContent          : function (component) {
        if (typeof component == 'string') {
            this.$content.html(component);
            //when component is dom object.
        } else if (component.appendChild) {
            this.$content.append(component);
        } else {
            component.render(this.$content);
        }
    },
    // Events
    // ============================
    onScroll            : function (ev) {
        var preIx = this.index;
        this.scrTop = this.scrTop || 0;
        var scrTop = ev.target.scrollTop;

        this.index = Math.floor(ev.target.scrollTop / this.rowHeight);

        var screenDataNum = this.getOneScreenNum();

        if (this.length - screenDataNum <= this.index && scrTop > this.scrTop) {
            this.index = this.length - screenDataNum + 1;
        }

        if (this.index == preIx) {
            return;
        }

        this.trigger(scrollProxyViewCP.EVENT.renderOneScreen, {
            index     : this.index,
            screenNum : this.getOneScreenNum()
        });
        this.scrTop = scrTop;
    },
    onMouseWheel        : function (evt) {
        // 阻止默认事件
        evt.preventDefault && evt.preventDefault();

        if (this.length === 0)return;

        var screenDataNum = this.getOneScreenNum();
        var curIndex = this.index;

        if (screenDataNum > this.length) {
            return;
        }

        if (evt.originalEvent.wheelDelta > 0) {
            this.index -= 1;
        } else {
            this.index += 1;
        }

        //往上滚轮，有 index 小于0的情况
        if (this.index <= 0)this.index = 0;
        if (this.length - screenDataNum < this.index) {
            this.index = this.length - screenDataNum + 1;
        }

        if (this.index == curIndex) {
            return;
        }

        this.setScrollTopByIndex(this.index);
        this.trigger(scrollProxyViewCP.EVENT.renderOneScreen, {
            index     : this.index,
            screenNum : screenDataNum
        });
    }
}, scrollProxyViewCP);

module.exports = scrollProxyView;