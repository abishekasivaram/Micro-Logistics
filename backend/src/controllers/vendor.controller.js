"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateVendor = exports.getVendorById = exports.getVendors = void 0;
const supabase_1 = require("../config/supabase");
const mappings_1 = require("../utils/mappings");
const getVendors = async (req, res) => {
    try {
        const { data, error } = await supabase_1.supabase.from('vendors').select(`
      *,
      profile:profiles(email, phone, role)
    `);
        if (error)
            throw error;
        const vendors = data.map((v) => (0, mappings_1.mapVendorToFrontend)(v));
        res.json({ success: true, data: vendors });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
exports.getVendors = getVendors;
const getVendorById = async (req, res) => {
    try {
        const { id } = req.params;
        let query = supabase_1.supabase.from('vendors').select(`*, profile:profiles(email, phone, role)`);
        if (id.includes('-')) {
            query = query.eq('id', id).single();
        }
        else {
            query = query.eq('legacy_id', id).single();
        }
        const { data, error } = await query;
        if (error || !data) {
            return res.status(404).json({ success: false, message: 'Vendor not found' });
        }
        res.json({ success: true, data: (0, mappings_1.mapVendorToFrontend)(data) });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
exports.getVendorById = getVendorById;
const updateVendor = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        let query = supabase_1.supabase.from('vendors').select('id, profile:profiles(id, role)').eq('legacy_id', id).single();
        let { data: existing, error: e1 } = await query;
        if (e1) {
            existing = (await supabase_1.supabase.from('vendors').select('id, profile:profiles(id, role)').eq('id', id).single()).data;
        }
        if (!existing)
            return res.status(404).json({ success: false, message: 'Vendor not found' });
        if (req.user?.user_metadata?.role === 'vendor' && existing.id !== req.user.id) {
            return res.status(403).json({ success: false, message: 'Not authorized to update this vendor' });
        }
        const { data, error } = await supabase_1.supabase.from('vendors').update({
            shop_name: updates.shopName || updates.name,
            owner_name: updates.ownerName,
            category: updates.category,
            is_open: updates.isOpen,
            operating_hours: updates.operatingHours,
            address: updates.address,
            area: updates.area,
            logo: updates.logo,
            description: updates.description,
            status: updates.status
        }).eq('id', existing.id).select('*, profile:profiles(email, phone, role)').single();
        if (error)
            throw error;
        res.json({ success: true, data: (0, mappings_1.mapVendorToFrontend)(data) });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
exports.updateVendor = updateVendor;
