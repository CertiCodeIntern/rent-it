# 📖 Step-by-Step Project Guide

> A comprehensive guide to understanding and running the CertiCode Rental Management System.

---

## 🎯 Overview

This is a **Vanilla HTML/CSS/JavaScript** project for managing videoke equipment rentals. There are no frameworks, no bundlers, and no npm dependencies - just pure web technologies.

---

## 📚 Step 1: Understand the Project Structure

```
rent-it/
│
├── 📄 index.php           ← Landing page (what visitors see first)
├── 📄 vercel.json         ← Deployment configuration
│
├── 📁 client/             ← Customer-facing app
│   ├── 📁 auth/           ← Login/Register pages
│   └── 📁 dashboard/      ← User dashboard
│
├── 📁 admin/              ← Staff/Admin app (🚧 under development)
│   ├── 📁 auth/           ← Admin login
│   └── 📁 dashboard/      ← Admin control panel
│
├── 📁 shared/             ← Shared resources
│   ├── 📁 css/            ← Global styles (globals.css, landing.css)
│   └── 📁 js/             ← Shared JavaScript (components.js)
│
├── 📁 assets/             ← Static files (images, icons)
├── 📁 docs/               ← Documentation
└── 📁 notes/              ← Developer notes (you are here!)
```

---

## 🚀 Step 2: Run the Project Locally

### Option A: Python HTTP Server (Recommended)

```bash
# Navigate to project folder
cd rent-it

# Start server with XAMPP
# Make sure XAMPP Apache is running

# Visit in browser
# http://localhost/rent-it
```

### Option B: VS Code Live Server

1. Install "Live Server" extension in VS Code
2. Right-click on `index.php`
3. Select "Open with Live Server"
4. Browser opens automatically
5. Note: For PHP functionality, use XAMPP instead

### Option C: Node.js (if you have it)

```bash
# Install serve globally
npm install -g serve

# Run from project folder
serve -s . -l 3000

# Visit http://localhost:3000
```

---

## 🗺️ Step 3: Understand the User Flow

```
┌─────────────────┐
│  Landing Page   │  ← index.html
│  (/)            │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Login Page     │  ← /client/auth/login.html
│  (/login)       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Dashboard      │  ← /client/dashboard/index.html
│  (/dashboard)   │
└─────────────────┘
```

---

## 🎨 Step 4: Understand the CSS Architecture

### Design Tokens (`/shared/css/globals.css`)

All colors, fonts, spacing are defined as CSS variables:

```css
:root {
  /* Colors */
  --primary-color: #2E7D32;
  --secondary-color: #66BB6A;
  
  /* Typography */
  --font-size-md: 1rem;
  
  /* Spacing */
  --spacing-md: 1rem;
  
  /* etc... */
}
```

### How to Use

```css
/* In any CSS file */
.button {
  background: var(--primary-color);
  padding: var(--spacing-md);
  font-size: var(--font-size-md);
}
```

---

## 🧩 Step 5: Understand the JavaScript Components

### The Components Object (`/shared/js/components.js`)

This file provides reusable UI elements:

```javascript
// Inject sidebar into a container
Components.injectSidebar('sidebarContainer', 'users');

// Inject topbar
Components.injectTopbar('topbarContainer', 'Dashboard');

// Check if user is logged in
if (Components.isAuthenticated()) {
  // User is logged in
}

// Require authentication (redirects if not logged in)
Components.requireAuth();

// Handle logout
Components.handleLogout();
```

---

## 💾 Step 6: Understand Authentication

Authentication uses `localStorage`:

```javascript
// After login, this is stored:
localStorage.setItem('user', JSON.stringify({
  name: 'John Doe',
  email: 'john@example.com'
}));
localStorage.setItem('token', 'mock-token-123');

// To check if logged in:
const user = localStorage.getItem('user');
if (user) {
  // User is logged in
}

// To logout:
localStorage.removeItem('user');
localStorage.removeItem('token');
```

---

## 📁 Step 7: Key Files to Explore

| Priority | File | What It Does |
|----------|------|--------------|
| 1️⃣ | `/index.html` | Landing page - start here |
| 2️⃣ | `/shared/css/globals.css` | All design tokens |
| 3️⃣ | `/shared/js/components.js` | Reusable UI logic |
| 4️⃣ | `/client/auth/login.html` | Login/Register page |
| 5️⃣ | `/client/auth/js/auth.js` | Auth functionality |
| 6️⃣ | `/client/dashboard/index.html` | Dashboard page |
| 7️⃣ | `/vercel.json` | URL routing config |

---

## 🔗 Step 8: URL Routes

The `vercel.json` maps clean URLs to actual files:

| You Type | Actually Loads |
|----------|----------------|
| `/` | `/index.html` |
| `/login` | `/client/auth/login.html` |
| `/signup` | `/client/auth/login.html` |
| `/dashboard` | `/client/dashboard/index.html` |
| `/admin/login` | `/admin/auth/login.html` |
| `/admin/dashboard` | `/admin/dashboard/index.html` |

---

## 🛠️ Step 9: Making Changes

### Adding a New Page

1. Create the HTML file in the appropriate folder
2. Link to `/shared/css/globals.css` for styling
3. Add any page-specific CSS in the same folder
4. Add route to `vercel.json` if needed

### Modifying Styles

1. Check `/shared/css/globals.css` for existing variables
2. Use existing variables when possible
3. Add page-specific CSS in the page's folder

### Adding New Components

1. Open `/shared/js/components.js`
2. Add your method to the `Components` object
3. Document usage in comments

---

## ❓ Step 10: Troubleshooting

### "Page not found" locally

- Make sure you're running a local server
- Don't open HTML files directly (file:// won't work)
- Check the URL path matches file location

### Styles not loading

- Check if path starts with `/` (absolute path)
- Verify the CSS file exists
- Check browser console for 404 errors

### JavaScript not working

- Open browser DevTools (F12)
- Check Console tab for errors
- Verify script tags are correct

### Authentication not working

- Check localStorage in DevTools > Application > Local Storage
- Clear storage and try again
- Check redirect paths in `auth.js`

---

## 📞 Need Help?

1. Check [/docs/ARCHITECTURE.md](/docs/ARCHITECTURE.md) for folder details
2. Check [/docs/CHANGELOG.md](/docs/CHANGELOG.md) for recent changes
3. Check [/docs/logs/](/docs/logs/) for problem/solution history

---

*Happy coding! 🎉*
