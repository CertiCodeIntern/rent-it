<?php
/**
 * Update Repair Ticket API
 * Updates an existing repair ticket's details (issue_type, priority, eta_date, estimated_cost, notes, status)
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

$data = json_decode(file_get_contents('php://input'));

if (!$data || !isset($data->repair_id)) {
    echo json_encode(['success' => false, 'message' => 'Missing repair_id']);
    exit();
}

$repair_id = intval($data->repair_id);

// Verify repair exists
$check = $conn->prepare("SELECT repair_id FROM repair WHERE repair_id = ?");
$check->bind_param("i", $repair_id);
$check->execute();
$result = $check->get_result();
if ($result->num_rows === 0) {
    echo json_encode(['success' => false, 'message' => 'Repair ticket not found']);
    $check->close();
    exit();
}
$check->close();

// Build dynamic update query based on provided fields
$updates = [];
$types = '';
$values = [];

if (isset($data->issue_type) && trim($data->issue_type) !== '') {
    $updates[] = "issue_type = ?";
    $types .= 's';
    $values[] = trim($data->issue_type);
}

if (isset($data->priority)) {
    $allowed_priorities = ['low', 'medium', 'high'];
    $priority = strtolower(trim($data->priority));
    if (in_array($priority, $allowed_priorities)) {
        $updates[] = "priority = ?";
        $types .= 's';
        $values[] = $priority;
    }
}

if (isset($data->status)) {
    $allowed_statuses = ['in-progress', 'awaiting-parts', 'completed', 'unavailable'];
    $status = strtolower(trim($data->status));
    if (in_array($status, $allowed_statuses)) {
        $updates[] = "status = ?";
        $types .= 's';
        $values[] = $status;
    }
}

if (isset($data->eta_date) && trim($data->eta_date) !== '') {
    // Validate date format (YYYY-MM-DD)
    $eta = trim($data->eta_date);
    if (preg_match('/^\d{4}-\d{2}-\d{2}$/', $eta)) {
        // Validate not in the past
        $today = date('Y-m-d');
        if ($eta >= $today) {
            $updates[] = "eta_date = ?";
            $types .= 's';
            $values[] = $eta;
        } else {
            echo json_encode(['success' => false, 'message' => 'ETA date cannot be in the past']);
            exit();
        }
    } else {
        echo json_encode(['success' => false, 'message' => 'Invalid date format. Use YYYY-MM-DD']);
        exit();
    }
}

if (isset($data->estimated_cost)) {
    $cost = floatval($data->estimated_cost);
    if ($cost >= 0) {
        $updates[] = "estimated_cost = ?";
        $types .= 'd';
        $values[] = $cost;
    }
}

if (isset($data->notes)) {
    $updates[] = "notes = ?";
    $types .= 's';
    $values[] = trim($data->notes);
}

if (empty($updates)) {
    echo json_encode(['success' => false, 'message' => 'No fields to update']);
    exit();
}

// Add repair_id to the end
$types .= 'i';
$values[] = $repair_id;

$sql = "UPDATE repair SET " . implode(', ', $updates) . " WHERE repair_id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param($types, ...$values);

if ($stmt->execute()) {
    echo json_encode(['success' => true, 'message' => 'Repair ticket updated successfully']);
} else {
    echo json_encode(['success' => false, 'message' => 'Failed to update repair ticket']);
}

$stmt->close();
$conn->close();
?>
