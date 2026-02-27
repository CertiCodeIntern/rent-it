<?php

session_start();
include '../../shared/php/db_connection.php';
include '../../shared/php/auth_check.php';

$user_id = $_SESSION['user_id'];

// --- HANDLE POST ACTIONS ---
if ($_SERVER['REQUEST_METHOD'] == 'POST' && isset($_POST['action'])) {
    $order_id = intval($_POST['order_id']);
    $action = $_POST['action'];

    if ($action == 'submit_return') {
        $reason = $_POST['return_reason'] ?? '';
        $stmt = $conn->prepare("UPDATE rental SET rental_status = 'Pending Return', return_reason = ? WHERE order_id = ? AND user_id = ?");
        $stmt->bind_param("sii", $reason, $order_id, $user_id);
        $stmt->execute();
    } elseif ($action == 'submit_extension') {
        $days = intval($_POST['extension_days']);
        $query_rate = "SELECT SUM(i.price_per_day) as total_rate FROM rental_item ri JOIN item i ON ri.item_id = i.item_id WHERE ri.order_id = ?";
        $stmt_rate = $conn->prepare($query_rate);
        $stmt_rate->bind_param("i", $order_id);
        $stmt_rate->execute();
        $row_rate = $stmt_rate->get_result()->fetch_assoc();
        $daily_rate = $row_rate['total_rate'] ?? 0;
        $additional_charge = $daily_rate * $days;

        $stmt = $conn->prepare("UPDATE rental SET extension_days = IFNULL(extension_days, 0) + ?, end_date = DATE_ADD(end_date, INTERVAL ? DAY), total_price = total_price + ? WHERE order_id = ? AND user_id = ?");
        $stmt->bind_param("iidii", $days, $days, $additional_charge, $order_id, $user_id);
        $stmt->execute();
    }

    // AJAX/fetch from React: return JSON and do not redirect
    $is_ajax = !empty($_SERVER['HTTP_X_REQUESTED_WITH']) && strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) === 'xmlhttprequest';
    if ($is_ajax) {
        header('Content-Type: application/json');
        echo json_encode(['success' => true, 'message' => 'Request processed']);
        exit();
    }
    header("Location: returns.php");
    exit();
}

// Fetch only Active and Late rentals for this user
$query = "SELECT r.order_id, r.total_price, r.rental_status, r.extension_days,
                 r.start_date,
                 r.end_date,
                 GROUP_CONCAT(DISTINCT i.item_name SEPARATOR ', ') AS item_names,
                 GROUP_CONCAT(DISTINCT i.image ORDER BY ri.rental_item_id LIMIT 1) AS image,
                 SUM(DISTINCT i.price_per_day) AS daily_rate,
                 (SELECT COUNT(*) FROM rental_item WHERE order_id = r.order_id) AS item_count,
                 DATEDIFF(r.end_date, CURDATE()) AS days_left
          FROM rental r
          JOIN rental_item ri ON r.order_id = ri.order_id
          JOIN item i ON ri.item_id = i.item_id
          WHERE r.user_id = ? AND r.rental_status IN ('Pending Return', 'Late', 'Active')
          GROUP BY r.order_id
          ORDER BY r.order_id DESC";
$stmt = $conn->prepare($query);
$stmt->bind_param("i", $user_id);
$stmt->execute();
$result = $stmt->get_result();

$orders = [];
$active_count = 0;
$pending_count = 0;
$late_count = 0;
while ($row = $result->fetch_assoc()) {
    // Auto-detect late: if end_date has passed, treat as Late regardless of DB status
    $daysLeft = (int)$row['days_left'];
    if ($daysLeft < 0 && $row['rental_status'] === 'Active') {
        $row['effective_status'] = 'Late';
    } else {
        $row['effective_status'] = $row['rental_status'];
    }
    $orders[] = $row;
    if ($row['effective_status'] === 'Active') $active_count++;
    if ($row['effective_status'] === 'Pending Return') $pending_count++;
    if ($row['effective_status'] === 'Late') $late_count++;
}
$total_count = count($orders);
?>

<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Returns & Extensions - RentIt</title>
    <link rel="stylesheet" href="../../shared/css/theme.css">
    <link rel="stylesheet" href="../../shared/css/globals.css">
    <link rel="stylesheet" href="../dashboard/dashboard.css">
    <link rel="stylesheet" href="../myrentals/myrentals.css">
    <link rel="stylesheet" href="returns.css">
    <link rel="icon" type="image/png" href="/rent-it/assets/images/rIT_logo_tp.png">
    <script src="<?= BASE_URL ?>/shared/js/theme.js"></script>
    <style>
        /* Filter tabs */
        .re-filters {
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 16px;
            margin-bottom: 24px;
            flex-wrap: wrap;
        }

        .re-filter-tabs {
            display: flex;
            background: var(--bg-secondary, #f1f5f9);
            border: 1px solid var(--border-color);
            border-radius: 10px;
            padding: 4px;
            overflow-x: auto;
            scrollbar-width: none;
        }

        .re-filter-tabs::-webkit-scrollbar {
            display: none;
        }

        .re-filter-tab {
            padding: 8px 18px;
            border: none;
            background: transparent;
            color: var(--text-secondary);
            font-size: 0.82rem;
            font-weight: 600;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.2s ease;
            white-space: nowrap;
            font-family: inherit;
        }

        .re-filter-tab:hover {
            color: var(--text-primary);
        }

        .re-filter-tab.active {
            background: var(--accent, #E67E22);
            color: white;
        }

        .re-filter-tab .tab-count {
            display: inline-block;
            background: rgba(255, 255, 255, 0.25);
            border-radius: 10px;
            padding: 1px 7px;
            font-size: 0.72rem;
            margin-left: 5px;
        }

        .re-filter-tab.active .tab-count {
            background: rgba(255, 255, 255, 0.35);
        }

        .re-filter-search {
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

        .re-filter-search:focus-within {
            border-color: var(--accent);
            box-shadow: 0 0 0 3px rgba(230, 126, 34, 0.15);
        }

        .re-filter-search svg {
            color: var(--text-muted, #94a3b8);
            flex-shrink: 0;
        }

        .re-filter-search input {
            flex: 1;
            border: none;
            background: transparent;
            color: var(--text-primary);
            font-size: 0.85rem;
            outline: none;
            font-family: inherit;
        }

        .re-filter-search input::placeholder {
            color: var(--text-muted, #94a3b8);
        }

        /* Rental cards */
        .re-card {
            background: var(--bg-card);
            border-radius: 12px;
            padding: 20px;
            border: 1px solid var(--border-color);
            margin-bottom: 16px;
            display: flex;
            gap: 20px;
            align-items: flex-start;
            transition: all 0.2s ease;
        }

        .re-card:hover {
            border-color: var(--accent, #f97316);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        }

        .re-card.late-card {
            border-left: 4px solid #ef4444;
        }

        .re-card-img {
            width: 90px;
            height: 90px;
            object-fit: cover;
            border-radius: 8px;
            border: 1px solid var(--border-color);
            flex-shrink: 0;
        }

        .re-card-body {
            flex: 1;
            min-width: 0;
        }

        .re-card-body h4 {
            margin: 0 0 6px;
            color: var(--text-primary);
            font-size: 0.95rem;
        }

        .re-card-meta {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 6px;
            font-size: 0.82rem;
        }

        .re-card-meta p {
            margin: 2px 0;
            color: var(--text-secondary);
        }

        .re-card-meta strong {
            color: var(--text-primary);
            font-weight: 600;
        }

        .re-card-price {
            margin-top: 10px;
            font-size: 0.95rem;
            color: #f97316;
            font-weight: 700;
        }

        .re-card-order-id {
            font-size: 0.75rem;
            color: #94a3b8;
            margin-top: 4px;
        }

        .re-card-right {
            display: flex;
            flex-direction: column;
            align-items: flex-end;
            gap: 8px;
            min-width: 160px;
        }

        .re-card-actions {
            display: flex;
            gap: 8px;
            margin-top: 8px;
        }

        .re-btn {
            display: inline-flex;
            align-items: center;
            gap: 5px;
            padding: 7px 14px;
            font-size: 0.78rem;
            font-weight: 600;
            border-radius: 8px;
            cursor: pointer;
            border: none;
            transition: all 0.15s ease;
            font-family: inherit;
        }

        .re-btn-extend {
            background: rgba(59, 130, 246, 0.12);
            color: #3b82f6;
        }

        .re-btn-extend:hover {
            background: rgba(59, 130, 246, 0.22);
        }

        .re-btn-return {
            background: rgba(245, 158, 11, 0.12);
            color: #d97706;
        }

        .re-btn-return:hover {
            background: rgba(245, 158, 11, 0.22);
        }

        .re-status-pill {
            padding: 5px 12px;
            border-radius: 50px;
            font-size: 0.72rem;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.3px;
            display: inline-block;
        }

        .re-status-pill.pending {
            background: #fdf4ff;
            color: #86198f;
            border: 1px solid #e879f9;
        }

        .re-status-pill.active {
            background: #ecfdf5;
            color: #065f46;
            border: 1px solid #6ee7b7;
        }

        .re-status-pill.late {
            background: #fef2f2;
            color: #dc2626;
            border: 1px solid #f87171;
        }

        .re-days-left {
            font-size: 0.72rem;
            color: var(--text-secondary);
            margin-top: 4px;
        }

        .re-days-left.overdue {
            color: #dc2626;
            font-weight: 600;
        }

        .re-count-badge {
            font-size: 0.82rem;
            color: var(--text-secondary);
            margin-bottom: 16px;
        }

        .re-count-badge strong {
            color: var(--text-primary);
        }

        .re-empty {
            text-align: center;
            padding: 60px 20px;
            background: var(--bg-secondary);
            border-radius: 12px;
            border: 2px dashed var(--border-color);
        }

        .re-empty p {
            color: var(--text-secondary);
            margin: 8px 0;
        }

        /* Modal styles */
        .re-modal-overlay {
            display: none;
            position: fixed;
            z-index: 9999;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            align-items: center;
            justify-content: center;
        }

        .re-modal-overlay.show {
            display: flex;
        }

        .re-modal {
            background: var(--bg-card, white);
            padding: 28px;
            border-radius: 14px;
            width: 90%;
            max-width: 420px;
            position: relative;
        }

        .re-modal h3 {
            margin: 0 0 6px;
            color: var(--text-primary);
        }

        .re-modal p.subtitle {
            font-size: 0.88rem;
            color: var(--text-secondary, #64748b);
            margin: 0 0 18px;
        }

        .re-modal label {
            display: block;
            margin-bottom: 5px;
            font-weight: 600;
            font-size: 0.88rem;
            color: var(--text-primary);
        }

        .re-modal textarea,
        .re-modal select {
            width: 100%;
            padding: 10px;
            border: 1px solid var(--border-color, #ddd);
            border-radius: 8px;
            font-family: inherit;
            font-size: 0.88rem;
            background: var(--bg-secondary, #f8fafc);
            color: var(--text-primary);
        }

        .re-modal textarea {
            height: 80px;
            resize: vertical;
        }

        .re-modal-actions {
            display: flex;
            justify-content: flex-end;
            gap: 10px;
            margin-top: 18px;
        }

        .re-modal-cancel {
            padding: 8px 16px;
            border: 1px solid var(--border-color, #e2e8f0);
            background: var(--bg-secondary, #f1f5f9);
            border-radius: 8px;
            cursor: pointer;
            font-family: inherit;
            color: var(--text-primary);
        }

        .re-modal-submit {
            padding: 8px 16px;
            border: none;
            background: var(--accent, #f97316);
            color: white;
            border-radius: 8px;
            cursor: pointer;
            font-weight: 600;
            font-family: inherit;
        }

        .re-ext-summary {
            background: var(--bg-secondary, #f0f9ff);
            border: 1px solid var(--border-color, #bfdbfe);
            border-radius: 8px;
            padding: 12px;
            margin-top: 12px;
            font-size: 0.85rem;
        }

        .re-ext-summary .rate {
            color: var(--text-secondary);
        }

        .re-ext-summary .total {
            font-size: 1rem;
            font-weight: 700;
            color: #f97316;
            margin-top: 6px;
        }

        @media (max-width: 768px) {
            .re-filters {
                flex-direction: column;
                align-items: stretch;
            }

            .re-filter-search {
                max-width: 100%;
            }

            .re-card {
                flex-direction: column;
            }

            .re-card-img {
                width: 100%;
                height: 140px;
            }

            .re-card-right {
                align-items: flex-start;
                min-width: auto;
            }
        }
    </style>
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
                        </div>
                        <div class="page-skeleton-row">
                            <span class="page-skeleton-line skeleton-shape w-40 page-skeleton-block"></span>
                            <span class="page-skeleton-line skeleton-shape w-30 page-skeleton-block"></span>
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
                        <h1 class="page-title">Returns & Extensions</h1>
                        <p class="page-subtitle">Manage your active and late rentals — extend duration or request a return</p>
                    </div>
                </div>

                <div class="rentals-tabs">
                    <a href="<?= BASE_URL ?>/client/myrentals/pending.php" class="tab-link">Pending Rentals</a>
                    <a href="../myrentals/myrentals.php" class="tab-link">Active Rentals</a>
                    <a href="returns.php" class="tab-link active">Returns & Extensions</a>
                    <a href="../bookinghistory/bookinghistory.php" class="tab-link">Booking History</a>
                </div>

                <!-- Stats Row -->
                <div class="stats-row">
                    <div class="stat-card">
                        <div class="stat-icon completed"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="22" height="22">
                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                <polyline points="22 4 12 14.01 9 11.01" />
                            </svg></div>
                        <div class="stat-info">
                            <span class="stat-value"><?= $active_count ?></span>
                            <span class="stat-label">Active</span>
                        </div>
                    </div>

                    <div class="stat-card">
                        <div class="stat-icon" style="background: rgba(239,68,68,0.15); color: #ef4444;"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="22" height="22">
                                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                                <line x1="12" y1="9" x2="12" y2="13" />
                                <line x1="12" y1="17" x2="12.01" y2="17" />
                            </svg></div>
                        <div class="stat-info">
                            <span class="stat-value"><?= $late_count ?></span>
                            <span class="stat-label">Late / Overdue</span>
                        </div>
                    </div>

                    <div class="stat-card">
                        <div class="stat-icon pending"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="22" height="22">
                                <circle cx="12" cy="12" r="10" />
                                <polyline points="12 6 12 12 16 14" />
                            </svg></div>
                        <div class="stat-info">
                            <span class="stat-value"><?= $pending_count ?></span>
                            <span class="stat-label">Pending Return</span>
                        </div>
                    </div>
                </div>

                <!-- Filter Tabs -->
                <div class="re-filters">
                    <div class="re-filter-tabs">
                        <button class="re-filter-tab active" data-filter="all">All <span class="tab-count"><?= $total_count ?></span></button>
                        <button class="re-filter-tab" data-filter="Active">Active <span class="tab-count"><?= $active_count ?></span></button>
                        <button class="re-filter-tab" data-filter="Pending Return">Pending Return <span class="tab-count"><?= $pending_count ?></span></button>
                        <button class="re-filter-tab" data-filter="Late">Late <span class="tab-count"><?= $late_count ?></span></button>
                    </div>
                    <div class="re-filter-search">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                            <circle cx="11" cy="11" r="8" />
                            <line x1="21" y1="21" x2="16.65" y2="16.65" />
                        </svg>
                        <input type="text" id="reSearchInput" placeholder="Search by order ID or item..." />
                    </div>
                </div>

                <div class="re-count-badge" id="reCountBadge"></div>

                <!-- Order Cards -->
                <section id="reCardsList">
                    <?php if ($total_count > 0): ?>
                        <?php foreach ($orders as $order):
                            $status = $order['effective_status'];
                            $isLate = ($status === 'Late');
                            $daysLeft = (int)$order['days_left'];
                            $dailyRate = (float)$order['daily_rate'];
                        ?>
                            <div class="re-card <?= $isLate ? 'late-card' : '' ?>" data-status="<?= htmlspecialchars($status) ?>">
                                <img src="<?= BASE_URL ?>/assets/images/items/<?= htmlspecialchars($order['image']) ?>"
                                    alt="Item" class="re-card-img"
                                    onerror="this.src='<?= BASE_URL ?>/assets/images/catalog-fallback.svg'">

                                <div class="re-card-body">
                                    <h4><?= htmlspecialchars($order['item_names']) ?></h4>
                                    <div class="re-card-meta">
                                        <p>Start: <strong><?= date('M d, Y', strtotime($order['start_date'])) ?></strong></p>
                                        <p>End: <strong><?= date('M d, Y', strtotime($order['end_date'])) ?></strong></p>
                                        <p>Items: <strong><?= $order['item_count'] ?></strong></p>
                                        <?php if ($order['extension_days'] > 0): ?>
                                            <p>Extended: <strong>+<?= $order['extension_days'] ?> day(s)</strong></p>
                                        <?php endif; ?>
                                    </div>
                                    <div class="re-card-price">₱<?= number_format($order['total_price'], 2) ?></div>
                                    <div class="re-card-order-id">Order #<?= $order['order_id'] ?> &middot; ₱<?= number_format($dailyRate, 2) ?>/day</div>
                                </div>

                                <div class="re-card-right">
                                    <?php
                                    if ($status === 'Active') {
                                        $pillClass = 'active';
                                        $pillText  = 'Active';
                                    } elseif ($isLate) {
                                        $pillClass = 'late';
                                        $pillText  = 'Late';
                                    } else {
                                        $pillClass = 'pending';
                                        $pillText  = 'Pending Return';
                                    }
                                    ?>
                                    <span class="re-status-pill <?= $pillClass ?>">
                                        <?= $pillText ?>
                                    </span>
                                    <?php if ($isLate): ?>
                                        <span class="re-days-left overdue"><?= abs($daysLeft) ?> day(s) overdue</span>
                                    <?php else: ?>
                                        <span class="re-days-left"><?= $daysLeft ?> day(s) left</span>
                                    <?php endif; ?>
                                    <div class="re-card-actions">
                                        <button class="re-btn re-btn-extend" onclick="openExtendModal(<?= $order['order_id'] ?>, <?= $dailyRate ?>)">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
                                                <circle cx="12" cy="12" r="10" />
                                                <polyline points="12 6 12 12 16 14" />
                                            </svg>
                                            Extend
                                        </button>
                                        <button class="re-btn re-btn-return" onclick="openReturnModal(<?= $order['order_id'] ?>)">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
                                                <polyline points="1 4 1 10 7 10" />
                                                <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
                                            </svg>
                                            Return
                                        </button>
                                    </div>
                                </div>
                            </div>
                        <?php endforeach; ?>
                    <?php else: ?>
                        <div class="re-empty" id="reEmptyDefault">
                            <p style="font-size: 1.5rem;">📦</p>
                            <h3 style="color: var(--text-primary); margin: 0;">No active or late rentals</h3>
                            <p>Once you have active rentals, you can extend or return them here.</p>
                            <a href="../catalog/catalog.php" style="color: #f97316; text-decoration: none; font-weight: 600;">Browse Catalog →</a>
                        </div>
                    <?php endif; ?>
                </section>

                <div class="re-empty" id="reFilterEmpty" style="display: none;">
                    <p style="font-size: 1.5rem;">🔍</p>
                    <h3 style="color: var(--text-primary); margin: 0;">No orders match your filter</h3>
                    <p>Try a different filter or search term.</p>
                </div>
            </div>

            <div id="footerContainer"></div>
        </main>
    </div>

    <!-- Return Modal -->
    <div class="re-modal-overlay" id="returnModal">
        <div class="re-modal">
            <h3>Request Return</h3>
            <p class="subtitle">Provide a reason for returning the item.</p>
            <form method="POST" action="returns.php">
                <input type="hidden" name="order_id" id="returnOrderId">
                <input type="hidden" name="action" value="submit_return">
                <div style="margin-bottom: 12px;">
                    <label>Reason:</label>
                    <textarea name="return_reason" required placeholder="e.g. Done using, event ended..."></textarea>
                </div>
                <div class="re-modal-actions">
                    <button type="button" class="re-modal-cancel" onclick="closeModal('returnModal')">Cancel</button>
                    <button type="submit" class="re-modal-submit">Submit Return</button>
                </div>
            </form>
        </div>
    </div>

    <!-- Extend Modal -->
    <div class="re-modal-overlay" id="extendModal">
        <div class="re-modal">
            <h3>Extend Rental</h3>
            <p class="subtitle">Choose how many days to extend your rental.</p>
            <form method="POST" action="returns.php">
                <input type="hidden" name="order_id" id="extendOrderId">
                <input type="hidden" name="action" value="submit_extension">
                <div style="margin-bottom: 12px;">
                    <label>Extend for:</label>
                    <select name="extension_days" id="extendDaysSelect" onchange="updateExtendSummary()">
                        <option value="1">1 Day</option>
                        <option value="2">2 Days</option>
                        <option value="3">3 Days</option>
                        <option value="5">5 Days</option>
                        <option value="7">7 Days</option>
                    </select>
                </div>
                <div class="re-ext-summary">
                    <div class="rate">Rate: <strong id="extRateDisplay">₱0.00</strong> / day</div>
                    <div class="total">Additional Cost: <span id="extTotalDisplay">₱0.00</span></div>
                </div>
                <div class="re-modal-actions">
                    <button type="button" class="re-modal-cancel" onclick="closeModal('extendModal')">Cancel</button>
                    <button type="submit" class="re-modal-submit">Confirm Extension</button>
                </div>
            </form>
        </div>
    </div>

    <script src="../../shared/js/components.js"></script>
    <script>
        let currentExtendRate = 0;

        document.addEventListener('DOMContentLoaded', function() {
            if (typeof Components !== 'undefined') {
                Components.injectSidebar('sidebarContainer', 'returns', 'client');
                Components.injectTopbar('topbarContainer', 'Returns & Extensions');
                Components.injectFooter('footerContainer');
            }

            const allCards = Array.from(document.querySelectorAll('.re-card'));
            const filterTabs = document.querySelectorAll('.re-filter-tab');
            const searchInput = document.getElementById('reSearchInput');
            const countBadge = document.getElementById('reCountBadge');
            const cardsList = document.getElementById('reCardsList');
            const filterEmpty = document.getElementById('reFilterEmpty');

            function getActiveFilter() {
                const tab = document.querySelector('.re-filter-tab.active');
                return tab ? tab.dataset.filter : 'all';
            }

            function filterCards() {
                const status = getActiveFilter();
                const search = (searchInput?.value || '').toLowerCase().trim();
                let visible = 0;

                allCards.forEach(card => {
                    const cardStatus = card.dataset.status;
                    const text = card.textContent.toLowerCase();
                    const matchStatus = (status === 'all') || (cardStatus === status);
                    const matchSearch = !search || text.includes(search);

                    if (matchStatus && matchSearch) {
                        card.style.display = '';
                        visible++;
                    } else {
                        card.style.display = 'none';
                    }
                });

                if (allCards.length > 0) {
                    cardsList.style.display = visible === 0 ? 'none' : '';
                    filterEmpty.style.display = visible === 0 ? '' : 'none';
                }

                if (countBadge) {
                    const label = status === 'all' ? 'All' : document.querySelector('.re-filter-tab.active')?.textContent.trim().split(' ')[0] || status;
                    countBadge.innerHTML = 'Showing <strong>' + visible + '</strong> of <strong>' + allCards.length + '</strong> rentals' + (status !== 'all' ? ' &mdash; <strong>' + label + '</strong>' : '');
                }
            }

            filterTabs.forEach(tab => {
                tab.addEventListener('click', function() {
                    filterTabs.forEach(t => t.classList.remove('active'));
                    this.classList.add('active');
                    filterCards();
                });
            });

            if (searchInput) {
                let debounce;
                searchInput.addEventListener('input', () => {
                    clearTimeout(debounce);
                    debounce = setTimeout(filterCards, 250);
                });
            }

            filterCards();
        });

        function openReturnModal(orderId) {
            document.getElementById('returnOrderId').value = orderId;
            document.getElementById('returnModal').classList.add('show');
        }

        function openExtendModal(orderId, rate) {
            currentExtendRate = rate;
            document.getElementById('extendOrderId').value = orderId;
            document.getElementById('extendDaysSelect').value = '1';
            updateExtendSummary();
            document.getElementById('extendModal').classList.add('show');
        }

        function updateExtendSummary() {
            const days = parseInt(document.getElementById('extendDaysSelect').value) || 1;
            const total = currentExtendRate * days;
            document.getElementById('extRateDisplay').textContent = '₱' + currentExtendRate.toLocaleString(undefined, {
                minimumFractionDigits: 2
            });
            document.getElementById('extTotalDisplay').textContent = '₱' + total.toLocaleString(undefined, {
                minimumFractionDigits: 2
            });
        }

        function closeModal(id) {
            document.getElementById(id).classList.remove('show');
        }

        // Close modal on overlay click
        document.querySelectorAll('.re-modal-overlay').forEach(el => {
            el.addEventListener('click', function(e) {
                if (e.target === this) this.classList.remove('show');
            });
        });
    </script>
</body>

</html>