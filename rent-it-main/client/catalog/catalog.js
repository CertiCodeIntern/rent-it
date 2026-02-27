    document.addEventListener('DOMContentLoaded', () => {
        // Initialize sidebar, topbar, and footer
        if (typeof Components !== 'undefined') {
            Components.injectSidebar('sidebarContainer', 'catalog', 'client');
            Components.injectTopbar('topbarContainer', 'Browse Catalog');
            Components.injectFooter();
        }

    
        initCatalog();
    });
    function initCatalog() {
        initCatalogTabs();
        initCategoryFilters();
        initStatusFilters();
        initPriceSlider();
        initCalendar();
        initSearch();
        initSortSelect();
        initProductCards();
        initProductModal();
        initPagination();
        initCatalogEmptyState();
        updateProductCount();
    }

    // Normalize status strings so filters and badges stay in sync
    function normalizeStatus(status) {
        if (!status) return 'available';
        const key = status.toString().toLowerCase().trim();
        if (['repairing', 'maintenance', 'under repair', 'under maintenance'].includes(key)) return 'maintenance';
        if (key === 'booked') return 'booked';
        return 'available';
    }

    function getStatusLabel(status) {
        const normalized = normalizeStatus(status);
        if (normalized === 'maintenance') return 'Repairing';
        if (normalized === 'booked') return 'Booked';
        return 'Available';
    }


    function initCatalogTabs() {
        const tabs = document.querySelectorAll('.tab-link');
        
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                
                
                const tabType = tab.dataset.tab;
                filterByTab(tabType);
            });
        });
    }

    function filterByTab(tabType) {
        const products = document.querySelectorAll('.product-card');
        
        products.forEach(product => {
            if (tabType === 'all') {
                product.style.display = '';
            } else if (tabType === 'promos') {
                const isPromo = product.dataset.featured === 'true';
                product.style.display = isPromo ? '' : 'none';
            }
        });
        
        updateProductCount();
    }


    function initCategoryFilters() {
        const checkboxes = document.querySelectorAll('.category-checkbox');
        
        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                filterProducts();
            });
        });
        
        const resetBtn = document.querySelector('.reset-filters');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                checkboxes.forEach(cb => cb.checked = false);
                
                document.querySelectorAll('.status-checkbox').forEach(cb => {
                    cb.checked = false;
                });
                
                const priceSlider = document.getElementById('priceSlider');
                if (priceSlider) {
                    priceSlider.value = priceSlider.max;
                    updatePriceDisplay(priceSlider.value);
                }

                const searchInput = document.getElementById('catalogSearch');
                if (searchInput) {
                    searchInput.value = '';
                }
                
                filterProducts();
            });
        }
    }

    function initCatalogEmptyState() {
        const resetBtn = document.getElementById('catalogResetBtn');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                document.querySelector('.reset-filters')?.click();
                filterProducts();
            });
        }
    }

    function initStatusFilters() {
        const checkboxes = document.querySelectorAll('.status-checkbox');
        
        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                filterProducts();
            });
        });
    }


    function initPriceSlider() {
        const slider = document.getElementById('priceSlider');
        const priceValue = document.getElementById('priceValue');
        
        if (slider) {
            slider.addEventListener('input', (e) => {
                updatePriceDisplay(e.target.value);
                filterProducts();
            });
        }
    }

    function updatePriceDisplay(value) {
        const priceValue = document.getElementById('priceValue');
        if (priceValue) {
            priceValue.textContent = `₱${parseInt(value).toLocaleString()}`;
        }
    }

    function filterProducts() {
        const products = document.querySelectorAll('.product-card');
        const activeCategories = Array.from(document.querySelectorAll('.category-checkbox:checked'))
            .map(cb => cb.value);
        const activeStatuses = Array.from(document.querySelectorAll('.status-checkbox:checked'))
            .map(cb => cb.value);
        const maxPrice = parseInt(document.getElementById('priceSlider')?.value || 9999);
        const searchQuery = document.getElementById('catalogSearch')?.value.toLowerCase() || '';
        
        products.forEach(product => {
            const category = product.dataset.category;
            const price = parseInt(product.dataset.price);
            const name = product.querySelector('.product-name')?.textContent.toLowerCase() || '';
            const description = product.querySelector('.product-description')?.textContent.toLowerCase() || '';
            const status = normalizeStatus(product.dataset.status || 'available');
            
            let show = true;
            

            if (activeCategories.length > 0 && !activeCategories.includes(category)) {
                show = false;
            }
            
    
            if (activeStatuses.length > 0 && !activeStatuses.includes(status)) {
                show = false;
            }
            
            // Price filter
            if (price > maxPrice) {
                show = false;
            }
            
            // Search filter
            if (searchQuery && !name.includes(searchQuery) && !description.includes(searchQuery)) {
                show = false;
            }
            
            product.style.display = show ? '' : 'none';
        });
        
        updateProductCount();
    }

    function updateProductCount() {
        const visibleProducts = document.querySelectorAll('.product-card:not([style*="display: none"])').length;
        const countEl = document.querySelector('.products-count');
        if (countEl) {
            countEl.textContent = `(${visibleProducts} models found)`;
        }

        const emptyState = document.getElementById('catalogEmptyState');
        const grid = document.querySelector('.products-grid');
        const pagination = document.querySelector('.pagination');
        const isEmpty = visibleProducts === 0;

        if (emptyState) {
            emptyState.classList.toggle('hidden', !isEmpty);
        }
        if (grid) {
            grid.classList.toggle('is-empty', isEmpty);
        }
        if (pagination) {
            pagination.classList.toggle('is-hidden', isEmpty);
        }

        // Re-render pagination when product count changes
        if (window._catalogPagination) {
            window._catalogPagination.render();
        }
    }


    function initCalendar() {
        const prevBtn = document.getElementById('calendarPrev');
        const nextBtn = document.getElementById('calendarNext');
        const monthDisplay = document.getElementById('calendarMonth');
        const calendarGrid = document.getElementById('calendarGrid');
        const startDateInput = document.getElementById('startDateInput');
        const endDateInput = document.getElementById('endDateInput');
        const clearDatesBtn = document.getElementById('clearDatesBtn');
        
        if (!calendarGrid) return;
        
        let currentDate = new Date();
        let startDate = null;
        let endDate = null;
        let selectingStart = true; // Toggle between selecting start and end

        // Expose selected dates globally so addToCart can read them
        window.catalogSelectedDates = { start: null, end: null };
        
        // Month names for formatting
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'];
        const shortMonthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
            'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    // Format date for display
    function formatDate(date) {
        if (!date) return '';
        return `${shortMonthNames[date.getMonth()]} ${String(date.getDate()).padStart(2, '0')}, ${date.getFullYear()}`;
    }
    
    // Update text inputs with active state indicators
    function updateInputs() {
        if (startDateInput) {
            startDateInput.value = formatDate(startDate);
            // Highlight when it's the next field to fill
            const isStartActive = selectingStart || !startDate;
            startDateInput.classList.toggle('active', isStartActive);
            // Show filled state
            startDateInput.classList.toggle('filled', !!startDate);
        }
        if (endDateInput) {
            endDateInput.value = formatDate(endDate);
            // Highlight when start is set and we're picking end
            const isEndActive = !selectingStart && !!startDate;
            endDateInput.classList.toggle('active', isEndActive);
            // Show filled state
            endDateInput.classList.toggle('filled', !!endDate);
        }
    }
    
    // Check if date is in range
    function isInRange(date) {
        if (!startDate || !endDate) return false;
        return date > startDate && date < endDate;
    }
    
    // Check if date is booked (mock data)
    function getBookedDates() {
        // Mock booked dates - in real app, this would come from API
        return [
            { start: new Date(2026, 1, 10), end: new Date(2026, 1, 12) },
            { start: new Date(2026, 1, 20), end: new Date(2026, 1, 22) },
            { start: new Date(2026, 2, 5), end: new Date(2026, 2, 7) }
        ];
    }
    
    function isDateBooked(date) {
        const bookedRanges = getBookedDates();
        return bookedRanges.some(range => date >= range.start && date <= range.end);
    }
    
    function renderCalendar() {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        
        // Update month display
        if (monthDisplay) {
            monthDisplay.textContent = `${monthNames[month]} ${year}`;
        }
        
        // Clear grid (keep day headers)
        const dayHeaders = calendarGrid.querySelectorAll('.calendar-day-header');
        calendarGrid.innerHTML = '';
        dayHeaders.forEach(header => calendarGrid.appendChild(header.cloneNode(true)));
        
        // Add day headers if they don't exist
        if (calendarGrid.children.length === 0) {
            const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
            days.forEach(day => {
                const header = document.createElement('span');
                header.className = 'calendar-day-header';
                header.textContent = day;
                calendarGrid.appendChild(header);
            });
        }
        
        // Get first day of month and total days
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // Add empty cells for days before the first
        for (let i = 0; i < firstDay; i++) {
            const empty = document.createElement('span');
            empty.className = 'calendar-day disabled';
            calendarGrid.appendChild(empty);
        }
        
        // Add day cells
        for (let day = 1; day <= daysInMonth; day++) {
            const dayEl = document.createElement('span');
            dayEl.className = 'calendar-day';
            dayEl.textContent = day;
            
            const cellDate = new Date(year, month, day);
            cellDate.setHours(0, 0, 0, 0);
            
            // Mark today
            if (cellDate.getTime() === today.getTime()) {
                dayEl.classList.add('today');
            }
            
            // Mark past dates as disabled
            if (cellDate < today) {
                dayEl.classList.add('disabled');
            } else {
                // All future dates are selectable - filter calendar is for user date selection only
                dayEl.addEventListener('click', () => handleDateClick(cellDate));
            }
            
            // Apply range styling
            if (startDate && cellDate.getTime() === startDate.getTime()) {
                dayEl.classList.add('range-start');
            }
            if (endDate && cellDate.getTime() === endDate.getTime()) {
                dayEl.classList.add('range-end');
            }
            if (isInRange(cellDate)) {
                dayEl.classList.add('in-range');
            }
            
            calendarGrid.appendChild(dayEl);
        }
        
        updateInputs();
    }
    
    function toISODate(d) {
        return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
    }

    function handleDateClick(date) {
        if (selectingStart || !startDate) {
            // Selecting start date (same-day booking allowed: start == end)
            startDate = date;
            endDate = date; // Default end = same day (1-day rental)
            selectingStart = false;

            // Update global dates so addToCart can use them
            window.catalogSelectedDates = { start: toISODate(startDate), end: toISODate(endDate) };
        } else {
            // Selecting end date
            if (date < startDate) {
                // If end date is before start, swap them
                endDate = startDate;
                startDate = date;
            } else {
                endDate = date;
            }
            selectingStart = true;

            // Update global dates
            window.catalogSelectedDates = { start: toISODate(startDate), end: toISODate(endDate) };
            
            // Check for conflicts in range
            checkRangeConflicts();
        }
        
        renderCalendar();
        filterProductsByDateRange();
    }
    
    function checkRangeConflicts() {
        if (!startDate || !endDate) return;
        
        const bookedRanges = getBookedDates();
        const hasConflict = bookedRanges.some(range => {
            return (startDate <= range.end && endDate >= range.start);
        });
        
        if (hasConflict) {
            // Show warning
            const warningEl = document.createElement('div');
            warningEl.className = 'date-conflict-warning';
            warningEl.innerHTML = `
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                    <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
                Selected range conflicts with existing bookings
            `;
            
            // Remove existing warning
            document.querySelector('.date-conflict-warning')?.remove();
            calendarGrid.parentElement.appendChild(warningEl);
            
            setTimeout(() => warningEl.remove(), 3000);
        }
    }
    
    function filterProductsByDateRange() {
        if (!startDate || !endDate) return;
        
        // Mark products with conflicts
        document.querySelectorAll('.product-card').forEach(card => {
            const productId = card.dataset.id;
            const bookings = getProductBookings(productId);
            
            const hasConflict = bookings.some(booking => {
                const bookStart = new Date(booking.start);
                const bookEnd = new Date(booking.end);
                return (startDate <= bookEnd && endDate >= bookStart);
            });
            
            card.classList.toggle('date-conflict', hasConflict);
        });
    }
    
    function clearDates() {
        startDate = null;
        endDate = null;
        selectingStart = true;
        window.catalogSelectedDates = { start: null, end: null };
        document.querySelectorAll('.product-card').forEach(card => {
            card.classList.remove('date-conflict');
        });
        document.querySelector('.date-conflict-warning')?.remove();
        renderCalendar();
    }
    
    // Input click handlers
    startDateInput?.addEventListener('click', () => {
        selectingStart = true;
        updateInputs();
    });
    
    endDateInput?.addEventListener('click', () => {
        if (startDate) {
            selectingStart = false;
            updateInputs();
        }
    });
    
    // Clear button
    clearDatesBtn?.addEventListener('click', clearDates);
    
    // Navigation
    prevBtn?.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar();
    });
    
    nextBtn?.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar();
    });
    
    // Initial render
    renderCalendar();
}

/**
 * Search functionality
 */
function initSearch() {
    const searchInput = document.getElementById('catalogSearch');
    
    if (searchInput) {
        // Debounce search
        let searchTimeout;
        searchInput.addEventListener('input', () => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                filterProducts();
            }, 300);
        });
    }
}
function initSortSelect() {
    const sortSelect = document.getElementById('sortSelect');
    
    if (sortSelect) {
        sortSelect.addEventListener('change', () => {
            sortProducts(sortSelect.value);
        });
    }
}

function sortProducts(sortBy) {
    const grid = document.querySelector('.products-grid');
    if (!grid) return;
    
    const products = Array.from(grid.querySelectorAll('.product-card'));
    
    products.sort((a, b) => {
        switch (sortBy) {
            case 'price-low':
                return parseInt(a.dataset.price) - parseInt(b.dataset.price);
            case 'price-high':
                return parseInt(b.dataset.price) - parseInt(a.dataset.price);
            case 'name':
                return a.querySelector('.product-name').textContent
                    .localeCompare(b.querySelector('.product-name').textContent);
            case 'popular':
            default:
                return parseInt(b.dataset.popularity || 0) - parseInt(a.dataset.popularity || 0);
        }
    });
    
    // Re-append in sorted order
    products.forEach(product => grid.appendChild(product));
}

function initProductCards() {
    const ctaButtons = document.querySelectorAll('.product-cta');
    
    ctaButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const card = e.target.closest('.product-card');
            const productName = card.querySelector('.product-name')?.textContent;
            const isNotify = btn.classList.contains('notify');
            
            if (isNotify) {
                // Handle notify when ready
                alert(`You'll be notified when "${productName}" becomes available!`);
            } else {
                // Handle rent now - redirect to booking
                const productId = card.dataset.id;
                window.location.href = `/client/booking/new.html?product=${productId}`;
            }
        });
    });

    // Initialize review buttons
    initReviewButtons();
    
    // Initialize availability popovers
    initAvailabilityPopovers();
    
    // Initialize mock rental history for testing
    if (typeof Components !== 'undefined') {
        Components.initMockRentalHistory();
    }
}

function initAvailabilityPopovers() {
    const availabilityBtns = document.querySelectorAll('.btn-availability');
    
    availabilityBtns.forEach(btn => {
        // Click to toggle and stay open
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleAvailabilityPopover(e.target.closest('.btn-availability'));
        });
    });
    
    // Close popover when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.btn-availability') && !e.target.closest('.availability-popover')) {
            document.querySelectorAll('.availability-popover.visible').forEach(p => {
                p.classList.remove('visible');
            });
            document.querySelectorAll('.btn-availability.active').forEach(b => {
                b.classList.remove('active');
            });
        }
    });
}

function getProductBookings(productId) {
    // Mock data - in production, this would come from an API
    const mockBookings = {
        '1': [
            { start: 'Feb 10, 2026', end: 'Feb 12, 2026' },
            { start: 'Feb 25, 2026', end: 'Feb 27, 2026' }
        ],
        '2': [
            { start: 'Feb 01, 2026', end: 'Feb 03, 2026' },
            { start: 'Feb 15, 2026', end: 'Feb 18, 2026' },
            { start: 'Mar 05, 2026', end: 'Mar 07, 2026' }
        ],
        '3': [
            { start: 'Feb 20, 2026', end: 'Feb 22, 2026' }
        ],
        '4': [],
        '5': [
            { start: 'Feb 08, 2026', end: 'Feb 10, 2026' }
        ],
        '6': [
            { start: 'Feb 01, 2026', end: 'Feb 05, 2026' },
            { start: 'Feb 14, 2026', end: 'Feb 16, 2026' }
        ]
    };
    
    return mockBookings[productId] || [];
}

/**
 * Show availability popover
 */
function showAvailabilityPopover(btn) {
    const card = btn.closest('.product-card');
    const productId = card.dataset.id;
    const popover = card.querySelector('.availability-popover');
    
    if (!popover) return;
    
    const bookings = getProductBookings(productId);
    const list = popover.querySelector('.availability-list');
    const maxVisibleBookings = 8; // Show max 8 bookings before "See More"
    
    if (bookings.length === 0) {
        list.innerHTML = '<li class="availability-empty">No upcoming bookings</li>';
        // Remove any existing "See More" link
        const existingSeeMore = popover.querySelector('.availability-see-more');
        if (existingSeeMore) existingSeeMore.remove();
    } else {
        // Show only first N bookings if there are too many
        const visibleBookings = bookings.slice(0, maxVisibleBookings);
        const hasMore = bookings.length > maxVisibleBookings;
        
        list.innerHTML = visibleBookings.map(booking => `
            <li class="availability-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                    <line x1="16" y1="2" x2="16" y2="6"/>
                    <line x1="8" y1="2" x2="8" y2="6"/>
                    <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
                ${booking.start} - ${booking.end}
            </li>
        `).join('');
        
        // Remove existing "See More" link
        const existingSeeMore = popover.querySelector('.availability-see-more');
        if (existingSeeMore) existingSeeMore.remove();
        
        // Add "See More" link if there are more bookings
        if (hasMore) {
            const seeMoreLink = document.createElement('a');
            seeMoreLink.className = 'availability-see-more';
            seeMoreLink.textContent = `See all ${bookings.length} bookings...`;
            seeMoreLink.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                // Close popover and open product modal
                popover.classList.remove('visible');
                btn.classList.remove('active');
                openProductModal(card);
            });
            popover.appendChild(seeMoreLink);
        }
    }
    
    popover.classList.add('visible');
}

function hideAvailabilityPopover(btn) {
    const card = btn.closest('.product-card');
    const popover = card.querySelector('.availability-popover');
    
    if (popover) {
        popover.classList.remove('visible');
    }
}

function toggleAvailabilityPopover(btn) {
    const card = btn.closest('.product-card');
    const popover = card.querySelector('.availability-popover');
    
    if (popover) {
        // Close other popovers and deactivate other buttons first
        document.querySelectorAll('.availability-popover.visible').forEach(p => {
            if (p !== popover) p.classList.remove('visible');
        });
        document.querySelectorAll('.btn-availability.active').forEach(b => {
            if (b !== btn) b.classList.remove('active');
        });
        
        if (popover.classList.contains('visible')) {
            popover.classList.remove('visible');
            btn.classList.remove('active');
        } else {
            showAvailabilityPopover(btn);
            btn.classList.add('active');
        }
    }
}

function initReviewButtons() {
    document.querySelectorAll('.btn-write-review').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            const card = e.target.closest('.product-card');
            if (!card) return;
            
            const productId = card.dataset.id;
            const productName = card.querySelector('.product-name')?.textContent || 'Product';
            const productImage = card.querySelector('.product-image img')?.src || '';
            const productCategory = card.querySelector('.badge')?.textContent || 'Equipment';
            
            // Open review modal
            if (typeof Components !== 'undefined') {
                Components.openReviewModal({
                    id: productId,
                    name: productName,
                    image: productImage,
                    category: productCategory
                });
            }
        });
    });
}

function initPagination() {
    const ITEMS_PER_PAGE = 6;
    let currentPage = 1;

    function getVisibleProducts() {
        return Array.from(document.querySelectorAll('.product-card'))
            .filter(p => p.style.display !== 'none');
    }

    function renderPagination() {
        const paginationNav = document.getElementById('catalogPagination');
        if (!paginationNav) return;

        const visible = getVisibleProducts();
        const totalPages = Math.max(1, Math.ceil(visible.length / ITEMS_PER_PAGE));

        // Clamp current page
        if (currentPage > totalPages) currentPage = totalPages;
        if (currentPage < 1) currentPage = 1;

        // Show/hide products for current page
        visible.forEach((card, i) => {
            const pageStart = (currentPage - 1) * ITEMS_PER_PAGE;
            const pageEnd = pageStart + ITEMS_PER_PAGE;
            card.style.visibility = (i >= pageStart && i < pageEnd) ? '' : 'hidden';
            card.style.position = (i >= pageStart && i < pageEnd) ? '' : 'absolute';
            card.style.pointerEvents = (i >= pageStart && i < pageEnd) ? '' : 'none';
            card.style.height = (i >= pageStart && i < pageEnd) ? '' : '0';
            card.style.overflow = (i >= pageStart && i < pageEnd) ? '' : 'hidden';
            card.style.margin = (i >= pageStart && i < pageEnd) ? '' : '0';
            card.style.padding = (i >= pageStart && i < pageEnd) ? '' : '0';
            card.style.border = (i >= pageStart && i < pageEnd) ? '' : 'none';
        });

        // Hide pagination if 1 page or less
        if (totalPages <= 1) {
            paginationNav.classList.add('is-hidden');
            return;
        }
        paginationNav.classList.remove('is-hidden');

        // Build buttons
        let html = '';

        // Prev button
        html += `<button class="page-btn${currentPage === 1 ? ' disabled' : ''}" data-page="prev" aria-label="Previous page" ${currentPage === 1 ? 'disabled' : ''}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"></polyline></svg>
        </button>`;

        // Page numbers with ellipsis logic
        const pages = buildPageNumbers(currentPage, totalPages);
        pages.forEach(p => {
            if (p === '...') {
                html += `<span class="page-ellipsis">...</span>`;
            } else {
                html += `<button class="page-btn${p === currentPage ? ' active' : ''}" data-page="${p}">${p}</button>`;
            }
        });

        // Next button
        html += `<button class="page-btn${currentPage === totalPages ? ' disabled' : ''}" data-page="next" aria-label="Next page" ${currentPage === totalPages ? 'disabled' : ''}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
        </button>`;

        paginationNav.innerHTML = html;

        // Attach click listeners
        paginationNav.querySelectorAll('.page-btn:not(:disabled)').forEach(btn => {
            btn.addEventListener('click', () => {
                const page = btn.dataset.page;
                if (page === 'prev') {
                    currentPage = Math.max(1, currentPage - 1);
                } else if (page === 'next') {
                    currentPage = Math.min(totalPages, currentPage + 1);
                } else {
                    currentPage = parseInt(page);
                }
                renderPagination();
                document.querySelector('.products-section')?.scrollIntoView({ behavior: 'smooth' });
            });
        });
    }

    function buildPageNumbers(current, total) {
        // Always show first, last, current, and neighbors
        const pages = [];
        if (total <= 7) {
            for (let i = 1; i <= total; i++) pages.push(i);
            return pages;
        }
        pages.push(1);
        if (current > 3) pages.push('...');
        const start = Math.max(2, current - 1);
        const end = Math.min(total - 1, current + 1);
        for (let i = start; i <= end; i++) pages.push(i);
        if (current < total - 2) pages.push('...');
        pages.push(total);
        return pages;
    }

    // Expose so filterProducts/updateProductCount can re-trigger
    window._catalogPagination = { render: () => { currentPage = 1; renderPagination(); }, rerender: renderPagination };

    renderPagination();
}

function initProductModal() {
    const modal = document.getElementById('productModal');
    const closeBtn = document.getElementById('closeProductModal');
    const toggleReviewsBtn = document.getElementById('toggleReviewsBtn');
    const reviewsSection = document.getElementById('modalReviewsSection');
    
    if (!modal) return;
    
    // Close modal handlers
    closeBtn?.addEventListener('click', closeProductModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeProductModal();
    });
    
    // Escape key to close
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeProductModal();
        }
    });

    if (toggleReviewsBtn && reviewsSection) {
        toggleReviewsBtn.addEventListener('click', () => {
            const collapsed = reviewsSection.classList.toggle('collapsed');
            toggleReviewsBtn.textContent = collapsed ? 'Show reviews' : 'Hide reviews';
            toggleReviewsBtn.setAttribute('aria-expanded', collapsed ? 'false' : 'true');
        });
    }
    
    // Add click handlers to product cards (make whole card clickable)
    document.querySelectorAll('.product-card').forEach(card => {
        card.style.cursor = 'pointer';
        card.addEventListener('click', (e) => {
            // Don't open modal if clicking on action buttons
            if (e.target.closest('.product-actions') || e.target.closest('button')) {
                return;
            }
            openProductModal(card);
        });
    });
    
    // Modal action buttons
    const favoriteBtn = document.getElementById('modalFavoriteBtn');
    const cartBtn = document.getElementById('modalCartBtn');
    
    favoriteBtn?.addEventListener('click', () => {
        favoriteBtn.classList.toggle('active');
        const isActive = favoriteBtn.classList.contains('active');
        favoriteBtn.innerHTML = `
            <svg viewBox="0 0 24 24" fill="${isActive ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
            ${isActive ? 'In Favorites' : 'Add to Favorites'}
        `;
    });
    
    cartBtn?.addEventListener('click', () => {
        cartBtn.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="20 6 9 17 4 12"/>
            </svg>
            Added to Cart
        `;
        setTimeout(() => {
            cartBtn.innerHTML = `
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                </svg>
                Add to Cart
            `;
        }, 2000);
    });
}
function openProductModal(card) {
    const modal = document.getElementById('productModal');
    if (!modal || !card) return;

    // 1. Kunin ang Data mula sa Card
    const productId = card.dataset.id;
    const productName = card.querySelector('.product-name')?.textContent || 'Product';
    const fallbackImages = [
        '../../assets/images/catalog-set-1.svg',
        '../../assets/images/catalog-set-2.svg',
        '../../assets/images/catalog-set-3.svg'
    ];
    const productImageRaw = card.querySelector('.product-image')?.src || '';
    const productImage = productImageRaw && !productImageRaw.includes('placeholder')
        ? productImageRaw
        : fallbackImages[productId % fallbackImages.length];
    const productPrice = card.querySelector('.product-price')?.innerHTML || '₱0';
    const productDescription = card.querySelector('.product-description')?.textContent || '';
    const productStatus = normalizeStatus(card.dataset.status || 'available');
    const productStatusLabel = card.dataset.statusLabel || getStatusLabel(productStatus);

    // 2. I-update ang UI ng Modal
    const modalImage = document.getElementById('modalProductImage');
    if (modalImage) {
        modalImage.src = productImage;
        modalImage.alt = productName;
        modalImage.title = 'Open image in new tab';
    }

    const modalImageLink = document.getElementById('modalProductImageLink');
    if (modalImageLink) {
        modalImageLink.href = productImage;
        modalImageLink.title = 'Open image in new tab';
    }
    document.getElementById('modalProductName').textContent = productName;
    document.getElementById('modalProductPrice').innerHTML = productPrice;
    document.getElementById('modalProductDescription').textContent = productDescription;

    const modalBadge = document.getElementById('modalProductBadge');
    if (modalBadge) {
        modalBadge.textContent = productStatusLabel;
        modalBadge.className = `modal-product-badge ${productStatus}`;
    }

    // 3. ADD TO CART LOGIC (Dapat nasa LOOB ng function)
    const cartBtn = document.getElementById('modalCartBtn');
    if (cartBtn) {
        const newCartBtn = cartBtn.cloneNode(true); // Remove old listeners
        cartBtn.parentNode.replaceChild(newCartBtn, cartBtn);

        newCartBtn.addEventListener('click', () => {
            // Open the quantity modal instead of adding directly
            const card = document.querySelector(`.product-card[data-id="${productId}"]`);
            const available = card ? parseInt(card.dataset.availableUnits) || 1 : 1;
            openRentQuantityModalWithData(productId, productName, available);
        });
    }

    // 4. FAVORITE LOGIC - Check server state then setup toggle
    const favBtn = document.getElementById('modalFavoriteBtn');
    if (favBtn) {
        const newFavBtn = favBtn.cloneNode(true);
        favBtn.parentNode.replaceChild(newFavBtn, favBtn);
        newFavBtn.setAttribute('data-item-id', productId);

        // Check if item is already favorited
        fetch(`../catalog/check_favorite.php?item_id=${productId}`)
            .then(res => res.json())
            .then(data => {
                const isFav = data.favorited === true;
                newFavBtn.classList.toggle('active', isFav);
                newFavBtn.innerHTML = `
                    <svg viewBox="0 0 24 24" fill="${isFav ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                    </svg>
                    ${isFav ? 'In Favorites' : 'Add to Favorites'}
                `;
            })
            .catch(() => {
                // Default to not favorited on error
                newFavBtn.classList.remove('active');
            });

        newFavBtn.addEventListener('click', () => {
            const isActive = newFavBtn.classList.toggle('active');
            const action = isActive ? 'add' : 'remove';
            
            fetch('../catalog/add_favorite.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: `item_id=${productId}&action=${action}`
            })
            .then(res => res.json())
            .then(data => {
                if (data.success && typeof showToast === 'function') {
                    showToast(isActive ? `${productName} added to favorites` : `${productName} removed from favorites`, 'success');
                }
            })
            .catch(err => console.error('Favorite error:', err));

            newFavBtn.innerHTML = `
                <svg viewBox="0 0 24 24" fill="${isActive ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
                ${isActive ? 'In Favorites' : 'Add to Favorites'}
            `;
        });
    }

    // 5. RENDER REVIEWS & STARS
    if (typeof renderStars === 'function') renderStars(card);
    if (typeof renderReviewsAndBookings === 'function') renderReviewsAndBookings(productId);

    // Reset reviews toggle to expanded each open
    const reviewsSection = document.getElementById('modalReviewsSection');
    const toggleReviewsBtn = document.getElementById('toggleReviewsBtn');
    if (reviewsSection && toggleReviewsBtn) {
        reviewsSection.classList.remove('collapsed');
        toggleReviewsBtn.textContent = 'Hide reviews';
        toggleReviewsBtn.setAttribute('aria-expanded', 'true');
    }

    // 6. I-SHOW ANG MODAL
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}


function renderStars(card) {
    const filledStars = card.querySelectorAll('.rating-stars .filled').length;
    const starsContainer = document.getElementById('modalRatingStars');
    if (starsContainer) {
        starsContainer.innerHTML = '';
        for (let i = 1; i <= 5; i++) {
            starsContainer.innerHTML += `
                <svg viewBox="0 0 24 24" class="${i <= filledStars ? 'filled' : 'empty'}">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
            `;
        }
    }
}
function renderReviewsAndBookings(productId) {
    const availabilityList = document.getElementById('modalAvailabilityList');
    const reviewsList = document.getElementById('modalReviewsList');
    
    const bookings = typeof getProductBookings === 'function' ? getProductBookings(productId) : [];
    const reviews = typeof getProductReviews === 'function' ? getProductReviews(productId) : [];

    if (availabilityList) {
        availabilityList.innerHTML = bookings.length > 0 
            ? bookings.map(b => `<div class="availability-item"><span>${b.start} - ${b.end}</span> <span class="status-booked">Booked</span></div>`).join('')
            : '<p class="availability-empty">Available anytime!</p>';
    }

    if (reviewsList) {
        reviewsList.innerHTML = reviews.length > 0
            ? reviews.map(r => `<div class="review-item"><strong>${r.author}</strong>: ${r.text}</div>`).join('')
            : '<p>No reviews yet.</p>';
    }
}
    
    

function closeProductModal() {
    const modal = document.getElementById('productModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}


function addToCart(itemId, quantity) {
    quantity = quantity || 1;
    const formData = new FormData();
    formData.append('item_id', itemId);
    formData.append('quantity', quantity);

    // Send selected calendar dates if available
    const dates = window.catalogSelectedDates;
    if (dates && dates.start && dates.end) {
        formData.append('start_date', dates.start);
        formData.append('end_date', dates.end);
        console.log(`Adding to cart with dates: ${dates.start} → ${dates.end}`);
    } else {
        console.log('Adding to cart without dates (will use server default)');
    }
    
    fetch('../cart/add_to_cart.php', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        console.log('add_to_cart response:', data);
        if (data.success) {
            console.log("Success adding to cart");
        } else {
            if (typeof showToast === 'function') {
                showToast(data.message || 'Could not add to cart', 'error');
            } else {
                alert("Server Error: " + (data.message || 'Unknown error'));
            }
        }
    })
    .catch(err => {
        console.error("Fetch Error:", err);
    });
}

/**
 * Get bookings for a product from the server
 */
function getProductBookings(productId) {
    return []; // TODO: Fetch from API (e.g. ../catalog/get_bookings.php?item_id=productId)
}

function getProductReviews(productId) {
    return []; // TODO: Fetch from API (e.g. ../catalog/get_reviews.php?item_id=productId)
}
function showToast(message, type = 'info') {
    const existing = document.querySelector('.toast-notification');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = `toast-notification toast-${type}`;
    toast.textContent = message;

    toast.style.cssText = `
        position: fixed;
        bottom: 24px;
        right: 24px;
        padding: 14px 24px;
        background: ${type === 'success' ? '#10B981' : type === 'error' ? '#EF4444' : '#3B82F6'};
        color: white;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 500;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 99999;
        opacity: 1;
        transition: opacity .3s ease;
    `;

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}


/* =====================================================
   RENT QUANTITY MODAL LOGIC
   ===================================================== */

// State for the quantity modal
let rentQtyState = { itemId: null, itemName: '', maxQty: 1, currentQty: 1 };

/**
 * Called from the "Rent Now" button on each product card
 */
function openRentQuantityModal(buttonEl) {
    const card = buttonEl.closest('.product-card');
    if (!card) return;

    const itemId = card.dataset.id;
    const itemName = card.dataset.itemName || 'Item';
    const availableUnits = parseInt(card.dataset.availableUnits) || 0;

    openRentQuantityModalWithData(itemId, itemName, availableUnits);
}

/**
 * Open the quantity modal with specific data (used by both card button and modal cart button)
 */
function openRentQuantityModalWithData(itemId, itemName, availableUnits) {
    const modal = document.getElementById('rentQtyModal');
    if (!modal) return;

    if (availableUnits < 1) {
        showToast('This item is currently out of stock', 'error');
        return;
    }

    rentQtyState = { itemId: itemId, itemName: itemName, maxQty: availableUnits, currentQty: 1 };

    document.getElementById('rentQtyItemName').textContent = itemName;
    document.getElementById('rentQtyInput').value = 1;
    document.getElementById('rentQtyInput').max = availableUnits;
    document.getElementById('rentQtyAvailable').textContent = `Available: ${availableUnits} unit${availableUnits !== 1 ? 's' : ''}`;
    document.getElementById('rentQtyConfirmBtn').disabled = false;

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeRentQuantityModal() {
    const modal = document.getElementById('rentQtyModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// Initialize quantity modal listeners on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('rentQtyModal');
    const input = document.getElementById('rentQtyInput');
    const decreaseBtn = document.getElementById('rentQtyDecrease');
    const increaseBtn = document.getElementById('rentQtyIncrease');
    const cancelBtn = document.getElementById('rentQtyCancelBtn');
    const closeBtn = document.getElementById('closeRentQtyModal');
    const confirmBtn = document.getElementById('rentQtyConfirmBtn');

    if (decreaseBtn) {
        decreaseBtn.addEventListener('click', () => {
            let val = parseInt(input.value) || 1;
            if (val > 1) {
                input.value = val - 1;
                rentQtyState.currentQty = val - 1;
            }
        });
    }

    if (increaseBtn) {
        increaseBtn.addEventListener('click', () => {
            let val = parseInt(input.value) || 1;
            if (val < rentQtyState.maxQty) {
                input.value = val + 1;
                rentQtyState.currentQty = val + 1;
            }
        });
    }

    if (cancelBtn) cancelBtn.addEventListener('click', closeRentQuantityModal);
    if (closeBtn) closeBtn.addEventListener('click', closeRentQuantityModal);

    // Close on overlay click
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeRentQuantityModal();
        });
    }

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal && modal.classList.contains('active')) {
            closeRentQuantityModal();
        }
    });

    if (confirmBtn) {
        confirmBtn.addEventListener('click', () => {
            const qty = parseInt(input.value) || 1;
            const itemId = rentQtyState.itemId;
            const itemName = rentQtyState.itemName;

            if (!itemId) return;

            confirmBtn.disabled = true;
            confirmBtn.innerHTML = `
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18" style="animation: spin 0.8s linear infinite;">
                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                </svg>
                Adding...
            `;

            addToCart(itemId, qty);

            // Show success and close
            setTimeout(() => {
                closeRentQuantityModal();
                showToast(`${itemName} (x${qty}) added to cart!`, 'success');
                confirmBtn.disabled = false;
                confirmBtn.innerHTML = `
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
                        <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                    </svg>
                    Add to Cart
                `;
            }, 600);
        });
    }
});
