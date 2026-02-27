/**
 * RentIt - Cart Page JavaScript
 * Inayos para sa MySQL Database at UI Synchronization
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Inject components (Siguraduhing tama ang path ng components.js sa HTML)
    if (typeof Components !== 'undefined') {
        Components.injectSidebar('sidebarContainer', 'cart', 'client');
        Components.injectTopbar('topbarContainer', 'My Cart');
        Components.injectFooter('footerContainer');
    }

    // 2. Initialize functionalities
    initCartLogic();
});

const CONSTANTS = {
    DELIVERY_FEE: 150,
    SERVICE_FEE: 50,
    STORAGE_KEY: 'rentit_cart'
};

function initCartLogic() {
    const selectAll = document.getElementById('selectAll');
    const itemCheckboxes = document.querySelectorAll('.item-checkbox');
    const checkoutBtn = document.getElementById('btnCheckout');
    const removeSelectedBtn = document.getElementById('btnRemoveSelected');

    // Make cart images feel interactive and open in a new tab
    document.querySelectorAll('.cart-item-card').forEach(card => {
        const photo = card.querySelector('.cart-item-photo');
        if (photo) {
            photo.style.cursor = 'zoom-in';
            photo.title = 'Open image in new tab';
            photo.addEventListener('click', (e) => {
                e.stopPropagation();
                if (photo.src) window.open(photo.src, '_blank');
            });
        }
    });

    // --- Calculation Logic ---
    function calculateTotal() {
        let subtotal = 0;
        let selectedCount = 0;

        document.querySelectorAll('.item-checkbox:checked').forEach(cb => {
            const card = cb.closest('.cart-item-card');
            if (card) {
                // Kunin ang subtotal text ng bawat card
                const itemSubtotalText = card.querySelector('.cart-item-subtotal').textContent;
                const itemSubtotal = parseFloat(itemSubtotalText.replace(/[₱,]/g, ''));
                subtotal += itemSubtotal;
                selectedCount++;
            }
        });

        // Update Summary Display
        document.getElementById('cartSubtotal').textContent = `₱${subtotal.toLocaleString()}`;
        
        if (selectedCount > 0) {
            const total = subtotal + CONSTANTS.DELIVERY_FEE + CONSTANTS.SERVICE_FEE;
            document.getElementById('cartTotal').textContent = `₱${total.toLocaleString()}`;
            if (checkoutBtn) checkoutBtn.disabled = false;
            if (removeSelectedBtn) {
                removeSelectedBtn.disabled = false;
                removeSelectedBtn.classList.add('active');
                removeSelectedBtn.querySelector('span').textContent = `Remove Selected (${selectedCount})`;
            }
        } else {
            document.getElementById('cartTotal').textContent = `₱0`;
            if (checkoutBtn) checkoutBtn.disabled = true;
            if (removeSelectedBtn) {
                removeSelectedBtn.disabled = true;
                removeSelectedBtn.classList.remove('active');
                removeSelectedBtn.querySelector('span').textContent = `Remove Selected`;
            }
        }
    }

    window.updateItemTotal = function(id) {
        const startInput = document.getElementById(`start-${id}`);
        const endInput = document.getElementById(`end-${id}`);
        const daysDisplay = document.getElementById(`days-${id}`);
        const subtotalDisplay = document.getElementById(`subtotal-${id}`);
        const card = document.getElementById(`card-${id}`);
    
        if (!startInput || !endInput) return;
    
        const start = new Date(startInput.value);
        const end = new Date(endInput.value);
        const pricePerDay = parseFloat(card.dataset.price);
        const quantity = parseInt(card.dataset.quantity) || 1;
    
        if (end < start) {
            endInput.value = startInput.value;
            alert("End date cannot be earlier than start date.");
            return;
        }
    
     
        const diffTime = end - start;
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
    
        // UI Update - include quantity in calculation
        daysDisplay.textContent = `${diffDays} day${diffDays > 1 ? 's' : ''}`;
        const total = pricePerDay * diffDays * quantity;
        subtotalDisplay.textContent = `₱${total.toLocaleString()}`;
    
        // DATABASE UPDATE
        const formData = new FormData();
        formData.append('cart_id', id);
        formData.append('start_date', startInput.value);
        formData.append('end_date', endInput.value);
    
        fetch('update_cart.php', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (!data.success) {
                console.error("Database update failed:", data.error);
            }
        })
        .catch(error => console.error("Error:", error));
    
        calculateTotal();
    };


    // --- Delete Logic (PHP Integration) ---
    async function deleteItems(ids) {
        try {
            const formData = new FormData();
            formData.append('delete_ids', JSON.stringify(ids));

            const response = await fetch('delete_to_cart.php', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();
            if (result.success) {
                ids.forEach(id => {
                    const el = document.getElementById(`card-${id}`);
                    if (el) el.remove();
                });
                calculateTotal();
                showToast('Items removed successfully', 'success');
                
                if (document.querySelectorAll('.cart-item-card').length === 0) {
                    location.reload();
                }
            }
        } catch (error) {
            console.error("Error deleting items:", error);
            showToast('Failed to delete items from database', 'error');
        }
    }

    if (selectAll) {
        selectAll.addEventListener('change', function() {
            itemCheckboxes.forEach(cb => {
                cb.checked = this.checked;
                cb.closest('.cart-item-card').classList.toggle('selected', this.checked);
            });
            calculateTotal();
        });
    }

    itemCheckboxes.forEach(cb => {
        cb.addEventListener('change', function() {
            this.closest('.cart-item-card').classList.toggle('selected', this.checked);
            calculateTotal();
        });
    });

    if (removeSelectedBtn) {
        removeSelectedBtn.addEventListener('click', () => {
            const selected = Array.from(document.querySelectorAll('.item-checkbox:checked'))
                                 .map(cb => cb.dataset.id);
            if (selected.length > 0 && confirm(`Remove ${selected.length} item(s)?`)) {
                deleteItems(selected);
            }
        });
    }
// --- Proceed to Checkout ---
if (checkoutBtn) {
    checkoutBtn.onclick = (e) => {
        e.preventDefault(); 

        const selectedIds = [];
        const selectedData = [];
        
    
        const checkedBoxes = document.querySelectorAll('.item-checkbox:checked');
        
        console.log("Checked boxes found:", checkedBoxes.length);

        if (checkedBoxes.length === 0) {
            alert("Please select at least one item to checkout.");
            return;
        }

        checkedBoxes.forEach(cb => {
            const id = cb.getAttribute('data-id') || cb.dataset.id;
            console.log("Processing Item ID:", id); 

            const card = document.getElementById(`card-${id}`);
            
            if (card) {
                selectedIds.push(id);

            
                const daysText = document.getElementById(`days-${id}`) ? document.getElementById(`days-${id}`).textContent : "1 day";
                const startDate = document.getElementById(`start-${id}`) ? document.getElementById(`start-${id}`).value : "";
                const endDate = document.getElementById(`end-${id}`) ? document.getElementById(`end-${id}`).value : "";

                selectedData.push({
                    id: id,
                    name: card.querySelector('.cart-item-name').textContent,
                    price: parseFloat(card.dataset.price),
                    days: parseInt(daysText),
                    startDate: startDate,
                    endDate: endDate
                });
            }
        });

        if (selectedIds.length > 0) {
            const idsParam = selectedIds.join(',');
            const targetURL = `../checkout/checkout.php?items=${idsParam}`;
            
            console.log("Final Target URL:", targetURL);

           
            localStorage.setItem(CONSTANTS.STORAGE_KEY, JSON.stringify(selectedData));

        
            window.location.href = targetURL;
        }
    };
}

calculateTotal(); 
}
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type} show`;
    toast.style.position = 'fixed';
    toast.style.bottom = '20px';
    toast.style.right = '20px';
    toast.style.padding = '15px';
    toast.style.background = type === 'success' ? '#22C55E' : '#EF4444';
    toast.style.color = 'white';
    toast.style.borderRadius = '8px';
    toast.style.zIndex = '9999';
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}