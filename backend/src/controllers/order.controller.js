"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateOrderStatus = exports.createOrder = exports.getOrderById = exports.getOrders = void 0;
const supabase_1 = require("../config/supabase");
const mappings_1 = require("../utils/mappings");
const aggregation_service_1 = require("../services/aggregation.service");
const getOrders = async (req, res) => {
    try {
        let query = supabase_1.supabase.from('orders').select(`
      *,
      customer:customer_profiles(id, legacy_id, profile:profiles(username, email)),
      vendor:vendors(id, legacy_id, shop_name),
      order_items(qty, price, product:products(id, legacy_id, name)),
      batch:delivery_batches!orders_batch_id_fkey(id, batch_code),
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
      batch:delivery_batches!orders_batch_id_fkey(id, batch_code),
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
    try {
        const { vendorId, items, deliveryLocation, deliveryDate, deliveryTimeSlot } = req.body;
        
        if (!vendorId || !items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ success: false, message: 'Vendor and items are required' });
        }

        const userRole = req.user?.role || req.user?.user_metadata?.role;
        if (userRole !== 'customer' && userRole !== 'admin') {
            return res.status(403).json({ success: false, message: 'Only customers or administrators can place orders' });
        }

        // Resolve vendor UUID
        let vId = vendorId;
        if (typeof vId === 'string' && !vId.includes('-')) {
            const { data: vData } = await supabase_1.supabase.from('vendors').select('id').eq('legacy_id', vendorId).single();
            if (!vData)
                return res.status(400).json({ success: false, message: 'Invalid vendorId' });
            vId = vData.id;
        }

        // Derive trusted customer UUID from authenticated session
        let customerId = req.user.id;
        if (userRole === 'admin' && req.body.customerId) {
            const clientCustId = req.body.customerId;
            if (typeof clientCustId === 'string' && !clientCustId.includes('-')) {
                const { data: cData } = await supabase_1.supabase.from('customer_profiles').select('id').eq('legacy_id', clientCustId).single();
                customerId = cData ? cData.id : clientCustId;
            } else {
                customerId = clientCustId;
            }
        }

        const { data: vendorData } = await supabase_1.supabase.from('vendors').select('address').eq('id', vId).single();
        const orderCode = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;

        // Validate items and resolve trusted prices from product catalog
        const verifiedItems = [];
        let calculatedTotal = 0;

        for (const item of items) {
            const qty = Number(item.qty);
            if (isNaN(qty) || qty <= 0 || !Number.isInteger(qty)) {
                return res.status(400).json({ success: false, message: 'Item quantity must be a positive integer' });
            }

            let pId = item.productId;
            let productRecord = null;
            if (typeof pId === 'string' && !pId.includes('-')) {
                const { data: pData } = await supabase_1.supabase.from('products').select('*').eq('legacy_id', pId).single();
                productRecord = pData;
            } else {
                const { data: pData } = await supabase_1.supabase.from('products').select('*').eq('id', pId).single();
                productRecord = pData;
            }

            if (!productRecord) {
                return res.status(400).json({ success: false, message: `Product not found: ${item.productId}` });
            }

            // Verify product belongs to specified vendor
            if (productRecord.vendor_id && productRecord.vendor_id !== vId) {
                return res.status(400).json({ success: false, message: `Product ${productRecord.name} does not belong to the selected vendor` });
            }

            // Verify stock availability
            if ((productRecord.stock || 0) < qty) {
                return res.status(400).json({ success: false, message: `Insufficient stock for product: ${productRecord.name}` });
            }

            const trustedPrice = Number(productRecord.price) || 0;
            calculatedTotal += (trustedPrice * qty);
            verifiedItems.push({
                productId: productRecord.id,
                qty: qty,
                price: trustedPrice,
                currentStock: productRecord.stock
            });
        }

        const { data: newOrder, error } = await supabase_1.supabase.from('orders').insert({
            order_code: orderCode,
            customer_id: customerId,
            vendor_id: vId,
            total: calculatedTotal,
            pickup_location: vendorData?.address || 'Vendor',
            delivery_location: deliveryLocation || 'Local Delivery Address',
            delivery_date: deliveryDate || new Date().toISOString().split('T')[0],
            delivery_time_slot: deliveryTimeSlot || '9:00 AM – 1:00 PM',
            order_status: 'PLACED',
            delivery_status: 'PENDING_ASSIGNMENT',
            aggregation_status: 'WAITING_FOR_AGGREGATION'
        }).select().single();

        if (error)
            throw error;

        // Insert order items and decrement stock
        for (const item of verifiedItems) {
            await supabase_1.supabase.from('order_items').insert({
                order_id: newOrder.id,
                product_id: item.productId,
                qty: item.qty,
                price: item.price
            });

            const newStock = Math.max(0, (item.currentStock || 0) - item.qty);
            const newStatus = (newStock > 10) ? 'In Stock' : (newStock > 0 ? 'Low Stock' : 'Out of Stock');
            await supabase_1.supabase.from('products').update({ stock: newStock, status: newStatus }).eq('id', item.productId);
        }

        // Initialize delivery verification PIN for customer handover
        try {
            const otpCode = Math.floor(1000 + Math.random() * 9000).toString();
            await supabase_1.supabase.from('delivery_verifications').insert({
                order_id: newOrder.id,
                otp_code: otpCode,
                is_verified: false,
                attempts: 0
            });
        } catch (otpErr) {}

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
        
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
        let order = null;
        if (isUUID) {
            const query = supabase_1.supabase.from('orders').select('*').eq('id', id);
            const { data } = typeof query.maybeSingle === 'function' ? await query.maybeSingle() : await query.single();
            order = data;
        } else {
            const query = supabase_1.supabase.from('orders').select('*').eq('order_code', id);
            const { data } = typeof query.maybeSingle === 'function' ? await query.maybeSingle() : await query.single();
            order = data;
        }
        if (!order)
            return res.status(404).json({ success: false, message: 'Order not found' });

        const userRole = req.user?.role || req.user?.user_metadata?.role;
        const userId = req.user?.id;

        // Customers are strictly forbidden from changing order statuses
        if (userRole === 'customer') {
            return res.status(403).json({ success: false, message: 'Forbidden: Customers cannot update order fulfillment status' });
        }

        // Vendors can only manage their own orders and valid preparation statuses
        if (userRole === 'vendor') {
            let isOwner = (order.vendor_id === userId);
            if (!isOwner) {
                try {
                    const query = supabase_1.supabase.from('vendors').select('id, legacy_id');
                    const { data: vendorRecord } = typeof query.maybeSingle === 'function'
                        ? await query.or(`id.eq.${userId},legacy_id.eq.${userId}`).maybeSingle()
                        : await query.or(`id.eq.${userId},legacy_id.eq.${userId}`).single();
                    if (vendorRecord && (order.vendor_id === vendorRecord.id || order.vendor_id === vendorRecord.legacy_id)) {
                        isOwner = true;
                    }
                } catch (e) {
                    // Not found or DB error, isOwner remains false
                }
            }
            if (!isOwner) {
                return res.status(403).json({ success: false, message: 'Forbidden: You do not own this order' });
            }
            const allowedVendorStatuses = ['CONFIRMED', 'PREPARING', 'READY_FOR_DELIVERY', 'READY', 'HANDED_OVER', 'PICKED_UP', 'CANCELLED'];
            if (status && !allowedVendorStatuses.includes(status)) {
                return res.status(403).json({ success: false, message: 'Forbidden: Vendors cannot transition orders to this status' });
            }

            // Vendor Handover rule: Only allowed when a delivery person is confirmed assigned by backend
            if (status === 'HANDED_OVER' || status === 'PICKED_UP') {
                if (!order.assigned_agent_id) {
                    return res.status(400).json({ 
                        success: false, 
                        message: 'Cannot confirm handover: A delivery person has not yet been assigned by Admin' 
                    });
                }
            }
        }

        // Delivery partners can only update their assigned orders and delivery progression
        if (userRole === 'delivery_partner') {
            if (order.assigned_agent_id !== userId) {
                return res.status(403).json({ success: false, message: 'Forbidden: Not assigned to this delivery' });
            }
            if (status === 'DELIVERED') {
                return res.status(400).json({ success: false, message: 'Delivery completion requires OTP verification via /delivery/verify-otp' });
            }
        }

        if (userRole !== 'admin' && userRole !== 'vendor' && userRole !== 'delivery_partner') {
            return res.status(403).json({ success: false, message: 'Forbidden: Insufficient permissions' });
        }

        let deliveryStatus = order.delivery_status;
        let aggregationStatus = order.aggregation_status;
        let dbOrderStatus = status;
        let batchIdToSet = order.batch_id;

        if (status === 'CANCELLED') {
            if (order.order_status === 'DELIVERED' || order.delivery_status === 'DELIVERED') {
                return res.status(400).json({ success: false, message: 'Cannot cancel an order that has already been delivered' });
            }
            if (order.order_status === 'OUT_FOR_DELIVERY' || order.delivery_status === 'OUT_FOR_DELIVERY') {
                return res.status(400).json({ success: false, message: 'Cannot cancel an order that is currently out for delivery' });
            }

            dbOrderStatus = 'CANCELLED';
            deliveryStatus = 'FAILED';
            aggregationStatus = 'COMPLETED';
            batchIdToSet = null;

            // 1. Restore reserved inventory back to products catalog
            try {
                const { data: itemsToRestore } = await supabase_1.supabase
                    .from('order_items')
                    .select('product_id, qty')
                    .eq('order_id', order.id);

                if (itemsToRestore && itemsToRestore.length > 0) {
                    for (const it of itemsToRestore) {
                        const { data: pRec } = await supabase_1.supabase
                            .from('products')
                            .select('stock')
                            .eq('id', it.product_id)
                            .single();

                        if (pRec) {
                            const restoredStock = (pRec.stock || 0) + it.qty;
                            const restoredStatus = restoredStock > 10 ? 'In Stock' : (restoredStock > 0 ? 'Low Stock' : 'Out of Stock');
                            await supabase_1.supabase
                                .from('products')
                                .update({ stock: restoredStock, status: restoredStatus })
                                .eq('id', it.product_id);
                        }
                    }
                }
            } catch (stockErr) {
                console.error('Failed to restore stock on order cancellation:', stockErr);
            }

            // 2. Unlink from batch if order was already batched
            if (order.batch_id) {
                try {
                    await supabase_1.supabase.from('delivery_batch_orders').delete().eq('order_id', order.id);
                    const { data: bRec } = await supabase_1.supabase.from('delivery_batches').select('order_count').eq('id', order.batch_id).single();
                    if (bRec) {
                        const newCount = Math.max(0, (bRec.order_count || 1) - 1);
                        await supabase_1.supabase.from('delivery_batches').update({ order_count: newCount }).eq('id', order.batch_id);
                    }
                } catch (bErr) {
                    console.error('Failed to update batch on order cancellation:', bErr);
                }
            }
        }
        else if (status === 'CONFIRMED' || status === 'PREPARING') {
            dbOrderStatus = 'PREPARING';
            deliveryStatus = 'PENDING_ASSIGNMENT';
            if (!aggregationStatus) aggregationStatus = 'WAITING_FOR_AGGREGATION';
        }
        else if (status === 'READY_FOR_DELIVERY' || status === 'READY') {
            dbOrderStatus = 'READY_FOR_DELIVERY';
            deliveryStatus = 'PENDING_ASSIGNMENT';
            aggregationStatus = 'WAITING_FOR_AGGREGATION';
        }
        else if (status === 'HANDED_OVER' || status === 'PICKED_UP') {
            dbOrderStatus = (order.order_status === 'READY_FOR_DELIVERY' || order.order_status === 'PREPARING') ? 'ASSIGNED' : order.order_status;
            deliveryStatus = 'PICKED_UP';
        }
        else if (status === 'OUT_FOR_DELIVERY') {
            // Require pickup confirmation before starting transit.
            if (order.delivery_status !== 'PICKED_UP' && userRole !== 'admin') {
                return res.status(400).json({
                    success: false,
                    message: 'Cannot start transit: Vendor handover must be confirmed before the order can be marked out for delivery'
                });
            }
            dbOrderStatus = 'OUT_FOR_DELIVERY';
            deliveryStatus = 'OUT_FOR_DELIVERY';
        }
        else if (status === 'DELIVERED') {
            // Doorstep delivery requires OTP verification; direct status mutation is rejected unless admin override
            if (userRole !== 'admin') {
                return res.status(400).json({ success: false, message: 'Delivery completion requires OTP verification via /delivery/verify-otp' });
            }
            dbOrderStatus = 'DELIVERED';
            deliveryStatus = 'DELIVERED';
            aggregationStatus = 'COMPLETED';
        }

        const updatePayload = {
            order_status: dbOrderStatus,
            delivery_status: deliveryStatus,
            aggregation_status: aggregationStatus
        };
        if (status === 'CANCELLED') {
            updatePayload.batch_id = null;
        }

        const { data, error } = await supabase_1.supabase.from('orders').update(updatePayload).eq('id', order.id).select(`

      *,
      customer:customer_profiles(id, legacy_id, profile:profiles(username, email)),
      vendor:vendors(id, legacy_id, shop_name),
      order_items(qty, price, product:products(id, legacy_id, name)),
      batch:delivery_batches!orders_batch_id_fkey(id, batch_code),
      assigned_agent:delivery_agents(id, profile:profiles(username, phone))
    `).single();
        if (error)
            throw error;

        // Automatically trigger AI aggregation & courier assignment if order transitioned to READY_FOR_DELIVERY
        if (dbOrderStatus === 'READY_FOR_DELIVERY') {
            (0, aggregation_service_1.runAutomaticAggregation)().catch(err => {
                console.error('Background auto-aggregation error:', err.message);
            });
        }

        res.json({ success: true, data: (0, mappings_1.mapOrderToFrontend)(data) });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
exports.updateOrderStatus = updateOrderStatus;
