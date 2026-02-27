<?php
http_response_code(404);
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Page Not Found | RentIT</title>
    <link rel="icon" type="image/png" href="/rent-it/assets/images/rIT_logo_tp.png">
    <link rel="stylesheet" href="/rent-it/shared/css/theme.css">
    <style>
        * { box-sizing: border-box; }
        body {
            margin: 0;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background:
                radial-gradient(circle at 18% 22%, rgba(230, 126, 34, 0.08), transparent 36%),
                radial-gradient(circle at 82% 6%, rgba(1, 58, 99, 0.14), transparent 34%),
                radial-gradient(circle at 74% 78%, rgba(14, 165, 233, 0.08), transparent 40%),
                var(--bg-primary);
            color: var(--text-primary);
            font-family: "Inter", system-ui, -apple-system, sans-serif;
            padding: 24px;
        }
        .card {
            width: min(900px, 100%);
            background: linear-gradient(140deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.02)), var(--bg-card);
            border: 1px solid var(--border-color);
            border-radius: var(--radius-xl);
            padding: 36px;
            position: relative;
            overflow: hidden;
            box-shadow: var(--shadow-xl);
        }
        .card::before {
            content: "";
            position: absolute;
            inset: 0;
            background:
                radial-gradient(circle at 14% 18%, rgba(251, 112, 18, 0.06), transparent 38%),
                radial-gradient(circle at 88% 84%, rgba(1, 58, 99, 0.12), transparent 42%);
            pointer-events: none;
        }
        .header {
            display: flex;
            align-items: center;
            gap: 14px;
            margin-bottom: 22px;
        }
        .logo {
            width: 48px;
            height: 48px;
            border-radius: var(--radius);
            background: linear-gradient(135deg, var(--brand-primary), var(--brand-primary-light));
            display: grid;
            place-items: center;
            box-shadow: 0 12px 30px rgba(1, 58, 99, 0.28);
        }
        .logo img { width: 32px; height: 32px; object-fit: contain; }
        .title {
            margin: 0;
            font-size: 24px;
            letter-spacing: -0.01em;
            color: var(--heading-primary);
        }
        .subtitle {
            margin: 4px 0 0 0;
            color: var(--text-tertiary);
            font-size: 15px;
        }
        .content {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 28px;
            align-items: center;
        }
        .big {
            font-size: 88px;
            font-weight: 800;
            margin: 0;
            letter-spacing: -0.04em;
            color: var(--heading-primary);
        }
        .hint {
            margin: 14px 0 0;
            color: var(--text-secondary);
            line-height: 1.6;
        }
        .actions {
            display: flex;
            gap: 12px;
            margin-top: 20px;
            flex-wrap: wrap;
        }
        .btn {
            padding: 12px 16px;
            border-radius: var(--radius);
            border: 1px solid var(--border-color);
            background: var(--bg-secondary);
            color: var(--text-primary);
            font-weight: 600;
            cursor: pointer;
            transition: var(--transition-fast);
            box-shadow: var(--shadow-sm);
        }
        .btn.primary {
            background: linear-gradient(130deg, var(--accent), var(--brand-primary-light));
            border: none;
            box-shadow: 0 15px 35px rgba(1, 58, 99, 0.28);
            color: var(--text-on-nav);
        }
        .btn:hover { transform: translateY(-1px); border-color: var(--border-medium); box-shadow: var(--shadow-md); }
        .btn.primary:hover { box-shadow: 0 18px 40px rgba(1, 58, 99, 0.36); }
        .loader {
            width: 80px;
            height: 80px;
            border-radius: 50%;
            border: 7px solid rgba(148, 163, 184, 0.2);
            border-top-color: var(--accent);
            border-right-color: var(--brand-primary-light);
            animation: spin 1s linear infinite;
            margin: 0 auto 14px;
        }
        .loading-copy { text-align: center; color: var(--text-tertiary); font-size: 14px; }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* Responsive refinements */
        @media (max-width: 1024px) {
            body { padding: 20px; }
            .card { padding: 30px; }
            .content { gap: 22px; }
        }
        @media (max-width: 768px) {
            body { padding: 18px; }
            .card { padding: 26px; }
            .content { grid-template-columns: 1fr; gap: 18px; }
            .header { align-items: flex-start; }
            .big { font-size: 72px; }
            .actions { width: 100%; }
            .btn { flex: 1 1 100%; text-align: center; }
            .loader { width: 70px; height: 70px; }
        }
        @media (max-width: 480px) {
            body { padding: 14px; }
            .card { padding: 22px; border-radius: var(--radius-lg); }
            .title { font-size: 20px; }
            .subtitle { font-size: 14px; }
            .big { font-size: 60px; }
            .actions { flex-direction: column; gap: 10px; }
            .btn { width: 100%; }
        }
    </style>
    <script>
        (() => {
            const savedTheme = localStorage.getItem('theme');
            if (savedTheme === 'dark' || savedTheme === 'light') {
                document.documentElement.setAttribute('data-theme', savedTheme);
            }
        })();
    </script>
</head>
<body>
    <div class="card">
        <div class="header">
            <div class="logo"><img src="/rent-it/assets/images/rIT_logo_tp.png" alt="RentIT logo"></div>
            <div>
                <p class="title">You seem a bit lost</p>
                <p class="subtitle">We’ll guide you back in a second</p>
            </div>
        </div>
        <div class="content">
            <div>
                <p class="big">404</p>
                <p class="hint">The page you’re looking for doesn’t exist or moved. We’re sending you to a safe place.</p>
                <div class="actions">
                    <button id="ctaBtn" class="btn primary">Go to dashboard</button>
                    <button id="homeBtn" class="btn">Go to landing</button>
                </div>
            </div>
            <div>
                <div class="loader"></div>
                <div class="loading-copy">Redirecting you automatically…</div>
            </div>
        </div>
    </div>
    <script>
        (() => {
            const BASE_URL = '/rent-it';
            const dashboardUrl = `${BASE_URL}/client/dashboard/dashboard.php`;
            const landingUrl = `${BASE_URL}/index.php`;
            const storedUser = localStorage.getItem('user');
            const hasUser = !!storedUser;
            const redirectTarget = hasUser ? dashboardUrl : landingUrl;
            const ctaBtn = document.getElementById('ctaBtn');
            const homeBtn = document.getElementById('homeBtn');

            if (!hasUser) {
                ctaBtn.textContent = 'Go to landing';
            }

            const go = (target) => { window.location.href = target; };

            setTimeout(() => go(redirectTarget), 1400);
            ctaBtn.addEventListener('click', () => go(redirectTarget));
            homeBtn.addEventListener('click', () => go(landingUrl));
        })();
    </script>
</body>
</html>
