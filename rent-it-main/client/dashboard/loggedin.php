<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>
<body>
    <h1>you are loggedin</h1>
    <button id="logoutBtn" style="
    padding: 10px 20px;
    background-color: #ff4757;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-weight: bold;
    font-size: 14px;
    transition: background-color 0.3s;
" onmouseover="this.style.backgroundColor='#ff3742'" 
onmouseout="this.style.backgroundColor='#ff4757'">
    🚪 Logout
</button>

<script>
document.getElementById('logoutBtn').addEventListener('click', function() {
    if (confirm('Are you sure you want to logout?')) {
        // Clear all auth data
        const authKeys = ['token', 'user', 'user_role', 'user_name'];
        authKeys.forEach(key => localStorage.removeItem(key));
        
        // Clear all session data
        sessionStorage.clear();
        
        // Call logout API
        fetch('/rent-it/api/auth/logout.php', {
            method: 'POST'
        }).finally(() => {
            // Always redirect even if API fails
            window.location.href = '/rent-it/client/auth/login.php';
        });
    }
});
</script>
</body>
</html>