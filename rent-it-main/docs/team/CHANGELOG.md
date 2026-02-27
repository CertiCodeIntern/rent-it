# 📦 Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Planned
- Admin authentication system
- Admin dashboard
- API integration
- Database connection

---

## [0.2.0] - 2026-01-29

### 👤 Contributors
- **Marc | Frontend** - Project restructure and folder organization

### ➕ Added
- Landing page (`index.html`) in root directory
- Client-side folder structure (`/client`)
- Admin-side folder structure (`/admin`)
- Documentation system (`/docs`)
- Shared assets folder (`/shared`)
- Folder-specific README files
- CHANGELOG.md for version tracking
- ARCHITECTURE.md for folder documentation

### 🔄 Changed
- Moved authentication pages to `/client/auth/`
- Moved dashboard to `/client/dashboard/`
- Reorganized CSS/JS to shared folder
- Updated all internal paths and redirects
- Updated `vercel.json` with new route mappings

### 🗑️ Removed
- Old flat file structure

### 📝 Notes
- Entry point is now `index.html` (landing page) in root
- Client login at `/client/auth/login.html`
- All shared styles/scripts in `/shared/`

---

## [0.1.0] - 2026-01-29

### 👤 Contributors
- **Marc | Frontend** - Initial vanilla migration

### ➕ Added
- Complete migration from React/Vite to Vanilla HTML/CSS/JS
- Login and Registration pages with tab switching
- Client dashboard with sidebar navigation
- Reusable JavaScript components (`components.js`)
- CSS custom properties (design tokens)
- Responsive design for all screen sizes
- Work in Progress (WIP) page
- Vercel deployment configuration

### 🗑️ Removed
- React framework and dependencies
- Vite build system
- Node modules
- All npm packages

### 🔧 Technical Details
- Zero build step required
- Pure HTML5, CSS3, ES6+ JavaScript
- localStorage for session management
- CSS animations and transitions

---

## Version History Summary

| Version | Date | Summary |
|---------|------|---------|
| 0.2.0 | 2026-01-29 | Project restructure with client/admin separation |
| 0.1.0 | 2026-01-29 | Initial vanilla HTML/CSS/JS migration |

---

## Commit Message Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting
- `refactor`: Code restructure
- `chore`: Maintenance
- `perf`: Performance

### Example
```
feat(client): add user authentication system

- Implement login form with validation
- Add registration with password confirmation
- Create localStorage session management

Closes #123
```
