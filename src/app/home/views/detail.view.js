/*@require home:detail.less*/
var Backbone = require('backbone');
var $ = Backbone.$;
var log = require('log');
var cefAPI = require('common:libs/cefAPI');
var DeviceModel = require('home:device.model');
var _ = require('underscore');

var DetailView = Backbone.View.extend({
    el          : '#detail-dialog',
    events      : {
        'click .close'            : function () {
            var backEnd = cefAPI.getCurrentBackEnd();
            backEnd.trigger('close');

            backEnd.close();
        },
        'click .open-in-notepad'  : function () {
            cefAPI.openDevInfoWithNotepad();
        },
        'click .copy-to-clipboard': function () {
            var text = this.getTextTable();
            cefAPI.copyTextToClipboard(text)
        }
    },
    tableTpl    : __inline('../templates/detail.mustache'),
    keys:[
        { 'DeviceName':  'Device Name'},
        { 'ActivationState': 'Activated'},
        { 'Jailbreaked': 'Jailbreaked'},
        {'Charging': 'Charging'},
        { 'Battery': 'Battery'},
        { 'OSVersion': 'OS Version'},
        { 'Model': 'Model'},
        { 'DeviceColor': 'Device Color'},
        { 'ShellColor': 'Shell Color'},
        { 'ICCID': 'ICCID'},
        { 'IMEI': 'IMEI'},
        { 'IMSI': 'IMSI'},
        { 'SerialNumber': 'Serial Number'},
        { 'ModemFirmware': 'Modem Firmware'},
        { 'DeviceUUID': 'Device ID'}
    ],
    getTextTable: function () {
        var str = [];
        var me = this;
        this.keys.forEach(function(val,index){
            for(var key in val){
                str.push(val[key] + '\t' + me.info[val[key]]);
            }
        });
        //_.each(this.info, function (val, key) {
        //    str.push(key + '\t' + val);
        //});
        return str.join('\r\n');
    },
    initialize  : function () {
        var me = this;
        me.$body = me.$('.detail-body');
        cefAPI.appDetail(function (data) {
            var json = JSON.parse(data || '{}');
            for(var key in json['info']){
                for(var i = 0;i<me.keys.length;i++){
                    for(var k in me.keys[i]){
                        if(key == k){
                            var value = json['info'][key];
                            delete json['info'][key];
                            json['info'][me.keys[i][k]] = value;
                        }
                    }
                }
            }
            var info = me.info = json && json.info || {};
            info.Jailbreaked = info.Jailbreaked == 0?'NO':'YES';
            info.Charging = info.Charging == 0?'NO':'YES';
            //info.Model = DeviceModel.NAME_MAP[info.Model];
            delete info.Carrier;
            me.render({info: info});
        });
    },
    render      : function (json) {
        var me = this,
            html = me.tableTpl(json);
        me.$body.html(html);
    }
});
module.exports = DetailView;
