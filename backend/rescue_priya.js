const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const { createClient } = require('@supabase/supabase-js');
const supabaseAdmin = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const dummyId = '77777777-7777-7777-7777-777777777777';

async function finishPriya() {
  console.log('Finishing priya...');
  const newEmail = 'priya_auth@example.com';
  const newId = '215a8bda-9592-45a6-a31e-c3e7f822244c';

  // Ensure her password is password123
  await supabaseAdmin.auth.admin.updateUserById(newId, { password: 'password123', email_confirm: true });

  // Insert profile and customer_profile
  // Note: the previous script failed before inserting, but dummyId HAS her orders!
  await supabaseAdmin.from('profiles').upsert({ id: newId, username: 'priyarajan', email: newEmail, phone: '9876543210', role: 'customer' });
  await supabaseAdmin.from('customer_profiles').upsert({ id: newId, legacy_id: 'c1', address: '101 Anna Nagar East, Chennai', area: 'Anna Nagar', lat: 13.0850, lng: 80.2101, total_orders: 12, active_orders: 1 });

  // Move orders from dummyId to newId
  await supabaseAdmin.from('orders').update({ customer_id: newId }).eq('customer_id', dummyId);
  
  // Delete dummy
  await supabaseAdmin.from('customer_profiles').delete().eq('id', dummyId);
  await supabaseAdmin.from('profiles').delete().eq('id', dummyId);
  console.log('Priya fixed! New ID:', newId);
}

async function migrateUser(oldId, newEmail, password, role, isVendor, isAgent) {
  console.log(`Migrating -> ${newEmail}...`);
  
  // Create dummy profile & role profile
  await supabaseAdmin.from('profiles').upsert({ id: dummyId, username: 'dummy', email: 'dummy@example.com', role });
  
  if (isVendor) {
    await supabaseAdmin.from('vendors').upsert({ id: dummyId, legacy_id: 'd99', shop_name: 'dummy', lat: 0, lng: 0 });
    await supabaseAdmin.from('products').update({ vendor_id: dummyId }).eq('vendor_id', oldId);
    await supabaseAdmin.from('orders').update({ vendor_id: dummyId }).eq('vendor_id', oldId);
  } else if (isAgent) {
    await supabaseAdmin.from('delivery_agents').upsert({ id: dummyId, legacy_id: 'd99', current_area: 'dummy' });
    await supabaseAdmin.from('orders').update({ assigned_agent_id: dummyId }).eq('assigned_agent_id', oldId);
  }

  // Fetch old data
  const { data: prof } = await supabaseAdmin.from('profiles').select('*').eq('id', oldId).single();
  let roleData = null;
  if (isVendor) roleData = (await supabaseAdmin.from('vendors').select('*').eq('id', oldId).single()).data;
  else if (isAgent) roleData = (await supabaseAdmin.from('delivery_agents').select('*').eq('id', oldId).single()).data;

  // Delete old data
  if (isVendor) await supabaseAdmin.from('vendors').delete().eq('id', oldId);
  else if (isAgent) await supabaseAdmin.from('delivery_agents').delete().eq('id', oldId);
  await supabaseAdmin.from('profiles').delete().eq('id', oldId);

  // Create New Auth User
  const { data: authData, error: authErr } = await supabaseAdmin.auth.admin.createUser({
    email: newEmail,
    password: password,
    email_confirm: true,
    user_metadata: { role }
  });
  if (authErr) { console.error('Error creating new auth user:', authErr.message); return; }
  const newId = authData.user.id;

  // Insert new data
  prof.id = newId;
  prof.email = newEmail;
  await supabaseAdmin.from('profiles').upsert(prof);

  roleData.id = newId;
  if (isVendor) await supabaseAdmin.from('vendors').upsert(roleData);
  else if (isAgent) await supabaseAdmin.from('delivery_agents').upsert(roleData);

  // Move orders/products back to newId
  if (isVendor) {
    await supabaseAdmin.from('products').update({ vendor_id: newId }).eq('vendor_id', dummyId);
    await supabaseAdmin.from('orders').update({ vendor_id: newId }).eq('vendor_id', dummyId);
    await supabaseAdmin.from('vendors').delete().eq('id', dummyId);
  } else if (isAgent) {
    await supabaseAdmin.from('orders').update({ assigned_agent_id: newId }).eq('assigned_agent_id', dummyId);
    await supabaseAdmin.from('delivery_agents').delete().eq('id', dummyId);
  }

  // Delete dummy profile
  await supabaseAdmin.from('profiles').delete().eq('id', dummyId);
  console.log(`Migrated -> ${newEmail} (ID: ${newId})`);
}

async function run() {
  await finishPriya();
  await migrateUser('22222222-2222-2222-2222-222222222222', 'contact_auth@nammachennai.com', 'password123', 'vendor', true, false);
  await migrateUser('33333333-3333-3333-3333-333333333333', 'agent1_auth@example.com', 'password123', 'delivery_partner', false, true);
  
  // also fix admin password just in case
  const { data: adminAuth } = await supabaseAdmin.auth.admin.listUsers();
  const adminUser = adminAuth.users.find(u => u.email === 'admin@example.com');
  if (adminUser) await supabaseAdmin.auth.admin.updateUserById(adminUser.id, { password: 'password123', email_confirm: true });
  
  console.log('All done!');
}
run();
