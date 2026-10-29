"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findSuitableOrderGroups = exports.areLocationsCompatible = exports.calculateHaversineDistance = exports.extractArea = exports.normalizeLocality = exports.areTimeSlotsCompatible = exports.getStatusBadgeClass = exports.getHumanReadableStatus = exports.TIME_SLOTS = void 0;

const TIME_SLOTS = [
  '7:00 AM – 11:00 AM',
  '9:00 AM – 1:00 PM',
  '12:00 PM – 4:00 PM',
  '3:00 PM – 7:00 PM',
  '6:00 PM – 10:00 PM'
];
exports.TIME_SLOTS = TIME_SLOTS;

const getHumanReadableStatus = (status) => {
  if (!status) return 'Unknown';
  switch (String(status).toUpperCase()) {
    case 'PLACED': return 'Order Placed';
    case 'CONFIRMED': return 'Order Confirmed';
    case 'PREPARING': return 'Preparing';
    case 'READY_FOR_DELIVERY': return 'Ready for Delivery';
    case 'ASSIGNED': return 'Assigned for Delivery';
    case 'OUT_FOR_DELIVERY': return 'Out for Delivery';
    case 'DELIVERED': return 'Delivered';
    case 'CANCELLED': return 'Cancelled';
    default: return String(status).replace(/_/g, ' ');
  }
};
exports.getHumanReadableStatus = getHumanReadableStatus;

const getStatusBadgeClass = (status) => {
  if (!status) return 'badge-secondary';
  const s = String(status).toUpperCase();
  if (s === 'DELIVERED' || s === 'COMPLETED' || s === 'ACTIVE') return 'badge-success';
  if (s === 'READY_FOR_DELIVERY' || s === 'READY' || s === 'BATCH CREATED' || s === 'BATCH_CREATED') return 'badge-primary';
  if (s === 'OUT_FOR_DELIVERY' || s === 'PICKUP IN PROGRESS' || s === 'ASSIGNED') return 'badge-warning';
  if (s === 'PREPARING' || s === 'CONFIRMED' || s === 'WAITING FOR AGGREGATION' || s === 'WAITING_FOR_AGGREGATION') return 'badge-info';
  if (s === 'CANCELLED' || s === 'SUSPENDED' || s === 'OFFLINE') return 'badge-danger';
  return 'badge-secondary';
};
exports.getStatusBadgeClass = getStatusBadgeClass;

const areTimeSlotsCompatible = (slot1, slot2) => {
  if (!slot1 || !slot2) return false;
  const s1 = String(slot1).trim();
  const s2 = String(slot2).trim();
  if (s1 === s2) return true;

  const pairs = [
    ['7:00 AM – 11:00 AM', '9:00 AM – 1:00 PM'],
    ['9:00 AM – 1:00 PM', '12:00 PM – 4:00 PM'],
    ['3:00 PM – 7:00 PM', '6:00 PM – 10:00 PM']
  ];

  return pairs.some(([a, b]) => (s1 === a && s2 === b) || (s1 === b && s2 === a));
};
exports.areTimeSlotsCompatible = areTimeSlotsCompatible;

const normalizeLocality = (str) => {
  if (!str || typeof str !== 'string') return '';
  return str
    .toLowerCase()
    .replace(/[,\.\-\/]/g, ' ')
    .replace(/\b(chennai|tamil nadu|india|\d{6})\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
};
exports.normalizeLocality = normalizeLocality;

const extractArea = (locationOrOrder) => {
  if (!locationOrOrder) return 'Unknown Zone';

  if (typeof locationOrOrder === 'object') {
    if (locationOrOrder.deliveryArea) return String(locationOrOrder.deliveryArea).trim();
    if (locationOrOrder.area) return String(locationOrOrder.area).trim();
    if (locationOrOrder.customer && locationOrOrder.customer.area) return String(locationOrOrder.customer.area).trim();
    const locStr = locationOrOrder.deliveryLocation || locationOrOrder.delivery_location || locationOrOrder.address;
    return extractArea(locStr);
  }

  if (typeof locationOrOrder === 'string') {
    const parts = locationOrOrder.split(',').map(p => p.trim()).filter(Boolean);
    if (parts.length >= 2) {
      const candidate = parts[parts.length - 2];
      const cleaned = candidate.replace(/\b\d{6}\b/, '').trim();
      return cleaned || candidate;
    }
    return parts[0] || 'Unknown Zone';
  }

  return 'Unknown Zone';
};
exports.extractArea = extractArea;

const calculateHaversineDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};
exports.calculateHaversineDistance = calculateHaversineDistance;

const areLocationsCompatible = (order1, order2, maxRadiusKm = 3.5) => {
  if (!order1 || !order2) return false;

  const lat1 = Number(order1.lat || order1.latitude);
  const lng1 = Number(order1.lng || order1.longitude);
  const lat2 = Number(order2.lat || order2.latitude);
  const lng2 = Number(order2.lng || order2.longitude);

  if (!isNaN(lat1) && lat1 !== 0 && !isNaN(lng1) && lng1 !== 0 &&
      !isNaN(lat2) && lat2 !== 0 && !isNaN(lng2) && lng2 !== 0) {
    const dist = calculateHaversineDistance(lat1, lng1, lat2, lng2);
    return dist <= maxRadiusKm;
  }

  const area1 = normalizeLocality(extractArea(order1));
  const area2 = normalizeLocality(extractArea(order2));

  if (!area1 || !area2 || area1 === 'unknown zone' || area2 === 'unknown zone') {
    return false;
  }

  return area1 === area2 || area1.includes(area2) || area2.includes(area1);
};
exports.areLocationsCompatible = areLocationsCompatible;

const findSuitableOrderGroups = (orders = [], agents = [], config = {}) => {
  const maxOrdersPerBatch = config.maxOrdersPerBatch || 4;
  const allowSingleOrderBatches = config.allowSingleOrderBatches === true;

  const eligibleOrders = orders.filter(o => {
    if (!o) return false;
    const rawStatus = String(o.order_status || o.status || o.orderStatus || '').toUpperCase();
    const rawAggStatus = String(o.aggregation_status || o.aggregationStatus || '').toUpperCase();
    const batchId = o.batch_id || o.batchId;

    if (batchId) return false;
    if (['DELIVERED', 'CANCELLED', 'OUT_FOR_DELIVERY'].includes(rawStatus)) return false;
    if (['BATCH_CREATED', 'ASSIGNED', 'COMPLETED'].includes(rawAggStatus)) return false;

    const isStatusEligible = ['READY_FOR_DELIVERY', 'PREPARING', 'PLACED', 'CONFIRMED'].includes(rawStatus);
    const isAggEligible = !rawAggStatus || [
      'WAITING_FOR_AGGREGATION',
      'WAITING FOR AGGREGATION',
      'SUITABLE_FOR_GROUPING',
      'SUITABLE FOR GROUPING',
      'UNASSIGNED'
    ].includes(rawAggStatus);

    return isStatusEligible && isAggEligible;
  });

  if (eligibleOrders.length === 0) return [];

  const candidatesByDate = {};
  eligibleOrders.forEach(o => {
    const rawDate = o.delivery_date || o.deliveryDate;
    if (!rawDate) return;
    const dateKey = String(rawDate).split('T')[0];
    if (!candidatesByDate[dateKey]) candidatesByDate[dateKey] = [];
    candidatesByDate[dateKey].push(o);
  });

  const suggestedGroups = [];
  let groupCounter = 1;
  const globalUsedOrderIds = new Set();

  Object.keys(candidatesByDate).forEach(dateKey => {
    const dateOrders = candidatesByDate[dateKey];

    for (let i = 0; i < dateOrders.length; i++) {
      const primary = dateOrders[i];
      const primaryKey = primary.id || primary.order_code || primary.orderCode;
      if (!primaryKey || globalUsedOrderIds.has(primaryKey)) continue;

      const groupOrders = [primary];
      globalUsedOrderIds.add(primaryKey);

      for (let j = i + 1; j < dateOrders.length; j++) {
        if (groupOrders.length >= maxOrdersPerBatch) break;
        const target = dateOrders[j];
        const targetKey = target.id || target.order_code || target.orderCode;
        if (!targetKey || globalUsedOrderIds.has(targetKey)) continue;

        const primarySlot = primary.delivery_time_slot || primary.deliveryTimeSlot;
        const targetSlot = target.delivery_time_slot || target.deliveryTimeSlot;
        const timeCompat = areTimeSlotsCompatible(primarySlot, targetSlot);
        const locationCompat = areLocationsCompatible(primary, target);

        if (timeCompat && locationCompat) {
          groupOrders.push(target);
          globalUsedOrderIds.add(targetKey);
        }
      }

      if (groupOrders.length < 2 && !allowSingleOrderBatches) {
        continue;
      }

      let score = 50;
      const reasons = [];

      score += 15;
      reasons.push('✓ Verified delivery date match');

      const primarySlot = primary.delivery_time_slot || primary.deliveryTimeSlot;
      const allSameSlot = groupOrders.every(o => (o.delivery_time_slot || o.deliveryTimeSlot) === primarySlot);
      if (allSameSlot) {
        score += 20;
        reasons.push('✓ Exact delivery time window match');
      } else {
        score += 12;
        reasons.push('✓ Overlapping compatible delivery window');
      }

      const sellerNames = Array.from(new Set(groupOrders.map(o => o.vendorName || o.sellerName || (o.vendor && o.vendor.shop_name) || 'Local Seller')));
      const pickupAreas = Array.from(new Set(groupOrders.map(o => extractArea(o.pickup_location || o.pickupLocation))));
      const dropAreas = Array.from(new Set(groupOrders.map(o => extractArea(o))));

      if (pickupAreas.length === 1) {
        score += 10;
        reasons.push('✓ Consolidated seller pickup hub');
      } else {
        reasons.push('✓ Nearby multi-vendor pickup hubs');
      }

      if (dropAreas.length === 1) {
        score += 10;
        reasons.push('✓ Concentrated delivery neighborhood zone');
      } else {
        reasons.push('✓ Adjacent delivery zones');
      }

      const allReady = groupOrders.every(o => {
        const st = String(o.order_status || o.status || o.orderStatus || '').toUpperCase();
        return st === 'READY_FOR_DELIVERY' || st === 'READY';
      });
      if (allReady) {
        score += 10;
        reasons.push('✓ All orders packaged and ready for immediate courier pickup');
      } else {
        reasons.push('ℹ Orders currently in preparation pipeline');
      }

      const availableAgents = agents.filter(a => {
        const avail = String(a.availability || a.status || '').toLowerCase();
        return avail === 'available' || avail === 'active';
      });
      if (availableAgents.length > 0) {
        score += 5;
        reasons.push('✓ Available fleet courier capacity');
      } else {
        score -= 10;
        reasons.push('⚠️ Limited courier availability in zone');
      }

      const finalScore = Math.min(98, Math.max(60, score));
      const estimatedDistance = parseFloat((2.5 + groupOrders.length * 1.2).toFixed(1));
      const estimatedTime = Math.round(15 + estimatedDistance * 6);

      suggestedGroups.push({
        id: `SUG-B${String(groupCounter++).padStart(3, '0')}`,
        recommendationLabel: 'Suggested Aggregation Group',
        orderIds: groupOrders.map(o => o.id || o.order_code || o.orderCode),
        orders: groupOrders,
        sellerIds: Array.from(new Set(groupOrders.map(o => o.vendor_id || o.vendorId || o.sellerId))),
        sellerNames: sellerNames,
        pickupArea: pickupAreas.join(', '),
        deliveryArea: dropAreas.join(', '),
        deliveryDate: dateKey,
        deliveryTimeSlot: primarySlot,
        orderCount: groupOrders.length,
        compatibilityScore: finalScore,
        estimatedDistance: estimatedDistance,
        estimatedTime: estimatedTime,
        isEstimated: true,
        estimationMethod: 'heuristic_linear_model',
        reasons: reasons
      });
    }
  });

  return suggestedGroups;
};
exports.findSuitableOrderGroups = findSuitableOrderGroups;
