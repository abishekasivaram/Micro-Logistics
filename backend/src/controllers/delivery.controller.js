"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAggregationOverview = exports.triggerAutomaticAggregation = exports.verifyDeliveryOtp = exports.getOrderOtp = exports.updateAgent = exports.createAgent = exports.respondToBatchAssignment = exports.updateBatchStatus = exports.assignBatch = exports.createBatch = exports.getBatchById = exports.getBatches = exports.getAgentById = exports.getAgents = void 0;
const supabase_1 = require("../config/supabase");
const mappings_1 = require("../utils/mappings");
const aggregation_service_1 = require("../services/aggregation.service");
const getAgents = async (req, res) => {
    try {
        const { data, error } = await supabase_1.supabase.from('delivery_agents').select(`*, profile:profiles(username, phone)`);
        if (error)
            throw error;
        res.json({ success: true, data: data.map(a => (0, mappings_1.mapAgentToFrontend)(a)) });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
exports.getAgents = getAgents;
const getAgentById = async (req, res) => {
    try {
        const { id } = req.params;
        let query = supabase_1.supabase.from('delivery_agents').select(`*, profile:profiles(username, phone)`);
        if (id.includes('-'))
            query = query.eq('id', id).single();
        else
            query = query.eq('legacy_id', id).single();
        const { data, error } = await query;
        if (error || !data)
            return res.status(404).json({ success: false, message: 'Agent not found' });
        // Auth check
        const userRole = req.user?.user_metadata?.role || req.user?.role;
        if (userRole === 'delivery_partner' && data.id !== req.user?.id) {
            return res.status(403).json({ success: false, message: 'Forbidden' });
        }
        res.json({ success: true, data: (0, mappings_1.mapAgentToFrontend)(data) });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
exports.getAgentById = getAgentById;
const getBatches = async (req, res) => {
    try {
        let query = supabase_1.supabase.from('delivery_batches').select(`
      *,
      agent:delivery_agents(id, legacy_id, vehicle, capacity, profile:profiles(username, phone)),
      orders:orders!orders_batch_id_fkey(id, order_code, pickup_location, delivery_location, delivery_date, delivery_time_slot, order_status, delivery_status, total, vendor:vendors(id, legacy_id, shop_name, address), customer:customer_profiles(id, legacy_id, address, profile:profiles(username, phone))),
      batch_waypoints(*)
    `);
        const userRole = req.user?.user_metadata?.role || req.user?.role;
        const userId = req.user?.id;
        if (userRole === 'delivery_partner') {
            query = query.eq('agent_id', userId);
        }
        const { data, error } = await query.order('created_at', { ascending: false });
        if (error)
            throw error;
        const batches = data.map((b) => (0, mappings_1.mapBatchToFrontend)(b));
        res.json({ success: true, data: batches });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
exports.getBatches = getBatches;
const getBatchById = async (req, res) => {
    try {
        const { id } = req.params;
        let query = supabase_1.supabase.from('delivery_batches').select(`
      *,
      agent:delivery_agents(id, legacy_id, vehicle, capacity, profile:profiles(username, phone)),
      orders:orders!orders_batch_id_fkey(id, order_code, pickup_location, delivery_location, delivery_date, delivery_time_slot, order_status, delivery_status, total, vendor:vendors(id, legacy_id, shop_name, address), customer:customer_profiles(id, legacy_id, address, profile:profiles(username, phone))),
      batch_waypoints(*)
    `);
        if (id.includes('-') && id.length > 15) {
            query = query.eq('id', id).single();
        } else {
            query = query.eq('batch_code', id).single();
        }
        const { data, error } = await query;
        if (error || !data)
            return res.status(404).json({ success: false, message: 'Batch not found' });
        const userRole = req.user?.user_metadata?.role || req.user?.role;
        if (userRole === 'delivery_partner' && data.agent_id !== req.user?.id)
            return res.status(403).json({ success: false, message: 'Forbidden' });
        res.json({ success: true, data: (0, mappings_1.mapBatchToFrontend)(data) });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
exports.getBatchById = getBatchById;
const createBatch = async (req, res) => {
    try {
        const userRole = req.user?.user_metadata?.role || req.user?.role;
        if (userRole !== 'admin') {
            return res.status(403).json({ success: false, message: 'Forbidden: Only administrators can authorize delivery batches' });
        }

        const { orderIds, estimatedDistance, estimatedTime, deliveryDate, deliverySlot } = req.body;
        if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
            return res.status(400).json({ success: false, message: 'A non-empty array of orderIds is required' });
        }

        const MAX_BATCH_LIMIT = 5;
        if (orderIds.length > MAX_BATCH_LIMIT) {
            return res.status(400).json({
                success: false,
                message: `Batch order count (${orderIds.length}) exceeds the maximum allowed batch limit of ${MAX_BATCH_LIMIT} orders`
            });
        }

        // Query candidate orders from database by order_code or UUID
        const { data: dbOrders, error: fetchErr } = await supabase_1.supabase
            .from('orders')
            .select('id, order_code, batch_id, order_status, delivery_status, aggregation_status, delivery_date, delivery_time_slot, pickup_location, delivery_location, vendor_id, vendor:vendors(id, shop_name, address)')
            .or(`order_code.in.(${orderIds.join(',')}),id.in.(${orderIds.join(',')})`);

        if (fetchErr || !dbOrders || dbOrders.length !== orderIds.length) {
            return res.status(400).json({ success: false, message: 'One or more requested orders could not be found' });
        }

        // 1. Concurrency & Duplicate Check: Ensure NO order is already assigned to a batch
        const alreadyBatched = dbOrders.filter(o => o.batch_id);
        if (alreadyBatched.length > 0) {
            return res.status(409).json({
                success: false,
                message: `Conflict: Order(s) ${alreadyBatched.map(o => o.order_code).join(', ')} have already been assigned to a delivery batch`
            });
        }

        // 2. Status Eligibility Check: Reject cancelled, delivered, or terminal orders
        const ineligible = dbOrders.filter(o => {
            const st = String(o.order_status || '').toUpperCase();
            return ['CANCELLED', 'DELIVERED', 'OUT_FOR_DELIVERY'].includes(st);
        });
        if (ineligible.length > 0) {
            return res.status(400).json({
                success: false,
                message: `Cannot batch orders: Order(s) ${ineligible.map(o => `${o.order_code} (${o.order_status})`).join(', ')} are not eligible for batch creation`
            });
        }

        // 3. Spatio-Temporal Compatibility Validation
        const aggregationUtils = require('../utils/aggregationUtils');
        const firstOrder = dbOrders[0];
        const targetDate = deliveryDate || firstOrder.delivery_date || new Date().toISOString().split('T')[0];
        const targetSlot = deliverySlot || firstOrder.delivery_time_slot || '9:00 AM – 1:00 PM';

        for (const order of dbOrders) {
            // Validate delivery date matches
            const oDate = order.delivery_date ? String(order.delivery_date).split('T')[0] : targetDate;
            if (oDate !== targetDate) {
                return res.status(400).json({
                    success: false,
                    message: `Date incompatibility: Order ${order.order_code} is scheduled for ${oDate}, but batch is targeted for ${targetDate}`
                });
            }

            // Validate time slot compatibility with primary slot
            const oSlot = order.delivery_time_slot || targetSlot;
            if (!aggregationUtils.areTimeSlotsCompatible(targetSlot, oSlot)) {
                return res.status(400).json({
                    success: false,
                    message: `Time slot incompatibility: Order ${order.order_code} slot (${oSlot}) does not overlap with batch slot (${targetSlot})`
                });
            }

            // Validate geographic compatibility with first order
            if (!aggregationUtils.areLocationsCompatible(firstOrder, order)) {
                return res.status(400).json({
                    success: false,
                    message: `Geographic incompatibility: Order ${order.order_code} delivery area is too far from ${firstOrder.order_code}`
                });
            }
        }

        const batchCode = `B-${Math.floor(1000 + Math.random() * 9000)}`;

        // Insert new delivery batch
        const { data: batch, error: batchErr } = await supabase_1.supabase.from('delivery_batches').insert({
            batch_code: batchCode,
            order_count: dbOrders.length,
            estimated_distance: estimatedDistance || parseFloat((2.5 + dbOrders.length * 1.2).toFixed(1)),
            estimated_time: estimatedTime || Math.round(15 + (2.5 + dbOrders.length * 1.2) * 6),
            delivery_date: targetDate,
            delivery_slot: targetSlot,
            status: 'PENDING_ASSIGNMENT',
            aggregation_status: 'BATCH_CREATED'
        }).select().single();

        if (batchErr || !batch) throw batchErr;

        // Atomically link orders to batch and populate junction table
        for (const order of dbOrders) {
            await supabase_1.supabase.from('delivery_batch_orders').insert({ batch_id: batch.id, order_id: order.id });
            await supabase_1.supabase.from('orders').update({
                batch_id: batch.id,
                aggregation_status: 'BATCH_CREATED',
                delivery_status: 'PENDING_ASSIGNMENT'
            }).eq('id', order.id);
        }

        // Generate and persist structured waypoints in batch_waypoints
        try {
            let seq = 1;
            // 1. Unique vendor pickup stops
            const uniqueVendors = Array.from(new Set(dbOrders.map(o => o.vendor_id || (o.vendor && o.vendor.id))));
            for (const vId of uniqueVendors) {
                const sampleOrd = dbOrders.find(o => (o.vendor_id === vId) || (o.vendor && o.vendor.id === vId));
                const shopName = sampleOrd?.vendor?.shop_name || 'Vendor Shop';
                const addr = sampleOrd?.vendor?.address || sampleOrd?.pickup_location || 'Vendor Hub';
                await supabase_1.supabase.from('batch_waypoints').insert({
                    batch_id: batch.id,
                    sequence_index: seq++,
                    stop_type: 'PICKUP',
                    location: `${shopName} - ${addr}`,
                    is_completed: false
                });
            }
            // 2. Customer delivery drop stops
            for (const order of dbOrders) {
                await supabase_1.supabase.from('batch_waypoints').insert({
                    batch_id: batch.id,
                    sequence_index: seq++,
                    stop_type: 'DELIVERY',
                    location: `${order.order_code} - ${order.delivery_location || 'Customer Address'}`,
                    is_completed: false
                });
            }
        } catch (wpErr) {
            console.warn('Could not persist waypoints to batch_waypoints table:', wpErr);
        }

        const { data: fullBatch } = await supabase_1.supabase.from('delivery_batches').select(`
            *,
            agent:delivery_agents(id, legacy_id, profile:profiles(username, phone)),
            orders:orders!orders_batch_id_fkey(id, order_code, pickup_location, delivery_location, vendor:vendors(id, legacy_id, shop_name)),
            batch_waypoints(*)
        `).eq('id', batch.id).single();

        res.status(201).json({ success: true, data: (0, mappings_1.mapBatchToFrontend)(fullBatch || batch) });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
exports.createBatch = createBatch;
const assignBatch = async (req, res) => {
    try {
        const userRole = req.user?.user_metadata?.role || req.user?.role;
        if (userRole !== 'admin') {
            return res.status(403).json({ success: false, message: 'Forbidden: Only administrators can assign batches to couriers' });
        }

        const { id } = req.params;
        const { agentId } = req.body;
        if (!agentId) {
            return res.status(400).json({ success: false, message: 'agentId is required' });
        }

        let aId = agentId;
        let agentRecord = null;
        if (!aId.includes('-')) {
            const { data: aData } = await supabase_1.supabase.from('delivery_agents').select('*, profile:profiles(username)').eq('legacy_id', agentId).single();
            if (!aData) return res.status(400).json({ success: false, message: 'Agent not found' });
            aId = aData.id;
            agentRecord = aData;
        } else {
            const { data: aData } = await supabase_1.supabase.from('delivery_agents').select('*, profile:profiles(username)').eq('id', aId).single();
            if (!aData) return res.status(400).json({ success: false, message: 'Agent not found' });
            agentRecord = aData;
        }

        // Validate batch exists
        let bQuery = supabase_1.supabase.from('delivery_batches').select('*');
        if (id.includes('-') && id.length > 15) bQuery = bQuery.eq('id', id).single();
        else bQuery = bQuery.eq('batch_code', id).single();
        const { data: targetBatch, error: bErr } = await bQuery;
        if (bErr || !targetBatch) {
            return res.status(404).json({ success: false, message: 'Batch not found' });
        }

        // Check vehicle capacity limit
        if (agentRecord.capacity && targetBatch.order_count > agentRecord.capacity) {
            return res.status(400).json({
                success: false,
                message: `Agent capacity exceeded: Agent ${agentRecord.profile?.username || agentRecord.legacy_id} has capacity for ${agentRecord.capacity} orders, but batch contains ${targetBatch.order_count} orders`
            });
        }

        // Update batch assignment
        const { data: batch, error } = await supabase_1.supabase.from('delivery_batches').update({
            agent_id: aId,
            status: 'ASSIGNED',
            aggregation_status: 'ASSIGNED'
        }).eq('id', targetBatch.id).select().single();

        if (error) throw error;

        // Cascade assignment to orders
        await supabase_1.supabase.from('orders').update({
            assigned_agent_id: aId,
            order_status: 'ASSIGNED',
            delivery_status: 'ASSIGNED',
            aggregation_status: 'ASSIGNED'
        }).eq('batch_id', batch.id);

        // Update courier availability to Busy / On Delivery
        await supabase_1.supabase.from('delivery_agents').update({
            availability: 'Busy',
            status: 'On Delivery'
        }).eq('id', aId);

        const { data: fullBatch } = await supabase_1.supabase.from('delivery_batches').select(`
            *,
            agent:delivery_agents(id, legacy_id, profile:profiles(username, phone)),
            orders:orders!orders_batch_id_fkey(id, order_code, pickup_location, delivery_location, vendor:vendors(id, legacy_id, shop_name)),
            batch_waypoints(*)
        `).eq('id', batch.id).single();

        res.json({ success: true, message: `Batch ${id} assigned to agent`, data: { batch: (0, mappings_1.mapBatchToFrontend)(fullBatch || batch) } });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
exports.assignBatch = assignBatch;
const respondToBatchAssignment = async (req, res) => {
    try {
        const { id } = req.params;
        const { action } = req.body; // 'ACCEPT' or 'REJECT'
        
        let query = supabase_1.supabase.from('delivery_batches').select('*');
        if (id.includes('-') && id.length > 15) {
            query = query.eq('id', id).single();
        } else {
            query = query.eq('batch_code', id).single();
        }
        const { data: batch, error } = await query;
        if (error || !batch) {
            return res.status(404).json({ success: false, message: 'Batch not found' });
        }

        const userRole = req.user?.user_metadata?.role || req.user?.role;
        const userId = req.user?.id;
        if (userRole === 'delivery_partner' && batch.agent_id !== userId) {
            return res.status(403).json({ success: false, message: 'Forbidden: You are not assigned to this batch' });
        }

        if (action === 'ACCEPT' || action === 'accept') {
            await supabase_1.supabase.from('delivery_batches').update({
                status: 'PICKUP_IN_PROGRESS'
            }).eq('id', batch.id);

            const { data: fullBatch } = await supabase_1.supabase.from('delivery_batches').select(`
                *,
                agent:delivery_agents(id, legacy_id, profile:profiles(username, phone)),
                orders:orders!orders_batch_id_fkey(id, order_code, pickup_location, delivery_location, vendor:vendors(id, legacy_id, shop_name))
            `).eq('id', batch.id).single();

            return res.json({
                success: true,
                message: `Batch ${batch.batch_code} accepted! Pickup routine initiated.`,
                data: (0, mappings_1.mapBatchToFrontend)(fullBatch || batch)
            });
        }

        if (action === 'REJECT' || action === 'reject') {
            const result = await (0, aggregation_service_1.reassignBatch)(batch.id, userId);
            return res.json({
                success: true,
                message: result.message || `Assignment declined for batch ${batch.batch_code}`,
                data: result
            });
        }

        return res.status(400).json({ success: false, message: 'Invalid action. Expected ACCEPT or REJECT.' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
exports.respondToBatchAssignment = respondToBatchAssignment;

const updateBatchStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, action } = req.body;

        // Handle delivery batch assignment responses.
        if (
            action === 'ACCEPT' ||
            action === 'REJECT' ||
            status === 'ACCEPTED' ||
            status === 'REJECTED'
        ) {
            req.body.action = (action || status).toUpperCase().startsWith('ACC')
                ? 'ACCEPT'
                : 'REJECT';

            return respondToBatchAssignment(req, res);
        }

        // Normalize supported delivery status values.
        let dbStatus = status;

        if (status === 'Pickup in Progress' || status === 'PICKUP_IN_PROGRESS') {
            dbStatus = 'PICKUP_IN_PROGRESS';
        }

        if (status === 'Out for Delivery' || status === 'OUT_FOR_DELIVERY') {
            dbStatus = 'OUT_FOR_DELIVERY';
        }

        if (
            status === 'Completed' ||
            status === 'Delivered' ||
            status === 'COMPLETED'
        ) {
            dbStatus = 'COMPLETED';
        }

        if (status === 'Picked Up' || status === 'PICKED_UP') {
            dbStatus = 'PICKED_UP';
        }

        let query = supabase_1.supabase.from('delivery_batches').select('*');

        if (id.includes('-') && id.length > 15) {
            query = query.eq('id', id).single();
        } else {
            query = query.eq('batch_code', id).single();
        }

        const { data: batch, error: err1 } = await query;
        if (err1 || !batch)
            return res.status(404).json({ success: false, message: 'Batch not found' });

        const userRole = req.user?.user_metadata?.role || req.user?.role;
        const userId = req.user?.id;
        if (userRole === 'delivery_partner' && batch.agent_id !== userId)
            return res.status(403).json({ success: false, message: 'Forbidden: You are not assigned to this batch' });

        // CRITICAL BUSINESS RULE & OTP PROTECTION:
        // Batch status CANNOT be set to COMPLETED unless 100% of member orders have been verified and marked DELIVERED via OTP!
        if (dbStatus === 'COMPLETED') {
            const { data: memberOrders } = await supabase_1.supabase
                .from('orders')
                .select('id, order_code, delivery_status, order_status')
                .eq('batch_id', batch.id);

            const unverifiedOrders = (memberOrders || []).filter(o => o.delivery_status !== 'DELIVERED');
            if (unverifiedOrders.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: `Cannot complete batch: ${unverifiedOrders.length} order(s) (${unverifiedOrders.map(o => o.order_code).join(', ')}) have not satisfied OTP verification. Handover verification must be completed for every order first.`
                });
            }
        }

        const updatePayload = { status: dbStatus };
        if (dbStatus === 'COMPLETED') {
            updatePayload.aggregation_status = 'COMPLETED';
        }

        const { error } = await supabase_1.supabase.from('delivery_batches').update(updatePayload).eq('id', batch.id);
        if (error) throw error;

        // Cascade intermediate transitions to orders.
        if (dbStatus === 'OUT_FOR_DELIVERY') {
            // Note: Individual order transit should only occur after vendor handover
            await supabase_1.supabase.from('orders').update({
                order_status: 'OUT_FOR_DELIVERY',
                delivery_status: 'OUT_FOR_DELIVERY'
            }).eq('batch_id', batch.id).eq('delivery_status', 'PICKED_UP');
        }

        // When batch completes, restore delivery agent availability if they have no other active batches
        if (dbStatus === 'COMPLETED' && batch.agent_id) {
            const { data: activeBatches } = await supabase_1.supabase
                .from('delivery_batches')
                .select('id')
                .eq('agent_id', batch.agent_id)
                .neq('status', 'COMPLETED');

            if (!activeBatches || activeBatches.length === 0) {
                await supabase_1.supabase.from('delivery_agents').update({
                    availability: 'Available',
                    status: 'Active'
                }).eq('id', batch.agent_id);
            }
        }

        const { data: fullBatch } = await supabase_1.supabase.from('delivery_batches').select(`
            *,
            agent:delivery_agents(id, legacy_id, profile:profiles(username, phone)),
            orders:orders!orders_batch_id_fkey(id, order_code, pickup_location, delivery_location, vendor:vendors(id, legacy_id, shop_name)),
            batch_waypoints(*)
        `).eq('id', batch.id).single();

        res.json({ success: true, message: `Batch ${id} updated to ${status}`, data: (0, mappings_1.mapBatchToFrontend)(fullBatch || batch) });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
exports.updateBatchStatus = updateBatchStatus;

const createAgent = async (req, res) => {
    try {
        const { name, phone, email, currentArea, vehicle, capacity } = req.body;
        
        // Ensure email isn't already used
        const { data: existingUser } = await supabase_1.supabase.from('profiles').select('id').eq('email', email).single();
        if (existingUser) return res.status(400).json({ success: false, message: 'Email already exists' });
        
        // 1. Create auth user
        const { data: authData, error: authErr } = await supabase_1.supabase.auth.admin.createUser({
            email,
            password: 'password123', // default
            email_confirm: true,
            user_metadata: { role: 'delivery_partner', full_name: name }
        });
        if (authErr) throw authErr;
        
        const newId = authData.user.id;
        
        // 2. Insert profile
        await supabase_1.supabase.from('profiles').insert({
            id: newId,
            email,
            phone,
            username: name,
            role: 'delivery_partner'
        });
        
        // 3. Insert agent
        const legacyId = 'da' + Math.floor(Math.random() * 1000);
        const { data, error } = await supabase_1.supabase.from('delivery_agents').insert({
            id: newId,
            legacy_id: legacyId,
            current_area: currentArea,
            vehicle: vehicle || 'Bike',
            capacity: capacity || 5,
            status: 'Active',
            availability: 'Available'
        }).select('*, profile:profiles(username, phone)').single();
        
        if (error) throw error;
        
        res.status(201).json({ success: true, data: (0, mappings_1.mapAgentToFrontend)(data) });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
exports.createAgent = createAgent;

const updateAgent = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        
        let query = supabase_1.supabase.from('delivery_agents').select('id').eq('legacy_id', id).single();
        let { data: existing, error: e1 } = await query;
        if (e1) {
            existing = (await supabase_1.supabase.from('delivery_agents').select('id').eq('id', id).single()).data;
        }
        if (!existing) return res.status(404).json({ success: false, message: 'Agent not found' });
        
        const userRole = req.user?.role || req.user?.user_metadata?.role;
        if (userRole !== 'admin' && (userRole !== 'delivery_partner' || existing.id !== req.user?.id)) {
            return res.status(403).json({ success: false, message: 'Forbidden: Insufficient permissions to update delivery agent' });
        }
        
        const payload = {
            current_area: updates.currentArea,
            vehicle: updates.vehicle,
            capacity: updates.capacity,
            status: updates.status,
            availability: updates.availability
        };
        
        const { data, error } = await supabase_1.supabase.from('delivery_agents')
            .update(payload)
            .eq('id', existing.id)
            .select('*, profile:profiles(username, phone)')
            .single();
            
        if (error) throw error;
        
        // Update profile if phone or name is given
        if (updates.phone || updates.name) {
            const pUpdate = {};
            if (updates.phone) pUpdate.phone = updates.phone;
            if (updates.name) pUpdate.username = updates.name;
            await supabase_1.supabase.from('profiles').update(pUpdate).eq('id', existing.id);
            const refreshed = await supabase_1.supabase.from('delivery_agents').select('*, profile:profiles(username, phone)').eq('id', existing.id).single();
            return res.json({ success: true, data: (0, mappings_1.mapAgentToFrontend)(refreshed.data) });
        }
        
        res.json({ success: true, data: (0, mappings_1.mapAgentToFrontend)(data) });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
exports.updateAgent = updateAgent;

const orderOtpCache = new Map();

const computeOrderOtp = (orderCode) => {
    const hash = Math.abs(String(orderCode).split('').reduce((acc, char) => ((acc << 5) - acc) + char.charCodeAt(0), 0));
    return String(1000 + (hash % 9000));
};

const getOrderOtp = async (req, res) => {
    try {
        const { id } = req.params;
        let query = supabase_1.supabase.from('orders').select('id, order_code, customer_id');
        if (id.includes('-') && id.length > 15) {
            query = query.eq('id', id).single();
        } else {
            query = query.eq('order_code', id).single();
        }
        const { data: order, error } = await query;
        if (error || !order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        const userRole = req.user?.role || req.user?.user_metadata?.role;
        const userId = req.user?.id;

        // Confidentiality: Only the purchasing customer (or admin) may view the secret delivery OTP
        if (userRole === 'customer' && order.customer_id !== userId) {
            return res.status(403).json({ success: false, message: 'Forbidden: You can only view the delivery code for your own order' });
        }
        if (userRole !== 'customer' && userRole !== 'admin') {
            return res.status(403).json({ success: false, message: 'Forbidden: Handover verification code is restricted to customer recipient' });
        }

        const crypto = require('crypto');
        let otpCode = null;

        const { data: existingVerification, error: vErr } = await supabase_1.supabase
            .from('delivery_verifications')
            .select('otp_code, is_verified')
            .eq('order_id', order.id)
            .maybeSingle();

        if (vErr) {
            return res.status(500).json({
                success: false,
                message: 'Failed to retrieve delivery verification record'
            });
        }

        if (existingVerification && existingVerification.otp_code) {
            if (existingVerification.is_verified) {
                return res.status(400).json({
                    success: false,
                    message: 'This order has already been verified and delivered'
                });
            }

            otpCode = existingVerification.otp_code;
        } else {
            // Generate a cryptographically secure 4-digit OTP.
            otpCode = String(crypto.randomInt(1000, 10000));

            const { error: insErr } = await supabase_1.supabase
                .from('delivery_verifications')
                .insert({
                    order_id: order.id,
                    otp_code: otpCode,
                    is_verified: false,
                    attempts: 0
                });

            if (insErr) {
                return res.status(500).json({
                    success: false,
                    message: 'Failed to initialize secure verification code'
                });
            }
        }

        res.json({ success: true, data: { orderId: order.order_code, otp: otpCode } });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
exports.getOrderOtp = getOrderOtp;

const verifyDeliveryOtp = async (req, res) => {
    try {
        const { orderId, otp } = req.body;
        if (!orderId || !otp) {
            return res.status(400).json({ success: false, message: 'orderId and otp are required' });
        }

        let query = supabase_1.supabase.from('orders').select('id, order_code, batch_id, assigned_agent_id, delivery_status, order_status');
        if (orderId.includes('-') && orderId.length > 15) {
            query = query.eq('id', orderId).single();
        } else {
            query = query.eq('order_code', orderId).single();
        }
        const { data: order, error } = await query;
        if (error || !order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        const userRole = req.user?.role || req.user?.user_metadata?.role;
        const userId = req.user?.id;

        // Authorization: Only assigned delivery partner or admin can verify completion
        if (userRole === 'delivery_partner') {
            if (order.assigned_agent_id && order.assigned_agent_id !== userId) {
                return res.status(403).json({ success: false, message: 'Forbidden: You are not assigned to deliver this order' });
            }
        } else if (userRole !== 'admin') {
            return res.status(403).json({ success: false, message: 'Forbidden: Insufficient permissions to complete delivery verification' });
        }

        // Replay Protection: Order must not already be marked delivered
        if (order.delivery_status === 'DELIVERED' || order.order_status === 'DELIVERED') {
            return res.status(400).json({ success: false, message: 'Order has already been verified and delivered' });
        }

        const cleanOtp = String(otp).trim();
        const { data: verification, error: vFetchErr } = await supabase_1.supabase
            .from('delivery_verifications')
            .select('*')
            .eq('order_id', order.id)
            .single();

        // Fail closed: Missing or unreadable verification record prevents delivery
        if (vFetchErr || !verification || !verification.otp_code) {
            return res.status(400).json({
                success: false,
                message: 'Delivery verification record not found or uninitialized for this order. Please contact dispatch support.'
            });
        }

        if (verification.is_verified) {
            return res.status(400).json({ success: false, message: 'Order has already been verified and delivered' });
        }

        // Attempt limit lock (max 5 failed attempts)
        if ((verification.attempts || 0) >= 5) {
            return res.status(429).json({
                success: false,
                message: 'Verification attempt limit exceeded (maximum 5 attempts). Order locked. Please contact support.'
            });
        }

        // Validate submitted OTP against database record
        if (verification.otp_code !== cleanOtp) {
            await supabase_1.supabase.from('delivery_verifications').update({
                attempts: (verification.attempts || 0) + 1
            }).eq('id', verification.id);

            return res.status(400).json({
                success: false,
                message: `Invalid OTP code. Please re-check with customer (Attempt ${(verification.attempts || 0) + 1}/5).`
            });
        }

        // OTP is valid: Update verification record
        await supabase_1.supabase.from('delivery_verifications').update({
            is_verified: true,
            verified_at: new Date().toISOString()
        }).eq('id', verification.id);

        // Update order status to DELIVERED
        await supabase_1.supabase.from('orders').update({
            order_status: 'DELIVERED',
            delivery_status: 'DELIVERED',
            aggregation_status: 'COMPLETED'
        }).eq('id', order.id);

        // Record status log
        try {
            await supabase_1.supabase.from('order_status_logs').insert({
                order_id: order.id,
                previous_status: order.delivery_status || 'OUT_FOR_DELIVERY',
                new_status: 'DELIVERED',
                notes: 'OTP Handover verified successfully at doorstep'
            });
        } catch (logErr) {}

        // Auto-complete parent batch if all member orders are now DELIVERED
        let batchCompleted = false;
        try {
            if (order.batch_id) {
                const { data: batchOrders } = await supabase_1.supabase
                    .from('orders')
                    .select('id, delivery_status')
                    .eq('batch_id', order.batch_id);

                const allDone = batchOrders && batchOrders.every(o => o.delivery_status === 'DELIVERED' || o.id === order.id);
                if (allDone) {
                    await supabase_1.supabase.from('delivery_batches').update({
                        status: 'COMPLETED',
                        aggregation_status: 'COMPLETED'
                    }).eq('id', order.batch_id);
                    batchCompleted = true;
                }
            }
        } catch (bErr) {
            console.warn('Batch completion check skipped:', bErr?.message);
        }

        // Restore courier availability if no active orders remain
        try {
            const agentToCheck = order.assigned_agent_id || (userRole === 'delivery_partner' ? userId : null);
            if (agentToCheck) {
                let q = supabase_1.supabase.from('orders').select('id, delivery_status, order_status').eq('assigned_agent_id', agentToCheck);
                if (typeof q.neq === 'function') {
                    q = q.neq('delivery_status', 'DELIVERED').neq('order_status', 'CANCELLED');
                }
                const { data: remainingActive } = await q;
                const stillActive = (remainingActive || []).filter(o => o.delivery_status !== 'DELIVERED' && o.order_status !== 'CANCELLED' && o.id !== order.id);

                if (stillActive.length === 0) {
                    await supabase_1.supabase.from('delivery_agents').update({
                        availability: 'Available',
                        status: 'Active'
                    }).eq('id', agentToCheck);
                }
            }
        } catch (agentErr) {
            console.warn('Agent availability update skipped:', agentErr?.message);
        }


        res.json({
            success: true,
            message: `Order ${order.order_code} successfully verified and delivered!`,
            data: {
                orderId: order.order_code,
                status: 'DELIVERED',
                batchCompleted
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
exports.verifyDeliveryOtp = verifyDeliveryOtp;

const triggerAutomaticAggregation = async (req, res) => {
    try {
        const result = await (0, aggregation_service_1.runAutomaticAggregation)();
        res.json({
            success: true,
            data: result
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
exports.triggerAutomaticAggregation = triggerAutomaticAggregation;

const getAggregationOverview = async (req, res) => {
    try {
        // 1. Eligible ready orders waiting for aggregation
        const { data: eligibleOrders } = await supabase_1.supabase
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

        // 2. All batches
        const { data: allBatches } = await supabase_1.supabase
            .from('delivery_batches')
            .select(`
                *,
                agent:delivery_agents(id, legacy_id, profile:profiles(username, phone)),
                orders:orders!orders_batch_id_fkey(id, order_code, pickup_location, delivery_location, vendor:vendors(id, legacy_id, shop_name))
            `)
            .order('created_at', { ascending: false });

        const mappedBatches = (allBatches || []).map(b => (0, mappings_1.mapBatchToFrontend)(b));
        const awaitingAgentBatches = mappedBatches.filter(b => b.status === 'Pending Assignment' || !b.agentId);
        const assignedBatches = mappedBatches.filter(b => b.status !== 'Pending Assignment' && b.agentId);

        res.json({
            success: true,
            data: {
                minBatchSize: aggregation_service_1.MIN_BATCH_SIZE,
                maxBatchSize: aggregation_service_1.MAX_BATCH_SIZE,
                eligibleOrders: (eligibleOrders || []).map(o => (0, mappings_1.mapOrderToFrontend)(o)),
                queuedCount: eligibleOrders ? eligibleOrders.length : 0,
                confirmedBatchesCount: mappedBatches.length,
                awaitingAgentCount: awaitingAgentBatches.length,
                assignedBatchesCount: assignedBatches.length,
                batches: mappedBatches,
                awaitingAgentBatches,
                assignedBatches
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
exports.getAggregationOverview = getAggregationOverview;
