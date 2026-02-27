<?php
session_start();
include('../../shared/php/db_connection.php');

header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'error' => 'Unauthorized access']);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['cart_id'])) {
    $u_id = $_SESSION['user_id'];
    $cart_id = mysqli_real_escape_string($conn, $_POST['cart_id']); 
    $start_date = mysqli_real_escape_string($conn, $_POST['start_date']);
    $end_date = mysqli_real_escape_string($conn, $_POST['end_date']);

   
    if (strtotime($end_date) < strtotime($start_date)) {
        echo json_encode(['success' => false, 'error' => 'End date cannot be earlier than start date.']);
        exit();
    }
    // Same day (start == end) is valid = 1 day rental

  
    $update_query = "UPDATE cart SET start_date = '$start_date', end_date = '$end_date' 
                     WHERE id = '$cart_id' AND user_id = '$u_id'";
    
    if (mysqli_query($conn, $update_query)) {
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'error' => mysqli_error($conn)]);
    }
} else {
    echo json_encode(['success' => false, 'error' => 'Invalid request']);
}
?>