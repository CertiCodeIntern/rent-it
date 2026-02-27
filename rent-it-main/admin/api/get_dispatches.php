<?php
/**
 * Get Dispatches API
 * Returns dispatch data from rentals for the admin dispatch page
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

require_once __DIR__ . '/../../config.php';

try {
    // Get filter parameter
    $dateRange = isset($_GET['range']) ? $_GET['range'] : 'week';
    
    // Build date filter based on range
    $today = date('Y-m-d');
    $dateCondition = '';
    
    switch ($dateRange) {
        case 'today':
            $dateCondition = "AND (r.start_date = '$today' OR r.end_date = '$today' OR r.rental_status IN ('Late', 'Cancelled'))";
            break;
        case 'tomorrow':
            $tomorrow = date('Y-m-d', strtotime('+1 day'));
            $dateCondition = "AND (r.start_date = '$tomorrow' OR r.end_date = '$tomorrow' OR r.rental_status IN ('Late', 'Cancelled'))";
            break;
        case 'week':
            $weekEnd = date('Y-m-d', strtotime('+7 days'));
            $dateCondition = "AND (r.start_date BETWEEN '$today' AND '$weekEnd' OR r.end_date BETWEEN '$today' AND '$weekEnd' OR r.rental_status IN ('Late', 'Cancelled'))";
            break;
        case 'all':
        default:
            $dateCondition = '';
            break;
    }
    
    // Query dispatch-style data from rentals + rental_item + item
    $query = "
        SELECT 
            r.order_id,
            r.rental_status,
            r.total_price,
            r.venue,
            r.customer_address,
            r.start_date,
            r.end_date,
            u.id as user_id,
            u.full_name as customer_name,
            u.email as customer_email,
            u.phone as customer_phone,
            u.address as user_address,
            GROUP_CONCAT(DISTINCT i.item_name SEPARATOR ', ') AS item_names
        FROM rental r
        LEFT JOIN users u ON r.user_id = u.id
        LEFT JOIN rental_item ri ON r.order_id = ri.order_id
        LEFT JOIN item i ON ri.item_id = i.item_id
        WHERE r.rental_status IS NOT NULL
        AND r.user_id IS NOT NULL
        $dateCondition
        GROUP BY r.order_id
        ORDER BY r.start_date ASC, r.end_date ASC
    ";
    
    $result = mysqli_query($conn, $query);
    
    if (!$result) {
        throw new Exception('Database query failed: ' . mysqli_error($conn));
    }
    
    $dispatches = [];
    
    while ($row = mysqli_fetch_assoc($result)) {
        $orderId = (int)$row['order_id'];

        // Derive type from rental status/dates
        if (in_array($row['rental_status'], ['Pending Return', 'Returned'])) {
            $type = 'returning';
        } else if ($row['rental_status'] === 'Active') {
            $type = 'pickup';
        } else {
            $type = 'delivery';
        }
        $scheduledDate = $type === 'pickup' ? ($row['end_date'] ?? $row['start_date']) : $row['start_date'];

        // Map database status to frontend status key
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
        $status = $statusMap[$row['rental_status']] ?? 'pending';

        // Determine address
        $address = $row['customer_address'] ?? $row['user_address'] ?? $row['venue'] ?? 'No address specified';

        // Items from group_concat
        $items = [];
        if (!empty($row['item_names'])) {
            $items = array_map('trim', explode(',', $row['item_names']));
        }
        
        $dispatches[$orderId] = [
            'id' => 'DSP-' . str_pad($orderId, 3, '0', STR_PAD_LEFT),
            'orderId' => $orderId,
            'type' => $type,
            'status' => $status,
            'scheduledTime' => '9:00 AM - 5:00 PM', // Default time slot
            'scheduledDate' => $scheduledDate,
            'customer' => [
                'name' => $row['customer_name'] ?? 'Unknown Customer',
                'phone' => $row['customer_phone'] ?? 'N/A',
                'email' => $row['customer_email'] ?? '',
                'avatar' => null
            ],
            'address' => $address,
            'items' => $items,
            'totalPrice' => (float)$row['total_price'],
            'rentalStatus' => $row['rental_status']
        ];
    }
    
    // Add placeholder items if none found
    foreach ($dispatches as &$dispatch) {
        if (empty($dispatch['items'])) {
            $dispatch['items'][] = 'Rental Items';
        }
    }
    unset($dispatch); // Break the reference to prevent data corruption
    
    // Calculate stats
    $stats = [
        'deliveries' => 0,
        'pickups' => 0,
        'returning' => 0,
        'pending' => 0,
        'completed' => 0
    ];
    
    foreach ($dispatches as $dispatch) {
        if ($dispatch['type'] === 'delivery' && $dispatch['status'] !== 'completed') {
            $stats['deliveries']++;
        }
        if ($dispatch['type'] === 'pickup' && $dispatch['status'] !== 'completed') {
            $stats['pickups']++;
        }
        if ($dispatch['type'] === 'returning' && $dispatch['status'] !== 'completed') {
            $stats['returning']++;
        }
        if ($dispatch['status'] === 'pending') {
            $stats['pending']++;
        }
        if ($dispatch['status'] === 'completed') {
            $stats['completed']++;
        }
    }
    
    echo json_encode([
        'success' => true,
        'dispatches' => array_values($dispatches),
        'stats' => $stats,
        'count' => count($dispatches)
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}

mysqli_close($conn);
