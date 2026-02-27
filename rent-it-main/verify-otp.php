<?php include_once 'config.php'; ?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>RentIT - Verify Code</title>

    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">

    <link rel="stylesheet" href="shared/css/theme.css">
    <link rel="stylesheet" href="shared/css/globals.css">
    <link rel="stylesheet" href="client/auth/css/auth.css">

    <script src="shared/js/theme.js"></script>
    <link rel="icon" type="image/png" href="assets/images/rIT_logo_tp.png">

    <style>
        /* OTP-specific overrides */
        .otp-input {
            width: 100%;
            padding: var(--spacing-md) 0;
            font-size: 2.25rem;
            letter-spacing: 10px;
            text-align: center;
            border: none;
            border-bottom: 2px solid var(--border-color);
            margin-bottom: var(--spacing-lg);
            outline: none;
            font-weight: var(--font-weight-bold);
            font-family: inherit;
            background: transparent;
            color: var(--text-primary);
            transition: border-color 0.2s, color 0.3s;
        }

        .otp-input:focus {
            border-bottom-color: var(--accent);
        }

        .otp-input::placeholder {
            color: var(--text-muted);
            letter-spacing: 10px;
        }

        .resend-link {
            display: inline-block;
            margin-top: var(--spacing-lg);
            color: var(--text-muted);
            text-decoration: none;
            font-size: var(--font-size-sm);
            transition: color 0.2s;
        }

        .resend-link:hover {
            color: var(--accent);
            text-decoration: underline;
        }

        @media (max-width: 480px) {
            .otp-input {
                font-size: 1.75rem;
                letter-spacing: 8px;
            }
            .otp-input::placeholder {
                letter-spacing: 8px;
            }
        }

        @media (max-width: 375px) {
            .otp-input {
                font-size: 1.5rem;
                letter-spacing: 6px;
            }
            .otp-input::placeholder {
                letter-spacing: 6px;
            }
        }
    </style>
</head>
<body>
    <div class="auth-section">
        <a href="/rent-it/index.php" class="back-to-home" title="Back to home">← Home</a>

        <button class="theme-toggle" id="themeToggle" aria-label="Toggle theme">
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
                    <img src="assets/images/rIT_logo_tp.png" alt="RentIT Logo" class="auth-logo-icon">
                    <div class="auth-logo-text">RentIT</div>
                </div>
                <h1>Verify your<br>identity.</h1>
                <p>Enter the 6-digit code sent to your email to continue the password reset process.</p>
                <div class="auth-features">
                    <div class="auth-feature">
                        <div class="auth-feature-icon">◉</div>
                        <span>6-digit security code</span>
                    </div>
                    <div class="auth-feature">
                        <div class="auth-feature-icon">◉</div>
                        <span>10-minute expiry</span>
                    </div>
                </div>
            </div>
        </div>

        <div class="auth-right">
            <div class="mobile-logo stagger-child">
                <img src="assets/images/rIT_logo_tp.png" alt="RentIT Logo" class="mobile-logo-icon">
                <div class="mobile-logo-text">RentIT</div>
            </div>

            <div class="auth-card">
                <div class="auth-header stagger-child">
                    <h2>Verify Code</h2>
                    <p>Enter the 6-digit code we sent to your email to continue.</p>
                </div>

                <form action="process-verify.php" method="POST" class="fade-in">
                    <input type="hidden" name="email" value="<?php echo htmlspecialchars($_GET['email'] ?? ''); ?>">

                    <div class="auth-form-group stagger-child">
                        <input type="text" name="otp" class="otp-input" maxlength="6" placeholder="000000" required autocomplete="off" inputmode="numeric">
                    </div>

                    <button type="submit" class="auth-btn stagger-child">Verify Access →</button>
                </form>

                <div class="auth-footer stagger-child">
                    <div class="auth-footer-icon">🔐</div>
                    <div class="auth-footer-text">
                        <span class="auth-footer-label">Didn't receive the code?</span>
                        <span class="auth-footer-links">
                            <a href="forgot-password.php">Resend code</a>
                        </span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</body>
</html>