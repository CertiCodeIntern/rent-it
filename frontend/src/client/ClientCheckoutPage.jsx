import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './css/ClientCheckoutPage.css';

const API_BASE = import.meta.env.DEV ? '/api/rent-it' : '/rent-it';
const STORAGE_KEY = 'rentit_cart';

const DELIVERY_FEE_DEFAULT = 150;
const SERVICE_FEE = 50;

function generateOrderRef() {
  const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomPart = Math.random().toString(36).slice(-6).toUpperCase();
  return `RIT-${datePart}-${randomPart}`;
}

function ClientCheckoutPage() {
  const navigate = useNavigate();
  const [orderRef] = useState(generateOrderRef);
  const [items, setItems] = useState([]);
  const [deliveryType, setDeliveryType] = useState('standard');
  const [deliveryFee, setDeliveryFee] = useState(DELIVERY_FEE_DEFAULT);
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [createdOrderId, setCreatedOrderId] = useState(null);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      if (Array.isArray(parsed)) {
        setItems(parsed);
      }
    } catch (e) {
      setItems([]);
    }
  }, []);

  const { subtotal, rentalDays } = useMemo(() => {
    let sum = 0;
    let maxDays = 0;
    items.forEach((item) => {
      const days = Number(item.days || 0) || 1;
      const price = Number(item.price || 0);
      sum += price * days;
      if (days > maxDays) maxDays = days;
    });
    return { subtotal: sum, rentalDays: maxDays || 1 };
  }, [items]);

  const grandTotal = useMemo(
    () => subtotal + deliveryFee + SERVICE_FEE,
    [subtotal, deliveryFee],
  );

  const handleDeliveryChange = (type, fee) => {
    setDeliveryType(type);
    setDeliveryFee(fee);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setSubmitError('');

    try {
      const formData = new FormData();
      formData.append('order_ref', orderRef);
      formData.append('grand_total', String(grandTotal));
      formData.append('rental_days', String(rentalDays));
      formData.append('delivery_type', deliveryType);
      formData.append('payment_method', paymentMethod);
      formData.append('venue', 'Home Delivery');
      formData.append('cart_ids', JSON.stringify(items.map((i) => i.id)));

      const response = await fetch(`${API_BASE}/client/checkout/place_order.php`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (err) {
        throw new Error('Invalid server response');
      }

      if (data.status === 'success') {
        setCreatedOrderId(data.order_id || null);
        setShowSuccessModal(true);
        setSubmitting(false);
        return;
      }

      setSubmitError(data.message || 'Order failed. Please try again.');
      setSubmitting(false);
    } catch (err) {
      setSubmitError('Unable to place order. Please try again.');
      setSubmitting(false);
    }
  };

  if (!items.length) {
    return (
      <div className="content-area fade-in-up checkout-page">
        <div className="page-header-dashboard">
          <div className="page-header-info">
            <h1 className="page-title">Checkout</h1>
            <p className="page-subtitle">No items selected for checkout.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="content-area fade-in-up checkout-page">
      <div className="page-header-dashboard">
        <div className="page-header-info">
          <h1 className="page-title">Checkout</h1>
          <p className="page-subtitle">Complete your rental booking</p>
        </div>
      </div>

      <div className="checkout-layout">
        <div className="checkout-main">
          {/* Receipt / Order Reference card */}
          <div className="checkout-card receipt-card">
            <div className="receipt-header">
              <div className="receipt-info">
                <span className="receipt-label">Order Reference</span>
                <span className="receipt-id">{orderRef}</span>
              </div>
            </div>
            <div className="receipt-status">
              <span className="status-badge pending">Pending Confirmation</span>
            </div>
          </div>

          {/* Customer Information card (data still static placeholder for now) */}
          <div className="checkout-card">
            <div className="card-header">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              <h2>Customer Information</h2>
            </div>
            <div className="customer-details">
              <div className="detail-row">
                <span className="detail-label">Full Name</span>
                <span className="detail-value">{/* TODO: bind real name */}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Email</span>
                <span className="detail-value">{/* TODO: bind real email */}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Phone</span>
                <span className="detail-value">{/* TODO: bind real phone */}</span>
              </div>
            </div>
          </div>

          {/* Delivery Options card */}
          <div className="checkout-card">
            <div className="card-header">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="1" y="3" width="15" height="13" />
                <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
                <circle cx="5.5" cy="18.5" r="2.5" />
                <circle cx="18.5" cy="18.5" r="2.5" />
              </svg>
              <h2>Delivery Options</h2>
            </div>
            <div className="delivery-options">
              <label className={`delivery-option${deliveryType === 'standard' ? ' selected' : ''}`}>
                <input
                  type="radio"
                  name="delivery"
                  value="standard"
                  checked={deliveryType === 'standard'}
                  onChange={() => handleDeliveryChange('standard', 150)}
                />
                <div className="option-content">
                  <div className="option-info">
                    <span className="option-name">Standard Delivery</span>
                  </div>
                  <span className="option-price">₱150</span>
                </div>
              </label>

              <label className={`delivery-option${deliveryType === 'express' ? ' selected' : ''}`}>
                <input
                  type="radio"
                  name="delivery"
                  value="express"
                  checked={deliveryType === 'express'}
                  onChange={() => handleDeliveryChange('express', 300)}
                />
                <div className="option-content">
                  <div className="option-info">
                    <span className="option-name">Express Delivery</span>
                  </div>
                  <span className="option-price">₱300</span>
                </div>
              </label>

              <div className="delivery-option coming-soon" aria-disabled="true">
                <div className="option-content">
                  <div className="option-info">
                    <span className="option-name">Store Pickup</span>
                    <span className="option-coming-soon">Coming Soon</span>
                  </div>
                  <span className="option-price option-price-muted">Free</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <aside className="checkout-sidebar">
          {/* Order Items card */}
          <div className="checkout-card">
            <div className="card-header">
              <h2>Order Items</h2>
              <span className="item-count">
                {items.length}
                {' '}
                Items
              </span>
            </div>
            <div className="order-items">
              {items.map((item) => {
                const days = Number(item.days || 0) || 1;
                const price = Number(item.price || 0);
                const lineTotal = price * days;

                return (
                  <div key={item.id} className="order-item">
                    <div className="order-item-details">
                      <h4 className="order-item-name">{item.name}</h4>
                      <div className="order-item-rental">
                        <span>
                          {days}
                          {' '}
                          {days > 1 ? 'days rental' : 'day rental'}
                        </span>
                      </div>
                    </div>
                    <div className="order-item-pricing">
                      <span className="item-rate">
                        ₱
                        {price.toLocaleString()}
                        {' '}
                        / day
                      </span>
                      <span className="item-subtotal">
                        ₱
                        {lineTotal.toLocaleString()}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Order Summary + Payment card */}
          <div className="checkout-card order-summary-card">
            <div className="summary-breakdown">
              <div className="summary-row">
                <span>Subtotal</span>
                <span>
                  ₱
                  {subtotal.toLocaleString()}
                </span>
              </div>
              <div className="summary-row">
                <span>Delivery Fee</span>
                <span>
                  ₱
                  {deliveryFee.toLocaleString()}
                </span>
              </div>
              <div className="summary-row">
                <span>Service Fee</span>
                <span>
                  ₱
                  {SERVICE_FEE.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="summary-total">
              <span>Total</span>
              <span className="total-amount">
                ₱
                {grandTotal.toLocaleString()}
              </span>
            </div>

            <div className="payment-section">
              <h3>Payment Method</h3>
              <div className="payment-options">
                <label className={`payment-option${paymentMethod === 'cod' ? ' selected' : ''}`}>
                  <input
                    type="radio"
                    name="payment"
                    value="cod"
                    checked={paymentMethod === 'cod'}
                    onChange={() => setPaymentMethod('cod')}
                  />
                  <div className="payment-content">
                    <span>Cash on Delivery</span>
                  </div>
                </label>

                <div className="payment-option coming-soon" aria-disabled="true">
                  <div className="payment-content">
                    <span>GCash</span>
                    <span className="option-coming-soon">Coming Soon</span>
                  </div>
                </div>

                <div className="payment-option coming-soon" aria-disabled="true">
                  <div className="payment-content">
                    <span>Bank Transfer</span>
                    <span className="option-coming-soon">Coming Soon</span>
                  </div>
                </div>
              </div>
            </div>

            {submitError && (
              <p className="cart-error" style={{ marginTop: '8px' }}>
                {submitError}
              </p>
            )}

            <form onSubmit={handleSubmit}>
              <button
                className="btn-confirm-order"
                type="submit"
                disabled={submitting}
              >
                {submitting ? 'Processing...' : 'Confirm Order'}
              </button>
            </form>

            <p className="terms-note">
              By confirming, you agree to our
              {' '}
              <a href="/pages/terms.html">Terms of Service</a>
              {' '}
              and
              {' '}
              <a href="/pages/privacy.html">Privacy Policy</a>
              .
            </p>
          </div>

          <a href="/client/cart" className="btn-back-cart">
            <span>← Back to Cart</span>
          </a>
        </aside>
      </div>

      {showSuccessModal && (
        <div className="checkout-success-backdrop" role="presentation">
          <div
            className="checkout-success-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="checkout-success-title"
          >
            <div className="checkout-success-icon-wrapper">
              <div className="checkout-success-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M9 12l2 2 4-4" />
                </svg>
              </div>
            </div>
            <h2 id="checkout-success-title" className="checkout-success-title">Order Confirmed!</h2>
            <p className="checkout-success-text">
              Your Order ID is:
              {' '}
              <strong>{createdOrderId}</strong>
            </p>
            <button
              type="button"
              className="btn-confirm-order checkout-success-button"
              onClick={() => {
                setShowSuccessModal(false);
                navigate('/client/myrentals');
              }}
            >
              View My Rentals
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ClientCheckoutPage;
