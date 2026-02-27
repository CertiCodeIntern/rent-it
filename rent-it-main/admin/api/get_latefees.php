<?php
/**
 * GET LATE FEES API
 * Fetches overdue rentals with calculated late fees
 * Uses item.price_per_day as the daily late fee rate
 * 
 * Optional query params:
 *   order_id - Filter by specific order
 */

// Database connection (config.php already starts session)
require_once __DIR__ . '/../../config.php';

header('Content-Type: application/json');

// Check admin auth
if (!isset($_SESSION['admin_logged_in']) || $_SESSION['admin_logged_in'] !== true) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit();
}

// Optional filter by order_id
$orderFilter = '';
$params = [];
$types = '';

if (isset($_GET['order_id']) && !empty($_GET['order_id'])) {
    $orderFilter = ' AND r.order_id = ?';
    $params[] = intval($_GET['order_id']);
    $types .= 'i';
}

// ──────────────────────────────────────────────
// Query overdue rentals
// A rental is overdue when: end_date < TODAY
// and status is NOT Returned/Completed/Cancelled
// ──────────────────────────────────────────────
$sql = "
        SELECT 
            r.order_id,
            r.user_id,
            r.rental_status,
            r.total_price,
            r.late_fee AS stored_late_fee,
            r.start_date,
            r.end_date,
            r.venue,
            r.customer_address,
            DATEDIFF(CURDATE(), r.end_date) AS days_overdue,
            u.full_name AS customer_name,
            u.email AS customer_email,
            u.phone AS customer_phone
        FROM rental r
        JOIN users u ON r.user_id = u.id
        WHERE r.end_date < CURDATE()
          AND r.rental_status NOT IN ('Returned', 'Completed', 'Cancelled')
          {$orderFilter}
        ORDER BY DATEDIFF(CURDATE(), r.end_date) DESC
    ";

if (!empty($params)) {
    $stmt = mysqli_prepare($conn, $sql);
    mysqli_stmt_bind_param($stmt, $types, ...$params);
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);
} else {
    $result = mysqli_query($conn, $sql);
}

if (!$result) {
    echo json_encode(['success' => false, 'message' => 'Database error: ' . mysqli_error($conn)]);
    exit;
}

$overdueRentals = [];
$totalOutstanding = 0;

while ($row = mysqli_fetch_assoc($result)) {
    $orderId = $row['order_id'];
    $daysOverdue = max(0, intval($row['days_overdue']));

    // Fetch items for this rental
    $itemSql = "
            SELECT 
                ri.item_id,
                ri.item_price,
                ri.item_status,
                i.item_name,
                i.price_per_day,
                i.category,
                i.status AS item_current_status
            FROM rental_item ri
            JOIN item i ON ri.item_id = i.item_id
            WHERE ri.order_id = ?
        ";

    $itemStmt = mysqli_prepare($conn, $itemSql);
    mysqli_stmt_bind_param($itemStmt, 'i', $orderId);
    mysqli_stmt_execute($itemStmt);
    $itemResult = mysqli_stmt_get_result($itemStmt);

    $items = [];
    $calculatedLateFee = 0;

    while ($item = mysqli_fetch_assoc($itemResult)) {
        $itemLateFee = $daysOverdue * floatval($item['price_per_day']);
        $calculatedLateFee += $itemLateFee;

        $items[] = [
            'item_id'        => $item['item_id'],
            'item_name'      => $item['item_name'],
            'category'       => $item['category'],
            'price_per_day'  => floatval($item['price_per_day']),
            'item_price'     => floatval($item['item_price']),
            'late_fee_per_day' => floatval($item['price_per_day']),
            'item_late_fee'  => $itemLateFee,
            'item_status'    => $item['item_status']
        ];
    }
    mysqli_stmt_close($itemStmt);

    // Use the calculated late fee (daily rate × days overdue per item)
    $lateFee = $calculatedLateFee;
    $totalOutstanding += $lateFee;

    // Determine priority level based on days overdue
    $priority = 'mild';
    if ($daysOverdue >= 7) {
        $priority = 'critical';
    } elseif ($daysOverdue >= 4) {
        $priority = 'warning';
    }

    // Build order ID display format
    $orderIdFormatted = 'ORD-' . str_pad($orderId, 4, '0', STR_PAD_LEFT);

    $overdueRentals[] = [
        'order_id'          => $orderId,
        'order_id_formatted' => $orderIdFormatted,
        'customer' => [
            'id'    => $row['user_id'],
            'name'  => $row['customer_name'],
            'email' => $row['customer_email'],
            'phone' => $row['customer_phone']
        ],
        'items'             => $items,
        'rental_status'     => $row['rental_status'],
        'start_date'        => $row['start_date'],
        'end_date'          => $row['end_date'],
        'days_overdue'      => $daysOverdue,
        'late_fee'          => $lateFee,
        'stored_late_fee'   => floatval($row['stored_late_fee']),
        'total_price'       => floatval($row['total_price']),
        'priority'          => $priority,
        'venue'             => $row['venue'],
        'customer_address'  => $row['customer_address']
    ];
}

// ──────────────────────────────────────────────
// Stats - collected late fees (from returned/completed orders this month)
// ──────────────────────────────────────────────
$collectedSql = "
        SELECT COALESCE(SUM(late_fee), 0) AS collected
        FROM rental
        WHERE rental_status IN ('Returned', 'Completed')
          AND late_fee > 0
          AND MONTH(end_date) = MONTH(CURDATE())
          AND YEAR(end_date) = YEAR(CURDATE())
    ";
$collectedResult = mysqli_query($conn, $collectedSql);
$collected = $collectedResult ? floatval(mysqli_fetch_assoc($collectedResult)['collected']) : 0;

// Penalty tracker - reminders sent today
$remindersSql = "
        SELECT COUNT(*) AS cnt
        FROM penalty_tracker
        WHERE DATE(issued_date) = CURDATE()
    ";
$remindersResult = mysqli_query($conn, $remindersSql);
$remindersSent = $remindersResult ? intval(mysqli_fetch_assoc($remindersResult)['cnt']) : 0;

// Response
echo json_encode([
    'success' => true,
    'overdue'  => $overdueRentals,
    'stats'    => [
        'total_outstanding' => $totalOutstanding,
        'overdue_count'     => count($overdueRentals),
        'collected_month'   => $collected,
        'reminders_sent'    => $remindersSent
    ]
]);
