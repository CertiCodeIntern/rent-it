import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const BASE_URL = '/rent-it';
const THEME_KEY = 'rentit-theme';

function getTheme() {
  return document.documentElement.getAttribute('data-theme') || 'light';
}

function setTheme(theme) {
  const value = theme === 'dark' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', value);
  localStorage.setItem(THEME_KEY, value);
}

function MainLayout({ children }) {
  const location = useLocation();

  const handleThemeToggle = () => {
    const next = getTheme() === 'dark' ? 'light' : 'dark';
    setTheme(next);
  };

  const isAbout = location.pathname === '/about';
  const isContact = location.pathname === '/contact';
  const isAuthPage = location.pathname === '/login';
  const { hash } = location;

  const isHomePage = !isAbout && !isContact;
  const isRentals = isHomePage && hash === '#machines';
  const isPricing = isHomePage && hash === '#pricing';

  return (
    <>
      {!isAuthPage && (
        <header className="site-header">
          <div className="container header-inner">
            <button
              className="hamburger"
              id="hamburgerBtn"
              aria-label="Open menu"
              aria-expanded="false"
            >
              ☰
            </button>

            <a href="/" className="brand">
              <div className="logo-drawer">
                <img src={`${BASE_URL}/assets/images/rIT_logo_tp.png`} alt="RentIt Logo" />
              </div>
              <span className="brand-name">
                Rent<span className="accent">It</span>
              </span>
            </a>

            <nav className="main-nav">
              <Link
                to="/"
                onClick={() => {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className={`nav-link ${
                  isHomePage && !isRentals && !isPricing ? 'active' : ''
                }`.trim()}
              >
                Home
              </Link>
              <Link
                to="/#machines"
                className={`nav-link ${isRentals ? 'active' : ''}`.trim()}
              >
                Rentals
              </Link>
              <Link
                to="/#pricing"
                className={`nav-link ${isPricing ? 'active' : ''}`.trim()}
              >
                Pricing
              </Link>
              <Link
                to="/about"
                className={`nav-link ${isAbout ? 'active' : ''}`.trim()}
              >
                About
              </Link>
              <Link
                to="/contact"
                className={`nav-link ${isContact ? 'active' : ''}`.trim()}
              >
                Contact
              </Link>
            </nav>

            <div className="header-actions">
              <button
                type="button"
                className="theme-toggle"
                id="themeToggle"
                aria-label="Toggle theme"
                onClick={handleThemeToggle}
              >
                <svg
                  className="sun-icon"
                  width="20"
                  height="20"
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
                  className="moon-icon"
                  width="20"
                  height="20"
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
              <Link to="/login" className="btn btn-outline">
                Login
              </Link>
              <a href={`${BASE_URL}/client/auth/login.php#register`} className="btn btn-primary">
                Register
              </a>
            </div>
          </div>

          <nav className="mobile-nav" id="mobileNav">
            <Link
              to="/"
              className="mobile-link"
              onClick={() => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            >
              {'\u2190'} Home
            </Link>
            <Link to="/#machines" className="mobile-link">
              Rentals
            </Link>
            <Link to="/#pricing" className="mobile-link">
              Pricing
            </Link>
            <Link to="/about" className="mobile-link">
              About
            </Link>
            <Link to="/contact" className="mobile-link">
              Contact
            </Link>
            <div className="mobile-actions">
              <a
                href={`${BASE_URL}/client/auth/login.php#login`}
                className="btn btn-primary"
                style={{ width: '100%' }}
              >
                Login
              </a>
            </div>
          </nav>
        </header>
      )}

      <main>{children}</main>

      {!isAuthPage && (
        <footer className="site-footer">
          <div className="container">
            <div className="footer-inner">
              <div className="footer-brand">
                <div className="logo-drawer">
                  <img src={`${BASE_URL}/assets/images/rIT_logo_tp.png`} alt="RentIt Logo" />
                </div>
                <div className="brand-text">
                  <h4 className="brand-title">RentIt</h4>
                  <p className="brand-sub">
                    Making celebrations louder and more memorable with premium videoke rentals since
                    2018.
                  </p>
                  <p className="powered-by">
                    Powered by{' '}
                    <a href="https://certicode.com" target="_blank" rel="noreferrer">
                      CertiCode
                    </a>
                  </p>
                  <div className="social-links">
                    <a
                      href="https://www.facebook.com/CertiCode"
                      className="social"
                      aria-label="Facebook"
                      target="_blank"
                      rel="noreferrer"
                    >
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                      </svg>
                    </a>
                    <a
                      href="https://www.certicode.tech/"
                      className="social"
                      aria-label="CertiCode"
                      target="_blank"
                      rel="noreferrer"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="9" />
                        <line x1="3" y1="12" x2="21" y2="12" />
                        <path d="M12 3a12 12 0 0 0 0 18" />
                        <path d="M12 3a12 12 0 0 1 0 18" />
                      </svg>
                    </a>
                    <a
                      href={`${BASE_URL}/pages/contactus.html`}
                      className="social"
                      aria-label="Contact"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                        <polyline points="22,6 12,13 2,6" />
                      </svg>
                    </a>
                  </div>
                </div>
              </div>

              <div className="footer-col">
                <h5>Company</h5>
                <nav className="footer-nav">
                  <Link to="/about" className="footer-link">
                    About Us
                  </Link>
                  <Link to="/contact" className="footer-link">
                    Contact
                  </Link>
                  <Link to="/terms" className="footer-link">
                    Terms of Service
                  </Link>
                </nav>
              </div>

              <div className="footer-col">
                <h5>Support</h5>
                <nav className="footer-nav">
                  <Link to="/wip" className="footer-link">
                    How It Works
                  </Link>
                  <a href="#pricing" className="footer-link">
                    Pricing Packages
                  </a>
                  <Link to="/wip" className="footer-link">
                    Safety Guidelines
                  </Link>
                  <Link to="/wip" className="footer-link">
                    Delivery Areas
                  </Link>
                </nav>
              </div>

              <div className="footer-col">
                <h5>Admin</h5>
                <nav className="footer-nav">
                  <a href={`${BASE_URL}/admin/auth/login.php`} className="footer-link">
                    Admin Login
                  </a>
                </nav>
              </div>
            </div>

            <div className="footer-divider"></div>

            <div className="footer-bottom">
              <p className="copyright">
                © 2026 RentIt Videoke Rentals • v2.4.0
              </p>
              <div className="policy-links">
                <a href={`${BASE_URL}/pages/privacy-policy.html`} className="policy-link">
                  Privacy Policy
                </a>
                <a href={`${BASE_URL}/pages/cookie-policy.html`} className="policy-link">
                  Cookie Policy
                </a>
              </div>
            </div>
          </div>
        </footer>
      )}
    </>
  );
}

export default MainLayout;
