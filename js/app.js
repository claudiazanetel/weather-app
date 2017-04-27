angular.module('weatherApp', ['ngResource'])
	.service('fetchWeatherData',['$resource', function($resource) {

        this.getWeatherByCity = function() {
        	return $resource('http://worksample-api.herokuapp.com/weather?q=:city&key=62fc4256-8f8c-11e5-8994-feff819cdc9f', {city:'@city'});
    	};

	}])

	.controller('MenuController', function($scope, fetchWeatherData) {

		$scope.city='Stockholm'
		fetchWeatherData.getWeatherByCity().get({city:$scope.city})
    	.$promise.then(function(data) {
      		console.log(data);
    	});


	})