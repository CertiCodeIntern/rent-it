<?php
// Test database connection and check users table
include_once 'config/database.php';

$database = new Database();
$db = $database->getConnection();

echo "<h2>Database Connection Test</h2>";

if (!$db) {
    echo "<p style='color:red;'>❌ Database connection FAILED</p>";
    echo "<p>Please make sure:</p>";
    echo "<ul>";
    echo "<li>XAMPP MySQL is running</li>";
    echo "<li>Database 'rental_system' exists</li>";
    echo "</ul>";
    exit;
}

echo "<p style='color:green;'>✓ Database connection successful!</p>";

// Check if users table exists
$query = "SHOW TABLES LIKE 'users'";
$result = $db->query($query);

if ($result->num_rows == 0) {
    echo "<p style='color:red;'>❌ 'users' table does NOT exist</p>";
    echo "<p>You need to create the users table. Here's the SQL:</p>";
    echo "<pre>
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20),
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'customer',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
</pre>";
    exit;
}

echo "<p style='color:green;'>✓ 'users' table exists</p>";

// Count users
$query = "SELECT COUNT(*) as count FROM users";
$result = $db->query($query);
$row = $result->fetch_assoc();
$userCount = $row['count'];

echo "<p>📊 Total users in database: <strong>$userCount</strong></p>";

if ($userCount == 0) {
    echo "<p style='color:orange;'>⚠️ No users found. You need to register first!</p>";
    echo "<p>Go to: <a href='/rent-it/client/auth/login.php'>Login Page</a> and click the 'Register' tab.</p>";
} else {
    echo "<p style='color:green;'>✓ Users exist. You can try logging in with registered credentials.</p>";
    
    // Show user emails (for debugging only - remove in production!)
    echo "<h3>Registered user emails:</h3>";
    $query = "SELECT id, email, full_name, role FROM users";
    $result = $db->query($query);
    echo "<ul>";
    while ($row = $result->fetch_assoc()) {
        echo "<li>Email: <strong>" . htmlspecialchars($row['email']) . "</strong> | Name: " . htmlspecialchars($row['full_name']) . " | Role: " . htmlspecialchars($row['role']) . "</li>";
    }
    echo "</ul>";
    echo "<p style='color:red;'><strong>Security Note:</strong> Delete this test file after debugging!</p>";
}

$db->close();
?>
