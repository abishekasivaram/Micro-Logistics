const axios = require('axios');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY); 
// Using service key to connect, but will use signInWithPassword normally

const API_URL = 'http://localhost:5000/api/v1';

async function testUser(identifier) {
  console.log(`\nTesting login for: ${identifier}`);
  try {
    // 1. Resolve identifier
    const resolveRes = await axios.post(`${API_URL}/auth/resolve`, { identifier });
    const email = resolveRes.data.email;
    console.log(`Resolved to: ${email}`);

    // 2. Login
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: 'password123'
    });
    if (error) throw new Error(`Login failed: ${error.message}`);
    console.log(`Login successful! JWT received. UUID: ${data.user.id}`);

    // 3. Fetch orders
    const ordersRes = await axios.get(`${API_URL}/orders`, {
      headers: { Authorization: `Bearer ${data.session.access_token}` }
    });
    console.log(`Orders fetched successfully. Count: ${ordersRes.data.data.length}`);
    return true;
  } catch (err) {
    console.error(`FAILED for ${identifier}:`, err.response?.data?.message || err.message);
    return false;
  }
}

async function run() {
  const users = ['priyarajan', 'v1', 'admin', 'da1'];
  for (const u of users) {
    await testUser(u);
  }
}
run();
