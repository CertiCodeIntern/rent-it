import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import ClientShellLayout from './ClientShellLayout.jsx';
import './css/ClientMyRentalsPage.css';

const API_BASE = import.meta.env.DEV ? '/api/rent-it' : '/rent-it';
const PUBLIC_BASE = '/rent-it';

function formatDate(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function fetchReturnsData(apiBase) {
  return fetch(`${apiBase}/client/myrentals/get_myrentals.php`, { credentials: 'include' })
    .then((res) => {
      if (!res.ok) throw new Error('Failed to load returns data');
      return res.json();
    })
    .then((data) => {
      const all = Array.isArray(data.history) ? data.history : [];
      const returnsList = all.filter((row) =>
        ['Pending Return', 'Returned'].includes(row.rental_status || row.status),
      );
      const extensionsList = all.filter((row) =>
        ['Pending Extension', 'Extended', 'Extension Approved'].includes(
          row.rental_status || row.status,
        ),
      );
      return { returnsList, extensionsList };
    });
}

function ClientReturnsContent() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [returnsData, setReturnsData] = useState([]);
  const [extensions, setExtensions] = useState([]);

  const returnedCount = useMemo(
    () => returnsData.filter((r) => r.rental_status === 'Returned').length,
    [returnsData],
  );

  const activeExtensionsCount = useMemo(
    () => extensions.length,
    [extensions],
  );

  const completedThisMonth = useMemo(
    () => returnsData.filter((r) => {
      if (r.rental_status !== 'Returned' || !r.end_date) return false;
      const d = new Date(r.end_date);
      const now = new Date();
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).length,
    [returnsData],
  );

  const loadData = React.useCallback(() => {
    setLoading(true);
    setError('');
    fetchReturnsData(API_BASE)
      .then(({ returnsList, extensionsList }) => {
        setReturnsData(returnsList);
        setExtensions(extensionsList);
      })
      .catch(() => setError('Failed to load returns & extensions.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <div className="content-area myrentals-page-root returns-page">
      <div className="page-header-dashboard">
        <div className="page-header-info">
          <h1 className="page-title">Returns &amp; Extensions</h1>
          <p className="page-subtitle">Manage your pending return and extension requests.</p>
          {error && <p style={{ color: '#e11d48', marginTop: 8 }}>{error}</p>}
        </div>
      </div>

      <div className="myrentals-tabs">
        <Link to="/client/pending" className="myrentals-tab-link">
          Pending Orders
        </Link>
        <Link to="/client/myrentals" className="myrentals-tab-link">
          Active Rentals
        </Link>
        <Link to="/client/bookinghistory" className="myrentals-tab-link">
          Booking History
        </Link>
        <Link to="/client/returns" className="myrentals-tab-link myrentals-tab-active">
          Returns &amp; Extensions
        </Link>
      </div>

      {/* Returns stats */}
      <section className="returns-stats">
        <div className="returns-stats-row">
          <div className="returns-stat-card">
            <div className="returns-stat-info">
              <span className="returns-stat-value">{returnedCount}</span>
              <span className="returns-stat-label">Items Returned (For Repair)</span>
            </div>
          </div>
          <div className="returns-stat-card">
            <div className="returns-stat-info">
              <span className="returns-stat-value">{activeExtensionsCount}</span>
              <span className="returns-stat-label">Active Extensions</span>
            </div>
          </div>
          <div className="returns-stat-card">
            <div className="returns-stat-info">
              <span className="returns-stat-value">{completedThisMonth}</span>
              <span className="returns-stat-label">Completed This Month</span>
            </div>
          </div>
        </div>
      </section>

      {/* Returned section */}
      <section className="returns-section">
        <div className="returns-section-header">
          <h2 className="returns-section-title">Returned</h2>
          <span className="returns-units-badge">
            {returnsData.length}
            {' '}
            Items
          </span>
        </div>

        <div className="returns-grid">
          {!loading && returnsData.length === 0 && (
            <div className="returns-no-data-card">
              <div className="returns-empty-icon">📦</div>
              <h3 className="returns-empty-title">No active returns</h3>
              <p className="returns-empty-text">Return requests will appear here once submitted.</p>
              <Link to="/client/myrentals" className="returns-empty-link">View My Rentals</Link>
            </div>
          )}

          {!loading && returnsData.length > 0
            && returnsData.map((row) => (
              <article key={row.order_id} className="returns-card">
                <div className="returns-card-header">
                  <span className="returns-id">#ORD-
                    {row.order_id}
                  </span>
                  <span
                    className={`returns-status ${
                      (row.rental_status || row.status) === 'Returned'
                        ? 'returns-status-returned'
                        : 'returns-status-pending'
                    }`}
                  >
                    {row.rental_status || row.status}
                  </span>
                </div>

                <div className="returns-card-body">
                  <div className="returns-item">
                    <div className="returns-item-image">
                      <img
                        src={`${PUBLIC_BASE}/assets/images/items/${row.image || 'default.png'}`}
                        alt="Item"
                      />
                    </div>
                    <div className="returns-item-info">
                      <h3 className="returns-item-name">{row.name || row.item_name}</h3>
                      <p className="returns-item-meta">
                        Returned On:
                        {' '}
                        {formatDate(row.end_date)}
                      </p>

                      {row.return_reason && (
                        <div className="returns-reason-box">
                          <strong>Issue reported:</strong>
                          <p>{row.return_reason}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="returns-card-footer">
                  {(row.rental_status || row.status) !== 'Returned' ? (
                    <button
                      type="button"
                      className="returns-btn-cancel"
                      onClick={() => {
                        const fd = new FormData();
                        fd.append('action', 'cancel_request');
                        fd.append('order_id', row.order_id);
                        fetch(`${API_BASE}/client/returns/returns.php`, {
                          method: 'POST',
                          credentials: 'include',
                          headers: { 'X-Requested-With': 'XMLHttpRequest' },
                          body: fd,
                        })
                          .then((res) => res.json().catch(() => ({})))
                          .then((data) => data.success && loadData());
                      }}
                    >
                      Cancel Request
                    </button>
                  ) : (
                    <span className="returns-processed-label">Under Inspection / Maintenance</span>
                  )}
                </div>
              </article>
            ))}
        </div>
      </section>

      {/* Extensions section */}
      <section className="returns-extensions-section">
        <div className="returns-section-header">
          <h2 className="returns-section-title">Extension</h2>
          <span className="returns-units-badge returns-units-badge-blue">
            {extensions.length}
            {' '}
            Items
          </span>
        </div>

        <div className="returns-extensions-grid">
          {!loading && extensions.length === 0 && (
            <div className="returns-no-data-card">
              <div className="returns-empty-icon">⏳</div>
              <h3 className="returns-empty-title">No active extensions</h3>
              <p className="returns-empty-text">Extension requests will appear here once submitted.</p>
              <Link to="/client/myrentals" className="returns-empty-link">View My Rentals</Link>
            </div>
          )}

          {!loading && extensions.length > 0
            && extensions.map((row) => (
              <article key={row.order_id} className="returns-extension-card">
                <div className="returns-extension-header">
                  <span className="returns-extension-id">#ORD-
                    {row.order_id}
                  </span>
                  <span className="returns-extension-status returns-status-pending">
                    {row.rental_status || row.status}
                  </span>
                </div>
                <div className="returns-extension-body">
                  <div className="returns-extension-item-info">
                    <h3 className="returns-extension-item-name">{row.name || row.item_name}</h3>
                    <p className="returns-extension-due">
                      New Due Date:
                      {' '}
                      <strong>{formatDate(row.end_date)}</strong>
                    </p>
                  </div>
                </div>
                <div className="returns-extension-footer">
                  <button
                    type="button"
                    className="returns-btn-cancel"
                    onClick={() => {
                      const fd = new FormData();
                      fd.append('action', 'cancel_extension');
                      fd.append('order_id', row.order_id);
                      fetch(`${API_BASE}/client/returns/returns.php`, {
                        method: 'POST',
                        credentials: 'include',
                        headers: { 'X-Requested-With': 'XMLHttpRequest' },
                        body: fd,
                      })
                        .then((res) => res.json().catch(() => ({})))
                        .then((data) => data.success && loadData());
                    }}
                  >
                    Cancel Request
                  </button>
                </div>
              </article>
            ))}
        </div>
      </section>
    </div>
  );
}

function ClientReturnsPage() {
  return (
    <ClientShellLayout>
      <ClientReturnsContent />
    </ClientShellLayout>
  );
}

export default ClientReturnsPage;
