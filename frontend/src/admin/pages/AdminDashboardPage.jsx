import React, { useState, useEffect } from 'react';
import api from '../api/client';

// Dashboard-specific CSS
import '../styles/pages/admin-dashboard.css';

// Helper: status badge class — matches original PHP getStatusBadgeClass()
function getStatusBadgeClass(status) {
    const s = (status || '').toLowerCase();
    switch (s) {
        case 'active': case 'confirmed': case 'completed': case 'returned':
            return 'status-success';
        case 'booked':
            return 'status-booked';
        case 'in transit':
            return 'status-transit';
        case 'pending': case 'pending return':
            return 'status-pending';
        case 'cancelled':
            return 'status-danger';
        default:
            return 'status-info';
    }
}

// Helper: format currency — matches PHP formatCurrency()
function formatCurrency(amount) {
    return '₱' + Number(amount || 0).toLocaleString('en-PH', { maximumFractionDigits: 0 });
}

// Helper: format date range like "Jan 5-7 (3 days)"
function formatDuration(startStr, endStr) {
    if (!startStr || !endStr) return '—';
    const start = new Date(startStr);
    const end = new Date(endStr);
    const days = Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1;
    const startMonth = start.toLocaleDateString('en-US', { month: 'short' });
    const startDay = start.getDate();
    const endDay = end.getDate();
    return `${startMonth} ${startDay}-${endDay} (${days} day${days > 1 ? 's' : ''})`;
}

export default function AdminDashboardPage() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        api.get('/get_dashboard.php')
            .then(res => {
                if (res.data.success) {
                    setData(res.data);
                } else {
                    setError('Failed to load dashboard data');
                }
            })
            .catch(err => {
                console.error('Dashboard fetch error:', err);
                setError('Failed to load dashboard data');
            })
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
                <div className="animate-spin" style={{ width: 32, height: 32, border: '3px solid var(--admin-border-color)', borderTopColor: 'var(--admin-accent)', borderRadius: '50%' }} />
            </div>
        );
    }

    if (error || !data) {
        return (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--admin-text-muted)' }}>
                <p>{error || 'Something went wrong'}</p>
                <button className="btn btn-primary" onClick={() => window.location.reload()} style={{ marginTop: '1rem' }}>Retry</button>
            </div>
        );
    }

    const { kpi, inventory, recentBookings, todaySchedule, today } = data;
    const totalItems = inventory.totalItems || 1;
    const rentedPercent = Math.round((inventory.itemsRented / totalItems) * 100);
    const repairPercent = Math.round((inventory.itemsRepair / totalItems) * 100);
    const cleaningPercent = Math.round((inventory.itemsCleaning / totalItems) * 100);
    const availablePercent = Math.round((kpi.machinesAvailable / totalItems) * 100);

    const SCHEDULE_TIMES = ['09:00 AM', '11:30 AM', '02:00 PM', '04:30 PM'];

    // Format today's date for the badge
    const todayDate = new Date(today + 'T00:00:00');
    const todayLabel = todayDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    return (
        <>
            {/* Page Header */}
            <div className="admin-page-header">
                <div>
                    <h1 className="admin-page-title">Dashboard</h1>
                    <p className="admin-page-subtitle">Welcome back! Here's an overview of your rental business.</p>
                </div>
                <div className="admin-page-actions">
                    <button className="btn btn-secondary" title="Export dashboard data as PDF">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
                        </svg>
                        Export Report
                    </button>
                    <a href="/admin/calendar" className="btn btn-primary" title="View booking calendar">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                        </svg>
                        View Calendar
                    </a>
                </div>
            </div>

            {/* KPI Cards */}
            <section className="kpi-grid" title="Key Performance Indicators">
                {/* Revenue */}
                <div className="kpi-card animate-fadeInUp stagger-1">
                    <div className="kpi-icon accent" title="Total revenue this month">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                        </svg>
                    </div>
                    <div className="kpi-content">
                        <div className="kpi-label">Total Revenue</div>
                        <div className="kpi-value">{formatCurrency(kpi.totalRevenue)}</div>
                        <span className={`kpi-change ${kpi.revenueChange >= 0 ? 'positive' : 'negative'}`} title={`${kpi.revenueChange >= 0 ? '+' : ''}${kpi.revenueChange}% compared to last month`}>
                            <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points={kpi.revenueChange >= 0 ? '23 6 13.5 15.5 8.5 10.5 1 18' : '23 18 13.5 8.5 8.5 13.5 1 6'} />
                            </svg>
                            {kpi.revenueChange >= 0 ? '+' : ''}{kpi.revenueChange}%
                        </span>
                    </div>
                </div>

                {/* Active Rentals */}
                <div className="kpi-card animate-fadeInUp stagger-2">
                    <div className="kpi-icon info" title="Currently active rentals">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                        </svg>
                    </div>
                    <div className="kpi-content">
                        <div className="kpi-label">Active Rentals</div>
                        <div className="kpi-value">{kpi.activeRentals}</div>
                        <span className="kpi-change positive" title="Currently active">
                            <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor"><circle cx="12" cy="12" r="4" /></svg>
                            In progress
                        </span>
                    </div>
                </div>

                {/* Pending Deliveries */}
                <div className="kpi-card animate-fadeInUp stagger-3">
                    <div className="kpi-icon warning" title="Pending deliveries scheduled">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="1" y="3" width="15" height="13" /><polygon points="16 8 20 8 23 11 23 16 16 16 16 8" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" />
                        </svg>
                    </div>
                    <div className="kpi-content">
                        <div className="kpi-label">Pending Deliveries</div>
                        <div className="kpi-value">{kpi.pendingDeliveries}</div>
                        <span className="kpi-change neutral" title="Deliveries scheduled for next 2 days">Next 2 days</span>
                    </div>
                </div>

                {/* Machines Available */}
                <div className="kpi-card animate-fadeInUp stagger-4">
                    <div className="kpi-icon success" title="Machines ready for rental">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
                        </svg>
                    </div>
                    <div className="kpi-content">
                        <div className="kpi-label">Machines Available</div>
                        <div className="kpi-value">{kpi.machinesAvailable}</div>
                        <span className="kpi-change positive" title="All units ready to rent">
                            <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor"><circle cx="12" cy="12" r="4" /></svg>
                            Ready to rent
                        </span>
                    </div>
                </div>
            </section>

            {/* Main Grid */}
            <div className="dashboard-grid">
                {/* Recent Bookings */}
                <section className="admin-card bookings-section animate-fadeInUp">
                    <div className="admin-card-header">
                        <h2 className="admin-card-title">Recent Bookings</h2>
                        <a href="/admin/orders" className="btn btn-ghost btn-sm" title="View all orders">
                            View All
                            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
                        </a>
                    </div>
                    <div className="admin-card-body" style={{ padding: 0 }}>
                        <div className="admin-table-wrapper" style={{ border: 'none', borderRadius: 0 }}>
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th title="Customer who made the booking">Customer</th>
                                        <th title="Equipment model rented">Machine</th>
                                        <th title="Rental period">Duration</th>
                                        <th title="Current booking status">Status</th>
                                        <th title="Available actions">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentBookings.length > 0 ? recentBookings.map(booking => {
                                        const customerName = booking.customer_name || 'Unknown Customer';
                                        const customerInitial = customerName.charAt(0).toUpperCase();
                                        const items = booking.items || 'No items';
                                        const statusClass = getStatusBadgeClass(booking.rental_status);
                                        return (
                                            <tr key={booking.order_id}>
                                                <td>
                                                    <div className="customer-cell">
                                                        <div className="customer-avatar">{customerInitial}</div>
                                                        <span>{customerName}</span>
                                                    </div>
                                                </td>
                                                <td>{items}</td>
                                                <td title={`${new Date(booking.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${new Date(booking.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`}>
                                                    {formatDuration(booking.start_date, booking.end_date)}
                                                </td>
                                                <td><span className={`status-badge ${statusClass}`}>{booking.rental_status}</span></td>
                                                <td>
                                                    <div className="table-action-btns">
                                                        <button className="btn-icon" title="View booking details">
                                                            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                                                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
                                                            </svg>
                                                        </button>
                                                        <button className="btn-icon" title="Edit booking">
                                                            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                                                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    }) : (
                                        <tr>
                                            <td colSpan="5" style={{ textAlign: 'center', padding: '2rem' }}>
                                                <p style={{ color: 'var(--admin-text-muted)', margin: 0 }}>No recent bookings found</p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </section>

                {/* Right Column */}
                <div className="dashboard-sidebar">
                    {/* Today's Schedule */}
                    <section className="admin-card schedule-card animate-fadeInUp">
                        <div className="admin-card-header">
                            <h2 className="admin-card-title">Today's Schedule</h2>
                            <span className="status-badge status-info" title="Current date">{todayLabel}</span>
                        </div>
                        <div className="admin-card-body">
                            <div className="schedule-timeline">
                                {todaySchedule.length > 0 ? todaySchedule.map((schedule, i) => {
                                    const isDropoff = schedule.start_date === today;
                                    const type = isDropoff ? 'Drop-off' : 'Pick-up';
                                    let timeClass = '';
                                    let statusClass = '';

                                    if (schedule.rental_status === 'Active' || schedule.rental_status === 'Completed') {
                                        timeClass = 'success';
                                        statusClass = 'success';
                                    } else if (schedule.rental_status === 'Pending' || schedule.rental_status === 'Pending Return') {
                                        timeClass = 'warning';
                                        statusClass = 'warning';
                                    } else {
                                        statusClass = 'pending';
                                    }

                                    const address = schedule.delivery_address || schedule.customer_address || schedule.venue || 'Address not set';
                                    const customerName = schedule.customer_name || 'Unknown';
                                    const schedItems = schedule.items || 'No items';

                                    return (
                                        <div className="timeline-item" key={schedule.order_id} title={`${type} for ${customerName}`}>
                                            <div className={`timeline-time ${timeClass}`}>{SCHEDULE_TIMES[i % 4]}</div>
                                            <div className="timeline-content">
                                                <div className="timeline-title">{type}: {customerName}</div>
                                                <div className="timeline-subtitle">{schedItems} • {address}</div>
                                            </div>
                                            <span className={`timeline-status ${statusClass}`}></span>
                                        </div>
                                    );
                                }) : (
                                    <div className="timeline-item">
                                        <div className="timeline-content" style={{ textAlign: 'center', padding: '1rem' }}>
                                            <div className="timeline-subtitle">No scheduled deliveries or pickups for today</div>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <a href="/admin/dispatch" className="btn btn-secondary btn-sm" style={{ width: '100%', marginTop: 'var(--admin-spacing-lg)' }} title="View full dispatch schedule">
                                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="12" cy="10" r="3" /><path d="M12 21.7C17.3 17 20 13 20 10a8 8 0 1 0-16 0c0 3 2.7 6.9 8 11.7z" />
                                </svg>
                                View Dispatch Map
                            </a>
                        </div>
                    </section>

                    {/* Inventory Health */}
                    <section className="admin-card inventory-card animate-fadeInUp">
                        <div className="admin-card-header">
                            <h2 className="admin-card-title">Inventory Health</h2>
                            <a href="/admin/repairs" className="btn btn-ghost btn-sm" title="Manage inventory and repairs">Manage</a>
                        </div>
                        <div className="admin-card-body">
                            <div className="inventory-item" title={`${inventory.itemsRented} out of ${inventory.totalItems} units currently rented`}>
                                <div className="inventory-label">
                                    <span>Units Rented</span>
                                    <span className="inventory-value">{inventory.itemsRented} / {inventory.totalItems}</span>
                                </div>
                                <div className="progress-bar">
                                    <div className="progress-fill rented" style={{ width: `${rentedPercent}%` }}></div>
                                </div>
                            </div>
                            <div className="inventory-item" title={`${inventory.itemsRepair} units currently under repair`}>
                                <div className="inventory-label">
                                    <span>In Repair</span>
                                    <span className="inventory-value warning">{inventory.itemsRepair} Unit{inventory.itemsRepair !== 1 ? 's' : ''}</span>
                                </div>
                                <div className="progress-bar">
                                    <div className="progress-fill repair" style={{ width: `${repairPercent}%` }}></div>
                                </div>
                            </div>
                            <div className="inventory-item" title={`${inventory.itemsCleaning} units being cleaned`}>
                                <div className="inventory-label">
                                    <span>Cleaning</span>
                                    <span className="inventory-value info">{inventory.itemsCleaning} Unit{inventory.itemsCleaning !== 1 ? 's' : ''}</span>
                                </div>
                                <div className="progress-bar">
                                    <div className="progress-fill cleaning" style={{ width: `${cleaningPercent}%` }}></div>
                                </div>
                            </div>
                            <div className="inventory-item" title={`${kpi.machinesAvailable} units available for rent`}>
                                <div className="inventory-label">
                                    <span>Available</span>
                                    <span className="inventory-value success">{kpi.machinesAvailable} Unit{kpi.machinesAvailable !== 1 ? 's' : ''}</span>
                                </div>
                                <div className="progress-bar">
                                    <div className="progress-fill available" style={{ width: `${availablePercent}%` }}></div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Quick Actions */}
                    <section className="admin-card quick-actions animate-fadeInUp">
                        <div className="admin-card-header">
                            <h2 className="admin-card-title">Quick Actions</h2>
                        </div>
                        <div className="admin-card-body">
                            <div className="quick-actions-grid">
                                <a href="/admin/calendar" className="quick-action-btn" title="View calendar master view">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                                    </svg>
                                    <span>Calendar</span>
                                </a>
                                <a href="/admin/repairs" className="quick-action-btn" title="Manage repairs and maintenance">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
                                    </svg>
                                    <span>Repairs</span>
                                </a>
                                <a href="/admin/latefees" className="quick-action-btn" title="Track late fees and penalties">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                                    </svg>
                                    <span>Late Fees</span>
                                </a>
                                <a href="/admin/customers" className="quick-action-btn" title="Manage customer database">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
                                    </svg>
                                    <span>Customers</span>
                                </a>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </>
    );
}
