/* 
   Set up the Angular.js controllers, the A in the MEAN stack (from mean.io).

   This code updates the thermometer dynamically. It's the client-side
   function within the page that sets up the OrdersCtrl controller on the
   homepage.

   NOTE: For simplicity we've hardcoded the path to the corresponding
   /api/orders route defined in routes.js in API_ORDER_ROUTE. If you have a
   large number of routes to share between client- and server-side code and
   really want single-point-of-truth for route definitions, one approach is
   to define a separate file or variable with public route names meant to be
   seen on the client side and then import that on both the client- and
   server-side (and then perhaps obfuscate the code prior to serving it up).
*/
var API_ORDER_ROUTE = '/api/orders';
function OrdersCtrl($http, $scope) {
  $http.get(API_ORDER_ROUTE).success(function(data, status, headers, config) {
    if (data.error) {
      $scope.error = data.error;
    } else {
      $scope.num_orders = data.num_orders;
      $scope.total_funded = data.total_funded.toFixed(2);
      $scope.unit_symbol = data.unit_symbol;
      $scope.target = data.target;
      $scope.days_left = data.days_left ? data.days_left : 0;
      $scope.percentage_funded = Math.min($scope.total_funded / $scope.target * 100.0, 100);
    }
  }).error(function(data, status, headers, config) {
    $scope.error = "Error fetching order statistics.";
  });
}
