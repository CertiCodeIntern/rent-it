<?php
/**
 * Admin Forgot Password API
 * Handles security question verification and password reset
 * 
 * Actions:
 *   verify - Check answers to 3 security questions, return token
 *   reset  - Update password using token
 */
session_start();

error_reporting(0);
ini_set('display_errors', 0);

header("Content-Type: application/json; charset=UTF-8");

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

$data = json_decode(file_get_contents("php://input"));

if (empty($data->action)) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Missing action"]);
    exit;
}

// =====================================================
// Security Question Answers (case-insensitive matching)
// =====================================================
$CORRECT_ANSWERS = [
    'question1' => 'aaron raven aramil',
    'question2' => 'marc steeven parubrub',
    'question3_names' => ['leander ochea', 'via umali']
];

/**
 * Normalize a string for comparison: lowercase, trim, collapse whitespace
 */
function normalize($str) {
    return strtolower(trim(preg_replace('/\s+/', ' ', $str)));
}

// =====================================================
// ACTION: VERIFY - Check security question answers
// =====================================================
if ($data->action === 'verify') {
    if (empty($data->question1) || empty($data->question2) || empty($data->question3)) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Please answer all 3 questions"]);
        exit;
    }

    $q1 = normalize($data->question1);
    $q2 = normalize($data->question2);
    $q3 = normalize($data->question3);

    // Check Question 1
    if ($q1 !== $CORRECT_ANSWERS['question1']) {
        http_response_code(401);
        echo json_encode(["success" => false, "message" => "Incorrect answer to Question 1. Please try again."]);
        mysqli_close($conn);
        exit;
    }

    // Check Question 2
    if ($q2 !== $CORRECT_ANSWERS['question2']) {
        http_response_code(401);
        echo json_encode(["success" => false, "message" => "Incorrect answer to Question 2. Please try again."]);
        mysqli_close($conn);
        exit;
    }

    // Check Question 3 - two names, any order, comma or "and" separated
    // Parse user input: split by comma, "and", or "&"
    $q3_parts = preg_split('/[,&]|\band\b/i', $q3);
    $q3_names = array_map('normalize', $q3_parts);
    $q3_names = array_filter($q3_names, function($n) { return $n !== ''; });
    $q3_names = array_values($q3_names);

    $expected = $CORRECT_ANSWERS['question3_names'];
    $matched = 0;

    foreach ($expected as $expected_name) {
        foreach ($q3_names as $user_name) {
            if ($user_name === $expected_name) {
                $matched++;
                break;
            }
        }
    }

    if ($matched < count($expected)) {
        http_response_code(401);
        echo json_encode(["success" => false, "message" => "Incorrect answer to Question 3. Please try again."]);
        mysqli_close($conn);
        exit;
    }

    // All questions correct - generate a temporary token
    $token = bin2hex(random_bytes(32));
    $_SESSION['admin_reset_token'] = $token;
    $_SESSION['admin_reset_time'] = time();

    mysqli_close($conn);

    echo json_encode([
        "success" => true,
        "message" => "Identity verified successfully",
        "token" => $token
    ]);
    exit;
}

// =====================================================
// ACTION: RESET - Update password
// =====================================================
if ($data->action === 'reset') {
    if (empty($data->token) || empty($data->new_password)) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Missing token or password"]);
        exit;
    }

    // Verify token matches session
    if (!isset($_SESSION['admin_reset_token']) || $_SESSION['admin_reset_token'] !== $data->token) {
        http_response_code(401);
        echo json_encode(["success" => false, "message" => "Invalid or expired token. Please restart the process."]);
        mysqli_close($conn);
        exit;
    }

    // Check token hasn't expired (10 minute window)
    if (time() - $_SESSION['admin_reset_time'] > 600) {
        unset($_SESSION['admin_reset_token'], $_SESSION['admin_reset_time']);
        http_response_code(401);
        echo json_encode(["success" => false, "message" => "Token expired. Please restart the process."]);
        mysqli_close($conn);
        exit;
    }

    $new_password = $data->new_password;

    if (strlen($new_password) < 4) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Password must be at least 4 characters"]);
        mysqli_close($conn);
        exit;
    }

    // Hash the new password
    $hashed = password_hash($new_password, PASSWORD_BCRYPT);

    // Update the admin1 account password
    $query = "UPDATE `admin_accounts` SET `password` = '" . mysqli_real_escape_string($conn, $hashed) . "' WHERE `username` = 'admin1'";
    $result = mysqli_query($conn, $query);

    if ($result && mysqli_affected_rows($conn) > 0) {
        // Clear the reset token
        unset($_SESSION['admin_reset_token'], $_SESSION['admin_reset_time']);

        mysqli_close($conn);
        echo json_encode([
            "success" => true,
            "message" => "Password updated successfully"
        ]);
    } else {
        mysqli_close($conn);
        echo json_encode([
            "success" => false,
            "message" => "Failed to update password. Please try again."
        ]);
    }
    exit;
}

// Unknown action
http_response_code(400);
echo json_encode(["success" => false, "message" => "Unknown action"]);
mysqli_close($conn);
exit;
?>
