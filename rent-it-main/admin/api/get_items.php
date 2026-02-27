<?php
/**
 * Get Items API
 * Returns all items with basic details for admin listing
 */
require_once __DIR__ . '/../../config.php';

header('Content-Type: application/json');

$query = "SELECT i.item_id, i.item_name, i.description, i.category, i.image, i.price_per_day, i.deposit, i.`condition`, i.status, i.maintenance_notes, i.total_times_rented, i.rating, i.reviews, i.total_units, i.repairing_units, i.is_visible, i.is_featured, i.tags,
          COALESCE(completed_counts.completed_count, 0) AS completed_rentals,
          COALESCE(rented_counts.rented_count, 0) AS currently_rented,
          GREATEST(0, i.total_units - i.repairing_units - COALESCE(rented_counts.rented_count, 0)) AS available_units
          FROM item i
          LEFT JOIN (
              SELECT ri.item_id, COUNT(DISTINCT ri.order_id) AS completed_count
              FROM rental_item ri
              JOIN rental r ON ri.order_id = r.order_id
              WHERE r.rental_status IN ('Completed', 'Returned')
              GROUP BY ri.item_id
          ) completed_counts ON i.item_id = completed_counts.item_id
          LEFT JOIN (
              SELECT ri.item_id, COALESCE(SUM(ri.quantity), 0) AS rented_count
              FROM rental_item ri
              JOIN rental r ON ri.order_id = r.order_id
              WHERE r.rental_status IN ('Pending', 'Booked', 'Confirmed', 'In Transit', 'Active', 'Pending Return', 'Late')
              GROUP BY ri.item_id
          ) rented_counts ON i.item_id = rented_counts.item_id
          ORDER BY i.item_id DESC";

$result = mysqli_query($conn, $query);

if (!$result) {
    echo json_encode([
        'success' => false,
        'message' => 'Database error: ' . mysqli_error($conn)
    ]);
    exit;
}

$items = [];
while ($row = mysqli_fetch_assoc($result)) {
    $row['price_per_day'] = $row['price_per_day'] !== null ? floatval($row['price_per_day']) : null;
    $row['deposit'] = $row['deposit'] !== null ? floatval($row['deposit']) : null;
    $row['rating'] = $row['rating'] !== null ? floatval($row['rating']) : null;
    $row['reviews'] = $row['reviews'] !== null ? intval($row['reviews']) : null;
    $row['total_times_rented'] = intval($row['completed_rentals']);
    unset($row['completed_rentals']);
    $items[] = $row;
}

echo json_encode([
    'success' => true,
    'data' => $items
]);
?>
