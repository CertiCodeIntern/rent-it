import React, { useState, useEffect } from 'react';
import '../styles/pages/latefees.css';

const LateFeesPage = () => {
  // State for overdue items
  const [overdueItems, setOverdueItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [filterValue, setFilterValue] = useState('all');
  const [loading, setLoading] = useState(true);
  const [stats, setFormattedStats] = useState({ outstandingFees: 0, overdueCount: 0, collectedMonth: 0, remindersSent: 0 });

  // State for reminders modal
  const [reminderModalOpen, setReminderModalOpen] = useState(false);
  const [currentReminderId, setCurrentReminderId] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState('gentle');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');

  // State for template modal
  const [templateModalOpen, setTemplateModalOpen] = useState(false);
  const [templateModalMode, setTemplateModalMode] = useState(null);
  const [editingTemplateKey, setEditingTemplateKey] = useState(null);
  const [templateName, setTemplateName] = useState('');
  const [templateSubject, setTemplateSubject] = useState('');
  const [templateBody, setTemplateBody] = useState('');

  // State for activity log
  const [activities, setActivities] = useState([]);

  // State for phone reveal
  const [revealedPhones, setRevealedPhones] = useState({});

  // Fetch late fees from API
  useEffect(() => {
    fetchLateFees();
  }, []);

  const fetchLateFees = async () => {
    setLoading(true);
    try {
      const response = await fetch("/admin/api/get_latefees.php", {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch late fees");
      const result = await response.json();
      if (result.success) {
        const overdueData = (result.overdue || []).map((item) => ({
          order_id: item.order_id,
          order_id_formatted: item.order_id_formatted || `ORD-${String(item.order_id).padStart(5, "0")}`,
          customer: {
            name: item.customer_name || item.customer?.name || "Unknown",
            email: item.customer_email || item.customer?.email || "",
            phone: item.customer_phone || item.customer?.phone || "",
          },
          items: (item.items || []).map((i) => ({
            item_name: typeof i === "string" ? i : i.item_name || i.name || "",
          })),
          end_date: item.end_date || item.due_date || "",
          days_overdue: item.days_overdue || 0,
          late_fee: item.late_fee || 0,
          priority: item.priority || (item.days_overdue > 7 ? "critical" : item.days_overdue > 3 ? "warning" : "mild"),
        }));
        setOverdueItems(overdueData);
        setFilteredItems(overdueData);
        setFormattedStats({
          outstandingFees: result.stats?.total_outstanding || 0,
          overdueCount: result.stats?.overdue_count || overdueData.length,
          collectedMonth: result.stats?.collected_month || 0,
          remindersSent: result.stats?.reminders_sent || 0,
        });
        setActivities([
          {
            type: "sent",
            text: `Loaded ${overdueData.length} overdue rental${overdueData.length !== 1 ? "s" : ""}`,
            time: new Date().toLocaleTimeString(),
          },
        ]);
      } else {
        alert(result.message || "Failed to load late fees");
      }
    } catch (err) {
      console.error("Error fetching late fees:", err);
      alert("Failed to load late fees");
    } finally {
      setLoading(false);
    }
  };

  // Editable templates
  const [templates, setTemplates] = useState({
    gentle: {
      name: 'Gentle Reminder',
      subject: 'Rental Return Reminder - [Equipment Name]',
      body: `Hi [Customer Name],\n\nThis is a friendly reminder that your rental of [Equipment Name] was due on [Due Date].\n\nYour current late fee is: ₱[Late Fee Amount]\n\nPlease return the equipment at your earliest convenience to avoid additional charges. If you have already returned the item, please disregard this message.\n\nIf you need to extend your rental, please contact us at (02) 8123-4567.\n\nThank you for your understanding.\n\nBest regards,\nSound Rental Team`
    },
    urgent: {
      name: 'Urgent Notice',
      subject: 'URGENT: Rental [X] Days Overdue - [Equipment Name]',
      body: `Dear [Customer Name],\n\nURGENT: Your rental of [Equipment Name] is now [X] days overdue.\n\nAccrued late fee: ₱[Late Fee Amount]\n\nPlease return the equipment immediately to prevent further charges. Late fees continue to accumulate daily.\n\nIf you are unable to return the items, please contact us immediately at (02) 8123-4567.\n\nRegards,\nSound Rental Team`
    },
    final: {
      name: 'Final Warning',
      subject: 'FINAL NOTICE: Immediate Return Required - [Equipment Name]',
      body: `Dear [Customer Name],\n\nFINAL NOTICE: Your rental of [Equipment Name] is [X] days overdue with a total late fee of ₱[Late Fee Amount].\n\nThis is our final notice before escalation. Please return all equipment within 24 hours or we will be forced to take further action, which may include additional penalties.\n\nContact us immediately at (02) 8123-4567.\n\nSound Rental Management`
    },
    payment: {
      name: 'Payment Request',
      subject: 'Payment Due: Late Fees of ₱[Late Fee Amount]',
      body: `Dear [Customer Name],\n\nYou have an outstanding late fee of ₱[Late Fee Amount] for the rental of [Equipment Name] (due: [Due Date]).\n\nPlease settle the payment at your earliest convenience. You can pay via:\n- Bank transfer\n- GCash/Maya\n- In-person at our office\n\nFor questions, contact us at (02) 8123-4567.\n\nThank you,\nSound Rental Team`
    },
    custom: {
      name: 'Custom Message',
      subject: 'Regarding Your Rental - [Equipment Name]',
      body: ''
    }
  });





  // Filter items
  const handleFilterChange = (e) => {
    const value = e.target.value;
    setFilterValue(value);

    if (value === 'all') {
      setFilteredItems(overdueItems);
    } else {
      const filtered = overdueItems.filter(item => item.priority === value);
      setFilteredItems(filtered);
    }
  };

  // Open reminder modal
  const openReminderModal = (item) => {
    setCurrentReminderId(item.order_id);
    setReminderModalOpen(true);
    
    // Auto-detect template based on priority
    if (item.priority === 'critical') {
      setSelectedTemplate('final');
    } else if (item.priority === 'warning') {
      setSelectedTemplate('urgent');
    } else {
      setSelectedTemplate('gentle');
    }

    // Fill template
    updateReminderTemplate(item, item.priority === 'critical' ? 'final' : item.priority === 'warning' ? 'urgent' : 'gentle');
  };

  // Update reminder template
  const updateReminderTemplate = (item, templateKey) => {
    const template = templates[templateKey];
    const customerName = item.customer.name;
    const itemNames = item.items.map(i => i.item_name).join(', ');
    const dueDate = item.end_date;
    const lateFee = formatCurrency(item.late_fee);
    const daysOverdue = item.days_overdue;

    const subject = template.subject
      .replace('[Customer Name]', customerName)
      .replace('[Equipment Name]', itemNames)
      .replace('[Due Date]', dueDate)
      .replace('[Late Fee Amount]', lateFee)
      .replace('[X]', daysOverdue);

    const body = template.body
      .replace(/\[Customer Name\]/g, customerName)
      .replace(/\[Equipment Name\]/g, itemNames)
      .replace(/\[Due Date\]/g, dueDate)
      .replace(/\[Late Fee Amount\]/g, lateFee)
      .replace(/\[X\]/g, daysOverdue);

    setEmailSubject(subject);
    setEmailBody(body);
  };

  // Handle template select change
  const handleTemplateSelectChange = (e) => {
    const templateKey = e.target.value;
    setSelectedTemplate(templateKey);

    const item = overdueItems.find(i => i.order_id === currentReminderId);
    if (item) {
      updateReminderTemplate(item, templateKey);
    }
  };

  // Send reminder
  const handleSendReminder = () => {
    const item = overdueItems.find(i => i.order_id === currentReminderId);
    if (item) {
      addActivity('sent', `Reminder sent to ${item.customer.name}`);
      setReminderModalOpen(false);
    }
  };

  // Send all reminders
  const handleSendAllReminders = () => {
    if (overdueItems.length === 0) return;
    
    if (window.confirm(`Send reminders to all ${overdueItems.length} overdue customers?`)) {
      addActivity('sent', `Bulk reminders sent (${overdueItems.length} customers)`);
    }
  };

  // Toggle phone reveal
  const togglePhone = (orderId) => {
    setRevealedPhones(prev => ({
      ...prev,
      [orderId]: !prev[orderId]
    }));
  };

  // Resolve item
  const handleResolveItem = (orderId) => {
    const item = overdueItems.find(i => i.order_id === orderId);
    if (item) {
      if (window.confirm(`Mark ${item.order_id_formatted} as resolved?`)) {
        const newItems = overdueItems.filter(i => i.order_id !== orderId);
        setOverdueItems(newItems);
        setFilteredItems(newItems.filter(i => filterValue === 'all' || i.priority === filterValue));
        addActivity('resolved', `Late fee resolved for ${item.customer.name}`);
      }
    }
  };

  // Add activity
  const addActivity = (type, text) => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    const newActivity = {
      type,
      text,
      time: `Today ${timeStr}`
    };
    setActivities(prev => [newActivity, ...prev]);
  };

  // Use template
  const handleUseTemplate = (templateKey) => {
    // Just update selected template
    setSelectedTemplate(templateKey);
  };

  // Open edit template modal
  const openEditTemplateModal = (templateKey) => {
    const template = templates[templateKey];
    setTemplateModalMode('edit');
    setEditingTemplateKey(templateKey);
    setTemplateName(template.name);
    setTemplateSubject(template.subject);
    setTemplateBody(template.body);
    setTemplateModalOpen(true);
  };

  // Open add template modal
  const openAddTemplateModal = () => {
    setTemplateModalMode('add');
    setEditingTemplateKey(null);
    setTemplateName('');
    setTemplateSubject('');
    setTemplateBody('');
    setTemplateModalOpen(true);
  };

  // Save template
  const handleSaveTemplate = () => {
    if (!templateName.trim()) {
      alert('Please enter a template name');
      return;
    }

    if (templateModalMode === 'edit' && editingTemplateKey) {
      setTemplates(prev => ({
        ...prev,
        [editingTemplateKey]: {
          name: templateName,
          subject: templateSubject,
          body: templateBody
        }
      }));
      addActivity('sent', `Template "${templateName}" updated`);
    } else if (templateModalMode === 'add') {
      const newKey = `custom_${Date.now()}`;
      setTemplates(prev => ({
        ...prev,
        [newKey]: {
          name: templateName,
          subject: templateSubject,
          body: templateBody
        }
      }));
      addActivity('sent', `New template "${templateName}" created`);
    }

    setTemplateModalOpen(false);
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <>
      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">
            <svg className="page-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
              <path d="M17 14l-5 5-3-3"/>
            </svg>
            Late Fees Tracker
          </h1>
          <p className="page-subtitle">Monitor overdue rentals, manage late fees, and send reminders</p>
        </div>
        <div className="page-header-right">
          <button className="btn btn-secondary" onClick={() => setTemplateModalOpen(true)} title="Manage email templates">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
              <polyline points="22,6 12,13 2,6"/>
            </svg>
            Email Templates
          </button>
          <button className="btn btn-primary" onClick={handleSendAllReminders} title="Send reminders to all overdue customers">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 2L11 13"/>
              <path d="M22 2l-7 20-4-9-9-4 20-7z"/>
            </svg>
            Send All Reminders
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="latefees-stats">
        <div className="stat-card" title="Total outstanding late fees">
          <div className="stat-icon danger">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <text x="12" y="17" textAnchor="middle" fontSize="16" fontWeight="bold" fill="currentColor" stroke="none">₱</text>
            </svg>
          </div>
          <div className="stat-info">
            <span className="stat-value">{formatCurrency(stats.outstandingFees)}</span>
            <span className="stat-label">Outstanding Fees</span>
          </div>
        </div>

        <div className="stat-card" title="Currently overdue rentals">
          <div className="stat-icon warning">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats.overdueCount}</span>
            <span className="stat-label">Overdue Rentals</span>
          </div>
        </div>

        <div className="stat-card" title="Late fees collected this month">
          <div className="stat-icon success">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
          <div className="stat-info">
            <span className="stat-value">{formatCurrency(stats.collectedMonth)}</span>
            <span className="stat-label">Collected This Month</span>
          </div>
        </div>

        <div className="stat-card" title="Reminders sent today">
          <div className="stat-icon pending">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
              <polyline points="22,6 12,13 2,6"/>
            </svg>
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats.remindersSent}</span>
            <span className="stat-label">Reminders Sent Today</span>
          </div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="latefees-layout">
        {/* Left: Overdue List */}
        <div className="overdue-section">
          <div className="admin-card">
            <div className="card-header">
              <h2 className="card-title">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12 6 12 12 16 14"/>
                </svg>
                Overdue Rentals
              </h2>
              <div className="card-actions">
                <select className="form-select" value={filterValue} onChange={handleFilterChange}>
                  <option value="all">All</option>
                  <option value="critical">Critical</option>
                  <option value="warning">Warning</option>
                  <option value="mild">Mild</option>
                </select>
              </div>
            </div>
            <div className="overdue-list">
              {loading ? (
                <div className="overdue-empty">
                  <p style={{ color: 'var(--admin-text-muted)' }}>Loading overdue rentals...</p>
                </div>
              ) : filteredItems.length === 0 ? (
                <div className="overdue-empty">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"/>
                    <path d="m21 21-4.35-4.35"/>
                  </svg>
                  <span>No overdue rentals found</span>
                </div>
              ) : (
                filteredItems.map(item => (
                  <div key={item.order_id} className={`overdue-item ${item.priority}`}>
                    <div className="overdue-priority">
                      <span className={`priority-indicator ${item.priority}`} title={`${item.priority.charAt(0).toUpperCase() + item.priority.slice(1)}: ${item.days_overdue} day${item.days_overdue !== 1 ? 's' : ''} overdue`}></span>
                    </div>
                    <div className="overdue-main">
                      <div className="overdue-customer">
                        <span className="customer-name">{item.customer.name}</span>
                        <span className="customer-email">{item.customer.email}</span>
                      </div>
                      <div className="overdue-details">
                        <span className="equipment-name">{item.order_id_formatted} — {item.items.map(i => i.item_name).join(', ')}</span>
                        <span className="days-overdue">{item.days_overdue} day{item.days_overdue !== 1 ? 's' : ''} overdue</span>
                      </div>
                    </div>
                    <div className="overdue-fee">
                      <span className="fee-amount">{formatCurrency(item.late_fee)}</span>
                      <span className="fee-label">Late Fee</span>
                    </div>
                    <div className="overdue-actions">
                      <button
                        className="action-btn call-btn"
                        title={revealedPhones[item.order_id] ? "Hide phone" : "Show phone"}
                        onClick={() => togglePhone(item.order_id)}
                      >
                        {revealedPhones[item.order_id] ? (
                          <>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="12" height="12">
                              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                            </svg>
                            {item.customer.phone}
                          </>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                          </svg>
                        )}
                      </button>
                      <button className="action-btn reminder-btn" title="Send reminder" onClick={() => openReminderModal(item)}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                          <polyline points="22,6 12,13 2,6"/>
                        </svg>
                      </button>
                      <button className="action-btn resolve-btn" title="Mark as resolved" onClick={() => handleResolveItem(item.order_id)}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right: Templates & Activity */}
        <div className="templates-section">
          {/* Templates Card */}
          <div className="admin-card templates-card">
            <div className="card-header">
              <h2 className="card-title">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
                Email Templates
              </h2>
              <button className="btn btn-ghost btn-sm" onClick={openAddTemplateModal} title="Create new template">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"/>
                  <line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
              </button>
            </div>
            <div className="templates-list">
              {Object.entries(templates).map(([key, template]) => (
                <div key={key} className={`template-item ${selectedTemplate === key ? 'active' : ''}`} data-template={key}>
                  <div className="template-info">
                    <div className="template-name">{template.name}</div>
                    <div className="template-preview">{template.subject}</div>
                  </div>
                  <div className="template-actions">
                    <button className="template-btn use" onClick={() => handleUseTemplate(key)}>
                      Use
                    </button>
                    <button className="template-btn edit" onClick={() => openEditTemplateModal(key)} title="Edit template">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Activity Card */}
          <div className="admin-card activity-card">
            <div className="card-header">
              <h2 className="card-title">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12 6 12 12 16 14"/>
                </svg>
                Recent Activity
              </h2>
            </div>
            <div className="activity-list">
              {activities.length === 0 ? (
                <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--admin-text-muted)' }}>
                  No activities yet
                </div>
              ) : (
                activities.map((activity, idx) => (
                  <div key={idx} className="activity-item">
                    <div className={`activity-icon ${activity.type}`}>
                      {activity.type === 'sent' && (
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M22 2L11 13"/>
                          <path d="M22 2l-7 20-4-9-9-4 20-7z"/>
                        </svg>
                      )}
                      {activity.type === 'resolved' && (
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                      )}
                      {activity.type === 'call' && (
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                        </svg>
                      )}
                    </div>
                    <div className="activity-info">
                      <span className="activity-text">{activity.text}</span>
                      <span className="activity-time">{activity.time}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Reminder Modal */}
      {reminderModalOpen && (
        <div className="modal open" id="reminderModal">
          <div className="modal-overlay" onClick={() => setReminderModalOpen(false)}></div>
          <div className="modal-container reminder-modal">
            <div className="modal-header">
              <h2 className="modal-title">Send Reminder</h2>
              <button className="modal-close" onClick={() => setReminderModalOpen(false)} title="Close modal">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <div className="modal-body">
              {currentReminderId && overdueItems.find(i => i.order_id === currentReminderId) && (
                <>
                  <div className="reminder-recipient">
                    <label className="form-label">To:</label>
                    <div className="recipient-info">
                      <span className="recipient-name">{overdueItems.find(i => i.order_id === currentReminderId)?.customer.name}</span>
                      <span className="recipient-email">{overdueItems.find(i => i.order_id === currentReminderId)?.customer.email}</span>
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Template</label>
                    <select className="form-select" value={selectedTemplate} onChange={handleTemplateSelectChange} style={{ width: '100%' }}>
                      <option value="gentle">Gentle Reminder</option>
                      <option value="urgent">Urgent Notice</option>
                      <option value="final">Final Warning</option>
                      <option value="payment">Payment Request</option>
                      <option value="custom">Custom Message</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Subject</label>
                    <input type="text" className="form-input" value={emailSubject} onChange={(e) => setEmailSubject(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Message</label>
                    <textarea className="form-input email-body" rows="8" value={emailBody} onChange={(e) => setEmailBody(e.target.value)} />
                  </div>
                </>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setReminderModalOpen(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSendReminder}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 2L11 13"/>
                  <path d="M22 2l-7 20-4-9-9-4 20-7z"/>
                </svg>
                Send Reminder
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Template Modal */}
      {templateModalOpen && (
        <div className="modal open" id="templateModal">
          <div className="modal-overlay" onClick={() => setTemplateModalOpen(false)}></div>
          <div className="modal-container template-modal">
            <div className="modal-header">
              <h2 className="modal-title">{templateModalMode === 'edit' ? 'Edit Template' : 'Add Template'}</h2>
              <button className="modal-close" onClick={() => setTemplateModalOpen(false)} title="Close modal">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Template Name</label>
                <input type="text" className="form-input" placeholder="e.g. Friendly Follow-up" value={templateName} onChange={(e) => setTemplateName(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Subject Line</label>
                <input type="text" className="form-input" placeholder="Email subject..." value={templateSubject} onChange={(e) => setTemplateSubject(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Message Body</label>
                <textarea className="form-input email-body" rows="10" placeholder="Write your template message here..." value={templateBody} onChange={(e) => setTemplateBody(e.target.value)} />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setTemplateModalOpen(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSaveTemplate}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                  <polyline points="17 21 17 13 7 13 7 21"/>
                  <polyline points="7 3 7 8 15 8"/>
                </svg>
                Save Template
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default LateFeesPage;
