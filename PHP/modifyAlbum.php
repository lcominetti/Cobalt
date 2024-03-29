<?php

    date_default_timezone_set('Europe/Rome');

    //includo codice per la connessione al DataBase
    include 'DBconnect.php';

    //inizializzo la sessione
    session_start();

    //prendo l'id dell'album corrente
    $id_album = mysqli_real_escape_string($connect, $_SESSION['currentAlbum']);

    //nome, descrizione
    $nome = mysqli_real_escape_string($connect, $_POST["nome"]);
    $descrizione = mysqli_real_escape_string($connect, $_POST["descrizione"]);
    $imgLink = mysqli_real_escape_string($connect, $_POST["imgLink"]);
    $privato = isset($_POST['privato']) ? 1 : 0;;

    $data = date('Y-m-d H:i:s');

    //query per modificare l'album
    $update_query = "UPDATE Album SET nome='$nome', descrizione='$descrizione', data = '$data', imgLink='$imgLink', privato='$privato' WHERE id='$id_album'";
    $update = mysqli_query($connect, $update_query);

    //controllo se la query è andata a buon fine per utilizzare l'ajax
    if(!$update){
        echo "error";
    }
    else{
        echo "success";
    }

?>