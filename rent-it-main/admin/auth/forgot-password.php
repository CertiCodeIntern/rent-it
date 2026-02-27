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
    <meta name="description" content="RentIt Admin Portal - Reset Password">
    <title>Forgot Password - RentIt Admin</title>
    
    <!-- Google Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    
    <!-- Stylesheets -->
    <link rel="stylesheet" href="shared/css/theme.css">
    <link rel="stylesheet" href="shared/css/globals.css">
    <link rel="stylesheet" href="admin/auth/css/auth.css">
    <link rel="stylesheet" href="admin/auth/css/forgot-password.css">
    
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
                <h1 class="branding-title">Password Recovery</h1>
                <p class="branding-subtitle">Answer the security questions to verify your identity and reset your admin password.</p>
                
                <div class="branding-features">
                    <div class="feature">
                        <span class="feature-icon">🔒</span>
                        <span>Secure Verification</span>
                    </div>
                    <div class="feature">
                        <span class="feature-icon">❓</span>
                        <span>3 Security Questions</span>
                    </div>
                    <div class="feature">
                        <span class="feature-icon">🔑</span>
                        <span>Instant Reset</span>
                    </div>
                </div>
            </div>
            <div class="branding-footer">
                <p>&copy; 2026 CertiCode Videoke Rentals</p>
            </div>
        </div>

        <!-- Right Panel - Forgot Password Form -->
        <div class="admin-form-panel">
            <div class="form-wrapper">
                
                <!-- STEP 1: Security Questions -->
                <div id="stepQuestions" class="forgot-step active">
                    <div class="form-header">
                        <div class="admin-badge">
                            <svg class="badge-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
                                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                                <polyline points="16 17 21 12 16 7"/>
                                <line x1="21" y1="12" x2="9" y2="12"/>
                            </svg>
                            <span class="badge-text">PASSWORD RECOVERY</span>
                        </div>
                        <h2 class="form-title">Security Verification</h2>
                        <p class="form-subtitle">Answer all 3 questions correctly to reset your password</p>
                    </div>

                    <form id="securityForm" class="login-form">
                        <!-- Question 1 -->
                        <div class="form-group">
                            <label for="question1">
                                <span class="question-number">1</span>
                                What is the full name of the Project Manager of Team 1?
                            </label>
                            <div class="input-wrapper">
                                <svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                                    <circle cx="12" cy="7" r="4"/>
                                </svg>
                                <input 
                                    type="text" 
                                    id="question1" 
                                    name="question1" 
                                    placeholder="Enter full name"
                                    autocomplete="off"
                                    required
                                >
                            </div>
                        </div>

                        <!-- Question 2 -->
                        <div class="form-group">
                            <label for="question2">
                                <span class="question-number">2</span>
                                What is the full name of the Lead Developer?
                            </label>
                            <div class="input-wrapper">
                                <svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                                    <circle cx="12" cy="7" r="4"/>
                                </svg>
                                <input 
                                    type="text" 
                                    id="question2" 
                                    name="question2" 
                                    placeholder="Enter full name"
                                    autocomplete="off"
                                    required
                                >
                            </div>
                        </div>

                        <!-- Question 3 -->
                        <div class="form-group">
                            <label for="question3">
                                <span class="question-number">3</span>
                                What are the full names of the Backend Developers?
                            </label>
                            <div class="input-wrapper">
                                <svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                                    <circle cx="9" cy="7" r="4"/>
                                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                                    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                                </svg>
                                <input 
                                    type="text" 
                                    id="question3" 
                                    name="question3" 
                                    placeholder="Enter names separated by comma"
                                    autocomplete="off"
                                    required
                                >
                            </div>
                            <span class="input-hint">Separate multiple names with a comma</span>
                        </div>

                        <!-- Error Message -->
                        <div class="error-message" id="questionError" role="alert"></div>

                        <button type="submit" class="btn-login" id="verifyBtn">
                            <span class="btn-text">Verify Identity</span>
                            <span class="btn-loader" hidden></span>
                        </button>
                    </form>

                    <div class="form-footer">
                        <p>Remember your password? <a href="admin/auth/login.php">Back to Login</a></p>
                    </div>
                </div>

                <!-- STEP 2: New Password -->
                <div id="stepPassword" class="forgot-step">
                    <div class="form-header">
                        <div class="success-icon-wrapper">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="32" height="32">
                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                                <polyline points="22 4 12 14.01 9 11.01"/>
                            </svg>
                        </div>
                        <h2 class="form-title">Identity Verified</h2>
                        <p class="form-subtitle">Set your new admin password below</p>
                    </div>

                    <form id="resetForm" class="login-form">
                        <div class="form-group">
                            <label for="newPassword">New Password</label>
                            <div class="input-wrapper">
                                <svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                                </svg>
                                <input 
                                    type="password" 
                                    id="newPassword" 
                                    name="newPassword" 
                                    placeholder="Enter new password"
                                    minlength="4"
                                    required
                                >
                                <button type="button" class="toggle-password" id="toggleNewPassword" aria-label="Toggle password visibility">
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

                        <div class="form-group">
                            <label for="confirmPassword">Confirm Password</label>
                            <div class="input-wrapper">
                                <svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                                </svg>
                                <input 
                                    type="password" 
                                    id="confirmPassword" 
                                    name="confirmPassword" 
                                    placeholder="Confirm new password"
                                    minlength="4"
                                    required
                                >
                                <button type="button" class="toggle-password" id="toggleConfirmPassword" aria-label="Toggle password visibility">
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

                        <!-- Error Message -->
                        <div class="error-message" id="resetError" role="alert"></div>

                        <!-- Success Message -->
                        <div class="success-message" id="resetSuccess" role="status"></div>

                        <button type="submit" class="btn-login" id="resetBtn">
                            <span class="btn-text">Update Password</span>
                            <span class="btn-loader" hidden></span>
                        </button>
                    </form>

                    <div class="form-footer">
                        <p><a href="admin/auth/login.php">Back to Login</a></p>
                    </div>
                </div>

            </div>
        </div>
    </div>

    <!-- Scripts -->
    <script src="admin/auth/js/forgot-password.js"></script>
</body>
</html>
