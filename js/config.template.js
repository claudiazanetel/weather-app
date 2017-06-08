angular.module('weatherApp')
	.constant('OPENWEATHERMAP_APIKEY', '__OPENWEATHERMAP_APIKEY__');

angular.module('weatherApp')
	.config(['AnalyticsProvider', function (AnalyticsProvider) {
   		AnalyticsProvider.setAccount('__GOOGLEANALYTICS_APIKEY__');
	}])
	.run(['Analytics', function(Analytics) { }]);
