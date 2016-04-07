var _ = require('underscore');
var cefAPI = require('common:libs/cefAPI');
var $ = require('jquery');
var domainUrl = 'http://server.voga360.com/ios/initRequestDomain.htm';
var blank = function(){};
var serverAPI = {
    _pcGuid        : null,
    domainIsSet:false,
    DOMAIN         : {
        market : 'http://iosmarket.voga360.com',
        server : 'http://iosserver.voga360.com',
        upload : 'http://upload.voga360.com',
        search : 'http://search.voga360.com'
    },
    API            : {
        // app下载地址
        appDownload   : '/app/download.htm',
        // 更新
        upgrade       : '/app/upgrade',
        // 首页推荐
        homeRecommend : '/nclient/sjson/recommend/home'
    },
    // 后面改成promise
    systemConfig:{
        pcGuid:{
            key:'_pcGuid',
            method : 'getPcGuid'
        },
        osVersion:{
            key:'_osVersion',
            method : 'getOsVersion'
        },
        channelId:{
            key:'_channelId',
            method : 'getChannelId'
        },
        pcVersion:{
            key:'_pcVersion',
            method : 'getPcVersion'
        },
        OSLang:{
            key:'_OSLang',
            method : 'getOSLang'
        }
    },
    init:function(){
        this.resetDomain();
        this.getPcGuid();
        this.getOSVersion();
        this.getChannelId();
        this.getPCVersion();
        this.getOSLanguage();
    },
    resetDomain:function(){
        var me = this;
        if(me.domainIsSet){return;}
        $.ajax({
            url: domainUrl,
            dataType:'json',
            beforeSend:function(xhr){
                xhr.setRequestHeader("Accept","*/*");
                xhr.setRequestHeader("Cache-Control","no-cache");
            }
        })
        .done(function(msg) {
            for(var i in msg){
                if(msg[i]){
                    me.DOMAIN[i] = 'http://'+msg[i];
                }
            }
            me.domainIsSet = true;
        });
    },
    getSystemInfo:function(obj){
        var me = this;
        var key = me.systemConfig[obj.name]['key'];
        var method = me.systemConfig[obj.name]['method'];
        if(!me[key]){
                cefAPI[method](function(res){
                    res || (res = []);
                    me[key] = res[0];
                    if(!_.isFunction(obj.callback)) return;
                    obj.callback(me[key]);
                });
        }else {
            if(!_.isFunction(obj.callback)) return me[key];
            obj.callback(me[key]);
        }
        
    },
    getInfos:function(){
        return {
            phone_app_id:51,
            deviceid:this._pcGuid,
            os_version:this._osVersion,
            channel_id:this._channelId,
            versionName:this._pcVersion,
            language:this._OSLang
        }
    },
    getPcGuid      : function (success) {
        return this.getSystemInfo({
            name:'pcGuid',
            callback:success
        });
    },
    getOSVersion   : function(success){
        return this.getSystemInfo({
            name:'osVersion',
            callback:success
        });
    },
    getChannelId   : function(success){
        return this.getSystemInfo({
            name:'channelId',
            callback:success
        });
    },
    getPCVersion   : function(success){
        return this.getSystemInfo({
            name:'pcVersion',
            callback:success
        });
    },
    getOSLanguage : function(success){
        return this.getSystemInfo({
            name:'OSLang',
            callback:success
        });
    },
    getDownloadUrl : function (pcGuid, ipaId) {
        return this.DOMAIN.market + this.API.appDownload + '?pcguid=' + pcGuid + '&ipaid=' + ipaId;
    },
    checkUpgrade   : function (appList) {

        var json = {
            appList : [
                {verCode : "0.0", pkgId : "com.tagged.meetme"}
            ]
        };
        var data = {upgradeAppList : '{"appList":[{"verCode":"0.0","pkgId":"com.tagged.meetme"}]}'};
        var url = this.DOMAIN.market + this.API.upgrade;

        $.post(url, data, function (res) {
        });
    },
    // 获取首页推荐的app
    getHomeRecommendApps : function(success){
        var callback = _.isFunction(success) ? success : blank;
        $.get(this.DOMAIN.server + this.API.homeRecommend,{
            mtypecode:1
        },callback);
    },
    // 获取首页推荐的game
    getHomeRecommendGames : function(success){
        var callback = _.isFunction(success) ? success : blank;
        $.get(this.DOMAIN.server + this.API.homeRecommend,{
            mtypecode:2
        },callback);
    },
    // 获取Icon地址
    getIconPath : function(path){
        return this.DOMAIN.upload + path + '/icon_l.png';
    }
};
serverAPI.init();
module.exports = serverAPI;