import React, { useEffect } from 'react';
import MainLayout from '../layouts/MainLayout';

const BASE_URL = '/rent-it';

function AboutPage() {
  useEffect(() => {
    const headers = document.querySelectorAll('.accordion-header');

    const clickHandlers = [];

    headers.forEach((header) => {
      const handler = () => {
        const isActive = header.classList.contains('active');

        document.querySelectorAll('.accordion-header').forEach((h) => {
          h.classList.remove('active');
          if (h.nextElementSibling) {
            h.nextElementSibling.classList.remove('show');
          }
        });

        if (!isActive) {
          header.classList.add('active');
          if (header.nextElementSibling) {
            header.nextElementSibling.classList.add('show');
          }
        }
      };

      clickHandlers.push({ header, handler });
      header.addEventListener('click', handler);
    });

    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.1,
    };

    const animateOnScroll = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          // play CSS animations once visible
          entry.target.style.animationPlayState = 'running';
          animateOnScroll.unobserve(entry.target);
        }
      });
    }, observerOptions);

    const animatedElements = document.querySelectorAll(
      '.animate-fade-up, .animate-fade-left, .animate-fade-right, .animate-scale'
    );

    animatedElements.forEach((el) => {
      if (el.closest('.about-hero')) return; // hero animates immediately
      el.style.animationPlayState = 'paused';
      animateOnScroll.observe(el);
    });

    return () => {
      clickHandlers.forEach(({ header, handler }) => {
        header.removeEventListener('click', handler);
      });
      animateOnScroll.disconnect();
    };
  }, []);

  return (
    <MainLayout>
        <section className="about-hero">
          <div className="container">
            <div className="about-hero-inner">
              <div className="about-hero-content">
                <span className="since-badge animate-fade-up delay-1">Since 2018</span>
                <h1 className="about-hero-title animate-fade-up delay-2">
                  Elevating Events with Professional Sound
                </h1>
                <p className="about-hero-desc animate-fade-up delay-3">
                  What started as a small garage project in 2018 has grown into the city's premier
                  videoke rental service. Our mission is to provide high-quality entertainment
                  through professional-grade videoke systems. From intimate family gatherings to
                  grand corporate events, we ensure your voice is heard in crystal clear quality.
                </p>
                <p className="about-hero-desc animate-fade-up delay-4">
                  With years of experience and thousands of successful events, RentIt has become the
                  trusted name for videoke rentals in Metro Manila and surrounding areas. Our
                  commitment to quality equipment, professional service, and customer satisfaction
                  sets us apart.
                </p>
                <div className="about-hero-cta animate-fade-up delay-5">
                  <a href="#team" className="btn-team">
                    Our Team
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                  </a>
                </div>
              </div>
              <div className="about-hero-image animate-fade-right delay-3">
                <img
                  src={`${BASE_URL}/assets/images/team/RentIT.png`}
                  alt="RentIt logo"
                  onError={(e) => {
                    if (e.target && e.target.parentElement) {
                      // fallback icon
                      e.target.parentElement.innerHTML = '<div style="font-size: 64px;">🎤</div>';
                    }
                  }}
                />
              </div>
            </div>
          </div>
        </section>

        <section className="core-values">
          <div className="container">
            <div className="core-values-header animate-fade-up">
              <h2 className="core-values-title">Our Core Values</h2>
              <div className="core-values-underline"></div>
            </div>

            <div className="about-values-grid">
              <article className="value-card animate-fade-up delay-1">
                <div className="value-icon blue">
                  <svg viewBox="0 0 24 24">
                    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                    <line x1="12" y1="19" x2="12" y2="23" />
                    <line x1="8" y1="23" x2="16" y2="23" />
                  </svg>
                </div>
                <h3 className="value-title">Quality Sound</h3>
                <p className="value-desc">
                  We use only top-tier audio equipment and calibrated speakers to ensure studio-grade
                  vocals at every venue. Our systems are regularly maintained and updated with the
                  latest technology to deliver crystal-clear sound that makes every performance
                  shine.
                </p>
              </article>

              <article className="value-card animate-fade-up delay-2">
                <div className="value-icon orange">
                  <svg viewBox="0 0 24 24">
                    <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                  </svg>
                </div>
                <h3 className="value-title">Reliable Service</h3>
                <p className="value-desc">
                  Prompt delivery and expert setup. Our technical team is on standby to ensure your
                  party never skips a beat. We arrive on time, every time, and provide full support
                  throughout your event. Our 24/7 hotline means help is always just a call away.
                </p>
              </article>

              <article className="value-card animate-fade-up delay-3">
                <div className="value-icon red">
                  <svg viewBox="0 0 24 24">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                </div>
                <h3 className="value-title">Customer Joy</h3>
                <p className="value-desc">
                  We don't just rent machines; we facilitate memories. Customer happiness is our
                  ultimate success metric. From the moment you book to the final pickup, we're
                  dedicated to making your experience seamless, enjoyable, and truly unforgettable.
                </p>
              </article>
            </div>
          </div>
        </section>

        <section className="team-section" id="team">
          <div className="container">
            <div className="team-header animate-fade-up">
              <h2 className="team-title">Meet Our Team</h2>
              <p className="team-subtitle">
                The passionate people behind RentIt who work tirelessly to make your events
                memorable.
              </p>
            </div>

            <div className="team-grid">
              {/* CEO */}
              <article className="team-card animate-fade-up delay-1">
                <div className="team-photo">👨‍💼</div>
                <div className="team-info">
                  <h3 className="team-name">Tom Oliver</h3>
                  <div className="team-role">Chief Executive Officer</div>
                  <p className="team-bio">
                    Visionary leader behind RentIt. Drives the company's strategic direction and
                    ensures every decision aligns with delivering the best videoke rental experience
                    in Metro Manila.
                  </p>
                </div>
              </article>

              {/* Project Manager */}
              <article className="team-card animate-fade-up delay-2">
                <div className="team-photo">👨‍💼</div>
                <div className="team-info">
                  <h3 className="team-name">Aaron Raven Aramil</h3>
                  <div className="team-role">Project Manager</div>
                  <p className="team-bio">
                    Keeps the team aligned and projects on track. Coordinates sprints, manages
                    timelines, and bridges communication between all departments to ensure smooth
                    delivery.
                  </p>
                </div>
              </article>

              {/* Lead Dev / Frontend */}
              <article className="team-card animate-fade-up delay-3">
                <div className="team-photo">👨‍💻</div>
                <div className="team-info">
                  <h3 className="team-name">Marc Steeven Parubrub</h3>
                  <div className="team-role">Lead Developer / Frontend Developer</div>
                  <p className="team-bio">
                    Leads the frontend architecture and development workflow. Builds responsive,
                    accessible interfaces and mentors the dev team to maintain high code quality
                    standards.
                  </p>
                </div>
              </article>

              {/* Full Stack Devs */}
              <article className="team-card animate-fade-up delay-4">
                <div className="team-photo">👨‍💻</div>
                <div className="team-info">
                  <h3 className="team-name">Miguel Ansano Sta. Maria</h3>
                  <div className="team-role">Full Stack Developer</div>
                  <p className="team-bio">
                    Works across the entire stack from database queries to pixel-perfect UI. Tackles
                    complex features end-to-end and ensures seamless integration between frontend and
                    backend.
                  </p>
                </div>
              </article>

              <article className="team-card animate-fade-up delay-1">
                <div className="team-photo">👨‍💻</div>
                <div className="team-info">
                  <h3 className="team-name">Von Asley Malillos</h3>
                  <div className="team-role">Full Stack Developer</div>
                  <p className="team-bio">
                    Versatile developer comfortable in both frontend and backend. Builds robust
                    features, optimizes performance, and contributes to the platform's scalability.
                  </p>
                </div>
              </article>

              {/* Frontend Dev */}
              <article className="team-card animate-fade-up delay-2">
                <div className="team-photo">👨‍💻</div>
                <div className="team-info">
                  <h3 className="team-name">Jude Vincent</h3>
                  <div className="team-role">Frontend Developer</div>
                  <p className="team-bio">
                    Crafts clean, interactive user interfaces with attention to detail. Focuses on
                    responsive layouts, smooth animations, and cross-browser compatibility.
                  </p>
                </div>
              </article>

              {/* Backend Devs */}
              <article className="team-card animate-fade-up delay-3">
                <div className="team-photo">👨‍💻</div>
                <div className="team-info">
                  <h3 className="team-name">Leander Ochea</h3>
                  <div className="team-role">Backend Developer</div>
                  <p className="team-bio">
                    Architects server-side logic, APIs, and database structures. Ensures data
                    integrity, security, and reliable performance behind every feature on the
                    platform.
                  </p>
                </div>
              </article>

              <article className="team-card animate-fade-up delay-4">
                <div className="team-photo">👨‍💻</div>
                <div className="team-info">
                  <h3 className="team-name">Sean Rey Beltran</h3>
                  <div className="team-role">Backend Developer</div>
                  <p className="team-bio">
                    Builds and maintains server-side services and database operations. Focuses on API
                    development, authentication flows, and backend optimization.
                  </p>
                </div>
              </article>

              <article className="team-card animate-fade-up delay-1">
                <div className="team-photo">👩‍💻</div>
                <div className="team-info">
                  <h3 className="team-name">Via Umali</h3>
                  <div className="team-role">Backend Developer</div>
                  <p className="team-bio">
                    Develops backend services and data processing logic. Ensures smooth server
                    operations and contributes to the platform's reliability and security.
                  </p>
                </div>
              </article>

              {/* UI/UX Designers */}
              <article className="team-card animate-fade-up delay-2">
                <div className="team-photo">
                  <a
                    href={`${BASE_URL}/assets/images/team/JOAQUIN GABRIEL CAMANGEG_UIUX.jpg`}
                    target="_blank"
                    rel="noopener"
                  >
                    <img
                      src={`${BASE_URL}/assets/images/team/JOAQUIN GABRIEL CAMANGEG_UIUX.jpg`}
                      alt="Joaquin Gabriel Camangeg"
                      onError={(e) => {
                        const photo = e.currentTarget.closest('.team-photo');
                        if (photo) photo.innerHTML = '🎨';
                      }}
                    />
                  </a>
                </div>
                <div className="team-info">
                  <h3 className="team-name">Joaquin Gabriel Camangeg</h3>
                  <div className="team-role">UI/UX Designer</div>
                  <p className="team-bio">
                    Designs intuitive user experiences and polished visual interfaces. Translates
                    user needs into clean, functional designs that make the platform a joy to use.
                  </p>
                </div>
              </article>

              <article className="team-card animate-fade-up delay-3">
                <div className="team-photo">
                  <a
                    href={`${BASE_URL}/assets/images/team/VEENY BAUTISTA_UI_UX.png`}
                    target="_blank"
                    rel="noopener"
                  >
                    <img
                      src={`${BASE_URL}/assets/images/team/VEENY BAUTISTA_UI_UX.png`}
                      alt="Veeny Bautista"
                      onError={(e) => {
                        const photo = e.currentTarget.closest('.team-photo');
                        if (photo) photo.innerHTML = '🎨';
                      }}
                    />
                  </a>
                </div>
                <div className="team-info">
                  <h3 className="team-name">Veeny Bautista</h3>
                  <div className="team-role">UI/UX Designer &amp; Support</div>
                  <p className="team-bio">
                    An all-around talent who designs user interfaces and provides support across
                    teams. Bridges the gap between design vision and practical implementation.
                  </p>
                </div>
              </article>

              <article className="team-card animate-fade-up delay-4">
                <div className="team-photo">👨‍🎨</div>
                <div className="team-info">
                  <h3 className="team-name">Andrei</h3>
                  <div className="team-role">UI/UX Designer</div>
                  <p className="team-bio">
                    Creates user-centered designs with a focus on accessibility and visual
                    consistency. Contributes to the design system and helps maintain brand cohesion.
                  </p>
                </div>
              </article>

              <article className="team-card animate-fade-up delay-1">
                <div className="team-photo">👩‍🎨</div>
                <div className="team-info">
                  <h3 className="team-name">Pauline Jayme</h3>
                  <div className="team-role">UI/UX Designer</div>
                  <p className="team-bio">
                    Focuses on user research and interaction design. Creates wireframes, prototypes,
                    and high-fidelity mockups that guide the development of seamless user flows.
                  </p>
                </div>
              </article>

              {/* Multimedia */}
              <article className="team-card animate-fade-up delay-2">
                <div className="team-photo">
                  <a
                    href={`${BASE_URL}/assets/images/team/ROXANNE LAZO_MULTIMEDIA.jpg`}
                    target="_blank"
                    rel="noopener"
                  >
                    <img
                      src={`${BASE_URL}/assets/images/team/ROXANNE LAZO_MULTIMEDIA.jpg`}
                      alt="Roxanne Lazo"
                      onError={(e) => {
                        const photo = e.currentTarget.closest('.team-photo');
                        if (photo) photo.innerHTML = '🎬';
                      }}
                    />
                  </a>
                </div>
                <div className="team-info">
                  <h3 className="team-name">Roxanne Lazo</h3>
                  <div className="team-role">Multimedia Specialist</div>
                  <p className="team-bio">
                    Produces visual content, graphics, and media assets for the platform and
                    marketing. Brings the RentIt brand to life through compelling visual
                    storytelling.
                  </p>
                </div>
              </article>

              <article className="team-card animate-fade-up delay-3">
                <div className="team-photo">👨‍🎬</div>
                <div className="team-info">
                  <h3 className="team-name">Franz Dela Cruz</h3>
                  <div className="team-role">Multimedia Specialist</div>
                  <p className="team-bio">
                    Creates engaging multimedia content including graphics, videos, and promotional
                    materials. Ensures all visual assets align with the brand's identity and
                    message.
                  </p>
                </div>
              </article>

              {/* QA */}
              <article className="team-card animate-fade-up delay-4">
                <div className="team-photo">👨‍🔧</div>
                <div className="team-info">
                  <h3 className="team-name">Aaron Briones</h3>
                  <div className="team-role">Quality Assurance</div>
                  <p className="team-bio">
                    Tests every feature rigorously before release. Identifies bugs, validates fixes,
                    and ensures the platform delivers a smooth, error-free experience for all users.
                  </p>
                </div>
              </article>

              <article className="team-card animate-fade-up delay-1">
                <div className="team-photo">👨‍🔧</div>
                <div className="team-info">
                  <h3 className="team-name">Prince Darrell Malunay Masa</h3>
                  <div className="team-role">Quality Assurance</div>
                  <p className="team-bio">
                    Conducts thorough testing across all platform features. Documents test cases,
                    performs regression testing, and helps maintain high reliability standards.
                  </p>
                </div>
              </article>

              {/* Data Analyst */}
              <article className="team-card animate-fade-up delay-2">
                <div className="team-photo">👩‍💻</div>
                <div className="team-info">
                  <h3 className="team-name">Samantha Faith Tan</h3>
                  <div className="team-role">Data Analyst</div>
                  <p className="team-bio">
                    Turns raw data into actionable insights. Analyzes booking trends, customer
                    behavior, and platform metrics to drive informed business and product decisions.
                  </p>
                </div>
              </article>

              {/* IT Support */}
              <article className="team-card animate-fade-up delay-3">
                <div className="team-photo">
                  <a
                    href={`${BASE_URL}/assets/images/team/TAN HUMPBREY NEIL A.- IT SUPPORT.jpg`}
                    target="_blank"
                    rel="noopener"
                  >
                    <img
                      src={`${BASE_URL}/assets/images/team/TAN HUMPBREY NEIL A.- IT SUPPORT.jpg`}
                      alt="Humpbrey Neil Tan"
                      onError={(e) => {
                        const photo = e.currentTarget.closest('.team-photo');
                        if (photo) photo.innerHTML = '🛠️';
                      }}
                    />
                  </a>
                </div>
                <div className="team-info">
                  <h3 className="team-name">Humpbrey Neil Tan</h3>
                  <div className="team-role">IT Support</div>
                  <p className="team-bio">
                    Keeps infrastructure running and resolves technical issues swiftly. Manages
                    deployments, server health, and provides hands-on support to keep the team
                    productive.
                  </p>
                </div>
              </article>
            </div>
          </div>
        </section>

        <section className="terms-section">
          <div className="container">
            <div className="terms-header animate-fade-up">
              <h2 className="terms-title">Terms of Service</h2>
              <p className="terms-updated">Last updated: January 15, 2026</p>
            </div>

            <div className="accordion">
              <div className="accordion-item animate-fade-up delay-1">
                <button className="accordion-header active" data-accordion="rental">
                  <span className="accordion-icon-wrap">
                    <svg viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                  </span>
                  <span className="accordion-title">1. Rental Duration &amp; Logistics</span>
                  <svg className="accordion-chevron" viewBox="0 0 24 24">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>
                <div className="accordion-content show">
                  <p>
                    Standard rental periods are <strong>24 hours</strong> starting from the time of
                    setup. Overtime rates apply at ₱500 per additional hour unless pre-arranged with
                    our team.
                  </p>
                  <p>
                    <strong>Delivery window:</strong> 8:00 AM - 12:00 PM
                  </p>
                  <p>
                    <strong>Pickup window:</strong> Next day 9:00 AM - 1:00 PM
                  </p>
                  <p>
                    The renter must be present at the time of delivery to sign the physical
                    inspection report. A valid government ID is required for verification. For
                    events requiring early setup (before 8 AM), please contact us at least 48 hours
                    in advance.
                  </p>
                  <p>
                    Extended rentals (2+ days) receive a 15% discount on daily rates. Weekly rentals
                    (7+ days) receive a 25% discount.
                  </p>
                </div>
              </div>

              <div className="accordion-item animate-fade-up delay-2">
                <button className="accordion-header" data-accordion="liability">
                  <span className="accordion-icon-wrap">
                    <svg viewBox="0 0 24 24">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="16" y1="13" x2="8" y2="13" />
                      <line x1="16" y1="17" x2="8" y2="17" />
                    </svg>
                  </span>
                  <span className="accordion-title">2. Liability &amp; Equipment Care</span>
                  <svg className="accordion-chevron" viewBox="0 0 24 24">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>
                <div className="accordion-content">
                  <p>
                    The renter assumes full responsibility for the equipment upon delivery. RentIt
                    is not liable for any injuries occurring during the operation of the equipment.
                  </p>
                  <p>
                    Equipment must be kept under cover and protected from weather elements including
                    rain, extreme heat, and humidity.
                  </p>
                  <p>
                    Only authorized personnel may move the main console once installed. Moving
                    equipment without proper training may result in damage.
                  </p>
                  <p>
                    Food and drinks must be kept at a distance of at least 5 feet from all
                    electrical components. Smoking near equipment is strictly prohibited.
                  </p>
                  <p>
                    Children must be supervised at all times when near the equipment. We recommend a
                    designated "equipment zone" for safety.
                  </p>
                </div>
              </div>

              <div className="accordion-item animate-fade-up delay-3">
                <button className="accordion-header" data-accordion="cancel">
                  <span className="accordion-icon-wrap">
                    <svg viewBox="0 0 24 24">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                  </span>
                  <span className="accordion-title">3. Cancellation Policy</span>
                  <svg className="accordion-chevron" viewBox="0 0 24 24">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>
                <div className="accordion-content">
                  <p>We understand plans change. Our refund structure is as follows:</p>
                  <div className="policy-grid">
                    <div className="policy-card">
                      <div className="policy-card-title">7+ Days Notice</div>
                      <div className="policy-card-text">
                        Full refund of deposit. No cancellation fee applies.
                      </div>
                    </div>
                    <div className="policy-card">
                      <div className="policy-card-title">3-6 Days Notice</div>
                      <div className="policy-card-text">
                        50% refund of deposit. Or reschedule for free within 30 days.
                      </div>
                    </div>
                    <div className="policy-card">
                      <div className="policy-card-title">Less than 48 Hours</div>
                      <div className="policy-card-text">
                        Deposit is non-refundable. One-time reschedule available within 14 days.
                      </div>
                    </div>
                    <div className="policy-card">
                      <div className="policy-card-title">No-Show</div>
                      <div className="policy-card-text">
                        Full payment is forfeited. Future bookings require full prepayment.
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="accordion-item animate-fade-up delay-4">
                <button className="accordion-header" data-accordion="damage">
                  <span className="accordion-icon-wrap">
                    <svg viewBox="0 0 24 24">
                      <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                    </svg>
                  </span>
                  <span className="accordion-title">4. Damage Fees</span>
                  <svg className="accordion-chevron" viewBox="0 0 24 24">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>
                <div className="accordion-content">
                  <p>
                    The following fees apply for damaged or lost items. All assessments are made
                    upon equipment return:
                  </p>
                  <table className="damage-table">
                    <thead>
                      <tr>
                        <th>Item</th>
                        <th>Replacement Fee</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>Wireless Microphone (Per unit)</td>
                        <td>₱3,500</td>
                      </tr>
                      <tr>
                        <td>Speaker Unit</td>
                        <td>₱8,000 - ₱15,000</td>
                      </tr>
                      <tr>
                        <td>LCD Display / Monitor</td>
                        <td>₱12,000</td>
                      </tr>
                      <tr>
                        <td>Remote Control / Tablet Interface</td>
                        <td>₱2,500</td>
                      </tr>
                      <tr>
                        <td>Main Karaoke Console</td>
                        <td>₱25,000 - ₱45,000</td>
                      </tr>
                      <tr>
                        <td>Cables &amp; Accessories</td>
                        <td>₱500 - ₱1,500</td>
                      </tr>
                    </tbody>
                  </table>
                  <p className="damage-note">
                    Minor scratches and normal wear are expected and not charged. Major cosmetic
                    damage is assessed at 30% of replacement cost.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
    </MainLayout>
  );
}

export default AboutPage;
