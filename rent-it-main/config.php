<?php
if(!session_id()) session_start();
$conn = mysqli_connect("localhost", "root", "", "rental_system");

if (!$conn) {
    die("Connection failed: " . mysqli_connect_error());
}

define('FB_APP_ID', '889242040177179'); 
define('FB_APP_SECRET', '8a972c2482da4177f5c79e657537979c');
define('FB_REDIRECT_URL', 'http://localhost/rent-it/fb-callback.php');


$fb_login_url = "https://www.facebook.com/v12.0/dialog/oauth?client_id=" . FB_APP_ID . "&redirect_uri=" . FB_REDIRECT_URL . "&state=login&scope=email,public_profile";

define('GOOGLE_CLIENT_ID', '706779737683-81lrtohh73gdtpecnvubk7qskrq483df.apps.googleusercontent.com');
define('GOOGLE_CLIENT_SECRET', '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');
define('GOOGLE_REDIRECT_URL', 'http://localhost/rent-it/google-callback.php');

$google_login_url = "https://accounts.google.com/o/oauth2/v2/auth?" . http_build_query([
    'client_id' => GOOGLE_CLIENT_ID,
    'redirect_uri' => GOOGLE_REDIRECT_URL,
    'response_type' => 'code',
    'scope' => 'email profile',
    'access_type' => 'online'
]);
?>