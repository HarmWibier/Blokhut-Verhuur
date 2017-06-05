var app = angular.module("blokhut_form", ["ngRoute", 'ui.bootstrap']);

app.config(function($routeProvider) {
    var dToday = new Date();
    
    $routeProvider
    .when("/planning/:YEAR/:MONTH", {
        templateUrl : "form.planning.htm",
        controller : "planningCtrl",
    })
    .when("/aanvragen", {
        templateUrl : "form.aanvragen.htm",
        controller : "aanvragenCtrl",
    })
    .when("/success", {
        templateUrl : "form.success.htm"
    })
    .otherwise({
        redirectTo: '/planning/' + dToday.getFullYear() + "/" + dToday.getMonth()
    });
});