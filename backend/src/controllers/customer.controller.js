"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCustomer = exports.getCustomerById = exports.getCustomers = void 0;
const supabase_1 = require("../config/supabase");
const mappings_1 = require("../utils/mappings");

const getCustomers = async (req, res) => {
    try {
        const { data, error } = await supabase_1.supabase.from('customer_profiles').select(`
      *,
      profile:profiles(email, phone, role, username)
    `);
        if (error)
            throw error;
        const customers = data.map((c) => (0, mappings_1.mapCustomerToFrontend)(c));
        res.json({ success: true, data: customers });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
exports.getCustomers = getCustomers;

const getCustomerById = async (req, res) => {
    try {
        const { id } = req.params;
        let query = supabase_1.supabase.from('customer_profiles').select(`*, profile:profiles(email, phone, role, username)`);
        if (id.includes('-')) {
            query = query.eq('id', id).single();
        }
        else {
            query = query.eq('legacy_id', id).single();
        }
        const { data, error } = await query;
        if (error || !data) {
            return res.status(404).json({ success: false, message: 'Customer not found' });
        }

        const userRole = req.user?.role || req.user?.user_metadata?.role;
        const userId = req.user?.id;

        // Role-based customer data isolation
        if (userRole === 'customer' && data.id !== userId) {
            return res.status(403).json({ success: false, message: 'Forbidden: You can only access your own customer profile' });
        }
        if (userRole !== 'admin' && userRole !== 'customer') {
            return res.status(403).json({ success: false, message: 'Forbidden: Insufficient permissions' });
        }

        res.json({ success: true, data: (0, mappings_1.mapCustomerToFrontend)(data) });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
exports.getCustomerById = getCustomerById;

const updateCustomer = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        let query = supabase_1.supabase.from('customer_profiles').select('id, status, profile:profiles(id, role)').eq('legacy_id', id).single();
        let { data: existing, error: e1 } = await query;
        if (e1) {
            existing = (await supabase_1.supabase.from('customer_profiles').select('id, status, profile:profiles(id, role)').eq('id', id).single()).data;
        }
        if (!existing)
            return res.status(404).json({ success: false, message: 'Customer not found' });
        
        const userRole = req.user?.role || req.user?.user_metadata?.role;
        const userId = req.user?.id;

        if (userRole === 'customer') {
            if (existing.id !== userId) {
                return res.status(403).json({ success: false, message: 'Forbidden: Not authorized to update another customer' });
            }
        } else if (userRole !== 'admin') {
            return res.status(403).json({ success: false, message: 'Forbidden: Insufficient permissions' });
        }

        // Only admins can change account status
        const effectiveStatus = (userRole === 'admin' && updates.status) ? updates.status : existing.status;

        const { data, error } = await supabase_1.supabase.from('customer_profiles').update({
            address: updates.address,
            area: updates.area,
            lat: updates.lat,
            lng: updates.lng,
            avatar: updates.avatar,
            status: effectiveStatus
        }).eq('id', existing.id).select('*, profile:profiles(email, phone, role, username)').single();
        if (error)
            throw error;
            
        // also update profiles if phone or username is changed
        if (updates.phone || updates.name) {
            const profileUpdate = {};
            if (updates.phone) profileUpdate.phone = updates.phone;
            if (updates.name) profileUpdate.username = updates.name;
            await supabase_1.supabase.from('profiles').update(profileUpdate).eq('id', existing.id);
            const refreshed = await supabase_1.supabase.from('customer_profiles').select('*, profile:profiles(email, phone, role, username)').eq('id', existing.id).single();
            res.json({ success: true, data: (0, mappings_1.mapCustomerToFrontend)(refreshed.data) });
            return;
        }
            
        res.json({ success: true, data: (0, mappings_1.mapCustomerToFrontend)(data) });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
exports.updateCustomer = updateCustomer;
