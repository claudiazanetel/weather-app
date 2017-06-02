angular.module('weatherApp', ['ngResource', 'ngStorage'])
	.service('fetchWeatherData',['$resource', function($resource) {

        this.getWeatherByCity = function() {
    		return $resource('http://api.openweathermap.org/data/2.5/weather?q=:city&units=metric&appid=4b80da9843e489246022d72d79a1e508', {city:'@city'});
    	};

    	this.getSummaryWeatherByCity = function() {
    		return $resource('http://api.openweathermap.org/data/2.5/forecast/daily?q=:city&units=metric&appid=4b80da9843e489246022d72d79a1e508', {city:'@city'});
    	};

    	this.getDetailedWeatherByCity = function() {
    		return $resource('http://api.openweathermap.org/data/2.5/forecast?q=:city&units=metric&appid=4b80da9843e489246022d72d79a1e508', {city:'@city'});
    	};

	   	this.getWeatherByCoord = function() {
    		return $resource('http://api.openweathermap.org/data/2.5/weather?lat=:lat&lon=:lon&units=metric&appid=4b80da9843e489246022d72d79a1e508', {lat:'@lat', lon:'@lon'});
    	};

	}])

	.controller('weatherController', ['$scope', 'fetchWeatherData', '$localStorage', function($scope, fetchWeatherData, $localStorage) {

		$scope.currentWeatherData = false;
		$scope.isDailyDataLoaded = false;
		$scope.isHourlyDataLoaded = false;
		$scope.detailedWeatherData = [];
		$scope.city = '';
		$scope.isLoading = false;
		$scope.isError = false;

		$scope.chooseCity = function(city) {
			$scope.isError = false;
			$scope.isLoading = true;
			$scope.currentWeatherData = false;
			$scope.isDailyDataLoaded = false;
			$scope.isHourlyDataLoaded = false;
			inputCity = city || $scope.city;
			fetchWeatherData.getWeatherByCity().get({city:inputCity})
	    	.$promise.then(function(currentData) {
	    		$scope.currentData = currentData;					
	      		$scope.isLoading = false;
	      		$scope.isError = false;
	      		$scope.currentWeatherData = true;
	      		$scope.setStar($scope.currentData.name);
	      		getData($scope.currentData.name);

	    	}).catch(function(e){
	    		$scope.error = e;
	    		$scope.isLoading = false;
	      		$scope.isError = true;
	    	});
			
	    	$scope.city = '';
		};

		navigator.geolocation.getCurrentPosition(function(location) {
			$scope.lat= location.coords.latitude;
			$scope.lon = location.coords.longitude;
			$scope.isLoading = true;

			fetchWeatherData.getWeatherByCoord().get({lat:$scope.lat, lon:$scope.lon})
	    		.$promise.then(function(currentData) {
	    			$scope.currentData = currentData;
	    			$scope.setStar($scope.currentData.name);
	      			getData($scope.currentData.name);
	      			$scope.currentWeatherData = true;
	      			$scope.isLoading = false;
	    	});
		});

		getData = function(city){
			fetchWeatherData.getSummaryWeatherByCity().get({city:city})
	    	.$promise.then(function(dailyData) {
	    		$scope.dailyData = dailyData;
	      		$scope.changeDay(dailyData.list[0].dt);
	      		$scope.selectedDay = dailyData.list[0].dt;
	      		$scope.isDailyDataLoaded = true;
	    	});

	    	fetchWeatherData.getDetailedWeatherByCity().get({city:city})
	    	.$promise.then(function(hourlyData) {
	    		$scope.hourlyData = hourlyData;
	      		$scope.detailedWeatherData = hourlyData.list;
	      		$scope.isHourlyDataLoaded = true;
	    	});

		};

	    $scope.changeDay = function(day){
	    	$scope.selectedDay = day;
	    };

	    $scope.getDaysDetails = function(){
	    	var dateFrom = new Date($scope.selectedDay*1000);
	    	var dateTo = new Date($scope.selectedDay*1000);
	    	dateFrom.setHours(0,0,0,0);
	    	dateTo.setHours(23,59,59,999);
	    	var from = dateFrom.getTime()/1000;
	    	var to = dateTo.getTime()/1000;
	    	return $scope.detailedWeatherData.filter(function(element){
	    		return element.dt >= from && element.dt < to;
	    	});

	    };

	    $scope.$storage = $localStorage.$default({
        	"cities": []
    	});

	    $scope.addCityToFavorites = function(city){
	    	$scope.favoriteCity = city || $scope.currentData.name;
	    	//$scope.favoriteCity = $scope.currentData.name;
	    	index = $scope.$storage.cities.indexOf($scope.favoriteCity)
	    	if(index < 0) {
				$scope.$storage.cities.push($scope.favoriteCity);
			} else {
				$scope.$storage.cities.splice(index, 1);
			}
			$scope.setStar($scope.favoriteCity);

	    };

	    $scope.setStar = function(city){
	    	index = $scope.$storage.cities.indexOf(city);
	    	if(index < 0) {
	    		console.log($scope.$storage.cities);
				console.log('stellina vuota --> '+city);
				$scope.star = "glyphicon-star-empty";
			} else {
				console.log($scope.$storage.cities);
				console.log('stellina piena -->'+city);
				$scope.star = "glyphicon-star";
			}
	    };
	}])
