angular.module('MyApp')
  .controller('DetailCtrl', function($scope, $rootScope, $routeParams, Show, Subscription) {
      Show.get({ _id: $routeParams.id }, function(show) {
        $scope.show = show;
        // console.log(show);
//when we get a response from the Show service  
//above we add it to scope in order to make it 
//to detail.html
      $scope.isSubscribed = function() {
          return $scope.show.subscribers.indexOf($rootScope.currentUser._id) !== -1;
        };
      // pushes user id into subscriber array in the subscriber model
      $scope.subscribe = function() {
          Subscription.subscribe(show).success(function() {
            $scope.show.subscribers.push($rootScope.currentUser._id);
          });
        };

      $scope.unsubscribe = function() {
          Subscription.unsubscribe(show).success(function() {
            var index = $scope.show.subscribers.indexOf($rootScope.currentUser._id);
            $scope.show.subscribers.splice(index, 1);
          });
        };

//filter() method goes through every episode and checks if
//it passes the 'new Date(episode.firstAired)' condition
       $scope.nextEpisode = show.filter(function(episode) {
          return new Date(episode.firstAired) > new Date();
        });
      });
    });