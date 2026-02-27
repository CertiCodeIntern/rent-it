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
    <meta name="description" content="RentIt Calendar Master View - Visual booking and availability grid">
    <title>Calendar - RentIt Admin</title>
    
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
    <link rel="stylesheet" href="admin/calendar/calendar.css">
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
                        <h1 class="admin-page-title">Calendar Master View</h1>
                        <p class="admin-page-subtitle">View all bookings, maintenance, and availability at a glance.</p>
                    </div>
                    <div class="admin-page-actions">
                        <div class="filter-group">
                            <div class="calendar-search">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                                    <circle cx="11" cy="11" r="8"/>
                                    <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                                </svg>
                                <input type="text" id="calendarSearchInput" class="form-input" placeholder="Search items..." />
                            </div>
                            <select class="form-select" id="assetTypeFilter" title="Filter by asset type">
                                <option value="all">All Asset Types</option>
                                <option value="karaoke">Karaoke Machines</option>
                                <option value="speaker">Speaker Sets</option>
                                <option value="microphone">Microphones</option>
                                <option value="accessory">Accessories</option>
                            </select>
                        </div>
                        <a href="admin/newitem/newitem.php" class="btn btn-primary" id="addNewItemBtn" title="Add a new rental item">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                                <line x1="12" y1="5" x2="12" y2="19"/>
                                <line x1="5" y1="12" x2="19" y2="12"/>
                            </svg>
                            Add New Item
                        </a>
                    </div>
                </div>

                <!-- Legend & Navigation -->
                <div class="calendar-controls animate-fadeInUp">
                    <div class="calendar-legend" title="Status color legend">
                        <div class="legend-item">
                            <span class="legend-color booked"></span>
                            <span class="legend-label">Booked</span>
                        </div>
                        <div class="legend-item">
                            <span class="legend-color repair"></span>
                            <span class="legend-label">In Repair</span>
                        </div>
                        <div class="legend-item">
                            <span class="legend-color available"></span>
                            <span class="legend-label">Available</span>
                        </div>
                    </div>
                    <div class="calendar-nav">
                        <button class="btn btn-ghost btn-sm" id="prevWeekBtn" title="Go to previous week">
                            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="15 18 9 12 15 6"/>
                            </svg>
                        </button>
                        <span class="calendar-date-range" id="dateRangeLabel">Jan 15 - Jan 20, 2026</span>
                        <button class="btn btn-ghost btn-sm" id="nextWeekBtn" title="Go to next week">
                            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="9 18 15 12 9 6"/>
                            </svg>
                        </button>
                        <button class="btn btn-secondary btn-sm" id="todayBtn" title="Jump to current week">Today</button>
                    </div>
                </div>

                <!-- Calendar Grid -->
                <div class="calendar-card admin-card animate-fadeInUp">
                    <div class="calendar-grid-wrapper">
                        <table class="calendar-grid" id="calendarGrid">
                            <thead id="calendarHeader">
                                <tr>
                                    <th class="asset-column" title="Asset/Equipment name">Asset Name</th>
                                    <th class="day-column">
                                        <div class="day-header">
                                            <span class="day-name">Mon</span>
                                            <span class="day-date">-</span>
                                        </div>
                                    </th>
                                    <th class="day-column">
                                        <div class="day-header">
                                            <span class="day-name">Tue</span>
                                            <span class="day-date">-</span>
                                        </div>
                                    </th>
                                    <th class="day-column">
                                        <div class="day-header">
                                            <span class="day-name">Wed</span>
                                            <span class="day-date">-</span>
                                        </div>
                                    </th>
                                    <th class="day-column">
                                        <div class="day-header">
                                            <span class="day-name">Thu</span>
                                            <span class="day-date">-</span>
                                        </div>
                                    </th>
                                    <th class="day-column">
                                        <div class="day-header">
                                            <span class="day-name">Fri</span>
                                            <span class="day-date">-</span>
                                        </div>
                                    </th>
                                    <th class="day-column">
                                        <div class="day-header">
                                            <span class="day-name">Sat</span>
                                            <span class="day-date">-</span>
                                        </div>
                                    </th>
                                </tr>
                            </thead>
                            <tbody id="calendarBody">
                                <!-- Calendar rows will be populated by JavaScript -->
                                <tr>
                                    <td colspan="7" style="text-align: center; padding: 2rem;">
                                        Loading calendar data...
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- Summary Cards -->
                <div class="calendar-summary animate-fadeInUp">
                    <div class="summary-card" title="Total bookings this week">
                        <div class="summary-icon info">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                                <line x1="16" y1="2" x2="16" y2="6"/>
                                <line x1="8" y1="2" x2="8" y2="6"/>
                                <line x1="3" y1="10" x2="21" y2="10"/>
                            </svg>
                        </div>
                        <div class="summary-content">
                            <span class="summary-value" id="statBookings">0</span>
                            <span class="summary-label">Bookings This Week</span>
                        </div>
                    </div>
                    <div class="summary-card" title="Items currently in repair">
                        <div class="summary-icon danger">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
                            </svg>
                        </div>
                        <div class="summary-content">
                            <span class="summary-value" id="statRepair">0</span>
                            <span class="summary-label">In Repair</span>
                        </div>
                    </div>
                    <div class="summary-card" title="Equipment ready for rental">
                        <div class="summary-icon success">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                                <polyline points="22 4 12 14.01 9 11.01"/>
                            </svg>
                        </div>
                        <div class="summary-content">
                            <span class="summary-value" id="statAvailable">0</span>
                            <span class="summary-label">Available</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Footer Container -->
            <div id="footerContainer"></div>
        </main>
    </div>

    <!-- Booking Detail Modal -->
    <div class="modal-backdrop" id="bookingModal">
        <div class="modal">
            <div class="modal-header">
                <h3 class="modal-title">Booking Details</h3>
                <button class="modal-close" id="closeBookingModal" title="Close modal">
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"/>
                        <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                </button>
            </div>
            <div class="modal-body">
                <div class="booking-detail-grid">
                    <div class="detail-item">
                        <label>Customer</label>
                        <span id="modalCustomer">John Smith</span>
                    </div>
                    <div class="detail-item">
                        <label>Event Type</label>
                        <span id="modalEvent">Birthday Party</span>
                    </div>
                    <div class="detail-item">
                        <label>Equipment</label>
                        <span id="modalEquipment">KRK-001 Pro System</span>
                    </div>
                    <div class="detail-item">
                        <label>Duration</label>
                        <span id="modalDuration">Jan 15-16, 2026 (2 days)</span>
                    </div>
                    <div class="detail-item">
                        <label>Status</label>
                        <span class="status-badge status-booked" id="modalStatus">Booked</span>
                    </div>
                    <div class="detail-item">
                        <label>Total</label>
                        <span id="modalTotal">₱3,500.00</span>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" id="cancelBookingModalBtn">Close</button>
                <button class="btn btn-primary" id="editBookingBtn">Edit Booking</button>
            </div>
        </div>
    </div>

    <!-- Scripts -->
    <script src="admin/shared/js/admin-components.js"></script>
    <script src="admin/calendar/calendar.js"></script>
</body>
</html>



