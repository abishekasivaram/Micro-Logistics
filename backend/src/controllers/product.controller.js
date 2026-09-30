"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProduct = exports.createProduct = exports.getProductById = exports.getProducts = void 0;
const supabase_1 = require("../config/supabase");
const mappings_1 = require("../utils/mappings");
const getProducts = async (req, res) => {
    try {
        const { vendorId } = req.query;
        let query = supabase_1.supabase.from('products').select(`
      *,
      vendor:vendors(id, legacy_id, shop_name)
    `);
        if (vendorId) {
            // Find UUID for legacy vendor ID
            const { data: vData } = await supabase_1.supabase.from('vendors').select('id').eq('legacy_id', vendorId).single();
            if (vData) {
                query = query.eq('vendor_id', vData.id);
            }
            else {
                // Fallback for UUID search
                query = query.eq('vendor_id', vendorId);
            }
        }
        const { data, error } = await query;
        if (error)
            throw error;
        const products = data.map((p) => (0, mappings_1.mapProductToFrontend)(p));
        res.json({ success: true, data: products });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
exports.getProducts = getProducts;
const getProductById = async (req, res) => {
    try {
        const { id } = req.params;
        let query = supabase_1.supabase.from('products').select(`*, vendor:vendors(id, legacy_id, shop_name)`);
        // Check if UUID or legacy
        if (id.includes('-')) {
            query = query.eq('id', id).single();
        }
        else {
            query = query.eq('legacy_id', id).single();
        }
        const { data, error } = await query;
        if (error || !data) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }
        res.json({ success: true, data: (0, mappings_1.mapProductToFrontend)(data) });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
exports.getProductById = getProductById;
const createProduct = async (req, res) => {
    // Omitted complex validation for brevity, assuming Zod middleware handles it
    try {
        const productData = req.body;
        // Auth logic - assume req.user is set
        const userRole = req.user?.user_metadata?.role || 'vendor';
        let vId = req.user?.id;
        if (userRole === 'admin' && productData.vendorId) {
            const { data: vData } = await supabase_1.supabase.from('vendors').select('id').eq('legacy_id', productData.vendorId).single();
            vId = vData ? vData.id : productData.vendorId;
        }
        const status = (productData.stock > 10) ? 'In Stock' : (productData.stock > 0 ? 'Low Stock' : 'Out of Stock');
        const { data, error } = await supabase_1.supabase.from('products').insert({
            vendor_id: vId,
            name: productData.name,
            category: productData.category,
            price: productData.price,
            stock: productData.stock,
            prep_time: productData.prepTime,
            status: status,
            image: productData.image,
            description: productData.description
        }).select('*, vendor:vendors(id, legacy_id, shop_name)').single();
        if (error)
            throw error;
        res.status(201).json({ success: true, data: (0, mappings_1.mapProductToFrontend)(data) });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
exports.createProduct = createProduct;
const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        let query = supabase_1.supabase.from('products').select('id, vendor_id').eq('legacy_id', id).single();
        let { data: existing, error: e1 } = await query;
        if (e1) {
            existing = (await supabase_1.supabase.from('products').select('id, vendor_id').eq('id', id).single()).data;
        }
        if (!existing)
            return res.status(404).json({ success: false, message: 'Product not found' });
        if (req.user?.user_metadata?.role === 'vendor' && existing.vendor_id !== req.user.id) {
            return res.status(403).json({ success: false, message: 'Not authorized to update this product' });
        }
        let status = updates.status;
        if (updates.stock !== undefined) {
            status = (updates.stock > 10) ? 'In Stock' : (updates.stock > 0 ? 'Low Stock' : 'Out of Stock');
        }

        const fieldsToUpdate = {};
        if (updates.name !== undefined) fieldsToUpdate.name = updates.name;
        if (updates.category !== undefined) fieldsToUpdate.category = updates.category;
        if (updates.price !== undefined) fieldsToUpdate.price = updates.price;
        if (updates.stock !== undefined) fieldsToUpdate.stock = updates.stock;
        if (updates.prepTime !== undefined) fieldsToUpdate.prep_time = updates.prepTime;
        if (updates.prep_time !== undefined) fieldsToUpdate.prep_time = updates.prep_time;
        if (status !== undefined) fieldsToUpdate.status = status;
        if (updates.image !== undefined) fieldsToUpdate.image = updates.image;
        if (updates.description !== undefined) fieldsToUpdate.description = updates.description;

        const { data, error } = await supabase_1.supabase.from('products').update(fieldsToUpdate)
            .eq('id', existing.id)
            .select('*, vendor:vendors(id, legacy_id, shop_name)')
            .single();

        if (error)
            throw error;
        res.json({ success: true, data: (0, mappings_1.mapProductToFrontend)(data) });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
exports.updateProduct = updateProduct;

const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        let query = supabase_1.supabase.from('products').select('id, vendor_id').eq('legacy_id', id).single();
        let { data: existing, error: e1 } = await query;
        if (e1) {
            existing = (await supabase_1.supabase.from('products').select('id, vendor_id').eq('id', id).single()).data;
        }
        if (!existing)
            return res.status(404).json({ success: false, message: 'Product not found' });
            
        if (req.user?.user_metadata?.role === 'vendor' && existing.vendor_id !== req.user.id) {
            return res.status(403).json({ success: false, message: 'Not authorized to delete this product' });
        }
        
        const { error } = await supabase_1.supabase.from('products').delete().eq('id', existing.id);
        if (error) throw error;
        
        res.json({ success: true, message: 'Product deleted successfully' });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
exports.deleteProduct = deleteProduct;
