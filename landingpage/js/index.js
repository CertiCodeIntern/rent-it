/**
 * ============================================================
 * Rentertain LANDING PAGE SCRIPTS
 * Rentertain - Videoke Rental Management System
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

        const menuIcon = '' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">' +
                '<line x1="3" y1="6" x2="21" y2="6"></line>' +
                '<line x1="3" y1="12" x2="21" y2="12"></line>' +
                '<line x1="3" y1="18" x2="21" y2="18"></line>' +
            '</svg>';
        const closeIcon = '' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">' +
                '<line x1="18" y1="6" x2="6" y2="18"></line>' +
                '<line x1="6" y1="6" x2="18" y2="18"></line>' +
            '</svg>';

        function setHamburgerState(isExpanded) {
            hamburger.setAttribute('aria-expanded', String(isExpanded));
            hamburger.setAttribute('aria-label', isExpanded ? 'Close menu' : 'Open menu');
            hamburger.innerHTML = isExpanded ? closeIcon : menuIcon;
        }

        function openNav() {
            setHamburgerState(true);
            mobileNav.classList.add('open');
            document.body.style.overflow = 'hidden';
        }

        function closeNav() {
            setHamburgerState(false);
            mobileNav.classList.remove('open');
            document.body.style.overflow = '';
        }

        setHamburgerState(false);

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
            const eventPath = typeof e.composedPath === 'function' ? e.composedPath() : [];
            const isInside = eventPath.includes(mobileNav) || eventPath.includes(hamburger);
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
    // MACHINE FILTER TABS
    // ============================
    function initMachineFilters() {
        const filterButtons = document.querySelectorAll('.machine-filter-btn');
        const machineCards = document.querySelectorAll('#landingProductsGrid .product-card');

        if (filterButtons.length === 0 || machineCards.length === 0) return;

        filterButtons.forEach((button) => {
            button.addEventListener('click', () => {
                const selectedFilter = button.dataset.filter || 'all';

                filterButtons.forEach((btn) => {
                    const isActive = btn === button;
                    btn.classList.toggle('active', isActive);
                    btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
                });

                machineCards.forEach((card) => {
                    const cardType = card.dataset.machineType || 'standard';
                    const shouldShow = selectedFilter === 'all' || selectedFilter === cardType;
                    card.classList.toggle('is-hidden', !shouldShow);
                });
            });
        });
    }

    // ============================
    // HOT DEALS CAROUSEL
    // ============================
    function initDealsCarousel() {
        const carousels = document.querySelectorAll('.deals-carousel');

        if (carousels.length === 0) return;

        carousels.forEach(function(carousel) {
            const viewport = carousel.querySelector('.deals-viewport');
            const grid = carousel.querySelector('.deals-grid');
            const cards = grid ? Array.from(grid.querySelectorAll('.deal-card')) : [];
            const controls = carousel.querySelector('.deals-carousel-controls');
            const prevBtn = carousel.querySelector('.deals-carousel-btn.prev');
            const nextBtn = carousel.querySelector('.deals-carousel-btn.next');
            const dotsWrap = carousel.querySelector('.deals-carousel-dots');

            if (!viewport || !grid || cards.length === 0 || !controls || !prevBtn || !nextBtn || !dotsWrap) return;

            let pageStarts = [];
            let currentPage = 0;
            let resizeFrame = null;
            let scrollFrame = null;
            let settleFrame = null;
            let activePointerId = null;
            let dragStartX = 0;
            let dragStartY = 0;
            let dragStartScrollLeft = 0;
            let dragVelocityX = 0;
            let dragLastX = 0;
            let dragLastTime = 0;
            let dragStartPage = 0;
            let isDragging = false;

            function isCarouselMode() {
                return window.innerWidth <= 1024;
            }

            function getCardsPerPage() {
                return window.innerWidth <= 640 ? 1 : 2;
            }

            function getClosestPageIndex() {
                if (pageStarts.length === 0) return 0;

                const currentScroll = viewport.scrollLeft;
                let closestIndex = 0;
                let closestDistance = Infinity;

                pageStarts.forEach(function(start, index) {
                    const distance = Math.abs(start - currentScroll);
                    if (distance < closestDistance) {
                        closestDistance = distance;
                        closestIndex = index;
                    }
                });

                return closestIndex;
            }

            function updateControls() {
                if (!isCarouselMode() || pageStarts.length <= 1) {
                    controls.hidden = true;
                    prevBtn.disabled = true;
                    nextBtn.disabled = true;
                    viewport.classList.remove('is-draggable', 'is-dragging', 'is-settling');
                    return;
                }

                controls.hidden = false;
                viewport.classList.add('is-draggable');
                currentPage = getClosestPageIndex();
                prevBtn.disabled = currentPage === 0;
                nextBtn.disabled = currentPage === pageStarts.length - 1;

                Array.from(dotsWrap.children).forEach(function(dot, index) {
                    const isActive = index === currentPage;
                    dot.classList.toggle('active', isActive);
                    dot.setAttribute('aria-current', isActive ? 'true' : 'false');
                });
            }

            function cancelSettleAnimation() {
                if (settleFrame !== null) {
                    cancelAnimationFrame(settleFrame);
                    settleFrame = null;
                }

                viewport.classList.remove('is-settling');
            }

            function animateScrollTo(targetScroll) {
                cancelSettleAnimation();

                const startScroll = viewport.scrollLeft;
                const distance = targetScroll - startScroll;

                if (Math.abs(distance) < 1) {
                    viewport.scrollLeft = targetScroll;
                    updateControls();
                    return;
                }

                const duration = Math.max(180, Math.min(280, Math.abs(distance) * 0.45));
                const startTime = performance.now();

                viewport.classList.add('is-settling');

                function step(now) {
                    const progress = Math.min((now - startTime) / duration, 1);
                    const easedProgress = 1 - Math.pow(1 - progress, 3);

                    viewport.scrollLeft = startScroll + (distance * easedProgress);
                    updateControls();

                    if (progress < 1) {
                        settleFrame = requestAnimationFrame(step);
                        return;
                    }

                    viewport.scrollLeft = targetScroll;
                    viewport.classList.remove('is-settling');
                    settleFrame = null;
                    updateControls();
                }

                settleFrame = requestAnimationFrame(step);
            }

            function goToPage(index, smoothScroll) {
                if (pageStarts.length === 0) return;

                const boundedIndex = Math.max(0, Math.min(index, pageStarts.length - 1));
                const targetScroll = pageStarts[boundedIndex];

                currentPage = boundedIndex;

                if (smoothScroll) {
                    animateScrollTo(targetScroll);
                } else {
                    cancelSettleAnimation();
                    viewport.scrollLeft = targetScroll;
                }

                updateControls();
            }

            function getSnapTargetIndex() {
                const closestIndex = getClosestPageIndex();
                const movedBy = viewport.scrollLeft - dragStartScrollLeft;
                const moveThreshold = Math.max(48, viewport.clientWidth * 0.14);
                const velocityThreshold = 0.35;

                if (Math.abs(movedBy) < moveThreshold && Math.abs(dragVelocityX) < velocityThreshold) {
                    return closestIndex;
                }

                if (movedBy > 0 || dragVelocityX < -velocityThreshold) {
                    return Math.min(dragStartPage + 1, pageStarts.length - 1);
                }

                if (movedBy < 0 || dragVelocityX > velocityThreshold) {
                    return Math.max(dragStartPage - 1, 0);
                }

                return closestIndex;
            }

            function stopDragging(shouldSnap) {
                if (activePointerId === null) return;

                if (viewport.hasPointerCapture && viewport.hasPointerCapture(activePointerId)) {
                    viewport.releasePointerCapture(activePointerId);
                }

                activePointerId = null;
                viewport.classList.remove('is-dragging');

                if (shouldSnap) {
                    goToPage(getSnapTargetIndex(), true);
                }
            }

            function handlePointerDown(event) {
                if (!isCarouselMode() || pageStarts.length <= 1) return;
                if (event.pointerType === 'mouse' && event.button !== 0) return;

                cancelSettleAnimation();
                activePointerId = event.pointerId;
                dragStartX = event.clientX;
                dragStartY = event.clientY;
                dragStartScrollLeft = viewport.scrollLeft;
                dragStartPage = getClosestPageIndex();
                dragVelocityX = 0;
                dragLastX = event.clientX;
                dragLastTime = performance.now();
                isDragging = false;

                if (viewport.setPointerCapture) {
                    viewport.setPointerCapture(activePointerId);
                }
            }

            function handlePointerMove(event) {
                if (activePointerId !== event.pointerId || !isCarouselMode() || pageStarts.length <= 1) return;

                const deltaX = event.clientX - dragStartX;
                const deltaY = event.clientY - dragStartY;
                const now = performance.now();
                const elapsed = Math.max(now - dragLastTime, 1);

                if (!isDragging && Math.abs(deltaX) < 8) {
                    return;
                }

                if (Math.abs(deltaY) > Math.abs(deltaX)) {
                    stopDragging(false);
                    return;
                }

                if (!isDragging) {
                    isDragging = true;
                    viewport.classList.add('is-dragging');
                }

                event.preventDefault();
                dragVelocityX = (event.clientX - dragLastX) / elapsed;
                dragLastX = event.clientX;
                dragLastTime = now;
                viewport.scrollLeft = dragStartScrollLeft - deltaX;
                updateControls();
            }

            function handlePointerUp(event) {
                if (activePointerId !== event.pointerId) return;

                const shouldSnap = isDragging;
                isDragging = false;
                stopDragging(shouldSnap);
            }

            function buildDots() {
                dotsWrap.innerHTML = '';

                pageStarts.forEach(function(_, index) {
                    const dot = document.createElement('button');
                    dot.type = 'button';
                    dot.className = 'deals-carousel-dot';
                    dot.setAttribute('aria-label', 'Go to hot deals page ' + (index + 1));
                    dot.setAttribute('aria-current', 'false');
                    dot.addEventListener('click', function() {
                        goToPage(index, true);
                    });
                    dotsWrap.appendChild(dot);
                });
            }

            function rebuildCarousel() {
                if (!isCarouselMode()) {
                    pageStarts = [];
                    currentPage = 0;
                    dotsWrap.innerHTML = '';
                    controls.hidden = true;
                    prevBtn.disabled = true;
                    nextBtn.disabled = true;
                    cancelSettleAnimation();
                    viewport.classList.remove('is-draggable', 'is-dragging');
                    viewport.scrollLeft = 0;
                    return;
                }

                const cardsPerPage = getCardsPerPage();
                pageStarts = [];

                for (let index = 0; index < cards.length; index += cardsPerPage) {
                    pageStarts.push(cards[index].offsetLeft);
                }

                buildDots();
                currentPage = Math.min(currentPage, Math.max(pageStarts.length - 1, 0));
                goToPage(currentPage, false);
            }

            prevBtn.addEventListener('click', function() {
                goToPage(currentPage - 1, true);
            });

            nextBtn.addEventListener('click', function() {
                goToPage(currentPage + 1, true);
            });

            viewport.addEventListener('scroll', function() {
                if (!isCarouselMode() || pageStarts.length <= 1) return;

                if (scrollFrame) {
                    cancelAnimationFrame(scrollFrame);
                }

                scrollFrame = requestAnimationFrame(function() {
                    updateControls();
                    scrollFrame = null;
                });
            }, { passive: true });

            viewport.addEventListener('pointerdown', handlePointerDown);
            window.addEventListener('pointermove', handlePointerMove, { passive: false });
            window.addEventListener('pointerup', handlePointerUp);
            window.addEventListener('pointercancel', handlePointerUp);

            window.addEventListener('resize', function() {
                if (resizeFrame) {
                    cancelAnimationFrame(resizeFrame);
                }

                resizeFrame = requestAnimationFrame(function() {
                    isDragging = false;
                    stopDragging(false);
                    cancelSettleAnimation();
                    rebuildCarousel();
                    resizeFrame = null;
                });
            });

            rebuildCarousel();
        });
    }

    // ============================
    // INITIALIZE ALL
    // ============================
    function init() {
        initMobileNav();
        initSmoothScroll();
        initScrollAnimations();
        initDeliveryEstimator();
        initMachineFilters();
        initDealsCarousel();
        initActiveNavHighlight();
        initHeaderScroll();
        initStatCounters();

        console.log('🎤 Rentertain Landing Page Initialized');
    }

    // Run on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
