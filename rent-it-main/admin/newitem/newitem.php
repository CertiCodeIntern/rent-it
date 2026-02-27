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
    <meta name="description" content="RentIt Admin - Add New Rental Item">
    <title>New Item - RentIt Admin</title>
    
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
    <link rel="stylesheet" href="admin/newitem/css/newitem.css">
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
                        <h1 class="admin-page-title">Add New Item</h1>
                        <p class="admin-page-subtitle">Create a new rental item to display in the catalog</p>
                    </div>
                    <div class="admin-page-actions">
                        <a href="admin/dashboard/dashboard.php" class="btn btn-secondary" title="Cancel and go back">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                                <line x1="19" y1="12" x2="5" y2="12"/>
                                <polyline points="12 19 5 12 12 5"/>
                            </svg>
                            Cancel
                        </a>
                        <button class="btn btn-primary" id="saveItemBtn" title="Save new item">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                                <polyline points="17 21 17 13 7 13 7 21"/>
                                <polyline points="7 3 7 8 15 8"/>
                            </svg>
                            Save Item
                        </button>
                    </div>
                </div>

                <!-- Form Container -->
                <div class="newitem-form-container">
                    <form id="newItemForm" class="newitem-form">
                        <!-- Left Column - Main Details -->
                        <div class="form-column form-column-main">
                            <!-- Basic Information Card -->
                            <section class="admin-card">
                                <div class="admin-card-header">
                                    <h2 class="admin-card-title">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
                                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                                        </svg>
                                        Basic Information
                                    </h2>
                                </div>
                                <div class="admin-card-body">
                                    <div class="form-group">
                                        <label for="itemName" class="form-label">Item Name <span class="required">*</span></label>
                                        <input type="text" id="itemName" name="itemName" class="form-input" placeholder="e.g., Karaoke Pro System X-200" required>
                                        <span class="form-hint">Enter a descriptive name for the rental item</span>
                                    </div>

                                    <div class="form-group">
                                        <label for="itemDescription" class="form-label">Description <span class="required">*</span></label>
                                        <textarea id="itemDescription" name="itemDescription" class="form-textarea" rows="4" placeholder="Describe the item features, specifications, and what's included..." required></textarea>
                                        <span class="form-hint">Provide detailed information about the item</span>
                                    </div>

                                    <div class="form-group">
                                        <label for="itemCategory" class="form-label">Category <span class="required">*</span></label>
                                        <select id="itemCategory" name="itemCategory" class="form-select" required>
                                            <option value="">Select a category</option>
                                            <option value="Portable">Portable</option>
                                            <option value="Premium">Premium</option>
                                            <option value="Professional">Professional</option>
                                        </select>
                                    </div>
                                </div>
                            </section>

                            <!-- Pricing Card -->
                            <section class="admin-card">
                                <div class="admin-card-header">
                                    <h2 class="admin-card-title">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
                                            <text x="12" y="17" text-anchor="middle" font-size="16" font-weight="bold" fill="currentColor" stroke="none">₱</text>
                                        </svg>
                                        Pricing
                                    </h2>
                                </div>
                                <div class="admin-card-body">
                                    <div class="form-row">
                                        <div class="form-group">
                                            <label for="dailyRate" class="form-label">Daily Rate (₱) <span class="required">*</span></label>
                                            <input type="number" id="dailyRate" name="dailyRate" class="form-input" placeholder="0.00" min="0" step="0.01" required>
                                            <span class="form-hint">This rate is also used as the late fee charge per day</span>
                                        </div>

                                        <div class="form-group">
                                            <label for="depositAmount" class="form-label">Security Deposit (₱)</label>
                                            <input type="number" id="depositAmount" name="depositAmount" class="form-input" placeholder="0.00" min="0" step="0.01">
                                            <span class="form-hint">Refundable deposit charged at checkout</span>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            <!-- Inventory Card -->
                            <section class="admin-card">
                                <div class="admin-card-header">
                                    <h2 class="admin-card-title">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
                                            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                                            <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
                                            <line x1="12" y1="22.08" x2="12" y2="12"/>
                                        </svg>
                                        Inventory
                                    </h2>
                                </div>
                                <div class="admin-card-body">
                                    <div class="form-row">
                                        <div class="form-group">
                                            <label for="totalUnits" class="form-label">Total Units <span class="required">*</span></label>
                                            <input type="number" id="totalUnits" name="totalUnits" class="form-input" placeholder="1" min="1" value="1" required>
                                            <span class="form-hint">Total number of this item you own</span>
                                        </div>

                                        <div class="form-group">
                                            <label for="availableUnits" class="form-label">Available Units</label>
                                            <input type="number" id="availableUnits" name="availableUnits" class="form-input" placeholder="1" min="0" value="1" readonly>
                                            <span class="form-hint">Auto-calculated: Total - Rented - Repairing</span>
                                        </div>
                                    </div>

                                    <div class="form-group">
                                        <label for="repairingUnits" class="form-label">Repairing Units</label>
                                        <input type="number" id="repairingUnits" name="repairingUnits" class="form-input" placeholder="0" min="0" value="0">
                                        <span class="form-hint">Number of units currently under repair</span>
                                    </div>

                                    <div class="form-group">
                                        <label for="itemCondition" class="form-label">Condition</label>
                                        <select id="itemCondition" name="itemCondition" class="form-select">
                                            <option value="new">New</option>
                                            <option value="excellent">Excellent</option>
                                            <option value="good" selected>Good</option>
                                            <option value="fair">Fair</option>
                                        </select>
                                    </div>
                                </div>
                            </section>
                        </div>

                        <!-- Right Column - Media & Status -->
                        <div class="form-column form-column-side">
                            <!-- Image Upload Card -->
                            <section class="admin-card">
                                <div class="admin-card-header">
                                    <h2 class="admin-card-title">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
                                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                                            <circle cx="8.5" cy="8.5" r="1.5"/>
                                            <polyline points="21 15 16 10 5 21"/>
                                        </svg>
                                        Item Image
                                    </h2>
                                </div>
                                <div class="admin-card-body">
                                    <div class="image-upload-area" id="imageUploadArea">
                                        <div class="upload-placeholder" id="uploadPlaceholder">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="48" height="48">
                                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                                                <polyline points="17 8 12 3 7 8"/>
                                                <line x1="12" y1="3" x2="12" y2="15"/>
                                            </svg>
                                            <p>Drag & drop image here</p>
                                            <span>or click to browse</span>
                                        </div>
                                        <img id="imagePreview" class="image-preview" alt="Item preview" style="display: none;" onerror="this.onerror=null;this.src='/rent-it/assets/images/catalog-fallback.svg';">
                                        <input type="file" id="itemImage" name="itemImage" accept="image/*" class="file-input">
                                    </div>
                                    <span class="form-hint">Recommended: 800x600px, JPG or PNG</span>
                                    <button type="button" class="btn btn-secondary btn-sm" id="removeImageBtn" style="display: none; margin-top: 8px;">
                                        Remove Image
                                    </button>
                                </div>
                            </section>

                            <!-- Status Card -->
                            <section class="admin-card">
                                <div class="admin-card-header">
                                    <h2 class="admin-card-title">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
                                            <circle cx="12" cy="12" r="10"/>
                                            <polyline points="12 6 12 12 16 14"/>
                                        </svg>
                                        Status & Visibility
                                    </h2>
                                </div>
                                <div class="admin-card-body">
                                    <div class="form-group">
                                        <label for="itemStatus" class="form-label">Status</label>
                                        <select id="itemStatus" name="itemStatus" class="form-select">
                                            <option value="Available">Available</option>
                                            <option value="Repairing">Under Maintenance</option>
                                            <option value="Reserved">Reserved</option>
                                            <option value="Unavailable">Unavailable</option>
                                        </select>
                                    </div>

                                    <div class="form-group">
                                        <label class="toggle-label">
                                            <input type="checkbox" id="isVisible" name="isVisible" checked>
                                            <span class="toggle-switch"></span>
                                            <span class="toggle-text">Visible in Catalog</span>
                                        </label>
                                        <span class="form-hint">When enabled, item will be displayed to customers</span>
                                    </div>

                                    <div class="form-group">
                                        <label class="toggle-label">
                                            <input type="checkbox" id="isFeatured" name="isFeatured">
                                            <span class="toggle-switch"></span>
                                            <span class="toggle-text">Featured Item</span>
                                        </label>
                                        <span class="form-hint">Featured items appear in promotions</span>
                                    </div>
                                </div>
                            </section>

                            <!-- Tags Card -->
                            <section class="admin-card">
                                <div class="admin-card-header">
                                    <h2 class="admin-card-title">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
                                            <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
                                            <line x1="7" y1="7" x2="7.01" y2="7"/>
                                        </svg>
                                        Tags
                                    </h2>
                                </div>
                                <div class="admin-card-body">
                                    <div class="form-group">
                                        <label for="itemTags" class="form-label">Tags</label>
                                        <input type="text" id="itemTags" name="itemTags" class="form-input" placeholder="e.g., karaoke, bluetooth, portable">
                                        <span class="form-hint">Separate tags with commas</span>
                                    </div>
                                    <div class="tags-preview" id="tagsPreview"></div>
                                </div>
                            </section>
                        </div>
                    </form>
                </div>
            </div>

            <!-- Footer Container -->
            <div id="footerContainer"></div>
        </main>
    </div>

    <!-- Admin Scripts -->
    <script src="admin/shared/js/admin-components.js"></script>
    <script src="admin/newitem/js/newitem.js"></script>
    <script>
        document.addEventListener('DOMContentLoaded', function() {
            AdminComponents.injectSidebar('sidebarContainer', 'newitem');
            AdminComponents.injectHeader('headerContainer', 'New Item');
            AdminComponents.injectFooter('footerContainer');
        });
    </script>
</body>
</html>



