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
    <meta name="description" content="RentIt Admin - Order Management">
    <title>Orders - RentIt Admin</title>
    
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
                <!-- Page Header -->
                <div class="admin-page-header">
                    <div>
                        <h1 class="admin-page-title">Orders</h1>
                        <p class="admin-page-subtitle">Manage all incoming rental orders from customers</p>
                    </div>
                    <div class="admin-page-actions">
                        <button class="btn btn-secondary" id="exportOrdersBtn" title="Export orders data">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                                <polyline points="7 10 12 15 17 10"/>
                                <line x1="12" y1="15" x2="12" y2="3"/>
                            </svg>
                            Export
                        </button>
                        <button class="btn btn-secondary" id="refreshOrdersBtn" title="Refresh orders list">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                                <polyline points="23 4 23 10 17 10"/>
                                <polyline points="1 20 1 14 7 14"/>
                                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
                            </svg>
                            Refresh
                        </button>
                    </div>
                </div>

                <!-- KPI Cards -->
                <section class="orders-kpi-grid">
                    <div class="kpi-card">
                        <div class="kpi-icon warning">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="12" cy="12" r="10"/>
                                <polyline points="12 6 12 12 16 14"/>
                            </svg>
                        </div>
                        <div class="kpi-content">
                            <div class="kpi-label">Pending</div>
                            <div class="kpi-value" id="pendingCount">12</div>
                        </div>
                    </div>
                    <div class="kpi-card">
                        <div class="kpi-icon info">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                                <polyline points="22 4 12 14.01 9 11.01"/>
                            </svg>
                        </div>
                        <div class="kpi-content">
                            <div class="kpi-label">Confirmed</div>
                            <div class="kpi-value" id="confirmedCount">8</div>
                        </div>
                    </div>
                    <div class="kpi-card">
                        <div class="kpi-icon accent">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <rect x="1" y="3" width="15" height="13"/>
                                <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
                                <circle cx="5.5" cy="18.5" r="2.5"/>
                                <circle cx="18.5" cy="18.5" r="2.5"/>
                            </svg>
                        </div>
                        <div class="kpi-content">
                            <div class="kpi-label">Out for Delivery</div>
                            <div class="kpi-value" id="deliveryCount">5</div>
                        </div>
                    </div>
                    <div class="kpi-card">
                        <div class="kpi-icon success">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                                <line x1="16" y1="2" x2="16" y2="6"/>
                                <line x1="8" y1="2" x2="8" y2="6"/>
                                <line x1="3" y1="10" x2="21" y2="10"/>
                            </svg>
                        </div>
                        <div class="kpi-content">
                            <div class="kpi-label">Active Rentals</div>
                            <div class="kpi-value" id="activeCount">24</div>
                        </div>
                    </div>
                </section>

                <!-- Filters & Search -->
                <div class="orders-toolbar">
                    <div class="orders-search">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
                            <circle cx="11" cy="11" r="8"/>
                            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                        </svg>
                        <input type="text" id="orderSearchInput" placeholder="Search orders by ID, customer, or item..." />
                    </div>
                    <div class="orders-filters">
                        <select id="statusFilter" class="filter-select">
                            <option value="all">All Status</option>
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="out_for_delivery">Out for Delivery</option>
                            <option value="active">Active</option>
                            <option value="return_scheduled">Return Scheduled</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                        <select id="dateFilter" class="filter-select">
                            <option value="all">All Time</option>
                            <option value="today">Today</option>
                            <option value="week">This Week</option>
                            <option value="month">This Month</option>
                        </select>
                    </div>
                </div>

                <!-- Orders Table -->
                <div class="orders-table-container">
                    <table class="admin-table orders-table">
                        <thead>
                            <tr>
                                <th>Order ID</th>
                                <th>Customer</th>
                                <th>Items</th>
                                <th>Dates</th>
                                <th>Total</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody id="ordersTableBody">
                            <!-- Orders will be populated by JavaScript -->
                        </tbody>
                    </table>
                </div>

                <!-- Pagination -->
                <div class="orders-pagination">
                    <span class="pagination-info">Showing 1-10 of 49 orders</span>
                    <div class="pagination-controls">
                        <button class="pagination-btn" id="prevPageBtn" disabled>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                                <polyline points="15 18 9 12 15 6"/>
                            </svg>
                        </button>
                        <span class="pagination-pages">
                            <button class="page-btn active">1</button>
                            <button class="page-btn">2</button>
                            <button class="page-btn">3</button>
                            <span class="page-dots">...</span>
                            <button class="page-btn">5</button>
                        </span>
                        <button class="pagination-btn" id="nextPageBtn">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                                <polyline points="9 18 15 12 9 6"/>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            <!-- Footer Container -->
            <div id="footerContainer"></div>
        </main>
    </div>

    <!-- PDF Export Libraries (absolute URLs, unaffected by base tag) -->
    <script src="https://unpkg.com/jspdf@2.5.1/dist/jspdf.umd.min.js"></script>
    <script src="https://unpkg.com/jspdf-autotable@3.8.2/dist/jspdf.plugin.autotable.min.js"></script>

    <!-- Admin Scripts -->
    <script src="admin/shared/js/admin-components.js"></script>
    <script src="admin/orders/js/orders.js"></script>
    <script>
        document.addEventListener('DOMContentLoaded', function() {
            AdminComponents.injectSidebar('sidebarContainer', 'orders');
            AdminComponents.injectHeader('headerContainer', 'Orders');
            AdminComponents.injectFooter('footerContainer');
        });
    </script>
</body>
</html>



