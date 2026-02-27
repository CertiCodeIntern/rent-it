<?php
/**
 * Get Order Detail API
 * Fetches a single order's details from the database
 */
require_once __DIR__ . '/../../config.php';

header('Content-Type: application/json');

// Get order ID
$orderId = isset($_GET['id']) ? intval($_GET['id']) : 0;

if (!$orderId) {
    echo json_encode(['success' => false, 'message' => 'Order ID is required']);
    exit;
}

// Fetch order details with user info
$orderQuery = "SELECT r.order_id, r.user_id, r.rental_status, r.total_price, r.late_fee,
                      r.venue, r.customer_address, r.start_date, r.end_date,
                      u.full_name as customer_name, u.email as customer_email, 
                      u.phone as customer_phone, u.address as user_address,
                      u.membership_level
               FROM rental r
               LEFT JOIN users u ON r.user_id = u.id
               WHERE r.order_id = ?";

$stmt = mysqli_prepare($conn, $orderQuery);
mysqli_stmt_bind_param($stmt, "i", $orderId);
mysqli_stmt_execute($stmt);
$result = mysqli_stmt_get_result($stmt);

if (mysqli_num_rows($result) === 0) {
    echo json_encode(['success' => false, 'message' => 'Order not found']);
    exit;
}

$order = mysqli_fetch_assoc($result);

// Fetch order items with deposit info
$itemsQuery = "SELECT ri.rental_item_id, ri.item_id, ri.item_price, ri.item_status, ri.quantity,
                      i.item_name, i.description, i.category, i.image, i.price_per_day, i.deposit
               FROM rental_item ri
               LEFT JOIN item i ON ri.item_id = i.item_id
               WHERE ri.order_id = ?";

$stmtItems = mysqli_prepare($conn, $itemsQuery);
mysqli_stmt_bind_param($stmtItems, "i", $orderId);
mysqli_stmt_execute($stmtItems);
$itemsResult = mysqli_stmt_get_result($stmtItems);

$items = [];
$totalDeposit = 0;
$startDate = new DateTime($order['start_date']);
$endDate = new DateTime($order['end_date']);
$duration = $startDate->diff($endDate)->days + 1;

while ($item = mysqli_fetch_assoc($itemsResult)) {
    $dailyRate = floatval($item['price_per_day'] ?? $item['item_price'] ?? 0);
    $itemDeposit = floatval($item['deposit'] ?? 0);
    $qty = intval($item['quantity'] ?? 1);
    $totalDeposit += $itemDeposit;

    $items[] = [
        'id' => $item['item_id'],
        'name' => $item['item_name'] ?? 'Unknown Item',
        'category' => $item['category'] ?? 'Equipment',
        'image' => $item['image'] ? 'assets/images/items/' . $item['image'] : null,
        'description' => $item['description'],
        'quantity' => $qty,
        'dailyRate' => $dailyRate,
        'subtotal' => $dailyRate * $duration * $qty,
        'deposit' => $itemDeposit,
        'status' => $item['item_status']
    ];
}

// Map DB status to frontend status
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

// Calculate payment breakdown
$subtotal = floatval($order['total_price']);
$lateFee = floatval($order['late_fee'] ?? 0);
$deliveryFee = 0;
$tax = 0;

// Resolve address — use rental customer_address, fallback to user address
$deliveryAddress = !empty($order['customer_address']) 
    ? $order['customer_address'] 
    : (!empty($order['user_address']) ? $order['user_address'] : 'Not specified');

// Determine delivery method from venue
$venue = $order['venue'] ?? '';
$deliveryMethod = 'Delivery';
if (stripos($venue, 'pickup') !== false || stripos($venue, 'pick-up') !== false || stripos($venue, 'pick up') !== false) {
    $deliveryMethod = 'Pickup';
} elseif (!empty($venue)) {
    $deliveryMethod = $venue;
}

// Build timeline based on current status
$currentStatus = $order['rental_status'];
$statusOrder = ['Pending', 'Booked', 'Confirmed', 'In Transit', 'Active', 'Pending Return', 'Returned', 'Completed'];
$statusIndex = array_search($currentStatus, $statusOrder);

// Handle Late status (treat as after Active in timeline)
$isLate = ($currentStatus === 'Late');
if ($isLate) {
    $statusIndex = 4; // Same position as Active
}
if ($statusIndex === false) $statusIndex = 0;

// Handle cancelled
$isCancelled = ($currentStatus === 'Cancelled');

$timelineEvents = [];
if ($isCancelled) {
    $timelineEvents = [
        ['event' => 'Order Placed', 'date' => $order['start_date'], 'completed' => true],
        ['event' => 'Order Cancelled', 'date' => $order['start_date'], 'completed' => true, 'current' => true]
    ];
} else {
    $timelineEvents = [
        ['event' => 'Order Placed', 'date' => $order['start_date'], 'completed' => true],
        ['event' => 'Order Confirmed', 'date' => $statusIndex >= 1 ? $order['start_date'] : null, 'completed' => $statusIndex >= 1],
        ['event' => 'Out for Delivery', 'date' => $statusIndex >= 3 ? $order['start_date'] : null, 'completed' => $statusIndex >= 3],
        ['event' => 'Delivered / Active', 'date' => $statusIndex >= 4 ? $order['start_date'] : null, 'completed' => $statusIndex >= 4],
        ['event' => $isLate ? 'Late Return' : 'Return Scheduled', 'date' => $statusIndex >= 5 ? $order['end_date'] : null, 'completed' => $statusIndex >= 5 || $isLate],
        ['event' => 'Returned', 'date' => $statusIndex >= 6 ? $order['end_date'] : null, 'completed' => $statusIndex >= 6],
        ['event' => 'Completed', 'date' => $statusIndex >= 7 ? $order['end_date'] : null, 'completed' => $statusIndex >= 7]
    ];

    // Mark Late as current step if applicable
    if ($isLate) {
        $timelineEvents[4]['current'] = true;
    } else {
        // Mark current step (first non-completed after a completed one)
        for ($i = 0; $i < count($timelineEvents); $i++) {
            if (!$timelineEvents[$i]['completed']) {
                $timelineEvents[$i]['current'] = true;
                break;
            }
        }
    }
}

// Build response
$response = [
    'success' => true,
    'data' => [
        'id' => 'ORD-' . str_pad($order['order_id'], 4, '0', STR_PAD_LEFT),
        'order_id' => $order['order_id'],
        'status' => isset($statusMap[$currentStatus]) ? $statusMap[$currentStatus] : 'pending',
        'status_raw' => $currentStatus,
        'customer' => [
            'id' => $order['user_id'],
            'name' => $order['customer_name'] ?? 'Unknown',
            'email' => $order['customer_email'] ?? '',
            'phone' => $order['customer_phone'] ?? '',
            'avatar' => null,
            'address' => $deliveryAddress,
            'membership' => $order['membership_level'] ?? 'Bronze'
        ],
        'items' => $items,
        'dates' => [
            'ordered' => $order['start_date'] . 'T10:00:00Z',
            'start' => $order['start_date'],
            'end' => $order['end_date'],
            'duration' => $duration
        ],
        'delivery' => [
            'method' => $deliveryMethod,
            'address' => $deliveryAddress,
            'scheduledDate' => $order['start_date'],
            'status' => $order['rental_status']
        ],
        'payment' => [
            'subtotal' => $subtotal,
            'tax' => $tax,
            'deliveryFee' => $deliveryFee,
            'deposit' => $totalDeposit,
            'discount' => 0,
            'lateFee' => $lateFee,
            'total' => $subtotal + $lateFee,
            'status' => 'paid',
            'method' => 'Cash'
        ],
        'timeline' => $timelineEvents,
        'notes' => [
            [
                'author' => 'System',
                'date' => $order['start_date'] . 'T10:00:00Z',
                'text' => 'Order created.'
            ]
        ]
    ]
];

echo json_encode($response);
?>
