<?php
/**
 * Update Item API
 * Updates an existing item in the database
 */
session_start();

if (!isset($_SESSION['admin_logged_in']) || $_SESSION['admin_logged_in'] !== true) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit();
}

require_once __DIR__ . '/../../config.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit();
}

// Get JSON input or form data
$contentType = $_SERVER['CONTENT_TYPE'] ?? '';

if (strpos($contentType, 'application/json') !== false) {
    $input = json_decode(file_get_contents('php://input'), true);
} else {
    $input = $_POST;
}

if (empty($input['item_id']) || !is_numeric($input['item_id'])) {
    echo json_encode(['success' => false, 'message' => 'Missing or invalid item ID']);
    exit();
}

$item_id = intval($input['item_id']);

// Verify item exists
$check = $conn->prepare("SELECT item_id FROM item WHERE item_id = ?");
$check->bind_param("i", $item_id);
$check->execute();
if ($check->get_result()->num_rows === 0) {
    echo json_encode(['success' => false, 'message' => 'Item not found']);
    $check->close();
    exit();
}
$check->close();

// Prepare fields
$item_name = mysqli_real_escape_string($conn, trim($input['item_name'] ?? ''));
$description = mysqli_real_escape_string($conn, trim($input['description'] ?? ''));
$category = mysqli_real_escape_string($conn, trim($input['category'] ?? ''));
$price_per_day = floatval($input['price_per_day'] ?? 0);
$deposit = !empty($input['deposit']) ? floatval($input['deposit']) : null;
$condition = mysqli_real_escape_string($conn, trim($input['condition'] ?? 'Good'));
$status = mysqli_real_escape_string($conn, trim($input['status'] ?? 'Available'));
$total_units = isset($input['total_units']) ? intval($input['total_units']) : 1;
$repairing_units = isset($input['repairing_units']) ? intval($input['repairing_units']) : 0;

// Calculate available_units from database, don't trust input
$rentedQuery = "SELECT COALESCE(SUM(ri.quantity), 0) as rented_count 
                FROM rental_item ri 
                JOIN rental r ON ri.order_id = r.order_id 
                WHERE ri.item_id = ? 
                AND r.rental_status IN ('Pending', 'Booked', 'Confirmed', 'In Transit', 'Active', 'Pending Return', 'Late')";
$rentedStmt = $conn->prepare($rentedQuery);
$rentedStmt->bind_param("i", $item_id);
$rentedStmt->execute();
$rentedResult = $rentedStmt->get_result();
$rentedData = $rentedResult->fetch_assoc();
$rented_units = intval($rentedData['rented_count']);
$rentedStmt->close();

// Calculate: Available = Total - Rented - Repairing
$available_units = max(0, $total_units - $rented_units - $repairing_units);

$is_visible = isset($input['is_visible']) ? intval($input['is_visible']) : 1;
$is_featured = isset($input['is_featured']) ? intval($input['is_featured']) : 0;
$tags = isset($input['tags']) && trim($input['tags']) !== '' ? mysqli_real_escape_string($conn, trim($input['tags'])) : null;

// Handle image upload if present
$image_sql = '';
if (isset($_FILES['itemImage']) && $_FILES['itemImage']['error'] === UPLOAD_ERR_OK) {
    $uploadDir = __DIR__ . '/../../assets/images/items/';
    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0755, true);
    }
    $fileExt = strtolower(pathinfo($_FILES['itemImage']['name'], PATHINFO_EXTENSION));
    $allowedExts = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
    if (in_array($fileExt, $allowedExts)) {
        $newFileName = 'item_' . time() . '_' . uniqid() . '.' . $fileExt;
        $uploadPath = $uploadDir . $newFileName;
        if (move_uploaded_file($_FILES['itemImage']['tmp_name'], $uploadPath)) {
            $image_sql = ", `image` = '$newFileName'";
        }
    }
}

// Build update query
$query = "UPDATE `item` SET 
    `item_name` = '$item_name',
    `description` = '$description',
    `category` = '$category',
    `price_per_day` = '$price_per_day',
    `deposit` = " . ($deposit !== null ? "'$deposit'" : 'NULL') . ",
    `condition` = '$condition',
    `status` = '$status',
    `total_units` = '$total_units',
    `available_units` = '$available_units',
    `repairing_units` = '$repairing_units',
    `is_visible` = '$is_visible',
    `is_featured` = '$is_featured',
    `tags` = " . ($tags !== null ? "'$tags'" : 'NULL') . "
    $image_sql
WHERE `item_id` = $item_id";

$result = mysqli_query($conn, $query);

if ($result) {
    echo json_encode([
        'success' => true,
        'message' => 'Item updated successfully',
        'item_id' => $item_id
    ]);
} else {
    echo json_encode([
        'success' => false,
        'message' => 'Failed to update item: ' . mysqli_error($conn)
    ]);
}

$conn->close();
?>
