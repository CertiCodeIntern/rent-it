<?php
session_start();

// Check admin authentication
if (!isset($_SESSION['admin_logged_in']) || $_SESSION['admin_logged_in'] !== true) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit();
}

require_once __DIR__ . '/../../config.php';

header('Content-Type: application/json');

// Get JSON input
$input = json_decode(file_get_contents('php://input'), true);

if (!$input || !isset($input['order_id']) || !isset($input['status'])) {
    echo json_encode(['success' => false, 'message' => 'Missing required parameters']);
    exit;
}

$orderId = intval($input['order_id']);
$newStatus = mysqli_real_escape_string($conn, $input['status']);

// Valid status values
$validStatuses = ['Pending', 'Booked', 'Confirmed', 'In Transit', 'Active', 'Pending Return', 'Returned', 'Completed', 'Cancelled', 'Late'];

if (!in_array($newStatus, $validStatuses)) {
    echo json_encode(['success' => false, 'message' => 'Invalid status value']);
    exit;
}

// Get user_id for this order to send notification
$userQuery = "SELECT user_id FROM rental WHERE order_id = ?";
$stmtUser = mysqli_prepare($conn, $userQuery);
mysqli_stmt_bind_param($stmtUser, "i", $orderId);
mysqli_stmt_execute($stmtUser);
$userResult = mysqli_stmt_get_result($stmtUser);
$userData = mysqli_fetch_assoc($userResult);
$userId = $userData ? $userData['user_id'] : null;

// Update the order status
$updateQuery = "UPDATE rental SET rental_status = ? WHERE order_id = ?";
$stmt = mysqli_prepare($conn, $updateQuery);
mysqli_stmt_bind_param($stmt, "si", $newStatus, $orderId);

if (mysqli_stmt_execute($stmt)) {
    // Also update rental_item status if needed
    $itemStatus = 'Reserved';
    switch ($newStatus) {
        case 'Confirmed':
            $itemStatus = 'Confirmed';
            break;
        case 'In Transit':
            $itemStatus = 'In Transit';
            break;
        case 'Active':
            $itemStatus = 'Rented';
            break;
        case 'Pending Return':
            $itemStatus = 'Pending Return';
            break;
        case 'Late':
            $itemStatus = 'Late';
            break;
        case 'Returned':
        case 'Completed':
            $itemStatus = 'Returned';
            break;
        case 'Cancelled':
            $itemStatus = 'Cancelled';
            break;
    }
    
    $updateItemsQuery = "UPDATE rental_item SET item_status = ? WHERE order_id = ?";
    $stmtItems = mysqli_prepare($conn, $updateItemsQuery);
    mysqli_stmt_bind_param($stmtItems, "si", $itemStatus, $orderId);
    mysqli_stmt_execute($stmtItems);
    
    // Update item availability status if returned or cancelled
    if ($newStatus === 'Returned' || $newStatus === 'Completed' || $newStatus === 'Cancelled') {
        // Get all items in this order to recalculate their available_units
        $getItemsQuery = "SELECT DISTINCT item_id FROM rental_item WHERE order_id = ?";
        $stmtGetItems = mysqli_prepare($conn, $getItemsQuery);
        mysqli_stmt_bind_param($stmtGetItems, "i", $orderId);
        mysqli_stmt_execute($stmtGetItems);
        $itemsResult = mysqli_stmt_get_result($stmtGetItems);
        
        // Recalculate available_units for each item based on actual rentals (sum quantities)
        $recalcStmt = mysqli_prepare($conn, "
            UPDATE item i
            SET available_units = (
                i.total_units - i.repairing_units - COALESCE((
                    SELECT SUM(ri.quantity) 
                    FROM rental_item ri 
                    JOIN rental r ON ri.order_id = r.order_id 
                    WHERE ri.item_id = i.item_id 
                    AND r.rental_status IN ('Pending', 'Booked', 'Confirmed', 'In Transit', 'Active', 'Pending Return', 'Late')
                ), 0)
            )
            WHERE item_id = ?
        ");
        
        while ($itemRow = mysqli_fetch_assoc($itemsResult)) {
            mysqli_stmt_bind_param($recalcStmt, "i", $itemRow['item_id']);
            mysqli_stmt_execute($recalcStmt);
        }
        mysqli_stmt_close($recalcStmt);
        mysqli_stmt_close($stmtGetItems);
        
        // Also update item status to Available if all units are returned
        $updateAvailQuery = "UPDATE item i 
                            INNER JOIN rental_item ri ON i.item_id = ri.item_id 
                            SET i.status = 'Available' 
                            WHERE ri.order_id = ? AND i.available_units > 0";
        $stmtAvail = mysqli_prepare($conn, $updateAvailQuery);
        mysqli_stmt_bind_param($stmtAvail, "i", $orderId);
        mysqli_stmt_execute($stmtAvail);
    }
// Insert notification for the client
if ($userId) {
    $notifTitle = "Order Status Updated";
    $notifMessage = "Your order #$orderId is now $newStatus.";
    $notifType = "order_status_updated";
    $notifLink = "/rent-it/client/dashboard/index.php?order_id=$orderId";
    
    // Dagdagan natin ng 'created_at' kung manual ang table mo, 
    // pero kung auto-timestamp ito, okay na yung query sa ibaba.
    $notifQuery = "INSERT INTO notifications (user_id, title, message, type, link_url, is_read, created_at) VALUES (?, ?, ?, ?, ?, 0, NOW())";
    $stmtNotif = mysqli_prepare($conn, $notifQuery);
    mysqli_stmt_bind_param($stmtNotif, "issss", $userId, $notifTitle, $notifMessage, $notifType, $notifLink);
    
    if (!mysqli_stmt_execute($stmtNotif)) {
         // Kung ayaw pumasok, i-check natin ang database error
         error_log("Notification Insert Failed: " . mysqli_error($conn));
    }
} else {
    // Kung walang nakuha na userId mula sa rental table
    error_log("Notification skipped: No userId found for order #$orderId");
}
}

mysqli_close($conn);
?>
