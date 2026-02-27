/**
 * =====================================================
 * NEW ITEM PAGE - JavaScript
 * Handles form functionality for adding new rental items
 * =====================================================
 */

// Resolve absolute URLs based on the current base tag or window origin
const baseHref = document.querySelector('base')?.href || `${window.location.origin}/`;
function buildUrl(path) {
    const normalizedPath = path.startsWith('/') ? path.slice(1) : path;
    return new URL(normalizedPath, baseHref).toString();
}

// Edit mode state
let isEditMode = false;
let editItemId = null;
let droppedFile = null; // Store file from drag & drop

document.addEventListener('DOMContentLoaded', function() {
    initImageUpload();
    initTagsInput();
    initFormValidation();
    initAvailableUnitsCalculation();

    // Detect edit mode from URL
    const urlParams = new URLSearchParams(window.location.search);
    const editId = urlParams.get('edit');
    if (editId) {
        isEditMode = true;
        editItemId = editId;
        loadItemForEdit(editId);
    }
});

/**
 * Initialize auto-calculation of available units
 */
function initAvailableUnitsCalculation() {
    const totalUnitsInput = document.getElementById('totalUnits');
    const repairingUnitsInput = document.getElementById('repairingUnits');
    const availableUnitsInput = document.getElementById('availableUnits');

    function calculateAvailableUnits() {
        if (!totalUnitsInput || !repairingUnitsInput || !availableUnitsInput) return;
        
        const totalUnits = parseInt(totalUnitsInput.value) || 0;
        const repairingUnits = parseInt(repairingUnitsInput.value) || 0;
        
        // In edit mode, calculate from stored original values
        let rentedUnits = 0;
        
        if (isEditMode && editItemId) {
            // Calculate rented units from the original data
            const originalTotal = parseInt(totalUnitsInput.dataset.original || totalUnits);
            const originalRepairing = parseInt(repairingUnitsInput.dataset.original || 0);
            const originalAvailable = parseInt(availableUnitsInput.dataset.original || totalUnits);
            rentedUnits = Math.max(0, originalTotal - originalAvailable - originalRepairing);
            
            // Update hint to show breakdown
            const hintEl = availableUnitsInput.nextElementSibling;
            if (hintEl && hintEl.classList.contains('form-hint')) {
                hintEl.innerHTML = `Auto-calculated: ${totalUnits} total - ${rentedUnits} rented - ${repairingUnits} repairing = <strong>${Math.max(0, totalUnits - rentedUnits - repairingUnits)}</strong>`;
            }
        }
        
        // Calculate: Available = Total - Rented - Repairing
        const calculatedAvailable = Math.max(0, totalUnits - rentedUnits - repairingUnits);
        availableUnitsInput.value = calculatedAvailable;
    }

    // Add event listeners
    if (totalUnitsInput) {
        totalUnitsInput.addEventListener('input', calculateAvailableUnits);
    }
    if (repairingUnitsInput) {
        repairingUnitsInput.addEventListener('input', calculateAvailableUnits);
    }
    
    // Initial calculation
    calculateAvailableUnits();
}

/**
 * Load item data for editing
 */
async function loadItemForEdit(itemId) {
    try {
        const response = await fetch(buildUrl(`admin/api/get_item.php?id=${itemId}`));
        const result = await response.json();

        if (!result.success) {
            showNotification(result.message || 'Failed to load item', 'error');
            return;
        }

        const item = result.data;

        // Update page title and button text
        const pageTitle = document.querySelector('.admin-page-title');
        if (pageTitle) pageTitle.textContent = 'Edit Item';

        const pageSubtitle = document.querySelector('.admin-page-subtitle');
        if (pageSubtitle) pageSubtitle.textContent = 'Update the details for this rental item';

        const saveBtn = document.getElementById('saveItemBtn');
        if (saveBtn) {
            saveBtn.innerHTML = `
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                    <polyline points="17 21 17 13 7 13 7 21"/>
                    <polyline points="7 3 7 8 15 8"/>
                </svg>
                Update Item
            `;
        }

        // Update browser title
        document.title = 'Edit Item - RentIt Admin';

        // Populate form fields
        setVal('itemName', item.item_name);
        setVal('itemDescription', item.description);
        setSelect('itemCategory', item.category);
        setVal('dailyRate', item.price_per_day);
        setVal('depositAmount', item.deposit);
        setVal('totalUnits', item.total_units);
        setVal('availableUnits', item.available_units);
        setVal('repairingUnits', item.repairing_units);
        
        // Store original values for calculation
        const availableUnitsEl = document.getElementById('availableUnits');
        const repairingUnitsEl = document.getElementById('repairingUnits');
        const totalUnitsEl = document.getElementById('totalUnits');
        if (availableUnitsEl) availableUnitsEl.dataset.original = item.available_units;
        if (repairingUnitsEl) repairingUnitsEl.dataset.original = item.repairing_units;
        if (totalUnitsEl) totalUnitsEl.dataset.original = item.total_units;
        
        setSelect('itemCondition', item.condition);
        setSelect('itemStatus', item.status);
        setVal('itemTags', item.tags || '');

        // Set toggles
        const isVisibleEl = document.getElementById('isVisible');
        if (isVisibleEl) isVisibleEl.checked = item.is_visible == 1;

        const isFeaturedEl = document.getElementById('isFeatured');
        if (isFeaturedEl) isFeaturedEl.checked = item.is_featured == 1;

        // Show existing image if available
        if (item.image) {
            const preview = document.getElementById('imagePreview');
            const placeholder = document.getElementById('uploadPlaceholder');
            const removeBtn = document.getElementById('removeImageBtn');
            if (preview) {
                preview.onerror = function() {
                    this.style.display = 'none';
                    if (placeholder) {
                        placeholder.style.display = 'flex';
                        placeholder.querySelector('p').textContent = 'Image not found';
                        placeholder.querySelector('span').textContent = 'Upload a new image';
                    }
                    if (removeBtn) removeBtn.style.display = 'none';
                };
                preview.src = buildUrl(`assets/images/items/${item.image}`);
                preview.style.display = 'block';
                if (placeholder) placeholder.style.display = 'none';
                if (removeBtn) removeBtn.style.display = 'inline-flex';
            }
        }

        // Trigger tags preview update
        const tagsInput = document.getElementById('itemTags');
        if (tagsInput) tagsInput.dispatchEvent(new Event('input'));

    } catch (error) {
        console.error('Error loading item for edit:', error);
        showNotification('Failed to load item data', 'error');
    }
}

/** Helper: set input value */
function setVal(id, value) {
    const el = document.getElementById(id);
    if (el && value !== null && value !== undefined) el.value = value;
}

/** Helper: set select value */
function setSelect(id, value) {
    const el = document.getElementById(id);
    if (!el || !value) return;
    // Try exact match first, then case-insensitive
    for (const opt of el.options) {
        if (opt.value === value || opt.value.toLowerCase() === value.toLowerCase()) {
            el.value = opt.value;
            return;
        }
    }
}

/**
 * Initialize Image Upload Functionality
 */
function initImageUpload() {
    const uploadArea = document.getElementById('imageUploadArea');
    const fileInput = document.getElementById('itemImage');
    const preview = document.getElementById('imagePreview');
    const placeholder = document.getElementById('uploadPlaceholder');
    const removeBtn = document.getElementById('removeImageBtn');

    if (!uploadArea || !fileInput) return;

    // Drag and drop handlers
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });

    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('dragover');
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        
        const files = e.dataTransfer.files;
        if (files.length > 0 && files[0].type.startsWith('image/')) {
            droppedFile = files[0];
            handleImageFile(files[0]);
        }
    });

    // File input change
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            droppedFile = null; // Clear dropped file since user picked via input
            handleImageFile(e.target.files[0]);
        }
    });

    // Remove image button
    if (removeBtn) {
        removeBtn.addEventListener('click', () => {
            fileInput.value = '';
            droppedFile = null;
            preview.style.display = 'none';
            preview.src = '';
            placeholder.style.display = 'flex';
            removeBtn.style.display = 'none';
        });
    }

    function handleImageFile(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            preview.src = e.target.result;
            preview.style.display = 'block';
            placeholder.style.display = 'none';
            if (removeBtn) removeBtn.style.display = 'inline-flex';
        };
        reader.readAsDataURL(file);
    }
}

/**
 * Initialize Tags Input
 */
function initTagsInput() {
    const tagsInput = document.getElementById('itemTags');
    const tagsPreview = document.getElementById('tagsPreview');

    if (!tagsInput || !tagsPreview) return;

    tagsInput.addEventListener('input', updateTagsPreview);
    tagsInput.addEventListener('blur', updateTagsPreview);

    function updateTagsPreview() {
        const value = tagsInput.value.trim();
        if (!value) {
            tagsPreview.innerHTML = '';
            return;
        }

        const tags = value.split(',')
            .map(tag => tag.trim())
            .filter(tag => tag.length > 0);

        tagsPreview.innerHTML = tags.map(tag => `
            <span class="tag-pill">
                ${escapeHtml(tag)}
            </span>
        `).join('');
    }
}

/**
 * Initialize Form Validation and Submission
 */
function initFormValidation() {
    const form = document.getElementById('newItemForm');
    const saveBtn = document.getElementById('saveItemBtn');

    if (!form || !saveBtn) return;

    saveBtn.addEventListener('click', async (e) => {
        e.preventDefault();

        // Basic validation
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        // Image validation — require image for new items
        const imageInput = document.getElementById('itemImage');
        const imagePreview = document.getElementById('imagePreview');
        const hasFileInput = imageInput && imageInput.files.length > 0;
        const hasDroppedFile = droppedFile !== null;
        const hasExistingImage = imagePreview && imagePreview.style.display !== 'none' && imagePreview.src && !imagePreview.src.startsWith('data:');

        if (!isEditMode && !hasFileInput && !hasDroppedFile) {
            showNotification('Please upload an image for the item.', 'error');
            return;
        }

        // Collect form data
        const formData = collectFormData();

        // Show loading state
        saveBtn.disabled = true;
        saveBtn.innerHTML = `
            <svg class="spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
            </svg>
            Saving...
        `;

        try {
            // Send to API
            const result = await saveItemToDatabase(formData);

            if (result.success) {
                // Show success message
                showNotification(isEditMode ? 'Item updated successfully!' : 'Item created successfully!', 'success');

                // Redirect to items page after short delay
                setTimeout(() => {
                    window.location.href = buildUrl('admin/item/item.php');
                }, 1500);
            } else {
                throw new Error(result.message || 'Failed to save item');
            }

        } catch (error) {
            console.error('Error saving item:', error);
            showNotification(error.message || 'Failed to save item. Please try again.', 'error');

            // Reset button state
            saveBtn.disabled = false;
            saveBtn.innerHTML = `
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                    <polyline points="17 21 17 13 7 13 7 21"/>
                    <polyline points="7 3 7 8 15 8"/>
                </svg>
                ${isEditMode ? 'Update Item' : 'Save Item'}
            `;
        }
    });
}

/**
 * Collect all form data
 */
function collectFormData() {
    return {
        name: document.getElementById('itemName')?.value || '',
        description: document.getElementById('itemDescription')?.value || '',
        category: document.getElementById('itemCategory')?.value || '',
        dailyRate: parseFloat(document.getElementById('dailyRate')?.value) || 0,
        depositAmount: parseFloat(document.getElementById('depositAmount')?.value) || 0,
        totalUnits: parseInt(document.getElementById('totalUnits')?.value) || 1,
        availableUnits: parseInt(document.getElementById('availableUnits')?.value) || 1,
        repairingUnits: parseInt(document.getElementById('repairingUnits')?.value) || 0,
        condition: document.getElementById('itemCondition')?.value || 'Good',
        status: document.getElementById('itemStatus')?.value || 'Available',
        isVisible: document.getElementById('isVisible')?.checked ? 1 : 0,
        isFeatured: document.getElementById('isFeatured')?.checked ? 1 : 0,
        tags: (document.getElementById('itemTags')?.value || '').trim()
    };
}

/**
 * Save item to database via API
 */
async function saveItemToDatabase(data) {
    // Get image file if present
    const imageInput = document.getElementById('itemImage');
    const hasImage = (imageInput && imageInput.files.length > 0) || droppedFile !== null;

    // Determine API endpoint
    const apiEndpoint = isEditMode ? 'admin/api/update_item.php' : 'admin/api/add_item.php';

    // Map form data to database fields
    const apiData = {
        item_name: data.name,
        description: data.description,
        category: data.category,
        price_per_day: data.dailyRate,
        deposit: data.depositAmount || null,
        condition: data.condition,
        status: data.status,
        total_units: data.totalUnits,
        available_units: data.availableUnits,
        repairing_units: data.repairingUnits,
        is_visible: data.isVisible,
        is_featured: data.isFeatured,
        tags: data.tags || null,
        image: ''
    };

    // Include item_id for edit mode
    if (isEditMode && editItemId) {
        apiData.item_id = editItemId;
    }

    // Use FormData if we have an image to upload
    if (hasImage) {
        const formData = new FormData();
        const imageFile = (imageInput && imageInput.files.length > 0) ? imageInput.files[0] : droppedFile;
        formData.append('itemImage', imageFile);
        for (const [key, value] of Object.entries(apiData)) {
            if (value !== null) {
                formData.append(key, value);
            }
        }

        const response = await fetch(buildUrl(apiEndpoint), {
            method: 'POST',
            body: formData
        });
        if (!response.ok) {
            throw new Error('Network error while saving item');
        }
        return await response.json();
    } else {
        // Send as JSON if no image
        const response = await fetch(buildUrl(apiEndpoint), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(apiData)
        });
        if (!response.ok) {
            throw new Error('Network error while saving item');
        }
        return await response.json();
    }
}

/**
 * Show notification toast
 */
function showNotification(message, type = 'info') {
    // Check if AdminComponents has notification method
    if (typeof AdminComponents !== 'undefined' && AdminComponents.showToast) {
        AdminComponents.showToast(message, type);
        return;
    }

    // Fallback simple notification
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <span>${message}</span>
    `;
    notification.style.cssText = `
        position: fixed;
        bottom: 24px;
        right: 24px;
        padding: 14px 20px;
        background: ${type === 'success' ? '#10B981' : type === 'error' ? '#EF4444' : '#3B82F6'};
        color: white;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 500;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 9999;
        animation: slideIn 0.3s ease;
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Add CSS animation keyframes
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }
    .spin {
        animation: spin 1s linear infinite;
    }
`;
document.head.appendChild(style);
