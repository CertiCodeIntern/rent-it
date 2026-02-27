<?php
/**
 * Get Calendar API
 * Fetches items, bookings, and repairs for calendar display
 */
require_once __DIR__ . '/../../config.php';

header('Content-Type: application/json');

// Get date range from query params (default to current week)
$startDate = isset($_GET['start']) ? $_GET['start'] : date('Y-m-d', strtotime('monday this week'));
$endDate = isset($_GET['end']) ? $_GET['end'] : date('Y-m-d', strtotime('saturday this week'));

// Validate dates
if (!strtotime($startDate) || !strtotime($endDate)) {
    echo json_encode(['success' => false, 'message' => 'Invalid date format']);
    exit;
}

// Fetch all items
$itemsQuery = "SELECT item_id, item_name, category, status FROM item ORDER BY item_name";
$itemsResult = mysqli_query($conn, $itemsQuery);

if (!$itemsResult) {
    echo json_encode(['success' => false, 'message' => 'Database error: ' . mysqli_error($conn)]);
    exit;
}

$items = [];
while ($item = mysqli_fetch_assoc($itemsResult)) {
    $items[] = [
        'id' => intval($item['item_id']),
        'name' => $item['item_name'],
        'category' => $item['category'] ?? 'Equipment',
        'status' => $item['status'] ?? 'Available'
    ];
}

// Fetch bookings within date range
$bookingsQuery = "SELECT 
    r.order_id,
    r.user_id,
    r.rental_status,
    r.start_date,
    r.end_date,
    r.venue,
    r.total_price,
    u.full_name as customer_name,
    u.email as customer_email,
    ri.item_id
FROM rental r
LEFT JOIN users u ON r.user_id = u.id
INNER JOIN rental_item ri ON r.order_id = ri.order_id
WHERE 
    (r.start_date <= ? AND r.end_date >= ?)
    OR (r.start_date >= ? AND r.start_date <= ?)
    OR (r.end_date >= ? AND r.end_date <= ?)
ORDER BY r.start_date";

$stmt = mysqli_prepare($conn, $bookingsQuery);
mysqli_stmt_bind_param($stmt, "ssssss", $endDate, $startDate, $startDate, $endDate, $startDate, $endDate);
mysqli_stmt_execute($stmt);
$bookingsResult = mysqli_stmt_get_result($stmt);

$bookings = [];
while ($booking = mysqli_fetch_assoc($bookingsResult)) {
    $bookings[] = [
        'id' => 'BK-' . str_pad($booking['order_id'], 5, '0', STR_PAD_LEFT),
        'order_id' => intval($booking['order_id']),
        'item_id' => intval($booking['item_id']),
        'customer_name' => $booking['customer_name'] ?? 'Unknown',
        'customer_email' => $booking['customer_email'] ?? '',
        'venue' => $booking['venue'] ?? '',
        'status' => $booking['rental_status'] ?? 'Pending',
        'start_date' => $booking['start_date'],
        'end_date' => $booking['end_date'],
        'total' => floatval($booking['total_price'] ?? 0)
    ];
}
mysqli_stmt_close($stmt);

// Fetch repairs within date range
$repairsQuery = "SELECT 
    repair_id,
    item_id,
    issue_type,
    priority,
    status AS repair_status,
    estimated_cost,
    notes,
    created_date,
    eta_date
FROM repair
WHERE 
    (created_date <= ? AND (eta_date IS NULL OR eta_date >= ?))
    OR (created_date >= ? AND created_date <= ?)
ORDER BY created_date";

$stmtRepair = mysqli_prepare($conn, $repairsQuery);
mysqli_stmt_bind_param($stmtRepair, "ssss", $endDate, $startDate, $startDate, $endDate);
mysqli_stmt_execute($stmtRepair);
$repairsResult = mysqli_stmt_get_result($stmtRepair);

$repairs = [];
while ($repair = mysqli_fetch_assoc($repairsResult)) {
    $repairs[] = [
        'id' => 'RP-' . str_pad($repair['repair_id'], 5, '0', STR_PAD_LEFT),
        'repair_id' => intval($repair['repair_id']),
        'item_id' => intval($repair['item_id']),
        'description' => $repair['issue_type'] ?? '',
        'priority' => $repair['priority'] ?? 'medium',
        'status' => $repair['repair_status'] ?? 'in-progress',
        'estimated_cost' => floatval($repair['estimated_cost'] ?? 0),
        'notes' => $repair['notes'] ?? '',
        'reported_date' => $repair['created_date'],
        'resolved_date' => $repair['eta_date']
    ];
}
mysqli_stmt_close($stmtRepair);

// Calculate stats
$totalBookingsThisWeek = count(array_unique(array_column($bookings, 'order_id')));
// Count unique items in repair (not individual repair records)
$activeRepairs = array_filter($repairs, function($r) { return $r['status'] !== 'Resolved'; });
$uniqueRepairItemIds = array_unique(array_column($activeRepairs, 'item_id'));
$itemsInRepair = count($uniqueRepairItemIds);
$availableItems = count(array_filter($items, function($i) { return $i['status'] === 'Available'; }));

// Return response
echo json_encode([
    'success' => true,
    'dateRange' => [
        'start' => $startDate,
        'end' => $endDate
    ],
    'items' => $items,
    'bookings' => $bookings,
    'repairs' => $repairs,
    'stats' => [
        'bookingsThisWeek' => $totalBookingsThisWeek,
        'inRepair' => $itemsInRepair,
        'available' => $availableItems
    ]
]);
