angular.module('MyApp')
//$resource is a factory that crates a resource object that lets you
//interact with RESTful server-side data sources
//angular provides factories so we don't handle http
//requests inside controllers. Keeps code modular
	.factory('Show', ['$resource', function($resource) {
		return $resource('/api/shows/:id');
	}]);		
// //By default this service has the following methods.
// { 'get':    {method:'GET'},
//   'save':   {method:'POST'},
//   'query':  {method:'GET', isArray:true},
//   'remove': {method:'DELETE'},
//   'delete': {method:'DELETE'} };

