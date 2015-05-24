var kiosk = angular.module('kiosk', ['ngRoute', 'ngTouch', 'ngMaterial', 'ngMessages', 'truncate'])
  .factory('focus', function($timeout) {
    return function(id) {
      // timeout makes sure that it is invoked after any other event has been triggered.
      // e.g. click events that need to run before the focus or
      // inputs elements that are in a disabled state but are enabled when those events
      // are triggered.
      $timeout(function() {
        var element = document.getElementById(id);
        if (element)
          element.focus();
      });
    };
  })
  .service('AuthInterceptor', function($window) {
    var service = this;

    service.response = function(response) {
      if (response.data === 'redir') {
        console.log('DEAUTHD');
        $window.location.reload();
      }
      return response;
    };
  })
  .service('Search', function($rootScope) {
    var searchService = {};
    searchService.text = undefined;

    searchService.update = function(newinput) {
      searchService.text = newinput;
      $rootScope.$broadcast('searchUpdate');
    };
    return searchService;
  })
  .config(function($mdThemingProvider) {
    $mdThemingProvider.theme('default')
      .primaryPalette('blue', {
        'default': '700',
      })
      .accentPalette('orange', {
        'default': '300',
      })
      .warnPalette('red', {
        'default': '500'
      });
  });

kiosk.directive('eventFocus', function(focus) {
  return function(scope, elem, attr) {
    elem.on(attr.eventFocus, function() {
      focus(attr.eventFocusId);
    });
    // Removes bound events in the element itself
    // when the scope is destroyed
    scope.$on('$destroy', function() {
      elem.off(attr.eventFocus);
    });
  };
});

kiosk.config(function($httpProvider) {
  $httpProvider.interceptors.push('AuthInterceptor');
});

kiosk.config(function($routeProvider, $locationProvider) {
  $routeProvider
    .when('/welcome', {
      templateUrl: '../pages/splash.html',
      controller: 'splashController'
    })
    .when('/home', {
      templateUrl: '../pages/home.html',
      controller: 'homeController'
    })
    .when('/watch/:id', {
      templateUrl: '../pages/video.html',
      controller: 'videoController'
    })
    .otherwise({
      redirectTo: '/welcome'
    });

  // use the HTML5 History API
  $locationProvider.html5Mode({
    enabled: true,
    requireBase: true
  });
});

kiosk.controller('homeController', function($scope, $http, $location, Search) {
  $http.get('/videos')
    .success(function(playlists) {
      $scope.playlists = playlists;
      $scope.categories = playlists.map(function(plt) {
        return plt.name;
      });
      var videosArr = playlists.map(function(plt) {
        return plt.videos;
      });
      $scope.videos = [].concat.apply([], videosArr);

    })
    .error(function(data) {
      console.log("Error: " + data);
    });
  $scope.$on('searchUpdate', function() {
    $scope.searchText = Search.text;
  });

});

kiosk.controller('splashController', function($scope, $http, $location) {
  $scope.explore = function(event) {
    event.preventDefault();
    // Tell server to update video database
    $http.post('/videos/update', {
        action: 'fetch'
      })
      .success(function(update) {
        if (update.failed) {
          if (update.info === 'No playlists') {
            console.error('ERROR: Did not find any YouTube playlists.');
          } else {
            console.error('ERROR: Could not update video database');
          }
        }
        $location.path('/home');
      })
      .error(function(data) {
        console.log('ERROR: Could not communicate with server to update video database');
        $location.path('/home');
      });
  };
});

kiosk.controller('videoController', function($scope, $http, $location) {

});

kiosk.controller('toolbarController', function($scope, $location, $window, Search) {
  $scope.show_search = false;
  $scope.show_searchBar = false;
  $scope.show_back = true;
  $scope.$on('$locationChangeStart', function(event, next, current) {
    if ($location.path() == "/home") {
      $scope.show_search = true;
    } else {
      $scope.show_search = false;
    }
    if ($location.path() == "/welcome") {
      $scope.show_back = false;
    } else {
      $scope.show_back = true;
    }
  });
  $scope.goBack = function(event) {
    $window.history.back();
  };
  $scope.clearSearch = function() {
    $scope.searchInput = undefined;
    Search.update($scope.searchInput);
  };
  $scope.toggleSearchBar = function() {
    $scope.clearSearch();
    $scope.show_searchBar = !$scope.show_searchBar;
  };
  $scope.updateSearch = function() {
    Search.update($scope.searchInput);
  };
});
