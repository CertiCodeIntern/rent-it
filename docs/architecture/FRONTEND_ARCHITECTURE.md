# 🎨 Frontend Architecture

> Complete guide to the frontend folder structure, components, and how they interact with the backend.

**Author:** [Aki1104](https://github.com/Aki1104) (steevenparubrub@gmail.com)  
**Last Updated:** February 4, 2026

---

## 📁 Frontend Directory Structure

```
rent-it/
├── 📄 index.html                    # Landing page (entry point)
├── 📄 start.html                    # Alternative start page
├── 📄 forgot-password.php           # Password recovery page
├── 📄 verify-otp.php                # OTP verification page
├── 📄 reset-password.php            # Password reset page
│
├── 📁 client/                       # Customer-facing application
│   ├── 📄 dashboard.php             # Main client dashboard
│   │
│   ├── 📁 auth/                     # Authentication pages
│   │   ├── 📄 login.php             # Login & Register page
│   │   ├── 📄 login.html            # Static login page
│   │   ├── 📁 css/
│   │   │   └── auth.css             # Auth-specific styles
│   │   └── 📁 js/
│   │       └── auth.js              # Auth functionality (API calls)
│   │
│   ├── 📁 catalog/                  # Product browsing
│   │   ├── 📄 catalog.php           # Catalog listing page
│   │   ├── 📄 itemdescription.php   # Product detail page
│   │   ├── 📄 add_favorite.php      # Add to favorites action
│   │   ├── catalog.css
│   │   ├── catalog.js
│   │   ├── itemdescription.css
│   │   └── itemdescription.js
│   │
│   ├── 📁 cart/                     # Shopping cart
│   │   ├── 📄 cart.php              # Cart view page
│   │   ├── 📄 add_to_cart.php       # Add item to cart
│   │   ├── 📄 delete_to_cart.php    # Remove item from cart
│   │   ├── cart.css
│   │   └── cart.js
│   │
│   ├── 📁 checkout/                 # Checkout process
│   │   ├── 📄 checkout.php          # Checkout page
│   │   ├── 📄 place_order.php       # Order placement handler
│   │   ├── checkout.css
│   │   └── checkout.js
│   │
│   ├── 📁 favorites/                # Saved items
│   │   ├── 📄 favorites.php         # Favorites listing
│   │   ├── favorites.css
│   │   └── favorites.js
│   │
│   ├── 📁 myrentals/                # Active rentals
│   │   ├── 📄 myrentals.php         # Current rentals view
│   │   ├── myrentals.css
│   │   └── myrentals.js
│   │
│   ├── 📁 bookinghistory/           # Past bookings
│   │   ├── 📄 bookinghistory.html   # Booking history view
│   │   ├── bookinghistory.css
│   │   └── bookinghistory.js
│   │
│   ├── 📁 returns/                  # Return process
│   │   └── (return-related files)
│   │
│   └── 📁 dashboard/                # Dashboard components
│       ├── 📄 loggedin.php          # Post-login redirect
│       └── dashboard.css
│
├── 📁 admin/                        # Admin panel
│   ├── 📁 auth/                     # Admin authentication
│   │   ├── 📄 login.html            # Admin login page
│   │   ├── 📁 css/
│   │   └── 📁 js/
│   │
│   ├── 📁 dashboard/                # Admin dashboard
│   │   ├── 📄 dashboard.html        # Main admin dashboard
│   │   ├── 📁 css/
│   │   └── 📁 js/
│   │
│   ├── 📁 orders/                   # Order management
│   │   ├── 📄 orders.html           # Orders listing
│   │   ├── 📄 orderdetail.html      # Order detail view
│   │   ├── 📁 css/
│   │   └── 📁 js/
│   │
│   ├── 📁 customers/                # Customer management
│   │   ├── 📄 customers.html
│   │   ├── 📁 css/
│   │   └── 📁 js/
│   │
│   ├── 📁 calendar/                 # Booking calendar
│   │   ├── 📄 calendar.html
│   │   ├── calendar.css
│   │   └── calendar.js
│   │
│   ├── 📁 dispatch/                 # Delivery management
│   │   ├── 📄 dispatch.html
│   │   ├── 📁 css/
│   │   └── 📁 js/
│   │
│   ├── 📁 newitem/                  # Add new inventory
│   │   ├── 📄 newitem.html
│   │   ├── 📁 css/
│   │   └── 📁 js/
│   │
│   ├── 📁 latefees/                 # Late fee tracking
│   │   ├── 📄 latefees.html
│   │   ├── latefees.css
│   │   └── latefees.js
│   │
│   ├── 📁 repairs/                  # Equipment repairs
│   │   ├── 📄 repairs.html
│   │   ├── repairs.css
│   │   └── repairs.js
│   │
│   ├── 📁 notification/             # Notification center
│   │   ├── 📄 notification.html
│   │   ├── 📁 css/
│   │   └── 📁 js/
│   │
│   ├── 📁 profile/                  # Admin profile
│   │   ├── 📄 profile.html
│   │   ├── 📁 css/
│   │   └── 📁 js/
│   │
│   ├── 📁 settings/                 # System settings
│   │   ├── 📄 settings.html
│   │   ├── 📁 css/
│   │   └── 📁 js/
│   │
│   └── 📁 shared/                   # Admin-specific shared resources
│       ├── 📁 css/
│       │   └── admin-globals.css
│       └── 📁 js/
│
├── 📁 shared/                       # Shared resources (Client + Admin)
│   ├── 📁 css/
│   │   ├── globals.css              # Design tokens, reset, base styles
│   │   └── theme.css                # Light/dark theme variables
│   │
│   ├── 📁 js/
│   │   ├── components.js            # Reusable UI components
│   │   └── theme.js                 # Theme switching logic
│   │
│   └── 📁 php/
│       └── db_connection.php        # Database connection helper
│
├── 📁 landingpage/                  # Landing page specific
│   ├── 📁 css/
│   │   └── index.css                # Landing page styles
│   └── 📁 js/
│       └── index.js                 # Landing page scripts
│
├── 📁 pages/                        # Static pages
│   ├── 📄 aboutus.html              # About us page
│   ├── 📄 contactus.html            # Contact page
│   ├── 📄 terms.html                # Terms of service
│   ├── 📄 privacy-policy.html       # Privacy policy
│   ├── 📄 cookie-policy.html        # Cookie policy
│   ├── 📄 wip.html                  # Work in progress placeholder
│   └── pages.css                    # Shared page styles
│
└── 📁 assets/                       # Static assets
    └── 📁 images/
        ├── rIT_logo_tp.png          # Main logo (transparent)
        ├── about-hero.jpg           # About page hero image
        └── (product images)
```

---

## 🧩 Component Architecture

### Shared Components (`/shared/js/components.js`)

The `Components` object provides reusable UI elements:

| Method | Description |
|--------|-------------|
| `injectSidebar(containerId, activeTab, context)` | Renders navigation sidebar |
| `injectTopbar(containerId, title)` | Renders top header bar |
| `injectFooter(containerId)` | Renders page footer |
| `getCurrentUser()` | Gets user from localStorage |
| `isAuthenticated()` | Checks if user is logged in |
| `requireAuth()` | Redirects to login if not authenticated |
| `showLogoutModal()` | Shows logout confirmation |
| `confirmLogout()` | Handles logout action |
| `initThemeToggle()` | Initializes light/dark theme switching |
| `showToast(message, type)` | Shows toast notifications |

### Navigation Tabs Configuration

```javascript
// Client navigation (sidebar)
clientNavTabs: [
    { id: 'dashboard', icon: '🏠', label: 'Dashboard', href: '/rent-it/client/dashboard.php' },
    { id: 'catalog', icon: '📦', label: 'Browse Catalog', href: '/rent-it/client/catalog/catalog.php' },
    { id: 'favorites', icon: '❤️', label: 'Favorites', href: '/rent-it/client/favorites/favorites.php' },
    { id: 'cart', icon: '🛒', label: 'My Cart', href: '/rent-it/client/cart/cart.php' },
    { id: 'myrentals', icon: '🎤', label: 'My Rentals', href: '/rent-it/client/myrentals/myrentals.php' },
    { id: 'bookinghistory', icon: '📅', label: 'Booking History', href: '/rent-it/client/bookinghistory/bookinghistory.html' },
    { id: 'contact', icon: '💬', label: 'Contact Us', href: '/rent-it/pages/contactus.html' },
]

// Admin navigation (sidebar)
navTabs: [
    { id: 'users', icon: '👥', label: 'Users' },
    { id: 'rentals', icon: '📋', label: 'Rentals' },
    { id: 'items', icon: '🎤', label: 'Items' },
    { id: 'payments', icon: '💳', label: 'Payments' },
]
```

---

## 🎨 CSS Architecture

### Design Tokens (`/shared/css/globals.css`)
- Color palette (primary, secondary, accent)
- Typography scale (font sizes, weights, line-heights)
- Spacing system (margins, padding)
- Border radii
- Box shadows
- Animation timing functions

### Theme System (`/shared/css/theme.css`)
```css
/* Light theme (default) */
:root {
    --bg-primary: #ffffff;
    --bg-secondary: #f8f9fa;
    --text-primary: #1a1a2e;
    --text-secondary: #6c757d;
    --accent: #6366f1;
}

/* Dark theme */
[data-theme="dark"] {
    --bg-primary: #0f0f23;
    --bg-secondary: #1a1a2e;
    --text-primary: #ffffff;
    --text-secondary: #a0a0a0;
    --accent: #818cf8;
}
```

### File Naming Convention
| Pattern | Description | Example |
|---------|-------------|---------|
| `{page}.css` | Page-specific styles | `catalog.css` |
| `globals.css` | Global/base styles | `shared/css/globals.css` |
| `theme.css` | Theme variables | `shared/css/theme.css` |
| `admin-globals.css` | Admin-specific globals | `admin/shared/css/admin-globals.css` |

---

## 🔗 Frontend-Backend Integration

### API Endpoints Used by Frontend

| Feature | Endpoint | Method | Description |
|---------|----------|--------|-------------|
| Login | `/api/auth/login.php` | POST | Authenticate user |
| Register | `/api/auth/register.php` | POST | Create new user |
| Logout | `/api/auth/logout.php` | POST | End session |
| Check Session | `/api/auth/check_session.php` | GET | Validate session |

### Authentication Flow

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│  Landing    │ ──► │  Login Page  │ ──► │  Dashboard  │
│  (index)    │     │  (client/    │     │  (client/   │
│             │     │   auth/)     │     │  dashboard/)│
└─────────────┘     └──────────────┘     └─────────────┘
                           │
                           ▼
                    ┌──────────────┐
                    │  API Call    │
                    │  /api/auth/  │
                    │  login.php   │
                    └──────────────┘
                           │
                           ▼
                    ┌──────────────┐
                    │  Session +   │
                    │  localStorage│
                    └──────────────┘
```

### Social Login Integration

| Provider | Login File | Callback File | Config |
|----------|------------|---------------|--------|
| Facebook | `fb-login.php` | `fb-callback.php` | `config.php` |
| Google | `google-login.php` | `google-callback.php` | `config.php` |

---

## 📱 Responsive Breakpoints

| Breakpoint | Target Device |
|------------|---------------|
| `2560px+` | Large monitors (4K) |
| `1440px` | Desktop |
| `1024px` | Tablet landscape |
| `768px` | Tablet portrait |
| `480px` | Mobile |

---

## 🔒 Security Considerations

1. **CSRF Protection**: Forms should include CSRF tokens
2. **XSS Prevention**: Use `htmlspecialchars()` for output
3. **Session Management**: Validate session on protected pages
4. **Input Validation**: Client-side + server-side validation

---

## 📦 Dependencies

### External Libraries
- **Google Fonts**: Inter font family
- **SweetAlert2**: Alert/modal dialogs
- **PHPMailer**: Email functionality (password reset)

### CDN Links Used
```html
<!-- Google Fonts -->
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">

<!-- SweetAlert2 -->
<script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
```

---

## 🚀 Page Load Order

1. Theme script (prevents flash of wrong theme)
2. CSS files (theme.css → globals.css → page-specific.css)
3. HTML content
4. JavaScript (components.js → page-specific.js)
5. Component injection (sidebar, topbar, footer)

---

*Maintained by [Aki1104](https://github.com/Aki1104) • steevenparubrub@gmail.com*
