// Check [here](https://docs.angularjs.org/guide/providers) for more information.
(function () {
    'use strict';

    angular.module('app')
        .constant('style', {
            primaryColor: "#0098cd",
            secondaryColor: "#6eb21f",
            chartColors: [
                "#2D6C92", "#BBD1E6"
            ],
            abcdColors:[
                "#055ec3", "#87befc", "#ffb91d", "#ff7803"
            ],
            abcColors: ["#2a6d94",'#5e92ae', "#e2ecf6"],
            heatmapColors:['#f47721', '#f7a064', '#f9bb90','#fecd62', '#fedb8e','#feeabb', '#c7ddf1','#b2d0ec',
            '#90bbe4','#80a0ce', '#6a91c6', '#2a61ae']
        })
        .constant('msg', {
            NO_DATA: "Can not get data.",
            NETWORK_ERROR: "Network error.",
            SYSTEM_BUSY:"Sorry, our system is busy. Please try again later."
        });

}());