<?php
// 1. Session start dapat nasa pinakataas at ISANG BESES lang.
session_start();

// 2. Iwasan ang display_errors para hindi masira ang JSON response
error_reporting(0);
ini_set('display_errors', 0);

header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: http://localhost"); // Palitan mo ito kung iba ang host mo
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Credentials: true"); // Mahalaga ito para sa Sessions
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Get database connection
// Siguraduhin na tama ang paths na ito. Kung mali, dito galing ang "<br /> <b>" error.
include_once '../config/database.php';
include_once '../models/User.php';

$database = new Database();
$db = $database->getConnection();

if (!$db) {
    http_response_code(503);
    echo json_encode(array("success" => false, "message" => "Database connection failed"));
    exit;
}

$user = new User($db);

// Get posted data
$data = json_decode(file_get_contents("php://input"));

// Validate required fields
if(!empty($data->email) && !empty($data->password)) {
    $user->email = $data->email;
    $user->password = $data->password;

    // Validate email format
    if(!filter_var($data->email, FILTER_VALIDATE_EMAIL)) {
        http_response_code(400);
        echo json_encode(array("success" => false, "message" => "Invalid email format"));
        exit;
    }

    // Attempt login
    $result = $user->login();
    
    if($result['success']) {
        // SET SESSION DATA (Wala nang session_start() dito dahil nandoon na sa taas)
        $_SESSION['user_id'] = $result['user']['id'];
        $_SESSION['user_email'] = $result['user']['email'];
        $_SESSION['user_role'] = $result['user']['role'];
        $_SESSION['user_name'] = $result['user']['full_name'];
        
        // I-save ang session bago mag-output
        session_write_close();

        http_response_code(200);
        echo json_encode(array(
            "success" => true,
            "message" => "Login successful",
            "user" => $result['user']
        ));
        exit;
    } else {
        http_response_code(401);
        echo json_encode(array("success" => false, "message" => $result['message']));
        exit;
    }
} else {
    http_response_code(400);
    echo json_encode(array("success" => false, "message" => "Please provide email and password"));
    exit;
}
?>  