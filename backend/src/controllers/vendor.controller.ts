import { Request, Response } from 'express';
import { supabase } from '../config/supabase';
import { mapVendorToFrontend } from '../utils/mappings';

export const getVendors = async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase.from('vendors').select(`
      *,
      profile:profiles(email, phone, role)
    `);

    if (error) throw error;

    const vendors = data.map((v: any) => mapVendorToFrontend(v));
    res.json({ success: true, data: vendors });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getVendorById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    let query: any = supabase.from('vendors').select(`*, profile:profiles(email, phone, role)`);
    
    if (id.includes('-')) {
      query = query.eq('id', id).single();
    } else {
      query = query.eq('legacy_id', id).single();
    }

    const { data, error } = await query;
    if (error || !data) {
      return res.status(404).json({ success: false, message: 'Vendor not found' });
    }

    res.json({ success: true, data: mapVendorToFrontend(data) });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateVendor = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    let query = supabase.from('vendors').select('id, profile:profiles(id, role)').eq('legacy_id', id).single();
    let { data: existing, error: e1 } = await query;
    if (e1) {
      existing = (await supabase.from('vendors').select('id, profile:profiles(id, role)').eq('id', id).single()).data;
    }
    
    if (!existing) return res.status(404).json({ success: false, message: 'Vendor not found' });

    if (req.user?.user_metadata?.role === 'vendor' && existing.id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this vendor' });
    }

    const { data, error } = await supabase.from('vendors').update({
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

    if (error) throw error;
    res.json({ success: true, data: mapVendorToFrontend(data) });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};
