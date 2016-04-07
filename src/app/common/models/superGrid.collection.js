/**
 * Created by lidinghui on 14-9-12.
 */
/**
 * SuperGrid的容器基类
  * @type {exports}
 */
var Backbone = require('backbone');
var superGridModel = require('common:superGrid.model');


var superGridCollection = Backbone.Collection.extend({
    model : superGridModel,
    setSelected : function(modelId, selected){
        if(this.get(modelId)){
            this.get(modelId).set('selected',!!selected,{silent : true})
        }
    },
    clearSelected : function(){
        this.setSelectedAll(false);
    },
    setSelectedHistory : function(){
    },
    hasSelectedAll : function(){
        return this.size()>0 && this.all(function(model){
            return model.get('selected')
        });
    },
    setSelectedAll : function(selected){
        this.each(function(model){
            model.set('selected',selected,{silent : true});
        });
    },
    hasSelected: function(){
        return this.any(function(model){
            return model.get('selected')
        });
    },
    isSelectedModel : function(modelId){
        return this.get(modelId).get('selected')
    }
});


module.exports = superGridCollection;