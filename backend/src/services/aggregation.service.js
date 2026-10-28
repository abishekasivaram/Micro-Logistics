"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runAutomaticAggregation = exports.retryUnassignedBatches = exports.reassignBatch = exports.findCompatibleBatches = exports.findBestAvailableAgent = exports.areTimeSlotsCompatible = exports.extractArea = exports.getZoneCoordinates = exports.MIN_BATCH_SIZE = exports.MAX_BATCH_SIZE = void 0;

const supabase_1 = require("../config/supabase");

const MIN_BATCH_SIZE = 1;
exports.MIN_BATCH_SIZE = MIN_BATCH_SIZE;

const MAX_BATCH_SIZE = 4;
exports.MAX_BATCH_SIZE = MAX_BATCH_SIZE;

// Coordinates center for Chennai transit zones
const CHENNAI_ZONES = {
  'Anna Nagar': { lat: 13.0850, lng: 80.2101 },
  'Kilpauk': { lat: 13.0827, lng: 80.2407 },
  'Shenoy Nagar': { lat: 13.0768, lng: 80.2238 },
  'Mylapore': { lat: 13.0333, lng: 80.2667 },
  'Mandaveli': { lat: 13.0280, lng: 80.2610 },
  'Alwarpet': { lat: 13.0335, lng: 80.2505 },
  'Adyar': { lat: 13.0012, lng: 80.2565 },
  'Besant Nagar': { lat: 12.9995, lng: 80.2685 },
  'Thiruvanmiyur': { lat: 12.9830, lng: 80.2594 },
  'T. Nagar': { lat: 13.0418, lng: 80.2341 },
  'Panagal Park': { lat: 13.0405, lng: 80.2320 },
  'Kodambakkam': { lat: 13.0500, lng: 80.2100 },
  'Vadapalani': { lat: 13.0500, lng: 80.2120 },
  'Velachery': { lat: 12.9750, lng: 80.2200 },
  'OMR': { lat: 12.9350, lng: 80.2290 },
  'Thoraipakkam': { lat: 12.9400, lng: 80.2350 },
  'Chetpet': { lat: 13.0650, lng: 80.2400 },
  'Nungambakkam': { lat: 13.0569, lng: 80.2425 },
  'Egmore': { lat: 13.0732, lng: 80.2609 },
  'Gopalapuram': { lat: 13.0489, lng: 80.2548 }
};

const getZoneCoordinates = (areaName) => {
  if (!areaName) return { lat: 13.0418, lng: 80.2341 }; // Default central
  for (const [zone, coords] of Object.entries(CHENNAI_ZONES)) {
    if (areaName.toLowerCase().includes(zone.toLowerCase())) {
      return coords;
    }
  }
  return { lat: 13.0418, lng: 80.2341 };
};
exports.getZoneCoordinates = getZoneCoordinates;

const extractArea = (locationString) => {
  if (!locationString || typeof locationString !== 'string') return 'Central Zone';
  for (const zone of Object.keys(CHENNAI_ZONES)) {
    if (locationString.toLowerCase().includes(zone.toLowerCase())) {
      return zone;
    }
  }
  const parts = locationString.split(',');
  if (parts.length >= 2) {
    return parts[parts.length - 2].trim();
  }
  return parts[0].trim();
};
exports.extractArea = extractArea;

// Distance using Haversine formula
const calculateDistance = (loc1, loc2) => {
  const c1 = getZoneCoordinates(loc1);
  const c2 = getZoneCoordinates(loc2);
  const R = 6371; // km
  const dLat = (c2.lat - c1.lat) * Math.PI / 180;
  const dLon = (c2.lng - c1.lng) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(c1.lat * Math.PI / 180) * Math.cos(c2.lat * Math.PI / 180) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return parseFloat((R * c).toFixed(1));
};

const areTimeSlotsCompatible = (slot1, slot2) => {
  if (!slot1 || !slot2) return true; // Flexible if unstated
  if (slot1.trim().toLowerCase() === slot2.trim().toLowerCase()) return true;

  const s1 = slot1.trim();
  const s2 = slot2.trim();

  // Overlapping pairs
  const compatiblePairs = [
    ['7:00 AM – 11:00 AM', '9:00 AM – 1:00 PM'],
    ['9:00 AM – 1:00 PM', '12:00 PM – 4:00 PM'],
    ['12:00 PM – 4:00 PM', '3:00 PM – 7:00 PM'],
    ['3:00 PM – 7:00 PM', '6:00 PM – 10:00 PM']
  ];

  return compatiblePairs.some(([a, b]) => 
    (s1.includes(a.split('–')[0].trim()) && s2.includes(b.split('–')[0].trim())) ||
    (s2.includes(a.split('–')[0].trim()) && s1.includes(b.split('–')[0].trim())) ||
    (s1 === a && s2 === b) || 
    (s1 === b && s2 === a)
  );
};
exports.areTimeSlotsCompatible = areTimeSlotsCompatible;

/**
 * AI & Proximity-based order clustering function
 * Only orders marked ready (READY_FOR_DELIVERY) are eligible.
 * Batch size is maximum 4 orders (1, 2, 3, or 4 orders per batch). Never exceeds 4.
 */
const findCompatibleBatches = (eligibleOrders, minBatchSize = MIN_BATCH_SIZE, maxBatchSize = MAX_BATCH_SIZE) => {
  if (!eligibleOrders || eligibleOrders.length === 0) {
    return [];
  }

  // Group candidate orders by date
  const ordersByDate = {};
  eligibleOrders.forEach(order => {
    const d = order.delivery_date || order.deliveryDate || new Date().toISOString().split('T')[0];
    if (!ordersByDate[d]) ordersByDate[d] = [];
    ordersByDate[d].push(order);
  });

  const validBatches = [];

  for (const [date, dateOrders] of Object.entries(ordersByDate)) {
    if (dateOrders.length < minBatchSize) continue;

    const usedOrderIds = new Set();

    for (let i = 0; i < dateOrders.length; i++) {
      const seed = dateOrders[i];
      if (usedOrderIds.has(seed.id)) continue;

      const cluster = [seed];
      const seedPickup = extractArea(seed.pickup_location || seed.pickupLocation);
      const seedDrop = extractArea(seed.delivery_location || seed.deliveryLocation);
      const seedSlot = seed.delivery_time_slot || seed.deliveryTimeSlot;

      for (let j = 0; j < dateOrders.length; j++) {
        if (i === j) continue;
        if (cluster.length >= maxBatchSize) break;

        const candidate = dateOrders[j];
        if (usedOrderIds.has(candidate.id)) continue;

        const candidatePickup = extractArea(candidate.pickup_location || candidate.pickupLocation);
        const candidateDrop = extractArea(candidate.delivery_location || candidate.deliveryLocation);
        const candidateSlot = candidate.delivery_time_slot || candidate.deliveryTimeSlot;

        // Check time compatibility
        const timeOk = areTimeSlotsCompatible(seedSlot, candidateSlot);
        if (!timeOk) continue;

        // Check spatial proximity (pickup within 8.5km, delivery within 9.0km)
        const pickupDist = calculateDistance(seedPickup, candidatePickup);
        const dropDist = calculateDistance(seedDrop, candidateDrop);

        if (pickupDist <= 8.5 && dropDist <= 9.0) {
          cluster.push(candidate);
        }
      }

      // Enforce batch size: minimum 1, maximum 4
      if (cluster.length >= minBatchSize && cluster.length <= maxBatchSize) {
        cluster.forEach(o => usedOrderIds.add(o.id));

        const pickupAreas = Array.from(new Set(cluster.map(o => extractArea(o.pickup_location || o.pickupLocation))));
        const dropAreas = Array.from(new Set(cluster.map(o => extractArea(o.delivery_location || o.deliveryLocation))));
        
        const estDist = parseFloat((2.5 + cluster.length * 1.3).toFixed(1));
        const estTime = Math.round(15 + estDist * 5.5);

        validBatches.push({
          orders: cluster,
          orderIds: cluster.map(o => o.id),
          orderCodes: cluster.map(o => o.order_code || o.orderCode || o.id),
          deliveryDate: date,
          deliverySlot: seedSlot || '9:00 AM – 1:00 PM',
          pickupArea: pickupAreas.join(' / '),
          deliveryArea: dropAreas.join(' / '),
          estimatedDistance: estDist,
          estimatedTime: estTime,
          orderCount: cluster.length
        });
      }
    }
  }

  return validBatches;
};
exports.findCompatibleBatches = findCompatibleBatches;

/**
 * Select the best available delivery agent for a formed batch
 */
const findBestAvailableAgent = (batch, agents = [], excludedAgentIds = []) => {
  if (!agents || agents.length === 0) return null;

  // 1. Filter available agents and exclude any rejecting agent
  const availableAgents = agents.filter(a => {
    if (excludedAgentIds && excludedAgentIds.length > 0) {
      if (excludedAgentIds.includes(a.id) || excludedAgentIds.includes(a.legacy_id)) {
        return false;
      }
    }
    const st = (a.status || '').toLowerCase();
    const av = (a.availability || '').toLowerCase();
    return st === 'available' || av === 'available';
  });

  if (availableAgents.length === 0) return null;

  // 2. Score candidate agents based on area proximity and workload
  const scoredAgents = availableAgents.map(agent => {
    let score = 50;
    const agentArea = agent.current_area || agent.currentArea || '';
    
    // Proximity match
    if (batch.pickupArea.toLowerCase().includes(agentArea.toLowerCase()) || 
        batch.deliveryArea.toLowerCase().includes(agentArea.toLowerCase())) {
      score += 40;
    } else {
      const dist = calculateDistance(agentArea, batch.pickupArea);
      score += Math.max(0, 30 - dist * 3);
    }

    // Workload penalty
    const workload = agent.current_orders || agent.currentOrders || 0;
    score -= (workload * 5);

    // Rating boost
    const rating = agent.rating || 4.5;
    score += (rating * 2);

    return { agent, score };
  });

  scoredAgents.sort((a, b) => b.score - a.score);
  return scoredAgents[0]?.agent || null;
};
exports.findBestAvailableAgent = findBestAvailableAgent;

/**
 * Reassign a batch safely when a delivery agent rejects or declines assignment
 */
const reassignBatch = async (batchIdentifier, rejectedAgentId) => {
  try {
    if (!supabase_1.supabase) return { success: false, message: 'DB not available' };

    let query = supabase_1.supabase.from('delivery_batches').select(`
      *,
      orders:orders!orders_batch_id_fkey(id, order_code, pickup_location, delivery_location)
    `);
    if (batchIdentifier.includes('-') && batchIdentifier.length > 15) {
      query = query.eq('id', batchIdentifier).single();
    } else {
      query = query.eq('batch_code', batchIdentifier).single();
    }

    const { data: batch, error: bErr } = await query;
    if (bErr || !batch) {
      return { success: false, message: 'Batch not found' };
    }

    // 1. Decrement rejected agent's workload if previously recorded
    const agentToUnassign = rejectedAgentId || batch.agent_id;
    if (agentToUnassign) {
      const { data: prevAgent } = await supabase_1.supabase
        .from('delivery_agents')
        .select('id, current_orders')
        .or(`id.eq.${agentToUnassign},legacy_id.eq.${agentToUnassign}`)
        .single();

      if (prevAgent) {
        const updatedCount = Math.max(0, (prevAgent.current_orders || 0) - (batch.order_count || 1));
        await supabase_1.supabase
          .from('delivery_agents')
          .update({ current_orders: updatedCount })
          .eq('id', prevAgent.id);
      }
    }

    // 2. Fetch candidate agents excluding the rejecting agent
    const { data: allAgents } = await supabase_1.supabase
      .from('delivery_agents')
      .select('*, profile:profiles(username, phone)');

    const excluded = [];
    if (agentToUnassign) excluded.push(agentToUnassign);
    if (batch.agent_id) excluded.push(batch.agent_id);

    const pickupAreas = Array.from(new Set((batch.orders || []).map(o => extractArea(o.pickup_location))));
    const dropAreas = Array.from(new Set((batch.orders || []).map(o => extractArea(o.delivery_location))));

    const batchCandidate = {
      pickupArea: pickupAreas.join(' / ') || 'Central Zone',
      deliveryArea: dropAreas.join(' / ') || 'Central Zone',
      orderCount: batch.order_count || (batch.orders || []).length
    };

    const newAgent = findBestAvailableAgent(batchCandidate, allAgents || [], excluded);

    if (newAgent) {
      // Reassign to new agent
      await supabase_1.supabase
        .from('delivery_batches')
        .update({
          agent_id: newAgent.id,
          status: 'ASSIGNED',
          aggregation_status: 'ASSIGNED'
        })
        .eq('id', batch.id);

      await supabase_1.supabase
        .from('orders')
        .update({
          assigned_agent_id: newAgent.id,
          order_status: 'ASSIGNED',
          delivery_status: 'ASSIGNED',
          aggregation_status: 'ASSIGNED'
        })
        .eq('batch_id', batch.id);

      const newAgentOrders = (newAgent.current_orders || 0) + (batch.order_count || 1);
      await supabase_1.supabase
        .from('delivery_agents')
        .update({ current_orders: newAgentOrders })
        .eq('id', newAgent.id);

      return {
        success: true,
        reassigned: true,
        newAgentId: newAgent.id,
        newAgentName: newAgent.profile?.username || 'Agent',
        message: `Batch safely reassigned to ${newAgent.profile?.username || 'new courier'}`
      };
    } else {
      // No alternate agent available right now; keep batch pending assignment
      await supabase_1.supabase
        .from('delivery_batches')
        .update({
          agent_id: null,
          status: 'PENDING_ASSIGNMENT',
          aggregation_status: 'BATCH_CREATED'
        })
        .eq('id', batch.id);

      await supabase_1.supabase
        .from('orders')
        .update({
          assigned_agent_id: null,
          order_status: 'READY_FOR_DELIVERY',
          delivery_status: 'PENDING_ASSIGNMENT',
          aggregation_status: 'BATCH_CREATED'
        })
        .eq('batch_id', batch.id);

      return {
        success: true,
        reassigned: false,
        message: 'Assignment declined. Batch marked Pending Assignment awaiting available courier.'
      };
    }
  } catch (err) {
    console.error('Reassignment error:', err);
    return { success: false, message: err.message };
  }
};
exports.reassignBatch = reassignBatch;

// Concurrency mutex flag
let isAggregationRunning = false;

/**
 * Full Automatic Order Aggregation & Fleet Assignment Engine
 * Triggered automatically on order readiness or on-demand
 */
const runAutomaticAggregation = async () => {
  if (isAggregationRunning) {
    return { success: false, message: 'Aggregation engine is already running concurrently' };
  }

  isAggregationRunning = true;

  try {
    if (!supabase_1.supabase) {
      return { success: false, message: 'Database client unavailable' };
    }

    // 1. Fetch eligible ready orders (strictly READY_FOR_DELIVERY, no existing batch)
    const { data: eligibleOrders, error: orderErr } = await supabase_1.supabase
      .from('orders')
      .select(`
        id, order_code, customer_id, vendor_id, batch_id, assigned_agent_id,
        order_status, delivery_status, aggregation_status,
        pickup_location, delivery_location, delivery_date, delivery_time_slot, created_at,
        vendor:vendors(id, legacy_id, shop_name, address),
        customer:customer_profiles(id, legacy_id, profile:profiles(username, phone))
      `)
      .eq('order_status', 'READY_FOR_DELIVERY')
      .is('batch_id', null)
      .order('created_at', { ascending: true });

    if (orderErr) throw orderErr;

    const queuedCount = eligibleOrders ? eligibleOrders.length : 0;

    // 2. Check if any eligible ready orders exist
    if (queuedCount === 0) {
      return {
        success: true,
        formedBatchesCount: 0,
        queuedCount: 0,
        message: 'No unassigned ready orders awaiting delivery aggregation.'
      };
    }

    // 3. Cluster compatible orders into batches of maximum 4 orders (1-4 orders per batch)
    const validBatches = findCompatibleBatches(eligibleOrders, MIN_BATCH_SIZE, MAX_BATCH_SIZE);

    if (validBatches.length === 0) {
      return {
        success: true,
        formedBatchesCount: 0,
        queuedCount,
        message: `Pending compatible clusters: ${queuedCount} ready order(s) detected, but awaiting compatible route or time window grouping.`
      };
    }

    // 4. Fetch delivery agents
    const { data: agentsData, error: agentErr } = await supabase_1.supabase
      .from('delivery_agents')
      .select('*, profile:profiles(username, phone)');

    const agents = agentsData || [];
    const processedBatches = [];

    // 5. Commit batches and assign agents
    for (const batchCandidate of validBatches) {
      const assignedAgent = findBestAvailableAgent(batchCandidate, agents);
      const batchCode = `B-${Math.floor(1000 + Math.random() * 9000)}`;

      const batchPayload = {
        batch_code: batchCode,
        order_count: batchCandidate.orderCount,
        estimated_distance: batchCandidate.estimatedDistance,
        estimated_time: batchCandidate.estimatedTime,
        delivery_date: batchCandidate.deliveryDate,
        delivery_slot: batchCandidate.deliverySlot,
        status: assignedAgent ? 'ASSIGNED' : 'PENDING_ASSIGNMENT',
        aggregation_status: assignedAgent ? 'ASSIGNED' : 'BATCH_CREATED',
        agent_id: assignedAgent ? assignedAgent.id : null
      };

      const { data: createdBatch, error: batchInsertErr } = await supabase_1.supabase
        .from('delivery_batches')
        .insert(batchPayload)
        .select()
        .single();

      if (batchInsertErr || !createdBatch) {
        console.error('Batch creation error:', batchInsertErr);
        continue;
      }

      // Link orders in delivery_batch_orders and update orders table
      for (const order of batchCandidate.orders) {
        try {
          await supabase_1.supabase.from('delivery_batch_orders').insert({
            batch_id: createdBatch.id,
            order_id: order.id
          });
        } catch (e) {
          // Ignore duplicate link error
        }

        const orderUpdatePayload = {
          batch_id: createdBatch.id,
          aggregation_status: assignedAgent ? 'ASSIGNED' : 'BATCH_CREATED',
          delivery_status: assignedAgent ? 'ASSIGNED' : 'PENDING_ASSIGNMENT'
        };

        if (assignedAgent) {
          orderUpdatePayload.assigned_agent_id = assignedAgent.id;
          orderUpdatePayload.order_status = 'ASSIGNED';
        }

        await supabase_1.supabase
          .from('orders')
          .update(orderUpdatePayload)
          .eq('id', order.id);
      }

      // Update agent workload if assigned
      if (assignedAgent) {
        const newOrdersCount = (assignedAgent.current_orders || 0) + batchCandidate.orderCount;
        await supabase_1.supabase
          .from('delivery_agents')
          .update({ current_orders: newOrdersCount })
          .eq('id', assignedAgent.id);
        
        assignedAgent.current_orders = newOrdersCount;
      }

      processedBatches.push({
        batchId: createdBatch.id,
        batchCode: batchCode,
        orderCount: batchCandidate.orderCount,
        orderCodes: batchCandidate.orderCodes,
        assignedAgent: assignedAgent ? `${assignedAgent.profile?.username || 'Agent'} (${assignedAgent.profile?.phone || ''})` : null,
        status: assignedAgent ? 'ASSIGNED' : 'PENDING_ASSIGNMENT'
      });
    }

    return {
      success: true,
      formedBatchesCount: processedBatches.length,
      processedBatches,
      queuedCount: queuedCount - processedBatches.reduce((acc, b) => acc + b.orderCount, 0),
      message: `Successfully formed ${processedBatches.length} delivery batch(es) and executed automatic dispatch assignment.`
    };
  } catch (err) {
    console.error('Automatic aggregation runtime error:', err);
    return { success: false, message: err.message };
  } finally {
    isAggregationRunning = false;
  }
};
exports.runAutomaticAggregation = runAutomaticAggregation;

/**
 * Scan batches awaiting a delivery agent and auto-assign if an agent has become available
 */
const retryUnassignedBatches = async () => {
  try {
    if (!supabase_1.supabase) return;

    const { data: pendingBatches } = await supabase_1.supabase
      .from('delivery_batches')
      .select(`
        *,
        orders:orders!orders_batch_id_fkey(id, order_code, pickup_location, delivery_location)
      `)
      .is('agent_id', null)
      .eq('status', 'PENDING_ASSIGNMENT');

    if (!pendingBatches || pendingBatches.length === 0) return;

    const { data: agents } = await supabase_1.supabase
      .from('delivery_agents')
      .select('*, profile:profiles(username, phone)');

    for (const batch of pendingBatches) {
      const pickupAreas = Array.from(new Set((batch.orders || []).map(o => extractArea(o.pickup_location))));
      const dropAreas = Array.from(new Set((batch.orders || []).map(o => extractArea(o.delivery_location))));
      
      const batchCandidate = {
        pickupArea: pickupAreas.join(' / '),
        deliveryArea: dropAreas.join(' / '),
        orderCount: batch.order_count || (batch.orders || []).length
      };

      const agent = findBestAvailableAgent(batchCandidate, agents || []);
      if (agent) {
        await supabase_1.supabase
          .from('delivery_batches')
          .update({
            agent_id: agent.id,
            status: 'ASSIGNED',
            aggregation_status: 'ASSIGNED'
          })
          .eq('id', batch.id);

        await supabase_1.supabase
          .from('orders')
          .update({
            assigned_agent_id: agent.id,
            order_status: 'ASSIGNED',
            delivery_status: 'ASSIGNED',
            aggregation_status: 'ASSIGNED'
          })
          .eq('batch_id', batch.id);
      }
    }
  } catch (e) {
    console.error('Retry unassigned batches error:', e);
  }
};
exports.retryUnassignedBatches = retryUnassignedBatches;
