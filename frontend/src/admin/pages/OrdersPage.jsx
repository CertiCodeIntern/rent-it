import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/admin-components.css";
import "../styles/admin-globals.css";
import "../styles/admin-theme.css";
import "../styles/pages/admin-dashboard.css";
import "../styles/pages/admin-login.css";
import "../styles/pages/orders.css";

export default function OrdersPage() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const itemsPerPage = 10;

  // Fetch orders on mount
  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await fetch("/admin/api/get_orders.php", {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch orders");
      const result = await response.json();
      if (result.success) {
        setOrders(result.data || []);
      } else {
        alert(result.message || "Failed to load orders");
      }
    } catch (err) {
      console.error("Error fetching orders:", err);
      alert("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const mockOrders = [
      {
        id: "ORD-001",
        customerName: "Juan Dela Cruz",
        customerEmail: "juan@example.com",
        customerAvatar: "JD",
        items: "Karaoke Pro System",
        itemCount: 1,
        rentalStart: "2025-01-28",
        rentalEnd: "2025-02-04",
        totalAmount: 5950,
        status: "pending",
        paymentStatus: "paid",
      },
      {
        id: "ORD-002",
        customerName: "Maria Santos",
        customerEmail: "maria@example.com",
        customerAvatar: "MS",
        items: "LED Projector, Speaker",
        itemCount: 2,
        rentalStart: "2025-01-25",
        rentalEnd: "2025-02-01",
        totalAmount: 3200,
        status: "confirmed",
        paymentStatus: "paid",
      },
      {
        id: "ORD-003",
        customerName: "Carlos Reyes",
        customerEmail: "carlos@example.com",
        customerAvatar: "CR",
        items: "Microphone Stand Pro",
        itemCount: 1,
        rentalStart: "2025-02-10",
        rentalEnd: "2025-02-15",
        totalAmount: 500,
        status: "out_for_delivery",
        paymentStatus: "paid",
      },
      {
        id: "ORD-004",
        customerName: "Ana Garcia",
        customerEmail: "ana@example.com",
        customerAvatar: "AG",
        items: "Bluetooth Speaker",
        itemCount: 1,
        rentalStart: "2025-02-01",
        rentalEnd: "2025-02-08",
        totalAmount: 1050,
        status: "active",
        paymentStatus: "paid",
      },
      {
        id: "ORD-005",
        customerName: "Roberto Lopez",
        customerEmail: "robert@example.com",
        customerAvatar: "RL",
        items: "4K Projector",
        itemCount: 1,
        rentalStart: "2025-02-12",
        rentalEnd: "2025-02-19",
        totalAmount: 8400,
        status: "return_scheduled",
        paymentStatus: "paid",
      },
      {
        id: "ORD-006",
        customerName: "Sofia Martinez",
        customerEmail: "sofia@example.com",
        customerAvatar: "SM",
        items: "Complete Audio Setup",
        itemCount: 3,
        rentalStart: "2025-01-15",
        rentalEnd: "2025-02-15",
        totalAmount: 12500,
        status: "completed",
        paymentStatus: "paid",
      },
      {
        id: "ORD-007",
        customerName: "Miguel Torres",
        customerEmail: "miguel@example.com",
        customerAvatar: "MT",
        items: "Karaoke System",
        itemCount: 1,
        rentalStart: "2025-02-20",
        rentalEnd: "2025-02-27",
        totalAmount: 5950,
        status: "returned",
        paymentStatus: "paid",
      },
      {
        id: "ORD-008",
        customerName: "Lucia Fernandez",
        customerEmail: "lucia@example.com",
        customerAvatar: "LF",
        items: "Portable Speaker",
        itemCount: 1,
        rentalStart: "2025-02-05",
        rentalEnd: "2025-02-10",
        totalAmount: 750,
        status: "cancelled",
        paymentStatus: "partial",
      },
      {
        id: "ORD-009",
        customerName: "Diego Rodriguez",
        customerEmail: "diego@example.com",
        customerAvatar: "DR",
        items: "LED Lights, Projector",
        itemCount: 2,
        rentalStart: "2025-03-01",
        rentalEnd: "2025-03-08",
        totalAmount: 2800,
        status: "pending",
        paymentStatus: "pending",
      },
      {
        id: "ORD-010",
        customerName: "Isabella Morales",
        customerEmail: "isabella@example.com",
        customerAvatar: "IM",
        items: "Sound System",
        itemCount: 1,
        rentalStart: "2025-02-14",
        rentalEnd: "2025-02-21",
        totalAmount: 3500,
        status: "active",
        paymentStatus: "paid",
      },
    ];
    // Removed mock data setup - using API endpoint instead

  // Filter and search
  useEffect(() => {
    let filtered = orders;

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(
        (order) => (order.status || "").toLowerCase() === statusFilter.toLowerCase()
      );
    }

    // Apply search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter((order) => {
        const itemNames = order.items ? order.items.map((i) => i.name).join(" ") : "";
        return (
          (order.id || "").toLowerCase().includes(term) ||
          (order.customer?.name || "").toLowerCase().includes(term) ||
          (order.customer?.email || "").toLowerCase().includes(term) ||
          itemNames.toLowerCase().includes(term)
        );
      });
    }

    setFilteredOrders(filtered);
    setCurrentPage(1);
  }, [orders, statusFilter, searchTerm]);

  // Pagination
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const startIdx = (currentPage - 1) * itemsPerPage;
  const paginatedOrders = filteredOrders.slice(
    startIdx,
    startIdx + itemsPerPage
  );

  const getStatusBadgeClass = (status) => {
    return `status-badge ${status}`;
  };

  const getDaysDifference = (start, end) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffTime = Math.abs(endDate - startDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getKPIStats = () => {
    const pending = orders.filter((o) => (o.status || "").toLowerCase() === "pending").length;
    const active = orders.filter((o) => (o.status || "").toLowerCase() === "active").length;
    const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
    const completed = orders.filter((o) => (o.status || "").toLowerCase() === "completed").length;

    return { pending, active, totalRevenue, completed };
  };

  const stats = getKPIStats();

  const handleExportOrders = () => {
    alert("Export functionality coming soon");
  };

  const handleRefreshOrders = async () => {
    await fetchOrders();
  };

  const handleViewOrder = (orderId) => {
    navigate(`/admin/orders/${orderId}`);
  };

  const handleConfirmOrder = async (orderId) => {
    if (!confirm("Confirm this order?")) return;
    try {
      const response = await fetch("/admin/api/update_order_status.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ order_id: orderId, status: "Confirmed" }),
      });
      if (!response.ok) throw new Error("Failed to confirm order");
      const result = await response.json();
      if (result.success) {
        alert("Order confirmed successfully!");
        await fetchOrders();
      } else {
        alert(result.message || "Failed to confirm order");
      }
    } catch (err) {
      console.error("Error confirming order:", err);
      alert("Error confirming order");
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!confirm("Are you sure you want to cancel this order?")) return;
    try {
      const response = await fetch("/admin/api/update_order_status.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ order_id: orderId, status: "Cancelled" }),
      });
      if (!response.ok) throw new Error("Failed to cancel order");
      const result = await response.json();
      if (result.success) {
        alert("Order cancelled.");
        await fetchOrders();
      } else {
        alert(result.message || "Failed to cancel order");
      }
    } catch (err) {
      console.error("Error cancelling order:", err);
      alert("Error cancelling order");
    }
  };

  return (
    <>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Orders</h1>
          <p className="admin-page-subtitle">
            Manage all incoming rental orders from customers
          </p>
        </div>
        <div className="admin-page-actions">
          <button
            className="btn btn-secondary"
            id="exportOrdersBtn"
            title="Export orders data"
            onClick={handleExportOrders}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              width="16"
              height="16"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Export
          </button>
          <button
            className="btn btn-secondary"
            id="refreshOrdersBtn"
            title="Refresh orders list"
            onClick={handleRefreshOrders}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              width="16"
              height="16"
            >
              <polyline points="23 4 23 10 17 10" />
              <polyline points="1 20 1 14 7 14" />
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
            </svg>
            Refresh
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <section className="orders-kpi-grid">
        <div className="kpi-card">
          <div className="kpi-icon warning">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          <div className="kpi-content">
            <div className="kpi-label">Pending Orders</div>
            <div className="kpi-value">{stats.pending}</div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon info">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
              <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
              <line x1="12" y1="22.08" x2="12" y2="12" />
            </svg>
          </div>
          <div className="kpi-content">
            <div className="kpi-label">Active Rentals</div>
            <div className="kpi-value">{stats.active}</div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon accent">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
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
            <div className="kpi-label">Total Revenue</div>
            <div className="kpi-value">₱{stats.totalRevenue.toLocaleString()}</div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon success">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <div className="kpi-content">
            <div className="kpi-label">Completed Orders</div>
            <div className="kpi-value">{stats.completed}</div>
          </div>
        </div>
      </section>

      {/* Filters & Search */}
      <div className="orders-toolbar">
        <div className="orders-search">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            width="18"
            height="18"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            id="orderSearchInput"
            placeholder="Search by order ID, customer, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="orders-filters">
          <select
            id="statusFilter"
            className="filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="out_for_delivery">Out for Delivery</option>
            <option value="active">Active</option>
            <option value="return_scheduled">Return Scheduled</option>
            <option value="completed">Completed</option>
            <option value="returned">Returned</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="orders-table-container">
        {loading ? (
          <div style={{ textAlign: "center", padding: "2rem", color: "var(--admin-text-muted)" }}>
            Loading orders...
          </div>
        ) : paginatedOrders.length > 0 ? (
          <table className="admin-table orders-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Dates</th>
                <th>Total</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody id="ordersTableBody">
              {paginatedOrders.map((order) => {
                const itemsText = !order.items || order.items.length === 0
                  ? "No items"
                  : order.items.length === 1
                  ? order.items[0].name
                  : `${order.items[0].name} +${order.items.length - 1} more`;
                const totalItems = order.items ? order.items.reduce((sum, item) => sum + (item.quantity || 1), 0) : 0;
                return (
                  <tr key={order.order_id}>
                    <td>
                      <span
                        className="order-id"
                        onClick={() => handleViewOrder(order.order_id)}
                      >
                        {order.id}
                      </span>
                    </td>
                    <td>
                      <div className="customer-cell">
                        <div className="customer-avatar">{(order.customer?.name || "?").charAt(0).toUpperCase()}</div>
                        <div className="customer-info">
                          <div className="customer-name">{order.customer?.name}</div>
                          <div className="customer-email">{order.customer?.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="items-cell">
                        <div className="item-name">{itemsText}</div>
                        <span className="item-count">{totalItems} item(s)</span>
                      </div>
                    </td>
                    <td>
                      <div className="dates-cell">
                        <div className="date-range">
                          {new Date(order.dates?.start).toLocaleDateString()} -{" "}
                          {new Date(order.dates?.end).toLocaleDateString()}
                        </div>
                        <div className="date-duration">
                          {order.dates?.duration || 0} days
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="total-amount">
                        ₱{Number(order.total || 0).toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                      </div>
                    </td>
                    <td>
                      <span className={getStatusBadgeClass(order.status)}>
                        {(order.status || "unknown").replace(/_/g, " ")}
                      </span>
                    </td>
                    <td>
                      <div className="actions-cell">
                        <button
                          className="action-btn view"
                          onClick={() => handleViewOrder(order.order_id)}
                          title="View order details"
                        >
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            width="14"
                            height="14"
                          >
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                        </button>
                        {(order.status || "").toLowerCase() === "pending" && (
                          <button
                            className="action-btn confirm"
                            onClick={() => handleConfirmOrder(order.order_id)}
                            title="Confirm order"
                          >
                            <svg
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              width="14"
                              height="14"
                            >
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          </button>
                        )}
                        {((order.status || "").toLowerCase() === "pending" ||
                          (order.status || "").toLowerCase() === "confirmed") && (
                          <button
                            className="action-btn cancel"
                            onClick={() => handleCancelOrder(order.order_id)}
                            title="Cancel order"
                          >
                            <svg
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              width="14"
                              height="14"
                            >
                              <circle cx="12" cy="12" r="10" />
                              <line x1="15" y1="9" x2="9" y2="15" />
                              <line x1="9" y1="9" x2="15" y2="15" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div className="orders-empty">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              width="48"
              height="48"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
            <h3 className="orders-empty-title">No orders found</h3>
            <p className="orders-empty-text">
              {searchTerm || statusFilter !== "all"
                ? "Try adjusting your search or filters"
                : "No orders to display"}
            </p>
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="orders-pagination">
        <span className="pagination-info">
          Showing {startIdx + 1}-{Math.min(startIdx + itemsPerPage, filteredOrders.length)} of{" "}
          {filteredOrders.length} orders
        </span>
        <div className="pagination-controls">
          <button
            className="pagination-btn"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            ← Previous
          </button>
          <div className="pagination-pages">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                className={`page-btn ${page === currentPage ? "active" : ""}`}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </button>
            ))}
          </div>
          <button
            className="pagination-btn"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            Next →
          </button>
        </div>
      </div>
    </>
  );
}
