/**
 * ============================================================
 * RENTIT LANDING PAGE SCRIPTS
 * RentIt - Videoke Rental Management System
 * Powered by CertiCode
 * ============================================================
 */

(function() {
    'use strict';

    // ============================
    // DOM ELEMENTS
    // ============================
    const hamburger = document.getElementById('hamburgerBtn');
    const mobileNav = document.getElementById('mobileNav');

    // ============================
    // MOBILE NAVIGATION
    // ============================
    function initMobileNav() {
        if (!hamburger || !mobileNav) return;

        function openNav() {
            hamburger.setAttribute('aria-expanded', 'true');
            hamburger.innerHTML = '✕';
            mobileNav.classList.add('open');
            document.body.style.overflow = 'hidden';
        }

        function closeNav() {
            hamburger.setAttribute('aria-expanded', 'false');
            hamburger.innerHTML = '☰';
            mobileNav.classList.remove('open');
            document.body.style.overflow = '';
        }

        hamburger.addEventListener('click', function() {
            const isExpanded = hamburger.getAttribute('aria-expanded') === 'true';
            if (isExpanded) {
                closeNav();
            } else {
                openNav();
            }
        });

        // Close on link click
        mobileNav.querySelectorAll('.mobile-link').forEach(function(link) {
            link.addEventListener('click', closeNav);
        });

        // Close on Escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') closeNav();
        });

        // Close on outside click
        document.addEventListener('click', function(e) {
            if (!mobileNav.classList.contains('open')) return;
            const isInside = mobileNav.contains(e.target) || hamburger.contains(e.target);
            if (!isInside) closeNav();
        });
    }

    // ============================
    // SMOOTH SCROLL
    // ============================
    function initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                const href = this.getAttribute('href');
                if (href === '#') return;
                
                const target = document.querySelector(href);
                if (target) {
                    e.preventDefault();
                    
                    const headerHeight = document.querySelector('.site-header')?.offsetHeight || 0;
                    const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }

    // ============================
    // SCROLL ANIMATIONS
    // ============================
    function initScrollAnimations() {
        const animatedElements = document.querySelectorAll('.animate-on-scroll');
        
        if (animatedElements.length === 0) return;
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animated');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        animatedElements.forEach(el => observer.observe(el));
    }

    // ============================
    // DELIVERY ESTIMATOR (Mock)
    // ============================
    function initDeliveryEstimator() {
        const locationInput = document.getElementById('locationInput');
        const feeValue = document.querySelector('.fee-value');
        const mapLabel = document.querySelector('.map-label');
        const calculateBtn = document.querySelector('.est-cta');

        if (!locationInput || !calculateBtn) return;

        // Mock delivery zones
        const deliveryZones = {
            'manila': { fee: 100, label: 'Manila Metro' },
            'makati': { fee: 120, label: 'Makati CBD' },
            'quezon': { fee: 150, label: 'Quezon City' },
            'pasig': { fee: 130, label: 'Pasig City' },
            'mandaluyong': { fee: 110, label: 'Mandaluyong' },
            'taguig': { fee: 140, label: 'Taguig / BGC' },
            'parañaque': { fee: 160, label: 'Parañaque' },
            'las piñas': { fee: 180, label: 'Las Piñas' },
            'cavite': { fee: 250, label: 'Cavite (Extended)' },
            'laguna': { fee: 300, label: 'Laguna (Extended)' }
        };

        calculateBtn.addEventListener('click', function() {
            const location = locationInput.value.toLowerCase().trim();
            
            if (!location) {
                showToast('Please enter a location', 'warning');
                locationInput.focus();
                return;
            }

            // Find matching zone
            let matchedZone = null;
            for (const [key, value] of Object.entries(deliveryZones)) {
                if (location.includes(key)) {
                    matchedZone = value;
                    break;
                }
            }

            if (matchedZone) {
                if (feeValue) {
                    feeValue.textContent = `₱${matchedZone.fee}.00`;
                    feeValue.style.animation = 'pulse 0.5s ease';
                    setTimeout(() => feeValue.style.animation = '', 500);
                }
                if (mapLabel) {
                    mapLabel.textContent = matchedZone.label;
                }
                showToast(`Delivery to ${matchedZone.label}: ₱${matchedZone.fee}`, 'success');
            } else {
                if (feeValue) feeValue.textContent = '₱200.00';
                if (mapLabel) mapLabel.textContent = 'Custom Location';
                showToast('Standard delivery fee applied', 'info');
            }
        });

        // Allow Enter key
        locationInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                calculateBtn.click();
            }
        });
    }

    // ============================
    // TOAST NOTIFICATIONS
    // ============================
    function showToast(message, type = 'info') {
        // Remove existing toast
        const existingToast = document.querySelector('.toast');
        if (existingToast) {
            existingToast.remove();
        }

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <span class="toast-message">${message}</span>
            <button class="toast-close">&times;</button>
        `;

        // Add styles dynamically
        toast.style.cssText = `
            position: fixed;
            bottom: 24px;
            right: 24px;
            background: ${type === 'success' ? '#22c55e' : type === 'warning' ? '#eab308' : type === 'error' ? '#ef4444' : '#3b82f6'};
            color: white;
            padding: 14px 20px;
            border-radius: 10px;
            display: flex;
            align-items: center;
            gap: 12px;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
            z-index: 10000;
            animation: slideDown 0.3s ease;
            font-size: 14px;
            font-weight: 500;
        `;

        document.body.appendChild(toast);

        // Close button
        toast.querySelector('.toast-close').addEventListener('click', () => {
            toast.style.animation = 'slideUp 0.3s ease forwards';
            setTimeout(() => toast.remove(), 300);
        });

        // Auto remove
        setTimeout(() => {
            if (toast.parentNode) {
                toast.style.animation = 'slideUp 0.3s ease forwards';
                setTimeout(() => toast.remove(), 300);
            }
        }, 4000);
    }

    // Make showToast globally available
    window.showToast = showToast;

    // ============================
    // ACTIVE NAV LINK HIGHLIGHT
    // With Click-based switching and ScrollSpy
    // ============================
    function initActiveNavHighlight() {
        const navLinks = document.querySelectorAll('.nav-link');
        const mobileLinks = document.querySelectorAll('.mobile-link');
        const sections = document.querySelectorAll('section[id]');
        
        // Get current page path
        const currentPath = window.location.pathname;
        const isHomePage = currentPath === '/' || currentPath === '/index.html' || currentPath === '';
        
        // Helper: Remove active class from all nav links
        function removeAllActive() {
            navLinks.forEach(link => link.classList.remove('active'));
            mobileLinks.forEach(link => link.classList.remove('active'));
        }
        
        // Helper: Set active link by href
        function setActiveByHref(href) {
            removeAllActive();
            navLinks.forEach(link => {
                if (link.getAttribute('href') === href) {
                    link.classList.add('active');
                }
            });
            mobileLinks.forEach(link => {
                if (link.getAttribute('href') === href) {
                    link.classList.add('active');
                }
            });
        }
        
        // 1. Click-based active state switching
        navLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                const href = this.getAttribute('href');
                
                // For anchor links on same page, update active state immediately
                if (href.startsWith('#') || href.startsWith('/#')) {
                    removeAllActive();
                    this.classList.add('active');
                }
                // For page links, let the page navigation handle it
            });
        });
        
        mobileLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                const href = this.getAttribute('href');
                
                if (href.startsWith('#') || href.startsWith('/#')) {
                    removeAllActive();
                    this.classList.add('active');
                }
            });
        });
        
        // 2. ScrollSpy - Update active state on scroll (only on home page with sections)
        if (isHomePage && sections.length > 0) {
            let ticking = false;
            
            function updateActiveOnScroll() {
                const scrollPos = window.scrollY + 150; // Offset for header height
                
                let currentSection = null;
                
                sections.forEach(section => {
                    const sectionTop = section.offsetTop;
                    const sectionHeight = section.offsetHeight;
                    
                    if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
                        currentSection = section.getAttribute('id');
                    }
                });
                
                if (currentSection) {
                    setActiveByHref('#' + currentSection);
                } else if (window.scrollY < 100) {
                    // At top of page, activate Home
                    setActiveByHref('/');
                }
                
                ticking = false;
            }
            
            window.addEventListener('scroll', () => {
                if (!ticking) {
                    window.requestAnimationFrame(updateActiveOnScroll);
                    ticking = true;
                }
            }, { passive: true });
        }
        
        // 3. Initial state based on URL path or hash
        if (window.location.hash) {
            setActiveByHref(window.location.hash);
        } else if (isHomePage) {
            setActiveByHref('/');
        } else {
            // For inner pages, match by pathname more precisely
            // Extract the filename from the current path (e.g., "aboutus" from "/pages/aboutus.html")
            const currentFileName = currentPath.split('/').pop().replace('.html', '');
            
            removeAllActive();
            
            navLinks.forEach(link => {
                const href = link.getAttribute('href');
                // Extract filename from link href
                const linkFileName = href.split('/').pop().replace('.html', '');
                
                // Match if filenames match (e.g., "aboutus" === "aboutus")
                if (currentFileName === linkFileName) {
                    link.classList.add('active');
                }
            });
            
            mobileLinks.forEach(link => {
                const href = link.getAttribute('href');
                const linkFileName = href.split('/').pop().replace('.html', '');
                
                if (currentFileName === linkFileName) {
                    link.classList.add('active');
                }
            });
        }
    }

    // ============================
    // HEADER SCROLL EFFECT
    // ============================
    function initHeaderScroll() {
        const header = document.querySelector('.site-header');
        if (!header) return;

        let lastScroll = 0;

        window.addEventListener('scroll', () => {
            const currentScroll = window.pageYOffset;

            if (currentScroll > 100) {
                header.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.15)';
            } else {
                header.style.boxShadow = 'none';
            }

            lastScroll = currentScroll;
        }, { passive: true });
    }

    // ============================
    // STAT COUNTER ANIMATION
    // ============================
    function initStatCounters() {
        const stats = document.querySelectorAll('.stat-num');
        if (stats.length === 0) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateCounter(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        stats.forEach(stat => observer.observe(stat));
    }

    function animateCounter(element) {
        const text = element.textContent;
        const hasPlus = text.includes('+');
        const hasSlash = text.includes('/');
        const hasPercent = text.includes('%');
        
        // Extract number
        let num = parseFloat(text.replace(/[^0-9.]/g, ''));
        if (isNaN(num)) return;

        const duration = 1500;
        const start = 0;
        const startTime = performance.now();

        function update(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easeProgress = 1 - Math.pow(1 - progress, 3); // Ease out cubic
            
            let current = start + (num - start) * easeProgress;
            
            if (hasSlash) {
                element.textContent = current.toFixed(1) + '/5';
            } else if (hasPercent) {
                element.textContent = Math.round(current) + '%';
            } else if (hasPlus) {
                element.textContent = Math.round(current).toLocaleString() + '+';
            } else {
                element.textContent = text;
            }

            if (progress < 1) {
                requestAnimationFrame(update);
            } else {
                element.textContent = text; // Reset to original
            }
        }

        requestAnimationFrame(update);
    }

    // ============================
    // INITIALIZE ALL
    // ============================
    function init() {
        initMobileNav();
        initSmoothScroll();
        initScrollAnimations();
        initDeliveryEstimator();
        initActiveNavHighlight();
        initHeaderScroll();
        initStatCounters();

        console.log('🎤 RentIt Landing Page Initialized');
    }

    // Run on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
