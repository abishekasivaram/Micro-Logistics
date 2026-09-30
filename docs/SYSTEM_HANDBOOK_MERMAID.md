# Micro-Logistics Management System: Architectural & Operational Handbook (Mermaid Edition)

> **Document Version**: 2.0.0  
> **Target Audience**: Full-Stack Engineers, DevOps, System Architects, QA Engineers, and Product Managers  
> **Scope**: System Topology, Multi-Tenant Routing, Tri-State Order Lifecycle, Aggregation Engine, Database ERD, and Sequence Workflows.

---

## Table of Contents
1. [Chapter 1: System Purpose & Core Concept](#chapter-1-system-purpose--core-concept)
2. [Chapter 2: Full-Stack System Architecture](#chapter-2-full-stack-system-architecture)
3. [Chapter 3: Database Entity-Relationship Architecture (ERD)](#chapter-3-database-entity-relationship-architecture-erd)
4. [Chapter 4: Multi-Tenant Role & Route Navigation Hierarchy](#chapter-4-multi-tenant-role--route-navigation-hierarchy)
5. [Chapter 5: Order, Batch & Delivery Tri-State Lifecycle](#chapter-5-order-batch--delivery-tri-state-lifecycle)
6. [Chapter 6: Smart Order Aggregation Algorithm Engine](#chapter-6-smart-order-aggregation-algorithm-engine)
7. [Chapter 7: End-to-End Operational Sequence Diagrams](#chapter-7-end-to-end-operational-sequence-diagrams)
8. [Chapter 8: Data Mapping & Legacy ID Compatibility Layer](#chapter-8-data-mapping--legacy-id-compatibility-layer)
9. [Chapter 9: System Edge Cases & Exception Handling Workflows](#chapter-9-system-edge-cases--exception-handling-workflows)

---

## Chapter 1: System Purpose & Core Concept

### 1.1 The Micro-Logistics Paradigm
Traditional on-demand delivery models operate on an un-batched **1:1 Courier Dispatch** model, generating high delivery fees and route redundancies. **Micro-Logistics** shifts to a **Multi-Vendor Milk-Run Aggregation** model:

```mermaid
flowchart TB
    subgraph Traditional ["Traditional 1:1 Dispatch (High Cost & Traffic)"]
        V1["Vendor A (Bakery)"] -->|Driver 1| C1["Customer 1 (East Wing)"]
        V2["Vendor B (Florist)"] -->|Driver 2| C2["Customer 2 (East Wing)"]
        V3["Vendor C (Grocery)"] -->|Driver 3| C3["Customer 3 (East Wing)"]
    end

    subgraph MicroLogistics ["Micro-Logistics Aggregation Model (Optimized Milk-Run)"]
        direction TB
        MV1["Vendor A"] & MV2["Vendor B"] & MV3["Vendor C"] -->|Sequential Pickup| SingleDriver["Single Assigned Delivery Partner"]
        SingleDriver -->|Consolidated Multi-Stop Route| MC1["Customer 1"]
        SingleDriver -->|Next Stop| MC2["Customer 2"]
        SingleDriver -->|Next Stop| MC3["Customer 3"]
    end
```

### 1.2 Core Business Objectives
* **Batch Density**: Combine 2 to 4 customer drops within a 3–8 km spatial radius into a single driver trip.
* **Scheduled Time-Slot Windows**: Orders are matched against overlapping fixed delivery time-slots (7–11 AM, 9 AM–1 PM, 12–4 PM, 3–7 PM, 6–10 PM).
* **Multi-Merchant Staging**: Enable consumers to order from diverse neighborhood merchants with a single scheduled arrival.
* **Tamper-Proof Handover**: OTP authentication between driver and recipient.

---

## Chapter 2: Full-Stack System Architecture

### 2.1 Complete Architectural Topology
The application follows a decoupled client-server architecture:

```mermaid
graph TB
    subgraph ClientLayer ["Client Presentation Layer (React 19 + Vite SPA)"]
        UI_Cust["Customer Portal<br/>(Cart, Checkout, Live Tracking)"]
        UI_Vend["Seller Portal<br/>(Catalog, Staging, Prep Times)"]
        UI_Deliv["Delivery Partner Portal<br/>(Waypoints, Route Map, OTP)"]
        UI_Admin["Operations Admin Portal<br/>(Aggregation Engine, Settings)"]
        
        State_Ctx["AppContext (Central State Manager)<br/>- Reactive State & Local Cache<br/>- Simulated & Live API Mutators"]
        
        UI_Cust --> State_Ctx
        UI_Vend --> State_Ctx
        UI_Deliv --> State_Ctx
        UI_Admin --> State_Ctx
    end

    subgraph IngressGateway ["Ingress & API Gateway Layer"]
        VercelEdge["Vercel Serverless Function<br/>(api/index.js)"]
        LocalExpress["Node.js Express Server :5000<br/>(backend/src/server.js)"]
        
        MW_Cors["CORS & Security Headers<br/>(Helmet, BodyParser)"]
        MW_Auth["Authentication Middleware<br/>(requireAuth, requireRole)"]
        MW_Err["Global Error Handler<br/>(error.middleware.js)"]
        
        VercelEdge --> MW_Cors
        LocalExpress --> MW_Cors
        MW_Cors --> MW_Auth
        MW_Auth --> MW_Err
    end

    subgraph ServiceLayer ["Backend Service & Controller Layer"]
        Ctrl_Auth["Auth & Profile Controller"]
        Ctrl_Prod["Product Controller"]
        Ctrl_Vend["Vendor Controller"]
        Ctrl_Ord["Order Controller"]
        Ctrl_Deliv["Delivery & Batch Controller"]
        
        Adapter_Map["Mapping Adapter (mappings.js)<br/>UUID ↔ Legacy ID (c1, v1, p1, ORD-xxxx)"]
        
        MW_Err --> Ctrl_Auth
        MW_Err --> Ctrl_Prod
        MW_Err --> Ctrl_Vend
        MW_Err --> Ctrl_Ord
        MW_Err --> Ctrl_Deliv
        
        Ctrl_Auth --> Adapter_Map
        Ctrl_Prod --> Adapter_Map
        Ctrl_Vend --> Adapter_Map
        Ctrl_Ord --> Adapter_Map
        Ctrl_Deliv --> Adapter_Map
    end

    subgraph PersistenceLayer ["Persistence & External Cloud Services"]
        SupaClient["Supabase SDK Client<br/>(@supabase/supabase-js)"]
        PostgresDB[("Supabase PostgreSQL<br/>- 12 Relational Tables<br/>- Foreign Keys & Indexes")]
        GoogleMaps["Google Maps Platform<br/>- Directions API<br/>- Geocoding & Telemetry"]
        
        Adapter_Map --> SupaClient
        SupaClient --> PostgresDB
        ClientLayer -.->|Route Rendering| GoogleMaps
    end

    ClientLayer -->|REST / JSON Requests| IngressGateway
```

---

## Chapter 3: Database Entity-Relationship Architecture (ERD)

### 3.1 Entity-Relationship Diagram

```mermaid
erDiagram
    PROFILES ||--o| CUSTOMER_PROFILES : "specializes to"
    PROFILES ||--o| VENDORS : "specializes to"
    PROFILES ||--o| DELIVERY_AGENTS : "specializes to"
    PROFILES ||--o{ NOTIFICATIONS : "receives"

    CUSTOMER_PROFILES ||--o{ ORDERS : "places"
    VENDORS ||--o{ PRODUCTS : "owns"
    VENDORS ||--o{ ORDERS : "fulfills"

    PRODUCTS ||--o{ ORDER_ITEMS : "referenced by"
    ORDERS ||--|{ ORDER_ITEMS : "contains"

    DELIVERY_BATCHES ||--o{ DELIVERY_BATCH_ORDERS : "associates"
    ORDERS ||--o{ DELIVERY_BATCH_ORDERS : "grouped in"

    DELIVERY_AGENTS ||--o{ DELIVERY_BATCHES : "assigned"
    DELIVERY_AGENTS ||--o{ ORDERS : "transports"

    PROFILES {
        UUID id PK
        TEXT username
        TEXT email
        TEXT phone
        user_role role
        TIMESTAMPTZ created_at
        TIMESTAMPTZ updated_at
    }

    CUSTOMER_PROFILES {
        UUID id PK,FK
        TEXT legacy_id
        TEXT address
        TEXT area
        FLOAT lat
        FLOAT lng
        TEXT avatar
        TEXT status
        INT total_orders
        INT active_orders
    }

    VENDORS {
        UUID id PK,FK
        TEXT legacy_id
        TEXT shop_name
        TEXT owner_name
        TEXT category
        FLOAT rating
        TEXT prep_time
        BOOLEAN is_open
        TEXT status
        TEXT address
        TEXT area
        FLOAT lat
        FLOAT lng
    }

    DELIVERY_AGENTS {
        UUID id PK,FK
        TEXT legacy_id
        TEXT current_area
        INT capacity
        INT current_orders
        TEXT availability
        TEXT status
        TEXT vehicle
        FLOAT rating
    }

    PRODUCTS {
        UUID id PK
        TEXT legacy_id
        UUID vendor_id FK
        TEXT name
        TEXT category
        DECIMAL price
        INT stock
        TEXT prep_time
        TEXT status
    }

    ORDERS {
        UUID id PK
        TEXT order_code UK
        UUID customer_id FK
        UUID vendor_id FK
        UUID batch_id FK
        UUID assigned_agent_id FK
        DECIMAL total
        order_status order_status
        delivery_status delivery_status
        aggregation_status aggregation_status
        TEXT pickup_location
        TEXT delivery_location
        DATE delivery_date
        TEXT delivery_time_slot
    }

    ORDER_ITEMS {
        UUID id PK
        UUID order_id FK
        UUID product_id FK
        INT qty
        DECIMAL price
    }

    DELIVERY_BATCHES {
        UUID id PK
        TEXT batch_code UK
        UUID agent_id FK
        DATE delivery_date
        TEXT delivery_slot
        INT order_count
        FLOAT estimated_distance
        INT estimated_time
        delivery_status status
        aggregation_status aggregation_status
    }

    DELIVERY_BATCH_ORDERS {
        UUID batch_id PK,FK
        UUID order_id PK,FK
    }

    NOTIFICATIONS {
        UUID id PK
        UUID user_id FK
        TEXT message
        TEXT type
        BOOLEAN is_read
    }

    SYSTEM_SETTINGS {
        UUID id PK
        FLOAT max_group_distance
        INT max_orders_per_batch
        INT default_agent_capacity
        INT min_compatibility_score
    }
```

---

## Chapter 4: Multi-Tenant Role & Route Navigation Hierarchy

### 4.1 Route Guarding & Component Tree

```mermaid
graph TD
    Entry(["App.jsx Router"]) --> PR{"ProtectedRoute Guard"}

    PR -->|role: customer| C_Layout["Customer Layout & Nav"]
    PR -->|role: vendor| V_Layout["Vendor Layout & Nav"]
    PR -->|role: delivery_partner| D_Layout["Delivery Layout & Nav"]
    PR -->|role: admin| A_Layout["Admin Layout & Nav"]
    PR -->|unauthenticated| Auth_Routes["Public Auth Routes"]

    subgraph CustTree ["Customer Portal Views"]
        C_Layout --> C_Dash["CustomerDashboard.jsx (/customer/dashboard)"]
        C_Layout --> C_Browse["BrowseSellersPage.jsx (/customer/browse)"]
        C_Layout --> C_Cart["CartPage.jsx (/customer/cart)"]
        C_Layout --> C_Check["CheckoutPage.jsx (/customer/checkout)"]
        C_Layout --> C_Track["TrackDeliveryPage.jsx (/customer/track/:id)"]
        C_Layout --> C_Sched["DeliverySchedulePage.jsx (/customer/schedule)"]
        C_Layout --> C_Ord["OrdersPage.jsx (/customer/orders)"]
        C_Layout --> C_Prof["ProfilePage.jsx (/customer/profile)"]
    end

    subgraph VendTree ["Seller Portal Views"]
        V_Layout --> V_Dash["DashboardOverview.jsx (/seller/dashboard)"]
        V_Layout --> V_Prod["ProductsPage.jsx (/seller/products)"]
        V_Layout --> V_Ord["OrdersPage.jsx (/seller/orders)"]
        V_Layout --> V_Inv["InventoryPage.jsx (/seller/inventory)"]
    end

    subgraph DelivTree ["Delivery Partner Portal Views"]
        D_Layout --> D_Dash["DeliveryDashboard.jsx (/delivery/dashboard)"]
        D_Layout --> D_Batches["DeliveriesPage.jsx (/delivery/deliveries)"]
        D_Layout --> D_Route["RoutePage.jsx & ActiveDeliveryPage.jsx (/delivery/route)"]
        D_Layout --> D_Hist["DeliveryHistoryPage.jsx (/delivery/history)"]
    end

    subgraph AdminTree ["Admin Operations Portal Views"]
        A_Layout --> A_Dash["AdminDashboard.jsx (/admin/dashboard)"]
        A_Layout --> A_Agg["OrderAggregationPage.jsx (/admin/order-aggregation)"]
        A_Layout --> A_Track["DeliveryTrackingPage.jsx (/admin/tracking)"]
        A_Layout --> A_Vend["SellersManagementPage.jsx (/admin/sellers)"]
        A_Layout --> A_Cust["CustomersManagementPage.jsx (/admin/customers)"]
        A_Layout --> A_Sett["AdminSettingsPage.jsx (/admin/settings)"]
    end

    subgraph AuthTree ["Authentication Views"]
        Auth_Routes --> L_Cust["LoginPage.jsx (/login)"]
        Auth_Routes --> R_Cust["CustomerRegisterPage.jsx (/register)"]
        Auth_Routes --> R_Vend["VendorRegisterPage.jsx (/seller/register)"]
    end
```

---

## Chapter 5: Order, Batch & Delivery Tri-State Lifecycle

### 5.1 The Tri-State Lifecycle Engine
Every order exists simultaneously across three distinct domain axes:

```mermaid
stateDiagram-v2
    direction TB

    state "Axis 1: Order Physical Prep (order_status)" as OS {
        [*] --> PLACED: Customer Checkout
        PLACED --> CONFIRMED: Seller Acknowledged
        CONFIRMED --> PREPARING: Cooking / Packaging
        PREPARING --> READY_FOR_DELIVERY: Staged at Pickup Bay
        READY_FOR_DELIVERY --> ASSIGNED: Linked to Delivery Partner
        ASSIGNED --> OUT_FOR_DELIVERY: Loaded onto Vehicle
        OUT_FOR_DELIVERY --> DELIVERED: OTP Verified at Door
        PLACED --> CANCELLED: Customer / Seller Aborted
    }

    state "Axis 2: Aggregation Clustering (aggregation_status)" as AS {
        [*] --> WAITING_FOR_AGGREGATION: Order Created
        WAITING_FOR_AGGREGATION --> GROUPED: Algorithm Cluster Match
        GROUPED --> BATCH_CREATED: Admin Confirms Batch
        BATCH_CREATED --> BATCH_ASSIGNED: Courier Bound
        BATCH_ASSIGNED --> COMPLETED: All Drops Finalized
    }

    state "Axis 3: Dispatch & Transport (delivery_status)" as DS {
        [*] --> PENDING_ASSIGNMENT: Awaiting Courier
        PENDING_ASSIGNMENT --> DS_ASSIGNED: Driver Assigned
        DS_ASSIGNED --> PICKUP_IN_PROGRESS: Driving to Vendors
        PICKUP_IN_PROGRESS --> PICKED_UP: Parcels In-Hand
        PICKED_UP --> DS_OUT_FOR_DELIVERY: Driving to Customers
        DS_OUT_FOR_DELIVERY --> ARRIVED: Driver at Customer Gate
        ARRIVED --> DS_DELIVERED: OTP Authenticated
        DS_DELIVERED --> DS_COMPLETED: Batch Closed
    }
```

### 5.2 Tri-State Synchronization Matrix

| Milestone | `order_status` | `aggregation_status` | `delivery_status` | Trigger Event / Actor |
| :--- | :--- | :--- | :--- | :--- |
| **Order Placement** | `PLACED` | `WAITING_FOR_AGGREGATION` | `PENDING_ASSIGNMENT` | Customer clicks "Confirm Order" |
| **Merchant Acceptance**| `PREPARING` | `WAITING_FOR_AGGREGATION` | `PENDING_ASSIGNMENT` | Seller updates order in portal |
| **Staged for Pickup** | `READY_FOR_DELIVERY` | `WAITING_FOR_AGGREGATION` | `PENDING_ASSIGNMENT` | Seller packages items |
| **Clustering Match** | `READY_FOR_DELIVERY` | `GROUPED` | `PENDING_ASSIGNMENT` | Aggregation engine generates candidate |
| **Batch Approved** | `READY_FOR_DELIVERY` | `BATCH_CREATED` | `PENDING_ASSIGNMENT` | Admin clicks "Create Batch" |
| **Courier Bound** | `ASSIGNED` | `ASSIGNED` | `ASSIGNED` | Admin allocates batch to agent |
| **Vendor Pickup Run** | `ASSIGNED` | `ASSIGNED` | `PICKUP_IN_PROGRESS` | Driver starts pickup phase |
| **Parcels Collected** | `ASSIGNED` | `ASSIGNED` | `PICKED_UP` | Driver confirms collection at stores |
| **Transit to Customer**| `OUT_FOR_DELIVERY` | `ASSIGNED` | `OUT_FOR_DELIVERY` | Driver begins milk-run drops |
| **Doorstep Handover** | `DELIVERED` | `COMPLETED` | `DELIVERED` | Driver submits customer 4-digit OTP |

---

## Chapter 6: Smart Order Aggregation Algorithm Engine

### 6.1 Algorithm Decision Flowchart (`findSuitableOrderGroups`)

```mermaid
flowchart TD
    Start([Initiate Aggregation Cycle]) --> Fetch[Query Orders with aggregation_status = WAITING_FOR_AGGREGATION]
    Fetch --> DateGroup[Partition Orders by Target deliveryDate]
    
    DateGroup --> OuterLoop[Select Primary Unassigned Order (Seed)]
    OuterLoop --> InnerLoop[Evaluate Candidate Order Against Seed]
    
    InnerLoop --> CheckTime{areTimeSlotsCompatible?<br/>Exact slot or overlapping window?}
    CheckTime -- No --> RejectCandidate[Skip Candidate]
    CheckTime -- Yes --> CheckGeo{Are Pickup/Delivery Areas Nearby?<br/>extractArea within radius?}
    
    CheckGeo -- No --> RejectCandidate
    CheckGeo -- Yes --> AddCandidate[Add to Group Candidate Buffer]
    
    AddCandidate --> CapacityCheck{Group Size == maxOrdersPerBatch (4)?}
    CapacityCheck -- No --> MoreCandidates{More candidate orders in date?}
    MoreCandidates -- Yes --> InnerLoop
    MoreCandidates -- No --> ComputeScore
    CapacityCheck -- Yes --> ComputeScore[Calculate Group Compatibility Score]

    subgraph ScoringWeights ["Weighted Scoring Calculation (Min: 60, Max: 98)"]
        ComputeScore --> S_Base["Base Score: 50"]
        S_Base --> S_Date["+15: Same Delivery Date"]
        S_Date --> S_Time["+20: Exact Slot Match / +12: Overlapping Slot"]
        S_Time --> S_Pickup["+10: Same Merchant Hub / +5: Nearby"]
        S_Pickup --> S_Drop["+10: Same Neighborhood / +5: Nearby"]
        S_Drop --> S_Ready["+10: All Orders READY_FOR_DELIVERY"]
        S_Ready --> S_Agent["+5: Available Driver Capacity"]
    end

    S_Agent --> FormBatchObj[Generate Candidate Object with Metrics:<br/>- batchId: SUG-Bxxx<br/>- estimatedDistance: 2.5 + count * 1.2 km<br/>- estimatedTime: 15 + distance * 6 mins]
    FormBatchObj --> RenderAdmin[Render Suggested Batch Cards in OrderAggregationPage.jsx]
```

---

## Chapter 7: End-to-End Operational Sequence Diagrams

### 7.1 Multi-Vendor Checkout & Order Scheduling

```mermaid
sequenceDiagram
    autonumber
    actor Cust as Customer
    participant React as React App (CheckoutPage.jsx)
    participant Ctx as AppContext.jsx
    participant API as Express API (/api/v1/orders)
    participant DB as Supabase PostgreSQL

    Cust->>React: Select items from Bakery & Florist
    Cust->>React: Choose Time Slot: '9:00 AM – 1:00 PM'
    Cust->>React: Click 'Place Order'
    React->>Ctx: placeOrder({ items, slot, address })
    Ctx->>API: POST /api/v1/orders (Payload with legacy customer/vendor IDs)
    API->>API: mappings.js: Resolve UUIDs for customer and vendors
    API->>DB: INSERT INTO orders (order_status: 'PLACED', aggregation_status: 'WAITING_FOR_AGGREGATION')
    API->>DB: INSERT INTO order_items (product_id, qty, price)
    DB-->>API: 201 Created (orders created with UUIDs)
    API-->>Ctx: Return mapped legacy orders [ORD-1021, ORD-1022]
    Ctx-->>React: Update state & clear cart
    React-->>Cust: Display Order Confirmation & Tracking ID
```

### 7.2 Aggregation Engine & Driver Batch Assignment

```mermaid
sequenceDiagram
    autonumber
    actor Admin as Dispatch Admin
    participant AggUI as OrderAggregationPage.jsx
    participant Util as aggregationUtils.js
    participant API as Express API (/api/v1/delivery)
    participant DB as Supabase PostgreSQL
    actor Driver as Delivery Partner

    Admin->>AggUI: Opens Aggregation Dashboard
    AggUI->>API: GET /api/v1/orders (unbatched orders)
    API-->>AggUI: Returns active orders
    AggUI->>Util: findSuitableOrderGroups(orders, agents, config)
    Util-->>AggUI: Returns Suggested Batch SUG-B001 (Score: 92%, Orders: [ORD-1021, ORD-1022])
    Admin->>AggUI: Clicks 'Create Batch & Assign'
    AggUI->>API: POST /api/v1/delivery/batches (orderIds: [ORD-1021, ORD-1022], agentId: 'da1')
    API->>DB: INSERT INTO delivery_batches (batch_code: 'BAT-xxx', agent_id: 'da1_uuid')
    API->>DB: INSERT INTO delivery_batch_orders (batch_id, order_id)
    API->>DB: UPDATE orders SET aggregation_status = 'BATCH_CREATED', assigned_agent_id = 'da1_uuid'
    API->>DB: UPDATE delivery_agents SET current_orders = current_orders + 2
    DB-->>API: Batch & Assignments Saved
    API-->>AggUI: 200 OK (Batch Dispatched)
    API->>Driver: Push Notification: "New 2-Stop Batch Assigned"
```

### 7.3 Milk-Run Delivery Execution & OTP Handover

```mermaid
sequenceDiagram
    autonumber
    actor Driver as Delivery Partner
    participant DriverUI as RoutePage.jsx / ActiveDeliveryPage.jsx
    actor Vend as Local Vendor
    actor Cust as Customer
    participant API as Express API (/api/v1/delivery)
    participant DB as Supabase PostgreSQL

    Driver->>DriverUI: Accepts Batch BAT-501
    DriverUI->>API: PATCH /api/v1/delivery/batches/BAT-501/status (PICKUP_IN_PROGRESS)
    
    Note over Driver,Vend: Phase 1: Sequential Vendor Pickups
    Driver->>Vend: Arrives at Store 1 (Bakery)
    Driver->>DriverUI: Scans / Confirms Pickup ORD-1021
    Driver->>Vend: Arrives at Store 2 (Florist)
    Driver->>DriverUI: Scans / Confirms Pickup ORD-1022
    DriverUI->>API: PATCH /api/v1/delivery/batches/BAT-501/status (OUT_FOR_DELIVERY)
    API->>DB: UPDATE orders SET delivery_status = 'OUT_FOR_DELIVERY'

    Note over Driver,Cust: Phase 2: Milk-Run Customer Drop-Offs
    Driver->>Cust: Arrives at Customer 1 Doorstep
    Driver->>DriverUI: Clicks 'Complete Delivery' -> Opens OTP Modal
    Cust->>Driver: Verbalizes 4-digit code: '1234'
    Driver->>DriverUI: Enters OTP '1234'
    DriverUI->>API: POST /api/v1/delivery/verify-otp ({ orderId: 'ORD-1021', otp: '1234' })
    API->>DB: UPDATE orders SET delivery_status = 'DELIVERED', order_status = 'DELIVERED'
    API-->>DriverUI: Verification Success (ORD-1021 Cleared)
    DriverUI-->>Cust: Notification: Order Delivered!
    Driver->>DriverUI: Proceeds to Customer 2 Drop-off...
```

---

## Chapter 8: Data Mapping & Legacy ID Compatibility Layer

### 8.1 The Compatibility Translation Flow (`mappings.js`)
To maintain zero regressions with the React frontend's legacy identifier formats while using strict PostgreSQL UUIDs, the backend incorporates a translation layer:

```mermaid
flowchart LR
    subgraph FrontendModel ["Frontend SPA Domain (CamelCase & Legacy IDs)"]
        F_Ord["Order Model<br/>- id: 'ORD-1021'<br/>- customerId: 'c1'<br/>- vendorId: 'v1'<br/>- vendorName: 'Bakery Delight'<br/>- deliveryTimeSlot: '9:00 AM – 1:00 PM'<br/>- total: 42.50"]
        F_Batch["Batch Model<br/>- id: 'b1'<br/>- batchId: 'BAT-101'<br/>- agentId: 'da1'<br/>- orderIds: ['ORD-1021', 'ORD-1022']"]
    end

    subgraph TranslationLayer ["Mapping Adapter (backend/src/utils/mappings.js)"]
        direction TB
        M_In["mapFrontendOrderToDb()<br/>- Maps 'c1' → c1_UUID<br/>- Maps 'v1' → v1_UUID<br/>- camelCase → snake_case"]
        M_Out["mapDbOrderToFrontend()<br/>- Injects 'ORD-XXXX'<br/>- Extracts customerName from join<br/>- snake_case → camelCase"]
    end

    subgraph DatabaseModel ["Supabase PostgreSQL Schema (snake_case & UUIDs)"]
        DB_Ord["orders table<br/>- id: 8f9b2c3d-.... (UUID PK)<br/>- order_code: 'ORD-1021' (TEXT)<br/>- customer_id: UUID FK<br/>- vendor_id: UUID FK<br/>- delivery_time_slot: TEXT<br/>- total: DECIMAL"]
        DB_Batch["delivery_batches table<br/>- id: UUID PK<br/>- batch_code: 'BAT-101'<br/>- agent_id: UUID FK"]
    end

    F_Ord -->|API Request| M_In
    M_In -->|SQL Insert| DB_Ord
    DB_Ord -->|SQL Result| M_Out
    M_Out -->|API Response| F_Ord

    F_Batch -->|Batch Request| M_In
    M_In -->|SQL Insert| DB_Batch
    DB_Batch -->|SQL Result| M_Out
    M_Out -->|API Response| F_Batch
```

---

## Chapter 9: System Edge Cases & Exception Handling Workflows

### 9.1 Exception 1: Customer Order Cancellation During Staging

```mermaid
sequenceDiagram
    actor Cust as Customer
    participant UI as TrackDeliveryPage.jsx
    participant API as Express API
    participant DB as Supabase PostgreSQL

    Cust->>UI: Clicks 'Cancel Order'
    UI->>API: PATCH /api/v1/orders/:id/cancel
    API->>DB: Check current order_status & batch_id
    alt Order is already OUT_FOR_DELIVERY or IN_BATCH
        API-->>UI: 400 Bad Request: "Cannot cancel order in active delivery route"
        UI-->>Cust: Error Toast: Order already dispatched
    else Order is PLACED or WAITING_FOR_AGGREGATION
        API->>DB: UPDATE orders SET order_status = 'CANCELLED'
        API->>DB: Restock product inventory
        API-->>UI: 200 OK: Order Cancelled Successfully
        UI-->>Cust: Status updated to 'Cancelled'
    end
```

### 9.2 Exception 2: OTP Verification Failure at Handover

```mermaid
sequenceDiagram
    actor Driver as Delivery Partner
    participant Modal as DeliveryConfirmationModal.jsx
    participant API as Express API
    actor Cust as Customer

    Driver->>Modal: Submits OTP entered from customer ('9999')
    Modal->>API: POST /api/v1/delivery/verify-otp ({ orderId, otp: '9999' })
    API->>API: Validate against expected OTP ('1234')
    alt OTP Mismatch
        API-->>Modal: 401 Unauthorized: "Invalid verification code"
        Modal-->>Driver: Visual Shake & Error Alert: "Invalid OTP. 2 Attempts remaining."
        Driver->>Cust: "Please re-check the 4-digit code in your Track Order screen."
    else OTP Match
        API->>API: Mark order DELIVERED
        API-->>Modal: 200 OK: "Delivery confirmed"
        Modal-->>Driver: Success animation & advance to next waypoint
    end
```

### 9.3 Exception 3: Delivery Partner Offline / Capacity Exhaustion

```mermaid
flowchart TD
    AdminAssign([Admin Selects Agent for Batch]) --> CheckAgent{Is Agent Status == 'Available'?}
    CheckAgent -- No --> RejectOffline[Error: Agent is Offline or on Break]
    CheckAgent -- Yes --> CheckCap{Current Orders + Batch Orders <= Agent Capacity?}
    CheckCap -- No --> RejectCap[Error: Agent Capacity Exceeded Max 5 orders]
    CheckCap -- Yes --> ApproveAssign[Assign Agent to Batch & Increment current_orders]
```

---

## Summary Reference Table

| Chapter | Primary Mermaid Type | Primary File References |
| :--- | :--- | :--- |
| **Ch 1: Concept & Paradigm** | `flowchart TB` | [`README.md`](file:///c:/Users/N.AJAYKUMAR/ABI'S%20PROJECT/Micro-Logistics/README.md), [`aggregationUtils.js`](file:///c:/Users/N.AJAYKUMAR/ABI'S%20PROJECT/Micro-Logistics/src/utils/aggregationUtils.js) |
| **Ch 2: System Architecture** | `graph TB` | [`App.jsx`](file:///c:/Users/N.AJAYKUMAR/ABI'S%20PROJECT/Micro-Logistics/src/App.jsx), [`backend/src/app.js`](file:///c:/Users/N.AJAYKUMAR/ABI'S%20PROJECT/Micro-Logistics/backend/src/app.js), [`api/index.js`](file:///c:/Users/N.AJAYKUMAR/ABI'S%20PROJECT/Micro-Logistics/api/index.js) |
| **Ch 3: Database ERD** | `erDiagram` | [`0001_initial_schema.sql`](file:///c:/Users/N.AJAYKUMAR/ABI'S%20PROJECT/Micro-Logistics/backend/supabase/migrations/0001_initial_schema.sql) |
| **Ch 4: Role & Route Tree** | `graph TD` | [`App.jsx:42`](file:///c:/Users/N.AJAYKUMAR/ABI'S%20PROJECT/Micro-Logistics/src/App.jsx#L42), [`portals/`](file:///c:/Users/N.AJAYKUMAR/ABI'S%20PROJECT/Micro-Logistics/src/portals) |
| **Ch 5: Tri-State Lifecycle** | `stateDiagram-v2` | [`aggregationUtils.js:12-37`](file:///c:/Users/N.AJAYKUMAR/ABI'S%20PROJECT/Micro-Logistics/src/utils/aggregationUtils.js#L12-L37) |
| **Ch 6: Aggregation Engine** | `flowchart TD` | [`aggregationUtils.js:75-214`](file:///c:/Users/N.AJAYKUMAR/ABI'S%20PROJECT/Micro-Logistics/src/utils/aggregationUtils.js#L75-L214) |
| **Ch 7: Operational Sequences** | `sequenceDiagram` | [`CheckoutPage.jsx`](file:///c:/Users/N.AJAYKUMAR/ABI'S%20PROJECT/Micro-Logistics/src/portals/customer/CheckoutPage.jsx), [`OrderAggregationPage.jsx`](file:///c:/Users/N.AJAYKUMAR/ABI'S%20PROJECT/Micro-Logistics/src/portals/admin/OrderAggregationPage.jsx) |
| **Ch 8: Data Mapping Layer** | `flowchart LR` | [`mappings.js`](file:///c:/Users/N.AJAYKUMAR/ABI'S%20PROJECT/Micro-Logistics/backend/src/utils/mappings.js) |
| **Ch 9: Exception Workflows** | `sequenceDiagram`, `flowchart TD` | [`DeliveryConfirmationModal.jsx`](file:///c:/Users/N.AJAYKUMAR/ABI'S%20PROJECT/Micro-Logistics/src/portals/delivery/DeliveryConfirmationModal.jsx) |
