/**
 * =====================================================
 * AUTH PAGE JAVASCRIPT
 * Handles login, registration, and mobile sheet behavior
 * =====================================================
 */

const Auth = {
    activeTab: 'login',
    isTransitioning: false,
    loading: false,
    sheetOpen: false,

    API_BASE_URL: '/rent-it/api/auth/',
    LOGIN_URL: 'login.php',
    REGISTER_URL: 'register.php',

    tabCopy: {
        login: {
            title: 'Login',
            subtitle: 'Please sign in to continue.'
        },
        register: {
            title: 'Create your Account',
            subtitle: 'Please fill in your details to continue.'
        }
    },

    init() {
        this.clearStaleLocalStorage();
        this.cacheElements();
        this.storeDefaultButtonLabels();
        this.handleUrlHash();

        this.setupSheetTrigger();
        this.setupTabListeners();
        this.setupFormListeners();
        this.setupPasswordToggles();
        this.setupPhoneFormatting();
        this.setupPasswordValidation();

        Components.initStaggerAnimation('.auth-card');

        window.addEventListener('hashchange', () => this.handleUrlHash());

        window.history.pushState(null, '', window.location.href);
        window.addEventListener('popstate', () => {
            window.history.pushState(null, '', window.location.href);
        });
    },

    cacheElements() {
        this.shell = document.getElementById('authShell');
        this.formWrapper = document.getElementById('formWrapper');
        this.loginForm = document.getElementById('loginForm');
        this.registerForm = document.getElementById('registerForm');
        this.loginTab = document.getElementById('loginTab');
        this.registerTab = document.getElementById('registerTab');
        this.tabIndicator = document.getElementById('tabIndicator');
        this.authTitle = document.getElementById('authTitle');
        this.authSubtitle = document.getElementById('authSubtitle');
        this.getStartedBtn = document.getElementById('getStartedBtn');
    },

    clearStaleLocalStorage() {
        const userStr = localStorage.getItem('user');
        if (!userStr) return;

        try {
            const user = JSON.parse(userStr);
            if (!user || !user.user_id || !user.email) {
                localStorage.removeItem('user');
                localStorage.removeItem('token');
                localStorage.removeItem('user_role');
                localStorage.removeItem('user_name');
            }
        } catch (error) {
            localStorage.removeItem('user');
            localStorage.removeItem('token');
        }
    },

    storeDefaultButtonLabels() {
        document.querySelectorAll('button[type="submit"]').forEach((button) => {
            button.dataset.defaultText = button.textContent.trim();
        });
    },

    handleUrlHash() {
        const hash = window.location.hash;
        const targetTab = hash === '#register' ? 'register' : 'login';
        const shouldOpenSheet = hash === '#login' || hash === '#register';

        this.activeTab = targetTab;
        this.setSheetOpen(shouldOpenSheet, false);
        this.syncTabState(targetTab);
    },

    setupSheetTrigger() {
        this.getStartedBtn?.addEventListener('click', () => {
            this.switchTab('login');
        });
    },

    setupTabListeners() {
        this.loginTab?.addEventListener('click', () => this.switchTab('login'));
        this.registerTab?.addEventListener('click', () => this.switchTab('register'));
    },

    switchTab(tab, updateHash = true) {
        if (this.isTransitioning) return;

        this.setSheetOpen(true);

        if (updateHash && window.location.hash !== `#${tab}`) {
            window.history.pushState(null, '', `#${tab}`);
        }

        if (tab === this.activeTab) {
            this.syncTabState(tab);
            return;
        }

        this.isTransitioning = true;
        this.activeTab = tab;
        this.syncTabControls(tab);
        this.updateHeaderCopy(tab);

        if (this.formWrapper) {
            this.formWrapper.classList.remove('fade-in');
            this.formWrapper.classList.add('fade-out');
        }

        window.setTimeout(() => {
            this.syncForms(tab);

            if (this.formWrapper) {
                this.formWrapper.classList.remove('fade-out');
                this.formWrapper.classList.add('fade-in');
            }

            this.isTransitioning = false;
        }, 200);
    },

    syncTabState(tab) {
        this.syncTabControls(tab);
        this.syncForms(tab);
        this.updateHeaderCopy(tab);

        if (this.formWrapper) {
            this.formWrapper.classList.remove('fade-out');
            this.formWrapper.classList.add('fade-in');
        }
    },

    syncTabControls(tab) {
        this.loginTab?.classList.toggle('active', tab === 'login');
        this.registerTab?.classList.toggle('active', tab === 'register');
        this.tabIndicator?.classList.toggle('register', tab === 'register');
    },

    syncForms(tab) {
        this.loginForm?.classList.toggle('hidden', tab !== 'login');
        this.registerForm?.classList.toggle('hidden', tab !== 'register');
    },

    updateHeaderCopy(tab) {
        const copy = this.tabCopy[tab];
        if (!copy) return;

        if (this.authTitle) {
            this.authTitle.textContent = copy.title;
        }

        if (this.authSubtitle) {
            this.authSubtitle.textContent = copy.subtitle;
        }
    },

    setSheetOpen(isOpen, updateState = true) {
        this.sheetOpen = isOpen;
        this.shell?.classList.toggle('sheet-open', isOpen);

        if (!updateState) return;

        if (!isOpen && window.location.hash) {
            window.history.pushState(null, '', window.location.pathname);
        }
    },

    setupFormListeners() {
        this.loginForm?.addEventListener('submit', (event) => this.handleLogin(event));
        this.registerForm?.addEventListener('submit', (event) => this.handleRegister(event));
    },

    setupPasswordToggles() {
        if (this._passwordToggleBound) return;
        this._passwordToggleBound = true;

        const eyeOpenSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
        </svg>`;
        const eyeClosedSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
            <line x1="1" y1="1" x2="23" y2="23"/>
        </svg>`;

        document.addEventListener('click', (event) => {
            const button = event.target.closest('.eye-btn');
            if (!button) return;

            event.preventDefault();
            const input = button.closest('.password-wrapper')?.querySelector('input');
            if (!input) return;

            const revealPassword = input.type === 'password';
            input.type = revealPassword ? 'text' : 'password';
            button.innerHTML = revealPassword ? eyeClosedSvg : eyeOpenSvg;
            button.setAttribute('aria-label', revealPassword ? 'Hide password' : 'Show password');
        });
    },

    setupPhoneFormatting() {
        const phoneInput = document.getElementById('registerPhone');
        if (!phoneInput) return;

        phoneInput.addEventListener('input', (event) => {
            let value = event.target.value.replace(/\D/g, '');

            if (!value.startsWith('63')) {
                value = `63${value.replace(/^63/, '')}`;
            }

            value = value.substring(0, 12);

            let formatted = '+63';
            if (value.length > 2) {
                formatted += ` ${value.substring(2, 5)}`;
            }
            if (value.length > 5) {
                formatted += ` ${value.substring(5, 8)}`;
            }
            if (value.length > 8) {
                formatted += ` ${value.substring(8, 12)}`;
            }

            event.target.value = formatted.trim();
        });

        if (!phoneInput.value.trim()) {
            phoneInput.value = '+63 ';
        }

        phoneInput.addEventListener('keydown', (event) => {
            if ((event.key === 'Backspace' || event.key === 'Delete') && event.target.selectionStart <= 4) {
                event.preventDefault();
            }
        });
    },

    setupPasswordValidation() {
        const passwordInput = document.getElementById('registerPassword');
        const confirmInput = document.getElementById('registerConfirmPassword');
        const message = document.getElementById('passwordMatchMessage');
        const reqLength = document.getElementById('reqLength');
        const reqUpper = document.getElementById('reqUpper');
        const reqNumber = document.getElementById('reqNumber');

        if (!passwordInput || !confirmInput || !message || !reqLength || !reqUpper || !reqNumber) {
            return;
        }

        const updateRequirement = (element, passed) => {
            element.classList.toggle('valid', passed);
            element.classList.toggle('invalid', !passed);
        };

        const updateMatchMessage = () => {
            if (!confirmInput.value) {
                message.textContent = '';
                return;
            }

            if (passwordInput.value === confirmInput.value) {
                message.textContent = 'Passwords match.';
                message.style.color = 'var(--success)';
            } else {
                message.textContent = 'Passwords do not match.';
                message.style.color = 'var(--error)';
            }
        };

        passwordInput.addEventListener('input', () => {
            const value = passwordInput.value;
            updateRequirement(reqLength, value.length >= 8);
            updateRequirement(reqUpper, /[A-Z]/.test(value));
            updateRequirement(reqNumber, /[0-9]/.test(value));
            updateMatchMessage();
        });

        confirmInput.addEventListener('input', updateMatchMessage);
    },

    async handleLogin(event) {
        event.preventDefault();

        const email = document.getElementById('loginEmail')?.value.trim();
        const password = document.getElementById('loginPassword')?.value;
        const submitBtn = event.target.querySelector('button[type="submit"]');

        this.hideError('loginError');

        if (!email || !password) {
            this.showError('Please fill in all fields', 'loginError');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            this.showError('Please enter a valid email address', 'loginError');
            return;
        }

        this.setLoading(true, submitBtn, 'Signing in...');

        try {
            const response = await fetch(this.API_BASE_URL + this.LOGIN_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email,
                    password
                })
            });

            const data = await response.json();

            if (!data.success) {
                if (data.message && data.message.toLowerCase().includes('invalid')) {
                    const errorMessage = `${data.message}<br><a href="#" class="register-link" style="color: var(--primary-color); text-decoration: underline;">Don't have an account? Register here</a>`;
                    this.showErrorHTML(errorMessage, 'loginError');

                    window.setTimeout(() => {
                        const registerLink = document.querySelector('.register-link');
                        registerLink?.addEventListener('click', (clickEvent) => {
                            clickEvent.preventDefault();
                            this.switchTab('register');
                        }, { once: true });
                    }, 50);

                    throw new Error('LOGIN_ERROR_HANDLED');
                }

                throw new Error(data.message || 'Login failed');
            }

            localStorage.setItem('user', JSON.stringify(data.user));
            localStorage.setItem('token', data.session_id || 'authenticated');
            localStorage.setItem('user_role', data.user.role);
            localStorage.setItem('user_name', data.user.full_name || data.user.email.split('@')[0]);

            this.showSuccess('Login successful! Redirecting...', 'loginError');

            window.setTimeout(() => {
                window.location.href = '../dashboard/dashboard.php';
            }, 1500);
        } catch (error) {
            if (error.message !== 'LOGIN_ERROR_HANDLED') {
                this.showError(error.message || 'Login failed. Please try again.', 'loginError');
            }
        } finally {
            this.setLoading(false, submitBtn);
        }
    },

    async handleRegister(event) {
        event.preventDefault();

        const fullName = document.getElementById('registerFullname')?.value.trim();
        const phone = document.getElementById('registerPhone')?.value.trim();
        const email = document.getElementById('registerEmail')?.value.trim();
        const password = document.getElementById('registerPassword')?.value;
        const confirmPassword = document.getElementById('registerConfirmPassword')?.value;
        const submitBtn = event.target.querySelector('button[type="submit"]');

        this.hideError('authError');

        if (!email || !password || !confirmPassword) {
            this.showError('Please fill in all required fields');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            this.showError('Please enter a valid email address');
            return;
        }

        if (password !== confirmPassword) {
            this.showError('Passwords do not match');
            return;
        }

        if (password.length < 8) {
            this.showError('Password must be at least 8 characters');
            return;
        }

        this.setLoading(true, submitBtn, 'Creating account...');

        try {
            const response = await fetch(this.API_BASE_URL + this.REGISTER_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    full_name: fullName,
                    email,
                    phone,
                    password,
                    confirm_password: confirmPassword
                })
            });

            const data = await response.json();

            if (!data.success) {
                throw new Error(data.message || 'Registration failed');
            }

            localStorage.setItem('user', JSON.stringify(data.user));
            localStorage.setItem('token', 'authenticated');
            localStorage.setItem('user_role', data.user.role);
            localStorage.setItem('user_name', data.user.full_name || data.user.email.split('@')[0]);

            this.showSuccess('Registration successful! Redirecting...');

            window.setTimeout(() => {
                window.location.href = '../dashboard/dashboard.php';
            }, 1500);
        } catch (error) {
            this.showError(error.message || 'Registration failed. Please try again.');
        } finally {
            this.setLoading(false, submitBtn);
        }
    },

    setLoading(isLoading, button, text = '') {
        this.loading = isLoading;
        if (!button) return;

        button.disabled = isLoading;
        button.textContent = isLoading ? text : (button.dataset.defaultText || button.textContent);
    },

    showError(message, elementId = 'authError') {
        const errorEl = document.getElementById(elementId);
        if (!errorEl) return;

        errorEl.textContent = message;
        errorEl.classList.remove('success');
        errorEl.classList.add('error');
        errorEl.classList.remove('hidden');
    },

    showErrorHTML(htmlMessage, elementId = 'authError') {
        const errorEl = document.getElementById(elementId);
        if (!errorEl) return;

        errorEl.innerHTML = htmlMessage;
        errorEl.classList.remove('success');
        errorEl.classList.add('error');
        errorEl.classList.remove('hidden');
    },

    showSuccess(message, elementId = 'authError') {
        const errorEl = document.getElementById(elementId);
        if (!errorEl) return;

        errorEl.textContent = message;
        errorEl.classList.remove('error');
        errorEl.classList.add('success');
        errorEl.classList.remove('hidden');
    },

    hideError(elementId = 'authError') {
        const errorEl = document.getElementById(elementId);
        errorEl?.classList.add('hidden');
    }
};

document.addEventListener('DOMContentLoaded', () => {
    if (typeof Auth !== 'undefined') {
        Auth.init();
    }
});
