import { Request, Response } from 'express';
import { supabase } from '../config/supabase';
import { mapProductToFrontend } from '../utils/mappings';

export const getProducts = async (req: Request, res: Response) => {
  try {
    const { vendorId } = req.query;
    let query: any = supabase.from('products').select(`
      *,
      vendor:vendors(id, legacy_id, shop_name)
    `);

    if (vendorId) {
      // Find UUID for legacy vendor ID
      const { data: vData } = await supabase.from('vendors').select('id').eq('legacy_id', vendorId).single();
      if (vData) {
        query = query.eq('vendor_id', vData.id);
      } else {
        // Fallback for UUID search
        query = query.eq('vendor_id', vendorId);
      }
    }

    const { data, error } = await query;
    if (error) throw error;

    const products = data.map((p: any) => mapProductToFrontend(p));
    res.json({ success: true, data: products });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getProductById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    let query: any = supabase.from('products').select(`*, vendor:vendors(id, legacy_id, shop_name)`);
    
    // Check if UUID or legacy
    if (id.includes('-')) {
      query = query.eq('id', id).single();
    } else {
      query = query.eq('legacy_id', id).single();
    }

    const { data, error } = await query;
    if (error || !data) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.json({ success: true, data: mapProductToFrontend(data) });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const createProduct = async (req: Request, res: Response) => {
  // Omitted complex validation for brevity, assuming Zod middleware handles it
  try {
    const productData = req.body;
    
    // Auth logic - assume req.user is set
    const userRole = req.user?.user_metadata?.role || 'vendor';
    let vId = req.user?.id;

    if (userRole === 'admin' && productData.vendorId) {
      const { data: vData } = await supabase.from('vendors').select('id').eq('legacy_id', productData.vendorId).single();
      vId = vData ? vData.id : productData.vendorId;
    }

    const status = (productData.stock > 10) ? 'In Stock' : (productData.stock > 0 ? 'Low Stock' : 'Out of Stock');

    const { data, error } = await supabase.from('products').insert({
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

    if (error) throw error;
    res.status(201).json({ success: true, data: mapProductToFrontend(data) });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    let query = supabase.from('products').select('id, vendor_id').eq('legacy_id', id).single();
    let { data: existing, error: e1 } = await query;
    if (e1) {
      existing = (await supabase.from('products').select('id, vendor_id').eq('id', id).single()).data;
    }
    
    if (!existing) return res.status(404).json({ success: false, message: 'Product not found' });

    if (req.user?.user_metadata?.role === 'vendor' && existing.vendor_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this product' });
    }

    let status = updates.status;
    if (updates.stock !== undefined) {
      status = (updates.stock > 10) ? 'In Stock' : (updates.stock > 0 ? 'Low Stock' : 'Out of Stock');
    }

    const { data, error } = await supabase.from('products').update({
      name: updates.name,
      category: updates.category,
      price: updates.price,
      stock: updates.stock,
      prep_time: updates.prepTime,
      status: status,
      image: updates.image,
      description: updates.description
    }).eq('id', existing.id).select('*, vendor:vendors(id, legacy_id, shop_name)').single();

    if (error) throw error;
    res.json({ success: true, data: mapProductToFrontend(data) });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};
