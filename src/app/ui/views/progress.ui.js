/*@require ui:progress.less*/
var BaseUI = require('ui:base.ui');
var Backbone = require('backbone');
var $ = require('jquery');
var _ = require('underscore');

var ProgressItemModel = Backbone.Model.extend({
    defaults : {
        id : '',
        percent : 0,
        barType : ''
    }
});

var ProgressUICP = {
    DEFAULTS : {
    },
    TYPE : {
        simple : 'progress-simple',
        status : 'progress-status'
    },
    BAR_TYPE : {
        common : 'progress-bar-common',
        application : 'progress-bar-application',
        picture : 'progress-bar-picture',
        music : 'progress-bar-music',
        books : 'progress-bar-books',
        others : 'progress-bar-others',
        system : 'progress-bar-system-useage'
    },
    EVENT : {
        mouseEnter : 'mouse-enter',
        mouseLeave : 'mouse-leave'
    },
    ProgressItemModel : ProgressItemModel,
    ItemModel : ProgressItemModel
};

var ProgressBar = Backbone.View.extend({
    className : 'progress-bar',
    template : __inline('../templates/progress.mustache'),
    initialize : function(options){
        var me = this;
        me.render();
        options || (options = {});
        this.$el.data('model',this.model);
        this.$el.data('view',this);
        this.listenTo(this.model,'change:percent',me.update);
    },
    render : function(){
        var json = this.model.toJSON(),
            html = this.template();
        this.$el.addClass(json.type || ProgressUICP.BAR_TYPE.common);
        this.$el.html(html);
        this.update();
        return this;
    },
    update : function(){
        var percent = this.model.get('percent') + '%';
        this.$el.width(percent);
        this.$('.sr-only').text(percent);
    }
});


var ProgressUI = BaseUI.extend({
    events : {
        'mouseenter .progress-bar' : 'mouseHoverHandler',
        'mouseleave .progress-bar' : 'mouseHoverHandler'
    },
    bars : [],
    className : 'progress',
    initialize : function(options){
        options || (options = {});
        options = _.defaults(options, ProgressUICP.DEFAULTS);
        this.$el.addClass(options.type || ProgressUICP.TYPE.simple);
        if(!this.collection){
            this.collection = new Backbone.Collection({
                modal : ProgressUICP.ItemModel
            })
        }
        this.listenTo(this.collection,'add',this.render);
        if(options.data){
            this.collection.set(options.data);
        }
    },
    render : function(model){
        var bar = new ProgressBar({model : model});
        this.bars.push(bar);
        this.$el.append(bar.$el);
        return this;
    },
    mouseHoverHandler : function(e){
        var EVENT = ProgressUICP.EVENT,
            event = e.type == 'mouseenter' ? EVENT.mouseEnter : EVENT.mouseLeave,
            $bar = $(e.currentTarget),
            view = $bar.data('view'),
            model = $bar.data('model');
        this.trigger(event,$bar,view,model,e);
    }
}, ProgressUICP);

module.exports = ProgressUI;