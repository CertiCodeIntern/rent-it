/**
 * =====================================================
 * ADMIN COMPONENTS - JavaScript Module
 * Reusable components for Admin Portal
 * Sidebar, Header, Theme Toggle, Utilities
 * =====================================================
 */

// ========== THEME PERSISTENCE (Fallback) ==========
// Primary theme + skeleton logic is in admin-theme.js (loaded in <head>)
// This is a fallback in case admin-theme.js wasn't included
(function() {
    const savedTheme = localStorage.getItem('admin-theme');
    if (savedTheme) {
        document.documentElement.setAttribute('data-theme', savedTheme);
    } else if (!document.documentElement.getAttribute('data-theme')) {
        document.documentElement.setAttribute('data-theme', 'dark');
    }
})();

function loadNotifications() {
     fetch('/rent-it/api/get_notifications.php?role=admin')
     .then(res => res.json())
     .then(data => {
     if (data.status === 'success') {
     const list = document.getElementById('notifList');
     const badge = document.querySelector('.notification-badge');
     if(badge) {
     badge.innerText = data.unread_count;
     badge.style.display = data.unread_count > 0 ? 'block' : 'none';
     }
     if(list) {
     list.innerHTML = '';
     if (data.data.length === 0) {
     list.innerHTML = '<div class="notification-item">No  notification</div>';
     return;
     }
        
        data.data.forEach(notif => {
            const isUnread = notif.is_read == 0 ? 'unread' : '';
            const orderLink = '/rent-it/admin/orders/orders.php'; 
            
            list.innerHTML += `
            <div class="notification-item ${isUnread}" 
                 onclick="markAsRead(${notif.id}, '${orderLink}')" 
                 style="cursor: pointer; padding: 10px; border-bottom: 1px solid #eee;">
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
     });
    }setInterval(loadNotifications, 10000);loadNotifications();

    window.markAsRead = function(id, redirectUrl) {
        fetch('/rent-it/api/mark_notification_read.php', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ id: id, role: 'admin' })
        })
        .then(res => res.json())
        .then(data => {
            console.log("Success:", data);
            window.location.href = redirectUrl;
        })
        .catch(err => {
            console.error('Error:', err);
            window.location.href = redirectUrl;
        });
    }

function initAdminPageSkeleton() {
       const overlay = document.querySelector('.admin-skeleton-overlay');
    if (!overlay) return;

 
    if (!overlay.classList.contains('is-hidden')) {
        overlay.classList.add('is-hidden');
        setTimeout(() => {
            if (overlay.parentNode) overlay.remove();
        }, 350);
    }
}

const AdminComponents = {
    BASE_URL: '/rent-it',

    baseUrl(path = '') {
        const normalized = path.startsWith('/') ? path : `/${path}`;
        return `${this.BASE_URL}${normalized}`;
    },

    initPageSkeleton() {
        initAdminPageSkeleton();
    },

    /**
     * Navigation items for admin sidebar
     */
    navItems: [
        { 
            id: 'dashboard', 
            label: 'Dashboard', 
            href: '/admin/dashboard/dashboard.php',
            icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="7" height="9"/>
                <rect x="14" y="3" width="7" height="5"/>
                <rect x="14" y="12" width="7" height="9"/>
                <rect x="3" y="16" width="7" height="5"/>
            </svg>`
        },
        { 
            id: 'newitem', 
            label: 'New Item', 
            href: '/admin/newitem/newitem.php',
            icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>`
        },
        { 
            id: 'item', 
            label: 'Items', 
            href: '/admin/item/item.php',
            icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="7" height="7"/>
                <rect x="14" y="3" width="7" height="7"/>
                <rect x="3" y="14" width="7" height="7"/>
                <rect x="14" y="14" width="7" height="7"/>
            </svg>`
        },
        { 
            id: 'orders', 
            label: 'Orders', 
            href: '/admin/orders/orders.php',
            icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
                <polyline points="10 9 9 9 8 9"/>
            </svg>`
        },
        { 
            id: 'dispatch', 
            label: 'Dispatch', 
            href: '/admin/dispatch/dispatch.php',
            icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="1" y="3" width="15" height="13"/>
                <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
                <circle cx="5.5" cy="18.5" r="2.5"/>
                <circle cx="18.5" cy="18.5" r="2.5"/>
            </svg>`
        },
        { 
            id: 'customers', 
            label: 'Customers', 
            href: '/admin/customers/customers.php',
            icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>`
        },
        { 
            id: 'calendar', 
            label: 'Calendar', 
            href: '/admin/calendar/calendar.php',
            icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>`
        },
        { 
            id: 'repairs', 
            label: 'Repairs', 
            href: '/admin/repairs/repairs.php',
            icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
            </svg>`
        },
        { 
            id: 'latefees', 
            label: 'Late Fees', 
            href: '/admin/latefees/latefees.php',
            icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <text x="12" y="16" text-anchor="middle" font-size="18" font-weight="bold" fill="currentColor">₱</text>
            </svg>`
        },
        { 
            id: 'history', 
            label: 'History', 
            href: '/admin/history/history.php',
            icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
            </svg>`
        },
    ],

    /**
     * Get current admin user from localStorage
     */
    getCurrentUser() {
        const userStr = localStorage.getItem('admin-user');
        if (userStr) {
            try {
                return JSON.parse(userStr);
            } catch (e) {
                return { name: 'Admin', role: 'Administrator', email: 'admin@rentit.com' };
            }
        }
        return { name: 'Admin', role: 'Administrator', email: 'admin@rentit.com' };
    },

    /**
     * Get user initial for avatar
     */
    getUserInitial(name) {
        return name?.charAt(0)?.toUpperCase() || 'A';
    },

    /**
     * Inject Sidebar into the DOM
     * @param {string} containerId - Container element ID
     * @param {string} activePage - Currently active page ID
     */
    injectSidebar(containerId, activePage = 'dashboard') {
        const container = document.getElementById(containerId);
        if (!container) return;

        const user = this.getCurrentUser();
        const initial = this.getUserInitial(user.name);
        const isCollapsed = localStorage.getItem('admin-sidebar-collapsed') === 'true';

        const navItems = this.navItems.map(item => `
            <a href="${this.baseUrl(item.href)}" 
               class="sidebar-nav-item${item.id === activePage ? ' active' : ''}" 
               title="${item.label}"
               data-page="${item.id}">
                <span class="sidebar-nav-icon">${item.icon}</span>
                <span class="sidebar-nav-label">${item.label}</span>
            </a>
        `).join('');

        container.innerHTML = `
            <aside class="admin-sidebar ${isCollapsed ? 'collapsed' : ''}" id="adminSidebar">
                <div class="sidebar-logo">
                    <a href="${this.baseUrl('/admin/dashboard/dashboard.php')}" class="sidebar-logo-link" title="Go to Dashboard">
                        <img src="${this.baseUrl('/assets/images/rIT_logo_tp.png')}" alt="RentIT Logo" class="sidebar-logo-icon" onerror="this.style.display='none'">
                        <span class="sidebar-logo-text">RentIT</span>
                    </a>
                    <button class="sidebar-collapse-btn" id="sidebarCollapseBtn" title="Collapse/expand sidebar" aria-label="Toggle sidebar">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="15 18 9 12 15 6"/>
                        </svg>
                    </button>
                </div>
                <nav class="sidebar-nav">
                    ${navItems}
                </nav>
                
                <div class="sidebar-footer">
                    <div class="sidebar-user">
                        <div class="sidebar-user-avatar">${initial}</div>
                        <div class="sidebar-user-info">
                            <span class="sidebar-user-name">${user.name || 'Admin'}</span>
                            <span class="sidebar-user-role">${user.role || 'Administrator'}</span>
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
                        <button class="mobile-action-item danger" id="sidebarLogoutBtn">
                            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                                <polyline points="16 17 21 12 16 7"/>
                                <line x1="21" y1="12" x2="9" y2="12"/>
                            </svg>
                            <span>Sign Out</span>
                        </button>
                    </div>
                </div>
            </aside>
            <div class="sidebar-overlay" id="sidebarOverlay"></div>
        `;

        // Apply collapsed state to wrapper
        if (isCollapsed) {
            document.querySelector('.admin-wrapper')?.classList.add('sidebar-collapsed');
        }

        this.attachSidebarEvents();
    },

    /**
     * Attach sidebar event listeners
     */
    attachSidebarEvents() {
        const collapseBtn = document.getElementById('sidebarCollapseBtn');
        const sidebar = document.getElementById('adminSidebar');
        const wrapper = document.querySelector('.admin-wrapper');
        const overlay = document.getElementById('sidebarOverlay');

        // Collapse toggle (desktop)
        if (collapseBtn && sidebar) {
            collapseBtn.addEventListener('click', () => {
                sidebar.classList.toggle('collapsed');
                wrapper?.classList.toggle('sidebar-collapsed');
                localStorage.setItem('admin-sidebar-collapsed', sidebar.classList.contains('collapsed'));
            });
        }

        // Overlay click to close sidebar (mobile)
        if (overlay) {
            overlay.addEventListener('click', () => this.closeSidebar());
        }

        // Mobile theme toggle in sidebar
        const sidebarThemeToggle = document.getElementById('sidebarThemeToggle');
        if (sidebarThemeToggle) {
            sidebarThemeToggle.addEventListener('click', () => this.toggleTheme());
        }

        // Mobile logout in sidebar
        const sidebarLogoutBtn = document.getElementById('sidebarLogoutBtn');
        if (sidebarLogoutBtn) {
            sidebarLogoutBtn.addEventListener('click', () => this.handleLogout());
        }
    },

    /**
     * Open sidebar (mobile)
     */
    openSidebar() {
        const sidebar = document.getElementById('adminSidebar');
        const overlay = document.getElementById('sidebarOverlay');
        if (sidebar) sidebar.classList.add('open');
        if (overlay) overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    },

    /**
     * Close sidebar (mobile)
     */
    closeSidebar() {
        const sidebar = document.getElementById('adminSidebar');
        const overlay = document.getElementById('sidebarOverlay');
        if (sidebar) sidebar.classList.remove('open');
        if (overlay) overlay.classList.remove('active');
        document.body.style.overflow = '';
    },

    /**
     * Inject Header into the DOM
     * @param {string} containerId - Container element ID
     * @param {string} pageTitle - Title to display in the header
     */
    injectHeader(containerId, pageTitle = '') {
        const container = document.getElementById(containerId);
        if (!container) return;

        const user = this.getCurrentUser();
        const initial = this.getUserInitial(user.name);
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';

        container.innerHTML = `
            <header class="admin-header">
                <div class="header-left">
                    <button class="header-btn mobile-menu-btn" id="mobileMenuBtn" title="Toggle menu">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="3" y1="12" x2="21" y2="12"/>
                            <line x1="3" y1="6" x2="21" y2="6"/>
                            <line x1="3" y1="18" x2="21" y2="18"/>
                        </svg>
                    </button>
                    
                    <h2 class="header-page-title">${pageTitle}</h2>
                </div>
                
                <div class="header-right">
                    <button class="theme-toggle" id="themeToggle" title="Toggle light/dark theme">
                        <svg class="icon-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="5"/>
                            <line x1="12" y1="1" x2="12" y2="3"/>
                            <line x1="12" y1="21" x2="12" y2="23"/>
                            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                            <line x1="1" y1="12" x2="3" y2="12"/>
                            <line x1="21" y1="12" x2="23" y2="12"/>
                            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                            
                        </svg>
                        <svg class="icon-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                        </svg>
                    </button>

                    <div class="dropdown notification-wrapper" id="notificationDropdownWrapper">
                        <button class="header-btn" id="notificationBtn" title="Notifications">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/>
                                <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                            </svg>
                            <span class="notification-badge">3</span>
                        </button>
                       <div class="dropdown-menu notification-dropdown" id="notificationDropdown">
 <div class="dropdown-header">
 <h4>Notifications</h4>
 <button class="mark-read" id="markReadBtn" type="button">Mark all as read</button>
 </div>
 <div class="notification-list" id="notifList">

 <div class="notification-item">
 <div class="notification-content">Loading...</div>
 </div>
 </div>
 <div class="notification-footer">
 <a href="#">View all notifications</a>
 </div>
</div>
                        </div>
                  
                    
                    <div class="dropdown" id="profileDropdown">
                        <button class="header-btn profile-btn" id="profileBtn" title="Profile menu">
                            <div class="profile-avatar">${initial}</div>
                        </button>
                        <div class="dropdown-menu profile-dropdown-menu" id="profileMenu">
                            <div class="profile-dropdown-header">
                                <div class="profile-avatar-lg">${initial}</div>
                                <div class="profile-dropdown-info">
                                    <span class="profile-dropdown-name">${user.name || 'Admin'}</span>
                                    <span class="profile-dropdown-email">${user.email || 'admin@rentit.com'}</span>
                                </div>
                            </div>
                            <div class="dropdown-divider"></div>
                            <a href="${this.baseUrl('admin/dashboard/dashboard.php')}" class="dropdown-item">
                                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                                    <rect x="3" y="3" width="7" height="9"/>
                                    <rect x="14" y="3" width="7" height="5"/>
                                    <rect x="14" y="12" width="7" height="9"/>
                                    <rect x="3" y="16" width="7" height="5"/>
                                </svg>
                                Dashboard
                            </a>
                        
                            <a href="${this.baseUrl('admin/settings/settings.php')}" class="dropdown-item">
                                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                                    <circle cx="12" cy="12" r="3"/>
                                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
                                </svg>
                                Settings
                            </a>
                            <div class="dropdown-divider"></div>
                            <button class="dropdown-item danger" id="logoutBtn">
                                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                                    <polyline points="16 17 21 12 16 7"/>
                                    <line x1="21" y1="12" x2="9" y2="12"/>
                                </svg>
                                Sign Out
                            </button>
                        </div>
                    </div>
                </div>
            </header>
        `;

        this.attachHeaderEvents();
    },

    /**
     * Attach header event listeners
     */
    attachHeaderEvents() {
        // Mobile menu toggle
        const mobileMenuBtn = document.getElementById('mobileMenuBtn');
        if (mobileMenuBtn) {
            mobileMenuBtn.addEventListener('click', () => this.openSidebar());
        }

        // Theme toggle
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => this.toggleTheme());
        }

        // Smart header: hide on scroll down, show on scroll up
        this.initSmartHeader();

        // Dropdown toggles
        document.querySelectorAll('.dropdown').forEach(dropdown => {
            const btn = dropdown.querySelector('.header-btn, .profile-btn');
            if (btn) {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    // Close other dropdowns
                    document.querySelectorAll('.dropdown.open').forEach(d => {
                        if (d !== dropdown) d.classList.remove('open');
                    });
                    dropdown.classList.toggle('open');
                });
            }
        });

        // Close dropdowns on outside click
        document.addEventListener('click', () => {
            document.querySelectorAll('.dropdown.open').forEach(d => d.classList.remove('open'));
        });

        // Notification: mark all as read (for header dropdown)
        const markReadBtn = document.getElementById('markReadBtn');
        if (markReadBtn) {
            markReadBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                document.querySelectorAll('.notification-item.unread').forEach(item => {
                    item.classList.remove('unread');
                });
                const badge = document.querySelector('.notification-badge');
                if (badge) {
                    badge.style.display = 'none';
                }
            });
        }

        // Logout
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.handleLogout());
        }

        // Keyboard shortcut for theme toggle (Alt + T)
        document.addEventListener('keydown', (e) => {
            if (e.altKey && e.key === 't') {
                e.preventDefault();
                this.toggleTheme();
            }
        });
    },

    /**
     * Smart header: hide on scroll down, show on scroll up
     */
    initSmartHeader() {
        const header = document.querySelector('.admin-header');
        if (!header) return;

        let lastScrollTop = 0;
        const scrollThreshold = 10;

        window.addEventListener('scroll', () => {
            const currentScroll = window.pageYOffset || document.documentElement.scrollTop;

            // Don't hide header when near the top
            if (currentScroll <= 0) {
                header.classList.remove('header-hidden');
                lastScrollTop = currentScroll;
                return;
            }

            const scrollDiff = Math.abs(currentScroll - lastScrollTop);
            if (scrollDiff < scrollThreshold) return;

            if (currentScroll > lastScrollTop) {
                // Scrolling down — hide header
                header.classList.add('header-hidden');
                // Close any open dropdowns
                document.querySelectorAll('.dropdown.open').forEach(d => d.classList.remove('open'));
            } else {
                // Scrolling up — show header
                header.classList.remove('header-hidden');
            }

            lastScrollTop = currentScroll;
        }, { passive: true });
    },

    /**
     * Inject Footer into the DOM
     * @param {string} containerId - Container element ID
     */
    injectFooter(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const year = new Date().getFullYear();
        container.innerHTML = `
            <footer class="admin-footer">
                © ${year} CertiCode Videoke Rentals • v2.5.0
            </footer>
        `;
    },

    /**
     * Toggle light/dark theme
     */
    toggleTheme() {
        const html = document.documentElement;
        const currentTheme = html.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        html.setAttribute('data-theme', newTheme);
        localStorage.setItem('admin-theme', newTheme);
        
        // Show toast notification
        this.showToast(`Switched to ${newTheme} mode`, 'info');
    },

    /**
     * Handle logout
     */
    handleLogout() {
        this.showModal({
            title: 'Sign Out',
            content: `
                <div style="text-align: center; padding: 1rem 0;">
                    <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="var(--admin-warning)" stroke-width="2" style="margin-bottom: 1rem;">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                        <polyline points="16 17 21 12 16 7"/>
                        <line x1="21" y1="12" x2="9" y2="12"/>
                    </svg>
                    <p style="color: var(--admin-text-primary); margin: 0;">Are you sure you want to sign out?</p>
                    <p style="color: var(--admin-text-muted); font-size: 0.875rem; margin-top: 0.5rem;">You will need to sign in again to access the admin portal.</p>
                </div>
            `,
            confirmText: 'Sign Out',
            cancelText: 'Cancel',
            type: 'danger',
            onConfirm: () => {
                localStorage.removeItem('admin-user');
                localStorage.removeItem('admin-token');
                localStorage.removeItem('certicode_admin_session');
                sessionStorage.removeItem('certicode_admin_session');
                // Use PHP logout to destroy server session
                window.location.href = this.baseUrl('admin/api/admin_logout.php');
            }
        });
    },

    /**
     * Show toast notification
     * @param {string} message - Toast message
     * @param {string} type - Toast type (success, warning, danger, info)
     * @param {number} duration - Duration in ms (default 3000)
     */
    showToast(message, type = 'info', duration = 3000) {
        // Create container if not exists
        let container = document.querySelector('.toast-container');
        if (!container) {
            container = document.createElement('div');
            container.className = 'toast-container';
            document.body.appendChild(container);
        }

        const icons = {
            success: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`,
            warning: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
            danger: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`,
            info: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`
        };

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <span class="toast-icon">${icons[type] || icons.info}</span>
            <div class="toast-content">
                <div class="toast-message">${message}</div>
            </div>
            <button class="toast-close" title="Dismiss">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
            </button>
        `;

        container.appendChild(toast);

        // Close button
        toast.querySelector('.toast-close').addEventListener('click', () => {
            toast.style.animation = 'slideInRight 0.3s ease reverse forwards';
            setTimeout(() => toast.remove(), 300);
        });

        // Auto remove
        setTimeout(() => {
            if (toast.parentNode) {
                toast.style.animation = 'slideInRight 0.3s ease reverse forwards';
                setTimeout(() => toast.remove(), 300);
            }
        }, duration);
    },

    /**
     * Show modal dialog
     * @param {Object} config - Modal configuration
     */
    showModal(config) {
        const { title, content, onConfirm, onCancel, confirmText = 'Confirm', cancelText = 'Cancel', type = 'default' } = config;

        // Remove existing modal
        document.querySelector('.modal-backdrop')?.remove();

        const backdrop = document.createElement('div');
        backdrop.className = 'modal-backdrop';
        backdrop.innerHTML = `
            <div class="modal">
                <div class="modal-header">
                    <h3 class="modal-title">${title}</h3>
                    <button class="modal-close" title="Close">
                        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="18" y1="6" x2="6" y2="18"/>
                            <line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                    </button>
                </div>
                <div class="modal-body">
                    ${content}
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary modal-cancel">${cancelText}</button>
                    <button class="btn ${type === 'danger' ? 'btn-danger' : 'btn-primary'} modal-confirm">${confirmText}</button>
                </div>
            </div>
        `;

        document.body.appendChild(backdrop);

        // Animate in
        requestAnimationFrame(() => backdrop.classList.add('open'));

        // Event handlers
        const close = () => {
            backdrop.classList.remove('open');
            setTimeout(() => backdrop.remove(), 300);
        };

        backdrop.querySelector('.modal-close').addEventListener('click', () => {
            if (onCancel) onCancel();
            close();
        });

        backdrop.querySelector('.modal-cancel').addEventListener('click', () => {
            if (onCancel) onCancel();
            close();
        });

        backdrop.querySelector('.modal-confirm').addEventListener('click', () => {
            if (onConfirm) onConfirm();
            close();
        });

        // Close on backdrop click
        backdrop.addEventListener('click', (e) => {
            if (e.target === backdrop) {
                if (onCancel) onCancel();
                close();
            }
        });

        // Close on Escape key
        const escHandler = (e) => {
            if (e.key === 'Escape') {
                if (onCancel) onCancel();
                close();
                document.removeEventListener('keydown', escHandler);
            }
        };
        document.addEventListener('keydown', escHandler);
    },

    /**
     * Format currency (Philippine Peso)
     * @param {number} amount - Amount to format
     */
    formatCurrency(amount) {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
            minimumFractionDigits: 2
        }).format(amount);
    },

    /**
     * Format date
     * @param {Date|string} date - Date to format
     * @param {Object} options - Intl.DateTimeFormat options
     */
    formatDate(date, options = {}) {
        const defaultOptions = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Intl.DateTimeFormat('en-US', { ...defaultOptions, ...options }).format(new Date(date));
    },

    /**
     * Calculate days difference
     * @param {Date|string} date1 - First date
     * @param {Date|string} date2 - Second date (default: today)
     */
    daysDifference(date1, date2 = new Date()) {
        const d1 = new Date(date1);
        const d2 = new Date(date2);
        const diffTime = d2 - d1;
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    },

    /**
     * Initialize common page setup
     * @param {string} activePage - Current page ID for sidebar highlight
     */
    initPage(activePage) {
        // Map page IDs to titles
        const pageTitles = {
            dashboard: 'Dashboard',
            calendar: 'Calendar',
            repairs: 'Repairs',
            latefees: 'Late Fees',
            orders: 'Orders',
            items: 'Items',
            customers: 'Customers',
            dispatch: 'Dispatch',
            settings: 'Settings',
            newitem: 'New Item'
        };
        const pageTitle = pageTitles[activePage] || '';

        // Inject components
        this.injectSidebar('sidebarContainer', activePage);
        this.injectHeader('headerContainer', pageTitle);
        this.injectFooter('footerContainer');

        // Add animation to content area
        const contentArea = document.querySelector('.admin-content');
        if (contentArea) {
            contentArea.classList.add('animate-fadeInUp');
        }
    }
};

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AdminComponents;
}

