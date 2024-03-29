

<?php

    //setto la zona di prelevamento data
    date_default_timezone_set('Europe/Rome');

    //effettuo l'include per connettermi al DataBase
    include 'DBconnect.php';
    
    //inizializzo la sessione
    session_start();

    //prelevo da HTML/JavaScript le variabili che mi servono
    $nome_album = mysqli_real_escape_string($connect, $_POST['nome_album']);
    $descrizione = mysqli_real_escape_string($connect, $_POST['descrizione']);
    $imgLink = mysqli_real_escape_string($connect, $_POST['imgLink']);
    $privato = isset($_POST['privato']) ? 1 : 0;
    
    //Prendo l'utente
    $user = mysqli_real_escape_string($connect, $_SESSION['utente']);
    
    //query per ottenere l'email
    $get_email_query = "SELECT email FROM Utente WHERE nome='$user'";
    $email_arr = mysqli_query($connect, $get_email_query);

    while($row = mysqli_fetch_array($email_arr)){
        $email = mysqli_real_escape_string($connect, $row["email"]);
    }

    $data = date('Y-m-d H:i:s');
    
    //inserisco nuovo album
    $insert_album_query = "INSERT INTO Album(nome, descrizione, data, imgLink, privato, email) VALUES ('$nome_album', '$descrizione','$data', '$imgLink','$privato','$email')";
    $insert_album = mysqli_query($connect, $insert_album_query);

    //verifico se la query è andata a buon fine
    if(!$insert_album){
        echo "error";
    }
    else{

        //prendo l'ID dell'album aggiunto per settarlo come variabile di sessione
        $album_id_str = "SELECT id FROM Album WHERE nome='$nome_album' AND descrizione='$descrizione' AND email='$email'";
        $album_id_query = mysqli_query($connect, $album_id_str);

        while($row = mysqli_fetch_array($album_id_query)){
            $album_id = $row["id"];
        }

        $_SESSION['currentAlbum'] = $album_id;
        echo "success";
    }

    ?>