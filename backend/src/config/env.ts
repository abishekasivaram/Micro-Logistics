import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  SUPABASE_URL: z.string().url('Must be a valid URL'),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, 'Service role key is required'),
  PORT: z.string().default('5000').transform(Number),
  FRONTEND_URL: z.string().url('Must be a valid URL'),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error('❌ Invalid environment variables:');
  console.error(_env.error.format());
  process.exit(1);
}

export const env = _env.data;
