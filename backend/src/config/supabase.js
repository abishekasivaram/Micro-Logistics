"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.supabase = void 0;
const supabase_js_1 = require("@supabase/supabase-js");
const env_1 = require("./env");

const isProd = process.env.NODE_ENV === 'production';
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || 'https://qyqeidrkyeyrvfrthbta.supabase.co';
let supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (isProd && (!supabaseKey || supabaseKey.startsWith('sb_publishable_'))) {
  console.error("FATAL CONFIG ERROR: Real SUPABASE_SERVICE_ROLE_KEY is required in production. Refusing silent fallback to anonymous key.");
  exports.supabase = null;
} else {
  supabaseKey = supabaseKey || process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_Zy_x58UTbG8AWMsZpA-Prw_zDiOtmZp';
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
}
