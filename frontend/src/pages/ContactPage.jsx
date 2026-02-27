import React, { useState } from 'react';
import MainLayout from '../layouts/MainLayout';
import './ContactPage.css';

function ContactPage() {
  const [formState, setFormState] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Mirror the simple behavior from contactus.html
    alert('Thank you for your message! We will get back to you soon.');
    setFormState({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <MainLayout>
      <section className="contact-hero">
        <div className="container">
          <h1 className="contact-hero-title">Contact Us</h1>
          <p className="contact-hero-subtitle">
            Have questions? We'd love to hear from you. Send us a message and we'll respond as soon
            as possible.
          </p>
        </div>
      </section>

      <section className="page-content">
        <div className="container">
          <div className="contact-grid">
            <div className="contact-form-wrapper">
              <form className="contact-form" id="contactForm" onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="name">Full Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    placeholder="John Doe"
                    required
                    value={formState.name}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="email">Email Address</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="john@example.com"
                    required
                    value={formState.email}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="subject">Subject</label>
                  <select
                    id="subject"
                    name="subject"
                    required
                    value={formState.subject}
                    onChange={handleChange}
                  >
                    <option value="">Select a topic</option>
                    <option value="general">General Inquiry</option>
                    <option value="support">Technical Support</option>
                    <option value="billing">Billing Question</option>
                    <option value="feedback">Feedback</option>
                    <option value="partnership">Partnership</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="message">Message</label>
                  <textarea
                    id="message"
                    name="message"
                    rows="5"
                    placeholder="Tell us how we can help..."
                    required
                    value={formState.message}
                    onChange={handleChange}
                  />
                </div>
                <button type="submit" className="btn btn-primary btn-lg btn-block">
                  Send Message
                  <span className="btn-icon">→</span>
                </button>
              </form>
            </div>

            <div className="contact-info">
              <div className="info-card">
                <div className="info-icon">📧</div>
                <h3>Email Us</h3>
                <p>For general inquiries and support</p>
                <a href="mailto:support@rentit.ph">support@rentit.ph</a>
              </div>

              <div className="info-card">
                <div className="info-icon">📞</div>
                <h3>Call Us</h3>
                <p>Mon-Fri from 8am to 5pm</p>
                <a href="tel:+639123456789">+63 912 345 6789</a>
              </div>

              <div className="info-card">
                <div className="info-icon">📍</div>
                <h3>Visit Us</h3>
                <p>Come say hello at our office</p>
                <address>
                  123 Business Center
                  <br />
                  Manila, Philippines
                </address>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="faq-section" id="faq-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Frequently Asked Questions</h2>
            <p className="section-subtitle">Quick answers to common questions.</p>
          </div>
          <div className="faq-grid">
            <div className="faq-item">
              <h4>How do I get started?</h4>
              <p>
                Create a free account, browse our catalog of videoke machines, select your preferred
                model and rental dates, then place your order. We handle delivery and setup right to
                your doorstep.
              </p>
            </div>
            <div className="faq-item">
              <h4>Are there any subscription fees?</h4>
              <p>
                No subscription or membership fees. You only pay for the rental period you book.
                Pricing is transparent — what you see on our catalog is what you pay, plus a small
                delivery fee based on your area.
              </p>
            </div>
            <div className="faq-item">
              <h4>What payment methods do you accept?</h4>
              <p>
                We operate on a Cash on Delivery (COD) basis. Pay in cash when our team delivers the
                equipment to your location. No online payment or credit card required.
              </p>
            </div>
            <div className="faq-item">
              <h4>Can I cancel or reschedule my booking?</h4>
              <p>
                Yes. You can cancel or reschedule your booking up to 24 hours before the scheduled
                delivery at no charge. Cancellations within 24 hours may incur a small fee.
              </p>
            </div>
            <div className="faq-item">
              <h4>How are returns handled?</h4>
              <p>
                Our team picks up the equipment from your location at the end of your rental period.
                Just make sure the items are accessible and in the same condition as when delivered.
              </p>
            </div>
            <div className="faq-item">
              <h4>What happens if equipment is damaged?</h4>
              <p>
                Normal wear and tear is covered. However, the renter is liable for any significant
                damage, loss, or theft of the equipment. Repair or replacement costs will be
                assessed and billed accordingly.
              </p>
            </div>
            <div className="faq-item">
              <h4>Do I need to present a valid ID?</h4>
              <p>
                Yes. A valid government-issued ID is required upon delivery for verification
                purposes. This helps us ensure the security of our equipment and our customers.
              </p>
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}

export default ContactPage;
