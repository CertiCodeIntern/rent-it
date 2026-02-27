<?php
// filepath: c:\xampp\htdocs\rent-it\shared\php\db_connection.php

// ===== DYNAMIC BASE URL CONFIGURATION =====
if (!defined('BASE_URL')) {
    $host = $_SERVER['HTTP_HOST'] ?? 'localhost';
    // Localhost (XAMPP) = /rent-it, Production = empty or custom
    define('BASE_URL', (strpos($host, 'localhost') !== false || strpos($host, '127.0.0.1') !== false) ? '/rent-it' : '');
}

// ===== DATABASE CONNECTION =====
$host = "localhost";
$user = "root";
$pass = "";
$dbname = "rental_system";

// Try to connect with error handling
try {
    $conn = new mysqli($host, $user, $pass, $dbname);
    $conn->set_charset("utf8mb4");
} catch (mysqli_sql_exception $e) {
    // Check if it's a server connection issue
    if (strpos($e->getMessage(), "refused") !== false || strpos($e->getMessage(), "Can't connect") !== false) {
        // For pages that don't require DB (like static pages), continue without connection
        $conn = null;
        error_log("Database connection failed: " . $e->getMessage());
        
        // Only die if we're in a PHP file that absolutely needs the database
        $current_file = basename($_SERVER['SCRIPT_NAME']);
        $requires_db = in_array($current_file, ['dashboard.php', 'myrentals.php', 'bookinghistory.php', 'returns.php', 'catalog.php']);
        
        if ($requires_db) {
            die("
            <div style='padding: 20px; background: #fee; border: 1px solid #f00; margin: 20px; border-radius: 8px; font-family: Arial, sans-serif;'>
                <h3 style='color: #d00; margin: 0 0 10px 0;'>Database Connection Error</h3>
                <p style='margin: 0;'>Please make sure XAMPP MySQL service is running.</p>
                <p style='margin: 10px 0 0 0; font-size: 12px; color: #666;'>Start XAMPP Control Panel → Start MySQL</p>
            </div>");
        }
    } else {
        die("Database connection failed: " . $e->getMessage());
    }
}
?>