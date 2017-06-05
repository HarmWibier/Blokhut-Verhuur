
app.controller("planningCtrl", function ($scope, $location, $http, modalService, $routeParams) {
    var dStart, dEind, dVandaag = new Date(), sSvrF = 'YYYY-MM-DD';
    
    $scope.jaar = parseInt($routeParams.YEAR  || dVandaag.getFullYear(), 10);
    $scope.maand = parseInt($routeParams.MONTH || dVandaag.getMonth(), 10);
    
    $scope.maandnaam = [ 'Januari','Februari','Maart','April','Mei','Juni','Juli','Augustus','September','Oktober','November','December'];
    $scope.reserveringen = [];
    $scope.weken = [];
    
    $scope.weekNr = function(week){
        if(week && week.length > 3){
            return moment(week[4].datum).isoWeek();
        }
        
        return "";
    };
    
    $scope.resclasses = function(res){
        var a  = [ 'afspraak' ];
        
        if(res.start == 0){
            a.push('ochtend');
        }
        if(res.start <= 1 && res.eind >= 1){
            a.push('middag');
        }
        if(res.eind >= 2){
            a.push('avond');
        }
        
        if(res.res.status <= 10){
            a.push('aanvraag');
        }
        
        return a.join(' ');
    };
    
    $scope.dagclass = function(weekdag){
        var a = ['dag'];
        
        a.push('aantal' + weekdag.reserveringen.length);
        if(weekdag.buitenmaand){
            a.push('buitenmaand');
        }
        return a.join(' ');
    };
    
    $scope.initMonth = function(){
        var iWeek, iDag, i, iStart, iEind, dHuidig, res;
        
        //  Parse dates
        for(i = 0; i < $scope.reserveringen.length; i++){
            $scope.reserveringen[i].startdatum = moment($scope.reserveringen[i].startdatum, sSvrF).toDate();
            $scope.reserveringen[i].einddatum = moment($scope.reserveringen[i].einddatum, sSvrF).toDate();
        }
        
        dHuidig = new Date(dStart.getTime());
        for(iWeek = 0; iWeek < 6; iWeek++){
            $scope.weken[iWeek] = [];
            for(iDag = 0; iDag < 7; iDag++){
                $scope.weken[iWeek][iDag] = {
                    datum : new Date(dHuidig.getTime()),
                    dag : dHuidig.getDate(),
                    buitenmaand : (dHuidig.getMonth() !== $scope.maand),
                    reserveringen : [ ]                       
                };
                
                for(i = 0; i < $scope.reserveringen.length; i++){
                    res = $scope.reserveringen[i];
                    
                    if(moment(res.startdatum).isSameOrBefore(dHuidig, 'day')){
                        if(moment(res.einddatum).isSameOrAfter(dHuidig, 'day')){
                            iStart = 0;
                            iEind = 2;
                            
                            if(moment(res.startdatum).isSame(dHuidig, 'day')){
                                iStart = parseInt(res.startdagdeel, 10);
                            }
                            if(moment(res.einddatum).isSame(dHuidig, 'day')){
                                iEind = parseInt(res.einddagdeel, 10);
                            }
                            
                            $scope.weken[iWeek][iDag].reserveringen.push({
                                res : res,
                                start : iStart,
                                eind : iEind
                            });
                        }
                    }
                }
                
                dHuidig.setDate(dHuidig.getDate() + 1);
            }
        }
    };
    
    $scope.loadMonth = function(){
        var iDayPointer;
        
        dStart = new Date($scope.jaar, $scope.maand, 1, 1, 1, 1);
     
        
        //  Bereken begin dag
        iDayPointer = dStart.getDay() - 1;
        if(iDayPointer < 0){
            iDayPointer = 7 + iDayPointer;
        }
        dStart.setDate(dStart.getDate() - iDayPointer);
        
        dEind = new Date(dStart.getTime());
        dEind.setDate(dStart.getDate() + 42);
         
        $http({
            method : "GET",
            url : "control.form.php?action=planning&start=" + moment(dStart).format(sSvrF) + "&eind=" + moment(dEind).format(sSvrF)
        }).then(function successCallback(response) {
            if(response.data instanceof Array){
                $scope.reserveringen = response.data;
                $scope.initMonth();
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
    
    $scope.volgende = function(){
        $scope.maand++;
        if($scope.maand > 11){
            $scope.maand = 0;
            $scope.jaar++;
        }
        
        // $scope.loadMonth();
        
        $location.path('/planning/' + $scope.jaar + "/" + $scope.maand).replace();
    }
    
    $scope.vorige = function(){
        $scope.maand--;
        if($scope.maand < 0){
            $scope.maand = 11;
            $scope.jaar--;
        }
        
        // $scope.loadMonth();
        $location.path('/planning/' + $scope.jaar + "/" + $scope.maand).replace();
    }
    
    $scope.aanvragen = function(){
        $location.path('/aanvragen');
    }
    
    $scope.loadMonth();
});