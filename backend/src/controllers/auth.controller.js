const { supabase } = require('../config/supabase');

const ALLOWED_PUBLIC_ROLES = ['customer', 'vendor', 'delivery_partner'];

exports.resolveIdentifier = async (req, res) => {
  try {
    const { identifier } = req.body;
    if (!identifier || typeof identifier !== 'string') {
      return res.status(400).json({ success: false, message: 'Identifier required' });
    }

    const searchId = identifier.trim();
    if (!searchId) {
      return res.status(400).json({ success: false, message: 'Identifier cannot be blank' });
    }

    // Direct email format
    if (searchId.includes('@')) {
      return res.json({ success: true, email: searchId.toLowerCase() });
    }

    let email = null;
    const lowerSearchId = searchId.toLowerCase();

    // 0. Deterministic mapping for standard test login IDs
    const TEST_LOGIN_MAP = {
      'admin': 'admin@example.com',
      'c1': 'priya_auth@example.com',
      'priyarajan': 'priya_auth@example.com',
      'c2': 'c2@example.com',
      'c3': 'c3@example.com',
      'c4': 'c4@example.com',
      'v1': 'contact_auth@nammachennai.com',
      'v2': 'v2@example.com',
      'v3': 'v3@example.com',
      'v4': 'v4@example.com',
      'da': 'da2@example.com',
      'da1': 'agent1_auth@example.com',
      'da2': 'da2@example.com',
      'da3': 'da3@example.com',
      'da4': 'da4@example.com'
    };

    if (TEST_LOGIN_MAP[lowerSearchId]) {
      email = TEST_LOGIN_MAP[lowerSearchId];
    }

    // Sanitize identifier for database search (strip special query injection characters)
    const sanitizedSearch = searchId.replace(/[^a-zA-Z0-9@_.\- ]/g, '').trim();

    if (!email && sanitizedSearch && supabase) {
      // 1. Try profiles directly (username or email)
      try {
        const { data: pData } = await supabase.from('profiles')
          .select('email')
          .or(`username.ilike."${sanitizedSearch}",email.ilike."${sanitizedSearch}"`)
          .limit(1);
          
        if (pData && pData.length > 0) {
          email = pData[0].email;
        }
      } catch {}

      // 2. Try vendors (legacy_id or shop_name)
      if (!email) {
        try {
          const { data: vData } = await supabase.from('vendors')
            .select('id, profiles!inner(email)')
            .or(`legacy_id.ilike."${sanitizedSearch}",shop_name.ilike."${sanitizedSearch}"`)
            .limit(1);
          if (vData && vData.length > 0) email = vData[0].profiles?.email;
        } catch {}
      }

      // 3. Try customers (legacy_id)
      if (!email) {
        try {
          const { data: cData } = await supabase.from('customer_profiles')
            .select('id, profiles!inner(email)')
            .eq('legacy_id', sanitizedSearch)
            .limit(1);
          if (cData && cData.length > 0) email = cData[0].profiles?.email;
        } catch {}
      }

      // 4. Try delivery agents (legacy_id)
      if (!email) {
        try {
          const { data: dData } = await supabase.from('delivery_agents')
            .select('id, profiles!inner(email)')
            .eq('legacy_id', sanitizedSearch)
            .limit(1);
          if (dData && dData.length > 0) email = dData[0].profiles?.email;
        } catch {}
      }
    }

    if (!email) {
      return res.status(404).json({ success: false, message: 'Account not found. Please check your User ID, Shop Name, or Agent ID.' });
    }

    return res.json({ success: true, email });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Identifier resolution failed' });
  }
};

exports.signup = async (req, res) => {
  try {
    const { email, password, role, name, phone, address, area, shopName } = req.body;
    
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return res.status(400).json({ success: false, message: 'A valid email address is required.' });
    }

    if (!password || typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long.' });
    }

    if (!role || typeof role !== 'string') {
      return res.status(400).json({ success: false, message: 'A valid registration role is required.' });
    }

    const normalizedRole = role.toLowerCase().trim() === 'seller' ? 'vendor' : role.toLowerCase().trim();

    if (normalizedRole === 'admin') {
      return res.status(403).json({ success: false, message: 'Public registration for administrator accounts is not permitted.' });
    }

    if (!ALLOWED_PUBLIC_ROLES.includes(normalizedRole)) {
      return res.status(400).json({ success: false, message: 'Invalid registration role specified.' });
    }

    if (!supabase) {
      return res.status(500).json({ success: false, message: 'Authentication service unavailable.' });
    }

    const displayName = (name || shopName || '').trim();
    if (!displayName) {
      return res.status(400).json({ success: false, message: 'Name or Business Name is required.' });
    }

    // 1. Create Supabase Auth User
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: email.trim().toLowerCase(),
      password,
      email_confirm: true,
      user_metadata: { role: normalizedRole, full_name: displayName }
    });

    if (authError) {
      return res.status(400).json({ success: false, message: authError.message });
    }

    const userId = authData.user.id;

    // 2. Insert into profiles with trusted server-assigned role
    const { error: profileError } = await supabase.from('profiles').insert({
      id: userId,
      email: email.trim().toLowerCase(),
      username: displayName,
      phone: phone ? phone.trim() : null,
      role: normalizedRole
    });
    
    if (profileError) {
      await supabase.auth.admin.deleteUser(userId);
      throw profileError;
    }

    // 3. Insert into role-specific tables
    let roleError = null;
    if (normalizedRole === 'customer') {
      const legacyId = 'c' + Math.floor(1000 + Math.random() * 9000);
      const { error } = await supabase.from('customer_profiles').insert({
        id: userId,
        legacy_id: legacyId,
        address: address || '',
        area: area || 'Local Area',
        status: 'Active'
      });
      roleError = error;
    } else if (normalizedRole === 'vendor') {
      const legacyId = 'v' + Math.floor(1000 + Math.random() * 9000);
      const { error } = await supabase.from('vendors').insert({
        id: userId,
        legacy_id: legacyId,
        shop_name: shopName || displayName,
        owner_name: name || displayName,
        address: address || '',
        area: area || 'Local Area',
        category: 'General',
        status: 'Active',
        is_open: true
      });
      roleError = error;
    } else if (normalizedRole === 'delivery_partner') {
      const legacyId = 'da' + Math.floor(1000 + Math.random() * 9000);
      const { error } = await supabase.from('delivery_agents').insert({
        id: userId,
        legacy_id: legacyId,
        current_area: area || 'Local Area',
        capacity: 5,
        rating: 5.0
      });
      roleError = error;
    }

    if (roleError) {
      await supabase.auth.admin.deleteUser(userId);
      await supabase.from('profiles').delete().eq('id', userId);
      throw roleError;
    }

    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      userId,
      role: normalizedRole
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Registration failed. Please check inputs and try again.' });
  }
};

