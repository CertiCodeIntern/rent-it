/**
 * Admin Authentication Module
 * Uses PHP session-based auth with database verification
 * Same approach as client-side - credentials verified server-side
 * 
 * @fileoverview Admin login functionality using server-side PHP sessions
 */

// =====================================================
// AUTHENTICATION SERVICE (PHP Session-based)
// =====================================================
const AdminAuth = {
    API_BASE: '/rent-it/admin/api/',

    /**
     * Authenticate admin with credentials via PHP API
     * @param {string} username 
     * @param {string} password 
     * @returns {Promise<{success: boolean, message: string, admin?: object}>}
     */
    async login(username, password) {
        if (!username || !password) {
            return {
                success: false,
                message: 'Please enter both username and password'
            };
        }

        try {
            const response = await fetch(this.API_BASE + 'admin_login.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'same-origin',
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('[AUTH] Login error:', error);
            return {
                success: false,
                message: 'Network error. Please try again.'
            };
        }
    },

    /**
     * Logout current admin (destroys PHP session)
     */
    logout() {
        // Clear any localStorage data
        AdminSession.destroy();
        // Call server-side logout
        window.location.href = '/rent-it/admin/api/admin_logout.php';
    },

    /**
     * Check if admin session is valid via PHP API
     * @returns {Promise<{authenticated: boolean, admin?: object}>}
     */
    async checkSession() {
        try {
            const response = await fetch(this.API_BASE + 'check_admin_session.php', {
                credentials: 'same-origin'
            });
            const data = await response.json();
            return data;
        } catch (error) {
            return { authenticated: false };
        }
    }
};

// =====================================================
// SESSION HELPER (for backward compatibility with dashboard.js)
// Stores admin info locally for UI display purposes only.
// Real auth is handled server-side via PHP sessions.
// =====================================================
const AdminSession = {
    STORAGE_KEY: 'certicode_admin_session',

    /**
     * Get cached session info for UI display
     */
    get() {
        const sessionData = sessionStorage.getItem(this.STORAGE_KEY) || localStorage.getItem(this.STORAGE_KEY);
        if (!sessionData) return null;

        try {
            return JSON.parse(sessionData);
        } catch (e) {
            return null;
        }
    },

    /**
     * Store admin info locally for UI display (after PHP login succeeds)
     */
    store(admin) {
        const session = {
            adminId: admin.id,
            fullName: admin.fullName,
            email: admin.email,
            role: admin.role
        };
        sessionStorage.setItem(this.STORAGE_KEY, JSON.stringify(session));
    },

    /**
     * Check if we have cached session info
     * Note: This does NOT guarantee PHP session is valid.
     * PHP session check on server-side is the real guard.
     */
    isAuthenticated() {
        return this.get() !== null;
    },

    /**
     * Destroy local session data
     */
    destroy() {
        localStorage.removeItem(this.STORAGE_KEY);
        sessionStorage.removeItem(this.STORAGE_KEY);
    }
};

// =====================================================
// UI CONTROLLER
// =====================================================
const LoginUI = {
    form: null,
    usernameInput: null,
    passwordInput: null,
    loginBtn: null,
    errorMessage: null,
    togglePasswordBtn: null,

    /**
     * Initialize UI elements and event listeners
     */
    init() {
        // Get DOM elements
        this.form = document.getElementById('adminLoginForm');
        this.usernameInput = document.getElementById('username');
        this.passwordInput = document.getElementById('password');
        this.loginBtn = document.getElementById('loginBtn');
        this.errorMessage = document.getElementById('errorMessage');
        this.togglePasswordBtn = document.getElementById('togglePassword');

        if (!this.form) return;

        // Bind events
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        this.togglePasswordBtn?.addEventListener('click', () => this.togglePassword());

        // Auto-focus username field
        this.usernameInput?.focus();

        // Clear error on input
        [this.usernameInput, this.passwordInput].forEach(input => {
            input?.addEventListener('input', () => this.hideError());
        });
    },

    /**
     * Handle form submission
     */
    async handleSubmit(e) {
        e.preventDefault();

        const username = this.usernameInput.value.trim();
        const password = this.passwordInput.value;

        // Show loading state
        this.setLoading(true);
        this.hideError();

        try {
            const result = await AdminAuth.login(username, password);

            if (result.success) {
                // Store admin info for UI display on other pages
                if (result.admin) {
                    AdminSession.store(result.admin);
                }

                // Show success briefly before redirect
                this.loginBtn.innerHTML = '<span class="btn-text">✓ Success!</span>';
                
                // Redirect to admin dashboard
                setTimeout(() => {
                    window.location.href = '/rent-it/admin/dashboard/dashboard.php';
                }, 500);
            } else {
                this.showError(result.message);
                this.setLoading(false);
            }
        } catch (error) {
            console.error('[AUTH] Login error:', error);
            this.showError('An unexpected error occurred. Please try again.');
            this.setLoading(false);
        }
    },

    /**
     * Toggle password visibility
     */
    togglePassword() {
        const type = this.passwordInput.type === 'password' ? 'text' : 'password';
        this.passwordInput.type = type;
        
        const eyeOpen = this.togglePasswordBtn.querySelector('.eye-open');
        const eyeClosed = this.togglePasswordBtn.querySelector('.eye-closed');
        
        if (eyeOpen && eyeClosed) {
            if (type === 'password') {
                eyeOpen.style.display = 'block';
                eyeClosed.style.display = 'none';
            } else {
                eyeOpen.style.display = 'none';
                eyeClosed.style.display = 'block';
            }
        }
    },

    /**
     * Show error message
     */
    showError(message) {
        if (this.errorMessage) {
            this.errorMessage.textContent = message;
            this.errorMessage.classList.add('show');
        }
    },

    /**
     * Hide error message
     */
    hideError() {
        if (this.errorMessage) {
            this.errorMessage.classList.remove('show');
        }
    },

    /**
     * Set loading state
     */
    setLoading(loading) {
        if (this.loginBtn) {
            this.loginBtn.disabled = loading;
            const btnText = this.loginBtn.querySelector('.btn-text');
            const btnLoader = this.loginBtn.querySelector('.btn-loader');
            
            if (loading) {
                if (btnText) btnText.hidden = true;
                if (btnLoader) btnLoader.hidden = false;
            } else {
                if (btnText) btnText.hidden = false;
                if (btnLoader) btnLoader.hidden = true;
            }
        }

        // Disable inputs during loading
        if (this.usernameInput) this.usernameInput.disabled = loading;
        if (this.passwordInput) this.passwordInput.disabled = loading;
    }
};

// =====================================================
// INITIALIZE ON DOM READY
// =====================================================
document.addEventListener('DOMContentLoaded', () => {
    LoginUI.init();
});

// Export for use in other modules
window.AdminAuth = AdminAuth;
window.AdminSession = AdminSession;
