
import { describe, it, expect } from 'vitest';
import {
  areTimeSlotsCompatible,
  extractArea,
  normalizeLocality,
  areLocationsCompatible,
  findSuitableOrderGroups
} from '../src/utils/aggregationUtils.js';

import {
  findCompatibleBatches,
  findBestAvailableAgent,
  MIN_BATCH_SIZE,
  MAX_BATCH_SIZE
} from '../src/services/aggregation.service';

describe('Smart Order Aggregation Logic', () => {
  describe('areTimeSlotsCompatible', () => {
    it('returns true for identical time slots', () => {
      expect(areTimeSlotsCompatible('9:00 AM – 1:00 PM', '9:00 AM – 1:00 PM')).toBe(true);
    });

    it('returns true for overlapping time slots', () => {
      expect(areTimeSlotsCompatible('7:00 AM – 11:00 AM', '9:00 AM – 1:00 PM')).toBe(true);
      expect(areTimeSlotsCompatible('9:00 AM – 1:00 PM', '12:00 PM – 4:00 PM')).toBe(true);
    });

    it('returns false for non-overlapping time slots', () => {
      expect(areTimeSlotsCompatible('7:00 AM – 11:00 AM', '3:00 PM – 7:00 PM')).toBe(false);
      expect(areTimeSlotsCompatible(null, '9:00 AM – 1:00 PM')).toBe(false);
      expect(areTimeSlotsCompatible('', '')).toBe(false);
    });
  });

  describe('Location and proximity validation', () => {
    it('normalizes locality names consistently', () => {
      expect(normalizeLocality('Anna Nagar East')).toBe('anna nagar east');
      expect(normalizeLocality('Anna Nagar')).toBe('anna nagar');
    });
    it('checks location compatibility', () => {
      expect(areLocationsCompatible(
        { pickup_location: 'Anna Nagar', delivery_location: 'Kilpauk' },
        { pickup_location: 'Anna Nagar East', delivery_location: 'Kilpauk' }
      )).toBe(true);
    });
  });

  describe('Suitable order grouping', () => {
    it('does not create singleton batches by default', () => {
      const orders = [{
        id: 'o1',
        order_status: 'READY_FOR_DELIVERY',
        delivery_date: '2026-11-01',
        delivery_time_slot: '9:00 AM – 1:00 PM',
        deliveryArea: 'T. Nagar'
      }];

      expect(findSuitableOrderGroups(orders, [])).toHaveLength(0);
    });

    it('allows singleton batches when explicitly enabled', () => {
      const orders = [{
        id: 'o1',
        order_status: 'READY_FOR_DELIVERY',
        delivery_date: '2026-11-01',
        delivery_time_slot: '9:00 AM – 1:00 PM',
        deliveryArea: 'T. Nagar'
      }];

      expect(findSuitableOrderGroups(orders, [], {
        allowSingleOrderBatches: true
      })).toHaveLength(1);
    });
  });
});

describe('AI-Powered Automatic Order Aggregation Engine', () => {
  it('exposes the configured batch size limits', () => {
    expect(MIN_BATCH_SIZE).toBeGreaterThanOrEqual(1);
    expect(MAX_BATCH_SIZE).toBeGreaterThanOrEqual(MIN_BATCH_SIZE);
  });

  it('groups compatible orders without exceeding the maximum batch size', () => {
    const orders = Array.from({ length: 5 }, (_, i) => ({
      id: `o${i + 1}`,
      order_code: `ORD-${i + 1}`,
      order_status: 'READY_FOR_DELIVERY',
      delivery_date: '2026-10-28',
      delivery_time_slot: '9:00 AM – 1:00 PM',
      pickup_location: 'Anna Nagar',
      delivery_location: 'Anna Nagar'
    }));

    const batches = findCompatibleBatches(orders, 1, MAX_BATCH_SIZE);

    expect(batches.length).toBeGreaterThanOrEqual(1);
    expect(batches.every(batch => batch.orderCount <= MAX_BATCH_SIZE)).toBe(true);
  });

  it('separates orders with incompatible delivery time slots', () => {
    const orders = [
      { id: 'o1', order_status: 'READY_FOR_DELIVERY', delivery_date: '2026-10-28', delivery_time_slot: '7:00 AM – 11:00 AM', pickup_location: 'Anna Nagar', delivery_location: 'Anna Nagar' },
      { id: 'o2', order_status: 'READY_FOR_DELIVERY', delivery_date: '2026-10-28', delivery_time_slot: '7:00 AM – 11:00 AM', pickup_location: 'Anna Nagar', delivery_location: 'Anna Nagar' },
      { id: 'o3', order_status: 'READY_FOR_DELIVERY', delivery_date: '2026-10-28', delivery_time_slot: '6:00 PM – 10:00 PM', pickup_location: 'Anna Nagar', delivery_location: 'Anna Nagar' },
      { id: 'o4', order_status: 'READY_FOR_DELIVERY', delivery_date: '2026-10-28', delivery_time_slot: '6:00 PM – 10:00 PM', pickup_location: 'Anna Nagar', delivery_location: 'Anna Nagar' }
    ];

    const batches = findCompatibleBatches(orders, 1, MAX_BATCH_SIZE);

    expect(batches).toHaveLength(2);
    expect(batches[0].orderCount).toBe(2);
    expect(batches[1].orderCount).toBe(2);
  });

  describe('Automated delivery agent selection', () => {
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

    it('selects the best available nearby agent', () => {
      const selected = findBestAvailableAgent(batch, agents);
      expect(selected).not.toBeNull();
      expect(selected.id).toBe('a2');
    });

    it('returns null when no agents are available', () => {
      expect(findBestAvailableAgent(batch, [
        { id: 'a1', current_area: 'Anna Nagar', status: 'Busy' },
        { id: 'a2', current_area: 'Kilpauk', status: 'Offline' }
      ])).toBeNull();
    });
  });
});
