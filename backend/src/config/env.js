"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const zod_1 = require("zod");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();

const envSchema = zod_1.z.object({
    SUPABASE_URL: zod_1.z.string().default(process.env.VITE_SUPABASE_URL || 'https://qyqeidrkyeyrvfrthbta.supabase.co'),
    SUPABASE_SERVICE_ROLE_KEY: zod_1.z.string().default(process.env.VITE_SUPABASE_ANON_KEY || ''),
    PORT: zod_1.z.string().default('5000').transform(Number),
    FRONTEND_URL: zod_1.z.string().default('*'),
});

const _env = envSchema.safeParse(process.env);
if (!_env.success) {
    console.error('⚠️ Environment warning:', _env.error.format());
}

exports.env = _env.data || {
    SUPABASE_URL: process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || 'https://qyqeidrkyeyrvfrthbta.supabase.co',
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '',
    PORT: 5000,
    FRONTEND_URL: '*'
};
