# 🔧 Backend Architecture

> Complete guide to the backend folder structure, API endpoints, database models, and server-side logic.

**Author:** [Aki1104](https://github.com/Aki1104) (steevenparubrub@gmail.com)  
**Last Updated:** February 4, 2026

---

## 📁 Backend Directory Structure

```
rent-it/
├── 📄 config.php                    # Main configuration (OAuth, DB)
│
├── 📁 api/                          # RESTful API endpoints
│   ├── 📁 auth/                     # Authentication endpoints
│   │   ├── 📄 login.php             # POST - User login
│   │   ├── 📄 register.php          # POST - User registration
│   │   ├── 📄 logout.php            # POST - User logout
│   │   └── 📄 check_session.php     # GET - Validate session
│   │
│   ├── 📁 config/                   # API configuration
│   │   └── 📄 database.php          # Database connection class
│   │
│   └── 📁 models/                   # Data models
│       └── 📄 User.php              # User model (CRUD operations)
│
├── 📁 shared/php/                   # Shared PHP utilities
│   └── 📄 db_connection.php         # Simple mysqli connection
│
├── 📁 libs/                         # Third-party libraries
│   └── 📁 PHPMailer/                # Email library
│       ├── 📄 Exception.php
│       ├── 📄 PHPMailer.php
│       └── 📄 SMTP.php
│
├── 📄 fb-login.php                  # Facebook OAuth redirect
├── 📄 fb-callback.php               # Facebook OAuth callback
├── 📄 google-login.php              # Google OAuth redirect
├── 📄 google-callback.php           # Google OAuth callback
│
├── 📄 forgot-password.php           # Password reset form
├── 📄 process-forgot.php            # Send OTP email
├── 📄 verify-otp.php                # OTP verification form
├── 📄 process-verify.php            # Verify OTP code
├── 📄 reset-password.php            # New password form
└── 📄 update-password.php           # Update password in DB
```

---

## 🗄️ Database Configuration

### Primary Connection (`/shared/php/db_connection.php`)

```php
<?php
$host = "localhost";
$user = "root";
$pass = "";
$dbname = "rental_system";

$conn = new mysqli($host, $user, $pass, $dbname);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

$conn->set_charset("utf8mb4");
?>
```

### API Database Class (`/api/config/database.php`)

```php
<?php
class Database {
    private $host = "localhost";
    private $db_name = "rental_system";
    private $username = "root";
    private $password = "";
    private $port = 3306;
    public $conn;

    public function getConnection() {
        $this->conn = new mysqli(
            $this->host,
            $this->username,
            $this->password,
            $this->db_name,
            $this->port
        );
        
        $this->conn->set_charset("utf8");
        return $this->conn;
    }
}
?>
```

---

## 📊 Database Schema

### Users Table

```sql
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(255),
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    password VARCHAR(255),
    role ENUM('customer', 'admin') DEFAULT 'customer',
    facebook_id VARCHAR(255) NULL,
    google_id VARCHAR(255) NULL,
    reset_token VARCHAR(255) NULL,
    reset_expiry DATETIME NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Item Table

```sql
CREATE TABLE item (
    item_id INT AUTO_INCREMENT PRIMARY KEY,
    item_name VARCHAR(255) NOT NULL,
    description TEXT,
    price_per_day DECIMAL(10,2) NOT NULL,
    status ENUM('Available', 'Rented', 'Maintenance') DEFAULT 'Available',
    category VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Cart Table

```sql
CREATE TABLE cart (
    cart_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    item_id INT NOT NULL,
    quantity INT DEFAULT 1,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (item_id) REFERENCES item(item_id)
);
```

### Favorites Table

```sql
CREATE TABLE favorites (
    favorite_id INT AUTO_INCREMENT PRIMARY KEY,
    id INT NOT NULL,           -- user_id
    item_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id) REFERENCES users(id),
    FOREIGN KEY (item_id) REFERENCES item(item_id)
);
```

### Rental Table

```sql
CREATE TABLE rental (
    rental_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    rental_status ENUM('Pending', 'Active', 'Completed', 'Cancelled') DEFAULT 'Pending',
    total_price DECIMAL(10,2),
    venue VARCHAR(255),
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### Rental Items Table

```sql
CREATE TABLE rental_item (
    rental_item_id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,     -- rental_id
    item_id INT NOT NULL,
    item_price DECIMAL(10,2),
    item_status ENUM('Rented', 'Returned', 'Damaged') DEFAULT 'Rented',
    FOREIGN KEY (order_id) REFERENCES rental(rental_id),
    FOREIGN KEY (item_id) REFERENCES item(item_id)
);
```

---

## 🔌 API Endpoints

### Authentication API (`/api/auth/`)

#### POST `/api/auth/login.php`

Authenticates a user and creates a session.

**Request:**
```json
{
    "email": "user@example.com",
    "password": "password123"
}
```

**Response (Success):**
```json
{
    "success": true,
    "message": "Login successful",
    "user": {
        "id": 1,
        "full_name": "John Doe",
        "email": "user@example.com",
        "role": "customer"
    },
    "session_id": "abc123..."
}
```

**Response (Error):**
```json
{
    "success": false,
    "message": "Invalid email or password"
}
```

---

#### POST `/api/auth/register.php`

Creates a new user account.

**Request:**
```json
{
    "full_name": "John Doe",
    "email": "user@example.com",
    "phone": "+63 912 345 6789",
    "password": "password123",
    "confirm_password": "password123"
}
```

**Response (Success):**
```json
{
    "success": true,
    "message": "User registered successfully",
    "user": {
        "id": 1,
        "full_name": "John Doe",
        "email": "user@example.com",
        "role": "customer"
    }
}
```

---

#### POST `/api/auth/logout.php`

Destroys the user session.

**Response:**
```json
{
    "success": true,
    "message": "Logged out successfully"
}
```

---

#### GET `/api/auth/check_session.php`

Validates if user session is active.

**Response (Authenticated):**
```json
{
    "authenticated": true,
    "user": {
        "id": 1,
        "name": "John Doe",
        "email": "user@example.com"
    }
}
```

---

## 🔑 OAuth Configuration (`/config.php`)

### Facebook OAuth

```php
define('FB_APP_ID', 'your_fb_app_id');
define('FB_APP_SECRET', 'your_fb_app_secret');
define('FB_REDIRECT_URL', 'http://localhost/rent-it/fb-callback.php');
```

### Google OAuth

```php
define('GOOGLE_CLIENT_ID', 'your_google_client_id');
define('GOOGLE_CLIENT_SECRET', 'your_google_client_secret');
define('GOOGLE_REDIRECT_URL', 'http://localhost/rent-it/google-callback.php');
```

---

## 📧 Password Reset Flow

```
┌─────────────────┐
│ forgot-password │  User enters email
│     .php        │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ process-forgot  │  Generate OTP, send email via PHPMailer
│     .php        │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  verify-otp     │  User enters 6-digit OTP
│     .php        │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ process-verify  │  Validate OTP against DB
│     .php        │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ reset-password  │  User enters new password
│     .php        │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ update-password │  Hash & update password in DB
│     .php        │
└─────────────────┘
```

### PHPMailer Configuration

```php
$mail = new PHPMailer(true);
$mail->isSMTP();
$mail->Host       = 'smtp.gmail.com';
$mail->SMTPAuth   = true;
$mail->Username   = 'your_email@gmail.com';
$mail->Password   = 'your_app_password';
$mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
$mail->Port       = 587;
```

---

## 🧬 User Model (`/api/models/User.php`)

### Methods

| Method | Description | Returns |
|--------|-------------|---------|
| `register()` | Create new user with hashed password | `array` with success/message |
| `login()` | Verify credentials, return user data | `array` with success/user |
| `getUserByEmail($email)` | Fetch user by email | `array` user data |

### Password Hashing

```php
// On registration
$hashed_password = password_hash($this->password, PASSWORD_DEFAULT);

// On login
if(password_verify($this->password, $row['password'])) {
    // Success
}
```

---

## 🛒 Client-Side PHP Files

### Cart Operations

| File | Action | Method |
|------|--------|--------|
| `cart/add_to_cart.php` | Add item to cart | POST |
| `cart/delete_to_cart.php` | Remove item from cart | POST |
| `cart/cart.php` | Display cart | GET |

### Checkout Operations

| File | Action | Method |
|------|--------|--------|
| `checkout/checkout.php` | Display checkout form | GET |
| `checkout/place_order.php` | Process order | POST |

### Catalog Operations

| File | Action | Method |
|------|--------|--------|
| `catalog/catalog.php` | List all items | GET |
| `catalog/itemdescription.php` | Item details | GET |
| `catalog/add_favorite.php` | Add to favorites | POST |

---

## 🔒 Security Best Practices

### 1. SQL Injection Prevention
```php
// Use prepared statements
$stmt = $conn->prepare("SELECT * FROM users WHERE email = ?");
$stmt->bind_param("s", $email);
$stmt->execute();
```

### 2. XSS Prevention
```php
// Escape output
echo htmlspecialchars($user_input, ENT_QUOTES, 'UTF-8');
```

### 3. Password Security
```php
// Use PHP's built-in functions
password_hash($password, PASSWORD_DEFAULT);
password_verify($password, $hash);
```

### 4. Session Security
```php
session_start();
session_regenerate_id(true); // Prevent session fixation
```

---

## 📝 Response Format Standards

### Success Response
```json
{
    "success": true,
    "message": "Operation completed successfully",
    "data": { ... }
}
```

### Error Response
```json
{
    "success": false,
    "message": "Error description",
    "error_code": "ERROR_CODE"
}
```

### HTTP Status Codes Used

| Code | Meaning | When Used |
|------|---------|-----------|
| 200 | OK | Successful request |
| 201 | Created | Resource created |
| 400 | Bad Request | Invalid input |
| 401 | Unauthorized | Authentication failed |
| 404 | Not Found | Resource not found |
| 503 | Service Unavailable | Database connection failed |

---

## 🔄 Session Management

### Session Variables

| Variable | Description |
|----------|-------------|
| `$_SESSION['user_id']` | User's database ID |
| `$_SESSION['user_name']` | User's full name |
| `$_SESSION['user_email']` | User's email |
| `$_SESSION['user_role']` | User's role (customer/admin) |

### Session Flow
```php
// Start session
session_start();

// Set session on login
$_SESSION['user_id'] = $user['id'];
$_SESSION['user_name'] = $user['full_name'];
$_SESSION['user_email'] = $user['email'];
$_SESSION['user_role'] = $user['role'];

// Check session
if (!isset($_SESSION['user_id'])) {
    // Redirect to login
}

// Clear session on logout
session_destroy();
```

---

## 📦 Dependencies

### PHP Extensions Required
- `mysqli` - MySQL database connection
- `curl` - OAuth API calls
- `json` - JSON encoding/decoding

### Third-Party Libraries
- **PHPMailer** - Email sending (SMTP)

---

## 🚀 Environment Configuration

### Development (XAMPP)
```php
$host = "localhost";
$user = "root";
$pass = "";
$dbname = "rental_system";
$port = 3306;
```

### Base URL
```php
// Development
$base_url = "http://localhost/rent-it";

// Used in OAuth redirects
define('FB_REDIRECT_URL', $base_url . '/fb-callback.php');
define('GOOGLE_REDIRECT_URL', $base_url . '/google-callback.php');
```

---

## 🔍 Debugging

### Enable PHP Errors (Development Only)
```php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
```

### Log Errors
```php
error_log("Database connection error: " . $exception->getMessage());
```

---

*Maintained by [Aki1104](https://github.com/Aki1104) • steevenparubrub@gmail.com*
