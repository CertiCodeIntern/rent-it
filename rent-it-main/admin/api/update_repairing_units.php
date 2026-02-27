<?php
/**
 * Update Repairing Units API
 * Updates only the repairing_units field for an item
 */
session_start();

if (!isset($_SESSION['admin_logged_in']) || $_SESSION['admin_logged_in'] !== true) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit();
}

require_once __DIR__ . '/../../config.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit();
}

$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['item_id']) || !is_numeric($data['item_id'])) {
    echo json_encode(['success' => false, 'message' => 'Missing or invalid item ID']);
    exit();
}

if (!isset($data['repairing_units']) || !is_numeric($data['repairing_units'])) {
    echo json_encode(['success' => false, 'message' => 'Missing or invalid repairing units']);
    exit();
}

$item_id = intval($data['item_id']);
$repairing_units = intval($data['repairing_units']);

// Get current item data including total_units
$check = $conn->prepare("SELECT total_units, repairing_units FROM item WHERE item_id = ?");
$check->bind_param("i", $item_id);
$check->execute();
$result = $check->get_result();

if ($result->num_rows === 0) {
    echo json_encode(['success' => false, 'message' => 'Item not found']);
    $check->close();
    exit();
}

$itemData = $result->fetch_assoc();
$total_units = intval($itemData['total_units']);
$check->close();

// Validate repairing_units doesn't exceed total_units
if ($repairing_units > $total_units) {
    echo json_encode(['success' => false, 'message' => "Repairing units ($repairing_units) cannot exceed total units ($total_units)"]);
    exit();
}

// Calculate currently rented units (sum of quantities)
$rentedQuery = "SELECT COALESCE(SUM(ri.quantity), 0) as rented_count 
                FROM rental_item ri 
                JOIN rental r ON ri.order_id = r.order_id 
                WHERE ri.item_id = ? 
                AND r.rental_status IN ('Pending', 'Booked', 'Confirmed', 'In Transit', 'Active', 'Pending Return', 'Late')";
$rentedStmt = $conn->prepare($rentedQuery);
$rentedStmt->bind_param("i", $item_id);
$rentedStmt->execute();
$rentedResult = $rentedStmt->get_result();
$rentedData = $rentedResult->fetch_assoc();
$rented_units = intval($rentedData['rented_count']);
$rentedStmt->close();

// Calculate available units: Total - Rented - Repairing
$available_units = max(0, $total_units - $rented_units - $repairing_units);

// Update both repairing_units and available_units
$updateStmt = $conn->prepare("UPDATE item SET repairing_units = ?, available_units = ? WHERE item_id = ?");
$updateStmt->bind_param("iii", $repairing_units, $available_units, $item_id);

if ($updateStmt->execute()) {
    echo json_encode([
        'success' => true,
        'message' => 'Repairing units updated successfully',
        'item_id' => $item_id,
        'repairing_units' => $repairing_units,
        'available_units' => $available_units,
        'rented_units' => $rented_units
    ]);
} else {
    echo json_encode([
        'success' => false,
        'message' => 'Database error: ' . $updateStmt->error
    ]);
}

$updateStmt->close();
$conn->close();
?>
