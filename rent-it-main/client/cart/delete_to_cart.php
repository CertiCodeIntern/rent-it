<?php
include('../../shared/php/db_connection.php');

header('Content-Type: application/json');

if (isset($_POST['delete_ids'])) {
    $ids = json_decode($_POST['delete_ids']);
    if (!empty($ids)) {
        // Proteksyon sa SQL Injection
        $clean_ids = implode(',', array_map('intval', $ids));
        $query = "DELETE FROM cart WHERE id IN ($clean_ids)";
        
        if (mysqli_query($conn, $query)) {
            echo json_encode(['success' => true]);
            exit;
        }
    }
}

echo json_encode(['success' => false, 'error' => mysqli_error($conn)]);
?>