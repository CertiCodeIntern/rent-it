<?php
/**
 * Admin Logout API Endpoint
 * Destroys admin session and redirects to login
 */
session_start();

// Clear all admin session data
unset($_SESSION['admin_id']);
unset($_SESSION['admin_email']);
unset($_SESSION['admin_name']);
unset($_SESSION['admin_role']);
unset($_SESSION['admin_logged_in']);

session_destroy();

// If called via AJAX, return JSON
if (isset($_SERVER['HTTP_X_REQUESTED_WITH']) && strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) === 'xmlhttprequest') {
    header("Content-Type: application/json; charset=UTF-8");
    echo json_encode(["success" => true, "message" => "Logged out successfully"]);
    exit;
}

// Otherwise redirect to login
header("Location: /rent-it/admin/auth/login.php");
exit;
?>
