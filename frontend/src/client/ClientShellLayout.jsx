import React, { createContext, useEffect, useRef, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import './css/ClientShellLayout.css';

export const SidebarContext = createContext({ sidebarCollapsed: false });

const defaultUser = {
  full_name: '',
  email: '',
  membership_level: '',
  profile_picture: null,
};
export const UserContext = createContext({ user: defaultUser, setUser: () => {} });

const TOPBAR_TITLES = {
  '/client/dashboard': 'Dashboard',
  '/client/catalog': 'Catalog',
  '/client/favorites': 'My Favorites',
  '/client/cart': 'My Cart',
  '/client/myrentals': 'My Rentals',
  '/client/pending': 'Pending Orders',
  '/client/bookinghistory': 'My Booking History',
  '/client/returns': 'Returns & Extensions',
  '/client/profile': 'My Profile',
};


const API_BASE = import.meta.env.DEV ? '/api/rent-it' : '/rent-it';

const PUBLIC_BASE = '/rent-it';

/* Sidebar line-art icons (inactive: white/light gray; active: white on orange) */
const NavIcons = {
  dashboard: (
    <svg className="nav-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  ),
  catalog: (
    <svg className="nav-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  ),
  favorites: (
    <svg className="nav-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  ),
  cart: (
    <svg className="nav-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
  ),
  rentals: (
    <svg className="nav-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <line x1="12" y1="19" x2="12" y2="22" />
      <line x1="8" y1="22" x2="16" y2="22" />
    </svg>
  ),
  booking: (
    <svg className="nav-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  ),
};

function getInitialUser() {
  try {
    const raw = localStorage.getItem('user');
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        full_name: parsed.full_name || '',
        email: parsed.email || '',
        membership_level: parsed.membership_level || '',
        profile_picture: parsed.profile_picture || null,
      };
    }
  } catch (_) {
    // ignore
  }
  return { full_name: '', email: '', membership_level: '', profile_picture: null };
}

const THEME_KEY = 'rentit-theme';

function getTheme() {
  return document.documentElement.getAttribute('data-theme') || 'light';
}

function setTheme(theme) {
  const value = theme === 'dark' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', value);
  localStorage.setItem(THEME_KEY, value);
}

function ClientShellLayout({ children, showFooter = true }) {
  const location = useLocation();
  const [user, setUser] = useState(getInitialUser);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const avatarSrc = user.profile_picture
    ? `${PUBLIC_BASE}/assets/profile/${user.profile_picture}`
    : null;
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const profileRef = useRef(null);

  const topbarTitle = TOPBAR_TITLES[location.pathname] ?? 'Dashboard';

  useEffect(() => {
    fetch(`${API_BASE}/client/dashboard/dashboard.php?format=json`, {
      credentials: 'include',
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!data || !data.user) return;
        setUser(data.user);
        try {
          const existing = JSON.parse(localStorage.getItem('user') || '{}');
          localStorage.setItem('user', JSON.stringify({ ...existing, ...data.user }));
        } catch (_) {
          // ignore
        }
      })
      .catch(() => {
        // fail silently; layout will fall back to defaults
      });
  }, []);

  useEffect(() => {
    if (!showProfileMenu) return;

    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showProfileMenu]);

  const fullName = user.full_name || 'User';
  const roleLabel = 'customer';
  const initial = (fullName || 'U').trim().charAt(0).toUpperCase() || 'U';

  const handleLogout = () => {
    // Open custom confirmation modal instead of native confirm
    setShowLogoutModal(true);
  };

  const performLogout = () => {
    setShowLogoutModal(false);
    setShowProfileMenu(false);
    const authKeys = ['token', 'user', 'user_role', 'user_name'];
    authKeys.forEach((key) => localStorage.removeItem(key));
    sessionStorage.clear();

    fetch(`${API_BASE}/api/auth/logout.php`, {
      method: 'POST',
      credentials: 'include',
    }).finally(() => {
      window.location.href = '/login';
    });
  };

  return (
    <UserContext.Provider value={{ user, setUser }}>
    <SidebarContext.Provider value={{ sidebarCollapsed }}>
    <div className={`app-container${sidebarCollapsed ? ' sidebar-collapsed' : ''}`}>
      <aside className={`sidebar${sidebarCollapsed ? ' collapsed' : ''}`} id="sidebar">
        <div className="sidebar-header">
          <a
            className="sidebar-logo"
            href={`${PUBLIC_BASE}/assets/images/rIT_logo_tp.png`}
            target="_blank"
            rel="noopener noreferrer"
            title="View RentIT logo"
          >
            <img
              src={`${PUBLIC_BASE}/assets/images/rIT_logo_tp.png`}
              alt="RentIT Logo"
              className="sidebar-logo-icon"
            />
            <span className="sidebar-logo-text">RentIT</span>
          </a>
          <button
            type="button"
            className="sidebar-collapse-btn"
            id="sidebarCollapseBtn"
            aria-label="Toggle sidebar"
            title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            onClick={() => setSidebarCollapsed((prev) => !prev)}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
        </div>

        <nav className="sidebar-nav">
          <NavLink
            to="/client/dashboard"
            className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
            data-tooltip="Dashboard"
          >
            <span className="nav-icon">{NavIcons.dashboard}</span>
            <span className="nav-label">Dashboard</span>
          </NavLink>
          <NavLink
            to="/client/catalog"
            className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
            data-tooltip="Browse Catalog"
          >
            <span className="nav-icon">{NavIcons.catalog}</span>
            <span className="nav-label">Browse Catalog</span>
          </NavLink>
          <NavLink
            to="/client/favorites"
            className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
            data-tooltip="Favorites"
          >
            <span className="nav-icon">{NavIcons.favorites}</span>
            <span className="nav-label">Favorites</span>
          </NavLink>
          <NavLink
            to="/client/cart"
            className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
            data-tooltip="My Cart"
          >
            <span className="nav-icon">{NavIcons.cart}</span>
            <span className="nav-label">My Cart</span>
          </NavLink>
          <NavLink
            to="/client/myrentals"
            className={`nav-item${location.pathname === '/client/myrentals' || location.pathname === '/client/pending' ? ' active' : ''}`}
            data-tooltip="My Rentals"
          >
            <span className="nav-icon">{NavIcons.rentals}</span>
            <span className="nav-label">My Rentals</span>
          </NavLink>
          <NavLink
            to="/client/bookinghistory"
            className={`nav-item${location.pathname === '/client/bookinghistory' || location.pathname === '/client/returns' ? ' active' : ''}`}
            data-tooltip="Booking History"
          >
            <span className="nav-icon">{NavIcons.booking}</span>
            <span className="nav-label">Booking History</span>
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-user-avatar">
              {avatarSrc ? (
                <img src={avatarSrc} alt="" className="sidebar-user-avatar-img" />
              ) : (
                initial
              )}
            </div>
            <div className="sidebar-user-info">
              <span className="sidebar-user-name">{fullName}</span>
              <span className="sidebar-user-role">{roleLabel}</span>
            </div>
          </div>

          <button
            type="button"
            className="sidebar-logout-btn"
            onClick={handleLogout}
          >
            <span className="logout-icon">↩</span>
            <span className="logout-text">Logout</span>
          </button>
        </div>
      </aside>

      <div className="sidebar-overlay" id="sidebarOverlay" />

      <main className="main-content">
        <header className="topbar">
          <button className="menu-btn" id="menuBtn" title="Toggle sidebar menu">
            ☰
          </button>
          <h1 className="topbar-title" id="pageTitle">
            {topbarTitle}
          </h1>
          <div className="topbar-actions">
            <button
              type="button"
              className="btn-icon client-theme-toggle"
              id="themeToggle"
              aria-label="Toggle theme"
              title="Toggle light/dark theme"
              onClick={() => {
                const next = getTheme() === 'dark' ? 'light' : 'dark';
                setTheme(next);
              }}
            >
              <svg
                className="theme-icon-light"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
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
              <svg
                className="theme-icon-dark"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            </button>
            <div className="client-topbar-user client-profile-wrapper" ref={profileRef}>
              <button
                className="btn-icon client-profile-btn"
                id="profileBtn"
                aria-label="User menu"
                title="Profile & settings"
                type="button"
                onClick={() => setShowProfileMenu((open) => !open)}
              >
                <div className="client-topbar-user-avatar">
                  {avatarSrc ? (
                    <img src={avatarSrc} alt="" className="client-topbar-user-avatar-img" />
                  ) : (
                    initial
                  )}
                </div>
              </button>
              {showProfileMenu && (
                <div className="profile-dropdown open">
                  <div className="profile-header">
                    <div className="profile-info">
                      <div className="name">{fullName}</div>
                      {user.email && <div className="email">{user.email}</div>}
                    </div>
                  </div>
                  <nav className="profile-menu">
                    <NavLink to="/client/dashboard" className="profile-menu-item">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="3" width="7" height="9" />
                        <rect x="14" y="3" width="7" height="5" />
                        <rect x="14" y="12" width="7" height="9" />
                        <rect x="3" y="16" width="7" height="5" />
                      </svg>
                      Dashboard
                    </NavLink>
                    <NavLink
                      to="/client/profile"
                      className="profile-menu-item"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                      My Profile
                    </NavLink>
                    <div className="profile-divider" />
                    <button
                      type="button"
                      className="profile-menu-item danger"
                      onClick={() => {
                        setShowProfileMenu(false);
                        handleLogout();
                      }}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                        <polyline points="16 17 21 12 16 7" />
                        <line x1="21" y1="12" x2="9" y2="12" />
                      </svg>
                      Sign Out
                    </button>
                  </nav>
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="content-area">{children}</div>

        {showFooter && (
        <footer className="client-app-footer">
          <div className="client-footer-content">
            <div className="client-footer-main">
              <div className="client-footer-brand">
                <img
                  src={`${PUBLIC_BASE}/assets/images/rIT_logo_tp.png`}
                  alt="RentIT Logo"
                  className="client-footer-logo"
                />
                <div>
                  <div className="client-footer-brand-name">RentIT</div>
                  <div className="client-footer-brand-tagline">
                    Premium karaoke equipment rentals for your perfect event.
                  </div>
                </div>
              </div>
              <div className="client-footer-columns">
                <div className="client-footer-column">
                  <h4 className="client-footer-heading">Quick Links</h4>
                  <ul>
                    <li>
                      <NavLink to="/client/catalog">Browse Catalog</NavLink>
                    </li>
                    <li>
                      <NavLink to="/client/myrentals">My Rentals</NavLink>
                    </li>
                    <li>
                      <NavLink to="/client/pending">Pending Orders</NavLink>
                    </li>
                    <li>
                      <NavLink to="/client/bookinghistory">Booking History</NavLink>
                    </li>
                    <li>
                      <NavLink to="/client/returns">Returns &amp; Extensions</NavLink>
                    </li>
                  </ul>
                </div>
                <div className="client-footer-column">
                  <h4 className="client-footer-heading">Support</h4>
                  <ul>
                    <li>
                      <a href="/pages/about.html">About</a>
                    </li>
                    <li>
                      <a href="#">FAQs</a>
                    </li>
                  </ul>
                </div>
                <div className="client-footer-column">
                  <h4 className="client-footer-heading">Legal</h4>
                  <ul>
                    <li>
                      <a href="/pages/terms.html">Terms of Service</a>
                    </li>
                    <li>
                      <a href="/pages/privacy.html">Privacy Policy</a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="client-footer-bottom">
            <p className="client-footer-copy">
              &copy; {new Date().getFullYear()} RentIT. All rights reserved.
            </p>
            <div className="client-footer-social">
              <a href="#" aria-label="Facebook" className="client-footer-social-link">
                <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                </svg>
              </a>
              <a href="#" aria-label="Website" className="client-footer-social-link">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="2" y1="12" x2="22" y2="12" />
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                </svg>
              </a>
              <a href="#" aria-label="Email" className="client-footer-social-link">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                  <rect x="3" y="5" width="18" height="14" rx="2" />
                  <polyline points="3,7 12,13 21,7" />
                </svg>
              </a>
            </div>
          </div>
        </footer>
        )}
      </main>

      {showLogoutModal && (
        <div className="logout-modal-backdrop" role="presentation">
          <div className="logout-modal" role="dialog" aria-modal="true" aria-labelledby="logout-modal-title">
            <div className="logout-modal-icon-wrapper">
              <span className="logout-modal-icon">
                <svg
                  viewBox="0 0 24 24"
                  width="20"
                  height="20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M10 17l5-5-5-5" />
                  <path d="M15 12H4" />
                  <path d="M19 5v14" />
                </svg>
              </span>
            </div>
            <h2 id="logout-modal-title" className="logout-modal-title">Sign Out</h2>
            <p className="logout-modal-text">
              Are you sure you want to sign out of your account?
            </p>
            <div className="logout-modal-actions">
              <button
                type="button"
                className="logout-modal-btn logout-modal-btn-secondary"
                onClick={() => setShowLogoutModal(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="logout-modal-btn logout-modal-btn-primary"
                onClick={performLogout}
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </SidebarContext.Provider>
    </UserContext.Provider>
  );
}

export default ClientShellLayout;
