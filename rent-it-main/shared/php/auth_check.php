<?php
/**
 * Shared authentication check for protected client pages.
 * Include this at the top of every protected page (after session_start).
 * 
 * - Prevents browser from caching protected pages (fixes back-button-after-logout)
 * - Redirects to login if session is not authenticated
 */

// Prevent browser caching of protected pages
header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
header("Cache-Control: post-check=0, pre-check=0", false);
header("Pragma: no-cache");
header("Expires: 0");

if (!isset($_SESSION['user_id'])) {
    header("Location: /rent-it/client/auth/login.php");
    exit();
}
?>
