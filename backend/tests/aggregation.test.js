import { describe, it, expect } from 'vitest';
import {
  areTimeSlotsCompatible,
  extractArea,
  normalizeLocality,
  areLocationsCompatible,
  findSuitableOrderGroups
} from '../src/utils/aggregationUtils.js';

describe('Smart Order Aggregation Logic', () => {
  describe('areTimeSlotsCompatible', () => {
    it('returns true for identical time slots', () => {
      expect(areTimeSlotsCompatible('9:00 AM – 1:00 PM', '9:00 AM – 1:00 PM')).toBe(true);
    });

    it('returns true for defined overlapping adjacent windows', () => {
      expect(areTimeSlotsCompatible('7:00 AM – 11:00 AM', '9:00 AM – 1:00 PM')).toBe(true);
      expect(areTimeSlotsCompatible('9:00 AM – 1:00 PM', '12:00 PM – 4:00 PM')).toBe(true);
      expect(areTimeSlotsCompatible('3:00 PM – 7:00 PM', '6:00 PM – 10:00 PM')).toBe(true);
    });

    it('returns false for non-overlapping windows', () => {
      expect(areTimeSlotsCompatible('7:00 AM – 11:00 AM', '3:00 PM – 7:00 PM')).toBe(false);
      expect(areTimeSlotsCompatible('9:00 AM – 1:00 PM', '6:00 PM – 10:00 PM')).toBe(false);
    });

    it('returns false for null, empty or missing slots', () => {
      expect(areTimeSlotsCompatible(null, '9:00 AM – 1:00 PM')).toBe(false);
      expect(areTimeSlotsCompatible('9:00 AM – 1:00 PM', undefined)).toBe(false);
      expect(areTimeSlotsCompatible('', '')).toBe(false);
    });
  });

  describe('Location & Proximity Validation', () => {
    it('extracts area from structured deliveryArea field', () => {
      expect(extractArea({ deliveryArea: 'T. Nagar' })).toBe('T. Nagar');
    });

    it('extracts area from comma-delimited address string', () => {
      expect(extractArea('14/2 Anna Salai, T. Nagar, Chennai 600017')).toBe('T. Nagar');
    });

    it('returns true when orders are in the same normalized locality', () => {
      const o1 = { deliveryArea: 'T. Nagar' };
      const o2 = { delivery_location: '45 Usman Road, T Nagar, Chennai 600017' };
      expect(areLocationsCompatible(o1, o2)).toBe(true);
    });

    it('returns false when orders are in completely different localities', () => {
      const o1 = { deliveryArea: 'T. Nagar' };
      const o2 = { deliveryArea: 'Anna Nagar' };
      expect(areLocationsCompatible(o1, o2)).toBe(false);
    });

    it('fails closed when an order has missing or unknown location', () => {
      const o1 = { deliveryArea: 'T. Nagar' };
      const o2 = { deliveryLocation: '' };
      expect(areLocationsCompatible(o1, o2)).toBe(false);
    });

    it('uses GPS coordinates when available and enforces 3.5 km radius threshold', () => {
      // T. Nagar: 13.0418, 80.2341
      // Nearby (approx 1 km): 13.0450, 80.2380
      // Distant Anna Nagar: 13.0850, 80.2100 (approx 5.5 km away)
      const tNagar1 = { lat: 13.0418, lng: 80.2341 };
      const tNagarNearby = { lat: 13.0450, lng: 80.2380 };
      const annaNagarFar = { lat: 13.0850, lng: 80.2100 };

      expect(areLocationsCompatible(tNagar1, tNagarNearby)).toBe(true);
      expect(areLocationsCompatible(tNagar1, annaNagarFar)).toBe(false);
    });
  });

  describe('findSuitableOrderGroups Aggregation Engine', () => {
    const agents = [{ id: 'da-01', availability: 'Available', status: 'Active' }];

    it('CRITICAL: Does NOT group orders with identical time slots if locations are different', () => {
      const orders = [
        {
          id: 'ord-01',
          order_status: 'READY_FOR_DELIVERY',
          delivery_date: '2026-11-01',
          delivery_time_slot: '9:00 AM – 1:00 PM',
          deliveryArea: 'T. Nagar'
        },
        {
          id: 'ord-02',
          order_status: 'READY_FOR_DELIVERY',
          delivery_date: '2026-11-01',
          delivery_time_slot: '9:00 AM – 1:00 PM',
          deliveryArea: 'Anna Nagar' // 15 km away in a different zone
        }
      ];

      const groups = findSuitableOrderGroups(orders, agents);
      // Because locations do not match, they must NOT be bundled together into a 2-order batch
      expect(groups).toHaveLength(0);
    });

    it('Groups orders that match BOTH location and compatible time slot', () => {
      const orders = [
        {
          id: 'ord-01',
          order_status: 'READY_FOR_DELIVERY',
          delivery_date: '2026-11-01',
          delivery_time_slot: '9:00 AM – 1:00 PM',
          deliveryArea: 'T. Nagar',
          pickup_location: 'Vendor A, T. Nagar'
        },
        {
          id: 'ord-02',
          order_status: 'PREPARING',
          delivery_date: '2026-11-01',
          delivery_time_slot: '9:00 AM – 1:00 PM',
          deliveryArea: 'T. Nagar',
          pickup_location: 'Vendor B, T. Nagar'
        }
      ];

      const groups = findSuitableOrderGroups(orders, agents);
      expect(groups).toHaveLength(1);
      expect(groups[0].orderCount).toBe(2);
      expect(groups[0].orderIds).toEqual(['ord-01', 'ord-02']);
      expect(groups[0].isEstimated).toBe(true);
      expect(groups[0].compatibilityScore).toBeGreaterThanOrEqual(60);
    });

    it('Does NOT group orders on different delivery dates', () => {
      const orders = [
        {
          id: 'ord-01',
          order_status: 'READY_FOR_DELIVERY',
          delivery_date: '2026-11-01',
          delivery_time_slot: '9:00 AM – 1:00 PM',
          deliveryArea: 'T. Nagar'
        },
        {
          id: 'ord-02',
          order_status: 'READY_FOR_DELIVERY',
          delivery_date: '2026-11-02', // Next day
          delivery_time_slot: '9:00 AM – 1:00 PM',
          deliveryArea: 'T. Nagar'
        }
      ];

      const groups = findSuitableOrderGroups(orders, agents);
      expect(groups).toHaveLength(0);
    });

    it('Does NOT group orders with incompatible time slots', () => {
      const orders = [
        {
          id: 'ord-01',
          order_status: 'READY_FOR_DELIVERY',
          delivery_date: '2026-11-01',
          delivery_time_slot: '7:00 AM – 11:00 AM',
          deliveryArea: 'T. Nagar'
        },
        {
          id: 'ord-02',
          order_status: 'READY_FOR_DELIVERY',
          delivery_date: '2026-11-01',
          delivery_time_slot: '6:00 PM – 10:00 PM', // Evening
          deliveryArea: 'T. Nagar'
        }
      ];

      const groups = findSuitableOrderGroups(orders, agents);
      expect(groups).toHaveLength(0);
    });

    it('Rejects cancelled, delivered, or already batched orders', () => {
      const orders = [
        {
          id: 'ord-cancelled',
          order_status: 'CANCELLED',
          delivery_date: '2026-11-01',
          delivery_time_slot: '9:00 AM – 1:00 PM',
          deliveryArea: 'T. Nagar'
        },
        {
          id: 'ord-delivered',
          order_status: 'DELIVERED',
          delivery_date: '2026-11-01',
          delivery_time_slot: '9:00 AM – 1:00 PM',
          deliveryArea: 'T. Nagar'
        },
        {
          id: 'ord-batched',
          order_status: 'READY_FOR_DELIVERY',
          batch_id: 'batch-existing-uuid',
          delivery_date: '2026-11-01',
          delivery_time_slot: '9:00 AM – 1:00 PM',
          deliveryArea: 'T. Nagar'
        },
        {
          id: 'ord-eligible',
          order_status: 'READY_FOR_DELIVERY',
          delivery_date: '2026-11-01',
          delivery_time_slot: '9:00 AM – 1:00 PM',
          deliveryArea: 'T. Nagar'
        }
      ];

      const groups = findSuitableOrderGroups(orders, agents);
      // Only 1 eligible order exists; cannot form a bundle without another eligible order
      expect(groups).toHaveLength(0);
    });

    it('Respects maximum batch size ceiling', () => {
      const orders = [1, 2, 3, 4, 5, 6].map(num => ({
        id: `ord-0${num}`,
        order_status: 'READY_FOR_DELIVERY',
        delivery_date: '2026-11-01',
        delivery_time_slot: '9:00 AM – 1:00 PM',
        deliveryArea: 'T. Nagar'
      }));

      const groups = findSuitableOrderGroups(orders, agents, { maxOrdersPerBatch: 3 });
      expect(groups.length).toBeGreaterThanOrEqual(1);
      groups.forEach(g => {
        expect(g.orderCount).toBeLessThanOrEqual(3);
      });
    });

    it('Prevents duplicate assignment of an order across multiple suggested groups', () => {
      const orders = [1, 2, 3, 4].map(num => ({
        id: `ord-0${num}`,
        order_status: 'READY_FOR_DELIVERY',
        delivery_date: '2026-11-01',
        delivery_time_slot: '9:00 AM – 1:00 PM',
        deliveryArea: 'T. Nagar'
      }));

      const groups = findSuitableOrderGroups(orders, agents, { maxOrdersPerBatch: 2 });
      const assignedIds = groups.flatMap(g => g.orderIds);
      const uniqueIds = new Set(assignedIds);
      expect(assignedIds.length).toBe(uniqueIds.size);
    });

    it('Does not recommend a single-order group as an aggregation opportunity unless configured', () => {
      const orders = [
        {
          id: 'ord-lonely',
          order_status: 'READY_FOR_DELIVERY',
          delivery_date: '2026-11-01',
          delivery_time_slot: '9:00 AM – 1:00 PM',
          deliveryArea: 'T. Nagar'
        }
      ];

      const defaultGroups = findSuitableOrderGroups(orders, agents);
      expect(defaultGroups).toHaveLength(0);

      const allowSingletonGroups = findSuitableOrderGroups(orders, agents, { allowSingleOrderBatches: true });
      expect(allowSingletonGroups).toHaveLength(1);
    });
  });
});
