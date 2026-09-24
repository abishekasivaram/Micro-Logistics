-- Migration 0002: Extended Schema for Micro-Logistics Management System
-- Adds OTP verifications, telemetry tracking, wishlist, status audit logs, waypoints, payments, cart, reviews, and admin audit logging.

-- 1. Delivery Verifications (Dynamic OTPs replacing static '1234')
CREATE TABLE IF NOT EXISTS delivery_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  otp_code VARCHAR(6) NOT NULL,
  attempts INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 3,
  is_verified BOOLEAN DEFAULT FALSE,
  verified_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '24 hours'),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT uq_order_verification UNIQUE (order_id)
);

-- 2. Delivery Agent Telemetry (Live Driver GPS Tracking)
CREATE TABLE IF NOT EXISTS agent_telemetry (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES delivery_agents(id) ON DELETE CASCADE,
  batch_id UUID REFERENCES delivery_batches(id) ON DELETE SET NULL,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  speed DOUBLE PRECISION DEFAULT 0.0,
  heading DOUBLE PRECISION DEFAULT 0.0,
  recorded_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Customer Wishlist Items
CREATE TABLE IF NOT EXISTS wishlist_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customer_profiles(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT uq_customer_wishlist UNIQUE (customer_id, product_id)
);

-- 4. Order Status Audit Logs
CREATE TABLE IF NOT EXISTS order_status_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  previous_status TEXT,
  new_status TEXT NOT NULL,
  changed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Batch Waypoints (Sequential Multi-Stop Routing & Milk-Run Stops)
CREATE TABLE IF NOT EXISTS batch_waypoints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id UUID NOT NULL REFERENCES delivery_batches(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  stop_number INTEGER NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('PICKUP', 'DROPOFF', 'HUB')),
  location_address TEXT NOT NULL,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'ARRIVED', 'COMPLETED', 'SKIPPED')),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Payment Transactions
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES customer_profiles(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'INR',
  payment_method TEXT NOT NULL CHECK (payment_method IN ('UPI', 'CARD', 'COD', 'WALLET', 'NETBANKING')),
  gateway_reference TEXT,
  status TEXT DEFAULT 'COMPLETED' CHECK (status IN ('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Persistent Cart Items (Cross-Device Cart Synchronization)
CREATE TABLE IF NOT EXISTS cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customer_profiles(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT uq_customer_cart_item UNIQUE (customer_id, product_id)
);

-- 8. Customer Reviews & Ratings
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  customer_id UUID NOT NULL REFERENCES customer_profiles(id) ON DELETE CASCADE,
  vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE,
  agent_id UUID REFERENCES delivery_agents(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. System Audit Logs (Admin Security & Governance Trail)
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity TEXT NOT NULL,
  entity_id TEXT,
  details JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create performance indexes for high-frequency queries
CREATE INDEX IF NOT EXISTS idx_delivery_verifications_order_id ON delivery_verifications(order_id);
CREATE INDEX IF NOT EXISTS idx_agent_telemetry_agent_id ON agent_telemetry(agent_id, recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_batch_waypoints_batch_id ON batch_waypoints(batch_id, stop_number ASC);
CREATE INDEX IF NOT EXISTS idx_order_status_logs_order_id ON order_status_logs(order_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_customer_id ON cart_items(customer_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_customer_id ON wishlist_items(customer_id);
CREATE INDEX IF NOT EXISTS idx_transactions_order_id ON transactions(order_id);
CREATE INDEX IF NOT EXISTS idx_reviews_vendor_id ON reviews(vendor_id);
CREATE INDEX IF NOT EXISTS idx_reviews_agent_id ON reviews(agent_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);
