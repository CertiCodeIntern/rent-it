<?php
class Database {
    private $host = "localhost";
    private $db_name = "rental_system";
    private $username = "root"; // XAMPP default username
    private $password = ""; // XAMPP default password (empty)
    private $port = 3306; // XAMPP default port
    public $conn;

    public function getConnection() {
        $this->conn = null;

        try {
            $this->conn = new mysqli(
                $this->host,
                $this->username,
                $this->password,
                $this->db_name,
                $this->port
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