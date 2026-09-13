# Consolidated Frontend Issue Tracker (Pass 2 - Verified)

**Application:** Smart Micro-Logistics Management Network (`s5`)  
**Workspace:** `c:\Users\N.AJAYKUMAR\ABI'S PROJECT\Micro-Logistics`  
**Total Issues Tracked:** 28 Issues  
**Status:** 100% Remediated & Verified  
**Date of Verification:** 2026-09-13  

---

## Issue Registry

| ID | Severity | Category | Page / Route | Component | Summary | Status | Verification |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **SEC-001** | P0 | Security | Protected Routes | `AppContext.jsx` | Unauthenticated guests automatically gain customer session on fresh visit | `VERIFIED` | Passed automated unauthenticated redirect test |
| **AUTH-002**| P1 | Logic | `/register-customer` | `AppContext.jsx` | Customer registration drops password field, locking users out | `VERIFIED` | Password persisted in state with default fallback |
| **UX-003** | P1 | UX | `/login` | `LoginPage.jsx` | Native blocking `window.alert()` on login; no demo credential hints | `VERIFIED` | Inline error banner and 1-click Demo Logins functional |
| **UI-004** | P1 | Visual | Global Header | `Header.jsx` | Delivery Partner displayed as "Admin" in navigation header | `VERIFIED` | Header displays "Delivery Partner" for role `delivery_partner` |
| **A11Y-005**| P1 | a11y | All Modals | Multiple Modals | Modals lack `Escape` key listeners, focus trapping, and ARIA attributes | `VERIFIED` | All modals support `Escape` key and have `role="dialog"` |
| **NAV-006** | P2 | Route | `*` (Catch-all) | `App.jsx` | Missing 404 page; silently redirects broken URLs to root | `VERIFIED` | `NotFoundPage.jsx` renders 404 with back CTA |
| **CODE-007**| P2 | Code | App Entry | `App.jsx` | Orphaned dead code (`MapPlanning.jsx`, `DeliveriesPage.jsx`) with crash risk | `VERIFIED` | Unused imports safely decommissioned |
| **LOGIC-008**| P2 | Logic | `/delivery/profile` | `AppContext.jsx` | Driver availability updates fail to synchronize `currentUser` in context | `VERIFIED` | `currentUser` synchronized on agent availability updates |
| **LOGIC-009**| P2 | Logic | `/delivery/pickup` | `AppContext.jsx` | Confirming pickup sets status `'PICKED_UP'` but ignores delivery status text | `VERIFIED` | `'PICKED_UP'` status sets delivery and aggregation text |
| **LOGIC-010**| P2 | Logic | `/profile` | `ProfilePage.jsx` | Password change form simulates success without persisting new password | `VERIFIED` | Validates password, checks length, calls `updateUserProfile` |
| **UX-011** | P2 | UX | `/track-delivery` | `TrackDeliveryPage.jsx` | Customers with 0 orders see an unrelated customer's mock order | `VERIFIED` | Empty state with "Browse Local Sellers" CTA rendered |
| **LOGIC-012**| P2 | Logic | `/business-profile` | `BusinessProfilePage.jsx`| Updating store business name does not update `shopName`, breaking login | `VERIFIED` | `name` and `shopName` synchronized in context update |
| **UX-013** | P2 | UX | `/settings` | `SettingsPage.jsx` | Settings form has static dummy data and dead non-functional button | `VERIFIED` | Bound to `currentUser` with functional save notification |
| **UI-014** | P2 | CSS | `/admin/customers` | `AdminCustomersPage.jsx`| Customer details modal relies on undeclared `OrdersPage.css` stylesheet | `VERIFIED` | Modal backdrop unified in `global.css` with centered blur |
| **UX-015** | P2 | UX | `/delivery-dashboard` | `DeliveryDashboard.jsx` | `<Link disabled>` remains clickable when no active batch is assigned | `VERIFIED` | Replaced with semantic disabled `<button>` when `!activeBatch` |
| **A11Y-016**| P2 | a11y | Global Forms | Multiple Forms | 49 form inputs and select elements lack associated `<label>` or `id` | `VERIFIED` | Form controls linked with matching `id` and `htmlFor` |
| **A11Y-017**| P2 | a11y | Global Navigation | `Header.jsx`, `Sidebar` | 43 icon-only buttons lack `aria-label` or accessible names | `VERIFIED` | Descriptive `aria-label` added to icon buttons |
| **SEO-018** | P3 | SEO | Root HTML | `index.html` | Document title is default Vite placeholder "s5" with no meta description | `VERIFIED` | Title updated to "Smart Micro-Logistics" with meta tags |
| **COPY-019**| P3 | Copy | `/customers` | `CustomersPage.jsx` | Total spent renders US Dollar sign (`$`) instead of Rupee (`₹`) | `VERIFIED` | Replaced `$` with `₹` currency symbol |
| **COPY-020**| P3 | Copy | `/help` | `HelpPage.jsx` | Customer FAQ refers to obsolete admin map planning view | `VERIFIED` | Rewritten with customer micro-logistics FAQs and helpline |
| **PERF-021**| P3 | Perf | `/admin/orders` | `AdminCentralOrdersPage`| `Math.random()` used as React list key, causing component thrashing | `VERIFIED` | Deterministic key `o.id \|\| o.orderId \|\| idx` applied |
| **UX-022** | P3 | UX | `/admin/settings` | `AdminSettingsPage.jsx` | Clearing numerical inputs stores `NaN` into system aggregation parameters | `VERIFIED` | Added numeric guards and empty string fallbacks |
| **UX-023** | P3 | Copy | `/admin/reports` | `AdminReportsPage.jsx` | Export toast leaks developer text: `[Frontend Placeholder]` | `VERIFIED` | Functional CSV file download and PDF print preview |
| **UX-024** | P3 | UX | `/admin/sellers` | `AdminSellersPage.jsx` | Suspending a seller takes effect immediately with zero confirmation prompt | `VERIFIED` | Added confirmation prompt before status change |
| **DESIGN-025**| P4 | Design | Dashboard Views | Multiple Components | Hardcoded inline hex colors bypass `design-system.css` tokens | `VERIFIED` | Token consolidation across global styles and modals |
| **UX-026** | P4 | UX | `/checkout` | `CheckoutPage.jsx` | Accessing checkout with empty cart disables button with no clear notice | `VERIFIED` | Empty cart warning alert and Browse Sellers CTA added |
| **LOGIC-027**| P4 | Logic | `/inventory` | `InventoryPage.jsx` | Individual sellers see competitors' inventory levels across entire network | `VERIFIED` | Vendor tenancy filter `vendorId === currentUser.id` active |
| **UI-028** | P4 | Visual | `/browse-sellers` | `BrowseSellersPage.jsx` | Responsive container padding shifts abruptly at 1024px breakpoint | `VERIFIED` | Viewport padding normalized; 0 horizontal overflows |

---

## Severity Summary

* **P0 — Blocker:** 1 of 1 Verified (100%)
* **P1 — Critical:** 4 of 4 Verified (100%)
* **P2 — Major:** 10 of 10 Verified (100%)
* **P3 — Minor:** 9 of 9 Verified (100%)
* **P4 — Polish:** 4 of 4 Verified (100%)
* **Total:** 28 of 28 Verified (100%)
