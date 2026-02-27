/**
 * REPAIRS MANAGEMENT - JavaScript
 * Fetches repair tickets from the database and renders them dynamically
 */

// Initialize admin components
document.addEventListener('DOMContentLoaded', () => {
    AdminComponents.initPage('repairs');
    fetchRepairs();
    attachEventListeners();
});

const baseHref = document.querySelector('base')?.href || `${window.location.origin}/`;
function buildUrl(path) {
    const normalized = path.startsWith('/') ? path.slice(1) : path;
    return new URL(normalized, baseHref).toString();
}

let repairsData = [];

/* =================================================================
   DATA FETCHING
   ================================================================= */
async function fetchRepairs() {
    const tbody = document.getElementById('repairsTableBody');
    if (tbody) tbody.innerHTML = '<tr><td colspan="9" style="text-align:center; padding:2rem; color:var(--admin-text-muted);">Loading repairs...</td></tr>';

    try {
        const response = await fetch(buildUrl('admin/api/get_repairs.php'));
        if (!response.ok) throw new Error('Network error');
        const result = await response.json();

        if (result.success) {
            repairsData = result.data || [];
            updateStats(result.stats || {});
            renderRepairs(repairsData);
        } else {
            showTableError(result.message || 'Failed to load repairs');
        }
    } catch (err) {
        console.error('Fetch repairs error:', err);
        showTableError('Failed to load repairs from server');
    }
}

/* =================================================================
   STATS
   ================================================================= */
function updateStats(stats) {
    setStatValue('statInProgress', stats.in_progress || 0);
    setStatValue('statAwaitingParts', stats.awaiting_parts || 0);
    setStatValue('statCompleted', stats.completed || 0);
    setStatValue('statUnavailable', stats.unavailable || 0);
}

function setStatValue(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
}

/* =================================================================
   RENDERING
   ================================================================= */
function showTableError(message) {
    const tbody = document.getElementById('repairsTableBody');
    if (!tbody) return;
    tbody.innerHTML = `<tr><td colspan="9" style="text-align:center; padding:2rem; color:var(--admin-text-muted);">${escapeHtml(message)}</td></tr>`;
    updatePaginationInfo(0);
}

function renderRepairs(repairs) {
    const tbody = document.getElementById('repairsTableBody');
    if (!tbody) return;

    if (!repairs.length) {
        showTableError('No repair tickets found');
        return;
    }

    tbody.innerHTML = repairs.map(renderRepairRow).join('');
    bindActionButtons();
    updatePaginationInfo(repairs.length);
}

function renderRepairRow(repair) {
    const ticketId = `RPR-${String(repair.repair_id).padStart(3, '0')}`;
    const statusKey = normalizeStatus(repair.status);
    const priorityKey = (repair.priority || 'medium').toLowerCase();
    const statusLabel = formatStatusLabel(repair.status);
    const priorityLabel = capitalize(priorityKey);
    const createdDate = formatDate(repair.created_date);
    const etaDate = repair.eta_date ? formatDate(repair.eta_date) : 'N/A';
    const cost = repair.estimated_cost ? `₱${Number(repair.estimated_cost).toLocaleString('en-US', { minimumFractionDigits: 0 })}` : '₱0';
    const itemName = repair.item_name || `Item #${repair.item_id}`;
    const category = repair.category || 'Uncategorized';
    const qty = parseInt(repair.quantity) || 1;
    const repairingUnits = parseInt(repair.repairing_units) || 0;

    const actionButtons = buildActionButtons(repair, statusKey);

    const qtyBadge = qty > 1
        ? `<span style="font-size:0.7rem;font-weight:600;color:#92400e;background:#fef3c7;border-radius:4px;padding:1px 6px;margin-left:4px;">×${qty} units</span>`
        : '';
    const repairingInfo = repairingUnits > 0 && statusKey !== 'completed'
        ? `<span class="equipment-repairing" style="font-size:0.7rem;color:#dc2626;">${repairingUnits} unit${repairingUnits !== 1 ? 's' : ''} repairing (total)</span>`
        : '';

    return `
        <tr data-repair-id="${repair.repair_id}" data-status="${statusKey}" data-priority="${priorityKey}">
            <td class="ticket-id">
                <span class="ticket-badge">${ticketId}</span>
            </td>
            <td class="equipment-info">
                <div class="equipment-details">
                    <span class="equipment-name">${escapeHtml(itemName)}${qtyBadge}</span>
                    <span class="equipment-category">${escapeHtml(category)}</span>
                    ${repairingInfo}
                </div>
            </td>
            <td class="issue-type">
                <span class="issue-badge">${escapeHtml(repair.issue_type || 'General')}</span>
            </td>
            <td>
                <span class="priority-badge ${priorityKey}" title="${priorityLabel} priority">${priorityLabel}</span>
            </td>
            <td>
                <span class="status-badge ${statusKey}" title="${statusLabel}">${statusLabel}</span>
            </td>
            <td class="date-cell">${createdDate}</td>
            <td class="date-cell">${etaDate}</td>
            <td class="cost-cell">${cost}</td>
            <td class="actions-cell">
                <div class="action-buttons">
                    ${actionButtons}
                </div>
            </td>
        </tr>
    `;
}

function buildActionButtons(repair, statusKey) {
    const id = repair.repair_id;
    let buttons = '';

    // View button (always shown)
    buttons += `
        <button class="action-btn view-btn" title="View repair details" data-action="view" data-repair-id="${id}">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
            </svg>
        </button>`;

    // Edit button (always shown)
    buttons += `
        <button class="action-btn edit-btn" title="Edit repair ticket" data-action="edit" data-repair-id="${id}">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
        </button>`;

    if (statusKey === 'in-progress' || statusKey === 'awaiting-parts') {
        // Mark complete
        buttons += `
            <button class="action-btn complete-btn" title="Mark as completed" data-action="complete" data-repair-id="${id}">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                </svg>
            </button>`;
        // Mark unavailable
        buttons += `
            <button class="action-btn unavailable-btn" title="Set item as unavailable" data-action="unavailable" data-repair-id="${id}">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
                </svg>
            </button>`;
    } else if (statusKey === 'completed' || statusKey === 'unavailable') {
        // Make available (return to rental pool)
        buttons += `
            <button class="action-btn available-btn" title="Make available for rental" data-action="available" data-repair-id="${id}">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                    <polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
            </button>`;
    }

    return buttons;
}

/* =================================================================
   ACTION HANDLERS
   ================================================================= */
function bindActionButtons() {
    document.querySelectorAll('.action-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const button = e.currentTarget;
            const repairId = button.dataset.repairId;
            const action = button.dataset.action;
            handleRepairAction(repairId, action);
        });
    });
}

function handleRepairAction(repairId, action) {
    const repair = repairsData.find(r => String(r.repair_id) === String(repairId));
    const itemName = repair ? (repair.item_name || `Item #${repair.item_id}`) : `Repair #${repairId}`;

    switch (action) {
        case 'view':
            showRepairDetailModal(repair);
            break;
        case 'edit':
            showEditRepairModal(repair);
            break;
        case 'complete':
            showCompleteRepairModal(repair);
            break;
        case 'available':
            confirmAction(repairId, 'available', `Complete repair and set <strong>${escapeHtml(itemName)}</strong> back to Available for rental?`, 'Set Available');
            break;
        case 'unavailable':
            confirmAction(repairId, 'unavailable', `Set <strong>${escapeHtml(itemName)}</strong> as Unavailable? The item will be removed from the rental pool.`, 'Set Unavailable', 'danger');
            break;
    }
}

function confirmAction(repairId, action, message, confirmText, type) {
    if (typeof AdminComponents !== 'undefined' && AdminComponents.showModal) {
        AdminComponents.showModal({
            title: confirmText,
            content: `<p>${message}</p>`,
            confirmText: confirmText,
            cancelText: 'Cancel',
            type: type || 'default',
            onConfirm: () => executeRepairAction(repairId, action)
        });
    } else {
        const plain = message.replace(/<[^>]*>/g, '');
        if (confirm(plain)) {
            executeRepairAction(repairId, action);
        }
    }
}

/**
 * Show modal asking how many units have been repaired
 */
function showCompleteRepairModal(repair) {
    const repairId = repair.repair_id;
    const itemName = repair.item_name || `Item #${repair.item_id}`;
    const qty = parseInt(repair.quantity) || 1;

    if (qty <= 1) {
        // Single unit — just confirm directly
        confirmAction(repairId, 'complete', `Mark repair for <strong>${escapeHtml(itemName)}</strong> as completed?`, 'Mark Complete');
        return;
    }

    if (typeof AdminComponents !== 'undefined' && AdminComponents.showModal) {
        AdminComponents.showModal({
            title: 'Complete Repair',
            content: `
                <p>How many units of <strong>${escapeHtml(itemName)}</strong> have been repaired?</p>
                <div class="form-group" style="margin-top: 1rem;">
                    <label class="form-label">Units Repaired <span style="color: var(--admin-accent);">*</span></label>
                    <input type="number" class="form-input" id="unitsRepairedInput" min="1" max="${qty}" value="${qty}" required>
                    <span class="form-hint">Currently repairing: ${qty} unit${qty !== 1 ? 's' : ''} on this ticket</span>
                </div>
            `,
            confirmText: 'Mark Repaired',
            cancelText: 'Cancel',
            onConfirm: () => {
                const unitsRepaired = parseInt(document.getElementById('unitsRepairedInput')?.value) || qty;
                executeRepairAction(repairId, 'complete', unitsRepaired);
            }
        });
    } else {
        const unitsRepaired = prompt(`How many units repaired? (Max: ${qty})`, String(qty));
        if (unitsRepaired !== null && !isNaN(unitsRepaired) && parseInt(unitsRepaired) > 0) {
            executeRepairAction(repairId, 'complete', parseInt(unitsRepaired));
        }
    }
}

async function executeRepairAction(repairId, action, unitsRepaired) {
    const payload = { repair_id: repairId, action: action };
    if (unitsRepaired !== undefined) {
        payload.units_repaired = unitsRepaired;
    }

    try {
        const response = await fetch(buildUrl('admin/api/update_repair_status.php'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const result = await response.json();

        if (result.success) {
            if (typeof AdminComponents !== 'undefined') {
                AdminComponents.showToast(result.message, 'success');
            }
            fetchRepairs();
        } else {
            const msg = result.message || 'Action failed';
            if (typeof AdminComponents !== 'undefined') {
                AdminComponents.showToast(msg, 'danger');
            } else {
                alert(msg);
            }
        }
    } catch (err) {
        console.error('Repair action error:', err);
        const msg = 'Error performing action';
        if (typeof AdminComponents !== 'undefined') {
            AdminComponents.showToast(msg, 'danger');
        } else {
            alert(msg);
        }
    }
}

/* =================================================================
   REPAIR DETAIL MODAL
   ================================================================= */
function showRepairDetailModal(repair) {
    if (!repair) return;

    const ticketId = `RPR-${String(repair.repair_id).padStart(3, '0')}`;
    const statusKey = normalizeStatus(repair.status);
    const statusLabel = formatStatusLabel(repair.status);
    const priorityKey = (repair.priority || 'medium').toLowerCase();
    const priorityLabel = capitalize(priorityKey);

    // Populate modal fields
    setText('modalTicketId', ticketId);
    setText('modalEquipment', repair.item_name || `Item #${repair.item_id}`);
    setText('modalCategory', repair.category || 'Uncategorized');
    setText('modalSerial', `ITEM-${repair.item_id}`);

    // Status badge
    const statusEl = document.getElementById('modalStatus');
    if (statusEl) {
        statusEl.textContent = statusLabel;
        statusEl.className = `status-badge ${statusKey}`;
    }

    // Priority badge
    const priorityEl = document.getElementById('modalPriority');
    if (priorityEl) {
        priorityEl.textContent = priorityLabel;
        priorityEl.className = `priority-badge ${priorityKey}`;
    }

    setText('modalTechnician', '—');
    setText('modalCost', repair.estimated_cost ? `₱${Number(repair.estimated_cost).toLocaleString()}` : '₱0');

    // Description
    const descEl = document.getElementById('modalDescription');
    if (descEl) descEl.textContent = repair.notes || repair.issue_type || 'No description provided.';

    // Show modal
    const modal = document.getElementById('repairModal');
    if (modal) modal.classList.add('active');
}

function closeRepairModal() {
    const modal = document.getElementById('repairModal');
    if (modal) modal.classList.remove('active');
}

function setText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
}

/* =================================================================
   EDIT REPAIR MODAL
   ================================================================= */
function showEditRepairModal(repair) {
    if (!repair) return;

    const ticketId = `RPR-${String(repair.repair_id).padStart(3, '0')}`;
    const itemName = repair.item_name || `Item #${repair.item_id}`;
    const today = new Date().toISOString().split('T')[0];

    // Pre-fill with current values
    const currentIssue = escapeHtml(repair.issue_type || '');
    const currentPriority = (repair.priority || 'medium').toLowerCase();
    const currentStatus = normalizeStatus(repair.status);
    const currentEta = repair.eta_date || '';
    const currentCost = repair.estimated_cost || '';
    const currentNotes = escapeHtml(repair.notes || '');

    const formContent = `
        <div style="margin-bottom: 1rem;">
            <p style="color: var(--admin-text-muted); font-size: 0.875rem; margin-bottom: 0.5rem;">
                Editing <strong>${ticketId}</strong> — ${escapeHtml(itemName)}
            </p>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
            <div style="display: flex; flex-direction: column; gap: 0.375rem;">
                <label style="font-size: 0.8125rem; font-weight: 600; color: var(--admin-text-secondary);">Issue Type</label>
                <input type="text" id="editIssueType" value="${currentIssue}" placeholder="e.g. Speaker Damage"
                    style="padding: 0.5rem 0.75rem; border: 1px solid var(--admin-border-color); border-radius: var(--admin-radius-md); font-size: 0.875rem; background: var(--admin-bg-card); color: var(--admin-text-primary);">
            </div>
            <div style="display: flex; flex-direction: column; gap: 0.375rem;">
                <label style="font-size: 0.8125rem; font-weight: 600; color: var(--admin-text-secondary);">Priority</label>
                <select id="editPriority"
                    style="padding: 0.5rem 0.75rem; border: 1px solid var(--admin-border-color); border-radius: var(--admin-radius-md); font-size: 0.875rem; background: var(--admin-bg-card); color: var(--admin-text-primary);">
                    <option value="low" ${currentPriority === 'low' ? 'selected' : ''}>Low</option>
                    <option value="medium" ${currentPriority === 'medium' ? 'selected' : ''}>Medium</option>
                    <option value="high" ${currentPriority === 'high' ? 'selected' : ''}>High</option>
                </select>
            </div>
            <div style="display: flex; flex-direction: column; gap: 0.375rem;">
                <label style="font-size: 0.8125rem; font-weight: 600; color: var(--admin-text-secondary);">Status</label>
                <select id="editStatus"
                    style="padding: 0.5rem 0.75rem; border: 1px solid var(--admin-border-color); border-radius: var(--admin-radius-md); font-size: 0.875rem; background: var(--admin-bg-card); color: var(--admin-text-primary);">
                    <option value="in-progress" ${currentStatus === 'in-progress' ? 'selected' : ''}>In Progress</option>
                    <option value="awaiting-parts" ${currentStatus === 'awaiting-parts' ? 'selected' : ''}>Awaiting Parts</option>
                    <option value="completed" ${currentStatus === 'completed' ? 'selected' : ''}>Completed</option>
                    <option value="unavailable" ${currentStatus === 'unavailable' ? 'selected' : ''}>Unavailable</option>
                </select>
            </div>
            <div style="display: flex; flex-direction: column; gap: 0.375rem;">
                <label style="font-size: 0.8125rem; font-weight: 600; color: var(--admin-text-secondary);">ETA Date</label>
                <input type="date" id="editEtaDate" value="${currentEta}" min="${today}"
                    style="padding: 0.5rem 0.75rem; border: 1px solid var(--admin-border-color); border-radius: var(--admin-radius-md); font-size: 0.875rem; background: var(--admin-bg-card); color: var(--admin-text-primary);">
            </div>
            <div style="display: flex; flex-direction: column; gap: 0.375rem;">
                <label style="font-size: 0.8125rem; font-weight: 600; color: var(--admin-text-secondary);">Estimated Cost (₱)</label>
                <input type="number" id="editEstCost" value="${currentCost}" min="0" step="0.01" placeholder="0.00"
                    style="padding: 0.5rem 0.75rem; border: 1px solid var(--admin-border-color); border-radius: var(--admin-radius-md); font-size: 0.875rem; background: var(--admin-bg-card); color: var(--admin-text-primary);">
            </div>
        </div>
        <div style="display: flex; flex-direction: column; gap: 0.375rem; margin-top: 1rem;">
            <label style="font-size: 0.8125rem; font-weight: 600; color: var(--admin-text-secondary);">Notes</label>
            <textarea id="editNotes" rows="3" placeholder="Additional repair notes..."
                style="padding: 0.5rem 0.75rem; border: 1px solid var(--admin-border-color); border-radius: var(--admin-radius-md); font-size: 0.875rem; background: var(--admin-bg-card); color: var(--admin-text-primary); resize: vertical;">${currentNotes}</textarea>
        </div>
    `;

    if (typeof AdminComponents !== 'undefined' && AdminComponents.showModal) {
        AdminComponents.showModal({
            title: 'Edit Repair Ticket',
            content: formContent,
            confirmText: 'Save Changes',
            cancelText: 'Cancel',
            onConfirm: () => submitRepairEdit(repair.repair_id)
        });
    }
}

async function submitRepairEdit(repairId) {
    const today = new Date().toISOString().split('T')[0];

    const issueType = document.getElementById('editIssueType')?.value?.trim();
    const priority = document.getElementById('editPriority')?.value;
    const status = document.getElementById('editStatus')?.value;
    const etaDate = document.getElementById('editEtaDate')?.value;
    const estCost = document.getElementById('editEstCost')?.value;
    const notes = document.getElementById('editNotes')?.value?.trim();

    // Validate ETA date is not in the past
    if (etaDate && etaDate < today) {
        if (typeof AdminComponents !== 'undefined') {
            AdminComponents.showToast('ETA date cannot be in the past. Please select today or a future date.', 'danger');
        } else {
            alert('ETA date cannot be in the past.');
        }
        return;
    }

    // Validate issue type is not empty
    if (!issueType) {
        if (typeof AdminComponents !== 'undefined') {
            AdminComponents.showToast('Issue type is required.', 'danger');
        } else {
            alert('Issue type is required.');
        }
        return;
    }

    const payload = {
        repair_id: repairId,
        issue_type: issueType,
        priority: priority,
        status: status,
        eta_date: etaDate,
        estimated_cost: estCost ? parseFloat(estCost) : 0,
        notes: notes
    };

    try {
        const response = await fetch(buildUrl('admin/api/update_repair.php'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const result = await response.json();

        if (result.success) {
            if (typeof AdminComponents !== 'undefined') {
                AdminComponents.showToast('Repair ticket updated successfully', 'success');
            }
            fetchRepairs(); // Refresh the table
        } else {
            const msg = result.message || 'Failed to update repair ticket';
            if (typeof AdminComponents !== 'undefined') {
                AdminComponents.showToast(msg, 'danger');
            } else {
                alert(msg);
            }
        }
    } catch (err) {
        console.error('Edit repair error:', err);
        if (typeof AdminComponents !== 'undefined') {
            AdminComponents.showToast('Error updating repair ticket', 'danger');
        } else {
            alert('Error updating repair ticket');
        }
    }
}

/* =================================================================
   SEARCH & FILTERS
   ================================================================= */
function attachEventListeners() {
    // Search
    const searchInput = document.getElementById('searchRepairs');
    if (searchInput) {
        let timer;
        searchInput.addEventListener('input', () => {
            clearTimeout(timer);
            timer = setTimeout(applyFilters, 250);
        });
    }

    // Filters
    document.getElementById('statusFilter')?.addEventListener('change', applyFilters);
    document.getElementById('priorityFilter')?.addEventListener('change', applyFilters);
    document.getElementById('categoryFilter')?.addEventListener('change', applyFilters);

    // Modal close
    document.getElementById('closeRepairModal')?.addEventListener('click', closeRepairModal);
    document.getElementById('cancelRepairModalBtn')?.addEventListener('click', closeRepairModal);
    document.querySelector('#repairModal .modal-overlay')?.addEventListener('click', closeRepairModal);

    // Edit button inside detail modal
    document.getElementById('editRepairBtn')?.addEventListener('click', () => {
        // Find the currently viewed repair from the modal's ticket ID
        const ticketText = document.getElementById('modalTicketId')?.textContent || '';
        const match = ticketText.match(/RPR-(\d+)/);
        if (match) {
            const repairId = parseInt(match[1], 10);
            const repair = repairsData.find(r => r.repair_id == repairId);
            if (repair) {
                closeRepairModal();
                showEditRepairModal(repair);
            }
        }
    });

    // New Repair button
    document.getElementById('newRepairBtn')?.addEventListener('click', showNewRepairModal);

    // Export button
    document.getElementById('exportRepairsBtn')?.addEventListener('click', exportRepairs);
}

function applyFilters() {
    const searchTerm = (document.getElementById('searchRepairs')?.value || '').toLowerCase();
    const statusValue = document.getElementById('statusFilter')?.value || 'all';
    const priorityValue = document.getElementById('priorityFilter')?.value || 'all';
    const categoryValue = document.getElementById('categoryFilter')?.value || 'all';

    let filtered = repairsData;

    // Search
    if (searchTerm) {
        filtered = filtered.filter(r => {
            const ticketId = `RPR-${String(r.repair_id).padStart(3, '0')}`.toLowerCase();
            return ticketId.includes(searchTerm) ||
                (r.item_name || '').toLowerCase().includes(searchTerm) ||
                (r.issue_type || '').toLowerCase().includes(searchTerm);
        });
    }

    // Status filter
    if (statusValue !== 'all') {
        filtered = filtered.filter(r => normalizeStatus(r.status) === statusValue);
    }

    // Priority filter
    if (priorityValue !== 'all') {
        filtered = filtered.filter(r => (r.priority || 'medium').toLowerCase() === priorityValue);
    }

    // Category filter
    if (categoryValue !== 'all') {
        filtered = filtered.filter(r => (r.category || '').toLowerCase().includes(categoryValue));
    }

    renderRepairs(filtered);
}

/* =================================================================
   NEW REPAIR MODAL
   ================================================================= */
function showNewRepairModal() {
    if (typeof AdminComponents !== 'undefined' && AdminComponents.showModal) {
        AdminComponents.showModal({
            title: 'New Repair Ticket',
            content: `
                <p style="margin-bottom: 1rem; color: var(--admin-text-muted); font-size: 0.875rem;">
                    To create a repair ticket, go to the <strong>Items</strong> page and click the <em>Repairing</em> button on the item you want to send for repair.
                </p>
                <p style="color: var(--admin-text-muted); font-size: 0.875rem;">
                    This ensures the item status is properly synchronized with the repair ticket.
                </p>
            `,
            confirmText: 'Go to Items',
            cancelText: 'Cancel',
            onConfirm: () => {
                window.location.href = buildUrl('admin/item/item.php');
            }
        });
    }
}

/* =================================================================
   EXPORT
   ================================================================= */
function exportRepairs() {
    if (!repairsData.length) {
        if (typeof AdminComponents !== 'undefined') {
            AdminComponents.showToast('No repair data to export', 'warning');
        }
        return;
    }

    const headers = ['Ticket ID', 'Equipment', 'Category', 'Issue Type', 'Priority', 'Status', 'Created', 'ETA', 'Est. Cost', 'Notes'];
    const rows = repairsData.map(r => [
        `RPR-${String(r.repair_id).padStart(3, '0')}`,
        r.item_name || '',
        r.category || '',
        r.issue_type || '',
        r.priority || '',
        r.status || '',
        r.created_date || '',
        r.eta_date || '',
        r.estimated_cost || 0,
        (r.notes || '').replace(/"/g, '""')
    ]);

    let csv = headers.join(',') + '\n';
    rows.forEach(row => {
        csv += row.map(v => `"${v}"`).join(',') + '\n';
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `repairs_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);

    if (typeof AdminComponents !== 'undefined') {
        AdminComponents.showToast('Repairs exported successfully', 'success');
    }
}

/* =================================================================
   PAGINATION INFO
   ================================================================= */
function updatePaginationInfo(count) {
    const paginationEl = document.getElementById('repairsPagination');
    const infoEl = document.getElementById('paginationInfo');
    if (paginationEl && infoEl) {
        if (count > 0) {
            paginationEl.style.display = 'flex';
            infoEl.textContent = `Showing ${count} repair${count !== 1 ? 's' : ''}`;
        } else {
            paginationEl.style.display = 'none';
        }
    }
}

/* =================================================================
   UTILITIES
   ================================================================= */
function normalizeStatus(status) {
    if (!status) return 'in-progress';
    const s = status.toLowerCase().replace(/[_ ]/g, '-');
    if (s.includes('progress')) return 'in-progress';
    if (s.includes('awaiting') || s.includes('parts')) return 'awaiting-parts';
    if (s.includes('completed') || s.includes('complete')) return 'completed';
    if (s.includes('unavailable')) return 'unavailable';
    if (s.includes('remove')) return 'to-remove';
    return s;
}

function formatStatusLabel(status) {
    if (!status) return 'In Progress';
    const key = normalizeStatus(status);
    const labels = {
        'in-progress': 'In Progress',
        'awaiting-parts': 'Awaiting Parts',
        'completed': 'Completed',
        'unavailable': 'Unavailable',
        'to-remove': 'To Be Removed'
    };
    return labels[key] || capitalize(status);
}

function formatDate(dateStr) {
    if (!dateStr) return 'N/A';
    try {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
        return dateStr;
    }
}

function capitalize(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}
