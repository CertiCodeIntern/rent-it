import React, { useState, useEffect, useRef, useCallback } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';

// CSS imports
import '../styles/admin-theme.css';
import '../styles/admin-globals.css';
import '../styles/admin-components.css';

// Navigation items — EXACT order & icons from original admin-components.js
const NAV_ITEMS = [
    {
        id: 'dashboard', label: 'Dashboard', path: '/admin', icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="9" /><rect x="14" y="3" width="7" height="5" /><rect x="14" y="12" width="7" height="9" /><rect x="3" y="16" width="7" height="5" />
            </svg>
        )
    },
    {
        id: 'newitem', label: 'New Item', path: '/admin/newitem', icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
        )
    },
    {
        id: 'item', label: 'Items', path: '/admin/items', icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
            </svg>
        )
    },
    {
        id: 'orders', label: 'Orders', path: '/admin/orders', icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" />
            </svg>
        )
    },
    {
        id: 'dispatch', label: 'Dispatch', path: '/admin/dispatch', icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="1" y="3" width="15" height="13" /><polygon points="16 8 20 8 23 11 23 16 16 16 16 8" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" />
            </svg>
        )
    },
    {
        id: 'customers', label: 'Customers', path: '/admin/customers', icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
        )
    },
    {
        id: 'calendar', label: 'Calendar', path: '/admin/calendar', icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
            </svg>
        )
    },
    {
        id: 'repairs', label: 'Repairs', path: '/admin/repairs', icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
            </svg>
        )
    },
    {
        id: 'latefees', label: 'Late Fees', path: '/admin/latefees', icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <text x="12" y="16" textAnchor="middle" fontSize="18" fontWeight="bold" fill="currentColor">₱</text>
            </svg>
        )
    },
    {
        id: 'history', label: 'History', path: '/admin/history', icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
            </svg>
        )
    },
    // ...existing code...
];

// Page titles for header — matches original
const PAGE_TITLES = {
    '/admin': 'Dashboard',
    '/admin/newitem': 'New Item',
    '/admin/items': 'Items',
    '/admin/orders': 'Orders',
    '/admin/dispatch': 'Dispatch',
    '/admin/customers': 'Customers',
    '/admin/calendar': 'Calendar',
    '/admin/repairs': 'Repairs',
    '/admin/latefees': 'Late Fees',
    '/admin/history': 'History',
    // ...existing code...
    '/admin/profile': 'Profile',
    '/admin/notifications': 'Notifications',
};

export default function AdminLayout({ children }) {
    const { user, logout } = useAdminAuth();
    const location = useLocation();
    const navigate = useNavigate();

    // Theme — default dark, persisted to localStorage
    const [theme, setTheme] = useState(() => localStorage.getItem('admin-theme') || 'dark');
    // Sidebar collapse — desktop
    const [sidebarCollapsed, setSidebarCollapsed] = useState(() => localStorage.getItem('admin-sidebar-collapsed') === 'true');
    // Sidebar open — mobile
    const [sidebarOpen, setSidebarOpen] = useState(false);
    // Dropdown states
    const [profileOpen, setProfileOpen] = useState(false);
    const [notifOpen, setNotifOpen] = useState(false);

    const profileRef = useRef(null);
    const notifRef = useRef(null);

    // Persist theme
    useEffect(() => {
        localStorage.setItem('admin-theme', theme);
    }, [theme]);

    // Persist sidebar state
    useEffect(() => {
        localStorage.setItem('admin-sidebar-collapsed', sidebarCollapsed);
    }, [sidebarCollapsed]);

    // Close dropdowns on outside click
    useEffect(() => {
        function handleClick(e) {
            if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
            if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
        }
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    // Close mobile sidebar on route change
    useEffect(() => {
        setSidebarOpen(false);
    }, [location.pathname]);

    const toggleTheme = useCallback(() => {
        setTheme(prev => prev === 'dark' ? 'light' : 'dark');
    }, []);

    const handleLogout = useCallback(async () => {
        await logout();
        navigate('/admin/login');
    }, [logout, navigate]);

    const pageTitle = PAGE_TITLES[location.pathname] || 'Admin';
    const userInitial = user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'A';
    const userName = user?.full_name || 'Admin';
    const userEmail = user?.email || 'admin@rentit.com';
    const userRole = user?.role || 'Administrator';

    return (
        <div className="admin-root" data-theme={theme}>
            <div className={`admin-wrapper ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>

                {/* Sidebar Overlay (Mobile) */}
                <div
                    className={`sidebar-overlay ${sidebarOpen ? 'active' : ''}`}
                    onClick={() => setSidebarOpen(false)}
                />

                {/* Sidebar */}
                <aside className={`admin-sidebar ${sidebarCollapsed ? 'collapsed' : ''} ${sidebarOpen ? 'open' : ''}`}>
                    {/* Logo — matches original: link wrapping logo + text */}
                    <div className="sidebar-logo">
                        <a href="/assets/images/rIT_logo_tp.png" target="_blank" rel="noopener noreferrer" className="sidebar-logo-link" title="View RentIT logo">
                            <img src="/assets/images/rIT_logo_tp.png" alt="RentIT Logo" className="sidebar-logo-icon" onError={(e) => { e.target.style.display = 'none'; }} />
                            <span className="sidebar-logo-text">RentIT</span>
                        </a>
                        {/* Collapse button */}
                        <button
                            className="sidebar-collapse-btn"
                            onClick={() => setSidebarCollapsed(prev => !prev)}
                            title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                            aria-label="Toggle sidebar"
                        >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="15 18 9 12 15 6" />
                            </svg>
                        </button>
                    </div>

                    {/* Navigation */}
                    <nav className="sidebar-nav">
                        {NAV_ITEMS.map(item => (
                            <NavLink
                                key={item.id}
                                to={item.path}
                                end={item.path === '/admin'}
                                className={({ isActive }) => {
                                    // Custom check to handle trailing slashes compat if needed, 
                                    // but NavLink is usually good. We add 'active' class explictly.
                                    return `sidebar-nav-item ${isActive ? 'active' : ''}`;
                                }}
                                title={item.label}
                                data-page={item.id}
                            >
                                <span className="sidebar-nav-icon">{item.icon}</span>
                                <span className="sidebar-nav-label">{item.label}</span>
                            </NavLink>
                        ))}
                    </nav>

                    {/* Sidebar Footer */}
                    <div className="sidebar-footer">
                        <div className="sidebar-user">
                            <div className="sidebar-user-avatar">{userInitial}</div>
                            <div className="sidebar-user-info">
                                <span className="sidebar-user-name">{userName}</span>
                                <span className="sidebar-user-role">Administrator</span>
                            </div>
                        </div>
                        {/* Mobile-only actions */}
                        <div className="mobile-only-actions">
                            <button className="mobile-action-item" id="sidebarThemeToggle" onClick={toggleTheme}>
                                {/* Sun icon for light mode */}
                                <svg className="theme-icon-light" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                                </svg>
                                {/* Moon icon for dark mode */}
                                <svg className="theme-icon-dark" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                                </svg>
                                <span className="theme-label">Dark Mode</span>
                            </button>
                            <button className="mobile-action-item danger" id="sidebarLogoutBtn" onClick={handleLogout}>
                                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
                                </svg>
                                <span>Sign Out</span>
                            </button>
                        </div>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="admin-main">
                    {/* Header — matches original admin-components.js injectHeader */}
                    <header className="admin-header">
                        <div className="header-left">
                            {/* Mobile menu button */}
                            <button
                                className="header-btn mobile-menu-btn"
                                id="mobileMenuBtn"
                                onClick={() => setSidebarOpen(true)}
                                title="Toggle menu"
                            >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" />
                                </svg>
                            </button>
                            <h2 className="header-page-title">{pageTitle}</h2>
                        </div>
                        <div className="header-right">
                            {/* Theme toggle as the first element in header-right */}
                            <button
                                className="auth-theme-toggle"
                                onClick={toggleTheme}
                                aria-label="Toggle theme"
                                style={{ marginRight: '5rem', marginTop: '-0.49rem' }}
                            >
                                <svg className="moon-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="5" />
                                    <line x1="12" y1="1" x2="12" y2="3" />
                                    <line x1="12" y1="21" x2="12" y2="23" />
                                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                                    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                                    <line x1="1" y1="12" x2="3" y2="12" />
                                    <line x1="21" y1="12" x2="23" y2="12" />
                                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                                    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                                </svg>
                                <svg className="sun-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                                </svg>
                            </button>
                            {/* Profile — matches original admin-components.js */}
                            <div className={`dropdown ${profileOpen ? 'open' : ''}`} id="profileDropdown" ref={profileRef}>
                                <button className="header-btn profile-btn" id="profileBtn" onClick={() => { setProfileOpen(p => !p); setNotifOpen(false); }} title="Profile menu">
                                    <div className="profile-avatar">{userInitial}</div>
                                </button>
                                <div className="dropdown-menu profile-dropdown-menu" id="profileMenu">
                                    <div className="profile-dropdown-header">
                                        <div className="profile-avatar-lg">{userInitial}</div>
                                        <div className="profile-dropdown-info">
                                            <span className="profile-dropdown-name">{userName}</span>
                                            <span className="profile-dropdown-email">{userEmail}</span>
                                        </div>
                                    </div>
                                    <div className="dropdown-divider" />
                                    <button className="dropdown-item" onClick={() => { setProfileOpen(false); navigate('/admin'); }}>
                                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                                            <rect x="3" y="3" width="7" height="9" /><rect x="14" y="3" width="7" height="5" /><rect x="14" y="12" width="7" height="9" /><rect x="3" y="16" width="7" height="5" />
                                        </svg>
                                        Dashboard
                                    </button>
                                    <button className="dropdown-item" onClick={() => { setProfileOpen(false); navigate('/admin/settings'); }}>
                                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                                            <circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                                        </svg>
                                        Settings
                                    </button>
                                    <div className="dropdown-divider" />
                                    <button className="dropdown-item danger" onClick={handleLogout}>
                                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
                                        </svg>
                                        Logout
                                    </button>
                                </div>
                            </div>
                        </div>
                    </header>

                    {/* Content Area — Renders children if provided, else Outlet for nested routes */}
                    <div className="admin-content">
                        {children ?? <Outlet />}
                    </div>

                    {/* Footer — matches original admin-components.js injectFooter */}
                    <footer className="admin-footer">
                        &copy; {new Date().getFullYear()} CertiCode Videoke Rentals • v2.5.0
                    </footer>
                </main>
            </div>
        </div>
    );
}
