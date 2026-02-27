<?php
session_start();
include '../../shared/php/db_connection.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Credentials: true');

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode([
        'success' => false,
        'message' => 'Unauthorized'
    ]);
    exit();
}

$user_id = $_SESSION['user_id'];

if (!isset($conn) || !$conn) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database unavailable']);
    exit();
}

try {

    $activeQuery = "
    SELECT 
        r.order_id,
        r.order_id AS rental_code, 
        i.item_name AS name,
        i.price_per_day AS daily_rate,
        COALESCE(ri.start_date, r.start_date) AS start_date,
        COALESCE(ri.end_date, r.end_date) AS end_date,
        r.rental_status AS status,
        i.image AS image,
        (DATEDIFF(COALESCE(ri.end_date, r.end_date), CURDATE()) + 1) AS days_left
    FROM rental r
    LEFT JOIN rental_item ri ON r.order_id = ri.order_id
    LEFT JOIN item i ON ri.item_id = i.item_id 
    WHERE r.user_id = ?
    AND r.rental_status IN ('Booked', 'In Transit', 'Active')
    ";

    $stmtActive = $conn->prepare($activeQuery);
    $stmtActive->bind_param("i", $user_id);
    $stmtActive->execute();
    $resultActive = $stmtActive->get_result();
    $activeRentals = $resultActive->fetch_all(MYSQLI_ASSOC);


    $historyQuery = "
    SELECT 
        r.order_id,
        r.order_id AS rental_code,
        GROUP_CONCAT(i.item_name SEPARATOR ', ') AS name,
        MAX(i.image) AS image,
        MIN(COALESCE(ri.start_date, r.start_date)) AS start_date,
        MAX(COALESCE(ri.end_date, r.end_date)) AS end_date,
        r.rental_status AS rental_status,
        r.return_reason AS return_reason,
        r.total_price AS total_amount
    FROM rental r
    LEFT JOIN rental_item ri ON r.order_id = ri.order_id
    LEFT JOIN item i ON ri.item_id = i.item_id
    WHERE r.user_id = ?
    GROUP BY r.order_id
    ORDER BY r.order_id DESC;
    ";

    $stmtHistory = $conn->prepare($historyQuery);
    $stmtHistory->bind_param("i", $user_id);
    $stmtHistory->execute();
    $resultHistory = $stmtHistory->get_result();
    $history = $resultHistory->fetch_all(MYSQLI_ASSOC);

    $pendingQuery = "SELECT 
                        r.order_id, 
                        r.total_price, 
                        r.rental_status,    
                        COALESCE(ri.start_date, r.start_date) AS start_date, 
                        COALESCE(ri.end_date, r.end_date) AS end_date, 
                        i.image,
                        i.item_name,
                        (DATEDIFF(COALESCE(ri.end_date, r.end_date), COALESCE(ri.start_date, r.start_date)) + 1) AS rental_days,
                        (SELECT COUNT(*) FROM rental_item WHERE order_id = r.order_id) AS item_count 
                      FROM rental r
                      JOIN rental_item ri ON r.order_id = ri.order_id
                      JOIN item i ON ri.item_id = i.item_id
                      WHERE r.user_id = ? AND r.rental_status = 'Pending'
                      GROUP BY r.order_id 
                      ORDER BY COALESCE(ri.start_date, r.start_date) DESC";
    $stmtPending = $conn->prepare($pendingQuery);
    $stmtPending->bind_param("i", $user_id);
    $stmtPending->execute();
    $resultPending = $stmtPending->get_result();
    $pending = $resultPending->fetch_all(MYSQLI_ASSOC);

    echo json_encode([
        'success' => true,
        'active' => $activeRentals,
        'history' => $history,
        'pending' => $pending
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
