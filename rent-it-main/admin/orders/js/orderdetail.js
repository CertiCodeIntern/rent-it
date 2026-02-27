/**
 * =====================================================
 * ORDER DETAIL PAGE - JavaScript Module
 * Handles order detail display and actions
 * =====================================================
 */

// Store order data from API
let orderData = null;

// Resolve absolute URLs based on the current base tag or window origin
const baseHref = document.querySelector('base')?.href || `${window.location.origin}/`;
console.log('[OrderDetail] Base href:', baseHref);

function buildUrl(path) {
    const normalizedPath = path.startsWith('/') ? path.slice(1) : path;
    const url = new URL(normalizedPath, baseHref).toString();
    console.log('[OrderDetail] Built URL:', url);
    return url;
}

/**
 * Get order ID from URL
 */
function getOrderIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id') || null;
    console.log('[OrderDetail] Order ID from URL:', id);
    return id;
}

/**
 * Fetch order details from API
 */
async function fetchOrderDetail(orderId) {
    console.log('[OrderDetail] Fetching order:', orderId);
    try {
        const apiUrl = buildUrl(`admin/api/get_order.php?id=${orderId}`);
        console.log('[OrderDetail] API URL:', apiUrl);
        const response = await fetch(apiUrl);
        console.log('[OrderDetail] Response status:', response.status);
        const result = await response.json();
        console.log('[OrderDetail] API result:', result);
        
        if (result.success) {
            orderData = result.data;
            console.log('[OrderDetail] Order data:', orderData);
            displayOrderDetail(orderData);
        } else {
            console.error('Failed to fetch order:', result.message);
            showOrderNotFound();
        }
    } catch (error) {
        console.error('Error fetching order:', error);
        showOrderNotFound();
    }
}

/**
 * Show order not found message
 */
function showOrderNotFound() {
    document.querySelector('.order-detail-grid').innerHTML = `
        <div class="detail-card" style="grid-column: 1 / -1; text-align: center; padding: 3rem;">
            <h2>Order Not Found</h2>
            <p>The order you are looking for does not exist or has been removed.</p>
            <a href="admin/orders/orders.php" class="btn btn-primary" style="margin-top: 1rem;">Back to Orders</a>
        </div>
    `;
}

/**
 * Display order detail
 */
function displayOrderDetail(order) {
    populateHeader(order);
    populateCustomer(order.customer);
    populateItems(order.items, order.dates.duration);
    populateDelivery(order.delivery, order.dates);
    populatePayment(order.payment);
    populateTimeline(order.timeline);
    populateStatusAction(order.status);
    populateNotes(order.notes);
}

/**
 * Format date for display
 */
function formatDate(dateStr, includeTime = false) {
    if (!dateStr) return 'Pending';
    const date = new Date(dateStr);
    const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric'
    };
    if (includeTime) {
        options.hour = 'numeric';
        options.minute = '2-digit';
        options.hour12 = true;
    }
    return date.toLocaleDateString('en-US', options);
}

/**
 * Format short date
 */
function formatShortDate(dateStr) {
    if (!dateStr) return 'Pending';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

/**
 * Format time
 */
function formatTime(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

/**
 * Format currency
 */
function formatCurrency(amount) {
    return '₱' + amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
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
 * Get initial for avatar
 */
function getInitial(name) {
    return name?.charAt(0)?.toUpperCase() || '?';
}

/**
 * Populate order header
 */
function populateHeader(order) {
    document.getElementById('orderIdTitle').textContent = order.id;
    document.getElementById('orderStatusBadge').textContent = getStatusText(order.status);
    document.getElementById('orderStatusBadge').className = `status-badge ${order.status}`;
    document.getElementById('orderDate').textContent = `Placed on ${formatDate(order.dates.ordered, true)}`;

    // Populate action buttons based on status
    const actionsContainer = document.getElementById('orderActions');
    let actionsHtml = '';

    switch (order.status) {
        case 'pending':
            actionsHtml = `
                <button class="btn btn-secondary" onclick="cancelOrder()">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                        <circle cx="12" cy="12" r="10"/>
                        <line x1="15" y1="9" x2="9" y2="15"/>
                        <line x1="9" y1="9" x2="15" y2="15"/>
                    </svg>
                    Cancel Order
                </button>
                <button class="btn btn-primary" onclick="confirmOrder()">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                        <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    Confirm Order
                </button>
            `;
            break;
        case 'confirmed':
            actionsHtml = `
                <button class="btn btn-primary" onclick="dispatchOrder()">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                        <rect x="1" y="3" width="15" height="13"/>
                        <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
                        <circle cx="5.5" cy="18.5" r="2.5"/>
                        <circle cx="18.5" cy="18.5" r="2.5"/>
                    </svg>
                    Dispatch Order
                </button>
            `;
            break;
        case 'out_for_delivery':
            actionsHtml = `
                <button class="btn btn-primary" onclick="markDelivered()">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                        <polyline points="22 4 12 14.01 9 11.01"/>
                    </svg>
                    Mark as Delivered
                </button>
            `;
            break;
        case 'returned':
            actionsHtml = `
                <button class="btn btn-primary" onclick="markCompleted()">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                        <polyline points="22 4 12 14.01 9 11.01"/>
                    </svg>
                    Mark Completed
                </button>
            `;
            break;
        case 'late':
            actionsHtml = `
                <button class="btn btn-primary" onclick="markReturned()">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                        <polyline points="22 4 12 14.01 9 11.01"/>
                    </svg>
                    Mark Returned
                </button>
            `;
            break;
        default:
            actionsHtml = `
                <button class="btn btn-secondary" onclick="printOrder()">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                        <polyline points="6 9 6 2 18 2 18 9"/>
                        <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
                        <rect x="6" y="14" width="12" height="8"/>
                    </svg>
                    Print
                </button>
            `;
    }

    actionsContainer.innerHTML = actionsHtml;
}

/**
 * Populate customer information
 */
function populateCustomer(customer) {
    console.log('[OrderDetail] Populating customer:', customer);
    document.getElementById('customerAvatar').textContent = getInitial(customer.name);
    document.getElementById('customerName').textContent = customer.name;
    document.getElementById('customerEmail').textContent = customer.email;
    document.getElementById('customerPhone').textContent = customer.phone;
    console.log('[OrderDetail] Customer populated successfully');
}

/**
 * Populate rental items
 */
function populateItems(items, duration) {
    const listContainer = document.getElementById('rentalItemsList');
    document.getElementById('itemCountBadge').textContent = `${items.length} item${items.length !== 1 ? 's' : ''}`;

    if (!items || items.length === 0) {
        listContainer.innerHTML = `
            <div class="rental-items-empty">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="40" height="40">
                    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                    <line x1="3" y1="6" x2="21" y2="6"/>
                    <path d="M16 10a4 4 0 0 1-8 0"/>
                </svg>
                <p class="rental-items-empty-title">No items in this order</p>
                <p class="rental-items-empty-text">This order has no rental items associated with it</p>
            </div>
        `;
        return;
    }

    const itemsHtml = items.map(item => `
        <div class="rental-item">
            <div class="rental-item-image">
                ${item.image 
                    ? `<img src="${item.image}" alt="${item.name}" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"><div class="img-fallback" style="display:none"><svg viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' width='24' height='24'><rect x='3' y='3' width='18' height='18' rx='2' ry='2'/><circle cx='8.5' cy='8.5' r='1.5'/><polyline points='21 15 16 10 5 21'/></svg></div>` 
                    : `<div class="img-fallback"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="24" height="24">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                        <circle cx="8.5" cy="8.5" r="1.5"/>
                        <polyline points="21 15 16 10 5 21"/>
                    </svg></div>`
                }
            </div>
            <div class="rental-item-info">
                <div class="rental-item-name">${item.name}</div>
                <div class="rental-item-category">${item.category}</div>
                <div class="rental-item-meta">
                    <span>Qty: ${item.quantity}</span>
                    <span>${duration} day${duration !== 1 ? 's' : ''}</span>
                </div>
            </div>
            <div class="rental-item-price">
                <div class="rental-item-rate">${formatCurrency(item.dailyRate)}/day</div>
                <div class="rental-item-total">Total: ${formatCurrency(item.subtotal)}</div>
            </div>
        </div>
    `).join('');

    listContainer.innerHTML = itemsHtml;
}

/**
 * Populate delivery information
 */
function populateDelivery(delivery, dates) {
    document.getElementById('deliveryMethod').textContent = delivery.method;
    document.getElementById('deliveryAddress').textContent = delivery.address;
    document.getElementById('deliverySchedule').textContent = `${formatShortDate(delivery.scheduledDate)}`;
    document.getElementById('driverName').textContent = 'Not Assigned';
    document.getElementById('deliveryNotes').textContent = 'No special instructions';
}

/**
 * Populate payment summary
 */
function populatePayment(payment) {
    const paymentBadge = document.getElementById('paymentBadge');
    paymentBadge.textContent = payment.status.charAt(0).toUpperCase() + payment.status.slice(1);
    paymentBadge.className = `payment-badge ${payment.status}`;

    const paymentRowsHtml = `
        <div class="payment-row">
            <span class="label">Subtotal</span>
            <span class="value">${formatCurrency(payment.subtotal)}</span>
        </div>
        <div class="payment-row">
            <span class="label">Tax (12%)</span>
            <span class="value">${formatCurrency(payment.tax)}</span>
        </div>
        <div class="payment-row">
            <span class="label">Delivery Fee</span>
            <span class="value">${formatCurrency(payment.deliveryFee)}</span>
        </div>
        <div class="payment-row">
            <span class="label">Security Deposit</span>
            <span class="value">${formatCurrency(payment.deposit)}</span>
        </div>
        ${payment.discount > 0 ? `
        <div class="payment-row discount">
            <span class="label">Discount</span>
            <span class="value">-${formatCurrency(payment.discount)}</span>
        </div>
        ` : ''}
    `;

    document.getElementById('paymentRows').innerHTML = paymentRowsHtml;
    document.getElementById('paymentTotal').textContent = formatCurrency(payment.total);
    document.getElementById('paymentMethodText').textContent = payment.method;
}

/**
 * Populate order timeline
 */
function populateTimeline(timeline) {
    const timelineContainer = document.getElementById('orderTimeline');

    const timelineHtml = timeline.map(item => `
        <div class="timeline-item ${item.completed ? 'completed' : ''} ${item.current ? 'current' : ''}">
            <div class="timeline-icon">
                ${item.completed ? `
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                        <polyline points="20 6 9 17 4 12"/>
                    </svg>
                ` : item.current ? `
                    <svg viewBox="0 0 24 24" fill="currentColor">
                        <circle cx="12" cy="12" r="4"/>
                    </svg>
                ` : ''}
            </div>
            <div class="timeline-content">
                <div class="timeline-title">${item.event}</div>
                <div class="timeline-date">${item.date ? formatDate(item.date, true) : 'Pending'}</div>
            </div>
        </div>
    `).join('');

    timelineContainer.innerHTML = timelineHtml;
}

/**
 * Populate status action button
 */
function populateStatusAction(status) {
    const actionContainer = document.getElementById('statusActionContainer');
    if (!actionContainer) return;

    let actionHtml = '';

    switch (status) {
        case 'pending':
            actionHtml = `<button class="btn btn-primary" onclick="confirmOrder()">Confirm Order</button>`;
            break;
        case 'confirmed':
            actionHtml = `<button class="btn btn-primary" onclick="dispatchOrder()">Schedule Dispatch</button>`;
            break;
        case 'out_for_delivery':
            actionHtml = `<button class="btn btn-primary" onclick="markDelivered()">Mark Delivered</button>`;
            break;
        case 'active':
            actionHtml = `<button class="btn btn-secondary" onclick="scheduleReturn()">Schedule Return</button>`;
            break;
        case 'return_scheduled':
            actionHtml = `<button class="btn btn-primary" onclick="markReturned()">Mark Returned</button>`;
            break;
        case 'returned':
            actionHtml = `<button class="btn btn-primary" onclick="markCompleted()">Mark Completed</button>`;
            break;
        case 'late':
            actionHtml = `<button class="btn btn-primary" onclick="markReturned()">Mark Returned</button>`;
            break;
    }

    actionContainer.innerHTML = actionHtml;
}

/**
 * Populate notes
 */
function populateNotes(notes) {
    const notesContainer = document.getElementById('notesList');

    if (notes.length === 0) {
        notesContainer.innerHTML = '<div class="notes-empty">No notes yet</div>';
        return;
    }

    const notesHtml = notes.map(note => `
        <div class="note-item">
            <div class="note-header">
                <span class="note-author">${note.author}</span>
                <span class="note-date">${formatDate(note.date, true)}</span>
            </div>
            <p class="note-text">${note.text}</p>
        </div>
    `).join('');

    notesContainer.innerHTML = notesHtml;
}

/**
 * Action handlers - API-based
 */
async function confirmOrder() {
    if (!orderData) return;
    
    if (confirm('Confirm this order?')) {
        try {
            const response = await fetch(buildUrl('admin/api/update_order_status.php'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ order_id: orderData.order_id, status: 'Booked' })
            });
            
            const result = await response.json();
            if (result.success) {
                alert('Order confirmed successfully!');
                fetchOrderDetail(orderData.order_id);
            } else {
                alert('Failed to confirm order: ' + result.message);
            }
        } catch (error) {
            console.error('Error confirming order:', error);
            alert('Error confirming order');
        }
    }
}

async function cancelOrder() {
    if (!orderData) return;
    
    if (confirm('Are you sure you want to cancel this order?')) {
        try {
            const response = await fetch(buildUrl('admin/api/update_order_status.php'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ order_id: orderData.order_id, status: 'Cancelled' })
            });
            
            const result = await response.json();
            if (result.success) {
                alert('Order cancelled.');
                fetchOrderDetail(orderData.order_id);
            } else {
                alert('Failed to cancel order: ' + result.message);
            }
        } catch (error) {
            console.error('Error cancelling order:', error);
            alert('Error cancelling order');
        }
    }
}

async function dispatchOrder() {
    if (!orderData) return;
    
    if (confirm('Mark this order as dispatched?')) {
        try {
            const response = await fetch(buildUrl('admin/api/update_order_status.php'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ order_id: orderData.order_id, status: 'In Transit' })
            });
            
            const result = await response.json();
            if (result.success) {
                alert('Order dispatched!');
                fetchOrderDetail(orderData.order_id);
            } else {
                alert('Failed to dispatch order: ' + result.message);
            }
        } catch (error) {
            console.error('Error dispatching order:', error);
            alert('Error dispatching order');
        }
    }
}

async function markDelivered() {
    if (!orderData) return;
    
    if (confirm('Mark this order as delivered?')) {
        try {
            const response = await fetch(buildUrl('admin/api/update_order_status.php'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ order_id: orderData.order_id, status: 'Active' })
            });
            
            const result = await response.json();
            if (result.success) {
                alert('Order marked as delivered!');
                fetchOrderDetail(orderData.order_id);
            } else {
                alert('Failed to update order: ' + result.message);
            }
        } catch (error) {
            console.error('Error updating order:', error);
            alert('Error updating order');
        }
    }
}

async function scheduleReturn() {
    if (!orderData) return;
    
    if (confirm('Mark this order as pending return?')) {
        try {
            const response = await fetch(buildUrl('admin/api/update_order_status.php'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ order_id: orderData.order_id, status: 'Pending Return' })
            });
            
            const result = await response.json();
            if (result.success) {
                alert('Return scheduled!');
                fetchOrderDetail(orderData.order_id);
            } else {
                alert('Failed to schedule return: ' + result.message);
            }
        } catch (error) {
            console.error('Error scheduling return:', error);
            alert('Error scheduling return');
        }
    }
}

async function markReturned() {
    if (!orderData) return;
    
    if (confirm('Mark this order as returned?')) {
        try {
            const response = await fetch(buildUrl('admin/api/update_order_status.php'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ order_id: orderData.order_id, status: 'Returned' })
            });
            
            const result = await response.json();
            if (result.success) {
                alert('Order marked as returned!');
                fetchOrderDetail(orderData.order_id);
            } else {
                alert('Failed to mark as returned: ' + result.message);
            }
        } catch (error) {
            console.error('Error marking as returned:', error);
            alert('Error marking as returned');
        }
    }
}

async function markCompleted() {
    if (!orderData) return;
    
    if (confirm('Mark this order as completed?')) {
        try {
            const response = await fetch(buildUrl('admin/api/update_order_status.php'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ order_id: orderData.order_id, status: 'Completed' })
            });
            
            const result = await response.json();
            if (result.success) {
                alert('Order completed!');
                fetchOrderDetail(orderData.order_id);
            } else {
                alert('Failed to complete order: ' + result.message);
            }
        } catch (error) {
            console.error('Error completing order:', error);
            alert('Error completing order');
        }
    }
}

function printOrder() {
    window.print();
}

/**
 * Initialize page
 */
console.log('[OrderDetail] Script loaded');
document.addEventListener('DOMContentLoaded', function() {
    console.log('[OrderDetail] DOM loaded, initializing...');
    const orderId = getOrderIdFromUrl();
    
    if (orderId) {
        fetchOrderDetail(orderId);
    } else {
        console.warn('[OrderDetail] No order ID in URL');
        showOrderNotFound();
    }

    // Add note button handler
    document.getElementById('addNoteBtn')?.addEventListener('click', () => {
        const note = prompt('Enter note:');
        if (note && orderData) {
            orderData.notes.push({
                author: 'Admin',
                date: new Date().toISOString(),
                text: note
            });
            populateNotes(orderData.notes);
        }
    });
});
