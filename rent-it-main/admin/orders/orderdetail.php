<?php
session_start();
if (!isset($_SESSION['admin_logged_in']) || $_SESSION['admin_logged_in'] !== true) {
    header('Location: /rent-it/admin/auth/login.php');
    exit();
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <base href="/rent-it/">
    <script src="admin/shared/js/admin-theme.js"></script>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="RentIt Admin - Order Details">
    <title>Order Details - RentIt Admin</title>
    
    <!-- Favicon -->
    <link rel="icon" type="image/png" href="assets/images/rIT_logo_tp.png">
    <link rel="apple-touch-icon" href="assets/images/rIT_logo_tp.png">
    
    <!-- Google Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    
    <!-- Admin Stylesheets -->
    <link rel="stylesheet" href="admin/shared/css/admin-theme.css">
    <link rel="stylesheet" href="admin/shared/css/admin-globals.css">
    <link rel="stylesheet" href="admin/shared/css/admin-components.css">
    <link rel="stylesheet" href="admin/orders/css/orders.css">
    <link rel="stylesheet" href="admin/orders/css/orderdetail.css">
</head>
<body>
    <div class="admin-skeleton-overlay" aria-hidden="true">
        <div class="admin-skeleton-shell">
            <aside class="admin-skeleton-sidebar">
                <div class="admin-skeleton-logo"></div>
                <div class="admin-skeleton-nav">
                    <span class="admin-skeleton-pill w-70"></span>
                    <span class="admin-skeleton-pill w-60"></span>
                    <span class="admin-skeleton-pill w-80"></span>
                    <span class="admin-skeleton-pill w-50"></span>
                    <span class="admin-skeleton-pill w-70"></span>
                </div>
                <div class="admin-skeleton-user">
                    <span class="admin-skeleton-circle"></span>
                    <span class="admin-skeleton-line w-60" style="height: 12px;"></span>
                </div>
            </aside>
            <section class="admin-skeleton-main">
                <div class="admin-skeleton-topbar">
                    <span class="admin-skeleton-line w-40" style="height: 14px;"></span>
                    <span class="admin-skeleton-circle"></span>
                </div>
                <div class="admin-skeleton-card">
                    <div class="admin-skeleton-row admin-skeleton-kpis">
                        <span class="admin-skeleton-block w-60" style="height: 14px;"></span>
                        <span class="admin-skeleton-block w-50" style="height: 14px;"></span>
                        <span class="admin-skeleton-block w-70" style="height: 14px;"></span>
                        <span class="admin-skeleton-block w-40" style="height: 14px;"></span>
                    </div>
                </div>
                <div class="admin-skeleton-card">
                    <div class="admin-skeleton-row" style="grid-template-columns: 1fr auto;">
                        <span class="admin-skeleton-line w-40" style="height: 14px;"></span>
                        <span class="admin-skeleton-pill w-20"></span>
                    </div>
                    <div class="admin-skeleton-table">
                        <div class="admin-skeleton-row">
                            <span class="admin-skeleton-block w-50" style="height: 12px;"></span>
                            <span class="admin-skeleton-block w-30" style="height: 12px;"></span>
                            <span class="admin-skeleton-block w-20" style="height: 12px;"></span>
                            <span class="admin-skeleton-block w-40" style="height: 12px;"></span>
                        </div>
                        <div class="admin-skeleton-row">
                            <span class="admin-skeleton-block w-60" style="height: 12px;"></span>
                            <span class="admin-skeleton-block w-25" style="height: 12px;"></span>
                            <span class="admin-skeleton-block w-30" style="height: 12px;"></span>
                            <span class="admin-skeleton-block w-20" style="height: 12px;"></span>
                        </div>
                        <div class="admin-skeleton-row">
                            <span class="admin-skeleton-block w-40" style="height: 12px;"></span>
                            <span class="admin-skeleton-block w-35" style="height: 12px;"></span>
                            <span class="admin-skeleton-block w-25" style="height: 12px;"></span>
                            <span class="admin-skeleton-block w-30" style="height: 12px;"></span>
                        </div>
                    </div>
                </div>
                <div class="admin-skeleton-loader">
                    <span class="admin-skeleton-spinner" aria-hidden="true"></span>
                    <span>Loading admin content...</span>
                </div>
            </section>
        </div>
    </div>
    <div class="admin-wrapper">
        <!-- Sidebar Container -->
        <div id="sidebarContainer"></div>
        
        <!-- Main Content -->
        <main class="admin-main">
            <!-- Header Container -->
            <div id="headerContainer"></div>
            
            <!-- Content Area -->
            <div class="admin-content">
                <!-- Page Header with Back Button -->
                <div class="admin-page-header">
                    <div class="page-header-left">
                        <a href="admin/orders/orders.php" class="back-link" title="Back to orders">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
                                <line x1="19" y1="12" x2="5" y2="12"/>
                                <polyline points="12 19 5 12 12 5"/>
                            </svg>
                        </a>
                        <div>
                            <div class="order-header-top">
                                <h1 class="admin-page-title" id="orderIdTitle">ORD-2025-0142</h1>
                                <span class="status-badge pending" id="orderStatusBadge">Pending</span>
                            </div>
                            <p class="admin-page-subtitle" id="orderDate">Placed on January 28, 2025 at 10:30 AM</p>
                        </div>
                    </div>
                    <div class="admin-page-actions" id="orderActions">
                        <!-- Actions will be populated based on order status -->
                    </div>
                </div>

                <!-- Order Detail Grid -->
                <div class="order-detail-grid">
                    <!-- Left Column -->
                    <div class="order-detail-left">
                        <!-- Customer Information -->
                        <section class="detail-card">
                            <div class="detail-card-header">
                                <h2 class="detail-card-title">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
                                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                                        <circle cx="12" cy="7" r="4"/>
                                    </svg>
                                    Customer Information
                                </h2>
                                <a href="admin/customers/customers.php" class="detail-card-link">View Profile</a>
                            </div>
                            <div class="detail-card-body">
                                <div class="customer-detail">
                                    <div class="customer-avatar-lg" id="customerAvatar">J</div>
                                    <div class="customer-detail-info">
                                        <h3 class="customer-detail-name" id="customerName">John Doe</h3>
                                        <p class="customer-detail-email" id="customerEmail">john.doe@email.com</p>
                                        <p class="customer-detail-phone" id="customerPhone">+63 912 345 6789</p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <!-- Rental Items -->
                        <section class="detail-card">
                            <div class="detail-card-header">
                                <h2 class="detail-card-title">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
                                        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                                        <line x1="3" y1="6" x2="21" y2="6"/>
                                        <path d="M16 10a4 4 0 0 1-8 0"/>
                                    </svg>
                                    Rental Items
                                </h2>
                                <span class="item-count-badge" id="itemCountBadge">2 items</span>
                            </div>
                            <div class="detail-card-body">
                                <div class="rental-items-list" id="rentalItemsList">
                                    <!-- Items will be populated by JavaScript -->
                                </div>
                            </div>
                        </section>

                        <!-- Order Timeline -->
                        <section class="detail-card">
                            <div class="detail-card-header">
                                <h2 class="detail-card-title">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
                                        <circle cx="12" cy="12" r="10"/>
                                        <polyline points="12 6 12 12 16 14"/>
                                    </svg>
                                    Order Timeline
                                </h2>
                            </div>
                            <div class="detail-card-body">
                                <div class="timeline" id="orderTimeline">
                                    <!-- Timeline will be populated by JavaScript -->
                                </div>
                            </div>
                        </section>
                    </div>

                    <!-- Right Column -->
                    <div class="order-detail-right">
                        <!-- Delivery Information -->
                        <section class="detail-card">
                            <div class="detail-card-header">
                                <h2 class="detail-card-title">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
                                        <rect x="1" y="3" width="15" height="13"/>
                                        <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
                                        <circle cx="5.5" cy="18.5" r="2.5"/>
                                        <circle cx="18.5" cy="18.5" r="2.5"/>
                                    </svg>
                                    Delivery Information
                                </h2>
                            </div>
                            <div class="detail-card-body">
                                <div class="info-row">
                                    <span class="info-label">Method</span>
                                    <span class="info-value" id="deliveryMethod">Delivery</span>
                                </div>
                                <div class="info-row">
                                    <span class="info-label">Address</span>
                                    <span class="info-value" id="deliveryAddress">123 Main Street, Makati City, Metro Manila 1200</span>
                                </div>
                                <div class="info-row">
                                    <span class="info-label">Scheduled</span>
                                    <span class="info-value" id="deliverySchedule">Jan 30, 2025 • 10:00 AM - 12:00 PM</span>
                                </div>
                                <div class="info-row">
                                    <span class="info-label">Driver</span>
                                    <span class="info-value" id="driverName">Not Assigned</span>
                                </div>
                                <div class="info-row">
                                    <span class="info-label">Notes</span>
                                    <span class="info-value" id="deliveryNotes">Leave at front desk if not available</span>
                                </div>
                                <div class="status-action" id="statusActionContainer">
                                    <!-- Status action button will be populated by JS -->
                                </div>
                            </div>
                        </section>

                        <!-- Payment Summary -->
                        <section class="detail-card">
                            <div class="detail-card-header">
                                <h2 class="detail-card-title">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
                                        <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
                                        <line x1="1" y1="10" x2="23" y2="10"/>
                                    </svg>
                                    Payment Summary
                                </h2>
                                <span class="payment-badge paid" id="paymentBadge">Paid</span>
                            </div>
                            <div class="detail-card-body">
                                <div class="payment-rows" id="paymentRows">
                                    <!-- Payment breakdown will be populated -->
                                </div>
                                <div class="payment-total">
                                    <span>Total</span>
                                    <span id="paymentTotal">₱711.00</span>
                                </div>
                                <div class="payment-method-info">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                                        <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
                                        <line x1="1" y1="10" x2="23" y2="10"/>
                                    </svg>
                                    <span id="paymentMethodText">Visa ending in 4242</span>
                                </div>
                            </div>
                        </section>

                        <!-- Notes -->
                        <section class="detail-card">
                            <div class="detail-card-header">
                                <h2 class="detail-card-title">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
                                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                                        <polyline points="14 2 14 8 20 8"/>
                                        <line x1="16" y1="13" x2="8" y2="13"/>
                                        <line x1="16" y1="17" x2="8" y2="17"/>
                                        <polyline points="10 9 9 9 8 9"/>
                                    </svg>
                                    Order Notes
                                </h2>
                                <button class="btn btn-sm btn-ghost" id="addNoteBtn">Add Note</button>
                            </div>
                            <div class="detail-card-body">
                                <div class="notes-list" id="notesList">
                                    <!-- Notes will be populated -->
                                </div>
                            </div>
                        </section>
                    </div>
                </div>
            </div>

            <!-- Footer Container -->
            <div id="footerContainer"></div>
        </main>
    </div>

    <!-- Admin Scripts -->
    <script src="admin/shared/js/admin-components.js"></script>
    <script src="admin/orders/js/orderdetail.js"></script>
    <script>
        document.addEventListener('DOMContentLoaded', function() {
            AdminComponents.injectSidebar('sidebarContainer', 'orders');
            AdminComponents.injectHeader('headerContainer', 'Order Details');
            AdminComponents.injectFooter('footerContainer');
        });
    </script>
</body>
</html>



