/* =====================================================
   SHARED PAGINATION UTILITY
   RentIt - Client Portal
   
   Provides reusable pagination for DOM-rendered items
   (tables rows, cards, grids). Works by showing/hiding
   existing DOM elements.
   ===================================================== */

/**
 * Create a pagination controller for a set of DOM items.
 * 
 * @param {Object} config
 * @param {string} config.containerSelector  - CSS selector for the pagination nav container
 * @param {Function} config.getItems         - Function returning array of DOM elements to paginate
 * @param {number} [config.itemsPerPage=10]  - Items per page
 * @param {string} [config.scrollTarget]     - CSS selector to scroll to on page change
 * @param {Function} [config.onPageChange]   - Callback after page changes: (currentPage, totalPages)
 * @returns {Object} Pagination controller with render() and reset() methods
 */
function createPagination(config) {
    const {
        containerSelector,
        getItems,
        itemsPerPage = 10,
        scrollTarget = null,
        onPageChange = null
    } = config;

    let currentPage = 1;

    function getContainer() {
        return document.querySelector(containerSelector);
    }

    function buildPageNumbers(current, total) {
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

    function render() {
        const nav = getContainer();
        if (!nav) return;

        const items = getItems();
        const totalPages = Math.max(1, Math.ceil(items.length / itemsPerPage));

        // Clamp
        if (currentPage > totalPages) currentPage = totalPages;
        if (currentPage < 1) currentPage = 1;

        // Show/hide items
        const pageStart = (currentPage - 1) * itemsPerPage;
        const pageEnd = pageStart + itemsPerPage;

        items.forEach((item, i) => {
            const visible = (i >= pageStart && i < pageEnd);
            item.style.display = visible ? '' : 'none';
        });

        // Hide pagination if 1 page or less
        if (totalPages <= 1) {
            nav.classList.add('is-hidden');
            // Ensure all items are visible when no pagination needed
            items.forEach(item => item.style.display = '');
            return;
        }
        nav.classList.remove('is-hidden');

        // Build buttons
        let html = '';

        // Prev button
        html += `<button class="page-btn${currentPage === 1 ? ' disabled' : ''}" data-page="prev" aria-label="Previous page" ${currentPage === 1 ? 'disabled' : ''}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"></polyline></svg>
        </button>`;

        // Page numbers
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

        nav.innerHTML = html;

        // Attach click listeners
        nav.querySelectorAll('.page-btn:not(:disabled)').forEach(btn => {
            btn.addEventListener('click', () => {
                const page = btn.dataset.page;
                if (page === 'prev') {
                    currentPage = Math.max(1, currentPage - 1);
                } else if (page === 'next') {
                    currentPage = Math.min(totalPages, currentPage + 1);
                } else {
                    currentPage = parseInt(page);
                }
                render();

                // Scroll to target
                if (scrollTarget) {
                    const el = document.querySelector(scrollTarget);
                    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            });
        });

        // Callback
        if (typeof onPageChange === 'function') {
            onPageChange(currentPage, totalPages);
        }
    }

    function reset() {
        currentPage = 1;
        render();
    }

    function getCurrentPage() {
        return currentPage;
    }

    return { render, reset, getCurrentPage };
}
