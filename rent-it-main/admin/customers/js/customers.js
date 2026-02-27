/**
 * =====================================================
 * CUSTOMERS PAGE - JavaScript Module
 * Handles customer list display, filtering, and actions
 * =====================================================
 */

// Customer data loaded from API
let customersData = [];
let filteredCustomersData = [];
let apiStats = {
    totalCustomers: 0,
    activeBookings: 0,
    overdueReturns: 0,
    monthlyRevenue: 0
};

// Pagination state
let currentPage = 1;
const PAGE_SIZE = 10;

/**
 * Fetch customers from API
 */
async function fetchCustomers() {
    try {
        const response = await fetch('admin/api/get_customers.php');
        const data = await response.json();
        
        if (data.success) {
            customersData = data.customers;
            apiStats = data.stats;
            return true;
        } else {
            console.error('Failed to fetch customers:', data.message);
            return false;
        }
    } catch (error) {
        console.error('Error fetching customers:', error);
        return false;
    }
}

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
        'active': 'Active',
        'overdue': 'Overdue',
        'pending': 'Pending',
        'returned': 'Returned',
        'completed': 'Completed'
    };
    return statusMap[status] || status;
}

/**
 * Get payment display text
 */
function getPaymentText(payment) {
    const paymentMap = {
        'paid': 'Paid',
        'pending': 'Pending',
        'partial': 'Partial',
        'overdue': 'Overdue'
    };
    return paymentMap[payment] || payment;
}

/**
 * Format date for display
 */
function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/**
 * Render customer row
 */
function renderCustomerRow(customer) {
    const initial = getInitial(customer.name);
    const booking = customer.booking;
    const bookings = customer.bookings || [];
    const hasMultipleBookings = bookings.length > 1;
    
    // Handle customers without bookings
    let itemsText = 'No bookings';
    let bookingId = '-';
    let bookingIdHtml = '<span class="no-booking">-</span>';
    let dateRangeHtml = '<span class="no-booking">-</span>';
    let durationText = '';
    let statusHtml = '<span class="status-badge inactive">No Rentals</span>';
    let paymentHtml = '<span class="payment-badge none">-</span>';
    let actionsHtml = '';
    
    if (hasMultipleBookings) {
        // Multiple bookings - show dropdown
        const defaultBooking = bookings[0];
        const dropdownOptions = bookings.map(b => 
            `<option value="${b.order_id}" data-booking='${JSON.stringify(b).replace(/'/g, "&#39;")}'>${b.id}</option>`
        ).join('');
        
        bookingIdHtml = `<select class="booking-dropdown" onchange="onBookingSelect(this, '${customer.id}')" data-customer-id="${customer.id}">${dropdownOptions}</select>`;
        
        // Show default (first) booking details
        itemsText = getBookingItemsText(defaultBooking);
        dateRangeHtml = getBookingDateHtml(defaultBooking);
        durationText = getBookingDurationText(defaultBooking);
        statusHtml = `<span class="status-badge ${defaultBooking.status}">${getStatusText(defaultBooking.status)}</span>`;
        paymentHtml = `<span class="payment-badge ${defaultBooking.payment}">${getPaymentText(defaultBooking.payment)}</span>`;
        actionsHtml = getBookingActionsHtml(defaultBooking, customer);
    } else if (booking && booking.items && booking.items.length > 0) {
        itemsText = booking.items.length === 1 
            ? booking.items[0] 
            : `${booking.items[0]} +${booking.items.length - 1} more`;
        bookingId = booking.id;
        bookingIdHtml = `<a href="admin/orders/orderdetail.php?id=${booking.order_id}" class="booking-id">${booking.id}</a>`;
        dateRangeHtml = `<span class="date-range">${formatDate(booking.startDate)} - ${formatDate(booking.endDate)}</span>`;
        durationText = `${booking.duration} day${booking.duration !== 1 ? 's' : ''}`;
        statusHtml = `<span class="status-badge ${booking.status}">${getStatusText(booking.status)}</span>`;
        paymentHtml = `<span class="payment-badge ${booking.payment}">${getPaymentText(booking.payment)}</span>`;
    } else if (booking) {
        bookingIdHtml = `<a href="admin/orders/orderdetail.php?id=${booking.order_id}" class="booking-id">${booking.id}</a>`;
        if (booking.startDate && booking.endDate) {
            dateRangeHtml = `<span class="date-range">${formatDate(booking.startDate)} - ${formatDate(booking.endDate)}</span>`;
            durationText = `${booking.duration} day${booking.duration !== 1 ? 's' : ''}`;
        }
        statusHtml = `<span class="status-badge ${booking.status}">${getStatusText(booking.status)}</span>`;
        paymentHtml = `<span class="payment-badge ${booking.payment}">${getPaymentText(booking.payment)}</span>`;
    }
    
    const itemCountText = hasMultipleBookings 
        ? (bookings[0].totalItems ? `${bookings[0].totalItems} item${bookings[0].totalItems !== 1 ? 's' : ''}` : '')
        : (booking?.totalItems ? `${booking.totalItems} item${booking.totalItems !== 1 ? 's' : ''}` : '');
    
    // Build actions HTML for non-dropdown case
    if (!hasMultipleBookings) {
        actionsHtml = `
            <div class="actions-cell">
                ${booking ? `<button class="action-btn view" title="View details" onclick="viewCustomer('${customer.id}')">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
                    </svg>
                </button>` : ''}
                <button class="action-btn email" title="Send email" onclick="sendEmail('${customer.email}')">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                        <polyline points="22,6 12,13 2,6"/>
                    </svg>
                </button>
                <button class="action-btn call" title="Show phone number" onclick="toggleCustomerPhone(this, '${customer.phone}')">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                    </svg>
                </button>
            </div>
        `;
    }
    
    return `
        <tr data-customer-id="${customer.id}">
            <td>
                <div class="customer-cell">
                    <div class="customer-avatar">
                        ${customer.avatar 
                            ? `<img src="${customer.avatar}" alt="${customer.name}" onerror="this.style.display='none';this.parentElement.textContent='${initial}'">` 
                            : initial}
                    </div>
                    <div class="customer-info">
                        <span class="customer-name">${customer.name}</span>
                        <span class="customer-email">${customer.email}</span>
                    </div>
                </div>
            </td>
            <td>
                ${bookingIdHtml}
            </td>
            <td data-cell="items">
                <div class="items-cell">
                    <span class="item-name">${itemsText}</span>
                    ${itemCountText ? `<span class="item-count">${itemCountText}</span>` : ''}
                </div>
            </td>
            <td data-cell="dates">
                <div class="dates-cell">
                    ${dateRangeHtml}
                    ${durationText ? `<span class="date-duration">${durationText}</span>` : ''}
                </div>
            </td>
            <td data-cell="status">
                ${statusHtml}
            </td>
            <td data-cell="payment">
                ${paymentHtml}
            </td>
            <td data-cell="actions">
                ${actionsHtml}
            </td>
        </tr>
    `;
}

/**
 * Helper: Get items text from a booking object
 */
function getBookingItemsText(booking) {
    if (!booking || !booking.items || booking.items.length === 0) return 'No items';
    return booking.items.length === 1 
        ? booking.items[0] 
        : `${booking.items[0]} +${booking.items.length - 1} more`;
}

/**
 * Helper: Get date HTML from a booking object
 */
function getBookingDateHtml(booking) {
    if (!booking || !booking.startDate || !booking.endDate) return '<span class="no-booking">-</span>';
    return `<span class="date-range">${formatDate(booking.startDate)} - ${formatDate(booking.endDate)}</span>`;
}

/**
 * Helper: Get duration text from a booking object
 */
function getBookingDurationText(booking) {
    if (!booking || !booking.duration) return '';
    return `${booking.duration} day${booking.duration !== 1 ? 's' : ''}`;
}

/**
 * Helper: Get actions HTML for a booking with dropdown
 */
function getBookingActionsHtml(booking, customer) {
    return `
        <div class="actions-cell">
            <button class="action-btn view" title="View details" onclick="window.location.href='admin/orders/orderdetail.php?id=${booking.order_id}'">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                </svg>
            </button>
            <button class="action-btn email" title="Send email" onclick="sendEmail('${customer.email}')">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                </svg>
            </button>
            <button class="action-btn call" title="Show phone number" onclick="toggleCustomerPhone(this, '${customer.phone}')">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
            </button>
        </div>
    `;
}

/**
 * Handle booking dropdown selection - updates Items, Rental Period, Status, Payment, Actions columns
 */
function onBookingSelect(selectEl, customerId) {
    const selectedOption = selectEl.options[selectEl.selectedIndex];
    const bookingData = JSON.parse(selectedOption.getAttribute('data-booking'));
    const row = selectEl.closest('tr');
    const customer = customersData.find(c => c.id === customerId);
    
    if (!row || !bookingData) return;
    
    // Update Items column
    const itemsCell = row.querySelector('[data-cell="items"]');
    if (itemsCell) {
        const itemsText = getBookingItemsText(bookingData);
        const itemCountText = bookingData.totalItems ? `${bookingData.totalItems} item${bookingData.totalItems !== 1 ? 's' : ''}` : '';
        itemsCell.innerHTML = `
            <div class="items-cell">
                <span class="item-name">${itemsText}</span>
                ${itemCountText ? `<span class="item-count">${itemCountText}</span>` : ''}
            </div>
        `;
    }
    
    // Update Rental Period column
    const datesCell = row.querySelector('[data-cell="dates"]');
    if (datesCell) {
        const dateRangeHtml = getBookingDateHtml(bookingData);
        const durationText = getBookingDurationText(bookingData);
        datesCell.innerHTML = `
            <div class="dates-cell">
                ${dateRangeHtml}
                ${durationText ? `<span class="date-duration">${durationText}</span>` : ''}
            </div>
        `;
    }
    
    // Update Status column
    const statusCell = row.querySelector('[data-cell="status"]');
    if (statusCell) {
        statusCell.innerHTML = `<span class="status-badge ${bookingData.status}">${getStatusText(bookingData.status)}</span>`;
    }
    
    // Update Payment column
    const paymentCell = row.querySelector('[data-cell="payment"]');
    if (paymentCell) {
        paymentCell.innerHTML = `<span class="payment-badge ${bookingData.payment}">${getPaymentText(bookingData.payment)}</span>`;
    }
    
    // Update Actions column
    const actionsCell = row.querySelector('[data-cell="actions"]');
    if (actionsCell && customer) {
        actionsCell.innerHTML = getBookingActionsHtml(bookingData, customer);
    }
}

/**
 * Render all customers with pagination
 */
function renderCustomers(customers) {
    const tbody = document.getElementById('customersTableBody');
    if (!tbody) return;

    filteredCustomersData = customers;

    if (customers.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7">
                    <div class="customers-empty">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                            <circle cx="9" cy="7" r="4"/>
                            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                        </svg>
                        <h3 class="customers-empty-title">No customers found</h3>
                        <p class="customers-empty-text">Try adjusting your search or filter criteria</p>
                    </div>
                </td>
            </tr>
        `;
        updateCustomersPagination(0);
        return;
    }

    // Paginate
    const totalPages = Math.ceil(customers.length / PAGE_SIZE);
    if (currentPage > totalPages) currentPage = totalPages;
    if (currentPage < 1) currentPage = 1;
    const start = (currentPage - 1) * PAGE_SIZE;
    const pageCustomers = customers.slice(start, start + PAGE_SIZE);

    tbody.innerHTML = pageCustomers.map(customer => renderCustomerRow(customer)).join('');
    updateCustomersPagination(customers.length);
}

/**
 * Update pagination controls
 */
function updateCustomersPagination(totalItems) {
    const paginationContainer = document.querySelector('.customers-pagination');
    if (!paginationContainer) return;

    if (totalItems === 0) {
        paginationContainer.style.display = 'none';
        return;
    }
    paginationContainer.style.display = 'flex';

    const totalPages = Math.ceil(totalItems / PAGE_SIZE);
    const start = (currentPage - 1) * PAGE_SIZE + 1;
    const end = Math.min(currentPage * PAGE_SIZE, totalItems);

    const info = paginationContainer.querySelector('.pagination-info');
    if (info) info.textContent = `Showing ${start}-${end} of ${totalItems} customers`;

    const prevBtn = document.getElementById('prevPageBtn');
    const nextBtn = document.getElementById('nextPageBtn');
    if (prevBtn) prevBtn.disabled = currentPage <= 1;
    if (nextBtn) nextBtn.disabled = currentPage >= totalPages;

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
            return `<button class="page-btn ${p === currentPage ? 'active' : ''}" onclick="goToCustomerPage(${p})">${p}</button>`;
        }).join('');
    }
}

/**
 * Go to specific page
 */
function goToCustomerPage(page) {
    currentPage = page;
    renderCustomers(filteredCustomersData);
}

/**
 * Update KPI counts from API stats
 */
function updateKPICounts() {
    document.getElementById('activeBookingsCount').textContent = apiStats.activeBookings.toLocaleString();
    document.getElementById('overdueReturnsCount').textContent = apiStats.overdueReturns.toLocaleString();
    document.getElementById('monthlyRevenueValue').textContent = '₱' + apiStats.monthlyRevenue.toLocaleString();
    document.getElementById('totalCustomersCount').textContent = apiStats.totalCustomers.toLocaleString();
}

/**
 * Filter customers based on search and filter selections
 */
function filterCustomers() {
    const searchTerm = document.getElementById('customerSearchInput')?.value.toLowerCase() || '';
    const statusFilter = document.getElementById('statusFilter')?.value || 'all';
    const sortFilter = document.getElementById('sortFilter')?.value || 'recent';

    let filtered = [...customersData];

    // Apply search filter
    if (searchTerm) {
        filtered = filtered.filter(customer => {
            const nameMatch = customer.name.toLowerCase().includes(searchTerm);
            const emailMatch = customer.email.toLowerCase().includes(searchTerm);
            const bookingIdMatch = customer.booking?.id?.toLowerCase().includes(searchTerm);
            const allBookingIdsMatch = customer.bookings?.some(b => b.id?.toLowerCase().includes(searchTerm));
            const itemsMatch = customer.booking?.items?.some(item => item.toLowerCase().includes(searchTerm));
            const allItemsMatch = customer.bookings?.some(b => b.items?.some(item => item.toLowerCase().includes(searchTerm)));
            return nameMatch || emailMatch || bookingIdMatch || allBookingIdsMatch || itemsMatch || allItemsMatch;
        });
    }

    // Apply status filter
    if (statusFilter !== 'all') {
        switch (statusFilter) {
            case 'active':
                filtered = filtered.filter(c => c.booking?.status === 'active');
                break;
            case 'overdue':
                filtered = filtered.filter(c => c.booking?.status === 'overdue');
                break;
            case 'inactive':
                filtered = filtered.filter(c => 
                    !c.booking || c.booking.status === 'completed' || c.booking.status === 'returned' || c.booking.status === 'inactive'
                );
                break;
        }
    }

    // Apply sort
    switch (sortFilter) {
        case 'name':
            filtered.sort((a, b) => a.name.localeCompare(b.name));
            break;
        case 'bookings':
            filtered.sort((a, b) => (b.stats?.totalRentals || 0) - (a.stats?.totalRentals || 0));
            break;
        case 'revenue':
            filtered.sort((a, b) => (b.stats?.totalSpent || 0) - (a.stats?.totalSpent || 0));
            break;
        default: // recent
            filtered.sort((a, b) => {
                const dateA = a.booking?.startDate ? new Date(a.booking.startDate) : new Date(0);
                const dateB = b.booking?.startDate ? new Date(b.booking.startDate) : new Date(0);
                return dateB - dateA;
            });
    }

    currentPage = 1;
    renderCustomers(filtered);
}

/**
 * View customer details
 */
function viewCustomer(customerId) {
    const customer = customersData.find(c => c.id === customerId);
    if (customer && customer.booking) {
        window.location.href = `admin/orders/orderdetail.php?id=${customer.booking.order_id}`;
    }
}

/**
 * Show email modal for customer
 */
function sendEmail(email, customerName = '') {
    // Find customer data
    const customer = customersData.find(c => c.email === email);
    const name = customerName || customer?.name || 'Customer';
    
    showEmailModal({
        to: email,
        customerName: name,
        subject: '',
        message: ''
    });
}

/**
 * Show email modal
 */
function showEmailModal(data) {
    // Remove existing modal
    document.querySelector('.email-modal-backdrop')?.remove();

    const backdrop = document.createElement('div');
    backdrop.className = 'email-modal-backdrop';
    backdrop.innerHTML = `
        <div class="email-modal">
            <div class="email-modal-header">
                <h3 class="email-modal-title">
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                        <polyline points="22,6 12,13 2,6"/>
                    </svg>
                    Send Email
                </h3>
                <button class="email-modal-close" title="Close">
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"/>
                        <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                </button>
            </div>
            <div class="email-modal-body">
                <div class="email-form-group">
                    <label class="email-form-label">To</label>
                    <input type="text" class="email-form-input" id="emailTo" value="${data.to}" readonly>
                </div>
                <div class="email-form-group">
                    <label class="email-form-label">From</label>
                    <input type="text" class="email-form-input" id="emailFrom" value="admin@rentit.com" readonly>
                </div>
                <div class="email-form-group">
                    <label class="email-form-label">Template</label>
                    <select class="email-form-select" id="emailTemplate">
                        <option value="">Select a template (optional)</option>
                        <option value="reminder">Rental Reminder</option>
                        <option value="confirmation">Booking Confirmation</option>
                        <option value="overdue">Overdue Notice</option>
                        <option value="thankyou">Thank You</option>
                        <option value="custom">Custom Message</option>
                    </select>
                </div>
                <div class="email-form-group">
                    <label class="email-form-label">Subject</label>
                    <input type="text" class="email-form-input" id="emailSubject" placeholder="Enter email subject...">
                </div>
                <div class="email-form-group">
                    <label class="email-form-label">Message</label>
                    <textarea class="email-form-textarea" id="emailMessage" rows="8" placeholder="Enter your message..."></textarea>
                </div>
            </div>
            <div class="email-modal-footer">
                <button class="btn btn-secondary email-cancel-btn">Cancel</button>
                <button class="btn btn-primary email-send-btn">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M22 2L11 13"/>
                        <path d="M22 2l-7 20-4-9-9-4 20-7z"/>
                    </svg>
                    Send Email
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(backdrop);

    // Animate in
    requestAnimationFrame(() => backdrop.classList.add('open'));

    // Template change handler
    const templateSelect = backdrop.querySelector('#emailTemplate');
    templateSelect.addEventListener('change', (e) => {
        updateEmailTemplate(e.target.value, data.customerName);
    });

    // Close handlers
    const close = () => {
        backdrop.classList.remove('open');
        setTimeout(() => backdrop.remove(), 300);
    };

    backdrop.querySelector('.email-modal-close').addEventListener('click', close);
    backdrop.querySelector('.email-cancel-btn').addEventListener('click', close);
    
    // Close on backdrop click
    backdrop.addEventListener('click', (e) => {
        if (e.target === backdrop) close();
    });

    // Close on Escape
    const escHandler = (e) => {
        if (e.key === 'Escape') {
            close();
            document.removeEventListener('keydown', escHandler);
        }
    };
    document.addEventListener('keydown', escHandler);

    // Send email handler
    backdrop.querySelector('.email-send-btn').addEventListener('click', () => {
        const to = backdrop.querySelector('#emailTo').value;
        const subject = backdrop.querySelector('#emailSubject').value;
        const message = backdrop.querySelector('#emailMessage').value;

        if (!subject.trim()) {
            AdminComponents.showToast('Please enter a subject', 'warning');
            return;
        }
        if (!message.trim()) {
            AdminComponents.showToast('Please enter a message', 'warning');
            return;
        }

        // In production, this would send via API
        // For now, simulate sending
        AdminComponents.showToast('Email sent successfully!', 'success');
        close();
    });
}

/**
 * Update email content based on template selection
 */
function updateEmailTemplate(template, customerName) {
    const subjectInput = document.getElementById('emailSubject');
    const messageTextarea = document.getElementById('emailMessage');

    const templates = {
        reminder: {
            subject: 'Rental Reminder - RentIt',
            message: `Hi ${customerName},

This is a friendly reminder about your upcoming rental.

Please remember to:
- Pick up your items on time
- Bring valid ID for verification
- Review our rental terms and conditions

If you have any questions, please don't hesitate to contact us.

Best regards,
RentIt Team`
        },
        confirmation: {
            subject: 'Booking Confirmed - RentIt',
            message: `Hi ${customerName},

Great news! Your booking has been confirmed.

Your rental details have been saved in our system. You will receive a reminder before your pickup date.

Thank you for choosing RentIt!

Best regards,
RentIt Team`
        },
        overdue: {
            subject: 'Overdue Notice - Action Required',
            message: `Hi ${customerName},

We noticed that your rental items are currently overdue.

Please return the items as soon as possible to avoid additional late fees. If you need to extend your rental period, please contact us immediately.

Current late fees may apply as per our rental agreement.

Please contact us if you have any questions or concerns.

Best regards,
RentIt Team`
        },
        thankyou: {
            subject: 'Thank You for Renting with Us!',
            message: `Hi ${customerName},

Thank you for choosing RentIt for your rental needs!

We hope you had a great experience with our equipment. We would love to hear your feedback.

Looking forward to serving you again soon!

Best regards,
RentIt Team`
        },
        custom: {
            subject: '',
            message: ''
        }
    };

    if (template && templates[template]) {
        subjectInput.value = templates[template].subject;
        messageTextarea.value = templates[template].message;
    }
}

/**
 * Call customer
 */
function toggleCustomerPhone(btn, phone) {
    if (btn.classList.contains('phone-revealed')) {
        btn.classList.remove('phone-revealed');
        btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>`;
        btn.title = 'Show phone number';
        btn.style.width = '';
        return;
    }
    btn.classList.add('phone-revealed');
    btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg> ${phone || 'N/A'}`;
    btn.title = phone || 'N/A';
    btn.style.width = 'auto';
}

/**
 * Initialize page
 */
document.addEventListener('DOMContentLoaded', async function() {
    // Show loading state
    const tbody = document.getElementById('customersTableBody');
    if (tbody) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; padding: 2rem;">
                    <div>Loading customers...</div>
                </td>
            </tr>
        `;
    }

    // Fetch customers from API
    const success = await fetchCustomers();
    
    if (success) {
        // Initial render
        renderCustomers(customersData);
        updateKPICounts();
    } else {
        // Show error state
        if (tbody) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" style="text-align: center; padding: 2rem; color: var(--color-error);">
                        <div>Failed to load customers. Please refresh the page.</div>
                    </td>
                </tr>
            `;
        }
    }

    // Search input handler
    const searchInput = document.getElementById('customerSearchInput');
    if (searchInput) {
        let debounceTimer;
        searchInput.addEventListener('input', () => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(filterCustomers, 300);
        });
    }

    // Filter change handlers
    document.getElementById('statusFilter')?.addEventListener('change', filterCustomers);
    document.getElementById('sortFilter')?.addEventListener('change', filterCustomers);

    // Pagination buttons
    document.getElementById('prevPageBtn')?.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            renderCustomers(filteredCustomersData);
        }
    });
    document.getElementById('nextPageBtn')?.addEventListener('click', () => {
        const totalPages = Math.ceil(filteredCustomersData.length / PAGE_SIZE);
        if (currentPage < totalPages) {
            currentPage++;
            renderCustomers(filteredCustomersData);
        }
    });

    // Export button
    document.getElementById('exportCustomersBtn')?.addEventListener('click', () => {
        exportCustomers();
    });
});

/**
 * Export customers to CSV
 */
function exportCustomers() {
    if (customersData.length === 0) {
        AdminComponents.showToast('No customers to export', 'warning');
        return;
    }

    const headers = ['ID', 'Name', 'Email', 'Phone', 'Membership', 'Total Rentals', 'Total Spent'];
    const rows = customersData.map(c => [
        c.id,
        c.name,
        c.email,
        c.phone,
        c.membership,
        c.stats?.totalRentals || 0,
        c.stats?.totalSpent || 0
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.map(v => `"${v}"`).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `customers_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    AdminComponents.showToast('Customers exported successfully', 'success');
}
