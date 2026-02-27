<?php
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");

session_start();

// Destroy all session data
session_unset();
session_destroy();

http_response_code(200);
echo json_encode(array("success" => true, "message" => "Logged out successfully"));
?>