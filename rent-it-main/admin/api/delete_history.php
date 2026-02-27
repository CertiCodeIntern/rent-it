<?php
/**
 * Delete History API
 * Deletes a completed/returned rental order and its associated rental items
 */
require_once __DIR__ . '/../../config.php';

header('Content-Type: application/json');

// Only accept POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Invalid request method']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['order_id'])) {
    echo json_encode(['success' => false, 'message' => 'Order ID is required']);
    exit;
}

$orderId = intval($data['order_id']);

// Verify the order exists and is in a completed/returned state
$checkQuery = "SELECT order_id, rental_status FROM rental WHERE order_id = ?";
$stmt = mysqli_prepare($conn, $checkQuery);
mysqli_stmt_bind_param($stmt, "i", $orderId);
mysqli_stmt_execute($stmt);
$result = mysqli_stmt_get_result($stmt);
$order = mysqli_fetch_assoc($result);
mysqli_stmt_close($stmt);

if (!$order) {
    echo json_encode(['success' => false, 'message' => 'Order not found']);
    exit;
}

if (!in_array($order['rental_status'], ['Completed', 'Returned'])) {
    echo json_encode(['success' => false, 'message' => 'Only completed or returned orders can be deleted from history']);
    exit;
}

// Begin transaction
mysqli_begin_transaction($conn);

try {
    // Delete rental items first (foreign key dependency)
    $deleteItemsQuery = "DELETE FROM rental_item WHERE order_id = ?";
    $stmtItems = mysqli_prepare($conn, $deleteItemsQuery);
    mysqli_stmt_bind_param($stmtItems, "i", $orderId);
    mysqli_stmt_execute($stmtItems);
    mysqli_stmt_close($stmtItems);

    // Delete the rental record
    $deleteRentalQuery = "DELETE FROM rental WHERE order_id = ?";
    $stmtRental = mysqli_prepare($conn, $deleteRentalQuery);
    mysqli_stmt_bind_param($stmtRental, "i", $orderId);
    mysqli_stmt_execute($stmtRental);
    mysqli_stmt_close($stmtRental);

    mysqli_commit($conn);

    echo json_encode(['success' => true, 'message' => 'History record deleted successfully']);
} catch (Exception $e) {
    mysqli_rollback($conn);
    echo json_encode(['success' => false, 'message' => 'Failed to delete: ' . $e->getMessage()]);
}
?>
