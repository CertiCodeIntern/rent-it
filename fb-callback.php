<?php
session_start();
include 'config.php'; 

if (isset($_GET['code'])) {
    $code = $_GET['code'];

    $token_url = "https://graph.facebook.com/v12.0/oauth/access_token?client_id=" . FB_APP_ID . "&redirect_uri=" . FB_REDIRECT_URL . "&client_secret=" . FB_APP_SECRET . "&code=" . $code;
    
    $response = @file_get_contents($token_url); 
    $params = json_decode($response, true);

    if (isset($params['access_token'])) {
        $access_token = $params['access_token'];

        $info_url = "https://graph.facebook.com/me?fields=id,name,email&access_token=" . $access_token;
        $user_info = json_decode(file_get_contents($info_url), true);

        $fb_id = $user_info['id'];
        $full_name = mysqli_real_escape_string($conn, $user_info['name']); // Iwas SQL Injection
        $email = isset($user_info['email']) ? mysqli_real_escape_string($conn, $user_info['email']) : "";

        $check_query = "SELECT * FROM users WHERE facebook_id = '$fb_id'";
        $result = mysqli_query($conn, $check_query);

        if (mysqli_num_rows($result) > 0) {
            $user_data = mysqli_fetch_assoc($result);
            $_SESSION['user_id'] = $user_data['id'];
            $_SESSION['user_name'] = $user_data['full_name'];
        } else {
            
            $insert_query = "INSERT INTO users (full_name, email, facebook_id, role) VALUES ('$full_name', '$email', '$fb_id', 'client')";
            if (mysqli_query($conn, $insert_query)) {
                $_SESSION['user_id'] = mysqli_insert_id($conn);
                $_SESSION['user_name'] = $full_name;
            }
        }

        $_SESSION['user_email'] = $email;

       
        header("Location: /rent-it/client/dashboard");
        exit();

    } else {
        echo "Error: Can'tccess Token.";
    }
} else {
   
    header("Location: /rent-it/fb-callback.php");
    exit();
}
?>