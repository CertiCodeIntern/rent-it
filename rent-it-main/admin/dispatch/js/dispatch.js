/**
 * =====================================================
 * DISPATCH PAGE - JavaScript Module
 * Handles dispatch management - deliveries and pickups
 * =====================================================
 */

// Store dispatches data from API
let dispatchesData = [];
let filteredDispatchesData = [];

// Pagination state
let currentPage = 1;
const PAGE_SIZE = 10;

/**
 * Get initial for avatar
 */
function getInitial(name) {
    return name?.charAt(0)?.toUpperCase() || '?';
}

/**
 * Get status display text
 */
function getStatusText(status) {
    const statusMap = {
        'pending': 'Pending',
        'confirmed': 'Confirmed',
        'out_for_delivery': 'Out for Delivery',
        'active': 'Active',
        'return_scheduled': 'Return Scheduled',
        'returned': 'Returned',
        'completed': 'Completed',
        'cancelled': 'Cancelled',
        'late': 'Late'
    };
    return statusMap[status] || status;
}

/**
 * Get next action for a given status
 * Returns null if no action is available (completed, cancelled, late)
 */
function getNextAction(status) {
    const actionMap = {
        'pending': 'Confirm Order',
        'confirmed': 'Mark Out for Delivery',
        'out_for_delivery': 'Mark Active',
        'active': 'Schedule Return',
        'return_scheduled': 'Mark Returned',
        'returned': 'Mark Completed'
    };
    return actionMap[status] || null;
}

/**
 * Render dispatch card
 */
function renderDispatchCard(dispatch) {
    const customerInitial = getInitial(dispatch.customer.name);
    const itemTags = dispatch.items.map(item => `<span class="dispatch-item-tag">${item}</span>`).join('');
    
    return `
        <div class="dispatch-card" data-dispatch-id="${dispatch.id}" data-type="${dispatch.type}" onclick="viewOrder('${dispatch.orderId}')">
            <div class="dispatch-card-header">
                <div class="dispatch-type ${dispatch.type}">
                    ${dispatch.type === 'delivery' ? `
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="1" y="3" width="15" height="13"/>
                            <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
                            <circle cx="5.5" cy="18.5" r="2.5"/>
                            <circle cx="18.5" cy="18.5" r="2.5"/>
                        </svg>
                    ` : dispatch.type === 'returning' ? `
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="1 4 1 10 7 10"/>
                            <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>
                        </svg>
                    ` : `
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                            <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
                            <line x1="12" y1="22.08" x2="12" y2="12"/>
                        </svg>
                    `}
                    ${dispatch.type.charAt(0).toUpperCase() + dispatch.type.slice(1)}
                </div>
                <span class="dispatch-status ${dispatch.status}">${getStatusText(dispatch.status)}</span>
            </div>
            <div class="dispatch-card-body">
                <div class="dispatch-order-info">
                    <span class="dispatch-order-id">ORD-${String(dispatch.orderId).padStart(4, '0')}</span>
                    <span class="dispatch-time">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10"/>
                            <polyline points="12 6 12 12 16 14"/>
                        </svg>
                        ${dispatch.scheduledTime}
                    </span>
                </div>
                <div class="dispatch-customer">
                    <div class="dispatch-customer-avatar">${customerInitial}</div>
                    <div class="dispatch-customer-info">
                        <div class="dispatch-customer-name">${dispatch.customer.name}</div>
                        <div class="dispatch-customer-phone">${dispatch.customer.phone}</div>
                    </div>
                </div>
                <div class="dispatch-address">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                        <circle cx="12" cy="10" r="3"/>
                    </svg>
                    <span class="dispatch-address-text">${dispatch.address}</span>
                </div>
                <div class="dispatch-items">
                    ${itemTags}
                </div>
            </div>
            <div class="dispatch-card-footer">
                <div class="dispatch-actions" onclick="event.stopPropagation()">
                    <button class="dispatch-action-btn" title="Email customer" onclick="emailCustomer('${dispatch.customer.email}')">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                            <polyline points="22,6 12,13 2,6"/>
                        </svg>
                    </button>
                    ${getNextAction(dispatch.status) ? `
                        <button class="dispatch-action-btn" title="${getNextAction(dispatch.status)}" onclick="markComplete('${dispatch.id}')">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="20 6 9 17 4 12"/>
                            </svg>
                        </button>
                    ` : ''}
                </div>
            </div>
        </div>
    `;
}

/**
 * Render all dispatch cards
 */
function renderDispatches(dispatches) {
    const grid = document.getElementById('dispatchGrid');
    const empty = document.getElementById('dispatchEmpty');
    
    if (!grid) return;

    filteredDispatchesData = dispatches;

    if (dispatches.length === 0) {
        grid.style.display = 'none';
        empty.style.display = 'flex';
        updatePagination(0);
        return;
    }

    // Paginate
    const totalPages = Math.ceil(dispatches.length / PAGE_SIZE);
    if (currentPage > totalPages) currentPage = totalPages;
    if (currentPage < 1) currentPage = 1;
    const start = (currentPage - 1) * PAGE_SIZE;
    const pageDispatches = dispatches.slice(start, start + PAGE_SIZE);

    grid.style.display = 'grid';
    empty.style.display = 'none';
    grid.innerHTML = pageDispatches.map(d => renderDispatchCard(d)).join('');
    
    // Update pagination
    updatePagination(dispatches.length);
}

/**
 * Update stats from API response or calculate from data
 */
function updateStats(stats) {
    document.getElementById('deliveryCount').textContent = stats.deliveries || 0;
    document.getElementById('pickupCount').textContent = stats.pickups || 0;
    document.getElementById('pendingCount').textContent = stats.pending || 0;
    document.getElementById('completedCount').textContent = stats.completed || 0;
}

/**
 * Filter dispatches
 */
function filterDispatches() {
    const activeTab = document.querySelector('.filter-tab.active');
    const filterType = activeTab?.dataset.filter || 'all';
    const searchTerm = document.getElementById('dispatchSearchInput')?.value.toLowerCase() || '';

    let filtered = dispatchesData;

    // Filter by status
    if (filterType !== 'all') {
        filtered = filtered.filter(d => d.status === filterType);
    }

    // Filter by search term
    if (searchTerm) {
        filtered = filtered.filter(d =>
            String(d.orderId).toLowerCase().includes(searchTerm) ||
            d.id.toLowerCase().includes(searchTerm) ||
            d.customer.name.toLowerCase().includes(searchTerm) ||
            d.address.toLowerCase().includes(searchTerm) ||
            d.items.some(item => item.toLowerCase().includes(searchTerm))
        );
    }

    currentPage = 1;
    renderDispatches(filtered);
}

/**
 * Update pagination controls
 */
function updatePagination(totalItems) {
    const paginationContainer = document.getElementById('dispatchPagination');
    if (!paginationContainer) return;

    if (totalItems === 0) {
        paginationContainer.style.display = 'none';
        return;
    }
    paginationContainer.style.display = 'flex';

    const totalPages = Math.ceil(totalItems / PAGE_SIZE);
    const start = (currentPage - 1) * PAGE_SIZE + 1;
    const end = Math.min(currentPage * PAGE_SIZE, totalItems);

    // Update info text
    const info = document.getElementById('paginationInfo');
    if (info) info.textContent = `Showing ${start}-${end} of ${totalItems} dispatches`;

    // Update prev/next buttons
    const prevBtn = document.getElementById('prevPageBtn');
    const nextBtn = document.getElementById('nextPageBtn');
    if (prevBtn) prevBtn.disabled = currentPage <= 1;
    if (nextBtn) nextBtn.disabled = currentPage >= totalPages;

    // Build page buttons
    const pagesSpan = document.getElementById('paginationPages');
    if (pagesSpan) {
        let pages = [];
        if (totalPages <= 5) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            pages.push(1);
            if (currentPage > 3) pages.push('...');
            for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
                pages.push(i);
            }
            if (currentPage < totalPages - 2) pages.push('...');
            pages.push(totalPages);
        }

        pagesSpan.innerHTML = pages.map(p => {
            if (p === '...') return '<span class="page-dots">...</span>';
            return `<button class="page-btn ${p === currentPage ? 'active' : ''}" onclick="goToPage(${p})">${p}</button>`;
        }).join('');
    }
}

/**
 * Go to specific page
 */
function goToPage(page) {
    currentPage = page;
    renderDispatches(filteredDispatchesData);
}

/**
 * View order detail
 */
/**
 * View order detail
 */
function viewOrder(orderId) {
    window.location.href = `/rent-it/admin/orders/orderdetail.php?id=${orderId}`;
}

/**
 * Email customer
 */
function emailCustomer(email) {
    if (!email || email === 'N/A') {
        AdminComponents.showToast('No email address available for this customer', 'warning');
        return;
    }
    window.location.href = `mailto:${email}`;
}

/**
 * Mark returning item as available (Completed)
 */
async function markAvailable(orderId) {
    if (!confirm('Mark this order as completed and items as available?')) return;
    try {
        const response = await fetch('/rent-it/admin/api/update_order_status.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ order_id: orderId, status: 'Completed' })
        });
        const data = await response.json();
        if (data.success) {
            AdminComponents.showToast('Order marked as completed!', 'success');
            const dateRange = document.getElementById('dateRangeSelect')?.value || 'week';
            fetchDispatches(dateRange);
        } else {
            AdminComponents.showToast(data.error || 'Failed to update status', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        AdminComponents.showToast('Error updating order status', 'error');
    }
}

/**
 * Mark dispatch as complete
 */
async function markComplete(dispatchId) {
    const dispatch = dispatchesData.find(d => d.id === dispatchId);
    if (!dispatch) {
        AdminComponents.showToast('Dispatch not found', 'error');
        return;
    }
    
    // Determine next status based on current status
    let nextStatus;
    let confirmMessage;
    
    switch (dispatch.status) {
        case 'pending':
            nextStatus = 'Confirmed';
            confirmMessage = `Confirm order for ${dispatch.customer.name}?`;
            break;
        case 'confirmed':
            nextStatus = 'In Transit';
            confirmMessage = `Mark order for ${dispatch.customer.name} as out for delivery?`;
            break;
        case 'out_for_delivery':
            nextStatus = 'Active';
            confirmMessage = `Mark order for ${dispatch.customer.name} as active?`;
            break;
        case 'active':
            nextStatus = 'Pending Return';
            confirmMessage = `Schedule return for ${dispatch.customer.name}?`;
            break;
        case 'return_scheduled':
            nextStatus = 'Returned';
            confirmMessage = `Mark order for ${dispatch.customer.name} as returned?`;
            break;
        case 'returned':
            nextStatus = 'Completed';
            confirmMessage = `Mark order for ${dispatch.customer.name} as completed?`;
            break;
        default:
            AdminComponents.showToast('No action available for this status', 'warning');
            return;
    }
    
    if (!confirm(confirmMessage)) {
        return;
    }
    
    try {
        const response = await fetch('/rent-it/admin/api/update_order_status.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                order_id: dispatch.orderId,
                status: nextStatus
            })
        });

        const data = await response.json();
        if (data.success) {
            AdminComponents.showToast('Status updated successfully!', 'success');
            const dateRange = document.getElementById('dateRangeSelect')?.value || 'week';
            fetchDispatches(dateRange);
        } else {
            AdminComponents.showToast(data.message || 'Failed to update status', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        AdminComponents.showToast('Error updating dispatch status', 'error');
    }
}

/**
 * Fetch dispatches from API
 */
async function fetchDispatches(range = 'week') {
    const grid = document.getElementById('dispatchGrid');
    const empty = document.getElementById('dispatchEmpty');
    
    try {
        // Show loading state
        if (grid) {

    // Pagination buttons
    const prevBtn = document.getElementById('prevPageBtn');
    const nextBtn = document.getElementById('nextPageBtn');
    
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                renderDispatches(filteredDispatchesData);
            }
        });
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            const totalPages = Math.ceil(filteredDispatchesData.length / PAGE_SIZE);
            if (currentPage < totalPages) {
                currentPage++;
                renderDispatches(filteredDispatchesData);
            }
        });
    }
            grid.innerHTML = '<div class="dispatch-loading">Loading dispatches...</div>';
            grid.style.display = 'block';
        }
        if (empty) {
            empty.style.display = 'none';
        }
        
        const response = await fetch(`/rent-it/admin/api/get_dispatches.php?range=${range}`);
        const data = await response.json();
        
        if (data.success) {
            dispatchesData = data.dispatches || [];
            updateStats(data.stats || {});
            filterDispatches();
        } else {
            console.error('API error:', data.error);
            if (grid) {
                grid.innerHTML = '<div class="dispatch-error">Failed to load dispatches. Please try again.</div>';
            }
        }
    } catch (error) {
        console.error('Fetch error:', error);
        if (grid) {
            grid.innerHTML = '<div class="dispatch-error">Error connecting to server.</div>';
        }
    }
}

/**
 * Initialize page
 */
document.addEventListener('DOMContentLoaded', function() {
    // Fetch data from API
    const dateRange = document.getElementById('dateRangeSelect')?.value || 'week';
    fetchDispatches(dateRange);

    // Filter tab click handlers
    document.querySelectorAll('.filter-tab').forEach(tab => {
        tab.addEventListener('click', function() {
            document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            filterDispatches();
        });
    });

    // Search input handler
    const searchInput = document.getElementById('dispatchSearchInput');
    if (searchInput) {
        let debounceTimer;
        searchInput.addEventListener('input', () => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(filterDispatches, 300);
        });
    }

    // Date range handler - refetch data when changed
    document.getElementById('dateRangeSelect')?.addEventListener('change', function() {
        fetchDispatches(this.value);
    });
});
