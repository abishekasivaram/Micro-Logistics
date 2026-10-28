const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config();

const supabaseAdmin = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function fixSeed() {
  const users = [
    { id: '11111111-1111-1111-1111-111111111111', email: 'priya@example.com' },
    { id: '22222222-2222-2222-2222-222222222222', email: 'contact@nammachennai.com' },
    { id: '33333333-3333-3333-3333-333333333333', email: 'agent1@example.com' }
  ];

  for (const u of users) {
    const { data, error } = await supabaseAdmin.auth.admin.updateUserById(
      u.id,
      { password: 'password123', email_confirm: true }
    );
    if (error) console.error('Error updating ' + u.email, error.message);
    else console.log('Updated password for ' + u.email);
  }

  // Create admin user
  const adminId = '99999999-9999-9999-9999-999999999999';
  const { data: adminData, error: adminErr } = await supabaseAdmin.auth.admin.createUser({
    id: adminId,
    email: 'admin@example.com',
    password: 'password123',
    email_confirm: true,
    user_metadata: { role: 'admin' }
  });
  if (adminErr) console.error('Error creating admin:', adminErr.message);
  else console.log('Created admin user.');
  
  // Insert admin profile (Assuming profiles table has no RLS against service role)
  const { error: profileErr } = await supabaseAdmin.from('profiles').insert({
    id: adminId,
    username: 'admin',
    email: 'admin@example.com',
    phone: '9000000000',
    role: 'admin'
  });
  if (profileErr) console.error('Error creating admin profile:', profileErr.message);
  else console.log('Created admin profile.');
}

fixSeed();
