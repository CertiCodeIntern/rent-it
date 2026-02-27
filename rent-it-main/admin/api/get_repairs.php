<?php
/**
 * Get Repairs API
 * Returns all repair tickets joined with item info for admin repairs page
 */
session_start();

if (!isset($_SESSION['admin_logged_in']) || $_SESSION['admin_logged_in'] !== true) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit();
}

require_once __DIR__ . '/../../config.php';

header('Content-Type: application/json');

// Get repairs joined with item data
$query = "SELECT 
    r.repair_id,
    r.item_id,
    r.quantity,
    r.issue_type,
    r.priority,
    r.status,
    r.created_date,
    r.eta_date,
    r.estimated_cost,
    r.notes,
    i.item_name,
    i.category,
    i.status AS item_status,
    i.repairing_units,
    i.total_units,
    i.available_units
FROM repair r
LEFT JOIN item i ON r.item_id = i.item_id
ORDER BY r.repair_id DESC";

$result = mysqli_query($conn, $query);

if (!$result) {
    echo json_encode([
        'success' => false,
        'message' => 'Database error: ' . mysqli_error($conn)
    ]);
    exit;
}

$repairs = [];
while ($row = mysqli_fetch_assoc($result)) {
    $row['estimated_cost'] = $row['estimated_cost'] !== null ? floatval($row['estimated_cost']) : 0;
    $row['quantity'] = intval($row['quantity'] ?? 1);
    $row['repairing_units'] = intval($row['repairing_units'] ?? 0);
    $row['total_units'] = intval($row['total_units'] ?? 0);
    $row['available_units'] = intval($row['available_units'] ?? 0);
    $repairs[] = $row;
}

// Get stats counts
$stats = [
    'in_progress' => 0,
    'awaiting_parts' => 0,
    'completed' => 0,
    'unavailable' => 0
];

$stats_query = "SELECT status, COUNT(*) as count FROM repair GROUP BY status";
$stats_result = mysqli_query($conn, $stats_query);
if ($stats_result) {
    while ($srow = mysqli_fetch_assoc($stats_result)) {
        $s = strtolower(str_replace(' ', '_', str_replace('-', '_', $srow['status'])));
        if (isset($stats[$s])) {
            $stats[$s] = intval($srow['count']);
        }
    }
}

echo json_encode([
    'success' => true,
    'data' => $repairs,
    'stats' => $stats
]);

$conn->close();
?>
