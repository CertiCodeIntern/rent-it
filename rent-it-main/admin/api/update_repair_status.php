<?php
/**
 * Update Repair Status API
 * Updates a repair ticket's status and optionally the item's status
 */
session_start();

if (!isset($_SESSION['admin_logged_in']) || $_SESSION['admin_logged_in'] !== true) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit();
}

require_once __DIR__ . '/../../config.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit();
}

$data = json_decode(file_get_contents('php://input'));

if (!$data || !isset($data->repair_id) || !isset($data->action)) {
    echo json_encode(['success' => false, 'message' => 'Missing repair_id or action']);
    exit();
}

$repair_id = intval($data->repair_id);
$action = trim($data->action);

// Get the repair record to find item_id and quantity
$get_stmt = $conn->prepare("SELECT item_id, quantity FROM repair WHERE repair_id = ?");
$get_stmt->bind_param("i", $repair_id);
$get_stmt->execute();
$get_result = $get_stmt->get_result();
$repair = $get_result->fetch_assoc();
$get_stmt->close();

if (!$repair) {
    echo json_encode(['success' => false, 'message' => 'Repair ticket not found']);
    exit();
}

$item_id = $repair['item_id'];
$ticket_quantity = intval($repair['quantity'] ?? 1);

/**
 * Helper: recalculate available_units for an item
 */
function recalcAvailable($conn, $item_id) {
    $q = "SELECT total_units, repairing_units FROM item WHERE item_id = ?";
    $s = $conn->prepare($q);
    $s->bind_param("i", $item_id);
    $s->execute();
    $row = $s->get_result()->fetch_assoc();
    $s->close();
    if (!$row) return;

    $total = intval($row['total_units']);
    $repairing = intval($row['repairing_units']);

    $rq = "SELECT COALESCE(SUM(ri.quantity), 0) as rented FROM rental_item ri 
           JOIN rental r ON ri.order_id = r.order_id 
           WHERE ri.item_id = ? AND r.rental_status IN ('Pending','Booked','Confirmed','In Transit','Active','Pending Return','Late')";
    $rs = $conn->prepare($rq);
    $rs->bind_param("i", $item_id);
    $rs->execute();
    $rented = intval($rs->get_result()->fetch_assoc()['rented']);
    $rs->close();

    $available = max(0, $total - $rented - $repairing);
    $u = $conn->prepare("UPDATE item SET available_units = ? WHERE item_id = ?");
    $u->bind_param("ii", $available, $item_id);
    $u->execute();
    $u->close();
}

switch ($action) {
    case 'complete':
        // Accept units_repaired for partial completion
        $units_repaired = isset($data->units_repaired) ? intval($data->units_repaired) : $ticket_quantity;
        if ($units_repaired < 1) $units_repaired = 1;
        if ($units_repaired > $ticket_quantity) $units_repaired = $ticket_quantity;

        $remaining = $ticket_quantity - $units_repaired;

        if ($remaining > 0) {
            // Partial completion: reduce ticket quantity, keep in-progress
            $stmt = $conn->prepare("UPDATE repair SET quantity = ? WHERE repair_id = ?");
            $stmt->bind_param("ii", $remaining, $repair_id);
            $stmt->execute();
            $stmt->close();
        } else {
            // Fully completed
            $new_status = 'completed';
            $stmt = $conn->prepare("UPDATE repair SET status = ?, quantity = ? WHERE repair_id = ?");
            $zero = 0;
            $stmt->bind_param("sii", $new_status, $ticket_quantity, $repair_id);
            $stmt->execute();
            $stmt->close();
        }

        // Decrease repairing_units on the item
        if ($item_id) {
            $dec_stmt = $conn->prepare("UPDATE item SET repairing_units = GREATEST(repairing_units - ?, 0) WHERE item_id = ?");
            $dec_stmt->bind_param("ii", $units_repaired, $item_id);
            $dec_stmt->execute();
            $dec_stmt->close();

            // Recalculate available_units
            recalcAvailable($conn, $item_id);

            // If no more repairing_units, set item status back to Available
            $check = $conn->prepare("SELECT repairing_units FROM item WHERE item_id = ?");
            $check->bind_param("i", $item_id);
            $check->execute();
            $checkResult = $check->get_result()->fetch_assoc();
            $check->close();
            if (intval($checkResult['repairing_units']) === 0) {
                $avail = 'Available';
                $s = $conn->prepare("UPDATE item SET status = ? WHERE item_id = ?");
                $s->bind_param("si", $avail, $item_id);
                $s->execute();
                $s->close();
            }
        }

        $msg = $remaining > 0
            ? "Marked {$units_repaired} unit(s) as repaired. {$remaining} still repairing."
            : 'Repair marked as completed';
        echo json_encode(['success' => true, 'message' => $msg]);
        break;

    case 'available':
        // Complete and return all units to available pool
        $stmt = $conn->prepare("DELETE FROM repair WHERE repair_id = ?");
        $stmt->bind_param("i", $repair_id);
        $stmt->execute();
        $stmt->close();

        if ($item_id) {
            // Decrease repairing_units by the ticket quantity
            $dec_stmt = $conn->prepare("UPDATE item SET repairing_units = GREATEST(repairing_units - ?, 0) WHERE item_id = ?");
            $dec_stmt->bind_param("ii", $ticket_quantity, $item_id);
            $dec_stmt->execute();
            $dec_stmt->close();

            // Set status to Available and recalculate
            $item_status = 'Available';
            $item_stmt = $conn->prepare("UPDATE item SET status = ? WHERE item_id = ?");
            $item_stmt->bind_param("si", $item_status, $item_id);
            $item_stmt->execute();
            $item_stmt->close();

            recalcAvailable($conn, $item_id);
        }

        echo json_encode(['success' => true, 'message' => 'Item set back to Available']);
        break;

    case 'unavailable':
        // Set item as Unavailable
        $item_status = 'Unavailable';
        $item_stmt = $conn->prepare("UPDATE item SET status = ? WHERE item_id = ?");
        $item_stmt->bind_param("si", $item_status, $item_id);
        $item_stmt->execute();
        $item_stmt->close();

        // Update repair status too
        $new_status = 'unavailable';
        $stmt = $conn->prepare("UPDATE repair SET status = ? WHERE repair_id = ?");
        $stmt->bind_param("si", $new_status, $repair_id);
        $stmt->execute();
        $stmt->close();

        echo json_encode(['success' => true, 'message' => 'Item set as Unavailable']);
        break;

    default:
        echo json_encode(['success' => false, 'message' => 'Invalid action']);
        break;
}

$conn->close();
?>
