<?php
session_start();
include_once($_SERVER['DOCUMENT_ROOT'] . '/rent-it/shared/php/db_connection.php');

header('Content-Type: application/json');

try {
    $input = json_decode(file_get_contents('php://input'), true);
    
    // Can be single id or "all"
    $notif_id = $input['id'] ?? null;
    $role = $input['role'] ?? 'client';
    $admin_logged_in = isset($_SESSION['admin_logged_in']) && $_SESSION['admin_logged_in'] === true;
    $user_id = isset($_SESSION['user_id']) ? $_SESSION['user_id'] : null;

    if ($role === 'admin') {
        if (!$admin_logged_in) throw new Exception("Unauthorized admin access.");
        $is_admin = true;
    } else {
        if (!$user_id) throw new Exception("Unauthorized client access.");
        $is_admin = false;
    }

    if ($notif_id === 'all') {
        if ($is_admin) {
            $query = "UPDATE notifications SET is_read = 1, read_at = NOW() WHERE user_id IS NULL AND is_read = 0";
            $stmt = $conn->prepare($query);
        } else {
            $query = "UPDATE notifications SET is_read = 1, read_at = NOW() WHERE user_id = ? AND is_read = 0";
            $stmt = $conn->prepare($query);
            $stmt->bind_param("i", $user_id);
        }
    } else {
        if (!$notif_id) {
            throw new Exception("Missing notification ID.");
        }
        if ($is_admin) {
            $query = "UPDATE notifications SET is_read = 1, read_at = NOW() WHERE id = ? AND user_id IS NULL";
            $stmt = $conn->prepare($query);
            $stmt->bind_param("i", $notif_id);
        } else {
            $query = "UPDATE notifications SET is_read = 1, read_at = NOW() WHERE id = ? AND user_id = ?";
            $stmt = $conn->prepare($query);
            $stmt->bind_param("ii", $notif_id, $user_id);
        }
    }
    
    $stmt->execute();
    
    echo json_encode(['status' => 'success']);

} catch (Exception $e) {
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
