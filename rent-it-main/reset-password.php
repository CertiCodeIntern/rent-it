<?php 
include_once 'config.php'; 
$token = isset($_GET['token']) ? mysqli_real_escape_string($conn, $_GET['token']) : '';
$isValid = false;

if ($token) {
    $now = date("Y-m-d H:i:s");
    $query = "SELECT id FROM users WHERE reset_token = '$token' AND reset_expiry > '$now'";
    $result = mysqli_query($conn, $query);
    if (mysqli_num_rows($result) > 0) { $isValid = true; }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>RentIT - Reset Password</title>

    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">

    <link rel="stylesheet" href="shared/css/theme.css">
    <link rel="stylesheet" href="shared/css/globals.css">
    <link rel="stylesheet" href="client/auth/css/auth.css">

    <script src="shared/js/theme.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
    <link rel="icon" type="image/png" href="assets/images/rIT_logo_tp.png">

    <style>
        /* Reset-password-specific overrides */
        .requirements {
            background: var(--bg-secondary);
            padding: 14px 16px;
            border-radius: var(--radius-sm);
            margin-bottom: var(--spacing-lg);
            text-align: left;
        }

        .req-item {
            color: var(--text-muted);
            font-size: var(--font-size-sm);
            display: flex;
            align-items: center;
            margin-bottom: 6px;
            transition: color 0.3s;
            line-height: 1.4;
        }

        .req-item:last-child {
            margin-bottom: 0;
        }

        .req-item.valid {
            color: #10b981;
            font-weight: var(--font-weight-semibold);
        }

        .match-indicator {
            font-size: var(--font-size-xs);
            margin-top: var(--spacing-xs);
            color: var(--text-muted);
            transition: color 0.3s;
        }

        .match-indicator.valid {
            color: #10b981;
            font-weight: var(--font-weight-semibold);
        }

        .expired-msg {
            color: #ef4444;
            font-weight: var(--font-weight-bold);
            font-size: var(--font-size-xl);
            margin-bottom: var(--spacing-xs);
        }

        .expired-text {
            color: var(--text-muted);
            font-size: var(--font-size-sm);
            margin-bottom: var(--spacing-lg);
            line-height: 1.5;
        }

        .expired-link {
            color: var(--accent);
            font-weight: var(--font-weight-bold);
            text-decoration: none;
            display: inline-block;
            padding: 10px 24px;
            border: 2px solid var(--accent);
            border-radius: var(--radius-sm);
            font-size: var(--font-size-sm);
            transition: background 0.2s, color 0.2s;
        }

        .expired-link:hover {
            background: var(--accent);
            color: var(--white);
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
                <h1>Create a new<br>password.</h1>
                <p>Set a strong password to secure your account and get back to renting.</p>
                <div class="auth-features">
                    <div class="auth-feature">
                        <div class="auth-feature-icon">◉</div>
                        <span>Minimum 8 characters</span>
                    </div>
                    <div class="auth-feature">
                        <div class="auth-feature-icon">◉</div>
                        <span>Uppercase & numbers required</span>
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
                <?php if ($isValid): ?>
                    <div class="auth-header stagger-child">
                        <h2>Set New Password</h2>
                        <p>Choose a strong password for your account.</p>
                    </div>

                    <form action="update-password.php" method="POST" id="resetForm" class="fade-in">
                        <input type="hidden" name="token" value="<?php echo htmlspecialchars($token); ?>">

                        <div class="auth-form-group stagger-child">
                            <label>New Password</label>
                            <input type="password" name="new_password" id="new_password" required placeholder="••••••••">
                        </div>

                        <div class="requirements stagger-child">
                            <div id="len" class="req-item">○ At least 8 characters</div>
                            <div id="upper" class="req-item">○ One uppercase letter</div>
                            <div id="num" class="req-item">○ One number</div>
                        </div>

                        <div class="auth-form-group stagger-child">
                            <label>Confirm Password</label>
                            <input type="password" name="confirm_password" id="confirm_password" required placeholder="••••••••">
                            <div id="match" class="match-indicator">○ Passwords must match</div>
                        </div>

                        <button type="submit" class="auth-btn stagger-child" id="submitBtn" disabled style="opacity: 0.3; cursor: not-allowed;">Update Password →</button>
                    </form>
                <?php else: ?>
                    <div class="auth-header stagger-child" style="text-align: center;">
                        <h2 class="expired-msg">Session Expired</h2>
                        <p class="expired-text">This reset link is no longer valid.</p>
                        <a href="forgot-password.php" class="expired-link">Request New Code</a>
                    </div>
                <?php endif; ?>

                <div class="auth-footer stagger-child">
                    <div class="auth-footer-icon">🔑</div>
                    <div class="auth-footer-text">
                        <span class="auth-footer-label">Remember your password?</span>
                        <span class="auth-footer-links">
                            <a href="index.php">Back to Login</a>
                        </span>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <?php if ($isValid): ?>
    <script>
        const passInput = document.getElementById('new_password');
        const confirmInput = document.getElementById('confirm_password');
        const submitBtn = document.getElementById('submitBtn');
        const reqs = {
            len: document.getElementById('len'),
            upper: document.getElementById('upper'),
            num: document.getElementById('num'),
            match: document.getElementById('match')
        };

        function validate() {
            const val = passInput.value;
            const confVal = confirmInput.value;
            const isLen = val.length >= 8;
            const isUpper = /[A-Z]/.test(val);
            const isNum = /[0-9]/.test(val);
            const isMatch = val === confVal && val !== '';

            reqs.len.classList.toggle('valid', isLen);
            reqs.len.innerHTML = isLen ? "✓ At least 8 characters" : "○ At least 8 characters";
            reqs.upper.classList.toggle('valid', isUpper);
            reqs.upper.innerHTML = isUpper ? "✓ One uppercase letter" : "○ One uppercase letter";
            reqs.num.classList.toggle('valid', isNum);
            reqs.num.innerHTML = isNum ? "✓ One number" : "○ One number";
            
            reqs.match.classList.toggle('valid', isMatch);
            reqs.match.innerHTML = isMatch ? "✓ Passwords match" : "○ Passwords must match";

            if (isLen && isUpper && isNum && isMatch) {
                submitBtn.disabled = false;
                submitBtn.style.opacity = "1";
                submitBtn.style.cursor = "pointer";
            } else {
                submitBtn.disabled = true;
                submitBtn.style.opacity = "0.3";
                submitBtn.style.cursor = "not-allowed";
            }
        }
        passInput.addEventListener('input', validate);
        confirmInput.addEventListener('input', validate);
    </script>
    <?php endif; ?>
</body>
</html>