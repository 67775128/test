var _ = require('underscore');

var BASE_SIZE = 1024;
var SIZE_B = 1;
var SIZE_K = BASE_SIZE * SIZE_B;
var SIZE_M = BASE_SIZE * SIZE_K;
var SIZE_G = BASE_SIZE * SIZE_M;

module.exports.format = function(bytes){
    var result;
    if(_.isString(bytes)){
        bytes = parseInt(bytes,10);
    }
    if(bytes > SIZE_G){
        result = (bytes / SIZE_G).toFixed(2) + 'G';
    }
    else if(bytes > SIZE_M){
        result = (bytes / SIZE_M).toFixed(2) + 'M';
    }
    else if(bytes > SIZE_K){
        result = (bytes / SIZE_K).toFixed(2) + 'K';
    }
    else {
        result = (bytes / SIZE_B).toFixed(2) + 'B';
    }
    return result;
};
