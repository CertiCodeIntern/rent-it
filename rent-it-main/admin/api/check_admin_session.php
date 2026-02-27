<?php
/**
 * Check Admin Session API Endpoint
 * Returns whether admin is currently authenticated
 */
session_start();

header("Content-Type: application/json; charset=UTF-8");

if (isset($_SESSION['admin_logged_in']) && $_SESSION['admin_logged_in'] === true) {
    echo json_encode([
        "success" => true,
        "authenticated" => true,
        "admin" => [
            "id" => $_SESSION['admin_id'],
            "email" => $_SESSION['admin_email'],
            "fullName" => $_SESSION['admin_name'],
            "role" => $_SESSION['admin_role']
        ]
    ]);
} else {
    echo json_encode([
        "success" => true,
        "authenticated" => false
    ]);
}
exit;
?>
