<?php
include 'config.php';


$google_login_url = "https://accounts.google.com/o/oauth2/v2/auth?"
    . "client_id=" . GOOGLE_CLIENT_ID 
    . "&redirect_uri=" . urlencode(GOOGLE_REDIRECT_URL) 
    . "&response_type=code"
    . "&scope=email%20profile"
    . "&access_type=offline";


header("Location: " . $google_login_url);
exit();
?>