import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './css/ClientCartPage.css';

const API_BASE = import.meta.env.DEV ? '/api/rent-it' : '/rent-it';
const PUBLIC_BASE = '/rent-it';

const DELIVERY_FEE = 150;
const SERVICE_FEE = 50;
const STORAGE_KEY = 'rentit_cart';

const ClientCartPage = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;

    fetch(`${API_BASE}/client/cart/cart.php?format=json`, { credentials: 'include' })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load cart');
        return res.json();
      })
      .then((data) => {
        if (!mounted) return;
        const rows = Array.isArray(data?.items) ? data.items : [];

        const enhanced = rows.map((row) => {
          const startDate = row.start_date || new Date().toISOString().slice(0, 10);
          const endDate =
            row.end_date
            || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

          // Prefer backend-computed days/itemSubtotal if present, fallback to client calc
          let days = typeof row.days === 'number' && row.days > 0 ? row.days : null;
          let itemSubtotal =
            typeof row.itemSubtotal === 'number' && row.itemSubtotal >= 0
              ? row.itemSubtotal
              : null;

          if (days === null || itemSubtotal === null) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            const diffTime = Math.abs(end - start);
            days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
            const price = Number(row.price_per_day || 0);
            itemSubtotal = price * days;
          }

          return {
            ...row,
            startDate,
            endDate,
            days,
            itemSubtotal,
            selected: false,
          };
        });

        setItems(enhanced);
        setLoading(false);
      })
      .catch((err) => {
        if (!mounted) return;
        // eslint-disable-next-line no-console
        console.error(err);
        setError('Unable to load cart.');
        setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const hasItems = items.length > 0;

  const { subtotal, selectedCount } = useMemo(() => {
    let sum = 0;
    let count = 0;
    items.forEach((item) => {
      if (item.selected) {
        sum += Number(item.itemSubtotal || 0);
        count += 1;
      }
    });
    return { subtotal: sum, selectedCount: count };
  }, [items]);

  const grandTotal =
    selectedCount > 0 ? subtotal + DELIVERY_FEE + SERVICE_FEE : 0;

  const allSelected = hasItems && items.every((item) => item.selected);

  const toggleSelectAll = () => {
    const next = !allSelected;
    setItems((prev) => prev.map((item) => ({ ...item, selected: next })));
  };

  const toggleItemSelected = (id) => {
    setItems((prev) => prev.map((item) => (
      Number(item.cart_row_id) === Number(id)
        ? { ...item, selected: !item.selected }
        : item
    )));
  };

  const updateItemDates = async (id, field, value) => {
    setItems((prev) => {
      const next = prev.map((item) => {
        if (Number(item.cart_row_id) !== Number(id)) return item;

        const updated = {
          ...item,
          [field]: value,
        };

        const start = new Date(updated.startDate);
        const end = new Date(updated.endDate);

        if (end < start) {
          // keep previous end if invalid
          return item;
        }

        const diffTime = Math.abs(end - start);
        const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
        const price = Number(updated.price_per_day || 0);
        const itemSubtotal = price * days;

        return {
          ...updated,
          days,
          itemSubtotal,
        };
      });

      return next;
    });

    try {
      const updatedItem = items.find((item) => Number(item.cart_row_id) === Number(id));
      const formData = new URLSearchParams();
      formData.append('cart_id', String(id));
      formData.append('start_date', field === 'startDate' ? value : updatedItem?.startDate || '');
      formData.append('end_date', field === 'endDate' ? value : updatedItem?.endDate || '');

      await fetch(`${API_BASE}/client/cart/update_cart.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData,
        credentials: 'include',
      });
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('Failed to update cart dates', e);
    }
  };

  const handleRemoveSelected = async () => {
    const ids = items.filter((i) => i.selected).map((i) => i.cart_row_id);
    if (!ids.length) return;

    try {
      const formData = new URLSearchParams();
      formData.append('delete_ids', JSON.stringify(ids));

      const res = await fetch(`${API_BASE}/client/cart/delete_to_cart.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData,
        credentials: 'include',
      });

      let data = null;
      try {
        data = await res.json();
      } catch (e) {
        // ignore JSON parse errors
      }

      if (!res.ok || (data && data.success === false)) {
        // eslint-disable-next-line no-console
        console.error('Delete cart items failed', data || {});
        return;
      }

      setItems((prev) => prev.filter((item) => !ids.includes(item.cart_row_id)));
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('Delete cart items error', e);
    }
  };

  const handleCheckout = () => {
    const selectedItems = items.filter((i) => i.selected);
    if (!selectedItems.length) return;

    const selectedIds = selectedItems.map((i) => i.cart_row_id);
    const selectedData = selectedItems.map((i) => ({
      id: i.cart_row_id,
      name: i.item_name,
      price: Number(i.price_per_day || 0),
      days: i.days,
      startDate: i.startDate,
      endDate: i.endDate,
    }));

    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(selectedData));
    } catch (e) {
      // ignore storage errors
    }

    navigate('/client/checkout');
  };

  const hasSelection = selectedCount > 0;

  return (
    <div className="content-area fade-in-up cart-page">
      <div className="page-header-dashboard">
        <div className="page-header-info">
          <h1 className="page-title">Review and complete your rental booking.</h1>
          {error && <p className="cart-error">{error}</p>}
        </div>
      </div>

      <div className="cart-layout-vertical">
        <section className="cart-items-section">
          {loading && <p style={{ opacity: 0.7 }}>Loading cart...</p>}

          {!loading && hasItems && (
            <>
              <div className="cart-actions-bar">
                <div className="select-all-wrap">
                  <input
                    id="selectAll"
                    type="checkbox"
                    className="cart-checkbox"
                    checked={allSelected}
                    onChange={toggleSelectAll}
                  />
                  <label htmlFor="selectAll">Select All</label>
                </div>
                <button
                  type="button"
                  className={`btn-remove-selected${hasSelection ? ' active' : ''}`}
                  disabled={!hasSelection}
                  onClick={handleRemoveSelected}
                >
                  <span>
                    {hasSelection
                      ? `Remove Selected (${selectedCount})`
                      : 'Remove Selected'}
                  </span>
                </button>
              </div>

              <div id="cartItemsList">
                {items.map((row) => {
                  const id = row.cart_row_id;
                  const imageSrc = row.image
                    ? `${PUBLIC_BASE}/assets/images/items/${row.image}`
                    : `${PUBLIC_BASE}/assets/images/catalog-fallback.svg`;

                  return (
                    <article
                      key={id}
                      id={`card-${id}`}
                      className={`cart-item-card${row.selected ? ' selected' : ''}`}
                      data-id={id}
                      data-price={row.price_per_day}
                    >
                      <div className="cart-item-select">
                        <input
                          type="checkbox"
                          className="cart-checkbox item-checkbox"
                          data-id={id}
                          checked={row.selected}
                          onChange={() => toggleItemSelected(id)}
                        />
                      </div>

                      <div className="cart-item-details">
                        <div className="cart-item-product">
                          <div className="cart-item-image">
                            <img
                              src={imageSrc}
                              alt={row.item_name}
                              className="cart-item-photo"
                              onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = `${PUBLIC_BASE}/assets/images/catalog-fallback.svg`;
                              }}
                            />
                          </div>

                          <div className="cart-item-main-text">
                            <div className="cart-item-top-row">
                              <div className="cart-item-info">
                                <h3 className="cart-item-name">{row.item_name}</h3>
                                <span className="cart-item-category">{row.category}</span>
                              </div>
                              <div className="cart-item-price-wrap">
                                <span className="cart-item-price">
                                  ₱
                                  {Number(row.price_per_day || 0).toLocaleString()}
                                  <span>/day</span>
                                </span>
                              </div>
                            </div>

                            <div className="cart-item-rental-period">
                              <div className="rental-dates-row">
                                <div className="date-picker-group">
                                  <label htmlFor={`start-${id}`}>Start Date</label>
                                  <input
                                    id={`start-${id}`}
                                    type="date"
                                    className="cart-date-input start-date"
                                    value={row.startDate}
                                    onChange={(e) => updateItemDates(id, 'startDate', e.target.value)}
                                  />
                                </div>
                                <span className="date-arrow">→</span>
                                <div className="date-picker-group">
                                  <label htmlFor={`end-${id}`}>End Date</label>
                                  <input
                                    id={`end-${id}`}
                                    type="date"
                                    className="cart-date-input end-date"
                                    value={row.endDate}
                                    onChange={(e) => updateItemDates(id, 'endDate', e.target.value)}
                                  />
                                </div>
                              </div>
                              <div className="rental-summary">
                                <span className="days-count" id={`days-${id}`}>
                                  {row.days}
                                  {' '}
                                  {row.days > 1 ? 'days' : 'day'}
                                </span>
                                <span className="cart-item-subtotal" id={`subtotal-${id}`}>
                                  ₱
                                  {Number(row.itemSubtotal || 0).toLocaleString()}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </>
          )}

          {!loading && !hasItems && (
            <div className="empty-cart">
              <div className="empty-icon">🛒</div>
              <h2 className="empty-title">Your cart is empty</h2>
              <p className="empty-text">Browse the catalog and add items to your cart.</p>
            </div>
          )}
        </section>

        <aside className="cart-summary-bottom">
          <h2 className="summary-title">Order Summary</h2>
          <div className="summary-rows">
            <div className="summary-row">
              <span>Subtotal</span>
              <span id="cartSubtotal">
                ₱
                {subtotal.toLocaleString()}
              </span>
            </div>
            <div className="summary-row">
              <span>Delivery Fee</span>
              <span>
                ₱
                {DELIVERY_FEE.toLocaleString()}
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
          <div className="summary-divider" />
          <div className="summary-row summary-total">
            <strong>Total</strong>
            <strong id="cartTotal">
              ₱
              {grandTotal.toLocaleString()}
            </strong>
          </div>
          <button
            className="btn-checkout-full"
            id="btnCheckout"
            type="button"
            disabled={!hasSelection}
            onClick={handleCheckout}
          >
            Proceed to Checkout
          </button>
        </aside>
      </div>
    </div>
  );
};

export default ClientCartPage;
