<?
    header("content-type: application/json");
    echo(json_encode($response));
    
    mysqli_close($db);
?>