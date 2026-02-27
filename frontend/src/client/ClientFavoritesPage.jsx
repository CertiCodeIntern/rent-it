import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './css/ClientFavoritesPage.css';

// Backend/API base: dev uses Vite proxy (/api), prod uses direct /rent-it path
const API_BASE = import.meta.env.DEV ? '/api/rent-it' : '/rent-it';
// Public base for assets
const PUBLIC_BASE = '/rent-it';

const ClientFavoritesPage = () => {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    fetch(`${API_BASE}/client/favorites/favorites.php?format=json`, {
      credentials: 'include',
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error('Failed to load favorites');
        }
        return res.json();
      })
      .then((data) => {
        if (!isMounted) return;
        // eslint-disable-next-line no-console
        console.log('Favorites API raw data:', data);
        const items = Array.isArray(data?.favorites)
          ? data.favorites
          : Array.isArray(data)
            ? data
            : [];
        // eslint-disable-next-line no-console
        console.log('Normalized favorites items:', items);
        setFavorites(items);
        setLoading(false);
      })
      .catch((err) => {
        if (!isMounted) return;
        // eslint-disable-next-line no-console
        console.error(err);
        setError('Unable to load favorites.');
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const favoritesCount = favorites.length;

  const handleRemoveFavorite = async (itemId) => {
    if (!itemId) return;

    try {
      const response = await fetch(`${API_BASE}/client/favorites/remove_favorite.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        credentials: 'include',
        body: new URLSearchParams({ item_id: String(itemId) }),
      });

      let data = null;
      try {
        data = await response.json();
      } catch (e) {
        // ignore JSON parse errors if endpoint returns plain text
      }

      const ok = data && typeof data.success !== 'undefined' ? data.success : response.ok;
      if (!ok) {
        // eslint-disable-next-line no-console
        console.error('Remove favorite failed:', data || {});
        return;
      }

      setFavorites((prev) => prev.filter((fav) => Number(fav.item_id) !== Number(itemId)));
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Remove favorite error:', err);
    }
  };

  const handleMoveToCart = async (itemId) => {
    if (!itemId) return;

    try {
      // 1) Add to cart
      const addResponse = await fetch(`${API_BASE}/client/cart/add_to_cart.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        credentials: 'include',
        body: new URLSearchParams({ item_id: String(itemId) }),
      });

      let addData = null;
      try {
        addData = await addResponse.json();
      } catch (e) {
        // ignore JSON parse errors if endpoint returns plain text
      }

      const addOk = addData && typeof addData.success !== 'undefined' ? addData.success : addResponse.ok;
      if (!addOk) {
        // eslint-disable-next-line no-console
        console.error('Move to cart failed at add_to_cart:', addData || {});
        return;
      }

      // 2) Remove from favorites table (to mirror legacy behavior)
      await handleRemoveFavorite(itemId);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Move to cart error:', err);
    }
  };

  const handleViewDetails = (fav) => {
    if (!fav) return;
    const itemId = fav.item_id || fav.id;
    if (itemId) {
      navigate(`/client/item/${itemId}`);
    }
  };

  return (
    <div className="content-area fade-in-up favorites-page">
        <div className="page-header-dashboard">
          <div className="page-header-info">
            <h1 className="page-title">Machines you&apos;ve saved for later.</h1>
            {error && <p className="favorites-error">{error}</p>}
          </div>
          <div className="page-header-actions">
            <span className="favorites-count">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
              <span id="favoritesCount">{favoritesCount}</span>
              {' '}
              items saved
            </span>
          </div>
        </div>

        <section className="favorites-section">
          {loading && <p style={{ opacity: 0.7 }}>Loading favorites...</p>}

          {!loading && favoritesCount > 0 && (
            <div className="favorites-grid" id="favoritesGrid">
              {favorites.map((fav) => {
                const id = fav.item_id;
                const name = fav.item_name;
                const price = Number(fav.price_per_day || 0);
                const imageUrl = fav.image
                  ? `${PUBLIC_BASE}/assets/images/items/${fav.image}`
                  : `${PUBLIC_BASE}/assets/images/catalog-fallback.svg`;

                return (
                  <article key={id} className="favorite-card" data-id={id}>
                    <div className="favorite-image-wrap">
                      <img
                        src={imageUrl}
                        alt={name}
                        className="favorite-image"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = `${PUBLIC_BASE}/assets/images/catalog-fallback.svg`;
                        }}
                      />

                      <button
                        className="btn-remove-favorite"
                        type="button"
                        title="Remove from favorites"
                        onClick={() => handleRemoveFavorite(id)}
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                          <line x1="18" y1="6" x2="6" y2="18" />
                          <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                      </button>
                    </div>

                    <div className="favorite-content">
                      <h3 className="favorite-name">{name}</h3>
                      <div className="favorite-price">
                        ₱
                        {price.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                        <span>/ day</span>
                      </div>

                      <div className="favorite-actions">
                        <button
                          className="btn-move-to-cart"
                          type="button"
                          onClick={() => handleMoveToCart(id)}
                        >
                          Move to Cart
                        </button>
                        <button
                          type="button"
                          className="btn-view-details"
                          onClick={() => handleViewDetails(fav)}
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          {!loading && favoritesCount === 0 && (
            <div className="empty-favorites" id="emptyFavorites">
              <div className="empty-icon">💔</div>
              <h2 className="empty-title">No Favorites Yet</h2>
              <a
                href={`${PUBLIC_BASE}/client/catalog/catalog.php`}
                className="btn-browse-catalog"
              >
                Browse Catalog
              </a>
            </div>
          )}
        </section>
      </div>
  );
};

export default ClientFavoritesPage;
