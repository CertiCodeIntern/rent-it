# RentIt Design System

> **Version:** 1.0.0  
> **Last Updated:** February 1, 2026  
> **Purpose:** Formalize coding and design standards to prevent recurring UI bugs

This document serves as the authoritative reference for all design decisions, color theory rules, and implementation standards for the RentIt project. **All developers (human and AI) must follow these mandates.**

---

## Table of Contents

1. [The Contrast Law (Critical)](#i-the-contrast-law-critical)
2. [Theming Logic](#ii-theming-logic)
3. [Navigation & State](#iii-navigation--state)
4. [Responsiveness](#iv-responsiveness)
5. [Quick Reference Checklist](#v-quick-reference-checklist)

---

## I. The Contrast Law (Critical)

### The Golden Rule

> **"Never change a Text Color without verifying the Background Color of its specific container."**

This is the #1 cause of "invisible text" bugs. Before setting any color, trace upward through the DOM to identify the actual rendered background.

### Background-to-Text Mapping

| Background Variable | Required Text Variable | Example Use Case |
|---------------------|------------------------|------------------|
| `var(--bg-primary)` | `var(--text-primary)` | Page body |
| `var(--bg-secondary)` | `var(--text-primary)` | Alternate sections |
| `var(--bg-card)` | `var(--card-title)`, `var(--card-text)` | Cards, sidebars |
| `var(--bg-tertiary)` | `var(--text-secondary)` | Inputs, subtle areas |
| `var(--nav-bg)` | `var(--text-on-nav)` | Header navigation |
| `var(--footer-bg)` | `var(--footer-text)` | Footer content |
| `var(--hero-top)`/`var(--hero-bottom)` | `var(--text-inverse)` | Hero section |

### Banned Colors

The following colors are **BANNED** from direct use in any file:

| Banned Value | Reason | Replacement |
|--------------|--------|-------------|
| `#000000` (Pure Black) | Too harsh, not "modern" | `var(--text-primary)` → `#0F172A` |
| `#FFFFFF` (Pure White) | Too stark for backgrounds | `var(--bg-primary)` → `#F8FAFC` |
| Any hardcoded hex in layouts | Breaks theme switching | Use semantic CSS variables |

### Dark Mode Verification

When working on any component:

1. **Check Light Mode** - Is text readable on light backgrounds?
2. **Toggle to Dark Mode** - Does the same text remain readable?
3. If the answer is NO → You're using a non-theme-aware variable

---

## II. Theming Logic

### File Structure

All colors are centralized in **one file only**:

```
shared/css/theme.css
```

**Never define color variables in:**
- `landingpage/css/index.css` (layout only)
- Inline `<style>` blocks in HTML
- Component-specific CSS files

### The CSS Variable Cascade

```css
/* theme.css - LIGHT MODE (default) */
:root {
    --accent: #E67E22;        /* Softer burnt orange */
    --text-primary: #0F172A;  /* Rich dark blue-grey */
}

/* theme.css - DARK MODE */
[data-theme="dark"] {
    --accent: #FB7012;        /* Vibrant orange for dark backgrounds */
    --text-primary: #F1F5F9;  /* Light text */
}
```

### Accent Color Control

| Variable | Light Mode | Dark Mode | Usage |
|----------|------------|-----------|-------|
| `--accent` | `#E67E22` (burnt orange) | `#FB7012` (vibrant) | Buttons, underlines, highlights |
| `--accent-hover` | `#D35400` | `#FF8534` | Hover states |
| `--accent-muted` | `rgba(230, 126, 34, 0.15)` | `rgba(251, 112, 18, 0.2)` | Backgrounds, badges |

### Heading Colors

For content headings (not nav/header), always use theme-aware variables:

| Variable | Light Mode | Dark Mode | Usage |
|----------|------------|-----------|-------|
| `--heading-primary` | `#013A63` (brand blue) | `#F1F5F9` (off-white) | H2, H3 in content |
| `--heading-secondary` | `#014F86` | `#CBD5E1` | Subheadings |

**NEVER use `--brand-primary` for content headings** - it stays blue and becomes invisible on dark backgrounds.

---

## III. Navigation & State

### Active State Management

**RULE:** Navigation highlighting must be handled **dynamically by JavaScript**, never hardcoded in HTML.

#### Correct Implementation

```javascript
// landingpage/js/index.js
function initActiveNavHighlight() {
    const currentPath = window.location.pathname;
    const currentFileName = currentPath.split('/').pop().replace('.html', '');
    
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        const linkFileName = href.split('/').pop().replace('.html', '');
        
        if (currentFileName === linkFileName) {
            link.classList.add('active');
        }
    });
}
```

#### Forbidden Patterns

```html
<!-- ❌ WRONG - Hardcoded active class -->
<a href="/" class="nav-link active">Home</a>

<!-- ✅ CORRECT - No active class, JS handles it -->
<a href="/" class="nav-link">Home</a>
```

### Header/Footer Consistency

The Header and Footer HTML structure **must remain identical** across all pages:

- `index.html`
- `pages/aboutus.html`
- `pages/contactus.html`
- `pages/privacy-policy.html`
- `pages/terms.html`
- `pages/cookie-policy.html`

Use the same navigation links, logo, and button structure.

---

## IV. Responsiveness

### The Hybrid Container Approach

| Page Type | Container Width | Justification |
|-----------|-----------------|---------------|
| Landing Page | `max-width: 1440px` | Constrained for visual hierarchy |
| Dashboard | `width: 100%` (fluid) | Maximize usable space for data |
| Auth Pages | `max-width: 500px` | Focused, centered forms |

#### Implementation

```css
/* In theme.css */
:root {
    --container-width: 1440px;
    --container-width-fluid: calc(100% - 40px);
    --container-width-auth: 500px;
}

/* In layout CSS */
.container { max-width: var(--container-width); }
.container-fluid { max-width: var(--container-width-fluid); }
.container-auth { max-width: var(--container-width-auth); }
```

### Breakpoints

| Breakpoint | Target | Action |
|------------|--------|--------|
| `768px` | Tablets | Single-column stacking for grids |
| `480px` | Mobile | Full-width elements, reduced padding |

```css
@media (max-width: 768px) {
    .content-grid,
    .contact-grid {
        grid-template-columns: 1fr;
    }
}
```

---

## V. Quick Reference Checklist

Before merging any UI change, verify:

### Colors
- [ ] No hardcoded hex values in layout CSS
- [ ] Text color checked against background in BOTH light and dark mode
- [ ] Using `--heading-primary` for content headings (not `--brand-primary`)
- [ ] Accent color uses `--accent` variable (auto-switches light/dark)

### Navigation
- [ ] No `active` class hardcoded in HTML
- [ ] `initActiveNavHighlight()` function handles active state
- [ ] Header/Footer HTML identical across all pages

### Contrast
- [ ] No `opacity` below `0.8` on readable text
- [ ] Light text on dark backgrounds, dark text on light backgrounds
- [ ] Tested toggle between themes without text disappearing

### Structure
- [ ] All new colors added to `theme.css` only
- [ ] Using semantic variable names (`--bg-card`, not `--light-gray`)
- [ ] Grid layouts have `@media (max-width: 768px)` fallback

---

## Appendix: Color Palette

### Brand Colors

| Name | Hex | Usage |
|------|-----|-------|
| RentIt Blue | `#013A63` | Logo, primary brand identity |
| RentIt Blue Light | `#014F86` | Gradients, secondary elements |
| RentIt Blue Dark | `#012A4A` | Deep accents |

### Accent Colors

| Context | Hex | Variable |
|---------|-----|----------|
| Light Mode | `#E67E22` | `--accent` |
| Dark Mode | `#FB7012` | `--accent` |
| Hover (Light) | `#D35400` | `--accent-hover` |
| Hover (Dark) | `#FF8534` | `--accent-hover` |

### Neutral Palette

| Purpose | Light Mode | Dark Mode |
|---------|------------|-----------|
| Page Background | `#F8FAFC` | `#0F172A` |
| Section Background | `#F1F5F9` | `#1E293B` |
| Card Background | `#FFFFFF` | `#1E293B` |
| Primary Text | `#0F172A` | `#F1F5F9` |
| Secondary Text | `#334155` | `#CBD5E1` |
| Muted Text | `#64748B` | `#94A3B8` |

---

*This document is the single source of truth for RentIt's design system. All future development must comply with these standards.*
