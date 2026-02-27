/**
 * RentIt - Checkout Page JavaScript
 * Manages checkout functionality and order confirmation
 */

document.addEventListener('DOMContentLoaded', () => {
    // Inject shared components
    if (typeof Components !== 'undefined') {
        Components.injectSidebar('sidebarContainer', 'cart', 'client');
        Components.injectTopbar('topbarContainer', 'Checkout');
        Components.injectFooter('footerContainer');
    }

    // Initialize checkout functionality
    generateReceiptId();
    initDeliveryOptions();
    initPaymentOptions();
    initPromoCode();
});

/**
 * Constants
 */
const DELIVERY_FEES = {
    standard: 150,
    express: 300,
    pickup: 0
};
const SERVICE_FEE = 50;

/**
 * Generate unique receipt ID
 */
function generateReceiptId() {
    const receiptIdEl = document.getElementById('receiptId');
    if (!receiptIdEl) return;
    
    const year = new Date().getFullYear();
    const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
    receiptIdEl.textContent = `RIT-${year}-${randomPart}`;
}

/**
 * Initialize delivery options
 */
function initDeliveryOptions() {
    const deliveryOptions = document.querySelectorAll('.delivery-option');
    
    deliveryOptions.forEach(option => {
        option.addEventListener('click', () => {
            // Remove selected from all
            deliveryOptions.forEach(opt => opt.classList.remove('selected'));
            
            // Add selected to clicked
            option.classList.add('selected');
            option.querySelector('input').checked = true;
            
            // Update totals
            updateOrderSummary();
        });
    });
}

/**
 * Initialize payment options
 */
function initPaymentOptions() {
    const paymentOptions = document.querySelectorAll('.payment-option');
    
    paymentOptions.forEach(option => {
        option.addEventListener('click', () => {
            // Remove selected from all
            paymentOptions.forEach(opt => opt.classList.remove('selected'));
            
            // Add selected to clicked
            option.classList.add('selected');
            option.querySelector('input').checked = true;
        });
    });
}



/**
 * Initialize promo code functionality
 */
function initPromoCode() {
    const promoInput = document.getElementById('promoCode');
    const applyBtn = document.getElementById('btnApplyPromo');
    
    if (!promoInput || !applyBtn) return;
    
    applyBtn.addEventListener('click', () => {
        const code = promoInput.value.trim().toUpperCase();
        
        if (!code) {
            showToast('Please enter a promo code', 'error');
            return;
        }
        
        // Sample promo codes
        const promoCodes = {
            'WELCOME10': 10,
            'RENTIT20': 20,
            'SAVE15': 15
        };
        
        if (promoCodes[code]) {
            const discount = promoCodes[code];
            applyDiscount(discount);
            promoInput.disabled = true;
            applyBtn.textContent = 'Applied';
            applyBtn.disabled = true;
            showToast(`Promo code applied! ${discount}% discount`, 'success');
        } else {
            showToast('Invalid promo code', 'error');
        }
    });
}


function applyDiscount(percentage) {
    const subtotalEl = document.getElementById('summarySubtotal');
    const discountRow = document.getElementById('discountRow');
    const discountEl = document.getElementById('summaryDiscount');
    
    if (!subtotalEl || !discountRow || !discountEl) return;
    
    const subtotal = parseFloat(subtotalEl.textContent.replace(/[₱,]/g, ''));
    const discountAmount = Math.round(subtotal * (percentage / 100));
    
    discountEl.textContent = `-₱${discountAmount.toLocaleString()}`;
    discountRow.style.display = 'flex';
    
    discountRow.dataset.discount = discountAmount;
    
    updateOrderSummary();
}
function updateOrderSummary() {
    const subtotalEl = document.getElementById('summarySubtotal');
    const deliveryEl = document.getElementById('summaryDelivery');
    const totalEl = document.getElementById('summaryTotal');

    if (!subtotalEl || !deliveryEl || !totalEl) return;

    // Kunin ang subtotal at tanggalin ang lahat ng non-numeric characters maliban sa decimal point
    const subtotal = parseFloat(subtotalEl.textContent.replace(/[^\d.]/g, ''));
    
    const selectedDelivery = document.querySelector('input[name="delivery"]:checked');
    const deliveryType = selectedDelivery ? selectedDelivery.value : 'standard';
    const deliveryFee = DELIVERY_FEES[deliveryType];

    deliveryEl.textContent = deliveryFee === 0 ? 'Free' : `₱${deliveryFee.toLocaleString(undefined, {minimumFractionDigits: 2})}`;

    // Siguraduhin na SERVICE_FEE ay defined sa taas ng JS mo (50)
    let total = subtotal + deliveryFee + SERVICE_FEE;

    totalEl.textContent = `₱${total.toLocaleString(undefined, {minimumFractionDigits: 2})}`;
}


/**
 * Toast notification helper
 */
function showToast(message, type = 'success') {
    // Remove existing toasts
    document.querySelectorAll('.toast').forEach(t => t.remove());
    
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    const iconSvg = type === 'success' 
        ? '<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="#22C55E" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>'
        : '<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="#EF4444" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>';
    
    toast.innerHTML = `
        ${iconSvg}
        <span class="toast-message">${message}</span>
    `;
    
    // Add toast styles if not present
    if (!document.getElementById('toastStyles')) {
        const style = document.createElement('style');
        style.id = 'toastStyles';
        style.textContent = `
            .toast {
                position: fixed;
                bottom: 2rem;
                right: 2rem;
                display: flex;
                align-items: center;
                gap: 0.75rem;
                padding: 1rem 1.5rem;
                background: var(--card-bg);
                border: 1px solid var(--border-color);
                border-radius: var(--border-radius);
                box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
                z-index: 9999;
                transform: translateX(120%);
                transition: transform 0.3s ease;
            }
            .toast.show {
                transform: translateX(0);
            }
            .toast-icon {
                width: 20px;
                height: 20px;
                flex-shrink: 0;
            }
            .toast-message {
                font-size: 0.9rem;
                color: var(--text-primary);
            }
            @keyframes spin {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
            }
        `;
        document.head.appendChild(style);
    }
    
    document.body.appendChild(toast);
    
    // Trigger animation
    requestAnimationFrame(() => {
        toast.classList.add('show');
    });
    
    // Auto-remove after 4 seconds
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}
