const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const TEST_ACCOUNTS = [
  // Admin (Exactly 1)
  {
    loginId: 'admin',
    email: 'admin@example.com',
    role: 'admin',
    name: 'System Admin',
    phone: '9000000000'
  },
  // Customers (c1 - c4)
  {
    loginId: 'c1',
    email: 'priya_auth@example.com',
    role: 'customer',
    name: 'Priya Rajan',
    phone: '9876543210',
    area: 'Anna Nagar East',
    address: '101, 2nd Avenue, Anna Nagar East, Chennai - 600102'
  },
  {
    loginId: 'c2',
    email: 'c2@example.com',
    role: 'customer',
    name: 'Ramesh Kumar',
    phone: '9876543202',
    area: 'Mylapore',
    address: '15 Gandhi Road, Mylapore, Chennai - 600004'
  },
  {
    loginId: 'c3',
    email: 'c3@example.com',
    role: 'customer',
    name: 'Ananya Sharma',
    phone: '9876543203',
    area: 'Adyar',
    address: '42 Besant Avenue, Adyar, Chennai - 600020'
  },
  {
    loginId: 'c4',
    email: 'c4@example.com',
    role: 'customer',
    name: 'Karthik V',
    phone: '9876543204',
    area: 'Thoraipakkam',
    address: '88 OMR IT Highway, Thoraipakkam, Chennai - 600097'
  },
  // Vendors / Sellers (v1 - v4)
  {
    loginId: 'v1',
    email: 'contact_auth@nammachennai.com',
    role: 'vendor',
    name: 'Contact',
    shopName: 'Namma Chennai Naturals',
    category: 'GROCERIES',
    phone: '9444012345',
    area: 'Velachery',
    address: '22 Velachery Main Rd'
  },
  {
    loginId: 'v2',
    email: 'v2@example.com',
    role: 'vendor',
    name: 'Vendor Two',
    shopName: 'Fresh Dairy & Bakes',
    category: 'Dairy',
    phone: '9444023456',
    area: 'Gopalapuram',
    address: '12 Cathedral Road'
  },
  {
    loginId: 'v3',
    email: 'v3@example.com',
    role: 'vendor',
    name: 'Vendor Three',
    shopName: 'Organic Farm Harvest',
    category: 'Fruits & Veg',
    phone: '9444034567',
    area: 'Guindy',
    address: '54 Anna Salai'
  },
  {
    loginId: 'v4',
    email: 'v4@example.com',
    role: 'vendor',
    name: 'Vendor Four',
    shopName: 'Chennai Daily Essentials',
    category: 'Grocery',
    phone: '9444045678',
    area: 'Velachery',
    address: '77 Velachery Main Rd'
  },
  // Delivery Agents (da1 - da4)
  {
    loginId: 'da1',
    email: 'agent1_auth@example.com',
    role: 'delivery_partner',
    name: 'Delivery Agent 1',
    phone: '9988776655',
    area: 'Adyar / Mylapore'
  },
  {
    loginId: 'da2',
    email: 'da2@example.com',
    role: 'delivery_partner',
    name: 'Delivery Agent 2',
    phone: '9988776656',
    area: 'Velachery / OMR'
  },
  {
    loginId: 'da3',
    email: 'da3@example.com',
    role: 'delivery_partner',
    name: 'Delivery Agent 3',
    phone: '9988776657',
    area: 'Anna Nagar / Kilpauk'
  },
  {
    loginId: 'da4',
    email: 'da4@example.com',
    role: 'delivery_partner',
    name: 'Delivery Agent 4',
    phone: '9988776658',
    area: 'T. Nagar / Kodambakkam'
  }
];

async function provisionAll() {
  console.log('=== PROVISIONING 13 TEST ACCOUNTS ===\n');

  // Fetch all existing auth users
  const { data: userList, error: listErr } = await supabase.auth.admin.listUsers();
  if (listErr) throw listErr;

  const existingByEmail = {};
  for (const u of userList.users) {
    if (u.email) existingByEmail[u.email.toLowerCase()] = u;
  }

  const results = {
    reused: [],
    created: [],
    repaired: []
  };

  for (const acc of TEST_ACCOUNTS) {
    const emailKey = acc.email.toLowerCase();
    let authUser = existingByEmail[emailKey];
    let userId;

    const userMetadata = {
      role: acc.role,
      full_name: acc.shopName || acc.name,
      legacy_id: acc.loginId,
      shop_name: acc.shopName || null
    };

    if (authUser) {
      userId = authUser.id;
      // Update password to initial password 'password123' and ensure confirmed
      const { error: updateErr } = await supabase.auth.admin.updateUserById(userId, {
        password: 'password123',
        email_confirm: true,
        user_metadata: userMetadata
      });
      if (updateErr) throw updateErr;
      results.reused.push({ loginId: acc.loginId, email: acc.email, role: acc.role, id: userId });
      console.log(`[REUSED] ${acc.loginId.padEnd(5)} (${acc.role}) -> ${acc.email} [${userId}]`);
    } else {
      // Create new Auth User
      const { data: newAuth, error: createErr } = await supabase.auth.admin.createUser({
        email: acc.email,
        password: 'password123',
        email_confirm: true,
        user_metadata: userMetadata
      });
      if (createErr) throw createErr;
      userId = newAuth.user.id;
      results.created.push({ loginId: acc.loginId, email: acc.email, role: acc.role, id: userId });
      console.log(`[CREATED] ${acc.loginId.padEnd(5)} (${acc.role}) -> ${acc.email} [${userId}]`);
    }

    // 2. Ensure profile in 'profiles' table
    const { error: profErr } = await supabase.from('profiles').upsert({
      id: userId,
      email: acc.email,
      username: acc.loginId,
      phone: acc.phone,
      role: acc.role,
      updated_at: new Date().toISOString()
    });
    if (profErr) throw profErr;

    // 3. Ensure role-specific record
    if (acc.role === 'customer') {
      const { error: cErr } = await supabase.from('customer_profiles').upsert({
        id: userId,
        legacy_id: acc.loginId,
        address: acc.address || 'Chennai Central',
        area: acc.area || 'Chennai',
        status: 'Active',
        updated_at: new Date().toISOString()
      });
      if (cErr) throw cErr;
      results.repaired.push(`customer_profiles row for ${acc.loginId}`);
    } else if (acc.role === 'vendor') {
      const { error: vErr } = await supabase.from('vendors').upsert({
        id: userId,
        legacy_id: acc.loginId,
        shop_name: acc.shopName,
        owner_name: acc.name,
        category: acc.category || 'General',
        address: acc.address || 'Chennai Central',
        area: acc.area || 'Chennai',
        status: 'Active',
        is_open: true,
        updated_at: new Date().toISOString()
      });
      if (vErr) throw vErr;
      results.repaired.push(`vendors row for ${acc.loginId}`);
    } else if (acc.role === 'delivery_partner') {
      const { error: dErr } = await supabase.from('delivery_agents').upsert({
        id: userId,
        legacy_id: acc.loginId,
        current_area: acc.area || 'Chennai Central',
        capacity: 5,
        rating: 5.0,
        status: 'Available',
        updated_at: new Date().toISOString()
      });
      if (dErr) throw dErr;
      results.repaired.push(`delivery_agents row for ${acc.loginId}`);
    }
  }

  console.log('\n=== PROVISIONING SUMMARY ===');
  console.log(`Reused Accounts: ${results.reused.length}`);
  console.log(`Created Accounts: ${results.created.length}`);
  console.log(`Role Records Upserted: ${results.repaired.length}`);
  console.log('All 13 accounts successfully configured with initial password "password123".\n');
}

provisionAll().catch(err => {
  console.error('PROVISION ERROR:', err);
  process.exit(1);
});
