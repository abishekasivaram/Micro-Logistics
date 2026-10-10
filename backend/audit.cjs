const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './.env' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  // Get all auth users
  const { data: authData, error: authError } = await supabase.auth.admin.listUsers();
  if (authError) {
    console.error("Auth error", authError);
    return;
  }
  const authUsers = authData.users;

  // Get profiles
  const { data: profiles } = await supabase.from('profiles').select('*');
  const { data: customers } = await supabase.from('customer_profiles').select('*');
  const { data: vendors } = await supabase.from('vendors').select('*');
  const { data: agents } = await supabase.from('delivery_agents').select('*');

  console.log(JSON.stringify({
    authUsers: authUsers.map(u => ({ id: u.id, email: u.email, metadata: u.user_metadata })),
    profiles: profiles || [],
    customers: customers || [],
    vendors: vendors || [],
    agents: agents || []
  }, null, 2));
}

run();
