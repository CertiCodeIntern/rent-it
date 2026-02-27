<?php
/**
 * Get Orders API
 * Fetches all orders from the database with customer and item details
 */
require_once __DIR__ . '/../../config.php';

header('Content-Type: application/json');

// Fetch all orders with customer info
$ordersQuery = "SELECT r.order_id, r.user_id, r.rental_status, r.total_price, r.late_fee,
                       r.venue, r.customer_address, r.start_date, r.end_date,
                       u.full_name as customer_name, u.email as customer_email, 
                       u.phone as customer_phone
                FROM rental r
                LEFT JOIN users u ON r.user_id = u.id
                ORDER BY r.start_date DESC";

$result = mysqli_query($conn, $ordersQuery);

if (!$result) {
    echo json_encode(['success' => false, 'message' => 'Database error: ' . mysqli_error($conn)]);
    exit;
}

$orders = [];

while ($order = mysqli_fetch_assoc($result)) {
    // Fetch items for this order
    $itemsQuery = "SELECT ri.rental_item_id, ri.item_id, ri.item_price, ri.item_status,
                          ri.quantity, ri.start_date AS item_start_date, ri.end_date AS item_end_date,
                          i.item_name, i.category, i.image
                   FROM rental_item ri
                   LEFT JOIN item i ON ri.item_id = i.item_id
                   WHERE ri.order_id = ?";
    
    $stmtItems = mysqli_prepare($conn, $itemsQuery);
    mysqli_stmt_bind_param($stmtItems, "i", $order['order_id']);
    mysqli_stmt_execute($stmtItems);
    $itemsResult = mysqli_stmt_get_result($stmtItems);
    
    $items = [];
    while ($item = mysqli_fetch_assoc($itemsResult)) {
        $items[] = [
            'id' => $item['item_id'],
            'name' => $item['item_name'] ?? 'Unknown Item',
            'category' => $item['category'] ?? 'Equipment',
            'quantity' => intval($item['quantity'] ?? 1),
            'price' => floatval($item['item_price']),
            'start_date' => $item['item_start_date'],
            'end_date' => $item['item_end_date']
        ];
    }
    mysqli_stmt_close($stmtItems);

    // Map database status to frontend status
    $statusMap = [
        'Pending' => 'pending',
        'Booked' => 'confirmed',
        'Confirmed' => 'confirmed',
        'In Transit' => 'out_for_delivery',
        'Active' => 'active',
        'Pending Return' => 'return_scheduled',
        'Returned' => 'returned',
        'Completed' => 'completed',
        'Cancelled' => 'cancelled',
        'Late' => 'late'
    ];

    // Calculate duration
    $startDate = new DateTime($order['start_date']);
    $endDate = new DateTime($order['end_date']);
    $duration = $startDate->diff($endDate)->days + 1;

    $orders[] = [
        'id' => 'ORD-' . str_pad($order['order_id'], 4, '0', STR_PAD_LEFT),
        'order_id' => intval($order['order_id']),
        'customer' => [
            'id' => intval($order['user_id']),
            'name' => $order['customer_name'] ?? 'Unknown',
            'email' => $order['customer_email'] ?? '',
            'avatar' => null
        ],
        'items' => $items,
        'dates' => [
            'start' => $order['start_date'],
            'end' => $order['end_date'],
            'duration' => $duration
        ],
        'total' => floatval($order['total_price']),
        'status' => $statusMap[$order['rental_status']] ?? 'pending',
        'status_raw' => $order['rental_status']
    ];
}

// Calculate KPI counts
$kpiCounts = [
    'pending' => 0,
    'confirmed' => 0,
    'out_for_delivery' => 0,
    'active' => 0,
    'return_scheduled' => 0,
    'completed' => 0,
    'cancelled' => 0
];

foreach ($orders as $order) {
    if (isset($kpiCounts[$order['status']])) {
        $kpiCounts[$order['status']]++;
    }
}

echo json_encode([
    'success' => true,
    'data' => $orders,
    'counts' => $kpiCounts
]);
?>
