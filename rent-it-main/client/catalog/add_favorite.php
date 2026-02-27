<?php
include '../../shared/php/db_connection.php';
session_start();

// Siguraduhin na naka-login ang user
if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Please login first']);
    exit;
}

$user_id = $_SESSION['user_id'];
$item_id = $_POST['item_id'] ?? null;
$action = $_POST['action'] ?? null;

if (!$item_id) {
    echo json_encode(['success' => false, 'message' => 'Invalid Item ID']);
    exit;
}

if ($action === 'add') {
    // INSERT logic - gumamit ng IGNORE para iwas error kung nandoon na
    $query = "INSERT IGNORE INTO favorites (id, item_id) VALUES (?, ?)";
} else {
    // REMOVE logic
    $query = "DELETE FROM favorites WHERE id = ? AND item_id = ?";
}

$stmt = $conn->prepare($query);
$stmt->bind_param("ii", $user_id, $item_id);

if ($stmt->execute()) {
    echo json_encode(['success' => true]);
} else {
    echo json_encode(['success' => false, 'message' => 'Database error']);
}
?>