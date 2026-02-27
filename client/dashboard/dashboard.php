<?php
session_start();
include '../../shared/php/db_connection.php';

// Determine if this is the React JSON API call
$isJsonRequest = isset($_GET['format']) && $_GET['format'] === 'json';

// Auth guard
if (!isset($_SESSION['user_id'])) {
    if ($isJsonRequest) {
        // For React JSON calls: return 401 JSON instead of redirect HTML
        http_response_code(401);
        header('Content-Type: application/json');
        echo json_encode(['error' => 'Not authenticated']);
        exit();
    }

    // For normal (HTML) dashboard, use shared auth check + cache headers
    include '../../shared/php/auth_check.php';
}

$user_id = $_SESSION['user_id'];

// Optional: still handle POST actions for return/extend if needed
if ($_SERVER['REQUEST_METHOD'] == 'POST' && isset($_POST['action'])) {
    $order_id = intval($_POST['order_id']);
    $action = $_POST['action'];

    if ($action == 'return') {
        $update_query = "UPDATE RENTAL SET rental_status = 'Pending Return' WHERE order_id = $order_id AND user_id = $user_id";
    } elseif ($action == 'extend') {
        $update_query = "UPDATE RENTAL SET rental_status = 'Pending Extension' WHERE order_id = $order_id AND user_id = $user_id";
    }

    if (isset($update_query)) {
        mysqli_query($conn, $update_query);
    }
}

// User info (used by dashboard, contact page, and profile page)
$user_query = mysqli_query($conn, "SELECT full_name, email, phone, address, profile_picture, created_at, membership_level FROM USERS WHERE id = $user_id");
$user_data = mysqli_fetch_assoc($user_query) ?: [
    'full_name'        => 'User',
    'email'            => '',
    'phone'            => '',
    'address'          => '',
    'profile_picture'  => null,
    'created_at'       => null,
    'membership_level' => 'Bronze',
];

// Totals
$res_spent   = mysqli_query($conn, "SELECT SUM(total_price) AS total FROM RENTAL WHERE user_id = $user_id");
$total_spent = ($res_spent && ($row = mysqli_fetch_assoc($res_spent))) ? (float) $row['total'] : 0;

$res_active   = mysqli_query($conn, "SELECT COUNT(*) AS active_count FROM RENTAL WHERE user_id = $user_id AND rental_status IN ('Active','Rented', 'Pending Extension')");
$active_count = ($res_active && ($row = mysqli_fetch_assoc($res_active))) ? (int) $row['active_count'] : 0;

$res_upcoming     = mysqli_query($conn, "SELECT COUNT(*) AS upcoming FROM RENTAL WHERE user_id = $user_id AND rental_status IN ('Returned')");
$upcoming_returns = ($res_upcoming && ($row = mysqli_fetch_assoc($res_upcoming))) ? (int) $row['upcoming'] : 0;

// JSON API for React: return early so PHP dashboard HTML is not sent
if (isset($_GET['format']) && $_GET['format'] === 'json') {
$active_rentals = [];
    $ar_query = "SELECT r.*, i.item_name FROM RENTAL r
    LEFT JOIN RENTAL_ITEM ri ON r.order_id = ri.order_id
    LEFT JOIN ITEM i ON ri.item_id = i.item_id
        WHERE r.user_id = $user_id AND r.rental_status IN ('Active','Rented', 'Pending Extension')
        GROUP BY r.order_id";
    if ($res = mysqli_query($conn, $ar_query)) {
    while ($row = mysqli_fetch_assoc($res)) {
        $active_rentals[] = [
                'order_id' => (int) $row['order_id'],
                'item_name' => $row['item_name'],
                'end_date' => $row['end_date'],
            'formatted_end_date' => date('M d, Y', strtotime($row['end_date'])),
                'rental_status' => $row['rental_status'],
        ];
    }
}
$history = [];
    $hist_query = "SELECT r.*, i.item_name FROM RENTAL r
    LEFT JOIN RENTAL_ITEM ri ON r.order_id = ri.order_id
    LEFT JOIN ITEM i ON ri.item_id = i.item_id
        WHERE r.user_id = $user_id AND r.rental_status IN ('Active', 'Returned', 'Extended')
        ORDER BY r.start_date DESC LIMIT 5";
    if ($res = mysqli_query($conn, $hist_query)) {
    while ($row = mysqli_fetch_assoc($res)) {
        $history[] = [
                'order_id' => (int) $row['order_id'],
                'item_name' => $row['item_name'],
                'start_date' => $row['start_date'],
                'end_date' => $row['end_date'],
                'formatted_period' => date('M d', strtotime($row['start_date'])) . ' - ' . date('M d', strtotime($row['end_date'])),
                'total_price' => (float) $row['total_price'],
            'formatted_total_price' => number_format($row['total_price'], 2),
                'rental_status' => $row['rental_status'],
        ];
    }
}
$member_status = $user_data['membership_level'] ?? 'Bronze';
    $member_since = $user_data['created_at'] ? date('F Y', strtotime($user_data['created_at'])) : null;
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Credentials: true');
header('Content-Type: application/json');
echo json_encode([
    'user' => [
            'full_name' => $user_data['full_name'] ?? 'User',
            'email' => $user_data['email'] ?? '',
        'membership_level' => $member_status,
            'phone' => $user_data['phone'] ?? '',
            'address' => $user_data['address'] ?? '',
            'profile_picture' => $user_data['profile_picture'] ?? null,
            'member_since' => $member_since,
    ],
    'totals' => [
            'total_spent' => $total_spent,
            'active_count' => $active_count,
        'upcoming_returns' => $upcoming_returns,
    ],
    'active_rentals' => $active_rentals,
        'history' => $history,
    ]);
    exit();
}

// PHP dashboard (team): result sets for HTML
$active_rentals_query = "SELECT r.*, i.item_name FROM RENTAL r 
                         LEFT JOIN RENTAL_ITEM ri ON r.order_id = ri.order_id 
                         LEFT JOIN ITEM i ON ri.item_id = i.item_id 
                         WHERE r.user_id = $user_id AND r.rental_status IN ('Booked','Rented', 'Pending Extension')
                         GROUP BY r.order_id";
$active_result = mysqli_query($conn, $active_rentals_query);

$pending_query = "SELECT r.*, i.item_name FROM RENTAL r 
                  LEFT JOIN RENTAL_ITEM ri ON r.order_id = ri.order_id 
                  LEFT JOIN ITEM i ON ri.item_id = i.item_id 
                  WHERE r.user_id = $user_id 
                  AND r.rental_status IN ('Pending Return', 'Pending Extension')";
$pending_result = mysqli_query($conn, $pending_query);

$history_query = "SELECT r.*, i.item_name FROM RENTAL r 
                  LEFT JOIN RENTAL_ITEM ri ON r.order_id = ri.order_id 
                  LEFT JOIN ITEM i ON ri.item_id = i.item_id 
                  WHERE r.user_id = $user_id 
                  AND r.rental_status IN ('Booked', 'Returned', 'Extended') 
                  ORDER BY r.start_date DESC LIMIT 5";
$history_result = mysqli_query($conn, $history_query);

$member_status = $user_data['membership_level'] ?? 'Bronze';
$member_since = $user_data['created_at'] ? date('F Y', strtotime($user_data['created_at'])) : null;
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>RentIt - Dashboard</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <link rel="icon" type="image/png" href="/rent-it/assets/images/rIT_logo_tp.png">
    <link rel="stylesheet" href="../../shared/css/theme.css">
    <link rel="stylesheet" href="../../shared/css/globals.css">
    <link rel="stylesheet" href="../dashboard/dashboard.css">
</head>
<body>
    <div class="page-skeleton-overlay" aria-hidden="true">
        <div class="page-skeleton-shell">
            <aside class="page-skeleton-sidebar">
                <div class="page-skeleton-logo skeleton-shape"></div>
                <div class="page-skeleton-nav">
                    <span class="page-skeleton-pill skeleton-shape w-70"></span>
                    <span class="page-skeleton-pill skeleton-shape w-60"></span>
                    <span class="page-skeleton-pill skeleton-shape w-80"></span>
                    <span class="page-skeleton-pill skeleton-shape w-50"></span>
                    <span class="page-skeleton-pill skeleton-shape w-70"></span>
                </div>
                <div class="page-skeleton-user">
                    <span class="page-skeleton-circle skeleton-shape"></span>
                    <span class="page-skeleton-line skeleton-shape w-60" style="height: 12px;"></span>
                </div>
            </aside>
            <section class="page-skeleton-main">
                <div class="page-skeleton-topbar">
                    <span class="page-skeleton-line skeleton-shape w-30" style="height: 14px;"></span>
                    <span class="page-skeleton-circle skeleton-shape"></span>
                </div>
                <div class="page-skeleton-card">
                    <div class="page-skeleton-row" style="grid-template-columns: 1fr auto;">
                        <span class="page-skeleton-line skeleton-shape w-40" style="height: 14px;"></span>
                        <span class="page-skeleton-pill skeleton-shape w-20"></span>
                    </div>
                    <div class="page-skeleton-table">
                        <div class="page-skeleton-row">
                            <span class="page-skeleton-line skeleton-shape w-35 page-skeleton-block"></span>
                            <span class="page-skeleton-line skeleton-shape w-25 page-skeleton-block"></span>
                            <span class="page-skeleton-line skeleton-shape w-20 page-skeleton-block"></span>
                            <span class="page-skeleton-line skeleton-shape w-15 page-skeleton-block"></span>
                        </div>
                        <div class="page-skeleton-row">
                            <span class="page-skeleton-line skeleton-shape w-40 page-skeleton-block"></span>
                            <span class="page-skeleton-line skeleton-shape w-30 page-skeleton-block"></span>
                            <span class="page-skeleton-line skeleton-shape w-20 page-skeleton-block"></span>
                            <span class="page-skeleton-line skeleton-shape w-15 page-skeleton-block"></span>
                        </div>
                        <div class="page-skeleton-row">
                            <span class="page-skeleton-line skeleton-shape w-50 page-skeleton-block"></span>
                            <span class="page-skeleton-line skeleton-shape w-25 page-skeleton-block"></span>
                            <span class="page-skeleton-line skeleton-shape w-20 page-skeleton-block"></span>
                            <span class="page-skeleton-line skeleton-shape w-15 page-skeleton-block"></span>
                        </div>
                    </div>
                </div>
                <div class="page-skeleton-loader">
                    <span class="page-skeleton-spinner" aria-hidden="true"></span>
                    <span>Loading content...</span>
                </div>
            </section>
        </div>
    </div>
    <div class="app-container">
        <div id="sidebarContainer"></div>
        <main class="main-content">
            <div id="topbarContainer"></div>
            
            <div class="content-area">
                <div class="page-header-dashboard">
                    <div class="page-header-info">
                        <h1 class="page-title">Dashboard</h1>
                        <p class="page-subtitle">Welcome back, <?php echo htmlspecialchars($user_data['full_name']); ?>!</p>
                    </div>
                    <div class="page-header-actions">
                        <a href="../catalog/catalog.php" class="btn-new">Browse Catalog</a>
                    </div>
                </div>

                <section class="kpi-panel">
                    <div class="kpi-row">
                        <article class="kpi-card">
                            <div class="kpi-content">
                                <div class="kpi-label">Active Rentals</div>
                                <div class="kpi-value"><?php echo $active_count; ?></div>
                                <div class="kpi-sub positive">In possession</div>
                            </div>
                        </article>
                        <article class="kpi-card">
                            <div class="kpi-content">
                                <div class="kpi-label">Total Spent</div>
                                <div class="kpi-value">₱<?php echo number_format($total_spent, 2); ?></div>
                                <div class="kpi-sub">Lifetime</div>
                            </div>
                        </article>
                        <article class="kpi-card">
                            <div class="kpi-content">
                                <div class="kpi-label">Total Returned</div>
                                <div class="kpi-value"><?php echo $upcoming_returns; ?></div>
                            </div>
                        </article>
                        <article class="kpi-card">
                            <div class="kpi-content">
                                <div class="kpi-label">Member Status</div>
                                <div class="kpi-value"><?php echo htmlspecialchars($member_status); ?></div>
                                <div class="kpi-sub positive">Verified User</div>
                            </div>
                        </article>
                    </div>
                </section>

                <section class="active-rentals-section">
                    <div class="section-header">
                        <h2 class="section-title">Currently In Possession</h2>
                        <span class="units-badge"><?php echo $active_count; ?> Units Active</span>
                    </div>
                    <div class="rental-cards-row">
                        <?php if (mysqli_num_rows($active_result) > 0): ?>
                            <?php while($row = mysqli_fetch_assoc($active_result)): ?>
                            <article class="rental-card">
                                <div class="card-top">
                                    <div class="card-info">
                                        <?php if($row['rental_status'] == 'Pending Extension'): ?>
                                            <span class="badge status-pending">EXTENSION PENDING</span>
                                        <?php else: ?>
                                            <span class="badge status-rented">ACTIVE</span>
                                        <?php endif; ?>
                                        <h3 class="card-title"><?php echo htmlspecialchars($row['item_name']); ?></h3>
                                        <div class="card-meta">Due: <?php echo date('M d, Y', strtotime($row['end_date'])); ?></div>
                                    </div>
                                </div>
                              

                            </article>
                            <?php endwhile; ?>
                        <?php else: ?>
                            <div class="empty-state empty-state-card">
                                <div class="empty-state-icon">🎤</div>
                                <h3 class="empty-state-title">No active rentals yet</h3>
                                <p class="empty-state-text">Browse the catalog to book your first videoke set.</p>
                                <a href="../catalog/catalog.php" class="empty-state-link">Browse Catalog</a>
                            </div>
                        <?php endif; ?>
                    </div>
                </section>

           
                  

                <section class="history-section" style="margin-top: 40px;">
                    <div class="section-header">
                        <h2 class="section-title">Booking History</h2>
                        <a href="../bookinghistory/bookinghistory.php" class="view-all-link">View All</a>
                    </div>
                    <div class="history-panel">
                        <table class="history-table">
                            <thead>
                                <tr>
                                    <th>Item Details</th>
                                    <th>Rental Period</th>
                                    <th>Amount</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                <?php if (mysqli_num_rows($history_result) > 0): ?>
                                    <?php while($row = mysqli_fetch_assoc($history_result)): 
                                        $status_raw = $row['rental_status'];
                                        $status_class = strtolower($status_raw);
                                    ?>
                                    <tr>
                                        <td><strong><?php echo htmlspecialchars($row['item_name']); ?></strong><br><small>#ORD-<?php echo $row['order_id']; ?></small></td>
                                        <td><?php echo date('M d', strtotime($row['start_date'])) . " - " . date('M d', strtotime($row['end_date'])); ?></td>
                                        <td>₱<?php echo number_format($row['total_price'], 2); ?></td>
                                        <td><span class="status-pill status-<?php echo $status_class; ?>"><?php echo strtoupper($status_raw); ?></span></td>
                                    </tr>
                                    <?php endwhile; ?>
                                <?php else: ?>
                                    <tr class="history-empty">
                                        <td colspan="4">
                                            <div class="empty-state">
                                                <div class="empty-state-icon">🗂️</div>
                                                <h3 class="empty-state-title">No bookings yet</h3>
                                                <p class="empty-state-text">Your completed rentals will show up here.</p>
                                                <a href="../catalog/catalog.php" class="empty-state-link">Browse Catalog</a>
                                            </div>
                                        </td>
                                    </tr>
                                <?php endif; ?>
                            </tbody>
                        </table>
                    </div>
                </section>
            </div> 

            <!-- Footer Container (Injected by JS) -->
            <div id="footerContainer"></div>
        </main>
    </div>

    <script src="../../shared/js/components.js"></script>
    <script src="../dashboard/dashboard.js"></script>
</body>
</html>
