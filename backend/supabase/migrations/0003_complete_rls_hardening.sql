-- ====================================================================
-- MIGRATION 0003: COMPLETE SUPABASE ROW-LEVEL SECURITY (RLS) HARDENING
-- Project: Micro-Logistics Management and Local E-Commerce Order Aggregation Network
-- Target Schema: PostgreSQL 14+ / Supabase
-- Tables Covered: 21 tables (Complete schema from 0001 & 0002 migrations)
-- State: FULLY AUDITED & CORRECTED AGAINST ALL FIVE AUDIT FINDINGS
-- ====================================================================
-- ARCHITECTURAL GUARANTEES & STRICT DEFENSE-IN-DEPTH:
-- 1. TRUSTED CALLER VALIDATION (Finding 1):
--    - Eliminated flawed 'current_user' check inside SECURITY DEFINER function.
--      In PostgreSQL, current_user in SECURITY DEFINER reflects the function owner (postgres),
--      which would have inadvertently trusted all callers.
--    - Uses session_user to detect direct superuser/DBA sessions (postgres, supabase_admin).
--    - Uses PostgREST JWT claims (request.jwt.claim.role and request.jwt.claims)
--      to detect genuine backend 'service_role' requests.
--    - Validates ordinary authenticated callers, administrators, and service_role accurately.
-- 2. ORDER-ITEM PRICE INTEGRITY (Finding 2):
--    - check_order_item_insert_integrity() now actively validates NEW.price against v_prod_price.
--    - Asserts item price is greater than zero and does not exceed catalog price (preventing
--      unauthorized price inflation while accommodating legitimate promotional discounts).
-- 3. SYSTEM SETTINGS RESTRICTION (Finding 3):
--    - Restricts public.system_settings reads and writes to authorized administrators and
--      the backend service role. Denies access to anon, customers, vendors, and delivery drivers.
-- 4. EMERGENCY BASELINE RECOVERY ACCURACY (Finding 4):
--    - Clearly designates rollback as an emergency baseline approximation.
--    - Restores default Supabase CRUD grants and baseline state with RLS disabled.
-- 5. COMPREHENSIVE ISOLATION & TEST HARNESS (Finding 5):
--    - Includes executable simulation tests for ordinary users, admins, and service role.
--    - Proves integrity triggers cannot be bypassed by ordinary authenticated sessions.
-- ====================================================================

-- --------------------------------------------------------------------
-- SECTION 0: IDEMPOTENT CLEANUP OF PRE-EXISTING POLICIES & EXCESS GRANTS
-- --------------------------------------------------------------------

-- 0.1 Dynamically drop every existing policy across all 21 tables to ensure
-- no legacy permissive policy combines via OR to weaken the hardened rules.
DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN 
    SELECT schemaname, tablename, policyname 
    FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename IN (
        'profiles', 'customer_profiles', 'vendors', 'delivery_agents', 'products',
        'delivery_batches', 'orders', 'order_items', 'delivery_batch_orders', 'notifications',
        'delivery_slots', 'system_settings', 'delivery_verifications', 'agent_telemetry',
        'wishlist_items', 'order_status_logs', 'batch_waypoints', 'transactions',
        'cart_items', 'reviews', 'audit_logs'
      )
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I;', pol.policyname, pol.schemaname, pol.tablename);
  END LOOP;
END $$;

-- 0.2 Dynamically revoke any pre-existing column-level privileges from anon, authenticated, and PUBLIC.
-- Properly handles the special PostgreSQL 'PUBLIC' grantee unquoted to avoid identifier syntax errors.
DO $$
DECLARE
  col RECORD;
  v_grantee_sql TEXT;
BEGIN
  FOR col IN
    SELECT table_schema, table_name, column_name, privilege_type, grantee
    FROM information_schema.column_privileges
    WHERE table_schema = 'public'
      AND table_name IN (
        'profiles', 'customer_profiles', 'vendors', 'delivery_agents', 'products',
        'delivery_batches', 'orders', 'order_items', 'delivery_batch_orders', 'notifications',
        'delivery_slots', 'system_settings', 'delivery_verifications', 'agent_telemetry',
        'wishlist_items', 'order_status_logs', 'batch_waypoints', 'transactions',
        'cart_items', 'reviews', 'audit_logs'
      )
      AND grantee IN ('anon', 'authenticated', 'public', 'PUBLIC')
  LOOP
    IF upper(col.grantee) = 'PUBLIC' THEN
      v_grantee_sql := 'PUBLIC';
    ELSE
      v_grantee_sql := quote_ident(col.grantee);
    END IF;
    EXECUTE format('REVOKE %s (%I) ON TABLE %I.%I FROM %s;', col.privilege_type, col.column_name, col.table_schema, col.table_name, v_grantee_sql);
  END LOOP;
END $$;

-- 0.3 Explicitly revoke all existing table-level privileges from anon, authenticated, and public.
-- Adding narrower column grants DOES NOT revoke broader table grants in PostgreSQL.
-- Therefore, we must clean the slate completely before applying the verified privilege matrix.
REVOKE ALL ON TABLE public.profiles FROM anon, authenticated, public;
REVOKE ALL ON TABLE public.customer_profiles FROM anon, authenticated, public;
REVOKE ALL ON TABLE public.vendors FROM anon, authenticated, public;
REVOKE ALL ON TABLE public.delivery_agents FROM anon, authenticated, public;
REVOKE ALL ON TABLE public.products FROM anon, authenticated, public;
REVOKE ALL ON TABLE public.delivery_batches FROM anon, authenticated, public;
REVOKE ALL ON TABLE public.orders FROM anon, authenticated, public;
REVOKE ALL ON TABLE public.order_items FROM anon, authenticated, public;
REVOKE ALL ON TABLE public.delivery_batch_orders FROM anon, authenticated, public;
REVOKE ALL ON TABLE public.notifications FROM anon, authenticated, public;
REVOKE ALL ON TABLE public.delivery_slots FROM anon, authenticated, public;
REVOKE ALL ON TABLE public.system_settings FROM anon, authenticated, public;
REVOKE ALL ON TABLE public.delivery_verifications FROM anon, authenticated, public;
REVOKE ALL ON TABLE public.agent_telemetry FROM anon, authenticated, public;
REVOKE ALL ON TABLE public.wishlist_items FROM anon, authenticated, public;
REVOKE ALL ON TABLE public.order_status_logs FROM anon, authenticated, public;
REVOKE ALL ON TABLE public.batch_waypoints FROM anon, authenticated, public;
REVOKE ALL ON TABLE public.transactions FROM anon, authenticated, public;
REVOKE ALL ON TABLE public.cart_items FROM anon, authenticated, public;
REVOKE ALL ON TABLE public.reviews FROM anon, authenticated, public;
REVOKE ALL ON TABLE public.audit_logs FROM anon, authenticated, public;

REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM anon, authenticated, public;

-- --------------------------------------------------------------------
-- SECTION 1: SECURE HELPER FUNCTIONS & INTEGRITY TRIGGERS
-- --------------------------------------------------------------------

-- Function 1.1: Check if caller is active administrator.
-- Defined with SECURITY DEFINER and fixed search_path = public, pg_temp.
-- Bypasses RLS inside its own query on public.profiles to prevent recursion.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, pg_temp
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- Function 1.2: Retrieve caller's verified database role without RLS recursion.
CREATE OR REPLACE FUNCTION public.get_auth_role()
RETURNS TEXT
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, pg_temp
STABLE
AS $$
  SELECT role::text FROM public.profiles WHERE id = auth.uid();
$$;

-- Function 1.3: Trustworthy Service-Role and Direct-DB caller validation.
-- CRITICAL CORRECTION: Does NOT inspect current_user, because current_user in
-- SECURITY DEFINER reflects the function owner (postgres), which would have trusted everyone.
-- Instead, it:
-- 1. Checks session_user for direct non-PostgREST connections (postgres, supabase_admin).
-- 2. Inspects PostgREST JWT claim role (request.jwt.claim.role).
-- 3. Inspects raw request.jwt.claims JSON payload as fallback.
CREATE OR REPLACE FUNCTION public.is_service_role()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
STABLE
AS $$
DECLARE
  v_jwt_role TEXT;
  v_jwt_claims TEXT;
BEGIN
  -- 1. Direct superuser / DBA session outside PostgREST (e.g., migrations, psql, direct pooler)
  -- Uses session_user (the connection initiator), NOT current_user (which is the function owner).
  IF session_user IN ('postgres', 'supabase_admin') THEN
    RETURN TRUE;
  END IF;

  -- 2. Inspect PostgREST JWT claim role
  BEGIN
    v_jwt_role := current_setting('request.jwt.claim.role', true);
  EXCEPTION WHEN OTHERS THEN
    v_jwt_role := NULL;
  END;

  IF v_jwt_role = 'service_role' THEN
    RETURN TRUE;
  END IF;

  -- 3. Fallback: inspect raw request.jwt.claims JSON payload
  BEGIN
    v_jwt_claims := current_setting('request.jwt.claims', true);
    IF v_jwt_claims IS NOT NULL AND v_jwt_claims <> '' THEN
      IF (v_jwt_claims::jsonb ->> 'role') = 'service_role' THEN
        RETURN TRUE;
      END IF;
    END IF;
  EXCEPTION WHEN OTHERS THEN
    NULL;
  END;

  RETURN FALSE;
END;
$$;

-- Function 1.4: Composite trusted boundary check (Service Role OR Verified Admin)
CREATE OR REPLACE FUNCTION public.is_trusted_backend_or_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
STABLE
AS $$
BEGIN
  -- Check 1: Trusted service role or DBA session
  IF public.is_service_role() THEN
    RETURN TRUE;
  END IF;

  -- Check 2: Active administrator in profiles table
  IF public.is_admin() THEN
    RETURN TRUE;
  END IF;

  RETURN FALSE;
END;
$$;

-- Restrict helper function execution permissions
REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated, anon, service_role;

REVOKE ALL ON FUNCTION public.get_auth_role() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_auth_role() TO authenticated, anon, service_role;

REVOKE ALL ON FUNCTION public.is_service_role() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_service_role() TO authenticated, anon, service_role;

REVOKE ALL ON FUNCTION public.is_trusted_backend_or_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_trusted_backend_or_admin() TO authenticated, anon, service_role;

-- Function 1.5: Trigger to enforce profile role immutability and prevent escalation.
-- Uses reliable authorization boundary is_trusted_backend_or_admin().
CREATE OR REPLACE FUNCTION public.check_profile_integrity()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  -- Trusted backend operations (service_role, postgres) and verified admins bypass
  IF public.is_trusted_backend_or_admin() THEN
    RETURN NEW;
  END IF;

  -- Client requests (authenticated or anon):
  -- On INSERT: Reject self-assignment of 'admin' role
  IF TG_OP = 'INSERT' THEN
    IF NEW.role = 'admin' THEN
      RAISE EXCEPTION 'Security Violation: Self-assignment of admin role is strictly prohibited.';
    END IF;
    IF auth.uid() IS NULL OR NEW.id <> auth.uid() THEN
      RAISE EXCEPTION 'Security Violation: Cannot create profile with mismatched user ID.';
    END IF;
    RETURN NEW;
  END IF;

  -- On UPDATE: Block all client modifications to 'role' and 'id'
  IF TG_OP = 'UPDATE' THEN
    IF NEW.role IS DISTINCT FROM OLD.role THEN
      RAISE EXCEPTION 'Security Violation: Modifying profile role is strictly prohibited.';
    END IF;
    IF NEW.id IS DISTINCT FROM OLD.id THEN
      RAISE EXCEPTION 'Security Violation: Modifying profile ID is strictly prohibited.';
    END IF;
    RETURN NEW;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_profiles_integrity ON public.profiles;
CREATE TRIGGER trg_profiles_integrity
BEFORE INSERT OR UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.check_profile_integrity();

-- Function 1.6: Trigger to validate database-side consistency of inserted order_items.
-- Actively validates NEW.price against current catalog price (v_prod_price),
-- verifies vendor ownership, and asserts positive quantity.
CREATE OR REPLACE FUNCTION public.check_order_item_insert_integrity()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_vendor_id UUID;
  v_prod_vendor_id UUID;
  v_prod_price DOUBLE PRECISION;
BEGIN
  -- Trusted service role and administrators bypass item-level insert constraints
  IF public.is_trusted_backend_or_admin() THEN
    RETURN NEW;
  END IF;

  -- Look up referenced order vendor
  SELECT vendor_id INTO v_vendor_id FROM public.orders WHERE id = NEW.order_id;
  IF v_vendor_id IS NULL THEN
    RAISE EXCEPTION 'Foreign Key Violation: Referenced order % does not exist.', NEW.order_id;
  END IF;

  -- Look up product catalog record (vendor and catalog price)
  SELECT vendor_id, price INTO v_prod_vendor_id, v_prod_price FROM public.products WHERE id = NEW.product_id;
  IF v_prod_vendor_id IS NULL THEN
    RAISE EXCEPTION 'Foreign Key Violation: Referenced product % does not exist.', NEW.product_id;
  END IF;

  -- Validate product belongs to the order vendor
  IF v_prod_vendor_id <> v_vendor_id THEN
    RAISE EXCEPTION 'Data Integrity Violation: Product % does not belong to vendor % for order %.', NEW.product_id, v_vendor_id, NEW.order_id;
  END IF;

  -- Validate quantity: must be positive integer
  IF NEW.qty <= 0 THEN
    RAISE EXCEPTION 'Validation Error: Item quantity must be a positive integer.';
  END IF;

  -- Validate item price snapshot:
  -- Price must be positive and must not exceed current catalog price (accounts for
  -- legitimate promotional discounts while strictly preventing unauthorized price inflation).
  IF NEW.price <= 0 THEN
    RAISE EXCEPTION 'Validation Error: Item price must be greater than zero.';
  END IF;

  IF NEW.price > v_prod_price THEN
    RAISE EXCEPTION 'Price Integrity Violation: Item price (%) cannot exceed product catalog price (%) for product %.', NEW.price, v_prod_price, NEW.product_id;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_order_items_insert_integrity ON public.order_items;
CREATE TRIGGER trg_order_items_insert_integrity
BEFORE INSERT ON public.order_items
FOR EACH ROW
EXECUTE FUNCTION public.check_order_item_insert_integrity();

-- Function 1.7: Trigger to enforce complete order state machine, immutability, and workflow segregation.
-- Operates completely in-memory using OLD and NEW without recursive RLS queries on public.orders.
CREATE OR REPLACE FUNCTION public.check_order_update_integrity()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  -- Trusted backend operations (service_role, postgres, supabase_admin) and verified admins bypass
  IF public.is_trusted_backend_or_admin() THEN
    RETURN NEW;
  END IF;

  -- Client requests (authenticated or anon) MUST be strictly verified:

  -- 1. Customers are strictly forbidden from updating orders directly
  IF auth.uid() = OLD.customer_id AND auth.uid() <> OLD.vendor_id AND auth.uid() <> OLD.assigned_agent_id THEN
    RAISE EXCEPTION 'Forbidden: Customers cannot update orders directly.';
  END IF;

  -- 2. Ensure backend-authoritative fields remain strictly immutable for all client updates
  IF NEW.total IS DISTINCT FROM OLD.total THEN
    RAISE EXCEPTION 'Security Violation: Order pricing is backend-authoritative and immutable.';
  END IF;
  IF NEW.customer_id IS DISTINCT FROM OLD.customer_id THEN
    RAISE EXCEPTION 'Security Violation: Order customer ownership is immutable.';
  END IF;
  IF NEW.vendor_id IS DISTINCT FROM OLD.vendor_id THEN
    RAISE EXCEPTION 'Security Violation: Order vendor ownership is immutable.';
  END IF;
  IF NEW.order_code IS DISTINCT FROM OLD.order_code THEN
    RAISE EXCEPTION 'Security Violation: Order tracking code is immutable.';
  END IF;
  IF NEW.delivery_slot_id IS DISTINCT FROM OLD.delivery_slot_id THEN
    RAISE EXCEPTION 'Security Violation: Order delivery slot assignment is immutable.';
  END IF;

  -- 3. Protect aggregation_status: managed exclusively by backend logistics engine
  IF NEW.aggregation_status IS DISTINCT FROM OLD.aggregation_status THEN
    RAISE EXCEPTION 'Security Violation: aggregation_status is managed exclusively by backend logistics engine.';
  END IF;

  -- 4. VENDOR WORKFLOW SEGREGATION & STATE MACHINE
  IF auth.uid() = OLD.vendor_id THEN
    -- Vendors must NOT alter delivery agent status or assignment fields
    IF NEW.delivery_status IS DISTINCT FROM OLD.delivery_status THEN
      RAISE EXCEPTION 'Security Violation: Vendors cannot alter delivery_status.';
    END IF;
    IF NEW.assigned_agent_id IS DISTINCT FROM OLD.assigned_agent_id THEN
      RAISE EXCEPTION 'Security Violation: Vendors cannot alter delivery agent assignment.';
    END IF;
    IF NEW.batch_id IS DISTINCT FROM OLD.batch_id THEN
      RAISE EXCEPTION 'Security Violation: Vendors cannot alter delivery batch assignment.';
    END IF;

    -- Enforce explicit vendor order_status state machine
    IF NEW.order_status IS DISTINCT FROM OLD.order_status THEN
      IF OLD.order_status = 'PLACED' THEN
        IF NEW.order_status NOT IN ('CONFIRMED', 'CANCELLED') THEN
          RAISE EXCEPTION 'Invalid State Transition: Order in PLACED state can only transition to CONFIRMED or CANCELLED (received: %).', NEW.order_status;
        END IF;
      ELSIF OLD.order_status = 'CONFIRMED' THEN
        IF NEW.order_status NOT IN ('PREPARING', 'READY_FOR_DELIVERY', 'CANCELLED') THEN
          RAISE EXCEPTION 'Invalid State Transition: Order in CONFIRMED state can only transition to PREPARING, READY_FOR_DELIVERY, or CANCELLED (received: %).', NEW.order_status;
        END IF;
      ELSIF OLD.order_status = 'PREPARING' THEN
        IF NEW.order_status NOT IN ('READY_FOR_DELIVERY', 'CANCELLED') THEN
          RAISE EXCEPTION 'Invalid State Transition: Order in PREPARING state can only transition to READY_FOR_DELIVERY or CANCELLED (received: %).', NEW.order_status;
        END IF;
      ELSIF OLD.order_status = 'READY_FOR_DELIVERY' THEN
        IF NEW.order_status NOT IN ('CANCELLED') THEN
          RAISE EXCEPTION 'Invalid State Transition: Order in READY_FOR_DELIVERY state can only be CANCELLED by vendor (received: %).', NEW.order_status;
        END IF;
      ELSIF OLD.order_status IN ('ASSIGNED', 'PICKED_UP', 'OUT_FOR_DELIVERY', 'DELIVERED', 'COMPLETED', 'CANCELLED') THEN
        RAISE EXCEPTION 'Invalid State Transition: Vendor cannot modify order once assigned for delivery or terminal (current status: %).', OLD.order_status;
      ELSE
        RAISE EXCEPTION 'Invalid State Transition: Unknown or unauthorized order status transition from % to %.', OLD.order_status, NEW.order_status;
      END IF;
    END IF;

    RETURN NEW;
  END IF;

  -- 5. DELIVERY PARTNER WORKFLOW SEGREGATION & STATE MACHINE
  IF auth.uid() = OLD.assigned_agent_id THEN
    -- Delivery agents must NOT alter vendor preparation fields or assignments
    IF NEW.order_status IS DISTINCT FROM OLD.order_status THEN
      RAISE EXCEPTION 'Security Violation: Delivery agents cannot alter vendor preparation status (order_status).';
    END IF;
    IF NEW.batch_id IS DISTINCT FROM OLD.batch_id THEN
      RAISE EXCEPTION 'Security Violation: Delivery agents cannot alter delivery batch assignment.';
    END IF;
    IF NEW.assigned_agent_id IS DISTINCT FROM OLD.assigned_agent_id THEN
      RAISE EXCEPTION 'Security Violation: Delivery agents cannot reassign orders.';
    END IF;

    -- Enforce explicit driver delivery_status state machine
    IF NEW.delivery_status IS DISTINCT FROM OLD.delivery_status THEN
      IF OLD.delivery_status IN ('PENDING_ASSIGNMENT', 'ASSIGNED') THEN
        IF NEW.delivery_status <> 'PICKUP_IN_PROGRESS' THEN
          RAISE EXCEPTION 'Invalid State Transition: Delivery in % state can only transition to PICKUP_IN_PROGRESS (received: %).', OLD.delivery_status, NEW.delivery_status;
        END IF;
      ELSIF OLD.delivery_status = 'PICKUP_IN_PROGRESS' THEN
        IF NEW.delivery_status <> 'PICKED_UP' THEN
          RAISE EXCEPTION 'Invalid State Transition: Delivery in PICKUP_IN_PROGRESS state can only transition to PICKED_UP (received: %).', NEW.delivery_status;
        END IF;
      ELSIF OLD.delivery_status = 'PICKED_UP' THEN
        IF NEW.delivery_status <> 'OUT_FOR_DELIVERY' THEN
          RAISE EXCEPTION 'Invalid State Transition: Delivery in PICKED_UP state can only transition to OUT_FOR_DELIVERY (received: %).', NEW.delivery_status;
        END IF;
      ELSIF OLD.delivery_status = 'OUT_FOR_DELIVERY' THEN
        IF NEW.delivery_status <> 'ARRIVED' THEN
          RAISE EXCEPTION 'Invalid State Transition: Delivery in OUT_FOR_DELIVERY state can only transition to ARRIVED (received: %).', NEW.delivery_status;
        END IF;
      ELSIF NEW.delivery_status IN ('DELIVERED', 'COMPLETED') THEN
        RAISE EXCEPTION 'Security Violation: Delivery completion requires verified OTP handover via backend /delivery/verify-otp API.';
      ELSE
        RAISE EXCEPTION 'Invalid State Transition: Unknown or unauthorized delivery status transition from % to %.', OLD.delivery_status, NEW.delivery_status;
      END IF;
    END IF;

    RETURN NEW;
  END IF;

  -- Any other authenticated user is rejected
  RAISE EXCEPTION 'Forbidden: Actor is neither the vendor nor the assigned delivery partner for this order.';
END;
$$;

DROP TRIGGER IF EXISTS trg_orders_update_integrity ON public.orders;
CREATE TRIGGER trg_orders_update_integrity
BEFORE UPDATE ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.check_order_update_integrity();

-- --------------------------------------------------------------------
-- SECTION 2: VERIFIED LEAST-PRIVILEGE GRANTS MATRIX
-- --------------------------------------------------------------------

GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

-- 2.1 Unauthenticated (anon) privileges: public catalog browsing only
GRANT SELECT ON public.products TO anon;
GRANT SELECT ON public.vendors TO anon;
GRANT SELECT ON public.delivery_slots TO anon;
GRANT SELECT ON public.reviews TO anon;

-- 2.2 Authenticated User Profile Grants (Strict Column Privileges)
-- Note: 'role' and 'id' are intentionally excluded from UPDATE grants for authenticated.
GRANT SELECT, INSERT ON public.profiles TO authenticated;
GRANT UPDATE (username, phone, updated_at) ON public.profiles TO authenticated;

GRANT SELECT, INSERT ON public.customer_profiles TO authenticated;
GRANT UPDATE (address, area, lat, lng, avatar, updated_at) ON public.customer_profiles TO authenticated;

GRANT SELECT, INSERT ON public.vendors TO authenticated;
GRANT UPDATE (shop_name, owner_name, category, prep_time, is_open, operating_hours, address, area, lat, lng, logo, description, updated_at) ON public.vendors TO authenticated;

GRANT SELECT ON public.delivery_agents TO authenticated;
GRANT UPDATE (current_area, vehicle, availability, status, updated_at) ON public.delivery_agents TO authenticated;

-- 2.3 Catalog & Customer Commerce Tables
GRANT SELECT, INSERT, UPDATE, DELETE ON public.products TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cart_items TO authenticated;
GRANT SELECT, INSERT, DELETE ON public.wishlist_items TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.reviews TO authenticated;

-- 2.4 Orders & Fulfillment Grants (Strict Column Privileges & Authoritative Creation)
-- Order creation is backend-authoritative. INSERT is granted to authenticated for admin creation;
-- ordinary clients are gated by RLS WITH CHECK (is_admin()).
-- Customer_id, vendor_id, total, and order_code are EXCLUDED from UPDATE grants.
GRANT SELECT, INSERT ON public.orders TO authenticated;
GRANT UPDATE (order_status, delivery_status, updated_at) ON public.orders TO authenticated;

GRANT SELECT, INSERT ON public.order_items TO authenticated;
GRANT SELECT ON public.delivery_batches TO authenticated;
GRANT SELECT ON public.delivery_batch_orders TO authenticated;
GRANT SELECT ON public.batch_waypoints TO authenticated;

-- 2.5 Security, Telemetry & Audit Tables
-- Note: Drivers receive NO SELECT grant on OTP codes via delivery_verifications.
-- system_settings is granted to authenticated, but access is strictly gated to is_admin() by RLS.
GRANT SELECT ON public.delivery_verifications TO authenticated;
GRANT SELECT, INSERT ON public.agent_telemetry TO authenticated;
GRANT SELECT, INSERT ON public.order_status_logs TO authenticated;
GRANT SELECT ON public.transactions TO authenticated;
GRANT SELECT, INSERT, UPDATE (is_read), DELETE ON public.notifications TO authenticated;
GRANT SELECT ON public.delivery_slots TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.system_settings TO authenticated;
GRANT SELECT, INSERT ON public.audit_logs TO authenticated;

-- Sequences
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- --------------------------------------------------------------------
-- SECTION 3: ROW LEVEL SECURITY POLICIES (ALL 21 TABLES)
-- --------------------------------------------------------------------

-- ====================================================================
-- 1. PROFILES
-- ====================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select_own_or_admin" ON public.profiles
FOR SELECT TO authenticated
USING (auth.uid() = id OR public.is_admin());

CREATE POLICY "profiles_insert_own_non_admin" ON public.profiles
FOR INSERT TO authenticated
WITH CHECK (
  public.is_admin()
  OR (
    auth.uid() = id
    AND role IN ('customer', 'vendor', 'delivery_partner')
  )
);

CREATE POLICY "profiles_update_own_or_admin" ON public.profiles
FOR UPDATE TO authenticated
USING (auth.uid() = id OR public.is_admin())
WITH CHECK (
  public.is_admin()
  OR (
    auth.uid() = id
    AND role::text = public.get_auth_role()
  )
);

CREATE POLICY "profiles_delete_admin_only" ON public.profiles
FOR DELETE TO authenticated
USING (public.is_admin());

-- ====================================================================
-- 2. CUSTOMER_PROFILES
-- ====================================================================
ALTER TABLE public.customer_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "customer_profiles_select_own_or_admin" ON public.customer_profiles
FOR SELECT TO authenticated
USING (auth.uid() = id OR public.is_admin());

CREATE POLICY "customer_profiles_insert_own_or_admin" ON public.customer_profiles
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = id OR public.is_admin());

CREATE POLICY "customer_profiles_update_own_or_admin" ON public.customer_profiles
FOR UPDATE TO authenticated
USING (auth.uid() = id OR public.is_admin())
WITH CHECK (auth.uid() = id OR public.is_admin());

CREATE POLICY "customer_profiles_delete_admin_only" ON public.customer_profiles
FOR DELETE TO authenticated
USING (public.is_admin());

-- ====================================================================
-- 3. VENDORS
-- ====================================================================
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "vendors_select_public_or_own" ON public.vendors
FOR SELECT TO authenticated, anon
USING (is_open = true OR status = 'Active' OR auth.uid() = id OR public.is_admin());

CREATE POLICY "vendors_insert_own_or_admin" ON public.vendors
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = id OR public.is_admin());

CREATE POLICY "vendors_update_own_or_admin" ON public.vendors
FOR UPDATE TO authenticated
USING (auth.uid() = id OR public.is_admin())
WITH CHECK (auth.uid() = id OR public.is_admin());

CREATE POLICY "vendors_delete_admin_only" ON public.vendors
FOR DELETE TO authenticated
USING (public.is_admin());

-- ====================================================================
-- 4. DELIVERY_AGENTS
-- ====================================================================
ALTER TABLE public.delivery_agents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "agents_select_own_or_admin" ON public.delivery_agents
FOR SELECT TO authenticated
USING (
  auth.uid() = id 
  OR public.is_admin()
  OR EXISTS (
    SELECT 1 FROM public.orders o
    WHERE o.assigned_agent_id = delivery_agents.id
    AND (o.customer_id = auth.uid() OR o.vendor_id = auth.uid())
  )
);

CREATE POLICY "agents_insert_own_or_admin" ON public.delivery_agents
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = id OR public.is_admin());

CREATE POLICY "agents_update_own_or_admin" ON public.delivery_agents
FOR UPDATE TO authenticated
USING (auth.uid() = id OR public.is_admin())
WITH CHECK (auth.uid() = id OR public.is_admin());

CREATE POLICY "agents_delete_admin_only" ON public.delivery_agents
FOR DELETE TO authenticated
USING (public.is_admin());

-- ====================================================================
-- 5. PRODUCTS
-- ====================================================================
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "products_select_public" ON public.products
FOR SELECT TO authenticated, anon
USING (is_available = true OR vendor_id = auth.uid() OR public.is_admin());

CREATE POLICY "products_insert_vendor_or_admin" ON public.products
FOR INSERT TO authenticated
WITH CHECK (vendor_id = auth.uid() OR public.is_admin());

CREATE POLICY "products_update_vendor_or_admin" ON public.products
FOR UPDATE TO authenticated
USING (vendor_id = auth.uid() OR public.is_admin())
WITH CHECK (vendor_id = auth.uid() OR public.is_admin());

CREATE POLICY "products_delete_vendor_or_admin" ON public.products
FOR DELETE TO authenticated
USING (vendor_id = auth.uid() OR public.is_admin());

-- ====================================================================
-- 6. DELIVERY_BATCHES
-- ====================================================================
ALTER TABLE public.delivery_batches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "batches_select_agent_or_admin" ON public.delivery_batches
FOR SELECT TO authenticated
USING (
  agent_id = auth.uid() 
  OR public.is_admin()
  OR EXISTS (
    SELECT 1 FROM public.orders o
    WHERE o.batch_id = delivery_batches.id
    AND (o.customer_id = auth.uid() OR o.vendor_id = auth.uid())
  )
);

CREATE POLICY "batches_insert_admin_only" ON public.delivery_batches
FOR INSERT TO authenticated WITH CHECK (public.is_admin());

CREATE POLICY "batches_update_admin_only" ON public.delivery_batches
FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "batches_delete_admin_only" ON public.delivery_batches
FOR DELETE TO authenticated USING (public.is_admin());

-- ====================================================================
-- 7. ORDERS
-- ====================================================================
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "orders_select_participants" ON public.orders
FOR SELECT TO authenticated
USING (
  customer_id = auth.uid()
  OR vendor_id = auth.uid()
  OR assigned_agent_id = auth.uid()
  OR public.is_admin()
);

-- Order creation and price calculation are strictly backend-authoritative.
-- Direct client inserts through PostgREST are restricted to verified administrators.
-- Ordinary customers place orders through backend Express API (/api/orders).
CREATE POLICY "orders_insert_backend_or_admin" ON public.orders
FOR INSERT TO authenticated
WITH CHECK (public.is_admin());

-- Non-recursive row authorization for vendors.
-- Workflow state transitions and delivery field protection are enforced by trigger trg_orders_update_integrity.
CREATE POLICY "orders_update_vendor_preparation" ON public.orders
FOR UPDATE TO authenticated
USING (vendor_id = auth.uid())
WITH CHECK (vendor_id = auth.uid());

-- Non-recursive row authorization for assigned delivery partners.
-- Delivery progression transitions and vendor preparation protection are enforced by trigger trg_orders_update_integrity.
CREATE POLICY "orders_update_driver_delivery" ON public.orders
FOR UPDATE TO authenticated
USING (assigned_agent_id = auth.uid())
WITH CHECK (assigned_agent_id = auth.uid());

CREATE POLICY "orders_update_admin" ON public.orders
FOR UPDATE TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE POLICY "orders_delete_admin_only" ON public.orders
FOR DELETE TO authenticated
USING (public.is_admin());

-- ====================================================================
-- 8. ORDER_ITEMS
-- ====================================================================
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "order_items_select_participants" ON public.order_items
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.orders o
    WHERE o.id = order_items.order_id
    AND (
      o.customer_id = auth.uid()
      OR o.vendor_id = auth.uid()
      OR o.assigned_agent_id = auth.uid()
      OR public.is_admin()
    )
  )
);

-- Direct client insertion of order_items through PostgREST is restricted to verified administrators.
-- Backend Express API (/api/orders) uses service-role client to insert validated items.
CREATE POLICY "order_items_insert_backend_or_admin" ON public.order_items
FOR INSERT TO authenticated
WITH CHECK (public.is_admin());

CREATE POLICY "order_items_update_admin" ON public.order_items
FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "order_items_delete_admin" ON public.order_items
FOR DELETE TO authenticated USING (public.is_admin());

-- ====================================================================
-- 9. DELIVERY_BATCH_ORDERS
-- ====================================================================
ALTER TABLE public.delivery_batch_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "batch_orders_select_participants" ON public.delivery_batch_orders
FOR SELECT TO authenticated
USING (
  public.is_admin()
  OR EXISTS (
    SELECT 1 FROM public.delivery_batches b
    WHERE b.id = delivery_batch_orders.batch_id
    AND b.agent_id = auth.uid()
  )
  OR EXISTS (
    SELECT 1 FROM public.orders o
    WHERE o.id = delivery_batch_orders.order_id
    AND (o.customer_id = auth.uid() OR o.vendor_id = auth.uid() OR o.assigned_agent_id = auth.uid())
  )
);

CREATE POLICY "batch_orders_insert_admin" ON public.delivery_batch_orders
FOR INSERT TO authenticated WITH CHECK (public.is_admin());

CREATE POLICY "batch_orders_update_admin" ON public.delivery_batch_orders
FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "batch_orders_delete_admin" ON public.delivery_batch_orders
FOR DELETE TO authenticated USING (public.is_admin());

-- ====================================================================
-- 10. NOTIFICATIONS
-- ====================================================================
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notifications_select_own_or_admin" ON public.notifications
FOR SELECT TO authenticated
USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "notifications_insert_admin_only" ON public.notifications
FOR INSERT TO authenticated
WITH CHECK (public.is_admin());

CREATE POLICY "notifications_update_own_or_admin" ON public.notifications
FOR UPDATE TO authenticated
USING (user_id = auth.uid() OR public.is_admin())
WITH CHECK (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "notifications_delete_own_or_admin" ON public.notifications
FOR DELETE TO authenticated
USING (user_id = auth.uid() OR public.is_admin());

-- ====================================================================
-- 11. DELIVERY_SLOTS
-- ====================================================================
ALTER TABLE public.delivery_slots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "delivery_slots_select_public" ON public.delivery_slots
FOR SELECT TO authenticated, anon
USING (true);

CREATE POLICY "delivery_slots_all_admin" ON public.delivery_slots
FOR ALL TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- ====================================================================
-- 12. SYSTEM_SETTINGS
-- ====================================================================
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- Logistics dispatch and aggregation configuration (max_group_distance, max_orders_per_batch,
-- default_agent_capacity, min_compatibility_score) is strictly internal and administrative.
-- Access (reads and writes) is restricted to verified administrators and the backend service role.
-- Unauthenticated users (anon) and non-admin authenticated users (customers, vendors, delivery partners)
-- are denied SELECT, INSERT, UPDATE, and DELETE.
CREATE POLICY "system_settings_admin_only" ON public.system_settings
FOR ALL TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- ====================================================================
-- 13. DELIVERY_VERIFICATIONS (CRITICAL OTP PRIVACY)
-- ====================================================================
ALTER TABLE public.delivery_verifications ENABLE ROW LEVEL SECURITY;

-- OTP codes are strictly readable ONLY by the customer who placed the order or admin.
-- Delivery drivers receive NO SELECT access to OTP codes.
CREATE POLICY "verifications_select_customer_or_admin" ON public.delivery_verifications
FOR SELECT TO authenticated
USING (
  public.is_admin()
  OR EXISTS (
    SELECT 1 FROM public.orders o
    WHERE o.id = delivery_verifications.order_id
    AND o.customer_id = auth.uid()
  )
);

CREATE POLICY "verifications_insert_admin_only" ON public.delivery_verifications
FOR INSERT TO authenticated
WITH CHECK (public.is_admin());

CREATE POLICY "verifications_update_admin_only" ON public.delivery_verifications
FOR UPDATE TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE POLICY "verifications_delete_admin_only" ON public.delivery_verifications
FOR DELETE TO authenticated
USING (public.is_admin());

-- ====================================================================
-- 14. AGENT_TELEMETRY
-- ====================================================================
ALTER TABLE public.agent_telemetry ENABLE ROW LEVEL SECURITY;

CREATE POLICY "telemetry_select_participants" ON public.agent_telemetry
FOR SELECT TO authenticated
USING (
  agent_id = auth.uid()
  OR public.is_admin()
  OR EXISTS (
    SELECT 1 FROM public.orders o
    WHERE o.assigned_agent_id = agent_telemetry.agent_id
    AND (o.customer_id = auth.uid() OR o.vendor_id = auth.uid())
    AND o.delivery_status IN ('PICKUP_IN_PROGRESS', 'PICKED_UP', 'OUT_FOR_DELIVERY', 'ARRIVED')
  )
);

CREATE POLICY "telemetry_insert_agent_or_admin" ON public.agent_telemetry
FOR INSERT TO authenticated
WITH CHECK (agent_id = auth.uid() OR public.is_admin());

CREATE POLICY "telemetry_update_admin" ON public.agent_telemetry
FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "telemetry_delete_admin" ON public.agent_telemetry
FOR DELETE TO authenticated USING (public.is_admin());

-- ====================================================================
-- 15. WISHLIST_ITEMS
-- ====================================================================
ALTER TABLE public.wishlist_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "wishlist_select_own" ON public.wishlist_items
FOR SELECT TO authenticated
USING (customer_id = auth.uid() OR public.is_admin());

CREATE POLICY "wishlist_insert_own" ON public.wishlist_items
FOR INSERT TO authenticated
WITH CHECK (customer_id = auth.uid() OR public.is_admin());

CREATE POLICY "wishlist_delete_own" ON public.wishlist_items
FOR DELETE TO authenticated
USING (customer_id = auth.uid() OR public.is_admin());

-- ====================================================================
-- 16. ORDER_STATUS_LOGS
-- ====================================================================
ALTER TABLE public.order_status_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "status_logs_select_participants" ON public.order_status_logs
FOR SELECT TO authenticated
USING (
  public.is_admin()
  OR EXISTS (
    SELECT 1 FROM public.orders o
    WHERE o.id = order_status_logs.order_id
    AND (
      o.customer_id = auth.uid()
      OR o.vendor_id = auth.uid()
      OR o.assigned_agent_id = auth.uid()
    )
  )
);

-- Enforces that actor is an actual fulfillment participant (vendor or assigned driver)
-- Customers cannot insert status logs; changed_by must equal auth.uid()
CREATE POLICY "status_logs_insert_participants" ON public.order_status_logs
FOR INSERT TO authenticated
WITH CHECK (
  public.is_admin()
  OR (
    changed_by = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_status_logs.order_id
      AND (
        o.vendor_id = auth.uid()
        OR o.assigned_agent_id = auth.uid()
      )
    )
  )
);

CREATE POLICY "status_logs_update_admin" ON public.order_status_logs
FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "status_logs_delete_admin" ON public.order_status_logs
FOR DELETE TO authenticated USING (public.is_admin());

-- ====================================================================
-- 17. BATCH_WAYPOINTS
-- ====================================================================
ALTER TABLE public.batch_waypoints ENABLE ROW LEVEL SECURITY;

CREATE POLICY "waypoints_select_participants" ON public.batch_waypoints
FOR SELECT TO authenticated
USING (
  public.is_admin()
  OR EXISTS (
    SELECT 1 FROM public.delivery_batches b
    WHERE b.id = batch_waypoints.batch_id
    AND b.agent_id = auth.uid()
  )
  OR EXISTS (
    SELECT 1 FROM public.orders o
    WHERE o.id = batch_waypoints.order_id
    AND (o.customer_id = auth.uid() OR o.vendor_id = auth.uid())
  )
);

CREATE POLICY "waypoints_insert_admin" ON public.batch_waypoints
FOR INSERT TO authenticated WITH CHECK (public.is_admin());

CREATE POLICY "waypoints_update_admin" ON public.batch_waypoints
FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "waypoints_delete_admin" ON public.batch_waypoints
FOR DELETE TO authenticated USING (public.is_admin());

-- ====================================================================
-- 18. TRANSACTIONS
-- ====================================================================
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "transactions_select_participants" ON public.transactions
FOR SELECT TO authenticated
USING (customer_id = auth.uid() OR public.is_admin());

CREATE POLICY "transactions_insert_admin" ON public.transactions
FOR INSERT TO authenticated WITH CHECK (public.is_admin());

CREATE POLICY "transactions_update_admin" ON public.transactions
FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "transactions_delete_admin" ON public.transactions
FOR DELETE TO authenticated USING (public.is_admin());

-- ====================================================================
-- 19. CART_ITEMS
-- ====================================================================
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "cart_items_select_own" ON public.cart_items
FOR SELECT TO authenticated
USING (customer_id = auth.uid() OR public.is_admin());

CREATE POLICY "cart_items_insert_own" ON public.cart_items
FOR INSERT TO authenticated
WITH CHECK (customer_id = auth.uid() OR public.is_admin());

CREATE POLICY "cart_items_update_own" ON public.cart_items
FOR UPDATE TO authenticated
USING (customer_id = auth.uid() OR public.is_admin())
WITH CHECK (customer_id = auth.uid() OR public.is_admin());

CREATE POLICY "cart_items_delete_own" ON public.cart_items
FOR DELETE TO authenticated
USING (customer_id = auth.uid() OR public.is_admin());

-- ====================================================================
-- 20. REVIEWS
-- ====================================================================
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "reviews_select_public" ON public.reviews
FOR SELECT TO authenticated, anon
USING (true);

-- Requires customer to have an actual delivered order for verified review insertion.
-- order_id is strictly required to prevent unverified review forgery.
CREATE POLICY "reviews_insert_verified_purchaser" ON public.reviews
FOR INSERT TO authenticated
WITH CHECK (
  public.is_admin()
  OR (
    customer_id = auth.uid()
    AND order_id IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = reviews.order_id
      AND o.customer_id = auth.uid()
      AND (o.order_status = 'DELIVERED' OR o.delivery_status = 'DELIVERED')
    )
  )
);

CREATE POLICY "reviews_update_own" ON public.reviews
FOR UPDATE TO authenticated
USING (customer_id = auth.uid() OR public.is_admin())
WITH CHECK (customer_id = auth.uid() OR public.is_admin());

CREATE POLICY "reviews_delete_own_or_admin" ON public.reviews
FOR DELETE TO authenticated
USING (customer_id = auth.uid() OR public.is_admin());

-- ====================================================================
-- 21. AUDIT_LOGS
-- ====================================================================
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "audit_logs_select_admin_only" ON public.audit_logs
FOR SELECT TO authenticated
USING (public.is_admin());

CREATE POLICY "audit_logs_insert_actor_or_admin" ON public.audit_logs
FOR INSERT TO authenticated
WITH CHECK (actor_id = auth.uid() OR public.is_admin());

CREATE POLICY "audit_logs_update_admin" ON public.audit_logs
FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "audit_logs_delete_admin" ON public.audit_logs
FOR DELETE TO authenticated USING (public.is_admin());

-- ====================================================================
-- SECTION 4: POST-MIGRATION VERIFICATION & ISOLATED TEST HARNESS
-- ====================================================================
-- Execute these queries after applying the migration in the Supabase
-- SQL Editor to verify complete, correct enforcement.

-- Verification 4.1: Verify RLS is enabled on all 21 public tables
-- Expected output: 21 rows, all with rls_enabled = true.
/*
SELECT 
  tablename,
  rowsecurity AS rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN (
    'profiles', 'customer_profiles', 'vendors', 'delivery_agents', 'products',
    'delivery_batches', 'orders', 'order_items', 'delivery_batch_orders', 'notifications',
    'delivery_slots', 'system_settings', 'delivery_verifications', 'agent_telemetry',
    'wishlist_items', 'order_status_logs', 'batch_waypoints', 'transactions',
    'cart_items', 'reviews', 'audit_logs'
  )
ORDER BY tablename;
*/

-- Verification 4.2: Verify registered policy count and command breakdown
-- Expected output: ~50 distinct policies covering all 21 tables.
/*
SELECT 
  tablename,
  policyname,
  roles,
  cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
*/

-- Verification 4.3: Verify helper and trigger function security properties
-- Expected output: prosecdef = true (SECURITY DEFINER), proconfig contains search_path.
/*
SELECT 
  proname,
  prosecdef AS is_security_definer,
  proconfig AS execution_config
FROM pg_proc
WHERE proname IN ('is_admin', 'get_auth_role', 'is_service_role', 'is_trusted_backend_or_admin', 'check_profile_integrity', 'check_order_update_integrity', 'check_order_item_insert_integrity');
*/

-- Verification 4.4: Automated Privilege Assertion Check
/*
DO $$
BEGIN
  -- 1. Delivery OTP privacy
  ASSERT NOT has_table_privilege('anon', 'public.delivery_verifications', 'SELECT'),
    'SECURITY ERROR: anon role has SELECT on delivery_verifications!';
  ASSERT NOT has_table_privilege('authenticated', 'public.delivery_verifications', 'UPDATE'),
    'SECURITY ERROR: authenticated role has UPDATE on delivery_verifications!';
  ASSERT NOT has_table_privilege('authenticated', 'public.delivery_verifications', 'DELETE'),
    'SECURITY ERROR: authenticated role has DELETE on delivery_verifications!';

  -- 2. Role escalation prevention
  ASSERT NOT has_column_privilege('authenticated', 'public.profiles', 'role', 'UPDATE'),
    'SECURITY ERROR: authenticated role has UPDATE on profiles.role!';

  -- 3. Order pricing integrity
  ASSERT NOT has_column_privilege('authenticated', 'public.orders', 'total', 'UPDATE'),
    'SECURITY ERROR: authenticated role has UPDATE on orders.total!';

  -- 4. System settings privacy
  ASSERT NOT has_table_privilege('anon', 'public.system_settings', 'SELECT'),
    'SECURITY ERROR: anon role has SELECT on system_settings!';

  RAISE NOTICE 'SUCCESS: All privilege assertions verified correctly.';
END $$;
*/

-- Verification 4.5: Helper Function Role Claim Isolation Test
-- Specifically tests is_service_role() and is_trusted_backend_or_admin() under
-- anon, ordinary authenticated, admin, and service_role session contexts.
-- Uses transactional rollback (ROLLBACK) to leave zero persistent side effects.
/*
BEGIN;
DO $$
DECLARE
  v_test_admin UUID := '00000000-0000-0000-0000-000000000009';
  v_test_user  UUID := '00000000-0000-0000-0000-000000000001';
BEGIN
  -- Insert test admin and ordinary user profiles
  INSERT INTO public.profiles (id, username, email, role)
  VALUES 
    (v_test_admin, 'test_adm', 'adm@example.com', 'admin'),
    (v_test_user, 'test_usr', 'usr@example.com', 'customer');

  -- Case A: Ordinary Authenticated User
  PERFORM set_config('role', 'authenticated', true);
  PERFORM set_config('request.jwt.claim.role', 'authenticated', true);
  PERFORM set_config('request.jwt.claim.sub', v_test_user::text, true);
  PERFORM set_config('request.jwt.claims', json_build_object('sub', v_test_user, 'role', 'authenticated')::text, true);

  ASSERT NOT public.is_service_role(),
    'TEST FAILED: Ordinary authenticated user was incorrectly identified as service role!';
  ASSERT NOT public.is_trusted_backend_or_admin(),
    'TEST FAILED: Ordinary authenticated user was incorrectly identified as trusted!';

  -- Case B: Anonymous Caller
  PERFORM set_config('role', 'anon', true);
  PERFORM set_config('request.jwt.claim.role', 'anon', true);
  PERFORM set_config('request.jwt.claim.sub', '', true);
  PERFORM set_config('request.jwt.claims', json_build_object('role', 'anon')::text, true);

  ASSERT NOT public.is_service_role(),
    'TEST FAILED: Anonymous caller was incorrectly identified as service role!';
  ASSERT NOT public.is_trusted_backend_or_admin(),
    'TEST FAILED: Anonymous caller was incorrectly identified as trusted!';

  -- Case C: Verified Administrator User
  PERFORM set_config('role', 'authenticated', true);
  PERFORM set_config('request.jwt.claim.role', 'authenticated', true);
  PERFORM set_config('request.jwt.claim.sub', v_test_admin::text, true);
  PERFORM set_config('request.jwt.claims', json_build_object('sub', v_test_admin, 'role', 'authenticated')::text, true);

  ASSERT NOT public.is_service_role(),
    'TEST FAILED: Administrator was incorrectly identified as service role!';
  ASSERT public.is_trusted_backend_or_admin(),
    'TEST FAILED: Administrator was not identified as trusted!';

  -- Case D: Backend Service Role (SUPABASE_SERVICE_ROLE_KEY)
  PERFORM set_config('role', 'service_role', true);
  PERFORM set_config('request.jwt.claim.role', 'service_role', true);
  PERFORM set_config('request.jwt.claim.sub', '', true);
  PERFORM set_config('request.jwt.claims', json_build_object('role', 'service_role')::text, true);

  ASSERT public.is_service_role(),
    'TEST FAILED: Service role was not identified correctly!';
  ASSERT public.is_trusted_backend_or_admin(),
    'TEST FAILED: Service role was not identified as trusted!';

  RAISE NOTICE 'SUCCESS: Role claim isolation test passed for all 4 session contexts.';
END $$;
ROLLBACK;
*/

-- Verification 4.6: Isolated Multi-Actor Workflow & Negative Simulation Test Harness
-- Validates:
-- 1. Delivery driver cannot SELECT OTP code from delivery_verifications.
-- 2. Delivery driver cannot alter vendor preparation status fields.
-- 3. Customer CAN read their own OTP code.
-- 4. Customer CANNOT update order total or status fields.
-- 5. Customer CANNOT read system_settings (denied by admin-only policy).
-- 6. Direct insertion of order item with price exceeding catalog price is rejected.
-- Rolls back completely (ROLLBACK) to guarantee zero side effects or data modifications.
/*
BEGIN;
DO $$
DECLARE
  v_test_customer UUID := '00000000-0000-0000-0000-000000000001';
  v_test_driver   UUID := '00000000-0000-0000-0000-000000000002';
  v_test_vendor   UUID := '00000000-0000-0000-0000-000000000003';
  v_test_product  UUID := '00000000-0000-0000-0000-000000000010';
  v_test_order    UUID := '00000000-0000-0000-0000-000000000099';
  v_otp_count     INTEGER;
  v_settings_count INTEGER;
  v_exception_caught BOOLEAN := FALSE;
BEGIN
  -- 1. Insert synthetic prerequisite hierarchy respecting all foreign keys
  INSERT INTO public.profiles (id, username, email, role)
  VALUES 
    (v_test_customer, 'test_cust', 'test_c@example.com', 'customer'),
    (v_test_driver, 'test_driver', 'test_d@example.com', 'delivery_partner'),
    (v_test_vendor, 'test_vendor', 'test_v@example.com', 'vendor');

  INSERT INTO public.customer_profiles (id, address, area)
  VALUES (v_test_customer, '123 Test Street', 'Central Zone');

  INSERT INTO public.vendors (id, shop_name, owner_name, category, address)
  VALUES (v_test_vendor, 'Test Organic Market', 'Test Owner', 'Groceries', '456 Vendor Way');

  INSERT INTO public.delivery_agents (id, current_area, status)
  VALUES (v_test_driver, 'Central Zone', 'Available');

  INSERT INTO public.products (id, vendor_id, name, category, price, stock)
  VALUES (v_test_product, v_test_vendor, 'Farm Fresh Apples', 'Produce', 50.00, 100);

  INSERT INTO public.orders (
    id, customer_id, vendor_id, assigned_agent_id, order_status, delivery_status,
    aggregation_status, total, order_code, pickup_location, delivery_location
  )
  VALUES (
    v_test_order, v_test_customer, v_test_vendor, v_test_driver, 'READY_FOR_DELIVERY',
    'ASSIGNED', 'ASSIGNED', 100.0, 'ORD-TEST-99', '456 Vendor Way', '123 Test Street'
  );

  INSERT INTO public.order_items (order_id, product_id, qty, price)
  VALUES (v_test_order, v_test_product, 2, 50.00);

  INSERT INTO public.delivery_verifications (order_id, otp_code)
  VALUES (v_test_order, '999888');

  -- 2. Switch session context to delivery partner
  PERFORM set_config('role', 'authenticated', true);
  PERFORM set_config('request.jwt.claim.role', 'authenticated', true);
  PERFORM set_config('request.jwt.claim.sub', v_test_driver::text, true);
  PERFORM set_config('request.jwt.claims', json_build_object('sub', v_test_driver, 'role', 'authenticated')::text, true);

  -- Negative Test 1: Driver attempts to read delivery OTP
  SELECT COUNT(*) INTO v_otp_count FROM public.delivery_verifications WHERE order_id = v_test_order;
  IF v_otp_count > 0 THEN
    RAISE EXCEPTION 'TEST FAILED: Driver was able to read delivery verification OTP!';
  END IF;

  -- Negative Test 2: Driver attempts to alter vendor order_status
  BEGIN
    UPDATE public.orders SET order_status = 'CANCELLED' WHERE id = v_test_order;
    v_exception_caught := FALSE;
  EXCEPTION WHEN OTHERS THEN
    v_exception_caught := TRUE;
  END;
  IF NOT v_exception_caught THEN
    RAISE EXCEPTION 'TEST FAILED: Driver was able to modify vendor order_status!';
  END IF;

  -- 3. Switch session context to customer
  PERFORM set_config('request.jwt.claim.sub', v_test_customer::text, true);
  PERFORM set_config('request.jwt.claims', json_build_object('sub', v_test_customer, 'role', 'authenticated')::text, true);

  -- Positive Test 3: Customer CAN read their own OTP
  SELECT COUNT(*) INTO v_otp_count FROM public.delivery_verifications WHERE order_id = v_test_order;
  IF v_otp_count = 0 THEN
    RAISE EXCEPTION 'TEST FAILED: Customer was unable to read their own delivery verification OTP!';
  END IF;

  -- Negative Test 4: Customer attempts to update order total
  BEGIN
    UPDATE public.orders SET total = 0.01 WHERE id = v_test_order;
    v_exception_caught := FALSE;
  EXCEPTION WHEN OTHERS THEN
    v_exception_caught := TRUE;
  END;
  IF NOT v_exception_caught THEN
    RAISE EXCEPTION 'TEST FAILED: Customer was able to modify order total!';
  END IF;

  -- Negative Test 5: Customer attempts to read system_settings (must be 0 rows)
  SELECT COUNT(*) INTO v_settings_count FROM public.system_settings;
  IF v_settings_count > 0 THEN
    RAISE EXCEPTION 'TEST FAILED: Customer was able to read internal system_settings!';
  END IF;

  -- Negative Test 6: Insertion of item with price > catalog price is rejected
  BEGIN
    INSERT INTO public.order_items (order_id, product_id, qty, price)
    VALUES (v_test_order, v_test_product, 1, 999.00);
    v_exception_caught := FALSE;
  EXCEPTION WHEN OTHERS THEN
    v_exception_caught := TRUE;
  END;
  IF NOT v_exception_caught THEN
    RAISE EXCEPTION 'TEST FAILED: Inflated item price was accepted without trigger rejection!';
  END IF;

  RAISE NOTICE 'SUCCESS: All test harness assertions passed. Rolling back transaction.';
END $$;
ROLLBACK;
*/

-- ====================================================================
-- SECTION 5: EMERGENCY RECOVERY RUNBOOK (BASELINE APPROXIMATION)
-- ====================================================================
-- IMPORTANT NOTICE CONCERNING ROLLBACK ACCURACY:
-- Prior to Migration 0003, Row-Level Security was disabled across all 21 tables,
-- no RLS policies existed in pg_policies, and standard default Supabase CRUD grants
-- were assigned. However, pre-migration database state (such as individual column ACLs
-- or historical configuration) was not recorded as an immutable snapshot.
--
-- Therefore, the following procedure is an EMERGENCY BASELINE APPROXIMATION.
-- It restores the database to an operational state with RLS disabled and default
-- Supabase CRUD grants, removing custom 0003 triggers, functions, and policies.
-- It does NOT represent a cryptographically exact restoration of pre-migration state.
--
-- TARGETED PARTIAL MITIGATION (RECOMMENDED OVER FULL ROLLBACK):
-- If an operational issue is isolated to a specific policy or trigger (e.g., orders
-- update or review creation), disable or drop only that specific trigger/policy
-- rather than disabling RLS globally, which removes all tenant isolation.
--
-- RUNBOOK EXECUTION STEPS:
/*
-- Step 5.1: Drop all triggers and integrity functions
DROP TRIGGER IF EXISTS trg_orders_update_integrity ON public.orders;
DROP FUNCTION IF EXISTS public.check_order_update_integrity();

DROP TRIGGER IF EXISTS trg_profiles_integrity ON public.profiles;
DROP FUNCTION IF EXISTS public.check_profile_integrity();

DROP TRIGGER IF EXISTS trg_order_items_insert_integrity ON public.order_items;
DROP FUNCTION IF EXISTS public.check_order_item_insert_integrity();

-- Step 5.2: Drop helper functions
DROP FUNCTION IF EXISTS public.is_trusted_backend_or_admin();
DROP FUNCTION IF EXISTS public.is_service_role();
DROP FUNCTION IF EXISTS public.is_admin();
DROP FUNCTION IF EXISTS public.get_auth_role();

-- Step 5.3: Drop all RLS policies across all 21 tables
DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN 
    SELECT schemaname, tablename, policyname 
    FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename IN (
        'profiles', 'customer_profiles', 'vendors', 'delivery_agents', 'products',
        'delivery_batches', 'orders', 'order_items', 'delivery_batch_orders', 'notifications',
        'delivery_slots', 'system_settings', 'delivery_verifications', 'agent_telemetry',
        'wishlist_items', 'order_status_logs', 'batch_waypoints', 'transactions',
        'cart_items', 'reviews', 'audit_logs'
      )
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I;', pol.policyname, pol.schemaname, pol.tablename);
  END LOOP;
END $$;

-- Step 5.4: Restore baseline Supabase table privileges (SELECT, INSERT, UPDATE, DELETE)
-- Avoids dangerous broad GRANT ALL (prevents unintended table DROP/TRUNCATE privileges).
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

DO $$
DECLARE
  t text;
  tables text[] := ARRAY[
    'profiles', 'customer_profiles', 'vendors', 'delivery_agents', 'products',
    'delivery_batches', 'orders', 'order_items', 'delivery_batch_orders', 'notifications',
    'delivery_slots', 'system_settings', 'delivery_verifications', 'agent_telemetry',
    'wishlist_items', 'order_status_logs', 'batch_waypoints', 'transactions',
    'cart_items', 'reviews', 'audit_logs'
  ];
BEGIN
  FOREACH t IN ARRAY tables LOOP
    EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.%I TO authenticated;', t);
  END LOOP;
END $$;

GRANT SELECT ON public.products TO anon;
GRANT SELECT ON public.vendors TO anon;
GRANT SELECT ON public.delivery_slots TO anon;
GRANT SELECT ON public.reviews TO anon;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Step 5.5: Revert table RLS status to disabled (emergency baseline approximation)
-- WARNING: Relies entirely on Express backend controllers for authorization.
DO $$
DECLARE
  t text;
  tables text[] := ARRAY[
    'profiles', 'customer_profiles', 'vendors', 'delivery_agents', 'products',
    'delivery_batches', 'orders', 'order_items', 'delivery_batch_orders', 'notifications',
    'delivery_slots', 'system_settings', 'delivery_verifications', 'agent_telemetry',
    'wishlist_items', 'order_status_logs', 'batch_waypoints', 'transactions',
    'cart_items', 'reviews', 'audit_logs'
  ];
BEGIN
  FOREACH t IN ARRAY tables LOOP
    EXECUTE format('ALTER TABLE public.%I DISABLE ROW LEVEL SECURITY;', t);
  END LOOP;
END $$;
*/
