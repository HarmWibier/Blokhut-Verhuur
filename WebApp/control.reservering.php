<?
    include('inc.base.php');
    
    
    /* Gebruikers voor admin sectie */
    if($_GET['action'] == "overview" && $_SERVER['REQUEST_METHOD'] == "GET"){
        if(!HasRights(1)){
            FatalError('Geen rechten');
        }
        
        if($_GET['aanvragen'] == "true"){
            $from = 0;
            $to = 0;
        }else{
            $from = 10;
            $to = 89;
            if($_GET['geannuleerd'] == "true"){
                $to = 100;
            }
        }
        
        
        if($_GET['historie'] == "true"){
            $historie = "";
        }else{
            $historie = "AND einddatum >= NOW()";
        }
        
        $sort = "startdatum";
        if(Isset($_GET['sort']) && array_search($_GET['sort'], array(0 => 'startdatum', 1 => 'einddatum', 2 => 'status', 3 => 'groep_naam')) != false){
            $sort = $_GET['sort'];
        }
        
        if($_GET['dir'] == "DESC"){
            $sort += " DESC";
        }else{
            $sort .= " ASC";
        }
        
        // FatalError("SELECT id, startdatum, einddatum, startdagdeel, einddagdeel, status, groep_naam, aantal_pers, contact_email FROM reservering WHERE status BETWEEN $from AND $to $historie ORDER BY $sort;");
        $response = SQL_Query_Array("SELECT id, startdatum, einddatum, startdagdeel, einddagdeel, status, groep_naam, aantal_pers, contact_email FROM reservering WHERE status BETWEEN $from AND $to $historie ORDER BY $sort;");
    }
    
    if($_GET['action'] == "planning" && $_SERVER['REQUEST_METHOD'] == "GET"){
        if(!HasRights(1)){
            FatalError('Geen rechten');
        }
        
        if(!Isset($_GET['start']) || !Isset($_GET['eind'])){
            FatalError('Start en einddatum verplicht.');
        }
        
        $start = SQL_Filter($_GET['start'], 'date');
        $eind = SQL_Filter($_GET['eind'], 'date');
        
        // FatalError("SELECT id, startdatum, einddatum, startdagdeel, einddagdeel, status, groep_naam, aantal_pers, contact_email FROM reservering WHERE status BETWEEN $from AND $to $historie ORDER BY $sort;");
        
        //FatalError("SELECT id, startdatum, einddatum, startdagdeel, einddagdeel, status, groep_naam, aantal_pers, contact_email FROM reservering WHERE startdatum BETWEEN $start AND $eind OR einddatum BETWEEN $start AND $eind OR (startdatum < $start AND einddatum > $eind) ORDER BY startdatum ASC;");
        $response = SQL_Query_Array("SELECT id, startdatum, einddatum, startdagdeel, einddagdeel, status, groep_naam, aantal_pers, contact_email FROM reservering WHERE status < 89 AND (startdatum BETWEEN $start AND $eind OR einddatum BETWEEN $start AND $eind OR (startdatum < $start AND einddatum > $eind)) ORDER BY startdatum ASC;");
    }
    
    
    /* Reservering details voor admin sectie */
    if($_GET['action'] == "detail" && $_SERVER['REQUEST_METHOD'] == "GET"){
        if(!HasRights(1)){
            FatalError('Geen rechten');
        }
        
        $id     = SQL_Filter($_GET['id'], 'int');

        $response = SQL_Query_Array("SELECT * FROM reservering WHERE id=$id;");
    }
    
    /* Opslaan gebruikers voor admin sectie */
    if($_GET['action'] == "save" && $_SERVER['REQUEST_METHOD'] == "POST"){
        if(!HasRights(5)){
            FatalError('Geen rechten');
        }
        
        $request = json_decode(file_get_contents("php://input"), true);
        
        $startdatum         = SQL_Filter($request['startdatum'], 'date');
        $einddatum          = SQL_Filter($request['einddatum'], 'date');
        $startdagdeel       = SQL_Filter($request['startdagdeel'], 'int');
        $einddagdeel        = SQL_Filter($request['einddagdeel'], 'int');
        $status             = SQL_Filter($request['status'], 'int');
        $groep_naam         = SQL_Filter($request['groep_naam'], 'text');
        $contact_voornaam   = SQL_Filter($request['contact_voornaam'], 'text');
        $contact_achternaam = SQL_Filter($request['contact_achternaam'], 'text');
        $contact_email      = SQL_Filter($request['contact_email'], 'text');
        $contact_adres      = SQL_Filter($request['contact_adres'], 'text');
        $contact_woonplaats = SQL_Filter($request['contact_woonplaats'], 'text');
        $contact_postcode   = SQL_Filter($request['contact_postcode'], 'text');
        $contact_telefoon   = SQL_Filter($request['contact_telefoon'], 'text');
        $opmerking          = SQL_Filter($request['opmerking'], 'text');
        $bivak_herkenning   = SQL_Filter($request['bivak_herkenning'], 'text');
        $aantal_pers        = SQL_Filter($request['aantal_pers'], 'int');
        
        if($request['id'] == "new"){
            $password   = SQL_Filter($request['password'], 'text');
            
            if(SQL_Query_Exec("INSERT INTO reservering(startdatum, einddatum, startdagdeel, einddagdeel, status, groep_naam, contact_voornaam, contact_achternaam, contact_email, contact_adres, contact_woonplaats, contact_postcode, contact_telefoon, aantal_pers, bivak_herkenning, opmerking) VALUES ($startdatum, $einddatum, $startdagdeel, $einddagdeel, $status, $groep_naam, $contact_voornaam, $contact_achternaam, $contact_email, $contact_adres, $contact_woonplaats, $contact_postcode, $contact_telefoon, $aantal_pers, $bivak_herkenning, $opmerking)")){
                $id = mysqli_insert_id($db);
                
                $response = SQL_Query_Array("SELECT * FROM reservering WHERE id=$id;");
            }
        }else{
            $id     = SQL_Filter($request['id'], 'int');
            
            $prevdetails = SQL_Query_Array("SELECT * FROM reservering WHERE id=$id;");

            
            
//            FatalError("UPDATE reservering SET startdatum=$startdatum, einddatum=$einddatum, startdagdeel=$startdagdeel, einddagdeel=$einddagdeel, status=$status, groep_naam=$groep_naam, contact_voornaam=$contact_voornaam, contact_achternaam=$contact_achternaam, contact_email=$contact_email, contact_adres=$contact_adres, contact_woonplaats=$contact_woonplaats, contact_postcode=$contact_postcode, contact_telefoon=$contact_telefoon, bivak_herkenning=$bivak_herkenning, aantal_pers=$aantal_pers WHERE id=$id;");
            if(SQL_Query_Exec("UPDATE reservering SET startdatum=$startdatum, einddatum=$einddatum, startdagdeel=$startdagdeel, einddagdeel=$einddagdeel, status=$status, groep_naam=$groep_naam, contact_voornaam=$contact_voornaam, contact_achternaam=$contact_achternaam, contact_email=$contact_email, contact_adres=$contact_adres, contact_woonplaats=$contact_woonplaats, contact_postcode=$contact_postcode, contact_telefoon=$contact_telefoon, bivak_herkenning=$bivak_herkenning, aantal_pers=$aantal_pers, opmerking=$opmerking WHERE id=$id;")){
                $response =  SQL_Query_Array("SELECT * FROM reservering WHERE id=$id;");
                
          // 0 : "Aangevraagd"   ,
        // 10 : "Gereserveerd" ,
        // 20 : "Betaald" ,
        // 90: "Geannuleerd"               
                //  If the status changed we send an email
                if(intval($prevdetails[0]['status']) != intval($response[0]['status'])){
                    $status = intval($response[0]['status']);
                    $response[0]['blokhutnaamfull'] = $blokhutnaamfull;
                    
                    if($status == 10){
                        sendMailFromTemplate($response[0]['contact_email'], "Bevestiging reservering blokhut $blokhutnaamfull", 'mail_status_gereserveerd.htm', $response[0]);
                    }else if($status == 20){
                        sendMailFromTemplate($response[0]['contact_email'], "Bevestiging betaling blokhut $blokhutnaamfull", 'mail_status_betaald.htm', $response[0]);
                    }else if($status == 90){
                        sendMailFromTemplate($response[0]['contact_email'], "Annulering reservering blokhut $blokhutnaamfull", 'mail_status_geannuleerd.htm', $response[0]);
                    }
                }
                
            }
        }
    }
    
    include('inc.end.php');
?>