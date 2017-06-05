<?
    include('inc.base.php');
    
        
    if($_GET['action'] == "login"){
        if($_SERVER['REQUEST_METHOD'] == "POST"){
            $request = json_decode(file_get_contents("php://input"), true);
            
            
            

            if(!IsSet($request['login'])){
                RegularError("Expected login name!");
            }
                    
            if(!IsSet($request['password'])){
                RegularError("Expected password!");
            }
            
            $result = SQL_Query("SELECT id, voornaam, achternaam, level FROM gebruiker WHERE login=" . SQL_Filter($request['login'], "text") . " AND password=PASSWORD(" . SQL_Filter($request['password'], "text") . ") AND actief=1;");
            
            if(mysqli_num_rows($result) > 0){
                $gebruiker = mysqli_fetch_assoc($result);
                $_SESSION['ingelogd'] = true;
                $_SESSION['gebruiker_id'] = $gebruiker['id'];
                
                $response['succes'] = true;
                $response['voornaam'] = $gebruiker['voornaam'];
                $response['achternaam'] = $gebruiker['achternaam'];
                $response['level'] = intval($gebruiker['level']);
                
                SQL_Log("LoginSuccess", "Login successful for login id " . SQL_Filter($request['login'], "text") . ".");
            }else{
                $_SESSION['ingelogd'] = false;
                $_SESSION['gebruiker_id'] = null;
                
                $response['succes'] = false;
                $response['voornaam'] = "";
                $response['achternaam'] = "";
                $response['level'] = 0;
                
                SQL_Log("LoginFailed", "Login failed with login id '" . SQL_Filter($request['login'], "text") . "'.");
            }
            
            mysqli_free_result($result);
            
        }
    }else if($_GET['action'] == "isloggedin"){
        $loggedin = false;
        if(isset($_SESSION['ingelogd']) && $_SESSION['ingelogd'] && isset($_SESSION['gebruiker_id']) && $_SESSION['gebruiker_id'] != null){
            $result = SQL_Query("SELECT id, voornaam, achternaam, level FROM gebruiker WHERE id=" . SQL_Filter($_SESSION['gebruiker_id'], "int", 0) . " AND actief=1;");
            
            if(mysqli_num_rows($result) > 0){
                $gebruiker = mysqli_fetch_assoc($result);
                
                $loggedin=true;
                
                $response['loggedin'] = true;
                $response['voornaam'] = $gebruiker['voornaam'];
                $response['achternaam'] = $gebruiker['achternaam'];
                $response['level'] = intval($gebruiker['level']);
            }
            
            mysqli_free_result($result);
        }
        
        if(!$loggedin){
            $_SESSION['ingelogd'] = false;
            $_SESSION['gebruiker_id'] = null;
            
            $response['loggedin'] = false;
            $response['voornaam'] = "";
            $response['achternaam'] = "";
            $response['level'] = 0;
        }
    }else if($_GET['action'] == "logout"){
        if(isset($_SESSION['ingelogd']) && $_SESSION['ingelogd'] && isset($_SESSION['gebruiker_id']) && $_SESSION['gebruiker_id'] != null){
            SQL_Log("Logout", "Login id '" . SQL_Filter($request['login'], "text") . "' logged out.");
        }
        
         $_SESSION['ingelogd'] = false;
        $_SESSION['gebruiker_id'] = null;
        
        $response['succes'] = false;
        $response['voornaam'] = "";
        $response['achternaam'] = "";
        $response['level'] = 0;
        
    }
    
    include('inc.end.php');
?>