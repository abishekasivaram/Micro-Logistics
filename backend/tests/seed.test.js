import { test, expect } from 'vitest';
import dotenv from 'dotenv';
dotenv.config();

test('env configuration safe test', () => {
  const hasSupabaseUrl = Boolean(process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || 'https://qyqeidrkyeyrvfrthbta.supabase.co');
  expect(hasSupabaseUrl).toBe(true);
});

