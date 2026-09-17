"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateOrderStatus = exports.createOrder = exports.getOrderById = exports.getOrders = void 0;
const supabase_1 = require("../config/supabase");
const mappings_1 = require("../utils/mappings");
const getOrders = async (req, res) => {
    try {
        let query = supabase_1.supabase.from('orders').select(`
      *,
      customer:customer_profiles(id, legacy_id, profile:profiles(username, email)),
      vendor:vendors(id, legacy_id, shop_name),
      order_items(qty, price, product:products(id, legacy_id, name)),
      batch:delivery_batches(id, batch_code),
      assigned_agent:delivery_agents(id, profile:profiles(username, phone))
    `);
        // Role-based filtering
        const userRole = req.user?.user_metadata?.role || req.user?.role;
        const userId = req.user?.id;
        if (userRole === 'customer') {
            query = query.eq('customer_id', userId);
        }
        else if (userRole === 'vendor') {
            query = query.eq('vendor_id', userId);
        }
        else if (userRole === 'delivery_partner') {
            query = query.eq('assigned_agent_id', userId);
        }
        const { data, error } = await query.order('created_at', { ascending: false });
        if (error)
            throw error;
        const orders = data.map((o) => (0, mappings_1.mapOrderToFrontend)(o));
        res.json({ success: true, data: orders });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
exports.getOrders = getOrders;
const getOrderById = async (req, res) => {
    try {
        const { id } = req.params;
        const { data, error } = await supabase_1.supabase.from('orders').select(`
      *,
      customer:customer_profiles(id, legacy_id, profile:profiles(username, email)),
      vendor:vendors(id, legacy_id, shop_name),
      order_items(qty, price, product:products(id, legacy_id, name)),
      batch:delivery_batches(id, batch_code),
      assigned_agent:delivery_agents(id, profile:profiles(username, phone))
    `).eq('order_code', id).single();
        if (error || !data)
            return res.status(404).json({ success: false, message: 'Order not found' });
        // Authorization check
        const userRole = req.user?.user_metadata?.role || req.user?.role;
        const userId = req.user?.id;
        if (userRole === 'customer' && data.customer_id !== userId)
            return res.status(403).json({ success: false, message: 'Forbidden' });
        if (userRole === 'vendor' && data.vendor_id !== userId)
            return res.status(403).json({ success: false, message: 'Forbidden' });
        if (userRole === 'delivery_partner' && data.assigned_agent_id !== userId)
            return res.status(403).json({ success: false, message: 'Forbidden' });
        res.json({ success: true, data: (0, mappings_1.mapOrderToFrontend)(data) });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
exports.getOrderById = getOrderById;
const createOrder = async (req, res) => {
    // Omitted validation for brevity
    try {
        const { vendorId, items, deliveryLocation, deliveryDate, deliveryTimeSlot } = req.body;
        // Resolve vendor UUID
        let vId = vendorId;
        if (!vId.includes('-')) {
            const { data: vData } = await supabase_1.supabase.from('vendors').select('id').eq('legacy_id', vendorId).single();
            if (!vData)
                return res.status(400).json({ success: false, message: 'Invalid vendorId' });
            vId = vData.id;
        }
        // Resolve customer UUID
        let customerId = req.user?.id;
        if (req.user?.user_metadata?.role === 'admin' && req.body.customerId) {
            const { data: cData } = await supabase_1.supabase.from('customer_profiles').select('id').eq('legacy_id', req.body.customerId).single();
            customerId = cData ? cData.id : req.body.customerId;
        }
        const { data: vendorData } = await supabase_1.supabase.from('vendors').select('address').eq('id', vId).single();
        const orderCode = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;
        const total = items.reduce((acc, item) => acc + (item.price * item.qty), 0);
        const { data: newOrder, error } = await supabase_1.supabase.from('orders').insert({
            order_code: orderCode,
            customer_id: customerId,
            vendor_id: vId,
            total: total,
            pickup_location: vendorData?.address || 'Vendor',
            delivery_location: deliveryLocation,
            delivery_date: deliveryDate,
            delivery_time_slot: deliveryTimeSlot,
            order_status: 'PLACED',
            delivery_status: 'PENDING_ASSIGNMENT',
            aggregation_status: 'WAITING_FOR_AGGREGATION'
        }).select().single();
        if (error)
            throw error;
        // Insert items
        for (const item of items) {
            let pId = item.productId;
            if (!pId.includes('-')) {
                const { data: pData } = await supabase_1.supabase.from('products').select('id').eq('legacy_id', pId).single();
                if (pData)
                    pId = pData.id;
            }
            await supabase_1.supabase.from('order_items').insert({
                order_id: newOrder.id,
                product_id: pId,
                qty: item.qty,
                price: item.price
            });
        }
        res.status(201).json({ success: true, data: { orderId: orderCode } });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
exports.createOrder = createOrder;
const updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const { data: order, error: err1 } = await supabase_1.supabase.from('orders').select('*').eq('order_code', id).single();
        if (err1 || !order)
            return res.status(404).json({ success: false, message: 'Order not found' });
        const userRole = req.user?.user_metadata?.role || req.user?.role;
        const userId = req.user?.id;
        if (userRole === 'vendor' && order.vendor_id !== userId)
            return res.status(403).json({ success: false, message: 'Forbidden' });
        if (userRole === 'delivery_partner' && order.assigned_agent_id !== userId)
            return res.status(403).json({ success: false, message: 'Forbidden' });
        let deliveryStatus = order.delivery_status;
        let aggregationStatus = order.aggregation_status;
        if (status === 'CONFIRMED')
            deliveryStatus = 'PENDING_ASSIGNMENT';
        if (status === 'READY_FOR_DELIVERY') {
            deliveryStatus = 'PENDING_ASSIGNMENT';
            aggregationStatus = 'WAITING_FOR_AGGREGATION';
        }
        if (status === 'PICKED_UP') {
            deliveryStatus = 'PICKED_UP';
            aggregationStatus = 'OUT_FOR_DELIVERY';
        }
        if (status === 'OUT_FOR_DELIVERY') {
            deliveryStatus = 'OUT_FOR_DELIVERY';
            aggregationStatus = 'OUT_FOR_DELIVERY';
        }
        if (status === 'DELIVERED') {
            deliveryStatus = 'DELIVERED';
            aggregationStatus = 'COMPLETED';
        }
        const { data, error } = await supabase_1.supabase.from('orders').update({
            order_status: status,
            delivery_status: deliveryStatus,
            aggregation_status: aggregationStatus
        }).eq('id', order.id).select(`
      *,
      customer:customer_profiles(id, legacy_id, profile:profiles(username, email)),
      vendor:vendors(id, legacy_id, shop_name),
      order_items(qty, price, product:products(id, legacy_id, name)),
      batch:delivery_batches(id, batch_code),
      assigned_agent:delivery_agents(id, profile:profiles(username, phone))
    `).single();
        if (error)
            throw error;
        res.json({ success: true, data: (0, mappings_1.mapOrderToFrontend)(data) });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
exports.updateOrderStatus = updateOrderStatus;
