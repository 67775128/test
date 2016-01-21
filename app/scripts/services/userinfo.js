'use strict';


angular.module('app')
	.service('userInfoService', ['$http', '$q', 'apiLsWeb',function ($http,$q,apiLsWeb) {
		var userinfo = null;
		function getUserInfo(){
			var deferred = $q.defer();
			var promise = deferred.promise;
			if (userinfo) {
				deferred.resolve(userinfo);
				return promise;
			};
			return $http({
				method: 'get',
				url: apiLsWeb + "userInfo",
				cache: false
			}).then(function(msg){
				userinfo = msg.data;
				return userinfo;
			})
		};
		function isSuperUserCheck(){

			return getUserInfo().then(function(msg){
				if(msg.edpUser){
					return true;
				}else{
					return false;
				}
			})
		}
		return {
			getUserInfo:getUserInfo,
			isSuperUserCheck:isSuperUserCheck
		}
}]);