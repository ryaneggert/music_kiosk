var kiosk = angular.module('kiosk', ['ngRoute', 'ngTouch', 'ngMaterial', 'ngMessages', 'ngFx', 'ngAnimate', 'truncate', 'youtube-embed'])
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
  .service('Tools', function() {
    var toolService = {};
    toolService.shuffle = function(array) {
      var currentIndex = array.length,
        temporaryValue, randomIndex;
      // While there remain elements to shuffle...
      while (0 !== currentIndex) {
        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;
        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
      }
      return array;
    };
    return toolService;
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

kiosk.directive('onFinishRender', function($timeout) {
  return {
    restrict: 'A',
    link: function(scope, element, attr) {
      if (scope.$last === true) {
        $timeout(function() {
          scope.$emit('ngRepeatFinished');
        });
      }
    }
  };
});

kiosk.filter('offset', function() {
  return function(input, start) {
    if (input) {
      start = parseInt(start, 10);
      return input.slice(start);
    } else {
      return;
    }
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

kiosk.controller('homeController', function($scope, $http, $location, $filter, Search, Tools) {
  var range = function(i) {
    return i ? range(i - 1).concat(i) : [];
  };

  $scope.goToVideo = function(videoId) {
    $location.path('/watch/' + videoId);
  };
  $scope.applyfilters = function() {
    $scope.filteredvids = $filter('filter')($scope.videos, {
      name: $scope.searchText,
      playlists: ['OCO']
    });
  };

  $scope.calculatePages = function() {
    $scope.pages = Math.ceil($scope.filteredvids.length / $scope.itemsPerPage);
    console.log('Pages: ', $scope.pages);
    $scope.pagelist = range(Math.max($scope.pages, 1));
    console.log($scope.pagelist)
  };

  $scope.updateCurrentPage = function() {
    if ($scope.currentPage > $scope.pages - 1) {
      $scope.currentPage = $scope.pages - 1;
    }
  };



  $scope.toggleFilterButton = function(group, idx) {
    console.log(group, idx)
    $scope.filterButtonSelected[idx] = !$scope.filterButtonSelected[idx];
  };

  $scope.notAllSelected = function() {
    if ($scope.filterButtonSelected.reduce(function(pv, cv) {
        return pv + cv;
      }, 0) < $scope.categories.length) {
      return true;
    } else {
      return false;
    }
  };

  $scope.notAllDeSelected = function() {
    if ($scope.filterButtonSelected.reduce(function(pv, cv) {
        return pv + cv;
      }, 0) > 0) {
      return true;
    } else {
      return false;
    }
  };

  $scope.$on('searchUpdate', function() {
    $scope.searchText = Search.text;
    console.log('curpage: ', $scope.currentPage)
    $scope.applyfilters();
    $scope.calculatePages();
    $scope.updateCurrentPage();
  });
  $scope.filteredvids = [];
  $scope.itemsPerPage = 6;
  $scope.currentPage = 0;
  $scope.filterButtonSelected = [];


  $http.get('/videos')
    .success(function(playlists) {
      $scope.playlists = playlists;
      $scope.categories = playlists.map(function(plt) {
        return plt.name;
      });
      var videosArr = playlists.map(function(plt) {
        return plt.videos;
      });
      var zrohd = [];
      for (var i = 0; i < $scope.categories.length; i++) {
        zrohd[i] = 0;
      }
      $scope.filterButtonSelected = zrohd;
      $scope.videos = Tools.shuffle([].concat.apply([], videosArr));
      $scope.filteredvids = $scope.videos;
      $scope.calculatePages();
    })
    .error(function(data) {
      console.log("Error: " + data);
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

kiosk.controller('videoController', function($scope, $http, $location, $routeParams) {
  console.log($routeParams)
  $http.post('/videos', {
      videoId: $routeParams.id
    })
    .success(function(video) {
      console.log('VIDEO')
      console.log(video);
      $scope.video = video;
      $scope.this_video_id = $scope.video.videoId;
    })
    .error(function(data) {
      console.log("Error: " + data);
    });
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
    if (!$scope.show_searchBar) {
      $scope.show_searchBar = !$scope.show_searchBar;
    } // Else this just hides iOS keyboard on click by removing focus from input.
  };
  $scope.updateSearch = function() {
    Search.update($scope.searchInput);
  };
});
