import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../styles/admin-components.css";
import "../styles/admin-globals.css";
import "../styles/admin-theme.css";
import "../styles/pages/orders.css";
import "../styles/pages/order-detail.css";

const ADMIN_API_BASE = import.meta.env.DEV
  ? "/api/rent-it/admin/api"
  : "/rent-it/admin/api";

function formatCurrency(amount) {
  return (
    "₱" + Number(amount || 0).toLocaleString("en-PH", { minimumFractionDigits: 2 })
  );
}

function formatDate(dateStr, withTime = false) {
  if (!dateStr) return "Pending";
  const d = new Date(dateStr);
  const options = {
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  if (withTime) {
    options.hour = "numeric";
    options.minute = "2-digit";
    options.hour12 = true;
  }
  return d.toLocaleDateString("en-US", options);
}

function formatShortDate(dateStr) {
  if (!dateStr) return "Pending";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getInitial(name) {
  return (name || "?").charAt(0).toUpperCase();
}

function getStatusText(status) {
  const map = {
    pending: "Pending",
    confirmed: "Confirmed",
    out_for_delivery: "Out for Delivery",
    active: "Active",
    return_scheduled: "Return Scheduled",
    returned: "Returned",
    completed: "Completed",
    cancelled: "Cancelled",
    late: "Late",
  };
  return map[status] || status || "Unknown";
}

function OrderDetailPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (!orderId) return;
    const fetchOrder = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${ADMIN_API_BASE}/get_order.php?id=${orderId}`, {
          credentials: "include",
        });
        if (!res.ok) throw new Error("Failed to fetch order");
        const json = await res.json();
        if (!json.success) throw new Error(json.message || "Failed to load order");
        setOrder(json.data);
      } catch (e) {
        console.error("Order detail fetch error", e);
        setError(e.message || "Failed to load order details");
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderId]);

  const updateStatus = async (newStatus, confirmMessage) => {
    if (!order) return;
    if (!window.confirm(confirmMessage)) return;
    setUpdating(true);
    try {
      const res = await fetch(`${ADMIN_API_BASE}/update_order_status.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ order_id: order.order_id, status: newStatus }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      const json = await res.json();
      if (!json.success) throw new Error(json.message || "Status update failed");
      alert("Order status updated");
      setOrder((prev) => (prev ? { ...prev, status: newStatus } : prev));
    } catch (e) {
      console.error("Order status update error", e);
      alert(e.message || "Failed to update order status");
    } finally {
      setUpdating(false);
    }
  };

  const renderHeaderActions = () => {
    if (!order) return null;
    const status = order.status;
    const btn = (label, colorClass, onClick) => (
      <button
        className={`btn btn-${colorClass}`}
        onClick={onClick}
        disabled={updating}
      >
        {label}
      </button>
    );

    if (status === "pending") {
      return (
        <>
          {btn("Cancel Order", "secondary", () =>
            updateStatus("Cancelled", "Are you sure you want to cancel this order?")
          )}
          {btn("Confirm Order", "primary", () =>
            updateStatus("Booked", "Confirm this order?")
          )}
        </>
      );
    }
    if (status === "confirmed") {
      return btn("Dispatch Order", "primary", () =>
        updateStatus("In Transit", "Mark this order as dispatched?")
      );
    }
    if (status === "out_for_delivery") {
      return btn("Mark as Delivered", "primary", () =>
        updateStatus("Active", "Mark this order as delivered?")
      );
    }
    if (status === "active") {
      return btn("Schedule Return", "secondary", () =>
        updateStatus("Pending Return", "Mark this order as pending return?")
      );
    }
    if (status === "return_scheduled") {
      return btn("Mark Returned", "primary", () =>
        updateStatus("Returned", "Mark this order as returned?")
      );
    }
    if (status === "returned" || status === "late") {
      return btn("Mark Completed", "primary", () =>
        updateStatus("Completed", "Mark this order as completed?")
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="admin-content">
        <div
          style={{
            minHeight: 400,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span style={{ color: "var(--admin-text-muted)" }}>Loading order...</span>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="admin-content">
        <div
          className="detail-card"
          style={{ gridColumn: "1 / -1", textAlign: "center", padding: "3rem" }}
        >
          <h2>Order Not Found</h2>
          <p>{error || "The order you are looking for does not exist or has been removed."}</p>
          <button
            className="btn btn-primary"
            style={{ marginTop: "1rem" }}
            onClick={() => navigate("/admin/orders")}
          >
            Back to Orders
          </button>
        </div>
      </div>
    );
  }

  const customer = order.customer || {};
  const items = order.items || [];
  const dates = order.dates || {};
  const delivery = order.delivery || {};
  const payment = order.payment || {};
  const notes = order.notes || [];
  const timeline = order.timeline || [];

  const totalItems = items.reduce((sum, it) => sum + (it.quantity || 1), 0);

  return (
    <div className="admin-content">
      <div className="admin-page-header">
        <div className="page-header-left">
          <button
            className="back-link"
            type="button"
            onClick={() => navigate("/admin/orders")}
            title="Back to orders"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              width="20"
              height="20"
            >
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
          </button>
          <div>
            <div className="order-header-top">
              <h1 className="admin-page-title">{order.id}</h1>
              <span className={`status-badge ${order.status}`}>
                {getStatusText(order.status)}
              </span>
            </div>
            <p className="admin-page-subtitle">
              Placed on {formatDate(dates.ordered, true)}
            </p>
          </div>
        </div>
        <div className="admin-page-actions">{renderHeaderActions()}</div>
      </div>

      <div className="order-detail-grid">
        <div className="order-detail-left">
          <section className="detail-card">
            <div className="detail-card-header">
              <h2 className="detail-card-title">Customer Information</h2>
            </div>
            <div className="detail-card-body">
              <div className="customer-detail">
                <div className="customer-avatar-lg">{getInitial(customer.name)}</div>
                <div className="customer-detail-info">
                  <h3 className="customer-detail-name">{customer.name}</h3>
                  <p className="customer-detail-email">{customer.email}</p>
                  <p className="customer-detail-phone">{customer.phone}</p>
                </div>
              </div>
            </div>
          </section>

          <section className="detail-card">
            <div className="detail-card-header">
              <h2 className="detail-card-title">Rental Items</h2>
              <span className="item-count-badge">
                {totalItems} item{totalItems !== 1 ? "s" : ""}
              </span>
            </div>
            <div className="detail-card-body">
              <div className="rental-items-list">
                {items.length === 0 ? (
                  <div className="rental-items-empty">
                    <p className="rental-items-empty-title">No items in this order</p>
                  </div>
                ) : (
                  items.map((item) => (
                    <div className="rental-item" key={item.id || item.name}>
                      <div className="rental-item-image">
                        <div className="img-fallback">
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            width="24"
                            height="24"
                          >
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                            <circle cx="8.5" cy="8.5" r="1.5" />
                            <polyline points="21 15 16 10 5 21" />
                          </svg>
                        </div>
                      </div>
                      <div className="rental-item-info">
                        <div className="rental-item-name">{item.name}</div>
                        <div className="rental-item-category">{item.category}</div>
                        <div className="rental-item-meta">
                          <span>Qty: {item.quantity}</span>
                          <span>
                            {dates.duration || 0} day{(dates.duration || 0) !== 1 ? "s" : ""}
                          </span>
                        </div>
                      </div>
                      <div className="rental-item-price">
                        <div className="rental-item-rate">
                          {formatCurrency(item.dailyRate)}/day
                        </div>
                        <div className="rental-item-total">
                          Total: {formatCurrency(item.subtotal)}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </section>

          <section className="detail-card">
            <div className="detail-card-header">
              <h2 className="detail-card-title">Order Timeline</h2>
            </div>
            <div className="detail-card-body">
              <div className="timeline">
                {timeline.length === 0 ? (
                  <div className="timeline-item">
                    <div className="timeline-content">
                      <div className="timeline-title">No timeline events</div>
                    </div>
                  </div>
                ) : (
                  timeline.map((t, idx) => (
                    <div
                      key={idx}
                      className={`timeline-item ${
                        t.completed ? "completed" : ""
                      } ${t.current ? "current" : ""}`}
                    >
                      <div className="timeline-icon" />
                      <div className="timeline-content">
                        <div className="timeline-title">{t.event}</div>
                        <div className="timeline-date">
                          {t.date ? formatDate(t.date, true) : "Pending"}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </section>
        </div>

        <div className="order-detail-right">
          <section className="detail-card">
            <div className="detail-card-header">
              <h2 className="detail-card-title">Delivery Information</h2>
            </div>
            <div className="detail-card-body">
              <div className="info-row">
                <span className="info-label">Method</span>
                <span className="info-value">{delivery.method}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Address</span>
                <span className="info-value">{delivery.address}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Scheduled</span>
                <span className="info-value">
                  {formatShortDate(delivery.scheduledDate)}
                </span>
              </div>
              <div className="info-row">
                <span className="info-label">Driver</span>
                <span className="info-value">Not Assigned</span>
              </div>
              <div className="info-row">
                <span className="info-label">Notes</span>
                <span className="info-value">No special instructions</span>
              </div>
            </div>
          </section>

          <section className="detail-card">
            <div className="detail-card-header">
              <h2 className="detail-card-title">Payment Summary</h2>
              <span className={`payment-badge ${payment.status || ""}`}>
                {(payment.status || "").charAt(0).toUpperCase() +
                  (payment.status || "").slice(1)}
              </span>
            </div>
            <div className="detail-card-body">
              <div className="payment-rows">
                <div className="payment-row">
                  <span className="label">Subtotal</span>
                  <span className="value">{formatCurrency(payment.subtotal)}</span>
                </div>
                <div className="payment-row">
                  <span className="label">Tax (12%)</span>
                  <span className="value">{formatCurrency(payment.tax)}</span>
                </div>
                <div className="payment-row">
                  <span className="label">Delivery Fee</span>
                  <span className="value">{formatCurrency(payment.deliveryFee)}</span>
                </div>
                <div className="payment-row">
                  <span className="label">Security Deposit</span>
                  <span className="value">{formatCurrency(payment.deposit)}</span>
                </div>
                {payment.discount > 0 && (
                  <div className="payment-row discount">
                    <span className="label">Discount</span>
                    <span className="value">-
                      {formatCurrency(payment.discount)}
                    </span>
                  </div>
                )}
              </div>
              <div className="payment-total">
                <span>Total</span>
                <span>{formatCurrency(payment.total)}</span>
              </div>
            </div>
          </section>

          <section className="detail-card">
            <div className="detail-card-header">
              <h2 className="detail-card-title">Order Notes</h2>
            </div>
            <div className="detail-card-body">
              <div className="notes-list">
                {notes.length === 0 ? (
                  <div className="notes-empty">No notes yet</div>
                ) : (
                  notes.map((n, idx) => (
                    <div key={idx} className="note-item">
                      <div className="note-header">
                        <span className="note-author">{n.author}</span>
                        <span className="note-date">
                          {formatDate(n.date, true)}
                        </span>
                      </div>
                      <p className="note-text">{n.text}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default OrderDetailPage;
