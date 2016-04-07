/**
 * Created by lidinghui on 14/11/20.
 */
var BackboneIndexedDB = require('backbone.indexeddb');


var taskDB = {
    id: "igenie-taskdb",
    description: "The database for the Movies",
    migrations: [{
        version: 4,
        migrate: function (transaction, next) {
            var db = transaction.db;
            if(!db.objectStoreNames.contains('processApps')){
                var processAppsStore = transaction.db.createObjectStore("processApps");
                // 索引appBundleIDIndex
                processAppsStore.createIndex("appBundleIDIndex", "appBundleID", {
                    unique: false
                });
                // 索引deviceIDIndex
                processAppsStore.createIndex("deviceIDIndex", "deviceID", {
                    unique: false
                });
                // 索引Type
                processAppsStore.createIndex("typeIndex", "type", {
                    unique: false
                });
            }
            if(!db.objectStoreNames.contains('completedApps')){
                var completedAppsStore = transaction.db.createObjectStore("completedApps");
                // 索引deviceIDIndex
                completedAppsStore.createIndex("deviceIDIndex", "deviceID", {
                    unique : false
                });
            }
            next();
        }
    }]
};


module.exports = taskDB;