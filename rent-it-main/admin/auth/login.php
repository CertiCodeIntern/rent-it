<?php
session_start();
// If already logged in as admin, redirect to dashboard
if (isset($_SESSION['admin_logged_in']) && $_SESSION['admin_logged_in'] === true) {
    header('Location: /rent-it/admin/dashboard/dashboard.php');
    exit();
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <base href="/rent-it/">
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="RentIt Admin Portal - Staff Login">
    <title>Admin Login - RentIt</title>
    
    <!-- Google Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    
    <!-- Stylesheets -->
    <link rel="stylesheet" href="shared/css/theme.css">
    <link rel="stylesheet" href="shared/css/globals.css">
    <link rel="stylesheet" href="admin/auth/css/auth.css">
    
    <!-- Theme Script -->
    <script src="shared/js/theme.js"></script>
    
    <!-- Favicon -->
    <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🔐</text></svg>">
</head>
<body>
    <!-- Theme Toggle -->
    <button class="theme-toggle auth-theme-toggle" id="themeToggle" aria-label="Toggle theme">
        <svg class="sun-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="5"/>
            <line x1="12" y1="1" x2="12" y2="3"/>
            <line x1="12" y1="21" x2="12" y2="23"/>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
            <line x1="1" y1="12" x2="3" y2="12"/>
            <line x1="21" y1="12" x2="23" y2="12"/>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
        </svg>
        <svg class="moon-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
        </svg>
    </button>

    <div class="admin-login-container">
        <!-- Left Panel - Branding -->
        <div class="admin-branding">
            <div class="branding-content">
                <div class="admin-logo">
                    <span class="logo-icon">🎤</span>
                    <span class="logo-text">RentIt</span>
                </div>
                <h1 class="branding-title">Admin Portal</h1>
                <p class="branding-subtitle">Manage your videoke rental business with powerful tools and insights.</p>
                
                <div class="branding-features">
                    <div class="feature">
                        <span class="feature-icon">📊</span>
                        <span>Real-time Analytics</span>
                    </div>
                    <div class="feature">
                        <span class="feature-icon">🎯</span>
                        <span>Booking Management</span>
                    </div>
                    <div class="feature">
                        <span class="feature-icon">🚚</span>
                        <span>Delivery Tracking</span>
                    </div>
                    <div class="feature">
                        <span class="feature-icon">🎤</span>
                        <span>Inventory Control</span>
                    </div>
                </div>
            </div>
            <div class="branding-footer">
                <p>&copy; 2026 CertiCode Videoke Rentals</p>
            </div>
        </div>

        <!-- Right Panel - Login Form -->
        <div class="admin-form-panel">
            <div class="form-wrapper">
                <div class="form-header">
                    <div class="admin-badge">
                        <svg class="badge-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                        </svg>
                        <span class="badge-text">ADMIN ACCESS</span>
                    </div>
                    <h2 class="form-title">Welcome Back</h2>
                    <p class="form-subtitle">Enter your credentials to access the admin dashboard</p>
                </div>

                <!-- Login Form -->
                <form id="adminLoginForm" class="login-form">
                    <div class="form-group">
                        <label for="username">Username</label>
                        <div class="input-wrapper">
                            <svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                                <circle cx="12" cy="7" r="4"/>
                            </svg>
                            <input 
                                type="text" 
                                id="username" 
                                name="username" 
                                placeholder="Enter your username"
                                autocomplete="username"
                                required
                            >
                        </div>
                    </div>

                    <div class="form-group">
                        <label for="password">Password</label>
                        <div class="input-wrapper">
                            <svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                            </svg>
                            <input 
                                type="password" 
                                id="password" 
                                name="password" 
                                placeholder="Enter your password"
                                autocomplete="current-password"
                                required
                            >
                            <button type="button" class="toggle-password" id="togglePassword" aria-label="Toggle password visibility">
                                <svg class="eye-icon eye-open" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                                    <circle cx="12" cy="12" r="3"/>
                                </svg>
                                <svg class="eye-icon eye-closed" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display:none;">
                                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                                    <line x1="1" y1="1" x2="23" y2="23"/>
                                </svg>
                            </button>
                        </div>
                    </div>

                    <div class="form-options">
                        <label class="remember-me">
                            <input type="checkbox" id="rememberMe" name="rememberMe">
                            <span class="checkmark"></span>
                            <span>Remember me</span>
                        </label>
                        <a href="admin/auth/forgot-password.php" class="forgot-link">Forgot password?</a>
                    </div>

                    <!-- Error Message -->
                    <div class="error-message" id="errorMessage" role="alert"></div>

                    <button type="submit" class="btn-login" id="loginBtn">
                        <span class="btn-text">Sign In</span>
                        <span class="btn-loader" hidden></span>
                    </button>
                </form>

                <div class="form-footer">
                    <p>Not an admin? <a href="index.php">Return to main site</a></p>
                </div>

                <!-- Demo Credentials -->
                <div class="demo-credentials">
                    <p class="demo-title">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
                            <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/>
                        </svg>
                        Demo Credentials
                    </p>
                    <div class="credentials-box">
                        <p><strong>Username:</strong> admin1</p>
                        <p><strong>Password:</strong> admin1</p>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Scripts -->
    <script src="admin/auth/js/auth.js"></script>
</body>
</html>



