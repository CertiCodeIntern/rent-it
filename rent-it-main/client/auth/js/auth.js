/**
 * =====================================================
 * AUTH PAGE JAVASCRIPT
 * Handles Login and Registration functionality
 * =====================================================
 */

const Auth = {
    
    activeTab: 'login',
    isTransitioning: false,
    loading: false,
    
    API_BASE_URL: '/rent-it/api/auth/',
    LOGIN_URL: 'login.php',
    REGISTER_URL: 'register.php',    /**
     * Initialize the auth page
     */
    init() {
        // Note: PHP handles the redirect if user is already logged in (via session)
        // We don't redirect from JS because localStorage might be stale/invalid
        // Clear any stale localStorage data to prevent confusion
        const userStr = localStorage.getItem('user');
        if (userStr) {
            try {
                const user = JSON.parse(userStr);
                // If localStorage has user but we're on login page, it means PHP session expired
                // Clear the stale localStorage
                if (!user || !user.user_id || !user.email) {
                    localStorage.removeItem('user');
                    localStorage.removeItem('token');
                    localStorage.removeItem('user_role');
                    localStorage.removeItem('user_name');
                }
            } catch (e) {
                localStorage.removeItem('user');
                localStorage.removeItem('token');
            }
        }

        this.handleUrlHash();

        // Setup event listeners
        this.setupTabListeners();
        this.setupFormListeners();
        this.setupPasswordToggles();
        this.setupPhoneFormatting();

        // Initialize animations
        Components.initStaggerAnimation('.auth-card');

        // Listen for hash changes
        window.addEventListener('hashchange', () => this.handleUrlHash());

        // Prevent back button from returning to protected pages after logout
        window.history.pushState(null, '', window.location.href);
        window.addEventListener('popstate', () => {
            window.history.pushState(null, '', window.location.href);
        });
    },

    /**
     * Handle URL hash for deep linking (#login or #register)
     */
    handleUrlHash() {
        const hash = window.location.hash;
        if (hash === '#register') {
            this.switchTab('register', false);
        } else if (hash === '#login') {
            this.switchTab('login', false);
        }
    },

    /**
     * Setup tab switching listeners
     */
    setupTabListeners() {
        const loginTab = document.getElementById('loginTab');
        const registerTab = document.getElementById('registerTab');

        loginTab?.addEventListener('click', () => this.switchTab('login'));
        registerTab?.addEventListener('click', () => this.switchTab('register'));
    },

    /**
     * @param {string} tab 
     * @param {boolean} updateHash 
     */
    switchTab(tab, updateHash = true) {
        if (tab === this.activeTab || this.isTransitioning) return;

        this.isTransitioning = true;
        this.activeTab = tab;

        // Update URL hash
        if (updateHash) {
            window.history.pushState(null, '', `#${tab}`);
        }

        // Update tab buttons
        document.getElementById('loginTab')?.classList.toggle('active', tab === 'login');
        document.getElementById('registerTab')?.classList.toggle('active', tab === 'register');

        // Update tab indicator
        const indicator = document.getElementById('tabIndicator');
        if (indicator) {
            indicator.classList.toggle('register', tab === 'register');
        }

        // Fade out current form
        const formWrapper = document.getElementById('formWrapper');
        if (formWrapper) {
            formWrapper.classList.remove('fade-in');
            formWrapper.classList.add('fade-out');
        }

        // After transition, switch content
        setTimeout(() => {
            document.getElementById('loginForm')?.classList.toggle('hidden', tab !== 'login');
            document.getElementById('registerForm')?.classList.toggle('hidden', tab !== 'register');

            // Fade in new form
            if (formWrapper) {
                formWrapper.classList.remove('fade-out');
                formWrapper.classList.add('fade-in');
            }

            this.isTransitioning = false;
        }, 200);
    },

    /**
     * Setup form submission listeners
     */
    setupFormListeners() {
        const loginForm = document.getElementById('loginForm');
        const registerForm = document.getElementById('registerForm');
    
        // Iwasan ang default redirect sa login.php kapag social button ang pinindot
        loginForm?.addEventListener('submit', (e) => {
            if (e.submitter && e.submitter.classList.contains('auth-social-btn')) return;
            this.handleLogin(e);
        });
    
        registerForm?.addEventListener('submit', (e) => {
            if (e.submitter && e.submitter.classList.contains('auth-social-btn')) return;
            this.handleRegister(e);
        });
    },

    /**
     * Setup password visibility toggles
     */
    setupPasswordToggles() {
        // Prevent multiple bindings if init() runs more than once
        if (this._passwordToggleBound) return;
        this._passwordToggleBound = true;

        const eyeOpenSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
        </svg>`;
        const eyeClosedSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
            <line x1="1" y1="1" x2="23" y2="23"/>
        </svg>`;

        // Delegate to document to ensure buttons are always handled
        document.addEventListener('click', (e) => {
            const btn = e.target.closest('.eye-btn');
            if (!btn) return;

            e.preventDefault();
            const wrapper = btn.closest('.password-wrapper');
            const input = wrapper?.querySelector('input');
            if (!input) return;

            const isPassword = input.type === 'password';
            input.type = isPassword ? 'text' : 'password';
            btn.innerHTML = isPassword ? eyeClosedSvg : eyeOpenSvg;
            btn.setAttribute('aria-label', isPassword ? 'Hide password' : 'Show password');
        });
    },

    /**
     * Setup phone number formatting for +63 format
     */
    setupPhoneFormatting() {
        const phoneInput = document.getElementById('registerPhone');
        if (!phoneInput) return;

        phoneInput.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, '');
            
            // Always start with 63 (Philippines country code)
            if (!value.startsWith('63')) {
                value = '63' + value.replace(/^63/, '');
            }
            
            // Limit to 12 digits (63 + 10 digits)
            value = value.substring(0, 12);
            
            // Format: +63 XXX XXX XXXX
            let formatted = '+63';
            if (value.length > 2) {
                formatted += ' ' + value.substring(2, 5);
            }
            if (value.length > 5) {
                formatted += ' ' + value.substring(5, 8);
            }
            if (value.length > 8) {
                formatted += ' ' + value.substring(8, 12);
            }
            
            e.target.value = formatted.trim();
        });

        // Set initial value
        if (!phoneInput.value || phoneInput.value.trim() === '') {
            phoneInput.value = '+63 ';
        }

        // Prevent deletion of +63 prefix
        phoneInput.addEventListener('keydown', (e) => {
            const value = e.target.value;
            const cursorPosition = e.target.selectionStart;
            
            if ((e.key === 'Backspace' || e.key === 'Delete') && cursorPosition <= 4) {
                e.preventDefault();
            }
        });
    },

    /**
     * Handle login form submission
     * @param {Event} e - Form submit event
     */
    async handleLogin(e) {
        e.preventDefault();
        
        const email = document.getElementById('loginEmail')?.value.trim();
        const password = document.getElementById('loginPassword')?.value;
        const submitBtn = e.target.querySelector('button[type="submit"]');

        // Clear previous errors
        this.hideError('loginError');

        // Validate
        if (!email || !password) {
            this.showError('Please fill in all fields', 'loginError');
            return;
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            this.showError('Please enter a valid email address', 'loginError');
            return;
        }

        // Show loading state
        this.setLoading(true, submitBtn, 'Signing in...');

        try {
            // Call PHP API
            const response = await fetch(this.API_BASE_URL + this.LOGIN_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: email,
                    password: password
                })
            });

            const data = await response.json();

            if (!data.success) {
                // Check if it's an "Invalid email or password" error
                if (data.message && data.message.toLowerCase().includes('invalid')) {
                    // Show error with option to register
                    const errorMsg = data.message + '<br><a href="#" class="register-link" style="color: var(--primary-color); text-decoration: underline;">Don\'t have an account? Register here</a>';
                    this.showErrorHTML(errorMsg, 'loginError');
                    
                    // Add click handler to switch to register tab
                    setTimeout(() => {
                        const registerLink = document.querySelector('.register-link');
                        if (registerLink) {
                            registerLink.addEventListener('click', (e) => {
                                e.preventDefault();
                                document.getElementById('registerTab')?.click();
                            });
                        }
                    }, 100);
                    
                    throw new Error('LOGIN_ERROR_HANDLED');
                } else {
                    throw new Error(data.message || 'Login failed');
                }
            }

            // Store user data in localStorage
            localStorage.setItem('user', JSON.stringify(data.user));
            localStorage.setItem('token', data.session_id || 'authenticated');
            localStorage.setItem('user_role', data.user.role);
            localStorage.setItem('user_name', data.user.full_name || data.user.email.split('@')[0]);

            // Show success message
            this.showSuccess('Login successful! Redirecting...', 'loginError');

            // Redirect to dashboard after delay
            setTimeout(() => {
                window.location.href = '../dashboard/dashboard.php';
            }, 1500);

        } catch (error) {
            if (error.message !== 'LOGIN_ERROR_HANDLED') {
                this.showError(error.message || 'Login failed. Please try again.', 'loginError');
            }
        } finally {
            this.setLoading(false, submitBtn, 'Sign In  →');
        }
    },

    /**
     * Handle registration form submission
     * @param {Event} e - Form submit event
     */
    async handleRegister(e) {
        e.preventDefault();

        const fullName = document.getElementById('registerFullname')?.value.trim();
        const phone = document.getElementById('registerPhone')?.value.trim();
        const email = document.getElementById('registerEmail')?.value.trim();
        const password = document.getElementById('registerPassword')?.value;
        const confirmPassword = document.getElementById('registerConfirmPassword')?.value;
        const submitBtn = e.target.querySelector('button[type="submit"]');

        // Clear previous errors
        this.hideError();

        // Validate
        if (!email || !password || !confirmPassword) {
            this.showError('Please fill in all required fields');
            return;
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            this.showError('Please enter a valid email address');
            return;
        }

        if (password !== confirmPassword) {
            this.showError('Passwords do not match');
            return;
        }

        if (password.length < 6) {
            this.showError('Password must be at least 6 characters');
            return;
        }

        // Show loading state
        this.setLoading(true, submitBtn, 'Creating account...');

        try {
            // Call PHP API
            const response = await fetch(this.API_BASE_URL + this.REGISTER_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    full_name: fullName,
                    email: email,
                    phone: phone,
                    password: password,
                    confirm_password: confirmPassword
                })
            });

            const data = await response.json();

            if (!data.success) {
                throw new Error(data.message || 'Registration failed');
            }

            // Store user data in localStorage
            localStorage.setItem('user', JSON.stringify(data.user));
            localStorage.setItem('token', 'authenticated');
            localStorage.setItem('user_role', data.user.role);
            localStorage.setItem('user_name', data.user.full_name || data.user.email.split('@')[0]);

            // Show success message
            this.showSuccess('Registration successful! Redirecting...');

            // Redirect to dashboard after delay
            setTimeout(() => {
                window.location.href = '../dashboard/dashboard.php';
            }, 1500);

        } catch (error) {
            this.showError(error.message || 'Registration failed. Please try again.');
        } finally {
            this.setLoading(false, submitBtn, 'Get Started  →');
        }
    },

    /**
     * Set loading state on button
     * @param {boolean} loading - Loading state
     * @param {phpButtonElement} button - Submit button
     * @param {string} text - Button text
     */
    setLoading(loading, button, text) {
        this.loading = loading;
        if (button) {
            button.disabled = loading;
            button.textContent = text;
        }
    },

    /**
     * Show success message
     * @param {string} message - Success message
     */
    showSuccess(message) {
        const errorEl = document.getElementById('authError');
        if (errorEl) {
            errorEl.textContent = message;
            errorEl.classList.remove('error');
            errorEl.classList.add('success');
            errorEl.classList.remove('hidden');
            
            // Auto-hide after 5 seconds
            setTimeout(() => {
                errorEl.classList.add('hidden');
            }, 5000);
        }
    },

    /**
     * Show error message
     * @param {string} message - Error message
     * @param {string} elementId - ID of the error element (default: 'authError')
     */
    showError(message, elementId = 'authError') {
        const errorEl = document.getElementById(elementId);
        if (errorEl) {
            errorEl.textContent = message;
            errorEl.classList.remove('success');
            errorEl.classList.add('error');
            errorEl.classList.remove('hidden');
        }
    },

    /**
     * Show error message with HTML content
     * @param {string} htmlMessage - Error message with HTML
     * @param {string} elementId - ID of the error element (default: 'authError')
     */
    showErrorHTML(htmlMessage, elementId = 'authError') {
        const errorEl = document.getElementById(elementId);
        if (errorEl) {
            errorEl.innerHTML = htmlMessage;
            errorEl.classList.remove('success');
            errorEl.classList.add('error');
            errorEl.classList.remove('hidden');
        }
    },

    /**
     * Show success message
     * @param {string} message - Success message
     * @param {string} elementId - ID of the error element (default: 'authError')
     */
    showSuccess(message, elementId = 'authError') {
        const errorEl = document.getElementById(elementId);
        if (errorEl) {
            errorEl.textContent = message;
            errorEl.classList.remove('error');
            errorEl.classList.add('success');
            errorEl.classList.remove('hidden');
        }
    },

    /**
     * Hide error message
     * @param {string} elementId - ID of the error element (default: 'authError')
     */
    hideError(elementId = 'authError') {
        const errorEl = document.getElementById(elementId);
        if (errorEl) {
            errorEl.classList.add('hidden');
        }
    }
};

document.addEventListener('DOMContentLoaded', () => {
    if (typeof Auth !== 'undefined') {
        Auth.init();
    }
    const passwordInput = document.getElementById('registerPassword');
    const reqLength = document.getElementById('reqLength');
    const reqUpper = document.getElementById('reqUpper');
    const reqNumber = document.getElementById('reqNumber');
    
    // DAPAT MAY 'IF' CHECK DITO PARA HINDI MAG-CRASH ANG SCRIPT
    if (passwordInput && reqLength && reqUpper && reqNumber) {
        passwordInput.addEventListener('input', function() {
            const value = passwordInput.value;
        
            // 1. Check Length
            if (value.length >= 8) {
                reqLength.classList.add('valid');
                reqLength.classList.remove('invalid');
            } else {
                reqLength.classList.add('invalid');
                reqLength.classList.remove('valid');
            }
        
            // 2. Check Uppercase
            if (/[A-Z]/.test(value)) {
                reqUpper.classList.add('valid');
                reqUpper.classList.remove('invalid');
            } else {
                reqUpper.classList.add('invalid');
                reqUpper.classList.remove('valid');
            }
        
            // 3. Check Numbers
            if (/[0-9]/.test(value)) {
                reqNumber.classList.add('valid');
                reqNumber.classList.remove('invalid');
            } else {
                reqNumber.classList.add('invalid');
                reqNumber.classList.remove('valid');
            }
        });
    }
});