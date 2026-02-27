/**
 * Returns & Extensions Page JavaScript
 * Handles return requests and rental extensions management
 */

document.addEventListener("DOMContentLoaded", function() {
    // Initialize page components
    initComponents();
    initEventListeners();
});

/**
 * Initialize shared components (sidebar, topbar, footer)
 */
function initComponents() {
    // Load sidebar
    if (typeof loadSidebar === 'function') {
        loadSidebar('sidebarContainer');
    }
    
    // Load topbar
    if (typeof loadTopbar === 'function') {
        loadTopbar('topbarContainer', 'Returns & Extensions');
    }
    
    // Load footer
    if (typeof loadFooter === 'function') {
        loadFooter('footerContainer');
    }
}

/**
 * Initialize event listeners
 */
function initEventListeners() {
    // Filter button
    const filterBtn = document.getElementById('filterBtn');
    if (filterBtn) {
        filterBtn.addEventListener('click', handleFilterClick);
    }

    // Reschedule buttons
    document.querySelectorAll('.btn-reschedule').forEach(btn => {
        btn.addEventListener('click', handleReschedule);
    });

    // Cancel return buttons
    document.querySelectorAll('.btn-cancel-return').forEach(btn => {
        btn.addEventListener('click', handleCancelReturn);
    });

    // View details buttons
    document.querySelectorAll('.btn-view-details').forEach(btn => {
        btn.addEventListener('click', handleViewDetails);
    });

    // Pay extension buttons
    document.querySelectorAll('.btn-pay-extension').forEach(btn => {
        btn.addEventListener('click', handlePayExtension);
    });
}

/**
 * Handle filter button click
 */
function handleFilterClick() {
    // TODO: Implement filter modal/dropdown
    console.log('Filter clicked - implement filter modal');
    
    // For now, show a simple alert
    alert('Filter functionality coming soon!');
}

/**
 * Handle reschedule button click
 * @param {Event} e - Click event
 */
function handleReschedule(e) {
    const card = e.target.closest('.return-card');
    const returnId = card.querySelector('.return-id').textContent;
    
    // TODO: Implement reschedule modal
    console.log(`Reschedule return: ${returnId}`);
    alert(`Reschedule pickup for ${returnId}\n\nThis feature is coming soon!`);
}

/**
 * Handle cancel return button click
 * @param {Event} e - Click event
 */
function handleCancelReturn(e) {
    const card = e.target.closest('.return-card');
    const returnId = card.querySelector('.return-id').textContent;
    const itemName = card.querySelector('.return-item-name').textContent;
    
    // Confirm cancellation
    const confirmed = confirm(`Are you sure you want to cancel the return for:\n\n${itemName}\n${returnId}\n\nThis action cannot be undone.`);
    
    if (confirmed) {
        // TODO: API call to cancel return
        console.log(`Cancelling return: ${returnId}`);
        
        // Animate card removal
        card.style.transition = 'all 0.3s ease';
        card.style.opacity = '0';
        card.style.transform = 'translateX(-20px)';
        
        setTimeout(() => {
            card.remove();
            updatePendingCount();
        }, 300);
    }
}

/**
 * Handle view details button click
 * @param {Event} e - Click event
 */
function handleViewDetails(e) {
    const card = e.target.closest('.return-card');
    const returnId = card.querySelector('.return-id').textContent;
    
    // TODO: Implement details modal
    console.log(`View details: ${returnId}`);
    alert(`Details for ${returnId}\n\nThis feature is coming soon!`);
}

/**
 * Handle pay extension button click
 * @param {Event} e - Click event
 */
function handlePayExtension(e) {
    const card = e.target.closest('.extension-card');
    const extensionId = card.querySelector('.extension-id').textContent;
    const cost = card.querySelector('.cost-value').textContent;
    
    // TODO: Implement payment modal
    console.log(`Pay extension: ${extensionId} - ${cost}`);
    alert(`Pay extension fee for ${extensionId}\n\nAmount: ${cost}\n\nPayment gateway coming soon!`);
}

/**
 * Update pending returns count
 */
function updatePendingCount() {
    const pendingCards = document.querySelectorAll('.return-card').length;
    
    // Update stat card
    const pendingValue = document.getElementById('pendingReturns');
    if (pendingValue) {
        pendingValue.textContent = pendingCards;
    }
    
    // Update badge
    const badge = document.getElementById('returnsBadge');
    if (badge) {
        badge.textContent = `${pendingCards} Pending`;
    }
    
    // Show empty state if no cards
    if (pendingCards === 0) {
        const grid = document.getElementById('activeReturnsGrid');
        if (grid) {
            grid.innerHTML = `
                <div class="empty-state">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="48" height="48">
                        <path d="M16 16v1a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2m5.66 0H14a2 2 0 0 1 2 2v3.34"/>
                        <polyline points="18 8 22 12 18 16"/>
                        <line x1="22" y1="12" x2="9" y2="12"/>
                    </svg>
                    <h3>No Pending Returns</h3>
                    <p>You don't have any pending return requests.</p>
                </div>
            `;
        }
    }
}
