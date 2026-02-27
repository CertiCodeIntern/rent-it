<?php
require_once __DIR__ . '/../../config.php';

// Admin auth check - redirect to login if not authenticated
if (!isset($_SESSION['admin_logged_in']) || $_SESSION['admin_logged_in'] !== true) {
    header('Location: /rent-it/admin/auth/login.php');
    exit();
}

// Fetch KPI Data
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

// Total items for inventory
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

// Recent Bookings (last 5)
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

// Today's Schedule
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
if ($scheduleResult === false) {
    error_log('Dashboard schedule query failed: ' . mysqli_error($conn));
} else {
    while ($row = mysqli_fetch_assoc($scheduleResult)) {
        $todaySchedule[] = $row;
    }
}

// Helper function to get status badge class
function getStatusBadgeClass($status) {
    $status = strtolower($status);
    switch ($status) {
        case 'active':
        case 'confirmed':
        case 'completed':
        case 'returned':
            return 'status-success';
        case 'booked':
            return 'status-booked';
        case 'in transit':
            return 'status-transit';
        case 'pending':
        case 'pending return':
            return 'status-pending';
        case 'cancelled':
            return 'status-danger';
        default:
            return 'status-info';
    }
}

// Helper function to format currency
function formatCurrency($amount) {
    return '₱' . number_format($amount, 0);
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <base href="/rent-it/">
    <script src="admin/shared/js/admin-theme.js"></script>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="RentIt Admin Dashboard - Manage your videoke rental business">
    <title>Dashboard - RentIt Admin</title>
    
    <!-- Favicon -->
    <link rel="icon" type="image/png" href="assets/images/rIT_logo_tp.png">
    <link rel="apple-touch-icon" href="assets/images/rIT_logo_tp.png">
    
    <!-- Google Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    
    <!-- Admin Stylesheets -->
    <link rel="stylesheet" href="admin/shared/css/admin-theme.css">
    <link rel="stylesheet" href="admin/shared/css/admin-globals.css">
    <link rel="stylesheet" href="admin/shared/css/admin-components.css">
    <link rel="stylesheet" href="admin/dashboard/css/dashboard-new.css">

    <!-- jsPDF for PDF export -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.2/jspdf.plugin.autotable.min.js"></script>
</head>
<body>
    <div class="admin-skeleton-overlay" aria-hidden="true">
        <div class="admin-skeleton-shell">
            <aside class="admin-skeleton-sidebar">
                <div class="admin-skeleton-logo"></div>
                <div class="admin-skeleton-nav">
                    <span class="admin-skeleton-pill w-70"></span>
                    <span class="admin-skeleton-pill w-60"></span>
                    <span class="admin-skeleton-pill w-80"></span>
                    <span class="admin-skeleton-pill w-50"></span>
                    <span class="admin-skeleton-pill w-70"></span>
                </div>
                <div class="admin-skeleton-user">
                    <span class="admin-skeleton-circle"></span>
                    <span class="admin-skeleton-line w-60" style="height: 12px;"></span>
                </div>
            </aside>
            <section class="admin-skeleton-main">
                <div class="admin-skeleton-topbar">
                    <span class="admin-skeleton-line w-40" style="height: 14px;"></span>
                    <span class="admin-skeleton-circle"></span>
                </div>
                <div class="admin-skeleton-card">
                    <div class="admin-skeleton-row admin-skeleton-kpis">
                        <span class="admin-skeleton-block w-60" style="height: 14px;"></span>
                        <span class="admin-skeleton-block w-50" style="height: 14px;"></span>
                        <span class="admin-skeleton-block w-70" style="height: 14px;"></span>
                        <span class="admin-skeleton-block w-40" style="height: 14px;"></span>
                    </div>
                </div>
                <div class="admin-skeleton-card">
                    <div class="admin-skeleton-row" style="grid-template-columns: 1fr auto;">
                        <span class="admin-skeleton-line w-40" style="height: 14px;"></span>
                        <span class="admin-skeleton-pill w-20"></span>
                    </div>
                    <div class="admin-skeleton-table">
                        <div class="admin-skeleton-row">
                            <span class="admin-skeleton-block w-50" style="height: 12px;"></span>
                            <span class="admin-skeleton-block w-30" style="height: 12px;"></span>
                            <span class="admin-skeleton-block w-20" style="height: 12px;"></span>
                            <span class="admin-skeleton-block w-40" style="height: 12px;"></span>
                        </div>
                        <div class="admin-skeleton-row">
                            <span class="admin-skeleton-block w-60" style="height: 12px;"></span>
                            <span class="admin-skeleton-block w-25" style="height: 12px;"></span>
                            <span class="admin-skeleton-block w-30" style="height: 12px;"></span>
                            <span class="admin-skeleton-block w-20" style="height: 12px;"></span>
                        </div>
                        <div class="admin-skeleton-row">
                            <span class="admin-skeleton-block w-40" style="height: 12px;"></span>
                            <span class="admin-skeleton-block w-35" style="height: 12px;"></span>
                            <span class="admin-skeleton-block w-25" style="height: 12px;"></span>
                            <span class="admin-skeleton-block w-30" style="height: 12px;"></span>
                        </div>
                    </div>
                </div>
                <div class="admin-skeleton-loader">
                    <span class="admin-skeleton-spinner" aria-hidden="true"></span>
                    <span>Loading admin content...</span>
                </div>
            </section>
        </div>
    </div>
    <div class="admin-wrapper">
        <!-- Sidebar Container -->
        <div id="sidebarContainer"></div>
        
        <!-- Main Content -->
        <main class="admin-main">
            <!-- Header Container -->
            <div id="headerContainer"></div>
            
            <!-- Content Area -->
            <div class="admin-content">
                <!-- Page Header -->
                <div class="admin-page-header">
                    <div>
                        <h1 class="admin-page-title">Dashboard</h1>
                        <p class="admin-page-subtitle">Welcome back! Here's an overview of your rental business.</p>
                    </div>
                    <div class="admin-page-actions">
                        <button class="btn btn-secondary" title="Export dashboard data as PDF" onclick="exportDashboardPDF()">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                                <polyline points="7 10 12 15 17 10"/>
                                <line x1="12" y1="15" x2="12" y2="3"/>
                            </svg>
                            Export Report
                        </button>
                        <a href="admin/calendar/calendar.php" class="btn btn-primary" title="View booking calendar">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                                <line x1="16" y1="2" x2="16" y2="6"/>
                                <line x1="8" y1="2" x2="8" y2="6"/>
                                <line x1="3" y1="10" x2="21" y2="10"/>
                            </svg>
                            View Calendar
                        </a>
                    </div>
                </div>

                <!-- KPI Cards -->
                <section class="kpi-grid" title="Key Performance Indicators">
                    <div class="kpi-card animate-fadeInUp stagger-1">
                        <div class="kpi-icon accent" title="Total revenue this month">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <text x="12" y="17" text-anchor="middle" font-size="16" font-weight="bold" fill="currentColor" stroke="none">₱</text>
                            </svg>
                        </div>
                        <div class="kpi-content">
                            <div class="kpi-label">Total Revenue</div>
                            <div class="kpi-value"><?php echo formatCurrency($totalRevenue); ?></div>
                            <span class="kpi-change <?php echo $revenueChange >= 0 ? 'positive' : 'negative'; ?>" title="<?php echo ($revenueChange >= 0 ? '+' : '') . $revenueChange; ?>% compared to last month">
                                <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2">
                                    <polyline points="<?php echo $revenueChange >= 0 ? '23 6 13.5 15.5 8.5 10.5 1 18' : '23 18 13.5 8.5 8.5 13.5 1 6'; ?>"/>
                                </svg>
                                <?php echo ($revenueChange >= 0 ? '+' : '') . $revenueChange; ?>%
                            </span>
                        </div>
                    </div>

                    <div class="kpi-card animate-fadeInUp stagger-2">
                        <div class="kpi-icon info" title="Currently active rentals">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                                <line x1="16" y1="2" x2="16" y2="6"/>
                                <line x1="8" y1="2" x2="8" y2="6"/>
                                <line x1="3" y1="10" x2="21" y2="10"/>
                            </svg>
                        </div>
                        <div class="kpi-content">
                            <div class="kpi-label">Active Rentals</div>
                            <div class="kpi-value"><?php echo $activeRentals; ?></div>
                            <span class="kpi-change positive" title="Currently active">
                                <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor">
                                    <circle cx="12" cy="12" r="4"/>
                                </svg>
                                In progress
                            </span>
                        </div>
                    </div>

                    <div class="kpi-card animate-fadeInUp stagger-3">
                        <div class="kpi-icon warning" title="Pending deliveries scheduled">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <rect x="1" y="3" width="15" height="13"/>
                                <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
                                <circle cx="5.5" cy="18.5" r="2.5"/>
                                <circle cx="18.5" cy="18.5" r="2.5"/>
                            </svg>
                        </div>
                        <div class="kpi-content">
                            <div class="kpi-label">Pending Deliveries</div>
                            <div class="kpi-value"><?php echo $pendingDeliveries; ?></div>
                            <span class="kpi-change neutral" title="Deliveries scheduled for next 2 days">
                                Next 2 days
                            </span>
                        </div>
                    </div>

                    <div class="kpi-card animate-fadeInUp stagger-4">
                        <div class="kpi-icon success" title="Machines ready for rental">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                                <polyline points="22 4 12 14.01 9 11.01"/>
                            </svg>
                        </div>
                        <div class="kpi-content">
                            <div class="kpi-label">Machines Available</div>
                            <div class="kpi-value"><?php echo $machinesAvailable; ?></div>
                            <span class="kpi-change positive" title="All units ready to rent">
                                <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor">
                                    <circle cx="12" cy="12" r="4"/>
                                </svg>
                                Ready to rent
                            </span>
                        </div>
                    </div>
                </section>

                <!-- Main Grid -->
                <div class="dashboard-grid">
                    <!-- Recent Bookings -->
                    <section class="admin-card bookings-section animate-fadeInUp">
                        <div class="admin-card-header">
                            <h2 class="admin-card-title">Recent Bookings</h2>
                            <a href="admin/orders/orders.php" class="btn btn-ghost btn-sm" title="View all orders">
                                View All
                                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                                    <polyline points="9 18 15 12 9 6"/>
                                </svg>
                            </a>
                        </div>
                        <div class="admin-card-body" style="padding: 0;">
                            <div class="admin-table-wrapper" style="border: none; border-radius: 0;">
                                <table class="admin-table">
                                    <thead>
                                        <tr>
                                            <th title="Customer who made the booking">Customer</th>
                                            <th title="Equipment model rented">Machine</th>
                                            <th title="Rental period">Duration</th>
                                            <th title="Current booking status">Status</th>
                                            <th title="Available actions">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <?php if (count($recentBookings) > 0): ?>
                                            <?php foreach ($recentBookings as $booking): ?>
                                                <?php 
                                                    $startDate = new DateTime($booking['start_date']);
                                                    $endDate = new DateTime($booking['end_date']);
                                                    $duration = $startDate->diff($endDate)->days + 1;
                                                    $customerInitial = strtoupper(substr($booking['customer_name'] ?? 'U', 0, 1));
                                                    $customerName = $booking['customer_name'] ?? 'Unknown Customer';
                                                    $items = $booking['items'] ?? 'No items';
                                                    $statusClass = getStatusBadgeClass($booking['rental_status']);
                                                ?>
                                                <tr>
                                                    <td>
                                                        <div class="customer-cell">
                                                            <div class="customer-avatar"><?php echo $customerInitial; ?></div>
                                                            <span><?php echo htmlspecialchars($customerName); ?></span>
                                                        </div>
                                                    </td>
                                                    <td><?php echo htmlspecialchars($items); ?></td>
                                                    <td title="<?php echo $startDate->format('M j') . ' - ' . $endDate->format('M j, Y'); ?>">
                                                        <?php echo $startDate->format('M j') . '-' . $endDate->format('j'); ?> (<?php echo $duration; ?> day<?php echo $duration > 1 ? 's' : ''; ?>)
                                                    </td>
                                                    <td><span class="status-badge <?php echo $statusClass; ?>"><?php echo htmlspecialchars($booking['rental_status']); ?></span></td>
                                                    <td>
                                                        <div class="table-action-btns">
                                                            <button class="btn-icon" title="View booking details" onclick="viewBooking(<?php echo $booking['order_id']; ?>)">
                                                                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                                                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                                                                    <circle cx="12" cy="12" r="3"/>
                                                                </svg>
                                                            </button>
                                                            <button class="btn-icon" title="Edit booking" onclick="editBooking(<?php echo $booking['order_id']; ?>)">
                                                                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                                                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                                                                </svg>
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            <?php endforeach; ?>
                                        <?php else: ?>
                                            <tr>
                                                <td colspan="5" style="text-align: center; padding: 2rem;">
                                                    <p style="color: var(--admin-text-muted);">No recent bookings found</p>
                                                </td>
                                            </tr>
                                        <?php endif; ?>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </section>

                    <!-- Right Column -->
                    <div class="dashboard-sidebar">
                        <!-- Delivery Schedule -->
                        <section class="admin-card schedule-card animate-fadeInUp">
                            <div class="admin-card-header">
                                <h2 class="admin-card-title">Today's Schedule</h2>
                                <span class="status-badge status-info" title="Current date"><?php echo date('M j'); ?></span>
                            </div>
                            <div class="admin-card-body">
                                <div class="schedule-timeline">
                                    <?php if (count($todaySchedule) > 0): ?>
                                        <?php 
                                        $times = ['09:00 AM', '11:30 AM', '02:00 PM', '04:30 PM'];
                                        $i = 0;
                                        foreach ($todaySchedule as $schedule): 
                                            $isDropoff = $schedule['start_date'] === $today;
                                            $isPickup = $schedule['end_date'] === $today;
                                            $type = $isDropoff ? 'Drop-off' : 'Pick-up';
                                            $timeClass = '';
                                            $statusClass = '';
                                            
                                            if ($schedule['rental_status'] === 'Active' || $schedule['rental_status'] === 'Completed') {
                                                $timeClass = 'success';
                                                $statusClass = 'success';
                                            } elseif ($schedule['rental_status'] === 'Pending' || $schedule['rental_status'] === 'Pending Return') {
                                                $timeClass = 'warning';
                                                $statusClass = 'warning';
                                            } else {
                                                $statusClass = 'pending';
                                            }
                                            
                                            $address = $schedule['delivery_address'] ?? $schedule['customer_address'] ?? $schedule['venue'] ?? 'Address not set';
                                        ?>
                                        <div class="timeline-item" title="<?php echo $type; ?> for <?php echo htmlspecialchars($schedule['customer_name']); ?>">
                                            <div class="timeline-time <?php echo $timeClass; ?>"><?php echo $times[$i % 4]; ?></div>
                                            <div class="timeline-content">
                                                <div class="timeline-title"><?php echo $type; ?>: <?php echo htmlspecialchars($schedule['customer_name'] ?? 'Unknown'); ?></div>
                                                <div class="timeline-subtitle"><?php echo htmlspecialchars($schedule['items'] ?? 'No items'); ?> • <?php echo htmlspecialchars($address); ?></div>
                                            </div>
                                            <span class="timeline-status <?php echo $statusClass; ?>"></span>
                                        </div>
                                        <?php $i++; endforeach; ?>
                                    <?php else: ?>
                                        <div class="timeline-item">
                                            <div class="timeline-content" style="text-align: center; padding: 1rem;">
                                                <div class="timeline-subtitle">No scheduled deliveries or pickups for today</div>
                                            </div>
                                        </div>
                                    <?php endif; ?>
                                </div>
                                <a href="admin/dispatch/dispatch.php" class="btn btn-secondary btn-sm" style="width: 100%; margin-top: var(--admin-spacing-lg);" title="View full dispatch schedule">
                                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                                        <circle cx="12" cy="10" r="3"/>
                                        <path d="M12 21.7C17.3 17 20 13 20 10a8 8 0 1 0-16 0c0 3 2.7 6.9 8 11.7z"/>
                                    </svg>
                                    View Dispatch Page
                                </a>
                            </div>
                        </section>

                        <!-- Inventory Health -->
                        <section class="admin-card inventory-card animate-fadeInUp">
                            <div class="admin-card-header">
                                <h2 class="admin-card-title">Inventory Health</h2>
                                <a href="admin/repairs/repairs.php" class="btn btn-ghost btn-sm" title="Manage inventory and repairs">
                                    Manage
                                </a>
                            </div>
                            <div class="admin-card-body">
                                <?php 
                                $rentedPercent = $totalItems > 0 ? round(($itemsRented / $totalItems) * 100) : 0;
                                $repairPercent = $totalItems > 0 ? round(($itemsRepair / $totalItems) * 100) : 0;
                                $cleaningPercent = $totalItems > 0 ? round(($itemsCleaning / $totalItems) * 100) : 0;
                                $availablePercent = $totalItems > 0 ? round(($machinesAvailable / $totalItems) * 100) : 0;
                                ?>
                                <div class="inventory-item" title="<?php echo $itemsRented; ?> out of <?php echo $totalItems; ?> units currently rented">
                                    <div class="inventory-label">
                                        <span>Units Rented</span>
                                        <span class="inventory-value"><?php echo $itemsRented; ?> / <?php echo $totalItems; ?></span>
                                    </div>
                                    <div class="progress-bar">
                                        <div class="progress-fill rented" style="width: <?php echo $rentedPercent; ?>%;"></div>
                                    </div>
                                </div>
                                <div class="inventory-item" title="<?php echo $itemsRepair; ?> units currently under repair">
                                    <div class="inventory-label">
                                        <span>In Repair</span>
                                        <span class="inventory-value warning"><?php echo $itemsRepair; ?> Unit<?php echo $itemsRepair != 1 ? 's' : ''; ?></span>
                                    </div>
                                    <div class="progress-bar">
                                        <div class="progress-fill repair" style="width: <?php echo $repairPercent; ?>%;"></div>
                                    </div>
                                </div>
                                <div class="inventory-item" title="<?php echo $itemsCleaning; ?> units being cleaned">
                                    <div class="inventory-label">
                                        <span>Cleaning</span>
                                        <span class="inventory-value info"><?php echo $itemsCleaning; ?> Unit<?php echo $itemsCleaning != 1 ? 's' : ''; ?></span>
                                    </div>
                                    <div class="progress-bar">
                                        <div class="progress-fill cleaning" style="width: <?php echo $cleaningPercent; ?>%;"></div>
                                    </div>
                                </div>
                                <div class="inventory-item" title="<?php echo $machinesAvailable; ?> units available for rent">
                                    <div class="inventory-label">
                                        <span>Available</span>
                                        <span class="inventory-value success"><?php echo $machinesAvailable; ?> Unit<?php echo $machinesAvailable != 1 ? 's' : ''; ?></span>
                                    </div>
                                    <div class="progress-bar">
                                        <div class="progress-fill available" style="width: <?php echo $availablePercent; ?>%;"></div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <!-- Quick Actions -->
                        <section class="admin-card quick-actions animate-fadeInUp">
                            <div class="admin-card-header">
                                <h2 class="admin-card-title">Quick Actions</h2>
                            </div>
                            <div class="admin-card-body">
                                <div class="quick-actions-grid">
                                    <a href="admin/calendar/calendar.php" class="quick-action-btn" title="View calendar master view">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                                            <line x1="16" y1="2" x2="16" y2="6"/>
                                            <line x1="8" y1="2" x2="8" y2="6"/>
                                            <line x1="3" y1="10" x2="21" y2="10"/>
                                        </svg>
                                        <span>Calendar</span>
                                    </a>
                                    <a href="admin/repairs/repairs.php" class="quick-action-btn" title="Manage repairs and maintenance">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
                                        </svg>
                                        <span>Repairs</span>
                                    </a>
                                    <a href="admin/latefees/latefees.php" class="quick-action-btn" title="Track late fees and penalties">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                            <text x="12" y="17" text-anchor="middle" font-size="16" font-weight="bold" fill="currentColor" stroke="none">₱</text>
                                        </svg>
                                        <span>Late Fees</span>
                                    </a>
                                    <a href="admin/customers/customers.php" class="quick-action-btn" title="Manage customer database">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                                            <circle cx="9" cy="7" r="4"/>
                                            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                                            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                                        </svg>
                                        <span>Customers</span>
                                    </a>
                                </div>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
            
            <!-- Footer Container -->
            <div id="footerContainer"></div>
        </main>
    </div>

    <!-- Scripts -->
    <script src="admin/shared/js/admin-components.js"></script>
    <script>
        // Initialize page with sidebar, header, footer
        document.addEventListener('DOMContentLoaded', () => {
            AdminComponents.initPage('dashboard');
        });
        
        // View booking details
        function viewBooking(orderId) {
            window.location.href = 'admin/orders/orderdetail.php?id=' + orderId;
        }
        
        // Edit booking
        function editBooking(orderId) {
            window.location.href = 'admin/orders/orderdetail.php?id=' + orderId + '&edit=true';
        }

        // Dashboard data from PHP
        const dashboardData = {
            totalRevenue: '<?php echo formatCurrency($totalRevenue); ?>',
            revenueChange: '<?php echo ($revenueChange >= 0 ? "+" : "") . $revenueChange; ?>%',
            activeRentals: <?php echo $activeRentals; ?>,
            pendingDeliveries: <?php echo $pendingDeliveries; ?>,
            machinesAvailable: <?php echo $machinesAvailable; ?>,
            totalItems: <?php echo $totalItems; ?>,
            itemsRented: <?php echo $itemsRented; ?>,
            itemsRepair: <?php echo $itemsRepair; ?>,
            itemsCleaning: <?php echo $itemsCleaning; ?>,
            recentBookings: <?php echo json_encode(array_map(function($b) {
                $start = new DateTime($b['start_date']);
                $end = new DateTime($b['end_date']);
                $duration = $start->diff($end)->days + 1;
                return [
                    'orderId' => 'ORD-' . str_pad($b['order_id'], 4, '0', STR_PAD_LEFT),
                    'customer' => $b['customer_name'] ?? 'Unknown',
                    'items' => $b['items'] ?? 'No items',
                    'duration' => $start->format('M j') . ' - ' . $end->format('M j') . ' (' . $duration . ' day' . ($duration > 1 ? 's' : '') . ')',
                    'status' => $b['rental_status']
                ];
            }, $recentBookings)); ?>,
            todaySchedule: <?php echo json_encode(array_map(function($s) use ($today) {
                $isDropoff = $s['start_date'] === $today;
                $type = $isDropoff ? 'Drop-off' : 'Pick-up';
                return [
                    'type' => $type,
                    'customer' => $s['customer_name'] ?? 'Unknown',
                    'items' => $s['items'] ?? 'No items',
                    'status' => $s['rental_status']
                ];
            }, $todaySchedule)); ?>
        };

        /**
         * Export Dashboard as PDF
         */
        function exportDashboardPDF() {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF('p', 'mm', 'a4');
            const pageWidth = doc.internal.pageSize.getWidth();
            const margin = 15;
            let y = 15;

            // Colors
            const primary = [99, 102, 241];    // Indigo
            const dark = [30, 30, 46];
            const gray = [120, 120, 140];
            const white = [255, 255, 255];

            // ── Header ──
            doc.setFillColor(...primary);
            doc.rect(0, 0, pageWidth, 40, 'F');
            doc.setTextColor(...white);
            doc.setFontSize(22);
            doc.setFont('helvetica', 'bold');
            doc.text('RentIt Dashboard Report', margin, 18);
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            const now = new Date();
            doc.text('Generated: ' + now.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }), margin, 28);
            doc.text('Period: ' + now.toLocaleDateString('en-US', { year: 'numeric', month: 'long' }), margin, 34);
            y = 50;

            // ── KPI Section ──
            doc.setTextColor(...dark);
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.text('Key Performance Indicators', margin, y);
            y += 8;

            const kpis = [
                { label: 'Total Revenue', value: dashboardData.totalRevenue, change: dashboardData.revenueChange },
                { label: 'Active Rentals', value: String(dashboardData.activeRentals), change: 'In progress' },
                { label: 'Pending Deliveries', value: String(dashboardData.pendingDeliveries), change: 'Next 2 days' },
                { label: 'Machines Available', value: String(dashboardData.machinesAvailable), change: 'Ready to rent' }
            ];

            const cardW = (pageWidth - margin * 2 - 12) / 4;
            kpis.forEach((kpi, i) => {
                const x = margin + i * (cardW + 4);
                // Card background
                doc.setFillColor(245, 245, 250);
                doc.roundedRect(x, y, cardW, 28, 3, 3, 'F');
                // Label
                doc.setFontSize(8);
                doc.setFont('helvetica', 'normal');
                doc.setTextColor(...gray);
                doc.text(kpi.label, x + 4, y + 8);
                // Value
                doc.setFontSize(14);
                doc.setFont('helvetica', 'bold');
                doc.setTextColor(...dark);
                doc.text(kpi.value, x + 4, y + 18);
                // Change
                doc.setFontSize(7);
                doc.setFont('helvetica', 'normal');
                doc.setTextColor(...gray);
                doc.text(kpi.change, x + 4, y + 24);
            });
            y += 38;

            // ── Recent Bookings Table ──
            doc.setTextColor(...dark);
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.text('Recent Bookings', margin, y);
            y += 4;

            if (dashboardData.recentBookings.length > 0) {
                doc.autoTable({
                    startY: y,
                    margin: { left: margin, right: margin },
                    head: [['Order ID', 'Customer', 'Items', 'Duration', 'Status']],
                    body: dashboardData.recentBookings.map(b => [
                        b.orderId, b.customer, b.items, b.duration, b.status
                    ]),
                    styles: {
                        fontSize: 8,
                        cellPadding: 3,
                        lineColor: [230, 230, 235],
                        lineWidth: 0.3
                    },
                    headStyles: {
                        fillColor: primary,
                        textColor: white,
                        fontStyle: 'bold',
                        fontSize: 8
                    },
                    alternateRowStyles: {
                        fillColor: [248, 248, 252]
                    },
                    columnStyles: {
                        0: { cellWidth: 22 },
                        4: { cellWidth: 28 }
                    }
                });
                y = doc.lastAutoTable.finalY + 10;
            } else {
                y += 4;
                doc.setFontSize(9);
                doc.setFont('helvetica', 'italic');
                doc.setTextColor(...gray);
                doc.text('No recent bookings found.', margin, y);
                y += 10;
            }

            // ── Today's Schedule ──
            doc.setTextColor(...dark);
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.text("Today's Schedule", margin, y);
            y += 4;

            if (dashboardData.todaySchedule.length > 0) {
                doc.autoTable({
                    startY: y,
                    margin: { left: margin, right: margin },
                    head: [['Type', 'Customer', 'Items', 'Status']],
                    body: dashboardData.todaySchedule.map(s => [
                        s.type, s.customer, s.items, s.status
                    ]),
                    styles: {
                        fontSize: 8,
                        cellPadding: 3,
                        lineColor: [230, 230, 235],
                        lineWidth: 0.3
                    },
                    headStyles: {
                        fillColor: [75, 85, 175],
                        textColor: white,
                        fontStyle: 'bold',
                        fontSize: 8
                    },
                    alternateRowStyles: {
                        fillColor: [248, 248, 252]
                    }
                });
                y = doc.lastAutoTable.finalY + 10;
            } else {
                y += 4;
                doc.setFontSize(9);
                doc.setFont('helvetica', 'italic');
                doc.setTextColor(...gray);
                doc.text('No scheduled deliveries or pickups for today.', margin, y);
                y += 10;
            }

            // ── Inventory Health ──
            doc.setTextColor(...dark);
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.text('Inventory Health', margin, y);
            y += 4;

            const inventory = [
                ['Units Rented', dashboardData.itemsRented + ' / ' + dashboardData.totalItems],
                ['In Repair', dashboardData.itemsRepair + ' unit(s)'],
                ['Cleaning', dashboardData.itemsCleaning + ' unit(s)'],
                ['Available', dashboardData.machinesAvailable + ' unit(s)']
            ];

            doc.autoTable({
                startY: y,
                margin: { left: margin, right: margin },
                head: [['Category', 'Count']],
                body: inventory,
                styles: {
                    fontSize: 8,
                    cellPadding: 3,
                    lineColor: [230, 230, 235],
                    lineWidth: 0.3
                },
                headStyles: {
                    fillColor: [60, 180, 100],
                    textColor: white,
                    fontStyle: 'bold',
                    fontSize: 8
                },
                alternateRowStyles: {
                    fillColor: [248, 252, 248]
                },
                columnStyles: {
                    0: { cellWidth: 50 }
                }
            });

            // ── Footer ──
            const pageCount = doc.internal.getNumberOfPages();
            for (let p = 1; p <= pageCount; p++) {
                doc.setPage(p);
                const pageH = doc.internal.pageSize.getHeight();
                doc.setFillColor(245, 245, 250);
                doc.rect(0, pageH - 15, pageWidth, 15, 'F');
                doc.setFontSize(7);
                doc.setFont('helvetica', 'normal');
                doc.setTextColor(...gray);
                doc.text('RentIt Admin Dashboard Report \u2022 Confidential', margin, pageH - 6);
                doc.text('Page ' + p + ' of ' + pageCount, pageWidth - margin, pageH - 6, { align: 'right' });
            }

            // Save
            const filename = 'RentIt_Dashboard_' + now.toISOString().slice(0, 10) + '.pdf';
            doc.save(filename);
        }
    </script>
</body>
</html>



