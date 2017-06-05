<?
    include('inc.base.php');
    
    
    // Herhalingen voor admin sectie 
    if($_GET['action'] == "overview" && $_SERVER['REQUEST_METHOD'] == "GET"){
        if(!HasRights(1)){
            FatalError('Geen rechten');
        }
        
        if($_GET['uitgeschakeld'] == "true"){
            $historie = "";
        }else{
            $historie = "actief=1 AND (einddatum IS NULL OR einddatum >= NOW())";
        }
        
        $sort = "groep_naam";
        if(Isset($_GET['sort']) && array_search($_GET['sort'], array(0 => 'startdatum', 1 => 'einddatum', 2 => 'status', 3 => 'groep_naam')) != false){
            $sort = $_GET['sort'];
        }
        
        if($_GET['dir'] == "DESC"){
            $sort += " DESC";
        }else{
            $sort .= " ASC";
        }
        
        // FatalError("SELECT id, startdatum, einddatum, startdagdeel, einddagdeel, status, groep_naam, aantal_pers, contact_email FROM reservering WHERE status BETWEEN $from AND $to $historie ORDER BY $sort;");
        $response = SQL_Query_Array("SELECT id, groep_naam, startdatum, einddatum, ochtend, middag, avond, herhaaltype, herhaalweekdag, herhaalweek, herhaaldag, actief FROM herhaling WHERE $historie ORDER BY $sort;");
    }    
    // Details voor admin sectie
    if($_GET['action'] == "detail" && $_SERVER['REQUEST_METHOD'] == "GET"){
        if(!HasRights(1)){
            FatalError('Geen rechten');
        }
        
        $id     = SQL_Filter($_GET['id'], 'int');

        $response = SQL_Query_Array("SELECT * FROM herhaling WHERE id=$id;");
    }
    
    
    
    // Opslaan herhaling voor admin sectie
    if($_GET['action'] == "save" && $_SERVER['REQUEST_METHOD'] == "POST"){
        if(!HasRights(5)){
            FatalError('Geen rechten');
        }
        
        $request = json_decode(file_get_contents("php://input"), true);
        
        $groep_naam         = SQL_Filter($request['groep_naam'], 'text');
        $startdatum         = SQL_Filter($request['startdatum'], 'date');
        
        if($request['einddatum'] !== null){
            $einddatum          = SQL_Filter($request['einddatum'], 'date');
        }else{
            $einddatum = "NULL";
        }
        $ochtend            = SQL_Filter($request['ochtend'], 'int');
        $middag             = SQL_Filter($request['middag'], 'int');
        $avond              = SQL_Filter($request['avond'], 'int');
        $actief             = SQL_Filter($request['actief'], 'int');
        $herhaaltype        = SQL_Filter($request['herhaaltype'], 'int');
        $herhaalweekdag     = SQL_Filter($request['herhaalweekdag'], 'int');
        $herhaalweek        = SQL_Filter($request['herhaalweek'], 'int');
        $herhaaldag         = SQL_Filter($request['herhaaldag'], 'int');

        
        
        if($request['id'] == "new"){
            
            
            if(SQL_Query_Exec("INSERT INTO herhaling(groep_naam, startdatum, einddatum, ochtend, middag, avond, herhaaltype, herhaalweekdag, herhaalweek, herhaaldag, actief) VALUES ($groep_naam, $startdatum, $einddatum, $ochtend, $middag, $avond, $herhaaltype, $herhaalweekdag, $herhaalweek, $herhaaldag, $actief)")){
                $id = mysqli_insert_id($db);
                
                $response = SQL_Query_Array("SELECT * FROM herhaling WHERE id=$id;");
            }
        }else{
            $id     = SQL_Filter($request['id'], 'int');
            
            if(SQL_Query_Exec("UPDATE herhaling SET groep_naam=$groep_naam, startdatum=$startdatum, einddatum=$einddatum, ochtend=$ochtend, middag=$middag, avond=$avond, herhaaltype=$herhaaltype, herhaalweekdag=$herhaalweekdag, herhaalweek=$herhaalweek, herhaalweek=$herhaalweek, herhaaldag=$herhaaldag, actief=$actief WHERE id=$id;")){
                $response =  SQL_Query_Array("SELECT * FROM herhaling WHERE id=$id;");
                
            }
        }
    }
    
    include('inc.end.php');
?>