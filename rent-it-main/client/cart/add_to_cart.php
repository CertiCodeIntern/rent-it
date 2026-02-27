<?php
session_start();
include '../../shared/php/db_connection.php'; 

if (!isset($_SESSION['user_id'])) {
    header('Content-Type: application/json');
    echo json_encode(['success' => false, 'message' => 'Login required']);
    exit();
}

$user_id = $_SESSION['user_id'];

// Kunin ang Item ID, Start Date, End Date, and Quantity
$item_id = $_REQUEST['item_id'] ?? $_GET['id'] ?? null;
$start_date = $_POST['start_date'] ?? null; // Dapat galing sa input date ng modal
$end_date = $_POST['end_date'] ?? null;     // Dapat galing sa input date ng modal
$quantity = isset($_POST['quantity']) ? intval($_POST['quantity']) : 1;

if (!$item_id) {
    header('Content-Type: application/json');
    echo json_encode(['success' => false, 'message' => 'Invalid Request']);
    exit();
}

// Validate quantity
if ($quantity < 1) {
    header('Content-Type: application/json');
    echo json_encode(['success' => false, 'message' => 'Quantity must be at least 1']);
    exit();
}

// Check available units
$check_item_query = "SELECT available_units FROM item WHERE item_id = ?";
$stmt_item = $conn->prepare($check_item_query);
$stmt_item->bind_param("i", $item_id);
$stmt_item->execute();
$item_result = $stmt_item->get_result();

if ($item_result->num_rows === 0) {
    header('Content-Type: application/json');
    echo json_encode(['success' => false, 'message' => 'Item not found']);
    exit();
}

$item_data = $item_result->fetch_assoc();
if ($quantity > $item_data['available_units']) {
    header('Content-Type: application/json');
    echo json_encode(['success' => false, 'message' => 'Only ' . $item_data['available_units'] . ' units available']);
    exit();
}

// 1. Siguraduhin na may dates (Optional: Pwedeng lagyan ng default kung wala)
if (!$start_date || !$end_date) {
    // Default: same-day rental (1 day) if no dates selected
    $start_date = date('Y-m-d');
    $end_date = date('Y-m-d'); // Same day = 1 day rental (inclusive counting)
}

// 2. Check duplicate (Gamit ang prepared statement para sa security)
$check_query = "SELECT id FROM cart WHERE user_id=? AND item_id=?";
$stmt = $conn->prepare($check_query);
$stmt->bind_param("ii", $user_id, $item_id);
$stmt->execute();
$check_result = $stmt->get_result();

if ($check_result->num_rows == 0) {
    // 3. FIX: Isama na ang start_date, end_date, at quantity sa INSERT
    $insert_query = "INSERT INTO cart (user_id, item_id, quantity, start_date, end_date) VALUES (?, ?, ?, ?, ?)";
    $stmt_insert = $conn->prepare($insert_query);
    $stmt_insert->bind_param("iiiss", $user_id, $item_id, $quantity, $start_date, $end_date);
    $stmt_insert->execute();
} else {
    // Optional: I-update ang dates at quantity kung existing na ang item
    $update_query = "UPDATE cart SET quantity = ?, start_date = ?, end_date = ? WHERE user_id = ? AND item_id = ?";
    $stmt_update = $conn->prepare($update_query);
    $stmt_update->bind_param("issii", $quantity, $start_date, $end_date, $user_id, $item_id);
    $stmt_update->execute();
}

// Redirect o Success response
if (isset($_GET['id'])) {
    header("Location: cart.php");
    exit();
}

header('Content-Type: application/json');
echo json_encode(['success' => true, 'start_date' => $start_date, 'end_date' => $end_date]);