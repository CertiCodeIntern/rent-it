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
    <meta name="description" content="RentIt Admin - Dispatch Management">
    <title>Dispatch - RentIt Admin</title>
    
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
    <link rel="stylesheet" href="admin/dispatch/css/dispatch.css">
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
                        <h1 class="admin-page-title">Dispatch</h1>
                        <p class="admin-page-subtitle">Manage deliveries and pickups for rental orders</p>
                    </div>
                    <div class="admin-page-actions">
                        <select id="dateRangeSelect" class="filter-select">
                            <option value="today">Today</option>
                            <option value="tomorrow">Tomorrow</option>
                            <option value="week" selected>This Week</option>
                            <option value="all">All Scheduled</option>
                        </select>
                    </div>
                </div>

                <!-- Dispatch Stats -->
                <section class="dispatch-stats">
                    <div class="stat-card">
                        <div class="stat-icon delivery">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <rect x="1" y="3" width="15" height="13"/>
                                <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
                                <circle cx="5.5" cy="18.5" r="2.5"/>
                                <circle cx="18.5" cy="18.5" r="2.5"/>
                            </svg>
                        </div>
                        <div class="stat-content">
                            <span class="stat-value" id="deliveryCount">8</span>
                            <span class="stat-label">Deliveries Today</span>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon pickup">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                                <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
                                <line x1="12" y1="22.08" x2="12" y2="12"/>
                            </svg>
                        </div>
                        <div class="stat-content">
                            <span class="stat-value" id="pickupCount">5</span>
                            <span class="stat-label">Pickups Today</span>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon pending">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="12" cy="12" r="10"/>
                                <polyline points="12 6 12 12 16 14"/>
                            </svg>
                        </div>
                        <div class="stat-content">
                            <span class="stat-value" id="pendingCount">3</span>
                            <span class="stat-label">Pending Assignment</span>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon completed">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                                <polyline points="22 4 12 14.01 9 11.01"/>
                            </svg>
                        </div>
                        <div class="stat-content">
                            <span class="stat-value" id="completedCount">12</span>
                            <span class="stat-label">Completed Today</span>
                        </div>
                    </div>
                </section>

                <!-- Dispatch Filters -->
                <div class="dispatch-filters">
                    <div class="filter-tabs">
                        <button class="filter-tab active" data-filter="all">All</button>
                        <button class="filter-tab" data-filter="pending">Pending</button>
                        <button class="filter-tab" data-filter="confirmed">Confirmed</button>
                        <button class="filter-tab" data-filter="out_for_delivery">Out for Delivery</button>
                        <button class="filter-tab" data-filter="active">Active</button>
                        <button class="filter-tab" data-filter="return_scheduled">Return Scheduled</button>
                        <button class="filter-tab" data-filter="returned">Returned</button>
                        <button class="filter-tab" data-filter="completed">Completed</button>
                        <button class="filter-tab" data-filter="cancelled">Cancelled</button>
                        <button class="filter-tab" data-filter="late">Late</button>
                    </div>
                    <div class="filter-search">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
                            <circle cx="11" cy="11" r="8"/>
                            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                        </svg>
                        <input type="text" id="dispatchSearchInput" placeholder="Search by order ID, customer, or address..." />
                    </div>
                </div>

                <!-- Dispatch Cards Grid -->
                <div class="dispatch-grid" id="dispatchGrid">
                    <!-- Cards will be populated by JavaScript -->
                </div>

                <!-- Empty State -->
                <div class="dispatch-empty" id="dispatchEmpty" style="display: none;">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="1" y="3" width="15" height="13"/>
                        <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
                        <circle cx="5.5" cy="18.5" r="2.5"/>
                        <circle cx="18.5" cy="18.5" r="2.5"/>
                    </svg>
                    <h3>No dispatches scheduled</h3>
                    <p>There are no deliveries or pickups for the selected period.</p>
                </div>

                <!-- Pagination -->
                <div class="dispatch-pagination" id="dispatchPagination" style="display: none;">
                    <span class="pagination-info" id="paginationInfo">Showing 0 dispatches</span>
                    <div class="pagination-controls">
                        <button class="pagination-btn" id="prevPageBtn" disabled>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                                <polyline points="15 18 9 12 15 6"/>
                            </svg>
                        </button>
                        <span class="pagination-pages" id="paginationPages"></span>
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
    <script src="admin/dispatch/js/dispatch.js"></script>
    <script>
        document.addEventListener('DOMContentLoaded', function() {
            AdminComponents.injectSidebar('sidebarContainer', 'dispatch');
            AdminComponents.injectHeader('headerContainer', 'Dispatch');
            AdminComponents.injectFooter('footerContainer');
        });
    </script>
</body>
</html>



