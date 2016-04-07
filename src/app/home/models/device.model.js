/**
 * Created by lidinghui on 14-8-29.
 */
var Backbone = require('backbone');
var DeviceModelCP = {
    NAME_MAP : {
        'iPhone1,1' : 'iPhone',
        'iPhone1,2' : 'iPhone 3G',
        'iPhone2,1' : 'iPhone 3GS',
        'iPhone3,1' : 'iPhone 4',
        'iPhone3,2' : 'iPhone 4',
        'iPhone3,3' : 'iPhone 4',
        'iPhone4,1' : 'iPhone 4S',
        'iPhone5,1' : 'iPhone 5',
        'iPhone5,2' : 'iPhone 5',
        'iPhone5,3' : 'iPhone 5C',
        'iPhone5,4' : 'iPhone 5C',
        'iPhone6,1' : 'iPhone 5S',
        'iPhone6,2' : 'iPhone 5S',
        'iPhone7,1' : 'iPhone 6 Plus',
        'iPhone7,2' : 'iPhone 6',
        'iPad1,1'   : 'iPad',
        'iPad1,2'   : 'iPad',
        'iPad2,1'   : 'iPad 2',
        'iPad2,2'   : 'iPad 2',
        'iPad2,3'   : 'iPad 2',
        'iPad2,4'   : 'iPad 2',
        'iPad2,5'   : 'iPad Mini',
        'iPad2,6'   : 'iPad Mini',
        'iPad2,7'   : 'iPad Mini',
        'iPad3,1'   : 'The new iPad',
        'iPad3,2'   : 'The new iPad',
        'iPad3,3'   : 'The new iPad',
        'iPad3,4'   : 'iPad 4',
        'iPad3,5'   : 'iPad 4',
        'iPad3,6'   : 'iPad 4',
        'iPad4,1'   : 'iPad 4',
        'iPad4,2'   : 'iPad 4',
        'iPad4,3'   : 'iPad 4',
        'iPad4,4'   : 'iPad Mini',
        'iPad4,5'   : 'iPad Mini',
        'iPad4,6'   : 'iPad Mini',
        'iPod1,1'   : 'iPod Touch',
        'iPod2,1'   : 'iPod Touch 2',
        'iPod3,1'   : 'iPod Touch 3',
        'iPod4,1'   : 'iPod Touch 4',
        'iPod5,1'   : 'iPod Touch 5'
    }
};
var DeviceModel = Backbone.Model.extend({
    defaults : {
        device : '',
        color : '',
        sn : '',
        version : '',
        actived : '',
        battery : 0,
        isCharging : false,
        breaked : 'no'
    },
    helper : {
        getDeviceName : function(){
            return DeviceModelCP.NAME_MAP[this.device]
        }
    },
    parse : function(info, options){
        return {
            device : info.ProductType,
            color : info.DeviceColor,
            sn : info.SerialNumber,
            version : info.ProductVersion,
            actived : info.ActivationState == 'Activated' ? 'yes' : 'no',
            battery : info.Battery,
            isCharging : info.BatteryState == '1',
            breaked : info.isRoot == '1' ? 'yes' : 'no'
        }
    }
},DeviceModelCP);
module.exports = DeviceModel;