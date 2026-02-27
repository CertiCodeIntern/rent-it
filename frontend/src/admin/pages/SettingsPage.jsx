import React, { useState, useEffect } from 'react';
import '../styles/pages/settings.css';

export default function SettingsPage() {
    const [theme, setTheme] = useState('dark');
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [showPasswords, setShowPasswords] = useState({
        currentPassword: false,
        newPassword: false,
        confirmPassword: false
    });
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [notification, setNotification] = useState(null);

    // Initialize theme from localStorage or system preference
    useEffect(() => {
        const savedTheme = localStorage.getItem('admin-theme') || 
                          (document.documentElement.getAttribute('data-theme')) || 
                          'dark';
        setTheme(savedTheme);
    }, []);

    // Show notification toast
    const showNotification = (message, type = 'info') => {
        setNotification({ message, type, id: Date.now() });
        setTimeout(() => setNotification(null), 4000);
    };

    // Handle theme toggle
    const handleThemeToggle = () => {
        const newTheme = theme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('admin-theme', newTheme);
        showNotification(`Switched to ${newTheme} mode`, 'info');
    };

    // Handle password field changes
    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordForm(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Toggle password visibility
    const togglePasswordVisibility = (field) => {
        setShowPasswords(prev => ({
            ...prev,
            [field]: !prev[field]
        }));
    };

    // Validate new password
    const validatePassword = (password) => {
        if (!password) return 'Password is required';
        if (password.length < 8) return 'Password must be at least 8 characters';
        if (!/[a-zA-Z]/.test(password)) return 'Password must contain letters';
        if (!/[0-9]/.test(password)) return 'Password must contain numbers';
        return null;
    };

    // Handle password form submission
    const handlePasswordSubmit = async (e) => {
        e.preventDefault();

        const { currentPassword, newPassword, confirmPassword } = passwordForm;

        // Validation
        if (!currentPassword || !newPassword || !confirmPassword) {
            showNotification('Please fill in all fields', 'error');
            return;
        }

        const passwordError = validatePassword(newPassword);
        if (passwordError) {
            showNotification(passwordError, 'error');
            return;
        }

        if (newPassword !== confirmPassword) {
            showNotification('New passwords do not match', 'error');
            return;
        }

        if (currentPassword === newPassword) {
            showNotification('New password must be different from current', 'error');
            return;
        }

        setPasswordLoading(true);

        try {
            const response = await fetch('/admin/api/update_admin_password.php', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    currentPassword,
                    newPassword,
                    confirmPassword
                })
            });

            const result = await response.json();

            if (result.success) {
                setPasswordForm({
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: ''
                });
                showNotification('Password updated successfully!', 'success');
            } else {
                showNotification(result.message || 'Failed to update password', 'error');
            }
        } catch (err) {
            console.error('Password update error:', err);
            showNotification('Failed to update password. Please try again.', 'error');
        } finally {
            setPasswordLoading(false);
        }
    };

    return (
        <>
            {/* Notification Toast */}
            {notification && (
                <div className={`settings-notification notification-${notification.type}`}>
                    <span className="notification-message">{notification.message}</span>
                    <button
                        className="notification-close"
                        onClick={() => setNotification(null)}
                        title="Close notification"
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>
            )}

            {/* Page Header */}
            <div className="admin-page-header">
                <div>
                    <h1 className="admin-page-title">Settings</h1>
                    <p className="admin-page-subtitle">Manage your account and preferences</p>
                </div>
            </div>

            {/* Settings Grid */}
            <div className="settings-grid">
                {/* Appearance Card */}
                <section className="settings-card">
                    <div className="settings-card-header">
                        <h2 className="settings-card-title">Appearance</h2>
                        <p className="settings-card-subtitle">Customize the look and feel</p>
                    </div>
                    <div className="settings-card-body">
                        <div className="setting-item">
                            <div className="setting-info">
                                <div className="setting-icon">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
                                </div>
                                <div className="setting-text">
                                    <h3 className="setting-label">Dark Mode</h3>
                                    <p className="setting-description">Switch between light and dark theme</p>
                                </div>
                            </div>
                            <label className="toggle-switch-wrapper" title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}>
                                <input
                                    type="checkbox"
                                    className="toggle-input"
                                    checked={theme === 'dark'}
                                    onChange={handleThemeToggle}
                                />
                                <span className="toggle-slider"></span>
                            </label>
                        </div>
                    </div>
                </section>

                {/* Change Password Card */}
                <section className="settings-card password-card">
                    <div className="settings-card-header">
                        <h2 className="settings-card-title">Change Password</h2>
                        <p className="settings-card-subtitle">Update your account password securely</p>
                    </div>
                    <div className="settings-card-body">
                        <form className="password-form" onSubmit={handlePasswordSubmit}>
                            {/* Current Password */}
                            <div className="form-group">
                                <label htmlFor="currentPassword" className="form-label">Current Password</label>
                                <div className="password-input-wrapper">
                                    <input
                                        type={showPasswords.currentPassword ? 'text' : 'password'}
                                        id="currentPassword"
                                        name="currentPassword"
                                        className="form-input"
                                        placeholder="Enter current password"
                                        value={passwordForm.currentPassword}
                                        onChange={handlePasswordChange}
                                        disabled={passwordLoading}
                                    />
                                    <button
                                        type="button"
                                        className="password-toggle"
                                        onClick={() => togglePasswordVisibility('currentPassword')}
                                        title={showPasswords.currentPassword ? 'Hide password' : 'Show password'}
                                    >
                                        <svg
                                            className="eye-open"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            style={{ display: showPasswords.currentPassword ? 'none' : 'block' }}
                                        >
                                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                            <circle cx="12" cy="12" r="3" />
                                        </svg>
                                        <svg
                                            className="eye-closed"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            style={{ display: showPasswords.currentPassword ? 'block' : 'none' }}
                                        >
                                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                                            <line x1="1" y1="1" x2="23" y2="23" />
                                        </svg>
                                    </button>
                                </div>
                            </div>

                            {/* New Password */}
                            <div className="form-group">
                                <label htmlFor="newPassword" className="form-label">New Password</label>
                                <div className="password-input-wrapper">
                                    <input
                                        type={showPasswords.newPassword ? 'text' : 'password'}
                                        id="newPassword"
                                        name="newPassword"
                                        className="form-input"
                                        placeholder="Enter new password"
                                        value={passwordForm.newPassword}
                                        onChange={handlePasswordChange}
                                        disabled={passwordLoading}
                                    />
                                    <button
                                        type="button"
                                        className="password-toggle"
                                        onClick={() => togglePasswordVisibility('newPassword')}
                                        title={showPasswords.newPassword ? 'Hide password' : 'Show password'}
                                    >
                                        <svg
                                            className="eye-open"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            style={{ display: showPasswords.newPassword ? 'none' : 'block' }}
                                        >
                                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                            <circle cx="12" cy="12" r="3" />
                                        </svg>
                                        <svg
                                            className="eye-closed"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            style={{ display: showPasswords.newPassword ? 'block' : 'none' }}
                                        >
                                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                                            <line x1="1" y1="1" x2="23" y2="23" />
                                        </svg>
                                    </button>
                                </div>
                                <span className="form-hint">Min 8 characters, letters & numbers</span>
                            </div>

                            {/* Confirm Password */}
                            <div className="form-group">
                                <label htmlFor="confirmPassword" className="form-label">Confirm New Password</label>
                                <div className="password-input-wrapper">
                                    <input
                                        type={showPasswords.confirmPassword ? 'text' : 'password'}
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        className="form-input"
                                        placeholder="Confirm new password"
                                        value={passwordForm.confirmPassword}
                                        onChange={handlePasswordChange}
                                        disabled={passwordLoading}
                                    />
                                    <button
                                        type="button"
                                        className="password-toggle"
                                        onClick={() => togglePasswordVisibility('confirmPassword')}
                                        title={showPasswords.confirmPassword ? 'Hide password' : 'Show password'}
                                    >
                                        <svg
                                            className="eye-open"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            style={{ display: showPasswords.confirmPassword ? 'none' : 'block' }}
                                        >
                                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                            <circle cx="12" cy="12" r="3" />
                                        </svg>
                                        <svg
                                            className="eye-closed"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            style={{ display: showPasswords.confirmPassword ? 'block' : 'none' }}
                                        >
                                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                                            <line x1="1" y1="1" x2="23" y2="23" />
                                        </svg>
                                    </button>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                className="btn btn-primary btn-full"
                                disabled={passwordLoading}
                                title={passwordLoading ? 'Updating password...' : 'Update password'}
                            >
                                {passwordLoading ? 'Updating...' : 'Update Password'}
                            </button>
                        </form>
                    </div>
                </section>
            </div>
        </>
    );
}
