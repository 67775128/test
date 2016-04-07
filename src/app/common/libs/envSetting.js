/**
 * Created by lidinghui on 14-9-3.
 */
var $ = require('jquery');

module.exports = function(){
    return;
    $(document).on('dragenter',function(e){
        e.preventDefault();
    }).on('keydown',':not(input,textarea)',function(e){
        if(8 === e.keyCode){
            e.preventDefault();
            // historyManager.back();
        }
    }).on('click','a',function(e){
        e.preventDefault();
        var href = $(e.currentTarget).attr('href');
        if (!!href && href.slice(0, 5) != 'file:' && href.slice(0, 10) != 'javascript') {
//            utils.browser(href);
        };
    });
};