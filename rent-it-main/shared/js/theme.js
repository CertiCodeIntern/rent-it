/**
 * ============================================================
 * RENTIT THEME MODULE
 * Dark/Light Mode Toggle with localStorage Persistence
 * 
 * This script runs immediately to prevent "theme flash" on load.
 * Include this in <head> or early in <body> of all HTML files.
 * ============================================================
 */

(function() {
    'use strict';

    // ============================
    // IMMEDIATE THEME APPLICATION
    // Prevents flash of wrong theme on page load
    // ============================
    const savedTheme = localStorage.getItem('rentit-theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);

    // ============================
    // THEME TOGGLE INITIALIZATION
    // Sets up click handler after DOM is ready
    // ============================
    function initThemeToggle() {
        const themeToggle = document.getElementById('themeToggle');
        
        if (!themeToggle) return;

        themeToggle.addEventListener('click', function() {
            // Get current theme
            const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
            
            // Toggle theme
            const newTheme = currentTheme === 'light' ? 'dark' : 'light';
            
            // Apply new theme
            document.documentElement.setAttribute('data-theme', newTheme);
            
            // Save to localStorage
            localStorage.setItem('rentit-theme', newTheme);
            
            // Announce change for accessibility
            const announcement = newTheme === 'dark' ? 'Dark mode enabled' : 'Light mode enabled';
            themeToggle.setAttribute('aria-label', announcement);
        });
    }

    function initPageSkeleton() {
        if (!document.body) {
            document.addEventListener('DOMContentLoaded', initPageSkeleton, { once: true });
            return;
        }

        const overlay = document.querySelector('.page-skeleton-overlay');
        if (!overlay) return;

        const hideOverlay = () => {
            overlay.classList.add('is-hidden');
            setTimeout(() => overlay.remove(), 350);
        };

        window.addEventListener('load', hideOverlay, { once: true });
        setTimeout(hideOverlay, 3500);
    }

    // Initialize when DOM is ready
    let skeletonStarted = false;
    const startSkeleton = () => {
        if (skeletonStarted) return;
        skeletonStarted = true;
        initPageSkeleton();
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            initThemeToggle();
            startSkeleton();
        }, { once: true });
        startSkeleton();
    } else {
        initThemeToggle();
        startSkeleton();
    }
})();
