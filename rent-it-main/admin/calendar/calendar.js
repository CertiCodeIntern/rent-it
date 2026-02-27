/**
 * =====================================================
 * CALENDAR MASTER VIEW - JavaScript
 * Interactive calendar functionality
 * ===================================================== */

document.addEventListener('DOMContentLoaded', () => {
    // Initialize admin components
    AdminComponents.initPage('calendar');
    
    // Initialize calendar functionality
    CalendarManager.init();
});

const CalendarManager = {
    currentDate: new Date(),
    weekDays: [],
    calendarData: null,
    
    /**
     * Initialize calendar
     */
    async init() {
        this.calculateWeekDays();
        this.bindEvents();
        await this.fetchCalendarData();
    },
    
    /**
     * Calculate week days (Mon-Sat)
     */
    calculateWeekDays() {
        const monday = new Date(this.currentDate);
        const dayOfWeek = monday.getDay();
        const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
        monday.setDate(monday.getDate() + diff);
        
        this.weekDays = [];
        for (let i = 0; i < 6; i++) {
            const day = new Date(monday);
            day.setDate(monday.getDate() + i);
            this.weekDays.push(day);
        }
        
        this.updateDateRange();
        this.updateHeaderDates();
    },
    
    /**
     * Fetch calendar data from API
     */
    async fetchCalendarData() {
        const startDate = this.formatDateISO(this.weekDays[0]);
        const endDate = this.formatDateISO(this.weekDays[5]);
        
        try {
            const response = await fetch(`admin/api/get_calendar.php?start=${startDate}&end=${endDate}`);
            const data = await response.json();
            
            if (data.success) {
                this.calendarData = data;
                this.renderCalendar();
                this.updateStats();
            } else {
                console.error('Failed to fetch calendar:', data.message);
                this.showError('Failed to load calendar data');
            }
        } catch (error) {
            console.error('Error fetching calendar:', error);
            this.showError('Error loading calendar data');
        }
    },
    
    /**
     * Show error in calendar body
     */
    showError(message) {
        const tbody = document.getElementById('calendarBody');
        if (tbody) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" style="text-align: center; padding: 2rem; color: var(--color-error);">
                        ${message}
                    </td>
                </tr>
            `;
        }
    },
    
    /**
     * Render calendar grid
     */
    renderCalendar() {
        const tbody = document.getElementById('calendarBody');
        if (!tbody || !this.calendarData) return;
        
        const { items, bookings, repairs } = this.calendarData;
        
        if (items.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7">
                        <div class="calendar-empty-state">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="48" height="48">
                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                                <line x1="16" y1="2" x2="16" y2="6"/>
                                <line x1="8" y1="2" x2="8" y2="6"/>
                                <line x1="3" y1="10" x2="21" y2="10"/>
                            </svg>
                            <h3>No items found</h3>
                            <p>There are no rental items in the database yet.</p>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }
        
        // Build rows for each item
        const rows = items.map(item => this.renderItemRow(item, bookings, repairs)).join('');
        tbody.innerHTML = rows;
        
        // Bind click events for booking blocks
        document.querySelectorAll('.booking-block.booked').forEach(block => {
            block.addEventListener('click', (e) => this.showBookingDetails(e.target.closest('.booking-block')));
        });

        // Bind click events for repair blocks
        document.querySelectorAll('.booking-block.repair').forEach(block => {
            block.addEventListener('click', (e) => this.showRepairDetails(e.target.closest('.booking-block')));
        });
    },
    
    /**
     * Render a single item row
     */
    renderItemRow(item, bookings, repairs) {
        // Get category type for filtering
        const categoryType = this.getCategoryType(item.category);
        
        // Build day cells
        const dayCells = this.weekDays.map((day, dayIndex) => {
            return this.renderDayCell(item, day, dayIndex, bookings, repairs);
        }).join('');
        
        return `
            <tr data-asset="ITEM-${item.id}" data-type="${categoryType}">
                <td class="asset-cell">
                    <div class="asset-info">
                        <span class="asset-id">ITM-${String(item.id).padStart(3, '0')}</span>
                        <span class="asset-name">${this.escapeHtml(item.name)}</span>
                    </div>
                </td>
                ${dayCells}
            </tr>
        `;
    },
    
    /**
     * Render a day cell for an item
     */
    renderDayCell(item, day, dayIndex, bookings, repairs) {
        const dateStr = this.formatDateISO(day);
        
        // Check for booking on this day
        const booking = bookings.find(b => 
            b.item_id === item.id && 
            dateStr >= b.start_date && 
            dateStr <= b.end_date
        );
        
        // Check for repair on this day (exclude completed/resolved in find itself)
        const repair = repairs.find(r => 
            r.item_id === item.id && 
            r.status !== 'completed' && r.status !== 'Resolved' &&
            dateStr >= r.reported_date && 
            (r.resolved_date === null || dateStr <= r.resolved_date)
        );
        
        if (booking) {
            const startDate = new Date(booking.start_date);
            const endDate = new Date(booking.end_date);
            const weekStart = this.weekDays[0];
            const weekEnd = this.weekDays[5];
            const isStart = dateStr === booking.start_date;
            // Continuation: booking started before this week's first day (Mon)
            const isContinuation = (dayIndex === 0 && booking.start_date < this.formatDateISO(weekStart));
            
            if (isStart || isContinuation) {
                // Calculate how many days this block spans within the visible week
                const effectiveEnd = endDate > weekEnd ? weekEnd : endDate;
                const daysInWeek = Math.min(6 - dayIndex, Math.ceil((effectiveEnd - day) / (1000 * 60 * 60 * 24)) + 1);
                const blockWidth = this.getBlockWidth(daysInWeek);
                
                return `
                    <td class="day-cell">
                        <div class="booking-block booked" style="width: ${blockWidth};" 
                             title="${this.escapeHtml(booking.customer_name)} | ${this.formatDateShort(startDate)} - ${this.formatDateShort(endDate)}" 
                             data-booking-id="${booking.id}"
                             data-order-id="${booking.order_id}">
                            <span class="booking-customer">${this.escapeHtml(booking.customer_name)}</span>
                        </div>
                    </td>
                `;
            } else {
                // This day is covered by a multi-day booking block
                return `<td class="day-cell"></td>`;
            }
        }
        
        if (repair) {
            const resolvedDate = repair.resolved_date ? new Date(repair.resolved_date) : null;
            const weekStart = this.weekDays[0];
            const weekEnd = this.weekDays[5];
            const isStart = dateStr === repair.reported_date;
            // Continuation: repair started before this week's first day (Mon)
            const isContinuation = (dayIndex === 0 && repair.reported_date < this.formatDateISO(weekStart));
            
            if (isStart || isContinuation) {
                const effectiveEndDate = resolvedDate || weekEnd;
                const effectiveEnd = effectiveEndDate > weekEnd ? weekEnd : effectiveEndDate;
                const daysInWeek = Math.min(6 - dayIndex, Math.ceil((effectiveEnd - day) / (1000 * 60 * 60 * 24)) + 1);
                const blockWidth = this.getBlockWidth(daysInWeek);
                
                return `
                    <td class="day-cell">
                        <div class="booking-block repair" style="width: ${blockWidth};" 
                             title="In Repair - ${this.escapeHtml(repair.description || 'Maintenance')}" 
                             data-repair-id="${repair.id}">
                            <span class="booking-status">In Repair</span>
                        </div>
                    </td>
                `;
            } else {
                return `<td class="day-cell"></td>`;
            }
        }
        
        // Available
        return `
            <td class="day-cell">
                <div class="booking-block available" title="Available for booking">
                    <span class="booking-status">Available</span>
                </div>
            </td>
        `;
    },
    
    /**
     * Get category type for filtering
     */
    getCategoryType(category) {
        if (!category) return 'equipment';
        const cat = category.toLowerCase();
        if (cat.includes('karaoke') || cat.includes('premium') || cat.includes('professional')) return 'karaoke';
        if (cat.includes('speaker')) return 'speaker';
        if (cat.includes('mic')) return 'microphone';
        if (cat.includes('portable')) return 'portable';
        return 'equipment';
    },
    
    /**
     * Update stats display
     */
    updateStats() {
        if (!this.calendarData) return;
        const { stats } = this.calendarData;
        
        const statBookings = document.getElementById('statBookings');
        const statRepair = document.getElementById('statRepair');
        const statAvailable = document.getElementById('statAvailable');
        
        if (statBookings) statBookings.textContent = stats.bookingsThisWeek || 0;
        if (statRepair) statRepair.textContent = stats.inRepair || 0;
        if (statAvailable) statAvailable.textContent = stats.available || 0;
    },
    
    /**
     * Update header dates
     */
    updateHeaderDates() {
        const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const headers = document.querySelectorAll('#calendarHeader .day-column');
        
        headers.forEach((header, index) => {
            if (index < this.weekDays.length) {
                const dayName = header.querySelector('.day-name');
                const dayDate = header.querySelector('.day-date');
                if (dayName) dayName.textContent = dayNames[index];
                if (dayDate) dayDate.textContent = this.formatDateShort(this.weekDays[index]);
            }
        });
    },
    
    /**
     * Bind event listeners
     */
    bindEvents() {
        // Navigation
        document.getElementById('prevWeekBtn')?.addEventListener('click', () => this.navigateWeek(-1));
        document.getElementById('nextWeekBtn')?.addEventListener('click', () => this.navigateWeek(1));
        document.getElementById('todayBtn')?.addEventListener('click', () => this.goToToday());
        
        // Filters
        document.getElementById('assetTypeFilter')?.addEventListener('change', (e) => this.filterByAssetType(e.target.value));
        
        // Calendar search
        const calSearchInput = document.getElementById('calendarSearchInput');
        if (calSearchInput) {
            let debounceTimer;
            calSearchInput.addEventListener('input', () => {
                clearTimeout(debounceTimer);
                debounceTimer = setTimeout(() => this.filterBySearch(calSearchInput.value), 300);
            });
        }
        
        // Modal
        document.getElementById('closeBookingModal')?.addEventListener('click', () => this.closeModal());
        document.getElementById('cancelBookingModalBtn')?.addEventListener('click', () => this.closeModal());
        document.getElementById('bookingModal')?.addEventListener('click', (e) => {
            if (e.target.id === 'bookingModal') this.closeModal();
        });
        
        // Add new item button is now a link, no JS needed
        
        // Edit booking — redirect to order detail page
        document.getElementById('editBookingBtn')?.addEventListener('click', () => {
            const orderId = this._currentModalOrderId;
            if (orderId) {
                window.location.href = `admin/orders/orderdetail.php?id=${orderId}`;
            } else {
                AdminComponents.showToast('Could not find order details', 'warning');
            }
            this.closeModal();
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') this.closeModal();
            if (e.key === 'ArrowLeft' && e.altKey) this.navigateWeek(-1);
            if (e.key === 'ArrowRight' && e.altKey) this.navigateWeek(1);
        });
    },
    
    /**
     * Navigate weeks
     */
    async navigateWeek(direction) {
        const days = direction * 7;
        this.currentDate.setDate(this.currentDate.getDate() + days);
        this.calculateWeekDays();
        await this.fetchCalendarData();
        AdminComponents.showToast(`Viewing week of ${this.formatDate(this.weekDays[0])}`, 'info');
    },
    
    /**
     * Go to current week
     */
    async goToToday() {
        this.currentDate = new Date();
        this.calculateWeekDays();
        await this.fetchCalendarData();
        AdminComponents.showToast('Jumped to current week', 'info');
    },
    
    /**
     * Update date range label
     */
    updateDateRange() {
        const label = document.getElementById('dateRangeLabel');
        if (label && this.weekDays.length >= 6) {
            label.textContent = `${this.formatDate(this.weekDays[0])} - ${this.formatDate(this.weekDays[5])}`;
        }
    },
    
    /**
     * Format date for display
     */
    formatDate(date) {
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    },
    
    /**
     * Format date short (Jan 15)
     */
    formatDateShort(date) {
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    },
    
    /**
     * Format date as ISO (YYYY-MM-DD)
     */
    formatDateISO(date) {
        return date.toISOString().split('T')[0];
    },
    
    /**
     * Escape HTML
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text || '';
        return div.innerHTML;
    },
    
    /**
     * Get block width based on number of days spanned
     * Manually tuned percentages to align with cell borders
     */
    getBlockWidth(days) {
        if (days <= 1) return 'calc(100% - 8px)';
        if (days === 2) return 'calc(200% - 8px)';
        if (days === 3) return 'calc(315% - 8px)';
        if (days === 4) return 'calc(425% - 10px)';
        if (days === 5) return 'calc(535% - 11px)';
        if (days >= 6) return 'calc(645% - 11px)';
        return 'calc(100% - 8px)';
    },
    
    /**
     * Filter by search term — show only matching items
     */
    filterBySearch(term) {
        const searchTerm = term.toLowerCase().trim();
        const rows = document.querySelectorAll('#calendarBody tr');
        let visibleCount = 0;
        
        rows.forEach(row => {
            if (!row.dataset.asset) return; // skip non-data rows
            const assetName = row.querySelector('.asset-name')?.textContent?.toLowerCase() || '';
            const assetId = row.querySelector('.asset-id')?.textContent?.toLowerCase() || '';
            if (!searchTerm || assetName.includes(searchTerm) || assetId.includes(searchTerm)) {
                row.style.display = '';
                visibleCount++;
            } else {
                row.style.display = 'none';
            }
        });
        
        // Show empty state if no results
        const tbody = document.getElementById('calendarBody');
        const existingEmpty = tbody.querySelector('.calendar-search-empty');
        if (existingEmpty) existingEmpty.remove();
        
        if (visibleCount === 0 && searchTerm) {
            const emptyRow = document.createElement('tr');
            emptyRow.className = 'calendar-search-empty';
            emptyRow.innerHTML = `
                <td colspan="7">
                    <div class="calendar-empty-state">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="48" height="48">
                            <circle cx="11" cy="11" r="8"/>
                            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                        </svg>
                        <h3>No items match "${this.escapeHtml(term)}"</h3>
                        <p>Try a different search term.</p>
                    </div>
                </td>
            `;
            tbody.appendChild(emptyRow);
        }
    },

    /**
     * Filter by asset type
     */
    filterByAssetType(type) {
        const rows = document.querySelectorAll('#calendarBody tr:not(.calendar-search-empty):not(.calendar-filter-empty)');
        let visibleCount = 0;
        rows.forEach(row => {
            if (type === 'all' || row.dataset.type === type) {
                row.style.display = '';
                visibleCount++;
            } else {
                row.style.display = 'none';
            }
        });

        // Remove existing filter empty state
        const tbody = document.getElementById('calendarBody');
        const existingEmpty = tbody?.querySelector('.calendar-filter-empty');
        if (existingEmpty) existingEmpty.remove();

        // Show empty state if no results
        if (visibleCount === 0 && type !== 'all' && tbody) {
            const emptyRow = document.createElement('tr');
            emptyRow.className = 'calendar-filter-empty';
            emptyRow.innerHTML = `
                <td colspan="7">
                    <div class="calendar-empty-state">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="48" height="48">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                            <line x1="9" y1="9" x2="15" y2="15"/>
                            <line x1="15" y1="9" x2="9" y2="15"/>
                        </svg>
                        <h3>No ${this.escapeHtml(type)} items found</h3>
                        <p>There are no items in this category. Try a different filter.</p>
                    </div>
                </td>
            `;
            tbody.appendChild(emptyRow);
        }

        AdminComponents.showToast(`Filtered by: ${type === 'all' ? 'All types' : type}`, 'info');
    },
    
    /**
     * Show booking details modal
     */
    showBookingDetails(block) {
        if (!block) return;
        
        const bookingId = block.dataset.bookingId;
        const orderId = block.dataset.orderId;
        const modal = document.getElementById('bookingModal');
        
        // Store order ID for the edit button
        this._currentModalOrderId = orderId;
        
        // Find booking in data
        const booking = this.calendarData?.bookings?.find(b => b.id === bookingId);
        const item = this.calendarData?.items?.find(i => i.id === booking?.item_id);
        
        if (booking) {
            const startDate = new Date(booking.start_date);
            const endDate = new Date(booking.end_date);
            const duration = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
            
            document.getElementById('modalCustomer').textContent = booking.customer_name;
            document.getElementById('modalEvent').textContent = booking.venue || 'Rental';
            document.getElementById('modalEquipment').textContent = item ? item.name : 'Equipment';
            document.getElementById('modalDuration').textContent = `${this.formatDateShort(startDate)} - ${this.formatDateShort(endDate)} (${duration} days)`;
            document.getElementById('modalStatus').textContent = booking.status;
            document.getElementById('modalTotal').textContent = '₱' + booking.total.toLocaleString('en-PH', { minimumFractionDigits: 2 });
        }
        
        modal?.classList.add('open');
    },

    /**
     * Show repair details modal (via AdminComponents)
     */
    showRepairDetails(block) {
        if (!block) return;

        const repairId = block.dataset.repairId;
        const repair = this.calendarData?.repairs?.find(r => String(r.id) === String(repairId));
        const item = repair ? this.calendarData?.items?.find(i => String(i.id) === String(repair.item_id)) : null;

        if (!repair) {
            AdminComponents.showToast('Repair details not found', 'warning');
            return;
        }

        const itemName = item ? item.name : `Item #${repair.item_id}`;
        const priority = (repair.priority || 'medium');
        const priorityLabel = priority.charAt(0).toUpperCase() + priority.slice(1);
        const status = repair.status || 'in-progress';
        const statusLabel = this.formatRepairStatus(status);
        const reportedDate = repair.reported_date ? this.formatDate(new Date(repair.reported_date)) : 'N/A';
        const etaDate = repair.resolved_date ? this.formatDate(new Date(repair.resolved_date)) : 'N/A';
        const cost = repair.estimated_cost ? `₱${Number(repair.estimated_cost).toLocaleString()}` : '₱0';
        const description = repair.description || repair.issue_type || 'No description';

        AdminComponents.showModal({
            title: 'Repair Details',
            content: `
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                    <div style="display: flex; flex-direction: column; gap: 0.25rem;">
                        <span style="font-size: 0.75rem; color: var(--admin-text-muted); text-transform: uppercase;">Equipment</span>
                        <span style="font-weight: 600;">${this.escapeHtml(itemName)}</span>
                    </div>
                    <div style="display: flex; flex-direction: column; gap: 0.25rem;">
                        <span style="font-size: 0.75rem; color: var(--admin-text-muted); text-transform: uppercase;">Repair ID</span>
                        <span style="font-weight: 600;">RPR-${String(repair.id).padStart(3, '0')}</span>
                    </div>
                    <div style="display: flex; flex-direction: column; gap: 0.25rem;">
                        <span style="font-size: 0.75rem; color: var(--admin-text-muted); text-transform: uppercase;">Status</span>
                        <span style="font-weight: 600;">${this.escapeHtml(statusLabel)}</span>
                    </div>
                    <div style="display: flex; flex-direction: column; gap: 0.25rem;">
                        <span style="font-size: 0.75rem; color: var(--admin-text-muted); text-transform: uppercase;">Priority</span>
                        <span style="font-weight: 600;">${this.escapeHtml(priorityLabel)}</span>
                    </div>
                    <div style="display: flex; flex-direction: column; gap: 0.25rem;">
                        <span style="font-size: 0.75rem; color: var(--admin-text-muted); text-transform: uppercase;">Created</span>
                        <span>${reportedDate}</span>
                    </div>
                    <div style="display: flex; flex-direction: column; gap: 0.25rem;">
                        <span style="font-size: 0.75rem; color: var(--admin-text-muted); text-transform: uppercase;">ETA</span>
                        <span>${etaDate}</span>
                    </div>
                    <div style="display: flex; flex-direction: column; gap: 0.25rem;">
                        <span style="font-size: 0.75rem; color: var(--admin-text-muted); text-transform: uppercase;">Est. Cost</span>
                        <span>${cost}</span>
                    </div>
                </div>
                <div style="margin-top: 1rem; display: flex; flex-direction: column; gap: 0.25rem;">
                    <span style="font-size: 0.75rem; color: var(--admin-text-muted); text-transform: uppercase;">Description</span>
                    <p style="margin: 0; color: var(--admin-text-secondary);">${this.escapeHtml(description)}</p>
                </div>
            `,
            confirmText: 'Edit Repair',
            cancelText: 'Close',
            onConfirm: () => {
                window.location.href = `admin/repairs/repairs.php`;
            }
        });
    },

    /**
     * Format repair status label
     */
    formatRepairStatus(status) {
        if (!status) return 'In Progress';
        const s = status.toLowerCase().replace(/[_ ]/g, '-');
        const labels = {
            'in-progress': 'In Progress',
            'awaiting-parts': 'Awaiting Parts',
            'completed': 'Completed',
            'unavailable': 'Unavailable'
        };
        return labels[s] || status;
    },
    
    /**
     * Close modal
     */
    closeModal() {
        document.getElementById('bookingModal')?.classList.remove('open');
    },
    
    /**
     * Show new booking modal
     */
    showNewBookingModal() {
        // Build equipment options from items
        const itemOptions = this.calendarData?.items?.map(item => 
            `<option value="${item.id}">ITM-${String(item.id).padStart(3, '0')} ${item.name}</option>`
        ).join('') || '';
        
        AdminComponents.showModal({
            title: 'New Booking',
            content: `
                <form class="new-booking-form">
                    <div class="form-group">
                        <label class="form-label">Customer Name</label>
                        <input type="text" class="form-input" placeholder="Enter customer name" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Equipment</label>
                        <select class="form-select" required>
                            <option value="">Select equipment</option>
                            ${itemOptions}
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Event Type</label>
                        <input type="text" class="form-input" placeholder="e.g., Birthday, Wedding">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Start Date</label>
                        <input type="date" class="form-input" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">End Date</label>
                        <input type="date" class="form-input" required>
                    </div>
                </form>
            `,
            confirmText: 'Create Booking',
            cancelText: 'Cancel',
            onConfirm: () => {
                AdminComponents.showToast('Booking created successfully!', 'success');
            }
        });
    }
};
