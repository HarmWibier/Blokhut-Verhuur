angular.module("blokhut_verhuur").controller("reserveringCtrl", function ($scope, $location, $window, $http, $routeParams, modalService, SessionService) {
    var sInitStatus = 0;
    
    $scope.readonly = (SessionService.level < 5);
    $scope.dagdelen = globals.dagdelen;
    
    $scope.dagdeelText = globals.dagdeelText;
    
    $scope.statussen = globals.statussen;
    
    $scope.statusText = function(eStatus){
        return $scope.statussen[eStatus] || "Onbekend";
    }
    
        
    $scope.detail = false;
    $scope.current = null;
    
    if($routeParams.ID !== 'new'){
        $http({
            method : "GET",
            url : "control.reservering.php?action=detail&id=" + $routeParams.ID
        }).then(function successCallback(response) {
            if(response.data instanceof Array && response.data.length > 0){
               $scope.current =  response.data[0];
               $scope.current.aantal_pers = parseInt(response.data[0].aantal_pers, 10);
               $scope.current.startdagdeel = parseInt(response.data[0].startdagdeel, 10);
               $scope.current.einddagdeel = parseInt(response.data[0].einddagdeel, 10);
               
               $scope.current.startdatum = new Date(response.data[0].startdatum);
               $scope.current.einddatum = new Date(response.data[0].einddatum);
               
               sInitStatus = $scope.current.status;
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
        $scope.current = { id:"new", status: "0", startdatum : new Date(), startdagdeel : 0, einddatum : new Date(), einddagdeel : 2, aantal_pers : 1 };
        sInitStatus = $scope.current.status;
    }
    
    $scope.formats = ['dd-MM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
    $scope.format = $scope.formats[0];
    $scope.altInputFormats = ['d!/M!/yyyy'];
    
      // Disable weekend selection
    function disabled(data) {
        var date = data.date,
          mode = data.mode;
        return date < $scope.current.startdatum; //mode === 'day' && (date.getDay() === 0 || date.getDay() === 6);
    }

    
    $scope.startDateOptions = {
        formatYear: 'yy',
        maxDate: new Date(2020, 5, 22),
        minDate: new Date(),
        startingDay: 1
    };
    
    function endMinDate(){
        return $scope.current.startdatum;
    }
    
    $scope.endDateOptions = {
        dateDisabled: disabled,
        formatYear: 'yy',
        maxDate: new Date(2020, 5, 22),
        minDate: new Date(),
        startingDay: 1
    };

    $scope.startOpen = false;
    
    $scope.openStart = function(){
        $scope.startOpen = true;
    }
    $scope.eindOpen = false;
    
    $scope.openEind = function(){
        $scope.eindOpen = true;
    }
    $scope.$watch('current.startdatum', function(){
        if($scope.current && $scope.current.einddatum < $scope.current.startdatum){
            $scope.current.einddatum = $scope.current.startdatum;
        }
    });
    $scope.save = function(){
        function doSave(){
            $http({
                method : "POST",
                url : "control.reservering.php?action=save",
                headers: {
                   'Content-Type': "text/xml"	//	Stupid your-webhost.nl doesn't allow JSON header
                },
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
        
        if($scope.current.status !== sInitStatus){
            var modalOptions = {
                closeButtonText: 'Annuleren',
                actionButtonText: 'Opslaan',
                headerText: 'Status wijzigen naar ' + $scope.statusText($scope.current.status) + '?',
                bodyText: 'Weet je zeker dat je de status wilt wijzigen?' + ($scope.current.status >= 10 ? ' De aanvrager zal een email ontvangen over deze wijziging.' : '')
            };

            modalService.showModal({}, modalOptions).then(function (result) {
                doSave();
            });
        }else{
            doSave();
        }
        
        
    }
    
    $scope.cancel = function(){
        $scope.current = null;
        $window.history.back();
    }
    
});
