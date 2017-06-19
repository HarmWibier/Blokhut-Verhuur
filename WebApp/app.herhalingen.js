angular.module("blokhut_verhuur").controller("herhalingenCtrl", function ($scope, $location, $http, modalService, SessionService, $filter) {
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
    
    $scope.herhalingText = function(her){
        switch(parseInt(her.herhaaltype, 10)){
            case 0:
                return "Iedere " +  (globals.weekdagen[her.herhaalweekdag] || "--").toLowerCase();
            case 1:
                return "Dag " + her.herhaaldag + " van de maand";
            case 2:
                return "Iedere " + her.herhaalweek + "e " + (globals.weekdagen[her.herhaalweekdag] || "--").toLowerCase() + " van de maand";
        }
    }
    
    $scope.einde = function(herhaling){
        if(herhaling.einddatum){
            return $filter('date')(herhaling.einddatum, 'dd-MM-yyyy');
        }else{
            return "Oneindig"
        }
    }
    
    $scope.dagdelenText = function(herhaling){
        var aDelen = [];
        
        if(herhaling.ochtend){
            aDelen.push($scope.dagdeelText(0));
        }
        if(herhaling.middag){
            aDelen.push($scope.dagdeelText(1));
        }
        if(herhaling.avond){
            aDelen.push($scope.dagdeelText(2));
        }
        
        return aDelen.join(",");
    }
    
    
    $scope.filterUitgeschakeld = false;
  
    $scope.herhalingen = [];
    
    $scope.refresh = function(){
        $http({
            method : "GET",
            url : "control.herhaling.php?action=overview" + ($scope.filterUitgeschakeld ? "&uitgeschakeld=true" : "")
        }).then(function successCallback(response) {
            if(response.data instanceof Array){
                response.data.forEach(function(res){
                    res.startdatum = new Date(res.startdatum);
                    res.ochtend = res.ochtend == "1";
                    res.middag = res.middag == "1";
                    res.avond = res.avond == "1";
                    res.einddatum = (res.einddatum && new Date(res.einddatum)) || null;
                });
                
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
    $scope.edit = function(herhaling){
        $location.path('/herhaling/' + ((herhaling && herhaling.id) || 'new'));
    }
    
    $scope.refresh();
    
    
});
