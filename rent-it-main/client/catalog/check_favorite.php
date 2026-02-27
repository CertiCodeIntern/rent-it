<?php
include '../../shared/php/db_connection.php';
session_start();

header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'favorited' => false]);
    exit;
}

$user_id = $_SESSION['user_id'];
$item_id = isset($_GET['item_id']) ? intval($_GET['item_id']) : 0;

if (!$item_id) {
    echo json_encode(['success' => false, 'favorited' => false]);
    exit;
}

$stmt = $conn->prepare("SELECT favorite_id FROM favorites WHERE id = ? AND item_id = ?");
$stmt->bind_param("ii", $user_id, $item_id);
$stmt->execute();
$result = $stmt->get_result();

echo json_encode([
    'success' => true,
    'favorited' => $result->num_rows > 0
]);
