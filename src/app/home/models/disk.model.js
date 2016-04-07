var Backbone = require('backbone');
var _ = require('underscore');
var Bytes = require('common:libs/bytes');

/**
 6种颜色显示应用Application、照片Pictures、音乐Music、电子书Books、其他Others和空闲容量Available（以此为顺序
 */
var DiskCapacityModel = Backbone.Model.extend({
   defaults : {
       // 总共
       dataTotal : 0,
       // 应用Application
       application : 0,
       // 照片Pictures
       picture : 0,
       // 音乐Music
       music : 0,
       // 电子书Books
       books : 0,
       // 其他Others
       others : 0,
       // 空闲容量
       dataAvailable : 0,
       // 总大小
       systemTotal : 0,
       // 系统使用
       systemUseage : 0,
       // 系统可用
       systemAvailable : 0
   },
   parse : function(resp, options){
       return {
           // 用户可用空间
           dataTotal : resp.PhysicalSize,
           // 应用大小
           application : resp.MobileApplicationUsage,
           // 照片大小
           picture : resp.CameraUsage + resp.PhotoUsage,
           // 影音大小
           music : resp.MusicUsage,
           // 电子书大小
           books : resp.BookUsage,
           // 其他
           others : resp.Other,
           // 空闲
           dataAvailable : resp.FreeSize,
           // 总大小
           systemTotal : resp.TotalSystemCapacity,
           // 已经使用
           systemUseage : resp.TotalSystemCapacity - resp.TotalSystemAvailable,
           // 空闲
           systemAvailable : resp.TotalSystemAvailable
       }
   },
   toJSON : function(){
       var me = this;
       var json = {};
       if(this.get('dataTotal') > 0 && this.get('systemTotal') > 0){
           var result = _.clone(this.attributes);
           _.each(result,function(value,key){
               if(key.indexOf('system') == 0){
                   json[key] = me.getSystemPercent(value);
               }
               else{
                   json[key] = me.getDataPercent(value);
               }
           });
           _.extend(json,{
               dataTotalSize : Bytes.format(result.dataTotal),
               dataAvailableSize : Bytes.format(result.dataAvailable),
               systemTotalSize : Bytes.format(result.systemTotal),
               systemAvailableSize : Bytes.format(result.systemAvailable)
           })
       }
       return json;
   },
   getDataPercent : function(item){
       return (item / this.get('dataTotal') * 100) + '%';
   },
   getSystemPercent : function(item){
       return (item / this.get('systemTotal') * 100) + '%';
   }
});

module.exports = DiskCapacityModel;


