<?php
/**
 * Environment Configuration
 * Auto-detects local (XAMPP) vs production (Hostinger) environment.
 *
 * !! Fill in the production values below before deploying !!
 * This file should NOT be committed with real production credentials.
 */

if (defined('ENV_LOADED')) return;
define('ENV_LOADED', true);

$_env_host  = $_SERVER['HTTP_HOST'] ?? 'localhost';
$_env_local = strpos($_env_host, 'localhost') !== false
           || strpos($_env_host, '127.0.0.1') !== false;

define('IS_LOCAL', $_env_local);

if ($_env_local) {
    // ===== LOCAL (XAMPP) =====
    define('DB_HOST', 'localhost');
    define('DB_USER', 'root');
    define('DB_PASS', '');
    define('DB_NAME', 'rental_system');
    define('BASE_URL',  '/rent-it');
    define('SITE_URL',  'http://localhost/rent-it');
    define('CORS_ORIGIN', 'http://localhost:5173');
    define('FB_REDIRECT_URL',     'http://localhost/rent-it/fb-callback.php');
    define('GOOGLE_REDIRECT_URL', 'http://localhost/rent-it/google-callback.php');
} else {
    // ===== PRODUCTION (Hostinger) =====
    define('DB_HOST', 'localhost');                  // usually 'localhost' on Hostinger
    define('DB_USER', 'YOUR_DB_USERNAME');           // e.g. u123456_rentit
    define('DB_PASS', 'YOUR_DB_PASSWORD');
    define('DB_NAME', 'YOUR_DB_NAME');               // e.g. u123456_rental
    define('BASE_URL',  '');                         // empty — site lives at domain root
    define('SITE_URL',  'https://your-domain.com');  // replace with your actual domain
    define('CORS_ORIGIN', 'https://your-domain.com');
    define('FB_REDIRECT_URL',     'https://your-domain.com/fb-callback.php');
    define('GOOGLE_REDIRECT_URL', 'https://your-domain.com/google-callback.php');
}

unset($_env_host, $_env_local);
?>
