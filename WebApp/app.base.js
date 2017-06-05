var app = angular.module("blokhut_verhuur", ["ngRoute", 'ui.bootstrap']);


app.config(function($routeProvider) {
    var dToday = new Date();
    
    $routeProvider
    .when("/", {
        templateUrl : "view.welcome.htm",
        requireLevel: 0
    })
    .when("/planning/:YEAR/:MONTH", {
        templateUrl : "view.planning.htm",
        controller : "planningCtrl",
        requireLevel: 1,
        menuName : "Planning",
        link : '#/planning/' + dToday.getFullYear() + "/" + dToday.getMonth(), label : 'Planning'
    })
    .when("/aanvragen", {
        templateUrl : "view.reserveringen.htm",
        controller : "reserveringenCtrl",
        requireLevel: 1,
        menuName : "Aanvragen",
        link : "#/aanvragen"
    })
    .when("/reserveringen", {
        templateUrl : "view.reserveringen.htm",
        controller : "reserveringenCtrl",
        requireLevel: 1,
        menuName : "Reserveringen",
        link : "#/reserveringen"
    })
    .when("/reservering/:ID", {
        templateUrl : "view.reservering.htm",
        controller : "reserveringCtrl",
        requireLevel: 1,
        highlightMenu : "Reserveringen"
    })
    .when("/herhalingen", {
        templateUrl : "view.herhalingen.htm",
        controller : "herhalingenCtrl",
        requireLevel: 1,
        menuName : "Herhalingen",
        link : "#/herhalingen"
    })
    .when("/herhaling/:ID", {
        templateUrl : "view.herhaling.htm",
        controller : "herhalingCtrl",
        requireLevel: 1,
        highlightMenu : "Herhalingen"
    })
    .when("/gebruikers", {
        templateUrl : "view.gebruikers.htm",
        controller : "gebruikersCtrl",
        requireLevel: 10,
        menuName : "Gebruikers",
        link : "#/gebruikers"
    })
    .when("/gebruiker/:ID", {
        templateUrl : "view.gebruiker.htm",
        controller : "gebruikerCtrl",
        requireLevel: 10,
        highlightMenu : "Gebruikers"
    })
    .when("/login", {
        templateUrl : "view.login.htm",
        controller : "loginCtrl",
        requireLevel: 0
    });
});

app.factory('SessionService', function($http, modalService){
    var aListeners = [];
    
    var oData = {
        isLoggedIn : false, 
        username : "fiets",
        level : 0,
        isChecked : false
    }
    
    
    oData.trigger = function trigger(){
        for(var i = 0; i < aListeners.length; i++){
            aListeners[i]();
        }
    }
    
    oData.checkAccess = function checkAccess(fHandler){
        $http({
            method : "GET",
            url : "control.login.php?action=isloggedin",
        }).then(function successCallback(response) {
            oData.isLoggedIn = response.data.loggedin;
            oData.username = (response.data.loggedin && response.data.voornaam + " " + response.data.achternaam || "");
            oData.level = response.data.level;
            oData.isChecked = true;
            
            fHandler();
            oData.trigger();
        }, function errorCallback(response) {
            modalService.showError('Unexpected response: ' + response);
        });
        
        /* .then(function successCallback(response) {
            if(response.data instanceof Array){
                $scope.reserveringen = response.data;
            }else{
                if(response.data.error){
                    modalService.showError(response.data.errorText);
                }else{
                    modalService.showError('Unexpected response: ' + response.data);
                }
            }
            
        }, function errorCallback(response) {
            modalService.showError('Unexpected response: ' + response);
        }) */
    }
    
    oData.storeLogin = function storeLogin(loggedIn, username, level){
        oData.isLoggedIn = loggedIn;
        oData.username = username;
        oData.level = level;
        
        oData.trigger();
    }
    
    oData.listen = function(fHandler){
        aListeners.push(fHandler);
    }
    
    
    
    
    
    
    return oData;
});

app.controller("tabsCtrl", function ($scope, $location, $route, SessionService) {
    var dToday = new Date();
        
    $scope.tabs = [
        { link : '#/planning/' + dToday.getFullYear() + "/" + dToday.getMonth(), label : 'Planning' },
        { link : '#/aanvragen', label : 'Aanvragen' },
        { link : '#/reserveringen', label : 'Reserveringen' },
        { link : '#/gebruikers', label : 'Gebruikers' }
    ]; 

    $scope.selectedTab = null;  
    $scope.setSelectedTab = function(tab) {
        $scope.selectedTab = tab.label;
    }

    $scope.tabClass = function(tab) {
        if ($scope.selectedTab == tab.label) {
            return "active";
        } else {
            return "";
        }
    }
    
    function update(){
        var route, r;
        
        $scope.tabs = [];
        $scope.selectedTab = null;
        for(r in $route.routes){
            if($route.routes.hasOwnProperty(r)){
                route = $route.routes[r];
                if(route.menuName && route.requireLevel <= SessionService.level){
                    $scope.tabs.push({ link : route.link, label : route.menuName });
                    
                    
                }
            }
        }
        
        if($route.current){
            $scope.selectedTab = $route.current.menuName || $route.current.highlightMenu || null;
            console.log($scope.selectedTab);
        }
    }
    
    SessionService.listen(update);
    
    update();
});




app.run(function($rootScope, $location, SessionService){
    $rootScope.startPath = $location.path();
    
    $rootScope.$on("$routeChangeStart", function(event, next, current) {
        if(next){
            
                if(next.$$route.requireLevel > SessionService.level){
                    if(!SessionService.isLoggedIn){
                        if(SessionService.isChecked){
                            $location.path('/login'); 
                        }else{
                            $location.path('/');
                        }
                        event.preventDefault();
                    }else{
                        alert("Access not allowed!");
                        event.preventDefault();
                    }
                }

            
        }
    });
    $rootScope.$on("$routeChangeSuccess", function(event, current, previous) {
        SessionService.trigger();
    });
    
    SessionService.checkAccess(function(){
        if(!SessionService.isLoggedIn){
            $location.path('/login').replace(); 
        }else{
            if($rootScope.startPath){
                $location.path($rootScope.startPath).replace();
            }else{
                var dToday = new Date();
                $location.path('/planning/' + dToday.getFullYear() + "/" + dToday.getMonth()).replace();
            }
            
            
        }
    });
});




