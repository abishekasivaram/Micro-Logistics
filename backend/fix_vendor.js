const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const { createClient } = require('@supabase/supabase-js');
const supabaseAdmin = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const dummyId = '77777777-7777-7777-7777-777777777777';

async function fixVendor() {
  const oldId = '22222222-2222-2222-2222-222222222222';
  
  // The new auth user was already created successfully as 4694794a-e6ed-4f99-bc80-ec9199fbd04c!
  // Wait, let's fetch it to be sure
  const { data: authUsers } = await supabaseAdmin.auth.admin.listUsers();
  const authVendor = authUsers.users.find(u => u.email === 'contact_auth@nammachennai.com');
  if (!authVendor) return console.log('Auth vendor not found');
  const newId = authVendor.id;
  console.log('New ID is', newId);
  
  // Ensure we set the password
  await supabaseAdmin.auth.admin.updateUserById(newId, { password: 'password123', email_confirm: true });
  
  // Create dummy profile & vendor
  await supabaseAdmin.from('profiles').upsert({ id: dummyId, username: 'dummy', email: 'dummy2@example.com', role: 'vendor' });
  await supabaseAdmin.from('vendors').upsert({ id: dummyId, legacy_id: 'd99', shop_name: 'dummy', lat: 0, lng: 0 });

  // Move products and orders to dummy
  await supabaseAdmin.from('products').update({ vendor_id: dummyId }).eq('vendor_id', oldId);
  await supabaseAdmin.from('orders').update({ vendor_id: dummyId }).eq('vendor_id', oldId);

  // Fetch old vendor
  const { data: prof } = await supabaseAdmin.from('profiles').select('*').eq('id', oldId).single();
  const { data: roleData } = await supabaseAdmin.from('vendors').select('*').eq('id', oldId).single();

  // Delete old data safely
  await supabaseAdmin.from('vendors').delete().eq('id', oldId);
  await supabaseAdmin.from('profiles').delete().eq('id', oldId);

  // Upsert new data
  prof.id = newId;
  prof.email = 'contact_auth@nammachennai.com';
  await supabaseAdmin.from('profiles').upsert(prof);
  
  roleData.id = newId;
  await supabaseAdmin.from('vendors').upsert(roleData);

  // Move products and orders to newId
  await supabaseAdmin.from('products').update({ vendor_id: newId }).eq('vendor_id', dummyId);
  await supabaseAdmin.from('orders').update({ vendor_id: newId }).eq('vendor_id', dummyId);
  
  // Delete dummies
  await supabaseAdmin.from('vendors').delete().eq('id', dummyId);
  await supabaseAdmin.from('profiles').delete().eq('id', dummyId);

  console.log('Vendor fixed!');
}
fixVendor();
