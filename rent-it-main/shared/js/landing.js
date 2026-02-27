/**
 * =====================================================
 * LANDING PAGE JAVASCRIPT
 * Homepage interactivity
 * =====================================================
 */

const Landing = {
    /**
     * Initialize landing page
     */
    init() {
        this.setupMobileMenu();
        this.setupSmoothScroll();
        this.setupNavbarScroll();
    },

    /**
     * Setup mobile menu toggle
     */
    setupMobileMenu() {
        const toggle = document.getElementById('mobileToggle');
        const menu = document.getElementById('mobileMenu');

        if (toggle && menu) {
            toggle.addEventListener('click', () => {
                menu.classList.toggle('active');
                toggle.classList.toggle('active');
            });

            // Close menu when clicking a link
            menu.querySelectorAll('a').forEach(link => {
                link.addEventListener('click', () => {
                    menu.classList.remove('active');
                    toggle.classList.remove('active');
                });
            });
        }
    },

    /**
     * Setup smooth scrolling for anchor links
     */
    setupSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                const href = anchor.getAttribute('href');
                if (href === '#') return;

                const target = document.querySelector(href);
                if (target) {
                    e.preventDefault();
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    },

    /**
     * Setup navbar background change on scroll
     */
    setupNavbarScroll() {
        const navbar = document.querySelector('.navbar');
        if (!navbar) return;

        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                navbar.style.background = 'rgba(255, 255, 255, 0.98)';
                navbar.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
            } else {
                navbar.style.background = 'rgba(255, 255, 255, 0.95)';
                navbar.style.boxShadow = 'none';
            }
        });
    }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    Landing.init();
});
