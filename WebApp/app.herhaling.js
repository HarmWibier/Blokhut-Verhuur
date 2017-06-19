angular.module("blokhut_verhuur").controller("herhalingCtrl", function ($scope, $location, $window, $http, $routeParams, modalService, SessionService) {
    var sInitStatus = 0;
    
    $scope.readonly = (SessionService.level < 5);
    
    $scope.dagdelen = globals.dagdelen;
    $scope.weekdagen = globals.weekdagen;
    
    $scope.dagdeelText = globals.dagdeelText;
    
    $scope.statussen = globals.actief;
    $scope.herhaaltypes = globals.herhaaltypes;
    
    $scope.statusText = function(eStatus){
        return $scope.statussen[eStatus] || "Onbekend";
    }
    
    $scope.current = null;
    
    if($routeParams.ID !== 'new'){
        $http({
            method : "GET",
            url : "control.herhaling.php?action=detail&id=" + $routeParams.ID
        }).then(function successCallback(response) {
            if(response.data instanceof Array && response.data.length > 0){
               $scope.current =  response.data[0];
               $scope.current.herhaalweek = parseInt(response.data[0].herhaalweek, 10);
               $scope.current.herhaaldag = parseInt(response.data[0].herhaaldag, 10);
               $scope.current.ochtend = response.data[0].ochtend == "1";
               $scope.current.middag = response.data[0].middag == "1";
               $scope.current.avond = response.data[0].avond == "1";
               $scope.current.actief = response.data[0].actief == "1";
               $scope.current.startdatum = new Date(response.data[0].startdatum);
               $scope.current.eindig = response.data[0].einddatum != null;
               if($scope.current.eindig){
                    $scope.current.einddatum = new Date(response.data[0].einddatum);
               }else{
                   $scope.current.einddatum = null;
               }
               
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
        $scope.current = { id:"new", herhaaltype: "0", ochtend : false, middag : false, avond : true, startdatum : new Date(), eindig : false, einddatum : null, actief : true };
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
        if($scope.current && $scope.current.einddatum !== null){
            if($scope.current && $scope.current.einddatum < $scope.current.startdatum){
                $scope.current.einddatum = $scope.current.startdatum;
            }
        }
    });
    $scope.save = function(){
        function doSave(){
            $http({
                method : "POST",
                url : "control.herhaling.php?action=save",
                headers: {
                   'Content-Type': "text/xml"	//	Stupid your-webhost.nl doesn't allow JSON header
                },
                data : $scope.current
            }).then(function successCallback(response) {
                if(response.data instanceof Object && !response.data.error){
                    if(response.data.success){
                        $window.history.back();
                    }else{
                        modalService.showError(response.data.message);
                    }
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
        
        // if($scope.current.status !== sInitStatus){
            // var modalOptions = {
                // closeButtonText: 'Annuleren',
                // actionButtonText: 'Opslaan',
                // headerText: 'Status wijzigen naar ' + $scope.statusText($scope.current.status) + '?',
                // bodyText: 'Weet je zeker dat je de status wilt wijzigen?' + ($scope.current.status >= 10 ? ' De aanvrager zal een email ontvangen over deze wijziging.' : '')
            // };

            // modalService.showModal({}, modalOptions).then(function (result) {
                // doSave();
            // });
        // }else{
            doSave();
        // }
        
        
    }
    
    $scope.cancel = function(){
        $scope.current = null;
        $window.history.back();
    }
    
});
