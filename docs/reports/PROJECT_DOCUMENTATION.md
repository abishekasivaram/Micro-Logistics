# Micro-Logistics Management System

## 1. Project Overview
Micro-Logistics Management System is a sophisticated, role-based single-page application (SPA) designed to optimize local delivery logistics. It coordinates workflows across Customers, Vendors, Delivery Partners, and Administrators. By transitioning from a traditional 1:1 courier dispatch model to a Multi-Vendor Milk-Run Aggregation model, the system optimizes routes, batches orders from multiple vendors within a geographical area, and minimizes redundant trips.

## 2. Technology Stack
*   **Frontend**: React 19, Vite, React Router DOM, Vanilla CSS. Deployed via Vercel.
*   **Backend**: Node.js, Express.js.
*   **Database**: PostgreSQL hosted on Supabase.
*   **Security & Utilities**: JWT for authentication, Bcrypt for hashing, Zod for schema validation, Helmet, CORS.
*   **Testing**: Vitest for backend, Puppeteer and JSDOM for frontend scraping and testing.

## 3. Current Project Structure
The repository follows a decoupled client-server architecture:
*   `src/`: Contains the React frontend application.
    *   `src/portals/`: Role-segregated UI components for `admin`, `customer`, `seller`, and `delivery`.
    *   `src/context/`: Contains `AppContext.jsx`, the centralized state manager that interacts with the backend.
    *   `src/auth/`: Contains public authentication views (Login, Register).
*   `backend/`: Contains the Node.js Express server.
    *   `backend/src/routes/`: Express routers (`auth`, `customer`, `vendor`, `product`, `order`, `delivery`, `notification`, `setting`, `health`).
    *   `backend/src/controllers/`: Core business logic handling database interactions.
    *   `backend/src/middleware/`: Security layers including `auth.middleware.js` and global error handling.
    *   `backend/src/utils/`: Utilities like `mappings.js` for ID translations.
    *   `backend/supabase/migrations/`: SQL definitions including `0001_initial_schema.sql` and `0002_extended_schema.sql`.
*   `api/`: Vercel serverless function entry points.
*   `docs/`: System handbooks, architecture diagrams, and handoff reports.

## 4. Frontend Architecture
The frontend is a React 19 Single Page Application. It uses `react-router-dom` to implement role-based route guarding via `<ProtectedRoute>`. Portal views are optimized using React's `lazy` and `Suspense` for chunk loading. State management is primarily handled by the React Context API (`AppContext.jsx`), which acts as the data layer, hydrating state via HTTP calls and distributing it globally.

## 5. Backend Architecture
The backend is a RESTful API built on Express.js. It features a layered architecture where routes define endpoints, controllers execute business logic, and middlewares enforce security (JWT validation, Role checks). The backend leverages the `@supabase/supabase-js` client configured with a Service Role Key, granting administrative access to execute complex queries and bypass PostgreSQL Row Level Security (RLS) constraints safely from the server.

## 6. Database Architecture
The database is PostgreSQL hosted on Supabase, structured hierarchically. The latest schema (`0002_extended_schema.sql`) introduces a highly relational layout:
*   **Core Entities**: `profiles`, `customer_profiles`, `vendors`, `delivery_agents`.
*   **Catalog & Transactions**: `products`, `orders`, `order_items`, `transactions`.
*   **Logistics**: `delivery_batches`, `delivery_batch_orders`, `batch_waypoints`, `agent_telemetry`.
*   **Operational & Security**: `delivery_verifications` (OTP), `order_status_logs`, `reviews`, `audit_logs`, `system_settings`, `notifications`.

## 7. Authentication and Authorization
The system utilizes Supabase Auth for backend verification. Middlewares extract Bearer tokens to validate identities and enforce role constraints (`requireAuth`, `requireRole`). On the frontend, `<ProtectedRoute>` components check the `currentUser.role` property to restrict navigation, preventing unauthorized access to specific portals.

## 8. Role-Based Access Control
The application operates on four strictly defined roles:
*   `customer`: Can browse vendors, manage cart, place orders, and track active deliveries.
*   `vendor`: Can manage product inventory, accept orders, and mark them as ready for pickup.
*   `admin`: Oversees operations, manages users, uses the aggregation engine to build delivery batches, and dispatches agents.
*   `delivery_partner`: Receives batches, navigates milk-run routes, handles order pickups, and authenticates drops via OTP.

## 9. Customer Workflow
Customers register or log in, browse products from multiple local vendors, and add items to a persistent cart. They proceed to checkout, selecting a scheduled delivery time slot. Post-checkout, customers can track their order's progression through preparation and delivery phases.

## 10. Seller/Vendor Workflow
Sellers log into a dedicated portal to manage their business profile and product catalog. They monitor incoming orders in real-time, prepare the items, and transition the order status to `READY_FOR_DELIVERY`, signaling to the system that the items are staged for the delivery partner.

## 11. Admin Workflow
Administrators possess global oversight. They can approve or suspend users. Crucially, admins operate the Order Aggregation Engine, which clusters unassigned orders based on geography and time slots into `Delivery Batches`. Once created, admins assign these batches to available Delivery Agents.

## 12. Delivery Partner Workflow
Delivery Partners view their assigned batches on a dashboard. They execute a multi-stop "milk-run": first completing sequential vendor pickups (updating batch status), and then proceeding to customer drop-offs. At the customer's doorstep, the agent enters a 4-digit OTP provided by the customer to finalize the delivery.

## 13. Order Lifecycle
Every order exists simultaneously across three distinct domain axes:
1.  **Order Physical Prep (`order_status`)**: `PLACED` → `CONFIRMED` → `PREPARING` → `READY_FOR_DELIVERY` → `ASSIGNED` → `OUT_FOR_DELIVERY` → `DELIVERED` (or `CANCELLED`).
2.  **Aggregation Clustering (`aggregation_status`)**: `WAITING_FOR_AGGREGATION` → `GROUPED` → `BATCH_CREATED` → `BATCH_ASSIGNED` → `COMPLETED`.
3.  **Dispatch & Transport (`delivery_status`)**: `PENDING_ASSIGNMENT` → `ASSIGNED` → `PICKUP_IN_PROGRESS` → `PICKED_UP` → `OUT_FOR_DELIVERY` → `ARRIVED` → `DELIVERED` → `COMPLETED`.

## 14. Delivery Batching and Assignment
The Smart Order Aggregation algorithm groups orders (`findSuitableOrderGroups`). It evaluates delivery dates, overlapping time slots, geographical proximity, and vendor staging statuses to generate candidate batches. Admins approve these batches (`POST /api/v1/delivery/batches`) and assign them to couriers (`/assign`), which immediately updates the agent's current load capacity.

## 15. API Endpoints
The backend currently implements and exposes the following functional REST API paths:
*   **Auth**: `POST /auth/signup`, `POST /auth/login`
*   **Products**: `GET /products`, `POST /products`, `PUT /products/:id`, `DELETE /products/:id`
*   **Vendors**: `GET /vendors`, `PUT /vendors/:id`
*   **Customers**: `GET /customers`, `PUT /customers/:id`
*   **Orders**: `GET /orders`, `POST /orders`, `PATCH /orders/:id/status`
*   **Delivery**: `GET /delivery/batches`, `POST /delivery/batches`, `POST /delivery/batches/:id/assign`, `PATCH /delivery/batches/:id/status`, `GET /delivery/agents`, `POST /delivery/agents`, `PUT /delivery/agents/:id`, `POST /delivery/verify-otp`
*   **System**: `GET /notifications`, `GET /settings`, `PUT /settings`, `GET /health`

## 16. Frontend-Backend Integration
The frontend `AppContext.jsx` is successfully integrated with the backend. It uses an Axios instance (`api.js`) to dispatch HTTP requests. To ensure zero regressions with legacy frontend state, a critical compatibility layer (`backend/src/utils/mappings.js`) translates the frontend's legacy string IDs (e.g., `c1`, `v1`, `ORD-1234`) and camelCase payloads into the backend's strict PostgreSQL UUIDs and snake_case columns.

## 17. Phase 3 Implementation and Verification
Phase 3 (Backend & Database Architecture) is complete. The Express server, routing layer, controller logic, error handling, and robust Supabase PostgreSQL schema with advanced entities (telemetry, OTPs, audits) are fully implemented and available.

## 18. Phase 4 Implementation and Verification
Phase 4 (Integration) is actively implemented. The frontend `AppContext` has been refactored to fetch dynamic data (`orders`, `products`, `vendors`, `batches`) directly from the backend API, replacing the initial static `sampleData.js` arrays.

## 19. Current Data Persistence
Core application data including Orders, Products, Vendors, Delivery Agents, Batches, and System Settings are persisted remotely in the Supabase PostgreSQL database. They are asynchronously loaded via API calls upon user authentication.

## 20. Remaining LocalStorage Usage
While primary entities rely on the database, `localStorage` is currently maintained for specific transient or session-based states:
*   `micrologi_cart`: Cross-device cart synchronization fallback.
*   `micrologi_currentUser`: Maintaining active session role and data between hard reloads.
*   `micrologi_adminSettings`: Local caching fallback for administrative preferences.

## 21. Testing and Verification
The repository contains structural foundations for testing:
*   Backend utilizes `vitest` for API and unit testing.
*   Frontend leverages a custom `test.cjs` script implementing `JSDOM` and `puppeteer` to spin up local servers and synthetically verify React component rendering and routing integrity.

## 22. Security Measures
The application implements standard web security practices:
*   Express `helmet` middleware for HTTP header protection.
*   `cors` configured to restrict unauthorized origin requests.
*   Server-side payload schema validation via Zod.
*   Row Level Security is bypassed safely using the Service Role Key exclusively within the trusted backend environment.
*   Authentication tokens are required for protected endpoint mutations.

## 23. UI/UX and Responsive Design
The interface is designed as a dynamic, responsive SPA. It features contextual Dashboard Layouts unique to each role, localized and modular Vanilla CSS for component scoping, and visual feedback mechanisms like offline banners, loading fallbacks (via React Suspense), and notification toasts.

## 24. Known Issues and Limitations
*   If the backend API is unreachable, `AppContext` defaults to an "Offline Mode", which limits functionality to local cache viewing without mutation capabilities.
*   The transition of `currentUser` session state away from `localStorage` into a purely HTTP-only Secure Cookie or robust JWT context state is still pending complete finalization across all environments.

## 25. Future Work
*   Finalizing the environment variables targeting production Vercel configurations.
*   Enhancing the Aggregation Algorithm with live Google Maps Distance Matrix API calls instead of heuristic estimations.
*   Implementing live WebSocket connections for real-time Agent Telemetry tracking on the customer map.

## 26. Final Project Status
The Micro-Logistics Management System is currently in a highly mature Integrated State (Phase 4 completed). The frontend successfully communicates with a fully realized Supabase-backed Node.js API, accurately simulating and managing the complex tri-state logistics lifecycle across four distinct user roles.
