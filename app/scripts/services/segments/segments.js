'use strict';

angular.module('app')
		.factory('segmentsService', function ($http, apiLsWeb, apiDpWeb, topAlert, $q,style) {
			var selectedSegment = null;
			function getSegments() {

				return $http.get(apiLsWeb + 'user/segments', {cache: false}).then(function(resource){
					console.log('ls-web/user/segments=======',resource);
					return resource.data;
				})
			};
			function getSelectedSegment(){
				return selectedSegment;
			};
			function setSelectedSegment(value){
				selectedSegment = value;
			}
			return {
				selectedSegment:null,
				getSelectedSegment:getSelectedSegment,
				setSelectedSegment:setSelectedSegment,
				getSegments:getSegments
			}
		});