import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Link } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';

const BASE_URL = '/rent-it';
const PUBLIC_BASE = import.meta.env.DEV ? 'http://localhost/rent-it' : '/rent-it';

const MACHINES = [
  {
    id: 'mini-star',
    title: 'Mini Star',
    subtitle: 'Budget friendly & compact',
    price: '₱800',
    image: `${PUBLIC_BASE}/assets/images/ministar.jpg`,
    alt: 'Mini Star Videoke Machine',
    specs: [
      '30,000+ Classic Songs',
      '2 Wired Microphones',
      'Portable 8" Speaker',
      'Connect to your own TV',
    ],
    rentLabel: 'Rent Mini Star',
    delayClass: 'animate-delay-1',
  },
  {
    id: 'platinum-pro',
    title: 'Platinum Pro',
    subtitle: 'Crystal clear acoustics',
    price: '₱1,500',
    image: `${PUBLIC_BASE}/assets/images/platinumpro.webp`,
    alt: 'Platinum Pro Videoke Machine',
    specs: [
      '50,000+ Songs (Updated Monthly)',
      '2 UHF Wireless Microphones',
      '12" Active Speaker System',
      '24" LED TV Display Included',
    ],
    rentLabel: 'Rent Platinum Pro',
    delayClass: 'animate-delay-2',
  },
  {
    id: 'party-box-x',
    title: 'Party Box X',
    subtitle: 'For large gatherings',
    price: '₱2,500',
    image: `${PUBLIC_BASE}/assets/images/partyboxx.webp`,
    alt: 'Party Box X Videoke Machine',
    specs: [
      '70,000+ Songs (Full HD Video)',
      '4 UHF Wireless Microphones',
      'Dual 15" Speakers + Subwoofer',
      '43" Smart TV on Stand',
    ],
    rentLabel: 'Rent Party Box X',
    delayClass: 'animate-delay-3',
  },
];

const DELIVERY_FEATURES = [
  {
    id: 'setup-time',
    label: 'Setup Time',
    value: '15 mins',
    iconPath:
      'M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z',
  },
  {
    id: 'avg-delivery',
    label: 'Avg Delivery',
    value: '45 mins',
    iconPath:
      'M1 3h15v13H1zM16 8h4l3 4v5h-7V8zM5.5 21a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zM18.5 21a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z',
  },
];

function HomePage() {
  const location = useLocation();

  useEffect(() => {
    if (!location.hash) return;

    const id = location.hash.replace('#', '');
    const el = document.getElementById(id);
    if (!el) return;

    const y = el.getBoundingClientRect().top + window.scrollY - 80;
    window.scrollTo({ top: y, behavior: 'smooth' });
  }, [location.hash]);

  useEffect(() => {
    const elements = document.querySelectorAll('.animate-on-scroll');

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 }
    );

    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const stats = document.querySelectorAll('.stat-num');
    if (stats.length === 0) return;

    const animateCounter = (element) => {
      const originalText = element.textContent;
      const hasPlus = originalText.includes('+');
      const hasSlash = originalText.includes('/');
      const hasPercent = originalText.includes('%');

      let num = parseFloat(originalText.replace(/[^0-9.]/g, ''));
      if (Number.isNaN(num)) return;

      const duration = 1500;
      const start = 0;
      const startTime = performance.now();

      const update = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeProgress = 1 - Math.pow(1 - progress, 3);

        const current = start + (num - start) * easeProgress;

        if (hasSlash) {
          element.textContent = `${current.toFixed(1)}/5`;
        } else if (hasPercent) {
          element.textContent = `${Math.round(current)}%`;
        } else if (hasPlus) {
          element.textContent = `${Math.round(current).toLocaleString()}+`;
        } else {
          element.textContent = originalText;
        }

        if (progress < 1) {
          requestAnimationFrame(update);
        } else {
          element.textContent = originalText;
        }
      };

      requestAnimationFrame(update);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );

    stats.forEach((stat) => observer.observe(stat));

    return () => observer.disconnect();
  }, []);

  return (
    <MainLayout>
      {/* HERO SECTION */}
      <section className="hero">
        <div className="container">
          <div className="hero-inner">
            <span className="pill">New Arrivals: Gen 5 Systems</span>
            <h1 className="hero-title">
              Bring the Party <span className="accent">Home</span>
            </h1>
            <p className="hero-sub">
              High-quality videoke machines with 50k+ songs and wireless mics delivered to your
              doorstep. Crystal clear sound, professional setup.
            </p>
            <div className="hero-cta">
              <a href="#machines" className="btn btn-primary">
                Browse Machines
              </a>
              <a href="#pricing" className="btn btn-outline">
                View Packages
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* CHOOSE YOUR MACHINE */}
      <section id="machines" className="choose">
        <div className="container">
          <div className="tabs-row">
            <div className="section-header animate-on-scroll">
              <h2 className="section-title">Choose Your Machine</h2>
              <p className="section-subtitle">
                Select from our range of high-performance videoke setups.
              </p>
            </div>
          </div>
          <div className="cards">
            {MACHINES.map((machine) => (
              <article
                key={machine.id}
                className={`card animate-on-scroll ${machine.delayClass}`.trim()}
              >
                <div className="card-media">
                  <img src={machine.image} alt={machine.alt} />
                </div>
                <div className="card-body">
                  <div className="card-head">
                    <div>
                      <h3 className="card-title">{machine.title}</h3>
                      <p className="card-subtitle">{machine.subtitle}</p>
                    </div>
                    <div className="card-price">
                      <div className="price-amount">{machine.price}</div>
                      <div className="price-label">Starting Price</div>
                    </div>
                  </div>
                  <ul className="card-specs">
                    {machine.specs.map((spec) => (
                      <li key={spec}>{spec}</li>
                    ))}
                  </ul>
                  <div className="card-footer">
                    <a href={`${BASE_URL}/client/auth/login.php`} className="btn btn-primary">
                      {machine.rentLabel}
                    </a>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* DELIVERY SECTION (left column only, same as index.php) */}
      <section id="pricing" className="delivery">
        <div className="container delivery-grid">
          <div className="delivery-left animate-on-scroll">
            <h2>Fast &amp; Reliable Delivery</h2>
            <p className="delivery-sub">
              We deliver, set up, and test the equipment for you. Enter your location to get an
              instant estimate of delivery fees and setup times.
            </p>

            <div className="feature-stack">
              {DELIVERY_FEATURES.map((feature) => (
                <div key={feature.id} className="feature-box">
                  <div className="feature-icon">
                    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d={feature.iconPath} />
                    </svg>
                  </div>
                  <div className="feature-content">
                    <div className="feature-label">{feature.label}</div>
                    <div className="feature-value">{feature.value}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="delivery-right animate-on-scroll">
            <div className="delivery-illustration">
              <svg
                viewBox="0 0 200 160"
                xmlns="http://www.w3.org/2000/svg"
                className="delivery-truck-icon"
              >
                {/* Road */}
                <rect x="0" y="130" width="200" height="6" rx="3" fill="rgba(255,255,255,0.15)" />
                <rect x="20" y="132" width="18" height="2" rx="1" fill="rgba(255,255,255,0.3)" />
                <rect x="60" y="132" width="30" height="2" rx="1" fill="rgba(255,255,255,0.3)" />
                <rect x="120" y="132" width="14" height="2" rx="1" fill="rgba(255,255,255,0.3)" />
                <rect x="155" y="132" width="24" height="2" rx="1" fill="rgba(255,255,255,0.3)" />

                {/* Truck body */}
                <rect x="50" y="70" width="80" height="55" rx="6" fill="currentColor" opacity="0.9" />

                {/* Cab */}
                <path
                  d="M130 85 L155 85 L165 105 L165 125 L130 125 Z"
                  fill="currentColor"
                  opacity="0.75"
                />

                {/* Windshield */}
                <path
                  d="M133 88 L152 88 L160 104 L133 104 Z"
                  fill="rgba(255,255,255,0.2)"
                />

                {/* Cargo area detail */}
                <rect x="55" y="78" width="70" height="4" rx="2" fill="rgba(255,255,255,0.15)" />
                <rect x="55" y="86" width="40" height="3" rx="1.5" fill="rgba(255,255,255,0.1)" />

                {/* Music notes floating from cargo */}
                <text
                  x="72"
                  y="60"
                  fontSize="16"
                  fill="currentColor"
                  opacity="0.7"
                  className="note-1"
                >
                  ♪
                </text>
                <text
                  x="95"
                  y="48"
                  fontSize="20"
                  fill="currentColor"
                  opacity="0.5"
                  className="note-2"
                >
                  ♫
                </text>
                <text
                  x="110"
                  y="55"
                  fontSize="14"
                  fill="currentColor"
                  opacity="0.6"
                  className="note-3"
                >
                  ♪
                </text>

                {/* Headlight */}
                <circle cx="163" cy="115" r="4" fill="#FFC107" opacity="0.9" />
                <circle cx="163" cy="115" r="6" fill="#FFC107" opacity="0.2" />

                {/* Wheels */}
                <circle
                  cx="75"
                  cy="130"
                  r="12"
                  fill="#1a1a2e"
                  stroke="currentColor"
                  strokeWidth="3"
                />
                <circle cx="75" cy="130" r="5" fill="currentColor" opacity="0.3" />
                <circle
                  cx="150"
                  cy="130"
                  r="12"
                  fill="#1a1a2e"
                  stroke="currentColor"
                  strokeWidth="3"
                />
                <circle cx="150" cy="130" r="5" fill="currentColor" opacity="0.3" />

                {/* Speed lines */}
                <rect
                  x="15"
                  y="100"
                  width="25"
                  height="2"
                  rx="1"
                  fill="currentColor"
                  opacity="0.3"
                  className="speed-1"
                />
                <rect
                  x="10"
                  y="110"
                  width="30"
                  height="2"
                  rx="1"
                  fill="currentColor"
                  opacity="0.2"
                  className="speed-2"
                />
                <rect
                  x="20"
                  y="120"
                  width="20"
                  height="2"
                  rx="1"
                  fill="currentColor"
                  opacity="0.25"
                  className="speed-3"
                />

                {/* Package icon on truck */}
                <rect
                  x="85"
                  y="95"
                  width="24"
                  height="22"
                  rx="3"
                  fill="rgba(255,255,255,0.2)"
                />
                <line
                  x1="97"
                  y1="95"
                  x2="97"
                  y2="117"
                  stroke="rgba(255,255,255,0.3)"
                  strokeWidth="1.5"
                />
                <line
                  x1="85"
                  y1="106"
                  x2="109"
                  y2="106"
                  stroke="rgba(255,255,255,0.3)"
                  strokeWidth="1.5"
                />
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* STATS SECTION */}
      <section className="stats">
        <div className="container stats-grid">
          <div className="stat animate-on-scroll">
            <div className="stat-num">5,000+</div>
            <div className="stat-label">Parties Hosted</div>
          </div>
          <div className="stat animate-on-scroll animate-delay-1">
            <div className="stat-num">4.9/5</div>
            <div className="stat-label">Customer Rating</div>
          </div>
          <div className="stat animate-on-scroll animate-delay-2">
            <div className="stat-num">24/7</div>
            <div className="stat-label">Live Support</div>
          </div>
          <div className="stat animate-on-scroll animate-delay-3">
            <div className="stat-num">100%</div>
            <div className="stat-label">Uptime Guarantee</div>
          </div>
        </div>
      </section>

      {/* CTA SECTION - simplified for React (no PHP session) */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-card animate-on-scroll">
            <div className="cta-content">
              <h2 className="cta-title">Ready to Book Your Next Event?</h2>
              <p className="cta-subtitle">
                Create an account to access our full catalog, manage bookings, and enjoy
                exclusive member benefits. Already have an account? Sign in to continue where you
                left off.
              </p>
              <div className="cta-actions">
                <a
                  href={`${BASE_URL}/client/auth/login.php#register`}
                  className="btn btn-primary"
                >
                  Create Account
                </a>
                <a
                  href={`${BASE_URL}/client/auth/login.php#login`}
                  className="btn btn-outline"
                >
                  Sign In
                </a>
              </div>
              <div className="cta-benefits">
                <div className="cta-benefit">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>Priority Booking</span>
                </div>
                <div className="cta-benefit">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>Member Discounts</span>
                </div>
                <div className="cta-benefit">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>Booking History</span>
                </div>
              </div>
            </div>
            <div className="cta-visual">
              <div className="cta-icon">🎤</div>
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}

export default HomePage;

