const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const { createClient } = require('@supabase/supabase-js');
const supabaseAdmin = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function fixSeed() {
  const users = [
    { id: '11111111-1111-1111-1111-111111111111', email: 'priya@example.com', username: 'priyarajan', role: 'customer' },
    { id: '22222222-2222-2222-2222-222222222222', email: 'contact@nammachennai.com', username: 'v1', role: 'vendor' },
    { id: '33333333-3333-3333-3333-333333333333', email: 'agent1@example.com', username: 'da1', role: 'delivery_partner' },
    { id: '99999999-9999-9999-9999-999999999999', email: 'admin@example.com', username: 'admin', role: 'admin' }
  ];

  for (const u of users) {
    console.log(`Processing ${u.email}...`);
    
    // Try update first
    let { data, error } = await supabaseAdmin.auth.admin.updateUserById(
      u.id,
      { password: 'password123', email_confirm: true, user_metadata: { role: u.role } }
    );
    
    // If user doesn't exist, create them
    if (error && error.message.includes('User not found')) {
      console.log(`${u.email} not found, creating...`);
      const createRes = await supabaseAdmin.auth.admin.createUser({
        email: u.email,
        password: 'password123',
        email_confirm: true,
        user_metadata: { role: u.role }
      });
      // We cannot force id via JS SDK createUser unless we use Supabase Management API or Postgres directly.
      // But we can check if it worked.
      if (createRes.error) {
         console.error(`Error creating ${u.email}:`, createRes.error.message);
      } else {
         console.log(`Created ${u.email} successfully.`);
      }
    } else if (error) {
      console.error(`Error updating ${u.email}:`, error.message);
    } else {
      console.log(`Updated password for ${u.email}`);
    }

    // Ensure profile exists (Upsert)
    const { error: profileErr } = await supabaseAdmin.from('profiles').upsert({
      id: u.id,
      username: u.username,
      email: u.email,
      role: u.role
    }, { onConflict: 'id' });
    
    if (profileErr) {
      console.error(`Error upserting profile for ${u.email}:`, profileErr.message);
    }
  }

  console.log('ALL DEMO USERS PROCESSED!');
}
fixSeed();
