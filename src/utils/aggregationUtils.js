// Utility functions for Smart Order Aggregation and Logistics Calculations

export const TIME_SLOTS = [
  '7:00 AM – 11:00 AM',
  '9:00 AM – 1:00 PM',
  '12:00 PM – 4:00 PM',
  '3:00 PM – 7:00 PM',
  '6:00 PM – 10:00 PM'
];

// Helper to format internal status codes into human-readable labels
export const getHumanReadableStatus = (status) => {
  if (!status) return 'Unknown';
  switch (status.toUpperCase()) {
    case 'PLACED': return 'Order Placed';
    case 'CONFIRMED': return 'Order Confirmed';
    case 'PREPARING': return 'Preparing';
    case 'READY_FOR_DELIVERY': return 'Ready for Delivery';
    case 'ASSIGNED': return 'Assigned for Delivery';
    case 'OUT_FOR_DELIVERY': return 'Out for Delivery';
    case 'DELIVERED': return 'Delivered';
    case 'CANCELLED': return 'Cancelled';
    default: return status.replace(/_/g, ' ');
  }
};

// Map status to CSS badge classes
export const getStatusBadgeClass = (status) => {
  if (!status) return 'badge-secondary';
  const s = status.toUpperCase();
  if (s === 'DELIVERED' || s === 'COMPLETED' || s === 'ACTIVE') return 'badge-success';
  if (s === 'READY_FOR_DELIVERY' || s === 'READY' || s === 'BATCH CREATED') return 'badge-primary';
  if (s === 'OUT_FOR_DELIVERY' || s === 'PICKUP IN PROGRESS' || s === 'ASSIGNED') return 'badge-warning';
  if (s === 'PREPARING' || s === 'CONFIRMED' || s === 'WAITING FOR AGGREGATION') return 'badge-info';
  if (s === 'CANCELLED' || s === 'SUSPENDED' || s === 'OFFLINE') return 'badge-danger';
  return 'badge-secondary';
};

// Check if two time slots have an overlapping delivery window
export const areTimeSlotsCompatible = (slot1, slot2) => {
  if (!slot1 || !slot2) return false;
  if (slot1 === slot2) return true;

  // Specific overlapping window definitions:
  // 7-11 AM + 9 AM-1 PM -> Overlaps 9 AM - 11 AM
  // 9 AM-1 PM + 12 PM-4 PM -> Overlaps 12 PM - 1 PM
  // 3 PM-7 PM + 6 PM-10 PM -> Overlaps 6 PM - 7 PM
  const s1 = slot1.trim();
  const s2 = slot2.trim();

  const pairs = [
    ['7:00 AM – 11:00 AM', '9:00 AM – 1:00 PM'],
    ['9:00 AM – 1:00 PM', '12:00 PM – 4:00 PM'],
    ['3:00 PM – 7:00 PM', '6:00 PM – 10:00 PM']
  ];

  return pairs.some(([a, b]) => (s1 === a && s2 === b) || (s1 === b && s2 === a));
};

// Extract main area name from address string
export const extractArea = (locationString) => {
  if (!locationString) return 'Central Zone';
  const parts = locationString.split(',');
  if (parts.length >= 2) {
    return parts[parts.length - 2].trim();
  }
  return parts[0].trim();
};

/**
 * Smart Order Aggregation Function
 * Evaluates orders ready or pending aggregation and groups compatible ones.
 * Isolated utility so it can be easily replaced by a real backend optimization model later.
 */
export const findSuitableOrderGroups = (orders = [], agents = [], config = {}) => {
  const maxOrdersPerBatch = config.maxOrdersPerBatch || 4;

  // Filter orders eligible for aggregation:
  // Status: READY_FOR_DELIVERY, PREPARING, or PLACED
  // Not already grouped or batched
  const eligibleOrders = orders.filter(o => {
    const isStatusEligible = ['READY_FOR_DELIVERY', 'PREPARING', 'PLACED', 'CONFIRMED'].includes(o.status || o.orderStatus);
    const isNotBatched = !o.batchId && (o.aggregationStatus === 'Waiting for Aggregation' || o.aggregationStatus === 'Suitable for Grouping' || !o.aggregationStatus);
    return isStatusEligible && isNotBatched;
  });

  if (eligibleOrders.length === 0) return [];

  // Group by delivery date and compatible time slots
  const candidatesByDate = {};
  eligibleOrders.forEach(o => {
    const dateKey = o.deliveryDate || new Date().toISOString().split('T')[0];
    if (!candidatesByDate[dateKey]) candidatesByDate[dateKey] = [];
    candidatesByDate[dateKey].push(o);
  });

  const suggestedGroups = [];
  let groupCounter = 1;

  Object.keys(candidatesByDate).forEach(dateKey => {
    const dateOrders = candidatesByDate[dateKey];
    const usedOrderIds = new Set();

    for (let i = 0; i < dateOrders.length; i++) {
      const primary = dateOrders[i];
      if (usedOrderIds.has(primary.id)) continue;

      const groupOrders = [primary];
      usedOrderIds.add(primary.id);

      for (let j = i + 1; j < dateOrders.length; j++) {
        if (groupOrders.length >= maxOrdersPerBatch) break;
        const target = dateOrders[j];
        if (usedOrderIds.has(target.id)) continue;

        // Check time slot compatibility
        const timeCompat = areTimeSlotsCompatible(primary.deliveryTimeSlot, target.deliveryTimeSlot);
        
        // Area proximity check
        const primaryArea = extractArea(primary.deliveryLocation || primary.pickupLocation);
        const targetArea = extractArea(target.deliveryLocation || target.pickupLocation);
        const isNearby = primaryArea === targetArea || primary.deliveryTimeSlot === target.deliveryTimeSlot;

        if (timeCompat && isNearby) {
          groupOrders.push(target);
          usedOrderIds.add(target.id);
        }
      }

      // Compute compatibility score & factors
      let score = 50; // base score
      const reasons = [];
      
      // 1. Delivery Date match
      score += 15;
      reasons.push('✓ Same delivery date');

      // 2. Time slot overlap
      const allSameSlot = groupOrders.every(o => o.deliveryTimeSlot === primary.deliveryTimeSlot);
      if (allSameSlot) {
        score += 20;
        reasons.push('✓ Exact delivery time window match');
      } else {
        score += 12;
        reasons.push('✓ Overlapping delivery window');
      }

      // 3. Pickup/Delivery Proximity
      const sellerNames = Array.from(new Set(groupOrders.map(o => o.vendorName || o.sellerName || 'Local Seller')));
      const pickupAreas = Array.from(new Set(groupOrders.map(o => extractArea(o.pickupLocation))));
      const dropAreas = Array.from(new Set(groupOrders.map(o => extractArea(o.deliveryLocation))));

      if (pickupAreas.length === 1) {
        score += 10;
        reasons.push('✓ Same seller pickup hub');
      } else {
        reasons.push('✓ Nearby pickup locations');
      }

      if (dropAreas.length === 1) {
        score += 10;
        reasons.push('✓ Same delivery neighborhood');
      } else {
        reasons.push('✓ Nearby customer delivery locations');
      }

      // 4. Order Readiness
      const allReady = groupOrders.every(o => (o.status === 'READY_FOR_DELIVERY' || o.orderStatus === 'READY_FOR_DELIVERY'));
      if (allReady) {
        score += 10;
        reasons.push('✓ All orders packaged and ready for pickup');
      } else {
        reasons.push('✓ Orders currently preparing');
      }

      // 5. Delivery agent capacity & availability
      const availableAgents = agents.filter(a => a.status === 'Available' || a.availability === 'Available');
      if (availableAgents.length > 0) {
        score += 5;
        reasons.push('✓ Available delivery agent capacity');
      } else {
        score -= 10;
        reasons.push('⚠️ Limited agent availability in area');
      }

      // Cap score between 60% and 98%
      const finalScore = Math.min(98, Math.max(60, score));

      // Estimated metrics
      const estimatedDistance = parseFloat((2.5 + groupOrders.length * 1.2).toFixed(1)); // km
      const estimatedTime = Math.round(15 + estimatedDistance * 6); // mins

      suggestedGroups.push({
        id: `SUG-B${String(groupCounter++).padStart(3, '0')}`,
        recommendationLabel: 'Mock Aggregation Recommendation',
        orderIds: groupOrders.map(o => o.id),
        orders: groupOrders,
        sellerIds: Array.from(new Set(groupOrders.map(o => o.vendorId || o.sellerId))),
        sellerNames: sellerNames,
        pickupArea: pickupAreas.join(', '),
        deliveryArea: dropAreas.join(', '),
        deliveryDate: primary.deliveryDate || dateKey,
        deliveryTimeSlot: primary.deliveryTimeSlot,
        orderCount: groupOrders.length,
        compatibilityScore: finalScore,
        estimatedDistance: estimatedDistance,
        estimatedTime: estimatedTime,
        reasons: reasons
      });
    }
  });

  return suggestedGroups;
};
