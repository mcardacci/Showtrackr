angular.module('MyApp')
//$resource is a factory that crates a resource object tthatt letts you
//interact with RESTful server-side data sources
	.factory('Show', ['$resource', function($resource) {
		return $resource('/api/shows/:id');
	}]);		