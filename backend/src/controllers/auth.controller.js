const { supabase } = require('../config/supabase');

exports.resolveIdentifier = async (req, res) => {
  try {
    const { identifier } = req.body;
    if (!identifier) return res.status(400).json({ success: false, message: 'Identifier required' });

    let email = null;
    const searchId = identifier.trim();

    // 1. Try profiles directly (username or email)
    const { data: pData } = await supabase.from('profiles')
      .select('email')
      .or(`username.ilike.${searchId},email.ilike.${searchId}`)
      .limit(1);
      
    if (pData && pData.length > 0) {
      email = pData[0].email;
    }

    // 2. Try vendors (legacy_id or shop_name)
    if (!email) {
      const { data: vData } = await supabase.from('vendors')
        .select('id, profiles!inner(email)')
        .or(`legacy_id.ilike.${searchId},shop_name.ilike.${searchId}`)
        .limit(1);
      if (vData && vData.length > 0) email = vData[0].profiles?.email;
    }

    // 3. Try customers (legacy_id)
    if (!email) {
      const { data: cData } = await supabase.from('customer_profiles')
        .select('id, profiles!inner(email)')
        .eq('legacy_id', searchId)
        .limit(1);
      if (cData && cData.length > 0) email = cData[0].profiles?.email;
    }

    // 4. Try delivery agents (legacy_id)
    if (!email) {
      const { data: dData } = await supabase.from('delivery_agents')
        .select('id, profiles!inner(email)')
        .eq('legacy_id', searchId)
        .limit(1);
      if (dData && dData.length > 0) email = dData[0].profiles?.email;
    }

    // 5. Hardcode fallback for admin demo if missing from DB profiles but in auth.users
    // In Phase 1 seed, 'admin' might not be explicitly seeded, but it's part of sampleData.js mockUsers.
    if (!email && searchId.toLowerCase() === 'admin') {
      email = 'admin@example.com';
    }

    if (!email) {
      return res.status(404).json({ success: false, message: 'Account not found. Please check your User ID, Shop Name, or Agent ID.' });
    }

    return res.json({ success: true, email });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
