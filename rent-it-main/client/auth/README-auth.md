# 🔐 Client Authentication

> Login and Registration pages for customers.

## 📁 Files

```
auth/
├── 📄 login.html     # Login & Register page (tabbed)
├── 📁 css/
│   └── auth.css      # Auth-specific styles
└── 📁 js/
    └── auth.js       # Auth functionality
```

## 🎯 Features

- **Login Form**
  - Email/password authentication
  - Remember me option
  - Password visibility toggle
  - Forgot password link

- **Register Form**
  - Full name, phone, email
  - Password with confirmation
  - Form validation

- **Tab Switching**
  - Smooth animated transitions
  - URL hash support (`#login`, `#register`)

## 🔗 URLs

| URL | Action |
|-----|--------|
| `/login` | Shows login tab |
| `/login#register` | Shows register tab |
| `/signup` | Redirects to register tab |

## 💾 Storage

Uses `localStorage` for session:
- `user` - User data object
- `token` - Auth token (mock)

## 📝 Usage

```javascript
// Check if authenticated
const isLoggedIn = localStorage.getItem('user') !== null;

// Get current user
const user = JSON.parse(localStorage.getItem('user'));

// Logout
localStorage.removeItem('user');
localStorage.removeItem('token');
```

## 🔄 Flow

1. User visits `/login`
2. Fills in credentials
3. On success, data stored in localStorage
4. Redirects to `/client/dashboard.html`

---

*See [/docs/ARCHITECTURE.md](/docs/ARCHITECTURE.md) for full project structure*
