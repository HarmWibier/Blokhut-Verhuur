<?
    include('inc.base.php');
    
    /* Gebruikers voor reserveringen */
    if($_GET['action'] == "list" && $_SERVER['REQUEST_METHOD'] == "GET"){
        if(!HasRights(1)){
            FatalError('Geen rechten');
        }
        
        $sort = "login";
        if(Isset($_GET['sort']) && array_search($_GET['sort'], array(0 => 'voornaam', 1 => 'achternaam', 2 => 'login', 3 => 'level', 4 => 'email', 5 => 'actief')) != false){
            $sort = $_GET['sort'];
        }
        
        if($_GET['dir'] == "DESC"){
            $sort += " DESC";
        }else{
            $sort .= " ASC";
        }
        
        $response = SQL_Query_Array("SELECT id, CONCAT(voornaam, ' ', achternaam) AS Naam, actief FROM gebruiker ORDER BY $sort;");
    }
    
    /* Gebruikers voor admin sectie */
    if($_GET['action'] == "overview" && $_SERVER['REQUEST_METHOD'] == "GET"){
        if(!HasRights(10)){
            FatalError('Geen rechten');
        }
        
        $sort = "login";
        if(Isset($_GET['sort']) && array_search($_GET['sort'], array(0 => 'voornaam', 1 => 'achternaam', 2 => 'login', 3 => 'level', 4 => 'email', 5 => 'actief')) != false){
            $sort = $_GET['sort'];
        }
        
        if(Isset($_GET['dir']) && $_GET['dir'] == "DESC"){
            $sort += " DESC";
        }else{
            $sort .= " ASC";
        }
        
        $response = SQL_Query_Array("SELECT id, login, voornaam, achternaam, level, email, actief FROM gebruiker ORDER BY $sort;");
    }
    
        /* Gebruiker details voor admin sectie */
    if($_GET['action'] == "detail" && $_SERVER['REQUEST_METHOD'] == "GET"){
        if(!HasRights(10)){
            FatalError('Geen rechten');
        }
        
        $id     = SQL_Filter($_GET['id'], 'int');

        $response = SQL_Query_Array("SELECT * FROM gebruiker WHERE id=$id;");
    }
    
    
    /* Gebruikers delete voor admin sectie */
    if($_GET['action'] == "delete" && $_SERVER['REQUEST_METHOD'] == "GET"){
        if(!HasRights(10)){
            FatalError('Geen rechten');
        }
        
        if(!Isset($_GET['id'])){
            FatalError('Geen id');
        }
        
        $id     = SQL_Filter($_GET['id'], 'int');
        if(SQL_Query_Exec("DELETE FROM gebruiker WHERE id=$id;")){
            if(mysqli_affected_rows($db) < 1){
                RegularError("Onbekend id: '$id'");
            }else{
                $response['success'] = true;
            }
        }
    }
    
    /* Opslaan gebruikers voor admin sectie */
    if($_GET['action'] == "save" && $_SERVER['REQUEST_METHOD'] == "POST"){
        if(!HasRights(10)){
            FatalError('Geen rechten');
        }
        
        $request = json_decode(file_get_contents("php://input"), true);
        
        $login      = SQL_Filter($request['login'], 'text');
        $voornaam   = SQL_Filter($request['voornaam'], 'text');
        $achternaam = SQL_Filter($request['achternaam'], 'text');
        $level      = SQL_Filter($request['level'], 'int');
        $email      = SQL_Filter($request['email'], 'text');
        $actief     = SQL_Filter($request['actief'], 'int');
        $mailupdates     = SQL_Filter($request['mailupdates'], 'int');
        if($request['id'] == "new"){
            $password   = SQL_Filter($request['password'], 'text');
            
            
            if(SQL_Query_Exec("INSERT INTO gebruiker(login, password, voornaam, achternaam, level, email, actief, mailupdates) VALUES ($login, PASSWORD($password), $voornaam, $achternaam, $level, $email, $actief, $mailupdates);")){
                $response = SQL_Query_Array("SELECT id, login, voornaam, achternaam, level, email, actief FROM gebruiker WHERE login=$login;");
            }
        }else{
            $id     = SQL_Filter($request['id'], 'int');
            
            
            if(SQL_Query_Exec("UPDATE gebruiker SET login=$login, voornaam=$voornaam, achternaam=$achternaam, level=$level, email=$email, actief=$actief, mailupdates=$mailupdates WHERE id=$id;")){
                $response = SQL_Query_Array("SELECT id, login, voornaam, achternaam, level, email, actief FROM gebruiker WHERE id=$id;");
            }
        }
    }
    
    include('inc.end.php');
?>