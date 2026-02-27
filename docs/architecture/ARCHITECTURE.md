# 🏗️ Project Architecture

> Complete guide to the folder structure and what each directory contains.

**Author:** [Aki1104](https://github.com/Aki1104) (steevenparubrub@gmail.com)  
**Last Updated:** February 4, 2026

---

## 📚 Related Documentation

| Document | Description |
|----------|-------------|
| [FRONTEND_ARCHITECTURE.md](./FRONTEND_ARCHITECTURE.md) | Detailed frontend structure, components, and UI patterns |
| [BACKEND_ARCHITECTURE.md](./BACKEND_ARCHITECTURE.md) | API endpoints, database schema, and server-side logic |
| [CSS-ARCHITECTURE.md](./CSS-ARCHITECTURE.md) | CSS design system and styling conventions |
| [CHANGELOG.md](./CHANGELOG.md) | Version history and changes |

---

## 📁 Root Directory Structure

```
rent-it/
├── 📄 index.html           # Landing page (entry point)
├── 📄 config.php           # Main configuration (OAuth, DB)
├── 📄 vercel.json          # Vercel deployment configuration
├── 📄 README.md            # Project overview
│
├── 📁 api/                 # RESTful API endpoints
├── 📁 client/              # Client-side application
├── 📁 admin/               # Admin-side application
├── 📁 shared/              # Shared resources (CSS, JS, PHP)
├── 📁 assets/              # Static assets (images, icons)
├── 📁 pages/               # Static pages (about, contact, etc.)
├── 📁 landingpage/         # Landing page specific assets
├── 📁 libs/                # Third-party libraries (PHPMailer)
├── 📁 docs/                # Documentation
├── 📁 notes/               # Development notes
└── 📁 reference/           # Reference materials
```

---

## 📂 Folder Details

### `/client` - Client Application
```
client/
├── 📁 auth/                # Authentication pages
│   ├── 📄 login.php        # Login & Register page
│   ├── 📁 css/
│   │   └── auth.css        # Auth-specific styles
│   └── 📁 js/
│       └── auth.js         # Auth functionality
│
├── 📁 catalog/             # Product browsing
├── 📁 cart/                # Shopping cart
├── 📁 checkout/            # Checkout process
├── 📁 favorites/           # Saved items
├── 📁 myrentals/           # Active rentals
├── 📁 bookinghistory/      # Past bookings
└── 📁 dashboard/           # Client dashboard
    ├── 📄 loggedin.php     # Post-login page
    └── 📄 dashboard.css    # Dashboard styles
```

**Purpose:** Contains all customer-facing pages and functionality.

---

### `/admin` - Admin Application
```
admin/
├── 📁 auth/                # Admin authentication
│   ├── 📄 login.html       # Admin login page
│   ├── 📁 css/
│   └── 📁 js/
│
└── 📁 dashboard/           # Admin dashboard
    ├── 📄 index.html       # Admin dashboard
    ├── 📁 css/
    └── 📁 js/
```

**Purpose:** Contains all admin/staff pages with elevated privileges.

---

### `/shared` - Shared Resources
```
shared/
├── 📁 css/
│   ├── globals.css         # Design tokens, reset, base styles
│   └── landing.css         # Landing page styles
│
└── 📁 js/
    ├── components.js       # Reusable UI components
    └── landing.js          # Landing page scripts
```

**Purpose:** Contains reusable CSS and JavaScript used across both client and admin.

---

### `/assets` - Static Assets
```
assets/
├── 📁 images/              # Image files
└── 📁 icons/               # Icon files
```

**Purpose:** Stores all static media files.

---

### `/docs` - Documentation
```
docs/
├── 📄 README.md            # Documentation overview
├── 📄 CHANGELOG.md         # Version history
├── 📄 ARCHITECTURE.md      # This file
└── 📁 logs/                # Development logs
    └── YYYY-MM-DD-*.md     # Individual log entries
```

**Purpose:** Central documentation hub.

---

## 🔗 URL Routing

| URL | Destination | Description |
|-----|-------------|-------------|
| `/` | `index.html` | Landing page |
| `/login` | `client/auth/login.html` | Client login |
| `/signup` | `client/auth/login.html#register` | Client signup |
| `/dashboard` | `client/dashboard.html` | Client dashboard |
| `/admin/login` | `admin/auth/login.html` | Admin login |
| `/admin/dashboard` | `admin/dashboard.html` | Admin dashboard |
| `/wip` | `pages/wip.html` | Work in progress |

---

## 🎨 CSS Architecture

### Design Tokens (`/shared/css/globals.css`)
- Color palette
- Typography scale
- Spacing system
- Border radii
- Box shadows
- Animation timing

### Component Styles
- Each section has its own CSS file
- Uses BEM-like naming convention
- Mobile-first responsive design

---

## 🧩 JavaScript Architecture

### Shared Components (`/shared/js/components.js`)
- `Components.injectSidebar()` - Renders sidebar
- `Components.injectTopbar()` - Renders topbar
- `Components.isAuthenticated()` - Auth check
- `Components.requireAuth()` - Protected routes
- `Components.handleLogout()` - Logout handler

### Page-Specific Scripts
- Each page has its own JS file
- Imports shared components
- Handles page-specific logic

---

## 📱 Responsive Breakpoints

| Breakpoint | Target Device |
|------------|---------------|
| `2560px+` | Large monitors (4K) |
| `1024px` | Tablet landscape |
| `768px` | Tablet portrait |
| `480px` | Mobile |

---

## 🔐 Authentication Flow

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│  Landing    │ ──► │  Login Page  │ ──► │  Dashboard  │
│  (index)    │     │  (client/    │     │  (client/   │
│             │     │   auth/)     │     │  dashboard/)│
└─────────────┘     └──────────────┘     └─────────────┘
                           │
                           ▼
                    localStorage
                    - user data
                    - auth token
```

---

*Last Updated: January 29, 2026*
