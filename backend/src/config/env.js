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
    SUPABASE_URL: zod_1.z.string().url('Must be a valid URL'),
    SUPABASE_SERVICE_ROLE_KEY: zod_1.z.string().min(1, 'Service role key is required'),
    PORT: zod_1.z.string().default('5000').transform(Number),
    FRONTEND_URL: zod_1.z.string().default('http://localhost:5173'),
});
const _env = envSchema.safeParse(process.env);
if (!_env.success) {
    console.error('❌ Invalid environment variables:');
    console.error(_env.error.format());
    process.exit(1);
}
exports.env = _env.data;
