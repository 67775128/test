/**
 */

var Backbone = window.Backbone = require('backbone');
var $ = window.$ = window.jQuery = Backbone.$;
var i18n = require('common:libs/i18n');
var IOSRouter = require('common:ios.router');


module.exports = function(){
    $(function(){
        i18n.handlebarsRegister();
        // 路由初始化
        IOSRouter.getInstance();
        Backbone.history.start({pushState: false});
    });
};