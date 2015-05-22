var kiosk = angular.module('kiosk', ['ngRoute', 'ngTouch', 'ngMaterial', 'ngMessages'])
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
  .config(function($mdThemingProvider) {
    $mdThemingProvider.theme('default')
      .primaryPalette('purple', {
        'default': '800',
      })
      .accentPalette('green', {
        'default': '800',
      })
      .warnPalette('red', {
        'default': '600'
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

kiosk.controller('homeController', function($scope, $http, $location) {
  // $http.get('/api/home')
  //   .success(function(data) {
  //     console.log(data);
  //     $scope.currentgames = data.games;
  //     $scope.cardsets = data.cardsets;
  //     $scope.currentUser = data.currUser;
  //   })
  //   .error(function(data) {
  //     console.log("Error: " + data);
  //   });

});

kiosk.controller('splashController', function($scope, $http, $location) {

});

kiosk.controller('videoController', function($scope, $http, $location) {

});

kiosk.controller('toolbarController', function($scope, $location, $window) {
  $scope.show_search = false;
  $scope.show_back = true;
  $scope.$on('$locationChangeStart', function(event) {
    console.log($location.path());
    if ($location.path() == "/home") {
      $scope.show_search = true;
    }
    if ($location.path() == "/welcome") {
      $scope.show_back = false;
    }
  });
  $scope.goBack = function(event) {
    $window.history.back();
  };
});
