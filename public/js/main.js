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

kiosk.config(function($routeProvider) {
  $routeProvider
    .when('/', {
      templateUrl: '../pages/home.html',
      controller: 'homeController'
    });
});

kiosk.controller('sidenavcontroller', function($scope, $http, $location, $timeout, $mdSidenav, $mdUtil, $log) {
  $scope.toggleLeft = buildToggler('left');
  $scope.toggleRight = buildToggler('right');
  /**
   * Build handler to open/close a SideNav; when animation finishes
   * report completion in console
   */
  function buildToggler(navID) {
    console.log('CLICK ', navID)
    var debounceFn = $mdUtil.debounce(function() {
      $mdSidenav(navID)
        .toggle()
        .then(function() {
          $log.debug("toggle " + navID + " is done");
        });
    }, 300);
    return debounceFn;
  }
});

kiosk.controller('homeController', function($scope, $http, $location, $timeout, $mdSidenav, $mdUtil, $log) {
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

kiosk.controller('toolbarcontroller', function($scope) {
  });

kiosk.controller('LeftCtrl', function($scope, $timeout, $mdSidenav, $log) {
  $scope.close = function() {
    $mdSidenav('left').close()
      .then(function() {
        $log.debug("close LEFT is done");
      });
  };
});

kiosk.controller('RightCtrl', function($scope, $timeout, $mdSidenav, $log) {
  $scope.close = function() {
    $mdSidenav('right').close()
      .then(function() {
        $log.debug("close RIGHT is done");
      });
  };
});
