import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import ClientShellLayout from './ClientShellLayout.jsx';
import './css/ClientMyRentalsPage.css';

const API_BASE = import.meta.env.DEV ? '/api/rent-it' : '/rent-it';

function formatDate(dateStr) {
  if (!dateStr) return 'N/A';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function ClientBookingHistoryContent() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [history, setHistory] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    let mounted = true;

    fetch(`${API_BASE}/client/myrentals/get_myrentals.php`, {
      credentials: 'include',
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load booking history');
        return res.json();
      })
      .then((data) => {
        if (!mounted) return;
        if (!data?.success) {
          setError(data?.message || 'Failed to load booking history');
          setHistory([]);
          setLoading(false);
          return;
        }
        setHistory(Array.isArray(data.history) ? data.history : []);
        setLoading(false);
      })
      .catch(() => {
        if (!mounted) return;
        setError('Failed to load booking history.');
        setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const totalSpent = useMemo(
    () => history.reduce((sum, item) => sum + Number(item.total_amount || 0), 0),
    [history],
  );

  const totalPages = useMemo(
    () => (history.length ? Math.ceil(history.length / pageSize) : 1),
    [history.length],
  );

  const pagedHistory = useMemo(
    () => {
      const start = (currentPage - 1) * pageSize;
      return history.slice(start, start + pageSize);
    },
    [history, currentPage],
  );

  const startIndex = history.length ? (currentPage - 1) * pageSize + 1 : 0;
  const endIndex = Math.min(currentPage * pageSize, history.length);

  return (
    <div className="content-area myrentals-page-root booking-history-page">
      <div className="page-header-dashboard">
        <div className="page-header-info">
          <h1 className="page-title">Track all your past videoke rentals and manage receipts.</h1>
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
        <Link to="/client/bookinghistory" className="myrentals-tab-link myrentals-tab-active">
          Booking History
        </Link>
        <Link to="/client/returns" className="myrentals-tab-link">
          Returns &amp; Extensions
        </Link>
      </div>

      {/* Booking History KPI cards section (scoped bh-kpi- classes) */}
      <section className="bh-kpi-panel">
        <div className="bh-kpi-row">
          <article className="bh-kpi-card">
            <div className="bh-kpi-icon-wrap bh-kpi-icon-blue">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                <path d="M6 3h10l2 2v14l-2 2H6V3z" />
                <path d="M8 8h8M8 12h6M8 16h4" />
              </svg>
            </div>
            <div className="bh-kpi-content">
              <div className="bh-kpi-label">Rentals</div>
              <div className="bh-kpi-value" id="lifetimeRentals">{history.length}</div>
            </div>
          </article>

          <article className="bh-kpi-card">
            <div className="bh-kpi-icon-wrap bh-kpi-icon-orange">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                <rect x="2" y="6" width="20" height="12" rx="2" />
                <path d="M7 10h0" />
                <path d="M11 12c1.2 0 2 .6 2 1s-.8 1-2 1" />
              </svg>
            </div>
            <div className="bh-kpi-content">
              <div className="bh-kpi-label">Total Spent</div>
              <div className="bh-kpi-value" id="totalSpent">
                ₱
                {totalSpent.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </div>
            </div>
          </article>

          <article className="bh-kpi-card">
            <div className="bh-kpi-icon-wrap bh-kpi-icon-gold">
              <svg viewBox="0 0 24 24" fill="currentColor" stroke="none">
                <path d="M12 .8l2.7 5.5 6.1.9-4.4 4.3 1 6.1L12 15.8 6.6 17.5l1-6.1L3.2 7.1l6.1-.9L12 .8z" />
              </svg>
            </div>
            <div className="bh-kpi-content">
              <div className="bh-kpi-label">Member Status</div>
              <div className="bh-kpi-value" id="memberStatus">Bronze</div>
            </div>
          </article>
        </div>
      </section>

      {/* Booking history table (scoped classes to avoid catalog conflicts) */}
      <section className="bh-history-section">
        <div className="bh-history-panel">
          <table className="bh-history-table" role="table" aria-label="Booking history">
            <thead className="bh-history-head">
              <tr>
                <th>Item Name</th>
                <th>Rental ID</th>
                <th>Period</th>
                <th>Total Paid</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {!loading && history.length === 0 && (
                <tr>
                  <td colSpan={5} className="bh-empty-cell">
                    <p className="bh-empty-message-inline">No booking history found.</p>
                    <Link to="/client/catalog" className="bh-empty-cta-inline">
                      Browse Catalog
                    </Link>
                  </td>
                </tr>
              )}

              {!loading
                && pagedHistory.map((row) => {
                  const firstLetter = (row.name || row.item_name || 'K')[0]?.toUpperCase();
                  const itemName = row.name || row.item_name || 'Unknown Item';
                  const category = row.category || 'Premium';
                  const statusText = row.rental_status || row.status || 'Active';
                  const statusClass = `status-${statusText.toLowerCase().replace(/\s+/g, '-')}`;

                  return (
                    <tr key={row.order_id}>
                      <td>
                        <div className="item-cell">
                          <div className="item-img" aria-hidden="true">{firstLetter}</div>
                          <div className="item-info">
                            <div className="item-name">{itemName}</div>
                            <div className="small-muted">{category}</div>
                          </div>
                        </div>
                      </td>
                      <td className="small-muted">#ORD-
                        {row.order_id}
                      </td>
                      <td>
                        <div className="period">
                          <div className="date-start">{formatDate(row.start_date)}</div>
                          <div className="date-end">
                            to
                            {' '}
                            {formatDate(row.end_date)}
                          </div>
                        </div>
                      </td>
                      <td className="amount-cell">
                        <strong>
                          ₱
                          {Number(row.total_amount || row.total_price || 0).toLocaleString(
                            undefined,
                            {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            },
                          )}
                        </strong>
                      </td>
                      <td>
                        <span className={`status-pill ${statusClass}`}>{statusText}</span>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>

          <div className="pagination">
            <div className="pagination-info">
              Showing
              {' '}
              {startIndex || 0}
              {' '}
              -
              {' '}
              {endIndex || 0}
              {' '}
              of
              {' '}
              {history.length}
              {' '}
              results
            </div>
            <div className="pagination-buttons">
              <button
                className="pagination-btn"
                disabled={currentPage === 1}
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </button>
              <button
                className="pagination-btn"
                disabled={currentPage === totalPages || history.length === 0}
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function ClientBookingHistoryPage() {
  return (
    <ClientShellLayout>
      <ClientBookingHistoryContent />
    </ClientShellLayout>
  );
}

export default ClientBookingHistoryPage;
