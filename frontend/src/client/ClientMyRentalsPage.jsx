import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import './css/ClientMyRentalsPage.css';

// Follow the same API base convention as other client pages
const API_BASE = import.meta.env.DEV ? '/api/rent-it' : '/rent-it';
const PUBLIC_BASE = import.meta.env.DEV ? '/rent-it' : '/rent-it';

function formatDate(dateStr) {
  if (!dateStr) return 'N/A';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function ClientMyRentalsPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeRentals, setActiveRentals] = useState([]);
  const [history, setHistory] = useState([]);

  const [extensionModalOpen, setExtensionModalOpen] = useState(false);
  const [returnModalOpen, setReturnModalOpen] = useState(false);
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);

  const [selectedOrderForExtension, setSelectedOrderForExtension] = useState(null);
  const [selectedOrderForReturn, setSelectedOrderForReturn] = useState(null);
  const [selectedHistoryItem, setSelectedHistoryItem] = useState(null);

  const [extensionDays, setExtensionDays] = useState(1);
  const [currentDailyRate, setCurrentDailyRate] = useState(0);
  const [extensionSubmitting, setExtensionSubmitting] = useState(false);
  const [returnSubmitting, setReturnSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

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
        if (!res.ok) {
          throw new Error(data?.message || 'Failed to load rentals');
        }
        return data;
      })
      .then((data) => {
        if (!mounted) return;
        if (!data?.success) {
          setError(data?.message || 'Failed to load rentals');
          setActiveRentals([]);
          setHistory([]);
          setLoading(false);
          return;
        }

        setError('');
        setActiveRentals(Array.isArray(data.active) ? data.active : []);
        setHistory(Array.isArray(data.history) ? data.history : []);
        setLoading(false);
      })
      .catch((err) => {
        // eslint-disable-next-line no-console
        console.error('Failed to load rentals', err);
        if (!mounted) return;
        setError(err?.message || 'Failed to load rentals.');
        setActiveRentals([]);
        setHistory([]);
        setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const unitsBadgeText = useMemo(() => {
    if (loading) return 'Loading...';
    const count = activeRentals.length;
    if (!count) return '0 Units Active';
    return `${count} Unit${count !== 1 ? 's' : ''} Active`;
  }, [loading, activeRentals.length]);

  const handleOpenExtension = (orderId, dailyRate) => {
    setSelectedOrderForExtension(orderId);
    const rate = Number(dailyRate) || 0;
    setCurrentDailyRate(rate);
    setExtensionDays(1);
    setExtensionModalOpen(true);
  };

  const handleOpenReturn = (orderId) => {
    setSelectedOrderForReturn(orderId);
    setReturnModalOpen(true);
  };

  const extensionEstimatedTotal = useMemo(
    () => (currentDailyRate || 0) * (extensionDays || 1),
    [currentDailyRate, extensionDays],
  );

  const handleShowReceipt = (item) => {
    setSelectedHistoryItem(item);
    setReceiptModalOpen(true);
  };

  const handleCloseModals = () => {
    setExtensionModalOpen(false);
    setReturnModalOpen(false);
    setReceiptModalOpen(false);
    setSubmitError('');
  };

  const handleSubmitExtension = async (e) => {
    e.preventDefault();
    setSubmitError('');
    setExtensionSubmitting(true);
    const form = e.target;
    const formData = new FormData(form);
    try {
      const res = await fetch(`${API_BASE}/client/returns/returns.php`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'X-Requested-With': 'XMLHttpRequest' },
        body: formData,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) {
        setSubmitError(data?.message || 'Extension request failed');
        setExtensionSubmitting(false);
        return;
      }
      setExtensionModalOpen(false);
      navigate('/client/returns');
    } catch (err) {
      setSubmitError('Extension request failed.');
      setExtensionSubmitting(false);
    }
  };

  const handleSubmitReturn = async (e) => {
    e.preventDefault();
    setSubmitError('');
    setReturnSubmitting(true);
    const form = e.target;
    const formData = new FormData(form);
    try {
      const res = await fetch(`${API_BASE}/client/returns/returns.php`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'X-Requested-With': 'XMLHttpRequest' },
        body: formData,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) {
        setSubmitError(data?.message || 'Return request failed');
        setReturnSubmitting(false);
        return;
      }
      setReturnModalOpen(false);
      navigate('/client/returns');
    } catch (err) {
      setSubmitError('Return request failed.');
      setReturnSubmitting(false);
    }
  };

  return (
    <div className="content-area myrentals-page-root">
      <div className="page-header-dashboard">
        <div className="page-header-info">
          <h1 className="page-title"> Manage your active videoke equipment and view your rental history.</h1>
          {error && <p style={{ color: '#e11d48', marginTop: 8 }}>{error}</p>}
        </div>
        <div className="page-header-actions">
          <Link to="/client/catalog" className="btn-new">
            New Rental
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </Link>
        </div>
      </div>

      <div className="myrentals-tabs">
        <Link to="/client/pending" className="myrentals-tab-link">
          Pending Orders
        </Link>
        <Link to="/client/myrentals" className="myrentals-tab-link myrentals-tab-active">
          Active Rentals
        </Link>
        <Link to="/client/bookinghistory" className="myrentals-tab-link">
          Booking History
        </Link>
        <Link to="/client/returns" className="myrentals-tab-link">
          Returns &amp; Extensions
        </Link>
      </div>

      <section className="myrentals-active-section">
        <div className="myrentals-section-header">
          <h2 className="myrentals-section-title">Currently In Possession</h2>
          <span className="myrentals-units-badge" id="unitsBadge">
            {unitsBadgeText}
          </span>
        </div>

        <div className="myrentals-cards-row" id="activeRentalsCards">
          {loading ? (
            <div className="myrentals-empty-active">Loading rentals...</div>
          ) : activeRentals.length === 0 ? (
            <div className="myrentals-empty-active">
              <div className="rental-empty-card">
                <div className="rental-empty-icon">🎤</div>
                <h3 className="rental-empty-title">No active rentals yet</h3>
                <p className="rental-empty-text">
                  Browse the catalog to book your first videoke set.
                </p>
                <Link to="/client/catalog" className="rental-empty-link">
                  Browse Catalog
                </Link>
              </div>
            </div>
          ) : (
            activeRentals.map((r) => {
              const daysLeft = Number(r.days_left || 0);
              const isExpiring = daysLeft <= 1;
              const statusClass = isExpiring ? 'status-expiring' : 'status-rented';
              const daysClass = isExpiring ? 'days-danger' : '';
              const cardExpiring = isExpiring ? 'card-expiring' : '';

              const orderId = r.order_id;
              const rate = Number(r.daily_rate || 0);

              return (
                <article className={`rental-card ${cardExpiring}`} key={orderId}>
                  <div className="card-top">
                    <div className="card-info">
                      <div className="badges-row">
                        <span className={`badge ${statusClass}`}>
                          {isExpiring ? 'Expiring Soon' : 'Rented'}
                        </span>
                        <span className="rental-id">#{r.rental_code}</span>
                      </div>
                      <h3 className="card-title">{r.name}</h3>
                      <div className="card-meta">Delivery: {formatDate(r.start_date)}</div>
                      <div style={{ color: '#e11d48', fontWeight: 600 }}>
                        End: {formatDate(r.end_date)}
                      </div>
                    </div>

                    <div className={`days-badge ${daysClass}`}>
                      <div className="days-value" style={{ color: 'white' }}>
                        {daysLeft}
                      </div>
                      <div className="days-label" style={{ color: 'white' }}>
                        Day
                        {daysLeft !== 1 ? 's' : ''}
                      </div>
                    </div>
                  </div>
                  <div className="card-image">
                    {r.image && (
                      <img
                        src={`${PUBLIC_BASE}/assets/images/items/${r.image}`}
                        alt={r.name}
                        onError={(e) => {
                          // Hide broken image and fall back to CSS background
                          // eslint-disable-next-line no-param-reassign
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    )}
                  </div>
                  <div className="card-actions">
                    <button
                      type="button"
                      className="btn-extend"
                      onClick={() => handleOpenExtension(orderId, rate)}
                    >
                      Extend
                    </button>
                    <button
                      type="button"
                      className="btn-return"
                      onClick={() => handleOpenReturn(orderId)}
                    >
                      Return
                    </button>
                  </div>
                </article>
              );
            })
          )}
        </div>
      </section>

      <section className="myrentals-history-section" id="booking-history">
        <div className="myrentals-section-header">
          <h2 className="myrentals-section-title">Booking History</h2>
          <Link
            to="/client/bookinghistory"
            className="myrentals-view-all-link"
          >
            View All
          </Link>
        </div>

        <div className="myrentals-history-panel">
          <table
            className="myrentals-history-table"
            role="table"
            aria-label="Booking history"
          >
            <thead>
              <tr>
                <th>Item Details</th>
                <th>Rental Period</th>
                <th>Total Amount</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody id="historyTableBody">
              {!loading && history.length === 0 && (
                <tr className="myrentals-history-empty-row">
                  <td colSpan={4} className="myrentals-history-empty-cell">
                    No history found.
                  </td>
                </tr>
              )}
              {!loading
                && history.map((h) => {
                  const itemName = h.name || 'Multiple Items';
                  const statusRaw = h.rental_status || '';
                  const isActive = statusRaw === 'Active';
                  const statusColor = isActive ? '#10b981' : '#64748b';

                  return (
                    <tr key={h.order_id}>
                      <td>
                        <div className="history-item">
                          <div className="history-thumb">🎤</div>
                          <div className="history-info">
                            <div
                              className="history-name"
                              style={{ color: '#1e293b', fontWeight: 600 }}
                            >
                              {itemName}
                            </div>
                            <div
                              className="history-id"
                              style={{ color: '#64748b', fontSize: '0.85rem' }}
                            >
                              #{h.rental_code}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="period-dates" style={{ color: '#475569' }}>
                          {formatDate(h.start_date)} - {formatDate(h.end_date)}
                        </div>
                        <div
                          className="period-status"
                          style={{ fontWeight: 500, color: statusColor }}
                        >
                          {String(statusRaw).charAt(0).toUpperCase()
                            + String(statusRaw).slice(1).toLowerCase()}
                        </div>
                      </td>
                      <td
                        className="amount-cell"
                        style={{ fontWeight: 700, color: '#1e293b' }}
                      >
                        ₱
                        {Number(h.total_amount || 0).toFixed(2)}
                      </td>
                      <td>
                        <button
                          type="button"
                          className="action-btn rental-button"
                          onClick={() => handleShowReceipt(h)}
                        >
                          Receipt
                        </button>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Receipt Modal */}
      {receiptModalOpen && selectedHistoryItem && (
        <div className="myrentals-modal" role="dialog" aria-modal="true">
          <div className="myrentals-modal-content">
            <button
              type="button"
              className="myrentals-close-modal"
              onClick={handleCloseModals}
            >
              ×
            </button>
            <div id="receiptDetails">
              <div id="receipt-canvas" style={{ padding: 10 }}>
                <div
                  style={{
                    textAlign: 'center',
                    borderBottom: '2px dashed #e2e8f0',
                    paddingBottom: 15,
                    marginBottom: 20,
                  }}
                >
                  <h2 style={{ margin: 0, color: '#f97316' }}>RentIt</h2>
                  <p
                    style={{
                      fontSize: 12,
                      color: '#64748b',
                      margin: '5px 0 0 0',
                    }}
                  >
                    OFFICIAL RENTAL RECEIPT
                  </p>
                </div>

                <div
                  style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}
                >
                  <span style={{ color: '#64748b' }}>Order Ref:</span>
                  <span style={{ fontWeight: 600 }}>#{selectedHistoryItem.rental_code}</span>
                </div>

                <div style={{ marginBottom: 10 }}>
                  <span style={{ color: '#64748b', display: 'block' }}>Item:</span>
                  <span style={{ fontWeight: 600, display: 'block' }}>
                    {selectedHistoryItem.name || 'Rental Unit'}
                  </span>
                </div>

                <div
                  style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}
                >
                  <span style={{ color: '#64748b' }}>Period:</span>
                  <span style={{ fontSize: 13 }}>
                    {formatDate(selectedHistoryItem.start_date)} -
                    {' '}
                    {formatDate(selectedHistoryItem.end_date)}
                  </span>
                </div>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: 10,
                    paddingTop: 10,
                    borderTop: '1px solid #eee',
                  }}
                >
                  <span style={{ fontWeight: 700 }}>Total Paid:</span>
                  <span style={{ fontWeight: 800, color: '#f97316' }}>
                    ₱
                    {Number(selectedHistoryItem.total_amount || 0).toFixed(2)}
                  </span>
                </div>

                <p
                  style={{
                    textAlign: 'center',
                    fontSize: 10,
                    color: '#94a3b8',
                    marginTop: 20,
                  }}
                >
                  Thank you for renting with RentIt!
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => window.print()}
              style={{
                width: '100%',
                marginTop: 15,
                background: '#f97316',
                color: 'white',
                border: 'none',
                padding: 10,
                borderRadius: 6,
                cursor: 'pointer',
              }}
            >
              Print Receipt
            </button>
          </div>
        </div>
      )}

      {/* Return Modal */}
      {returnModalOpen && (
        <div className="myrentals-modal" role="dialog" aria-modal="true">
          <div className="myrentals-modal-content">
            <h3 style={{ marginTop: 0 }}>Request Return</h3>
            <p style={{ fontSize: '0.9rem', color: '#64748b' }}>
              Please provide a reason for returning the item.
            </p>
            {submitError && <p style={{ color: '#e11d48', fontSize: '0.9rem' }}>{submitError}</p>}
            <form onSubmit={handleSubmitReturn}>
              <input type="hidden" name="order_id" value={selectedOrderForReturn || ''} />
              <input type="hidden" name="action" value="submit_return" />

              <div style={{ margin: '15px 0' }}>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '5px',
                    fontWeight: 600,
                  }}
                >
                  Reason:
                </label>
                <textarea
                  name="return_reason"
                  required
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    height: '80px',
                    fontFamily: 'inherit',
                  }}
                  placeholder="e.g. Done using, item issue..."
                />
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '10px',
                }}
              >
                <button
                  type="button"
                  onClick={handleCloseModals}
                  style={{
                    padding: '8px 15px',
                    border: 'none',
                    background: '#e2e8f0',
                    borderRadius: '6px',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={returnSubmitting}
                  style={{
                    padding: '8px 15px',
                    border: 'none',
                    background: '#f97316',
                    color: 'white',
                    borderRadius: '6px',
                    cursor: 'pointer',
                  }}
                >
                  {returnSubmitting ? 'Submitting…' : 'Submit Return'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Extension Modal */}
      {extensionModalOpen && (
        <div className="myrentals-modal" role="dialog" aria-modal="true">
          <div className="myrentals-modal-content">
            <h3 style={{ marginTop: 0 }}>Request Extension</h3>
            <p style={{ fontSize: '0.9rem', color: '#64748b' }}>
              How many days would you like to extend?
            </p>
            {submitError && <p style={{ color: '#e11d48', fontSize: '0.9rem' }}>{submitError}</p>}
            <form onSubmit={handleSubmitExtension}>
              <input type="hidden" name="order_id" value={selectedOrderForExtension || ''} />
              <input type="hidden" name="action" value="submit_extension" />

              <div style={{ margin: '15px 0' }}>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '5px',
                    fontWeight: 600,
                  }}
                >
                  Extend for:
                </label>
                <select
                  name="extension_days"
                  value={extensionDays}
                  onChange={(e) => setExtensionDays(Number(e.target.value) || 1)}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                  }}
                >
                  <option value={1}>1 Day</option>
                  <option value={2}>2 Days</option>
                  <option value={3}>3 Days</option>
                  <option value={4}>4 Days</option>
                  <option value={5}>5 Days</option>
                  <option value={6}>6 Days</option>
                  <option value={7}>7 Days</option>
                </select>

                <div
                  style={{
                    marginTop: '15px',
                    padding: '12px',
                    background: '#f8fafc',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '0.85rem',
                      color: '#64748b',
                    }}
                  >
                    <span>Rate per Day:</span>
                    <span id="rate_per_day_display">
                      ₱
                      {currentDailyRate.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontWeight: 700,
                      color: '#1e293b',
                      marginTop: '5px',
                      borderTop: '1px dashed #cbd5e1',
                      paddingTop: '5px',
                    }}
                  >
                    <span>Estimated Total:</span>
                    <span id="ext_price_display">
                      ₱
                      {extensionEstimatedTotal.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '10px',
                }}
              >
                <button
                  type="button"
                  onClick={handleCloseModals}
                  style={{
                    padding: '8px 15px',
                    border: 'none',
                    background: '#e2e8f0',
                    borderRadius: '6px',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={extensionSubmitting}
                  style={{
                    padding: '8px 15px',
                    border: 'none',
                    background: '#2563eb',
                    color: 'white',
                    borderRadius: '6px',
                    cursor: 'pointer',
                  }}
                >
                  {extensionSubmitting ? 'Submitting…' : 'Confirm Extension'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ClientMyRentalsPage;
