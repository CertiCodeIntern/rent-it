<?php
/**
 * Add Item API
 * Creates a new item in the database
 */
require_once __DIR__ . '/../../config.php';

header('Content-Type: application/json');

// Only accept POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

// Get JSON input or form data
$contentType = $_SERVER['CONTENT_TYPE'] ?? '';

if (strpos($contentType, 'application/json') !== false) {
    $input = json_decode(file_get_contents('php://input'), true);
} else {
    $input = $_POST;
}

// Validate required fields
if (empty($input['item_name'])) {
    echo json_encode(['success' => false, 'message' => 'Item name is required']);
    exit;
}

if (empty($input['price_per_day']) || !is_numeric($input['price_per_day'])) {
    echo json_encode(['success' => false, 'message' => 'Valid daily rate is required']);
    exit;
}

// Prepare data
$item_name = mysqli_real_escape_string($conn, trim($input['item_name']));
$description = mysqli_real_escape_string($conn, trim($input['description'] ?? ''));
$category = mysqli_real_escape_string($conn, trim($input['category'] ?? ''));
$price_per_day = floatval($input['price_per_day']);
$deposit = !empty($input['deposit']) ? floatval($input['deposit']) : null;
$condition = mysqli_real_escape_string($conn, trim($input['condition'] ?? 'Good'));
$status = mysqli_real_escape_string($conn, trim($input['status'] ?? 'Available'));
$image = mysqli_real_escape_string($conn, trim($input['image'] ?? ''));
$total_units = isset($input['total_units']) ? intval($input['total_units']) : 1;
$available_units = isset($input['available_units']) ? intval($input['available_units']) : $total_units;
$repairing_units = isset($input['repairing_units']) ? intval($input['repairing_units']) : 0;
$is_visible = isset($input['is_visible']) ? intval($input['is_visible']) : 1;
$is_featured = isset($input['is_featured']) ? intval($input['is_featured']) : 0;
$tags = isset($input['tags']) && trim($input['tags']) !== '' ? mysqli_real_escape_string($conn, trim($input['tags'])) : null;

// Handle image upload if present
if (isset($_FILES['itemImage']) && $_FILES['itemImage']['error'] === UPLOAD_ERR_OK) {
    $uploadDir = __DIR__ . '/../../assets/images/items/';
    
    // Create directory if it doesn't exist
    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0755, true);
    }
    
    $fileExt = strtolower(pathinfo($_FILES['itemImage']['name'], PATHINFO_EXTENSION));
    $allowedExts = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
    
    if (in_array($fileExt, $allowedExts)) {
        $newFileName = 'item_' . time() . '_' . uniqid() . '.' . $fileExt;
        $uploadPath = $uploadDir . $newFileName;
        
        if (move_uploaded_file($_FILES['itemImage']['tmp_name'], $uploadPath)) {
            $image = $newFileName;
        }
    }
}

// Build insert query
$query = "INSERT INTO `item` (
    `item_name`, 
    `description`, 
    `category`, 
    `image`, 
    `price_per_day`, 
    `deposit`, 
    `condition`, 
    `status`, 
    `total_units`,
    `available_units`,
    `repairing_units`,
    `is_visible`,
    `is_featured`,
    `tags`,
    `rating`, 
    `reviews`, 
    `maintenance_notes`, 
    `total_times_rented`
) VALUES (
    '$item_name',
    '$description',
    '$category',
    '$image',
    '$price_per_day',
    " . ($deposit !== null ? "'$deposit'" : 'NULL') . ",
    '$condition',
    '$status',
    '$total_units',
    '$available_units',
    '$repairing_units',
    '$is_visible',
    '$is_featured',
    " . ($tags !== null ? "'$tags'" : 'NULL') . ",
    NULL,
    0,
    NULL,
    0
)";

$result = mysqli_query($conn, $query);

if ($result) {
    $newItemId = mysqli_insert_id($conn);
    echo json_encode([
        'success' => true,
        'message' => 'Item created successfully',
        'item_id' => $newItemId
    ]);
} else {
    echo json_encode([
        'success' => false,
        'message' => 'Failed to create item: ' . mysqli_error($conn),
        'query' => $query
    ]);
}
?>
