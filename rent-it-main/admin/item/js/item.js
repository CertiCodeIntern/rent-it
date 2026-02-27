/**
 * ITEMS PAGE - JavaScript
 * Fetch and render items from the database
 */

// Resolve absolute URLs based on the current base tag or window origin
const baseHref = document.querySelector('base')?.href || `${window.location.origin}/`;
function buildUrl(path) {
    const normalizedPath = path.startsWith('/') ? path.slice(1) : path;
    return new URL(normalizedPath, baseHref).toString();
}

let itemsData = [];
let filteredItemsData = [];

// Pagination state
let currentPage = 1;
const PAGE_SIZE = 10;

document.addEventListener('DOMContentLoaded', () => {
    fetchItems();
    attachFilters();
});

async function fetchItems() {
    const tbody = document.getElementById('itemsTableBody');
    if (tbody) tbody.innerHTML = '<tr><td colspan="8">Loading...</td></tr>';

    try {
        const response = await fetch(buildUrl('admin/api/get_items.php'));
        if (!response.ok) throw new Error('Network error');
        const result = await response.json();
        if (result.success) {
            itemsData = result.data || [];
            filteredItemsData = itemsData;
            currentPage = 1;
            renderItems(filteredItemsData);
        } else {
            renderError(result.message || 'Failed to load items');
        }
    } catch (err) {
        console.error(err);
        renderError('Failed to load items');
    }
}

function renderError(message) {
    const tbody = document.getElementById('itemsTableBody');
    updatePagination(0);
}

function renderItems(items) {
    const tbody = document.getElementById('itemsTableBody');
    if (!tbody) return;

    if (!items.length) {
        renderError('No items found');
        return;
    }

    // Paginate
    const totalPages = Math.ceil(items.length / PAGE_SIZE);
    if (currentPage > totalPages) currentPage = totalPages;
    if (currentPage < 1) currentPage = 1;
    const start = (currentPage - 1) * PAGE_SIZE;
    const pageItems = items.slice(start, start + PAGE_SIZE);

    tbody.innerHTML = pageItems.map(renderItemRow).join('');

    // Bind action buttons after rendering
    bindActionButtons();
    
    // Update pagination
    updatePagination(items.length);
}

function renderItemRow(item) {
    const statusClass = getStatusClass(item.status);
    const image = item.image ? `assets/images/items/${item.image}` : '';
    const price = Number(item.price_per_day || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const deposit = item.deposit ? Number(item.deposit).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : null;
    
    // Units info  
    const totalUnits = parseInt(item.total_units) || 0;
    const availableUnits = parseInt(item.available_units) || 0;
    const repairingUnits = parseInt(item.repairing_units) || 0;
    const rentedUnits = totalUnits - availableUnits - repairingUnits;
    
    const normalizedStatus = (item.status || '').toLowerCase();
    const isBooked = normalizedStatus.includes('booked') || normalizedStatus.includes('reserved');
    const isRepairing = normalizedStatus.includes('repair') || normalizedStatus.includes('maintenance');
    const isUnavailable = normalizedStatus === 'unavailable';
    const isAvailable = normalizedStatus === 'available';

    // Visibility & Featured badges
    const isVisible = parseInt(item.is_visible) === 1;
    const isFeatured = parseInt(item.is_featured) === 1;

    // Tags
    const tags = item.tags ? item.tags.split(',').map(t => t.trim()).filter(Boolean) : [];

    let actionButtons = '';

    // Edit button always shown
    actionButtons += `
        <button class="item-action-btn item-action-edit" data-item-id="${item.item_id}" data-action="Edit" title="Edit Item" onclick="editItem(${item.item_id})">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
            Edit
        </button>`;

    if (isAvailable) {
        actionButtons += `
            <button class="item-action-btn item-action-repair" data-item-id="${item.item_id}" data-action="Repairing" title="Set to Repairing">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
                    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
                </svg>
                Repairing
            </button>
            <button class="item-action-btn item-action-unavailable" data-item-id="${item.item_id}" data-action="Unavailable" title="Set to Unavailable">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
                </svg>
                Unavailable
            </button>`;
    } else if (isRepairing || isUnavailable) {
        actionButtons += `
            <button class="item-action-btn item-action-available" data-item-id="${item.item_id}" data-action="Available" title="Set to Available">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                    <polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
                Available
            </button>`;
    } else if (isBooked) {
        actionButtons += `<span class="item-action-disabled">In Use</span>`;
    }

    return `
        <tr>
            <td>${item.item_id}</td>
            <td>
                <div class="item-cell">
                    <div class="item-thumb">
                        ${image ? `<img src="${image}" alt="${item.item_name}" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"><div class="item-thumb-placeholder" style="display:none">No Image</div>` : '<div class="item-thumb-placeholder">No Image</div>'}
                    </div>
                    <div class="item-info">
                        <div class="item-name">${escapeHtml(item.item_name || 'Unnamed')}</div>
                        <div class="item-desc">${escapeHtml(item.description || '')}</div>
                    </div>
                </div>
            </td>
            <td>${escapeHtml(item.category || 'Uncategorized')}</td>
            <td>
                <div class="item-pricing">
                    <span class="price-main">₱${price}/day</span>
                    ${deposit ? `<span class="price-deposit">Deposit: ₱${deposit}</span>` : '<span class="price-deposit">No deposit</span>'}
                </div>
            </td>
            <td>
                <div class="item-units-info">
                    <div class="units-row"><strong>Total:</strong> ${totalUnits}</div>
                    <div class="units-row"><strong>Available:</strong> <span class="units-available">${availableUnits}</span></div>
                    <div class="units-row"><strong>Rented:</strong> <span class="units-rented">${rentedUnits}</span></div>
                    <div class="units-row"><strong>Repairing:</strong> <span class="units-repairing">${repairingUnits}</span></div>
                </div>
            </td>
            <td>
                <div class="item-status-visibility">
                    <span class="status-badge ${statusClass}">${escapeHtml(item.status || 'Unknown')}</span>
                    <div class="visibility-badges">
                        <span class="visibility-badge ${isVisible ? 'visible' : 'hidden'}" title="${isVisible ? 'Visible to customers' : 'Hidden from catalog'}">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12">
                                ${isVisible
                                    ? '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>'
                                    : '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>'}
                            </svg>
                            ${isVisible ? 'Visible' : 'Hidden'}
                        </span>
                        ${isFeatured ? `<span class="visibility-badge featured" title="Featured item">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12">
                                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                            </svg>
                            Featured
                        </span>` : ''}
                    </div>
                </div>
            </td>
            <td>
                <div class="item-tags">
                    ${tags.length > 0
                        ? tags.map(tag => `<span class="item-tag">${escapeHtml(tag)}</span>`).join('')
                        : '<span class="item-no-tags">No tags</span>'}
                </div>
            </td>
            <td>${item.total_times_rented || 0}</td>
            <td>
                <div class="item-actions">
                    ${actionButtons}
                </div>
            </td>
        </tr>
    `;
}

/**
 * Bind click events for action buttons
 */
function bindActionButtons() {
    document.querySelectorAll('.item-action-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const button = e.currentTarget;
            const itemId = button.dataset.itemId;
            const action = button.dataset.action;
            handleItemStatusChange(itemId, action);
        });
    });
}

/**
 * Handle status change with confirmation
 */
function handleItemStatusChange(itemId, newStatus) {
    const item = itemsData.find(i => String(i.item_id) === String(itemId));
    const itemName = item ? item.item_name : `Item #${itemId}`;

    if (newStatus === 'Repairing') {
        showRepairingModal(itemId, itemName);
    } else if (newStatus === 'Unavailable') {
        showUnavailableModal(itemId, itemName);
    } else if (newStatus === 'Available') {
        showAvailableModal(itemId, itemName);
    }
}

/**
 * Show modal for setting item to Repairing
 */
function showRepairingModal(itemId, itemName) {
    const item = itemsData.find(i => String(i.item_id) === String(itemId));
    const maxRepairableUnits = item ? (parseInt(item.total_units) - parseInt(item.repairing_units)) : 1;
    
    if (typeof AdminComponents !== 'undefined' && AdminComponents.showModal) {
        AdminComponents.showModal({
            title: 'Set Units to Repairing',
            content: `
                <p>How many units of <strong>${escapeHtml(itemName)}</strong> need repair?</p>
                <div class="form-group" style="margin-top: 1rem;">
                    <label class="form-label">Number of Units to Repair <span style="color: var(--admin-accent);">*</span></label>
                    <input type="number" class="form-input" id="repairUnitsCount" placeholder="1" min="1" max="${maxRepairableUnits}" value="1" required>
                    <span class="form-hint">Maximum: ${maxRepairableUnits} units</span>
                </div>
                <div class="form-group">
                    <label class="form-label">Issue Type</label>
                    <input type="text" class="form-input" id="repairIssueType" placeholder="e.g., Audio Distortion, Power Failure">
                </div>
                <div class="form-group">
                    <label class="form-label">Priority</label>
                    <select class="form-select" id="repairPriority" style="width: 100%;">
                        <option value="low">Low</option>
                        <option value="medium" selected>Medium</option>
                        <option value="high">High</option>
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label">Estimated Cost (₱)</label>
                    <input type="number" class="form-input" id="repairCost" placeholder="0.00">
                </div>
                <div class="form-group">
                    <label class="form-label">ETA (Expected Completion)</label>
                    <input type="date" class="form-input" id="repairEta">
                </div>
                <div class="form-group">
                    <label class="form-label">Notes</label>
                    <textarea class="form-input" id="repairNotes" rows="2" placeholder="Describe the issue..."></textarea>
                </div>
            `,
            confirmText: 'Set to Repairing',
            cancelText: 'Cancel',
            onConfirm: () => {
                const repairUnitsCount = parseInt(document.getElementById('repairUnitsCount')?.value) || 1;
                const currentRepairingUnits = parseInt(item.repairing_units) || 0;
                const newRepairingUnits = currentRepairingUnits + repairUnitsCount;
                
                const payload = {
                    item_id: itemId,
                    repairing_units: newRepairingUnits,
                    status: 'Repairing',
                    repair_quantity: repairUnitsCount,
                    issue_type: document.getElementById('repairIssueType')?.value || 'General Maintenance',
                    priority: document.getElementById('repairPriority')?.value || 'medium',
                    estimated_cost: parseFloat(document.getElementById('repairCost')?.value) || 0,
                    eta_date: document.getElementById('repairEta')?.value || '',
                    notes: document.getElementById('repairNotes')?.value || ''
                };
                updateItemRepairUnits(payload);
            }
        });
    } else {
        const repairUnits = prompt(`How many units to repair? (Max: ${maxRepairableUnits})`, '1');
        if (repairUnits !== null && !isNaN(repairUnits) && parseInt(repairUnits) > 0) {
            const currentRepairingUnits = parseInt(item.repairing_units) || 0;
            const newRepairingUnits = currentRepairingUnits + parseInt(repairUnits);
            updateItemRepairUnits({ item_id: itemId, repairing_units: newRepairingUnits, status: 'Repairing' });
        }
    }
}

/**
 * Show modal for setting item to Unavailable
 */
function showUnavailableModal(itemId, itemName) {
    if (typeof AdminComponents !== 'undefined' && AdminComponents.showModal) {
        AdminComponents.showModal({
            title: 'Set Item to Unavailable',
            content: `
                <p>Set <strong>${escapeHtml(itemName)}</strong> to <em>Unavailable</em>? This item will not be available for rent on the client side.</p>
            `,
            confirmText: 'Set to Unavailable',
            cancelText: 'Cancel',
            type: 'danger',
            onConfirm: () => {
                updateItemStatus({ item_id: itemId, status: 'Unavailable' });
            }
        });
    } else {
        if (confirm(`Set "${itemName}" to Unavailable?`)) {
            updateItemStatus({ item_id: itemId, status: 'Unavailable' });
        }
    }
}

/**
 * Show modal for setting item back to Available
 */
function showAvailableModal(itemId, itemName) {
    if (typeof AdminComponents !== 'undefined' && AdminComponents.showModal) {
        AdminComponents.showModal({
            title: 'Set Item to Available',
            content: `
                <p>Set <strong>${escapeHtml(itemName)}</strong> back to <em>Available</em>? This item will be available for rent again.</p>
            `,
            confirmText: 'Set to Available',
            cancelText: 'Cancel',
            onConfirm: () => {
                updateItemStatus({ item_id: itemId, status: 'Available' });
            }
        });
    } else {
        if (confirm(`Set "${itemName}" back to Available?`)) {
            updateItemStatus({ item_id: itemId, status: 'Available' });
        }
    }
}

/**
 * Update item repair units via dedicated API
 */
async function updateItemRepairUnits(payload) {
    try {
        const response = await fetch(buildUrl('admin/api/update_repairing_units.php'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                item_id: payload.item_id,
                repairing_units: payload.repairing_units
            })
        });
        const result = await response.json();
        if (result.success) {
            if (typeof AdminComponents !== 'undefined') {
                AdminComponents.showToast('Repairing units updated successfully', 'success');
            }
            // Create repair ticket if details provided
            if (payload.issue_type) {
                await updateItemStatus({
                    item_id: payload.item_id,
                    status: 'Repairing',
                    repair_quantity: payload.repair_quantity || 1,
                    issue_type: payload.issue_type,
                    priority: payload.priority,
                    estimated_cost: payload.estimated_cost,
                    eta_date: payload.eta_date,
                    notes: payload.notes
                });
            }
            // Refresh the items list
            fetchItems();
        } else {
            const msg = result.message || 'Failed to update repairing units';
            if (typeof AdminComponents !== 'undefined') {
                AdminComponents.showToast(msg, 'danger');
            } else {
                alert(msg);
            }
        }
    } catch (err) {
        console.error('Error updating repair units:', err);
        if (typeof AdminComponents !== 'undefined') {
            AdminComponents.showToast('Error updating repair units', 'danger');
        } else {
            alert('Error updating repair units');
        }
    }
}

/**
 * Send status update to the API
 */
async function updateItemStatus(payload) {
    try {
        const response = await fetch(buildUrl('admin/api/update_item_status.php'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const result = await response.json();
        if (result.success) {
            if (typeof AdminComponents !== 'undefined') {
                AdminComponents.showToast(result.message, 'success');
            }
            // Refresh the items list
            fetchItems();
        } else {
            const msg = result.message || 'Failed to update status';
            if (typeof AdminComponents !== 'undefined') {
                AdminComponents.showToast(msg, 'danger');
            } else {
                alert(msg);
            }
        }
    } catch (err) {
        console.error('Status update error:', err);
        const msg = 'Error updating item status';
        if (typeof AdminComponents !== 'undefined') {
            AdminComponents.showToast(msg, 'danger');
        } else {
            alert(msg);
        }
    }
}

function getStatusClass(status) {
    const normalized = (status || '').toLowerCase();
    if (normalized.includes('unavailable')) return 'status-danger';
    if (normalized.includes('available')) return 'status-success';
    if (normalized.includes('booked') || normalized.includes('reserved')) return 'status-warning';
    if (normalized.includes('maintenance') || normalized.includes('repair')) return 'status-info';
    return 'status-default';
}

function attachFilters() {
    const searchInput = document.getElementById('itemSearchInput');
    const statusFilter = document.getElementById('statusFilter');
    const refreshBtn = document.getElementById('refreshItemsBtn');

    if (searchInput) {
        let timer;
        searchInput.addEventListener('input', () => {
            clearTimeout(timer);
            timer = setTimeout(filterItems, 250);
        });
    }

    statusFilter?.addEventListener('change', filterItems);
    refreshBtn?.addEventListener('click', fetchItems);
}

function filterItems() {
    const searchTerm = (document.getElementById('itemSearchInput')?.value || '').toLowerCase();
    const statusValue = document.getElementById('statusFilter')?.value || 'all';

    let filtered = itemsData;

    if (searchTerm) {
        filtered = filtered.filter(item =>
            (item.item_name || '').toLowerCase().includes(searchTerm) ||
            (item.category || '').toLowerCase().includes(searchTerm) ||
            (item.status || '').toLowerCase().includes(searchTerm)
        );
    }

    if (statusValue !== 'all') {
        filtered = filtered.filter(item => (item.status || '').toLowerCase() === statusValue.toLowerCase());
    }

    filteredItemsData = filtered;
    currentPage = 1;
    renderItems(filteredItemsData);
}

/**
 * Update pagination controls
 */
function updatePagination(totalItems) {
    const paginationContainer = document.querySelector('.items-pagination');
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
    if (info) info.textContent = `Showing ${start}-${end} of ${totalItems} items`;

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
    renderItems(filteredItemsData);
}

/**
 * Initialize pagination event listeners
 */
document.addEventListener('DOMContentLoaded', () => {
    const prevBtn = document.getElementById('prevPageBtn');
    const nextBtn = document.getElementById('nextPageBtn');
    
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                renderItems(filteredItemsData);
            }
        });
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            const totalPages = Math.ceil(filteredItemsData.length / PAGE_SIZE);
            if (currentPage < totalPages) {
                currentPage++;
                renderItems(filteredItemsData);
            }
        });
    }
});

/**
 * Navigate to edit item page
 */
function editItem(itemId) {
    window.location.href = buildUrl(`admin/newitem/newitem.php?edit=${itemId}`);
}

function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}
