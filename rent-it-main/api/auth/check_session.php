<?php
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");

session_start();

if(isset($_SESSION['user_id'])) {
    echo json_encode(array(
        "success" => true,
        "authenticated" => true,
        "user" => array(
            "id" => $_SESSION['user_id'],
            "email" => $_SESSION['user_email'],
            "role" => $_SESSION['user_role'],
            "name" => $_SESSION['user_name']
        )
    ));
} else {
    echo json_encode(array(
        "success" => true,
        "authenticated" => false
    ));
}
?>