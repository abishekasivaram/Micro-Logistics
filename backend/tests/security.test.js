import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';

// Mock Supabase client
const { mockDatabase, mockSupabaseInstance } = vi.hoisted(() => {
  const mockDatabase = {
    profiles: [
      { id: 'cust-1', email: 'cust1@example.com', username: 'Customer One', role: 'customer' },
      { id: 'cust-2', email: 'cust2@example.com', username: 'Customer Two', role: 'customer' },
      { id: 'vend-1', email: 'vend1@example.com', username: 'Vendor One', role: 'vendor' },
      { id: 'vend-2', email: 'vend2@example.com', username: 'Vendor Two', role: 'vendor' },
      { id: 'agent-1', email: 'agent1@example.com', username: 'Agent One', role: 'delivery_partner' },
      { id: 'admin-1', email: 'admin@example.com', username: 'Admin User', role: 'admin' }
    ],
    customer_profiles: [
      { id: 'cust-1', legacy_id: 'c1', address: '123 Main St', area: 'Anna Nagar', status: 'Active' },
      { id: 'cust-2', legacy_id: 'c2', address: '456 Side St', area: 'T. Nagar', status: 'Active' }
    ],
    vendors: [
      { id: 'vend-1', legacy_id: 'v1', shop_name: 'Shop 1', address: 'Vendor St 1', status: 'Active' },
      { id: 'vend-2', legacy_id: 'v2', shop_name: 'Shop 2', address: 'Vendor St 2', status: 'Active' }
    ],
    delivery_agents: [
      { id: 'agent-1', legacy_id: 'da1', current_area: 'Anna Nagar', capacity: 5 }
    ],
    products: [
      { id: 'prod-1', legacy_id: 'p1', name: 'Fresh Milk', price: 40, stock: 25, vendor_id: 'vend-1' },
      { id: 'prod-2', legacy_id: 'p2', name: 'Organic Honey', price: 150, stock: 0, vendor_id: 'vend-2' }
    ],
    orders: [
      { id: 'ord-uuid-1', order_code: 'ORD-1001', customer_id: 'cust-1', vendor_id: 'vend-1', assigned_agent_id: 'agent-1', order_status: 'PLACED' },
      { id: 'ord-uuid-2', order_code: 'ORD-1002', customer_id: 'cust-2', vendor_id: 'vend-2', assigned_agent_id: 'agent-2', order_status: 'PLACED' }
    ],
    delivery_verifications: [
      { id: 'ver-1', order_id: 'ord-uuid-1', otp_code: '7890', is_verified: false, attempts: 0 }
    ]
  };

  const createMockSupabase = () => {
    return {
      from: (table) => {
        let currentFilter = {};
        const query = {
          select: () => query,
          eq: (field, val) => {
            currentFilter[field] = val;
            return query;
          },
          or: () => query,
          order: () => query,
          limit: () => query,
          then: (resolve, reject) => {
            const tableData = mockDatabase[table] || [];
            return Promise.resolve({ data: tableData, error: null }).then(resolve, reject);
          },
          single: async () => {
            const tableData = mockDatabase[table] || [];
            const found = tableData.find(item => {
              for (const k in currentFilter) {
                if (item[k] !== currentFilter[k]) return false;
              }
              return true;
            });
            return { data: found || null, error: found ? null : { message: 'Not found', code: 'PGRST116' } };
          },
          insert: (data) => {
            const item = Array.isArray(data) ? data[0] : data;
            const created = { id: `new-${Date.now()}`, ...item };
            if (!mockDatabase[table]) mockDatabase[table] = [];
            mockDatabase[table].push(created);
            const res = { data: created, error: null };
            return {
              then: (resolve, reject) => Promise.resolve(res).then(resolve, reject),
              select: () => ({
                single: async () => res,
                then: (resolve, reject) => Promise.resolve(res).then(resolve, reject)
              })
            };
          },
          update: (updates) => {
            return {
              eq: (field, val) => {
                const tableData = mockDatabase[table] || [];
                const item = tableData.find(i => i[field] === val);
                if (item) Object.assign(item, updates);
                const res = { data: item || null, error: null };
                return {
                  then: (resolve, reject) => Promise.resolve(res).then(resolve, reject),
                  select: () => ({
                    single: async () => res,
                    then: (resolve, reject) => Promise.resolve(res).then(resolve, reject)
                  })
                };
              }
            };
          },
          delete: () => ({
            eq: (field, val) => {
              const res = { error: null };
              return {
                then: (resolve, reject) => Promise.resolve(res).then(resolve, reject)
              };
            }
          })
        };
        return query;
      },
      auth: {
        getUser: async (token) => {
          if (token === 'valid-customer-token') {
            return { data: { user: { id: 'cust-1', email: 'cust1@example.com', user_metadata: { role: 'customer' } } }, error: null };
          }
          if (token === 'valid-other-customer-token') {
            return { data: { user: { id: 'cust-2', email: 'cust2@example.com', user_metadata: { role: 'customer' } } }, error: null };
          }
          if (token === 'valid-vendor-token') {
            return { data: { user: { id: 'vend-1', email: 'vend1@example.com', user_metadata: { role: 'vendor' } } }, error: null };
          }
          if (token === 'valid-delivery-token') {
            return { data: { user: { id: 'agent-1', email: 'agent1@example.com', user_metadata: { role: 'delivery_partner' } } }, error: null };
          }
          if (token === 'valid-admin-token') {
            return { data: { user: { id: 'admin-1', email: 'admin@example.com', user_metadata: { role: 'admin' } } }, error: null };
          }
          return { data: { user: null }, error: new Error('Invalid or expired token') };
        },
        admin: {
          createUser: async ({ email, user_metadata }) => ({
            data: { user: { id: `new-user-${Date.now()}`, email, user_metadata } },
            error: null
          }),
          deleteUser: async () => ({ error: null })
        }
      }
    };
  };

  const mockSupabaseInstance = createMockSupabase();
  return { mockDatabase, mockSupabaseInstance };
});

const supabaseConfig = require('../src/config/supabase');
supabaseConfig.supabase = mockSupabaseInstance;

import app from '../src/app';

describe('Security Hardening Test Suite', () => {
  describe('Phase Three: Authentication Middleware & Header Spoofing Protection', () => {
    it('should reject request with missing Authorization header (401)', async () => {
      const res = await request(app).get('/api/v1/orders');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Unauthorized');
    });

    it('should reject request with malformed Bearer token (401)', async () => {
      const res = await request(app)
        .get('/api/v1/orders')
        .set('Authorization', 'Bearer ');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should reject request with invalid or expired token (401)', async () => {
      const res = await request(app)
        .get('/api/v1/orders')
        .set('Authorization', 'Bearer completely-invalid-expired-token');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should NOT allow unauthenticated identity spoofing via x-user-id in production', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';
      try {
        const res = await request(app)
          .get('/api/v1/orders')
          .set('x-user-id', 'admin-1')
          .set('x-user-role', 'admin');
        expect(res.status).toBe(401);
      } finally {
        process.env.NODE_ENV = originalEnv;
      }
    });

    it('should NOT allow role escalation via x-user-role when client has valid customer token', async () => {
      // Customer token passed with spoofed x-user-role: admin attempting to access /settings
      const res = await request(app)
        .get('/api/v1/settings')
        .set('Authorization', 'Bearer valid-customer-token')
        .set('x-user-role', 'admin');
      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Forbidden');
    });

    it('should permit access for valid customer token on authorized route', async () => {
      const res = await request(app)
        .get('/api/v1/orders')
        .set('Authorization', 'Bearer valid-customer-token');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('Phase Two: Registration Role Security', () => {
    it('should block public registration for administrator accounts (403)', async () => {
      const res = await request(app)
        .post('/api/v1/auth/signup')
        .send({
          email: 'newadmin@example.com',
          password: 'securePassword123',
          role: 'admin',
          name: 'Attacker Admin'
        });
      expect(res.status).toBe(403);
      expect(res.body.message).toContain('administrator accounts');
    });

    it('should reject registration with invalid or arbitrary role (400)', async () => {
      const res = await request(app)
        .post('/api/v1/auth/signup')
        .send({
          email: 'hacker@example.com',
          password: 'securePassword123',
          role: 'super_root_user',
          name: 'Hacker'
        });
      expect(res.status).toBe(400);
      expect(res.body.message).toContain('Invalid registration role');
    });

    it('should reject registration with short password (400)', async () => {
      const res = await request(app)
        .post('/api/v1/auth/signup')
        .send({
          email: 'validcust@example.com',
          password: '123',
          role: 'customer',
          name: 'Valid Cust'
        });
      expect(res.status).toBe(400);
      expect(res.body.message).toContain('at least 6 characters');
    });
  });

  describe('Phase Four: Customer Data Isolation & Authorization', () => {
    it('should allow customer to access their own customer profile', async () => {
      const res = await request(app)
        .get('/api/v1/customers/cust-1')
        .set('Authorization', 'Bearer valid-customer-token');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should forbid customer from accessing another customer profile (403)', async () => {
      const res = await request(app)
        .get('/api/v1/customers/cust-2')
        .set('Authorization', 'Bearer valid-customer-token');
      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Forbidden');
    });

    it('should forbid customer from updating another customer profile (403)', async () => {
      const res = await request(app)
        .put('/api/v1/customers/cust-2')
        .set('Authorization', 'Bearer valid-customer-token')
        .send({ address: 'Hacked address' });
      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('should forbid customer from changing order fulfillment status (403)', async () => {
      const res = await request(app)
        .patch('/api/v1/orders/ORD-1001/status')
        .set('Authorization', 'Bearer valid-customer-token')
        .send({ status: 'DELIVERED' });
      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Customers cannot update');
    });

    it('should forbid customer from accessing settings endpoint (403)', async () => {
      const res = await request(app)
        .get('/api/v1/settings')
        .set('Authorization', 'Bearer valid-customer-token');
      expect(res.status).toBe(403);
    });
  });

  describe('Phase Eight: Delivery Verification & OTP Security', () => {
    it('should allow purchasing customer to retrieve delivery OTP for their order', async () => {
      const res = await request(app)
        .get('/api/v1/delivery/orders/ORD-1001/otp')
        .set('Authorization', 'Bearer valid-customer-token');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.otp).toBeDefined();
    });

    it('should forbid another customer from viewing the order delivery OTP (403)', async () => {
      const res = await request(app)
        .get('/api/v1/delivery/orders/ORD-1001/otp')
        .set('Authorization', 'Bearer valid-other-customer-token');
      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('should forbid delivery agents from reading customer handover OTP (403)', async () => {
      const res = await request(app)
        .get('/api/v1/delivery/orders/ORD-1001/otp')
        .set('Authorization', 'Bearer valid-delivery-token');
      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('should reject universal static OTP 1234 when verification code does not match (400)', async () => {
      const res = await request(app)
        .post('/api/v1/delivery/verify-otp')
        .set('Authorization', 'Bearer valid-delivery-token')
        .send({ orderId: 'ORD-1001', otp: '1234' });
      // OTP in mock database is 7890, so 1234 MUST be rejected
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Invalid OTP');
    });

    it('should accept valid order-specific OTP verification', async () => {
      const res = await request(app)
        .post('/api/v1/delivery/verify-otp')
        .set('Authorization', 'Bearer valid-delivery-token')
        .send({ orderId: 'ORD-1001', otp: '7890' });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('DELIVERED');
    });
  });

  describe('Phase Five: Cross-Role Isolation (Vendor & Admin)', () => {
    it('should allow vendor to transition their own order to PREPARING (200)', async () => {
      const res = await request(app)
        .patch('/api/v1/orders/ORD-1001/status')
        .set('Authorization', 'Bearer valid-vendor-token')
        .send({ status: 'PREPARING' });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.orderStatus).toBe('PREPARING');
    });

    it('should forbid vendor from updating another vendor order (403)', async () => {
      const res = await request(app)
        .patch('/api/v1/orders/ORD-1002/status')
        .set('Authorization', 'Bearer valid-vendor-token')
        .send({ status: 'PREPARING' });
      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('You do not own this order');
    });

    it('should forbid vendor from directly completing order as DELIVERED (403)', async () => {
      const res = await request(app)
        .patch('/api/v1/orders/ORD-1001/status')
        .set('Authorization', 'Bearer valid-vendor-token')
        .send({ status: 'DELIVERED' });
      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Vendors cannot transition orders to this status');
    });

    it('should forbid vendor from updating another vendor product (403)', async () => {
      // Vendor 1 attempting to update Product 2 (owned by Vendor 2)
      const res = await request(app)
        .put('/api/v1/products/prod-2')
        .set('Authorization', 'Bearer valid-vendor-token')
        .send({ price: 200 });
      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('should forbid vendor from accessing system settings (403)', async () => {
      const res = await request(app)
        .get('/api/v1/settings')
        .set('Authorization', 'Bearer valid-vendor-token');
      expect(res.status).toBe(403);
    });

    it('should allow admin to access settings (200)', async () => {
      const res = await request(app)
        .get('/api/v1/settings')
        .set('Authorization', 'Bearer valid-admin-token');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});
