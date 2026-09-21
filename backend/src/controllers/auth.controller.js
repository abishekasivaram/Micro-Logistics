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

exports.signup = async (req, res) => {
  try {
    const { email, password, role, name, phone, address, area, shopName } = req.body;
    
    if (!email || !password || !role) {
      return res.status(400).json({ success: false, message: 'Email, password, and role are required' });
    }

    // 1. Create Supabase Auth User
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { role, full_name: name || shopName }
    });

    if (authError) {
      return res.status(400).json({ success: false, message: authError.message });
    }

    const userId = authData.user.id;

    // 2. Insert into profiles
    const { error: profileError } = await supabase.from('profiles').insert({
      id: userId,
      email,
      username: name || shopName,
      phone,
      role
    });
    
    if (profileError) throw profileError;

    // 3. Insert into role-specific tables
    if (role === 'customer') {
      const legacyId = 'c' + Math.floor(Math.random() * 10000);
      await supabase.from('customer_profiles').insert({
        id: userId,
        legacy_id: legacyId,
        address,
        area,
        status: 'Active'
      });
    } else if (role === 'vendor') {
      const legacyId = 'v' + Math.floor(Math.random() * 10000);
      await supabase.from('vendors').insert({
        id: userId,
        legacy_id: legacyId,
        shop_name: shopName || name,
        owner_name: name,
        address,
        area,
        status: 'Active',
        is_open: true
      });
    }

    return res.status(201).json({ success: true, message: 'User registered successfully', userId });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
