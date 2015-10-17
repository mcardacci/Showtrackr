angular.module('MyApp')
	.controller('AddCtrl', ['$scope', '$alert', 'Show', function($scope, $alert, Show) {
		//instead of making a post request with /api/shows, we inject the Show service
		//so we can use save() method provided in the $resource module (check
		//services/show.js). It makes the code cleaner
		$scope.addShow = function() {
			Show.save({ showName: $scope.showName },
				function() {
					$scope.showName = '';
					//$setPristine() clears the form of any errors after adding a Show
					//If this callback is successful, this controller sends a post request 
					//to /api/shows with the TV show name.
					$scope.addForm.$setPristine();
					//These '$alert's are part of the angular-strap lib
					$alert({
						content: 'TV show has been added.',
						placement: 'top-right',
						type: 'success',
						duration: 3
					});
				},
				//this callback handles errors
				function(response) {
					$scope.showName = '';
					$scope.addForm.$setPristine();
					$alert({
						content: response.data.message,
						placement: 'top-right',
						type: 'danger',
						duration: 3
					});
				});
		};
	}]);