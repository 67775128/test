'use strict';


angular.module('app')
	.service('modelDescriptionService', ['$http', '$q', 'apiLsWeb',function ($http,$q,apiLsWeb) {

		function queryModelDescription(segmentId,modelType){
			return $http({
				method: 'get',
				url: apiLsWeb + "model/queryModelDescription?segmentId="+segmentId+'&modelType='+modelType,
				cache: false
			})
		};
		function addModelDescription(params){
			var params = angular.extend({
				segmentId:'',
				modelType:'',
				description:'',
				tips:''
			},params)
			return $http({
				method: 'post',
				url: apiLsWeb + "model/addModelDescription",
				cache: false,
				data:params
			})
		};
		return {
			queryModelDescription:queryModelDescription,
			addModelDescription:addModelDescription
		}
}]);