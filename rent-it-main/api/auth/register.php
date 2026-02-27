<?php
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Get database connection
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
if(
    !empty($data->email) &&
    !empty($data->password) &&
    !empty($data->confirm_password)
) {
    // Check if passwords match
    if($data->password !== $data->confirm_password) {
        http_response_code(400);
        echo json_encode(array("success" => false, "message" => "Passwords do not match"));
        exit;
    }

    // Check password length
    if(strlen($data->password) < 6) {
        http_response_code(400);
        echo json_encode(array("success" => false, "message" => "Password must be at least 6 characters"));
        exit;
    }

    // Validate email format
    if(!filter_var($data->email, FILTER_VALIDATE_EMAIL)) {
        http_response_code(400);
        echo json_encode(array("success" => false, "message" => "Invalid email format"));
        exit;
    }

    // Set user properties
    $user->full_name = $data->full_name ?? '';
    $user->email = $data->email;
    $user->phone = $data->phone ?? '';
    $user->password = $data->password;
    $user->role = 'customer'; // Default role

    // Register user
    $result = $user->register();
    
    if($result['success']) {
        // Get created user data
        $user_data = $user->getUserByEmail($user->email);
        
        http_response_code(201);
        echo json_encode(array(
            "success" => true,
            "message" => "User registered successfully",
            "user" => $user_data
        ));
    } else {
        http_response_code(400);
        echo json_encode(array("success" => false, "message" => $result['message']));
    }
} else {
    http_response_code(400);
    echo json_encode(array("success" => false, "message" => "Incomplete data. Please provide email, password, and confirm password."));
}
?>