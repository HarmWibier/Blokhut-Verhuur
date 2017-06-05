app.controller("aanvragenCtrl", function ($scope, $location, $window, $http, $routeParams, modalService) {
    var recaptchaResponseToken = null;
    
    $scope.dagdelen = globals.dagdelen;
    
    $scope.dagdeelText = function(eDagdeel){
        for(var i = 0; i < $scope.dagdelen.length; i++){
            if($scope.dagdelen[i].id == eDagdeel){
                return $scope.dagdelen[i].value;
            }
        }
        return "--";
    }
    
    $scope.statussen = globals.statussen;
    
    $scope.statusText = function(eStatus){
        return $scope.statussen[eStatus] || "Onbekend";
    }
    
    $scope.initRecaptcha = function(){
        recaptchaInit = function(){
            grecaptcha.render('g-recaptcha', {
              'sitekey' : '6LetSRYUAAAAADZjWPVv0hoB3QbOSEaSkGICHbrA',
              'callback' : function(sUserResponsetoken){
                  recaptchaResponseToken = sUserResponsetoken;
              }
            });
        }
        
        if(window.grecaptcha){
            recaptchaInit();
        }
    }
    
        
    $scope.detail = false;
    $scope.current = null;
    
    
    $scope.current = { id:"new", status: 0, startdatum : new Date(), startdagdeel : 0, einddatum : new Date(), einddagdeel : 2, aantal_pers : 1 };
   
    
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
        if(!recaptchaResponseToken){
            modalService.showError("Recaptcha niet ingevuld!");
            
        }else{
            $scope.current.recaptchaResponseToken = recaptchaResponseToken;
            $http({
                method : "POST",
                url : "control.form.php?action=save",
                headers: {
                   'Content-Type': "text/xml"	//	Stupid your-webhost.nl doesn't allow JSON header
                },
                data : $scope.current
            }).then(function successCallback(response) {
                if(response.data instanceof Object && !response.data.error){
                    if(response.data.success){
                        $location.path('/success').replace();
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
    }
    
    $scope.cancel = function(){
        $scope.current = null;
        $window.history.back();
    }
    
});
