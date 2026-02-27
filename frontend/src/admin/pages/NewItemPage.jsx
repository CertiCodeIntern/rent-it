import React, { useRef, useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import "../styles/admin-components.css";
import "../styles/admin-globals.css";
import "../styles/admin-theme.css";
import "../styles/pages/admin-dashboard.css";
import "../styles/pages/admin-login.css";
import "../styles/pages/newitem.css";

const defaultForm = {
  itemName: "",
  itemDescription: "",
  itemCategory: "",
  dailyRate: "",
  depositAmount: "",
  totalUnits: 1,
  availableUnits: 1,
  itemCondition: "good",
  itemStatus: "Available",
  isVisible: true,
  isFeatured: false,
  itemTags: "",
  itemImage: null,
};

export default function NewItemPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [form, setForm] = useState(defaultForm);
  const [imagePreview, setImagePreview] = useState(null);
  const [tags, setTags] = useState([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editItemId, setEditItemId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef();

  // Load item data if in edit mode
  useEffect(() => {
    const editId = searchParams.get("edit");
    if (editId) {
      setIsEditMode(true);
      setEditItemId(editId);
      loadItemForEdit(editId);
    }
  }, [searchParams]);

  const loadItemForEdit = async (itemId) => {
    setLoading(true);
    try {
      const response = await fetch(`/admin/api/get_item.php?id=${itemId}`, {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to load item");
      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || "Failed to load item");
      }

      const item = result.data;
      setForm({
        itemName: item.item_name || "",
        itemDescription: item.description || "",
        itemCategory: item.category || "",
        dailyRate: item.price_per_day || "",
        depositAmount: item.deposit || "",
        totalUnits: item.total_units || 1,
        availableUnits: item.available_units || 1,
        itemCondition: item.condition || "good",
        itemStatus: item.status || "Available",
        isVisible: item.is_visible == 1,
        isFeatured: item.is_featured == 1,
        itemTags: item.tags || "",
        itemImage: null,
      });

      if (item.tags) {
        setTags(item.tags.split(",").map((t) => t.trim()).filter((t) => t));
      }

      if (item.image) {
        setImagePreview(`/assets/images/items/${item.image}`);
      }
    } catch (err) {
      console.error("Error loading item:", err);
      alert("Failed to load item data");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (name === "itemTags") {
      setTags(
        value
          .split(",")
          .map((t) => t.trim())
          .filter((t) => t)
      );
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setForm((prev) => ({ ...prev, itemImage: file }));
      const reader = new FileReader();
      reader.onload = (ev) => setImagePreview(ev.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setForm((prev) => ({ ...prev, itemImage: null }));
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleImageAreaClick = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Validate form
      if (!form.itemName || !form.itemDescription || !form.itemCategory || !form.dailyRate) {
        alert("Please fill in all required fields");
        setSubmitting(false);
        return;
      }

      // Prepare API endpoint
      const endpoint = isEditMode ? "/admin/api/update_item.php" : "/admin/api/add_item.php";

      // Prepare form data
      let body;
      const headers = {};

      if (form.itemImage) {
        // Use FormData if we have an image file
        const formData = new FormData();
        formData.append("itemImage", form.itemImage);
        formData.append("item_name", form.itemName);
        formData.append("description", form.itemDescription);
        formData.append("category", form.itemCategory);
        formData.append("price_per_day", form.dailyRate);
        formData.append("deposit", form.depositAmount || null);
        formData.append("condition", form.itemCondition);
        formData.append("status", form.itemStatus);
        formData.append("total_units", form.totalUnits);
        formData.append("available_units", form.availableUnits);
        formData.append("is_visible", form.isVisible ? 1 : 0);
        formData.append("is_featured", form.isFeatured ? 1 : 0);
        formData.append("tags", form.itemTags || null);
        if (isEditMode && editItemId) {
          formData.append("item_id", editItemId);
        }
        body = formData;
      } else {
        // Use JSON if no image
        headers["Content-Type"] = "application/json";
        body = JSON.stringify({
          item_name: form.itemName,
          description: form.itemDescription,
          category: form.itemCategory,
          price_per_day: form.dailyRate,
          deposit: form.depositAmount || null,
          condition: form.itemCondition,
          status: form.itemStatus,
          total_units: form.totalUnits,
          available_units: form.availableUnits,
          is_visible: form.isVisible ? 1 : 0,
          is_featured: form.isFeatured ? 1 : 0,
          tags: form.itemTags || null,
          ...(isEditMode && editItemId && { item_id: editItemId }),
        });
      }

      const response = await fetch(endpoint, {
        method: "POST",
        headers,
        body,
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        alert(isEditMode ? "Item updated successfully!" : "Item created successfully!");
        navigate("/admin/items");
      } else {
        throw new Error(result.message || "Failed to save item");
      }
    } catch (err) {
      console.error("Error saving item:", err);
      alert(`Failed to save item: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {loading && (
        <div className="admin-skeleton-overlay" aria-hidden="true">
          <div className="admin-skeleton-shell">
            <aside className="admin-skeleton-sidebar">
              <div className="admin-skeleton-logo"></div>
              <div className="admin-skeleton-nav">
                <span className="admin-skeleton-pill w-70"></span>
                <span className="admin-skeleton-pill w-60"></span>
                <span className="admin-skeleton-pill w-80"></span>
              </div>
            </aside>
            <section className="admin-skeleton-main">
              <div className="admin-skeleton-topbar">
                <span className="admin-skeleton-line w-40"></span>
              </div>
              <div className="admin-skeleton-loader">
                <span className="admin-skeleton-spinner"></span>
                <span>Loading item data...</span>
              </div>
            </section>
          </div>
        </div>
      )}
      <div className="admin-page-header">
            <div>
              <h1 className="admin-page-title">{isEditMode ? "Edit Item" : "Add New Item"}</h1>
              <p className="admin-page-subtitle">
                {isEditMode ? "Update the details for this rental item" : "Create a new rental item to display in the catalog"}
              </p>
            </div>
            <div className="admin-page-actions">
              <button
                className="btn btn-secondary"
                title="Cancel and go back"
                onClick={() => navigate('/admin/items')}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                  <line x1="19" y1="12" x2="5" y2="12" />
                  <polyline points="12 19 5 12 12 5" />
                </svg>
                Cancel
              </button>
              <button
                className="btn btn-primary"
                id="saveItemBtn"
                title={isEditMode ? "Update item" : "Save new item"}
                onClick={handleSubmit}
                disabled={submitting || loading}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                  <polyline points="17 21 17 13 7 13 7 21" />
                  <polyline points="7 3 7 8 15 8" />
                </svg>
                {submitting ? "Saving..." : isEditMode ? "Update Item" : "Save Item"}
              </button>
            </div>
          </div>

          <div className="newitem-form-container">
            <form id="newItemForm" className="newitem-form" onSubmit={handleSubmit}>
              {/* Left Column - Main Details */}
              <div className="form-column form-column-main">
                {/* Basic Information Card */}
                <section className="admin-card">
                  <div className="admin-card-header">
                    <h2 className="admin-card-title">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                      Basic Information
                    </h2>
                  </div>
                  <div className="admin-card-body">
                    <div className="form-group">
                      <label htmlFor="itemName" className="form-label">
                        Item Name <span className="required">*</span>
                      </label>
                      <input
                        type="text"
                        id="itemName"
                        name="itemName"
                        className="form-input"
                        placeholder="e.g., Karaoke Pro System X-200"
                        required
                        value={form.itemName}
                        onChange={handleChange}
                      />
                      <span className="form-hint">
                        Enter a descriptive name for the rental item
                      </span>
                    </div>

                    <div className="form-group">
                      <label htmlFor="itemDescription" className="form-label">
                        Description <span className="required">*</span>
                      </label>
                      <textarea
                        id="itemDescription"
                        name="itemDescription"
                        className="form-textarea"
                        rows={4}
                        placeholder="Describe the item features, specifications, and what's included..."
                        required
                        value={form.itemDescription}
                        onChange={handleChange}
                      />
                      <span className="form-hint">
                        Provide detailed information about the item
                      </span>
                    </div>

                    <div className="form-group">
                      <label htmlFor="itemCategory" className="form-label">
                        Category <span className="required">*</span>
                      </label>
                      <select
                        id="itemCategory"
                        name="itemCategory"
                        className="form-select"
                        required
                        value={form.itemCategory}
                        onChange={handleChange}
                      >
                        <option value="">Select a category</option>
                        <option value="Portable">Portable</option>
                        <option value="Premium">Premium</option>
                        <option value="Professional">Professional</option>
                      </select>
                    </div>
                  </div>
                </section>

                {/* Pricing Card */}
                <section className="admin-card">
                  <div className="admin-card-header">
                    <h2 className="admin-card-title">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                        <text x="12" y="17" textAnchor="middle" fontSize="16" fontWeight="bold" fill="currentColor" stroke="none">
                          ₱
                        </text>
                      </svg>
                      Pricing
                    </h2>
                  </div>
                  <div className="admin-card-body">
                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="dailyRate" className="form-label">
                          Daily Rate (₱) <span className="required">*</span>
                        </label>
                        <input
                          type="number"
                          id="dailyRate"
                          name="dailyRate"
                          className="form-input"
                          placeholder="0.00"
                          min="0"
                          step="0.01"
                          required
                          value={form.dailyRate}
                          onChange={handleChange}
                        />
                        <span className="form-hint">
                          This rate is also used as the late fee charge per day
                        </span>
                      </div>

                      <div className="form-group">
                        <label htmlFor="depositAmount" className="form-label">
                          Security Deposit (₱)
                        </label>
                        <input
                          type="number"
                          id="depositAmount"
                          name="depositAmount"
                          className="form-input"
                          placeholder="0.00"
                          min="0"
                          step="0.01"
                          value={form.depositAmount}
                          onChange={handleChange}
                        />
                        <span className="form-hint">
                          Refundable deposit charged at checkout
                        </span>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Inventory Card */}
                <section className="admin-card">
                  <div className="admin-card-header">
                    <h2 className="admin-card-title">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                        <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                        <line x1="12" y1="22.08" x2="12" y2="12" />
                      </svg>
                      Inventory
                    </h2>
                  </div>
                  <div className="admin-card-body">
                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="totalUnits" className="form-label">
                          Total Units <span className="required">*</span>
                        </label>
                        <input
                          type="number"
                          id="totalUnits"
                          name="totalUnits"
                          className="form-input"
                          placeholder="1"
                          min="1"
                          value={form.totalUnits}
                          required
                          onChange={handleChange}
                        />
                      </div>

                      <div className="form-group">
                        <label htmlFor="availableUnits" className="form-label">
                          Available Units
                        </label>
                        <input
                          type="number"
                          id="availableUnits"
                          name="availableUnits"
                          className="form-input"
                          placeholder="1"
                          min="0"
                          value={form.availableUnits}
                          onChange={handleChange}
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label htmlFor="itemCondition" className="form-label">
                        Condition
                      </label>
                      <select
                        id="itemCondition"
                        name="itemCondition"
                        className="form-select"
                        value={form.itemCondition}
                        onChange={handleChange}
                      >
                        <option value="new">New</option>
                        <option value="excellent">Excellent</option>
                        <option value="good">Good</option>
                        <option value="fair">Fair</option>
                      </select>
                    </div>
                  </div>
                </section>
              </div>

              {/* Right Column - Media & Status */}
              <div className="form-column form-column-side">
                {/* Image Upload Card */}
                <section className="admin-card">
                  <div className="admin-card-header">
                    <h2 className="admin-card-title">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <polyline points="21 15 16 10 5 21" />
                      </svg>
                      Item Image
                    </h2>
                  </div>
                  <div className="admin-card-body">
                    <div
                      className="image-upload-area"
                      id="imageUploadArea"
                      onClick={handleImageAreaClick}
                      style={{ cursor: "pointer" }}
                    >
                      {!imagePreview ? (
                        <div className="upload-placeholder" id="uploadPlaceholder">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="48" height="48">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="17 8 12 3 7 8" />
                            <line x1="12" y1="3" x2="12" y2="15" />
                          </svg>
                          <p>Drag & drop image here</p>
                          <span>or click to browse</span>
                        </div>
                      ) : (
                        <img
                          src={imagePreview}
                          className="image-preview"
                          alt="Item preview"
                          style={{ display: "block" }}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "/assets/images/catalog-fallback.svg";
                          }}
                        />
                      )}
                      <input
                        type="file"
                        id="itemImage"
                        name="itemImage"
                        accept="image/*"
                        className="file-input"
                        ref={fileInputRef}
                        style={{ display: "none" }}
                        onChange={handleImageChange}
                      />
                    </div>
                    <span className="form-hint">
                      Recommended: 800x600px, JPG or PNG
                    </span>
                    {imagePreview && (
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        id="removeImageBtn"
                        style={{ marginTop: 8 }}
                        onClick={handleRemoveImage}
                      >
                        Remove Image
                      </button>
                    )}
                  </div>
                </section>

                {/* Status Card */}
                <section className="admin-card">
                  <div className="admin-card-header">
                    <h2 className="admin-card-title">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                      </svg>
                      Status & Visibility
                    </h2>
                  </div>
                  <div className="admin-card-body">
                    <div className="form-group">
                      <label htmlFor="itemStatus" className="form-label">
                        Status
                      </label>
                      <select
                        id="itemStatus"
                        name="itemStatus"
                        className="form-select"
                        value={form.itemStatus}
                        onChange={handleChange}
                      >
                        <option value="Available">Available</option>
                        <option value="Repairing">Under Maintenance</option>
                        <option value="Reserved">Reserved</option>
                        <option value="Unavailable">Unavailable</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="toggle-label">
                        <input
                          type="checkbox"
                          id="isVisible"
                          name="isVisible"
                          checked={form.isVisible}
                          onChange={handleChange}
                        />
                        <span className="toggle-switch"></span>
                        <span className="toggle-text">Visible in Catalog</span>
                      </label>
                      <span className="form-hint">
                        When enabled, item will be displayed to customers
                      </span>
                    </div>

                    <div className="form-group">
                      <label className="toggle-label">
                        <input
                          type="checkbox"
                          id="isFeatured"
                          name="isFeatured"
                          checked={form.isFeatured}
                          onChange={handleChange}
                        />
                        <span className="toggle-switch"></span>
                        <span className="toggle-text">Featured Item</span>
                      </label>
                      <span className="form-hint">
                        Featured items appear in promotions
                      </span>
                    </div>
                  </div>
                </section>

                {/* Tags Card */}
                <section className="admin-card">
                  <div className="admin-card-header">
                    <h2 className="admin-card-title">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                        <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
                        <line x1="7" y1="7" x2="7.01" y2="7" />
                      </svg>
                      Tags
                    </h2>
                  </div>
                  <div className="admin-card-body">
                    <div className="form-group">
                      <label htmlFor="itemTags" className="form-label">
                        Tags
                      </label>
                      <input
                        type="text"
                        id="itemTags"
                        name="itemTags"
                        className="form-input"
                        placeholder="e.g., karaoke, bluetooth, portable"
                        value={form.itemTags}
                        onChange={handleChange}
                      />
                      <span className="form-hint">Separate tags with commas</span>
                    </div>
                    <div className="tags-preview" id="tagsPreview">
                      {tags.map((tag, i) => (
                        <span key={i} className="tag-preview">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </section>
              </div>
            </form>
          </div>
      </>
  );
}
