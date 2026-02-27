<?php
include 'config.php';


$fb_login_url = "https://www.facebook.com/v12.0/dialog/oauth?"
    . "client_id=" . FB_APP_ID 
    . "&redirect_uri=" . urlencode(FB_REDIRECT_URL) 
    . "&state=st82345" 
    . "&scope=email,public_profile";


header("Location: " . $fb_login_url);
exit();
?>