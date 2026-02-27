/**
 * =====================================================
 * ORDERS PAGE - JavaScript Module
 * Handles order list display, filtering, and actions
 * =====================================================
 */

// Store orders data from API
let ordersData = [];
let filteredOrdersData = [];
let kpiCounts = { pending: 0, confirmed: 0, out_for_delivery: 0, active: 0 };

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
 * Fetch orders from API
 */
async function fetchOrders() {
    try {
        const response = await fetch(buildUrl('admin/api/get_orders.php'));
        const result = await response.json();
        
        if (result.success) {
            ordersData = result.data;
            kpiCounts = result.counts;
            currentPage = 1;
            filterOrders();
            updateKPICounts();
        } else {
            console.error('Failed to fetch orders:', result.message);
            renderOrders([]);
        }
    } catch (error) {
        console.error('Error fetching orders:', error);
        renderOrders([]);
    }
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
 * Format date for display
 */
function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
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
 * Render order row
 */
function renderOrderRow(order) {
    const initial = getInitial(order.customer.name);
    const uniqueItems = order.items.length;
    const totalUnits = order.items.reduce((sum, item) => sum + item.quantity, 0);

    let itemsText;
    if (uniqueItems === 0) {
        itemsText = 'No items';
    } else if (uniqueItems === 1) {
        const qty = order.items[0].quantity;
        itemsText = qty > 1
            ? `${order.items[0].name} <span style="font-size:0.75rem;font-weight:600;color:#6b7280;background:#f3f4f6;border-radius:4px;padding:1px 6px;">×${qty}</span>`
            : order.items[0].name;
    } else {
        itemsText = `${order.items[0].name} +${uniqueItems - 1} more`;
    }

    const itemCountLabel = uniqueItems === 1
        ? (totalUnits > 1 ? `${totalUnits} units` : '1 unit')
        : `${uniqueItems} item${uniqueItems !== 1 ? 's' : ''} · ${totalUnits} unit${totalUnits !== 1 ? 's' : ''}`;
    
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
                    <span class="item-count">${itemCountLabel}</span>
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
                    ${order.status === 'pending' ? `
                        <button class="action-btn confirm" title="Confirm order" onclick="confirmOrder(${order.order_id})">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                                <polyline points="20 6 9 17 4 12"/>
                            </svg>
                        </button>
                        <button class="action-btn cancel" title="Cancel order" onclick="cancelOrder(${order.order_id})">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                                <line x1="18" y1="6" x2="6" y2="18"/>
                                <line x1="6" y1="6" x2="18" y2="18"/>
                            </svg>
                        </button>
                    ` : ''}
                    ${(function() {
                        const endDate = new Date(order.dates.end);
                        endDate.setHours(0, 0, 0, 0);
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        const isOverdue = endDate < today;
                        const canMarkLate = isOverdue && ['active', 'return_scheduled'].includes(order.status);
                        const isLate = order.status === 'late';
                        
                        if (isLate) {
                            return `<button class="action-btn late-fee" title="View late fees" onclick="viewLateFees(${order.order_id})">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                                    <line x1="12" y1="9" x2="12" y2="13"/>
                                    <line x1="12" y1="17" x2="12.01" y2="17"/>
                                </svg>
                            </button>`;
                        } else if (canMarkLate) {
                            return `<button class="action-btn late-fee" title="Mark as late" onclick="markAsLate(${order.order_id})">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                                    <circle cx="12" cy="12" r="10"/>
                                    <polyline points="12 6 12 12 16 14"/>
                                </svg>
                            </button>`;
                        }
                        return '';
                    })()}
                </div>
            </td>
        </tr>
    `;
}

/**
 * Render all orders with pagination
 */
function renderOrders(orders) {
    const tbody = document.getElementById('ordersTableBody');
    if (!tbody) return;

    if (orders.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7">
                    <div class="orders-empty">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                            <line x1="3" y1="9" x2="21" y2="9"/>
                            <line x1="9" y1="21" x2="9" y2="9"/>
                        </svg>
                        <h3 class="orders-empty-title">No orders found</h3>
                        <p class="orders-empty-text">Try adjusting your search or filter criteria</p>
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

    tbody.innerHTML = pageOrders.map(order => renderOrderRow(order)).join('');
    updatePagination(orders.length);
}

/**
 * Update pagination controls
 */
function updatePagination(totalItems) {
    const paginationContainer = document.querySelector('.orders-pagination');
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
    if (info) info.textContent = `Showing ${start}-${end} of ${totalItems} orders`;

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
    renderOrders(filteredOrdersData);
}

/**
 * Update KPI counts
 */
function updateKPICounts() {
    document.getElementById('pendingCount').textContent = kpiCounts.pending || 0;
    document.getElementById('confirmedCount').textContent = kpiCounts.confirmed || 0;
    document.getElementById('deliveryCount').textContent = kpiCounts.out_for_delivery || 0;
    document.getElementById('activeCount').textContent = kpiCounts.active || 0;
}

/**
 * Filter orders based on search and filter selections
 */
function filterOrders() {
    const searchTerm = document.getElementById('orderSearchInput')?.value.toLowerCase() || '';
    const statusFilter = document.getElementById('statusFilter')?.value || 'all';
    const dateFilter = document.getElementById('dateFilter')?.value || 'all';

    let filtered = ordersData;

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
            const orderDate = new Date(order.dates.start);
            
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

    filteredOrdersData = filtered;
    currentPage = 1;
    renderOrders(filtered);
}

/**
 * View order details
 */
function viewOrder(orderId) {
    window.location.href = buildUrl(`admin/orders/orderdetail.php?id=${orderId}`);
}

/**
 * View late fees for an order (already marked as late)
 */
function viewLateFees(orderId) {
    window.location.href = buildUrl(`admin/latefees/latefees.php?order_id=${orderId}`);
}

/**
 * Mark order as late — changes status to Late and navigates to late fees page
 */
async function markAsLate(orderId) {
    if (!confirm('Mark this order as LATE? This will apply late fee penalties to this order.')) return;
    
    try {
        const response = await fetch(buildUrl('admin/api/update_order_status.php'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ order_id: orderId, status: 'Late' })
        });
        
        const result = await response.json();
        if (result.success) {
            alert('Order marked as late. Redirecting to late fees...');
            window.location.href = buildUrl(`admin/latefees/latefees.php?order_id=${orderId}`);
        } else {
            alert('Failed to mark order as late: ' + result.message);
        }
    } catch (error) {
        console.error('Error marking order as late:', error);
        alert('Error marking order as late');
    }
}

/**
 * Confirm order (change status to confirmed)
 */
async function confirmOrder(orderId) {
    if (!confirm('Confirm this order?')) return;
    
    try {
        const response = await fetch(buildUrl('admin/api/update_order_status.php'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ order_id: orderId, status: 'Booked' })
        });
        
        const result = await response.json();
        if (result.success) {
            alert('Order confirmed successfully!');
            fetchOrders();
        } else {
            alert('Failed to confirm order: ' + result.message);
        }
    } catch (error) {
        console.error('Error confirming order:', error);
        alert('Error confirming order');
    }
}

/**
 * Cancel order
 */
async function cancelOrder(orderId) {
    if (!confirm('Are you sure you want to cancel this order?')) return;
    
    try {
        const response = await fetch(buildUrl('admin/api/update_order_status.php'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ order_id: orderId, status: 'Cancelled' })
        });
        
        const result = await response.json();
        if (result.success) {
            alert('Order cancelled.');
            fetchOrders();
        } else {
            alert('Failed to cancel order: ' + result.message);
        }
    } catch (error) {
        console.error('Error cancelling order:', error);
        alert('Error cancelling order');
    }
}

/**
 * Export orders to PDF using jsPDF + AutoTable
 */
function exportOrdersToPDF() {
    const dataToExport = filteredOrdersData.length > 0 ? filteredOrdersData : ordersData;

    if (!dataToExport || dataToExport.length === 0) {
        alert('No orders to export.');
        return;
    }

    if (!window.jspdf || !window.jspdf.jsPDF) {
        alert('PDF library failed to load. Please check your internet connection and reload the page.');
        return;
    }
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('landscape', 'mm', 'a4');

    // --- Header ---
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('RentIt - Orders Report', 14, 18);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100);
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    doc.text(`Generated: ${dateStr} at ${timeStr}`, 14, 25);

    // Applied filters summary
    const statusFilter = document.getElementById('statusFilter')?.value || 'all';
    const dateFilter = document.getElementById('dateFilter')?.value || 'all';
    const searchTerm = document.getElementById('orderSearchInput')?.value || '';
    let filterParts = [];
    if (statusFilter !== 'all') filterParts.push(`Status: ${getStatusText(statusFilter)}`);
    if (dateFilter !== 'all') filterParts.push(`Date: ${dateFilter}`);
    if (searchTerm) filterParts.push(`Search: "${searchTerm}"`);
    if (filterParts.length > 0) {
        doc.text(`Filters: ${filterParts.join(' | ')}`, 14, 31);
    }

    // KPI summary line
    doc.setTextColor(0);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    const kpiY = filterParts.length > 0 ? 37 : 31;
    doc.text(
        `Pending: ${kpiCounts.pending || 0}   |   Confirmed: ${kpiCounts.confirmed || 0}   |   Out for Delivery: ${kpiCounts.out_for_delivery || 0}   |   Active: ${kpiCounts.active || 0}   |   Total shown: ${dataToExport.length}`,
        14, kpiY
    );

    // --- Table ---
    const tableRows = dataToExport.map(order => {
        const itemNames = order.items.length === 0
            ? 'No items'
            : order.items.map(i => i.name).join(', ');
        const totalItems = order.items.reduce((sum, i) => sum + i.quantity, 0);
        const dateRange = `${formatDate(order.dates.start)} - ${formatDate(order.dates.end)} (${order.dates.duration}d)`;
        return [
            order.id,
            order.customer.name,
            order.customer.email,
            itemNames,
            totalItems,
            dateRange,
            formatCurrency(order.total),
            getStatusText(order.status)
        ];
    });

    doc.autoTable({
        startY: kpiY + 5,
        head: [['Order ID', 'Customer', 'Email', 'Items', 'Qty', 'Dates', 'Total', 'Status']],
        body: tableRows,
        theme: 'grid',
        styles: {
            fontSize: 8,
            cellPadding: 3,
            overflow: 'linebreak',
            lineColor: [220, 220, 220],
            lineWidth: 0.25
        },
        headStyles: {
            fillColor: [41, 98, 255],
            textColor: [255, 255, 255],
            fontStyle: 'bold',
            fontSize: 8.5
        },
        alternateRowStyles: {
            fillColor: [248, 249, 250]
        },
        columnStyles: {
            0: { cellWidth: 25 },
            1: { cellWidth: 35 },
            2: { cellWidth: 45 },
            3: { cellWidth: 60 },
            4: { cellWidth: 15, halign: 'center' },
            5: { cellWidth: 40 },
            6: { cellWidth: 25, halign: 'right' },
            7: { cellWidth: 30, halign: 'center' }
        },
        didParseCell: function(data) {
            // Color-code the Status column
            if (data.section === 'body' && data.column.index === 7) {
                const status = data.cell.raw.toLowerCase();
                if (status.includes('pending')) {
                    data.cell.styles.textColor = [180, 130, 0];
                    data.cell.styles.fontStyle = 'bold';
                } else if (status.includes('confirmed')) {
                    data.cell.styles.textColor = [0, 128, 0];
                    data.cell.styles.fontStyle = 'bold';
                } else if (status.includes('active')) {
                    data.cell.styles.textColor = [41, 98, 255];
                    data.cell.styles.fontStyle = 'bold';
                } else if (status.includes('late')) {
                    data.cell.styles.textColor = [200, 0, 0];
                    data.cell.styles.fontStyle = 'bold';
                } else if (status.includes('cancelled')) {
                    data.cell.styles.textColor = [150, 150, 150];
                }
            }
        }
    });

    // --- Footer on every page ---
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(
            `Page ${i} of ${pageCount}  |  RentIt Admin`,
            doc.internal.pageSize.getWidth() / 2,
            doc.internal.pageSize.getHeight() - 8,
            { align: 'center' }
        );
    }

    // --- Save ---
    const filename = `RentIt_Orders_${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}.pdf`;
    doc.save(filename);
}

/**
 * Initialize page
 */
document.addEventListener('DOMContentLoaded', function() {
    // Fetch orders from API
    fetchOrders();

    // Search input handler
    const searchInput = document.getElementById('orderSearchInput');
    if (searchInput) {
        let debounceTimer;
        searchInput.addEventListener('input', () => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(filterOrders, 300);
        });
    }

    // Filter change handlers
    document.getElementById('statusFilter')?.addEventListener('change', filterOrders);
    document.getElementById('dateFilter')?.addEventListener('change', filterOrders);

    // Refresh button
    document.getElementById('refreshOrdersBtn')?.addEventListener('click', () => {
        const btn = document.getElementById('refreshOrdersBtn');
        btn.disabled = true;
        btn.innerHTML = `
            <svg class="spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                <polyline points="23 4 23 10 17 10"/>
                <polyline points="1 20 1 14 7 14"/>
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
            </svg>
            Refreshing...`;
        fetchOrders().finally(() => {
            btn.disabled = false;
            btn.innerHTML = `
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                    <polyline points="23 4 23 10 17 10"/>
                    <polyline points="1 20 1 14 7 14"/>
                    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
                </svg>
                Refresh`;
        });
    });

    // Pagination buttons
    document.getElementById('prevPageBtn')?.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            renderOrders(filteredOrdersData);
        }
    });
    document.getElementById('nextPageBtn')?.addEventListener('click', () => {
        const totalPages = Math.ceil(filteredOrdersData.length / PAGE_SIZE);
        if (currentPage < totalPages) {
            currentPage++;
            renderOrders(filteredOrdersData);
        }
    });

    // Export button — generates PDF
    document.getElementById('exportOrdersBtn')?.addEventListener('click', () => {
        exportOrdersToPDF();
    });
});
