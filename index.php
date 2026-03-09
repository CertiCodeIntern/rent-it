<?php
// filepath: c:\xampp\htdocs\rent-it\index.php
session_start();

// Define base path for consistent URLs
define('BASE_URL', '/rent-it');

// Check if user is already logged in
$isLoggedIn = isset($_SESSION['user_id']);
$userName = $_SESSION['user_name'] ?? '';
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="Rentertain - High-quality videoke machines with 50k+ songs and wireless mics delivered to your doorstep.">
    <title>Rentertain - Premium Videoke Rentals</title>
    
    <!-- Google Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    
    <!-- Favicon -->
    <link rel="icon" type="image/svg+xml" href="<?= BASE_URL ?>/assets/images/Logo%20LMode.svg">

    <!-- Stylesheets (Order: Theme -> Layout) -->
    <link rel="stylesheet" href="<?= BASE_URL ?>/shared/css/theme.css">
    <link rel="stylesheet" href="<?= BASE_URL ?>/landingpage/css/index.css">
    
    <!-- Theme Script (Prevents flash of wrong theme) -->
    <script src="<?= BASE_URL ?>/shared/js/theme.js"></script>
</head>
<body>
    <div class="page-skeleton-overlay" data-skeleton="marketing" aria-hidden="true">
        <div class="page-skeleton-marketing">
            <div class="marketing-topbar">
                <span class="marketing-logo skeleton-shape"></span>
                <div class="marketing-nav">
                    <span class="marketing-pill skeleton-shape w-20"></span>
                    <span class="marketing-pill skeleton-shape w-25"></span>
                    <span class="marketing-pill skeleton-shape w-20"></span>
                    <span class="marketing-pill skeleton-shape w-30"></span>
                </div>
                <span class="marketing-cta skeleton-shape w-25"></span>
            </div>
            <div class="marketing-hero">
                <div class="marketing-hero-text">
                    <span class="marketing-line skeleton-shape w-70"></span>
                    <span class="marketing-line skeleton-shape w-80"></span>
                    <span class="marketing-line skeleton-shape w-60"></span>
                    <div class="marketing-actions">
                        <span class="marketing-button skeleton-shape w-25"></span>
                        <span class="marketing-button skeleton-shape w-20"></span>
                    </div>
                </div>
                <span class="marketing-hero-media skeleton-shape"></span>
            </div>
            <div class="marketing-cards">
                <span class="marketing-card skeleton-shape"></span>
                <span class="marketing-card skeleton-shape"></span>
                <span class="marketing-card skeleton-shape"></span>
            </div>
        </div>
    </div>
    <!-- ============================
         SITE HEADER
         ============================ -->
    <header class="site-header">
        <div class="container header-inner">
            <!-- Hamburger (Mobile) -->
            <button class="hamburger" id="hamburgerBtn" aria-label="Open menu" aria-expanded="false">&#9776;</button>
            
            <!-- Brand -->
            <a href="<?= BASE_URL ?>/" class="brand">
                <img
                    src="<?= BASE_URL ?>/assets/images/Logo%20with%20Text%20LMode.svg"
                    alt="Rentertain"
                    class="brand-logo-img"
                    data-light-src="<?= BASE_URL ?>/assets/images/Logo%20with%20Text%20LMode.svg"
                    data-dark-src="<?= BASE_URL ?>/assets/images/Logo%20with%20Text%20DMode.svg"
                    data-mobile-light-src="<?= BASE_URL ?>/assets/images/Logo%20LMode.svg"
                    data-mobile-dark-src="<?= BASE_URL ?>/assets/images/Logo%20DMode.svg"
                >
            </a>
            
            <!-- Desktop Navigation -->
            <nav class="main-nav">
                <a href="<?= BASE_URL ?>/" class="nav-link active">Home</a>
                <a href="#machines" class="nav-link">Rentals</a>
                <a href="#pricing" class="nav-link">Pricing</a>
                <a href="<?= BASE_URL ?>/pages/aboutus.html" class="nav-link">About</a>
                <a href="<?= BASE_URL ?>/pages/contactus.html" class="nav-link">Contact</a>
            </nav>
            
            <!-- Header Actions -->
            <div class="header-actions">
                <!-- Theme Toggle -->
                <button class="theme-toggle" id="themeToggle" aria-label="Toggle theme">
                    <svg class="sun-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="5"/>
                        <line x1="12" y1="1" x2="12" y2="3"/>
                        <line x1="12" y1="21" x2="12" y2="23"/>
                        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                        <line x1="1" y1="12" x2="3" y2="12"/>
                        <line x1="21" y1="12" x2="23" y2="12"/>
                        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
                    </svg>
                    <svg class="moon-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                    </svg>
                </button>
                <a href="<?= BASE_URL ?>/client/auth/login.php#login" class="mobile-profile-link" aria-label="Profile">
                    <svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                        <path d="M20 21a8 8 0 0 0-16 0"></path>
                        <circle cx="12" cy="8" r="4"></circle>
                    </svg>
                </a>

                <a href="<?= BASE_URL ?>/client/auth/login.php#login" class="btn btn-outline">Login</a>
                <a href="<?= BASE_URL ?>/client/auth/login.php#register" class="btn btn-primary">Register</a>
            </div>
        </div>
        
        <!-- Mobile Navigation -->
        <nav class="mobile-nav" id="mobileNav" aria-label="Mobile navigation">
            <div class="sidebar-logo">
                <a href="<?= BASE_URL ?>/" class="sidebar-logo-link">
                    <img
                        src="<?= BASE_URL ?>/assets/images/Logo%20with%20Text%20LMode.svg"
                        alt="Rentertain"
                        class="sidebar-logo-icon brand-logo-img"
                        data-light-src="<?= BASE_URL ?>/assets/images/Logo%20with%20Text%20LMode.svg"
                        data-dark-src="<?= BASE_URL ?>/assets/images/Logo%20with%20Text%20DMode.svg"
                        data-mobile-light-src="<?= BASE_URL ?>/assets/images/Logo%20with%20Text%20LMode.svg"
                        data-mobile-dark-src="<?= BASE_URL ?>/assets/images/Logo%20with%20Text%20DMode.svg"
                    >
                </a>
            </div>
            <div class="sidebar-nav">
                <a href="<?= BASE_URL ?>/" class="mobile-link sidebar-nav-item active">
                    <span class="sidebar-nav-icon">
                        <svg viewBox="0 0 24 24" aria-hidden="true">
                            <path d="M3 10.5 12 3l9 7.5"></path>
                            <path d="M5 9.5V21h14V9.5"></path>
                        </svg>
                    </span>
                    <span class="sidebar-nav-label">Home</span>
                </a>
                <a href="#machines" class="mobile-link sidebar-nav-item">
                    <span class="sidebar-nav-icon">
                        <svg viewBox="0 0 24 24" aria-hidden="true">
                            <rect x="4" y="5" width="16" height="14" rx="2"></rect>
                            <path d="M8 9h8"></path>
                            <path d="M8 13h5"></path>
                        </svg>
                    </span>
                    <span class="sidebar-nav-label">Rentals</span>
                </a>
                <a href="#pricing" class="mobile-link sidebar-nav-item">
                    <span class="sidebar-nav-icon">
                        <svg viewBox="0 0 24 24" aria-hidden="true">
                            <path d="M12 1v22"></path>
                            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                        </svg>
                    </span>
                    <span class="sidebar-nav-label">Pricing</span>
                </a>
                <a href="<?= BASE_URL ?>/pages/aboutus.html" class="mobile-link sidebar-nav-item">
                    <span class="sidebar-nav-icon">
                        <svg viewBox="0 0 24 24" aria-hidden="true">
                            <circle cx="12" cy="12" r="9"></circle>
                            <path d="M12 10v6"></path>
                            <path d="M12 7h.01"></path>
                        </svg>
                    </span>
                    <span class="sidebar-nav-label">About</span>
                </a>
                <a href="<?= BASE_URL ?>/pages/contactus.html" class="mobile-link sidebar-nav-item">
                    <span class="sidebar-nav-icon">
                        <svg viewBox="0 0 24 24" aria-hidden="true">
                            <path d="M4 6h16v12H4z"></path>
                            <path d="m4 7 8 6 8-6"></path>
                        </svg>
                    </span>
                    <span class="sidebar-nav-label">Contact</span>
                </a>
            </div>
        </nav>
    </header>

        <main>
        <section class="landing-search-section">
            <div class="container">
                <div class="landing-search-bar animate-on-scroll" role="search" aria-label="Search machine models">
                    <svg class="landing-search-icon" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                        <circle cx="11" cy="11" r="7"></circle>
                        <line x1="20" y1="20" x2="16.65" y2="16.65"></line>
                    </svg>
                    <input type="search" class="landing-search-input" placeholder="Search machine models..." aria-label="Search machine models" autocomplete="off">
                </div>
            </div>
        </section>
        <section class="landing-banner-section">
            <div class="container">
                <div class="landing-banner animate-on-scroll">
                    <img src="<?= BASE_URL ?>/assets/images/Banner.jpg" alt="Rentertain promo banner">
                </div>
            </div>
        </section>

        <section class="landing-tagline-section">
            <div class="container">
                <div class="landing-tagline-wrap animate-on-scroll">
                    <span class="landing-arrival-pill">New Arrivals: Gen 5 Systems</span>
                    <h1 class="landing-tagline">Bring the Party <span class="landing-tagline-accent">Home</span></h1>
                    <p class="landing-tagline-subtitle">High-quality videoke machines with 50k+ songs and wireless mics delivered to your doorstep. Crystal clear sound, professional setup.</p>
                </div>
            </div>
        </section>
        <section id="pricing" class="hot-deals-section">
            <div class="container">
                <div class="landing-section-shell">
                    <div class="section-header animate-on-scroll">
                        <h2 class="section-title">Hot Deals</h2>
                        <p class="section-subtitle">Top picks this week with the best value for home parties.</p>
                    </div>
                    <div class="deals-carousel" data-carousel="hot-deals">
                        <div class="deals-viewport">
                            <div class="deals-grid">
                                <article class="deal-card animate-on-scroll animate-delay-1">
                                    <div class="deal-image-wrap">
                                        <img src="<?= BASE_URL ?>/assets/images/items/Platinum%20Pro.png" alt="Platinum Pro">
                                    </div>
                                    <div class="deal-content">
                                        <h3 class="deal-title">Platinum Pro</h3>
                                        <div class="deal-price">&#8369;1,500</div>
                                        <div class="deal-rating"><span class="deal-stars">&#9733;&#9733;&#9733;&#9733;&#9733;</span> <span>(124)</span></div>
                                    </div>
                                </article>
                                <article class="deal-card animate-on-scroll animate-delay-2">
                                    <div class="deal-image-wrap">
                                        <img src="<?= BASE_URL ?>/assets/images/items/Party%20Box%20X.png" alt="Party Box X">
                                    </div>
                                    <div class="deal-content">
                                        <h3 class="deal-title">Party Box X</h3>
                                        <div class="deal-price">&#8369;1,500</div>
                                        <div class="deal-rating"><span class="deal-stars">&#9733;&#9733;&#9733;&#9733;&#9733;</span> <span>(124)</span></div>
                                    </div>
                                </article>
                                <article class="deal-card animate-on-scroll animate-delay-3">
                                    <div class="deal-image-wrap">
                                        <img src="<?= BASE_URL ?>/assets/images/items/Mini%20Star.png" alt="Mini Star">
                                    </div>
                                    <div class="deal-content">
                                        <h3 class="deal-title">Mini Star</h3>
                                        <div class="deal-price">&#8369;800</div>
                                        <div class="deal-rating"><span class="deal-stars">&#9733;&#9733;&#9733;&#9733;&#9733;</span> <span>(124)</span></div>
                                    </div>
                                </article>
                                <article class="deal-card animate-on-scroll animate-delay-4">
                                    <div class="deal-image-wrap">
                                        <img src="<?= BASE_URL ?>/assets/images/items/Platinum%20Pro.png" alt="Platinum Pro Plus">
                                    </div>
                                    <div class="deal-content">
                                        <h3 class="deal-title">Platinum Pro Plus</h3>
                                        <div class="deal-price">&#8369;1,800</div>
                                        <div class="deal-rating"><span class="deal-stars">&#9733;&#9733;&#9733;&#9733;&#9733;</span> <span>(124)</span></div>
                                    </div>
                                </article>
                            </div>
                        </div>
                        <div class="deals-carousel-controls" aria-label="Hot deals carousel controls" hidden>
                            <button type="button" class="deals-carousel-btn prev" aria-label="Previous deals">&#8592;</button>
                            <div class="deals-carousel-dots" aria-label="Hot deals carousel pagination"></div>
                            <button type="button" class="deals-carousel-btn next" aria-label="Next deals">&#8594;</button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
        <section id="machines" class="choose-machine-section">
            <div class="container">
                <div class="landing-section-shell">
                    <div class="section-header section-header-row animate-on-scroll">
                        <div>
                            <h2 class="section-title">Choose Your Machine</h2>
                            <p class="section-subtitle">Select from our range of high-performance videoke setups.</p>
                        </div>
                        <div class="machine-filters" role="tablist" aria-label="Machine type filters">
                            <button type="button" class="machine-filter-btn active" data-filter="all" role="tab" aria-selected="true">All Machines</button>
                            <button type="button" class="machine-filter-btn" data-filter="standard" role="tab" aria-selected="false">Standard</button>
                            <button type="button" class="machine-filter-btn" data-filter="premium" role="tab" aria-selected="false">Premium</button>
                        </div>
                    </div>
                    <div class="products-grid landing-products-grid" id="landingProductsGrid">
                        <article class="product-card animate-on-scroll animate-delay-1" data-machine-type="standard">
                            <div class="product-image-wrap">
                                <img src="<?= BASE_URL ?>/assets/images/items/Mini%20Star.png" alt="Mini Star" class="product-image">
                            </div>
                            <div class="product-content">
                                <h3 class="product-name">Mini Star</h3>
                                <div class="product-price">&#8369;800</div>
                                <div class="product-rating"><span class="rating-stars">&#9733;&#9733;&#9733;&#9733;&#9733;</span><span class="rating-count">(124)</span></div>
                            </div>
                        </article>
                        <article class="product-card animate-on-scroll animate-delay-2" data-machine-type="premium">
                            <div class="product-image-wrap">
                                <img src="<?= BASE_URL ?>/assets/images/items/Platinum%20Pro.png" alt="Platinum Pro" class="product-image">
                            </div>
                            <div class="product-content">
                                <h3 class="product-name">Platinum Pro</h3>
                                <div class="product-price">&#8369;1,500</div>
                                <div class="product-rating"><span class="rating-stars">&#9733;&#9733;&#9733;&#9733;&#9733;</span><span class="rating-count">(124)</span></div>
                            </div>
                        </article>
                        <article class="product-card animate-on-scroll animate-delay-3" data-machine-type="premium">
                            <div class="product-image-wrap">
                                <img src="<?= BASE_URL ?>/assets/images/items/Party%20Box%20X.png" alt="Party Box X" class="product-image">
                            </div>
                            <div class="product-content">
                                <h3 class="product-name">Party Box X</h3>
                                <div class="product-price">&#8369;1,500</div>
                                <div class="product-rating"><span class="rating-stars">&#9733;&#9733;&#9733;&#9733;&#9733;</span><span class="rating-count">(124)</span></div>
                            </div>
                        </article>
                        <article class="product-card animate-on-scroll animate-delay-4" data-machine-type="standard">
                            <div class="product-image-wrap">
                                <img src="<?= BASE_URL ?>/assets/images/items/Mini%20Star.png" alt="Mini Star" class="product-image">
                            </div>
                            <div class="product-content">
                                <h3 class="product-name">Mini Star</h3>
                                <div class="product-price">&#8369;800</div>
                                <div class="product-rating"><span class="rating-stars">&#9733;&#9733;&#9733;&#9733;&#9733;</span><span class="rating-count">(124)</span></div>
                            </div>
                        </article>
                        <article class="product-card animate-on-scroll animate-delay-1" data-machine-type="premium">
                            <div class="product-image-wrap">
                                <img src="<?= BASE_URL ?>/assets/images/items/Platinum%20Pro.png" alt="Platinum Pro" class="product-image">
                            </div>
                            <div class="product-content">
                                <h3 class="product-name">Platinum Pro</h3>
                                <div class="product-price">&#8369;1,500</div>
                                <div class="product-rating"><span class="rating-stars">&#9733;&#9733;&#9733;&#9733;&#9733;</span><span class="rating-count">(124)</span></div>
                            </div>
                        </article>
                        <article class="product-card animate-on-scroll animate-delay-2" data-machine-type="premium">
                            <div class="product-image-wrap">
                                <img src="<?= BASE_URL ?>/assets/images/items/Party%20Box%20X.png" alt="Party Box X" class="product-image">
                            </div>
                            <div class="product-content">
                                <h3 class="product-name">Party Box X</h3>
                                <div class="product-price">&#8369;1,500</div>
                                <div class="product-rating"><span class="rating-stars">&#9733;&#9733;&#9733;&#9733;&#9733;</span><span class="rating-count">(124)</span></div>
                            </div>
                        </article>
                        <article class="product-card animate-on-scroll animate-delay-3" data-machine-type="standard">
                            <div class="product-image-wrap">
                                <img src="<?= BASE_URL ?>/assets/images/items/Mini%20Star.png" alt="Mini Star" class="product-image">
                            </div>
                            <div class="product-content">
                                <h3 class="product-name">Mini Star</h3>
                                <div class="product-price">&#8369;800</div>
                                <div class="product-rating"><span class="rating-stars">&#9733;&#9733;&#9733;&#9733;&#9733;</span><span class="rating-count">(124)</span></div>
                            </div>
                        </article>
                        <article class="product-card animate-on-scroll animate-delay-4" data-machine-type="premium">
                            <div class="product-image-wrap">
                                <img src="<?= BASE_URL ?>/assets/images/items/Platinum%20Pro.png" alt="Platinum Pro" class="product-image">
                            </div>
                            <div class="product-content">
                                <h3 class="product-name">Platinum Pro</h3>
                                <div class="product-price">&#8369;1,500</div>
                                <div class="product-rating"><span class="rating-stars">&#9733;&#9733;&#9733;&#9733;&#9733;</span><span class="rating-count">(124)</span></div>
                            </div>
                        </article>
                    </div>
                    <nav class="landing-pagination animate-on-scroll" aria-label="Machine pagination">
                        <button type="button" class="pagination-btn" aria-label="Previous page" disabled>&lt;</button>
                        <button type="button" class="pagination-btn active" aria-current="page">1</button>
                        <button type="button" class="pagination-btn">2</button>
                        <button type="button" class="pagination-btn">3</button>
                        <span class="pagination-dots">...</span>
                        <button type="button" class="pagination-btn">8</button>
                        <button type="button" class="pagination-btn" aria-label="Next page">&gt;</button>
                    </nav>
                </div>
            </div>
        </section>
    </main>

    <!-- ============================
         SITE FOOTER
         ============================ -->
    <footer class="site-footer">
        <div class="container">
            <div class="footer-inner">
                <!-- Brand Column -->
                <div class="footer-brand">
                    <div class="logo-drawer">
                        <img
                            src="<?= BASE_URL ?>/assets/images/Logo%20LMode.svg"
                            alt="Rentertain Logo"
                            class="footer-logo-img footer-logo-light"
                        >
                        <img
                            src="<?= BASE_URL ?>/assets/images/Logo%20DMode.svg"
                            alt="Rentertain Logo"
                            class="footer-logo-img footer-logo-dark"
                        >
                    </div>
                    <div class="brand-text">
                        <h4 class="brand-title">Rentertain</h4>
                        <p class="brand-sub">
                            Making celebrations louder and more memorable with premium videoke rentals since 2026.
                        </p>
                        <p class="powered-by">Powered by <a href="https://www.certicode.tech/" target="_blank" rel="noopener">CertiCode</a></p>
                        <div class="social-links">
                            <a href="https://www.facebook.com/CertiCode" class="social" aria-label="Facebook" target="_blank" rel="noopener noreferrer">
                                <svg viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                                </svg>
                            </a>
                            <a href="https://www.certicode.tech/" class="social" aria-label="CertiCode" target="_blank" rel="noopener noreferrer">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <circle cx="12" cy="12" r="9"/>
                                    <line x1="3" y1="12" x2="21" y2="12"/>
                                    <path d="M12 3a12 12 0 0 0 0 18"/>
                                    <path d="M12 3a12 12 0 0 1 0 18"/>
                                </svg>
                            </a>
                            <a href="<?= BASE_URL ?>/pages/contactus.html" class="social" aria-label="Contact">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                                    <polyline points="22,6 12,13 2,6"/>
                                </svg>
                            </a>
                        </div>
                    </div>
                </div>

                <!-- Company Links -->
                <div class="footer-col footer-links">
                    <h5>Company</h5>
                    <nav class="footer-nav">
                        <a href="<?= BASE_URL ?>/pages/aboutus.html" class="footer-link">About Us</a>
                        <a href="<?= BASE_URL ?>/pages/contactus.html" class="footer-link">Contact</a>
                        <a href="<?= BASE_URL ?>/pages/terms.html" class="footer-link">Terms of Service</a>
                    </nav>
                </div>

                <div class="footer-col footer-support">
                    <h5>Support</h5>
                    <nav class="footer-nav" aria-label="Support">
                        <a href="#" class="footer-link">How it works</a>
                        <a href="#" class="footer-link">Pricing Packages</a>
                        <a href="#" class="footer-link">Safety Guidelines</a>
                        <a href="#" class="footer-link">Delivery areas</a>
                    </nav>
                </div>

                <!-- Admin Links
                <div class="footer-col footer-admin">
                    <h5>Admin</h5>
                    <nav class="footer-nav">
                        <a href="<?= BASE_URL ?>/admin/auth/login.php" class="footer-link">Admin Login</a>
                    </nav>
                </div>
                -->
            </div>

            <div class="footer-divider"></div>

            <div class="footer-bottom">
                <p class="copyright">&copy; 2026 Rentertain Videoke Rentals &bull; v2.4.0</p>
                <div class="policy-links">
                    <a href="<?= BASE_URL ?>/pages/privacy-policy.html" class="policy-link">Privacy Policy</a>
                    <a href="<?= BASE_URL ?>/pages/cookie-policy.html" class="policy-link">Cookie Policy</a>
                </div>
            </div>
        </div>
    </footer>

    <!-- Scripts -->
    <script src="<?= BASE_URL ?>/landingpage/js/index.js"></script>
</body>
</html>
