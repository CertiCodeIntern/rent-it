<?php
session_start();
include '../../shared/php/db_connection.php';
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="CertiCode - Videoke Rental Management System. Login or create an account to manage your rentals.">
    <title>CertiCode - Login</title>
    
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    
    <link rel="stylesheet" href="../../shared/css/theme.css">
    <link rel="stylesheet" href="../../shared/css/globals.css">
    <link rel="stylesheet" href="css/auth.css">

    <style>
        /* This page does not use the dashboard skeleton loader.
           Hide it to avoid the big empty "Loading content..." area. */
        .page-skeleton-overlay {
            display: none !important;
        }
    </style>
    
    <!-- Theme Script (Prevents flash of wrong theme) -->
    <script src="../../shared/js/theme.js"></script>
    
    <link rel="icon" type="image/png" href="/rent-it/assets/images/rIT_logo_tp.png">
</head>
<body>
    <div class="page-skeleton-overlay" aria-hidden="true">
        <div class="page-skeleton-shell">
            <aside class="page-skeleton-sidebar">
                <div class="page-skeleton-logo skeleton-shape"></div>
                <div class="page-skeleton-nav">
                    <span class="page-skeleton-pill skeleton-shape w-70"></span>
                    <span class="page-skeleton-pill skeleton-shape w-60"></span>
                    <span class="page-skeleton-pill skeleton-shape w-80"></span>
                    <span class="page-skeleton-pill skeleton-shape w-50"></span>
                    <span class="page-skeleton-pill skeleton-shape w-70"></span>
                </div>
                <div class="page-skeleton-user">
                    <span class="page-skeleton-circle skeleton-shape"></span>
                    <span class="page-skeleton-line skeleton-shape w-60" style="height: 12px;"></span>
                </div>
            </aside>
            <section class="page-skeleton-main">
                <div class="page-skeleton-topbar">
                    <span class="page-skeleton-line skeleton-shape w-30" style="height: 14px;"></span>
                    <span class="page-skeleton-circle skeleton-shape"></span>
                </div>
                <div class="page-skeleton-card">
                    <div class="page-skeleton-row" style="grid-template-columns: 1fr auto;">
                        <span class="page-skeleton-line skeleton-shape w-40" style="height: 14px;"></span>
                        <span class="page-skeleton-pill skeleton-shape w-20"></span>
                    </div>
                    <div class="page-skeleton-table">
                        <div class="page-skeleton-row">
                            <span class="page-skeleton-line skeleton-shape w-35 page-skeleton-block"></span>
                            <span class="page-skeleton-line skeleton-shape w-25 page-skeleton-block"></span>
                            <span class="page-skeleton-line skeleton-shape w-20 page-skeleton-block"></span>
                            <span class="page-skeleton-line skeleton-shape w-15 page-skeleton-block"></span>
                        </div>
                        <div class="page-skeleton-row">
                            <span class="page-skeleton-line skeleton-shape w-40 page-skeleton-block"></span>
                            <span class="page-skeleton-line skeleton-shape w-30 page-skeleton-block"></span>
                            <span class="page-skeleton-line skeleton-shape w-20 page-skeleton-block"></span>
                            <span class="page-skeleton-line skeleton-shape w-15 page-skeleton-block"></span>
                        </div>
                        <div class="page-skeleton-row">
                            <span class="page-skeleton-line skeleton-shape w-50 page-skeleton-block"></span>
                            <span class="page-skeleton-line skeleton-shape w-25 page-skeleton-block"></span>
                            <span class="page-skeleton-line skeleton-shape w-20 page-skeleton-block"></span>
                            <span class="page-skeleton-line skeleton-shape w-15 page-skeleton-block"></span>
                        </div>
                    </div>
                </div>
                <div class="page-skeleton-loader">
                    <span class="page-skeleton-spinner" aria-hidden="true"></span>
                    <span>Loading content...</span>
                </div>
            </section>
        </div>
    </div>
    <div class="auth-section">
        <a href="/rent-it/" class="back-to-home" title="Back to home">← Home</a>
        
        <!-- Theme Toggle (match React auth page styling) -->
        <button class="auth-theme-toggle" id="themeToggle" aria-label="Toggle theme">
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
        
        <div class="auth-left">
            <div class="auth-left-content">
                <div class="auth-logo">
                    <img src="../../assets/images/rIT_logo_tp.png" alt="RentIT Logo" class="auth-logo-icon">
                    <div class="auth-logo-text">RentIT</div>
                </div>
                <h1>Manage Your<br>Videoke Beats.</h1>
                <p>The all-in-one platform for your Videoke rental business. Track equipment, manage bookings, and grow your revenue effortlessly.</p>
                <div class="auth-features">
                    <div class="auth-feature">
                        <div class="auth-feature-icon">◉</div>
                        <span>Real-time Tracking</span>
                    </div>
                    <div class="auth-feature">
                        <div class="auth-feature-icon">◉</div>
                        <span>Automated Billing</span>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="auth-right">
            <div class="mobile-logo stagger-child">
                <img src="../../assets/images/rIT_logo_tp.png" alt="RentIT Logo" class="mobile-logo-icon">
                <div class="mobile-logo-text">RentIT</div>
            </div>
            
            <div class="auth-card">
                <div class="auth-header stagger-child">
                    <h2>Welcome Back</h2>
                    <p>Please enter your details to access your dashboard.</p>
                </div>
                
                <div class="auth-tabs stagger-child">
                    <div class="tab-indicator" id="tabIndicator"></div>
                    <button type="button" class="auth-tab active" id="loginTab">Login</button>
                    <button type="button" class="auth-tab" id="registerTab">Register</button>
                </div>
                
                <div class="form-wrapper fade-in" id="formWrapper">
                    <form id="loginForm">
                        <div class="auth-form-group stagger-child">
                            <label for="loginEmail">Email Address</label>
                            <input type="email" id="loginEmail" placeholder="name@company.com" required>
                        </div>
                        <div class="auth-form-group stagger-child">
                            <label for="loginPassword">Password</label>
                            <div class="password-wrapper">
                                <input type="password" id="loginPassword" placeholder="••••••••" required>
                                <button type="button" class="eye-btn" aria-label="Show password">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                                    </svg>
                                </button>
                            </div>
                        </div>
                        <div class="auth-remember stagger-child">
                            <label><input type="checkbox" id="rememberMe"> Remember me</label>
                            <a href="../../forgot-password.php">Forgot password?</a>
                        </div>
                        
                        <div class="auth-message error hidden" id="loginError"></div>
                        
                        <button type="submit" class="auth-btn stagger-child">Sign In  →</button>
                    </form>

                        <div class="auth-form-group stagger-child">
                            <label for="registerEmail">Email Address</label>
                            <input type="email" id="registerEmail" placeholder="name@company.com" required>
                        </div>

                        <div class="form-row stagger-child">
                            <div class="auth-form-group">
                                <label for="registerPassword">Password</label>
                                <div class="password-wrapper">
                                    <input type="password" id="registerPassword" 
                                           placeholder="••••••••" 
                                           required 
                                           pattern="(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}"
                                           title="Must contain at least one number and one uppercase and lowercase letter, and at least 8 or more characters">
                                    <button type="button" class="eye-btn" aria-label="Show password">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                                        </svg>
                                    </button>
                                </div>
                            </div>

                            <div class="auth-form-group">
                                <label for="registerConfirmPassword">Confirm Password</label>
                                <div class="password-wrapper">
                                    <input type="password" id="registerConfirmPassword" placeholder="••••••••" required>
                                    <button type="button" class="eye-btn" aria-label="Show password">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                                        </svg>
                                    </button>
                                </div>
                                <div id="passwordMatchMessage" style="font-size: 0.8rem; margin-top: 5px;"></div>
                            </div>
                        </div>

                        <div class="password-requirements" id="passwordRequirements">
                            <p style="margin-top: 10px; font-weight: 600; font-size: 0.85rem; margin-bottom: 5px;">Password must include:</p>
                            <ul style="list-style: none; padding-left: 5px; font-size: 0.8rem; margin: 0;">
                                <li id="reqLength" class="invalid">At least 8 characters</li>
                                <li id="reqUpper" class="invalid">At least one uppercase letter</li>
                                <li id="reqNumber" class="invalid">At least one number</li>
                            </ul>
                        </div>

                        <div class="auth-message error hidden" id="authError"></div>

                        <button type="submit" class="auth-btn stagger-child">Get Started  →</button>
                    </form>

                    <div class="auth-divider stagger-child">
                        <span>Or continue with</span>
                    </div>
                    
                    <div class="auth-social stagger-child">
                        <a href="/rent-it/fb-login.php" class="auth-social-btn facebook-btn">
                            <svg viewBox="0 0 24 24" fill="currentColor" style="width:18px; height:18px;">
                                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                            </svg>
                            Facebook
                        </a>

<a href="/rent-it/google-login.php" class="auth-social-btn">
    <svg viewBox="0 0 24 24" width="20" height="20">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
    Google
</a>
                    </div>
                </div>
                
                <div class="auth-footer stagger-child">
                    <div class="auth-footer-icon">🔒</div>
                    <div class="auth-footer-text">
                        <span class="auth-footer-label">Secure sign-in • Your data stays private</span>
                        <span class="auth-footer-links">
                            By continuing, you agree to our
                            <a href="/rent-it/pages/terms.html">Terms</a> and <a href="/rent-it/pages/privacy-policy.html">Privacy Policy</a>.
                        </span>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <script src="../../shared/js/components.js"></script>
    <script src="js/auth.js"></script>
</body>
</html>
