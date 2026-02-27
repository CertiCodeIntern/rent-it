<?php
session_start();

// Dahil nasa shared/php/ ang file na ito, dalawang akyat (../../) 
// para mahanap ang main folder kung nasaan ang db_connection.php
include '../php/db_connection.php'; 

header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Session expired.']);
    exit;
}

$user_id = $_SESSION['user_id'];

// Kunin ang data mula sa POST
$full_name = trim($_POST['full_name'] ?? '');
$email = trim($_POST['email'] ?? '');
$phone = trim($_POST['phone'] ?? '');
$address = trim($_POST['address'] ?? '');

// SAFETY CHECK: Ito ang pipigil sa pagbura ng data sa database.
// Kung blangko ang ipinadalang pangalan o email, hihinto ang script.
if (empty($full_name) || empty($email)) {
    echo json_encode(['success' => false, 'message' => 'Name and Email cannot be empty.']);
    exit;
}

$profile_pic_name = null;

// Handle File Upload
if (isset($_FILES['profile_pic']) && $_FILES['profile_pic']['error'] === UPLOAD_ERR_OK) {
    $fileTmpPath = $_FILES['profile_pic']['tmp_name'];
    $fileName = $_FILES['profile_pic']['name'];
    $fileExtension = strtolower(pathinfo($fileName, PATHINFO_EXTENSION));

    $newFileName = 'user_' . $user_id . '_' . time() . '.' . $fileExtension;
    
    // Siguraduhin na tama ang path papunta sa assets folder mo
    $uploadFileDir = '../../assets/profile/'; 
    
    if (!is_dir($uploadFileDir)) {
        mkdir($uploadFileDir, 0777, true);
    }

    $dest_path = $uploadFileDir . $newFileName;

    if(move_uploaded_file($fileTmpPath, $dest_path)) {
        $profile_pic_name = $newFileName;
    }
}

// Prepare SQL (Dynamic depende kung may bagong picture)
if ($profile_pic_name) {
    // Siguraduhin na 'profile_picture' ang column name sa database mo
    $sql = "UPDATE users SET full_name = ?, email = ?, phone = ?, address = ?, profile_picture = ? WHERE id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("sssssi", $full_name, $email, $phone, $address, $profile_pic_name, $user_id);
} else {
    $sql = "UPDATE users SET full_name = ?, email = ?, phone = ?, address = ? WHERE id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("ssssi", $full_name, $email, $phone, $address, $user_id);
}
if ($stmt->execute()) {
    // I-update ang session para mag-reflect agad ang bagong pangalan sa UI
    $_SESSION['full_name'] = $full_name; 

    // Gagawa tayo ng response array para mapadalhan ng info ang JavaScript
    $response = ['success' => true];

    // IMPORTANTE: Kung may bagong picture, isama natin yung filename sa response
    // para ma-update ng JavaScript ang localStorage automatically.
    if ($profile_pic_name) {
        $response['profile_picture'] = $profile_pic_name;
    }

    echo json_encode($response);
} else {
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $conn->error]);
}
?>