angular.module('weatherApp', ['ngResource'])
	.service('fetchWeatherData',['$resource', function($resource) {

        this.getWeatherByCity = function() {
        	return $resource('http://worksample-api.herokuapp.com/weather?q=:city&key=62fc4256-8f8c-11e5-8994-feff819cdc9f', {city:'@city'});
    		//return $resource('http://api.openweathermap.org/data/2.5/weather?q=:city&appid=4b80da9843e489246022d72d79a1e508', {city:'@city'});

    	};

    	this.getSummaryWeatherByCity = function() {
    		return $resource('http://worksample-api.herokuapp.com/forecast/daily?q=:city&key=62fc4256-8f8c-11e5-8994-feff819cdc9f', {city:'@city'});
    		//return $resource('http://api.openweathermap.org/data/2.5/forecast/daily?q=:city&appid=4b80da9843e489246022d72d79a1e508', {city:'@city'});
    	};

    	this.getDetailedWeatherByCity = function() {
    		return $resource('http://worksample-api.herokuapp.com/forecast?q=:city&key=62fc4256-8f8c-11e5-8994-feff819cdc9f', {city:'@city'});
    		//return $resource('http://api.openweathermap.org/data/2.5/forecast?q=:city&appid=4b80da9843e489246022d72d79a1e508', {city:'@city'});
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

	    	getData($scope.city);

	    	$scope.currentWeatherData = true;
	    	$scope.city = ''
		};

		navigator.geolocation.getCurrentPosition(function(location) {
			$scope.lat= location.coords.latitude
			$scope.lon = location.coords.longitude
			console.log($scope.lat);
			console.log($scope.lon);

			fetchWeatherData.getWeatherByCoord().get({lat:$scope.lat, lon:$scope.lon})
	    		.$promise.then(function(currentData) {
	    			$scope.currentData = currentData;
	      			console.log(currentData);
	      			getData($scope.currentData.name);
	      			$scope.currentWeatherData = true;	

	    	});
		});

		getData = function(city){
			fetchWeatherData.getSummaryWeatherByCity().get({city:city})
	    	.$promise.then(function(dailyData) {
	    		$scope.dailyData = dailyData;
	      		console.log(dailyData);
	      		console.log(dailyData.list[0].dt);
	      		$scope.changeDay(dailyData.city.name, dailyData.list[0].dt);
	    	});

	    	fetchWeatherData.getDetailedWeatherByCity().get({city:city})
	    	.$promise.then(function(hourlyData) {
	    		$scope.hourlyData = hourlyData;
	      		console.log(hourlyData);
	      		$scope.detailedWeatherData = hourlyData.list;
	    	});
		};


		//$scope.chooseCoord = function() {



	    //};	



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

