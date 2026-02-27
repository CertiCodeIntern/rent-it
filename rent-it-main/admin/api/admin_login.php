<?php
/**
 * Admin Login API Endpoint
 * Validates admin credentials against the database using PHP sessions
 * Similar to client-side auth at /api/auth/login.php
 */
session_start();

error_reporting(0);
ini_set('display_errors', 0);

header("Content-Type: application/json; charset=UTF-8");

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
$data = json_decode(file_get_contents("php://input"));

if (empty($data->username) || empty($data->password)) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Please provide username and password"]);
    exit;
}

$username = mysqli_real_escape_string($conn, $data->username);
$password = $data->password;

// Look up admin account from admin_accounts table
$query = "SELECT admin_id, username, password, full_name, email FROM admin_accounts WHERE username = '$username' LIMIT 1";
$result = mysqli_query($conn, $query);

if (!$result || mysqli_num_rows($result) === 0) {
    http_response_code(401);
    echo json_encode(["success" => false, "message" => "Invalid username or password"]);
    mysqli_close($conn);
    exit;
}

$admin = mysqli_fetch_assoc($result);

// Verify password using bcrypt
if (!password_verify($password, $admin['password'])) {
    http_response_code(401);
    echo json_encode(["success" => false, "message" => "Invalid username or password"]);
    mysqli_close($conn);
    exit;
}

// Set PHP session
$_SESSION['admin_id'] = $admin['admin_id'];
$_SESSION['admin_email'] = $admin['email'];
$_SESSION['admin_name'] = $admin['full_name'];
$_SESSION['admin_role'] = 'admin';
$_SESSION['admin_logged_in'] = true;

session_write_close();
mysqli_close($conn);

http_response_code(200);
echo json_encode([
    "success" => true,
    "message" => "Login successful",
    "admin" => [
        "id" => $admin['admin_id'],
        "fullName" => $admin['full_name'],
        "email" => $admin['email'],
        "role" => "admin"
    ]
]);
exit;
?>
