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

	}])

	.controller('weatherController', ['$rootScope', '$scope', 'fetchWeatherData', 'favouritesService', function($rootScope, $scope, fetchWeatherData, favouritesService) {

		$scope.isPageEmpty = true;
		$scope.detailedWeatherData = [];
		$scope.city = '';
		$scope.isLoading = false;
		$scope.isError = false;

		navigator.geolocation.watchPosition(
			function(location) {
				$scope.lat = location.coords.latitude;
				$scope.lon = location.coords.longitude;
				$scope.isLoading = true;
				$scope.isPageEmpty = true;

				fetchWeatherData.getWeatherByCoord().get({lat:$scope.lat, lon:$scope.lon})
		    		.$promise.then(function(currentData) {
		    			$scope.currentData = currentData;
		      			getData($scope.currentData.name);
		      			$scope.isLoading = false;
		      			$scope.isPageEmpty = false;
		      			
		    	});
			},
			function(error) { 
				if(favouritesService.getCities().length > 0) {
    				$scope.chooseCity(favouritesService.getCities()[0]);
  				} else {
  					console.log(error);
  				}
			}
		);

		$scope.chooseCity = function(city) {
			$scope.isError = false;
			$scope.isLoading = true;
			$scope.isPageEmpty = true;
			inputCity = city || $scope.city;
			fetchWeatherData.getWeatherByCity().get({city:inputCity})
	    	.$promise.then(function(currentData) {
	    		$scope.currentData = currentData;					
	      		$scope.isLoading = false;
	      		$scope.isError = false;
	      		$scope.isPageEmpty = false;
	      		getData($scope.currentData.name);	      		
	    	}).catch(function(e){
	    		$scope.error = e;
	    		$scope.isLoading = false;
	      		$scope.isError = true;
	      		$scope.isPageEmpty = false;
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
	    	//$scope.favoriteCity = city || $scope.currentData.name;
	    	if(favouritesService.hasCity(city)) {
				favouritesService.removeCity(city);
			} else {
			 	favouritesService.addCity(city);
			}
	    };

	    $scope.openMenu = function(){
	    	if(screen.width > 600){
	    		document.getElementById("favouritesMenu").style.width = "30%";
				document.getElementById("trasparentPage").style.width = "70%";
	    	}else{
	    		document.getElementById("favouritesMenu").style.width = "80%";
				document.getElementById("trasparentPage").style.width = "20%";
	    	}

	    };

	    $scope.getStar = function(city){
	    	if(favouritesService.hasCity(city)) {
				return "glyphicon-star";
			} else {
			 	return "glyphicon-star-empty";
			}
	    };

		$rootScope.$on('changeCity', function(event, city) {
			if(city != $scope.currentData.name){
				$scope.chooseCity(city);
			}
		});

	}])

	.controller('favouritesController', ['$rootScope', '$scope', 'favouritesService', function($rootScope, $scope, favouritesService) {

	    $scope.getFavouriteCities = function() {
	    	return favouritesService.getCities();
	    };

	    $scope.removeCityFromFavoriteList = function(city){
	    	favouritesService.removeCity(city);
	    };

	    $scope.closeMenu = function(){
			document.getElementById("favouritesMenu").style.width = "0px";
			document.getElementById("trasparentPage").style.width = "0px";

	    };

	    $scope.loadCity = function(city){
	    	$rootScope.$emit('changeCity', city);
	    };

	}])



