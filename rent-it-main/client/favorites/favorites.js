/**
 * Favorites Page JavaScript
 * Handles favorites management - Database integrated
 */

document.addEventListener('DOMContentLoaded', () => {
    // Initialize components
    if (typeof Components !== 'undefined') {
        Components.injectSidebar('sidebarContainer', 'favorites', 'client');
        Components.injectTopbar('topbarContainer', 'My Favorites');
        Components.injectFooter('footerContainer');
    }

    initFavorites();
});

let favoritesPagination = null;

function initFavorites() {
    attachRemoveListeners();
    attachMoveToCartListeners();
    updateFavoritesCount();

    // Initialize pagination (6 cards per page)
    if (typeof createPagination === 'function') {
        favoritesPagination = createPagination({
            containerSelector: '#favoritesPagination',
            getItems: () => Array.from(document.querySelectorAll('#favoritesGrid .favorite-card')),
            itemsPerPage: 6,
            scrollTarget: '.favorites-section'
        });
        favoritesPagination.render();
    }
}

/**
 * REMOVE FAVORITE LOGIC
 */
function attachRemoveListeners() {
    document.querySelectorAll('.btn-remove-favorite').forEach(btn => {
        btn.onclick = (e) => {
            const card = btn.closest('.favorite-card');
            const itemId = card.dataset.id;
            removeFavorite(itemId);
        };
    });
}

function removeFavorite(itemId) {
    if(confirm('Remove this from your favorites?')) {
        // Tandaan: remove_favorite.php ay dapat kasama ng favorites.php sa iisang folder
        fetch('remove_favorite.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: 'item_id=' + itemId
        })
        .then(res => res.json())
        .then(data => {
            if(data.success) {
                const card = document.querySelector(`.favorite-card[data-id="${itemId}"]`);
                if(card) {
                    card.style.opacity = '0';
                    card.style.transform = 'scale(0.9)';
                    card.style.transition = 'all 0.3s ease';
                    
                    setTimeout(() => {
                        card.remove();
                        updateFavoritesCount();
                        checkEmptyState();
                    }, 300);
                }
                showToast('Item removed from favorites', 'info');
            } else {
                alert("Error: " + data.message);
            }
        })
        .catch(err => console.error("Fetch Error:", err));
    }
}

/**
 * MOVE TO CART LOGIC
 */
function attachMoveToCartListeners() {
    document.querySelectorAll('.btn-move-to-cart').forEach(btn => {
        btn.onclick = (e) => {
            const card = btn.closest('.favorite-card');
            const itemId = card.dataset.id;
            moveToCart(itemId);
        };
    });
}

function moveToCart(itemId) {
    // Siguraduhin na ang path ay tama papunta sa iyong add_to_cart.php
    fetch('../cart/add_to_cart.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: 'item_id=' + itemId
    })
    .then(res => res.json())
    .then(data => {
        if(data.success) {
            // Pag-add sa cart success, burahin na sa favorites table
            return fetch('remove_favorite.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: 'item_id=' + itemId
            });
        } else {
            throw new Error(data.message || 'Failed to add to cart');
        }
    })
    .then(res => res.json())
    .then(data => {
        if(data.success) {
            showToast('Successfully moved to cart!', 'success');
            setTimeout(() => location.reload(), 1000); // Reload para malinis ang UI
        }
    })
    .catch(err => {
        console.error(err);
        alert('Something went wrong: ' + err.message);
    });
}

/**
 * UI HELPERS
 */
function updateFavoritesCount() {
    const countEl = document.getElementById('favoritesCount');
    const cards = document.querySelectorAll('.favorite-card');
    if (countEl) {
        countEl.textContent = cards.length;
    }
}

function checkEmptyState() {
    const cards = document.querySelectorAll('.favorite-card');
    if (cards.length === 0) {
        const grid = document.getElementById('favoritesGrid');
        const emptyState = document.getElementById('emptyFavorites');
        const paginationNav = document.getElementById('favoritesPagination');
        if (grid) grid.classList.add('is-hidden');
        if (emptyState) emptyState.classList.remove('is-hidden');
        if (paginationNav) paginationNav.classList.add('is-hidden');
    } else if (favoritesPagination) {
        favoritesPagination.render();
    }
}

function showToast(message, type = 'info') {
    const existing = document.querySelector('.toast-notification');
    if (existing) existing.remove();
    
    const toast = document.createElement('div');
    toast.className = `toast-notification toast-${type}`;
    toast.innerHTML = `<span>${message}</span>`;
    
    toast.style.cssText = `
        position: fixed; bottom: 24px; right: 24px; padding: 14px 24px;
        background: ${type === 'success' ? '#10B981' : type === 'error' ? '#EF4444' : '#3B82F6'};
        color: white; border-radius: 8px; z-index: 9999;
    `;
    
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}