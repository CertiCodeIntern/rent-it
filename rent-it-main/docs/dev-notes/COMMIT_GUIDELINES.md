# 📋 Commit Guidelines & Professional Message Format

> Professional, corporate-style commit messages for the CertiCode project.

**Purpose:** Ensure clear, consistent, and traceable commit history across all developers.

---

## 🎯 Commit Format Standard

Every commit message must follow this structure:

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Format Breakdown

| Part | Rules | Example |
|------|-------|---------|
| **type** | One word, lowercase | `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore` |
| **scope** | What part of app | `client`, `auth`, `dashboard`, `api`, `styles`, `docs` |
| **subject** | Imperative, ≤50 chars | `add user profile page` |
| **body** | Details (optional) | `- What: ...` `- Why: ...` |
| **footer** | Issue/breaking notes | `Closes #123` `BREAKING CHANGE: ...` |

---

## 📝 Commit Types

| Type | Use When | Example |
|------|----------|---------|
| `feat` | Adding new feature | `feat(client): add user profile page` |
| `fix` | Bug fix | `fix(auth): resolve login redirect issue` |
| `docs` | Documentation changes | `docs: update CHANGELOG for v0.2.0` |
| `style` | CSS, formatting (no logic) | `style(landing): update hero section colors` |
| `refactor` | Code restructuring | `refactor(auth): consolidate form validation` |
| `perf` | Performance improvement | `perf(dashboard): optimize tab switching` |
| `test` | Test additions/updates | `test(auth): add login form validation tests` |
| `chore` | Build, dependencies, setup | `chore: update vercel.json routes` |

---

## ✍️ How to Write Good Commits

### ✅ DO

- Use **imperative mood** ("add feature" not "added feature")
- Keep **subject line ≤ 50 characters** (≤ 72 absolute max)
- **Capitalize first letter** of subject
- **One logical change** per commit
- Include **Why** and **What** in body if needed

### ❌ DON'T

- Don't use periods at the end of subject
- Don't capitalize type name: `feat` not `Feat`
- Don't mix multiple features in one commit
- Don't write vague messages like "update code" or "fix stuff"

---

## 📚 Real-World Examples

### Example 1: Adding a Feature

```
feat(client-dashboard): add user settings page

- What: Created new settings page accessible from dashboard sidebar
- Why: Users need ability to manage preferences and account settings
- Impact: Added /client/dashboard/settings.html, updated components.js
- Tests: Verified page loads for authenticated users, redirect works for non-auth
```

### Example 2: Bug Fix

```
fix(auth): prevent form submission on empty fields

- What: Added client-side validation to prevent sending empty data
- Why: Backend was receiving malformed requests causing 500 errors
- Impact: Modified /client/auth/js/auth.js validation logic
- Tests: Manual testing with empty inputs confirmed validation triggers
```

### Example 3: Documentation Update

```
docs: add environment setup instructions to README

- What: Added section covering Python server setup and Live Server extension
- Why: New developers were confused about how to run project locally
- Impact: Updated main README.md with detailed quick-start steps
- Tests: Followed instructions on fresh clone, all links work
```

### Example 4: Styling Change

```
style(landing): update hero section background gradient

- What: Changed hero gradient from blue-green to green-teal using CSS tokens
- Why: Updated design aligns with new brand color scheme
- Impact: Modified /shared/css/landing.css color variables
- Tests: Verified gradient on desktop (1920px) and mobile (375px) views
```

### Example 5: Refactoring

```
refactor(auth): extract form validation into reusable function

- What: Moved validation logic from auth.js into shared utils
- Why: Both client and admin auth pages need same validation rules
- Impact: Created /shared/js/validators.js, updated auth.js imports
- Tests: Tested login/register forms on both client and admin sides
```

### Example 6: Performance Improvement

```
perf(dashboard): lazy load tab content instead of pre-loading

- What: Modified dashboard.js to load tab content only when clicked
- Why: Initial page load was slow due to loading all tabs upfront
- Impact: Updated Components.loadTabContent() to use dynamic loading
- Tests: Measured page load time reduction (from 3.2s to 1.8s)
```

---

## 🚀 Implementation Approach

### Option A — Manual (Recommended for this project)

Use the templates below to write focused commits with full context.

```bash
git add .
git commit -m "feat(client): add user profile page

- What: Created new settings page in dashboard
- Why: Users need to manage their profile
- Impact: Added settings.html and updated sidebar
- Tests: Tested on all major browsers"
```

### Option B — Using a Template File

Create a file `COMMIT_MSG.txt` with your message:

```bash
git commit -F COMMIT_MSG.txt
```

Then delete the file:

```bash
rm COMMIT_MSG.txt
```

---

## 📋 Quick Copy-Paste Templates

### For New Features
```
feat(<scope>): <short description>

- What: 
- Why: 
- Impact: 
- Tests:
```

### For Bug Fixes
```
fix(<scope>): <short description>

- What: 
- Why: 
- Impact: 
- Tests:
```

### For Documentation
```
docs: <short description>

- What: 
- Why: 
- Impact: 
- Tests:
```

### For Style Changes
```
style(<scope>): <short description>

- What: 
- Why: 
- Impact: 
- Tests:
```

---

## 👥 For Your Dev Team

### Things to Emphasize

1. **Every commit must have a reason** — not just "what changed" but "why it changed"
2. **Keep commits atomic** — one feature per commit, one fix per commit
3. **Be specific with scope** — `client`, `auth`, `dashboard`, etc.
4. **The body matters** — it's your documentation 6 months later
5. **Search by type** — makes it easy to find all `fix:` or `feat:` commits

### Example Scenario

❌ Bad:
```
git commit -m "update code"
```

✅ Good:
```
git commit -m "feat(client-auth): add password strength indicator

- What: Added visual feedback showing password complexity
- Why: Users weren't aware of password requirements
- Impact: Updated auth.css and auth.js
- Tests: Tested with various passwords"
```

---

## 🔄 Merging Back to Main README

The main [README.md](/README.md) now references this document. Developers should:

1. **Read this file** for detailed guidelines
2. **Use the format** in all their commits
3. **Ask if unsure** — this file is the source of truth

---

## Commit Message Template (Corporate style)

Title (imperative, short):

    <scope>: <short summary>

Body (optional, 1–3 lines; use bullets if needed):

    - What: One-line description of the change.
    - Why: Reason or problem addressed.
    - Impact: Files affected, runtime effects, or backward-compat notes.
    - Tests: Manual checks performed or areas to verify.

Example structure:

    typography: add modular type scale and tokens

    - What: Introduces CSS variables for a Major Third type scale, line-height and letter-spacing tokens, and utility classes.
    - Why: Normalize typography across the app and improve readability.
    - Impact: Updated `css/styles.css` and replaced many hardcoded font-size/spacing values.
    - Tests: Visual check of auth and dashboard pages; responsive checks at 768px and 480px.

---

## Ready-to-use commit messages for recent edits

1) Typography system

Title:

    typography: add modular scale tokens and base utilities

Body:

    - What: Added full typographic design tokens (`--font-size-*`, `--line-height-*`, `--letter-spacing-*`), responsive adjustments, and utility classes (`.text-h1`..`.text-body-*`).
    - Why: Consolidate inconsistent sizes and line-heights for better readability and maintainability.
    - Impact: `css/styles.css` modified extensively; minor CSS updates across components to use tokens.
    - Tests: Visual confirmation on auth screen and main layout; mobile sizes checked at 768px/480px.

2) Auth footer improvement

Title:

    auth: improve footer markup and micro-typography

Body:

    - What: Replace single-line footer with structured markup (`.auth-footer-icon`, `.auth-footer-text`, `.auth-footer-label`, `.auth-footer-links`) and added layout + micro-typography styles.
    - Why: Improve trust, spacing and readability on the auth screen.
    - Impact: `index.html` updated (auth footer markup), `css/styles.css` updated (footer styles).
    - Tests: Visual verification of footer spacing and link styles on auth page.

3) Motion & loader helpers

Title:

    perf/ux: add minimal motion tokens and async loader helpers

Body:

    - What: Add animation tokens, `fadeUp` & `shimmer` keyframes, skeleton utilities, and JS helpers `loadWithLoader` and `staggerEntrance` for staggered entrance and async-aware loading.
    - Why: Add subtle, accessible motion and robust loading UX that reacts to real network latency.
    - Impact: `css/styles.css` (new animation tokens & rules) and `js/app.js` (helpers exported on `window.AppUtils`). Motion is disabled if `prefers-reduced-motion`.
    - Tests: Confirmed `.auth-card` children get staggered entrance on DOMContentLoaded; reduced-motion respected.

---

## Quick commit examples (one-liners you can paste and edit)

- `git commit -m "typography: add modular scale tokens and base utilities"`
- `git commit -m "auth: improve footer markup and micro-typography"`
- `git commit -m "perf/ux: add animation tokens and async loader helpers"`

Tip: To include the body text when committing, create a temporary file `COMMIT_MSG.txt` with the title+body then run:

```bash
git commit -F COMMIT_MSG.txt
```

or on Windows (PowerShell):

```powershell
git commit -F .\COMMIT_MSG.txt
```

---

## Small automation snippet (optional)

If you want a tiny Node helper to open a prefilled commit message for quick edit before committing, drop this in `scripts/prepareCommit.js` and run `node scripts/prepareCommit.js` to create `COMMIT_MSG.txt`:

```js
const fs = require('fs');
const template = `### Title (imperative):\n\nscope: short-summary\n\n- What: \n- Why: \n- Impact: \n- Tests: \n`;
fs.writeFileSync('COMMIT_MSG.txt', template);
console.log('COMMIT_MSG.txt created — edit then run `git commit -F COMMIT_MSG.txt`');
```

This is optional and intentionally tiny to keep token and dependency overhead low.

---

If you'd like, I can now add a small `COMMIT_MSG.txt` example and the optional Node helper to the repo, or simply provide ready-to-use one-line corporate commits for each change — tell me which.