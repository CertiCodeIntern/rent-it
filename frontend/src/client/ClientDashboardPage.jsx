import React, { useEffect, useState } from 'react';
import './css/ClientDashboardPage.css';

// Backend base: dev uses Vite proxy (/api), prod uses direct /rent-it
const API_BASE = import.meta.env.DEV ? '/api/rent-it' : '/rent-it';

const ClientDashboardPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    user: { full_name: '', membership_level: '' },
    totals: { total_spent: 0, active_count: 0, upcoming_returns: 0 },
    active_rentals: [],
    history: [],
  });

  useEffect(() => {
    let isMounted = true;

    fetch(`${API_BASE}/client/dashboard/dashboard.php?format=json`, {
      credentials: 'include',
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error('Failed to load dashboard data');
        }
        return res.json();
      })
      .then((data) => {
        if (!isMounted) return;
        setDashboardData(data || {});
        setLoading(false);
      })
      .catch((err) => {
        if (!isMounted) return;
        console.error(err);
        setError('Unable to load dashboard data.');
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const { user = {}, totals = {}, active_rentals = [], history = [] } = dashboardData || {};

  const safeFullName = user.full_name || 'User';
  const safeMemberStatus = user.membership_level || 'Bronze';

  const safeActiveCount = Number.isFinite(totals.active_count) ? totals.active_count : 0;
  const safeTotalSpent = Number.isFinite(totals.total_spent) ? totals.total_spent : 0;
  const safeUpcomingReturns = Number.isFinite(totals.upcoming_returns)
    ? totals.upcoming_returns
    : 0;

  return (
    <div className="content-area">
      {loading && (
        <p style={{ opacity: 0.7 }}>Loading your dashboard...</p>
      )}
      {!loading && error && (
        <p style={{ opacity: 0.7, color: '#e55353' }}>{error}</p>
      )}

      <div className="page-header-dashboard">
        <div className="page-header-info">
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">
            Welcome back, {safeFullName}!
          </p>
        </div>
        <div className="page-header-actions">
          <a href="/client/catalog" className="btn-new">
            Browse Catalog
          </a>
        </div>
      </div>

      <section className="kpi-panel">
            <div className="kpi-row">
              <article className="kpi-card">
                <div className="kpi-content">
                  <div className="kpi-label">Active Rentals</div>
                  <div className="kpi-value">{safeActiveCount}</div>
                  <div className="kpi-sub positive">In possession</div>
                </div>
              </article>
              <article className="kpi-card">
                <div className="kpi-content">
                  <div className="kpi-label">Total Spent</div>
                  <div className="kpi-value">
                    ₱{safeTotalSpent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <div className="kpi-sub">Lifetime</div>
                </div>
              </article>
              <article className="kpi-card">
                <div className="kpi-content">
                  <div className="kpi-label">Total Returned</div>
                  <div className="kpi-value">{safeUpcomingReturns}</div>
                </div>
              </article>
              <article className="kpi-card">
                <div className="kpi-content">
                  <div className="kpi-label">Member Status</div>
                  <div className="kpi-value">{safeMemberStatus}</div>
                  <div className="kpi-sub positive">Verified User</div>
                </div>
              </article>
            </div>
      </section>

      <section className="active-rentals-section">
            <div className="section-header">
              <h2 className="section-titledashboard">Currently In Possession</h2>
              <span className="units-badge">{safeActiveCount} Units Active</span>
            </div>
            <div className="rental-cards-row">
              {Array.isArray(active_rentals) && active_rentals.length > 0 ? (
                active_rentals.map((row) => {
                  const statusRaw = row.rental_status;
                  const isPendingExtension = statusRaw === 'Pending Extension';
                  const badgeClass = isPendingExtension ? 'badge status-pending' : 'badge status-rented';
                  const badgeText = isPendingExtension ? 'EXTENSION PENDING' : 'ACTIVE';

                  return (
                    <article className="rental-card" key={row.order_id}>
                      <div className="card-top">
                        <div className="card-info">
                          <span className={badgeClass}>{badgeText}</span>
                          <h3 className="card-title">{row.item_name}</h3>
                          <div className="card-meta">Due: {row.formatted_end_date}</div>
                        </div>
                      </div>
                    </article>
                  );
                })
              ) : (
                <div className="rental-empty-card">
                  <div className="rental-empty-icon">🎤</div>
                  <h3 className="rental-empty-title">No active rentals yet</h3>
                  <p className="rental-empty-text">
                    Browse the catalog to book your first videoke set.
                  </p>
                  <a href="../catalog/catalog.php" className="rental-empty-link">
                    Browse Catalog
                  </a>
                </div>
              )}
            </div>
      </section>

      <section className="history-section" style={{ marginTop: '40px' }}>
            <div className="section-header">
              <h2 className="section-titledashboard">Booking History</h2>
              <a href="../bookinghistory/bookinghistory.php" className="view-all-link">
                View All
              </a>
            </div>
            <div className="history-panel">
              <table className="history-table">
                <thead>
                  <tr>
                    <th>Item Details</th>
                    <th>Rental Period</th>
                    <th>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.isArray(history) && history.length > 0 ? (
                    history.map((row) => {
                      const statusRaw = row.rental_status;
                      const statusClass = String(statusRaw || '').toLowerCase();
                      return (
                        <tr key={row.order_id}>
                          <td>
                            <strong>{row.item_name}</strong>
                            <br />
                            <small>#ORD-{row.order_id}</small>
                          </td>
                          <td>{row.formatted_period}</td>
                          <td>₱{row.formatted_total_price}</td>
                          <td>
                            <span className={`status-pill status-${statusClass}`}>
                              {String(statusRaw || '').toUpperCase()}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  ) : null}
                </tbody>
              </table>

              {(!Array.isArray(history) || history.length === 0) && (
                <div className="history-empty-card">
                  <div className="history-empty-icon">📁</div>
                  <h3 className="history-empty-title">No bookings yet</h3>
                  <p className="history-empty-text">
                    Your completed rentals will show up here.
                  </p>
                  <a href="../catalog/catalog.php" className="history-empty-link">
                    Browse Catalog
                  </a>
                </div>
              )}
            </div>
      </section>
    </div>
  );
};

export default ClientDashboardPage;
