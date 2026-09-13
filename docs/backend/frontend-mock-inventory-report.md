# Master Mock Inventory & Simulation Audit Report
**Project:** Micro-Logistics Platform  
**Document Type:** Full Mock Registry, Simulated Functions, Mock Pipelines, and Backend Migration Matrix  
**Generated Date:** September 13, 2026  
**Target Audience:** Backend Developers, Systems Architects, API Designers, QA Engineers  
**Report File Path:** `docs/backend/frontend-mock-inventory-report.md`  

---

## Executive Summary

The **Micro-Logistics Platform** frontend currently operates as a fully interactive, client-side simulated Single-Page Application (SPA). To provide seamless end-to-end user journeys for all four user roles (**Customer, Seller, Delivery Agent, Admin**), the frontend utilizes an extensive mock architecture consisting of:
1. **10 In-Memory Master Datasets** initialized from `src/data/sampleData.js`.
2. **24 Simulated State Mutator Functions** in `src/context/AppContext.jsx` using `localStorage` caching as a mock database.
3. **An Algorithmic Heuristic Mock Engine** in `src/utils/aggregationUtils.js` performing local time-window matching, geographical clustering approximations, and compatibility scoring.
4. **Interactive Mock UI Components & Visual Fallbacks** including mock SVG route visualizers, hardcoded OTP authentications, mock notification emitters, and simulated analytics aggregators.
5. **Synthetic Pipelines & Workflows** that simulate the end-to-end lifecycle of an order from customer placement to dynamic batch aggregation, seller fulfillment, and agent completion.

This document serves as the **exhaustive blueprint** of every mock data item, simulated function, hardcoded value, and mock pipeline across the codebase, coupled with an actionable technical specification for replacing them with real backend services, databases, and APIs.

---

## Table of Contents
1. [Global Mock Datasets (`src/data/sampleData.js`)](#1-global-mock-datasets)
2. [Simulated Database & State Mutators (`src/context/AppContext.jsx`)](#2-simulated-database--state-mutators)
3. [Algorithmic Heuristic Mock Engine (`src/utils/aggregationUtils.js`)](#3-algorithmic-heuristic-mock-engine)
4. [Component-Level Mock Elements & UI Fallbacks](#4-component-level-mock-elements--ui-fallbacks)
5. [End-to-End Mock Pipelines & Lifecycle Simulations](#5-end-to-end-mock-pipelines--lifecycle-simulations)
6. [Complete Backend Replacement Matrix](#6-complete-backend-replacement-matrix)
7. [Backend Implementation Checklist](#7-backend-implementation-checklist)

---

## 1. Global Mock Datasets

File: [`src/data/sampleData.js`](file:///c:/Users/N.AJAYKUMAR/ABI'S%20PROJECT/Micro-Logistics/src/data/sampleData.js)  
All datasets are exported as JavaScript arrays and objects. At runtime, `AppContext.jsx` reads from `localStorage` or seeds initial state using these structures.

```
       src/data/sampleData.js
 ┌─────────────────────────────────────────────────────────────┐
 │  - deliverySlots (4 time windows)                           │
 │  - vendors (5 sellers)                                      │
 │  - customers (4 buyers)                                     │
 │  - deliveryAgents / deliveryPersonnel (4 drivers)           │
 │  - products (15 SKU catalog items)                          │
 │  - orders (10 multi-status orders)                          │
 │  - deliveryBatches / deliveryGroups (3 pre-grouped batches) │
 │  - initialNotifications (6 system alerts)                   │
 │  - mockUsers (9 credential pairs)                           │
 │  - adminSettingsInitial (system config)                     │
 └─────────────────────────────────────────────────────────────┘
```

### 1.1 `deliverySlots` (4 Static Records)
* **File:** [`src/data/sampleData.js:1-7`](file:///c:/Users/N.AJAYKUMAR/ABI'S%20PROJECT/Micro-Logistics/src/data/sampleData.js#L1-L7)
* **Variable Name:** `deliverySlots`
* **Data Type:** `Array<Object>`
* **Fields:**
  * `id` (`string`): e.g., `'slot1'`, `'slot2'`, `'slot3'`, `'slot4'`
  * `label` (`string`): Human-readable window (e.g., `'Morning (08:00 - 11:00)'`, `'Afternoon (11:00 - 14:00)'`, `'Evening (14:00 - 18:00)'`, `'Night (18:00 - 21:00)'`)
  * `cutoff` (`string`): Ordering cut-off deadline (e.g., `'07:00'`, `'10:00'`, `'13:00'`, `'17:00'`)
* **Purpose:** Provides slot selection options in Customer Checkout and Delivery Scheduling without dynamic capacity checks.

### 1.2 `vendors` (5 Static Seller Records)
* **File:** [`src/data/sampleData.js:9-62`](file:///c:/Users/N.AJAYKUMAR/ABI'S%20PROJECT/Micro-Logistics/src/data/sampleData.js#L9-L62)
* **Variable Name:** `vendors`
* **Data Type:** `Array<Object>`
* **Sample IDs:** `'v1'`, `'v2'`, `'v3'`, `'v4'`, `'v5'`
* **Fields:**
  * `id` (`string`): Unique seller identifier
  * `name` (`string`): Store display name (e.g., `'Green Fresh Organics'`)
  * `category` (`string`): Commercial category (`'Groceries'`, `'Bakery'`, `'Fresh Produce'`, `'Dairy'`, `'Specialty'`)
  * `rating` (`number`): Floating-point score (e.g., `4.8`, `4.6`)
  * `reviews` (`number`): Hardcoded review counter (e.g., `124`, `98`)
  * `address` (`string`): Physical street address
  * `phone` (`string`): Store contact number
  * `area` (`string`): Delivery zoning area (`'Downtown'`, `'Northside'`, `'West End'`, `'Eastside'`)
  * `status` (`string`): Account standing (`'Active'`, `'Inactive'`, `'Pending'`)
  * `joinedDate` (`string`): ISO date formatted string
  * `image` (`string`): External Unsplash photo CDN URL
* **Purpose:** Feeds Seller directory, marketplace browsing, seller registration mocks, and admin vendor governance.

### 1.3 `customers` (4 Static Customer Records)
* **File:** [`src/data/sampleData.js:64-105`](file:///c:/Users/N.AJAYKUMAR/ABI'S%20PROJECT/Micro-Logistics/src/data/sampleData.js#L64-L105)
* **Variable Name:** `customers`
* **Data Type:** `Array<Object>`
* **Sample IDs:** `'c1'`, `'c2'`, `'c3'`, `'c4'`
* **Fields:**
  * `id` (`string`): Unique customer identifier
  * `name` (`string`): Customer legal name (e.g., `'Priya Rajan'`)
  * `email` (`string`): Contact email
  * `phone` (`string`): Telephone number
  * `address` (`string`): Street address
  * `area` (`string`): Assigned neighborhood cluster
  * `ordersCount` (`number`): Synthetic past order count
  * `status` (`string`): Account state (`'Active'`, `'Suspended'`)
  * `joinedDate` (`string`): Registration timestamp
* **Purpose:** Powers Admin customer management and provides default profiles for customer session simulations.

### 1.4 `deliveryAgents` / `deliveryPersonnel` (4 Driver Records)
* **File:** [`src/data/sampleData.js:107-156`](file:///c:/Users/N.AJAYKUMAR/ABI'S%20PROJECT/Micro-Logistics/src/data/sampleData.js#L107-L156)
* **Variable Names:** `deliveryAgents` (exported), `deliveryPersonnel` (alias export)
* **Data Type:** `Array<Object>`
* **Sample IDs:** `'da1'`, `'da2'`, `'da3'`, `'da4'`
* **Fields:**
  * `id` (`string`): Agent identifier
  * `name` (`string`): Driver name (e.g., `'Karthik S.'`)
  * `phone` (`string`): Mobile number
  * `vehicle` (`string`): Vehicle type (e.g., `'Electric Scooter'`, `'Cargo Van'`, `'Motorcycle'`)
  * `capacity` (`string` / `number`): Payload limit (e.g., `'30 kg'`, `'120 kg'`)
  * `rating` (`number`): Driver satisfaction rating (e.g., `4.9`, `4.7`)
  * `activeDeliveries` (`number`): Counter of active assignments
  * `area` (`string`): Zone coverage
  * `status` (`string`): Availability status (`'Available'`, `'On Delivery'`, `'Offline'`)
* **Purpose:** Used in Driver portal session dispatch, Admin agent monitoring, and manual batch assignment dropdowns.

### 1.5 `products` (15 Static Product Catalog Items)
* **File:** [`src/data/sampleData.js:158-294`](file:///c:/Users/N.AJAYKUMAR/ABI'S%20PROJECT/Micro-Logistics/src/data/sampleData.js#L158-L294)
* **Variable Name:** `products`
* **Data Type:** `Array<Object>`
* **Sample IDs:** `'p1'` through `'p15'`
* **Fields:**
  * `id` (`string`): SKU ID
  * `vendorId` (`string`): Foreign key referencing `vendors.id` (`'v1'` - `'v5'`)
  * `vendorName` (`string`): Denormalized store name
  * `name` (`string`): Item title (e.g., `'Organic Avocados'`, `'Sourdough Bread'`)
  * `category` (`string`): Category classification
  * `price` (`number`): Unit price in INR
  * `unit` (`string`): Unit dimension (e.g., `'3 pcs'`, `'500g'`, `'1L'`)
  * `stock` (`number`): Available inventory quantity
  * `description` (`string`): Marketing product copy
  * `image` (`string`): External Unsplash photo CDN URL
  * `isOrganic` / `badge` (`boolean` / `string`): Promotional flags
* **Purpose:** Powers Marketplace catalog, customer search, cart calculations, and seller inventory management.

### 1.6 `orders` (10 Multi-Status Pre-Configured Orders)
* **File:** [`src/data/sampleData.js:296-419`](file:///c:/Users/N.AJAYKUMAR/ABI'S%20PROJECT/Micro-Logistics/src/data/sampleData.js#L296-L419)
* **Variable Name:** `orders`
* **Data Type:** `Array<Object>`
* **Sample IDs:** `'ORD-1001'` through `'ORD-1010'`
* **Fields:**
  * `id` (`string`): Order reference number
  * `customerId` (`string`): Foreign key referencing `customers.id`
  * `customerName` (`string`): Denormalized buyer name
  * `vendorId` (`string`): Foreign key referencing `vendors.id`
  * `vendorName` (`string`): Denormalized seller name
  * `items` (`Array<Object>`): Array of ordered line items (`{ productId, name, price, quantity }`)
  * `total` (`number`): Order gross total
  * `status` (`string`): Status state machine (`'Pending'`, `'Confirmed'`, `'Preparing'`, `'Ready'`, `'Batched'`, `'In Transit'`, `'Delivered'`, `'Cancelled'`)
  * `slot` / `timeSlot` (`string`): Delivery window descriptor
  * `deliverySlot` (`string`): Canonical slot ID (`'slot1'`, `'slot2'`, `'slot3'`, `'slot4'`)
  * `deliveryAddress` (`string`): Customer destination address
  * `area` (`string`): Zoning cluster
  * `createdAt` (`string`): ISO timestamp
  * `deliveryAgentId` (`string | null`): Assigned agent ID
  * `batchId` (`string | null`): Assigned batch ID
  * `urgency` (`string`): Priority flag (`'Normal'`, `'Urgent'`)
* **Purpose:** Seeds order tracking, seller fulfillment, admin master orders view, and aggregation algorithms.

### 1.7 `deliveryBatches` / `deliveryGroups` (3 Pre-Aggregated Batches)
* **File:** [`src/data/sampleData.js:421-464`](file:///c:/Users/N.AJAYKUMAR/ABI'S%20PROJECT/Micro-Logistics/src/data/sampleData.js#L421-L464)
* **Variable Names:** `deliveryBatches` (exported), `deliveryGroups` (alias export)
* **Data Type:** `Array<Object>`
* **Sample IDs:** `'B-101'`, `'B-102'`, `'B-103'`
* **Fields:**
  * `id` (`string`): Batch tracking code
  * `orderIds` (`Array<string>`): Orders bundled within this batch
  * `agentId` (`string | null`): Assigned driver ID
  * `agentName` (`string | null`): Denormalized driver name
  * `timeSlot` (`string`): Consolidated time window
  * `area` (`string`): Clustered zone
  * `status` (`string`): Batch lifecycle (`'Draft'`, `'Assigned'`, `'In Transit'`, `'Delivered'`)
  * `vehicle` (`string`): Recommended vehicle type
  * `estimatedDistance` (`string`): Approximate travel distance (e.g., `'4.2 km'`)
  * `estimatedDuration` (`string`): Approximate delivery duration (e.g., `'45 mins'`)
  * `createdAt` (`string`): Creation timestamp
* **Purpose:** Powers Admin Batch Dispatch, Driver Job Sheet, and route preview.

### 1.8 `initialNotifications` (6 Mock System Alerts)
* **File:** [`src/data/sampleData.js:466-498`](file:///c:/Users/N.AJAYKUMAR/ABI'S%20PROJECT/Micro-Logistics/src/data/sampleData.js#L466-L498)
* **Variable Name:** `initialNotifications`
* **Data Type:** `Array<Object>`
* **Sample IDs:** `'n1'` through `'n6'`
* **Fields:**
  * `id` (`string`): Notification ID
  * `userId` (`string`): Target user or role (`'admin'`, `'v1'`, `'c1'`, `'da1'`)
  * `title` (`string`): Short headline
  * `message` (`string`): Notification body copy
  * `time` (`string`): Relative time string (e.g., `'5m ago'`, `'1h ago'`)
  * `read` (`boolean`): Read status indicator
  * `type` (`string`): Category (`'order'`, `'batch'`, `'system'`, `'alert'`)
* **Purpose:** Simulates notification drop-down feed across all portals.

### 1.9 `mockUsers` (9 Credential Pairs for Demo Login)
* **File:** [`src/data/sampleData.js:500-519`](file:///c:/Users/N.AJAYKUMAR/ABI'S%20PROJECT/Micro-Logistics/src/data/sampleData.js#L500-L519)
* **Variable Name:** `mockUsers`
* **Data Type:** `Array<Object>`
* **Fields:**
  * `username` (`string`): Login identifier (`'admin'`, `'seller'`, `'customer'`, `'driver'`, `'v1'`, `'c1'`, `'da1'`, `'priyarajan'`, `'greenfresh'`)
  * `password` (`string`): Hardcoded password (`'admin123'`, `'seller123'`, `'customer123'`, `'driver123'`, `'password123'`)
  * `role` (`string`): Role gatekeeper (`'admin'`, `'seller'`, `'customer'`, `'delivery'`)
  * `name` (`string`): User display name
  * `id` (`string`): Linked profile ID (`'c1'`, `'v1'`, `'da1'`, `'admin-1'`)
* **Purpose:** Powers mock login authentication and fast-fill demo pills in `LoginPage.jsx`.

### 1.10 `adminSettingsInitial` (Default System Configuration)
* **File:** [`src/data/sampleData.js:521-532`](file:///c:/Users/N.AJAYKUMAR/ABI'S%20PROJECT/Micro-Logistics/src/data/sampleData.js#L521-L532)
* **Variable Name:** `adminSettingsInitial`
* **Data Type:** `Object`
* **Fields:**
  * `autoBatchingEnabled` (`boolean`, `true`): Flag for automated grouping
  * `maxBatchSize` (`number`, `5`): Maximum orders per batch
  * `batchingWindowMinutes` (`number`, `30`): Time threshold for clustering
  * `defaultSlotCutoffMinutes` (`number`, `60`): Cut-off time before delivery slot
  * `commissionRatePercent` (`number`, `8.5`): Platform fee percentage
  * `driverBasePay` (`number`, `40`): Base compensation in INR
  * `driverPerKmPay` (`number`, `12`): Distance compensation in INR
* **Purpose:** Populates Admin System Settings page for platform tuning.

---

## 2. Simulated Database & State Mutators

File: [`src/context/AppContext.jsx`](file:///c:/Users/N.AJAYKUMAR/ABI'S%20PROJECT/Micro-Logistics/src/context/AppContext.jsx)  
`AppContext.jsx` acts as a mock database engine. It loads state from `localStorage` using key prefixes `micrologi_*`, executes mutators in memory, writes back to `localStorage`, and emits mock UI notifications.

```
                  AppContext.jsx (Client-Side Mock DB)
  ┌──────────────────────────────────────────────────────────────────┐
  │  Storage Engine: localStorage.getItem('micrologi_*')             │
  │  Key Prefixes:                                                   │
  │    - micrologi_currentUser        - micrologi_orders              │
  │    - micrologi_cart               - micrologi_vendors             │
  │    - micrologi_customers          - micrologi_deliveryAgents      │
  │    - micrologi_deliveryBatches    - micrologi_products            │
  │    - micrologi_notifications      - micrologi_adminSettings       │
  └─────────────────────────────────┬────────────────────────────────┘
                                    │
    ┌───────────────────────────────┴───────────────────────────────┐
    │ 24 Mock Mutator Functions (Simulating REST API Operations)   │
    ├───────────────────────────────┬───────────────────────────────┤
    │ - registerCustomer            │ - createDeliveryBatch         │
    │ - registerSeller              │ - assignAgentToBatch          │
    │ - placeOrder                  │ - updateBatchStatus           │
    │ - updateOrderStatus           │ - addDeliveryAgent            │
    │ - requestDeliverySlotChange   │ - updateDeliveryAgent         │
    │ - updateSellerStatus          │ - updateAdminSettings         │
    │ - updateCustomerStatus        │ - updateUserProfile           │
    │ - addProduct                  │ - updateSellerProfile         │
    │ - updateProduct               │ - addNotification             │
    │ - deleteProduct               │ - markNotificationAsRead      │
    │ - cart management (3 fns)     │ - confirmOrderDelivery (OTP)  │
    └───────────────────────────────┴───────────────────────────────┘
```

### 2.1 State Mutator Specifications

| Function Name | Lines | Mock Logic & ID Generation | Storage Key Affected | Equivalent Real Backend Endpoint |
| :--- | :--- | :--- | :--- | :--- |
| `registerCustomer(data)` | [AppContext.jsx:136-155](file:///c:/Users/N.AJAYKUMAR/ABI'S%20PROJECT/Micro-Logistics/src/context/AppContext.jsx#L136-L155) | Generates `id: 'c' + Date.now()`, appends to list, creates session user | `micrologi_customers`, `micrologi_currentUser` | `POST /api/v1/auth/register-customer` |
| `registerSeller(data)` | [AppContext.jsx:157-178](file:///c:/Users/N.AJAYKUMAR/ABI'S%20PROJECT/Micro-Logistics/src/context/AppContext.jsx#L157-L178) | Generates `id: 'v' + Date.now()`, sets `status: 'Pending'`, creates session | `micrologi_vendors`, `micrologi_currentUser` | `POST /api/v1/auth/register-seller` |
| `placeOrder(orderData)` | [AppContext.jsx:212-255](file:///c:/Users/N.AJAYKUMAR/ABI'S%20PROJECT/Micro-Logistics/src/context/AppContext.jsx#L212-L255) | Generates `id: 'ORD-' + Math.floor(1000 + Math.random() * 9000)`, splits cart items, clears cart, dispatches mock notification | `micrologi_orders`, `micrologi_cart`, `micrologi_notifications` | `POST /api/v1/orders` |
| `updateOrderStatus(id, status)` | [AppContext.jsx:257-270](file:///c:/Users/N.AJAYKUMAR/ABI'S%20PROJECT/Micro-Logistics/src/context/AppContext.jsx#L257-L270) | Updates order `status`, triggers mock notification to customer | `micrologi_orders`, `micrologi_notifications` | `PATCH /api/v1/orders/:id/status` |
| `requestDeliverySlotChange(id, slot)` | [AppContext.jsx:272-290](file:///c:/Users/N.AJAYKUMAR/ABI'S%20PROJECT/Micro-Logistics/src/context/AppContext.jsx#L272-L290) | Mutates `order.slot` and `order.deliverySlot` locally, notifies admin | `micrologi_orders`, `micrologi_notifications` | `POST /api/v1/orders/:id/reschedule` |
| `updateSellerStatus(id, status)` | [AppContext.jsx:292-296](file:///c:/Users/N.AJAYKUMAR/ABI'S%20PROJECT/Micro-Logistics/src/context/AppContext.jsx#L292-L296) | Mutates seller `status` between `'Active'`, `'Pending'`, `'Suspended'` | `micrologi_vendors` | `PATCH /api/v1/admin/sellers/:id/status` |
| `updateCustomerStatus(id, status)` | [AppContext.jsx:298-302](file:///c:/Users/N.AJAYKUMAR/ABI'S%20PROJECT/Micro-Logistics/src/context/AppContext.jsx#L298-L302) | Mutates customer `status` | `micrologi_customers` | `PATCH /api/v1/admin/customers/:id/status` |
| `createDeliveryBatch(batchData)` | [AppContext.jsx:304-329](file:///c:/Users/N.AJAYKUMAR/ABI'S%20PROJECT/Micro-Logistics/src/context/AppContext.jsx#L304-L329) | Generates `id: 'B-' + Math.floor(1000 + Math.random() * 9000)`, updates status of each bundled order to `'Batched'` | `micrologi_deliveryBatches`, `micrologi_orders` | `POST /api/v1/batches` |
| `assignAgentToBatch(batchId, agentId)` | [AppContext.jsx:331-355](file:///c:/Users/N.AJAYKUMAR/ABI'S%20PROJECT/Micro-Logistics/src/context/AppContext.jsx#L331-L355) | Updates `batch.agentId`, `batch.status: 'Assigned'`, and links `deliveryAgentId` on all child orders | `micrologi_deliveryBatches`, `micrologi_orders` | `POST /api/v1/batches/:id/assign` |
| `updateBatchStatus(id, status)` | [AppContext.jsx:357-376](file:///c:/Users/N.AJAYKUMAR/ABI'S%20PROJECT/Micro-Logistics/src/context/AppContext.jsx#L357-L376) | Updates batch status; cascades `'Delivered'` or `'In Transit'` down to all child orders | `micrologi_deliveryBatches`, `micrologi_orders` | `PATCH /api/v1/batches/:id/status` |
| `addDeliveryAgent(agentData)` | [AppContext.jsx:378-386](file:///c:/Users/N.AJAYKUMAR/ABI'S%20PROJECT/Micro-Logistics/src/context/AppContext.jsx#L378-L386) | Generates `id: 'da' + Date.now()`, sets default `status: 'Available'` | `micrologi_deliveryAgents` | `POST /api/v1/delivery-agents` |
| `updateDeliveryAgent(id, data)` | [AppContext.jsx:388-392](file:///c:/Users/N.AJAYKUMAR/ABI'S%20PROJECT/Micro-Logistics/src/context/AppContext.jsx#L388-L392) | Merges updated fields into delivery agent record | `micrologi_deliveryAgents` | `PATCH /api/v1/delivery-agents/:id` |
| `updateAdminSettings(settings)` | [AppContext.jsx:394-398](file:///c:/Users/N.AJAYKUMAR/ABI'S%20PROJECT/Micro-Logistics/src/context/AppContext.jsx#L394-L398) | Merges administrative system tuning config | `micrologi_adminSettings` | `PUT /api/v1/admin/settings` |
| `updateUserProfile(profileData)` | [AppContext.jsx:400-415](file:///c:/Users/N.AJAYKUMAR/ABI'S%20PROJECT/Micro-Logistics/src/context/AppContext.jsx#L400-L415) | Syncs profile update across `currentUser` and `customers` list | `micrologi_currentUser`, `micrologi_customers` | `PATCH /api/v1/users/profile` |
| `updateSellerProfile(vendorId, data)`| [AppContext.jsx:417-432](file:///c:/Users/N.AJAYKUMAR/ABI'S%20PROJECT/Micro-Logistics/src/context/AppContext.jsx#L417-L432) | Syncs vendor updates across `vendors` and current session | `micrologi_vendors`, `micrologi_currentUser` | `PATCH /api/v1/sellers/profile` |
| `addProduct(productData)` | [AppContext.jsx:434-442](file:///c:/Users/N.AJAYKUMAR/ABI'S%20PROJECT/Micro-Logistics/src/context/AppContext.jsx#L434-L442) | Generates `id: 'p' + Date.now()`, appends to product list | `micrologi_products` | `POST /api/v1/products` |
| `updateProduct(id, productData)` | [AppContext.jsx:444-448](file:///c:/Users/N.AJAYKUMAR/ABI'S%20PROJECT/Micro-Logistics/src/context/AppContext.jsx#L444-L448) | Mutates product catalog record by ID | `micrologi_products` | `PUT /api/v1/products/:id` |
| `deleteProduct(id)` | [AppContext.jsx:450-454](file:///c:/Users/N.AJAYKUMAR/ABI'S%20PROJECT/Micro-Logistics/src/context/AppContext.jsx#L450-L454) | Filters out product from in-memory list | `micrologi_products` | `DELETE /api/v1/products/:id` |
| `addNotification(notif)` | [AppContext.jsx:456-464](file:///c:/Users/N.AJAYKUMAR/ABI'S%20PROJECT/Micro-Logistics/src/context/AppContext.jsx#L456-L464) | Generates `id: 'n' + Date.now()`, prepends to alert feed | `micrologi_notifications` | `POST /api/v1/notifications` |
| `markNotificationAsRead(id)` | [AppContext.jsx:466-470](file:///c:/Users/N.AJAYKUMAR/ABI'S%20PROJECT/Micro-Logistics/src/context/AppContext.jsx#L466-L470) | Flips `read: true` on notification | `micrologi_notifications` | `PATCH /api/v1/notifications/:id/read` |
| `markAllNotificationsAsRead()` | [AppContext.jsx:472-476](file:///c:/Users/N.AJAYKUMAR/ABI'S%20PROJECT/Micro-Logistics/src/context/AppContext.jsx#L472-L476) | Flips `read: true` for all alerts | `micrologi_notifications` | `PATCH /api/v1/notifications/read-all` |
| `confirmOrderPickup(orderId)` | [AppContext.jsx:500-503](file:///c:/Users/N.AJAYKUMAR/ABI'S%20PROJECT/Micro-Logistics/src/context/AppContext.jsx#L500-L503) | Alias calling `updateOrderStatus(orderId, 'In Transit')` | `micrologi_orders` | `POST /api/v1/orders/:id/pickup` |
| `confirmOrderDelivery(orderId, otp)`| [AppContext.jsx:505-513](file:///c:/Users/N.AJAYKUMAR/ABI'S%20PROJECT/Micro-Logistics/src/context/AppContext.jsx#L505-L513) | Sets `status: 'Delivered'`, notifies buyer | `micrologi_orders`, `micrologi_notifications` | `POST /api/v1/orders/:id/deliver` |

---

## 3. Algorithmic Heuristic Mock Engine

File: [`src/utils/aggregationUtils.js`](file:///c:/Users/N.AJAYKUMAR/ABI'S%20PROJECT/Micro-Logistics/src/utils/aggregationUtils.js)  
The platform features an intelligent micro-logistics order clustering and batching engine. In the frontend, this is implemented as an empirical scoring algorithm using hardcoded string heuristics and mathematical approximations.

```
                  src/utils/aggregationUtils.js
  ┌─────────────────────────────────────────────────────────────┐
  │ Candidate Orders (Pending / Confirmed / Ready)              │
  └──────────────────────────────┬──────────────────────────────┘
                                 │
                 extractArea(order.deliveryAddress)
                 (Parses strings: Downtown, Northside, etc.)
                                 │
                                 ▼
           areTimeSlotsCompatible(slot1, slot2) Matrix
           ┌───────────┬───────────┬───────────┬───────────┐
           │   slot1   │   slot2   │   slot3   │   slot4   │
           │ (Morning) │(Afternoon)│ (Evening) │  (Night)  │
           └───────────┴───────────┴───────────┴───────────┘
                                 │
                                 ▼
         calculateCompatibilityScore(candidateOrder, currentGroup)
         ┌─────────────────────────────────────────────────────┐
         │ - Baseline Score:                    50 pts         │
         │ - Exact Slot Match:                 +15 pts         │
         │ - Compatible Slot Match:            +10 pts         │
         │ - Vendor Clustering Match:          +20 pts         │
         │ - Urgent Order Co-clustering:       +10 pts         │
         │ - Normal Order Compatibility:       +10 pts         │
         │ - Group Size Under Capacity:        + 5 pts         │
         │ ─────────────────────────────────────────────────── │
         │ Maximum Theoretical Score:          100%            │
         └─────────────────────────────────────────────────────┘
                                 │
                                 ▼
          Approximation Formulas for Batch Distance & Duration:
          - Distance: `(1.5 + (group.orders.length * 0.9)).toFixed(1) + ' km'`
          - Duration: `(15 + (group.orders.length * 10)) + ' mins'`
          - Vehicle Heuristic: count > 3 ? 'Cargo Van' : 'Electric Scooter'
```

### 3.1 Function-by-Function Breakdown

#### 3.1.1 `extractArea(deliveryAddress)`
* **File:** [`src/utils/aggregationUtils.js:16-32`](file:///c:/Users/N.AJAYKUMAR/ABI'S%20PROJECT/Micro-Logistics/src/utils/aggregationUtils.js#L16-L32)
* **Logic:** Matches substrings `'Downtown'`, `'Northside'`, `'West End'`, `'Eastside'`, `'Central'`, `'South'` against customer address strings. If no substring matches, falls back to `'Central'`.
* **Limitation:** Cannot perform true geospatial polygon boundaries, geocoding, or postal code routing.

#### 3.1.2 `areTimeSlotsCompatible(slotA, slotB)`
* **File:** [`src/utils/aggregationUtils.js:34-56`](file:///c:/Users/N.AJAYKUMAR/ABI'S%20PROJECT/Micro-Logistics/src/utils/aggregationUtils.js#L34-L56)
* **Logic:** Compares two slot IDs using a hardcoded adjacency table:
  * `'slot1'` is compatible with `['slot1', 'slot2']`
  * `'slot2'` is compatible with `['slot1', 'slot2', 'slot3']`
  * `'slot3'` is compatible with `['slot2', 'slot3', 'slot4']`
  * `'slot4'` is compatible with `['slot3', 'slot4']`
* **Limitation:** Ignores real-time traffic, dispatch delays, and actual vendor operating hours.

#### 3.1.3 `calculateCompatibilityScore(order, group)`
* **File:** [`src/utils/aggregationUtils.js:58-94`](file:///c:/Users/N.AJAYKUMAR/ABI'S%20PROJECT/Micro-Logistics/src/utils/aggregationUtils.js#L58-L94)
* **Logic:** Returns an integer score `[0 - 100]`:
  * Base: `50`
  * Exact Slot Match: `+15`
  * Adjacency Slot Match: `+10`
  * Matching Vendor ID: `+20`
  * Urgency Match: `+10`
  * Batch Size Headroom: `+5`
* **Limitation:** Static rule-based heuristic with no machine learning optimization or Traveling Salesperson Problem (TSP) path calculation.

#### 3.1.4 `findSuitableOrderGroups(unbatchedOrders, existingGroups, maxGroupSize = 4)`
* **File:** [`src/utils/aggregationUtils.js:96-180`](file:///c:/Users/N.AJAYKUMAR/ABI'S%20PROJECT/Micro-Logistics/src/utils/aggregationUtils.js#L96-L180)
* **Logic:** Iterates through unbatched orders, groups them by extracted area, evaluates score against existing groups, and if no score $\ge 60$ is found, instantiates a new group object with:
  * `id: 'group-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4)`
  * `recommendationReason: 'Mock Aggregation Recommendation'`
  * Synthetic distance: `(1.5 + (count * 0.9)).toFixed(1) + ' km'`
  * Synthetic duration: `(15 + (count * 10)) + ' mins'`
  * Synthetic vehicle selection: `count > 3 ? 'Cargo Van' : 'Electric Scooter / Bike'`

---

## 4. Component-Level Mock Elements & UI Fallbacks

Beyond global data files, specific UI components contain hardcoded logic, test credentials, and mock fallbacks:

### 4.1 Hardcoded OTP Verification
* **File:** [`src/components/delivery/DeliveryConfirmationModal.jsx:26-38`](file:///c:/Users/N.AJAYKUMAR/ABI'S%20PROJECT/Micro-Logistics/src/components/delivery/DeliveryConfirmationModal.jsx#L26-L38)
* **Code:**
  ```javascript
  if (otp.trim() === '1234') {
    onConfirm(otp);
    setOtp('');
  } else {
    setError('Invalid OTP. Please enter the correct code provided by customer.');
  }
  ```
* **Description:** Delivery proof-of-delivery is bypassed by hardcoding the valid customer secret to `'1234'`.
* **Backend Requirement:** Backend must generate a cryptographically random 4- or 6-digit OTP upon order transit, send via SMS/push to customer, and verify hashed OTP on submission.

### 4.2 SVG Vector Route Simulation (`MapPlaceholder.jsx`)
* **File:** [`src/components/common/MapPlaceholder.jsx:1-122`](file:///c:/Users/N.AJAYKUMAR/ABI'S%20PROJECT/Micro-Logistics/src/components/common/MapPlaceholder.jsx#L1-L122)
* **Code:**
  ```xml
  <path d="M 80 120 C 180 40, 320 220, 420 100" fill="none" stroke="#2563eb" strokeWidth="4" strokeDasharray="8 6" />
  ```
* **Description:** Displays an SVG canvas with a static Bezier curve connecting coordinates `(80, 120)` to `(420, 100)`, with a CSS pulsating dot simulating driver GPS telemetry and a static badge reading `"Estimated Delivery: 25 mins"`.
* **Backend Requirement:** Real dynamic map integration (Mapbox / Google Maps SDK / Leaflet) driven by real-time WebSocket GPS coordinates (`/api/v1/tracking/stream`).

### 4.3 Demo Quick-Fill Login Pills
* **File:** [`src/auth/LoginPage.jsx:87-118`](file:///c:/Users/N.AJAYKUMAR/ABI'S%20PROJECT/Micro-Logistics/src/auth/LoginPage.jsx#L87-L118)
* **Description:** Provides one-click buttons that auto-fill hardcoded test accounts:
  * Customer: `priyarajan` / `password123`
  * Seller: `v1` / `password123`
  * Admin: `admin` / `admin123`
  * Driver: `dp1` / `password123`
* **Backend Requirement:** Standard OAuth2 / JWT authentication endpoint with password hashing (bcrypt/argon2).

### 4.4 Admin Analytics Synthetic Distance & Carbon Calculations
* **File:** [`src/portals/admin/AdminAnalyticsPage.jsx:32-45`](file:///c:/Users/N.AJAYKUMAR/ABI'S%20PROJECT/Micro-Logistics/src/portals/admin/AdminAnalyticsPage.jsx#L32-L45)
* **Code:**
  ```javascript
  const distanceSavedKm = (totalBatchedOrders * 2.8).toFixed(1);
  const co2SavedKg = (distanceSavedKm * 0.192).toFixed(1);
  ```
* **Description:** Calculates green logistics impact using hardcoded multipliers (`2.8 km` saved per batched order, `0.192 kg` CO2 reduced per km).
* **Backend Requirement:** Real routing distance delta computation comparing aggregated TSP route length versus individual point-to-point dispatch distances.

### 4.5 Seller Analytics Hardcoded Weekly Distribution
* **File:** [`src/portals/seller/SellerAnalyticsPage.jsx:48-60`](file:///c:/Users/N.AJAYKUMAR/ABI'S%20PROJECT/Micro-Logistics/src/portals/seller/SellerAnalyticsPage.jsx#L48-L60)
* **Code:**
  ```javascript
  const weeklyDistribution = [40, 65, 80, 55, 90, 100, 70];
  ```
* **Description:** Renders weekly demand bar charts from static percentages rather than querying order timestamps.
* **Backend Requirement:** MongoDB aggregation pipeline grouping orders by `$dayOfWeek` for the authenticated vendor.

### 4.6 Customer Browse Sellers Hardcoded Review Label
* **File:** [`src/portals/customer/BrowseSellersPage.jsx:89`](file:///c:/Users/N.AJAYKUMAR/ABI'S%20PROJECT/Micro-Logistics/src/portals/customer/BrowseSellersPage.jsx#L89)
* **Code:**
  ```javascript
  <span className="seller-review-count">({seller.reviews || 0} Mock reviews)</span>
  ```
* **Description:** Explicitly displays the text `"(Mock reviews)"` in the vendor card.
* **Backend Requirement:** Real customer reviews collection with rating aggregation.

### 4.7 Simulated Reports Generation
* **File:** [`src/portals/admin/AdminReportsPage.jsx:54-72`](file:///c:/Users/N.AJAYKUMAR/ABI'S%20PROJECT/Micro-Logistics/src/portals/admin/AdminReportsPage.jsx#L54-L72)
* **Code:**
  ```javascript
  setTimeout(() => {
    setIsGenerating(false);
    setDownloadUrl('#mock-download');
  }, 1500);
  ```
* **Description:** Simulates CSV/PDF report generation with a dummy `setTimeout` delay and a fake download anchor.
* **Backend Requirement:** Asynchronous report generation worker using BullMQ or AWS S3 signed URL download link.

---

## 5. End-to-End Mock Pipelines & Lifecycle Simulations

```
                         Complete Mock Order Lifecycle Flow
 ┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
 │ Customer Portal │       │  Seller Portal  │       │  Admin Portal   │       │  Driver Portal  │
 └────────┬────────┘       └────────┬────────┘       └────────┬────────┘       └────────┬────────┘
          │                         │                         │                         │
  [1] Place Order                   │                         │                         │
      (ORD-XXXX)                    │                         │                         │
      status: Pending               │                         │                         │
          ├────────────────────────>│                         │                         │
          │                   [2] Accept Order                │                         │
          │                       status: Confirmed           │                         │
          │                   [3] Ready for Pickup            │                         │
          │                       status: Ready               │                         │
          │                         ├────────────────────────>│                         │
          │                         │                   [4] Batch Optimization          │
          │                         │                       aggregationUtils.js         │
          │                         │                   [5] Create Batch (B-XXXX)       │
          │                         │                       status: Batched             │
          │                         │                   [6] Assign Agent                │
          │                         │                       status: Assigned            │
          │                         │                         ├────────────────────────>│
          │                         │                         │                   [7] Start Transit
          │                         │                         │                       status: In Transit
          │<────────────────────────┴─────────────────────────┴─────────────────────────┤
          │                                  [8] Delivery Confirmation                  │
          │                                      OTP: "1234"                            │
          │                                      status: Delivered                      │
          ▼                                                                             ▼
```

### 5.1 Pipeline 1: Customer Checkout to Order Genesis
1. **Trigger:** Customer clicks `"Place Order"` in `CheckoutPage.jsx`.
2. **Mock Execution:**
   * Invokes `placeOrder(orderData)` in `AppContext.jsx`.
   * Calculates random order reference: `'ORD-' + Math.floor(1000 + Math.random() * 9000)`.
   * Sets initial status to `'Pending'`.
   * Deducts cart items locally.
   * Emits simulated notification: `"Order placed successfully! Reference: ORD-XXXX"`.
3. **Flaws / Mock Gaps:** No payment gateway authorization (Stripe/Razorpay), no atomic inventory reservation, no transactional guarantees.

### 5.2 Pipeline 2: Seller Order Fulfillment
1. **Trigger:** Seller views pending orders in `SellerOrdersPage.jsx` and clicks `"Confirm Order"`, then `"Mark as Ready"`.
2. **Mock Execution:**
   * Calls `updateOrderStatus(orderId, 'Confirmed')`, then `updateOrderStatus(orderId, 'Ready')`.
   * Updates state in `localStorage` under `micrologi_orders`.
   * Emits notification to customer: `"Order #ORD-XXXX has been accepted by vendor"`.
3. **Flaws / Mock Gaps:** No real-time push to customer; customer only sees updates upon component re-render or page reload.

### 5.3 Pipeline 3: Automated & Manual Order Aggregation Batching
1. **Trigger:** Admin visits `AdminBatchesPage.jsx` and clicks `"Run Auto-Grouping"` or selects checkboxes to `"Create Custom Batch"`.
2. **Mock Execution:**
   * Feeds unbatched orders into `findSuitableOrderGroups()` in `aggregationUtils.js`.
   * Renders synthetic recommendations with scores (e.g., `85% Compatibility`).
   * On confirmation, calls `createDeliveryBatch(batchData)`.
   * Generates batch ID `'B-' + Math.floor(1000 + Math.random() * 9000)`.
   * Updates all bundled orders to `status: 'Batched'` and assigns `batchId`.
3. **Flaws / Mock Gaps:** No spatial routing engine (OSRM/Google Directions API), no vehicle physical dimension/weight constraint checks.

### 5.4 Pipeline 4: Driver Assignment & Route Dispatch
1. **Trigger:** Admin selects a driver from dropdown and clicks `"Assign Agent"` in `AdminBatchesPage.jsx`.
2. **Mock Execution:**
   * Calls `assignAgentToBatch(batchId, agentId)`.
   * Sets `batch.agentId = agentId` and `batch.status = 'Assigned'`.
   * Cascades `deliveryAgentId` to all bundled orders.
   * Increments driver's `activeDeliveries` counter locally.
3. **Flaws / Mock Gaps:** No driver acceptance/rejection flow, no location-based proximity dispatching.

### 5.5 Pipeline 5: Driver Transit & OTP Proof of Delivery
1. **Trigger:** Driver clicks `"Start Batch"` in `DriverBatchesPage.jsx`, clicks `"Pick Up"`, navigates to stop, and clicks `"Complete Delivery"`.
2. **Mock Execution:**
   * Opens `DeliveryConfirmationModal.jsx`.
   * Verifies input against static string `'1234'`.
   * On match, calls `confirmOrderDelivery(orderId, '1234')`.
   * Cascades order status to `'Delivered'`.
   * When all batch orders are delivered, sets `batch.status = 'Delivered'`.
3. **Flaws / Mock Gaps:** Zero cryptographic authentication, no geo-fencing check to verify driver is at delivery address, no digital signature capture.

---

## 6. Complete Backend Replacement Matrix

| # | Mock Artifact / Function / Data | Source File & Location | Replacement Backend Component | Target REST / WebSocket Endpoint | Database Collection / Table |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **1** | `deliverySlots` (4 static records) | `sampleData.js:1-7` | Delivery Slot Management Service | `GET /api/v1/delivery-slots?area=...` | `delivery_slots` |
| **2** | `vendors` (5 static sellers) | `sampleData.js:9-62` | Vendor Management Service | `GET /api/v1/vendors` | `vendors` / `stores` |
| **3** | `customers` (4 static buyers) | `sampleData.js:64-105` | User Profile Service | `GET /api/v1/users?role=customer` | `users` |
| **4** | `deliveryAgents` (4 drivers) | `sampleData.js:107-156` | Fleet Dispatch Service | `GET /api/v1/delivery-agents` | `delivery_agents` |
| **5** | `products` (15 static items) | `sampleData.js:158-294` | Product Catalog Service | `GET /api/v1/products?vendorId=...` | `products` |
| **6** | `orders` (10 multi-status orders) | `sampleData.js:296-419` | Order Processing Service | `GET /api/v1/orders` | `orders` |
| **7** | `deliveryBatches` (3 batches) | `sampleData.js:421-464` | Dispatch & Batching Engine | `GET /api/v1/batches` | `batches` |
| **8** | `initialNotifications` (6 alerts) | `sampleData.js:466-498` | Notification Service (SSE / WS) | `GET /api/v1/notifications` + WS stream | `notifications` |
| **9** | `mockUsers` (9 demo credentials) | `sampleData.js:500-519` | Identity & Auth Service | `POST /api/v1/auth/login` | `users` (bcrypt password hash) |
| **10**| `adminSettingsInitial` | `sampleData.js:521-532` | System Config Service | `GET /api/v1/admin/settings` | `system_settings` |
| **11**| `registerCustomer()` | `AppContext.jsx:136-155` | Auth Registration Endpoint | `POST /api/v1/auth/register-customer` | `users` |
| **12**| `registerSeller()` | `AppContext.jsx:157-178` | Vendor Onboarding Endpoint | `POST /api/v1/auth/register-seller` | `users` + `vendors` |
| **13**| `placeOrder()` | `AppContext.jsx:212-255` | Order Creation & Payment Intent | `POST /api/v1/orders` | `orders` + `order_items` |
| **14**| `updateOrderStatus()` | `AppContext.jsx:257-270` | Order State Machine Service | `PATCH /api/v1/orders/:id/status` | `orders` |
| **15**| `requestDeliverySlotChange()` | `AppContext.jsx:272-290` | Slot Reschedule Service | `POST /api/v1/orders/:id/reschedule` | `orders` |
| **16**| `createDeliveryBatch()` | `AppContext.jsx:304-329` | Batch Aggregation Service | `POST /api/v1/batches` | `batches` |
| **17**| `assignAgentToBatch()` | `AppContext.jsx:331-355` | Fleet Dispatch Service | `POST /api/v1/batches/:id/assign` | `batches` + `delivery_agents` |
| **18**| `updateBatchStatus()` | `AppContext.jsx:357-376` | Batch Lifecycle Service | `PATCH /api/v1/batches/:id/status` | `batches` |
| **19**| `addProduct()`, `updateProduct()` | `AppContext.jsx:434-448` | Inventory Management API | `POST /api/v1/products`, `PUT /:id` | `products` |
| **20**| `confirmOrderDelivery()` (OTP) | `AppContext.jsx:505-513` | Cryptographic OTP Verification | `POST /api/v1/orders/:id/verify-delivery`| `orders` |
| **21**| `findSuitableOrderGroups()` | `aggregationUtils.js:96` | Route Optimization Engine (VRP/TSP) | `POST /api/v1/batches/optimize` | Background Worker (Redis/BullMQ)|
| **22**| Hardcoded OTP check (`1234`) | `DeliveryConfirmationModal:26` | Redis OTP Store & SMS Gateway | `POST /api/v1/orders/:id/verify-otp` | Redis (TTL 10 mins) |
| **23**| SVG Bezier Route (`MapPlaceholder`) | `MapPlaceholder.jsx:1-122` | Real Mapbox / OSRM Telemetry Stream | `WS /api/v1/tracking/live/:orderId` | Redis Geospatial / MongoDB GeoJSON |
| **24**| Simulated Reports (`setTimeout`) | `AdminReportsPage.jsx:54` | Async Worker Report Export Pipeline | `POST /api/v1/reports/export` | Cloud Storage (AWS S3) |

---

## 7. Backend Implementation Checklist

To transition the frontend to the production backend, execute the following phased migration steps:

### Phase 1: Authentication & Identity Service
- [ ] Replace `mockUsers` in `LoginPage.jsx` with real JWT authentication (`POST /api/v1/auth/login`).
- [ ] Implement password hashing (bcrypt) and return signed Access Tokens (15m expiry) + HttpOnly Refresh Tokens (7d expiry).
- [ ] Replace `registerCustomer()` and `registerSeller()` in `AppContext.jsx` with API calls.
- [ ] Remove demo quick-fill login pills from production build.

### Phase 2: Core Data Services & Cart State
- [ ] Implement MongoDB schemas for `users`, `vendors`, `products`, and `orders`.
- [ ] Create API client service (`src/services/api.js`) utilizing `axios` or native `fetch` with token interceptors.
- [ ] Migrate `AppContext.jsx` state initialization from `localStorage` to initial REST fetch calls (`useEffect` triggers).
- [ ] Implement transactional order creation with inventory decrementation and payment intent integration.

### Phase 3: Dynamic Aggregation & Dispatch Engine
- [ ] Extract `aggregationUtils.js` clustering logic to a Node.js/Python backend service.
- [ ] Integrate real geospatial routing using OSRM (Open Source Routing Machine) or Google Distance Matrix API.
- [ ] Implement Vehicle Routing Problem (VRP) solver for vehicle capacity and delivery slot constraint enforcement.
- [ ] Replace client-side batch creation with `POST /api/v1/batches/generate` and `POST /api/v1/batches/assign`.

### Phase 4: Real-Time Fleet Telemetry & Security
- [ ] Set up WebSocket server (Socket.io or native WebSockets) for real-time driver GPS tracking.
- [ ] Replace `MapPlaceholder.jsx` SVG paths with an interactive Leaflet or Mapbox map subscriber.
- [ ] Implement secure 4-digit OTP generation on dispatch, storing hashed OTP in Redis with a 15-minute TTL.
- [ ] Replace hardcoded `1234` check in `DeliveryConfirmationModal.jsx` with `POST /api/v1/orders/:id/verify-delivery`.
- [ ] Replace client-side simulated notifications with WebSocket / Server-Sent Events (SSE).

---
*Report compiled and verified against the Micro-Logistics codebase.*
