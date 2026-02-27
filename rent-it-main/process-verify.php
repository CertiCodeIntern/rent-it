<?php
include_once 'config.php';

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Trim para sigurado walang hidden spaces
    $email = mysqli_real_escape_string($conn, trim($_POST['email']));
    $otp = mysqli_real_escape_string($conn, trim($_POST['otp']));

    // 1. I-check muna natin kung nage-exist ba talaga ang email at code
    // Inalis ko muna ang strict time check para ma-verify natin kung logic ang problem
    $query = "SELECT * FROM users WHERE email = '$email' AND reset_token = '$otp'";
    $result = mysqli_query($conn, $query);

    if (mysqli_num_rows($result) > 0) {
        $user = mysqli_fetch_assoc($result);
        $expiry = strtotime($user['reset_expiry']);
        $now = time();

        // 2. Check expiry manually para madali i-debug
        if ($now <= $expiry) {
            // SUCCESS! Tama ang code at hindi pa expired
            header("Location: reset-password.php?email=" . urlencode($email) . "&token=" . urlencode($otp));
            exit();
        } else {
            // EXPIRED CODE
            echo "<script>alert('Code has expired. Please request a new one.'); window.location.href='forgot-password.php';</script>";
        }
    } else {
        // INVALID CODE
        echo "<script>alert('Invalid code! Please check your email again.'); window.history.back();</script>";
    }
}
?>