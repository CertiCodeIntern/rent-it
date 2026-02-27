import React, { useState, useEffect } from "react";
import "../styles/admin-components.css";
import "../styles/admin-globals.css";
import "../styles/admin-theme.css";
import "../styles/pages/admin-dashboard.css";
import "../styles/pages/admin-login.css";
import "../styles/pages/repairs.css";

export default function RepairsPage() {
  const [repairs, setRepairs] = useState([]);
  const [filteredRepairs, setFilteredRepairs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [selectedRepair, setSelectedRepair] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ inProgress: 0, awaitingParts: 0, completed: 0, unavailable: 0 });

  // Fetch repairs from API
  useEffect(() => {
    fetchRepairs();
  }, []);

  const fetchRepairs = async () => {
    setLoading(true);
    try {
      const response = await fetch("/admin/api/get_repairs.php", {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch repairs");
      const result = await response.json();
      if (result.success) {
        const repairsData = (result.data || []).map((repair) => ({
          id: `RPR-${String(repair.repair_id).padStart(3, "0")}`,
          repair_id: repair.repair_id,
          equipment: repair.item_name || `Item #${repair.item_id}`,
          category: repair.category || "general",
          serial: repair.serial_number || repair.item_id || "",
          issueType: repair.issue_type || repair.problem_description || "General Issue",
          priority: (repair.priority || "medium").toLowerCase(),
          status: (repair.status || "pending").toLowerCase().replace(/ /g, "-"),
          created: repair.created_date || new Date().toISOString().split("T")[0],
          eta: repair.eta_date || "N/A",
          cost: typeof repair.estimated_cost === "number" ? `₱${repair.estimated_cost.toLocaleString()}` : `₱${parseInt(repair.estimated_cost || 0).toLocaleString()}`,
          description: repair.description || repair.problem_description || "",
          technician: repair.assigned_to || "Unassigned",
          timeline: repair.timeline || [],
        }));
        setRepairs(repairsData);
        setStats({
          inProgress: result.stats?.in_progress || 0,
          awaitingParts: result.stats?.awaiting_parts || 0,
          completed: result.stats?.completed || 0,
          unavailable: result.stats?.unavailable || 0,
        });
      } else {
        alert(result.message || "Failed to load repairs");
      }
    } catch (err) {
      console.error("Error fetching repairs:", err);
      alert("Failed to load repairs");
    } finally {
      setLoading(false);
    }
  };



  // Filter repairs
  useEffect(() => {
    let filtered = repairs;

    if (statusFilter !== "all") {
      filtered = filtered.filter((r) => r.status === statusFilter);
    }

    if (priorityFilter !== "all") {
      filtered = filtered.filter((r) => r.priority === priorityFilter);
    }

    if (categoryFilter !== "all") {
      filtered = filtered.filter((r) => r.category === categoryFilter);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.id.toLowerCase().includes(term) ||
          r.equipment.toLowerCase().includes(term) ||
          r.serial.toLowerCase().includes(term)
      );
    }

    setFilteredRepairs(filtered);
  }, [repairs, statusFilter, priorityFilter, categoryFilter, searchTerm]);



  const handleViewRepair = (repair) => {
    setSelectedRepair(repair);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedRepair(null);
  };

  const handleEditRepair = () => {
    alert(`Edit repair ${selectedRepair.id}`);
  };

  const handleExport = () => {
    alert("Export repairs data to CSV");
  };

  const handleNewRepair = () => {
    alert("Create new repair ticket");
  };

  const getStatusBadgeClass = (status) => {
    const statusMap = {
      "in-progress": "in-progress",
      "awaiting-parts": "awaiting-parts",
      completed: "completed",
      "to-remove": "to-remove",
      unavailable: "unavailable"
    };
    return statusMap[status] || status;
  };

  const getPriorityBadgeClass = (priority) => {
    const priorityMap = {
      high: "high",
      medium: "medium",
      low: "low"
    };
    return priorityMap[priority] || priority;
  };

  return (
    <>
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">
            <svg
              className="page-icon"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M6 4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V4z" />
              <circle cx="12" cy="2" r="1" />
            </svg>
            Repairs Management
          </h1>
          <p className="page-subtitle">
            Track equipment repairs, maintenance status, and availability
          </p>
        </div>
        <div className="page-header-right">
          <button className="btn btn-secondary" onClick={handleExport} title="Export repairs data to CSV">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Export
          </button>
          <button className="btn btn-primary" onClick={handleNewRepair} title="Add new repair ticket">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            New Repair Ticket
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="repairs-stats">
        <div className="stat-card" title="Items currently under repair">
          <div className="stat-icon pending">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats.inProgress}</span>
            <span className="stat-label">In Progress</span>
          </div>
        </div>

        <div className="stat-card" title="Items waiting for repair">
          <div className="stat-icon warning">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats.awaitingParts}</span>
            <span className="stat-label">Awaiting Parts</span>
          </div>
        </div>

        <div className="stat-card" title="Repairs completed">
          <div className="stat-icon success">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats.completed}</span>
            <span className="stat-label">Completed</span>
          </div>
        </div>

        <div className="stat-card" title="Items set as unavailable">
          <div className="stat-icon danger">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
            </svg>
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats.unavailable}</span>
            <span className="stat-label">Unavailable</span>
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="repairs-controls admin-card">
        <div className="controls-left">
          <div className="search-box">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Search by item name or ticket ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="controls-right">
          <select
            className="form-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="in-progress">In Progress</option>
            <option value="awaiting-parts">Awaiting Parts</option>
            <option value="completed">Completed</option>
            <option value="unavailable">Unavailable</option>
            <option value="to-remove">To Be Removed</option>
          </select>
          <select
            className="form-select"
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
          >
            <option value="all">All Priorities</option>
            <option value="high">High Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="low">Low Priority</option>
          </select>
          <select
            className="form-select"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="all">All Categories</option>
            <option value="karaoke">Karaoke Systems</option>
            <option value="speakers">Speakers</option>
            <option value="microphones">Microphones</option>
            <option value="lighting">Lighting</option>
            <option value="accessories">Accessories</option>
          </select>
        </div>
      </div>

      {/* Repairs Table */}
      <div className="admin-card repairs-table-container">
        {loading ? (
          <div style={{ textAlign: "center", padding: "2rem", color: "var(--admin-text-muted)" }}>
            Loading repairs...
          </div>
        ) : filteredRepairs.length > 0 ? (
          <table className="admin-table repairs-table">
            <thead>
              <tr>
                <th title="Unique repair ticket ID">Ticket ID</th>
                <th title="Equipment under repair">Equipment</th>
                <th title="Type of issue">Issue Type</th>
                <th title="Priority level">Priority</th>
                <th title="Current repair status">Status</th>
                <th title="Date ticket was created">Created</th>
                <th title="Expected completion">ETA</th>
                <th title="Estimated repair cost">Est. Cost</th>
                <th title="Available actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRepairs.map((repair) => (
                <tr key={repair.id}>
                  <td>
                    <span className="ticket-badge">{repair.id}</span>
                  </td>
                  <td>
                    <div className="equipment-details">
                      <span className="equipment-name">{repair.equipment}</span>
                      <span className="equipment-category">{repair.category}</span>
                    </div>
                  </td>
                  <td>
                    <span className="issue-badge">{repair.issueType}</span>
                  </td>
                  <td>
                    <span className={`priority-badge ${getPriorityBadgeClass(repair.priority)}`}>
                      {repair.priority}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge ${getStatusBadgeClass(repair.status)}`}>
                      {repair.status.replace("-", " ")}
                    </span>
                  </td>
                  <td>
                    <span className="date-cell">{repair.created}</span>
                  </td>
                  <td>
                    <span className="date-cell">{repair.eta}</span>
                  </td>
                  <td>
                    <span className="cost-cell">{repair.cost}</span>
                  </td>
                  <td>
                    <div className="actions-cell">
                      <div className="action-buttons">
                        <button
                          className="action-btn view-btn"
                          onClick={() => handleViewRepair(repair)}
                          title="View details"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                        </button>
                        <button className="action-btn edit-btn" title="Edit ticket">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                          </svg>
                        </button>
                        {repair.status === "completed" && (
                          <button className="action-btn available-btn" title="Mark as available">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          </button>
                        )}
                        {repair.status === "in-progress" && (
                          <button className="action-btn complete-btn" title="Mark as complete">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          </button>
                        )}
                        {repair.status === "awaiting-parts" && (
                          <button className="action-btn parts-btn" title="Parts arrived">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                              <polyline points="7 10 12 15 17 10" />
                              <line x1="12" y1="15" x2="12" y2="3" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div style={{ textAlign: "center", padding: "2rem", color: "var(--admin-text-muted)" }}>
            No repairs found
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="pagination" style={{ display: filteredRepairs.length > 0 ? "flex" : "none" }}>
        <span className="pagination-info">Showing {filteredRepairs.length} repairs</span>
      </div>

      {/* Repair Detail Modal */}
      {modalOpen && selectedRepair && (
        <div className="modal active" id="repairModal">
          <div className="modal-overlay" onClick={handleCloseModal}></div>
          <div className="modal-container repair-modal">
            <div className="modal-header">
              <h2 className="modal-title">Repair Details</h2>
              <button
                className="modal-close"
                onClick={handleCloseModal}
                title="Close modal"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div className="modal-body">
              <div className="repair-detail-grid">
                <div className="detail-section">
                  <h3>Equipment Information</h3>
                  <div className="detail-row">
                    <span className="detail-label">Ticket ID:</span>
                    <span className="detail-value">{selectedRepair.id}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Equipment:</span>
                    <span className="detail-value">{selectedRepair.equipment}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Category:</span>
                    <span className="detail-value">{selectedRepair.category}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Serial No:</span>
                    <span className="detail-value">{selectedRepair.serial}</span>
                  </div>
                </div>
                <div className="detail-section">
                  <h3>Repair Status</h3>
                  <div className="detail-row">
                    <span className="detail-label">Status:</span>
                    <span className={`status-badge ${getStatusBadgeClass(selectedRepair.status)}`}>
                      {selectedRepair.status.replace("-", " ")}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Priority:</span>
                    <span className={`priority-badge ${getPriorityBadgeClass(selectedRepair.priority)}`}>
                      {selectedRepair.priority}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Assigned To:</span>
                    <span className="detail-value">{selectedRepair.technician}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Est. Cost:</span>
                    <span className="detail-value">{selectedRepair.cost}</span>
                  </div>
                </div>
              </div>
              <div className="detail-section full-width">
                <h3>Issue Description</h3>
                <p>{selectedRepair.description}</p>
              </div>
              <div className="detail-section full-width">
                <h3>Repair Timeline</h3>
                <div className="timeline">
                  {selectedRepair.timeline.map((item, idx) => (
                    <div key={idx} className="timeline-item">
                      <div className={`timeline-dot ${item.status}`}></div>
                      <div className="timeline-content">
                        <span className="timeline-date">{item.date} - {item.time}</span>
                        <span className="timeline-text">{item.text}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={handleCloseModal}>
                Close
              </button>
              <button className="btn btn-primary" onClick={handleEditRepair}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
                Edit Ticket
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
