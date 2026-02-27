/**
 * =====================================================
 * HISTORY PAGE - JavaScript Module
 * Handles completed rental history display and filtering
 * =====================================================
 */

// Store history data from API
let historyData = [];
let filteredHistoryData = [];

// Pagination state
let currentPage = 1;
const PAGE_SIZE = 10;

// Resolve absolute URLs based on the current base tag or window origin
const baseHref = document.querySelector('base')?.href || `${window.location.origin}/`;
function buildUrl(path) {
    const normalizedPath = path.startsWith('/') ? path.slice(1) : path;
    return new URL(normalizedPath, baseHref).toString();
}

/**
 * Fetch history from API
 */
async function fetchHistory() {
    try {
        const response = await fetch(buildUrl('admin/api/get_history.php'));
        const result = await response.json();
        
        if (result.success) {
            historyData = result.data;
            currentPage = 1;
            filterHistory();
            updateKPICounts(result.summary);
        } else {
            console.error('Failed to fetch history:', result.message);
            renderHistory([]);
        }
    } catch (error) {
        console.error('Error fetching history:', error);
        renderHistory([]);
    }
}

/**
 * Get status display text
 */
function getStatusText(status) {
    const statusMap = {
        'returned': 'Returned',
        'completed': 'Completed'
    };
    return statusMap[status] || status;
}

/**
 * Format date for display
 */
function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

/**
 * Format currency
 */
function formatCurrency(amount) {
    return '₱' + amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/**
 * Get customer initial for avatar
 */
function getInitial(name) {
    return name?.charAt(0)?.toUpperCase() || '?';
}

/**
 * Render history row
 */
function renderHistoryRow(order) {
    const initial = getInitial(order.customer.name);
    const itemsText = order.items.length === 0
        ? 'No items'
        : order.items.length === 1 
            ? order.items[0].name 
            : `${order.items[0].name} +${order.items.length - 1} more`;
    const totalItems = order.items.reduce((sum, item) => sum + item.quantity, 0);
    
    return `
        <tr data-order-id="${order.order_id}">
            <td>
                <a href="admin/orders/orderdetail.php?id=${order.order_id}" class="order-id">${order.id}</a>
            </td>
            <td>
                <div class="customer-cell">
                    <div class="customer-avatar">
                        ${order.customer.avatar 
                            ? `<img src="${order.customer.avatar}" alt="${order.customer.name}" onerror="this.style.display='none';this.parentElement.textContent='${initial}'">` 
                            : initial}
                    </div>
                    <div class="customer-info">
                        <span class="customer-name">${order.customer.name}</span>
                        <span class="customer-email">${order.customer.email}</span>
                    </div>
                </div>
            </td>
            <td>
                <div class="items-cell">
                    <span class="item-name">${itemsText}</span>
                    <span class="item-count">${totalItems} item${totalItems !== 1 ? 's' : ''}</span>
                </div>
            </td>
            <td>
                <div class="dates-cell">
                    <span class="date-range">${formatDate(order.dates.start)} - ${formatDate(order.dates.end)}</span>
                    <span class="date-duration">${order.dates.duration} day${order.dates.duration !== 1 ? 's' : ''}</span>
                </div>
            </td>
            <td>
                <span class="total-amount">${formatCurrency(order.total)}</span>
            </td>
            <td>
                <span class="status-badge ${order.status}">${getStatusText(order.status)}</span>
            </td>
            <td>
                <div class="actions-cell">
                    <button class="action-btn view" title="View order details" onclick="viewOrder(${order.order_id})">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                            <circle cx="12" cy="12" r="3"/>
                        </svg>
                    </button>
                    <button class="action-btn delete" title="Delete history record" onclick="deleteHistory(${order.order_id}, '${order.id}')">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                            <polyline points="3 6 5 6 21 6"/>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                            <line x1="10" y1="11" x2="10" y2="17"/>
                            <line x1="14" y1="11" x2="14" y2="17"/>
                        </svg>
                    </button>
                </div>
            </td>
        </tr>
    `;
}

/**
 * Render all history with pagination
 */
function renderHistory(orders) {
    const tbody = document.getElementById('historyTableBody');
    if (!tbody) return;

    if (orders.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7">
                    <div class="history-empty">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10"/>
                            <polyline points="12 6 12 12 16 14"/>
                        </svg>
                        <h3 class="history-empty-title">No completed rentals found</h3>
                        <p class="history-empty-text">Completed and returned orders will appear here</p>
                    </div>
                </td>
            </tr>
        `;
        updatePagination(0);
        return;
    }

    // Paginate
    const totalPages = Math.ceil(orders.length / PAGE_SIZE);
    if (currentPage > totalPages) currentPage = totalPages;
    if (currentPage < 1) currentPage = 1;
    const start = (currentPage - 1) * PAGE_SIZE;
    const pageOrders = orders.slice(start, start + PAGE_SIZE);

    tbody.innerHTML = pageOrders.map(order => renderHistoryRow(order)).join('');
    updatePagination(orders.length);
}

/**
 * Update pagination controls
 */
function updatePagination(totalItems) {
    const paginationContainer = document.querySelector('.history-pagination');
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
    const info = paginationContainer.querySelector('.pagination-info');
    if (info) info.textContent = `Showing ${start}-${end} of ${totalItems} records`;

    // Update prev/next buttons
    const prevBtn = document.getElementById('prevPageBtn');
    const nextBtn = document.getElementById('nextPageBtn');
    if (prevBtn) prevBtn.disabled = currentPage <= 1;
    if (nextBtn) nextBtn.disabled = currentPage >= totalPages;

    // Build page buttons
    const pagesSpan = paginationContainer.querySelector('.pagination-pages');
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
    renderHistory(filteredHistoryData);
}

/**
 * Update KPI counts
 */
function updateKPICounts(summary) {
    document.getElementById('completedCount').textContent = summary?.total_completed || 0;
    const revenue = summary?.total_revenue || 0;
    document.getElementById('totalRevenue').textContent = formatCurrency(revenue);
}

/**
 * Filter history based on search and filter selections
 */
function filterHistory() {
    const searchTerm = document.getElementById('historySearchInput')?.value.toLowerCase() || '';
    const statusFilter = document.getElementById('statusFilter')?.value || 'all';
    const dateFilter = document.getElementById('dateFilter')?.value || 'all';

    let filtered = historyData;

    // Apply search filter
    if (searchTerm) {
        filtered = filtered.filter(order => 
            order.id.toLowerCase().includes(searchTerm) ||
            order.customer.name.toLowerCase().includes(searchTerm) ||
            order.customer.email.toLowerCase().includes(searchTerm) ||
            order.items.some(item => item.name.toLowerCase().includes(searchTerm))
        );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
        filtered = filtered.filter(order => order.status === statusFilter);
    }

    // Apply date filter
    if (dateFilter !== 'all') {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        filtered = filtered.filter(order => {
            const orderDate = new Date(order.dates.end);
            
            switch (dateFilter) {
                case 'today':
                    return orderDate.toDateString() === today.toDateString();
                case 'week':
                    const weekAgo = new Date(today);
                    weekAgo.setDate(weekAgo.getDate() - 7);
                    return orderDate >= weekAgo;
                case 'month':
                    const monthAgo = new Date(today);
                    monthAgo.setMonth(monthAgo.getMonth() - 1);
                    return orderDate >= monthAgo;
                default:
                    return true;
            }
        });
    }

    filteredHistoryData = filtered;
    currentPage = 1;
    renderHistory(filtered);
}

/**
 * View order details
 */
function viewOrder(orderId) {
    window.location.href = buildUrl(`admin/orders/orderdetail.php?id=${orderId}`);
}

/**
 * Delete history record
 */
async function deleteHistory(orderId, orderLabel) {
    if (!confirm(`Are you sure you want to delete ${orderLabel}? This will permanently remove this completed transaction.`)) return;

    try {
        const response = await fetch(buildUrl('admin/api/delete_history.php'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ order_id: orderId })
        });

        const result = await response.json();
        if (result.success) {
            if (typeof AdminComponents !== 'undefined' && AdminComponents.showToast) {
                AdminComponents.showToast('History record deleted successfully', 'success');
            } else {
                alert('History record deleted successfully');
            }
            fetchHistory();
        } else {
            alert('Failed to delete: ' + result.message);
        }
    } catch (error) {
        console.error('Error deleting history:', error);
        alert('Error deleting history record');
    }
}

/**
 * Initialize page
 */
document.addEventListener('DOMContentLoaded', function() {
    // Fetch history from API
    fetchHistory();

    // Search input handler
    const searchInput = document.getElementById('historySearchInput');
    if (searchInput) {
        let debounceTimer;
        searchInput.addEventListener('input', () => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(filterHistory, 300);
        });
    }

    // Filter change handlers
    document.getElementById('statusFilter')?.addEventListener('change', filterHistory);
    document.getElementById('dateFilter')?.addEventListener('change', filterHistory);

    // Refresh button
    document.getElementById('refreshHistoryBtn')?.addEventListener('click', () => {
        fetchHistory();
    });

    // Pagination buttons
    document.getElementById('prevPageBtn')?.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            renderHistory(filteredHistoryData);
        }
    });
    document.getElementById('nextPageBtn')?.addEventListener('click', () => {
        const totalPages = Math.ceil(filteredHistoryData.length / PAGE_SIZE);
        if (currentPage < totalPages) {
            currentPage++;
            renderHistory(filteredHistoryData);
        }
    });

    // Export button (placeholder)
    document.getElementById('exportHistoryBtn')?.addEventListener('click', () => {
        alert('Export functionality would generate a CSV/PDF of the rental history.');
    });
});
