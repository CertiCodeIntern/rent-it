<?php
session_start();
include '../../shared/php/db_connection.php';
include '../../shared/php/auth_check.php';

$user_id = intval($_SESSION['user_id']);
$user_query = mysqli_query($conn, "SELECT full_name, email, membership_level FROM USERS WHERE id = $user_id LIMIT 1");
$user_data = mysqli_fetch_assoc($user_query);
$full_name = $user_data['full_name'] ?? 'Valued Customer';
$email = $user_data['email'] ?? '';
$membership = $user_data['membership_level'] ?? 'Customer';
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Contact Support | RentIT</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <link rel="icon" type="image/png" href="/rent-it/assets/images/rIT_logo_tp.png">
    <link rel="stylesheet" href="../../shared/css/theme.css">
    <link rel="stylesheet" href="../../shared/css/globals.css">
    <link rel="stylesheet" href="../dashboard/dashboard.css">
    <link rel="stylesheet" href="contactusloggedin.css">
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
    <div class="app-container">
        <div id="sidebarContainer"></div>

        <main class="main-content">
            <div id="topbarContainer"></div>

            <div class="content-area contact-page">
                <div class="page-header-contact">
                    <div>
                        <p class="eyebrow">Support Center</p>
                        <h1 class="page-title">We’re here to help</h1>
                        <p class="page-sub">Reach us anytime. For members like you (<?php echo htmlspecialchars($membership); ?>), we prioritize fast responses.</p>
                    </div>
                    <div class="status-card">
                        <div class="status-dot online"></div>
                        <div>
                            <p class="status-label">Live support</p>
                            <p class="status-value">~15 min average response</p>
                        </div>
                    </div>
                </div>

                <section class="contact-grid">
                    <article class="contact-card">
                        <header class="card-header">
                            <div>
                                <p class="eyebrow">Create a ticket</p>
                                <h2>Send us a message</h2>
                                <p class="muted">We’ll route this to the right team and email you updates.</p>
                            </div>
                            <span class="badge">Priority: Standard</span>
                        </header>
                        <form class="contact-form" id="contactSupportForm">
                            <div class="form-row">
                                <label for="name">Full Name</label>
                                <input type="text" id="name" name="name" value="<?php echo htmlspecialchars($full_name); ?>" placeholder="Your name" required>
                            </div>
                            <div class="form-row">
                                <label for="email">Email Address</label>
                                <input type="email" id="email" name="email" value="<?php echo htmlspecialchars($email); ?>" placeholder="you@example.com" required>
                            </div>
                            <div class="form-row">
                                <label for="subject">Subject</label>
                                <select id="subject" name="subject" required>
                                    <option value="">Choose a topic</option>
                                    <option value="rental">Rental question</option>
                                    <option value="billing">Billing & payments</option>
                                    <option value="technical">Technical issue</option>
                                    <option value="returns">Returns & extensions</option>
                                    <option value="feedback">Product feedback</option>
                                </select>
                            </div>
                            <div class="form-row">
                                <label for="message">Message</label>
                                <textarea id="message" name="message" rows="5" placeholder="Tell us how we can help" required></textarea>
                            </div>
                            <div class="form-actions">
                                <button type="button" class="btn ghost" id="callUsBtn">Call support</button>
                                <button type="submit" class="btn primary">Send message</button>
                            </div>
                            <p class="small muted">We’ll reply to <?php echo htmlspecialchars($email ?: 'your email'); ?>. SLA: <strong>within 4 business hours</strong>.</p>
                        </form>
                    </article>

                    <article class="contact-card info-card">
                        <h3>Quick help</h3>
                        <div class="info-list">
                            <div class="info-item">
                                <div class="info-icon">📧</div>
                                <div>
                                    <p class="info-title">Email us</p>
                                    <a href="mailto:support@rentit.ph">support@rentit.ph</a>
                                    <p class="muted">We reply fast during business hours.</p>
                                </div>
                            </div>
                            <div class="info-item">
                                <div class="info-icon">📞</div>
                                <div>
                                    <p class="info-title">Call hotline</p>
                                    <a href="tel:+639554216789" class="phone-highlight">+63 955 421 6789</a>
                                    <p class="muted">Mon-Fri, 8:00 AM - 5:00 PM</p>
                                </div>
                            </div>
                        </div>
                        <div class="divider"></div>
                        <div class="support-meta">
                            <div>
                                <p class="meta-label">Recent incidents</p>
                                <p class="meta-value success">All systems normal</p>
                            </div>
                            <div>
                                <p class="meta-label">Average resolution</p>
                                <p class="meta-value">2h 15m</p>
                            </div>
                        </div>
                        <div class="cta-stack">
                            <a class="cta-link" href="../bookinghistory/bookinghistory.php">View your recent bookings →</a>
                            <a class="cta-link" href="../returns/returns.php">Request a return/extension →</a>
                        </div>
                    </article>
                </section>
            </div>
            <div id="footerContainer"></div>
        </main>
    </div>

    <script src="../../shared/js/components.js"></script>
    <script src="contactusloggedin.js"></script>
    <script>
        document.addEventListener('DOMContentLoaded', () => {
            const userData = <?php echo json_encode([
                'name' => $full_name,
                'email' => $email,
                'role' => 'Customer',
            ], JSON_HEX_TAG | JSON_HEX_APOS | JSON_HEX_QUOT | JSON_HEX_AMP); ?>;

            Components.injectSidebar('sidebarContainer', 'contact', 'client');
            Components.injectTopbar('topbarContainer', 'Contact Support');
            Components.initStaggerAnimation('.contact-grid');
            Components.injectFooter('footerContainer');

            if (!localStorage.getItem('user')) {
                localStorage.setItem('user', JSON.stringify(userData));
            }
        });
    </script>
</body>
</html>
