var _ = require('underscore');
var Backbone = require('backbone');
//var io = require('socket.io');
var ev = _.clone(Backbone.Events);
function MGWindow(){
    window.SocketURL = 'http://127.0.0.1:1900';
    client.init();
}
MGWindow.prototype.watch = function(){
    client.watch.apply(client,arguments);
};
MGWindow.prototype.sendMessage = function(){
    client.sendMessage.apply(client,arguments);
};
var server = {
    init : function(){
        var me = this;
        var socket = this.socket = io(window.SocketURL);
        //socket.on('reqSendMessage',me.reqSendMessage.bind(me));
        //socket.on('reqWatch',me.reqWatch.bind(me));
    },
    reqSendMessage : function(data){
        var me = this,
            msg = data.msg,
            args = data.args;
        MGWebKit.wnd.sendMessage(msg,args,function(res){
           // me.socket.emit('resSendMessage',{
           //    res : res,
           //    msg : msg
           //});
        });
    },
    reqWatch : function(data){
        var me = this,
            event = data.event;
        MGWebKit.wnd.watch(event,function(res){
            //me.socket.emit('resWatch',{
            //    res : res,
            //    event : event
            //});
        });
    }
};
var client = {
    init : function(){
        var me = this;
        //var socket = this.socket = io(window.SocketURL);
        //socket.on('resSendMessage',me.resSendMessage.bind(me));
        //socket.on('resWatch',me.resWatch.bind(me));
    },
    resSendMessage : function(data){
        ev.trigger(data.msg,data.res)
    },
    resWatch : function(data){
        ev.trigger(data.event,data.res)
    },
    watch : function(event,callback){
        //ev.on(event,callback);
        //this.socket.emit('reqWatch',{event : event});
    },
    sendMessage : function(msg,args,callback){
        //ev.once(msg,callback);
        //this.socket.emit('reqSendMessage',{msg : msg, args : args});
    }
};

module.exports.server = server;
module.exports.client = client;
module.exports.MGWindow = MGWindow;