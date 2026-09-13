-- Create custom types for roles and statuses
CREATE TYPE user_role AS ENUM ('customer', 'vendor', 'admin', 'delivery_partner');
CREATE TYPE order_status AS ENUM ('PLACED', 'CONFIRMED', 'PREPARING', 'READY_FOR_DELIVERY', 'ASSIGNED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED');
CREATE TYPE aggregation_status AS ENUM ('WAITING_FOR_AGGREGATION', 'GROUPED', 'BATCH_CREATED', 'ASSIGNED', 'COMPLETED');
CREATE TYPE delivery_status AS ENUM ('PENDING_ASSIGNMENT', 'ASSIGNED', 'PICKUP_IN_PROGRESS', 'PICKED_UP', 'OUT_FOR_DELIVERY', 'ARRIVED', 'DELIVERED', 'COMPLETED');

-- 1. Profiles (extends auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  role user_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Customer Profiles
CREATE TABLE customer_profiles (
  id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  legacy_id TEXT UNIQUE,
  address TEXT NOT NULL,
  area TEXT,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  avatar TEXT,
  status TEXT DEFAULT 'Active',
  total_orders INTEGER DEFAULT 0,
  active_orders INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Vendors
CREATE TABLE vendors (
  id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  legacy_id TEXT UNIQUE,
  shop_name TEXT NOT NULL,
  owner_name TEXT NOT NULL,
  category TEXT NOT NULL,
  rating DOUBLE PRECISION DEFAULT 0.0,
  prep_time TEXT,
  is_open BOOLEAN DEFAULT TRUE,
  status TEXT DEFAULT 'Active',
  operating_hours TEXT,
  address TEXT NOT NULL,
  area TEXT,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  logo TEXT,
  description TEXT,
  join_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Delivery Agents
CREATE TABLE delivery_agents (
  id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  legacy_id TEXT UNIQUE,
  current_area TEXT,
  capacity INTEGER DEFAULT 5,
  current_orders INTEGER DEFAULT 0,
  availability TEXT DEFAULT 'Available',
  status TEXT DEFAULT 'Available',
  vehicle TEXT,
  rating DOUBLE PRECISION DEFAULT 0.0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Products
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  legacy_id TEXT UNIQUE,
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  stock INTEGER NOT NULL DEFAULT 0,
  prep_time TEXT,
  status TEXT DEFAULT 'In Stock',
  image TEXT,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. Delivery Batches
CREATE TABLE delivery_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_code TEXT UNIQUE NOT NULL,
  agent_id UUID REFERENCES delivery_agents(id) ON DELETE SET NULL,
  delivery_date DATE NOT NULL,
  delivery_slot TEXT,
  order_count INTEGER DEFAULT 0,
  estimated_distance DOUBLE PRECISION,
  estimated_time INTEGER,
  status delivery_status DEFAULT 'PENDING_ASSIGNMENT',
  aggregation_status aggregation_status DEFAULT 'BATCH_CREATED',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Orders
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_code TEXT UNIQUE NOT NULL,
  customer_id UUID NOT NULL REFERENCES customer_profiles(id) ON DELETE RESTRICT,
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE RESTRICT,
  batch_id UUID REFERENCES delivery_batches(id) ON DELETE SET NULL,
  assigned_agent_id UUID REFERENCES delivery_agents(id) ON DELETE SET NULL,
  total DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  order_status order_status DEFAULT 'PLACED',
  delivery_status delivery_status DEFAULT 'PENDING_ASSIGNMENT',
  aggregation_status aggregation_status DEFAULT 'WAITING_FOR_AGGREGATION',
  pickup_location TEXT NOT NULL,
  delivery_location TEXT NOT NULL,
  delivery_date DATE NOT NULL,
  delivery_time_slot TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. Order Items
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  qty INTEGER NOT NULL DEFAULT 1,
  price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. Delivery Batch Orders
CREATE TABLE delivery_batch_orders (
  batch_id UUID NOT NULL REFERENCES delivery_batches(id) ON DELETE CASCADE,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  PRIMARY KEY (batch_id, order_id)
);

-- 10. Notifications
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  type TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. Delivery Slots
CREATE TABLE delivery_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slot_time TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 12. System Settings
CREATE TABLE system_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  max_group_distance DOUBLE PRECISION DEFAULT 8.0,
  max_orders_per_batch INTEGER DEFAULT 4,
  default_agent_capacity INTEGER DEFAULT 5,
  min_compatibility_score INTEGER DEFAULT 70,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_orders_customer_id ON orders(customer_id);
CREATE INDEX idx_orders_vendor_id ON orders(vendor_id);
CREATE INDEX idx_orders_batch_id ON orders(batch_id);
CREATE INDEX idx_products_vendor_id ON products(vendor_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
