<?php
session_start();
include_once($_SERVER['DOCUMENT_ROOT'] . '/rent-it/shared/php/db_connection.php');

header('Content-Type: application/json');

try {
    $role = $_GET['role'] ?? 'client';
    $user_id = $_SESSION['user_id'] ?? null;
    $admin_logged_in = isset($_SESSION['admin_logged_in']) && $_SESSION['admin_logged_in'] === true;

    if ($role === 'admin') {
        if (!$admin_logged_in) throw new Exception("Unauthorized admin access.");
        $is_admin = true;
    } else {
        if (!$user_id) throw new Exception("Unauthorized client access.");
        $is_admin = false;
    }

    $notifications = [];
    $unread_count = 0;

    if ($is_admin) {
        /** * ADMIN LOGIC:
         * Kunin lang ang notifications na ang user_id ay NULL o 0.
         * Ibig sabihin, ito ay "system-wide" alerts para sa admin.
         */
        $query = "SELECT * FROM notifications 
                  WHERE (user_id IS NULL OR user_id = 0) 
                  ORDER BY created_at DESC LIMIT 50";
        $stmt = $conn->prepare($query);
    } else {
        /** * CLIENT LOGIC:
         * Dito tayo maghihigpit. Kunin LANG ang notifications na 
         * ang user_id ay MATCH sa session ID ng client.
         * HINDI dapat isali ang IS NULL o 0 dito.
         */
        $query = "SELECT * FROM notifications 
                  WHERE user_id = ? 
                  ORDER BY created_at DESC LIMIT 50";
        $stmt = $conn->prepare($query);
        $stmt->bind_param("i", $user_id);
    }
    
    $stmt->execute();
    $result = $stmt->get_result();
    
    while ($row = $result->fetch_assoc()) {
        $notifications[] = $row;
        if ((int)$row['is_read'] === 0) {
            $unread_count++;
        }
    }
    
    echo json_encode([
        'status' => 'success', 
        'data' => $notifications, 
        'unread_count' => $unread_count,
        'role_detected' => $is_admin ? 'admin' : 'client'
    ]);

} catch (Exception $e) {
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}