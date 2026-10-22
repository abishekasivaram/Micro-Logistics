"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProduct = exports.createProduct = exports.getProductById = exports.getProducts = void 0;
const supabase_1 = require("../config/supabase");
const mappings_1 = require("../utils/mappings");
const { initialProducts } = require("../data/initialProducts");
const getProducts = async (req, res) => {
    try {
        const { vendorId } = req.query;
        let query = supabase_1.supabase ? supabase_1.supabase.from('products').select(`
      *,
      vendor:vendors(id, legacy_id, shop_name)
    `) : null;
        if (query && vendorId) {
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
        let products = null;
        if (query) {
            const { data, error } = await query;
            if (!error && data && data.length > 0) {
                products = data.map((p) => (0, mappings_1.mapProductToFrontend)(p));
            }
        }
        if (!products || products.length === 0) {
            products = initialProducts;
            if (vendorId) {
                products = products.filter(p => p.vendorId === vendorId);
            }
        }
        res.json({ success: true, data: products });
    }
    catch (err) {
        let products = initialProducts;
        if (req.query.vendorId) {
            products = products.filter(p => p.vendorId === req.query.vendorId);
        }
        res.json({ success: true, data: products });
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
    try {
        const productData = req.body;
        if (!productData.name || typeof productData.name !== 'string' || !productData.name.trim()) {
            return res.status(400).json({ success: false, message: 'Product name is required' });
        }
        const price = Number(productData.price);
        if (isNaN(price) || price <= 0) {
            return res.status(400).json({ success: false, message: 'Price must be greater than zero' });
        }
        const stock = Number(productData.stock);
        if (isNaN(stock) || stock < 0 || !Number.isInteger(stock)) {
            return res.status(400).json({ success: false, message: 'Stock quantity cannot be negative and must be a whole number' });
        }

        // Auth & Vendor ID resolution
        let vId = productData.vendorId || req.headers['x-user-id'] || req.user?.id;
        if (vId && typeof vId === 'string' && !vId.includes('-')) {
            const { data: vData } = await supabase_1.supabase.from('vendors').select('id').eq('legacy_id', vId).single();
            if (vData) vId = vData.id;
        }
        if (!vId) vId = req.user?.id;

        const status = (stock > 10) ? 'In Stock' : (stock > 0 ? 'Low Stock' : 'Out of Stock');
        const { data, error } = await supabase_1.supabase.from('products').insert({
            vendor_id: vId,
            name: productData.name.trim(),
            category: productData.category || 'General',
            price: price,
            stock: stock,
            prep_time: productData.prepTime || '15 mins',
            status: status,
            image: productData.image || null,
            description: productData.description || null
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
        let query = supabase_1.supabase.from('products').select('id, vendor_id, stock, price').eq('legacy_id', id).single();
        let { data: existing, error: e1 } = await query;
        if (e1) {
            existing = (await supabase_1.supabase.from('products').select('id, vendor_id, stock, price').eq('id', id).single()).data;
        }
        if (!existing)
            return res.status(404).json({ success: false, message: 'Product not found' });
            
        const userRole = req.user?.user_metadata?.role || req.user?.role;
        if (userRole === 'vendor') {
            const isOwner = existing.vendor_id === req.user?.id || 
                            existing.vendor_id === req.headers['x-user-id'] ||
                            existing.vendor_id === req.body?.vendorId;
            if (!isOwner) {
                const { data: vRec } = await supabase_1.supabase.from('vendors').select('id, legacy_id').or(`id.eq.${req.user?.id},legacy_id.eq.${req.user?.id}`).single();
                if (!vRec || (vRec.id !== existing.vendor_id && vRec.legacy_id !== existing.vendor_id)) {
                    return res.status(403).json({ success: false, message: 'Not authorized to update this product' });
                }
            }
        }

        const fieldsToUpdate = {};
        if (updates.name !== undefined) {
            if (typeof updates.name !== 'string' || !updates.name.trim()) {
                return res.status(400).json({ success: false, message: 'Product name cannot be empty' });
            }
            fieldsToUpdate.name = updates.name.trim();
        }
        if (updates.category !== undefined) fieldsToUpdate.category = updates.category;

        if (updates.price !== undefined) {
            const price = Number(updates.price);
            if (isNaN(price) || price <= 0) {
                return res.status(400).json({ success: false, message: 'Price must be greater than zero' });
            }
            fieldsToUpdate.price = price;
        }

        let updatedStock = existing.stock;
        if (updates.stock !== undefined) {
            const stock = Number(updates.stock);
            if (isNaN(stock) || stock < 0 || !Number.isInteger(stock)) {
                return res.status(400).json({ success: false, message: 'Stock quantity cannot be negative and must be a whole number' });
            }
            fieldsToUpdate.stock = stock;
            updatedStock = stock;
        }

        let status = updates.status;
        if (updates.stock !== undefined || status === undefined) {
            status = (updatedStock > 10) ? 'In Stock' : (updatedStock > 0 ? 'Low Stock' : 'Out of Stock');
        }
        fieldsToUpdate.status = status;

        if (updates.prepTime !== undefined) fieldsToUpdate.prep_time = updates.prepTime;
        if (updates.prep_time !== undefined) fieldsToUpdate.prep_time = updates.prep_time;
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
            
        const userRole = req.user?.user_metadata?.role || req.user?.role;
        if (userRole === 'vendor') {
            const isOwner = existing.vendor_id === req.user?.id || 
                            existing.vendor_id === req.headers['x-user-id'];
            if (!isOwner) {
                const { data: vRec } = await supabase_1.supabase.from('vendors').select('id, legacy_id').or(`id.eq.${req.user?.id},legacy_id.eq.${req.user?.id}`).single();
                if (!vRec || (vRec.id !== existing.vendor_id && vRec.legacy_id !== existing.vendor_id)) {
                    return res.status(403).json({ success: false, message: 'Not authorized to delete this product' });
                }
            }
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
