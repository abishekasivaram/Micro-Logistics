# Smart Micro-Logistics Management Network - Backend

This is the Node.js + Express backend for the Smart Micro-Logistics Management Network. It is designed to work with Supabase PostgreSQL and Supabase Auth.

## Prerequisites

- Node.js 20+
- Supabase Project (PostgreSQL)

## Installation

```bash
cd backend
npm install
```

## Environment Configuration

Copy `.env.example` to `.env` and fill in your Supabase credentials:

```bash
cp .env.example .env
```

Your `.env` should look like:
```env
SUPABASE_URL=https://<your-project>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
PORT=5000
FRONTEND_URL=http://localhost:5173
```

> [!CAUTION]
> **Security Warning**: The `SUPABASE_SERVICE_ROLE_KEY` bypasses all Row Level Security (RLS) in Supabase. It must **ONLY** be used on this backend server. NEVER expose this key to the React frontend, and never commit your `.env` file to source control.

To get your credentials:
1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project.
3. Go to **Project Settings -> API**.
4. Copy the **Project URL** and the **`service_role` secret**.

## Database Migration & Seeding

Since the Supabase project already exists, you need to execute the SQL migrations to create the required tables, and then insert the demo data.

You can run these scripts from the Supabase SQL Editor in your dashboard:

1. **Initial Schema**: Open `backend/supabase/migrations/0001_initial_schema.sql`, copy the contents, and run it in the Supabase SQL Editor.
2. **Seed Data**: Open `backend/supabase/seed.sql`, copy the contents, and run it in the Supabase SQL Editor.

*(Note: The seed script inserts dummy users into `auth.users` for testing purposes. This is strictly for DEMO / DEVELOPMENT only.)*

## Available Scripts

- **`npm run dev`**: Starts the development server with hot-reload (using `tsx`).
- **`npm run build`**: Compiles TypeScript to JavaScript into the `dist/` folder.
- **`npm start`**: Runs the compiled production code.
- **`npm test`**: Runs the Vitest test suite.

## Endpoints Implemented in Phase 1

- `GET /api/v1/health` - Basic API ping.
- `GET /api/v1/health/db` - Verifies actual database connection to Supabase.

## Future Phases

The current phase establishes the foundation. Future phases will introduce:
- Full RESTful APIs for Products, Orders, and Delivery Batches.
- Integration of the React `AppContext` with this real backend.
- Implementation of RBAC checks across feature endpoints.
- Integration with external services: Maps (Leaflet/OSRM), SMS, WebSockets, Redis, and payment gateways.
