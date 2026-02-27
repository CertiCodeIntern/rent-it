# 👤 Client Application

> Customer-facing pages and functionality.

## 📁 Structure

```
client/
├── 📁 auth/          # Authentication (Login/Register)
└── 📁 dashboard/     # Client Dashboard
```

## 🔗 URLs

| Route | Page | Description |
|-------|------|-------------|
| `/login` | `auth/login.html` | Login page |
| `/signup` | `auth/login.html#register` | Registration |
| `/dashboard` | `dashboard/index.html` | User dashboard |

## 🎯 Purpose

This folder contains all customer-facing functionality:
- User authentication (login/register)
- Dashboard for managing rentals
- User profile and settings
- Rental history and payments

## 📝 Development Notes

- Uses shared CSS from `/shared/css/globals.css`
- Uses shared JS components from `/shared/js/components.js`
- All paths should be absolute (starting with `/`)

---

*See [/docs/ARCHITECTURE.md](/docs/ARCHITECTURE.md) for full project structure*
