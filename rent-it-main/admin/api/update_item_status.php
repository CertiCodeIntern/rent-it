<?php
/**
 * Update Item Status API
 * Changes an item's status (Available, Repairing, Unavailable)
 * and optionally creates a repair ticket when setting to Repairing
 */
session_start();

// Check admin auth
if (!isset($_SESSION['admin_logged_in']) || $_SESSION['admin_logged_in'] !== true) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit();
}

require_once __DIR__ . '/../../config.php';

header('Content-Type: application/json');

// Only accept POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit();
}

$data = json_decode(file_get_contents('php://input'));

if (!$data || !isset($data->item_id) || !isset($data->status)) {
    echo json_encode(['success' => false, 'message' => 'Missing item_id or status']);
    exit();
}

$item_id = intval($data->item_id);
$status = trim($data->status);
$allowed_statuses = ['Available', 'Repairing', 'Unavailable'];

if (!in_array($status, $allowed_statuses)) {
    echo json_encode(['success' => false, 'message' => 'Invalid status. Allowed: ' . implode(', ', $allowed_statuses)]);
    exit();
}

// Update the item status
$stmt = $conn->prepare("UPDATE item SET status = ? WHERE item_id = ?");
$stmt->bind_param("si", $status, $item_id);

if ($stmt->execute()) {
    if ($stmt->affected_rows > 0) {
        // If setting to Repairing, create a repair ticket
        if ($status === 'Repairing') {
            $issue_type = isset($data->issue_type) ? trim($data->issue_type) : 'General Maintenance';
            $priority = isset($data->priority) ? trim($data->priority) : 'medium';
            $notes = isset($data->notes) ? trim($data->notes) : '';
            $estimated_cost = isset($data->estimated_cost) ? floatval($data->estimated_cost) : 0;
            $created_date = date('Y-m-d');
            $eta_date = isset($data->eta_date) ? trim($data->eta_date) : date('Y-m-d', strtotime('+7 days'));
            $repair_status = 'in-progress';
            $repair_quantity = isset($data->repair_quantity) ? intval($data->repair_quantity) : 1;

            $repair_stmt = $conn->prepare("INSERT INTO repair (item_id, quantity, issue_type, priority, status, created_date, eta_date, estimated_cost, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
            $repair_stmt->bind_param("iisssssds", $item_id, $repair_quantity, $issue_type, $priority, $repair_status, $created_date, $eta_date, $estimated_cost, $notes);
            $repair_stmt->execute();
            $repair_stmt->close();
        }

        echo json_encode([
            'success' => true,
            'message' => "Item status updated to {$status}",
            'item_id' => $item_id,
            'status' => $status
        ]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Item not found']);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $stmt->error]);
}

$stmt->close();
$conn->close();
?>
