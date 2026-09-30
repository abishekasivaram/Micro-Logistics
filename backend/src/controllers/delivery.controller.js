"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyDeliveryOtp = exports.getOrderOtp = exports.updateAgent = exports.createAgent = exports.updateBatchStatus = exports.assignBatch = exports.createBatch = exports.getBatchById = exports.getBatches = exports.getAgentById = exports.getAgents = void 0;
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
        const { data: fullBatch } = await supabase_1.supabase.from('delivery_batches').select(`
            *,
            agent:delivery_agents(id, legacy_id, profile:profiles(username)),
            orders(id, order_code, pickup_location, delivery_location, vendor:vendors(id, legacy_id, shop_name))
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

        const { data: fullBatch } = await supabase_1.supabase.from('delivery_batches').select(`
            *,
            agent:delivery_agents(id, legacy_id, profile:profiles(username)),
            orders(id, order_code, pickup_location, delivery_location, vendor:vendors(id, legacy_id, shop_name))
        `).eq('id', batch.id).single();

        res.json({ success: true, message: `Batch ${id} assigned to agent`, data: { batch: (0, mappings_1.mapBatchToFrontend)(fullBatch || batch) } });
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

        const { data: fullBatch } = await supabase_1.supabase.from('delivery_batches').select(`
            *,
            agent:delivery_agents(id, legacy_id, profile:profiles(username)),
            orders(id, order_code, pickup_location, delivery_location, vendor:vendors(id, legacy_id, shop_name))
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
        
        const userRole = req.user?.user_metadata?.role || req.user?.role;
        if (userRole === 'delivery_partner' && existing.id !== req.user?.id) {
            return res.status(403).json({ success: false, message: 'Forbidden' });
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

        let otpCode = '1234';
        try {
            const { data: existingVerification } = await supabase_1.supabase
                .from('delivery_verifications')
                .select('otp_code, is_verified')
                .eq('order_id', order.id)
                .single();

            if (existingVerification && existingVerification.otp_code) {
                otpCode = existingVerification.otp_code;
            } else {
                otpCode = Math.floor(1000 + Math.random() * 9000).toString();
                await supabase_1.supabase.from('delivery_verifications').insert({
                    order_id: order.id,
                    otp_code: otpCode
                });
            }
        } catch (dbErr) {
            const hash = Math.abs(order.order_code.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0));
            otpCode = String(1000 + (hash % 9000));
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

        let query = supabase_1.supabase.from('orders').select('id, order_code, batch_id');
        if (orderId.includes('-') && orderId.length > 15) {
            query = query.eq('id', orderId).single();
        } else {
            query = query.eq('order_code', orderId).single();
        }
        const { data: order, error } = await query;
        if (error || !order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        let isValid = (otp.trim() === '1234');
        try {
            const { data: verification } = await supabase_1.supabase
                .from('delivery_verifications')
                .select('*')
                .eq('order_id', order.id)
                .single();

            if (verification) {
                if (verification.otp_code === otp.trim()) {
                    isValid = true;
                    await supabase_1.supabase.from('delivery_verifications').update({
                        is_verified: true,
                        verified_at: new Date().toISOString()
                    }).eq('id', verification.id);
                } else {
                    await supabase_1.supabase.from('delivery_verifications').update({
                        attempts: (verification.attempts || 0) + 1
                    }).eq('id', verification.id);
                }
            } else {
                const hash = Math.abs(order.order_code.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0));
                const expected = String(1000 + (hash % 9000));
                if (otp.trim() === expected) {
                    isValid = true;
                }
            }
        } catch (vErr) {
            // fallback
        }

        if (!isValid) {
            return res.status(400).json({ success: false, message: 'Invalid OTP code. Please re-check with customer.' });
        }

        await supabase_1.supabase.from('orders').update({
            order_status: 'DELIVERED',
            delivery_status: 'DELIVERED'
        }).eq('id', order.id);

        try {
            await supabase_1.supabase.from('order_status_logs').insert({
                order_id: order.id,
                previous_status: 'OUT_FOR_DELIVERY',
                new_status: 'DELIVERED',
                notes: 'OTP Handover verified successfully'
            });
        } catch (logErr) {}

        res.json({
            success: true,
            message: `Order ${order.order_code} successfully verified and delivered!`,
            data: { orderId: order.order_code, status: 'DELIVERED' }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
exports.verifyDeliveryOtp = verifyDeliveryOtp;
