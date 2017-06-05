<?
    session_start();
    
    include('inc.settings.php');
    
    $response = array();
    
    $db = mysqli_connect($db_host, $db_user, $db_password, $db_name);
    if (!$db) {
        FatalError("Error: Unable to connect to MySQL." . PHP_EOL . "Debugging errno: " . mysqli_connect_errno() . PHP_EOL . "Debugging error: " . mysqli_connect_error(), true);
    }
		
	/*
		Fires an SQL query on the server an returns the result. Shows 
		an error when an error occured.

		Params:
			$query	Query to be fired
	*/
	function SQL_Query ($query, $stoperror=true){
        //echo "<div class='debug'><b>Query: </b><i> $query</i></div></br>";
        global $db;
        
		if($result = mysqli_query($db, $query)){
            return $result;
        }else{
            if($stoperror){
                RegularError("SQL Error: " . mysqli_error($db));
            }
            return false;
        }
		
	}	
	function SQL_Query_Exec($query, $stoperror=true){
        //echo "<div class='debug'><b>Query: </b><i> $query</i></div></br>";
        global $db;
        
		if($result = mysqli_query($db, $query)){
            return true;
        }else{
            if($stoperror){
                //RegularError("SQL Error: " . mysqli_error($db));
                /* echo($query . "\n\r");
                echo(memory_get_usage() . "\n\r"); */
                RegularError("SQL Error: " . mysqli_error($db) . "\n\rQuery:$query");
            }
            return false;
        }
	}		
	
    function SQL_Query_Array($query, $stoperror=true){
        $resultset = array();
        
        $result = SQL_Query($query, $stoperror);
        
        while ($row = mysqli_fetch_assoc($result)) {
            $resultset[] = $row;
        }
        
         mysqli_free_result($result);
         
         return $resultset;
    }
	
	function SQL_Filter($theValue, $theType, $theDefinedValue = "", $theNotDefinedValue = "") 
	{
        global $db;
        $theValue = get_magic_quotes_gpc() ? stripslashes($theValue) : $theValue;
        $theValue = mysqli_real_escape_string($db, $theValue);
        switch ($theType) {
            case "text":
                $theValue = ($theValue != "") ? "'" . $theValue . "'" : "''";
                break; 
            case "long":
            case "int":
                $theValue = ($theValue != "") ? intval($theValue) : "NULL";
                break;
            case "double":
                $theValue = ($theValue != "") ? "'" . doubleval($theValue) . "'" : "NULL";
                break;
            case "date":
                $theValue = ($theValue != "") ? "'" . $theValue . "'" : "NULL";
                break;
            case "time":
                $theValue = ($theValue != "") ? "'" . $theValue . "'" : "NULL";
                break;
            case "defined":
                $theValue = ($theValue != "") ? $theDefinedValue : $theNotDefinedValue;
                break;
        }
        return $theValue;
	}
    
    function RegularError($text, $nodb=false){
        if(!$nodb){
            SQL_Log("error", "Fatal error: " . $text);
        }
        
        $error = array("error" => true, "errorText" => $text);
        header("content-type: application/json");
        die(json_encode($error));
    }
    function FatalError($text, $nodb=false){
        if(!$nodb){
            SQL_Log("fatalerror", "Fatal error: " . $text);
        }
        
        $error = array("error" => true, "errorText" => $text);
        header("content-type: application/json");
        die(json_encode($error));
    }
    
	function SQL_Log($type, $message){
		SQL_Query_Exec("INSERT INTO LOG (type, text, gebruiker_id) VALUES (". SQL_FILTER($type, "text") . ", " . SQL_FILTER($message, "text") . ", " . ($_SESSION['gebruiker_id']) . ");", false);
	}

    function HasRights($level){
        $hasRights = false;
        
        if(isset($_SESSION['ingelogd']) && $_SESSION['ingelogd'] && isset($_SESSION['gebruiker_id']) && $_SESSION['gebruiker_id'] != null){
            $result = SQL_Query("SELECT id, level FROM gebruiker WHERE id=" . SQL_Filter($_SESSION['gebruiker_id'], "int", 0) . " AND actief=1;");
            
            if(mysqli_num_rows($result) > 0){
                $gebruiker = mysqli_fetch_assoc($result);
                
                if(intval($gebruiker['level']) >= $level){
                    $hasRights = true;
                }
            }
            
            mysqli_free_result($result);
        }
        
        return $hasRights;
    }
    
    
    
    function sendMailFromTemplate($toEmail, $subject, $template, $replacements){
        global $blokhutemail, $blokhutnaamfull;
        
        //  Read template
        $file = fopen($template, "r") or RegularError("Unable to open file!");
        $templatedata = fread($file,filesize($template));
        fclose($file);
        
        //  Replace values
        $templatedata = preg_replace_callback(
            '/{{([a-z\-\_A-Z0-9]*)}}/',
            function ($matches) use ($replacements) {
                return $replacements[$matches[1]];
            },
            $templatedata
        );
        
        // Always set content-type when sending HTML email
        $headers = "MIME-Version: 1.0" . "\r\n";
        $headers .= "Content-type:text/html;charset=UTF-8" . "\r\n";

        // More headers
        $headers .= 'From: Verhuur ' . $blokhutnaamfull . ' <'  . $blokhutemail . '>' . "\r\n";

        mail($toEmail, $subject, $templatedata, $headers);
        
    }
?>