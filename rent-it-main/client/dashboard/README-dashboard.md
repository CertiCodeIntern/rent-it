# 📊 Client Dashboard

> Main dashboard for customer operations.

## 📁 Files

```
dashboard/
├── 📄 index.html       # Dashboard page
├── 📄 dashboard.css    # Dashboard styles
└── 📄 dashboard.js     # Dashboard functionality
```

## 🎯 Features

- **Sidebar Navigation**
  - Users tab
  - Rentals tab
  - Items tab
  - Payments tab
  - User profile display
  - Logout button

- **Topbar**
  - Page title
  - Mobile menu toggle
  - User avatar

- **Content Area**
  - Dynamic tab content
  - Data tables
  - Status badges

## 🔐 Authentication

This page is protected. Users must be logged in to access.
Redirects to `/client/auth/login.html` if not authenticated.

## 🧩 Components Used

```javascript
// Injects sidebar
Components.injectSidebar('sidebarContainer', 'users');

// Injects topbar
Components.injectTopbar('topbarContainer', 'Users');

// Loads tab content
Components.loadTabContent('users');
```

## 🔗 Dependencies

- `/shared/css/globals.css` - Design tokens
- `/shared/js/components.js` - UI components
- `dashboard.css` - Local styles
- `dashboard.js` - Local functionality

---

*See [/docs/ARCHITECTURE.md](/docs/ARCHITECTURE.md) for full project structure*
