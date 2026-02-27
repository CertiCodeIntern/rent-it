# Deep Audit Report — RentIt Rental Management System

> **Role:** Senior Full-Stack System Architect & Lead QA Engineer  
> **Date:** February 21, 2026  
> **Scope:** Exhaustive structural, logical, and data-flow audit  
> **Status:** Issues identified — awaiting implementation

---

## Table of Contents

1. [System Mental Model](#1-system-mental-model)
2. [Critical Issues (Data Loss / Broken Flow)](#2-critical-issues)
3. [High Severity Issues](#3-high-severity-issues)
4. [Medium Severity Issues](#4-medium-severity-issues)
5. [Low Severity Issues](#5-low-severity-issues)
6. [Summary & Priority Matrix](#6-summary--priority-matrix)

---

## 1. System Mental Model

### What This System Is

RentIt is a **vanilla PHP/HTML/CSS/JS rental equipment management system** (videoke/sound equipment) running on XAMPP. It has two user-facing sides:

- **Client App** (`/client`): Customers browse catalog, add to cart, checkout, track rentals
- **Admin App** (`/admin`): Staff manage orders, inventory, dispatch, repairs, late fees

### Data Flow Architecture

```
┌──────────────────────────────────────────────────────────────────────┐
│                          BROWSER (CLIENT)                            │
│                                                                      │
│  Landing Page ──► Auth (login.php) ──► Dashboard ──► Catalog/Cart   │
│       │                  │                              │            │
│       │          localStorage (user)            JS fetch() calls     │
│       │          + PHP $_SESSION                        │            │
└───────┼──────────────────┼──────────────────────────────┼────────────┘
        │                  │                              │
        ▼                  ▼                              ▼
┌──────────────────────────────────────────────────────────────────────┐
│                          PHP BACKEND                                 │
│                                                                      │
│  /api/auth/login.php ─────► $_SESSION['user_id']                    │
│  /client/cart/add_to_cart.php ─► Direct DB query (no API layer)     │
│  /client/checkout/place_order.php ─► INSERT rental + rental_items   │
│  /admin/api/get_orders.php ─► SELECT + JSON response                │
│                                                                      │
│  DB Connection: 3 DIFFERENT patterns (config.php, db_connection.php,│
│                  Database class, + inline connections)               │
└──────────────────────────────────────────────────────────────────────┘
        │
        ▼
┌──────────────────────────────────────────────────────────────────────┐
│                      MySQL (rental_system)                           │
│                                                                      │
│  users ──< cart ──< item                                            │
│  users ──< rental ──< rental_item ──< item                         │
│  users ──< favorites ──< item                                       │
│  (FK constraints exist but are incomplete)                           │
└──────────────────────────────────────────────────────────────────────┘
```

### Key Architectural Observations

1. **Hybrid Auth Model**: Login creates both a PHP `$_SESSION` AND stores user data in `localStorage`. Pages protect themselves server-side via `auth_check.php` (session), but UI chrome (sidebar, topbar) relies on `localStorage`. These two can fall out of sync.

2. **No API Abstraction Layer for Client**: Admin uses `/admin/api/*.php` endpoints (proper REST-ish), but client-side CRUD operations (`add_to_cart.php`, `place_order.php`) are **inline PHP files loaded directly** — mixing presentation and data logic.

3. **Three Database Connection Patterns**: `config.php` (procedural), `shared/php/db_connection.php` (OOP/hybrid), and `api/config/database.php` (class-based). Some admin APIs create their own inline connections. Charset handling is inconsistent (`utf8` vs `utf8mb4`).

4. **Documentation-Reality Gap**: The docs describe features (CSRF tokens, `session_regenerate_id()`, environment variables) that don't exist in the actual code. The architecture docs reference `.html` files while the actual project uses `.php`.

---

## 2. Critical Issues

> Issues that can cause **data loss**, **security breaches**, or **completely broken user flows**.

---

### CRIT-01: SQL Injection — Google OAuth Callback

**File:** `google-callback.php` (Lines ~33-38)

**The Problem:** Variables from Google's API response (`$g_id`, `$g_name`, `$g_email`) are interpolated directly into SQL queries without escaping or prepared statements.

```php
// VULNERABLE
mysqli_query($conn, "SELECT * FROM users WHERE google_id = '$g_id' OR email = '$g_email'");
mysqli_query($conn, "INSERT INTO users (full_name, email, google_id) VALUES ('$g_name', '$g_email', '$g_id')");
```

**Logical Why:** Although these values come from Google, a malicious Google account could have crafted values. More importantly, this pattern establishes a dangerous precedent that developers copy elsewhere.

**Fix:** Use prepared statements with `bind_param()` for all database queries.

---

### CRIT-02: SQL Injection — `place_order.php` (Cart IDs)

**File:** `client/checkout/place_order.php` (Line ~17-28)

**The Problem:** `$cart_ids = $_POST['cart_ids']` is raw user input injected directly into SQL:

```php
$cart_query = "... WHERE c.user_id = ? AND c.id IN ($cart_ids)";
```

While `user_id` is parameterized, `$cart_ids` is not — enabling UNION-based injection.

**Logical Why:** The developer parameterized one value but forgot the other. The `IN (...)` clause requires either multiple `?` placeholders or whitelist validation.

**Fix:** Split `$cart_ids` by comma, cast each to `int`, rebuild the list: `$clean = implode(',', array_map('intval', explode(',', $cart_ids)))`.

---

### CRIT-03: SQL Injection — Facebook OAuth Callback

**File:** `fb-callback.php` (Line ~22)

**The Problem:** `$fb_id` is never escaped: `"SELECT * FROM users WHERE facebook_id = '$fb_id'"`. While `full_name` and `email` use `mysqli_real_escape_string`, the identifier that an attacker most controls is left raw.

**Fix:** Use prepared statements consistently.

---

### CRIT-04: SQL Injection — Password Reset Flow

**File:** `update-password.php` (Lines ~6, ~22-28)

**The Problem:** `$token` from `$_POST` is interpolated directly into an UPDATE query. An attacker could craft a token value that breaks out of the string.

**Fix:** Use prepared statements for the UPDATE query with `bind_param()`.

---

### CRIT-05: SQL Injection — Admin `add_item.php` and `update_item.php`

**Files:** `admin/api/add_item.php` (Lines ~81-107), `admin/api/update_item.php` (Lines ~89-102)

**The Problem:** Despite using `mysqli_real_escape_string`, INSERT/UPDATE queries use string interpolation rather than prepared statements. `$tags`, `$description`, and other free-text fields are injection vectors through encoding bypasses.

**Fix:** Replace all string-interpolated SQL with prepared statements.

---

### CRIT-06: Admin API Endpoints — Zero Authentication

**Files:** 8 admin API endpoints have **no session or role check**:

| Endpoint | Risk |
|----------|------|
| `admin/api/get_orders.php` | Exposes all orders with customer PII |
| `admin/api/get_items.php` | Exposes full inventory |
| `admin/api/get_customers.php` | Exposes all customer PII (names, emails, phones, addresses) |
| `admin/api/get_dispatches.php` | Exposes dispatch data with customer addresses |
| `admin/api/get_history.php` | Exposes all completed order history |
| `admin/api/delete_history.php` | **Destructive** — deletes orders without auth |
| `admin/api/add_item.php` | **Destructive** — creates items without auth |
| `admin/api/get_calendar.php` | Exposes all booking data |

**Logical Why:** These endpoints were likely developed in sequence after `admin_login.php` (which has auth), but the auth check was never propagated. There's no middleware pattern — each endpoint must manually check the session.

**Fix:** Create a shared `admin_auth_check.php` include that every admin API requires at the top. Return HTTP 401 + JSON error if not authenticated.

---

### CRIT-07: Cart Deletion — No User Scoping

**File:** `client/cart/delete_to_cart.php`

**The Problem:** No `session_start()`, no `$_SESSION['user_id']` check, and the DELETE query has **no `user_id` filter**:

```php
$query = "DELETE FROM cart WHERE id IN ($clean_ids)";
```

Any unauthenticated user can delete **any user's** cart items by sending POST with `delete_ids`.

**Logical Why:** The query deletes by cart row ID without verifying ownership. Combined with missing auth, this is an open data destruction endpoint.

**Fix:** Add session validation, add `AND user_id = ?` to the WHERE clause.

---

### CRIT-08: Client-Controlled Order Total

**File:** `client/checkout/place_order.php` (Line ~13)

**The Problem:** `$total_price = $_POST['grand_total']` — the order's financial total comes directly from the client form. An attacker submits `grand_total=0.01` and gets items virtually free.

**Logical Why:** The price should be a **derived server-side calculation** from `item.price_per_day * rental_days * quantity`, never trusted from the client.

**Fix:** Recalculate total server-side by querying item prices and computing `price_per_day * (end_date - start_date)` for each cart item.

---

### CRIT-09: Hardcoded OAuth & SMTP Secrets in Source Code

**Files:** `config.php` (Lines 6-17), `process-forgot.php` (Lines 35-36)

**The Problem:**
- Facebook App Secret: `8a972c2482da4177f5c79e657537979c`
- Google Client Secret: `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`
- Gmail App Password: `piid uptq kuss cuky`

All are in plaintext in version-controlled source files. Anyone with repo access (including the public GitHub) can impersonate the app or send emails as the app.

**Logical Why:** No `.env` file pattern exists in the project. The `config.php` approach works for local dev but these should never be committed.

**Fix:** Create a `.env` file (gitignored), use `parse_ini_file()` or a simple PHP dotenv loader, and replace all hardcoded secrets.

---

### CRIT-10: Missing OAuth Columns in Database

**File:** `rental_system.sql`

**The Problem:** The `users` table has **no `facebook_id` or `google_id` columns**, but both `fb-callback.php` and `google-callback.php` query these columns. OAuth login will fail with SQL errors for every user.

**Logical Why:** The SQL schema dump was likely exported before the OAuth feature was added, or columns were added manually and never reflected in the migration file.

**Fix:** Add `facebook_id VARCHAR(255) NULL` and `google_id VARCHAR(255) NULL` columns to the `users` table in `rental_system.sql`.

---

### CRIT-11: OTP Token Exposed in URL

**File:** `process-verify.php` (Lines ~18-20)

**The Problem:** On successful OTP verification, the user is redirected with the token in the URL:

```php
header("Location: reset-password.php?email=" . urlencode($email) . "&token=" . urlencode($otp));
```

The OTP becomes visible in browser history, server access logs, and the `Referer` header if the user clicks any external link on the reset page.

**Fix:** Store the verified state in `$_SESSION` instead of passing through URL parameters.

---

## 3. High Severity Issues

> Issues that cause **broken features**, **security weaknesses**, or **data integrity problems**.

---

### HIGH-01: No Session Fixation Prevention

**All login paths** (`api/auth/login.php`, `admin/api/admin_login.php`, `fb-callback.php`, `google-callback.php`)

**The Problem:** `session_regenerate_id(true)` is never called after authentication. The docs mention it, but the code doesn't implement it. An attacker who knows a pre-authentication session ID retains access after the victim logs in.

**Fix:** Call `session_regenerate_id(true)` immediately after setting session variables on every login path.

---

### HIGH-02: Registration Creates Dead-End Flow

**Files:** `api/auth/register.php`, `client/auth/js/auth.js` (Lines ~390-398)

**The Problem:** On successful registration:
1. `register.php` returns user data as JSON but **never calls `session_start()`** or sets `$_SESSION`
2. `auth.js` stores the response in `localStorage` and redirects to `dashboard.php`
3. `dashboard.php` includes `auth_check.php` which requires `$_SESSION['user_id']`
4. No session exists → user is redirected back to login

Result: **Every new user registration appears to succeed but immediately bounces to login**. Silent failure with no error message.

**Fix:** Add `session_start()` to `register.php` and set `$_SESSION['user_id']`, `user_name`, `user_email`, `user_role` on successful registration — same as login.

---

### HIGH-03: OAuth Users Missing `user_role` in Session

**Files:** `fb-callback.php` (Lines ~26-38), `google-callback.php` (Lines ~35-41)

**The Problem:** Neither OAuth callback sets `$_SESSION['user_role']`. The client sidebar uses `Components.getCurrentUser()` which reads role from localStorage (which also won't have it for OAuth users). Admin/customer routing depends on role.

**Fix:** Set `$_SESSION['user_role'] = $user['role'] ?? 'customer'` in both callbacks, and include role in the localStorage data.

---

### HIGH-04: Three Conflicting Database Connection Patterns

| Pattern | File | Method | Charset |
|---------|------|--------|---------|
| 1 | `config.php` | `mysqli_connect()` procedural | None set |
| 2 | `shared/php/db_connection.php` | `new mysqli()` | `utf8mb4` |
| 3 | `api/config/database.php` | `Database` class | `utf8` |
| 4 | `admin/api/admin_login.php` | Inline `mysqli_connect()` | None set |

**The Problem:**
- Charset inconsistency (`utf8` vs `utf8mb4`): Can cause encoding issues with emoji or CJK characters
- Multiple simultaneous connections when files include different configs
- Credential changes require updating 4+ files
- `config.php` calls `session_start()` as a side effect — including it after another `session_start()` triggers warnings

**Fix:** Consolidate to a single `db_connection.php` that returns or exports `$conn`, with `utf8mb4` charset. All other files include only this one.

---

### HIGH-05: No CSRF Protection Anywhere

**Entire codebase**

**The Problem:** Zero CSRF tokens exist in any form submission or AJAX request. Every state-changing operation is vulnerable:
- Add to cart, delete from cart
- Place order (checkout)
- Add/remove favorites
- Admin: add item, update order status, delete history

An attacker can embed a form on another site that auto-submits to these endpoints.

**Fix:** Generate a CSRF token per session, embed it in forms as a hidden field, and validate it on every POST handler. For AJAX, include it as a custom header.

---

### HIGH-06: Hardcoded Admin Security Answers

**File:** `admin/api/admin_forgot_password.php` (Lines ~44-49)

**The Problem:** Security question answers are hardcoded with real team member names:
```php
'aaron raven aramil', 'marc steeven parubrub', 'leander ochea', 'via umali'
```

Anyone with source code access can reset any admin password.

**Fix:** Store hashed security answers in the database per-user, or replace with an email-based OTP flow.

---

### HIGH-07: Cart SQL Injection via String Interpolation

**Files:** `client/cart/cart.php`, `client/cart/update_cart.php`

**The Problem:** Even though `$u_id` comes from `$_SESSION`, it's interpolated directly into SQL strings. Session values are relatively trusted but the pattern is dangerous — if any session value is compromised, it becomes an injection vector.

**Fix:** Use prepared statements universally. Never interpolate variables into SQL, regardless of their source.

---

### HIGH-08: Admin N+1 Query Performance Issue

**File:** `admin/api/get_orders.php` (Lines ~26-37)

**The Problem:** For each order returned by the main query, a separate query fetches associated items. With 100 orders, this is 101 queries (N+1 pattern).

**Fix:** Use a single query with JOIN or a batch query: `SELECT * FROM rental_item WHERE order_id IN (...)`.

---

### HIGH-09: Missing Foreign Key Constraints on `cart` Table

**File:** `rental_system.sql`

**The Problem:** The `cart` table has `user_id` and `item_id` columns but no FK constraints. When users or items are deleted, orphaned cart rows persist. No unique constraint on `(user_id, item_id)` — duplicates are handled in PHP but not enforced at DB level.

**Fix:** Add FK constraints with `ON DELETE CASCADE` and a UNIQUE constraint on `(user_id, item_id)`.

---

### HIGH-10: `rental.user_id` Uses `ON DELETE SET NULL`

**File:** `rental_system.sql`

**The Problem:** When a user is deleted, their rental history `user_id` becomes NULL, severing the customer-order relationship permanently. This makes financial reporting and rental tracking impossible for deleted users.

**Fix:** Use `ON DELETE RESTRICT` (prevent user deletion if rentals exist) or implement soft-delete for users.

---

### HIGH-11: Corrupt Seed Data — Empty Rental Record

**File:** `rental_system.sql` (Line ~244)

**The Problem:** `INSERT INTO rental VALUES (1, NULL, NULL, NULL, 0, NULL, 0.00, ...)` — a completely NULL rental. This will appear in admin dashboards as a ghost record and may cause null reference errors in code that doesn't expect empty records.

**Fix:** Remove the empty seed record or populate it with valid test data.

---

## 4. Medium Severity Issues

> Issues that cause **poor UX**, **maintenance headaches**, or **potential future bugs**.

---

### MED-01: Weak OTP — 6-Digit Numeric, No Rate Limiting

**File:** `process-forgot.php` (Line ~22)

**The Problem:** `$otp_code = rand(100000, 999999)` — only 900,000 possible values. With no rate limiting or lockout, an attacker can brute-force the OTP in under a minute with automated requests.

**Fix:** Use `random_int(100000, 999999)` (cryptographically secure), add rate limiting (max 5 attempts per email per 15 minutes), and add OTP expiry (e.g., 10 minutes).

---

### MED-02: Inconsistent Role Values Across Codebase

| Location | Role Value Used |
|----------|----------------|
| `fb-callback.php` | `'client'` |
| `api/auth/register.php` | `'customer'` |
| `rental_system.sql` ENUM | `'admin', 'customer'` |

**The Problem:** Facebook OAuth inserts `'client'` but the ENUM only allows `'admin'` or `'customer'` — the INSERT will either fail silently or store an empty value.

**Fix:** Standardize on `'customer'` everywhere. Update `fb-callback.php`.

---

### MED-03: Promo Codes Validated Client-Side Only

**File:** `client/checkout/checkout.js` (Lines ~106-110)

**The Problem:** 
```js
const promoCodes = { 'WELCOME10': 10, 'RENTIT20': 20, 'SAVE15': 15 };
```
Promo codes and percentages are hardcoded in frontend JS. Combined with CRIT-08 (client-controlled total), this means:
1. Anyone can see all valid promo codes in source
2. Discounts aren't enforced server-side

**Fix:** Move promo validation to backend. Client sends `promo_code` string; server validates, calculates discount, and returns the adjusted total.

---

### MED-04: `BASE_URL` Defined in Multiple Places

| File | Definition | Value |
|------|------------|-------|
| `shared/php/db_connection.php` | `define('BASE_URL', ...)` | Dynamic localhost detection |
| `index.php` | `define('BASE_URL', '/rent-it')` | Static |
| Many templates | Hardcoded `/rent-it/` | Inline |

**The Problem:** If both `db_connection.php` and `index.php` are included, PHP throws a "constant already defined" notice. Changing the base URL requires updating multiple files.

**Fix:** Define `BASE_URL` in exactly one file (the main config) with `defined('BASE_URL') || define('BASE_URL', '/rent-it')`.

---

### MED-05: Inconsistent Database Naming Conventions

| Table | PK Column | FK to users |
|-------|----------|-------------|
| `users` | `id` | — |
| `item` | `item_id` | — |
| `cart` | `id` | `user_id` |
| `favorites` | `favorite_id` | `id` (!!!) |
| `rental` | `order_id` or `rental_id`? | `user_id` |
| `rental_item` | `rental_item_id` | — (FK: `order_id` → `rental.order_id`) |

**The Problem:**
- `favorites.id` means `user_id` — extremely confusing, breaks convention
- `rental` table uses `order_id` as PK in some contexts and `rental_id` in others
- No consistent pattern: `{table}_id` vs bare `id`

**Fix:** Standardize: all PKs use `{table}_id`, all FKs use `{referenced_table}_id`. This requires a migration.

---

### MED-06: Missing Database Indexes

| Table | Missing Index | Impact |
|-------|--------------|--------|
| `cart` | `user_id`, `item_id` | Full table scan on every cart query |
| `rental` | `rental_status` | Status-based filters in every admin API |
| `rental` | `start_date, end_date` | Date range queries in dispatch/calendar |
| `rental_item` | `item_id` | Reverse lookups |
| `users` | `email` (unique exists) | OK |

**Fix:** Add indexes for frequently-queried columns.

---

### MED-07: Images Stored as `LONGBLOB` in Database

**File:** `rental_system.sql`

**The Problem:** `users.profile_picture`, `id_front`, `id_back` are `LONGBLOB` (up to 4GB each). This bloats the database, slows queries, and makes backups massive. Meanwhile, `user_settings.profile_picture` is `VARCHAR(255)` — suggesting a migration was started but not completed.

**Fix:** Store images in `assets/profile/` and save the file path as VARCHAR. Update upload handlers to save to disk.

---

### MED-08: Inconsistent Error Response Formats

| Endpoint | Success Key | Error Format |
|----------|-------------|-------------|
| `api/auth/login.php` | `"success": true` | `{"success": false, "message": "..."}` |
| `admin/api/get_orders.php` | `"status": "success"` | `{"status": "error", "message": "..."}` |
| `client/cart/delete_to_cart.php` | `"success": true` | `{"success": false, "error": mysqli_error()}` |

**The Problem:** Frontend code must handle multiple response shapes. Some endpoints leak internal DB errors to the client.

**Fix:** Standardize all API responses to `{"success": bool, "message": "...", "data": ...}`. Never expose `mysqli_error()` to the client.

---

### MED-09: Mixed Component Loading Strategy

**The Problem:** 
- Sidebar, topbar, footer = injected via JavaScript (`Components.inject*()`)
- Session/auth checks = done in PHP before page load
- If JS fails to load, the entire page chrome is missing but content renders

This creates a "flash of unstyled content" and is poor progressive enhancement.

**Fix:** Consider rendering navigation in PHP (server-side) or at minimum add a `<noscript>` fallback.

---

### MED-10: Favorites Fetch Missing Error Handling

**File:** `client/favorites/favorites.js`

**The Problem:** `removeFavorite` fetch has `.catch` that only logs to console — no user-facing error message. `moveToCart` doesn't clearly indicate failure to the user.

**Fix:** Add SweetAlert2 error notifications on all catch blocks, consistent with other pages.

---

### MED-11: `$_REQUEST` Usage in `add_to_cart.php`

**File:** `client/cart/add_to_cart.php` (Line ~14)

**The Problem:** `$item_id = $_REQUEST['item_id'] ?? $_GET['id']` — using `$_REQUEST` mixes GET, POST, and COOKIE data, potentially allowing values from unexpected sources.

**Fix:** Use `$_POST['item_id']` specifically for state-changing operations.

---

### MED-12: Documentation References Outdated File Extensions

**Multiple docs files**

**The Problem:** Architecture docs reference `.html` files (`login.html`, `dashboard.html`, `index.html`) while the actual project has migrated to `.php` files. The `stepbystep-project.md` still references React/Vite commands (`npm run dev`) and the `startlocalhost.md` describes a React/Vite setup.

**Fix:** Update all docs to reflect the current PHP-based architecture.

---

### MED-13: `rental_item` Seed Data Missing Dates

**File:** `rental_system.sql`

**The Problem:** INSERT statements for `rental_item` don't include `start_date` and `end_date`, so all seeded items have NULL dates. The code uses `COALESCE(ri.start_date, r.start_date)` as a workaround.

**Fix:** Populate seed data with proper dates, or remove the columns from `rental_item` if they should always inherit from `rental`.

---

### MED-14: Logout CORS Allows Wildcard Origin

**File:** `api/auth/logout.php` (Line ~3)

**The Problem:** `Access-Control-Allow-Origin: *` on a session-destroying endpoint enables cross-origin logout attacks from any website.

**Fix:** Restrict to `http://localhost` or the production domain, matching the login endpoint's pattern.

---

## 5. Low Severity Issues

> **Inconsistencies**, **micro-optimizations**, and **code hygiene issues**.

---

### LOW-01: Inconsistent CORS Headers

- `api/auth/login.php`: `Allow-Origin: http://localhost`
- `api/auth/register.php`, `check_session.php`, `logout.php`: `Allow-Origin: *`

**Fix:** Standardize CORS headers across all endpoints. Use a shared CORS include.

---

### LOW-02: Database Error Leakage to Client

**File:** `client/cart/delete_to_cart.php` — returns `mysqli_error($conn)` in JSON response. Other endpoints may also leak stack traces.

**Fix:** Log errors server-side; return generic "An error occurred" to client.

---

### LOW-03: No `created_at`/`updated_at` Audit Columns

Tables missing timestamps: `rental` (partial), `rental_item`, `calendar`, `penalty_tracker`, `repair`. Makes debugging and auditing impossible.

**Fix:** Add `created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP` and `updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP` to all tables.

---

### LOW-04: Fetch Calls Missing `credentials` Option

**File:** `client/auth/js/auth.js` — login fetch doesn't specify `credentials: 'same-origin'` or `'include'`.

**Fix:** Add `credentials: 'same-origin'` to all fetch calls that need session cookies.

---

### LOW-05: `delete_to_cart.php` Named Inconsistently

File is `delete_to_cart.php` (suggesting "delete to" rather than "delete from"). Other files use `add_to_cart.php`. Inconsistent naming.

**Fix:** Rename to `remove_from_cart.php` to match the action semantics.

---

### LOW-06: `config.php` Double Session Start Risk

`config.php` calls `session_start()` unconditionally. Files that already called `session_start()` before including `config.php` will get "session already started" notices.

**Fix:** Use `if (!session_id()) session_start();` (already done in current config, but verify all code paths).

---

### LOW-07: No `.htaccess` Protection for Sensitive Directories

Directories like `api/config/`, `shared/php/`, `libs/PHPMailer/` are directly browsable. Database credentials in `database.php` can be viewed.

**Fix:** Add `.htaccess` with `Deny from all` to `api/config/`, `shared/php/`, and `libs/`.

---

### LOW-08: Redundant `auth_check.php` Includes Without Standardization

Multiple client pages include session validation but each implements it slightly differently (some check `user_id`, others check `user_email`, some redirect to different login URLs).

**Fix:** Create one canonical `auth_check.php` with configurable redirect and role requirements.

---

---

## 6. Summary & Priority Matrix

### Issue Count by Severity

| Severity | Count | Key Themes |
|----------|-------|------------|
| **Critical** | 11 | SQL injection (5), missing auth on admin APIs (8 endpoints), hardcoded secrets, client-controlled pricing, missing DB columns |
| **High** | 11 | No session fixation prevention, no CSRF, registration dead-end, 3 DB connection patterns, broken OAuth flow, N+1 queries |
| **Medium** | 14 | Weak OTP, inconsistent naming, missing indexes, BLOB storage, mixed config, outdated docs, error format inconsistency |
| **Low** | 8 | CORS inconsistency, error leakage, missing timestamps, naming nits |

### Implementation Priority Roadmap

#### Sprint 1 — Security Emergency (Do First)
| ID | Task | Effort |
|----|------|--------|
| CRIT-06 | Add auth checks to all admin API endpoints | 2 hours |
| CRIT-01/02/03/04/05 | Replace all SQL string interpolation with prepared statements | 4-6 hours |
| CRIT-09 | Move secrets to `.env` file | 1 hour |
| CRIT-07 | Add user scoping to cart deletion | 30 min |
| CRIT-08 | Server-side price recalculation | 2 hours |

#### Sprint 2 — Auth & Session Hardening
| ID | Task | Effort |
|----|------|--------|
| HIGH-01 | Add `session_regenerate_id()` to all login paths | 30 min |
| HIGH-02 | Fix registration dead-end (add session creation) | 30 min |
| HIGH-03 | Add `user_role` to OAuth session handling | 30 min |
| HIGH-05 | Implement CSRF token system | 3-4 hours |
| CRIT-10 | Add missing OAuth columns to schema | 15 min |
| CRIT-11 | Use session instead of URL for OTP state | 1 hour |

#### Sprint 3 — Architecture Consolidation
| ID | Task | Effort |
|----|------|--------|
| HIGH-04 | Consolidate to single DB connection | 2-3 hours |
| MED-04 | Unify `BASE_URL` definition | 30 min |
| MED-08 | Standardize API response format | 2 hours |
| MED-12 | Update all docs to reflect PHP reality | 1-2 hours |

#### Sprint 4 — Data Integrity & Performance
| ID | Task | Effort |
|----|------|--------|
| HIGH-09 | Add FK constraints to cart table | 30 min |
| MED-05 | Database naming convention migration | 3-4 hours |
| MED-06 | Add database indexes | 30 min |
| MED-07 | Migrate BLOB columns to file paths | 2-3 hours |
| HIGH-08 | Fix N+1 query in get_orders | 1 hour |

#### Sprint 5 — Polish & Hardening
| ID | Task | Effort |
|----|------|--------|
| MED-01 | Strengthen OTP + rate limiting | 2 hours |
| MED-03 | Server-side promo validation | 1-2 hours |
| LOW-* | All low-severity items | 2-3 hours |

---

*Audit conducted by Claude, acting as Senior Full-Stack System Architect & Lead QA Engineer*  
*Based on full source code analysis of 45+ files across PHP backend, JavaScript frontend, and SQL schema*
