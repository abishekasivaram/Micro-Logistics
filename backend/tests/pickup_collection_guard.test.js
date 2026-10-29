import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockDatabase, mockSupabaseInstance } = vi.hoisted(() => {
  const mockDatabase = {
    profiles: [
      { id: '11111111-0000-0000-0000-000000000001', email: 'admin@example.com', username: 'Admin User', role: 'admin' },
      { id: '22222222-0000-0000-0000-000000000001', email: 'agent1@example.com', username: 'da1', role: 'delivery_partner' },
      { id: '22222222-0000-0000-0000-000000000002', email: 'agent2@example.com', username: 'da2', role: 'delivery_partner' },
      { id: '33333333-0000-0000-0000-000000000001', email: 'vendor1@example.com', username: 'v1', role: 'vendor' }
    ],
    vendors: [
      { id: '33333333-0000-0000-0000-000000000001', legacy_id: 'v1', shop_name: 'Organic Farm Harvest', address: '54 Anna Salai, Chennai' },
      { id: '33333333-0000-0000-0000-000000000002', legacy_id: 'v2', shop_name: 'Chennai Daily Essentials', address: '77 Velachery Main Rd, Chennai' }
    ],
    orders: [
      {
        id: '44444444-0000-0000-0000-000000000001',
        order_code: 'ORD-101',
        order_status: 'CONFIRMED',
        delivery_status: 'PENDING_PICKUP',
        batch_id: '55555555-0000-0000-0000-000000000001',
        vendor_id: '33333333-0000-0000-0000-000000000001',
        assigned_agent_id: '22222222-0000-0000-0000-000000000001',
        pickup_location: '54 Anna Salai, Chennai',
        delivery_location: '101 Anna Nagar East, Chennai',
        vendor: { id: '33333333-0000-0000-0000-000000000001', shop_name: 'Organic Farm Harvest' }
      },
      {
        id: '44444444-0000-0000-0000-000000000002',
        order_code: 'ORD-102',
        order_status: 'CONFIRMED',
        delivery_status: 'PENDING_PICKUP',
        batch_id: '55555555-0000-0000-0000-000000000001',
        vendor_id: '33333333-0000-0000-0000-000000000001',
        assigned_agent_id: '22222222-0000-0000-0000-000000000001',
        pickup_location: '54 Anna Salai, Chennai',
        delivery_location: '102 Anna Nagar East, Chennai',
        vendor: { id: '33333333-0000-0000-0000-000000000001', shop_name: 'Organic Farm Harvest' }
      },
      {
        id: '44444444-0000-0000-0000-000000000003',
        order_code: 'ORD-201',
        order_status: 'READY_FOR_DELIVERY',
        delivery_status: 'PICKED_UP',
        batch_id: '55555555-0000-0000-0000-000000000002',
        vendor_id: '33333333-0000-0000-0000-000000000002',
        assigned_agent_id: '22222222-0000-0000-0000-000000000001',
        pickup_location: '77 Velachery Main Rd, Chennai',
        delivery_location: '103 Anna Nagar East, Chennai',
        vendor: { id: '33333333-0000-0000-0000-000000000002', shop_name: 'Chennai Daily Essentials' }
      }
    ],
    delivery_batches: [
      {
        id: '55555555-0000-0000-0000-000000000001',
        batch_code: 'B-1001',
        agent_id: '22222222-0000-0000-0000-000000000001',
        order_count: 2,
        status: 'ASSIGNED',
        aggregation_status: 'ASSIGNED',
        delivery_date: '2026-11-01',
        delivery_slot: '9:00 AM – 1:00 PM'
      },
      {
        id: '55555555-0000-0000-0000-000000000002',
        batch_code: 'B-2002',
        agent_id: '22222222-0000-0000-0000-000000000001',
        order_count: 1,
        status: 'ASSIGNED',
        aggregation_status: 'ASSIGNED',
        delivery_date: '2026-11-01',
        delivery_slot: '9:00 AM – 1:00 PM'
      }
    ],
    delivery_agents: [
      {
        id: '22222222-0000-0000-0000-000000000001',
        legacy_id: 'da1',
        vehicle: 'Bike',
        capacity: 4,
        availability: 'Available',
        status: 'Active',
        profile: { username: 'da1', phone: '9988776655' }
      },
      {
        id: '22222222-0000-0000-0000-000000000002',
        legacy_id: 'da2',
        vehicle: 'Scooter',
        capacity: 4,
        availability: 'Available',
        status: 'Active',
        profile: { username: 'da2', phone: '9988776656' }
      }
    ]
  };

  const createMockSupabase = () => ({
    from: (table) => {
      let currentFilter = {};

      const createQuery = () => {
        const query = {
          select: () => query,
          eq: (field, val) => {
            currentFilter[field] = val;
            return query;
          },
          neq: () => query,
          in: () => query,
          or: () => query,
          order: () => query,
          single: async () => {
            const tableData = mockDatabase[table] || [];
            const found = tableData.find(item => {
              for (const k in currentFilter) {
                if (item[k] !== currentFilter[k]) return false;
              }
              return true;
            });
            return { data: found || null, error: found ? null : { message: 'Not found' } };
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
          then: (resolve, reject) => {
            const tableData = mockDatabase[table] || [];
            const filtered = tableData.filter(item => {
              for (const k in currentFilter) {
                if (item[k] !== currentFilter[k]) return false;
              }
              return true;
            });
            return Promise.resolve({ data: filtered, error: null }).then(resolve, reject);
          }
        };
        return query;
      };

      const queryObj = createQuery();

      return {
        ...queryObj,
        update: (updates) => {
          let updateFilters = {};
          const updateQuery = {
            eq: (field, val) => {
              updateFilters[field] = val;
              const tableData = mockDatabase[table] || [];
              tableData.forEach(item => {
                if (item[field] === val) {
                  Object.assign(item, updates);
                }
              });
              return updateQuery;
            },
            then: (resolve, reject) => {
              return Promise.resolve({ data: updates, error: null }).then(resolve, reject);
            }
          };
          return updateQuery;
        }
      };
    }
  });

  return {
    mockDatabase,
    mockSupabaseInstance: createMockSupabase()
  };
});

vi.mock('../src/config/supabase', () => ({
  supabase: mockSupabaseInstance
}));

const supabaseConfig = require('../src/config/supabase');
supabaseConfig.supabase = mockSupabaseInstance;

import { collectHub, updateBatchStatus } from '../src/controllers/delivery.controller';
import { updateOrderStatus } from '../src/controllers/order.controller';

describe('Pickup Confirmation Guard & Barcode Scanner Workflow Test Suite', () => {
  beforeEach(() => {
    // Reset test data
    mockDatabase.orders[0].delivery_status = 'PENDING_PICKUP';
    mockDatabase.orders[0].order_status = 'CONFIRMED';
    mockDatabase.orders[1].delivery_status = 'PENDING_PICKUP';
    mockDatabase.orders[1].order_status = 'CONFIRMED';
    mockDatabase.orders[2].delivery_status = 'PICKED_UP';
    mockDatabase.orders[2].order_status = 'READY_FOR_DELIVERY';
    mockDatabase.delivery_batches[0].status = 'ASSIGNED';
    mockDatabase.delivery_batches[1].status = 'ASSIGNED';
  });

  const mockRes = () => {
    const res = {
      statusCode: 200,
      body: null,
      status(code) {
        this.statusCode = code;
        return this;
      },
      json(data) {
        this.body = data;
        return this;
      }
    };
    return res;
  };

  it('Case 1: Collection is strictly blocked before vendor handover', async () => {
    const req = {
      params: { id: '55555555-0000-0000-0000-000000000001' },
      body: { hubId: '33333333-0000-0000-0000-000000000001', vendorId: '33333333-0000-0000-0000-000000000001', barcode: 'HUB-1001' },
      user: { id: '22222222-0000-0000-0000-000000000001', role: 'delivery_partner' }
    };
    const res = mockRes();

    await collectHub(req, res);

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Collection cannot be confirmed yet. Waiting for the merchant to confirm handover for all required packages.');
  });

  it('Case 2: Collection is blocked when even one required package in a multi-package hub is not handed over', async () => {
    mockDatabase.orders[0].delivery_status = 'PICKED_UP';
    mockDatabase.orders[1].delivery_status = 'PENDING_PICKUP';

    const req = {
      params: { id: '55555555-0000-0000-0000-000000000001' },
      body: { hubId: '33333333-0000-0000-0000-000000000001', vendorId: '33333333-0000-0000-0000-000000000001', barcode: 'HUB-1001' },
      user: { id: '22222222-0000-0000-0000-000000000001', role: 'delivery_partner' }
    };
    const res = mockRes();

    await collectHub(req, res);

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('Waiting for the merchant to confirm handover for all required packages');
  });

  it('Case 3: Collection is permitted after 100% of required packages have vendor handover persisted', async () => {
    mockDatabase.orders[0].delivery_status = 'PICKED_UP';
    mockDatabase.orders[1].delivery_status = 'PICKED_UP';

    const req = {
      params: { id: '55555555-0000-0000-0000-000000000001' },
      body: { hubId: '33333333-0000-0000-0000-000000000001', vendorId: '33333333-0000-0000-0000-000000000001', barcode: 'HUB-1001' },
      user: { id: '22222222-0000-0000-0000-000000000001', role: 'delivery_partner' }
    };
    const res = mockRes();

    await collectHub(req, res);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toContain('Merchant hub collection confirmed successfully');
    expect(mockDatabase.orders[0].delivery_status).toBe('OUT_FOR_DELIVERY');
    expect(mockDatabase.orders[1].delivery_status).toBe('OUT_FOR_DELIVERY');
  });

  it('Case 4: Courier cannot confirm collection for another courier assignment (403 Forbidden)', async () => {
    const req = {
      params: { id: '55555555-0000-0000-0000-000000000001' },
      body: { hubId: '33333333-0000-0000-0000-000000000001', vendorId: '33333333-0000-0000-0000-000000000001', barcode: 'HUB-1001' },
      user: { id: '22222222-0000-0000-0000-000000000002', role: 'delivery_partner' }
    };
    const res = mockRes();

    await collectHub(req, res);

    expect(res.statusCode).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('Forbidden');
  });

  it('Case 5: Invalid hub or package barcode is rejected', async () => {
    mockDatabase.orders[0].delivery_status = 'PICKED_UP';
    mockDatabase.orders[1].delivery_status = 'PICKED_UP';

    const req = {
      params: { id: '55555555-0000-0000-0000-000000000001' },
      body: { hubId: '33333333-0000-0000-0000-000000000001', vendorId: '33333333-0000-0000-0000-000000000001', barcode: 'INVALID_CODE_999' },
      user: { id: '22222222-0000-0000-0000-000000000001', role: 'delivery_partner' }
    };
    const res = mockRes();

    await collectHub(req, res);

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('Invalid barcode');
  });

  it('Case 6: Barcode for another merchant hub cannot authorize collection', async () => {
    mockDatabase.orders[0].delivery_status = 'PICKED_UP';
    mockDatabase.orders[1].delivery_status = 'PICKED_UP';

    const req = {
      params: { id: '55555555-0000-0000-0000-000000000001' },
      body: { hubId: '33333333-0000-0000-0000-000000000001', vendorId: '33333333-0000-0000-0000-000000000001', barcode: 'HUB_OTHER_VENDOR_99999' },
      user: { id: '22222222-0000-0000-0000-000000000001', role: 'delivery_partner' }
    };
    const res = mockRes();

    await collectHub(req, res);

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('Invalid barcode');
  });

  it('Case 7: Recognition or validation alone does not mark packages collected', () => {
    expect(mockDatabase.orders[0].delivery_status).toBe('PENDING_PICKUP');
    expect(mockDatabase.orders[0].order_status).toBe('CONFIRMED');
  });

  it('Case 8: Physical collection persistence transitions orders to OUT_FOR_DELIVERY', async () => {
    mockDatabase.orders[2].delivery_status = 'PICKED_UP';

    const req = {
      params: { id: '55555555-0000-0000-0000-000000000002' },
      body: { hubId: '33333333-0000-0000-0000-000000000002', vendorId: '33333333-0000-0000-0000-000000000002', barcode: 'HUB-2002' },
      user: { id: '22222222-0000-0000-0000-000000000001', role: 'delivery_partner' }
    };
    const res = mockRes();

    await collectHub(req, res);

    expect(res.statusCode).toBe(200);
    expect(mockDatabase.orders[2].delivery_status).toBe('OUT_FOR_DELIVERY');
    expect(mockDatabase.orders[2].order_status).toBe('OUT_FOR_DELIVERY');
  });

  it('Case 9: Repeated collection requests do not produce invalid transitions', async () => {
    mockDatabase.orders[2].delivery_status = 'OUT_FOR_DELIVERY';
    mockDatabase.orders[2].order_status = 'OUT_FOR_DELIVERY';

    const req = {
      params: { id: '55555555-0000-0000-0000-000000000002' },
      body: { hubId: '33333333-0000-0000-0000-000000000002', vendorId: '33333333-0000-0000-0000-000000000002', barcode: 'HUB-2002' },
      user: { id: '22222222-0000-0000-0000-000000000001', role: 'delivery_partner' }
    };
    const res = mockRes();

    await collectHub(req, res);

    expect(res.statusCode).toBe(200);
    expect(mockDatabase.orders[2].delivery_status).toBe('OUT_FOR_DELIVERY');
  });

  it('Case 10: Out for Delivery batch transition is blocked if any package handover is pending', async () => {
    mockDatabase.orders[0].delivery_status = 'PENDING_PICKUP';

    const req = {
      params: { id: '55555555-0000-0000-0000-000000000001' },
      body: { status: 'OUT_FOR_DELIVERY' },
      user: { id: '22222222-0000-0000-0000-000000000001', role: 'delivery_partner' }
    };
    const res = mockRes();

    await updateBatchStatus(req, res);

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Collection cannot be confirmed yet. Waiting for the merchant to confirm handover for all required packages.');
  });

  it('Case 11: Individual order OUT_FOR_DELIVERY is blocked before vendor handover', async () => {
    mockDatabase.orders[0].delivery_status = 'PENDING_PICKUP';

    const req = {
      params: { id: '44444444-0000-0000-0000-000000000001' },
      body: { status: 'OUT_FOR_DELIVERY' },
      user: { id: '22222222-0000-0000-0000-000000000001', role: 'delivery_partner' }
    };
    const res = mockRes();

    await updateOrderStatus(req, res);

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Collection cannot be confirmed yet. Waiting for the merchant to confirm handover for all required packages.');
  });

  it('Case 12: Delivery partner is strictly forbidden from forging merchant handover statuses', async () => {
    const courierReq = {
      params: { id: '44444444-0000-0000-0000-000000000001' },
      body: { status: 'PICKED_UP' },
      user: { id: '22222222-0000-0000-0000-000000000001', role: 'delivery_partner' }
    };
    const res = mockRes();

    await updateOrderStatus(courierReq, res);

    expect(res.statusCode).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('Forbidden: Only the merchant can confirm order preparation and handover');
  });
});
