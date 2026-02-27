import React, { useContext, useEffect, useMemo, useState } from 'react';
import { SidebarContext } from './ClientShellLayout';
import './css/ClientCatalogPage.css';


const API_BASE = import.meta.env.DEV ? '/api/rent-it' : '/rent-it';

const PUBLIC_BASE = '/rent-it';

const ClientCatalogPage = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Product details modal state
  const [selectedItem, setSelectedItem] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Rent quantity modal state (React version of legacy PHP rent-qty modal)
  const [isQtyModalOpen, setIsQtyModalOpen] = useState(false);
  const [qtyItem, setQtyItem] = useState(null);
  const [qtyValue, setQtyValue] = useState(1);
  const [qtyMax, setQtyMax] = useState(1);
  const [qtySubmitting, setQtySubmitting] = useState(false);
  const [qtyError, setQtyError] = useState('');

  // Lightweight toast for modal cart success (bottom-right)
  const [toast, setToast] = useState({ visible: false, message: '' });
  // Track which items are favorited in this React catalog view
  const [favoriteItemIds, setFavoriteItemIds] = useState(new Set());

  // Client-side pagination: 10 when sidebar expanded, 12 when collapsed (more space)
  const { sidebarCollapsed } = useContext(SidebarContext);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = sidebarCollapsed ? 12 : 10;

  // Filter state (React implementation of legacy catalog.js behavior)
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]); // ['portable','premium','professional']
  const [selectedStatuses, setSelectedStatuses] = useState([]); // ['available','booked','maintenance']
  const [maxPrice, setMaxPrice] = useState(10000);

  // Calendar state (React-only, mirrors behavior from catalog.js at a high level)
  const [currentDate, setCurrentDate] = useState(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  });
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [selectingStart, setSelectingStart] = useState(true);
  // Track which items are booked in the selected date range (from admin calendar API)
  const [bookedItemIds, setBookedItemIds] = useState(new Set());

  const openQtyModal = (item) => {
    if (!item) return;

    const availableUnits = Number(item.available_units || 0);
    const safeMax = Number.isFinite(availableUnits) && availableUnits > 0 ? availableUnits : 1;

    setQtyItem(item);
    setQtyValue(1);
    setQtyMax(safeMax);
    setQtyError('');
    setIsQtyModalOpen(true);
  };

  const closeQtyModal = () => {
    if (qtySubmitting) return;
    setIsQtyModalOpen(false);
    setQtyItem(null);
    setQtyValue(1);
    setQtyError('');
  };

  useEffect(() => {
    let isMounted = true;

    fetch(`${API_BASE}/client/catalog/catalog.php?format=json`, {
      credentials: 'include',
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error('Failed to load catalog data');
        }
        return res.json();
      })
      .then((data) => {
        if (!isMounted) return;
        const rows = Array.isArray(data?.items) ? data.items : Array.isArray(data) ? data : [];

        // Normalize item fields we care about for filtering
        const normalized = rows.map((item) => ({
          ...item,
          item_name: item.item_name || item.name || '',
          category: (item.category || '').toLowerCase(),
          status: (item.status || 'available').toLowerCase(),
          price_per_day: Number(item.price_per_day || 0),
          description: item.description || '',
        }));

        setItems(normalized);
        setLoading(false);
      })
      .catch((err) => {
        if (!isMounted) return;
        // eslint-disable-next-line no-console
        console.error(err);
        setError('Unable to load catalog data.');
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Preload current user's favorites so the modal button reflects saved state
  useEffect(() => {
    let isMounted = true;

    fetch(`${API_BASE}/client/favorites/favorites.php?format=json`, {
      credentials: 'include',
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error('Failed to load favorites for catalog');
        }
        return res.json();
      })
      .then((data) => {
        if (!isMounted) return;

        const items = Array.isArray(data?.favorites)
          ? data.favorites
          : Array.isArray(data)
            ? data
            : [];

        const ids = new Set(
          items
            .map((fav) => Number(fav.item_id || fav.id))
            .filter((id) => Number.isFinite(id)),
        );

        setFavoriteItemIds(ids);
      })
      .catch((err) => {
        // eslint-disable-next-line no-console
        console.error('Catalog favorites preload error:', err);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // ===== Derived filtered items =====
  const filteredItems = useMemo(() => {
    if (!Array.isArray(items)) return [];

    return items.filter((item) => {
      const name = (item.item_name || '').toLowerCase();
      const desc = (item.description || '').toLowerCase();
      const query = searchQuery.trim().toLowerCase();

      // Search by name + description
      if (query && !name.includes(query) && !desc.includes(query)) {
        return false;
      }

      // Category filter (if any category is selected)
      if (selectedCategories.length > 0) {
        if (!selectedCategories.includes((item.category || '').toLowerCase())) {
          return false;
        }
      }

      // Status filter (if any status is selected)
      if (selectedStatuses.length > 0) {
        if (!selectedStatuses.includes((item.status || '').toLowerCase())) {
          return false;
        }
      }

      // Price filter
      if (Number(item.price_per_day || 0) > maxPrice) {
        return false;
      }

      return true;
    });
  }, [items, searchQuery, selectedCategories, selectedStatuses, maxPrice, bookedItemIds]);

  // ===== Pagination helpers =====

  const totalPages = useMemo(() => (
    filteredItems.length > 0 ? Math.ceil(filteredItems.length / ITEMS_PER_PAGE) : 1
  ), [filteredItems.length, ITEMS_PER_PAGE]);

  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredItems.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredItems, currentPage, ITEMS_PER_PAGE]);

  // Keep current page valid when items-per-page or total pages change (e.g. sidebar toggle)
  useEffect(() => {
    setCurrentPage((p) => Math.min(Math.max(1, p), totalPages));
  }, [ITEMS_PER_PAGE, totalPages]);

  // ===== Availability integration with existing admin calendar API =====

  useEffect(() => {
    // Only fetch when both dates are selected
    if (!startDate || !endDate) {
      // When the user clears dates, also clear any booked IDs filter
      // eslint-disable-next-line no-console
      console.debug('Availability: dates cleared, resetting bookedItemIds');
      setBookedItemIds(new Set());
      return;
    }

    const toISO = (d) => {
      const copy = new Date(d);
      copy.setHours(0, 0, 0, 0);
      return copy.toISOString().slice(0, 10);
    };

    const start = toISO(startDate);
    const end = toISO(endDate);

    // eslint-disable-next-line no-console
    console.debug('Availability: fetching calendar data', { start, end });

    // Use existing admin calendar API to derive which items are booked
    const controller = new AbortController();

    fetch(`${API_BASE}/admin/api/get_calendar.php?start=${start}&end=${end}`, {
      credentials: 'include',
      signal: controller.signal,
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error('Failed to load availability data');
        }
        return res.json();
      })
      .then((data) => {
        // Expect shape similar to admin calendar API: { bookings: [...], ... }
        const rawBookings = Array.isArray(data?.bookings)
          ? data.bookings
          : Array.isArray(data)
            ? data
            : [];

        const bookedIds = new Set();
        rawBookings.forEach((booking) => {
          const itemId = booking.item_id || booking.itemId;
          if (itemId != null) {
            bookedIds.add(Number(itemId));
          }
        });

        // eslint-disable-next-line no-console
        console.debug('Availability: calendar response', {
          bookingsCount: rawBookings.length,
          bookedItemIds: Array.from(bookedIds),
        });

        setBookedItemIds(bookedIds);
      })
      .catch((err) => {
        // Fail silently for availability so catalog still works even if admin API is unreachable
        // eslint-disable-next-line no-console
        console.error('Availability fetch error:', err);
        setBookedItemIds(new Set());
      });

    return () => {
      controller.abort();
    };
  }, [startDate, endDate]);

  // ===== Calendar helpers (React implementation) =====
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const shortMonthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const formatDisplayDate = (date) => {
    if (!date) return '';
    return `${shortMonthNames[date.getMonth()]} ${String(date.getDate()).padStart(2, '0')}, ${date.getFullYear()}`;
  };

  const handleQtyDecrease = () => {
    setQtyValue((prev) => Math.max(1, prev - 1));
  };

  const handleQtyIncrease = () => {
    setQtyValue((prev) => Math.min(qtyMax || 1, prev + 1));
  };

  const handleQtyChange = (e) => {
    const raw = Number(e.target.value || 1);
    if (!Number.isFinite(raw)) return;
    const clamped = Math.min(Math.max(1, raw), qtyMax || 1);
    setQtyValue(clamped);
  };

  const handleQtyConfirm = async () => {
    if (!qtyItem || qtySubmitting) return;

    const itemId = qtyItem.item_id || qtyItem.id;
    if (!itemId) return;

    const quantity = Math.min(Math.max(1, qtyValue || 1), qtyMax || 1);

    setQtySubmitting(true);
    setQtyError('');

    try {
      const formData = new URLSearchParams();
      formData.append('item_id', String(itemId));
      formData.append('quantity', String(quantity));

      const res = await fetch(`${API_BASE}/client/cart/add_to_cart.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData,
        credentials: 'include',
      });

      let data = null;
      try {
        data = await res.json();
      } catch (e) {
        // ignore JSON parse errors if endpoint returns plain text
      }

      const ok = data && typeof data.success !== 'undefined' ? data.success : res.ok;
      if (!ok) {
        setQtyError('Unable to add to cart. Please try again.');
        return;
      }

      closeQtyModal();
      setToast({
        visible: true,
        message: 'Item added to cart.',
      });

      setTimeout(() => {
        setToast((prev) => ({ ...prev, visible: false }));
      }, 2500);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('Add to cart (quantity modal) failed', e);
      setQtyError('Unable to add to cart. Please try again.');
    } finally {
      setQtySubmitting(false);
    }
  };

  const today = useMemo(() => {
    const t = new Date();
    t.setHours(0, 0, 0, 0);
    return t;
  }, []);

  const isSameDay = (a, b) => {
    if (!a || !b) return false;
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  };

  const isInRange = (dayDate) => {
    if (!startDate || !endDate) return false;
    return dayDate > startDate && dayDate < endDate;
  };

  const calendarGrid = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const cells = [];

    for (let i = 0; i < firstDay; i += 1) {
      cells.push({ type: 'empty' });
    }

    for (let day = 1; day <= daysInMonth; day += 1) {
      const cellDate = new Date(year, month, day);
      cellDate.setHours(0, 0, 0, 0);

      const disabled = cellDate < today;
      const isStart = isSameDay(cellDate, startDate);
      const isEnd = isSameDay(cellDate, endDate);
      const inRange = isInRange(cellDate);

      cells.push({
        type: 'day',
        date: cellDate,
        label: day,
        today: isSameDay(cellDate, today),
        disabled,
        isStart,
        isEnd,
        inRange,
      });
    }

    return cells;
  }, [currentDate, startDate, endDate, today]);

  const handlePrevMonth = () => {
    setCurrentDate((prev) => {
      const d = new Date(prev);
      d.setMonth(d.getMonth() - 1);
      return d;
    });
  };

  const handleNextMonth = () => {
    setCurrentDate((prev) => {
      const d = new Date(prev);
      d.setMonth(d.getMonth() + 1);
      return d;
    });
  };

  const handleDayClick = (date) => {
    if (!date || date < today) return;

    if (selectingStart || !startDate) {
      setStartDate(date);
      setEndDate(null);
      setSelectingStart(false);
    } else {
      if (date < startDate) {
        setEndDate(startDate);
        setStartDate(date);
      } else {
        setEndDate(date);
      }
      setSelectingStart(true);
    }
  };

  const handleClearDates = () => {
    setStartDate(null);
    setEndDate(null);
    setSelectingStart(true);
    setBookedItemIds(new Set());
  };

  // ===== Filter handlers =====
  const handleCategoryChange = (value) => {
    setSelectedCategories((prev) => (
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    ));
  };

  const handleStatusChange = (value) => {
    setSelectedStatuses((prev) => (
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    ));
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategories([]);
    setSelectedStatuses([]);
    setMaxPrice(10000);
    handleClearDates();
  };

  // ===== Product modal handlers =====
  const openProductModal = (item) => {
    setSelectedItem(item || null);
    setIsModalOpen(true);
  };

  const closeProductModal = () => {
    setIsModalOpen(false);
    setSelectedItem(null);
  };

  // ===== Modal action handlers (Add to Cart / Favorites) =====

  const handleModalAddToCart = async () => {
    if (!selectedItem) return;

    const productId = selectedItem.id || selectedItem.item_id;
    if (!productId) return;
    const productName = selectedItem.item_name || 'Item';

    // If this item is booked in the currently selected date range, block renting in React
    if (bookedItemIds.size > 0 && bookedItemIds.has(Number(productId))) {
      setToast({ visible: true, message: `${productName} is not available for the selected dates` });
      setTimeout(() => {
        setToast((current) => (current.visible ? { ...current, visible: false } : current));
      }, 3000);
      return;
    }

    try {
      // Call backend via Vite dev proxy or direct /rent-it in production
      await fetch(`${API_BASE}/client/cart/add_to_cart.php`, {
        method: 'POST',
        credentials: 'include',
        body: new URLSearchParams({ item_id: String(productId) }),
      });

      // Update button label briefly (visual feedback on the button itself)
      const cartBtn = document.getElementById('modalCartBtn');
      if (cartBtn) {
        const original = cartBtn.innerHTML;
        cartBtn.innerHTML = `
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:20px;height:20px;">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          Added to Cart
        `;
        setTimeout(() => {
          cartBtn.innerHTML = original;
        }, 2000);
      }

      // Always use local React toast (pill style) for cart actions
      setToast({ visible: true, message: `${productName} added to cart` });
      setTimeout(() => {
        setToast((current) => (current.visible ? { ...current, visible: false } : current));
      }, 3000);
    } catch (err) {
      // Silent fail with console log only so UI does not break
      // eslint-disable-next-line no-console
      console.error('Modal add to cart error:', err);
    }
  };

  const handleModalToggleFavorite = async () => {
    if (!selectedItem) return;

    const productId = selectedItem.id || selectedItem.item_id;
    if (!productId) return;
    const numericId = Number(productId);
    const productName = selectedItem.item_name || 'Item';

    const wasFavorited = favoriteItemIds.has(numericId);
    const willBeFavorited = !wasFavorited;

    // Optimistically update local favorite state for this item only
    setFavoriteItemIds((prev) => {
      const next = new Set(prev);
      if (willBeFavorited) {
        next.add(numericId);
      } else {
        next.delete(numericId);
      }
      return next;
    });

    try {
      const response = await fetch(`${API_BASE}/client/catalog/add_favorite.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          item_id: String(productId),
          action: willBeFavorited ? 'add' : 'remove',
        }),
      });

      let data = null;
      try {
        data = await response.json();
      } catch (e) {
        // ignore JSON parse errors if endpoint returns plain text
      }

      const ok = data && typeof data.success !== 'undefined' ? data.success : response.ok;
      const message = ok
        ? willBeFavorited
          ? `${productName} added to favorites`
          : `${productName} removed from favorites`
        : 'Favorite action failed';

      // Use same local React toast styling for favorites as for cart
      setToast({ visible: true, message });
      setTimeout(() => {
        setToast((current) => (current.visible ? { ...current, visible: false } : current));
      }, 3000);

      // If the server rejected the change, revert local state
      if (!ok) {
        setFavoriteItemIds((prev) => {
          const next = new Set(prev);
          if (wasFavorited) {
            next.add(numericId);
          } else {
            next.delete(numericId);
          }
          return next;
        });
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Modal favorite error:', err);
      // Revert optimistic update on error
      setFavoriteItemIds((prev) => {
        const next = new Set(prev);
        if (wasFavorited) {
          next.add(numericId);
        } else {
          next.delete(numericId);
        }
        return next;
      });
    }
  };

  // For the modal favorite button: compute if current selected item is favorited
  const modalProductId = selectedItem?.item_id || selectedItem?.id;
  const modalIsFavorited = modalProductId != null
    ? favoriteItemIds.has(Number(modalProductId))
    : false;

  return (
    <div className="content-area fade-in-up catalog-page-inner">
      {/* Page header */}
      <div className="page-header-dashboard">
        <div className="page-header-info">
          <h1 className="page-title">Discover our videoke and karaoke equipment for rent.</h1>
        </div>
        <div className="page-header-actions">
          <div className="catalog-search-wrap">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              id="catalogSearch"
              className="catalog-search"
              placeholder="Search machine models..."
              title="Search for karaoke machine models"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="rentals-tabs">
        <button className="tab-link active" data-tab="all" title="View all catalog items">
          Catalog
        </button>
        <button className="tab-link" data-tab="promos" title="View promotional items">
          Top Promos
        </button>
      </div>

      {/* Layout: filters + products section, mirroring PHP structure */}
      <div className="catalog-container">
        {/* Filter sidebar */}
        <aside className="filter-sidebar">
          <div className="filter-header">
            <div className="filter-header-info">
              <h2 className="filter-title">Filters</h2>
              <p className="filter-subtitle">Find the perfect machine</p>
            </div>
            <button
              className="reset-filters"
              type="button"
              title="Reset all filters to default"
              onClick={handleResetFilters}
            >
              Reset All
            </button>
          </div>

          <div className="filter-card">
            <h3 className="filter-card-title">
              <svg className="filter-card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
              </svg>
              Category
            </h3>
            <div className="category-list">
              <label className="category-item">
                <input
                  type="checkbox"
                  className="category-checkbox"
                  value="portable"
                  title="Filter by portable machines"
                  checked={selectedCategories.includes('portable')}
                  onChange={() => handleCategoryChange('portable')}
                />
                <span className="category-color portable" />
                <span className="category-label">Portable</span>
              </label>
              <label className="category-item">
                <input
                  type="checkbox"
                  className="category-checkbox"
                  value="premium"
                  title="Filter by premium machines"
                  checked={selectedCategories.includes('premium')}
                  onChange={() => handleCategoryChange('premium')}
                />
                <span className="category-color premium" />
                <span className="category-label">Premium</span>
              </label>
              <label className="category-item">
                <input
                  type="checkbox"
                  className="category-checkbox"
                  value="professional"
                  title="Filter by professional machines"
                  checked={selectedCategories.includes('professional')}
                  onChange={() => handleCategoryChange('professional')}
                />
                <span className="category-color professional" />
                <span className="category-label">Professional</span>
              </label>
            </div>
          </div>

          {/* Status Filter */}
          <div className="filter-card">
            <h3 className="filter-card-title">
              <svg className="filter-card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 6v6l4 2" />
              </svg>
              Availability Status
            </h3>
            <div className="status-list">
              <label className="status-item">
                <input
                  type="checkbox"
                  className="status-checkbox"
                  value="available"
                  title="Show only available machines"
                  checked={selectedStatuses.includes('available')}
                  onChange={() => handleStatusChange('available')}
                />
                <span className="status-label">
                  <span className="status-indicator available" />
                  Available Now
                </span>
              </label>
              <label className="status-item">
                <input
                  type="checkbox"
                  className="status-checkbox"
                  value="booked"
                  title="Show only booked machines"
                  checked={selectedStatuses.includes('booked')}
                  onChange={() => handleStatusChange('booked')}
                />
                <span className="status-label">
                  <span className="status-indicator booked" />
                  Booked
                </span>
              </label>
              <label className="status-item">
                <input
                  type="checkbox"
                  className="status-checkbox"
                  value="maintenance"
                  title="Show machines under maintenance"
                  checked={selectedStatuses.includes('maintenance')}
                  onChange={() => handleStatusChange('maintenance')}
                />
                <span className="status-label">
                  <span className="status-indicator maintenance" />
                  Under Maintenance
                </span>
              </label>
            </div>
          </div>

          {/* Price Range Filter */}
          <div className="filter-card">
            <h3 className="filter-card-title">
              <svg className="filter-card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="1" x2="12" y2="23" />
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
              Price Range (₱)
            </h3>
            <div className="price-range-wrap">
              <input
                type="range"
                id="priceSlider"
                className="price-slider"
                min="50"
                max="10000"
                step="50"
                title="Adjust maximum price range"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
              />
              <div className="price-labels">
                <span>₱50</span>
                <span className="price-value" id="priceValue">
                  ₱{maxPrice.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Date Availability Filter (static markup for styling) */}
          <div className="filter-card">
            <h3 className="filter-card-title">
              <svg className="filter-card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              Date Availability
            </h3>

            <div className="date-input-row">
              <div className="date-input-group">
                <label htmlFor="startDateInput" className="date-input-label">
                  Start Date
                </label>
                <input
                  type="text"
                  id="startDateInput"
                  className="date-input"
                  placeholder="Feb 01, 2026"
                  readOnly
                  title="Click to select start date"
                  value={formatDisplayDate(startDate)}
                  onClick={() => setSelectingStart(true)}
                />
              </div>
              <span className="date-input-separator">→</span>
              <div className="date-input-group">
                <label htmlFor="endDateInput" className="date-input-label">
                  End Date
                </label>
                <input
                  type="text"
                  id="endDateInput"
                  className="date-input"
                  placeholder="Feb 03, 2026"
                  readOnly
                  title="Click to select end date"
                  value={formatDisplayDate(endDate)}
                  onClick={() => {
                    if (startDate) setSelectingStart(false);
                  }}
                />
              </div>
            </div>

            <div className="calendar-header">
              <div className="calendar-nav">
                <button
                  type="button"
                  className="calendar-nav-btn"
                  title="Previous month"
                  onClick={handlePrevMonth}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="15 18 9 12 15 6" />
                  </svg>
                </button>
                <span className="calendar-month">
                  {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </span>
                <button
                  type="button"
                  className="calendar-nav-btn"
                  title="Next month"
                  onClick={handleNextMonth}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="calendar-grid">
              {/* Weekday headers */}
              <span className="calendar-day-header">S</span>
              <span className="calendar-day-header">M</span>
              <span className="calendar-day-header">T</span>
              <span className="calendar-day-header">W</span>
              <span className="calendar-day-header">T</span>
              <span className="calendar-day-header">F</span>
              <span className="calendar-day-header">S</span>
              {calendarGrid.map((cell, index) => {
                if (cell.type === 'empty') {
                  return <span key={index} className="calendar-day disabled" />;
                }

                const dayClasses = ['calendar-day'];
                if (cell.today) dayClasses.push('today');
                if (cell.disabled) dayClasses.push('disabled');
                if (cell.isStart) dayClasses.push('range-start');
                if (cell.isEnd) dayClasses.push('range-end');
                if (cell.inRange) dayClasses.push('in-range');

                return (
                  <span
                    key={index}
                    className={dayClasses.join(' ')}
                    onClick={() => handleDayClick(cell.date)}
                  >
                    {cell.label}
                  </span>
                );
              })}
            </div>

            <button
              type="button"
              className="clear-dates-btn"
              title="Clear date selection"
              onClick={handleClearDates}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
              Clear Dates
            </button>
          </div>
        </aside>

        {/* Products Section */}
        <section className="products-section">
          <div className="products-header">
            <h2 className="products-title">
              Browsing Machines
              <span className="products-count">
                ({Array.isArray(filteredItems) ? filteredItems.length : 0} models found)
              </span>
            </h2>
            <div className="products-sort">
              <span className="sort-label">Sort by:</span>
              <select className="sort-select" id="sortSelect" title="Sort products by criteria">
                <option value="popular">Most Popular</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="name">Name A-Z</option>
              </select>
            </div>
          </div>

          {loading && <p style={{ opacity: 0.7 }}>Loading catalog...</p>}

          {!loading && (
            <div className="products-grid">
              {Array.isArray(paginatedItems) && paginatedItems.length > 0 ? (
                paginatedItems.map((item) => {
                  const id = item.item_id;
                  const name = item.item_name;
                  const price = Number(item.price_per_day || 0);
                  const description =
                    item.description || 'No description available for this item.';
                  const category = item.category || 'portable';

                  const imageUrl = item.image
                    ? `${PUBLIC_BASE}/assets/images/items/${item.image}`
                    : `${PUBLIC_BASE}/assets/images/catalog-fallback.svg`;

                  const rawId = item.item_id || item.id;
                  const isUnavailableForDates =
                    bookedItemIds.size > 0 && rawId && bookedItemIds.has(Number(rawId));

                  const rawStatus = String(item.status || 'Available').trim().toLowerCase();
                  let statusClass = 'available';
                  if (rawStatus === 'booked') {
                    statusClass = 'booked';
                  } else if (
                    ['repairing', 'maintenance', 'under repair', 'under maintenance'].includes(
                      rawStatus,
                    )
                  ) {
                    statusClass = 'maintenance';
                  }
                  const statusLabel = item.status || 'Available';

                  const availableUnits = Number(item.available_units || 0);
                  const repairingUnits = Number(item.repairing_units || 0);

                  const baseCanRent =
                    availableUnits > 0 && rawStatus !== 'unavailable' && rawStatus !== 'booked';
                  const canRent = baseCanRent && !isUnavailableForDates;

                  const isFeatured = Number(item.is_featured || 0) === 1;

                  return (
                    <article
                      key={id}
                      className={`product-card${
                        isUnavailableForDates ? ' product-card-unavailable' : ''
                      }`}
                      data-id={id}
                      data-category={category}
                      data-price={price}
                      data-status={statusClass}
                      data-status-label={statusLabel}
                      data-featured={isFeatured ? 'true' : 'false'}
                      data-promo={isFeatured ? 'true' : 'false'}
                      data-available-units={availableUnits}
                      data-repairing-units={repairingUnits}
                      data-item-name={name}
                      onClick={() => openProductModal(item)}
                    >
                      <div className="product-image-wrap">
                        {isFeatured && <span className="product-featured-pill">Featured</span>}

                        <span className={`product-badge ${statusClass}`}>{statusLabel}</span>

                        {isUnavailableForDates && (
                          <div className="product-unavailable-badge">
                            Unavailable for selected dates
                          </div>
                        )}

                        <img
                          src={imageUrl}
                          alt={name}
                          className="product-image"
                          title="Open image in new tab"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src =
                              `${PUBLIC_BASE}/assets/images/catalog-fallback.svg`;
                          }}
                        />
                      </div>

                      <div className="product-content">
                        <h3 className="product-name">{name}</h3>

                        <div className="product-rating">
                          <span className="rating-score">0.0</span>
                          <span className="rating-count">(0 reviews)</span>
                        </div>

                        <div className="product-price">
                          ₱
                          {price.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                          <span>/ day</span>
                        </div>

                        <div className="product-units-row">
                          {availableUnits > 0 ? (
                            <span className="product-units-pill units-available">
                              <span className="units-dot dot-available" />
                              {availableUnits}
                              {' '}
                              available
                            </span>
                          ) : (
                            <span className="product-units-pill units-none">
                              <span className="units-dot dot-none" />
                              Not available
                            </span>
                          )}

                          {repairingUnits > 0 && (
                            <span className="product-units-pill units-repairing">
                              <span className="units-dot dot-repairing" />
                              {repairingUnits}
                              {' '}
                              repairing
                            </span>
                          )}
                        </div>

                        <p className="product-description">{description}</p>

                        <div className="product-actions">
                          <button
                            className={`product-cta-main${
                              !canRent ? ' product-cta-disabled' : ''
                            }${isUnavailableForDates ? ' btn-rent-disabled' : ''}`}
                            type="button"
                            title={
                              canRent
                                ? 'Add this item to your cart'
                                : 'This item is currently unavailable'
                            }
                            disabled={!canRent}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (canRent) {
                                openQtyModal(item);
                              }
                            }}
                          >
                            {canRent ? 'Rent Now' : 'Unavailable'}
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })
              ) : (
                <div className="catalog-empty-state">
                  <h3>No items found</h3>
                  <p>Try adjusting your filters or search query.</p>
                </div>
              )}
            </div>
          )}

          {/* Pagination (client-side, 30 items per page) */}
          <nav className="pagination" aria-label="Catalog pagination">
            <button
              className="page-btn"
              data-page="prev"
              aria-label="Previous page"
              type="button"
              onClick={() => setCurrentPage((p) => (p > 1 ? p - 1 : p))}
              disabled={currentPage === 1}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            {/* For now, only show first few pages + last, similar to static PHP layout */}
            <button
              type="button"
              className={`page-btn${currentPage === 1 ? ' active' : ''}`}
              data-page="1"
              onClick={() => setCurrentPage(1)}
            >
              1
            </button>
            {totalPages >= 2 && (
              <button
                type="button"
                className={`page-btn${currentPage === 2 ? ' active' : ''}`}
                data-page="2"
                onClick={() => setCurrentPage(2)}
              >
                2
              </button>
            )}
            {totalPages >= 3 && (
              <button
                type="button"
                className={`page-btn${currentPage === 3 ? ' active' : ''}`}
                data-page="3"
                onClick={() => setCurrentPage(3)}
              >
                3
              </button>
            )}
            {totalPages > 3 && <span className="page-ellipsis">...</span>}
            {totalPages > 3 && (
              <button
                type="button"
                className={`page-btn${currentPage === totalPages ? ' active' : ''}`}
                data-page={totalPages}
                onClick={() => setCurrentPage(totalPages)}
              >
                {totalPages}
              </button>
            )}
            <button
              className="page-btn"
              data-page="next"
              aria-label="Next page"
              type="button"
              onClick={() => setCurrentPage((p) => (p < totalPages ? p + 1 : p))}
              disabled={currentPage === totalPages}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </nav>
        </section>
      </div>

      {/* Product Details Modal */}
      <div
        className={`modal-overlay${isModalOpen ? ' active' : ''}`}
        id="productModal"
        onClick={closeProductModal}
      >
        <div
          className="modal-container product-modal"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            className="modal-close"
            id="closeProductModal"
            aria-label="Close modal"
            type="button"
            onClick={closeProductModal}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>

          <div className="modal-body product-modal-body">
            <div className="modal-product-image-section">
              <img
                src={selectedItem?.image
                  ? `${PUBLIC_BASE}/assets/images/items/${selectedItem.image}`
                  : `${PUBLIC_BASE}/assets/images/catalog-fallback.svg`}
                alt={selectedItem?.item_name || 'Catalog item image'}
                className="modal-product-image"
                id="modalProductImage"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = `${PUBLIC_BASE}/assets/images/catalog-fallback.svg`;
                }}
              />
              <span
                className={`modal-product-badge ${
                  (selectedItem?.status || 'available').toLowerCase()
                }`}
                id="modalProductBadge"
              >
                {(selectedItem?.status || 'Available')
                  .toString()
                  .charAt(0)
                  .toUpperCase() + (selectedItem?.status || 'available').toString().slice(1)}
              </span>
            </div>

            <div className="modal-product-info">
              <div className="modal-product-header">
                <h2 className="modal-product-name" id="modalProductName">
                  {selectedItem?.item_name || 'Product Name'}
                </h2>
                <div className="modal-product-price" id="modalProductPrice">
                  ₱
                  {Number(selectedItem?.price_per_day || 0).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                  {' '}
                  <span>/ day</span>
                </div>
              </div>

              <div className="modal-rating-summary">
                <div className="modal-rating-stars" id="modalRatingStars" />
                <span className="modal-rating-score" id="modalRatingScore">
                  0.0
                </span>
                <span className="modal-rating-count" id="modalRatingCount">
                  (0 reviews)
                </span>
              </div>

              <p className="modal-product-description" id="modalProductDescription">
                {selectedItem?.description || 'Product description goes here.'}
              </p>

              <div className="modal-product-tags" id="modalProductTags" />

              <div className="modal-availability-section">
                <h4 className="modal-section-title">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                  Upcoming Schedule
                </h4>
                <div className="modal-availability-list" id="modalAvailabilityList">
                  <p className="availability-empty">No upcoming bookings. Available anytime!</p>
                </div>
              </div>

              <div className="modal-reviews-section" id="modalReviewsSection">
                <div className="modal-reviews-title">
                  <div className="modal-reviews-heading">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                    <span>Customer Reviews</span>
                    <span className="modal-reviews-count" id="modalReviewsCount">
                      (0)
                    </span>
                  </div>
                  <button
                    type="button"
                    className="reviews-toggle"
                    id="toggleReviewsBtn"
                    aria-expanded="true"
                  >
                    Hide reviews
                  </button>
                </div>

                <div className="modal-reviews-list" id="modalReviewsList">
                  <div className="review-empty-state">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                    <p>No reviews yet. Be the first to share your experience!</p>
                  </div>
                </div>
              </div>

              <div className="modal-actions">
                <button
                  className={`btn-modal-favorite${modalIsFavorited ? ' active' : ''}`}
                  type="button"
                  onClick={handleModalToggleFavorite}
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill={modalIsFavorited ? 'currentColor' : 'none'}
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                  {modalIsFavorited ? 'In Favorites' : 'Add to Favorites'}
                </button>
                <button
                  className="btn-modal-cart"
                  id="modalCartBtn"
                  type="button"
                  onClick={handleModalAddToCart}
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    style={{ width: 20, height: 20 }}
                  >
                    <circle cx="9" cy="21" r="1" />
                    <circle cx="20" cy="21" r="1" />
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                  </svg>
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Rent Quantity Modal (React version of legacy PHP rent-qty modal) */}
      {isQtyModalOpen && (
        <div
          className="rent-qty-overlay"
          role="dialog"
          aria-modal="true"
          aria-hidden={!isQtyModalOpen}
          onClick={closeQtyModal}
        >
          <div
            className="rent-qty-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="rent-qty-close"
              type="button"
              aria-label="Close"
              onClick={closeQtyModal}
              disabled={qtySubmitting}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>

            <div className="rent-qty-header">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                width="28"
                height="28"
                style={{ color: 'var(--accent)' }}
              >
                <circle cx="9" cy="21" r="1" />
                <circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
              </svg>
              <h3 className="rent-qty-title">How many units do you want to rent?</h3>
              <p className="rent-qty-item-name">
                {qtyItem?.item_name || ''}
              </p>
            </div>

            <div className="rent-qty-body">
              <div className="rent-qty-controls">
                <button
                  type="button"
                  className="rent-qty-btn"
                  onClick={handleQtyDecrease}
                  disabled={qtySubmitting || qtyValue <= 1}
                >
                  -
                </button>
                <input
                  type="number"
                  className="rent-qty-input"
                  min={1}
                  max={qtyMax}
                  value={qtyValue}
                  onChange={handleQtyChange}
                />
                <button
                  type="button"
                  className="rent-qty-btn"
                  onClick={handleQtyIncrease}
                  disabled={qtySubmitting || qtyValue >= qtyMax}
                >
                  +
                </button>
              </div>
              <p className="rent-qty-available">
                Available:
                {' '}
                {qtyMax}
                {' '}
                {qtyMax === 1 ? 'unit' : 'units'}
              </p>
              {qtyError && (
                <p className="rent-qty-error">
                  {qtyError}
                </p>
              )}
            </div>

            <div
              className="rent-qty-footer"
              style={{
                display: 'flex',
                gap: '10px',
                marginTop: '20px',
              }}
            >
              <button
                type="button"
                className="rent-qty-cancel"
                onClick={closeQtyModal}
                disabled={qtySubmitting}
                style={{ flex: 1 }}
              >
                Cancel
              </button>
              <button
                type="button"
                className="rent-qty-confirm"
                onClick={handleQtyConfirm}
                disabled={qtySubmitting}
                style={{ flex: 1 }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                  <circle cx="9" cy="21" r="1" />
                  <circle cx="20" cy="21" r="1" />
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                </svg>
                {qtySubmitting ? 'Adding…' : 'Add to Cart'}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast.visible && (
        <div className="catalog-toast catalog-toast-success catalog-toast-show">
          <div className="catalog-toast-icon">✓</div>
          <div className="catalog-toast-message">{toast.message}</div>
        </div>
      )}
    </div>
  );
};

export default ClientCatalogPage;
