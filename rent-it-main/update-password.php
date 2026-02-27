<?php
include_once 'config.php';

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Kunin ang data mula sa form
    $token = mysqli_real_escape_string($conn, $_POST['token']);
    $new_password = $_POST['new_password'];
    $confirm_password = $_POST['confirm_password'];

    // 1. Double check kung match (kahit may JS na tayo, safe ang server-side check)
    if ($new_password !== $confirm_password) {
        $status = "error";
        $message = "Passwords do not match!";
    } else {
        // 2. I-hash ang password para hindi mabasa ng kahit sino sa DB
        $hashed_password = password_hash($new_password, PASSWORD_DEFAULT);

        // 3. I-update ang database
        // Ine-null natin ang token at expiry para "one-time use" lang ang code
        $sql = "UPDATE users SET 
                password = '$hashed_password', 
                reset_token = NULL, 
                reset_expiry = NULL 
                WHERE reset_token = '$token'";

        if (mysqli_query($conn, $sql) && mysqli_affected_rows($conn) > 0) {
            $status = "success";
            $message = "Password updated! You can now log in with your new rhythm.";
        } else {
            $status = "error";
            $message = "Failed to update. The link might have expired.";
        }
    }
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>RentIT - Password Updated</title>

    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">

    <link rel="stylesheet" href="shared/css/theme.css">
    <script src="shared/js/theme.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
    <link rel="icon" type="image/png" href="assets/images/rIT_logo_tp.png">

    <style>
        body {
            font-family: 'Inter', sans-serif;
            background: var(--bg-primary);
            margin: 0;
            min-height: 100vh;
            min-height: 100dvh;
            transition: background 0.3s;
        }
    </style>
</head>
<body>
    <script>
        Swal.fire({
            icon: '<?php echo $status; ?>',
            title: '<?php echo ($status == "success" ? "Great!" : "Oops!"); ?>',
            text: '<?php echo $message; ?>',
            confirmButtonColor: '#E67E22',
            confirmButtonText: 'Go to Login',
            background: getComputedStyle(document.documentElement).getPropertyValue('--bg-card').trim(),
            color: getComputedStyle(document.documentElement).getPropertyValue('--text-primary').trim()
        }).then((result) => {
            window.location.href = 'client/auth/login.php'; 
        });
    </script>
</body>
</html>