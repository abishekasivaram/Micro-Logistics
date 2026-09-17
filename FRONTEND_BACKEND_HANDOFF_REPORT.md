# FRONTEND_BACKEND_HANDOFF_REPORT
# Micro-Logistics Management System
## Forensic Analysis and Full System Handoff Documentation (Frontend + Backend JS)

==================================================
## 1. PROJECT INFORMATION
==================================================

- **Project name**: Micro-Logistics Management System
- **Frontend**: Completed (React 19, Vite)
- **Backend**: Implemented (Node.js, Express, JavaScript CommonJS)
- **Database**: Supabase (PostgreSQL)
- **Frontend deployment**: Vercel (https://micro-logistics.vercel.app)
- **Backend deployment**: TBD (Currently local)

==================================================
## 2. COMPLETE FRONTEND CODEBASE INSPECTION
==================================================

The project is a single-page application (SPA) using React 19 and Vite. The codebase uses modern JavaScript/JSX.
- **State Management**: Heavily leverages `AppContext.jsx` to simulate API behavior using `localStorage`.
- **Pages / Portals**: Fully segregated by role into Admin, Customer, Seller, and Delivery Partner portals.
- **Styling**: Vanilla CSS components without external UI libraries.

### Core Frontend Files
1. **`src/App.jsx`**: Defines all application routes, role-based protection (via `<ProtectedRoute>`), and includes the `DashboardLayout`.
2. **`src/context/AppContext.jsx`**: **CRITICAL**. This file simulates the entire backend currently. The future integration phase will replace the local arrays with `axios` or `fetch` calls to the new backend.
3. **`src/data/sampleData.js`**: Stores the initial mocked states (legacy IDs like `c1`, `v1`, `p1`, `ORD-1234`).
4. **`src/utils/aggregationUtils.js`**: Contains logic for mapping human-readable statuses (e.g. `READY_FOR_DELIVERY` -> `Ready for Delivery`) and smart order batching logic.

==================================================
## 3. BACKEND ARCHITECTURE & RECENT REFACTORING
==================================================

Following the recent git commits, the backend has been successfully converted from **TypeScript to CommonJS JavaScript**. 
The backend operates strictly as a REST API designed to interoperate seamlessly with the data models defined by the frontend's `sampleData.js`.

**Backend Stack:**
- **Runtime**: Node.js 20+
- **Framework**: Express.js
- **Module System**: CommonJS (`"type": "commonjs"`)
- **Database SDK**: `@supabase/supabase-js` (via Service Role Key for Admin operations)
- **Validation**: Zod (Compiled down to JS logic)
- **Testing**: Vitest (`.js` test files)

==================================================
## 4. DETAILED BACKEND FILE INVENTORY & WORKFLOW
==================================================

The backend strictly adheres to a layered controller-route architecture. 

### A. Application Entry & Config
1. **`backend/src/server.js`**
   - *Role*: The main executable entry point.
   - *Workflow*: Loads environment variables, attaches the Express app to a network port (default 5000), and starts the listener.
2. **`backend/src/app.js`**
   - *Role*: Configures the Express instance.
   - *Workflow*: Injects middleware (`cors`, `helmet`, `express.json`), mounts the master API router (`/api/v1`), and attaches the global `errorHandler`.
3. **`backend/src/config/env.js`**
   - *Role*: Validates and parses `.env` variables using `zod`.
   - *Workflow*: Ensures `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `FRONTEND_URL`, and `PORT` are guaranteed to exist at runtime before the app starts.
4. **`backend/src/config/supabase.js`**
   - *Role*: Initializes the singleton Supabase client.
   - *Workflow*: Instantiates the client using the highly privileged Service Role Key, granting the backend full PostgreSQL access bypassing Row Level Security.

### B. Routing Layer (`backend/src/routes/`)
All files define standard Express `Router()` instances handling specific HTTP verbs and paths.
1. **`index.js`**: Aggregates all route modules under `/api/v1`.
2. **`health.routes.js`**: Unprotected endpoints (`/health` and `/health/db`) to verify system liveness.
3. **`product.routes.js`**: Defines `/products` endpoints. Utilizes the auth middleware to protect POST/PUT.
4. **`vendor.routes.js`**: Defines `/vendors` endpoints.
5. **`order.routes.js`**: Defines `/orders` endpoints. Every route requires `requireAuth`.
6. **`delivery.routes.js`**: Defines routes for `/agents` and `/batches`. Employs strict role guarding (`requireRole(['admin', 'delivery_partner'])`).

### C. Controller Layer (`backend/src/controllers/`)
These files contain the core business logic. They parse requests, execute Supabase database queries, map responses via DTOs, and return JSON.

1. **`product.controller.js`**
   - *Workflow*: Supports fetching products (with optional `vendorId` filtering). Ensures only the authenticated Vendor or an Admin can create or update a product. Handles stock-based status derivations (e.g. automatically setting "Out of Stock" if stock hits 0).
2. **`vendor.controller.js`**
   - *Workflow*: Retrieves vendor profiles by joining the `vendors` table with the `profiles` table. Provides updating logic ensuring vendors can only mutate their own business profiles.
3. **`order.controller.js`**
   - *Workflow*: Handles Order placement. Translates frontend legacy IDs (`c1`, `v1`) into Database UUIDs seamlessly. Joins `order_items`, `products`, `customers`, and `vendors` when retrieving. Implements strict ownership (Customers see only their orders, Vendors see only their vendor orders). Translates state changes (e.g. transitioning `order_status`, `delivery_status`, and `aggregation_status` simultaneously when an order is packed).
4. **`delivery.controller.js`**
   - *Workflow*: The most complex domain. Allows Admins to create new Batches by aggregating multiple Order IDs. Inserts relations into `delivery_batch_orders`. Updates associated Orders to reflect `BATCH_CREATED` status. Facilitates assigning agents to batches, updating both the batch and the agent's current load capacity.

### D. Middleware Layer (`backend/src/middleware/`)
1. **`auth.middleware.js`**
   - *Workflow*: Exports `requireAuth` (extracts the JWT Bearer token and verifies it against `supabase.auth.getUser()`) and `requireRole` (verifies the user's metadata role matches the allowed roles).
2. **`error.middleware.js`**
   - *Workflow*: A catch-all global error handler. Catches synchronous and asynchronous errors and formats them into a standard `{ success: false, message: ... }` response without crashing the Node process.

### E. Utilities (`backend/src/utils/`)
1. **`mappings.js`**
   - *Role*: **CRITICAL COMPATIBILITY LAYER**.
   - *Workflow*: Since the frontend uses string identifiers (e.g., `ORD-1234`, `p1`) and expects `camelCase` JSON, but Supabase uses `UUIDs` and `snake_case`, this utility translates DB rows to Frontend Objects.
   - For example, `mapOrderToFrontend(dbOrder)` builds a rich nested object matching the structure the React `AppContext` expects.

### F. Testing (`backend/tests/`)
1. **`api.test.js` & `health.test.js`**
   - *Workflow*: Uses `vitest` and `supertest` to run integration tests against the Express app in memory. They mock out the `supabase` client to avoid requiring a live DB during CI pipelines, proving the routing and controller logic parses correctly.

==================================================
## 5. DATABASE SCHEMA RELATIONSHIPS
==================================================

The PostgreSQL tables created in Phase 1 support the JavaScript implementation:
1. `auth.users` -> Extended by `profiles` (Stores roles: customer, vendor, admin).
2. `customer_profiles` (Legacy `c1`)
3. `vendors` (Legacy `v1`)
4. `products` (FK to Vendors)
5. `orders` (FK to Customers, Vendors) -> `order_items` (FK to Products)
6. `delivery_agents` (Legacy `da1`)
7. `delivery_batches` -> `delivery_batch_orders` (Junction to `orders`)

==================================================
## 6. BACKEND API CONTRACT SUMMARY
==================================================

| Feature | Method | Endpoint | Allowed Roles |
|---------|--------|----------|---------------|
| Health | GET | `/api/v1/health/db` | All |
| Products| GET | `/api/v1/products` | All |
| Products| POST | `/api/v1/products` | Vendor, Admin |
| Vendors | GET | `/api/v1/vendors` | All |
| Vendors | PUT | `/api/v1/vendors/:id` | Vendor (Self), Admin |
| Orders | GET | `/api/v1/orders` | Auth (Self Scoped) |
| Orders | POST | `/api/v1/orders` | Customer, Admin |
| Orders | PATCH | `/api/v1/orders/:id/status`| Vendor, Admin, Agent |
| Batches | POST | `/api/v1/delivery/batches` | Admin |
| Agents | GET | `/api/v1/delivery/agents` | Admin, Agent |

==================================================
## 7. NEXT STEPS (FRONTEND INTEGRATION)
==================================================

The backend is now completely implemented in JavaScript and ready to be integrated into the existing React application.

**Tasks for the Frontend Integration Phase:**
1. Install `axios` in the frontend (`npm install axios`).
2. Add `.env` to frontend with `VITE_API_BASE_URL=http://localhost:5000/api/v1`.
3. Create an API client service in the frontend to handle JWT attachment.
4. Methodically replace the functions in `AppContext.jsx` (e.g. `placeOrder()`) with async Redux-style actions or React Query mutations pointing to the real Express backend.
