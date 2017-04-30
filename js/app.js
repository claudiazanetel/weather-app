angular.module('weatherApp', ['ngResource'])
	.service('fetchWeatherData',['$resource', function($resource) {

        this.getWeatherByCity = function() {
        	return $resource('http://worksample-api.herokuapp.com/weather?q=:city&key=62fc4256-8f8c-11e5-8994-feff819cdc9f', {city:'@city'});
    	};

    	this.getWeatherByCoord = function() {
    		return $resource('http://worksample-api.herokuapp.com/weather?lat=:lat&lon=:lon&key=62fc4256-8f8c-11e5-8994-feff819cdc9f', {lat:'@lat', lon:'@lon'});
    	};

	}])

	.directive('dateNow', ['$filter', function($filter) {
  		return {
    		link: function( $scope, $element, $attrs) {
      			$element.text($filter('date')(new Date(), $attrs.dateNow));
    		}
  		};
	}])

	.controller('weatherController', ['$scope', 'fetchWeatherData', function($scope, fetchWeatherData) {

		$scope.currentWeatherData = false;
		$scope.city=''
		$scope.chooseCity = function() {
		
			fetchWeatherData.getWeatherByCity().get({city:$scope.city})
	    	.$promise.then(function(data) {
	    		$scope.data = data;
	      		console.log(data);
	    	});
	    	$scope.currentWeatherData = true;
	    	$scope.city = ''
		};

		$scope.lat=''
		$scope.lon=''
		$scope.chooseCoord = function() {

			fetchWeatherData.getWeatherByCoord().get({lat:$scope.lat, lon:$scope.lon})
	    	.$promise.then(function(data) {
	      		console.log(data);
	    	});

	    };	
	}])


