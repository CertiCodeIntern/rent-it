import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './css/ClientContactPage.css';

const API_BASE = import.meta.env.DEV ? '/api/rent-it' : '/rent-it';

function ClientContactContent() {
  const [user, setUser] = useState({ full_name: 'Valued Customer', email: '', membership_level: 'Customer' });
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitStatus, setSubmitStatus] = useState(null); // 'success' | 'warning' | null

  useEffect(() => {
    let mounted = true;
    fetch(`${API_BASE}/client/dashboard/dashboard.php`, { credentials: 'include' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!mounted) return;
        if (data?.user) {
          setUser(data.user);
          setFormData((prev) => ({
            ...prev,
            name: data.user.full_name || prev.name,
            email: data.user.email || prev.email,
          }));
        }
      })
      .catch(() => {})
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => { mounted = false; };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setSubmitStatus(null);
  };

  const handleCallSupport = () => {
    window.location.href = 'tel:+639123456789';
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.subject) {
      setSubmitStatus('warning');
      return;
    }
    if ((formData.message || '').trim().length < 8) {
      setSubmitStatus('warning');
      return;
    }
    setSubmitStatus('success');
    setFormData((prev) => ({ ...prev, subject: '', message: '' }));
  };

  const replyEmail = formData.email || user.email || 'your email';

  return (
    <div className="content-area contact-page">
      <div className="contact-page-header">
        <div>
          <p className="contact-eyebrow">Support Center</p>
          <h1 className="contact-page-title">We're here to help</h1>
          <p className="contact-page-sub">
            Reach us anytime. For members like you ({loading ? '…' : user.membership_level}), we prioritize fast responses.
          </p>
        </div>
        <div className="contact-status-card">
          <div className="contact-status-dot contact-status-dot-online" />
          <div>
            <p className="contact-status-label">Live support</p>
            <p className="contact-status-value">~15 min average response</p>
          </div>
        </div>
      </div>

      <section className="contact-grid">
        <article className="contact-card">
          <header className="contact-card-header">
            <div>
              <p className="contact-eyebrow">Create a ticket</p>
              <h2 className="contact-card-title">Send us a message</h2>
              <p className="contact-muted">We'll route this to the right team and email you updates.</p>
            </div>
            <span className="contact-badge">Priority: Standard</span>
          </header>
          <form className="contact-form" onSubmit={handleSubmit}>
            <div className="contact-form-row">
              <label htmlFor="contact-name">Full Name</label>
              <input
                type="text"
                id="contact-name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Your name"
                required
              />
            </div>
            <div className="contact-form-row">
              <label htmlFor="contact-email">Email Address</label>
              <input
                type="email"
                id="contact-email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                required
              />
            </div>
            <div className="contact-form-row">
              <label htmlFor="contact-subject">Subject</label>
              <select
                id="contact-subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                required
              >
                <option value="">Choose a topic</option>
                <option value="rental">Rental question</option>
                <option value="billing">Billing & payments</option>
                <option value="technical">Technical issue</option>
                <option value="returns">Returns & extensions</option>
                <option value="feedback">Product feedback</option>
              </select>
            </div>
            <div className="contact-form-row">
              <label htmlFor="contact-message">Message</label>
              <textarea
                id="contact-message"
                name="message"
                rows={5}
                value={formData.message}
                onChange={handleChange}
                placeholder="Tell us how we can help"
                required
              />
            </div>
            {submitStatus === 'warning' && (
              <p className="contact-form-message contact-form-message-warning">
                Please choose a subject and add a few more details so we can help.
              </p>
            )}
            {submitStatus === 'success' && (
              <p className="contact-form-message contact-form-message-success">
                Message sent! We will reply shortly.
              </p>
            )}
            <div className="contact-form-actions">
              <button type="button" className="contact-btn contact-btn-ghost" onClick={handleCallSupport}>
                Call support
              </button>
              <button type="submit" className="contact-btn contact-btn-primary">
                Send message
              </button>
            </div>
            <p className="contact-small contact-muted">
              We'll reply to {replyEmail}. SLA: <strong>within 4 business hours</strong>.
            </p>
          </form>
        </article>

        <article className="contact-card contact-info-card">
          <h3 className="contact-card-title">Quick help</h3>
          <div className="contact-info-list">
            <div className="contact-info-item">
              <div className="contact-info-icon">📧</div>
              <div>
                <p className="contact-info-title">Email us</p>
                <a href="mailto:support@rentit.ph">support@rentit.ph</a>
                <p className="contact-muted">We reply fast during business hours.</p>
              </div>
            </div>
            <div className="contact-info-item">
              <div className="contact-info-icon">📞</div>
              <div>
                <p className="contact-info-title">Call hotline</p>
                <a href="tel:+639123456789">+63 912 345 6789</a>
                <p className="contact-muted">Mon-Fri, 8:00 AM - 5:00 PM</p>
              </div>
            </div>
            <div className="contact-info-item">
              <div className="contact-info-icon">💬</div>
              <div>
                <p className="contact-info-title">Chat (beta)</p>
                <Link to="/wip">Open chat</Link>
                <p className="contact-muted">For quick fixes and status checks.</p>
              </div>
            </div>
          </div>
          <div className="contact-divider" />
          <div className="contact-support-meta">
            <div>
              <p className="contact-meta-label">Recent incidents</p>
              <p className="contact-meta-value contact-meta-value-success">All systems normal</p>
            </div>
            <div>
              <p className="contact-meta-label">Average resolution</p>
              <p className="contact-meta-value">2h 15m</p>
            </div>
          </div>
          <div className="contact-cta-stack">
            <Link className="contact-cta-link" to="/client/bookinghistory">View your recent bookings →</Link>
            <Link className="contact-cta-link" to="/client/returns">Request a return/extension →</Link>
          </div>
        </article>
      </section>
    </div>
  );
}

function ClientContactPage() {
  return <ClientContactContent />;
}

export default ClientContactPage;
