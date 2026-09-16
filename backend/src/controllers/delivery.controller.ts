import { Request, Response } from 'express';
import { supabase } from '../config/supabase';
import { mapBatchToFrontend, mapAgentToFrontend } from '../utils/mappings';

export const getAgents = async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase.from('delivery_agents').select(`*, profile:profiles(username, phone)`);
    if (error) throw error;
    res.json({ success: true, data: data.map(a => mapAgentToFrontend(a)) });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getAgentById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    let query: any = supabase.from('delivery_agents').select(`*, profile:profiles(username, phone)`);
    if (id.includes('-')) query = query.eq('id', id).single();
    else query = query.eq('legacy_id', id).single();
    
    const { data, error } = await query;
    if (error || !data) return res.status(404).json({ success: false, message: 'Agent not found' });
    
    // Auth check
    const userRole = req.user?.user_metadata?.role || req.user?.role;
    if (userRole === 'delivery_partner' && data.id !== req.user?.id) {
        return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    res.json({ success: true, data: mapAgentToFrontend(data) });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getBatches = async (req: Request, res: Response) => {
  try {
    let query: any = supabase.from('delivery_batches').select(`
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
    if (error) throw error;

    const batches = data.map((b: any) => mapBatchToFrontend(b));
    res.json({ success: true, data: batches });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getBatchById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase.from('delivery_batches').select(`
      *,
      agent:delivery_agents(id, legacy_id, profile:profiles(username)),
      orders(id, order_code, pickup_location, delivery_location, vendor:vendors(id, legacy_id, shop_name))
    `).eq('batch_code', id).single();

    if (error || !data) return res.status(404).json({ success: false, message: 'Batch not found' });

    const userRole = req.user?.user_metadata?.role || req.user?.role;
    if (userRole === 'delivery_partner' && data.agent_id !== req.user?.id) return res.status(403).json({ success: false, message: 'Forbidden' });

    res.json({ success: true, data: mapBatchToFrontend(data) });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const createBatch = async (req: Request, res: Response) => {
  try {
    const { orderIds, estimatedDistance, estimatedTime, deliveryDate, deliverySlot } = req.body;
    const batchCode = `B-${Math.floor(1000 + Math.random() * 9000)}`;

    // Resolve order UUIDs
    const { data: dbOrders } = await supabase.from('orders').select('id, order_code').in('order_code', orderIds);
    if (!dbOrders || dbOrders.length !== orderIds.length) return res.status(400).json({ success: false, message: 'Some orders not found' });

    const { data: batch, error } = await supabase.from('delivery_batches').insert({
      batch_code: batchCode,
      order_count: orderIds.length,
      estimated_distance: estimatedDistance,
      estimated_time: estimatedTime,
      delivery_date: deliveryDate || new Date().toISOString().split('T')[0],
      delivery_slot: deliverySlot || '9:00 AM – 1:00 PM',
      status: 'PENDING_ASSIGNMENT',
      aggregation_status: 'BATCH_CREATED'
    }).select().single();

    if (error) throw error;

    // Create delivery_batch_orders mapping and update orders.batch_id
    for (const order of dbOrders) {
      await supabase.from('delivery_batch_orders').insert({ batch_id: batch.id, order_id: order.id });
      await supabase.from('orders').update({ 
        batch_id: batch.id,
        aggregation_status: 'BATCH_CREATED',
        delivery_status: 'PENDING_ASSIGNMENT'
      }).eq('id', order.id);
    }

    res.status(201).json({ success: true, data: { batchId: batchCode } });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const assignBatch = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { agentId } = req.body;

    let aId = agentId;
    if (!aId.includes('-')) {
        const { data: aData } = await supabase.from('delivery_agents').select('id').eq('legacy_id', agentId).single();
        if (!aData) return res.status(400).json({ success: false, message: 'Agent not found' });
        aId = aData.id;
    }

    const { data: batch, error } = await supabase.from('delivery_batches').update({
      agent_id: aId,
      status: 'ASSIGNED',
      aggregation_status: 'ASSIGNED'
    }).eq('batch_code', id).select().single();

    if (error) throw error;

    await supabase.from('orders').update({
      assigned_agent_id: aId,
      order_status: 'ASSIGNED',
      delivery_status: 'ASSIGNED',
      aggregation_status: 'ASSIGNED'
    }).eq('batch_id', batch.id);

    res.json({ success: true, message: `Batch ${id} assigned to agent` });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateBatchStatus = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { status } = req.body; // e.g. 'Pickup in Progress' or DB enum 'PICKUP_IN_PROGRESS'
        
        let dbStatus = status;
        if (status === 'Pickup in Progress') dbStatus = 'PICKUP_IN_PROGRESS';
        if (status === 'Out for Delivery') dbStatus = 'OUT_FOR_DELIVERY';
        if (status === 'Completed' || status === 'Delivered') dbStatus = 'COMPLETED';
        if (status === 'Picked Up') dbStatus = 'PICKED_UP';

        const { data: batch, error: err1 } = await supabase.from('delivery_batches').select('*').eq('batch_code', id).single();
        if (err1 || !batch) return res.status(404).json({ success: false, message: 'Batch not found' });

        const userRole = req.user?.user_metadata?.role || req.user?.role;
        const userId = req.user?.id;
        if (userRole === 'delivery_partner' && batch.agent_id !== userId) return res.status(403).json({ success: false, message: 'Forbidden' });

        let aggStatus = dbStatus === 'COMPLETED' ? 'COMPLETED' : dbStatus;

        const { error } = await supabase.from('delivery_batches').update({
            status: dbStatus,
            aggregation_status: aggStatus
        }).eq('id', batch.id);

        if (error) throw error;

        // Propagate to orders if needed
        if (dbStatus === 'OUT_FOR_DELIVERY') {
            await supabase.from('orders').update({
                order_status: 'OUT_FOR_DELIVERY',
                delivery_status: 'OUT_FOR_DELIVERY',
                aggregation_status: 'OUT_FOR_DELIVERY'
            }).eq('batch_id', batch.id);
        } else if (dbStatus === 'COMPLETED') {
            await supabase.from('orders').update({
                order_status: 'DELIVERED',
                delivery_status: 'DELIVERED',
                aggregation_status: 'COMPLETED'
            }).eq('batch_id', batch.id);
        }

        res.json({ success: true, message: `Batch ${id} updated to ${status}` });
    } catch (err: any) {
        res.status(500).json({ success: false, message: err.message });
    }
};
