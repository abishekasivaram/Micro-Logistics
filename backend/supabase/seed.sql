-- DEMO / DEVELOPMENT ONLY
-- Seed data migrated from src/data/sampleData.js
-- We use deterministic UUIDs to preserve relationships between records.

-- 0. Insert into auth.users to satisfy foreign keys
INSERT INTO auth.users (id, aud, role, email, encrypted_password, raw_user_meta_data)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'authenticated', 'authenticated', 'priya@example.com', '$2b$10$ruXylSGuLLx89FBlXzfG5uVp2s0SlQlz61rKubt7Zn/G045Welqr.', '{"role":"customer"}'),
  ('22222222-2222-2222-2222-222222222222', 'authenticated', 'authenticated', 'contact@nammachennai.com', '$2b$10$ruXylSGuLLx89FBlXzfG5uVp2s0SlQlz61rKubt7Zn/G045Welqr.', '{"role":"vendor"}'),
  ('33333333-3333-3333-3333-333333333333', 'authenticated', 'authenticated', 'agent1@example.com', '$2b$10$ruXylSGuLLx89FBlXzfG5uVp2s0SlQlz61rKubt7Zn/G045Welqr.', '{"role":"delivery_partner"}'),
  ('99999999-9999-9999-9999-999999999999', 'authenticated', 'authenticated', 'admin@example.com', '$2b$10$ruXylSGuLLx89FBlXzfG5uVp2s0SlQlz61rKubt7Zn/G045Welqr.', '{"role":"admin"}')
ON CONFLICT (id) DO UPDATE SET encrypted_password = EXCLUDED.encrypted_password;

-- 1. Profiles
INSERT INTO profiles (id, username, email, phone, role) VALUES
  ('11111111-1111-1111-1111-111111111111', 'priyarajan', 'priya@example.com', '9876543210', 'customer'),
  ('22222222-2222-2222-2222-222222222222', 'nammachennai', 'contact@nammachennai.com', '9840123456', 'vendor'),
  ('33333333-3333-3333-3333-333333333333', 'muthuvel', 'agent1@example.com', '9988776655', 'delivery_partner'),
  ('99999999-9999-9999-9999-999999999999', 'admin', 'admin@example.com', '9000000000', 'admin')
ON CONFLICT (id) DO NOTHING;

-- 2. Customer Profiles
INSERT INTO customer_profiles (id, legacy_id, address, area, lat, lng, total_orders, active_orders) VALUES
  ('11111111-1111-1111-1111-111111111111', 'c1', '101 Anna Nagar East, Chennai', 'Anna Nagar', 13.0850, 80.2101, 12, 1)
ON CONFLICT (id) DO NOTHING;

-- 3. Vendors
INSERT INTO vendors (id, legacy_id, shop_name, owner_name, category, rating, prep_time, is_open, address, area, lat, lng) VALUES
  ('22222222-2222-2222-2222-222222222222', 'v1', 'Namma Chennai Grocers', 'Subramaniam V.', 'Local Grocery Store', 4.8, '15-25 mins', true, '12 T. Nagar Main Rd, Chennai', 'T. Nagar', 13.0418, 80.2341)
ON CONFLICT (id) DO NOTHING;

-- 4. Delivery Agents
INSERT INTO delivery_agents (id, legacy_id, current_area, capacity, current_orders, vehicle, rating) VALUES
  ('33333333-3333-3333-3333-333333333333', 'da1', 'Adyar / Mylapore', 5, 3, 'TVS XL 100', 4.9)
ON CONFLICT (id) DO NOTHING;

-- 5. Products
INSERT INTO products (id, legacy_id, vendor_id, name, category, price, stock, prep_time, status) VALUES
  ('55555555-5555-5555-5555-555555555551', 'p1', '22222222-2222-2222-2222-222222222222', 'Aavin Green Milk 500ml', 'Dairy', 22.0, 150, '5 mins', 'In Stock'),
  ('55555555-5555-5555-5555-555555555552', 'p2', '22222222-2222-2222-2222-222222222222', 'Modern White Bread 400g', 'Bakery', 40.0, 25, '5 mins', 'In Stock')
ON CONFLICT (id) DO NOTHING;

-- 6. Orders
INSERT INTO orders (id, order_code, customer_id, vendor_id, total, order_status, delivery_status, aggregation_status, pickup_location, delivery_location, delivery_date, delivery_time_slot) VALUES
  ('66666666-6666-6666-6666-666666666661', 'ORD-1021', '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 84.00, 'READY_FOR_DELIVERY', 'PENDING_ASSIGNMENT', 'WAITING_FOR_AGGREGATION', '12 T. Nagar Main Rd, Chennai', '101 Anna Nagar East, Chennai', CURRENT_DATE, '9:00 AM – 1:00 PM')
ON CONFLICT (id) DO NOTHING;

-- 7. Order Items
INSERT INTO order_items (order_id, product_id, qty, price) VALUES
  ('66666666-6666-6666-6666-666666666661', '55555555-5555-5555-5555-555555555551', 2, 22.00),
  ('66666666-6666-6666-6666-666666666661', '55555555-5555-5555-5555-555555555552', 1, 40.00);

-- 8. Delivery Slots
INSERT INTO delivery_slots (slot_time) VALUES
  ('7:00 AM – 11:00 AM'),
  ('9:00 AM – 1:00 PM'),
  ('12:00 PM – 4:00 PM'),
  ('3:00 PM – 7:00 PM'),
  ('6:00 PM – 10:00 PM')
ON CONFLICT (slot_time) DO NOTHING;

-- 9. System Settings
INSERT INTO system_settings (max_group_distance, max_orders_per_batch, default_agent_capacity, min_compatibility_score)
VALUES (8.0, 4, 5, 70);
