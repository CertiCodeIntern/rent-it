/**
 * Item Description Page JavaScript
 * Handles loading product details, favorites, cart actions, reviews, and availability calendar
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize page components
    initComponents();
    loadProductDetails();
    initImageGallery();
    initActionButtons();
    initAvailabilityCalendar();
    initReviews();
});

/**
 * Initialize shared components (sidebar, topbar, footer)
 */
function initComponents() {
    if (typeof createSidebar === 'function') {
        const sidebarContainer = document.getElementById('sidebarContainer');
        if (sidebarContainer) {
            sidebarContainer.innerHTML = createSidebar('client');
            initSidebar();
        }
    }

    if (typeof createTopbar === 'function') {
        const topbarContainer = document.getElementById('topbarContainer');
        if (topbarContainer) {
            topbarContainer.innerHTML = createTopbar();
            initTopbar();
        }
    }

    if (typeof createFooter === 'function') {
        const footerContainer = document.getElementById('footerContainer');
        if (footerContainer) {
            footerContainer.innerHTML = createFooter();
        }
    }
}

/**
 * Load product details from URL parameters
 */
function loadProductDetails() {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');

    if (!productId) {
        console.log('No product ID specified, showing default product');
        return;
    }

    // In a real app, this would fetch from an API
    // For now, we'll use sample data
    const sampleProducts = {
        '1': {
            id: 1,
            name: 'Karaoke King Pro v2',
            category: 'Premium',
            price: 120,
            status: 'available',
            rating: 4.5,
            reviewCount: 24,
            description: 'The Karaoke King Pro v2 is our most popular premium videoke machine, featuring enhanced audio quality, a massive song library of over 20,000 tracks, and dual wireless microphones. Perfect for parties, family gatherings, and special events.',
            features: [
                'Dual wireless microphones',
                '20,000+ song library',
                'HDMI & Bluetooth connectivity',
                'Echo & voice effects',
                'Built-in 500W speakers'
            ],
            images: [
                'karaoke-king-v2.jpg'
            ]
        },
        '2': {
            id: 2,
            name: 'Basic Videoke Set',
            category: 'Basic',
            price: 80,
            status: 'available',
            rating: 4.0,
            reviewCount: 18,
            description: 'A reliable and affordable videoke set perfect for small gatherings and home parties. Includes one wireless microphone and access to our core song library.',
            features: [
                'Single wireless microphone',
                '10,000+ song library',
                'HDMI output',
                'Basic echo effects',
                'Compact design'
            ],
            images: []
        },
        '3': {
            id: 3,
            name: 'Videoke Party System',
            category: 'Premium',
            price: 150,
            status: 'limited',
            rating: 4.8,
            reviewCount: 32,
            description: 'The ultimate party setup with professional-grade audio, LED lighting effects, and an extensive song library. Comes with 4 wireless microphones for group performances.',
            features: [
                '4 wireless microphones',
                '30,000+ song library',
                'LED light show effects',
                'Professional 1000W speakers',
                'Touchscreen interface'
            ],
            images: []
        }
    };

    const product = sampleProducts[productId];

    if (product) {
        updateProductDisplay(product);
    }
}

/**
 * Update the page with product data
 */
function updateProductDisplay(product) {
    // Update breadcrumb
    const breadcrumbItem = document.getElementById('breadcrumbItem');
    if (breadcrumbItem) breadcrumbItem.textContent = product.name;

    // Update page title
    document.title = `RentIt - ${product.name}`;

    // Update product info
    const productTitle = document.getElementById('productTitle');
    if (productTitle) productTitle.textContent = product.name;

    const productCategory = document.getElementById('productCategory');
    if (productCategory) productCategory.textContent = product.category;

    const priceAmount = document.getElementById('priceAmount');
    if (priceAmount) priceAmount.textContent = `₱${product.price}`;

    const productDescription = document.getElementById('productDescription');
    if (productDescription) productDescription.textContent = product.description;

    const productStatus = document.getElementById('productStatus');
    if (productStatus) {
        productStatus.textContent = product.status.charAt(0).toUpperCase() + product.status.slice(1);
        productStatus.className = `product-status ${product.status}`;
    }

    // Update features
    const featuresList = document.getElementById('featuresList');
    if (featuresList && product.features) {
        featuresList.innerHTML = product.features.map(feature => `
            <li>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="20 6 9 17 4 12"/>
                </svg>
                ${feature}
            </li>
        `).join('');
    }

    // Update rating stars
    updateRatingStars(product.rating);

    // Update review count
    const reviewCount = document.getElementById('reviewCount');
    if (reviewCount) reviewCount.textContent = product.reviewCount;

    // Store product ID in data attribute for cart/favorites
    document.body.dataset.productId = product.id;
}

/**
 * Update rating stars display
 */
function updateRatingStars(rating) {
    const ratingStars = document.getElementById('ratingStars');
    if (!ratingStars) return;

    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    let starsHtml = '';

    // Full stars
    for (let i = 0; i < fullStars; i++) {
        starsHtml += `<svg viewBox="0 0 24 24" class="star filled"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`;
    }

    // Half star
    if (hasHalfStar) {
        starsHtml += `<svg viewBox="0 0 24 24" class="star half"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`;
    }

    // Empty stars
    for (let i = 0; i < emptyStars; i++) {
        starsHtml += `<svg viewBox="0 0 24 24" class="star empty"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`;
    }

    ratingStars.innerHTML = starsHtml;
}

/**
 * Initialize image gallery
 */
function initImageGallery() {
    const mainImage = document.getElementById('mainImage');
    const mainImageLink = document.getElementById('mainImageLink');
    const thumbnailGallery = document.getElementById('thumbnailGallery');

    if (!thumbnailGallery || !mainImage) return;

    if (mainImageLink && mainImage.src) {
        mainImageLink.href = mainImage.src;
        mainImageLink.title = 'Open image in new tab';
    }

    const thumbnails = thumbnailGallery.querySelectorAll('.thumbnail');

    thumbnails.forEach(thumbnail => {
        thumbnail.addEventListener('click', function() {
            const imgSrc = this.dataset.img;
            if (imgSrc) {
                mainImage.src = imgSrc;
                if (mainImageLink) {
                    mainImageLink.href = imgSrc;
                }
                
                // Update active state
                thumbnails.forEach(t => t.classList.remove('active'));
                this.classList.add('active');
            }
        });
    });
}

/**
 * Initialize action buttons (Add to Cart, Favorites, Share)
 */
function initActionButtons() {
    const btnAddToCart = document.getElementById('btnAddToCart');
    const btnAddFavorite = document.getElementById('btnAddFavorite');
    const btnShare = document.getElementById('btnShare');

    if (btnAddToCart) {
        btnAddToCart.addEventListener('click', handleAddToCart);
    }

    if (btnAddFavorite) {
        // Check if already favorited
        checkFavoriteStatus();
        btnAddFavorite.addEventListener('click', handleToggleFavorite);
    }

    if (btnShare) {
        btnShare.addEventListener('click', handleShare);
    }
}

/**
 * Handle Add to Cart action
 */
function handleAddToCart() {
    const productId = document.body.dataset.productId || '1';
    const productTitle = document.getElementById('productTitle')?.textContent || 'Item';
    const priceAmount = document.getElementById('priceAmount')?.textContent || '₱120';

    // In a real app, this would add to cart via API
    // For now, store in localStorage
    let cart = JSON.parse(localStorage.getItem('rentit_cart') || '[]');
    
    const existingItem = cart.find(item => item.id === productId);
    if (existingItem) {
        showToast('Item is already in your cart', 'info');
        return;
    }

    cart.push({
        id: productId,
        name: productTitle,
        price: parseInt(priceAmount.replace(/[^\d]/g, '')),
        addedAt: new Date().toISOString()
    });

    localStorage.setItem('rentit_cart', JSON.stringify(cart));
    showToast('Added to cart successfully!', 'success');

    // Update cart badge if exists
    updateCartBadge(cart.length);
}

/**
 * Check if product is already favorited
 */
function checkFavoriteStatus() {
    const productId = document.body.dataset.productId || '1';
    const favorites = JSON.parse(localStorage.getItem('rentit_favorites') || '[]');
    const btnAddFavorite = document.getElementById('btnAddFavorite');

    if (btnAddFavorite && favorites.includes(productId)) {
        btnAddFavorite.classList.add('active');
    }
}

/**
 * Handle Toggle Favorite action
 */
function handleToggleFavorite() {
    const productId = document.body.dataset.productId || '1';
    const btnAddFavorite = document.getElementById('btnAddFavorite');
    
    let favorites = JSON.parse(localStorage.getItem('rentit_favorites') || '[]');
    
    if (favorites.includes(productId)) {
        // Remove from favorites
        favorites = favorites.filter(id => id !== productId);
        btnAddFavorite.classList.remove('active');
        showToast('Removed from favorites', 'info');
    } else {
        // Add to favorites
        favorites.push(productId);
        btnAddFavorite.classList.add('active');
        showToast('Added to favorites!', 'success');
    }

    localStorage.setItem('rentit_favorites', JSON.stringify(favorites));
}

/**
 * Handle Share action
 */
function handleShare() {
    const productTitle = document.getElementById('productTitle')?.textContent || 'Product';
    const url = window.location.href;

    if (navigator.share) {
        navigator.share({
            title: `RentIt - ${productTitle}`,
            text: `Check out ${productTitle} on RentIt!`,
            url: url
        }).catch(err => console.log('Share failed:', err));
    } else {
        // Fallback: Copy to clipboard
        navigator.clipboard.writeText(url).then(() => {
            showToast('Link copied to clipboard!', 'success');
        }).catch(() => {
            showToast('Failed to copy link', 'error');
        });
    }
}

/**
 * Initialize availability calendar
 */
function initAvailabilityCalendar() {
    const calendarContainer = document.getElementById('bookingsCalendar');
    if (!calendarContainer) return;

    const today = new Date();
    renderCalendar(today.getFullYear(), today.getMonth());
}

/**
 * Render calendar for a specific month
 */
function renderCalendar(year, month) {
    const calendarContainer = document.getElementById('bookingsCalendar');
    if (!calendarContainer) return;

    const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                    'July', 'August', 'September', 'October', 'November', 'December'];
    const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDay = firstDay.getDay();
    const totalDays = lastDay.getDate();
    const today = new Date();

    // Sample booked dates (in a real app, fetch from API)
    const bookedDates = [14, 15, 16]; // Feb 14-16 are booked

    let calendarHtml = `
        <div class="calendar-header">
            <div class="calendar-month-nav">
                <button class="calendar-nav-btn" onclick="navigateMonth(-1, ${year}, ${month})">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="15 18 9 12 15 6"/>
                    </svg>
                </button>
                <span class="calendar-month-title">${months[month]} ${year}</span>
                <button class="calendar-nav-btn" onclick="navigateMonth(1, ${year}, ${month})">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="9 18 15 12 9 6"/>
                    </svg>
                </button>
            </div>
        </div>
        <div class="calendar-weekdays">
            ${weekdays.map(day => `<div class="calendar-weekday">${day}</div>`).join('')}
        </div>
        <div class="calendar-days">
    `;

    // Empty cells before first day
    for (let i = 0; i < startDay; i++) {
        calendarHtml += `<div class="calendar-day empty"></div>`;
    }

    // Days of the month
    for (let day = 1; day <= totalDays; day++) {
        const isToday = today.getDate() === day && today.getMonth() === month && today.getFullYear() === year;
        const isBooked = bookedDates.includes(day);
        
        let dayClass = 'calendar-day';
        if (isToday) dayClass += ' today';
        if (isBooked) dayClass += ' booked';
        else dayClass += ' available';

        calendarHtml += `<div class="${dayClass}">${day}</div>`;
    }

    calendarHtml += `</div>`;

    calendarContainer.innerHTML = calendarHtml;
}

/**
 * Navigate calendar months
 */
window.navigateMonth = function(direction, currentYear, currentMonth) {
    let newMonth = currentMonth + direction;
    let newYear = currentYear;

    if (newMonth < 0) {
        newMonth = 11;
        newYear--;
    } else if (newMonth > 11) {
        newMonth = 0;
        newYear++;
    }

    renderCalendar(newYear, newMonth);
};

/**
 * Initialize reviews functionality
 */
function initReviews() {
    const btnWriteReview = document.getElementById('btnWriteReview');
    const btnLoadMore = document.getElementById('btnLoadMore');

    if (btnWriteReview) {
        btnWriteReview.addEventListener('click', handleWriteReview);
    }

    if (btnLoadMore) {
        btnLoadMore.addEventListener('click', handleLoadMoreReviews);
    }

    // Initialize helpful buttons
    const helpfulButtons = document.querySelectorAll('.btn-helpful');
    helpfulButtons.forEach(btn => {
        btn.addEventListener('click', handleHelpfulClick);
    });
}

/**
 * Handle Write Review button click
 */
function handleWriteReview() {
    // In a real app, this would open a review modal or redirect to review form
    showToast('Review feature coming soon!', 'info');
}

/**
 * Handle Load More Reviews button click
 */
function handleLoadMoreReviews() {
    // In a real app, this would fetch more reviews from API
    showToast('Loading more reviews...', 'info');
}

/**
 * Handle Helpful button click
 */
function handleHelpfulClick(e) {
    const btn = e.currentTarget;
    const currentCount = parseInt(btn.textContent.match(/\d+/)?.[0] || 0);
    
    if (btn.classList.contains('voted')) {
        btn.classList.remove('voted');
        btn.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
                <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/>
            </svg>
            Helpful (${currentCount - 1})
        `;
    } else {
        btn.classList.add('voted');
        btn.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
                <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/>
            </svg>
            Helpful (${currentCount + 1})
        `;
        showToast('Thanks for your feedback!', 'success');
    }
}

/**
 * Update cart badge
 */
function updateCartBadge(count) {
    const cartBadge = document.querySelector('.cart-badge');
    if (cartBadge) {
        cartBadge.textContent = count;
        cartBadge.style.display = count > 0 ? 'flex' : 'none';
    }
}

/**
 * Show toast notification
 */
function showToast(message, type = 'info') {
    // Check if toast container exists
    let toastContainer = document.querySelector('.toast-container');
    
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.className = 'toast-container';
        toastContainer.style.cssText = `
            position: fixed;
            bottom: 24px;
            right: 24px;
            z-index: 9999;
            display: flex;
            flex-direction: column;
            gap: 8px;
        `;
        document.body.appendChild(toastContainer);
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.style.cssText = `
        padding: 12px 20px;
        border-radius: 8px;
        background: ${type === 'success' ? '#10B981' : type === 'error' ? '#EF4444' : '#3B82F6'};
        color: white;
        font-size: 14px;
        font-weight: 500;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        animation: slideIn 0.3s ease;
        display: flex;
        align-items: center;
        gap: 8px;
    `;

    const icons = {
        success: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
        error: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
        info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>'
    };

    toast.innerHTML = `${icons[type] || icons.info}<span>${message}</span>`;
    toastContainer.appendChild(toast);

    // Auto remove after 3 seconds
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Add CSS animation for toast
const toastStyles = document.createElement('style');
toastStyles.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(toastStyles);
