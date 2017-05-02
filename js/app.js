angular.module('weatherApp', ['ngResource'])
	.service('fetchWeatherData',['$resource', function($resource) {

        this.getWeatherByCity = function() {
        	return $resource('http://worksample-api.herokuapp.com/weather?q=:city&key=62fc4256-8f8c-11e5-8994-feff819cdc9f', {city:'@city'});
    	};

    	this.getSummaryWeatherByCity = function() {
    		return $resource('http://worksample-api.herokuapp.com/forecast/daily?q=:city&key=62fc4256-8f8c-11e5-8994-feff819cdc9f', {city:'@city'});
    	};

    	this.getDetailedWeatherByCity = function() {
    		return $resource('http://worksample-api.herokuapp.com/forecast?q=:city&key=62fc4256-8f8c-11e5-8994-feff819cdc9f', {city:'@city'});
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
		$scope.detailedWeatherData = [];
		$scope.city=''
		$scope.chooseCity = function() {
		
			fetchWeatherData.getWeatherByCity().get({city:$scope.city})
	    	.$promise.then(function(currentData) {
	    		$scope.currentData = currentData;
	      		console.log(currentData);
	    	});
	    	fetchWeatherData.getSummaryWeatherByCity().get({city:$scope.city})
	    	.$promise.then(function(dailyData) {
	    		$scope.dailyData = dailyData;
	      		console.log(dailyData);
	    	});

	    	fetchWeatherData.getDetailedWeatherByCity().get({city:$scope.city})
	    	.$promise.then(function(hourlyData) {
	    		$scope.hourlyData = hourlyData;
	      		console.log(hourlyData);
	      		$scope.detailedWeatherData = hourlyData.list;
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

	    $scope.changeDay = function(city, day){
	    	$scope.selectedDay = day - 36000;
	    	fetchWeatherData.getDetailedWeatherByCity().get({city:city})
	    	.$promise.then(function(hours) {
	    		$scope.hours = hours;
	      		console.log(hours);
	    	});
	    	$scope.prova='prova'
	    };

	    $scope.getDaysDetails = function(){
	    	return $scope.detailedWeatherData.filter(function(element){
	    		return element.dt >= $scope.selectedDay && element.dt < $scope.selectedDay + 24*3600-1;
	    	});

	    };
	}])

