<?php
class User {
    private $conn;
    private $table_name = "users";

    public $id;
    public $full_name;
    public $email;
    public $phone;
    public $password;
    public $role;
    public $created_at;

    public function __construct($db) {
        $this->conn = $db;
    }

    // Create new user (registration)
    public function register() {
        // Check if email already exists
        $check_query = "SELECT id FROM " . $this->table_name . " WHERE email = ?";
        $stmt = $this->conn->prepare($check_query);
        $stmt->bind_param("s", $this->email);
        $stmt->execute();
        $stmt->store_result();
        
        if($stmt->num_rows > 0) {
            $stmt->close();
            return array("success" => false, "message" => "Email already exists");
        }
        $stmt->close();

        // Hash password
        $hashed_password = password_hash($this->password, PASSWORD_DEFAULT);

        // Insert query
        $query = "INSERT INTO " . $this->table_name . " 
                  (full_name, email, phone, password, role) 
                  VALUES (?, ?, ?, ?, ?)";

        $stmt = $this->conn->prepare($query);
        
        // Sanitize inputs
        $full_name = htmlspecialchars(strip_tags($this->full_name));
        $email = htmlspecialchars(strip_tags($this->email));
        $phone = htmlspecialchars(strip_tags($this->phone));
        $role = $this->role ?: 'customer';
        
        $stmt->bind_param("sssss", $full_name, $email, $phone, $hashed_password, $role);

        if($stmt->execute()) {
            $this->id = $stmt->insert_id;
            $stmt->close();
            return array("success" => true, "message" => "User registered successfully");
        } else {
            $error = $stmt->error;
            $stmt->close();
            return array("success" => false, "message" => "Registration failed: " . $error);
        }
    }

    // Login user
    public function login() {
        $query = "SELECT id, full_name, email, phone, password, role, created_at 
                  FROM " . $this->table_name . " 
                  WHERE email = ? 
                  LIMIT 1";

        $stmt = $this->conn->prepare($query);
        $stmt->bind_param("s", $this->email);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if($result->num_rows > 0) {
            $row = $result->fetch_assoc();
            
            // Verify password
            if(password_verify($this->password, $row['password'])) {
                // Don't return password in response
                unset($row['password']);
                $stmt->close();
                return array("success" => true, "user" => $row);
            }
        }
        
        $stmt->close();
        return array("success" => false, "message" => "Invalid email or password");
    }

    // Get user by email
    public function getUserByEmail($email) {
        $query = "SELECT id, full_name, email, phone, role, created_at 
                  FROM " . $this->table_name . " 
                  WHERE email = ? 
                  LIMIT 1";

        $stmt = $this->conn->prepare($query);
        $stmt->bind_param("s", $email);
        $stmt->execute();
        $result = $stmt->get_result();
        $user = $result->fetch_assoc();
        $stmt->close();
        
        return $user;
    }
}
?>