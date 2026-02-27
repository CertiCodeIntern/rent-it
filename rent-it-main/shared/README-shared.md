# 🔗 Shared Resources

> Common CSS and JavaScript used across the entire application.

## 📁 Structure

```
shared/
├── 📁 css/
│   ├── theme.css       # 🎨 Theme Module - CSS Variables & Dark/Light Mode
│   ├── globals.css     # Design tokens, reset, base styles
│   └── landing.css     # Landing page styles
│
└── 📁 js/
    ├── theme.js        # 🌙 Theme Toggle Logic & localStorage
    ├── components.js   # Reusable UI components
    └── landing.js      # Landing page scripts
```

## 🎨 CSS Files

### `theme.css` ⭐ NEW - Global Theme Module
The foundation of the theming system. **Must be loaded FIRST** in all HTML files.

Contains:
- **CSS Variables (Light Theme)** - `:root` definitions
  - Brand Colors (`--brand-primary`, `--accent`, etc.)
  - Background Colors (`--bg-primary`, `--bg-card`, etc.)
  - Text Colors (`--text-primary`, `--text-secondary`, etc.)
  - Borders, Shadows, Transitions
- **Dark Theme Overrides** - `[data-theme="dark"]` selectors
- **Theme Toggle Button Styles** - `.theme-toggle` with Sun/Moon animation

**Design Principles:**
- ❌ No Pure Black (`#000000`) - Use `#0F172A` (rich dark navy)
- ❌ No Pure White (`#FFFFFF`) - Use `#F8FAFC` (off-white)
- ✅ RentIt Blue (`#013A63`) as brand foundation
- ✅ Orange (`#FB7012`) as split-complementary accent

### `globals.css`
Contains:
- **CSS Custom Properties** (design tokens)
  - Colors (`--primary-color`, `--gray-500`, etc.)
  - Typography (`--font-size-md`, `--font-weight-bold`, etc.)
  - Spacing (`--spacing-md`, `--spacing-lg`, etc.)
  - Borders (`--radius-md`, `--radius-pill`, etc.)
  - Shadows (`--shadow-sm`, `--shadow-lg`, etc.)
- **CSS Reset** - Normalize browser defaults
- **Base Styles** - Body, links, buttons
- **Utility Classes** - `.hidden`, `.sr-only`
- **Animations** - `@keyframes fadeUp`

### `landing.css`
Contains:
- Navbar styles
- Hero section
- Features grid
- CTA section
- Footer

## 🧩 JavaScript Files

### `theme.js` ⭐ NEW - Theme Module Script
Handles Dark/Light mode toggling with localStorage persistence.

**Must be loaded in `<head>` or early `<body>`** to prevent theme flash on page load.

```javascript
// Automatically runs on load:
// 1. Reads 'rentit-theme' from localStorage
// 2. Applies saved theme immediately (prevents flash)
// 3. Sets up click handler for #themeToggle button
```

**localStorage Key:** `rentit-theme`
**Values:** `'light'` (default) or `'dark'`

### `components.js`
Provides:
```javascript
// UI Injection
Components.injectSidebar(containerId, activeTab)
Components.injectTopbar(containerId, title)

// Tab Management
Components.handleTabChange(tabId)
Components.loadTabContent(tabId)

// Authentication
Components.isAuthenticated()
Components.requireAuth()
Components.handleLogout()

// Utilities
Components.getCurrentUser()
```

### `landing.js`
Provides:
- Smooth scrolling navigation
- Mobile menu toggle
- Header scroll effects
- Animation triggers

## 📝 Usage

```html
<!-- Include in any HTML page -->
<link rel="stylesheet" href="/shared/css/globals.css">
<script src="/shared/js/components.js"></script>
```

## ⚠️ Important Notes

- Always use absolute paths starting with `/`
- `globals.css` should be included FIRST in any page
- `components.js` requires DOM to be loaded before calling methods

---

*See [/docs/ARCHITECTURE.md](/docs/ARCHITECTURE.md) for full project structure*
