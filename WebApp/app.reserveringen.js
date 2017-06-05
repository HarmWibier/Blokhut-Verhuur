angular.module("blokhut_verhuur").controller("reserveringenCtrl", function ($scope, $location, $http, modalService, SessionService) {
    $scope.isAanvraag = function(){
        return ($location.path().indexOf("aanvragen") >= 0);
    };
    
    $scope.dagdelen = [ 
        { id : 0, value : "Ochtend" },
        { id : 1, value : "Middag" },
        { id : 2, value : "Avond" }
    ];
    
    $scope.dagdeelText = function(eDagdeel){
        for(var i = 0; i < $scope.dagdelen.length; i++){
            if($scope.dagdelen[i].id == eDagdeel){
                return $scope.dagdelen[i].value;
            }
        }
        return "--";
    }
    
    $scope.statussen = { 
        0 : "Aangevraagd"   ,
        10 : "Gereserveerd" ,
        20 : "Betaald" ,
        90: "Geannuleerd" 
    };
    
    $scope.statusText = function(eStatus){
        return $scope.statussen[eStatus] || "Onbekend";
    }
    
    $scope.title = function(){
        if($scope.isAanvraag()){
            return "Aanvragen";
        }else{
            return "Reserveringen";
        }
    };
    
    $scope.filterGeannuleerd = false;
    $scope.filterHistorie = false;
    $scope.reserveringen = [];
    
    $scope.refresh = function(){
        $http({
            method : "GET",
            url : "control.reservering.php?action=overview" + ($scope.isAanvraag() ? "&aanvragen=true" : "") + ($scope.filterGeannuleerd ? "&geannuleerd=true" : "") + ($scope.filterHistorie ? "&historie=true" : "")
        }).then(function successCallback(response) {
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
        });
};
    
    
    $scope.detail = false;
    $scope.current = null;
    $scope.edit = function(reservering){
        $location.path('/reservering/' + ((reservering && reservering.id) || 'new'));
    }
    
    $scope.refresh();
    
    
});
