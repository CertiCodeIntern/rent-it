# 📄 Static Pages

> About, Contact, Privacy, Terms, and other informational pages.

## 📁 Structure

```
pages/
├── 📄 about.html       # About Us page
├── 📄 contact.html     # Contact Us page
├── 📄 privacy.html     # Privacy Policy
├── 📄 terms.html       # Terms of Service
├── 📄 pages.css        # Shared styles for all pages
└── README-pages.md     # This file
```

## 🎯 Purpose

This folder contains static informational pages that are not part of the core application functionality:

- **About** - Company story, mission, values
- **Contact** - Contact form, email, phone, address
- **Privacy** - Privacy policy and data handling
- **Terms** - Terms of service and user agreements

## 🔗 URLs

| URL | Page |
|-----|------|
| `/about` | `about.html` |
| `/contact` | `contact.html` |
| `/privacy` | `privacy.html` |
| `/terms` | `terms.html` |

## 🎨 Styling

All pages share:
- `/shared/css/globals.css` - Design tokens
- `/shared/css/landing.css` - Navbar and footer styles
- `pages.css` - Page-specific styles (header, content grid, legal layout)

## 📝 Adding New Pages

1. Copy an existing page as a template
2. Update the content
3. Add route to `vercel.json`
4. Update footer links if needed

---

*See [/docs/ARCHITECTURE.md](/docs/ARCHITECTURE.md) for full project structure*
