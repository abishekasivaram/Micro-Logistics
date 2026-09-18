const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const { createClient } = require('@supabase/supabase-js');
const supabaseAdmin = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function migrateUser(oldId, email, password, role, isVendor = false, isAgent = false) {
  console.log(`Migrating ${email}...`);
  
  // 1. Rename old email to free it up
  await supabaseAdmin.from('profiles').update({ email: 'old_' + email }).eq('id', oldId);
  
  // 2. Create new Auth User (gets a fresh UUID)
  const { data: authData, error: authErr } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { role }
  });
  if (authErr) {
    console.error(`Error creating ${email}:`, authErr.message);
    return;
  }
  const newId = authData.user.id;
  console.log(`Created new auth user for ${email}: ${newId}`);
  
  // 3. Fetch old profile data
  const { data: oldProf } = await supabaseAdmin.from('profiles').select('*').eq('id', oldId).single();
  
  // 4. Trigger created the new profile, update it with old data
  await supabaseAdmin.from('profiles').update({
    username: oldProf.username,
    phone: oldProf.phone,
    role: oldProf.role
  }).eq('id', newId);

  // 5. Migrate specific role data
  if (isVendor) {
    const { data: oldVendor } = await supabaseAdmin.from('vendors').select('*').eq('id', oldId).single();
    if (oldVendor) {
      oldVendor.id = newId; // change ID to new ID
      await supabaseAdmin.from('vendors').insert(oldVendor);
      // Move orders and products
      await supabaseAdmin.from('products').update({ vendor_id: newId }).eq('vendor_id', oldId);
      await supabaseAdmin.from('orders').update({ vendor_id: newId }).eq('vendor_id', oldId);
      await supabaseAdmin.from('vendors').delete().eq('id', oldId);
    }
  } else if (isAgent) {
    const { data: oldAgent } = await supabaseAdmin.from('delivery_agents').select('*').eq('id', oldId).single();
    if (oldAgent) {
      oldAgent.id = newId;
      await supabaseAdmin.from('delivery_agents').insert(oldAgent);
      await supabaseAdmin.from('orders').update({ assigned_agent_id: newId }).eq('assigned_agent_id', oldId);
      await supabaseAdmin.from('delivery_agents').delete().eq('id', oldId);
    }
  } else {
    // Customer
    const { data: oldCust } = await supabaseAdmin.from('customer_profiles').select('*').eq('id', oldId).single();
    if (oldCust) {
      oldCust.id = newId;
      await supabaseAdmin.from('customer_profiles').insert(oldCust);
      await supabaseAdmin.from('orders').update({ customer_id: newId }).eq('customer_id', oldId);
      await supabaseAdmin.from('customer_profiles').delete().eq('id', oldId);
    }
  }

  // 6. Delete old profile
  await supabaseAdmin.from('profiles').delete().eq('id', oldId);
  console.log(`Successfully migrated ${email}!`);
}

async function run() {
  await migrateUser('11111111-1111-1111-1111-111111111111', 'priya@example.com', 'password123', 'customer', false, false);
  await migrateUser('22222222-2222-2222-2222-222222222222', 'contact@nammachennai.com', 'password123', 'vendor', true, false);
  await migrateUser('33333333-3333-3333-3333-333333333333', 'agent1@example.com', 'password123', 'delivery_partner', false, true);
  console.log('All migrations done.');
}
run();
