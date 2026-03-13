<?php
require_once __DIR__ . '/../../env.php';

class Database {
    public $conn;

    public function getConnection() {
        $this->conn = null;

        try {
            $this->conn = new mysqli(
                DB_HOST,
                DB_USER,
                DB_PASS,
                DB_NAME
            );
            
            // Check connection
            if ($this->conn->connect_error) {
                throw new Exception("Connection failed: " . $this->conn->connect_error);
            }
            
            // Set charset to UTF-8
            $this->conn->set_charset("utf8");
            
        } catch(Exception $exception) {
            error_log("Database connection error: " . $exception->getMessage());
            return null;
        }

        return $this->conn;
    }
}
?>