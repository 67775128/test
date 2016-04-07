/**
 * Created by lidinghui on 14-9-12.
 */

/**
 * SuperGrid的模型基类
  * @type {exports}
 */
var Backbone = require('backbone');

var SuperGridModel = Backbone.Model.extend({
    defaults : {
        selected : false,
        even : false
    },
    isSelected : function(){
        return this.get('selected');
    },
    setSelected : function(selected){
        this.set('selected',!!selected,{silent : true});
    }
});

module.exports = SuperGridModel;