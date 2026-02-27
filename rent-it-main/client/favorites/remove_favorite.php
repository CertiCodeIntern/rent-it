<?php
session_start();
include '../../shared/php/db_connection.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Gamitin kung ano ang session name mo sa favorites.php
    $user_id = $_SESSION['user_id'] ?? null; 
    $item_id = $_POST['item_id'] ?? null;

    if ($user_id && $item_id) {
        // SQL: f.id = user_id AND f.item_id = item_id
        $stmt = $conn->prepare("DELETE FROM favorites WHERE id = ? AND item_id = ?");
        $stmt->bind_param("ii", $user_id, $item_id);
        
        if ($stmt->execute()) {
            if ($stmt->affected_rows > 0) {
                echo json_encode(['success' => true]);
            } else {
                echo json_encode(['success' => false, 'message' => 'No record found to delete. Check IDs.']);
            }
        } else {
            echo json_encode(['success' => false, 'message' => 'Database error']);
        }
    } else {
        echo json_encode(['success' => false, 'message' => 'Missing data. User:'.$user_id.' Item:'.$item_id]);
    }
}
exit();