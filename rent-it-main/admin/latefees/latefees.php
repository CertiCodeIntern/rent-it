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
    <title>Late Fees Tracker | Admin Portal</title>
    
    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    
    <!-- Admin Shared Styles -->
    <link rel="stylesheet" href="admin/shared/css/admin-theme.css">
    <link rel="stylesheet" href="admin/shared/css/admin-globals.css">
    <link rel="stylesheet" href="admin/shared/css/admin-components.css">
    
    <!-- Page Specific Styles -->
    <link rel="stylesheet" href="admin/latefees/latefees.css">
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
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                            <line x1="16" y1="2" x2="16" y2="6"/>
                            <line x1="8" y1="2" x2="8" y2="6"/>
                            <line x1="3" y1="10" x2="21" y2="10"/>
                            <path d="M17 14l-5 5-3-3"/>
                        </svg>
                        Late Fees Tracker
                    </h1>
                    <p class="page-subtitle">Monitor overdue rentals, manage late fees, and send reminders</p>
                </div>
                <div class="page-header-right">
                    <button class="btn btn-secondary" id="manageTemplatesBtn" title="Manage email templates">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                            <polyline points="22,6 12,13 2,6"/>
                        </svg>
                        Email Templates
                    </button>
                    <button class="btn btn-primary" id="sendAllRemindersBtn" title="Send reminders to all overdue customers">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M22 2L11 13"/>
                            <path d="M22 2l-7 20-4-9-9-4 20-7z"/>
                        </svg>
                        Send All Reminders
                    </button>
                </div>
            </div>
            
            <!-- Stats Overview -->
            <div class="latefees-stats">
                <div class="stat-card" title="Total outstanding late fees">
                    <div class="stat-icon danger">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <text x="12" y="17" text-anchor="middle" font-size="16" font-weight="bold" fill="currentColor" stroke="none">₱</text>
                        </svg>
                    </div>
                    <div class="stat-info">
                        <span class="stat-value" id="statOutstandingFees">₱0</span>
                        <span class="stat-label">Outstanding Fees</span>
                    </div>
                </div>
                
                <div class="stat-card" title="Currently overdue rentals">
                    <div class="stat-icon warning">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="12" cy="12" r="10"/>
                            <polyline points="12 6 12 12 16 14"/>
                        </svg>
                    </div>
                    <div class="stat-info">
                        <span class="stat-value" id="statOverdueRentals">0</span>
                        <span class="stat-label">Overdue Rentals</span>
                    </div>
                </div>
                
                <div class="stat-card" title="Late fees collected this month">
                    <div class="stat-icon success">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="20 6 9 17 4 12"/>
                        </svg>
                    </div>
                    <div class="stat-info">
                        <span class="stat-value" id="statCollectedMonth">₱0</span>
                        <span class="stat-label">Collected This Month</span>
                    </div>
                </div>
                
                <div class="stat-card" title="Reminders sent today">
                    <div class="stat-icon pending">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                            <polyline points="22,6 12,13 2,6"/>
                        </svg>
                    </div>
                    <div class="stat-info">
                        <span class="stat-value" id="statRemindersSent">0</span>
                        <span class="stat-label">Reminders Sent Today</span>
                    </div>
                </div>
            </div>
            
            <!-- Two Column Layout -->
            <div class="latefees-layout">
                <!-- Left: Overdue List -->
                <div class="overdue-section">
                    <div class="admin-card">
                        <div class="card-header">
                            <h2 class="card-title">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                                    <line x1="12" y1="9" x2="12" y2="13"/>
                                    <line x1="12" y1="17" x2="12.01" y2="17"/>
                                </svg>
                                Overdue Rentals
                            </h2>
                            <div class="card-actions">
                                <select id="overdueFilter" class="form-select" title="Filter by overdue period">
                                    <option value="all">All Overdue</option>
                                    <option value="1-3">1-3 Days</option>
                                    <option value="4-7">4-7 Days</option>
                                    <option value="7+">7+ Days</option>
                                </select>
                            </div>
                        </div>
                        <div class="overdue-list" id="overdueList">
                            <!-- Populated dynamically by latefees.js -->
                            <div class="overdue-empty" id="overdueEmpty" style="display:none;">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="48" height="48" style="opacity:0.3;margin-bottom:1rem;">
                    <polyline points="20 6 9 17 4 12"/>
                                </svg>
                                <h3 style="margin:0 0 0.5rem;color:var(--admin-text-primary);">No Overdue Rentals</h3>
                                <p style="margin:0;color:var(--admin-text-secondary);font-size:0.875rem;">All rentals are on schedule. Great job!</p>
                            </div>
                        </div>
                        <!-- Pagination -->
                        <div class="overdue-pagination" id="overduePagination" style="display: none;">
                            <span class="pagination-info" id="paginationInfo">Showing 0 items</span>
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
                </div>
                <!-- Right: Email Templates & Activity -->
                <div class="templates-section">
                    <!-- Email Templates Card -->
                    <div class="admin-card templates-card">
                        <div class="card-header">
                            <h2 class="card-title">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                                    <polyline points="14 2 14 8 20 8"/>
                                    <line x1="16" y1="13" x2="8" y2="13"/>
                                    <line x1="16" y1="17" x2="8" y2="17"/>
                                    <polyline points="10 9 9 9 8 9"/>
                                </svg>
                                Quick Templates
                            </h2>
                            <button class="btn btn-ghost btn-sm" id="addTemplateBtn" title="Create new template">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <line x1="12" y1="5" x2="12" y2="19"/>
                                    <line x1="5" y1="12" x2="19" y2="12"/>
                                </svg>
                            </button>
                        </div>
                        <div class="templates-list">
                            <div class="template-item" data-template="gentle">
                                <div class="template-info">
                                    <span class="template-name">Gentle Reminder</span>
                                    <span class="template-preview">Hi [Name], this is a friendly reminder...</span>
                                </div>
                                <div class="template-actions">
                                    <button class="template-btn use" title="Use this template">Use</button>
                                    <button class="template-btn edit" title="Edit template">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                                        </svg>
                                    </button>
                                </div>
                            </div>
                            <div class="template-item" data-template="urgent">
                                <div class="template-info">
                                    <span class="template-name">Urgent Notice</span>
                                    <span class="template-preview">URGENT: Your rental is [X] days overdue...</span>
                                </div>
                                <div class="template-actions">
                                    <button class="template-btn use" title="Use this template">Use</button>
                                    <button class="template-btn edit" title="Edit template">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                                        </svg>
                                    </button>
                                </div>
                            </div>
                            <div class="template-item" data-template="final">
                                <div class="template-info">
                                    <span class="template-name">Final Warning</span>
                                    <span class="template-preview">Final Notice: Immediate return required...</span>
                                </div>
                                <div class="template-actions">
                                    <button class="template-btn use" title="Use this template">Use</button>
                                    <button class="template-btn edit" title="Edit template">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                                        </svg>
                                    </button>
                                </div>
                            </div>
                            <div class="template-item" data-template="payment">
                                <div class="template-info">
                                    <span class="template-name">Payment Request</span>
                                    <span class="template-preview">Payment due: Late fees of ₱[Amount]...</span>
                                </div>
                                <div class="template-actions">
                                    <button class="template-btn use" title="Use this template">Use</button>
                                    <button class="template-btn edit" title="Edit template">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Recent Activity Card (populated dynamically by latefees.js) -->
                    <div class="admin-card activity-card">
                        <div class="card-header">
                            <h2 class="card-title">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                                </svg>
                                Recent Activity
                            </h2>
                        </div>
                        <div class="activity-list">
                            <div class="activity-empty" id="activityEmptyState">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:32px;height:32px;opacity:0.4;margin-bottom:8px;">
                                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                                </svg>
                                <p style="margin:0;color:var(--text-tertiary,#888);font-size:13px;">No recent activity yet. Actions like sending reminders and resolving fees will appear here.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            </div> <!-- close admin-content -->

            <!-- Footer Container (injected via JS) -->
            <div id="footerContainer"></div>
        </main>
    </div> <!-- close admin-wrapper -->
    
    <!-- Send Reminder Modal -->
    <div class="modal" id="reminderModal">
        <div class="modal-overlay"></div>
        <div class="modal-container reminder-modal">
            <div class="modal-header">
                <h2 class="modal-title">Send Reminder</h2>
                <button class="modal-close" id="closeReminderModal" title="Close modal">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"/>
                        <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                </button>
            </div>
            <div class="modal-body">
                <div class="reminder-recipient">
                    <label class="form-label">To:</label>
                    <div class="recipient-info">
                        <span class="recipient-name" id="reminderRecipient">Michael Chen</span>
                        <span class="recipient-email" id="reminderEmail">michael.chen@email.com</span>
                    </div>
                </div>
                <div class="form-group">
                    <label class="form-label">Template</label>
                    <select class="form-select" id="templateSelect" style="width: 100%;">
                        <option value="gentle">Gentle Reminder</option>
                        <option value="urgent">Urgent Notice</option>
                        <option value="final">Final Warning</option>
                        <option value="payment">Payment Request</option>
                        <option value="custom">Custom Message</option>
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label">Subject</label>
                    <input type="text" class="form-input" id="emailSubject" value="Rental Return Reminder - [Equipment Name]">
                </div>
                <div class="form-group">
                    <label class="form-label">Message</label>
                    <textarea class="form-input email-body" id="emailBody" rows="8">Hi [Customer Name],

This is a friendly reminder that your rental of [Equipment Name] was due on [Due Date]. 

Your current late fee is: ₱[Late Fee Amount]

Please return the equipment at your earliest convenience to avoid additional charges. If you have already returned the item, please disregard this message.

If you need to extend your rental, please contact us at (02) 8123-4567.

Thank you for your understanding.

Best regards,
Sound Rental Team</textarea>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" id="cancelReminderBtn">Cancel</button>
                <button class="btn btn-primary" id="sendReminderBtn">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M22 2L11 13"/>
                        <path d="M22 2l-7 20-4-9-9-4 20-7z"/>
                    </svg>
                    Send Reminder
                </button>
            </div>
        </div>
    </div>
    
    <!-- Edit / Add Template Modal -->
    <div class="modal" id="templateModal">
        <div class="modal-overlay"></div>
        <div class="modal-container template-modal">
            <div class="modal-header">
                <h2 class="modal-title" id="templateModalTitle">Edit Template</h2>
                <button class="modal-close" id="closeTemplateModal" title="Close modal">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"/>
                        <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                </button>
            </div>
            <div class="modal-body">
                <div class="form-group">
                    <label class="form-label">Template Name</label>
                    <input type="text" class="form-input" id="templateNameInput" placeholder="e.g. Friendly Follow-up">
                </div>
                <div class="form-group">
                    <label class="form-label">Subject Line</label>
                    <input type="text" class="form-input" id="templateSubjectInput" placeholder="Email subject...">
                </div>
                <div class="form-group">
                    <label class="form-label">Message Body</label>
                    <textarea class="form-input email-body" id="templateBodyInput" rows="10" placeholder="Write your template message here...&#10;&#10;Available placeholders: [Customer Name], [Equipment Name], [Due Date], [Late Fee Amount], [X] days"></textarea>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" id="cancelTemplateBtn">Cancel</button>
                <button class="btn btn-primary" id="saveTemplateBtn">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                        <polyline points="17 21 17 13 7 13 7 21"/>
                        <polyline points="7 3 7 8 15 8"/>
                    </svg>
                    Save Template
                </button>
            </div>
        </div>
    </div>

    <script src="admin/shared/js/admin-components.js"></script>
    <script src="admin/latefees/latefees.js"></script>
</body>
</html>


