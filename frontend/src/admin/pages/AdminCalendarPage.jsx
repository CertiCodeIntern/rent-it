import React, { useEffect, useMemo, useState } from "react";
import api from "../api/client";
import "../styles/admin-theme.css";
import "../styles/admin-globals.css";
import "../styles/admin-components.css";
import "../calendar/calendar.css";


// Helpers shared inside component
const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const formatDateDisplay = (date) =>
  date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

const formatDateShort = (date) =>
  date.toLocaleDateString("en-US", { month: "short", day: "numeric" });

const formatDateISO = (date) => date.toISOString().split("T")[0];

// Use fixed width for asset column, flex for days, to match PHP
const getBlockColSpan = (startIdx, endIdx) => Math.max(1, endIdx - startIdx + 1);

const getCategoryType = (category) => {
  if (!category) return "equipment";
  const cat = category.toLowerCase();
  if (cat.includes("karaoke") || cat.includes("premium") || cat.includes("professional")) return "karaoke";
  if (cat.includes("speaker")) return "speaker";
  if (cat.includes("mic")) return "microphone";
  if (cat.includes("portable")) return "portable";
  if (cat.includes("accessory")) return "accessory";
  return "equipment";
};

const AdminCalendarPage = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [weekDays, setWeekDays] = useState([]);
  const [calendarData, setCalendarData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [assetTypeFilter, setAssetTypeFilter] = useState("all");

  const openModal = () => setModalOpen(true);
  const closeModal = () => setModalOpen(false);

  // Calculate Mon–Sat for the current week
  useEffect(() => {
    const monday = new Date(currentDate);
    const dayOfWeek = monday.getDay();
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // shift to Monday
    monday.setDate(monday.getDate() + diff);

    const days = [];
    for (let i = 0; i < 6; i += 1) {
      const day = new Date(monday);
      day.setDate(monday.getDate() + i);
      days.push(day);
    }
    setWeekDays(days);
  }, [currentDate]);

  // Fetch calendar data from the actual PHP endpoint
  useEffect(() => {
    if (weekDays.length !== 6) return;

    const fetchData = async () => {
      setLoading(true);
      setError("");
      try {
        const start = formatDateISO(weekDays[0]);
        const end = formatDateISO(weekDays[5]);

        // Use the same admin API client + routing as other admin pages
        const { data } = await api.get(
          `/get_calendar.php?start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}`
        );

        if (!data.success) {
          throw new Error(data.message || "Failed to load calendar data");
        }

        setCalendarData(data);
      } catch (err) {
        console.error("Failed to fetch calendar data", err);
        setError("Failed to load calendar data");
        setCalendarData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [weekDays]);

  const handlePrevWeek = () => {
    setCurrentDate((prev) => {
      const next = new Date(prev);
      next.setDate(next.getDate() - 7);
      return next;
    });
  };

  const handleNextWeek = () => {
    setCurrentDate((prev) => {
      const next = new Date(prev);
      next.setDate(next.getDate() + 7);
      return next;
    });
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const filteredItems = useMemo(() => {
    if (!calendarData?.items) return [];

    const lowerSearch = searchTerm.trim().toLowerCase();

    return calendarData.items.filter((item) => {
      const type = getCategoryType(item.category);
      if (assetTypeFilter !== "all" && type !== assetTypeFilter) return false;

      if (!lowerSearch) return true;

      const name = (item.name || "").toLowerCase();
      const idLabel = `itm-${String(item.id).padStart(3, "0")}`;
      return name.includes(lowerSearch) || idLabel.includes(lowerSearch);
    });
  }, [calendarData, searchTerm, assetTypeFilter]);

  // Render a row for each asset, always 7 columns (asset + 6 days), always show a label in each day cell
  const renderCalendarRow = (item) => {
    const { bookings = [], repairs = [] } = calendarData || {};
    const weekStart = weekDays[0];
    const weekEnd = weekDays[5];
    const cells = weekDays.map((day, dayIdx) => {
      const dateStr = formatDateISO(day);
      // Booking?
      const booking = bookings.find(
        (b) =>
          b.item_id === item.id &&
          dateStr >= b.start_date &&
          dateStr <= b.end_date
      );
      if (booking) {
        const startDate = new Date(booking.start_date);
        const endDate = new Date(booking.end_date);
        return (
          <td className="day-cell" key={`b-${dayIdx}`}>
            <div
              className="booking-block booked"
              title={`${booking.customer_name} | ${formatDateShort(startDate)} - ${formatDateShort(endDate)}`}
              onClick={() => {
                const durationDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
                const itemForBooking = calendarData.items?.find((i) => i.id === booking.item_id) || null;
                setSelectedBooking({
                  customer: booking.customer_name || "John Smith",
                  event: booking.venue || "Rental",
                  equipment: itemForBooking?.name || "Equipment",
                  durationLabel: `${formatDateShort(startDate)} - ${formatDateShort(endDate)} (${durationDays} days)`,
                  status: booking.status || booking.rental_status || "Booked",
                  total: booking.total ?? booking.total_price ?? 0,
                });
                openModal();
              }}
            >
              <span className="booking-customer">{booking.customer_name}</span>
            </div>
          </td>
        );
      }
      // Repair?
      const repair = repairs.find(
        (r) =>
          r.item_id === item.id &&
          r.status !== "completed" &&
          r.status !== "Resolved" &&
          dateStr >= r.reported_date &&
          (!r.resolved_date || dateStr <= r.resolved_date)
      );
      if (repair) {
        return (
          <td className="day-cell" key={`r-${dayIdx}`}>
            <div
              className="booking-block repair"
              title={`In Repair - ${repair.description || "Maintenance"}`}
            >
              <span className="booking-status">In Repair</span>
            </div>
          </td>
        );
      }
      // Available
      return (
        <td className="day-cell" key={`a-${dayIdx}`}>
          <div className="booking-block available" title="Available for booking">
            <span className="booking-status">Available</span>
          </div>
        </td>
      );
    });
    return (
      <tr key={item.id} data-asset={`ITEM-${item.id}`} data-type={getCategoryType(item.category)}>
        <td className="asset-cell">
          <div className="asset-info">
            <span className="asset-id">{`ITM-${String(item.id).padStart(3, "0")}`}</span>
            <span className="asset-name">{item.name}</span>
          </div>
        </td>
        {cells}
      </tr>
    );
  };

  const calendarRows = useMemo(() => {
    if (loading) {
      // Render nothing, skeleton overlay will show
      return null;
    }
    if (error) {
      return (
        <tr>
          <td colSpan={7} style={{ textAlign: "center", padding: "2rem", color: "var(--color-error)" }}>
            {error}
          </td>
        </tr>
      );
    }
    if (!calendarData || filteredItems.length === 0) {
      return (
        <tr>
          <td colSpan={7} style={{ textAlign: "center", padding: "2rem" }}>
            No items found for this view.
          </td>
        </tr>
      );
    }
    return filteredItems.map((item) => renderCalendarRow(item));
  }, [loading, error, calendarData, filteredItems, weekDays]);

  return (
    <>
      {/* Page Header */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Calendar Master View</h1>
          <p className="admin-page-subtitle">
            View all bookings, maintenance, and availability at a glance.
          </p>
        </div>
        <div className="admin-page-actions">
          <div className="filter-group">
            <div className="calendar-search">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                id="calendarSearchInput"
                className="form-input"
                placeholder="Search items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className="form-select"
              id="assetTypeFilter"
              title="Filter by asset type"
              value={assetTypeFilter}
              onChange={(e) => setAssetTypeFilter(e.target.value)}
            >
              <option value="all">All Asset Types</option>
              <option value="karaoke">Karaoke Machines</option>
              <option value="speaker">Speaker Sets</option>
              <option value="microphone">Microphones</option>
              <option value="accessory">Accessories</option>
            </select>
          </div>
          <a href="/admin/newitem/newitem.php" className="btn btn-primary" id="addNewItemBtn" title="Add a new rental item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add New Item
          </a>
        </div>
      </div>

      {/* Legend & Navigation */}
      <div className="calendar-controls animate-fadeInUp">
        <div className="calendar-legend" title="Status color legend">
          <div className="legend-item">
            <span className="legend-color booked"></span>
            <span className="legend-label">Booked</span>
          </div>
          <div className="legend-item">
            <span className="legend-color repair"></span>
            <span className="legend-label">In Repair</span>
          </div>
          <div className="legend-item">
            <span className="legend-color available"></span>
            <span className="legend-label">Available</span>
          </div>
        </div>
        <div className="calendar-nav">
          <button
            className="btn btn-ghost btn-sm"
            id="prevWeekBtn"
            title="Go to previous week"
            onClick={handlePrevWeek}
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <span className="calendar-date-range" id="dateRangeLabel">
            {weekDays.length === 6
              ? `${formatDateDisplay(weekDays[0])} - ${formatDateDisplay(weekDays[5])}`
              : "-"}
          </span>
          <button
            className="btn btn-ghost btn-sm"
            id="nextWeekBtn"
            title="Go to next week"
            onClick={handleNextWeek}
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
          <button
            className="btn btn-secondary btn-sm"
            id="todayBtn"
            title="Jump to current week"
            onClick={handleToday}
          >
            Today
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      {/* Skeleton Loader Overlay (matches PHP) */}
      {loading && (
        <div className="admin-skeleton-overlay" aria-hidden="true">
          <div className="admin-skeleton-shell">
            <aside className="admin-skeleton-sidebar">
              <div className="admin-skeleton-logo"></div>
              <div className="admin-skeleton-nav">
                <span className="admin-skeleton-pill w-70"></span>
                <span className="admin-skeleton-pill w-60"></span>
                <span className="admin-skeleton-pill w-80"></span>
                <span className="admin-skeleton-pill w-50"></span>
                <span className="admin-skeleton-pill w-70"></span>
              </div>
              <div className="admin-skeleton-user">
                <span className="admin-skeleton-circle"></span>
                <span className="admin-skeleton-line w-60" style={{ height: 12 }}></span>
              </div>
            </aside>
            <section className="admin-skeleton-main">
              <div className="admin-skeleton-topbar">
                <span className="admin-skeleton-line w-40" style={{ height: 14 }}></span>
                <span className="admin-skeleton-circle"></span>
              </div>
              <div className="admin-skeleton-card">
                <div className="admin-skeleton-row admin-skeleton-kpis">
                  <span className="admin-skeleton-block w-60" style={{ height: 14 }}></span>
                  <span className="admin-skeleton-block w-50" style={{ height: 14 }}></span>
                  <span className="admin-skeleton-block w-70" style={{ height: 14 }}></span>
                  <span className="admin-skeleton-block w-40" style={{ height: 14 }}></span>
                </div>
              </div>
              <div className="admin-skeleton-card">
                <div className="admin-skeleton-row" style={{ gridTemplateColumns: '1fr auto' }}>
                  <span className="admin-skeleton-line w-40" style={{ height: 14 }}></span>
                  <span className="admin-skeleton-pill w-20"></span>
                </div>
                <div className="admin-skeleton-table">
                  <div className="admin-skeleton-row">
                    <span className="admin-skeleton-block w-50" style={{ height: 12 }}></span>
                    <span className="admin-skeleton-block w-30" style={{ height: 12 }}></span>
                    <span className="admin-skeleton-block w-20" style={{ height: 12 }}></span>
                    <span className="admin-skeleton-block w-40" style={{ height: 12 }}></span>
                  </div>
                  <div className="admin-skeleton-row">
                    <span className="admin-skeleton-block w-60" style={{ height: 12 }}></span>
                    <span className="admin-skeleton-block w-25" style={{ height: 12 }}></span>
                    <span className="admin-skeleton-block w-30" style={{ height: 12 }}></span>
                    <span className="admin-skeleton-block w-20" style={{ height: 12 }}></span>
                  </div>
                  <div className="admin-skeleton-row">
                    <span className="admin-skeleton-block w-40" style={{ height: 12 }}></span>
                    <span className="admin-skeleton-block w-35" style={{ height: 12 }}></span>
                    <span className="admin-skeleton-block w-25" style={{ height: 12 }}></span>
                    <span className="admin-skeleton-block w-30" style={{ height: 12 }}></span>
                  </div>
                </div>
              </div>
              <div className="admin-skeleton-loader">
                <span className="admin-skeleton-spinner" aria-hidden="true"></span>
                <span>Loading admin content...</span>
              </div>
            </section>
          </div>
        </div>
      )}
      <div className="calendar-card admin-card animate-fadeInUp">
        <div className="calendar-grid-wrapper">
          <table className="calendar-grid" id="calendarGrid">
            <thead id="calendarHeader">
              <tr>
                <th className="asset-column" title="Asset/Equipment name">Asset Name</th>
                {weekDays.length === 6
                  ? weekDays.map((day, index) => (
                    <th className="day-column" key={dayNames[index]}>
                      <div className="day-header">
                        <span className="day-name">{dayNames[index]}</span>
                        <span className="day-date">{formatDateShort(day)}</span>
                      </div>
                    </th>
                  ))
                  : dayNames.map((name) => (
                    <th className="day-column" key={name}>
                      <div className="day-header">
                        <span className="day-name">{name}</span>
                        <span className="day-date">-</span>
                      </div>
                    </th>
                  ))}
              </tr>
            </thead>
            <tbody id="calendarBody">{calendarRows}</tbody>
          </table>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="calendar-summary animate-fadeInUp">
        <div className="summary-card" title="Total bookings this week">
          <div className="summary-icon info">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </div>
          <div className="summary-content">
            <span className="summary-value" id="statBookings">
              {calendarData?.stats?.bookingsThisWeek ?? 0}
            </span>
            <span className="summary-label">Bookings This Week</span>
          </div>
        </div>
        <div className="summary-card" title="Items currently in repair">
          <div className="summary-icon danger">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
            </svg>
          </div>
          <div className="summary-content">
            <span className="summary-value" id="statRepair">
              {calendarData?.stats?.inRepair ?? 0}
            </span>
            <span className="summary-label">In Repair</span>
          </div>
        </div>
        <div className="summary-card" title="Equipment ready for rental">
          <div className="summary-icon success">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <div className="summary-content">
            <span className="summary-value" id="statAvailable">
              {calendarData?.stats?.available ?? 0}
            </span>
            <span className="summary-label">Available</span>
          </div>
        </div>
      </div>

      {/* Booking Detail Modal */}
      {modalOpen && (
        <div
          className="modal-backdrop"
          id="bookingModal"
          onClick={(e) => {
            if (e.target.id === "bookingModal") {
              closeModal();
            }
          }}
        >
          <div className="modal">
            <div className="modal-header">
              <h3 className="modal-title">Booking Details</h3>
              <button className="modal-close" id="closeBookingModal" title="Close modal" onClick={closeModal}>
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div className="modal-body">
              <div className="booking-detail-grid">
                <div className="detail-item">
                  <label>Customer</label>
                  <span id="modalCustomer">
                    {selectedBooking?.customer || "John Smith"}
                  </span>
                </div>
                <div className="detail-item">
                  <label>Event Type</label>
                  <span id="modalEvent">
                    {selectedBooking?.event || "Birthday Party"}
                  </span>
                </div>
                <div className="detail-item">
                  <label>Equipment</label>
                  <span id="modalEquipment">
                    {selectedBooking?.equipment || "KRK-001 Pro System"}
                  </span>
                </div>
                <div className="detail-item">
                  <label>Duration</label>
                  <span id="modalDuration">
                    {selectedBooking?.durationLabel ||
                      "Jan 15-16, 2026 (2 days)"}
                  </span>
                </div>
                <div className="detail-item">
                  <label>Status</label>
                  <span className="status-badge status-booked" id="modalStatus">
                    {selectedBooking?.status || "Booked"}
                  </span>
                </div>
                <div className="detail-item">
                  <label>Total</label>
                  <span id="modalTotal">
                    {`₱${Number(
                      selectedBooking?.total ?? 3500
                    ).toLocaleString("en-PH", {
                      minimumFractionDigits: 2,
                    })}`}
                  </span>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" id="cancelBookingModalBtn" onClick={closeModal}>Close</button>
              <button className="btn btn-primary" id="editBookingBtn">Edit Booking</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminCalendarPage;
