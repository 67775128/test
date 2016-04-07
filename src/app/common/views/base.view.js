var Backbone = require('backbone');
var log = require('log');

// 页面类的基类
var BaseView = Backbone.View.extend({
    constructor : function () {
        Backbone.View.apply(this, arguments);
    }
},{
    getInstance : function () {
        var View = this;
        if (!View._instance) {
            View._instance = new View();
        }
        return View._instance;
    }
});

module.exports = BaseView;