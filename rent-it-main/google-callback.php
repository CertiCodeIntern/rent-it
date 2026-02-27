<?php
include 'config.php';

if (isset($_GET['code'])) {
    $code = $_GET['code'];

   
    $post_data = [
        'code' => $code,
        'client_id' => GOOGLE_CLIENT_ID,
        'client_secret' => GOOGLE_CLIENT_SECRET,
        'redirect_uri' => GOOGLE_REDIRECT_URL,
        'grant_type' => 'authorization_code'
    ];

    $ch = curl_init('https://oauth2.googleapis.com/token');
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $post_data);
    $response = curl_exec($ch);
    $data = json_decode($response, true);

    if (isset($data['access_token'])) {
        $access_token = $data['access_token'];

        $user_info = json_decode(file_get_contents("https://www.googleapis.com/oauth2/v3/userinfo?access_token=" . $access_token), true);

        $g_id = $user_info['sub']; 
        $g_name = $user_info['name'];
        $g_email = $user_info['email'];

        $check = mysqli_query($conn, "SELECT * FROM users WHERE google_id = '$g_id' OR email = '$g_email'");

        if (mysqli_num_rows($check) > 0) {
            $user = mysqli_fetch_assoc($check);
            mysqli_query($conn, "UPDATE users SET google_id = '$g_id' WHERE email = '$g_email'");
            $_SESSION['user_id'] = $user['id'];
        } else {
            mysqli_query($conn, "INSERT INTO users (full_name, email, google_id) VALUES ('$g_name', '$g_email', '$g_id')");
            $_SESSION['user_id'] = mysqli_insert_id($conn);
        }

        $_SESSION['user_name'] = $g_name;
        $_SESSION['user_email'] = $g_email;
        header("Location: /rent-it/client/dashboard/loggedin.php");
        exit();
    }
}
?>