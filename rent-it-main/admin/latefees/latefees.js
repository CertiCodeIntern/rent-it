/**
 * =====================================================
 * LATE FEES TRACKER - JavaScript
 * Fetches overdue rentals from DB and renders dynamically
 * =====================================================
 */

// Initialize admin components
document.addEventListener('DOMContentLoaded', () => {
    AdminComponents.initPage('latefees');
    fetchLateFees();
    attachEventListeners();
});

const baseHref = document.querySelector('base')?.href || `${window.location.origin}/`;
function buildUrl(path) {
    const normalized = path.startsWith('/') ? path.slice(1) : path;
    return new URL(normalized, baseHref).toString();
}

let overdueData = [];
let filteredOverdueData = [];

// Pagination state
let currentPage = 1;
const PAGE_SIZE = 10;

// ─────────────────────────────────────────────────────
// DATA FETCHING
// ─────────────────────────────────────────────────────

async function fetchLateFees() {
    try {
        // Check if order_id is in URL params
        const urlParams = new URLSearchParams(window.location.search);
        const orderId = urlParams.get('order_id');

        let url = buildUrl('admin/api/get_latefees.php');
        if (orderId) {
            url += `?order_id=${encodeURIComponent(orderId)}`;
        }

        const response = await fetch(url);
        const data = await response.json();

        if (!data.success) {
            throw new Error(data.message || 'Failed to fetch late fees');
        }

        overdueData = data.overdue || [];
        filteredOverdueData = overdueData;
        currentPage = 1;
        updateStats(data.stats);
        renderOverdueItems(filteredOverdueData);

    } catch (error) {
        console.error('Error fetching late fees:', error);
        AdminComponents.showToast?.('Failed to load late fees data', 'error');

        const list = document.getElementById('overdueList');
        if (list) {
            list.innerHTML = `
                <div class="overdue-empty" style="text-align:center;padding:2rem;">
                    <p style="color:var(--admin-text-secondary);">Failed to load data. Please refresh.</p>
                </div>
            `;
        }
    }
}

// ─────────────────────────────────────────────────────
// STATS UPDATE
// ─────────────────────────────────────────────────────

function updateStats(stats) {
    if (!stats) return;

    const setVal = (id, val) => {
        const el = document.getElementById(id);
        if (el) el.textContent = val;
    };

    setVal('statOutstandingFees', formatCurrency(stats.total_outstanding));
    setVal('statOverdueRentals', stats.overdue_count);
    setVal('statCollectedMonth', formatCurrency(stats.collected_month));
    setVal('statRemindersSent', stats.reminders_sent);
}

// ─────────────────────────────────────────────────────
// RENDERING
// ─────────────────────────────────────────────────────

function renderOverdueItems(items) {
    const list = document.getElementById('overdueList');
    const emptyState = document.getElementById('overdueEmpty');
    if (!list) return;

    if (!items || items.length === 0) {
        list.innerHTML = '';
        if (emptyState) {
            emptyState.style.display = 'flex';
            emptyState.style.flexDirection = 'column';
            emptyState.style.alignItems = 'center';
            emptyState.style.justifyContent = 'center';
            emptyState.style.padding = '3rem 1rem';
        }
        updatePagination(0);
        return;
    }

    if (emptyState) emptyState.style.display = 'none';

    // Paginate
    const totalPages = Math.ceil(items.length / PAGE_SIZE);
    if (currentPage > totalPages) currentPage = totalPages;
    if (currentPage < 1) currentPage = 1;
    const start = (currentPage - 1) * PAGE_SIZE;
    const pageItems = items.slice(start, start + PAGE_SIZE);

    list.innerHTML = pageItems.map(item => renderOverdueCard(item)).join('');
    
    // Update pagination
    updatePagination(items.length);
}

function renderOverdueCard(rental) {
    const daysOverdue = rental.days_overdue;
    const priority = rental.priority; // critical, warning, mild
    const itemNames = rental.items.map(i => i.item_name).join(', ');
    const priorityTitle = `${priority.charAt(0).toUpperCase() + priority.slice(1)}: ${daysOverdue} day${daysOverdue !== 1 ? 's' : ''} overdue`;

    return `
        <div class="overdue-item ${priority}" data-id="${rental.order_id}" data-days="${daysOverdue}">
            <div class="overdue-priority">
                <span class="priority-indicator ${priority}" title="${priorityTitle}"></span>
            </div>
            <div class="overdue-main">
                <div class="overdue-customer">
                    <span class="customer-name">${escapeHtml(rental.customer.name)}</span>
                    <span class="customer-email">${escapeHtml(rental.customer.email)}</span>
                </div>
                <div class="overdue-details">
                    <span class="equipment-name">${escapeHtml(rental.order_id_formatted)} — ${escapeHtml(itemNames)}</span>
                    <span class="days-overdue">${daysOverdue} day${daysOverdue !== 1 ? 's' : ''} overdue</span>
                </div>
            </div>
            <div class="overdue-fee">
                <span class="fee-amount">${formatCurrency(rental.late_fee)}</span>
                <span class="fee-label">Late Fee</span>
            </div>
            <div class="overdue-actions">
                <button class="action-btn call-btn" title="Show phone number" onclick="togglePhone(this, '${escapeHtml(rental.customer.phone || 'N/A')}')">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                    </svg>
                </button>
                <button class="action-btn reminder-btn" title="Send reminder" data-action="remind" onclick="openReminder(${rental.order_id})">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                        <polyline points="22,6 12,13 2,6"/>
                    </svg>
                </button>
                <button class="action-btn resolve-btn" title="Mark as resolved" data-action="resolve" onclick="resolveItem(${rental.order_id})">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="20 6 9 17 4 12"/>
                    </svg>
                </button>
            </div>
        </div>
    `;
}

// ─────────────────────────────────────────────────────
// EVENT LISTENERS
// ─────────────────────────────────────────────────────

function attachEventListeners() {
    // Filter dropdown
    const filterSelect = document.getElementById('overdueFilter');
    if (filterSelect) {
        filterSelect.addEventListener('change', () => {
            filterOverdueItems(filterSelect.value);
        });
    }

    // Send All Reminders
    const sendAllBtn = document.getElementById('sendAllRemindersBtn');
    if (sendAllBtn) {
        sendAllBtn.addEventListener('click', sendAllReminders);
    }

    // Modal close buttons
    const closeBtn = document.getElementById('closeReminderModal');
    const cancelBtn = document.getElementById('cancelReminderBtn');
    const overlay = document.querySelector('#reminderModal .modal-overlay');

    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (cancelBtn) cancelBtn.addEventListener('click', closeModal);
    if (overlay) overlay.addEventListener('click', closeModal);

    // Send Reminder button in modal
    const sendBtn = document.getElementById('sendReminderBtn');
    if (sendBtn) sendBtn.addEventListener('click', sendReminder);

    // Template select change
    const templateSelect = document.getElementById('templateSelect');
    if (templateSelect) {
        templateSelect.addEventListener('change', (e) => {
            updateEmailTemplate(e.target.value);
        });
    }

    // Template "Use" buttons
    document.querySelectorAll('.template-btn.use').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const templateItem = e.target.closest('.template-item');
            const templateType = templateItem?.dataset.template;
            if (templateType) {
                useTemplate(templateType);
            }
        });
    });

    // Pagination buttons
    const prevBtn = document.getElementById('prevPageBtn');
    const nextBtn = document.getElementById('nextPageBtn');
    
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                renderOverdueItems(filteredOverdueData);
            }
        });
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            const totalPages = Math.ceil(filteredOverdueData.length / PAGE_SIZE);
            if (currentPage < totalPages) {
                currentPage++;
                renderOverdueItems(filteredOverdueData);
            }
        });
    }

    // Template "Edit" buttons
    document.querySelectorAll('.template-btn.edit').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const templateItem = e.target.closest('.template-item');
            const templateType = templateItem?.dataset.template;
            if (templateType) {
                openEditTemplateModal(templateType);
            }
        });
    });

    // Add Template button
    const addTemplateBtn = document.getElementById('addTemplateBtn');
    if (addTemplateBtn) {
        addTemplateBtn.addEventListener('click', () => {
            openAddTemplateModal();
        });
    }

    // Template Modal close/cancel/save
    const closeTemplateBtn = document.getElementById('closeTemplateModal');
    const cancelTemplateBtn = document.getElementById('cancelTemplateBtn');
    const saveTemplateBtn = document.getElementById('saveTemplateBtn');
    const templateOverlay = document.querySelector('#templateModal .modal-overlay');

    if (closeTemplateBtn) closeTemplateBtn.addEventListener('click', closeTemplateModal);
    if (cancelTemplateBtn) cancelTemplateBtn.addEventListener('click', closeTemplateModal);
    if (templateOverlay) templateOverlay.addEventListener('click', closeTemplateModal);
    if (saveTemplateBtn) saveTemplateBtn.addEventListener('click', saveTemplate);

    // Manage Templates button
    const manageTemplatesBtn = document.getElementById('manageTemplatesBtn');
    if (manageTemplatesBtn) {
        manageTemplatesBtn.addEventListener('click', () => {
            // Scroll to templates section and highlight it
            const templatesCard = document.querySelector('.templates-card');
            if (templatesCard) {
                templatesCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
                templatesCard.style.outline = '2px solid var(--admin-accent)';
                templatesCard.style.outlineOffset = '4px';
                setTimeout(() => {
                    templatesCard.style.outline = 'none';
                }, 2000);
            }
        });
    }
}

// ─────────────────────────────────────────────────────
// FILTER
// ─────────────────────────────────────────────────────

function filterOverdueItems(filter) {
    if (filter === 'all') {
        filteredOverdueData = overdueData;
    } else {
        filteredOverdueData = overdueData.filter(item => {
            const days = item.days_overdue;
            switch (filter) {
                case '1-3': return days >= 1 && days <= 3;
                case '4-7': return days >= 4 && days <= 7;
                case '7+':  return days > 7;
                default:    return true;
            }
        });
    }

    currentPage = 1;
    renderOverdueItems(filteredOverdueData);
}

/**
 * Update pagination controls
 */
function updatePagination(totalItems) {
    const paginationContainer = document.getElementById('overduePagination');
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
    if (info) info.textContent = `Showing ${start}-${end} of ${totalItems} items`;

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
    renderOverdueItems(filteredOverdueData);
}

// ─────────────────────────────────────────────────────
// REMINDER MODAL
// ─────────────────────────────────────────────────────

let currentReminderId = null;
let selectedTemplateKey = null; // set by "Use" button

function openReminder(orderId) {
    const rental = overdueData.find(r => Number(r.order_id) === Number(orderId));
    if (!rental) return;

    currentReminderId = orderId;

    // Populate modal
    const recipientEl = document.getElementById('reminderRecipient');
    const emailEl = document.getElementById('reminderEmail');
    if (recipientEl) recipientEl.textContent = rental.customer.name;
    if (emailEl) emailEl.textContent = rental.customer.email;

    // Set template: use pre-selected if available, otherwise auto-detect by severity
    const templateSelect = document.getElementById('templateSelect');
    if (templateSelect) {
        let templateKey;
        if (selectedTemplateKey && editableTemplates[selectedTemplateKey]) {
            templateKey = selectedTemplateKey;
            // Ensure option exists in the dropdown
            if (!templateSelect.querySelector(`option[value="${templateKey}"]`)) {
                const opt = document.createElement('option');
                opt.value = templateKey;
                opt.textContent = editableTemplates[templateKey].name;
                templateSelect.insertBefore(opt, templateSelect.querySelector('option[value="custom"]'));
            }
        } else if (rental.days_overdue >= 7) {
            templateKey = 'final';
        } else if (rental.days_overdue >= 4) {
            templateKey = 'urgent';
        } else {
            templateKey = 'gentle';
        }
        templateSelect.value = templateKey;
        updateEmailTemplate(templateKey, rental);
    }

    // Show modal
    const modal = document.getElementById('reminderModal');
    if (modal) modal.classList.add('open');
}

function closeModal() {
    const modal = document.getElementById('reminderModal');
    if (modal) modal.classList.remove('open');
    currentReminderId = null;
}

function updateEmailTemplate(templateType, rental) {
    if (!rental && currentReminderId) {
        rental = overdueData.find(r => r.order_id === currentReminderId);
    }

    const customerName = rental?.customer?.name || '[Customer Name]';
    const itemNames = rental?.items?.map(i => i.item_name).join(', ') || '[Equipment Name]';
    const dueDate = rental?.end_date || '[Due Date]';
    const lateFee = rental ? formatCurrency(rental.late_fee) : '₱[Amount]';
    const daysOverdue = rental?.days_overdue || '[X]';

    // Use the editable templates store
    const template = editableTemplates[templateType] || editableTemplates.gentle;

    const replacePlaceholders = (str) => {
        return str
            .replace(/\[Customer Name\]/g, customerName)
            .replace(/\[Equipment Name\]/g, itemNames)
            .replace(/\[Due Date\]/g, dueDate)
            .replace(/\[Late Fee Amount\]/g, lateFee)
            .replace(/\[Amount\]/g, lateFee)
            .replace(/\[X\]/g, daysOverdue);
    };

    const subjectEl = document.getElementById('emailSubject');
    const bodyEl = document.getElementById('emailBody');
    if (subjectEl) subjectEl.value = replacePlaceholders(template.subject);
    if (bodyEl) bodyEl.value = replacePlaceholders(template.body);
}

function sendReminder() {
    if (!currentReminderId) return;

    const rental = overdueData.find(r => Number(r.order_id) === Number(currentReminderId));
    if (!rental) return;

    // In a real app, this would call an API to send the email
    AdminComponents.showToast?.(`Reminder sent to ${rental.customer.name}`, 'success');
    closeModal();

    // Add to activity list
    addActivity('sent', `Reminder sent to ${rental.customer.name}`);
}

function sendAllReminders() {
    if (overdueData.length === 0) {
        AdminComponents.showToast?.('No overdue rentals to send reminders for', 'info');
        return;
    }

    if (!confirm(`Send reminders to all ${overdueData.length} overdue customers?`)) return;

    AdminComponents.showToast?.(`Reminders sent to ${overdueData.length} customers`, 'success');
    addActivity('sent', `Bulk reminders sent (${overdueData.length} customers)`);
}

// ─────────────────────────────────────────────────────
// ACTIONS
// ─────────────────────────────────────────────────────

function togglePhone(btn, phone) {
    // If already showing phone, revert to icon
    if (btn.classList.contains('phone-revealed')) {
        btn.classList.remove('phone-revealed');
        btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>`;
        btn.title = 'Show phone number';
        return;
    }
    btn.classList.add('phone-revealed');
    btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="12" height="12"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg> ${phone}`;
    btn.title = phone;
}

function resolveItem(orderId) {
    const rental = overdueData.find(r => Number(r.order_id) === Number(orderId));
    if (!rental) return;

    if (!confirm(`Mark ${rental.order_id_formatted} as resolved?`)) return;

    AdminComponents.showToast?.(`${rental.order_id_formatted} marked as resolved`, 'success');
    addActivity('resolved', `Late fee resolved for ${rental.customer.name}`);

    // Remove from local data and re-render
    overdueData = overdueData.filter(r => Number(r.order_id) !== Number(orderId));
    filteredOverdueData = filteredOverdueData.filter(r => Number(r.order_id) !== Number(orderId));
    renderOverdueItems(filteredOverdueData);

    // Update stats locally
    const statsOutstanding = document.getElementById('statOutstandingFees');
    const statsCount = document.getElementById('statOverdueRentals');
    if (statsOutstanding) {
        const total = overdueData.reduce((sum, r) => sum + r.late_fee, 0);
        statsOutstanding.textContent = formatCurrency(total);
    }
    if (statsCount) statsCount.textContent = overdueData.length;
}

// ─────────────────────────────────────────────────────
// ACTIVITY LOG (client-side only)
// ─────────────────────────────────────────────────────

function addActivity(type, text) {
    const activityList = document.querySelector('.activity-list');
    if (!activityList) return;

    // Hide empty state if present
    const emptyState = document.getElementById('activityEmptyState');
    if (emptyState) emptyState.style.display = 'none';

    const icons = {
        sent: `<path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4 20-7z"/>`,
        resolved: `<polyline points="20 6 9 17 4 12"/>`,
        call: `<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>`
    };

    const activityHtml = `
        <div class="activity-item" style="animation: fadeIn 0.3s ease;">
            <div class="activity-icon ${type}">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    ${icons[type] || icons.sent}
                </svg>
            </div>
            <div class="activity-info">
                <span class="activity-text">${escapeHtml(text)}</span>
                <span class="activity-time">Just now</span>
            </div>
        </div>
    `;

    activityList.insertAdjacentHTML('afterbegin', activityHtml);
}

// ─────────────────────────────────────────────────────
// TEMPLATE MANAGEMENT
// ─────────────────────────────────────────────────────

// Editable templates store (keyed by template type)
const editableTemplates = {
    gentle: {
        name: 'Gentle Reminder',
        subject: 'Rental Return Reminder - [Equipment Name]',
        body: `Hi [Customer Name],\n\nThis is a friendly reminder that your rental of [Equipment Name] was due on [Due Date].\n\nYour current late fee is: ₱[Late Fee Amount]\n\nPlease return the equipment at your earliest convenience to avoid additional charges. If you have already returned the item, please disregard this message.\n\nIf you need to extend your rental, please contact us at (02) 8123-4567.\n\nThank you for your understanding.\n\nBest regards,\nSound Rental Team`
    },
    urgent: {
        name: 'Urgent Notice',
        subject: 'URGENT: Rental [X] Days Overdue - [Equipment Name]',
        body: `Dear [Customer Name],\n\nURGENT: Your rental of [Equipment Name] is now [X] days overdue.\n\nAccrued late fee: ₱[Late Fee Amount]\n\nPlease return the equipment immediately to prevent further charges. Late fees continue to accumulate daily.\n\nIf you are unable to return the items, please contact us immediately at (02) 8123-4567.\n\nRegards,\nSound Rental Team`
    },
    final: {
        name: 'Final Warning',
        subject: 'FINAL NOTICE: Immediate Return Required - [Equipment Name]',
        body: `Dear [Customer Name],\n\nFINAL NOTICE: Your rental of [Equipment Name] is [X] days overdue with a total late fee of ₱[Late Fee Amount].\n\nThis is our final notice before escalation. Please return all equipment within 24 hours or we will be forced to take further action, which may include additional penalties.\n\nContact us immediately at (02) 8123-4567.\n\nSound Rental Management`
    },
    payment: {
        name: 'Payment Request',
        subject: 'Payment Due: Late Fees of ₱[Late Fee Amount]',
        body: `Dear [Customer Name],\n\nYou have an outstanding late fee of ₱[Late Fee Amount] for the rental of [Equipment Name] (due: [Due Date]).\n\nPlease settle the payment at your earliest convenience. You can pay via:\n- Bank transfer\n- GCash/Maya\n- In-person at our office\n\nFor questions, contact us at (02) 8123-4567.\n\nThank you,\nSound Rental Team`
    },
    custom: {
        name: 'Custom Message',
        subject: 'Regarding Your Rental - [Equipment Name]',
        body: ''
    }
};

let templateModalMode = null; // 'edit' or 'add'
let templateEditingKey = null; // key being edited
let templateCounter = 0; // for generating unique keys for new templates

/**
 * "Use" button - marks template as active (used next time reminder is opened)
 */
function useTemplate(templateType) {
    const template = editableTemplates[templateType];
    if (!template) return;

    // Store the selected template key
    selectedTemplateKey = templateType;

    // Visually highlight the active template
    document.querySelectorAll('.template-item').forEach(el => el.classList.remove('active'));
    const activeItem = document.querySelector(`.template-item[data-template="${templateType}"]`);
    if (activeItem) activeItem.classList.add('active');

    AdminComponents.showToast?.(`"${template.name}" template selected`, 'info');
}

/**
 * Replace placeholder tokens in subject & body with real rental data
 */
function fillTemplatePlaceholders(rental) {
    const subjectEl = document.getElementById('emailSubject');
    const bodyEl = document.getElementById('emailBody');
    if (!rental) return;

    const customerName = rental.customer?.name || '[Customer Name]';
    const itemNames = rental.items?.map(i => i.item_name).join(', ') || '[Equipment Name]';
    const dueDate = rental.end_date || '[Due Date]';
    const lateFee = formatCurrency(rental.late_fee);
    const daysOverdue = rental.days_overdue || '[X]';

    const replacePlaceholders = (str) => {
        return str
            .replace(/\[Customer Name\]/g, customerName)
            .replace(/\[Equipment Name\]/g, itemNames)
            .replace(/\[Due Date\]/g, dueDate)
            .replace(/\[Late Fee Amount\]/g, lateFee)
            .replace(/\[Amount\]/g, lateFee)
            .replace(/\[X\]/g, daysOverdue);
    };

    if (subjectEl) subjectEl.value = replacePlaceholders(subjectEl.value);
    if (bodyEl) bodyEl.value = replacePlaceholders(bodyEl.value);
}

/**
 * Open the template modal in "Edit" mode
 */
function openEditTemplateModal(templateType) {
    const template = editableTemplates[templateType];
    if (!template) return;

    templateModalMode = 'edit';
    templateEditingKey = templateType;

    const titleEl = document.getElementById('templateModalTitle');
    const nameInput = document.getElementById('templateNameInput');
    const subjectInput = document.getElementById('templateSubjectInput');
    const bodyInput = document.getElementById('templateBodyInput');

    if (titleEl) titleEl.textContent = 'Edit Template';
    if (nameInput) nameInput.value = template.name;
    if (subjectInput) subjectInput.value = template.subject;
    if (bodyInput) bodyInput.value = template.body;

    const modal = document.getElementById('templateModal');
    if (modal) modal.classList.add('open');
}

/**
 * Open the template modal in "Add" mode
 */
function openAddTemplateModal() {
    templateModalMode = 'add';
    templateEditingKey = null;

    const titleEl = document.getElementById('templateModalTitle');
    const nameInput = document.getElementById('templateNameInput');
    const subjectInput = document.getElementById('templateSubjectInput');
    const bodyInput = document.getElementById('templateBodyInput');

    if (titleEl) titleEl.textContent = 'Add New Template';
    if (nameInput) nameInput.value = '';
    if (subjectInput) subjectInput.value = '';
    if (bodyInput) bodyInput.value = '';

    const modal = document.getElementById('templateModal');
    if (modal) modal.classList.add('open');
}

/**
 * Close the template modal
 */
function closeTemplateModal() {
    const modal = document.getElementById('templateModal');
    if (modal) modal.classList.remove('open');
    templateModalMode = null;
    templateEditingKey = null;
}

/**
 * Save the template (edit or add)
 */
function saveTemplate() {
    const nameInput = document.getElementById('templateNameInput');
    const subjectInput = document.getElementById('templateSubjectInput');
    const bodyInput = document.getElementById('templateBodyInput');

    const name = nameInput?.value.trim();
    const subject = subjectInput?.value.trim();
    const body = bodyInput?.value.trim();

    if (!name) {
        AdminComponents.showToast?.('Please enter a template name', 'error');
        nameInput?.focus();
        return;
    }
    if (!body) {
        AdminComponents.showToast?.('Please enter a message body', 'error');
        bodyInput?.focus();
        return;
    }

    if (templateModalMode === 'edit' && templateEditingKey) {
        // Update existing template
        editableTemplates[templateEditingKey].name = name;
        editableTemplates[templateEditingKey].subject = subject;
        editableTemplates[templateEditingKey].body = body;

        // Update the DOM preview
        const templateItem = document.querySelector(`.template-item[data-template="${templateEditingKey}"]`);
        if (templateItem) {
            const nameEl = templateItem.querySelector('.template-name');
            const previewEl = templateItem.querySelector('.template-preview');
            if (nameEl) nameEl.textContent = name;
            if (previewEl) previewEl.textContent = body.substring(0, 50) + (body.length > 50 ? '...' : '');
        }

        // Also update the reminder modal's template select option text
        const templateSelect = document.getElementById('templateSelect');
        if (templateSelect) {
            const opt = templateSelect.querySelector(`option[value="${templateEditingKey}"]`);
            if (opt) opt.textContent = name;
        }

        AdminComponents.showToast?.(`"${name}" template updated`, 'success');

    } else if (templateModalMode === 'add') {
        // Generate a unique key
        templateCounter++;
        const newKey = 'custom_' + templateCounter + '_' + Date.now();

        // Store in editableTemplates
        editableTemplates[newKey] = { name, subject, body };

        // Add to the template list DOM
        const templatesList = document.querySelector('.templates-list');
        if (templatesList) {
            const newItem = document.createElement('div');
            newItem.className = 'template-item';
            newItem.dataset.template = newKey;
            newItem.innerHTML = `
                <div class="template-info">
                    <span class="template-name">${escapeHtml(name)}</span>
                    <span class="template-preview">${escapeHtml(body.substring(0, 50))}${body.length > 50 ? '...' : ''}</span>
                </div>
                <div class="template-actions">
                    <button class="template-btn use" title="Use this template">Use</button>
                    <button class="template-btn edit" title="Edit template">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                    </button>
                </div>
            `;

            // Attach event listeners to new buttons
            newItem.querySelector('.template-btn.use').addEventListener('click', () => useTemplate(newKey));
            newItem.querySelector('.template-btn.edit').addEventListener('click', () => openEditTemplateModal(newKey));

            templatesList.appendChild(newItem);
        }

        // Also add to the reminder modal's template select dropdown
        const templateSelect = document.getElementById('templateSelect');
        if (templateSelect) {
            const opt = document.createElement('option');
            opt.value = newKey;
            opt.textContent = name;
            // Insert before "Custom Message" option
            const customOpt = templateSelect.querySelector('option[value="custom"]');
            if (customOpt) {
                templateSelect.insertBefore(opt, customOpt);
            } else {
                templateSelect.appendChild(opt);
            }
        }

        AdminComponents.showToast?.(`"${name}" template added`, 'success');
    }

    closeTemplateModal();
}

// ─────────────────────────────────────────────────────
// UTILITY
// ─────────────────────────────────────────────────────

function formatCurrency(amount) {
    return '₱' + Number(amount || 0).toLocaleString('en-PH', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
    });
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text || '';
    return div.innerHTML;
}

function formatDate(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' });
}
