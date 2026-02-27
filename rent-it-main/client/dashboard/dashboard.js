/**
 * =====================================================
 * DASHBOARD PAGE JAVASCRIPT
 * Handles Client Dashboard functionality
 * =====================================================
 */

const Dashboard = {
    /**
     * Initialize the dashboard
     */
    init() {
        // Check authentication
        if (!Components.requireAuth()) {
            return;
        }

        // Inject reusable components (sidebar, topbar, and footer)
        Components.injectSidebar('sidebarContainer', 'dashboard');
        Components.injectTopbar('topbarContainer', 'Dashboard');
        Components.injectFooter();

        // Initialize dashboard interactions
        this.initCardActions();
        this.initTableActions();
    },

    /**
     * Initialize rental card button actions
     */
    initCardActions() {
        // Extend buttons
        document.querySelectorAll('.btn-extend').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const card = e.target.closest('.rental-card');
                const itemName = card?.querySelector('.card-title')?.textContent || 'item';
                this.showExtendModal(itemName);
            });
        });

        // Return buttons
        document.querySelectorAll('.btn-return').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const card = e.target.closest('.rental-card');
                const itemName = card?.querySelector('.card-title')?.textContent || 'item';
                this.showReturnConfirmation(itemName);
            });
        });
    },

    /**
     * Initialize table action buttons
     */
    initTableActions() {
        document.querySelectorAll('.history-table .action-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const row = e.target.closest('tr');
                const itemName = row?.querySelector('.history-name')?.textContent || 'item';
                const isRefunded = btn.classList.contains('action-muted');
                
                if (!isRefunded) {
                    this.downloadReceipt(itemName);
                }
            });
        });
    },

    /**
     * Show extend rental modal (placeholder)
     * @param {string} itemName - Name of the rental item
     */
    showExtendModal(itemName) {
        // In a real app, this would open a modal with date selection
        alert(`Extend rental for: ${itemName}\n\nThis feature will open a date selection modal.`);
    },

    /**
     * Show return confirmation dialog (placeholder)
     * @param {string} itemName - Name of the rental item
     */
    showReturnConfirmation(itemName) {
        const confirmed = confirm(`Schedule return for: ${itemName}?\n\nWe'll arrange a pickup time.`);
        if (confirmed) {
            alert('Return scheduled! You will receive a confirmation email shortly.');
        }
    },

    /**
     * Download receipt (placeholder)
     * @param {string} itemName - Name of the rental item
     */
    downloadReceipt(itemName) {
        // In a real app, this would trigger a file download
        alert(`Downloading receipt for: ${itemName}`);
    }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    Dashboard.init();
});
