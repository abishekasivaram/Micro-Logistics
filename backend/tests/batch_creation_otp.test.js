import { describe, it, expect, vi } from 'vitest';

const { mockDatabase, mockSupabaseInstance } = vi.hoisted(() => {
  const mockDatabase = {
    profiles: [
      { id: 'admin-1', email: 'admin@example.com', username: 'Admin User', role: 'admin' },
      { id: 'agent-1', email: 'agent1@example.com', username: 'Agent One', role: 'delivery_partner' },
      { id: 'cust-1', email: 'cust1@example.com', username: 'Customer One', role: 'customer' }
    ],
    orders: [
      {
        id: 'ord-101',
        order_code: 'ORD-101',
        order_status: 'READY_FOR_DELIVERY',
        delivery_status: 'PENDING_ASSIGNMENT',
        aggregation_status: 'WAITING_FOR_AGGREGATION',
        delivery_date: '2026-11-01',
        delivery_time_slot: '9:00 AM – 1:00 PM',
        delivery_location: '12 Anna Salai, T. Nagar, Chennai 600017',
        pickup_location: 'Vendor A, T. Nagar',
        vendor_id: 'vend-1',
        customer_id: 'cust-1',
        batch_id: null
      },
      {
        id: 'ord-102',
        order_code: 'ORD-102',
        order_status: 'READY_FOR_DELIVERY',
        delivery_status: 'PENDING_ASSIGNMENT',
        aggregation_status: 'WAITING_FOR_AGGREGATION',
        delivery_date: '2026-11-01',
        delivery_time_slot: '9:00 AM – 1:00 PM',
        delivery_location: '45 Usman Road, T. Nagar, Chennai 600017',
        pickup_location: 'Vendor A, T. Nagar',
        vendor_id: 'vend-1',
        customer_id: 'cust-2',
        batch_id: null
      },
      {
        id: 'ord-103',
        order_code: 'ORD-103',
        order_status: 'CANCELLED',
        delivery_status: 'FAILED',
        aggregation_status: 'COMPLETED',
        delivery_date: '2026-11-01',
        delivery_time_slot: '9:00 AM – 1:00 PM',
        delivery_location: '90 Usman Road, T. Nagar, Chennai 600017',
        pickup_location: 'Vendor A, T. Nagar',
        vendor_id: 'vend-1',
        customer_id: 'cust-3',
        batch_id: null
      },
      {
        id: 'ord-104',
        order_code: 'ORD-104',
        order_status: 'READY_FOR_DELIVERY',
        delivery_status: 'PENDING_ASSIGNMENT',
        aggregation_status: 'BATCH_CREATED',
        delivery_date: '2026-11-01',
        delivery_time_slot: '9:00 AM – 1:00 PM',
        delivery_location: '10 Usman Road, T. Nagar, Chennai 600017',
        pickup_location: 'Vendor A, T. Nagar',
        vendor_id: 'vend-1',
        customer_id: 'cust-4',
        batch_id: 'batch-existing'
      }
    ],
    delivery_batches: [
      {
        id: 'batch-existing',
        batch_code: 'B-1111',
        agent_id: 'agent-1',
        order_count: 1,
        status: 'OUT_FOR_DELIVERY',
        aggregation_status: 'ASSIGNED',
        delivery_date: '2026-11-01',
        delivery_slot: '9:00 AM – 1:00 PM'
      }
    ],
    delivery_agents: [
      {
        id: 'agent-1',
        legacy_id: 'da-01',
        vehicle: 'Bike',
        capacity: 2,
        availability: 'Available',
        status: 'Active',
        profile: { username: 'Ramesh Courier', phone: '9876543210' }
      }
    ],
    delivery_verifications: [
      {
        id: 'verif-101',
        order_id: 'ord-101',
        otp_code: '5566',
        is_verified: false,
        attempts: 0
      }
    ],
    batch_waypoints: [],
    delivery_batch_orders: []
  };

  const createMockSupabase = () => ({
    from: (table) => {
      let currentFilter = {};
      const query = {
        select: () => query,
        eq: (field, val) => {
          currentFilter[field] = val;
          return query;
        },
        neq: (field, val) => query,
        in: (field, vals) => query,
        or: (condition) => query,
        order: () => query,
        limit: () => query,
then: (resolve, reject) => {
  const tableData = mockDatabase[table] || [];
  const filteredData = tableData.filter(item =>
    Object.entries(currentFilter).every(([field, value]) => item[field] === value)
  );
  return Promise.resolve({ data: filteredData, error: null }).then(resolve, reject);
},
maybeSingle: async () => {
  const tableData = mockDatabase[table] || [];
  const found = tableData.find(item => {
    for (const k in currentFilter) {
      if (item[k] !== currentFilter[k]) return false;
    }
    return true;
  });
  return { data: found || null, error: null };
},
single: async () => {
  const tableData = mockDatabase[table] || [];
  const found = tableData.find(item =>
    Object.entries(currentFilter).every(([field, value]) => item[field] === value)
  );
  return {
    data: found || null,
    error: found ? null : { message: 'Not found', code: 'PGRST116' }
  };
},
        insert: (data) => {
          const item = Array.isArray(data) ? data[0] : data;
          const created = { id: `id-${Date.now()}`, ...item };
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
        update: (updates) => ({
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
        }),
        delete: () => ({
          eq: () => ({
            then: (resolve) => resolve({ error: null })
          })
        })
      };
      return query;
    },
    auth: {
      getUser: async (token) => {
        if (token === 'admin-token') {
          return { data: { user: { id: 'admin-1', user_metadata: { role: 'admin' }, role: 'admin' } }, error: null };
        }
        if (token === 'courier-token') {
          return { data: { user: { id: 'agent-1', user_metadata: { role: 'delivery_partner' }, role: 'delivery_partner' } }, error: null };
        }
        if (token === 'customer-token') {
          return { data: { user: { id: 'cust-1', user_metadata: { role: 'customer' }, role: 'customer' } }, error: null };
        }
        return { data: { user: null }, error: new Error('Invalid token') };
      }
    }
  });

  return { mockDatabase, mockSupabaseInstance: createMockSupabase() };
});

const supabaseConfig = require('../src/config/supabase');
supabaseConfig.supabase = mockSupabaseInstance;

import request from 'supertest';
import app from '../src/app';

describe('Backend Batch Creation & OTP Hardening Tests', () => {
  describe('POST /api/v1/delivery/batches', () => {
    it('rejects batch creation from non-admin accounts with 403', async () => {
      const res = await request(app)
        .post('/api/v1/delivery/batches')
        .set('Authorization', 'Bearer customer-token')
        .send({ orderIds: ['ORD-101', 'ORD-102'] });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('rejects empty orderIds array with 400', async () => {
      const res = await request(app)
        .post('/api/v1/delivery/batches')
        .set('Authorization', 'Bearer admin-token')
        .send({ orderIds: [] });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('rejects batches exceeding maximum batch limit with 400', async () => {
      const res = await request(app)
        .post('/api/v1/delivery/batches')
        .set('Authorization', 'Bearer admin-token')
        .send({ orderIds: ['ORD-1', 'ORD-2', 'ORD-3', 'ORD-4', 'ORD-5', 'ORD-6'] });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('exceeds the maximum allowed batch limit');
    });
  });

  describe('PATCH /api/v1/delivery/batches/:id/status (Completion Protection)', () => {
    it('BLOCKS completing a batch when member orders have not been verified via OTP', async () => {
      const res = await request(app)
        .patch('/api/v1/delivery/batches/B-1111/status')
        .set('Authorization', 'Bearer admin-token')
        .send({ status: 'Completed' });

      // Must be rejected with 400 because member orders are not DELIVERED
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('have not satisfied OTP verification');
    });
  });

  describe('OTP Security & Verification', () => {
    it('forbids delivery partners from viewing customer secret OTP with 403', async () => {
      const res = await request(app)
        .get('/api/v1/delivery/orders/ORD-101/otp')
        .set('Authorization', 'Bearer courier-token');

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('allows customer recipient to retrieve their secret delivery OTP', async () => {
      const res = await request(app)
        .get('/api/v1/delivery/orders/ORD-101/otp')
        .set('Authorization', 'Bearer customer-token');
         

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.otp).toBeDefined();
    });
  });
});
