/**
 * Created by lidinghui on 14-9-12.
 */
/*@require lang:english/all*/
/*@require lang:chinese/all*/

var _ = require('underscore');
var Handlebars = require('handlebars');
var $ = require('jquery');
var Backbone = require('backbone');
var log = require('log');


var i18n = {};

/**
 * 使用场景
 * 1.在属性中使用
 *  <a href="{{i18n}}"></a>
 * 2.在文本中使用
 *  <a href=""><a>
 */

    // 当前的词典
i18n.dictionary = {};

// 获取i18n中的key
i18n._getI18n = function (path) {
    var result = this.dictionary;
    (path || '').split('.').forEach(function (key) {
        if (key && !_.isUndefined(result)) {
            result = result[key];
        }
    });
    if(!result){
        log.error('不能找到当前的国际化值',path);
    }
    return result || '';
};

// 根据path获取value
i18n.getI18nValue = function(path,args){
    var langStr = this._getI18n(path);
    return langStr.replace(/\{(\d+)\}/g,function(match,index){
        return args[index];
    });
};

// 填充Dom
i18n.fillDomText = function(key){
    var args = Array.prototype.slice.call(arguments, 1),
        tpl = __inline('../templates/i18n.mustache'),
        value = this.getI18nValue(key,args);
    return tpl({key : key,value : value,args : args});
};

// 代码形式
// data-i18n-title="common.text" title="hello text"
// data-i18n-help="common.movie"  title="hello movie"
// data-i18n-title="common.test" title="hello good" data-i18n-title-args="xxx"
i18n.fillDomAttr = function(attr,key){
    var args = Array.prototype.slice.call(arguments, 2),
        tpl = __inline('../templates/i18nAttribute.mustache'),
        value = this.getI18nValue(key,args);
    return tpl({key : key,value : value,args : args});
};

// 简写形式
i18n.trans = i18n.fillDomText;
// 简写形式
i18n.transAttr = i18n.fillDomAttr;

// 在文本中使用
i18n.translateHelper = function () {
    var args = Array.prototype.slice.call(arguments, 0,arguments.length - 1),
        html = this.fillDomText.apply(this,args);
    return new Handlebars.SafeString(html);
};

// 在属性中使用
i18n.translateAttributeHelper = function () {
    var args = Array.prototype.slice.call(arguments, 0,arguments.length - 1);
    return this.fillDomAttr.apply(this,args);
};

i18n.getLanguage = function(){
    var hash = Backbone.history.getHash(),
        result = hash.match(/^lang\/(\w+)(\/.*)?$/i);
    return result && result.length && result[1] || '';
};

i18n.switchLanguage = function(lang){
    lang || ( lang = this.getLanguage());
    var me = this;

    switch (lang){
        case 'english' :
            me.dictionary = require('lang:english/all');
            break;
        case 'chinese' :
            me.dictionary = require('lang:chinese/all');
            break;
        default  :
            me.dictionary = require('lang:english/all');

    }
};


// 在Handlebars中注册
i18n.handlebarsRegister = function () {
    Handlebars.registerHelper('i18n', _.bind(i18n.translateHelper, i18n));
    Handlebars.registerHelper('i18n-attr', _.bind(i18n.translateAttributeHelper, i18n));
};

module.exports = i18n;