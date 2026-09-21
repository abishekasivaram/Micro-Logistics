# FRONTEND_BACKEND_HANDOFF_REPORT
# Micro-Logistics Management System
## Forensic Analysis and Full System Handoff Documentation (Frontend + Backend)

==================================================
## 1. PROJECT OVERVIEW
==================================================

- **Project Name**: Micro-Logistics Management System
- **Description**: A role-based single-page application (SPA) allowing seamless coordination across Customers, Vendors, Delivery Partners, and Admins.
- **Frontend Stack**: React 19, Vite, Vanilla CSS. Deployed on Vercel.
- **Backend Stack**: Node.js, Express, JavaScript (CommonJS).
- **Database**: Supabase PostgreSQL.

==================================================
## 2. DIRECTORY STRUCTURE AND FULL FILE INVENTORY
==================================================

### Root Level
- **`FRONTEND_BACKEND_HANDOFF_REPORT.md`**: Forensic Analysis and Full System Handoff Documentation (this file).
- **`README.md`**: Comprehensive project report and workflow guide.
- **`package.json`**: Root project dependencies.
- **`vite.config.js`**: Configuration for Vite.
- **`test.cjs`**: Automated JS script using JSDOM and a local server to test and scrape React output.

### Frontend (`src/`)
- **`App.jsx`**: Defines all application routes and role-based protection (via `<ProtectedRoute>`).
- **`context/AppContext.jsx`**: React Context managing state (and currently mocking backend behavior).
- **`data/sampleData.js`**: Initial mocked states for testing (c1, v1, p1).
- **`utils/aggregationUtils.js`**: Smart order batching and mapping logic.
- **`components/`**: Reusable UI components (e.g. `Sidebar.jsx`).
- **`layouts/`**: Dashboard and page layouts.
- **`styles/`**: Global Vanilla CSS styling.
- **`portals/`**: Contains the segregated UI portals. Heavily refactored into modular components and localized CSS:
  - **`customer/`**: 
    - JS Views: `CustomerDashboard.jsx`, `BrowseSellersPage.jsx`, `CartPage.jsx`, `CheckoutPage.jsx`, `DeliverySchedulePage.jsx`, `TrackDeliveryPage.jsx`, `OrdersPage.jsx`, `ProfilePage.jsx`, `NotificationsPage.jsx`.
    - Localized CSS: `CustomerDashboard.css`, `BrowseSellersPage.css`, `CartPage.css`, `CheckoutPage.css`, `DeliverySchedulePage.css`, `TrackDeliveryPage.css`, `CustomerOrdersPage.css`, `CustomerProfilePage.css`, `CustomerNotificationsPage.css`.
  - **`seller/`**: 
    - `DashboardOverview.jsx`, `DashboardOverview.css`, `ProductsPage.jsx`.
  - **`delivery/`** & **`admin/`**: Other role specific views.

### Backend (`backend/`)
- **`README.md`**: Backend specific documentation and setup guide.
- **`package.json`**: Backend dependencies.
- **`src/server.js`**: Executable entry point for the Express server.
- **`src/app.js`**: Configures the Express instance with middlewares and routers.
- **`src/config/env.js`**: Validates and parses environment variables.
- **`src/config/supabase.js`**: Initializes Supabase client with Service Role Key.
- **`src/routes/`**: Express routers for different endpoints.
  - `index.js`, `health.routes.js`, `product.routes.js`, `vendor.routes.js`, `order.routes.js`, `delivery.routes.js`
- **`src/controllers/`**: Core business logic.
  - `product.controller.js`, `vendor.controller.js`, `order.controller.js`, `delivery.controller.js`
- **`src/middleware/`**: Custom Express middlewares.
  - `auth.middleware.js` (JWT and Role validation), `error.middleware.js` (Global Error Handler)
- **`src/utils/mappings.js`**: Critical compatibility layer to map database UUIDs/snake_case to frontend legacy IDs/camelCase.
- **`supabase/migrations/`**: SQL scripts for Database schema setup.

==================================================
## 3. WORKFLOWS
==================================================

### Authentication & Role Guarding Workflow
- **Frontend**: Protected routes using `<ProtectedRoute>`. `AppContext` provides simulated authentication state.
- **Backend**: Middlewares (`requireAuth`, `requireRole`) extract JWT Bearer tokens from incoming requests and verify them using `supabase.auth.getUser()` and associated role metadata.

### Order Processing & Lifecycle Workflow
1. **Order Placement**: Customer places order via `POST /api/v1/orders`. Payload translations map frontend legacy IDs to database UUIDs.
2. **Order Management**: Customers see their own orders. Vendors can view/manage their respective product orders.
3. **Status Progression**: When an order is packed, status progresses (`order_status`, `delivery_status`, `aggregation_status`). Vendor or Admin triggers this via `PATCH /api/v1/orders/:id/status`.
4. **Batch Creation**: Admins aggregate multiple Order IDs into a new batch (`POST /api/v1/delivery/batches`). This sets relations in `delivery_batch_orders`.
5. **Delivery Agent Assignment**: Agents are assigned to batches, updating both the batch and the agent's current load capacity.

### Database Operations Workflow
- The Backend uses a singleton Supabase client (`@supabase/supabase-js`) authenticated with the Service Role Key. This grants full administrative privileges, bypassing Row Level Security for robust backend logic.
- Controllers parse incoming API requests, validate data schemas with Zod, and perform DB operations. Results are transformed using `utils/mappings.js` to match the object shape expected by the React frontend.

==================================================
## 4. NEXT INTEGRATION STEPS
==================================================
1. Configure frontend environment variables (e.g., `VITE_API_BASE_URL`).
2. Integrate `axios` or `fetch` calls in the frontend's `AppContext.jsx` to replace the local mocked data arrays.
3. Migrate the authentication flow to use real JWT tokens from Supabase Auth.
4. Conduct end-to-End integration testing across the entire system.
