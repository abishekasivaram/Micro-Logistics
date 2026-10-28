import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { 
  findCompatibleBatches, 
  findBestAvailableAgent, 
  areTimeSlotsCompatible,
  extractArea,
  MIN_BATCH_SIZE,
  MAX_BATCH_SIZE 
} from '../src/services/aggregation.service';

describe('AI-Powered Automatic Order Aggregation Engine', () => {

  it('strictly enforces MAX_BATCH_SIZE of 4 orders and MIN_BATCH_SIZE of 1', () => {
    expect(MIN_BATCH_SIZE).toBe(1);
    expect(MAX_BATCH_SIZE).toBe(4);
  });

  describe('Order Readiness & Eligibility Filtering', () => {
    it('forms a batch with fewer than 4 orders (e.g. 1-3 orders) without waiting for 4', () => {
      const orders = [
        { id: 'o1', order_code: 'ORD-1', order_status: 'READY_FOR_DELIVERY', delivery_date: '2026-10-28', delivery_time_slot: '9:00 AM – 1:00 PM', pickup_location: 'Anna Nagar', delivery_location: 'Anna Nagar' },
        { id: 'o2', order_code: 'ORD-2', order_status: 'READY_FOR_DELIVERY', delivery_date: '2026-10-28', delivery_time_slot: '9:00 AM – 1:00 PM', pickup_location: 'Anna Nagar', delivery_location: 'Anna Nagar' }
      ];

      const batches = findCompatibleBatches(orders, 1, 4);
      expect(batches).toHaveLength(1);
      expect(batches[0].orderCount).toBe(2);
    });

    it('caps batch size to a maximum of 4 orders when 5 compatible orders are present', () => {
      const orders = [
        { id: 'o1', order_code: 'ORD-1', order_status: 'READY_FOR_DELIVERY', delivery_date: '2026-10-28', delivery_time_slot: '9:00 AM – 1:00 PM', pickup_location: 'Anna Nagar East', delivery_location: 'Anna Nagar West' },
        { id: 'o2', order_code: 'ORD-2', order_status: 'READY_FOR_DELIVERY', delivery_date: '2026-10-28', delivery_time_slot: '9:00 AM – 1:00 PM', pickup_location: 'Shenoy Nagar', delivery_location: 'Kilpauk' },
        { id: 'o3', order_code: 'ORD-3', order_status: 'READY_FOR_DELIVERY', delivery_date: '2026-10-28', delivery_time_slot: '9:00 AM – 1:00 PM', pickup_location: 'Anna Nagar', delivery_location: 'Shenoy Nagar' },
        { id: 'o4', order_code: 'ORD-4', order_status: 'READY_FOR_DELIVERY', delivery_date: '2026-10-28', delivery_time_slot: '9:00 AM – 1:00 PM', pickup_location: 'Kilpauk', delivery_location: 'Anna Nagar' },
        { id: 'o5', order_code: 'ORD-5', order_status: 'READY_FOR_DELIVERY', delivery_date: '2026-10-28', delivery_time_slot: '9:00 AM – 1:00 PM', pickup_location: 'Anna Nagar', delivery_location: 'Kilpauk' }
      ];

      const batches = findCompatibleBatches(orders, 1, 4);
      expect(batches.length).toBeGreaterThanOrEqual(1);
      expect(batches[0].orderCount).toBeLessThanOrEqual(4);
      expect(batches[0].orderCount).toBe(4);
    });

    it('separates orders with incompatible delivery time slots into separate batches', () => {
      const orders = [
        // 2 morning orders
        { id: 'o1', order_code: 'ORD-1', order_status: 'READY_FOR_DELIVERY', delivery_date: '2026-10-28', delivery_time_slot: '7:00 AM – 11:00 AM', pickup_location: 'Anna Nagar', delivery_location: 'Anna Nagar' },
        { id: 'o2', order_code: 'ORD-2', order_status: 'READY_FOR_DELIVERY', delivery_date: '2026-10-28', delivery_time_slot: '7:00 AM – 11:00 AM', pickup_location: 'Anna Nagar', delivery_location: 'Anna Nagar' },
        // 2 late evening orders (incompatible with 7 AM - 11 AM)
        { id: 'o3', order_code: 'ORD-3', order_status: 'READY_FOR_DELIVERY', delivery_date: '2026-10-28', delivery_time_slot: '6:00 PM – 10:00 PM', pickup_location: 'Anna Nagar', delivery_location: 'Anna Nagar' },
        { id: 'o4', order_code: 'ORD-4', order_status: 'READY_FOR_DELIVERY', delivery_date: '2026-10-28', delivery_time_slot: '6:00 PM – 10:00 PM', pickup_location: 'Anna Nagar', delivery_location: 'Anna Nagar' }
      ];

      const batches = findCompatibleBatches(orders, 1, 4);
      expect(batches).toHaveLength(2);
      expect(batches[0].orderCount).toBe(2);
      expect(batches[1].orderCount).toBe(2);
    });
  });

  describe('Time Slot and Area Compatibility', () => {
    it('correctly validates overlapping delivery windows', () => {
      expect(areTimeSlotsCompatible('9:00 AM – 1:00 PM', '9:00 AM – 1:00 PM')).toBe(true);
      expect(areTimeSlotsCompatible('7:00 AM – 11:00 AM', '9:00 AM – 1:00 PM')).toBe(true);
      expect(areTimeSlotsCompatible('9:00 AM – 1:00 PM', '12:00 PM – 4:00 PM')).toBe(true);
      expect(areTimeSlotsCompatible('7:00 AM – 11:00 AM', '6:00 PM – 10:00 PM')).toBe(false);
    });

    it('extracts standardized zone names from address strings', () => {
      expect(extractArea('101, 2nd Avenue, Anna Nagar East, Chennai - 600102')).toBe('Anna Nagar');
      expect(extractArea('14/2, 4th Cross St, Mandaveli, Chennai - 600028')).toBe('Mandaveli');
      expect(extractArea('42/1 Besant Avenue, Adyar, Chennai - 600020')).toBe('Adyar');
    });
  });

  describe('Automated Delivery Agent Selection', () => {
    const batch = {
      pickupArea: 'Anna Nagar',
      deliveryArea: 'Kilpauk',
      orderCount: 4
    };

    const agents = [
      { id: 'a1', name: 'Far Away Agent', current_area: 'Velachery', status: 'Available', current_orders: 0 },
      { id: 'a2', name: 'Nearby Agent', current_area: 'Anna Nagar', status: 'Available', current_orders: 1 },
      { id: 'a3', name: 'Busy Agent', current_area: 'Anna Nagar', status: 'Busy', current_orders: 0 }
    ];

    it('selects the best available nearby delivery agent', () => {
      const selected = findBestAvailableAgent(batch, agents);
      expect(selected).not.toBeNull();
      expect(selected.id).toBe('a2');
      expect(selected.name).toBe('Nearby Agent');
    });

    it('returns null when no agents are currently available', () => {
      const busyAgents = [
        { id: 'a1', current_area: 'Anna Nagar', status: 'Busy' },
        { id: 'a2', current_area: 'Kilpauk', status: 'Offline' }
      ];
      const selected = findBestAvailableAgent(batch, busyAgents);
      expect(selected).toBeNull();
    });
  });

  describe('Aggregation Endpoints Security', () => {
    it('requires authentication for POST /api/v1/delivery/aggregate', async () => {
      const app = (await import('../src/app')).default;
      const res = await request(app).post('/api/v1/delivery/aggregate');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('requires authentication for GET /api/v1/delivery/aggregation-overview', async () => {
      const app = (await import('../src/app')).default;
      const res = await request(app).get('/api/v1/delivery/aggregation-overview');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });
});
