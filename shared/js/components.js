(function() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
    } else if (savedTheme === 'light') {
        document.documentElement.setAttribute('data-theme', 'light');
    }
})();

const Components = {
    /**
     * Navigation tabs configuration for the sidebar (Admin)
     */
    navTabs: [
        { id: 'users', icon: '👥', label: 'Users' },
        { id: 'rentals', icon: '📋', label: 'Rentals' },
        { id: 'items', icon: '🎤', label: 'Items' },
        { id: 'payments', icon: '💳', label: 'Payments' },
    ],

    /**
     * Navigation tabs for client dashboard
     */
    clientNavTabs: [
        { id: 'dashboard', icon: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>', label: 'Dashboard', href: '/rent-it/client/dashboard/dashboard.php' },
        { id: 'catalog', icon: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>', label: 'Browse Catalog', href: '/rent-it/client/catalog/catalog.php' },
        { id: 'favorites', icon: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>', label: 'Favorites', href: '/rent-it/client/favorites/favorites.php' },
        { id: 'cart', icon: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>', label: 'My Cart', href: '/rent-it/client/cart/cart.php' },
        { id: 'myrentals', icon: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>', label: 'My Rentals', href: '/rent-it/client/myrentals/myrentals.php' },
        { id: 'bookinghistory', icon: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>', label: 'Booking History', href: '/rent-it/client/bookinghistory/bookinghistory.php' },
    ],
    /**
     * Get current user from localStorage
     * @returns {Object} User object with name and role
     */
    
    getCurrentUser() {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            try {
                const user = JSON.parse(userStr);
                // Derive a display name: use full_name if set, otherwise email username
                if (!user.displayName) {
                    if (user.full_name && user.full_name.trim()) {
                        user.displayName = user.full_name;
                    } else if (user.email) {
                        user.displayName = user.email.split('@')[0];
                    } else {
                        user.displayName = 'User';
                    }
                }
                // Keep backward compat: also set .name
                user.name = user.displayName;
                return user;
            } catch (e) {
                return { name: 'User', displayName: 'User', role: 'Customer' };
            }
        }
        return { name: 'User', displayName: 'User', role: 'Customer' };
    },

    /**
     * Get user's initial for avatar
     * Uses profile_picture if available, otherwise first letter of display name
     * @param {string} name - User's display name
     * @returns {string} First character uppercase
     */
    getUserInitial(name) {
        return name?.charAt(0)?.toUpperCase() || 'U';
    },

    /**
     * Show a lightweight page skeleton overlay while loading
     */
    initPageSkeleton() {
        if (!document.body) {
            document.addEventListener('DOMContentLoaded', () => this.initPageSkeleton(), { once: true });
            return;
        }

        const overlay = document.querySelector('.page-skeleton-overlay');
        if (!overlay) return;

        const hideOverlay = () => {
            overlay.classList.add('is-hidden');
            setTimeout(() => overlay.remove(), 350);
        };

        window.addEventListener('load', hideOverlay, { once: true });
        setTimeout(hideOverlay, 3500);
    },

    /**
     * Inject Sidebar into the DOM
     * @param {string} containerId - ID of the container element
     * @param {string} activeTab - Currently active tab ID
     * @param {string} context - Context type ('admin' or 'client')
     */
    injectSidebar(containerId, activeTab = 'users', context = null) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const user = this.getCurrentUser();
        const initial = this.getUserInitial(user.name);
        
        // Determine context based on URL if not provided
        const isClient = context === 'client' || window.location.pathname.includes('/client/');
        const tabs = isClient ? this.clientNavTabs : this.navTabs;

        // Determine active tab from URL for client nav
        const currentPath = window.location.pathname;

        const navItems = tabs.map(tab => {
            if (tab.href) {
                // Check if this tab matches the current page URL
                const isActive = currentPath.includes(`/client/${tab.id}/`);
                // Client nav uses links with tooltip data attribute
                return `
                    <a class="nav-item${isActive ? ' active' : ''}" href="${tab.href}" data-tooltip="${tab.label}">
                        <span class="nav-icon">${tab.icon}</span>
                        <span class="nav-label">${tab.label}</span>
                    </a>
                `;
            } else {
                // Admin nav uses buttons for SPA-style navigation
                return `
                    <button class="nav-item" data-tab="${tab.id}" data-tooltip="${tab.label}">
                        <span class="nav-icon">${tab.icon}</span>
                        <span class="nav-label">${tab.label}</span>
                    </button>
                `;
            }
        }).join('');

        // Check localStorage for collapsed state
        const isCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';

        container.innerHTML = `
            <aside class="sidebar${isCollapsed ? ' collapsed' : ''}" id="sidebar">
                                <div class="sidebar-header">
                                        <a class="sidebar-logo" href="/rent-it/client/dashboard/dashboard.php" title="Go to Dashboard">
                                            <img src="/rent-it/assets/images/rIT_logo_tp.png" alt="RentIT Logo" class="sidebar-logo-icon">
                                                <span class="sidebar-logo-text">RentIT</span>
                                        </a>
                    <!-- Collapse Toggle Button -->
                    <button class="sidebar-collapse-btn" id="sidebarCollapseBtn" aria-label="Toggle sidebar" title="Collapse/expand sidebar">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <polyline points="15 18 9 12 15 6"/>
                        </svg>
                    </button>
                </div>
                
                <nav class="sidebar-nav">
                    ${navItems}
                </nav>
                
                <div class="sidebar-footer">
                    <div class="sidebar-user">
                        <div class="sidebar-user-avatar">${user.profile_picture ? '<img src="/rent-it/assets/profile/' + user.profile_picture + '" style="width:100%;height:100%;border-radius:50%;object-fit:cover;">' : initial}</div>
                        <div class="sidebar-user-info">
                            <span class="sidebar-user-name">${user.displayName || 'User'}</span>
                            <span class="sidebar-user-role">${user.role || 'Customer'}</span>
                        </div>
                    </div>
                    
                    <!-- Mobile-only actions (shown on ultra-small screens) -->
                    <div class="mobile-only-actions">
                        <button class="mobile-action-item" id="sidebarThemeToggle">
                            <svg class="theme-icon-light" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="12" cy="12" r="5"/>
                                <line x1="12" y1="1" x2="12" y2="3"/>
                                <line x1="12" y1="21" x2="12" y2="23"/>
                                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                                <line x1="1" y1="12" x2="3" y2="12"/>
                                <line x1="21" y1="12" x2="23" y2="12"/>
                                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
                            </svg>
                            <svg class="theme-icon-dark" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                            </svg>
                            <span class="theme-label">Dark Mode</span>
                        </button>
                    </div>
                    
                    <button class="logout-btn" id="logoutBtn" title="Sign out of your account">
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                            <polyline points="16 17 21 12 16 7"/>
                            <line x1="21" y1="12" x2="9" y2="12"/>
                        </svg>
                        <span class="logout-text">Logout</span>
                    </button>
                </div>
            </aside>
            <div class="sidebar-overlay" id="sidebarOverlay"></div>
        `;

        // Apply collapsed state to app container
        if (isCollapsed) {
            document.querySelector('.app-container')?.classList.add('sidebar-collapsed');
        }

        // Attach event listeners
        this.attachSidebarEvents();
    },

    /**
     * Attach event listeners to sidebar elements
     */
    attachSidebarEvents() {
        // Nav item clicks (admin SPA buttons only, not client <a> links)
        document.querySelectorAll('.nav-item[data-tab]').forEach(item => {
            item.addEventListener('click', (e) => {
                const tabId = e.currentTarget.dataset.tab;
                if (tabId) this.handleTabChange(tabId);
            });
        });

        // Logout button
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.showLogoutModal();
            });
        }

        // Overlay click to close sidebar
        const overlay = document.getElementById('sidebarOverlay');
        if (overlay) {
            overlay.addEventListener('click', () => this.closeSidebar());
        }

        // Sidebar collapse toggle
        const collapseBtn = document.getElementById('sidebarCollapseBtn');
        if (collapseBtn) {
            collapseBtn.addEventListener('click', () => this.toggleSidebarCollapse());
        }
    },

    /**
     * Toggle sidebar collapsed state
     */
    toggleSidebarCollapse() {
        const sidebar = document.getElementById('sidebar');
        const appContainer = document.querySelector('.app-container');
        
        if (sidebar) {
            const isCollapsed = sidebar.classList.toggle('collapsed');
            appContainer?.classList.toggle('sidebar-collapsed', isCollapsed);
            
            // Persist to localStorage
            localStorage.setItem('sidebarCollapsed', isCollapsed.toString());
        }
    },

    /**
     * Handle tab change
     * @param {string} tabId - ID of the tab to switch to
     */
    handleTabChange(tabId) {
        if (!tabId) return;

        // Update active state
        document.querySelectorAll('.nav-item[data-tab]').forEach(item => {
            item.classList.toggle('active', item.dataset.tab === tabId);
        });

        // Update topbar title
        const tab = this.navTabs.find(t => t.id === tabId);
        const titleEl = document.getElementById('pageTitle');
        if (titleEl && tab) {
            titleEl.textContent = tab.label;
        }

        // Update content
        this.loadTabContent(tabId);
        
        // Close sidebar on mobile
        this.closeSidebar();

        // Save active tab to localStorage
        localStorage.setItem('activeTab', tabId);
    },

    /**
     * Load content for a specific tab
     * @param {string} tabId - ID of the tab
     */
    loadTabContent(tabId) {
        const contentArea = document.getElementById('contentArea');
        if (!contentArea) return;

        const tab = this.navTabs.find(t => t.id === tabId);
        
        // Generate sample content for each tab
        contentArea.innerHTML = `
            <div class="data-table-container">
                <div class="data-table-header">
                    <h2 class="data-table-title">${tab?.label || 'Content'} Management</h2>
                    <div class="data-table-actions">
                        <button class="btn-primary">+ Add New</button>
                    </div>
                </div>
                ${this.generateTableContent(tabId)}
            </div>
        `;

        const isLoading = contentArea.querySelector('.loader-state');
        document.querySelector('.app-container')?.classList.toggle('sidebar-neutral', !!isLoading);
    },

    /**
     * Generate table content based on tab
     * @param {string} tabId - ID of the tab
     * @returns {string} HTML string of table content
     */
    generateTableContent(tabId) {
        const tableConfigs = {
            users: {
                headers: ['Name', 'Email', 'Role', 'Status'],
                rows: [
                    ['John Doe', 'john@example.com', 'Admin', 'active'],
                    ['Jane Smith', 'jane@example.com', 'Customer', 'active'],
                    ['Bob Wilson', 'bob@example.com', 'Customer', 'pending'],
                ]
            },
            rentals: {
                headers: ['ID', 'Customer', 'Item', 'Start Date', 'Status'],
                rows: [
                    ['#001', 'John Doe', 'Karaoke System A', '2026-01-15', 'active'],
                    ['#002', 'Jane Smith', 'Karaoke System B', '2026-01-20', 'pending'],
                    ['#003', 'Bob Wilson', 'Speakers Set', '2026-01-18', 'inactive'],
                ]
            },
            items: {
                headers: ['Name', 'Category', 'Price/Day', 'Availability'],
                rows: [
                    ['Karaoke System A', 'Equipment', '₱500', 'active'],
                    ['Karaoke System B', 'Equipment', '₱450', 'active'],
                    ['Speakers Set', 'Audio', '₱200', 'inactive'],
                ]
            },
            payments: {
                headers: ['ID', 'Customer', 'Amount', 'Date', 'Status'],
                rows: [
                    ['PAY-001', 'John Doe', '₱1,500', '2026-01-15', 'active'],
                    ['PAY-002', 'Jane Smith', '₱900', '2026-01-20', 'pending'],
                    ['PAY-003', 'Bob Wilson', '₱600', '2026-01-18', 'active'],
                ]
            }
        };

        const config = tableConfigs[tabId];
        if (!config) return this.generateEmptyState();

        const headerHtml = config.headers.map(h => `<th>${h}</th>`).join('');
        const rowsHtml = config.rows.map(row => {
            const cells = row.map((cell, i) => {
                if (i === row.length - 1) {
                    return `<td><span class="status-badge ${cell}">${cell.charAt(0).toUpperCase() + cell.slice(1)}</span></td>`;
                }
                return `<td>${cell}</td>`;
            }).join('');
            return `<tr>${cells}</tr>`;
        }).join('');

        return `
            <table class="data-table">
                <thead>
                    <tr>${headerHtml}</tr>
                </thead>
                <tbody>
                    ${rowsHtml}
                </tbody>
            </table>
        `;
    },

    /**
     * Generate empty state HTML
     * @returns {string} HTML string
     */
    generateEmptyState() {
        return `
            <div class="empty-state loader-state" role="status" aria-live="polite">
                <div class="loader-skeleton" aria-hidden="true">
                    <div class="skeleton-header">
                        <span class="skeleton-line skeleton-title"></span>
                        <span class="skeleton-pill"></span>
                    </div>
                    <div class="skeleton-table">
                        <div class="skeleton-row">
                            <span class="skeleton-cell w-35"></span>
                            <span class="skeleton-cell w-25"></span>
                            <span class="skeleton-cell w-20"></span>
                            <span class="skeleton-cell w-15"></span>
                        </div>
                        <div class="skeleton-row">
                            <span class="skeleton-cell w-30"></span>
                            <span class="skeleton-cell w-30"></span>
                            <span class="skeleton-cell w-20"></span>
                            <span class="skeleton-cell w-15"></span>
                        </div>
                        <div class="skeleton-row">
                            <span class="skeleton-cell w-40"></span>
                            <span class="skeleton-cell w-20"></span>
                            <span class="skeleton-cell w-20"></span>
                            <span class="skeleton-cell w-15"></span>
                        </div>
                    </div>
                </div>
                <div class="loader-message">
                    <h3 class="empty-state-title">Loading content…</h3>
                    <p class="empty-state-text">If this takes too long, the page may be unavailable.</p>
                    <button class="empty-state-link" type="button" onclick="window.location.reload()">Retry</button>
                </div>
            </div>
        `;
    },

    /**
     * Handle logout - show confirmation modal
     */
    handleLogout() {
        this.showLogoutModal();
    },
    
    /**
     * Show logout confirmation modal
     */
    showLogoutModal() {
        const modal = document.getElementById('logoutModal');
        if (modal) {
            modal.classList.add('active');
        }
    },
    
    /**
     * Hide logout confirmation modal
     */
    hideLogoutModal() {
        const modal = document.getElementById('logoutModal');
        if (modal) {
            modal.classList.remove('active');
        }
    },
    
    /**
     * Confirm logout action
     */
    confirmLogout() {
        // Clear client-side storage
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        localStorage.removeItem('activeTab');

        // Destroy server-side PHP session
        fetch('/rent-it/api/auth/logout.php', { method: 'POST' })
            .finally(() => {
                // Replace history so back button won't return to protected pages
                window.history.replaceState(null, '', '/rent-it/client/auth/login.php');
                window.location.replace('/rent-it/client/auth/login.php');
            });
    },

    /**
     * Open sidebar (mobile)
     */
    openSidebar() {
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('sidebarOverlay');
        if (sidebar) sidebar.classList.add('open');
        if (overlay) overlay.classList.add('active');
    },

    /**
     * Close sidebar (mobile)
     */
    closeSidebar() {
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('sidebarOverlay');
        if (sidebar) sidebar.classList.remove('open');
        if (overlay) overlay.classList.remove('active');
    },

    /**
     * Inject Topbar into the DOM
     * @param {string} containerId - ID of the container element
     * @param {string} title - Page title
     */
    injectTopbar(containerId, title = 'Dashboard') {
        const container = document.getElementById(containerId);
        if (!container) return;

        const user = this.getCurrentUser();
        const initial = this.getUserInitial(user.name);

     // Logic para sa Avatar Content (Image vs Initial)
const avatarContent = user.profile_picture 
? `<img src="/rent-it/assets/profile/${user.profile_picture}" 
        style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover; display: block;">`
: initial;

container.innerHTML = `
<header class="topbar">
    <button class="menu-btn" id="menuBtn" title="Toggle sidebar menu">☰</button>
    <h1 class="topbar-title" id="pageTitle">${title}</h1>
    <div class="topbar-actions">
        
        <button class="btn-icon theme-toggle" id="themeToggle" aria-label="Toggle theme" title="Toggle light/dark theme">
            <svg class="theme-icon-light" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="5"/>
                <line x1="12" y1="1" x2="12" y2="3"/>
                <line x1="12" y1="21" x2="12" y2="23"/>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                <line x1="1" y1="12" x2="3" y2="12"/>
                <line x1="21" y1="12" x2="23" y2="12"/>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
            </svg>
            <svg class="theme-icon-dark" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
            </svg>
        </button>
<div class="notification-wrapper">
    <button class="btn-icon notification-btn" id="notificationBtn" aria-label="Notifications" title="Notifications">
        <svg class="notification-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 24px; height: 24px;">
            <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>
        
        <span class="notification-badge" id="clientNotifBadge" style="display: none;">0</span>
    </button>

    <div class="notification-dropdown" id="notificationDropdown">
        <div class="notification-header">
            <h4>Notifications</h4>
        </div>
        
        <div class="notification-list" id="clientNotifList">
            <div class="notification-item">Loading notifications...</div>
        </div>

    </div>
</div>
        <div class="topbar-user profile-wrapper">
            <button class="btn-icon profile-btn" id="profileBtn" aria-label="User menu" title="Profile & settings">
                <div class="topbar-user-avatar">${avatarContent}</div>
            </button>
            
            <div class="profile-dropdown" id="profileDropdown">
                <div class="profile-header">
                    <div class="profile-info">
                       <div class="name">${user.full_name || 'User'}</div>
                        <div class="email">${user.email || 'user@example.com'}</div>
                    </div>
                </div>
                <nav class="profile-menu">
                    <a href="/rent-it/client/dashboard/dashboard.php" class="profile-menu-item">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="3" y="3" width="7" height="9"/>
                            <rect x="14" y="3" width="7" height="5"/>
                            <rect x="14" y="12" width="7" height="9"/>
                            <rect x="3" y="16" width="7" height="5"/>
                        </svg>
                        Dashboard
                    </a>
                    <a href="/rent-it/shared/js/myprofile.php" class="profile-menu-item">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                            <circle cx="12" cy="7" r="4"/>
                        </svg>
                        My Profile
                    </a>
                    <div class="profile-divider"></div>
                    <button class="profile-menu-item danger" id="profileLogoutBtn">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                            <polyline points="16 17 21 12 16 7"/>
                            <line x1="21" y1="12" x2="9" y2="12"/>
                        </svg>
                        Sign Out
                    </button>
                </nav>
            </div>
        </div>
    </div>
</header>

<div class="logout-modal-overlay" id="logoutModal">
    <div class="logout-modal">
        <div class="logout-modal-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
        </div>
        <h3 class="logout-modal-title">Sign Out</h3>
        <p class="logout-modal-text">Are you sure you want to sign out of your account?</p>
        <div class="logout-modal-actions">
            <button class="logout-modal-btn logout-modal-cancel" id="logoutCancelBtn">Cancel</button>
            <button class="logout-modal-btn logout-modal-confirm" id="logoutConfirmBtn">Sign Out</button>
        </div>
    </div>
</div>
`;

        // Attach menu button event
        const menuBtn = document.getElementById('menuBtn');
        if (menuBtn) {
            menuBtn.addEventListener('click', () => this.openSidebar());
        }

        // Initialize dropdown functionality
        this.initDropdowns();
        
        // Initialize theme toggle
        this.initThemeToggle();
    },

    /**
     * Initialize theme toggle functionality
     */
    initThemeToggle() {
        const themeToggle = document.getElementById('themeToggle');
        const sidebarThemeToggle = document.getElementById('sidebarThemeToggle');
        const themeLabel = document.querySelector('.theme-label');
        
        // Update button visibility and label based on current theme
        const updateToggleIcon = () => {
            const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
            themeToggle?.setAttribute('data-theme', isDark ? 'dark' : 'light');
            sidebarThemeToggle?.setAttribute('data-theme', isDark ? 'dark' : 'light');
            if (themeLabel) {
                themeLabel.textContent = isDark ? 'Light Mode' : 'Dark Mode';
            }
        };
        
        // Initial update
        updateToggleIcon();
        
        // Toggle theme function
        const toggleTheme = () => {
            const html = document.documentElement;
            const currentTheme = html.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            
            html.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            updateToggleIcon();
        };
        
        // Toggle theme on topbar button click
        themeToggle?.addEventListener('click', toggleTheme);
        
        // Toggle theme on sidebar button click
        sidebarThemeToggle?.addEventListener('click', toggleTheme);
    },

    /**
     * Initialize notification and profile dropdowns
     */
    initDropdowns() {
        const notificationBtn = document.getElementById('notificationBtn');
        const notificationDropdown = document.getElementById('notificationDropdown');
        const profileBtn = document.getElementById('profileBtn');
        const profileDropdown = document.getElementById('profileDropdown');
        const markReadBtn = document.getElementById('markReadBtn');

        const updateNotificationState = () => {
            const hasUnread = document.querySelector('.notification-item.unread') !== null;
            const badge = document.querySelector('.notification-badge');
            if (!notificationBtn) return;

            if (hasUnread) {
                notificationBtn.classList.remove('no-unread');
                if (badge) badge.style.display = '';
            } else {
                notificationBtn.classList.add('no-unread');
                if (badge) badge.style.display = 'none';
            }
        };

        // Initial icon/badge state
        updateNotificationState();

        // Notification toggle
        notificationBtn?.addEventListener('click', (e) => {
            e.stopPropagation();
            profileDropdown?.classList.remove('open');
            notificationDropdown?.classList.toggle('open');
        });

        // Profile toggle
        profileBtn?.addEventListener('click', (e) => {
            e.stopPropagation();
            notificationDropdown?.classList.remove('open');
            profileDropdown?.classList.toggle('open');
        });

        // Mark all as read
        markReadBtn?.addEventListener('click', (e) => {
            e.stopPropagation();
            document.querySelectorAll('.notification-item.unread').forEach(item => {
                item.classList.remove('unread');
            });
            updateNotificationState();
        });

        // Close on outside click
        document.addEventListener('click', (e) => {
            if (!notificationDropdown?.contains(e.target) && !notificationBtn?.contains(e.target)) {
                notificationDropdown?.classList.remove('open');
            }
            if (!profileDropdown?.contains(e.target) && !profileBtn?.contains(e.target)) {
                profileDropdown?.classList.remove('open');
            }
        });


       
        // Close on Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                notificationDropdown?.classList.remove('open');
                profileDropdown?.classList.remove('open');
                this.hideLogoutModal();
            }
        });
        
        // Initialize logout modal events
        this.initLogoutModal();
        
        // Initialize smart header (hide on scroll down, show on scroll up)
        this.initSmartHeader();
    },
    
    /**
     * Initialize logout modal events
     */
    initLogoutModal() {
        const profileLogoutBtn = document.getElementById('profileLogoutBtn');
        const logoutCancelBtn = document.getElementById('logoutCancelBtn');
        const logoutConfirmBtn = document.getElementById('logoutConfirmBtn');
        const logoutModal = document.getElementById('logoutModal');
        
        // Profile dropdown logout button
        profileLogoutBtn?.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            document.getElementById('profileDropdown')?.classList.remove('open');
            this.showLogoutModal();
        });
        
        // Cancel button
        logoutCancelBtn?.addEventListener('click', () => {
            this.hideLogoutModal();
        });
        
        // Confirm button
        logoutConfirmBtn?.addEventListener('click', () => {
            this.confirmLogout();
        });
        
        // Close on overlay click
        logoutModal?.addEventListener('click', (e) => {
            if (e.target === logoutModal) {
                this.hideLogoutModal();
            }
        });
    },

    /**
     * Initialize Smart Header (hide on scroll down, show on scroll up)
     */
    initSmartHeader() {
        const topbar = document.querySelector('.topbar');
        
        if (!topbar) return;
        
        let lastScrollTop = 0;
        const scrollThreshold = 10; // Minimum scroll distance to trigger hide/show
        
        window.addEventListener('scroll', () => {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const scrollDelta = scrollTop - lastScrollTop;
            
            // Scrolling down - hide header
            if (scrollDelta > scrollThreshold && scrollTop > 60) {
                topbar.classList.add('header-hidden');
            }
            // Scrolling up - show header
            else if (scrollDelta < -scrollThreshold) {
                topbar.classList.remove('header-hidden');
            }
            
            lastScrollTop = scrollTop;
        });
    },

    /**
     * Check if user is authenticated
     * @returns {boolean}
     */
    isAuthenticated() {
        return !!localStorage.getItem('user');
    },    /**
     * Redirect to login if not authenticated
     */
    requireAuth() {
        if (!this.isAuthenticated()) {
            window.location.href = '/rent-it/client/auth/login.php';
            return false;
        }
        return true;
    },

    /**
     * Initialize stagger animation for elements
     * @param {string} containerSelector - CSS selector for container
     */
    initStaggerAnimation(containerSelector) {
        const container = document.querySelector(containerSelector);
        if (!container) return;

        container.classList.add('motion-enabled');
        const children = container.querySelectorAll('.stagger-child');
        children.forEach((child, index) => {
            child.style.setProperty('--index', index);
        });
    },

    /**
     * Show eye icon SVG (password visible)
     */
    eyeOpenSvg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
        <circle cx="12" cy="12" r="3"/>
    </svg>`,

    /**
     * Show eye-off icon SVG (password hidden)
     */
    eyeClosedSvg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
        <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>`,

    /**
     * Toggle password visibility
     * @param {HTMLInputElement} input - Password input element
     * @param {HTMLButtonElement} button - Eye button element
     */
    togglePasswordVisibility(input, button) {
        const isPassword = input.type === 'password';
        input.type = isPassword ? 'text' : 'password';
        button.innerHTML = isPassword ? this.eyeClosedSvg : this.eyeOpenSvg;
        button.setAttribute('aria-label', isPassword ? 'Hide password' : 'Show password');
    },

    /**
     * Inject Footer into the DOM
     * @param {string} containerId - ID of the container element (default: 'footerContainer')
     */
    injectFooter(containerId = 'footerContainer') {
        const container = document.getElementById(containerId);
        if (!container) return;

        const currentYear = new Date().getFullYear();

        container.innerHTML = `
            <footer class="app-footer">
                <div class="footer-content">
                    <div class="footer-main">
                        <div class="footer-brand">
                            <img src="/rent-it/assets/images/rIT_logo_tp.png" alt="RentIT Logo" class="footer-logo">
                            <span class="footer-brand-name">RentIT</span>
                        </div>
                        <p class="footer-tagline">Premium karaoke equipment rentals for your perfect event.</p>
                    </div>
                    
                    <div class="footer-links">
                        <div class="footer-col">
                            <h4 class="footer-heading">Quick Links</h4>
                            <nav class="footer-nav">
                                <a href="/rent-it/client/catalog/catalog.php">Browse Catalog</a>
                                <a href="/rent-it/client/myrentals/myrentals.php">My Rentals</a>
                                <a href="/rent-it/client/bookinghistory/bookinghistory.php">Booking History</a>
                            </nav>
                        </div>
                        <div class="footer-col">
                            <h4 class="footer-heading">Support</h4>
                            <nav class="footer-nav">
                                <a href="/rent-it/client/contactusloggedin/contactusloggedin.php">Contact Us</a>
                                <a href="/rent-it/pages/aboutus.html">About</a>
                                <a href="/rent-it/pages/contactus.html#faq-section">FAQs</a>
                            </nav>
                        </div>
                        <div class="footer-col">
                            <h4 class="footer-heading">Legal</h4>
                            <nav class="footer-nav">
                                <a href="/rent-it/pages/terms.html">Terms of Service</a>
                                <a href="/rent-it/pages/privacy-policy.html">Privacy Policy</a>
                            </nav>
                        </div>
                    </div>
                </div>
                
                <div class="footer-bottom">
                    <p class="footer-copyright">&copy; ${currentYear} RentIT. All rights reserved.</p>
                    <div class="footer-socials">
                        <a href="https://www.facebook.com/CertiCode" class="social-link" aria-label="Facebook" target="_blank" rel="noopener noreferrer">
                            <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                            </svg>
                        </a>
                        <a href="https://www.certicode.tech/" class="social-link" aria-label="CertiCode Website" target="_blank" rel="noopener noreferrer">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
                                <circle cx="12" cy="12" r="9"/>
                                <line x1="3" y1="12" x2="21" y2="12"/>
                                <path d="M12 3a12 12 0 0 0 0 18"/>
                                <path d="M12 3a12 12 0 0 1 0 18"/>
                            </svg>
                        </a>
                        <a href="/rent-it/client/contactusloggedin/contactusloggedin.php" class="social-link" aria-label="Contact Us">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
                                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                                <polyline points="22,6 12,13 2,6"/>
                            </svg>
                        </a>
                    </div>
                </div>
            </footer>
        `;
    },

    /**
     * Review System - Check eligibility to write a review
     * @param {string} userId - User ID
     * @param {string} itemId - Item/Product ID
     * @returns {Object} { canReview: boolean, reason: string, existingReview: object|null }
     */
    checkReviewEligibility(userId, itemId) {
        // Mock rental history and reviews (in real app, would be API calls)
        const mockRentalHistory = JSON.parse(localStorage.getItem('rentit_rental_history') || '[]');
        const mockReviews = JSON.parse(localStorage.getItem('rentit_reviews') || '[]');

        // Check if user has rented this item
        const hasRented = mockRentalHistory.some(
            rental => rental.userId === userId && rental.itemId === itemId && rental.status === 'completed'
        );

        // Check if user already reviewed this item
        const existingReview = mockReviews.find(
            review => review.userId === userId && review.itemId === itemId
        );

        if (!hasRented) {
            return {
                canReview: false,
                reason: 'no_transaction',
                message: 'You can only review items you have rented. Rent this item to leave a review!',
                existingReview: null
            };
        }

        if (existingReview) {
            return {
                canReview: true,
                reason: 'already_reviewed',
                message: 'You have already reviewed this item. You can edit your review below.',
                existingReview: existingReview
            };
        }

        return {
            canReview: true,
            reason: 'eligible',
            message: 'Thank you for renting! Share your experience with this equipment.',
            existingReview: null
        };
    },

    /**
     * Open Review Modal
     * @param {Object} product - Product details { id, name, image, category }
     * @param {string} userId - Current user ID
     */
    openReviewModal(product, userId = 'user_1') {
        // Check eligibility first
        const eligibility = this.checkReviewEligibility(userId, product.id);
        
        // Create modal HTML
        const modalHtml = this.generateReviewModalHtml(product, eligibility);
        
        // Inject modal into body
        const modalContainer = document.createElement('div');
        modalContainer.innerHTML = modalHtml;
        document.body.appendChild(modalContainer.firstElementChild);
        
        // Open modal with animation
        requestAnimationFrame(() => {
            document.getElementById('reviewModalOverlay').classList.add('open');
        });
        
        // Attach modal event listeners
        this.attachReviewModalEvents(product.id, userId, eligibility);
    },

    /**
     * Generate Review Modal HTML
     */
    generateReviewModalHtml(product, eligibility) {
        const starSvg = `<svg viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`;
        
        // Generate stars based on existing review or empty
        const existingRating = eligibility.existingReview?.rating || 0;
        const existingText = eligibility.existingReview?.text || '';
        
        // Eligibility message type
        let msgType = 'success';
        let msgIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`;
        
        if (eligibility.reason === 'no_transaction') {
            msgType = 'error';
            msgIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`;
        } else if (eligibility.reason === 'already_reviewed') {
            msgType = 'warning';
            msgIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`;
        }
        
        // Existing review display
        let existingReviewHtml = '';
        if (eligibility.existingReview) {
            const reviewDate = new Date(eligibility.existingReview.date).toLocaleDateString('en-US', {
                year: 'numeric', month: 'short', day: 'numeric'
            });
            const starsHtml = Array(5).fill('').map((_, i) => 
                `<svg viewBox="0 0 24 24" style="fill: ${i < eligibility.existingReview.rating ? '#FACC15' : '#CBD5E1'}"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`
            ).join('');
            
            existingReviewHtml = `
                <div class="existing-review">
                    <div class="existing-review-header">
                        <div class="existing-review-stars">${starsHtml}</div>
                        <span class="existing-review-date">${reviewDate}</span>
                    </div>
                    <p class="existing-review-text">${eligibility.existingReview.text}</p>
                    <button class="btn-edit-review" id="btnEditReview">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                        Edit Review
                    </button>
                </div>
            `;
        }
        
        // Form (hidden if already reviewed, shown when editing)
        const formDisplayStyle = eligibility.existingReview ? 'display: none;' : '';
        
        return `
            <div class="review-modal-overlay" id="reviewModalOverlay">
                <div class="review-modal">
                    <div class="review-modal-header">
                        <h2 class="review-modal-title">${eligibility.existingReview ? 'Your Review' : 'Write a Review'}</h2>
                        <button class="review-modal-close" id="reviewModalClose">
                            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
                                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                            </svg>
                        </button>
                    </div>
                    
                    <div class="review-modal-body">
                        <!-- Product Info -->
                        <div class="review-product-info">
                            <div class="review-product-image">
                                <img src="${product.image}" alt="${product.name}" 
                                     onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 80 80%22><rect fill=%22%231E293B%22 width=%2280%22 height=%2280%22/><text x=%2250%%22 y=%2250%%22 fill=%22%2394A3B8%22 text-anchor=%22middle%22 dominant-baseline=%22middle%22 font-family=%22Inter%22 font-size=%228%22>🎤</text></svg>'">
                            </div>
                            <div class="review-product-details">
                                <div class="review-product-name">${product.name}</div>
                                <div class="review-product-meta">${product.category || 'Equipment'}</div>
                            </div>
                        </div>
                        
                        <!-- Eligibility Message -->
                        <div class="review-eligibility-message ${msgType}">
                            <span class="review-eligibility-icon">${msgIcon}</span>
                            <span class="review-eligibility-text">${eligibility.message}</span>
                        </div>
                        
                        ${existingReviewHtml}
                        
                        <!-- Review Form (hidden if not eligible or already reviewed) -->
                        <div id="reviewFormContainer" style="${eligibility.reason === 'no_transaction' ? 'display: none;' : ''} ${formDisplayStyle}">
                            <!-- Star Rating -->
                            <div class="star-rating-input">
                                <label class="star-rating-label">How would you rate this equipment?</label>
                                <div class="star-rating-stars">
                                    <input type="radio" name="rating" id="star5" value="5" ${existingRating === 5 ? 'checked' : ''}>
                                    <label for="star5">${starSvg}</label>
                                    <input type="radio" name="rating" id="star4" value="4" ${existingRating === 4 ? 'checked' : ''}>
                                    <label for="star4">${starSvg}</label>
                                    <input type="radio" name="rating" id="star3" value="3" ${existingRating === 3 ? 'checked' : ''}>
                                    <label for="star3">${starSvg}</label>
                                    <input type="radio" name="rating" id="star2" value="2" ${existingRating === 2 ? 'checked' : ''}>
                                    <label for="star2">${starSvg}</label>
                                    <input type="radio" name="rating" id="star1" value="1" ${existingRating === 1 ? 'checked' : ''}>
                                    <label for="star1">${starSvg}</label>
                                </div>
                                <div class="star-rating-value" id="ratingValue">${existingRating > 0 ? existingRating + ' star' + (existingRating > 1 ? 's' : '') : 'Select a rating'}</div>
                            </div>
                            
                            <!-- Review Text -->
                            <textarea class="review-textarea" id="reviewText" placeholder="Share your experience with this equipment. What did you like? Was it easy to use?" maxlength="500">${existingText}</textarea>
                            <div class="review-char-count"><span id="charCount">${existingText.length}</span>/500</div>
                        </div>
                    </div>
                    
                    <div class="review-modal-footer" id="reviewModalFooter" style="${eligibility.reason === 'no_transaction' ? 'display: none;' : ''} ${formDisplayStyle}">
                        <button class="btn-review-cancel" id="btnReviewCancel">Cancel</button>
                        <button class="btn-review-submit" id="btnReviewSubmit" ${!eligibility.canReview ? 'disabled' : ''}>
                            ${eligibility.existingReview ? 'Update Review' : 'Submit Review'}
                        </button>
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * Attach Review Modal Event Listeners
     */
    attachReviewModalEvents(itemId, userId, eligibility) {
        const overlay = document.getElementById('reviewModalOverlay');
        const closeBtn = document.getElementById('reviewModalClose');
        const cancelBtn = document.getElementById('btnReviewCancel');
        const submitBtn = document.getElementById('btnReviewSubmit');
        const reviewText = document.getElementById('reviewText');
        const charCount = document.getElementById('charCount');
        const ratingValue = document.getElementById('ratingValue');
        const editBtn = document.getElementById('btnEditReview');
        const formContainer = document.getElementById('reviewFormContainer');
        const footer = document.getElementById('reviewModalFooter');
        const existingReviewEl = document.querySelector('.existing-review');

        // Close modal
        const closeModal = () => {
            overlay.classList.remove('open');
            setTimeout(() => overlay.remove(), 300);
        };

        closeBtn?.addEventListener('click', closeModal);
        cancelBtn?.addEventListener('click', closeModal);
        overlay?.addEventListener('click', (e) => {
            if (e.target === overlay) closeModal();
        });

        // Edit review button
        editBtn?.addEventListener('click', () => {
            if (existingReviewEl) existingReviewEl.style.display = 'none';
            if (formContainer) formContainer.style.display = 'block';
            if (footer) footer.style.display = 'flex';
        });

        // Character count
        reviewText?.addEventListener('input', () => {
            charCount.textContent = reviewText.value.length;
        });

        // Star rating display
        document.querySelectorAll('input[name="rating"]').forEach(input => {
            input.addEventListener('change', () => {
                const val = input.value;
                ratingValue.textContent = val + ' star' + (val > 1 ? 's' : '');
            });
        });

        // Submit review
        submitBtn?.addEventListener('click', () => {
            const rating = document.querySelector('input[name="rating"]:checked')?.value;
            const text = reviewText?.value.trim();

            if (!rating) {
                this.showReviewToast('Please select a star rating', 'error');
                return;
            }

            if (text.length < 10) {
                this.showReviewToast('Please write at least 10 characters', 'error');
                return;
            }

            // Save review to localStorage
            this.saveReview(userId, itemId, parseInt(rating), text);
            
            this.showReviewToast(eligibility.existingReview ? 'Review updated successfully!' : 'Review submitted successfully!', 'success');
            closeModal();
        });
    },

    /**
     * Save review to localStorage
     */
    saveReview(userId, itemId, rating, text) {
        const reviews = JSON.parse(localStorage.getItem('rentit_reviews') || '[]');
        
        // Find existing review
        const existingIndex = reviews.findIndex(r => r.userId === userId && r.itemId === itemId);
        
        const reviewData = {
            userId,
            itemId,
            rating,
            text,
            date: new Date().toISOString()
        };

        if (existingIndex >= 0) {
            reviews[existingIndex] = reviewData;
        } else {
            reviews.push(reviewData);
        }

        localStorage.setItem('rentit_reviews', JSON.stringify(reviews));
    },

    /**
     * Show toast notification for review actions
     */
    showReviewToast(message, type = 'success') {
        // Remove existing toasts
        document.querySelectorAll('.review-toast').forEach(t => t.remove());

        const toast = document.createElement('div');
        toast.className = `toast review-toast toast-${type}`;
        
        const iconSvg = type === 'success'
            ? '<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="#22C55E" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>'
            : '<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="#EF4444" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>';

        toast.innerHTML = `${iconSvg}<span class="toast-message">${message}</span>`;
        document.body.appendChild(toast);

        requestAnimationFrame(() => toast.classList.add('show'));
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    },

    /**
     * Global Toast Notification System
     * @param {string} message - The message to display
     * @param {string} type - Toast type: 'success', 'error', 'warning', 'info'
     */
    showToast(message, type = 'success') {
        // Remove existing toasts
        document.querySelectorAll('.toast').forEach(t => t.remove());

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;

        // Icon based on type
        const icons = {
            success: '<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="#22C55E" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
            error: '<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="#EF4444" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
            warning: '<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
            info: '<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="#014F86" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>'
        };

        toast.innerHTML = `
            ${icons[type] || icons.info}
            <span class="toast-message">${message}</span>
        `;

        document.body.appendChild(toast);

        // Trigger slide-in animation
        requestAnimationFrame(() => {
            toast.classList.add('show');
        });

        // Auto-remove after 3 seconds
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    },

    /**
     * Initialize mock rental history for testing reviews
     */
    initMockRentalHistory() {
        const existing = localStorage.getItem('rentit_rental_history');
        if (!existing) {
            const mockHistory = [
                { userId: 'user_1', itemId: '1', status: 'completed', date: '2026-01-15' },
                { userId: 'user_1', itemId: '2', status: 'completed', date: '2026-01-20' },
                { userId: 'user_1', itemId: '5', status: 'active', date: '2026-01-28' }
            ];
            localStorage.setItem('rentit_rental_history', JSON.stringify(mockHistory));
        }
    }
};

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Components;
}

// Global showToast function for convenience
window.showToast = function(message, type = 'success') {
    Components.showToast(message, type);
};

if (typeof window !== 'undefined') {
    // Auto-hide any existing per-page skeleton overlay
    const _hideSkeleton = () => Components.initPageSkeleton();
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', _hideSkeleton, { once: true });
    } else {
        _hideSkeleton();
    }
}

function loadClientNotifications() {
    // Siguraduhin na tama ang path ng get_notifications.php mo
    fetch('/rent-it/api/get_notifications.php?role=client')
        .then(res => res.json())
        .then(data => {
            const list = document.getElementById('clientNotifList');
            const badge = document.getElementById('clientNotifBadge');

            if (data.status === 'success') {
                // 1. Update ang Badge
                if (badge) {
                    badge.innerText = data.unread_count;
                    badge.style.display = data.unread_count > 0 ? 'block' : 'none';
                }

                // 2. Update ang Listahan
                if (list) {
                    list.innerHTML = ''; // Burahin ang "Loading..."

                    if (data.data.length === 0) {
                        list.innerHTML = '<div class="notification-item">No new notifications</div>';
                        return;
                    }

                    data.data.forEach(notif => {
                        const isUnread = notif.is_read == 0 ? 'unread' : '';
                        // Ang redirectUrl ay galing sa link_url sa database
                        const redirectUrl = notif.link_url || '#';

                        list.innerHTML += `
                            <div class="notification-item ${isUnread}" 
                                 onclick="markAsRead(${notif.id}, '${redirectUrl}')" 
                                 style="cursor: pointer;">
                                <div class="notification-content">
                                    <div class="notification-title" style="font-weight: bold;">${notif.title}</div>
                                    <div class="notification-text">${notif.message}</div>
                                    <div class="notification-time" style="font-size: 0.8rem; color: #888;">${notif.created_at}</div>
                                </div>
                            </div>
                        `;
                    });
                }
            }
        })
        .catch(err => console.error('Error loading client notifications:', err));
}

// Tawagin ang function agad at i-set ang refresh rate (halimbawa, every 10 seconds)
loadClientNotifications();
setInterval(loadClientNotifications, 10000);
