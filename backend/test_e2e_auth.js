require('dotenv').config({ path: 'c:/Users/Admin/Desktop/Micro-Logistics/.env' });
const { createClient } = require('@supabase/supabase-js');
const axios = require('axios');

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
const apiBase = 'http://localhost:5000/api/v1';

async function testRole(identifier, role, password) {
  try {
    console.log(`\n--- Testing ${role} (${identifier}) ---`);
    const res = await axios.post(`${apiBase}/auth/resolve`, { identifier });
    const email = res.data.email;
    console.log(`Resolved ${identifier} -> ${email}`);

    const { data: authData, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    const token = authData.session.access_token;
    console.log(`Authenticated as ${authData.user.id}, JWT obtained.`);

    const apiRes = await axios.get(`${apiBase}/orders`, { headers: { Authorization: `Bearer ${token}` } });
    console.log(`GET /orders returned ${apiRes.data.data.length} orders.`);
    
    if (role === 'customer') {
      const allMine = apiRes.data.data.every(o => o.customer.profile.email === email);
      console.log(`Isolation Check: All orders belong to customer: ${allMine}`);
    } else if (role === 'vendor') {
      const allMine = apiRes.data.data.every(o => o.vendor.legacy_id === identifier);
      console.log(`Isolation Check: All orders belong to vendor: ${allMine}`);
    } else if (role === 'delivery_partner') {
      const allMine = apiRes.data.data.every(o => o.assignedAgent && o.assignedAgent.id === identifier);
      console.log(`Isolation Check: All orders belong to agent: ${allMine}`);
    } else if (role === 'admin') {
      console.log(`Isolation Check: Admin sees all orders (count: ${apiRes.data.data.length})`);
    }
  } catch (err) {
    console.error(`Error testing ${identifier}:`, err.response?.data || err.message);
  }
}

async function run() {
  await testRole('priyarajan', 'customer', 'password123');
  await testRole('v1', 'vendor', 'password123');
  // Admin was mocked in sampleData, there may not be an admin user in the phase 1 seed DB? 
  // Let's check 'admin' -> admin@example.com
  await testRole('admin', 'admin', 'password123');
  await testRole('da1', 'delivery_partner', 'password123');
}

run();
