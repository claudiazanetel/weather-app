angular.module('weatherApp', ['ngResource', 'ngStorage', 'angular-google-analytics'])
	.service('fetchWeatherData',['OPENWEATHERMAP_APIKEY','$resource', function(APIKEY, $resource) {

        this.getWeatherByCity = function() {
    		return $resource('http://api.openweathermap.org/data/2.5/weather?q=:city&units=metric&appid='+ APIKEY, {city:'@city'});
    	};

    	this.getSummaryWeatherByCity = function() {
    		return $resource('http://api.openweathermap.org/data/2.5/forecast/daily?q=:city&units=metric&appid='+ APIKEY, {city:'@city'});
    	};

    	this.getDetailedWeatherByCity = function() {
    		return $resource('http://api.openweathermap.org/data/2.5/forecast?q=:city&units=metric&appid='+ APIKEY, {city:'@city'});
    	};

	   	this.getWeatherByCoord = function() {
    		return $resource('http://api.openweathermap.org/data/2.5/weather?lat=:lat&lon=:lon&units=metric&appid='+ APIKEY, {lat:'@lat', lon:'@lon'});
    	};

	}])

	.service('favouritesService',['$localStorage', function($localStorage){
		this.storage = $localStorage.$default({
        	"cities": []
    	});

		this.getCities = function() {
			return this.storage.cities;
		};

		this.hasCity = function(city) {
			index = this.storage.cities.indexOf(city);
			if(index < 0){
				return false;
			}
			return true;
		};

		this.addCity = function(city) {
			if(!this.hasCity(city)){
				this.storage.cities.push(city);
			}
		};

		this.removeCity = function(city) {
			if(this.hasCity(city)){
				this.storage.cities.splice(index, 1);
			}
		};

		this.setMenu = function() {
	    	isMenuClosed = document.getElementById("favouritesMenu").style.width == "0px";
	    	if(isMenuClosed) {
	    		return document.getElementById("favouritesMenu").style.width = "50%";
	    	} else {
	    		return document.getElementById("favouritesMenu").style.width = "0px";
	    	}	 

		};

	    this.setStar = function(city){
	    	if(this.hasCity(city)) {
				return "glyphicon-star";
			} else {
			 	return "glyphicon-star-empty";
			}
	    };		

	}])

	.controller('weatherController', ['$scope', 'fetchWeatherData', 'favouritesService', function($scope, fetchWeatherData, favouritesService) {

		$scope.currentWeatherData = false;
		$scope.isDailyDataLoaded = false;
		$scope.isHourlyDataLoaded = false;
		$scope.detailedWeatherData = [];
		$scope.city = '';
		$scope.isLoading = false;
		$scope.isError = false;
		favouritesService.setMenu() == false;

		navigator.geolocation.watchPosition(
			function(location) {
				$scope.lat = location.coords.latitude;
				$scope.lon = location.coords.longitude;
				$scope.isLoading = true;

				fetchWeatherData.getWeatherByCoord().get({lat:$scope.lat, lon:$scope.lon})
		    		.$promise.then(function(currentData) {
		    			$scope.currentData = currentData;
		    			$scope.star = favouritesService.setStar($scope.currentData.name);
		      			getData($scope.currentData.name);
		      			$scope.currentWeatherData = true;
		      			$scope.isLoading = false;
		      			
		    	});
			},
			function(error) { 
				if($scope.$storage.cities.length > 0) {
    				$scope.chooseCity($scope.$storage.cities[0]);
  				} else {
  					console.log(error);
  				}
			}
		);

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
	      		$scope.star = favouritesService.setStar($scope.currentData.name);
	      		getData($scope.currentData.name);	      		
	    	}).catch(function(e){
	    		$scope.error = e;
	    		$scope.isLoading = false;
	      		$scope.isError = true;
	    	});
	    	$scope.city = '';
		};

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

	    $scope.addCityToFavorites = function(city){
	    	$scope.favoriteCity = city || $scope.currentData.name;
	    	if(favouritesService.hasCity($scope.favoriteCity)) {
				favouritesService.removeCity($scope.favoriteCity);
			} else {
			 	favouritesService.addCity($scope.favoriteCity);
			}	    	
			$scope.star = favouritesService.setStar($scope.favoriteCity);
	    };

	    $scope.toggleMenu = function(){
			favouritesService.setMenu();
	    };
/*
	    setStar = function(city){
	    	if(favouritesService.hasCity(city)) {
				$scope.star = "glyphicon-star";
			} else {
			 	$scope.star = "glyphicon-star-empty";
			}
	    };*/


	}])

	.controller('favouritesController', ['$scope', 'favouritesService', function($scope, favouritesService) {

	    $scope.favoutitesCities = favouritesService.getCities();

	    $scope.removeCityInFavoriteList = function(city){
	    	favouritesService.removeCity(city);
	    			


	    	//$scope.star = favouritesService.setStar(city);
	    	//console.log($scope.star);
	    	

	    };

	    $scope.toggleMenu = function(){
			favouritesService.setMenu();
	    };

console.log($scope.favoutitesCities);


/*	    $scope.toggleMenu = function(){
	    	console.log(document.getElementById("favouritesMenu").style.width);
	    	isMenuClosed = document.getElementById("favouritesMenu").style.width == "0px";
	    	if(isMenuClosed) {
	    		document.getElementById("favouritesMenu").style.width = "5%";
	    	} else {
	    		document.getElementById("favouritesMenu").style.width = "0px";
	    	}	    	
	    };
*/

	}])



