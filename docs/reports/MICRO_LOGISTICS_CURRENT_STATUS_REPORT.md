# MICRO-LOGISTICS — CURRENT PROJECT STATUS AND SECURITY AUDIT REPORT

**Project:** Micro-Logistics Management and Local E-Commerce Order Aggregation Network  
**Audit Date:** October 28, 2026  
**Git Branch:** `main`  
**Current HEAD Commit:** `a8b4db0` (`fix(auth): clean up merge resolution and keep customer profile address rectification`)  
**Previous Security Audit Commit:** `54ca7d5` (`fix(security): complete authentication, customer access and security hardening across all portals`)  
**Working Tree Status:** Clean (no unstaged, staged, or untracked files)

---

## 1. Executive Summary

A comprehensive, non-destructive audit of the entire Micro-Logistics codebase was performed to evaluate the current authentication, role authorization, and database security baseline before applying Supabase Row-Level Security (RLS) policies.

### Key Audit Findings

1. **Security Baseline Maintained:** All backend security protections implemented in commit `54ca7d5` remain intact in `backend/src/`. Client-supplied header spoofing (`x-user-id`, `x-user-role`) is completely disabled in production, server-side role resolution from the database `profiles` table is enforced, public registration of `admin` accounts is blocked, and catalog price/stock validation is active.
2. **Subsequent Frontend Changes Verified:** Two commits (`63344f8` and `a8b4db0`) were merged into `main` after the previous security audit. These commits enhanced the customer dashboard UI, introduced delivery address rectification for demo customer accounts (`c1`–`c4`), and aligned customer wishlist components. The changes were audited and confirmed not to weaken authentication or authorization controls.
3. **Automated Verification Passing:**
   - **Backend Test Suite:** All 29 tests across 4 test files passed with 0 failures (`backend/tests/security.test.js`, `backend/tests/health.test.js`, `backend/tests/api.test.js`, `backend/tests/seed.test.js`).
   - **Frontend Production Build:** `npm run build` completed successfully in 2.97s with 0 errors across 51 chunks.
   - **Frontend Lint:** 0 errors (369 pre-existing template warnings).
4. **Current Database Security Gap (RLS Disabled):** Inspection confirms that Supabase database tables currently have Row-Level Security **disabled**, and querying `pg_policies` returns zero rows. While the Node/Express backend enforces strict data isolation in application logic, the database itself is currently unprotected against direct REST queries made using the public Supabase anonymous key (`VITE_SUPABASE_ANON_KEY`).
5. **Secret Hygiene Clean:** All `.env` files (`.env`, `.env.production`, `frontend/.env`) and test audit dumps have been untracked from Git. Root `.gitignore` has been hardened with `**/.env` and `**/.env.*`. No secrets or passwords exist in tracked files.

---

## 2. Changes Since the Previous Security Report

A diff and commit log analysis between commit `54ca7d5` and `HEAD` (`a8b4db0`) revealed 14 modified files across the frontend repository:

```
 index.html                                 |    2 +-
 src/auth/LoginPage.jsx                     |   28 +-
 src/components/common/Header.css           |  139 +++
 src/components/common/Header.jsx           |  105 +-
 src/context/AppContext.jsx                 |   31 +-
 src/data/demoData.js                       |   36 +-
 src/layouts/DashboardLayout.css            |   11 +
 src/layouts/DashboardLayout.jsx            |    5 +-
 src/portals/customer/CheckoutPage.jsx      |    6 +-
 src/portals/customer/CustomerDashboard.css | 1582 ++++++++++++++++++++++++----
 src/portals/customer/CustomerDashboard.jsx |  817 +++++++++++---
 src/portals/customer/CustomerWishlist.css  |  262 +++--
 src/portals/customer/ProfilePage.jsx       |   72 +-
 src/utils/customerDirectory.js             |  238 +++++
 14 files changed, 2845 insertions(+), 489 deletions(-)
```

### Detailed Evaluation of Modified Files

| File | Change Category | Audit Evaluation |
|---|---|---|
| [`src/utils/customerDirectory.js`](file:///c:/Users/Admin/Desktop/Micro-Logistics/src/utils/customerDirectory.js) | New File | Client-side directory mapping distinct delivery addresses and saved locations for accounts (`c1`–`c4`). Purely presentational; does not bypass server-side ownership. |
| [`src/auth/LoginPage.jsx`](file:///c:/Users/Admin/Desktop/Micro-Logistics/src/auth/LoginPage.jsx) | Authentication UI | Enriches customer login state by querying `customer_profiles` table for address and phone, and passes through `rectifyCustomerUser`. Supabase Auth `signInWithPassword`, submit throttling (`isSubmitting`), and error clearing remain active. |
| [`src/context/AppContext.jsx`](file:///c:/Users/Admin/Desktop/Micro-Logistics/src/context/AppContext.jsx) | State Management | Added address rectification wrapper on `currentUser`. Added `api.get('/customers/' + id)` to sync address on mount. Session restoration (`authLoading`, `getSession`) and unified `logout()` remain fully intact. |
| [`src/portals/customer/CustomerDashboard.jsx`](file:///c:/Users/Admin/Desktop/Micro-Logistics/src/portals/customer/CustomerDashboard.jsx) & CSS | UI / Layout | Reorganized customer landing layout, category filter bar, active order tracking hero banner, and promotional cards. |
| [`src/portals/customer/CustomerWishlist.css`](file:///c:/Users/Admin/Desktop/Micro-Logistics/src/portals/customer/CustomerWishlist.css) | Styling | Grid alignment fixes for wishlist product cards. |
| [`src/portals/customer/CheckoutPage.jsx`](file:///c:/Users/Admin/Desktop/Micro-Logistics/src/portals/customer/CheckoutPage.jsx) | Checkout UI | Displays rectified saved addresses during checkout. Orders still route through `/api/v1/orders` where backend catalog price validation is enforced. |
| [`src/portals/customer/ProfilePage.jsx`](file:///c:/Users/Admin/Desktop/Micro-Logistics/src/portals/customer/ProfilePage.jsx) | Profile UI | Displays rectified delivery locations. |
| [`src/components/common/Header.jsx`](file:///c:/Users/Admin/Desktop/Micro-Logistics/src/components/common/Header.jsx) & CSS | Navigation | Header layout and search bar styling refinements. |

---

## 3. Current Authentication and Authorization Status

### Supabase Session Management & Restoration
- **Boot Lifecycle:** On application mount, [`AppContext.jsx`](file:///c:/Users/Admin/Desktop/Micro-Logistics/src/context/AppContext.jsx#L75-L160) calls `supabase.auth.getSession()` and initializes `authLoading = true`. Protected routes ([`ProtectedRoute.jsx`](file:///c:/Users/Admin/Desktop/Micro-Logistics/src/components/common/ProtectedRoute.jsx#L8-L23)) hold rendering in a spinner state until the live Supabase session is verified, preventing unauthorized flash renders or redirection loops.
- **Auth State Synchronization:** Supabase `onAuthStateChange` actively listens for `SIGNED_IN`, `SIGNED_OUT`, and `TOKEN_REFRESHED` events.
- **Logout Cleanliness:** [`logout()`](file:///c:/Users/Admin/Desktop/Micro-Logistics/src/context/AppContext.jsx#L1013-L1023) calls `supabase.auth.signOut()`, nullifies `currentUser`, empties `cart`, and removes `micrologi_currentUser` and `micrologi_cart` from `localStorage`.

### Backend Token Validation & Identity
- **Bearer Token Verification:** [`auth.middleware.js`](file:///c:/Users/Admin/Desktop/Micro-Logistics/backend/src/middleware/auth.middleware.js#L39-L72) intercepts `Authorization: Bearer <token>` and validates it via `supabase.auth.getUser(token)`. Missing, malformed, or expired tokens receive `401 Unauthorized`.
- **Header Spoofing Protection:** The development header fallback (`x-user-id`, `x-user-role`) is completely disabled in production (`!isProduction && env.ALLOW_DEV_HEADER_AUTH === 'true'`). Production requests cannot forge identity or role via HTTP headers.
- **Role Resolution:** The middleware queries the database `profiles` table to resolve the user's authentic role, ensuring user-supplied metadata cannot escalate privileges.
- **Fail-Closed Authorization:** [`requireRole(...)`](file:///c:/Users/Admin/Desktop/Micro-Logistics/backend/src/middleware/auth.middleware.js#L130-L150) checks the resolved role against an endpoint's allowed roles. Mismatched roles fail closed with `403 Forbidden`. Legacy role name `seller` is safely normalized to `vendor`.

### Public Registration Integrity
- In [`auth.controller.js`](file:///c:/Users/Admin/Desktop/Micro-Logistics/backend/src/controllers/auth.controller.js#L14-L24), public registration restricts roles to an explicit whitelist: `['customer', 'vendor', 'delivery_partner']`. Attempting to register with `admin` or an arbitrary role returns `403 Forbidden` or `400 Bad Request`.
- Password lengths are validated on both frontend and backend.
- Search queries in `resolveIdentifier` are sanitized against PostgREST query injection.

---

## 4. Current Portal Status Across All Four Portals

| Portal | Authentication & Routing | Data Isolation & Ownership Controls | Verified Status |
|---|---|---|---|
| **Customer** | Direct Supabase Auth login; `ProtectedRoute` role guard (`customer`); session restored on refresh. | Customers can only view and update their own profile (`req.user.id === id`). Cart prices are re-validated against catalog on checkout. Status modifications forbidden (403). Only the purchasing customer can view order OTP. | **Operational & Secured** |
| **Seller / Vendor** | `ProtectedRoute` role guard (`vendor`). | Product updates and deletions restricted to products owned by the authenticated vendor (`vendor_id === req.user.id`). Vendor profile updates restricted to the vendor's own record. Order status updates restricted to store preparation statuses (`CONFIRMED`, `PREPARING`, `READY_FOR_DELIVERY`). | **Operational & Secured** |
| **Delivery Partner** | `ProtectedRoute` role guard (`delivery_partner`). | Delivery batch and route management restricted to assigned partner. Delivery agents cannot view customer handover OTP via API (403). Verification requires assignment to the order (`assigned_agent_id === req.user.id`). Universal `1234` static OTP bypass removed; max 5 failed attempts enforced. | **Operational & Secured** |
| **Administrator** | `ProtectedRoute` role guard (`admin`). | Full access to customer directory, vendor directory, delivery agents, order central tracking, and system configuration (`/api/v1/settings`). Ordinary users cannot promote themselves or access `/settings` (403). | **Operational & Secured** |

---

## 5. Database Schema & RLS Status

### Schema Entities (from `0001_initial_schema.sql` and `0002_extended_schema.sql`)
The PostgreSQL database consists of 21 tables:

1. `profiles` (`id UUID PRIMARY KEY REFERENCES auth.users`)
2. `customer_profiles` (`id UUID PRIMARY KEY REFERENCES profiles(id)`)
3. `vendors` (`id UUID PRIMARY KEY REFERENCES profiles(id)`)
4. `delivery_agents` (`id UUID PRIMARY KEY REFERENCES profiles(id)`)
5. `products` (`id UUID PRIMARY KEY`, `vendor_id UUID REFERENCES vendors(id)`)
6. `delivery_batches` (`id UUID PRIMARY KEY`, `agent_id UUID REFERENCES delivery_agents(id)`)
7. `orders` (`id UUID PRIMARY KEY`, `customer_id UUID`, `vendor_id UUID`, `assigned_agent_id UUID`)
8. `order_items` (`id UUID PRIMARY KEY`, `order_id UUID REFERENCES orders(id)`)
9. `delivery_batch_orders` (`batch_id UUID`, `order_id UUID`)
10. `notifications` (`id UUID PRIMARY KEY`, `user_id UUID REFERENCES profiles(id)`)
11. `delivery_slots` (`id UUID PRIMARY KEY`, `slot_time TEXT`)
12. `system_settings` (`id UUID PRIMARY KEY`)
13. `delivery_verifications` (`id UUID PRIMARY KEY`, `order_id UUID REFERENCES orders(id)`)
14. `agent_telemetry` (`id UUID PRIMARY KEY`, `agent_id UUID REFERENCES delivery_agents(id)`)
15. `wishlist_items` (`id UUID PRIMARY KEY`, `customer_id UUID REFERENCES customer_profiles(id)`)
16. `order_status_logs` (`id UUID PRIMARY KEY`, `order_id UUID REFERENCES orders(id)`)
17. `batch_waypoints` (`id UUID PRIMARY KEY`, `batch_id UUID REFERENCES delivery_batches(id)`)
18. `transactions` (`id UUID PRIMARY KEY`, `order_id UUID REFERENCES orders(id)`)
19. `cart_items` (`id UUID PRIMARY KEY`, `customer_id UUID REFERENCES customer_profiles(id)`)
20. `reviews` (`id UUID PRIMARY KEY`, `customer_id UUID`, `vendor_id UUID`, `agent_id UUID`)
21. `audit_logs` (`id UUID PRIMARY KEY`, `actor_id UUID REFERENCES profiles(id)`)

### Current Supabase RLS State
- **Audit Result:** Supabase inspection confirms **Row-Level Security is currently disabled on all tables**, and query against `pg_policies` returned 0 rows.
- **Risk Implication:** While the Express backend enforces ownership checks in code, anyone with the public `VITE_SUPABASE_ANON_KEY` could theoretically execute direct PostgREST REST calls against Supabase (e.g. `https://<ref>.supabase.co/rest/v1/orders`) and read/modify rows unless RLS is enabled.

### RLS Recursion and Ownership Risk Analysis
1. **Infinite Policy Recursion Trap:**
   - Writing a policy on `profiles` that does `SELECT role FROM profiles WHERE id = auth.uid()` triggers PostgreSQL error `42P17` (`infinite recursion detected in policy for relation "profiles"`).
   - **Remedy:** The policy must use a `SECURITY DEFINER` function (`is_admin()`) with `SET search_path = public` to query `profiles` outside of RLS evaluation.
2. **Service-Role Conflict Trap:**
   - Using `ALTER TABLE ... FORCE ROW LEVEL SECURITY` would force RLS onto table owners and service-role connections, breaking Express controllers.
   - **Remedy:** Use `ENABLE ROW LEVEL SECURITY` only. PostgreSQL grants `BYPASSRLS` to the Supabase `service_role` key by default.
3. **Delivery Driver OTP Sniffing Trap:**
   - Granting `SELECT` on `delivery_verifications` to delivery partners would allow drivers to read the customer's handover OTP code directly from the database.
   - **Remedy:** The `delivery_verifications` table must allow `SELECT` **only to the customer who placed the order** (`customer_id = auth.uid()`) or an admin. Drivers must complete verification exclusively through the backend API.
4. **Public Catalog Browsing Necessity:**
   - Anonymous/authenticated users must be able to view active products (`status = 'In Stock'`) and active vendors (`is_open = true`) to browse the store without authentication errors.

---

## 6. Frontend Direct Database Queries vs. Backend Service-Role Usage

### Complete Map of Frontend Direct Supabase Queries (`src/`)
Audit revealed that direct Supabase queries in the frontend are strictly limited to user session profile hydration:
1. `src/services/api.js`: Calls `supabase.auth.getSession()` to attach the Bearer token.
2. `src/context/AppContext.jsx`:
   - `supabase.auth.getSession()` (restore session on app boot)
   - `supabase.from('profiles').select('role, username, phone').eq('id', session.user.id).single()`
   - `supabase.from('customer_profiles').select('*').eq('id', session.user.id).single()`
   - `supabase.from('vendors').select('*').eq('id', session.user.id).single()`
3. `src/auth/LoginPage.jsx`:
   - `supabase.auth.signInWithPassword({ email, password })`
   - `supabase.from('profiles').select('role, username, phone').eq('id', authData.user.id).single()`
   - `supabase.from('customer_profiles').select('*').eq('id', authData.user.id).single()`

### Backend Service-Role Usage
- **Client Initialization:** [`backend/src/config/supabase.js`](file:///c:/Users/Admin/Desktop/Micro-Logistics/backend/src/config/supabase.js#L7-L16) initializes `@supabase/supabase-js` using `process.env.SUPABASE_SERVICE_ROLE_KEY`.
- **Controllers Using Service Role:** All 9 backend controllers (`auth`, `customer`, `vendor`, `delivery`, `order`, `product`, `notification`, `setting`, `health`) execute queries through this service-role client.
- **Critical Dependency:** If `SUPABASE_SERVICE_ROLE_KEY` is ever omitted in production hosting (e.g. Render), the client falls back to `VITE_SUPABASE_ANON_KEY`, connecting as an unauthenticated `anon` client which would be blocked by RLS policies.

---

## 7. Secret and Environment Configuration Audit

### Secret Hygiene Status
- **Tracked Files Audit:** Executed `git ls-files | findstr /I "env credential secret key audit token"`. No `.env` files or credentials are tracked in Git.
- **Git Ignore Protection:** Root [`.gitignore`](file:///c:/Users/Admin/Desktop/Micro-Logistics/.gitignore#L27-L35) includes:
  ```gitignore
  # Environment and Credentials
  .env
  .env.*
  *.env
  **/.env
  **/.env.*
  backend/secure_credentials*
  secure_credentials*
  audit_output*.json
  ```
- **Local Credentials File:** `backend/secure_credentials.txt` is untracked, preserved locally, and uncommitted.
- **Removed Dangerous Scripts:** In `backend/package.json`, the `"dump"` script that printed `SUPABASE_SERVICE_ROLE_KEY` was deleted.
- **Test Sanitization:** `backend/tests/seed.test.js` was sanitized and no longer prints secrets or scans files.

### Hosting Configuration Checklist

#### Render (Backend Service)
- `NODE_ENV` = `production` *(Enforces strict CORS and disables header auth)*
- `SUPABASE_URL` = `https://<ref>.supabase.co`
- `SUPABASE_SERVICE_ROLE_KEY` = `<live_service_role_key>` *(Never expose to frontend)*
- `FRONTEND_URL` = `https://<your-app>.vercel.app`
- `ALLOWED_ORIGINS` = `https://<your-app>.vercel.app`
- `ALLOW_DEV_HEADER_AUTH` = `false` *(or left unset)*

#### Vercel (Frontend Application)
- `VITE_SUPABASE_URL` = `https://<ref>.supabase.co`
- `VITE_SUPABASE_ANON_KEY` = `<live_anon_key>` *(Public client key)*
- `VITE_API_BASE_URL` = `https://<render-service-name>.onrender.com/api/v1`
- `VITE_GOOGLE_MAPS_API_KEY` = `<production_maps_key>`
- **Check:** `SUPABASE_SERVICE_ROLE_KEY` must **never** be present in Vercel.

---

## 8. Test and Build Evidence

### Backend Automated Test Suite (`npm test` in `backend/`)
Executed using Vitest against isolated mock database environments:
```
 ✓ tests/seed.test.js (1 test) 5ms
 ✓ tests/api.test.js (4 tests) 1397ms
 ✓ tests/health.test.js (2 tests) 1174ms
 ✓ tests/security.test.js (22 tests) 161ms

Test Files  4 passed (4)
     Tests  29 passed (29)
  Duration  2.58s
```
*All 22 security assertions passed, validating missing tokens, invalid tokens, header spoofing rejection, role escalation rejection, customer profile isolation, order price tampering prevention, and delivery OTP access controls.*

### Frontend Production Build (`npm run build`)
Executed with Vite and LightningCSS:
```
dist/assets/index-DUpvSi2y.css                     88.69 kB │ gzip:  16.83 kB
dist/assets/createLucideIcon-BKmCDojL.js          323.29 kB │ gzip:  88.51 kB
dist/assets/index-DX5j3H7A.js                     368.04 kB │ gzip: 105.67 kB
✓ built in 2.97s
Exit code: 0
```
*Clean production build; 0 syntax errors across 51 assets and chunks.*

### Frontend Lint (`npm run lint`)
```
Found 369 warnings and 0 errors.
Exit code: 0
```
*0 compilation or lint errors.*

---

## 9. Outstanding Issues, Risks, and Required Actions

| Risk / Task | Current State | Risk Level | Action Required |
|---|---|---|---|
| **Supabase RLS Disabled** | Tables have RLS disabled; 0 policies in `pg_policies`. | **High** | Apply the safe RLS SQL migration in Supabase SQL Editor. |
| **Backend Service Key in Render** | Must be verified in Render dashboard. | **Medium** | Ensure `SUPABASE_SERVICE_ROLE_KEY` is configured in Render so backend queries bypass RLS. |
| **Production CORS Origin** | Render defaults to wildcard if `FRONTEND_URL` is omitted. | **Medium** | Set `FRONTEND_URL` and `NODE_ENV=production` in Render dashboard. |
| **Supabase Auth Email Confirmation** | Default depends on project settings. | **Low** | Verify email confirmation setting in Supabase Auth dashboard. |

---

## 10. Recommended Next Steps in Priority Order

1. **Step 1 (Safest & Most Urgent): Execute Safe Supabase RLS Migration**
   Execute the RLS script in the Supabase Dashboard SQL Editor. The script enables RLS on all 21 tables, creates the `is_admin()` `SECURITY DEFINER` function to eliminate recursion, permits public catalog browsing, and prevents driver OTP sniffing.
2. **Step 2: Confirm Render Environment Variables**
   Open the Render Dashboard for the backend service and verify that `NODE_ENV=production`, `SUPABASE_URL`, and `SUPABASE_SERVICE_ROLE_KEY` are populated.
3. **Step 3: Confirm Vercel Environment Variables**
   Verify that Vercel has `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, and `VITE_API_BASE_URL` pointing to the Render backend, with no service-role key exposed.
4. **Step 4: End-to-End Live Verification**
   Log into the live Customer portal (`/login`) with customer `c1` (`priya@example.com`):
   - Confirm customer profile loads via direct Supabase client (`customer_profiles`).
   - Confirm orders load via Express API (`/api/v1/orders`).
   - Confirm OTP handover code is visible only to the customer.
   - Confirm delivery completion works via the driver portal without RLS permission errors.
