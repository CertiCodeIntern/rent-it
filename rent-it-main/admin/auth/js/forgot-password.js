/**
 * Admin Forgot Password Module
 * Step 1: Verify identity via 3 security questions
 * Step 2: Set new password
 */

const ForgotPasswordUI = {
    API_BASE: '/rent-it/admin/api/',
    verifyToken: null,

    init() {
        // Step 1 elements
        this.securityForm = document.getElementById('securityForm');
        this.questionError = document.getElementById('questionError');
        this.verifyBtn = document.getElementById('verifyBtn');

        // Step 2 elements
        this.resetForm = document.getElementById('resetForm');
        this.resetError = document.getElementById('resetError');
        this.resetSuccess = document.getElementById('resetSuccess');
        this.resetBtn = document.getElementById('resetBtn');

        // Steps
        this.stepQuestions = document.getElementById('stepQuestions');
        this.stepPassword = document.getElementById('stepPassword');

        // Bind events
        this.securityForm?.addEventListener('submit', (e) => this.handleVerify(e));
        this.resetForm?.addEventListener('submit', (e) => this.handleReset(e));

        // Toggle password visibility
        this.setupPasswordToggle('toggleNewPassword', 'newPassword');
        this.setupPasswordToggle('toggleConfirmPassword', 'confirmPassword');

        // Clear errors on input
        document.querySelectorAll('input').forEach(input => {
            input.addEventListener('input', () => {
                this.hideError(this.questionError);
                this.hideError(this.resetError);
            });
        });

        // Focus first field
        document.getElementById('question1')?.focus();
    },

    setupPasswordToggle(btnId, inputId) {
        const btn = document.getElementById(btnId);
        const input = document.getElementById(inputId);
        if (!btn || !input) return;

        btn.addEventListener('click', () => {
            const type = input.type === 'password' ? 'text' : 'password';
            input.type = type;

            const eyeOpen = btn.querySelector('.eye-open');
            const eyeClosed = btn.querySelector('.eye-closed');
            if (eyeOpen && eyeClosed) {
                eyeOpen.style.display = type === 'password' ? 'block' : 'none';
                eyeClosed.style.display = type === 'password' ? 'none' : 'block';
            }
        });
    },

    async handleVerify(e) {
        e.preventDefault();

        const q1 = document.getElementById('question1').value.trim();
        const q2 = document.getElementById('question2').value.trim();
        const q3 = document.getElementById('question3').value.trim();

        if (!q1 || !q2 || !q3) {
            this.showError(this.questionError, 'Please answer all 3 questions.');
            return;
        }

        this.setLoading(this.verifyBtn, true);
        this.hideError(this.questionError);

        try {
            const response = await fetch(this.API_BASE + 'admin_forgot_password.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'verify',
                    question1: q1,
                    question2: q2,
                    question3: q3
                })
            });

            const data = await response.json();

            if (data.success) {
                this.verifyToken = data.token;
                // Transition to step 2
                this.stepQuestions.classList.remove('active');
                this.stepPassword.classList.add('active');
                document.getElementById('newPassword')?.focus();
            } else {
                this.showError(this.questionError, data.message || 'Incorrect answers. Please try again.');
            }
        } catch (error) {
            this.showError(this.questionError, 'Network error. Please try again.');
        }

        this.setLoading(this.verifyBtn, false);
    },

    async handleReset(e) {
        e.preventDefault();

        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        if (!newPassword || !confirmPassword) {
            this.showError(this.resetError, 'Please fill in both password fields.');
            return;
        }

        if (newPassword.length < 4) {
            this.showError(this.resetError, 'Password must be at least 4 characters.');
            return;
        }

        if (newPassword !== confirmPassword) {
            this.showError(this.resetError, 'Passwords do not match.');
            return;
        }

        this.setLoading(this.resetBtn, true);
        this.hideError(this.resetError);

        try {
            const response = await fetch(this.API_BASE + 'admin_forgot_password.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'reset',
                    token: this.verifyToken,
                    new_password: newPassword
                })
            });

            const data = await response.json();

            if (data.success) {
                this.hideError(this.resetError);
                this.showSuccess('Password updated successfully! Redirecting to login...');
                this.resetBtn.disabled = true;

                setTimeout(() => {
                    window.location.href = '/rent-it/admin/auth/login.php';
                }, 2000);
            } else {
                this.showError(this.resetError, data.message || 'Failed to update password.');
            }
        } catch (error) {
            this.showError(this.resetError, 'Network error. Please try again.');
        }

        this.setLoading(this.resetBtn, false);
    },

    showError(el, message) {
        if (el) {
            el.textContent = message;
            el.classList.add('show');
        }
    },

    hideError(el) {
        if (el) {
            el.classList.remove('show');
        }
    },

    showSuccess(message) {
        if (this.resetSuccess) {
            this.resetSuccess.textContent = message;
            this.resetSuccess.classList.add('show');
        }
    },

    setLoading(btn, loading) {
        if (!btn) return;
        btn.disabled = loading;
        const btnText = btn.querySelector('.btn-text');
        const btnLoader = btn.querySelector('.btn-loader');
        if (loading) {
            if (btnText) btnText.hidden = true;
            if (btnLoader) btnLoader.hidden = false;
        } else {
            if (btnText) btnText.hidden = false;
            if (btnLoader) btnLoader.hidden = true;
        }
    }
};

document.addEventListener('DOMContentLoaded', () => {
    ForgotPasswordUI.init();
});
