angular.module("blokhut_verhuur").controller("gebruikersCtrl", function ($scope, $http, modalService, $location) {
    $scope.gebruikers = [];
    
    $scope.levels = {
        1 : "Gebruiker",
        5 : "Beheerder",
        10 : "Administrator"
    }
    
    $scope.levelText = function(eLevel){
        return $scope.levels[eLevel] || "Onbekend";
    }
    
    $scope.refresh = function(){
        $http({
            method : "GET",
            url : "control.gebruiker.php?action=overview"
        }).then(function successCallback(response) {
            if(response.data instanceof Array){
               $scope.gebruikers = response.data;
            }else{
                if(response.data.error){
                    alert(response.data.errorText);
                }else{
                    alert('Unexpected response: ' + response.data);
                }
            }
            
        }, function errorCallback(response) {
            alert('Unexpected response: ' + response);
        });

    }
    
   
    $scope.edit = function(gebruiker){
        $location.path('/gebruiker/' + ((gebruiker && gebruiker.id) || 'new'));
    }
    
    $scope.refresh();
});