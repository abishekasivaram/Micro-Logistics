const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const { createClient } = require('@supabase/supabase-js');
const supabaseAdmin = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const dummyId = '77777777-7777-7777-7777-777777777777';

async function migrateUser(oldId, originalEmail, newEmail, password, role, isVendor, isAgent) {
  console.log(`Migrating ${originalEmail} -> ${newEmail}...`);
  
  // 1. Create dummy profile & role profile
  await supabaseAdmin.from('profiles').insert({ id: dummyId, username: 'dummy', email: 'dummy@example.com', role: 'customer' });
  
  if (isVendor) {
    await supabaseAdmin.from('vendors').insert({ id: dummyId, legacy_id: 'd99', shop_name: 'dummy', lat: 0, lng: 0 });
    await supabaseAdmin.from('products').update({ vendor_id: dummyId }).eq('vendor_id', oldId);
    await supabaseAdmin.from('orders').update({ vendor_id: dummyId }).eq('vendor_id', oldId);
  } else if (isAgent) {
    await supabaseAdmin.from('delivery_agents').insert({ id: dummyId, legacy_id: 'd99', current_area: 'dummy' });
    await supabaseAdmin.from('orders').update({ assigned_agent_id: dummyId }).eq('assigned_agent_id', oldId);
  } else {
    await supabaseAdmin.from('customer_profiles').insert({ id: dummyId, legacy_id: 'd99', address: 'd', area: 'd', lat: 0, lng: 0 });
    await supabaseAdmin.from('orders').update({ customer_id: dummyId }).eq('customer_id', oldId);
  }

  // 2. Fetch old data
  const { data: prof } = await supabaseAdmin.from('profiles').select('*').eq('id', oldId).single();
  let roleData = null;
  if (isVendor) roleData = (await supabaseAdmin.from('vendors').select('*').eq('id', oldId).single()).data;
  else if (isAgent) roleData = (await supabaseAdmin.from('delivery_agents').select('*').eq('id', oldId).single()).data;
  else roleData = (await supabaseAdmin.from('customer_profiles').select('*').eq('id', oldId).single()).data;

  // 3. Delete old data
  if (isVendor) await supabaseAdmin.from('vendors').delete().eq('id', oldId);
  else if (isAgent) await supabaseAdmin.from('delivery_agents').delete().eq('id', oldId);
  else await supabaseAdmin.from('customer_profiles').delete().eq('id', oldId);
  await supabaseAdmin.from('profiles').delete().eq('id', oldId);

  // 4. Create New Auth User
  const { data: authData, error: authErr } = await supabaseAdmin.auth.admin.createUser({
    email: newEmail,
    password: password,
    email_confirm: true,
    user_metadata: { role }
  });
  if (authErr) {
    console.error('Error creating new auth user:', authErr.message);
    return;
  }
  const newId = authData.user.id;

  // 5. Insert new data
  prof.id = newId;
  prof.email = newEmail;
  await supabaseAdmin.from('profiles').insert(prof);

  roleData.id = newId;
  if (isVendor) await supabaseAdmin.from('vendors').insert(roleData);
  else if (isAgent) await supabaseAdmin.from('delivery_agents').insert(roleData);
  else await supabaseAdmin.from('customer_profiles').insert(roleData);

  // 6. Move orders/products back to newId
  if (isVendor) {
    await supabaseAdmin.from('products').update({ vendor_id: newId }).eq('vendor_id', dummyId);
    await supabaseAdmin.from('orders').update({ vendor_id: newId }).eq('vendor_id', dummyId);
    await supabaseAdmin.from('vendors').delete().eq('id', dummyId);
  } else if (isAgent) {
    await supabaseAdmin.from('orders').update({ assigned_agent_id: newId }).eq('assigned_agent_id', dummyId);
    await supabaseAdmin.from('delivery_agents').delete().eq('id', dummyId);
  } else {
    await supabaseAdmin.from('orders').update({ customer_id: newId }).eq('customer_id', dummyId);
    await supabaseAdmin.from('customer_profiles').delete().eq('id', dummyId);
  }

  // 7. Delete dummy profile
  await supabaseAdmin.from('profiles').delete().eq('id', dummyId);

  console.log(`Migrated ${originalEmail} -> ${newEmail} (ID: ${newId})`);
}

async function run() {
  await migrateUser('11111111-1111-1111-1111-111111111111', 'priya@example.com', 'priya_auth@example.com', 'password123', 'customer', false, false);
  await migrateUser('22222222-2222-2222-2222-222222222222', 'contact@nammachennai.com', 'contact_auth@nammachennai.com', 'password123', 'vendor', true, false);
  await migrateUser('33333333-3333-3333-3333-333333333333', 'agent1@example.com', 'agent1_auth@example.com', 'password123', 'delivery_partner', false, true);
  console.log('All done!');
}
run();
