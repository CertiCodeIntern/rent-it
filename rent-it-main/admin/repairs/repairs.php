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
    <title>Repairs Management | Admin Portal</title>
    
    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    
    <!-- Admin Shared Styles -->
    <link rel="stylesheet" href="admin/shared/css/admin-theme.css">
    <link rel="stylesheet" href="admin/shared/css/admin-globals.css">
    <link rel="stylesheet" href="admin/shared/css/admin-components.css">
    
    <!-- Page Specific Styles -->
    <link rel="stylesheet" href="admin/repairs/repairs.css">
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
        <!-- Sidebar Container (injected via JS) -->
        <div id="sidebarContainer"></div>
        
        <!-- Main Content -->
        <main class="admin-main">
            <!-- Header Container (injected via JS) -->
            <div id="headerContainer"></div>
            
            <!-- Page Content -->
            <div class="admin-content">
                <!-- Page Title & Actions -->
                <div class="page-header">
                    <div class="page-header-left">
                        <h1 class="page-title">
                            <svg class="page-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
                            </svg>
                            Repairs Management
                        </h1>
                        <p class="page-subtitle">Track equipment repairs, maintenance status, and availability</p>
                    </div>
                <div class="page-header-right">
                    <button class="btn btn-secondary" id="exportRepairsBtn" title="Export repairs data to CSV">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                            <polyline points="7 10 12 15 17 10"/>
                            <line x1="12" y1="15" x2="12" y2="3"/>
                        </svg>
                        Export
                    </button>
                    <button class="btn btn-primary" id="newRepairBtn" title="Add new repair ticket">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <line x1="12" y1="5" x2="12" y2="19"/>
                            <line x1="5" y1="12" x2="19" y2="12"/>
                        </svg>
                        New Repair Ticket
                    </button>
                    </div>
                </div>
            
            <!-- Stats Overview -->
            <div class="repairs-stats">
                <div class="stat-card" title="Items currently under repair">
                    <div class="stat-icon pending">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="12" cy="12" r="10"/>
                            <polyline points="12 6 12 12 16 14"/>
                        </svg>
                    </div>
                    <div class="stat-info">
                        <span class="stat-value" id="statInProgress">0</span>
                        <span class="stat-label">In Progress</span>
                    </div>
                </div>
                
                <div class="stat-card" title="Items waiting for repair">
                    <div class="stat-icon warning">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                            <line x1="12" y1="9" x2="12" y2="13"/>
                            <line x1="12" y1="17" x2="12.01" y2="17"/>
                        </svg>
                    </div>
                    <div class="stat-info">
                        <span class="stat-value" id="statAwaitingParts">0</span>
                        <span class="stat-label">Awaiting Parts</span>
                    </div>
                </div>
                
                <div class="stat-card" title="Repairs completed">
                    <div class="stat-icon success">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="20 6 9 17 4 12"/>
                        </svg>
                    </div>
                    <div class="stat-info">
                        <span class="stat-value" id="statCompleted">0</span>
                        <span class="stat-label">Completed</span>
                    </div>
                </div>
                
                <div class="stat-card" title="Items set as unavailable">
                    <div class="stat-icon danger">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="12" cy="12" r="10"/>
                            <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
                        </svg>
                    </div>
                    <div class="stat-info">
                        <span class="stat-value" id="statUnavailable">0</span>
                        <span class="stat-label">Unavailable</span>
                    </div>
                </div>
            </div>
            
            <!-- Filters & Search -->
            <div class="repairs-controls admin-card">
                <div class="controls-left">
                    <div class="search-box">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="11" cy="11" r="8"/>
                            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                        </svg>
                        <input type="text" id="searchRepairs" placeholder="Search by item name or ticket ID..." title="Search repairs">
                    </div>
                </div>
                <div class="controls-right">
                    <select id="statusFilter" class="form-select" title="Filter by repair status">
                        <option value="all">All Statuses</option>
                        <option value="in-progress">In Progress</option>
                        <option value="awaiting-parts">Awaiting Parts</option>
                        <option value="completed">Completed</option>
                        <option value="unavailable">Unavailable</option>
                        <option value="to-remove">To Be Removed</option>
                    </select>
                    <select id="priorityFilter" class="form-select" title="Filter by priority level">
                        <option value="all">All Priorities</option>
                        <option value="high">High Priority</option>
                        <option value="medium">Medium Priority</option>
                        <option value="low">Low Priority</option>
                    </select>
                    <select id="categoryFilter" class="form-select" title="Filter by equipment category">
                        <option value="all">All Categories</option>
                        <option value="karaoke">Karaoke Systems</option>
                        <option value="speakers">Speakers</option>
                        <option value="microphones">Microphones</option>
                        <option value="lighting">Lighting</option>
                        <option value="accessories">Accessories</option>
                    </select>
                </div>
            </div>
            
            <!-- Repairs Table -->
            <div class="admin-card repairs-table-container">
                <table class="admin-table repairs-table">
                    <thead>
                        <tr>
                            <th title="Unique repair ticket ID">Ticket ID</th>
                            <th title="Equipment under repair">Equipment</th>
                            <th title="Type of issue">Issue Type</th>
                            <th title="Priority level">Priority</th>
                            <th title="Current repair status">Status</th>
                            <th title="Date ticket was created">Created</th>
                            <th title="Expected completion">ETA</th>
                            <th title="Estimated repair cost">Est. Cost</th>
                            <th title="Available actions">Actions</th>
                        </tr>
                    </thead>
                    <tbody id="repairsTableBody">
                        <!-- Rows populated by JavaScript from database -->
                        <tr><td colspan="9" style="text-align:center; padding:2rem; color:var(--admin-text-muted);">Loading repairs...</td></tr>
                    </tbody>
                </table>
            </div>
            
            <!-- Pagination -->
            <div class="pagination" id="repairsPagination" style="display:none;">
                <span class="pagination-info" id="paginationInfo">Showing 0 repairs</span>
            </div>
        </div>
    
    <!-- Repair Detail Modal -->
    <div class="modal" id="repairModal">
        <div class="modal-overlay"></div>
        <div class="modal-container repair-modal">
            <div class="modal-header">
                <h2 class="modal-title">Repair Details</h2>
                <button class="modal-close" id="closeRepairModal" title="Close modal">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"/>
                        <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                </button>
            </div>
            <div class="modal-body">
                <div class="repair-detail-grid">
                    <div class="detail-section">
                        <h3>Equipment Information</h3>
                        <div class="detail-row">
                            <span class="detail-label">Ticket ID:</span>
                            <span class="detail-value" id="modalTicketId">RPR-001</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Equipment:</span>
                            <span class="detail-value" id="modalEquipment">KRK-001 Pro System</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Category:</span>
                            <span class="detail-value" id="modalCategory">Karaoke System</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Serial No:</span>
                            <span class="detail-value" id="modalSerial">KRK-2024-001</span>
                        </div>
                    </div>
                    <div class="detail-section">
                        <h3>Repair Status</h3>
                        <div class="detail-row">
                            <span class="detail-label">Status:</span>
                            <span class="status-badge in-progress" id="modalStatus">In Progress</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Priority:</span>
                            <span class="priority-badge high" id="modalPriority">High</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Assigned To:</span>
                            <span class="detail-value" id="modalTechnician">Mike Rodriguez</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Est. Cost:</span>
                            <span class="detail-value" id="modalCost">₱2,500</span>
                        </div>
                    </div>
                </div>
                <div class="detail-section full-width">
                    <h3>Issue Description</h3>
                    <p id="modalDescription">Audio distortion detected during quality check after last rental. Customer reported crackling sound at higher volumes. Suspected amplifier board issue requiring component-level diagnosis.</p>
                </div>
                <div class="detail-section full-width">
                    <h3>Repair Timeline</h3>
                    <div class="timeline">
                        <div class="timeline-item">
                            <div class="timeline-dot completed"></div>
                            <div class="timeline-content">
                                <span class="timeline-date">Jan 10, 2026</span>
                                <span class="timeline-text">Ticket created - Issue reported</span>
                            </div>
                        </div>
                        <div class="timeline-item">
                            <div class="timeline-dot completed"></div>
                            <div class="timeline-content">
                                <span class="timeline-date">Jan 11, 2026</span>
                                <span class="timeline-text">Diagnostic completed - Amplifier board fault</span>
                            </div>
                        </div>
                        <div class="timeline-item">
                            <div class="timeline-dot active"></div>
                            <div class="timeline-content">
                                <span class="timeline-date">Jan 15, 2026</span>
                                <span class="timeline-text">Repair in progress</span>
                            </div>
                        </div>
                        <div class="timeline-item">
                            <div class="timeline-dot"></div>
                            <div class="timeline-content">
                                <span class="timeline-date">Jan 20, 2026</span>
                                <span class="timeline-text">Expected completion</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" id="cancelRepairModalBtn">Close</button>
                <button class="btn btn-primary" id="editRepairBtn">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                    Edit Ticket
                </button>
            </div>
        </div>
    </div>
    
    </main>
    </div>
    
    <!-- Toast Container -->
    <div id="toast-container"></div>
    
    <!-- Scripts -->
    <script src="admin/shared/js/admin-components.js"></script>
    <script src="admin/repairs/repairs.js"></script>
</body>
</html>


