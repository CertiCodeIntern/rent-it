<?php
session_start();
include '../../shared/php/db_connection.php';
include '../../shared/php/auth_check.php';
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="RentIt - My Rentals. Manage your active videoke equipment and rental history.">
    <title>My Rentals - RentIt</title>
    
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    
    <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"></script>
    
    <link rel="icon" type="image/png" href="/rent-it/assets/images/rIT_logo_tp.png">
    
    <link rel="stylesheet" href="<?= BASE_URL ?>/shared/css/theme.css">
    <link rel="stylesheet" href="<?= BASE_URL ?>/shared/css/globals.css">
    <link rel="stylesheet" href="<?= BASE_URL ?>/client/dashboard/dashboard.css">
    <link rel="stylesheet" href="<?= BASE_URL ?>/client/myrentals/myrentals.css">

    <script src="<?= BASE_URL ?>/shared/js/theme.js"></script>
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
            
            <div class="content-area" id="contentArea">
                <div class="page-header-dashboard">
                    <div class="page-header-info">
                        <h1 class="page-title">Manage your active videoke equipment and view your rental history.</h1>
                    </div>
                    <div class="page-header-actions">
                        <a href="<?= BASE_URL ?>/client/catalog/catalog.php" class="btn-new">
                            New Rental
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                                <line x1="12" y1="5" x2="12" y2="19"/>
                                <line x1="5" y1="12" x2="19" y2="12"/>
                            </svg>
                        </a>
                    </div>
                </div>

                <div class="rentals-tabs">
                <a href="<?= BASE_URL ?>/client/myrentals/pending.php" class="tab-link">Pending Rentals</a>
                    <a href="<?= BASE_URL ?>/client/myrentals/myrentals.php" class="tab-link active">Active Rentals</a>
                    <a href="<?= BASE_URL ?>/client/bookinghistory/bookinghistory.php" class="tab-link">Booking History</a>
                    <a href="<?= BASE_URL ?>/client/returns/returns.php" class="tab-link">Returns & Extensions</a>
                </div>

                <section class="active-rentals-section">
                    <div class="section-header">
                        <h2 class="section-title">Currently In Possession</h2>
                        <span class="units-badge" id="unitsBadge">Loading...</span>
                    </div>

                    <div class="rental-cards-row" id="activeRentalsCards">
                        </div>
                    <!-- Active Rentals Pagination -->
                    <nav class="pagination-controls is-hidden" id="activeRentalsPagination" aria-label="Active rentals pagination"></nav>
                </section>

                <section class="history-section">
                    <div class="section-header">
                        <h2 class="section-title">Booking History</h2>
                        <a href="<?= BASE_URL ?>/client/bookinghistory/bookinghistory.php" class="view-all-link">View All</a>
                    </div>

                    <div class="history-panel">
                        <table class="history-table" role="table" aria-label="Booking history">
                            <thead>
                                <tr>
                                    <th>Item Details</th>
                                    <th>Rental Period</th>
                                    <th>Total Amount</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody id="historyTableBody">
                                </tbody>
                        </table>
                    </div>
                    <!-- History Pagination -->
                    <nav class="pagination-controls is-hidden" id="myRentalsHistoryPagination" aria-label="Booking history pagination"></nav>
                </section>

              
            </div>

            <!-- Footer Container (Injected by JS) -->
            <div id="footerContainer"></div>
        </main>
    </div>

    <div id="receiptModal" class="modal" style="display:none; position:fixed; z-index:1000; left:0; top:0; width:100%; height:100%; background:rgba(0,0,0,0.5);">
        <div class="modal-content receipt-modal-content">
            <span class="close-modal" onclick="closeModal('receiptModal')">&times;</span>
            <div id="receiptDetails"></div>
            <button onclick="downloadReceiptPDF()" class="btn-download-receipt">Download Receipt</button>
        </div>
    </div>

    <div id="returnModal" class="modal" style="display:none; position:fixed; z-index:9999; left:0; top:0; width:100%; height:100%; background:rgba(0,0,0,0.5); align-items:center; justify-content:center;">
        <div class="modal-content" style="background:white; padding:25px; border-radius:12px; width:90%; max-width:400px; position:relative;">
            <h3 style="margin-top:0;">Request Return</h3>
            <p style="font-size: 0.9rem; color: #64748b;">Please provide a reason for returning the item.</p>
            
            <form method="POST" action="../returns/returns.php">
                <input type="hidden" name="order_id" id="return_order_id">
                <input type="hidden" name="action" value="submit_return">
                
                <div style="margin: 15px 0;">
                    <label style="display:block; margin-bottom:5px; font-weight:600;">Reason:</label>
                    <textarea name="return_reason" required style="width:100%; padding:10px; border:1px solid #ddd; border-radius:6px; height:80px; font-family:inherit;" placeholder="e.g. Done using, item issue..."></textarea>
                </div>
                
                <div style="display:flex; justify-content:flex-end; gap:10px;">
                    <button type="button" onclick="closeModal('returnModal')" style="padding:8px 15px; border:none; background:#e2e8f0; border-radius:6px; cursor:pointer;">Cancel</button>
                    <button type="submit" style="padding:8px 15px; border:none; background:#f97316; color:white; border-radius:6px; cursor:pointer;">Submit Return</button>
                </div>
            </form>
        </div>
    </div>

    <div id="extensionModal" class="modal" style="display:none; position:fixed; z-index:9999; left:0; top:0; width:100%; height:100%; background:rgba(0,0,0,0.5); align-items:center; justify-content:center;">
        <div class="modal-content" style="background:white; padding:25px; border-radius:12px; width:90%; max-width:400px; position:relative;">
            <h3 style="margin-top:0;">Request Extension</h3>
            <p style="font-size: 0.9rem; color: #64748b;">How many days would you like to extend?</p>
            
            <form method="POST" action="../returns/returns.php">
                <input type="hidden" name="order_id" id="extension_order_id">
                <input type="hidden" name="action" value="submit_extension">
                
                <div style="margin: 15px 0;">
                    <label style="display:block; margin-bottom:5px; font-weight:600;">Extend for:</label>
                    <select name="extension_days" id="extension_days" onchange="updateExtensionPrice(this.value)" style="width:100%; padding:10px; border:1px solid #ddd; border-radius:6px;">
                        <option value="1">1 Day</option>
                        <option value="2">2 Days</option>
                        <option value="3">3 Days</option>
                        <option value="4">4 Days</option>
                        <option value="5">5 Days</option>
                        <option value="6">6 Days</option>
                        <option value="7">7 Days</option>
                    </select>

                    <div style="margin-top: 15px; padding: 12px; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0;">
                        <div style="display: flex; justify-content: space-between; font-size: 0.85rem; color: #64748b;">
                            <span>Rate per Day:</span>
                            <span id="rate_per_day_display">₱0.00</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; font-weight: 700; color: #1e293b; margin-top: 5px; border-top: 1px dashed #cbd5e1; padding-top: 5px;">
                            <span>Estimated Total:</span>
                            <span id="ext_price_display">₱0.00</span>
                        </div>
                    </div>
                </div>
                
                <div style="display:flex; justify-content:flex-end; gap:10px;">
                    <button type="button" onclick="closeModal('extensionModal')" style="padding:8px 15px; border:none; background:#e2e8f0; border-radius:6px; cursor:pointer;">Cancel</button>
                    <button type="submit" style="padding:8px 15px; border:none; background:#2563eb; color:white; border-radius:6px; cursor:pointer;">Confirm Extension</button>
                </div>
            </form>
        </div>
    </div>
    
    <script src="<?= BASE_URL ?>/shared/js/components.js"></script>
    <script src="<?= BASE_URL ?>/shared/js/pagination.js"></script>
    <script src="<?= BASE_URL ?>/client/myrentals/myrentals.js"></script>
</body>
</html>