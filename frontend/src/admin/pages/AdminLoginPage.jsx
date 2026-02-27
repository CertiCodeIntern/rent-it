import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';
import '../styles/pages/admin-login.css';

export default function AdminLoginPage() {
    const navigate = useNavigate();
    const { login, isAuthenticated, isLoading } = useAdminAuth();

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [theme, setTheme] = useState(() =>
        localStorage.getItem('admin-theme') || 'dark'
    );

    // If already authenticated, redirect to admin dashboard
    useEffect(() => {
        if (!isLoading && isAuthenticated) {
            navigate('/admin', { replace: true });
        }
    }, [isAuthenticated, isLoading, navigate]);

    // Theme toggle
    const toggleTheme = () => {
        const next = theme === 'dark' ? 'light' : 'dark';
        setTheme(next);
        localStorage.setItem('admin-theme', next);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!username.trim() || !password.trim()) {
            setError('Please enter both username and password');
            return;
        }

        setError('');
        setSubmitting(true);

        try {
            const result = await login(username, password);
            if (result.success) {
                navigate('/admin', { replace: true });
            } else {
                setError(result.message || 'Invalid username or password');
            }
        } catch {
            setError('Network error. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="admin-root" data-theme={theme}>
                <div className="admin-loading-screen">
                    <div className="admin-loader"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-root" data-theme={theme}>
            {/* Theme Toggle (matches original auth-theme-toggle) */}
            <button
                className="auth-theme-toggle"
                onClick={toggleTheme}
                aria-label="Toggle theme"
            >
                <svg className="sun-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
                <svg className="moon-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
            </button>

            <div className="admin-login-container">
                {/* Left Panel - Branding */}
                <div className="admin-branding">
                    <div className="branding-content">
                        <div className="admin-logo">
                            <span className="logo-icon">🎤</span>
                            <span className="logo-text">RentIt</span>
                        </div>
                        <h1 className="branding-title">Admin Portal</h1>
                        <p className="branding-subtitle">
                            Manage your videoke rental business with powerful tools and insights.
                        </p>

                        <div className="branding-features">
                            <div className="feature">
                                <span className="feature-icon">📊</span>
                                <span>Real-time Analytics</span>
                            </div>
                            <div className="feature">
                                <span className="feature-icon">🎯</span>
                                <span>Booking Management</span>
                            </div>
                            <div className="feature">
                                <span className="feature-icon">🚚</span>
                                <span>Delivery Tracking</span>
                            </div>
                            <div className="feature">
                                <span className="feature-icon">🎤</span>
                                <span>Inventory Control</span>
                            </div>
                        </div>
                    </div>
                    <div className="branding-footer">
                        <p>&copy; 2026 CertiCode Videoke Rentals</p>
                    </div>
                </div>

                {/* Right Panel - Login Form */}
                <div className="admin-form-panel">
                    <div className="form-wrapper">
                        <div className="form-header">
                            <div className="admin-badge">
                                <svg className="badge-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
                                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                </svg>
                                <span className="badge-text">ADMIN ACCESS</span>
                            </div>
                            <h2 className="form-title">Welcome Back</h2>
                            <p className="form-subtitle">Enter your credentials to access the admin dashboard</p>
                        </div>

                        {/* Login Form */}
                        <form className="login-form" onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label htmlFor="username">Username</label>
                                <div className="input-wrapper">
                                    <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                        <circle cx="12" cy="7" r="4" />
                                    </svg>
                                    <input
                                        type="text"
                                        id="username"
                                        name="username"
                                        placeholder="Enter your username"
                                        autoComplete="username"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label htmlFor="password">Password</label>
                                <div className="input-wrapper">
                                    <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                    </svg>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        id="password"
                                        name="password"
                                        placeholder="Enter your password"
                                        autoComplete="current-password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                    <button
                                        type="button"
                                        className="toggle-password"
                                        onClick={() => setShowPassword(!showPassword)}
                                        aria-label="Toggle password visibility"
                                    >
                                        {showPassword ? (
                                            <svg className="eye-icon eye-closed" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                                                <line x1="1" y1="1" x2="23" y2="23" />
                                            </svg>
                                        ) : (
                                            <svg className="eye-icon eye-open" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                                <circle cx="12" cy="12" r="3" />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                            </div>

                            <div className="form-options">
                                <label className="remember-me">
                                    <input type="checkbox" id="rememberMe" name="rememberMe" />
                                    <span>Remember me</span>
                                </label>
                                <Link to="/wip" className="forgot-link">Forgot password?</Link>
                            </div>

                            {/* Error Message */}
                            {error && (
                                <div className="error-message" role="alert">
                                    ⚠️ {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                className="btn-login"
                                disabled={submitting}
                            >
                                {submitting ? (
                                    <span className="btn-loader"></span>
                                ) : (
                                    <span className="btn-text">Sign In</span>
                                )}
                            </button>
                        </form>

                        <div className="form-footer">
                            <p>Not an admin? <Link to="/">Return to main site</Link></p>
                        </div>

                        {/* Demo Credentials */}
                        <div className="demo-credentials">
                            <p className="demo-title">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
                                    <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
                                </svg>
                                Demo Credentials
                            </p>
                            <div className="credentials-box">
                                <p><strong>Username:</strong> admin1</p>
                                <p><strong>Password:</strong> admin1</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
