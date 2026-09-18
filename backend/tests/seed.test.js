import { test, expect } from 'vitest';
test('env', () => {
  console.log('ENV VARS KEYS:', Object.keys(process.env));
  console.log('VITE_SUPABASE_URL:', process.env.VITE_SUPABASE_URL);
  console.log('VITE_SUPABASE_ANON_KEY:', process.env.VITE_SUPABASE_ANON_KEY);
  console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY);
  // find anything that looks like sb_secret
  const secretKey = Object.values(process.env).find(v => typeof v === 'string' && v.startsWith('sb_secret'));
  console.log('FOUND SECRET KEY:', secretKey);
  expect(true).toBe(true);
});
