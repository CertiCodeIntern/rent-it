<?php
/**
 * One-time setup script to create admin_accounts table
 * Run this once, then delete it
 */
$conn = mysqli_connect('localhost', 'root', '', 'rental_system');
if (!$conn) { die('Connection failed: ' . mysqli_connect_error()); }

// Create table
$sql = "CREATE TABLE IF NOT EXISTS `admin_accounts` (
  `admin_id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `full_name` varchar(100) DEFAULT 'Admin',
  `email` varchar(100) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`admin_id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci";

if (mysqli_query($conn, $sql)) {
    echo "Table created OK\n";
} else {
    echo "Table error: " . mysqli_error($conn) . "\n";
}

// Insert default admin
$hash = password_hash('admin1', PASSWORD_BCRYPT);
$insert = "INSERT INTO `admin_accounts` (`username`, `password`, `full_name`, `email`) 
           VALUES ('admin1', '$hash', 'Admin User', 'admin@certicode.com') 
           ON DUPLICATE KEY UPDATE `admin_id` = `admin_id`";

if (mysqli_query($conn, $insert)) {
    echo "Default admin inserted OK\n";
} else {
    echo "Insert error: " . mysqli_error($conn) . "\n";
}

// Verify
$result = mysqli_query($conn, 'SELECT admin_id, username, full_name FROM admin_accounts');
while ($row = mysqli_fetch_assoc($result)) {
    echo "Admin: " . $row['username'] . " (" . $row['full_name'] . ")\n";
}

mysqli_close($conn);
echo "\nDone! You can delete this file now.\n";
?>
