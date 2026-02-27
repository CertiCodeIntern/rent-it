# 🎛️ RentIt Admin Portal Architecture

> **Complete guide to the Admin Dashboard system**  
> Last Updated: February 2, 2026 | Version: 2.5.0

---

## 📋 Overview

The Admin Portal is the back-office management system for RentIt. It provides staff and managers with tools to manage inventory, bookings, maintenance, customers, and operations.

### Key Features
- 📊 **Dashboard** - Real-time KPIs and quick actions
- 📅 **Calendar Master View** - Visual booking/availability grid
- 🔧 **Repairs Management** - Track maintenance and cleaning
- 💰 **Late Fees Tracker** - Monitor overdue rentals and penalties
- 🚚 **Dispatch** - Schedule deliveries and pickups
- 👥 **Customers** - Customer database and history
- ⚙️ **Settings** - System configuration

---

## 📁 Directory Structure

```
admin/
│
├── 📄 dashboard.html              # Main entry point
│
├── 📁 auth/                       # Authentication
│   ├── 📄 login.html
│   ├── 📁 css/
│   │   └── auth.css
│   └── 📁 js/
│       └── auth.js
│
├── 📁 dashboard/                  # Dashboard module
│   ├── 📁 css/
│   │   └── dashboard.css
│   └── 📁 js/
│       └── dashboard.js
│
├── 📁 calendar/                   # Calendar Master View
│   ├── 📄 calendar.html
│   ├── 📄 calendar.css
│   └── 📄 calendar.js
│
├── 📁 repairs/                    # Repairs & Maintenance
│   ├── 📄 repairs.html
│   ├── 📄 repairs.css
│   └── 📄 repairs.js
│
├── 📁 latefees/                   # Late Fees Tracker
│   ├── 📄 latefees.html
│   ├── 📄 latefees.css
│   └── 📄 latefees.js
│
├── 📁 dispatch/                   # Dispatch Management
│   ├── 📄 dispatch.html
│   ├── 📄 dispatch.css
│   └── 📄 dispatch.js
│
├── 📁 customers/                  # Customer Management
│   ├── 📄 customers.html
│   ├── 📄 customers.css
│   └── 📄 customers.js
│
├── 📁 settings/                   # System Settings
│   ├── 📄 settings.html
│   ├── 📄 settings.css
│   └── 📄 settings.js
│
├── 📁 shared/                     # Shared Admin Resources
│   ├── 📁 css/
│   │   ├── admin-theme.css        # Admin color palette & theme
│   │   ├── admin-globals.css      # Base styles, reset
│   │   └── admin-components.css   # UI components
│   └── 📁 js/
│       └── admin-components.js    # Sidebar, header, utilities
│
└── 📄 README-admin.md             # This file
```

---

## 🎨 Design System

### Color Palette

| Token | Light | Dark | Usage |
|-------|-------|------|-------|
| `--admin-bg-primary` | `#F3F4F6` | `#0A0F1A` | Page background |
| `--admin-bg-secondary` | `#FFFFFF` | `#111827` | Cards, header |
| `--admin-bg-card` | `#FFFFFF` | `#1A2332` | Elevated cards |
| `--admin-accent` | `#FB7012` | `#FB7012` | CTAs, highlights |
| `--admin-text-primary` | `#111827` | `#F1F5F9` | Main text |
| `--admin-text-secondary` | `#4B5563` | `#9CA3AF` | Muted text |

### Status Colors

| Status | Color | Hex | Usage |
|--------|-------|-----|-------|
| Success | Green | `#22C55E` | Completed, available |
| Warning | Amber | `#F59E0B` | Pending, attention |
| Danger | Red | `#EF4444` | Overdue, errors |
| Info | Blue | `#3B82F6` | Booked, in-transit |
| Neutral | Gray | `#6B7280` | Inactive, disabled |

---

## 📄 Page Specifications

### 1. Dashboard (`dashboard.html`)
**KPIs:** Revenue, Active Rentals, Pending Deliveries, Available Machines  
**Widgets:** Recent Bookings Table, Delivery Schedule, Inventory Health

### 2. Calendar (`calendar/calendar.html`)
**View:** Week grid with asset rows and day columns  
**Filters:** Asset Type, Status (Booked, Repair, Cleaning, Available)  
**Actions:** New Booking, View booking details

### 3. Repairs (`repairs/repairs.html`)
**KPIs:** In Repair, Cleaning, Completed Today, Overdue  
**Table:** Item, Status, Start Date, Expected Completion, Actions  
**Actions:** Add Repair, Mark Repaired/Cleaned, Remove from catalog

### 4. Late Fees (`latefees/latefees.html`)
**KPIs:** Total Overdue, Fees Due, Avg Days Late, Collected Today  
**Table:** Customer, Item, Due Date, Days Overdue, Fee, Actions  
**Actions:** Send Reminder, Apply Fee, Bulk actions

### 5. Dispatch (`dispatch/dispatch.html`)
**Features:** Delivery scheduling, driver assignment, route planning

### 6. Customers (`customers/customers.html`)
**Features:** Customer list, booking history, contact info

### 7. Settings (`settings/settings.html`)
**Features:** System config, fee rates, email templates

---

## 🌓 Theme Support

Both Light and Dark themes are supported with CSS custom properties.

**Toggle Shortcut:** Click theme button in header or press `Alt + T`

**Persistence:** Theme preference saved to `localStorage`

**Contrast:** All combinations meet WCAG AA (4.5:1 for text)

---

## 🔗 Related Documentation

- [Project Architecture](../docs/PROJECT-ARCHITECTURE.md)
- [Design System Rules](../rules/design-system.md)
- [Claude AI Reminders](../rules/CLAUDE-REMINDERS.md)

---

**© 2026 CertiCode | RentIt Videoke Rentals v2.5.0**
- Implement role-based access control (RBAC)
- Consider IP whitelisting for production
- Add audit logging for admin actions

---

*See [/docs/ARCHITECTURE.md](/docs/ARCHITECTURE.md) for full project structure*
