import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/admin-components.css";
import "../styles/admin-globals.css";
import "../styles/admin-theme.css";
import "../styles/pages/admin-dashboard.css";
import "../styles/pages/admin-login.css";
import "../styles/pages/item.css";

// Match Admin API base to Vite proxy + PHP paths
const ADMIN_API_BASE = import.meta.env.DEV
  ? "/api/rent-it/admin/api"
  : "/rent-it/admin/api";

export default function ItemsPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  // Fetch items on mount
  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${ADMIN_API_BASE}/get_items.php`, {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch items");
      const result = await response.json();
      if (result.success) {
        setItems(result.data || []);
      } else {
        alert(result.message || "Failed to load items");
      }
    } catch (err) {
      console.error("Error fetching items:", err);
      alert("Failed to load items");
    } finally {
      setLoading(false);
    }
  };

  // Filter and search
  useEffect(() => {
    let filtered = items;

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(
        (item) => (item.status || "").toLowerCase() === statusFilter.toLowerCase()
      );
    }

    // Apply search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          (item.item_name || "").toLowerCase().includes(term) ||
          (item.category || "").toLowerCase().includes(term) ||
          (item.status || "").toLowerCase().includes(term)
      );
    }

    setFilteredItems(filtered);
  }, [items, statusFilter, searchTerm]);

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "Available":
        return "status-success";
      case "Booked":
        return "status-info";
      case "Reserved":
        return "status-warning";
      case "Under Maintenance":
      case "Repairing":
        return "status-warning";
      case "Unavailable":
        return "status-danger";
      default:
        return "status-default";
    }
  };

  const handleRefresh = async () => {
    await fetchItems();
  };

  const handleEditItem = (itemId) => {
    navigate(`/admin/newitem?edit=${itemId}`);
  };

  const handleStatusChange = async (itemId, newStatus) => {
    try {
      const response = await fetch(`${ADMIN_API_BASE}/update_item_status.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          item_id: itemId,
          status: newStatus,
        }),
      });

      if (!response.ok) throw new Error("Failed to update status");
      const result = await response.json();

      if (result.success) {
        alert(result.message || "Status updated successfully");
        await fetchItems();
      } else {
        alert(result.message || "Failed to update status");
      }
    } catch (err) {
      console.error("Error updating status:", err);
      alert("Failed to update item status");
    }
  };

  const handleRepairItem = (itemId) => {
    handleStatusChange(itemId, "Repairing");
  };

  const handleSetUnavailable = (itemId) => {
    handleStatusChange(itemId, "Unavailable");
  };

  const handleSetAvailable = (itemId) => {
    handleStatusChange(itemId, "Available");
  };

  return (
    <>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Items</h1>
          <p className="admin-page-subtitle">
            Manage all rental items available in the catalog
          </p>
        </div>
        <div className="admin-page-actions">
          <button
            className="btn btn-primary"
            title="Add new item"
            onClick={() => navigate("/admin/newitem")}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              width="16"
              height="16"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add Item
          </button>
        </div>
      </div>

      <div className="items-toolbar items-toolbar--react">
        <div className="items-search items-search--react">
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
            id="itemSearchInput"
            placeholder="Search items by name, category, or status..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="items-filters items-filters--react">
          <select
            id="statusFilter"
            className="filter-select filter-select--react"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="Available">Available</option>
            <option value="Booked">Booked</option>
            <option value="Reserved">Reserved</option>
            <option value="Under Maintenance">Under Maintenance</option>
            <option value="Repairing">Repairing</option>
            <option value="Unavailable">Unavailable</option>
          </select>
          <button
            className="btn btn-secondary"
            id="refreshItemsBtn"
            title="Refresh items list"
            onClick={handleRefresh}
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

      <div className="items-table-container items-table-container--react">
        {loading ? (
          <div style={{ textAlign: "center", padding: "2rem", color: "var(--admin-text-muted)" }}>
            Loading items...
          </div>
        ) : filteredItems.length === 0 ? (
          <div style={{ textAlign: "center", padding: "2rem", color: "var(--admin-text-muted)" }}>
            No items found
          </div>
        ) : (
          <table className="admin-table items-table items-table-react">
            <thead>
              <tr>
                <th>ID</th>
                <th>Item</th>
                <th>Category</th>
                <th>Pricing</th>
                <th>Units</th>
                <th>Status &amp; Visibility</th>
                <th>Tags</th>
                <th>Times Rented</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody id="itemsTableBody">
              {filteredItems.map((item) => {
                const totalUnits = parseInt(item.total_units, 10) || 0;
                const availableUnits = parseInt(item.available_units, 10) || 0;
                const repairingUnits = parseInt(item.repairing_units, 10) || 0;
                const rentedUnits = Math.max(
                  0,
                  totalUnits - availableUnits - repairingUnits
                );

                return (
                <tr key={item.item_id}>
                  <td>#{item.item_id}</td>
                  <td>
                    <div className="item-cell">
                      <div className="item-thumb">
                        {item.image ? (
                          <img src={`/assets/images/items/${item.image}`} alt={item.item_name} />
                        ) : (
                          <div className="item-thumb-placeholder">
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
                        )}
                      </div>
                      <div className="item-info">
                        <div className="item-name">{item.item_name}</div>
                        <div className="item-desc">{item.description}</div>
                      </div>
                    </div>
                  </td>
                  <td>{item.category}</td>
                  <td>
                    <div className="item-pricing">
                      <div className="price-main">₱{Number(item.price_per_day).toLocaleString("en-PH", { minimumFractionDigits: 2 })}/day</div>
                      {item.deposit > 0 && (
                        <div className="price-deposit">
                          Deposit: ₱{Number(item.deposit).toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                        </div>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className="item-units-info">
                      <div className="units-row">
                        <strong>Total:</strong> {totalUnits}
                      </div>
                      <div className="units-row">
                        <strong>Available:</strong>{" "}
                        <span className="units-available">
                          {availableUnits}
                        </span>
                      </div>
                      <div className="units-row">
                        <strong>Rented:</strong>{" "}
                        <span className="units-rented">{rentedUnits}</span>
                      </div>
                      <div className="units-row">
                        <strong>Repairing:</strong>{" "}
                        <span className="units-repairing">
                          {repairingUnits}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="item-status-visibility">
                      <span
                        className={`status-badge ${getStatusBadgeClass(
                          item.status
                        )}`}
                      >
                        {item.status}
                      </span>
                      <div className="visibility-badges">
                        {parseInt(item.is_visible) === 1 && (
                          <span className="visibility-badge visible">
                            <svg
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              width="12"
                              height="12"
                            >
                              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                              <circle cx="12" cy="12" r="3" />
                            </svg>
                            VISIBLE
                          </span>
                        )}
                        {parseInt(item.is_visible) === 0 && (
                          <span className="visibility-badge hidden">
                            <svg
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              width="12"
                              height="12"
                            >
                              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20C5 20 1 12 1 12a18.45 18.45 0 0 1 5.06-5.94" />
                              <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                              <path d="M14.12 14.12A3 3 0 0 1 9.88 9.88" />
                              <line x1="1" y1="1" x2="23" y2="23" />
                            </svg>
                            HIDDEN
                          </span>
                        )}
                        {parseInt(item.is_featured) === 1 && (
                          <span className="visibility-badge featured">
                            <svg
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              width="12"
                              height="12"
                            >
                              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                            </svg>
                            FEATURED
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="item-tags">
                      {item.tags && item.tags.length > 0 ? (
                        item.tags.split(",").map((tag, idx) => (
                          <span key={idx} className="item-tag">
                            {tag.trim()}
                          </span>
                        ))
                      ) : (
                        <span className="item-no-tags">No tags</span>
                      )}
                    </div>
                  </td>
                  <td>{item.total_times_rented || 0}</td>
                  <td>
                    <div className="item-actions">
                      <button
                        className="item-action-btn item-action-edit"
                        onClick={() => handleEditItem(item.item_id)}
                        title="Edit item"
                      >
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          width="14"
                          height="14"
                        >
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                        Edit
                      </button>

                      {(item.status === "Available" || !item.status) && (
                        <>
                          <button
                            className="item-action-btn item-action-repair"
                            onClick={() => handleRepairItem(item.item_id)}
                            title="Mark as under repair"
                          >
                            <svg
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              width="14"
                              height="14"
                            >
                              <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
                            </svg>
                            Repair
                          </button>
                          <button
                            className="item-action-btn item-action-unavailable"
                            onClick={() => handleSetUnavailable(item.item_id)}
                            title="Mark as unavailable"
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
                            Unavailable
                          </button>
                        </>
                      )}

                      {(item.status === "Repairing" ||
                        item.status === "Under Maintenance" ||
                        item.status === "Unavailable") && (
                        <button
                          className="item-action-btn item-action-available"
                          onClick={() => handleSetAvailable(item.item_id)}
                          title="Mark as available"
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
                            <polyline points="12 6 12 12 16 14" />
                          </svg>
                          Available
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
              })}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
