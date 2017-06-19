<?
    include('inc.base.php');
    
    
    

    

    
    function checktelefoon($telefoon) {
        $telefoon = preg_replace('/[^0-9]/', "", $telefoon);
        return (preg_match('/^[0-9]{5,14}$/', $telefoon)>0);
    }
    
    /* Opslaan gebruikers voor admin sectie */
    if($_GET['action'] == "save" && $_SERVER['REQUEST_METHOD'] == "POST"){
        $request = json_decode(file_get_contents("php://input"), true);
        
        $startdagdeel       = SQL_Filter($request['startdagdeel'], 'int');
        $einddagdeel        = SQL_Filter($request['einddagdeel'], 'int');
        $groep_naam         = SQL_Filter($request['groep_naam'], 'text');
        $contact_voornaam   = SQL_Filter($request['contact_voornaam'], 'text');
        $contact_achternaam = SQL_Filter($request['contact_achternaam'], 'text');
        $contact_email      = SQL_Filter($request['contact_email'], 'text');
        $contact_adres      = SQL_Filter($request['contact_adres'], 'text');
        $contact_woonplaats = SQL_Filter($request['contact_woonplaats'], 'text');
        $contact_postcode   = SQL_Filter($request['contact_postcode'], 'text');
        $contact_telefoon   = SQL_Filter($request['contact_telefoon'], 'text');
        $bivak_herkenning   = SQL_Filter($request['bivak_herkenning'], 'text');
        $aantal_pers        = SQL_Filter($request['aantal_pers'], 'int');
        
        //  Validate recaptcha
        $post_data = "secret=6LetSRYUAAAAAHw0NHUVgkCHaVG-PcVDhlOgCGSO&response=".$request['recaptchaResponseToken']."&remoteip=".$_SERVER['REMOTE_ADDR'] ;

        $ch = curl_init();  
        curl_setopt($ch, CURLOPT_URL, "https://www.google.com/recaptcha/api/siteverify");
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($ch, CURLOPT_HTTPHEADER, 
           array('Content-Type: application/x-www-form-urlencoded; charset=utf-8', 'Content-Length: ' . strlen($post_data)));
        curl_setopt($ch, CURLOPT_POSTFIELDS, $post_data); 
        $googresp = curl_exec($ch);       
        $decgoogresp = json_decode($googresp);
        curl_close($ch);

        //var_dump($decgoogresp);
        if ($decgoogresp->success != true)
        {
            
            validateError("Recaptcha niet gevalideerd.");
        }
        if($aantal_pers < 1){
            validateError("Minimaal 1 persoon verplicht!");
        }
        if($aantal_pers > 100){
            validateError("Maximaal 100 personen!");
        }
        if(strlen($groep_naam) < 2){
            validateError("Groepsnaam verplicht!");
        }
        if(strlen($contact_achternaam) < 2){
            validateError("Achternaam verplicht!");
        }
        if(strlen($contact_email) < 3){
            validateError("Email verplicht!");
        }
        if(strlen($contact_adres) < 3){
            validateError("Adres verplicht!");
        }
        if(strlen($contact_woonplaats) < 3){
            validateError("Woonplaats verplicht!");
        }
        if(strlen($contact_telefoon) < 3){
            validateError("Telefoon verplicht!");
        }
        if(!checktelefoon($contact_telefoon)){
            validateError("Ongelding telefoonnummer!");
        }

        $startdate = date_create_from_format('Y-m-d\TH:i:s+', $request['startdatum']);
        if($startdate === false){
            validateError("Start datum verplicht!");
        }else{
            $startdatum = "'" . date_format($startdate, 'Y-m-d') . "'";
        }
        if(date_diff($startdate, new DateTime()) < 1){
            validateError("Start datum moet in de toekomst liggen!");
        }
        $eind =  date_create_from_format('Y-m-d\TH:i:s.uO', $request['startdatum']);
        if($eind === false){
            validateError("Eind datum verplicht!");
        }else{
            $einddatum = "'" . date_format($eind, 'Y-m-d') . "'";
        }
        if(date_diff($startdate, $eind) < 0){
            validateError("Eind datum mag niet voor de start datum zijn!");
        }
        if(date_diff($startdate, $eind) == 0 && $startdagdeel > $einddagdeel){
            validateError("Eind dagdeel mag niet voor het start dagdeel zijn!");
        }
         
        
        if($continue){
            $response['success'] = false;
            $response['message'] = "Onbekende fout!";
            
            if(SQL_Query_Exec("INSERT INTO reservering(startdatum, einddatum, startdagdeel, einddagdeel, status, groep_naam, contact_voornaam, contact_achternaam, contact_email, contact_adres, contact_woonplaats, contact_postcode, contact_telefoon, aantal_pers, bivak_herkenning) VALUES ($startdatum, $einddatum, $startdagdeel, $einddagdeel, 0, $groep_naam, $contact_voornaam, $contact_achternaam, $contact_email, $contact_adres, $contact_woonplaats, $contact_postcode, $contact_telefoon, $aantal_pers, $bivak_herkenning)")){
                $id = mysqli_insert_id($db);
                if($id > 0){
                    $result = SQL_Query_Array("SELECT * FROM reservering WHERE id=$id;");
                    
                    if(count($result) == 1){
                        $details = $result[0];
                        
                        
                        //  Generate URL
                        $myUrl = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] && !in_array(strtolower($_SERVER['HTTPS']),array('off','no'))) ? 'https' : 'http';
                        $myUrl .= '://'.$_SERVER['HTTP_HOST'];
                        $myUrl .= $_SERVER['SCRIPT_NAME'];
                        $myUrl = str_ireplace("control.form.php", "", $myUrl) . '#/reservering/' . $details['id'];
                        
                        $details['url'] = $myUrl;
                        $details['blokhutnaamfull'] = $blokhutnaamfull;
                        
                        //  Send confirmation email
                        sendMailFromTemplate($result[0]['contact_email'], "Aanvraag verhuur blokhut $blokhutnaamfull", 'mail_bevestiging.htm', $details);
                        
                        $response['success'] = true;
                        $response['message'] = "";
                        
                        //  Send email updates
                        $mailupdates = SQL_Query_Array("SELECT email FROM gebruiker WHERE actief=1 AND mailupdates=1;");
                        for($i = 0; $i < count($mailupdates); $i++){
                            sendMailFromTemplate($mailupdates[$i]['email'], "Aanvraag verhuur $blokhutnaam", 'mail_update.htm', $details);
                        }
                    }
                }
            }
        }
    }
    
    
    /* Planning publiek*/
   
    if($_GET['action'] == "planning" && $_SERVER['REQUEST_METHOD'] == "GET"){
     
        if(!Isset($_GET['start']) || !Isset($_GET['eind'])){
            FatalError('Start en einddatum verplicht.');
        }
        
        $start = SQL_Filter($_GET['start'], 'date');
        $eind = SQL_Filter($_GET['eind'], 'date');
        
        $response = SQL_Query_Array("SELECT id, startdatum, einddatum, startdagdeel, einddagdeel FROM reservering WHERE status BETWEEN 10 AND 80 AND (startdatum BETWEEN $start AND $eind OR einddatum BETWEEN $start AND $eind OR (startdatum < $start AND einddatum > $eind)) ORDER BY startdatum ASC;");
    }

    
    
    include('inc.end.php');
?>