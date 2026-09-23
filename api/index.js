import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { createClient } from '@supabase/supabase-js';

const app = express();
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(express.json());

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || 'https://qyqeidrkyeyrvfrthbta.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_Zy_x58UTbG8AWMsZpA-Prw_zDiOtmZp';
const supabase = createClient(supabaseUrl, supabaseKey);

// Health check
app.get('/api/v1/health', (req, res) => {
  res.json({ status: 'UP', timestamp: new Date().toISOString() });
});

app.get('/api/v1/health/db', async (req, res) => {
  try {
    const { data, error } = await supabase.from('products').select('id').limit(1);
    if (error) throw error;
    res.json({ status: 'UP', database: 'connected', sample: data });
  } catch (err) {
    res.status(500).json({ status: 'DOWN', error: err.message });
  }
});

// Products
app.get('/api/v1/products', async (req, res) => {
  try {
    const { data, error } = await supabase.from('products').select('*, vendor:vendors(id, legacy_id, shop_name)');
    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Fallback
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.url}` });
});

export default app;
