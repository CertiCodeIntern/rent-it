<?php
/**
 * Get Dashboard Data API
 * Fetches KPI, inventory, and schedule data for the admin dashboard
 */
require_once __DIR__ . '/../../config.php';

header('Content-Type: application/json');

// Admin auth check
if (!isset($_SESSION['admin_logged_in']) || $_SESSION['admin_logged_in'] !== true) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

try {
    // 1. KPI Data
    
    // Total Revenue (this month)
    $currentMonth = date('Y-m');
    $revenueQuery = "SELECT COALESCE(SUM(total_price), 0) as total_revenue FROM rental WHERE DATE_FORMAT(start_date, '%Y-%m') = '$currentMonth'";
    $revenueResult = mysqli_query($conn, $revenueQuery);
    $totalRevenue = mysqli_fetch_assoc($revenueResult)['total_revenue'];

    // Last month revenue for comparison
    $lastMonth = date('Y-m', strtotime('-1 month'));
    $lastRevenueQuery = "SELECT COALESCE(SUM(total_price), 0) as total_revenue FROM rental WHERE DATE_FORMAT(start_date, '%Y-%m') = '$lastMonth'";
    $lastRevenueResult = mysqli_query($conn, $lastRevenueQuery);
    $lastMonthRevenue = mysqli_fetch_assoc($lastRevenueResult)['total_revenue'];
    $revenueChange = $lastMonthRevenue > 0 ? round((($totalRevenue - $lastMonthRevenue) / $lastMonthRevenue) * 100, 1) : 0;

    // Active Rentals
    $activeRentalsQuery = "SELECT COUNT(*) as count FROM rental WHERE rental_status IN ('Active', 'In Transit', 'Booked')";
    $activeRentalsResult = mysqli_query($conn, $activeRentalsQuery);
    $activeRentals = mysqli_fetch_assoc($activeRentalsResult)['count'];

    // Pending Deliveries (rentals starting within next 2 days)
    $pendingDeliveriesQuery = "SELECT COUNT(*) as count FROM rental WHERE rental_status = 'Pending' OR (rental_status = 'Booked' AND start_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 2 DAY))";
    $pendingDeliveriesResult = mysqli_query($conn, $pendingDeliveriesQuery);
    $pendingDeliveries = mysqli_fetch_assoc($pendingDeliveriesResult)['count'];

    // Machines Available
    $availableQuery = "SELECT COUNT(*) as count FROM item WHERE status = 'Available'";
    $availableResult = mysqli_query($conn, $availableQuery);
    $machinesAvailable = mysqli_fetch_assoc($availableResult)['count'];

    // 2. Inventory Stats
    
    // Total items
    $totalItemsQuery = "SELECT COUNT(*) as count FROM item";
    $totalItemsResult = mysqli_query($conn, $totalItemsQuery);
    $totalItems = mysqli_fetch_assoc($totalItemsResult)['count'];

    // Items rented
    $rentedQuery = "SELECT COUNT(*) as count FROM item WHERE status = 'Booked' OR status = 'Rented'";
    $rentedResult = mysqli_query($conn, $rentedQuery);
    $itemsRented = mysqli_fetch_assoc($rentedResult)['count'];

    // Items in repair
    $repairQuery = "SELECT COUNT(*) as count FROM item WHERE status = 'Under Repair' OR status = 'Maintenance'";
    $repairResult = mysqli_query($conn, $repairQuery);
    $itemsRepair = mysqli_fetch_assoc($repairResult)['count'];

    // Items in cleaning
    $cleaningQuery = "SELECT COUNT(*) as count FROM item WHERE status = 'Cleaning'";
    $cleaningResult = mysqli_query($conn, $cleaningQuery);
    $itemsCleaning = mysqli_fetch_assoc($cleaningResult)['count'];

    // 3. Recent Bookings (last 5)
    $recentBookingsQuery = "SELECT r.order_id, r.rental_status, r.start_date, r.end_date, r.venue, r.customer_address,
                            u.full_name as customer_name, u.email as customer_email,
                            GROUP_CONCAT(i.item_name SEPARATOR ', ') as items
                            FROM rental r
                            LEFT JOIN users u ON r.user_id = u.id
                            LEFT JOIN rental_item ri ON r.order_id = ri.order_id
                            LEFT JOIN item i ON ri.item_id = i.item_id
                            GROUP BY r.order_id
                            ORDER BY r.start_date DESC
                            LIMIT 5";
    $recentBookingsResult = mysqli_query($conn, $recentBookingsQuery);
    $recentBookings = [];
    while ($row = mysqli_fetch_assoc($recentBookingsResult)) {
        $recentBookings[] = $row;
    }

    // 4. Today's Schedule
    $today = date('Y-m-d');
    $scheduleQuery = "SELECT r.order_id, r.rental_status, r.start_date, r.end_date, r.venue, r.customer_address,
                      u.full_name as customer_name,
                      GROUP_CONCAT(i.item_name SEPARATOR ', ') as items,
                      r.customer_address as delivery_address
                      FROM rental r
                      LEFT JOIN users u ON r.user_id = u.id
                      LEFT JOIN rental_item ri ON r.order_id = ri.order_id
                      LEFT JOIN item i ON ri.item_id = i.item_id
                      WHERE r.start_date = '$today' OR r.end_date = '$today'
                      GROUP BY r.order_id
                      ORDER BY r.start_date ASC
                      LIMIT 4";
    $scheduleResult = mysqli_query($conn, $scheduleQuery);
    $todaySchedule = [];
    if ($scheduleResult) {
        while ($row = mysqli_fetch_assoc($scheduleResult)) {
            $todaySchedule[] = $row;
        }
    }

    // Construct Response
    $response = [
        'success' => true,
        'kpi' => [
            'totalRevenue' => $totalRevenue,
            'revenueChange' => $revenueChange,
            'activeRentals' => $activeRentals,
            'pendingDeliveries' => $pendingDeliveries,
            'machinesAvailable' => $machinesAvailable
        ],
        'inventory' => [
            'totalItems' => $totalItems,
            'itemsRented' => $itemsRented,
            'itemsRepair' => $itemsRepair,
            'itemsCleaning' => $itemsCleaning
        ],
        'recentBookings' => $recentBookings,
        'todaySchedule' => $todaySchedule,
        'today' => $today
    ];

    echo json_encode($response);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>
