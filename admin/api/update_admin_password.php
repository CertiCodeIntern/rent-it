<?php
/**
 * Update Admin Password API Endpoint
 * Validates current password and updates to new password with bcrypt hashing
 */
session_start();

error_reporting(0);
ini_set('display_errors', 0);

header("Content-Type: application/json; charset=UTF-8");

// Check admin session
if (!isset($_SESSION['admin_logged_in']) || $_SESSION['admin_logged_in'] !== true) {
    http_response_code(401);
    echo json_encode(["success" => false, "message" => "Unauthorized"]);
    exit;
}

// Only accept POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["success" => false, "message" => "Method not allowed"]);
    exit;
}

// Database connection
$conn = mysqli_connect("localhost", "root", "", "rental_system");
if (!$conn) {
    http_response_code(503);
    echo json_encode(["success" => false, "message" => "Database connection failed"]);
    exit;
}

// Get posted data
$data = json_decode(file_get_contents("php://input"), true);

if (empty($data['currentPassword']) || empty($data['newPassword']) || empty($data['confirmPassword'])) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "All fields are required"]);
    mysqli_close($conn);
    exit;
}

$currentPassword = $data['currentPassword'];
$newPassword = $data['newPassword'];
$confirmPassword = $data['confirmPassword'];
$admin_id = $_SESSION['admin_id'];

// Validate new password format (min 8 chars, letters and numbers)
if (strlen($newPassword) < 8) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "New password must be at least 8 characters long"]);
    mysqli_close($conn);
    exit;
}

if (!preg_match('/[a-zA-Z]/', $newPassword)) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "New password must contain at least one letter"]);
    mysqli_close($conn);
    exit;
}

if (!preg_match('/[0-9]/', $newPassword)) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "New password must contain at least one number"]);
    mysqli_close($conn);
    exit;
}

// Validate passwords match
if ($newPassword !== $confirmPassword) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "New passwords do not match"]);
    mysqli_close($conn);
    exit;
}

// Fetch current admin password from database
$query = "SELECT password FROM admin_accounts WHERE admin_id = ? LIMIT 1";
$stmt = $conn->prepare($query);

if (!$stmt) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Database error: " . $conn->error]);
    mysqli_close($conn);
    exit;
}

$stmt->bind_param("i", $admin_id);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    http_response_code(401);
    echo json_encode(["success" => false, "message" => "Admin account not found"]);
    $stmt->close();
    mysqli_close($conn);
    exit;
}

$admin = $result->fetch_assoc();
$stmt->close();

// Verify current password
if (!password_verify($currentPassword, $admin['password'])) {
    http_response_code(401);
    echo json_encode(["success" => false, "message" => "Current password is incorrect"]);
    mysqli_close($conn);
    exit;
}

// Check if new password is same as current
if (password_verify($newPassword, $admin['password'])) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "New password cannot be the same as current password"]);
    mysqli_close($conn);
    exit;
}

// Hash new password with bcrypt
$hashedPassword = password_hash($newPassword, PASSWORD_BCRYPT);

// Update password in database
$updateQuery = "UPDATE admin_accounts SET password = ? WHERE admin_id = ?";
$updateStmt = $conn->prepare($updateQuery);

if (!$updateStmt) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Database error: " . $conn->error]);
    mysqli_close($conn);
    exit;
}

$updateStmt->bind_param("si", $hashedPassword, $admin_id);
$success = $updateStmt->execute();
$updateStmt->close();

if (!$success) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Failed to update password"]);
    mysqli_close($conn);
    exit;
}

mysqli_close($conn);

http_response_code(200);
echo json_encode([
    "success" => true,
    "message" => "Password updated successfully"
]);
exit;
?>
