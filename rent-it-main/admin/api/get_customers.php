<?php
/**
 * Get Customers API
 * Fetches all customers from the database with their rental statistics
 */
require_once __DIR__ . '/../../config.php';

header('Content-Type: application/json');

// Fetch all customers (role = 'customer')
$customersQuery = "SELECT 
    u.id,
    u.full_name,
    u.email,
    u.phone,
    u.address,
    u.membership_level,
    u.created_at,
    u.updated_at
FROM users u
WHERE u.role = 'customer'
ORDER BY u.created_at DESC";

$result = mysqli_query($conn, $customersQuery);

if (!$result) {
    echo json_encode(['success' => false, 'message' => 'Database error: ' . mysqli_error($conn)]);
    exit;
}

$customers = [];
$totalActiveBookings = 0;
$totalOverdue = 0;
$totalCustomers = 0;
$monthlyRevenue = 0;

// Get current date for overdue calculation
$today = date('Y-m-d');
$monthStart = date('Y-m-01');
$monthEnd = date('Y-m-t');

while ($customer = mysqli_fetch_assoc($result)) {
    $totalCustomers++;
    
    // Fetch ALL rentals for this customer with items
    $rentalQuery = "SELECT 
        r.order_id, 
        r.rental_status, 
        r.total_price, 
        r.late_fee,
        r.start_date, 
        r.end_date,
        r.venue,
        r.customer_address,
        GROUP_CONCAT(i.item_name SEPARATOR ', ') as item_names,
        COUNT(ri.rental_item_id) as item_count
    FROM rental r
    LEFT JOIN rental_item ri ON r.order_id = ri.order_id
    LEFT JOIN item i ON ri.item_id = i.item_id
    WHERE r.user_id = ?
    GROUP BY r.order_id
    ORDER BY r.start_date DESC";
    
    $stmt = mysqli_prepare($conn, $rentalQuery);
    mysqli_stmt_bind_param($stmt, "i", $customer['id']);
    mysqli_stmt_execute($stmt);
    $rentalResult = mysqli_stmt_get_result($stmt);
    
    $allRentals = [];
    while ($rental = mysqli_fetch_assoc($rentalResult)) {
        $allRentals[] = $rental;
    }
    $latestRental = !empty($allRentals) ? $allRentals[0] : null;
    mysqli_stmt_close($stmt);

    // Get all rentals count for stats
    $statsQuery = "SELECT 
        COUNT(*) as total_rentals,
        SUM(CASE WHEN rental_status IN ('Active', 'Booked', 'Confirmed', 'In Transit', 'Returned', 'Completed', 'Pending Return') THEN total_price ELSE 0 END) as total_spent,
        SUM(CASE WHEN rental_status IN ('Active', 'Pending', 'Booked', 'Confirmed') THEN 1 ELSE 0 END) as active_count,
        SUM(CASE WHEN rental_status = 'Pending Return' AND end_date < ? THEN 1 ELSE 0 END) as overdue_count
    FROM rental
    WHERE user_id = ?";
    
    $stmtStats = mysqli_prepare($conn, $statsQuery);
    mysqli_stmt_bind_param($stmtStats, "si", $today, $customer['id']);
    mysqli_stmt_execute($stmtStats);
    $statsResult = mysqli_stmt_get_result($stmtStats);
    $stats = mysqli_fetch_assoc($statsResult);
    mysqli_stmt_close($stmtStats);

    // Calculate monthly revenue for this customer
    $revenueQuery = "SELECT SUM(total_price) as monthly_total
    FROM rental
    WHERE user_id = ? AND start_date >= ? AND start_date <= ?
    AND rental_status IN ('Active', 'Booked', 'Confirmed', 'In Transit', 'Returned', 'Completed', 'Pending Return')";
    
    $stmtRevenue = mysqli_prepare($conn, $revenueQuery);
    mysqli_stmt_bind_param($stmtRevenue, "iss", $customer['id'], $monthStart, $monthEnd);
    mysqli_stmt_execute($stmtRevenue);
    $revenueResult = mysqli_stmt_get_result($stmtRevenue);
    $revenue = mysqli_fetch_assoc($revenueResult);
    mysqli_stmt_close($stmtRevenue);
    
    $monthlyRevenue += floatval($revenue['monthly_total'] ?? 0);

    // Track totals
    $totalActiveBookings += intval($stats['active_count'] ?? 0);
    $totalOverdue += intval($stats['overdue_count'] ?? 0);

    // Determine status based on latest rental
    $bookingStatus = 'inactive';
    $paymentStatus = 'none';
    
    if ($latestRental) {
        $rentalStatus = $latestRental['rental_status'] ?? '';
        
        // Map rental status to booking status
        if (in_array($rentalStatus, ['Active', 'Booked', 'Confirmed', 'In Transit'])) {
            $bookingStatus = 'active';
            $paymentStatus = 'paid';
        } elseif ($rentalStatus === 'Pending') {
            $bookingStatus = 'pending';
            $paymentStatus = 'pending';
        } elseif ($rentalStatus === 'Pending Return') {
            if ($latestRental['end_date'] < $today) {
                $bookingStatus = 'overdue';
                $paymentStatus = 'overdue';
            } else {
                $bookingStatus = 'active';
                $paymentStatus = 'paid';
            }
        } elseif (in_array($rentalStatus, ['Returned', 'Completed'])) {
            $bookingStatus = 'completed';
            $paymentStatus = 'paid';
        }
    }

    // Build items array for display (from latest rental)
    $itemNames = [];
    if ($latestRental && $latestRental['item_names']) {
        $itemNames = array_map('trim', explode(',', $latestRental['item_names']));
    }

    // Calculate duration (from latest rental)
    $duration = 0;
    if ($latestRental && $latestRental['start_date'] && $latestRental['end_date']) {
        $start = new DateTime($latestRental['start_date']);
        $end = new DateTime($latestRental['end_date']);
        $duration = $start->diff($end)->days + 1;
    }

    // Build ALL bookings array
    $bookingsArray = [];
    foreach ($allRentals as $rentalRow) {
        // Determine status for each rental
        $rStatus = $rentalRow['rental_status'] ?? '';
        $bStatus = 'inactive';
        $pStatus = 'none';

        if (in_array($rStatus, ['Active', 'Booked', 'Confirmed', 'In Transit'])) {
            $bStatus = 'active';
            $pStatus = 'paid';
        } elseif ($rStatus === 'Pending') {
            $bStatus = 'pending';
            $pStatus = 'pending';
        } elseif ($rStatus === 'Pending Return') {
            if ($rentalRow['end_date'] < $today) {
                $bStatus = 'overdue';
                $pStatus = 'overdue';
            } else {
                $bStatus = 'active';
                $pStatus = 'paid';
            }
        } elseif (in_array($rStatus, ['Returned', 'Completed'])) {
            $bStatus = 'completed';
            $pStatus = 'paid';
        }

        // Items for this rental
        $rItemNames = [];
        if ($rentalRow['item_names']) {
            $rItemNames = array_map('trim', explode(',', $rentalRow['item_names']));
        }

        // Duration for this rental
        $rDuration = 0;
        if ($rentalRow['start_date'] && $rentalRow['end_date']) {
            $rStart = new DateTime($rentalRow['start_date']);
            $rEnd = new DateTime($rentalRow['end_date']);
            $rDuration = $rStart->diff($rEnd)->days + 1;
        }

        $bookingsArray[] = [
            'id' => 'BK-' . str_pad($rentalRow['order_id'], 5, '0', STR_PAD_LEFT),
            'order_id' => intval($rentalRow['order_id']),
            'items' => $rItemNames,
            'totalItems' => intval($rentalRow['item_count'] ?? 0),
            'startDate' => $rentalRow['start_date'],
            'endDate' => $rentalRow['end_date'],
            'duration' => $rDuration,
            'status' => $bStatus,
            'payment' => $pStatus,
            'total' => floatval($rentalRow['total_price'] ?? 0)
        ];
    }

    $customers[] = [
        'id' => 'USR-' . str_pad($customer['id'], 5, '0', STR_PAD_LEFT),
        'user_id' => intval($customer['id']),
        'name' => $customer['full_name'] ?? 'Unknown',
        'email' => $customer['email'] ?? '',
        'phone' => $customer['phone'] ?? '',
        'address' => $customer['address'] ?? '',
        'membership' => $customer['membership_level'] ?? 'Bronze',
        'avatar' => null,
        'stats' => [
            'totalRentals' => intval($stats['total_rentals'] ?? 0),
            'totalSpent' => floatval($stats['total_spent'] ?? 0),
            'activeCount' => intval($stats['active_count'] ?? 0),
            'overdueCount' => intval($stats['overdue_count'] ?? 0)
        ],
        'booking' => $latestRental ? [
            'id' => 'BK-' . str_pad($latestRental['order_id'], 5, '0', STR_PAD_LEFT),
            'order_id' => intval($latestRental['order_id']),
            'items' => $itemNames,
            'totalItems' => intval($latestRental['item_count'] ?? 0),
            'startDate' => $latestRental['start_date'],
            'endDate' => $latestRental['end_date'],
            'duration' => $duration,
            'status' => $bookingStatus,
            'payment' => $paymentStatus,
            'total' => floatval($latestRental['total_price'] ?? 0)
        ] : null,
        'bookings' => $bookingsArray,
        'createdAt' => $customer['created_at'],
        'updatedAt' => $customer['updated_at']
    ];
}

// Return response
echo json_encode([
    'success' => true,
    'customers' => $customers,
    'stats' => [
        'totalCustomers' => $totalCustomers,
        'activeBookings' => $totalActiveBookings,
        'overdueReturns' => $totalOverdue,
        'monthlyRevenue' => $monthlyRevenue
    ]
]);
