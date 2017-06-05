app.controller('loginCtrl',function($rootScope, $scope, $http, $location, SessionService, modalService) { 
    $scope.SessionService = SessionService;
    
    $scope.loginname = "";
    $scope.password = "";
    $scope.login = function(e){
        $http({
            method : "POST",
            url : "control.login.php?action=login",
            headers: {
                'Content-Type': "text/xml"	//	Stupid your-webhost.nl doesn't allow JSON header
            },
            data : {
                login : $scope.loginname,
                password : $scope.password
            }
        }).then(function successCallback(response) {
            var dToday = new Date();
            if(response.data.succes){
                SessionService.storeLogin(true, response.data.voornaam + " " + response.data.achternaam, response.data.level);
                $scope.loginname = "";
                $scope.password = "";
                $scope.message = "";
                if($rootScope.startPath){
                    $location.path($rootScope.startPath).replace();
                }else{
                    $location.path('/planning/' + dToday.getFullYear() + "/" + dToday.getMonth()).replace();
                }
            }else{
                $scope.message = "Login failed!";
            }
        }, function errorCallback(response) {
            modalService.showError('Unexpected response: ' + response);
        });
    };
    
    $scope.logout = function(e){
        $http({
            method : "GET",
            url : "control.login.php?action=logout"
        }).then(function successCallback(response) {
            
            SessionService.storeLogin(false, "", 0);
            $scope.loginname = "";
            $scope.password = "";
            $scope.message = "";
            $location.path('/login');
            
        }, function errorCallback(response) {
            modalService.showError('Unexpected response: ' + response);
        });
    }
});