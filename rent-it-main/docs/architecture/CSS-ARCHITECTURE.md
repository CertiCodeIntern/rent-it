# RentIt CSS Architecture Guide

> **Created:** February 1, 2026  
> **Purpose:** Document the modular CSS hierarchy and eliminate maintenance issues

---

## Current Problem Analysis

### Issues Identified

1. **Inline Style Bloat**: Each page (aboutus.html, contactus.html, etc.) has 100+ lines of inline `<style>` blocks
2. **Duplicate CSS**: Same styles repeated across multiple files
3. **Unused External CSS**: `pages-layout.css` exists but isn't linked in most pages
4. **Hardcoded Colors**: Hex values scattered in inline styles break theming
5. **No Clear Hierarchy**: Unclear which file takes precedence

---

## Recommended Architecture

### File Hierarchy (Load Order Matters!)

```
1. shared/css/theme.css       ← Variables & Theme System (LOAD FIRST)
2. shared/css/globals.css     ← Reset, Typography, Utilities
3. landingpage/css/index.css  ← Landing page components
4. pages/pages-layout.css     ← Inner pages shared styles
5. <style> block              ← Page-specific overrides ONLY (minimal)
```

### Why This Order?

- **theme.css**: Defines all CSS variables - must load first
- **globals.css**: Base styles that use theme variables
- **index.css**: Header, Footer, Nav, Buttons (shared across all pages)
- **pages-layout.css**: Page header, content grid, sidebar, cards for inner pages
- **Inline styles**: ONLY for truly unique, one-off styles (< 20 lines)

---

## File Responsibilities

### 1. `shared/css/theme.css`
**Contains:**
- All CSS custom properties (variables)
- Light/Dark theme definitions
- Theme toggle button styles

**Never Contains:**
- Component layouts
- Specific element styling

### 2. `shared/css/globals.css`
**Contains:**
- CSS reset
- Base typography
- Utility classes (.container, .btn, etc.)

### 3. `landingpage/css/index.css`
**Contains:**
- Site header (.site-header)
- Navigation (.main-nav, .nav-link)
- Footer (.site-footer)
- Hero section
- Machine cards
- Delivery estimator

### 4. `pages/pages-layout.css`
**Contains:**
- Page header banner (.page-header)
- Content grids (.content-grid, .contact-grid)
- Sidebar cards (.sidebar-card)
- Stat items (.stat-item)
- Feature lists (.features-list)
- Legal content styling

---

## Migration Plan

### Phase 1: Link External CSS (Immediate)
Add to all inner pages:
```html
<link rel="stylesheet" href="../shared/css/theme.css">
<link rel="stylesheet" href="../landingpage/css/index.css">
<link rel="stylesheet" href="../pages/pages-layout.css">
```

### Phase 2: Remove Inline Duplicates
Move all inline `<style>` content to `pages-layout.css`, then delete inline blocks.

### Phase 3: Eliminate Hardcoded Colors
Replace all hex values with CSS variables:
- `#013A63` → `var(--brand-primary)`
- `#014F86` → `var(--brand-primary-light)`
- `#F8FAFC` → `var(--bg-primary)`

---

## Quick Reference: Which Variable to Use?

| Context | Light Mode Need | Dark Mode Need | Variable |
|---------|-----------------|----------------|----------|
| Page background | Off-white | Dark navy | `--bg-primary` |
| Card background | White | Dark grey | `--bg-card` |
| Section heading | Brand blue | Off-white | `--heading-primary` |
| Body text | Dark grey | Light grey | `--text-secondary` |
| Nav/Header bg | Brand blue | Brand blue | `--nav-bg` |
| Accent/CTA | Burnt orange | Vibrant orange | `--accent` |

---

## Validation Checklist

Before committing CSS changes:

- [ ] No hardcoded hex values (except in theme.css)
- [ ] All pages link to theme.css FIRST
- [ ] Inline `<style>` blocks < 20 lines
- [ ] Tested in both Light and Dark mode
- [ ] pages-layout.css linked for inner pages

---

*This document supersedes ad-hoc CSS patterns. Follow this architecture for all future development.*
