<?php
/**
 * Get Single Item API
 * Returns a single item by item_id
 */
require_once __DIR__ . '/../../config.php';

header('Content-Type: application/json');

if (!isset($_GET['id']) || !is_numeric($_GET['id'])) {
    echo json_encode(['success' => false, 'message' => 'Missing or invalid item ID']);
    exit;
}

$item_id = intval($_GET['id']);

// Get item with calculated available_units
$stmt = $conn->prepare("
    SELECT i.item_id, i.item_name, i.description, i.category, i.image, i.price_per_day, i.deposit, i.`condition`, i.status, i.maintenance_notes, i.total_times_rented, i.rating, i.reviews, i.total_units, i.repairing_units, i.is_visible, i.is_featured, i.tags,
           COALESCE(rented_counts.rented_count, 0) AS currently_rented,
           GREATEST(0, i.total_units - i.repairing_units - COALESCE(rented_counts.rented_count, 0)) AS available_units
    FROM item i
    LEFT JOIN (
        SELECT ri.item_id, COALESCE(SUM(ri.quantity), 0) AS rented_count
        FROM rental_item ri
        JOIN rental r ON ri.order_id = r.order_id
        WHERE r.rental_status IN ('Pending', 'Booked', 'Confirmed', 'In Transit', 'Active', 'Pending Return', 'Late')
        GROUP BY ri.item_id
    ) rented_counts ON i.item_id = rented_counts.item_id
    WHERE i.item_id = ?
");
$stmt->bind_param("i", $item_id);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    echo json_encode(['success' => false, 'message' => 'Item not found']);
    $stmt->close();
    exit;
}

$item = $result->fetch_assoc();
$item['price_per_day'] = $item['price_per_day'] !== null ? floatval($item['price_per_day']) : null;
$item['deposit'] = $item['deposit'] !== null ? floatval($item['deposit']) : null;
$item['rating'] = $item['rating'] !== null ? floatval($item['rating']) : null;
$item['reviews'] = $item['reviews'] !== null ? intval($item['reviews']) : null;
$item['total_times_rented'] = intval($item['total_times_rented']);
$item['total_units'] = intval($item['total_units']);
$item['available_units'] = intval($item['available_units']);
$item['repairing_units'] = intval($item['repairing_units']);
$item['is_visible'] = intval($item['is_visible']);
$item['is_featured'] = intval($item['is_featured']);

echo json_encode(['success' => true, 'data' => $item]);

$stmt->close();
$conn->close();
?>
