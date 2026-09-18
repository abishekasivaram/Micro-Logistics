"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateBatchStatus = exports.assignBatch = exports.createBatch = exports.getBatchById = exports.getBatches = exports.getAgentById = exports.getAgents = void 0;
const supabase_1 = require("../config/supabase");
const mappings_1 = require("../utils/mappings");
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
      agent:delivery_agents(id, legacy_id, profile:profiles(username)),
      orders(id, order_code, pickup_location, delivery_location, vendor:vendors(id, legacy_id, shop_name))
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
        const { data, error } = await supabase_1.supabase.from('delivery_batches').select(`
      *,
      agent:delivery_agents(id, legacy_id, profile:profiles(username)),
      orders(id, order_code, pickup_location, delivery_location, vendor:vendors(id, legacy_id, shop_name))
    `).eq('batch_code', id).single();
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
        const { orderIds, estimatedDistance, estimatedTime, deliveryDate, deliverySlot } = req.body;
        const batchCode = `B-${Math.floor(1000 + Math.random() * 9000)}`;
        // Resolve order UUIDs
        const { data: dbOrders } = await supabase_1.supabase.from('orders').select('id, order_code').in('order_code', orderIds);
        if (!dbOrders || dbOrders.length !== orderIds.length)
            return res.status(400).json({ success: false, message: 'Some orders not found' });
        const { data: batch, error } = await supabase_1.supabase.from('delivery_batches').insert({
            batch_code: batchCode,
            order_count: orderIds.length,
            estimated_distance: estimatedDistance,
            estimated_time: estimatedTime,
            delivery_date: deliveryDate || new Date().toISOString().split('T')[0],
            delivery_slot: deliverySlot || '9:00 AM – 1:00 PM',
            status: 'PENDING_ASSIGNMENT',
            aggregation_status: 'BATCH_CREATED'
        }).select().single();
        if (error)
            throw error;
        // Create delivery_batch_orders mapping and update orders.batch_id
        for (const order of dbOrders) {
            await supabase_1.supabase.from('delivery_batch_orders').insert({ batch_id: batch.id, order_id: order.id });
            await supabase_1.supabase.from('orders').update({
                batch_id: batch.id,
                aggregation_status: 'BATCH_CREATED',
                delivery_status: 'PENDING_ASSIGNMENT'
            }).eq('id', order.id);
        }
        res.status(201).json({ success: true, data: { batchId: batchCode } });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
exports.createBatch = createBatch;
const assignBatch = async (req, res) => {
    try {
        const { id } = req.params;
        const { agentId } = req.body;
        let aId = agentId;
        if (!aId.includes('-')) {
            const { data: aData } = await supabase_1.supabase.from('delivery_agents').select('id').eq('legacy_id', agentId).single();
            if (!aData)
                return res.status(400).json({ success: false, message: 'Agent not found' });
            aId = aData.id;
        }
        const { data: batch, error } = await supabase_1.supabase.from('delivery_batches').update({
            agent_id: aId,
            status: 'ASSIGNED',
            aggregation_status: 'ASSIGNED'
        }).eq('batch_code', id).select().single();
        if (error)
            throw error;
        await supabase_1.supabase.from('orders').update({
            assigned_agent_id: aId,
            order_status: 'ASSIGNED',
            delivery_status: 'ASSIGNED',
            aggregation_status: 'ASSIGNED'
        }).eq('batch_id', batch.id);
        res.json({ success: true, message: `Batch ${id} assigned to agent` });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
exports.assignBatch = assignBatch;
const updateBatchStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body; // e.g. 'Pickup in Progress' or DB enum 'PICKUP_IN_PROGRESS'
        let dbStatus = status;
        if (status === 'Pickup in Progress')
            dbStatus = 'PICKUP_IN_PROGRESS';
        if (status === 'Out for Delivery')
            dbStatus = 'OUT_FOR_DELIVERY';
        if (status === 'Completed' || status === 'Delivered')
            dbStatus = 'COMPLETED';
        if (status === 'Picked Up')
            dbStatus = 'PICKED_UP';
        const { data: batch, error: err1 } = await supabase_1.supabase.from('delivery_batches').select('*').eq('batch_code', id).single();
        if (err1 || !batch)
            return res.status(404).json({ success: false, message: 'Batch not found' });
        const userRole = req.user?.user_metadata?.role || req.user?.role;
        const userId = req.user?.id;
        if (userRole === 'delivery_partner' && batch.agent_id !== userId)
            return res.status(403).json({ success: false, message: 'Forbidden' });
        const updatePayload = { status: dbStatus };
        if (dbStatus === 'COMPLETED') {
            updatePayload.aggregation_status = 'COMPLETED';
        }
        
        const { error } = await supabase_1.supabase.from('delivery_batches').update(updatePayload).eq('id', batch.id);
        if (error)
            throw error;
        // Propagate to orders if needed
        if (dbStatus === 'OUT_FOR_DELIVERY') {
            await supabase_1.supabase.from('orders').update({
                order_status: 'OUT_FOR_DELIVERY',
                delivery_status: 'OUT_FOR_DELIVERY'
            }).eq('batch_id', batch.id);
        }
        else if (dbStatus === 'COMPLETED') {
            await supabase_1.supabase.from('orders').update({
                order_status: 'DELIVERED',
                delivery_status: 'DELIVERED',
                aggregation_status: 'COMPLETED'
            }).eq('batch_id', batch.id);
        }
        res.json({ success: true, message: `Batch ${id} updated to ${status}` });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
exports.updateBatchStatus = updateBatchStatus;
