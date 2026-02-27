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
    <meta name="description" content="RentIt Admin - Customer Management">
    <title>Customers - RentIt Admin</title>
    
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
    <link rel="stylesheet" href="admin/customers/css/customers.css">
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
                        <h1 class="admin-page-title">Customers</h1>
                        <p class="admin-page-subtitle">Manage customer accounts and rental history</p>
                    </div>
                    <div class="admin-page-actions">
                        <button class="btn btn-secondary" id="exportCustomersBtn" title="Export customer data">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                                <polyline points="7 10 12 15 17 10"/>
                                <line x1="12" y1="15" x2="12" y2="3"/>
                            </svg>
                            Export
                        </button>
                    </div>
                </div>

                <!-- KPI Cards -->
                <section class="customers-kpi-grid">
                    <div class="kpi-card">
                        <div class="kpi-icon info">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                                <line x1="16" y1="2" x2="16" y2="6"/>
                                <line x1="8" y1="2" x2="8" y2="6"/>
                                <line x1="3" y1="10" x2="21" y2="10"/>
                            </svg>
                        </div>
                        <div class="kpi-content">
                            <div class="kpi-value" id="activeBookingsCount">248</div>
                            <div class="kpi-label">Active Bookings</div>
                        </div>
                    </div>
                    <div class="kpi-card">
                        <div class="kpi-icon accent">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <text x="12" y="17" text-anchor="middle" font-size="16" font-weight="bold" fill="currentColor" stroke="none">₱</text>
                            </svg>
                        </div>
                        <div class="kpi-content">
                            <div class="kpi-value" id="monthlyRevenueValue">₱42,580</div>
                            <div class="kpi-label">Monthly Revenue</div>
                        </div>
                    </div>
                    <div class="kpi-card">
                        <div class="kpi-icon success">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                                <circle cx="9" cy="7" r="4"/>
                                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                            </svg>
                        </div>
                        <div class="kpi-content">
                            <div class="kpi-value" id="totalCustomersCount">1,842</div>
                            <div class="kpi-label">Total Customers</div>
                        </div>
                    </div>
                    <div class="kpi-card">
                        <div class="kpi-icon warning">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="12" cy="12" r="10"/>
                                <line x1="12" y1="8" x2="12" y2="12"/>
                                <line x1="12" y1="16" x2="12.01" y2="16"/>
                            </svg>
                        </div>
                        <div class="kpi-content">
                            <div class="kpi-value" id="overdueReturnsCount">12</div>
                            <div class="kpi-label">Overdue Returns</div>
                        </div>
                    </div>
                </section>

                <!-- Toolbar -->
                <div class="customers-toolbar">
                    <div class="customers-search">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
                            <circle cx="11" cy="11" r="8"/>
                            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                        </svg>
                        <input type="text" id="customerSearchInput" placeholder="Search by name, email, or booking ID..." />
                    </div>
                    <div class="customers-filters">
                        <select id="statusFilter" class="filter-select">
                            <option value="all">All Customers</option>
                            <option value="active">Active Rentals</option>
                            <option value="overdue">Overdue</option>
                            <option value="inactive">No Active Rentals</option>
                        </select>
                        <select id="sortFilter" class="filter-select">
                            <option value="recent">Most Recent</option>
                            <option value="name">Name A-Z</option>
                            <option value="bookings">Most Bookings</option>
                            <option value="revenue">Highest Revenue</option>
                        </select>
                    </div>
                </div>

                <!-- Customers Table -->
                <div class="customers-table-container">
                    <table class="admin-table customers-table">
                        <thead>
                            <tr>
                                <th>Customer</th>
                                <th>Booking ID</th>
                                <th>Items</th>
                                <th>Rental Period</th>
                                <th>Status</th>
                                <th>Payment</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody id="customersTableBody">
                            <!-- Customers will be populated by JavaScript -->
                        </tbody>
                    </table>
                </div>

                <!-- Pagination -->
                <div class="customers-pagination">
                    <span class="pagination-info">Showing 1-10 of 248 customers</span>
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
                            <button class="page-btn">25</button>
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

    <!-- Admin Scripts -->
    <script src="admin/shared/js/admin-components.js"></script>
    <script src="admin/customers/js/customers.js"></script>
    <script>
        document.addEventListener('DOMContentLoaded', function() {
            AdminComponents.injectSidebar('sidebarContainer', 'customers');
            AdminComponents.injectHeader('headerContainer', 'Customers');
            AdminComponents.injectFooter('footerContainer');
        });
    </script>
</body>
</html>



