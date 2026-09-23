"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.supabase = void 0;
const supabase_js_1 = require("@supabase/supabase-js");
const env_1 = require("./env");

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || 'https://qyqeidrkyeyrvfrthbta.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_Zy_x58UTbG8AWMsZpA-Prw_zDiOtmZp';

try {
  exports.supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseKey, {
      auth: {
          autoRefreshToken: false,
          persistSession: false,
      },
  });
} catch (err) {
  console.error("Failed to initialize Supabase client:", err);
  exports.supabase = null;
}
