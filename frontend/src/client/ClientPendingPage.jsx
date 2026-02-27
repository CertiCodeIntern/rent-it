import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './css/ClientPendingPage.css';

const API_BASE = import.meta.env.DEV ? '/api/rent-it' : '/rent-it';
const PUBLIC_BASE = '/rent-it';

function formatDate(dateStr) {
  if (!dateStr) return 'N/A';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function ClientPendingPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pending, setPending] = useState([]);

  useEffect(() => {
    let mounted = true;
    fetch(`${API_BASE}/client/myrentals/get_myrentals.php`, {
      credentials: 'include',
    })
      .then(async (res) => {
        let data = {};
        try {
          const text = await res.text();
          data = text ? JSON.parse(text) : {};
        } catch (_) {
          if (!res.ok) throw new Error('Server returned an invalid response. Try logging in again.');
        }
        if (!res.ok) throw new Error(data?.message || 'Failed to load data');
        return data;
      })
      .then((data) => {
        if (!mounted) return;
        if (!data?.success) {
          setError(data?.message || 'Failed to load pending orders');
          setPending([]);
        } else {
          setError('');
          setPending(Array.isArray(data.pending) ? data.pending : []);
        }
        setLoading(false);
      })
      .catch((err) => {
        if (!mounted) return;
        setError(err?.message || 'Failed to load pending orders.');
        setPending([]);
        setLoading(false);
      });
    return () => { mounted = false; };
  }, []);

  return (
    <div className="content-area myrentals-page-root pending-page">
        <div className="page-header-dashboard">
          <div className="page-header-info">
            <h1 className="page-title">Pending Orders</h1>
            <p className="page-subtitle">Orders waiting for shop approval</p>
            {error && <p className="pending-error">{error}</p>}
          </div>
        </div>

        <div className="myrentals-tabs">
          <Link to="/client/pending" className="myrentals-tab-link myrentals-tab-active">
            Pending Orders
          </Link>
          <Link to="/client/myrentals" className="myrentals-tab-link">
            Active Rentals
          </Link>
          <Link to="/client/bookinghistory" className="myrentals-tab-link">
            Booking History
          </Link>
          <Link to="/client/returns" className="myrentals-tab-link">
            Returns &amp; Extensions
          </Link>
        </div>

        <section className="pending-list-section">
          <h2 className="pending-section-title">Pending Rentals</h2>

          {loading && <div className="pending-loading">Loading pending orders...</div>}

          {!loading && pending.length > 0 && (
            <div className="pending-cards">
              {pending.map((order) => (
                <article key={order.order_id} className="pending-card">
                  <div className="pending-card-image-wrap">
                    <img
                      src={`${PUBLIC_BASE}/assets/images/items/${order.image || 'catalog-fallback.svg'}`}
                      alt={order.item_name}
                      className="pending-card-image"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = `${PUBLIC_BASE}/assets/images/catalog-fallback.svg`;
                      }}
                    />
                  </div>
                  <div className="pending-card-info">
                    <h4 className="pending-card-title">{order.item_name}</h4>
                    <div className="pending-card-meta">
                      <div className="pending-meta-group">
                        <span className="pending-meta-label">Start Date:</span>
                        <span className="pending-meta-value">{formatDate(order.start_date)}</span>
                      </div>
                      <div className="pending-meta-group">
                        <span className="pending-meta-label">End Date:</span>
                        <span className="pending-meta-value">{formatDate(order.end_date)}</span>
                      </div>
                      <div className="pending-meta-group">
                        <span className="pending-meta-label">Duration:</span>
                        <span className="pending-meta-value">{order.rental_days} Day(s)</span>
                      </div>
                      <div className="pending-meta-group">
                        <span className="pending-meta-label">Items:</span>
                        <span className="pending-meta-value">{order.item_count} item(s)</span>
                      </div>
                    </div>
                    <div className="pending-card-total">
                      Total Amount: ₱{Number(order.total_price || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                    <p className="pending-order-id">Order ID: #{order.order_id}</p>
                  </div>
                  <div className="pending-card-status-wrap">
                    <span className="pending-status-pill">Pending Approval</span>
                    <p className="pending-status-note">Please wait for the shop to confirm your booking.</p>
                  </div>
                </article>
              ))}
            </div>
          )}

          {!loading && pending.length === 0 && (
            <div className="pending-empty">
              <p className="pending-empty-text">No pending rentals at the moment.</p>
              <Link to="/client/catalog" className="pending-empty-link">Rent something now →</Link>
            </div>
          )}
        </section>
      </div>
  );
}

export default ClientPendingPage;
