<?php
session_start();
include '../../shared/php/db_connection.php';
include '../../shared/php/auth_check.php';

$user_id = $_SESSION['user_id'];

// Fetch ALL orders for this user (not just Pending)
$all_orders_query = "SELECT 
                    r.order_id, 
                    r.total_price, 
                    r.rental_status,    
                    COALESCE(MIN(ri.start_date), r.start_date) AS start_date, 
                    COALESCE(MAX(ri.end_date), r.end_date) AS end_date, 
                    GROUP_CONCAT(DISTINCT i.image ORDER BY ri.rental_item_id LIMIT 1) AS image,
                    GROUP_CONCAT(DISTINCT i.item_name SEPARATOR ', ') AS item_names,
                    (DATEDIFF(COALESCE(MAX(ri.end_date), r.end_date), COALESCE(MIN(ri.start_date), r.start_date)) + 1) AS rental_days,
                    (SELECT COUNT(*) FROM rental_item WHERE order_id = r.order_id) as item_count 
                  FROM rental r
                  JOIN rental_item ri ON r.order_id = ri.order_id
                  JOIN item i ON ri.item_id = i.item_id
                  WHERE r.user_id = ? AND r.rental_status IS NOT NULL
                  GROUP BY r.order_id 
                  ORDER BY r.order_id DESC";

$stmt = $conn->prepare($all_orders_query);
$stmt->bind_param("i", $user_id);
$stmt->execute();
$result = $stmt->get_result();

$orders = [];
while ($row = $result->fetch_assoc()) {
    $orders[] = $row;
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Orders - RentIt</title>
    
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    
    <link rel="stylesheet" href="<?= BASE_URL ?>/shared/css/theme.css">
    <link rel="stylesheet" href="<?= BASE_URL ?>/shared/css/globals.css">
    <link rel="stylesheet" href="<?= BASE_URL ?>/client/dashboard/dashboard.css">
    <link rel="stylesheet" href="<?= BASE_URL ?>/client/myrentals/myrentals.css">
    <link rel="icon" type="image/png" href="/rent-it/assets/images/rIT_logo_tp.png">
    <script src="<?= BASE_URL ?>/shared/js/theme.js"></script>

    <style>
        /* ============================
           ORDER FILTER TABS
           ============================ */
        .order-filters {
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 16px;
            margin-bottom: 24px;
            flex-wrap: wrap;
        }
        .order-filter-tabs {
            display: flex;
            background: var(--bg-secondary, #f1f5f9);
            border: 1px solid var(--border-color);
            border-radius: 10px;
            padding: 4px;
            overflow-x: auto;
            -webkit-overflow-scrolling: touch;
            scrollbar-width: none;
            -ms-overflow-style: none;
            white-space: nowrap;
            flex-shrink: 0;
        }
        .order-filter-tabs::-webkit-scrollbar { display: none; }
        .order-filter-tab {
            padding: 8px 16px;
            border: none;
            background: transparent;
            color: var(--text-secondary);
            font-size: 0.8rem;
            font-weight: 600;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.2s ease;
            white-space: nowrap;
            flex-shrink: 0;
            font-family: inherit;
        }
        .order-filter-tab:hover {
            color: var(--text-primary);
        }
        .order-filter-tab.active {
            background: var(--accent, #E67E22);
            color: white;
        }
        .order-filter-search {
            display: flex;
            align-items: center;
            gap: 8px;
            background: var(--bg-secondary, #f1f5f9);
            border: 1px solid var(--border-color);
            border-radius: 10px;
            padding: 8px 16px;
            flex: 1;
            max-width: 350px;
            transition: all 0.2s ease;
        }
        .order-filter-search:focus-within {
            border-color: var(--accent, #E67E22);
            box-shadow: 0 0 0 3px rgba(230, 126, 34, 0.15);
        }
        .order-filter-search svg {
            color: var(--text-muted, #94a3b8);
            flex-shrink: 0;
        }
        .order-filter-search input {
            flex: 1;
            border: none;
            background: transparent;
            color: var(--text-primary);
            font-size: 0.85rem;
            outline: none;
            font-family: inherit;
        }
        .order-filter-search input::placeholder {
            color: var(--text-muted, #94a3b8);
        }

        /* ============================
           ORDER CARDS
           ============================ */
        .order-card {
            background: var(--bg-card);
            border-radius: 12px;
            padding: 20px;
            border: 1px solid var(--border-color);
            margin-bottom: 15px;
            display: flex;
            gap: 20px;
            align-items: flex-start;
            transition: all 0.2s ease;
        }
        .order-card:hover {
            border-color: var(--accent, #f97316);
            box-shadow: 0 4px 12px rgba(0,0,0,0.05);
        }
        .item-img {
            width: 100px;
            height: 100px;
            object-fit: cover;
            border-radius: 8px;
            border: 1px solid var(--border-color);
        }

        /* ============================
           STATUS PILLS (color per status)
           ============================ */
        .status-pill {
            padding: 6px 14px;
            border-radius: 50px;
            font-size: 0.72rem;
            font-weight: 700;
            text-transform: uppercase;
            display: inline-block;
            letter-spacing: 0.3px;
        }
        .status-pill.pending {
            background: #fffbeb; color: #92400e; border: 1px solid #fde68a;
        }
        .status-pill.confirmed {
            background: #eff6ff; color: #1e40af; border: 1px solid #bfdbfe;
        }
        .status-pill.in-transit {
            background: #f0f9ff; color: #0369a1; border: 1px solid #7dd3fc;
        }
        .status-pill.active {
            background: #ecfdf5; color: #065f46; border: 1px solid #6ee7b7;
        }
        .status-pill.pending-return {
            background: #fdf4ff; color: #86198f; border: 1px solid #e879f9;
        }
        .status-pill.returned {
            background: #f5f3ff; color: #5b21b6; border: 1px solid #c4b5fd;
        }
        .status-pill.completed {
            background: #f0fdf4; color: #166534; border: 1px solid #86efac;
        }
        .status-pill.cancelled {
            background: #fef2f2; color: #991b1b; border: 1px solid #fca5a5;
        }
        .status-pill.late {
            background: #fef2f2; color: #dc2626; border: 1px solid #f87171;
        }

        /* ============================
           EMPTY STATE & COUNT BADGE
           ============================ */
        .no-data-container {
            text-align: center;
            padding: 60px 20px;
            background: var(--bg-secondary);
            border-radius: 12px;
            border: 2px dashed var(--border-color);
        }
        .no-data-container p {
            color: var(--text-secondary);
        }
        .order-count-badge {
            font-size: 0.8rem;
            color: var(--text-secondary);
            margin-bottom: 16px;
        }
        .order-count-badge strong {
            color: var(--text-primary);
        }

        /* ============================
           STATUS HELPER TEXT
           ============================ */
        .status-helper {
            font-size: 0.72rem;
            color: #94a3b8;
            margin-top: 10px;
            line-height: 1.4;
        }

        /* ============================
           RESPONSIVE
           ============================ */
        @media (max-width: 768px) {
            .order-filters {
                flex-direction: column;
                align-items: stretch;
            }
            .order-filter-tabs {
                justify-content: flex-start;
            }
            .order-filter-tab {
                font-size: 0.72rem;
                padding: 6px 12px;
            }
            .order-filter-search {
                max-width: 100%;
            }
            .order-card {
                flex-direction: column;
                align-items: stretch;
            }
            .order-card .item-img {
                width: 100%;
                height: 150px;
            }
            .order-status-col {
                text-align: left !important;
                min-width: auto !important;
            }
        }
    </style>
</head>
<body>
    <div class="app-container">
        <div id="sidebarContainer"></div>
        
        <main class="main-content">
            <div id="topbarContainer"></div>
            
            <div class="content-area">
                <div class="page-header-dashboard">
                    <div class="page-header-info">
                        <h1 class="page-title">My Orders</h1>
                        <p class="page-subtitle">Track the status of all your rental orders</p>
                    </div>
                </div>

                <div class="rentals-tabs">
                    <a href="<?= BASE_URL ?>/client/myrentals/pending.php" class="tab-link active">My Orders</a>
                    <a href="<?= BASE_URL ?>/client/myrentals/myrentals.php" class="tab-link">Active Rentals</a>
                    <a href="<?= BASE_URL ?>/client/bookinghistory/bookinghistory.php" class="tab-link">Booking History</a>
                    <a href="<?= BASE_URL ?>/client/returns/returns.php" class="tab-link">Returns & Extensions</a>
                </div>

                <!-- Filter Tabs (like dispatch page) -->
                <div class="order-filters">
                    <div class="order-filter-tabs">
                        <button class="order-filter-tab active" data-filter="all">All</button>
                        <button class="order-filter-tab" data-filter="Pending">Pending</button>
                        <button class="order-filter-tab" data-filter="Confirmed">Confirmed</button>
                        <button class="order-filter-tab" data-filter="In Transit">Out for Delivery</button>
                        <button class="order-filter-tab" data-filter="Active">Active</button>
                        <button class="order-filter-tab" data-filter="Pending Return">Return Scheduled</button>
                        <button class="order-filter-tab" data-filter="Returned">Returned</button>
                        <button class="order-filter-tab" data-filter="Completed">Completed</button>
                        <button class="order-filter-tab" data-filter="Late">Late</button>
                        <button class="order-filter-tab" data-filter="Cancelled">Cancelled</button>
                    </div>
                    <div class="order-filter-search">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                        </svg>
                        <input type="text" id="orderSearchInput" placeholder="Search by order ID or item name..." />
                    </div>
                </div>

                <div class="order-count-badge" id="orderCountBadge"></div>

                <section class="order-list-section" id="orderListSection">
                    <?php if (count($orders) > 0): ?>
                        <?php foreach ($orders as $order): 
                            $status = $order['rental_status'];
                            // CSS class for pill
                            $pillClass = 'pending';
                            $statusLabel = $status;
                            $helperText = '';
                            switch ($status) {
                                case 'Pending':
                                    $pillClass = 'pending';
                                    $helperText = 'Waiting for shop to confirm your booking.';
                                    break;
                                case 'Confirmed':
                                    $pillClass = 'confirmed';
                                    $helperText = 'Your order has been confirmed. Preparing for delivery.';
                                    break;
                                case 'In Transit':
                                    $pillClass = 'in-transit';
                                    $statusLabel = 'Out for Delivery';
                                    $helperText = 'Your order is on the way!';
                                    break;
                                case 'Active':
                                    $pillClass = 'active';
                                    $helperText = 'You currently have this rental.';
                                    break;
                                case 'Pending Return':
                                    $pillClass = 'pending-return';
                                    $statusLabel = 'Return Scheduled';
                                    $helperText = 'Return has been scheduled.';
                                    break;
                                case 'Returned':
                                    $pillClass = 'returned';
                                    $helperText = 'Item has been returned. Awaiting final check.';
                                    break;
                                case 'Completed':
                                    $pillClass = 'completed';
                                    $helperText = 'Rental completed successfully.';
                                    break;
                                case 'Cancelled':
                                    $pillClass = 'cancelled';
                                    $helperText = 'This order was cancelled.';
                                    break;
                                case 'Late':
                                    $pillClass = 'late';
                                    $helperText = 'This rental is overdue. Please return ASAP.';
                                    break;
                            }
                        ?>
                            <div class="order-card" data-status="<?= htmlspecialchars($status) ?>">
                                <div class="product-img-container">
                                    <img src="<?= BASE_URL ?>/assets/images/items/<?= htmlspecialchars($order['image']) ?>" 
                                         alt="Product" 
                                         class="item-img"
                                         onerror="this.src='<?= BASE_URL ?>/assets/images/catalog-fallback.svg'">
                                </div>

                                <div class="order-info" style="flex-grow: 1;">
                                    <h4 style="margin-bottom: 8px; color: var(--text-primary);"><?= htmlspecialchars($order['item_names']) ?></h4>
                                    
                                    <div class="order-meta" style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 0.85rem;">
                                        <div>
                                            <p style="color: var(--text-secondary); margin: 2px 0;">Start Date: <span style="color: var(--text-primary); font-weight: 600;"><?= date('M d, Y', strtotime($order['start_date'])) ?></span></p>
                                            <p style="color: var(--text-secondary); margin: 2px 0;">End Date: <span style="color: var(--text-primary); font-weight: 600;"><?= date('M d, Y', strtotime($order['end_date'])) ?></span></p>
                                        </div>
                                        <div>
                                            <p style="color: var(--text-secondary); margin: 2px 0;">Duration: <span style="color: var(--text-primary); font-weight: 600;"><?= $order['rental_days'] ?> Day(s)</span></p>
                                            <p style="color: var(--text-secondary); margin: 2px 0;">Items: <span style="color: var(--text-primary); font-weight: 600;"><?= $order['item_count'] ?> item(s)</span></p>
                                        </div>
                                    </div>
                                    
                                    <div style="margin-top: 12px; font-size: 1rem; color: #f97316; font-weight: 700;">
                                        Total Amount: ₱<?= number_format($order['total_price'], 2) ?>
                                    </div>
                                    <p style="font-size: 0.75rem; color: #94a3b8; margin-top: 5px;">Order ID: #<?= $order['order_id'] ?></p>
                                </div>

                                <div class="order-status-col" style="text-align: right; min-width: 150px;">
                                    <span class="status-pill <?= $pillClass ?>"><?= htmlspecialchars($statusLabel) ?></span>
                                    <p class="status-helper"><?= $helperText ?></p>
                                </div>
                            </div>
                        <?php endforeach; ?>
                    <?php else: ?>
                        <div class="no-data-container" id="emptyState">
                            <p>You don't have any orders yet.</p>
                            <a href="../catalog/catalog.php" style="color: #f97316; text-decoration: none; font-weight: 600;">Rent something now →</a>
                        </div>
                    <?php endif; ?>
                </section>

                <!-- Empty state for filters (hidden by default) -->
                <div class="no-data-container" id="filterEmptyState" style="display: none;">
                    <p>No orders match the selected filter.</p>
                </div>
            </div>

            <!-- Footer Container (Injected by JS) -->
            <div id="footerContainer"></div>
        </main>
    </div>

    <script src="<?= BASE_URL ?>/shared/js/components.js"></script>
    <script>
    document.addEventListener('DOMContentLoaded', function() {
        // Inject sidebar, topbar, footer
        if (typeof Components !== 'undefined') {
            Components.injectSidebar('sidebarContainer', 'myrentals', 'client');
            Components.injectTopbar('topbarContainer', 'My Orders');
            Components.injectFooter('footerContainer');
        }

        const allCards = Array.from(document.querySelectorAll('.order-card'));
        const filterTabs = document.querySelectorAll('.order-filter-tab');
        const searchInput = document.getElementById('orderSearchInput');
        const countBadge = document.getElementById('orderCountBadge');
        const orderSection = document.getElementById('orderListSection');
        const filterEmpty = document.getElementById('filterEmptyState');

        function getActiveFilter() {
            const active = document.querySelector('.order-filter-tab.active');
            return active ? active.dataset.filter : 'all';
        }

        function filterOrders() {
            const status = getActiveFilter();
            const search = (searchInput?.value || '').toLowerCase().trim();
            let visibleCount = 0;

            allCards.forEach(card => {
                const cardStatus = card.dataset.status;
                const cardText = card.textContent.toLowerCase();

                const matchesStatus = (status === 'all') || (cardStatus === status);
                const matchesSearch = !search || cardText.includes(search);

                if (matchesStatus && matchesSearch) {
                    card.style.display = '';
                    visibleCount++;
                } else {
                    card.style.display = 'none';
                }
            });

            // Show/hide empty states
            if (allCards.length > 0) {
                if (visibleCount === 0) {
                    filterEmpty.style.display = '';
                    orderSection.style.display = 'none';
                } else {
                    filterEmpty.style.display = 'none';
                    orderSection.style.display = '';
                }
            }

            // Update count badge
            if (countBadge) {
                const label = status === 'all' ? 'All Orders' : document.querySelector('.order-filter-tab.active')?.textContent || status;
                countBadge.innerHTML = `Showing <strong>${visibleCount}</strong> of <strong>${allCards.length}</strong> orders` + (status !== 'all' ? ` — <strong>${label}</strong>` : '');
            }
        }

        // Tab click
        filterTabs.forEach(tab => {
            tab.addEventListener('click', function() {
                filterTabs.forEach(t => t.classList.remove('active'));
                this.classList.add('active');
                filterOrders();
            });
        });

        // Search
        if (searchInput) {
            let debounce;
            searchInput.addEventListener('input', () => {
                clearTimeout(debounce);
                debounce = setTimeout(filterOrders, 250);
            });
        }

        // Initial render
        filterOrders();
    });
    </script>

</body>
</html>