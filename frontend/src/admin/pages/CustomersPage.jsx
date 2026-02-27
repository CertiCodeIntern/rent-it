import React, { useState, useEffect } from "react";
import "../styles/admin-components.css";
import "../styles/admin-globals.css";
import "../styles/admin-theme.css";
import "../styles/pages/admin-dashboard.css";
import "../styles/pages/admin-login.css";
import "../styles/pages/customers.css";

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortFilter, setSortFilter] = useState("recent");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ activeBookings: 0, monthlyRevenue: "0", totalCustomers: 0, overdueReturns: 0 });
  const itemsPerPage = 10;

  // Fetch customers from API
  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const response = await fetch("/admin/api/get_customers.php", {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch customers");
      const result = await response.json();
      if (result.success) {
        const customersData = (result.customers || []).map((customer) => ({
          id: customer.id || customer.customer_id,
          name: customer.name || customer.fullname || "",
          email: customer.email || "",
          avatar: customer.avatar || (customer.name || "").substring(0, 2).toUpperCase(),
          bookings: (customer.bookings || [customer.booking]).filter(Boolean).map((booking) => ({
            id: booking.id || booking.order_id,
            orderId: booking.order_id || booking.id || "",
            items: typeof booking.items === "string" ? booking.items : (booking.items || []).join(", "),
            itemCount: booking.totalItems || (Array.isArray(booking.items) ? booking.items.length : 1),
            rentalStart: booking.startDate || booking.start_date || "",
            rentalEnd: booking.endDate || booking.end_date || "",
            duration: booking.duration ? `${booking.duration} days` : "0 days",
            status: booking.status || "pending",
            payment: booking.payment || "pending",
          })),
        }));
        setCustomers(customersData);
        setStats({
          activeBookings: result.stats?.activeBookings || 0,
          monthlyRevenue: (result.stats?.monthlyRevenue || 0).toLocaleString(),
          totalCustomers: result.stats?.totalCustomers || customersData.length,
          overdueReturns: result.stats?.overdueReturns || 0,
        });
      } else {
        alert(result.message || "Failed to load customers");
      }
    } catch (err) {
      console.error("Error fetching customers:", err);
      alert("Failed to load customers");
    } finally {
      setLoading(false);
    }
  };



  // Filter and search
  useEffect(() => {
    let filtered = customers;

    // Apply status filter
    if (statusFilter !== "all") {
      if (statusFilter === "active") {
        filtered = filtered.filter((c) => c.bookings.some((b) => b.status === "active"));
      } else if (statusFilter === "overdue") {
        filtered = filtered.filter((c) => c.bookings.some((b) => b.status === "overdue"));
      } else if (statusFilter === "inactive") {
        filtered = filtered.filter((c) => !c.bookings.some((b) => b.status === "active"));
      }
    }

    // Apply search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.name.toLowerCase().includes(term) ||
          c.email.toLowerCase().includes(term) ||
          c.bookings.some((b) => b.id.toLowerCase().includes(term))
      );
    }

    // Apply sort
    if (sortFilter === "name") {
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortFilter === "bookings") {
      filtered.sort((a, b) => b.bookings.length - a.bookings.length);
    } else if (sortFilter === "revenue") {
      // Mock revenue calculation
      filtered.sort((a, b) => {
        const revenueA = a.bookings.reduce((sum, b) => sum + (parseInt(b.duration) * 100), 0);
        const revenueB = b.bookings.reduce((sum, b) => sum + (parseInt(b.duration) * 100), 0);
        return revenueB - revenueA;
      });
    }

    setFilteredCustomers(filtered);
    setCurrentPage(1);
  }, [customers, statusFilter, searchTerm, sortFilter]);

  const kpi = stats;
  const paginatedCustomers = filteredCustomers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);

  const handleExport = () => {
    alert("Export functionality would be implemented here.");
  };

  const handleViewCustomer = (customerId) => {
    alert(`View customer ${customerId}`);
  };

  const handleEmailCustomer = (customerEmail) => {
    alert(`Email modal would open for ${customerEmail}`);
  };

  const handleCallCustomer = (customerName, customerPhone = "+63-917-000-0000") => {
    alert(`Call would be initiated for ${customerName}: ${customerPhone}`);
  };

  const getPrimaryBooking = (customer) => {
    return customer.bookings.length > 0 ? customer.bookings[0] : null;
  };

  return (
    <>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Customers</h1>
          <p className="admin-page-subtitle">
            Manage customer accounts and rental history
          </p>
        </div>
        <div className="admin-page-actions">
          <button className="btn btn-secondary" onClick={handleExport} title="Export customer data">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Export
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <section className="customers-kpi-grid">
        <div className="kpi-card">
          <div className="kpi-icon info">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </div>
          <div className="kpi-content">
            <div className="kpi-value">{kpi.activeBookings}</div>
            <div className="kpi-label">Active Bookings</div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon accent">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <text
                x="12"
                y="17"
                textAnchor="middle"
                fontSize="16"
                fontWeight="bold"
                fill="currentColor"
                stroke="none"
              >
                ₱
              </text>
            </svg>
          </div>
          <div className="kpi-content">
            <div className="kpi-value">₱{kpi.monthlyRevenue}</div>
            <div className="kpi-label">Monthly Revenue</div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon success">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <div className="kpi-content">
            <div className="kpi-value">{kpi.totalCustomers.toLocaleString()}</div>
            <div className="kpi-label">Total Customers</div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon warning">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <div className="kpi-content">
            <div className="kpi-value">{kpi.overdueReturns}</div>
            <div className="kpi-label">Overdue Returns</div>
          </div>
        </div>
      </section>

      {/* Toolbar */}
      <div className="customers-toolbar">
        <div className="customers-search">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Search by name, email, or booking ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="customers-filters">
          <select
            className="filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Customers</option>
            <option value="active">Active Rentals</option>
            <option value="overdue">Overdue</option>
            <option value="inactive">No Active Rentals</option>
          </select>
          <select
            className="filter-select"
            value={sortFilter}
            onChange={(e) => setSortFilter(e.target.value)}
          >
            <option value="recent">Most Recent</option>
            <option value="name">Name A-Z</option>
            <option value="bookings">Most Bookings</option>
            <option value="revenue">Highest Revenue</option>
          </select>
        </div>
      </div>

      {/* Customers Table */}
      <div className="customers-table-container">
        {loading ? (
          <div className="customers-empty">
            <p>Loading customers...</p>
          </div>
        ) : paginatedCustomers.length > 0 ? (
          <table className="admin-table customers-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Booking ID</th>
                <th>Items</th>
                <th>Rental Period</th>
                <th>Status</th>
                <th>Payment</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedCustomers.map((customer) => {
                const primaryBooking = getPrimaryBooking(customer);
                return (
                  <tr key={customer.id}>
                    <td>
                      <div className="customer-cell">
                        <div className="customer-avatar">{customer.avatar}</div>
                        <div className="customer-info">
                          <div className="customer-name">{customer.name}</div>
                          <div className="customer-email">{customer.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      {customer.bookings.length > 1 ? (
                        <select className="booking-dropdown" defaultValue={primaryBooking.id}>
                          {customer.bookings.map((booking) => (
                            <option key={booking.id} value={booking.id}>
                              {booking.id}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span className="booking-id">{primaryBooking?.id}</span>
                      )}
                    </td>
                    <td>
                      <div className="items-cell">
                        <div className="item-name">{primaryBooking?.items}</div>
                        <div className="item-count">{primaryBooking?.itemCount} item(s)</div>
                      </div>
                    </td>
                    <td>
                      <div className="dates-cell">
                        <div className="date-range">
                          {primaryBooking?.rentalStart} to {primaryBooking?.rentalEnd}
                        </div>
                        <div className="date-duration">{primaryBooking?.duration}</div>
                      </div>
                    </td>
                    <td>
                      <span className={`status-badge ${primaryBooking?.status}`}>
                        {primaryBooking?.status.charAt(0).toUpperCase() +
                          primaryBooking?.status.slice(1)}
                      </span>
                    </td>
                    <td>
                      <span className={`payment-badge ${primaryBooking?.payment}`}>
                        {primaryBooking?.payment.charAt(0).toUpperCase() +
                          primaryBooking?.payment.slice(1)}
                      </span>
                    </td>
                    <td>
                      <div className="actions-cell">
                        <button
                          className="action-btn view"
                          onClick={() => handleViewCustomer(customer.id)}
                          title="View customer"
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                        </button>
                        <button
                          className="action-btn email"
                          onClick={() => handleEmailCustomer(customer.email)}
                          title="Send email"
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="2" y="4" width="20" height="16" rx="2" />
                            <path d="M2 6l10 7 10-7" />
                          </svg>
                        </button>
                        <button
                          className="action-btn call"
                          onClick={() => handleCallCustomer(customer.name)}
                          title="Call customer"
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div className="customers-empty">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            <div className="customers-empty-title">No customers found</div>
            <div className="customers-empty-text">
              Try adjusting your search or filter criteria.
            </div>
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="customers-pagination">
        <span className="pagination-info">
          Showing {(currentPage - 1) * itemsPerPage + 1}-
          {Math.min(currentPage * itemsPerPage, filteredCustomers.length)} of{" "}
          {filteredCustomers.length} customers
        </span>
        <div className="pagination-controls">
          <button
            className="pagination-btn"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <span className="pagination-pages">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => (
              <button
                key={i + 1}
                className={`page-btn ${currentPage === i + 1 ? "active" : ""}`}
                onClick={() => setCurrentPage(i + 1)}
              >
                {i + 1}
              </button>
            ))}
            {totalPages > 5 && <span className="page-dots">...</span>}
            {totalPages > 5 && (
              <button
                className={`page-btn ${currentPage === totalPages ? "active" : ""}`}
                onClick={() => setCurrentPage(totalPages)}
              >
                {totalPages}
              </button>
            )}
          </span>
          <button
            className="pagination-btn"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>
      </div>
    </>
  );
}
