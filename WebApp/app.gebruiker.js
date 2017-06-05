angular.module("blokhut_verhuur").controller("gebruikerCtrl", function ($scope, $http, modalService, $routeParams, $window) {
    $scope.current = null;
    
    $scope.levels = {
        1 : "Gebruiker",
        5 : "Beheerder",
        10 : "Administrator"
    }
    
    $scope.levelText = function(eLevel){
        return $scope.levels[eLevel] || "Onbekend";
    }
    
    if($routeParams.ID !== 'new'){
        $http({
            method : "GET",
            url : "control.gebruiker.php?action=detail&id=" + $routeParams.ID
        }).then(function successCallback(response) {
            if(response.data instanceof Array && response.data.length > 0){
               $scope.current =  response.data[0];
               
               $scope.current.actief = parseInt($scope.current.actief, 10);
               $scope.current.mailupdates = parseInt($scope.current.mailupdates, 10);
               
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
        
    }else{
         $scope.current = { id:"new", level:"1", actief:1};
    }
    
    $scope.save = function(){
        $http({
            method : "POST",
			headers: {
			   'Content-Type': "text/xml"	//	Stupid your-webhost.nl doesn't allow JSON header
			},
            url : "control.gebruiker.php?action=save",
            data : $scope.current
        }).then(function successCallback(response) {
            if(response.data instanceof Array && response.data.length > 0){
                $window.history.back();
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
    }
    
    
    $scope.remove = function(){
        var modalOptions = {
            closeButtonText: 'Annuleren',
            actionButtonText: 'Verwijderen',
            headerText: 'Verwijder ' + $scope.current.login + '?',
            bodyText: 'Weet je zeker dat je deze gebruiker wilt verwijderen?'
        };

        modalService.showModal({}, modalOptions).then(function (result) {
            $http({
                method : "GET",
                url : ("control.gebruiker.php?action=delete&id=" + $scope.current.id)
            }).then(function successCallback(response) {
                if(response.data.success){
                     $window.history.back();
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
        });
        

    }
    
    
    $scope.cancel = function(){
        $scope.current = null;
        $window.history.back();
    }
});