angular.module('MyApp', ['ngCookies', 'ngResource', 'ngMessages', 'ngRoute', 'mgcrea.ngStrap'])
	.config(function() {
		// service that configures app linking paths, useful for disquis
		$locationProvider.html5Mode(true);

		
	});

