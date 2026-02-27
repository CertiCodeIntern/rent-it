/**
 * ============================================================
 * ADMIN THEME & SKELETON MODULE
 * Dark/Light Mode + Skeleton Overlay Management
 * 
 * This script MUST run in <head> to prevent:
 * 1. Theme flash (wrong theme shown before JS loads)
 * 2. Content flash (page content visible before skeleton)
 * 
 * Mirrors the client-side theme.js pattern for admin pages.
 * ============================================================
 */
(function() {
    'use strict';

    // ============================
    // IMMEDIATE THEME APPLICATION
    // Prevents flash of wrong theme on page load
    // ============================
    var savedTheme = localStorage.getItem('admin-theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);

    // ============================
    // SKELETON OVERLAY MANAGEMENT
    // Hides skeleton on window.load + safety timeout
    // ============================
    function initAdminSkeleton() {
        if (!document.body) {
            document.addEventListener('DOMContentLoaded', initAdminSkeleton, { once: true });
            return;
        }

        var overlay = document.querySelector('.admin-skeleton-overlay');
        if (!overlay) return;

        var hidden = false;

        function hideOverlay() {
            if (hidden) return;
            hidden = true;
            overlay.classList.add('is-hidden');
            setTimeout(function() {
                if (overlay.parentNode) {
                    overlay.parentNode.removeChild(overlay);
                }
            }, 350);
        }

        // Hide when page fully loaded (images, fonts, etc.)
        window.addEventListener('load', hideOverlay, { once: true });

        // Safety timeout: hide after 3.5s even if load event hasn't fired
        setTimeout(hideOverlay, 3500);
    }

    // Start skeleton management as early as possible
    var skeletonStarted = false;
    function startSkeleton() {
        if (skeletonStarted) return;
        skeletonStarted = true;
        initAdminSkeleton();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', startSkeleton, { once: true });
        // Also try immediately in case body already exists
        startSkeleton();
    } else {
        startSkeleton();
    }
})();
