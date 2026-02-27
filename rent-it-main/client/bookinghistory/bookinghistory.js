/* =====================================================
   BOOKING HISTORY PAGE JAVASCRIPT
   RentIt - Client Portal
   ===================================================== */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize components using Components module
    if (typeof Components !== 'undefined') {
        Components.injectSidebar('sidebarContainer', 'bookinghistory', 'client');
        Components.injectTopbar('topbarContainer', 'Booking History');
        Components.injectFooter('footerContainer');
    }
    
    initFilterDropdown();
    initPagination();
    initTableActions();
});

/**
 * Initialize filter dropdown functionality
 */
function initFilterDropdown() {
    const filterBtn = document.getElementById('filterBtn');
    
    if (filterBtn) {
        filterBtn.addEventListener('click', function() {
            // Toggle filter dropdown (placeholder)
            alert('Filter options:\n\n• By Status (Completed, Cancelled, Refunded)\n• By Date Range\n• By Amount\n\nFilter functionality coming soon!');
        });
    }
}

/**
 * Initialize pagination controls
 */
let historyPagination = null;

function initPagination() {
    if (typeof createPagination !== 'function') return;

    historyPagination = createPagination({
        containerSelector: '#historyPagination',
        getItems: () => {
            // Return only non-filtered rows (filtered rows have data-filtered attribute)
            return Array.from(document.querySelectorAll('#historyTableBody tr:not(.history-empty)'))
                .filter(row => !row.dataset.filtered);
        },
        itemsPerPage: 10,
        scrollTarget: '.history-section'
    });

    historyPagination.render();
}

/**
 * Initialize table action buttons
 */
function initTableActions() {
    // Download buttons
    document.querySelectorAll('.action-download').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const row = this.closest('tr');
            const rentalId = row.querySelector('.small-muted')?.textContent || 'Unknown';
            
            alert(`Downloading receipt for ${rentalId}...\n\nThis would download the PDF receipt.`);
        });
    });

    // Review buttons (only for completed orders)
    document.querySelectorAll('.action-review').forEach(btn => {
        btn.addEventListener('click', function() {
            const productId = this.dataset.productId;
            const productName = this.dataset.productName;
            
            // Open review modal using Components
            if (typeof Components !== 'undefined' && Components.openReviewModal) {
                Components.openReviewModal({
                    id: productId,
                    name: productName,
                    image: '',
                    category: 'Equipment'
                });
            } else {
                alert(`Rate & Review: ${productName}\n\nReview modal would open here.`);
            }
        });
    });

    // Edit buttons
    document.querySelectorAll('.action-edit').forEach(btn => {
        btn.addEventListener('click', function() {
            const row = this.closest('tr');
            const rentalId = row.querySelector('.small-muted')?.textContent || 'Unknown';
            const itemName = row.querySelector('.item-name')?.textContent || 'Unknown Item';
            
            alert(`Edit rental: ${itemName}\nID: ${rentalId}\n\nThis would open the rental details for editing.`);
        });
    });
}

/**
 * Filter table by status
 * @param {string} status - Status to filter by
 */
function filterByStatus(status) {
    const rows = document.querySelectorAll('.history-table tbody tr:not(.history-empty)');
    
    rows.forEach(row => {
        const statusPill = row.querySelector('.status-pill');
        
        if (status === 'all') {
            row.style.display = '';
            delete row.dataset.filtered;
        } else {
            const rowStatus = statusPill?.textContent.toLowerCase().trim();
            if (rowStatus === status) {
                row.style.display = '';
                delete row.dataset.filtered;
            } else {
                row.style.display = 'none';
                row.dataset.filtered = 'true';
            }
        }
    });
    
    // Reset pagination to page 1 after filtering
    if (historyPagination) {
        historyPagination.reset();
    }
    
    updatePaginationInfo();
}

/**
 * Update pagination info after filtering
 */
function updatePaginationInfo() {
    const visibleRows = document.querySelectorAll('.history-table tbody tr:not([style*="display: none"])');
    const info = document.querySelector('.pagination-info');
    
    if (info) {
        const count = visibleRows.length;
        info.textContent = `Showing 1 to ${count} of ${count} results`;
    }
}
