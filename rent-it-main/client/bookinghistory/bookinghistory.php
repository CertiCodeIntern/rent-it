<?php
session_start();
include '../../shared/php/db_connection.php';
include '../../shared/php/auth_check.php';

$user_id = $_SESSION['user_id'];

$user_query = mysqli_query($conn, "SELECT full_name, membership_level FROM USERS WHERE id = $user_id");
$user_data = mysqli_fetch_assoc($user_query);

$res_lifetime = mysqli_query($conn, "SELECT COUNT(*) AS lifetime_count FROM rental WHERE user_id = $user_id");
$lifetime_rentals = mysqli_fetch_assoc($res_lifetime)['lifetime_count'] ?? 0;

$res_spent = mysqli_query($conn, "SELECT SUM(total_price) AS total FROM rental WHERE user_id = $user_id");
$total_spent = mysqli_fetch_assoc($res_spent)['total'] ?? 0;

$member_status = $user_data['membership_level'] ?? 'Bronze';

$history_query = "SELECT r.order_id, r.rental_status, r.total_price, r.venue,
                         COALESCE(ri.start_date, r.start_date) AS start_date, 
                         COALESCE(ri.end_date, r.end_date) AS end_date,
                         i.item_name, i.category, i.image 
                  FROM rental r 
                  LEFT JOIN rental_item ri ON r.order_id = ri.order_id 
                  LEFT JOIN item i ON ri.item_id = i.item_id 
                  WHERE r.user_id = $user_id 
                  ORDER BY COALESCE(ri.start_date, r.start_date) DESC";
$history_result = mysqli_query($conn, $history_query);
$total_records = mysqli_num_rows($history_result);
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="RentIt - Booking History. Track all your past videoke rentals and manage receipts.">
    <title>Booking History - RentIt</title>
    
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
      <!-- Favicon -->
    <link rel="icon" type="image/png" href="/rent-it/assets/images/rIT_logo_tp.png">
    
    <!-- Stylesheets -->
    <link rel="stylesheet" href="<?= BASE_URL ?>/shared/css/theme.css">
    <link rel="stylesheet" href="<?= BASE_URL ?>/shared/css/globals.css">
    <link rel="stylesheet" href="<?= BASE_URL ?>/client/dashboard/dashboard.css">
    <link rel="stylesheet" href="<?= BASE_URL ?>/client/bookinghistory/bookinghistory.css">

    <script src="<?= BASE_URL ?>/shared/js/theme.js"></script>
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
        
        <!-- Main Content -->
        <main class="main-content">
            <!-- Topbar Container (Injected by JS) -->
            <div id="topbarContainer"></div>
            <div class="content-area" id="contentArea">
                <div class="page-header-dashboard">
                    <div class="page-header-info">
                     
                        <h1 class="page-title">Track all your past videoke rentals and manage receipts.</h1>
                    </div>
                  
                </div>

                <!-- Tabs Navigation -->
                <div class="rentals-tabs">
                <a href="<?= BASE_URL ?>/client/myrentals/pending.php" class="tab-link">Pending Rentals</a>
                    <a href="<?= BASE_URL ?>/client/myrentals/myrentals.php" class="tab-link">Active Rentals</a>
                    <a href="<?= BASE_URL ?>/client/bookinghistory/bookinghistory.php" class="tab-link active">Booking History</a>
                    <a href="<?= BASE_URL ?>/client/returns/returns.php" class="tab-link">Returns & Extensions</a>
                </div>

                <!-- KPI Cards -->
                <section class="kpi-panel">
                    <div class="kpi-row">
                        <article class="kpi-card">
                            <div class="kpi-icon-wrap blue">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">
                                    <path d="M6 3h10l2 2v14l-2 2H6V3z"/>
                                    <path d="M8 8h8M8 12h6M8 16h4"/>
                                </svg>
                            </div>
                            <div class="kpi-content">
                                <div class="kpi-label">Rentals</div>
                                <div class="kpi-value" id="lifetimeRentals"><?php echo $lifetime_rentals; ?></div>
                            </div>
                        </article>

                        <article class="kpi-card">
                            <div class="kpi-icon-wrap orange">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">
                                    <rect x="2" y="6" width="20" height="12" rx="2"/>
                                    <path d="M7 10h0"/>
                                    <path d="M11 12c1.2 0 2 .6 2 1s-.8 1-2 1"/>
                                </svg>
                            </div>
                            <div class="kpi-content">
                                <div class="kpi-label">Total Spent</div>
                                <div class="kpi-value" id="totalSpent">₱<?php echo number_format($total_spent, 2); ?></div>
                            </div>
                        </article>

                        <article class="kpi-card">
                            <div class="kpi-icon-wrap gold">
                                <svg viewBox="0 0 24 24" fill="currentColor" stroke="none">
                                    <path d="M12 .8l2.7 5.5 6.1.9-4.4 4.3 1 6.1L12 15.8 6.6 17.5l1-6.1L3.2 7.1l6.1-.9L12 .8z"/>
                                </svg>
                            </div>
                            <div class="kpi-content">
                                <div class="kpi-label">Member Status</div>
                                <div class="kpi-value" id="memberStatus"><?php echo htmlspecialchars($member_status); ?></div>
                            </div>
                        </article>
                    </div>
                </section>

                <!-- Booking History Table -->
                <section class="history-section">
                    <div class="history-panel">
                        <table class="history-table" role="table" aria-label="Booking history">
                            <thead>
                                <tr>
                                    <th>Item Name</th>
                                    <th>Rental ID</th>
                                    <th>Period</th>
                                    <th>Total Paid</th>
                                    <th>Status</th>
                                   
                                </tr>
                            </thead>
                            <tbody id="historyTableBody">
                                <?php if ($total_records > 0): ?>
                                    <?php while($row = mysqli_fetch_assoc($history_result)): ?>
                                    <tr>
                                        <td>
                                            <div class="item-cell">
                                                <div class="item-img" aria-hidden="true"><?php echo strtoupper(substr($row['item_name'] ?? 'I', 0, 1)); ?></div>
                                                <div class="item-info">
                                                    <div class="item-name"><?php echo htmlspecialchars($row['item_name'] ?? 'Unknown Item'); ?></div>
                                                    <div class="small-muted"><?php echo htmlspecialchars($row['category'] ?? 'Equipment'); ?></div>
                                                </div>
                                            </div>
                                        </td>
                                        <td class="small-muted">#ORD-<?php echo $row['order_id']; ?></td>
                                        <td>
                                            <div class="period">
                                                <div class="date-start"><?php echo date('M d, Y', strtotime($row['start_date'])); ?></div>
                                                <div class="date-end">to <?php echo date('M d, Y', strtotime($row['end_date'])); ?></div>
                                            </div>
                                        </td>
                                        <td class="amount-cell"><strong>₱<?php echo number_format($row['total_price'], 2); ?></strong></td>
                                        <td>
                                            <?php 
                                            $status_class = 'status-' . strtolower(str_replace(' ', '-', $row['rental_status']));
                                            ?>
                                            <span class="status-pill <?php echo $status_class; ?>"><?php echo htmlspecialchars($row['rental_status']); ?></span>
                                        </td>
                                        <td>

                                    <?php endwhile; ?>
                                <?php else: ?>
                                    <tr class="history-empty">
                                        <td colspan="6">
                                            <div class="empty-state">
                                                <div class="empty-state-icon">🗂️</div>
                                                <h3 class="empty-state-title">No booking history yet</h3>
                                                <p class="empty-state-text">Your completed rentals will show up here.</p>
                                                <a href="../catalog/catalog.php" class="empty-state-link">Browse Catalog</a>
                                            </div>
                                        </td>
                                    </tr>
                                <?php endif; ?>
                            </tbody>
                        </table>

                        <!-- Pagination -->
                        <nav class="pagination-controls is-hidden" id="historyPagination" aria-label="Booking history pagination"></nav>
                    </div>
                </section>

              
            </div>

            <!-- Footer Container (Injected by JS) -->
            <div id="footerContainer"></div>
        </main>
    </div>
    
    <!-- Scripts -->
    <script src="<?= BASE_URL ?>/shared/js/components.js"></script>
    <script src="<?= BASE_URL ?>/shared/js/pagination.js"></script>
    <script src="<?= BASE_URL ?>/client/bookinghistory/bookinghistory.js"></script>
</body>
</html>
