/**
 * Admin Settings Page JavaScript
 * Handles theme toggle and password change functionality
 */

document.addEventListener('DOMContentLoaded', function() {
    initThemeToggle();
    initPasswordToggles();
    initPasswordForm();
});

/**
 * Initialize Theme Toggle (Light/Dark Mode)
 */
function initThemeToggle() {
    const themeToggle = document.getElementById('themeToggleSwitch');
    if (!themeToggle) return;

    // Sync initial state with current theme (same source as header toggle)
    function syncToggleState() {
        const currentTheme = document.documentElement.getAttribute('data-theme') || localStorage.getItem('admin-theme') || 'dark';
        themeToggle.checked = currentTheme === 'dark';
    }
    syncToggleState();

    // Handle toggle change - use AdminComponents.toggleTheme() so it stays in sync with header
    themeToggle.addEventListener('change', function() {
        const newTheme = this.checked ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('admin-theme', newTheme);

        // Show notification via AdminComponents if available, else fallback
        if (typeof AdminComponents !== 'undefined' && AdminComponents.showToast) {
            AdminComponents.showToast(`Switched to ${newTheme} mode`, 'info');
        } else {
            showNotification(`Switched to ${newTheme} mode`, 'success');
        }
    });

    // Listen for theme changes from the header toggle (keeps this toggle in sync)
    const observer = new MutationObserver(() => syncToggleState());
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
}

/**
 * Initialize Password Visibility Toggles
 */
function initPasswordToggles() {
    const toggleButtons = document.querySelectorAll('.password-toggle');
    
    toggleButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetId = this.getAttribute('data-target');
            const input = document.getElementById(targetId);
            const eyeOpen = this.querySelector('.eye-open');
            const eyeClosed = this.querySelector('.eye-closed');
            
            if (!input) return;
            
            if (input.type === 'password') {
                input.type = 'text';
                if (eyeOpen) eyeOpen.style.display = 'none';
                if (eyeClosed) eyeClosed.style.display = 'block';
                this.setAttribute('title', 'Hide password');
            } else {
                input.type = 'password';
                if (eyeOpen) eyeOpen.style.display = 'block';
                if (eyeClosed) eyeClosed.style.display = 'none';
                this.setAttribute('title', 'Show password');
            }
        });
    });
}

/**
 * Initialize Password Form
 */
function initPasswordForm() {
    const passwordForm = document.getElementById('passwordForm');
    if (!passwordForm) return;
    
    passwordForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const currentPassword = document.getElementById('currentPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        
        // Validation
        if (!currentPassword || !newPassword || !confirmPassword) {
            showNotification('Please fill in all fields', 'error');
            return;
        }
        
        if (newPassword.length < 8) {
            showNotification('New password must be at least 8 characters', 'error');
            return;
        }
        
        if (!/[a-zA-Z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
            showNotification('Password must contain letters and numbers', 'error');
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
        
        // Simulate password update (replace with actual API call)
        const updateBtn = document.getElementById('updatePasswordBtn');
        updateBtn.disabled = true;
        updateBtn.textContent = 'Updating...';
        
        setTimeout(() => {
            // Reset form
            passwordForm.reset();
            updateBtn.disabled = false;
            updateBtn.textContent = 'Update Password';
            
            showNotification('Password updated successfully!', 'success');
        }, 1500);
    });
}

/**
 * Show Notification
 * @param {string} message - Notification message
 * @param {string} type - 'success', 'error', 'warning', 'info'
 */
function showNotification(message, type = 'info') {
    // Remove existing notification
    const existing = document.querySelector('.settings-notification');
    if (existing) {
        existing.remove();
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `settings-notification notification-${type}`;
    notification.innerHTML = `
        <span class="notification-message">${message}</span>
        <button class="notification-close" onclick="this.parentElement.remove()">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
        </button>
    `;
    
    // Add styles if not already present
    if (!document.getElementById('notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            .settings-notification {
                position: fixed;
                bottom: 24px;
                right: 24px;
                padding: 12px 16px;
                border-radius: 8px;
                display: flex;
                align-items: center;
                gap: 12px;
                font-size: 0.875rem;
                font-weight: 500;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
                z-index: 10000;
                animation: slideIn 0.3s ease;
            }
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            .notification-success {
                background: #22c55e;
                color: #fff;
            }
            .notification-error {
                background: #ef4444;
                color: #fff;
            }
            .notification-warning {
                background: #f59e0b;
                color: #fff;
            }
            .notification-info {
                background: #3b82f6;
                color: #fff;
            }
            .notification-close {
                background: none;
                border: none;
                cursor: pointer;
                padding: 0;
                display: flex;
                color: inherit;
                opacity: 0.8;
            }
            .notification-close:hover {
                opacity: 1;
            }
        `;
        document.head.appendChild(style);
    }
    
    document.body.appendChild(notification);
    
    // Auto remove after 4 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.style.animation = 'slideIn 0.3s ease reverse';
            setTimeout(() => notification.remove(), 300);
        }
    }, 4000);
}
