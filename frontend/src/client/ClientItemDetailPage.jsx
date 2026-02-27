import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import './css/ClientItemDetailPage.css';

const API_BASE = import.meta.env.DEV ? '/api/rent-it' : '/rent-it';
const PUBLIC_BASE = '/rent-it';

function ClientItemDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reviews, setReviews] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [isInCart, setIsInCart] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError('');

    if (!id || id === 'undefined') {
      setError('Invalid item ID');
      setLoading(false);
      return;
    }

    // Fetch item details
    const url = `${API_BASE}/client/catalog/itemdescription.php?id=${id}&format=json`;
    console.log('Fetching item details from:', url);
    
    fetch(url, {
      credentials: 'include',
    })
      .then((res) => {
        console.log('Response status:', res.status, res.statusText);
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        }
        return res.json();
      })
      .then((data) => {
        if (!isMounted) return;
        console.log('Item detail API response:', data);
        if (data.success && data.item) {
          setItem(data.item);
          setReviews(data.reviews || []);
          setBookings(data.bookings || []);
          setIsInCart(data.isInCart || false);
          setIsFavorited(data.isFavorited || false);
        } else if (data.item) {
          // Handle case where item exists but success flag might be missing
          setItem(data.item);
          setReviews(data.reviews || []);
          setBookings(data.bookings || []);
          setIsInCart(data.isInCart || false);
          setIsFavorited(data.isFavorited || false);
        } else {
          setError('Item not found in response');
        }
        setLoading(false);
      })
      .catch((err) => {
        if (!isMounted) return;
        console.error('Item detail fetch error:', err);
        setError(`Unable to load item details: ${err.message}`);
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [id]);

  const handleAddToCart = async () => {
    if (!item || isInCart) return;

    try {
      const response = await fetch(`${API_BASE}/client/cart/add_to_cart.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        credentials: 'include',
        body: new URLSearchParams({ item_id: String(item.item_id || item.id) }),
      });

      const data = await response.json();
      if (data.success) {
        setIsInCart(true);
        // Show toast notification
        showToast(`${item.item_name || item.name} added to cart!`, 'success');
      } else {
        showToast(data.message || 'Could not add to cart', 'error');
      }
    } catch (err) {
      console.error('Cart error:', err);
      showToast('Something went wrong', 'error');
    }
  };

  const handleToggleFavorite = async () => {
    if (!item) return;

    const action = isFavorited ? 'remove' : 'add';
    try {
      const response = await fetch(`${API_BASE}/client/catalog/add_favorite.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        credentials: 'include',
        body: new URLSearchParams({
          item_id: String(item.item_id || item.id),
          action,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setIsFavorited(!isFavorited);
        showToast(
          isFavorited
            ? `${item.item_name || item.name} removed from favorites`
            : `${item.item_name || item.name} added to favorites`,
          'success'
        );
      }
    } catch (err) {
      console.error('Favorite error:', err);
    }
  };

  const handleShare = () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({ title: `RentIt - ${item?.item_name || item?.name}`, url }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url).then(() => {
        showToast('Link copied to clipboard!', 'success');
      }).catch(() => showToast('Failed to copy link', 'error'));
    }
  };

  const showToast = (message, type) => {
    const existing = document.querySelector('.toast-notification');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = `toast-notification toast-${type}`;
    toast.textContent = message;
    toast.style.cssText = 'position:fixed;bottom:24px;right:24px;padding:14px 24px;' +
      `background:${type === 'success' ? '#10B981' : type === 'error' ? '#EF4444' : '#3B82F6'};` +
      'color:white;border-radius:8px;font-size:14px;font-weight:500;' +
      'box-shadow:0 4px 12px rgba(0,0,0,0.15);z-index:99999;opacity:1;transition:opacity .3s ease;';
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => { toast.remove(); }, 300);
    }, 3000);
  };

  if (loading) {
    return (
      <div className="client-item-detail-page fade-in-up" style={{ 
        padding: '40px 20px', 
        textAlign: 'center',
        minHeight: '400px',
        color: 'var(--text-primary, #0F172A)'
      }}>
        <p style={{ opacity: 0.7, color: 'var(--text-secondary, #64748B)', fontSize: '16px' }}>
          Loading item details...
        </p>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="client-item-detail-page fade-in-up" style={{ 
        padding: '40px 20px',
        minHeight: '400px',
        color: 'var(--text-primary, #0F172A)'
      }}>
        <p style={{ 
          color: 'var(--danger, #EF4444)', 
          marginBottom: '16px',
          fontSize: '16px',
          fontWeight: 600
        }}>
          {error || 'Item not found'}
        </p>
        <Link 
          to="/client/catalog" 
          style={{
            display: 'inline-block',
            padding: '12px 24px',
            background: 'var(--brand-primary, #013A63)',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '8px',
            fontWeight: 600,
            fontSize: '14px'
          }}
        >
          Back to Catalog
        </Link>
        <div style={{ marginTop: '20px', fontSize: '14px', color: 'var(--text-secondary, #64748B)' }}>
          <p>Debug info:</p>
          <p>Item ID: {id}</p>
          <p>API Base: {API_BASE}</p>
        </div>
      </div>
    );
  }

  // Calculate average rating (as number for calculations) - only when item exists
  const avgRatingNum = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + Number(r.rating || 0), 0) / reviews.length
    : Number(item.rating) || 0;
  
  // Format for display
  const avgRating = isNaN(avgRatingNum) ? '0.0' : avgRatingNum.toFixed(1);
  
  const fullStars = Math.floor(avgRatingNum);
  const hasHalf = (avgRatingNum - fullStars) >= 0.5;

  const imageUrl = item.image
    ? `${PUBLIC_BASE}/assets/images/items/${item.image}`
    : `${PUBLIC_BASE}/assets/images/catalog-fallback.svg`;

  const statusClass = (item.status || 'available').toLowerCase().replace(' ', '-');
  const statusLabel = (item.status || 'Available').charAt(0).toUpperCase() + (item.status || 'available').slice(1);
  const tags = item.tags ? item.tags.split(',').map(t => t.trim()) : [];

  return (
    <div className="client-item-detail-page fade-in-up">
      {/* Breadcrumb */}
      <nav className="breadcrumb" aria-label="Breadcrumb">
        <Link to="/client/catalog">Catalog</Link>
        <span className="separator">/</span>
        <span className="current">{item.item_name || item.name}</span>
      </nav>

      {/* Product Detail Layout */}
      <div className="product-detail-layout">
        {/* Left Column - Image */}
        <div className="product-gallery">
          <div className="main-image-wrap">
            <a
              className="main-image-link"
              href={imageUrl}
              target="_blank"
              rel="noopener"
              title="Open image in new tab"
            >
              <img
                src={imageUrl}
                alt={item.item_name || item.name}
                className="main-image"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = `${PUBLIC_BASE}/assets/images/catalog-fallback.svg`;
                }}
              />
            </a>
            <span className={`product-status ${statusClass}`}>{statusLabel}</span>
          </div>
        </div>

        {/* Right Column - Product Info */}
        <div className="product-info">
          <div className="product-header">
            {item.category && (
              <span className="product-category">{item.category}</span>
            )}
            <h1 className="product-title">{item.item_name || item.name}</h1>
            <div className="product-rating">
              <div className="rating-stars">
                {[1, 2, 3, 4, 5].map((i) => {
                  if (i <= fullStars) {
                    return (
                      <svg key={i} viewBox="0 0 24 24" className="star filled">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                    );
                  }
                  if (i === fullStars + 1 && hasHalf) {
                    return (
                      <svg key={i} viewBox="0 0 24 24" className="star half">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                    );
                  }
                  return (
                    <svg key={i} viewBox="0 0 24 24" className="star empty">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  );
                })}
              </div>
              <span className="rating-score">{avgRating}</span>
              <span className="rating-count">({reviews.length} review{reviews.length !== 1 ? 's' : ''})</span>
            </div>
          </div>

          <div className="product-price-section">
            <div className="price-display">
              <span className="price-amount">₱{Number(item.price_per_day || 0).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}</span>
              <span className="price-period">/ day</span>
            </div>
            {item.deposit && item.deposit > 0 ? (
              <p className="price-note">Security deposit: ₱{Number(item.deposit).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}</p>
            ) : (
              <p className="price-note">Minimum 1 day rental. Delivery fee not included.</p>
            )}
          </div>

          {/* Description */}
          <div className="product-description">
            <h3>Description</h3>
            <p>{item.description && item.description !== 'NULL'
              ? item.description
              : 'No description available for this item.'}</p>
          </div>

          {/* Item Details */}
          <div className="product-features">
            <h3>Details</h3>
            <ul className="features-list">
              {item.condition && (
                <li>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Condition: {item.condition.charAt(0).toUpperCase() + item.condition.slice(1)}
                </li>
              )}
              <li>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Category: {item.category || 'N/A'}
              </li>
              <li>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Total units: {item.total_units || 0}
              </li>
              <li>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Available units: {item.available_units || 0}
              </li>
              <li>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Times rented: {item.total_times_rented || 0}
              </li>
            </ul>
          </div>

          {/* Tags */}
          {tags.length > 0 && (
            <div className="product-tags-section">
              <h3>Tags</h3>
              <div className="product-tags-list">
                {tags.map((tag, idx) => (
                  <span key={idx} className="product-tag">{tag}</span>
                ))}
              </div>
            </div>
          )}

          {/* Action Bar */}
          <div className="action-bar">
            <button
              className={`btn-add-cart ${isInCart ? 'in-cart' : ''}`}
              onClick={handleAddToCart}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                {isInCart ? (
                  <polyline points="20 6 9 17 4 12" />
                ) : (
                  <>
                    <circle cx="9" cy="21" r="1" />
                    <circle cx="20" cy="21" r="1" />
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                  </>
                )}
              </svg>
              {isInCart ? 'Already in Cart' : 'Add to Cart'}
            </button>
            <button
              className={`btn-add-favorite ${isFavorited ? 'active' : ''}`}
              onClick={handleToggleFavorite}
              title={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
            >
              <svg viewBox="0 0 24 24" fill={isFavorited ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </button>
            <button className="btn-share" onClick={handleShare} title="Share this product">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="18" cy="5" r="3" />
                <circle cx="6" cy="12" r="3" />
                <circle cx="18" cy="19" r="3" />
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Upcoming Bookings Section */}
      <section className="future-bookings-section">
        <div className="section-header">
          <h2 className="section-title">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="22" height="22">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            Upcoming Bookings
          </h2>
        </div>

        <div className="future-bookings-list">
          {bookings.length > 0 ? (
            bookings.map((booking, idx) => {
              const start = new Date(booking.start_date || booking.booked_date_from);
              const end = new Date(booking.end_date || booking.booked_date_to);
              const days = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1);
              return (
                <div key={idx} className="booking-item">
                  <div className="booking-dates">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                    <span>
                      {start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      {' - '}
                      {end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                  {booking.rental_status && (
                    <span className="booking-status-badge">{booking.rental_status}</span>
                  )}
                  <span className="booking-days">{days} day{days > 1 ? 's' : ''}</span>
                </div>
              );
            })
          ) : (
            <div className="booking-empty">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20" style={{ color: 'var(--text-muted)' }}>
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              <p>No upcoming bookings. This item is available!</p>
            </div>
          )}
        </div>
      </section>

      {/* Reviews Section */}
      <section className="reviews-section">
        <div className="section-header">
          <h2 className="section-title">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="22" height="22">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            Customer Reviews
          </h2>
        </div>

        {reviews.length > 0 && (
          <div className="rating-summary">
            <div className="rating-overview">
              <div className="rating-big">
                <span className="rating-number">{avgRating}</span>
                <div className="rating-stars-big">
                  {[1, 2, 3, 4, 5].map((i) => {
                    if (i <= fullStars) {
                      return (
                        <svg key={i} viewBox="0 0 24 24" className="star filled">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                      );
                    }
                    if (i === fullStars + 1 && hasHalf) {
                      return (
                        <svg key={i} viewBox="0 0 24 24" className="star half">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                      );
                    }
                    return (
                      <svg key={i} viewBox="0 0 24 24" className="star empty">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                    );
                  })}
                </div>
                <span className="rating-total">Based on {reviews.length} review{reviews.length !== 1 ? 's' : ''}</span>
              </div>
            </div>
          </div>
        )}

        <div className="reviews-list">
          {reviews.length > 0 ? (
            reviews.map((review) => {
              const reviewerName = review.full_name || 'Anonymous';
              const nameParts = reviewerName.split(' ');
              const initials = nameParts.map(p => p.charAt(0).toUpperCase()).join('').substring(0, 2);
              const reviewDate = review.review_date
                ? new Date(review.review_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
                : '';

              return (
                <article key={review.review_id} className="review-card">
                  <div className="review-header">
                    <div className="reviewer-info">
                      <div className="reviewer-avatar">{initials}</div>
                      <div className="reviewer-details">
                        <span className="reviewer-name">{reviewerName}</span>
                        {reviewDate && <span className="review-date">{reviewDate}</span>}
                      </div>
                    </div>
                    <div className="review-rating">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <svg
                          key={i}
                          viewBox="0 0 24 24"
                          className={`star ${i <= (review.rating || 0) ? 'filled' : 'empty'}`}
                        >
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                      ))}
                    </div>
                  </div>
                  {review.feedback && <p className="review-text">{review.feedback}</p>}
                  <div className="review-footer">
                    <span className="verified-badge">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                        <polyline points="22 4 12 14.01 9 11.01" />
                      </svg>
                      Verified Rental
                    </span>
                  </div>
                </article>
              );
            })
          ) : (
            <div className="reviews-empty-state">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="48" height="48" style={{ color: 'var(--text-tertiary)', opacity: 0.5 }}>
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              <p>No reviews yet. Be the first to share your experience!</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default ClientItemDetailPage;
