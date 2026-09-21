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
        let query = supabase_1.supabase.from('customer_profiles').select('id, profile:profiles(id, role)').eq('legacy_id', id).single();
        let { data: existing, error: e1 } = await query;
        if (e1) {
            existing = (await supabase_1.supabase.from('customer_profiles').select('id, profile:profiles(id, role)').eq('id', id).single()).data;
        }
        if (!existing)
            return res.status(404).json({ success: false, message: 'Customer not found' });
        
        if (req.user?.user_metadata?.role === 'customer' && existing.id !== req.user.id) {
            return res.status(403).json({ success: false, message: 'Not authorized to update this customer' });
        }
        const { data, error } = await supabase_1.supabase.from('customer_profiles').update({
            address: updates.address,
            area: updates.area,
            lat: updates.lat,
            lng: updates.lng,
            avatar: updates.avatar,
            status: updates.status
        }).eq('id', existing.id).select('*, profile:profiles(email, phone, role, username)').single();
        if (error)
            throw error;
            
        // also update profiles if phone or username is changed
        if (updates.phone || updates.name) {
            const profileUpdate = {};
            if (updates.phone) profileUpdate.phone = updates.phone;
            if (updates.name) profileUpdate.username = updates.name; // Mapping name to username in profile
            await supabase_1.supabase.from('profiles').update(profileUpdate).eq('id', existing.id);
            // Refresh data
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
