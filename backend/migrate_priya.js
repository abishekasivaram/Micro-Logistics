const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const { createClient } = require('@supabase/supabase-js');
const supabaseAdmin = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const dummyId = '77777777-7777-7777-7777-777777777777';

async function migratePriya() {
  const oldId = '11111111-1111-1111-1111-111111111111';
  
  // 1. Create dummy profile & customer_profile
  await supabaseAdmin.from('profiles').insert({ id: dummyId, username: 'dummy', email: 'dummy@example.com', role: 'customer' });
  await supabaseAdmin.from('customer_profiles').insert({ id: dummyId, legacy_id: 'c99', address: 'dummy', area: 'dummy', lat: 0, lng: 0, total_orders: 0, active_orders: 0 });

  // 2. Move orders
  await supabaseAdmin.from('orders').update({ customer_id: dummyId }).eq('customer_id', oldId);

  // 3. Backup and delete old customer_profile & profile
  const { data: cProf } = await supabaseAdmin.from('customer_profiles').select('*').eq('id', oldId).single();
  const { data: prof } = await supabaseAdmin.from('profiles').select('*').eq('id', oldId).single();
  
  await supabaseAdmin.from('customer_profiles').delete().eq('id', oldId);
  await supabaseAdmin.from('profiles').delete().eq('id', oldId);

  // 4. Create Auth User
  const { error } = await supabaseAdmin.auth.admin.createUser({
    id: oldId,
    email: prof.email,
    password: 'password123',
    email_confirm: true,
    user_metadata: { role: prof.role }
  });
  if (error) console.error('Error creating auth for priya:', error.message);
  
  // 5. Restore profile data (trigger created the row, just update it)
  await supabaseAdmin.from('profiles').update({ username: prof.username, phone: prof.phone, role: prof.role }).eq('id', oldId);
  
  // 6. Restore customer_profile
  await supabaseAdmin.from('customer_profiles').insert(cProf);

  // 7. Move orders back
  await supabaseAdmin.from('orders').update({ customer_id: oldId }).eq('customer_id', dummyId);

  // 8. Delete dummies
  await supabaseAdmin.from('customer_profiles').delete().eq('id', dummyId);
  await supabaseAdmin.from('profiles').delete().eq('id', dummyId);
  
  console.log('Priya migrated successfully.');
}

async function run() {
  await migratePriya();
}
run();
